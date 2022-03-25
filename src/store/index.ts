import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';
import { initializeApp } from 'firebase/app';
import { getStorage, ref, getDownloadURL } from 'firebase/storage';
import ShipMaster from '@/classes/fleet/shipMaster';
import ItemMaster from '@/classes/item/itemMaster';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import CalcManager from '@/classes/calcManager';
import CellMaster, { RawCell } from '@/classes/enemy/cellMaster';
import SaveData from '@/classes/saveData/saveData';
import Const from '@/classes/const';
import SiteSetting from '@/classes/siteSetting';
import ItemStock from '@/classes/item/itemStock';
import ShipStock from '@/classes/fleet/shipStock';
import KcWebDatabase from '@/classes/db';
import Ship from '@/classes/fleet/ship';
import { Master, MasterEquipmentExSlot, MasterEquipmentShip } from '@/classes/interfaces/master';
import ItemPreset from '@/classes/item/itemPreset';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    items: [] as ItemMaster[],
    ships: [] as ShipMaster[],
    exSlotEquipShips: [] as MasterEquipmentExSlot[],
    equipShips: [] as MasterEquipmentShip[],
    cells: [] as CellMaster[],
    itemStock: [] as ItemStock[],
    shipStock: [] as ShipStock[],
    itemPresets: [] as ItemPreset[],
    defaultEnemies: [] as EnemyMaster[],
    manualEnemies: [] as EnemyMaster[],
    saveData: new SaveData(),
    calcManager: undefined as CalcManager | undefined,
    mainSaveData: new SaveData(),
    draggingShipData: new Ship(),
    draggingSaveData: new SaveData(),
    siteSetting: new SiteSetting(),
    kcWebDatabase: new KcWebDatabase(),
    completed: false,
  },
  mutations: {
    setShips: (state, values: ShipMaster[]) => {
      state.ships = values;
    },
    setEnemies: (state, values: EnemyMaster[]) => {
      state.defaultEnemies = values;
    },
    setItems: (state, values: ItemMaster[]) => {
      state.items = values;
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
    updateItemStock: (state, values: ItemStock[]) => {
      state.itemStock = values;
    },
    updateShipStock: (state, values: ShipStock[]) => {
      state.shipStock = values;
    },
    updateItemPresets: (state, values: ItemPreset[]) => {
      state.itemPresets = values;
    },
    updateManualEnemies: (state, values: EnemyMaster[]) => {
      state.manualEnemies = values;
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
  },
  actions: {
    updateSaveData(context, value: SaveData) {
      const minifyData = value.getMinifyData();
      // root直下の非保存データを除去
      minifyData.childItems = minifyData.childItems.filter((v) => v.isDirectory);
      context.state.kcWebDatabase.savedata.put(minifyData);

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
      context.state.kcWebDatabase.items.clear().then(() => {
        context.state.kcWebDatabase.items.bulkAdd(values);
      });
      context.commit('updateItemStock', values);
    },
    updateShipStock: (context, values: ShipStock[]) => {
      context.state.kcWebDatabase.ships.clear().then(() => {
        context.state.kcWebDatabase.ships.bulkAdd(values);
      });
      context.commit('updateShipStock', values);
    },
    updateItemPresets: (context, values: ItemPreset[]) => {
      context.state.kcWebDatabase.itemPresets.clear().then(() => {
        context.state.kcWebDatabase.itemPresets.bulkAdd(values);
      });
      context.commit('updateItemPresets', values);
    },
    updateManualEnemies: (context, values: EnemyMaster[]) => {
      context.state.kcWebDatabase.manualEnemies.clear().then(() => {
        context.state.kcWebDatabase.manualEnemies.bulkAdd(values);
      });
      context.commit('updateManualEnemies', values);
    },
    updateSetting: (context, value: SiteSetting) => {
      context.state.kcWebDatabase.setting.put(value, 'setting');
      context.commit('updateSetting', value);
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
      });
    },
    loadData: async (context) => {
      const firebaseConfig = {
        apiKey: 'AIzaSyC_rEnvKFFlZv54xvxP8MXPht081xYol4s',
        authDomain: 'development-74af0.firebaseapp.com',
        databaseURL: 'https://development-74af0.firebaseio.com',
        projectId: 'development-74af0',
        storageBucket: 'development-74af0.appspot.com',
        messagingSenderId: '789701529106',
        appId: '1:789701529106:web:3498f515937607158592cb',
        measurementId: 'G-90V5M1BZB9',
      };

      initializeApp(firebaseConfig);
      getDownloadURL(ref(getStorage(), 'master.json')).then((url) => {
        const loading = axios.get(url)
          .then((response) => {
            if (response.status !== 200 || !response.data) {
              return;
            }
            const master = response.data as Master;
            // 装備情報
            const masterItems = master.items;
            const items: ItemMaster[] = [];
            for (let i = 0; i < masterItems.length; i += 1) {
              const item = new ItemMaster(masterItems[i]);
              if (item.id) {
                items.push(item);
              }
            }
            // 艦娘情報
            const masterShips = master.ships;
            const ships: ShipMaster[] = [];
            for (let i = 0; i < masterShips.length; i += 1) {
              const ship = new ShipMaster(masterShips[i]);
              if (ship.id) {
                ships.push(ship);
              }
            }
            // 装備情報
            const masterEnemies = master.enemies;
            const enemies: EnemyMaster[] = [];
            for (let i = 0; i < masterEnemies.length; i += 1) {
              const enemy = new EnemyMaster(masterEnemies[i]);
              if (enemy.id) {
                enemies.push(enemy);
              }
            }

            context.commit('setItems', items);
            context.commit('setShips', ships);
            context.commit('setEnemies', enemies);
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
      });
    },
    loadSaveData: async (context) => {
      const db = context.state.kcWebDatabase;
      // セーブデータ読込
      const saveData = await db.savedata.get('root');
      if (saveData && saveData.childItems.length) {
        // データあり 再インスタンス化してからstoreにセット
        const data = SaveData.getInstance(saveData);
        data.isReadonly = true;
        data.childItems[0].isOpen = true;
        data.childItems[0].isReadonly = true;

        // なんかもうすでに入っていたら統合
        const alreadyChildFile = context.state.saveData.childItems.filter((v) => v.isUnsaved);
        for (let i = 0; i < alreadyChildFile.length; i += 1) {
          data.childItems.push(alreadyChildFile[i]);
        }
        context.state.saveData = data;
        context.commit('updateSaveData', data);
      } else {
        // 初期セーブデータ作成
        const root = new SaveData('root');
        root.isDirectory = true;
        root.isReadonly = true;

        const folder = new SaveData();
        folder.name = '保存されたデータ';
        folder.isDirectory = true;
        folder.isReadonly = true;
        folder.isOpen = true;
        root.childItems.push(folder);

        // 初期フォルダー作成 第1～7海域まで作ってやる
        for (let i = 1; i <= 7; i += 1) {
          const world = Const.WORLDS.find((v) => v.value === i);
          if (world) {
            const newFolder = new SaveData();
            newFolder.name = world.text;
            newFolder.isDirectory = true;
            newFolder.isUnsaved = false;
            folder.childItems.push(newFolder);
          }
        }
        folder.sortChild();

        context.state.saveData = root;
        context.commit('updateSaveData', root);
      }

      // 艦娘在庫呼び出し
      db.ships.toArray().then((data) => {
        context.state.shipStock = data;
      });
      // 装備呼び出し
      db.items.toArray().then((data) => {
        context.state.itemStock = data;
      });
      // 装備プリセ呼び出し
      db.itemPresets.toArray().then((data) => {
        context.state.itemPresets = data;
      });
      // 手動設定敵艦
      db.manualEnemies.toArray().then((data) => {
        context.state.manualEnemies = data;
      });
    },
    loadSetting: async (context) => {
      const db = context.state.kcWebDatabase;
      // 設定情報呼び出し
      const setting = await db.setting.get('setting');
      if (setting) {
        context.state.siteSetting = setting;
        context.commit('updateSetting', new SiteSetting(setting));
      } else {
        context.commit('updateSetting', new SiteSetting());
      }
    },
  },
  modules: {
  },
  getters: {
    getCompleted: (state) => state.completed,
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
