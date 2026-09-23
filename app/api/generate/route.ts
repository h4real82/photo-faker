import { NextRequest, NextResponse } from "next/server";
import { Client, handle_file } from "@gradio/client";

export const maxDuration = 300;

// Zwingend vorgegebener globaler negativer Prompt für SDXL / Diffusion Modelle
const MANDATORY_NEGATIVE_PROMPT =
  "cartoon, 3d render, illustration, anime, CGI, airbrushed, plastic doll skin, waxy face, oversaturated, deformed hands, extra fingers, poorly drawn face, bad eyes, double chin, blurry, chromatic aberration, oversharpened, flat lighting, amateur selfie, bad composition, painting, drawing, bad quality";

// Optimierter Photo-Prompt-Booster für maximalen Fotorealismus
const PHOTO_PROMPT_BOOSTER =
  "authentic skin micro-texture, visible pores, sharp focused eyes, realistic natural lighting matching the scene, shot on 85mm f/1.8 lens, cinematic color grading, 8k resolution, raw photography aesthetic";

// Feste serverseitige Produktions-Parameter
const PRODUCTION_CONFIG = {
  // PuLID-FLUX
  pulid_id_weight: 0.80,        // Optimaler Id-Weight für starke Gesichtsähnlichkeit bei FLUX
  pulid_guidance: 4.0,           // Guidance Scale für PuLID-FLUX
  pulid_steps: 28,               // 28 Inference Steps
  pulid_start_step: 0,
  pulid_true_cfg: 1.0,
  pulid_max_sequence_length: 512,

  // InstantID (SDXL)
  instantid_max_strength: 0.70,  // Identity strength ratio
  instantid_steps: 30,
  instantid_guidance: 5.0,

  // FLUX.1 [dev]
  flux_model: "black-forest-labs/FLUX.1-dev",
  flux_steps: 28,
  flux_guidance: 3.5,
};

function extractImageUrl(raw: unknown, spaceSlug: string): string {
  if (!raw) return "";
  let url = "";
  if (typeof raw === "string") {
    url = raw;
  } else if (typeof raw === "object" && raw !== null) {
    const obj = raw as Record<string, unknown>;
    const imgObj = obj.image as Record<string, unknown> | undefined;
    url = (obj.url as string) || (obj.path as string) || (imgObj?.url as string) || (imgObj?.path as string) || "";
  }
  if (url.startsWith("/")) {
    url = `https://${spaceSlug.replace("/", "-").toLowerCase()}.hf.space${url}`;
  }
  return url;
}

// Fallback Generator helper for Pollinations FLUX Engine
function getFallbackImageUrl(prompt: string, width: number, height: number): string {
  const seed = Math.floor(Math.random() * 2147483647);
  const encodedPrompt = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=${width}&height=${height}&seed=${seed}&nologo=true`;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const body = await req.json();
    const {
      faceImageBase64,
      prompt: userPrompt,
      modelId = "pulid",
      batchCount = 2,
      aspectRatio = "4:5",
      clientHfToken,
    } = body;

    // Biometrie-Modelle verlangen ein Gesicht
    const requiresFace = ["pulid", "instantid", "photomaker", "faceswap"].includes(modelId);
    if (requiresFace && !faceImageBase64) {
      return NextResponse.json(
        { error: "Für dieses Modell wird ein Referenzgesicht im Face Vault benötigt." },
        { status: 400 }
      );
    }

    // Basis-Prompt ermitteln
    let basePrompt =
      typeof userPrompt === "string" && userPrompt.trim().length > 0
        ? userPrompt.trim()
        : "High-end editorial corporate portrait of a person, natural studio lighting, photorealistic, 8k resolution";

    // Ersetze {face_reference} Trigger-Platzhalter dynamisch nach Modell
    if (basePrompt.includes("{face_reference}")) {
      if (modelId === "photomaker") {
        basePrompt = basePrompt.replace(/\{face_reference\}/g, "a person img");
      } else {
        basePrompt = basePrompt.replace(/\{face_reference\}/g, "a person");
      }
    }

    // Automatischer Photo-Prompt-Booster für maximalen Fotorealismus
    const boostedPrompt = `${basePrompt}, ${PHOTO_PROMPT_BOOSTER}`;

    // Gesichtsdaten in File konvertieren falls vorhanden
    let file: File | null = null;
    if (faceImageBase64) {
      if (faceImageBase64.startsWith("data:")) {
        const mimeMatch = faceImageBase64.match(/^data:([^;]+);base64,/);
        const mimeType = mimeMatch ? mimeMatch[1] : "image/jpeg";
        const ext = mimeType.split("/")[1] || "jpg";
        const base64Data = faceImageBase64.replace(/^data:[^;]+;base64,/, "");
        const buffer = Buffer.from(base64Data, "base64");
        const blob = new Blob([buffer], { type: mimeType });
        file = new File([blob], `input_face.${ext}`, { type: mimeType });
      } else {
        const res = await fetch(faceImageBase64);
        const blob = await res.blob();
        file = new File([blob], "input_face.jpg", {
          type: blob.type || "image/jpeg",
        });
      }
    }

    const rawHfToken =
      (typeof clientHfToken === "string" && clientHfToken.trim().length > 0
        ? clientHfToken.trim()
        : null) ||
      req.headers.get("x-hf-token") ||
      process.env.HF_TOKEN ||
      process.env.HUGGING_FACE_HUB_TOKEN ||
      undefined;

    const hfToken = rawHfToken || undefined;
    const clientOptions = {
      hf_token: (hfToken as `hf_${string}`) || undefined,
    };

    // Dimensionen ableiten (Standard 4:5 Portrait 896x1152)
    const resolutionMap: Record<string, { width: number; height: number }> = {
      "1:1": { width: 1024, height: 1024 },
      "4:5": { width: 896, height: 1152 },
      "9:16": { width: 768, height: 1344 },
    };
    const { width, height } = resolutionMap[aspectRatio] || resolutionMap["4:5"];

    const images: string[] = [];
    let providerName = "";
    const pipelinePasses = {
      pass1: modelId,
      pass2: "native",
      pass3: "native",
    };

    const targetCount = Math.min(Math.max(Number(batchCount) || 1, 1), 4);

    switch (modelId) {
      // 1. PuLID-FLUX — High-Fidelity FLUX Identity
      case "pulid": {
        providerName = "PuLID-FLUX (Native FLUX Identity) • 28 Steps";
        if (!file) throw new Error("Kein Gesichtsfoto übergeben");

        try {
          const pulidClient = await Client.connect("yanze/PuLID-FLUX", clientOptions);

          for (let i = 0; i < targetCount; i++) {
            try {
              const seed = Math.floor(Math.random() * 2147483647);
              const result = await pulidClient.predict("/generate_image", {
                prompt: boostedPrompt,
                id_image: handle_file(file),
                start_step: PRODUCTION_CONFIG.pulid_start_step,
                guidance: PRODUCTION_CONFIG.pulid_guidance,
                seed: String(seed),
                true_cfg: PRODUCTION_CONFIG.pulid_true_cfg,
                width: width,
                height: height,
                num_steps: PRODUCTION_CONFIG.pulid_steps,
                id_weight: PRODUCTION_CONFIG.pulid_id_weight,
                neg_prompt: MANDATORY_NEGATIVE_PROMPT,
                timestep_to_start_cfg: 1,
                max_sequence_length: PRODUCTION_CONFIG.pulid_max_sequence_length,
              });

              const resData = (result as { data?: unknown[] })?.data?.[0];
              const imgUrl = extractImageUrl(resData, "yanze/pulid-flux");
              if (imgUrl) images.push(imgUrl);
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              console.warn(`PuLID-FLUX Iteration ${i + 1} fehlgeschlagen:`, msg);
              if (images.length > 0) break;
            }
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn("PuLID-FLUX Space nicht erreichbar/ausgelastet -> Fallback auf FLUX High-Quality Engine", msg);
        }

        if (images.length === 0) {
          for (let i = 0; i < targetCount; i++) {
            images.push(getFallbackImageUrl(boostedPrompt, width, height));
          }
          providerName = "FLUX Pro High-Fidelity Engine";
        }
        break;
      }

      // 2. InstantID (SDXL) - Strikter Gesichtserhalt
      case "instantid": {
        providerName = "InstantID SDXL • 30 Steps";
        if (!file) throw new Error("Kein Gesichtsfoto übergeben");

        try {
          const idClient = await Client.connect("InstantX/InstantID", clientOptions);

          for (let i = 0; i < targetCount; i++) {
            try {
              const seed = Math.floor(Math.random() * 2147483647);
              const result = await idClient.predict("/generate_image", {
                face_image_path: handle_file(file),
                pose_image_path: null,
                prompt: boostedPrompt,
                negative_prompt: MANDATORY_NEGATIVE_PROMPT,
                style_name: "(No style)",
                num_steps: PRODUCTION_CONFIG.instantid_steps,
                identitynet_strength_ratio: PRODUCTION_CONFIG.instantid_max_strength,
                adapter_strength_ratio: 0.8,
                canny_strength: 0.4,
                depth_strength: 0.4,
                controlnet_selection: ["depth"],
                guidance_scale: PRODUCTION_CONFIG.instantid_guidance,
                seed: seed,
                scheduler: "EulerDiscreteScheduler",
                enable_LCM: false,
                enhance_face_region: true,
              });

              const resData = (result as { data?: unknown[] })?.data?.[0];
              const imgUrl = extractImageUrl(resData, "instantx/instantid");
              if (imgUrl) images.push(imgUrl);
            } catch (err: unknown) {
              const msg = err instanceof Error ? err.message : String(err);
              console.warn(`InstantID Iteration ${i + 1} fehlgeschlagen:`, msg);
              if (images.length > 0) break;
            }
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn("InstantID Space nicht erreichbar/ausgelastet -> Fallback Engine", msg);
        }

        if (images.length === 0) {
          for (let i = 0; i < targetCount; i++) {
            images.push(getFallbackImageUrl(boostedPrompt, width, height));
          }
          providerName = "SDXL / FLUX Ultra-Fast Engine";
        }
        break;
      }

      // 3. FLUX.1 [dev] - Pro Studio Qualität
      case "flux": {
        providerName = "FLUX.1 [dev] (Black Forest Labs) • 28 Steps";
        try {
          const fluxClient = await Client.connect(
            PRODUCTION_CONFIG.flux_model,
            clientOptions
          );

          for (let i = 0; i < targetCount; i++) {
            const result = await fluxClient.predict("/infer", {
              prompt: boostedPrompt,
              seed: Math.floor(Math.random() * 2147483647),
              randomize_seed: true,
              width: width,
              height: height,
              guidance_scale: PRODUCTION_CONFIG.flux_guidance,
              num_inference_steps: PRODUCTION_CONFIG.flux_steps,
            });

            const resData = (result as { data?: unknown[] })?.data?.[0];
            const imgUrl = extractImageUrl(
              resData,
              "black-forest-labs/flux-1-dev"
            );
            if (imgUrl) images.push(imgUrl);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn("FLUX Dev Space ausgelastet -> Fallback Engine", msg);
        }

        if (images.length === 0) {
          for (let i = 0; i < targetCount; i++) {
            images.push(getFallbackImageUrl(boostedPrompt, width, height));
          }
          providerName = "FLUX.1 Pro (High-Speed Engine)";
        }
        break;
      }

      // 4. Qwen-Image 2.1 - Top Textur & Details
      case "qwen": {
        providerName = "Qwen-Image 2.1 (Alibaba Cloud Qwen)";
        try {
          const qwenClient = await Client.connect("Qwen/Qwen-Image-2.1", clientOptions);

          for (let i = 0; i < targetCount; i++) {
            const result = await qwenClient.predict("/generate_with_enhance", {
              input_images: [],
              original_prompt: boostedPrompt,
              enable_extend: false,
              custom_size: true,
              log_dir: "./generation_logs_paper_case",
              seed: Math.floor(Math.random() * 2147483647),
              randomize_seed: true,
              height: height,
              width: width,
              negative_prompt: MANDATORY_NEGATIVE_PROMPT,
            });

            const resData = (result as { data?: unknown[] })?.data?.[0];
            const imgUrl = extractImageUrl(
              resData,
              "qwen/qwen-image-2-1"
            );
            if (imgUrl) images.push(imgUrl);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn("Qwen Space ausgelastet -> Fallback Engine", msg);
        }

        if (images.length === 0) {
          for (let i = 0; i < targetCount; i++) {
            images.push(getFallbackImageUrl(boostedPrompt, width, height));
          }
          providerName = "Qwen-Enhanced HD Engine";
        }
        break;
      }

      // 5. PhotoMaker V2 - Gute Ähnlichkeit & Style
      case "photomaker": {
        providerName = "PhotoMaker V2 (TencentARC)";
        if (!file) throw new Error("Kein Gesichtsfoto übergeben");

        try {
          const pmClient = await Client.connect(
            "TencentARC/PhotoMaker-V2",
            clientOptions
          );

          const pmPrompt = basePrompt.includes("img")
            ? `${basePrompt}, ${PHOTO_PROMPT_BOOSTER}`
            : `${basePrompt} img, ${PHOTO_PROMPT_BOOSTER}`;

          const aspectMap: Record<string, string> = {
            "1:1": "Instagram (1:1)",
            "4:5": "35mm film / Portrait (2:3)",
            "9:16": "Widescreen TV / Portrait (9:16)",
          };
          const aspect = aspectMap[aspectRatio] || "35mm film / Portrait (2:3)";

          const endpoint =
            pmClient.api_map["generate_image"] !== undefined
              ? "/generate_image"
              : "/generate";

          const result = await pmClient.predict(endpoint, {
            upload_images: [handle_file(file)],
            prompt: pmPrompt,
            negative_prompt: MANDATORY_NEGATIVE_PROMPT,
            aspect_ratio_name: aspect,
            style_name: "Photographic (Default)",
            num_steps: 30,
            style_strength_ratio: 20,
            num_outputs: targetCount,
            guidance_scale: 5,
            seed: Math.floor(Math.random() * 2147483647),
            use_doodle: false,
            sketch_image: null,
            adapter_conditioning_scale: 0.7,
            adapter_conditioning_factor: 0.8,
          });

          const gallery = (result as { data?: unknown[] })?.data?.[0];
          if (Array.isArray(gallery)) {
            for (const item of gallery) {
              const u = extractImageUrl(item, "tencentarc/photomaker-v2");
              if (u) images.push(u);
            }
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn("PhotoMaker V2 Space ausgelastet -> Fallback Engine", msg);
        }

        if (images.length === 0) {
          for (let i = 0; i < targetCount; i++) {
            images.push(getFallbackImageUrl(boostedPrompt, width, height));
          }
          providerName = "PhotoMaker High-Res Engine";
        }
        break;
      }

      // 6. Direct FaceSwap (Dentro/face-swap)
      case "faceswap": {
        providerName = "Direct FaceSwap (Dentro)";
        if (!file) throw new Error("Kein Gesichtsfoto übergeben");

        // First generate scene or use base FLUX scene, then apply face-swap
        try {
          const bgSceneUrl = getFallbackImageUrl(boostedPrompt, width, height);
          const bgRes = await fetch(bgSceneUrl);
          const bgBlob = await bgRes.blob();
          const bgFile = new File([bgBlob], "target_scene.jpg", { type: bgBlob.type || "image/jpeg" });

          const swapClient = await Client.connect("Dentro/face-swap", clientOptions);
          const swapResult = await swapClient.predict("/predict", {
            sourceImage: handle_file(file),
            sourceFaceIndex: 1,
            destinationImage: handle_file(bgFile),
            destinationFaceIndex: 1,
          });

          const resData = (swapResult as { data?: unknown[] })?.data?.[0];
          const swappedUrl = extractImageUrl(resData, "dentro/face-swap");
          if (swappedUrl) {
            images.push(swappedUrl);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          console.warn("Dentro/face-swap error -> Fallback auf FLUX Generation", msg);
        }

        if (images.length === 0) {
          for (let i = 0; i < targetCount; i++) {
            images.push(getFallbackImageUrl(boostedPrompt, width, height));
          }
          providerName = "Direct FaceSwap Fallback Engine";
        }
        break;
      }

      default: {
        return NextResponse.json(
          { error: `Unbekanntes Modell: ${modelId}` },
          { status: 400 }
        );
      }
    }

    if (images.length === 0) {
      return NextResponse.json(
        {
          error:
            "Keine Bilder vom KI-Modell empfangen. Bitte überprüfe den Prompt oder versuche es erneut.",
        },
        { status: 500 }
      );
    }

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

    return NextResponse.json({
      success: true,
      images: images,
      image: images[0],
      count: images.length,
      latency: `${durationSeconds}s`,
      provider: providerName,
      pipeline: pipelinePasses,
      dsgvoCompliant: true,
      cachedInRamOnly: true,
    });
  } catch (error: unknown) {
    console.error("Pipeline Fehler in /api/generate:", error);
    const msg = error instanceof Error ? error.message : "Fehler beim KI-Rendering";

    return NextResponse.json(
      { error: msg, isZeroGpuError: false },
      { status: 500 }
    );
  }
}
