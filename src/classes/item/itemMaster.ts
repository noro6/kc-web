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

  /** 出撃対空 */
  public readonly sortieAntiAir: number;

  /** 防空対空 */
  public readonly defenseAntiAir: number;

  /** 特殊機銃とか高角砲とかそういうの 一覧で緑色になる */
  public readonly isSpecial: boolean;

  /** 航空機フラグ */
  public readonly isPlane: boolean;

  /** 戦闘機フラグ */
  public readonly isFighter: boolean;

  /** 攻撃機フラグ */
  public readonly isAttacker: boolean;

  /** 対潜哨戒機フラグ */
  public readonly isAswPlane: boolean;

  /** 対潜哨戒機爆装ありフラグ 爆装4以上 (一式戦 隼II型改(20戦隊) / 熟練) */
  public readonly isAswBomber1: boolean;

  /** 対潜哨戒機爆装ありフラグ2 爆装1以上 爆装4未満 (三式指揮連絡機改二) */
  public readonly isAswBomber2: boolean;

  /** オートジャイロフラグ */
  public readonly isAutoGyro: boolean;

  /** 基地攻撃機フラグ */
  public readonly isABAttacker: boolean;

  /** 噴式機フラグ */
  public readonly isJet: boolean;

  /** 重噴式フラグ (Ho229 等) */
  public readonly isHeavyJet: boolean;

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

  /** 爆雷(狭義)フラグ */
  public readonly isStrictDepthCharge: boolean;

  /** 雷装による攻撃を行うかどうか => 現行では火力計算で0.8倍1.5倍が発生するのに使う */
  public readonly isTorpedoAttacker: boolean;

  /** 夜間航空機 */
  public readonly isNightAircraftItem: boolean;

  /** 水上機かどうか */
  public readonly isSPPlane: boolean;

  /** 潜水か後期型魚雷かどうか */
  public readonly isLateModelTorpedo: boolean;

  /** 敵装備かどうか */
  public readonly isEnemyItem: boolean;

  /** 特効情報 */
  public readonly bonuses: { key: string, text: string[], isOnlyAB: boolean, isOnlyShip: boolean }[];

  /** 基地配備時の最大搭載数 */
  public readonly airbaseMaxSlot: number;

  /**
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
    this.isSpecial = (this.apiTypeId === 21 && this.antiAir >= 9) || (this.iconTypeId === 16 && this.antiAir >= 8);

    // その他区分解決
    this.isPlane = Const.PLANE_TYPES.includes(this.apiTypeId);
    this.isFighter = Const.FIGHTERS.includes(this.apiTypeId);
    this.isAswPlane = Const.ASW_PLANES.includes(this.apiTypeId);
    this.isAutoGyro = this.apiTypeId === 25;
    this.isAswBomber1 = this.isAswPlane && !this.isAutoGyro && this.bomber >= 4;
    this.isAswBomber2 = this.isAswPlane && !this.isAutoGyro && this.bomber < 4 && this.bomber > 0;
    this.isAttacker = Const.ATTACKERS.includes(this.apiTypeId) || this.isAswBomber1;
    this.isRecon = Const.RECONNAISSANCES.includes(this.apiTypeId);
    this.isABAttacker = Const.AB_ATTACKERS.includes(this.apiTypeId);
    this.isBakusen = Const.BAKUSEN.includes(this.id);
    this.isRocket = Const.ROCKET.includes(this.id);
    this.isLateModelTorpedo = Const.LATE_MODEL_TORPEDO.includes(this.id);
    this.isShinzan = Const.AB_ATTACKERS_LARGE.includes(this.apiTypeId);
    // 噴式機判定
    this.isJet = this.apiTypeId === 57;
    // 重噴式 (Ho229) 判定: アイコン種別 59
    this.isHeavyJet = this.iconTypeId === 59;
    this.enabledAttackLandBase = Const.ENABLED_LAND_BASE_ATTACK.includes(this.id);
    this.isStrictDepthCharge = Const.STRICT_DEPTH_CHARGE.includes(this.id);
    this.isTorpedoAttacker = [8, 47, 53].includes(this.apiTypeId);
    this.isSPPlane = Const.SP_PLANE_TYPES.includes(this.apiTypeId);
    this.isEnemyItem = this.id > 1500;
    this.airbaseMaxSlot = 18;

    if (this.isPlane) {
      if (this.isShinzan) {
        this.airbaseMaxSlot = 9;
      } else if (this.isRecon) {
        this.airbaseMaxSlot = 4;
      } else {
        this.airbaseMaxSlot = 18;
      }
    }

    // 出撃対空 = 対空値 + 1.5 * 迎撃
    this.sortieAntiAir = this.antiAir + 1.5 * this.interception;
    // 防空対空 = 対空値 + 迎撃 + 2 * 対爆
    this.defenseAntiAir = this.antiAir + this.interception + 2 * this.antiBomber;

    if (!this.isSpecial) {
      // ロケ戦 対地可能 後期魚雷 対潜+7以上の艦攻
      this.isSpecial = this.isRocket || this.enabledAttackLandBase || this.isLateModelTorpedo || (this.apiTypeId === 8 && this.asw >= 7);
    }

    if (this.isStrictDepthCharge) {
      this.iconTypeId = 1700;
    }

    // 特効テキストを用意（同一キー・同一テキストの重複と文脈差異を正規化）
    this.bonuses = [];
    const rawBonuses = Const.SPECIAL_GROUP.filter((v) => v.items.includes(this.id));
    // key ごとに集約し、テキスト単位で文脈(AB/Ship/General)を統合
    const grouped: {
      [key: string]: { texts: Set<string>; abOnly: boolean; shipOnly: boolean; general: boolean };
    } = {};
    for (let i = 0; i < rawBonuses.length; i += 1) {
      const b = rawBonuses[i];
      if (!grouped[b.key]) {
        grouped[b.key] = { texts: new Set<string>(), abOnly: false, shipOnly: false, general: false };
      }
      grouped[b.key].texts.add(b.text);
      const isABOnly = !!b.isOnlyAB && !b.isOnlyShip;
      const isShipOnly = !!b.isOnlyShip && !b.isOnlyAB;
      const isGeneral = !b.isOnlyAB && !b.isOnlyShip;
      grouped[b.key].abOnly = grouped[b.key].abOnly || isABOnly;
      grouped[b.key].shipOnly = grouped[b.key].shipOnly || isShipOnly;
      grouped[b.key].general = grouped[b.key].general || isGeneral;
    }
    // 出力: テキストは重複排除。文脈は総合判定（両方に存在 or General があれば両方表示）
    Object.keys(grouped).forEach((key) => {
      const g = grouped[key];
      let isOnlyAB = false;
      let isOnlyShip = false;
      if (!g.general) {
        if (g.abOnly && !g.shipOnly) {
          isOnlyAB = true;
        } else if (g.shipOnly && !g.abOnly) {
          isOnlyShip = true;
        }
        // abOnly と shipOnly の両方が立っている場合は両方で表示したいのでどちらの限定もしない
      }
      this.bonuses.push({
        key,
        text: Array.from(g.texts),
        isOnlyAB,
        isOnlyShip,
      });
    });

    this.isNightAircraftItem = [45, 46, 58].includes(this.iconTypeId) || [154, 242, 243, 244, 320].includes(this.id);
  }

  /** 装備の日本wikiURLを返却 */
  public static getWikiURL(data: ItemMaster): string {
    if (data.id === 144) {
      return `https://wikiwiki.jp/kancolle/${encodeURI('天山(村田隊)')}`;
    }
    if (data.id === 278) {
      return `https://wikiwiki.jp/kancolle/${encodeURI('SKレーダー')}`;
    }
    if (data.id === 279) {
      return `https://wikiwiki.jp/kancolle/${encodeURI('SK＋SGレーダー')}`;
    }
    if (data.id === 303) {
      return `https://wikiwiki.jp/kancolle/${encodeURI('Bofors15.2cm連装砲 Model1930')}`;
    }
    if (data.id === 313) {
      return `https://wikiwiki.jp/kancolle/${encodeURI('5inch単装砲 Mk.30 改')}`;
    }
    if (data.id === 389) {
      return `https://wikiwiki.jp/kancolle/${encodeURI('TBM-3W ＋ 3S')}`;
    }
    if (data.id === 467) {
      return `https://wikiwiki.jp/kancolle/${encodeURI('5inch連装砲(副砲配置)集中配備')}`;
    }
    if (data.id === 482) {
      return `https://wikiwiki.jp/kancolle/${encodeURI('特大発動艇＋III号戦車(北アフリカ仕様)')}`;
    }
    if (data.id === 514) {
      return `https://wikiwiki.jp/kancolle/${encodeURI('特大発動艇＋III号戦車J型')}`;
    }
    return `https://wikiwiki.jp/kancolle/${encodeURI(data.name.replaceAll('/', '／').replaceAll('+', '＋').replaceAll('&', '＆'))}`;
  }
}
