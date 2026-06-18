"use client";

// Заавар — анхааруулгын icon. Дээр нь дарахад жижиг самбар (popover) гарч ирнэ.
// Гадуур дарах эсвэл Esc дарахад хаагдана.

import { useEffect, useRef, useState } from "react";

interface Props {
  readonly items: readonly string[];
  readonly title?: string;
}

export function HelpHint({ items, title = "Заавар" }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={title}
        title={title}
        className="flex h-10 w-10 items-center justify-center rounded-full text-gold-hi transition-colors hover:bg-lac-hi"
        style={{ boxShadow: "0 0 0 1px var(--ink), 0 0 0 2px var(--gold-dim)" }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="12" cy="12" r="9.5" stroke="currentColor" strokeWidth="1.4" />
          <circle cx="12" cy="7.6" r="1.2" fill="currentColor" />
          <path d="M12 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={title}
          className="felt absolute right-0 top-12 z-30 w-64 rounded-lg p-4"
          style={{ boxShadow: "0 0 0 1px var(--ink), 0 0 0 2px var(--gold), 0 18px 40px -16px rgba(0,0,0,.6)" }}
        >
          <p className="mb-2 font-display text-sm tracking-wide text-lac-2">{title}</p>
          <ul className="space-y-1.5">
            {items.map((t, i) => (
              <li key={i} className="flex gap-2 text-xs leading-relaxed text-lac-2/90">
                <span className="text-gold-dim">◆</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
