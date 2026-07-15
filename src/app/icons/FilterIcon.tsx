import type { SVGProps } from "react";

/** Крохотная воронка-фильтр для инлайн-переключателя в шапке. */
export function FilterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M3 4h18l-7 8.3V19l-4 2v-8.7L3 4Z" />
    </svg>
  );
}
