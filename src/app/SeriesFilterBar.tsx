export interface SeriesFilterItem {
  /** `null` — пункт «Все» (сброс фильтра). */
  id: string | null;
  name: string;
  owned: number;
  total: number;
}

interface SeriesFilterBarProps {
  items: SeriesFilterItem[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

/** Быстрый фильтр по сериям с индикатором заполненности каждой серии. */
export function SeriesFilterBar({ items, selectedId, onSelect }: SeriesFilterBarProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 sm:gap-3 mb-8 sm:mb-10">
      {items.map((item) => {
        const isActive = item.id === selectedId;
        const pct = item.total > 0 ? Math.min(100, Math.round((item.owned / item.total) * 100)) : 0;
        return (
          <button
            key={item.id ?? "all"}
            type="button"
            aria-pressed={isActive}
            onClick={() => onSelect(item.id)}
            className={[
              "flex flex-col gap-1.5 px-3.5 py-2 rounded-xl min-w-[128px] cursor-pointer",
              "transition-[color,background-color,border-color,opacity] duration-200",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D4AF37]",
            ].join(" ")}
            style={{
              border: `1px solid ${isActive ? "#D4AF3766" : "rgba(132,148,188,0.22)"}`,
              background: isActive ? "rgba(212,175,55,0.12)" : "rgba(132,148,188,0.05)",
            }}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="type-label truncate" style={{ color: isActive ? "#D4AF37" : "#8494BC" }}>
                {item.name}
              </span>
              <span className="type-meta whitespace-nowrap" style={{ color: isActive ? "#D4AF37" : "#5C6C94", opacity: isActive ? 0.85 : 0.6 }}>
                {item.owned}/{item.total}
              </span>
            </div>
            <div className="h-[3px] w-full rounded-full overflow-hidden" style={{ background: "rgba(132,148,188,0.15)" }}>
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{
                  width: `${pct}%`,
                  background: isActive
                    ? "linear-gradient(90deg, #9A8050, #F0D060)"
                    : "rgba(212,175,55,0.4)",
                }}
              />
            </div>
          </button>
        );
      })}
    </div>
  );
}
