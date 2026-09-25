## 2025-05-18 - Accessibility for Custom Image Comparison Sliders
**Learning:** Custom mouse/touch draggable image comparison handles (`<div>`) are completely invisible to keyboard and screen reader users unless assigned `role="slider"`, `tabIndex={0}`, ARIA attributes (`aria-label`, `aria-valuenow`, `aria-valuemin`, `aria-valuemax`), and explicit arrow key handlers (`ArrowLeft`, `ArrowRight`, `Home`, `End`).
**Action:** When implementing custom comparison split handles or range sliders, always include full keyboard event listeners and slider ARIA roles.
