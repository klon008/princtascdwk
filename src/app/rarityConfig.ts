import type { RarityKey } from "./types";

export interface RC {
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
  mythic?: boolean;
  cornerLv: number;
  bottomGems: number;
}

export const CFG: Record<RarityKey, RC> = {
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
    name: "Uncommon", tier: "◆◆", color: "#7AD868",
    frameW: 14, goldBase: "#3A9850", goldHigh: "#78D878",
    gemMain: "#3A9850", gemAlt: "#2E7840",
    bgCenter: "#142238", bgEdge: "#0a1520",
    glowCol: "#48A858", glowStr: 10,
    crown: false, filigree: false, rays: false,
    particles: 8, holo: false, cornerLv: 2, bottomGems: 1,
  },
  rare: {
    name: "Rare", tier: "◆◆◆", color: "#5898FF",
    frameW: 17, goldBase: "#2868D0", goldHigh: "#78B8FF",
    gemMain: "#2868D0", gemAlt: "#1858B8",
    bgCenter: "#0e1835", bgEdge: "#070f22",
    glowCol: "#3880F0", glowStr: 16,
    crown: false, filigree: true, rays: false,
    particles: 16, holo: false, cornerLv: 3, bottomGems: 2,
  },
  epic: {
    name: "Epic", tier: "◆◆◆◆", color: "#9070F0",
    frameW: 22, goldBase: "#5A40A8", goldHigh: "#9888E8",
    gemMain: "#401090", gemAlt: "#5020A8",
    bgCenter: "#060318", bgEdge: "#030110",
    glowCol: "#402898", glowStr: 20,
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
  mythic: {
    name: "Mythic", tier: "✦", color: "#660f00",
    frameW: 24, goldBase: "#2A0800", goldHigh: "#8A2410",
    gemMain: "#660f00", gemAlt: "#3A0A00",
    bgCenter: "#0c0201", bgEdge: "#050100",
    glowCol: "#660f00", glowStr: 20,
    crown: true, filigree: true, rays: true,
    particles: 50, holo: false, mythic: true, cornerLv: 6, bottomGems: 6,
  },
  secretRare: {
    name: "Secret Rare", tier: "★", color: "#D4567A",
    frameW: 30, goldBase: "#FFD700", goldHigh: "#FFF080",
    gemMain: "#A82850", gemAlt: "#6B1535",
    bgCenter: "#0a0206", bgEdge: "#040102",
    glowCol: "#C83862", glowStr: 36,
    crown: true, filigree: true, rays: true,
    particles: 75, holo: true, cornerLv: 6, bottomGems: 7,
  },
};
