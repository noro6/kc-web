import CalcManager from '../calcManager';

export default class SaveData {
  public readonly id: string;

  public isDirectory = false;

  public name = '';

  public saveData: CalcManager | undefined;

  public selected = false;

  public isOpen = false;

  public childItems: SaveData[] = [];

  constructor(name = '無題', isDirectory = false, items: SaveData[] = [], saveData?: CalcManager, isOpen = false, id?: string) {
    this.id = id || new Date().getTime().toString(16) + Math.floor(Math.random() * 10000);
    this.name = name;
    this.isDirectory = isDirectory;
    this.childItems = [];
    this.isOpen = isOpen;
    this.saveData = saveData;

    for (let i = 0; i < items.length; i += 1) {
      const data = items[i];
      this.childItems.push(new SaveData(data.name, data.isDirectory, data.childItems, data.saveData, data.isOpen, data.id));
    }
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
   * 引数のデータを、選択状態にあるフォルダの子要素として追加を試みる
   * @param {SaveData} saveData
   * @returns {boolean} 失敗時false
   * @memberof SaveData
   */
  public addNewFileToSelectedData(saveData: SaveData): boolean {
    if (!this.isDirectory) {
      // 自身がフォルダでない時点で検索終了
      return false;
    }
    // 自身が選択状態ならここに追加して終了
    if (this.selected) {
      this.childItems.push(saveData);
      this.selected = true;
      this.isOpen = true;
      return true;
    }
    // 子要素のファイルの中で選択状態のものがあるならここに追加
    if (this.childItems.some((v) => !v.isDirectory && v.selected)) {
      this.childItems.push(saveData);
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
}
