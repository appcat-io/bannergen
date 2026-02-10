import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { hashString } from "../utils/hash";

describe("hashString", () => {
  it("returns deterministic results for the same input", () => {
    const a = hashString("alice");
    const b = hashString("alice");
    // Generate several values from each and compare
    const valsA = Array.from({ length: 10 }, () => a.rand());
    const valsB = Array.from({ length: 10 }, () => b.rand());
    assert.deepStrictEqual(valsA, valsB);
  });

  it("returns different results for different inputs", () => {
    const a = hashString("alice");
    const b = hashString("bob");
    const valA = a.rand();
    const valB = b.rand();
    assert.notEqual(valA, valB);
  });

  it("rand() returns values in [0, 1)", () => {
    const h = hashString("test-distribution");
    for (let i = 0; i < 100; i++) {
      const v = h.rand();
      assert.ok(v >= 0 && v < 1, `rand() returned ${v}`);
    }
  });

  it("float(min, max) returns values in range", () => {
    const h = hashString("float-range");
    for (let i = 0; i < 50; i++) {
      const v = h.float(10, 20);
      assert.ok(v >= 10 && v < 20, `float(10,20) returned ${v}`);
    }
  });

  it("int(min, max) returns integers in range", () => {
    const h = hashString("int-range");
    for (let i = 0; i < 50; i++) {
      const v = h.int(1, 5);
      assert.ok(v >= 1 && v <= 5, `int(1,5) returned ${v}`);
      assert.strictEqual(v, Math.floor(v), "int() should return integers");
    }
  });

  it("pick() returns an element from the array", () => {
    const h = hashString("pick-test");
    const arr = ["a", "b", "c"];
    for (let i = 0; i < 20; i++) {
      const v = h.pick(arr);
      assert.ok(arr.includes(v), `pick() returned ${v} not in array`);
    }
  });

  it("floats(n) returns n values", () => {
    const h = hashString("floats-count");
    const vals = h.floats(7);
    assert.strictEqual(vals.length, 7);
    for (const v of vals) {
      assert.ok(v >= 0 && v < 1);
    }
  });

  it("seeds are 4 unsigned 32-bit integers", () => {
    const h = hashString("seeds-test");
    assert.strictEqual(h.seeds.length, 4);
    for (const s of h.seeds) {
      assert.ok(s >= 0 && s <= 0xffffffff);
    }
  });
});
