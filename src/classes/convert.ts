import CalcManager from './calcManager';
import Const, { CELL_TYPE, FORMATION } from './const';
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
import CommonCalc from './commonCalc';
import SaveData from './saveData/saveData';
import LZStringMod from './lz-string-mod';
import OldItem from './item/oldItem';
import OldShip from './fleet/oldShip';
import BattleInfo from './enemy/battleInfo';
import EnemyMaster from './enemy/enemyMaster';
import Enemy from './enemy/enemy';
import EnemyFleet from './enemy/enemyFleet';

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
  id: number,
  /** 艦娘Level */
  lv: number,
  /** 艦娘運 -1で通常 */
  luck: number,
  /** 耐久 */
  hp?: number;
  /** 火力 */
  fp?: number;
  /** 雷装 */
  tp?: number;
  /** 対空 */
  aa?: number;
  /** 装甲 */
  ar?: number;
  /** 対潜 */
  asw?: number;
  /** 回避 */
  ev?: number;
  /** 索敵 */
  los?: number;
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
  f1?: { [name: string]: DeckBuilderShip },
  f2?: { [name: string]: DeckBuilderShip },
  f3?: { [name: string]: DeckBuilderShip },
  f4?: { [name: string]: DeckBuilderShip },
  a1?: DeckBuilderAirbase,
  a2?: DeckBuilderAirbase,
  a3?: DeckBuilderAirbase,
}

type shipStockJson = { 'api_ship_id': number, 'api_lv': number, 'api_exp': number[], 'api_kyouka': number[], 'api_slot_ex': number, 'api_sally_area': number };
type shipStockJson2 = { 'id': number, 'lv': number, 'exp': number[], 'st': number[], 'ex': number, 'area': number };
type itemStockJson = { 'api_slotitem_id': number, 'api_level': number };
type itemStockJson2 = { 'id': number, 'lv': number };

type oldShipStockSt = { 'id': number, 'lv': number, 'exp': number, 'st': number[], 'ex': number, 'area': number };

export interface OldShipStockJson {
  id: number, details: oldShipStockSt[]
}

export default class Convert {
  /** 装備マスタ */
  private readonly itemMasters: ItemMaster[];

  /** 艦船マスタ */
  private readonly shipMasters: ShipMaster[];

  /** 艦船マスタ */
  private readonly enemyMasters: EnemyMaster[];

  constructor(items: ItemMaster[], ships: ShipMaster[], enemies: EnemyMaster[] = []) {
    this.itemMasters = items;
    this.shipMasters = ships;
    this.enemyMasters = enemies;
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

      if (!(json.a1 || json.a2 || json.a3 || json.f1 || json.f2 || json.f3 || json.f4)) {
        return undefined;
      }

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
        const fleet = json.f1;
        const ships: Ship[] = [];
        Object.keys(fleet).forEach((key) => ships.push(this.convertDeckToShip(fleet[key])));
        const sub = 6 - ships.length;
        for (let i = 0; i < sub; i += 1) {
          ships.push(new Ship());
        }
        fleets.push(new Fleet({ ships }));
      } else {
        fleets.push(new Fleet());
      }

      if (json.f2) {
        const fleet = json.f2;
        const ships: Ship[] = [];
        Object.keys(fleet).forEach((key) => ships.push(this.convertDeckToShip(fleet[key])));
        fleets.push(new Fleet({ ships }));
      } else {
        fleets.push(new Fleet());
      }
      if (json.f3) {
        const ships: Ship[] = [];
        const fleet = json.f3;
        Object.keys(fleet).forEach((key) => ships.push(this.convertDeckToShip(fleet[key])));
        fleets.push(new Fleet({ ships }));
      } else {
        fleets.push(new Fleet());
      }
      if (json.f4) {
        const fleet = json.f4;
        const ships: Ship[] = [];
        Object.keys(fleet).forEach((key) => ships.push(this.convertDeckToShip(fleet[key])));
        fleets.push(new Fleet({ ships }));
      } else {
        fleets.push(new Fleet());
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
    for (let i = 1; i <= 4; i += 1) {
      const key = `i${i}`;
      const item = a.items[key] || { id: 0, rf: 0, mas: 0 };
      const master = this.itemMasters.find((v) => v.id === item.id) || new ItemMaster();
      let slot = 18;
      if (Const.RECONNAISSANCES.includes(master?.apiTypeId)) {
        slot = 4;
      } else if (Const.AB_ATTACKERS_LARGE.includes(master?.apiTypeId)) {
        slot = 9;
      }
      items.push(new Item({
        master, remodel: item.rf, level: Const.PROF_LEVEL_BORDER[item.mas], slot,
      }));
    }
    return new Airbase({ mode: a.mode, items });
  }

  /**
   * デッキビルダー艦娘情報からShipインスタンスの生成を頑張ってみる
   * エラー起きてもそのまま投げます
   * @private
   * @param {DeckBuilderShip} s
   * @returns {Airbase}
   * @memberof Convert
   */
  private convertDeckToShip(s: DeckBuilderShip): Ship {
    const master = this.shipMasters.find((v) => v.id === +s.id) || new ShipMaster();
    const shipLv = s.lv || 99;
    const luck = (s.luck && s.luck > 0) ? s.luck : master.luck;
    const baseHP = (shipLv > 99 ? master.hp2 : master.hp);
    const hp = (s.hp && s.hp > 0) ? s.hp : baseHP;
    const asw = (s.asw && s.asw > 0) ? s.asw : Ship.getStatusFromLevel(shipLv, master.maxAsw, master.minAsw);
    const items: Item[] = [];
    let exItem = new Item();

    for (let i = 0; i < master.slotCount; i += 1) {
      const key = `i${i + 1}`;
      const item = s.items[key] || { id: 0, rf: 0, mas: 0 };
      const itemMaster = this.itemMasters.find((v) => v.id === item.id);
      const level = Const.PROF_LEVEL_BORDER[item.mas];
      if (itemMaster && itemMaster.apiTypeId === 41 && master.type2 === 90) {
        // 日進 & 大型飛行艇
        items.push(new Item({
          master: itemMaster, remodel: item.rf, level, slot: 1,
        }));
      } else {
        items.push(new Item({
          master: itemMaster, remodel: item.rf, level, slot: master.slots[i],
        }));
      }
    }

    // 補強増設 keyがixか、装備スロットインデックス+1を検索
    if (Object.keys(s.items).includes('ix') || Object.keys(s.items).includes(`i${master.slotCount + 1}`)) {
      const item = s.items.ix || s.items[`i${master.slotCount + 1}`] || { id: 0, rf: 0, mas: 0 };
      const itemMaster = this.itemMasters.find((v) => v.id === item.id);
      const level = Const.PROF_LEVEL_BORDER[item.mas];
      exItem = new Item({ master: itemMaster, remodel: item.rf, level });
    }

    return new Ship({
      master, level: shipLv, luck, items, exItem, asw, hp,
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
    if (!text) {
      return [];
    }
    const json = JSON.parse(text) as (itemStockJson | itemStockJson2)[];
    if (!json.length) {
      return [];
    }
    const itemList: ItemStock[] = [];
    for (let i = 0; i < json.length; i += 1) {
      const data = json[i];
      if ('api_slotitem_id' in data && 'api_level' in data) {
        const id = data.api_slotitem_id;
        const remodel = Math.min(data.api_level, 10);
        const itemStock = itemList.find((v) => v.id === id);
        if (itemStock) {
          itemStock.num[remodel] += 1;
        } else {
          itemList.push(new ItemStock(id, remodel));
        }
      } else if ('id' in data && 'lv' in data) {
        const { id } = data;
        const remodel = Math.min(data.lv, 10);
        const itemStock = itemList.find((v) => v.id === id);
        if (itemStock) {
          itemStock.num[remodel] += 1;
        } else {
          itemList.push(new ItemStock(id, remodel));
        }
      }
    }
    return itemList;
  }

  /**
   * 在籍艦娘情報JSONデータを解析して在籍情報配列を返却
   * @static
   * @param {string} text
   * @returns {ShipStock[]}
   * @memberof Convert
   */
  public static readShipStockJson(text: string): ShipStock[] {
    if (!text) {
      return [];
    }
    const json = JSON.parse(text) as (shipStockJson | shipStockJson2)[];
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

      if (!shipStock.id) {
        // なんかデータおかしいので次
        continue;
      }

      // 被りなしid付与
      shipStock.uniqueId = uniqueId;
      uniqueId += 1;

      // 拡張情報 -補強増設解放
      if ('api_slot_ex' in data) {
        shipStock.releaseExpand = data.api_slot_ex !== undefined && data.api_slot_ex !== 0;
      } else if ('ex' in data) {
        shipStock.releaseExpand = data.ex !== undefined && data.ex !== 0;
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

      // エラーチェック & 修正
      if (!shipStock.level) shipStock.level = 1;
      if (!shipStock.exp) shipStock.exp = 0;
      if (!shipStock.improvement.fire) shipStock.improvement.fire = 0;
      if (!shipStock.improvement.torpedo) shipStock.improvement.torpedo = 0;
      if (!shipStock.improvement.antiAir) shipStock.improvement.antiAir = 0;
      if (!shipStock.improvement.armor) shipStock.improvement.armor = 0;
      if (!shipStock.improvement.luck) shipStock.improvement.luck = 0;
      if (!shipStock.improvement.hp) shipStock.improvement.hp = 0;
      if (!shipStock.improvement.asw) shipStock.improvement.asw = 0;
      if (!shipStock.area) shipStock.area = 0;

      // 晴れてようやく追加
      shipList.push(shipStock);
    }
    return shipList;
  }

  /**
   * 計算データからデッキビルダー形式データを生成 文字列化
   * @static
   * @param {CalcManager} manager
   * @returns {string}
   * @memberof Convert
   */
  public static createDeckBuilderToString(manager: CalcManager): string {
    return JSON.stringify(Convert.createDeckBuilder(manager));
  }

  /**
   * DeckBuilderオブジェクトそのままで返却
   * @static
   * @param {CalcManager} manager
   * @param {boolean} [includeStatus=false]
   * @return {*}  {DeckBuilder}
   * @memberof Convert
   */
  public static createDeckBuilder(manager: CalcManager, includeStatus = false): DeckBuilder {
    const deckBuilder = {
      version: 4, hqlv: manager.fleetInfo.admiralLevel, f1: {}, f2: {}, f3: {}, f4: {},
    } as DeckBuilder;
    try {
      // 艦隊データ
      const { fleets } = manager.fleetInfo;
      for (let i = 0; i < fleets.length; i += 1) {
        const ships = fleets[i].ships.filter((v) => v.isActive && !v.isEmpty);
        if (i === 0) {
          deckBuilder.f1 = {};
          Convert.setDeckBuilderFleet(deckBuilder.f1, ships, includeStatus);
        }
        if (i === 1) {
          deckBuilder.f2 = {};
          Convert.setDeckBuilderFleet(deckBuilder.f2, ships, includeStatus);
        }
        if (i === 2) {
          deckBuilder.f3 = {};
          Convert.setDeckBuilderFleet(deckBuilder.f3, ships, includeStatus);
        }
        if (i === 3) {
          deckBuilder.f4 = {};
          Convert.setDeckBuilderFleet(deckBuilder.f4, ships, includeStatus);
        }
      }

      // 基地データ
      const { airbases } = manager.airbaseInfo;
      for (let i = 0; i < airbases.length; i += 1) {
        const airbase = airbases[i];
        if (i === 0) {
          const items = Convert.getDeckBuilderItems(airbase.items);
          deckBuilder.a1 = { mode: airbase.mode, items };
        }
        if (i === 1) {
          const items = Convert.getDeckBuilderItems(airbase.items);
          deckBuilder.a2 = { mode: airbase.mode, items };
        }
        if (i === 2) {
          const items = Convert.getDeckBuilderItems(airbase.items);
          deckBuilder.a3 = { mode: airbase.mode, items };
        }
      }

      return deckBuilder;
    } catch (error) {
      console.error(error);
      return deckBuilder;
    }
  }

  /**
   * デッキビルダー形式艦隊セット
   * @private
   * @static
   * @param {{ [name: string]: DeckBuilderShip }} fleet
   * @param {Ship[]} ships
   * @param {boolean} [includeStatus=false]
   * @memberof Convert
   */
  private static setDeckBuilderFleet(fleet: { [name: string]: DeckBuilderShip }, ships: Ship[], includeStatus = false): void {
    for (let i = 0; i < ships.length; i += 1) {
      const ship = ships[i];
      const items = Convert.getDeckBuilderItems(ship.items);
      if (ship.exItem.data.id) {
        const level = CommonCalc.getProfLevel(ship.exItem.level);
        items.ix = { id: ship.exItem.data.id, mas: level, rf: ship.exItem.remodel };
      }

      // 装備上昇ステータス
      let sumFP = 0;
      let sumTP = 0;
      let sumAA = 0;
      let sumAR = 0;
      let sumEV = 0;
      let sumLos = 0;
      const allItems = ship.items.concat(ship.exItem);
      for (let j = 0; j < allItems.length; j += 1) {
        const item = allItems[j];
        sumFP += item.data.fire;
        sumTP += item.data.torpedo;
        sumAA += item.data.antiAir;
        sumAR += item.data.armor;
        sumEV += item.data.avoid;
        sumLos += item.data.scout;
      }

      const data: DeckBuilderShip = {
        id: ship.data.id,
        lv: ship.level,
        hp: ship.hp,
        luck: ship.luck,
        items,
      };

      // ステータスを含める場合
      if (includeStatus) {
        const los = Ship.getStatusFromLevel(ship.level, ship.data.maxScout, ship.data.minScout);
        const ev = Ship.getStatusFromLevel(ship.level, ship.data.maxAvoid, ship.data.minAvoid);
        data.fp = ship.data.fire + sumFP;
        data.tp = ship.data.torpedo + sumTP;
        data.aa = ship.antiAir + sumAA;
        data.ar = ship.data.armor + sumAR;
        data.asw = ship.actualAsw;
        data.los = los + ship.bonusScout + sumLos;
        data.ev = ev + sumEV;
      }

      fleet[`s${i + 1}`] = data;
    }
  }

  /**
   * デッキビルダー形式装備オブジェクトを返却
   * @private
   * @static
   * @param {Item[]} items
   * @returns {{ [name: string]: DeckBuilderItem }}
   * @memberof Convert
   */
  private static getDeckBuilderItems(items: Item[]): { [name: string]: DeckBuilderItem } {
    const deckItem: { [name: string]: DeckBuilderItem } = {};
    for (let j = 0; j < items.length; j += 1) {
      const item = items[j];
      if (!item.data.id) {
        continue;
      }
      deckItem[`i${j + 1}`] = { id: item.data.id, mas: CommonCalc.getProfLevel(item.level), rf: item.remodel };
    }

    return deckItem;
  }

  /**
   * 作戦室用デッキビルダー変換
   * @static
   * @param {string} name
   * @param {CalcManager} manager
   * @returns {string}
   * @memberof Convert
   */
  public static createDeckBuilderForJervis(name: string, manager: CalcManager): string {
    type JervisItem = {
      masterId: number,
      improvement: number,
      proficiency: number,
    };

    type JervisShip = {
      masterId: number,
      level: number,
      slots: [],
      increased: { luck: number },
      equipments: JervisItem[]
    };

    type JervisAirbase = {
      slots: [],
      equipments: JervisItem[]
    };

    const json = {
      version: 1,
      name,
      hqLevel: manager.fleetInfo.admiralLevel,
      side: 'Player',
      fleetType: manager.fleetInfo.isUnion ? 'CarrierTaskForce' : 'Single',
      fleets: [
        { ships: [] as JervisShip[] },
        { ships: [] as JervisShip[] },
        { ships: [] as JervisShip[] },
        { ships: [] as JervisShip[] },
      ],
      landBase: [] as JervisAirbase[],
    };

    // 艦隊データ
    const { fleets } = manager.fleetInfo;
    for (let i = 0; i < fleets.length; i += 1) {
      const ships = fleets[i].ships.filter((v) => v.isActive && !v.isEmpty);
      for (let j = 0; j < ships.length; j += 1) {
        const ship = ships[j];
        const { items } = ship;
        const equipments = [] as JervisItem[];
        for (let k = 0; k < items.length; k += 1) {
          const item = items[k];
          equipments.push({ masterId: item.data.id, improvement: item.remodel, proficiency: item.level } as JervisItem);
        }
        // 補強増設
        equipments.push({ masterId: ship.exItem.data.id, improvement: ship.exItem.remodel, proficiency: ship.exItem.level } as JervisItem);

        const jervisShip = {
          masterId: ship.data.id,
          level: ship.level,
          slots: items.map((v) => v.fullSlot),
          increased: { luck: ship.luck - ship.data.luck },
          equipments,
        } as JervisShip;
        json.fleets[i].ships.push(jervisShip);
      }
    }

    // 基地データ
    const { airbases } = manager.airbaseInfo;
    for (let i = 0; i < airbases.length; i += 1) {
      const items = airbases[i].items.filter((v) => v.data.id > 0);
      const equipments = [] as JervisItem[];
      for (let k = 0; k < items.length; k += 1) {
        const item = items[k];
        equipments.push({ masterId: item.data.id, improvement: item.remodel, proficiency: item.level } as JervisItem);
      }
      const jervisAirbase = {
        slots: items.map((v) => v.fullSlot),
        equipments,
      } as JervisAirbase;
      json.landBase.push(jervisAirbase);
    }

    return JSON.stringify(json);
  }

  /**
   * 旧シミュレータデータから
   * @param {string[]} raw
   * @return {*}  {SaveData[]}
   * @memberof Convert
   */
  public convertOldSimulatorToSaveData(raw: string[], setting: { presetFolders: [] }): SaveData | undefined {
    if (!raw.length) {
      return undefined;
    }

    const importedRoot = new SaveData();
    importedRoot.isDirectory = true;
    importedRoot.isUnsaved = false;
    importedRoot.isOpen = true;
    importedRoot.highlight = true;

    // フォルダ情報チェック
    const oldfolders: { id: number, name: string }[] = setting && setting.presetFolders ? setting.presetFolders : [];
    const folders: { id: number, name: string, data: SaveData[] }[] = [];
    for (let i = 0; i < oldfolders.length; i += 1) {
      folders.push({ id: oldfolders[i].id, name: oldfolders[i].name, data: [] });
    }

    for (let i = 0; i < raw.length; i += 1) {
      // データ: [0:id, 1:編成名, 2:Base64化データ, 3:メモ, 4:更新日時, 5:フォルダID]
      const saveData = new SaveData();
      saveData.name = raw[i].length >= 2 ? raw[i][1] : '旧データ';
      saveData.remarks = raw[i].length >= 4 ? raw[i][3] : '';
      saveData.isUnsaved = false;

      // 日付変換
      const editedDate = raw[i].length >= 5 ? Date.parse(raw[i][4]) : '';
      if (editedDate) {
        saveData.editedDate = editedDate;
      }

      const dataString = raw[i].length >= 3 ? raw[i][2] : '';

      if (dataString) {
        // 各々復元
        const manager = this.restoreOldSaveData(dataString);
        if (!manager) {
          continue;
        }
        saveData.tempData = [manager];
        saveData.tempIndex = 0;
        saveData.saveManagerData();

        // フォルダチェック
        const folderId = raw[i].length >= 6 ? +raw[i][5] : 0;
        const folder = folders.find((v) => v.id === folderId);
        if (folder) {
          folder.data.push(saveData);
        } else {
          importedRoot.childItems.push(saveData);
        }
      }
    }

    for (let i = 0; i < folders.length; i += 1) {
      // データが存在するフォルダのみ取り込み
      if (folders[i].data.length) {
        const folder = new SaveData();
        folder.name = folders[i].name;
        folder.isDirectory = true;
        folder.isUnsaved = false;
        folder.childItems = folders[i].data;
        importedRoot.childItems.push(folder);
      }
    }

    return importedRoot;
  }

  public restoreOldSaveData(dataString: string): CalcManager | undefined {
    const decoded = LZStringMod.decompressFromEncodedURIComponent(dataString);
    if (!decoded) {
      return undefined;
    }
    const json = JSON.parse(decoded);

    // 各々復元
    const manager = new CalcManager();
    const isDefense = !!json[4];
    const admiralLevel = json[6] ? +json[6] : undefined;
    manager.airbaseInfo = this.restoreAirbase(json[0], isDefense);
    manager.fleetInfo = this.restoreFleet(json[1], admiralLevel);
    manager.battleInfo = this.restoreEnemies(json[2], json[5]);

    return manager;
  }

  /**
   * 旧シミュ形式から基地情報を復元、返却
   * @private
   * @param {*} old
   * @return {*}  {AirbaseInfo}
   * @memberof Convert
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private restoreAirbase(old: any, isDefense = false): AirbaseInfo {
    // 基地: [0:機体群, 1:札群, 2:ターゲット戦闘番号[1-1, 1-2, 2-1, ..., 3-2]]
    const oldItems = old[0];
    const oldAirbaseModes = old[1];
    const oldAirbaseTargets = old[2];

    const tempAirbaseInfo = new AirbaseInfo();
    for (let i = 0; i < oldItems.length; i += 1) {
      // 旧装備変換
      const oldItem = new OldItem(oldItems[i]);
      const slotIndex = oldItem.index;
      const airbase = tempAirbaseInfo.airbases[Math.floor(slotIndex / 4)];
      if (airbase) {
        const master = this.itemMasters.find((v) => v.id === oldItem.id);
        const item = new Item({
          master, level: oldItem.level, remodel: oldItem.remodel, slot: oldItem.slot,
        });
        airbase.items[slotIndex % 4] = item;
      }
    }

    // 一度再インスタンス化
    const newAirbases: Airbase[] = [];
    for (let i = 0; i < tempAirbaseInfo.airbases.length; i += 1) {
      const mode = oldAirbaseModes[i];
      let newMode = 0;
      if (mode === 2) {
        // 出撃は1
        newMode = 1;
      } else if (mode === 0) {
        // 防空は2
        newMode = 2;
      }

      if (oldAirbaseTargets) {
        const battleTarget = oldAirbaseTargets.length ? [oldAirbaseTargets[2 * i], oldAirbaseTargets[2 * i + 1]] : [0, 0];
        newAirbases.push(new Airbase({ airbase: tempAirbaseInfo.airbases[i], battleTarget, mode: newMode }));
      } else {
        newAirbases.push(new Airbase({ airbase: tempAirbaseInfo.airbases[i], mode: newMode }));
      }
    }

    return new AirbaseInfo({ airbases: newAirbases, isDefense });
  }

  /**
   * 旧シミュ形式から艦隊情報を復元、返却
   * @private
   * @param {any[]} old
   * @param {number} [admiralLevel=120]
   * @return {*}  {FleetInfo}
   * @memberof Convert
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private restoreFleet(old: any[], admiralLevel = 120): FleetInfo {
    const fleetInfo = new FleetInfo();

    // 第1 第2までしか取り扱っていない
    const ships1: Ship[] = [];
    const ships2: Ship[] = [];

    let isUnion = false;

    for (let i = 0; i < old.length; i += 1) {
      // 旧艦娘情報
      const oldShip = new OldShip(old[i]);
      // 現行マスタから情報取得
      const shipMaster = this.shipMasters.find((v) => v.albumId === oldShip.albumId);
      if (!shipMaster) {
        continue;
      }
      const tempShip = new Ship({
        master: shipMaster, level: oldShip.level, isActive: oldShip.isActive, luck: oldShip.luck,
      });
      const tempItems = tempShip.items;
      let exItem = new Item();

      const oldItems = oldShip.items;
      for (let j = 0; j < oldItems.length; j += 1) {
        // 旧装備変換
        const oldItem = oldItems[j];
        const master = this.itemMasters.find((v) => v.id === oldItem.id);
        const item = new Item({
          master, level: oldItem.level, remodel: oldItem.remodel, slot: oldItem.slot,
        });

        if (oldItem.index >= 0 && oldItem.index < tempItems.length) {
          // 装備置き換え
          tempItems[oldItem.index] = item;
        } else if (oldItem.index === -1) {
          // -1の場合補強増設
          exItem = item;
        }
      }
      // 再度インスタンス化
      if (oldShip.index < 6 || (oldShip.isYugeki && oldShip.index < 7)) {
        // 通常の6隻以外に、遊撃フラグかつ7番目も第1とする
        ships1.push(new Ship({ ship: tempShip, items: tempItems, exItem }));
      } else {
        ships2.push(new Ship({ ship: tempShip, items: tempItems, exItem }));
      }

      // どこかでだれかが連合フラグなら連合とする
      if (oldShip.isUnion) {
        isUnion = true;
      }
    }

    const fleet1 = new Fleet({ ships: ships1 });
    const fleet2 = new Fleet({ ships: ships2 });

    return new FleetInfo({
      info: fleetInfo, fleets: [fleet1, fleet2], isUnion, admiralLevel,
    });
  }

  /**
   * 旧シミュ形式から艦隊情報を復元、返却
   * 敵艦: [0:戦闘位置, 1:[敵id配列], 2:マス名, 3:マス種別, 4:陣形, 5:半径]
   * @private
   * @param {*} old
   * @return {*}  {AirbaseInfo}
   * @memberof Convert
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private restoreEnemies(old: any[], old2: any[] = []): BattleInfo {
    const fleets: EnemyFleet[] = [];
    for (let i = 0; i < old.length; i += 1) {
      const enemies: Enemy[] = [];
      const oldFleetInfo = old[i];
      const oldEnemyIds = oldFleetInfo[1];
      for (let j = 0; j < oldEnemyIds.length; j += 1) {
        const enemy = Enemy.createEnemyFromMasterId(1500 + oldEnemyIds[j], j > 5, this.enemyMasters, this.itemMasters);
        if (enemy.data.id) {
          enemies.push(enemy);
        }
      }

      const nodeNames = oldFleetInfo[2] ? oldFleetInfo[2].split('_') : '';
      const nodeName = nodeNames.length > 1 ? nodeNames[1] : '-';
      const cellType = oldFleetInfo[3] ? +oldFleetInfo[3] : CELL_TYPE.NORMAL;
      const formation = oldFleetInfo[4] ? +oldFleetInfo[4] : FORMATION.LINE_AHEAD;
      const range = oldFleetInfo[5] ? +oldFleetInfo[5] : 0;

      if (enemies.length) {
        fleets.push(new EnemyFleet({
          enemies, formation, cellType, range, nodeName,
        }));
      }
    }

    // 防空時敵 いれば
    if (old2.length && old2[0].some((v: number) => v !== 0)) {
      // 防空モード敵艦隊: [0:[敵id配列], 1:マス種別, 2:陣形]
      const enemies: Enemy[] = [];
      const oldEnemyIds = old2[0];
      for (let j = 0; j < oldEnemyIds.length; j += 1) {
        const enemy = Enemy.createEnemyFromMasterId(1500 + oldEnemyIds[j], j > 5, this.enemyMasters, this.itemMasters);
        if (enemy.data.id) {
          enemies.push(enemy);
        }
      }
      if (enemies.length) {
        const cellType = old2[1] ? +old2[1] : CELL_TYPE.HIGH_AIR_RAID;
        const formation = old2[2] ? +old2[2] : FORMATION.DIAMOND;
        const airRaidFleet = new EnemyFleet({ enemies, cellType, formation });
        return new BattleInfo({ fleets, airRaidFleet, battleCount: fleets.length });
      }
    }
    return new BattleInfo({ fleets, battleCount: fleets.length });
  }

  /**
   * 日付をフォーマット
   * @param {Date} date
   * @param {string} format
   * @returns
   */
  public static formatDate(date: Date, format: string): string {
    format = format.replace(/yyyy/g, date.getFullYear().toString());
    format = format.replace(/yy/g, (date.getFullYear() % 100).toString());
    format = format.replace(/MM/g, (`0${date.getMonth() + 1}`).slice(-2));
    format = format.replace(/dd/g, (`0${date.getDate()}`).slice(-2));
    format = format.replace(/HH/g, (`0${date.getHours()}`).slice(-2));
    format = format.replace(/mm/g, (`0${date.getMinutes()}`).slice(-2));
    format = format.replace(/ss/g, (`0${date.getSeconds()}`).slice(-2));
    format = format.replace(/SSS/g, (`00${date.getMilliseconds()}`).slice(-3));
    return format;
  }

  /**
   * 英プロパティ名から日変換
   * @static
   * @param {string} value
   * @return {*}  {string}
   * @memberof Convert
   */
  public static convertAttibuteString(value: string): string {
    switch (value) {
      case 'fire':
        return '火力';
      case 'torpedo':
        return '雷装';
      case 'bomber':
        return '爆装';
      case 'antiAir':
        return '対空';
      case 'accuracy':
        return '命中';
      case 'scout':
        return '索敵';
      case 'avoid':
        return '回避';
      case 'antiBomber':
        return '対爆';
      case 'interception':
        return '迎撃';
      case 'armor':
        return '装甲';
      case 'asw':
        return '対潜';
      case 'range':
        return '射程';
      case 'radius':
        return '半径';
      case 'cost':
        return '配置コスト';
      case 'avoidId':
        return '射撃回避';
      default:
        return value;
    }
  }

  /**
   * Created by romulus on 2014/9/10.
   * @static
   * @param {string} dataString
   * @return {*}  {string}
   * @memberof Convert
   */
  public static encode64(dataString: string): string {
    const CODE = ['0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111',
      '1000', '1001', '1010', '1011', '1100', '1101'];
    const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-';
    let buff = '';
    let outputString = '';
    for (let j = 0; j < dataString.length; j += 1) {
      const c = dataString.charAt(j);
      let pos: number;
      if (c === ',') {
        pos = 10;
      } else if (c === '|') {
        pos = 11;
      } else if (c === '.') {
        pos = 12;
      } else if (c === ':') {
        pos = 13;
      } else {
        // eslint-disable-next-line radix
        pos = parseInt(c);
      }
      buff += CODE[pos];
      if (buff.length >= 6) {
        const seg = buff.slice(0, 6);
        outputString += BASE64.charAt(parseInt(seg, 2));
        buff = buff.slice(6);
      }
    }
    if (buff.length > 0) {
      while (buff.length < 6) {
        buff += '1';
      }
      outputString += BASE64.charAt(parseInt(buff, 2));
    }
    return outputString;
  }

  public static decode64(inputString: string): string {
    const CODE = ['0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111',
      '1000', '1001', '1010', '1011', '1100', '1101'];
    const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-';
    let dataString = '';
    let buff = '';
    for (let j = 0; j < inputString.length; j += 1) {
      let inp = BASE64.indexOf(inputString[j]).toString(2);
      while (inp.length < 6) {
        inp = `0${inp}`;
      }
      buff += inp;
      while (buff.length >= 4) {
        const seg = buff.slice(0, 4);
        const pos = CODE.indexOf(seg);
        if (pos === -1) {
          // Padding, do nothing
        } else if (pos === 10) {
          dataString += ',';
        } else if (pos === 11) {
          dataString += '|';
        } else if (pos === 12) {
          dataString += '.';
        } else if (pos === 13) {
          dataString += ':';
        } else {
          dataString += pos;
        }
        buff = buff.slice(4);
      }
    }
    return dataString;
  }

  /**
   * 旧在籍艦娘情報を新版に変換
   * @static
   * @param {oldShipStockJson[]} data
   * @return {*}  {ShipStock[]}
   * @memberof Convert
   */
  public static restoreShipStock(data: OldShipStockJson[], shipMasters: ShipMaster[]): ShipStock[] {
    const newStocks = [];
    let uniqueId = 1;
    for (let i = 0; i < data.length; i += 1) {
      const shipAlbumId = data[i].id;
      const oldDetails = data[i].details;

      const shipMaster = shipMasters.find((v) => v.albumId === shipAlbumId);
      if (!shipMaster) {
        continue;
      }
      for (let j = 0; j < oldDetails.length; j += 1) {
        const detail = oldDetails[j];

        const newStock = new ShipStock();
        newStock.uniqueId = uniqueId;
        newStock.id = shipMaster.id;
        newStock.area = detail.area && detail.area > 0 ? detail.area : 0;
        newStock.exp = detail.exp ? detail.exp : 0;
        newStock.level = detail.lv ? detail.lv : 1;
        newStock.releaseExpand = !!detail.ex;
        if (detail.st && detail.st.length) {
          const status = detail.st;
          newStock.improvement.fire = status[0] ? status[0] : 0;
          newStock.improvement.torpedo = status[1] ? status[1] : 0;
          newStock.improvement.antiAir = status[2] ? status[2] : 0;
          newStock.improvement.armor = status[3] ? status[3] : 0;
          newStock.improvement.luck = status[4] ? status[4] : 0;
          newStock.improvement.hp = status[5] ? status[5] : 0;
          newStock.improvement.asw = status[6] ? status[6] : 0;
        }

        newStocks.push(newStock);
        uniqueId += 1;
      }
    }

    return newStocks;
  }

  /**
   * 旧所持装備情報を新版に変換
   * @static
   * @param {ItemStock[]} data
   * @return {*}  {ItemStock[]}
   * @memberof Convert
   */
  public static restoreItemStock(data: ItemStock[]): ItemStock[] {
    const newStocks = [];

    for (let i = 0; i < data.length; i += 1) {
      const old = data[i] as ItemStock;

      // 念のため不正データがないかチェック
      if (old.id && old.num && old.num.length && old.num.length === 11) {
        const newStock = new ItemStock(old.id);
        newStock.num = old.num.concat();
        newStocks.push(newStock);
      }
    }
    return newStocks;
  }
}
