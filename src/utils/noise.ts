/**
 * Creates a 2D value noise function seeded by the given parameters.
 * Used by topographic and noise-field patterns.
 */
export function createNoise2D(
  noiseScale: number,
  octaves: number,
  seedX: number,
  seedY: number
): (x: number, y: number) => number {
  function pseudoRand(x: number, y: number): number {
    const n = Math.sin(x * 127.1 + y * 311.7 + seedX * 0.01) * 43758.5453;
    return n - Math.floor(n);
  }

  return function noise2D(x: number, y: number): number {
    let val = 0;
    let amp = 1;
    let freq = 1;
    let maxAmp = 0;
    for (let o = 0; o < octaves; o++) {
      const nx = (x * noiseScale * freq + seedX) * 1.17;
      const ny = (y * noiseScale * freq + seedY) * 1.17;
      const ix = Math.floor(nx);
      const iy = Math.floor(ny);
      const fx = nx - ix;
      const fy = ny - iy;
      const smooth = (t: number) => t * t * (3 - 2 * t);
      const sfx = smooth(fx);
      const sfy = smooth(fy);
      const n00 = pseudoRand(ix, iy);
      const n10 = pseudoRand(ix + 1, iy);
      const n01 = pseudoRand(ix, iy + 1);
      const n11 = pseudoRand(ix + 1, iy + 1);
      const nx0 = n00 + (n10 - n00) * sfx;
      const nx1 = n01 + (n11 - n01) * sfx;
      val += (nx0 + (nx1 - nx0) * sfy) * amp;
      maxAmp += amp;
      amp *= 0.5;
      freq *= 2;
    }
    return val / maxAmp;
  };
}
