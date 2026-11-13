import { DerivedProperty, Multilink, type TReadOnlyProperty } from "scenerystack/axon";
import { Bounds2, Dimension2, Range } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, Line, LinearGradient, Node, Path, Rectangle, Text, VBox } from "scenerystack/scenery";
import { HSlider, VSlider } from "scenerystack/sun";
import { StringManager } from "../../i18n/StringManager.js";
import Colors from "../../LasersColors.js";
import { ENERGY_DIAGRAM as D, VIEW } from "../../LasersConstants.js";
import { LASERS_SLIDER_OPTIONS } from "../LasersControlOptions.js";
import type { LaserModel } from "../model/LaserModel.js";

/** Standard vertical SceneryStack sliders with energy-line thumbs: pointer and keyboard share one Property. */
export class EnergyDiagramNode extends Node {
  private readonly populations = [new Path(null), new Path(null), new Path(null)];
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
    this.addChild(
      new Line(D.lineStart, VIEW.groundY, D.lineEnd, VIEW.groundY, { stroke: Colors.atomColorProperty, lineWidth: 2 }),
    );
    this.addChild(text("G", 13).mutate({ centerX: D.badgeX, centerY: VIEW.groundY }));
    const levels = [m.middleEnergyProperty, m.highEnergyProperty];
    levels.forEach((property, index) => {
      const color = index === 0 ? Colors.laserColorProperty : Colors.pumpColorProperty;
      const lifetime = index === 0 ? m.middleLifetimeProperty : m.highLifetimeProperty;
      const band = new Rectangle(D.lineStart, -D.bandHalfHeight, D.lineEnd - D.lineStart, 2 * D.bandHalfHeight);
      Multilink.multilink([color, lifetime], (levelColor, tau) => {
        // Compress the inverse-lifetime range to make broadening visible at this educational time scale.
        const fraction = Math.sqrt(
          (1 / tau - 1 / lifetime.range.max) / (1 / lifetime.range.min - 1 / lifetime.range.max),
        );
        const width = D.minimumLineWidth + (D.maximumLineWidth - D.minimumLineWidth) * fraction;
        const gradient = new LinearGradient(0, -D.bandHalfHeight, 0, D.bandHalfHeight);
        for (let i = 0; i <= D.gradientIntervals; i++) {
          const offset = i / D.gradientIntervals;
          const y = (2 * offset - 1) * D.bandHalfHeight;
          const alpha = i === 0 || i === D.gradientIntervals ? 0 : Math.exp(-4 * Math.LN2 * (y / width) ** 2);
          gradient.addColorStop(offset, levelColor.withAlpha(alpha));
        }
        band.fill = gradient;
      });
      const line = new Node({
        // Keep the slider's geometry fixed while the visible uncertainty band changes width.
        localBounds: new Bounds2(D.lineStart, -D.bandHalfHeight, D.badgeX + D.badgeRadius, D.bandHalfHeight),
        children: [
          band,
          new Circle(D.badgeRadius, { x: D.badgeX, fill: color }),
          text(`${index + 1}`, 12).mutate({ centerX: D.badgeX, centerY: 0, fill: Colors.levelLabelColorProperty }),
          text("↕", 22).mutate({ centerX: D.lineEnd - 10, centerY: 0 }),
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
      slider.centerX = (D.lineStart + D.badgeX + D.badgeRadius) / 2;
      slider.centerY = VIEW.groundY - ((property.range.min + property.range.max) / 2) * VIEW.levelScale;
      this.addChild(slider);
      traversal.push(slider);
      const life = new HSlider(lifetime, new Range(1, 400), {
        ...LASERS_SLIDER_OPTIONS,
        trackSize: new Dimension2(59, 3),
        thumbSize: new Dimension2(10, 16),
        accessibleName: index === 0 ? s.middleLifetimeStringProperty : s.highLifetimeStringProperty,
        keyboardStep: 1,
      });
      const energy = new DerivedProperty([property], (v) => `${Math.round(v * 100) / 100} eV`);
      const energyLabel = text(energy, 10);
      this.addChild(energyLabel);
      const row = new VBox({ spacing: 3, children: [text(s.lifetimeStringProperty, 10), life] });
      this.addChild(row);
      traversal.push(life);
      property.link((v) => {
        energyLabel.right = D.energyLabelRight;
        energyLabel.centerY = VIEW.groundY - v * VIEW.levelScale;
        row.left = 250;
        row.centerY = VIEW.groundY - v * VIEW.levelScale;
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
        const x = D.populationStart + (i % 20) * D.populationSpacing,
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
