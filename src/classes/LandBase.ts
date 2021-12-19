import Item from './Item';

export default class LandBase {
  public no = 1;

  public items: Item[] = [];

  public mode = -1;

  /**
   * 航空隊の制空値を返却
   * @readonly
   * @type {number}
   * @memberof LandBase
   */
  get airPower(): number {
    let sum = 0;
    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      const antiAir = item.actualAntiAir + item.bonusAntiAir;
      item.airPower = Math.floor(antiAir * Math.sqrt(item.slot) + item.bonusAirPower);
      sum += item.airPower;
    }
    return sum;
  }

  /**
   * 航空隊の半径を返却
   * @readonly
   * @type {number}
   * @memberof LandBase
   */
  get range(): number {
    let minRange = 999;
    let maxLos = 1;
    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      if (item.data.id) {
        // 最も短い半径
        minRange = item.data.radius < minRange ? item.data.radius : minRange;

        // 偵察機の中でで最も長い半径を取得
        if (item.isRecon) {
          maxLos = maxLos < item.data.radius ? item.data.radius : maxLos;
        }
      }
    }

    if (maxLos < 999 && maxLos > minRange) {
      // 偵察機による半径拡張
      return Math.round(minRange + Math.min(Math.sqrt(maxLos - minRange), 3));
    }
    return minRange === 999 ? 0 : minRange;
  }
}
