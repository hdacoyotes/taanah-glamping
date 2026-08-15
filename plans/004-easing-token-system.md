# 004 — Introduce easing tokens and consolidate durations

- **Status**: TODO
- **Commit**: 8625c96
- **Severity**: HIGH
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 file (site.css), ~40 lines edited

## Problem

The site has no shared easing or duration tokens. Every transition is hand-typed with a different value. This makes the motion feel incoherent — each component has its own personality — and makes future edits require hunting through the whole file.

Current state:

```css
/* site.css:86 — buttons */
transition: transform .25s ease, background .25s ease, color .25s ease, border-color .25s ease;

/* site.css:100 — link-arrow */
transition: gap .25s ease;

/* site.css:107 — header */
transition: background .3s ease, padding .3s ease, box-shadow .3s ease;

/* site.css:111 — logo */
transition: height .3s ease;

/* site.css:117 — nav underline */
transition: width .25s ease;

/* site.css:138 — footer links */
transition: color .2s ease;

/* site.css:173 — room-card lift */
transition: transform .3s ease, box-shadow .3s ease;

/* site.css:176 — room-card image */
transition: transform .6s ease;

/* site.css:191 — .reveal entrance */
transition: opacity .8s cubic-bezier(.2,.7,.2,1), transform .8s cubic-bezier(.2,.7,.2,1);

/* site.css:251 — seg-card image */
transition: transform .7s ease;

/* site.css:263 — exp-tile image */
transition: transform .7s ease;

/* site.css:333 — swatch buttons */
transition: transform .2s ease;

/* site.css:342 — toggle switch */
transition: background .2s ease;

/* site.css:344 — toggle knob */
transition: transform .2s ease;

/* site.css:410 — social FAB */
transition: transform .2s ease;

/* site.css:425 — gallery thumbnails */
transition: transform .4s ease, opacity .3s ease;

/* site.css:433 — lightbox */
transition: opacity .25s ease;

/* site.css:440 — lightbox buttons */
transition: background .2s ease, transform .2s ease;

/* site.css:506 — bfeat card */
transition: transform .3s ease, box-shadow .3s ease;
```

8 distinct durations (.2s, .25s, .3s, .35s, .4s, .6s, .7s, .8s), zero named easing curves. The `.reveal` entrance uses `cubic-bezier(.2,.7,.2,1)` — a strong ease-out — as a one-off.

## Target

Add three easing tokens and a duration scale to `:root`. Replace all hand-typed values with tokens. Result: one place to change a curve, all components update.

Token definitions (exact values from the animation audit playbook — do not approximate):

```css
/* target — add to :root in site.css */
--ease-out: cubic-bezier(0.23, 1, 0.32, 1);      /* strong ease-out: entrances, hover lifts */
--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);  /* strong ease-in-out: on-screen movement */
--ease-ui: cubic-bezier(0.25, 0.1, 0.25, 1);     /* standard CSS ease: color/bg changes */

--dur-fast: 160ms;   /* button press, micro-interactions */
--dur-ui: 250ms;     /* hover transitions, underlines */
--dur-panel: 300ms;  /* cards, header, panels */
--dur-reveal: 800ms; /* marketing entrances (kept long — this is marketing content) */
```

Replacement map:

| Current | Token replacement |
|---------|------------------|
| `.btn` transform/bg/color/border | `transform var(--dur-ui) var(--ease-out), background var(--dur-ui) var(--ease-ui), color var(--dur-ui) var(--ease-ui), border-color var(--dur-ui) var(--ease-ui)` |
| `.link-arrow` gap | `gap var(--dur-ui) var(--ease-ui)` |
| `.site-header` bg/padding/shadow | `background var(--dur-panel) var(--ease-ui), padding var(--dur-panel) var(--ease-ui), box-shadow var(--dur-panel) var(--ease-ui)` |
| `.site-header .logo` height | `height var(--dur-panel) var(--ease-ui)` |
| `.nav-links a::after` width | `width var(--dur-ui) var(--ease-out)` |
| `.f-col a` color | `color var(--dur-fast) var(--ease-ui)` |
| `.room-card` transform/shadow | `transform var(--dur-panel) var(--ease-out), box-shadow var(--dur-panel) var(--ease-out)` |
| `.room-card .ph img` transform | `transform 400ms var(--ease-out)` (reduced from .6s — see Plan M3 which handles this separately; if 007 already ran, skip) |
| `.reveal` opacity/transform | `opacity var(--dur-reveal) var(--ease-out), transform var(--dur-reveal) var(--ease-out)` |
| `.seg-card img` transform | `transform 400ms var(--ease-out)` (see Plan 007) |
| `.exp-tile img` transform | `transform 400ms var(--ease-out)` (see Plan 007) |
| `.tp-swatches button` transform | `transform var(--dur-fast) var(--ease-out)` |
| `.tp-toggle .sw` background | `background var(--dur-fast) var(--ease-ui)` |
| `.tp-toggle .sw::after` transform | `transform var(--dur-fast) var(--ease-out)` |
| `.social-fab a` transform | `transform var(--dur-ui) var(--ease-out)` |
| `.gal-thumbs img` transform/opacity | `transform 400ms var(--ease-out), opacity var(--dur-panel) var(--ease-ui)` |
| `.lb` opacity | `opacity var(--dur-fast) var(--ease-ui)` |
| `.lb button` bg/transform | `background var(--dur-fast) var(--ease-ui), transform var(--dur-fast) var(--ease-out)` |
| `.bfeat` transform/shadow | `transform var(--dur-panel) var(--ease-out), box-shadow var(--dur-panel) var(--ease-out)` |

## Repo conventions to follow

- CSS custom properties live in `:root` at the top of `site.css`. The existing `:root` block starts around line 1 and defines `--tinta`, `--pizarra`, `--bronce`, etc.
- Add the new motion tokens at the end of the `:root` block, grouped with a `/* motion */` comment.
- Exemplar of existing token usage: `transition: background .3s ease` → after this plan: `transition: background var(--dur-panel) var(--ease-ui)`.

## Steps

1. **Find the `:root` block in `site.css`** (starts at line 1 or near it). Add at the end of the `:root` declaration block, before the closing `}`:

   ```css
   /* motion */
   --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
   --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
   --ease-ui: cubic-bezier(0.25, 0.1, 0.25, 1);
   --dur-fast: 160ms;
   --dur-ui: 250ms;
   --dur-panel: 300ms;
   --dur-reveal: 800ms;
   ```

2. **Replace all transition values** in `site.css` using the replacement map in the Target section above. Work top-to-bottom through the file. Use the selector names to locate each rule (don't rely on line numbers after step 1 shifts them).

3. **For `.reveal`**, the current cubic-bezier `(.2,.7,.2,1)` is close to but not identical to `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)`. Replace it with the token — the difference is imperceptible but consistency matters.

## Boundaries

- Do NOT change any timing values except as specified in the replacement map.
- Do NOT touch HTML or JS files.
- Do NOT create a separate CSS file for tokens — add to `:root` in `site.css`.
- If Plan 007 (card image duration) was already executed before this one, the `.room-card .ph img`, `.seg-card img`, and `.exp-tile img` durations are already 400ms — use `400ms var(--ease-out)` as specified in the replacement map; do not revert to .6s/.7s.

## Verification

- **Mechanical**: open DevTools, select any `.btn`. In the Computed panel, find `transition`. Confirm it reads with `cubic-bezier(0.23, 1, 0.32, 1)` (not `ease`).
- **Feel check** (set DevTools Animations to 10% speed):
  - Hover over a room card. The lift should feel snappy and decisive (strong ease-out), not the soft default CSS `ease`.
  - Hover over a CTA button. The lift should feel the same as the card — one shared personality.
  - Scroll the header. The background blur should fade in gently (ease-ui).
  - Watch a `.reveal` element enter. Should feel the same as before but now uses the shared token curve.
- **Done when**: no `transition` property in `site.css` contains a bare `ease` keyword or a hand-typed `cubic-bezier` (except inside `@media` blocks that may have their own overrides, and the `.reveal` block which is now tokenized).
