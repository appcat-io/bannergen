import React from "react";
import { generateBannerSVG, type BannerVariant } from "./generator";

export interface BannergenProps {
  /** String to generate the banner from */
  name: string;
  /** Width in pixels (default: 1500) */
  width?: number;
  /** Height in pixels (default: 500) */
  height?: number;
  /** Pattern variant. "auto" picks deterministically from name. */
  variant?: BannerVariant;
  /** Custom color palette (array of 3+ hex strings) */
  colors?: string[];
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Border radius (default: 0) */
  borderRadius?: number | string;
  /** Aspect ratio override (e.g. "3/1" for Twitter banners) */
  aspectRatio?: string;
  /** Alt text for accessibility */
  alt?: string;
}

/**
 * React component that renders a deterministic profile banner from any string.
 *
 * @example
 * ```tsx
 * import { Bannergen } from "bannergen";
 *
 * <Bannergen name="alice" />
 * <Bannergen name="bob" variant="aurora" width={1500} height={500} />
 * <Bannergen name="charlie" colors={["#264653", "#2a9d8f", "#e9c46a"]} />
 * ```
 */
export function Bannergen({
  name,
  width = 1500,
  height = 500,
  variant = "auto",
  colors,
  className,
  style,
  borderRadius,
  aspectRatio,
  alt,
}: BannergenProps) {
  const svg = generateBannerSVG({ name, width, height, variant, colors });

  return (
    <div
      className={className}
      style={{
        width: "100%",
        overflow: "hidden",
        lineHeight: 0,
        borderRadius: borderRadius ?? 0,
        aspectRatio: aspectRatio,
        ...style,
      }}
      role="img"
      aria-label={alt ?? `Banner for ${name}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/**
 * Banner wrapper with image fallback support,
 * similar to facehash's Avatar pattern.
 *
 * @example
 * ```tsx
 * import { Banner, BannerImage, BannerFallback } from "bannergen";
 *
 * <Banner>
 *   <BannerImage src="/header.jpg" />
 *   <BannerFallback name="alice" />
 * </Banner>
 * ```
 */
export function Banner({
  children,
  className,
  style,
}: {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function BannerImage({
  src,
  alt = "Banner",
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

export function BannerFallback(props: BannergenProps) {
  return <Bannergen {...props} />;
}
