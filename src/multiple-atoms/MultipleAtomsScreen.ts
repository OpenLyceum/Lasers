/**
 * MultipleAtomsScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createMultipleAtomsIcon() in src/common/LasersScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createMultipleAtomsIcon } from "../common/LasersScreenIcons.js";
import LasersColors from "../LasersColors.js";
import { MultipleAtomsModel } from "./model/MultipleAtomsModel.js";
import { MultipleAtomsKeyboardHelpContent } from "./view/MultipleAtomsKeyboardHelpContent.js";
import { MultipleAtomsScreenView } from "./view/MultipleAtomsScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type MultipleAtomsScreenOptions = ScreenOptions & { tandem: Tandem };

export class MultipleAtomsScreen extends Screen<MultipleAtomsModel, MultipleAtomsScreenView> {
  public constructor(options: MultipleAtomsScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new MultipleAtomsModel(),
      // View factory — receives the model instance
      (model) =>
        new MultipleAtomsScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<MultipleAtomsScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: LasersColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new MultipleAtomsKeyboardHelpContent(),
          homeScreenIcon: createMultipleAtomsIcon(),
          navigationBarIcon: createMultipleAtomsIcon(),
        },
        options,
      ),
    );
  }
}
