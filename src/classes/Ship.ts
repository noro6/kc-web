import ShipMaster from './ShipMaster';
import Item from './Item';

export default class Ship {
  /** 艦娘マスタ情報 */
  public readonly data: ShipMaster;

  /** 装備一覧 */
  public readonly items: Item[];

  /** 補強増設枠 */
  public readonly exItem: Item;

  /** 防空ボーナス */
  public readonly antiAirBonus: number;

  /** 随伴艦フラグ */
  public readonly isEscort: boolean;

  /** 制空値(搭載数満タン) */
  public readonly fullAirPower: number;

  constructor(ship = new ShipMaster(), items: Item[] = [], exItem = new Item(), isEscort = false) {
    this.data = ship;
    this.items = items;
    this.isEscort = isEscort;
    this.exItem = exItem;

    this.fullAirPower = 0;
    this.antiAirBonus = 0;
    // 計算により算出するステータス
    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      // 装備防空ボーナス
      this.antiAirBonus += item.antiAirBonus;
      if (item.slot > 0 && !item.isRecon) {
        // 通常制空値
        this.fullAirPower += item.airPower;
      }
    }
  }
}
