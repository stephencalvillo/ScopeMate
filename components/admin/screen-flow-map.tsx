"use client";

import { useCallback, useLayoutEffect, useMemo, useRef, useState } from "react";
import { getScreenFlowLayout } from "@/lib/admin/screen-flow";
import type {
  ScreenAudience,
  ScreenCatalogEntry,
} from "@/lib/admin/screen-catalog";
import { cn } from "@/lib/utils";

type Box = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  cx: number;
  cy: number;
};

type Connector = {
  id: string;
  d: string;
  active: boolean;
};

function toBox(rect: DOMRect, origin: DOMRect): Box {
  const left = rect.left - origin.left;
  const top = rect.top - origin.top;

  return {
    left,
    right: rect.right - origin.left,
    top,
    bottom: rect.bottom - origin.top,
    cx: left + rect.width / 2,
    cy: top + rect.height / 2,
  };
}

function connectorPath(fromRect: DOMRect, toRect: DOMRect, origin: DOMRect) {
  const from = toBox(fromRect, origin);
  const to = toBox(toRect, origin);
  const sameRow = Math.abs(from.cy - to.cy) < 8;
  const targetToRight = to.left >= from.right - 4;
  const targetBelow = to.top >= from.bottom - 4;

  if (sameRow && targetToRight) {
    return `M ${from.right} ${from.cy} H ${to.left}`;
  }

  if (targetBelow && Math.abs(from.cx - to.cx) < 8) {
    return `M ${from.cx} ${from.bottom} V ${to.top}`;
  }

  if (targetBelow) {
    const railY = (from.bottom + to.top) / 2;
    const gutterX = to.left - 28;
    return `M ${from.cx} ${from.bottom} V ${railY} H ${gutterX} V ${to.cy} H ${to.left}`;
  }

  if (targetToRight) {
    const railX = (from.right + to.left) / 2;
    return `M ${from.right} ${from.cy} H ${railX} V ${to.cy} H ${to.left}`;
  }

  const railY = (Math.max(from.bottom, to.bottom) + Math.min(from.top, to.top)) / 2;
  return `M ${from.cx} ${from.bottom} V ${railY} H ${to.cx} V ${to.top}`;
}

export function ScreenFlowMap({
  audience,
  screens,
  selectedId,
  onSelect,
}: {
  audience: ScreenAudience;
  screens: ScreenCatalogEntry[];
  selectedId: string | null;
  onSelect: (screen: ScreenCatalogEntry) => void;
}) {
  const layout = useMemo(
    () => getScreenFlowLayout(audience, screens.map((screen) => screen.id)),
    [audience, screens]
  );
  const screensById = useMemo(
    () => new Map(screens.map((screen) => [screen.id, screen])),
    [screens]
  );
  const mapRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLButtonElement>());
  const [connectors, setConnectors] = useState<Connector[]>([]);

  const measure = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    const origin = map.getBoundingClientRect();
    const next = layout.edges.flatMap((edge) => {
      const fromEl = nodeRefs.current.get(edge.from);
      const toEl = nodeRefs.current.get(edge.to);
      if (!fromEl || !toEl) return [];

      return [
        {
          id: `${edge.from}-${edge.to}`,
          d: connectorPath(
            fromEl.getBoundingClientRect(),
            toEl.getBoundingClientRect(),
            origin
          ),
          active: selectedId === edge.from || selectedId === edge.to,
        },
      ];
    });

    setConnectors(next);
  }, [layout.edges, selectedId]);

  useLayoutEffect(() => {
    measure();
    const map = mapRef.current;
    if (!map) return;

    const observer = new ResizeObserver(() => measure());
    observer.observe(map);
    return () => observer.disconnect();
  }, [measure]);

  const markerId = `screen-flow-arrow-${audience}`;

  return (
    <div ref={mapRef} className="relative inline-block min-w-max">
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
        aria-hidden
      >
        <defs>
          <marker
            id={markerId}
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M 0 0.5 L 7 4 L 0 7.5 Z" fill="#a3a3a3" />
          </marker>
          <marker
            id={`${markerId}-active`}
            markerWidth="8"
            markerHeight="8"
            refX="7"
            refY="4"
            orient="auto"
            markerUnits="userSpaceOnUse"
          >
            <path d="M 0 0.5 L 7 4 L 0 7.5 Z" fill="#171717" />
          </marker>
        </defs>
        {connectors.map((connector) => (
          <path
            key={connector.id}
            d={connector.d}
            fill="none"
            stroke={connector.active ? "#171717" : "#d4d4d4"}
            strokeWidth="1.5"
            markerEnd={`url(#${connector.active ? `${markerId}-active` : markerId})`}
          />
        ))}
      </svg>

      <div
        className="inline-grid gap-x-16 gap-y-16"
        style={{
          gridTemplateColumns: `repeat(${layout.columnCount}, 11.5rem)`,
          gridTemplateRows: `repeat(${layout.rowCount}, auto)`,
        }}
      >
        {layout.nodes.map((node) => {
          const screen = screensById.get(node.screenId);
          if (!screen) return null;

          const selected = selectedId === screen.id;

          return (
            <button
              key={screen.id}
              type="button"
              ref={(element) => {
                if (element) nodeRefs.current.set(screen.id, element);
                else nodeRefs.current.delete(screen.id);
              }}
              onClick={() => onSelect(screen)}
              aria-pressed={selected}
              style={{
                gridColumn: node.column + 1,
                gridRow: node.row + 1,
              }}
              className={cn(
                "relative z-10 flex h-full w-full flex-col justify-center rounded-[8px] border bg-white px-3.5 py-3 text-left shadow-[var(--button-shadow-surface)] transition",
                "hover:border-neutral-400",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2",
                selected
                  ? "border-neutral-900 ring-2 ring-neutral-900/10"
                  : "border-[var(--border)]"
              )}
            >
              <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
                {screen.category}
              </span>
              <span className="mt-1 text-sm font-medium leading-5 text-neutral-900">
                {screen.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
