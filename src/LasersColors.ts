/**
 * LasersColors.ts
 *
 * Defines all dynamic colors for the simulation using ProfileColorProperty.
 *
 * Each color has two profiles:
 *   - "default"   — used for the original-style white apparatus
 *   - "projector" — used when the user enables Projector Mode in Preferences
 *
 * SceneryStack switches profiles automatically; no manual toggling is needed.
 *
 * ── Usage ─────────────────────────────────────────────────────────────────────
 * Import LasersColors and pass properties directly to Node's fillProperty or
 * strokeProperty options:
 *
 *   import LasersColors from "../../LasersColors.js";
 *
 *   new Rectangle( 0, 0, 100, 50, {
 *     fillProperty: LasersColors.backgroundColorProperty,
 *   });
 *
 * ── How to add a color ────────────────────────────────────────────────────────
 * Add a new ProfileColorProperty entry to the LasersColors object below.
 * Always provide both "default" and "projector" values.
 */
import { ProfileColorProperty } from "scenerystack/scenery";
import LasersNamespace from "./LasersNamespace.js";

const LasersColors = {
  /**
   * Background color for the simulation screen.
   * White apparatus field in both profiles.
   */
  backgroundColorProperty: new ProfileColorProperty(LasersNamespace, "background", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /**
   * Primary accent color for highlights, selected items, and key UI elements.
   * Sky blue in default mode; dark navy in projector mode.
   */
  accentColorProperty: new ProfileColorProperty(LasersNamespace, "accent", {
    default: "#4fc3f7",
    projector: "#1a1a2e",
  }),

  /**
   * Background fill for control panels and dialogs.
   * Muted green-gray control surfaces, inspired by the original.
   */
  panelBackgroundColorProperty: new ProfileColorProperty(LasersNamespace, "panelBackground", {
    default: "#e4e9e5",
    projector: "#f1f3ef",
  }),

  /**
   * Border/stroke color for control panels and dialogs.
   * Muted borders on the light control surfaces.
   */
  panelBorderColorProperty: new ProfileColorProperty(LasersNamespace, "panelBorder", {
    default: "#7d9086",
    projector: "#77857c",
  }),

  /**
   * Text color for labels, readouts, and general UI text.
   * Dark labels on light backgrounds in both profiles.
   */
  textColorProperty: new ProfileColorProperty(LasersNamespace, "text", {
    default: "#18251f",
    projector: "#101710",
  }),

  atomColorProperty: new ProfileColorProperty(LasersNamespace, "atom", { default: "#888080", projector: "#888080" }),
  laserColorProperty: new ProfileColorProperty(LasersNamespace, "laser", { default: "#ed2024", projector: "#bd0018" }),
  pumpColorProperty: new ProfileColorProperty(LasersNamespace, "pump", { default: "#335aff", projector: "#1746b0" }),
  upperColorProperty: new ProfileColorProperty(LasersNamespace, "upper", { default: "#dba2ff", projector: "#7422aa" }),
  mirrorColorProperty: new ProfileColorProperty(LasersNamespace, "mirror", {
    default: "#999999",
    projector: "#777777",
  }),
  cavityColorProperty: new ProfileColorProperty(LasersNamespace, "cavity", {
    default: "#aaa4be",
    projector: "#c4c1d0",
  }),
  meterBackgroundColorProperty: new ProfileColorProperty(LasersNamespace, "meterBackground", {
    default: "#17221c",
    projector: "#17221c",
  }),
  gainColorProperty: new ProfileColorProperty(LasersNamespace, "gain", { default: "#48c84c", projector: "#248b29" }),
  // ── Light control surfaces ───────────────────────────────────────────────────
  // White chrome (combo boxes, flat push buttons, editable input fields) stays light
  // in both profiles; its text stays dark. Same values in default and projector mode,
  // but defined here so every color lives in one themeable place.

  /** Fill of light control surfaces: combo-box button/list, editable input fields. */
  controlSurfaceColorProperty: new ProfileColorProperty(LasersNamespace, "controlSurface", {
    default: "#ffffff",
    projector: "#ffffff",
  }),

  /** Fill of a disabled control surface (grayed-out editable input field). */
  controlSurfaceDisabledColorProperty: new ProfileColorProperty(LasersNamespace, "controlSurfaceDisabled", {
    default: "#cccccc",
    projector: "#cccccc",
  }),

  /** Text on light control surfaces: combo items, flat-button labels, field values, preferences. */
  controlSurfaceTextColorProperty: new ProfileColorProperty(LasersNamespace, "controlSurfaceText", {
    default: "#1a1a1a",
    projector: "#1a1a1a",
  }),
};

export default LasersColors;
