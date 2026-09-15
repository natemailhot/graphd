// Nudges overlapping points apart in SVG pixel space so circles never
// fully overlap, while keeping them as close as possible to their true
// data position. Pure iterative pairwise repulsion — fine for the small
// number of points (group members) this renders.
export function resolveOverlaps<T extends { x: number; y: number }>(
  points: T[],
  minDist: number,
  bounds: { left: number; right: number; top: number; bottom: number },
  iterations = 60
): T[] {
  const pts = points.map(p => ({ ...p }))

  for (let iter = 0; iter < iterations; iter++) {
    let moved = false
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[j].x - pts[i].x
        const dy = pts[j].y - pts[i].y
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01
        if (dist < minDist) {
          moved = true
          const overlap = (minDist - dist) / 2
          const ux = dx / dist
          const uy = dy / dist
          pts[i].x -= ux * overlap
          pts[i].y -= uy * overlap
          pts[j].x += ux * overlap
          pts[j].y += uy * overlap
        }
      }
    }
    if (!moved) break
  }

  for (const p of pts) {
    p.x = Math.min(bounds.right, Math.max(bounds.left, p.x))
    p.y = Math.min(bounds.bottom, Math.max(bounds.top, p.y))
  }

  return pts
}
