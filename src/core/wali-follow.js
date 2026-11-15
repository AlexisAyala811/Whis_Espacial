// Choose a place ahead and slightly to the side, keeping clear of the centre reticle.
export function waliTarget(position, yaw, blocked = () => false) {
  const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
  for (const distance of [1.8, 1.35, .95, .6]) {
    for (const side of [.65, -.65, .25, -.25, 0]) {
      const x = position.x + fx * distance + rx * side;
      const z = position.z + fz * distance + rz * side;
      if (!blocked(x, z)) return { x, z };
    }
  }
  return null;
}
