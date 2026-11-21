# Model - Lasers

Educator-facing description of the physics. Developer provenance and upstream
quirks: [upstream.md](./upstream.md). Architecture: [implementation-notes.md](./implementation-notes.md).

## Overview

The simulation is a classroom model of how a laser works: atoms with two or three
energy levels, a pump lamp that promotes them, optional seed light that starts
stimulated emission, and optional cavity mirrors that send photons back through
the gain medium. Students watch population inversion build, see stimulated
emission copy photons along a preferred direction, and see output power rise
once enough near-horizontal lower-transition photons are present.

There are two screens that share the same physics with different starting
configurations:

1. **One Atom** — a single stationary atom; two levels by default; a weak seed
   beam; no pump and no mirrors at start.
2. **Multiple Atoms** — thirty moving atoms; three levels by default; a pump
   beam; no seed control at start.

## Quantities and units

Energies are measured relative to the atomic ground level (the model’s zero).
Wavelengths use \(hc = 1239.841984\,\mathrm{eV\cdot nm}\), so a transition of
energy \(E\) corresponds to \(\lambda = hc/E\).

| Quantity | Symbol / control | Units | Typical range |
|---|---|---|---|
| Photon / level energy | \(E\) | eV (above ground) | middle and upper bands kept ordered |
| Wavelength (pump / seed) | \(\lambda\) | nm | visible apparatus band (defaults 440 nm pump, 680 nm seed) |
| Excited-state lifetime | \(\tau\) | model ms | 1 – 400 (defaults: middle 400, upper 100) |
| Seed emission rate | | photons / s | 0 – 30 (One Atom default 1/s) |
| Pump emission rate | | photons / s | 0 – 200 (One Atom) or 0 – 400 (Multiple) |
| Stimulation probability | | — | 0 – 1 (default 0.2) |
| Mirror reflectivity | | — | adjustable on the output (right) mirror |
| Atom count | | — | 1 or 30 |
| Resonance match | | eV | photon matches a transition within 0.05 eV |

Time in the model is educational, not laboratory: the port advances about
300 model milliseconds per real second so cascades and lasing are visible.
Positions use upstream apparatus units inside a fixed cavity, not metres.

## Governing rules

- **Absorption** before stimulation when a photon meets an atom: if the photon
  energy matches an upward gap within 0.05 eV, the atom absorbs and the photon
  disappears.
- **Stimulated emission** copies an incident photon when the atom is in an
  upper state whose downward gap matches; the copy shares direction. Probability
  defaults to 0.2; an option can restrict stimulated transitions to adjacent
  levels only.
- **Spontaneous decay** uses a squared-log lifetime draw
  \(\tau\sqrt{-\ln U}\) against the level’s lifetime control, then cascades to
  the next lower state. Emission directions have a mild (~10%) horizontal bias.
- **Ground recovery:** after a downward transition the atom waits ~200 model ms
  before it can absorb again, so the ground state is not instantly refilled.
- **Mirrors:** left mirror is fully reflecting; right mirror reflectivity is
  adjustable. Photons that miss or transmit become cavity / output power.
- **Lasing / overload:** near-horizontal lower-transition photon count against
  thresholds (~40 lasing, ~300 overload) drives the “lasing” readout and the
  overload (“kaboom”) state.

Population gauges count atoms in ground / middle / upper levels each step.
“Output power” is outgoing photons per second, not a calibrated wattage.

## Simplifications and assumptions

- Ideal two- or three-level atoms; no Doppler broadening, collisions, or
  inhomogeneous lineshape beyond the fixed 0.05 eV match window.
- Lifetime broadening drawn on the energy diagram is illustrative (softer /
  wider lines for shorter \(\tau\)), not a calibrated uncertainty in eV.
- Cavity optics are 1-D mirrors with double reflectivity sampling and
  near-horizontal collimation inherited from the upstream Java model — not a
  full EM mode solver.
- Photon colours follow wavelength; UV / IR use symbolic hues. Atom colour
  encodes level.

## References

Port of PhET Lasers / shared quantum (SVN r75234). See [upstream.md](./upstream.md)
for source mapping, attribution, and numerical differences from the Java original.
