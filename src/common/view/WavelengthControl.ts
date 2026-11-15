import type { NumberProperty, TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2 } from "scenerystack/dot";
import { LinearGradient, Rectangle } from "scenerystack/scenery";
import { NumberControl, SpectrumSliderThumb, VisibleColor } from "scenerystack/scenery-phet";
import { SliderTrack } from "scenerystack/sun";
import { Tandem } from "scenerystack/tandem";
import Colors from "../../LasersColors.js";
import { ARTWORK, FONTS, WAVELENGTH } from "../../LasersConstants.js";
import { FLAT_RECTANGULAR_BUTTON_OPTIONS } from "../LasersButtonOptions.js";

/** WavelengthNumberControl's spectrum is a small bitmap. Use an SVG gradient at every zoom instead. */
export class WavelengthControl extends NumberControl {
  public constructor(wavelength: NumberProperty, title: TReadOnlyProperty<string>) {
    const range = WAVELENGTH.RANGE;
    const gradient = new LinearGradient(0, 0, ARTWORK.SPECTRUM_WIDTH, 0);
    for (let nm = range.min; nm <= range.max; nm += ARTWORK.SPECTRUM_STEP) {
      gradient.addColorStop((nm - range.min) / range.getLength(), VisibleColor.wavelengthToColor(nm));
    }
    const track = new SliderTrack(
      wavelength,
      new Rectangle(0, 0, ARTWORK.SPECTRUM_WIDTH, ARTWORK.SPECTRUM_HEIGHT, {
        fill: gradient,
        stroke: Colors.panelBorderColorProperty,
      }),
      range,
      { tandem: Tandem.OPT_OUT, size: new Dimension2(ARTWORK.SPECTRUM_WIDTH, ARTWORK.SPECTRUM_HEIGHT) },
    );
    super(title, wavelength, range, {
      tandem: Tandem.OPT_OUT,
      renderer: "svg",
      titleNodeOptions: {
        font: `${FONTS.SPECTRUM_TITLE}px sans-serif`,
        maxWidth: ARTWORK.SPECTRUM_TITLE_MAX_WIDTH,
        fill: Colors.textColorProperty,
      },
      numberDisplayOptions: {
        decimalPlaces: 0,
        textOptions: {
          font: `${FONTS.SPECTRUM_DISPLAY}px sans-serif`,
          fill: Colors.controlSurfaceTextColorProperty,
        },
        backgroundFill: Colors.controlSurfaceColorProperty,
        backgroundStroke: Colors.panelBorderColorProperty,
      },
      arrowButtonOptions: FLAT_RECTANGULAR_BUTTON_OPTIONS,
      sliderOptions: {
        trackNode: track,
        thumbNode: new SpectrumSliderThumb(wavelength, {
          width: ARTWORK.SPECTRUM_THUMB_SIZE,
          height: ARTWORK.SPECTRUM_THUMB_SIZE,
          cursorHeight: ARTWORK.SPECTRUM_HEIGHT,
          valueToColor: VisibleColor.wavelengthToColor,
          stroke: Colors.textColorProperty,
          windowCursorOptions: { stroke: Colors.textColorProperty },
        }),
      },
      layoutFunction: NumberControl.createLayoutFunction3(),
    });
  }
}
