import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useLocation, useNavigate } from "react-router";
import { Toaster, toast } from "sonner";
import fishingBg from "@/assets/fishing/bg.jpg";
import {
  fetchFishingStats,
  mapCatchRow,
  type Catch,
  type FishingFetchError,
} from "@/lib/fishingApi";
import { fishArt } from "./fishArt";
import { isCatchTrophy } from "./fishSpecies";
import { FishInfoModal } from "./FishInfoModal";
import { FishingPixiBg } from "./FishingPixiBg";
import { MOCK_ALL_TIME, MOCK_WEEKLY } from "./fishingMock";
import { AutumnLeaves } from "./AutumnLeaves";
import "./fishing.css";

const commands = [
  { cmd: "!рыбалка", desc: "Заброс (−15 энергии, −1 наживка)" },
  { cmd: "!рыбалка черви", desc: "−15 энергии → +5 червей" },
  { cmd: "!рыбалка опарыш", desc: "−20 принцесс → +10 опарышей" },
  { cmd: "!рыбалка удочка", desc: "Купить или починить удочку (1000)" },
  { cmd: "!рыбалка защита [N]", desc: "Щит от русалки (500 за штуку, до 20 за раз)" },
  { cmd: "!рыбалка энергия", desc: "Текущие ресурсы" },
  { cmd: "!рыбалка улов", desc: "Личные рекорды по видам" },
  { cmd: "!рыбалка топрыба", desc: "Недельный рейтинг" },
  { cmd: "!рыбалка трофеи", desc: "Лучшие уловы канала" },
  { cmd: "!рыбалка помощь", desc: "Краткая справка" },
];

const PARCHMENT_BASE = "linear-gradient(146deg, #fdf8ee, #f7edd8)";
const PARCHMENT_HOVER = "linear-gradient(146deg, #fffbf2, #fdf3dd)";
const FONT_MONO = "'JetBrains Mono', monospace";
const FONT_SANS = "'Manrope', sans-serif";
const FONT_SERIF = "'Lora', Georgia, serif";

function rankMedal(rank: number) {
  if (rank === 1) return { bg: "#c8972a", text: "#fff8ee", shadow: "rgba(200,150,40,0.5)" };
  if (rank === 2) return { bg: "#8a9bb0", text: "#fff", shadow: "rgba(120,150,180,0.4)" };
  if (rank === 3) return { bg: "#a0694a", text: "#fff", shadow: "rgba(160,100,60,0.4)" };
  return { bg: "rgba(60,40,20,0.12)", text: "#9a7a50", shadow: "none" };
}

function TrophyCupIcon() {
  return (
    <svg viewBox="0 0 64 64" aria-hidden>
      <path
        fill="currentColor"
        d="M20 14c-10 1-16 9-16 17 0 9 7 15 16 16l2.5-7.5C16 38.5 12 34 12 31c0-4 3.5-8 8-8.5V14Zm24 0c10 1 16 9 16 17 0 9-7 15-16 16l-2.5-7.5C48 38.5 52 34 52 31c0-4-3.5-8-8-8.5V14Z"
      />
      <path
        fill="currentColor"
        d="M18 6h28a2 2 0 0 1 2 2v5c-1 15-8 23-16 23S17 28 16 13V8a2 2 0 0 1 2-2Z"
      />
      <path fill="currentColor" d="M29 36h6v8h-6z" />
      <ellipse cx="32" cy="45" rx="5" ry="2.2" fill="currentColor" />
      <path fill="currentColor" d="M22 48h20l3.5 4.5H18.5L22 48Z" />
      <rect x="14" y="52.5" width="36" height="7" rx="2" fill="currentColor" />
    </svg>
  );
}

function TrophyCard({
  entry,
  rank,
  hero = false,
  onOpen,
}: {
  entry: Catch;
  rank: number;
  hero?: boolean;
  onOpen?: (species: string) => void;
}) {
  const [hov, setHov] = useState(false);
  const med = rankMedal(rank);
  const art = fishArt[entry.fish];
  const catchTrophy = isCatchTrophy(entry.fish, entry.weight);

  return (
    <div
      className={`trophy-card${hero ? " trophy-card--hero" : ""}${catchTrophy ? " trophy-card--catch-trophy" : ""}${onOpen ? " trophy-card--clickable" : ""}`}
      role={onOpen ? "button" : undefined}
      tabIndex={onOpen ? 0 : undefined}
      onClick={onOpen ? () => onOpen(entry.fish) : undefined}
      onKeyDown={
        onOpen
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onOpen(entry.fish);
              }
            }
          : undefined
      }
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? PARCHMENT_HOVER : PARCHMENT_BASE,
        border: catchTrophy
          ? undefined
          : `1.5px solid ${rank <= 3 ? med.bg + "77" : "rgba(180,130,60,0.22)"}`,
        borderRadius: 16,
        boxShadow: hov
          ? "0 14px 40px rgba(40,20,0,0.22), inset 0 1px 0 rgba(255,255,220,0.8)"
          : "0 4px 18px rgba(40,20,0,0.12), inset 0 1px 0 rgba(255,255,220,0.7)",
        transform: hov ? "translateY(-3px) scale(1.01)" : "translateY(0) scale(1)",
        transition: "all 0.2s ease",
        padding: hero ? "28px 32px" : "18px 20px",
        display: "flex",
        flexDirection: "column",
        gap: 6,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {art && (
        <div className={`trophy-card-fish-wrap${hero ? " trophy-card-fish-wrap--hero" : ""}`} aria-hidden>
          <img className="trophy-card-fish" src={art} alt="" draggable={false} />
        </div>
      )}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          minHeight: hero ? 48 : 36,
        }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 26,
            height: 26,
            borderRadius: 7,
            background: med.bg,
            color: med.text,
            fontSize: 11,
            fontWeight: 800,
            fontFamily: FONT_MONO,
            boxShadow: med.shadow !== "none" ? `0 2px 8px ${med.shadow}` : undefined,
          }}
        >
          {rank}
        </span>
        {catchTrophy && (
          <div className="trophy-card-catch-badge" title="Трофейный улов" aria-label="Трофейный улов">
            <TrophyCupIcon />
          </div>
        )}
      </div>

      <div
        style={{
          fontFamily: FONT_SANS,
          fontSize: hero ? 28 : 20,
          fontWeight: 800,
          color: "#2a1400",
          lineHeight: 1.15,
          marginTop: 2,
        }}
      >
        {entry.fish}
      </div>

      <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span
          style={{
            fontFamily: FONT_SERIF,
            fontSize: hero ? 50 : 36,
            fontWeight: 700,
            lineHeight: 1,
            color: rank === 1 ? "#a05c0a" : "#3a2000",
          }}
        >
          {entry.weight.toFixed(2)}
        </span>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#9a7040", fontFamily: FONT_MONO }}>кг</span>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          marginTop: 6,
          paddingTop: 10,
          borderTop: "1px solid rgba(160,110,40,0.18)",
        }}
      >
        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#c8972a", flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#5c3a10" }}>{entry.player}</span>
      </div>
    </div>
  );
}

function Section({
  title,
  subtitle,
  catches,
  emptyHint,
  onOpenFish,
}: {
  title: string;
  subtitle: string;
  catches: Catch[];
  emptyHint?: string;
  onOpenFish?: (species: string) => void;
}) {
  const sorted = [...catches].sort((a, b) => b.weight - a.weight);
  const [hero, ...rest] = sorted;

  return (
    <section>
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18, flexWrap: "wrap" }}>
        <div
          style={{
            width: 4,
            height: 30,
            borderRadius: 3,
            background: "linear-gradient(180deg, #e8b840, #c8792a)",
            flexShrink: 0,
          }}
        />
        <h2
          style={{
            fontFamily: FONT_SANS,
            fontSize: 22,
            fontWeight: 800,
            color: "#fff8ee",
            textShadow: "0 2px 10px rgba(0,0,0,0.45)",
            margin: 0,
          }}
        >
          {title}
        </h2>
        <div style={{ width: 4, height: 4, borderRadius: "50%", background: "rgba(200,150,60,0.45)", flexShrink: 0 }} />
        <p style={{ color: "rgba(255,225,150,0.45)", fontSize: 13, fontWeight: 500, margin: 0 }}>{subtitle}</p>
      </div>

      {!hero ? (
        <p
          style={{
            color: "rgba(255,225,150,0.55)",
            fontSize: 14,
            fontWeight: 500,
            textAlign: "center",
            padding: "32px 16px",
            margin: 0,
          }}
        >
          {emptyHint ?? "Пока нет записей"}
        </p>
      ) : (
        <>
          <div style={{ marginBottom: 14 }}>
            <TrophyCard entry={hero} rank={1} hero onOpen={onOpenFish} />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 12 }}>
            {rest.map((c, i) => (
              <TrophyCard key={c.fish} entry={c} rank={i + 2} onOpen={onOpenFish} />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function toastForError(error: FishingFetchError) {
  if (error === "no_api") {
    toast.error("Нет адреса API — откройте ссылку со стрима (?api=…)");
    return;
  }
  if (error === "offline") {
    toast.error("Бэкенд недоступен (туннель / бот)");
    return;
  }
  toast.error("Не удалось загрузить статистику");
}

function GuideCard({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        background: PARCHMENT_BASE,
        border: "1.5px solid rgba(180,130,60,0.22)",
        borderRadius: 16,
        boxShadow: "0 4px 20px rgba(40,20,0,0.13), inset 0 1px 0 rgba(255,255,220,0.7)",
        padding: "22px 24px",
        position: "relative",
        overflow: "hidden",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function GuideLabel({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        fontFamily: FONT_MONO,
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: "0.13em",
        textTransform: "uppercase",
        color: "#9a6820",
        marginBottom: 12,
        display: "flex",
        alignItems: "center",
        gap: 8,
      }}
    >
      <div style={{ flex: 1, height: 1, background: "rgba(160,110,40,0.25)" }} />
      {children}
      <div style={{ flex: 1, height: 1, background: "rgba(160,110,40,0.25)" }} />
    </div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div
        style={{
          width: 26,
          height: 26,
          borderRadius: 8,
          flexShrink: 0,
          background: "#c8972a",
          color: "#fff8ee",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 800,
          fontFamily: FONT_MONO,
          boxShadow: "0 2px 8px rgba(200,150,40,0.45)",
        }}
      >
        {n}
      </div>
      <p style={{ fontSize: 14, fontWeight: 600, color: "#3a2000", lineHeight: 1.5, paddingTop: 3 }}>{text}</p>
    </div>
  );
}

function Pill({ children, color = "#6a3e10" }: { children: ReactNode; color?: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        fontFamily: FONT_MONO,
        fontSize: 12,
        fontWeight: 500,
        background: color + "14",
        color,
        border: `1px solid ${color}40`,
        padding: "3px 10px",
        borderRadius: 8,
      }}
    >
      {children}
    </span>
  );
}

function EventTag({ icon, label, desc }: { icon: string; label: string; desc: string }) {
  return (
    <div
      style={{
        display: "flex",
        gap: 10,
        alignItems: "flex-start",
        padding: "10px 12px",
        borderRadius: 10,
        background: "rgba(100,60,10,0.06)",
        border: "1px solid rgba(160,110,40,0.15)",
      }}
    >
      <span style={{ fontSize: 18, lineHeight: 1.4, flexShrink: 0 }}>{icon}</span>
      <div>
        <div style={{ fontSize: 13, fontWeight: 700, color: "#3a2000", marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: 12, fontWeight: 500, color: "#7a5020", lineHeight: 1.45 }}>{desc}</div>
      </div>
    </div>
  );
}

function GuideView() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <GuideCard>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start", flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 220 }}>
            <div
              style={{
                fontFamily: FONT_SANS,
                fontSize: 24,
                fontWeight: 800,
                color: "#2a1400",
                marginBottom: 8,
              }}
            >
              Что такое рыбалка?
            </div>
            <p style={{ fontSize: 14, fontWeight: 500, color: "#5c3a10", lineHeight: 1.65 }}>
              Быстрая мини-игра в чате: один заброс — один результат. Пойманная рыба сразу продаётся за{" "}
              <strong style={{ color: "#a05c0a" }}>принцессы</strong> (баллы канала). Между забросами — пауза{" "}
              <strong style={{ color: "#a05c0a" }}>20 секунд</strong>.
            </p>
          </div>
          <div
            style={{
              background: "rgba(200,150,40,0.1)",
              border: "1px solid rgba(200,150,40,0.3)",
              borderRadius: 12,
              padding: "14px 18px",
              minWidth: 180,
            }}
          >
            <div
              style={{
                fontFamily: FONT_MONO,
                fontSize: 10,
                color: "#9a6820",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              Команда
            </div>
            <div style={{ fontFamily: FONT_MONO, fontSize: 20, fontWeight: 500, color: "#6a3e10" }}>!рыбалка</div>
          </div>
        </div>
      </GuideCard>

      <GuideCard>
        <GuideLabel>Как начать</GuideLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <Step n={1} text="Купите удочку: !рыбалка удочка (1000 принцесс)" />
          <Step n={2} text="Добудьте наживку: !рыбалка черви или !рыбалка опарыш" />
          <Step n={3} text="Закидывайте: !рыбалка" />
        </div>
        <p style={{ marginTop: 14, fontSize: 12, color: "#9a7040", fontWeight: 500, fontStyle: "italic" }}>
          Без удочки, наживки или энергии заброс не сработает.
        </p>
      </GuideCard>

      <GuideCard>
        <GuideLabel>Команды</GuideLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {commands.map((c, i) => (
            <div
              key={c.cmd}
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1.4fr",
                gap: "8px 16px",
                alignItems: "center",
                padding: "8px 10px",
                borderRadius: 8,
                background: i % 2 === 0 ? "rgba(100,60,10,0.05)" : "transparent",
              }}
            >
              <span style={{ fontFamily: FONT_MONO, fontSize: 12, fontWeight: 500, color: "#7a4a10" }}>{c.cmd}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: "#5c3a10" }}>{c.desc}</span>
            </div>
          ))}
        </div>
      </GuideCard>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        <GuideCard>
          <GuideLabel>Ресурсы</GuideLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {[
              { label: "Энергия", desc: "Максимум 100, восстанавливается примерно за час." },
              {
                label: "Наживка",
                desc: "Черви и опарыш. Тратится 1 за заброс (сначала черви). В конце суток протухает.",
              },
              { label: "Удочка", desc: "Без неё ловить нельзя. Может сломаться — нужна новая покупка." },
            ].map((r) => (
              <div key={r.label} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Pill>{r.label}</Pill>
                <p style={{ fontSize: 13, fontWeight: 500, color: "#5c3a10", lineHeight: 1.5, paddingLeft: 2 }}>
                  {r.desc}
                </p>
              </div>
            ))}
            <p style={{ fontSize: 12, color: "#9a7040", fontStyle: "italic", marginTop: 4 }}>
              Щит, буст клёва, сейф — действуют до конца суток и сгорают в полночь (МСК).
            </p>
          </div>
        </GuideCard>

        <GuideCard>
          <GuideLabel>Что бывает при забросе</GuideLabel>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <EventTag icon="🐟" label="Рыба" desc="Вид, вес и размер; сразу продажа за принцессы." />
            <EventTag icon="💨" label="Сход" desc="Клёв был, но рыба сорвалась." />
            <EventTag icon="👟" label="Мусор" desc="Водоросли, ботинок, банка — продажи нет." />
            <EventTag icon="🧜‍♀️" label="Русалка" desc="−3000 принцесс (блокируется щитом)." />
            <EventTag icon="🦈" label="Щука-событие" desc="Ломает удочку." />
            <EventTag icon="🐦" label="Чайка" desc="Ворует наживку." />
          </div>
          <p style={{ marginTop: 12, fontSize: 12, color: "#9a7040", fontStyle: "italic" }}>
            Первая рыба суток на канале даёт бонус +150 принцесс.
          </p>
        </GuideCard>
      </div>

      <GuideCard>
        <GuideLabel>Бонусы при копании червей</GuideLabel>
        <p style={{ fontSize: 13, fontWeight: 500, color: "#6a4010", marginBottom: 12 }}>
          Иногда вместо червей попадается:
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 10 }}>
          {[
            { name: "Щит от русалки", desc: "Один заряд блокирует одну русалку." },
            { name: "Активатор клёва", desc: "Несколько забросов с меньшим шансом схода и мусора." },
            { name: "Карманный сейф", desc: "Только в дни !кража — до конца суток нельзя ограбить." },
          ].map((b) => (
            <div
              key={b.name}
              style={{
                padding: "12px 14px",
                borderRadius: 10,
                background: "rgba(200,150,40,0.08)",
                border: "1px solid rgba(200,150,40,0.22)",
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 800, color: "#7a4a00", marginBottom: 4 }}>{b.name}</div>
              <div style={{ fontSize: 12, fontWeight: 500, color: "#7a5020", lineHeight: 1.5 }}>{b.desc}</div>
            </div>
          ))}
        </div>
        <p style={{ marginTop: 12, fontSize: 12, color: "#9a7040", fontStyle: "italic" }}>
          В рыбный день желающим могут начислить заряды буста клёва.
        </p>
      </GuideCard>

      <GuideCard>
        <GuideLabel>Трофеи и рейтинги</GuideLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                flexShrink: 0,
                background: "linear-gradient(135deg, #c8972a, #e8c060)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 18,
                boxShadow: "0 3px 10px rgba(200,150,40,0.4)",
              }}
            >
              🏆
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 800, color: "#3a2000", marginBottom: 3 }}>Трофей</div>
              <p style={{ fontSize: 13, fontWeight: 500, color: "#5c3a10", lineHeight: 1.5 }}>
                Редкий улов тяжелее обычного максимума вида (≈1 из 500 рыб). Цена как у крупной рыбы.
              </p>
            </div>
          </div>
          <div style={{ height: 1, background: "rgba(160,110,40,0.15)" }} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              {
                cmd: "!рыбалка топрыба",
                desc: "Кто поймал самый тяжёлый экземпляр каждого вида за неделю. Награды выдаёт стример.",
              },
              { cmd: "!рыбалка трофеи", desc: "Зал славы: лучшие веса за всё время." },
            ].map((t) => (
              <div
                key={t.cmd}
                style={{
                  padding: "12px 14px",
                  borderRadius: 10,
                  background: "rgba(100,60,10,0.06)",
                  border: "1px solid rgba(160,110,40,0.18)",
                }}
              >
                <div style={{ fontFamily: FONT_MONO, fontSize: 12, color: "#7a4a10", marginBottom: 6 }}>{t.cmd}</div>
                <div style={{ fontSize: 12, fontWeight: 500, color: "#5c3a10", lineHeight: 1.5 }}>{t.desc}</div>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#9a7040", fontStyle: "italic" }}>
            Цена улова зависит от вида и размера (мелкий / средний / крупный). Чем крупнее — тем дороже.
          </p>
        </div>
      </GuideCard>
    </div>
  );
}

type Tab = "weekly" | "alltime" | "guide";

const TABS: Tab[] = ["weekly", "alltime", "guide"];

function tabFromHash(hash: string): Tab {
  const id = hash.replace(/^#/, "");
  return TABS.includes(id as Tab) ? (id as Tab) : "weekly";
}

export default function FishingPage() {
  const { hash, search } = useLocation();
  const navigate = useNavigate();
  const tab = tabFromHash(hash);
  const params = new URLSearchParams(search);
  const isMaket = params.get("maket") === "true";

  const [weekly, setWeekly] = useState<Catch[]>(isMaket ? MOCK_WEEKLY : []);
  const [allTime, setAllTime] = useState<Catch[]>(isMaket ? MOCK_ALL_TIME : []);
  const [loading, setLoading] = useState(!isMaket);
  const [loadError, setLoadError] = useState<FishingFetchError | null>(null);
  const [infoSpecies, setInfoSpecies] = useState<string | null>(null);
  const loadGenRef = useRef(0);

  const setTab = (key: Tab) => {
    navigate({ search, hash: key }, { replace: true });
  };

  useEffect(() => {
    if (isMaket) {
      setWeekly(MOCK_WEEKLY);
      setAllTime(MOCK_ALL_TIME);
      setLoading(false);
      setLoadError(null);
      return;
    }

    const gen = ++loadGenRef.current;
    const secret = import.meta.env.VITE_ALBUM_LINK_SECRET ?? "";
    setLoading(true);
    setLoadError(null);

    void (async () => {
      const result = await fetchFishingStats(new URLSearchParams(search), secret);
      if (gen !== loadGenRef.current) return;

      if (result.ok === false) {
        setWeekly([]);
        setAllTime([]);
        setLoadError(result.error);
        setLoading(false);
        // В DEV без ?api= resolveApiBase даёт localhost — no_api там почти не бывает.
        toastForError(result.error);
        return;
      }

      setWeekly(result.data.week_leaders.map(mapCatchRow));
      setAllTime(result.data.trophies.map(mapCatchRow));
      setLoading(false);
    })();
  }, [isMaket, search]);

  const emptyHint = loading
    ? "Загрузка…"
    : loadError === "no_api"
      ? "Нет адреса API — откройте ссылку со стрима"
      : loadError
        ? "Не удалось загрузить данные"
        : undefined;

  return (
    <div className="fishing-page" style={{ minHeight: "100vh", position: "relative", overflowX: "hidden" }}>
      <Toaster richColors position="top-center" theme="dark" />
      <div
        className="fishing-bg"
        style={{ ["--fishing-bg" as string]: `url(${fishingBg})` }}
      />
      <FishingPixiBg />
      <div className="fishing-bg-veil" />
      <AutumnLeaves />

      <div style={{ position: "relative", zIndex: 2, maxWidth: 900, margin: "0 auto", padding: "48px 20px 80px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div
            style={{
              display: "inline-block",
              fontFamily: FONT_MONO,
              fontSize: 11,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "rgba(255,220,140,0.6)",
              background: "rgba(255,200,80,0.07)",
              border: "1px solid rgba(255,200,80,0.18)",
              padding: "5px 14px",
              borderRadius: 20,
              marginBottom: 16,
            }}
          >
            Игровая статистика · Рыбалка{isMaket ? " · макет" : ""}
          </div>
          <h1
            style={{
              fontFamily: FONT_SANS,
              fontSize: "clamp(38px, 7vw, 66px)",
              fontWeight: 800,
              color: "#fff8ee",
              textShadow: "0 4px 30px rgba(0,0,0,0.6)",
              lineHeight: 1.06,
              marginBottom: 12,
              letterSpacing: "-0.01em",
            }}
          >
            Доска трофеев
          </h1>
          <div style={{ display: "flex", alignItems: "center", gap: 16, margin: "0 auto", maxWidth: 280 }}>
            <div style={{ flex: 1, height: 1, background: "rgba(200,150,60,0.3)" }} />
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c8972a" }} />
            <div style={{ flex: 1, height: 1, background: "rgba(200,150,60,0.3)" }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 36, flexWrap: "wrap" }}>
          {(
            [
              ["weekly", "Рекорды недели"],
              ["alltime", "Абсолютные рекорды"],
              ["guide", "Как играть"],
            ] as [Tab, string][]
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              style={{
                fontFamily: FONT_SANS,
                fontSize: 14,
                fontWeight: 700,
                padding: "9px 22px",
                borderRadius: 30,
                border: tab === key ? "1.5px solid rgba(200,150,60,0.55)" : "1.5px solid rgba(255,255,255,0.12)",
                background: tab === key ? "linear-gradient(145deg, #fdf8ee, #f7edd8)" : "rgba(255,255,255,0.06)",
                color: tab === key ? "#5c3a10" : "rgba(255,235,180,0.6)",
                cursor: "pointer",
                boxShadow: tab === key ? "0 4px 16px rgba(40,20,0,0.15)" : "none",
                transition: "all 0.18s ease",
              }}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === "weekly" && (
          <Section
            title="Рекорды недели"
            subtitle="Лучший улов по каждому виду за текущую неделю"
            catches={weekly}
            emptyHint={emptyHint}
            onOpenFish={setInfoSpecies}
          />
        )}
        {tab === "alltime" && (
          <Section
            title="Абсолютные рекорды"
            subtitle="Самые тяжёлые уловы за всё время"
            catches={allTime}
            emptyHint={emptyHint}
            onOpenFish={setInfoSpecies}
          />
        )}
        {tab === "guide" && <GuideView />}

        <div
          style={{
            textAlign: "center",
            marginTop: 64,
            fontFamily: FONT_MONO,
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "rgba(255,220,140,0.18)",
          }}
        >
          fishing · mini-game leaderboard
        </div>
        <div
          style={{
            textAlign: "center",
            marginTop: 8,
            fontFamily: FONT_MONO,
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "rgba(255,220,140,0.18)",
          }}
        >
          © 2026 klon_008
        </div>
      </div>
      {infoSpecies && <FishInfoModal species={infoSpecies} onClose={() => setInfoSpecies(null)} />}
    </div>
  );
}
