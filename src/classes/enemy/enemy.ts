import EnemyMaster from './enemyMaster';
import Item from '../item/item';

export default class Enemy {
  /** 敵マスタ情報 */
  public readonly data: EnemyMaster;

  /** 装備一覧 */
  public readonly items: Item[];

  /** 防空ボーナス */
  public readonly antiAirBonus: number;

  /** 実装甲値 */
  public readonly actualArmor: number;

  /** 随伴艦フラグ */
  public readonly isEscort: boolean;

  /** 制空値(搭載数満タン) */
  public readonly fullAirPower: number;

  /** 制空値【対基地】(搭載数満タン) */
  public readonly fullLBAirPower: number;

  /** 制空値【対基地】(搭載数満タン) */
  public readonly sumItemAccuracy: number;

  /** 艦載機を持っているかどうか */
  public readonly hasPlane: boolean;

  constructor(enemy = new EnemyMaster(), items: Item[] = [], isEscort = false) {
    this.data = enemy;
    this.items = items;
    this.isEscort = isEscort;

    this.actualArmor = this.data.armor;
    this.sumItemAccuracy = 0;
    this.fullLBAirPower = 0;
    this.fullAirPower = 0;
    this.antiAirBonus = 0;
    this.hasPlane = false;
    // 計算により算出するステータス
    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      // 装備命中
      this.sumItemAccuracy += item.data.accuracy;
      // 装備防空ボーナス
      this.antiAirBonus += item.antiAirBonus;
      // 装備装甲値加算
      this.actualArmor += item.data.armor;
      if (item.fullSlot > 0) {
        // 基地制空値
        this.fullLBAirPower += item.fullAirPower;
        if (!item.isRecon) {
          // 通常制空値
          this.fullAirPower += item.fullAirPower;
        }
      }

      if (!this.hasPlane && item.isPlane) {
        this.hasPlane = true;
      }
    }

    this.antiAirBonus = Math.floor(this.antiAirBonus);
  }
}
