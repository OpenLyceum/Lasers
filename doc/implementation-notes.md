# Implementation notes

The two screens use the same model implementation with independent instances and the same accessible view. Localized labels support English, French, and Spanish. The interface follows the upstream arrangement: lamp controls with spectrum sliders beside the optical apparatus, labeled atoms inside a cylindrical cavity, stacked internal/output power gauges, and the energy chart above grouped options in the right sidebar. Photon paths are grouped by wavelength. The level lines are accessible VSlider thumbs; lifetime sliders sit alongside them. Advanced stimulation controls live in a dialog.

Private development intentionally omits deployment and fleet registration. CI runs lint/typecheck/tests/build through Baton's reusable build workflow. The shared compliance checker still reports its unconditional deployment/security workflow requirements; these private-phase deviations are documented in AGENTS.md rather than changing Baton.

Verification: 14 unit/disposal tests; keyboard-driven browser tests on both screens, photo dialog and narrow viewport screenshots; pointer and keyboard fuzz; production build. Run commands are listed in README.md. Unit comparisons use source-defined scenarios, not a running Java oracle. Legacy developer-only view customization is outside this initial port; see upstream.md for differences.
