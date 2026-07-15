import type { SVGProps } from "react";

/** Треугольник для переключателя сортировки; переворачивается для обратного порядка. */
export function SortTriangleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 12 12" fill="currentColor" aria-hidden {...props}>
      <path d="M2 4h8l-4 5.5L2 4Z" />
    </svg>
  );
}
