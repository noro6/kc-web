import * as _ from 'lodash';
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
}

export default class SaveData {
  /** 一意識別用id */
  public readonly id: string;

  /** ディレクトリかどうか */
  public isDirectory: boolean;

  /** 名称 */
  public name: string;

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

  /** 保存されていないデータ 新規追加されたやつ アプリ終了時に消しとばす */
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

  /**
   * インスタンス化
   * @param {SaveData} [data]
   * @memberof SaveData
   */
  constructor(id?: string) {
    if (id) {
      this.id = id;
    } else {
      this.id = new Date().getTime().toString(16) + Math.floor(Math.random() * 10000);
    }
    this.name = '無題';
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
    saveData.isDirectory = data.isDirectory;
    saveData.manager = data.manager;
    saveData.isActive = data.isActive;
    saveData.isOpen = data.isOpen;
    saveData.isUnsaved = false;

    // 子要素を再帰的に復帰
    for (let i = 0; i < data.childItems.length; i += 1) {
      saveData.childItems.push(SaveData.getInstance(data.childItems[i]));
    }

    return saveData;
  }

  /**
   * ブラウザ保存用データ
   * @param {*} data
   * @returns {SaveData}
   * @memberof SaveData
   */
  public getMinifyData(): SaveData {
    const replacer = (key: unknown, v: unknown) => {
      if (v instanceof SaveData) {
        return {
          id: v.id, name: v.name, manager: v.manager, isDirectory: v.isDirectory, childItems: v.childItems, isOpen: v.isOpen, isActive: v.isActive,
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
  public get isEditted(): boolean {
    return this.tempSavedIndex !== this.tempIndex;
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

        return a.name.localeCompare(b.name);
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
    this.tempData.push(_.cloneDeep(calcManager));
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
        const data = { i: v.data.id, is: v.items } as SavedShip;
        if (v.isEscort) data.es = v.isEscort;
        return data;
      }
      if (v instanceof Ship) {
        const data = {
          i: v.data.id, is: v.items, ac: v.isActive, es: v.isEscort,
        } as SavedShip;
        if (v.luck) data.lu = v.luck;
        if (v.level) data.lv = v.level;
        if (v.exItem) data.ex = v.exItem;
        if (v.antiAir) data.aa = v.antiAir;
        return data;
      }
      if (v instanceof EnemyFleet) {
        return {
          enemies: v.enemies, cellType: v.cellType, formation: v.formation, range: v.range, nodeName: v.nodeName,
        };
      }
      if (v instanceof Fleet) {
        return { ships: v.ships, formation: v.formation, isUnion: v.isUnion };
      }
      if (v instanceof Airbase) {
        return { items: v.items, battleTarget: v.battleTarget, mode: v.mode };
      }
      if (v instanceof AirbaseInfo) {
        return { airbases: v.airbases, difficultyLevel: v.difficultyLevel, isDefense: v.isDefense };
      }
      if (v instanceof BattleInfo) {
        return { fleets: v.fleets, battleCount: v.battleCount };
      }
      if (v instanceof FleetInfo) {
        return {
          fleets: v.fleets, admiralLevel: v.admiralLevel, isUnion: v.isUnion, mainFleetIndex: v.mainFleetIndex,
        };
      }
      return v;
    };

    // 現在のインデックスのデータ
    const managerData = this.tempData[this.tempIndex];
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
   * @returns {CalcManager}
   * @memberof SaveData
   */
  public loadManagerData(itemMasters: ItemMaster[], shipMasters: ShipMaster[], enemyMasters: EnemyMaster[]): CalcManager {
    if (this.tempData.length) {
      // 一時保存領域にデータがあればそちら
      if (this.tempIndex >= this.tempData.length) {
        // 一応範囲外チェック
        this.tempIndex = this.tempData.length - 1;
      }
      return _.cloneDeep(this.tempData[this.tempIndex]);
    }

    if (!this.manager) {
      const newData = new CalcManager();
      newData.resetAll = true;
      // 一時保存データにこの情報を突っ込む
      this.tempData = [_.cloneDeep(newData)];
      this.tempIndex = 0;
      this.tempSavedIndex = 0;
      return newData;
    }

    // セーブデータ内文字列データから編成を復元 重いので本当に初回だけ呼ぶようにする
    const manager = JSON.parse(this.manager) as CalcManager;

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
        if (shipMaster) {
          ships.push(new Ship({
            master: shipMaster, items, exItem: expandItem, antiAir: ship.aa, luck: ship.lu, level: ship.lv, isActive: ship.ac, isEscort: ship.es,
          }));
        } else {
          // いなければ空データ 装備は引き継ぐが…
          ships.push(new Ship({
            items, exItem: expandItem, level: ship.lv, isEscort: ship.es,
          }));
        }
      }
      fleets.push(new Fleet({ fleet, ships }));
    }
    manager.fleetInfo = new FleetInfo({ info: manager.fleetInfo, fleets });

    // 敵艦隊復元
    const enemyFleet: EnemyFleet[] = [];
    const rawEnemyFleets = manager.battleInfo.fleets;
    for (let i = 0; i < rawEnemyFleets.length; i += 1) {
      const fleet = rawEnemyFleets[i];
      const rawShips = fleet.enemies;
      const enemies: Enemy[] = [];
      for (let j = 0; j < rawShips.length; j += 1) {
        const enemy = rawShips[j] as unknown as SavedShip;
        const rawItems = enemy.is;
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
            items.push(new Item());
          }
        }
        const enemyMaster = enemyMasters.find((v) => v.id === enemy.i);
        if (enemyMaster) {
          enemies.push(new Enemy(enemyMaster, items, enemy.es));
        } else {
          enemies.push(new Enemy(new EnemyMaster(), [], enemy.es));
        }
      }
      enemyFleet.push(new EnemyFleet({ fleet, enemies }));
    }
    manager.battleInfo = new BattleInfo({ info: manager.battleInfo, fleets: enemyFleet });

    const resultData = new CalcManager();
    resultData.airbaseInfo = manager.airbaseInfo;
    resultData.fleetInfo = manager.fleetInfo;
    resultData.battleInfo = manager.battleInfo;
    // タブ切り替えは全ての情報をリセットする
    resultData.resetAll = true;

    // 一時保存データにこの情報を突っ込む
    this.tempData = [_.cloneDeep(resultData)];
    this.tempIndex = 0;
    this.tempSavedIndex = 0;

    return resultData;
  }
}