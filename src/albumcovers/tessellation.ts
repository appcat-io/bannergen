import type { HashParams } from "../utils/hash";
import type { BannerPalette } from "../utils/colors";
import { hslToString } from "../utils/colors";

export function generateTessellation(
  h: HashParams,
  palette: BannerPalette,
  size: number
): string {
  const defs: string[] = [];
  const elements: string[] = [];

  // Solid dark background
  elements.push(
    `<rect width="${size}" height="${size}" fill="${hslToString(palette.background)}" />`
  );

  const colors = [palette.primary, palette.secondary, palette.accent, palette.highlight];
  const separatorColor = hslToString(palette.background, 0.9);
  const separatorWidth = h.float(1.5, 3.5);
  const maxDepth = h.int(2, 4);

  interface Cell {
    x: number;
    y: number;
    w: number;
    h: number;
  }

  // Recursive subdivision
  function subdivide(cell: Cell, depth: number): Cell[] {
    if (depth >= maxDepth || cell.w < size * 0.06 || cell.h < size * 0.06) {
      return [cell];
    }

    // Chance to stop subdividing early
    if (depth > 0 && h.rand() > 0.75) {
      return [cell];
    }

    const divisions = h.int(2, 3);
    const horizontal = h.rand() > 0.5;
    const cells: Cell[] = [];

    if (horizontal) {
      // Split horizontally
      const splits: number[] = [];
      let remaining = cell.h;
      for (let i = 0; i < divisions - 1; i++) {
        const s = h.float(remaining * 0.2, remaining * 0.7);
        splits.push(s);
        remaining -= s;
      }
      splits.push(remaining);

      let cy = cell.y;
      for (const sh of splits) {
        const sub: Cell = { x: cell.x, y: cy, w: cell.w, h: sh };
        cells.push(...subdivide(sub, depth + 1));
        cy += sh;
      }
    } else {
      // Split vertically
      const splits: number[] = [];
      let remaining = cell.w;
      for (let i = 0; i < divisions - 1; i++) {
        const s = h.float(remaining * 0.2, remaining * 0.7);
        splits.push(s);
        remaining -= s;
      }
      splits.push(remaining);

      let cx = cell.x;
      for (const sw of splits) {
        const sub: Cell = { x: cx, y: cell.y, w: sw, h: cell.h };
        cells.push(...subdivide(sub, depth + 1));
        cx += sw;
      }
    }

    return cells;
  }

  // Generate cells via subdivision
  const cells = subdivide({ x: 0, y: 0, w: size, h: size }, 0);

  // Draw each cell
  for (const cell of cells) {
    const color = h.pick(colors);
    const opacity = h.float(0.4, 0.85);
    const useDiagonal = h.rand() > 0.7;

    if (useDiagonal && cell.w > size * 0.08 && cell.h > size * 0.08) {
      // Diagonal cut — two triangles
      const color2 = h.pick(colors);
      const opacity2 = h.float(0.4, 0.85);
      const cutDir = h.rand() > 0.5; // top-left to bottom-right vs top-right to bottom-left

      if (cutDir) {
        elements.push(
          `<polygon points="${cell.x},${cell.y} ${cell.x + cell.w},${cell.y} ${cell.x},${cell.y + cell.h}" fill="${hslToString(color, opacity)}" />`
        );
        elements.push(
          `<polygon points="${cell.x + cell.w},${cell.y} ${cell.x + cell.w},${cell.y + cell.h} ${cell.x},${cell.y + cell.h}" fill="${hslToString(color2, opacity2)}" />`
        );
      } else {
        elements.push(
          `<polygon points="${cell.x},${cell.y} ${cell.x + cell.w},${cell.y} ${cell.x + cell.w},${cell.y + cell.h}" fill="${hslToString(color, opacity)}" />`
        );
        elements.push(
          `<polygon points="${cell.x},${cell.y} ${cell.x},${cell.y + cell.h} ${cell.x + cell.w},${cell.y + cell.h}" fill="${hslToString(color2, opacity2)}" />`
        );
      }
    } else {
      // Solid rectangle
      elements.push(
        `<rect x="${cell.x}" y="${cell.y}" width="${cell.w}" height="${cell.h}" fill="${hslToString(color, opacity)}" />`
      );

      // Optional circle/arc inset for larger cells
      if (h.rand() > 0.8 && cell.w > size * 0.1 && cell.h > size * 0.1) {
        const insetColor = h.pick(colors);
        const insetOpacity = h.float(0.15, 0.5);
        const r = Math.min(cell.w, cell.h) * h.float(0.25, 0.45);
        const icx = cell.x + cell.w / 2;
        const icy = cell.y + cell.h / 2;
        elements.push(
          `<circle cx="${icx}" cy="${icy}" r="${r}" fill="none" stroke="${hslToString(insetColor, insetOpacity)}" stroke-width="${h.float(1, 3)}" />`
        );
      }
    }
  }

  // Separator grid lines over all cell boundaries
  for (const cell of cells) {
    elements.push(
      `<rect x="${cell.x}" y="${cell.y}" width="${cell.w}" height="${cell.h}" fill="none" stroke="${separatorColor}" stroke-width="${separatorWidth}" />`
    );
  }

  // Grain overlay
  defs.push(`
    <filter id="ts-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  `);
  elements.push(
    `<rect width="${size}" height="${size}" filter="url(#ts-grain)" opacity="0.03" />`
  );

  return `<defs>${defs.join("")}</defs>${elements.join("")}`;
}
