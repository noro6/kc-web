import store from '@/store/index';
import Const, { SHIP_TYPE } from '../const';
import ItemMaster from '../item/itemMaster';
import ShipMaster from './shipMaster';

/**
 * 在籍艦娘情報
 * @export
 * @class ShipStock
 */
export default class ShipValidation {
  /**
 * 引数の装備を搭載できるかどうかを返却
 * @param {ItemMaster} item
 * @return {*}  {boolean}
 * @memberof Ship
 */
  public static isValidItem(ship: ShipMaster, item: ItemMaster, slotIndex = -1): boolean {
    // 未指定の場合はなんでもOK
    if (ship.id === 0) {
      return true;
    }
    // 装備可能カテゴリ
    let types: number[] = [];
    // 補強増設かどうか
    const isExpandSlot = slotIndex === Const.EXPAND_SLOT_INDEX;
    // 艦種
    const { type } = ship;

    const itemLink = store.state.equipShips;

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
        const special = itemLink.find((v) => v.api_ship_id === ship.id);
        if (special && !special.api_equip_type.includes(13)) {
          // 特定艦で大型電探が省かれていたらアウト
          return false;
        }
        return true;
      }
      // 51cm連装砲系
      if (item.id === 128 || item.id === 281 || item.id === 465) {
        // 長門型改以上か大和型のみ
        return ship.type2 === 37 || (ship.type2 === 19 && ship.version > 0);
      }
      // 5inch連装砲(副砲配置)集中配備
      if (item.id === 467) {
        // 軽巡系、軽空母、水母搭載不可
        if (type === SHIP_TYPE.CL || type === SHIP_TYPE.CLT || type === SHIP_TYPE.CT || type === SHIP_TYPE.CVL || type === SHIP_TYPE.AV) {
          return false;
        }
        return true;
      }
    }

    // 特定艦娘判定
    const special = itemLink.find((v) => v.api_ship_id === ship.id);
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
      const sp = store.state.exSlotEquipShips.find((v) => v.api_slotitem_id === item.id);
      if (sp && sp.api_ship_ids.includes(ship.id)) {
        return true;
      }

      // 潜水艦後部魚雷対応
      if ((item.id === 442 || item.id === 443) && (ship.type === SHIP_TYPE.SS || ship.type === SHIP_TYPE.SSV)) {
        return true;
      }

      // 補強増設可能装備で絞る
      types = types.filter((v) => Const.EXPANDED_ITEM_TYPE.includes(v));
    }

    // スロット番号制限チェック
    if (slotIndex >= 0) {
      const forbiddens = Const.FORBIDDEN_LINK_SHIP_ITEM.find((v) => v.shipId === ship.id && v.index.includes(slotIndex + 1));
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
