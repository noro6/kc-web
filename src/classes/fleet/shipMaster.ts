import Const, { SHIP_TYPE } from '../const';
import ItemMaster from '../item/itemMaster';

export default class ShipMaster {
  public id = 0;

  public albumId = 0;

  public name = '';

  public type = 0;

  public type2 = 0;

  public slotCount = 0;

  public slots: number[];

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
   * API取得rowよりクラスにマッピング
   * @param {(...(number | string)[])} row
   * @memberof ShipMaster
   */
  constructor(...row: (number | string)[]) {
    this.id = row[0] ? +row[0] : 0;
    this.albumId = row[1] ? +row[1] : 0;
    this.name = row[2] ? row[2] as string : '';
    this.type = row[3] ? +row[3] : 0;
    this.type2 = row[4] ? +row[4] : 0;
    this.slotCount = row[5] ? +row[5] : 4;
    this.version = row[11] ? +row[11] : 0;
    this.isFinal = row[12] > 0;
    this.originalId = row[13] ? +row[13] : 0;
    this.range = row[14] ? +row[14] : 0;
    this.hp = row[15] ? +row[15] : 0;
    this.hp2 = row[16] ? +row[16] : 0;
    this.maxHp = row[17] ? +row[17] : 0;
    this.fire = row[18] ? +row[18] : 0;
    this.torpedo = row[19] ? +row[19] : 0;
    this.antiAir = row[20] ? +row[20] : 0;
    this.armor = row[21] ? +row[21] : 0;
    this.luck = row[22] ? +row[22] : 0;
    this.maxLuck = row[23] ? +row[23] : 0;
    this.minScout = row[24] ? +row[24] : 0;
    this.maxScout = row[25] ? +row[25] : 0;
    this.minAsw = row[26] ? +row[26] : 0;
    this.maxAsw = row[27] ? +row[27] : 0;
    this.minAvoid = row[28] ? +row[28] : 0;
    this.maxAvoid = row[29] ? +row[29] : 0;
    this.beforId = row[30] ? +row[30] : 0;
    this.nextLv = row[31] ? +row[31] : 0;
    this.sort = row[32] ? +row[32] : 0;

    const slot1 = row[6] ? +row[6] : 0;
    const slot2 = row[7] ? +row[7] : 0;
    const slot3 = row[8] ? +row[8] : 0;
    const slot4 = row[9] ? +row[9] : 0;
    const slot5 = row[10] ? +row[10] : 0;
    this.slots = [slot1, slot2, slot3, slot4, slot5];
  }

  /**
   * 引数の装備を搭載できるかどうかを返却
   * @param {ItemMaster} item
   * @return {*}  {boolean}
   * @memberof Ship
   */
  public isValidItem(item: ItemMaster, slotIndex = -1): boolean {
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
      if (item.id === 142) {
        // 戦艦系ならOK
        return type === SHIP_TYPE.FBB || type === SHIP_TYPE.BB || type === SHIP_TYPE.BBV;
      }
      // 51cm連装砲系
      if (item.id === 128 || item.id === 281) {
        // 長門型改以上か大和型のみ
        return this.type2 === 37 || (this.type2 === 19 && this.version > 0);
      }
    }

    // 特定艦娘判定
    const special = Const.SHIP_ITEM_LINK.find((v) => v.id === this.id);
    if (special) {
      // 特殊装備カテゴリ枠から取得
      types = special.itemType;
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
        // 缶を弾く
        return false;
      }
      // 艦娘特別装備枠マスタより解決できた場合は搭載可能
      const sp = Const.EXPANDED_SPECIAL_ITEM.find((v) => v.itemId === item.id);
      if (sp && sp.shipApi.includes(this.id)) {
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
