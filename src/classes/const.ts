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
  c3: number;
  c4: number;
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

export const FLEET_TYPE = {
  SINGLE: 0,
  CTF: 1,
  STF: 2,
  TCF: 3,
} as const;
type FLEET_TYPE = typeof FLEET_TYPE[keyof typeof FLEET_TYPE];

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
  DEFENSE: 2,
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
  SUPER_HIGH_AIR_RAID: 7,
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

/** 火力キャップ */
export const CAP = {
  AS: 170,
  BATTLE: 220,
  SUPPORT: 170,
  NIGHT: 360,
} as const;
type CAP = typeof CAP[keyof typeof CAP];

/** 難易度 */
export const SUPPORT_TYPE = {
  SHELLING: 0,
  AIRSTRIKE: 1,
  ANTI_SUBMARINE: 2,
  LONG_RANGE_TORPEDO: 3,
  NOT_FOUND_DD: 4,
  NONE: 5,
} as const;
type SUPPORT_TYPE = typeof SUPPORT_TYPE[keyof typeof SUPPORT_TYPE];

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
    { text: '防空', value: AB_MODE.DEFENSE },
    { text: '待機', value: AB_MODE.WAIT },
  ];

  public static readonly PLANE_TYPES = [6, 7, 8, 9, 10, 11, 41, 45, 47, 48, 49, 53, 57];

  public static readonly CB_PLANE_TYPES = [6, 7, 8, 9, 57];

  public static readonly SP_PLANE_TYPES = [10, 11, 41, 45];

  public static readonly AB_PLANE_TYPES = [47, 48, 49, 53];

  public static readonly FIGHTERS = [6, 45, 48];

  public static readonly ATTACKERS = [7, 8, 11, 47, 53, 57];

  public static readonly RECONNAISSANCES = [9, 10, 41, 49];

  public static readonly AB_ATTACKERS = [47, 53];

  public static readonly AB_ATTACKERS_LARGE = [53];

  public static readonly ROCKET = [350, 351, 352];

  public static readonly BAKUSEN = [60, 154, 219, 447];

  public static readonly ENABLED_LAND_BASE_ATTACK = [64, 148, 233, 277, 305, 306, 319, 320, 391, 392, 420, 421, 474];

  public static readonly ENABLED_ASW_SUPPORT = [7, 8, 10, 11, 45, 41, 25, 26];

  public static readonly STRICT_DEPTH_CHARGE = [226, 227, 378, 439];

  public static readonly SPECIAL_GROUP: { key: string, text: string, items: number[] }[] = [
    // { key: '55-3', text: 'A2', items: [459, 242, 256, 257, 233, 277, 197, 198, 205, 206, 254] },
    // { key: '55-3', text: 'A3', items: [431, 432, 243, 188, 316, 248, 64, 305, 306, 422] },
    // { key: '55-3', text: 'A4', items: [405, 433, 244, 424, 425] },
    // { key: '55-3', text: 'B1', items: [178, 354] },
    // { key: '55-3', text: 'B2', items: [158, 159, 353] },
    // { key: '55-3', text: 'B3', items: [249, 184] },
    // { key: '55-3', text: 'B4', items: [189] },
    // { key: '55-3', text: 'C1', items: [250, 251, 253] },
    // { key: '55-3', text: 'C3', items: [473, 474] },
    // { key: '55-3', text: 'C4', items: [252, 434, 435, 423, 479] },

    // { key: '55-6', text: 'A2', items: [459, 242, 256, 257, 233, 277, 197, 198, 205, 206, 254, 255, 375, 389, 195, 419, 420] },
    // { key: '55-6', text: 'A3', items: [431, 432, 243, 188, 316, 248, 64, 305, 306, 422] },
    // { key: '55-6', text: 'A4', items: [405, 433, 244, 424, 425] },
    // { key: '55-6', text: 'B1', items: [178] },
    // { key: '55-6', text: 'B2', items: [158, 159, 353, 354] },
    // { key: '55-6', text: 'B3', items: [249, 184] },
    // { key: '55-6', text: 'B4', items: [189, 406] },
    // { key: '55-6', text: 'C1', items: [250, 251, 253] },
    // { key: '55-6', text: 'C3', items: [473, 474, 475] },
    // { key: '55-6', text: 'C4', items: [252, 434, 435, 423, 476, 479, 480, 481] },

    // { key: 'Saury', text: 'Saury', items: [44, 45, 47, 69, 70, 74, 129, 138, 140, 178, 242, 243, 244, 258, 259, 260, 261, 262, 412, 438, 25, 59, 102, 115, 118, 163, 171, 238, 239, 304, 370, 371, 414, 415, 469, 471, 26, 62, 79, 80, 81, 194, 207, 208, 237, 322, 323, 367, 368, 369] },
  ];

  public static readonly ITEM_API_TYPE = [
    { id: 6, name: '艦上戦闘機', sortKey: ['antiAir', 'avoid', 'accuracy', 'scout', 'radius', 'cost'] },
    { id: 7, name: '艦上爆撃機', sortKey: ['bomber', 'antiAir', 'accuracy', 'asw', 'avoid', 'scout', 'radius', 'avoidId', 'cost'] },
    { id: 8, name: '艦上攻撃機', sortKey: ['torpedo', 'antiAir', 'accuracy', 'asw', 'avoid', 'scout', 'radius', 'avoidId', 'cost'] },
    { id: 9, name: '艦上偵察機', sortKey: ['scout', 'accuracy', 'avoid', 'antiAir', 'radius', 'avoidId', 'cost'] },
    { id: 57, name: '噴式戦闘爆撃機', sortKey: ['bomber', 'antiAir', 'accuracy', 'avoid', 'scout', 'radius', 'avoidId', 'cost'] },
    { id: 10, name: '水上偵察機', sortKey: ['scout', 'accuracy', 'avoid', 'antiAir', 'radius', 'avoidId', 'cost'] },
    { id: 11, name: '水上爆撃機', sortKey: ['bomber', 'antiAir', 'accuracy', 'avoid', 'scout', 'radius', 'avoidId', 'cost'] },
    { id: 45, name: '水上戦闘機', sortKey: ['antiAir', 'avoid', 'accuracy', 'scout', 'radius', 'cost'] },
    { id: 41, name: '大型飛行艇', sortKey: ['scout', 'accuracy', 'avoid', 'antiAir', 'radius', 'avoidId', 'cost'] },
    { id: 47, name: '陸上攻撃機', sortKey: ['torpedo', 'bomber', 'antiAir', 'asw', 'accuracy', 'avoid', 'scout', 'radius', 'avoidId', 'cost'] },
    { id: 53, name: '大型陸上機', sortKey: ['torpedo', 'bomber', 'antiAir', 'accuracy', 'avoid', 'scout', 'radius', 'avoidId', 'cost'] },
    { id: 48, name: '局地/陸軍戦闘機', sortKey: ['antiAir', 'antiBomber', 'interception', 'radius', 'cost'] },
    { id: 49, name: '陸上偵察機', sortKey: ['scout', 'accuracy', 'avoid', 'antiAir', 'radius', 'avoidId', 'cost'] },
    { id: 1, name: '小口径主砲', sortKey: ['fire', 'accuracy', 'antiAir', 'armor', 'range'] },
    { id: 2, name: '中口径主砲', sortKey: ['fire', 'accuracy', 'antiAir', 'armor', 'range'] },
    { id: 3, name: '大口径主砲', sortKey: ['fire', 'accuracy', 'antiAir', 'armor', 'range'] },
    { id: 4, name: '副砲', sortKey: ['fire', 'accuracy', 'antiAir', 'armor', 'range'] },
    { id: 5, name: '魚雷', sortKey: ['torpedo', 'accuracy', 'armor'] },
    { id: 12, name: '小型電探', sortKey: ['antiAir', 'accuracy', 'scout', 'fire', 'armor'] },
    { id: 13, name: '大型電探', sortKey: ['antiAir', 'accuracy', 'scout', 'fire', 'armor'] },
    { id: 14, name: 'ソナー', sortKey: ['asw', 'accuracy', 'scout'] },
    { id: 15, name: '爆雷', sortKey: ['asw', 'accuracy'] },
    { id: 17, name: '機関部強化' },
    { id: 18, name: '対空強化弾' },
    { id: 19, name: '対艦強化弾' },
    { id: 21, name: '対空機銃', sortKey: ['antiAir', 'accuracy', 'fire', 'armor', 'avoid'] },
    { id: 22, name: '特殊潜航艇', sortKey: ['torpedo', 'accuracy', 'avoid', 'scout'] },
    { id: 23, name: '応急修理要員' },
    { id: 24, name: '上陸用舟艇', sortKey: ['fire', 'antiAir', 'armor', 'avoid', 'scout', 'tp'] },
    { id: 25, name: '回転翼機' },
    { id: 26, name: '対潜哨戒機' },
    { id: 27, name: '追加装甲(中型)' },
    { id: 28, name: '追加装甲(大型)' },
    { id: 29, name: '探照灯' },
    { id: 30, name: '簡易輸送部材' },
    { id: 31, name: '艦艇修理施設' },
    { id: 32, name: '潜水艦魚雷', sortKey: ['torpedo', 'accuracy', 'avoid'] },
    { id: 33, name: '照明弾' },
    { id: 34, name: '司令部施設' },
    { id: 35, name: '航空要員' },
    { id: 36, name: '高射装置' },
    { id: 37, name: '対地装備' },
    { id: 39, name: '水上艦要員' },
    { id: 40, name: '大型ソナー' },
    { id: 42, name: '大型探照灯' },
    { id: 43, name: '戦闘糧食' },
    { id: 44, name: '補給物資' },
    { id: 46, name: '特型内火艇' },
    { id: 50, name: '輸送機材' },
    { id: 51, name: '潜水艦装備' },
  ];

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
    { id: SHIP_TYPE.AO_2, name: '補給艦', itemType: [0] },
    { id: SHIP_TYPE.AV, name: '水上機母艦', itemType: [1, 4, 10, 11, 12, 13, 15, 17, 21, 22, 23, 24, 27, 29, 30, 33, 34, 36, 37, 39, 40, 43, 45, 46, 50] },
    { id: SHIP_TYPE.LHA, name: '揚陸艦', itemType: [1, 4, 12, 15, 17, 21, 23, 24, 25, 26, 30, 34, 36, 37, 40, 43, 46, 50] },
    { id: SHIP_TYPE.CVB, name: '装甲空母', itemType: [4, 6, 7, 8, 9, 12, 13, 17, 21, 23, 28, 34, 35, 36, 40, 43, 50] },
    { id: SHIP_TYPE.AR, name: '工作艦', itemType: [1, 4, 12, 17, 21, 23, 25, 27, 31, 33, 36, 43, 50] },
    { id: SHIP_TYPE.AS, name: '潜水母艦', itemType: [1, 4, 10, 12, 17, 21, 23, 25, 27, 33, 34, 36, 37, 39, 40, 43, 45] },
    { id: SHIP_TYPE.CT, name: '練習巡洋艦', itemType: [1, 2, 4, 5, 10, 12, 13, 14, 15, 17, 21, 23, 27, 34, 36, 39, 43] },
    { id: SHIP_TYPE.AO, name: '補給艦', itemType: [1, 10, 11, 12, 17, 21, 23, 25, 30, 35, 36, 43, 44, 45] },
  ];

  public static readonly SHIP_TYPES_ALT_INFO = [
    { id: 6, name: '金剛型' },
    { id: 26, name: '扶桑型' },
    { id: 2, name: '伊勢型' },
    { id: 19, name: '長門型' },
    { id: 37, name: '大和型' },
    { id: 14, name: '赤城型' },
    { id: 3, name: '加賀型' },
    { id: 17, name: '蒼龍型' },
    { id: 25, name: '飛龍型' },
    { id: 33, name: '翔鶴型' },
    { id: 53, name: '雲龍型' },
    { id: 43, name: '大鳳型' },
    { id: 27, name: '鳳翔型' },
    { id: 32, name: '龍驤型' },
    { id: 51, name: '龍鳳型' },
    { id: 11, name: '祥鳳型' },
    { id: 24, name: '飛鷹型' },
    { id: 15, name: '千歳型' },
    { id: 76, name: '大鷹型' },
    { id: 75, name: '春日丸級' },
    { id: 72, name: '神威型' },
    { id: 62, name: '瑞穂型' },
    { id: 90, name: '日進型' },
    { id: 59, name: '秋津洲型' },
    { id: 100, name: '迅鯨型' },
    { id: 50, name: '大鯨型' },
    { id: 60, name: '改風早型' },
    { id: 49, name: '工作艦' },
    { id: 111, name: '耐氷型雑用輸送艦' },
    { id: 7, name: '古鷹型' },
    { id: 13, name: '青葉型' },
    { id: 29, name: '妙高型' },
    { id: 8, name: '高雄型' },
    { id: 9, name: '最上型' },
    { id: 31, name: '利根型' },
    { id: 21, name: '天龍型' },
    { id: 4, name: '球磨型' },
    { id: 20, name: '長良型' },
    { id: 16, name: '川内型' },
    { id: 34, name: '夕張型' },
    { id: 41, name: '阿賀野型' },
    { id: 52, name: '大淀型' },
    { id: 56, name: '香取型' },
    { id: 66, name: '神風型' },
    { id: 28, name: '睦月型' },
    { id: 12, name: '吹雪型' },
    { id: 1, name: '綾波型' },
    { id: 5, name: '暁型' },
    { id: 10, name: '初春型' },
    { id: 23, name: '白露型' },
    { id: 18, name: '朝潮型' },
    { id: 30, name: '陽炎型' },
    { id: 38, name: '夕雲型' },
    { id: 54, name: '秋月型' },
    { id: 22, name: '島風型' },
    { id: 101, name: '松型' },
    { id: 74, name: '占守型' },
    { id: 77, name: '択捉型' },
    { id: 94, name: '御蔵型' },
    { id: 85, name: '日振型' },
    { id: 104, name: '丁型海防艦' },
    { id: 117, name: '鵜来型' },
    { id: 71, name: '巡潜甲型改二' },
    { id: 44, name: '潜特型(伊400型潜水艦)' },
    { id: 35, name: '海大VI型' },
    { id: 40, name: '巡潜3型' },
    { id: 39, name: '巡潜乙型' },
    { id: 103, name: '巡潜丙型' },
    { id: 36, name: '巡潜乙型改二' },
    { id: 109, name: '潜高型' },
    { id: 80, name: 'Guglielmo Marconi級' },
    { id: 57, name: 'UボートIXC型' },
    { id: 86, name: '呂号潜水艦' },
    { id: 46, name: '三式潜航輸送艇' },
    { id: 97, name: '陸軍特種船(R1)' },
    { id: 45, name: '特種船丙型' },
    { id: 115, name: '特2TL型' },

    { id: 47, name: 'Bismarck級' },
    { id: 55, name: 'Admiral Hipper級' },
    { id: 63, name: 'Graf Zeppelin級' },
    { id: 48, name: 'Z1型' },

    { id: 58, name: 'V.Veneto級' },
    { id: 68, name: 'Aquila級' },
    { id: 64, name: 'Zara級' },
    { id: 92, name: 'L.d.S.D.d.Abruzzi級' },
    { id: 61, name: 'Maestrale級' },
    { id: 113, name: 'Conte di Cavour級' },

    { id: 93, name: 'Colorado級' },
    { id: 107, name: 'North Carolina級' },
    { id: 102, name: 'South Dakota級' },
    { id: 65, name: 'Iowa級' },
    { id: 69, name: 'Lexington級' },
    { id: 105, name: 'Yorktown級' },
    { id: 84, name: 'Essex級' },
    { id: 83, name: 'Casablanca級' },
    { id: 95, name: 'Northampton級' },
    { id: 110, name: 'Brooklyn級' },
    { id: 106, name: 'St.Louis級' },
    { id: 99, name: 'Atlanta級' },
    { id: 91, name: 'Fletcher級' },
    { id: 87, name: 'John C.Butler級' },
    { id: 114, name: 'Gato級' },
    { id: 116, name: 'Independence級' },
    { id: 118, name: 'Ranger級' },

    { id: 67, name: 'Queen Elizabeth級' },
    { id: 88, name: 'Nelson級' },
    { id: 78, name: 'Ark Royal級' },
    { id: 112, name: 'Illustrious級' },
    { id: 108, name: 'Town級' },
    { id: 82, name: 'J級' },

    { id: 79, name: 'Richelieu級' },
    { id: 70, name: 'C.Teste級' },

    { id: 73, name: 'Гангут級' },
    { id: 81, name: 'Ташкент級' },

    { id: 89, name: 'Gotland級' },

    { id: 98, name: 'De Ruyter級' },

    { id: 96, name: 'Perth級' },

    { id: 42, name: '(霧の艦隊?)' },
  ];

  /**
   * 補強増設に搭載可能
   * @static
   * @memberof Const
   */
  public static readonly EXPANDED_ITEM_TYPE = [17, 21, 23, 27, 28, 36, 39, 43, 44, 51];

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
    // Jean Bart改 全スロットに 瑞雲系
    {
      shipId: 724, index: [1, 2, 3, 4, 5], itemType: [0], itemIDs: [26, 62, 79, 80, 81, 207, 208, 237, 322, 323, 367, 368, 369],
    },
  ];

  /**
   * 艦種一覧 省略系と含む艦種
   * @static
   * @memberof Const
   */
  public static readonly SHIP_TYPES_ALT = [
    { text: '空母', types: [11, 18] },
    { text: '軽母', types: [7] },
    { text: '戦艦', types: [8, 9] },
    { text: '航戦', types: [10] },
    { text: '重巡', types: [5] },
    { text: '航巡', types: [6] },
    { text: '軽巡', types: [3, 4, 21] },
    { text: '駆逐', types: [2] },
    { text: '海防', types: [1] },
    { text: '潜水', types: [13, 14] },
    { text: 'その他', types: [15, 16, 17, 19, 20, 22] },
  ];

  /**
   * 艦種一覧 省略系と含む艦種 艦隊分析用
   * @static
   * @memberof Const
   */
  public static readonly SHIP_TYPES_ALT2 = [
    { text: '正規空母', types: [11, 18] },
    { text: '軽空母', types: [7] },
    { text: '戦艦級', types: [8, 9, 10] },
    { text: '重巡級', types: [5, 6] },
    { text: '軽巡級', types: [3, 4, 21] },
    { text: '駆逐艦', types: [2] },
    { text: '海防艦', types: [1] },
    { text: '潜水艦', types: [13, 14] },
    { text: '補助艦艇', types: [15, 16, 17, 19, 20, 22] },
  ];

  public static readonly USA = [65, 69, 83, 84, 87, 91, 93, 95, 99, 102, 105, 106, 107, 110, 114, 116, 118];

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
 * 支援一覧
 * @static
 * @memberof Const
 */
  public static readonly SUPPORTS = [
    { text: '支援射撃', value: SUPPORT_TYPE.SHELLING },
    { text: '航空支援', value: SUPPORT_TYPE.AIRSTRIKE },
    { text: '対潜支援哨戒', value: SUPPORT_TYPE.ANTI_SUBMARINE },
    { text: '支援長距離雷撃', value: SUPPORT_TYPE.LONG_RANGE_TORPEDO },
    { text: '支援不可(要駆逐2)', value: SUPPORT_TYPE.NOT_FOUND_DD },
    { text: '不発', value: SUPPORT_TYPE.NONE },
  ];

  /**
   * 装備一覧 ちょっとまとめたやつと、装備一覧表示のステータス
   * @static
   * @memberof Const
   */
  public static readonly ITEM_TYPES_ALT = [
    {
      id: 1, text: '小口径主砲', viewStatus: ['actualFire', 'antiAir', 'actualAccuracy', 'armor', 'antiAirWeight', 'antiAirBonus'], types: [1],
    },
    {
      id: 2, text: '中口径主砲', viewStatus: ['actualFire', 'antiAir', 'actualAccuracy', 'armor', 'antiAirWeight', 'antiAirBonus'], types: [2],
    },
    {
      id: 3, text: '大口径主砲', viewStatus: ['actualFire', 'antiAir', 'actualAccuracy', 'armor', 'antiAirWeight', 'antiAirBonus'], types: [3],
    },
    {
      id: 5, text: '魚雷', viewStatus: ['actualTorpedo', 'actualFire', 'actualAccuracy', 'avoid', 'armor'], types: [5, 22, 32],
    },
    {
      id: 6, text: '艦戦', viewStatus: ['antiAir', 'actualAntiAir', 'actualAccuracy', 'avoid', 'airPower', 'radius'], types: [6],
    },
    {
      id: 7, text: '艦爆', viewStatus: ['actualBomber', 'actualAntiAir', 'actualAccuracy', 'actualAsw', 'avoidId', 'radius'], types: [7],
    },
    {
      id: 8, text: '艦攻', viewStatus: ['actualTorpedo', 'actualAntiAir', 'actualAccuracy', 'asw', 'avoidId', 'radius'], types: [8],
    },
    {
      id: 9, text: '艦偵', viewStatus: ['actualScout', 'actualFire', 'actualAccuracy', 'actualAntiAir', 'radius', 'cost'], types: [9],
    },
    {
      id: 57, text: '噴式機', viewStatus: ['actualBomber', 'actualAccuracy', 'actualAntiAir', 'avoidId', 'airPower', 'cost'], types: [57],
    },
    {
      id: 10, text: '水偵', viewStatus: ['actualScout', 'actualFire', 'actualAccuracy', 'actualAsw', 'radius', 'cost'], types: [10],
    },
    {
      id: 1100, text: '水爆', viewStatus: ['actualBomber', 'actualAntiAir', 'actualAccuracy', 'actualAsw', 'radius', 'avoidId'], types: [11],
    },
    {
      id: 45, text: '水戦', viewStatus: ['antiAir', 'actualAntiAir', 'actualScout', 'actualAccuracy', 'radius', 'airPower'], types: [45],
    },
    {
      id: 41, text: '大型飛行艇', viewStatus: ['actualScout', 'actualAccuracy', 'actualAsw', 'radius', 'cost'], types: [41],
    },
    {
      id: 12, text: '電探', viewStatus: ['actualFire', 'antiAir', 'actualAccuracy', 'actualScout', 'antiAirWeight', 'antiAirBonus'], types: [12, 13],
    },
    {
      id: 14, text: '対潜装備', viewStatus: ['actualAsw', 'actualAccuracy', 'armor', 'avoid', 'actualScout'], types: [14, 15, 40],
    },
    {
      id: 4, text: '副砲', viewStatus: ['actualFire', 'antiAir', 'actualAccuracy', 'armor', 'antiAirWeight', 'antiAirBonus'], types: [4],
    },
    {
      id: 21, text: '機銃', viewStatus: ['actualFire', 'antiAir', 'actualAccuracy', 'antiAirWeight', 'antiAirBonus'], types: [21],
    },
    {
      id: 24, text: '上陸用舟艇', viewStatus: ['actualFire', 'antiAir', 'actualScout', 'avoid', 'armor', 'tp'], types: [24, 30, 46],
    },
    {
      id: 47, text: '陸攻', viewStatus: ['actualTorpedo', 'actualBomber', 'actualAntiAir', 'radius', 'avoidId', 'cost'], types: [47, 53],
    },
    {
      id: 48, text: '局戦', viewStatus: ['antiBomber', 'actualAntiAir', 'radius', 'actualDefenseAntiAir', 'airPower', 'defenseAirPower'], types: [48],
    },
    {
      id: 49, text: '陸偵', viewStatus: ['actualAntiAir', 'actualScout', 'actualAccuracy', 'radius', 'armor', 'cost'], types: [49],
    },
    {
      id: 17, text: 'その他', viewStatus: ['actualFire', 'antiAir', 'actualAccuracy', 'actualScout', 'asw', 'armor'], types: [17, 18, 19, 23, 25, 26, 27, 28, 29, 31, 33, 34, 35, 36, 37, 39, 42, 43, 44, 50, 51],
    },
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
    { text: '超重爆', value: CELL_TYPE.SUPER_HIGH_AIR_RAID },
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
      value: 0, text: 'なし', c1: 1, c2: 1, c3: 1, c4: 1,
    },
    {
      value: 1, text: '弱', c1: 0.6, c2: 1, c3: 1, c4: 1,
    },
    {
      value: 2, text: '中', c1: 0.6, c2: 0.7, c3: 1, c4: 1,
    },
    {
      value: 3, text: '強', c1: 0.5, c2: 0.7, c3: 1, c4: 1,
    },
    {
      value: 4, text: '超', c1: 0.5, c2: 0.5, c3: 1, c4: 1,
    },
    {
      value: Const.MANUAL_AVOID, text: '任意', c1: 1, c2: 1, c3: 1, c4: 1,
    },
  ];

  /**
   * 対空CI
   * @static
   * @memberof Const
   */
  public static readonly ANTI_AIR_CUTIN = [
    {
      id: 0, text: '不発', rateBonus: 1, c1: 1, c2: 0, rate: 100, remarks: '',
    },
    {
      id: 1, text: '1種', rateBonus: 1.7, c1: 3, c2: 5, rate: 65, remarks: '秋月型',
    },
    {
      id: 2, text: '2種', rateBonus: 1.7, c1: 3, c2: 4, rate: 58, remarks: '秋月型',
    },
    {
      id: 3, text: '3種', rateBonus: 1.6, c1: 2, c2: 3, rate: 50, remarks: '秋月型',
    },
    {
      id: 4, text: '4種', rateBonus: 1.5, c1: 5, c2: 2, rate: 52, remarks: '戦艦',
    },
    {
      id: 5, text: '5種', rateBonus: 1.5, c1: 2, c2: 3, rate: 55, remarks: '汎用',
    },
    {
      id: 6, text: '6種', rateBonus: 1.45, c1: 4, c2: 1, rate: 40, remarks: '戦艦',
    },
    {
      id: 7, text: '7種', rateBonus: 1.35, c1: 2, c2: 2, rate: 45, remarks: '汎用',
    },
    {
      id: 8, text: '8種', rateBonus: 1.4, c1: 2, c2: 3, rate: 50, remarks: '汎用',
    },
    {
      id: 9, text: '9種', rateBonus: 1.3, c1: 1, c2: 2, rate: 40, remarks: '汎用',
    },
    {
      id: 10, text: '10種', rateBonus: 1.65, c1: 3, c2: 6, rate: 60, remarks: '摩耶改二',
    },
    {
      id: 11, text: '11種', rateBonus: 1.5, c1: 2, c2: 5, rate: 55, remarks: '摩耶改二',
    },
    {
      id: 12, text: '12種', rateBonus: 1.25, c1: 1, c2: 3, rate: 45, remarks: '汎用',
    },
    {
      id: 14, text: '14種', rateBonus: 1.45, c1: 4, c2: 1, rate: 63, remarks: '五十鈴改二',
    },
    {
      id: 15, text: '15種', rateBonus: 1.3, c1: 3, c2: 1, rate: 54, remarks: '五十鈴改二',
    },
    {
      id: 16, text: '16種', rateBonus: 1.4, c1: 4, c2: 1, rate: 62, remarks: '霞改二乙 / 夕張改二',
    },
    {
      id: 17, text: '17種', rateBonus: 1.25, c1: 2, c2: 1, rate: 57, remarks: '霞改二乙 / 夕張改二',
    },
    {
      id: 18, text: '18種', rateBonus: 1.2, c1: 2, c2: 1, rate: 59, remarks: '皐月改二',
    },
    {
      id: 19, text: '19種', rateBonus: 1.45, c1: 5, c2: 1, rate: 60, remarks: '鬼怒改二',
    },
    {
      id: 20, text: '20種', rateBonus: 1.25, c1: 3, c2: 1, rate: 65, remarks: '鬼怒改二',
    },
    {
      id: 21, text: '21種', rateBonus: 1.45, c1: 5, c2: 1, rate: 60, remarks: '由良改二',
    },
    {
      id: 22, text: '22種', rateBonus: 1.2, c1: 2, c2: 1, rate: 65, remarks: '文月改二',
    },
    {
      id: 23, text: '23種', rateBonus: 1.05, c1: 1, c2: 1, rate: 80, remarks: 'UIT-25 / 伊504',
    },
    {
      id: 24, text: '24種', rateBonus: 1.25, c1: 3, c2: 1, rate: 62, remarks: '天龍型改二',
    },
    {
      id: 25, text: '25種', rateBonus: 1.55, c1: 7, c2: 1, rate: 60, remarks: '伊勢型',
    },
    {
      id: 26, text: '26種', rateBonus: 1.4, c1: 6, c2: 1, rate: 60, remarks: '武蔵改二',
    },
    {
      id: 27, text: '27種', rateBonus: 1.55, c1: 5, c2: 1, rate: 55, remarks: '大淀',
    },
    {
      id: 28, text: '28種', rateBonus: 1.4, c1: 4, c2: 1, rate: 56, remarks: '伊勢型 / 武蔵',
    },
    {
      id: 29, text: '29種', rateBonus: 1.55, c1: 5, c2: 1, rate: 60, remarks: '磯風乙改 / 浜風乙改',
    },
    {
      id: 30, text: '30種', rateBonus: 1.3, c1: 3, c2: 1, rate: 50, remarks: '天龍改二',
    },
    {
      id: 31, text: '31種', rateBonus: 1.25, c1: 2, c2: 1, rate: 50, remarks: '天龍改二',
    },
    {
      id: 32, text: '32種', rateBonus: 1.2, c1: 3, c2: 1, rate: 60, remarks: '金剛型改二 / 英艦',
    },
    {
      id: 33, text: '33種', rateBonus: 1.35, c1: 3, c2: 1, rate: 42, remarks: 'Gotland',
    },
    {
      id: 34, text: '34種', rateBonus: 1.6, c1: 7, c2: 1, rate: 60, remarks: 'Fletcher級',
    },
    {
      id: 35, text: '35種', rateBonus: 1.55, c1: 6, c2: 1, rate: 55, remarks: 'Fletcher級',
    },
    {
      id: 36, text: '36種', rateBonus: 1.55, c1: 6, c2: 1, rate: 50, remarks: 'Fletcher級',
    },
    {
      id: 37, text: '37種', rateBonus: 1.45, c1: 2, c2: 3, rate: 40, remarks: 'Fletcher級',
    },
    {
      id: 38, text: '38種', rateBonus: 1.85, c1: 6, c2: 5, rate: 60, remarks: 'Atlanta',
    },
    {
      id: 39, text: '39種', rateBonus: 1.7, c1: 6, c2: 5, rate: 60, remarks: 'Atlanta',
    },
    {
      id: 40, text: '40種', rateBonus: 1.7, c1: 6, c2: 5, rate: 60, remarks: 'Atlanta',
    },
    {
      id: 41, text: '41種', rateBonus: 1.65, c1: 5, c2: 5, rate: 60, remarks: 'Atlanta',
    },
    {
      id: 42, text: '42種', rateBonus: 1.65, c1: 10, c2: 1, rate: 65, remarks: '大和型改二',
    },
    {
      id: 43, text: '43種', rateBonus: 1.6, c1: 8, c2: 1, rate: 60, remarks: '大和型改二',
    },
    {
      id: 44, text: '44種', rateBonus: 1.6, c1: 6, c2: 1, rate: 55, remarks: '大和型改二',
    },
    {
      id: 45, text: '45種', rateBonus: 1.55, c1: 5, c2: 1, rate: 50, remarks: '大和型改二',
    },
  ];

  /**
   * 経験値最低値ボーダー
   * @static
   * @memberof Const
   */
  public static readonly LEVEL_BORDERS = [
    { lv: 175, req: 10950000 },
    { lv: 174, req: 10266000 },
    { lv: 173, req: 9705000 },
    { lv: 172, req: 9248000 },
    { lv: 171, req: 8875000 },
    { lv: 170, req: 8580000 },
    { lv: 169, req: 8350000 },
    { lv: 168, req: 8172000 },
    { lv: 167, req: 8033000 },
    { lv: 166, req: 7920000 },
    { lv: 165, req: 7820000 },
    { lv: 164, req: 7320000 },
    { lv: 163, req: 6910000 },
    { lv: 162, req: 6580000 },
    { lv: 161, req: 6320000 },
    { lv: 160, req: 6120000 },
    { lv: 159, req: 5970000 },
    { lv: 158, req: 5860000 },
    { lv: 157, req: 5780000 },
    { lv: 156, req: 5720000 },
    { lv: 155, req: 5470000 },
    { lv: 154, req: 5230000 },
    { lv: 153, req: 4999000 },
    { lv: 152, req: 4777000 },
    { lv: 151, req: 4564000 },
    { lv: 150, req: 4360000 },
    { lv: 149, req: 4165000 },
    { lv: 148, req: 3978000 },
    { lv: 147, req: 3799000 },
    { lv: 146, req: 3628000 },
    { lv: 145, req: 3465000 },
    { lv: 144, req: 3310000 },
    { lv: 143, req: 3162000 },
    { lv: 142, req: 3021000 },
    { lv: 141, req: 2887000 },
    { lv: 140, req: 2760000 },
    { lv: 139, req: 2640000 },
    { lv: 138, req: 2525000 },
    { lv: 137, req: 2415000 },
    { lv: 136, req: 2310000 },
    { lv: 135, req: 2210000 },
    { lv: 134, req: 2115000 },
    { lv: 133, req: 2025000 },
    { lv: 132, req: 1940000 },
    { lv: 131, req: 1860000 },
    { lv: 130, req: 1785000 },
    { lv: 129, req: 1714000 },
    { lv: 128, req: 1647000 },
    { lv: 127, req: 1584000 },
    { lv: 126, req: 1525000 },
    { lv: 125, req: 1470000 },
    { lv: 124, req: 1419000 },
    { lv: 123, req: 1372000 },
    { lv: 122, req: 1329000 },
    { lv: 121, req: 1290000 },
    { lv: 120, req: 1255000 },
    { lv: 119, req: 1223000 },
    { lv: 118, req: 1194000 },
    { lv: 117, req: 1168000 },
    { lv: 116, req: 1145000 },
    { lv: 115, req: 1125000 },
    { lv: 114, req: 1107000 },
    { lv: 113, req: 1091000 },
    { lv: 112, req: 1077000 },
    { lv: 111, req: 1065000 },
    { lv: 110, req: 1055000 },
    { lv: 109, req: 1046000 },
    { lv: 108, req: 1038000 },
    { lv: 107, req: 1031000 },
    { lv: 106, req: 1025000 },
    { lv: 105, req: 1020000 },
    { lv: 104, req: 1016000 },
    { lv: 103, req: 1013000 },
    { lv: 102, req: 1011000 },
    { lv: 101, req: 1010000 },
    { lv: 100, req: 1000000 },
    { lv: 99, req: 1000000 },
    { lv: 98, req: 851500 },
    { lv: 97, req: 761500 },
    { lv: 96, req: 701500 },
    { lv: 95, req: 661500 },
    { lv: 94, req: 631500 },
    { lv: 93, req: 606500 },
    { lv: 92, req: 584500 },
    { lv: 91, req: 564500 },
    { lv: 90, req: 545500 },
    { lv: 89, req: 527000 },
    { lv: 88, req: 509000 },
    { lv: 87, req: 491500 },
    { lv: 86, req: 474500 },
    { lv: 85, req: 458000 },
    { lv: 84, req: 442000 },
    { lv: 83, req: 426500 },
    { lv: 82, req: 411500 },
    { lv: 81, req: 397000 },
    { lv: 80, req: 383000 },
    { lv: 79, req: 369400 },
    { lv: 78, req: 356200 },
    { lv: 77, req: 343400 },
    { lv: 76, req: 331000 },
    { lv: 75, req: 319000 },
    { lv: 74, req: 307400 },
    { lv: 73, req: 296200 },
    { lv: 72, req: 285400 },
    { lv: 71, req: 275000 },
    { lv: 70, req: 265000 },
    { lv: 69, req: 255300 },
    { lv: 68, req: 245900 },
    { lv: 67, req: 236800 },
    { lv: 66, req: 228000 },
    { lv: 65, req: 219500 },
    { lv: 64, req: 211300 },
    { lv: 63, req: 203400 },
    { lv: 62, req: 195800 },
    { lv: 61, req: 188500 },
    { lv: 60, req: 181500 },
    { lv: 59, req: 174700 },
    { lv: 58, req: 168100 },
    { lv: 57, req: 161700 },
    { lv: 56, req: 155500 },
    { lv: 55, req: 149500 },
    { lv: 54, req: 143700 },
    { lv: 53, req: 138100 },
    { lv: 52, req: 132700 },
    { lv: 51, req: 127500 },
    { lv: 50, req: 122500 },
    { lv: 49, req: 117600 },
    { lv: 48, req: 112800 },
    { lv: 47, req: 108100 },
    { lv: 46, req: 103500 },
    { lv: 45, req: 99000 },
    { lv: 44, req: 94600 },
    { lv: 43, req: 90300 },
    { lv: 42, req: 86100 },
    { lv: 41, req: 82000 },
    { lv: 40, req: 78000 },
    { lv: 39, req: 74100 },
    { lv: 38, req: 70300 },
    { lv: 37, req: 66600 },
    { lv: 36, req: 63000 },
    { lv: 35, req: 59500 },
    { lv: 34, req: 56100 },
    { lv: 33, req: 52800 },
    { lv: 32, req: 49600 },
    { lv: 31, req: 46500 },
    { lv: 30, req: 43500 },
    { lv: 29, req: 40600 },
    { lv: 28, req: 37800 },
    { lv: 27, req: 35100 },
    { lv: 26, req: 32500 },
    { lv: 25, req: 30000 },
    { lv: 24, req: 27600 },
    { lv: 23, req: 25300 },
    { lv: 22, req: 23100 },
    { lv: 21, req: 21000 },
    { lv: 20, req: 19000 },
    { lv: 19, req: 17100 },
    { lv: 18, req: 15300 },
    { lv: 17, req: 13600 },
    { lv: 16, req: 12000 },
    { lv: 15, req: 10500 },
    { lv: 14, req: 9100 },
    { lv: 13, req: 7800 },
    { lv: 12, req: 6600 },
    { lv: 11, req: 5500 },
    { lv: 10, req: 4500 },
    { lv: 9, req: 3600 },
    { lv: 8, req: 2800 },
    { lv: 7, req: 2100 },
    { lv: 6, req: 1500 },
    { lv: 5, req: 1000 },
    { lv: 4, req: 600 },
    { lv: 3, req: 300 },
    { lv: 2, req: 100 },
    { lv: 1, req: 0 },
  ];

  /**
   * ファイル色
   * @static
   * @memberof Const
   */
  public static readonly FILE_COLORS = [
    'red lighten-1',
    'pink lighten-2',
    'purple lighten-2',
    'deep-purple lighten-1',
    'indigo lighten-2',
    'blue',
    'blue lighten-3',
    'cyan',
    'teal lighten-1',
    'light-green',
    'lime',
    'yellow lighten-1',
    'amber',
    'orange',
    'deep-orange',
    'brown lighten-1',
    'blue-grey',
    'grey',
  ];

  /**
   * 戦果関連任務
   * @static
   * @memberof Const
   */
  public static readonly RANKING_POINT_QUESTS = [
    {
      id: 'Bq2',
      name: '戦果拡張任務！「Z作戦」前段作戦',
      type: 'Quarterly',
      requires: [
        { area: '2-4', rank: 'A' },
        { area: '6-1', rank: 'A' },
        { area: '6-3', rank: 'A' },
        { area: '6-4', rank: 'S' },
      ],
      fuel: 0,
      ammo: 2000,
      steel: 0,
      bauxite: 0,
      rankingPoint: 350,
    },
    {
      id: 'Bq7',
      name: '新編成「三川艦隊」、鉄底海峡に突入せよ！',
      type: 'Quarterly',
      requires: [
        { area: '5-1', rank: 'S' },
        { area: '5-3', rank: 'S' },
        { area: '5-4', rank: 'S' },
      ],
      fuel: 800,
      ammo: 800,
      steel: 800,
      bauxite: 800,
      rankingPoint: 200,
    },
    {
      id: 'Bq8',
      name: '泊地周辺海域の安全確保を徹底せよ！',
      type: 'Quarterly',
      requires: [
        { area: '1-5', rank: 'S' },
        { area: '1-5', rank: 'S' },
        { area: '1-5', rank: 'S' },
        { area: '7-1', rank: 'S' },
        { area: '7-1', rank: 'S' },
        { area: '7-1', rank: 'S' },
        { area: '7-2-1', rank: 'S' },
        { area: '7-2-1', rank: 'S' },
        { area: '7-2-1', rank: 'S' },
        { area: '7-2-2', rank: 'S' },
        { area: '7-2-2', rank: 'S' },
        { area: '7-2-2', rank: 'S' },
      ],
      fuel: 2000,
      ammo: 500,
      steel: 0,
      bauxite: 500,
      rankingPoint: 300,
    },
    {
      id: 'Bq10',
      name: '戦果拡張任務！「Z作戦」後段作戦',
      type: 'Quarterly',
      requires: [
        { area: '7-2-2', rank: 'S' },
        { area: '5-5', rank: 'S' },
        { area: '6-2', rank: 'S' },
        { area: '6-5', rank: 'S' },
      ],
      fuel: 0,
      ammo: 0,
      steel: 2000,
      bauxite: 2000,
      rankingPoint: 400,
    },
    {
      id: 'Bq11',
      name: '南西諸島方面「海上警備行動」発令！',
      type: 'Quarterly',
      requires: [
        { area: '1-4', rank: 'S' },
        { area: '2-1', rank: 'S' },
        { area: '2-2', rank: 'S' },
        { area: '2-3', rank: 'S' },
      ],
      fuel: 0,
      ammo: 800,
      steel: 800,
      bauxite: 0,
      rankingPoint: 80,
    },
    {
      id: 'Bq12',
      name: '発令！「西方海域作戦」',
      type: 'Quarterly',
      requires: [
        { area: '4-1', rank: 'S' },
        { area: '4-2', rank: 'S' },
        { area: '4-3', rank: 'S' },
        { area: '4-4', rank: 'S' },
        { area: '4-5', rank: 'S' },
      ],
      fuel: 0,
      ammo: 0,
      steel: 2400,
      bauxite: 0,
      rankingPoint: 330,
    },
    {
      id: 'Bq13',
      name: '拡張「六水戦」、最前線へ！',
      type: 'Quarterly',
      requires: [
        { area: '5-1', rank: 'S' },
        { area: '5-4', rank: 'S' },
        { area: '6-4', rank: 'S' },
        { area: '6-5', rank: 'S' },
      ],
      fuel: 0,
      ammo: 1000,
      steel: 1000,
      bauxite: 1000,
      rankingPoint: 390,
    },
    {
      id: 'By9',
      name: 'AL作戦',
      type: 'Yearly',
      resetMonth: 6,
      requires: [
        { area: '3-1', rank: 'S' },
        { area: '3-3', rank: 'S' },
        { area: '3-4', rank: 'S' },
        { area: '3-5', rank: 'S' },
      ],
      fuel: 880,
      ammo: 880,
      steel: 880,
      bauxite: 880,
      rankingPoint: 480,
    },
    {
      id: 'By10',
      name: '機動部隊決戦',
      type: 'Yearly',
      resetMonth: 6,
      requires: [
        { area: '5-2', rank: 'S' },
        { area: '5-2', rank: 'S' },
        { area: '5-5', rank: 'S' },
        { area: '5-5', rank: 'S' },
        { area: '6-5', rank: 'S' },
        { area: '6-5', rank: 'S' },
        { area: '6-4', rank: 'A' },
        { area: '6-4', rank: 'A' },
      ],
      fuel: 1300,
      ammo: 1300,
      steel: 0,
      bauxite: 1300,
      rankingPoint: 600,
    },
    {
      id: 'B170',
      name: '改装特務空母「Gambier Bay Mk II」抜錨！',
      type: 'Once',
      requires: [
        { area: '2-4', rank: 'S' },
        { area: '2-4', rank: 'S' },
        { area: '3-5', rank: 'S' },
        { area: '3-5', rank: 'S' },
        { area: '6-4', rank: 'A' },
        { area: '6-4', rank: 'A' },
      ],
      fuel: 730,
      ammo: 730,
      steel: 730,
      bauxite: 730,
      rankingPoint: 800,
    },
  ]
}
