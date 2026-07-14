import { useRef, useState, type PointerEvent } from "react";
import cardBackImg from "@/imports/card-back.svg";
import type { RarityKey } from "../types";
import { CardSVG } from "./CardSVG";

type Props = {
  rarity: RarityKey;
  portrait: string;
  princessName: string;
  glowFilter?: string;
  /** Resolved URL рубашки (из resolveCardBack / серии) */
  cardBackSrc?: string;
};

const DRAG_SENS = 0.45;

export function Card3DViewer({
  rarity,
  portrait,
  princessName,
  glowFilter,
  cardBackSrc = cardBackImg,
}: Props) {
  const [rx, setRx] = useState(8);
  const [ry, setRy] = useState(-18);
  const [dragging, setDragging] = useState(false);
  const lastPtr = useRef({ x: 0, y: 0 });
  const rot = useRef({ rx: 8, ry: -18 });

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    lastPtr.current = { x: e.clientX, y: e.clientY };
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
    const dx = e.clientX - lastPtr.current.x;
    const dy = e.clientY - lastPtr.current.y;
    lastPtr.current = { x: e.clientX, y: e.clientY };
    rot.current = {
      rx: rot.current.rx - dy * DRAG_SENS,
      ry: rot.current.ry + dx * DRAG_SENS,
    };
    setRx(rot.current.rx);
    setRy(rot.current.ry);
  };

  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) {
      e.currentTarget.releasePointerCapture(e.pointerId);
    }
    setDragging(false);
  };

  const faceShadow = glowFilter ?? "drop-shadow(0 12px 32px rgba(0,0,0,0.85))";

  return (
    <div
      role="img"
      aria-label="3D-карточка: перетащите, чтобы повернуть"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      style={{
        width: "100%",
        aspectRatio: "5/7",
        position: "relative",
        transformStyle: "preserve-3d",
        transform: `rotateX(${rx}deg) rotateY(${ry}deg)`,
        cursor: dragging ? "grabbing" : "grab",
        touchAction: "none",
        userSelect: "none",
        transition: dragging ? "none" : "transform 0.15s ease-out",
      }}
    >
      {/* Front — CardSVG */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "translateZ(0.5px)",
          filter: faceShadow,
        }}
      >
        <CardSVG rarity={rarity} portrait={portrait} princessName={princessName} />
      </div>

      {/* Back — рубашка */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transform: "rotateY(180deg) translateZ(0.5px)",
          filter: faceShadow,
        }}
      >
        <img
          src={cardBackSrc}
          alt=""
          draggable={false}
          style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }}
        />
      </div>
    </div>
  );
}
