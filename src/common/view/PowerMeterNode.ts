/**
 * PowerMeterNode.ts
 *
 * Two stacked power gauges (internal cavity photon count and output) matching
 * the upstream Java apparatus layout.
 */

import type { TReadOnlyProperty } from "scenerystack/axon";
import { Node, Rectangle, Text } from "scenerystack/scenery";
import { StringManager } from "../../i18n/StringManager.js";
import Colors from "../../LasersColors.js";
import { FONTS, PANEL, PHYSICS, POWER_METER, VIEW } from "../../LasersConstants.js";
import { LasersPanel } from "../LasersPanel.js";
import type { LaserModel } from "../model/LaserModel.js";

export class PowerMeterNode extends Node {
  private readonly internalBar: Rectangle;
  private readonly outputBar: Rectangle;

  public constructor(model: LaserModel) {
    super();
    const s = StringManager.getInstance().getLab();
    const text = (label: string | TReadOnlyProperty<string>, size: number = FONTS.CONTROL) =>
      new Text(label, { font: `${size}px sans-serif`, fill: Colors.textColorProperty });

    const powerContent = new Node();
    powerContent.addChild(
      text(s.powerTitleStringProperty, FONTS.TITLE).mutate({ left: 0, top: POWER_METER.TITLE_TOP }),
    );
    powerContent.addChild(
      text(s.internalPowerStringProperty, FONTS.SMALL).mutate({ left: 0, top: POWER_METER.INTERNAL_LABEL_TOP }),
    );
    powerContent.addChild(
      text(s.outputPowerStringProperty, FONTS.SMALL).mutate({ left: 0, top: POWER_METER.OUTPUT_LABEL_TOP }),
    );
    for (const y of POWER_METER.TRACK_YS) {
      powerContent.addChild(
        new Rectangle(POWER_METER.TRACK_X, y, POWER_METER.TRACK_WIDTH, POWER_METER.TRACK_HEIGHT, {
          fill: Colors.meterBackgroundColorProperty,
          stroke: Colors.panelBorderColorProperty,
        }),
      );
    }
    this.internalBar = new Rectangle(POWER_METER.BAR_X, POWER_METER.INTERNAL_BAR_Y, 0, POWER_METER.BAR_HEIGHT, {
      fill: Colors.gainColorProperty,
    });
    this.outputBar = new Rectangle(POWER_METER.BAR_X, POWER_METER.OUTPUT_BAR_Y, 0, POWER_METER.BAR_HEIGHT, {
      fill: Colors.gainColorProperty,
    });
    powerContent.addChild(this.internalBar);
    powerContent.addChild(this.outputBar);
    powerContent.addChild(
      text(s.lasingStringProperty, FONTS.TINY).mutate({
        left: POWER_METER.LASING_LABEL_LEFT,
        top: POWER_METER.LASING_LABEL_TOP,
      }),
    );
    powerContent.addChild(
      text(`${PHYSICS.KABOOM}`, FONTS.TINY).mutate({
        right: POWER_METER.KABOOM_LABEL_RIGHT,
        top: POWER_METER.KABOOM_LABEL_TOP,
      }),
    );
    const meter = new LasersPanel(powerContent, { xMargin: PANEL.X_MARGIN, yMargin: PANEL.Y_MARGIN });
    this.addChild(meter);
    this.left = model.multiple ? VIEW.METER_LEFT_MULTIPLE : VIEW.METER_LEFT_SINGLE;
    this.top = VIEW.METER_TOP;
  }

  public update(model: LaserModel): void {
    this.internalBar.rectWidth = Math.min(
      POWER_METER.BAR_WIDTH_MAX,
      (model.horizontalPhotonsProperty.value / PHYSICS.KABOOM) * POWER_METER.BAR_WIDTH_MAX,
    );
    this.outputBar.rectWidth = Math.min(
      POWER_METER.BAR_WIDTH_MAX,
      (model.outputProperty.value / POWER_METER.OUTPUT_FULL_SCALE) * POWER_METER.BAR_WIDTH_MAX,
    );
  }
}
