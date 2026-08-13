import { useEffect } from "react";
import { fishArt } from "./fishArt";
import { getFishInfo } from "./fishSpecies";

export function FishInfoModal({ species, onClose }: { species: string; onClose: () => void }) {
  const info = getFishInfo(species);
  const art = fishArt[species];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

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

  if (!info) return null;

  return (
    <div className="fish-info-overlay" onClick={onClose} role="presentation">
      <div
        className="fish-info-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fish-info-title"
        onClick={(e) => e.stopPropagation()}
      >
        {art && (
          <div className="fish-info-art" aria-hidden>
            <img src={art} alt="" draggable={false} />
          </div>
        )}
        <button type="button" className="fish-info-close" onClick={onClose} aria-label="Закрыть">
          ×
        </button>
        <h2 id="fish-info-title" className="fish-info-name">
          {species}
        </h2>
        <p className="fish-info-latin">{info.latin}</p>
        <p className="fish-info-blurb">{info.blurb}</p>
        <div className="fish-info-max">
          <span className="fish-info-max-label">Обычный максимум</span>
          <span className="fish-info-max-value">{info.wMax.toFixed(2)} кг</span>
          <span className="fish-info-max-hint">Тяжелее — трофей</span>
        </div>
      </div>
    </div>
  );
}
