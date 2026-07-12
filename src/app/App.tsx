import { useMemo, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import portraitImg from "@/imports/20260712_062815_flux_Portrait_of_Flounder_from_Disney_s_The_L_ComfyUI_00118_.png";
import elsaImg from "@/imports/20260712_065927_flux_Portrait_of_Elsa_from_Disney_s_Frozen__c_ComfyUI_00119_.png";
import auroraImg from "@/imports/editing_result_e6345ab87d3f11f1a0a5cefd6ad41579_1.jpg";

type RarityKey = "common" | "uncommon" | "rare" | "epic" | "legendary" | "secretRare";

interface RC {
  name: string;
  tier: string;
  color: string;
  frameW: number;
  goldBase: string;
  goldHigh: string;
  gemMain: string;
  gemAlt: string;
  bgCenter: string;
  bgEdge: string;
  glowCol: string;
  glowStr: number;
  crown: boolean;
  filigree: boolean;
  rays: boolean;
  particles: number;
  holo: boolean;
  cornerLv: number;
  bottomGems: number;
}

const CFG: Record<RarityKey, RC> = {
  common: {
    name: "Common", tier: "◆", color: "#9A8050",
    frameW: 11, goldBase: "#8B7040", goldHigh: "#B89858",
    gemMain: "#708090", gemAlt: "#556070",
    bgCenter: "#1a2038", bgEdge: "#0e1220",
    glowCol: "transparent", glowStr: 0,
    crown: false, filigree: false, rays: false,
    particles: 0, holo: false, cornerLv: 1, bottomGems: 0,
  },
  uncommon: {
    name: "Uncommon", tier: "◆◆", color: "#72C860",
    frameW: 14, goldBase: "#B0A060", goldHigh: "#D0BC78",
    gemMain: "#3A7848", gemAlt: "#2E6038",
    bgCenter: "#142238", bgEdge: "#0a1520",
    glowCol: "#3A784840", glowStr: 8,
    crown: false, filigree: false, rays: false,
    particles: 8, holo: false, cornerLv: 2, bottomGems: 1,
  },
  rare: {
    name: "Rare", tier: "◆◆◆", color: "#4888F0",
    frameW: 17, goldBase: "#D4AF37", goldHigh: "#F0D060",
    gemMain: "#1A50E8", gemAlt: "#1440CC",
    bgCenter: "#0e1835", bgEdge: "#070f22",
    glowCol: "#2050D0", glowStr: 14,
    crown: false, filigree: true, rays: false,
    particles: 16, holo: false, cornerLv: 3, bottomGems: 2,
  },
  epic: {
    name: "Epic", tier: "◆◆◆◆", color: "#9840E8",
    frameW: 22, goldBase: "#D4AF37", goldHigh: "#FFD700",
    gemMain: "#7018C8", gemAlt: "#9030E0",
    bgCenter: "#0f0828", bgEdge: "#080518",
    glowCol: "#8020C0", glowStr: 20,
    crown: false, filigree: true, rays: true,
    particles: 30, holo: false, cornerLv: 4, bottomGems: 3,
  },
  legendary: {
    name: "Legendary", tier: "◆◆◆◆◆", color: "#FFB020",
    frameW: 26, goldBase: "#FFD700", goldHigh: "#FFF080",
    gemMain: "#FF8800", gemAlt: "#FF6600",
    bgCenter: "#080510", bgEdge: "#040208",
    glowCol: "#FFA000", glowStr: 28,
    crown: true, filigree: true, rays: true,
    particles: 50, holo: false, cornerLv: 5, bottomGems: 5,
  },
  secretRare: {
    name: "Secret Rare", tier: "★", color: "#FF50FF",
    frameW: 30, goldBase: "#FFD700", goldHigh: "#FFF080",
    gemMain: "#EE00EE", gemAlt: "#CC00CC",
    bgCenter: "#060314", bgEdge: "#030108",
    glowCol: "#FF00FF", glowStr: 36,
    crown: true, filigree: true, rays: true,
    particles: 75, holo: true, cornerLv: 6, bottomGems: 7,
  },
};

interface CardDef {
  princess: string;
  rarity: RarityKey;
  portrait?: string;
}

// 24 cards — organically shuffled so rarities are interspersed
const CARDS: CardDef[] = [
  { princess: "Cinderella",  rarity: "common"     },
  { princess: "Belle",       rarity: "uncommon"   },
  { princess: "Ariel",       rarity: "rare"       },
  { princess: "Snow White",  rarity: "common"     },
  { princess: "Rapunzel",    rarity: "epic"       },
  { princess: "Jasmine",     rarity: "uncommon"   },
  { princess: "Moana",       rarity: "rare"       },
  { princess: "Pocahontas",  rarity: "common"     },
  { princess: "Aurora",      rarity: "legendary",  portrait: auroraImg },
  { princess: "Tiana",       rarity: "uncommon"   },
  { princess: "Merida",      rarity: "rare"       },
  { princess: "Asha",        rarity: "common"     },
  { princess: "Raya",        rarity: "epic"       },
  { princess: "Mulan",       rarity: "uncommon"   },
  { princess: "Anna",        rarity: "rare"       },
  { princess: "Nala",        rarity: "common"     },
  { princess: "Elsa",        rarity: "secretRare", portrait: elsaImg },
  { princess: "Megara",      rarity: "uncommon"   },
  { princess: "Esmeralda",   rarity: "rare"       },
  { princess: "Jane",        rarity: "common"     },
  { princess: "Mirabel",     rarity: "epic"       },
  { princess: "Tinker Bell", rarity: "uncommon"   },
  { princess: "Kida",        rarity: "rare"       },
  { princess: "Giselle",     rarity: "uncommon"   },
];

interface CardDetails {
  story: string;
  booster: string;
  obtainedDate: string;
}

const CARD_DETAILS: Record<string, CardDetails> = {
  "Cinderella": {
    story: "A kind-hearted girl whose patience and grace earned her a place in the royal court. Despite years of hardship, she never lost her warmth — and a single glass slipper proved that true nobility lives in the heart, not in lineage.",
    booster: "Royal Awakening Pack",
    obtainedDate: "February 14, 2025",
  },
  "Belle": {
    story: "A bookworm who saw beauty where others saw only a beast. Her courage and compassion broke an ancient enchantment, transforming a cursed palace into a home filled with light — and teaching an entire kingdom that love sees beyond appearances.",
    booster: "Enchanted Forest Pack",
    obtainedDate: "March 3, 2025",
  },
  "Ariel": {
    story: "A mermaid princess who traded her voice for legs and discovered that the greatest adventures begin when you follow your heart. She bridged two worlds — ocean and land — and proved that dreams are worth every sacrifice.",
    booster: "Mystic Tides Collection",
    obtainedDate: "January 20, 2025",
  },
  "Snow White": {
    story: "The fairest of all, whose gentle spirit survived dark enchantments, a poisoned apple, and the jealousy of a wicked queen. She awakened to a kingdom transformed by her enduring goodness and the love she inspired in all who knew her.",
    booster: "Golden Legacy Pack",
    obtainedDate: "April 7, 2025",
  },
  "Rapunzel": {
    story: "Locked in a tower for eighteen years, she carried her dream inside her like a lantern flame. When she finally stepped into the world, she illuminated everything around her — and discovered that the crown she sought had always belonged to her.",
    booster: "Moonlit Dreams Pack",
    obtainedDate: "March 21, 2025",
  },
  "Jasmine": {
    story: "A princess who refused to be a prize or a political arrangement. She walked disguised through the streets of Agrabah, sought truth over comfort, and chose her own destiny — proving that a free spirit cannot be caged by palace walls.",
    booster: "Crystal Kingdom Pack",
    obtainedDate: "February 28, 2025",
  },
  "Moana": {
    story: "Chosen by the ocean itself, she crossed the open sea to restore the heart of Te Fiti and save her island. Her navigation was not just of stars and waves, but of identity — discovering who she was by sailing beyond the horizon.",
    booster: "Mystic Tides Collection",
    obtainedDate: "May 11, 2025",
  },
  "Pocahontas": {
    story: "A daughter of the wind and river, she listened when others only fought. Her voice bridged two civilizations on the edge of war — and her courage changed the course of history with nothing more than the truth.",
    booster: "Enchanted Forest Pack",
    obtainedDate: "January 5, 2025",
  },
  "Aurora": {
    story: "Cursed at birth yet blessed with an enduring grace, she slept through fate and woke to find the world had waited for her. A princess of both wild forests and royal courts, she embodies the magic that lives between dreams and waking.",
    booster: "Starfall Collection",
    obtainedDate: "June 1, 2025",
  },
  "Tiana": {
    story: "The hardest-working woman in New Orleans, her dreams became real not through magic alone, but through determination, sacrifice, and love. She turned a kiss into a restaurant and a wish into a legacy — one beignet at a time.",
    booster: "Golden Legacy Pack",
    obtainedDate: "March 15, 2025",
  },
  "Merida": {
    story: "The only princess who fights for her own fate — with a bow and arrow and a will that cannot be bent. Her arrow flew true not toward a suitor, but toward freedom, and she broke a centuries-old curse with a mother's love and a daughter's courage.",
    booster: "Enchanted Forest Pack",
    obtainedDate: "April 19, 2025",
  },
  "Asha": {
    story: "A young stargazer whose wish was so pure it touched the cosmos. She called upon a cosmic guardian and discovered that the greatest magic is not granted by kings — it lives in the dreams of ordinary people who dare to believe.",
    booster: "Starfall Collection",
    obtainedDate: "February 2, 2025",
  },
  "Raya": {
    story: "The last dragon guardian of Kumandra, she learned that trust is the rarest magic in a broken world. When she finally leapt into faith — literally — she mended what hatred had shattered and restored the dragons to the sky.",
    booster: "Crystal Kingdom Pack",
    obtainedDate: "May 30, 2025",
  },
  "Mulan": {
    story: "She rode to war in her father's armor and returned a hero who had saved an empire. In a world that told her to be silent, she spoke with action — and proved that honor is not a matter of name, gender, or expectation.",
    booster: "Royal Awakening Pack",
    obtainedDate: "March 8, 2025",
  },
  "Anna": {
    story: "Fearless, warm, and endearingly clumsy, she crossed a frozen mountain range on sheer love. When the only force that could thaw eternal winter turned out to be a sisterly embrace, Anna proved it had been the answer all along.",
    booster: "Moonlit Dreams Pack",
    obtainedDate: "December 18, 2024",
  },
  "Nala": {
    story: "A lion queen who never stopped believing in the rightful king — even when he had forgotten himself. Her determination carried her across the savanna and brought Simba home to Pride Rock, where he was always meant to stand.",
    booster: "Golden Legacy Pack",
    obtainedDate: "January 29, 2025",
  },
  "Elsa": {
    story: "Born with the power of winter itself flowing through her hands, she built a kingdom of ice and silence — until love finally taught her that she was never the monster she feared. Her magic is not a curse. It is a crown.",
    booster: "Starfall Collection · Prismatic Edition",
    obtainedDate: "June 21, 2025",
  },
  "Megara": {
    story: "Sharp-tongued and fiercely self-reliant, she made a deal with darkness and paid a price she did not foresee. But when the moment came, she chose love over the immortality she had been promised — and that choice made her a hero.",
    booster: "Crystal Kingdom Pack",
    obtainedDate: "April 1, 2025",
  },
  "Esmeralda": {
    story: "A free spirit who danced in the cathedral square, her compassion for outcasts burned brighter than any torch. She shamed the powerful with her grace and lit the cobblestoned streets of Paris with a humanity that could not be extinguished.",
    booster: "Moonlit Dreams Pack",
    obtainedDate: "March 25, 2025",
  },
  "Jane": {
    story: "She arrived in the jungle with a sketchbook and a theory, and left with a home. A scientist who documented the extraordinary, she found that the most remarkable discovery of all was the bond between two worlds that shouldn't have fit together — but did.",
    booster: "Enchanted Forest Pack",
    obtainedDate: "May 4, 2025",
  },
  "Mirabel": {
    story: "The one Madrigal who received no magical gift — until everyone finally understood that the gift was always her. She held her family together when the miracle crumbled, and in doing so, became the miracle itself.",
    booster: "Royal Awakening Pack",
    obtainedDate: "February 20, 2025",
  },
  "Tinker Bell": {
    story: "A tiny fairy with a fierce temper, an even fiercer loyalty, and a talent for tinkering that kept Neverland running. She left pixie dust wherever she flew — and helped a boy who never wanted to grow up believe in something even more powerful than flight.",
    booster: "Moonlit Dreams Pack",
    obtainedDate: "April 13, 2025",
  },
  "Kida": {
    story: "An ancient Atlantean warrior-princess who had watched centuries pass like tides. When explorers arrived with a crystal and a question, she alone was brave enough to trust the answer — and awoke her civilization from stone, restoring its heart to the living.",
    booster: "Mystic Tides Collection",
    obtainedDate: "May 18, 2025",
  },
  "Giselle": {
    story: "A fairy-tale princess who tumbled into the real world still singing. She refused to surrender her belief in happily ever after — not because the world deserved it, but because she did. And in the end, her certainty made it true for everyone around her.",
    booster: "Crystal Kingdom Pack",
    obtainedDate: "June 7, 2025",
  },
};

const srng = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ─── SVG helpers ──────────────────────────────────────────────────────────────

function GemDiamond({ cx, cy, w, h, fill, stroke = "none", sw = 0, opacity = 1 }: {
  cx: number; cy: number; w: number; h: number; fill: string;
  stroke?: string; sw?: number; opacity?: number;
}) {
  return (
    <polygon
      points={`${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}`}
      fill={fill} stroke={stroke} strokeWidth={sw} opacity={opacity}
    />
  );
}

function StarPoly({ cx, cy, r, n = 5, inner = 0.38, fill, opacity = 1 }: {
  cx: number; cy: number; r: number; n?: number; inner?: number; fill: string; opacity?: number;
}) {
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = (i * Math.PI / n) - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * inner;
    return `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
  }).join(" ");
  return <polygon points={pts} fill={fill} opacity={opacity} />;
}

function CornerGroup({ lv, gold, goldH, gem, gemAlt }: {
  lv: number; gold: string; goldH: string; gem: string; gemAlt: string;
}) {
  return (
    <g>
      <path d="M 0,18 L 0,4 C 0,2 2,0 4,0 L 18,0" stroke={gold} strokeWidth="1.5" fill="none" opacity="0.9" />
      <circle cx="0" cy="0" r="2.5" fill={goldH} opacity="0.8" />
      {lv >= 2 && (
        <g transform="translate(11,11)">
          <path d="M 0,-9 C 3,-5 3,0 0,3 C -3,0 -3,-5 0,-9 Z" fill={gold} opacity="0.8" />
          <path d="M 9,0 C 5,3 0,3 -3,0 C 0,-3 5,-3 9,0 Z" fill={gold} opacity="0.8" />
          <path d="M 0,9 C -3,5 -3,0 0,-3 C 3,0 3,5 0,9 Z" fill={gold} opacity="0.8" />
          <path d="M -9,0 C -5,-3 0,-3 3,0 C 0,3 -5,3 -9,0 Z" fill={gold} opacity="0.8" />
          <circle cx="0" cy="0" r="3" fill={goldH} opacity="0.9" />
        </g>
      )}
      {lv >= 3 && (
        <>
          <GemDiamond cx={5} cy={-10} w={9} h={13} fill={gem} opacity={0.9} />
          <GemDiamond cx={5} cy={-10} w={4} h={6} fill="white" opacity={0.12} />
          <GemDiamond cx={-10} cy={5} w={9} h={13} fill={gem} stroke={gold} sw={0.5} opacity={0.9} />
          <GemDiamond cx={-10} cy={5} w={4} h={6} fill="white" opacity={0.12} />
          <path d="M 0,20 C -6,20 -14,12 -14,5 C -14,1 -10,-1 -6,1" stroke={gold} strokeWidth="0.8" fill="none" opacity="0.7" />
          <path d="M 20,0 C 20,-6 12,-14 5,-14 C 1,-14 -1,-10 1,-6" stroke={gold} strokeWidth="0.8" fill="none" opacity="0.7" />
        </>
      )}
      {lv >= 4 && (
        <>
          <StarPoly cx={20} cy={20} r={5} n={4} fill={goldH} opacity={0.7} />
          <path d="M -6,1 C -12,6 -10,16 -4,18 C 2,20 6,16 4,10" stroke={gold} strokeWidth="0.75" fill="none" opacity="0.65" />
          <path d="M 1,-6 C 6,-12 16,-10 18,-4 C 20,2 16,6 10,4" stroke={gold} strokeWidth="0.75" fill="none" opacity="0.65" />
          <circle cx="8" cy="8" r="2" fill={goldH} opacity="0.45" />
        </>
      )}
      {lv >= 5 && (
        <>
          <GemDiamond cx={5} cy={-20} w={11} h={17} fill={gem} opacity={0.95} />
          <GemDiamond cx={5} cy={-20} w={5} h={8} fill="white" opacity={0.15} />
          <GemDiamond cx={-20} cy={5} w={11} h={17} fill={gem} stroke={gold} sw={0.5} opacity={0.95} />
          <GemDiamond cx={-20} cy={5} w={5} h={8} fill="white" opacity={0.15} />
          <path d="M -22,24 C -22,10 -10,0 0,0" stroke={goldH} strokeWidth="0.5" fill="none" opacity="0.5" />
          <path d="M 24,-22 C 10,-22 0,-10 0,0" stroke={goldH} strokeWidth="0.5" fill="none" opacity="0.5" />
          <StarPoly cx={24} cy={24} r={7} n={5} fill={goldH} opacity={0.6} />
          <StarPoly cx={0} cy={0} r={4} n={4} fill={goldH} opacity={0.4} />
        </>
      )}
      {lv >= 6 && (
        <>
          <GemDiamond cx={5} cy={-30} w={13} h={20} fill={gemAlt} opacity={0.95} />
          <GemDiamond cx={5} cy={-30} w={6} h={10} fill="white" opacity={0.1} />
          <GemDiamond cx={-30} cy={5} w={13} h={20} fill={gemAlt} opacity={0.95} />
          <GemDiamond cx={-30} cy={5} w={6} h={10} fill="white" opacity={0.1} />
          <StarPoly cx={32} cy={32} r={8} n={6} fill={goldH} opacity={0.5} />
          <circle cx="5" cy="-30" r="5" fill="white" opacity="0.05" />
        </>
      )}
    </g>
  );
}

// ─── Card SVG ─────────────────────────────────────────────────────────────────

function CardSVG({ rarity, portrait, princessName }: {
  rarity: RarityKey; portrait: string; princessName: string;
}) {
  const c = CFG[rarity];
  const W = 350, H = 490;
  const fw = c.frameW;
  const uid = rarity + princessName.replace(/\s/g, "");

  const imgX = 20, imgY = 80, imgW = 310, imgH = 330;
  const bpY = imgY + imgH + 6;
  const bpH = Math.max(H - fw - 4 - bpY, 36);
  const nameFontSize = princessName.length > 9 ? 10 : princessName.length > 7 ? 11 : 13;

  const particles = useMemo(() => {
    const pts: Array<{ x: number; y: number; r: number; op: number }> = [];
    let i = 0, att = 0;
    const seed = rarity.charCodeAt(0) + princessName.charCodeAt(0);
    while (pts.length < c.particles && att < 3000) {
      att++;
      const x = srng(i * 4 + seed) * W;
      const y = srng(i * 4 + 1 + seed) * H;
      if (x > imgX - 4 && x < imgX + imgW + 4 && y > imgY - 4 && y < imgY + imgH + 4) { i++; continue; }
      pts.push({ x, y, r: 0.4 + srng(i * 4 + 2) * 2, op: 0.2 + srng(i * 4 + 3) * 0.65 });
      i++;
    }
    return pts;
  }, [rarity, princessName, c.particles]);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible", width: "100%", height: "100%" }}>
      <defs>
        <radialGradient id={`bg${uid}`} cx="50%" cy="45%" r="70%">
          <stop offset="0%" stopColor={c.bgCenter} />
          <stop offset="100%" stopColor={c.bgEdge} />
        </radialGradient>
        <linearGradient id={`gv${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={c.goldHigh} />
          <stop offset="30%" stopColor={c.goldBase} />
          <stop offset="55%" stopColor={c.goldHigh} />
          <stop offset="80%" stopColor={c.goldBase} />
          <stop offset="100%" stopColor={c.goldHigh} />
        </linearGradient>
        <linearGradient id={`gh${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={c.goldHigh} />
          <stop offset="50%" stopColor={c.goldBase} />
          <stop offset="100%" stopColor={c.goldHigh} />
        </linearGradient>
        {c.glowStr > 0 && (
          <filter id={`glw${uid}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur in="SourceGraphic" stdDeviation={c.glowStr / 3} result="blur" />
            <feFlood floodColor={c.glowCol} floodOpacity="0.7" result="col" />
            <feComposite in="col" in2="blur" operator="in" result="sh" />
            <feMerge><feMergeNode in="sh" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
        )}
        <filter id={`gml${uid}`} x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        {c.holo && (
          <linearGradient id={`holo${uid}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%"   stopColor="#FF0080" stopOpacity="0.22" />
            <stop offset="14%"  stopColor="#FF8000" stopOpacity="0.22" />
            <stop offset="28%"  stopColor="#FFD700" stopOpacity="0.22" />
            <stop offset="43%"  stopColor="#00FF60" stopOpacity="0.22" />
            <stop offset="57%"  stopColor="#0080FF" stopOpacity="0.22" />
            <stop offset="71%"  stopColor="#8000FF" stopOpacity="0.22" />
            <stop offset="85%"  stopColor="#FF00C0" stopOpacity="0.22" />
            <stop offset="100%" stopColor="#FF0080" stopOpacity="0.22" />
          </linearGradient>
        )}
        <clipPath id={`cc${uid}`}>
          <rect x="0" y="0" width={W} height={H} rx="16" />
        </clipPath>
        <clipPath id={`ic${uid}`}>
          <rect x={imgX} y={imgY} width={imgW} height={imgH} rx="7" />
        </clipPath>
      </defs>

      {/* Base */}
      <rect x="0" y="0" width={W} height={H} rx="16" fill={`url(#bg${uid})`} />

      {/* Background rings */}
      <g clipPath={`url(#cc${uid})`} opacity="0.07">
        <circle cx="175" cy="240" r="190" fill="none" stroke={c.goldBase} strokeWidth="0.5" />
        <circle cx="175" cy="240" r="140" fill="none" stroke={c.goldBase} strokeWidth="0.4" />
        <circle cx="175" cy="240" r="90"  fill="none" stroke={c.goldBase} strokeWidth="0.3" />
      </g>

      {/* Diagonal shimmers */}
      {c.filigree && (
        <g clipPath={`url(#cc${uid})`} opacity="0.065">
          {Array.from({ length: 11 }, (_, i) => (
            <line key={i} x1={-80 + i * 50} y1="0" x2={80 + i * 50} y2={H} stroke={c.goldHigh} strokeWidth="0.5" />
          ))}
        </g>
      )}

      {/* Particles */}
      <g clipPath={`url(#cc${uid})`}>
        {particles.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} fill={c.goldHigh} opacity={p.op} />
        ))}
      </g>

      {/* Light rays */}
      {c.rays && (
        <g clipPath={`url(#cc${uid})`} opacity="0.055">
          {Array.from({ length: 18 }, (_, i) => {
            const a = (i * 20) * Math.PI / 180;
            return <line key={i} x1={175} y1={240} x2={175 + 450 * Math.cos(a)} y2={240 + 450 * Math.sin(a)} stroke={c.goldHigh} strokeWidth="1.5" />;
          })}
        </g>
      )}

      {/* Frame */}
      <rect x={fw / 2} y={fw / 2} width={W - fw} height={H - fw} rx={16 - fw / 4}
        fill="none" stroke={`url(#gv${uid})`} strokeWidth={fw} />
      <rect x="1" y="1" width={W - 2} height={H - 2} rx="15.5"
        fill="none" stroke={c.goldHigh} strokeWidth="0.5" opacity="0.5" />
      <rect x={fw + 1} y={fw + 1} width={W - fw * 2 - 2} height={H - fw * 2 - 2} rx={13 - fw / 4}
        fill="none" stroke={c.goldHigh} strokeWidth="0.75" opacity="0.6" />
      {c.cornerLv >= 4 && (
        <>
          <rect x={fw / 2 - 3} y={fw / 2 - 3} width={W - fw + 6} height={H - fw + 6} rx={18}
            fill="none" stroke={c.goldBase} strokeWidth="0.5" opacity="0.35" />
          <rect x={fw + 5} y={fw + 5} width={W - fw * 2 - 10} height={H - fw * 2 - 10} rx={11}
            fill="none" stroke={c.goldBase} strokeWidth="0.5" opacity="0.35" />
        </>
      )}
      {c.glowStr > 0 && (
        <rect x={fw / 2} y={fw / 2} width={W - fw} height={H - fw} rx={16 - fw / 4}
          fill="none" stroke={c.glowCol} strokeWidth={fw / 2 + 2}
          filter={`url(#glw${uid})`} opacity="0.55" />
      )}

      {/* Corners */}
      {[
        { tx: fw, ty: fw, rot: 0 },
        { tx: W - fw, ty: fw, rot: 90 },
        { tx: W - fw, ty: H - fw, rot: 180 },
        { tx: fw, ty: H - fw, rot: 270 },
      ].map((pos, i) => (
        <g key={i} transform={`translate(${pos.tx},${pos.ty}) rotate(${pos.rot})`}>
          <CornerGroup lv={c.cornerLv} gold={c.goldBase} goldH={c.goldHigh} gem={c.gemMain} gemAlt={c.gemAlt} />
        </g>
      ))}

      {/* Nameplate */}
      <rect x={fw} y={fw} width={W - fw * 2} height={64} rx="3" fill={c.bgEdge} opacity="0.72" />
      <rect x={fw + 3} y={fw + 3} width={W - fw * 2 - 6} height={58} rx="2.5"
        fill="none" stroke={`url(#gh${uid})`} strokeWidth="1" />
      <rect x={fw + 9} y={fw + 13} width={W - fw * 2 - 18} height={32} rx="2"
        fill={c.bgCenter} opacity="0.8" />
      <rect x={fw + 9} y={fw + 13} width={W - fw * 2 - 18} height={32} rx="2"
        fill="none" stroke={c.goldBase} strokeWidth="0.6" opacity="0.5" />
      {/* Ribbon curl ends */}
      <path d={`M ${fw + 9},${fw + 13} C ${fw + 4},${fw + 14} ${fw + 2},${fw + 19} ${fw + 5},${fw + 24} C ${fw + 7},${fw + 28} ${fw + 11},${fw + 27} ${fw + 9},${fw + 22}`}
        fill={c.goldBase} opacity="0.42" />
      <path d={`M ${W - fw - 9},${fw + 13} C ${W - fw - 4},${fw + 14} ${W - fw - 2},${fw + 19} ${W - fw - 5},${fw + 24} C ${W - fw - 7},${fw + 28} ${W - fw - 11},${fw + 27} ${W - fw - 9},${fw + 22}`}
        fill={c.goldBase} opacity="0.42" />

      {/* Princess name */}
      <text x={175} y={fw + 30}
        textAnchor="middle" dominantBaseline="middle"
        fontFamily='"Cinzel", serif'
        fontSize={nameFontSize} fontWeight="700"
        fill={c.goldHigh} letterSpacing="3" opacity="0.95">
        {princessName.toUpperCase()}
      </text>

      {/* Flanking nameplate gems */}
      {c.cornerLv >= 2 && (
        <>
          <GemDiamond cx={fw + 22} cy={fw + 29} w={7} h={10} fill={c.goldBase} opacity={0.7} />
          <GemDiamond cx={W - fw - 22} cy={fw + 29} w={7} h={10} fill={c.goldBase} opacity={0.7} />
        </>
      )}
      {c.cornerLv >= 3 && (
        <>
          <GemDiamond cx={fw + 16} cy={fw + 8} w={6} h={8} fill={c.gemMain} opacity={0.8} />
          <GemDiamond cx={W - fw - 16} cy={fw + 8} w={6} h={8} fill={c.gemMain} opacity={0.8} />
          <GemDiamond cx={fw + 30} cy={fw + 29} w={5} h={8} fill={c.gemMain} opacity={0.7} />
          <GemDiamond cx={W - fw - 30} cy={fw + 29} w={5} h={8} fill={c.gemMain} opacity={0.7} />
        </>
      )}
      {c.cornerLv >= 3 && (
        <g filter={`url(#gml${uid})`}>
          <GemDiamond cx={175} cy={fw + 6} w={14} h={18} fill={c.gemMain} opacity={0.95} />
          <GemDiamond cx={175} cy={fw + 6} w={7} h={9} fill="white" opacity={0.12} />
          <StarPoly cx={175} cy={fw + 6} r={4} n={4} fill={c.goldHigh} opacity={0.3} />
        </g>
      )}
      {c.cornerLv >= 4 && (
        <>
          <StarPoly cx={fw + 10} cy={fw + 10} r={5} n={5} fill={c.goldHigh} opacity={0.6} />
          <StarPoly cx={W - fw - 10} cy={fw + 10} r={5} n={5} fill={c.goldHigh} opacity={0.6} />
        </>
      )}

      {/* Crown */}
      {c.crown && (
        <g transform={`translate(175,${fw - 3})`} filter={`url(#gml${uid})`}>
          <path d="M -26,12 L -26,-2 L -17,-16 L -8,-2 L 0,-22 L 8,-2 L 17,-16 L 26,-2 L 26,12 Z"
            fill={c.goldBase} stroke={c.goldHigh} strokeWidth="0.75" />
          <circle cx="-17" cy="-12" r="3.5" fill={c.gemMain} />
          <circle cx="0"   cy="-18" r="4.5" fill={c.gemMain} />
          <circle cx="17"  cy="-12" r="3.5" fill={c.gemMain} />
          <circle cx="-17" cy="-14" r="1"   fill="white" opacity="0.25" />
          <circle cx="0"   cy="-20" r="1.2" fill="white" opacity="0.25" />
          <circle cx="17"  cy="-14" r="1"   fill="white" opacity="0.25" />
          {[...Array(8)].map((_, j) => (
            <circle key={j} cx={-24.5 + j * 7} cy="10" r="2.5" fill={c.goldHigh} opacity="0.85" />
          ))}
        </g>
      )}

      {/* Filigree sides */}
      {c.filigree && (
        <>
          <g transform={`translate(${fw / 2},240)`} opacity="0.75">
            <path d="M 0,-30 C -6,-20 -6,20 0,30" stroke={c.goldBase} strokeWidth="1" fill="none" />
            <path d="M 0,0 C -9,-7 -15,-2 -13,6 C -11,14 -4,11 0,4" stroke={c.goldBase} strokeWidth="0.75" fill={c.goldBase} fillOpacity="0.18" />
            <path d="M 0,0 C -9,7 -15,2 -13,-6 C -11,-14 -4,-11 0,-4" stroke={c.goldBase} strokeWidth="0.75" fill={c.goldBase} fillOpacity="0.18" />
            <circle cx="0" cy="0" r="3" fill={c.goldHigh} opacity="0.8" />
          </g>
          <g transform={`translate(${W - fw / 2},240) scale(-1,1)`} opacity="0.75">
            <path d="M 0,-30 C -6,-20 -6,20 0,30" stroke={c.goldBase} strokeWidth="1" fill="none" />
            <path d="M 0,0 C -9,-7 -15,-2 -13,6 C -11,14 -4,11 0,4" stroke={c.goldBase} strokeWidth="0.75" fill={c.goldBase} fillOpacity="0.18" />
            <path d="M 0,0 C -9,7 -15,2 -13,-6 C -11,-14 -4,-11 0,-4" stroke={c.goldBase} strokeWidth="0.75" fill={c.goldBase} fillOpacity="0.18" />
            <circle cx="0" cy="0" r="3" fill={c.goldHigh} opacity="0.8" />
          </g>
        </>
      )}

      {/* Portrait image */}
      {c.glowStr > 0 && (
        <rect x={imgX - 5} y={imgY - 5} width={imgW + 10} height={imgH + 10} rx="11"
          fill={c.glowCol} opacity="0.1" filter={`url(#glw${uid})`} />
      )}
      <rect x={imgX} y={imgY} width={imgW} height={imgH} rx="7" fill="white" />
      <image href={portrait} x={imgX} y={imgY} width={imgW} height={imgH}
        preserveAspectRatio="xMidYMid slice" clipPath={`url(#ic${uid})`} />
      <rect x={imgX} y={imgY} width={imgW} height={imgH} rx="7"
        fill="none" stroke={`url(#gv${uid})`} strokeWidth="2.5" />
      <rect x={imgX + 3} y={imgY + 3} width={imgW - 6} height={imgH - 6} rx="5"
        fill="none" stroke={c.goldHigh} strokeWidth="0.5" opacity="0.5" />
      {/* Corner curls inside portrait */}
      {[
        { tx: imgX + 10, ty: imgY + 10, sx: 1, sy: 1 },
        { tx: imgX + imgW - 10, ty: imgY + 10, sx: -1, sy: 1 },
        { tx: imgX + 10, ty: imgY + imgH - 10, sx: 1, sy: -1 },
        { tx: imgX + imgW - 10, ty: imgY + imgH - 10, sx: -1, sy: -1 },
      ].map((corner, i) => (
        <g key={i} transform={`translate(${corner.tx},${corner.ty}) scale(${corner.sx},${corner.sy})`} opacity="0.75">
          <path d="M -7,0 C -7,-7 0,-7 0,0" stroke={c.goldBase} strokeWidth="0.85" fill="none" />
          <path d="M 0,-7 C 7,-7 7,0 0,0" stroke={c.goldBase} strokeWidth="0.85" fill="none" />
          <circle cx="0" cy="0" r="1.5" fill={c.goldHigh} />
        </g>
      ))}

      {/* Bottom panel */}
      <rect x={fw} y={bpY} width={W - fw * 2} height={bpH} rx="3" fill={c.bgEdge} opacity="0.72" />
      <line x1={fw + 4} y1={bpY + 6} x2={W - fw - 4} y2={bpY + 6} stroke={`url(#gh${uid})`} strokeWidth="0.8" />
      <line x1={fw + 4} y1={bpY + 9} x2={W - fw - 4} y2={bpY + 9} stroke={c.goldHigh} strokeWidth="0.25" opacity="0.4" />

      <g transform={`translate(175,${bpY + bpH / 2 + 2})`} opacity="0.85">
        <line x1={-(W - fw * 2) / 2 + 8} y1="0" x2={-32} y2="0" stroke={`url(#gh${uid})`} strokeWidth="0.8" />
        <line x1={32} y1="0" x2={(W - fw * 2) / 2 - 8} y2="0" stroke={`url(#gh${uid})`} strokeWidth="0.8" />
        <StarPoly cx={0} cy={0} r={9} n={6} fill={c.goldBase} opacity={0.7} />
        <StarPoly cx={0} cy={0} r={4.5} n={6} fill={c.goldHigh} opacity={0.5} />
      </g>

      {c.bottomGems > 0 && (() => {
        const count = Math.min(c.bottomGems, 7);
        const spacing = 18;
        const baseX = 175 - ((count - 1) * spacing / 2);
        const y = bpY + bpH / 2 + 16;
        return Array.from({ length: count }, (_, j) => (
          <g key={j} filter={`url(#gml${uid})`}>
            <GemDiamond cx={baseX + j * spacing} cy={y} w={8} h={12} fill={c.gemMain} opacity={0.88} />
            <GemDiamond cx={baseX + j * spacing} cy={y - 2} w={4} h={5} fill="white" opacity={0.1} />
          </g>
        ));
      })()}

      {c.cornerLv >= 2 && (
        <>
          <StarPoly cx={fw + 14} cy={bpY + bpH / 2 + 2} r={4.5} n={4} fill={c.goldBase} opacity={0.55} />
          <StarPoly cx={W - fw - 14} cy={bpY + bpH / 2 + 2} r={4.5} n={4} fill={c.goldBase} opacity={0.55} />
        </>
      )}

      <line x1={fw + 4} y1={H - fw - 9} x2={W - fw - 4} y2={H - fw - 9} stroke={c.goldBase} strokeWidth="0.75" opacity="0.6" />

      {/* Rarity pips */}
      <g transform={`translate(175,${H - fw / 2})`}>
        {Array.from({ length: c.cornerLv }, (_, j) => (
          <circle key={j} cx={(j - (c.cornerLv - 1) / 2) * 9} cy="0" r="2.5" fill={c.color} opacity="0.88" />
        ))}
      </g>

      {/* Holographic overlay */}
      {c.holo && (
        <g clipPath={`url(#cc${uid})`}>
          <rect x="0" y="0" width={W} height={H} rx="16"
            fill={`url(#holo${uid})`} className="holo-layer"
            style={{ mixBlendMode: "screen" as React.CSSProperties["mixBlendMode"] }} />
        </g>
      )}
    </svg>
  );
}

// ─── Card tile with forwarded ref ─────────────────────────────────────────────

function CardTile({ princess, rarity, idx, tileRef, portrait, onClick }: {
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
    {/* Inner div: the actual tilt target, no animation applied here */}
    <div
      ref={tileRef}
      className="flex flex-col items-center gap-2"
      style={{ position: "relative", willChange: "transform", cursor: "pointer" }}
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
      <div style={{
        width: "100%",
        aspectRatio: "5/7",
        filter: cfg.glowStr > 0
          ? `drop-shadow(0 0 ${Math.round(cfg.glowStr * 0.4)}px ${cfg.glowCol}65)`
          : "drop-shadow(0 6px 18px rgba(0,0,0,0.75))",
      }}>
        <CardSVG rarity={rarity} portrait={portrait ?? portraitImg} princessName={princess} />
      </div>

      {/* Rarity badge */}
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: cfg.color, boxShadow: `0 0 5px ${cfg.color}` }} />
          <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.18em] uppercase"
            style={{ color: cfg.color, fontFamily: '"Cinzel", serif' }}>
            {cfg.name}
          </span>
        </div>
        <span className="text-[7px] tracking-widest" style={{ color: cfg.color, opacity: 0.5 }}>
          {cfg.tier}
        </span>
      </div>
    </div>
    </div>
  );
}

// ─── Card detail modal ────────────────────────────────────────────────────────

function CardModal({ card, onClose }: { card: CardDef; onClose: () => void }) {
  const cfg = CFG[card.rarity];
  const details = CARD_DETAILS[card.princess];
  const portrait = card.portrait ?? portraitImg;

  // 3D tilt for the modal card
  const modalCardRef = useRef<HTMLDivElement>(null);
  const onCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = modalCardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const rx = -(dy / (rect.height / 2)) * 12;
    const ry =  (dx / (rect.width  / 2)) * 12;
    el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(1.03)`;
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

  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: "rgba(1,2,8,0.88)", backdropFilter: "blur(8px)" }} />

      {/* Panel */}
      <motion.div
        className="relative z-10 flex flex-col lg:flex-row gap-6 lg:gap-10 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
        initial={{ opacity: 0, scale: 0.92, y: 24 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 16 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={e => e.stopPropagation()}
      >
        {/* ── LEFT: card ── */}
        <div className="flex-shrink-0 flex flex-col items-center lg:items-start gap-4"
          style={{ width: "100%", maxWidth: 260, margin: "0 auto" }}>
          <div
            ref={modalCardRef}
            style={{
              width: "100%",
              aspectRatio: "5/7",
              willChange: "transform",
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

          {/* Rarity badge under card */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ border: `1px solid ${cfg.color}40`, background: `${cfg.color}12` }}>
            <div className="w-2 h-2 rounded-full" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
            <span className="text-xs font-bold tracking-widest uppercase"
              style={{ color: cfg.color, fontFamily: '"Cinzel", serif' }}>
              {cfg.name}
            </span>
            <span className="text-xs ml-1" style={{ color: cfg.color, opacity: 0.55 }}>{cfg.tier}</span>
          </div>
        </div>

        {/* ── RIGHT: info ── */}
        <div className="flex-1 flex flex-col gap-5 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] tracking-[0.4em] mb-1 uppercase" style={{ color: "#4A5A7A" }}>
                Disney Princess Collection
              </p>
              <h2 className="text-2xl sm:text-3xl font-black tracking-widest"
                style={{
                  fontFamily: '"Cinzel Decorative", serif',
                  background: `linear-gradient(135deg, ${cfg.goldBase ?? "#9A8050"}, ${cfg.goldHigh ?? "#F0D060"}, ${cfg.goldBase ?? "#9A8050"})`,
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                {card.princess}
              </h2>
            </div>
            {/* Close button */}
            <button
              onClick={onClose}
              className="flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-colors"
              style={{ border: "1px solid rgba(212,175,55,0.25)", background: "rgba(212,175,55,0.08)", color: "#D4AF37" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div className="h-px" style={{ background: `linear-gradient(to right, ${cfg.color}50, transparent)` }} />

          {/* Story */}
          <div>
            <p className="text-[10px] tracking-[0.35em] uppercase mb-3" style={{ color: "#4A5A7A" }}>
              Character History
            </p>
            <p className="text-sm sm:text-base leading-relaxed"
              style={{ color: "#C8CEDC", fontFamily: '"IM Fell English", serif', fontStyle: "italic", lineHeight: 1.85 }}>
              {details?.story ?? "A legendary figure whose story is yet to be fully told."}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px mt-auto" style={{ background: "rgba(212,175,55,0.12)" }} />

          {/* Acquisition info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl p-4" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)" }}>
              <p className="text-[9px] tracking-[0.35em] uppercase mb-1.5" style={{ color: "#4A5A7A" }}>Booster Pack</p>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="3" width="12" height="9" rx="1.5" stroke="#D4AF37" strokeWidth="1.2"/>
                  <path d="M4 3V2a3 3 0 016 0v1" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M5 7h4M7 5v4" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <span className="text-xs font-semibold" style={{ color: "#D4AF37", fontFamily: '"Cinzel", serif' }}>
                  {details?.booster ?? "Unknown Pack"}
                </span>
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)" }}>
              <p className="text-[9px] tracking-[0.35em] uppercase mb-1.5" style={{ color: "#4A5A7A" }}>Date Obtained</p>
              <div className="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="2.5" width="12" height="10" rx="1.5" stroke="#D4AF37" strokeWidth="1.2"/>
                  <path d="M1 6h12" stroke="#D4AF37" strokeWidth="1.2"/>
                  <path d="M4 1v3M10 1v3" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <span className="text-xs font-semibold" style={{ color: "#D4AF37", fontFamily: '"Cinzel", serif' }}>
                  {details?.obtainedDate ?? "Unknown"}
                </span>
              </div>
            </div>
          </div>

          {/* Card number */}
          <p className="text-[9px] tracking-[0.3em] uppercase text-right" style={{ color: "#252E42" }}>
            Fantasy Collector Series · No. {String(CARDS.findIndex(c => c.princess === card.princess) + 1).padStart(3, "0")} / {String(CARDS.length).padStart(3, "0")}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardDef | null>(null);

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
          el.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
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
    <div className="min-h-screen bg-[#030610] relative" style={{ fontFamily: '"Cinzel", serif' }}>

      <style>{`
        @keyframes holo-shift {
          0%, 100% { opacity: 0.5; filter: hue-rotate(0deg) saturate(1.5); }
          50%       { opacity: 0.85; filter: hue-rotate(180deg) saturate(2.2); }
        }
        .holo-layer { animation: holo-shift 3s ease-in-out infinite; }

        @keyframes twinkle {
          0%, 100% { opacity: var(--op); }
          50%       { opacity: calc(var(--op) * 0.15); }
        }
        @keyframes card-rise {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }
        .card-enter { animation: card-rise 0.55s ease-out both; }
      `}</style>

      {/* Star field */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        {stars.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.s} fill="#D4AF37" opacity={s.o}
            style={{ "--op": s.o, animation: `twinkle ${s.d}s ${i * 0.12}s ease-in-out infinite` } as React.CSSProperties} />
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
      <header className="relative z-10 text-center pt-10 pb-8">
        <p className="text-[10px] tracking-[0.5em] text-[#3A4A6A] mb-2 uppercase">
          A Fantasy Collector's Compendium
        </p>
        <h1 className="text-3xl sm:text-5xl font-black tracking-widest"
          style={{
            fontFamily: '"Cinzel Decorative", serif',
            background: "linear-gradient(135deg, #9A8050 0%, #F0D060 35%, #D4AF37 55%, #F0D060 75%, #9A8050 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
          Enchanted Archive
        </h1>
        <p className="mt-3 text-[10px] sm:text-xs tracking-[0.3em] text-[#50608A] uppercase">
          Disney Princess Collection · {CARDS.length} Cards · 6 Rarities
        </p>
        <div className="flex items-center justify-center gap-3 mt-4 opacity-35">
          <div className="h-px w-28 sm:w-44" style={{ background: "linear-gradient(to right, transparent, #D4AF37)" }} />
          <svg width="14" height="14" viewBox="-7 -7 14 14">
            <StarPoly cx={0} cy={0} r={6} n={8} inner={0.5} fill="#D4AF37" opacity={1} />
          </svg>
          <div className="h-px w-28 sm:w-44" style={{ background: "linear-gradient(to left, transparent, #D4AF37)" }} />
        </div>
      </header>

      {/* Card grid */}
      <main className="relative z-10 px-3 sm:px-6 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-5 max-w-[1600px] mx-auto">
          {CARDS.map((card, idx) => (
            <CardTile
              key={idx}
              idx={idx}
              princess={card.princess}
              rarity={card.rarity}
              portrait={card.portrait}
              tileRef={el => { tileRefs.current[idx] = el; }}
              onClick={() => setSelectedCard(card)}
            />
          ))}
        </div>

        {/* Footer ornament */}
        <div className="text-center mt-14 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 opacity-20">
            <div className="h-px w-16" style={{ background: "linear-gradient(to right, transparent, #D4AF37)" }} />
            <svg width="10" height="10" viewBox="-5 -5 10 10">
              <StarPoly cx={0} cy={0} r={4} n={4} fill="#D4AF37" opacity={1} />
            </svg>
            <div className="h-px w-16" style={{ background: "linear-gradient(to left, transparent, #D4AF37)" }} />
          </div>
          <p className="text-[9px] tracking-[0.4em] uppercase" style={{ color: "#1E2840" }}>
            Fantasy Collector Series · Template Edition · No. 001
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
