"use client";

import PensumApp from "@/components/PensumApp";
import { AREA_INFO, AREA_ORDER } from "@/lib/types";

export default function Page() {
  return (
    <div className="mx-auto w-full max-w-[1700px] px-4 py-6 sm:px-6 sm:py-7 lg:px-8">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold text-ink">Pensum</h1>
          <p className="text-xs font-semibold text-ink/60">
            Ingeniería Informática · Plan 8210
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {AREA_ORDER.map((key, i) => {
            const info = AREA_INFO[key];
            return (
              <span
                key={key}
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-2.5 py-1 text-[11px] font-bold shadow-hard-sm"
                style={{
                  background: info.bg,
                  color: info.text,
                  transform: `rotate(${i % 2 === 0 ? -1.5 : 1.5}deg)`,
                }}
              >
                <span
                  className="h-2 w-2 rounded-full border border-ink"
                  style={{ background: info.text }}
                />
                {info.label}
              </span>
            );
          })}
        </div>
      </div>
      <PensumApp />
    </div>
  );
}
