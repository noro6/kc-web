import Const, { SHIP_TYPE } from '../const';
import { MasterEquipmentExSlot, MasterEquipmentShip, MasterShip } from '../interfaces/master';
import ItemMaster from '../item/itemMaster';

export default class ShipMaster {
  public id = 0;

  public albumId = 0;

  public name = '';

  public type = 0;

  public type2 = 0;

  public slotCount = 0;

  public slots: number[] = [];

  public version = 0;

  public isFinal = false;

  public originalId = 0;

  public range = 0;

  public hp = 0;

  public hp2 = 0;

  public maxHp = 0;

  public fire = 0;

  public torpedo = 0;

  public antiAir = 0;

  public armor = 0;

  public luck = 0;

  public maxLuck = 0;

  public minScout = 0;

  public maxScout = 0;

  public minAsw = 0;

  public maxAsw = 0;

  public minAvoid = 0;

  public maxAvoid = 0;

  public beforId = 0;

  public nextLv = 0;

  public sort = 0;

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
      // 15m二重測距儀+21号電探改二 => 大前提は戦艦系のみ
      if (item.id === 142 && (type === SHIP_TYPE.FBB || type === SHIP_TYPE.BB || type === SHIP_TYPE.BBV)) {
        const special = itemLink.find((v) => v.api_ship_id === this.id);
        if (special && !special.api_equip_type.includes(13)) {
          // 特定艦で大型電探が省かれていたらアウト
          return false;
        }
        return true;
      }
      // 51cm連装砲系
      if (item.id === 128 || item.id === 281) {
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
