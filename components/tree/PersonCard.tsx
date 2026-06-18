// Нэг хүний карт — хөрөгний хүрээ + доороо нэрийн тууз (banner).
// Танилцуулга төдий: drag/сонголтын логик эцэг компонентоос ирнэ.

import type { CSSProperties, PointerEvent } from "react";
import type { Person } from "@/lib/types";
import { PERSON_CARD } from "@/lib/types";
import { fullName, lifespan } from "@/lib/tree";

interface Props {
  readonly person: Person;
  readonly selected?: boolean;
  readonly draggable?: boolean;
  readonly onPointerDown?: (e: PointerEvent, id: string) => void;
  readonly onSelect?: (id: string) => void;
}

// Огтлосон булантай (octagon) хүрээ ба загалмай (fishtail) туузны хэлбэр
const OCT = (c: number) =>
  `polygon(${c}px 0, calc(100% - ${c}px) 0, 100% ${c}px, 100% calc(100% - ${c}px), calc(100% - ${c}px) 100%, ${c}px 100%, 0 calc(100% - ${c}px), 0 ${c}px)`;
const RIBBON = "polygon(0 0, 100% 0, calc(100% - 9px) 50%, 100% 100%, 0 100%, 9px 50%)";

const TINT: Record<Person["gender"], string> = {
  male: "linear-gradient(160deg, #e7eef5, #d3e0ec)",
  female: "linear-gradient(160deg, #f5e9ec, #ecd6dd)",
};

function initials(p: Person): string {
  return ((p.firstName?.[0] ?? "") + (p.lastName?.[0] ?? "") || p.firstName?.[0] || "?").toUpperCase();
}

const FRAME_H = 112;

export function PersonCard({ person, selected, draggable, onPointerDown, onSelect }: Props) {
  const alive = !person.deathYear;
  const dates = lifespan(person);
  const style: CSSProperties = {
    left: person.position.x,
    top: person.position.y,
    width: PERSON_CARD.width,
    height: PERSON_CARD.height,
    cursor: draggable ? "grab" : "pointer",
  };

  return (
    <div
      style={style}
      onPointerDown={(e) => onPointerDown?.(e, person.id)}
      onClick={() => onSelect?.(person.id)}
      className="absolute z-10 no-select"
    >
      {/* Сонгогдсон туяа */}
      {selected ? (
        <span
          className="absolute -inset-1 rounded-xl"
          style={{ background: "var(--gold)", opacity: 0.35, filter: "blur(6px)" }}
        />
      ) : null}

      {/* Хөрөгний хүрээ — бор / алт / цайвар давхар хүрээ */}
      <div
        className="absolute left-0 top-0 w-full"
        style={{ height: FRAME_H, clipPath: OCT(12), background: selected ? "var(--gold)" : "#6b4a2e" }}
      >
        <div className="absolute inset-[1.5px]" style={{ clipPath: OCT(11), background: "var(--gold-dim)" }}>
          <div
            className="absolute inset-[2px] flex items-center justify-center overflow-hidden"
            style={{ clipPath: OCT(10), background: person.photoUrl ? "var(--felt-hi)" : TINT[person.gender] }}
          >
            {person.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={person.photoUrl} alt={person.firstName} className="h-full w-full object-cover" draggable={false} />
            ) : (
              <span className="font-display text-3xl text-lac-2/70">{initials(person)}</span>
            )}
          </div>
        </div>
      </div>

      {/* Нэрийн тууз */}
      <div className="absolute left-0 w-full" style={{ top: FRAME_H - 14, height: 32 }}>
        <div className="h-full w-full" style={{ clipPath: RIBBON, background: "#6b4a2e" }}>
          <div
            className="absolute inset-[2px] flex items-center justify-center px-3"
            style={{ clipPath: RIBBON, background: "linear-gradient(180deg, var(--gold-hi), var(--gold))" }}
          >
            <span className="truncate font-display text-[13px] leading-none text-lac">{fullName(person)}</span>
          </div>
        </div>
      </div>

      {/* Он */}
      {dates || alive ? (
        <p
          className="absolute left-0 w-full text-center text-[12.5px] font-medium leading-none tracking-wide"
          style={{ top: FRAME_H + 22, color: alive ? "var(--jade)" : "rgba(26,20,16,.7)" }}
        >
          {dates || "одоо"}
        </p>
      ) : null}
    </div>
  );
}
