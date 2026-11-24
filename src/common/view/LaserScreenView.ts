import { DerivedProperty } from "scenerystack/axon";
import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import {
  type Circle,
  Image,
  Line,
  LinearGradient,
  Node,
  Path,
  Rectangle,
  RichText,
  type Text,
  VBox,
} from "scenerystack/scenery";
import { ResetAllButton, TimeControlNode } from "scenerystack/scenery-phet";
import { Dialog, ScreenSummaryContent, ScreenView, type ScreenViewOptions } from "scenerystack/sim";
import photoUrl from "../../../assets/actual-laser.jpg";
import { StringManager } from "../../i18n/StringManager.js";
import Colors from "../../LasersColors.js";
import { BEAM_VIEW, CONTROLS, FONTS, PANEL, RATES, SCREEN_VIEW_MARGIN, VIEW } from "../../LasersConstants.js";
import { FLAT_PLAY_PAUSE_STEP_BUTTON_OPTIONS, FLAT_RESET_ALL_BUTTON_OPTIONS } from "../LasersButtonOptions.js";
import { LasersPanel } from "../LasersPanel.js";
import type { LaserModel } from "../model/LaserModel.js";
import { createLaserControlHelpers } from "./createLaserControlHelpers.js";
import { createLaserSidebar } from "./createLaserSidebar.js";
import type { EnergyDiagramNode } from "./EnergyDiagramNode.js";
import { createAtomStates, createLamp, createMirror } from "./LaserArtwork.js";
import { PhotonWaveRenderer } from "./PhotonWaveRenderer.js";
import { PowerMeterNode } from "./PowerMeterNode.js";
import { WavelengthControl } from "./WavelengthControl.js";

/** Layout follows the upstream apparatus, rather than arranging its controls as a dashboard. */
export class LaserScreenView extends ScreenView {
  private readonly model: LaserModel;
  private readonly scene = new Node({ renderer: "svg" });
  private readonly atomNodes: { node: Node; states: Circle[]; label: Text }[] = [];
  private readonly leftMirror: Node;
  private readonly rightMirror: Node;
  private readonly beam: Path;
  private readonly warning: Text;
  private readonly powerMeter: PowerMeterNode;
  private readonly energyDiagram: EnergyDiagramNode;
  private readonly photons: PhotonWaveRenderer;

  public constructor(model: LaserModel, options?: ScreenViewOptions) {
    const s = StringManager.getInstance().getLab();
    const liveProperty = new DerivedProperty(
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
        currentDetailsContent: liveProperty,
      }),
    });
    this.model = model;
    const traversal: Node[] = [];
    const helpers = createLaserControlHelpers(traversal);
    const { text, slider, button, group } = helpers;

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
    this.photons = new PhotonWaveRenderer(this.scene);
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

    this.powerMeter = new PowerMeterNode(model);
    this.addChild(this.powerMeter);
    this.warning = text(s.dangerStringProperty, FONTS.WARNING).mutate({
      left: VIEW.WARNING_LEFT,
      top: VIEW.WARNING_TOP,
      maxWidth: VIEW.WARNING_MAX_WIDTH,
    });
    this.addChild(this.warning);

    const sidebar = createLaserSidebar(model, helpers, traversal);
    this.energyDiagram = sidebar.energyDiagram;
    this.addChild(sidebar.node);

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
        this.photons.resetTime();
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
    this.beam.fill = this.photons.photonColor(m.pumpWavelengthProperty.value);
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
    this.powerMeter.update(m);
    this.energyDiagram.update(m);
    this.photons.render(m);
  }

  public override step(dt: number): void {
    if (this.model.playingProperty.value) {
      this.photons.advanceTime(dt);
    }
    this.render();
  }
}
