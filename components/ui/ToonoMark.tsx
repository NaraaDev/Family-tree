// Тооно (гэрийн тооно) — голоос цацарсан хүрд. Энэ системийн гарын үсэг.
// Удам нэг язгуураас цацарч буйг билэгддэг.

interface Props {
  readonly size?: number;
  readonly className?: string;
  readonly color?: string;
}

const SPOKES = 12;

// server/client ижил тэмдэгт мөр гаргахын тулд тогтмол нарийвчлалд бөөрөнхийлнө
// (хөвөгч цэгийн зөрүүгээс үүдэх hydration mismatch-аас сэргийлнэ).
const r3 = (n: number) => Math.round(n * 1000) / 1000;

export function ToonoMark({ size = 44, className = "", color = "var(--gold)" }: Props) {
  const c = 24;
  const rOuter = 21;
  const rHub = 6.5;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      className={className}
      stroke={color}
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <circle cx={c} cy={c} r={rOuter} />
      <circle cx={c} cy={c} r={rOuter - 3} strokeWidth={1} opacity={0.7} />
      {/* Хагархай мод — голоос цацарсан хээ */}
      {Array.from({ length: SPOKES }).map((_, i) => {
        const a = (i / SPOKES) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={r3(c + Math.cos(a) * rHub)}
            y1={r3(c + Math.sin(a) * rHub)}
            x2={r3(c + Math.cos(a) * (rOuter - 3))}
            y2={r3(c + Math.sin(a) * (rOuter - 3))}
            strokeWidth={1}
            opacity={0.85}
          />
        );
      })}
      {/* Гол хүрд */}
      <circle cx={c} cy={c} r={rHub} strokeWidth={1.6} />
      <circle cx={c} cy={c} r={2} fill={color} stroke="none" />
    </svg>
  );
}
