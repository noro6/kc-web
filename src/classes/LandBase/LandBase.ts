import AirCalcResult from '../AirCalcResult';
import { LB_MODE } from '../Const';
import Item from '../Item/Item';

export interface LandBaseBuilder {
  // eslint-disable-next-line no-use-before-define
  landbase?: LandBase | undefined;
  /** 装備 未指定ならshipの装備で作成 */
  items?: Item[];
  /** 基地お札 */
  mode?: number;
  /** 基地出撃戦闘番号 */
  battleTarget?: number[];
}

export default class LandBase {
  /** 装備一覧 */
  public readonly items: Item[];

  /** 基地お札 */
  public readonly mode: number;

  /** 出撃戦闘 1波 2波 */
  public readonly battleTarget: number[];

  /** 基地半径 */
  public readonly range: number;

  /** 出撃制空値 */
  public readonly airPower: number;

  /** 防空制空値 */
  public readonly defenseAirPower: number;

  /** ロケット戦闘機の数 */
  public readonly rocketCount: number

  /** 計算結果の各制空状態の割合 */
  public resultWave1 = new AirCalcResult();

  /** 計算結果の各制空状態の割合 */
  public resultWave2 = new AirCalcResult();

  constructor(builder: LandBaseBuilder = {}) {
    console.log('LandBase initialize');
    if (builder.landbase) {
      this.items = builder.items !== undefined ? builder.items : builder.landbase.items.concat();
      this.mode = builder.mode !== undefined ? builder.mode : builder.landbase.mode;
      this.battleTarget = builder.battleTarget !== undefined ? builder.battleTarget : builder.landbase.battleTarget;
    } else {
      this.items = builder.items !== undefined ? builder.items : [];
      this.mode = builder.mode !== undefined ? builder.mode : LB_MODE.WAIT;
      this.battleTarget = builder.battleTarget !== undefined ? builder.battleTarget : [0, 0];
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

    // 制空値とか
    this.airPower = 0;
    this.defenseAirPower = 0;
    this.rocketCount = 0;
    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      this.airPower += item.airPower;
      this.defenseAirPower += item.defenseAirPower;
      if (item.isRocket) {
        this.rocketCount += 1;
      }
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
