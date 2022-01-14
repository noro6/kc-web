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
    draggingSaveData: new SaveData(),
    siteSetting: new SiteSetting(),
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
      // todo DB更新
      console.log('DB更新予定タイミング');
    },
    updateItemStock: (state, values: ItemStock[]) => {
      // todo DB更新
      state.itemStock = values;
    },
    updateShipStock: (state, values: ShipStock[]) => {
      // todo DB更新
      state.shipStock = values;
    },
    setMainSaveData: (state, value: SaveData) => {
      state.mainSaveData = value;
    },
    setDraggingSaveData: (state, value: SaveData) => {
      state.draggingSaveData = value;
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
      context.commit('updateSaveData', value);
    },
    setMainSaveData(context, value: SaveData) {
      context.commit('setMainSaveData', value);
    },
    setDraggingSaveData(context, value: SaveData) {
      context.commit('setDraggingSaveData', value);
    },
    updateItemStock: (context, values: ItemStock[]) => {
      context.commit('updateItemStock', values);
    },
    updateShipStock: (context, values: ShipStock[]) => {
      context.commit('updateShipStock', values);
    },
    updateSetting: (context, value: SiteSetting) => {
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
          console.log(error);
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
          console.log(error);
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
          console.log(error);
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
          console.log(error);
        });

      // todo DBから編成セーブデータよみこみ
      const rootData = new SaveData();
      rootData.isDirectory = true;
      rootData.isReadonly = true;

      const folder = new SaveData();
      folder.name = '保存されたデータ';
      folder.isDirectory = true;
      folder.isReadonly = true;
      folder.isOpen = true;
      rootData.childItems.push(folder);

      // 初期データ てきとう
      for (let i = 0; i < 7; i += 1) {
        const world = Const.WORLDS[i];
        const newFolder = new SaveData();
        newFolder.name = world.text;
        newFolder.isDirectory = true;
        newFolder.isUnsaved = false;
        folder.childItems.push(newFolder);
      }
      folder.childItems.sort((a, b) => a.name.localeCompare(b.name));
      context.commit('updateSaveData', rootData);

      // todo DBから設定データ読み込み
      context.commit('updateSetting', new SiteSetting());

      const loader = [loadShip, loadEnemy, loadItem];
      Promise.all(loader).then(() => {
        context.commit('completed', true);
      });
    },
  },
  modules: {
  },
  getters: {
    getCompleted: (state) => state.completed,
  },
});
