import AntiAirCutIn from '../aerialCombat/antiAirCutIn';
import EnemyMaster from '../enemy/enemyMaster';
import ShipMaster from '../fleet/shipMaster';
import Item from '../item/item';

export interface ShipBase {
  /** 艦船マスタ情報 */
  readonly data: ShipMaster | EnemyMaster

  /** 装備一覧 */
  readonly items: Item[];

  /** 補強増設枠 */
  readonly exItem: Item;

  /** 随伴艦フラグ */
  readonly isEscort: boolean;

  /** 計算で用いる実対空値 */
  readonly antiAir: number;

  /** 計算で用いる対空ボーナス */
  readonly antiAirBonus: number;

  /** 発動可能対空CI */
  readonly antiAirCutIn: AntiAirCutIn[];

  /** 特殊高角砲所持数 */
  readonly specialKokakuCount: number;

  /** 高角砲所持数 */
  readonly kokakuCount: number;

  /** 特殊機銃所持数 */
  readonly specialKijuCount: number;

  /** 機銃所持数 */
  readonly kijuCount: number;

  /** 対空電探所持数 */
  readonly antiAirRadarCount: number;

  /** 高射装置所持数 */
  readonly koshaCount: number

  /** 実耐久値 */
  readonly hp: number;

  /** 装備ボーナス対空値合計 */
  readonly totalBonusAntiAir: number;
}
