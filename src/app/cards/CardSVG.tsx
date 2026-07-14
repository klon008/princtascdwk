import { useMemo, type CSSProperties } from "react";
import type { RarityKey } from "../types";
import { CFG } from "../rarityConfig";
import { srng } from "../utils";
import { GemDiamond, StarPoly, CornerGroup } from "./svgHelpers";
import { MythicFX } from "./MythicFX";

export function CardSVG({ rarity, portrait, princessName, mythicVariant = 1 }: {
  rarity: RarityKey; portrait: string; princessName: string; mythicVariant?: number;
}) {
  const c = CFG[rarity];
  const W = 350, H = 490;
  const fw = c.frameW;
  const uid = rarity + princessName.replace(/\s/g, "") + (c.mythic ? `v${mythicVariant}` : "");

  const imgX = 20, imgY = 80, imgW = 310, imgH = 330;
  const bpY = imgY + imgH + 6;
  const bpH = Math.max(H - fw - 4 - bpY, 36);

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

  const emberList = useMemo(() => {
    if (!c.mythic) return [];
    const seed = rarity.charCodeAt(0) + princessName.charCodeAt(0);
    return Array.from({ length: 26 }, (_, i) => ({
      x: 12 + srng(i * 5 + seed) * (W - 24),
      y: 120 + srng(i * 5 + 1 + seed) * (H - 130),
      r: 0.7 + srng(i * 5 + 2 + seed) * 1.6,
      dur: 2.4 + srng(i * 5 + 3 + seed) * 2.8,
      delay: srng(i * 5 + 4 + seed) * 4,
      drift: (srng(i * 5 + seed) - 0.5) * 26,
    }));
  }, [rarity, princessName, c.mythic]);

  return (
    <svg className="card-svg" viewBox={`0 0 ${W} ${H}`} xmlns="http://www.w3.org/2000/svg" style={{ overflow: "visible", width: "100%", height: "100%" }}>
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
        {c.mythic && (
          <>
            {/* Outer rim — deep scorched metal */}
            <linearGradient id={`mfo${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#661800" />
              <stop offset="22%" stopColor="#1A0500" />
              <stop offset="50%" stopColor="#4A1000" />
              <stop offset="78%" stopColor="#1A0500" />
              <stop offset="100%" stopColor="#661800" />
            </linearGradient>
            {/* Inner track — muted ember */}
            <linearGradient id={`mfi${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8A2810" />
              <stop offset="30%" stopColor="#5A1204" />
              <stop offset="55%" stopColor="#9A3014" />
              <stop offset="80%" stopColor="#5A1204" />
              <stop offset="100%" stopColor="#8A2810" />
            </linearGradient>
          </>
        )}
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
      {c.mythic ? (
        <>
          {/* Outer metal rim */}
          <rect x={fw / 2} y={fw / 2} width={W - fw} height={H - fw} rx={16 - fw / 4}
            fill="none" stroke={`url(#mfo${uid})`} strokeWidth={fw} />
          {/* Dark groove between outer & inner */}
          <rect x={fw / 2} y={fw / 2} width={W - fw} height={H - fw} rx={16 - fw / 4}
            fill="none" stroke="#120200" strokeWidth={fw * 0.42} opacity="0.85" />
          {/* Inner molten track */}
          <rect x={fw / 2} y={fw / 2} width={W - fw} height={H - fw} rx={16 - fw / 4}
            fill="none" stroke={`url(#mfi${uid})`} strokeWidth={fw * 0.22} />
          {/* Card edge highlight */}
          <rect x="1" y="1" width={W - 2} height={H - 2} rx="15.5"
            fill="none" stroke="#8A2810" strokeWidth="0.6" opacity="0.4" />
          {/* Inner plate edge */}
          <rect x={fw + 1} y={fw + 1} width={W - fw * 2 - 2} height={H - fw * 2 - 2} rx={13 - fw / 4}
            fill="none" stroke="#9A3014" strokeWidth="0.85" opacity="0.5" />
          {/* Outer / inner fine rails */}
          <rect x={fw / 2 - 3} y={fw / 2 - 3} width={W - fw + 6} height={H - fw + 6} rx={18}
            fill="none" stroke="#4A1000" strokeWidth="0.55" opacity="0.4" />
          <rect x={fw + 5} y={fw + 5} width={W - fw * 2 - 10} height={H - fw * 2 - 10} rx={11}
            fill="none" stroke="#661000" strokeWidth="0.55" opacity="0.35" />
        </>
      ) : (
        <>
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
        className="card-princess-name"
        fill={c.goldHigh} opacity="0.95">
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
            style={{ mixBlendMode: "screen" as CSSProperties["mixBlendMode"] }} />
        </g>
      )}

      {c.mythic && (
        <MythicFX uid={uid} W={W} H={H} fw={fw}
          imgX={imgX} imgY={imgY} imgW={imgW} imgH={imgH} embers={emberList} />
      )}
    </svg>
  );
}
