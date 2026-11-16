/**
 * createLaserSidebar.ts
 *
 * Right-hand control column: energy diagram, level count, view options, and
 * the advanced dialog trigger.
 */

import { HBox, type Node, VBox } from "scenerystack/scenery";
import { Dialog } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager.js";
import Colors from "../../LasersColors.js";
import { CONTROLS, FONTS, RATES, VIEW } from "../../LasersConstants.js";
import type { LaserModel } from "../model/LaserModel.js";
import type { LaserControlHelpers } from "./createLaserControlHelpers.js";
import { EnergyDiagramNode } from "./EnergyDiagramNode.js";

export type LaserSidebar = {
  readonly node: Node;
  readonly energyDiagram: EnergyDiagramNode;
};

export function createLaserSidebar(model: LaserModel, helpers: LaserControlHelpers, traversal: Node[]): LaserSidebar {
  const s = StringManager.getInstance().getLab();
  const { text, slider, check, button, radios, group } = helpers;

  const energyDiagram = new EnergyDiagramNode(model, traversal);
  const levelGroup = group(
    s.levelsStringProperty,
    radios(model.threeLevelsProperty, [s.twoStringProperty, s.threeStringProperty], s.levelsStringProperty),
    VIEW.CHART_WIDTH,
  );
  const optionsGroup = group(
    s.optionsStringProperty,
    new VBox({
      align: "left",
      spacing: CONTROLS.OPTIONS_SPACING,
      children: [
        check(s.mirrorsStringProperty, model.mirrorsProperty),
        check(s.showUpperStringProperty, model.showUpperProperty),
        new HBox({
          spacing: CONTROLS.OPTIONS_COLUMN_SPACING,
          children: [
            new VBox({
              align: "left",
              spacing: CONTROLS.OPTIONS_INNER_SPACING,
              children: [
                text(s.lampViewStringProperty, FONTS.LABEL),
                radios(
                  model.beamProperty,
                  [s.photonsStringProperty, s.beamViewStringProperty],
                  s.lampViewStringProperty,
                ),
              ],
            }),
            new VBox({
              align: "left",
              spacing: CONTROLS.OPTIONS_INNER_SPACING,
              children: [
                text(s.lowerTransitionStringProperty, FONTS.LABEL),
                radios(
                  model.waveProperty,
                  [s.photonsStringProperty, s.waveViewStringProperty],
                  s.lowerTransitionStringProperty,
                ),
              ],
            }),
          ],
        }),
      ],
    }),
    VIEW.CHART_WIDTH,
  );
  const advancedDialog = new Dialog(
    new VBox({
      align: "left",
      spacing: CONTROLS.ADVANCED_SPACING,
      children: [
        check(s.allStimulatedStringProperty, model.allStimulatedProperty),
        slider(
          s.stimulationStringProperty,
          model.stimulationProperty,
          RATES.STIMULATION_RANGE.min,
          RATES.STIMULATION_RANGE.max,
          RATES.STIMULATION_STEP,
        ),
      ],
    }),
    { title: text(s.advancedStringProperty, FONTS.DIALOG_TITLE), fill: Colors.panelBackgroundColorProperty },
  );
  const advanced = button(s.advancedStringProperty, () => advancedDialog.show());
  const node = new VBox({
    align: "left",
    spacing: CONTROLS.SIDEBAR_SPACING,
    children: [energyDiagram, levelGroup, optionsGroup, advanced],
  });
  node.left = VIEW.SIDEBAR_X + VIEW.SIDEBAR_LEFT_INSET;
  node.top = VIEW.SIDEBAR_TOP;

  return { node, energyDiagram };
}
