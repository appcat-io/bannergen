// Core generator
export { generateBannerSVG, generateBannerDataURI } from "./generator";
export type { BannerOptions, BannerVariant } from "./generator";

// React components
export { Bannergen, Banner, BannerImage, BannerFallback } from "./Bannergen";
export type { BannergenProps } from "./Bannergen";

// Avatar generator
export { generateAvatarSVG, generateAvatarDataURI } from "./avatar";
export type { AvatarOptions, AvatarVariant } from "./avatar";

// Avatar React components
export { Identicon, Avatar, AvatarImage, AvatarFallback } from "./Identicon";
export type { IdenticonProps } from "./Identicon";

// Album cover generator
export { generateAlbumCoverSVG, generateAlbumCoverDataURI } from "./albumcover";
export type { AlbumCoverOptions, AlbumCoverVariant } from "./albumcover";

// Album cover React components
export { AlbumCover, AlbumArt, AlbumArtImage, AlbumArtFallback } from "./AlbumArt";
export type { AlbumCoverProps } from "./AlbumArt";

// Utilities (for advanced usage)
export { hashString } from "./utils/hash";
export type { HashParams } from "./utils/hash";
export { generatePalette, hslToString, hslToHex } from "./utils/colors";
export type { BannerPalette, HSL } from "./utils/colors";
