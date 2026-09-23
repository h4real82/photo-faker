## 2025-05-18 - Keyboard & Screen Reader Accessibility for Image Comparison Sliders
**Learning:** Interactive comparison handles (e.g. before/after image split sliders) built with mouse/touch drag listeners often lack keyboard focus and ARIA semantics, leaving keyboard and screen-reader users unable to compare images.
**Action:** Always wrap comparison handles with `role="slider"`, `tabIndex={0}`, `aria-valuenow`, `aria-valuemin`/`max`, and keydown handlers (`ArrowLeft`/`ArrowRight`) to provide accessible keyboard navigation.
