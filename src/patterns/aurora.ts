import type { HashParams } from "../utils/hash";
import type { Palette } from "../utils/colors";
import { hslToString } from "../utils/colors";

/** Round a number to 1 decimal place */
const r = (n: number) => +n.toFixed(1);

export function generateAurora(
  h: HashParams,
  palette: Palette,
  width: number,
  height: number,
  prefix: string = ""
): string {
  const defs: string[] = [];
  const elements: string[] = [];

  // Deep dark background
  elements.push(
    `<rect width="${width}" height="${height}" fill="${hslToString({ ...palette.background, l: Math.max(4, palette.background.l - 4) })}" />`
  );

  // Aurora ribbons
  const ribbonCount = h.int(3, 7);
  for (let i = 0; i < ribbonCount; i++) {
    const color = h.pick([palette.primary, palette.secondary, palette.accent, palette.highlight]);
    const baseY = h.float(height * 0.05, height * 0.85);
    const amplitude = h.float(height * 0.05, height * 0.3);
    const thickness = h.float(height * 0.08, height * 0.3);
    const opacity = h.float(0.08, 0.35);
    const freq = h.float(0.8, 3);
    const phase = h.float(0, Math.PI * 2);

    // Build a flowing ribbon shape with two curves
    const segments = 30;
    let topPath = `M 0 ${r(baseY)}`;
    const botPoints: string[] = [];

    for (let j = 1; j <= segments; j++) {
      const t = j / segments;
      const x = t * width;
      const waveY =
        Math.sin(t * Math.PI * freq + phase) * amplitude +
        Math.sin(t * Math.PI * freq * 1.7 + phase * 0.6) * amplitude * 0.3 +
        Math.cos(t * Math.PI * freq * 0.5 + phase * 1.4) * amplitude * 0.2;

      const topY = baseY + waveY;
      const botY = topY + thickness * (0.5 + Math.sin(t * Math.PI * 2 + phase) * 0.5);

      const prevT = (j - 0.5) / segments;
      const cpx = prevT * width;
      const cpTopY =
        baseY +
        Math.sin(prevT * Math.PI * freq + phase) * amplitude * 1.1 +
        Math.sin(prevT * Math.PI * freq * 1.7 + phase * 0.6) * amplitude * 0.35;

      topPath += ` Q ${r(cpx)} ${r(cpTopY)} ${r(x)} ${r(topY)}`;
      botPoints.unshift(`${r(x)} ${r(botY)}`);
    }

    // Close by going back along bottom
    const fullPath = `${topPath} L ${width} ${r(baseY + thickness)} ` +
      botPoints.map((p) => `L ${p}`).join(" ") +
      " Z";

    // Gradient for this ribbon
    const gradId = `${prefix}aurora${i}`;
    const edgeFade = h.rand() > 0.5;
    defs.push(`
      <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${hslToString(color)}" stop-opacity="${edgeFade ? 0 : r(opacity)}" />
        <stop offset="30%" stop-color="${hslToString(color)}" stop-opacity="${r(opacity)}" />
        <stop offset="50%" stop-color="${hslToString({ ...color, l: Math.min(90, color.l + 15) })}" stop-opacity="${r(opacity * 1.3)}" />
        <stop offset="70%" stop-color="${hslToString(color)}" stop-opacity="${r(opacity)}" />
        <stop offset="100%" stop-color="${hslToString(color)}" stop-opacity="${edgeFade ? 0 : r(opacity)}" />
      </linearGradient>
    `);

    // Blur filter for glow
    const blurId = `${prefix}ablur${i}`;
    const blurAmount = r(h.float(8, 25));
    defs.push(`
      <filter id="${blurId}">
        <feGaussianBlur in="SourceGraphic" stdDeviation="${blurAmount}" />
      </filter>
    `);

    // Glow layer (blurred, higher opacity)
    elements.push(
      `<path d="${fullPath}" fill="url(#${gradId})" filter="url(#${blurId})" opacity="${r(opacity * 0.8)}" />`
    );
    // Sharp layer
    elements.push(
      `<path d="${fullPath}" fill="url(#${gradId})" opacity="${r(opacity * 0.6)}" />`
    );
  }

  // Stars / particle field
  const starCount = h.int(20, 80);
  for (let i = 0; i < starCount; i++) {
    const sx = r(h.float(0, width));
    const sy = r(h.float(0, height));
    const sr = r(h.float(0.3, 2));
    elements.push(
      `<circle cx="${sx}" cy="${sy}" r="${sr}" fill="${hslToString(palette.highlight, h.float(0.1, 0.7))}" />`
    );
  }

  // Subtle horizontal light streaks
  const streakCount = h.int(0, 4);
  for (let i = 0; i < streakCount; i++) {
    const sy = r(h.float(0, height));
    const sw = r(h.float(width * 0.3, width));
    const sx = r(h.float(-50, width - sw + 50));
    const color = h.pick([palette.primary, palette.accent]);
    defs.push(`
      <linearGradient id="${prefix}streak${i}" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="${hslToString(color)}" stop-opacity="0" />
        <stop offset="40%" stop-color="${hslToString(color)}" stop-opacity="${r(h.float(0.03, 0.12))}" />
        <stop offset="60%" stop-color="${hslToString(color)}" stop-opacity="${r(h.float(0.03, 0.12))}" />
        <stop offset="100%" stop-color="${hslToString(color)}" stop-opacity="0" />
      </linearGradient>
    `);
    elements.push(
      `<rect x="${sx}" y="${sy}" width="${sw}" height="${r(h.float(1, 4))}" fill="url(#${prefix}streak${i})" />`
    );
  }

  // Vignette overlay
  defs.push(`
    <radialGradient id="${prefix}avignette" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="transparent" />
      <stop offset="100%" stop-color="${hslToString(palette.background, 0.5)}" />
    </radialGradient>
  `);
  elements.push(
    `<rect width="${width}" height="${height}" fill="url(#${prefix}avignette)" />`
  );

  // Grain
  defs.push(`
    <filter id="${prefix}agrain">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  `);
  elements.push(
    `<rect width="${width}" height="${height}" filter="url(#${prefix}agrain)" opacity="0.05" />`
  );

  return `<defs>${defs.join("")}</defs>${elements.join("")}`;
}
