// Нэг хүний карт — лакан картуш. Канвас дээр үнэмлэхүй байрлалтай.
// Танилцуулга төдий: drag/сонголтын логик эцэг компонентоос ирнэ.

import type { CSSProperties, PointerEvent } from "react";
import type { Person } from "@/lib/types";
import { PERSON_CARD } from "@/lib/types";
import { fullName, lifespan } from "@/lib/tree";
import { Avatar } from "./Avatar";

interface Props {
  readonly person: Person;
  readonly selected?: boolean;
  readonly draggable?: boolean;
  readonly onPointerDown?: (e: PointerEvent, id: string) => void;
  readonly onSelect?: (id: string) => void;
}

export function PersonCard({ person, selected, draggable, onPointerDown, onSelect }: Props) {
  const alive = !person.deathYear;
  const style: CSSProperties = {
    left: person.position.x,
    top: person.position.y,
    width: PERSON_CARD.width,
    height: PERSON_CARD.height,
    cursor: draggable ? "grab" : "pointer",
    background: "linear-gradient(165deg, var(--felt-hi), var(--felt))",
    boxShadow: selected
      ? "0 0 0 1px var(--ink), 0 0 0 3px var(--gold), 0 8px 22px -8px rgba(0,0,0,.55)"
      : "0 0 0 1px var(--ink), 0 0 0 2px var(--gold-dim), 0 6px 16px -10px rgba(0,0,0,.5)",
  };

  return (
    <div
      style={style}
      onPointerDown={(e) => onPointerDown?.(e, person.id)}
      onClick={() => onSelect?.(person.id)}
      className="absolute z-10 flex items-center gap-3 rounded-md px-3 no-select"
    >
      <Avatar person={person} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-[14px] leading-tight text-lac-2">{fullName(person)}</p>
        <p
          className="mt-1 text-[11px] leading-tight tracking-wide"
          style={{ color: alive ? "var(--jade)" : "rgba(26,20,16,.55)" }}
        >
          {lifespan(person) || (alive ? "одоо" : "")}
        </p>
      </div>
    </div>
  );
}
