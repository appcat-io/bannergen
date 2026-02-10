import { generateBannerSVG, type BannerVariant } from "./generator";
import { generateAvatarSVG, type AvatarVariant } from "./avatar";
import { generateAlbumCoverSVG, type AlbumCoverVariant } from "./albumcover";

/**
 * Creates a Next.js App Router route handler for generating banner images.
 *
 * @example
 * ```ts
 * // app/api/banner/route.ts
 * import { toBannergenHandler } from "@appcat/bannergen/next";
 * export const { GET } = toBannergenHandler();
 * ```
 *
 * Usage:
 * ```html
 * <img src="/api/banner?name=alice" />
 * <img src="/api/banner?name=bob&variant=aurora&width=1500&height=500" />
 * ```
 */
export function toBannergenHandler(defaults?: {
  width?: number;
  height?: number;
  variant?: BannerVariant;
}) {
  const GET = async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "default";
    const width = parseInt(searchParams.get("width") || String(defaults?.width || 1500));
    const height = parseInt(searchParams.get("height") || String(defaults?.height || 500));
    const variant = (searchParams.get("variant") as BannerVariant) || defaults?.variant || "auto";
    const colorsParam = searchParams.get("colors");
    const colors = colorsParam ? colorsParam.split(",").map((c) => (c.startsWith("#") ? c : `#${c}`)) : undefined;

    const svg = generateBannerSVG({ name, width, height, variant, colors });

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  };

  return { GET };
}

/**
 * Creates a Next.js App Router route handler for generating avatar images.
 *
 * @example
 * ```ts
 * // app/api/avatar/route.ts
 * import { toIdenticonHandler } from "@appcat/bannergen/next";
 * export const { GET } = toIdenticonHandler();
 * ```
 *
 * Usage:
 * ```html
 * <img src="/api/avatar?name=alice" />
 * <img src="/api/avatar?name=bob&variant=pixelGrid&size=256&rounded=true" />
 * ```
 */
export function toIdenticonHandler(defaults?: {
  size?: number;
  variant?: AvatarVariant;
  rounded?: boolean;
}) {
  const GET = async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "default";
    const size = parseInt(searchParams.get("size") || String(defaults?.size || 128));
    const variant = (searchParams.get("variant") as AvatarVariant) || defaults?.variant || "auto";
    const rounded = searchParams.get("rounded") === "true" || defaults?.rounded || false;
    const colorsParam = searchParams.get("colors");
    const colors = colorsParam ? colorsParam.split(",").map((c) => (c.startsWith("#") ? c : `#${c}`)) : undefined;

    const svg = generateAvatarSVG({ name, size, variant, rounded, colors });

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  };

  return { GET };
}

/**
 * Creates a Next.js App Router route handler for generating album cover images.
 *
 * @example
 * ```ts
 * // app/api/albumcover/route.ts
 * import { toAlbumCoverHandler } from "@appcat/bannergen/next";
 * export const { GET } = toAlbumCoverHandler();
 * ```
 *
 * Usage:
 * ```html
 * <img src="/api/albumcover?name=alice" />
 * <img src="/api/albumcover?name=bob&variant=nebula&size=512" />
 * ```
 */
export function toAlbumCoverHandler(defaults?: {
  size?: number;
  variant?: AlbumCoverVariant;
}) {
  const GET = async (request: Request) => {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get("name") || "default";
    const size = parseInt(searchParams.get("size") || String(defaults?.size || 512));
    const variant = (searchParams.get("variant") as AlbumCoverVariant) || defaults?.variant || "auto";
    const colorsParam = searchParams.get("colors");
    const colors = colorsParam ? colorsParam.split(",").map((c) => (c.startsWith("#") ? c : `#${c}`)) : undefined;

    const svg = generateAlbumCoverSVG({ name, size, variant, colors });

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  };

  return { GET };
}
