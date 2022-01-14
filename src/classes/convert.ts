import CalcManager from './calcManager';
import Const from './const';
import Fleet from './fleet/fleet';
import FleetInfo from './fleet/fleetInfo';
import Item from './item/item';
import ItemMaster from './item/itemMaster';
import Airbase from './airbase/airbase';
import AirbaseInfo from './airbase/airbaseInfo';
import Ship from './fleet/ship';
import ShipMaster from './fleet/shipMaster';
import ItemStock from './item/itemStock';
import ShipStock from './fleet/shipStock';

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
interface DeckBuilderAirbase {
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
  a1: DeckBuilderAirbase,
  a2: DeckBuilderAirbase,
  a3: DeckBuilderAirbase,
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

  /**
   * 通常デッキビルダー形式データを読み込み、計算データへと変換
   * @param {string} text
   * @returns {CalcManager}
   * @memberof Convert
   */
  public loadDeckBuilder(text: string): CalcManager | undefined {
    try {
      const json = JSON.parse(text) as DeckBuilder;

      // 基地情報の取得生成
      const airbases: Airbase[] = [];
      if (json.a1) {
        airbases.push(this.convertDeckToAirbase(json.a1));
      }
      if (json.a2) {
        airbases.push(this.convertDeckToAirbase(json.a2));
      }
      if (json.a3) {
        airbases.push(this.convertDeckToAirbase(json.a3));
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

      if (!airbases.length && !fleets.length) {
        return undefined;
      }

      const info = new CalcManager();
      info.airbaseInfo = new AirbaseInfo({ airbases });
      info.fleetInfo = new FleetInfo({ fleets, admiralLevel: json.hqlv ? json.hqlv : 120 });
      return info;
    } catch (error) {
      console.error(error);
      throw new Error('デッキビルダー形式ではありませんでした。');
    }
  }

  /**
   * デッキビルダー基地情報からAirbaseインスタンスの生成を頑張ってみる
   * エラー起きてもそのまま投げます
   * @private
   * @param {DeckBuilderAirbase} a
   * @returns {Airbase}
   * @memberof Convert
   */
  private convertDeckToAirbase(a: DeckBuilderAirbase): Airbase {
    const items: Item[] = [];
    Object.keys(a.items).forEach((key) => {
      const item = a.items[key] || { id: 0, rf: 0, mas: 0 };
      const master = this.itemMasters.find((v) => v.id === item.id) || new ItemMaster();
      const slot = Const.RECONNAISSANCES.includes(master?.apiTypeId) ? 4 : 18;
      items.push(new Item({
        master, remodel: item.rf, level: Const.PROF_LEVEL_BORDER[item.mas], slot,
      }));
    });
    return new Airbase({ mode: a.mode, items });
  }

  /**
   * デッキビルダー基地情報からShipインスタンスの生成を頑張ってみる
   * エラー起きてもそのまま投げます
   * @private
   * @param {DeckBuilderShip} s
   * @returns {Airbase}
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

  /**
   * 所持装備情報JSONデータを解析して所持数配列を返却
   * @static
   * @param {string} text
   * @returns {ItemStock[]}
   * @memberof Convert
   */
  public static readItemStockJson(text: string): ItemStock[] {
    type stockJson = { 'api_slotitem_id': number, 'api_level': number };
    type stockJson2 = { 'id': number, 'lv': number };

    try {
      const json = JSON.parse(text) as (stockJson | stockJson2)[];
      if (!json.length) {
        return [];
      }
      const itemList: ItemStock[] = [];
      for (let i = 0; i < json.length; i += 1) {
        const data = json[i];
        if ('api_slotitem_id' in data && 'api_level' in data) {
          const id = data.api_slotitem_id;
          const remodel = data.api_level;
          const itemStock = itemList.find((v) => v.id === id);
          if (itemStock) {
            itemStock.num[remodel] += 1;
          } else {
            itemList.push(new ItemStock(id, remodel));
          }
        } else if ('id' in data && 'lv' in data) {
          const { id } = data;
          const remodel = data.lv;
          const itemStock = itemList.find((v) => v.id === id);
          if (itemStock) {
            itemStock.num[remodel] += 1;
          } else {
            itemList.push(new ItemStock(id, remodel));
          }
        }
      }
      return itemList;
    } catch (error) {
      throw new Error('装備所持数情報ではありませんでした。');
    }
  }

  /**
   * 在籍艦娘情報JSONデータを解析して在籍情報配列を返却
   * @static
   * @param {string} text
   * @returns {ShipStock[]}
   * @memberof Convert
   */
  public static readShipStockJson(text: string): ShipStock[] {
    type stockJson = { 'api_ship_id': number, 'api_lv': number, 'api_exp': number[], 'api_kyouka': number[], 'api_slot_ex': number, 'api_sally_area': number };
    type stockJson2 = { 'id': number, 'lv': number, 'exp': number[], 'st': number[], 'ex': number, 'area': number };

    try {
      const json = JSON.parse(text) as (stockJson | stockJson2)[];
      if (!json.length) {
        return [];
      }

      const shipList: ShipStock[] = [];
      let uniqueId = 1;
      for (let i = 0; i < json.length; i += 1) {
        const data = json[i];
        const shipStock = new ShipStock();

        // 基本の情報 どちらかに入らなければ飛ばす
        if ('api_ship_id' in data && 'api_lv' in data && 'api_exp') {
          shipStock.id = +data.api_ship_id;
          shipStock.level = +data.api_lv;
          // 参考：経験値 [0]=累積, [1]=次のレベルまで, [2]=経験値バー割合
          shipStock.exp = +data.api_exp[0];
        } else if ('id' in data && 'lv' in data && 'exp' in data) {
          shipStock.id = +data.id;
          shipStock.level = +data.lv;
          shipStock.exp = +data.exp[0];
        } else {
          // 判別不能！次！
          continue;
        }

        // 被りなしid付与
        shipStock.uniqueId = uniqueId;
        uniqueId += 1;

        // 拡張情報 -補強増設解放
        if ('api_slot_ex' in data) {
          shipStock.releaseExpand = data.api_slot_ex > 0;
        } else if ('ex' in data) {
          shipStock.releaseExpand = data.ex > 0;
        }

        // 拡張情報 -補強増設解放
        // 参考：近代化改修状態 [0]=火力, [1]=雷装, [2]=対空, [3]=装甲, [4]=運, [5]=耐久, [6]=対潜
        if ('api_kyouka' in data && data.api_kyouka.length >= 7) {
          shipStock.improvement.fire = +data.api_kyouka[0];
          shipStock.improvement.torpedo = +data.api_kyouka[1];
          shipStock.improvement.antiAir = +data.api_kyouka[2];
          shipStock.improvement.armor = +data.api_kyouka[3];
          shipStock.improvement.luck = +data.api_kyouka[4];
          shipStock.improvement.hp = +data.api_kyouka[5];
          shipStock.improvement.asw = +data.api_kyouka[6];
        } else if ('st' in data && data.st.length >= 7) {
          shipStock.improvement.fire = +data.st[0];
          shipStock.improvement.torpedo = +data.st[1];
          shipStock.improvement.antiAir = +data.st[2];
          shipStock.improvement.armor = +data.st[3];
          shipStock.improvement.luck = +data.st[4];
          shipStock.improvement.hp = +data.st[5];
          shipStock.improvement.asw = +data.st[6];
        }

        // 拡張情報 -出撃海域札
        if ('api_sally_area' in data) {
          shipStock.area = data.api_sally_area;
        } else if ('area' in data) {
          shipStock.area = data.area;
        }

        // 晴れてようやく追加
        shipList.push(shipStock);
      }
      return shipList;
    } catch (error) {
      throw new Error('艦娘在籍数情報ではありませんでした。');
    }
  }
}
