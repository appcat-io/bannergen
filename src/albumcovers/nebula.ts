import type { HashParams } from "../utils/hash";
import type { Palette } from "../utils/colors";
import { hslToString } from "../utils/colors";

/** Round a number to 1 decimal place */
const rd = (n: number) => +n.toFixed(1);

export function generateNebula(
  h: HashParams,
  palette: Palette,
  size: number,
  prefix: string = ""
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
    const cx = rd(h.float(size * -0.1, size * 1.1));
    const cy = rd(h.float(size * -0.1, size * 1.1));
    const rx = rd(h.float(size * 0.15, size * 0.5));
    const ry = rd(h.float(size * 0.15, size * 0.5));
    const color = h.pick([palette.primary, palette.secondary, palette.accent]);
    const opacity = h.float(0.08, 0.3);
    const blurAmount = rd(h.float(15, 40));

    // Radial gradient for soft edges
    defs.push(`
      <radialGradient id="${prefix}nb-blob${i}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${hslToString({ ...color, l: Math.min(80, color.l + 15) })}" stop-opacity="${rd(opacity * 1.3)}" />
        <stop offset="40%" stop-color="${hslToString(color)}" stop-opacity="${rd(opacity)}" />
        <stop offset="100%" stop-color="${hslToString(color)}" stop-opacity="0" />
      </radialGradient>
    `);

    // Blur filter per cloud
    defs.push(`
      <filter id="${prefix}nb-blur${i}">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${blurAmount}" />
      </filter>
    `);

    // Blurred glow layer
    elements.push(
      `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#${prefix}nb-blob${i})" filter="url(#${prefix}nb-blur${i})" />`
    );
    // Sharp overlay layer at reduced opacity
    elements.push(
      `<ellipse cx="${cx}" cy="${cy}" rx="${rd(+rx * 0.7)}" ry="${rd(+ry * 0.7)}" fill="url(#${prefix}nb-blob${i})" opacity="${rd(opacity * 0.5)}" />`
    );
  }

  // Bright stellar core spots
  const coreCount = h.int(2, 4);
  for (let i = 0; i < coreCount; i++) {
    const cx = rd(h.float(size * 0.15, size * 0.85));
    const cy = rd(h.float(size * 0.15, size * 0.85));
    const r = rd(h.float(size * 0.02, size * 0.06));
    const color = h.pick([palette.highlight, palette.accent, palette.primary]);

    defs.push(`
      <radialGradient id="${prefix}nb-core${i}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${hslToString({ ...color, l: Math.min(95, color.l + 30), s: Math.max(20, color.s - 20) })}" stop-opacity="0.6" />
        <stop offset="30%" stop-color="${hslToString({ ...color, l: Math.min(80, color.l + 15) })}" stop-opacity="0.3" />
        <stop offset="100%" stop-color="${hslToString(color)}" stop-opacity="0" />
      </radialGradient>
    `);

    elements.push(
      `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${prefix}nb-core${i})" />`
    );
  }

  // Star field
  const starCount = h.int(40, 100);
  for (let i = 0; i < starCount; i++) {
    const sx = rd(h.float(0, size));
    const sy = rd(h.float(0, size));
    const sr = rd(h.float(0.3, 1.5));
    const starColor = h.rand() > 0.3
      ? palette.highlight
      : h.pick([palette.primary, palette.accent]);
    elements.push(
      `<circle cx="${sx}" cy="${sy}" r="${sr}" fill="${hslToString(starColor, h.float(0.15, 0.8))}" />`
    );
  }

  // Radial vignette
  defs.push(`
    <radialGradient id="${prefix}nb-vignette" cx="50%" cy="50%" r="65%">
      <stop offset="0%" stop-color="transparent" />
      <stop offset="100%" stop-color="${hslToString({ ...palette.background, l: Math.max(2, palette.background.l - 3) }, 0.7)}" />
    </radialGradient>
  `);
  elements.push(
    `<rect width="${size}" height="${size}" fill="url(#${prefix}nb-vignette)" />`
  );

  // Grain overlay (higher opacity for film-grain texture)
  defs.push(`
    <filter id="${prefix}nb-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.75" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  `);
  elements.push(
    `<rect width="${size}" height="${size}" filter="url(#${prefix}nb-grain)" opacity="0.06" />`
  );

  return `<defs>${defs.join("")}</defs>${elements.join("")}`;
}
