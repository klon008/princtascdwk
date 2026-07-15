import { useMemo, useRef, useEffect, useState, type CSSProperties } from "react";
import { AnimatePresence } from "motion/react";
import { fetchAlbum, type AlbumResponse } from "@/lib/albumApi";
import { getCatalogEntry } from "@/lib/cardCatalog";
import { DEFAULT_CARD_BACK_ID } from "@/lib/cardBacks";
import type { AlbumViewState, CardDef } from "./types";
import { CFG } from "./rarityConfig";
import { CARDS } from "./demoCards";
import { ruCount, cardTiltTransform, srng } from "./utils";
import { StarPoly } from "./cards/svgHelpers";
import { CardTile } from "./cards/CardTile";
import { CardBackTile } from "./cards/CardBackTile";
import { CardModal } from "./CardModal";

export default function App() {
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardDef | null>(null);
  const [albumView, setAlbumView] = useState<AlbumViewState>("landing");
  const [albumData, setAlbumData] = useState<AlbumResponse | null>(null);
  const [displayCards, setDisplayCards] = useState<CardDef[]>(CARDS);

  const albumSecret = import.meta.env.VITE_ALBUM_LINK_SECRET ?? "";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const u = params.get("u");
    if (!u) {
      setAlbumView("landing");
      setDisplayCards([]);
      return;
    }
    if (!params.get("k") || !params.get("exp")) {
      setAlbumView("landing");
      setDisplayCards([]);
      return;
    }

    let cancelled = false;
    setAlbumView("loading");

    void (async () => {
      const result = await fetchAlbum(params, albumSecret);
      if (cancelled) return;
      if (!result.ok) {
        setAlbumView(
          result.error === "unauthorized"
            ? "unauthorized"
            : result.error === "not_found"
              ? "not_found"
              : "offline",
        );
        setDisplayCards([]);
        return;
      }
      setAlbumData(result.data);
      setAlbumView("album");
      const owned = result.data.cards
        .map((c): CardDef | null => {
          const entry = getCatalogEntry(c.id);
          if (!entry) return null;
          return {
            princess: c.name,
            slug: c.id,
            rarity: c.rarity,
            portrait: entry.portrait,
            obtainedDate: c.d,
            booster: c.b,
            cardBackId: c.card_back_id || DEFAULT_CARD_BACK_ID,
          };
        })
        .filter((c): c is CardDef => c !== null);
      setDisplayCards(owned);
    })();

    return () => {
      cancelled = true;
    };
  }, [albumSecret]);

  const showPreviewGrid = import.meta.env.DEV && albumView === "landing";
  const gridCards = albumView === "album" ? displayCards : showPreviewGrid ? CARDS : [];

  const stars = useMemo(() => Array.from({ length: 120 }, (_, i) => ({
    x: srng(i * 3) * 100,
    y: srng(i * 3 + 1) * 100,
    s: 0.4 + srng(i * 3 + 2) * 2.2,
    o: 0.1 + srng(i * 3 + 3) * 0.4,
    d: 2 + srng(i * 3 + 4) * 3.5,
  })), []);

  useEffect(() => {
    const RADIUS = 320;
    const MAX_DEG = 18;
    const MAX_SCALE = 0.06;

    const resetAll = () => {
      tileRefs.current.forEach(el => {
        if (!el) return;
        el.style.transition = "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)";
        el.style.transform = "";
        el.style.zIndex = "";
      });
    };

    const onMove = (e: PointerEvent) => {
      tileRefs.current.forEach(el => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < RADIUS) {
          const t = 1 - dist / RADIUS;
          const strength = t * t * MAX_DEG;
          const d = Math.max(dist, 1);
          const rx = -(dy / d) * strength;
          const ry =  (dx / d) * strength;
          const scale = 1 + t * MAX_SCALE;
          el.style.transition = "transform 0.06s linear";
          el.style.transform = cardTiltTransform(rx, ry, scale);
          el.style.zIndex = "10";
        } else {
          el.style.transition = "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)";
          el.style.transform = "";
          el.style.zIndex = "";
        }
      });
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", resetAll);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", resetAll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#030610] relative">
      {/* Star field */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        {stars.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.s} fill="#D4AF37" opacity={s.o}
            style={{ "--op": s.o, animation: `twinkle ${s.d}s ${i * 0.12}s ease-in-out infinite` } as CSSProperties} />
        ))}
      </svg>

      {/* Atmospheric glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[700px] h-[500px] rounded-full opacity-[0.035]"
          style={{ background: "radial-gradient(ellipse, #4080E0, transparent)" }} />
        <div className="absolute -bottom-32 right-1/4 w-[700px] h-[500px] rounded-full opacity-[0.035]"
          style={{ background: "radial-gradient(ellipse, #9040E0, transparent)" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 text-center px-4 pt-7 pb-6 sm:pt-10 sm:pb-8">
        <p className="type-eyebrow type-eyebrow--hero text-[#3A4A6A] mb-2">
          Дворцовая сокровищница
        </p>
        <h1 className="type-display-1"
          style={{
            background: "linear-gradient(135deg, #9A8050 0%, #F0D060 35%, #D4AF37 55%, #F0D060 75%, #9A8050 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
          Enchanted Vault
        </h1>
        <p className="type-eyebrow mt-3 text-[#50608A]">
          {albumView === "album" && albumData ? (
            <>
              @{albumData.u} · Коллекция {albumData.collection.owned} из {albumData.collection.total}
              {albumData.series[0]
                ? ` · ${albumData.series[0].name}: ${albumData.series[0].owned} из ${albumData.series[0].total}`
                : ""}
            </>
          ) : albumView === "loading" ? (
            "Загрузка альбома…"
          ) : albumView === "offline" ? (
            "Альбом доступен на стриме"
          ) : albumView === "unauthorized" ? (
            "Ссылка недействительна"
          ) : albumView === "not_found" ? (
            "Игрок не найден"
          ) : albumView === "landing" ? (
            showPreviewGrid ? (
              <>
                {ruCount(CARDS.length, ["карта", "карты", "карт"])} ·{" "}
                {ruCount(Object.keys(CFG).length, ["редкость", "редкости", "редкостей"])} · предпросмотр
              </>
            ) : (
              "Получите ссылку командой !альбом в чате стрима"
            )
          ) : (
            <>
              {ruCount(CARDS.length, ["карта", "карты", "карт"])} ·{" "}
              {ruCount(Object.keys(CFG).length, ["редкость", "редкости", "редкостей"])}
            </>
          )}
        </p>
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-4 opacity-35">
          <div className="h-px w-16 sm:w-28 md:w-44" style={{ background: "linear-gradient(to right, transparent, #D4AF37)" }} />
          <svg width="14" height="14" viewBox="-7 -7 14 14">
            <StarPoly cx={0} cy={0} r={6} n={8} inner={0.5} fill="#D4AF37" opacity={1} />
          </svg>
          <div className="h-px w-16 sm:w-28 md:w-44" style={{ background: "linear-gradient(to left, transparent, #D4AF37)" }} />
        </div>
      </header>

      {/* Card grid */}
      <main className="relative z-10 px-3 sm:px-5 md:px-6 pb-16 sm:pb-20">
        {albumView === "loading" && (
          <p className="text-center type-eyebrow text-[#50608A] py-20">Загрузка альбома…</p>
        )}
        {(albumView === "offline" || albumView === "unauthorized" || albumView === "not_found") && (
          <p className="text-center type-eyebrow text-[#50608A] py-20">
            {albumView === "offline" && "Альбом доступен на стриме — туннель выключен или API недоступен."}
            {albumView === "unauthorized" && "Ссылка недействительна или устарела."}
            {albumView === "not_found" && "Игрок не найден."}
          </p>
        )}
        {albumView === "landing" && !showPreviewGrid && (
          <p className="text-center type-eyebrow text-[#50608A] max-w-lg mx-auto py-10">
            Откройте альбом по персональной ссылке из чата GoodGame. Полный каталог карт здесь не показывается.
          </p>
        )}
        {gridCards.length > 0 && (
        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 md:gap-5 max-w-[1600px] mx-auto">
          {gridCards.map((card, idx) => (
            <CardTile
              key={`${card.princess}-${idx}`}
              idx={idx}
              princess={card.princess}
              rarity={card.rarity}
              portrait={card.portrait}
              tileRef={el => { tileRefs.current[idx] = el; }}
              onClick={() => setSelectedCard(card)}
            />
          ))}
          {/* Рубашка — только в DEV-превью каталога; в !альбом не показываем (owned-only). */}
          {showPreviewGrid && (
            <CardBackTile
              idx={gridCards.length}
              tileRef={el => { tileRefs.current[gridCards.length] = el; }}
            />
          )}
        </div>
        )}
        {albumView === "album" && displayCards.length === 0 && (
          <p className="text-center type-eyebrow text-[#50608A] py-20">В альбоме пока нет карт.</p>
        )}

        {/* Footer ornament */}
        <div className="text-center mt-14 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 opacity-20">
            <div className="h-px w-16" style={{ background: "linear-gradient(to right, transparent, #D4AF37)" }} />
            <svg width="10" height="10" viewBox="-5 -5 10 10">
              <StarPoly cx={0} cy={0} r={4} n={4} fill="#D4AF37" opacity={1} />
            </svg>
            <div className="h-px w-16" style={{ background: "linear-gradient(to left, transparent, #D4AF37)" }} />
          </div>
          <p className="type-meta" style={{ color: "#5C6C94" }}>
            {showPreviewGrid
              ? "Фантастический коллекционер · Классический набор"
              : albumData?.series?.length
                ? albumData.series.map((s) => s.name).join(" · ")
                : "Серия «Фантастический коллекционер» · Тираж № 001"}
          </p>
          <p className="type-meta mt-1" style={{ color: "#465577" }}>
            © 2026 klon008
          </p>
        </div>
      </main>

      <AnimatePresence>
        {selectedCard && (
          <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
