# 006 — Remove layout-triggering `padding` from header scroll transition

- **Status**: TODO
- **Commit**: 8625c96
- **Severity**: MEDIUM
- **Category**: Performance
- **Estimated scope**: 1 file (site.css), ~4 lines changed

## Problem

The site header transitions `padding` when the user scrolls past 40px:

```css
/* site.css:107 */
.site-header {
  padding: 18px 32px;
  transition: background .3s ease, padding .3s ease, box-shadow .3s ease;
}
.site-header.scrolled { padding-top: 12px; padding-bottom: 12px; }
```

Animating `padding` triggers a layout recalculation on every animation frame. This is a scroll-driven transition — it fires continuously as the user scrolls past the threshold. On lower-end devices this causes jank. The logo height transition has the same issue:

```css
/* site.css:111 */
.site-header .logo { height: 52px; transition: height .3s ease; }
.site-header.scrolled .logo { height: 40px; }
```

Animating `height` also triggers layout.

## Target

Replace the layout-triggering animations with compositable equivalents:

- **Padding**: instead of animating `padding`, keep the smaller padding always applied and use `transform: scaleY()` on the header — or simply remove the padding animation and let it jump instantly (the background blur and box-shadow transition is already enough to signal the state change).
- **Logo height**: replace `height` animation with `transform: scale()` on the logo image.

Simplest correct approach (no markup changes, no structural risk):

```css
/* target site.css:107 */
.site-header {
  padding: 18px 32px;
  transition: background .3s cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow .3s cubic-bezier(0.25, 0.1, 0.25, 1);
  /* padding removed from transition list */
}
.site-header.scrolled { padding-top: 12px; padding-bottom: 12px; } /* padding change is instant — imperceptible at this speed */

/* target site.css:111 */
.site-header .logo {
  height: 52px;
  transform-origin: left center;
  transition: transform .3s cubic-bezier(0.25, 0.1, 0.25, 1);
}
.site-header.scrolled .logo { transform: scale(0.77); } /* 40/52 ≈ 0.77 */
```

Note: if Plan 004 (easing tokens) has already been executed, replace `cubic-bezier(0.25, 0.1, 0.25, 1)` with `var(--ease-ui)` and `.3s` with `var(--dur-panel)`.

`transform-origin: left center` on the logo ensures it scales from the left (aligns with the header edge) rather than center.

## Repo conventions to follow

- All motion in `site.css`.
- No HTML changes.
- No new dependencies.
- Exemplar of compositor-safe animation: `.room-card { transition: transform .3s ease, box-shadow .3s ease; }` — transform and box-shadow are both compositor-safe.

## Steps

1. **In `site.css`, find the `.site-header` rule** (around line 107). Remove `padding` from its `transition` list. The result:
   ```css
   .site-header { transition: background .3s cubic-bezier(0.25, 0.1, 0.25, 1), box-shadow .3s cubic-bezier(0.25, 0.1, 0.25, 1); }
   ```
   (Or with tokens: `transition: background var(--dur-panel) var(--ease-ui), box-shadow var(--dur-panel) var(--ease-ui);`)

2. **Find `.site-header .logo`** (around line 111). Replace `transition: height .3s ease` with:
   ```css
   .site-header .logo { height: 52px; width: auto; transform-origin: left center; transition: transform .3s cubic-bezier(0.25, 0.1, 0.25, 1); }
   ```

3. **Find `.site-header.scrolled .logo`** (a few lines below). Replace `height: 40px` with:
   ```css
   .site-header.scrolled .logo { transform: scale(0.77); }
   ```
   Delete the `height: 40px` declaration from that rule. Keep any other properties that rule contains.

## Boundaries

- Do NOT change `padding` values — only remove them from the `transition` list.
- Do NOT touch JS (the `.scrolled` class is added by `site.js:onScroll()` — leave that untouched).
- Do NOT add `will-change: transform` — it's only beneficial when the transition is known to be frequent and the element is large; a header logo is neither.
- Do NOT change the `padding` values on the scrolled state — the instant padding change is acceptable and imperceptible.

## Verification

- **Mechanical**: DevTools → Performance tab. Record 3 seconds while slowly scrolling past the 40px threshold. In the flame chart, confirm no "Layout" events fire during the header transition. (Background and box-shadow transitions should appear as Paint events — not Layout.)
- **Feel check**:
  - Scroll past 40px. Confirm the header background blurs and box-shadow appears smoothly.
  - Confirm the logo visually shrinks. Confirm it scales from the left edge (not center).
  - Confirm the header padding jump is not visible (it's instant but only a few pixels — imperceptible).
- **Done when**: no Layout recalculation during header state change, logo shrink is smooth.
