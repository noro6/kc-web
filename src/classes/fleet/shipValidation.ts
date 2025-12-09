import store from '@/store/index';
import Const, { SHIP_TYPE } from '../const';
import ItemMaster from '../item/itemMaster';
import ShipMaster from './shipMaster';

/**
 * 搭載可否の情報クラス
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
  public static isValidItem(ship: ShipMaster, item: ItemMaster, slotIndex = -1, remodel = 0): boolean {
    // 未指定の場合はなんでもOK
    if (ship.id === 0) {
      return true;
    }

    // Ho229 艦娘搭載不可
    if (item.id === 561) {
      return false;
    }
    // 試製景雲 => 偵察機だけど装甲空母以外搭載不可
    if (item.id === 151 && ship.type !== SHIP_TYPE.CVB) {
      return false;
    }
    // 15m二重測距儀+21号電探改二系列 => 戦艦系以外搭載不可
    if ((item.id === 142 || item.id === 460) && !ship.isBB) {
      return false;
    }
    // 51cm連装砲系 => 長門型改以上か大和型のみ搭載可
    if (item.id === 128 || item.id === 281 || item.id === 465) {
      if (ship.type2 !== 37 && !(ship.type2 === 19 && ship.version > 0)) {
        return false;
      }
    }
    // 5inch連装砲(副砲配置)集中配備 => 重巡、戦艦系、正規(装甲)空母のみ搭載可
    if (item.id === 467) {
      if (ship.type !== SHIP_TYPE.CA && !ship.isBB && ship.type !== SHIP_TYPE.CV && ship.type !== SHIP_TYPE.CVB) {
        return false;
      }
    }

    /**
     * api_mst_equip_ship
     * 艦娘に対する装備可能情報（マスタ情報より優先される）
     * 例: { 1: { api_equip_type: { 1: [1, 2, 3], 2: null } } }
     * 1: 艦娘ID
     * api_equip_type: 装備可能カテゴリ
     * 1: 装備可能カテゴリID
     * [1, 2, 3]: 装備可能カテゴリIDに対応する装備IDの配列、nullの場合、このカテゴリの装備は全て装備可能
     */
    let apiEquipType: { [key: number]: number[] | null } | undefined = store.state.equipShips[ship.id]?.api_equip_type;
    if (!apiEquipType) {
      /**
       * api_mst_stype から取得
       * 例: { api_id: 1, api_name: '海防艦', api_equip_type: [1, 2, 3] } の配列
       * api_id: 艦種ID
       * api_name: 艦種名
       * api_equip_type: 装備可能カテゴリIDの数値配列。数値配列なので、個別装備の情報は持っていない
       */
      const normal = store.state.shipTypes.find((v) => v.api_id === ship.type);
      if (normal) {
        apiEquipType = {};
        // 通常艦種装備可能カテゴリから取得した場合は全て許可 => 元の作りが装備種別IDの配列なので、個別装備の情報がない
        normal.api_equip_type.forEach((v) => {
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          apiEquipType![v] = null;
        });
      }
    }

    // 補強増設枠かどうか
    if (slotIndex === Const.EXPAND_SLOT_INDEX) {
      /**
       * api_ship_ids: 装備IDに対応する艦娘IDの配列、nullの場合はとりあえず装備不可
       * api_stypes: 装備IDに対応する艦種ID（駆逐、海防...）の配列、nullの場合はとりあえず装備不可
       * api_ctypes: 装備IDに対応する艦型ID（白露型、Fletcher級...）の配列、nullの場合はとりあえず装備不可
       * api_req_level: 装備IDに対応する最低限必要な改修値、このキーがない場合は制限なし
       */
      const exSlot = store.state.exSlotEquipShips[item.id];
      if (exSlot) {
        const apiShipIds = Object.keys(exSlot.api_ship_ids || {});
        const apiStypes = Object.keys(exSlot.api_stypes || {});
        const apiCtypes = Object.keys(exSlot.api_ctypes || {});
        let isOK = apiShipIds.includes(`${ship.id}`) || apiStypes.includes(`${ship.type}`) || apiCtypes.includes(`${ship.type2}`);
        // 敗者復活 => タービンが stype:99 なのでようわからんけどそれ。ただし、海防艦のように api_equip_type に存在していなければアウト
        isOK = isOK || (apiStypes.includes('99') && Object.keys(apiEquipType || {}).some((v) => v === `${item.apiTypeId}`));
        if (isOK) {
          // 改修条件 => api_req_level がないか、またはちゃんと上回っているか
          if (!exSlot.api_req_level || remodel >= exSlot.api_req_level) {
            // 通常スロットで装備可能な装備種別かどうかもチェック
            // 補強増設は通常装備できないものを特別に装備可能にするが、
            // そもそも装備種別自体が許可されていないものは装備不可
            if (Object.keys(apiEquipType || {}).includes(`${item.apiTypeId}`)) {
              return true;
            }
          }
          return false;
        }
      }
      // 補強増設可能装備で絞る
      apiEquipType = Object.fromEntries(Object.entries(apiEquipType || {}).filter(([key]) => Const.EXPANDED_ITEM_TYPE.includes(Number(key))));
    }

    // スロット番号制限チェック
    if (slotIndex >= 0) {
      const forbiddenItems = Const.FORBIDDEN_LINK_SHIP_ITEM.find((v) => v.shipId === ship.id && v.index.includes(slotIndex + 1));
      if (forbiddenItems) {
        // 禁止カテゴリに存在したら終わり
        if (forbiddenItems.itemType.includes(item.apiTypeId)) {
          return false;
        }
        // 禁止装備 キメ撃ち
        if (forbiddenItems.itemIDs.includes(item.id)) {
          return false;
        }
      }
    }

    // 最終チェック
    // 1. ちゃんと装備種別IDのキーがあるか
    if (apiEquipType && Object.keys(apiEquipType).find((v) => v === `${item.apiTypeId}`)) {
      // 2. 装備種別IDのキーがある場合はその装備種別IDの配列に装備IDが含まれているか
      const itemIds = apiEquipType?.[item.apiTypeId];
      if (itemIds) {
        // 3. 装備種別IDの配列に該当の装備IDが含まれているか
        return itemIds.includes(item.id);
      }
      // null なら問題なし
      return true;
    }

    // 装備種別IDのキーすらない場合は終わり
    return false;
  }
}
