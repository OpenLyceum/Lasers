import { Shape } from "scenerystack/kite";
import { Circle, Node, Path, Rectangle } from "scenerystack/scenery";
import { ScreenIcon } from "scenerystack/sim";
import Colors from "../LasersColors.js";
import { ICON, SCREEN_ICONS } from "../LasersConstants.js";

function icon(multiple: boolean): ScreenIcon {
  const content = new Node({
    children: [
      new Rectangle(0, 0, SCREEN_ICONS.WIDTH, SCREEN_ICONS.HEIGHT, { fill: Colors.backgroundColorProperty }),
      new Rectangle(
        ICON.CAVITY_X,
        ICON.CAVITY_Y,
        ICON.CAVITY_WIDTH,
        ICON.CAVITY_HEIGHT,
        ICON.CAVITY_CORNER,
        ICON.CAVITY_CORNER,
        {
          fill: Colors.panelBackgroundColorProperty,
          stroke: Colors.mirrorColorProperty,
          lineWidth: ICON.CAVITY_LINE_WIDTH,
        },
      ),
    ],
  });
  const wave = new Shape();
  for (let x = ICON.WAVE_START_X; x < ICON.WAVE_END_X; x += ICON.WAVE_STEP) {
    const y = ICON.WAVE_CENTER_Y + ICON.WAVE_AMPLITUDE * Math.sin(x / ICON.WAVE_PERIOD);
    if (x === ICON.WAVE_START_X) {
      wave.moveTo(x, y);
    } else {
      wave.lineTo(x, y);
    }
  }
  content.addChild(new Path(wave, { stroke: Colors.laserColorProperty, lineWidth: ICON.WAVE_LINE_WIDTH }));
  for (let i = 0; i < (multiple ? ICON.ATOM_COUNT_MULTIPLE : 1); i++) {
    content.addChild(
      new Circle(ICON.ATOM_RADIUS, {
        x: multiple ? ICON.GRID_ORIGIN_X + (i % ICON.GRID_COLUMNS) * ICON.GRID_SPACING_X : ICON.SINGLE_ATOM_X,
        y: multiple ? ICON.GRID_ORIGIN_Y + Math.floor(i / ICON.GRID_COLUMNS) * ICON.GRID_SPACING_Y : ICON.SINGLE_ATOM_Y,
        fill: i % 2 ? Colors.pumpColorProperty : Colors.atomColorProperty,
        stroke: Colors.textColorProperty,
        lineWidth: ICON.ATOM_LINE_WIDTH,
      }),
    );
  }
  return new ScreenIcon(content, { maxIconWidthProportion: 1, maxIconHeightProportion: 1 });
}
export function createOneAtomIcon(): ScreenIcon {
  return icon(false);
}
export function createMultipleAtomsIcon(): ScreenIcon {
  return icon(true);
}
