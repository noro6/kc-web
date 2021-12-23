import Ship from './Ship';
import Const, { AvoidType, Formation } from './Const';

export interface FleetBuilder {
  // eslint-disable-next-line no-use-before-define
  fleet?: Fleet | undefined;
  /** 敵一覧 未指定ならfleetの敵一覧で作成 */
  ships?: Ship[];
  /** 陣形 未指定ならfleetの陣形で作成 */
  formation?: number;
  /** 連合フラグ 未指定ならfleetの連合フラグで作成 */
  isUnion?: boolean;
}

interface Stage2Table {
  rateDownList: number[];
  fixDownList: number[];
}

export default class Fleet {
  /** この艦隊を構成する艦娘一覧 */
  public readonly ships: Ship[];

  /** 陣形 */
  public readonly formation: number;

  /** 連合艦隊フラグ */
  public readonly isUnion: boolean;

  /** 連合艦隊フラグ */
  public readonly isAllSubmarine: boolean;

  /** 艦隊制空値 */
  public readonly fullAirPower: number;

  /** 艦隊防空値 */
  public readonly fleetAntiAir: number;

  constructor(builder: FleetBuilder = {}) {
    console.log('Fleet initialize');
    if (builder.fleet) {
      // builderよりそのままインスタンスを引継ぎ
      this.ships = builder.ships ? builder.ships.concat() : builder.fleet.ships.concat();
      this.formation = builder.formation !== undefined ? builder.formation : builder.fleet.formation;
      this.isUnion = builder.isUnion !== undefined ? builder.isUnion : builder.fleet.isUnion;
    } else {
      this.ships = builder.ships ? builder.ships.concat() : [];
      this.formation = builder.formation !== undefined ? builder.formation : 1;
      this.isUnion = builder.isUnion !== undefined ? builder.isUnion : false;

      if (this.ships.length === 0) {
        // 0隻だった場合は空の艦娘を1隻つっこむ
        this.ships.push(new Ship());
      }
    }

    // 計算により算出するステータス
    this.isAllSubmarine = false;
    const formation = Const.FORMATIONS.find((v) => v.value === this.formation);
    this.fleetAntiAir = this.getFleetAntiAir(formation);

    // 制空値合計
    this.fullAirPower = 0;
    for (let i = 0; i < this.ships.length; i += 1) {
      const ship = this.ships[i];
      if (ship.isActive) {
        this.fullAirPower += this.ships[i].fullAirPower;
      }
    }
  }

  /**
   * 引数の条件下での艦隊防空値を返却
   * @param {Formation} [formation] 陣形 なければ単縦と一緒
   * @param {AvoidType} [avoid] 回避補正
   * @returns {number} 艦隊防空値
   * @memberof Fleet
   */
  public getFleetAntiAir(formation?: Formation, avoid?: AvoidType): number {
    // 各艦の艦隊対空ボーナス合計
    let sumAntiAirBonus = 0;
    const enemyCount = this.ships.length;
    for (let i = 0; i < enemyCount; i += 1) {
      sumAntiAirBonus += this.ships[i].antiAirBonus;
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

  /**
   * stage2撃墜数テーブルを返却 -味方側式
   * @param {Formation} [formation] 陣形 未指定で単縦
   * @param {AvoidType} [avoid] 射撃回避 未指定で通常
   * @return {*}  {Stage2Table[]} 各回避補正毎のstage2情報
   * @memberof Fleet
   */
  public getStage2(formation?: Formation, avoid?: AvoidType): Stage2Table[] {
    const stage2: Stage2Table[] = [];
    const enemyCount = this.ships.length;
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
      sumAntiAirBonus += this.ships[i].antiAirBonus;
    }
    sumAntiAirBonus = Math.floor(sumAntiAirBonus);

    // 艦隊防空 => int(陣形補正 * 各艦の艦隊対空ボーナス合計)
    const fleetAntiAir = Math.floor(sumAntiAirBonus * aj1);

    for (let i = 0; i < enemyCount; i += 1) {
      const enm = this.ships[i];
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
        // 固定撃墜 => int((加重対空値 + 艦隊防空補正) * 基本定数(0.25) * 自軍補正(0.8) * 連合補正)
        stage2[j].fixDownList.push(Math.floor((antiAirWeight + fleetAA) * 0.25 * 0.8 * unionFactor));
      }
    }

    return stage2;
  }
}
