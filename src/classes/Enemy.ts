import EnemyMaster from './EnemyMaster';
import Item from './Item';

export default class Enemy {
  public data: EnemyMaster;

  public items: Item[] = [];

  /**
   * 装備対空値合計
   * @memberof Enemy
   */
  public sumItemAA = 0;

  /**
   * 連合艦隊の随伴かどうか
   * @memberof Enemy
   */
  public isEscort = false;

  constructor(enemy = new EnemyMaster()) {
    this.data = enemy;
    this.isEscort = false;
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
      if (item.slot > 0) {
        const antiAir = item.actualAntiAir + item.bonusAntiAir;
        item.airPower = Math.floor(antiAir * Math.sqrt(item.slot) + item.bonusAirPower);
        sum += item.airPower;
      }
    }
    return sum;
  }

  /**
   * この敵艦の艦隊防空ボーナスを返却
   * @readonly
   * @type {number}
   * @memberof Enemy
   */
  get antiAirBonus(): number {
    let sum = 0;
    for (let i = 0; i < this.items.length; i += 1) {
      sum += this.items[i].antiAirBonus;
    }
    return sum;
  }
}
