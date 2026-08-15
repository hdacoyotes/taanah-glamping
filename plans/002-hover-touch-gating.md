# 002 — Gate all hover transforms with `(hover: hover) and (pointer: fine)`

- **Status**: TODO
- **Commit**: 8625c96
- **Severity**: HIGH
- **Category**: Accessibility
- **Estimated scope**: 1 file (site.css), ~15 lines moved/wrapped

## Problem

Every hover transform on the site fires on touch devices. On mobile, `:hover` triggers on the first tap and persists until the user taps elsewhere. The result:

- Tapping a room card causes it to jump up 6px **before** navigating — a visible, disorienting lift.
- Tapping a button causes it to lift 2px before the click registers.
- Tapping a segment card zooms its image before navigation.

Affected rules:

```css
/* site.css:89 */
.btn:hover { transform: translateY(-2px); }

/* site.css:174 */
.room-card:hover { transform: translateY(-6px); box-shadow: 0 30px 60px -30px rgba(37,35,30,0.4); }

/* site.css:177 */
.room-card:hover .ph img { transform: scale(1.06); }

/* site.css:252 */
.seg-card:hover img { transform: scale(1.05); }

/* site.css:264 */
.exp-tile:hover img { transform: scale(1.07); }

/* site.css:334 */
.tp-swatches button:hover { transform: scale(1.1); }

/* site.css:411 */
.social-fab a:hover { transform: translateY(-3px) scale(1.06); }

/* site.css:446 */
.lb-prev:hover, .lb-next:hover { transform: translateY(-50%) scale(1.07); }

/* site.css:507 */
.bfeat:hover { transform: translateY(-5px); box-shadow: 0 24px 48px -28px rgba(37,35,30,0.4); }
```

## Target

Wrap all transform-based `:hover` rules in `@media (hover: hover) and (pointer: fine)`. This media query is true only on devices with a real pointer (mouse/trackpad) that supports hover — false on touch-only screens.

Non-transform hover rules (color, background, opacity changes) can stay outside the gate — they are useful on touch (tapping and seeing a color change is fine). Only movement and scale need gating.

```css
/* target — example pattern */
@media (hover: hover) and (pointer: fine) {
  .btn:hover { transform: translateY(-2px); }

  .room-card:hover { transform: translateY(-6px); box-shadow: 0 30px 60px -30px rgba(37,35,30,0.4); }
  .room-card:hover .ph img { transform: scale(1.06); }

  .seg-card:hover img { transform: scale(1.05); }

  .exp-tile:hover img { transform: scale(1.07); }

  .tp-swatches button:hover { transform: scale(1.1); }

  .social-fab a:hover { transform: translateY(-3px) scale(1.06); }

  .lb-prev:hover, .lb-next:hover { transform: translateY(-50%) scale(1.07); }

  .bfeat:hover { transform: translateY(-5px); box-shadow: 0 24px 48px -28px rgba(37,35,30,0.4); }
}
```

Rules that must stay ungated (color, background, underline changes):
- `.btn-primary:hover { background: var(--bronce-2); }` — keep outside
- `.btn-dark:hover { background: var(--tinta); }` — keep outside
- `.btn-ghost:hover { background: var(--pizarra); color: var(--bone); }` — keep outside
- `.f-col a:hover { color: var(--bone); }` — keep outside
- `.nav-links a:hover::after { width: 100%; }` — keep outside (underline, not movement)
- `.link-arrow:hover { gap: 14px; }` — keep outside (layout, Plan 005 handles this separately)

## Repo conventions to follow

- All motion lives in `site.css`.
- The codebase has one existing `@media` block pattern: `@media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } }` on a single line (site.css:193).
- For this plan, the block will be multi-line since it wraps many rules. Place it as a grouped block near the bottom of site.css, before the last `@media` blocks, with a comment header.
- Do NOT scatter individual media query wrappers per rule — consolidate all gated hover rules into ONE `@media (hover: hover) and (pointer: fine)` block for maintainability.

## Steps

1. **In `site.css`**, find the following lines and remove (delete) the transform-only part of each `:hover` rule from its current location. Leave non-transform properties (background, color) in place. The rules to remove from their current location:

   - Line ~89: `.btn:hover { transform: translateY(-2px); }` — remove entire rule
   - Line ~174: `.room-card:hover { transform: translateY(-6px); box-shadow: 0 30px 60px -30px rgba(37,35,30,0.4); }` — remove entire rule
   - Line ~177: `.room-card:hover .ph img { transform: scale(1.06); }` — remove entire rule
   - Line ~252: `.seg-card:hover img { transform: scale(1.05); }` — remove entire rule
   - Line ~264: `.exp-tile:hover img { transform: scale(1.07); }` — remove entire rule
   - Line ~334: `.tp-swatches button:hover { transform: scale(1.1); }` — remove entire rule
   - Line ~411: `.social-fab a:hover { transform: translateY(-3px) scale(1.06); }` — remove entire rule
   - Line ~446: `.lb-prev:hover, .lb-next:hover { transform: translateY(-50%) scale(1.07); }` — remove entire rule
   - Line ~507: `.bfeat:hover { transform: translateY(-5px); box-shadow: 0 24px 48px -28px rgba(37,35,30,0.4); }` — remove entire rule

   > Note: `.lb-prev` and `.lb-next` set `transform: translateY(-50%)` as their base position (vertical centering). Their `:hover` adds `scale(1.07)` on top. After removing the hover rule the base `translateY(-50%)` on the non-hover rule must remain intact.

2. **At the bottom of `site.css`**, before the closing of the file, add:

   ```css
   /* —— Hover transforms — desktop pointer only —— */
   @media (hover: hover) and (pointer: fine) {
     .btn:hover { transform: translateY(-2px); }
     .room-card:hover { transform: translateY(-6px); box-shadow: 0 30px 60px -30px rgba(37,35,30,0.4); }
     .room-card:hover .ph img { transform: scale(1.06); }
     .seg-card:hover img { transform: scale(1.05); }
     .exp-tile:hover img { transform: scale(1.07); }
     .tp-swatches button:hover { transform: scale(1.1); }
     .social-fab a:hover { transform: translateY(-3px) scale(1.06); }
     .lb-prev:hover, .lb-next:hover { transform: translateY(-50%) scale(1.07); }
     .bfeat:hover { transform: translateY(-5px); box-shadow: 0 24px 48px -28px rgba(37,35,30,0.4); }
   }
   ```

   > Line numbers are as of commit 8625c96. Locate by selector if line numbers have drifted.

## Boundaries

- Do NOT move color/background `:hover` rules — only transform-related rules.
- Do NOT touch HTML files.
- Do NOT remove or modify the existing `@media (prefers-reduced-motion: reduce)` block.
- If `.lb-prev` or `.lb-next` has a base `transform: translateY(-50%)` on its non-hover rule, do not touch that — only the `:hover` scale goes inside the gated block.

## Verification

- **Feel check on desktop**: open the site, hover over a room card. Confirm it lifts and the image zooms. Hover over a CTA button. Confirm the lift.
- **Feel check on mobile**: open DevTools, toggle device emulation to any mobile device (iPhone/Pixel). Tap a room card. Confirm it does NOT lift before navigation. Tap a CTA button. Confirm it does NOT lift.
- **Alternatively**: in DevTools → Sensors → Emulate touch. Reload page. Tap a room card.
- **Done when**: hover transforms appear on mouse devices and are invisible on touch devices.
