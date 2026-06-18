// Ургийн модыг өөрчлөх ЦЭВЭР функцууд — бүгд шинэ хувь буцаана (mutation байхгүй).

import type { FamilyTree, Person, Point } from "./types";
import { createId } from "./id";

export function emptyTree(title = "Манай ургийн мод", subtitle = ""): FamilyTree {
  return {
    id: createId("tree"),
    title,
    subtitle,
    persons: {},
    updatedAt: Date.now(),
  };
}

function touch(tree: FamilyTree, persons: Record<string, Person>): FamilyTree {
  return { ...tree, persons, updatedAt: Date.now() };
}

export function listPersons(tree: FamilyTree): Person[] {
  return Object.values(tree.persons);
}

export function getPerson(tree: FamilyTree, id: string): Person | undefined {
  return tree.persons[id];
}

export interface NewPersonInput {
  firstName: string;
  lastName?: string;
  gender: Person["gender"];
  birthYear?: string;
  deathYear?: string;
  photoUrl?: string;
  note?: string;
  position?: Point;
}

export function addPerson(tree: FamilyTree, input: NewPersonInput): { tree: FamilyTree; id: string } {
  const id = createId();
  const person: Person = {
    id,
    firstName: input.firstName.trim(),
    lastName: input.lastName?.trim() || undefined,
    gender: input.gender,
    birthYear: input.birthYear?.trim() || undefined,
    deathYear: input.deathYear?.trim() || undefined,
    photoUrl: input.photoUrl?.trim() || undefined,
    note: input.note?.trim() || undefined,
    parentIds: [],
    spouseIds: [],
    position: input.position ?? { x: 80, y: 80 },
  };
  return { tree: touch(tree, { ...tree.persons, [id]: person }), id };
}

export function updatePerson(
  tree: FamilyTree,
  id: string,
  patch: Partial<Omit<Person, "id">>,
): FamilyTree {
  const current = tree.persons[id];
  if (!current) return tree;
  const next: Person = { ...current, ...patch, id };
  return touch(tree, { ...tree.persons, [id]: next });
}

export function movePerson(tree: FamilyTree, id: string, position: Point): FamilyTree {
  return updatePerson(tree, id, { position });
}

/** Хүнийг устгаад бусдын холбоосыг (parent/spouse) цэвэрлэнэ. */
export function removePerson(tree: FamilyTree, id: string): FamilyTree {
  if (!tree.persons[id]) return tree;
  const persons: Record<string, Person> = {};
  for (const p of Object.values(tree.persons)) {
    if (p.id === id) continue;
    persons[p.id] = {
      ...p,
      parentIds: p.parentIds.filter((x) => x !== id),
      spouseIds: p.spouseIds.filter((x) => x !== id),
    };
  }
  return touch(tree, persons);
}

/** Эцэг/эх — хүүхэд холбоо нэмэх (childId-д parentId-г онооно). */
export function linkParent(tree: FamilyTree, childId: string, parentId: string): FamilyTree {
  const child = tree.persons[childId];
  const parent = tree.persons[parentId];
  if (!child || !parent || childId === parentId) return tree;
  if (child.parentIds.includes(parentId)) return tree;
  if (child.parentIds.length >= 2) return tree; // дээд тал нь 2 эцэг эх
  return updatePerson(tree, childId, { parentIds: [...child.parentIds, parentId] });
}

export function unlinkParent(tree: FamilyTree, childId: string, parentId: string): FamilyTree {
  const child = tree.persons[childId];
  if (!child) return tree;
  return updatePerson(tree, childId, {
    parentIds: child.parentIds.filter((x) => x !== parentId),
  });
}

/** Хоёр хүнийг гэр бүлээр холбох (хоёр талдаа). */
export function linkSpouse(tree: FamilyTree, aId: string, bId: string): FamilyTree {
  const a = tree.persons[aId];
  const b = tree.persons[bId];
  if (!a || !b || aId === bId) return tree;
  const persons = { ...tree.persons };
  if (!a.spouseIds.includes(bId)) persons[aId] = { ...a, spouseIds: [...a.spouseIds, bId] };
  if (!b.spouseIds.includes(aId)) persons[bId] = { ...b, spouseIds: [...b.spouseIds, aId] };
  return touch(tree, persons);
}

export function unlinkSpouse(tree: FamilyTree, aId: string, bId: string): FamilyTree {
  const a = tree.persons[aId];
  const b = tree.persons[bId];
  if (!a || !b) return tree;
  const persons = { ...tree.persons };
  persons[aId] = { ...a, spouseIds: a.spouseIds.filter((x) => x !== bId) };
  persons[bId] = { ...b, spouseIds: b.spouseIds.filter((x) => x !== aId) };
  return touch(tree, persons);
}

export function fullName(p: Person): string {
  return [p.lastName, p.firstName].filter(Boolean).join(" ");
}

export function lifespan(p: Person): string {
  if (!p.birthYear && !p.deathYear) return "";
  const birth = p.birthYear ?? "?";
  const death = p.deathYear ?? "одоо";
  return `${birth} – ${death}`;
}
