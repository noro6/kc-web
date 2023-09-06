import Vue from 'vue';
import Vuex from 'vuex';
import axios from 'axios';
import Quest from '@/classes/quest';
import Ship from '@/classes/fleet/ship';
import KcWebDatabase from '@/classes/db';
import Fleet from '@/classes/fleet/fleet';
import CalcManager from '@/classes/calcManager';
import SiteSetting from '@/classes/siteSetting';
import ItemStock from '@/classes/item/itemStock';
import ShipStock from '@/classes/fleet/shipStock';
import ItemPreset from '@/classes/item/itemPreset';
import SaveData from '@/classes/saveData/saveData';
import ItemMaster from '@/classes/item/itemMaster';
import ShipMaster from '@/classes/fleet/shipMaster';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import * as Master from '@/classes/interfaces/master';
import OutputHistory from '@/classes/saveData/outputHistory';
import CellMaster, { RawCell } from '@/classes/enemy/cellMaster';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import { UploadedPreset } from '@/classes/interfaces/uploadedPreset';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    /** サイトバージョン */
    siteVersion: '2.41.0',
    /** 装備マスタデータ */
    items: [] as ItemMaster[],
    /** 艦船マスタデータ */
    ships: [] as ShipMaster[],
    /** 海域マスタデータ */
    worlds: [] as Master.MasterWorld[],
    /** マップマスタデータ */
    maps: [] as Master.MasterMap[],
    /** 海域セルマスタデータ */
    cells: [] as CellMaster[],
    /** 敵艦マスタデータ */
    defaultEnemies: [] as EnemyMaster[],
    /** 所持装備マスタ */
    itemStock: [] as ItemStock[],
    /** 所持艦隊マスタ */
    shipStock: [] as ShipStock[],
    /** 一時展開中装備マスタ */
    tempItemStock: [] as ItemStock[],
    /** 一時展開中艦隊マスタ */
    tempShipStock: [] as ShipStock[],
    /** 艦娘クリップボード */
    tempShipList: [] as Ship[],
    /** 艦隊クリップボード */
    tempFleetList: [] as Fleet[],
    /** 装備プリセット */
    itemPresets: [] as ItemPreset[],
    /** 手動設定敵艦隊 */
    manualEnemies: [] as EnemyMaster[],
    /** 共有URL出力履歴 */
    outputHistories: [] as OutputHistory[],
    /** 任務達成状況 */
    quests: [] as Quest[],
    /** 編成セーブデータルート */
    saveData: new SaveData(),
    /** 特定艦娘が装備可能な装備カテゴリ */
    equipShips: [] as Master.MasterEquipmentShip[],
    /** 艦種マスタ */
    shipTypes: [] as Master.MasterShipType[],
    /** 特定艦娘が補強増設に装備可能な装備id */
    exSlotEquipShips: [] as Master.FormattedMasterEquipmentExSlot[],
    /** 現在展開中の計算データ */
    calcManager: undefined as CalcManager | undefined,
    /** 現在展開中のセーブデータ */
    mainSaveData: new SaveData(),
    /** ドラッグ中艦娘 */
    draggingShipData: new Ship(),
    /** ドラッグ中セーブデータ */
    draggingSaveData: new SaveData(),
    /** サイト設定データ */
    siteSetting: new SiteSetting(),
    /** indexedDB用インスタンス */
    kcWebDatabase: new KcWebDatabase(),
    /** みんなの編成検索結果 */
    searchedList: [] as UploadedPreset[],
    /** 全データ読み込み終了フラグ */
    completed: false,
    /** 設定ファイル読み込み終了フラグ */
    settingLoadCompleted: false,
    /** セーブデータ読み込み終了フラグ */
    saveDataLoadCompleted: false,
    /** indexedDB使用不能フラグ */
    disabledDatabase: false,
    /** 海域札数 */
    areaCount: 0,
  },
  mutations: {
    setShips: (state, values: Master.MasterShip[]) => {
      const ships: ShipMaster[] = [];
      for (let i = 0; i < values.length; i += 1) {
        const ship = new ShipMaster(values[i]);
        if (ship.id) {
          ships.push(ship);
        }
      }
      state.ships = ships;
    },
    setEnemies: (state, values: Master.MasterEnemy[]) => {
      const enemies: EnemyMaster[] = [];
      for (let i = 0; i < values.length; i += 1) {
        const enemy = new EnemyMaster(values[i]);
        if (enemy.id) {
          enemies.push(enemy);
        }
      }
      state.defaultEnemies = enemies;
    },
    setItems: (state, values: Master.MasterItem[]) => {
      const items: ItemMaster[] = [];
      for (let i = 0; i < values.length; i += 1) {
        const item = new ItemMaster(values[i]);
        if (item.id) {
          items.push(item);
        }
      }
      state.items = items;
    },
    setExSlotEquipShips: (state, values: Master.MasterEquipmentExSlot) => {
      // あまりにもアレすぎるので変換する
      const data: Master.FormattedMasterEquipmentExSlot[] = [];
      Object.keys(values).forEach((v) => {
        if (+v && values[v]) {
          const row: Master.FormattedMasterEquipmentExSlot = {
            api_slotitem_id: +v,
            api_ship_ids: [],
            api_stypes: [],
            api_ctypes: [],
          };

          // eslint-disable-next-line camelcase
          const { api_ship_ids, api_stypes, api_ctypes } = values[v];
          // eslint-disable-next-line camelcase
          if (api_ship_ids) {
            Object.keys(api_ship_ids).forEach((x) => {
              if (+x && api_ship_ids[x]) row.api_ship_ids.push(+x);
            });
          }
          // eslint-disable-next-line camelcase
          if (api_stypes) {
            Object.keys(api_stypes).forEach((x) => {
              if (+x && api_stypes[x]) row.api_stypes.push(+x);
            });
          }
          // eslint-disable-next-line camelcase
          if (api_ctypes) {
            Object.keys(api_ctypes).forEach((x) => {
              if (+x && api_ctypes[x]) row.api_ctypes.push(+x);
            });
          }

          data.push(row);
        }
      });
      state.exSlotEquipShips = data;
    },
    setEquipShips: (state, values: Master.MasterEquipmentShip[]) => {
      state.equipShips = values;
    },
    setShipTypes: (state, values: Master.MasterShipType[]) => {
      state.shipTypes = values;
    },
    setWorlds: (state, values: Master.MasterWorld[]) => {
      state.worlds = values;
    },
    setMaps: (state, values: Master.MasterMap[]) => {
      state.maps = values;
    },
    setAreaCount: (state, value: number) => {
      state.areaCount = value;
    },
    setCells: (state, values: CellMaster[]) => {
      state.cells = values;
    },
    updateSaveData: (state, value: SaveData) => {
      state.saveData = value;
    },
    setItemStock: (state, values: ItemStock[]) => {
      state.itemStock = values;
    },
    setShipStock: (state, values: ShipStock[]) => {
      state.shipStock = values;
    },
    updateTempItemStock: (state, values: ItemStock[]) => {
      state.tempItemStock = values;
    },
    updateTempShipStock: (state, values: ShipStock[]) => {
      state.tempShipStock = values;
    },
    updateTempShipList: (state, values: Ship[]) => {
      state.tempShipList = values;
    },
    updateTempFleetList: (state, values: Fleet[]) => {
      state.tempFleetList = values;
    },
    updateItemPresets: (state, values: ItemPreset[]) => {
      state.itemPresets = values;
    },
    updateManualEnemies: (state, values: EnemyMaster[]) => {
      state.manualEnemies = values;
    },
    updateOutputHistories: (state, values: OutputHistory[]) => {
      state.outputHistories = values;
    },
    updateQuests: (state, values: Quest[]) => {
      state.quests = values;
    },
    setMainSaveData: (state, value: SaveData) => {
      state.mainSaveData = value;
    },
    setDraggingSaveData: (state, value: SaveData) => {
      state.draggingSaveData = value;
    },
    setDraggingShipData: (state, value: Ship) => {
      state.draggingShipData = value;
    },
    updateSetting: (state, value: SiteSetting) => {
      state.siteSetting = value;
    },
    completed: (state, value: boolean) => {
      state.completed = value;
    },
    settingLoadCompleted: (state, value: boolean) => {
      state.settingLoadCompleted = value;
    },
    saveDataLoadCompleted: (state, value: boolean) => {
      state.saveDataLoadCompleted = value;
    },
    setSearchedList: (state, values: UploadedPreset[]) => {
      state.searchedList = values;
    },
    setDisabledDatabase: (state, value: boolean) => {
      state.disabledDatabase = value;
    },
  },
  actions: {
    updateSaveData(context, value: SaveData) {
      const minifyData = value.getMinifyData();
      // root直下の非保存データを除去 => 中止 そのまま残す
      if (!context.state.disabledDatabase) {
        context.state.kcWebDatabase.savedata.put(minifyData);
      }

      context.commit('updateSaveData', value);
    },
    setMainSaveData(context, value: SaveData) {
      context.commit('setMainSaveData', value);
    },
    setDraggingSaveData(context, value: SaveData) {
      context.commit('setDraggingSaveData', value);
    },
    setDraggingShipData(context, value: Ship) {
      context.commit('setDraggingShipData', value);
    },
    updateItemStock: (context, values: ItemStock[]) => {
      if (!context.state.disabledDatabase) {
        context.state.kcWebDatabase.items.clear().then(() => {
          context.state.kcWebDatabase.items.bulkAdd(values);
        });
      }
      context.commit('setItemStock', values);
    },
    updateShipStock: (context, values: ShipStock[]) => {
      if (!context.state.disabledDatabase) {
        context.state.kcWebDatabase.ships.clear().then(() => {
          context.state.kcWebDatabase.ships.bulkAdd(values);
        });
      }
      context.commit('setShipStock', values);
    },
    updateTempItemStock: (context, values: ItemStock[]) => {
      context.commit('updateTempItemStock', values);
    },
    updateTempShipStock: (context, values: ShipStock[]) => {
      context.commit('updateTempShipStock', values);
    },
    updateTempShipList: (context, values: Ship[]) => {
      context.commit('updateTempShipList', values);
    },
    updateTempFleetList: (context, values: Fleet[]) => {
      context.commit('updateTempFleetList', values);
    },
    updateItemPresets: (context, values: ItemPreset[]) => {
      if (!context.state.disabledDatabase) {
        context.state.kcWebDatabase.itemPresets.clear().then(() => {
          context.state.kcWebDatabase.itemPresets.bulkAdd(values);
        });
      }
      context.commit('updateItemPresets', values);
    },
    updateManualEnemies: (context, values: EnemyMaster[]) => {
      if (!context.state.disabledDatabase) {
        context.state.kcWebDatabase.manualEnemies.clear().then(() => {
          context.state.kcWebDatabase.manualEnemies.bulkAdd(values);
        });
      }
      context.commit('updateManualEnemies', values);
    },
    updateOutputHistories: (context, values: OutputHistory[]) => {
      if (!context.state.disabledDatabase) {
        context.state.kcWebDatabase.outputHistories.clear().then(() => {
          context.state.kcWebDatabase.outputHistories.bulkAdd(values);
        });
      }
      context.commit('updateOutputHistories', values);
    },
    updateQuests: (context, values: Quest[]) => {
      if (!context.state.disabledDatabase) {
        context.state.kcWebDatabase.quests.clear().then(() => {
          context.state.kcWebDatabase.quests.bulkAdd(values);
        });
      }
      context.commit('updateQuests', values);
    },
    updateSetting: (context, value: SiteSetting) => {
      if (!context.state.disabledDatabase) {
        context.state.kcWebDatabase.setting.put(value, 'setting');
      }
      context.commit('updateSetting', value);
    },
    setSearchedList(context, values: UploadedPreset[]) {
      context.commit('setSearchedList', values);
    },
    loadCellData: async (context) => {
      // ロード画面を入れる
      context.commit('completed', false);

      const getCellJson = (url: string): Promise<void> => axios.get(url)
        .then((response) => {
          const cells: CellMaster[] = [];
          const masters = response.data.patterns;
          for (let i = 0; i < masters.length; i += 1) {
            cells.push(new CellMaster(masters[i] as RawCell));
          }
          context.commit('setCells', cells);
        });

      // マスタ問い合わせ
      getDownloadURL(ref(getStorage(), 'cells.json')).then((url) => {
        getCellJson(url).then(() => {
          context.commit('completed', true);
        }).catch((error) => {
          console.error(error);
          // バックアップデータを読み出す
          getCellJson('./master_bk/cells.json').then(() => {
            console.log('セル(backup)利用');
            context.commit('completed', true);
          });
        });
      }).catch((error) => {
        console.error(error);
        // バックアップデータを読み出す
        getCellJson('./master_bk/cells.json').then(() => {
          console.log('セル(backup)利用');
          context.commit('completed', true);
        });
      });
    },
    loadData: async (context) => {
      const getMasterJson = (url: string): Promise<void> => axios.get(url)
        .then((response) => {
          if (response.status !== 200 || !response.data) {
            return;
          }
          const master = response.data as Master.Master;
          context.commit('setItems', master.items);
          context.commit('setShips', master.ships);
          context.commit('setEnemies', master.enemies);
          context.commit('setExSlotEquipShips', master.api_mst_equip_exslot_ship);
          context.commit('setEquipShips', master.api_mst_equip_ship);
          context.commit('setShipTypes', master.api_mst_stype);
          context.commit('setWorlds', master.worlds);
          context.commit('setMaps', master.maps);
          context.commit('setAreaCount', master.area_count);
        });

      getDownloadURL(ref(getStorage(), 'master.json')).then((url) => {
        getMasterJson(url).then(() => {
          context.commit('completed', true);
        }).catch((error) => {
          console.error(error);
          // バックアップデータを読み出す
          getMasterJson('./master_bk/master.json').then(() => {
            console.log('マスター(backup)利用');
            context.commit('completed', true);
          });
        });
      }).catch((error) => {
        console.error(error);
        // バックアップデータを読み出す
        getMasterJson('./master_bk/master.json').then(() => {
          console.log('マスター(backup)利用');
          context.commit('completed', true);
        });
      });
    },
    loadSaveData: async (context) => {
      // ロード画面を入れる
      context.commit('saveDataLoadCompleted', false);

      let db: KcWebDatabase;
      // セーブデータ読込
      let saveData: SaveData | undefined;
      try {
        db = context.state.kcWebDatabase;
        saveData = await db.savedata.get('root');
      } catch (error) {
        // おそらくindexedDBが使えないから
        console.error(error);

        context.commit('setDisabledDatabase', true);
        context.commit('updateSaveData', SaveData.createInitialSaveData());
        context.commit('saveDataLoadCompleted', true);
        return;
      }
      if (saveData && saveData.childItems.length) {
        // データあり 再インスタンス化してからstoreにセット
        const data = SaveData.getInstance(saveData);
        data.isReadonly = true;
        data.childItems[0].isOpen = true;
        data.childItems[0].isReadonly = true;

        for (let i = 0; i < data.childItems.length; i += 1) {
          const unsavedData = data.childItems[i];
          // ディレクトリ以外は非保存データなので書き換え
          if (!unsavedData.isDirectory) {
            unsavedData.isUnsaved = true;
            unsavedData.isActive = true;
          } else {
            unsavedData.color = 'yellow lighten-1';
          }
        }

        // なんかもうすでに入っていたら統合
        const alreadyChildFile = context.state.saveData.childItems.filter((v) => v.isUnsaved);
        for (let i = 0; i < alreadyChildFile.length; i += 1) {
          data.childItems.push(alreadyChildFile[i]);
        }

        data.sortChild();
        context.commit('updateSaveData', data);
      } else {
        // 初期セーブデータ作成
        const root = SaveData.createInitialSaveData();
        context.commit('updateSaveData', root);
      }

      // 艦娘在庫呼び出し
      const loadShipStock = db.ships.toArray().then((data) => {
        context.commit('setShipStock', data);
      });
      // 装備呼び出し
      const loadItemStock = db.items.toArray().then((data) => {
        context.commit('setItemStock', data);
      });
      // 装備プリセ呼び出し
      const loadItemPreset = db.itemPresets.toArray().then((data) => {
        context.commit('updateItemPresets', data);
      });
      // 手動設定敵艦
      const loadManualEnemy = db.manualEnemies.toArray().then((data) => {
        context.commit('updateManualEnemies', data);
      });
      // 出力履歴
      const loadHistory = db.outputHistories.toArray().then((data) => {
        context.commit('updateOutputHistories', data);
      });
      // 出力履歴
      const quest = db.quests.toArray().then((data) => {
        context.commit('updateQuests', data);
      });

      const loader = [loadShipStock, loadItemStock, loadItemPreset, loadManualEnemy, loadHistory, quest];
      Promise.all(loader).then(() => {
        context.commit('saveDataLoadCompleted', true);
      });
    },
    loadSetting: async (context) => {
      try {
        context.commit('settingLoadCompleted', false);
        const db = context.state.kcWebDatabase;
        // 設定情報呼び出し
        const setting = await db.setting.get('setting');
        if (setting) {
          context.commit('updateSetting', new SiteSetting(setting));
        } else {
          context.commit('updateSetting', new SiteSetting());
        }
        context.commit('settingLoadCompleted', true);
      } catch (error) {
        // おそらくindexedDBが使えない
        console.error(error);
        context.commit('setDisabledDatabase', true);
        context.commit('updateSetting', new SiteSetting());
        context.commit('settingLoadCompleted', true);
      }
    },
  },
  modules: {
  },
  getters: {
    getCompletedAll: (state) => state.completed && state.saveDataLoadCompleted && state.settingLoadCompleted,
    getExistsTempStock: (state) => !!state.tempItemStock.length || !!state.tempShipStock.length,
    getEnemies: (state) => {
      const enemies = state.defaultEnemies.concat();
      for (let i = 0; i < state.manualEnemies.length; i += 1) {
        const enemy = state.manualEnemies[i];
        const index = enemies.findIndex((v) => v.id === enemy.id);
        if (index >= 0) {
          enemies[index] = enemy;
        }
      }
      return enemies;
    },
  },
});
