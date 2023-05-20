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

  /** 増設電探あり限定 */
  public canEquipExRadarOnly = false;

  /** 速力高速を含む */
  public includeFast = true;

  /** 速力低速を含む */
  public includeSlow = true;

  /** 海域札あり限定 */
  public hasAreaOnly = false;

  /** 海域札なし限定 */
  public hasNotAreaOnly = false;

  /** 補強増設あり限定 */
  public isReleaseExSlotOnly = false;

  /** 補強増設なし限定 */
  public isNotReleaseExSlotOnly = false;

  /** お気に入りのみ */
  public onlyBookmarked = false;

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
}
