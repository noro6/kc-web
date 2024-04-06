import { SHIP_TYPE } from '../const';
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

  /** 読み */
  public readonly yomi: string;

  /** 艦種id */
  public readonly type: number;

  /** 艦型 〇〇型的なやつのid */
  public readonly type2: number;

  /** 装備スロット数 */
  public slotCount: number;

  /** 装備搭載数 */
  public slots: number[];

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

  /** 火力+雷装 */
  public readonly night: number;

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

  /** 改装設計図消費数 */
  public readonly blueprints: number;

  /** 戦闘詳報消費数 */
  public readonly actionReports: number;

  /** カタパルト消費数 */
  public readonly catapults: number;

  /** 空母か(CV CVB CVL) */
  public readonly isCV: boolean

  /** 戦艦か(BB FBB BBV BBB) */
  public readonly isBB: boolean

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
      this.yomi = ship.yomi ? ship.yomi : '';
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
      this.fuel = ship.fuel ?? 0;
      this.ammo = ship.ammo ?? 0;
      this.blueprints = ship.blueprints ?? 0;
      this.actionReports = ship.reports ?? 0;
      this.catapults = ship.catapults ?? 0;
    } else {
      this.id = 0;
      this.albumId = 0;
      this.name = '';
      this.yomi = '';
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
      this.blueprints = 0;
      this.actionReports = 0;
      this.catapults = 0;
    }

    this.night = this.fire + this.torpedo;
    this.isCV = this.type === SHIP_TYPE.CV || this.type === SHIP_TYPE.CVL || this.type === SHIP_TYPE.CVB;
    this.isBB = this.type === SHIP_TYPE.FBB || this.type === SHIP_TYPE.BB || this.type === SHIP_TYPE.BBB || this.type === SHIP_TYPE.BBV;
  }

  /**
   * 改造状態接尾辞を分離
   * @static
   * @return {*}  {string}
   * @memberof ShipMaster
   */
  static getSuffix(ship: ShipMaster): string[] {
    if (!ship.version) return [ship.name];

    const lastSuffix = ['甲', '乙', '丙', '丁', '戊', '特', '護', '重', '改', '航', '母', '戦'];
    let name = `${ship.name}`;
    let array: string[] = [];
    // 最後の1文字
    let last = name.slice(-1);
    if (lastSuffix.includes(last)) {
      array.push(last);
      name = name.slice(0, -1);
    }

    const suffixes = ['改二', '改三', ' zwei', ' drei', ' due', ' andra', ' nuovo', ' два', ' Mod.2', ' Mk.II'];
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

  /**
   * コンバート改装を持つ艦の未改造を取得
   * @static
   * @param {ShipMaster[]} ships
   * @return {*}  {ShipMaster[]}
   * @memberof ShipMaster
   */
  static getConvertOriginalShips(ships: ShipMaster[]): ShipMaster[] {
    const finals = ships.filter((v) => v.isFinal);
    const originalIds: { id: number, isConvert: boolean }[] = [];
    for (let i = 0; i < finals.length; i += 1) {
      const final = finals[i];

      const checked = originalIds.find((v) => v.id === final.originalId);
      if (!checked) {
        // なければプッシュ
        originalIds.push({ id: final.originalId, isConvert: false });
        continue;
      } else {
        // あればtrueにする
        checked.isConvert = true;
      }
    }

    const hasConvertOriginalIds = originalIds.filter((v) => v.isConvert).map((v) => v.id);
    return ships.filter((v) => hasConvertOriginalIds.includes(v.id));
  }
}
