/** Число + существительное: формы [1, 2–4, 5+] — «1 карта», «27 карт», «6 редкостей». */
export function ruCount(n: number, forms: [one: string, few: string, many: string]): string {
  const abs = Math.abs(n) % 100;
  const d = abs % 10;
  const word =
    abs > 10 && abs < 20 ? forms[2]
    : d === 1 ? forms[0]
    : d >= 2 && d <= 4 ? forms[1]
    : forms[2];
  return `${n} ${word}`;
}

export const CARD_PERSPECTIVE = 900;

export function cardTiltTransform(rx: number, ry: number, scale = 1) {
  return `rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale}) translate3d(0, 0, 0.01px)`;
}

export const srng = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
