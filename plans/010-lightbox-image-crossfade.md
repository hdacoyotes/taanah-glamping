# 010 — Lightbox image crossfade on prev/next navigation

- **Status**: TODO
- **Commit**: 8625c96
- **Severity**: LOW (missed opportunity)
- **Category**: Missed opportunities
- **Estimated scope**: 1 file (site.js), ~8 lines; 1 file (site.css), ~2 lines

## Problem

When a user navigates between photos in the lightbox, the image src is swapped directly:

```js
/* site.js:100-107 */
function render() {
  var it = items[idx];
  if (!it) return;
  lbImg.src = it.src;       /* ← hard cut: old image disappears, new image loads */
  lbImg.alt = it.alt;
  lbCap.textContent = it.alt;
  lbNum.textContent = (idx + 1) + ' / ' + items.length;
}
```

The result is a hard cut: the old photo disappears and the new one flickers in as it loads. This is the highest-emotion, most engaged moment on the site (a user browsing room photos), and it gets the least care.

## Target

A brief opacity fade: fade out to 0, swap the src, fade back in. This works even if the image isn't cached — it hides the load flicker too.

```js
/* target render() function */
function render() {
  var it = items[idx];
  if (!it) return;
  lbImg.style.transition = 'opacity 150ms cubic-bezier(0.25, 0.1, 0.25, 1)';
  lbImg.style.opacity = '0';
  setTimeout(function () {
    lbImg.src = it.src;
    lbImg.alt = it.alt;
    lbCap.textContent = it.alt;
    lbNum.textContent = (idx + 1) + ' / ' + items.length;
    lbImg.style.opacity = '1';
  }, 150);
}
```

The 150ms fade-out + instant src swap + fade-in produces a clean crossfade. `setTimeout(fn, 150)` matches the `opacity 150ms` transition so the swap happens at full transparency.

**For users with `prefers-reduced-motion`**: skip the fade, do the swap instantly.

```js
/* target render() with reduced-motion check */
function render() {
  var it = items[idx];
  if (!it) return;
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) {
    lbImg.src = it.src;
    lbImg.alt = it.alt;
    lbCap.textContent = it.alt;
    lbNum.textContent = (idx + 1) + ' / ' + items.length;
    return;
  }
  lbImg.style.transition = 'opacity 150ms cubic-bezier(0.25, 0.1, 0.25, 1)';
  lbImg.style.opacity = '0';
  setTimeout(function () {
    lbImg.src = it.src;
    lbImg.alt = it.alt;
    lbCap.textContent = it.alt;
    lbNum.textContent = (idx + 1) + ' / ' + items.length;
    lbImg.style.opacity = '1';
  }, 150);
}
```

Also ensure the initial `open()` call does not fade (the lightbox itself already fades in via CSS — the image should appear at full opacity when the lightbox opens):

```js
/* in the open() function — set opacity to 1 immediately when opening */
function open(list, i) {
  items = list; idx = i || 0;
  lbImg.style.opacity = '1';  /* reset in case previous close left it mid-fade */
  render(); /* render() will NOT fade on first open since we call it before lb.classList.add('open') */
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
```

Wait — `open()` calls `render()` before adding `.open`. At that point the lightbox is still `opacity: 0` (CSS). So the image swap inside `render()` will happen invisibly. The lightbox then fades in via CSS. This means the `render()` fade is only meaningful for subsequent prev/next calls. The `open()` path is already correct and needs no change — just add `lbImg.style.opacity = '1'` before `render()` to ensure the opacity isn't stuck at 0 from a previous navigation.

## Repo conventions to follow

- Animation logic goes in `site.js` (the gallery/lightbox IIFE).
- No new dependencies — `window.matchMedia` is native.
- The inline `transition` style on `lbImg` overrides CSS. This is intentional and scoped to this element.
- Keep the change inside the existing `(function () { ... })()` gallery IIFE in `site.js`.

## Steps

1. **In `site.js`**, find the `render()` function (around line 100). Replace it entirely with:

   ```js
   function render() {
     var it = items[idx];
     if (!it) return;
     var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
     if (reduced) {
       lbImg.src = it.src;
       lbImg.alt = it.alt;
       lbCap.textContent = it.alt;
       lbNum.textContent = (idx + 1) + ' / ' + items.length;
       return;
     }
     lbImg.style.transition = 'opacity 150ms cubic-bezier(0.25, 0.1, 0.25, 1)';
     lbImg.style.opacity = '0';
     setTimeout(function () {
       lbImg.src = it.src;
       lbImg.alt = it.alt;
       lbCap.textContent = it.alt;
       lbNum.textContent = (idx + 1) + ' / ' + items.length;
       lbImg.style.opacity = '1';
     }, 150);
   }
   ```

2. **In the `open()` function** (around line 108), add `lbImg.style.opacity = '1';` before the `render()` call:

   ```js
   function open(list, i) {
     items = list; idx = i || 0;
     lbImg.style.opacity = '1';
     render();
     lb.classList.add('open');
     document.body.style.overflow = 'hidden';
   }
   ```

## Boundaries

- Do NOT change the lightbox open/close animation — that's CSS-driven and works correctly.
- Do NOT change prev/next step logic — only the `render()` function.
- Do NOT use `requestAnimationFrame` instead of `setTimeout` — the `setTimeout(fn, 150)` pattern intentionally waits for the CSS opacity transition to complete before swapping.
- Do NOT add keyboard or touch swipe handling in this plan.

## Verification

- **Feel check**: open the lightbox on any page with a gallery. Click "Next" or "Previous" arrow. Confirm:
  - The current image fades out over ~150ms.
  - The new image fades in over ~150ms.
  - No flash of white/empty between images.
- Open the lightbox for the first time. Confirm the image is fully opaque when the lightbox fades in (no double-fade).
- Toggle `prefers-reduced-motion`. Confirm clicking Next/Prev is an instant cut with no fade.
- **Done when**: prev/next navigation crossfades smoothly with no flash.
