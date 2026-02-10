import type { HashParams } from "../utils/hash";
import type { BannerPalette } from "../utils/colors";
import { hslToString } from "../utils/colors";

export function generateFluidPaint(
  h: HashParams,
  palette: BannerPalette,
  size: number
): string {
  const defs: string[] = [];
  const elements: string[] = [];

  // Background gradient
  const bgAngle = h.float(0, 360);
  defs.push(`
    <linearGradient id="fp-bg" gradientTransform="rotate(${bgAngle})">
      <stop offset="0%" stop-color="${hslToString(palette.background)}" />
      <stop offset="100%" stop-color="${hslToString({ ...palette.background, l: palette.background.l + 6, h: palette.background.h + 20 })}" />
    </linearGradient>
  `);
  elements.push(`<rect width="${size}" height="${size}" fill="url(#fp-bg)" />`);

  // Displacement filter for organic distortion on some blobs
  const turbFreq = h.float(0.008, 0.025);
  const turbScale = h.float(20, 60);
  defs.push(`
    <filter id="fp-distort">
      <feTurbulence type="turbulence" baseFrequency="${turbFreq}" numOctaves="3" seed="${h.int(0, 999)}" result="turb" />
      <feDisplacementMap in="SourceGraphic" in2="turb" scale="${turbScale}" xChannelSelector="R" yChannelSelector="G" />
    </filter>
  `);

  // Organic blobs — irregular closed Bezier paths
  const blobCount = h.int(4, 8);
  for (let i = 0; i < blobCount; i++) {
    const cx = h.float(size * 0.05, size * 0.95);
    const cy = h.float(size * 0.05, size * 0.95);
    const baseRadius = h.float(size * 0.12, size * 0.35);
    const color = h.pick([palette.primary, palette.secondary, palette.accent, palette.highlight]);
    const opacity = h.float(0.15, 0.5);
    const useDistortion = h.rand() > 0.5;

    // Build irregular closed path with 6-10 control points
    const pointCount = h.int(6, 10);
    const points: { x: number; y: number }[] = [];
    for (let j = 0; j < pointCount; j++) {
      const angle = (j / pointCount) * Math.PI * 2;
      const r = baseRadius * h.float(0.5, 1.4);
      points.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
      });
    }

    // Build smooth closed cubic Bezier path
    let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
    for (let j = 0; j < pointCount; j++) {
      const curr = points[j];
      const next = points[(j + 1) % pointCount];
      const nextNext = points[(j + 2) % pointCount];
      const prev = points[(j - 1 + pointCount) % pointCount];

      // Control points for smooth curves
      const cp1x = curr.x + (next.x - prev.x) * 0.25;
      const cp1y = curr.y + (next.y - prev.y) * 0.25;
      const cp2x = next.x - (nextNext.x - curr.x) * 0.25;
      const cp2y = next.y - (nextNext.y - curr.y) * 0.25;

      d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${next.x.toFixed(1)} ${next.y.toFixed(1)}`;
    }
    d += " Z";

    // Radial gradient for this blob
    defs.push(`
      <radialGradient id="fp-blob${i}" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="${hslToString({ ...color, l: Math.min(85, color.l + 10) })}" stop-opacity="${opacity}" />
        <stop offset="60%" stop-color="${hslToString(color)}" stop-opacity="${opacity * 0.7}" />
        <stop offset="100%" stop-color="${hslToString(color)}" stop-opacity="0" />
      </radialGradient>
    `);

    const filterAttr = useDistortion ? ' filter="url(#fp-distort)"' : "";
    elements.push(
      `<path d="${d}" fill="url(#fp-blob${i})"${filterAttr} />`
    );
  }

  // Flowing drip/line paths
  const dripCount = h.int(2, 5);
  for (let i = 0; i < dripCount; i++) {
    const startX = h.float(0, size);
    const startY = h.float(0, size * 0.3);
    const color = h.pick([palette.primary, palette.secondary, palette.accent, palette.highlight]);
    const opacity = h.float(0.1, 0.35);
    const strokeW = h.float(1, 4);
    const segCount = h.int(4, 8);

    let d = `M ${startX.toFixed(1)} ${startY.toFixed(1)}`;
    let curX = startX;
    let curY = startY;

    for (let j = 0; j < segCount; j++) {
      const cpx = curX + h.float(-size * 0.15, size * 0.15);
      const cpy = curY + h.float(size * 0.03, size * 0.15);
      const nx = curX + h.float(-size * 0.2, size * 0.2);
      const ny = curY + h.float(size * 0.05, size * 0.2);
      d += ` Q ${cpx.toFixed(1)} ${cpy.toFixed(1)} ${nx.toFixed(1)} ${ny.toFixed(1)}`;
      curX = nx;
      curY = ny;
    }

    elements.push(
      `<path d="${d}" fill="none" stroke="${hslToString(color, opacity)}" stroke-width="${strokeW}" stroke-linecap="round" />`
    );
  }

  // Grain overlay
  defs.push(`
    <filter id="fp-grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="3" stitchTiles="stitch"/>
      <feColorMatrix type="saturate" values="0"/>
    </filter>
  `);
  elements.push(
    `<rect width="${size}" height="${size}" filter="url(#fp-grain)" opacity="0.04" />`
  );

  return `<defs>${defs.join("")}</defs>${elements.join("")}`;
}
