import type { HashParams } from "../utils/hash";
import type { Palette } from "../utils/colors";
import { hslToString } from "../utils/colors";

/**
 * GitHub-style symmetric pixel identicon.
 * Uses a 5x5 or 7x7 grid with vertical-axis symmetry.
 */
export function generatePixelGrid(
  h: HashParams,
  palette: Palette,
  size: number,
  prefix: string = ""
): string {
  const defs: string[] = [];
  const elements: string[] = [];

  const gridSize = h.pick([5, 7]);
  const padding = Math.round(size * 0.12);
  const innerSize = size - padding * 2;
  const cellSize = innerSize / gridSize;

  // Background
  elements.push(
    `<rect width="${size}" height="${size}" fill="${hslToString(palette.background)}" />`
  );

  // Pick 1-2 fill colors
  const fillColors = [
    h.pick([palette.primary, palette.secondary, palette.accent]),
  ];
  if (h.rand() > 0.4) {
    fillColors.push(
      h.pick([palette.secondary, palette.accent, palette.highlight])
    );
  }

  // Half width (including center column for odd grids)
  const half = Math.ceil(gridSize / 2);

  // Generate the grid with vertical-axis symmetry
  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < half; col++) {
      if (h.rand() > 0.45) {
        const color = h.pick(fillColors);
        const x = padding + col * cellSize;
        const y = padding + row * cellSize;

        elements.push(
          `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${hslToString(color)}" />`
        );

        // Mirror (skip center column on odd grids)
        const mirrorCol = gridSize - 1 - col;
        if (mirrorCol !== col) {
          const mx = padding + mirrorCol * cellSize;
          elements.push(
            `<rect x="${mx}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${hslToString(color)}" />`
          );
        }
      }
    }
  }

  return `<defs>${defs.join("")}</defs>${elements.join("")}`;
}
