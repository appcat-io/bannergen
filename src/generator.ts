import { hashString } from "./utils/hash";
import { generatePalette } from "./utils/colors";
import {
  generateGradientWaves,
  generateGeometric,
  generateTopographic,
  generateAurora,
} from "./patterns";

export type BannerVariant =
  | "gradient"
  | "geometric"
  | "topographic"
  | "aurora"
  | "auto";

export interface BannerOptions {
  /** Input string to hash */
  name: string;
  /** Width in pixels (default: 1500) */
  width?: number;
  /** Height in pixels (default: 500) */
  height?: number;
  /** Pattern variant. "auto" picks deterministically from name. */
  variant?: BannerVariant;
  /** Custom color palette (array of 3+ hex strings) */
  colors?: string[];
}

const PATTERN_FNS = {
  gradient: generateGradientWaves,
  geometric: generateGeometric,
  topographic: generateTopographic,
  aurora: generateAurora,
} as const;

const VARIANTS: BannerVariant[] = [
  "gradient",
  "geometric",
  "topographic",
  "aurora",
];

/**
 * Generate a banner SVG string from the given options.
 * Same input = same output. Always. Deterministic.
 */
export function generateBannerSVG(options: BannerOptions): string {
  const { name, width = 1500, height = 500, variant = "auto", colors } = options;

  const h = hashString(name);
  const palette = generatePalette(h, colors);

  // Pick variant deterministically if auto
  const resolvedVariant: Exclude<BannerVariant, "auto"> =
    variant === "auto" ? h.pick(VARIANTS) as Exclude<BannerVariant, "auto"> : variant;

  const patternFn = PATTERN_FNS[resolvedVariant];
  // Re-hash so the pattern gets fresh randomness after the palette used some
  const patternHash = hashString(name + ":" + resolvedVariant);
  const prefix = patternHash.seeds[0].toString(36).slice(0, 4);
  const inner = patternFn(patternHash, palette, width, height, prefix);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
    inner,
    `</svg>`,
  ].join("\n");
}

/**
 * Generate a data URI for the banner (for <img src="..."> usage).
 */
export function generateBannerDataURI(options: BannerOptions): string {
  const svg = generateBannerSVG(options);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
