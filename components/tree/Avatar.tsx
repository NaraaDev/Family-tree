// Дугуй хөрөг — алтан зоосон хүрээтэй. Хүйсийг нарийн дотор хүрээгээр,
// амьд эсэхийг хаш ногоон цэгээр заана.

import type { Person } from "@/lib/types";

function initials(p: Person): string {
  const a = p.firstName?.[0] ?? "";
  const b = p.lastName?.[0] ?? "";
  return (a + b || a || "?").toUpperCase();
}

const ACCENT: Record<Person["gender"], string> = {
  male: "var(--khoh)",
  female: "var(--lac-2)",
};

interface Props {
  readonly person: Person;
  readonly size?: number;
}

export function Avatar({ person, size = 50 }: Props) {
  const alive = !person.deathYear;
  return (
    <div className="relative shrink-0 no-select" style={{ width: size, height: size }}>
      <div
        className="h-full w-full rounded-full p-[2.5px]"
        style={{
          background: "linear-gradient(140deg, var(--gold-hi), var(--gold) 45%, var(--gold-dim))",
          boxShadow: "0 0 0 1px var(--ink), 0 2px 5px -2px rgba(0,0,0,.5)",
        }}
      >
        <div
          className="flex h-full w-full items-center justify-center overflow-hidden rounded-full"
          style={{
            background: "linear-gradient(160deg, var(--felt-hi), var(--felt))",
            boxShadow: `inset 0 0 0 1.5px ${ACCENT[person.gender]}`,
          }}
        >
          {person.photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={person.photoUrl}
              alt={person.firstName}
              className="h-full w-full rounded-full object-cover"
              draggable={false}
            />
          ) : (
            <span className="font-display text-lac-2" style={{ fontSize: size * 0.36 }}>
              {initials(person)}
            </span>
          )}
        </div>
      </div>
      {alive && (
        <span
          className="absolute bottom-0 right-0 block rounded-full"
          style={{
            width: size * 0.2,
            height: size * 0.2,
            background: "var(--jade)",
            boxShadow: "0 0 0 1.5px var(--felt-hi), 0 0 0 2.5px var(--gold)",
          }}
          title="Амьд"
        />
      )}
    </div>
  );
}
