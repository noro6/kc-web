import CalcManager from './CalcManager';
import Const from './Const';
import Fleet from './Fleet/Fleet';
import FleetInfo from './Fleet/FleetInfo';
import Item from './Item/Item';
import ItemMaster from './Item/ItemMaster';
import LandBase from './LandBase/LandBase';
import LandBaseInfo from './LandBase/LandBaseInfo';
import Ship from './Fleet/Ship';
import ShipMaster from './Fleet/ShipMaster';

/** デッキビルダー 装備個別 */
interface DeckBuilderItem {
  /** 装備id */
  id: number,
  /** 改修値 */
  rf: number,
  /** 熟練度 */
  mas: number
}

/** デッキビルダー 艦娘 */
interface DeckBuilderShip {
  /** 艦娘id */
  id: string,
  /** 艦娘Level */
  lv: number,
  /** 艦娘運 -1で通常 */
  luck: number,
  /** 装備データ */
  items: { [name: string]: DeckBuilderItem }
}

/** デッキビルダー 基地 */
interface DeckBuilderLandBase {
  /** 待機 出撃 防空 */
  mode: number,
  /** 装備データ */
  items: { [name: string]: DeckBuilderItem }
}

/** デッキビルダー形式 全体 */
interface DeckBuilder {
  version: number,
  hqlv: number,
  f1: { [name: string]: DeckBuilderShip },
  f2: { [name: string]: DeckBuilderShip },
  f3: { [name: string]: DeckBuilderShip },
  f4: { [name: string]: DeckBuilderShip },
  a1: DeckBuilderLandBase,
  a2: DeckBuilderLandBase,
  a3: DeckBuilderLandBase,
}

export default class Convert {
  /** 装備マスタ */
  private readonly itemMasters: ItemMaster[];

  /** 艦船マスタ */
  private readonly shipMasters: ShipMaster[];

  constructor(items: ItemMaster[], ships: ShipMaster[]) {
    this.itemMasters = items;
    this.shipMasters = ships;
  }

  public loadDeckBuilder(text: string): CalcManager {
    try {
      const json = JSON.parse(text) as DeckBuilder;

      // 基地情報の取得生成
      const landBases: LandBase[] = [];
      if (json.a1) {
        landBases.push(this.convertDeckToLandBase(json.a1));
      }
      if (json.a2) {
        landBases.push(this.convertDeckToLandBase(json.a2));
      }
      if (json.a3) {
        landBases.push(this.convertDeckToLandBase(json.a3));
      }

      // 艦娘情報の取得生成 4艦隊分まで取り込む(あれば)
      const fleets: Fleet[] = [];
      if (json.f1) {
        const ships: Ship[] = [];
        Object.keys(json.f1).forEach((key) => ships.push(this.convertDeckToShip(json.f1[key])));
        fleets.push(new Fleet({ ships }));
      }
      if (json.f2) {
        const ships: Ship[] = [];
        Object.keys(json.f2).forEach((key) => ships.push(this.convertDeckToShip(json.f2[key])));
        fleets.push(new Fleet({ ships }));
      }
      if (json.f3) {
        const ships: Ship[] = [];
        Object.keys(json.f3).forEach((key) => ships.push(this.convertDeckToShip(json.f3[key])));
        fleets.push(new Fleet({ ships }));
      }
      if (json.f4) {
        const ships: Ship[] = [];
        Object.keys(json.f4).forEach((key) => ships.push(this.convertDeckToShip(json.f4[key])));
        fleets.push(new Fleet({ ships }));
      }

      const info = new CalcManager();
      info.landBaseInfo = new LandBaseInfo({ landBases });
      info.fleetInfo = new FleetInfo({ fleets, admiralLevel: json.hqlv ? json.hqlv : 120 });
      return info;
    } catch (error) {
      throw new Error('デッキビルダー形式ではありませんでした。');
    }
  }

  /**
   * デッキビルダー基地情報からLandBaseインスタンスの生成を頑張ってみる
   * エラー起きてもそのまま投げます
   * @private
   * @param {DeckBuilderLandBase} a
   * @returns {LandBase}
   * @memberof Convert
   */
  private convertDeckToLandBase(a: DeckBuilderLandBase): LandBase {
    const items: Item[] = [];
    Object.keys(a.items).forEach((key) => {
      const item = a.items[key] || { id: 0, rf: 0, mas: 0 };
      const master = this.itemMasters.find((v) => v.id === item.id) || new ItemMaster();
      const slot = Const.RECONNAISSANCES.includes(master?.apiTypeId) ? 4 : 18;
      items.push(new Item({
        master, remodel: item.rf, level: Const.PROF_LEVEL_BORDER[item.mas], slot,
      }));
    });
    return new LandBase({ mode: a.mode, items });
  }

  /**
   * デッキビルダー基地情報からShipインスタンスの生成を頑張ってみる
   * エラー起きてもそのまま投げます
   * @private
   * @param {DeckBuilderShip} s
   * @returns {LandBase}
   * @memberof Convert
   */
  private convertDeckToShip(s: DeckBuilderShip): Ship {
    const master = this.shipMasters.find((v) => v.id === +s.id) || new ShipMaster();
    const shipLv = s.lv || 99;
    const luck = (s.luck && s.luck) > 0 ? s.luck : master.luck;
    const items: Item[] = [];
    let exItem = new Item();
    Object.keys(s.items).forEach((key, index) => {
      const item = s.items[key] || { id: 0, rf: 0, mas: 0 };
      const itemMaster = this.itemMasters.find((v) => v.id === item.id);
      const level = Const.PROF_LEVEL_BORDER[item.mas];
      if (key === 'ix' || index >= master.slotCount) {
        // ないとは思うがインデックス外のアイテムが複数来た場合は後に来たものが優先
        exItem = new Item({ master: itemMaster, remodel: item.rf, level });
      } else {
        items.push(new Item({
          master: itemMaster, remodel: item.rf, level, slot: master.slots[index],
        }));
      }
    });
    return new Ship({
      master, level: shipLv, luck, items, exItem,
    });
  }
}
