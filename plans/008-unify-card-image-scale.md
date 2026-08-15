# 008 — Unify card image hover scale values

- **Status**: TODO
- **Commit**: 8625c96
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 file (site.css), ~3 lines changed

## Problem

The three card types that zoom their background image on hover all use slightly different scale values:

```css
/* site.css:177 */
.room-card:hover .ph img { transform: scale(1.06); }

/* site.css:252 */
.seg-card:hover img { transform: scale(1.05); }

/* site.css:264 */
.exp-tile:hover img { transform: scale(1.07); }
```

`1.05`, `1.06`, `1.07` — a three-way inconsistency with no design intent behind the differences. They were likely set independently at different times. On a page like `habitaciones.html` where room cards and segment cards appear together, the difference is visible when both are hovered in sequence.

## Target

Unify to `scale(1.05)` — the most conservative value, which avoids the image ever revealing its edges on smaller cards, and reads as intentional restraint rather than the slight excess of 1.06–1.07.

```css
/* target */
.room-card:hover .ph img { transform: scale(1.05); }
.seg-card:hover img { transform: scale(1.05); }
.exp-tile:hover img { transform: scale(1.05); }
```

Note: if Plan 002 (hover touch gating) has been executed, these rules will have been moved inside `@media (hover: hover) and (pointer: fine)`. Edit them there.

## Repo conventions to follow

- All motion in `site.css`.
- No HTML changes.
- If Plan 002 is done: these rules live inside the `@media (hover: hover) and (pointer: fine)` block at the bottom of `site.css`.
- If Plan 002 is NOT done: these rules are at their original locations (~lines 177, 252, 264).

## Steps

1. Locate `.room-card:hover .ph img` (either at ~line 177 or inside the hover-gated block). Change `scale(1.06)` to `scale(1.05)`.

2. Locate `.seg-card:hover img`. Change `scale(1.05)` — already correct, no change needed.

3. Locate `.exp-tile:hover img`. Change `scale(1.07)` to `scale(1.05)`.

## Boundaries

- Do NOT change any other property on these rules.
- Do NOT change the `.room-card:hover` lift rule (translateY(-6px)) — that's a separate finding.
- Do NOT touch HTML or JS.

## Verification

- **Feel check**: open `habitaciones.html`. Hover over a room card, then hover over a segment card. Confirm the image zoom feels identical in both (same scale, same speed after Plan 007 runs).
- On `index.html`, hover over an experience tile. Confirm same zoom as the cards.
- **Done when**: all three card types produce the same image zoom magnitude.
