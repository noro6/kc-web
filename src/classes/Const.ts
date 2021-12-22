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

/** 基地札種類 */
export const LB_MODE = {
  WAIT: -1,
  DEFFENSE: 0,
  BATTLE: 2,
} as const;
type LB_MODE = typeof LB_MODE[keyof typeof LB_MODE];

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

export default class Const {
  /**
   * 基地航空隊札一覧
   * @static
   * @memberof Const
   */
  public static readonly LB_MODE_ITEMS = [
    { text: '出撃', value: LB_MODE.BATTLE },
    { text: '防空', value: LB_MODE.DEFFENSE },
    { text: '待機', value: LB_MODE.WAIT },
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
  public static readonly API_SHIP_TYPE = [
    { id: 1, name: '海防艦' },
    { id: 2, name: '駆逐艦' },
    { id: 3, name: '軽巡洋艦' },
    { id: 4, name: '重雷装巡洋艦' },
    { id: 5, name: '重巡洋艦' },
    { id: 6, name: '航空巡洋艦' },
    { id: 7, name: '軽空母' },
    { id: 8, name: '高速戦艦' },
    { id: 9, name: '戦艦' },
    { id: 10, name: '航空戦艦' },
    { id: 11, name: '正規空母' },
    { id: 12, name: '超弩級戦艦' },
    { id: 13, name: '潜水艦' },
    { id: 14, name: '潜水空母' },
    { id: 15, name: '補給艦' },
    { id: 16, name: '水上機母艦' },
    { id: 17, name: '揚陸艦' },
    { id: 18, name: '装甲空母' },
    { id: 19, name: '工作艦' },
    { id: 20, name: '潜水母艦' },
    { id: 21, name: '練習巡洋艦' },
    { id: 22, name: '補給艦' },
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
}
