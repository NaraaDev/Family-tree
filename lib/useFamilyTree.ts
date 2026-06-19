"use client";

// Ургийн модыг серверээс (/api/tree) ачаалж, өөрчлөлтийг серверт хадгалдаг hook.
// Бүх хэрэглэгч нэг модыг хуваалцана. Хадгалалтыг debounce хийж серверийн
// ачааллыг бууруулна; хуудас хаагдахад сүүлийн өөрчлөлтийг beacon-оор илгээнэ.

import { useCallback, useEffect, useRef, useState } from "react";
import type { FamilyTree } from "./types";
import { beaconTree, fetchTree, putTree } from "./treeClient";
import { sampleTree } from "./sampleData";

const SAVE_DELAY = 700; // мс — бичих хооронд хүлээх зай
const RETRY_DELAY = 4000; // мс — алдааны дараа дахин оролдох зай

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface State {
  readonly tree: FamilyTree | null;
  readonly ready: boolean;
}

interface UseFamilyTree {
  readonly tree: FamilyTree | null;
  readonly ready: boolean;
  /** Шинэ модыг тавьж, серверт (debounce-той) хадгална. */
  readonly commit: (next: FamilyTree) => void;
  /** Хадгалахгүйгээр зөвхөн харагдацыг солих (drag завсар). */
  readonly preview: (next: FamilyTree) => void;
  /** Серверт хадгалалтын төлөв. */
  readonly status: SaveStatus;
}

const INITIAL: State = { tree: null, ready: false };

export function useFamilyTree(): UseFamilyTree {
  const [state, setState] = useState<State>(INITIAL);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const pendingRef = useRef<FamilyTree | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const flushRef = useRef<() => void>(() => {});

  // Эхний ачаалал — серверээс татна. Алдаа гарвал жишээ модоор эхэлнэ.
  useEffect(() => {
    let alive = true;
    fetchTree()
      .then((t) => {
        if (alive) setState({ tree: t ?? sampleTree(), ready: true });
      })
      .catch((err) => {
        console.error("Ургийн мод ачаалахад алдаа:", err);
        if (alive) setState({ tree: sampleTree(), ready: true });
      });
    return () => {
      alive = false;
    };
  }, []);

  // Хүлээгдэж буй өөрчлөлтийг серверт бичих.
  const flush = useCallback(async () => {
    const next = pendingRef.current;
    if (!next) return;
    pendingRef.current = null;
    setStatus("saving");
    try {
      await putTree(next);
      setStatus("saved");
    } catch (err) {
      console.error("Хадгалах алдаа:", err);
      pendingRef.current = next; // дараагийн оролдлогод үлдээнэ
      setStatus("error");
      // Шинэ өөрчлөлт ороогүй ч хэсэг хугацааны дараа дахин оролдоно.
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => flushRef.current(), RETRY_DELAY);
    }
  }, []);

  // flush-ийг ref-д хадгална (setTimeout дотроос дуудахад тогтвортой ишлэл).
  useEffect(() => {
    flushRef.current = () => void flush();
  }, [flush]);

  const commit = useCallback(
    (next: FamilyTree) => {
      setState({ tree: next, ready: true });
      pendingRef.current = next;
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => flushRef.current(), SAVE_DELAY);
    },
    [],
  );

  const preview = useCallback((next: FamilyTree) => {
    setState((prev) => ({ tree: next, ready: prev.ready }));
  }, []);

  // Хуудас хаагдахад хадгалаагүй өөрчлөлтийг best-effort илгээнэ.
  useEffect(() => {
    const onLeave = () => {
      if (pendingRef.current) beaconTree(pendingRef.current);
    };
    window.addEventListener("pagehide", onLeave);
    return () => {
      window.removeEventListener("pagehide", onLeave);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { tree: state.tree, ready: state.ready, commit, preview, status };
}
