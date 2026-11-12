/**
 * LasersConstants.ts
 *
 * Central repository for every named numeric constant used across the
 * simulation. Bare numbers that carry semantic meaning (sizes, margins,
 * physics defaults, ranges) belong here rather than inline in model or view
 * code, so they are named, documented, and changed in one place.
 *
 * Conventions
 * ───────────
 *  - Physics / model values use SI units (metres, seconds, kilograms, …);
 *    note the unit in a comment on each value.
 *  - Layout / chrome values are in screen pixels.
 *  - Colour strings live in LasersColors.ts, not here.
 *  - Computed expressions (e.g. `2 * Math.PI`) may stay inline.
 *
 * Remove the example constants below and replace them with the sim's own.
 */

import LasersNamespace from "./LasersNamespace.js";

// ── Layout / chrome (screen pixels) ───────────────────────────────────────────

/** Margin between the screen edge and edge-anchored controls (e.g. Reset All). */
export const SCREEN_VIEW_MARGIN = 20;

/** Corner radius shared by control panels and dialogs. */
export const PANEL_CORNER_RADIUS = 6;

// ── Physics / model defaults (SI units) ───────────────────────────────────────

// Example: export const GRAVITY_MPS2 = 9.81; // m/s²

LasersNamespace.register("LasersConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
});

/** Upstream uses apparatus units and a 12 ms step at 25 fps (300 model ms per second). */
export const PHYSICS = {
  hc: 1239.841984,
  tolerance: 0.05,
  clockScale: 300,
  photonSpeed: 150,
  groundCooldown: 0.2,
  fixedStep: 1 / 120,
  maxFrame: 0.25,
  kaboom: 300,
  lasing: 40,
} as const;

/** Reference layout: apparatus at left, energy chart and grouped controls at right. */
export const VIEW = {
  sidebarX: 658,
  sidebarWidth: 354,
  margin: 12,
  cavityX: 150,
  cavityY: 220,
  scale: 1.1,
  cavityWidth: 330,
  cavityHeight: 132,
  toolbarY: 550,
  chartWidth: 330,
  chartHeight: 266,
  levelScale: 53,
  groundY: 224,
} as const;
