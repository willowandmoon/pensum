import type { SVGProps } from "react";

/** destello de 4 puntas */
export function Sparkle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 1.5c.7 4.6 2.9 6.8 9 8.5-6.1 1.7-8.3 3.9-9 12-0.7-8.1-2.9-10.3-9-12 6.1-1.7 8.3-3.9 9-8.5Z"
        fill="currentColor"
        stroke="var(--color-ink)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** estrella de 5 puntas, ligeramente irregular */
export function Star(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 2.5l2.7 6 6.6.5-5 4.3 1.6 6.4L12 16.9 6.1 19.7l1.6-6.4-5-4.3 6.6-.5L12 2.5Z"
        fill="currentColor"
        stroke="var(--color-ink)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** check hecho a mano */
export function Check(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 13.5c2 .3 4 2 5.5 4.5C12 12 15.5 6.5 20.5 4"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** candado dibujado a mano */
export function Lock(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <rect
        x="4.5"
        y="10.5"
        width="15"
        height="10.5"
        rx="2.5"
        fill="currentColor"
        stroke="var(--color-ink)"
        strokeWidth="1.6"
      />
      <path
        d="M7.5 10.5V8a4.5 4.5 0 0 1 9 0v2.5"
        stroke="var(--color-ink)"
        strokeWidth="1.8"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="12" cy="15" r="1.6" fill="var(--color-ink)" />
    </svg>
  );
}

/** subrayado ondulado tipo marcador */
export function Squiggle(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 120 12" fill="none" aria-hidden="true" {...props}>
      <path
        d="M2 7c8-6 16 5 24 0s16-6 24 0 16 5 24 0 16-6 24 0 16 5 20 3"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** garabato enrollado (decoración de margen) */
export function Loop(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 100 60" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 40c10-30 30-30 34-8s-16 30-22 12 8-40 34-34 30 34 42 20"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/** triangulito de confeti */
export function Confetti(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M12 3l8 16-16 2 8-18Z"
        fill="currentColor"
        stroke="var(--color-ink)"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}
