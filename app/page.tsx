"use client";

import React, { useState, useRef, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Camera,
  Sparkles,
  Download,
  Share2,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Zap,
  Image as ImageIcon,
  Copy,
  Check,
  Maximize2,
  Trash2,
  Layers,
  Wand2,
  Dices,
  ChevronDown,
  Key,
  ExternalLink,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  Film,
} from "lucide-react";

interface AIModel {
  id: "pulid" | "instantid" | "flux" | "qwen" | "photomaker" | "faceswap";
  name: string;
  tag: string;
  badgeColor: string;
  desc: string;
  speed: string;
  requiresFace: boolean;
}

const AI_MODELS: AIModel[] = [
  {
    id: "pulid",
    name: "PuLID-FLUX",
    tag: "EMPFOHLEN • Gesichtserhalt + FLUX",
    badgeColor: "bg-emerald-900/60 text-emerald-300 border-emerald-700/50",
    desc: "FLUX.1 Modell mit striktem biometrischen Gesichtserhalt und fotorealistischer Hauttextur.",
    speed: "~15s",
    requiresFace: true,
  },
  {
    id: "instantid",
    name: "InstantID (SDXL)",
    tag: "Gesichtserhalt 1:1",
    badgeColor: "bg-violet-900/60 text-violet-300 border-violet-700/50",
    desc: "Strikter biometrischer Gesichtserhalt auf neu generierte Szenen.",
    speed: "~12s",
    requiresFace: true,
  },
  {
    id: "faceswap",
    name: "Direct FaceSwap",
    tag: "Klassischer Gesichts-Tausch",
    badgeColor: "bg-amber-900/60 text-amber-300 border-amber-700/50",
    desc: "Direkter 1:1 Gesichts-Tausch auf eine generierte Zielszene.",
    speed: "~8s",
    requiresFace: true,
  },
  {
    id: "flux",
    name: "FLUX.1 [dev]",
    tag: "28-Step Pro HQ (Neues Gesicht)",
    badgeColor: "bg-blue-900/60 text-blue-300 border-blue-700/50",
    desc: "High-Fidelity 12B Dev Modell. Generiert neue fotorealistische Gesichter.",
    speed: "~10s",
    requiresFace: false,
  },
  {
    id: "qwen",
    name: "Qwen-Image 2.1",
    tag: "Top Textur & Details (Neues Gesicht)",
    badgeColor: "bg-purple-900/60 text-purple-300 border-purple-700/50",
    desc: "Hervorragende Hauttexturen und Lichtstimmung. Kein Gesichtserhalt.",
    speed: "~10s",
    requiresFace: false,
  },
  {
    id: "photomaker",
    name: "PhotoMaker V2",
    tag: "Gute Ähnlichkeit & Style",
    badgeColor: "bg-pink-900/60 text-pink-300 border-pink-700/50",
    desc: "Konsistente Gesichts-Identität für hochauflösende Porträts.",
    speed: "~14s",
    requiresFace: true,
  },
];

interface ScenePrompt {
  id: string;
  category: string;
  shortCategory: string;
  title: string;
  prompt: string;
}

const SCENE_CATEGORIES = [
  "Alle",
  "Business",
  "Urban",
  "Casual",
  "Luxury",
  "Travel",
  "Fitness",
  "Monochrome",
];

const CURATED_SCENES: ScenePrompt[] = [
  // 1. Business & Karriere
  {
    id: "tech-ceo",
    category: "Business & Karriere",
    shortCategory: "Business",
    title: "Tech CEO & Modern Office",
    prompt:
      "High-end editorial corporate portrait of {face_reference}, confident friendly gaze, wearing a minimalist navy blue merino knit sweater over an open-collar white shirt, standing in front of floor-to-ceiling windows overlooking a modern skyline, bright diffuse daylight with soft rim lighting, blurred architectural background, shot on Sony A7R V, 85mm f/1.8 lens, natural skin micro-texture, cinematic professional photography",
  },
  {
    id: "executive-boardroom",
    category: "Business & Karriere",
    shortCategory: "Business",
    title: "Executive Boardroom Meeting",
    prompt:
      "Candid business portrait of {face_reference}, focused expression while resting hand on a dark oak conference table, wearing a tailored charcoal grey wool blazer and light blue dress shirt, modern glass boardroom with subtle city lights in bokeh, soft overhead ambient office light combined with natural side window light, 50mm lens, f/2.2, crisp detail, realistic color grading",
  },
  {
    id: "creative-studio",
    category: "Business & Karriere",
    shortCategory: "Business",
    title: "Creative Studio / Designer Workspace",
    prompt:
      "Authentic environmental portrait of {face_reference}, relaxed standing pose leaning against a drafting table, wearing a relaxed black linen button-down shirt with rolled-up sleeves, modern bright loft studio with moodboards and plants in the background, soft morning sunlight casting gentle shadows, shot on 35mm f/1.8, warm film tones, natural skin texture",
  },
  {
    id: "finance-headshot",
    category: "Business & Karriere",
    shortCategory: "Business",
    title: "Finance & Banking Formal Headshot",
    prompt:
      "Classic studio business headshot of {face_reference}, straight confident look into camera, wearing a sharp tailored dark pinstripe suit with a crisp white formal shirt, neutral gradient dark grey studio backdrop, professional three-point Rembrandt lighting setup, shot on Hasselblad H6D-100c, 100mm f/2.8, hyper-sharp eye detail, flawless clean lighting",
  },
  {
    id: "keynote-speaker",
    category: "Business & Karriere",
    shortCategory: "Business",
    title: "Keynote Speaker on Stage",
    prompt:
      "Dynamic stage portrait of {face_reference}, mid-speech with a natural hand gesture, wearing a tailored navy sport coat with a dark tee underneath, dark auditorium stage background with blue and amber atmospheric stage spotlights in smooth bokeh, dramatic theatrical lighting highlighting facial contours, shot on 70-200mm f/2.8 at 135mm, high contrast editorial capture",
  },

  // 2. Urban Lifestyle & Street Photography
  {
    id: "parisian-cafe",
    category: "Urban Lifestyle & Street",
    shortCategory: "Urban",
    title: "Parisian Cafe Sidewalk",
    prompt:
      "Candid lifestyle portrait of {face_reference}, sitting at an outdoor small round marble bistro table, slight authentic smile while looking slightly off-camera, wearing a classic camel wool trench coat and beige knit scarf, charming European street in the background with blurred passersby, soft overcast diffused afternoon light, shot on Leica M11, 50mm Summilux f/1.4, subtle Kodachrome film grain",
  },
  {
    id: "golden-hour-rooftop",
    category: "Urban Lifestyle & Street",
    shortCategory: "Urban",
    title: "Golden Hour City Rooftop",
    prompt:
      "Atmospheric sunset portrait of {face_reference}, leaning casually on a glass rooftop railing, wind slightly catching hair, wearing a stylish olive green bomber jacket and plain white tee, golden hour setting sun flaring gently behind, urban skyline bathed in warm orange and violet tones, shot on 85mm f/1.4, rich bokeh, soft golden rim light across jawline",
  },
  {
    id: "neon-rain",
    category: "Urban Lifestyle & Street",
    shortCategory: "Urban",
    title: "Neon Rain / Cyberpunk Street",
    prompt:
      "Moody nocturnal street portrait of {face_reference}, standing under a black umbrella on wet reflective asphalt, looking intensely forward, wearing a dark waterproof matte trench coat, vibrant reflections of cyan and magenta neon signs on wet ground and umbrella edge, cinematic blade runner aesthetic, shot on 35mm f/1.4, high dynamic range, sharp water droplets, moody lighting",
  },
  {
    id: "vintage-record-store",
    category: "Urban Lifestyle & Street",
    shortCategory: "Urban",
    title: "Vintage Record Store / Indie Vibe",
    prompt:
      "Casual candid portrait of {face_reference}, browsing vinyl records in a warm vintage record shop, natural relaxed expression, wearing an oversized faded denim jacket and striped cotton t-shirt, background full of record shelves and warm tungsten desk lamps, soft warm ambient lighting, shot on 35mm film stock, Portra 400 aesthetic, soft tones",
  },
  {
    id: "modern-art-museum",
    category: "Urban Lifestyle & Street",
    shortCategory: "Urban",
    title: "Modern Art Museum",
    prompt:
      "Minimalist lifestyle portrait of {face_reference}, standing in a white-wall modern gallery admiring a large canvas, side profile turning slightly to camera, wearing a monochrome all-black architectural outfit with a structured jacket, soft ceiling museum gallery diffuse light, clean geometric lines in background, shot on 50mm f/2.0, stark contemporary art vibe",
  },

  // 3. Casual & Cozy Everyday
  {
    id: "morning-kitchen",
    category: "Casual & Cozy Everyday",
    shortCategory: "Casual",
    title: "Morning Kitchen & Coffee",
    prompt:
      "Intimate lifestyle morning portrait of {face_reference}, leaning against a sunlit kitchen marble island holding a steaming ceramic mug with both hands, gentle natural smile, wearing an oversized chunky off-white knit sweater, bright white kitchen with morning sunbeams streaming through window, soft natural morning flare, 50mm f/1.4, warm airy mood, candid realism",
  },
  {
    id: "bookstore-library",
    category: "Casual & Cozy Everyday",
    shortCategory: "Casual",
    title: "Bookstore Corner / Library",
    prompt:
      "Quiet thoughtful portrait of {face_reference}, sitting in a deep vintage leather armchair surrounded by dark wooden bookshelves, looking up with a soft curious expression, wearing a forest green corduroy overshirt over a beige tee, warm ambient desk lamp light casting soft amber tones, shot on 50mm f/1.8, rich shadows, academic cozy aesthetic",
  },
  {
    id: "farmers-market",
    category: "Casual & Cozy Everyday",
    shortCategory: "Casual",
    title: "Weekend Farmers Market",
    prompt:
      "Daylight candid portrait of {face_reference}, walking through an open-air artisanal farmers market carrying a woven tote bag, genuine laughter and candid movement, wearing a light blue linen shirt and sunglasses tucked into collar, vibrant blurred fruit stalls and morning crowd in background, crisp natural daylight, shot on 35mm f/2.8, vivid natural colors",
  },
  {
    id: "rainy-day-window",
    category: "Casual & Cozy Everyday",
    shortCategory: "Casual",
    title: "Rainy Day Window View",
    prompt:
      "Atmospheric indoor portrait of {face_reference}, sitting on a cozy window sill looking out at rain droplets on the glass, reflective contemplative mood, wearing a soft grey cashmere crewneck, cool blue rainy daylight outside contrasted with warm interior lamplight, macro focus on face with glass raindrops blurred in foreground, 85mm f/1.8, cinematic drama",
  },

  // 4. Luxury, Glamour & Nightlife
  {
    id: "black-tie-gala",
    category: "Luxury, Glamour & Nightlife",
    shortCategory: "Luxury",
    title: "Black-Tie Gala / Red Carpet",
    prompt:
      "Ultra-glamorous red carpet portrait of {face_reference}, standing tall with an elegant poised posture, wearing a bespoke velvet midnight-blue tuxedo jacket with black silk lapels, luxury ballroom entrance background with subtle camera flashes and chandeliers in background bokeh, high-fashion event flash lighting with soft beauty dish falloff, shot on 85mm f/2.0, glossy magazine finish",
  },
  {
    id: "speakeasy-bar",
    category: "Luxury, Glamour & Nightlife",
    shortCategory: "Luxury",
    title: "Speakeasy Cocktail Bar",
    prompt:
      "Sultry nocturnal portrait of {face_reference}, sitting at a dark polished brass bar sipping an old fashioned cocktail, charismatic subtle smirk, wearing a sharp tailored burgundy velvet blazer, moody dim lounge interior with backlit amber liquor bottles and glowing vintage lamps, low-key lighting with warm specular highlights, 50mm f/1.4, rich shadows, filmic noir mood",
  },
  {
    id: "luxury-car-interior",
    category: "Luxury, Glamour & Nightlife",
    shortCategory: "Luxury",
    title: "Classic Luxury Car Interior",
    prompt:
      "Cinematic portrait of {face_reference}, sitting in the driver seat of a vintage classic leather-interior car, arm resting on the steering wheel, turning head back toward camera, wearing a brown distressed leather pilot jacket, dusk blue hour light coming through the windshield, subtle dashboard instrument glow, shot on 35mm f/1.8, cinematic still frame",
  },
  {
    id: "hotel-suite-balcony",
    category: "Luxury, Glamour & Nightlife",
    shortCategory: "Luxury",
    title: "Luxury Hotel Suite Balcony",
    prompt:
      "High-end travel portrait of {face_reference}, standing on a private penthouse balcony overlooking the Mediterranean coastline at twilight, relaxed elegance, wearing a crisp unbuttoned white Italian linen shirt, soft twilight blue sky merging with warm villa lights below, soft balanced ambient fill light, shot on 85mm f/1.8, resort campaign aesthetic",
  },

  // 5. Travel, Nature & Adventure
  {
    id: "alpine-mountain-hike",
    category: "Travel, Nature & Adventure",
    shortCategory: "Travel",
    title: "Alpine Mountain Hike",
    prompt:
      "Rugged outdoor adventure portrait of {face_reference}, standing on a rocky mountain summit trail with expansive alpine peaks behind, fresh windblown look with an adventurous smile, wearing a technical mustard-yellow weatherproof hiking jacket and dark beanie, crisp mountain sunlight cutting through scattered clouds, shot on 35mm f/4.0, ultra-sharp landscape depth, crisp vibrant details",
  },
  {
    id: "beach-blue-hour",
    category: "Travel, Nature & Adventure",
    shortCategory: "Travel",
    title: "Beach Walk at Blue Hour",
    prompt:
      "Serene seaside portrait of {face_reference}, walking along the shoreline with wet sand reflecting the sky, bare feet, gentle calm expression, wearing a cream textured wool cardigan open over casual clothing, dusk blue hour ambient lighting with gentle ocean waves in soft blur behind, 85mm f/1.8, melancholic calm aesthetic, cool balanced tones",
  },
  {
    id: "autumn-forest-walk",
    category: "Travel, Nature & Adventure",
    shortCategory: "Travel",
    title: "Autumn Forest Walk",
    prompt:
      "Scenic outdoor portrait of {face_reference}, standing along a tree-lined path covered in fallen golden leaves, walking forward with a warm smile, wearing a dark green quilted barbour-style jacket and chunky wool scarf, soft overcast canopy light filtering through orange foliage, rich autumn color palette, shot on 85mm f/2.0, soft background bokeh",
  },
  {
    id: "nordic-cabin-fog",
    category: "Travel, Nature & Adventure",
    shortCategory: "Travel",
    title: "Nordic Cabin Fog",
    prompt:
      "Moody cinematic outdoor portrait of {face_reference}, standing outside a dark pine-wood modern cabin amidst dense pine trees and rolling misty fog, quiet stoic gaze, wearing a heavy charcoal wool overcoat and thick turtleneck, cool monochromatic overcast daylight, Scandinavian noir atmosphere, shot on 50mm f/2.0, fine film grain, muted tones",
  },

  // 6. Fitness & Sport
  {
    id: "athletic-gym",
    category: "Fitness & Sport",
    shortCategory: "Fitness",
    title: "Modern Athletic Training Gym",
    prompt:
      "Athletic fitness portrait of {face_reference}, resting between sets leaning on a bench with a focused determined gaze, subtle sheen of sweat on skin, wearing a sleek matte-black moisture-wicking athletic compression shirt, raw dark industrial gym with gym equipment blurred in background, dramatic directional edge-lighting highlighting muscles and facial structure, shot on 50mm f/1.8, high contrast dynamic look",
  },
  {
    id: "morning-runner",
    category: "Fitness & Sport",
    shortCategory: "Fitness",
    title: "Early Morning Runner",
    prompt:
      "Candid movement portrait of {face_reference}, pausing during an urban sunrise run, catch of breath with an energized expression, wearing modern technical running gear in navy and reflective silver accents, early morning pink and gold horizon light illuminating a misty city riverfront trail, shot on 85mm f/2.0, dynamic sports photography style",
  },

  // 7. Künstlerisch & Editorial Monochrome
  {
    id: "chiaroscuro-bw",
    category: "Künstlerisch & Editorial Monochrome",
    shortCategory: "Monochrome",
    title: "Chiaroscuro Black & White Studio",
    prompt:
      "High-contrast fine art black and white studio portrait of {face_reference}, intense captivating direct stare into the lens, wearing a simple textured black crewneck, pure dark background, stark single light source illuminating half the face leaving the other in deep shadow, shot on Leica Monochrom with 50mm f/2.0, deep true blacks, sharp facial detail, timeless Peter Lindbergh aesthetic",
  },
  {
    id: "vintage-1970s-mono",
    category: "Künstlerisch & Editorial Monochrome",
    shortCategory: "Monochrome",
    title: "Soft Vintage 1970s Monochrome",
    prompt:
      "Artistic black and white portrait of {face_reference}, side-angle profile with thoughtful eyes, soft daylight filtering through sheer window blinds creating striped shadow patterns across face, wearing a loose vintage knitted sweater, shallow depth of field, vintage Kodak Tri-X 400 film look, heavy organic film grain, nostalgic timeless elegance",
  },
];

export default function PhotoFakerStudio() {
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("Alle");
  const [activeSceneInfo, setActiveSceneInfo] = useState<{
    category: string;
    title: string;
  }>({
    category: "Business & Karriere",
    title: "Tech CEO & Modern Office",
  });
  const [prompt, setPrompt] = useState<string>(
    CURATED_SCENES[0].prompt.replace(/\{face_reference\}/g, "a person")
  );
  const [selectedModel, setSelectedModel] = useState<string>("pulid");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState<boolean>(false);
  const [freeGenerations, setFreeGenerations] = useState<number>(10);
  const [aspectRatio, setAspectRatio] = useState<string>("4:5");
  const [batchSize, setBatchSize] = useState<number>(2);
  const [filmGrainEnabled, setFilmGrainEnabled] = useState<boolean>(false);
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [copied, setCopied] = useState<boolean>(false);
  const [renderLatency, setRenderLatency] = useState<string>("3.2s");
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);
  const [hfToken, setHfToken] = useState<string>("");
  const [isTokenModalOpen, setIsTokenModalOpen] = useState<boolean>(false);
  const [tokenInput, setTokenInput] = useState<string>("");
  const [showTokenText, setShowTokenText] = useState<boolean>(false);
  const [renderError, setRenderError] = useState<{
    message: string;
    isZeroGpu: boolean;
  } | null>(null);
  const [pipelineInfo, setPipelineInfo] = useState<{
    pass1: string;
    pass2: string;
    pass3: string;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Kontingent & Token aus LocalStorage laden
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("photo_faker_quota");
      if (stored !== null) {
        const val = parseInt(stored, 10);
        if (!isNaN(val)) setFreeGenerations(val);
      } else {
        localStorage.setItem("photo_faker_quota", "10");
      }

      const storedToken = localStorage.getItem("photo_faker_hf_token");
      if (storedToken) {
        setHfToken(storedToken);
        setTokenInput(storedToken);
      }
    }
  }, []);

  const handleSaveToken = () => {
    const trimmed = tokenInput.trim();
    if (trimmed) {
      localStorage.setItem("photo_faker_hf_token", trimmed);
      setHfToken(trimmed);
      setIsTokenModalOpen(false);
      setRenderError(null);
    }
  };

  const handleRemoveToken = () => {
    localStorage.removeItem("photo_faker_hf_token");
    setHfToken("");
    setTokenInput("");
    setIsTokenModalOpen(false);
  };

  // Zufällige realistische Szene auswählen
  const handleRandomPrompt = (cat?: string) => {
    const categoryToUse = cat || selectedCategory;
    const pool =
      categoryToUse === "Alle"
        ? CURATED_SCENES
        : CURATED_SCENES.filter((s) => s.shortCategory === categoryToUse || s.category === categoryToUse);

    if (pool.length === 0) return;
    let nextIndex = Math.floor(Math.random() * pool.length);
    const chosen = pool[nextIndex];
    setActiveSceneInfo({ category: chosen.category, title: chosen.title });
    setPrompt(chosen.prompt.replace(/\{face_reference\}/g, "a person"));
  };

  // File Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        alert("Bitte wähle eine gültige Bilddatei aus.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop Upload
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaceImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // KI-Generierung auslösen
  const handleRender = async () => {
    const currentModel = AI_MODELS.find((m) => m.id === selectedModel);
    if (currentModel?.requiresFace && !faceImage) {
      alert("Für dieses Modell wird ein Referenzgesicht im Face Vault benötigt!");
      fileInputRef.current?.click();
      return;
    }

    // Kontingent verringern & persistieren
    setFreeGenerations((prev) => {
      const nextVal = Math.max(0, prev - 1);
      if (typeof window !== "undefined") {
        localStorage.setItem("photo_faker_quota", nextVal.toString());
      }
      return nextVal;
    });

    setRenderError(null);
    setPipelineInfo(null);
    setIsRendering(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: selectedModel,
          faceImageBase64: faceImage,
          prompt: prompt,
          batchCount: batchSize,
          aspectRatio: aspectRatio,
          clientHfToken: hfToken,
        }),
      });

      const data = await response.json();
      const imgs =
        data.images && data.images.length > 0
          ? data.images
          : data.image
          ? [data.image]
          : [];

      if (imgs.length > 0) {
        setGeneratedImages(imgs);
        setActiveImageIndex(0);
        setSliderPosition(50);
        setRenderError(null);
        if (data.latency) {
          setRenderLatency(data.latency);
        }
        if (data.pipeline) {
          setPipelineInfo(data.pipeline);
        }
        // Celebration Confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#8b5cf6", "#f59e0b", "#d0bcff", "#ec4899"],
        });
      } else {
        setRenderError({
          message: data.error || "Unbekannter Fehler bei der Generierung",
          isZeroGpu: Boolean(data.isZeroGpuError),
        });
      }
    } catch (err: any) {
      console.error(err);
      setRenderError({
        message: "Netzwerkfehler beim Rendern: " + (err?.message || "Server nicht erreichbar"),
        isZeroGpu: false,
      });
    } finally {
      setIsRendering(false);
    }
  };

  // 1-Click Direktexport in iPhone Fotos / Web Share
  const handleSaveToPhotos = async () => {
    const currentUrl = generatedImages[activeImageIndex];
    if (!currentUrl) return;

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        const response = await fetch(currentUrl);
        const blob = await response.blob();
        const file = new File([blob], `photo-faker-${Date.now()}.jpg`, {
          type: "image/jpeg",
        });
        await navigator.share({
          files: [file],
          title: "PHOTO FAKER Studio RAW Render",
          text: "Mit Photo Faker Studio generiert.",
        });
        return;
      } catch (e) {
        downloadFallback(currentUrl);
      }
    } else {
      downloadFallback(currentUrl);
    }
  };

  const downloadFallback = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `photo-faker-${Date.now()}.jpg`;
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // In Zwischenablage kopieren
  const handleCopyToClipboard = async () => {
    const currentUrl = generatedImages[activeImageIndex];
    if (!currentUrl) return;

    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Kopieren fehlgeschlagen:", e);
    }
  };

  // Slider Keyboard Navigation
  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
      e.preventDefault();
      setSliderPosition((prev) => Math.max(0, prev - 5));
    } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
      e.preventDefault();
      setSliderPosition((prev) => Math.min(100, prev + 5));
    } else if (e.key === "Home") {
      e.preventDefault();
      setSliderPosition(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setSliderPosition(100);
    }
  };

  // Slider Mouse/Touch Dragging
  const handleSliderMove = (clientX: number) => {
    if (!splitContainerRef.current) return;
    const rect = splitContainerRef.current.getBoundingClientRect();
    let offsetX = clientX - rect.left;
    if (offsetX < 0) offsetX = 0;
    if (offsetX > rect.width) offsetX = rect.width;
    const percentage = Math.round((offsetX / rect.width) * 100);
    setSliderPosition(percentage);
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (isDraggingSlider) handleSliderMove(e.clientX);
    };
    const onMouseUp = () => setIsDraggingSlider(false);
    const onTouchMove = (e: TouchEvent) => {
      if (isDraggingSlider && e.touches[0]) handleSliderMove(e.touches[0].clientX);
    };
    const onTouchEnd = () => setIsDraggingSlider(false);

    if (isDraggingSlider) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onTouchEnd);
    }

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [isDraggingSlider]);

  return (
    <div className="min-h-screen bg-[#121317] text-[#f4f4f5] flex flex-col font-sans selection:bg-[#8b5cf6] selection:text-white">
      {/* Top Header */}
      <header className="border-b border-[#2d2e35] px-4 md:px-8 py-3.5 flex items-center justify-between bg-[#0d0e12]/90 backdrop-blur-2xl sticky top-0 z-50 shadow-[0_1px_12px_rgba(0,0,0,0.4)]">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/80 flex items-center justify-center text-violet-300 font-bold text-sm shadow-[0_0_15px_rgba(139,92,246,0.5)]">
              ⚡
            </span>
            <div className="flex flex-col">
              <span className="font-extrabold text-base md:text-lg tracking-wider bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                PHOTO FAKER
              </span>
              <span className="text-[9px] tracking-widest text-violet-400 font-mono -mt-0.5 uppercase">
                HIGH-FIDELITY STUDIO PRO
              </span>
            </div>
            <span className="hidden sm:inline text-[10px] tracking-widest text-violet-300 font-mono px-2 py-0.5 rounded-full bg-violet-950/70 border border-violet-800/60 ml-1">
              ENGINE V5.0
            </span>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/30 px-3 py-1 rounded-full border border-emerald-800/50">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>ZERO-RETENTION / DSGVO PRIVAT</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Kontingent-Anzeige */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1b1c24] border border-[#2e303b] text-xs font-mono shadow-sm">
            <span
              className={`w-2 h-2 rounded-full ${
                freeGenerations > 0
                  ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                  : "bg-red-500"
              }`}
            ></span>
            <span className="text-zinc-400 hidden sm:inline">Generierungen:</span>
            <span
              className={`font-bold ${
                freeGenerations > 0 ? "text-amber-300" : "text-red-400"
              }`}
            >
              {freeGenerations} / 10
            </span>
          </div>

          {/* HF Token Button */}
          <button
            onClick={() => {
              setTokenInput(hfToken);
              setIsTokenModalOpen(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono font-medium border transition cursor-pointer shadow-sm ${
              hfToken
                ? "bg-emerald-950/60 text-emerald-300 border-emerald-700/50 hover:bg-emerald-900/60"
                : "bg-[#1b1c24] text-zinc-300 border-[#2e303b] hover:text-white hover:border-violet-500/50"
            }`}
            title="Kostenlosen Hugging Face Token konfigurieren"
          >
            <Key className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{hfToken ? "HF-Token:" : "HF-Token"}</span>
            <span className={hfToken ? "text-emerald-400 font-bold" : "text-amber-400 font-semibold"}>
              {hfToken ? "Aktiv" : "Hinzufügen"}
            </span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 text-xs bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 transition px-4 py-2 rounded-full font-semibold shadow-lg shadow-violet-600/30 active:scale-[0.98]"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{faceImage ? "Foto wechseln" : "Foto wählen"}</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageUpload}
            accept="image/*"
            className="hidden"
          />
        </div>
      </header>

      {/* Telemetry Sub-Bar */}
      <div className="w-full px-4 md:px-8 py-2 bg-[#0d0e12] border-b border-[#22232d] flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1b1c24] text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]"></span>
            <span className="text-zinc-400">Referenz:</span>
            <span className="text-violet-300 font-semibold">
              {faceImage ? "Biometrie bereit (100%)" : "Kein Foto gewählt"}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-950/50 border border-violet-800/40 text-violet-300">
            <Wand2 className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-zinc-400">Modell:</span>
            <span className="font-semibold text-white">
              {AI_MODELS.find((m) => m.id === selectedModel)?.name}
            </span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-950/50 border border-emerald-800/40 text-emerald-300 text-[11px] font-mono">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Optimiertes High-Fidelity Rendering</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/30 text-amber-300 font-mono text-[11px] border border-amber-900/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Cloud GPU: Online ({renderLatency})</span>
          </div>
        </div>
      </div>

      {/* 2-Spalten Workbench */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Linke Leiste: Face Vault & Einstellungen */}
        <aside className="lg:col-span-3 border-r border-[#2d2e35] p-5 bg-[#16171d] space-y-6 overflow-y-auto max-h-[calc(100vh-100px)]">
          {/* Face Vault */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Camera className="w-4 h-4 text-violet-400" />
                Face Vault
              </h2>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-semibold ${
                  faceImage
                    ? "bg-emerald-950/80 text-emerald-400 border border-emerald-800/50"
                    : "bg-zinc-800 text-zinc-400"
                }`}
              >
                {faceImage ? "1/1 BEREIT" : "LEER"}
              </span>
            </div>

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              className="border-2 border-dashed border-[#343640] hover:border-violet-500/70 rounded-2xl p-4 text-center cursor-pointer transition bg-[#1a1b22] group relative overflow-hidden"
            >
              {faceImage ? (
                <div className="relative group">
                  <img
                    src={faceImage}
                    alt="Referenzgesicht"
                    className="w-full h-44 object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition rounded-xl gap-2 text-xs font-semibold backdrop-blur-sm">
                    <RefreshCw className="w-5 h-5 text-violet-400" />
                    <span>Neues Foto hochladen</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setFaceImage(null);
                    }}
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-red-600/80 text-white transition"
                    title="Foto entfernen"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="py-7 flex flex-col items-center gap-2.5">
                  <div className="w-12 h-12 rounded-full bg-violet-600/10 border border-violet-500/20 flex items-center justify-center text-violet-400 group-hover:scale-110 transition">
                    <Camera className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-medium text-zinc-200">
                    Gesichtsfoto hier ablegen
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Frontal oder 45° Profil für beste Ergebnisse
                  </span>
                </div>
              )}
            </div>

            {faceImage && (
              <div className="grid grid-cols-3 gap-1.5 pt-1">
                <div className="p-1.5 rounded-lg bg-[#121317] border border-[#2d2e35] text-center">
                  <span className="block text-[10px] text-zinc-400">Frontal</span>
                  <span className="text-[11px] font-mono text-emerald-400 font-bold">100%</span>
                </div>
                <div className="p-1.5 rounded-lg bg-[#121317] border border-[#2d2e35] text-center">
                  <span className="block text-[10px] text-zinc-400">Biometrie</span>
                  <span className="text-[11px] font-mono text-violet-400 font-bold">Exakt</span>
                </div>
                <div className="p-1.5 rounded-lg bg-[#121317] border border-[#2d2e35] text-center">
                  <span className="block text-[10px] text-zinc-400">RAM-Cache</span>
                  <span className="text-[11px] font-mono text-amber-400 font-bold">Aktiv</span>
                </div>
              </div>
            )}
          </div>

          {/* KI-Modell Auswahl */}
          <div className="space-y-3 pt-4 border-t border-[#2d2e35]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Wand2 className="w-3.5 h-3.5 text-violet-400" />
                KI-Modell
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">
                {AI_MODELS.length} Modelle
              </span>
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                className="w-full p-3 rounded-xl bg-[#121317] border border-[#2d2e35] hover:border-violet-500/60 shadow-md flex items-center justify-between transition group text-left cursor-pointer"
              >
                <div className="flex flex-col gap-0.5 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-bold text-xs text-white truncate">
                      {AI_MODELS.find((m) => m.id === selectedModel)?.name}
                    </span>
                  </div>
                  <span
                    className={`text-[8px] font-mono px-1.5 py-0.5 rounded border w-fit ${
                      AI_MODELS.find((m) => m.id === selectedModel)?.badgeColor
                    }`}
                  >
                    {AI_MODELS.find((m) => m.id === selectedModel)?.tag}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-zinc-400 shrink-0 group-hover:text-white transition-transform duration-200 ${
                    isModelDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {isModelDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-40 bg-[#16171d] border border-[#2d2e35] rounded-xl shadow-2xl overflow-hidden divide-y divide-[#22232d] animate-in fade-in zoom-in-95 duration-150">
                  {AI_MODELS.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => {
                        setSelectedModel(m.id);
                        setIsModelDropdownOpen(false);
                      }}
                      className={`p-3 cursor-pointer transition flex items-center justify-between ${
                        selectedModel === m.id
                          ? "bg-violet-950/40 text-white"
                          : "hover:bg-[#1f2029] text-zinc-300"
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[11px] text-white">{m.name}</span>
                          <span className={`text-[8px] font-mono px-1 py-0.5 rounded border ${m.badgeColor}`}>
                            {m.requiresFace ? "FACE" : "NO FACE"}
                          </span>
                        </div>
                        <p className="text-[10px] text-zinc-400 line-clamp-1">{m.desc}</p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <span className="text-[9px] font-mono text-zinc-500">{m.speed}</span>
                        {selectedModel === m.id && (
                          <Check className="w-3.5 h-3.5 text-violet-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Biometrie-Hinweis für Modelle ohne Gesichtserhalt */}
            {AI_MODELS.find((m) => m.id === selectedModel)?.requiresFace === false && (
              <div className="p-2.5 rounded-xl bg-amber-950/40 border border-amber-700/50 text-amber-300 text-[11px] flex items-start gap-2 shadow-sm">
                <span className="text-sm shrink-0 leading-none">⚠️</span>
                <span className="leading-relaxed">
                  Dieses Modell generiert ein <strong>neues Gesicht</strong>. Für biometrischen Gesichtserhalt wähle PuLID-FLUX, InstantID, Direct FaceSwap oder PhotoMaker.
                </span>
              </div>
            )}
          </div>

          {/* Film Grain Toggle */}
          <div className="space-y-3 pt-4 border-t border-[#2d2e35]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Film className="w-3.5 h-3.5 text-amber-400" />
                Film Look
              </h3>
            </div>

            <button
              type="button"
              onClick={() => setFilmGrainEnabled(!filmGrainEnabled)}
              className={`w-full p-3 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                filmGrainEnabled
                  ? "bg-amber-950/40 border-amber-700/50 text-amber-200"
                  : "bg-[#121317] border-[#2d2e35] text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-8 h-5 rounded-full relative transition-colors duration-200 ${
                    filmGrainEnabled ? "bg-amber-500" : "bg-zinc-700"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${
                      filmGrainEnabled ? "left-3.5" : "left-0.5"
                    }`}
                  ></div>
                </div>
                <div>
                  <span className="text-xs font-semibold block">Analog 35mm Grain</span>
                  <span className="text-[10px] text-zinc-500">Kodak Portra 400 Look</span>
                </div>
              </div>
              <span className={`text-[10px] font-mono font-bold ${filmGrainEnabled ? "text-amber-400" : "text-zinc-600"}`}>
                {filmGrainEnabled ? "AN" : "AUS"}
              </span>
            </button>
          </div>

          {/* Frame & Batch Specs */}
          <div className="space-y-3 pt-4 border-t border-[#2d2e35]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Frame & Batch
              </h3>
              <span className="text-[10px] font-mono text-zinc-500">DPI: 300</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { label: "4:5", sub: "Portrait" },
                { label: "9:16", sub: "Story" },
                { label: "1:1", sub: "Square" },
              ].map((fmt) => (
                <button
                  key={fmt.label}
                  onClick={() => setAspectRatio(fmt.label)}
                  className={`py-2 px-1 rounded-xl text-center transition ${
                    aspectRatio === fmt.label
                      ? "bg-violet-600 text-white font-bold shadow-md shadow-violet-600/30"
                      : "bg-[#1b1c24] text-zinc-400 hover:text-white border border-[#2e303b]"
                  }`}
                >
                  <span className="block text-xs font-semibold">{fmt.label}</span>
                  <span className="text-[9px] uppercase opacity-75">{fmt.sub}</span>
                </button>
              ))}
            </div>

            <div className="flex justify-between items-center pt-1 text-xs">
              <span className="text-zinc-400">Batch-Größe:</span>
              <div className="flex gap-1.5">
                {[1, 2, 4].map((size) => (
                  <button
                    key={size}
                    onClick={() => setBatchSize(size)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                      batchSize === size
                        ? "bg-violet-600 text-white shadow-md shadow-violet-600/30"
                        : "bg-[#1b1c24] text-zinc-400 hover:text-white border border-[#2e303b]"
                    }`}
                  >
                    {size} {size === 1 ? "Bild" : "Bilder"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* DSGVO Card */}
          <div className="pt-4 border-t border-[#2d2e35]">
            <div className="p-3.5 rounded-xl bg-[#121317] border border-[#2d2e35] text-[10px] text-zinc-400 space-y-1.5">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>100% DSGVO & Zero-Retention</span>
              </div>
              <p className="leading-relaxed">
                Deine Gesichtsdaten werden ausschließlich flüchtig im RAM verarbeitet und zu
                keinem Zeitpunkt gespeichert oder für Modelltraining verwendet.
              </p>
            </div>
          </div>
        </aside>

        {/* Hauptbereich: Canvas + Prompt + Export */}
        <section className="lg:col-span-9 p-4 md:p-6 flex flex-col justify-between bg-[#0e0f13] overflow-y-auto max-h-[calc(100vh-100px)]">
          <div>
            {/* Error Banner with ZeroGPU Action */}
            {renderError && (
              <div className="mb-4 p-4 rounded-2xl bg-red-950/50 border border-red-700/60 text-red-200 text-xs shadow-xl animate-in fade-in duration-200">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <span className="font-bold text-sm text-red-100 block">
                        Generierung fehlgeschlagen
                      </span>
                      <p className="text-zinc-300 leading-relaxed">{renderError.message}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setRenderError(null)}
                    className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-red-900/40 transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-3 pt-3 border-t border-red-900/50 flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => {
                      setTokenInput(hfToken);
                      setIsTokenModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold transition flex items-center gap-1.5 shadow-md shadow-violet-600/30 cursor-pointer"
                  >
                    <Key className="w-3.5 h-3.5 text-amber-300" />
                    <span>HF-Token eintragen (Kostenlos)</span>
                  </button>
                  <button
                    onClick={() => {
                      setRenderError(null);
                      setIsModelDropdownOpen(true);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-[#1b1c24] hover:bg-[#252733] text-zinc-200 border border-[#2e303b] transition cursor-pointer"
                  >
                    Anderes Modell wählen
                  </button>
                </div>
              </div>
            )}

            {/* Viewfinder Header */}
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-mono text-zinc-400 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                RAW PRO 4K SPLIT-RENDER
              </span>
              <span className="font-mono text-zinc-500 hidden sm:inline">
                f/1.4 • 85mm G-Master • ISO 100
              </span>
            </div>

            {/* Haupt-Canvas mit Split-Screen */}
            <div
              ref={splitContainerRef}
              className="relative w-full aspect-[4/5] max-h-[580px] bg-[#16171d] rounded-2xl overflow-hidden border border-[#2d2e35] shadow-2xl mx-auto flex items-center justify-center select-none"
            >
              {isRendering ? (
                <div className="flex flex-col items-center gap-3 p-6 text-center max-w-md">
                  <div className="relative">
                    <RefreshCw className="w-10 h-10 text-violet-400 animate-spin" />
                    <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full"></div>
                  </div>
                  <span className="text-base font-bold tracking-wide text-white">
                    High-Fidelity Rendering läuft...
                  </span>
                  <div className="px-3 py-1 rounded-full bg-violet-950/70 border border-violet-700/60 text-xs font-mono text-violet-300 font-semibold">
                    Modell: {AI_MODELS.find((m) => m.id === selectedModel)?.name}
                  </div>

                  <div className="w-48 bg-zinc-800 rounded-full h-1.5 overflow-hidden mt-2">
                    <div className="bg-gradient-to-r from-violet-500 via-pink-500 to-amber-500 h-full animate-pulse w-3/4"></div>
                  </div>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="relative w-full h-full">
                  {/* Generiertes Render-Bild */}
                  <img
                    src={generatedImages[activeImageIndex]}
                    alt="Generiertes Porträt"
                    className="absolute inset-0 w-full h-full object-cover"
                  />

                  {/* Vorher-Original-Bild (geslicet mit Slider) */}
                  {faceImage && (
                    <div
                      className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-violet-400 shadow-[0_0_20px_rgba(139,92,246,0.9)]"
                      style={{ width: `${sliderPosition}%` }}
                    >
                      <img
                        src={faceImage}
                        alt="Original Referenz"
                        className="absolute inset-0 w-full h-full object-cover max-w-none"
                        style={{
                          width: splitContainerRef.current
                            ? `${splitContainerRef.current.clientWidth}px`
                            : "100%",
                          height: "100%",
                        }}
                      />
                      <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-zinc-200 border border-white/10">
                        ORIGINAL INPUT
                      </div>
                    </div>
                  )}

                  {/* Right label */}
                  <div className="absolute top-3 right-3 bg-violet-950/80 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-mono text-violet-300 border border-violet-800/60">
                    {AI_MODELS.find((m) => m.id === selectedModel)?.name.toUpperCase() || "KI"} RENDER
                  </div>

                  {/* Split Handle */}
                  {faceImage && (
                    <div
                      role="slider"
                      tabIndex={0}
                      aria-label="Vorher-Nachher Bildvergleich"
                      aria-valuenow={sliderPosition}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuetext={`${sliderPosition}% Original, ${100 - sliderPosition}% KI Render`}
                      onKeyDown={handleSliderKeyDown}
                      onMouseDown={() => setIsDraggingSlider(true)}
                      onTouchStart={() => setIsDraggingSlider(true)}
                      className="absolute inset-y-0 -ml-4 w-8 cursor-ew-resize z-30 flex items-center justify-center group focus:outline-none"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.8)] border-2 border-white group-hover:scale-110 group-focus-visible:ring-4 group-focus-visible:ring-violet-400 transition">
                        <Sliders className="w-3.5 h-3.5 rotate-90" />
                      </div>
                    </div>
                  )}
                </div>
              ) : faceImage ? (
                <div className="relative w-full h-full">
                  <img
                    src={faceImage}
                    alt="Vorschau"
                    className="w-full h-full object-cover opacity-85"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-6">
                    <span className="text-sm font-semibold text-white">
                      Referenzgesicht geladen
                    </span>
                    <span className="text-xs text-zinc-400">
                      Beschreibe unten eine Szene und klicke auf &quot;Generieren&quot;.
                    </span>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8 text-zinc-500 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-[#1f2029] flex items-center justify-center text-zinc-600 border border-[#2d2e35]">
                    <ImageIcon className="w-8 h-8 opacity-40" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-300">Kein Bild geladen</p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Lade links ein Gesichtsfoto hoch, um das KI-Shooting zu starten.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Batch-Variationen (Klick zum Wechseln) */}
            {generatedImages.length > 0 && (
              <div className="mt-4 p-3 rounded-2xl bg-[#16171d] border border-[#2d2e35]">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-zinc-300">
                    Generierte Batch-Variationen ({generatedImages.length} Bilder)
                  </span>
                  <span className="text-[10px] font-mono text-violet-400">
                    Klick zum Auswählen
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {generatedImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setActiveImageIndex(idx)}
                      className={`relative aspect-square rounded-xl overflow-hidden cursor-pointer transition border-2 ${
                        activeImageIndex === idx
                          ? "border-violet-500 shadow-[0_0_12px_rgba(139,92,246,0.5)] scale-[1.02]"
                          : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={imgUrl}
                        alt={`Variation ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-white">
                        #{idx + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Export-Aktionen */}
            {generatedImages.length > 0 && (
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <button
                  onClick={handleSaveToPhotos}
                  className="flex-1 min-w-[180px] py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-[0.98]"
                >
                  <Download className="w-4 h-4" />
                  <span>In Fotos sichern (1-Klick)</span>
                </button>

                <button
                  onClick={handleSaveToPhotos}
                  className="py-2.5 px-4 rounded-xl bg-[#22232d] hover:bg-[#2b2d3a] text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 border border-[#343644] transition active:scale-[0.98]"
                >
                  <Share2 className="w-4 h-4 text-violet-400" />
                  <span>Share</span>
                </button>

                <button
                  onClick={handleCopyToClipboard}
                  className="py-2.5 px-3 rounded-xl bg-[#1a1b22] hover:bg-[#22232d] text-zinc-300 font-medium text-xs flex items-center gap-2 border border-[#2e303b] transition"
                >
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>{copied ? "Kopiert!" : "Link kopieren"}</span>
                </button>
              </div>
            )}
          </div>

          {/* Szene & Prompt-Editor mit Würfel-Button & Kategorien */}
          <div className="mt-4 p-4 rounded-2xl bg-[#16171d] border border-[#2d2e35] shadow-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  Szene & Prompt
                </span>
                <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/70 border border-emerald-800/50 text-emerald-400 font-semibold">
                  Photo-Booster Aktiv
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleRandomPrompt()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 hover:text-white border border-violet-500/40 text-xs font-semibold transition active:scale-95 group shadow-sm cursor-pointer"
                title="Zufällige Szene aus Pool wählen"
              >
                <Dices className="w-4 h-4 text-amber-300 group-hover:rotate-180 transition-transform duration-300" />
                <span>Zufallsszene</span>
              </button>
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
              {SCENE_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setSelectedCategory(cat);
                    handleRandomPrompt(cat);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-medium transition shrink-0 cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-violet-600 text-white shadow-sm shadow-violet-600/30"
                      : "bg-[#101116] text-zinc-400 hover:text-white border border-[#262833]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Aktuelle Szene Info */}
            {activeSceneInfo.title && (
              <div className="flex items-center justify-between text-[10px] font-mono px-1">
                <span className="text-zinc-400">
                  Aktuelle Szene:{" "}
                  <span className="text-violet-300 font-semibold">
                    {activeSceneInfo.title}
                  </span>
                </span>
                <span className="text-zinc-500">
                  {activeSceneInfo.category}
                </span>
              </div>
            )}

            <div className="relative">
              <textarea
                rows={4}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Beschreibe die gewünschte Szene, Kleidung, Beleuchtung und Kameraeinstellung..."
                className="w-full bg-[#101116] border border-[#2d2e35] focus:border-violet-500 rounded-xl p-3.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition resize-none leading-relaxed"
              />
            </div>

            <div className="flex items-center justify-between text-[10px] text-zinc-400">
              <span className="flex items-center gap-1">
                <span className="text-amber-400">📸</span>
                <span>Fotografische Keywords (85mm, f/1.8, 8k, raw photo) werden automatisch ergänzt.</span>
              </span>
              <span className="font-mono text-zinc-500 shrink-0 ml-2">
                {prompt.length} Zeichen
              </span>
            </div>
          </div>

          {/* Render CTA Button */}
          <div className="mt-4">
            <button
              onClick={handleRender}
              disabled={isRendering}
              className="w-full py-4 px-6 rounded-2xl font-bold tracking-wide flex items-center justify-center gap-2.5 transition text-sm md:text-base shadow-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-violet-500 hover:from-violet-500 hover:to-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-violet-600/30 active:scale-[0.99]"
            >
              {isRendering ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  <span>RENDERING LÄUFT...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-current text-amber-300" />
                  <span>
                    GENERIEREN ({batchSize} {batchSize === 1 ? "BILD" : "VARIATIONEN"} • {AI_MODELS.find((m) => m.id === selectedModel)?.name})
                  </span>
                </>
              )}
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#0d0e12] border-t border-[#22232d] px-4 md:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-300">PHOTO FAKER</span>
          <span>• High-Fidelity Studio Pro v5.0</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Zero-Retention Privacy Verified</span>
          <span>•</span>
          <span>High-Fidelity AI Generation Engine</span>
        </div>
        <div className="text-[11px]">
          © 2025 Photo Faker Studio. High-Fidelity Generative Portraiture.
        </div>
      </footer>

      {/* Hugging Face Token Modal */}
      {isTokenModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#16171d] border border-[#2d2e35] rounded-3xl p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Hugging Face Token</h3>
                  <p className="text-[11px] text-zinc-400">ZeroGPU Kontingent & Warteschlangen-Boost</p>
                </div>
              </div>
              <button
                onClick={() => setIsTokenModalOpen(false)}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-[#22232d] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3.5 rounded-2xl bg-violet-950/30 border border-violet-800/40 text-xs text-zinc-300 space-y-2">
              <p className="leading-relaxed">
                Hugging Face Spaces laufen auf kostenlosen <strong className="text-violet-300">ZeroGPUs</strong>. Ohne Token teilst du dir ein sehr kleines Kontingent mit allen anonymen Anfragen.
              </p>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Mit deinem eigenen kostenlosen Token erhältst du ein persönliches ZeroGPU-Kontingent und vermeidest Quota-Sperren.
              </p>
            </div>

            <div className="space-y-2 text-xs text-zinc-300 bg-[#0e0f13] p-3.5 rounded-2xl border border-[#22232d]">
              <span className="font-semibold text-zinc-200 block text-[11px] uppercase tracking-wider">
                In 30 Sekunden kostenlos erstellen:
              </span>
              <ol className="list-decimal list-inside space-y-1 text-[11px] text-zinc-400">
                <li>
                  Auf{" "}
                  <a
                    href="https://huggingface.co/settings/tokens"
                    target="_blank"
                    rel="noreferrer"
                    className="text-violet-400 hover:underline inline-flex items-center gap-1 font-semibold"
                  >
                    huggingface.co/settings/tokens
                    <ExternalLink className="w-3 h-3 inline" />
                  </a>{" "}
                  gehen.
                </li>
                <li>
                  Klicke auf <strong>&quot;Create new token&quot;</strong> (Type: <strong>Read</strong>).
                </li>
                <li>Token kopieren (<code className="text-amber-300 bg-black/40 px-1 rounded">hf_...</code>) und unten einfügen:</li>
              </ol>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-300">Dein Hugging Face Token</label>
              <div className="relative">
                <input
                  type={showTokenText ? "text" : "password"}
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="hf_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full bg-[#0e0f13] border border-[#2d2e35] focus:border-violet-500 rounded-xl py-2.5 pl-3 pr-10 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-violet-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowTokenText(!showTokenText)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white p-1"
                >
                  {showTokenText ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={handleSaveToken}
                disabled={!tokenInput.trim()}
                className="flex-1 py-2.5 px-4 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white font-semibold text-xs shadow-lg shadow-violet-600/30 transition cursor-pointer"
              >
                Token speichern & aktivieren
              </button>
              {hfToken && (
                <button
                  onClick={handleRemoveToken}
                  className="py-2.5 px-3 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 border border-red-800/40 text-xs transition cursor-pointer"
                  title="Token entfernen"
                >
                  Entfernen
                </button>
              )}
            </div>

            <p className="text-[10px] text-zinc-500 text-center">
              Wird sicher lokal in deinem Browser (localStorage) gespeichert und nie extern geteilt.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
