import { LB_MODE } from './Const';
import Item from './Item';

export interface LandBaseBuilder {
  // eslint-disable-next-line no-use-before-define
  landbase?: LandBase | undefined;
  /** 装備 未指定ならshipの装備で作成 */
  items?: Item[];
  /** 基地お札 */
  mode?: number;
}

export default class LandBase {
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

  constructor(builder: LandBaseBuilder = {}) {
    console.log('LandBase initialize');
    if (builder.landbase) {
      this.items = builder.items !== undefined ? builder.items : builder.landbase.items.concat();
      this.mode = builder.mode !== undefined ? builder.mode : builder.landbase.mode;
    } else {
      this.items = builder.items !== undefined ? builder.items : [];
      this.mode = builder.mode !== undefined ? builder.mode : LB_MODE.WAIT;
    }

    const itemCount = this.items.length;
    if (itemCount < 4) {
      for (let i = 0; i < 4 - itemCount; i += 1) {
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
