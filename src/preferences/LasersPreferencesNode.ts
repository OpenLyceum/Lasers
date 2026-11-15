/**
 * LasersPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Currently empty —
 * add controls here when the sim gains real preferences.
 */

import { Node } from "scenerystack/scenery";
import type { Tandem } from "scenerystack/tandem";
import LasersNamespace from "../LasersNamespace.js";
import type { LasersPreferencesModel } from "./LasersPreferencesModel.js";

/** Empty conventional preferences node; the sim currently uses only framework preferences. */
export class LasersPreferencesNode extends Node {
  public constructor(_preferencesModel: LasersPreferencesModel, _tandem?: Tandem) {
    super();
  }
}

LasersNamespace.register("LasersPreferencesNode", LasersPreferencesNode);
