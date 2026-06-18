// Удмын холбоос (SVG давхарга). Эцэг эх→хүүхэд: алтан тахир шугам, залгаасан дээр зангилаа.
// Гэр бүл: хосын дунд улзий зангилаа (мөнхийн холбоо).

import type { FamilyTree } from "@/lib/types";
import { buildConnectors } from "@/lib/layout";

interface Props {
  readonly tree: FamilyTree;
  readonly width: number;
  readonly height: number;
}

function UlziiKnot({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x}, ${y})`}>
      <circle r={10} fill="var(--felt)" stroke="var(--gold)" strokeWidth={1.2} />
      <g
        transform="scale(0.5) translate(-16,-16)"
        fill="none"
        stroke="var(--gold-dim)"
        strokeWidth={2.4}
        strokeLinecap="round"
      >
        <rect x={11} y={11} width={10} height={10} rx={1.5} />
        <path d="M16 8v16M8 16h16" />
        <path d="M11 16h-3a2 2 0 0 0 0 4h3m6-9V8a2 2 0 0 1 4 0v3m0 10v3a2 2 0 0 1-4 0v-3" />
      </g>
    </g>
  );
}

export function Connections({ tree, width, height }: Props) {
  const connectors = buildConnectors(tree);

  return (
    <svg
      width={width}
      height={height}
      className="pointer-events-none absolute left-0 top-0"
      aria-hidden="true"
    >
      {connectors.map((c) =>
        c.kind === "parent" ? (
          <g key={c.key}>
            <path
              d={c.path}
              fill="none"
              stroke="var(--gold)"
              strokeWidth={1.8}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          </g>
        ) : (
          <g key={c.key}>
            <path d={c.path} fill="none" stroke="var(--gold)" strokeWidth={1.8} />
            <UlziiKnot x={c.mid.x} y={c.mid.y} />
          </g>
        ),
      )}
    </svg>
  );
}
