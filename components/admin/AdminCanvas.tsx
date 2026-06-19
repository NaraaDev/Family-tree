"use client";

// Засварлах канвас — pan/zoom хүрээ дотор картыг чирч байрлуулна.

import { useCallback } from "react";
import type { FamilyTree, Point } from "@/lib/types";
import { listPersons } from "@/lib/tree";
import { treeBounds } from "@/lib/layout";
import { Connections } from "@/components/tree/Connections";
import { PersonCard } from "@/components/tree/PersonCard";
import { ViewportStage } from "@/components/tree/ViewportStage";
import { useDragNode } from "./useDragNode";

interface Props {
  readonly tree: FamilyTree;
  readonly selectedId?: string;
  readonly onSelect: (id: string) => void;
  readonly onPreviewMove: (id: string, pos: Point) => void;
  readonly onCommitMove: (id: string, pos: Point) => void;
}

export function AdminCanvas({ tree, selectedId, onSelect, onPreviewMove, onCommitMove }: Props) {
  const { width, height } = treeBounds(tree);
  const getPosition = useCallback((id: string) => tree.persons[id]?.position, [tree]);

  return (
    <ViewportStage width={width} height={height}>
      {(scale) => <Stage
        tree={tree}
        width={width}
        height={height}
        scale={scale}
        selectedId={selectedId}
        onSelect={onSelect}
        onPreviewMove={onPreviewMove}
        onCommitMove={onCommitMove}
        getPosition={getPosition}
      />}
    </ViewportStage>
  );
}

interface StageProps extends Props {
  readonly width: number;
  readonly height: number;
  readonly scale: number;
  readonly getPosition: (id: string) => Point | undefined;
}

function Stage({
  tree,
  width,
  height,
  scale,
  selectedId,
  onSelect,
  onPreviewMove,
  onCommitMove,
  getPosition,
}: StageProps) {
  const { draggingId, onPointerDown } = useDragNode({
    getPosition,
    onMove: onPreviewMove,
    onCommit: onCommitMove,
    onClick: onSelect,
    scale,
  });

  return (
    <>
      <Connections tree={tree} width={width} height={height} />
      {listPersons(tree).map((p) => (
        <PersonCard
          key={p.id}
          person={p}
          draggable
          selected={p.id === selectedId || p.id === draggingId}
          onPointerDown={onPointerDown}
        />
      ))}
    </>
  );
}
