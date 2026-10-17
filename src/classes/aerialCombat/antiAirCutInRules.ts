import { ANTI_AIR_CUTIN } from '../constants/battle';
import { GBR } from '../constants/ships';
import { ShipBase } from '../interfaces/shipBase';
import Item from '../item/item';
import AntiAirCutIn from './antiAirCutIn';

/** 対空CIの判定に使う装備id */
const ITEM = {
  /** 10cm連装高角砲(砲架) */
  KOKAKU_10CM_HOUKA: 71,
  /** 94式高射装置 */
  KOSHA_94: 121,
  /** 15m二重測距儀+21号電探改二 */
  YAMATO_RADAR: 142,
  /** QF 2ポンド8連装ポンポン砲 */
  POMPOM: 191,
  /** 8cm高角砲改+増設機銃 */
  KOKAKU_8CM_ZOSETSU: 220,
  /** 12cm30連装噴進砲改二 */
  HUNSHIN_KAI2: 274,
  /** 10cm連装高角砲改+増設機銃 */
  KOKAKU_10CM_ZOSETSU: 275,
  /** 5inch単装砲 Mk.30 */
  MK30: 284,
  /** 16inch Mk.I三連装砲改+FCR type284 */
  MK1_FCR: 300,
  /** 20連装7inch UP Rocket Launchers */
  UP_ROCKET: 301,
  /** GFCS Mk.37 */
  GFCS_MK37: 307,
  /** 5inch単装砲 Mk.30改+GFCS Mk.37 */
  MK30_KAI_GFCS: 308,
  /** 5inch単装砲 Mk.30改 */
  MK30_KAI: 313,
  /** 5inch連装両用砲(集中配備) */
  ATLANTA_GUN: 362,
  /** GFCS Mk.37+5inch連装両用砲(集中配備) */
  ATLANTA_GFCS_GUN: 363,
  /** 15m二重測距儀改+21号電探改二+熟練射撃指揮所 */
  YAMATO_RADAR_KAI: 460,
  /** 10cm連装高角砲群 集中配備 */
  SYUCHU_10CM: 464,
  /** 35.6cm連装砲改三(ダズル迷彩仕様) */
  HARUNA_GUN_KAI3: 502,
  /** 35.6cm連装砲改四 */
  HARUNA_GUN_KAI4: 503,
  /** 25mm対空機銃増備 */
  KIJU_ZOBI: 505,
  /** 12.7cm連装砲C型改三H */
  C_KAI3H: 529,
  /** 10cm連装高角砲改+高射装置改 */
  AKIZUKI_GUN_KAI: 533,
  /** 10cm連装高角砲改 */
  KOKAKU_10CM_KAI: 553,
} as const;

/** 対空CIの判定に使う装備の集計値 */
interface AntiAirEquipment {
  /** 高角砲数 (特殊高角砲を含む) */
  allKokaku: number;
  /** 特殊でない高角砲数 */
  normalKokaku: number;
  /** 特殊高角砲数 */
  specialKokaku: number;
  /** 機銃数 (特殊機銃を含む) */
  allKiju: number;
  /** 特殊でない機銃数 */
  normalKiju: number;
  /** 特殊機銃数 */
  specialKiju: number;
  /** 対空電探数 */
  aaRadar: number;
  /** 高射装置数 */
  kosha: number;
  /** 電探の有無 (対空電探でないものも含む) */
  hasRadar: boolean;
  /** 対空4以上の電探の有無 */
  hasAA4Radar: boolean;
  /** 大口径主砲の有無 */
  hasLargeGun: boolean;
  /** 三式弾の有無 */
  hasSanshiki: boolean;
  /** 高角砲の最大対空値 */
  maxKokakuAA: number;
  /** 機銃の最大対空値 */
  maxKijuAA: number;
  /** 対空3以上の機銃数 */
  kijuAA3Count: number;
  /** 指定した装備の合計所持数 */
  count: (...ids: number[]) => number;
}

type Condition = (e: AntiAirEquipment) => boolean;

const defineConditions = <T extends Record<number, Condition>>(conditions: T): T => conditions;

/** 対空CI種別ごとの装備条件 */
const CUT_IN_CONDITIONS = defineConditions({
  1: (e) => e.allKokaku >= 2 && e.hasRadar,
  2: (e) => e.allKokaku > 0 && e.aaRadar > 0,
  3: (e) => e.allKokaku >= 2,
  4: (e) => e.hasLargeGun && e.hasSanshiki && e.kosha > 0 && e.aaRadar > 0,
  5: (e) => e.specialKokaku >= 2 && e.aaRadar > 0,
  6: (e) => e.hasLargeGun && e.hasSanshiki && e.kosha > 0,
  7: (e) => e.allKokaku > 0 && e.kosha > 0 && e.aaRadar > 0,
  8: (e) => e.specialKokaku > 0 && e.aaRadar > 0,
  9: (e) => e.allKokaku > 0 && e.kosha > 0,
  10: (e) => e.allKokaku > 0 && e.specialKiju > 0 && e.aaRadar > 0,
  11: (e) => e.allKokaku > 0 && e.specialKiju > 0,
  12: (e) => e.specialKiju > 0 && e.kijuAA3Count >= 2 && e.aaRadar > 0,
  13: (e) => e.specialKiju > 0 && e.specialKokaku > 0 && e.aaRadar > 0,
  14: (e) => e.allKokaku > 0 && e.allKiju > 0 && e.aaRadar > 0,
  15: (e) => e.allKokaku > 0 && e.allKiju > 0,
  16: (e) => e.allKokaku > 0 && e.allKiju > 0 && e.aaRadar > 0,
  17: (e) => e.allKokaku > 0 && e.allKiju > 0,
  18: (e) => e.specialKiju > 0,
  19: (e) => e.normalKokaku > 0 && e.specialKiju > 0,
  20: (e) => e.specialKiju > 0,
  21: (e) => e.allKokaku > 0 && e.aaRadar > 0,
  22: (e) => e.specialKiju > 0,
  23: (e) => e.normalKiju > 0,
  24: (e) => e.allKokaku > 0 && e.normalKiju > 0,
  25: (e) => e.aaRadar > 0 && e.hasSanshiki && e.count(ITEM.HUNSHIN_KAI2) > 0,
  26: (e) => e.aaRadar > 0 && e.count(ITEM.KOKAKU_10CM_ZOSETSU) > 0,
  27: (e) => e.aaRadar > 0 && e.count(ITEM.HUNSHIN_KAI2) > 0
    && e.count(ITEM.KOKAKU_10CM_HOUKA, ITEM.KOKAKU_8CM_ZOSETSU, ITEM.KOKAKU_10CM_ZOSETSU) > 0,
  28: (e) => e.aaRadar > 0 && e.count(ITEM.HUNSHIN_KAI2) > 0,
  29: (e) => e.allKokaku > 0 && e.aaRadar > 0,
  30: (e) => e.allKokaku >= 3,
  31: (e) => e.allKokaku >= 2,
  32: (e) => (e.count(ITEM.POMPOM) > 0 && e.count(ITEM.MK1_FCR, ITEM.UP_ROCKET) > 0) || e.count(ITEM.UP_ROCKET) >= 2,
  33: (e) => e.allKokaku > 0 && e.maxKijuAA >= 4,
  34: (e) => e.count(ITEM.MK30_KAI_GFCS) >= 2,
  35: (e) => e.count(ITEM.MK30_KAI_GFCS) > 0 && e.count(ITEM.MK30, ITEM.MK30_KAI) > 0,
  36: (e) => e.count(ITEM.MK30, ITEM.MK30_KAI) >= 2 && e.count(ITEM.GFCS_MK37) > 0,
  37: (e) => e.count(ITEM.MK30_KAI) >= 2,
  38: (e) => e.count(ITEM.ATLANTA_GFCS_GUN) >= 2,
  39: (e) => e.count(ITEM.ATLANTA_GFCS_GUN) > 0 && e.count(ITEM.ATLANTA_GUN) > 0,
  40: (e) => e.count(ITEM.ATLANTA_GFCS_GUN, ITEM.ATLANTA_GUN) >= 2 && e.count(ITEM.GFCS_MK37) > 0,
  41: (e) => e.count(ITEM.ATLANTA_GFCS_GUN, ITEM.ATLANTA_GUN) >= 2,
  42: (e) => e.count(ITEM.YAMATO_RADAR, ITEM.YAMATO_RADAR_KAI) > 0 && e.count(ITEM.SYUCHU_10CM) >= 2 && e.maxKijuAA >= 6,
  43: (e) => e.count(ITEM.YAMATO_RADAR, ITEM.YAMATO_RADAR_KAI) > 0 && e.count(ITEM.SYUCHU_10CM) >= 2,
  44: (e) => e.count(ITEM.YAMATO_RADAR, ITEM.YAMATO_RADAR_KAI) > 0 && e.count(ITEM.SYUCHU_10CM) > 0 && e.maxKijuAA >= 6,
  45: (e) => e.count(ITEM.YAMATO_RADAR, ITEM.YAMATO_RADAR_KAI) > 0 && e.count(ITEM.SYUCHU_10CM) > 0,
  46: (e) => e.specialKiju > 0 && e.aaRadar > 0 && e.count(ITEM.HARUNA_GUN_KAI3, ITEM.HARUNA_GUN_KAI4) > 0,
  47: (e) => e.count(ITEM.C_KAI3H) >= 2 || (e.count(ITEM.C_KAI3H) > 0 && (e.hasAA4Radar || e.count(ITEM.KIJU_ZOBI) > 0)),
  48: (e) => e.count(ITEM.AKIZUKI_GUN_KAI) >= 2 && e.hasAA4Radar,
  49: (e) => e.specialKokaku >= 2 && e.aaRadar > 0,
  50: (e) => e.count(ITEM.AKIZUKI_GUN_KAI, ITEM.KOKAKU_10CM_KAI) >= 2 && e.hasAA4Radar && e.count(ITEM.KOSHA_94) > 0,
  51: (e) => e.count(ITEM.AKIZUKI_GUN_KAI, ITEM.KOKAKU_10CM_KAI) > 0 && e.hasAA4Radar && e.maxKijuAA >= 5,
  52: (e) => e.count(ITEM.KOKAKU_10CM_KAI) >= 2 && e.count(ITEM.KOSHA_94) > 0,
  53: (e) => e.maxKokakuAA >= 9 && e.hasAA4Radar,
});

type CutInId = keyof typeof CUT_IN_CONDITIONS;

type ShipData = ShipBase['data'];

/**
 * 対空CIの判定対象にする艦の規則
 * shipIds / type2s / match のいずれか1つで対象艦を指定し、どれも指定しなければ全艦が対象
 */
interface ShipRule {
  shipIds?: readonly number[];
  type2s?: readonly number[];
  match?: (ship: ShipData) => boolean;
  cutInIds: readonly CutInId[];
}

const SHIP_RULES: readonly ShipRule[] = [
  // 汎用
  { cutInIds: [4, 6, 9, 12] },
  // 秋月型以外
  { match: (s) => s.type2 !== 54, cutInIds: [5, 7, 8] },
  // 摩耶改二 / 飛龍改三 / 北上改三以外
  { match: (s) => s.id !== 428 && s.id !== 1031 && s.id !== 1071, cutInIds: [13] },

  // 秋月型
  { type2s: [54], cutInIds: [1, 2, 3, 50, 52] },
  // 秋月型改以降
  { match: (s) => s.type2 === 54 && s.version >= 1, cutInIds: [48] },
  // 吹雪改二 / 藤波改二 / 早波改二 / 浜波改二 / 白雪改二 / 初雪改二 / 玉波改二 / 吹雪改三 / 吹雪改三護
  { shipIds: [426, 981, 982, 983, 986, 987, 1033, 1035, 1040], cutInIds: [49, 50, 51, 52] },
  // 摩耶改二
  { shipIds: [428], cutInIds: [10, 11] },
  // 五十鈴改二
  { shipIds: [141], cutInIds: [14, 15] },
  // 霞改二乙
  { shipIds: [470], cutInIds: [16, 17] },
  // 夕張改二
  { shipIds: [622], cutInIds: [16] },
  // 皐月改二
  { shipIds: [418], cutInIds: [18] },
  // 鬼怒改二
  { shipIds: [487], cutInIds: [19, 20] },
  // 由良改二
  { shipIds: [488], cutInIds: [21] },
  // 文月改二
  { shipIds: [548], cutInIds: [22] },
  // UIT-25 / 伊504
  { shipIds: [539, 530], cutInIds: [23] },
  // 龍田改二
  { shipIds: [478], cutInIds: [24] },
  // 伊勢型改 / 改二
  { shipIds: [82, 88, 553, 554], cutInIds: [25, 28] },
  // 武蔵改
  { shipIds: [148], cutInIds: [28] },
  // 大淀型
  { type2s: [52], cutInIds: [27] },
  // 磯風乙改 / 浜風乙改
  { shipIds: [557, 558], cutInIds: [29] },
  // 天龍改二
  { shipIds: [477], cutInIds: [24, 30, 31] },
  // Gotland改 / Gotland andra
  { shipIds: [579, 630], cutInIds: [30, 33] },
  // 英国艦
  { type2s: GBR, cutInIds: [32] },
  // 金剛型改二以降
  { match: (s) => s.type2 === 6 && s.version >= 2, cutInIds: [32] },
  // Fletcher級
  { type2s: [91], cutInIds: [34, 35, 36, 37] },
  // Atlanta級
  { type2s: [99], cutInIds: [38, 39, 40, 41] },
  // 武蔵改二
  { shipIds: [546], cutInIds: [26, 28, 42, 43, 44, 45] },
  // 大和改二 / 大和改二重
  { shipIds: [911, 916], cutInIds: [26, 42, 43, 44, 45] },
  // 白露型 (素対空70以上)
  { match: (s) => s.type2 === 23 && s.antiAir >= 70, cutInIds: [47] },
  // 榛名改二乙
  { shipIds: [593], cutInIds: [46] },
  // 稲木改二
  { shipIds: [979], cutInIds: [17, 18, 31] },
  // 飛龍改三
  { shipIds: [1031], cutInIds: [10, 11, 27, 53] },
  // 時雨改三 / 吹雪改三
  { shipIds: [961, 1035], cutInIds: [15, 16, 21, 24] },
  // 吹雪改三護
  { shipIds: [1040], cutInIds: [2, 21, 34, 35, 36, 48] },
  // 北上改三
  { shipIds: [1071], cutInIds: [10, 14, 21, 49, 53] },
];

const pushAll = <K>(map: Map<K, CutInId[]>, key: K, ids: readonly CutInId[]) => {
  map.set(key, (map.get(key) ?? []).concat(ids));
};

const RULES_BY_SHIP_ID = new Map<number, CutInId[]>();
const RULES_BY_TYPE2 = new Map<number, CutInId[]>();
const MATCH_RULES: ShipRule[] = [];
SHIP_RULES.forEach((rule) => {
  if (rule.shipIds) {
    rule.shipIds.forEach((id) => pushAll(RULES_BY_SHIP_ID, id, rule.cutInIds));
  } else if (rule.type2s) {
    rule.type2s.forEach((type2) => pushAll(RULES_BY_TYPE2, type2, rule.cutInIds));
  } else {
    MATCH_RULES.push(rule);
  }
});

/** 対空CI種別id => 対空CI */
const CUT_INS: AntiAirCutIn[] = [];
ANTI_AIR_CUTIN.forEach((v) => {
  CUT_INS[v.id] = new AntiAirCutIn(v.id, v.rateBonus, v.c1, v.c2, v.rate / 101);
});

const candidateCache = new WeakMap<ShipData, CutInId[]>();

/** 艦の情報だけで決まる、判定対象の対空CI種別一覧 */
function getCandidateIds(ship: ShipData): CutInId[] {
  const cached = candidateCache.get(ship);
  if (cached) return cached;

  const ids = new Set<CutInId>([
    ...(RULES_BY_SHIP_ID.get(ship.id) ?? []),
    ...(RULES_BY_TYPE2.get(ship.type2) ?? []),
  ]);
  MATCH_RULES.forEach((rule) => {
    if (!rule.match || rule.match(ship)) rule.cutInIds.forEach((id) => ids.add(id));
  });

  const candidates = Array.from(ids);
  candidateCache.set(ship, candidates);
  return candidates;
}

/** 装備を1度だけ走査して集計する 装備がなければ undefined */
function summarizeEquipment(ship: ShipBase): AntiAirEquipment | undefined {
  const itemIds: number[] = [];
  let hasRadar = false;
  let hasAA4Radar = false;
  let hasLargeGun = false;
  let hasSanshiki = false;
  let maxKokakuAA = 0;
  let maxKijuAA = 0;
  let kijuAA3Count = 0;

  const add = (item: Item) => {
    const { id, apiTypeId, iconTypeId, antiAir } = item.data;
    if (!id) return;
    itemIds.push(id);

    if (iconTypeId === 11) {
      hasRadar = true;
      if (antiAir >= 4) hasAA4Radar = true;
    }
    if (iconTypeId === 16) maxKokakuAA = Math.max(maxKokakuAA, antiAir);
    if (apiTypeId === 21) {
      maxKijuAA = Math.max(maxKijuAA, antiAir);
      if (antiAir >= 3) kijuAA3Count += 1;
    }
    if (apiTypeId === 3) hasLargeGun = true;
    if (apiTypeId === 18) hasSanshiki = true;
  };
  ship.items.forEach(add);
  add(ship.exItem);

  if (!itemIds.length) return undefined;

  return {
    allKokaku: ship.kokakuCount + ship.specialKokakuCount,
    normalKokaku: ship.kokakuCount,
    specialKokaku: ship.specialKokakuCount,
    allKiju: ship.kijuCount + ship.specialKijuCount,
    normalKiju: ship.kijuCount,
    specialKiju: ship.specialKijuCount,
    aaRadar: ship.antiAirRadarCount,
    kosha: ship.koshaCount,
    hasRadar,
    hasAA4Radar,
    hasLargeGun,
    hasSanshiki,
    maxKokakuAA,
    maxKijuAA,
    kijuAA3Count,
    count: (...ids) => itemIds.filter((id) => ids.includes(id)).length,
  };
}

/**
 * 発動可能な対空CIを返却
 * 並び順は不定 (発動順は艦隊側で優先度順に並べ替える)
 */
export default function getAvailableAntiAirCutIns(ship: ShipBase): AntiAirCutIn[] {
  const equipment = summarizeEquipment(ship);
  if (!equipment) return [];

  const cutIns: AntiAirCutIn[] = [];
  getCandidateIds(ship.data).forEach((id) => {
    const cutIn = CUT_INS[id];
    if (cutIn && CUT_IN_CONDITIONS[id](equipment)) cutIns.push(cutIn);
  });
  return cutIns;
}
