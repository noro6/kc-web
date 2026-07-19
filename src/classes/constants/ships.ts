import { SHIP_TYPE } from './enums';

export const SHIP_TYPES_ALT_INFO = [
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
  { id: 136, name: '野埼型' },

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
  { id: 138, name: 'Algérie級' },
  { id: 139, name: 'Aigle級' },
  { id: 141, name: 'Béarn級' },

  { id: 73, name: 'Гангут級' },
  { id: 81, name: 'Ташкент級' },
  { id: 131, name: 'Киров級' },

  { id: 89, name: 'Gotland級' },
  { id: 140, name: 'Visby級' },

  { id: 98, name: 'De Ruyter級' },

  { id: 96, name: 'Perth級' },

  { id: 133, name: 'Norge級' },

  { id: 137, name: 'Thonburi級' },

  { id: 42, name: '(霧の艦隊?)' },
];

export type ShipSlotEquipRestriction = {
  /** 対象艦娘ID */
  shipIds: number[];
  /** 1始まりの通常スロット番号 */
  slots: number[];
  deny?: {
    apiTypeIds?: number[];
    itemIds?: number[];
  };
  allowOnly?: {
    apiTypeIds?: number[];
    itemIds?: number[];
  };
  note: string;
};

export const SHIP_SLOT_EQUIP_RESTRICTIONS: ShipSlotEquipRestriction[] = [
  {
    shipIds: [553, 554],
    slots: [3, 4, 5],
    deny: { apiTypeIds: [2, 3] },
    note: '伊勢改二/日向改二 3,4,5スロットに主砲系不可',
  },
  {
    shipIds: [622],
    slots: [4],
    deny: { apiTypeIds: [1, 2, 5] },
    note: '夕張改二 4スロットに主砲系/魚雷系不可',
  },
  {
    shipIds: [623],
    slots: [4],
    deny: { apiTypeIds: [1, 2, 5, 22] },
    note: '夕張改二特 4スロットに主砲系/魚雷系/特殊潜航艇不可',
  },
  {
    shipIds: [624],
    slots: [4],
    deny: { apiTypeIds: [1, 2, 5] },
    note: '夕張改二丁 4スロットに主砲系/魚雷系不可',
  },
  {
    shipIds: [622],
    slots: [5],
    deny: { apiTypeIds: [1, 2, 5, 13, 14, 15, 17, 20, 22, 23, 24, 27, 29, 30, 33, 34, 36, 37, 39, 40, 46, 54] },
    note: '夕張改二 5スロットに一部カテゴリ不可',
  },
  {
    shipIds: [623],
    slots: [5],
    deny: { apiTypeIds: [1, 2, 5, 14, 15, 17, 20, 22, 23, 24, 27, 29, 30, 33, 34, 36, 37, 39, 40, 46, 54] },
    note: '夕張改二特 5スロットに一部カテゴリ不可',
  },
  {
    shipIds: [624],
    slots: [5],
    deny: { apiTypeIds: [1, 2, 5, 14, 15, 17, 20, 22, 23, 24, 27, 29, 30, 33, 34, 36, 37, 39, 40, 46, 54] },
    note: '夕張改二丁 5スロットに一部カテゴリ不可',
  },
  {
    shipIds: [662, 663],
    slots: [4],
    deny: { apiTypeIds: [5, 22] },
    note: '能代改二/矢矧改二 4スロットに魚雷系不可',
  },
  {
    shipIds: [668],
    slots: [4],
    deny: { apiTypeIds: [5] },
    note: '矢矧改二乙 4スロットに魚雷不可',
  },
  {
    shipIds: [968, 963],
    slots: [4],
    deny: { apiTypeIds: [1, 5, 13] },
    note: '初月改二/秋月改二 4スロットに主砲/魚雷/大型電探系不可',
  },
  {
    shipIds: [961, 1035],
    slots: [4],
    deny: { apiTypeIds: [1, 5] },
    note: '時雨改三/吹雪改三 4スロットに主砲/魚雷不可',
  },
  {
    shipIds: [743, 744, 745],
    slots: [4],
    allowOnly: { apiTypeIds: [21, 43] },
    note: '改二補シリーズ 4スロットは機銃/戦闘糧食のみ',
  },
];

/**
 * 艦種一覧 省略系と含む艦種
 * @static
 * @memberof Const
 */
export const SHIP_TYPES_ALT = [
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
export const SHIP_TYPES_ALT2 = [
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
export const SHIP_TYPES_ALT3 = [
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
export const SHIP_TYPES_FORMAL = [
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

export const JPN = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 49, 50, 51, 52, 53, 54, 56, 59, 60, 62, 66, 71, 72, 74, 75, 76, 77, 85, 86, 90, 94, 97, 100, 101, 103, 104, 109, 111, 115, 117, 119, 120, 123, 126, 127, 130, 132, 136];

export const USA = [65, 69, 83, 84, 87, 91, 93, 95, 99, 102, 105, 106, 107, 110, 114, 116, 118, 121, 122, 125];

export const ITA = [58, 61, 64, 68, 80, 92, 113, 124];

export const GBR = [67, 78, 82, 88, 108, 112, 134, 135];

export const DEU = [47, 48, 55, 57, 63];

export const FRA = [70, 79, 128, 129, 138, 139, 141];

export const RUS = [73, 81, 131];

export const SWE = [89, 140];

export const AUS = [96];

export const NLD = [98];

export const NOR = [133];

export const THA = [137];
