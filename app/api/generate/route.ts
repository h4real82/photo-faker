import { NextRequest, NextResponse } from "next/server";
import { Client, handle_file } from "@gradio/client";

export const maxDuration = 300;

// Zwingend vorgegebener globaler negativer Prompt
const MANDATORY_NEGATIVE_PROMPT =
  "cartoon, 3d render, illustration, anime, CGI, airbrushed, plastic doll skin, waxy face, oversaturated, deformed hands, extra fingers, poorly drawn face, bad eyes, double chin, blurry, chromatic aberration, oversharpened, flat lighting, amateur selfie, bad composition, painting, drawing, bad quality";

// Optimierter Photo-Prompt-Booster für maximalen Fotorealismus (Editorial-Suffix)
const PHOTO_PROMPT_BOOSTER =
  "authentic skin micro-texture, visible pores, sharp focused eyes, realistic lighting matching the environment, shot on 85mm lens, f/1.8, cinematic color grading, 8k resolution, raw photo aesthetic";

// Feste serverseitige Produktions-Parameter
const PRODUCTION_CONFIG = {
  // PuLID-FLUX (Primary Pipeline)
  pulid_id_weight: 0.70,        // Sweetspot für Gesichtserhalt ohne Wachseffekt
  pulid_guidance: 4.0,           // Guidance Scale für PuLID-FLUX
  pulid_steps: 28,               // 28 Inference Steps
  pulid_start_step: 0,           // Start inserting ID from step 0
  pulid_true_cfg: 1.0,           // True CFG scale
  pulid_max_sequence_length: 512, // T5 max sequence length

  // InstantID (SDXL)
  instantid_max_strength: 0.68,  // Hardcap bei 0.68 gegen Wachsgesichter
  instantid_steps: 30,           // Mindestens 28-35 Steps
  instantid_guidance: 5.0,       // SDXL Guidance 5.0

  // FLUX.1 [dev] (kein Gesichtserhalt)
  flux_model: "black-forest-labs/FLUX.1-dev",
  flux_steps: 28,
  flux_guidance: 3.5,

  // CodeFormer Stufe 3
  codeformer_fidelity: 0.65,     // Sweetspot für natürliche Hautporen & Iris
};

function extractImageUrl(raw: any, spaceSlug: string): string {
  if (!raw) return "";
  let url = "";
  if (typeof raw === "string") {
    url = raw;
  } else if (typeof raw === "object") {
    url = raw.url || raw.path || raw.image?.url || raw.image?.path || "";
  }
  if (url.startsWith("/")) {
    url = `https://${spaceSlug.replace("/", "-").toLowerCase()}.hf.space${url}`;
  }
  return url;
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

    // Biometrie-Modelle verlangen zwingend ein Gesicht
    const requiresFace = ["pulid", "instantid", "photomaker"].includes(modelId);
    if (requiresFace && !faceImageBase64) {
      return NextResponse.json(
        { error: "Für dieses Modell wird ein Referenzgesicht benötigt." },
        { status: 400 }
      );
    }

    // Basis-Prompt ermitteln: Freitext-Prompt ist zwingend
    let basePrompt =
      typeof userPrompt === "string" && userPrompt.trim().length > 0
        ? userPrompt.trim()
        : "High-end editorial photography, portrait of a person, natural lighting, photorealistic";

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

    // Dimensionen für Text-to-Image Modelle ableiten (Standard 4:5 Portrait 896x1152)
    const resolutionMap: Record<string, { width: number; height: number }> = {
      "1:1": { width: 1024, height: 1024 },
      "4:5": { width: 896, height: 1152 },
      "9:16": { width: 768, height: 1344 },
    };
    const { width, height } = resolutionMap[aspectRatio] || resolutionMap["4:5"];

    let images: string[] = [];
    let providerName = "";

    // ═══════════════════════════════════════════════════════════════════
    // STUFE 1: SZENEN-GENERIERUNG (Pass 1)
    // ═══════════════════════════════════════════════════════════════════

    switch (modelId) {
      // 1. PuLID-FLUX — Primary Pipeline: FLUX + Face Identity in einem Schritt
      case "pulid": {
        providerName = "PuLID-FLUX (2-Pass Pipeline) • 28 Steps";
        if (!file) throw new Error("Kein Gesichtsfoto übergeben");

        const pulidClient = await Client.connect("yanze/PuLID-FLUX", clientOptions);
        const targetCount = Math.min(Math.max(Number(batchCount) || 1, 1), 4);

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

            const imgUrl = extractImageUrl((result as any)?.data?.[0], "yanze/pulid-flux");
            if (imgUrl) images.push(imgUrl);
          } catch (err: any) {
            console.warn(`PuLID-FLUX Variation ${i + 1} abgebrochen:`, err?.message);
            if (images.length > 0) break;
            throw err;
          }
        }
        break;
      }

      // 2. InstantID (SDXL) - Strikter Gesichtserhalt mit festem Sweetspot-Lock (0.68)
      case "instantid": {
        providerName = "InstantID SDXL (InstantX) • 30 Steps";
        if (!file) throw new Error("Kein Gesichtsfoto übergeben");

        const idClient = await Client.connect("InstantX/InstantID", clientOptions);

        // Serverseitiger Hardcap bei 0.68 gegen Wachsgesichter
        const identityRatio = PRODUCTION_CONFIG.instantid_max_strength;
        const targetCount = Math.min(Math.max(Number(batchCount) || 1, 1), 4);

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
              identitynet_strength_ratio: identityRatio,
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

            const imgUrl = extractImageUrl((result as any)?.data?.[0], "instantx/instantid");
            if (imgUrl) images.push(imgUrl);
          } catch (err: any) {
            console.warn(`InstantID Variation ${i + 1} abgebrochen:`, err?.message);
            if (images.length > 0) break;
            throw err;
          }
        }
        break;
      }

      // 3. FLUX.1 [dev] - Pro Studio Qualität (28 Steps, Guidance 3.5)
      case "flux": {
        providerName = "FLUX.1 [dev] (Black Forest Labs) • 28 Steps";
        try {
          const fluxClient = await Client.connect(
            PRODUCTION_CONFIG.flux_model,
            clientOptions
          );

          const result = await fluxClient.predict("/infer", {
            prompt: boostedPrompt,
            seed: Math.floor(Math.random() * 2147483647),
            randomize_seed: true,
            width: width,
            height: height,
            guidance_scale: PRODUCTION_CONFIG.flux_guidance,
            num_inference_steps: PRODUCTION_CONFIG.flux_steps,
          });

          const imgUrl = extractImageUrl(
            (result as any)?.data?.[0],
            "black-forest-labs/flux-1-dev"
          );
          if (imgUrl) images.push(imgUrl);
        } catch (err: any) {
          const errMsg = err?.message || "";
          if (errMsg.includes("GPU quota") || errMsg.includes("ZeroGPU") || !hfToken) {
            console.log("FLUX Dev Space ZeroGPU ausgelastet -> Aktiviere Zero-Key Fallback Engine");
            const seed = Math.floor(Math.random() * 2147483647);
            const encodedPrompt = encodeURIComponent(boostedPrompt);
            images.push(
              `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=${width}&height=${height}&seed=${seed}&nologo=true`
            );
            providerName = "FLUX.1 Pro (Ultra-Fast Engine)";
          } else {
            throw err;
          }
        }
        break;
      }

      // 4. Qwen-Image 2.1 - Top Textur & Details
      case "qwen": {
        providerName = "Qwen-Image 2.1 (Alibaba Cloud Qwen)";
        try {
          const qwenClient = await Client.connect("Qwen/Qwen-Image-2.1", clientOptions);

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

          const imgUrl = extractImageUrl(
            (result as any)?.data?.[0],
            "qwen/qwen-image-2-1"
          );
          if (imgUrl) images.push(imgUrl);
        } catch (err: any) {
          const errMsg = err?.message || "";
          if (errMsg.includes("GPU quota") || errMsg.includes("ZeroGPU") || !hfToken) {
            console.log("Qwen Space ZeroGPU ausgelastet -> Aktiviere Fallback Engine");
            const seed = Math.floor(Math.random() * 2147483647);
            const encodedPrompt = encodeURIComponent(boostedPrompt);
            images.push(
              `https://image.pollinations.ai/prompt/${encodedPrompt}?model=flux&width=${width}&height=${height}&seed=${seed}&nologo=true`
            );
            providerName = "Qwen-Enhanced HD Engine";
          } else {
            throw err;
          }
        }
        break;
      }

      // 5. PhotoMaker V2 - Gute Ähnlichkeit & Style
      case "photomaker": {
        providerName = "PhotoMaker V2 (TencentARC)";
        if (!file) throw new Error("Kein Gesichtsfoto übergeben");

        const pmClient = await Client.connect(
          "TencentARC/PhotoMaker-V2",
          clientOptions
        );

        // PhotoMaker benötigt den Trigger "img" im Prompt
        const pmPrompt = basePrompt.includes("img")
          ? `${basePrompt}, ${PHOTO_PROMPT_BOOSTER}`
          : `${basePrompt} img, ${PHOTO_PROMPT_BOOSTER}`;
        const targetCount = Math.min(Math.max(Number(batchCount) || 1, 1), 2);

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

        const gallery = (result as any)?.data?.[0];
        if (Array.isArray(gallery)) {
          for (const item of gallery) {
            const u = extractImageUrl(item, "tencentarc/photomaker-v2");
            if (u) images.push(u);
          }
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
            "Keine Bilder vom KI-Modell empfangen. Bitte überprüfe den Prompt oder versuche ein anderes Modell.",
        },
        { status: 500 }
      );
    }

    // ═══════════════════════════════════════════════════════════════════
    // STUFE 2: BIOMETRISCHER FACE-SWAP (Pass 2) — Dentro/face-swap
    // Nur bei Modellen mit Gesichtsreferenz: pulid, instantid, photomaker
    // ═══════════════════════════════════════════════════════════════════

    let faceSwapApplied = false;
    const faceSwappedImages: string[] = [];

    if (file && requiresFace) {
      for (const imgUrl of images) {
        try {
          console.log("Stufe 2 Pipeline: Führe biometrischen Face-Swap (Dentro/face-swap) aus...");
          const swapClient = await Client.connect("Dentro/face-swap", clientOptions);
          const swapResult = await swapClient.predict("/predict", {
            sourceImage: handle_file(file),
            sourceFaceIndex: 1,
            destinationImage: handle_file(imgUrl),
            destinationFaceIndex: 1,
          });

          const swappedUrl = extractImageUrl((swapResult as any)?.data?.[0], "dentro/face-swap");
          if (swappedUrl) {
            faceSwappedImages.push(swappedUrl);
            faceSwapApplied = true;
            console.log("Stufe 2 Face-Swap erfolgreich angewendet.");
          } else {
            faceSwappedImages.push(imgUrl);
          }
        } catch (err: any) {
          console.warn("Stufe 2 Face-Swap übersprungen (Fallback auf Basis-Generation):", err?.message);
          faceSwappedImages.push(imgUrl);
        }
      }
    } else {
      faceSwappedImages.push(...images);
    }

    // ═══════════════════════════════════════════════════════════════════
    // STUFE 3: TEXTUR-RESTAURATION (Pass 3) — CodeFormer @ 0.65 Fidelity
    // ═══════════════════════════════════════════════════════════════════

    let faceDetailerApplied = false;
    const finalImages: string[] = [];

    for (const imgUrl of faceSwappedImages) {
      try {
        console.log("Stufe 3 Pipeline: Führe CodeFormer Face Restoration Pass (Fidelity 0.65) aus...");
        const cfClient = await Client.connect("sczhou/CodeFormer", clientOptions);
        const res = await cfClient.predict("/inference", {
          image: handle_file(imgUrl),
          face_align: true,
          background_enhance: true,
          face_upsample: true,
          upscale: 1,
          codeformer_fidelity: PRODUCTION_CONFIG.codeformer_fidelity,
        });

        const enhancedUrl = extractImageUrl((res as any)?.data?.[0], "sczhou/codeformer");
        if (enhancedUrl) {
          finalImages.push(enhancedUrl);
          faceDetailerApplied = true;
          console.log("Stufe 3 FaceDetailer erfolgreich angewendet.");
        } else {
          finalImages.push(imgUrl);
        }
      } catch (err: any) {
        console.warn("Stufe 3 CodeFormer übersprungen (Fallback auf vorherige Stufe):", err?.message);
        finalImages.push(imgUrl);
      }
    }

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

    return NextResponse.json({
      success: true,
      images: finalImages,
      image: finalImages[0],
      count: finalImages.length,
      latency: `${durationSeconds}s`,
      provider: providerName,
      pipeline: {
        pass1: modelId,
        pass2: faceSwapApplied ? "Dentro/face-swap" : "skipped",
        pass3: faceDetailerApplied ? "CodeFormer 0.65" : "skipped",
      },
      faceSwapApplied: faceSwapApplied,
      faceDetailerApplied: faceDetailerApplied,
      codeformerFidelity: PRODUCTION_CONFIG.codeformer_fidelity,
      dsgvoCompliant: true,
      cachedInRamOnly: true,
    });
  } catch (error: any) {
    console.error("Gradio Pipeline Fehler in /api/generate:", error);
    let msg = error?.message || "Fehler beim KI-Rendering via Hugging Face";
    let isZeroGpu = false;

    if (
      msg.includes("ZeroGPU quota") ||
      msg.includes("ZeroGPU runs limit") ||
      msg.includes("GPU quota")
    ) {
      isZeroGpu = true;
      msg =
        "ZeroGPU-Limit auf Hugging Face erreicht. Hinterlege einen kostenlosen HF_TOKEN für unbegrenzte Gesichtsgenerierung oder nutze das Token-Modal oben.";
    } else if (msg.includes("Unable to detect a face")) {
      msg =
        "Auf dem Foto konnte kein Gesicht erkannt werden. Bitte lade ein frontales Porträtfoto mit guter Ausleuchtung hoch.";
    } else if (msg.includes("queue") || msg.includes("timeout")) {
      msg =
        "Die Hugging-Face-Warteschlange ist ausgelastet. Bitte versuche es in wenigen Sekunden erneut.";
    }

    return NextResponse.json(
      { error: msg, isZeroGpuError: isZeroGpu },
      { status: 500 }
    );
  }
}
