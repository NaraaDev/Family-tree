// Ургийн модны үндсэн өгөгдлийн төрлүүд (domain types)

export type Gender = "male" | "female";

/** Нэг хүн (зангилаа). Бүх талбар уншихад ээлтэй, immutable. */
export interface Person {
  readonly id: string;
  readonly firstName: string; // нэр
  readonly lastName?: string; // овог
  readonly gender: Gender;
  readonly birthYear?: string; // төрсөн он (текстээр — "1924" эсвэл "~1900")
  readonly deathYear?: string; // нас барсан он
  readonly photoUrl?: string; // зургийн URL эсвэл data URL
  readonly note?: string; // тэмдэглэл
  readonly parentIds: readonly string[]; // эцэг эх рүү холбоос (0-2)
  readonly spouseIds: readonly string[]; // гэр бүлийн холбоос
  readonly position: Readonly<Point>; // канвас дээрх байрлал
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

/** Бүтэн ургийн мод. */
export interface FamilyTree {
  readonly id: string;
  readonly title: string;
  readonly subtitle: string;
  readonly persons: Readonly<Record<string, Person>>;
  readonly updatedAt: number;
}

export const PERSON_CARD = {
  width: 168,
  height: 96,
} as const;
