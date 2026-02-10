import { hashString } from "./utils/hash";
import { generatePalette } from "./utils/colors";
import {
  generateFluidPaint,
  generateTessellation,
  generateNoiseField,
  generateNebula,
} from "./albumcovers";

export type AlbumCoverVariant =
  | "fluidPaint"
  | "tessellation"
  | "noiseField"
  | "nebula"
  | "auto";

export interface AlbumCoverOptions {
  /** Input string to hash */
  name: string;
  /** Size in pixels (square, default: 512) */
  size?: number;
  /** Album cover style variant. "auto" picks deterministically from name. */
  variant?: AlbumCoverVariant;
  /** Custom color palette (array of 3+ hex strings) */
  colors?: string[];
}

const PATTERN_FNS = {
  fluidPaint: generateFluidPaint,
  tessellation: generateTessellation,
  noiseField: generateNoiseField,
  nebula: generateNebula,
} as const;

const VARIANTS: AlbumCoverVariant[] = [
  "fluidPaint",
  "tessellation",
  "noiseField",
  "nebula",
];

/**
 * Generate an album cover SVG string from the given options.
 * Same input = same output. Always. Deterministic.
 */
export function generateAlbumCoverSVG(options: AlbumCoverOptions): string {
  const { name, size = 512, variant = "auto", colors } = options;

  const h = hashString(name);
  const palette = generatePalette(h, colors);

  // Pick variant deterministically if auto
  const resolvedVariant: Exclude<AlbumCoverVariant, "auto"> =
    variant === "auto"
      ? (h.pick(VARIANTS) as Exclude<AlbumCoverVariant, "auto">)
      : variant;

  const patternFn = PATTERN_FNS[resolvedVariant];
  // Re-hash so the pattern gets fresh randomness after the palette used some
  const patternHash = hashString(name + ":" + resolvedVariant);
  const prefix = patternHash.seeds[0].toString(36).slice(0, 4);
  const inner = patternFn(patternHash, palette, size, prefix);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    inner,
    `</svg>`,
  ].join("\n");
}

/**
 * Generate a data URI for the album cover (for <img src="..."> usage).
 */
export function generateAlbumCoverDataURI(options: AlbumCoverOptions): string {
  const svg = generateAlbumCoverSVG(options);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
