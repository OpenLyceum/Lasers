import { Shape } from "scenerystack/kite";
import { Circle, Node, Path, Rectangle } from "scenerystack/scenery";
import { ScreenIcon } from "scenerystack/sim";
import Colors from "../LasersColors.js";

function icon(multiple: boolean): ScreenIcon {
  const content = new Node({
    children: [
      new Rectangle(0, 0, 548, 373, { fill: Colors.backgroundColorProperty }),
      new Rectangle(65, 85, 420, 200, 30, 30, {
        fill: Colors.panelBackgroundColorProperty,
        stroke: Colors.mirrorColorProperty,
        lineWidth: 8,
      }),
    ],
  });
  const wave = new Shape();
  for (let x = 20; x < 530; x += 2) {
    const y = 185 + 20 * Math.sin(x / 12);
    if (x === 20) {
      wave.moveTo(x, y);
    } else {
      wave.lineTo(x, y);
    }
  }
  content.addChild(new Path(wave, { stroke: Colors.laserColorProperty, lineWidth: 6 }));
  for (let i = 0; i < (multiple ? 9 : 1); i++) {
    content.addChild(
      new Circle(18, {
        x: multiple ? 130 + (i % 3) * 140 : 274,
        y: multiple ? 125 + Math.floor(i / 3) * 60 : 185,
        fill: i % 2 ? Colors.pumpColorProperty : Colors.atomColorProperty,
        stroke: Colors.textColorProperty,
        lineWidth: 2,
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
