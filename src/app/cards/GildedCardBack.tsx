import { useEffect, useRef, type RefObject } from "react";
import {
  Application,
  Filter,
  GlProgram,
  Sprite,
  Texture,
  UniformGroup,
  type Ticker,
} from "pixi.js";

export type RotState = { rx: number; ry: number };

type GildedCardBackProps = {
  src: string;
  rotRef: RefObject<RotState>;
};

/* ──────────────────────────────────────────────────────────────────────────
 * Утилиты
 * ────────────────────────────────────────────────────────────────────────── */

function prefersReducedMotion(): boolean {
  return window.matchMedia("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

/** Пиксельно-точное «cover»-позиционирование спрайта внутри вида. */
function fitCover(
  sprite: Sprite,
  viewW: number,
  viewH: number,
  texW: number,
  texH: number,
): void {
  const scale = Math.max(viewW / texW, viewH / texH);
  sprite.scale.set(scale);
  sprite.x = (viewW - texW * scale) / 2;
  sprite.y = (viewH - texH * scale) / 2;
}

/** RGB → HSL (h ∈ [0,1)). */
function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  let h: number;
  if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
  else if (max === gn) h = ((bn - rn) / d + 2) / 6;
  else h = ((rn - gn) / d + 4) / 6;
  return [h, s, l];
}

/* ──────────────────────────────────────────────────────────────────────────
 * CPU-подготовка: золотая маска + карта высот + нормали
 * ────────────────────────────────────────────────────────────────────────── */

type GildingMaps = {
  mask: Uint8Array; // W*H, 0..255
  height: Float32Array; // W*H, 0..1
  width: number;
  height_: number;
};

/**
 * Из растра вынимаем золото: пиксели с «золотым» оттенком (жёлто-оранжевый
 * спектр) и достаточной насыщенностью считаем узором, всё прочное — тёмная
 * матовая база (маска = 0).
 */
function extractGildingMaps(image: HTMLImageElement): GildingMaps | null {
  const W = image.naturalWidth;
  const H = image.naturalHeight;
  if (!W || !H) return null;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return null;

  ctx.drawImage(image, 0, 0);
  const data = ctx.getImageData(0, 0, W, H).data;

  const mask = new Uint8Array(W * H);
  const height = new Float32Array(W * H);

  // Золотой спектр: ~38°–58° в градусах (жёлтый → жёлто-оранжевый).
  const HUE_MIN = 32 / 360;
  const HUE_MAX = 60 / 360;
  const SAT_MIN = 0.25;
  const L_MIN = 0.18;

  for (let i = 0, p = 0; i < mask.length; i++, p += 4) {
    const r = data[p];
    const g = data[p + 1];
    const b = data[p + 2];
    const [h, s, l] = rgbToHsl(r, g, b);

    const isGoldHue = h >= HUE_MIN && h <= HUE_MAX;
    const isGold =
      isGoldHue && s >= SAT_MIN && l >= L_MIN && data[p + 3] > 40;

    if (isGold) {
      // Высота из н��сыщенности+яркости — имитация рельефа чеканки.
      mask[i] = 255;
      height[i] = Math.min(1, 0.35 + s * 0.45 + l * 0.5);
    }
  }

  return { mask, height, width: W, height_: H };
}

/** Небольшой box-blur для сглаживания карты высот (radius ~1-2 px). */
function blurHeight(
  height: Float32Array,
  W: number,
  H: number,
  radius = 2,
): Float32Array {
  const out = new Float32Array(W * H);
  const win = radius * 2 + 1;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let sum = 0;
      let count = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= H) continue;
        for (let dx = -radius; dx <= radius; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= W) continue;
          sum += height[yy * W + xx];
          count++;
        }
      }
      out[y * W + x] = sum / count;
    }
  }
  return out;
}

/**
 * Нормали из карты высот (центральные разности, Sobel-подобные).
 * result: RGB в [0,1], упаковка как у normal map.
 */
function buildNormalMap(
  height: Float32Array,
  W: number,
  H: number,
): Uint8Array {
  const out = new Uint8Array(W * H * 3);
  const strength = 2.5;

  for (let y = 0; y < H; y++) {
    const yUp = Math.max(0, y - 1);
    const yDn = Math.min(H - 1, y + 1);
    for (let x = 0; x < W; x++) {
      const xL = Math.max(0, x - 1);
      const xR = Math.min(W - 1, x + 1);

      const dx =
        height[y * W + xR] - height[y * W + xL];
      const dy =
        height[yDn * W + x] - height[yUp * W + x];

      // Нормаль из градиента (перевёрнутый dy — Y вверх в текстурных координатах).
      let nx = -dx * strength;
      let ny = dy * strength;
      let nz = 1;

      const len = Math.hypot(nx, ny, nz);
      nx /= len;
      ny /= len;
      nz /= len;

      const o = (y * W + x) * 3;
      out[o] = Math.round((nx * 0.5 + 0.5) * 255);
      out[o + 1] = Math.round((ny * 0.5 + 0.5) * 255);
      out[o + 2] = Math.round((nz * 0.5 + 0.5) * 255);
    }
  }
  return out;
}

/* ───────────────────────────────────────── текстуры из массивов ────────── */

function maskToCanvas(mask: Uint8Array, W: number, H: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  for (let i = 0, p = 3; i < mask.length; i++, p += 4) {
    img.data[p] = mask[i]; // альфа-канал = маска
    img.data[p - 1] = 255;
    img.data[p - 2] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

function normalToCanvas(
  normals: Uint8Array,
  W: number,
  H: number,
): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const img = ctx.createImageData(W, H);
  for (let i = 0, p = 0; i < normals.length; i += 3, p += 4) {
    img.data[p] = normals[i];
    img.data[p + 1] = normals[i + 1];
    img.data[p + 2] = normals[i + 2];
    img.data[p + 3] = 255;
  }
  ctx.putImageData(img, 0, 0);
  return canvas;
}

/* ──────────────────────────────────────────────────────────────────────────
 * GLSL: Blinn-Phong + Френель, только в маске
 * ────────────────────────────────────────────────────────────────────────── */

const GILD_VERT = `
in vec2 aPosition;

out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition(void) {
    vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
    position.x = position.x * (2.0 / uOutputTexture.x) - uOutputTexture.x * 0.5;
    position.y = uOutputTexture.y - position.y * (2.0 / uOutputTexture.y) + uOutputTexture.y * 0.5;
    return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord(void) {
    return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void) {
    gl_Position = filterVertexPosition();
    vTextureCoord = filterTextureCoord();
}
`;

const GILD_FRAG = `
in vec2 vTextureCoord;
out vec4 finalColor;

uniform sampler2D uTexture;
uniform sampler2D uMask;
uniform sampler2D uNormalMap;
uniform vec2 uResolution;
uniform float uTime;
uniform float uReduced;
uniform vec2 uLightDir;
uniform sampler2D uNormalMap;

uniform vec2 uLightDir;     // направление на источник (норм. в плоскости)
uniform float uTime;
uniform float uReduced;     // 1.0 = статичный тусклый вариант

const vec3 GOLD_TINT   = vec3(1.0, 0.84, 0.35);
const vec3 GOLD_DEEP   = vec3(0.55, 0.38, 0.10);
const vec3 AMBIENT     = vec3(0.10, 0.09, 0.07);

void main(void) {
    vec4 base = texture(uTexture, vTextureCoord);
    float m = texture(uMask, vTextureCoord).a;
    vec3 n = normalize(texture(uNormalMap, vTextureCoord).rgb * 2.0 - 1.0);

    // Свет «приклеен» к экрану: он не зависит от текстурного охвата
    // (cover-fit и ориентация текстуры не важны — важен угол карты).
    vec3 L = normalize(vec3(uLightDir, 0.85));
    vec3 V = vec3(0.0, 0.2, 1.0);

    // Blinn-Phong
    vec3 H = normalize(L + V);
    float specBase = pow(max(dot(n, H), 0.0), 48.0);

    // Френель по нормали к плоскости карты (0,0,1): край -> блеск сильнее
    float fresnel = pow(1.0 - n.z, 2.0);

    // Подвижный блик, скользящий по узору — золото «играет»
    float sweep = 0.5 + 0.5 * sin((vTextureCoord.x + vTextureCoord.y) * 9.0 - uTime * 1.4);
    float sweepSoft = mix(0.35, 1.0, sweep);

    float metal = mix(0.55, 1.0, sweepSoft) * (0.6 + 0.4 * fresnel);

    vec3 specular = GOLD_TINT * specBase * metal * 1.35;
    vec3 diffuseGold = mix(GOLD_DEEP, GOLD_TINT, clamp(n.z, 0.0, 1.0)) * (0.35 + 0.65 * max(dot(n, L), 0.0));

    // Только в маске; база остаётся матовой
    vec3 gilded = base.rgb * (AMBIENT + diffuseGold) + specular;

    float amount = m * mix(0.85, 0.45, uReduced);
    finalColor = vec4(mix(base.rgb, gilded, amount), base.a);
}
`;

/* ──────────────────────────────────────────────────────────────────────────
 * Компонент
 * ───────────────────────────────────────────────────────── Ready to implement ── */

export function GildedCardBack({ src, rotRef }: GildedCardBackProps): JSX.Element {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let destroyed = false;
    let app: Application | null = null;
    let onResize: (() => void) | null = null;

    const init = async () => {
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

      // Загрузка исходной текстуры
      const baseTex: Texture = await Assets.load(src);
      if (destroyed) return;

      // CPU-подготовка карт
      const img = /* из Assets.load мы не имеем доступа к HTMLImageElement */ null;
    };

    init().catch((err) => console.error("[GildedCardBack] init failed", err));

    return () => {
      destroyed = destroyed || true;
      if (app && onResize) {
        app.renderer.off("resize", onResize);
      }
      if (app) {
        app.destroy(true, { children: true });
        app = null;
 FishingPixiBg     }
      host.replaceChildren();
    };
  }, [src]);

  return <div ref={hostRef} aria-hidden className="gilded-card-back-host" style={{ width: "100%", height: "100%" }} />
}
