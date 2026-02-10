# bannergen

Deterministic profile banners from any string. Zero dependencies. Works with React, Next.js, Vite, Remix.

Same input → same banner. Always. No API calls, no storage, no randomness. Just beautiful, unique banners that work offline.

## Install

```bash
npm i bannergen
# or
pnpm add bannergen
# or
bun add bannergen
# or
yarn add bannergen
```

## Quick Start

### React Component

```tsx
import { Bannergen } from "bannergen";

<Bannergen name="alice" />
<Bannergen name="bob" variant="aurora" />
<Bannergen name="charlie" variant="geometric" />
```

### Next.js Image Route

```ts
// app/api/banner/route.ts
import { toBannergenHandler } from "bannergen/next";

export const { GET } = toBannergenHandler();
```

```html
<!-- use it anywhere you need a URL -->
<img src="/api/banner?name=alice" />

<!-- in emails, og images, etc. -->
<img src="https://yoursite.com/api/banner?name=alice&variant=aurora" />
```

### Vanilla JS / Node

```ts
import { generateBannerSVG, generateBannerDataURI } from "bannergen";

// Get raw SVG string
const svg = generateBannerSVG({ name: "alice" });

// Get data URI for <img> tags
const dataUri = generateBannerDataURI({ name: "alice" });
```

## Props

### `name` (required)

The string to generate the banner from. Same name = same banner, always.

```tsx
<Bannergen name="alice" />
<Bannergen name="bob@example.com" />
<Bannergen name="550e8400-e29b-41d4-a716-446655440000" />
```

### `variant`

Pattern style. `"auto"` (default) picks deterministically from the name.

```tsx
<Bannergen name="demo" variant="gradient" />     // flowing gradients + mesh
<Bannergen name="demo" variant="geometric" />     // triangles, hexagons, diamonds
<Bannergen name="demo" variant="topographic" />   // contour lines, elevation maps
<Bannergen name="demo" variant="aurora" />         // northern lights, glowing ribbons
```

### `width` / `height`

Banner dimensions in pixels (default: 1500×500).

```tsx
<Bannergen name="demo" width={1500} height={500} />  // Twitter/X
<Bannergen name="demo" width={1584} height={396} />  // LinkedIn
<Bannergen name="demo" width={820} height={312} />   // Facebook
<Bannergen name="demo" width={1280} height={480} />  // Discord
```

### `colors`

Custom color palette (array of 3+ hex strings).

```tsx
<Bannergen name="demo" colors={["#264653", "#2a9d8f", "#e9c46a"]} />
```

### `borderRadius`

```tsx
<Bannergen name="demo" borderRadius={12} />
<Bannergen name="demo" borderRadius="8px" />
```

### `className` / `style`

Standard styling props.

```tsx
<Bannergen name="demo" className="shadow-lg" style={{ maxWidth: 600 }} />
```

## Banner with Fallback

```tsx
import { Banner, BannerImage, BannerFallback } from "bannergen";

<Banner>
  <BannerImage src="/header.jpg" />
  <BannerFallback name="alice" />
</Banner>
```

## Pattern Variants

| Variant | Description |
|---------|-------------|
| `gradient` | Flowing gradient waves, mesh blobs, organic curves |
| `geometric` | Triangles, hexagons, diamonds, circles, bars |
| `topographic` | Contour lines, elevation maps, terrain-inspired |
| `aurora` | Northern lights ribbons, glowing particles, cosmic |
| `auto` | Deterministically picks from name (default) |

## Advanced: Direct SVG Generation

For non-React usage or server-side generation:

```ts
import { generateBannerSVG } from "bannergen";

const svg = generateBannerSVG({
  name: "alice",
  width: 1500,
  height: 500,
  variant: "aurora",
  colors: ["#ff6b6b", "#4ecdc4", "#45b7d1"],
});

// Write to file, embed in HTML, etc.
fs.writeFileSync("banner.svg", svg);
```

## Why bannergen?

- **0 dependencies** — no external assets, no API calls
- **Deterministic** — same input = same output, always
- **Offline** — works without network
- **Tiny** — pure SVG generation, no canvas
- **TypeScript** — fully typed
- **Accessible** — proper ARIA roles
- **4 pattern styles** — gradient, geometric, topographic, aurora
- **Customizable** — colors, dimensions, variants
- **Framework-agnostic core** — React component + vanilla `generateBannerSVG()`

## Use Cases

Profile banners, header images, OG images, email headers, placeholder graphics, team directories, social media covers, generative art, AI agent identities.

## License

MIT
