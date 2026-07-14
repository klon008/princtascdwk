export function GemDiamond({ cx, cy, w, h, fill, stroke = "none", sw = 0, opacity = 1 }: {
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

export function StarPoly({ cx, cy, r, n = 5, inner = 0.38, fill, opacity = 1 }: {
  cx: number; cy: number; r: number; n?: number; inner?: number; fill: string; opacity?: number;
}) {
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = (i * Math.PI / n) - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * inner;
    return `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
  }).join(" ");
  return <polygon points={pts} fill={fill} opacity={opacity} />;
}

export function CornerGroup({ lv, gold, goldH, gem, gemAlt }: {
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
