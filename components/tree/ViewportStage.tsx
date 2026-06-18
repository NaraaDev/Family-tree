"use client";

// Pan/zoom хүрээ — доторх "тайз"-ыг газрын зураг шиг чирч, томруулж харна.
// Зураг доторх контролууд: томруулах, жижигрүүлэх, бүгдийг багтаах.

import type { ReactNode } from "react";
import { useViewport } from "@/lib/useViewport";

interface Props {
  readonly width: number;
  readonly height: number;
  /** scale-ийг хүлээн авч тайзны агуулгыг буцаана (drag нь scale-аас хамаарна). */
  readonly children: (scale: number) => ReactNode;
}

function CtrlButton({ label, title, onClick }: { label: string; title: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      className="flex h-9 w-9 items-center justify-center rounded-md border border-ink/40 bg-lac text-gold-hi shadow-md transition-colors hover:bg-lac-hi"
    >
      {label}
    </button>
  );
}

export function ViewportStage({ width, height, children }: Props) {
  const { containerRef, vp, fit, home, zoomIn, zoomOut, onWheel, onPanStart, panning } = useViewport(width, height);

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        ref={containerRef}
        onWheel={onWheel}
        onPointerDown={onPanStart}
        className="h-full w-full touch-none"
        style={{ cursor: panning ? "grabbing" : "grab" }}
      >
        <div
          data-bg
          style={{
            width,
            height,
            transform: `translate(${vp.tx}px, ${vp.ty}px) scale(${vp.scale})`,
            transformOrigin: "0 0",
          }}
          className="relative"
        >
          {children(vp.scale)}
        </div>
      </div>

      {/* Контролууд */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2">
        <CtrlButton label="＋" title="Томруулах" onClick={zoomIn} />
        <CtrlButton label="－" title="Жижигрүүлэх" onClick={zoomOut} />
        <CtrlButton label="⌂" title="Анхдагч хэмжээ" onClick={home} />
        <CtrlButton label="⤢" title="Бүгдийг харах" onClick={fit} />
      </div>
    </div>
  );
}
