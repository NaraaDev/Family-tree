// Ургийн модыг localStorage-д хадгалах Repository. Бүх гаднаас орж ирэх
// өгөгдлийг шалгаж (validate) баталгаажуулна — итгэхгүй.

import type { FamilyTree, Person } from "./types";
import { emptyTree } from "./tree";

const STORAGE_KEY = "family-tree:v1";

function isPoint(v: unknown): v is { x: number; y: number } {
  return (
    typeof v === "object" &&
    v !== null &&
    typeof (v as Record<string, unknown>).x === "number" &&
    typeof (v as Record<string, unknown>).y === "number"
  );
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.filter((x): x is string => typeof x === "string");
}

function validatePerson(raw: unknown): Person | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.id !== "string" || typeof r.firstName !== "string") return null;
  const gender = r.gender === "female" ? "female" : "male";
  return {
    id: r.id,
    firstName: r.firstName,
    lastName: typeof r.lastName === "string" ? r.lastName : undefined,
    gender,
    birthYear: typeof r.birthYear === "string" ? r.birthYear : undefined,
    deathYear: typeof r.deathYear === "string" ? r.deathYear : undefined,
    photoUrl: typeof r.photoUrl === "string" ? r.photoUrl : undefined,
    note: typeof r.note === "string" ? r.note : undefined,
    parentIds: asStringArray(r.parentIds),
    spouseIds: asStringArray(r.spouseIds),
    position: isPoint(r.position) ? r.position : { x: 80, y: 80 },
  };
}

/** JSON-оос ургийн мод болгож шалгана. Алдаатай бол null. */
export function parseTree(raw: unknown): FamilyTree | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.persons !== "object" || r.persons === null) return null;

  const persons: Record<string, Person> = {};
  for (const value of Object.values(r.persons as Record<string, unknown>)) {
    const person = validatePerson(value);
    if (person) persons[person.id] = person;
  }

  return {
    id: typeof r.id === "string" ? r.id : "tree_local",
    title: typeof r.title === "string" ? r.title : "Манай ургийн мод",
    subtitle: typeof r.subtitle === "string" ? r.subtitle : "",
    persons,
    updatedAt: typeof r.updatedAt === "number" ? r.updatedAt : Date.now(),
  };
}

export function loadTree(): FamilyTree | null {
  if (typeof window === "undefined") return null;
  try {
    const text = window.localStorage.getItem(STORAGE_KEY);
    if (!text) return null;
    return parseTree(JSON.parse(text));
  } catch (err) {
    console.error("Ургийн мод уншихад алдаа гарлаа:", err);
    return null;
  }
}

export function saveTree(tree: FamilyTree): boolean {
  if (typeof window === "undefined") return false;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tree));
    return true;
  } catch (err) {
    console.error("Ургийн мод хадгалахад алдаа гарлаа:", err);
    return false;
  }
}

export function exportTreeJson(tree: FamilyTree): string {
  return JSON.stringify(tree, null, 2);
}

export function loadOrSeed(seed: FamilyTree): FamilyTree {
  return loadTree() ?? seed ?? emptyTree();
}

export { STORAGE_KEY };
