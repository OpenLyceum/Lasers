/**
 * Derived from PhET Lasers / common quantum, Copyright 2002-2012 University of Colorado.
 * Original source notice: doc/licenses/PhET-GPL-2.txt (GPL version 2 or later).
 * PhET Lasers r75234 model port. Positions use upstream apparatus units, time uses seconds. */
import { BooleanProperty, NumberProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import {
  APPARATUS as A,
  PHYSICS as C,
  ENERGY as E,
  RATES as R,
  RANDOM_SEQUENCE,
  WAVELENGTH as W,
} from "../../LasersConstants.js";

export type Atom = { x: number; y: number; vx: number; vy: number; level: number; remaining: number; cooldown: number };
export type Photon = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  wavelength: number;
  upper: boolean;
  lastAtom: Atom | null;
};

export class LaserModel implements TModel {
  public readonly multiple: boolean;
  private readonly seed: number;
  public readonly playingProperty = new BooleanProperty(true);
  public readonly threeLevelsProperty: BooleanProperty;
  public readonly mirrorsProperty = new BooleanProperty(false);
  public readonly reflectivityProperty = new NumberProperty(R.REFLECTIVITY_DEFAULT, {
    range: R.REFLECTIVITY_RANGE,
  });
  public readonly pumpRateProperty: NumberProperty;
  public readonly seedRateProperty = new NumberProperty(R.SEED_DEFAULT, { range: R.SEED_RANGE });
  public readonly pumpWavelengthProperty = new NumberProperty(W.PUMP_DEFAULT, { range: W.RANGE });
  public readonly seedWavelengthProperty = new NumberProperty(W.SEED_DEFAULT, { range: W.RANGE });
  public readonly middleEnergyProperty = new NumberProperty(C.HC / W.SEED_DEFAULT, { range: E.MIDDLE_RANGE });
  public readonly highEnergyProperty = new NumberProperty(C.HC / W.PUMP_DEFAULT, { range: E.HIGH_RANGE });
  public readonly middleLifetimeProperty = new NumberProperty(E.MIDDLE_LIFETIME_DEFAULT, {
    range: E.LIFETIME_RANGE,
  });
  public readonly highLifetimeProperty = new NumberProperty(E.HIGH_LIFETIME_DEFAULT, {
    range: E.LIFETIME_RANGE,
  });
  public readonly speedProperty = new NumberProperty(R.SPEED_DEFAULT, { range: R.SPEED_RANGE });
  public readonly showUpperProperty = new BooleanProperty(false);
  public readonly beamProperty: BooleanProperty;
  public readonly waveProperty = new BooleanProperty(false);
  public readonly allStimulatedProperty = new BooleanProperty(true);
  public readonly stimulationProperty = new NumberProperty(R.STIMULATION_DEFAULT, {
    range: R.STIMULATION_RANGE,
  });
  public readonly groundPopulationProperty = new NumberProperty(0);
  public readonly middlePopulationProperty = new NumberProperty(0);
  public readonly highPopulationProperty = new NumberProperty(0);
  public readonly horizontalPhotonsProperty = new NumberProperty(0);
  public readonly outputProperty = new NumberProperty(0);
  public readonly explodedProperty = new BooleanProperty(false);
  public atoms: Atom[] = [];
  public photons: Photon[] = [];
  private rng: number;
  private accumulator = 0;
  private pumpAccumulator = 0;
  private seedAccumulator = 0;
  private outputCount = 0;
  private outputTime = 0;
  private readonly levelListener: () => void;

  public constructor(multiple: boolean, seed: number = C.RNG_SEED) {
    this.multiple = multiple;
    this.seed = seed;
    this.rng = seed;
    this.threeLevelsProperty = new BooleanProperty(multiple);
    this.beamProperty = new BooleanProperty(multiple);
    this.pumpRateProperty = new NumberProperty(R.PUMP_DEFAULT, {
      range: new Range(0, multiple ? R.PUMP_MAX_MULTIPLE : R.PUMP_MAX_SINGLE),
    });
    this.levelListener = () => this.clearParticles();
    this.threeLevelsProperty.lazyLink(this.levelListener);
    this.clearParticles();
  }

  private random(): number {
    this.rng = (Math.imul(this.rng, RANDOM_SEQUENCE.MULTIPLIER) + RANDOM_SEQUENCE.INCREMENT) >>> 0;
    return (this.rng + 0.5) / RANDOM_SEQUENCE.MODULUS;
  }

  public energy(level: number): number {
    return level === 0 ? 0 : level === 1 ? this.middleEnergyProperty.value : this.highEnergyProperty.value;
  }

  private clearParticles(): void {
    this.photons = [];
    this.atoms = Array.from({ length: this.multiple ? A.ATOM_COUNT_MULTIPLE : A.ATOM_COUNT_SINGLE }, () => ({
      x: this.multiple ? A.SPAWN_X_MIN + this.random() * A.SPAWN_X_SPAN : A.SINGLE_ATOM_X,
      y: this.multiple ? A.SPAWN_Y_MIN + this.random() * A.SPAWN_Y_SPAN : A.SINGLE_ATOM_Y,
      vx: this.multiple ? (this.random() - 0.5) * A.THERMAL_SPEED : 0,
      vy: this.multiple ? (this.random() - 0.5) * A.THERMAL_SPEED : 0,
      level: 0,
      remaining: 0,
      cooldown: 0,
    }));
    this.accumulator = this.pumpAccumulator = this.seedAccumulator = 0;
    this.outputCount = this.outputTime = 0;
    this.outputProperty.value = 0;
    this.explodedProperty.value = false;
    this.updateCounts();
  }

  private transition(atom: Atom, level: number): void {
    atom.level = level;
    atom.remaining =
      level === 0
        ? 0
        : (Math.sqrt(-Math.log(this.random())) *
            (level === 1 ? this.middleLifetimeProperty.value : this.highLifetimeProperty.value)) /
          C.CLOCK_SCALE;
    atom.cooldown = level === 0 ? C.GROUND_COOLDOWN : 0;
  }

  public addPhoton(x: number, y: number, angle: number, wavelength: number, upper = false): Photon {
    const photon = {
      x,
      y,
      vx: C.PHOTON_SPEED * Math.cos(angle),
      vy: C.PHOTON_SPEED * Math.sin(angle),
      wavelength,
      upper,
      lastAtom: null,
    };
    this.photons.push(photon);
    return photon;
  }

  /** Absorption is checked before stimulated emission, as in AtomicState.java. */
  public interact(atom: Atom, photon: Photon): boolean {
    if (atom.level === 0 && atom.cooldown > 0) {
      return false;
    }
    const energy = C.HC / photon.wavelength;
    const levels = this.threeLevelsProperty.value ? 3 : 2;
    for (let level = levels - 1; level > atom.level; level--) {
      if (Math.abs(this.energy(level) - this.energy(atom.level) - energy) <= C.TOLERANCE) {
        this.transition(atom, level);
        return true;
      }
    }
    for (let level = 0; level < atom.level; level++) {
      if (
        (!this.allStimulatedProperty.value && level !== atom.level - 1) ||
        Math.abs(this.energy(atom.level) - this.energy(level) - energy) > C.TOLERANCE
      ) {
        continue;
      }
      if (this.random() >= this.stimulationProperty.value) {
        return false;
      }
      const angle = Math.atan2(photon.vy, photon.vx);
      const emitted = this.addPhoton(
        atom.x + Math.cos(angle) * A.STIMULATED_OFFSET,
        atom.y + Math.sin(angle) * A.STIMULATED_OFFSET + A.STIMULATED_Y_NUDGE,
        angle,
        photon.wavelength,
        atom.level === 2,
      );
      emitted.lastAtom = atom;
      photon.x = atom.x + Math.cos(angle) * A.STIMULATED_OFFSET;
      photon.y = atom.y + Math.sin(angle) * A.STIMULATED_OFFSET;
      // Upstream AtomicState deliberately goes to ground even for an upper transition.
      this.transition(atom, 0);
      return false;
    }
    return false;
  }

  public step(dt: number): void {
    if (!(this.playingProperty.value && Number.isFinite(dt)) || dt <= 0 || this.explodedProperty.value) {
      return;
    }
    this.advance(Math.min(dt, C.MAX_FRAME) * this.speedProperty.value);
  }

  public stepOnce(): void {
    if (!this.explodedProperty.value) {
      this.advance(C.STEP_DT);
    }
  }

  private advance(dt: number): void {
    this.accumulator += dt;
    while (this.accumulator >= C.FIXED_STEP - C.ACCUMULATOR_EPSILON) {
      this.tick(C.FIXED_STEP);
      this.accumulator -= C.FIXED_STEP;
      if (this.explodedProperty.value) {
        break;
      }
    }
    this.updateCounts();
  }

  private tick(dt: number): void {
    this.emitLamps(dt);
    this.advanceAtoms(dt);
    this.advancePhotons(dt);
    this.outputTime += dt;
    if (this.outputTime >= C.OUTPUT_WINDOW) {
      this.outputProperty.value = this.outputCount / this.outputTime;
      this.outputTime = 0;
      this.outputCount = 0;
    }
    this.updateCounts();
    if (this.horizontalPhotonsProperty.value > C.KABOOM) {
      this.explodedProperty.value = true;
    }
  }

  private emitLamps(dt: number): void {
    this.pumpAccumulator += (this.multiple || this.threeLevelsProperty.value ? this.pumpRateProperty.value : 0) * dt;
    this.seedAccumulator += (!(this.multiple || this.mirrorsProperty.value) ? this.seedRateProperty.value : 0) * dt;
    while (this.pumpAccumulator >= 1) {
      this.pumpAccumulator--;
      this.addPhoton(
        this.multiple ? this.random() * A.WIDTH : A.PUMP_X_SINGLE,
        A.PUMP_Y,
        Math.PI / 2 +
          (this.random() - 0.5) * (this.multiple ? A.PUMP_ANGLE_SPREAD_MULTIPLE : A.PUMP_ANGLE_SPREAD_SINGLE),
        this.pumpWavelengthProperty.value,
      );
    }
    while (this.seedAccumulator >= 1) {
      this.seedAccumulator--;
      this.addPhoton(
        A.SEED_X,
        A.SEED_Y,
        (this.random() - 0.5) * A.SEED_ANGLE_SPREAD,
        this.seedWavelengthProperty.value,
      );
    }
  }

  private advanceAtoms(dt: number): void {
    for (const atom of this.atoms) {
      atom.cooldown = Math.max(0, atom.cooldown - dt);
      atom.x += atom.vx * dt;
      atom.y += atom.vy * dt;
      if (atom.x < A.BOUNDS_MIN || atom.x > A.BOUNDS_MAX_X) {
        atom.vx *= -1;
        atom.x = Math.max(A.BOUNDS_MIN, Math.min(A.BOUNDS_MAX_X, atom.x));
      }
      if (atom.y < A.BOUNDS_MIN || atom.y > A.BOUNDS_MAX_Y) {
        atom.vy *= -1;
        atom.y = Math.max(A.BOUNDS_MIN, Math.min(A.BOUNDS_MAX_Y, atom.y));
      }
      if (atom.level > 0) {
        atom.remaining -= dt;
        if (atom.remaining <= 0) {
          const level = atom.level;
          const angle =
            this.random() < A.COLLINEAR_PROBABILITY ? (this.random() < 0.5 ? 0 : Math.PI) : this.random() * Math.PI * 2;
          this.addPhoton(
            atom.x + A.SPONTANEOUS_OFFSET * Math.cos(angle),
            atom.y + A.SPONTANEOUS_OFFSET * Math.sin(angle),
            angle,
            C.HC / (this.energy(level) - this.energy(level - 1)),
            level === 2,
          );
          this.transition(atom, level - 1);
        }
      }
    }
  }

  private advancePhotons(dt: number): void {
    const survivors: Photon[] = [];
    const current = this.photons;
    this.photons = [];
    for (const p of current) {
      const oldX = p.x;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (this.collideWithAtoms(p)) {
        continue;
      }
      this.reflectPhoton(p, oldX);
      if (p.x > A.CULL_MIN_X && p.x < A.CULL_MAX_X && p.y > A.CULL_MIN_Y && p.y < A.CULL_MAX_Y) {
        survivors.push(p);
      }
    }
    this.photons.push(...survivors);
  }

  private collideWithAtoms(p: Photon): boolean {
    for (const atom of this.atoms) {
      if (Math.hypot(p.x - atom.x, p.y - atom.y) > A.COLLISION_RADIUS) {
        if (p.lastAtom === atom) {
          p.lastAtom = null;
        }
        continue;
      }
      if (p.lastAtom === atom) {
        continue;
      }
      p.lastAtom = atom;
      if (this.interact(atom, p)) {
        return true;
      }
    }
    return false;
  }

  private reflectPhoton(p: Photon, oldX: number): void {
    if (p.y >= 0 && p.y <= A.HEIGHT && this.mirrorsProperty.value) {
      const left = oldX >= 0 && p.x < 0;
      const right = oldX <= A.WIDTH && p.x > A.WIDTH;
      // Legacy collision expert calls the stochastic reflection strategy twice.
      if (left || (right && this.random() < (this.reflectivityProperty.value / 100) ** 2)) {
        p.x = left ? -p.x : A.MIRROR_FOLD - p.x;
        p.vx *= -1;
        if (Math.abs(p.vy / p.vx) < Math.tan(A.AXIS_ANGLE)) {
          p.vy = 0;
        }
      } else if (right) {
        this.outputCount++;
      }
    }
  }

  private updateCounts(): void {
    this.groundPopulationProperty.value = this.atoms.filter((a) => a.level === 0).length;
    this.middlePopulationProperty.value = this.atoms.filter((a) => a.level === 1).length;
    this.highPopulationProperty.value = this.atoms.filter((a) => a.level === 2).length;
    this.horizontalPhotonsProperty.value = this.photons.filter(
      (p) =>
        p.x >= 0 &&
        p.x <= A.WIDTH &&
        p.y >= 0 &&
        p.y <= A.HEIGHT &&
        Math.abs(p.vy) < C.PHOTON_SPEED * Math.sin(A.AXIS_ANGLE) &&
        Math.abs(C.HC / p.wavelength - this.middleEnergyProperty.value) <= C.TOLERANCE,
    ).length;
  }

  public reset(): void {
    for (const p of this.controls) {
      p.reset();
    }
    this.rng = this.seed;
    this.clearParticles();
  }

  private get controls() {
    return [
      this.playingProperty,
      this.threeLevelsProperty,
      this.mirrorsProperty,
      this.reflectivityProperty,
      this.pumpRateProperty,
      this.seedRateProperty,
      this.pumpWavelengthProperty,
      this.seedWavelengthProperty,
      this.middleEnergyProperty,
      this.highEnergyProperty,
      this.middleLifetimeProperty,
      this.highLifetimeProperty,
      this.speedProperty,
      this.showUpperProperty,
      this.beamProperty,
      this.waveProperty,
      this.allStimulatedProperty,
      this.stimulationProperty,
    ];
  }

  public dispose(): void {
    this.threeLevelsProperty.unlink(this.levelListener);
    for (const p of [
      ...this.controls,
      this.groundPopulationProperty,
      this.middlePopulationProperty,
      this.highPopulationProperty,
      this.horizontalPhotonsProperty,
      this.outputProperty,
      this.explodedProperty,
    ]) {
      p.dispose();
    }
    this.atoms = [];
    this.photons = [];
  }
}
