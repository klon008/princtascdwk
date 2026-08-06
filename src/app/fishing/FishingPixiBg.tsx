import { useEffect, useRef } from "react";
import {
  Application,
  Assets,
  Container,
  DisplacementFilter,
  Sprite,
  Texture,
} from "pixi.js";
import fishingBgUrl from "@/assets/fishing/bg.jpg";
import waterMaskUrl from "@/assets/fishing/water-mask.png";

type Props = {
  /** CSS background-position Y focus, same idea as `center 40%`. */
  focusY?: number;
  /** Displacement strength. Pixi default is ~20; keep MVP mild. */
  strength?: number;
};

function prefersReducedMotion(): boolean {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

/** Convert B/W luminance mask → alpha mask (white = visible water). */
async function loadLuminanceMask(url: string): Promise<Texture> {
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const el = new Image();
    el.decoding = "async";
    el.onload = () => resolve(el);
    el.onerror = () => reject(new Error(`Failed to load mask: ${url}`));
    el.src = url;
  });

  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return Texture.from(img);

  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h);
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
    d[i] = 255;
    d[i + 1] = 255;
    d[i + 2] = 255;
    d[i + 3] = lum;
  }
  ctx.putImageData(data, 0, 0);
  return Texture.from(canvas);
}

function createNoiseTexture(size = 256): Texture {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return Texture.WHITE;

  const img = ctx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    img.data[i] = 100 + Math.random() * 55;
    img.data[i + 1] = 100 + Math.random() * 55;
    img.data[i + 2] = 128;
    img.data[i + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);

  const texture = Texture.from(canvas);
  texture.source.addressMode = "repeat";
  return texture;
}

/** Cover-fit sprite like CSS `background-size: cover` + focal point. */
function fitCover(sprite: Sprite, viewW: number, viewH: number, focusX = 0.5, focusY = 0.4) {
  const tw = sprite.texture.width;
  const th = sprite.texture.height;
  if (!tw || !th) return;
  const scale = Math.max(viewW / tw, viewH / th);
  sprite.scale.set(scale);
  sprite.x = viewW * 0.5 - tw * scale * focusX;
  sprite.y = viewH * 0.5 - th * scale * focusY;
}

/**
 * MVP Pixi background: static photo + DisplacementFilter on masked water only.
 * Not production-tuned — for evaluating Pixi capability on this page.
 */
export function FishingPixiBg({ focusY = 0.4, strength = 18 }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || prefersReducedMotion()) return;

    let destroyed = false;
    let app: Application | null = null;
    let onResize: (() => void) | null = null;

    (async () => {
      const application = new Application();
      await application.init({
        resizeTo: host,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
        powerPreference: "low-power",
      });
      if (destroyed) {
        application.destroy(true);
        return;
      }
      app = application;
      host.appendChild(application.canvas);
      application.canvas.className = "fishing-pixi-canvas";

      const [bgTex, maskTex] = await Promise.all([
        Assets.load<Texture>(fishingBgUrl),
        loadLuminanceMask(waterMaskUrl),
      ]);
      if (destroyed) return;

      const noiseTex = createNoiseTexture(256);
      const root = new Container();
      application.stage.addChild(root);

      const base = new Sprite(bgTex);
      const water = new Sprite(bgTex);
      const mask = new Sprite(maskTex);
      const noise = new Sprite(noiseTex);
      noise.scale.set(7.4);

      const displacement = new DisplacementFilter({
        sprite: noise,
        scale: { x: strength, y: strength * 0.65 },
      });
      water.filters = [displacement];
      water.mask = mask;

      // Displacement sprite must be in the scene graph for Pixi to sample it.
      noise.renderable = false;

      root.addChild(base, water, mask, noise);

      const layout = () => {
        const w = application.screen.width;
        const h = application.screen.height;
        fitCover(base, w, h, 0.5, focusY);
        fitCover(water, w, h, 0.5, focusY);
        fitCover(mask, w, h, 0.5, focusY);
      };
      layout();
      onResize = layout;
      application.renderer.on("resize", layout);

      application.ticker.add(() => {
        noise.x += 0.35;
        noise.y += 0.12;
      });
    })().catch((err) => {
      console.error("[FishingPixiBg] init failed", err);
    });

    return () => {
      destroyed = true;
      if (app && onResize) {
        app.renderer.off("resize", onResize);
      }
      if (app) {
        app.destroy(true, { children: true });
        app = null;
      }
      host.replaceChildren();
    };
  }, [focusY, strength]);

  return <div ref={hostRef} className="fishing-pixi-host" aria-hidden />;
}
