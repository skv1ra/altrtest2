# Hero glass fragments — material & tuning guide

The hero scene (`components/HeroGlassScene.tsx` + `HeroGlassScene.module.css`)
renders six asymmetric shards of dark damaged glass in SVG. No Three.js/WebGL:
every layer is a gradient, stroke, or filter inside one small SVG per fragment,
so the whole scene stays GPU-composited and holds 60 fps.

## Layer stack (bottom → top, per fragment)

| Layer     | What it is                                                        | Where to tune |
| --------- | ----------------------------------------------------------------- | ------------- |
| `body`    | Cold mineral base, `#0A0A0A–#1A1A1A` range at 60–85% alpha        | `-body` gradient stops |
| veil      | Atmospheric fade: deeper fragments pick up the milky background   | `veil` factor in `FragmentSvg` (`(MAX_DEPTH - depth) * 0.28`) |
| `grain`   | Fractal-noise rect (~1.5% alpha) clipped to the polygon           | `-grain` filter: `baseFrequency`, alpha in `feColorMatrix` (4th row, currently `0.05`) |
| facets    | Paired dark + light hairlines = fracture ridge catching light     | `facets` data per fragment; stroke colors in the facet `<g>` |
| `sheen`   | Primary silver reflection stripe + fainter parallel echo          | `-sheen` gradient: stripe position = stop offsets around `0.49–0.51`, angle = `sheen {x1,y1,x2,y2}` per fragment |
| `counter` | Faint reversed rim on the shadow side (curvature hint)            | `-counter` gradient |
| `rim`     | Gradient edge stroke, bright toward the key light                 | `-rim` gradient; base opacity `0.82` |
| `lit`     | Brightest edges facing the light, with soft bloom underneath      | `litEdges` per fragment (edge index pair + strength) |
| `tint`    | Hover-only silver-blue breath (`#A8BACE` at 7%)                   | last `<polygon>` + `.tint` CSS |

Light direction is global: top-left (~300°). All gradients (`body`, `rim`,
`counter`) assume it — if you change the light, flip their `x1/y1/x2/y2`
consistently across all three.

## Motion model (wrapper nesting matters)

```
.fragment   scroll parallax  — translate3d(0, --sy * --depth)
 └ .spread  velocity spread  — fragments nudge outward on fast scroll, settle via transition
    └ .push hover repel      — moves 18px away from cursor (--push-x/y set in JS)
       └ .turn      base rotation, unique 8–15s period per fragment
          └ .turnBoost  extra oscillation, paused; released on :hover (smooth "speed-up")
```

All motion is `transform`-only (GPU-composited, no layout). Easing everywhere:
`cubic-bezier(0.25, 0.46, 0.45, 0.94)`.

## Performance notes

- Measured (Playwright/Chromium): 60 fps idle, 60 fps during hover, 60 fps at
  390×844 mobile viewport.
- Never put `filter: blur()` or `will-change` on the viewport-sized wrappers —
  that was tried and collapses software-rendered environments to ~0 fps.
  Filters live only on the small fragment SVGs.
- The `feTurbulence` grain is static content: it rasterizes once and rides the
  composited transforms afterwards.
- Mobile LOD: grain rect is `display: none` under 768px; two fragments carry
  `hideOnMobile`.
- `prefers-reduced-motion`: all animations and transforms are disabled in CSS,
  and the JS scroll/hover handlers early-return.

## Adding a fragment

Add an entry to `FRAGMENTS`: 3–6 vertex polygon in a `0 0 100 132` viewBox
(asymmetric, no regular geometry), pick `depth` (0.05–0.3; higher = closer =
faster parallax), a unique `duration` in 8–15s, one or two `litEdges` facing
top-left, and a `sheen` vector angled 45–60°. IDs must stay unique — they
namespace the SVG defs.
