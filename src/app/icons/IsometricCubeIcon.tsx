import type { SVGProps } from "react";

/**
 * Segmented isometric cube (flat faces + negative-space gaps).
 * Color via currentColor for toggle on/off/hover states.
 */
export function IsometricCubeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 30 28"
      width="30"
      height="28"
      fill="currentColor"
      aria-hidden
      {...props}
    >
      {/* Top face */}
      <path d="M15 1.6 25.6 7.5 15 13.4 4.4 7.5Z" />
      {/* Left face — gap under top + gap before right */}
      <path d="M4.7 9.2 13.9 14.4 13.9 25.6 4.7 20.4Z" />
      {/* Right face */}
      <path d="M25.3 9.2 16.1 14.4 16.1 25.6 25.3 20.4Z" />
    </svg>
  );
}
