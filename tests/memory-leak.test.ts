import { LaserModel } from "../src/common/model/LaserModel.js";
import { describeDisposalLeaks } from "./helpers/memoryLeak.js";

describeDisposalLeaks([
  { name: "One atom model", create: () => new LaserModel(false) },
  { name: "Multiple atoms model", create: () => new LaserModel(true) },
]);
