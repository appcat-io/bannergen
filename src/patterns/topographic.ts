import type { HashParams } from "../utils/hash";
import type { BannerPalette } from "../utils/colors";
import { hslToString } from "../utils/colors";

export function generateTopographic(
  h: HashParams,
  palette: BannerPalette,
  width: number,
  height: number
): string {
  const defs: string[] = [];
  const elements: string[] = [];

  // Background
  defs.push(`
    <linearGradient id="tbg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${hslToString(palette.background)}" />
      <stop offset="100%" stop-color="${hslToString({ ...palette.background, l: palette.background.l + 5, h: palette.background.h + 15 })}" />
    </linearGradient>
  `);
  elements.push(`<rect width="${width}" height="${height}" fill="url(#tbg)" />`);

  // Generate contour centers
  const centers = h.int(2, 5);
  const cx: number[] = [];
  const cy: number[] = [];
  for (let i = 0; i < centers; i++) {
    cx.push(h.float(width * 0.1, width * 0.9));
    cy.push(h.float(height * 0.1, height * 0.9));
  }

  // Simple 2D noise function (seeded)
  const noiseScale = h.float(0.004, 0.012);
  const octaves = h.int(2, 4);
  const seedX = h.float(0, 1000);
  const seedY = h.float(0, 1000);

  function noise2D(x: number, y: number): number {
    // Simple value noise approximation
    let val = 0;
    let amp = 1;
    let freq = 1;
    let maxAmp = 0;
    for (let o = 0; o < octaves; o++) {
      const nx = (x * noiseScale * freq + seedX) * 1.17;
      const ny = (y * noiseScale * freq + seedY) * 1.17;
      // Hash-based noise
      const ix = Math.floor(nx);
      const iy = Math.floor(ny);
      const fx = nx - ix;
      const fy = ny - iy;
      const smooth = (t: number) => t * t * (3 - 2 * t);
      const sfx = smooth(fx);
      const sfy = smooth(fy);
      const n00 = pseudoRand(ix, iy);
      const n10 = pseudoRand(ix + 1, iy);
      const n01 = pseudoRand(ix, iy + 1);
      const n11 = pseudoRand(ix + 1, iy + 1);
      const nx0 = n00 + (n10 - n00) * sfx;
      const nx1 = n01 + (n11 - n01) * sfx;
      val += (nx0 + (nx1 - nx0) * sfy) * amp;
      maxAmp += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return val / maxAmp;
  }

  function pseudoRand(x: number, y: number): number {
    const n = Math.sin(x * 127.1 + y * 311.7 + seedX * 0.01) * 43758.5453;
    return n - Math.floor(n);
  }

  // Sample the field and draw contour lines
  const contourLevels = h.int(8, 18);
  const colors = [palette.primary, palette.secondary, palette.accent];
  const lineOpacity = h.float(0.15, 0.5);
  const lineWidth = h.float(0.8, 2.5);
  const fillContours = h.rand() > 0.4;

  // Resolution for marching
  const res = 8;
  const cols = Math.ceil(width / res);
  const rows = Math.ceil(height / res);

  // Sample field values
  const field: number[][] = [];
  for (let iy = 0; iy <= rows; iy++) {
    field[iy] = [];
    for (let ix = 0; ix <= cols; ix++) {
      const px = ix * res;
      const py = iy * res;
      let v = noise2D(px, py);

      // Add radial influence from centers
      for (let c = 0; c < centers; c++) {
        const d = Math.sqrt((px - cx[c]) ** 2 + (py - cy[c]) ** 2);
        const maxD = Math.sqrt(width * width + height * height) * 0.5;
        v += Math.max(0, 1 - d / maxD) * 0.3;
      }

      field[iy][ix] = v;
    }
  }

  // Marching squares for each contour level
  for (let level = 0; level < contourLevels; level++) {
    const threshold = (level + 1) / (contourLevels + 1);
    const segments: [number, number, number, number][] = [];

    for (let iy = 0; iy < rows; iy++) {
      for (let ix = 0; ix < cols; ix++) {
        const v00 = field[iy][ix];
        const v10 = field[iy][ix + 1];
        const v01 = field[iy + 1][ix];
        const v11 = field[iy + 1][ix + 1];

        const x = ix * res;
        const y = iy * res;

        // Classification
        const c =
          (v00 >= threshold ? 8 : 0) |
          (v10 >= threshold ? 4 : 0) |
          (v11 >= threshold ? 2 : 0) |
          (v01 >= threshold ? 1 : 0);

        if (c === 0 || c === 15) continue;

        const lerpEdge = (va: number, vb: number) => {
          if (Math.abs(va - vb) < 0.0001) return 0.5;
          return (threshold - va) / (vb - va);
        };

        const top = x + lerpEdge(v00, v10) * res;
        const bottom = x + lerpEdge(v01, v11) * res;
        const left = y + lerpEdge(v00, v01) * res;
        const right = y + lerpEdge(v10, v11) * res;

        const addSeg = (x1: number, y1: number, x2: number, y2: number) =>
          segments.push([x1, y1, x2, y2]);

        // Simplified marching squares cases
        switch (c) {
          case 1: addSeg(x, left, bottom, y + res); break;
          case 2: addSeg(bottom, y + res, x + res, right); break;
          case 3: addSeg(x, left, x + res, right); break;
          case 4: addSeg(top, y, x + res, right); break;
          case 5: addSeg(x, left, top, y); addSeg(bottom, y + res, x + res, right); break;
          case 6: addSeg(top, y, bottom, y + res); break;
          case 7: addSeg(x, left, top, y); break;
          case 8: addSeg(top, y, x, left); break;
          case 9: addSeg(top, y, bottom, y + res); break;
          case 10: addSeg(top, y, x + res, right); addSeg(x, left, bottom, y + res); break;
          case 11: addSeg(top, y, x + res, right); break;
          case 12: addSeg(x, left, x + res, right); break;
          case 13: addSeg(bottom, y + res, x + res, right); break;
          case 14: addSeg(x, left, bottom, y + res); break;
        }
      }
    }

    const color = colors[level % colors.length];
    const alpha = lineOpacity * (0.5 + (level / contourLevels) * 0.5);

    // Build path from segments
    if (segments.length > 0) {
      let d = segments
        .map(([x1, y1, x2, y2]) => `M${x1.toFixed(1)},${y1.toFixed(1)} L${x2.toFixed(1)},${y2.toFixed(1)}`)
        .join(" ");
      elements.push(
        `<path d="${d}" fill="none" stroke="${hslToString(color, alpha)}" stroke-width="${lineWidth}" stroke-linecap="round" />`
      );
    }

    // Optional fill between levels
    if (fillContours && level % 3 === 0) {
      const fillColor = h.pick(colors);
      for (let iy = 0; iy < rows; iy += 2) {
        for (let ix = 0; ix < cols; ix += 2) {
          if (field[iy][ix] >= threshold && field[iy][ix] < threshold + 1 / (contourLevels + 1)) {
            elements.push(
              `<rect x="${ix * res}" y="${iy * res}" width="${res * 2}" height="${res * 2}" fill="${hslToString(fillColor, 0.04)}" />`
            );
          }
        }
      }
    }
  }

  // Subtle dot grid overlay
  if (h.rand() > 0.5) {
    const dotSpacing = h.int(16, 32);
    const dotColor = hslToString(palette.highlight, 0.06);
    for (let y = dotSpacing; y < height; y += dotSpacing) {
      for (let x = dotSpacing; x < width; x += dotSpacing) {
        elements.push(`<circle cx="${x}" cy="${y}" r="0.8" fill="${dotColor}" />`);
      }
    }
  }

  // Grain
  defs.push(`
    <filter id="tgrain">
      <feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  `);
  elements.push(`<rect width="${width}" height="${height}" filter="url(#tgrain)" opacity="0.03" />`);

  return `<defs>${defs.join("")}</defs>${elements.join("")}`;
}
