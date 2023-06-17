import Const from '../const';

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
  public area = 0;

  /**
   * 艦隊分析コードを生成
   * @static
   * @param {ShipStock[]} stocks
   * @returns
   * @memberof ShipStock
   */
  public static createFleetAnalyticsCode(stocks: ShipStock[]): string {
    const shipJSONRows = [];

    if (stocks && stocks.length) {
      for (let i = 0; i < stocks.length; i += 1) {
        const stock = stocks[i];
        const nextLvObj = Const.LEVEL_BORDERS.find((v) => v.lv === stock.level + 1);
        const nextExp = nextLvObj ? nextLvObj.req - stock.exp : 0;
        const data = {
          id: stock.id,
          lv: stock.level,
          st: [
            stock.improvement.fire ? stock.improvement.fire : 0,
            stock.improvement.torpedo ? stock.improvement.torpedo : 0,
            stock.improvement.antiAir ? stock.improvement.antiAir : 0,
            stock.improvement.armor ? stock.improvement.armor : 0,
            stock.improvement.luck ? stock.improvement.luck : 0,
            stock.improvement.hp ? stock.improvement.hp : 0,
            stock.improvement.asw ? stock.improvement.asw : 0,
          ],
          exp: [stock.exp, nextExp, 0],
          area: stock.area,
          ex: stock.releaseExpand ? 1 : 0,
        };
        shipJSONRows.push(data);
      }
    }

    return JSON.stringify(shipJSONRows);
  }
}
