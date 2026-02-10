import { generateBannerSVG } from "./dist/index.mjs";
import { writeFileSync } from "fs";

const names = ["hello world", "bannergen", "soundlink", "aurora", "delta", "echo"];
const variants = ["gradient", "geometric", "topographic", "aurora"];

let html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Bannergen Preview</title>
<style>
  body { background: #111; color: #eee; font-family: system-ui, sans-serif; padding: 2rem; }
  h1 { text-align: center; margin-bottom: 2rem; }
  .section { margin-bottom: 3rem; }
  .section h2 { margin-bottom: 1rem; border-bottom: 1px solid #333; padding-bottom: 0.5rem; }
  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
  .card { background: #1a1a1a; border-radius: 12px; overflow: hidden; }
  .card .label { padding: 0.75rem 1rem; font-size: 0.85rem; color: #aaa; }
  .card svg { width: 100%; height: auto; display: block; }
</style></head><body>
<h1>Bannergen Preview</h1>`;

for (const name of names) {
  html += `<div class="section"><h2>"${name}"</h2><div class="grid">`;
  for (const variant of variants) {
    const svg = generateBannerSVG({ name, width: 1500, height: 500, variant });
    html += `<div class="card">${svg}<div class="label">${variant}</div></div>`;
  }
  html += `</div></div>`;
}

html += `</body></html>`;

writeFileSync("preview.html", html);
console.log("Written to preview.html");
