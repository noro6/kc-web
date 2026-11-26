import { bonusData as slotitemBonuses } from './bonusData';

export type ItemBonusStatus = {
  firePower?: number;
  torpedo?: number;
  antiAir?: number;
  armor?: number;
  asw?: number;
  scout?: number;
  avoid?: number;
  accuracy?: number;
  bomber?: number;
  range?: number;
  fromTypeId?: number;
};

export type Bonus = {
  /** 上昇するステータス */
  bonus: ItemBonusStatus;
  /** 艦型(未改造id) */
  shipBase?: number[];
  /** 艦型(白露型 など) */
  shipClass?: number[];
  /** 国籍。対象国の艦型idの配列 */
  shipCountry?: number[];
  /** 艦種(駆逐 軽巡...) */
  shipType?: number[];
  /** 艦種娘固有id */
  shipId?: number[];
  /** 必須の組み合わせ装備種別 */
  requiresType?: number[];
  /** 必須の組み合わせ水上電探有無 */
  requiresSR?: number;
  /** 必須の組み合わせ対空電探有無 */
  requiresAR?: number;
  /** 必須の組み合わせ命中+8以上電探有無 */
  requiresAccR?: number;
  /** 必須の組み合わせ装備id */
  requiresId?: number[];
  /** 必須の組み合わせ装備id個数 requiresIdに一致する装備の最低限必要数 */
  requiresIdNum?: number;
  /** 必須の組み合わせ装備idの改修値 requiresIdに一致する装備の最低限必要改修★数 */
  requiresIdLevel?: number;
  /** 必須の組み合わせ装備id */
  requiresId2?: number[];
  /** 必須の組み合わせ装備idの改修値 requiresIdに一致する装備の最低限必要改修★数 */
  requiresIdLevel2?: number;
  /**
   * 同時に満たす装備条件。配列の各要素はAND。
   * 要素内の requiresId はOR。
   */
  requiresEquipList?: {
    requiresId: number[];
    requiresIdNum?: number;
    requiresIdLevel?: number;
  }[];
  /** 該当装備の最低限必要改修★数 */
  remodel?: number;
  /**
   * これがなければ累積可能
   * 存在する場合、上記の条件を全て満たしている装備の最低限の個数 4連装酸素魚雷辺りがわかりやすい
   * 累積可能でも require 系の条件を持つものがある
   */
  num?: number;
};

export type Bonuses = {
  types?: number[];
  ids?: number[];
  bonuses: Bonus[];
};

export default class ItemBonus {
  /**
   * 装備ボーナス配列から合計のボーナスを算出する
   * @static
   * @param {ItemBonusStatus[]} bonuses
   * @return {*}  {ItemBonusStatus}
   * @memberof ItemBonus
   */
  public static getTotalBonus(bonuses: ItemBonusStatus[]): ItemBonusStatus {
    const bonus = {
      firePower: 0,
      torpedo: 0,
      antiAir: 0,
      armor: 0,
      asw: 0,
      scout: 0,
      avoid: 0,
      accuracy: 0,
      bomber: 0,
      range: 0,
    };

    for (let i = 0; i < bonuses.length; i += 1) {
      const v = bonuses[i];
      bonus.firePower += v.firePower ? v.firePower : 0;
      bonus.torpedo += v.torpedo ? v.torpedo : 0;
      bonus.antiAir += v.antiAir ? v.antiAir : 0;
      bonus.armor += v.armor ? v.armor : 0;
      bonus.asw += v.asw ? v.asw : 0;
      bonus.scout += v.scout ? v.scout : 0;
      bonus.avoid += v.avoid ? v.avoid : 0;
      bonus.accuracy += v.accuracy ? v.accuracy : 0;
      bonus.bomber += v.bomber ? v.bomber : 0;
      bonus.range += v.range ? v.range : 0;
    }

    return bonus;
  }

  public static readonly bonusData: Bonuses[] = slotitemBonuses as Bonuses[];
}
