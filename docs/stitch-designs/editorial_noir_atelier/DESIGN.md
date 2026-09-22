---
name: Editorial Noir Atelier
colors:
  surface: '#121317'
  surface-dim: '#121317'
  surface-bright: '#38393e'
  surface-container-lowest: '#0d0e12'
  surface-container-low: '#1a1b20'
  surface-container: '#1f1f24'
  surface-container-high: '#292a2e'
  surface-container-highest: '#343439'
  on-surface: '#e3e2e8'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e3e2e8'
  inverse-on-surface: '#2f3035'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#ffb95f'
  on-secondary: '#472a00'
  secondary-container: '#ee9800'
  on-secondary-container: '#5b3800'
  tertiary: '#ffb0cd'
  on-tertiary: '#640039'
  tertiary-container: '#f751a1'
  on-tertiary-container: '#570032'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#ffddb8'
  secondary-fixed-dim: '#ffb95f'
  on-secondary-fixed: '#2a1700'
  on-secondary-fixed-variant: '#653e00'
  tertiary-fixed: '#ffd9e4'
  tertiary-fixed-dim: '#ffb0cd'
  on-tertiary-fixed: '#3e0022'
  on-tertiary-fixed-variant: '#8c0053'
  background: '#121317'
  on-background: '#e3e2e8'
  surface-variant: '#343439'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.03em
  display-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.01em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.03em
  label-caps:
    fontFamily: Inter
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.1em
  hud-metric:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.5rem
  margin: 1.25rem
  margin-tablet: 2rem
  space-xxs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system channels an editorial darkroom elevated by bleeding-edge computational artistry. Inspired by high-fashion glossies, cinema post-production suites, and precision camera viewfinders, the aesthetic marries haute-couture restraint with radiant digital luminance. 

The visual voice is exclusive, transformative, and razor-sharp. Interfaces avoid toy-like AI tropes in favor of an opulent, studio-grade darkroom aesthetic. The experience relies on deep charcoal substrates that allow user imagery to take center stage, accented with micro-doses of crystalline violet, electric gold, and vivid magenta. Glass panels, subtle hairline borders, and tactile HUD reticles evoke luxury mechanical timepieces and bespoke camera hardware.

## Colors

The palette operates in strict darkness to prioritize photographic fidelity, luminosity, and high-impact accentuation.

- **Obsidian Dark Canvas (`#0B0C10`)**: The deepest canvas level, providing uncompromised contrast and OLED battery preservation.
- **Charcoal Surface (`#14161D`)**: The primary elevation tier for stacked sheets, bottom trays, and navigation docks.
- **Card Substrate (`#1F222E`)**: Semi-translucent elevated plane supporting glassmorphic blur and light refraction.
- **Electric Violet (`#8B5CF6`)**: Primary focus and generation trigger token, symbolizing generative AI mastery and visual refinement.
- **Electric Amber / Gold (`#F59E0B`)**: Secondary luxury metric indicating pro status, pristine fidelity scores, and identity preservation milestones.
- **Hyper Magenta (`#EC4899`)**: Tertiary artistic accent for editorial styles, creative filters, and dynamic color grading.
- **Hairline Border Chrome (`rgba(255, 255, 255, 0.08)`)**: Precision 1px outline for glass cards, buttons, and HUD brackets.
- **Hairline Active Border (`rgba(139, 92, 246, 0.4)`)**: Illuminating active edge for interactive components.

## Typography

Typography pairs the structural elegance of **Plus Jakarta Sans** for headlines and brand moments with the geometric precision of **Inter** for dense UI data, telemetry values, and fine micro-copy.

- Headlines feature tight letter-spacing to reinforce authority and cinematic magazine weight.
- Metadata and badges utilize `label-caps` in uppercase styling with extended letter-spacing (`+0.1em`) to replicate camera telemetry, ISO values, and f-stop readouts.
- Numerical values, preserve-status indicators, and render metrics remain strictly tabular to eliminate jitter during processing states.

## Layout & Spacing

The interface employs a mobile-first, edge-to-edge layout calibrated for one-handed thumb interaction during photo capture and composition review.

- **Grid Architecture**: Mobile layouts rely on a flexible 4-column structure with `1.25rem` screen margins and `0.75rem` internal gutters. On tablet viewports, the grid expands to 8 columns with fixed media preview sidebars.
- **Rhythm**: Built on a strict 4px/8px incremental rhythm. Viewfinder viewports maximize viewport surface by tucking toolbars into floating pill islands offset by `space-md` (`1rem`) from screen perimeters.
- **Bottom-Sheet Centric**: Complex generation parameters, prompt editors, and style pickers deploy as dynamic bottom sheets docked over the image preview with `1.25rem` horizontal padding.

## Elevation & Depth

Visual hierarchy leverages high-spec glassmorphism layered over impenetrable dark tones. Depth is communicated via frosted backdrops, luminance gradients, and razor-thin perimeter highlights rather than muddy drop shadows.

- **Ground Level (Base Canvas)**: Solid `#0B0C10`, non-reflective, pure backdrop for raw photography assets.
- **Level 1 (Viewfinder HUD / Dock)**: `#14161D` with 80% opacity, `backdrop-filter: blur(24px)`, and a 1px border rendered in `rgba(255, 255, 255, 0.08)`.
- **Level 2 (Active Control Panels & Floating Sheets)**: `#1F222E` with 72% opacity, `backdrop-filter: blur(32px)`, inner ambient glow `inset 0 1px 0 rgba(255, 255, 255, 0.12)`, and exterior soft drop shadow `0 20px 40px rgba(0, 0, 0, 0.6)`.
- **Level 3 (Interactive Focal States & Floating Badges)**: Tinted glass with a directional gradient fill (`rgba(139, 92, 246, 0.12)` to `rgba(20, 22, 29, 0.6)`), perimeter border of `rgba(139, 92, 246, 0.35)`, and a subtle outer violet flare `0 0 24px rgba(139, 92, 246, 0.25)`.

## Shapes

The design system embraces a high-end hybrid geometry: fully pill-shaped contours for interaction affordances and rounded forms for structured content displays.

- **Pill Primitives (`rounded-full`)**: Applied to all primary call-to-action buttons, chip pickers, status badges, floating camera triggers, and modal drag handles.
- **Containers & Glass Panels (`rounded-xl` / 1.5rem)**: Applied to generation preview cards, bottom drawer sheets, and style tiles.
- **Viewfinder Reticles**: Crisp, non-rounded internal crosshairs offset by rounded enclosing brackets (`0.5rem`), creating a stark mechanical contrast between software controls and lens optics.

## Components

### Buttons
- **Primary CTA (Generate / Enhance)**: Full pill geometry (`rounded-full`), saturated violet gradient (`linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)`), crisp white label (`label-lg`), supported by an ambient outer glow (`box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4)`). Active state applies a micro-scale transition of `0.98`.
- **Secondary (Modifier Actions)**: Pill geometry, obsidian-charcoal fill (`#14161D`), 1px white border (`rgba(255, 255, 255, 0.12)`), text rendered in high-clarity off-white (`#F9FAFB`).
- **Camera Shutter Trigger**: Concentric nested rings; outer ring 72px diameter with a 2px stroke (`rgba(255, 255, 255, 0.3)`), inner pill button 58px solid white with seamless reactive scaling on hold.

### Status Badges & HUD Indicators
- **Preservation Metric Badge ("100% Identity Preserved")**: Micro-pill capsule with high-contrast amber styling (`background: rgba(245, 158, 11, 0.12)`, `border: 1px solid rgba(245, 158, 11, 0.4)`), accompanied by a 6px pulsating amber led indicator dot and `hud-metric` typography.
- **Model / Quality Badge**: Frosted glass tag, 1px perimeter border, uppercase `label-caps` in semi-translucent violet (`#A78BFA`).

### Style & Montage Chips
- Pill-shaped selector chips with horizontal snap scrolling. Inactive state: `#14161D` with `rgba(255, 255, 255, 0.08)` border. Selected state: solid `#1F222E` with an electric violet border (`#8B5CF6`), high-contrast white text, and a vibrant micro-dot indicator.

### Input Fields & Prompt Entry
- Obsidian container (`#14161D`) with 16px radius, frosted glass blur (`blur(16px)`), and a 1px border. On focus, the border transitions smoothly to `rgba(139, 92, 246, 0.6)` with an inner specular highlight. Placeholder typography is muted slate (`#6B7280`).

### Viewfinder Preview Frame
- Full bleed viewport anchored by 4 corner reticles (2px wide, 12px length, colored in `rgba(255, 255, 255, 0.4)`). Floating telemetry overlays showcase focal ratio, resolution dimensions, and rendering seed numbers using `label-caps`.

### Cards (Preset & Editorial Montage)
- 3:4 aspect ratio cards enclosed in `#1F222E` frosted glass. Images are nested inside a 12px internal margin with corner radii conforming to `1rem`. Active cards feature an illuminated outer border that shifts from electric violet to hyper magenta.