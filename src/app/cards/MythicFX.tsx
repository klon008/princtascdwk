import type { CSSProperties } from "react";

export interface Ember { x: number; y: number; r: number; dur: number; delay: number; drift: number; }

export function MythicFX({ uid, W, H, fw, imgX, imgY, imgW, imgH, embers }: {
  uid: string; W: number; H: number; fw: number;
  imgX: number; imgY: number; imgW: number; imgH: number; embers: Ember[];
}) {
  const screen = { mixBlendMode: "screen" as CSSProperties["mixBlendMode"] };
  const clip = `url(#cc${uid})`;
  const pcx = imgX + imgW / 2;
  const pcy = imgY + imgH / 2;

  return (
    <g pointerEvents="none">
      <defs>
        <radialGradient id={`meb${uid}`} cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor="#661000" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#2A0500" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`msw${uid}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#050000" />
          <stop offset="12%" stopColor="#3A0800" />
          <stop offset="26%" stopColor="#661000" />
          <stop offset="38%" stopColor="#8A1C08" />
          <stop offset="48%" stopColor="#5A1000" />
          <stop offset="56%" stopColor="#8A1C08" />
          <stop offset="70%" stopColor="#661000" />
          <stop offset="85%" stopColor="#2A0600" />
          <stop offset="100%" stopColor="#050000" />
        </linearGradient>
        <mask id={`fmask${uid}`}>
          <rect x="0" y="0" width={W} height={H} rx="16" fill="white" />
          <rect x={fw + 1} y={fw + 1} width={W - fw * 2 - 2} height={H - fw * 2 - 2} rx="10" fill="black" />
        </mask>
      </defs>

      <g clipPath={clip}>
        <g className="mythic-seal-cw" style={{ transformOrigin: `${pcx}px ${pcy}px` }}>
          <circle cx={pcx} cy={pcy} r={imgW * 0.51}
            fill="none" stroke="#661000" strokeWidth="0.5" strokeDasharray="6 10" opacity="0.12" />
        </g>
        <g className="mythic-seal-ccw" style={{ transformOrigin: `${pcx}px ${pcy}px` }}>
          <circle cx={pcx} cy={pcy} r={imgW * 0.38}
            fill="none" stroke="#8A1C08" strokeWidth="0.6" strokeDasharray="4 16" opacity="0.14" />
        </g>
      </g>

      <g mask={`url(#fmask${uid})`} style={screen}>
        <g className="mythic-sweep" style={{ transformOrigin: `${W / 2}px ${H / 2}px` }}>
          <rect x="-500" y="-500" width="1350" height="1490" fill={`url(#msw${uid})`} opacity="0.55" />
        </g>
      </g>

      <g clipPath={clip} style={screen}>
        <rect x={fw + 1} y={fw + 1} width={W - fw * 2 - 2} height={H - fw * 2 - 2} rx="10"
          fill="none" stroke="#661000" strokeWidth="2.5" className="mythic-frame-pulse" />
      </g>

      <g clipPath={clip} style={screen}>
        <rect x="0" y={H * 0.72} width={W} height={H * 0.28}
          fill={`url(#meb${uid})`} className="mythic-pool" />
      </g>

      <g clipPath={clip} style={screen}>
        {embers.slice(0, 10).map((e, i) => {
          const startY = imgY + imgH - 30 + (e.y % 60);
          return (
            <circle key={i} cx={e.x} cy={startY} r={e.r * 0.7}
              fill={e.r > 1.4 ? "#8A1C08" : "#661000"}
              className="mythic-ember"
              style={{
                ["--dur" as string]: `${e.dur * 0.65}s`,
                ["--delay" as string]: `${e.delay}s`,
                ["--drift" as string]: `${e.drift * 0.45}px`,
              }} />
          );
        })}
      </g>
    </g>
  );
}
