import Dexie from 'dexie';
import ShipStock from './fleet/shipStock';
import ItemPreset from './item/itemPreset';
import ItemStock from './item/itemStock';
import SaveData from './saveData/saveData';
import SiteSetting from './siteSetting';

export default class KcWebDatabase extends Dexie {
  public savedata!: Dexie.Table<SaveData, string>;

  public items!: Dexie.Table<ItemStock, number>;

  public ships!: Dexie.Table<ShipStock, number>;

  public setting!: Dexie.Table<SiteSetting, string>;

  public itemPresets!: Dexie.Table<ItemPreset, string>;

  constructor() {
    super('kc-web-database');

    // v1 初期
    this.version(1).stores({
      savedata: 'id',
      items: 'id',
      ships: 'uniqueId',
      setting: 'id',
    });

    // v2 装備プリセットテーブル追加
    this.version(2).stores({
      savedata: 'id',
      items: 'id',
      ships: 'uniqueId',
      setting: 'id',
      itemPresets: 'id',
    });
  }
}
