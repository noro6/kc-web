interface ShipImprovement {
  fire: number;
  torpedo: number;
  antiAir: number;
  armor: number;
  luck: number;
  hp: number;
  asw: number;
}

/**
 * 在籍艦娘情報
 * @export
 * @class ShipStock
 */
export default class ShipStock {
  /** 艦娘マスタid */
  public id = 0;

  /** ユニークID 管理用 */
  public uniqueId = 0;

  /** 練度 */
  public level = 1;

  /** 経験値 */
  public exp = 0;

  /** ステータス上昇 */
  public improvement = { hp: 0, asw: 0, luck: 0 } as ShipImprovement;

  /** 補強増設解放 */
  public releaseExpand = false;

  /** 出撃海域札 */
  public area = -1;
}
