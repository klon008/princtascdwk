import type { RarityKey } from "../types";
import { CFG } from "../rarityConfig";
import { CardSVG } from "./CardSVG";
import { getCatalogEntry, CATALOG_ORDER } from "@/lib/cardCatalog";

const fallbackPortrait = getCatalogEntry(CATALOG_ORDER[0])!.portrait;

export function CardTile({ princess, rarity, idx, tileRef, portrait, onClick }: {
  princess: string;
  rarity: RarityKey;
  idx: number;
  tileRef: (el: HTMLDivElement | null) => void;
  portrait?: string;
  onClick: () => void;
}) {
  const cfg = CFG[rarity];
  return (
    // Outer div: only handles the entry animation (opacity+translateY)
    // It must NOT be the tilt target — otherwise animation fill-mode blocks inline style.transform
    <div className="card-enter" style={{ animationDelay: `${idx * 0.04}s` }}>
    <div className="card-tilt-scene">
    <div
      ref={tileRef}
      className="card-tilt-target flex flex-col items-center gap-2"
      style={{ position: "relative", cursor: "pointer" }}
      onClick={onClick}
    >
      {/* Glow halo */}
      {cfg.glowStr > 0 && (
        <div className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 40%, ${cfg.glowCol}28, transparent 70%)`,
            filter: `blur(${cfg.glowStr * 0.7}px)`,
          }}
        />
      )}

      {/* Card art */}
      <div className="card-art" style={{
        width: "100%",
        aspectRatio: "5/7",
        filter: cfg.glowStr > 0
          ? `drop-shadow(0 0 ${Math.round(cfg.glowStr * 0.4)}px ${cfg.glowCol}65)`
          : "drop-shadow(0 6px 18px rgba(0,0,0,0.75))",
      }}>
        <CardSVG rarity={rarity} portrait={portrait ?? fallbackPortrait} princessName={princess} />
      </div>

      {/* Rarity badge */}
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: cfg.color, boxShadow: `0 0 5px ${cfg.color}` }} />
          <span className="type-label type-label--tile" style={{ color: cfg.color }}>
            {cfg.name}
          </span>
        </div>
        <span className="type-tier" style={{ color: cfg.color, opacity: 0.5 }}>
          {cfg.tier}
        </span>
      </div>
    </div>
    </div>
    </div>
  );
}
