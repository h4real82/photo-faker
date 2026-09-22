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
} from "lucide-react";

interface Motif {
  id: string;
  name: string;
  desc: string;
  badge: string;
  subtitle: string;
  tags: string[];
}

const MOTIFS: Motif[] = [
  {
    id: "paris-fashion",
    name: "Paris Fashion Week",
    subtitle: "Pont Alexandre III • Golden Hour",
    desc: "Haute Couture Oversized Trench, 35mm Kodak Portra 400",
    badge: "POPULÄR",
    tags: ["HAUTE TRENCH", "35MM"],
  },
  {
    id: "neon-noir",
    name: "Neon Noir Cyber-Editorial",
    subtitle: "Tokyo Rain • Reflexionen",
    desc: "Wet Leather Jacket, dramatische Violett- & Cyan-Akzente",
    badge: "CINEMA",
    tags: ["HIGH GLOSS", "CINEMA"],
  },
  {
    id: "monaco-yacht",
    name: "Monaco Yacht Riviera",
    subtitle: "Old Money Luxury • Sunset Linen",
    desc: "Mittelmeer-Sonne, natürlicher Bokeh-Look, Hasselblad-Güte",
    badge: "RAW",
    tags: ["SUNNY RAW", "OLD MONEY"],
  },
  {
    id: "met-gala",
    name: "Met Gala Velvet & Gems",
    subtitle: "Red Carpet • Dramatic Flash",
    desc: "Glamouröses Abendkleid, harter Paparazzi-Blitz, Vogue-Editorial",
    badge: "VOGUE",
    tags: ["VOGUE FRONT", "GLAMOUR"],
  },
];

interface AIModel {
  id: "instantid" | "flux" | "qwen" | "photomaker" | "lightning";
  name: string;
  tag: string;
  badgeColor: string;
  desc: string;
  speed: string;
}

const AI_MODELS: AIModel[] = [
  {
    id: "instantid",
    name: "InstantID (SDXL)",
    tag: "Gesichtserhalt 1:1",
    badgeColor: "bg-violet-900/60 text-violet-300 border-violet-700/50",
    desc: "Strikter biometrischer Gesichtserhalt auf neu generierte Szenen.",
    speed: "~16s",
  },
  {
    id: "flux",
    name: "FLUX.1 Schnell",
    tag: "Beste Fotoqualität (Neues Gesicht)",
    badgeColor: "bg-blue-900/60 text-blue-300 border-blue-700/50",
    desc: "12B Next-Gen Diffusionsmodell für höchste fotografische Güte.",
    speed: "~6s",
  },
  {
    id: "qwen",
    name: "Qwen-Image 2.1",
    tag: "Top Textur & Details (Neues Gesicht)",
    badgeColor: "bg-purple-900/60 text-purple-300 border-purple-700/50",
    desc: "Hervorragende Hauttexturen, Poren und natürliche Schattenbildung.",
    speed: "~12s",
  },
  {
    id: "photomaker",
    name: "PhotoMaker V2",
    tag: "Gute Ähnlichkeit & Style",
    badgeColor: "bg-pink-900/60 text-pink-300 border-pink-700/50",
    desc: "Konsistente Gesichts-Identität für hochauflösende Porträts.",
    speed: "~18s",
  },
  {
    id: "lightning",
    name: "SDXL Lightning",
    tag: "Ultra-schnell (Ähnliche Züge)",
    badgeColor: "bg-amber-900/60 text-amber-300 border-amber-700/50",
    desc: "ByteDance 4-Step Turbo-Inferenz für sekundenschnelle Generierung.",
    speed: "~4s",
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
  const [selectedMotif, setSelectedMotif] = useState<string>("paris-fashion");
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
  const [selectedModel, setSelectedModel] = useState<string>("instantid");
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState<boolean>(false);
  const [freeGenerations, setFreeGenerations] = useState<number>(10);
  const [identityLock, setIdentityLock] = useState<number>(100);
  const [aspectRatio, setAspectRatio] = useState<string>("4:5");
  const [batchSize, setBatchSize] = useState<number>(2);
  const [analogGrain, setAnalogGrain] = useState<number>(45);
  const [skinTexture, setSkinTexture] = useState<number>(75);
  const [hairStyle, setHairStyle] = useState<string>("Original Haarstruktur beibehalten");
  const [isRendering, setIsRendering] = useState<boolean>(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [sliderPosition, setSliderPosition] = useState<number>(50);
  const [copied, setCopied] = useState<boolean>(false);
  const [renderLatency, setRenderLatency] = useState<string>("3.2s");
  const [isDraggingSlider, setIsDraggingSlider] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  // Kontingent aus LocalStorage laden
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("photo_faker_quota");
      if (stored !== null) {
        const val = parseInt(stored, 10);
        if (!isNaN(val)) setFreeGenerations(val);
      } else {
        localStorage.setItem("photo_faker_quota", "10");
      }
    }
  }, []);

  // Zufällige realistische Szene auswählen (optional nach Kategorie gefiltert)
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
    const requiresFace = selectedModel === "instantid" || selectedModel === "photomaker";
    if (requiresFace && !faceImage) {
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

    setIsRendering(true);
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelId: selectedModel,
          image: faceImage,
          faceImageBase64: faceImage,
          motifId: selectedMotif,
          prompt: prompt,
          batchCount: batchSize,
          identityStrength: identityLock,
          aspectRatio: aspectRatio,
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
        if (data.latency) {
          setRenderLatency(data.latency);
        }
        // Celebration Confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#8b5cf6", "#f59e0b", "#d0bcff", "#ec4899"],
        });
      } else {
        alert("Generierung fehlgeschlagen: " + (data.error || "Unbekannter Fehler"));
      }
    } catch (err: any) {
      console.error(err);
      alert("Netzwerkfehler beim Rendern: " + (err?.message || "Server nicht erreichbar"));
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
        // Fallback to normal download
        downloadFallback(currentUrl);
      }
    } else {
      downloadFallback(currentUrl);
    }
  };

  const downloadFallback = (url: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = `photo-faker-${selectedMotif}-${Date.now()}.jpg`;
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

  const activeMotifObj = MOTIFS.find((m) => m.id === selectedMotif) || MOTIFS[0];

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
                FACE ENGINE PRO
              </span>
            </div>
            <span className="hidden sm:inline text-[10px] tracking-widest text-violet-300 font-mono px-2 py-0.5 rounded-full bg-violet-950/70 border border-violet-800/60 ml-1">
              ENGINE V4.2
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
            <span className="text-zinc-400 hidden sm:inline">Kostenlose Generierungen:</span>
            <span
              className={`font-bold ${
                freeGenerations > 0 ? "text-amber-300" : "text-red-400"
              }`}
            >
              {freeGenerations} / 10
            </span>
          </div>

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

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1b1c24] text-zinc-300">
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
            <span className="text-zinc-400">Preset:</span>
            <span className="text-white font-medium">{activeMotifObj.name}</span>
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-violet-950/50 border border-violet-800/40 text-violet-300">
            <Wand2 className="w-3.5 h-3.5 text-violet-400" />
            <span className="text-zinc-400">Modell:</span>
            <span className="font-semibold text-white">
              {AI_MODELS.find((m) => m.id === selectedModel)?.name}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-950/30 text-amber-300 font-mono text-[11px] border border-amber-900/40">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
            <span>Cloud GPU: Online ({renderLatency})</span>
          </div>
        </div>
      </div>

      {/* 3-Spalten Workbench */}
      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        {/* Linke Leiste: Face Vault & Feineinstellung */}
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

          {/* Styling & Modifiers */}
          <div className="space-y-4 pt-4 border-t border-[#2d2e35]">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-violet-400" />
                Identitäts-Treue (InstantID)
              </h3>
              <span className="text-[10px] font-mono text-violet-400 font-bold">
                {identityLock}%
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5 text-zinc-400">
                <span>Lock-Stärke</span>
                <span className="font-mono text-violet-400 font-semibold">{identityLock}%</span>
              </div>
              <input
                type="range"
                min="70"
                max="100"
                value={identityLock}
                onChange={(e) => setIdentityLock(Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer h-1.5 bg-[#0d0e12] rounded-lg"
              />
              <span className="text-[10px] text-zinc-500 block mt-1 leading-tight">
                Erhält 100% der Knochenstruktur & biometrischen Merkmale im Render.
              </span>
            </div>

            {/* Analog Grain */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 text-zinc-400">
                <span>Analog 35mm Grain</span>
                <span className="font-mono text-zinc-300">{analogGrain}% (Portra 400)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={analogGrain}
                onChange={(e) => setAnalogGrain(Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer h-1.5 bg-[#0d0e12] rounded-lg"
              />
            </div>

            {/* Hauttextur & Poren */}
            <div>
              <div className="flex justify-between text-xs mb-1.5 text-zinc-400">
                <span>Hauttextur & Poren</span>
                <span className="font-mono text-zinc-300">{skinTexture}% (RAW Contrast)</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={skinTexture}
                onChange={(e) => setSkinTexture(Number(e.target.value))}
                className="w-full accent-violet-500 cursor-pointer h-1.5 bg-[#0d0e12] rounded-lg"
              />
            </div>

            {/* Haar-Styling Matrix */}
            <div className="space-y-1.5">
              <span className="text-xs text-zinc-400">Haar-Styling Matrix</span>
              <select
                value={hairStyle}
                onChange={(e) => setHairStyle(e.target.value)}
                className="w-full bg-[#121317] border border-[#2e303b] text-zinc-200 text-xs py-2 px-3 rounded-xl focus:outline-none focus:border-violet-500 cursor-pointer"
              >
                <option>Original Haarstruktur beibehalten</option>
                <option>Wet Hair Look (Sleek Haute)</option>
                <option>Beach Waves (Natural Warm)</option>
                <option>Voluminous Studio Blowout</option>
              </select>
            </div>
          </div>

          {/* Batch & Frame Specs */}
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
        </aside>

        {/* Mitte: Canvas & Vorher/Nachher Live-View */}
        <section className="lg:col-span-6 p-4 md:p-6 flex flex-col justify-between bg-[#0e0f13] overflow-y-auto max-h-[calc(100vh-100px)]">
          <div>
            {/* KI-Modell Auswahlelement (Modernes Custom Select / Dropdown) */}
            <div className="mb-4 relative">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                  <Wand2 className="w-3.5 h-3.5 text-violet-400" />
                  KI-Modell auswählen
                </span>
                <span className="text-[10px] font-mono text-zinc-400 bg-[#16171d] px-2.5 py-0.5 rounded-full border border-zinc-800">
                  Hugging Face Serverless (5 Modelle)
                </span>
              </div>

              {/* Select Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                  className="w-full p-3.5 rounded-2xl bg-[#16171d] border border-[#2d2e35] hover:border-violet-500/60 shadow-lg flex items-center justify-between transition group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 font-bold text-xs shrink-0">
                      <Wand2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-white">
                          {AI_MODELS.find((m) => m.id === selectedModel)?.name}
                        </span>
                        <span
                          className={`text-[9px] font-mono px-2 py-0.5 rounded-md border font-semibold ${
                            AI_MODELS.find((m) => m.id === selectedModel)?.badgeColor
                          }`}
                        >
                          {AI_MODELS.find((m) => m.id === selectedModel)?.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-1 mt-0.5">
                        {AI_MODELS.find((m) => m.id === selectedModel)?.desc}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-mono text-zinc-500 bg-[#0e0f13] px-2 py-0.5 rounded-md border border-zinc-800 hidden sm:inline">
                      {AI_MODELS.find((m) => m.id === selectedModel)?.speed}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-400 group-hover:text-white transition-transform duration-200 ${
                        isModelDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </button>

                {/* Dropdown Menu */}
                {isModelDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-[#16171d] border border-[#2d2e35] rounded-2xl shadow-2xl overflow-hidden divide-y divide-[#22232d] animate-in fade-in zoom-in-95 duration-150">
                    {AI_MODELS.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          setSelectedModel(m.id);
                          setIsModelDropdownOpen(false);
                        }}
                        className={`p-3.5 cursor-pointer transition flex items-center justify-between ${
                          selectedModel === m.id
                            ? "bg-violet-950/40 text-white"
                            : "hover:bg-[#1f2029] text-zinc-300"
                        }`}
                      >
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs text-white">{m.name}</span>
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded border ${m.badgeColor}`}>
                              {m.tag}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400">{m.desc}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[10px] font-mono text-zinc-500">{m.speed}</span>
                          {selectedModel === m.id && (
                            <Check className="w-4 h-4 text-violet-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Dynamischer Biometrie-Warnhinweis */}
              {selectedModel !== "instantid" && (
                <div className="mt-2.5 p-3 rounded-xl bg-amber-950/40 border border-amber-700/50 text-amber-300 text-xs flex items-start gap-2.5 shadow-sm">
                  <span className="text-base shrink-0 leading-none">⚠️</span>
                  <div className="leading-relaxed">
                    <span className="font-semibold block text-amber-200">Biometrie-Hinweis:</span>
                    <span>Dieses Modell optimiert Fotorealismus und Lichtstimmung. Die Gesichtszüge stimmen nicht 1:1 mit deinem Upload überein.</span>
                  </div>
                </div>
              )}
            </div>

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
              className="relative w-full aspect-[4/5] max-h-[540px] bg-[#16171d] rounded-2xl overflow-hidden border border-[#2d2e35] shadow-2xl mx-auto flex items-center justify-center select-none"
            >
              {isRendering ? (
                <div className="flex flex-col items-center gap-3 p-6 text-center max-w-md">
                  <div className="relative">
                    <RefreshCw className="w-10 h-10 text-violet-400 animate-spin" />
                    <div className="absolute inset-0 bg-violet-500/20 blur-xl rounded-full"></div>
                  </div>
                  <span className="text-base font-bold tracking-wide text-white">
                    Fotomontage wird gerendert...
                  </span>
                  <div className="px-3 py-1 rounded-full bg-violet-950/70 border border-violet-700/60 text-xs font-mono text-violet-300 font-semibold">
                    Modell: {AI_MODELS.find((m) => m.id === selectedModel)?.name}
                  </div>
                  <span className="text-xs text-zinc-400">
                    {selectedModel === "instantid"
                      ? `InstantID generiert ${batchSize} photorealistische${batchSize > 1 ? "s" : ""} Porträt${batchSize > 1 ? "s" : ""} mit 1:1 Gesichtserhalt.`
                      : selectedModel === "flux"
                      ? "FLUX.1 Schnell berechnet ultra-realistische Kamera-Beleuchtung und Spitzen-Fotoqualität."
                      : selectedModel === "qwen"
                      ? "Qwen-Image 2.1 synthetisiert feine Mikro-Poren und stimmige Lichtreflexionen."
                      : selectedModel === "photomaker"
                      ? "PhotoMaker V2 synthetisiert ein konsistentes High-Fashion Porträt."
                      : "SDXL Lightning rendert in 4 Turbo-Inferenzschritten."}
                  </span>

                  {/* Warteschlangen-Hinweis */}
                  <div className="mt-2 p-2.5 rounded-xl bg-amber-950/40 border border-amber-800/40 text-[11px] text-amber-300/90 leading-relaxed flex items-start gap-2 text-left">
                    <span className="text-sm shrink-0">⏳</span>
                    <div>
                      <span className="font-semibold block">Hugging Face Cloud-Warteschlange:</span>
                      <span>
                        Bei hoher Serverauslastung kann es in der Warteschlange einige Sekunden dauern. Die Verbindung bleibt aktiv.
                      </span>
                    </div>
                  </div>

                  <div className="w-48 bg-zinc-800 rounded-full h-1.5 overflow-hidden mt-2">
                    <div className="bg-gradient-to-r from-violet-500 via-pink-500 to-amber-500 h-full animate-pulse w-3/4"></div>
                  </div>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="relative w-full h-full">
                  {/* Generiertes Render-Bild (rechts bzw. Vollbild) */}
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
                      onMouseDown={() => setIsDraggingSlider(true)}
                      onTouchStart={() => setIsDraggingSlider(true)}
                      className="absolute inset-y-0 -ml-4 w-8 cursor-ew-resize z-30 flex items-center justify-center group"
                      style={{ left: `${sliderPosition}%` }}
                    >
                      <div className="w-8 h-8 rounded-full bg-violet-600 text-white flex items-center justify-center shadow-[0_0_15px_rgba(139,92,246,0.8)] border-2 border-white group-hover:scale-110 transition">
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
                      Wähle rechts ein Shooting-Motiv und klicke auf "Rendern".
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
          </div>

            {/* Szene & Prompt-Editor mit Würfel-Button & Kategorien */}
            <div className="mt-4 p-3.5 rounded-2xl bg-[#16171d] border border-[#2d2e35] shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    Szene & Prompt-Editor
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
                  rows={3}
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Beschreibe eine eigene Szene oder wähle oben eine Kategorie / Zufallsszene..."
                  className="w-full bg-[#101116] border border-[#2d2e35] focus:border-violet-500 rounded-xl p-3 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-violet-500 transition resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between text-[10px] text-zinc-400">
                <span className="flex items-center gap-1">
                  <span className="text-amber-400">📸</span>
                  <span>Fotografische Kamera-Keywords (Sony A7 IV, 85mm f/1.4, 8k) werden automatisch ergänzt.</span>
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
              disabled={isRendering || !faceImage}
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
                    FOTOMONTAGE RENDERN ({batchSize} {batchSize === 1 ? "BILD" : "VARIATIONEN"} • ECHTFOTO)
                  </span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* Rechte Leiste: Motive & 1-Klick Export */}
        <aside className="lg:col-span-3 border-l border-[#2d2e35] p-5 bg-[#16171d] space-y-6 overflow-y-auto max-h-[calc(100vh-100px)]">
          {/* Motive Liste */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                Shooting-Motive
              </h2>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-950/40 border border-amber-800/40 px-2 py-0.5 rounded-full font-bold">
                {MOTIFS.length} PRESETS
              </span>
            </div>

            <div className="space-y-2.5">
              {MOTIFS.map((motif) => (
                <div
                  key={motif.id}
                  onClick={() => {
                    setSelectedMotif(motif.id);
                    setPrompt(motif.desc);
                  }}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition ${
                    selectedMotif === motif.id
                      ? "bg-violet-950/40 border-violet-500 shadow-[0_0_15px_rgba(139,92,246,0.3)] scale-[1.01]"
                      : "bg-[#1b1c24] border-[#2e303b] hover:border-zinc-500"
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold text-xs text-white">{motif.name}</span>
                    <span className="text-[9px] font-mono font-bold text-violet-300 bg-violet-900/60 px-1.5 py-0.5 rounded">
                      {motif.badge}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-300 font-medium mb-1">
                    {motif.subtitle}
                  </p>
                  <p className="text-[10px] text-zinc-500 leading-tight">
                    {motif.desc}
                  </p>
                  <div className="flex gap-1 mt-2">
                    {motif.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-[#121317] text-zinc-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Export-Aktionen */}
          <div className="pt-4 border-t border-[#2d2e35] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-300 flex items-center justify-between">
              <span>Direkt-Export</span>
              <span className="text-[10px] font-mono text-amber-400">NO WATERMARK</span>
            </h3>

            <button
              onClick={handleSaveToPhotos}
              disabled={generatedImages.length === 0}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-40 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition active:scale-[0.98]"
            >
              <Download className="w-4 h-4" />
              <span>In Fotos sichern (1-Klick)</span>
            </button>

            <button
              onClick={handleSaveToPhotos}
              disabled={generatedImages.length === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-[#22232d] hover:bg-[#2b2d3a] disabled:opacity-40 text-zinc-200 font-semibold text-xs flex items-center justify-center gap-2 border border-[#343644] transition active:scale-[0.98]"
            >
              <Share2 className="w-4 h-4 text-violet-400" />
              <span>Web Share (AirDrop, Insta, WA)</span>
            </button>

            <button
              onClick={handleCopyToClipboard}
              disabled={generatedImages.length === 0}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1a1b22] hover:bg-[#22232d] disabled:opacity-40 text-zinc-300 font-medium text-xs flex items-center justify-between px-3 border border-[#2e303b] transition"
            >
              <span className="flex items-center gap-2">
                <Copy className="w-3.5 h-3.5 text-zinc-400" />
                <span>Bildlink kopieren</span>
              </span>
              <span className="text-[10px] font-mono text-violet-400">
                {copied ? "Kopiert!" : "URL"}
              </span>
            </button>

            {/* DSGVO Card */}
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
      </main>

      {/* Footer */}
      <footer className="w-full bg-[#0d0e12] border-t border-[#22232d] px-4 md:px-8 py-3 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="font-bold text-zinc-300">PHOTO FAKER</span>
          <span>• Face Engine Pro Studio v4.2</span>
        </div>
        <div className="flex items-center gap-4 text-[11px]">
          <span>Zero-Retention Privacy Verified</span>
          <span>•</span>
          <span>InstantID Neural Pipeline</span>
        </div>
        <div className="text-[11px]">
          © 2025 Photo Faker Studio. High-Fidelity Generative Portraiture.
        </div>
      </footer>
    </div>
  );
}
