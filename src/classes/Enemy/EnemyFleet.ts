import Enemy from './enemy';
import Const, { AvoidType, CELL_TYPE, Formation } from '../const';
import Item from '../item/item';
import CommonCalc from '../commonCalc';

export interface EnemyFleetBuilder {
  // eslint-disable-next-line no-use-before-define
  fleet?: EnemyFleet | undefined;
  /** 敵一覧 未指定ならfleetの敵一覧で作成 */
  enemies?: Enemy[];
  /** 陣形 未指定ならfleetの陣形で作成 */
  formation?: number;
  /** 戦闘形式 未指定ならfleetの戦闘形式で作成 */
  cellType?: number;
  /** 半径 未指定ならfleetの半径で作成 */
  range?: number;
}

export interface Stage2Table {
  rateDownList: number[];
  fixDownList: number[];
}

export default class EnemyFleet {
  /** 敵一覧 */
  public readonly enemies: Enemy[];

  /** 陣形id */
  public readonly formation: number;

  /** 戦闘形式 */
  public readonly cellType: number;

  /** 連合艦隊かそうでないか */
  public readonly isUnion: boolean;

  /** 半径 */
  public readonly range: number;

  /** 全員潜水艦かどうか */
  public readonly isAllSubmarine: boolean;

  /** 全員潜水艦かどうか */
  public readonly hasPlane: boolean;

  /** 艦隊防空値 */
  public readonly fleetAntiAir: number;

  /** 制空値 -減衰なし最大 */
  public readonly fullAirPower: number;

  /** 制空値 -減衰なし各種ボーダー */
  public readonly fullBorders: number[];

  /** 主力艦制空値 */
  public readonly mainAirPower: number;

  /** 随伴艦制空値 */
  public readonly escortAirPower: number;

  /** 制空値【対基地】-減衰なし最大 */
  public readonly fullLandbaseAirPower: number;

  /** 制空値 -減衰なし各種ボーダー */
  public readonly fullLandbaseBorders: number[];

  /** 主力艦制空値【対基地】 */
  public readonly mainLandbaseAirPower: number;

  /** 随伴艦制空値【対基地】 */
  public readonly escortLandbaseAirPower: number;

  /** stage2 撃墜テーブル */
  public readonly stage2: Stage2Table[];

  /** 敵主力艦隊一覧 */
  public readonly mainEnemies: Enemy[];

  /** 敵随伴艦隊一覧 */
  public readonly escortEnemies: Enemy[];

  /** 制空値 計算用 */
  public airPower: number;

  /** 制空値【対基地】 計算用 */
  public landbaseAirPower: number;

  /** 敵の装備艦載機一覧 計算用 */
  public readonly allPlanes: Item[];

  constructor(builder: EnemyFleetBuilder = {}) {
    if (builder.fleet) {
      // builderよりそのままインスタンスを引継ぎ
      this.enemies = builder.enemies ? builder.enemies.concat() : builder.fleet.enemies.concat();
      this.formation = builder.formation !== undefined ? builder.formation : builder.fleet.formation;
      this.cellType = builder.cellType !== undefined ? builder.cellType : builder.fleet.cellType;
      this.range = builder.range !== undefined ? builder.range : builder.fleet.range;
    } else {
      this.enemies = builder.enemies ? builder.enemies.concat() : [];
      this.formation = builder.formation !== undefined ? builder.formation : 1;
      this.cellType = builder.cellType !== undefined ? builder.cellType : 1;
      this.range = builder.range !== undefined ? builder.range : 0;

      if (this.enemies.length === 0) {
        // 0隻だった場合は6隻で初期化してやる
        for (let i = 0; i < 6; i += 1) {
          this.enemies.push(new Enemy());
        }
      }
    }

    // 計算により算出するステータス
    this.isAllSubmarine = false;
    this.hasPlane = false;
    this.isUnion = this.cellType === CELL_TYPE.GRAND;
    const formation = Const.FORMATIONS.find((v) => v.value === this.formation);
    this.fleetAntiAir = this.getFleetAntiAir(formation);
    // 陣形は決まっているため、計算で使うstage2はここで算出
    this.stage2 = this.getStage2(formation);

    // 制空値合計
    this.fullAirPower = 0;
    this.mainAirPower = 0;
    this.escortAirPower = 0;
    this.fullLandbaseAirPower = 0;
    this.mainLandbaseAirPower = 0;
    this.escortLandbaseAirPower = 0;

    this.allPlanes = [];
    this.mainEnemies = [];
    this.escortEnemies = [];
    for (let i = 0; i < this.enemies.length; i += 1) {
      const enemy = this.enemies[i];
      this.fullAirPower += enemy.fullAirPower;
      this.fullLandbaseAirPower += enemy.fullLBAirPower;

      if (!enemy.isEscort) {
        this.mainAirPower += enemy.fullAirPower;
        this.mainLandbaseAirPower += enemy.fullLBAirPower;
        this.mainEnemies.push(enemy);
      } else {
        this.escortAirPower += enemy.fullAirPower;
        this.escortLandbaseAirPower += enemy.fullLBAirPower;
        this.escortEnemies.push(enemy);
      }

      // 艦載機を持つ敵のみ格納
      if (enemy.hasPlane) {
        const planes = enemy.items.filter((v) => v.isPlane);
        this.allPlanes = this.allPlanes.concat(planes);
        if (!this.hasPlane && planes.find((v) => !v.isRecon)) {
          this.hasPlane = true;
        }
      }
    }

    this.airPower = this.fullAirPower;
    this.landbaseAirPower = this.fullLandbaseAirPower;
    this.fullBorders = CommonCalc.getAirStatusBorder(this.fullAirPower);
    this.fullLandbaseBorders = CommonCalc.getAirStatusBorder(this.fullLandbaseAirPower);
  }

  /**
   * 引数の条件下での艦隊防空値を返却
   * @param {Formation} [formation] 陣形 なければ単縦と一緒
   * @param {AvoidType} [avoid] 回避補正
   * @returns {number} 艦隊防空値
   * @memberof EnemyFleet
   */
  public getFleetAntiAir(formation?: Formation, avoid?: AvoidType): number {
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
    return 2 * fleetAntiAir;
  }

  /**
   * stage2撃墜数テーブルを返却 -敵側式
   * @param {Formation} [formation] 陣形 未指定で単縦
   * @param {AvoidType} [avoid] 任意射撃回避の値を変更する場合設定する 未指定で通常
   * @return {*}  {Stage2Table[]} 各回避補正毎のstage2情報
   * @memberof EnemyFleet
   */
  public getStage2(formation?: Formation, avoid?: AvoidType): Stage2Table[] {
    const stage2: Stage2Table[] = [];
    const enemies = this.enemies.filter((v) => v.data.id > 0);
    const enemyCount = enemies.length;
    if (enemyCount === 0) {
      // 全てが0のデータ
      for (let i = 0; i < Const.AVOID_TYPE.length; i += 1) {
        stage2.push({ fixDownList: [0], rateDownList: [0] });
      }
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
      sumAntiAirBonus += enemies[i].antiAirBonus;
    }
    sumAntiAirBonus = Math.floor(sumAntiAirBonus);

    // 艦隊防空 => int(陣形補正 * 各艦の艦隊対空ボーナス合計)
    const fleetAntiAir = Math.floor(sumAntiAirBonus * aj1);

    for (let i = 0; i < enemyCount; i += 1) {
      const enm = enemies[i];

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
