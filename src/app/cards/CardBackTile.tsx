import cardBackImg from "@/imports/card-back.svg";

export function CardBackTile({ idx, tileRef }: {
  idx: number;
  tileRef: (el: HTMLDivElement | null) => void;
}) {
  return (
    <div className="card-enter" style={{ animationDelay: `${idx * 0.04}s` }}>
      <div className="card-tilt-scene">
        <div
          ref={tileRef}
          className="card-tilt-target flex flex-col items-center gap-2"
          style={{ position: "relative" }}
        >
          <div className="card-art" style={{
            width: "100%",
            aspectRatio: "5/7",
            filter: "drop-shadow(0 8px 28px rgba(40,20,0,0.7)) drop-shadow(0 0 12px rgba(212,175,55,0.18))",
          }}>
            <img
              src={cardBackImg}
              alt=""
              className="card-svg"
              width="100%"
              height="100%"
              style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
              draggable={false}
            />
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#D4AF37", boxShadow: "0 0 5px #D4AF37" }} />
            <span className="type-label type-label--tile" style={{ color: "#D4AF37" }}>
              Рубашка
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
