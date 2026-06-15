import { AB_MODE, AIR_STATE, DIFFICULTY_LEVEL } from './enums';

/**
 * 基地航空隊札一覧
 * @static
 * @memberof Const
 */
export const AIR_STATUS = [
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
export const AB_MODE_ITEMS = [
  { text: '出撃', value: AB_MODE.BATTLE },
  { text: '防空', value: AB_MODE.DEFENSE },
  { text: '待機', value: AB_MODE.WAIT },
];

/**
 * 戦闘マス形式
 * @static
 * @memberof Const
 */
export const DIFFICULTY_LEVELS = [
  { text: '甲', value: DIFFICULTY_LEVEL.HARD },
  { text: '乙', value: DIFFICULTY_LEVEL.MEDIUM },
  { text: '丙', value: DIFFICULTY_LEVEL.EASY },
  { text: '丁', value: DIFFICULTY_LEVEL.CASUAL },
];

/**
 * ファイル色
 * @static
 * @memberof Const
 */
export const FILE_COLORS = [
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
