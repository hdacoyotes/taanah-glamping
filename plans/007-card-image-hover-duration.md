# 007 — Shorten and fix card image hover transition durations

- **Status**: TODO
- **Commit**: 8625c96
- **Severity**: MEDIUM
- **Category**: Easing & duration
- **Estimated scope**: 1 file (site.css), ~3 lines changed

## Problem

Three image-inside-card hover transitions run too long with the wrong easing:

```css
/* site.css:176 — room card photo */
.room-card .ph img { transition: transform .6s ease; }

/* site.css:251 — segment card */
.seg-card img { transition: transform .7s ease; }

/* site.css:263 — experience tile */
.exp-tile img { transition: transform .7s ease; }
```

- **Duration**: 600–700ms is double the correct budget for hover-triggered animations. The image feels sluggish to finish zooming after the user's pointer has already moved on. By the time the animation completes, the hover state may have ended, producing a visible zoom-in/zoom-out cycle even on a quick hover.
- **Easing**: `ease` (CSS built-in: `cubic-bezier(0.25, 0.1, 0.25, 1)`) starts slow on exit. For an image that zooms in on hover and must zoom back out when the pointer leaves, the exit (`ease-out` applied in reverse = effectively `ease-in`) feels sticky. A strong `ease-out` (`cubic-bezier(0.23, 1, 0.32, 1)`) in both directions feels more physically honest.

## Target

Reduce all three to 400ms with `--ease-out`. This is within the "marketing" budget for image reveals while staying responsive enough to track hover state changes.

```css
/* target */
.room-card .ph img { transition: transform 400ms cubic-bezier(0.23, 1, 0.32, 1); }
.seg-card img { transition: transform 400ms cubic-bezier(0.23, 1, 0.32, 1); }
.exp-tile img { transition: transform 400ms cubic-bezier(0.23, 1, 0.32, 1); }
```

Note: if Plan 004 (easing tokens) has been executed before this one, use `var(--ease-out)` in place of the cubic-bezier literal:

```css
.room-card .ph img { transition: transform 400ms var(--ease-out); }
.seg-card img { transition: transform 400ms var(--ease-out); }
.exp-tile img { transition: transform 400ms var(--ease-out); }
```

## Repo conventions to follow

- All motion in `site.css`.
- No HTML changes, no JS changes.
- These three rules should look identical (same duration, same curve) since they serve the same UX purpose — hover image reveal.

## Steps

1. **Find line ~176** in `site.css`:
   ```css
   .room-card .ph img { width: 100%; height: 100%; object-fit: cover; transition: transform .6s ease; }
   ```
   Replace `transition: transform .6s ease` with `transition: transform 400ms cubic-bezier(0.23, 1, 0.32, 1)`.

2. **Find line ~251**:
   ```css
   .seg-card img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; transition: transform .7s ease; }
   ```
   Replace `transition: transform .7s ease` with `transition: transform 400ms cubic-bezier(0.23, 1, 0.32, 1)`.

3. **Find line ~263**:
   ```css
   .exp-tile img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0; transition: transform .7s ease; }
   ```
   Replace `transition: transform .7s ease` with `transition: transform 400ms cubic-bezier(0.23, 1, 0.32, 1)`.

> Line numbers are as of commit 8625c96. Locate by selector if they've shifted.

## Boundaries

- Do NOT change `transition` on `.room-card` itself (the card lift) — that rule is separate and handled by Plan 004.
- Do NOT change the scale values in the `:hover` rules (1.06, 1.05, 1.07) — Plan 008 handles unifying those.
- Do NOT touch HTML.

## Verification

- **Feel check** (DevTools Animations at 10% speed):
  - Hover over a room card. The image should zoom in within about 4 "real-time seconds" at 10% speed. At normal speed it should feel like a smooth, decisive reveal — not sluggish.
  - Quickly hover in and out. Confirm the zoom reverses cleanly without feeling sticky mid-way.
  - Repeat for a segment card and an experience tile. Confirm all three feel identical.
- **Done when**: all three image zoom transitions complete in ~400ms at normal speed with a strong ease-out curve.
