/**
 * createLaserControlHelpers.ts
 *
 * Shared factory helpers for labeled sliders, checkboxes, push buttons, radio
 * groups and titled panels used across LaserScreenView and its sidebar.
 */

import { type BooleanProperty, DerivedProperty, type NumberProperty, type TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2, Range, roundSymmetric } from "scenerystack/dot";
import { HBox, type Node, Text, VBox } from "scenerystack/scenery";
import { AquaRadioButtonGroup, Checkbox, HSlider, RectangularPushButton } from "scenerystack/sun";
import Colors from "../../LasersColors.js";
import { CONTROLS, FONTS, PANEL } from "../../LasersConstants.js";
import { FLAT_RECTANGULAR_BUTTON_OPTIONS } from "../LasersButtonOptions.js";
import { LASERS_CHECKBOX_OPTIONS, LASERS_SLIDER_OPTIONS } from "../LasersControlOptions.js";
import { LasersPanel } from "../LasersPanel.js";

export type LaserControlHelpers = {
  readonly text: (label: string | TReadOnlyProperty<string>, size?: number) => Text;
  readonly slider: (
    label: TReadOnlyProperty<string>,
    property: NumberProperty,
    min: number,
    max: number,
    step?: number,
    width?: number,
  ) => Node;
  readonly check: (label: TReadOnlyProperty<string>, property: BooleanProperty) => Node;
  readonly button: (label: TReadOnlyProperty<string>, listener: () => void) => RectangularPushButton;
  readonly radios: (
    property: BooleanProperty,
    labels: [TReadOnlyProperty<string>, TReadOnlyProperty<string>],
    name: TReadOnlyProperty<string>,
  ) => Node;
  readonly group: (title: TReadOnlyProperty<string>, content: Node, minWidth?: number) => Node;
};

export function createLaserControlHelpers(traversal: Node[]): LaserControlHelpers {
  const text = (label: string | TReadOnlyProperty<string>, size: number = FONTS.CONTROL) =>
    new Text(label, { font: `${size}px sans-serif`, fill: Colors.textColorProperty });
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
                (v) => `${roundSymmetric(v * CONTROLS.READOUT_ROUND_FACTOR) / CONTROLS.READOUT_ROUND_FACTOR}`,
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
    const groupNode = new AquaRadioButtonGroup(
      property,
      labels.map((item, i) => ({ value: i === 1, createNode: () => text(item, FONTS.LABEL) })),
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
    traversal.push(groupNode);
    return groupNode;
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
  return { text, slider, check, button, radios, group };
}
