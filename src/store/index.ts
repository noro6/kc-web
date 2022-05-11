import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import Ship from '@/classes/fleet/ship';
import KcWebDatabase from '@/classes/db';
import CalcManager from '@/classes/calcManager';
import SiteSetting from '@/classes/siteSetting';
import ItemStock from '@/classes/item/itemStock';
import ShipStock from '@/classes/fleet/shipStock';
import ItemPreset from '@/classes/item/itemPreset';
import SaveData from '@/classes/saveData/saveData';
import ItemMaster from '@/classes/item/itemMaster';
import ShipMaster from '@/classes/fleet/shipMaster';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import CellMaster, { RawCell } from '@/classes/enemy/cellMaster';
import { UploadedPreset } from '@/classes/interfaces/uploadedPreset';
import {
  Master, MasterEnemy, MasterEquipmentExSlot, MasterEquipmentShip, MasterItem, MasterShip,
} from '@/classes/interfaces/master';
import OutputHistory from '@/classes/saveData/outputHistory';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    siteVersion: '2.4.1',
    items: [] as ItemMaster[],
    ships: [] as ShipMaster[],
    cells: [] as CellMaster[],
    itemStock: [] as ItemStock[],
    shipStock: [] as ShipStock[],
    tempItemStock: [] as ItemStock[],
    tempShipStock: [] as ShipStock[],
    itemPresets: [] as ItemPreset[],
    manualEnemies: [] as EnemyMaster[],
    defaultEnemies: [] as EnemyMaster[],
    outputHistories: [] as OutputHistory[],
    saveData: new SaveData(),
    equipShips: [] as MasterEquipmentShip[],
    exSlotEquipShips: [] as MasterEquipmentExSlot[],
    calcManager: undefined as CalcManager | undefined,
    mainSaveData: new SaveData(),
    draggingShipData: new Ship(),
    draggingSaveData: new SaveData(),
    siteSetting: new SiteSetting(),
    kcWebDatabase: new KcWebDatabase(),
    searchedList: [] as UploadedPreset[],
    completed: false,
    settingLoadCompleted: false,
    saveDataLoadCompleted: false,
    disabledDatabase: false,
  },
  mutations: {
    setShips: (state, values: MasterShip[]) => {
      const ships: ShipMaster[] = [];
      for (let i = 0; i < values.length; i += 1) {
        const ship = new ShipMaster(values[i]);
        if (ship.id) {
          ships.push(ship);
        }
      }
      state.ships = ships;
    },
    setEnemies: (state, values: MasterEnemy[]) => {
      const enemies: EnemyMaster[] = [];
      for (let i = 0; i < values.length; i += 1) {
        const enemy = new EnemyMaster(values[i]);
        if (enemy.id) {
          enemies.push(enemy);
        }
      }
      state.defaultEnemies = enemies;
    },
    setItems: (state, values: MasterItem[]) => {
      const items: ItemMaster[] = [];
      for (let i = 0; i < values.length; i += 1) {
        const item = new ItemMaster(values[i]);
        if (item.id) {
          items.push(item);
        }
      }
      state.items = items;
    },
    setExSlotEquipShips: (state, values: MasterEquipmentExSlot[]) => {
      state.exSlotEquipShips = values;
    },
    setEquipShips: (state, values: MasterEquipmentShip[]) => {
      state.equipShips = values;
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
    updateItemPresets: (state, values: ItemPreset[]) => {
      state.itemPresets = values;
    },
    updateManualEnemies: (state, values: EnemyMaster[]) => {
      state.manualEnemies = values;
    },
    updateOutputHistories: (state, values: OutputHistory[]) => {
      state.outputHistories = values;
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
      // minifyData.childItems = minifyData.childItems.filter((v) => v.isDirectory);
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

      // マスタ問い合わせ
      getDownloadURL(ref(getStorage(), 'cells.json')).then((url) => {
        const loadCell = axios.get(url)
          .then((response) => {
            const cells: CellMaster[] = [];
            const masters = response.data.patterns;
            for (let i = 0; i < masters.length; i += 1) {
              cells.push(new CellMaster(masters[i] as RawCell));
            }
            context.commit('setCells', cells);
          })
          .catch((error) => {
            console.error(error);
          });
        const loader = [loadCell];
        Promise.all(loader).then(() => {
          context.commit('completed', true);
        });
      }).catch((error) => {
        console.error(error);
        const loadCell = axios.get('./master_bk/cells.json')
          .then((response) => {
            const cells: CellMaster[] = [];
            const masters = response.data.patterns;
            for (let i = 0; i < masters.length; i += 1) {
              cells.push(new CellMaster(masters[i] as RawCell));
            }
            context.commit('setCells', cells);
          })
          .catch((error2) => {
            console.error(error2);
          });
        const loader = [loadCell];
        Promise.all(loader).then(() => {
          context.commit('completed', true);
        });
      });
    },
    loadData: async (context) => {
      getDownloadURL(ref(getStorage(), 'master.json')).then((url) => {
        const loading = axios.get(url)
          .then((response) => {
            if (response.status !== 200 || !response.data) {
              return;
            }
            const master = response.data as Master;
            context.commit('setItems', master.items);
            context.commit('setShips', master.ships);
            context.commit('setEnemies', master.enemies);
            context.commit('setExSlotEquipShips', master.api_mst_equip_exslot_ship);
            context.commit('setEquipShips', master.api_mst_equip_ship);
          })
          .catch((error) => {
            console.error(error);
          });

        const loader = [loading];
        Promise.all(loader).then(() => {
          context.commit('completed', true);
        });
      }).catch((error) => {
        console.error(error);
        const loading = axios.get('./master_bk/master.json')
          .then((response) => {
            if (response.status !== 200 || !response.data) {
              return;
            }
            const master = response.data as Master;
            context.commit('setItems', master.items);
            context.commit('setShips', master.ships);
            context.commit('setEnemies', master.enemies);
            context.commit('setExSlotEquipShips', master.api_mst_equip_exslot_ship);
            context.commit('setEquipShips', master.api_mst_equip_ship);
          })
          .catch((error3) => {
            console.error(error3);
          });

        const loader = [loading];
        Promise.all(loader).then(() => {
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
          }
        }

        // なんかもうすでに入っていたら統合
        const alreadyChildFile = context.state.saveData.childItems.filter((v) => v.isUnsaved);
        for (let i = 0; i < alreadyChildFile.length; i += 1) {
          data.childItems.push(alreadyChildFile[i]);
        }
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

      const loader = [loadShipStock, loadItemStock, loadItemPreset, loadManualEnemy, loadHistory];
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
