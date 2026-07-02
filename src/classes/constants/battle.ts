import { CELL_TYPE, FORMATION, SUPPORT_TYPE } from './enums';
import { AvoidType, Formation } from './types';

/**
 * 陣形一覧
 * @static
 * @memberof Const
 */
export const FORMATIONS: Formation[] = [
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
export const SUPPORTS = [
  { text: '支援射撃', value: SUPPORT_TYPE.SHELLING },
  { text: '航空支援', value: SUPPORT_TYPE.AIRSTRIKE },
  { text: '対潜支援哨戒', value: SUPPORT_TYPE.ANTI_SUBMARINE },
  { text: '支援長距離雷撃', value: SUPPORT_TYPE.LONG_RANGE_TORPEDO },
  { text: '支援不可(要駆逐2)', value: SUPPORT_TYPE.NOT_FOUND_DD },
  { text: '不発', value: SUPPORT_TYPE.NONE },
];

/**
 * 戦闘マス形式
 * @static
 * @memberof Const
 */
export const CELL_TYPES = [
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
 * 対空射撃回避 任意
 * @static
 * @memberof Const
 */
export const MANUAL_AVOID = 99;

/**
 * 対空射撃回避
 * @static
 * @memberof Const
 */
export const AVOID_TYPE: AvoidType[] = [
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
    value: MANUAL_AVOID, text: '任意', c1: 1, c2: 1, c3: 1, c4: 1,
  },
];

/**
 * 対空CI優先度配列
 * 調査お疲れ様です
 * @static
 * @memberof Const
 */
export const ANTI_AIR_CUT_IN_PRIORITIES = [38, 39, 40, 42, 41, 10, 43, 46, 11, 25, 48, 1, 34, 44, 26, 4, 2, 35, 36, 27, 45, 50, 49, 51, 52, 19, 21, 29, 53, 16, 14, 3, 5, 6, 28, 37, 33, 30, 8, 13, 15, 7, 20, 24, 32, 12, 31, 47, 17, 18, 22, 9, 23];

/**
 * 対空CI
 * @static
 * @memberof Const
 */
export const ANTI_AIR_CUTIN = [
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
    id: 10, text: '10種', rateBonus: 1.65, c1: 3, c2: 6, rate: 60, remarks: '摩耶改二 / 飛龍改三',
  },
  {
    id: 11, text: '11種', rateBonus: 1.5, c1: 2, c2: 5, rate: 55, remarks: '摩耶改二 / 飛龍改三',
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
    id: 27, text: '27種', rateBonus: 1.55, c1: 6, c2: 1, rate: 55, remarks: '大淀 / 飛龍改三',
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
    id: 49, text: '49種', rateBonus: 1.5, c1: 6, c2: 1, rate: 50, remarks: '一部吹雪型 / 一部夕雲型',
  },
  {
    id: 50, text: '50種', rateBonus: 1.5, c1: 7, c2: 1, rate: 50, remarks: '一部吹雪型 / 一部夕雲型 / 秋月型',
  },
  {
    id: 51, text: '51種', rateBonus: 1.4, c1: 5, c2: 1, rate: 50, remarks: '一部吹雪型 / 一部夕雲型',
  },
  {
    id: 52, text: '52種', rateBonus: 1.4, c1: 5, c2: 1, rate: 50, remarks: '一部吹雪型 / 一部夕雲型 / 秋月型',
  },
  {
    id: 53, text: '53種', rateBonus: 1.6, c1: 4, c2: 1, rate: 60, remarks: '飛龍改三',
  },
];
