// Ургийн модны API — нийтийн нэг модыг сервер дискнээс унших/хадгалах.
//   GET  → одоогийн мод (JSON)
//   PUT  → модыг шалгаж хадгална
//   POST → PUT-тэй ижил (navigator.sendBeacon зөвхөн POST явуулдаг тул)

import type { NextRequest } from "next/server";
import { parseTree } from "@/lib/storage";
import { readTree, writeTree } from "@/lib/serverStore";

// Файлын систем уншдаг тул статик prerender хийхгүй.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const tree = await readTree();
    return Response.json(tree);
  } catch (err) {
    console.error("Модыг уншиж чадсангүй:", err);
    return Response.json({ error: "Серверээс ачаалж чадсангүй" }, { status: 500 });
  }
}

async function save(request: NextRequest): Promise<Response> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "JSON буруу байна" }, { status: 400 });
  }

  // Гаднаас орж ирэх өгөгдөлд итгэхгүй — бүтцийг шалгаж баталгаажуулна.
  const tree = parseTree(body);
  if (!tree) {
    return Response.json({ error: "Ургийн модны бүтэц буруу байна" }, { status: 400 });
  }

  try {
    await writeTree(tree);
  } catch (err) {
    console.error("Серверт хадгалах алдаа:", err);
    return Response.json({ error: "Серверт хадгалж чадсангүй" }, { status: 500 });
  }
  return Response.json({ ok: true, updatedAt: tree.updatedAt });
}

export async function PUT(request: NextRequest) {
  return save(request);
}

export async function POST(request: NextRequest) {
  return save(request);
}
