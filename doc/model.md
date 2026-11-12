# Laser model

`LaserModel` owns atoms, photons, seeded random sampling, and configuration Properties. Screen wrappers select one atom or thirty atoms. The view only reads particle records and Properties.

A fixed-step accumulator advances lamp emission, moving atoms, spontaneous decay, photon absorption/stimulation, and mirror transport. Energies are relative to ground in eV; wavelength uses hc = 1239.841984 eV nm. Matching tolerance is 0.05 eV. See upstream.md for the original source mapping, lifetimes, and legacy quirks.

Reset restores every control, resets random sampling, clears emission/time accumulators, and recreates the initial particle state. Pause gates automatic stepping; manual stepping preserves pause. Disposal unlinks the mode listener and disposes all owned Properties. Population and power Properties refresh from the particle state.
