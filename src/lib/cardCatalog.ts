import type { RarityKey } from "./albumApi";
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

export interface CatalogEntry {
  id: string;
  name: string;
  rarity: RarityKey;
  portrait: string;
  sortOrder: number;
}

/** Стабильный порядок каталога (контракт с ботом). */
export const CATALOG_ORDER: string[] = [
  "cinderella",
  "belle",
  "ariel",
  "snow-white",
  "rapunzel",
  "jasmine",
  "moana",
  "pocahontas",
  "aurora",
  "tiana",
  "merida",
  "asha",
  "raya",
  "mulan",
  "anna",
  "nala",
  "queen-elsa",
  "megara",
  "esmeralda",
  "jane",
  "mirabel",
  "tinker-bell",
  "kida",
  "giselle",
  "flounder",
  "olaf",
  "pascal",
  "elsa",
];

const PORTRAITS: Record<string, string> = {
  cinderella: cinderellaImg,
  belle: belleImg,
  ariel: arielImg,
  "snow-white": snowWhiteImg,
  rapunzel: rapunzelImg,
  jasmine: jasmineImg,
  moana: moanaImg,
  pocahontas: pocahontasImg,
  aurora: auroraImg,
  tiana: tianaImg,
  merida: meridaImg,
  asha: ashaImg,
  raya: rayaImg,
  mulan: mulanImg,
  anna: annaImg,
  nala: nalaImg,
  "queen-elsa": queenElsaImg,
  megara: megaraImg,
  esmeralda: esmeraldaImg,
  jane: janeImg,
  mirabel: mirabelImg,
  "tinker-bell": tinkerBellImg,
  kida: kidaImg,
  giselle: giselleImg,
  flounder: flounderImg,
  olaf: olafImg,
  pascal: pascalImg,
  elsa: elsaImg,
};

const NAMES: Record<string, string> = {
  cinderella: "Золушка",
  belle: "Белль",
  ariel: "Ариэль",
  "snow-white": "Белоснежка",
  rapunzel: "Рапунцель",
  jasmine: "Жасмин",
  moana: "Моана",
  pocahontas: "Покахонтас",
  aurora: "Аврора",
  tiana: "Тиана",
  merida: "Мерида",
  asha: "Аша",
  raya: "Рая",
  mulan: "Мулан",
  anna: "Анна",
  nala: "Нала",
  "queen-elsa": "Королева Эльза",
  megara: "Мегара",
  esmeralda: "Эсмеральда",
  jane: "Джейн",
  mirabel: "Мирабель",
  "tinker-bell": "Динь-Динь",
  kida: "Кида",
  giselle: "Жизель",
  flounder: "Флаундер",
  olaf: "Олаф",
  pascal: "Паскаль",
  elsa: "Эльза",
};

const RARITIES: Record<string, RarityKey> = {
  cinderella: "common",
  belle: "uncommon",
  ariel: "rare",
  "snow-white": "common",
  rapunzel: "epic",
  jasmine: "uncommon",
  moana: "rare",
  pocahontas: "common",
  aurora: "legendary",
  tiana: "uncommon",
  merida: "rare",
  asha: "common",
  raya: "epic",
  mulan: "uncommon",
  anna: "rare",
  nala: "common",
  "queen-elsa": "secretRare",
  megara: "secretRare",
  esmeralda: "rare",
  jane: "common",
  mirabel: "epic",
  "tinker-bell": "uncommon",
  kida: "rare",
  giselle: "uncommon",
  flounder: "common",
  olaf: "common",
  pascal: "common",
  elsa: "mythic",
};

export function catalogIndex(slug: string): number {
  const idx = CATALOG_ORDER.indexOf(slug);
  return idx >= 0 ? idx : 0;
}

export function getCatalogEntry(slug: string): CatalogEntry | null {
  if (!PORTRAITS[slug]) return null;
  return {
    id: slug,
    name: NAMES[slug] ?? slug,
    rarity: RARITIES[slug] ?? "common",
    portrait: PORTRAITS[slug],
    sortOrder: catalogIndex(slug),
  };
}
