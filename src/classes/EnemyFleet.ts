import Enemy from './Enemy';
import Const from './Const';

export interface Stage2Table {
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

  get airPower(): number {
    let sum = 0;
    for (let i = 0; i < this.enemies.length; i += 1) {
      sum += this.enemies[i].airPower;
    }
    return sum;
  }

  getStage2(formationId: number, manualAdj1 = 1, manualAdj2 = 1): Stage2Table[] {
    const stage2: Stage2Table[] = [];
    const enemyCount = this.enemies.length;
    if (enemyCount === 0) {
      return stage2;
    }

    // 陣形補正
    const formation = Const.FORMATIONS.find((v) => v.value === formationId);
    const aj1 = formation ? formation.correction : 1.0;

    // 艦隊防空ボーナス合計
    let sumAntiAirBonus = 0;
    for (let i = 0; i < enemyCount; i += 1) {
      sumAntiAirBonus += this.enemies[i].antiAirBonus;
      stage2.push({ fixDownList: [], rateDownList: [] });
    }
    sumAntiAirBonus = Math.floor(sumAntiAirBonus);

    // 艦隊防空 => int(陣形補正 * 各艦の艦隊対空ボーナス合計)
    const fleetAntiAir = Math.floor(sumAntiAirBonus * aj1);

    for (let i = 0; i < enemyCount; i += 1) {
      const enm = this.enemies[i];
      if (enm.data.id === 0) continue;

      let sumItemAntiAir = 0;
      let sumAntiAirWeight = 0;

      for (let j = 0; j < enm.items.length; j += 1) {
        sumItemAntiAir += enm.items[j].data.antiAir;
        sumAntiAirWeight += enm.items[j].antiAirWeight;
      }

      // 連合艦隊補正
      let unionFactor = 1.0;
      if (this.isUnion && enm.isEscort) {
        unionFactor = 0.48;
      } else if (this.isUnion && !enm.isEscort) {
        unionFactor = 0.8;
      }

      // 各回避補正毎にテーブルを作成
      for (let j = 0; j < Const.AVOID_TYPE.length; j += 1) {
        let avoid1 = Const.AVOID_TYPE[j].adj[0];
        let avoid2 = Const.AVOID_TYPE[j].adj[1];

        if (j === Const.AVOID_TYPE.length - 1) {
          // 任意の射撃回避補正値を置き換え
          avoid1 = manualAdj1;
          avoid2 = manualAdj2;
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
