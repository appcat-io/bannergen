import type { HashParams } from "../utils/hash";
import type { BannerPalette } from "../utils/colors";
import { hslToString } from "../utils/colors";

export function generateNebula(
  h: HashParams,
  palette: BannerPalette,
  size: number
): string {
  const defs: string[] = [];
  const elements: string[] = [];

  // Very dark background
  elements.push(
    `<rect width="${size}" height="${size}" fill="${hslToString({ ...palette.background, l: Math.max(3, palette.background.l - 5) })}" />`
  );

  // Nebula cloud blobs — large, soft, diffuse
  const cloudCount = h.int(5, 10);
  for (let i = 0; i < cloudCount; i++) {
    const cx = h.float(size * -0.1, size * 1.1);
    const cy = h.float(size * -0.1, size * 1.1);
    const rx = h.float(size * 0.15, size * 0.5);
    const ry = h.float(size * 0.15, size * 0.5);
    const color = h.pick([palette.primary, palette.secondary, palette.accent]);
    const opacity = h.float(0.08, 0.3);
    const blurAmount = h.float(15, 40);

    // Radial gradient for soft edges
    defs.push(`
      <radialGradient id="nb-blob${i}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${hslToString({ ...color, l: Math.min(80, color.l + 15) })}" stop-opacity="${opacity * 1.3}" />
        <stop offset="40%" stop-color="${hslToString(color)}" stop-opacity="${opacity}" />
        <stop offset="100%" stop-color="${hslToString(color)}" stop-opacity="0" />
      </radialGradient>
    `);

    // Blur filter per cloud
    defs.push(`
      <filter id="nb-blur${i}">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${blurAmount}" />
      </filter>
    `);

    // Blurred glow layer
    elements.push(
      `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#nb-blob${i})" filter="url(#nb-blur${i})" />`
    );
    // Sharp overlay layer at reduced opacity
    elements.push(
      `<ellipse cx="${cx}" cy="${cy}" rx="${rx * 0.7}" ry="${ry * 0.7}" fill="url(#nb-blob${i})" opacity="${opacity * 0.5}" />`
    );
  }

  // Bright stellar core spots
  const coreCount = h.int(2, 4);
  for (let i = 0; i < coreCount; i++) {
    const cx = h.float(size * 0.15, size * 0.85);
    const cy = h.float(size * 0.15, size * 0.85);
    const r = h.float(size * 0.02, size * 0.06);
    const color = h.pick([palette.highlight, palette.accent, palette.primary]);

    defs.push(`
      <radialGradient id="nb-core${i}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${hslToString({ ...color, l: Math.min(95, color.l + 30), s: Math.max(20, color.s - 20) })}" stop-opacity="0.6" />
        <stop offset="30%" stop-color="${hslToString({ ...color, l: Math.min(80, color.l + 15) })}" stop-opacity="0.3" />
        <stop offset="100%" stop-color="${hslToString(color)}" stop-opacity="0" />
      </radialGradient>
    `);

    elements.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#nb-core${i})" />`
    );
  }

  // Star field
  const starCount = h.int(40, 100);
  for (let i = 0; i < starCount; i++) {
    const sx = h.float(0, size);
    const sy = h.float(0, size);
    const sr = h.float(0.3, 1.5);
    const so = h.float(0.15, 0.8);
    const starColor = h.rand() > 0.3
      ? palette.highlight
      : h.pick([palette.primary, palette.accent]);
    elements.push(
      `<circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="${sr}" fill="${hslToString(starColor, so)}" />`
    );
  }

  // Radial vignette
  defs.push(`
    <radialGradient id="nb-vignette" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="transparent" />
      <stop offset="100%" stop-color="${hslToString({ ...palette.background, l: Math.max(2, palette.background.l - 3) }, 0.7)}" />
    </radialGradient>
  `);
  elements.push(
    `<rect width="${size}" height="${size}" fill="url(#nb-vignette)" />`
  );

  // Grain overlay (higher opacity for film-grain texture)
  defs.push(`
    <filter id="nb-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  `);
  elements.push(
    `<rect width="${size}" height="${size}" filter="url(#nb-grain)" opacity="0.06" />`
  );

  return `<defs>${defs.join("")}</defs>${elements.join("")}`;
}
