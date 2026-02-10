import type { HashParams } from "../utils/hash";
import type { Palette } from "../utils/colors";
import { hslToString } from "../utils/colors";

/**
 * Concentric ring pattern avatar.
 * Generates layered rings with varying colors, widths, and optional dashes.
 */
export function generateRings(
  h: HashParams,
  palette: Palette,
  size: number,
  prefix: string = ""
): string {
  const defs: string[] = [];
  const elements: string[] = [];

  const cx = size / 2;
  const cy = size / 2;

  // Background
  elements.push(
    `<rect width="${size}" height="${size}" fill="${hslToString(palette.background)}" />`
  );

  const colors = [palette.primary, palette.secondary, palette.accent, palette.highlight];
  const ringCount = h.int(3, 6);
  const maxRadius = size * 0.45;
  const minRadius = size * 0.06;

  for (let i = 0; i < ringCount; i++) {
    const t = i / (ringCount - 1); // 0 → 1, inner to outer
    const radius = minRadius + t * (maxRadius - minRadius);
    const color = h.pick(colors);
    const strokeWidth = h.float(size * 0.01, size * 0.06);
    const opacity = h.float(0.4, 0.9);

    // Optional dash pattern
    const dashed = h.rand() > 0.6;
    const dashArray = dashed
      ? `stroke-dasharray="${h.float(4, 20)} ${h.float(4, 15)}"`
      : "";

    // Optional rotation for dashed rings
    const rotation = dashed ? h.float(0, 360) : 0;
    const transform = rotation ? `transform="rotate(${rotation} ${cx} ${cy})"` : "";

    elements.push(
      `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${hslToString(color, opacity)}" stroke-width="${strokeWidth}" ${dashArray} ${transform} />`
    );
  }

  // Optional center dot
  if (h.rand() > 0.4) {
    const dotColor = h.pick(colors);
    const dotRadius = h.float(size * 0.03, size * 0.08);
    elements.push(
      `<circle cx="${cx}" cy="${cy}" r="${dotRadius}" fill="${hslToString(dotColor, h.float(0.5, 0.9))}" />`
    );
  }

  return `<defs>${defs.join("")}</defs>${elements.join("")}`;
}
