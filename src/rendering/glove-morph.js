// Derive a modest fingertip bend for a static textured glove mesh.
// A position attribute in glove-local space supplies x/y/z accessors.
export function createGloveCurl(position) {
  const curled = new Float32Array(position.count * 3);
  for (let i = 0; i < position.count; i++) {
    const x = position.getX(i), y = position.getY(i), z = position.getZ(i);
    const t = Math.max(0, Math.min(1, (-z - .06) / .16));
    const weight = t * t * (3 - 2 * t);
    const angle = -.48 * weight, c = Math.cos(angle), sn = Math.sin(angle);
    const relativeZ = z + .06;
    curled[i * 3] = x;
    curled[i * 3 + 1] = y * c - relativeZ * sn;
    curled[i * 3 + 2] = y * sn + relativeZ * c - .06;
  }
  return curled;
}
