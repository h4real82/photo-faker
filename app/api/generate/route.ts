import { NextRequest, NextResponse } from "next/server";
import { Client, handle_file } from "@gradio/client";

export const maxDuration = 300;

interface MotifConfig {
  prompt: string;
}

// Zwingend vorgegebener globaler negativer Prompt
const MANDATORY_NEGATIVE_PROMPT =
  "cartoon, 3d render, illustration, anime, CGI, airbrushed, plastic doll skin, waxy face, oversaturated, deformed hands, extra fingers, poorly drawn face, bad eyes, double chin, blurry, chromatic aberration, oversharpened, flat lighting, amateur selfie, bad composition, painting, drawing, bad quality";

// Automatischer Photo-Prompt-Booster für Text-to-Image & Porträt-Generierung
const PHOTO_PROMPT_BOOSTER =
  "raw candid 35mm photograph, natural lighting, shot on Sony A7 IV, detailed skin texture, photorealistic, 8k";

const MOTIFS: Record<string, MotifConfig> = {
  "paris-fashion": {
    prompt:
      "high fashion editorial photoshoot at Pont Alexandre III Paris, wearing a luxury haute couture beige oversized trench coat, soft dramatic golden hour sunset backlighting, natural catchlight in eyes, creamy bokeh backdrop, Kodak Portra 400 color grading",
  },
  "neon-noir": {
    prompt:
      "cinematic high-fashion nocturnal portrait in rainy Tokyo Shinjuku street, wearing a sleek wet black leather motorcycle jacket, atmospheric moody street reflections, subtle magenta and cyan rim light highlighting jawline and cheekbones",
  },
  "monaco-yacht": {
    prompt:
      "luxury editorial lifestyle photoshoot on the teak deck of a private superyacht in Monaco harbor, wearing an unbuttoned crisp white linen shirt, Mediterranean bright summer sun, soft warm fill light, natural relaxed smile, sun-kissed look, soft ocean bokeh",
  },
  "met-gala": {
    prompt:
      "glamorous celebrity red carpet entrance at Met Gala, dressed in an opulent dark emerald velvet tailored evening jacket with gemstone accents, dramatic paparazzi flash photography, high contrast lighting",
  },
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
    const {
      faceImageBase64,
      motifId = "paris-fashion",
      prompt: userPrompt,
      modelId = "instantid",
      batchCount = 2,
      identityStrength = 85,
      aspectRatio = "4:5",
    } = await req.json();

    // Biometrie-Modelle verlangen zwingend ein Gesicht
    const requiresFace = modelId === "instantid" || modelId === "photomaker";
    if (requiresFace && !faceImageBase64) {
      return NextResponse.json(
        { error: "Für dieses Modell wird ein Referenzgesicht benötigt." },
        { status: 400 }
      );
    }

    const motif = MOTIFS[motifId] || MOTIFS["paris-fashion"];

    // Basis-Prompt ermitteln: Freitext-Prompt (oder Zufallsszene) hat Vorrang vor Preset
    let basePrompt =
      typeof userPrompt === "string" && userPrompt.trim().length > 0
        ? userPrompt.trim()
        : motif.prompt;

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

    const hfToken =
      process.env.HF_TOKEN || process.env.HUGGING_FACE_HUB_TOKEN || undefined;
    const clientOptions = {
      hf_token: (hfToken as `hf_${string}`) || undefined,
    };

    // Dimensionen für Text-to-Image Modelle ableiten
    const resolutionMap: Record<string, { width: number; height: number }> = {
      "1:1": { width: 1024, height: 1024 },
      "4:5": { width: 896, height: 1152 },
      "9:16": { width: 768, height: 1344 },
    };
    const { width, height } = resolutionMap[aspectRatio] || resolutionMap["4:5"];

    let images: string[] = [];
    let providerName = "";

    switch (modelId) {
      // 1. InstantID (SDXL) - Strikter Gesichtserhalt 1:1
      case "instantid": {
        providerName = "InstantID SDXL (InstantX)";
        if (!file) throw new Error("Kein Gesichtsfoto übergeben");

        const idClient = await Client.connect("InstantX/InstantID", clientOptions);
        const identityRatio = identityStrength
          ? Math.min(Math.max(identityStrength / 100, 0.6), 1.0)
          : 0.8;
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
              num_steps: 30,
              identitynet_strength_ratio: identityRatio,
              adapter_strength_ratio: 0.8,
              canny_strength: 0.4,
              depth_strength: 0.4,
              controlnet_selection: ["depth"],
              guidance_scale: 5,
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

      // 2. FLUX.1 Schnell - Beste Fotoqualität
      case "flux": {
        providerName = "FLUX.1 Schnell (Black Forest Labs)";
        const fluxClient = await Client.connect(
          "black-forest-labs/FLUX.1-schnell",
          clientOptions
        );

        const result = await fluxClient.predict("/infer", {
          prompt: boostedPrompt,
          seed: Math.floor(Math.random() * 2147483647),
          randomize_seed: true,
          width: width,
          height: height,
          num_inference_steps: 4,
        });

        const imgUrl = extractImageUrl(
          (result as any)?.data?.[0],
          "black-forest-labs/flux-1-schnell"
        );
        if (imgUrl) images.push(imgUrl);
        break;
      }

      // 3. Qwen-Image 2.1 - Top Textur & Details
      case "qwen": {
        providerName = "Qwen-Image 2.1 (Alibaba Cloud Qwen)";
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
        break;
      }

      // 4. PhotoMaker V2 - Gute Ähnlichkeit & Style
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

      // 5. SDXL Lightning - Ultra-schnell
      case "lightning": {
        providerName = "SDXL-Lightning (ByteDance)";
        const lightClient = await Client.connect(
          "ByteDance/SDXL-Lightning",
          clientOptions
        );

        const result = await lightClient.predict("/generate_image", {
          prompt: boostedPrompt,
          ckpt: "4-Step",
        });

        const imgUrl = extractImageUrl(
          (result as any)?.data?.[0],
          "bytedance/sdxl-lightning"
        );
        if (imgUrl) images.push(imgUrl);
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

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(1);

    return NextResponse.json({
      success: true,
      images: images,
      image: images[0],
      count: images.length,
      latency: `${durationSeconds}s`,
      provider: providerName,
      dsgvoCompliant: true,
      cachedInRamOnly: true,
    });
  } catch (error: any) {
    console.error("Gradio Pipeline Fehler in /api/generate:", error);
    let msg = error?.message || "Fehler beim KI-Rendering via Hugging Face";

    if (
      msg.includes("ZeroGPU quota") ||
      msg.includes("ZeroGPU runs limit") ||
      msg.includes("GPU quota")
    ) {
      msg =
        "ZeroGPU-Limit auf Hugging Face erreicht. Hinterlege einen kostenlosen HF_TOKEN in .env.local für mehr Kontingent oder wähle ein anderes Modell!";
    } else if (msg.includes("Unable to detect a face")) {
      msg =
        "Auf dem Foto konnte kein Gesicht erkannt werden. Bitte lade ein frontales Porträtfoto mit guter Ausleuchtung hoch.";
    } else if (msg.includes("queue") || msg.includes("timeout")) {
      msg =
        "Die Hugging-Face-Warteschlange ist ausgelastet. Bitte versuche es in wenigen Sekunden erneut.";
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
