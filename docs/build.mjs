import { generateBannerSVG } from "../dist/index.mjs";
import { generateAvatarSVG } from "../dist/index.mjs";
import { readFileSync, writeFileSync, mkdirSync } from "fs";

const browserJS = readFileSync("dist/bannergen.browser.global.js", "utf-8");

const names = ["Matthew Peters", "maia", "hello world", "bannergen", "soundlink", "aurora", "delta", "echo"];
const bannerVariants = ["gradient", "geometric", "topographic", "aurora"];
const avatarVariants = ["pixelGrid", "geometric", "rings"];

let html = `<!DOCTYPE html>
<html lang="en"><head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>@appcat/bannergen — Deterministic Banners & Avatars</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0a; color: #e0e0e0; font-family: system-ui, -apple-system, sans-serif; line-height: 1.6; }

  .container { max-width: 1100px; margin: 0 auto; padding: 2rem 1.5rem; }

  /* Hero */
  .hero { text-align: center; padding: 3rem 0 2rem; }
  .hero h1 { font-size: 2.5rem; font-weight: 700; letter-spacing: -0.02em; }
  .hero h1 span { color: #888; font-weight: 400; }
  .hero p { color: #888; font-size: 1.1rem; margin: 0.75rem 0 1.5rem; max-width: 600px; margin-left: auto; margin-right: auto; }
  .badges { display: flex; gap: 0.5rem; justify-content: center; flex-wrap: wrap; margin-bottom: 1.5rem; }
  .badge { display: inline-block; padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.75rem; font-weight: 600; background: #1a1a1a; border: 1px solid #333; color: #aaa; }

  /* Install */
  .install { background: #141414; border: 1px solid #262626; border-radius: 8px; padding: 0.75rem 1.25rem; display: inline-block; font-family: "SF Mono", "Fira Code", monospace; font-size: 0.9rem; color: #4ade80; margin-bottom: 0.5rem; }
  .pre-release { font-size: 0.75rem; color: #666; margin-bottom: 2rem; }

  /* Try It */
  .tryit { background: #111; border: 1px solid #222; border-radius: 12px; padding: 1.5rem; margin-bottom: 3rem; }
  .tryit h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #222; }
  .tryit-controls { display: flex; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 1.25rem; align-items: center; }
  .tryit-controls input[type="text"] {
    flex: 1; min-width: 200px; padding: 0.6rem 0.9rem; border-radius: 6px;
    border: 1px solid #333; background: #1a1a1a; color: #e0e0e0;
    font-size: 1rem; font-family: inherit; outline: none;
  }
  .tryit-controls input[type="text"]:focus { border-color: #4ade80; }
  .tryit-controls select {
    padding: 0.6rem 0.75rem; border-radius: 6px; border: 1px solid #333;
    background: #1a1a1a; color: #e0e0e0; font-size: 0.85rem; font-family: inherit; outline: none;
  }
  .tryit-controls label { font-size: 0.85rem; color: #888; display: flex; align-items: center; gap: 0.35rem; cursor: pointer; }
  .tryit-controls input[type="checkbox"] { accent-color: #4ade80; }
  .tryit-banner { border-radius: 10px; overflow: hidden; margin-bottom: 1rem; border: 1px solid #222; }
  .tryit-banner svg { width: 100%; height: auto; display: block; }
  .tryit-avatars { display: flex; gap: 1rem; flex-wrap: wrap; }
  .tryit-avatar-item { text-align: center; }
  .tryit-avatar-item svg { display: block; }
  .tryit-avatar-item .label { font-size: 0.7rem; color: #555; margin-top: 0.3rem; }

  /* Sections */
  .section { margin-bottom: 3rem; }
  .section h2 { font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; padding-bottom: 0.5rem; border-bottom: 1px solid #222; }
  .section h3 { font-size: 1rem; color: #888; margin-bottom: 0.75rem; }

  /* Banner Grid */
  .banner-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 700px) { .banner-grid { grid-template-columns: 1fr; } }
  .banner-card { background: #141414; border-radius: 10px; overflow: hidden; border: 1px solid #222; }
  .banner-card svg { width: 100%; height: auto; display: block; }
  .banner-card .label { padding: 0.5rem 0.75rem; font-size: 0.8rem; color: #666; display: flex; justify-content: space-between; }

  /* Avatar Grid */
  .avatar-grid { display: flex; flex-wrap: wrap; gap: 1.25rem; }
  .avatar-item { text-align: center; }
  .avatar-item svg { display: block; border-radius: 4px; }
  .avatar-item.rounded svg { border-radius: 50%; }
  .avatar-item .label { font-size: 0.7rem; color: #666; margin-top: 0.35rem; }

  /* Code */
  .code-section { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
  @media (max-width: 700px) { .code-section { grid-template-columns: 1fr; } }
  .code-block { background: #141414; border: 1px solid #222; border-radius: 8px; overflow: hidden; }
  .code-block .code-title { padding: 0.5rem 0.75rem; background: #1a1a1a; font-size: 0.75rem; color: #666; border-bottom: 1px solid #222; font-family: monospace; }
  .code-block pre { padding: 0.75rem; font-size: 0.8rem; font-family: "SF Mono", "Fira Code", monospace; overflow-x: auto; color: #ccc; line-height: 1.5; }

  /* Props Table */
  .props-table { width: 100%; border-collapse: collapse; font-size: 0.85rem; }
  .props-table th { text-align: left; padding: 0.5rem; border-bottom: 2px solid #222; color: #888; font-weight: 600; }
  .props-table td { padding: 0.5rem; border-bottom: 1px solid #1a1a1a; }
  .props-table code { background: #1a1a1a; padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.8rem; color: #4ade80; }

  .footer { text-align: center; padding: 2rem 0; color: #444; font-size: 0.85rem; border-top: 1px solid #1a1a1a; margin-top: 2rem; }
</style>
</head><body>
<script>${browserJS}</script>
<div class="container">

<div class="hero">
  <h1>@appcat/<span>bannergen</span></h1>
  <p>Deterministic profile banners and identicon avatars from any string. Zero dependencies. Same input, same output. Always.</p>
  <div class="badges">
    <span class="badge">Zero Dependencies</span>
    <span class="badge">Deterministic</span>
    <span class="badge">SVG Output</span>
    <span class="badge">TypeScript</span>
    <span class="badge">React / Next.js / Vanilla</span>
  </div>
  <div class="install">npm install github:appcat-io/bannergen</div>
  <div class="pre-release">Pre-release &mdash; not yet published to npm</div>
</div>

<div class="tryit">
  <h2>Try It</h2>
  <div class="tryit-controls">
    <input type="text" id="tryit-name" placeholder="Type a name..." value="maia" />
    <select id="tryit-banner-variant">
      <option value="auto">Banner: auto</option>
      <option value="gradient">gradient</option>
      <option value="geometric">geometric</option>
      <option value="topographic">topographic</option>
      <option value="aurora">aurora</option>
    </select>
    <select id="tryit-avatar-variant">
      <option value="auto">Avatar: auto</option>
      <option value="pixelGrid">pixelGrid</option>
      <option value="geometric">geometric</option>
      <option value="rings">rings</option>
    </select>
    <label><input type="checkbox" id="tryit-rounded" /> Rounded</label>
  </div>
  <div class="tryit-banner" id="tryit-banner-preview"></div>
  <div class="tryit-avatars" id="tryit-avatar-preview"></div>
</div>

<script>
(function() {
  var nameInput = document.getElementById("tryit-name");
  var bannerVariant = document.getElementById("tryit-banner-variant");
  var avatarVariant = document.getElementById("tryit-avatar-variant");
  var roundedCheck = document.getElementById("tryit-rounded");
  var bannerPreview = document.getElementById("tryit-banner-preview");
  var avatarPreview = document.getElementById("tryit-avatar-preview");

  function update() {
    var name = nameInput.value || "default";
    var bv = bannerVariant.value;
    var av = avatarVariant.value;
    var rounded = roundedCheck.checked;

    bannerPreview.innerHTML = bannergen.generateBannerSVG({ name: name, width: 1500, height: 500, variant: bv });

    var sizes = [96, 80, 64, 48, 32];
    var html = "";
    for (var i = 0; i < sizes.length; i++) {
      var s = sizes[i];
      var svg = bannergen.generateAvatarSVG({ name: name, size: s, variant: av, rounded: rounded });
      var br = rounded ? "border-radius:50%;" : "border-radius:4px;";
      html += '<div class="tryit-avatar-item"><div style="' + br + 'overflow:hidden;width:' + s + 'px;height:' + s + 'px;">' + svg + '</div><div class="label">' + s + 'px</div></div>';
    }
    avatarPreview.innerHTML = html;
  }

  nameInput.addEventListener("input", update);
  bannerVariant.addEventListener("change", update);
  avatarVariant.addEventListener("change", update);
  roundedCheck.addEventListener("change", update);
  update();
})();
</script>`;

// Banner Gallery
html += `<div class="section"><h2>Banner Gallery</h2>`;
for (const name of names.slice(0, 4)) {
  html += `<h3>"${name}"</h3><div class="banner-grid">`;
  for (const variant of bannerVariants) {
    const svg = generateBannerSVG({ name, width: 1500, height: 500, variant });
    html += `<div class="banner-card">${svg}<div class="label"><span>${name}</span><span>${variant}</span></div></div>`;
  }
  html += `</div><br>`;
}
html += `</div>`;

// Avatar Gallery
html += `<div class="section"><h2>Avatar Gallery</h2>`;

html += `<h3>Square Avatars</h3><div class="avatar-grid">`;
for (const name of names) {
  for (const variant of avatarVariants) {
    const svg = generateAvatarSVG({ name, size: 80, variant, rounded: false });
    html += `<div class="avatar-item">${svg}<div class="label">${name}<br>${variant}</div></div>`;
  }
}
html += `</div><br>`;

html += `<h3>Rounded Avatars</h3><div class="avatar-grid">`;
for (const name of names) {
  const svg = generateAvatarSVG({ name, size: 80, variant: "auto", rounded: true });
  html += `<div class="avatar-item rounded">${svg}<div class="label">${name}</div></div>`;
}
html += `</div>`;
html += `</div>`;

// Code Examples
html += `<div class="section"><h2>Usage</h2><div class="code-section">
<div class="code-block">
  <div class="code-title">React Component</div>
  <pre>import { Bannergen, Identicon } from "@appcat/bannergen";

// Banner
&lt;Bannergen name="maia" /&gt;
&lt;Bannergen name="bob" variant="aurora" /&gt;

// Avatar
&lt;Identicon name="maia" size={64} /&gt;
&lt;Identicon name="bob" rounded /&gt;</pre>
</div>
<div class="code-block">
  <div class="code-title">Vanilla JS / Node.js</div>
  <pre>import {
  generateBannerSVG,
  generateAvatarSVG
} from "@appcat/bannergen";

const banner = generateBannerSVG({ name: "maia" });
const avatar = generateAvatarSVG({
  name: "maia",
  size: 128,
  rounded: true,
});</pre>
</div>
<div class="code-block">
  <div class="code-title">Next.js API Route</div>
  <pre>// app/api/banner/route.ts
import { toBannergenHandler } from "@appcat/bannergen/next";
export const { GET } = toBannergenHandler();

// app/api/avatar/route.ts
import { toIdenticonHandler } from "@appcat/bannergen/next";
export const { GET } = toIdenticonHandler();</pre>
</div>
<div class="code-block">
  <div class="code-title">Data URI (img tag)</div>
  <pre>import {
  generateBannerDataURI,
  generateAvatarDataURI
} from "@appcat/bannergen";

const src = generateBannerDataURI({ name: "maia" });
// &lt;img src={src} /&gt;

const avatarSrc = generateAvatarDataURI({
  name: "maia",
  rounded: true,
});</pre>
</div>
</div></div>`;

// Props Reference
html += `<div class="section"><h2>API Reference</h2>

<h3>BannerOptions / BannergenProps</h3>
<table class="props-table">
<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
<tr><td><code>name</code></td><td>string</td><td>required</td><td>Input string to generate from</td></tr>
<tr><td><code>width</code></td><td>number</td><td>1500</td><td>Width in pixels</td></tr>
<tr><td><code>height</code></td><td>number</td><td>500</td><td>Height in pixels</td></tr>
<tr><td><code>variant</code></td><td>string</td><td>"auto"</td><td>"gradient" | "geometric" | "topographic" | "aurora" | "auto"</td></tr>
<tr><td><code>colors</code></td><td>string[]</td><td>—</td><td>Custom palette (3+ hex strings)</td></tr>
</table><br>

<h3>AvatarOptions / IdenticonProps</h3>
<table class="props-table">
<tr><th>Prop</th><th>Type</th><th>Default</th><th>Description</th></tr>
<tr><td><code>name</code></td><td>string</td><td>required</td><td>Input string to generate from</td></tr>
<tr><td><code>size</code></td><td>number</td><td>128</td><td>Size in pixels (square)</td></tr>
<tr><td><code>variant</code></td><td>string</td><td>"auto"</td><td>"pixelGrid" | "geometric" | "rings" | "auto"</td></tr>
<tr><td><code>rounded</code></td><td>boolean</td><td>false</td><td>Render as circle</td></tr>
<tr><td><code>colors</code></td><td>string[]</td><td>—</td><td>Custom palette (3+ hex strings)</td></tr>
</table>

</div>`;

html += `<div class="footer">@appcat/bannergen &mdash; Created by Matthew Peters with Claude Opus 4.6 &mdash; MIT License &mdash; <a href="https://github.com/appcat-io/bannergen" style="color:#666">GitHub</a></div>
</div></body></html>`;

mkdirSync("docs/dist", { recursive: true });
writeFileSync("docs/dist/index.html", html);
console.log("Demo site written to docs/dist/index.html");
