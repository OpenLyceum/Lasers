import type { NumberProperty, TReadOnlyProperty } from "scenerystack/axon";
import { Dimension2, Range } from "scenerystack/dot";
import { LinearGradient, Rectangle } from "scenerystack/scenery";
import { NumberControl, SpectrumSliderThumb, VisibleColor } from "scenerystack/scenery-phet";
import { SliderTrack } from "scenerystack/sun";
import { Tandem } from "scenerystack/tandem";
import Colors from "../../LasersColors.js";
import { ARTWORK } from "../../LasersConstants.js";
import { FLAT_RECTANGULAR_BUTTON_OPTIONS } from "../LasersButtonOptions.js";

/** WavelengthNumberControl's spectrum is a small bitmap. Use an SVG gradient at every zoom instead. */
export class WavelengthControl extends NumberControl {
  public constructor(wavelength: NumberProperty, title: TReadOnlyProperty<string>) {
    const range = new Range(380, 780);
    const gradient = new LinearGradient(0, 0, ARTWORK.spectrumWidth, 0);
    for (let nm = range.min; nm <= range.max; nm += ARTWORK.spectrumStep) {
      gradient.addColorStop((nm - range.min) / range.getLength(), VisibleColor.wavelengthToColor(nm));
    }
    const track = new SliderTrack(
      wavelength,
      new Rectangle(0, 0, ARTWORK.spectrumWidth, ARTWORK.spectrumHeight, {
        fill: gradient,
        stroke: Colors.panelBorderColorProperty,
      }),
      range,
      { tandem: Tandem.OPT_OUT, size: new Dimension2(ARTWORK.spectrumWidth, ARTWORK.spectrumHeight) },
    );
    super(title, wavelength, range, {
      tandem: Tandem.OPT_OUT,
      renderer: "svg",
      titleNodeOptions: { font: "13px sans-serif", maxWidth: 190, fill: Colors.textColorProperty },
      numberDisplayOptions: {
        decimalPlaces: 0,
        textOptions: { font: "14px sans-serif", fill: Colors.controlSurfaceTextColorProperty },
        backgroundFill: Colors.controlSurfaceColorProperty,
        backgroundStroke: Colors.panelBorderColorProperty,
      },
      arrowButtonOptions: FLAT_RECTANGULAR_BUTTON_OPTIONS,
      sliderOptions: {
        trackNode: track,
        thumbNode: new SpectrumSliderThumb(wavelength, {
          width: 25,
          height: 25,
          cursorHeight: ARTWORK.spectrumHeight,
          valueToColor: VisibleColor.wavelengthToColor,
          stroke: Colors.textColorProperty,
          windowCursorOptions: { stroke: Colors.textColorProperty },
        }),
      },
      layoutFunction: NumberControl.createLayoutFunction3(),
    });
  }
}
