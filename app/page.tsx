"use client";

// Нийтийн харагдац — нэг дэлгэц. Мод нь газрын зураг шиг pan/zoom хийгдэнэ.

import { useState } from "react";
import { useFamilyTree } from "@/lib/useFamilyTree";
import { TitlePlate } from "@/components/ui/TitlePlate";
import { HelpHint } from "@/components/ui/HelpHint";
import { TreeCanvas } from "@/components/tree/TreeCanvas";
import { PersonDetail } from "@/components/tree/PersonDetail";

export default function HomePage() {
  const { tree, ready } = useFamilyTree();
  const [selectedId, setSelectedId] = useState<string | undefined>();
  const selected = selectedId && tree ? tree.persons[selectedId] : undefined;

  return (
    <main className="lacquer flex h-screen flex-col overflow-hidden">
      <header className="flex items-center justify-between gap-4 px-6 pb-4 pt-5">
        <TitlePlate title={tree?.title ?? "Ургийн бичиг"} subtitle={tree?.subtitle} />
        <HelpHint
          items={[
            "Хоосон зайг чирж модыг тойрно",
            "Хулганы хүрдээр томруулж жижигрүүлнэ",
            "Картан дээр дарж тухайн хүний намтрыг үзнэ",
            "Доод буланд: ＋ томруулах, － жижигрүүлэх, ⤢ бүгдийг харах",
          ]}
        />
      </header>

      <div className="meander h-3 w-full shrink-0" />

      <section className="relative flex-1 min-h-0 p-5">
        <div className="gold-frame felt h-full w-full overflow-hidden rounded-lg">
          {ready && tree ? (
            <TreeCanvas tree={tree} onSelect={setSelectedId} selectedId={selectedId} />
          ) : (
            <p className="flex h-full items-center justify-center text-lac-2/50">Ачааллаж байна…</p>
          )}
        </div>

        {selected && tree ? (
          <div className="absolute right-8 top-8 z-20">
            <PersonDetail tree={tree} person={selected} onClose={() => setSelectedId(undefined)} />
          </div>
        ) : null}
      </section>

      <div className="meander h-3 w-full shrink-0" />
    </main>
  );
}
