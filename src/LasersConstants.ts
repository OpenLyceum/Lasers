/**
 * LasersConstants.ts
 *
 * Named constants for the simulation: layout sizes in view pixels and the model's
 * physical parameters.
 *
 * Model units (see AGENTS.md):
 *   length     upstream apparatus units (cavity is 300 × 120)
 *   time       seconds of simulation time (PHYSICS.CLOCK_SCALE maps educational time)
 *   energy     eV relative to the −13.6 eV ground level (ground = 0 here)
 *   wavelength nanometres (nm)
 *
 * Layout / chrome values are in screen pixels. Colours live in LasersColors.ts;
 * display strings live in strings_*.json.
 */

import { Dimension2, Range } from "scenerystack/dot";
import LasersNamespace from "./LasersNamespace.js";

/** Margin (view px) between screen content and the layoutBounds edges. */
export const SCREEN_VIEW_MARGIN = 20;

/** Corner radius (view px) for every panel. */
export const PANEL_CORNER_RADIUS = 6;

/**
 * Font sizes (px) used with `${size}px sans-serif`. The sim keeps string fonts
 * rather than PhetFont instances.
 */
export const FONTS = {
  CONTROL: 13,
  SMALL: 11,
  LABEL: 12,
  TITLE: 15,
  TINY: 10,
  WARNING: 16,
  DIALOG_TITLE: 17,
  PHOTO_TITLE: 18,
  PHOTO_CAPTION: 14,
  PHOTO_CREDIT: 13,
  ENERGY_TITLE: 14,
  ENERGY_HINT: 10,
  ENERGY_AXIS: 11,
  ENERGY_BADGE: 13,
  ENERGY_HANDLE: 22,
  ENERGY_READOUT: 10,
  SPECTRUM_TITLE: 13,
  SPECTRUM_DISPLAY: 14,
} as const;

/** Panel margins (px). */
export const PANEL = {
  X_MARGIN: 12,
  Y_MARGIN: 10,
} as const;

/** Shared control dimensions and spacing (px); arrow-button scale is dimensionless. */
export const CONTROLS = {
  THUMB_SIZE: new Dimension2(12, 22),
  STANDALONE_TRACK_SIZE: new Dimension2(150, 3),
  NUMBER_CONTROL_TRACK_SIZE: new Dimension2(110, 3),
  CHECKBOX_BOX_WIDTH: 16,
  ARROW_BUTTON_SCALE: 0.75,
  SLIDER_PADDING: 4,
  ARROW_BUTTON_SPACING: 3,
  VERTICAL_SPACING: 4,
  CHECKBOX_SPACING: 4,
  DEFAULT_SLIDER_WIDTH: 120,
  TRACK_HEIGHT: 3,
  SLIDER_LABEL_SPACING: 5,
  SLIDER_READOUT_SPACING: 8,
  RADIO_SPACING: 12,
  RADIO_RADIUS: 6,
  GROUP_SPACING: 8,
  SIDEBAR_SPACING: 10,
  OPTIONS_SPACING: 10,
  OPTIONS_COLUMN_SPACING: 18,
  OPTIONS_INNER_SPACING: 6,
  ADVANCED_SPACING: 15,
  LAMP_PANEL_SPACING: 12,
  PHOTO_DIALOG_SPACING: 12,
  KEYBOARD_STEP_DIVISOR: 10,
  READOUT_DECIMALS: 100,
} as const;

/**
 * Physics / integration (apparatus units and seconds).
 * CLOCK_SCALE is the upstream educational time factor (300 model ms per wall second).
 */
export const PHYSICS = {
  /** Planck constant × c in eV·nm. */
  HC: 1239.841984,
  /** Resonance match tolerance (eV). */
  TOLERANCE: 0.05,
  /** Educational clock scale: model ms advanced per wall-clock second. */
  CLOCK_SCALE: 300,
  /** Photon speed (apparatus units / s). */
  PHOTON_SPEED: 150,
  /** Cooldown after returning to ground before re-absorption (s). */
  GROUND_COOLDOWN: 0.2,
  /** Fixed integration substep (s). */
  FIXED_STEP: 1 / 120,
  /** Long frames are clamped to this duration (s). */
  MAX_FRAME: 0.25,
  /** Horizontal lasing photons that trigger the kaboom (count). */
  KABOOM: 300,
  /** Illustrative lasing threshold on the power meter (count). */
  LASING: 40,
  /** Time advanced by one step-button press (s). */
  STEP_DT: 1 / 25,
  /** Sliding window for output rate (s). */
  OUTPUT_WINDOW: 1,
  /** Default seeded RNG start value. */
  RNG_SEED: 1729,
  /** Substep accumulator comparison epsilon (s). */
  ACCUMULATOR_EPSILON: 1e-10,
} as const;

/** Visible-spectrum wavelength bounds and lamp defaults (nm). */
export const WAVELENGTH = {
  MIN: 380,
  MAX: 780,
  PUMP_DEFAULT: 440,
  SEED_DEFAULT: 680,
  /** Inclusive clamp used when bucketising photon strokes for Path reuse. */
  VIEW_CLAMP_MIN: 379,
  VIEW_CLAMP_MAX: 781,
  RANGE: new Range(380, 780),
} as const;

/** Energy-level and lifetime defaults / ranges (eV, educational lifetime units). */
export const ENERGY = {
  MIDDLE_RANGE: new Range(0.5, 2.5),
  HIGH_RANGE: new Range(2.6, 3.4),
  LIFETIME_RANGE: new Range(1, 400),
  MIDDLE_LIFETIME_DEFAULT: 400,
  HIGH_LIFETIME_DEFAULT: 100,
  KEYBOARD_STEP: 0.01,
  SHIFT_KEYBOARD_STEP: 0.001,
  READOUT_DECIMALS: 100,
} as const;

/** Rate / reflectivity / speed / stimulation defaults and ranges. */
export const RATES = {
  REFLECTIVITY_DEFAULT: 100,
  REFLECTIVITY_RANGE: new Range(0, 100),
  SEED_DEFAULT: 1,
  SEED_RANGE: new Range(0, 30),
  PUMP_DEFAULT: 0,
  PUMP_MAX_MULTIPLE: 400,
  PUMP_MAX_SINGLE: 200,
  SPEED_DEFAULT: 1,
  SPEED_RANGE: new Range(0.1, 2),
  STIMULATION_DEFAULT: 0.2,
  STIMULATION_RANGE: new Range(0, 1),
  STIMULATION_STEP: 0.01,
  SPEED_STEP: 0.1,
} as const;

/**
 * Apparatus geometry in upstream model units (cavity 300 × 120).
 * Atom / photon collision radii and emission offsets share these units.
 */
export const APPARATUS = {
  WIDTH: 300,
  HEIGHT: 120,
  ATOM_COUNT_MULTIPLE: 30,
  ATOM_COUNT_SINGLE: 1,
  /** Spawn inset and span for multiple-atoms (apparatus units). */
  SPAWN_X_MIN: 20,
  SPAWN_X_SPAN: 260,
  SPAWN_Y_MIN: 20,
  SPAWN_Y_SPAN: 80,
  SINGLE_ATOM_X: 150,
  SINGLE_ATOM_Y: 60,
  /** Peak thermal speed magnitude factor (apparatus units / s). */
  THERMAL_SPEED: 30,
  /** Bounce margins inside the cavity (apparatus units). */
  BOUNDS_MIN: 10,
  BOUNDS_MAX_X: 290,
  BOUNDS_MAX_Y: 110,
  /** Photon–atom interaction radius (apparatus units). */
  COLLISION_RADIUS: 15,
  /** Stimulated-emission photon launch offset from atom centre. */
  STIMULATED_OFFSET: 14,
  STIMULATED_Y_NUDGE: 2,
  /** Spontaneous-emission photon launch offset from atom centre. */
  SPONTANEOUS_OFFSET: 18,
  /** Probability of emitting along the cavity axis when decaying. */
  COLLINEAR_PROBABILITY: 0.1,
  /** Pump beam spawn: y above cavity, x span, angle half-widths (rad). */
  PUMP_Y: -70,
  PUMP_X_SINGLE: 150,
  PUMP_ANGLE_SPREAD_MULTIPLE: Math.PI / 4,
  PUMP_ANGLE_SPREAD_SINGLE: 0.03,
  /** Seed beam spawn (apparatus units, rad). */
  SEED_X: -80,
  SEED_Y: 60,
  SEED_ANGLE_SPREAD: Math.PI / 180,
  /** Photon culling AABB outside the cavity (apparatus units). */
  CULL_MIN_X: -100,
  CULL_MAX_X: 470,
  CULL_MIN_Y: -100,
  CULL_MAX_Y: 260,
  /** Right-mirror image fold: 2 × WIDTH. */
  MIRROR_FOLD: 600,
  /** Near-axis reflection snap: tan(π/60). */
  AXIS_ANGLE: Math.PI / 60,
} as const;

/** Reference layout: apparatus at left, energy chart and grouped controls at right (px). */
export const VIEW = {
  SIDEBAR_X: 658,
  SIDEBAR_WIDTH: 354,
  MARGIN: 12,
  CAVITY_X: 150,
  CAVITY_Y: 220,
  SCALE: 1.1,
  CAVITY_WIDTH: 330,
  CAVITY_HEIGHT: 132,
  TOOLBAR_Y: 550,
  CHART_WIDTH: 330,
  CHART_HEIGHT: 266,
  LEVEL_SCALE: 53,
  GROUND_Y: 224,
  CAVITY_END_RADIUS: 11,
  CAVITY_FILL_OPACITY: 0.65,
  CAVITY_END_OPACITY: 0.45,
  PUMP_LAMP_COUNT_MULTIPLE: 8,
  PUMP_LAMP_COUNT_SINGLE: 1,
  PUMP_LAMP_SCALE: 0.54,
  PUMP_LAMP_TOP: 20,
  PUMP_LAMP_INSET: 20,
  PUMP_LAMP_SPAN_INSET: 40,
  SEED_LAMP_SCALE: 0.65,
  SEED_LAMP_LEFT: 16,
  SPECTRUM_SCALE: 0.72,
  LAMP_SLIDER_WIDTH: 130,
  PUMP_PANEL_TOP: 18,
  SEED_PANEL_LEFT: 24,
  SEED_PANEL_TOP: 366,
  REFLECTIVITY_GAP: 20,
  REFLECTIVITY_TOP: 363,
  REFLECTIVITY_SCALE: 0.85,
  METER_LEFT_MULTIPLE: 190,
  METER_LEFT_SINGLE: 292,
  METER_TOP: 437,
  WARNING_LEFT: 50,
  WARNING_TOP: 190,
  WARNING_MAX_WIDTH: 580,
  SIDEBAR_LEFT_INSET: 12,
  SIDEBAR_TOP: 12,
  TOOLBAR_CONTROL_Y_OFFSET: 34,
  PHOTO_LEFT: 12,
  TIME_CONTROL_CENTER_X: 330,
  RATE_SLIDER_WIDTH: 90,
  RATE_RIGHT_GAP: 18,
  RESET_BOTTOM_MARGIN: 14,
  PHOTO_MAX_WIDTH: 560,
  PHOTO_MAX_HEIGHT: 360,
  PHOTO_LINE_WRAP: 560,
} as const;

/** Pump beam polygon and opacity (px / dimensionless). */
export const BEAM_VIEW = {
  TOP: 110,
  BOTTOM: 540,
  FLARE: 65,
  MAX_OPACITY: 0.27,
  OPACITY_RATE_DIVISOR: 400,
  MIRROR_MIN_OPACITY: 0.4,
  MIRROR_OPACITY_SPAN: 0.6,
} as const;

/** Power-meter layout (px) and full-scale counts. */
export const POWER_METER = {
  TITLE_TOP: 0,
  INTERNAL_LABEL_TOP: 29,
  OUTPUT_LABEL_TOP: 68,
  TRACK_X: 64,
  TRACK_WIDTH: 204,
  TRACK_HEIGHT: 20,
  TRACK_YS: [25, 64] as const,
  BAR_X: 67,
  BAR_WIDTH_MAX: 198,
  BAR_HEIGHT: 14,
  INTERNAL_BAR_Y: 28,
  OUTPUT_BAR_Y: 67,
  LASING_LABEL_LEFT: 90,
  LASING_LABEL_TOP: 48,
  KABOOM_LABEL_RIGHT: 267,
  KABOOM_LABEL_TOP: 48,
  OUTPUT_FULL_SCALE: 100,
} as const;

/** Photon stroke rendering (px) and colour-adjustment factors. */
export const PHOTON_VIEW = {
  TRAIL_LENGTH: 7,
  LINE_WIDTH: 3,
  CLIP_MIN_X: 10,
  CLIP_MAX_X: 650,
  CLIP_MIN_Y: 0,
  CLIP_MAX_Y: 540,
  DARKEN_FACTOR: 0.4,
  BRIGHTEN_FACTOR: 0.2,
  LUMINANCE_THRESHOLD: 0.5,
} as const;

/** Standing-wave display (px and dimensionless rates). */
export const WAVE_VIEW = {
  LINE_WIDTH: 2,
  MAX_AMPLITUDE: 40,
  AMPLITUDE_FACTOR: 3,
  STEP_X: 2,
  SPATIAL_SCALE: 50,
  TIME_SCALE: 5,
  END_X: 650,
} as const;

/** Vector apparatus dimensions in screen coordinates. */
export const ARTWORK = {
  ATOM_RADIUS: 13,
  MIRROR_WIDTH: 19,
  SPECTRUM_WIDTH: 170,
  SPECTRUM_HEIGHT: 15,
  /** nm between SVG gradient stops. */
  SPECTRUM_STEP: 5,
  SPECTRUM_TITLE_MAX_WIDTH: 190,
  SPECTRUM_THUMB_SIZE: 25,
} as const;

/** Energy chart coordinates and illustrative lifetime broadening (screen pixels). */
export const ENERGY_DIAGRAM = {
  LINE_START: 92,
  LINE_END: 223,
  BADGE_X: 234,
  BADGE_RADIUS: 10,
  ENERGY_LABEL_RIGHT: 84,
  POPULATION_START: 98,
  POPULATION_SPACING: 5.5,
  BAND_HALF_HEIGHT: 16,
  GRADIENT_INTERVALS: 32,
  MINIMUM_LINE_WIDTH: 1.5,
  MAXIMUM_LINE_WIDTH: 12,
  TITLE_LEFT: 12,
  TITLE_TOP: 10,
  TITLE_MAX_WIDTH: 306,
  HINT_TOP: 31,
  AXIS_X: 22,
  AXIS_TOP: 53,
  AXIS_BOTTOM_INSET: 8,
  AXIS_LABEL_CENTER_X: 10,
  AXIS_LABEL_CENTER_Y: 142,
  GROUND_LINE_WIDTH: 2,
  LIFETIME_TRACK: new Dimension2(59, 3),
  LIFETIME_THUMB: new Dimension2(10, 16),
  LIFETIME_TRACK_WIDTH: 1,
  HANDLE_INSET: 10,
  LIFETIME_ROW_LEFT: 250,
  LIFETIME_ROW_SPACING: 3,
  POPULATION_PER_ROW: 20,
  POPULATION_Y_OFFSET: 5,
  POPULATION_ROW_HEIGHT: 6,
  POPULATION_DASH: 3,
  POPULATION_LINE_WIDTH: 4,
} as const;

/** Home-screen icon drawing frame (px). */
export const SCREEN_ICONS = {
  WIDTH: 548,
  HEIGHT: 373,
} as const;

/** Icon geometry (px); atom counts are dimensionless. */
export const ICON = {
  CAVITY_X: 65,
  CAVITY_Y: 85,
  CAVITY_WIDTH: 420,
  CAVITY_HEIGHT: 200,
  CAVITY_CORNER: 30,
  CAVITY_LINE_WIDTH: 8,
  WAVE_START_X: 20,
  WAVE_END_X: 530,
  WAVE_STEP: 2,
  WAVE_CENTER_Y: 185,
  WAVE_AMPLITUDE: 20,
  WAVE_PERIOD: 12,
  WAVE_LINE_WIDTH: 6,
  ATOM_RADIUS: 18,
  ATOM_COUNT_MULTIPLE: 9,
  ATOM_LINE_WIDTH: 2,
  SINGLE_ATOM_X: 274,
  SINGLE_ATOM_Y: 185,
  GRID_ORIGIN_X: 130,
  GRID_ORIGIN_Y: 125,
  GRID_SPACING_X: 140,
  GRID_SPACING_Y: 60,
  GRID_COLUMNS: 3,
} as const;

/** Settings for common/view/LaserArtwork.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const LASER_ARTWORK_SETTINGS = {
  LAMP_LENS_CENTER_X: 153, // px
  LAMP_SHADE_TOP: 2, // px
  LAMP_SHADE_BOTTOM: 80, // px
  LAMP_BODY_BOTTOM: 60, // px
  LAMP_LENS_CENTER_Y: 41, // px
  CREATE_LAMP_Y: 22,
  CREATE_LAMP_WIDTH: 114,
  CREATE_LAMP_HEIGHT: 38,
  CREATE_LAMP_CORNER_X: 17,
  CREATE_LAMP_CORNER_Y: 17,
  CREATE_LAMP_LINE_WIDTH: 2,
  CREATE_LAMP_X: 108,
  LAMP_LENS_RADIUS_X: 7,
  LAMP_LENS_RADIUS_Y: 39,
  CREATE_MIRROR_LINE_WIDTH: 1.5,
} as const;

/** Settings for preferences/LasersPreferencesNode.ts. Layout lengths are in px; counts and ratios are dimensionless. */
export const LASERS_PREFERENCES_NODE_SETTINGS = {
  HEADER_FONT_SIZE: 18,
  CONSTRUCTOR_SPACING: 12,
} as const;

/** Seeded linear congruential random generator. */
export const RANDOM_SEQUENCE = {
  /** LCG multiplier (integer). */
  MULTIPLIER: 1664525,
  /** LCG increment (integer). */
  INCREMENT: 1013904223,
  /** Unsigned 32-bit state count (2^32). */
  MODULUS: 4294967296,
} as const;

LasersNamespace.register("LasersConstants", {
  SCREEN_VIEW_MARGIN,
  PANEL_CORNER_RADIUS,
  FONTS,
  PANEL,
  CONTROLS,
  PHYSICS,
  WAVELENGTH,
  ENERGY,
  RATES,
  APPARATUS,
  VIEW,
  BEAM_VIEW,
  POWER_METER,
  PHOTON_VIEW,
  WAVE_VIEW,
  ARTWORK,
  ENERGY_DIAGRAM,
  SCREEN_ICONS,
  ICON,
});
