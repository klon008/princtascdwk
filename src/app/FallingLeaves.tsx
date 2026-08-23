import { useMemo, type CSSProperties } from "react";
import { srng } from "./utils";

const COLORS = ["#C45A1A", "#D4781F", "#B83A12", "#E8A33A", "#8B2E12", "#C98A28", "#A34B18"];

type LeafKind = 0 | 1 | 2;

function LeafShape({ kind, fill }: { kind: LeafKind; fill: string }) {
  if (kind === 1) {
    return (
      <svg viewBox="0 0 24 32" width="100%" height="100%" aria-hidden>
        <path
          fill={fill}
          d="M12 1C11 7 7.5 10 3 11c4 2.2 6.2 5.5 5.2 11.2C10.4 19.6 11.4 18.5 12 22c.6-3.5 1.6-2.4 3.8-0C14.8 16.5 17 13.2 21 11c-4.5-1-8-4-9-10z"
        />
        <path fill="none" stroke="rgba(40,16,4,0.35)" strokeWidth="0.8" d="M12 4v18" />
      </svg>
    );
  }
  if (kind === 2) {
    return (
      <svg viewBox="0 0 28 28" width="100%" height="100%" aria-hidden>
        <ellipse cx="14" cy="16" rx="9" ry="10" fill={fill} transform="rotate(-18 14 16)" />
        <path fill="none" stroke="rgba(40,16,4,0.35)" strokeWidth="0.8" d="M14 5v18M14 14c-3 1-5 4-6 8M14 14c3 1 5 4 6 8" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 32 32" width="100%" height="100%" aria-hidden>
      <path
        fill={fill}
        d="M16 2c.5 3.2-1.6 5.6-4.8 7.2C7.6 10.8 4 10.4 2 8.6c2.4 3.6 3.4 7.2 1 11.2 3.2-1.6 6.2-1.2 8.4 1.8-2 1.8-2.8 4.6-1.8 7.6 2.6-2 4.8-1.2 6.4 1.8 1.6-3 3.8-3.8 6.4-1.8 1-3 .2-5.8-1.8-7.6 2.2-3 5.2-3.4 8.4-1.8-2.4-4-1.4-7.6 1-11.2-2 1.8-5.6 2.2-9.2.6C17.6 7.6 15.5 5.2 16 2z"
      />
    </svg>
  );
}

/** Падающая листва: над фоном, под шапкой/сеткой/модалкой (z-index 1 vs 10). */
export function FallingLeaves() {
  const leaves = useMemo(
    () =>
      Array.from({ length: 22 }, (_, i) => {
        const size = 14 + srng(i * 11) * 18;
        const drift = (srng(i * 11 + 1) * 2 - 1) * 28;
        const sway = 18 + srng(i * 11 + 2) * 28;
        return {
          left: `${srng(i * 11 + 3) * 100}%`,
          size,
          delay: `-${srng(i * 11 + 4) * 18}s`,
          duration: `${10 + srng(i * 11 + 5) * 12}s`,
          swayDuration: `${2.4 + srng(i * 11 + 6) * 2.2}s`,
          color: COLORS[Math.floor(srng(i * 11 + 7) * COLORS.length)]!,
          kind: (Math.floor(srng(i * 11 + 8) * 3) as LeafKind),
          opacity: 0.38 + srng(i * 11 + 9) * 0.42,
          drift: `${drift}vw`,
          sway: `${srng(i * 11 + 10) > 0.5 ? sway : -sway}px`,
          spin: `${(srng(i * 11 + 1) > 0.5 ? 1 : -1) * (220 + srng(i * 11 + 2) * 280)}deg`,
        };
      }),
    [],
  );

  return (
    <div className="falling-leaves" aria-hidden>
      {leaves.map((leaf, i) => (
        <span
          key={i}
          className="falling-leaf"
          style={
            {
              left: leaf.left,
              width: leaf.size,
              height: leaf.size * 1.15,
              opacity: leaf.opacity,
              animationDelay: leaf.delay,
              animationDuration: leaf.duration,
              "--drift": leaf.drift,
              "--spin": leaf.spin,
            } as CSSProperties
          }
        >
          <span
            className="falling-leaf-inner"
            style={
              {
                animationDelay: leaf.delay,
                animationDuration: leaf.swayDuration,
                "--sway": leaf.sway,
              } as CSSProperties
            }
          >
            <LeafShape kind={leaf.kind} fill={leaf.color} />
          </span>
        </span>
      ))}
    </div>
  );
}
