"use client";

import { STICKERS } from "@/lib/types";

export default function StickerPicker({
  courseName,
  current,
  onSelect,
  onClose,
}: {
  courseName: string;
  current: string | null;
  onSelect: (stickerId: string | null) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-3xl border-[3px] border-ink bg-cream p-5 shadow-hard-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-base font-bold text-ink">Elige un sticker</h2>
            <p className="text-xs font-semibold text-ink/50">{courseName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-ink bg-[color:var(--color-paper-deep)] font-bold text-ink shadow-hard-sm transition hover:-translate-y-0.5"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3 sm:grid-cols-5">
          {STICKERS.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => onSelect(s.id)}
              title={s.label}
              className={[
                "flex aspect-square items-center justify-center rounded-2xl border-2 p-1.5 transition hover:-translate-y-0.5 hover:shadow-hard-sm",
                current === s.id ? "border-ink bg-[color:var(--color-paper-deep)] shadow-hard-sm" : "border-transparent",
              ].join(" ")}
            >
              <img src={s.src} alt={s.label} className="h-full w-full object-contain" draggable={false} />
            </button>
          ))}
        </div>

        {current && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="mt-4 w-full rounded-xl border-2 border-ink bg-cream px-3 py-2 font-display text-sm font-bold text-ink shadow-hard-sm transition hover:-translate-y-0.5"
          >
            Quitar sticker
          </button>
        )}
      </div>
    </div>
  );
}
