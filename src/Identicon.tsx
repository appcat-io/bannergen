import React from "react";
import { generateAvatarSVG, type AvatarVariant } from "./avatar";

export interface IdenticonProps {
  /** String to generate the avatar from */
  name: string;
  /** Size in pixels (square, default: 128) */
  size?: number;
  /** Avatar variant. "auto" picks deterministically from name. */
  variant?: AvatarVariant;
  /** Render as circle (default: false) */
  rounded?: boolean;
  /** Custom color palette (array of 3+ hex strings) */
  colors?: string[];
  /** Additional CSS class name */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Alt text for accessibility */
  alt?: string;
}

/**
 * React component that renders a deterministic identicon avatar from any string.
 *
 * @example
 * ```tsx
 * import { Identicon } from "@appcat/bannergen";
 *
 * <Identicon name="alice" />
 * <Identicon name="bob" variant="pixelGrid" size={64} rounded />
 * <Identicon name="charlie" colors={["#264653", "#2a9d8f", "#e9c46a"]} />
 * ```
 */
export function Identicon({
  name,
  size = 128,
  variant = "auto",
  rounded = false,
  colors,
  className,
  style,
  alt,
}: IdenticonProps) {
  const svg = generateAvatarSVG({ name, size, variant, rounded, colors });

  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        overflow: "hidden",
        lineHeight: 0,
        borderRadius: rounded ? "50%" : 0,
        ...style,
      }}
      role="img"
      aria-label={alt ?? `Avatar for ${name}`}
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}

/**
 * Avatar wrapper with image fallback support.
 *
 * @example
 * ```tsx
 * import { Avatar, AvatarImage, AvatarFallback } from "@appcat/bannergen";
 *
 * <Avatar size={64} rounded>
 *   <AvatarImage src="/profile.jpg" />
 *   <AvatarFallback name="alice" />
 * </Avatar>
 * ```
 */
export function Avatar({
  children,
  size = 128,
  rounded = false,
  className,
  style,
}: {
  children: React.ReactNode;
  size?: number;
  rounded?: boolean;
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
        borderRadius: rounded ? "50%" : 0,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function AvatarImage({
  src,
  alt = "Avatar",
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

export function AvatarFallback(props: IdenticonProps) {
  return <Identicon {...props} />;
}
