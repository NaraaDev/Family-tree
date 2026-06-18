// Удам угсааны "цэгцтэй мод" (tidy tree) байрлуулалт.
//  • Үе бүр нэг мөрөнд
//  • Хүүхдүүд эцэг эхийнхээ ЯГ ДОР, төвд нь
//  • Ах дүүс зэрэгцэн бүлэглэгдэнэ, дэд мод хооронд давхцахгүй
//  • Гэрлэсэн хосыг зэрэгцүүлнэ (гэр бүлд "орж ирсэн" ханийг хажууд нь)

import type { FamilyTree, Person, Point } from "./types";
import { PERSON_CARD } from "./types";
import { listPersons } from "./tree";

const W = PERSON_CARD.width;
const SPOUSE_GAP = 36; // хосын хоёр картын зай
const SIB_GAP = 44; // ах дүүсийн зай
const ROOT_GAP = 96; // тусдаа язгуур моднуудын зай
const ROW = 264; // үеийн босоо зай (өндөр хөрөгт картад тохируулсан)
const TOP = 48;
const LEFT = 48;

function hasParents(tree: FamilyTree, p: Person): boolean {
  return p.parentIds.some((id) => !!tree.persons[id]);
}

function byBirth(tree: FamilyTree) {
  return (aId: string, bId: string) => {
    const a = tree.persons[aId];
    const b = tree.persons[bId];
    const ay = Number(a?.birthYear) || a?.position.x || 0;
    const by = Number(b?.birthYear) || b?.position.x || 0;
    return ay - by;
  };
}

interface Plan {
  /** owner → түүнд хавсаргасан (гэрт орж ирсэн) хань */
  readonly attachedOf: Map<string, string>;
  readonly attachedSet: Set<string>;
  /** эцэг (owner) → хүүхдүүд */
  readonly childrenOf: Map<string, string[]>;
  readonly roots: string[];
}

/** Хэн хэнийг хаана байрлуулахыг урьдчилан тооцох (давхар байрлуулахаас сэргийлнэ). */
function plan(tree: FamilyTree): Plan {
  const people = listPersons(tree).sort(byBirth(tree) as never);
  const ids = people.map((p) => p.id);
  const attachedOf = new Map<string, string>();
  const attachedSet = new Set<string>();

  // 1) Эцэг эхгүй (гэрт орж ирсэн) ханийг эцэг эхтэй түнш рүү хавсаргана.
  for (const id of ids) {
    if (attachedSet.has(id) || attachedOf.has(id)) continue;
    const p = tree.persons[id];
    for (const sid of p.spouseIds) {
      const s = tree.persons[sid];
      if (!s || attachedSet.has(sid)) continue;
      if (!hasParents(tree, s)) {
        attachedOf.set(id, sid);
        attachedSet.add(sid);
        break;
      }
    }
  }

  // 2) Хүүхэд бүрийг НЭГ эцэг (owner) дор байрлуулна.
  const childrenOf = new Map<string, string[]>();
  for (const p of people) {
    if (p.parentIds.length === 0) continue;
    const present = p.parentIds.filter((id) => !!tree.persons[id]);
    if (present.length === 0) continue;
    const primary = present.find((id) => !attachedSet.has(id)) ?? present[0];
    const arr = childrenOf.get(primary) ?? [];
    arr.push(p.id);
    childrenOf.set(primary, arr);
  }
  for (const arr of childrenOf.values()) arr.sort(byBirth(tree));

  // 3) Язгуур: эцэг эхгүй бөгөөд хань болж хавсрагдаагүй хүмүүс.
  const roots = ids.filter((id) => !hasParents(tree, tree.persons[id]) && !attachedSet.has(id));

  return { attachedOf, attachedSet, childrenOf, roots };
}

export function autoArrange(tree: FamilyTree): Record<string, Point> {
  const { attachedOf, childrenOf, roots } = plan(tree);
  const memoW = new Map<string, number>();
  const computing = new Set<string>();

  const coupleWidth = (id: string) => (attachedOf.has(id) ? W * 2 + SPOUSE_GAP : W);

  function widthOf(id: string): number {
    const cached = memoW.get(id);
    if (cached !== undefined) return cached;
    if (computing.has(id)) return coupleWidth(id); // мөчлөг хамгаалалт
    computing.add(id);

    const cw = coupleWidth(id);
    const kids = childrenOf.get(id) ?? [];
    let w = cw;
    if (kids.length > 0) {
      const childrenW = kids.reduce((s, k) => s + widthOf(k), 0) + (kids.length - 1) * SIB_GAP;
      w = Math.max(cw, childrenW);
    }
    computing.delete(id);
    memoW.set(id, w);
    return w;
  }

  const positions: Record<string, Point> = {};
  const visited = new Set<string>();

  function assign(id: string, leftX: number, depth: number) {
    if (visited.has(id)) return;
    visited.add(id);

    const w = widthOf(id);
    const cw = coupleWidth(id);
    const kids = (childrenOf.get(id) ?? []).filter((k) => !visited.has(k));
    const y = TOP + depth * ROW;

    let coupleLeft: number;
    if (kids.length === 0) {
      coupleLeft = leftX + (w - cw) / 2;
    } else {
      const childrenW = kids.reduce((s, k) => s + widthOf(k), 0) + (kids.length - 1) * SIB_GAP;
      let cx = leftX + (w - childrenW) / 2;
      const centers: number[] = [];
      for (const k of kids) {
        const kw = widthOf(k);
        assign(k, cx, depth + 1);
        centers.push(cx + kw / 2);
        cx += kw + SIB_GAP;
      }
      const center = (centers[0] + centers[centers.length - 1]) / 2;
      coupleLeft = Math.min(Math.max(center - cw / 2, leftX), leftX + w - cw);
    }

    positions[id] = { x: Math.round(coupleLeft), y };
    const spouseId = attachedOf.get(id);
    if (spouseId) {
      positions[spouseId] = { x: Math.round(coupleLeft + W + SPOUSE_GAP), y };
      visited.add(spouseId);
    }
  }

  // Язгуур моднуудыг зүүнээс баруун тийш
  let cursor = LEFT;
  for (const root of roots) {
    assign(root, cursor, 0);
    cursor += widthOf(root) + ROOT_GAP;
  }
  // Аль ч модонд хүрээгүй үлдсэн хүмүүс (тусгаарлагдсан) — нэмж байрлуулна
  for (const p of listPersons(tree)) {
    if (visited.has(p.id)) continue;
    assign(p.id, cursor, 0);
    cursor += widthOf(p.id) + ROOT_GAP;
  }

  return positions;
}
