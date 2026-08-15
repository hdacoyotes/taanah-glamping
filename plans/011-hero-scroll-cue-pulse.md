# 011 — Hero scroll cue breathing animation

- **Status**: TODO
- **Commit**: 8625c96
- **Severity**: LOW (missed opportunity)
- **Category**: Missed opportunities
- **Estimated scope**: 1 file (site.css), ~12 lines

## Problem

The hero section has a `.scroll-cue` element that tells users to scroll down. It is completely static — no animation, no movement, no visual hint that it is functional:

```css
/* site.css:206 */
.home-hero .scroll-cue {
  position: absolute; bottom: 30px; right: 32px; z-index: 3;
  font-family: var(--ff-mono); font-size: 10px; letter-spacing: 0.2em;
  text-transform: uppercase; color: rgba(255,255,255,0.7);
  writing-mode: vertical-rl; display: flex; align-items: center; gap: 10px;
}
/* no animation here */
```

A scroll cue is seen once per visit on the landing page — a rare first-time moment. Per the audit playbook: "Rare / first-time → can add delight." A slow pulse communicates "scroll me" without being distracting.

## Target

A subtle vertical `translateY` loop: 4px down and back, repeating indefinitely with a slow pace. The animation should feel like breathing — not a bouncing arrow.

```css
/* target — add to site.css */

@keyframes scroll-cue-pulse {
  0%, 100% { transform: translateY(0); opacity: 0.7; }
  50% { transform: translateY(4px); opacity: 1; }
}

.home-hero .scroll-cue {
  animation: scroll-cue-pulse 2.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
}

@media (prefers-reduced-motion: reduce) {
  .home-hero .scroll-cue { animation: none; }
}
```

- `2.4s` is deliberately slow — this is decorative ambient motion, not a UI response.
- `cubic-bezier(0.45, 0.05, 0.55, 0.95)` is a smooth ease-in-out that creates the breathing quality.
- The `opacity` shift from 0.7 → 1 adds a subtle glow without the element fully disappearing.
- `@keyframes` on a continuously-looping decorative element is appropriate here (unlike UI components where interruptibility matters — this is ambient and non-interactive).

## Repo conventions to follow

- `@keyframes` declarations go in `site.css`. There are currently no `@keyframes` in the file — this is the first one. Place it near the `.home-hero .scroll-cue` rule (around line 206 area) so it's co-located.
- Add the `prefers-reduced-motion` override to the existing reduced-motion block (Plan 003 location), OR add a new reduced-motion block right after the `@keyframes`. Co-location is preferred for readability.
- No HTML changes, no JS.

## Steps

1. **In `site.css`**, find the `.home-hero .scroll-cue` rule (around line 206). Before it, add the `@keyframes` definition:

   ```css
   @keyframes scroll-cue-pulse {
     0%, 100% { transform: translateY(0); opacity: 0.7; }
     50% { transform: translateY(4px); opacity: 1; }
   }
   ```

2. **Add to the `.home-hero .scroll-cue` rule** (the existing rule keeps all its properties; add `animation` to it):

   ```css
   .home-hero .scroll-cue {
     /* ... existing properties unchanged ... */
     animation: scroll-cue-pulse 2.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
   }
   ```

   Since the existing rule is one long line, append `animation: scroll-cue-pulse 2.4s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;` to it (keeping it on one line or splitting as needed).

3. **Add `prefers-reduced-motion` override.** Either add to the existing reduced-motion block:
   ```css
   .home-hero .scroll-cue { animation: none; }
   ```
   Or add a separate block immediately after the `@keyframes`:
   ```css
   @media (prefers-reduced-motion: reduce) {
     .home-hero .scroll-cue { animation: none; }
   }
   ```

## Boundaries

- Do NOT animate the scroll cue on interior pages (experiencias, habitaciones, etc.) — `@keyframes` is scoped to `.home-hero .scroll-cue`, which only appears on `index.html`.
- Do NOT change the `writing-mode: vertical-rl` or any other layout/typography property.
- Do NOT add this animation to the `.scroll-cue` on any other section.
- The 2.4s duration is intentional — do not shorten it. Faster makes it feel urgent/annoying; this is ambient.

## Verification

- **Feel check**: open `index.html` (the home page). Confirm the scroll cue in the bottom-right of the hero slowly pulses downward and fades brighter in a 2.4s loop.
- At DevTools 10% speed: confirm the `translateY` goes from `0px` → `4px` → `0px` smoothly. Confirm the opacity shifts.
- Toggle `prefers-reduced-motion`. Confirm the scroll cue is static.
- Check `habitaciones.html`, `experiencias.html`, etc. Confirm no scroll cue animation on those pages (`.home-hero` class is specific to index).
- **Done when**: scroll cue pulses on the home page only, stops under reduced-motion preference.
