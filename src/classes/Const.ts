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

  /**
   * 基地航空隊札一覧
   * @static
   * @memberof Const
   */
  public static LANDBASE_MODES = [
    { text: '出撃', value: 2 },
    { text: '防空', value: 0 },
    { text: '待機', value: -1 },
  ];

  public static MODE_WAIT = -1

  public static MODE_DEFENSE = 0

  public static MODE_BATTLE = 2
}
