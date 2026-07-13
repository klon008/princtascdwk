import { useMemo, useRef, useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import flounderImg from "@/imports/flounder.webp";
import queenElsaImg from "@/imports/queen-elsa.webp";
import elsaImg from "@/imports/elsa.webp";
import auroraImg from "@/imports/aurora.webp";
import megaraImg from "@/imports/megara.webp";
import belleImg from "@/imports/belle.webp";
import arielImg from "@/imports/ariel.webp";
import snowWhiteImg from "@/imports/snow-white.webp";
import rayaImg from "@/imports/raya.webp";
import rapunzelImg from "@/imports/rapunzel.webp";
import jasmineImg from "@/imports/jasmine.webp";
import cinderellaImg from "@/imports/cinderella.webp";
import moanaImg from "@/imports/moana.webp";
import pocahontasImg from "@/imports/pocahontas.webp";
import tianaImg from "@/imports/tiana.webp";
import meridaImg from "@/imports/merida.webp";
import ashaImg from "@/imports/asha.webp";
import mulanImg from "@/imports/mulan.webp";
import nalaImg from "@/imports/nala.webp";
import janeImg from "@/imports/jane.webp";
import esmeraldaImg from "@/imports/esmeralda.webp";
import mirabelImg from "@/imports/mirabel.webp";
import tinkerBellImg from "@/imports/tinker-bell.webp";
import giselleImg from "@/imports/giselle.webp";
import kidaImg from "@/imports/kida.webp";
import annaImg from "@/imports/anna.webp";
import olafImg from "@/imports/olaf.webp";
import pascalImg from "@/imports/pascal.webp";
import { fetchAlbum, type AlbumResponse } from "@/lib/albumApi";
import { getCatalogEntry, catalogIndex, CATALOG_ORDER } from "@/lib/cardCatalog";

type AlbumViewState =
  | "landing"
  | "loading"
  | "album"
  | "offline"
  | "unauthorized"
  | "not_found";

type RarityKey = "common" | "uncommon" | "rare" | "epic" | "legendary" | "mythic" | "secretRare";

/** Число + существительное: формы [1, 2–4, 5+] — «1 карта», «27 карт», «6 редкостей». */
function ruCount(n: number, forms: [one: string, few: string, many: string]): string {
  const abs = Math.abs(n) % 100;
  const d = abs % 10;
  const word =
    abs > 10 && abs < 20 ? forms[2]
    : d === 1 ? forms[0]
    : d >= 2 && d <= 4 ? forms[1]
    : forms[2];
  return `${n} ${word}`;
}

const CARD_PERSPECTIVE = 900;

function cardTiltTransform(rx: number, ry: number, scale = 1) {
  return `rotateX(${rx}deg) rotateY(${ry}deg) scale(${scale}) translate3d(0, 0, 0.01px)`;
}

interface RC {
  name: string;
  tier: string;
  color: string;
  frameW: number;
  goldBase: string;
  goldHigh: string;
  gemMain: string;
  gemAlt: string;
  bgCenter: string;
  bgEdge: string;
  glowCol: string;
  glowStr: number;
  crown: boolean;
  filigree: boolean;
  rays: boolean;
  particles: number;
  holo: boolean;
  mythic?: boolean;
  cornerLv: number;
  bottomGems: number;
}

const CFG: Record<RarityKey, RC> = {
  common: {
    name: "Common", tier: "◆", color: "#9A8050",
    frameW: 11, goldBase: "#8B7040", goldHigh: "#B89858",
    gemMain: "#708090", gemAlt: "#556070",
    bgCenter: "#1a2038", bgEdge: "#0e1220",
    glowCol: "transparent", glowStr: 0,
    crown: false, filigree: false, rays: false,
    particles: 0, holo: false, cornerLv: 1, bottomGems: 0,
  },
  uncommon: {
    name: "Uncommon", tier: "◆◆", color: "#7AD868",
    frameW: 14, goldBase: "#3A9850", goldHigh: "#78D878",
    gemMain: "#3A9850", gemAlt: "#2E7840",
    bgCenter: "#142238", bgEdge: "#0a1520",
    glowCol: "#48A858", glowStr: 10,
    crown: false, filigree: false, rays: false,
    particles: 8, holo: false, cornerLv: 2, bottomGems: 1,
  },
  rare: {
    name: "Rare", tier: "◆◆◆", color: "#5898FF",
    frameW: 17, goldBase: "#2868D0", goldHigh: "#78B8FF",
    gemMain: "#2868D0", gemAlt: "#1858B8",
    bgCenter: "#0e1835", bgEdge: "#070f22",
    glowCol: "#3880F0", glowStr: 16,
    crown: false, filigree: true, rays: false,
    particles: 16, holo: false, cornerLv: 3, bottomGems: 2,
  },
  epic: {
    name: "Epic", tier: "◆◆◆◆", color: "#9070F0",
    frameW: 22, goldBase: "#5A40A8", goldHigh: "#9888E8",
    gemMain: "#401090", gemAlt: "#5020A8",
    bgCenter: "#060318", bgEdge: "#030110",
    glowCol: "#402898", glowStr: 20,
    crown: false, filigree: true, rays: true,
    particles: 30, holo: false, cornerLv: 4, bottomGems: 3,
  },
  legendary: {
    name: "Legendary", tier: "◆◆◆◆◆", color: "#FFB020",
    frameW: 26, goldBase: "#FFD700", goldHigh: "#FFF080",
    gemMain: "#FF8800", gemAlt: "#FF6600",
    bgCenter: "#080510", bgEdge: "#040208",
    glowCol: "#FFA000", glowStr: 28,
    crown: true, filigree: true, rays: true,
    particles: 50, holo: false, cornerLv: 5, bottomGems: 5,
  },
  mythic: {
    name: "Mythic", tier: "✦", color: "#660f00",
    frameW: 24, goldBase: "#2A0800", goldHigh: "#8A2410",
    gemMain: "#660f00", gemAlt: "#3A0A00",
    bgCenter: "#0c0201", bgEdge: "#050100",
    glowCol: "#660f00", glowStr: 20,
    crown: true, filigree: true, rays: true,
    particles: 50, holo: false, mythic: true, cornerLv: 6, bottomGems: 6,
  },
  secretRare: {
    name: "Secret Rare", tier: "★", color: "#D4567A",
    frameW: 30, goldBase: "#FFD700", goldHigh: "#FFF080",
    gemMain: "#A82850", gemAlt: "#6B1535",
    bgCenter: "#0a0206", bgEdge: "#040102",
    glowCol: "#C83862", glowStr: 36,
    crown: true, filigree: true, rays: true,
    particles: 75, holo: true, cornerLv: 6, bottomGems: 7,
  },
};

interface CardDef {
  princess: string;
  rarity: RarityKey;
  portrait?: string;
  obtainedDate?: string;
  booster?: string;
  slug?: string;
}

// 28 карт — редкости перемешаны для естественного распределения
const CARDS: CardDef[] = [
  { princess: "Золушка",       rarity: "common",     portrait: cinderellaImg },
  { princess: "Белль",         rarity: "uncommon",   portrait: belleImg },
  { princess: "Ариэль",        rarity: "rare",       portrait: arielImg },
  { princess: "Белоснежка",    rarity: "common",     portrait: snowWhiteImg },
  { princess: "Рапунцель",     rarity: "epic",       portrait: rapunzelImg },
  { princess: "Жасмин",        rarity: "uncommon",   portrait: jasmineImg },
  { princess: "Моана",         rarity: "rare",       portrait: moanaImg },
  { princess: "Покахонтас",    rarity: "common",     portrait: pocahontasImg },
  { princess: "Аврора",        rarity: "legendary",  portrait: auroraImg },
  { princess: "Тиана",         rarity: "uncommon",   portrait: tianaImg },
  { princess: "Мерида",        rarity: "rare",       portrait: meridaImg },
  { princess: "Аша",           rarity: "common",     portrait: ashaImg },
  { princess: "Рая",           rarity: "epic",       portrait: rayaImg },
  { princess: "Мулан",         rarity: "uncommon",   portrait: mulanImg },
  { princess: "Анна",          rarity: "rare",       portrait: annaImg },
  { princess: "Нала",          rarity: "common",     portrait: nalaImg },
  { princess: "Королева Эльза", rarity: "secretRare", portrait: queenElsaImg },
  { princess: "Мегара",        rarity: "secretRare", portrait: megaraImg },
  { princess: "Эсмеральда",    rarity: "rare",       portrait: esmeraldaImg },
  { princess: "Джейн",         rarity: "common",     portrait: janeImg },
  { princess: "Мирабель",      rarity: "epic",       portrait: mirabelImg },
  { princess: "Динь-Динь",     rarity: "uncommon",   portrait: tinkerBellImg },
  { princess: "Кида",          rarity: "rare",       portrait: kidaImg },
  { princess: "Жизель",        rarity: "uncommon",   portrait: giselleImg },
  { princess: "Флаундер",      rarity: "common",     portrait: flounderImg },
  { princess: "Олаф",          rarity: "common",     portrait: olafImg },
  { princess: "Паскаль",       rarity: "common",     portrait: pascalImg },
  { princess: "Эльза",         rarity: "mythic",     portrait: elsaImg },
];

interface CardDetails {
  story: string;
  booster: string;
  obtainedDate: string;
}

const FIRST_EDITION_BOOSTER = "Серия «Фантастический коллекционер» · Тираж № 001";
const COLLECTION_START_DATE = "12 июля 2026";

const CARD_DETAILS: Record<string, CardDetails> = {
  "Золушка": {
    story: "Добрая девушка, чьё терпение и благородство открыли ей дорогу ко двору. Годы тяжёлой работы не смогли остудить её сердце - и одна хрустальная туфелька доказала, что истинное величие живёт в душе, а не в родословной.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Белль": {
    story: "Девушка, которая не судит по внешности: в книгах она ищет суть, а в людях - сердце. За её любовью к историям скрывается редкая проницательность, а за мягкостью - твёрдость: она не боится ни пустых слов деревенских ухажёров, ни грозного рыка Чудовища.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Ариэль": {
    story: "Русалочка, которая отдала голос ради ног и поняла: самые великие приключения начинаются, когда следуешь зову сердца. Она соединила два мира - океан и сушу - и доказала, что мечты стоят любой жертвы.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Белоснежка": {
    story: "Воплощение нежности и света: даже сквозь тьму колдовства, яд яблока и зависть злой королевы она пронесла чистое сердце. Её доброта преобразила королевство, а любовь, что жила в ней, согревала каждого, кто с ней встречался.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Рапунцель": {
    story: "Росла в башне, где её миром были лишь окно, стены да чужие запреты. Но в ней не угасала жажда свободы: она рисовала, мечтала, спорила с тишиной и хранила в сердце твёрдую веру - настоящая жизнь ждёт её за пределами этих стен.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Жасмин": {
    story: "Слишком хорошо знала истинную цену дворцовой роскоши: за блеском золота и парадными титулами ей слишком часто отказывали в праве быть просто собой. Она не позволяла решать за неё ни слова, ни судьбу - её гордость держалась не на высокомерии, а на тихом, но твёрдом отказе подчиняться чужой воле.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Моана": {
    story: "Избранная самим океаном, она пересекла открытое море, чтобы вернуть сердце Те Фити и спасти свой остров. Её путь - не только по звёздам и волнам, но и к себе: она нашла, кто она есть, лишь отплыв за горизонт.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Покахонтас": {
    story: "Умела слышать тихий голос мира: в шёпоте ветра, в ритме волн, в едва заметных следах на земле. Её сила - не в громком бунте и не в слепом послушании, а в мудрости видеть дальше чужого страха и доверять голосу земли, который другие не слышат.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Аврора": {
    story: "Словно дыхание старой сказки: в её тишине слышится шёпот леса, а в мягкой улыбке - доверие к миру, ещё не успевшему её обидеть. Она не тянется к громкой славе, но рядом с ней даже мимолётная встреча будто обещает что-то светлое и доброе.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Тиана": {
    story: "Не ждёт чудес - она верит в труд: в ранние подъёмы, в усталые руки, в каждый новый рабочий день. Её мечта не парит в облаках - она живёт в ароматах кухни: в терпком запахе кофе, в золотистой корочке жареного теста, в тепле свежего хлеба. В этой мечте - не просто ресторан, а память о близких и гордость за то, что создано своими руками.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Мерида": {
    story: "Не ищет лёгких путей - её судьба в её руках. Меткий выстрел, твёрдый шаг, упрямое сердце - всё в ней говорит о верности себе. Её стрела полетела не к жениху, а к свободе. Вековое проклятие она разбила не магией, а силой материнской любви и собственной бесстрашной решимостью.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Аша": {
    story: "Юная мечтательница, чьё желание было настолько чистым, что коснулось космоса. Она призвала звёздного стража и поняла: величайшая магия не даруется королями - она живёт в мечтах простых людей, осмелившихся верить.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Рая": {
    story: "Рано научилась жить настороже: проверять путь, держать оружие ближе и не отдавать доверие просто так. За её резкостью чувствуется не холодность, а усталость человека, который слишком хорошо знает цену ошибке, но всё ещё ищет повод поверить.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Мулан": {
    story: "Надела доспехи отца и ушла на войну - не ради славы, а чтобы сберечь самое дорогое. В мире, где от женщины ждали покорности, она выбрала путь долга и отваги. Её поступки сказали громче любых слов: она спасла империю и доказала, что честь рождается не из имени или пола, а из верности своему сердцу.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Анна": {
    story: "Выросла среди закрытых дверей, но не разучилась тянуться к людям. В ней нет королевской неприступности: она говорит прямо, смущается искренне и почти всегда сначала чувствует, а уже потом думает. Её сила не в безупречности, а в способности оставаться живой и тёплой там, где другие давно спрятались бы за холодной вежливостью.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Нала": {
    story: "Львиная королева, которая никогда не перестала верить в законного короля - даже когда он сам забыл, кто он. Её решимость провела её через саванну и вернула Симбу на Скалу Предков, туда, где ему пришлось снова стать собой.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Королева Эльза": {
    story: "Она стала королевой льда раньше, чем успела стать собой. В её власти не было театральности - лишь непреклонная ледяная воля и дворец, где чувства считались роскошью, от которой давно отказались. И всё же иногда, на миг, мороз отступал - не от тепла, а от памяти, которую лёд ещё не сумел стереть до конца.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Мегара": {
    story: "Острая на язык и яростно самостоятельная, она заключила сделку с тьмой и заплатила цену, которой не ожидала. Но в решающий момент выбрала любовь вместо обещанного бессмертия - и этот выбор сделал её героиней.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Эсмеральда": {
    story: "Не просила позволения быть свободной - она просто была ею. Её танец - не игра, а голос правды: в каждом движении - отказ подчиняться чужим правилам, в каждом шаге - утверждение права жить и быть услышанной. Она не смотрела на униженных свысока: видела в них равных и защищала тех, кого мир привык не замечать.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Джейн": {
    story: "Смотрела на джунгли с любопытством учёной - и с лёгкой растерянностью человека, который вдруг оказался за пределами привычных правил. Её ум любил порядок и точность, словно всё нужно было разложить по коробочкам, но сердце оказалось куда смелее: оно раньше разума чувствовало жизнь там, где наука ещё искала названия.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Мирабель": {
    story: "Единственная в семье Мадригаль, у кого не было видимого дара. Но вскоре все поняли: её настоящий дар - в ней самой. Когда магия начала угасать, именно она удержала семью, не дала рассыпаться их миру - и тем самым стала самым главным чудом.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Динь-Динь": {
    story: "Мала лишь ростом - а чувства в ней бушуют, как шторм в капле воды. Обида, радость, ревность, преданность - всё слишком ярко, чтобы прятать за спокойной улыбкой. Она вспыльчива и упряма, но в этом и есть её правда: она не умеет притворяться и честно проживает каждое чувство. Её характер - как искрящаяся пыльца: такой же яркий, живой и ни на что не похожий.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Кида": {
    story: "Несёт в себе память целого города - будто каждый его камень отложил след в её взгляде. Но она не пленница прошлого: в ней сплетаются достоинство правительницы и горячее нетерпение того, кто не готов смотреть, как история рассыпается в руины. Её прямая осанка - не знак гордыни, а молчаливое признание ответственности: она знает, что прошлое нужно не просто хранить, а защищать.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Жизель": {
    story: "Лишь кажется наивной - те, кто путает её доброту с беспомощностью, просто не видят настоящей силы её характера. Она входит в любой мир с верой в то, что в нём ещё есть место песне, заботе и искреннему чувству. И эта светлая уверенность обезоруживает куда сильнее самой едкой насмешки - ведь за её простотой прячется редкая смелость оставаться доброй, даже когда мир этому сопротивляется.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Флаундер": {
    story: "Никогда не строил из себя героя - и в этом его тихая сила. Он первым замечает опасность и честно признаётся, что ему страшно, не прячет сомнения за бравадой. Но когда Ариэль нужна поддержка, он всё равно плывёт рядом - не ради славы, а потому что дружба для него важнее страха. Его верность не требует громких слов: она в том, что он остаётся, даже когда хочется спрятаться.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Олаф": {
    story: "Снежный друг Анны и Эльзы, рождённый из детской магии и светлой мечты о лете. Он говорил об объятиях так, будто точно знал: настоящее тепло - не в солнечных лучах, а в тех, кто рядом. Даже когда королевство сковывал ледяной холод, Олаф оставался маленьким ярким светом - таким, что не тает ни от мороза, ни от самой долгой зимы. В его простоте пряталась удивительная мудрость: он умел напоминать, что даже в холоде можно оставаться тёплым - если не переставать верить в добро и держаться тех, кто дорог.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Паскаль": {
    story: "Почти не произносит слов - но в его взгляде читается целая история. Он тихонько ворчит, ревнует, искренне поддерживает и всегда первым замечает, когда Рапунцель готова довериться не тому человеку. Маленький хамелеон с характером старшего брата и терпением настоящего друга - он не кричит о своей преданности, а просто остаётся рядом, когда это важнее любых слов.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
  "Эльза": {
    story: "Эльза - королева льда, научившаяся слышать голос своей магии: в её спокойствии прячется несокрушимая воля, а в холоде - защита для тех, кто ей дорог.",
    booster: FIRST_EDITION_BOOSTER,
    obtainedDate: COLLECTION_START_DATE,
  },
};

const srng = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ─── SVG helpers ──────────────────────────────────────────────────────────────

function GemDiamond({ cx, cy, w, h, fill, stroke = "none", sw = 0, opacity = 1 }: {
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

function StarPoly({ cx, cy, r, n = 5, inner = 0.38, fill, opacity = 1 }: {
  cx: number; cy: number; r: number; n?: number; inner?: number; fill: string; opacity?: number;
}) {
  const pts = Array.from({ length: n * 2 }, (_, i) => {
    const a = (i * Math.PI / n) - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * inner;
    return `${cx + rad * Math.cos(a)},${cy + rad * Math.sin(a)}`;
  }).join(" ");
  return <polygon points={pts} fill={fill} opacity={opacity} />;
}

function CornerGroup({ lv, gold, goldH, gem, gemAlt }: {
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

// ─── Card SVG ─────────────────────────────────────────────────────────────────

function CardSVG({ rarity, portrait, princessName, mythicVariant = 1 }: {
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
            style={{ mixBlendMode: "screen" as React.CSSProperties["mixBlendMode"] }} />
        </g>
      )}

      {c.mythic && (
        <MythicFX uid={uid} W={W} H={H} fw={fw}
          imgX={imgX} imgY={imgY} imgW={imgW} imgH={imgH} embers={emberList} />
      )}
    </svg>
  );
}

interface Ember { x: number; y: number; r: number; dur: number; delay: number; drift: number; }

function MythicFX({ uid, W, H, fw, imgX, imgY, imgW, imgH, embers }: {
  uid: string; W: number; H: number; fw: number;
  imgX: number; imgY: number; imgW: number; imgH: number; embers: Ember[];
}) {
  const screen = { mixBlendMode: "screen" as React.CSSProperties["mixBlendMode"] };
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

// ─── Card back (рубашка) ──────────────────────────────────────────────────────

function CardBackSVG() {
  const W = 350, H = 490;
  const fw = 20;
  const mx = 175, my = 248;

  const starPath = (cx: number, cy: number, r: number, inner: number, n: number) => {
    const pts: string[] = [];
    for (let i = 0; i < n * 2; i++) {
      const angle = (i * Math.PI) / n - Math.PI / 2;
      const rr = i % 2 === 0 ? r : r * inner;
      pts.push(`${cx + rr * Math.cos(angle)},${cy + rr * Math.sin(angle)}`);
    }
    return `M ${pts.join(" L ")} Z`;
  };

  return (
    <svg className="card-svg" viewBox={`0 0 ${W} ${H}`} width="100%" height="100%" style={{ display: "block" }}>
      <defs>
        <radialGradient id="bk-bg" cx="50%" cy="44%" r="68%">
          <stop offset="0%" stopColor="#0D1B3E" />
          <stop offset="60%" stopColor="#06102A" />
          <stop offset="100%" stopColor="#020810" />
        </radialGradient>
        <linearGradient id="bk-gv" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#7A6030" />
          <stop offset="22%" stopColor="#F0D060" />
          <stop offset="50%" stopColor="#D4AF37" />
          <stop offset="78%" stopColor="#F0D060" />
          <stop offset="100%" stopColor="#7A6030" />
        </linearGradient>
        <radialGradient id="bk-mf" cx="50%" cy="42%" r="58%">
          <stop offset="0%" stopColor="#1A2860" />
          <stop offset="100%" stopColor="#06102A" />
        </radialGradient>
        <radialGradient id="bk-mg" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
        </radialGradient>
        <clipPath id="bk-clip">
          <rect x="0" y="0" width={W} height={H} rx="16" />
        </clipPath>
        <filter id="bk-mglow" x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="9" />
        </filter>
        <filter id="bk-glow" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <pattern id="bk-pat" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
          <path d="M15 3 L16 14 L27 15 L16 16 L15 27 L14 16 L3 15 L14 14 Z"
            fill="#D4AF37" opacity="0.038" />
          <circle cx="0" cy="0" r="1.1" fill="#D4AF37" opacity="0.03" />
          <circle cx="30" cy="0" r="1.1" fill="#D4AF37" opacity="0.03" />
          <circle cx="0" cy="30" r="1.1" fill="#D4AF37" opacity="0.03" />
          <circle cx="30" cy="30" r="1.1" fill="#D4AF37" opacity="0.03" />
        </pattern>
      </defs>

      <rect x="0" y="0" width={W} height={H} rx="16" fill="url(#bk-bg)" />
      <rect x="0" y="0" width={W} height={H} rx="16" fill="url(#bk-pat)" clipPath="url(#bk-clip)" />

      <g clipPath="url(#bk-clip)" opacity="0.032">
        {Array.from({ length: 20 }, (_, i) => {
          const a = (i * 18) * Math.PI / 180;
          return <line key={i} x1={mx} y1={my}
            x2={mx + 420 * Math.cos(a)} y2={my + 420 * Math.sin(a)}
            stroke="#D4AF37" strokeWidth="2" />;
        })}
      </g>

      <circle cx={mx} cy={my} r="138" fill="url(#bk-mg)" filter="url(#bk-mglow)" />
      <circle cx={mx} cy={my} r="112" fill="none" stroke="#D4AF37" strokeWidth="0.6" opacity="0.28" />
      <circle cx={mx} cy={my} r="108" fill="none" stroke="#F0D060" strokeWidth="1.2" opacity="0.45" />
      <circle cx={mx} cy={my} r="105" fill="none" stroke="#9A8050" strokeWidth="0.5" opacity="0.25" />

      {Array.from({ length: 24 }, (_, i) => {
        const a = (i * 15 - 90) * Math.PI / 180;
        const r1 = 108, r2 = i % 3 === 0 ? 100 : i % 3 === 1 ? 104 : 106;
        const sw = i % 6 === 0 ? 1.6 : 0.7;
        return <line key={i}
          x1={mx + r1 * Math.cos(a)} y1={my + r1 * Math.sin(a)}
          x2={mx + r2 * Math.cos(a)} y2={my + r2 * Math.sin(a)}
          stroke="#D4AF37" strokeWidth={sw} opacity="0.55" />;
      })}

      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 - 90) * Math.PI / 180;
        const gx = mx + 108 * Math.cos(a);
        const gy = my + 108 * Math.sin(a);
        return (
          <g key={i} transform={`translate(${gx},${gy}) rotate(${i * 45})`}>
            <polygon points="0,-5.5 3.2,0 0,5.5 -3.2,0" fill="#1A44CC" stroke="#F0D060" strokeWidth="0.8" />
            <polygon points="0,-3 2,0 0,3 -2,0" fill="#4878FF" opacity="0.6" />
          </g>
        );
      })}

      <circle cx={mx} cy={my} r="90" fill="none" stroke="#D4AF37" strokeWidth="1.4" opacity="0.55" />
      <circle cx={mx} cy={my} r="86" fill="none" stroke="#F0D060" strokeWidth="0.5" opacity="0.3" />

      {Array.from({ length: 8 }, (_, i) => {
        const a = (i * 45 - 67.5) * Math.PI / 180;
        const gx = mx + 90 * Math.cos(a);
        const gy = my + 90 * Math.sin(a);
        return <circle key={i} cx={gx} cy={gy} r="2.8" fill="#D4AF37" opacity="0.6" />;
      })}

      <path d={starPath(mx, my, 80, 0.44, 8)} fill="url(#bk-mf)" />
      <path d={starPath(mx, my, 80, 0.44, 8)} fill="none" stroke="#D4AF37" strokeWidth="1.4" opacity="0.7" />
      <path d={starPath(mx, my, 80, 0.44, 8)} fill="none" stroke="#F0D060" strokeWidth="0.5" opacity="0.35" />

      <circle cx={mx} cy={my} r="44" fill="#060E26" opacity="0.85" />
      <circle cx={mx} cy={my} r="44" fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.55" />
      <circle cx={mx} cy={my} r="40" fill="none" stroke="#9A8050" strokeWidth="0.5" opacity="0.35" />

      <g transform={`translate(${mx},${my - 4})`} filter="url(#bk-glow)">
        <rect x="-19" y="10" width="38" height="8" rx="2" fill="#D4AF37" stroke="#F0D060" strokeWidth="0.5" />
        {[-12, -5, 0, 5, 12].map((bx, i) => (
          <circle key={i} cx={bx} cy="14" r="1.6" fill="#F0D060" opacity="0.75" />
        ))}
        <path d="M -13,10 L -9,10 L -7,-2 L -13,-7 L -16,-2 Z" fill="#C8A030" stroke="#F0D060" strokeWidth="0.4" />
        <path d="M -5,10 L 5,10 L 4,-2 L 0,-17 L -4,-2 Z" fill="#D4AF37" stroke="#F0D060" strokeWidth="0.5" />
        <path d="M 9,10 L 13,10 L 16,-2 L 13,-7 L 7,-2 Z" fill="#C8A030" stroke="#F0D060" strokeWidth="0.4" />
        <polygon points="-13,-7 -10,-7 -11,-11 -14,-11" fill="#2244BB" stroke="#F0D060" strokeWidth="0.4" />
        <polygon points="-3,-17 3,-17 4,-22 0,-24 -4,-22" fill="#CC00BB" stroke="#F0D060" strokeWidth="0.5" />
        <polygon points="10,-11 13,-11 14,-7 11,-7" fill="#2244BB" stroke="#F0D060" strokeWidth="0.4" />
      </g>

      {[0, 90, 180, 270].map((deg, i) => {
        const rad = (deg - 90) * Math.PI / 180;
        const px = mx + 80 * Math.cos(rad);
        const py = my + 80 * Math.sin(rad);
        return (
          <g key={i} transform={`translate(${px},${py}) rotate(${deg})`} opacity="0.7">
            <line x1="0" y1="0" x2="0" y2="8" stroke="#D4AF37" strokeWidth="1.2" />
            <circle cx="0" cy="11" r="3" fill="#D4AF37" />
            <circle cx="0" cy="11" r="1.5" fill="#F0D060" />
          </g>
        );
      })}

      <rect x={fw / 2} y={fw / 2} width={W - fw} height={H - fw} rx={13}
        fill="none" stroke="url(#bk-gv)" strokeWidth={fw} />
      <rect x="1" y="1" width={W - 2} height={H - 2} rx="15.5"
        fill="none" stroke="#F0D060" strokeWidth="0.5" opacity="0.45" />
      <rect x={fw + 1} y={fw + 1} width={W - fw * 2 - 2} height={H - fw * 2 - 2} rx="10"
        fill="none" stroke="#F0D060" strokeWidth="0.7" opacity="0.5" />
      <rect x={fw - 3} y={fw - 3} width={W - fw * 2 + 6} height={H - fw * 2 + 6} rx="15"
        fill="none" stroke="#9A8050" strokeWidth="0.5" opacity="0.3" />
      <rect x={fw + 5} y={fw + 5} width={W - fw * 2 - 10} height={H - fw * 2 - 10} rx="9"
        fill="none" stroke="#9A8050" strokeWidth="0.5" opacity="0.3" />

      {[
        { tx: fw, ty: fw, rot: 0 },
        { tx: W - fw, ty: fw, rot: 90 },
        { tx: W - fw, ty: H - fw, rot: 180 },
        { tx: fw, ty: H - fw, rot: 270 },
      ].map((pos, i) => (
        <g key={i} transform={`translate(${pos.tx},${pos.ty}) rotate(${pos.rot})`}>
          <CornerGroup lv={4} gold="#D4AF37" goldH="#F0D060" gem="#1A44CC" gemAlt="#2255CC" />
        </g>
      ))}

      {/* Top title nameplate */}
      {(() => {
        const rx = fw + 6;
        const ry = fw + 5;
        const rw = W - fw * 2 - 12;
        const rh = 44;
        return (
          <g>
            <rect x={rx} y={ry} width={rw} height={rh} rx="3"
              fill="#04081A" opacity="0.88" />
            <rect x={rx} y={ry} width={rw} height={rh} rx="3"
              fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.55" />
            <rect x={rx + 4} y={ry + 4} width={rw - 8} height={rh - 8} rx="2"
              fill="none" stroke="#F0D060" strokeWidth="0.55" opacity="0.35" />
            <text
              x={W / 2}
              y={ry + rh / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="card-back-title"
              fill="#D4AF37"
              opacity="0.9"
            >
              ENCHANTED VAULT
            </text>
          </g>
        );
      })()}

      {/* Bottom series nameplate */}
      {(() => {
        const rx = fw + 6;
        const rh = 42;
        const ry = H - fw - rh - 5;
        const rw = W - fw * 2 - 12;
        return (
          <g>
            <rect x={rx} y={ry} width={rw} height={rh} rx="3"
              fill="#04081A" opacity="0.88" />
            <rect x={rx} y={ry} width={rw} height={rh} rx="3"
              fill="none" stroke="#D4AF37" strokeWidth="1" opacity="0.55" />
            <rect x={rx + 4} y={ry + 4} width={rw - 8} height={rh - 8} rx="2"
              fill="none" stroke="#F0D060" strokeWidth="0.55" opacity="0.35" />
            <text
              x={W / 2}
              y={ry + rh / 2}
              textAnchor="middle"
              dominantBaseline="middle"
              className="card-back-series"
              fill="#D4AF37"
              opacity="0.9"
            >
              Фантастический коллекционер
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

function CardBackTile({ idx, tileRef }: {
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
            <CardBackSVG />
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

// ─── Card tile with forwarded ref ─────────────────────────────────────────────

function CardTile({ princess, rarity, idx, tileRef, portrait, onClick }: {
  princess: string;
  rarity: RarityKey;
  idx: number;
  tileRef: (el: HTMLDivElement | null) => void;
  portrait?: string;
  onClick: () => void;
}) {
  const cfg = CFG[rarity];
  return (
    // Outer div: only handles the entry animation (opacity+translateY)
    // It must NOT be the tilt target — otherwise animation fill-mode blocks inline style.transform
    <div className="card-enter" style={{ animationDelay: `${idx * 0.04}s` }}>
    <div className="card-tilt-scene">
    <div
      ref={tileRef}
      className="card-tilt-target flex flex-col items-center gap-2"
      style={{ position: "relative", cursor: "pointer" }}
      onClick={onClick}
    >
      {/* Glow halo */}
      {cfg.glowStr > 0 && (
        <div className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background: `radial-gradient(ellipse at 50% 40%, ${cfg.glowCol}28, transparent 70%)`,
            filter: `blur(${cfg.glowStr * 0.7}px)`,
          }}
        />
      )}

      {/* Card art */}
      <div className="card-art" style={{
        width: "100%",
        aspectRatio: "5/7",
        filter: cfg.glowStr > 0
          ? `drop-shadow(0 0 ${Math.round(cfg.glowStr * 0.4)}px ${cfg.glowCol}65)`
          : "drop-shadow(0 6px 18px rgba(0,0,0,0.75))",
      }}>
        <CardSVG rarity={rarity} portrait={portrait ?? cinderellaImg} princessName={princess} />
      </div>

      {/* Rarity badge */}
      <div className="flex flex-col items-center gap-0.5">
        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ background: cfg.color, boxShadow: `0 0 5px ${cfg.color}` }} />
          <span className="type-label type-label--tile" style={{ color: cfg.color }}>
            {cfg.name}
          </span>
        </div>
        <span className="type-tier" style={{ color: cfg.color, opacity: 0.5 }}>
          {cfg.tier}
        </span>
      </div>
    </div>
    </div>
    </div>
  );
}

// ─── Card detail modal ────────────────────────────────────────────────────────

function CardModal({ card, onClose }: { card: CardDef; onClose: () => void }) {
  const cfg = CFG[card.rarity];
  const details = CARD_DETAILS[card.princess];
  const portrait = card.portrait ?? cinderellaImg;

  // 3D tilt for the modal card
  const modalCardRef = useRef<HTMLDivElement>(null);
  const onCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = modalCardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const rx = -(dy / (rect.height / 2)) * 12;
    const ry =  (dx / (rect.width  / 2)) * 12;
    el.style.transform = cardTiltTransform(rx, ry, 1.03);
  };
  const onCardMouseLeave = () => {
    const el = modalCardRef.current;
    if (!el) return;
    el.style.transition = "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)";
    el.style.transform = "";
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Lock body scroll while open (position:fixed prevents iOS background scroll)
  useEffect(() => {
    const scrollY = window.scrollY;
    const { style } = document.body;
    style.position = "fixed";
    style.top = `-${scrollY}px`;
    style.left = "0";
    style.right = "0";
    style.overflow = "hidden";
    return () => {
      style.position = "";
      style.top = "";
      style.left = "";
      style.right = "";
      style.overflow = "";
      window.scrollTo(0, scrollY);
    };
  }, []);

  return (
    <motion.div
      className="fixed inset-0 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-modal-title"
    >
      {/* Backdrop — fixed layer, never scrolls with content */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ background: "rgba(1,2,8,0.88)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)" }}
        aria-hidden
      />

      {/* Scroll layer — only the panel moves, backdrop stays put */}
      <div
        className="fixed inset-0 overflow-y-auto overscroll-contain modal-scroll"
        onClick={onClose}
      >
      <div className="flex min-h-full items-center justify-center px-4 py-6 sm:px-6 sm:py-8 lg:px-8 pointer-events-none">
      <motion.div
        className="relative flex flex-col lg:flex-row gap-5 sm:gap-6 lg:gap-10 w-full max-w-4xl overflow-visible pointer-events-auto"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close — viewport top-right on mobile/tablet; panel top-right on desktop */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Закрыть"
          className="modal-close-btn w-9 h-9 rounded-full flex items-center justify-center transition-colors cursor-pointer hover:bg-[rgba(212,175,55,0.18)] hover:border-[rgba(212,175,55,0.45)]"
          style={{ border: "1px solid rgba(212,175,55,0.25)", background: "rgba(212,175,55,0.08)", color: "#D4AF37" }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round"/>
          </svg>
        </button>

        {/* ── LEFT: card ── */}
        <div className="modal-card-column flex-shrink-0 flex flex-col items-center lg:items-start gap-3 sm:gap-4 overflow-visible">
          <div className="card-tilt-scene card-modal-tilt-scene" style={{ width: "100%" }}>
          <div
            ref={modalCardRef}
            className="card-tilt-target"
            style={{
              width: "100%",
              aspectRatio: "5/7",
              transition: "transform 0.08s linear",
              filter: cfg.glowStr > 0
                ? `drop-shadow(0 0 ${cfg.glowStr * 0.55}px ${cfg.glowCol}80)`
                : "drop-shadow(0 12px 32px rgba(0,0,0,0.85))",
            }}
            onMouseMove={onCardMouseMove}
            onMouseLeave={onCardMouseLeave}
          >
            <CardSVG rarity={card.rarity} portrait={portrait} princessName={card.princess} />
          </div>
          </div>

          {/* Rarity badge under card */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{ border: `1px solid ${cfg.color}40`, background: `${cfg.color}12` }}>
            <div className="w-2 h-2 rounded-full" style={{ background: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }} />
            <span className="type-label" style={{ color: cfg.color }}>
              {cfg.name}
            </span>
            <span className="text-xs ml-1" style={{ color: cfg.color, opacity: 0.55 }}>{cfg.tier}</span>
          </div>
        </div>

        {/* ── RIGHT: info ── */}
        <div className="flex-1 flex flex-col gap-4 sm:gap-5 min-w-0 lg:max-h-[min(90vh,900px)] lg:overflow-y-auto lg:overscroll-contain">
          {/* Header */}
          <div className="min-w-0 lg:pr-12">
            <p className="type-eyebrow type-eyebrow--section mb-1.5" style={{ color: "#8494BC" }}>
              Коллекция принцесс
            </p>
            <h2 id="card-modal-title" className="type-display-2 break-words"
              style={{
                background: `linear-gradient(135deg, ${cfg.goldBase ?? "#9A8050"}, ${cfg.goldHigh ?? "#F0D060"}, ${cfg.goldBase ?? "#9A8050"})`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}>
              {card.princess}
            </h2>
          </div>

          {/* Divider */}
          <div className="h-px" style={{ background: `linear-gradient(to right, ${cfg.color}50, transparent)` }} />

          {/* Story */}
          <div>
            <p className="type-eyebrow type-eyebrow--section mb-3" style={{ color: "#8494BC" }}>
              История персонажа
            </p>
            <p className="type-story" style={{ color: "#ECEFF4" }}>
              {details?.story ?? "Легендарная героиня, чья история ещё не полностью раскрыта."}
            </p>
          </div>

          {/* Divider */}
          <div className="h-px mt-auto" style={{ background: "rgba(212,175,55,0.12)" }} />

          {/* Acquisition info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="rounded-xl p-4" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)" }}>
              <p className="type-eyebrow type-eyebrow--section mb-2" style={{ color: "#8494BC" }}>Бустер-пак</p>
              <div className="flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5">
                  <rect x="1" y="3" width="12" height="9" rx="1.5" stroke="#D4AF37" strokeWidth="1.2"/>
                  <path d="M4 3V2a3 3 0 016 0v1" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"/>
                  <path d="M5 7h4M7 5v4" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <span className="type-value" style={{ color: "#F0D882" }}>
                  {card.booster ?? details?.booster ?? "Неизвестный набор"}
                </span>
              </div>
            </div>

            <div className="rounded-xl p-4" style={{ background: "rgba(212,175,55,0.06)", border: "1px solid rgba(212,175,55,0.15)" }}>
              <p className="type-eyebrow type-eyebrow--section mb-2" style={{ color: "#8494BC" }}>Дата получения</p>
              <div className="flex items-start gap-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="flex-shrink-0 mt-0.5">
                  <rect x="1" y="2.5" width="12" height="10" rx="1.5" stroke="#D4AF37" strokeWidth="1.2"/>
                  <path d="M1 6h12" stroke="#D4AF37" strokeWidth="1.2"/>
                  <path d="M4 1v3M10 1v3" stroke="#D4AF37" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
                <span className="type-value" style={{ color: "#F0D882" }}>
                  {card.obtainedDate ?? details?.obtainedDate ?? "Неизвестно"}
                </span>
              </div>
            </div>
          </div>

          {/* Card number */}
          <p className="type-meta text-right" style={{ color: "#5C6C94" }}>
            Серия «Фантастический коллекционер» · № {String(
              card.slug
                ? catalogIndex(card.slug) + 1
                : CARDS.findIndex(c => c.princess === card.princess) + 1
            ).padStart(3, "0")} / {String(CATALOG_ORDER.length).padStart(3, "0")}
          </p>
        </div>
      </motion.div>
      </div>
      </div>
    </motion.div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const tileRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardDef | null>(null);
  const [albumView, setAlbumView] = useState<AlbumViewState>("landing");
  const [albumData, setAlbumData] = useState<AlbumResponse | null>(null);
  const [displayCards, setDisplayCards] = useState<CardDef[]>(CARDS);

  const albumSecret = import.meta.env.VITE_ALBUM_LINK_SECRET ?? "";

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const u = params.get("u");
    if (!u) {
      setAlbumView("landing");
      setDisplayCards([]);
      return;
    }
    if (!params.get("k") || !params.get("exp")) {
      setAlbumView("landing");
      setDisplayCards([]);
      return;
    }

    let cancelled = false;
    setAlbumView("loading");

    void (async () => {
      const result = await fetchAlbum(params, albumSecret);
      if (cancelled) return;
      if (!result.ok) {
        setAlbumView(
          result.error === "unauthorized"
            ? "unauthorized"
            : result.error === "not_found"
              ? "not_found"
              : "offline",
        );
        setDisplayCards([]);
        return;
      }
      setAlbumData(result.data);
      setAlbumView("album");
      const owned: CardDef[] = result.data.cards
        .map((c) => {
          const entry = getCatalogEntry(c.id);
          if (!entry) return null;
          return {
            princess: c.name,
            slug: c.id,
            rarity: c.rarity,
            portrait: entry.portrait,
            obtainedDate: c.d,
            booster: c.b,
          };
        })
        .filter((c): c is CardDef => c !== null);
      setDisplayCards(owned);
    })();

    return () => {
      cancelled = true;
    };
  }, [albumSecret]);

  const showPreviewGrid = import.meta.env.DEV && albumView === "landing";
  const gridCards = albumView === "album" ? displayCards : showPreviewGrid ? CARDS : [];

  const stars = useMemo(() => Array.from({ length: 120 }, (_, i) => ({
    x: srng(i * 3) * 100,
    y: srng(i * 3 + 1) * 100,
    s: 0.4 + srng(i * 3 + 2) * 2.2,
    o: 0.1 + srng(i * 3 + 3) * 0.4,
    d: 2 + srng(i * 3 + 4) * 3.5,
  })), []);

  useEffect(() => {
    const RADIUS = 320;
    const MAX_DEG = 18;
    const MAX_SCALE = 0.06;

    const resetAll = () => {
      tileRefs.current.forEach(el => {
        if (!el) return;
        el.style.transition = "transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)";
        el.style.transform = "";
        el.style.zIndex = "";
      });
    };

    const onMove = (e: PointerEvent) => {
      tileRefs.current.forEach(el => {
        if (!el) return;
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < RADIUS) {
          const t = 1 - dist / RADIUS;
          const strength = t * t * MAX_DEG;
          const d = Math.max(dist, 1);
          const rx = -(dy / d) * strength;
          const ry =  (dx / d) * strength;
          const scale = 1 + t * MAX_SCALE;
          el.style.transition = "transform 0.06s linear";
          el.style.transform = cardTiltTransform(rx, ry, scale);
          el.style.zIndex = "10";
        } else {
          el.style.transition = "transform 0.5s cubic-bezier(0.25,0.46,0.45,0.94)";
          el.style.transform = "";
          el.style.zIndex = "";
        }
      });
    };

    window.addEventListener("pointermove", onMove);
    document.addEventListener("pointerleave", resetAll);

    return () => {
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", resetAll);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#030610] relative">

      <style>{`
        @keyframes holo-shift {
          0%, 100% { opacity: 0.5; filter: hue-rotate(0deg) saturate(1.5); }
          50%       { opacity: 0.85; filter: hue-rotate(180deg) saturate(2.2); }
        }
        .holo-layer { animation: holo-shift 3s ease-in-out infinite; }

        @keyframes mythic-seal-cw  { to { transform: rotate(360deg); } }
        @keyframes mythic-seal-ccw { to { transform: rotate(-360deg); } }
        .mythic-seal-cw  { animation: mythic-seal-cw  32s linear infinite; }
        .mythic-seal-ccw { animation: mythic-seal-ccw 22s linear infinite; }

        @keyframes mythic-sweep { to { transform: rotate(360deg); } }
        .mythic-sweep { animation: mythic-sweep 5s linear infinite; }

        @keyframes mythic-frame-pulse {
          0%, 100% { opacity: 0.08; }
          50%       { opacity: 0.28; }
        }
        .mythic-frame-pulse { animation: mythic-frame-pulse 2.4s ease-in-out infinite; }

        @keyframes mythic-pool {
          0%, 100% { opacity: 0.22; }
          50%       { opacity: 0.45; }
        }
        .mythic-pool { animation: mythic-pool 2.1s ease-in-out infinite; }

        @keyframes mythic-ember {
          0%   { opacity: 0;   transform: translate(0, 0) scale(0.6); }
          12%  { opacity: 0.45; }
          82%  { opacity: 0.35; }
          100% { opacity: 0;   transform: translate(var(--drift, 0), -80px) scale(1.1); }
        }
        .mythic-ember {
          animation: mythic-ember var(--dur, 3s) linear var(--delay, 0s) infinite;
        }

        @keyframes twinkle {
          0%, 100% { opacity: var(--op); }
          50%       { opacity: calc(var(--op) * 0.15); }
        }
        @keyframes card-rise {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1); }
        }

        .card-tilt-scene {
          perspective: ${CARD_PERSPECTIVE}px;
          perspective-origin: center center;
        }
        .card-tilt-target {
          will-change: transform;
          transform-style: preserve-3d;
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translate3d(0, 0, 0);
        }
        .card-art,
        .card-svg {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
          transform: translate3d(0, 0, 0);
        }
        .card-svg {
          display: block;
          shape-rendering: geometricPrecision;
        }
        .card-modal-tilt-scene {
          overflow: visible;
          padding: 1.25rem 0.75rem;
          margin: -1.25rem -0.75rem;
          box-sizing: content-box;
        }
        @media (min-width: 640px) {
          .card-modal-tilt-scene {
            padding: 2rem 1.5rem;
            margin: -2rem -1.5rem;
          }
        }
        .modal-card-column {
          width: 100%;
          max-width: min(260px, 72vw);
          margin: 0 auto;
        }
        @media (min-width: 1024px) {
          .modal-card-column {
            max-width: 260px;
            margin: 0;
          }
        }
        .modal-scroll {
          padding-bottom: env(safe-area-inset-bottom, 0px);
        }
        .modal-close-btn {
          position: fixed;
          top: max(1rem, env(safe-area-inset-top, 0px));
          right: max(1rem, env(safe-area-inset-right, 0px));
          z-index: 60;
        }
        @media (min-width: 1024px) {
          .modal-close-btn {
            position: absolute;
            top: 0;
            right: 0;
            z-index: 20;
          }
        }
      `}</style>

      {/* Star field */}
      <svg className="fixed inset-0 w-full h-full pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        {stars.map((s, i) => (
          <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.s} fill="#D4AF37" opacity={s.o}
            style={{ "--op": s.o, animation: `twinkle ${s.d}s ${i * 0.12}s ease-in-out infinite` } as React.CSSProperties} />
        ))}
      </svg>

      {/* Atmospheric glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/4 w-[700px] h-[500px] rounded-full opacity-[0.035]"
          style={{ background: "radial-gradient(ellipse, #4080E0, transparent)" }} />
        <div className="absolute -bottom-32 right-1/4 w-[700px] h-[500px] rounded-full opacity-[0.035]"
          style={{ background: "radial-gradient(ellipse, #9040E0, transparent)" }} />
      </div>

      {/* Header */}
      <header className="relative z-10 text-center px-4 pt-7 pb-6 sm:pt-10 sm:pb-8">
        <p className="type-eyebrow type-eyebrow--hero text-[#3A4A6A] mb-2">
          Дворцовая сокровищница
        </p>
        <h1 className="type-display-1"
          style={{
            background: "linear-gradient(135deg, #9A8050 0%, #F0D060 35%, #D4AF37 55%, #F0D060 75%, #9A8050 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}>
          Enchanted Vault
        </h1>
        <p className="type-eyebrow mt-3 text-[#50608A]">
          {albumView === "album" && albumData ? (
            <>
              @{albumData.u} · Коллекция {albumData.collection.owned} из {albumData.collection.total}
              {albumData.series[0]
                ? ` · ${albumData.series[0].name}: ${albumData.series[0].owned} из ${albumData.series[0].total}`
                : ""}
            </>
          ) : albumView === "loading" ? (
            "Загрузка альбома…"
          ) : albumView === "offline" ? (
            "Альбом доступен на стриме"
          ) : albumView === "unauthorized" ? (
            "Ссылка недействительна"
          ) : albumView === "not_found" ? (
            "Игрок не найден"
          ) : albumView === "landing" ? (
            showPreviewGrid ? (
              <>
                {ruCount(CARDS.length, ["карта", "карты", "карт"])} ·{" "}
                {ruCount(Object.keys(CFG).length, ["редкость", "редкости", "редкостей"])} · предпросмотр
              </>
            ) : (
              "Получите ссылку командой !альбом в чате стрима"
            )
          ) : (
            <>
              {ruCount(CARDS.length, ["карта", "карты", "карт"])} ·{" "}
              {ruCount(Object.keys(CFG).length, ["редкость", "редкости", "редкостей"])}
            </>
          )}
        </p>
        <div className="flex items-center justify-center gap-2 sm:gap-3 mt-3 sm:mt-4 opacity-35">
          <div className="h-px w-16 sm:w-28 md:w-44" style={{ background: "linear-gradient(to right, transparent, #D4AF37)" }} />
          <svg width="14" height="14" viewBox="-7 -7 14 14">
            <StarPoly cx={0} cy={0} r={6} n={8} inner={0.5} fill="#D4AF37" opacity={1} />
          </svg>
          <div className="h-px w-16 sm:w-28 md:w-44" style={{ background: "linear-gradient(to left, transparent, #D4AF37)" }} />
        </div>
      </header>

      {/* Card grid */}
      <main className="relative z-10 px-3 sm:px-5 md:px-6 pb-16 sm:pb-20">
        {albumView === "loading" && (
          <p className="text-center type-eyebrow text-[#50608A] py-20">Загрузка альбома…</p>
        )}
        {(albumView === "offline" || albumView === "unauthorized" || albumView === "not_found") && (
          <p className="text-center type-eyebrow text-[#50608A] py-20">
            {albumView === "offline" && "Альбом доступен на стриме — туннель выключен или API недоступен."}
            {albumView === "unauthorized" && "Ссылка недействительна или устарела."}
            {albumView === "not_found" && "Игрок не найден."}
          </p>
        )}
        {albumView === "landing" && !showPreviewGrid && (
          <p className="text-center type-eyebrow text-[#50608A] max-w-lg mx-auto py-10">
            Откройте альбом по персональной ссылке из чата GoodGame. Полный каталог карт здесь не показывается.
          </p>
        )}
        {gridCards.length > 0 && (
        <div className="grid grid-cols-2 min-[480px]:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-4 md:gap-5 max-w-[1600px] mx-auto">
          {gridCards.map((card, idx) => (
            <CardTile
              key={`${card.princess}-${idx}`}
              idx={idx}
              princess={card.princess}
              rarity={card.rarity}
              portrait={card.portrait}
              tileRef={el => { tileRefs.current[idx] = el; }}
              onClick={() => setSelectedCard(card)}
            />
          ))}
          <CardBackTile
            idx={gridCards.length}
            tileRef={el => { tileRefs.current[gridCards.length] = el; }}
          />
        </div>
        )}
        {albumView === "album" && displayCards.length === 0 && (
          <p className="text-center type-eyebrow text-[#50608A] py-20">В альбоме пока нет карт.</p>
        )}

        {/* Footer ornament */}
        <div className="text-center mt-14 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 opacity-20">
            <div className="h-px w-16" style={{ background: "linear-gradient(to right, transparent, #D4AF37)" }} />
            <svg width="10" height="10" viewBox="-5 -5 10 10">
              <StarPoly cx={0} cy={0} r={4} n={4} fill="#D4AF37" opacity={1} />
            </svg>
            <div className="h-px w-16" style={{ background: "linear-gradient(to left, transparent, #D4AF37)" }} />
          </div>
          <p className="type-meta" style={{ color: "#5C6C94" }}>
            Серия «Фантастический коллекционер» · Тираж № 001
          </p>
          <p className="type-meta mt-1" style={{ color: "#465577" }}>
            © 2026 klon008
          </p>
        </div>
      </main>

      <AnimatePresence>
        {selectedCard && (
          <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}
