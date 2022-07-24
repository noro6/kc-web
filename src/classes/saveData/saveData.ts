import cloneDeep from 'lodash/cloneDeep';
import max from 'lodash/max';
import LZString from 'lz-string';
import CalcManager from '../calcManager';
import Airbase from '../airbase/airbase';
import AirbaseInfo from '../airbase/airbaseInfo';
import BattleInfo from '../enemy/battleInfo';
import EnemyFleet from '../enemy/enemyFleet';
import FleetInfo from '../fleet/fleetInfo';
import Fleet from '../fleet/fleet';
import Enemy from '../enemy/enemy';
import Ship from '../fleet/ship';
import Item from '../item/item';
import ShipMaster from '../fleet/shipMaster';
import EnemyMaster from '../enemy/enemyMaster';
import ItemMaster from '../item/itemMaster';

interface SavedItem {
  /** 装備id */
  i: number,
  /** 搭載数 */
  s?: number,
  /** 改修値 */
  r?: number,
  /** 熟練度 0～120 */
  l?: number,
}

interface SavedShip {
  /** id */
  i: number,
  /** 装備 */
  is: Item[],
  /** 対空値 */
  aa?: number,
  /** レベル */
  lv?: number,
  /** 運 */
  lu?: number,
  /** 補強増設装備 */
  ex?: Item,
  /** アクティブ状態 */
  ac?: boolean,
  /** 随伴かどうか */
  es?: boolean,
  /** 札 */
  ar?: number,
}

export default class SaveData {
  /**
   * 一意識別用id 基本的に使うことはない
   * 現状、ファイル移動時に自分より下の階層に入れようとした際のチェックに使うのみ
   */
  public readonly id: string;

  /** ディレクトリかどうか */
  public isDirectory: boolean;

  /** 名称 */
  public name: string;

  /** 補足情報 */
  public remarks: string;

  /** セーブデータ本体 非ディレクトリのみ有効 */
  public manager: string;

  /** 選択状態 専らファイル追加時のパス取得用 */
  public selected: boolean;

  /** 展開状態 ディレクトリのみ有効 */
  public isOpen: boolean;

  /** 編成タブとして出力状態かどうか 非ディレクトリのみ有効 */
  public isActive: boolean;

  /** 計算状態 アプリケーションで1つのみ */
  public isMain: boolean;

  /** 保存されていないデータ 新規追加されたやつ アプリ終了時に消しとばす => 残すことになった */
  public isUnsaved: boolean;

  /** 読み取り専用 専らルートディレクトリ直下の「保存されたデータ」ディレクトリだけ */
  public isReadonly: boolean;

  /** 子要素セーブデータ ディレクトリのみ有効 */
  public childItems: SaveData[] = [];

  /** 一時保存データ DBへの登録は行わない */
  public tempData: CalcManager[];

  /** 一時保存データ カーソル */
  public tempIndex: number;

  /** 一時保存データ 最後にセーブしたIndex箇所 */
  public tempSavedIndex: number;

  /** 最終保存日時 */
  public editedDate: number;

  /** ハイライト表示 専ら旧データインポート時に分かりやすくするため */
  public highlight = false;

  /**
   * インスタンス化(ディレクトリでない)
   * @param {string} [id]
   * @memberof SaveData
   */
  constructor(id?: string) {
    if (id) {
      this.id = id;
    } else {
      this.id = new Date().getTime().toString(16) + Math.floor(Math.random() * 10000);
    }
    this.name = '無題';
    this.remarks = '';
    this.isDirectory = false;
    this.isOpen = false;
    this.selected = false;
    this.isActive = false;
    this.isMain = false;
    this.manager = '';
    this.childItems = [];
    this.tempData = [];
    this.tempIndex = -1;
    this.isUnsaved = true;
    this.tempSavedIndex = -1;
    this.isReadonly = false;
    this.editedDate = Date.now();
  }

  /**
   * 文字列化によってプロパティだけになったオブジェクトを最インスタンス化して救済
   * @static
   * @param {SaveData} data
   * @memberof SaveData
   */
  public static getInstance(data: SaveData): SaveData {
    const saveData = new SaveData(data.id);
    saveData.name = data.name;
    saveData.remarks = data.remarks;
    saveData.isDirectory = data.isDirectory;
    saveData.manager = data.manager;
    saveData.isActive = data.isActive;
    saveData.isOpen = data.isOpen;
    saveData.isUnsaved = false;
    saveData.editedDate = data.editedDate;

    // 子要素を再帰的に復帰
    for (let i = 0; i < data.childItems.length; i += 1) {
      saveData.childItems.push(SaveData.getInstance(data.childItems[i]));
    }

    return saveData;
  }

  /**
   * 引数のオブジェクトがSaveDataたり得るか
   * @static
   * @param {SaveData} data
   * @return {*}  {boolean}
   * @memberof SaveData
   */
  public static IsSaveData(data: SaveData): boolean {
    if (data.id === undefined
      || data.name === undefined
      || data.manager === undefined
      || data.isDirectory === undefined
      || data.childItems === undefined
      || data.childItems.length === undefined) {
      return false;
    }
    // 子要素を再帰的にチェック
    for (let i = 0; i < data.childItems.length; i += 1) {
      if (!SaveData.IsSaveData(data.childItems[i])) {
        return false;
      }
    }

    return true;
  }

  /**
   * 初期セーブデータ作成
   * @static
   * @returns {SaveData}
   * @memberof SaveData
   */
  public static createInitialSaveData(): SaveData {
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
    const worlds = [
      { value: 1, text: '1: 鎮守府海域' },
      { value: 2, text: '2: 南西諸島海域' },
      { value: 3, text: '3: 北方海域' },
      { value: 7, text: '7: 南西海域' },
      { value: 4, text: '4: 西方海域' },
      { value: 5, text: '5: 南方海域' },
      { value: 6, text: '6: 中部海域' },
    ];
    for (let i = 1; i <= 7; i += 1) {
      const world = worlds.find((v) => v.value === i);
      if (world) {
        const newFolder = new SaveData();
        newFolder.name = world.text;
        newFolder.isDirectory = true;
        newFolder.isUnsaved = false;
        folder.childItems.push(newFolder);
      }
    }
    folder.sortChild();

    return root;
  }

  /**
   * 実際にブラウザに保存する用のデータ
   * Undo Redo配列は保存しない
   * @returns {SaveData}
   * @memberof SaveData
   */
  public getMinifyData(): SaveData {
    const replacer = (key: unknown, v: unknown) => {
      if (v instanceof SaveData) {
        return {
          id: v.id, name: v.name, remarks: v.remarks, manager: v.manager, isDirectory: v.isDirectory, childItems: v.childItems, isOpen: v.isOpen, isActive: v.isActive, editedDate: v.editedDate,
        };
      }
      return v;
    };

    const json = JSON.stringify(this, replacer);
    return JSON.parse(json);
  }

  /**
   * 本データが編集状態であるか
   * @readonly
   * @type {boolean}
   * @memberof SaveData
   */
  public get isEdited(): boolean {
    return this.tempSavedIndex !== this.tempIndex;
  }

  /**
   * 自身に格納される予定の新しいデータについて、いい感じの名前を返却
   * @return {*}  {string}
   * @memberof SaveData
   */
  public getNewSaveDataName(): string {
    if (!this.isDirectory) {
      return '';
    }

    const childs = this.childItems.filter((v) => v.name.startsWith('新規データ'));
    const maxNumber = max(childs.map((v) => +v.name.replace(/[^0-9]/g, '')));

    if (maxNumber !== undefined && maxNumber >= 0) {
      return `新規データ${maxNumber + 1}`;
    }
    return '新規データ1';
  }

  /**
   * 選択状態解除 再帰呼び出し
   * @memberof SaveData
   */
  public clearSelection(): void {
    this.selected = false;
    for (let i = 0; i < this.childItems.length; i += 1) {
      this.childItems[i].clearSelection();
    }
  }

  /**
   * ハイライト解除 再帰呼び出し
   * @memberof SaveData
   */
  public clearHighlight(): void {
    this.highlight = false;
    for (let i = 0; i < this.childItems.length; i += 1) {
      this.childItems[i].clearHighlight();
    }
  }

  /**
   * ファイル展開状態解除 再帰呼び出し
   * @memberof SaveData
   */
  public closeDirectory(): void {
    this.isOpen = false;
    for (let i = 0; i < this.childItems.length; i += 1) {
      this.childItems[i].closeDirectory();
    }
  }

  /**
   * ファイル展開 再帰呼び出し
   * @memberof SaveData
   */
  public openDirectory(): void {
    if (this.isDirectory) {
      this.isOpen = true;
      for (let i = 0; i < this.childItems.length; i += 1) {
        this.childItems[i].openDirectory();
      }
    }
  }

  /**
   * 計算状態解除 再帰呼び出し
   * @memberof SaveData
   */
  public disabledMain(): void {
    this.isMain = false;
    for (let i = 0; i < this.childItems.length; i += 1) {
      this.childItems[i].disabledMain();
    }
  }

  /**
   * 選択状態にあるデータを取得 再帰呼び出し
   * @returns {(SaveData | undefined)}
   * @memberof SaveData
   */
  public getSelectedData(): SaveData | undefined {
    if (this.selected) {
      return this;
    }

    for (let i = 0; i < this.childItems.length; i += 1) {
      const data = this.childItems[i].getSelectedData();
      if (data) {
        return data;
      }
    }

    return undefined;
  }

  /**
   * アクティブデータを一覧で取得 再帰呼び出し
   * @returns {SaveData[]}
   * @memberof SaveData
   */
  public fetchActiveData(): SaveData[] {
    let activeData: SaveData[] = [];
    if (this.isActive) {
      activeData.push(this);
    }

    for (let i = 0; i < this.childItems.length; i += 1) {
      const data = this.childItems[i].fetchActiveData();
      if (data.length) {
        activeData = activeData.concat(data);
      }
    }

    return activeData;
  }

  /**
   * 子要素をソートする 再帰呼び出し
   * @memberof SaveData
   */
  public sortChild(): void {
    if (this.name !== 'root' && this.isDirectory) {
      this.childItems.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;

        const sa = String(a.name).replace(/(\d+)/g, (m) => m.padStart(30, '0'));
        const sb = String(b.name).replace(/(\d+)/g, (m) => m.padStart(30, '0'));
        if (sa < sb) return -1;
        return sa > sb ? 1 : 0;
      });

      for (let i = 0; i < this.childItems.length; i += 1) {
        this.childItems[i].sortChild();
      }
    }
  }

  /**
   * 計算画面で適用されている編成データを取得 なければundefined
   * @returns {(SaveData | undefined)}
   * @memberof SaveData
   */
  public getMainData(): SaveData | undefined {
    if (this.isMain && !this.isDirectory) {
      return this;
    }

    for (let i = 0; i < this.childItems.length; i += 1) {
      const data = this.childItems[i].getMainData();
      if (data) {
        return data;
      }
    }

    return undefined;
  }

  /**
   * 引数のデータを、選択状態にあるディレクトリの子要素として追加を試みる
   * @param {SaveData} saveData
   * @returns {boolean} 失敗時false
   * @memberof SaveData
   */
  public addNewFileToSelectedData(saveData: SaveData): boolean {
    if (!this.isDirectory) {
      // 自身がディレクトリでない時点で検索終了
      return false;
    }
    // 自身が選択状態ならここに追加して終了
    if (this.selected) {
      this.childItems.push(saveData);
      this.sortChild();
      this.selected = true;
      this.isOpen = true;
      return true;
    }
    // 子要素のファイルの中で選択状態のものがあるならここに追加
    if (this.childItems.some((v) => !v.isDirectory && v.selected)) {
      this.childItems.push(saveData);
      this.sortChild();
      this.isOpen = true;
      return true;
    }

    // ここまでなければ子要素を再帰呼び出し
    for (let i = 0; i < this.childItems.length; i += 1) {
      if (this.childItems[i].addNewFileToSelectedData(saveData)) {
        // 再帰呼び出しの結果追加が行われたら終了
        return true;
      }
    }

    return false;
  }

  /**
   * このデータの子孫要素に含まれる全てのIDを取得
   * @returns {string[]}
   * @memberof SaveData
   */
  public getAllDataId(): string[] {
    let ids: string[] = [this.id];

    for (let i = 0; i < this.childItems.length; i += 1) {
      ids = ids.concat(this.childItems[i].getAllDataId());
    }

    return ids;
  }

  /**
   * 引数の計算データを履歴に追加 最大20件
   * @param {CalcManager} calcManager
   * @memberof SaveData
   */
  public putHistory(calcManager: CalcManager): void {
    if (this.tempIndex < this.tempData.length - 1) {
      // 中途半端な位置にインデックスがある場合、以降をいったん削除
      this.tempData = this.tempData.slice(0, this.tempIndex + 1);
      if (this.tempSavedIndex >= this.tempData.length) {
        // 削除された中に最終セーブ箇所があれば破棄
        this.tempSavedIndex = -1;
      }
    }

    // ひたすらケツに突っ込むことだけを考える
    this.tempData.push(cloneDeep(calcManager));
    this.tempIndex += 1;

    const maxCount = 20;
    if (this.tempData.length > maxCount) {
      // 履歴は最新の20件
      this.tempData = this.tempData.splice(-maxCount);
      this.tempIndex = maxCount - 1;
      // 最終セーブ位置をずらす
      this.tempSavedIndex -= 1;
    }
  }

  /**
   * 現在展開中のデータで上書き保存
   * @memberof SaveData
   */
  public saveManagerData(): void {
    this.manager = this.createSaveDataString();
    // 最終セーブIndexを更新
    this.tempSavedIndex = this.tempIndex;
  }

  /**
   * セーブデータ保存用の文字列を返却
   * @return {*}  {string}
   * @memberof SaveData
   */
  private createSaveDataString(): string {
    const replacer = (key: unknown, v: unknown) => {
      if (v instanceof Item) {
        const data = { i: v.data.id } as SavedItem;
        if (v.level) data.l = v.level;
        if (v.remodel) data.r = v.remodel;
        if (v.fullSlot) data.s = v.fullSlot;
        return data;
      }
      if (v instanceof ItemMaster || v instanceof EnemyMaster || v instanceof ShipMaster) {
        return { id: v.id };
      }
      if (v instanceof Enemy) {
        // 敵情報はIDのみ マスタから毎回復活させる
        const data = { i: v.data.id } as SavedShip;
        if (v.isEscort) data.es = v.isEscort;
        return data;
      }
      if (v instanceof Ship) {
        const data = {
          i: v.data.id, is: v.items, ac: v.isActive, es: v.isEscort,
        } as SavedShip;
        if (v.luck) data.lu = v.luck;
        if (v.level) data.lv = v.level;
        if (v.area > 0) data.ar = v.area;
        if (v.exItem) data.ex = v.exItem;
        if (v.antiAir) data.aa = v.antiAir;
        return data;
      }
      if (v instanceof EnemyFleet) {
        return {
          enemies: v.enemies,
          cellType: v.cellType,
          formation: v.formation,
          range: v.radius,
          area: v.area,
          nodeName: v.nodeName,
          mainFleetFormation: v.mainFleetFormation,
        };
      }
      if (v instanceof Fleet) {
        return { ships: v.ships, isUnion: v.isUnion };
      }
      if (v instanceof Airbase) {
        return { items: v.items, battleTarget: v.battleTarget, mode: v.mode };
      }
      if (v instanceof AirbaseInfo) {
        return { airbases: v.airbases, difficultyLevel: v.difficultyLevel, isDefense: v.isDefense };
      }
      if (v instanceof BattleInfo) {
        return { fleets: v.fleets, battleCount: v.battleCount, airRaidFleet: v.airRaidFleet };
      }
      if (v instanceof FleetInfo) {
        return {
          fleets: v.fleets, admiralLevel: v.admiralLevel, isUnion: v.isUnion,
        };
      }
      return v;
    };

    // 現在のインデックスのデータ
    const managerData = this.tempData[this.tempIndex];
    if (!managerData) {
      return '';
    }
    // JSONにパースして保存
    const data = JSON.stringify(managerData, replacer);
    // 一度復元してチェック
    JSON.parse(data);

    return data;
  }

  /**
   * URL搭載用セーブデータを返却
   * @return {*}  {string}
   * @memberof SaveData
   */
  public createURLSaveDataString(): string {
    return LZString.compressToEncodedURIComponent(this.createSaveDataString());
  }

  /**
   * URLパラメータからセーブデータを初期化
   * @static
   * @param {string} param
   * @return {*}  {SaveData}
   * @memberof SaveData
   */
  public static decodeURLSaveData(param: string): SaveData {
    const data = new SaveData();
    data.name = '外部データ';
    const json = LZString.decompressFromEncodedURIComponent(param);
    if (json) {
      data.manager = json;
    }

    return data;
  }

  /**
   * この編成データに保存されているデータからcalcManagerインスタンスを生成
   * なければ初期データ いずれもcloneDeep適用済み
   * @param {ItemMaster[]} itemMasters
   * @param {ShipMaster[]} shipMasters
   * @param {EnemyMaster[]} enemyMasters
   * @param {number} [initialAdmiralLevel=120] 新規データ時の初期司令部レベル
   * @return {*}  {CalcManager}
   * @memberof SaveData
   */
  public loadManagerData(itemMasters: ItemMaster[], shipMasters: ShipMaster[], enemyMasters: EnemyMaster[], initialAdmiralLevel = 120): CalcManager {
    if (this.tempData.length) {
      // 一時保存領域にデータがあればそちら
      if (this.tempIndex >= this.tempData.length) {
        // 一応範囲外チェック
        this.tempIndex = this.tempData.length - 1;
      }
      return cloneDeep(this.tempData[this.tempIndex]);
    }

    if (!this.manager) {
      const newData = new CalcManager();
      newData.fleetInfo = new FleetInfo({ admiralLevel: initialAdmiralLevel });
      newData.resetAll = true;
      // 一時保存データにこの情報を突っ込む
      this.tempData = [cloneDeep(newData)];
      this.tempIndex = 0;
      this.tempSavedIndex = 0;
      return newData;
    }

    // セーブデータ内文字列データから編成を復元 重いので本当に初回だけ呼ぶようにする
    const resultData = SaveData.loadSaveDataManagerString(this.manager, itemMasters, shipMasters, enemyMasters);

    // 一時保存データにこの情報を突っ込む
    this.tempData = [cloneDeep(resultData)];
    this.tempIndex = 0;
    this.tempSavedIndex = 0;

    return resultData;
  }

  /**
   * セーブデータ内文字列データから編成を復元
   * @static
   * @param {string} managerString
   * @param {ItemMaster[]} itemMasters
   * @param {ShipMaster[]} shipMasters
   * @param {EnemyMaster[]} enemyMasters
   * @return {*}  {CalcManager}
   * @memberof SaveData
   */
  public static loadSaveDataManagerString(managerString: string, itemMasters: ItemMaster[], shipMasters: ShipMaster[], enemyMasters: EnemyMaster[]): CalcManager {
    if (!managerString || !managerString.length) {
      return new CalcManager();
    }
    const manager = JSON.parse(managerString) as CalcManager;
    // 基地復元
    const airbases: Airbase[] = [];
    const rawAirbases = manager.airbaseInfo.airbases;
    for (let i = 0; i < rawAirbases.length; i += 1) {
      const airbase = rawAirbases[i];
      const rawItems = airbase.items;
      const items: Item[] = [];

      for (let j = 0; j < rawItems.length; j += 1) {
        const item = rawItems[j] as unknown as SavedItem;
        const itemMaster = itemMasters.find((v) => v.id === item.i);
        if (itemMaster) {
          items.push(new Item({
            master: itemMaster, slot: item.s, level: item.l, remodel: item.r,
          }));
        } else {
          // マスタにない装備は空で生成
          items.push(new Item({ slot: item.s }));
        }
      }
      airbases.push(new Airbase({ airbase, items }));
    }
    manager.airbaseInfo = new AirbaseInfo({ info: manager.airbaseInfo, airbases });

    // 艦隊復元
    const fleets: Fleet[] = [];
    const rawFleets = manager.fleetInfo.fleets;
    for (let i = 0; i < rawFleets.length; i += 1) {
      const fleet = rawFleets[i];
      const rawShips = fleet.ships;
      const ships: Ship[] = [];

      for (let j = 0; j < rawShips.length; j += 1) {
        const ship = rawShips[j] as unknown as SavedShip;
        const rawItems = ship.is;
        const items: Item[] = [];
        for (let k = 0; k < rawItems.length; k += 1) {
          const item = rawItems[k] as unknown as SavedItem;
          const itemMaster = itemMasters.find((v) => v.id === item.i);
          if (itemMaster) {
            items.push(new Item({
              master: itemMaster, slot: item.s, level: item.l, remodel: item.r,
            }));
          } else {
            // マスタにない装備は空で生成
            items.push(new Item({ slot: item.s }));
          }
        }
        // 補強増設の解決
        const item = ship.ex as unknown as SavedItem;
        const exItemMaster = itemMasters.find((v) => v.id === item.i);
        let expandItem: Item;
        if (exItemMaster) {
          expandItem = new Item({ master: exItemMaster, level: item.l, remodel: item.r });
        } else {
          expandItem = new Item();
        }

        // 現行マスタから艦娘情報を取得
        const shipMaster = shipMasters.find((v) => v.id === ship.i);
        const area = ship.ar && ship.ar > 0 ? ship.ar : undefined;
        if (shipMaster) {
          ships.push(new Ship({
            master: shipMaster, items, exItem: expandItem, antiAir: ship.aa, luck: ship.lu, level: ship.lv, isActive: ship.ac, isEscort: ship.es, area,
          }));
        } else {
          // いなければ空データ 装備は引き継ぐが…
          ships.push(new Ship({
            items, exItem: expandItem, level: ship.lv, isEscort: ship.es, area,
          }));
        }
      }
      fleets.push(new Fleet({ fleet, ships, formation: 1 }));
    }
    manager.fleetInfo = new FleetInfo({ info: manager.fleetInfo, fleets, mainFleetIndex: 0 });

    // 敵艦隊復元
    const enemyFleet: EnemyFleet[] = [];
    const rawEnemyFleets = manager.battleInfo.fleets;
    for (let i = 0; i < rawEnemyFleets.length; i += 1) {
      const fleet = rawEnemyFleets[i];
      const rawShips = fleet.enemies;
      const enemies: Enemy[] = [];
      for (let j = 0; j < rawShips.length; j += 1) {
        // IDよりマスタから復元する
        const enemy = rawShips[j] as unknown as SavedShip;
        enemies.push(Enemy.createEnemyFromMasterId(enemy.i, !!enemy.es, enemyMasters, itemMasters));
      }
      enemyFleet.push(new EnemyFleet({ fleet, enemies }));
    }
    // 空襲敵艦隊復元
    if (manager.battleInfo.airRaidFleet) {
      const ships = [];
      const { enemies, formation, cellType } = manager.battleInfo.airRaidFleet;
      for (let i = 0; i < enemies.length; i += 1) {
        const enemy = enemies[i] as unknown as SavedShip;
        ships.push(Enemy.createEnemyFromMasterId(enemy.i, !!enemy.es, enemyMasters, itemMasters));
      }
      const airRaidFleet = new EnemyFleet({ enemies: ships, formation, cellType });
      manager.battleInfo = new BattleInfo({ info: manager.battleInfo, fleets: enemyFleet, airRaidFleet });
    } else {
      manager.battleInfo = new BattleInfo({ info: manager.battleInfo, fleets: enemyFleet, airRaidFleet: new EnemyFleet() });
    }

    const resultData = new CalcManager();
    resultData.airbaseInfo = manager.airbaseInfo;
    resultData.fleetInfo = manager.fleetInfo;
    resultData.battleInfo = manager.battleInfo;
    // タブ切り替えは全ての情報をリセットする
    resultData.resetAll = true;

    return resultData;
  }

  /**
   * 全一時保存セーブデータ内の敵艦を新しい敵艦で更新
   * 専ら敵艦手動設定完了時に呼び出す
   * @param {EnemyMaster} enemyMaster 新敵艦情報
   * @param {ItemMaster[]} items 全装備
   * @memberof SaveData
   */
  public updateEnemyMasterInCalcData(enemyMaster: EnemyMaster, items: ItemMaster[]): void {
    if (this.isDirectory) {
      // 再帰呼び出し
      for (let i = 0; i < this.childItems.length; i += 1) {
        this.childItems[i].updateEnemyMasterInCalcData(enemyMaster, items);
      }
    } else if (this.tempData.length) {
      // 自身の履歴内の全計算データの敵艦の更新
      const data = this.tempData;
      for (let i = 0; i < data.length; i += 1) {
        const manager = data[i];
        if (!manager || !manager.battleInfo.fleets.length) {
          continue;
        }

        for (let j = 0; j < manager.battleInfo.fleets.length; j += 1) {
          const fleet = manager.battleInfo.fleets[j];
          const newEnemies = [];
          let isUpdated = false;
          for (let k = 0; k < fleet.enemies.length; k += 1) {
            const enemy = fleet.enemies[k];
            if (enemy.data.id !== enemyMaster.id) {
              newEnemies.push(enemy);
              continue;
            }
            // 更新対象敵艦だった場合 => 再インスタンス化
            const newEnemy = Enemy.createEnemyFromMaster(enemyMaster, enemy.isEscort, items);
            newEnemies.push(newEnemy);
            isUpdated = true;
          }

          // 更新があるなら艦隊再インスタンス化
          if (isUpdated) {
            manager.battleInfo.fleets[j] = new EnemyFleet({ fleet, enemies: newEnemies });
          }
        }

        // 空襲編成も
        if (manager.battleInfo.airRaidFleet.enemies.length) {
          const fleet = manager.battleInfo.airRaidFleet;
          const newEnemies = [];
          let isUpdated = false;
          for (let k = 0; k < fleet.enemies.length; k += 1) {
            const enemy = fleet.enemies[k];
            if (enemy.data.id !== enemyMaster.id) {
              newEnemies.push(enemy);
              continue;
            }
            // 更新対象敵艦だった場合 => 再インスタンス化
            const newEnemy = Enemy.createEnemyFromMaster(enemyMaster, enemy.isEscort, items);
            newEnemies.push(newEnemy);
            isUpdated = true;
          }

          // 更新があるなら艦隊再インスタンス化
          if (isUpdated) {
            manager.battleInfo = new BattleInfo({ info: manager.battleInfo, airRaidFleet: new EnemyFleet({ fleet, enemies: newEnemies }) });
          }
        }
      }
    }
  }
}
