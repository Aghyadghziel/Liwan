# LIWAN

A fictional architecture studio and residential developer, built as a demonstration of what a
premium property experience can be when the house itself is the interface.

Arabic is the site's first language (`/ar`, right to left); English is a full second edition
(`/en`). Everything in the 3D scene is generated in code: no model files, no texture packs, no
HDRI downloads.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000  →  redirects to /ar
npm run build      # production build
```

## What is here

| Part | Where |
|---|---|
| The residence (plan, walls, openings) | `src/lib/villa/geometry.ts` |
| Materials and their procedural textures | `src/lib/villa/materials.ts`, `textures.ts` |
| The specification the visitor chooses | `src/lib/villa/config.ts` |
| Camera shots and the film path | `src/lib/villa/camera.ts` |
| Scene, light, sky, post-processing | `src/components/three/Scene.tsx` |
| The house, assembled | `src/components/three/Villa.tsx` |
| Pool surface shader | `src/components/three/Water.tsx` |
| Home page sections | `src/components/sections/` |
| Planting: olives, palms, grasses | `src/components/three/Planting.tsx` |
| Project pages | `src/app/[locale]/projects/[slug]/` |
| Copy in both languages, side by side | `src/content/site.ts` |
| Photographs and their roles | `src/content/media.ts`, `tools/photos/` |
| Schematic drawings | `src/components/ui/Drawing.tsx`, `Plan.tsx` |
| Languages, direction, fonts | `src/lib/i18n.ts`, `src/lib/fonts.ts`, `globals.css` |

## Two languages

Every string lives in `src/content/site.ts` as an `{ ar, en }` pair, written for each language
rather than translated word for word. Arabic is set in its own faces (Alexandria for headings,
IBM Plex Sans Arabic for reading, Noto Naskh for the editorial line) with no tracking and more
leading; layout uses logical properties, so it mirrors without a second stylesheet. In the
opening film the house stands opposite the titles — right in English, left in Arabic — by
shifting the lens, not the camera, so verticals stay true.

## How the 3D is made

**The house is drawn from a plan.** `PLAN` in `geometry.ts` holds the real dimensions in
metres. Walls are extruded outlines with their openings cut out, so a window is a hole with a
reveal of the wall's full thickness, not a dark rectangle painted on a box. Change
`PLAN.east` and the house gets longer — plan, roof, glazing and the drawn floor plan on the
project pages all follow.

**Materials are painted in code, at their real size.** `textures.ts` draws every surface onto
a canvas. Each texture tiles without a seam and knows how many metres it covers, and all
geometry carries UVs in metres, so a floor plank is 200 mm wide wherever it is used. Boards,
slabs and cladding panels each take a slightly different tone, the way a delivered pallet does.

**The second layer of detail.** Edges are softened (nothing built has a perfectly sharp arris).
Roofs have upstands, copings and ballast; every opening has a frame, glass and a sill; cabinet
fronts are separate doors with 4 mm gaps over a dark carcass; there are sheers, downlights,
a boundary wall and a gate. Street-side glass is acid-etched, for privacy.

**Planting is not blobs.** Crowns are a few hundred small leaf sprays shaded as one volume;
palms are built frond by frond; grasses are planted in drifts. Each plant is one merged mesh.

**Light.** A gradient sky, a raking afternoon sun from the south-west, an environment map made
from light panels, soft panels at the glazing for the interior, and downlights that are real
cones. Post-processing is restrained on purpose: contact occlusion, a filmic tone curve, a
light grade and a vignette. No bloom and no depth of field — architectural photographs are
sharp from the foreground to the horizon.

**Changing a finish never rebuilds anything.** The material library is created once and
mutated; the outgoing texture dissolves into the incoming one in under a second.

**Render bench.** `/en?shot=living&clean=1` pins the camera to a named shot and hides the page.
The stills on the Hittin Residence page were taken this way.

## Performance

The scene is measured once on load (`src/lib/device.ts`). Phones and low-core machines get a
half-size shadow map, no occlusion pass, simpler glass and a lower pixel ratio; the frame rate
is watched and resolution drops before frames do. The lens widens on portrait screens, because
the same focal length sees far less of a room on a phone. `prefers-reduced-motion` steps the
camera through the film instead of gliding it.

One WebGL context serves the whole site: the canvas is fixed behind the page, the film and the
configurator are transparent over it, and every reading section carries a solid ground that
covers it again.

## Honesty

LIWAN does not exist, and the site says so in its footer. Its three "built" projects are
illustrated with reference photographs from Unsplash, credited on `/credits` and in
`public/photography/CREDITS.md`; the fourth project is the 3D model itself and is illustrated
with frames of that model, labelled as such. The drawings are marked as schematic. The enquiry
form has no server behind it, so it writes the email — including the specification chosen in
the model — and opens it in the visitor's own mail app rather than pretending to send.

To change photographs: edit `tools/photos/selection.json`, then run
`uv run --python 3.12 --with pillow python tools/photos/prepare.py`.
