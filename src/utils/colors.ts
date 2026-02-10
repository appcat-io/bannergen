import type { HashParams } from "./hash";

export interface HSL {
  h: number; // 0-360
  s: number; // 0-100
  l: number; // 0-100
}

export function hslToString(c: HSL, alpha?: number): string {
  const h = +c.h.toFixed(1);
  const s = +c.s.toFixed(1);
  const l = +c.l.toFixed(1);
  if (alpha !== undefined) {
    return `hsla(${h},${s}%,${l}%,${+alpha.toFixed(3)})`;
  }
  return `hsl(${h},${s}%,${l}%)`;
}

export function hslToHex(c: HSL): string {
  const s = c.s / 100;
  const l = c.l / 100;
  const a2 = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + c.h / 30) % 12;
    const color = l - a2 * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Color palette strategies */
const PALETTE_STRATEGIES = [
  "analogous",
  "complementary",
  "triadic",
  "split-complementary",
  "monochromatic",
  "deep-contrast",
] as const;

export type PaletteStrategy = (typeof PALETTE_STRATEGIES)[number];

export interface Palette {
  primary: HSL;
  secondary: HSL;
  accent: HSL;
  background: HSL;
  highlight: HSL;
  strategy: PaletteStrategy;
}

/** @deprecated Use `Palette` instead */
export type BannerPalette = Palette;

export function generatePalette(
  h: HashParams,
  customColors?: string[]
): Palette {
  if (customColors && customColors.length >= 3) {
    return customColorsToPalette(customColors);
  }

  const strategy = h.pick([...PALETTE_STRATEGIES]);
  const baseHue = h.float(0, 360);
  const baseSat = h.float(55, 95);
  const baseLit = h.float(35, 65);

  const primary: HSL = { h: baseHue, s: baseSat, l: baseLit };

  let secondary: HSL;
  let accent: HSL;

  switch (strategy) {
    case "analogous":
      secondary = {
        h: (baseHue + h.float(20, 45)) % 360,
        s: baseSat + h.float(-10, 10),
        l: baseLit + h.float(-10, 15),
      };
      accent = {
        h: (baseHue - h.float(20, 45) + 360) % 360,
        s: baseSat + h.float(-5, 15),
        l: baseLit + h.float(-5, 20),
      };
      break;

    case "complementary":
      secondary = {
        h: (baseHue + 180 + h.float(-15, 15)) % 360,
        s: baseSat + h.float(-10, 10),
        l: baseLit + h.float(-10, 10),
      };
      accent = {
        h: (baseHue + h.float(30, 60)) % 360,
        s: h.float(60, 90),
        l: h.float(55, 75),
      };
      break;

    case "triadic":
      secondary = {
        h: (baseHue + 120 + h.float(-10, 10)) % 360,
        s: baseSat + h.float(-10, 10),
        l: baseLit + h.float(-5, 10),
      };
      accent = {
        h: (baseHue + 240 + h.float(-10, 10)) % 360,
        s: baseSat + h.float(-5, 15),
        l: baseLit + h.float(-5, 15),
      };
      break;

    case "split-complementary":
      secondary = {
        h: (baseHue + 150 + h.float(-10, 10)) % 360,
        s: baseSat + h.float(-10, 10),
        l: baseLit + h.float(-5, 10),
      };
      accent = {
        h: (baseHue + 210 + h.float(-10, 10)) % 360,
        s: baseSat + h.float(-5, 15),
        l: baseLit + h.float(-5, 15),
      };
      break;

    case "monochromatic":
      secondary = {
        h: baseHue + h.float(-5, 5),
        s: baseSat + h.float(-20, 10),
        l: baseLit + h.float(15, 30),
      };
      accent = {
        h: baseHue + h.float(-5, 5),
        s: baseSat + h.float(-10, 20),
        l: baseLit - h.float(10, 25),
      };
      break;

    case "deep-contrast":
      secondary = {
        h: (baseHue + h.float(60, 120)) % 360,
        s: h.float(70, 100),
        l: h.float(20, 40),
      };
      accent = {
        h: (baseHue + h.float(180, 270)) % 360,
        s: h.float(80, 100),
        l: h.float(60, 80),
      };
      break;

    default:
      secondary = { h: (baseHue + 30) % 360, s: baseSat, l: baseLit + 10 };
      accent = { h: (baseHue + 60) % 360, s: baseSat, l: baseLit - 10 };
  }

  const background: HSL = {
    h: baseHue + h.float(-10, 10),
    s: h.float(15, 40),
    l: h.float(8, 18),
  };

  const highlight: HSL = {
    h: accent.h,
    s: Math.min(100, accent.s + 10),
    l: Math.min(90, accent.l + 20),
  };

  return {
    primary: clampHSL(primary),
    secondary: clampHSL(secondary),
    accent: clampHSL(accent),
    background: clampHSL(background),
    highlight: clampHSL(highlight),
    strategy,
  };
}

function clampHSL(c: HSL): HSL {
  return {
    h: Math.round(((c.h % 360) + 360) % 360 * 10) / 10,
    s: Math.round(Math.max(0, Math.min(100, c.s)) * 10) / 10,
    l: Math.round(Math.max(0, Math.min(100, c.l)) * 10) / 10,
  };
}

function hexToHSL(hex: string): HSL {
  hex = hex.replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
    return { h: 0, s: 50, l: 50 };
  }
  const r = parseInt(hex.substring(0, 2), 16) / 255;
  const g = parseInt(hex.substring(2, 4), 16) / 255;
  const b = parseInt(hex.substring(4, 6), 16) / 255;
  const max = Math.max(r, g, b),
    min = Math.min(r, g, b);
  const l = (max + min) / 2;
  let h = 0,
    s = 0;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function customColorsToPalette(colors: string[]): Palette {
  const hsls = colors.map(hexToHSL);
  return {
    primary: hsls[0],
    secondary: hsls[1] || hsls[0],
    accent: hsls[2] || hsls[0],
    background: { h: hsls[0].h, s: 20, l: 12 },
    highlight: {
      h: (hsls[2] || hsls[0]).h,
      s: 80,
      l: 75,
    },
    strategy: "analogous",
  };
}
