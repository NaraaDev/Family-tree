// Сонгосон хүнийг засах самбар — талбарууд + харилцаа холбох/таслах + устгах.

import { useState } from "react";
import type { FamilyTree, Person } from "@/lib/types";
import { fullName, listPersons } from "@/lib/tree";

interface Relation {
  readonly add: { spouse: () => void; child: () => void; parent: () => void };
  readonly linkSpouse: (otherId: string) => void;
  readonly linkParent: (otherId: string) => void;
  readonly unlinkSpouse: (otherId: string) => void;
  readonly unlinkParentLink: (otherId: string) => void;
}

interface Props {
  readonly tree: FamilyTree;
  readonly person: Person;
  readonly onUpdate: (patch: Partial<Omit<Person, "id">>) => void;
  readonly onDelete: () => void;
  readonly onClose: () => void;
  readonly relation: Relation;
}

const labelCls = "text-[10px] font-semibold uppercase tracking-[0.15em] text-gold-dim";
const inputCls =
  "mt-1 w-full rounded-md border border-gold-dim/50 bg-felt-hi px-3 py-1.5 text-sm text-lac-2 outline-none focus:border-khoh";

function Field({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className={labelCls}>{label}</span>
      <input value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    </label>
  );
}

function Chip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-lac/10 px-2.5 py-1 text-xs text-lac-2">
      {label}
      <button onClick={onRemove} className="text-lac-hi hover:text-lac" aria-label="Таслах">
        ✕
      </button>
    </span>
  );
}

export function PersonEditor({ tree, person, onUpdate, onDelete, onClose, relation }: Props) {
  const [pick, setPick] = useState("");
  const candidates = listPersons(tree).filter((p) => p.id !== person.id);
  const parents = person.parentIds.map((id) => tree.persons[id]).filter((p): p is Person => !!p);
  const spouses = person.spouseIds.map((id) => tree.persons[id]).filter((p): p is Person => !!p);
  const children = listPersons(tree).filter((p) => p.parentIds.includes(person.id));

  return (
    <aside
      className="felt flex max-h-full w-80 flex-col gap-4 overflow-y-auto rounded-lg p-5"
      style={{ boxShadow: "0 0 0 1px var(--ink), 0 0 0 2px var(--gold), 0 18px 40px -16px rgba(0,0,0,.6)" }}
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-lac-2">Хүн засах</h2>
        <button onClick={onClose} className="text-lac-2/50 hover:text-lac-hi" aria-label="Хаах">
          ✕
        </button>
      </div>

      {/* Талбарууд */}
      <div className="space-y-3">
        <Field label="Овог" value={person.lastName ?? ""} onChange={(v) => onUpdate({ lastName: v })} />
        <Field label="Нэр" value={person.firstName} onChange={(v) => onUpdate({ firstName: v })} />

        <div>
          <span className={labelCls}>Хүйс</span>
          <div className="mt-1 flex gap-2">
            {(["male", "female"] as const).map((g) => (
              <button
                key={g}
                onClick={() => onUpdate({ gender: g })}
                className={[
                  "flex-1 rounded-md border px-3 py-1.5 text-sm",
                  person.gender === g
                    ? "border-ink bg-lac text-gold-hi"
                    : "border-gold-dim/50 bg-felt-hi text-lac-2",
                ].join(" ")}
              >
                {g === "male" ? "Эр" : "Эм"}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Field label="Төрсөн" value={person.birthYear ?? ""} onChange={(v) => onUpdate({ birthYear: v })} placeholder="1990" />
          <Field label="Нас барсан" value={person.deathYear ?? ""} onChange={(v) => onUpdate({ deathYear: v })} placeholder="—" />
        </div>

        <Field label="Зургийн URL" value={person.photoUrl ?? ""} onChange={(v) => onUpdate({ photoUrl: v })} placeholder="https://…" />

        <label className="block">
          <span className={labelCls}>Тэмдэглэл</span>
          <textarea
            value={person.note ?? ""}
            onChange={(e) => onUpdate({ note: e.target.value })}
            rows={2}
            className={`${inputCls} resize-none`}
          />
        </label>
      </div>

      {/* Хурдан холбож хүн нэмэх */}
      <div className="border-t border-gold-dim/30 pt-3">
        <p className={`mb-2 ${labelCls}`}>Хүн нэмэх</p>
        <div className="grid grid-cols-3 gap-2">
          <button onClick={relation.add.parent} className="rounded-md bg-khoh/10 px-2 py-2 text-xs font-medium text-khoh hover:bg-khoh/20">
            ↑ Эцэг эх
          </button>
          <button onClick={relation.add.spouse} className="rounded-md bg-lac/10 px-2 py-2 text-xs font-medium text-lac-2 hover:bg-lac/20">
            ⧉ Хань
          </button>
          <button onClick={relation.add.child} className="rounded-md bg-jade/15 px-2 py-2 text-xs font-medium text-jade hover:bg-jade/25">
            ↓ Хүүхэд
          </button>
        </div>
      </div>

      {/* Одоо байгаа хүнтэй холбох */}
      <div className="border-t border-gold-dim/30 pt-3">
        <p className={`mb-2 ${labelCls}`}>Одоо байгаа хүнтэй холбох</p>
        <select value={pick} onChange={(e) => setPick(e.target.value)} className={inputCls.replace("mt-1 ", "")}>
          <option value="">— хүн сонгох —</option>
          {candidates.map((p) => (
            <option key={p.id} value={p.id}>
              {fullName(p)}
            </option>
          ))}
        </select>
        <div className="mt-2 flex gap-2">
          <button
            disabled={!pick}
            onClick={() => pick && relation.linkSpouse(pick)}
            className="flex-1 rounded-md border border-lac/40 px-2 py-1.5 text-xs text-lac-2 disabled:opacity-40"
          >
            ⧉ Хань болгох
          </button>
          <button
            disabled={!pick}
            onClick={() => pick && relation.linkParent(pick)}
            className="flex-1 rounded-md border border-khoh/40 px-2 py-1.5 text-xs text-khoh disabled:opacity-40"
          >
            ↑ Эцэг эх болгох
          </button>
        </div>
      </div>

      {/* Одоогийн холбоосууд */}
      {(parents.length > 0 || spouses.length > 0 || children.length > 0) && (
        <div className="space-y-2 border-t border-gold-dim/30 pt-3">
          {parents.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-lac-2/50">Эцэг эх:</span>
              {parents.map((p) => (
                <Chip key={p.id} label={fullName(p)} onRemove={() => relation.unlinkParentLink(p.id)} />
              ))}
            </div>
          )}
          {spouses.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-lac-2/50">Хань:</span>
              {spouses.map((p) => (
                <Chip key={p.id} label={fullName(p)} onRemove={() => relation.unlinkSpouse(p.id)} />
              ))}
            </div>
          )}
          {children.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-lac-2/50">Хүүхэд:</span>
              {children.map((p) => (
                <span key={p.id} className="rounded-full bg-jade/15 px-2.5 py-1 text-xs text-jade">
                  {fullName(p)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <button
        onClick={onDelete}
        className="mt-2 rounded-md border border-lac/50 px-3 py-2 text-sm font-medium text-lac-2 hover:bg-lac/10"
      >
        🗑 Энэ хүнийг устгах
      </button>
    </aside>
  );
}
