## 2025-05-18 - Interactive Image Comparison Slider Accessibility
**Learning:** Custom mouse/touch drag comparison sliders in photo studio interfaces are completely invisible and unnavigable for screen reader and keyboard users unless given explicit `role="slider"`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`, and keyboard event handlers (`ArrowLeft`, `ArrowRight`, `Home`, `End`).
**Action:** Always wrap interactive image comparison drag handles with full slider ARIA roles and keyboard event handlers to allow 5% increment steps for keyboard navigation.
