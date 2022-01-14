export default class SiteSetting {
  /** タブを閉じる際に確認ダイアログを出す */
  public confirmCloseTab = true;

  /** サイトテーマ */
  public darkTheme = false;

  /** 初期熟練度リスト */
  public planeInitialLevels = [
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

  /** 装備一覧 表示形式 複数列かどうか */
  public isMultiLineForItemList = true;

  /** 艦娘一覧 表示形式 複数列かどうか */
  public isMultiLineForShipList = true;

  /** 装備一覧 所持装備のみ表示かどうか */
  public isStockOnlyForItemList = false;

  /** 装備一覧 在籍艦娘のみ表示かどうか */
  public isStockOnlyForShipList = false;
}
