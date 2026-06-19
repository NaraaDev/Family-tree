// Сервер талын байнгын хадгалалт — ургийн модыг дискэн дээрх JSON файлд хадгална.
// Зургууд нь модны JSON дотор base64-аар багтсан тул мөн энд хадгалагдана.
// Бүх хэрэглэгч нэг файлыг хуваалцана (нийтийн нэг мод).

import { promises as fs } from "node:fs";
import path from "node:path";
import type { FamilyTree } from "./types";
import { parseTree } from "./storage";
import { sampleTree } from "./sampleData";

// Өгөгдлийн байршил — TREE_DATA_DIR орчны хувьсагчаар тохируулж болно.
const DATA_DIR = process.env.TREE_DATA_DIR ?? path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "tree.json");

// Зэрэг бичилтээс сэргийлж бичилтийг дараалуулна (нэг процессийн дотор).
let writeChain: Promise<void> = Promise.resolve();

/** Дискнээс ургийн модыг уншина. Файл байхгүй бол жишээ модоор үрлэж хадгална. */
export async function readTree(): Promise<FamilyTree> {
  try {
    const text = await fs.readFile(FILE, "utf8");
    const parsed = parseTree(JSON.parse(text));
    if (parsed) return parsed;
    console.error("tree.json бүтэц буруу — жишээ модоор сэргээж байна");
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code;
    if (code !== "ENOENT") console.error("tree.json уншихад алдаа:", err);
  }
  const seed = sampleTree();
  await writeTree(seed);
  return seed;
}

/** Ургийн модыг дискэнд атомар (temp → rename) бичнэ. Бичилтүүд дараалж гүйцэтгэгдэнэ. */
export function writeTree(tree: FamilyTree): Promise<void> {
  const run = writeChain.then(async () => {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const tmp = `${FILE}.${process.pid}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(tree), "utf8");
    await fs.rename(tmp, FILE);
  });
  // Алдаа гарсан ч дараагийн бичилт үргэлжилнэ; алдааг дуудагч руу нь буцаана.
  writeChain = run.catch(() => {});
  return run;
}
