# Bolt's Journal - Critical Performance Learnings

## 2025-05-18 - CSS Container Queries for Image Comparison Sliders
**Learning:** Measuring container width via `ref.current.clientWidth` inside React JSX during render/drag events triggers layout thrashing and React Compiler ref warnings.
**Action:** Use CSS Container Queries (`@container` on parent and `100cqw` width on sliced background image) to delegate slider clipping layout directly to the browser layout engine zero-overhead.
