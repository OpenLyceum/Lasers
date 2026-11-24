# AGENTS.md — Lasers

Sim-specific context for AI assistants. General SceneryStack guidance: [OpenLyceum/.github/AGENTS.md](https://github.com/OpenLyceum/.github/blob/main/AGENTS.md). Provenance and behavior inventory: [doc/upstream.md](doc/upstream.md).

## Project

SceneryStack port of PhET legacy Java Lasers (SVN r75234). Two independent screens share `common/model/LaserModel.ts` and `common/view/LaserScreenView.ts`. Model time is seconds; apparatus positions retain the upstream 300 × 120 coordinate system. Energy is measured relative to the −13.6 eV ground level. PHYSICS constants document the upstream educational time scale. Particle rendering never advances physics.

## Key files

| File | Purpose |
|---|---|
| `src/LasersColors.ts` | Profile colors (black default / white projector backgrounds; panels and apparatus adapt) |
| `src/LasersConstants.ts` | Physics timing, apparatus coords, populations |
| `src/LasersNamespace.ts` | Namespace for color property names |
| `src/common/model/LaserModel.ts` | Shared laser physics; owned particle records + seeded RNG; aggregate Properties |
| `src/common/view/LaserScreenView.ts` | Shared apparatus / controls composition |
| `src/common/view/LaserArtwork.ts` | Live SVG apparatus geometry (including wavelength spectrum) |
| `src/one-atom/OneAtomScreen.ts` | One Atom screen wrapper |
| `src/one-atom/model/OneAtomModel.ts` | Stationary atom; two levels by default; seed beam; no pump or mirrors at start |
| `src/multiple-atoms/MultipleAtomsScreen.ts` | Multiple Atoms screen wrapper |
| `src/multiple-atoms/model/MultipleAtomsModel.ts` | 30 moving atoms; three levels; pump beam; no seed control at start |
| `src/i18n/StringManager.ts` | Localized strings (en/es/fr) |
| `doc/upstream.md` | Upstream feature inventory and numerical differences |
| `doc/licenses/` | Retained upstream license text |

## Model

Model randomness is seeded and integration uses fixed 1/120 s substeps. Atom/photon records are owned by the model; aggregate populations are observable Properties. Models dispose all Properties and their level-change listener. Views live for the simulation lifetime.

| Screen | Folder | Content |
|---|---|---|
| One Atom | `src/one-atom/` | Stationary atom; two levels by default; seed beam; no pump or mirrors at start |
| Multiple Atoms | `src/multiple-atoms/` | 30 moving atoms; three levels; pump beam; no seed control at start |

`LaserModel.ts` keeps owned mutable particle records and a seeded RNG so hundreds of short-lived photons do not each allocate Properties; aggregate readouts remain observable.

## Testing

Use Node 26. Run `npm run lint && npm run check && npm run build && npm test`. Browser tests: `FUZZ_PORT=5187 npx playwright test tests/browser`. Fuzz: `FUZZ_PORT=5187 npm run test:fuzz`. Vitest uses happy-dom and the template leak harness; cover `OneAtomModel` and `MultipleAtomsModel` disposal.

## Development notes

- `assets/`: openly licensed laser photograph with a visible glowing discharge tube (see `assets/README.md`) and PhET-authored reference sprites. The live apparatus uses SVG geometry in `LaserArtwork.ts` / `WavelengthControl.ts`.

## Compliance carve-outs

- **`tests/generators.test.ts` omitted:** template-only rename/scaffold scripts are removed after bootstrap, so their generator tests are not kept.
- **`assets/`:** contains reference imagery beyond the usual `public/icons/` set; documented in `assets/README.md`.

## Accessibility

Follow [Baton/ACCESSIBILITY.md](https://github.com/OpenLyceum/Baton/blob/main/ACCESSIBILITY.md): PDOM names, per-screen `*ScreenSummaryContent`, and keyboard-help content. Document any intentional deviations under Compliance carve-outs.
