import type { HashParams } from "../utils/hash";
import type { BannerPalette } from "../utils/colors";
import { hslToString } from "../utils/colors";

export function generateNoiseField(
  h: HashParams,
  palette: BannerPalette,
  size: number
): string {
  const defs: string[] = [];
  const elements: string[] = [];

  // Background gradient
  const bgAngle = h.float(0, 360);
  defs.push(`
    <linearGradient id="nf-bg" gradientTransform="rotate(${bgAngle})">
      <stop offset="0%" stop-color="${hslToString(palette.background)}" />
      <stop offset="100%" stop-color="${hslToString({ ...palette.background, l: palette.background.l + 5, h: palette.background.h + 15 })}" />
    </linearGradient>
  `);
  elements.push(`<rect width="${size}" height="${size}" fill="url(#nf-bg)" />`);

  // Noise parameters
  const noiseScale = h.float(0.005, 0.015);
  const octaves = h.int(2, 4);
  const seedX = h.float(0, 1000);
  const seedY = h.float(0, 1000);

  function pseudoRand(x: number, y: number): number {
    const n = Math.sin(x * 127.1 + y * 311.7 + seedX * 0.01) * 43758.5453;
    return n - Math.floor(n);
  }

  function noise2D(x: number, y: number): number {
    let val = 0;
    let amp = 1;
    let freq = 1;
    let maxAmp = 0;
    for (let o = 0; o < octaves; o++) {
      const nx = (x * noiseScale * freq + seedX) * 1.17;
      const ny = (y * noiseScale * freq + seedY) * 1.17;
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

  // Color palette for flow lines
  const colors = [palette.primary, palette.secondary, palette.accent, palette.highlight];

  // Flow field — draw short curved paths following noise-derived angles
  const gridStep = h.int(10, 18);
  const lineLength = h.int(3, 6);
  const stepSize = h.float(4, 8);
  const baseOpacity = h.float(0.15, 0.4);
  const strokeWidth = h.float(0.8, 2);

  // Build all flow lines as batches by color for fewer SVG elements
  const pathsByColor: Map<string, string[]> = new Map();

  for (let gy = gridStep / 2; gy < size; gy += gridStep) {
    for (let gx = gridStep / 2; gx < size; gx += gridStep) {
      // Small random offset from grid center
      let x = gx + h.float(-gridStep * 0.3, gridStep * 0.3);
      let y = gy + h.float(-gridStep * 0.3, gridStep * 0.3);

      // Pick color based on noise value at start position
      const noiseVal = noise2D(x, y);
      const colorIndex = Math.floor(noiseVal * colors.length) % colors.length;
      const color = colors[Math.abs(colorIndex)];
      const opacity = baseOpacity * (0.5 + noiseVal * 0.8);

      // Trace a short path following the flow
      let d = `M${x.toFixed(1)},${y.toFixed(1)}`;
      for (let s = 0; s < lineLength; s++) {
        const angle = noise2D(x, y) * Math.PI * 2;
        const nx = x + Math.cos(angle) * stepSize;
        const ny = y + Math.sin(angle) * stepSize;

        // Stay within bounds
        if (nx < -10 || nx > size + 10 || ny < -10 || ny > size + 10) break;

        d += ` L${nx.toFixed(1)},${ny.toFixed(1)}`;
        x = nx;
        y = ny;
      }

      const key = hslToString(color, opacity);
      if (!pathsByColor.has(key)) pathsByColor.set(key, []);
      pathsByColor.get(key)!.push(d);
    }
  }

  // Render flow paths grouped by color
  for (const [colorStr, paths] of pathsByColor) {
    elements.push(
      `<path d="${paths.join(" ")}" fill="none" stroke="${colorStr}" stroke-width="${strokeWidth}" stroke-linecap="round" />`
    );
  }

  // Scatter particles along the field
  const particleCount = h.int(40, 120);
  for (let i = 0; i < particleCount; i++) {
    const px = h.float(0, size);
    const py = h.float(0, size);
    const noiseVal = noise2D(px, py);
    const color = h.pick(colors);
    const r = h.float(0.5, 2.5);
    const opacity = h.float(0.1, 0.4) * (0.3 + noiseVal);
    elements.push(
      `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="${r}" fill="${hslToString(color, opacity)}" />`
    );
  }

  // Radial vignette
  defs.push(`
    <radialGradient id="nf-vignette" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="transparent" />
      <stop offset="100%" stop-color="${hslToString(palette.background, 0.6)}" />
    </radialGradient>
  `);
  elements.push(
    `<rect width="${size}" height="${size}" fill="url(#nf-vignette)" />`
  );

  // Grain overlay
  defs.push(`
    <filter id="nf-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  `);
  elements.push(
    `<rect width="${size}" height="${size}" filter="url(#nf-grain)" opacity="0.04" />`
  );

  return `<defs>${defs.join("")}</defs>${elements.join("")}`;
}
