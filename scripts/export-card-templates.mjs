/**
 * Export empty rarity card frames as plain SVG (+ CSS + preview HTML).
 * No React — drop into any project.
 *
 * Usage (PowerShell):
 *   node scripts/export-card-templates.mjs
 *
 * Output: card-templates/
 */

import { mkdirSync, writeFileSync, copyFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const OUT = join(ROOT, "card-templates");
const FX_SRC = join(ROOT, "src", "app", "styles", "cardEffects.css");

const W = 350;
const H = 490;
const IMG = { x: 20, y: 80, w: 310, h: 330 };

const CFG = {
  common: {
    name: "Common", color: "#9A8050",
    frameW: 11, goldBase: "#8B7040", goldHigh: "#B89858",
    gemMain: "#708090", gemAlt: "#556070",
    bgCenter: "#1a2038", bgEdge: "#0e1220",
    glowCol: "transparent", glowStr: 0,
    crown: false, filigree: false, rays: false,
    particles: 0, holo: false, cornerLv: 1, bottomGems: 0,
  },
  uncommon: {
    name: "Uncommon", color: "#7AD868",
    frameW: 14, goldBase: "#3A9850", goldHigh: "#78D878",
    gemMain: "#3A9850", gemAlt: "#2E7840",
    bgCenter: "#142238", bgEdge: "#0a1520",
    glowCol: "#48A858", glowStr: 10,
    crown: false, filigree: false, rays: false,
    particles: 8, holo: false, cornerLv: 2, bottomGems: 1,
  },
  rare: {
    name: "Rare", color: "#5898FF",
    frameW: 17, goldBase: "#2868D0", goldHigh: "#78B8FF",
    gemMain: "#2868D0", gemAlt: "#1858B8",
    bgCenter: "#0e1835", bgEdge: "#070f22",
    glowCol: "#3880F0", glowStr: 16,
    crown: false, filigree: true, rays: false,
    particles: 16, holo: false, cornerLv: 3, bottomGems: 2,
  },
  epic: {
    name: "Epic", color: "#9070F0",
    frameW: 22, goldBase: "#5A40A8", goldHigh: "#9888E8",
    gemMain: "#401090", gemAlt: "#5020A8",
    bgCenter: "#060318", bgEdge: "#030110",
    glowCol: "#402898", glowStr: 20,
    crown: false, filigree: true, rays: true,
    particles: 30, holo: false, cornerLv: 4, bottomGems: 3,
  },
  legendary: {
    name: "Legendary", color: "#FFB020",
    frameW: 26, goldBase: "#FFD700", goldHigh: "#FFF080",
    gemMain: "#FF8800", gemAlt: "#FF6600",
    bgCenter: "#080510", bgEdge: "#040208",
    glowCol: "#FFA000", glowStr: 28,
    crown: true, filigree: true, rays: true,
    particles: 50, holo: false, cornerLv: 5, bottomGems: 5,
  },
  mythic: {
    name: "Mythic", color: "#660f00",
    frameW: 24, goldBase: "#2A0800", goldHigh: "#8A2410",
    gemMain: "#660f00", gemAlt: "#3A0A00",
    bgCenter: "#0c0201", bgEdge: "#050100",
    glowCol: "#660f00", glowStr: 20,
    crown: true, filigree: true, rays: true,
    particles: 50, holo: false, mythic: true, cornerLv: 6, bottomGems: 6,
  },
  secretRare: {
    name: "Secret Rare", color: "#D4567A",
    frameW: 30, goldBase: "#FFD700", goldHigh: "#FFF080",
    gemMain: "#A82850", gemAlt: "#6B1535",
    bgCenter: "#0a0206", bgEdge: "#040102",
    glowCol: "#C83862", glowStr: 36,
    crown: true, filigree: true, rays: true,
    particles: 75, holo: true, cornerLv: 6, bottomGems: 7,
  },
};

const RARITIES = Object.keys(CFG);

const srng = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

function gemDiamond(cx, cy, w, h, fill, opacity = 1, stroke = "none", sw = 0) {
  return `<polygon points="${cx},${cy - h / 2} ${cx + w / 2},${cy} ${cx},${cy + h / 2} ${cx - w / 2},${cy}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}" opacity="${opacity}"/>`;
}

function starPoly(cx, cy, r, n, fill, opacity = 1, inner = 0.38) {
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = (i * Math.PI) / n - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * inner;
    return `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
  }).join(" ");
  return `<polygon points="${pts}" fill="${fill}" opacity="${opacity}"/>`;
}

function cornerGroup(lv, gold, goldH, gem, gemAlt) {
  let s = `<g>
    <path d="M 0,18 L 0,4 C 0,2 2,0 4,0 L 18,0" stroke="${gold}" stroke-width="1.5" fill="none" opacity="0.9"/>
    <circle cx="0" cy="0" r="2.5" fill="${goldH}" opacity="0.8"/>`;
  if (lv >= 2) {
    s += `<g transform="translate(11,11)">
      <path d="M 0,-9 C 3,-5 3,0 0,3 C -3,0 -3,-5 0,-9 Z" fill="${gold}" opacity="0.8"/>
      <path d="M 9,0 C 5,3 0,3 -3,0 C 0,-3 5,-3 9,0 Z" fill="${gold}" opacity="0.8"/>
      <path d="M 0,9 C -3,5 -3,0 0,-3 C 3,0 3,5 0,9 Z" fill="${gold}" opacity="0.8"/>
      <path d="M -9,0 C -5,-3 0,-3 3,0 C 0,3 -5,3 -9,0 Z" fill="${gold}" opacity="0.8"/>
      <circle cx="0" cy="0" r="3" fill="${goldH}" opacity="0.9"/>
    </g>`;
  }
  if (lv >= 3) {
    s += gemDiamond(5, -10, 9, 13, gem, 0.9);
    s += gemDiamond(5, -10, 4, 6, "white", 0.12);
    s += gemDiamond(-10, 5, 9, 13, gem, 0.9, gold, 0.5);
    s += gemDiamond(-10, 5, 4, 6, "white", 0.12);
    s += `<path d="M 0,20 C -6,20 -14,12 -14,5 C -14,1 -10,-1 -6,1" stroke="${gold}" stroke-width="0.8" fill="none" opacity="0.7"/>
    <path d="M 20,0 C 20,-6 12,-14 5,-14 C 1,-14 -1,-10 1,-6" stroke="${gold}" stroke-width="0.8" fill="none" opacity="0.7"/>`;
  }
  if (lv >= 4) {
    s += starPoly(20, 20, 5, 4, goldH, 0.7);
    s += `<path d="M -6,1 C -12,6 -10,16 -4,18 C 2,20 6,16 4,10" stroke="${gold}" stroke-width="0.75" fill="none" opacity="0.65"/>
    <path d="M 1,-6 C 6,-12 16,-10 18,-4 C 20,2 16,6 10,4" stroke="${gold}" stroke-width="0.75" fill="none" opacity="0.65"/>
    <circle cx="8" cy="8" r="2" fill="${goldH}" opacity="0.45"/>`;
  }
  if (lv >= 5) {
    s += gemDiamond(5, -20, 11, 17, gem, 0.95);
    s += gemDiamond(5, -20, 5, 8, "white", 0.15);
    s += gemDiamond(-20, 5, 11, 17, gem, 0.95, gold, 0.5);
    s += gemDiamond(-20, 5, 5, 8, "white", 0.15);
    s += `<path d="M -22,24 C -22,10 -10,0 0,0" stroke="${goldH}" stroke-width="0.5" fill="none" opacity="0.5"/>
    <path d="M 24,-22 C 10,-22 0,-10 0,0" stroke="${goldH}" stroke-width="0.5" fill="none" opacity="0.5"/>`;
    s += starPoly(24, 24, 7, 5, goldH, 0.6);
    s += starPoly(0, 0, 4, 4, goldH, 0.4);
  }
  if (lv >= 6) {
    s += gemDiamond(5, -30, 13, 20, gemAlt, 0.95);
    s += gemDiamond(5, -30, 6, 10, "white", 0.1);
    s += gemDiamond(-30, 5, 13, 20, gemAlt, 0.95);
    s += gemDiamond(-30, 5, 6, 10, "white", 0.1);
    s += starPoly(32, 32, 8, 6, goldH, 0.5);
    s += `<circle cx="5" cy="-30" r="5" fill="white" opacity="0.05"/>`;
  }
  s += `</g>`;
  return s;
}

function buildParticles(c, rarity) {
  const pts = [];
  let i = 0;
  let att = 0;
  const seed = rarity.charCodeAt(0) + 78; // "N" — fixed seed for empty templates
  const { x: imgX, y: imgY, w: imgW, h: imgH } = IMG;
  while (pts.length < c.particles && att < 3000) {
    att++;
    const x = srng(i * 4 + seed) * W;
    const y = srng(i * 4 + 1 + seed) * H;
    if (x > imgX - 4 && x < imgX + imgW + 4 && y > imgY - 4 && y < imgY + imgH + 4) {
      i++;
      continue;
    }
    pts.push({ x, y, r: 0.4 + srng(i * 4 + 2) * 2, op: 0.2 + srng(i * 4 + 3) * 0.65 });
    i++;
  }
  return pts;
}

function buildEmbers(rarity) {
  const seed = rarity.charCodeAt(0) + 78;
  return Array.from({ length: 26 }, (_, i) => ({
    x: 12 + srng(i * 5 + seed) * (W - 24),
    y: 120 + srng(i * 5 + 1 + seed) * (H - 130),
    r: 0.7 + srng(i * 5 + 2 + seed) * 1.6,
    dur: 2.4 + srng(i * 5 + 3 + seed) * 2.8,
    delay: srng(i * 5 + 4 + seed) * 4,
    drift: (srng(i * 5 + seed) - 0.5) * 26,
  }));
}

function mythicFx(uid, fw, embers) {
  const { x: imgX, y: imgY, w: imgW, h: imgH } = IMG;
  const pcx = imgX + imgW / 2;
  const pcy = imgY + imgH / 2;
  const clip = `url(#cc${uid})`;
  let s = `<g pointer-events="none">
    <defs>
      <radialGradient id="meb${uid}" cx="50%" cy="100%" r="60%">
        <stop offset="0%" stop-color="#661000" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="#2A0500" stop-opacity="0"/>
      </radialGradient>
      <linearGradient id="msw${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#050000"/>
        <stop offset="12%" stop-color="#3A0800"/>
        <stop offset="26%" stop-color="#661000"/>
        <stop offset="38%" stop-color="#8A1C08"/>
        <stop offset="48%" stop-color="#5A1000"/>
        <stop offset="56%" stop-color="#8A1C08"/>
        <stop offset="70%" stop-color="#661000"/>
        <stop offset="85%" stop-color="#2A0600"/>
        <stop offset="100%" stop-color="#050000"/>
      </linearGradient>
      <mask id="fmask${uid}">
        <rect x="0" y="0" width="${W}" height="${H}" rx="16" fill="white"/>
        <rect x="${fw + 1}" y="${fw + 1}" width="${W - fw * 2 - 2}" height="${H - fw * 2 - 2}" rx="10" fill="black"/>
      </mask>
    </defs>
    <g clip-path="${clip}">
      <g class="mythic-seal-cw" style="transform-origin:${pcx}px ${pcy}px">
        <circle cx="${pcx}" cy="${pcy}" r="${imgW * 0.51}" fill="none" stroke="#661000" stroke-width="0.5" stroke-dasharray="6 10" opacity="0.12"/>
      </g>
      <g class="mythic-seal-ccw" style="transform-origin:${pcx}px ${pcy}px">
        <circle cx="${pcx}" cy="${pcy}" r="${imgW * 0.38}" fill="none" stroke="#8A1C08" stroke-width="0.6" stroke-dasharray="4 16" opacity="0.14"/>
      </g>
    </g>
    <g mask="url(#fmask${uid})" style="mix-blend-mode:screen">
      <g class="mythic-sweep" style="transform-origin:${W / 2}px ${H / 2}px">
        <rect x="-500" y="-500" width="1350" height="1490" fill="url(#msw${uid})" opacity="0.55"/>
      </g>
    </g>
    <g clip-path="${clip}" style="mix-blend-mode:screen">
      <rect x="${fw + 1}" y="${fw + 1}" width="${W - fw * 2 - 2}" height="${H - fw * 2 - 2}" rx="10"
        fill="none" stroke="#661000" stroke-width="2.5" class="mythic-frame-pulse"/>
    </g>
    <g clip-path="${clip}" style="mix-blend-mode:screen">
      <rect x="0" y="${H * 0.72}" width="${W}" height="${H * 0.28}" fill="url(#meb${uid})" class="mythic-pool"/>
    </g>
    <g clip-path="${clip}" style="mix-blend-mode:screen">`;
  for (const e of embers.slice(0, 10)) {
    const startY = imgY + imgH - 30 + (e.y % 60);
    s += `<circle cx="${e.x}" cy="${startY}" r="${e.r * 0.7}" fill="${e.r > 1.4 ? "#8A1C08" : "#661000"}"
      class="mythic-ember" style="--dur:${e.dur * 0.65}s;--delay:${e.delay}s;--drift:${e.drift * 0.45}px"/>`;
  }
  s += `</g></g>`;
  return s;
}

function renderCardSvg(rarity) {
  const c = CFG[rarity];
  const fw = c.frameW;
  const uid = rarity;
  const { x: imgX, y: imgY, w: imgW, h: imgH } = IMG;
  const bpY = imgY + imgH + 6;
  const bpH = Math.max(H - fw - 4 - bpY, 36);
  const particles = buildParticles(c, rarity);
  const embers = c.mythic ? buildEmbers(rarity) : [];

  let defs = `
    <radialGradient id="bg${uid}" cx="50%" cy="45%" r="70%">
      <stop offset="0%" stop-color="${c.bgCenter}"/>
      <stop offset="100%" stop-color="${c.bgEdge}"/>
    </radialGradient>
    <linearGradient id="gv${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${c.goldHigh}"/>
      <stop offset="30%" stop-color="${c.goldBase}"/>
      <stop offset="55%" stop-color="${c.goldHigh}"/>
      <stop offset="80%" stop-color="${c.goldBase}"/>
      <stop offset="100%" stop-color="${c.goldHigh}"/>
    </linearGradient>
    <linearGradient id="gh${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${c.goldHigh}"/>
      <stop offset="50%" stop-color="${c.goldBase}"/>
      <stop offset="100%" stop-color="${c.goldHigh}"/>
    </linearGradient>
    <filter id="scf${uid}" x="-100%" y="-100%" width="300%" height="300%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <clipPath id="cc${uid}"><rect x="0" y="0" width="${W}" height="${H}" rx="16"/></clipPath>
    <clipPath id="ic${uid}"><rect x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" rx="7"/></clipPath>`;

  if (c.mythic) {
    defs += `
    <linearGradient id="mfo${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#661800"/>
      <stop offset="22%" stop-color="#1A0500"/>
      <stop offset="50%" stop-color="#4A1000"/>
      <stop offset="78%" stop-color="#1A0500"/>
      <stop offset="100%" stop-color="#661800"/>
    </linearGradient>
    <linearGradient id="mfi${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#8A2810"/>
      <stop offset="30%" stop-color="#5A1204"/>
      <stop offset="55%" stop-color="#9A3014"/>
      <stop offset="80%" stop-color="#5A1204"/>
      <stop offset="100%" stop-color="#8A2810"/>
    </linearGradient>`;
  }
  if (c.glowStr > 0) {
    defs += `
    <filter id="glw${uid}" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="${c.glowStr / 3}" result="blur"/>
      <feFlood flood-color="${c.glowCol}" flood-opacity="0.7" result="col"/>
      <feComposite in="col" in2="blur" operator="in" result="sh"/>
      <feMerge><feMergeNode in="sh"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>`;
  }
  if (c.holo) {
    defs += `
    <linearGradient id="holo${uid}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF0080" stop-opacity="0.22"/>
      <stop offset="14%" stop-color="#FF8000" stop-opacity="0.22"/>
      <stop offset="28%" stop-color="#FFD700" stop-opacity="0.22"/>
      <stop offset="43%" stop-color="#00FF60" stop-opacity="0.22"/>
      <stop offset="57%" stop-color="#0080FF" stop-opacity="0.22"/>
      <stop offset="71%" stop-color="#8000FF" stop-opacity="0.22"/>
      <stop offset="85%" stop-color="#FF00C0" stop-opacity="0.22"/>
      <stop offset="100%" stop-color="#FF0080" stop-opacity="0.22"/>
    </linearGradient>`;
  }

  let body = `<rect x="0" y="0" width="${W}" height="${H}" rx="16" fill="url(#bg${uid})"/>
    <g clip-path="url(#cc${uid})" opacity="0.07">
      <circle cx="175" cy="240" r="190" fill="none" stroke="${c.goldBase}" stroke-width="0.5"/>
      <circle cx="175" cy="240" r="140" fill="none" stroke="${c.goldBase}" stroke-width="0.4"/>
      <circle cx="175" cy="240" r="90" fill="none" stroke="${c.goldBase}" stroke-width="0.3"/>
    </g>`;

  if (c.filigree) {
    body += `<g clip-path="url(#cc${uid})" opacity="0.065">`;
    for (let i = 0; i < 11; i++) {
      body += `<line x1="${-80 + i * 50}" y1="0" x2="${80 + i * 50}" y2="${H}" stroke="${c.goldHigh}" stroke-width="0.5"/>`;
    }
    body += `</g>`;
  }

  body += `<g clip-path="url(#cc${uid})">`;
  for (const p of particles) {
    body += `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="${c.goldHigh}" opacity="${p.op}"/>`;
  }
  body += `</g>`;

  if (c.rays) {
    body += `<g clip-path="url(#cc${uid})" opacity="0.055">`;
    for (let i = 0; i < 18; i++) {
      const a = (i * 20 * Math.PI) / 180;
      body += `<line x1="175" y1="240" x2="${175 + 450 * Math.cos(a)}" y2="${240 + 450 * Math.sin(a)}" stroke="${c.goldHigh}" stroke-width="1.5"/>`;
    }
    body += `</g>`;
  }

  if (c.mythic) {
    body += `
      <rect x="${fw / 2}" y="${fw / 2}" width="${W - fw}" height="${H - fw}" rx="${16 - fw / 4}" fill="none" stroke="url(#mfo${uid})" stroke-width="${fw}"/>
      <rect x="${fw / 2}" y="${fw / 2}" width="${W - fw}" height="${H - fw}" rx="${16 - fw / 4}" fill="none" stroke="#120200" stroke-width="${fw * 0.42}" opacity="0.85"/>
      <rect x="${fw / 2}" y="${fw / 2}" width="${W - fw}" height="${H - fw}" rx="${16 - fw / 4}" fill="none" stroke="url(#mfi${uid})" stroke-width="${fw * 0.22}"/>
      <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="15.5" fill="none" stroke="#8A2810" stroke-width="0.6" opacity="0.4"/>
      <rect x="${fw + 1}" y="${fw + 1}" width="${W - fw * 2 - 2}" height="${H - fw * 2 - 2}" rx="${13 - fw / 4}" fill="none" stroke="#9A3014" stroke-width="0.85" opacity="0.5"/>
      <rect x="${fw / 2 - 3}" y="${fw / 2 - 3}" width="${W - fw + 6}" height="${H - fw + 6}" rx="18" fill="none" stroke="#4A1000" stroke-width="0.55" opacity="0.4"/>
      <rect x="${fw + 5}" y="${fw + 5}" width="${W - fw * 2 - 10}" height="${H - fw * 2 - 10}" rx="11" fill="none" stroke="#661000" stroke-width="0.55" opacity="0.35"/>`;
  } else {
    body += `
      <rect x="${fw / 2}" y="${fw / 2}" width="${W - fw}" height="${H - fw}" rx="${16 - fw / 4}" fill="none" stroke="url(#gv${uid})" stroke-width="${fw}"/>
      <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="15.5" fill="none" stroke="${c.goldHigh}" stroke-width="0.5" opacity="0.5"/>
      <rect x="${fw + 1}" y="${fw + 1}" width="${W - fw * 2 - 2}" height="${H - fw * 2 - 2}" rx="${13 - fw / 4}" fill="none" stroke="${c.goldHigh}" stroke-width="0.75" opacity="0.6"/>`;
    if (c.cornerLv >= 4) {
      body += `
      <rect x="${fw / 2 - 3}" y="${fw / 2 - 3}" width="${W - fw + 6}" height="${H - fw + 6}" rx="18" fill="none" stroke="${c.goldBase}" stroke-width="0.5" opacity="0.35"/>
      <rect x="${fw + 5}" y="${fw + 5}" width="${W - fw * 2 - 10}" height="${H - fw * 2 - 10}" rx="11" fill="none" stroke="${c.goldBase}" stroke-width="0.5" opacity="0.35"/>`;
    }
  }

  if (c.glowStr > 0) {
    body += `<rect x="${fw / 2}" y="${fw / 2}" width="${W - fw}" height="${H - fw}" rx="${16 - fw / 4}" fill="none" stroke="${c.glowCol}" stroke-width="${fw / 2 + 2}" filter="url(#glw${uid})" opacity="0.55"/>`;
  }

  const corners = [
    { tx: fw, ty: fw, rot: 0 },
    { tx: W - fw, ty: fw, rot: 90 },
    { tx: W - fw, ty: H - fw, rot: 180 },
    { tx: fw, ty: H - fw, rot: 270 },
  ];
  for (const pos of corners) {
    body += `<g transform="translate(${pos.tx},${pos.ty}) rotate(${pos.rot})">${cornerGroup(c.cornerLv, c.goldBase, c.goldHigh, c.gemMain, c.gemAlt)}</g>`;
  }

  // Nameplate (empty)
  body += `
    <rect x="${fw}" y="${fw}" width="${W - fw * 2}" height="64" rx="3" fill="${c.bgEdge}" opacity="0.72"/>
    <rect x="${fw + 3}" y="${fw + 3}" width="${W - fw * 2 - 6}" height="58" rx="2.5" fill="none" stroke="url(#gh${uid})" stroke-width="1"/>
    <rect x="${fw + 9}" y="${fw + 13}" width="${W - fw * 2 - 18}" height="32" rx="2" fill="${c.bgCenter}" opacity="0.8"/>
    <rect x="${fw + 9}" y="${fw + 13}" width="${W - fw * 2 - 18}" height="32" rx="2" fill="none" stroke="${c.goldBase}" stroke-width="0.6" opacity="0.5"/>
    <path d="M ${fw + 9},${fw + 13} C ${fw + 4},${fw + 14} ${fw + 2},${fw + 19} ${fw + 5},${fw + 24} C ${fw + 7},${fw + 28} ${fw + 11},${fw + 27} ${fw + 9},${fw + 22}" fill="${c.goldBase}" opacity="0.42"/>
    <path d="M ${W - fw - 9},${fw + 13} C ${W - fw - 4},${fw + 14} ${W - fw - 2},${fw + 19} ${W - fw - 5},${fw + 24} C ${W - fw - 7},${fw + 28} ${W - fw - 11},${fw + 27} ${W - fw - 9},${fw + 22}" fill="${c.goldBase}" opacity="0.42"/>
    <text data-slot="name" class="card-princess-name" x="175" y="${fw + 30}" text-anchor="middle" dominant-baseline="middle" fill="${c.goldHigh}" opacity="0.45" font-family="Georgia, 'Times New Roman', serif" font-size="14" letter-spacing="2">NAME</text>`;

  if (c.cornerLv >= 2) {
    body += gemDiamond(fw + 22, fw + 29, 7, 10, c.goldBase, 0.7);
    body += gemDiamond(W - fw - 22, fw + 29, 7, 10, c.goldBase, 0.7);
  }
  if (c.cornerLv >= 3) {
    body += gemDiamond(fw + 16, fw + 8, 6, 8, c.gemMain, 0.8);
    body += gemDiamond(W - fw - 16, fw + 8, 6, 8, c.gemMain, 0.8);
    body += gemDiamond(fw + 30, fw + 29, 5, 8, c.gemMain, 0.7);
    body += gemDiamond(W - fw - 30, fw + 29, 5, 8, c.gemMain, 0.7);
    body += `<g filter="url(#scf${uid})">
      ${gemDiamond(175, fw + 6, 14, 18, c.gemMain, 0.95)}
      ${gemDiamond(175, fw + 6, 7, 9, "white", 0.12)}
      ${starPoly(175, fw + 6, 4, 4, c.goldHigh, 0.3)}
    </g>`;
  }
  if (c.cornerLv >= 4) {
    body += starPoly(fw + 10, fw + 10, 5, 5, c.goldHigh, 0.6);
    body += starPoly(W - fw - 10, fw + 10, 5, 5, c.goldHigh, 0.6);
  }

  if (c.crown) {
    body += `<g transform="translate(175,${fw - 3})" filter="url(#scf${uid})">
      <path d="M -26,12 L -26,-2 L -17,-16 L -8,-2 L 0,-22 L 8,-2 L 17,-16 L 26,-2 L 26,12 Z" fill="${c.goldBase}" stroke="${c.goldHigh}" stroke-width="0.75"/>
      <circle cx="-17" cy="-12" r="3.5" fill="${c.gemMain}"/>
      <circle cx="0" cy="-18" r="4.5" fill="${c.gemMain}"/>
      <circle cx="17" cy="-12" r="3.5" fill="${c.gemMain}"/>
      <circle cx="-17" cy="-14" r="1" fill="white" opacity="0.25"/>
      <circle cx="0" cy="-20" r="1.2" fill="white" opacity="0.25"/>
      <circle cx="17" cy="-14" r="1" fill="white" opacity="0.25"/>`;
    for (let j = 0; j < 8; j++) {
      body += `<circle cx="${-24.5 + j * 7}" cy="10" r="2.5" fill="${c.goldHigh}" opacity="0.85"/>`;
    }
    body += `</g>`;
  }

  if (c.filigree) {
    const side = `
      <path d="M 0,-30 C -6,-20 -6,20 0,30" stroke="${c.goldBase}" stroke-width="1" fill="none"/>
      <path d="M 0,0 C -9,-7 -15,-2 -13,6 C -11,14 -4,11 0,4" stroke="${c.goldBase}" stroke-width="0.75" fill="${c.goldBase}" fill-opacity="0.18"/>
      <path d="M 0,0 C -9,7 -15,2 -13,-6 C -11,-14 -4,-11 0,-4" stroke="${c.goldBase}" stroke-width="0.75" fill="${c.goldBase}" fill-opacity="0.18"/>
      <circle cx="0" cy="0" r="3" fill="${c.goldHigh}" opacity="0.8"/>`;
    body += `<g transform="translate(${fw / 2},240)" opacity="0.75">${side}</g>
      <g transform="translate(${W - fw / 2},240) scale(-1,1)" opacity="0.75">${side}</g>`;
  }

  // Portrait slot (empty)
  if (c.glowStr > 0) {
    body += `<rect x="${imgX - 5}" y="${imgY - 5}" width="${imgW + 10}" height="${imgH + 10}" rx="11" fill="${c.glowCol}" opacity="0.1" filter="url(#glw${uid})"/>`;
  }
  body += `
    <rect x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" rx="7" fill="${c.bgCenter}"/>
    <rect data-slot="portrait-bg" x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" rx="7" fill="none" stroke="${c.goldBase}" stroke-width="1" stroke-dasharray="6 5" opacity="0.35"/>
    <text x="175" y="${imgY + imgH / 2}" text-anchor="middle" dominant-baseline="middle" fill="${c.goldHigh}" opacity="0.28" font-family="Georgia, serif" font-size="13" letter-spacing="1.5">PORTRAIT</text>
    <image data-slot="portrait" class="card-portrait" href="" x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" preserveAspectRatio="xMidYMid slice" clip-path="url(#ic${uid})"/>
    <rect x="${imgX}" y="${imgY}" width="${imgW}" height="${imgH}" rx="7" fill="none" stroke="url(#gv${uid})" stroke-width="2.5"/>
    <rect x="${imgX + 3}" y="${imgY + 3}" width="${imgW - 6}" height="${imgH - 6}" rx="5" fill="none" stroke="${c.goldHigh}" stroke-width="0.5" opacity="0.5"/>`;

  const portraitCorners = [
    { tx: imgX + 10, ty: imgY + 10, sx: 1, sy: 1 },
    { tx: imgX + imgW - 10, ty: imgY + 10, sx: -1, sy: 1 },
    { tx: imgX + 10, ty: imgY + imgH - 10, sx: 1, sy: -1 },
    { tx: imgX + imgW - 10, ty: imgY + imgH - 10, sx: -1, sy: -1 },
  ];
  for (const corner of portraitCorners) {
    body += `<g transform="translate(${corner.tx},${corner.ty}) scale(${corner.sx},${corner.sy})" opacity="0.75">
      <path d="M -7,0 C -7,-7 0,-7 0,0" stroke="${c.goldBase}" stroke-width="0.85" fill="none"/>
      <path d="M 0,-7 C 7,-7 7,0 0,0" stroke="${c.goldBase}" stroke-width="0.85" fill="none"/>
      <circle cx="0" cy="0" r="1.5" fill="${c.goldHigh}"/>
    </g>`;
  }

  // Bottom panel
  body += `
    <rect x="${fw}" y="${bpY}" width="${W - fw * 2}" height="${bpH}" rx="3" fill="${c.bgEdge}" opacity="0.72"/>
    <line x1="${fw + 4}" y1="${bpY + 6}" x2="${W - fw - 4}" y2="${bpY + 6}" stroke="url(#gh${uid})" stroke-width="0.8"/>
    <line x1="${fw + 4}" y1="${bpY + 9}" x2="${W - fw - 4}" y2="${bpY + 9}" stroke="${c.goldHigh}" stroke-width="0.25" opacity="0.4"/>
    <g transform="translate(175,${bpY + bpH / 2 + 2})" opacity="0.85">
      <line x1="${-(W - fw * 2) / 2 + 8}" y1="0" x2="-32" y2="0" stroke="url(#gh${uid})" stroke-width="0.8"/>
      <line x1="32" y1="0" x2="${(W - fw * 2) / 2 - 8}" y2="0" stroke="url(#gh${uid})" stroke-width="0.8"/>
      ${starPoly(0, 0, 9, 6, c.goldBase, 0.7)}
      ${starPoly(0, 0, 4.5, 6, c.goldHigh, 0.5)}
    </g>`;

  if (c.bottomGems > 0) {
    const count = Math.min(c.bottomGems, 7);
    const spacing = 18;
    const baseX = 175 - ((count - 1) * spacing) / 2;
    const y = bpY + bpH / 2 + 16;
    for (let j = 0; j < count; j++) {
      body += `<g filter="url(#scf${uid})">
        ${gemDiamond(baseX + j * spacing, y, 8, 12, c.gemMain, 0.88)}
        ${gemDiamond(baseX + j * spacing, y - 2, 4, 5, "white", 0.1)}
      </g>`;
    }
  }

  if (c.cornerLv >= 2) {
    body += starPoly(fw + 14, bpY + bpH / 2 + 2, 4.5, 4, c.goldBase, 0.55);
    body += starPoly(W - fw - 14, bpY + bpH / 2 + 2, 4.5, 4, c.goldBase, 0.55);
  }

  body += `<line x1="${fw + 4}" y1="${H - fw - 9}" x2="${W - fw - 4}" y2="${H - fw - 9}" stroke="${c.goldBase}" stroke-width="0.75" opacity="0.6"/>
    <g transform="translate(175,${H - fw / 2})">`;
  for (let j = 0; j < c.cornerLv; j++) {
    body += `<circle cx="${(j - (c.cornerLv - 1) / 2) * 9}" cy="0" r="2.5" fill="${c.color}" opacity="0.88"/>`;
  }
  body += `</g>`;

  if (c.holo) {
    body += `<g clip-path="url(#cc${uid})">
      <rect x="0" y="0" width="${W}" height="${H}" rx="16" fill="url(#holo${uid})" class="holo-layer" style="mix-blend-mode:screen"/>
    </g>`;
  }
  if (c.mythic) {
    body += mythicFx(uid, fw, embers);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
  class="card-svg" data-rarity="${rarity}" viewBox="0 0 ${W} ${H}"
  style="overflow:visible;width:100%;height:100%;display:block" role="img" aria-label="${c.name} card template">
  <defs>${defs}</defs>
  ${body}
</svg>
`;
}

function fillCardJs() {
  return `/**
 * Fill an empty card SVG template (no React).
 *
 * @param {SVGElement|ParentNode} root - SVG root or a container that holds it
 * @param {{ name?: string, portraitUrl?: string }} data
 */
export function fillCardTemplate(root, data = {}) {
  const svg = root instanceof SVGElement ? root : root.querySelector("svg.card-svg, svg[data-rarity]");
  if (!svg) throw new Error("card template SVG not found");

  if (data.name != null) {
    const el = svg.querySelector('[data-slot="name"]');
    if (el) {
      el.textContent = String(data.name).toUpperCase();
      el.setAttribute("opacity", "0.95");
    }
  }

  if (data.portraitUrl) {
    const img = svg.querySelector('[data-slot="portrait"]');
    if (img) {
      img.setAttribute("href", data.portraitUrl);
      img.setAttributeNS("http://www.w3.org/1999/xlink", "href", data.portraitUrl);
    }
    // hide placeholder dashed label once art is set
    const hint = svg.querySelector('text');
    // leave NAME alone; only hide PORTRAIT hint if present as sibling text near slot
    for (const t of svg.querySelectorAll("text")) {
      if (t.getAttribute("data-slot") === "name") continue;
      if ((t.textContent || "").trim() === "PORTRAIT") t.style.display = "none";
    }
    const dash = svg.querySelector('[data-slot="portrait-bg"]');
    if (dash) dash.style.display = "none";
  }

  return svg;
}

/** Convenience: fetch SVG text and inject into a host element. */
export async function mountCardTemplate(host, rarity, data) {
  const res = await fetch(\`./\${rarity}.svg\`);
  if (!res.ok) throw new Error(\`failed to load \${rarity}.svg\`);
  host.innerHTML = await res.text();
  return fillCardTemplate(host, data);
}
`;
}

function previewHtml() {
  const cards = RARITIES.map(
    (r) => `
    <figure class="tile">
      <figcaption>${CFG[r].name} <code>${r}</code></figcaption>
      <div class="frame" data-load="${r}"></div>
    </figure>`
  ).join("\n");

  return `<!doctype html>
<html lang="ru">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>Card templates — rarity frames</title>
  <link rel="stylesheet" href="./card-fx.css"/>
  <style>
    :root { color-scheme: dark; }
    body {
      margin: 0; padding: 2rem;
      font-family: Georgia, "Times New Roman", serif;
      background: radial-gradient(1200px 600px at 50% -10%, #1a2238, #08080e 60%);
      color: #e8e0d0;
    }
    h1 { font-weight: 400; letter-spacing: 0.04em; margin: 0 0 0.35rem; }
    p { opacity: 0.7; margin: 0 0 1.75rem; max-width: 42rem; line-height: 1.45; }
    code { font-family: ui-monospace, Consolas, monospace; font-size: 0.85em; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 1.75rem;
    }
    .tile { margin: 0; }
    figcaption { margin-bottom: 0.6rem; font-size: 0.95rem; opacity: 0.85; }
    .frame {
      aspect-ratio: 350 / 490;
      filter: drop-shadow(0 12px 28px rgba(0,0,0,0.55));
    }
    .frame svg { width: 100%; height: auto; display: block; }
  </style>
</head>
<body>
  <h1>Card rarity templates</h1>
  <p>
    Пустые рамки без арта. Подставь имя и картинку через
    <code>fillCardTemplate</code> из <code>fill-card.js</code>
    (слоты <code>data-slot="name"</code> / <code>data-slot="portrait"</code>).
    Пересобрать: <code>node scripts/export-card-templates.mjs</code>
  </p>
  <div class="grid">${cards}</div>
  <script type="module">
    for (const el of document.querySelectorAll("[data-load]")) {
      const r = el.getAttribute("data-load");
      const res = await fetch("./" + r + ".svg");
      el.innerHTML = await res.text();
    }
  </script>
</body>
</html>
`;
}

function readme() {
  return `# Card rarity templates (local)

Пустые HTML/SVG-рамки карточек по редкостям — **без React**.

Сгенерировано: \`node scripts/export-card-templates.mjs\`

## Файлы

| Файл | Назначение |
|------|------------|
| \`common.svg\` … \`secretRare.svg\` | пустой фрейм редкости |
| \`card-fx.css\` | анимации holo / mythic |
| \`fill-card.js\` | хелпер подстановки имени/арта |
| \`preview.html\` | визуальный просмотр всех рамок |

## Использование в другом проекте

\`\`\`html
<link rel="stylesheet" href="card-fx.css" />
<div id="card" style="width:280px"></div>
<script type="module">
  import { mountCardTemplate } from "./fill-card.js";
  await mountCardTemplate(document.getElementById("card"), "rare", {
    name: "Elsa",
    portraitUrl: "./elsa.webp",
  });
</script>
\`\`\`

Или вставь SVG инлайном и вызови \`fillCardTemplate(svgEl, { name, portraitUrl })\`.

Слоты в SVG:
- \`[data-slot="name"]\` — текст имени
- \`[data-slot="portrait"]\` — \`<image href="…">\`

Папка локальная / не для GitHub, пока не решите иначе.
`;
}

mkdirSync(OUT, { recursive: true });

for (const rarity of RARITIES) {
  const path = join(OUT, `${rarity}.svg`);
  writeFileSync(path, renderCardSvg(rarity), "utf8");
  console.log("wrote", path);
}

copyFileSync(FX_SRC, join(OUT, "card-fx.css"));
writeFileSync(join(OUT, "fill-card.js"), fillCardJs(), "utf8");
writeFileSync(join(OUT, "preview.html"), previewHtml(), "utf8");
writeFileSync(join(OUT, "README.md"), readme(), "utf8");

console.log("\nDone →", OUT);
console.log("Open preview: card-templates/preview.html");
