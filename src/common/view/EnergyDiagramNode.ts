import { DerivedProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2, Range } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, Line, Node, Path, Rectangle, Text, VBox } from "scenerystack/scenery";
import { HSlider, VSlider } from "scenerystack/sun";
import { StringManager } from "../../i18n/StringManager.js";
import Colors from "../../LasersColors.js";
import { VIEW } from "../../LasersConstants.js";
import type { LaserModel } from "../model/LaserModel.js";

/** Standard vertical SceneryStack sliders with energy-line thumbs: pointer and keyboard share one Property. */
export class EnergyDiagramNode extends Node {
  private readonly populations = [new Path(null), new Path(null), new Path(null)];
  private readonly rows: Node[] = [];
  public constructor(privateModel: LaserModel, traversal: Node[]) {
    super();
    const m = privateModel;
    const s = StringManager.getInstance().getLab();
    const text = (label: string | TReadOnlyProperty<string>, size = 12) =>
      new Text(label, { font: `${size}px sans-serif`, fill: Colors.textColorProperty });
    this.addChild(
      new Rectangle(0, 0, VIEW.chartWidth, VIEW.chartHeight, {
        fill: Colors.backgroundColorProperty,
        stroke: Colors.panelBorderColorProperty,
      }),
    );
    this.addChild(text(s.energyTitleStringProperty, 14).mutate({ left: 12, top: 10, maxWidth: 306 }));
    this.addChild(text(s.levelHintStringProperty, 10).mutate({ left: 12, top: 31, maxWidth: 306 }));
    this.addChild(new Line(22, 53, 22, VIEW.groundY + 8, { stroke: Colors.textColorProperty }));
    this.addChild(text(s.energyAxisStringProperty, 11).mutate({ rotation: -Math.PI / 2, centerX: 10, centerY: 142 }));
    this.addChild(new Line(38, VIEW.groundY, 223, VIEW.groundY, { stroke: Colors.atomColorProperty, lineWidth: 2 }));
    this.addChild(text("G", 13).mutate({ centerX: 234, centerY: VIEW.groundY }));
    const levels = [m.middleEnergyProperty, m.highEnergyProperty];
    levels.forEach((property, index) => {
      const color = index === 0 ? Colors.laserColorProperty : Colors.pumpColorProperty;
      const line = new Node({
        children: [
          new Line(-91, 0, 90, 0, { stroke: color, lineWidth: 2 }),
          new Circle(10, { x: 99, fill: color }),
          text(`${index + 1}`, 12).mutate({ centerX: 99, centerY: 0, fill: Colors.controlSurfaceColorProperty }),
          text("↕", 22).mutate({ centerX: 78, centerY: 0 }),
        ],
      });
      line.rotation = Math.PI / 2;
      const slider = new VSlider(property, property.range, {
        thumbNode: line,
        trackSize: new Dimension2(1, property.range.getLength() * VIEW.levelScale),
        trackFillEnabled: null,
        trackStroke: null,
        accessibleName: index === 0 ? s.middleEnergyStringProperty : s.highEnergyStringProperty,
        keyboardStep: 0.01,
        shiftKeyboardStep: 0.001,
      });
      slider.centerX = 135;
      slider.centerY = VIEW.groundY - ((property.range.min + property.range.max) / 2) * VIEW.levelScale;
      this.addChild(slider);
      traversal.push(slider);
      const lifetime = index === 0 ? m.middleLifetimeProperty : m.highLifetimeProperty;
      const life = new HSlider(lifetime, new Range(1, 400), {
        trackSize: new Dimension2(59, 3),
        thumbSize: new Dimension2(10, 16),
        accessibleName: index === 0 ? s.middleLifetimeStringProperty : s.highLifetimeStringProperty,
        keyboardStep: 1,
      });
      const energy = new DerivedProperty([property], (v) => `${Math.round(v * 100) / 100} eV`);
      const row = new VBox({ spacing: 3, children: [text(s.lifetimeStringProperty, 10), life, text(energy, 10)] });
      this.addChild(row);
      traversal.push(life);
      this.rows.push(row);
      property.link((v) => {
        row.left = 250;
        row.centerY = VIEW.groundY - v * VIEW.levelScale;
      });
    });
    for (const node of this.populations) {
      this.addChild(node);
    }
    m.threeLevelsProperty.link((three) => {
      const row = this.rows[1];
      if (row) {
        row.visible = three;
      }
    });
    // The second slider is hidden through its child order, preserving two-level behavior.
    const upperSlider = this.children.filter((n) => n instanceof VSlider)[1];
    m.threeLevelsProperty.link((three) => {
      if (upperSlider) {
        upperSlider.visible = three;
      }
    });
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
        const x = 40 + (i % 20) * 7,
          y = VIEW.groundY - m.energy(level) * VIEW.levelScale - 5 - Math.floor(i / 20) * 6;
        shape.moveTo(x, y).lineTo(x + 3, y);
      }
      node.shape = shape;
      node.stroke = Colors.atomColorProperty;
      node.lineWidth = 4;
      node.visible = level < 2 || m.threeLevelsProperty.value;
    }
  }
}
