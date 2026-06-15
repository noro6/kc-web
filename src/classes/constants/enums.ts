export const AIR_STATE = {
  KAKUHO: 0,
  YUSEI: 1,
  KINKO: 2,
  RESSEI: 3,
  SOSHITSU: 4,
  NONE: 5,
} as const;

export type AIR_STATE = typeof AIR_STATE[keyof typeof AIR_STATE];

export const FLEET_TYPE = {
  SINGLE: 0,
  CTF: 1,
  STF: 2,
  TCF: 3,
} as const;

export type FLEET_TYPE = typeof FLEET_TYPE[keyof typeof FLEET_TYPE];

/** 艦種 */
export const SHIP_TYPE = {
  DE: 1,
  DD: 2,
  CL: 3,
  CLT: 4,
  CA: 5,
  CAV: 6,
  CVL: 7,
  FBB: 8,
  BB: 9,
  BBV: 10,
  CV: 11,
  BBB: 12,
  SS: 13,
  SSV: 14,
  AO_2: 15,
  AV: 16,
  LHA: 17,
  CVB: 18,
  AR: 19,
  AS: 20,
  CT: 21,
  AO: 22,
} as const;

export type SHIP_TYPE = typeof SHIP_TYPE[keyof typeof SHIP_TYPE];

/** 基地札種類 */
export const AB_MODE = {
  WAIT: 0,
  BATTLE: 1,
  DEFENSE: 2,
} as const;

export type AB_MODE = typeof AB_MODE[keyof typeof AB_MODE];

/** 陣形 */
export const FORMATION = {
  LINE_AHEAD: 1,
  DOUBLE_LINE: 2,
  DIAMOND: 3,
  ECHELON: 4,
  LINE_ABREAST: 5,
  VANGUARD: 6,
  FORMATION1: 15,
  FORMATION2: 12,
  FORMATION3: 13,
  FORMATION4: 11,
} as const;

export type FORMATION = typeof FORMATION[keyof typeof FORMATION];

/** 戦闘マス形式 */
export const CELL_TYPE = {
  NORMAL: 1,
  GRAND: 2,
  AIR_RAID: 3,
  NIGHT: 4,
  HIGH_AIR_RAID: 5,
  AERIAL_COMBAT: 6,
  SUPER_HIGH_AIR_RAID: 7,
  AIR_SUPPORTED_ASW: 8,
  RADAR: 9,
} as const;

export type CELL_TYPE = typeof CELL_TYPE[keyof typeof CELL_TYPE];

/** 難易度 */
export const DIFFICULTY_LEVEL = {
  HARD: 0,
  MEDIUM: 1,
  EASY: 2,
  CASUAL: 3,
} as const;

export type DIFFICULTY_LEVEL = typeof DIFFICULTY_LEVEL[keyof typeof DIFFICULTY_LEVEL];

/** 火力キャップ */
export const CAP = {
  AS: 170,
  BATTLE: 220,
  SUPPORT: 170,
  NIGHT: 360,
  LBAS: 220,
} as const;

export type CAP = typeof CAP[keyof typeof CAP];

/** 難易度 */
export const SUPPORT_TYPE = {
  SHELLING: 0,
  AIRSTRIKE: 1,
  ANTI_SUBMARINE: 2,
  LONG_RANGE_TORPEDO: 3,
  NOT_FOUND_DD: 4,
  NONE: 5,
} as const;

export type SUPPORT_TYPE = typeof SUPPORT_TYPE[keyof typeof SUPPORT_TYPE];
