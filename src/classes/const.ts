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
  AIR_SUPPORTED_ASW: 8,
  RADAR: 9,
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
  LBAS: 220,
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

  /** 航空戦に関係する装備カテゴリ */
  public static readonly PLANE_TYPES = [6, 7, 8, 9, 10, 11, 25, 26, 41, 45, 47, 48, 49, 53, 57];

  /** 空母のみ搭載可である機体カテゴリ */
  public static readonly CB_PLANE_TYPES = [6, 7, 8, 9, 57];

  /** 水上機 */
  public static readonly SP_PLANE_TYPES = [10, 11, 41, 45];

  /** 基地航空隊のみ搭載可である機体カテゴリ */
  public static readonly AB_PLANE_TYPES = [47, 48, 49, 53];

  /** 艦戦カテゴリ */
  public static readonly FIGHTERS = [6, 45, 48];

  /** 攻撃機カテゴリ */
  public static readonly ATTACKERS = [7, 8, 11, 47, 53, 57];

  /** 対潜哨戒機 オートジャイロ */
  public static readonly ASW_PLANES = [25, 26];

  /** 偵察機カテゴリ */
  public static readonly RECONNAISSANCES = [9, 10, 41, 49];

  /** 陸上攻撃機カテゴリ */
  public static readonly AB_ATTACKERS = [47, 53];

  /** 大型陸上機カテゴリ */
  public static readonly AB_ATTACKERS_LARGE = [53];

  /** 狭義の爆雷カテゴリ */
  public static readonly STRICT_DEPTH_CHARGE = [226, 227, 378, 439, 488];

  /** ロケット戦闘機id */
  public static readonly ROCKET = [350, 351, 352];

  /** 爆戦id */
  public static readonly BAKUSEN = [60, 154, 219, 447, 487];

  /** 対地攻撃可能な艦爆id */
  public static readonly ENABLED_LAND_BASE_ATTACK = [64, 148, 233, 277, 305, 306, 319, 320, 391, 392, 420, 421, 474, 552];

  /** 対潜支援可能艦種 */
  public static readonly ENABLED_ASW_SUPPORT = [7, 8, 10, 11, 45, 41, 25, 26];

  /** 潜水艦後期型魚雷 */
  public static readonly LATE_MODEL_TORPEDO = [213, 214, 383, 441, 443, 457, 461, 512];

  /** 特効情報 */
  public static readonly SPECIAL_GROUP: { key: string, text: string, items: number[] }[] = [
    // { key: '57-5', text: 'A', items: [401, 405, 406, 431, 432, 459, 354, 178] },
    // { key: '57-5', text: 'B', items: [433, 479, 250, 251, 253, 480, 516] },
    // { key: '57-5', text: 'A', items: [158, 159, 353, 249, 184, 189, 510] },
    // { key: '57-5', text: 'B', items: [474, 475, 476, 481, 473, 252, 434, 435, 471, 423, 515] },
    // { key: '57-5', text: '1', items: [242, 367, 368, 369, 370, 196, 256, 257, 389, 195, 419, 420, 233, 277, 158, 159, 353, 197, 198, 205, 206, 254, 255, 375, 422, 371, 414, 415] },
    // { key: '57-5', text: '2', items: [243, 188, 316, 248, 64, 305, 306, 474, 475, 249, 422, 184, 473, 194, 510] },
    // { key: '57-5', text: '3', items: [244, 424, 425, 481, 476, 189, 252, 434, 435, 471, 515, 423, 538] },

    { key: '59-1', text: 'A', items: [401, 405, 406, 431, 432, 459, 354, 178] },
    { key: '59-1', text: 'B', items: [433, 479, 250, 251, 253, 480, 516] },
    { key: '59-1', text: 'A', items: [158, 159, 353, 249, 184, 189, 510] },
    { key: '59-1', text: 'B', items: [474, 475, 476, 481, 473, 252, 434, 435, 471, 423, 515] },
    { key: '59-1', text: '1', items: [242, 367, 368, 369, 370, 196, 256, 257, 389, 195, 419, 420, 233, 277, 158, 159, 353, 197, 198, 205, 206, 254, 255, 375, 421, 422, 371, 414, 415, 171, 304, 163, 164, 215, 539, 541, 542, 543, 544] },
    { key: '59-1', text: '2', items: [243, 188, 316, 248, 64, 305, 306, 474, 475, 249, 184, 473, 194, 510] },
    { key: '59-1', text: '3', items: [244, 424, 425, 481, 476, 189, 252, 434, 435, 471, 515, 423, 538] },

    // { key: '60-5', text: 'A', items: [238, 239, 523, 118, 344, 345, 338, 339, 373, 374, 545, 459, 201, 311] },
    // { key: '60-5', text: 'B', items: [469, 540, 521, 237, 322, 323, 490, 552, 557, 558, 312, 396, 218] },

    // { key: 'Saury', text: 'Saury', items: [226, 227, 378, 439, 488, 47, 69, 324, 325, 326, 327, 70, 451, 489, 491, 74, 129, 138, 140, 178, 242, 243, 244, 258, 259, 260, 261, 262, 412, 438, 25, 59, 102, 115, 163, 171, 238, 239, 304, 370, 371, 414, 415, 469, 471, 510, 515, 26, 62, 79, 80, 81, 194, 207, 208, 237, 322, 323, 367, 368, 369, 490, 522, 523, 538, 539, 540, 549] },
  ];

  /** 海域特効装備 */
  public static readonly AIRBASE_MAP_BONUSES = [
    {
      area: 563, node: '', items: [273, 263, 264, 265, 452], bonus: 1.14, multi: true,
    },
    {
      area: 563, node: '', items: [342, 343, 170, 388, 453, 454], bonus: 1.11, multi: true,
    },
    {
      area: 565, node: '', items: [273, 263, 264, 265, 452, 177, 224, 486, 223], bonus: 1.05, multi: true,
    },
    {
      area: 565, node: '', items: [342, 343, 170, 388, 453, 454, 404, 374, 388], bonus: 1.11, multi: true,
    },
    {
      area: 565, node: '', items: [493, 492], bonus: 1.175, multi: true,
    },
    {
      area: 566, node: '', items: [273, 263, 264, 265, 452, 177, 224, 486, 447, 487, 223], bonus: 1.05, multi: true,
    },
    {
      area: 566, node: '', items: [342, 343, 170, 453, 454, 404, 489, 491, 374, 388], bonus: 1.11, multi: true,
    },
    {
      area: 566, node: '', items: [493, 492], bonus: 1.175, multi: true,
    },
    {
      area: 601, node: '', items: [170, 388, 454, 493, 554], bonus: 1.16, multi: true, once: true,
    },
    {
      area: 602, node: '', items: [170, 388, 454, 493, 554], bonus: 1.16, multi: true, once: true,
    },
    {
      area: 603, node: '', items: [170, 388, 454, 493, 554], bonus: 1.16, multi: true, once: true,
    },
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
    { id: 48, name: '局地/陸軍戦闘機', sortKey: ['antiAir', 'antiBomber', 'interception', 'radius', 'cost', 'sortieAntiAir', 'defenseAntiAir'] },
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
    { id: 52, name: '陸戦部隊' },
    { id: 54, name: '艦載発煙装置' },
    { id: 55, name: '防空気球' },
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
    { id: 111, name: '耐氷型雑用運送艦' },
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
    { id: 57, name: 'UボートIXC型' },
    { id: 86, name: '呂号潜水艦' },
    { id: 46, name: '三式潜航輸送艇' },
    { id: 97, name: '陸軍特種船(R1)' },
    { id: 45, name: '特種船丙型' },
    { id: 115, name: '特2TL型' },
    { id: 119, name: '特種船M丙型' },
    { id: 120, name: '二等輸送艦' },
    { id: 123, name: '敷島型' },
    { id: 126, name: '改氷川丸級' },
    { id: 127, name: '巡潜乙型改一' },
    { id: 130, name: '大泊型' },
    { id: 132, name: '特1TL型' },

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
    { id: 80, name: 'Guglielmo Marconi級' },
    { id: 124, name: 'Marcello級' },

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
    { id: 121, name: 'New Orleans級' },
    { id: 122, name: 'Salmon級' },
    { id: 125, name: 'Nevada級' },

    { id: 67, name: 'Queen Elizabeth級' },
    { id: 88, name: 'Nelson級' },
    { id: 78, name: 'Ark Royal級' },
    { id: 112, name: 'Illustrious級' },
    { id: 108, name: 'Town級' },
    { id: 82, name: 'J級' },
    { id: 134, name: 'Courageous級' },
    { id: 135, name: 'Glorious級' },

    { id: 79, name: 'Richelieu級' },
    { id: 70, name: 'C.Teste級' },
    { id: 128, name: 'La Galissonnière級' },
    { id: 129, name: 'Mogador級' },

    { id: 73, name: 'Гангут級' },
    { id: 81, name: 'Ташкент級' },
    { id: 131, name: 'Киров級' },

    { id: 89, name: 'Gotland級' },

    { id: 98, name: 'De Ruyter級' },

    { id: 96, name: 'Perth級' },

    { id: 133, name: 'Norge級' },

    { id: 42, name: '(霧の艦隊?)' },
  ];

  /**
   * 補強増設に搭載可能
   * そうそうかわんないけど、定期的に api_mst_equip_exslot チェックして更新
   * @static
   * @memberof Const
   */
  public static readonly EXPANDED_ITEM_TYPE = [16, 21, 23, 27, 28, 36, 39, 43, 44];

  // 特定の艦娘が特定スロットに装備『できない！』やつ 99で増設
  public static readonly FORBIDDEN_LINK_SHIP_ITEM = [
    // 伊勢改二 3，4，5スロットに 主砲系
    {
      shipId: 553, index: [3, 4, 5], itemType: [2, 3], itemIDs: [0],
    },
    // 日向改二 3，4，5スロットに 主砲系
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
      shipId: 622, index: [5], itemType: [1, 2, 5, 13, 14, 15, 17, 20, 22, 23, 24, 27, 29, 30, 33, 34, 36, 37, 39, 40, 46, 54], itemIDs: [0],
    },
    // 夕張改二特 5スロットに いろいろ装備不可
    {
      shipId: 623, index: [5], itemType: [1, 2, 5, 14, 15, 17, 20, 22, 23, 24, 27, 29, 30, 33, 34, 36, 37, 39, 40, 46, 54], itemIDs: [0],
    },
    // 夕張改二丁 5スロットに いろいろ装備不可
    {
      shipId: 624, index: [5], itemType: [1, 2, 5, 14, 15, 17, 20, 22, 23, 24, 27, 29, 30, 33, 34, 36, 37, 39, 40, 46, 54], itemIDs: [0],
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
    // 初月改二 4スロットに 主砲、魚雷、大型電探系 不可
    {
      shipId: 968, index: [4], itemType: [1, 5, 13], itemIDs: [0],
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
    { text: '水母', types: [16] },
    { text: 'その他', types: [15, 17, 19, 20, 22] },
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

  /**
   * 艦種一覧 省略形の一覧
   * @static
   * @memberof Const
   */
  public static readonly SHIP_TYPES_ALT3 = [
    { text: '戦艦', type: 9 },
    { text: '航戦', type: 10 },
    { text: '高戦', type: 8 },
    { text: '空母', type: 11 },
    { text: '装空', type: 18 },
    { text: '軽母', type: 7 },
    { text: '重巡', type: 5 },
    { text: '航巡', type: 6 },
    { text: '雷巡', type: 4 },
    { text: '軽巡', type: 3 },
    { text: '練巡', type: 21 },
    { text: '水母', type: 16 },
    { text: '補給', type: 15 },
    { text: '補給', type: 22 },
    { text: '揚陸', type: 17 },
    { text: '工作', type: 19 },
    { text: '潜母', type: 20 },
    { text: '潜水', type: 13 },
    { text: '潜水', type: 14 },
    { text: '駆逐', type: 2 },
    { text: '海防', type: 1 },
  ];

  /**
   * 艦種一覧 正式名称の一覧
   * @static
   * @memberof Const
   */
  public static readonly SHIP_TYPES_FORMAL = [
    { text: '海防艦', type: SHIP_TYPE.DE },
    { text: '駆逐艦', type: SHIP_TYPE.DD },
    { text: '軽巡', type: SHIP_TYPE.CL },
    { text: '雷巡', type: SHIP_TYPE.CLT },
    { text: '重巡', type: SHIP_TYPE.CA },
    { text: '航巡', type: SHIP_TYPE.CAV },
    { text: '軽空母', type: SHIP_TYPE.CVL },
    { text: '高速戦艦', type: SHIP_TYPE.FBB },
    { text: '戦艦', type: SHIP_TYPE.BB },
    { text: '航空戦艦', type: SHIP_TYPE.BBV },
    { text: '正規空母', type: SHIP_TYPE.CV },
    { text: '潜水艦', type: SHIP_TYPE.SS },
    { text: '潜水空母', type: SHIP_TYPE.SSV },
    { text: '補給', type: SHIP_TYPE.AO_2 },
    { text: '水母', type: SHIP_TYPE.AV },
    { text: '揚陸艦', type: SHIP_TYPE.LHA },
    { text: '装甲空母', type: SHIP_TYPE.CVB },
    { text: '工作艦', type: SHIP_TYPE.AR },
    { text: '潜水母艦', type: SHIP_TYPE.AS },
    { text: '練巡', type: SHIP_TYPE.CT },
    { text: '補給', type: SHIP_TYPE.AO },
  ];

  public static readonly JPN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 49, 50, 51, 52, 53, 54, 56, 59, 60, 62, 66, 71, 72, 74, 75, 76, 77, 85, 86, 90, 94, 97, 100, 101, 103, 104, 109, 111, 115, 117, 119, 120, 123, 126, 127, 130, 132];

  public static readonly USA = [65, 69, 83, 84, 87, 91, 93, 95, 99, 102, 105, 106, 107, 110, 114, 116, 118, 121, 122, 125];

  public static readonly ITA = [58, 61, 64, 68, 80, 92, 113, 124];

  public static readonly GBR = [67, 78, 82, 88, 108, 112, 134, 135];

  public static readonly DEU = [47, 48, 55, 57, 63];

  public static readonly FRA = [70, 79, 128, 129];

  public static readonly RUS = [73, 81, 131];

  public static readonly SWE = [89];

  public static readonly AUS = [96];

  public static readonly NLD = [98];

  public static readonly NOR = [133];

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
      id: 1, text: '小口径主砲', viewStatus: ['actualFire', 'antiAir', 'actualAccuracy', 'nightBattleFirePower', 'antiAirWeight', 'antiAirBonus'], types: [1],
    },
    {
      id: 2, text: '中口径主砲', viewStatus: ['actualFire', 'antiAir', 'actualAccuracy', 'nightBattleFirePower', 'antiAirWeight', 'antiAirBonus'], types: [2],
    },
    {
      id: 3, text: '大口径主砲', viewStatus: ['actualFire', 'antiAir', 'actualAccuracy', 'nightBattleFirePower', 'antiAirBonus', 'actualRange'], types: [3],
    },
    {
      id: 5, text: '魚雷', viewStatus: ['actualTorpedo', 'nightBattleFirePower', 'actualFire', 'actualAccuracy', 'actualAvoid', 'actualArmor'], types: [5, 22, 32],
    },
    {
      id: 6, text: '艦戦', viewStatus: ['antiAir', 'actualAntiAir', 'actualAccuracy', 'actualAvoid', 'radius', 'airPower'], types: [6],
    },
    {
      id: 7, text: '艦爆', viewStatus: ['actualBomber', 'actualAntiAir', 'actualAccuracy', 'actualAsw', 'radius', 'avoidId'], types: [7],
    },
    {
      id: 8, text: '艦攻', viewStatus: ['actualTorpedo', 'actualAntiAir', 'actualAccuracy', 'actualAsw', 'radius', 'avoidId'], types: [8],
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
      id: 4500, text: '水戦', viewStatus: ['antiAir', 'actualAntiAir', 'actualScout', 'actualAccuracy', 'radius', 'airPower'], types: [45],
    },
    {
      id: 41, text: '大型飛行艇', viewStatus: ['actualScout', 'actualAccuracy', 'actualAsw', 'radius', 'cost'], types: [41],
    },
    {
      id: 12, text: '電探', viewStatus: ['actualAccuracy', 'actualScout', 'antiAir', 'nightBattleFirePower', 'antiAirWeight', 'antiAirBonus'], types: [12, 13],
    },
    {
      id: 14, text: '対潜装備', viewStatus: ['actualAsw', 'actualAccuracy', 'actualArmor', 'actualAvoid', 'actualScout'], types: [14, 15, 40],
    },
    {
      id: 4, text: '副砲', viewStatus: ['actualFire', 'antiAir', 'actualAccuracy', 'nightBattleFirePower', 'antiAirWeight', 'antiAirBonus'], types: [4],
    },
    {
      id: 21, text: '機銃', viewStatus: ['antiAir', 'actualFire', 'actualAccuracy', 'actualArmor', 'antiAirWeight', 'antiAirBonus'], types: [21],
    },
    {
      id: 24, text: '上陸用舟艇', viewStatus: ['actualFire', 'antiAir', 'actualScout', 'actualAvoid', 'actualArmor', 'tp'], types: [24, 30, 46, 52],
    },
    {
      id: 47, text: '陸攻', viewStatus: ['actualTorpedo', 'actualBomber', 'actualAntiAir', 'radius', 'cost', 'avoidId'], types: [47, 53],
    },
    {
      id: 48, text: '局戦', viewStatus: ['actualAntiAir', 'actualDefenseAntiAir', 'antiBomber', 'radius', 'airPower', 'defenseAirPower'], types: [48],
    },
    {
      id: 49, text: '陸偵', viewStatus: ['actualAntiAir', 'actualScout', 'actualAccuracy', 'radius', 'actualArmor', 'cost'], types: [49],
    },
    {
      id: 17, text: 'その他', viewStatus: ['radius', 'nightBattleFirePower', 'actualAccuracy', 'actualScout', 'actualAsw', 'actualArmor'], types: [17, 18, 19, 23, 25, 26, 27, 28, 29, 31, 33, 34, 35, 36, 37, 39, 42, 43, 44, 50, 51, 54, 55],
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
    { text: '対潜空襲', value: CELL_TYPE.AIR_SUPPORTED_ASW },
    { text: 'レーダー', value: CELL_TYPE.AIR_SUPPORTED_ASW },
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
   * 実装最大レベル
   * @static
   * @memberof Const
   */
  public static readonly MAX_LEVEL = 185;

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
      value: 2, text: '中', c1: 0.6, c2: 0.7, c3: 0.6, c4: 1,
    },
    {
      value: 3, text: '強', c1: 0.5, c2: 0.7, c3: 0.4, c4: 0.5,
    },
    {
      value: 4, text: '超', c1: 0.5, c2: 0.5, c3: 0.4, c4: 0.5,
    },
    {
      value: 5, text: '超+', c1: 0.4, c2: 0.4, c3: 0.4, c4: 0.5,
    },
    {
      value: Const.MANUAL_AVOID, text: '任意', c1: 1, c2: 1, c3: 1, c4: 1,
    },
  ];

  /**
   * 対空CI優先度配列
   * 調査お疲れ様です
   * @static
   * @memberof Const
   */
  public static readonly ANTI_AIR_CUT_IN_PRIORITIES = [38, 39, 40, 42, 41, 10, 43, 46, 11, 25, 48, 1, 34, 44, 26, 4, 2, 35, 36, 27, 45, 50, 49, 51, 52, 19, 21, 29, 16, 14, 3, 5, 6, 28, 37, 33, 30, 8, 13, 15, 7, 20, 24, 32, 12, 31, 47, 17, 18, 22, 9, 23];

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
      id: 2, text: '2種', rateBonus: 1.7, c1: 3, c2: 4, rate: 55, remarks: '秋月型',
    },
    {
      id: 3, text: '3種', rateBonus: 1.6, c1: 2, c2: 3, rate: 50, remarks: '秋月型',
    },
    {
      id: 4, text: '4種', rateBonus: 1.5, c1: 5, c2: 2, rate: 52, remarks: '戦艦',
    },
    {
      id: 5, text: '5種', rateBonus: 1.5, c1: 2, c2: 3, rate: 50, remarks: '汎用',
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
      id: 13, text: '13種', rateBonus: 1.35, c1: 1, c2: 4, rate: 35, remarks: '汎用',
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
      id: 17, text: '17種', rateBonus: 1.25, c1: 2, c2: 1, rate: 57, remarks: '霞改二乙 / 稲木改二',
    },
    {
      id: 18, text: '18種', rateBonus: 1.2, c1: 2, c2: 1, rate: 59, remarks: '皐月改二 / 稲木改二',
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
      id: 27, text: '27種', rateBonus: 1.55, c1: 6, c2: 1, rate: 55, remarks: '大淀',
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
      id: 31, text: '31種', rateBonus: 1.25, c1: 2, c2: 1, rate: 50, remarks: '天龍改二 / 稲木改二',
    },
    {
      id: 32, text: '32種', rateBonus: 1.2, c1: 3, c2: 1, rate: 60, remarks: '金剛型改二 / 英艦',
    },
    {
      id: 33, text: '33種', rateBonus: 1.35, c1: 3, c2: 1, rate: 42, remarks: 'Gotland',
    },
    {
      id: 34, text: '34種', rateBonus: 1.6, c1: 7, c2: 1, rate: 56, remarks: 'Fletcher級',
    },
    {
      id: 35, text: '35種', rateBonus: 1.55, c1: 6, c2: 1, rate: 55, remarks: 'Fletcher級',
    },
    {
      id: 36, text: '36種', rateBonus: 1.55, c1: 6, c2: 1, rate: 50, remarks: 'Fletcher級',
    },
    {
      id: 37, text: '37種', rateBonus: 1.45, c1: 2, c2: 3, rate: 44, remarks: 'Fletcher級',
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
      id: 42, text: '42種', rateBonus: 1.7, c1: 10, c2: 1, rate: 65, remarks: '大和型改二',
    },
    {
      id: 43, text: '43種', rateBonus: 1.6, c1: 8, c2: 1, rate: 60, remarks: '大和型改二',
    },
    {
      id: 44, text: '44種', rateBonus: 1.6, c1: 6, c2: 1, rate: 55, remarks: '大和型改二',
    },
    {
      id: 45, text: '45種', rateBonus: 1.55, c1: 6, c2: 1, rate: 50, remarks: '大和型改二',
    },
    {
      id: 46, text: '46種', rateBonus: 1.55, c1: 8, c2: 1, rate: 50, remarks: '榛名改二乙',
    },
    {
      id: 47, text: '47種', rateBonus: 1.3, c1: 2, c2: 1, rate: 70, remarks: '白露型改二',
    },
    {
      id: 48, text: '48種', rateBonus: 1.75, c1: 8, c2: 1, rate: 65, remarks: '秋月型',
    },
    {
      id: 49, text: '49種', rateBonus: 1.5, c1: 6, c2: 1, rate: 50, remarks: '藤波改二 / 吹雪改二 / 白雪改二',
    },
    {
      id: 50, text: '50種', rateBonus: 1.5, c1: 7, c2: 1, rate: 50, remarks: '吹雪改二 / 白雪改二 / 秋月型',
    },
    {
      id: 51, text: '51種', rateBonus: 1.4, c1: 5, c2: 1, rate: 50, remarks: '吹雪改二 / 白雪改二',
    },
    {
      id: 52, text: '52種', rateBonus: 1.4, c1: 5, c2: 1, rate: 50, remarks: '吹雪改二 / 白雪改二',
    },
  ];

  /**
   * 経験値最低値ボーダー
   * @static
   * @memberof Const
   */
  public static readonly LEVEL_BORDERS = [
    { lv: 185, req: 16000000 },
    { lv: 184, req: 15000000 },
    { lv: 183, req: 14200000 },
    { lv: 182, req: 13600000 },
    { lv: 181, req: 13200000 },
    { lv: 180, req: 13000000 },
    { lv: 179, req: 12100000 },
    { lv: 178, req: 11600000 },
    { lv: 177, req: 11300000 },
    { lv: 176, req: 11100000 },
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
  ];

  /**
 * 戦果関連任務
 * @static
 * @memberof Const
 */
  public static readonly EXPEDITIONS = [
    {
      world: 1,
      id: 'A2',
      name: '海峡警備行動',
      statuses: { fire: 50, antiAir: 70, asw: 180 },
      types: [{ DE: 4 }],
      minFlagshipLv: 20,
      totalLevel: 20,
      minCount: 4,
    },
    {
      world: 1,
      id: 'A3',
      name: '長時間対潜警戒',
      statuses: { asw: 280, scout: 60 },
      types: [{ CL: 1, DE: 3 }],
      minFlagshipLv: 35,
      totalLevel: 185,
      minCount: 5,
    },
    {
      world: 1,
      id: 'A4',
      name: '南西方面連絡線哨戒',
      statuses: {
        fire: 300, antiAir: 200, asw: 200, scout: 120,
      },
      types: [{ CL: 1, DD: 2 }],
      minFlagshipLv: 40,
      totalLevel: 200,
      minCount: 5,
    },
    {
      world: 1,
      id: 'A5',
      name: '小笠原沖哨戒線',
      statuses: {
        fire: 280, antiAir: 220, asw: 240, scout: 150,
      },
      types: [{ CL: 1, DD: 3 }],
      minFlagshipLv: 45,
      totalLevel: 230,
      minCount: 5,
    },
    {
      world: 1,
      id: 'A6',
      name: '小笠原沖戦闘哨戒',
      statuses: {
        fire: 330, antiAir: 300, asw: 270, scout: 180,
      },
      types: [{ CL: 1, DD: 3 }],
      minFlagshipLv: 55,
      totalLevel: 290,
      minCount: 6,
    },
    {
      world: 2,
      id: 'B1',
      name: '南西方面航空偵察作戦',
      statuses: { antiAir: 200, asw: 200, scout: 140 },
      types: [{ AV: 1, CL: 1, DE: 2 }],
      minFlagshipLv: 40,
      totalLevel: 150,
      minCount: 6,
    },
    {
      world: 2,
      id: 'B2',
      name: '敵泊地強襲反撃作戦',
      statuses: {
        fire: 360, antiAir: 160, asw: 160, scout: 140,
      },
      types: [{ CA: 1, CL: 1, DD: 3 }],
      minFlagshipLv: 45,
      totalLevel: 220,
      minCount: 6,
    },
    {
      world: 2,
      id: 'B3',
      name: '南西諸島離島哨戒作戦',
      statuses: {
        fire: 400, antiAir: 220, asw: 220, scout: 190,
      },
      types: [{ AV: 1, CL: 1, DE: 4 }],
      minFlagshipLv: 50,
      totalLevel: 250,
      minCount: 6,
    },
    {
      world: 2,
      id: 'B4',
      name: '南西諸島離島防衛作戦',
      statuses: {
        fire: 500, antiAir: 280, asw: 280, scout: 170,
      },
      types: [{
        CA: 2, CL: 1, DD: 2, SS: 1,
      }],
      minFlagshipLv: 55,
      totalLevel: 300,
      minCount: 6,
    },
    {
      world: 2,
      id: 'B5',
      name: '南西諸島捜索撃滅戦',
      statuses: {
        fire: 510, antiAir: 400, asw: 285, scout: 385,
      },
      types: [{ AV: 1, CL: 1, DD: 2 }],
      minFlagshipLv: 60,
      totalLevel: 330,
      minCount: 6,
    },
    {
      world: 2,
      id: 'B6',
      name: '精鋭水雷戦隊夜襲',
      statuses: {
        fire: 410, antiAir: 390, asw: 410, scout: 340,
      },
      types: [{ CL: 1, DD: 5 }],
      minFlagshipLv: 75,
      totalLevel: 400,
      minCount: 6,
    },
    {
      world: 7,
      id: '41',
      name: 'ブルネイ泊地沖哨戒',
      statuses: { fire: 60, antiAir: 80, asw: 210 },
      types: [{ DE: 3 }],
      minFlagshipLv: 30,
      totalLevel: 100,
      minCount: 3,
    },
    {
      world: 7,
      id: '42',
      name: 'ミ船団護衛(一号船団)',
      statuses: {},
      types: [{ CL: 1, DD: 2 }],
      minFlagshipLv: 45,
      totalLevel: 200,
      minCount: 4,
    },
    {
      world: 7,
      id: '43',
      name: 'ミ船団護衛(二号船団)',
      statuses: {
        fire: 500, antiAir: 280, asw: 280, scout: 170,
      },
      types: [{ ECVL: 1, DE: 2 },
        { CVL: 1, CL: 1, DD: 4 }],
      minFlagshipLv: 55,
      totalLevel: 300,
      minCount: 6,
    },
    {
      world: 7,
      id: '44',
      name: '航空装備輸送任務',
      statuses: { antiAir: 200, asw: 200, scout: 150 },
      types: [{
        CV: 1, AV: 1, CL: 1, DE: 2,
      }],
      minFlagshipLv: 35,
      totalLevel: 210,
      minCount: 6,
    },
    {
      world: 7,
      id: '45',
      name: 'ボーキサイト船団護衛',
      statuses: { antiAir: 240, asw: 300, scout: 180 },
      types: [{ CVL: 1, DE: 4 }],
      minFlagshipLv: 50,
      totalLevel: 240,
      minCount: 5,
    },
    {
      world: 7,
      id: '46',
      name: '南西海域戦闘哨戒',
      statuses: {
        fire: 350, antiAir: 250, asw: 220, scout: 190,
      },
      types: [{ CA: 2, CL: 1, DD: 2 }],
      minFlagshipLv: 60,
      totalLevel: 300,
      minCount: 5,
    },
    {
      world: 4,
      id: 'D1',
      name: '西方海域偵察作戦',
      statuses: { antiAir: 240, asw: 240, scout: 300 },
      types: [{ AV: 1, DD: 3 }],
      minFlagshipLv: 50,
      totalLevel: 200,
      minCount: 5,
    },
    {
      world: 4,
      id: 'D2',
      name: '西方潜水艦作戦',
      statuses: { fire: 60, antiAir: 80, asw: 50 },
      types: [{ AS: 1, SS: 3 }],
      minFlagshipLv: 55,
      totalLevel: 270,
      minCount: 5,
    },
    {
      world: 4,
      id: 'D3',
      name: '欧州方面友軍との接触',
      statuses: {
        fire: 115, antiAir: 90, asw: 70, scout: 95,
      },
      types: [{ AS: 1, SS: 3 }],
      minFlagshipLv: 65,
      totalLevel: 350,
      minCount: 5,
    },
    {
      world: 5,
      id: 'E1',
      name: 'ラバウル方面艦隊進出',
      statuses: {
        fire: 450, antiAir: 350, asw: 330, scout: 250,
      },
      types: [{ CA: 1, CL: 1, DD: 3 }],
      minFlagshipLv: 55,
      totalLevel: 290,
      minCount: 6,
    },
    {
      world: 5,
      id: 'E2',
      name: '強行鼠輸送作戦',
      statuses: {
        fire: 280, antiAir: 240, asw: 200, scout: 160,
      },
      types: [{ DD: 5 }],
      minFlagshipLv: 70,
      totalLevel: 320,
      minCount: 5,
    },
  ];
}
