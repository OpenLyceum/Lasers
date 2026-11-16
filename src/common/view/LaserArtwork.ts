import { Vector2 } from "scenerystack/dot";
import { Shape } from "scenerystack/kite";
import { Circle, LinearGradient, Node, Path, RadialGradient, Rectangle } from "scenerystack/scenery";
import Colors from "../../LasersColors.js";
import { ARTWORK, LASER_ARTWORK_SETTINGS } from "../../LasersConstants.js";

/** Vector replacement for the upstream right-facing flashlight, in its original 161 × 82 box. */
export function createLamp(): Node {
  const bodyGradient = new LinearGradient(0, 22, 0, 60)
    .addColorStop(0, Colors.lampBodyColorProperty)
    .addColorStop(0.35, Colors.lampRimColorProperty)
    .addColorStop(1, Colors.lampBodyColorProperty);
  return new Node({
    renderer: "svg",
    children: [
      new Rectangle(
        1,
        LASER_ARTWORK_SETTINGS.CREATE_LAMP_Y,
        LASER_ARTWORK_SETTINGS.CREATE_LAMP_WIDTH,
        LASER_ARTWORK_SETTINGS.CREATE_LAMP_HEIGHT,
        LASER_ARTWORK_SETTINGS.CREATE_LAMP_CORNER_X,
        LASER_ARTWORK_SETTINGS.CREATE_LAMP_CORNER_Y,
        {
          fill: bodyGradient,
          stroke: Colors.lampRimColorProperty,
          lineWidth: LASER_ARTWORK_SETTINGS.CREATE_LAMP_LINE_WIDTH,
        },
      ),
      new Path(
        new Shape()
          .moveTo(LASER_ARTWORK_SETTINGS.CREATE_LAMP_X, LASER_ARTWORK_SETTINGS.CREATE_LAMP_Y)
          .lineTo(LASER_ARTWORK_SETTINGS.LAMP_LENS_CENTER_X, LASER_ARTWORK_SETTINGS.LAMP_SHADE_TOP)
          .lineTo(LASER_ARTWORK_SETTINGS.LAMP_LENS_CENTER_X, LASER_ARTWORK_SETTINGS.LAMP_SHADE_BOTTOM)
          .lineTo(LASER_ARTWORK_SETTINGS.CREATE_LAMP_X, LASER_ARTWORK_SETTINGS.LAMP_BODY_BOTTOM)
          .close(),
        {
          fill: bodyGradient,
          stroke: Colors.lampRimColorProperty,
          lineWidth: LASER_ARTWORK_SETTINGS.CREATE_LAMP_LINE_WIDTH,
          lineJoin: "round",
        },
      ),
      new Path(
        Shape.ellipse(
          new Vector2(LASER_ARTWORK_SETTINGS.LAMP_LENS_CENTER_X, LASER_ARTWORK_SETTINGS.LAMP_LENS_CENTER_Y),
          LASER_ARTWORK_SETTINGS.LAMP_LENS_RADIUS_X,
          LASER_ARTWORK_SETTINGS.LAMP_LENS_RADIUS_Y,
          0,
        ),
        {
          fill: Colors.lampLensColorProperty,
          stroke: Colors.lampRimColorProperty,
          lineWidth: LASER_ARTWORK_SETTINGS.CREATE_LAMP_LINE_WIDTH,
        },
      ),
    ],
  });
}

/** Concave silver mirror; callers reflect this node for the output coupler. */
export function createMirror(height: number): Node {
  const halfWidth = ARTWORK.MIRROR_WIDTH / 2;
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
      lineWidth: LASER_ARTWORK_SETTINGS.CREATE_MIRROR_LINE_WIDTH,
      lineJoin: "round",
    },
  );
}

/** Profile-aware, smoothly shaded state markers. Geometry stays centered at the atom position. */
export function createAtomStates(): Circle[] {
  return [Colors.atomColorProperty, Colors.laserColorProperty, Colors.pumpColorProperty].map(
    (color) =>
      new Circle(ARTWORK.ATOM_RADIUS, {
        renderer: "svg",
        fill: new RadialGradient(-4, -5, 0, 0, 0, ARTWORK.ATOM_RADIUS)
          .addColorStop(0, Colors.highlightColorProperty)
          .addColorStop(0.5, color)
          .addColorStop(1, color),
        stroke: color,
        lineWidth: 1,
      }),
  );
}
