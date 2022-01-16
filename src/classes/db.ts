import Dexie from 'dexie';
import ShipStock from './fleet/shipStock';
import ItemStock from './item/itemStock';
import SaveData from './saveData/saveData';
import SiteSetting from './siteSetting';

export default class KcWebDatabase extends Dexie {
  public savedata!: Dexie.Table<SaveData, string>;

  public items!: Dexie.Table<ItemStock, number>;

  public ships!: Dexie.Table<ShipStock, number>;

  public setting!: Dexie.Table<SiteSetting, string>;

  constructor() {
    super('kc-web-database');
    this.version(1).stores({
      savedata: 'id',
      items: 'id',
      ships: 'uniqueId',
      setting: 'id',
    });
  }
}
