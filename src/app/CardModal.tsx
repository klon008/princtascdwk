import { useEffect, useRef, useState, type MouseEvent } from "react";
import { motion } from "motion/react";
import { CATALOG_ORDER, getCatalogEntry } from "@/lib/cardCatalog";
import { seriesCardNumber } from "@/lib/seriesMeta";
import type { CardDef } from "./types";
import { CFG } from "./rarityConfig";
import { getCardDetails } from "./cardDetails";
import { cardTiltTransform } from "./utils";
import { CardSVG } from "./cards/CardSVG";
import { Card3DViewer } from "./cards/Card3DViewer";
import { IsometricCubeIcon } from "./icons/IsometricCubeIcon";
import { resolveCardBack } from "@/lib/cardBacks";

const fallbackPortrait = getCatalogEntry(CATALOG_ORDER[0])!.portrait;

export function CardModal({ card, onClose }: { card: CardDef; onClose: () => void }) {
  const cfg = CFG[card.rarity];
  const details = getCardDetails(card.slug);
  const portrait = card.portrait ?? fallbackPortrait;
  const cardBackSrc = resolveCardBack(card.cardBackId);
  const [cubeOn, setCubeOn] = useState(false);
  const { n: seriesN, total: seriesTotal, seriesName } = seriesCardNumber(card.slug);

  // 3D tilt for the modal card
  const modalCardRef = useRef<HTMLDivElement>(null);
  const onCardMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = modalCardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const rx = -(dy / (rect.height / 2)) * 12;
    const ry =  (dx / (rect.width  / 2)) * 12;
    el.style.transform = cardTiltTransform(rx, ry, 1.03);
  };
  const onCardMouseLeave = () => {
    const el = modalCardRef.current;
    if (!el) return;
    el.style.transition = "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)";
    el.style.transform = "";
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while open (position:fixed prevents iOS background scroll)
  useEffect(() => {
    const scrollY = window.scrollY;
    const { style } = document.body;
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.overflow = "hidden";
    return () => {
      style.position = "";
      style.top = "";
      style.left = "";
      style.right = "";
      style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-modal-title"
    >
      {/* Backdrop — fixed layer, never scrolls with content */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "rgba(1,2,8,0.88)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        aria-hidden
      />

      {/* Scroll layer — only the panel moves, backdrop stays put */}
      <div
        className="fixed inset-0 overflow-y-auto overscroll-contain modal-scroll"
        onClick={onClose}
      >
      <div className="flex min-h-full items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 pointer-events-none">
      <motion.div
        className="relative flex flex-col lg:flex-row gap-5 sm:gap-6 lg:gap-10 w-full max-w-4xl overflow-visible pointer-events-auto"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close — viewport top-right on mobile/tablet; panel top-right on desktop */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="modal-close-btn w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:bg-[rgba(212,175,55,0.18)] hover:border-[rgba(212,175,55,0.45)]"
          style={{ border: "1px solid rgba(212,175,55,0.25)", background: "rgba(212,175,55,0.08)", color: "#D4AF37" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
        </button>

        {/* ── LEFT: card ── */}
        <div className="modal-card-column flex-shrink-0 flex flex-col items-center lg:items-start gap-3 sm:gap-4 overflow-visible">
          <div className="card-tilt-scene card-modal-tilt-scene" style={{ width: "100%" }}>
          {cubeOn ? (
            <Card3DViewer
              rarity={card.rarity}
              portrait={portrait}
              princessName={card.princess}
              cardBackSrc={cardBackSrc}
              glowFilter={
                cfg.glowStr > 0
                  ? `drop-shadow(0 0 ${cfg.glowStr * 0.55}px ${cfg.glowCol}80)`
                  : "drop-shadow(0 12px 32px rgba(0,0,0,0.85))"
              }
            />
          ) : (
          <div
            ref={modalCardRef}
            className="card-tilt-target"
            style={{
              width: "100%",
              aspectRatio: "5/7",
              transition: "transform 0.08s linear",
              filter: cfg.glowStr > 0
                ? `drop-shadow(0 0 ${cfg.glowStr * 0.55}px ${cfg.glowCol}80)`
                : "drop-shadow(0 12px 32px rgba(0,0,0,0.85))",
            }}
            onMouseMove={onCardMouseMove}
            onMouseLeave={onCardMouseLeave}
          >
            <CardSVG rarity={card.rarity} portrait={portrait} princessName={card.princess} />
          </div>
          )}
          </div>

          {/* Rarity badge + cube toggle */}
          <div className="flex items-center justify-between gap-3 w-full">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg min-w-0"
              style={{ border: `1px solid ${cfg.color}40`, background: `${cfg.color}12` }}>
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
              <span className="type-label" style={{ color: cfg.color }}>
                {cfg.name}
              </span>
              <span className="text-xs ml-1" style={{ color: cfg.color, opacity: 0.55 }}>{cfg.tier}</span>
            </div>

            <button
              type="button"
              role="switch"
              aria-checked={cubeOn}
              aria-label={cubeOn ? "3D-просмотр: вкл" : "3D-просмотр: выкл"}
              onClick={() => setCubeOn(v => !v)}
              className={[
                "flex-shrink-0 flex items-center justify-center rounded-lg p-1.5 cursor-pointer",
                "transition-[color,background-color,opacity] duration-200",
                "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]",
                cubeOn
                  ? "text-[#D4AF37] bg-[rgba(212,175,55,0.12)]"
                  : "text-[#5C6C94] opacity-70 hover:opacity-100 hover:text-[#8494BC] hover:bg-[rgba(132,148,188,0.1)]",
              ].join(" ")}
            >
              <IsometricCubeIcon />
            </button>
          </div>
        </div>

        {/* ── RIGHT: info ── */}
        <div className="flex-1 flex flex-col gap-4 sm:gap-5 min-w-0 lg:max-h-[min(90vh,900px)] lg:overflow-y-auto lg:overscroll-contain">
          {/* Header */}
          <div className="min-w-0 lg:pr-12">
            <p className="type-eyebrow type-eyebrow--section mb-1.5" style={{ color: "#8494BC" }}>
              Коллекция принцесс
            </p>
            <h2 id="card-modal-title" className="type-display-2 break-words"
              style={{
                background: `linear-gradient(135deg, ${cfg.goldBase ?? "#9A8050"}, ${cfg.goldHigh ?? "#F0D060"}, ${cfg.goldBase ?? "#9A8050"})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
              {card.princess}
            </h2>
          </div>

          {/* Divider */}
          <div className="h-px" style={{ background: `linear-gradient(to right, ${cfg.color}50, transparent)` }} />

          {/* Story */}
          <div>
            <p className="type-eyebrow type-eyebrow--section mb-3" style={{ color: "#8494BC" }}>
              История персонажа
            </p>
            <p className="type-story" style={{ color: "#ECEFF4" }}>
              {details?.story ?? "Легендарная героиня, чья история ещё не полностью раскрыта."}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px mt-auto" style={{ background: "rgba(212,175,55,0.12)" }} />

          {/* Acquisition info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl p-4" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)" }}>
              <p className="type-eyebrow type-eyebrow--section mb-2" style={{ color: "#8494BC" }}>Бустер-пак</p>
              <div className="flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5">
                  <rect x="1" y="3" width="12" height="9" rx="1.5" stroke="#D4AF37" strokeWidth="1.2"/>
                  <path d="M4 3V2a3 3 0 016 0v1" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M5 7h4M7 5v4" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <span className="type-value" style={{ color: "#F0D882" }}>
                  {card.booster ?? details?.booster ?? "Неизвестный набор"}
                </span>
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)" }}>
              <p className="type-eyebrow type-eyebrow--section mb-2" style={{ color: "#8494BC" }}>Дата получения</p>
              <div className="flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5">
                  <rect x="1" y="2.5" width="12" height="10" rx="1.5" stroke="#D4AF37" strokeWidth="1.2"/>
                  <path d="M1 6h12" stroke="#D4AF37" strokeWidth="1.2"/>
                  <path d="M4 1v3M10 1v3" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <span className="type-value" style={{ color: "#F0D882" }}>
                  {card.obtainedDate ?? details?.obtainedDate ?? "Неизвестно"}
                </span>
              </div>
            </div>
          </div>

          {/* Card number — внутри своей серии */}
          <p className="type-meta text-right" style={{ color: "#5C6C94" }}>
            Серия «{seriesName}» · № {String(seriesN).padStart(3, "0")} /{" "}
            {String(seriesTotal).padStart(3, "0")}
          </p>
        </div>
      </motion.div>
      </div>
      </div>
    </motion.div>
  );
}
