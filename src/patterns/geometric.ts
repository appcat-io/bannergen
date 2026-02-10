import type { HashParams } from "../utils/hash";
import type { Palette } from "../utils/colors";
import { hslToString } from "../utils/colors";

type GeoStyle = "triangles" | "hexagons" | "diamonds" | "circles" | "bars";

/** Round a number to 1 decimal place */
const r = (n: number) => +n.toFixed(1);

export function generateGeometric(
  h: HashParams,
  palette: Palette,
  width: number,
  height: number,
  prefix: string = ""
): string {
  const defs: string[] = [];
  const elements: string[] = [];
  const style: GeoStyle = h.pick([
    "triangles",
    "hexagons",
    "diamonds",
    "circles",
    "bars",
  ]);

  // Background
  const bgAngle = r(h.float(120, 240));
  defs.push(`
    <linearGradient id="${prefix}gbg" gradientTransform="rotate(${bgAngle})">
      <stop offset="0%" stop-color="${hslToString(palette.background)}" />
      <stop offset="100%" stop-color="${hslToString({ ...palette.background, l: palette.background.l + 6, h: palette.background.h + 10 })}" />
    </linearGradient>
  `);
  elements.push(`<rect width="${width}" height="${height}" fill="url(#${prefix}gbg)" />`);

  const colors = [palette.primary, palette.secondary, palette.accent, palette.highlight];

  switch (style) {
    case "triangles": {
      const cellSize = h.float(30, 80);
      const cols = Math.ceil(width / cellSize) + 1;
      const rows = Math.ceil(height / (cellSize * 0.866)) + 1;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * cellSize + (row % 2 ? cellSize / 2 : 0);
          const y = row * cellSize * 0.866;
          const color = h.pick(colors);
          const opacity = h.float(0.08, 0.5);
          const up = (col + row) % 2 === 0;
          const pts = up
            ? `${r(x)},${r(y + cellSize * 0.866)} ${r(x + cellSize / 2)},${r(y)} ${r(x + cellSize)},${r(y + cellSize * 0.866)}`
            : `${r(x)},${r(y)} ${r(x + cellSize / 2)},${r(y + cellSize * 0.866)} ${r(x + cellSize)},${r(y)}`;
          elements.push(
            `<polygon points="${pts}" fill="${hslToString(color, opacity)}" stroke="${hslToString(color, opacity * 0.3)}" stroke-width="0.5" />`
          );
        }
      }
      break;
    }

    case "hexagons": {
      const size = h.float(25, 55);
      const hexH = size * 2;
      const hexW = Math.sqrt(3) * size;
      const cols = Math.ceil(width / hexW) + 1;
      const rows = Math.ceil(height / (hexH * 0.75)) + 1;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cx = col * hexW + (row % 2 ? hexW / 2 : 0);
          const cy = row * hexH * 0.75;
          const color = h.pick(colors);
          const opacity = h.float(0.06, 0.45);
          const pts = Array.from({ length: 6 }, (_, i) => {
            const angle = (Math.PI / 3) * i - Math.PI / 6;
            return `${r(cx + size * Math.cos(angle))},${r(cy + size * Math.sin(angle))}`;
          }).join(" ");
          elements.push(
            `<polygon points="${pts}" fill="${hslToString(color, opacity)}" stroke="${hslToString(palette.highlight, 0.08)}" stroke-width="1" />`
          );
        }
      }
      break;
    }

    case "diamonds": {
      const cellW = h.float(30, 70);
      const cellH = cellW * h.float(0.8, 1.4);
      const cols = Math.ceil(width / cellW) + 2;
      const rows = Math.ceil(height / cellH) + 2;
      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const x = col * cellW + (row % 2 ? cellW / 2 : 0);
          const y = row * cellH;
          const color = h.pick(colors);
          const opacity = h.float(0.06, 0.4);
          const pts = `${r(x)},${r(y - cellH / 2)} ${r(x + cellW / 2)},${r(y)} ${r(x)},${r(y + cellH / 2)} ${r(x - cellW / 2)},${r(y)}`;
          elements.push(
            `<polygon points="${pts}" fill="${hslToString(color, opacity)}" />`
          );
        }
      }
      break;
    }

    case "circles": {
      const count = h.int(15, 50);
      for (let i = 0; i < count; i++) {
        const cx = r(h.float(-20, width + 20));
        const cy = r(h.float(-20, height + 20));
        const cr = r(h.float(8, Math.min(width, height) * 0.25));
        const color = h.pick(colors);
        const opacity = h.float(0.06, 0.3);
        const filled = h.rand() > 0.4;
        if (filled) {
          elements.push(
            `<circle cx="${cx}" cy="${cy}" r="${cr}" fill="${hslToString(color, opacity)}" />`
          );
        } else {
          elements.push(
            `<circle cx="${cx}" cy="${cy}" r="${cr}" fill="none" stroke="${hslToString(color, opacity)}" stroke-width="${r(h.float(1, 3))}" />`
          );
        }
      }
      break;
    }

    case "bars": {
      const vertical = h.rand() > 0.5;
      const count = h.int(8, 30);
      const gap = h.float(1, 6);
      if (vertical) {
        const barW = (width + gap) / count - gap;
        for (let i = 0; i < count; i++) {
          const x = r(i * (barW + gap));
          const color = h.pick(colors);
          const opacity = h.float(0.1, 0.5);
          const barH = h.float(height * 0.2, height);
          const y = r(h.float(0, height - barH));
          elements.push(
            `<rect x="${x}" y="${y}" width="${r(barW)}" height="${r(barH)}" rx="${r(h.float(0, 4))}" fill="${hslToString(color, opacity)}" />`
          );
        }
      } else {
        const barH = (height + gap) / count - gap;
        for (let i = 0; i < count; i++) {
          const y = r(i * (barH + gap));
          const color = h.pick(colors);
          const opacity = h.float(0.1, 0.5);
          const barW = h.float(width * 0.2, width);
          const x = r(h.float(0, width - barW));
          elements.push(
            `<rect x="${x}" y="${y}" width="${r(barW)}" height="${r(barH)}" rx="${r(h.float(0, 4))}" fill="${hslToString(color, opacity)}" />`
          );
        }
      }
      break;
    }
  }

  // Accent overlay lines
  const lineCount = h.int(0, 5);
  for (let i = 0; i < lineCount; i++) {
    const x1 = r(h.float(0, width));
    const y1 = r(h.float(0, height));
    const x2 = r(h.float(0, width));
    const y2 = r(h.float(0, height));
    elements.push(
      `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${hslToString(palette.highlight, h.float(0.05, 0.2))}" stroke-width="${r(h.float(0.5, 2))}" />`
    );
  }

  // Grain
  defs.push(`
    <filter id="${prefix}ggrain">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  `);
  elements.push(
    `<rect width="${width}" height="${height}" filter="url(#${prefix}ggrain)" opacity="0.03" />`
  );

  return `<defs>${defs.join("")}</defs>${elements.join("")}`;
}
