"use client";

// Газрын зураг шиг харагдац — чирч шилжүүлэх (pan), хүрд/товчоор томруулах (zoom),
// бүх агуулгыг дэлгэцэнд автоматаар багтаах (fit). Scroll-ийн оронд ашиглана.

import { useCallback, useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, WheelEvent as ReactWheelEvent } from "react";

const MIN = 0.25;
const MAX = 2.2;
const PAD = 0.9; // fit хийхэд үлдээх захын зай

export interface Viewport {
  readonly scale: number;
  readonly tx: number;
  readonly ty: number;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), hi);
}

export function useViewport(contentW: number, contentH: number) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [vp, setVp] = useState<Viewport>({ scale: 1, tx: 0, ty: 0 });
  const [panning, setPanning] = useState(false);
  const touchedRef = useRef(false);
  const panRef = useRef<{ x: number; y: number; tx: number; ty: number } | null>(null);

  // Бүгдийг багтаах (тойм) — товчинд.
  const fit = useCallback(() => {
    const el = containerRef.current;
    if (!el || contentW <= 0 || contentH <= 0) return;
    const cw = el.clientWidth;
    const ch = el.clientHeight;
    const scale = clamp(Math.min(cw / contentW, ch / contentH) * PAD, MIN, MAX);
    setVp({
      scale,
      tx: (cw - contentW * scale) / 2,
      ty: Math.max(24, (ch - contentH * scale) / 2),
    });
  }, [contentW, contentH]);

  // Анхдагч харагдац — уншихад тохиромжтой хэмжээ, орой талаас. Хэт жижгэрэхгүй.
  const home = useCallback(() => {
    const el = containerRef.current;
    if (!el || contentW <= 0 || contentH <= 0) return;
    const cw = el.clientWidth;
    const ch = el.clientHeight;
    const fitScale = Math.min(cw / contentW, ch / contentH);
    const scale = clamp(Math.max(fitScale, 0.9), MIN, MAX);
    setVp({
      scale,
      tx: (cw - contentW * scale) / 2,
      ty: contentH * scale <= ch ? (ch - contentH * scale) / 2 : 28,
    });
  }, [contentW, contentH]);

  // Анх ачаалах ба агуулгын хэмжээ өөрчлөгдөхөд (хэрэглэгч хараахан хүрээгүй бол).
  useEffect(() => {
    if (!touchedRef.current) home();
  }, [home]);

  const zoomBy = useCallback((factor: number, px: number, py: number) => {
    touchedRef.current = true;
    setVp((prev) => {
      const next = clamp(prev.scale * factor, MIN, MAX);
      return {
        scale: next,
        tx: px - ((px - prev.tx) / prev.scale) * next,
        ty: py - ((py - prev.ty) / prev.scale) * next,
      };
    });
  }, []);

  const onWheel = useCallback(
    (e: ReactWheelEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      zoomBy(e.deltaY < 0 ? 1.12 : 0.89, e.clientX - rect.left, e.clientY - rect.top);
    },
    [zoomBy],
  );

  const zoomIn = useCallback(() => {
    const el = containerRef.current;
    if (el) zoomBy(1.2, el.clientWidth / 2, el.clientHeight / 2);
  }, [zoomBy]);

  const zoomOut = useCallback(() => {
    const el = containerRef.current;
    if (el) zoomBy(1 / 1.2, el.clientWidth / 2, el.clientHeight / 2);
  }, [zoomBy]);

  const onPanStart = useCallback((e: ReactPointerEvent) => {
    touchedRef.current = true;
    setPanning(true);
    setVp((prev) => {
      panRef.current = { x: e.clientX, y: e.clientY, tx: prev.tx, ty: prev.ty };
      return prev;
    });
  }, []);

  useEffect(() => {
    function move(e: PointerEvent) {
      const p = panRef.current;
      if (!p) return;
      setVp((prev) => ({ ...prev, tx: p.tx + (e.clientX - p.x), ty: p.ty + (e.clientY - p.y) }));
    }
    function up() {
      if (panRef.current) {
        panRef.current = null;
        setPanning(false);
      }
    }
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
  }, []);

  return { containerRef, vp, fit, home, zoomIn, zoomOut, onWheel, onPanStart, panning };
}
