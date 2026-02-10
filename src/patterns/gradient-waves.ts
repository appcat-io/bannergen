import type { HashParams } from "../utils/hash";
import type { BannerPalette } from "../utils/colors";
import { hslToString } from "../utils/colors";

export function generateGradientWaves(
  h: HashParams,
  palette: BannerPalette,
  width: number,
  height: number
): string {
  const defs: string[] = [];
  const elements: string[] = [];

  // Background gradient
  const bgAngle = h.float(0, 360);
  defs.push(`
    <linearGradient id="bg" gradientTransform="rotate(${bgAngle})">
      <stop offset="0%" stop-color="${hslToString(palette.background)}" />
      <stop offset="100%" stop-color="${hslToString({ ...palette.background, l: palette.background.l + 8 })}" />
    </linearGradient>
  `);
  elements.push(`<rect width="${width}" height="${height}" fill="url(#bg)" />`);

  // Mesh gradient blobs
  const blobCount = h.int(3, 6);
  for (let i = 0; i < blobCount; i++) {
    const cx = h.float(width * -0.1, width * 1.1);
    const cy = h.float(height * -0.2, height * 1.2);
    const rx = h.float(width * 0.2, width * 0.6);
    const ry = h.float(height * 0.3, height * 0.9);
    const color = h.pick([palette.primary, palette.secondary, palette.accent]);
    const opacity = h.float(0.15, 0.45);

    defs.push(`
      <radialGradient id="blob${i}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${hslToString(color)}" stop-opacity="${opacity}" />
        <stop offset="70%" stop-color="${hslToString(color)}" stop-opacity="${opacity * 0.3}" />
        <stop offset="100%" stop-color="${hslToString(color)}" stop-opacity="0" />
      </radialGradient>
    `);

    elements.push(
      `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}" fill="url(#blob${i})" />`
    );
  }

  // Flowing wave paths
  const waveCount = h.int(3, 6);
  for (let i = 0; i < waveCount; i++) {
    const baseY = h.float(height * 0.1, height * 0.9);
    const amplitude = h.float(height * 0.05, height * 0.25);
    const freq = h.float(0.5, 2.5);
    const phase = h.float(0, Math.PI * 2);
    const color = h.pick([palette.primary, palette.secondary, palette.accent, palette.highlight]);
    const opacity = h.float(0.08, 0.3);
    const strokeW = h.float(1, 4);

    let d = `M 0 ${baseY}`;
    const segments = 20;
    for (let j = 1; j <= segments; j++) {
      const x = (j / segments) * width;
      const y =
        baseY +
        Math.sin((j / segments) * Math.PI * freq + phase) * amplitude +
        Math.cos((j / segments) * Math.PI * freq * 0.7 + phase * 1.3) *
          amplitude *
          0.4;
      const cpx = ((j - 0.5) / segments) * width;
      const cpy =
        baseY +
        Math.sin(((j - 0.5) / segments) * Math.PI * freq + phase) *
          amplitude *
          1.2;
      d += ` Q ${cpx} ${cpy} ${x} ${y}`;
    }

    // Fill area below wave
    if (h.rand() > 0.5) {
      const fillD = `${d} L ${width} ${height} L 0 ${height} Z`;
      elements.push(
        `<path d="${fillD}" fill="${hslToString(color, opacity * 0.5)}" />`
      );
    }

    elements.push(
      `<path d="${d}" fill="none" stroke="${hslToString(color, opacity)}" stroke-width="${strokeW}" />`
    );
  }

  // Subtle grain overlay
  defs.push(`
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  `);
  elements.push(
    `<rect width="${width}" height="${height}" filter="url(#grain)" opacity="0.04" />`
  );

  return `<defs>${defs.join("")}</defs>${elements.join("")}`;
}
