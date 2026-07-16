"use client";

import { useState } from "react";
import { STATUS_INFO, VisualStatus } from "@/lib/types";
import {
  Check,
  IconBoard,
  IconBook,
  IconCalendar,
  IconChart,
  IconSettings,
  Lock,
  Sparkle,
  Star,
} from "./doodles";

const STATUS_ORDER: VisualStatus[] = ["completed", "current", "available", "blocked"];

interface Slide {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  body: React.ReactNode;
}

export default function Onboarding({
  name,
  onFinish,
}: {
  name: string;
  onFinish: () => void;
}) {
  const firstName = name.trim().split(" ")[0] || name;
  const [step, setStep] = useState(0);

  const slides: Slide[] = [
    {
      icon: <Sparkle className="h-7 w-7 text-cream" />,
      iconBg: "var(--color-tangerine)",
      title: `¡Bienvenido, ${firstName}!`,
      body: (
        <p>
          <span className="font-bold">Mi Pensum</span> te ayuda a llevar el
          control visual de tu carrera: qué materias ya viste, cuáles estás
          cursando y cuáles te faltan. Te mostramos rapidito cómo funciona.
        </p>
      ),
    },
    {
      icon: <IconBoard className="h-6 w-6 text-cream" />,
      iconBg: "var(--color-cobalt)",
      title: "Tu tablero de Pensum",
      body: (
        <div className="space-y-3">
          <p>
            Cada materia es una tarjeta. Haz clic sobre ella para ir cambiando
            su estado:{" "}
            <span className="font-bold">
              disponible → este semestre → vista
            </span>
            .
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_ORDER.map((key) => {
              const info = STATUS_INFO[key];
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1.5 rounded-full border-2 border-ink px-2.5 py-1 text-[11px] font-bold shadow-hard-sm"
                  style={{ background: info.bg, color: info.text }}
                >
                  {info.label}
                </span>
              );
            })}
          </div>
          <p className="flex items-start gap-1.5 text-ink/70">
            <Lock className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
            <span>
              Una materia <span className="font-bold">bloqueada</span> significa
              que primero debes ver su prerrequisito.
            </span>
          </p>
        </div>
      ),
    },
    {
      icon: <Star className="h-6 w-6 text-cream" />,
      iconBg: "var(--color-bubblegum)",
      title: "Pega un sticker",
      body: (
        <p>
          Cuando marques una materia como <span className="font-bold">vista</span>,
          puedes pegarle un sticker de recuerdo tocando la esquina de la
          tarjeta. Elige tu pack favorito (perritos, Kirby y más) en{" "}
          <span className="font-bold">Ajustes</span>.
        </p>
      ),
    },
    {
      icon: <IconBook className="h-6 w-6 text-cream" />,
      iconBg: "var(--color-grass)",
      title: "Mis materias",
      body: (
        <p>
          Registra tus notas parciales de cada materia (descripción, nota y
          porcentaje) y la app calcula sola tu acumulado, cuánto necesitas en
          lo que falta y si ya tienes la materia asegurada.
        </p>
      ),
    },
    {
      icon: <IconChart className="h-6 w-6 text-ink" />,
      iconBg: "var(--color-tangerine)",
      title: "Estadísticas y Calendario",
      body: (
        <div className="space-y-2">
          <p className="flex items-start gap-1.5">
            <IconChart className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
            <span>
              En <span className="font-bold">Estadísticas</span> ves tus
              créditos aprobados, tu promedio semestral y acumulado.
            </span>
          </p>
          <p className="flex items-start gap-1.5">
            <IconCalendar className="mt-0.5 h-4 w-4 shrink-0 text-ink" />
            <span>
              En <span className="font-bold">Calendario</span> armas el
              horario semanal de las materias que estás cursando.
            </span>
          </p>
        </div>
      ),
    },
    {
      icon: <IconSettings className="h-6 w-6 text-cream" />,
      iconBg: "var(--color-cobalt)",
      title: "Un último paso en Ajustes",
      body: (
        <p>
          Antes de empezar, dale una vuelta a{" "}
          <span className="font-bold">Ajustes</span> para indicar tu semestre
          actual y, si ya traes materias vistas de antes, tu promedio de
          partida. Desde ahí la app calcula todo lo demás sola.
        </p>
      ),
    },
  ];

  const isLast = step === slides.length - 1;
  const slide = slides[step];

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <Star className="pointer-events-none absolute left-8 top-16 h-9 w-9 text-tangerine/70" />
      <Sparkle className="pointer-events-none absolute right-10 top-24 h-8 w-8 text-cobalt/70" />
      <Sparkle className="pointer-events-none absolute bottom-20 left-14 h-7 w-7 text-bubblegum/70" />
      <Star className="pointer-events-none absolute bottom-16 right-12 h-8 w-8 text-grass/60" />

      <div className="w-full max-w-md rounded-3xl border-[3px] border-ink bg-cream p-8 shadow-hard-lg">
        <div className="mb-5 flex items-start justify-between gap-3">
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-[2.5px] border-ink shadow-hard-sm"
            style={{ background: slide.iconBg }}
          >
            {slide.icon}
          </span>
          <button
            type="button"
            onClick={onFinish}
            className="text-xs font-bold text-ink/40 underline-offset-2 hover:text-ink/70 hover:underline"
          >
            Omitir
          </button>
        </div>

        <h1 className="font-display text-xl font-bold text-ink">{slide.title}</h1>
        <div className="mt-3 text-sm font-semibold leading-relaxed text-ink/80">
          {slide.body}
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5">
          {slides.map((_, i) => (
            <span
              key={i}
              className={[
                "h-2 rounded-full transition-all",
                i === step ? "w-6 bg-cobalt" : "w-2 bg-[color:var(--color-paper-deep)]",
              ].join(" ")}
            />
          ))}
        </div>

        <div className="mt-6 flex items-center gap-2">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              className="rounded-full border-[2.5px] border-ink bg-cream px-4 py-2.5 font-display text-sm font-bold text-ink shadow-hard-sm transition hover:-translate-y-0.5"
            >
              Atrás
            </button>
          )}
          <button
            type="button"
            onClick={() => (isLast ? onFinish() : setStep((s) => s + 1))}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border-[2.5px] border-ink bg-grass py-2.5 font-display font-bold text-cream shadow-hard transition hover:-translate-y-0.5 hover:shadow-hard-lg"
          >
            {isLast ? (
              <>
                <Check className="h-4 w-4" />
                Empezar
              </>
            ) : (
              "Siguiente"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
