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

export default class Const {
  /**
   * 艦載機 or 陸上機
   * @static
   * @memberof public static
   */
  public static PLANE_TYPES = [6, 7, 8, 9, 10, 11, 41, 45, 47, 48, 49, 53, 57];

  /**
   * 艦載機
   * @static
   * @memberof Const
   */
  public static CB_PLANE_TYPES = [6, 7, 8, 9, 57];

  /**
   * 水上機系
   * @static
   * @memberof Const
   */
  public static SP_PLANE_TYPES = [10, 11, 41, 45];

  /**
   * 陸上機系
   * @static
   * @memberof Const
   */
  public static LB_PLANE_TYPES = [47, 48, 49, 53];

  /**
   * 艦戦系
   * @static
   * @memberof Const
   */
  public static FIGHTERS = [6, 45, 48];

  /**
   * 攻撃機系
   * @static
   * @memberof Const
   */
  public static ATTACKERS = [7, 8, 11, 47, 53, 57];

  /**
   * 偵察機
   * @static
   * @memberof Const
   */
  public static RECONNAISSANCES = [9, 10, 41, 49];

  /**
   * 陸上攻撃機系統
   * @static
   * @memberof Const
   */
  public static LB_ATTACKERS = [47, 53];

  /**
   * ロケット戦闘機 api_id 配列
   * @static
   * @memberof Const
   */
  public static ROCKETS = [350, 351, 352];

  public static MODE_WAIT = -1

  public static MODE_DEFENSE = 0

  public static MODE_BATTLE = 2

  /**
   * 基地航空隊札一覧
   * @static
   * @memberof Const
   */
  public static LANDBASE_MODES = [
    { text: '出撃', value: Const.MODE_BATTLE },
    { text: '防空', value: Const.MODE_DEFENSE },
    { text: '待機', value: Const.MODE_WAIT },
  ];

  public static LINE_AHEAD = 1;

  public static DOUBLE_LINE = 2;

  public static DIAMOND = 3;

  public static ECHELON = 4;

  public static LINE_ABREAST = 5;

  public static VANGUARD = 6;

  public static FORMATION1 = 15;

  public static FORMATION2 = 12;

  public static FORMATION3 = 13;

  public static FORMATION4 = 11;

  public static API_SHIP_TYPE = [
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

  public static SHIP_TYPES_ALT = [
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
  public static FORMATIONS: Formation[] = [
    { text: '単縦陣', value: Const.LINE_AHEAD, correction: 1.0 },
    { text: '複縦陣', value: Const.DOUBLE_LINE, correction: 1.2 },
    { text: '輪形陣', value: Const.DIAMOND, correction: 1.6 },
    { text: '梯形陣', value: Const.ECHELON, correction: 1.0 },
    { text: '単横陣', value: Const.LINE_ABREAST, correction: 1.0 },
    { text: '警戒陣', value: Const.VANGUARD, correction: 1.1 },
    { text: '第一警戒', value: Const.FORMATION1, correction: 1.1 },
    { text: '第二警戒', value: Const.FORMATION2, correction: 1.0 },
    { text: '第三警戒', value: Const.FORMATION3, correction: 1.5 },
    { text: '第四警戒', value: Const.FORMATION4, correction: 1.0 },
  ];

  public static CELL_NORMAL = 1;

  public static CELL_GRAND = 2;

  public static CELL_AIR_RAID = 3;

  public static CELL_NIGHT = 4;

  public static CELL_HIGH_AIR_RAID = 5;

  public static CELL_AERIAL_COMBAT = 6;

  /**
   * 戦闘マス形式
   * @static
   * @memberof Const
   */
  public static CELL_TYPES = [
    { text: '通常', value: Const.CELL_NORMAL },
    { text: '連合', value: Const.CELL_GRAND },
    { text: '空襲', value: Const.CELL_AIR_RAID },
    { text: '夜戦', value: Const.CELL_NIGHT },
    { text: '重爆', value: Const.CELL_HIGH_AIR_RAID },
    { text: '航空戦', value: Const.CELL_AERIAL_COMBAT },
  ];

  /**
   * 対空射撃回避 任意
   * @static
   * @memberof Const
   */
  public static MANUAL_AVOID = 99;

  /**
   * 対空射撃回避
   * @static
   * @memberof Const
   */
  public static AVOID_TYPE: AvoidType[] = [
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

  /** 補強増設を識別するindex */
  public static EXPAND_SLOT_INDEX = 99;
}
