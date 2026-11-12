import { type BooleanProperty, DerivedProperty, type NumberProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2, Range } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, HBox, Image, Node, Path, Rectangle, Text, VBox } from "scenerystack/scenery";
import { ResetAllButton, VisibleColor } from "scenerystack/scenery-phet";
import { Dialog, ScreenSummaryContent, ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { Checkbox, HSlider, RectangularPushButton } from "scenerystack/sun";
import photoUrl from "../../../assets/actual-laser.jpg";
import { StringManager } from "../../i18n/StringManager.js";
import Colors from "../../LasersColors.js";
import { PHYSICS } from "../../LasersConstants.js";
import { FLAT_RECTANGULAR_BUTTON_OPTIONS, FLAT_RESET_ALL_BUTTON_OPTIONS } from "../LasersButtonOptions.js";
import { LASERS_CHECKBOX_OPTIONS, LASERS_SLIDER_OPTIONS } from "../LasersControlOptions.js";
import { LasersPanel } from "../LasersPanel.js";
import type { LaserModel } from "../model/LaserModel.js";

export class LaserScreenView extends ScreenView {
  private readonly model: LaserModel;
  private readonly scene = new Node();
  private readonly atomNodes: Circle[] = [];
  private readonly spectralPaths = new Map<number, Path>();
  private readonly wave = new Path(null, { lineWidth: 2 });
  private readonly leftMirror: Rectangle;
  private readonly rightMirror: Rectangle;
  private readonly beam: Rectangle;
  private readonly warning: Text;
  private time = 0;
  private readonly levels = new Path(null, { lineWidth: 3 });

  public constructor(model: LaserModel, options?: ScreenViewOptions) {
    const strings = StringManager.getInstance().getLab();
    const live = new DerivedProperty(
      [
        strings.liveStringProperty,
        model.groundPopulationProperty,
        model.middlePopulationProperty,
        model.highPopulationProperty,
        model.horizontalPhotonsProperty,
      ],
      (s, ...values) => values.reduce((a, v, i) => a.replace(`{${i}}`, `${v}`), s),
    );
    super({
      ...options,
      screenSummaryContent: new ScreenSummaryContent({
        playAreaContent: strings.summaryStringProperty,
        controlAreaContent: strings.controlsStringProperty,
        interactionHintContent: strings.hintStringProperty,
        currentDetailsContent: live,
      }),
    });
    this.model = model;
    const text = (s: string | TReadOnlyProperty<string>, size = 14) =>
      new Text(s, { font: `${size}px sans-serif`, fill: Colors.textColorProperty });
    const traversal: Node[] = [];
    const slider = (
      label: TReadOnlyProperty<string>,
      property: NumberProperty,
      min: number,
      max: number,
      step = 1,
    ): Node => {
      const value = new DerivedProperty([property], (v) => `${Math.round(v * 100) / 100}`);
      const control = new HSlider(property, new Range(min, max), {
        ...LASERS_SLIDER_OPTIONS,
        trackSize: new Dimension2(170, 3),
        accessibleName: label,
        keyboardStep: step,
        shiftKeyboardStep: step / 10,
        constrainValue: (v) => Math.round(v / (step / 10)) * (step / 10),
      });
      traversal.push(control);
      return new VBox({
        align: "left",
        spacing: 4,
        children: [new HBox({ spacing: 10, children: [text(label, 12), text(value, 12)] }), control],
      });
    };
    const check = (label: TReadOnlyProperty<string>, property: BooleanProperty): Checkbox => {
      const node = new Checkbox(property, text(label, 13), { ...LASERS_CHECKBOX_OPTIONS, accessibleName: label });
      traversal.push(node);
      return node;
    };
    const button = (label: TReadOnlyProperty<string>, listener: () => void) => {
      const node = new RectangularPushButton({
        ...FLAT_RECTANGULAR_BUTTON_OPTIONS,
        content: new Text(label, { font: "13px sans-serif" }),
        accessibleName: label,
        listener,
      });
      traversal.push(node);
      return node;
    };
    this.addChild(
      text(model.multiple ? strings.manyTitleStringProperty : strings.oneTitleStringProperty, 25).mutate({
        left: 24,
        top: 16,
      }),
    );
    const lasingLabel = text(strings.lasingStringProperty, 17).mutate({ left: 24, top: 49 });
    this.addChild(lasingLabel);
    model.horizontalPhotonsProperty.link((count) => {
      lasingLabel.visible = count >= PHYSICS.lasing;
    });
    const cavity = new Rectangle(100, 65, 390, 156, 24, 24, {
      fill: Colors.panelBackgroundColorProperty,
      stroke: Colors.panelBorderColorProperty,
      lineWidth: 2,
    });
    this.scene.addChild(cavity);
    this.beam = new Rectangle(100, 0, 390, 65, { fill: Colors.pumpColorProperty, opacity: 0.15 });
    this.scene.addChild(this.beam);
    this.leftMirror = new Rectangle(95, 58, 8, 170, { fill: Colors.mirrorColorProperty });
    this.rightMirror = new Rectangle(488, 58, 8, 170, { fill: Colors.mirrorColorProperty });
    this.scene.addChild(this.wave);
    for (const atom of model.atoms) {
      const circle = new Circle(9, { stroke: Colors.textColorProperty, lineWidth: 1 });
      circle.setTranslation(100 + atom.x * 1.3, 65 + atom.y * 1.3);
      this.atomNodes.push(circle);
      this.scene.addChild(circle);
    }
    this.scene.addChild(this.levels);
    this.scene.addChild(this.leftMirror);
    this.scene.addChild(this.rightMirror);
    this.scene.setTranslation(0, 55);
    this.addChild(this.scene);
    const status = new DerivedProperty(
      [
        strings.statusStringProperty,
        model.groundPopulationProperty,
        model.middlePopulationProperty,
        model.highPopulationProperty,
      ],
      (s, ...values) => values.reduce((a, v, i) => a.replace(`{${i}}`, `${v}`), s),
    );
    this.addChild(text(status, 16).mutate({ left: 24, top: 298, maxWidth: 570 }));
    const power = new DerivedProperty(
      [strings.powerStringProperty, model.horizontalPhotonsProperty, model.outputProperty],
      (s, n, p) => s.replace("{0}", `${n}`).replace("{1}", `${Math.round(p)}`),
    );
    this.addChild(text(power, 14).mutate({ left: 24, top: 323, maxWidth: 575 }));
    this.warning = text(strings.dangerStringProperty, 16).mutate({ left: 24, top: 275, maxWidth: 565 });
    this.addChild(this.warning);
    const controls = new VBox({
      align: "left",
      spacing: 11,
      children: [
        text(strings.energyTitleStringProperty, 17),
        check(strings.threeLevelsStringProperty, model.threeLevelsProperty),
        slider(strings.middleEnergyStringProperty, model.middleEnergyProperty, 0.5, 2.5, 0.01),
        slider(strings.highEnergyStringProperty, model.highEnergyProperty, 2.6, 3.4, 0.01),
        slider(strings.middleLifetimeStringProperty, model.middleLifetimeProperty, 1, 400),
        slider(strings.highLifetimeStringProperty, model.highLifetimeProperty, 1, 400),
        check(strings.mirrorsStringProperty, model.mirrorsProperty),
        slider(strings.reflectivityStringProperty, model.reflectivityProperty, 0, 100),
        check(strings.showUpperStringProperty, model.showUpperProperty),
        check(strings.allStimulatedStringProperty, model.allStimulatedProperty),
        slider(strings.stimulationStringProperty, model.stimulationProperty, 0, 1, 0.01),
      ],
    });
    this.addChild(new LasersPanel(controls, { left: 635, top: 15, xMargin: 16, yMargin: 14 }));
    const pump = new VBox({
      align: "left",
      spacing: 12,
      children: [
        text(strings.pumpTitleStringProperty, 17),
        slider(strings.pumpRateStringProperty, model.pumpRateProperty, 0, model.multiple ? 400 : 200),
        slider(strings.pumpWavelengthStringProperty, model.pumpWavelengthProperty, 380, 780),
        check(strings.beamStringProperty, model.beamProperty),
        check(strings.waveStringProperty, model.waveProperty),
      ],
    });
    this.addChild(new LasersPanel(pump, { left: 24, top: 360, xMargin: 12, yMargin: 12 }));
    const seedRate = slider(strings.seedRateStringProperty, model.seedRateProperty, 0, 30);
    const seedWavelength = slider(strings.seedWavelengthStringProperty, model.seedWavelengthProperty, 380, 780);
    seedRate.visible = seedWavelength.visible = !model.multiple;
    const timeControls = new VBox({
      align: "left",
      spacing: 12,
      children: [
        text(strings.seedTitleStringProperty, 17),
        seedRate,
        seedWavelength,
        slider(strings.speedStringProperty, model.speedProperty, 0.1, 2, 0.1),
        new HBox({
          spacing: 12,
          children: [
            check(strings.playingStringProperty, model.playingProperty),
            button(strings.stepStringProperty, () => model.stepOnce()),
          ],
        }),
      ],
    });
    this.addChild(new LasersPanel(timeControls, { left: 327, top: 360, xMargin: 12, yMargin: 12 }));
    const image = new Image(photoUrl);
    image.maxWidth = 560;
    image.maxHeight = 360;
    const photoDialog = new Dialog(
      new VBox({ spacing: 12, children: [image, text("PhET / University of Colorado Boulder", 13)] }),
      {
        title: text(strings.photoStringProperty, 18),
        fill: Colors.panelBackgroundColorProperty,
        stroke: Colors.panelBorderColorProperty,
      },
    );
    this.addChild(button(strings.photoStringProperty, () => photoDialog.show()).mutate({ left: 24, bottom: 610 }));
    const reset = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      right: this.layoutBounds.maxX - 20,
      bottom: this.layoutBounds.maxY - 20,
      listener: () => {
        model.reset();
        this.time = 0;
        this.render();
      },
    });
    this.addChild(reset);
    traversal.push(reset);
    this.addChild(new Node({ pdomOrder: traversal }));
    // Long-lived screen owns its live summary and controls for the entire simulation lifetime.
    model.threeLevelsProperty.link((three) => {
      for (const index of [3, 5]) {
        const child = controls.children[index];
        if (child) {
          child.visible = three;
        }
      }
      pump.visible = model.multiple || three;
    });
    model.mirrorsProperty.link((mirrors) => {
      seedRate.visible = seedWavelength.visible = !(model.multiple || mirrors);
    });
    this.addChild(text(strings.legendStringProperty, 11).mutate({ left: 24, top: 344, maxWidth: 580 }));
    this.render();
  }

  private render(): void {
    const m = this.model;
    this.leftMirror.visible = this.rightMirror.visible = m.mirrorsProperty.value;
    this.rightMirror.opacity = 0.25 + (m.reflectivityProperty.value / 100) * 0.75;
    this.beam.visible = m.beamProperty.value && (m.multiple || m.threeLevelsProperty.value);
    this.beam.opacity = Math.min(0.5, m.pumpRateProperty.value / 800);
    this.warning.visible = m.explodedProperty.value;
    for (let i = 0; i < m.atoms.length; i++) {
      const a = m.atoms[i];
      const node = this.atomNodes[i];
      if (!(a && node)) {
        continue;
      }
      node.setTranslation(100 + a.x * 1.3, 65 + a.y * 1.3);
      node.fill =
        a.level === 0 ? Colors.atomColorProperty : a.level === 1 ? Colors.laserColorProperty : Colors.pumpColorProperty;
    }
    this.renderPhotons();
    this.renderLevels();
    this.renderWave();
  }

  private renderPhotons(): void {
    const m = this.model;
    const spectra = new Map<number, Shape>();
    for (const p of m.photons) {
      if (p.upper && !m.showUpperProperty.value) {
        continue;
      }
      const pumping = Math.abs(p.vy) > Math.abs(p.vx);
      if (pumping && m.beamProperty.value) {
        continue;
      }
      if (!(pumping || p.upper) && m.waveProperty.value) {
        continue;
      }
      const wavelength = Math.round(Math.max(379, Math.min(781, p.wavelength)));
      let shape = spectra.get(wavelength);
      if (!shape) {
        shape = new Shape();
        spectra.set(wavelength, shape);
      }
      const x = 100 + p.x * 1.3;
      const y = 65 + p.y * 1.3;
      if (x < 10 || x > 610 || y < 0 || y > 210) {
        continue;
      }
      shape.moveTo(x, y).lineTo(x - (p.vx / PHYSICS.photonSpeed) * 7, y - (p.vy / PHYSICS.photonSpeed) * 7);
    }
    for (const path of this.spectralPaths.values()) {
      path.shape = null;
    }
    for (const [wavelength, shape] of spectra) {
      let path = this.spectralPaths.get(wavelength);
      if (!path) {
        path = new Path(null, {
          lineWidth: 3,
          stroke: this.photonColor(wavelength),
        });
        this.spectralPaths.set(wavelength, path);
        this.scene.addChild(path);
      }
      path.shape = shape;
    }
  }

  private photonColor(wavelength: number) {
    if (wavelength > 780) {
      return Colors.upperColorProperty;
    }
    if (wavelength < 380) {
      return Colors.pumpColorProperty;
    }
    return VisibleColor.wavelengthToColor(wavelength);
  }

  private renderLevels(): void {
    const m = this.model;
    const diagram = new Shape();
    for (let level = 0; level < (m.threeLevelsProperty.value ? 3 : 2); level++) {
      const y = 220 - m.energy(level) * 50;
      diagram.moveTo(525, y).lineTo(605, y);
      const count = m.atoms.filter((a) => a.level === level).length;
      for (let i = 0; i < count; i++) {
        const x = 529 + (i % 10) * 7;
        const py = y - 5 - Math.floor(i / 10) * 6;
        diagram.moveTo(x, py).lineTo(x + 2, py);
      }
    }
    this.levels.shape = diagram;
    this.levels.stroke = Colors.textColorProperty;
  }

  private renderWave(): void {
    const m = this.model;
    const wave = new Shape();
    if (m.waveProperty.value) {
      const amplitude = Math.min(40, Math.sqrt(m.horizontalPhotonsProperty.value) * 3);
      for (let x = 100; x < 515; x += 2) {
        const outside = x > 490 ? Math.sqrt(1 - (m.mirrorsProperty.value ? m.reflectivityProperty.value / 100 : 0)) : 1;
        const y =
          143 +
          amplitude *
            outside *
            Math.sin(((x - 100) / (PHYSICS.hc / m.middleEnergyProperty.value)) * 50 - this.time * 5);
        if (x === 100) {
          wave.moveTo(x, y);
        } else {
          wave.lineTo(x, y);
        }
      }
    }
    this.wave.shape = wave;
    this.wave.stroke = VisibleColor.wavelengthToColor(PHYSICS.hc / m.middleEnergyProperty.value, {
      irColor: Colors.upperColorProperty.value,
    });
  }

  public override step(dt: number): void {
    if (this.model.playingProperty.value) {
      this.time += dt;
    }
    this.render();
  }
}
