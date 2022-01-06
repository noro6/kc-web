export interface Formation {
  text: string;
  value: number;
  correction: number;
}
export interface AvoidType {
  text: string;
  value: number;
  c1: number;
  c2: number;
}

export const AIR_STATE = {
  KAKUHO: 0,
  YUSEI: 1,
  KINKO: 2,
  RESSEI: 3,
  SOSHITSU: 4,
  NONE: 5,
} as const;
type AIR_STATE = typeof AIR_STATE[keyof typeof AIR_STATE];

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
type SHIP_TYPE = typeof SHIP_TYPE[keyof typeof SHIP_TYPE];

/** 基地札種類 */
export const AB_MODE = {
  WAIT: 0,
  BATTLE: 1,
  DEFFENSE: 2,
} as const;
type AB_MODE = typeof AB_MODE[keyof typeof AB_MODE];

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
type FORMATION = typeof FORMATION[keyof typeof FORMATION];

/** 戦闘マス形式 */
export const CELL_TYPE = {
  NORMAL: 1,
  GRAND: 2,
  AIR_RAID: 3,
  NIGHT: 4,
  HIGH_AIR_RAID: 5,
  AERIAL_COMBAT: 6,
} as const;
type CELL_TYPE = typeof CELL_TYPE[keyof typeof CELL_TYPE];

/** 難易度 */
export const DIFFICULTY_LEVEL = {
  HARD: 0,
  MEDIUM: 1,
  EASY: 2,
  CASUAL: 3,
} as const;
type DIFFICULTY_LEVEL = typeof DIFFICULTY_LEVEL[keyof typeof DIFFICULTY_LEVEL];

export default class Const {
  /**
 * 基地航空隊札一覧
 * @static
 * @memberof Const
 */
  public static readonly AIR_STATUS = [
    { text: '確保', value: AIR_STATE.KAKUHO, color: 'green' },
    { text: '優勢', value: AIR_STATE.YUSEI, color: 'light-green' },
    { text: '拮抗', value: AIR_STATE.KINKO, color: 'yellow' },
    { text: '劣勢', value: AIR_STATE.RESSEI, color: 'deep-orange' },
    { text: '喪失', value: AIR_STATE.SOSHITSU, color: 'red' },
    { text: '不発', value: AIR_STATE.NONE, color: 'secondary' },
  ];

  /**
   * 基地航空隊札一覧
   * @static
   * @memberof Const
   */
  public static readonly AB_MODE_ITEMS = [
    { text: '出撃', value: AB_MODE.BATTLE },
    { text: '防空', value: AB_MODE.DEFFENSE },
    { text: '待機', value: AB_MODE.WAIT },
  ];

  public static readonly PLANE_TYPES = [6, 7, 8, 9, 10, 11, 41, 45, 47, 48, 49, 53, 57];

  public static readonly CB_PLANE_TYPES = [6, 7, 8, 9, 57];

  public static readonly SP_PLANE_TYPES = [10, 11, 41, 45];

  public static readonly LB_PLANE_TYPES = [47, 48, 49, 53];

  public static readonly FIGHTERS = [6, 45, 48];

  public static readonly ATTACKERS = [7, 8, 11, 47, 53, 57];

  public static readonly RECONNAISSANCES = [9, 10, 41, 49];

  public static readonly LB_ATTACKERS = [47, 53];

  public static readonly ROCKET = [350, 351, 352];

  /**
   * 艦種一覧
   * @static
   * @memberof Const
   */
  public static readonly SHIP_TYPES_INFO = [
    { id: SHIP_TYPE.DE, name: '海防艦', itemType: [1, 12, 14, 15, 21, 23, 36, 37, 39, 43] },
    { id: SHIP_TYPE.DD, name: '駆逐艦', itemType: [1, 5, 12, 14, 15, 17, 21, 23, 29, 30, 33, 36, 37, 39, 43] },
    { id: SHIP_TYPE.CL, name: '軽巡洋艦', itemType: [1, 2, 4, 5, 10, 12, 13, 14, 15, 17, 21, 23, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: SHIP_TYPE.CLT, name: '重雷装巡洋艦', itemType: [1, 2, 4, 5, 12, 13, 14, 15, 17, 21, 22, 23, 33, 34, 36, 39, 43] },
    { id: SHIP_TYPE.CA, name: '重巡洋艦', itemType: [2, 4, 5, 10, 12, 13, 17, 18, 21, 23, 27, 29, 33, 34, 36, 39, 40, 43] },
    { id: SHIP_TYPE.CAV, name: '航空巡洋艦', itemType: [2, 4, 5, 10, 11, 12, 13, 17, 18, 21, 23, 25, 27, 29, 30, 33, 34, 35, 36, 37, 39, 40, 43, 45, 50] },
    { id: SHIP_TYPE.CVL, name: '軽空母', itemType: [4, 6, 7, 8, 9, 12, 13, 17, 21, 23, 25, 26, 27, 34, 35, 36, 40, 43, 50] },
    { id: SHIP_TYPE.FBB, name: '高速戦艦', itemType: [3, 4, 10, 12, 13, 17, 18, 19, 21, 23, 28, 29, 33, 34, 36, 39, 40, 42, 43] },
    { id: SHIP_TYPE.BB, name: '戦艦', itemType: [2, 3, 4, 10, 12, 13, 17, 18, 19, 21, 23, 28, 29, 33, 34, 36, 39, 40, 42, 43] },
    { id: SHIP_TYPE.BBV, name: '航空戦艦', itemType: [2, 3, 4, 10, 11, 12, 13, 17, 18, 19, 21, 23, 25, 28, 29, 33, 34, 35, 36, 37, 39, 40, 42, 43, 45, 50] },
    { id: SHIP_TYPE.CV, name: '正規空母', itemType: [4, 6, 7, 8, 9, 12, 13, 17, 21, 23, 28, 34, 35, 36, 40, 43, 50] },
    { id: SHIP_TYPE.BBB, name: '超弩級戦艦', itemType: [2, 3, 4, 10, 12, 13, 17, 18, 19, 21, 23, 28, 29, 33, 34, 36, 39, 40, 42, 43] },
    { id: SHIP_TYPE.SS, name: '潜水艦', itemType: [5, 14, 17, 22, 23, 32, 37, 43, 46, 51] },
    { id: SHIP_TYPE.SSV, name: '潜水空母', itemType: [5, 10, 11, 14, 17, 22, 23, 32, 37, 43, 45, 46, 51] },
    { id: SHIP_TYPE.AO_2, name: '補給艦', itemType: [] },
    { id: SHIP_TYPE.AV, name: '水上機母艦', itemType: [1, 4, 10, 11, 12, 13, 15, 17, 21, 22, 23, 24, 27, 29, 30, 33, 34, 36, 37, 39, 40, 43, 45, 46, 50] },
    { id: SHIP_TYPE.LHA, name: '揚陸艦', itemType: [1, 4, 12, 15, 17, 21, 23, 24, 25, 26, 30, 34, 36, 37, 40, 43, 46, 50] },
    { id: SHIP_TYPE.CVB, name: '装甲空母', itemType: [4, 6, 7, 8, 9, 12, 13, 17, 21, 23, 28, 34, 35, 36, 40, 43, 50] },
    { id: SHIP_TYPE.AR, name: '工作艦', itemType: [1, 4, 12, 17, 21, 23, 25, 27, 31, 33, 36, 43, 50] },
    { id: SHIP_TYPE.AS, name: '潜水母艦', itemType: [1, 4, 10, 12, 17, 21, 23, 25, 27, 33, 34, 36, 37, 39, 40, 43, 45] },
    { id: SHIP_TYPE.CT, name: '練習巡洋艦', itemType: [1, 2, 4, 5, 10, 12, 13, 14, 15, 17, 21, 23, 27, 34, 36, 39, 43] },
    { id: SHIP_TYPE.AO, name: '補給艦', itemType: [1, 10, 11, 12, 17, 21, 23, 25, 30, 35, 36, 43, 44, 45] },
  ];

  /**
   * 補強増設に搭載可能
   * @static
   * @memberof Const
   */
  public static readonly EXPANDED_ITEM_TYPE = [17, 21, 23, 27, 28, 36, 39, 43, 44, 51];

  /**
   * 補強増設 艦娘指定特別装備枠
   * @static
   * @memberof Const
   */
  public static readonly EXPANDED_SPECIAL_ITEM = [
    { itemId: 66, shipApi: [137, 138, 139, 140, 154, 182, 184, 187, 305, 306, 307, 314, 343, 356, 465, 488, 501, 503, 504, 506, 508, 509, 662, 663, 668, 883, 888] },
    { itemId: 71, shipApi: [136, 148, 153, 156, 183, 321, 546] },
    { itemId: 220, shipApi: [137, 138, 139, 140, 154, 182, 184, 187, 305, 306, 307, 314, 343, 356, 465, 488, 501, 503, 504, 506, 508, 509, 662, 663, 668, 883, 888] },
    { itemId: 275, shipApi: [136, 148, 153, 156, 183, 321, 546] },
    { itemId: 408, shipApi: [621, 626] },
    { itemId: 413, shipApi: [21, 22, 23, 24, 25, 53, 54, 55, 56, 57, 58, 99, 100, 101, 113, 114, 118, 119, 137, 138, 139, 140, 141, 146, 158, 159, 160, 183, 200, 215, 216, 217, 218, 219, 220, 221, 222, 223, 224, 289, 290, 305, 306, 307, 314, 321, 330, 346, 357, 421, 422, 423, 487, 488, 532, 537, 542, 543, 547, 649, 652, 657, 662, 663, 668] },
  ];

  /**
   * 特定の艦娘が特別に装備できる装備種別
   * @static
   * @memberof Const
   */
  public static readonly SHIP_ITEM_LINK = [
    { id: 131, itemType: [2, 3, 4, 10, 12, 13, 16, 17, 18, 19, 20, 21, 23, 28, 29, 33, 34, 36, 38, 39, 40, 42, 43, 93] },
    { id: 136, itemType: [2, 3, 4, 10, 12, 13, 16, 17, 18, 19, 20, 21, 23, 28, 29, 33, 34, 36, 38, 39, 40, 42, 43, 45, 93] },
    { id: 143, itemType: [2, 3, 4, 10, 12, 13, 16, 17, 18, 19, 20, 21, 23, 28, 29, 33, 34, 36, 38, 39, 40, 42, 43, 93] },
    { id: 146, itemType: [1, 2, 4, 5, 12, 13, 14, 15, 17, 20, 21, 22, 23, 27, 33, 34, 36, 39, 43] },
    { id: 147, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 24, 27, 29, 30, 33, 36, 37, 39, 43, 46] },
    { id: 148, itemType: [2, 3, 4, 10, 12, 13, 16, 17, 18, 19, 20, 21, 23, 28, 29, 33, 34, 36, 38, 39, 40, 42, 43, 45, 93] },
    { id: 166, itemType: [1, 4, 6, 12, 15, 17, 20, 21, 23, 24, 25, 26, 30, 34, 35, 36, 37, 40, 43, 46, 50] },
    { id: 178, itemType: [3, 4, 5, 10, 12, 13, 16, 17, 18, 19, 20, 21, 23, 28, 29, 33, 34, 36, 39, 40, 42, 43, 93] },
    { id: 198, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 24, 29, 30, 33, 36, 37, 39, 43, 46] },
    { id: 199, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 24, 29, 30, 33, 36, 37, 39, 43, 46] },
    { id: 200, itemType: [1, 2, 4, 5, 10, 12, 13, 14, 15, 17, 20, 21, 22, 23, 24, 29, 30, 33, 34, 36, 37, 39, 43, 46] },
    { id: 216, itemType: [1, 2, 4, 5, 10, 12, 13, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: 217, itemType: [1, 2, 4, 5, 10, 12, 13, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: 260, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 24, 29, 30, 33, 36, 37, 39, 43] },
    { id: 275, itemType: [2, 3, 4, 10, 12, 13, 16, 17, 18, 19, 20, 21, 23, 28, 29, 33, 34, 36, 38, 39, 40, 42, 43, 45, 93] },
    { id: 276, itemType: [2, 3, 4, 10, 12, 13, 16, 17, 18, 19, 20, 21, 23, 28, 29, 33, 34, 36, 38, 39, 40, 42, 43, 45, 93] },
    { id: 305, itemType: [1, 2, 4, 5, 10, 11, 12, 13, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: 306, itemType: [1, 2, 4, 5, 10, 11, 12, 13, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: 307, itemType: [1, 2, 4, 5, 10, 11, 12, 13, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: 314, itemType: [1, 2, 4, 5, 10, 11, 12, 13, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: 330, itemType: [1, 5, 12, 13, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 34, 36, 37, 39, 40, 43] },
    { id: 343, itemType: [1, 2, 4, 5, 10, 12, 13, 14, 15, 17, 20, 21, 23, 27, 29, 34, 36, 39, 43] },
    { id: 346, itemType: [1, 5, 12, 13, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 34, 36, 37, 39, 40, 43] },
    { id: 352, itemType: [1, 8, 10, 11, 12, 13, 14, 17, 20, 21, 23, 24, 25, 30, 35, 36, 43, 44, 45, 46] },
    { id: 356, itemType: [1, 2, 4, 5, 10, 12, 13, 14, 15, 17, 20, 21, 23, 27, 29, 34, 36, 39, 43] },
    { id: 357, itemType: [1, 5, 12, 13, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 34, 36, 37, 39, 40, 43] },
    { id: 358, itemType: [2, 4, 5, 10, 11, 12, 13, 16, 17, 18, 20, 21, 23, 27, 29, 33, 34, 36, 39, 40, 43, 45] },
    { id: 361, itemType: [2, 4, 5, 10, 11, 12, 13, 16, 17, 18, 20, 21, 23, 27, 29, 33, 34, 36, 39, 40, 43, 45] },
    { id: 372, itemType: [1, 2, 4, 10, 11, 12, 13, 14, 16, 17, 20, 21, 23, 24, 25, 27, 29, 30, 33, 34, 35, 36, 37, 39, 40, 42, 43, 45, 46, 50] },
    { id: 380, itemType: [4, 6, 7, 8, 12, 13, 14, 15, 16, 17, 20, 21, 23, 26, 27, 34, 35, 36, 43, 50] },
    { id: 381, itemType: [4, 6, 7, 8, 12, 13, 14, 15, 16, 17, 20, 21, 23, 26, 27, 34, 35, 36, 39, 43, 50] },
    { id: 392, itemType: [3, 4, 10, 11, 12, 13, 16, 17, 18, 19, 20, 21, 23, 28, 29, 33, 34, 36, 39, 40, 42, 43, 93] },
    { id: 418, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 24, 29, 30, 33, 36, 37, 39, 43, 46] },
    { id: 419, itemType: [1, 5, 12, 13, 14, 15, 17, 20, 21, 23, 24, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: 421, itemType: [1, 5, 12, 13, 14, 15, 17, 20, 21, 23, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: 422, itemType: [1, 5, 12, 13, 14, 15, 17, 20, 21, 23, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: 423, itemType: [1, 5, 12, 13, 14, 15, 17, 20, 21, 23, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: 434, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 24, 29, 30, 33, 36, 37, 39, 43] },
    { id: 435, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 24, 29, 30, 33, 36, 37, 39, 43] },
    { id: 445, itemType: [1, 4, 10, 11, 12, 13, 15, 16, 17, 20, 21, 23, 27, 29, 30, 33, 34, 36, 39, 40, 41, 43, 45, 50] },
    { id: 446, itemType: [3, 4, 10, 11, 12, 13, 16, 17, 18, 19, 20, 21, 23, 28, 29, 33, 34, 36, 39, 40, 42, 43, 45, 93] },
    { id: 447, itemType: [3, 4, 10, 11, 12, 13, 16, 17, 18, 19, 20, 21, 23, 28, 29, 33, 34, 36, 39, 40, 42, 43, 45, 93] },
    { id: 450, itemType: [1, 4, 10, 11, 12, 13, 14, 15, 16, 17, 20, 21, 23, 24, 27, 29, 30, 31, 33, 34, 35, 36, 37, 39, 40, 41, 43, 45, 46, 50] },
    { id: 464, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 24, 29, 30, 33, 34, 36, 37, 39, 43, 46] },
    { id: 466, itemType: [4, 6, 7, 8, 9, 12, 13, 16, 17, 20, 21, 23, 28, 34, 35, 36, 40, 43, 50, 56, 57, 58, 59, 94] },
    { id: 467, itemType: [4, 6, 7, 8, 9, 12, 13, 16, 17, 20, 21, 23, 28, 34, 35, 36, 40, 43, 50, 56, 57, 58, 59, 94] },
    { id: 468, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 24, 29, 30, 33, 36, 37, 39, 43, 46] },
    { id: 469, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 24, 29, 30, 33, 36, 37, 39, 43] },
    { id: 470, itemType: [1, 5, 12, 13, 14, 15, 17, 20, 21, 23, 24, 29, 30, 33, 36, 37, 39, 43, 46] },
    { id: 477, itemType: [1, 2, 5, 12, 14, 15, 17, 20, 21, 23, 25, 29, 30, 33, 34, 36, 37, 39, 42, 43] },
    { id: 478, itemType: [1, 2, 5, 12, 14, 15, 17, 20, 21, 23, 24, 25, 29, 30, 33, 34, 36, 37, 39, 43, 46] },
    { id: 487, itemType: [1, 2, 4, 5, 10, 12, 13, 14, 15, 17, 20, 21, 23, 24, 29, 30, 33, 34, 36, 37, 39, 43, 46] },
    { id: 488, itemType: [1, 2, 4, 5, 10, 11, 12, 13, 14, 15, 17, 20, 21, 22, 23, 24, 29, 30, 33, 34, 35, 36, 37, 39, 43, 45, 46] },
    { id: 489, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 24, 29, 30, 33, 36, 37, 39, 43, 46] },
    { id: 490, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 24, 29, 30, 33, 36, 37, 39, 43, 46] },
    { id: 491, itemType: [1, 2, 4, 10, 11, 12, 13, 14, 16, 17, 20, 21, 23, 25, 27, 29, 30, 33, 34, 35, 36, 37, 39, 40, 42, 43, 45, 50] },
    { id: 496, itemType: [2, 4, 5, 10, 11, 12, 13, 16, 17, 18, 20, 21, 23, 27, 29, 33, 34, 35, 36, 39, 40, 42, 43, 45] },
    { id: 497, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 29, 30, 33, 34, 36, 37, 39, 43, 46] },
    { id: 498, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 24, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: 500, itemType: [1, 2, 4, 10, 11, 12, 14, 15, 17, 20, 21, 23, 24, 25, 27, 29, 30, 33, 34, 35, 36, 37, 39, 40, 41, 43, 44, 45, 46, 50] },
    { id: 501, itemType: [2, 4, 5, 10, 11, 12, 13, 16, 17, 18, 20, 21, 23, 25, 27, 29, 30, 33, 34, 35, 36, 37, 39, 40, 42, 43, 45, 50] },
    { id: 506, itemType: [2, 4, 5, 10, 11, 12, 13, 16, 17, 18, 20, 21, 22, 23, 24, 25, 27, 29, 30, 33, 34, 35, 36, 37, 39, 40, 42, 43, 45, 46, 50] },
    { id: 521, itemType: [4, 6, 7, 12, 16, 17, 20, 21, 23, 27, 35, 36, 43, 50] },
    { id: 526, itemType: [4, 6, 7, 8, 12, 13, 16, 17, 20, 21, 23, 27, 34, 35, 36, 43, 50] },
    { id: 529, itemType: [4, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17, 20, 21, 23, 25, 26, 27, 34, 35, 36, 39, 40, 43, 50] },
    { id: 530, itemType: [5, 14, 17, 21, 22, 23, 30, 32, 37, 43, 46, 50, 51] },
    { id: 532, itemType: [1, 5, 12, 13, 14, 15, 17, 20, 21, 23, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: 534, itemType: [4, 6, 7, 8, 12, 13, 14, 15, 16, 17, 20, 21, 23, 27, 34, 35, 36, 43, 50] },
    { id: 536, itemType: [4, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17, 20, 21, 23, 25, 26, 27, 34, 35, 36, 39, 40, 43, 50] },
    { id: 537, itemType: [1, 5, 12, 13, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 34, 36, 37, 39, 40, 43] },
    { id: 539, itemType: [5, 14, 17, 21, 23, 30, 32, 37, 43, 46, 50, 51] },
    { id: 541, itemType: [1, 2, 3, 4, 10, 12, 13, 16, 17, 18, 19, 20, 21, 23, 24, 28, 29, 33, 34, 36, 38, 39, 40, 42, 43, 45, 46, 93] },
    { id: 542, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: 543, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: 546, itemType: [2, 3, 4, 10, 12, 13, 14, 16, 17, 18, 19, 20, 21, 23, 25, 28, 29, 33, 34, 36, 38, 39, 40, 42, 43, 45, 93] },
    { id: 547, itemType: [1, 2, 4, 5, 10, 11, 12, 13, 14, 15, 17, 20, 21, 23, 24, 25, 27, 29, 30, 33, 34, 35, 36, 37, 39, 43, 45, 46] },
    { id: 548, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 24, 29, 30, 33, 36, 37, 39, 43, 46] },
    { id: 553, itemType: [2, 3, 4, 6, 7, 9, 10, 11, 12, 13, 16, 17, 18, 19, 20, 21, 23, 25, 26, 28, 29, 33, 34, 35, 36, 39, 40, 42, 43, 45, 50, 93] },
    { id: 554, itemType: [2, 3, 4, 6, 7, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 23, 25, 26, 28, 29, 33, 34, 35, 36, 39, 40, 42, 43, 45, 50, 93] },
    { id: 563, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 24, 27, 29, 30, 33, 36, 37, 39, 43] },
    { id: 564, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 36, 37, 39, 43, 46] },
    { id: 566, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 36, 37, 39, 43] },
    { id: 567, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: 568, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 36, 37, 39, 43, 46] },
    { id: 569, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 36, 37, 39, 43, 46] },
    { id: 573, itemType: [2, 3, 4, 10, 12, 13, 16, 17, 18, 19, 20, 21, 23, 25, 28, 29, 33, 34, 36, 37, 38, 39, 40, 42, 43, 45, 46, 93] },
    { id: 574, itemType: [1, 2, 4, 5, 10, 11, 12, 14, 15, 17, 20, 21, 23, 25, 29, 30, 33, 34, 35, 36, 37, 39, 43] },
    { id: 578, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 36, 37, 39, 43, 46] },
    { id: 579, itemType: [1, 2, 4, 5, 10, 11, 12, 13, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 34, 35, 36, 37, 39, 42, 43] },
    { id: 581, itemType: [1, 2, 4, 10, 11, 12, 13, 16, 17, 20, 21, 22, 23, 24, 27, 29, 30, 33, 34, 35, 36, 37, 39, 43, 45, 50] },
    { id: 586, itemType: [1, 2, 4, 10, 11, 12, 13, 14, 16, 17, 20, 21, 22, 23, 24, 25, 27, 29, 30, 33, 34, 35, 36, 37, 39, 40, 41, 42, 43, 45, 46, 50] },
    { id: 587, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 24, 29, 30, 33, 34, 36, 37, 39, 43, 46] },
    { id: 588, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 29, 30, 33, 36, 37, 39, 43, 46] },
    { id: 591, itemType: [3, 4, 5, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 23, 28, 29, 33, 34, 36, 37, 39, 40, 42, 43, 93] },
    { id: 592, itemType: [3, 4, 5, 10, 12, 13, 14, 16, 17, 18, 19, 20, 21, 23, 28, 29, 33, 34, 36, 37, 39, 40, 42, 43, 45, 93] },
    { id: 605, itemType: [5, 14, 17, 23, 30, 32, 37, 43, 46, 50, 51] },
    { id: 621, itemType: [1, 4, 10, 12, 15, 16, 17, 20, 21, 23, 24, 27, 30, 34, 37, 39, 40, 43, 45, 46] },
    { id: 622, itemType: [1, 2, 5, 12, 13, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: 623, itemType: [1, 2, 5, 12, 14, 15, 17, 20, 21, 22, 23, 24, 27, 29, 30, 33, 34, 36, 37, 39, 43, 46] },
    { id: 624, itemType: [1, 2, 5, 12, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 34, 36, 37, 39, 40, 43] },
    { id: 626, itemType: [1, 4, 10, 11, 12, 13, 14, 15, 16, 17, 20, 21, 23, 24, 25, 27, 29, 30, 34, 35, 36, 37, 39, 40, 42, 43, 45, 46] },
    { id: 628, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: 629, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 34, 36, 37, 39, 40, 43] },
    { id: 630, itemType: [1, 2, 4, 5, 10, 11, 12, 13, 14, 15, 17, 20, 21, 23, 24, 25, 27, 29, 30, 33, 34, 35, 36, 37, 39, 42, 43] },
    { id: 634, itemType: [1, 2, 4, 10, 12, 17, 20, 21, 23, 25, 27, 33, 34, 36, 37, 39, 40, 43, 45] },
    { id: 635, itemType: [1, 2, 4, 10, 12, 17, 20, 21, 23, 25, 27, 33, 34, 36, 37, 39, 40, 43, 45] },
    { id: 639, itemType: [1, 2, 4, 10, 11, 12, 17, 20, 21, 23, 25, 27, 29, 33, 34, 36, 37, 39, 40, 43, 45] },
    { id: 640, itemType: [1, 2, 4, 10, 11, 12, 17, 20, 21, 23, 25, 27, 29, 33, 34, 36, 37, 39, 40, 43, 45] },
    { id: 645, itemType: [12, 13, 14, 17, 23, 24, 27, 29, 30, 34, 42, 43, 44, 50] },
    { id: 646, itemType: [4, 6, 7, 8, 9, 12, 13, 16, 17, 20, 21, 23, 25, 26, 28, 34, 35, 36, 40, 43, 50, 56, 57, 58, 59] },
    { id: 649, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: 650, itemType: [12, 13, 14, 17, 23, 24, 25, 27, 28, 29, 30, 34, 35, 40, 43, 44, 50] },
    { id: 651, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 29, 30, 33, 34, 36, 37, 39, 43] },
    { id: 652, itemType: [1, 2, 4, 5, 10, 11, 12, 13, 14, 15, 17, 20, 21, 23, 25, 27, 29, 30, 33, 34, 35, 36, 37, 39, 43, 45] },
    { id: 656, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 34, 36, 37, 39, 43, 46] },
    { id: 657, itemType: [1, 2, 4, 12, 13, 14, 15, 17, 20, 21, 22, 23, 24, 27, 29, 30, 33, 34, 36, 37, 39, 43, 46] },
    { id: 662, itemType: [1, 2, 4, 5, 10, 11, 12, 13, 14, 15, 17, 20, 21, 23, 25, 27, 29, 30, 33, 34, 35, 36, 37, 39, 40, 43, 46] },
    { id: 663, itemType: [1, 2, 4, 5, 10, 11, 12, 13, 14, 15, 17, 20, 21, 23, 25, 27, 29, 30, 33, 34, 35, 36, 37, 39, 40, 43, 46] },
    { id: 667, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 24, 29, 30, 33, 34, 36, 37, 39, 43, 46] },
    { id: 668, itemType: [1, 2, 4, 5, 10, 11, 12, 13, 14, 15, 17, 20, 21, 22, 23, 25, 27, 29, 30, 33, 34, 35, 36, 37, 39, 40, 43, 45, 46] },
    { id: 670, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 27, 29, 30, 33, 36, 37, 39, 43, 46] },
    { id: 690, itemType: [1, 2, 4, 10, 11, 12, 13, 14, 16, 17, 20, 21, 22, 23, 24, 25, 27, 29, 30, 33, 34, 35, 36, 37, 39, 40, 41, 43, 45, 46, 50] },
    { id: 699, itemType: [12, 13, 14, 15, 17, 20, 21, 23, 24, 27, 29, 30, 33, 34, 36, 37, 39, 43, 44, 50] },
    { id: 703, itemType: [1, 5, 12, 14, 15, 17, 20, 21, 23, 24, 29, 30, 33, 36, 37, 39, 43] },
    { id: 707, itemType: [4, 6, 7, 8, 9, 12, 13, 14, 16, 17, 20, 21, 23, 24, 25, 26, 27, 30, 34, 35, 36, 40, 43, 50] },
    { id: 713, itemType: [4, 6, 7, 8, 9, 12, 13, 14, 16, 17, 20, 21, 23, 25, 28, 34, 35, 36, 40, 43, 50, 56, 57, 58, 59, 94] },
    { id: 877, itemType: [3, 4, 5, 10, 12, 16, 17, 20, 21, 23, 28, 29, 33, 37, 39, 42, 43] },
    { id: 878, itemType: [3, 4, 10, 12, 13, 16, 17, 18, 19, 20, 21, 23, 28, 29, 33, 34, 36, 37, 39, 40, 42, 43, 93] },
    { id: 879, itemType: [3, 4, 5, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 23, 28, 29, 33, 34, 35, 36, 37, 39, 40, 42, 43, 45, 93] },
    { id: 885, itemType: [4, 6, 7, 8, 9, 12, 13, 14, 16, 17, 20, 21, 23, 25, 28, 34, 35, 36, 40, 43, 50, 94] },
  ];

  // 特定の艦娘が特定スロットに装備『できない！』やつ
  public static readonly FORBIDDEN_LINK_SHIP_ITEM = [
    // 伊勢改二 第3，4，5スロットに 主砲系
    {
      shipId: 553, index: [3, 4, 5], itemType: [2, 3], itemIDs: [0],
    },
    // 日向改二 第3，4，5スロットに 主砲系
    {
      shipId: 554, index: [3, 4, 5], itemType: [2, 3], itemIDs: [0],
    },
    // 夕張改二 4スロットに 主砲系 魚雷系 不可
    {
      shipId: 622, index: [4], itemType: [1, 2, 5], itemIDs: [0],
    },
    // 夕張改二特 4スロットに 主砲系 魚雷系 不可
    {
      shipId: 623, index: [4], itemType: [1, 2, 5, 22], itemIDs: [0],
    },
    // 夕張改二丁 4スロットに 主砲系 魚雷系 不可
    {
      shipId: 624, index: [4], itemType: [1, 2, 5], itemIDs: [0],
    },
    // 夕張改二 5スロットに いろいろ装備不可
    {
      shipId: 622, index: [5], itemType: [1, 2, 5, 14, 15, 17, 20, 22, 23, 24, 27, 29, 30, 33, 34, 36, 37, 39, 40, 46], itemIDs: [0],
    },
    // 夕張改二特 5スロットに いろいろ装備不可
    {
      shipId: 623, index: [5], itemType: [1, 2, 5, 14, 15, 17, 20, 22, 23, 24, 27, 29, 30, 33, 34, 36, 37, 39, 40, 46], itemIDs: [0],
    },
    // 夕張改二丁 5スロットに いろいろ装備不可
    {
      shipId: 624, index: [5], itemType: [1, 2, 5, 14, 15, 17, 20, 22, 23, 24, 27, 29, 30, 33, 34, 36, 37, 39, 40, 46], itemIDs: [0],
    },
    // 能代改二 4スロットに 魚雷系 不可
    {
      shipId: 662, index: [4], itemType: [5, 22], itemIDs: [0],
    },
    // 矢矧改二 4スロットに 魚雷系 不可
    {
      shipId: 663, index: [4], itemType: [5, 22], itemIDs: [0],
    },
    // 矢矧改二乙 4スロットに 魚雷系 不可
    {
      shipId: 668, index: [4], itemType: [5], itemIDs: [0],
    },
    // Richelieu改 全スロットに 瑞雲系
    {
      shipId: 392, index: [1, 2, 3, 4, 5], itemType: [0], itemIDs: [26, 62, 79, 80, 81, 207, 208, 237, 322, 323, 367, 368, 369],
    },
  ];

  /**
   * 艦種一覧 省略系と含む艦種
   * @static
   * @memberof Const
   */
  public static readonly SHIP_TYPES_ALT = [
    { text: '空母', types: [11, 18] },
    { text: '軽空母', types: [7] },
    { text: '戦艦級', types: [8, 9, 10] },
    { text: '重巡級', types: [5, 6] },
    { text: '軽巡級', types: [3, 4, 21] },
    { text: '駆逐', types: [2] },
    { text: '海防', types: [1] },
    { text: '潜水', types: [13, 14] },
    { text: 'その他', types: [15, 16, 17, 19, 20, 22] },
  ];

  public static readonly USA = [65, 69, 83, 84, 87, 91, 93, 95, 99, 102, 105, 106, 107, 110, 114];

  public static readonly ITA = [58, 61, 64, 68, 80, 92, 113];

  public static readonly GBR = [67, 78, 82, 88, 108, 112];

  public static readonly DEU = [47, 48, 55, 57, 63];

  public static readonly FRA = [70, 79];

  public static readonly RUS = [73, 81];

  public static readonly SWE = [89];

  public static readonly AUS = [96];

  public static readonly NLD = [98];

  /**
   * 日本艦かどうか判定
   * @static
   * @param {number} type
   * @returns {boolean}
   * @memberof Const
   */
  public static isJPN(type: number): boolean {
    let others = Const.USA.concat();
    others = others.concat(Const.ITA);
    others = others.concat(Const.GBR);
    others = others.concat(Const.DEU);
    others = others.concat(Const.FRA);
    others = others.concat(Const.RUS);
    others = others.concat(Const.SWE);
    others = others.concat(Const.AUS);
    others = others.concat(Const.NLD);
    return !others.includes(type);
  }

  /**
   * 陣形一覧
   * @static
   * @memberof Const
   */
  public static readonly FORMATIONS: Formation[] = [
    { text: '単縦陣', value: FORMATION.LINE_AHEAD, correction: 1.0 },
    { text: '複縦陣', value: FORMATION.DOUBLE_LINE, correction: 1.2 },
    { text: '輪形陣', value: FORMATION.DIAMOND, correction: 1.6 },
    { text: '梯形陣', value: FORMATION.ECHELON, correction: 1.0 },
    { text: '単横陣', value: FORMATION.LINE_ABREAST, correction: 1.0 },
    { text: '警戒陣', value: FORMATION.VANGUARD, correction: 1.1 },
    { text: '第一警戒', value: FORMATION.FORMATION1, correction: 1.1 },
    { text: '第二警戒', value: FORMATION.FORMATION2, correction: 1.0 },
    { text: '第三警戒', value: FORMATION.FORMATION3, correction: 1.5 },
    { text: '第四警戒', value: FORMATION.FORMATION4, correction: 1.0 },
  ];

  /**
   * 装備一覧 ちょっとまとめたやつ
   * @static
   * @memberof Const
   */
  public static readonly ITEM_TYPES_ALT = [
    { id: 1, text: '大口径主砲', types: [1] },
    { id: 2, text: '中口径主砲', types: [2] },
    { id: 3, text: '小口径主砲', types: [3] },
    { id: 6, text: '艦戦', types: [6] },
    { id: 7, text: '艦爆', types: [7] },
    { id: 8, text: '艦攻', types: [8] },
    { id: 9, text: '艦偵', types: [9] },
    { id: 57, text: '噴式機', types: [57] },
    { id: 5, text: '魚雷', types: [5, 22, 32] },
    { id: 10, text: '水上機', types: [10, 11] },
    { id: 45, text: '水戦', types: [45] },
    { id: 41, text: '大型飛行艇', types: [41] },
    { id: 12, text: '電探', types: [12, 13] },
    { id: 14, text: '対潜装備', types: [14, 15, 40] },
    { id: 4, text: '副砲', types: [4] },
    { id: 21, text: '機銃', types: [21] },
    { id: 24, text: '上陸用舟艇', types: [24, 30, 46] },
    { id: 17, text: 'その他', types: [17, 18, 19, 23, 25, 26, 27, 28, 29, 31, 33, 34, 35, 36, 37, 39, 42, 43, 44, 50, 51] },
    { id: 47, text: '陸攻', types: [47, 53] },
    { id: 48, text: '局戦', types: [48] },
    { id: 49, text: '陸偵', types: [49] },
  ]

  /**
   * 戦闘マス形式
   * @static
   * @memberof Const
   */
  public static readonly CELL_TYPES = [
    { text: '通常', value: CELL_TYPE.NORMAL },
    { text: '連合', value: CELL_TYPE.GRAND },
    { text: '空襲', value: CELL_TYPE.AIR_RAID },
    { text: '夜戦', value: CELL_TYPE.NIGHT },
    { text: '重爆', value: CELL_TYPE.HIGH_AIR_RAID },
    { text: '航空戦', value: CELL_TYPE.AERIAL_COMBAT },
  ];

  /**
   * 戦闘マス形式
   * @static
   * @memberof Const
   */
  public static readonly DIFFICULTY_LEVELS = [
    { text: '甲', value: DIFFICULTY_LEVEL.HARD },
    { text: '乙', value: DIFFICULTY_LEVEL.MEDIUM },
    { text: '丙', value: DIFFICULTY_LEVEL.EASY },
    { text: '丁', value: DIFFICULTY_LEVEL.CASUAL },
  ];

  /**
   * 艦載機熟練度ボーダー
   * @static
   * @memberof Const
   */
  public static readonly PROF_LEVEL_BORDER = [0, 10, 25, 40, 55, 70, 85, 100, 120];

  /**
   * 対空射撃回避 任意
   * @static
   * @memberof Const
   */
  public static readonly MANUAL_AVOID = 99;

  /**
   * 補強増設を識別するindex
   * @static
   * @memberof Const
   */
  public static readonly EXPAND_SLOT_INDEX = 99;

  /**
   * 対空射撃回避
   * @static
   * @memberof Const
   */
  public static readonly AVOID_TYPE: AvoidType[] = [
    {
      value: 0, text: 'なし', c1: 1.0, c2: 1.0,
    },
    {
      value: 1, text: '弱', c1: 0.6, c2: 1.0,
    },
    {
      value: 2, text: '中', c1: 0.6, c2: 0.7,
    },
    {
      value: 3, text: '強', c1: 0.5, c2: 0.7,
    },
    {
      value: 4, text: '超', c1: 0.5, c2: 0.5,
    },
    {
      value: Const.MANUAL_AVOID, text: '任意', c1: 1.0, c2: 1.0,
    },
  ];

  /**
   * 対空CI
   * @static
   * @memberof Const
   */
  public static readonly ANTIAIR_CUTIN = [
    {
      id: 0, text: '不発', adj: [1.0, 0], rate: 100, remarks: '',
    },
    {
      id: 1, text: '1種', adj: [1.7, 7], rate: 65, remarks: '秋月型',
    },
    {
      id: 2, text: '2種', adj: [1.7, 6], rate: 58, remarks: '秋月型',
    },
    {
      id: 3, text: '3種', adj: [1.6, 4], rate: 50, remarks: '秋月型',
    },
    {
      id: 4, text: '4種', adj: [1.5, 6], rate: 52, remarks: '戦艦',
    },
    {
      id: 5, text: '5種', adj: [1.5, 4], rate: 55, remarks: '汎用',
    },
    {
      id: 6, text: '6種', adj: [1.45, 4], rate: 40, remarks: '戦艦',
    },
    {
      id: 7, text: '7種', adj: [1.35, 3], rate: 45, remarks: '汎用',
    },
    {
      id: 8, text: '8種', adj: [1.4, 4], rate: 50, remarks: '汎用',
    },
    {
      id: 9, text: '9種', adj: [1.3, 2], rate: 40, remarks: '汎用',
    },
    {
      id: 10, text: '10種', adj: [1.65, 8], rate: 60, remarks: '摩耶改二',
    },
    {
      id: 11, text: '11種', adj: [1.5, 6], rate: 55, remarks: '摩耶改二',
    },
    {
      id: 12, text: '12種', adj: [1.25, 3], rate: 45, remarks: '汎用',
    },
    {
      id: 14, text: '14種', adj: [1.45, 4], rate: 63, remarks: '五十鈴改二',
    },
    {
      id: 15, text: '15種', adj: [1.3, 3], rate: 54, remarks: '五十鈴改二',
    },
    {
      id: 16, text: '16種', adj: [1.4, 4], rate: 62, remarks: '霞改二乙 / 夕張改二',
    },
    {
      id: 17, text: '17種', adj: [1.25, 2], rate: 57, remarks: '霞改二乙 / 夕張改二',
    },
    {
      id: 18, text: '18種', adj: [1.2, 2], rate: 59, remarks: '皐月改二',
    },
    {
      id: 19, text: '19種', adj: [1.45, 5], rate: 60, remarks: '鬼怒改二',
    },
    {
      id: 20, text: '20種', adj: [1.25, 3], rate: 65, remarks: '鬼怒改二',
    },
    {
      id: 21, text: '21種', adj: [1.45, 5], rate: 60, remarks: '由良改二',
    },
    {
      id: 22, text: '22種', adj: [1.2, 2], rate: 65, remarks: '文月改二',
    },
    {
      id: 23, text: '23種', adj: [1.05, 1], rate: 80, remarks: 'UIT-25 / 伊504',
    },
    {
      id: 24, text: '24種', adj: [1.25, 3], rate: 62, remarks: '天龍型改二',
    },
    {
      id: 25, text: '25種', adj: [1.55, 7], rate: 60, remarks: '伊勢型',
    },
    {
      id: 26, text: '26種', adj: [1.4, 6], rate: 60, remarks: '武蔵改二',
    },
    {
      id: 28, text: '28種', adj: [1.4, 4], rate: 56, remarks: '伊勢型 / 武蔵',
    },
    {
      id: 29, text: '29種', adj: [1.55, 5], rate: 60, remarks: '磯風乙改 / 浜風乙改',
    },
    {
      id: 30, text: '30種', adj: [1.3, 3], rate: 50, remarks: '天龍改二',
    },
    {
      id: 31, text: '31種', adj: [1.25, 2], rate: 50, remarks: '天龍改二',
    },
    {
      id: 32, text: '32種', adj: [1.2, 3], rate: 60, remarks: '金剛型改二 / 英艦',
    },
    {
      id: 33, text: '33種', adj: [1.35, 3], rate: 42, remarks: 'Gotland',
    },
    {
      id: 34, text: '34種', adj: [1.6, 7], rate: 60, remarks: 'Fletcher級',
    },
    {
      id: 35, text: '35種', adj: [1.55, 6], rate: 55, remarks: 'Fletcher級',
    },
    {
      id: 36, text: '36種', adj: [1.55, 6], rate: 50, remarks: 'Fletcher級',
    },
    {
      id: 37, text: '37種', adj: [1.45, 4], rate: 40, remarks: 'Fletcher級',
    },
    {
      id: 38, text: '38種', adj: [1.85, 10], rate: 60, remarks: 'Atlanta',
    },
    {
      id: 39, text: '39種', adj: [1.7, 10], rate: 60, remarks: 'Atlanta',
    },
    {
      id: 40, text: '40種', adj: [1.7, 10], rate: 60, remarks: 'Atlanta',
    },
    {
      id: 41, text: '41種', adj: [1.65, 9], rate: 60, remarks: 'Atlanta',
    },
  ];

  /**
   * 海域一覧
   * @static
   * @memberof Const
   */
  public static readonly WORLDS = [
    { value: 1, text: '鎮守府海域' },
    { value: 2, text: '南西諸島海域' },
    { value: 3, text: '北方海域' },
    { value: 7, text: '南西海域' },
    { value: 4, text: '西方海域' },
    { value: 5, text: '南方海域' },
    { value: 6, text: '中部海域' },
    { value: 45, text: '欧州方面反撃作戦 発動!「シングル作戦」(2019夏イベ)' },
    { value: 46, text: '進撃！第二次作戦「南方作戦」(2019秋イベ)' },
    { value: 47, text: '桃の節句！沖に立つ波(ミニ期間限定海域)' },
    { value: 48, text: '侵攻阻止！島嶼防衛強化作戦(2020梅雨イベ)' },
    { value: 49, text: '護衛せよ！船団輸送作戦(2020秋イベ)' },
    { value: 50, text: '激突！ルンガ沖夜戦(2021春イベ)' },
    { value: 51, text: '増援輸送作戦！地中海の戦い(2021夏イベ)' },
    { value: 52, text: '海上護衛！本土近海航路の防衛(2021秋イベ)' },
  ];

  public static readonly MAPS = [
    { value: 11, text: '鎮守府正面海域' },
    { value: 12, text: '南西諸島沖' },
    { value: 13, text: '製油所地帯沿岸' },
    { value: 14, text: '南西諸島防衛線' },
    { value: 15, text: '鎮守府近海' },
    { value: 16, text: '鎮守府近海航路' },
    { value: 21, text: '南西諸島近海' },
    { value: 22, text: 'バシー海峡' },
    { value: 23, text: '東部オリョール海' },
    { value: 24, text: '沖ノ島海域' },
    { value: 25, text: '沖ノ島沖' },
    { value: 31, text: 'モーレイ海' },
    { value: 32, text: 'キス島沖' },
    { value: 33, text: 'アルフォンシーノ方面' },
    { value: 34, text: '北方海域全域' },
    { value: 35, text: '北方AL海域' },
    { value: 41, text: 'ジャム島沖' },
    { value: 42, text: 'カレー洋海域' },
    { value: 43, text: 'リランカ島' },
    { value: 44, text: 'カスガダマ島' },
    { value: 45, text: 'カレー洋リランカ島沖' },
    { value: 51, text: '南方海域前面' },
    { value: 52, text: '珊瑚諸島沖' },
    { value: 53, text: 'サブ島沖海域' },
    { value: 54, text: 'サーモン海域' },
    { value: 55, text: 'サーモン海域北方' },
    { value: 61, text: '中部海域哨戒線' },
    { value: 62, text: 'MS諸島沖' },
    { value: 63, text: 'グアノ環礁沖海域' },
    { value: 64, text: '中部北海域ピーコック島沖' },
    { value: 65, text: 'KW環礁沖海域' },
    { value: 71, text: 'ブルネイ泊地沖' },
    { value: 72, text: 'タウイタウイ泊地沖' },
    { value: 73, text: 'ペナン島沖' },
    { value: 74, text: '昭南本土航路' },
    { value: 461, text: 'マカッサル沖/バリ島沖' },
    { value: 462, text: 'ジャワ沖/ダーウィン沖' },
    { value: 463, text: 'ジャワ海/スラバヤ沖' },
    { value: 464, text: 'バタビア沖' },
    { value: 465, text: 'ダバオ沖/太平洋南西部' },
    { value: 466, text: 'ソロモン諸島沖' },
    { value: 471, text: '期間限定海域:マニラ沖' },
    { value: 481, text: 'オホーツク海千島列島沖' },
    { value: 482, text: '南西諸島沖' },
    { value: 483, text: '四国沖/九州西方五島列島沖' },
    { value: 484, text: '小笠原諸島沖' },
    { value: 485, text: 'ニューブリテン島沖/ソロモン諸島西部沖' },
    { value: 486, text: 'ソロモン諸島沖' },
    { value: 487, text: 'ソロモン諸島沖/サンタ・クルーズ諸島沖' },
    { value: 491, text: '地中海マルタ島沖' },
    { value: 492, text: 'バレンツ海' },
    { value: 493, text: 'ノルウェー北岬沖/北極海' },
    { value: 494, text: 'ルソン島沖/オルモック沖' },
    { value: 501, text: '台湾/南沙諸島/比島方面沖' },
    { value: 502, text: 'ソロモン方面/レンネル島沖' },
    { value: 503, text: 'タサファロング泊地沖' },
    { value: 504, text: 'ラバウル沖/ビスマルク諸島沖/ソロモン諸島沖' },
    { value: 505, text: 'アイアンボトムサウンド' },
    { value: 511, text: 'アレクサンドリア沖/クレタ島沖' },
    { value: 512, text: '地中海/マルタ島沖/ティレニア海' },
    { value: 513, text: 'ジブラルタル沖/地中海/マルタ島沖' },
    { value: 521, text: '三陸沖/北海道根室半島沖' },
    { value: 522, text: '昭南方面～本土航路' },
    { value: 523, text: '八丈島沖/房総半島東方沖' },
  ];
}
