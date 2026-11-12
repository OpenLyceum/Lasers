# Lasers

## Features

Private TypeScript/SceneryStack port of PhET Lasers: one atom and multiple atoms, absorption, spontaneous and stimulated emission, adjustable energy levels and lifetimes, optical pumping, mirrors, photon/beam/wave views, population readouts, keyboard controls, English/French/Spanish, and projector mode.

## Quick Start

Use Node 26. Run `npm ci`, then `npm start`. For a local production preview, run `npm run build` followed by `npm run preview`. No hosted deployment is configured.

## Scripts

`npm run lint`, `npm run check`, `npm test`, `npm run build`, `npm run test:fuzz`, and `npx playwright test tests/browser`. Set `FUZZ_PORT` when other simulations are running.

## Tech Stack

SceneryStack 3, TypeScript 7, Vite 8, Biome 2, Vitest, and Playwright. Source provenance, feature inventory, and numerical differences: [doc/upstream.md](doc/upstream.md).

## License

Port infrastructure is AGPL-3.0-or-later. PhET source-derived behavior and the upstream photograph retain University of Colorado attribution and the upstream GPL notice in [doc/licenses/PhET-GPL-2.txt](doc/licenses/PhET-GPL-2.txt). See [doc/upstream.md](doc/upstream.md). This is an OpenLyceum adaptation, not an official PhET product.

## Contributing

Private development only; follow AGENTS.md and the organization conventions. Do not publish or onboard this repository until explicitly requested.
