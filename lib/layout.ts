// Холбоосын геометр (SVG зам) ба автомат байрлуулалт.

import type { FamilyTree, Person, Point } from "./types";
import { PERSON_CARD } from "./types";
import { listPersons } from "./tree";

const { width: W, height: H } = PERSON_CARD;

function centerX(p: Person): number {
  return p.position.x + W / 2;
}
function bottomY(p: Person): number {
  return p.position.y + H;
}
function topY(p: Person): number {
  return p.position.y;
}

export type ConnectorKind = "spouse" | "parent";

export interface Connector {
  readonly key: string;
  readonly kind: ConnectorKind;
  readonly path: string; // SVG path d
  readonly mid: Point; // зүрх/чимэглэл тавих цэг
}

/** Гэр бүлийн (хосын) хэвтээ холбоос. */
function spouseConnectors(persons: Person[]): Connector[] {
  const seen = new Set<string>();
  const out: Connector[] = [];
  for (const p of persons) {
    for (const sid of p.spouseIds) {
      const key = [p.id, sid].sort().join("~");
      if (seen.has(key)) continue;
      seen.add(key);
      const other = persons.find((x) => x.id === sid);
      if (!other) continue;
      const [left, right] = centerX(p) <= centerX(other) ? [p, other] : [other, p];
      const y = left.position.y + H / 2;
      const sx = left.position.x + W;
      const ex = right.position.x;
      const my = right.position.y + H / 2;
      out.push({
        key: `s_${key}`,
        kind: "spouse",
        path: `M ${sx} ${y} L ${ex} ${my}`,
        mid: { x: (sx + ex) / 2, y: (y + my) / 2 },
      });
    }
  }
  return out;
}

/** Эцэг эх → хүүхэд босоо тахир (elbow) холбоос. */
function parentConnectors(persons: Person[], byId: Map<string, Person>): Connector[] {
  const out: Connector[] = [];
  for (const child of persons) {
    if (child.parentIds.length === 0) continue;
    const parents = child.parentIds.map((id) => byId.get(id)).filter((x): x is Person => !!x);
    if (parents.length === 0) continue;

    const anchorX = parents.reduce((s, p) => s + centerX(p), 0) / parents.length;
    const anchorY = Math.max(...parents.map(bottomY));
    const cx = centerX(child);
    const cy = topY(child);
    const midY = anchorY + Math.max(24, (cy - anchorY) / 2);

    out.push({
      key: `p_${child.id}`,
      kind: "parent",
      path: `M ${anchorX} ${anchorY} V ${midY} H ${cx} V ${cy}`,
      mid: { x: cx, y: midY },
    });
  }
  return out;
}

export function buildConnectors(tree: FamilyTree): Connector[] {
  const persons = listPersons(tree);
  const byId = new Map(persons.map((p) => [p.id, p]));
  return [...parentConnectors(persons, byId), ...spouseConnectors(persons)];
}

/** Канвасын зурагдах бүтэн хэмжээ (scroll/scale-д). */
export function treeBounds(tree: FamilyTree): { width: number; height: number } {
  const persons = listPersons(tree);
  if (persons.length === 0) return { width: 1200, height: 700 };
  const maxX = Math.max(...persons.map((p) => p.position.x + W));
  const maxY = Math.max(...persons.map((p) => p.position.y + H));
  return { width: maxX + 160, height: maxY + 160 };
}

/** Эцэг эхийн гүн (үе) тооцох. Эцэг эхгүй нь 0-р үе. */
export function computeGenerations(tree: FamilyTree): Map<string, number> {
  const gen = new Map<string, number>();
  const persons = listPersons(tree);
  const visiting = new Set<string>();

  function depth(id: string): number {
    if (gen.has(id)) return gen.get(id)!;
    if (visiting.has(id)) return 0; // мөчлөг хамгаалалт
    visiting.add(id);
    const p = tree.persons[id];
    const d = !p || p.parentIds.length === 0 ? 0 : 1 + Math.max(...p.parentIds.map(depth));
    visiting.delete(id);
    gen.set(id, d);
    return d;
  }

  for (const p of persons) depth(p.id);
  return gen;
}

// Цэгцтэй модны автомат байрлуулалт — тусдаа модульд.
export { autoArrange } from "./autoArrange";
