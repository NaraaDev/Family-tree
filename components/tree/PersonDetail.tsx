// Сонгосон хүний намтар — эсгий цаасан хөвөгч самбар.

import type { FamilyTree, Person } from "@/lib/types";
import { fullName, lifespan, listPersons } from "@/lib/tree";
import { Avatar } from "./Avatar";

interface Props {
  readonly tree: FamilyTree;
  readonly person: Person;
  readonly onClose: () => void;
}

function relatives(tree: FamilyTree, ids: readonly string[]): Person[] {
  return ids.map((id) => tree.persons[id]).filter((p): p is Person => !!p);
}

function childrenOf(tree: FamilyTree, id: string): Person[] {
  return listPersons(tree).filter((p) => p.parentIds.includes(id));
}

function NameRow({ label, people }: { label: string; people: Person[] }) {
  if (people.length === 0) return null;
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gold-dim">{label}</p>
      <p className="mt-0.5 text-sm text-lac-2">{people.map(fullName).join(", ")}</p>
    </div>
  );
}

export function PersonDetail({ tree, person, onClose }: Props) {
  return (
    <aside
      className="felt w-72 rounded-lg p-5"
      style={{ boxShadow: "0 0 0 1px var(--ink), 0 0 0 2px var(--gold), 0 18px 40px -16px rgba(0,0,0,.6)" }}
    >
      <div className="flex items-start justify-between">
        <Avatar person={person} size={62} />
        <button onClick={onClose} className="text-lac-2/50 hover:text-lac-hi" aria-label="Хаах">
          ✕
        </button>
      </div>
      <h2 className="mt-3 font-display text-xl leading-tight text-lac-2">{fullName(person)}</h2>
      <p className="text-sm" style={{ color: person.deathYear ? "rgba(26,20,16,.6)" : "var(--jade)" }}>
        {lifespan(person) || "одоо амьд"}
      </p>

      <div className="mt-4 space-y-3 border-t border-gold-dim/30 pt-4">
        <NameRow label="Эцэг эх" people={relatives(tree, person.parentIds)} />
        <NameRow label="Хань" people={relatives(tree, person.spouseIds)} />
        <NameRow label="Үр хүүхэд" people={childrenOf(tree, person.id)} />
        {person.note ? (
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-gold-dim">Тэмдэглэл</p>
            <p className="mt-0.5 text-sm text-lac-2/80">{person.note}</p>
          </div>
        ) : null}
      </div>
    </aside>
  );
}
