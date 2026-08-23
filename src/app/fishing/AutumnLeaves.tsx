import { useMemo, type CSSProperties } from "react";
import { srng } from "../utils";
import mapleRed from "@/assets/fishing/leaves/maple-red.png";
import mapleGold from "@/assets/fishing/leaves/maple-gold.png";
import oak from "@/assets/fishing/leaves/oak.png";
import aspen from "@/assets/fishing/leaves/aspen.png";

const SPRITES = [mapleRed, mapleGold, oak, aspen] as const;

/** Фото-листья для рыбалки: текстуры с прожилками и 3D-порхание, не мультяшные SVG альбома. */
export function AutumnLeaves() {
  const leaves = useMemo(
    () =>
      Array.from({ length: 18 }, (_, i) => {
        const size = 38 + srng(i * 17) * 36;
        const drift = (srng(i * 17 + 1) * 2 - 1) * 16;
        const sway = 12 + srng(i * 17 + 2) * 20;
        return {
          id: `al${i}`,
          src: SPRITES[Math.floor(srng(i * 17 + 8) * SPRITES.length)]!,
          left: `${srng(i * 17 + 3) * 100}%`,
          size,
          delay: `-${srng(i * 17 + 4) * 24}s`,
          duration: `${16 + srng(i * 17 + 5) * 14}s`,
          tumbleDuration: `${5 + srng(i * 17 + 6) * 4.5}s`,
          opacity: 0.62 + srng(i * 17 + 9) * 0.34,
          drift: `${drift}vw`,
          sway: `${srng(i * 17 + 10) > 0.5 ? sway : -sway}px`,
          blur: srng(i * 17 + 11) > 0.78 ? 0.45 : 0,
          rotate: `${(srng(i * 17 + 7) * 2 - 1) * 40}deg`,
        };
      }),
    [],
  );

  return (
    <div className="autumn-leaves" aria-hidden>
      {leaves.map((leaf) => (
        <span
          key={leaf.id}
          className="autumn-leaf"
          style={
            {
              left: leaf.left,
              width: leaf.size,
              height: leaf.size * 1.2,
              opacity: leaf.opacity,
              animationDelay: leaf.delay,
              animationDuration: leaf.duration,
              filter: leaf.blur
                ? `blur(${leaf.blur}px) drop-shadow(0 3px 2px rgba(12,6,0,0.4))`
                : undefined,
              "--drift": leaf.drift,
            } as CSSProperties
          }
        >
          <span
            className="autumn-leaf-tumble"
            style={
              {
                animationDelay: leaf.delay,
                animationDuration: leaf.tumbleDuration,
                "--sway": leaf.sway,
              } as CSSProperties
            }
          >
            <img
              src={leaf.src}
              alt=""
              draggable={false}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "contain",
                transform: `rotate(${leaf.rotate})`,
              }}
            />
          </span>
        </span>
      ))}
    </div>
  );
}
