# LIWAN

A fictional architecture studio and residential developer, built as a demonstration of what a
premium property experience can be when the house itself is the interface.

Everything in the 3D scene is generated in code. No model files, no texture packs, no HDRI
downloads, no stock photography.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
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
| Project pages | `src/app/projects/[slug]/` |
| Copy, projects, materials, services | `src/content/site.ts` |

## How the 3D is made

**The house is drawn from a plan.** `PLAN` in `geometry.ts` holds the real dimensions in
metres. Walls are extruded outlines with their openings cut out, so a window is a hole with a
reveal of the wall's full thickness, not a dark rectangle painted on a box. Change
`PLAN.east` and the house gets longer — plan, roof, glazing and the drawn floor plan on the
project pages all follow.

**Materials are painted in code.** `textures.ts` generates every surface onto a canvas:
growth rings bent around a knot for oak, branching veins for marble, banded sediment and
pores for travertine, a woven tooth for linen. Each one produces a colour map and a greyscale
that drives both bump and roughness, which is what stops a surface reading as tinted plastic.

**Light is built in the scene.** A gradient sky dome, one low sun for long shadows, and an
environment map made from light panels — with the same sky rendered into it, so polished
surfaces have something real to reflect. Interiors are lit by a wide soft panel at the
glazing, the way a deep plan actually gets its light.

**Changing a finish never rebuilds anything.** The material library is created once and
mutated: the texture is swapped, the colour eases over a few frames, and a brief sheen passes
across the surface so the change reads as deliberate.

## Performance

The scene is measured once on load (`src/lib/device.ts`). Phones and low-core machines get a
half-size shadow map, no occlusion pass, simpler glass and a lower pixel ratio; the frame rate
is watched and resolution drops before frames do. The lens widens on portrait screens, because
the same focal length sees far less of a room on a phone. `prefers-reduced-motion` steps the
camera through the film instead of gliding it.

One WebGL context serves the whole site: the canvas is fixed behind the page, the film and the
configurator are transparent over it, and every reading section carries a solid ground that
covers it again.

## What is deliberately not here

- **No photography.** Projects are represented by their own materials. Real renders or
  photographs drop into those panels.
- **No form backend.** The enquiry form validates and confirms on the client only.
- **The other three projects are not modelled.** One house is built in full; the project
  pages describe the rest, as a studio's site would before the models exist.
