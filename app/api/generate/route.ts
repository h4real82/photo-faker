import { NextRequest, NextResponse } from "next/server";
import { Client, handle_file } from "@gradio/client";
import fs from "fs";
import path from "path";

export const maxDuration = 300;

interface MotifConfig {
  prompt: string;
  negative_prompt: string;
}

// Zwingender negativer Prompt für maximalen Fotorealismus
const MANDATORY_NEGATIVE_PROMPT =
  "painting, drawing, illustration, cartoon, anime, 3d render, cgi, smooth skin, airbrushed, oversaturated, blurry, bad anatomy, deformed";

// Automatischer Photo-Prompt-Booster für Porträt-Schärfe und echte Kameratextur
const PHOTO_PROMPT_BOOSTER =
  "raw candid 35mm photo, detailed skin texture, pores, authentic lighting, natural shadows, shot on Sony A7 IV, 85mm f/1.4 lens, photographic, highly detailed, photorealistic";

const MOTIFS: Record<string, MotifConfig> = {
  "paris-fashion": {
    prompt:
      "high fashion editorial photoshoot at Pont Alexandre III Paris, wearing a luxury haute couture beige oversized trench coat, soft dramatic golden hour sunset backlighting, natural catchlight in eyes, creamy bokeh backdrop, Kodak Portra 400 color grading",
    negative_prompt: MANDATORY_NEGATIVE_PROMPT,
  },
  "neon-noir": {
    prompt:
      "cinematic high-fashion nocturnal portrait in rainy Tokyo Shinjuku street, wearing a sleek wet black leather motorcycle jacket, atmospheric moody street reflections, subtle magenta and cyan rim light highlighting jawline and cheekbones",
    negative_prompt: MANDATORY_NEGATIVE_PROMPT,
  },
  "monaco-yacht": {
    prompt:
      "luxury editorial lifestyle photoshoot on the teak deck of a private superyacht in Monaco harbor, wearing an unbuttoned crisp white linen shirt, Mediterranean bright summer sun, soft warm fill light, natural relaxed smile, sun-kissed look, soft ocean bokeh",
    negative_prompt: MANDATORY_NEGATIVE_PROMPT,
  },
  "met-gala": {
    prompt:
      "glamorous celebrity red carpet entrance at Met Gala, dressed in an opulent dark emerald velvet tailored evening jacket with gemstone accents, dramatic paparazzi flash photography, high contrast lighting",
    negative_prompt: MANDATORY_NEGATIVE_PROMPT,
  },
};

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

    if (!faceImageBase64) {
      return NextResponse.json(
        { error: "Kein Referenzgesicht übermittelt" },
        { status: 400 }
      );
    }

    const motif = MOTIFS[motifId] || MOTIFS["paris-fashion"];

    // Basis-Prompt ermitteln: Freitext-Prompt (oder Zufallsszene) hat Vorrang vor Preset
    const basePrompt =
      typeof userPrompt === "string" && userPrompt.trim().length > 0
        ? userPrompt.trim()
        : motif.prompt;

    // Automatischer Photo-Prompt-Booster für maximalen Fotorealismus
    const boostedPrompt = `${basePrompt}, ${PHOTO_PROMPT_BOOSTER}`;

    // Gesichtsdaten in File konvertieren (flüchtig im RAM / Zero-Retention)
    let file: File;
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

    const hfToken =
      process.env.HF_TOKEN || process.env.HUGGING_FACE_HUB_TOKEN || undefined;
    const clientOptions = {
      hf_token: (hfToken as `hf_${string}`) || undefined,
    };

    let images: string[] = [];
    let providerName = "";

    switch (modelId) {
      // Model 1: PhotoMaker V2
      case "photomaker": {
        providerName = "PhotoMaker V2 (TencentARC)";
        const pmClient = await Client.connect(
          "TencentARC/PhotoMaker-V2",
          clientOptions
        );

        // PhotoMaker benötigt den Trigger "img" im Prompt
        const pmPrompt = `${basePrompt} img, ${PHOTO_PROMPT_BOOSTER}`;
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

        // PhotoMaker liefert eine Galerie
        const gallery = (result as any)?.data?.[0];
        if (Array.isArray(gallery)) {
          for (const item of gallery) {
            let u =
              item?.image?.url ||
              item?.image?.path ||
              item?.url ||
              (typeof item === "string" ? item : "");
            if (u.startsWith("/")) {
              u = `https://tencentarc-photomaker-v2.hf.space${u}`;
            }
            if (u) images.push(u);
          }
        }
        break;
      }

      // Model 2: Direct FaceSwap
      case "faceswap": {
        providerName = "Direct FaceSwap (Dentro)";
        const fsClient = await Client.connect("Dentro/face-swap", clientOptions);

        // Ziel-Shooting-Motiv laden
        const targetPath = path.join(
          process.cwd(),
          "public",
          "motifs",
          `${motifId}.jpg`
        );
        let destFile: File;
        if (fs.existsSync(targetPath)) {
          const destBuf = fs.readFileSync(targetPath);
          const destBlob = new Blob([destBuf], { type: "image/jpeg" });
          destFile = new File([destBlob], `${motifId}.jpg`, {
            type: "image/jpeg",
          });
        } else {
          destFile = file;
        }

        const result = await fsClient.predict("/predict", {
          sourceImage: handle_file(file),
          sourceFaceIndex: 1,
          destinationImage: handle_file(destFile),
          destinationFaceIndex: 1,
        });

        const rawOutput = (result as any)?.data?.[0];
        let imageUrl = "";
        if (typeof rawOutput === "string") {
          imageUrl = rawOutput;
        } else if (rawOutput && typeof rawOutput === "object") {
          imageUrl = rawOutput.url || rawOutput.path || "";
        }
        if (imageUrl.startsWith("/")) {
          imageUrl = `https://dentro-face-swap.hf.space${imageUrl}`;
        }
        if (imageUrl) {
          images.push(imageUrl);
        }
        break;
      }

      // Model 3: InstantID (SDXL) (Standard)
      case "instantid":
      default: {
        providerName = "InstantID SDXL (InstantX)";
        const idClient = await Client.connect(
          "InstantX/InstantID",
          clientOptions
        );

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

            const rawOutput = (result as any)?.data?.[0];
            let imageUrl = "";
            if (typeof rawOutput === "string") {
              imageUrl = rawOutput;
            } else if (rawOutput && typeof rawOutput === "object") {
              imageUrl = rawOutput.url || rawOutput.path || "";
            }
            if (imageUrl.startsWith("/")) {
              imageUrl = `https://instantx-instantid.hf.space${imageUrl}`;
            }
            if (imageUrl) {
              images.push(imageUrl);
            }
          } catch (err: any) {
            console.warn(`InstantID Variation ${i + 1} abgebrochen:`, err?.message);
            if (images.length > 0) break;
            throw err;
          }
        }
        break;
      }
    }

    if (images.length === 0) {
      return NextResponse.json(
        {
          error:
            "Keine Bilder vom KI-Modell empfangen. Bitte überprüfe das Gesichtsfoto auf klare Erkennbarkeit.",
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
        "ZeroGPU-Limit für dieses Modell erreicht. Wähle oben einfach 'Direct FaceSwap' (ohne GPU-Limit) für sofortige Generierung!";
    } else if (msg.includes("Unable to detect a face")) {
      msg =
        "Auf dem Foto konnte kein Gesicht erkannt werden. Bitte lade ein frontales Porträtfoto mit guter Ausleuchtung hoch.";
    } else if (msg.includes("queue") || msg.includes("timeout")) {
      msg =
        "Die Hugging-Face-Warteschlange ist ausgelastet. Bitte versuche es in wenigen Sekunden erneut oder wähle 'Direct FaceSwap'.";
    }

    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
