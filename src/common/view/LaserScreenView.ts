import { type BooleanProperty, DerivedProperty, type NumberProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2, Range, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { HBox, Image, Line, LinearGradient, Node, Path, Rectangle, Text, VBox } from "scenerystack/scenery";
import { ResetAllButton, TimeControlNode, VisibleColor, WavelengthNumberControl } from "scenerystack/scenery-phet";
import { Dialog, ScreenSummaryContent, ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { AquaRadioButtonGroup, Checkbox, HSlider, RectangularPushButton } from "scenerystack/sun";
import { Tandem } from "scenerystack/tandem";
import photoUrl from "../../../assets/actual-laser.jpg";
import lampUrl from "../../../assets/phet/flashlight.png";
import mirrorUrl from "../../../assets/phet/mirror.gif";
import blueUrl from "../../../assets/phet/particle-blue-med.gif";
import grayUrl from "../../../assets/phet/particle-gray-med.gif";
import redUrl from "../../../assets/phet/particle-red-med.gif";
import { StringManager } from "../../i18n/StringManager.js";
import Colors from "../../LasersColors.js";
import { PHYSICS, VIEW } from "../../LasersConstants.js";
import {
  FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS,
  FLAT_RECTANGULAR_BUTTON_OPTIONS,
  FLAT_RESET_ALL_BUTTON_OPTIONS,
} from "../LasersButtonOptions.js";
import { LASERS_CHECKBOX_OPTIONS, LASERS_SLIDER_OPTIONS } from "../LasersControlOptions.js";
import { LasersPanel } from "../LasersPanel.js";
import type { LaserModel } from "../model/LaserModel.js";
import { EnergyDiagramNode } from "./EnergyDiagramNode.js";

/** Layout follows the upstream apparatus, rather than arranging its controls as a dashboard. */
export class LaserScreenView extends ScreenView {
  private readonly model: LaserModel;
  private readonly scene = new Node();
  private readonly atomNodes: { node: Node; states: Image[]; label: Text }[] = [];
  private readonly spectralPaths = new Map<number, Path>();
  private readonly wave = new Path(null, { lineWidth: 2 });
  private readonly leftMirror: Image;
  private readonly rightMirror: Image;
  private readonly beam: Path;
  private readonly warning: Text;
  private readonly energyDiagram: EnergyDiagramNode;
  private readonly internalBar: Rectangle;
  private readonly outputBar: Rectangle;
  private time = 0;

  public constructor(model: LaserModel, options?: ScreenViewOptions) {
    const s = StringManager.getInstance().getLab();
    const live = new DerivedProperty(
      [
        s.liveStringProperty,
        model.groundPopulationProperty,
        model.middlePopulationProperty,
        model.highPopulationProperty,
        model.horizontalPhotonsProperty,
      ],
      (str, ...values) => values.reduce((a, v, i) => a.replace(`{${i}}`, `${v}`), str),
    );
    super({
      ...options,
      screenSummaryContent: new ScreenSummaryContent({
        playAreaContent: s.summaryStringProperty,
        controlAreaContent: s.controlsStringProperty,
        interactionHintContent: s.hintStringProperty,
        currentDetailsContent: live,
      }),
    });
    this.model = model;
    const text = (label: string | TReadOnlyProperty<string>, size = 13) =>
      new Text(label, { font: `${size}px sans-serif`, fill: Colors.textColorProperty });
    const traversal: Node[] = [];
    const slider = (
      label: TReadOnlyProperty<string>,
      property: NumberProperty,
      min: number,
      max: number,
      step = 1,
      width = 120,
    ) => {
      const control = new HSlider(property, new Range(min, max), {
        ...LASERS_SLIDER_OPTIONS,
        trackSize: new Dimension2(width, 3),
        accessibleName: label,
        keyboardStep: step,
        shiftKeyboardStep: step / 10,
      });
      traversal.push(control);
      return new VBox({
        align: "left",
        spacing: 5,
        children: [
          new HBox({
            spacing: 8,
            children: [
              text(label, 11),
              text(new DerivedProperty([property], (v) => `${Math.round(v * 100) / 100}`), 11),
            ],
          }),
          control,
        ],
      });
    };
    const check = (label: TReadOnlyProperty<string>, property: BooleanProperty) => {
      const node = new Checkbox(property, text(label, 12), { ...LASERS_CHECKBOX_OPTIONS, accessibleName: label });
      traversal.push(node);
      return node;
    };
    const button = (label: TReadOnlyProperty<string>, listener: () => void) => {
      const node = new RectangularPushButton({
        ...FLAT_RECTANGULAR_BUTTON_OPTIONS,
        content: text(label, 12),
        accessibleName: label,
        listener,
      });
      traversal.push(node);
      return node;
    };
    const radios = (
      property: BooleanProperty,
      labels: [TReadOnlyProperty<string>, TReadOnlyProperty<string>],
      name: TReadOnlyProperty<string>,
    ) => {
      const group = new AquaRadioButtonGroup(
        property,
        labels.map((label, i) => ({ value: i === 1, createNode: () => text(label, 12) })),
        {
          orientation: "horizontal",
          spacing: 12,
          radioButtonOptions: { radius: 6 },
          accessibleName: name,
        },
      );
      traversal.push(group);
      return group;
    };
    const group = (title: TReadOnlyProperty<string>, content: Node, minWidth = 0) =>
      new LasersPanel(new VBox({ align: "left", spacing: 8, children: [text(title, 13), content] }), {
        xMargin: 12,
        yMargin: 10,
        minWidth,
      });
    this.addChild(
      new Rectangle(0, 0, this.layoutBounds.width, this.layoutBounds.height, { fill: Colors.backgroundColorProperty }),
    );
    this.addChild(
      new Rectangle(VIEW.sidebarX, 0, this.layoutBounds.width - VIEW.sidebarX, this.layoutBounds.height, {
        fill: Colors.panelBackgroundColorProperty,
      }),
    );
    this.addChild(
      new Line(VIEW.sidebarX, 0, VIEW.sidebarX, this.layoutBounds.height, { stroke: Colors.panelBorderColorProperty }),
    );

    // Transparent cylindrical cavity with curved end caps, like the Java apparatus.
    const cx = VIEW.cavityX,
      cy = VIEW.cavityY,
      cw = VIEW.cavityWidth,
      ch = VIEW.cavityHeight;
    this.scene.addChild(
      new Rectangle(cx, cy, cw, ch, {
        fill: new LinearGradient(0, cy, 0, cy + ch)
          .addColorStop(0, Colors.cavityColorProperty.value)
          .addColorStop(0.5, Colors.backgroundColorProperty.value)
          .addColorStop(1, Colors.cavityColorProperty.value),
        opacity: 0.65,
        stroke: Colors.panelBorderColorProperty,
        lineWidth: 1,
      }),
    );
    for (const x of [cx, cx + cw]) {
      this.scene.addChild(
        new Path(Shape.ellipse(new Vector2(x, cy + ch / 2), 11, ch / 2, 0), {
          fill: Colors.cavityColorProperty,
          opacity: 0.45,
          stroke: Colors.panelBorderColorProperty,
        }),
      );
    }
    this.beam = new Path(
      new Shape()
        .moveTo(cx, 110)
        .lineTo(cx + cw, 110)
        .lineTo(cx + cw + 65, 540)
        .lineTo(cx - 65, 540)
        .close(),
      { fill: Colors.pumpColorProperty, opacity: 0 },
    );
    this.scene.addChild(this.beam);
    const pumpLamps = new Node();
    for (let i = 0; i < (model.multiple ? 8 : 1); i++) {
      const lamp = new Image(lampUrl);
      lamp.scale(0.54);
      lamp.rotation = Math.PI / 2;
      lamp.localBoundsProperty.link(() => {
        lamp.centerX = model.multiple ? cx + 20 + (i * (cw - 40)) / 7 : cx + cw / 2;
        lamp.top = 20;
      });
      pumpLamps.addChild(lamp);
    }
    this.scene.addChild(pumpLamps);
    const seedLamp = new Image(lampUrl);
    seedLamp.scale(0.65);
    seedLamp.localBoundsProperty.link(() => {
      seedLamp.left = 16;
      seedLamp.centerY = cy + ch / 2;
    });
    this.scene.addChild(seedLamp);
    this.scene.addChild(this.wave);
    for (const atom of model.atoms) {
      const states = [grayUrl, redUrl, blueUrl].map((url) => new Image(url));
      for (const image of states) {
        image.setScaleMagnitude(0.9);
        image.localBoundsProperty.link(() => {
          image.centerX = 0;
          image.centerY = 0;
        });
      }
      const label = text("G", 12);
      label.centerX = label.centerY = 0;
      const node = new Node({ children: [...states, label] });
      node.setTranslation(cx + atom.x * VIEW.scale, cy + atom.y * VIEW.scale);
      this.atomNodes.push({ node, states, label });
      this.scene.addChild(node);
    }
    this.leftMirror = new Image(mirrorUrl);
    this.leftMirror.setScaleMagnitude(1, ch / 161);
    this.leftMirror.centerX = cx;
    this.leftMirror.centerY = cy + ch / 2;
    this.rightMirror = new Image(mirrorUrl);
    this.rightMirror.setScaleMagnitude(-1, ch / 161);
    this.rightMirror.centerX = cx + cw;
    this.rightMirror.centerY = cy + ch / 2;
    this.leftMirror.localBoundsProperty.link(() => {
      this.leftMirror.centerX = cx;
      this.leftMirror.centerY = cy + ch / 2;
    });
    this.rightMirror.localBoundsProperty.link(() => {
      this.rightMirror.centerX = cx + cw;
      this.rightMirror.centerY = cy + ch / 2;
    });
    this.scene.addChild(this.leftMirror);
    this.scene.addChild(this.rightMirror);
    this.addChild(this.scene);

    const lampControl = (pump: boolean) => {
      const rate = pump ? model.pumpRateProperty : model.seedRateProperty;
      const wavelength = pump ? model.pumpWavelengthProperty : model.seedWavelengthProperty;
      const spectrum = new WavelengthNumberControl(wavelength, {
        tandem: Tandem.OPT_OUT,
        title: pump ? s.pumpWavelengthStringProperty : s.seedWavelengthStringProperty,
        range: new Range(380, 780),
        titleNodeOptions: { font: "13px sans-serif", maxWidth: 190, fill: Colors.textColorProperty },
        spectrumSliderTrackOptions: { size: new Dimension2(170, 15) },
      });
      spectrum.scale(0.72);
      traversal.push(spectrum);
      const intensity = slider(
        pump ? s.pumpRateStringProperty : s.seedRateStringProperty,
        rate,
        0,
        pump ? (model.multiple ? 400 : 200) : 30,
        1,
        130,
      );
      return group(s.lampStringProperty, new VBox({ align: "left", spacing: 12, children: [intensity, spectrum] }));
    };
    const pumpPanel = lampControl(true);
    pumpPanel.right = VIEW.sidebarX - 12;
    pumpPanel.top = 18;
    this.addChild(pumpPanel);
    const seedPanel = lampControl(false);
    seedPanel.left = 24;
    seedPanel.top = 366;
    this.addChild(seedPanel);
    const reflectivity = new LasersPanel(slider(s.reflectivityStringProperty, model.reflectivityProperty, 0, 100), {
      xMargin: 12,
      yMargin: 10,
    });
    reflectivity.right = VIEW.sidebarX - 20;
    reflectivity.top = 363;
    reflectivity.scale(0.85);
    this.addChild(reflectivity);

    // Power meter restores the two stacked gauges from the original.
    const powerContent = new Node();
    powerContent.addChild(text(s.powerTitleStringProperty, 15).mutate({ left: 0, top: 0 }));
    powerContent.addChild(text(s.internalPowerStringProperty, 11).mutate({ left: 0, top: 29 }));
    powerContent.addChild(text(s.outputPowerStringProperty, 11).mutate({ left: 0, top: 68 }));
    for (const y of [25, 64]) {
      powerContent.addChild(
        new Rectangle(64, y, 204, 20, {
          fill: Colors.meterBackgroundColorProperty,
          stroke: Colors.panelBorderColorProperty,
        }),
      );
    }
    this.internalBar = new Rectangle(67, 28, 0, 14, { fill: Colors.gainColorProperty });
    this.outputBar = new Rectangle(67, 67, 0, 14, { fill: Colors.gainColorProperty });
    powerContent.addChild(this.internalBar);
    powerContent.addChild(this.outputBar);
    powerContent.addChild(text(s.lasingStringProperty, 10).mutate({ left: 90, top: 48 }));
    powerContent.addChild(text("300", 10).mutate({ right: 267, top: 48 }));
    const meter = new LasersPanel(powerContent, { xMargin: 12, yMargin: 10 });
    meter.left = model.multiple ? 190 : 292;
    meter.top = 437;
    this.addChild(meter);
    this.warning = text(s.dangerStringProperty, 16).mutate({ left: 50, top: 190, maxWidth: 580 });
    this.addChild(this.warning);

    this.energyDiagram = new EnergyDiagramNode(model, traversal);
    const levelGroup = group(
      s.levelsStringProperty,
      radios(model.threeLevelsProperty, [s.twoStringProperty, s.threeStringProperty], s.levelsStringProperty),
      VIEW.chartWidth,
    );
    const optionsGroup = group(
      s.optionsStringProperty,
      new VBox({
        align: "left",
        spacing: 10,
        children: [
          check(s.mirrorsStringProperty, model.mirrorsProperty),
          check(s.showUpperStringProperty, model.showUpperProperty),
          new HBox({
            spacing: 18,
            children: [
              new VBox({
                align: "left",
                spacing: 6,
                children: [
                  text(s.lampViewStringProperty, 12),
                  radios(
                    model.beamProperty,
                    [s.photonsStringProperty, s.beamViewStringProperty],
                    s.lampViewStringProperty,
                  ),
                ],
              }),
              new VBox({
                align: "left",
                spacing: 6,
                children: [
                  text(s.lowerTransitionStringProperty, 12),
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
      VIEW.chartWidth,
    );
    const advancedDialog = new Dialog(
      new VBox({
        align: "left",
        spacing: 15,
        children: [
          check(s.allStimulatedStringProperty, model.allStimulatedProperty),
          slider(s.stimulationStringProperty, model.stimulationProperty, 0, 1, 0.01),
        ],
      }),
      { title: text(s.advancedStringProperty, 17), fill: Colors.panelBackgroundColorProperty },
    );
    const advanced = button(s.advancedStringProperty, () => advancedDialog.show());
    const sidebar = new VBox({
      align: "left",
      spacing: 10,
      children: [this.energyDiagram, levelGroup, optionsGroup, advanced],
    });
    sidebar.left = VIEW.sidebarX + 12;
    sidebar.top = 12;
    this.addChild(sidebar);

    const toolbar = new Rectangle(0, VIEW.toolbarY, VIEW.sidebarX, this.layoutBounds.height - VIEW.toolbarY, {
      fill: Colors.panelBackgroundColorProperty,
    });
    this.addChild(toolbar);
    const photoImage = new Image(photoUrl);
    photoImage.maxWidth = 560;
    photoImage.maxHeight = 360;
    const photoDialog = new Dialog(
      new VBox({ spacing: 12, children: [photoImage, text("PhET / University of Colorado Boulder", 13)] }),
      { title: text(s.photoStringProperty, 18), fill: Colors.panelBackgroundColorProperty },
    );
    const photo = button(s.photoStringProperty, () => photoDialog.show());
    photo.left = 12;
    photo.centerY = VIEW.toolbarY + 34;
    this.addChild(photo);
    const timeControl = new TimeControlNode(model.playingProperty, {
      playPauseStepButtonOptions: {
        ...FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS,
        stepForwardButtonOptions: {
          ...FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS.stepForwardButtonOptions,
          listener: () => model.stepOnce(),
        },
      },
    });
    timeControl.centerX = 330;
    timeControl.centerY = VIEW.toolbarY + 34;
    this.addChild(timeControl);
    traversal.push(timeControl);
    const rate = slider(s.rateStringProperty, model.speedProperty, 0.1, 2, 0.1, 90);
    rate.right = VIEW.sidebarX - 18;
    rate.centerY = VIEW.toolbarY + 34;
    this.addChild(rate);
    const reset = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      right: this.layoutBounds.maxX - 20,
      bottom: this.layoutBounds.maxY - 14,
      listener: () => {
        this.interruptSubtreeInput();
        model.reset();
        this.time = 0;
        this.render();
      },
    });
    this.addChild(reset);
    traversal.push(reset);
    this.addChild(new Node({ pdomOrder: traversal }));
    model.threeLevelsProperty.link((three) => {
      pumpPanel.visible = pumpLamps.visible = model.multiple || three;
    });
    model.mirrorsProperty.link((mirrors) => {
      seedPanel.visible = seedLamp.visible = !(model.multiple || mirrors);
      reflectivity.visible = mirrors;
    });
    this.render();
  }

  private render(): void {
    const m = this.model;
    this.leftMirror.visible = this.rightMirror.visible = m.mirrorsProperty.value;
    this.rightMirror.opacity = 0.4 + (m.reflectivityProperty.value / 100) * 0.6;
    this.beam.visible = m.beamProperty.value && (m.multiple || m.threeLevelsProperty.value);
    this.beam.opacity = (m.pumpRateProperty.value / 400) * 0.27;
    this.beam.fill = VisibleColor.wavelengthToColor(m.pumpWavelengthProperty.value);
    this.warning.visible = m.explodedProperty.value;
    m.atoms.forEach((a, i) => {
      const atom = this.atomNodes[i];
      if (!atom) {
        return;
      }
      atom.node.setTranslation(VIEW.cavityX + a.x * VIEW.scale, VIEW.cavityY + a.y * VIEW.scale);
      atom.states.forEach((image, level) => {
        image.visible = level === a.level;
      });
      atom.label.string = a.level === 0 ? "G" : `${a.level}`;
    });
    this.internalBar.rectWidth = Math.min(198, (m.horizontalPhotonsProperty.value / 300) * 198);
    this.outputBar.rectWidth = Math.min(198, (m.outputProperty.value / 100) * 198);
    this.energyDiagram.update(m);
    this.renderPhotons();
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
      const x = VIEW.cavityX + p.x * VIEW.scale;
      const y = VIEW.cavityY + p.y * VIEW.scale;
      if (x < 10 || x > 650 || y < 0 || y > 540) {
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

  private renderWave(): void {
    const m = this.model;
    const wave = new Shape();
    if (m.waveProperty.value) {
      const amplitude = Math.min(40, Math.sqrt(m.horizontalPhotonsProperty.value) * 3);
      for (let x = VIEW.cavityX; x < 650; x += 2) {
        const outside =
          x > VIEW.cavityX + VIEW.cavityWidth
            ? Math.sqrt(1 - (m.mirrorsProperty.value ? m.reflectivityProperty.value / 100 : 0))
            : 1;
        const y =
          VIEW.cavityY +
          VIEW.cavityHeight / 2 +
          amplitude *
            outside *
            Math.sin(((x - VIEW.cavityX) / (PHYSICS.hc / m.middleEnergyProperty.value)) * 50 - this.time * 5);
        if (x === VIEW.cavityX) {
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
