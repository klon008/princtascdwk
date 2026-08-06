"""Remove white backgrounds from fish PNGs via edge flood-fill + soft fringe."""
from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image

FISH_DIR = Path(__file__).resolve().parents[1] / "src" / "assets" / "fishing" / "fish"
BACKUP_DIR = FISH_DIR / "_backup_white_bg"

HARD = 248  # fully transparent
SOFT = 235  # flood entry + soft alpha


def is_bg(r: int, g: int, b: int, thresh: int) -> bool:
    return r >= thresh and g >= thresh and b >= thresh


def remove_white_bg(path: Path) -> tuple[int, int]:
    im = Image.open(path).convert("RGBA")
    w, h = im.size
    px = im.load()
    visited = [[False] * h for _ in range(w)]
    q: deque[tuple[int, int]] = deque()

    def offer(x: int, y: int) -> None:
        if x < 0 or y < 0 or x >= w or y >= h or visited[x][y]:
            return
        r, g, b, a = px[x, y]
        visited[x][y] = True
        if a == 0:
            return
        if is_bg(r, g, b, SOFT):
            q.append((x, y))

    for x in range(w):
        offer(x, 0)
        offer(x, h - 1)
    for y in range(h):
        offer(0, y)
        offer(w - 1, y)

    while q:
        x, y = q.popleft()
        r, g, b, a = px[x, y]
        avg = (r + g + b) / 3.0
        if is_bg(r, g, b, HARD):
            px[x, y] = (r, g, b, 0)
        else:
            t = (avg - SOFT) / (255.0 - SOFT)
            t = max(0.0, min(1.0, t))
            px[x, y] = (r, g, b, min(a, int(round(255 * (1.0 - t)))))

        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                nr, ng, nb, na = px[nx, ny]
                visited[nx][ny] = True
                if na > 0 and is_bg(nr, ng, nb, SOFT):
                    q.append((nx, ny))

    for _ in range(2):
        changed = False
        for y in range(h):
            for x in range(w):
                r, g, b, a = px[x, y]
                if a == 0 or not is_bg(r, g, b, SOFT):
                    continue
                touches = any(
                    0 <= nx < w and 0 <= ny < h and px[nx, ny][3] == 0
                    for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1))
                )
                if not touches:
                    continue
                avg = (r + g + b) / 3.0
                t = (avg - SOFT) / (255.0 - SOFT)
                t = max(0.0, min(1.0, t))
                new_a = 0 if is_bg(r, g, b, HARD) else int(round(255 * (1.0 - t)))
                if new_a < a:
                    px[x, y] = (r, g, b, new_a)
                    changed = True
        if not changed:
            break

    im.save(path, optimize=True)
    return w, h


def main() -> None:
    BACKUP_DIR.mkdir(exist_ok=True)
    for p in sorted(FISH_DIR.glob("*.png")):
        bak = BACKUP_DIR / p.name
        if not bak.exists():
            bak.write_bytes(p.read_bytes())
        w, h = remove_white_bg(p)
        im = Image.open(p)
        hist = im.getchannel("A").histogram()
        transparent = hist[0]
        opaque = sum(hist[250:])
        print(f"{p.name}: {w}x{h} transparent={transparent} opaque~={opaque} bytes={p.stat().st_size}")
    print("backup:", BACKUP_DIR)


if __name__ == "__main__":
    main()
