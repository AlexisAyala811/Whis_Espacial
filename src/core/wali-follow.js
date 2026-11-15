// Choose a place ahead and slightly to the side, keeping clear of the centre reticle.
export function waliTarget(position, yaw, blocked = () => false, phase = 0) {
  const fx = -Math.sin(yaw), fz = -Math.cos(yaw), rx = Math.cos(yaw), rz = -Math.sin(yaw);
  for (const distance of [1.8 + Math.sin(phase * .35) * .55, 1.35, .95, .6]) {
    for (const side of [.65 + Math.sin(phase * .55) * .75, -.65, .25, -.25, 0]) {
      const x = position.x + fx * distance + rx * side;
      const z = position.z + fz * distance + rz * side;
      if (!blocked(x, z)) return { x, z };
    }
  }
  return null;
}

// Most of the time Wali faces its path; occasionally it checks on the player.
export function waliLooksAtPlayer(seconds, interacting = false) {
  return interacting || (seconds % 16 >= 12 && seconds % 16 < 13.5);
}
