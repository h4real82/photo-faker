# 📸 PHOTO FAKER Studio — Next-Gen AI Portrait & Editorial Face-Swap

<div align="center">

![Next.js](https://img.shields.io/badge/Next.js-15%2B-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)
![Hugging Face](https://img.shields.io/badge/Hugging%20Face-Gradio%20Client-ffcc00?style=for-the-badge&logo=huggingface)
![License](https://img.shields.io/badge/License-MIT-emerald?style=for-the-badge)

**Professionelle KI-Fotomontagen & High-Fashion Editorials direkt im Browser.**  
*100% kostenlose, serverlose Open-Source KI-Modelle via Hugging Face (@gradio/client) – ohne teure Abonnements oder versteckte Kosten.*

</div>

---

## ✨ Features

- 🎭 **3 Kostenlose KI-Modelle integriert:**
  - **InstantID (SDXL)** (`InstantX/InstantID`): Generiert völlig neue Szenen passend zum Prompt bei gleichzeitig striktem biometrischem Gesichtserhalt.
  - **PhotoMaker V2** (`TencentARC/PhotoMaker-V2`): Konsistente Identität für ultra-hochauflösende Porträtaufnahmen mit feinsten Hautdetails.
  - **Direct FaceSwap** (`Dentro/face-swap`): Blitzschneller 1:1 Gesichts-Tausch auf kuratierte Editorial-Shootings (~7–9 Sekunden, ohne GPU-Quoten-Limit).
- 🪞 **Interaktiver Split-Screen Viewfinder:**
  - Vorher/Nachher-Vergleich per intuitivem Drag-Slider mit Live-Vorschau.
- 🎨 **Kuratierte High-End Editorial Motive:**
  - *Paris Fashion Week* (Pont Alexandre III, Golden Hour, Kodak Portra 400, Trenchcoat)
  - *Neon Noir Cyber-Editorial* (Tokyo Rain, Reflexionen, Cyan/Magenta Rimlight, Lederjacke)
  - *Monaco Yacht Riviera* (Old Money Luxury, Mittelmeer-Sonne, Leinenhemd, Bokeh)
  - *Met Gala Velvet & Gems* (Paparazzi-Blitz, Smaragd-Samt, High-Contrast Editorial)
- 🔒 **DSGVO & Zero-Retention (Privacy First):**
  - Hochgeladene Fotos werden flüchtig ausschließlich im Arbeitsspeicher (RAM) verarbeitet.
  - Keine persistente Speicherung, kein Modelltraining, keine Tracking-Datenbanken.
- 📱 **1-Click Direktexport & Sharing:**
  - Native Integration mit der Web Share API (direktes Speichern in iPhone/Android Fotos).
  - 1-Click Clipboard-Kopieren & hochauflösender JPG-Download.
- ⚙️ **Feinjustierung & Batching:**
  - Anpassbare Seitenverhältnisse: 4:5 (Portrait), 9:16 (Story), 1:1 (Square).
  - Batch-Größenwahl (1, 2 oder 4 Variationen) mit Galerie-Umschaltung.
  - Live-Warteschlangenanzeige für Hugging-Face Spaces.

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 15+](https://nextjs.org/) (App Router, Turbopack)
- **Sprache:** [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **AI-Pipeline:** [@gradio/client](https://www.npmjs.com/package/@gradio/client)
- **Icons:** [Lucide React](https://lucide.dev/)
- **Effekte:** [canvas-confetti](https://www.npmjs.com/package/canvas-confetti)

---

## 🚀 Schnellstart

### 1. Repository klonen

```bash
git clone https://github.com/h4real82/photo-faker.git
cd photo-faker
```

### 2. Abhängigkeiten installieren

```bash
npm install
```

### 3. Umgebungsvariablen (optional)

Kopiere die Vorlage `.env.example`:

```bash
cp .env.example .env.local
```

> **Hinweis:** Photo Faker funktioniert sofort **ohne** API-Schlüssel über die öffentlichen Hugging-Face Spaces. Ein optionaler kostenloser `HF_TOKEN` (erhältlich unter [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens)) erhöht deine Anfragen-Limits und verkürzt Wartezeiten auf ZeroGPU Spaces.

```env
HF_TOKEN=dein_hf_token_hier
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Entwicklungsserver starten

```bash
npm run dev
```

Öffne [http://localhost:3000](http://localhost:3000) in deinem Browser.

---

## 🏗️ Projektstruktur

```text
photo-faker/
├── app/
│   ├── api/
│   │   └── generate/
│   │       └── route.ts          # Multi-Model Hugging Face Gradio Pipeline
│   ├── globals.css               # Globale Styles & Darkroom Tokens
│   ├── layout.tsx                # App Shell & Metadaten
│   └── page.tsx                  # Studio Workbench, Split-Canvas & Model Selector
├── public/
│   ├── motifs/                   # Ziel-Editorials für Direct FaceSwap
│   │   ├── paris-fashion.jpg
│   │   ├── neon-noir.jpg
│   │   ├── monaco-yacht.jpg
│   │   └── met-gala.jpg
│   └── icons/                    # App Icons
├── .env.example                  # Umgebungsvariablen Vorlage
├── next.config.ts                # Next.js Konfiguration
├── tailwind.config.ts            # Tailwind Farbschema & Animationen
├── tsconfig.json                 # TypeScript Konfiguration
└── README.md                     # Dokumentation
```

---

## 🧠 Unterstützte KI-Modelle im Detail

| Modell | Space | Typ / Tag | Besonderheit |
| :--- | :--- | :--- | :--- |
| **InstantID (SDXL)** | `InstantX/InstantID` | **Gesichtserhalt 1:1** | Strikter biometrischer Gesichtserhalt auf neu generierte Szenen. |
| **FLUX.1 Schnell** | `black-forest-labs/FLUX.1-schnell` | **Beste Fotoqualität (Neues Gesicht)** | 12B Next-Gen Diffusionsmodell für höchste fotografische Güte und Lichtstimmung. |
| **Qwen-Image 2.1** | `Qwen/Qwen-Image-2.1` | **Top Textur & Details (Neues Gesicht)** | Alibaba Cloud Vision-KI für feinste Mikro-Poren, Hauttexturen und Schärfe. |
| **PhotoMaker V2** | `TencentARC/PhotoMaker-V2` | **Gute Ähnlichkeit & Style** | Konsistente Gesichts-Identität für hochauflösende Porträtaufnahmen. |
| **SDXL Lightning** | `ByteDance/SDXL-Lightning` | **Ultra-schnell (Ähnliche Züge)** | ByteDance 4-Step Turbo-Inferenz für sekundenschnelles Prototyping. |

---

## 📄 Lizenz

Dieses Projekt steht unter der [MIT-Lizenz](LICENSE).

---

<div align="center">
  Entwickelt mit ❤️ für photorealistische Porträts und uneingeschränkte Privatsphäre.
</div>
