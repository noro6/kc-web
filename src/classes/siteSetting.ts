export default class SiteSetting {
  public id: string;

  /** タブを閉じる際に確認ダイアログを出す */
  public confirmCloseTab: boolean;

  /** サイトテーマ */
  public darkTheme: boolean;

  /** 初期熟練度リスト */
  public planeInitialLevels: { id: number, level: number }[];

  /** 装備一覧 表示形式 複数列かどうか */
  public isMultiLineForItemList: boolean;

  /** 艦娘一覧 表示形式 複数列かどうか */
  public isMultiLineForShipList: boolean;

  /** 装備一覧 所持装備のみ表示かどうか */
  public isStockOnlyForItemList: boolean;

  /** 装備一覧 在籍艦娘のみ表示かどうか */
  public isStockOnlyForShipList: boolean;

  constructor(setting?: SiteSetting) {
    if (setting) {
      this.id = setting.id;
      this.confirmCloseTab = setting.confirmCloseTab;
      this.darkTheme = setting.darkTheme;
      this.isMultiLineForItemList = setting.isMultiLineForItemList;
      this.isMultiLineForShipList = setting.isMultiLineForShipList;
      this.isStockOnlyForItemList = setting.isStockOnlyForItemList;
      this.isStockOnlyForShipList = setting.isStockOnlyForShipList;
      this.planeInitialLevels = setting.planeInitialLevels;
    } else {
      this.id = 'setting';
      this.confirmCloseTab = true;
      this.darkTheme = false;
      this.isMultiLineForItemList = true;
      this.isMultiLineForShipList = true;
      this.isStockOnlyForItemList = false;
      this.isStockOnlyForShipList = false;
      this.planeInitialLevels = [
        { id: 6, level: 100 },
        { id: 7, level: 0 },
        { id: 8, level: 0 },
        { id: 9, level: 100 },
        { id: 57, level: 0 },
        { id: 10, level: 100 },
        { id: 11, level: 0 },
        { id: 45, level: 100 },
        { id: 41, level: 100 },
        { id: 47, level: 0 },
        { id: 53, level: 0 },
        { id: 48, level: 100 },
        { id: 49, level: 0 },
      ];
    }
  }
}
