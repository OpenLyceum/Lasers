import { describe, expect, it } from "vitest";
import { LaserModel } from "../src/common/model/LaserModel.js";
import { PHYSICS } from "../src/LasersConstants.js";

describe("PhET source scenarios", () => {
  it("starts with one ground-state atom, two levels, seed 1/s, and no pump or mirrors", () => {
    const m = new LaserModel(false);
    expect(m.atoms).toHaveLength(1);
    expect(m.groundPopulationProperty.value).toBe(1);
    expect(m.threeLevelsProperty.value).toBe(false);
    expect(m.seedRateProperty.value).toBe(1);
    expect(m.pumpRateProperty.value).toBe(0);
    expect(m.mirrorsProperty.value).toBe(false);
    m.dispose();
  });
  it("absorbs resonant red light but transmits off-resonance light", () => {
    const m = new LaserModel(false);
    const a = m.atoms[0]!;
    expect(m.interact(a, m.addPhoton(a.x, a.y, 0, 440))).toBe(false);
    expect(a.level).toBe(0);
    expect(m.interact(a, m.addPhoton(a.x, a.y, 0, 680))).toBe(true);
    expect(a.level).toBe(1);
    m.dispose();
  });
  it("stimulates a matching photon pair and enforces the ground cooldown", () => {
    const m = new LaserModel(false);
    const a = m.atoms[0]!;
    m.interact(a, m.addPhoton(a.x, a.y, 0, 680));
    m.stimulationProperty.value = 1;
    const incoming = m.addPhoton(a.x, a.y, 0, 680);
    m.interact(a, incoming);
    const emitted = m.photons.at(-1)!;
    expect(emitted.wavelength).toBe(incoming.wavelength);
    expect(emitted.vx).toBe(incoming.vx);
    expect(emitted.vy).toBe(incoming.vy);
    expect(a.level).toBe(0);
    expect(m.interact(a, incoming)).toBe(false);
    expect(a.level).toBe(0);
    m.dispose();
  });
  it("spontaneously cascades upper to middle to ground", () => {
    const m = new LaserModel(false);
    m.threeLevelsProperty.value = true;
    m.seedRateProperty.value = 0;
    const a = m.atoms[0]!;
    m.interact(a, m.addPhoton(a.x, a.y, 0, 440));
    expect(a.level).toBe(2);
    a.remaining = 0;
    m.stepOnce();
    expect(a.level).toBe(1);
    expect(
      m.photons.some(
        (p) => p.upper && Math.abs(PHYSICS.hc / p.wavelength - (PHYSICS.hc / 440 - PHYSICS.hc / 680)) < 1e-8,
      ),
    ).toBe(true);
    a.remaining = 0;
    m.stepOnce();
    expect(a.level).toBe(0);
    m.dispose();
  });
  it("reflects at perfect mirrors and transmits at zero right reflectivity", () => {
    for (const reflectivity of [0, 100]) {
      const m = new LaserModel(false);
      m.mirrorsProperty.value = true;
      m.reflectivityProperty.value = reflectivity;
      const p = m.addPhoton(299, 10, 0, 680);
      m.stepOnce();
      expect(p.vx).toBe(reflectivity === 100 ? -150 : 150);
      m.dispose();
    }
  });
  it("pauses, manually steps, rejects invalid time and resets deterministically", () => {
    const m = new LaserModel(true);
    const initial = JSON.stringify(m.atoms);
    m.pumpRateProperty.value = 400;
    m.playingProperty.value = false;
    m.step(1);
    expect(m.photons).toHaveLength(0);
    m.stepOnce();
    expect(m.photons.length).toBeGreaterThan(0);
    expect(m.playingProperty.value).toBe(false);
    m.reset();
    expect(JSON.stringify(m.atoms)).toBe(initial);
    expect(m.photons).toHaveLength(0);
    m.step(Number.NaN);
    m.step(-1);
    expect(m.photons).toHaveLength(0);
    m.dispose();
  });
  it("produces identical particle histories across frame rates", () => {
    const a = new LaserModel(true);
    const b = new LaserModel(true);
    a.pumpRateProperty.value = b.pumpRateProperty.value = 200;
    for (let i = 0; i < 600; i++) {
      a.step(1 / 60);
    }
    for (let i = 0; i < 250; i++) {
      b.step(1 / 25);
    }
    expect(a.atoms).toEqual(b.atoms);
    expect(a.photons).toEqual(b.photons);
    a.dispose();
    b.dispose();
  });
  it("supports population inversion and sustained cavity gain with three-level pumping", () => {
    const m = new LaserModel(true, 42);
    m.pumpRateProperty.value = 400;
    m.mirrorsProperty.value = true;
    m.reflectivityProperty.value = 100;
    m.highLifetimeProperty.value = 1;
    m.stimulationProperty.value = 1;
    let inverted = false;
    let horizontal = 0;
    for (let i = 0; i < 3600; i++) {
      m.step(1 / 60);
      inverted ||= m.middlePopulationProperty.value > m.groundPopulationProperty.value;
      horizontal = Math.max(horizontal, m.horizontalPhotonsProperty.value);
    }
    expect(inverted).toBe(true);
    expect(horizontal).toBeGreaterThan(40);
    m.dispose();
  });
});
