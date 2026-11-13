# Upstream provenance and behavior inventory

Reference: PhET SVN `https://phet.unfuddle.com/svn/phet_svn/trunk`, revision **75234**. Retrieved via SVN on 2026-11-12. Local immutable references are `../Baseline/PhET/lasers` and `../Baseline/PhET/quantum`, targeted checkouts of `simulations-java/simulations/lasers` and `simulations-java/common/quantum`. Selected PhET-authored apparatus sprites are included with their original attribution.

Reproduce retrieval with `svn checkout --username guest --password guest https://phet.unfuddle.com/svn/phet_svn/trunk/simulations-java/simulations/lasers@75234 ../Baseline/PhET/lasers` and the equivalent common/quantum checkout. The catalog's full-archive alternative is `../Baseline/scripts/fetch-baselines.sh --only PhET/trunk`.

## Attribution

Original Java Lasers and shared quantum code: Copyright 2002–2012 University of Colorado. Authors credited in the source include Ron LeMaster and PhET contributors. This independently rendered TypeScript adaptation is maintained by OpenLyceum. The upstream trunk license is preserved verbatim under `licenses/PhET-GPL-2.txt`; its application notice offers GPL version 2 or later. The port infrastructure uses AGPL-3.0-or-later. Original PhET trademarks are not used as the application brand.

`assets/actual-laser.jpg` replaces the upstream photograph with Muraer's [HeNe-Laser.JPG](https://commons.wikimedia.org/wiki/File:HeNe-Laser.JPG), showing an operating helium–neon laser with its glowing discharge tube exposed. It is used under [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/), resized and recompressed with the original framing retained. The dialog includes the creator, source and license links, a modification notice, and a localized description. See `../assets/README.md` for provenance and reproduction instructions.

## Source inventory

| Source subsystem | Port behavior |
| --- | --- |
| SingleAtomModule | One stationary atom; starts with two levels, seed 1/s at 680 nm, no pump, no mirrors |
| MultipleAtomModule | 30 moving atoms; starts with three levels, pump 0/s at 440 nm, no seed control |
| LasersConfig / BaseLaserModule | Seed 0–30/s, pump 0–200/s (single) or 0–400/s (multiple), lifetimes up to 400 model ms, middle 400 and upper 100 defaults |
| QuantumConfig / AtomicState | Resonance tolerance 0.05 eV; absorption before stimulation; stimulation probability 0.2; optional restriction to adjacent stimulated transitions |
| StateLifetimeManager | Lifetime sqrt(-ln(U)) times lifetime parameter; spontaneous cascades to next lower state; 10% horizontal emission bias |
| LaserAtom | 200 ms ground-state recovery after a downward transition |
| PhotonMirrorCollisonExpert | Left full mirror, right adjustable mirror; preserve double reflectivity sampling and near-horizontal collimation |
| LaserModel / Kaboom | Population counts, near-horizontal lower-transition photon count, lasing threshold 40 and overload threshold 300 |
| UniversalLaserControlPanel | Two/three levels, mirrors, upper-state visibility, lamp photon/beam view, lower-transition photon/wave view |
| Energy monitor | Adjustable energy levels and both lifetimes; live population readout |
| Simulation rate / Reset All | Speed, pause, manual step, full deterministic reset |
| ShowActualButton / help | Laser photograph dialog with an openly licensed replacement showing the glowing interior; keyboard help and screen summary |
| Options menu | All/adjacent stimulated transitions and stimulation probability on the main control panel |

## Numerical and presentation choices

The Java model advances 12 model ms at 25 fps. The port maps this to 300 model ms per real second and 150 apparatus units/s photon speed. Fixed 1/120 s substeps replace Java frame stepping; squared-log lifetimes and mirror double sampling are preserved. The Java ground-state recovery thread becomes a simulation-time timer so pause and deterministic replay work consistently. Positions use apparatus units, not physical cavity metres.

Energy-level lines are draggable thumbs of accessible SceneryStack vertical sliders. Energy readouts occupy a separate column on the left; lifetime controls sit on the right. Shorter excited-state lifetimes broaden and soften the corresponding line using an SVG gradient. This is an illustrative, visually compressed inverse-lifetime relationship, not a calibrated uncertainty in eV, and does not change the model's resonance tolerance or energy. Ground energy is displayed relative to zero; middle and upper sliders use non-overlapping ranges to preserve ordering. Styling and artwork are rendered in SceneryStack, with new accessibility and localized controls. Legacy developer view options (photon diameter, comet shape, pair separation, background color and profiling) are not reproduced. Photon colors follow wavelength; UV and infrared use symbolic blue and purple. Atom colors encode state. The power readout includes outgoing photons per second rather than a calibrated watt value.

Automated source-scenario tests check transition rules, constants, deterministic transport, and population inversion. They do not constitute a side-by-side execution comparison with the original Java app; exact stochastic trajectory equivalence is not claimed.

## Apparatus artwork

The lamps, mirrors, atoms, cavity, photons and wave use SceneryStack SVG geometry. The wavelength controls use SVG spectrum gradients rather than the framework's small raster spectrum. This keeps the apparatus sharp when scaled. Upstream `flashlight.png`, `mirror.gif`, and gray/red/blue medium atom sprites from `lasers/data/lasers/images/` are retained as reference material, with their attribution in `assets/phet/license.txt`; they are no longer used by the view. No flame sprites or other assets with external/uncertain attribution are used. The default apparatus field is black with dark panels and light labels; Projector Mode uses a white field, light panels and dark labels. Gradients and state colors react to profile changes. Wavelength hues are brightened on black and darkened on white for visibility; this changes presentation only. The lamps, cavity, and two power gauges retain the upstream arrangement. SceneryStack owns all interactive controls. The photograph dialog retains its attributed raster photograph.
