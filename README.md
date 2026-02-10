# bannergen

Deterministic profile banners, identicon avatars, and album covers from any string. Zero dependencies. Works with React, Next.js, Vite, Remix.

Same input → same output. Always. No API calls, no storage, no randomness. Just beautiful, unique visuals that work offline.

## Install

```bash
npm i @appcat/bannergen
# or
pnpm add @appcat/bannergen
# or
bun add @appcat/bannergen
# or
yarn add @appcat/bannergen
```

## Quick Start

### React Components

```tsx
import { Bannergen, Identicon, AlbumCover } from "@appcat/bannergen";

// Banners
<Bannergen name="alice" />
<Bannergen name="bob" variant="aurora" />

// Avatars
<Identicon name="alice" size={64} rounded />

// Album Covers
<AlbumCover name="Midnight Sessions" />
<AlbumCover name="Neon Dreams" variant="nebula" size={256} />
```

### Next.js Image Routes

```ts
// app/api/banner/route.ts
import { toBannergenHandler } from "@appcat/bannergen/next";
export const { GET } = toBannergenHandler();

// app/api/avatar/route.ts
import { toIdenticonHandler } from "@appcat/bannergen/next";
export const { GET } = toIdenticonHandler();

// app/api/albumcover/route.ts
import { toAlbumCoverHandler } from "@appcat/bannergen/next";
export const { GET } = toAlbumCoverHandler();
```

```html
<img src="/api/banner?name=alice" />
<img src="/api/avatar?name=alice&rounded=true" />
<img src="/api/albumcover?name=Midnight+Sessions&variant=nebula" />
```

### Vanilla JS / Node

```ts
import {
  generateBannerSVG,
  generateAvatarSVG,
  generateAlbumCoverSVG,
} from "@appcat/bannergen";

const banner = generateBannerSVG({ name: "alice" });
const avatar = generateAvatarSVG({ name: "alice", rounded: true });
const cover = generateAlbumCoverSVG({ name: "Midnight Sessions" });
```

## Banners

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | string | required | Input string to generate from |
| `variant` | string | `"auto"` | `"gradient"` \| `"geometric"` \| `"topographic"` \| `"aurora"` \| `"auto"` |
| `width` | number | 1500 | Width in pixels |
| `height` | number | 500 | Height in pixels |
| `colors` | string[] | — | Custom palette (3+ hex strings) |
| `borderRadius` | number \| string | — | CSS border radius |
| `className` / `style` | — | — | Standard styling props |

### Variants

| Variant | Description |
|---------|-------------|
| `gradient` | Flowing gradient waves, mesh blobs, organic curves |
| `geometric` | Triangles, hexagons, diamonds, circles, bars |
| `topographic` | Contour lines, elevation maps, terrain-inspired |
| `aurora` | Northern lights ribbons, glowing particles, cosmic |
| `auto` | Deterministically picks from name (default) |

### Platform Dimensions

```tsx
<Bannergen name="demo" width={1500} height={500} />  // Twitter/X
<Bannergen name="demo" width={1584} height={396} />  // LinkedIn
<Bannergen name="demo" width={820} height={312} />   // Facebook
<Bannergen name="demo" width={1280} height={480} />  // Discord
```

### Fallback Pattern

```tsx
import { Banner, BannerImage, BannerFallback } from "@appcat/bannergen";

<Banner>
  <BannerImage src="/header.jpg" />
  <BannerFallback name="alice" />
</Banner>
```

## Avatars

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | string | required | Input string to generate from |
| `variant` | string | `"auto"` | `"pixelGrid"` \| `"geometric"` \| `"rings"` \| `"auto"` |
| `size` | number | 128 | Size in pixels (square) |
| `rounded` | boolean | false | Render as circle |
| `colors` | string[] | — | Custom palette (3+ hex strings) |
| `className` / `style` | — | — | Standard styling props |

### Variants

| Variant | Description |
|---------|-------------|
| `pixelGrid` | Symmetric pixel grid identicon (GitHub-style) |
| `geometric` | 4-fold rotational symmetry shapes |
| `rings` | Concentric rings with dash patterns |
| `auto` | Deterministically picks from name (default) |

### Fallback Pattern

```tsx
import { Avatar, AvatarImage, AvatarFallback } from "@appcat/bannergen";

<Avatar size={64} rounded>
  <AvatarImage src="/profile.jpg" />
  <AvatarFallback name="alice" />
</Avatar>
```

## Album Covers

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | string | required | Input string to generate from (album name, artist, etc.) |
| `variant` | string | `"auto"` | `"fluidPaint"` \| `"tessellation"` \| `"noiseField"` \| `"nebula"` \| `"auto"` |
| `size` | number | 512 | Size in pixels (square) |
| `colors` | string[] | — | Custom palette (3+ hex strings) |
| `borderRadius` | number \| string | — | CSS border radius |
| `className` / `style` | — | — | Standard styling props |

### Variants

| Variant | Description |
|---------|-------------|
| `fluidPaint` | Abstract fluid blobs, organic shapes, paint-pour aesthetic |
| `tessellation` | Bold geometric mosaic, stained-glass subdivision |
| `noiseField` | Organic flow field texture, dense curved paths |
| `nebula` | Deep space nebula clouds, stars, cosmic atmosphere |
| `auto` | Deterministically picks from name (default) |

### Fallback Pattern

```tsx
import { AlbumArt, AlbumArtImage, AlbumArtFallback } from "@appcat/bannergen";

<AlbumArt size={256}>
  <AlbumArtImage src="/cover.jpg" />
  <AlbumArtFallback name="Midnight Sessions" />
</AlbumArt>
```

## Advanced: Direct SVG Generation

For non-React usage or server-side generation:

```ts
import {
  generateBannerSVG,
  generateAvatarSVG,
  generateAlbumCoverSVG,
} from "@appcat/bannergen";

const banner = generateBannerSVG({
  name: "alice",
  width: 1500,
  height: 500,
  variant: "aurora",
  colors: ["#ff6b6b", "#4ecdc4", "#45b7d1"],
});

const avatar = generateAvatarSVG({
  name: "alice",
  size: 128,
  variant: "pixelGrid",
  rounded: true,
});

const cover = generateAlbumCoverSVG({
  name: "Midnight Sessions",
  size: 512,
  variant: "nebula",
});
```

## Why bannergen?

- **0 dependencies** — no external assets, no API calls
- **Deterministic** — same input = same output, always
- **Offline** — works without network
- **Tiny** — pure SVG generation, no canvas
- **TypeScript** — fully typed
- **Accessible** — proper ARIA roles
- **11 pattern styles** — 4 banner, 3 avatar, 4 album cover variants
- **Customizable** — colors, dimensions, variants
- **Framework-agnostic core** — React components + vanilla generators

## Use Cases

Profile banners, header images, OG images, email headers, placeholder graphics, team directories, social media covers, album artwork, music platform placeholders, generative art, AI agent identities.

## License

MIT
