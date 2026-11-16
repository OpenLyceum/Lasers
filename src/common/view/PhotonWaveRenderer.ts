/**
 * PhotonWaveRenderer.ts
 *
 * Photon trail strokes (grouped by wavelength) and the lower-transition wave
 * overlay drawn inside the cavity scene.
 */

import { DerivedProperty } from "scenerystack/axon";
import { Shape } from "scenerystack/kite";
import { Color, type Node, Path } from "scenerystack/scenery";
import { VisibleColor } from "scenerystack/scenery-phet";
import Colors from "../../LasersColors.js";
import { PHOTON_VIEW, PHYSICS, VIEW, WAVE_VIEW, WAVELENGTH } from "../../LasersConstants.js";
import type { LaserModel } from "../model/LaserModel.js";

export class PhotonWaveRenderer {
  private readonly scene: Node;
  private readonly spectralPaths = new Map<number, Path>();
  private readonly wave = new Path(null, { lineWidth: WAVE_VIEW.LINE_WIDTH });
  private time = 0;

  public constructor(scene: Node) {
    this.scene = scene;
    this.scene.addChild(this.wave);
  }

  public resetTime(): void {
    this.time = 0;
  }

  public advanceTime(dt: number): void {
    this.time += dt;
  }

  public photonColor(wavelength: number) {
    if (wavelength > WAVELENGTH.MAX) {
      return Colors.upperColorProperty.value;
    }
    if (wavelength < WAVELENGTH.MIN) {
      return Colors.pumpColorProperty.value;
    }
    const color = VisibleColor.wavelengthToColor(wavelength);
    // Preserve wavelength hue while keeping violet visible on black and yellow visible on white.
    return Color.getLuminance(Colors.backgroundColorProperty.value) > PHOTON_VIEW.LUMINANCE_THRESHOLD
      ? color.colorUtilsDarker(PHOTON_VIEW.DARKEN_FACTOR)
      : color.colorUtilsBrighter(PHOTON_VIEW.BRIGHTEN_FACTOR);
  }

  public render(model: LaserModel): void {
    this.renderPhotons(model);
    this.renderWave(model);
  }

  private renderPhotons(model: LaserModel): void {
    const spectra = new Map<number, Shape>();
    for (const p of model.photons) {
      if (p.upper && !model.showUpperProperty.value) {
        continue;
      }
      const pumping = Math.abs(p.vy) > Math.abs(p.vx);
      if (pumping && model.beamProperty.value) {
        continue;
      }
      if (!(pumping || p.upper) && model.waveProperty.value) {
        continue;
      }
      const wavelength = Math.round(
        Math.max(WAVELENGTH.VIEW_CLAMP_MIN, Math.min(WAVELENGTH.VIEW_CLAMP_MAX, p.wavelength)),
      );
      let shape = spectra.get(wavelength);
      if (!shape) {
        shape = new Shape();
        spectra.set(wavelength, shape);
      }
      const x = VIEW.CAVITY_X + p.x * VIEW.SCALE;
      const y = VIEW.CAVITY_Y + p.y * VIEW.SCALE;
      if (
        x < PHOTON_VIEW.CLIP_MIN_X ||
        x > PHOTON_VIEW.CLIP_MAX_X ||
        y < PHOTON_VIEW.CLIP_MIN_Y ||
        y > PHOTON_VIEW.CLIP_MAX_Y
      ) {
        continue;
      }
      shape
        .moveTo(x, y)
        .lineTo(
          x - (p.vx / PHYSICS.PHOTON_SPEED) * PHOTON_VIEW.TRAIL_LENGTH,
          y - (p.vy / PHYSICS.PHOTON_SPEED) * PHOTON_VIEW.TRAIL_LENGTH,
        );
    }
    for (const path of this.spectralPaths.values()) {
      path.shape = null;
    }
    for (const [wavelength, shape] of spectra) {
      let path = this.spectralPaths.get(wavelength);
      if (!path) {
        path = new Path(null, {
          lineWidth: PHOTON_VIEW.LINE_WIDTH,
          stroke: new DerivedProperty(
            [Colors.backgroundColorProperty, Colors.upperColorProperty, Colors.pumpColorProperty],
            () => this.photonColor(wavelength),
          ),
          lineCap: "round",
        });
        this.spectralPaths.set(wavelength, path);
        this.scene.addChild(path);
      }
      path.shape = shape;
    }
  }

  private renderWave(model: LaserModel): void {
    const wave = new Shape();
    if (model.waveProperty.value) {
      const amplitude = Math.min(
        WAVE_VIEW.MAX_AMPLITUDE,
        Math.sqrt(model.horizontalPhotonsProperty.value) * WAVE_VIEW.AMPLITUDE_FACTOR,
      );
      for (let x = VIEW.CAVITY_X; x < WAVE_VIEW.END_X; x += WAVE_VIEW.STEP_X) {
        const outside =
          x > VIEW.CAVITY_X + VIEW.CAVITY_WIDTH
            ? Math.sqrt(1 - (model.mirrorsProperty.value ? model.reflectivityProperty.value / 100 : 0))
            : 1;
        const y =
          VIEW.CAVITY_Y +
          VIEW.CAVITY_HEIGHT / 2 +
          amplitude *
            outside *
            Math.sin(
              ((x - VIEW.CAVITY_X) / (PHYSICS.HC / model.middleEnergyProperty.value)) * WAVE_VIEW.SPATIAL_SCALE -
                this.time * WAVE_VIEW.TIME_SCALE,
            );
        if (x === VIEW.CAVITY_X) {
          wave.moveTo(x, y);
        } else {
          wave.lineTo(x, y);
        }
      }
    }
    this.wave.shape = wave;
    this.wave.stroke = this.photonColor(PHYSICS.HC / model.middleEnergyProperty.value);
  }
}
