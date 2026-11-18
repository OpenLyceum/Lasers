import { describe, expect, it } from "vitest";
import { LaserModel } from "../src/common/model/LaserModel.js";
import { MultipleAtomsModel } from "../src/multiple-atoms/model/MultipleAtomsModel.js";
import { OneAtomModel } from "../src/one-atom/model/OneAtomModel.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

describeDisposalLeaks([
  { name: "One atom model", create: () => new LaserModel(false) },
  { name: "Multiple atoms model", create: () => new LaserModel(true) },
  { name: "OneAtomModel", create: () => new OneAtomModel() },
  { name: "MultipleAtomsModel", create: () => new MultipleAtomsModel() },
]);

// The screen models own every Property they hold, so collection alone would pass without
// dispose(). Assert the inherited LaserModel.dispose() actually tears them down.
describe("screen models inherit LaserModel.dispose", () => {
  it.each([
    ["OneAtomModel", () => new OneAtomModel(), false],
    ["MultipleAtomsModel", () => new MultipleAtomsModel(), true],
  ] as const)("%s disposes its owned Properties", (_name, create, multiple) => {
    const model = create();
    expect(model.multiple).toBe(multiple);
    const owned = [
      model.playingProperty,
      model.threeLevelsProperty,
      model.pumpRateProperty,
      model.stimulationProperty,
      model.groundPopulationProperty,
      model.outputProperty,
      model.explodedProperty,
    ];
    model.dispose();
    expect(owned.map((p) => p.isDisposed)).toEqual(owned.map(() => true));
    expect(model.atoms).toEqual([]);
  });
});
