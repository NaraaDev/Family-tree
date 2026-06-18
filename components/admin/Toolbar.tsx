// Админ хэрэгслийн самбар — лакан толгой. Гарчиг засах, хүн нэмэх, эгнүүлэх, экспорт.

import Link from "next/link";
import type { FamilyTree } from "@/lib/types";
import { ToonoMark } from "@/components/ui/ToonoMark";

interface Props {
  readonly tree: FamilyTree;
  readonly onTitle: (title: string) => void;
  readonly onSubtitle: (subtitle: string) => void;
  readonly onAddPerson: () => void;
  readonly onAutoArrange: () => void;
  readonly onExport: () => void;
  readonly onReset: () => void;
  readonly savedAt: number | null;
}

const ghost =
  "rounded-md border border-gold-dim/60 px-3 py-2 text-sm text-gold-hi transition-colors hover:bg-lac-hi";

export function Toolbar({
  tree,
  onTitle,
  onSubtitle,
  onAddPerson,
  onAutoArrange,
  onExport,
  onReset,
  savedAt,
}: Props) {
  return (
    <header className="flex flex-wrap items-center gap-4 px-5 py-3">
      <span
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
        style={{ boxShadow: "0 0 0 1px var(--ink), 0 0 0 2px var(--gold)" }}
      >
        <ToonoMark size={30} color="var(--gold-hi)" />
      </span>

      <div className="min-w-[200px] flex-1">
        <div className="group flex items-center gap-1.5">
          <input
            value={tree.title}
            onChange={(e) => onTitle(e.target.value)}
            placeholder="Ургийн бичгийн нэр"
            title="Дарж нэрээ засна"
            className="w-full border-b border-transparent bg-transparent pb-0.5 font-display text-xl tracking-wide text-gold-hi outline-none transition-colors placeholder:text-gold/30 hover:border-gold-dim/50 focus:border-gold"
          />
          <span
            aria-hidden="true"
            className="shrink-0 text-gold/40 transition-colors group-focus-within:text-gold group-hover:text-gold/70"
          >
            ✎
          </span>
        </div>
        <input
          value={tree.subtitle}
          onChange={(e) => onSubtitle(e.target.value)}
          placeholder="Дэд гарчиг (заавал биш)"
          title="Дарж дэд гарчгийг засна"
          className="mt-0.5 w-full border-b border-transparent bg-transparent font-display text-xs italic text-gold/80 outline-none transition-colors placeholder:text-gold/25 hover:border-gold-dim/40 focus:border-gold/70"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onAddPerson}
          className="rounded-md bg-gold px-3.5 py-2 text-sm font-semibold text-lac shadow-md transition-colors hover:bg-gold-hi"
          style={{ boxShadow: "0 0 0 1px var(--ink)" }}
        >
          ＋ Хүн нэмэх
        </button>
        <button onClick={onAutoArrange} className={ghost}>
          ⤢ Цэгцлэх
        </button>
        <button onClick={onExport} className={ghost}>
          ⤓ Экспорт
        </button>
        <button onClick={onReset} className={ghost}>
          ↺ Сэргээх
        </button>
        <Link href="/" className={ghost}>
          👁 Үзэх
        </Link>
      </div>

      <p className="w-full text-right text-[11px] text-gold/60">
        {savedAt ? "✓ Автоматаар хадгалагдсан" : "Өөрчлөлт хийгдээгүй"}
      </p>
    </header>
  );
}
