/**
 * 所持装備情報
 * @export
 * @class ItemStock
 */
export default class ItemStock {
  /** 装備id */
  public id = 0;

  /** 改修値別所持数 */
  public num = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  constructor(id: number, remodel = -1) {
    this.id = id;
    if (remodel >= 0 && remodel < this.num.length) {
      this.num[remodel] = 1;
    }
  }

  /**
   * 艦隊分析コードを生成
   * @static
   * @param {ShipStock[]} stocks
   * @returns
   * @memberof ShipStock
   */
  public static createFleetAnalyticsCode(stocks: ItemStock[]): string {
    const itemJSONRows = [];

    if (stocks && stocks.length && stocks.some((v) => v.num.some((x) => x > 0))) {
      for (let i = 0; i < stocks.length; i += 1) {
        const stock = stocks[i];
        for (let remodel = 0; remodel < stock.num.length; remodel += 1) {
          const count = stock.num[remodel];
          for (let j = 0; j < count; j += 1) {
            itemJSONRows.push({ id: stock.id, lv: remodel });
          }
        }
      }
    }

    return JSON.stringify(itemJSONRows);
  }
}
