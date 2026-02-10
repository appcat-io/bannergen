import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateAlbumCoverSVG, generateAlbumCoverDataURI } from "../albumcover";

describe("generateAlbumCoverSVG", () => {
  it("returns a valid SVG string", () => {
    const svg = generateAlbumCoverSVG({ name: "test" });
    assert.ok(svg.startsWith("<svg"));
    assert.ok(svg.endsWith("</svg>"));
    assert.ok(svg.includes('xmlns="http://www.w3.org/2000/svg"'));
  });

  it("is deterministic", () => {
    const a = generateAlbumCoverSVG({ name: "alice" });
    const b = generateAlbumCoverSVG({ name: "alice" });
    assert.strictEqual(a, b);
  });

  it("produces different output for different names", () => {
    const a = generateAlbumCoverSVG({ name: "alice" });
    const b = generateAlbumCoverSVG({ name: "bob" });
    assert.notStrictEqual(a, b);
  });

  it("respects custom size", () => {
    const svg = generateAlbumCoverSVG({ name: "test", size: 256 });
    assert.ok(svg.includes('width="256"'));
    assert.ok(svg.includes('height="256"'));
    assert.ok(svg.includes('viewBox="0 0 256 256"'));
  });

  it("defaults to 512px square", () => {
    const svg = generateAlbumCoverSVG({ name: "test" });
    assert.ok(svg.includes('width="512"'));
    assert.ok(svg.includes('height="512"'));
  });

  it("works with all explicit variants", () => {
    const variants = ["fluidPaint", "tessellation", "noiseField", "nebula"] as const;
    for (const variant of variants) {
      const svg = generateAlbumCoverSVG({ name: "test", variant });
      assert.ok(svg.startsWith("<svg"), `Variant ${variant} failed`);
    }
  });

  it("works with custom colors", () => {
    const svg = generateAlbumCoverSVG({
      name: "test",
      colors: ["#ff0000", "#00ff00", "#0000ff"],
    });
    assert.ok(svg.startsWith("<svg"));
  });
});

describe("generateAlbumCoverDataURI", () => {
  it("returns a valid data URI", () => {
    const uri = generateAlbumCoverDataURI({ name: "test" });
    assert.ok(uri.startsWith("data:image/svg+xml;charset=utf-8,"));
  });
});
