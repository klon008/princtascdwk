# Plan: Expanded Card Grid with Mouse-Proximity 3D Tilt

## Context
The current grid shows exactly 6 cards (one per rarity). The user wants:
1. **Many cards** (~24) with different Disney Princess names — at least one per rarity, the rest distributed naturally
2. **Vertical scroll** — enough rows to require scrolling
3. **Per-card 3D tilt** — each card independently tilts toward the mouse when the cursor is nearby, even before hovering

## Card Dataset (~24 cards)

Predefined array of `{ princess, rarity }` shuffled into a visually interesting order:

| Princess      | Rarity      |
|--------------|-------------|
| Cinderella   | common      |
| Snow White   | common      |
| Pocahontas   | common      |
| Asha         | common      |
| Nala         | common      |
| Jane         | common      |
| Belle        | uncommon    |
| Jasmine      | uncommon    |
| Tiana        | uncommon    |
| Mulan        | uncommon    |
| Megara       | uncommon    |
| Tinker Bell  | uncommon    |
| Giselle      | uncommon    |
| Ariel        | rare        |
| Merida       | rare        |
| Moana        | rare        |
| Anna         | rare        |
| Kida         | rare        |
| Esmeralda    | rare        |
| Rapunzel     | epic        |
| Raya         | epic        |
| Mirabel      | epic        |
| Aurora       | legendary   |
| Elsa         | secretRare  |

Shuffled deterministically (fixed order array, not runtime random) so the grid always looks organic — commons and uncommons interspersed with rares, not clumped by rarity.

## Grid Layout

```
xl (≥1280px): 6 columns  → 4 rows
lg (≥1024px): 5 columns  → 5 rows  
md (≥640px):  4 columns  → 6 rows
sm (<640px):  3 columns  → 8 rows
xs (<400px):  2 columns  → 12 rows
```

Tailwind: `grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6`

Cards displayed at natural `5/7` aspect ratio via `aspect-ratio: 5/7` on each cell.

## 3D Tilt Implementation

**Strategy**: Single global `pointermove` listener on the `<main>` container that directly manipulates each card's DOM `style.transform` — no React state, no re-renders, fully 60fps.

```
App
  └─ <main onPointerMove={handlePointerMove}>
       └─ CardTile (×24)
            └─ <div ref={tileRef}>   ← direct DOM manipulation target
                 └─ CardSVG
```

### `handlePointerMove` logic (direct DOM, no state):

```ts
const handlePointerMove = (e: PointerEvent) => {
  tileRefs.current.forEach(el => {
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const radius = 320; // px — influence zone

    if (dist < radius) {
      const t = 1 - dist / radius;           // 0→1 as cursor approaches
      const strength = t * t * 18;           // ease-in, max 18°
      const rx = -(dy / Math.max(dist, 1)) * strength;
      const ry =  (dx / Math.max(dist, 1)) * strength;
      const scale = 1 + t * 0.06;           // subtle lift
      el.style.transform =
        `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale})`;
      el.style.zIndex = "10";
      el.style.transition = "transform 0.05s linear";
    } else {
      el.style.transform = "";
      el.style.zIndex = "";
      el.style.transition = "transform 0.4s ease-out";
    }
  });
};
```

`onPointerLeave` on `<main>`: reset all transforms with a smooth ease-out.

### `CardTile` component:

```tsx
function CardTile({ princess, rarity, idx, tileRef }) {
  const cfg = CFG[rarity];
  return (
    <div
      ref={tileRef}
      className="card-enter flex flex-col items-center gap-2"
      style={{ animationDelay: `${idx * 0.04}s`, willChange: "transform" }}
    >
      <div style={{
        width: "100%",
        aspectRatio: "5/7",
        filter: cfg.glowStr > 0
          ? `drop-shadow(0 0 ${Math.round(cfg.glowStr * 0.45)}px ${cfg.glowCol}70)`
          : "drop-shadow(0 6px 18px rgba(0,0,0,0.7))",
      }}>
        <CardSVG rarity={rarity} portrait={portraitImg} princessName={princess} />
      </div>
      {/* Rarity badge */}
      <div ...>
        <span style={{ color: cfg.color }}>{cfg.name}</span>
      </div>
    </div>
  );
}
```

### Refs array pattern:

```tsx
const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
// Inside JSX:
ref={el => { tileRefs.current[idx] = el; }}
```

## CardSVG changes

- Remove hardcoded `princess` from `CFG` (it's now passed as a prop `princessName`)
- `CardSVG` accepts `{ rarity, portrait, princessName }` instead of just `{ rarity, portrait }`
- The name text `<text>` inside the SVG uses `princessName` prop directly

## Files to modify

- **`src/app/App.tsx`** — only file to change:
  - Add `CARDS` dataset (24 entries, fixed shuffle order)
  - Remove `princess` field from `CFG`
  - Add `princessName` prop to `CardSVG`
  - Add `CardTile` component with forwarded ref
  - Replace `App` component body: add `tileRefs`, `handlePointerMove`, `onPointerLeave`, render grid of `CARDS.map(CardTile)`
  - Remove old `.card-wrap:hover` CSS, keep `.card-enter`

## Verification

1. Page loads showing ~24 cards in a multi-row grid
2. Scrolling works — all rows accessible
3. Moving mouse over/near any card causes that card to 3D-tilt toward cursor
4. Cards outside the 320px influence radius stay flat
5. Moving mouse away smoothly resets card to flat
6. At least one card of each of the 6 rarities is visible
7. No React state updates during mouse movement (check DevTools for re-render flashes)
