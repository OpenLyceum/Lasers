import { DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { Bounds2, Dimension2, roundSymmetric } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, Line, LinearGradient, Node, Path, Rectangle, Text, VBox } from "scenerystack/scenery";
import { HSlider, VSlider } from "scenerystack/sun";
import { StringManager } from "../../i18n/StringManager.js";
import Colors from "../../LasersColors.js";
import { ENERGY_DIAGRAM as D, ENERGY, FONTS, VIEW } from "../../LasersConstants.js";
import { LASERS_SLIDER_OPTIONS } from "../LasersControlOptions.js";
import type { LaserModel } from "../model/LaserModel.js";

/** Standard vertical SceneryStack sliders with energyProperty-line thumbs: pointer and keyboard share one Property. */
export class EnergyDiagramNode extends Node {
  private readonly populations = [new Path(null), new Path(null), new Path(null)];
  public constructor(privateModel: LaserModel, traversal: Node[]) {
    super();
    const m = privateModel;
    const s = StringManager.getInstance().getLab();
    const text = (label: string | TReadOnlyProperty<string>, size: number = FONTS.LABEL) =>
      new Text(label, { font: `${size}px sans-serif`, fill: Colors.textColorProperty });
    this.addChild(
      new Rectangle(0, 0, VIEW.CHART_WIDTH, VIEW.CHART_HEIGHT, {
        fill: Colors.backgroundColorProperty,
        stroke: Colors.panelBorderColorProperty,
      }),
    );
    this.addChild(
      text(s.energyTitleStringProperty, FONTS.ENERGY_TITLE).mutate({
        left: D.TITLE_LEFT,
        top: D.TITLE_TOP,
        maxWidth: D.TITLE_MAX_WIDTH,
      }),
    );
    this.addChild(
      text(s.levelHintStringProperty, FONTS.ENERGY_HINT).mutate({
        left: D.TITLE_LEFT,
        top: D.HINT_TOP,
        maxWidth: D.TITLE_MAX_WIDTH,
      }),
    );
    this.addChild(
      new Line(D.AXIS_X, D.AXIS_TOP, D.AXIS_X, VIEW.GROUND_Y + D.AXIS_BOTTOM_INSET, {
        stroke: Colors.textColorProperty,
      }),
    );
    this.addChild(
      text(s.energyAxisStringProperty, FONTS.ENERGY_AXIS).mutate({
        rotation: -Math.PI / 2,
        centerX: D.AXIS_LABEL_CENTER_X,
        centerY: D.AXIS_LABEL_CENTER_Y,
      }),
    );
    this.addChild(
      new Line(D.LINE_START, VIEW.GROUND_Y, D.LINE_END, VIEW.GROUND_Y, {
        stroke: Colors.atomColorProperty,
        lineWidth: D.GROUND_LINE_WIDTH,
      }),
    );
    this.addChild(text("G", FONTS.ENERGY_BADGE).mutate({ centerX: D.BADGE_X, centerY: VIEW.GROUND_Y }));
    const levels = [m.middleEnergyProperty, m.highEnergyProperty];
    levels.forEach((property, index) => {
      const color = index === 0 ? Colors.laserColorProperty : Colors.pumpColorProperty;
      const lifetime = index === 0 ? m.middleLifetimeProperty : m.highLifetimeProperty;
      const band = new Rectangle(D.LINE_START, -D.BAND_HALF_HEIGHT, D.LINE_END - D.LINE_START, 2 * D.BAND_HALF_HEIGHT);
      Multilink.multilink([color, lifetime], (levelColor, tau) => {
        // Compress the inverse-lifetime range to make broadening visible at this educational time scale.
        const fraction = Math.sqrt(
          (1 / tau - 1 / lifetime.range.max) / (1 / lifetime.range.min - 1 / lifetime.range.max),
        );
        const width = D.MINIMUM_LINE_WIDTH + (D.MAXIMUM_LINE_WIDTH - D.MINIMUM_LINE_WIDTH) * fraction;
        const gradient = new LinearGradient(0, -D.BAND_HALF_HEIGHT, 0, D.BAND_HALF_HEIGHT);
        for (let i = 0; i <= D.GRADIENT_INTERVALS; i++) {
          const offset = i / D.GRADIENT_INTERVALS;
          const y = (2 * offset - 1) * D.BAND_HALF_HEIGHT;
          const alpha = i === 0 || i === D.GRADIENT_INTERVALS ? 0 : Math.exp(-4 * Math.LN2 * (y / width) ** 2);
          gradient.addColorStop(offset, levelColor.withAlpha(alpha));
        }
        band.fill = gradient;
      });
      const line = new Node({
        // Keep the slider's geometry fixed while the visible uncertainty band changes width.
        localBounds: new Bounds2(D.LINE_START, -D.BAND_HALF_HEIGHT, D.BADGE_X + D.BADGE_RADIUS, D.BAND_HALF_HEIGHT),
        children: [
          band,
          new Circle(D.BADGE_RADIUS, { x: D.BADGE_X, fill: color }),
          text(`${index + 1}`, FONTS.LABEL).mutate({
            centerX: D.BADGE_X,
            centerY: 0,
            fill: Colors.levelLabelColorProperty,
          }),
          text("↕", FONTS.ENERGY_HANDLE).mutate({ centerX: D.LINE_END - D.HANDLE_INSET, centerY: 0 }),
        ],
      });
      line.rotation = Math.PI / 2;
      const slider = new VSlider(property, property.range, {
        thumbNode: line,
        trackSize: new Dimension2(D.LIFETIME_TRACK_WIDTH, property.range.getLength() * VIEW.LEVEL_SCALE),
        trackFillEnabled: null,
        trackStroke: null,
        accessibleName: index === 0 ? s.middleEnergyStringProperty : s.highEnergyStringProperty,
        keyboardStep: ENERGY.KEYBOARD_STEP,
        shiftKeyboardStep: ENERGY.SHIFT_KEYBOARD_STEP,
      });
      slider.centerX = (D.LINE_START + D.BADGE_X + D.BADGE_RADIUS) / 2;
      slider.centerY = VIEW.GROUND_Y - ((property.range.min + property.range.max) / 2) * VIEW.LEVEL_SCALE;
      this.addChild(slider);
      traversal.push(slider);
      const life = new HSlider(lifetime, ENERGY.LIFETIME_RANGE, {
        ...LASERS_SLIDER_OPTIONS,
        trackSize: D.LIFETIME_TRACK,
        thumbSize: D.LIFETIME_THUMB,
        accessibleName: index === 0 ? s.middleLifetimeStringProperty : s.highLifetimeStringProperty,
        keyboardStep: 1,
      });
      const energyProperty = new DerivedProperty(
        [property],
        (v) => `${roundSymmetric(v * ENERGY.READOUT_ROUND_FACTOR) / ENERGY.READOUT_ROUND_FACTOR} eV`,
      );
      const energyLabel = text(energyProperty, FONTS.ENERGY_READOUT);
      this.addChild(energyLabel);
      const row = new VBox({
        spacing: D.LIFETIME_ROW_SPACING,
        children: [text(s.lifetimeStringProperty, FONTS.ENERGY_READOUT), life],
      });
      this.addChild(row);
      traversal.push(life);
      property.link((v) => {
        energyLabel.right = D.ENERGY_LABEL_RIGHT;
        energyLabel.centerY = VIEW.GROUND_Y - v * VIEW.LEVEL_SCALE;
        row.left = D.LIFETIME_ROW_LEFT;
        row.centerY = VIEW.GROUND_Y - v * VIEW.LEVEL_SCALE;
      });
      if (index === 1) {
        m.threeLevelsProperty.link((three) => {
          slider.visible = row.visible = energyLabel.visible = three;
        });
      }
    });
    for (const node of this.populations) {
      this.addChild(node);
    }
    this.update(m);
  }

  public update(m: LaserModel): void {
    for (let level = 0; level < 3; level++) {
      const node = this.populations[level];
      if (!node) {
        continue;
      }
      const count = m.atoms.filter((a) => a.level === level).length;
      const shape = new Shape();
      for (let i = 0; i < count; i++) {
        const x = D.POPULATION_START + (i % D.POPULATION_PER_ROW) * D.POPULATION_SPACING;
        const y =
          VIEW.GROUND_Y -
          m.energyProperty(level) * VIEW.LEVEL_SCALE -
          D.POPULATION_Y_OFFSET -
          Math.floor(i / D.POPULATION_PER_ROW) * D.POPULATION_ROW_HEIGHT;
        shape.moveTo(x, y).lineTo(x + D.POPULATION_DASH, y);
      }
      node.shape = shape;
      node.stroke = Colors.atomColorProperty;
      node.lineWidth = D.POPULATION_LINE_WIDTH;
      node.visible = level < 2 || m.threeLevelsProperty.value;
    }
  }
}
