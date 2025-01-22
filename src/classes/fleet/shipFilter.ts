import Const from '../const';

/**
 * カスタムフィルタ用クラス
 * @export
 * @class ShipFilter
 */
export default class ShipFilter {
  /** このフィルタを適用するかどうか */
  public enabled = true;

  /** 初期改造状態を含む */
  public includeInitial = true;

  /** 中間改造状態を含む */
  public includeIntermediate = true;

  /** 最終改造状態を含む */
  public includeFinal = true;

  /** 大発系OK */
  public landingCraftOK = false;

  /** 大発系NG */
  public landingCraftNG = false;

  /** カミ車系OK */
  public tankOK = false;

  /** カミ車系NG */
  public tankNG = false;

  /** 艦戦系搭載OK */
  public fighterOK = false;

  /** 艦戦系搭載NG */
  public fighterNG = false;

  /** 水上爆撃系搭載OK */
  public spBomberOK = false;

  /** 水上爆撃系搭載NG */
  public spBomberNG = false;

  /** 甲標的系搭載可能 */
  public midgetSubmarineOK = false;

  /** 大型探照灯系搭載可能 */
  public largeSearchlightOK = false;

  /** 護衛空母限定 */
  public escortCarrierOnly = false;

  /** 司令部系搭載OK */
  public commanderOK = false;

  /** 司令部系搭載NG */
  public commanderNG = false;

  /** バルジ系搭載OK */
  public armorOK = false;

  /** バルジ系搭載NG */
  public armorNG = false;

  /** 増設副砲あり限定 */
  public canEquipExSubGunOnly = false;

  /** 増設13号電探限定 */
  public canEquip13RadarOnly = false;

  /** 増設22号電探限定 */
  public canEquip22RadarOnly = false;

  /** 増設その他の電探限定 */
  public canEquipRadarOnly = false;

  /** 増設電マ限定 */
  public canEquipMastRadarOnly = false;

  /** 増設司令部限定 */
  public canEquipExCommanderOnly = false;

  /** 増設カミ車限定 */
  public canEquipExTankOnly = false;

  /** 増設バルジ限定 */
  public canEquipExArmorOnly = false;

  /** 増設爆雷限定 */
  public canEquipExDepthChargeOnly = false;

  /** 速力高速を含む */
  public includeFast = true;

  /** 速力低速を含む */
  public includeSlow = true;

  /** 射程短を含む */
  public includeRange1 = true;

  /** 射程中を含む */
  public includeRange2 = true;

  /** 射程長を含む */
  public includeRange3 = true;

  /** 射程超長を含む */
  public includeRange4 = true;

  /** 海域札あり限定 */
  public hasAreaOnly = false;

  /** 海域札なし限定 */
  public hasNotAreaOnly = false;

  /** 海域札フィルタ */
  public selectedArea = 0;

  /** 補強増設あり限定 */
  public isReleaseExSlotOnly = false;

  /** 補強増設なし限定 */
  public isNotReleaseExSlotOnly = false;

  /** 自動先制対潜のみ */
  public onlyAutoOASW = false;

  /** お気に入りのみ */
  public onlyBookmarked = false;

  /** ケッコン艦のみ */
  public onlyMarriage = false;

  /** スロット数2 */
  public slotCount2 = false;

  /** スロット数3 */
  public slotCount3 = false;

  /** スロット数4 */
  public slotCount4 = false;

  /** スロット数5 */
  public slotCount5 = false;

  /** 耐久4n-x */
  public HPIs4n1 = true;

  /** 耐久4n-x */
  public HPIs4n2 = true;

  /** 耐久4n-x */
  public HPIs4n3 = true;

  /** 耐久4n-x */
  public HPIs4n = true;

  /** レベルフィルタ */
  public levelRange = [1, +Const.MAX_LEVEL];

  /** 運フィルタ */
  public luckRange = [1, 200];

  /** 対潜値フィルタ */
  public aswRange = [0, 150];

  /** 耐久フィルタ */
  public HPRange = [1, 120];

  /** 火力フィルタ */
  public fireRange = [1, 200];

  /** 雷装フィルタ */
  public torpedoRange = [0, 150];

  /** 夜戦火力フィルタ */
  public nightRange = [1, 300];

  /** 国籍フィルタ */
  public nationalities = [
    {
      text: '日本',
      value: 0,
      filter: [],
      isChecked: true,
    },
    {
      text: 'アメリカ',
      value: 1,
      filter: Const.USA,
      isChecked: true,
    },
    {
      text: 'イタリア',
      value: 2,
      filter: Const.ITA,
      isChecked: true,
    },
    {
      text: 'イギリス',
      value: 3,
      filter: Const.GBR,
      isChecked: true,
    },
    {
      text: 'ドイツ',
      value: 4,
      filter: Const.DEU,
      isChecked: true,
    },
    {
      text: 'フランス',
      value: 5,
      filter: Const.FRA,
      isChecked: true,
    },
    {
      text: 'ソ連',
      value: 6,
      filter: Const.RUS,
      isChecked: true,
    },
    {
      text: 'その他',
      value: 7,
      filter: Const.AUS.concat(Const.SWE).concat(Const.NLD),
      isChecked: true,
    },
  ];

  /**
   * 足りないプロパティが発生していたら初期化して返す。
   * @param data
   * @returns
   */
  public static restore(data: ShipFilter | undefined) {
    if (!data) {
      return new ShipFilter();
    }

    // 旧設定ファイルのプロパティ一覧
    const keys = Object.keys(data);
    // 最新設定ファイル
    const filter = new ShipFilter();
    let isLack = false;
    // 最新設定ファイルのキーがすべて含まれているかチェック
    Object.keys(filter).forEach((v) => {
      if (!keys.includes(v)) {
        isLack = true;
      }
    });

    return isLack ? new ShipFilter() : data;
  }
}
