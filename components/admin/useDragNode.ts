"use client";

// Картыг хулганаар чирэх (drag) логик. Чирэх явцад preview, тавихад commit.

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import type { Point } from "@/lib/types";

interface Args {
  readonly getPosition: (id: string) => Point | undefined;
  readonly onMove: (id: string, pos: Point) => void; // preview
  readonly onCommit: (id: string, pos: Point) => void; // хадгалах
  readonly onClick?: (id: string) => void; // бараг хөдөлгөөнгүй бол сонголт
  readonly scale?: number; // томруулгын харьцаа (delta-г зөв тооцоход)
}

interface DragState {
  id: string;
  startX: number;
  startY: number;
  originX: number;
  originY: number;
  moved: boolean;
}

export function useDragNode({ getPosition, onMove, onCommit, onClick, scale = 1 }: Args) {
  const stateRef = useRef<DragState | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const onPointerDown = useCallback(
    (e: ReactPointerEvent, id: string) => {
      const origin = getPosition(id);
      if (!origin) return;
      e.preventDefault();
      e.stopPropagation(); // канвасын pan эхлэхээс сэргийлнэ (картыг чирнэ)
      stateRef.current = {
        id,
        startX: e.clientX,
        startY: e.clientY,
        originX: origin.x,
        originY: origin.y,
        moved: false,
      };
      setDraggingId(id);
    },
    [getPosition],
  );

  useEffect(() => {
    if (!draggingId) return;

    function handleMove(e: PointerEvent) {
      const s = stateRef.current;
      if (!s) return;
      const dx = (e.clientX - s.startX) / scale;
      const dy = (e.clientY - s.startY) / scale;
      if (!s.moved && Math.hypot(dx, dy) * scale < 4) return; // бага хөдөлгөөн = дарсан
      s.moved = true;
      onMove(s.id, { x: Math.round(s.originX + dx), y: Math.round(s.originY + dy) });
    }

    function handleUp() {
      const s = stateRef.current;
      stateRef.current = null;
      setDraggingId(null);
      if (!s) return;
      if (s.moved) {
        onCommit(s.id, getPosition(s.id) ?? { x: s.originX, y: s.originY });
      } else {
        onClick?.(s.id);
      }
    }

    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [draggingId, onMove, onCommit, onClick, getPosition, scale]);

  return { draggingId, onPointerDown };
}
