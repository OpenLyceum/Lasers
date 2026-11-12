/**
 * OneAtomScreen.ts
 *
 * The top-level Screen component. It wires together the model and view
 * factories and passes screen-level options (name, background color, tandem)
 * to the parent Screen class.
 *
 * Registered in the screens array in src/main.ts. Its home-screen and navigation-bar
 * icons come from createOneAtomIcon() in src/common/LasersScreenIcons.ts
 * (see doc/multi-screen.md).
 */
import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { ScreenOptions } from "scenerystack/sim";
import { Screen } from "scenerystack/sim";
import type { Tandem } from "scenerystack/tandem";
import { createOneAtomIcon } from "../common/LasersScreenIcons.js";
import LasersColors from "../LasersColors.js";
import { OneAtomModel } from "./model/OneAtomModel.js";
import { OneAtomKeyboardHelpContent } from "./view/OneAtomKeyboardHelpContent.js";
import { OneAtomScreenView } from "./view/OneAtomScreenView.js";

// Require tandem to be explicit — accidental omission would break PhET-iO.
type OneAtomScreenOptions = ScreenOptions & { tandem: Tandem };

export class OneAtomScreen extends Screen<OneAtomModel, OneAtomScreenView> {
  public constructor(options: OneAtomScreenOptions) {
    super(
      // Model factory — called once when the screen is first shown
      () => new OneAtomModel(),
      // View factory — receives the model instance
      (model) =>
        new OneAtomScreenView(model, {
          tandem: options.tandem.createTandem("view"),
        }),
      optionize<OneAtomScreenOptions, EmptySelfOptions, ScreenOptions>()(
        {
          backgroundColorProperty: LasersColors.backgroundColorProperty,
          createKeyboardHelpNode: () => new OneAtomKeyboardHelpContent(),
          homeScreenIcon: createOneAtomIcon(),
          navigationBarIcon: createOneAtomIcon(),
        },
        options,
      ),
    );
  }
}
