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

import classicFlounderImg from "@/imports/classic-flounder.webp";
import classicCinderellaImg from "@/imports/classic-cinderella.webp";
import classicSebastianImg from "@/imports/classic-sebastian.webp";
import classicAshaImg from "@/imports/classic-asha.webp";
import classicPascalImg from "@/imports/classic-pascal.webp";
import classicJasmineImg from "@/imports/classic-jasmine.webp";
import classicMulanImg from "@/imports/classic-mulan.webp";
import classicTinkerBellImg from "@/imports/classic-tinker-bell.webp";
import classicPocahontasImg from "@/imports/classic-pocahontas.webp";
import classicMeridaImg from "@/imports/classic-merida.webp";
import classicMirabelImg from "@/imports/classic-mirabel.webp";
import classicBelleImg from "@/imports/classic-belle.webp";
import classicMaximusImg from "@/imports/classic-maximus.webp";
import classicOlafImg from "@/imports/classic-olaf.webp";
import classicMegaraImg from "@/imports/classic-megara.webp";
import classicRayaImg from "@/imports/classic-raya.webp";
import classicMoanaImg from "@/imports/classic-moana.webp";
import classicTianaImg from "@/imports/classic-tiana.webp";
import classicSnowWhiteImg from "@/imports/classic-snow-white.webp";
import classicNokkImg from "@/imports/classic-nokk.webp";
import classicArielImg from "@/imports/classic-ariel.webp";
import classicRapunzelImg from "@/imports/classic-rapunzel.webp";
import classicEsmeraldaImg from "@/imports/classic-esmeralda.webp";
import classicElsaImg from "@/imports/classic-elsa.webp";
import classicAuroraImg from "@/imports/classic-aurora.webp";
import classicKidaImg from "@/imports/classic-kida.webp";
import classicJaneImg from "@/imports/classic-jane.webp";
import classicAnnaImg from "@/imports/classic-anna.webp";
import classicBruniImg from "@/imports/classic-bruni.webp";
import classicElsaSpiritImg from "@/imports/classic-elsa-spirit.webp";
// series-pack:generated:imports:start
import resortAuroraImg from "@/imports/resort-aurora.webp";
import resortAlisaImg from "@/imports/resort-alisa.webp";
import resortAnnaImg from "@/imports/resort-anna.webp";
import resortArielImg from "@/imports/resort-ariel.webp";
import resortBelleImg from "@/imports/resort-belle.webp";
import resortSnowWhiteImg from "@/imports/resort-snow-white.webp";
import resortVanellopeImg from "@/imports/resort-vanellope.webp";
import resortJaneImg from "@/imports/resort-jane.webp";
import resortJasmineImg from "@/imports/resort-jasmine.webp";
import resortCinderellaImg from "@/imports/resort-cinderella.webp";
import resortCassandraImg from "@/imports/resort-cassandra.webp";
import resortKidaImg from "@/imports/resort-kida.webp";
import resortMegaraImg from "@/imports/resort-megara.webp";
import resortMeridaImg from "@/imports/resort-merida.webp";
import resortMirabelImg from "@/imports/resort-mirabel.webp";
import resortMoanaImg from "@/imports/resort-moana.webp";
import resortMulanImg from "@/imports/resort-mulan.webp";
import resortNaniImg from "@/imports/resort-nani.webp";
import resortOlafImg from "@/imports/resort-olaf.webp";
import resortPocahontasImg from "@/imports/resort-pocahontas.webp";
import resortRapunzelImg from "@/imports/resort-rapunzel.webp";
import resortSebastianImg from "@/imports/resort-sebastian.webp";
import resortTianaImg from "@/imports/resort-tiana.webp";
import resortHoneyLemonImg from "@/imports/resort-honey-lemon.webp";
import resortElsaImg from "@/imports/resort-elsa.webp";
import resortChillingElsaImg from "@/imports/resort-chilling-elsa.webp";
import resortEsmeraldaImg from "@/imports/resort-esmeralda.webp";
// series-pack:generated:imports:end

export interface CatalogEntry {
  id: string;
  name: string;
  rarity: RarityKey;
  portrait: string;
  sortOrder: number;
  /** id серии (fantast / classic / …) */
  seriesId: string;
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
  // classic series
  "classic-flounder",
  "classic-cinderella",
  "classic-sebastian",
  "classic-asha",
  "classic-pascal",
  "classic-jasmine",
  "classic-mulan",
  "classic-tinker-bell",
  "classic-pocahontas",
  "classic-merida",
  "classic-mirabel",
  "classic-belle",
  "classic-maximus",
  "classic-olaf",
  "classic-megara",
  "classic-raya",
  "classic-moana",
  "classic-tiana",
  "classic-snow-white",
  "classic-nokk",
  "classic-ariel",
  "classic-rapunzel",
  "classic-esmeralda",
  "classic-elsa",
  "classic-aurora",
  "classic-kida",
  "classic-jane",
  "classic-anna",
  "classic-bruni",
  "classic-elsa-spirit",
  // series-pack:generated:order:start
  
  "resort-aurora",
  "resort-alisa",
  "resort-anna",
  "resort-ariel",
  "resort-belle",
  "resort-snow-white",
  "resort-vanellope",
  "resort-jane",
  "resort-jasmine",
  "resort-cinderella",
  "resort-cassandra",
  "resort-kida",
  "resort-megara",
  "resort-merida",
  "resort-mirabel",
  "resort-moana",
  "resort-mulan",
  "resort-nani",
  "resort-olaf",
  "resort-pocahontas",
  "resort-rapunzel",
  "resort-sebastian",
  "resort-tiana",
  "resort-honey-lemon",
  "resort-elsa",
  "resort-chilling-elsa",
  "resort-esmeralda",
// series-pack:generated:order:end
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
  "classic-flounder": classicFlounderImg,
  "classic-cinderella": classicCinderellaImg,
  "classic-sebastian": classicSebastianImg,
  "classic-asha": classicAshaImg,
  "classic-pascal": classicPascalImg,
  "classic-jasmine": classicJasmineImg,
  "classic-mulan": classicMulanImg,
  "classic-tinker-bell": classicTinkerBellImg,
  "classic-pocahontas": classicPocahontasImg,
  "classic-merida": classicMeridaImg,
  "classic-mirabel": classicMirabelImg,
  "classic-belle": classicBelleImg,
  "classic-maximus": classicMaximusImg,
  "classic-olaf": classicOlafImg,
  "classic-megara": classicMegaraImg,
  "classic-raya": classicRayaImg,
  "classic-moana": classicMoanaImg,
  "classic-tiana": classicTianaImg,
  "classic-snow-white": classicSnowWhiteImg,
  "classic-nokk": classicNokkImg,
  "classic-ariel": classicArielImg,
  "classic-rapunzel": classicRapunzelImg,
  "classic-esmeralda": classicEsmeraldaImg,
  "classic-elsa": classicElsaImg,
  "classic-aurora": classicAuroraImg,
  "classic-kida": classicKidaImg,
  "classic-jane": classicJaneImg,
  "classic-anna": classicAnnaImg,
  "classic-bruni": classicBruniImg,
  "classic-elsa-spirit": classicElsaSpiritImg,
  // series-pack:generated:portraits:start
  
  "resort-aurora": resortAuroraImg,
  "resort-alisa": resortAlisaImg,
  "resort-anna": resortAnnaImg,
  "resort-ariel": resortArielImg,
  "resort-belle": resortBelleImg,
  "resort-snow-white": resortSnowWhiteImg,
  "resort-vanellope": resortVanellopeImg,
  "resort-jane": resortJaneImg,
  "resort-jasmine": resortJasmineImg,
  "resort-cinderella": resortCinderellaImg,
  "resort-cassandra": resortCassandraImg,
  "resort-kida": resortKidaImg,
  "resort-megara": resortMegaraImg,
  "resort-merida": resortMeridaImg,
  "resort-mirabel": resortMirabelImg,
  "resort-moana": resortMoanaImg,
  "resort-mulan": resortMulanImg,
  "resort-nani": resortNaniImg,
  "resort-olaf": resortOlafImg,
  "resort-pocahontas": resortPocahontasImg,
  "resort-rapunzel": resortRapunzelImg,
  "resort-sebastian": resortSebastianImg,
  "resort-tiana": resortTianaImg,
  "resort-honey-lemon": resortHoneyLemonImg,
  "resort-elsa": resortElsaImg,
  "resort-chilling-elsa": resortChillingElsaImg,
  "resort-esmeralda": resortEsmeraldaImg,
// series-pack:generated:portraits:end
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
  raya: "Райя",
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
  "classic-flounder": "Флаундер",
  "classic-cinderella": "Золушка",
  "classic-sebastian": "Себастьян",
  "classic-asha": "Аша",
  "classic-pascal": "Паскаль",
  "classic-jasmine": "Жасмин",
  "classic-mulan": "Мулан",
  "classic-tinker-bell": "Динь-Динь",
  "classic-pocahontas": "Покахонтас",
  "classic-merida": "Мерида",
  "classic-mirabel": "Мирабель",
  "classic-belle": "Белль",
  "classic-maximus": "Максимус",
  "classic-olaf": "Олаф",
  "classic-megara": "Мегара",
  "classic-raya": "Райя",
  "classic-moana": "Моана",
  "classic-tiana": "Тиана",
  "classic-snow-white": "Белоснежка",
  "classic-nokk": "Нокк",
  "classic-ariel": "Ариэль",
  "classic-rapunzel": "Рапунцель",
  "classic-esmeralda": "Эсмеральда",
  "classic-elsa": "Эльза",
  "classic-aurora": "Аврора",
  "classic-kida": "Кида",
  "classic-jane": "Джейн",
  "classic-anna": "Анна",
  "classic-bruni": "Бруни",
  "classic-elsa-spirit": "Домашняя Эльза",
  // series-pack:generated:names:start
  
  "resort-aurora": "Пляжная Аврора",
  "resort-alisa": "Пляжная Алиса",
  "resort-anna": "Пляжная Анна",
  "resort-ariel": "Пляжная Ариэль",
  "resort-belle": "Пляжная Белль",
  "resort-snow-white": "Пляжная Белоснежка",
  "resort-vanellope": "Пляжная Ванилопа",
  "resort-jane": "Пляжная Джейн",
  "resort-jasmine": "Пляжная Жасмин",
  "resort-cinderella": "Пляжная Золушка",
  "resort-cassandra": "Пляжная Кассандра",
  "resort-kida": "Пляжная Кида",
  "resort-megara": "Пляжная Мегара",
  "resort-merida": "Пляжная Мерида",
  "resort-mirabel": "Пляжная Мирабель",
  "resort-moana": "Пляжная Моана",
  "resort-mulan": "Пляжная Мулан",
  "resort-nani": "Пляжная Нани",
  "resort-olaf": "Пляжный Олаф",
  "resort-pocahontas": "Пляжная Покахонтас",
  "resort-rapunzel": "Пляжная Рапунцель",
  "resort-sebastian": "Пляжный Себастьян",
  "resort-tiana": "Пляжная Тиана",
  "resort-honey-lemon": "Пляжная Хани Лемон",
  "resort-elsa": "Пляжная Эльза",
  "resort-chilling-elsa": "Уставшая Эльза",
  "resort-esmeralda": "Пляжная Эсмеральда",
// series-pack:generated:names:end
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
  // classic series
  "classic-flounder": "common",
  "classic-cinderella": "common",
  "classic-sebastian": "common",
  "classic-asha": "common",
  "classic-pascal": "common",
  "classic-jasmine": "common",
  "classic-mulan": "common",
  "classic-tinker-bell": "common",
  "classic-pocahontas": "common",
  "classic-merida": "common",
  "classic-mirabel": "uncommon",
  "classic-belle": "uncommon",
  "classic-maximus": "uncommon",
  "classic-olaf": "uncommon",
  "classic-megara": "uncommon",
  "classic-raya": "uncommon",
  "classic-moana": "uncommon",
  "classic-tiana": "uncommon",
  "classic-snow-white": "rare",
  "classic-nokk": "rare",
  "classic-ariel": "rare",
  "classic-rapunzel": "rare",
  "classic-esmeralda": "rare",
  "classic-elsa": "epic",
  "classic-aurora": "epic",
  "classic-kida": "epic",
  "classic-jane": "epic",
  "classic-anna": "legendary",
  "classic-bruni": "legendary",
  "classic-elsa-spirit": "mythic",
  // series-pack:generated:rarities:start
  
  "resort-aurora": "rare",
  "resort-alisa": "uncommon",
  "resort-anna": "epic",
  "resort-ariel": "uncommon",
  "resort-belle": "uncommon",
  "resort-snow-white": "common",
  "resort-vanellope": "rare",
  "resort-jane": "uncommon",
  "resort-jasmine": "uncommon",
  "resort-cinderella": "rare",
  "resort-cassandra": "epic",
  "resort-kida": "rare",
  "resort-megara": "rare",
  "resort-merida": "uncommon",
  "resort-mirabel": "common",
  "resort-moana": "uncommon",
  "resort-mulan": "common",
  "resort-nani": "common",
  "resort-olaf": "common",
  "resort-pocahontas": "legendary",
  "resort-rapunzel": "epic",
  "resort-sebastian": "common",
  "resort-tiana": "common",
  "resort-honey-lemon": "epic",
  "resort-elsa": "legendary",
  "resort-chilling-elsa": "mythic",
  "resort-esmeralda": "common",
// series-pack:generated:rarities:end
};

/** Явная привязка slug → series (для серий без префикса / импортера). classic-* ещё и через prefix. */
const SERIES_OF: Record<string, string> = {
  // series-pack:generated:seriesOf:start
  
  "resort-aurora": "summer-2026",
  "resort-alisa": "summer-2026",
  "resort-anna": "summer-2026",
  "resort-ariel": "summer-2026",
  "resort-belle": "summer-2026",
  "resort-snow-white": "summer-2026",
  "resort-vanellope": "summer-2026",
  "resort-jane": "summer-2026",
  "resort-jasmine": "summer-2026",
  "resort-cinderella": "summer-2026",
  "resort-cassandra": "summer-2026",
  "resort-kida": "summer-2026",
  "resort-megara": "summer-2026",
  "resort-merida": "summer-2026",
  "resort-mirabel": "summer-2026",
  "resort-moana": "summer-2026",
  "resort-mulan": "summer-2026",
  "resort-nani": "summer-2026",
  "resort-olaf": "summer-2026",
  "resort-pocahontas": "summer-2026",
  "resort-rapunzel": "summer-2026",
  "resort-sebastian": "summer-2026",
  "resort-tiana": "summer-2026",
  "resort-honey-lemon": "summer-2026",
  "resort-elsa": "summer-2026",
  "resort-chilling-elsa": "summer-2026",
  "resort-esmeralda": "summer-2026",
// series-pack:generated:seriesOf:end
};

function resolveSeriesId(slug: string): string {
  if (SERIES_OF[slug]) return SERIES_OF[slug];
  if (slug.startsWith("classic-")) return "classic";
  return "fantast";
}

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
    seriesId: resolveSeriesId(slug),
  };
}
