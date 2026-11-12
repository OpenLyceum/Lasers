/**
 * LasersPanel.ts
 *
 * A pre-themed Panel that automatically uses LasersColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { LasersPanel } from "../../common/LasersPanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 8,
 *   });
 *   const panel = new LasersPanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new LasersPanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new LasersPanel(content, { fill: "transparent" });
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { Node } from "scenerystack/scenery";
import { Panel, type PanelOptions } from "scenerystack/sun";
import LasersColors from "../LasersColors.js";
import { PANEL_CORNER_RADIUS } from "../LasersConstants.js";

export type LasersPanelOptions = PanelOptions;

export class LasersPanel extends Panel {
  public constructor(content: Node, providedOptions?: LasersPanelOptions) {
    const options = optionize<LasersPanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        fill: LasersColors.panelBackgroundColorProperty,
        stroke: LasersColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: 12,
        yMargin: 10,
      },
      providedOptions,
    );
    super(content, options);
  }
}
