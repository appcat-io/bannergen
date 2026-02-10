import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { toBannergenHandler, toIdenticonHandler, toAlbumCoverHandler } from "../next";

describe("toBannergenHandler", () => {
  it("returns a GET handler", () => {
    const { GET } = toBannergenHandler();
    assert.strictEqual(typeof GET, "function");
  });

  it("returns SVG response with correct headers", async () => {
    const { GET } = toBannergenHandler();
    const request = new Request("http://localhost/api/banner?name=alice");
    const response = await GET(request);

    assert.strictEqual(response.headers.get("Content-Type"), "image/svg+xml");
    assert.ok(response.headers.get("Cache-Control")?.includes("max-age=31536000"));

    const body = await response.text();
    assert.ok(body.startsWith("<svg"));
  });

  it("respects query parameters", async () => {
    const { GET } = toBannergenHandler();
    const request = new Request(
      "http://localhost/api/banner?name=bob&width=800&height=200&variant=geometric"
    );
    const response = await GET(request);
    const body = await response.text();
    assert.ok(body.includes('width="800"'));
    assert.ok(body.includes('height="200"'));
  });
});

describe("toIdenticonHandler", () => {
  it("returns a GET handler", () => {
    const { GET } = toIdenticonHandler();
    assert.strictEqual(typeof GET, "function");
  });

  it("returns SVG response with correct headers", async () => {
    const { GET } = toIdenticonHandler();
    const request = new Request("http://localhost/api/avatar?name=alice");
    const response = await GET(request);

    assert.strictEqual(response.headers.get("Content-Type"), "image/svg+xml");
    assert.ok(response.headers.get("Cache-Control")?.includes("max-age=31536000"));

    const body = await response.text();
    assert.ok(body.startsWith("<svg"));
  });

  it("respects query parameters", async () => {
    const { GET } = toIdenticonHandler();
    const request = new Request(
      "http://localhost/api/avatar?name=bob&size=256&variant=pixelGrid&rounded=true"
    );
    const response = await GET(request);
    const body = await response.text();
    assert.ok(body.includes('width="256"'));
    assert.ok(body.includes("clipPath"));
  });
});

describe("toAlbumCoverHandler", () => {
  it("returns a GET handler", () => {
    const { GET } = toAlbumCoverHandler();
    assert.strictEqual(typeof GET, "function");
  });

  it("returns SVG response with correct headers", async () => {
    const { GET } = toAlbumCoverHandler();
    const request = new Request("http://localhost/api/albumcover?name=alice");
    const response = await GET(request);

    assert.strictEqual(response.headers.get("Content-Type"), "image/svg+xml");
    assert.ok(response.headers.get("Cache-Control")?.includes("max-age=31536000"));

    const body = await response.text();
    assert.ok(body.startsWith("<svg"));
  });

  it("respects query parameters", async () => {
    const { GET } = toAlbumCoverHandler();
    const request = new Request(
      "http://localhost/api/albumcover?name=bob&size=256&variant=nebula"
    );
    const response = await GET(request);
    const body = await response.text();
    assert.ok(body.includes('width="256"'));
    assert.ok(body.includes('height="256"'));
  });
});
