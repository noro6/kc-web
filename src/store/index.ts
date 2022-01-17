import axios from 'axios';
import Vue from 'vue';
import Vuex from 'vuex';
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

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    items: [] as ItemMaster[],
    ships: [] as ShipMaster[],
    cells: [] as CellMaster[],
    enemies: [] as EnemyMaster[],
    itemStock: [] as ItemStock[],
    shipStock: [] as ShipStock[],
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
      state.enemies = values;
    },
    setItems: (state, values: ItemMaster[]) => {
      state.items = values;
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
    updateSetting: (context, value: SiteSetting) => {
      context.state.kcWebDatabase.setting.put(value, 'setting');
      context.commit('updateSetting', value);
    },
    loadCellData: async (context) => {
      // ロード画面を入れる
      context.commit('completed', false);
      // マスタ問い合わせ
      const loadCell = axios.get('https://sheets.googleapis.com/v4/spreadsheets/1sYDMdug8UikACDOLRWkOG3bo4xcD98B7uwXHg6DbZAA/values/cells?key=AIzaSyB-R4wHYPUpAxhcNNOV8q36R7PgrUNDD5o')
        .then((response) => {
          const cells: CellMaster[] = [];
          for (let i = 1; i < response.data.values.length; i += 1) {
            const raw = JSON.parse(`${response.data.values[i][0]}`.slice(0, -1)) as RawCell;
            cells.push(new CellMaster(raw));
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
    },
    loadData: async (context) => {
      const loadShip = axios.get('https://sheets.googleapis.com/v4/spreadsheets/1sYDMdug8UikACDOLRWkOG3bo4xcD98B7uwXHg6DbZAA/values/ships?key=AIzaSyB-R4wHYPUpAxhcNNOV8q36R7PgrUNDD5o')
        .then((response) => {
          const ships: ShipMaster[] = [];
          for (let i = 1; i < response.data.values.length; i += 1) {
            const ship = new ShipMaster(...response.data.values[i]);
            if (ship.id) {
              ships.push(ship);
            }
          }
          context.commit('setShips', ships);
        })
        .catch((error) => {
          console.error(error);
        });

      const loadEnemy = axios.get('https://sheets.googleapis.com/v4/spreadsheets/1sYDMdug8UikACDOLRWkOG3bo4xcD98B7uwXHg6DbZAA/values/enemies?key=AIzaSyB-R4wHYPUpAxhcNNOV8q36R7PgrUNDD5o')
        .then((response) => {
          const enemies: EnemyMaster[] = [];
          for (let i = 1; i < response.data.values.length; i += 1) {
            const enemy = new EnemyMaster(...response.data.values[i]);
            if (enemy.id) {
              enemies.push(enemy);
            }
          }
          context.commit('setEnemies', enemies);
        })
        .catch((error) => {
          console.error(error);
        });

      const loadItem = axios.get('https://sheets.googleapis.com/v4/spreadsheets/1sYDMdug8UikACDOLRWkOG3bo4xcD98B7uwXHg6DbZAA/values/items?key=AIzaSyB-R4wHYPUpAxhcNNOV8q36R7PgrUNDD5o')
        .then((response) => {
          const items: ItemMaster[] = [];
          for (let i = 1; i < response.data.values.length; i += 1) {
            const item = new ItemMaster(...response.data.values[i]);
            if (item.id) {
              items.push(item);
            }
          }
          context.commit('setItems', items);
        })
        .catch((error) => {
          console.error(error);
        });

      const loader = [loadShip, loadEnemy, loadItem];
      Promise.all(loader).then(() => {
        context.commit('completed', true);
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
        for (let i = 0; i < 7; i += 1) {
          const world = Const.WORLDS[i];
          const newFolder = new SaveData();
          newFolder.name = world.text;
          newFolder.isDirectory = true;
          newFolder.isUnsaved = false;
          folder.childItems.push(newFolder);
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
  },
});
