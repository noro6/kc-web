import EnemyMaster from './EnemyMaster';
import Item from './Item';

export default class Enemy {
  public readonly data: EnemyMaster;

  public readonly items: Item[];

  public readonly antiAirBonus: number;

  public readonly isEscort: boolean;

  constructor(enemy = new EnemyMaster(), items: Item[] = [], isEscort = false) {
    this.data = enemy;
    this.items = items;
    this.isEscort = isEscort;
    this.antiAirBonus = this.getAntiAirBonus();
  }

  /**
   * この敵艦の制空値を返却
   * @readonly
   * @type {number}
   * @memberof Enemy
   */
  get airPower(): number {
    let sum = 0;
    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      // 搭載数0と偵察機を除外
      if (item.slot > 0 && !item.isRecon) {
        sum += item.airPower;
      }
    }
    return sum;
  }

  /**
   * この敵艦の基地制空値を返却
   * @readonly
   * @type {number}
   * @memberof Enemy
   */
  get landBaseairPower(): number {
    let sum = 0;
    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      if (item.slot > 0) {
        sum += item.airPower;
      }
    }
    return sum;
  }

  /**
   * この敵艦の艦隊防空ボーナスを返却
   * @private
   * @memberof Enemy
   */
  private getAntiAirBonus(): number {
    let sum = 0;
    for (let i = 0; i < this.items.length; i += 1) {
      sum += this.items[i].antiAirBonus;
    }
    return Math.floor(sum);
  }
}
