"use client";

// Админ удирдлага — ургийн модыг чирч (drag) барих, засах хяналтын самбар.

import { useCallback, useState } from "react";
import type { Point } from "@/lib/types";
import {
  addPerson,
  linkParent,
  linkSpouse,
  movePerson,
  removePerson,
  unlinkParent,
  unlinkSpouse,
  updatePerson,
} from "@/lib/tree";
import { addChildTo, addParentTo, addSpouseTo } from "@/lib/builder";
import { autoArrange } from "@/lib/layout";
import { exportTreeJson } from "@/lib/storage";
import { sampleTree } from "@/lib/sampleData";
import { useFamilyTree } from "@/lib/useFamilyTree";
import { Toolbar } from "@/components/admin/Toolbar";
import { AdminCanvas } from "@/components/admin/AdminCanvas";
import { PersonEditor } from "@/components/admin/PersonEditor";

export default function AdminPage() {
  const { tree, ready, commit, preview } = useFamilyTree();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const saveCommit = useCallback(
    (next: Parameters<typeof commit>[0]) => {
      commit(next);
      setSavedAt(next.updatedAt);
    },
    [commit],
  );

  if (!ready || !tree) {
    return <div className="lacquer flex min-h-screen items-center justify-center text-gold/60">Ачааллаж байна…</div>;
  }

  const selected = selectedId ? tree.persons[selectedId] : undefined;

  // — Чирэх —
  const onPreviewMove = (id: string, pos: Point) => preview(movePerson(tree, id, pos));
  const onCommitMove = (id: string, pos: Point) => saveCommit(movePerson(tree, id, pos));

  // — Хүн нэмэх / засах / устгах —
  const addNewPerson = () => {
    const { tree: next, id } = addPerson(tree, { firstName: "Шинэ хүн", gender: "male", position: { x: 120, y: 120 } });
    saveCommit(next);
    setSelectedId(id);
  };

  const update = (patch: Parameters<typeof updatePerson>[2]) => {
    if (!selectedId) return;
    saveCommit(updatePerson(tree, selectedId, patch));
  };

  const remove = () => {
    if (!selectedId) return;
    saveCommit(removePerson(tree, selectedId));
    setSelectedId(undefined);
  };

  // — Харилцаа холбох (хурдан барих) —
  const quick = (fn: typeof addSpouseTo) => {
    if (!selectedId) return;
    const { tree: next, id } = fn(tree, selectedId);
    saveCommit(next);
    setSelectedId(id);
  };

  const relation = {
    add: {
      spouse: () => quick(addSpouseTo),
      child: () => quick(addChildTo),
      parent: () => quick(addParentTo),
    },
    linkSpouse: (otherId: string) => selectedId && saveCommit(linkSpouse(tree, selectedId, otherId)),
    linkParent: (otherId: string) => selectedId && saveCommit(linkParent(tree, selectedId, otherId)),
    unlinkSpouse: (otherId: string) => selectedId && saveCommit(unlinkSpouse(tree, selectedId, otherId)),
    unlinkParentLink: (otherId: string) => selectedId && saveCommit(unlinkParent(tree, selectedId, otherId)),
  };

  // — Бусад —
  const onAutoArrange = () => {
    const positions = autoArrange(tree);
    let next = tree;
    for (const [id, pos] of Object.entries(positions)) next = movePerson(next, id, pos);
    saveCommit(next);
  };

  const onExport = () => {
    const blob = new Blob([exportTreeJson(tree)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "urgiin-mod.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const onReset = () => {
    if (!window.confirm("Жишээ модыг сэргээх үү? Одоогийн өөрчлөлт устана.")) return;
    saveCommit(sampleTree());
    setSelectedId(undefined);
  };

  return (
    <main className="lacquer flex h-screen flex-col overflow-hidden">
      <Toolbar
        tree={tree}
        onTitle={(title) => saveCommit({ ...tree, title, updatedAt: Date.now() })}
        onSubtitle={(subtitle) => saveCommit({ ...tree, subtitle, updatedAt: Date.now() })}
        onAddPerson={addNewPerson}
        onAutoArrange={onAutoArrange}
        onExport={onExport}
        onReset={onReset}
        savedAt={savedAt}
      />

      <div className="meander h-3 w-full shrink-0" />

      <section className="relative flex-1 min-h-0 p-4">
        <div className="gold-frame felt h-full w-full overflow-hidden rounded-lg">
          <AdminCanvas
            tree={tree}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onPreviewMove={onPreviewMove}
            onCommitMove={onCommitMove}
          />
        </div>

        {Object.keys(tree.persons).length === 0 && (
          <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-lac-2/50">
            «＋ Хүн нэмэх» дарж эхлүүлнэ үү
          </p>
        )}

        {/* Засварлагч — канвасыг түлхэхгүй, дээр нь хөвөгч */}
        {selected ? (
          <div className="absolute right-7 top-7 bottom-7 z-20 flex">
            <PersonEditor
              tree={tree}
              person={selected}
              onUpdate={update}
              onDelete={remove}
              onClose={() => setSelectedId(undefined)}
              relation={relation}
            />
          </div>
        ) : (
          <div className="pointer-events-none absolute left-7 bottom-7 z-10 max-w-xs rounded-lg bg-lac/80 px-4 py-3 text-xs leading-relaxed text-gold-hi/90 backdrop-blur-sm" style={{ boxShadow: "0 0 0 1px var(--gold-dim)" }}>
            Картыг <b>чирж</b> байрлуулна · дарж <b>сонгоод</b> засна · хоосон зайг чирж <b>тойрно</b> · «Цэгцлэх» нь модны хэлбэрт оруулна
          </div>
        )}
      </section>

      <div className="meander h-3 w-full shrink-0" />
    </main>
  );
}
