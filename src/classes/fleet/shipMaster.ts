import { MasterShip } from '../interfaces/master';
/**
 * 艦娘マスタクラス
 * マスターデータより算出されるオブジェクト
 * @export
 * @class ShipMaster
 */
export default class ShipMaster {
  /** id */
  public readonly id: number;

  /** 図鑑No */
  public readonly albumId: number;

  /** 名称 */
  public readonly name: string;

  /** 艦種id */
  public readonly type: number;

  /** 艦型 〇〇型的なやつのid */
  public readonly type2: number;

  /** 装備スロット数 */
  public readonly slotCount: number;

  /** 装備搭載数 */
  public readonly slots: number[];

  /** 改造段階 0で無印 */
  public readonly version: number;

  /** 最終改造状態か否か */
  public readonly isFinal: boolean;

  /** 未改造時ID */
  public readonly originalId: number;

  /** デフォルト射程 */
  public readonly range: number;

  /** 耐久 */
  public readonly hp: number;

  /** ケッコン後耐久 */
  public readonly hp2: number;

  /** 最大耐久(改修の限界) */
  public readonly maxHp: number;

  /** 火力 */
  public readonly fire: number;

  /** 雷装 */
  public readonly torpedo: number;

  /** 対空 */
  public readonly antiAir: number;

  /** 装甲 */
  public readonly armor: number;

  /** 運初期値 */
  public readonly luck: number;

  /** 運最大値 */
  public readonly maxLuck: number;

  /** 索敵初期値 */
  public readonly minScout: number;

  /** 索敵最大値 */
  public readonly maxScout: number;

  /** 対潜初期値 */
  public readonly minAsw: number;

  /** 対潜最大値 */
  public readonly maxAsw: number;

  /** 回避初期値 */
  public readonly minAvoid: number;

  /** 回避最大値 */
  public readonly maxAvoid: number;

  /** 速力 */
  public readonly speed: number;

  /** 改装直前のid */
  public readonly beforeId: number;

  /** 次改装Lv */
  public readonly nextLv: number;

  /** 母港マスタソート順 */
  public readonly sort: number;

  /** 搭載燃料 */
  public readonly fuel: number;

  /** 搭載弾薬 */
  public readonly ammo: number;

  /**
   * Creates an instance of ShipMaster.
   * @param {MasterShip} ship
   * @memberof ShipMaster
   */
  constructor(ship?: MasterShip) {
    if (ship) {
      this.id = ship.id ? ship.id : 0;
      this.albumId = ship.album ? ship.album : 0;
      this.name = ship.name ? ship.name : '';
      this.type = ship.type ? ship.type : 0;
      this.type2 = ship.type2 ? ship.type2 : 0;
      this.slotCount = ship.s_count ? ship.s_count : 0;
      this.version = ship.ver ? ship.ver : 0;
      this.isFinal = !!ship.final;
      this.range = ship.range ? ship.range : 0;
      this.hp = ship.hp ? ship.hp : 0;
      this.hp2 = ship.hp2 ? ship.hp2 : 0;
      this.maxHp = ship.max_hp ? ship.max_hp : 0;
      this.fire = ship.fire ? ship.fire : 0;
      this.torpedo = ship.torpedo ? ship.torpedo : 0;
      this.antiAir = ship.anti_air ? ship.anti_air : 0;
      this.armor = ship.armor ? ship.armor : 0;
      this.luck = ship.luck ? ship.luck : 0;
      this.maxLuck = ship.max_luck ? ship.max_luck : 0;
      this.minScout = ship.min_scout ? ship.min_scout : 0;
      this.maxScout = ship.scout ? ship.scout : 0;
      this.minAsw = ship.min_asw ? ship.min_asw : 0;
      this.maxAsw = ship.asw ? ship.asw : 0;
      this.minAvoid = ship.min_avoid ? ship.min_avoid : 0;
      this.maxAvoid = ship.avoid ? ship.avoid : 0;
      this.speed = ship.speed ? ship.speed : 5;
      this.beforeId = ship.before ? ship.before : 0;
      this.nextLv = ship.next_lv ? ship.next_lv : 0;
      this.sort = ship.sort ? ship.sort : 0;
      this.slots = ship.slots ? ship.slots : [];
      this.originalId = ship.orig ? ship.orig : 0;
      this.fuel = ship.fuel ? ship.fuel : 0;
      this.ammo = ship.ammo ? ship.ammo : 0;
    } else {
      this.id = 0;
      this.albumId = 0;
      this.name = '';
      this.type = 0;
      this.type2 = 0;
      this.slotCount = 0;
      this.version = 0;
      this.isFinal = false;
      this.range = 0;
      this.hp = 0;
      this.hp2 = 0;
      this.maxHp = 0;
      this.fire = 0;
      this.torpedo = 0;
      this.antiAir = 0;
      this.armor = 0;
      this.luck = 0;
      this.maxLuck = 0;
      this.minScout = 0;
      this.maxScout = 0;
      this.minAsw = 0;
      this.maxAsw = 0;
      this.minAvoid = 0;
      this.maxAvoid = 0;
      this.speed = 5;
      this.beforeId = 0;
      this.nextLv = 0;
      this.sort = 0;
      this.slots = [];
      this.originalId = 0;
      this.fuel = 0;
      this.ammo = 0;
    }
  }

  /**
   * 改造状態接尾辞を分離
   * @static
   * @return {*}  {string}
   * @memberof ShipMaster
   */
  static getSuffix(ship: ShipMaster): string[] {
    if (!ship.version) return [ship.name];

    const lastSuffix = ['甲', '乙', '丙', '丁', '戊', '特', '護', '重', '改', '航', '母'];
    let name = `${ship.name}`;
    let array: string[] = [];
    // 最後の1文字
    let last = name.slice(-1);
    if (lastSuffix.includes(last)) {
      array.push(last);
      name = name.slice(0, -1);
    }

    const suffixes = ['改二', ' zwei', ' drei', ' due', ' andra', ' nuovo', ' два', ' Mod.2', ' Mk.II'];
    for (let i = 0; i < suffixes.length; i += 1) {
      let suffix = suffixes[i];
      if (name.endsWith(suffix)) {
        suffix = suffix.replaceAll('.', ' ');
        name = name.slice(0, -suffix.length);
        array = [suffix].concat(array);
      }
    }

    // もう一回やっておく(航改二とか対策)
    last = name.slice(-1);
    if (lastSuffix.includes(last)) {
      name = name.slice(0, -1);
      array = [last].concat(array);
    }

    // 残り
    array = [name].concat(array);
    return array;
  }
}
