/**
 * LasersColors.ts
 *
 * Defines all dynamic colors for the simulation using ProfileColorProperty.
 *
 * Each color has two profiles:
 *   - "default"   — black apparatus, dark panels, and light labels
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
   * Black by default, white in Projector Mode.
   */
  backgroundColorProperty: new ProfileColorProperty(LasersNamespace, "background", {
    default: "#000000",
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
   * Dark control panels by default, light panels in Projector Mode.
   */
  panelBackgroundColorProperty: new ProfileColorProperty(LasersNamespace, "panelBackground", {
    default: "#20282e",
    projector: "#f1f3ef",
  }),

  /**
   * Border/stroke color for control panels and dialogs.
   * Visible borders against both panel and apparatus surfaces.
   */
  panelBorderColorProperty: new ProfileColorProperty(LasersNamespace, "panelBorder", {
    default: "#8c9ca6",
    projector: "#77857c",
  }),

  /**
   * Text color for labels, readouts, and general UI text.
   * Light labels in the default profile, dark labels in Projector Mode.
   */
  textColorProperty: new ProfileColorProperty(LasersNamespace, "text", {
    default: "#f2f5f7",
    projector: "#101710",
  }),

  atomColorProperty: new ProfileColorProperty(LasersNamespace, "atom", { default: "#a8b7c4", projector: "#687c8e" }),
  laserColorProperty: new ProfileColorProperty(LasersNamespace, "laser", { default: "#ff6774", projector: "#bd0018" }),
  pumpColorProperty: new ProfileColorProperty(LasersNamespace, "pump", { default: "#819fff", projector: "#1746b0" }),
  upperColorProperty: new ProfileColorProperty(LasersNamespace, "upper", { default: "#dba2ff", projector: "#7422aa" }),
  mirrorColorProperty: new ProfileColorProperty(LasersNamespace, "mirror", {
    default: "#9cabbc",
    projector: "#64758a",
  }),
  cavityColorProperty: new ProfileColorProperty(LasersNamespace, "cavity", {
    default: "#565e85",
    projector: "#c4c1d0",
  }),
  meterBackgroundColorProperty: new ProfileColorProperty(LasersNamespace, "meterBackground", {
    default: "#080e12",
    projector: "#e4ebe5",
  }),
  gainColorProperty: new ProfileColorProperty(LasersNamespace, "gain", { default: "#72eb85", projector: "#186c22" }),
  atomLabelColorProperty: new ProfileColorProperty(LasersNamespace, "atomLabel", {
    default: "#101820",
    projector: "#ffffff",
  }),
  levelLabelColorProperty: new ProfileColorProperty(LasersNamespace, "levelLabel", {
    default: "#101820",
    projector: "#ffffff",
  }),
  highlightColorProperty: new ProfileColorProperty(LasersNamespace, "highlight", {
    default: "#ffffff",
    projector: "#ffffff",
  }),
  lampBodyColorProperty: new ProfileColorProperty(LasersNamespace, "lampBody", {
    default: "#34414d",
    projector: "#343e48",
  }),
  lampRimColorProperty: new ProfileColorProperty(LasersNamespace, "lampRim", {
    default: "#bdccd7",
    projector: "#536474",
  }),
  lampLensColorProperty: new ProfileColorProperty(LasersNamespace, "lampLens", {
    default: "#e1efff",
    projector: "#eef5ff",
  }),
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
