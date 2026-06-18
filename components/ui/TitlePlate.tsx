// Толгойн тэмдэг — тооно медаль + сийлсэн маягийн нэр.

import { ToonoMark } from "./ToonoMark";

interface Props {
  readonly title: string;
  readonly subtitle?: string;
}

export function TitlePlate({ title, subtitle }: Props) {
  return (
    <div className="flex items-center gap-4">
      <span
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
        style={{
          background: "radial-gradient(circle at 35% 30%, var(--lac-hi), var(--lac))",
          boxShadow: "0 0 0 1px var(--ink), 0 0 0 3px var(--gold), 0 0 0 4px var(--gold-dim)",
        }}
      >
        <ToonoMark size={36} color="var(--gold-hi)" />
      </span>
      <div className="min-w-0">
        <h1 className="font-display text-2xl leading-tight tracking-wide text-gold-hi text-engrave">
          {title}
        </h1>
        {subtitle ? (
          <p className="font-display text-sm italic tracking-wide text-gold/80">{subtitle}</p>
        ) : null}
      </div>
    </div>
  );
}
