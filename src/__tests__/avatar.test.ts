import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { generateAvatarSVG, generateAvatarDataURI } from "../avatar";

describe("generateAvatarSVG", () => {
  it("returns a valid SVG string", () => {
    const svg = generateAvatarSVG({ name: "test" });
    assert.ok(svg.startsWith("<svg"));
    assert.ok(svg.endsWith("</svg>"));
    assert.ok(svg.includes('xmlns="http://www.w3.org/2000/svg"'));
  });

  it("is deterministic", () => {
    const a = generateAvatarSVG({ name: "alice" });
    const b = generateAvatarSVG({ name: "alice" });
    assert.strictEqual(a, b);
  });

  it("produces different output for different names", () => {
    const a = generateAvatarSVG({ name: "alice" });
    const b = generateAvatarSVG({ name: "bob" });
    assert.notStrictEqual(a, b);
  });

  it("respects custom size", () => {
    const svg = generateAvatarSVG({ name: "test", size: 256 });
    assert.ok(svg.includes('width="256"'));
    assert.ok(svg.includes('height="256"'));
    assert.ok(svg.includes('viewBox="0 0 256 256"'));
  });

  it("defaults to 128px square", () => {
    const svg = generateAvatarSVG({ name: "test" });
    assert.ok(svg.includes('width="128"'));
    assert.ok(svg.includes('height="128"'));
  });

  it("works with all explicit variants", () => {
    const variants = ["pixelGrid", "geometric", "rings"] as const;
    for (const variant of variants) {
      const svg = generateAvatarSVG({ name: "test", variant });
      assert.ok(svg.startsWith("<svg"), `Variant ${variant} failed`);
    }
  });

  it("adds clip-path when rounded is true", () => {
    const svg = generateAvatarSVG({ name: "test", rounded: true });
    assert.ok(svg.includes("clipPath"));
    assert.ok(svg.includes("avatar-clip"));
    assert.ok(svg.includes("<circle"));
  });

  it("does not add clip-path when rounded is false", () => {
    const svg = generateAvatarSVG({ name: "test", rounded: false });
    assert.ok(!svg.includes("avatar-clip"));
  });

  it("works with custom colors", () => {
    const svg = generateAvatarSVG({
      name: "test",
      colors: ["#ff0000", "#00ff00", "#0000ff"],
    });
    assert.ok(svg.startsWith("<svg"));
  });
});

describe("generateAvatarDataURI", () => {
  it("returns a valid data URI", () => {
    const uri = generateAvatarDataURI({ name: "test" });
    assert.ok(uri.startsWith("data:image/svg+xml;charset=utf-8,"));
  });
});
