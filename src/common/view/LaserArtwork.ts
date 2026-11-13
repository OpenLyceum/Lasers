import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, LinearGradient, Node, Path, RadialGradient, Rectangle } from "scenerystack/scenery";
import Colors from "../../LasersColors.js";
import { ARTWORK } from "../../LasersConstants.js";

/** Vector replacement for the upstream right-facing flashlight, in its original 161 × 82 box. */
export function createLamp(): Node {
  const bodyGradient = new LinearGradient(0, 22, 0, 60)
    .addColorStop(0, Colors.lampBodyColorProperty)
    .addColorStop(0.35, Colors.lampRimColorProperty)
    .addColorStop(1, Colors.lampBodyColorProperty);
  return new Node({
    renderer: "svg",
    children: [
      new Rectangle(1, 22, 114, 38, 17, 17, {
        fill: bodyGradient,
        stroke: Colors.lampRimColorProperty,
        lineWidth: 2,
      }),
      new Path(new Shape().moveTo(108, 22).lineTo(153, 2).lineTo(153, 80).lineTo(108, 60).close(), {
        fill: bodyGradient,
        stroke: Colors.lampRimColorProperty,
        lineWidth: 2,
        lineJoin: "round",
      }),
      new Path(Shape.ellipse(new Vector2(153, 41), 7, 39, 0), {
        fill: Colors.lampLensColorProperty,
        stroke: Colors.lampRimColorProperty,
        lineWidth: 2,
      }),
    ],
  });
}

/** Concave silver mirror; callers reflect this node for the output coupler. */
export function createMirror(height: number): Node {
  const halfWidth = ARTWORK.mirrorWidth / 2;
  return new Path(
    new Shape()
      .moveTo(halfWidth, -height / 2)
      .cubicCurveTo(-halfWidth, -height / 4, -halfWidth, height / 4, halfWidth, height / 2)
      .lineTo(halfWidth - 5, height / 2)
      .cubicCurveTo(-halfWidth - 7, height / 4, -halfWidth - 7, -height / 4, halfWidth - 5, -height / 2)
      .close(),
    {
      renderer: "svg",
      fill: new LinearGradient(-halfWidth, 0, halfWidth, 0)
        .addColorStop(0, Colors.mirrorColorProperty)
        .addColorStop(0.65, Colors.highlightColorProperty)
        .addColorStop(1, Colors.mirrorColorProperty),
      stroke: Colors.mirrorColorProperty,
      lineWidth: 1.5,
      lineJoin: "round",
    },
  );
}

/** Profile-aware, smoothly shaded state markers. Geometry stays centered at the atom position. */
export function createAtomStates(): Circle[] {
  return [Colors.atomColorProperty, Colors.laserColorProperty, Colors.pumpColorProperty].map(
    (color) =>
      new Circle(ARTWORK.atomRadius, {
        renderer: "svg",
        fill: new RadialGradient(-4, -5, 0, 0, 0, ARTWORK.atomRadius)
          .addColorStop(0, Colors.highlightColorProperty)
          .addColorStop(0.5, color)
          .addColorStop(1, color),
        stroke: color,
        lineWidth: 1,
      }),
  );
}
