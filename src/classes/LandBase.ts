import { LB_MODE } from './Const';
import Item from './Item';

export default class LandBase {
  /** 第X基地航空隊 ここを変えてもステータスには影響しないので not readonly */
  public no: number;

  /** 装備一覧 */
  public readonly items: Item[];

  /** 基地お札 */
  public readonly mode: number;

  /** 基地半径 */
  public readonly range: number;

  /** 出撃制空値 */
  public readonly airPower: number;

  /** 防空制空値 */
  public readonly defenseAirPower: number;

  constructor(no: number, mode:number = LB_MODE.WAIT, item: Item[] = []) {
    console.log('LandBase initialize');
    this.no = no;
    this.items = item.concat();
    this.mode = mode;

    if (!this.items.length) {
      for (let i = 0; i < 4; i += 1) {
        // 第4隊まで自動生成
        this.items.push(new Item());
      }
    }

    // 半径取得
    this.range = this.getRange();

    // 制空値
    this.airPower = 0;
    this.defenseAirPower = 0;
    for (let i = 0; i < this.items.length; i += 1) {
      this.airPower += this.items[i].airPower;
      this.defenseAirPower += this.items[i].defenseAirPower;
    }
  }

  /**
   * 航空隊の半径を返却
   * @readonly
   * @type {number}
   * @memberof LandBase
   */
  private getRange(): number {
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
