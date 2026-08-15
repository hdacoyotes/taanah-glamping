# Animation Plans — Taanah Hotel & Glamping

Audit commit: `8625c96` · Audited by `improve-animations` · 2026-08-15

## Plans

| # | Title | Severity | Category | Status | Dependencies |
|---|-------|----------|----------|--------|--------------|
| [001](001-press-feedback-active-state.md) | Press feedback `:active` state | HIGH | Physicality | TODO | — |
| [002](002-hover-touch-gating.md) | Gate hover transforms for touch | HIGH | Accessibility | TODO | — |
| [003](003-reduced-motion-full-coverage.md) | Full `prefers-reduced-motion` coverage | HIGH | Accessibility | TODO | — |
| [004](004-easing-token-system.md) | Easing token system + duration scale | HIGH | Cohesion/Tokens | TODO | — |
| [005](005-link-arrow-gap-animation.md) | Fix `.link-arrow` gap animation | MEDIUM | Performance | 004 (optional) |
| [006](006-header-padding-animation.md) | Remove header `padding` animation | MEDIUM | Performance | 004 (optional) |
| [007](007-card-image-hover-duration.md) | Shorten card image hover durations | MEDIUM | Easing/Duration | 004 (optional) |
| [008](008-unify-card-image-scale.md) | Unify card image hover scale | LOW | Cohesion | 002 (if done first) |
| [009](009-mobile-nav-open-animation.md) | Mobile nav open/close animation | MEDIUM | Missed opportunity | 004 (optional) |
| [010](010-lightbox-image-crossfade.md) | Lightbox image crossfade | LOW | Missed opportunity | — |
| [011](011-hero-scroll-cue-pulse.md) | Hero scroll cue breathing animation | LOW | Missed opportunity | — |

## Recommended execution order

### Batch 1 — Foundation (do these first, in any order)

Run plans **001, 002, 003** first. They are independent of each other and of the token system. They fix the highest-impact user-facing issues (buttons that don't respond to touch, motion that ignores accessibility settings).

### Batch 2 — Token system

Run plan **004** next. It's a mechanical find-and-replace of hardcoded values with tokens. Once it's done, plans 005–009 can reference `var(--ease-out)` etc. instead of literal cubic-beziers. If 005–007 run before 004, they use the literal values documented in their plans — both paths are correct.

### Batch 3 — Performance and duration fixes

Run **005, 006, 007** in any order. Each is a small, targeted change to a specific element.

### Batch 4 — Polish

Run **008** (depends on 002 being done so the scale rules are in the right place), then **009** (mobile nav). These are polish-level.

### Batch 5 — Delight

Run **010** (lightbox crossfade) and **011** (scroll cue) independently.

## Dependencies between plans

- **004 before 005/006/007/009**: Plans 005–009 have notes for both "if tokens exist" and "if tokens don't exist" variants. Either order works.
- **002 before 008**: Plan 002 moves hover rules into `@media (hover: hover)`. Plan 008 edits those same rules. If 008 runs before 002, the scale changes go in their original location; if 002 ran first, 008 must find them in the gated block.
- **003 can reference 001**: Plan 003 adds `.btn:active { transform: none }` to reduced-motion. Plan 001 adds the `:active` state. Either order is safe — 003's rule is additive and harmless even before 001 exists.
- **All plans are CSS-only except 010** (modifies `site.js`) and **009** (CSS only, but requires reading current nav CSS before implementing).

## Notes

- No new dependencies required for any plan.
- All plans touch `site.css` or `site.js` only. No HTML changes.
- Plans were written for `site.css` and `site.js` in `/Users/Jorge/Downloads/design_handoff_taanah_sitio/`. Adjust paths if the project has moved.
- After all plans are executed, commit and push to `hdacoyotes/taanah-glamping` for Vercel deployment.
