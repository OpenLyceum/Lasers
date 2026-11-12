/**
 * Derived from PhET Lasers / common quantum, Copyright 2002-2012 University of Colorado.
 * Original source notice: doc/licenses/PhET-GPL-2.txt (GPL version 2 or later).
 * PhET Lasers r75234 model port. Positions use upstream apparatus units, time uses seconds. */
import { BooleanProperty, NumberProperty } from "scenerystack/axon";
import { Range } from "scenerystack/dot";
import type { TModel } from "scenerystack/joist";
import { PHYSICS as C } from "../../LasersConstants.js";

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
  public readonly reflectivityProperty = new NumberProperty(100, { range: new Range(0, 100) });
  public readonly pumpRateProperty: NumberProperty;
  public readonly seedRateProperty = new NumberProperty(1, { range: new Range(0, 30) });
  public readonly pumpWavelengthProperty = new NumberProperty(440, { range: new Range(380, 780) });
  public readonly seedWavelengthProperty = new NumberProperty(680, { range: new Range(380, 780) });
  public readonly middleEnergyProperty = new NumberProperty(C.hc / 680, { range: new Range(0.5, 2.5) });
  public readonly highEnergyProperty = new NumberProperty(C.hc / 440, { range: new Range(2.6, 3.4) });
  public readonly middleLifetimeProperty = new NumberProperty(400, { range: new Range(1, 400) });
  public readonly highLifetimeProperty = new NumberProperty(100, { range: new Range(1, 400) });
  public readonly speedProperty = new NumberProperty(1, { range: new Range(0.1, 2) });
  public readonly showUpperProperty = new BooleanProperty(false);
  public readonly beamProperty: BooleanProperty;
  public readonly waveProperty = new BooleanProperty(false);
  public readonly allStimulatedProperty = new BooleanProperty(true);
  public readonly stimulationProperty = new NumberProperty(0.2, { range: new Range(0, 1) });
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

  public constructor(multiple: boolean, seed = 1729) {
    this.multiple = multiple;
    this.seed = seed;
    this.rng = seed;
    this.threeLevelsProperty = new BooleanProperty(multiple);
    this.beamProperty = new BooleanProperty(multiple);
    this.pumpRateProperty = new NumberProperty(0, { range: new Range(0, multiple ? 400 : 200) });
    this.levelListener = () => this.clearParticles();
    this.threeLevelsProperty.lazyLink(this.levelListener);
    this.clearParticles();
  }

  private random(): number {
    this.rng = (Math.imul(this.rng, 1664525) + 1013904223) >>> 0;
    return (this.rng + 0.5) / 4294967296;
  }

  public energy(level: number): number {
    return level === 0 ? 0 : level === 1 ? this.middleEnergyProperty.value : this.highEnergyProperty.value;
  }

  private clearParticles(): void {
    this.photons = [];
    this.atoms = Array.from({ length: this.multiple ? 30 : 1 }, () => ({
      x: this.multiple ? 20 + this.random() * 260 : 150,
      y: this.multiple ? 20 + this.random() * 80 : 60,
      vx: this.multiple ? (this.random() - 0.5) * 30 : 0,
      vy: this.multiple ? (this.random() - 0.5) * 30 : 0,
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
          C.clockScale;
    atom.cooldown = level === 0 ? C.groundCooldown : 0;
  }

  public addPhoton(x: number, y: number, angle: number, wavelength: number, upper = false): Photon {
    const photon = {
      x,
      y,
      vx: C.photonSpeed * Math.cos(angle),
      vy: C.photonSpeed * Math.sin(angle),
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
    const energy = C.hc / photon.wavelength;
    const levels = this.threeLevelsProperty.value ? 3 : 2;
    for (let level = levels - 1; level > atom.level; level--) {
      if (Math.abs(this.energy(level) - this.energy(atom.level) - energy) <= C.tolerance) {
        this.transition(atom, level);
        return true;
      }
    }
    for (let level = 0; level < atom.level; level++) {
      if (
        (!this.allStimulatedProperty.value && level !== atom.level - 1) ||
        Math.abs(this.energy(atom.level) - this.energy(level) - energy) > C.tolerance
      ) {
        continue;
      }
      if (this.random() >= this.stimulationProperty.value) {
        return false;
      }
      const angle = Math.atan2(photon.vy, photon.vx);
      const emitted = this.addPhoton(
        atom.x + Math.cos(angle) * 14,
        atom.y + Math.sin(angle) * 14 + 2,
        angle,
        photon.wavelength,
        atom.level === 2,
      );
      emitted.lastAtom = atom;
      photon.x = atom.x + Math.cos(angle) * 14;
      photon.y = atom.y + Math.sin(angle) * 14;
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
    this.advance(Math.min(dt, C.maxFrame) * this.speedProperty.value);
  }

  public stepOnce(): void {
    if (!this.explodedProperty.value) {
      this.advance(1 / 25);
    }
  }

  private advance(dt: number): void {
    this.accumulator += dt;
    while (this.accumulator >= C.fixedStep - 1e-10) {
      this.tick(C.fixedStep);
      this.accumulator -= C.fixedStep;
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
    if (this.outputTime >= 1) {
      this.outputProperty.value = this.outputCount / this.outputTime;
      this.outputTime = 0;
      this.outputCount = 0;
    }
    this.updateCounts();
    if (this.horizontalPhotonsProperty.value > C.kaboom) {
      this.explodedProperty.value = true;
    }
  }

  private emitLamps(dt: number): void {
    this.pumpAccumulator += (this.multiple || this.threeLevelsProperty.value ? this.pumpRateProperty.value : 0) * dt;
    this.seedAccumulator += (!(this.multiple || this.mirrorsProperty.value) ? this.seedRateProperty.value : 0) * dt;
    while (this.pumpAccumulator >= 1) {
      this.pumpAccumulator--;
      this.addPhoton(
        this.multiple ? this.random() * 300 : 150,
        -70,
        Math.PI / 2 + (this.random() - 0.5) * (this.multiple ? Math.PI / 4 : 0.03),
        this.pumpWavelengthProperty.value,
      );
    }
    while (this.seedAccumulator >= 1) {
      this.seedAccumulator--;
      this.addPhoton(-80, 60, ((this.random() - 0.5) * Math.PI) / 180, this.seedWavelengthProperty.value);
    }
  }

  private advanceAtoms(dt: number): void {
    for (const atom of this.atoms) {
      atom.cooldown = Math.max(0, atom.cooldown - dt);
      atom.x += atom.vx * dt;
      atom.y += atom.vy * dt;
      if (atom.x < 10 || atom.x > 290) {
        atom.vx *= -1;
        atom.x = Math.max(10, Math.min(290, atom.x));
      }
      if (atom.y < 10 || atom.y > 110) {
        atom.vy *= -1;
        atom.y = Math.max(10, Math.min(110, atom.y));
      }
      if (atom.level > 0) {
        atom.remaining -= dt;
        if (atom.remaining <= 0) {
          const level = atom.level;
          const angle = this.random() < 0.1 ? (this.random() < 0.5 ? 0 : Math.PI) : this.random() * Math.PI * 2;
          this.addPhoton(
            atom.x + 18 * Math.cos(angle),
            atom.y + 18 * Math.sin(angle),
            angle,
            C.hc / (this.energy(level) - this.energy(level - 1)),
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
      if (p.x > -100 && p.x < 470 && p.y > -100 && p.y < 260) {
        survivors.push(p);
      }
    }
    this.photons.push(...survivors);
  }

  private collideWithAtoms(p: Photon): boolean {
    for (const atom of this.atoms) {
      if (Math.hypot(p.x - atom.x, p.y - atom.y) > 15) {
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
    if (p.y >= 0 && p.y <= 120 && this.mirrorsProperty.value) {
      const left = oldX >= 0 && p.x < 0;
      const right = oldX <= 300 && p.x > 300;
      // Legacy collision expert calls the stochastic reflection strategy twice.
      if (left || (right && this.random() < (this.reflectivityProperty.value / 100) ** 2)) {
        p.x = left ? -p.x : 600 - p.x;
        p.vx *= -1;
        if (Math.abs(p.vy / p.vx) < Math.tan(Math.PI / 60)) {
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
        p.x <= 300 &&
        p.y >= 0 &&
        p.y <= 120 &&
        Math.abs(p.vy) < C.photonSpeed * Math.sin(Math.PI / 60) &&
        Math.abs(C.hc / p.wavelength - this.middleEnergyProperty.value) <= C.tolerance,
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
