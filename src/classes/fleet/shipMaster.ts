import Const, { SHIP_TYPE } from '../const';
import { MasterEquipmentExSlot, MasterEquipmentShip, MasterShip } from '../interfaces/master';
import ItemMaster from '../item/itemMaster';

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

  /** 図鑑IDで紐づけているので注意！ */
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

  /** 改装直前のid */
  public readonly beforId: number;

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
      this.slotCount = ship.s_count ? ship.s_count : 4;
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
      this.beforId = ship.befor ? ship.befor : 0;
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
      this.beforId = 0;
      this.nextLv = 0;
      this.sort = 0;
      this.slots = [];
      this.originalId = 0;
      this.fuel = 0;
      this.ammo = 0;
    }
  }

  /**
   * 引数の装備を搭載できるかどうかを返却
   * @param {ItemMaster} item
   * @return {*}  {boolean}
   * @memberof Ship
   */
  public isValidItem(item: ItemMaster, itemLink: MasterEquipmentShip[], exItemLink: MasterEquipmentExSlot[], slotIndex = -1): boolean {
    // 未指定の場合はなんでもOK
    if (this.id === 0) {
      return true;
    }
    // 装備可能カテゴリ
    let types: number[] = [];
    // 補強増設かどうか
    const isExpandSlot = slotIndex === Const.EXPAND_SLOT_INDEX;
    // 艦種
    const { type } = this;

    if (!isExpandSlot) {
      // 特定装備判定
      // 試製景雲
      if (item.id === 151) {
        // 装甲空母ならOK
        return type === SHIP_TYPE.CVB;
      }
      // 15m二重測距儀+21号電探改二
      if (item.id === 142 || item.id === 460) {
        // 戦艦系のみ
        if (type !== SHIP_TYPE.FBB && type !== SHIP_TYPE.BB && type !== SHIP_TYPE.BBV) {
          return false;
        }
        const special = itemLink.find((v) => v.api_ship_id === this.id);
        if (special && !special.api_equip_type.includes(13)) {
          // 特定艦で大型電探が省かれていたらアウト
          return false;
        }
        return true;
      }
      // 51cm連装砲系
      if (item.id === 128 || item.id === 281 || item.id === 465) {
        // 長門型改以上か大和型のみ
        return this.type2 === 37 || (this.type2 === 19 && this.version > 0);
      }
    }

    // 特定艦娘判定
    const special = itemLink.find((v) => v.api_ship_id === this.id);
    if (special) {
      // 特殊装備カテゴリ枠から取得
      types = special.api_equip_type;
    } else {
      // 通常艦種装備可能から取得
      const normal = Const.SHIP_TYPES_INFO.find((v) => v.id === type);
      if (normal) {
        types = normal.itemType;
      }
    }

    // 補強増設枠
    if (isExpandSlot) {
      if (item.id === 34 || item.id === 87 || item.id === 534) {
        // 缶を弾く => タービンはOKのため
        return false;
      }
      // 艦娘特別装備枠マスタより解決できた場合は搭載可能
      const sp = exItemLink.find((v) => v.api_slotitem_id === item.id);
      if (sp && sp.api_ship_ids.includes(this.id)) {
        return true;
      }

      // 潜水艦後部魚雷対応
      if ((item.id === 442 || item.id === 443) && (this.type === SHIP_TYPE.SS || this.type === SHIP_TYPE.SSV)) {
        return true;
      }

      // 補強増設可能装備で絞る
      types = types.filter((v) => Const.EXPANDED_ITEM_TYPE.includes(v));
    }

    // スロット番号制限チェック
    if (slotIndex >= 0) {
      const forbiddens = Const.FORBIDDEN_LINK_SHIP_ITEM.find((v) => v.shipId === this.id && v.index.includes(slotIndex + 1));
      if (forbiddens) {
        // 禁止カテゴリに存在したら終わり
        if (forbiddens.itemType.includes(item.apiTypeId)) {
          return false;
        }
        // 禁止装備 キメ撃ち
        if (forbiddens.itemIDs.includes(item.id)) {
          return false;
        }
      }
    }

    // 最終チェック
    return types.includes(item.apiTypeId);
  }
}
