import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateBannerSVG, generateBannerDataURI } from "../generator";

describe("generateBannerSVG", () => {
  it("returns a valid SVG string", () => {
    const svg = generateBannerSVG({ name: "test" });
    assert.ok(svg.startsWith("<svg"));
    assert.ok(svg.endsWith("</svg>"));
    assert.ok(svg.includes('xmlns="http://www.w3.org/2000/svg"'));
  });

  it("is deterministic", () => {
    const a = generateBannerSVG({ name: "alice" });
    const b = generateBannerSVG({ name: "alice" });
    assert.strictEqual(a, b);
  });

  it("produces different output for different names", () => {
    const a = generateBannerSVG({ name: "alice" });
    const b = generateBannerSVG({ name: "bob" });
    assert.notStrictEqual(a, b);
  });

  it("respects custom dimensions", () => {
    const svg = generateBannerSVG({ name: "test", width: 800, height: 200 });
    assert.ok(svg.includes('width="800"'));
    assert.ok(svg.includes('height="200"'));
    assert.ok(svg.includes('viewBox="0 0 800 200"'));
  });

  it("works with all explicit variants", () => {
    const variants = ["gradient", "geometric", "topographic", "aurora"] as const;
    for (const variant of variants) {
      const svg = generateBannerSVG({ name: "test", variant });
      assert.ok(svg.startsWith("<svg"), `Variant ${variant} failed`);
    }
  });

  it("works with custom colors", () => {
    const svg = generateBannerSVG({
      name: "test",
      colors: ["#ff0000", "#00ff00", "#0000ff"],
    });
    assert.ok(svg.startsWith("<svg"));
  });
});

describe("generateBannerDataURI", () => {
  it("returns a valid data URI", () => {
    const uri = generateBannerDataURI({ name: "test" });
    assert.ok(uri.startsWith("data:image/svg+xml;charset=utf-8,"));
  });
});
