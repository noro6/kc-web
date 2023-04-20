import Dexie from 'dexie';
import EnemyMaster from './enemy/enemyMaster';
import ShipStock from './fleet/shipStock';
import ItemPreset from './item/itemPreset';
import ItemStock from './item/itemStock';
import SaveData from './saveData/saveData';
import SiteSetting from './siteSetting';
import OutputHistory from './saveData/outputHistory';
import Quest from './quest';

export default class KcWebDatabase extends Dexie {
  public savedata!: Dexie.Table<SaveData, string>;

  public items!: Dexie.Table<ItemStock, number>;

  public ships!: Dexie.Table<ShipStock, number>;

  public setting!: Dexie.Table<SiteSetting, string>;

  public itemPresets!: Dexie.Table<ItemPreset, number>;

  public manualEnemies!: Dexie.Table<EnemyMaster, number>;

  public outputHistories!: Dexie.Table<OutputHistory, number>;

  public quests!: Dexie.Table<Quest, string>;

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

    // v3 手動設定敵艦追加
    this.version(3).stores({
      savedata: 'id',
      items: 'id',
      ships: 'uniqueId',
      setting: 'id',
      itemPresets: 'id',
      manualEnemies: 'id',
    });

    // v4 共有URL発行履歴追加
    this.version(4).stores({
      savedata: 'id',
      items: 'id',
      ships: 'uniqueId',
      setting: 'id',
      itemPresets: 'id',
      manualEnemies: 'id',
      outputHistories: 'id',
    });

    // v5 任務進捗機能追加
    this.version(5).stores({
      savedata: 'id',
      items: 'id',
      ships: 'uniqueId',
      setting: 'id',
      itemPresets: 'id',
      manualEnemies: 'id',
      outputHistories: 'id',
      quests: 'id',
    });
  }
}
