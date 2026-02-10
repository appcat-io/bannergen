import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hashString } from "../utils/hash";
import { generatePalette, hslToString, hslToHex } from "../utils/colors";

describe("generatePalette", () => {
  it("returns a valid palette with all required fields", () => {
    const h = hashString("palette-test");
    const p = generatePalette(h);
    assert.ok(p.primary);
    assert.ok(p.secondary);
    assert.ok(p.accent);
    assert.ok(p.background);
    assert.ok(p.highlight);
    assert.ok(p.strategy);
  });

  it("produces HSL values in valid ranges", () => {
    const names = ["alice", "bob", "charlie", "delta", "echo"];
    for (const name of names) {
      const h = hashString(name);
      const p = generatePalette(h);
      for (const key of ["primary", "secondary", "accent", "background", "highlight"] as const) {
        const c = p[key];
        assert.ok(c.h >= 0 && c.h <= 360, `${name}.${key}.h = ${c.h}`);
        assert.ok(c.s >= 0 && c.s <= 100, `${name}.${key}.s = ${c.s}`);
        assert.ok(c.l >= 0 && c.l <= 100, `${name}.${key}.l = ${c.l}`);
      }
    }
  });

  it("uses custom colors when provided", () => {
    const h = hashString("custom");
    const p = generatePalette(h, ["#ff0000", "#00ff00", "#0000ff"]);
    // Primary should be derived from #ff0000
    assert.ok(p.primary.h >= 350 || p.primary.h <= 10); // red hue
  });

  it("is deterministic", () => {
    const a = generatePalette(hashString("same"));
    const b = generatePalette(hashString("same"));
    assert.deepStrictEqual(a, b);
  });
});

describe("hslToString", () => {
  it("formats HSL correctly", () => {
    const result = hslToString({ h: 180, s: 50, l: 60 });
    assert.strictEqual(result, "hsl(180,50%,60%)");
  });

  it("formats HSLA with alpha", () => {
    const result = hslToString({ h: 180, s: 50, l: 60 }, 0.5);
    assert.strictEqual(result, "hsla(180,50%,60%,0.5)");
  });
});

describe("hslToHex", () => {
  it("converts pure red", () => {
    const hex = hslToHex({ h: 0, s: 100, l: 50 });
    assert.strictEqual(hex, "#ff0000");
  });

  it("converts white", () => {
    const hex = hslToHex({ h: 0, s: 0, l: 100 });
    assert.strictEqual(hex, "#ffffff");
  });

  it("converts black", () => {
    const hex = hslToHex({ h: 0, s: 0, l: 0 });
    assert.strictEqual(hex, "#000000");
  });
});
