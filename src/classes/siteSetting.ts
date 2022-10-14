export type SiteTheme = 'light' | 'ice' | 'pink' | 'green' | 'dark' | 'deep-sea' | '';

/** 装備UI設定 */
export interface itemUISetting {
  border: boolean;
  bold: boolean;
  radius: boolean;
}

export default class SiteSetting {
  public id: string;

  /** タブを閉じる際に確認ダイアログを出す */
  public confirmCloseTab: boolean;

  /** サイトテーマ */
  public themeDetail: SiteTheme;

  /** サイドバー固定表示 */
  public fixedDrawer: boolean;

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

  /** 在籍艦娘一覧 表示モード */
  public viewTableMode: boolean;

  /** 基地最小化 */
  public isMinimizedAirbase: boolean;

  /** 自艦隊最小化 */
  public isMinimizedFleet: boolean;

  /** 敵艦隊最小化 */
  public isMinimizedEnemy: boolean;

  /** 計算結果最小化 */
  public isMinimizedResult: boolean;

  /** 補足情報最小化 */
  public isMinimizedDescription: boolean;

  /** コンテンツ順序 id準拠 */
  public contentOrder: string[];

  /** シミュ回数 */
  public simulationCount: number;

  /** 司令部レベル */
  public admiralLevel: number;

  /** アップロード名 */
  public userName: string;

  /** 装備所持数 総所持数カウント */
  public visibleItemStockAllCount: boolean;

  /** 艦隊画面 最大列数を2にするかどうか */
  public isShipView2Line: boolean;

  /** 装備所持数 総所持数カウント */
  public visibleAirCalcMenuButton: boolean;

  /** 装備表示UI */
  public itemUI: itemUISetting;

  /** 装備詳細ポップアップoff */
  public disabledItemTooltip: boolean;

  /** デッキビルダーからの取込時、全て取り込む */
  public importAllDeck: boolean;

  /** 言語 */
  public locale: 'ja' | 'en';

  /** 艦娘 装備名を翻訳しないフラグ */
  public nameIsNotTranslate: boolean;

  /** フィルタ保存値 */
  public savedItemListFilter: { parent: 'ship' | 'airbase', key: string, value: number }[];

  /** 艦娘一覧 検索条件保存値 */
  public savedShipListFilter: { isFinalOnly: boolean }

  /** 艦隊分析コード ロック済みを含むかどうかの記憶 */
  public isIncludeUnLockCode: boolean;

  /** ブラックリスト装備 */
  public blacklistItemIds: number[];

  /** 特効表示タイプ */
  public displayBonusType: number;

  constructor(setting?: SiteSetting) {
    if (setting) {
      this.id = setting.id;
      this.confirmCloseTab = !!setting.confirmCloseTab;
      this.fixedDrawer = !!setting.fixedDrawer;
      this.isMultiLineForItemList = !!setting.isMultiLineForItemList;
      this.isMultiLineForShipList = !!setting.isMultiLineForShipList;
      this.isStockOnlyForItemList = !!setting.isStockOnlyForItemList;
      this.isStockOnlyForShipList = !!setting.isStockOnlyForShipList;
      this.viewTableMode = !!setting.viewTableMode;
      this.isMinimizedAirbase = !!setting.isMinimizedAirbase;
      this.isMinimizedFleet = !!setting.isMinimizedFleet;
      this.isMinimizedEnemy = !!setting.isMinimizedEnemy;
      this.isMinimizedResult = !!setting.isMinimizedResult;
      this.isMinimizedDescription = !!setting.isMinimizedDescription;
      this.simulationCount = setting.simulationCount ? setting.simulationCount : 5000;
      this.admiralLevel = setting.admiralLevel ? setting.admiralLevel : 120;
      this.userName = setting.userName ? setting.userName : '';
      this.themeDetail = setting.themeDetail ? setting.themeDetail : 'dark';
      this.visibleItemStockAllCount = !!setting.visibleItemStockAllCount;
      this.isShipView2Line = !!setting.isShipView2Line;
      this.visibleAirCalcMenuButton = !!setting.visibleAirCalcMenuButton;
      this.itemUI = setting.itemUI ? setting.itemUI : { border: false, bold: true, radius: true };
      this.disabledItemTooltip = !!setting.disabledItemTooltip;
      this.importAllDeck = !!setting.importAllDeck;
      this.locale = setting.locale ? setting.locale : 'ja';
      this.nameIsNotTranslate = !!setting.nameIsNotTranslate;
      this.savedItemListFilter = setting.savedItemListFilter ? setting.savedItemListFilter : [{ parent: 'ship', key: 'actualFire', value: 0 }, { parent: 'airbase', key: 'radius', value: 0 }];
      this.savedShipListFilter = setting.savedShipListFilter ? setting.savedShipListFilter : { isFinalOnly: true };
      // 特効表示一時停止
      this.displayBonusType = 0;
      this.blacklistItemIds = setting.blacklistItemIds ? setting.blacklistItemIds : [337];
      this.isIncludeUnLockCode = !!setting.isIncludeUnLockCode;

      if (!setting.planeInitialLevels || !setting.planeInitialLevels.length) {
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
          { id: 49, level: 25 },
        ];
        this.contentOrder = [];
      } else {
        this.planeInitialLevels = setting.planeInitialLevels;
      }
      this.contentOrder = setting.contentOrder ? setting.contentOrder : [];
    } else {
      this.id = 'setting';
      this.confirmCloseTab = true;
      this.fixedDrawer = false;
      this.isMultiLineForItemList = true;
      this.isMultiLineForShipList = true;
      this.isStockOnlyForItemList = false;
      this.isStockOnlyForShipList = false;
      this.viewTableMode = true;
      this.isMinimizedAirbase = false;
      this.isMinimizedFleet = false;
      this.isMinimizedEnemy = false;
      this.isMinimizedResult = false;
      this.isMinimizedDescription = false;
      this.simulationCount = 5000;
      this.admiralLevel = 120;
      this.userName = '';
      this.themeDetail = 'dark';
      this.visibleItemStockAllCount = false;
      this.isShipView2Line = false;
      this.visibleAirCalcMenuButton = false;
      this.itemUI = { border: false, bold: true, radius: true };
      this.disabledItemTooltip = false;
      this.importAllDeck = false;
      this.locale = 'ja';
      this.nameIsNotTranslate = false;
      this.savedItemListFilter = [{ parent: 'ship', key: 'actualFire', value: 0 }, { parent: 'airbase', key: 'radius', value: 0 }];
      this.savedShipListFilter = {
        isFinalOnly: true,
      };

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
        { id: 49, level: 25 },
      ];
      this.contentOrder = [];
      this.displayBonusType = 0;
      this.blacklistItemIds = [337];
      this.isIncludeUnLockCode = true;
    }
  }
}
