# 009 — Mobile nav open/close animation

- **Status**: TODO
- **Commit**: 8625c96
- **Severity**: MEDIUM (missed opportunity)
- **Category**: Missed opportunities
- **Estimated scope**: 1 file (site.css), ~10 lines; 1 file (site.js), ~2 lines

## Problem

The mobile navigation menu has no open/close animation. The toggle adds `.mobile-open` to `.nav-links` and the menu appears/disappears instantly:

```js
/* site.js:70-72 */
toggle.addEventListener('click', function () {
  links.classList.toggle('mobile-open');
});
```

```css
/* site.css — no transition defined for .mobile-open */
/* The .nav-links.mobile-open state exists but is invisible in the CSS */
```

On mobile, the nav panel teleports open — a jarring change given the otherwise deliberate pace of the site. This is a spatially-connected UI element (the hamburger button triggers a panel) with no motion explaining where the panel came from.

## Target

A clip-path reveal from the top: the nav slides down from behind the header using `clip-path: inset()`. This approach avoids `height` animation (layout) and works without knowing the nav's height at animation time.

```css
/* target — add to site.css */

/* Base state: collapsed, clipped at bottom */
@media (max-width: 1024px) {
  .nav-links {
    clip-path: inset(0 0 100% 0);
    transition: clip-path 300ms cubic-bezier(0.32, 0.72, 0, 1);
  }
  .nav-links.mobile-open {
    clip-path: inset(0 0 0% 0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .nav-links { transition: none; }
}
```

Note: `cubic-bezier(0.32, 0.72, 0, 1)` is the `--ease-drawer` curve from the animation audit playbook. If Plan 004 (easing tokens) has been executed and added `--ease-drawer` as a token, use `var(--ease-drawer)` instead of the literal.

The `300ms` duration is within the "modals, drawers" budget (200–500ms).

**Important**: the existing `.nav-links` CSS sets `display: flex; gap: 28px` for desktop. The `@media (max-width: 1024px)` scope ensures `clip-path` only applies on mobile. Verify the existing CSS already hides the nav on mobile and shows it with `.mobile-open` — if it uses `display: none / flex` toggling instead of a visibility mechanism, a `clip-path` approach needs a visibility bridge:

```css
/* If the nav currently uses display:none, add: */
@media (max-width: 1024px) {
  .nav-links { display: flex; visibility: hidden; clip-path: inset(0 0 100% 0); transition: clip-path 300ms cubic-bezier(0.32, 0.72, 0, 1), visibility 0s 300ms; }
  .nav-links.mobile-open { visibility: visible; clip-path: inset(0 0 0% 0); transition: clip-path 300ms cubic-bezier(0.32, 0.72, 0, 1), visibility 0s 0s; }
}
```

Before implementing: inspect the existing `.nav-links` and `.nav-links.mobile-open` CSS carefully to understand which display mechanism is in use, and choose the appropriate variant above.

## Repo conventions to follow

- All motion in `site.css`.
- JS change is minimal: no animation logic in JS. Only the class toggle (already exists) drives it.
- Place the new `@media (max-width: 1024px)` motion block adjacent to (or merged with) the existing `@media (max-width: 1024px)` blocks already in the file.
- Easing token: `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)`. If Plan 004 added it, use the token.

## Steps

1. **Read the current mobile nav CSS carefully.** Find the `@media (max-width: 1024px)` section and the `.nav-links.mobile-open` rule to understand how the nav is currently shown/hidden (display toggle vs. visibility, absolute vs. in-flow).

2. **Based on findings from step 1**, apply the appropriate variant from the Target section:
   - If the nav uses `display: none → flex`: use the `visibility` bridge variant.
   - If the nav uses a different mechanism: adapt the clip-path approach to work with it.

3. **Add to site.css** inside `@media (max-width: 1024px)` (merge with existing block):
   ```css
   .nav-links {
     clip-path: inset(0 0 100% 0);
     transition: clip-path 300ms cubic-bezier(0.32, 0.72, 0, 1);
   }
   .nav-links.mobile-open {
     clip-path: inset(0 0 0% 0);
   }
   ```
   Add `visibility` bridge if needed (see step 2).

4. **Add to the `prefers-reduced-motion` block** (Plan 003 location):
   ```css
   @media (prefers-reduced-motion: reduce) {
     .nav-links { transition: none; }
   }
   ```

## Boundaries

- Do NOT change the `.nav-toggle` button behavior in JS.
- Do NOT add `aria-expanded` to the toggle in this plan — that's a separate accessibility concern.
- Do NOT animate to a specific pixel height — use `clip-path: inset()` to avoid height dependency.
- Do NOT use `max-height` animation — it requires guessing a max value and produces incorrect easing.

## Verification

- **Feel check** on mobile (DevTools device emulation or real device):
  - Tap the hamburger. Confirm the nav slides down from behind the header (clip-path reveal from top).
  - Tap again. Confirm it slides back up.
  - At DevTools 10% speed: confirm the clip-path animates from `inset(0 0 100% 0)` to `inset(0 0 0% 0)`.
  - Toggle `prefers-reduced-motion`. Confirm the nav opens instantly with no animation.
- **Done when**: the mobile nav reveals with a 300ms top-to-bottom reveal and collapses cleanly.
