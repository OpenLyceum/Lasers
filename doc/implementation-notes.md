# Implementation notes - Lasers

Architecture and design decisions. Physics for educators: [model.md](./model.md).
Upstream inventory and attribution: [upstream.md](./upstream.md).

## Layout

```
main.ts
  ├─ OneAtomScreen       → OneAtomModel  → LaserScreenView
  └─ MultipleAtomsScreen → MultipleAtomsModel → LaserScreenView

src/common/model/
  └─ LaserModel.ts          shared physics; owned Atom/Photon records + seeded RNG;
                            aggregate NumberProperty / BooleanProperty readouts

src/common/view/
  ├─ LaserScreenView.ts     apparatus, lamps, gauges, energy chart, controls
  ├─ LaserArtwork.ts        SVG cavity / lamps / mirrors / photons / wave
  └─ …                      wavelength controls, dialogs, screen summaries

src/one-atom/               stationary single atom; two levels; seed by default
src/multiple-atoms/         30 moving atoms; three levels; pump by default
src/i18n/                   en / es / fr via StringManager
```

Both screens construct independent `LaserModel` instances (same class,
`multiple` flag) and the same accessible `LaserScreenView`. There is no
cross-screen state.

## Principles

- **Owned particle records, not per-photon Properties.** Hundreds of short-lived
  photons would thrash Axon if each were a Property. The model mutates plain
  `Atom` / `Photon` objects and refreshes aggregate Properties (populations,
  horizontal photon count, output rate, exploded) each step.
- **Seeded RNG + fixed substeps.** Integration uses 1/120 s model substeps
  accumulated from wall `dt`, so pause, manual step, and reset stay
  deterministic. Ground-state recovery is a simulation-time cooldown, not a
  wall-clock thread (unlike the Java original).
- **View never advances physics.** Drawing reads particle arrays and Properties
  only; photon paths are grouped by wavelength for rendering.
- **Energy levels as accessible controls.** Level lines are `VSlider` thumbs;
  lifetimes sit beside them. Middle and upper energy ranges do not overlap, so
  ordering cannot invert. Advanced stimulation options live in a dialog.

## Defaults by screen

| | One Atom | Multiple Atoms |
|---|---|---|
| Atoms | 1, fixed position | 30, moving |
| Levels | two (three optional) | three |
| Seed | on (1/s @ 680 nm) | no seed control at start |
| Pump | off | on (0/s @ 440 nm initially; rate up to 400/s) |
| Mirrors | off | off |

Constants live in `LasersConstants.ts` (`PHYSICS`, `WAVELENGTH`, `ENERGY`,
`RATES`, apparatus layout). Resonance tolerance 0.05 eV; stimulation default
0.2; lasing / overload thresholds 40 / 300 near-horizontal lower-transition
photons.

## Presentation notes

- Default profile: black apparatus field, dark panels; Projector Mode inverts
  to white field / light panels. Wavelength hues adjust for contrast only.
- Live apparatus is SceneryStack SVG (`LaserArtwork.ts`); upstream raster
  sprites under `assets/phet/` are reference only.
- Photograph dialog uses an openly licensed HeNe image (see `assets/README.md`
  and [upstream.md](./upstream.md)).
- Legacy Java developer view options (photon diameter, comet shape, profiling,
  …) are not ported.

## Verification

- Unit / disposal tests on `OneAtomModel` and `MultipleAtomsModel` (source-defined
  scenarios; not a live Java oracle).
- Browser: keyboard-driven Playwright on both screens, photo dialog, narrow
  viewport; pointer and keyboard fuzz (`FUZZ_PORT=5187`).
- Commands: `npm run lint && npm run check && npm run build && npm test`; browser
  and fuzz scripts in README.md.

## Private-phase note

Private development may omit deployment and fleet registration; CI still runs
lint / typecheck / tests / build through Baton’s reusable workflow. Compliance
carve-outs for that phase are listed in `AGENTS.md`.
