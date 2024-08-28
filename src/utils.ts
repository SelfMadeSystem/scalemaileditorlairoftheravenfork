// TODO: Temp while I convert the rest to dom manipulation
export function stringToElements(html: string) {
  const template = document.createElement("template");
  html = html.trim(); // Never return a text node of whitespace as the result
  template.innerHTML = html;
  return template.content.childNodes;
}

function sq(x: number) {
  return x * x;
}

type Pos = { x: number; y: number };

/**
 * Finds the centers of two circles given a radius and two points.
 * @param r - The radius of the circles.
 * @param p1 - The first point.
 * @param p2 - The second point.
 * @returns An array containing the coordinates of the two circle centers, or null if no circle is possible.
 */
function findCenters(r: number, p1: Pos, p2: Pos) {
  // pm is middle point of (p1, p2)
  const pm = { x: 0.5 * (p1.x + p2.x), y: 0.5 * (p1.y + p2.y) };
  // compute leading vector of the perpendicular to p1 p2 == C1C2 line
  let perpABdx = -(p2.y - p1.y);
  let perpABdy = p2.x - p1.x;
  // normalize vector
  const norm = Math.sqrt(sq(perpABdx) + sq(perpABdy));
  perpABdx /= norm;
  perpABdy /= norm;
  // compute distance from pm to p1
  const dpmp1 = Math.sqrt(sq(pm.x - p1.x) + sq(pm.y - p1.y));
  // sin of the angle between { circle center,  middle , p1 }
  const sin = dpmp1 / r;
  // is such a circle possible ?
  if (sin < -1 || sin > 1) return null; // no, return null
  // yes, compute the two centers
  const cos = Math.sqrt(1 - sq(sin)); // build cos out of sin
  const d = r * cos;
  const res1 = { x: pm.x + perpABdx * d, y: pm.y + perpABdy * d };
  const res2 = { x: pm.x - perpABdx * d, y: pm.y - perpABdy * d };
  return [res1, res2];
}

/**
 * Paths an arc from p1 to p2 with radius r in a similar way that svg does it.
 *
 * Note: does not ctx.beginPath(), ctx.stroke(), etc. as it's made to behave
 *   like ctx.arc or similar methods
 */
export function arcBetween(
  ctx: CanvasRenderingContext2D,
  r: number,
  p1x: number,
  p1y: number,
  p2x: number,
  p2y: number,
  clockwise = false
) {
  const p1 = { x: p1x, y: p1y };
  const p2 = { x: p2x, y: p2y };
  const distSq = sq(p1.x - p2.x) + sq(p1.y - p2.y);
  if (distSq < sq(r)) {
    r = Math.sqrt(distSq);
  }

  const [c1, _] = findCenters(r, p1, p2)!;

  const ang1 = Math.atan2(p1.y - c1.y, p1.x - c1.x);
  const ang2 = Math.atan2(p2.y - c1.y, p2.x - c1.x);

  ctx.arc(c1.x, c1.y, r, ang1, ang2, clockwise);
}
