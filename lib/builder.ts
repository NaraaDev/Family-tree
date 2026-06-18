// Дээд түвшний "хурдан барих" үйлдлүүд — хүн нэмэхдээ шууд холбоно.
// Бүгд цэвэр функц: { tree, id } буцаана.

import type { FamilyTree, Person } from "./types";
import { PERSON_CARD } from "./types";
import { addPerson, getPerson, linkParent, linkSpouse, listPersons } from "./tree";

const GAP_X = PERSON_CARD.width + 44;
const GAP_Y = PERSON_CARD.height + 110;

/** Тухайн байрлал чөлөөтэй болтол баруун тийш зөөнө (давхцлаас сэргийлнэ). */
function freeSpot(tree: FamilyTree, x: number, y: number): { x: number; y: number } {
  const people = listPersons(tree);
  let nx = x;
  const tooClose = () =>
    people.some((p) => Math.abs(p.position.x - nx) < PERSON_CARD.width && Math.abs(p.position.y - y) < 40);
  let guard = 0;
  while (tooClose() && guard < 40) {
    nx += GAP_X;
    guard += 1;
  }
  return { x: nx, y };
}

const oppositeGender = (g: Person["gender"]): Person["gender"] => (g === "male" ? "female" : "male");

/** Гэр бүл (хань) нэмэх — хажууд байрлуулж хосоор холбоно. */
export function addSpouseTo(tree: FamilyTree, anchorId: string): { tree: FamilyTree; id: string } {
  const anchor = getPerson(tree, anchorId);
  if (!anchor) return { tree, id: anchorId };
  const pos = freeSpot(tree, anchor.position.x + GAP_X, anchor.position.y);
  const { tree: t1, id } = addPerson(tree, {
    firstName: "Шинэ хань",
    gender: oppositeGender(anchor.gender),
    position: pos,
  });
  return { tree: linkSpouse(t1, anchorId, id), id };
}

/** Үр хүүхэд нэмэх — доор байрлуулж эцэг эх (болон хань) руу холбоно. */
export function addChildTo(tree: FamilyTree, parentId: string): { tree: FamilyTree; id: string } {
  const parent = getPerson(tree, parentId);
  if (!parent) return { tree, id: parentId };
  const pos = freeSpot(tree, parent.position.x, parent.position.y + GAP_Y);
  const { tree: t1, id } = addPerson(tree, {
    firstName: "Шинэ хүүхэд",
    gender: "male",
    position: pos,
  });
  let t2 = linkParent(t1, id, parentId);
  for (const sid of parent.spouseIds) t2 = linkParent(t2, id, sid);
  return { tree: t2, id };
}

/** Эцэг/эх нэмэх — дээр байрлуулж холбоно. */
export function addParentTo(tree: FamilyTree, childId: string): { tree: FamilyTree; id: string } {
  const child = getPerson(tree, childId);
  if (!child) return { tree, id: childId };
  const pos = freeSpot(tree, child.position.x, Math.max(40, child.position.y - GAP_Y));
  const { tree: t1, id } = addPerson(tree, {
    firstName: "Шинэ эцэг/эх",
    gender: "male",
    position: pos,
  });
  return { tree: linkParent(t1, childId, id), id };
}
