import EnemyMaster from './enemyMaster';
import Item, { ItemBuilder } from '../item/item';
import ItemMaster from '../item/itemMaster';
import { SHIP_TYPE } from '../const';
import { ShipBase } from '../interfaces/shipBase';
import AntiAirCutIn from '../aerialCombat/antiAirCutIn';
import ShootDownInfo from '../aerialCombat/shootDownInfo';
import { ItemBonusStatus } from '../item/ItemBonus';

export default class Enemy implements ShipBase {
  /** 敵マスタ情報 */
  public readonly data: EnemyMaster;

  /** 装備一覧 */
  public readonly items: Item[];

  /** 補強増設 */
  public readonly exItem: Item;

  /** 計算で適用する対空 */
  public readonly antiAir: number;

  /** 防空ボーナス */
  public readonly antiAirBonus: number;

  /** 実耐久値 */
  public readonly hp: number;

  /** 計算で適用する練度 */
  public readonly level: number;

  /** 計算で適用する運 */
  public readonly luck: number;

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

  /** 潜水艦かどうか */
  public readonly isSubmarine: boolean;

  /** 発動可能対空CI */
  public readonly antiAirCutIn: AntiAirCutIn[];

  /** 特殊高角砲所持数 */
  public readonly specialKokakuCount: number;

  /** 高角砲所持数 */
  public readonly kokakuCount: number;

  /** 特殊機銃所持数 */
  public readonly specialKijuCount: number;

  /** 機銃所持数 */
  public readonly kijuCount: number;

  /** 対空電探所持数 */
  public readonly antiAirRadarCount: number;

  /** 水上電探所持数 */
  public readonly surfaceRadarCount: number;

  /** 電探所持 */
  public readonly hasRadar: boolean;

  /** 高射装置所持数 */
  public readonly koshaCount: number

  /** 装備ボーナス合計 まとめ */
  readonly itemBonusStatus: ItemBonusStatus = {};

  /** 夜襲 発動可能判定 */
  public readonly enabledAircraftNightAttack: boolean;

  /** 本隊航空戦に参加しないフラグ */
  public disabledMainAerialPhase = false;

  /** 棒立ち率 */
  public allPlaneDeathRate = 0;

  constructor(enemy = new EnemyMaster(), items: Item[] = [], isEscort = false) {
    this.data = enemy;
    this.items = items;
    this.isEscort = isEscort;

    this.actualArmor = this.data.armor;
    this.hp = this.data.hp;
    this.level = 1;
    this.luck = 0;
    this.sumItemAccuracy = 0;
    this.fullLBAirPower = 0;
    this.fullAirPower = 0;
    this.antiAirBonus = 0;
    this.exItem = new Item();
    this.hasPlane = false;
    this.hasRadar = false;
    this.antiAir = this.data.antiAir;

    this.specialKokakuCount = 0;
    this.kokakuCount = 0;
    this.kijuCount = 0;
    this.specialKijuCount = 0;
    this.antiAirRadarCount = 0;
    this.surfaceRadarCount = 0;
    this.koshaCount = 0;

    // 計算により算出するステータス
    const allItems = this.items.concat(this.exItem);
    for (let i = 0; i < allItems.length; i += 1) {
      const item = allItems[i];
      // 装備命中
      this.sumItemAccuracy += item.data.accuracy;
      // 装備防空ボーナス
      this.antiAirBonus += item.antiAirBonus;
      // 装備装甲値加算
      this.actualArmor += item.data.armor;

      if (item.fullSlot > 0) {
        // 基地制空値
        this.fullLBAirPower += item.fullAirPower;
        if (!item.data.isRecon && !item.data.isABAttacker) {
          // 通常制空値
          this.fullAirPower += item.fullAirPower;
        }
      }

      if (!this.hasPlane && item.data.isPlane) {
        this.hasPlane = true;
      }

      // 高角砲カウント
      if (item.data.iconTypeId === 16 && !item.data.isSpecial) {
        this.kokakuCount += 1;
      }
      // 特殊高角砲カウント
      if (item.data.iconTypeId === 16 && item.data.isSpecial) {
        this.specialKokakuCount += 1;
      }
      // 機銃カウント
      if (item.data.apiTypeId === 21 && !item.data.isSpecial) {
        this.kijuCount += 1;
      }
      // 特殊機銃カウント
      if (item.data.apiTypeId === 21 && item.data.isSpecial) {
        this.specialKijuCount += 1;
      }
      // 電探カウント
      if (item.data.apiTypeId === 12 || item.data.apiTypeId === 13) {
        // 対空電探
        if (item.data.antiAir > 1) this.antiAirRadarCount += 1;
        // 水上電探
        if (item.data.scout > 4) this.surfaceRadarCount += 1;
        this.hasRadar = true;
      }
      // 高射装置カウント
      if (item.data.apiTypeId === 36) {
        this.koshaCount += 1;
      }
    }
    this.isSubmarine = this.data.type === SHIP_TYPE.SS || this.data.type === SHIP_TYPE.SSV;
    if (this.isSubmarine) {
      this.level = [1530, 1531, 1570].includes(this.data.id) ? 1 : 50;
    }
    this.enabledAircraftNightAttack = this.data.isCV && ([1971, 1972, 1973, 1974, 1975, 1976, 2105, 2106, 2107, 2108].includes(this.data.id) || items.some((w) => w.data.id === 1608 || w.data.id === 1617));

    // 100倍されていたため戻す
    this.antiAirBonus = Math.floor(this.antiAirBonus / 100);

    // 発動可能対空CI取得
    this.antiAirCutIn = ShootDownInfo.getAntiAirCutIn(this);
  }

  /**
   * マスタから敵データ作成
   * 失敗時は空の敵
   * @static
   * @param {number} id
   * @param {boolean} isEscort
   * @param {EnemyMaster[]} allEnemy
   * @param {ItemMaster[]} allItems
   * @returns {Enemy}
   * @memberof Enemy
   */
  public static createEnemyFromMasterId(id: number, isEscort: boolean, allEnemy: EnemyMaster[], allItems: ItemMaster[]): Enemy {
    const enemy = allEnemy.find((v) => v.id === id);
    if (!enemy) {
      return new Enemy();
    }
    return Enemy.createEnemyFromMaster(enemy, isEscort, allItems);
  }

  /**
   * マスタから敵データ作成
   * @static
   * @param {EnemyMaster} enemy
   * @param {boolean} isEscort
   * @param {ItemMaster[]} allItems
   * @returns {Enemy}
   * @memberof Enemy
   */
  public static createEnemyFromMaster(enemy: EnemyMaster, isEscort: boolean, allItems: ItemMaster[]): Enemy {
    if (!enemy) {
      return new Enemy();
    }
    // 装備マスタより装備を解決
    const items: Item[] = [];

    // apiから渡されるスロット数が怪しいので、有効装備の数とどちらか多い方で対処する
    const slotCount = Math.max(enemy.items.filter((v) => v > 0).length, enemy.slotCount);
    for (let i = 0; i < slotCount; i += 1) {
      const item = allItems.find((v) => v.id === enemy.items[i]);
      if (item) {
        const slot = enemy.slots[i] > 0 ? enemy.slots[i] : 0;
        const builder: ItemBuilder = { master: item, slot };
        // 装備をセット
        items.push(new Item(builder));
      } else {
        items.push(new Item());
      }
    }
    return new Enemy(enemy, items, isEscort);
  }
}
