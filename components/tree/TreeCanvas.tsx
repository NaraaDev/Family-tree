"use client";

// Уншихад зориулсан модны дэлгэц — pan/zoom хүрээ дотор холбоос + бүх карт.

import type { FamilyTree } from "@/lib/types";
import { listPersons } from "@/lib/tree";
import { treeBounds } from "@/lib/layout";
import { Connections } from "./Connections";
import { PersonCard } from "./PersonCard";
import { ViewportStage } from "./ViewportStage";

interface Props {
  readonly tree: FamilyTree;
  readonly onSelect?: (id: string) => void;
  readonly selectedId?: string;
}

export function TreeCanvas({ tree, onSelect, selectedId }: Props) {
  const { width, height } = treeBounds(tree);

  return (
    <ViewportStage width={width} height={height}>
      {() => (
        <>
          <Connections tree={tree} width={width} height={height} />
          {listPersons(tree).map((p) => (
            <PersonCard key={p.id} person={p} selected={p.id === selectedId} onSelect={onSelect} />
          ))}
        </>
      )}
    </ViewportStage>
  );
}
