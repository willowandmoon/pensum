"use client";

import { useEffect, useState, RefObject, MutableRefObject } from "react";
import { Course, Status } from "@/lib/types";

// Deben coincidir con columnGap/rowGap del grid en PensumApp (px del board sin escalar).
const COLUMN_GAP = 64;
const ROW_GAP = 24;

interface Edge {
  id: string;
  from: string;
  to: string;
  kind: "prereq" | "coreq";
}

interface LinePath {
  id: string;
  d: string;
  kind: "prereq" | "coreq";
  satisfied: boolean;
  related: boolean;
}

export default function PrereqLines({
  courses,
  statuses,
  boardRef,
  cardRefs,
  hoveredCode,
  scale = 1,
}: {
  courses: Course[];
  statuses: Record<string, Status>;
  boardRef: RefObject<HTMLDivElement | null>;
  cardRefs: MutableRefObject<Map<string, HTMLButtonElement>>;
  hoveredCode: string | null;
  scale?: number;
}) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [paths, setPaths] = useState<LinePath[]>([]);

  const edges: Edge[] = [];
  for (const c of courses) {
    for (const p of c.prereqs) {
      edges.push({ id: `${p}->${c.code}`, from: p, to: c.code, kind: "prereq" });
    }
    for (const p of c.coreqs) {
      edges.push({ id: `${p}~${c.code}`, from: p, to: c.code, kind: "coreq" });
    }
  }

  useEffect(() => {
    const board = boardRef.current;
    if (!board) return;

    function recompute() {
      const boardEl = boardRef.current;
      if (!boardEl) return;
      const boardRect = boardEl.getBoundingClientRect();
      setSize({ width: boardEl.scrollWidth, height: boardEl.scrollHeight });

      const next: LinePath[] = [];
      for (const edge of edges) {
        const fromEl = cardRefs.current.get(edge.from);
        const toEl = cardRefs.current.get(edge.to);
        if (!fromEl || !toEl) continue;
        const fr = fromEl.getBoundingClientRect();
        const tr = toEl.getBoundingClientRect();
        // getBoundingClientRect devuelve px de pantalla (escalados). Se dividen
        // por la escala para volver al sistema de coordenadas del board (SVG).
        const s = scale || 1;
        const px = (v: number) => (v - boardRect.left) / s;
        const py = (v: number) => (v - boardRect.top) / s;
        const cardW = fr.width / s;
        const fromCx = px(fr.left + fr.width / 2);
        const toCx = px(tr.left + tr.width / 2);
        const sameColumn = Math.abs(fromCx - toCx) < cardW * 0.6;
        const yc1 = py(fr.top + fr.height / 2);
        const yc2 = py(tr.top + tr.height / 2);
        const sameRow = Math.abs(yc1 - yc2) < 2;
        // ¿Hay al menos una columna de por medio? Si es así, un tramo horizontal
        // a la altura de una fila atravesaría esa columna intermedia. Se detecta
        // comparando la distancia entre centros contra el "paso" de una columna.
        const colPitch = cardW + COLUMN_GAP;
        const colsBetween = colPitch > 0 ? Math.round(Math.abs(toCx - fromCx) / colPitch) - 1 : 0;
        const hasInterveningColumn = colsBetween > 0;

        let d: string;
        if (sameColumn) {
          // Materias apiladas en la misma columna: conector vertical recto.
          const fromAbove = fr.top < tr.top;
          const y1 = py(fromAbove ? fr.bottom : fr.top);
          const y2 = py(fromAbove ? tr.top : tr.bottom);
          d = `M ${fromCx} ${y1} L ${fromCx} ${y2}`;
        } else if (!hasInterveningColumn && sameRow) {
          // Columnas vecinas, misma fila: línea horizontal recta de borde a borde.
          const fromLeft = fromCx < toCx;
          const x1 = px(fromLeft ? fr.right : fr.left);
          const x2 = px(fromLeft ? tr.left : tr.right);
          d = `M ${x1} ${yc1} L ${x2} ${yc2}`;
        } else if (!hasInterveningColumn) {
          // Columnas vecinas, distinta fila: un solo giro dentro del pasillo
          // entre columnas (no hay ninguna tarjeta de por medio que tapar).
          const fromLeft = fromCx < toCx;
          const x1 = px(fromLeft ? fr.right : fr.left);
          const x2 = px(fromLeft ? tr.left : tr.right);
          const channel = fromLeft ? x2 - COLUMN_GAP / 2 : x2 + COLUMN_GAP / 2;
          d = `M ${x1} ${yc1} L ${channel} ${yc1} L ${channel} ${yc2} L ${x2} ${yc2}`;
        } else {
          // Hay columnas de por medio: el tramo horizontal viaja por el pasillo
          // vacío entre filas (nunca por el centro de una fila), y el tramo
          // vertical largo viaja por el pasillo vacío entre columnas. Así la
          // línea nunca cruza por encima de otra materia.
          const fromLeft = fromCx < toCx;
          const x1 = px(fromLeft ? fr.right : fr.left);
          const x2 = px(fromLeft ? tr.left : tr.right);
          const channel = fromLeft ? x2 - COLUMN_GAP / 2 : x2 + COLUMN_GAP / 2;
          const goingDown = yc2 > yc1;
          const rowGapY = goingDown
            ? py(fr.bottom) + ROW_GAP / 2
            : py(fr.top) - ROW_GAP / 2;
          d = `M ${x1} ${yc1} L ${x1} ${rowGapY} L ${channel} ${rowGapY} L ${channel} ${yc2} L ${x2} ${yc2}`;
        }
        const related =
          hoveredCode !== null && (edge.from === hoveredCode || edge.to === hoveredCode);
        next.push({
          id: edge.id,
          d,
          kind: edge.kind,
          satisfied: statuses[edge.from] === "completed",
          related,
        });
      }
      setPaths(next);
    }

    recompute();
    const raf = requestAnimationFrame(recompute);
    const ro = new ResizeObserver(recompute);
    ro.observe(board);
    window.addEventListener("resize", recompute);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", recompute);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courses, statuses, hoveredCode, boardRef, cardRefs, scale]);

  const anyHovered = hoveredCode !== null;

  return (
    <svg
      className="pointer-events-none absolute left-0 top-0"
      width={size.width}
      height={size.height}
      style={{ overflow: "visible" }}
    >
      <defs>
        <marker
          id="arrow-faint"
          viewBox="0 0 10 10"
          refX="7.5"
          refY="5"
          markerWidth="4"
          markerHeight="4"
          orient="auto-start-reverse"
        >
          <path d="M1,1.5 L8,5 L1,8.5 z" fill="#cbd5e1" />
        </marker>
        <marker
          id="arrow-dark"
          viewBox="0 0 10 10"
          refX="7.5"
          refY="5"
          markerWidth="4.5"
          markerHeight="4.5"
          orient="auto-start-reverse"
        >
          <path d="M1,1.5 L8,5 L1,8.5 z" fill="#1f2937" />
        </marker>
      </defs>
      {/* Todas las líneas se ven tenues; al pasar sobre una materia, las suyas
          se vuelven oscuras y el resto se atenúa aún más. */}
      {paths.map((p) => {
        const isCoreq = p.kind === "coreq";
        const dash = isCoreq ? "5 4" : undefined;
        if (p.related) {
          return (
            <path
              key={p.id}
              d={p.d}
              fill="none"
              stroke="#1f2937"
              strokeWidth={2}
              strokeDasharray={dash}
              markerEnd={isCoreq ? undefined : "url(#arrow-dark)"}
            />
          );
        }
        return (
          <path
            key={p.id}
            d={p.d}
            fill="none"
            stroke={p.satisfied ? "#86efac" : "#cbd5e1"}
            strokeWidth={1.5}
            strokeDasharray={dash}
            opacity={anyHovered ? 0.08 : 0.3}
            markerEnd={isCoreq ? undefined : "url(#arrow-faint)"}
          />
        );
      })}
    </svg>
  );
}
