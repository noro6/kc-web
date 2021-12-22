import ShipMaster from './ShipMaster';
import Item from './Item';

export interface ShipBuilder {
  // eslint-disable-next-line no-use-before-define
  ship?: Ship | undefined;
  /** 装備マスタ情報 未指定ならship内のdataで作成 */
  master?: ShipMaster;
  /** 装備 未指定ならshipの装備で作成 */
  items?: Item[];
  /** 補強増設 未指定ならshipの補強増設で作成 */
  exItem?: Item;
  /** 練度 未指定ならshipの練度で作成 */
  level?: number;
  /** 随伴艦フラグ */
  isEscort?: boolean;
}

export default class Ship {
  /** 艦娘マスタ情報 */
  public readonly data: ShipMaster;

  /** 装備一覧 */
  public readonly items: Item[];

  /** 補強増設枠 */
  public readonly exItem: Item;

  /** 練度 */
  public readonly level: number;

  /** 防空ボーナス */
  public readonly antiAirBonus: number;

  /** 随伴艦フラグ */
  public readonly isEscort: boolean;

  /** 制空値(搭載数満タン) */
  public readonly fullAirPower: number;

  constructor(builder: ShipBuilder = {}) {
    console.log('Ship initialize');
    if (builder.ship) {
      this.data = builder.master !== undefined ? builder.master : builder.ship.data;
      this.level = builder.level !== undefined ? builder.level : builder.ship.level;
      this.isEscort = builder.isEscort !== undefined ? builder.isEscort : builder.ship.isEscort;
      this.exItem = builder.exItem !== undefined ? builder.exItem : builder.ship.exItem;
      this.items = builder.items !== undefined ? builder.items.concat() : builder.ship.items.concat();
    } else {
      this.data = builder.master !== undefined ? builder.master : new ShipMaster();
      this.level = builder.level !== undefined ? builder.level : 99;
      this.isEscort = builder.isEscort !== undefined ? builder.isEscort : false;
      this.exItem = builder.exItem !== undefined ? builder.exItem : new Item();
      this.items = builder.items !== undefined ? builder.items.concat() : [];
    }

    // 装備が空だったらマスタのスロット数だけ作成
    if (this.items.length === 0) {
      for (let i = 0; i < this.data.slotCount; i += 1) {
        this.items.push(new Item({ slot: this.data.slots[i] }));
      }
    }
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
