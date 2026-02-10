import type { HashParams } from "../utils/hash";
import type { BannerPalette } from "../utils/colors";
import { hslToString } from "../utils/colors";

/**
 * Symmetrical geometric avatar with 4-fold rotational symmetry.
 * Places shapes in one quadrant and reflects across both axes.
 */
export function generateGeometricAvatar(
  h: HashParams,
  palette: BannerPalette,
  size: number
): string {
  const defs: string[] = [];
  const elements: string[] = [];

  const cx = size / 2;
  const cy = size / 2;

  // Background gradient
  const bgAngle = h.float(0, 360);
  defs.push(`
    <linearGradient id="abg" gradientTransform="rotate(${bgAngle})">
      <stop offset="0%" stop-color="${hslToString(palette.background)}" />
      <stop offset="100%" stop-color="${hslToString({ ...palette.background, l: palette.background.l + 8 })}" />
    </linearGradient>
  `);
  elements.push(`<rect width="${size}" height="${size}" fill="url(#abg)" />`);

  const colors = [palette.primary, palette.secondary, palette.accent, palette.highlight];
  const shapeCount = h.int(3, 7);

  for (let i = 0; i < shapeCount; i++) {
    const color = h.pick(colors);
    const opacity = h.float(0.3, 0.8);
    const shapeType = h.pick(["circle", "square", "triangle"] as const);

    // Generate position in first quadrant
    const qx = h.float(size * 0.05, cx);
    const qy = h.float(size * 0.05, cy);
    const shapeSize = h.float(size * 0.06, size * 0.22);

    // 4-fold reflection positions
    const positions = [
      [qx, qy],
      [size - qx, qy],
      [qx, size - qy],
      [size - qx, size - qy],
    ];

    for (const [px, py] of positions) {
      switch (shapeType) {
        case "circle":
          elements.push(
            `<circle cx="${px}" cy="${py}" r="${shapeSize / 2}" fill="${hslToString(color, opacity)}" />`
          );
          break;
        case "square": {
          const half = shapeSize / 2;
          elements.push(
            `<rect x="${px - half}" y="${py - half}" width="${shapeSize}" height="${shapeSize}" fill="${hslToString(color, opacity)}" />`
          );
          break;
        }
        case "triangle": {
          const r = shapeSize / 2;
          const pts = `${px},${py - r} ${px - r * 0.866},${py + r * 0.5} ${px + r * 0.866},${py + r * 0.5}`;
          elements.push(
            `<polygon points="${pts}" fill="${hslToString(color, opacity)}" />`
          );
          break;
        }
      }
    }
  }

  // Optional center element
  if (h.rand() > 0.3) {
    const centerColor = h.pick(colors);
    const centerSize = h.float(size * 0.1, size * 0.25);
    elements.push(
      `<circle cx="${cx}" cy="${cy}" r="${centerSize}" fill="${hslToString(centerColor, h.float(0.2, 0.6))}" />`
    );
  }

  return `<defs>${defs.join("")}</defs>${elements.join("")}`;
}
