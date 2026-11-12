# Lasers

Private SceneryStack port of PhET legacy Java Lasers, SVN r75234. Read ../.github/AGENTS.md for shared guidance and ../Baton/skills/ for topic references.

## Architecture

Two independent screens wrap `common/model/LaserModel.ts` and `common/view/LaserScreenView.ts`. Model time is seconds; apparatus positions retain the upstream 300 × 120 coordinate system. Energy is measured relative to the -13.6 eV ground level. PHYSICS constants document the upstream educational time scale. Particle rendering never advances physics.

Model randomness is seeded and integration uses fixed 1/120 s substeps. Atom/photon records are owned by the model; aggregate populations are observable Properties. Models dispose all Properties and their level-change listener. Views live for the simulation lifetime.

## Commands

Use Node 26. Run `npm run lint`, `npm run check`, `npm test`, `npm run build`; browser tests use `FUZZ_PORT=5187 npx playwright test tests/browser`. Fuzz with `FUZZ_PORT=5187 npm run test:fuzz`. Vitest uses happy-dom and the template leak harness.

## Private development

Keep repository visibility PRIVATE. Local dev/preview only. No Pages workflow, catalog entry, org-profile link, workspace README entry, or fleet onboarding. Do not run create-sim without --local-only: its remote path creates public repositories. Read doc/upstream.md before changing physics.

## Compliance carve-outs

- `.github/workflows/deploy.yml`: intentionally absent during private development; no GitHub Pages.
- `.github/workflows/ci.yml`: build-only reusable Baton CI; fleet compliance and private-plan-dependent security workflows deferred.
- `tests/generators.test.ts`: omitted because template-only rename/scaffold scripts are removed after bootstrap.
- `assets/`: contains the attributed upstream laser photograph displayed by the simulation.
- `doc/licenses/`: retained upstream license text.
- `src/common/model/LaserModel.ts`: owned mutable particle records and seeded RNG avoid allocating Properties for hundreds of short-lived photons; aggregate readouts remain observable.
