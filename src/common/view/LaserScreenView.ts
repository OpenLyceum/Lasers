import { type BooleanProperty, DerivedProperty, type NumberProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2, Range, Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import {
  type Circle,
  Color,
  HBox,
  Image,
  Line,
  LinearGradient,
  Node,
  Path,
  Rectangle,
  RichText,
  Text,
  VBox,
} from "scenerystack/scenery";
import { ResetAllButton, TimeControlNode, VisibleColor } from "scenerystack/scenery-phet";
import { Dialog, ScreenSummaryContent, ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import { AquaRadioButtonGroup, Checkbox, HSlider, RectangularPushButton } from "scenerystack/sun";
import photoUrl from "../../../assets/actual-laser.jpg";
import { StringManager } from "../../i18n/StringManager.js";
import Colors from "../../LasersColors.js";
import {
  BEAM_VIEW,
  CONTROLS,
  FONTS,
  PANEL,
  PHOTON_VIEW,
  PHYSICS,
  POWER_METER,
  RATES,
  SCREEN_VIEW_MARGIN,
  VIEW,
  WAVE_VIEW,
  WAVELENGTH,
} from "../../LasersConstants.js";
import {
  FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS,
  FLAT_RECTANGULAR_BUTTON_OPTIONS,
  FLAT_RESET_ALL_BUTTON_OPTIONS,
} from "../LasersButtonOptions.js";
import { LASERS_CHECKBOX_OPTIONS, LASERS_SLIDER_OPTIONS } from "../LasersControlOptions.js";
import { LasersPanel } from "../LasersPanel.js";
import type { LaserModel } from "../model/LaserModel.js";
import { EnergyDiagramNode } from "./EnergyDiagramNode.js";
import { createAtomStates, createLamp, createMirror } from "./LaserArtwork.js";
import { WavelengthControl } from "./WavelengthControl.js";

/** Layout follows the upstream apparatus, rather than arranging its controls as a dashboard. */
export class LaserScreenView extends ScreenView {
  private readonly model: LaserModel;
  private readonly scene = new Node({ renderer: "svg" });
  private readonly atomNodes: { node: Node; states: Circle[]; label: Text }[] = [];
  private readonly spectralPaths = new Map<number, Path>();
  private readonly wave = new Path(null, { lineWidth: WAVE_VIEW.LINE_WIDTH });
  private readonly leftMirror: Node;
  private readonly rightMirror: Node;
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
      renderer: "svg",
      screenSummaryContent: new ScreenSummaryContent({
        playAreaContent: s.summaryStringProperty,
        controlAreaContent: s.controlsStringProperty,
        interactionHintContent: s.hintStringProperty,
        currentDetailsContent: live,
      }),
    });
    this.model = model;
    const text = (label: string | TReadOnlyProperty<string>, size: number = FONTS.CONTROL) =>
      new Text(label, { font: `${size}px sans-serif`, fill: Colors.textColorProperty });
    const traversal: Node[] = [];
    const slider = (
      label: TReadOnlyProperty<string>,
      property: NumberProperty,
      min: number,
      max: number,
      step = 1,
      width: number = CONTROLS.DEFAULT_SLIDER_WIDTH,
    ) => {
      const control = new HSlider(property, new Range(min, max), {
        ...LASERS_SLIDER_OPTIONS,
        trackSize: new Dimension2(width, CONTROLS.TRACK_HEIGHT),
        accessibleName: label,
        keyboardStep: step,
        shiftKeyboardStep: step / CONTROLS.KEYBOARD_STEP_DIVISOR,
      });
      traversal.push(control);
      return new VBox({
        align: "left",
        spacing: CONTROLS.SLIDER_LABEL_SPACING,
        children: [
          new HBox({
            spacing: CONTROLS.SLIDER_READOUT_SPACING,
            children: [
              text(label, FONTS.SMALL),
              text(
                new DerivedProperty(
                  [property],
                  (v) => `${Math.round(v * CONTROLS.READOUT_ROUND_FACTOR) / CONTROLS.READOUT_ROUND_FACTOR}`,
                ),
                FONTS.SMALL,
              ),
            ],
          }),
          control,
        ],
      });
    };
    const check = (label: TReadOnlyProperty<string>, property: BooleanProperty) => {
      const node = new Checkbox(property, text(label, FONTS.LABEL), {
        ...LASERS_CHECKBOX_OPTIONS,
        accessibleName: label,
      });
      traversal.push(node);
      return node;
    };
    const button = (label: TReadOnlyProperty<string>, listener: () => void) => {
      const node = new RectangularPushButton({
        ...FLAT_RECTANGULAR_BUTTON_OPTIONS,
        baseColor: Colors.controlSurfaceColorProperty,
        content: text(label, FONTS.LABEL).mutate({ fill: Colors.controlSurfaceTextColorProperty }),
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
        labels.map((label, i) => ({ value: i === 1, createNode: () => text(label, FONTS.LABEL) })),
        {
          orientation: "horizontal",
          spacing: CONTROLS.RADIO_SPACING,
          radioButtonOptions: {
            radius: CONTROLS.RADIO_RADIUS,
            centerColor: Colors.controlSurfaceTextColorProperty,
            selectedColor: Colors.accentColorProperty,
            deselectedColor: Colors.controlSurfaceColorProperty,
            stroke: Colors.panelBorderColorProperty,
          },
          accessibleName: name,
        },
      );
      traversal.push(group);
      return group;
    };
    const group = (title: TReadOnlyProperty<string>, content: Node, minWidth = 0) =>
      new LasersPanel(
        new VBox({
          align: "left",
          spacing: CONTROLS.GROUP_SPACING,
          children: [text(title, FONTS.CONTROL), content],
        }),
        {
          xMargin: PANEL.X_MARGIN,
          yMargin: PANEL.Y_MARGIN,
          minWidth,
        },
      );
    this.addChild(
      new Rectangle(0, 0, this.layoutBounds.width, this.layoutBounds.height, { fill: Colors.backgroundColorProperty }),
    );
    this.addChild(
      new Rectangle(VIEW.SIDEBAR_X, 0, this.layoutBounds.width - VIEW.SIDEBAR_X, this.layoutBounds.height, {
        fill: Colors.panelBackgroundColorProperty,
      }),
    );
    this.addChild(
      new Line(VIEW.SIDEBAR_X, 0, VIEW.SIDEBAR_X, this.layoutBounds.height, {
        stroke: Colors.panelBorderColorProperty,
      }),
    );

    // Transparent cylindrical cavity with curved end caps, like the Java apparatus.
    const cx = VIEW.CAVITY_X;
    const cy = VIEW.CAVITY_Y;
    const cw = VIEW.CAVITY_WIDTH;
    const ch = VIEW.CAVITY_HEIGHT;
    this.scene.addChild(
      new Rectangle(cx, cy, cw, ch, {
        fill: new LinearGradient(0, cy, 0, cy + ch)
          .addColorStop(0, Colors.cavityColorProperty)
          .addColorStop(0.5, Colors.backgroundColorProperty)
          .addColorStop(1, Colors.cavityColorProperty),
        opacity: VIEW.CAVITY_FILL_OPACITY,
        stroke: Colors.panelBorderColorProperty,
        lineWidth: 1,
      }),
    );
    for (const x of [cx, cx + cw]) {
      this.scene.addChild(
        new Path(Shape.ellipse(new Vector2(x, cy + ch / 2), VIEW.CAVITY_END_RADIUS, ch / 2, 0), {
          fill: Colors.cavityColorProperty,
          opacity: VIEW.CAVITY_END_OPACITY,
          stroke: Colors.panelBorderColorProperty,
        }),
      );
    }
    this.beam = new Path(
      new Shape()
        .moveTo(cx, BEAM_VIEW.TOP)
        .lineTo(cx + cw, BEAM_VIEW.TOP)
        .lineTo(cx + cw + BEAM_VIEW.FLARE, BEAM_VIEW.BOTTOM)
        .lineTo(cx - BEAM_VIEW.FLARE, BEAM_VIEW.BOTTOM)
        .close(),
      { fill: Colors.pumpColorProperty, opacity: 0 },
    );
    this.scene.addChild(this.beam);
    const pumpLamps = new Node();
    const lampCount = model.multiple ? VIEW.PUMP_LAMP_COUNT_MULTIPLE : VIEW.PUMP_LAMP_COUNT_SINGLE;
    for (let i = 0; i < lampCount; i++) {
      const lamp = createLamp();
      lamp.scale(VIEW.PUMP_LAMP_SCALE);
      lamp.rotation = Math.PI / 2;
      lamp.centerX = model.multiple
        ? cx + VIEW.PUMP_LAMP_INSET + (i * (cw - VIEW.PUMP_LAMP_SPAN_INSET)) / (VIEW.PUMP_LAMP_COUNT_MULTIPLE - 1)
        : cx + cw / 2;
      lamp.top = VIEW.PUMP_LAMP_TOP;
      pumpLamps.addChild(lamp);
    }
    this.scene.addChild(pumpLamps);
    const seedLamp = createLamp();
    seedLamp.scale(VIEW.SEED_LAMP_SCALE);
    seedLamp.left = VIEW.SEED_LAMP_LEFT;
    seedLamp.centerY = cy + ch / 2;
    this.scene.addChild(seedLamp);
    this.scene.addChild(this.wave);
    for (const atom of model.atoms) {
      const states = createAtomStates();
      const label = text("G", FONTS.LABEL).mutate({ fill: Colors.atomLabelColorProperty });
      label.centerX = label.centerY = 0;
      const node = new Node({ children: [...states, label] });
      node.setTranslation(cx + atom.x * VIEW.SCALE, cy + atom.y * VIEW.SCALE);
      this.atomNodes.push({ node, states, label });
      this.scene.addChild(node);
    }
    this.leftMirror = createMirror(ch);
    this.leftMirror.centerX = cx;
    this.leftMirror.centerY = cy + ch / 2;
    this.rightMirror = createMirror(ch);
    this.rightMirror.setScaleMagnitude(-1, 1);
    this.rightMirror.centerX = cx + cw;
    this.rightMirror.centerY = cy + ch / 2;
    this.scene.addChild(this.leftMirror);
    this.scene.addChild(this.rightMirror);
    this.addChild(this.scene);

    const lampControl = (pump: boolean) => {
      const rate = pump ? model.pumpRateProperty : model.seedRateProperty;
      const wavelength = pump ? model.pumpWavelengthProperty : model.seedWavelengthProperty;
      const spectrum = new WavelengthControl(
        wavelength,
        pump ? s.pumpWavelengthStringProperty : s.seedWavelengthStringProperty,
      );
      spectrum.scale(VIEW.SPECTRUM_SCALE);
      traversal.push(spectrum);
      const intensity = slider(
        pump ? s.pumpRateStringProperty : s.seedRateStringProperty,
        rate,
        0,
        pump ? (model.multiple ? RATES.PUMP_MAX_MULTIPLE : RATES.PUMP_MAX_SINGLE) : RATES.SEED_RANGE.max,
        1,
        VIEW.LAMP_SLIDER_WIDTH,
      );
      return group(
        s.lampStringProperty,
        new VBox({ align: "left", spacing: CONTROLS.LAMP_PANEL_SPACING, children: [intensity, spectrum] }),
      );
    };
    const pumpPanel = lampControl(true);
    pumpPanel.right = VIEW.SIDEBAR_X - VIEW.MARGIN;
    pumpPanel.top = VIEW.PUMP_PANEL_TOP;
    this.addChild(pumpPanel);
    const seedPanel = lampControl(false);
    seedPanel.left = VIEW.SEED_PANEL_LEFT;
    seedPanel.top = VIEW.SEED_PANEL_TOP;
    this.addChild(seedPanel);
    const reflectivity = new LasersPanel(
      slider(
        s.reflectivityStringProperty,
        model.reflectivityProperty,
        RATES.REFLECTIVITY_RANGE.min,
        RATES.REFLECTIVITY_RANGE.max,
      ),
      {
        xMargin: PANEL.X_MARGIN,
        yMargin: PANEL.Y_MARGIN,
      },
    );
    reflectivity.right = VIEW.SIDEBAR_X - VIEW.REFLECTIVITY_GAP;
    reflectivity.top = VIEW.REFLECTIVITY_TOP;
    reflectivity.scale(VIEW.REFLECTIVITY_SCALE);
    this.addChild(reflectivity);

    // Power meter restores the two stacked gauges from the original.
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
    meter.left = model.multiple ? VIEW.METER_LEFT_MULTIPLE : VIEW.METER_LEFT_SINGLE;
    meter.top = VIEW.METER_TOP;
    this.addChild(meter);
    this.warning = text(s.dangerStringProperty, FONTS.WARNING).mutate({
      left: VIEW.WARNING_LEFT,
      top: VIEW.WARNING_TOP,
      maxWidth: VIEW.WARNING_MAX_WIDTH,
    });
    this.addChild(this.warning);

    this.energyDiagram = new EnergyDiagramNode(model, traversal);
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
    const sidebar = new VBox({
      align: "left",
      spacing: CONTROLS.SIDEBAR_SPACING,
      children: [this.energyDiagram, levelGroup, optionsGroup, advanced],
    });
    sidebar.left = VIEW.SIDEBAR_X + VIEW.SIDEBAR_LEFT_INSET;
    sidebar.top = VIEW.SIDEBAR_TOP;
    this.addChild(sidebar);

    const toolbar = new Rectangle(0, VIEW.TOOLBAR_Y, VIEW.SIDEBAR_X, this.layoutBounds.height - VIEW.TOOLBAR_Y, {
      fill: Colors.panelBackgroundColorProperty,
    });
    this.addChild(toolbar);
    const photoImage = new Image(photoUrl, {
      tagName: "img",
      ariaLabel: s.photoDescriptionStringProperty,
    });
    photoImage.maxWidth = VIEW.PHOTO_MAX_WIDTH;
    photoImage.maxHeight = VIEW.PHOTO_MAX_HEIGHT;
    const photoCaption = new RichText(s.photoDescriptionStringProperty, {
      font: `${FONTS.PHOTO_CAPTION}px sans-serif`,
      fill: Colors.textColorProperty,
      lineWrap: VIEW.PHOTO_LINE_WRAP,
      tagName: "p",
      innerContent: s.photoDescriptionStringProperty,
    });
    const photoCredit = new RichText(s.photoCreditStringProperty, {
      font: `${FONTS.PHOTO_CREDIT}px sans-serif`,
      fill: Colors.textColorProperty,
      linkFill: Colors.textColorProperty,
      lineWrap: VIEW.PHOTO_LINE_WRAP,
      links: {
        source: "https://commons.wikimedia.org/wiki/File:HeNe-Laser.JPG",
        license: "https://creativecommons.org/licenses/by-sa/3.0/",
      },
    });
    const photoDialog = new Dialog(
      new VBox({ spacing: CONTROLS.PHOTO_DIALOG_SPACING, children: [photoImage, photoCaption, photoCredit] }),
      {
        title: text(s.photoStringProperty, FONTS.PHOTO_TITLE),
        fill: Colors.panelBackgroundColorProperty,
      },
    );
    const photo = button(s.photoStringProperty, () => photoDialog.show());
    photo.left = VIEW.PHOTO_LEFT;
    photo.centerY = VIEW.TOOLBAR_Y + VIEW.TOOLBAR_CONTROL_Y_OFFSET;
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
    timeControl.centerX = VIEW.TIME_CONTROL_CENTER_X;
    timeControl.centerY = VIEW.TOOLBAR_Y + VIEW.TOOLBAR_CONTROL_Y_OFFSET;
    this.addChild(timeControl);
    traversal.push(timeControl);
    const rate = slider(
      s.rateStringProperty,
      model.speedProperty,
      RATES.SPEED_RANGE.min,
      RATES.SPEED_RANGE.max,
      RATES.SPEED_STEP,
      VIEW.RATE_SLIDER_WIDTH,
    );
    rate.right = VIEW.SIDEBAR_X - VIEW.RATE_RIGHT_GAP;
    rate.centerY = VIEW.TOOLBAR_Y + VIEW.TOOLBAR_CONTROL_Y_OFFSET;
    this.addChild(rate);
    const reset = new ResetAllButton({
      ...FLAT_RESET_ALL_BUTTON_OPTIONS,
      right: this.layoutBounds.maxX - SCREEN_VIEW_MARGIN,
      bottom: this.layoutBounds.maxY - VIEW.RESET_BOTTOM_MARGIN,
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
    this.rightMirror.opacity =
      BEAM_VIEW.MIRROR_MIN_OPACITY + (m.reflectivityProperty.value / 100) * BEAM_VIEW.MIRROR_OPACITY_SPAN;
    this.beam.visible = m.beamProperty.value && (m.multiple || m.threeLevelsProperty.value);
    this.beam.opacity = (m.pumpRateProperty.value / BEAM_VIEW.OPACITY_RATE_DIVISOR) * BEAM_VIEW.MAX_OPACITY;
    this.beam.fill = this.photonColor(m.pumpWavelengthProperty.value);
    this.warning.visible = m.explodedProperty.value;
    m.atoms.forEach((a, i) => {
      const atom = this.atomNodes[i];
      if (!atom) {
        return;
      }
      atom.node.setTranslation(VIEW.CAVITY_X + a.x * VIEW.SCALE, VIEW.CAVITY_Y + a.y * VIEW.SCALE);
      atom.states.forEach((image, level) => {
        image.visible = level === a.level;
      });
      atom.label.string = a.level === 0 ? "G" : `${a.level}`;
    });
    this.internalBar.rectWidth = Math.min(
      POWER_METER.BAR_WIDTH_MAX,
      (m.horizontalPhotonsProperty.value / PHYSICS.KABOOM) * POWER_METER.BAR_WIDTH_MAX,
    );
    this.outputBar.rectWidth = Math.min(
      POWER_METER.BAR_WIDTH_MAX,
      (m.outputProperty.value / POWER_METER.OUTPUT_FULL_SCALE) * POWER_METER.BAR_WIDTH_MAX,
    );
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
      const wavelength = Math.round(
        Math.max(WAVELENGTH.VIEW_CLAMP_MIN, Math.min(WAVELENGTH.VIEW_CLAMP_MAX, p.wavelength)),
      );
      let shape = spectra.get(wavelength);
      if (!shape) {
        shape = new Shape();
        spectra.set(wavelength, shape);
      }
      const x = VIEW.CAVITY_X + p.x * VIEW.SCALE;
      const y = VIEW.CAVITY_Y + p.y * VIEW.SCALE;
      if (
        x < PHOTON_VIEW.CLIP_MIN_X ||
        x > PHOTON_VIEW.CLIP_MAX_X ||
        y < PHOTON_VIEW.CLIP_MIN_Y ||
        y > PHOTON_VIEW.CLIP_MAX_Y
      ) {
        continue;
      }
      shape
        .moveTo(x, y)
        .lineTo(
          x - (p.vx / PHYSICS.PHOTON_SPEED) * PHOTON_VIEW.TRAIL_LENGTH,
          y - (p.vy / PHYSICS.PHOTON_SPEED) * PHOTON_VIEW.TRAIL_LENGTH,
        );
    }
    for (const path of this.spectralPaths.values()) {
      path.shape = null;
    }
    for (const [wavelength, shape] of spectra) {
      let path = this.spectralPaths.get(wavelength);
      if (!path) {
        path = new Path(null, {
          lineWidth: PHOTON_VIEW.LINE_WIDTH,
          stroke: new DerivedProperty(
            [Colors.backgroundColorProperty, Colors.upperColorProperty, Colors.pumpColorProperty],
            () => this.photonColor(wavelength),
          ),
          lineCap: "round",
        });
        this.spectralPaths.set(wavelength, path);
        this.scene.addChild(path);
      }
      path.shape = shape;
    }
  }

  private photonColor(wavelength: number) {
    if (wavelength > WAVELENGTH.MAX) {
      return Colors.upperColorProperty.value;
    }
    if (wavelength < WAVELENGTH.MIN) {
      return Colors.pumpColorProperty.value;
    }
    const color = VisibleColor.wavelengthToColor(wavelength);
    // Preserve wavelength hue while keeping violet visible on black and yellow visible on white.
    return Color.getLuminance(Colors.backgroundColorProperty.value) > PHOTON_VIEW.LUMINANCE_THRESHOLD
      ? color.colorUtilsDarker(PHOTON_VIEW.DARKEN_FACTOR)
      : color.colorUtilsBrighter(PHOTON_VIEW.BRIGHTEN_FACTOR);
  }

  private renderWave(): void {
    const m = this.model;
    const wave = new Shape();
    if (m.waveProperty.value) {
      const amplitude = Math.min(
        WAVE_VIEW.MAX_AMPLITUDE,
        Math.sqrt(m.horizontalPhotonsProperty.value) * WAVE_VIEW.AMPLITUDE_FACTOR,
      );
      for (let x = VIEW.CAVITY_X; x < WAVE_VIEW.END_X; x += WAVE_VIEW.STEP_X) {
        const outside =
          x > VIEW.CAVITY_X + VIEW.CAVITY_WIDTH
            ? Math.sqrt(1 - (m.mirrorsProperty.value ? m.reflectivityProperty.value / 100 : 0))
            : 1;
        const y =
          VIEW.CAVITY_Y +
          VIEW.CAVITY_HEIGHT / 2 +
          amplitude *
            outside *
            Math.sin(
              ((x - VIEW.CAVITY_X) / (PHYSICS.HC / m.middleEnergyProperty.value)) * WAVE_VIEW.SPATIAL_SCALE -
                this.time * WAVE_VIEW.TIME_SCALE,
            );
        if (x === VIEW.CAVITY_X) {
          wave.moveTo(x, y);
        } else {
          wave.lineTo(x, y);
        }
      }
    }
    this.wave.shape = wave;
    this.wave.stroke = this.photonColor(PHYSICS.HC / m.middleEnergyProperty.value);
  }

  public override step(dt: number): void {
    if (this.model.playingProperty.value) {
      this.time += dt;
    }
    this.render();
  }
}
