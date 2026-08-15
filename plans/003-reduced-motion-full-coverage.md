# 003 — Full `prefers-reduced-motion` coverage

- **Status**: TODO
- **Commit**: 8625c96
- **Severity**: HIGH
- **Category**: Accessibility
- **Estimated scope**: 1 file (site.css), ~20 lines added

## Problem

The site has `prefers-reduced-motion` handling for exactly one element:

```css
/* site.css:193 — only existing reduced-motion rule */
@media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } }
```

All other animated elements — buttons, cards, header, social FAB, lightbox, thumbnails — animate at full motion regardless of the user's OS accessibility setting. Users who have requested reduced motion (due to vestibular disorders, epilepsy, or preference) see all these transitions running.

The rule for reduced motion is: **keep opacity/color transitions** (they aid comprehension), **remove or drastically reduce position and scale movement**.

Elements currently missing reduced-motion coverage:

```css
/* site.css:86 */
.btn { transition: transform .25s ease, background .25s ease, color .25s ease, border-color .25s ease; }
.btn:hover { transform: translateY(-2px); }

/* site.css:107 */
.site-header { transition: background .3s ease, padding .3s ease, box-shadow .3s ease; }

/* site.css:173 */
.room-card { transition: transform .3s ease, box-shadow .3s ease; }
.room-card:hover { transform: translateY(-6px); }

/* site.css:176 */
.room-card .ph img { transition: transform .6s ease; }

/* site.css:251,263 */
.seg-card img, .exp-tile img { transition: transform .7s ease; }

/* site.css:410 */
.social-fab a { transition: transform .2s ease; }

/* site.css:433 */
.lb { transition: opacity .25s ease; }

/* site.css:506 */
.bfeat { transition: transform .3s ease, box-shadow .3s ease; }
```

## Target

Extend the existing `prefers-reduced-motion: reduce` block to cover all animated elements. Remove transform movement; keep background, opacity, color, and box-shadow transitions (since shadows aid depth perception without causing vestibular issues — but keep them short).

```css
/* target — replace the single-line block at site.css:193 with this expanded version */
@media (prefers-reduced-motion: reduce) {
  /* existing */
  .reveal { opacity: 1; transform: none; transition: none; }

  /* buttons: keep color/bg feedback, drop the lift */
  .btn { transition: background .15s ease, color .15s ease, border-color .15s ease; }
  .btn:hover { transform: none; }
  .btn:active { transform: none; }

  /* header: keep background blur, drop padding animation */
  .site-header { transition: background .15s ease, box-shadow .15s ease; }

  /* cards: keep shadow (depth cue), drop lift and image zoom */
  .room-card { transition: box-shadow .15s ease; }
  .room-card:hover { transform: none; }
  .room-card .ph img { transition: none; }
  .room-card:hover .ph img { transform: none; }

  /* segment and experience tiles: drop image zoom */
  .seg-card img { transition: none; }
  .seg-card:hover img { transform: none; }
  .exp-tile img { transition: none; }
  .exp-tile:hover img { transform: none; }

  /* social FAB: drop lift/scale */
  .social-fab a { transition: opacity .15s ease; }
  .social-fab a:hover { transform: none; }

  /* lightbox: keep fade (needed to show/hide) but shorten it */
  .lb { transition: opacity .15s ease; }

  /* booking features: drop lift */
  .bfeat { transition: box-shadow .15s ease; }
  .bfeat:hover { transform: none; }
}
```

## Repo conventions to follow

- The existing reduced-motion block is at `site.css:193`, a single line. Expand it in place — same location, multi-line.
- The codebase has no `prefers-reduced-motion` in JS. This plan is CSS-only.
- If Plan 002 (hover touch gating) was already executed and some `:hover` transform rules were moved inside `@media (hover: hover)`, the `.btn:hover { transform: none; }` and similar lines in this block still need to be here — both `@media` blocks apply: hover gating restricts to pointer devices; reduced-motion restricts further on those devices.

## Steps

1. **In `site.css`, find line 193**:
   ```css
   @media (prefers-reduced-motion: reduce) { .reveal { opacity: 1; transform: none; transition: none; } }
   ```

2. **Replace it** with the following multi-line block:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .reveal { opacity: 1; transform: none; transition: none; }
     .btn { transition: background .15s ease, color .15s ease, border-color .15s ease; }
     .btn:hover { transform: none; }
     .btn:active { transform: none; }
     .site-header { transition: background .15s ease, box-shadow .15s ease; }
     .room-card { transition: box-shadow .15s ease; }
     .room-card:hover { transform: none; }
     .room-card .ph img { transition: none; }
     .room-card:hover .ph img { transform: none; }
     .seg-card img { transition: none; }
     .seg-card:hover img { transform: none; }
     .exp-tile img { transition: none; }
     .exp-tile:hover img { transform: none; }
     .social-fab a { transition: opacity .15s ease; }
     .social-fab a:hover { transform: none; }
     .lb { transition: opacity .15s ease; }
     .bfeat { transition: box-shadow .15s ease; }
     .bfeat:hover { transform: none; }
   }
   ```

## Boundaries

- Do NOT touch HTML or JS files.
- Do NOT remove opacity transitions — they're comprehension aids, not decoration.
- Do NOT zero out `.lb { transition: none }` — the lightbox must still fade in/out, just faster.
- The `:active` press feedback from Plan 001 uses `transform: scale(0.97)`. This plan adds `.btn:active { transform: none; }` to suppress it under reduced-motion — this is correct per the accessibility spec (press feedback is decoration when the user has opted out of motion).

## Verification

- **Mechanical**: In DevTools → Rendering panel → Emulate CSS media feature `prefers-reduced-motion` → set to `reduce`.
- **Feel check**:
  - Scroll the page. Confirm `.reveal` elements appear instantly (no slide-up).
  - Hover over a button. Confirm no lift. Confirm background color still changes.
  - Click a button. Confirm no scale.
  - Hover over a room card. Confirm no lift. Confirm the image does not zoom.
  - Scroll the header. Confirm background blur appears but no padding animation.
  - Open the lightbox. Confirm it fades in (opacity transition remains).
- **Done when**: under `prefers-reduced-motion: reduce`, all position/scale motion is gone and only opacity/color/shadow feedback remains.
