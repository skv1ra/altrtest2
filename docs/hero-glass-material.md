# Hero glass shards — material & tuning guide

The hero scene (`components/HeroGlassScene.tsx` + `HeroGlassScene.module.css`)
composes **pre-rendered photorealistic raster shards** — not vector polygons.
The PNGs live in `public/hero-shards/` and are generated offline by
`scripts/generate-hero-shards.mjs` (canvas rendering in headless Chromium via
Playwright).

## Regenerating the assets

```bash
node scripts/generate-hero-shards.mjs            # writes to public/hero-shards
node scripts/generate-hero-shards.mjs some/dir   # writes elsewhere for preview
```

Generation is fully deterministic per `seed`, so re-running reproduces the
same shards. Tune a shard by editing its entry in the `SHARDS` table at the
bottom of the script and re-running.

## What the generator bakes into each PNG

| Pass | Detail | Knobs (per-shard params) |
| ---- | ------ | ------------------------ |
| Silhouette | Evenly-jittered convex crystal with one acute spike, straight edges, fine fracture micro-jag, bitten chips | `verts`, `elong`, `jag`, `chips` |
| Body | Cold dark glass `#0A0A0A–#1A1A1A`, brighter toward top-left key light | `tone` (lighten), `transparency` |
| Facets | Half-plane shading — some faces mirror the bright sky, some fall to black — with dark seam + catch-light on boundaries | `facetN` |
| Sky wedge | One broad blurred reflection band sweeping across the glass | inline in script |
| Cracks | Branching bright fracture polylines (straight runs, sharp kinks) + micro-cracks, each with a soft halo | `cracks`, `microCracks` |
| Scratches | ~46 faint short strokes at random angles | inline |
| Grain | Per-pixel noise composited with `overlay` (imperceptible) | inline |
| Inner shadow | Wide blurred dark stroke inside the contour | inline |
| Rim light | White edge strokes weighted by how much each edge faces the top-left light, with chromatic blue/warm fringes, inner bevel line (glass thickness), vertex sparkles | `rimBoost` |

Light direction is global (top-left ≈ 300°) — `litSegment()` orients contour
normals outward and dots them with the light vector.

## Runtime composition (`HeroGlassScene.tsx`)

- Six `<Image>` shards positioned in a loose 3D arrangement; the large
  cracked `shard-main` sits centre-right and stays in focus.
- **Depth of field:** `dof` px of CSS blur per shard — one big defocused
  foreground shard (7px) drifting past the camera, small soft background
  shards (2–3px). In-focus shards are interactive; defocused ones ignore
  pointer events.
- **Fog:** `.fog` — two blurred radial glows behind the cluster.
- **Motion** (all `transform`-only, easing `cubic-bezier(0.25,0.46,0.45,0.94)`):
  - scroll parallax by `depth`, plus velocity-based spread that settles back;
  - slow per-shard drift/rotation (9–17s periods);
  - hover: shard eases 18px away from the cursor, brightness +16%.
- `prefers-reduced-motion` disables everything; two shards hide on mobile.

## Performance

Measured in Chromium (Playwright): 60 fps idle, hover, and at 390×844.
Blur filters are only ever applied to the shard images themselves — never to
viewport-sized wrappers (that path collapses software renderers).
