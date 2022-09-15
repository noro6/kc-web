import Const from '../const';
import { MasterItem } from '../interfaces/master';

/**
 * 装備マスタクラス
 * マスターデータより算出されるオブジェクト
 * @export
 * @class ItemMaster
 */
export default class ItemMaster {
  /** id */
  public id: number;

  /** 種別 */
  public apiTypeId: number;

  /** アイコン用種別 */
  public readonly iconTypeId: number;

  /** 名称 */
  public readonly name: string;

  /** 略称 */
  public readonly abbr: string;

  /** 火力 */
  public readonly fire: number;

  /** 雷装 */
  public readonly torpedo: number;

  /** 爆装 */
  public readonly bomber: number;

  /** 対空 */
  public readonly antiAir: number;

  /** 装甲 */
  public readonly armor: number;

  /** 対潜 */
  public readonly asw: number;

  /** 対爆 */
  public readonly antiBomber: number;

  /** 命中 */
  public readonly accuracy: number;

  /** 迎撃 */
  public readonly interception: number;

  /** 回避 */
  public readonly avoid: number;

  /** 索敵 */
  public readonly scout: number;

  /** 射程 */
  public readonly range: number;

  /** 半径 */
  public readonly radius: number;

  /** コスト */
  public readonly cost: number;

  /** 改修可否 */
  public readonly canRemodel: boolean;

  /** 射撃回避id */
  public readonly avoidId: number;

  /** 熟練度成長定数 */
  public readonly grow: number;

  /** 特殊機銃とか高角砲とかそういうの 一覧で緑色になる */
  public readonly isSpecial: boolean;

  /** 航空機フラグ */
  public readonly isPlane: boolean;

  /** 戦闘機フラグ */
  public readonly isFighter: boolean;

  /** 攻撃機フラグ */
  public readonly isAttacker: boolean;

  /** 基地攻撃機フラグ */
  public readonly isABAttacker: boolean;

  /** 噴式機フラグ */
  public readonly isJet: boolean;

  /** カテゴリ(爆戦)フラグ */
  public readonly isBakusen: boolean;

  /** ロケット戦闘機フラグ */
  public readonly isRocket: boolean;

  /** 偵察機フラグ */
  public readonly isRecon: boolean;

  /** 大型陸上機フラグ */
  public readonly isShinzan: boolean;

  /** 対地可能フラグ */
  public readonly enabledAttackLandBase: boolean;

  /** 爆雷(教義)フラグ */
  public readonly isStrictDepthCharge: boolean;

  /** 特効情報 */
  public readonly bonuses: {type:number, text: string, subText: string}[];

  /**
   * Creates an instance of ItemMaster.
   * API取得itemよりクラスにマッピング
   * @param {(...(number | string)[])} item
   * @memberof ItemMaster
   */
  constructor(item?: MasterItem) {
    if (item) {
      this.id = item.id ? item.id : 0;
      this.apiTypeId = item.type ? +item.type : 0;
      this.iconTypeId = item.itype ? +item.itype : 0;
      this.name = item.name ? item.name : '';
      this.abbr = item.abbr ? item.abbr : '';
      this.fire = item.fire ? +item.fire : 0;
      this.torpedo = item.torpedo ? +item.torpedo : 0;
      this.bomber = item.bomber ? +item.bomber : 0;
      this.antiAir = item.antiAir ? +item.antiAir : 0;
      this.armor = item.armor ? +item.armor : 0;
      this.asw = item.asw ? +item.asw : 0;
      this.antiBomber = item.antiBomber ? +item.antiBomber : 0;
      this.accuracy = item.accuracy ? +item.accuracy : 0;
      this.interception = item.interception ? +item.interception : 0;
      this.avoid = item.avoid2 ? +item.avoid2 : 0;
      this.scout = item.scout ? +item.scout : 0;
      this.range = item.range ? +item.range : 0;
      this.radius = item.radius ? +item.radius : 0;
      this.cost = item.cost ? +item.cost : 0;
      this.canRemodel = !!item.canRemodel;
      this.avoidId = item.avoid ? +item.avoid : 0;
      this.grow = item.grow ? +item.grow : 0;
    } else {
      this.id = 0;
      this.apiTypeId = 0;
      this.iconTypeId = 0;
      this.name = '';
      this.abbr = '';
      this.fire = 0;
      this.torpedo = 0;
      this.bomber = 0;
      this.antiAir = 0;
      this.armor = 0;
      this.asw = 0;
      this.antiBomber = 0;
      this.accuracy = 0;
      this.interception = 0;
      this.avoid = 0;
      this.scout = 0;
      this.range = 0;
      this.radius = 0;
      this.cost = 0;
      this.canRemodel = false;
      this.avoidId = 0;
      this.grow = 0;
    }

    // 特殊機銃(対空9以上) 特殊高角砲(対空8以上)判定
    this.isSpecial = (this.apiTypeId === 21 && this.antiAir > 8) || (this.iconTypeId === 16 && this.antiAir > 7);

    // その他区分解決
    this.isPlane = Const.PLANE_TYPES.includes(this.apiTypeId);
    this.isFighter = Const.FIGHTERS.includes(this.apiTypeId);
    this.isAttacker = Const.ATTACKERS.includes(this.apiTypeId);
    this.isRecon = Const.RECONNAISSANCES.includes(this.apiTypeId);
    this.isABAttacker = Const.AB_ATTACKERS.includes(this.apiTypeId);
    this.isBakusen = Const.BAKUSEN.includes(this.id);
    this.isRocket = Const.ROCKET.includes(this.id);
    this.isShinzan = Const.AB_ATTACKERS_LARGE.includes(this.apiTypeId);
    this.isJet = this.apiTypeId === 57;
    this.enabledAttackLandBase = Const.ENABLED_LAND_BASE_ATTACK.includes(this.id);
    this.isStrictDepthCharge = Const.STRICT_DEPTH_CHARGE.includes(this.id);

    if (!this.isSpecial) {
      this.isSpecial = this.isRocket || this.enabledAttackLandBase;
    }

    if (this.isStrictDepthCharge) {
      this.iconTypeId = 1700;
    }

    // 特効テキストを用意
    this.bonuses = [{ type: -1, text: '', subText: '' }];
    const bonuses = Const.SPECIAL_GROUP.filter((v) => v.items.includes(this.id));
    for (let i = 0; i < bonuses.length; i += 1) {
      const bonus = bonuses[i];
      this.bonuses.push({ type: bonus.type, text: bonus.text, subText: '' });
    }
  }
}
