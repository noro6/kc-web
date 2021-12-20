import Enemy from './Enemy';
import Const, { AvoidType, Formation } from './Const';

interface Stage2Table {
  rateDownList: number[];
  fixDownList: number[];
}

export default class EnemyFleet {
  public formation = 1;

  public cellType = 1;

  public isUnion = false;

  public range = 0;

  public fleetAntiAir = 0;

  public isAllSubmarine = false;

  public enemies: Enemy[];

  constructor() {
    this.enemies = [];
    this.clear();
  }

  clear(): void {
    this.formation = 1;
    this.cellType = 1;
    this.isUnion = false;
    this.isAllSubmarine = false;
    this.enemies = [];
    for (let i = 0; i < 6; i += 1) {
      this.enemies.push(new Enemy());
    }
  }

  /**
   * この艦隊総制空値を返却
   * @readonly
   * @type {number}
   * @memberof EnemyFleet
   */
  get airPower(): number {
    return EnemyFleet.getSumAirPower(this.enemies);
  }

  /**
   * この艦隊の主力艦制空値を返却
   * @readonly
   * @type {number}
   * @memberof EnemyFleet
   */
  get mainAirPower(): number {
    return EnemyFleet.getSumAirPower(this.enemies.filter((v) => !v.isEscort));
  }

  /**
   * この艦隊の主力艦制空値を返却
   * @readonly
   * @type {number}
   * @memberof EnemyFleet
   */
  get escortAirPower(): number {
    return EnemyFleet.getSumAirPower(this.enemies.filter((v) => v.isEscort));
  }

  /**
   * Enemy配列から制空値を合計するだけのメソッド
   * @private
   * @static
   * @param {Enemy[]} enemies
   * @returns {number} 制空値合計
   * @memberof EnemyFleet
   */
  private static getSumAirPower(enemies: Enemy[]): number {
    let sum = 0;
    for (let i = 0; i < enemies.length; i += 1) {
      sum += enemies[i].airPower;
    }
    return sum;
  }

  /**
   * 引数の条件下での艦隊防空値を返却
   * @param {Formation} [formation] 陣形 なければ単縦と一緒
   * @param {AvoidType} [avoid] 回避補正
   * @returns {number} 艦隊防空値
   * @memberof EnemyFleet
   */
  getFleetAntiAir(formation?: Formation, avoid?: AvoidType): number {
    // 各艦の艦隊対空ボーナス合計
    let sumAntiAirBonus = 0;
    const enemyCount = this.enemies.length;
    for (let i = 0; i < enemyCount; i += 1) {
      sumAntiAirBonus += this.enemies[i].antiAirBonus;
    }
    sumAntiAirBonus = Math.floor(sumAntiAirBonus);

    // 艦隊防空 => int(陣形補正 * 各艦の艦隊対空ボーナス合計)
    const fleetAntiAir = Math.floor(sumAntiAirBonus * (formation ? formation.correction : 1));

    if (avoid && avoid.c2 !== 1.0) {
      // 艦隊防空補正 => int(艦隊防空 * 対空射撃回避補正(艦隊防空ボーナス))
      return Math.floor(fleetAntiAir * avoid.c2);
    }

    // 艦隊防空補正 => 艦隊防空
    return fleetAntiAir;
  }

  getStage2(formation?: Formation, avoid?: AvoidType): Stage2Table[] {
    const stage2: Stage2Table[] = [];
    const enemyCount = this.enemies.length;
    if (enemyCount === 0) {
      return stage2;
    }

    for (let i = 0; i < Const.AVOID_TYPE.length; i += 1) {
      stage2.push({ fixDownList: [], rateDownList: [] });
    }

    // 陣形補正
    const aj1 = formation ? formation.correction : 1;

    // 艦隊防空ボーナス合計
    let sumAntiAirBonus = 0;
    for (let i = 0; i < enemyCount; i += 1) {
      sumAntiAirBonus += this.enemies[i].antiAirBonus;
    }
    sumAntiAirBonus = Math.floor(sumAntiAirBonus);

    // 艦隊防空 => int(陣形補正 * 各艦の艦隊対空ボーナス合計)
    const fleetAntiAir = Math.floor(sumAntiAirBonus * aj1);

    for (let i = 0; i < enemyCount; i += 1) {
      const enm = this.enemies[i];
      if (enm.data.id === 0) continue;

      const isEscort = this.isUnion && i >= 6;
      let sumItemAntiAir = 0;
      let sumAntiAirWeight = 0;

      // この敵艦の装備各値の合計
      for (let j = 0; j < enm.items.length; j += 1) {
        // 装備対空値の加算
        sumItemAntiAir += enm.items[j].data.antiAir;
        // 装備果汁対空値の加算
        sumAntiAirWeight += enm.items[j].antiAirWeight;
      }

      // 連合艦隊補正
      let unionFactor = 1.0;
      if (this.isUnion && isEscort) {
        unionFactor = 0.48;
      } else if (this.isUnion && !isEscort) {
        unionFactor = 0.8;
      }

      // 各回避補正毎にテーブルを作成
      for (let j = 0; j < Const.AVOID_TYPE.length; j += 1) {
        let avoid1 = Const.AVOID_TYPE[j].c1;
        let avoid2 = Const.AVOID_TYPE[j].c2;

        if (j === Const.AVOID_TYPE.length - 1 && avoid) {
          // 任意の射撃回避補正値を置き換え
          avoid1 = avoid.c1;
          avoid2 = avoid.c2;
        }

        // 艦船加重対空値 -敵側式
        let antiAirWeight = 0;
        if (avoid1 === 1.0) {
          // 艦船加重対空値 => int(sqrt(素対空 + 装備対空)) + Σ(装備対空値 * 装備倍率)
          antiAirWeight = Math.floor(Math.sqrt(enm.data.antiAir + sumItemAntiAir)) + sumAntiAirWeight;
        } else {
          // 艦船加重対空値 => int((int(sqrt(素対空 + 装備対空)) + Σ(装備対空値 * 装備倍率)) * 対空射撃回避補正)
          antiAirWeight = Math.floor((Math.floor(Math.sqrt(enm.data.antiAir + sumItemAntiAir)) + sumAntiAirWeight) * avoid1);
        }

        // 艦隊防空補正
        let fleetAA = 0;
        if (avoid2 === 1.0) {
          // 艦隊防空補正 => 艦隊防空
          fleetAA = fleetAntiAir;
        } else {
          // 艦隊防空補正 => int(艦隊防空 * 対空射撃回避補正(艦隊防空ボーナス))
          fleetAA = Math.floor(fleetAntiAir * avoid2);
        }

        // 割合撃墜 => int(0.02 * 0.25 * 機数[あとで] * 艦船加重対空値 * 連合補正)
        stage2[j].rateDownList.push(0.02 * 0.25 * antiAirWeight * unionFactor);
        // 固定撃墜 => int((加重対空値 + 艦隊防空補正) * 基本定数(0.25) * 敵補正(0.75) * 連合補正)
        stage2[j].fixDownList.push(Math.floor((antiAirWeight + fleetAA) * 0.25 * 0.75 * unionFactor));
      }
    }

    return stage2;
  }
}
