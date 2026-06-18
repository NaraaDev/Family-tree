// Жишээ ургийн мод — Монгол нэртэй 4 үеийн гэр бүл.
// Хэрэглэгч анх орж ирэхэд энэ загвар харагдана, дараа нь Admin-аас засна.

import type { FamilyTree, Person } from "./types";

type Seed = Omit<Person, "parentIds" | "spouseIds"> & {
  parentIds?: string[];
  spouseIds?: string[];
};

function person(s: Seed): Person {
  return { parentIds: [], spouseIds: [], ...s };
}

const seeds: Seed[] = [
  // 1-р үе (өвөг дээдэс)
  { id: "a1", firstName: "Батбаяр", lastName: "Дамдин", gender: "male", birthYear: "1921", deathYear: "1994", position: { x: 620, y: 60 }, spouseIds: ["a2"] },
  { id: "a2", firstName: "Цэрэндулам", lastName: "", gender: "female", birthYear: "1925", deathYear: "1999", position: { x: 808, y: 60 }, spouseIds: ["a1"] },
  { id: "b1", firstName: "Дорж", lastName: "Лувсан", gender: "male", birthYear: "1919", deathYear: "1990", position: { x: 1180, y: 60 }, spouseIds: ["b2"] },
  { id: "b2", firstName: "Сүрэнхорло", lastName: "", gender: "female", birthYear: "1923", deathYear: "2001", position: { x: 1368, y: 60 }, spouseIds: ["b1"] },

  // 2-р үе
  { id: "c1", firstName: "Ганбат", lastName: "Батбаяр", gender: "male", birthYear: "1948", deathYear: "2018", position: { x: 360, y: 300 }, parentIds: ["a1", "a2"], spouseIds: ["d1"] },
  { id: "d1", firstName: "Сэлэнгэ", lastName: "", gender: "female", birthYear: "1952", position: { x: 548, y: 300 }, spouseIds: ["c1"] },
  { id: "c2", firstName: "Оюунаа", lastName: "Батбаяр", gender: "female", birthYear: "1953", position: { x: 900, y: 300 }, parentIds: ["a1", "a2"], spouseIds: ["c3"] },
  { id: "c3", firstName: "Болд", lastName: "Дорж", gender: "male", birthYear: "1950", position: { x: 1088, y: 300 }, parentIds: ["b1", "b2"], spouseIds: ["c2"] },
  { id: "c4", firstName: "Алтантуяа", lastName: "Дорж", gender: "female", birthYear: "1957", position: { x: 1460, y: 300 }, parentIds: ["b1", "b2"], spouseIds: ["d2"] },
  { id: "d2", firstName: "Жаргалсайхан", lastName: "", gender: "male", birthYear: "1955", position: { x: 1648, y: 300 }, spouseIds: ["c4"] },

  // 3-р үе
  { id: "e1", firstName: "Тэмүүлэн", lastName: "Ганбат", gender: "male", birthYear: "1978", position: { x: 300, y: 540 }, parentIds: ["c1", "d1"] },
  { id: "e2", firstName: "Энхжин", lastName: "Ганбат", gender: "female", birthYear: "1981", position: { x: 480, y: 540 }, parentIds: ["c1", "d1"] },
  { id: "e3", firstName: "Наран", lastName: "Болд", gender: "male", birthYear: "1979", position: { x: 900, y: 540 }, parentIds: ["c2", "c3"], spouseIds: ["f1"] },
  { id: "f1", firstName: "Долгион", lastName: "", gender: "female", birthYear: "1983", position: { x: 1088, y: 540 }, spouseIds: ["e3"] },
  { id: "e4", firstName: "Сувд", lastName: "Болд", gender: "female", birthYear: "1985", position: { x: 1300, y: 540 }, parentIds: ["c2", "c3"] },
  { id: "e5", firstName: "Тэнгис", lastName: "Жаргалсайхан", gender: "male", birthYear: "1984", position: { x: 1560, y: 540 }, parentIds: ["c4", "d2"] },

  // 4-р үе
  { id: "g1", firstName: "Мөнхзул", lastName: "Наран", gender: "female", birthYear: "2010", position: { x: 900, y: 780 }, parentIds: ["e3", "f1"] },
  { id: "g2", firstName: "Батжаргал", lastName: "Наран", gender: "male", birthYear: "2013", position: { x: 1088, y: 780 }, parentIds: ["e3", "f1"] },
];

export function sampleTree(): FamilyTree {
  const persons: Record<string, Person> = {};
  for (const s of seeds) persons[s.id] = person(s);
  return {
    id: "tree_sample",
    title: "Дамдин & Лувсангийн ураг",
    subtitle: "Гэр бүлийн их мод",
    persons,
    updatedAt: 0,
  };
}
