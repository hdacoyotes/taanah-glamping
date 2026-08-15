# 001 — Add press feedback to all interactive buttons

- **Status**: TODO
- **Commit**: 8625c96
- **Severity**: HIGH
- **Category**: Physicality & origin
- **Estimated scope**: 1 file (site.css), ~20 lines added

## Problem

No interactive element in the site has `:active` press feedback. When a user taps or clicks any button, the UI gives zero tactile confirmation. On mobile this is especially jarring — the finger lifts and nothing happened. This violates the physicality rule: a press is a physical event and must be reflected in the interface.

Affected elements:

```css
/* site.css:86-89 — current .btn */
.btn {
  transition: transform .25s ease, background .25s ease, color .25s ease, border-color .25s ease;
}
.btn:hover { transform: translateY(-2px); }
/* NO :active rule exists */
```

```css
/* site.css:410-411 — current .social-fab */
.social-fab a { transition: transform .2s ease; }
.social-fab a:hover { transform: translateY(-3px) scale(1.06); }
/* NO :active rule exists */
```

```css
/* site.css:440 — current lightbox buttons */
.lb button { transition: background .2s ease, transform .2s ease; }
/* NO :active rule exists */
```

## Target

Add `:active` press states to every tappable element. The scale must be subtle (0.95–0.98 range). The transition must be fast (100–160ms) with `ease-out` so the response feels snappy, not sluggish.

```css
/* target — add after .btn:hover */
.btn:active {
  transform: scale(0.97);
  transition-duration: 120ms;
}

/* target — add after .social-fab a:hover */
.social-fab a:active {
  transform: scale(0.96);
  transition-duration: 120ms;
}

/* target — add after .lb button:hover */
.lb button:active {
  transform: scale(0.94);
  transition-duration: 100ms;
}

/* target — add after .tp-swatches button:hover */
.tp-swatches button:active {
  transform: scale(0.94);
  transition-duration: 100ms;
}

/* target — add after .bfeat:hover */
.bfeat:active {
  transform: scale(0.99) translateY(-2px);
  transition-duration: 120ms;
}
```

Note: `.btn:active` overrides the hover `translateY(-2px)` — this is intentional. Press wins over lift.

## Repo conventions to follow

- All motion lives in `site.css`. No JS animation.
- Each rule is on a single line (the codebase style). Only break to multiple lines if the declaration is complex.
- Place `:active` rules immediately after their matching `:hover` rule.
- No new dependencies.
- Exemplar of co-located hover/active pattern to imitate (doesn't exist yet — this plan creates the pattern).

## Steps

1. **In `site.css`, after line 89** (`.btn:hover { transform: translateY(-2px); }`), add:
   ```css
   .btn:active { transform: scale(0.97); transition-duration: 120ms; }
   ```

2. **After line 411** (`.social-fab a:hover { transform: translateY(-3px) scale(1.06); }`), add:
   ```css
   .social-fab a:active { transform: scale(0.96); transition-duration: 120ms; }
   ```

3. **After line 441** (`.lb button:hover { ... }`), add:
   ```css
   .lb button:active { transform: scale(0.94); transition-duration: 100ms; }
   ```

4. **After line 334** (`.tp-swatches button:hover { transform: scale(1.1); }`), add:
   ```css
   .tp-swatches button:active { transform: scale(0.94); transition-duration: 100ms; }
   ```

5. **After line 507** (`.bfeat:hover { transform: translateY(-5px); ... }`), add:
   ```css
   .bfeat:active { transform: scale(0.99) translateY(-2px); transition-duration: 120ms; }
   ```

> **Line numbers are as of commit 8625c96.** If the numbers don't match the code you find, locate by the selector name instead and place `:active` immediately after the matching `:hover` rule.

## Boundaries

- Do NOT touch HTML files.
- Do NOT change `:hover` values — only add `:active` rules.
- Do NOT add `:active` to `.nav-links a` (the underline hover is decorative, not a pressable element in the button sense).
- Do NOT change `.room-card:active` — the card lift is decorative, not a button.

## Verification

- **Mechanical**: open the site in a browser, DevTools → Animations panel, set playback to 10%.
- **Feel check**:
  - Click any `.btn` (e.g. "Reservar" CTA). Confirm it scales to ~0.97 on mousedown and springs back on mouseup. In slow motion the scale should be instant on press, spring on release.
  - On mobile (or DevTools device emulation): tap a button. The scale should confirm the tap before navigation occurs.
  - Tap a social FAB icon. Confirm scale-down on press.
  - Tap a lightbox close/prev/next button. Confirm the scale is perceptible but not jarring.
  - Toggle `prefers-reduced-motion` (DevTools → Rendering). Confirm the `:active` scale still works — `:active` is a state, not an animation, so it must remain even in reduced-motion mode. (Plan 003 handles reduced-motion separately; `:active` is feedback, not decoration, and must be kept.)
- **Done when**: every button on the site visually compresses on press in both desktop click and mobile tap.
