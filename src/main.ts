/**
 * main.ts
 *
 * Entry point for the simulation. Initializes SceneryStack, creates the
 * screens, and starts the main event loop.
 *
 * !! CRITICAL IMPORT ORDER !!
 * brand.js MUST be the first import. Each module imports the next, so the import nesting is
 *
 *   main → brand → splash → assert → init
 *
 * and therefore the actual EXECUTION order (deepest import runs first) is the reverse:
 *
 *   init → assert → splash → brand → main
 *
 * SceneryStack requires this exact load order. Never reorder these imports.
 */

// brand.js MUST be first; importing it runs the whole chain (init→assert→splash→brand) before main.
import "./brand.js";

import { onReadyToLaunch, PreferencesModel, Sim } from "scenerystack/sim";
import { Tandem } from "scenerystack/tandem";
import { StringManager } from "./i18n/StringManager.js";
import LasersColors from "./LasersColors.js";
import { MultipleAtomsScreen } from "./multiple-atoms/MultipleAtomsScreen.js";
import { OneAtomScreen } from "./one-atom/OneAtomScreen.js";

onReadyToLaunch(() => {
  const stringManager = StringManager.getInstance();

  // Simulation-specific preferences; initial values come from lasersQueryParameters.

  const screens = [
    new OneAtomScreen({
      name: stringManager.getScreenNames().oneAtomStringProperty,
      tandem: Tandem.ROOT.createTandem("oneAtomScreen"),
      backgroundColorProperty: LasersColors.backgroundColorProperty,
    }),
    new MultipleAtomsScreen({
      name: stringManager.getScreenNames().multipleAtomsStringProperty,
      tandem: Tandem.ROOT.createTandem("multipleAtomsScreen"),
      backgroundColorProperty: LasersColors.backgroundColorProperty,
    }),
  ];

  const sim = new Sim(stringManager.getTitleStringProperty(), screens, {
    preferencesModel: new PreferencesModel({
      visualOptions: {
        // Adds a "Projector Mode" toggle in Preferences → Visual
        supportsProjectorMode: true,
        // Enables keyboard-navigation highlight outlines
        supportsInteractiveHighlights: true,
      },
      localizationOptions: {
        // Adds a language picker in Preferences → Language
        supportsDynamicLocale: true,
      },
    }),

    // Optional: fill in credits shown in Help → About
    credits: {
      leadDesign: "PhET Interactive Simulations, University of Colorado Boulder",
      softwareDevelopment: "OpenLyceum (TypeScript port)",
      team: "",
      qualityAssurance: "",
    },
  });

  sim.start();
});
