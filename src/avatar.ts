import { hashString } from "./utils/hash";
import { generatePalette } from "./utils/colors";
import {
  generatePixelGrid,
  generateGeometricAvatar,
  generateRings,
} from "./avatars";

export type AvatarVariant = "pixelGrid" | "geometric" | "rings" | "auto";

export interface AvatarOptions {
  /** Input string to hash */
  name: string;
  /** Size in pixels (square, default: 128) */
  size?: number;
  /** Avatar style variant. "auto" picks deterministically from name. */
  variant?: AvatarVariant;
  /** Render as circle via SVG clip-path (default: false) */
  rounded?: boolean;
  /** Custom color palette (array of 3+ hex strings) */
  colors?: string[];
}

const PATTERN_FNS = {
  pixelGrid: generatePixelGrid,
  geometric: generateGeometricAvatar,
  rings: generateRings,
} as const;

const VARIANTS: AvatarVariant[] = ["pixelGrid", "geometric", "rings"];

/**
 * Generate an avatar SVG string from the given options.
 * Same input = same output. Always. Deterministic.
 */
export function generateAvatarSVG(options: AvatarOptions): string {
  const { name, size = 128, variant = "auto", rounded = false, colors } = options;

  const h = hashString(name);
  const palette = generatePalette(h, colors);

  // Pick variant deterministically if auto
  const resolvedVariant: Exclude<AvatarVariant, "auto"> =
    variant === "auto" ? h.pick(VARIANTS) as Exclude<AvatarVariant, "auto"> : variant;

  const patternFn = PATTERN_FNS[resolvedVariant];
  // Re-hash so the pattern gets fresh randomness after the palette used some
  const patternHash = hashString(name + ":" + resolvedVariant);
  const prefix = patternHash.seeds[0].toString(36).slice(0, 4);
  const inner = patternFn(patternHash, palette, size, prefix);

  const clipDefs = rounded
    ? `<clipPath id="${prefix}avatar-clip"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" /></clipPath>`
    : "";
  const clipOpen = rounded ? `<g clip-path="url(#${prefix}avatar-clip)">` : "";
  const clipClose = rounded ? `</g>` : "";

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`,
    clipDefs ? `<defs>${clipDefs}</defs>` : "",
    clipOpen,
    inner,
    clipClose,
    `</svg>`,
  ].join("\n");
}

/**
 * Generate a data URI for the avatar (for <img src="..."> usage).
 */
export function generateAvatarDataURI(options: AvatarOptions): string {
  const svg = generateAvatarSVG(options);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
