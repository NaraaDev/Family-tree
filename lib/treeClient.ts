// Client тал — серверийн /api/tree рүү ургийн модыг унших/хадгалах.
// localStorage-ийн оронд бүх хэрэглэгч серверийн нэг модыг хуваалцана.

import type { FamilyTree } from "./types";
import { parseTree } from "./storage";

const ENDPOINT = "/api/tree";

/** Серверээс ургийн модыг татаж шалгана. Алдаатай бол Error шиднэ. */
export async function fetchTree(): Promise<FamilyTree | null> {
  const res = await fetch(ENDPOINT, { cache: "no-store" });
  if (!res.ok) throw new Error("Серверээс ачаалж чадсангүй");
  return parseTree(await res.json());
}

/** Ургийн модыг серверт хадгална. Алдаатай бол ойлгомжтой мессежтэй Error шиднэ. */
export async function putTree(tree: FamilyTree): Promise<void> {
  const res = await fetch(ENDPOINT, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(tree),
  });
  if (!res.ok) {
    const msg = await res.json().catch(() => null);
    throw new Error(msg?.error ?? "Серверт хадгалж чадсангүй");
  }
}

/** Хуудас хаагдах үед сүүлийн өөрчлөлтийг "best-effort" илгээх (POST, sendBeacon). */
export function beaconTree(tree: FamilyTree): void {
  if (typeof navigator === "undefined" || !navigator.sendBeacon) return;
  const blob = new Blob([JSON.stringify(tree)], { type: "application/json" });
  navigator.sendBeacon(ENDPOINT, blob);
}
