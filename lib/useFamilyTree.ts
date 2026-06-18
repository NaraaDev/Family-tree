"use client";

// Ургийн модыг localStorage-оос ачаалж, өөрчлөлтийг хадгалдаг hook.

import { useCallback, useEffect, useState } from "react";
import type { FamilyTree } from "./types";
import { loadTree, saveTree } from "./storage";
import { sampleTree } from "./sampleData";

interface State {
  readonly tree: FamilyTree | null;
  readonly ready: boolean;
}

interface UseFamilyTree {
  readonly tree: FamilyTree | null;
  readonly ready: boolean;
  /** Шинэ модыг тавьж, мөн localStorage-д хадгална. */
  readonly commit: (next: FamilyTree) => void;
  /** Хадгалахгүйгээр зөвхөн харагдацыг солих (drag завсар). */
  readonly preview: (next: FamilyTree) => void;
}

const INITIAL: State = { tree: null, ready: false };

export function useFamilyTree(): UseFamilyTree {
  const [state, setState] = useState<State>(INITIAL);

  // localStorage нь зөвхөн client дээр байдаг тул эхний ачаалалтыг
  // mount дээр хийнэ (SSR-ийн hydration зөрүүнээс сэргийлж байна).
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- нэг удаагийн client hydration
    setState({ tree: loadTree() ?? sampleTree(), ready: true });
  }, []);

  const commit = useCallback((next: FamilyTree) => {
    setState({ tree: next, ready: true });
    saveTree(next);
  }, []);

  const preview = useCallback((next: FamilyTree) => {
    setState((prev) => ({ tree: next, ready: prev.ready }));
  }, []);

  return { tree: state.tree, ready: state.ready, commit, preview };
}
