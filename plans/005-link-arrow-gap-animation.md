# 005 — Fix `.link-arrow` gap animation (layout-triggering property)

- **Status**: TODO
- **Commit**: 8625c96
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 1 file (site.css), ~3 lines changed

## Problem

The `.link-arrow` component animates `gap` on hover:

```css
/* site.css:100 */
.link-arrow { gap: 8px; transition: gap .25s ease; }
.link-arrow:hover { gap: 14px; }
```

`gap` in a flex container triggers layout recalculation (the browser must re-flow the element) on every animation frame. It is not GPU-composited — it cannot run on the compositor thread and will drop frames under load. The visual intent is to widen the space between the text and the arrow icon when hovered.

## Target

Replace the `gap` animation with a `transform: translateX()` on the arrow SVG/span inside `.link-arrow`. This moves the icon on the compositor thread with no layout impact.

The arrow inside `.link-arrow` is the second child (an SVG or inline character). Apply a translate to it:

```css
/* target */
.link-arrow { gap: 8px; }
/* remove: transition: gap .25s ease; */
/* remove: .link-arrow:hover { gap: 14px; } */

.link-arrow > *:last-child { display: inline-block; transition: transform 250ms cubic-bezier(0.23, 1, 0.32, 1); }

@media (hover: hover) and (pointer: fine) {
  .link-arrow:hover > *:last-child { transform: translateX(6px); }
}
```

The `6px` translate approximates the visual effect of a gap growing from 8px to 14px (a 6px increase). This produces the same perceived motion without triggering layout.

Note: if Plan 004 (easing tokens) has already been executed, replace the cubic-bezier literal with `var(--ease-out)` and `var(--dur-ui)`.

## Repo conventions to follow

- All motion in `site.css`.
- The hover gating `@media (hover: hover) and (pointer: fine)` pattern is introduced by Plan 002. If Plan 002 already executed, add the hover rule to the existing gated block at the bottom of the file instead of creating a new `@media` block.
- The child selector `> *:last-child` targets whatever is last inside `.link-arrow` — an SVG arrow, a `→` character, or a span. Inspect the HTML to confirm what element it is. If the arrow is a specific class (e.g. `.arrow`, `.icon`), use that selector instead for clarity.

## Steps

1. **In `site.css`, find line 100**:
   ```css
   .link-arrow { font-family: var(--ff-mono); font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: var(--accent); display: inline-flex; align-items: center; gap: 8px; transition: gap .25s ease; }
   ```
   Remove `transition: gap .25s ease;` from it. Keep `gap: 8px`.

2. **Delete the hover rule** at the next line:
   ```css
   .link-arrow:hover { gap: 14px; }
   ```

3. **Add after the `.link-arrow` rule** (same location in file):
   ```css
   .link-arrow > *:last-child { display: inline-block; transition: transform 250ms cubic-bezier(0.23, 1, 0.32, 1); }
   ```

4. **Add the hover effect.** If Plan 002's `@media (hover: hover) and (pointer: fine)` block exists at the bottom of the file, add inside it:
   ```css
   .link-arrow:hover > *:last-child { transform: translateX(6px); }
   ```
   If that block does not exist yet, add a new one:
   ```css
   @media (hover: hover) and (pointer: fine) {
     .link-arrow:hover > *:last-child { transform: translateX(6px); }
   }
   ```

## Boundaries

- Do NOT change the gap value (8px) — the static gap must remain.
- Do NOT touch HTML.
- If the arrow icon is an SVG with `display: inline` by default, the `display: inline-block` in step 3 is needed for `transform` to apply. Do not remove it.
- Do NOT change the font, color, or letter-spacing on `.link-arrow`.

## Verification

- **Mechanical**: DevTools → Performance tab. Record 3 seconds while hovering in/out of a `.link-arrow`. In the flame chart, confirm no purple "Layout" or orange "Recalculate Style" events spike during the hover animation.
- **Feel check**: hover over a "Ver habitaciones →" or similar link-arrow link. Confirm the arrow visually moves right by ~6px. The movement should feel springy (strong ease-out).
- In DevTools Animations at 10% speed: confirm only the child element transforms; the text and container stay in place.
- **Done when**: no layout recalculation on hover, arrow still moves right on hover on desktop pointer devices.
