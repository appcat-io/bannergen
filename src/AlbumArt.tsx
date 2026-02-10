import React from "react";
import { generateAlbumCoverSVG, type AlbumCoverVariant } from "./albumcover";

export interface AlbumCoverProps {
  /** String to generate the album cover from */
  name: string;
  /** Size in pixels (square, default: 512) */
  size?: number;
  /** Album cover variant. "auto" picks deterministically from name. */
  variant?: AlbumCoverVariant;
  /** Custom color palette (array of 3+ hex strings) */
  colors?: string[];
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Border radius (default: 0) */
  borderRadius?: number | string;
  /** Alt text for accessibility */
  alt?: string;
}

/**
 * React component that renders a deterministic album cover from any string.
 *
 * @example
 * ```tsx
 * import { AlbumCover } from "@appcat/bannergen";
 *
 * <AlbumCover name="Midnight Sessions" />
 * <AlbumCover name="Neon Dreams" variant="nebula" size={256} />
 * <AlbumCover name="Acoustic" colors={["#264653", "#2a9d8f", "#e9c46a"]} />
 * ```
 */
export function AlbumCover({
  name,
  size = 512,
  variant = "auto",
  colors,
  className,
  style,
  borderRadius = 0,
  alt,
}: AlbumCoverProps) {
  const svg = generateAlbumCoverSVG({ name, size, variant, colors });

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        overflow: "hidden",
        lineHeight: 0,
        borderRadius,
        ...style,
      }}
      role="img"
      aria-label={alt ?? `Album cover for ${name}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/**
 * Album art wrapper with image fallback support.
 *
 * @example
 * ```tsx
 * import { AlbumArt, AlbumArtImage, AlbumArtFallback } from "@appcat/bannergen";
 *
 * <AlbumArt size={256}>
 *   <AlbumArtImage src="/cover.jpg" />
 *   <AlbumArtFallback name="Midnight Sessions" />
 * </AlbumArt>
 * ```
 */
export function AlbumArt({
  children,
  size = 512,
  borderRadius = 0,
  className,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  borderRadius?: number | string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: size,
        height: size,
        overflow: "hidden",
        borderRadius,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function AlbumArtImage({
  src,
  alt = "Album cover",
  style,
}: {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
}) {
  const [loaded, setLoaded] = React.useState(false);
  const [error, setError] = React.useState(false);

  if (error) return null;

  return (
    <img
      src={src}
      alt={alt}
      onLoad={() => setLoaded(true)}
      onError={() => setError(true)}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "cover",
        display: loaded ? "block" : "none",
        ...style,
      }}
    />
  );
}

export function AlbumArtFallback(props: AlbumCoverProps) {
  return <AlbumCover {...props} />;
}
