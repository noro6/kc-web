import Ship from './ship';
import Const, { AvoidType, Formation } from '../const';
import Item from '../item/item';
import AirCalcResult from '../airCalcResult';

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

  /** 艦隊制空値 */
  public readonly fullAirPower: number;

  /** 輸送量 */
  public readonly tp: number;

  /** 航空戦が可能な機体ありなし */
  public readonly hasPlane: boolean;

  /** 噴式機ありなし */
  public readonly hasJet: boolean;

  /** 艦隊防空値(ブラウザ版表示値) */
  public readonly fleetAntiAir: number;

  /** この艦隊の全艦載機装備 搭載数1以上 計算用 */
  public readonly allPlanes: Item[];

  /** stage2 撃墜テーブル */
  public readonly stage2: Stage2Table[];

  /** 現在搭載数における制空値 計算用 */
  public airPower: number;

  /** 計算結果の各制空状態の割合 */
  public results: AirCalcResult[] = [new AirCalcResult()];

  /** 表示戦闘の各制空状態の割合 */
  public mainResult = new AirCalcResult();

  constructor(builder: FleetBuilder = {}) {
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
        // 0隻だった場合は空の艦娘を隻つっこむ
        this.ships.push(new Ship());
      }
    }

    // 計算により算出するステータス
    const formation = Const.FORMATIONS.find((v) => v.value === this.formation);
    this.fleetAntiAir = this.getFleetAntiAir(formation);
    this.tp = 0;
    this.fullAirPower = 0;
    this.hasJet = false;
    this.hasPlane = false;

    this.allPlanes = [];
    for (let i = 0; i < this.ships.length; i += 1) {
      const ship = this.ships[i];
      if (ship.isActive && !ship.isEmpty) {
        this.fullAirPower += ship.fullAirPower;
        this.tp += ship.tp;

        const shipPlanes = ship.items.filter((v) => v.isPlane && v.fullSlot > 0);
        if (shipPlanes.length) {
          this.allPlanes = this.allPlanes.concat(shipPlanes);
          if (!this.hasPlane && this.allPlanes.find((v) => !v.isRecon)) {
            this.hasPlane = true;
          }
        }
        if (!this.hasJet && ship.hasJet) {
          this.hasJet = true;
        }
      }
    }

    this.airPower = this.fullAirPower;

    // todo 陣形は決まっていないが…？計算で使うstage2はここで算出
    this.stage2 = this.getStage2(formation);
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
    const ships = this.ships.filter((v) => v.isActive && !v.isEmpty);
    const shipCount = ships.length;
    if (shipCount === 0) {
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
    for (let i = 0; i < shipCount; i += 1) {
      sumAntiAirBonus += ships[i].antiAirBonus;
    }
    sumAntiAirBonus = Math.floor(sumAntiAirBonus);

    // 艦隊防空 => int((陣形補正 * 各艦の艦隊対空ボーナス合計) / ブラウザ版補正(1.3))
    const fleetAntiAir = Math.floor((sumAntiAirBonus * aj1) / 1.3);

    for (let i = 0; i < shipCount; i += 1) {
      const ship = ships[i];

      const isEscort = this.isUnion && i >= 6;
      let sumAntiAirWeight = 0;

      // この艦娘の装備各値の合計
      for (let j = 0; j < ship.items.length; j += 1) {
        // 装備加重対空値の加算
        sumAntiAirWeight += ship.items[j].antiAirWeight;
      }
      // 補強増設の分を加算
      sumAntiAirWeight += ship.exItem.antiAirWeight;

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

        // 艦船加重対空値 -艦娘側式
        let antiAirWeight = 0;
        if (avoid1 === 1.0) {
          // 艦船加重対空値 => 素対空 / 2 + Σ(装備対空値 * 装備倍率)
          antiAirWeight = ship.antiAir / 2 + sumAntiAirWeight;
        } else {
          // 艦船加重対空値 => int((素対空 / 2 + Σ(装備対空値 * 装備倍率)) * 対空射撃回避補正)
          antiAirWeight = Math.floor((ship.antiAir / 2 + sumAntiAirWeight) * avoid1);
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

  /**
   * 引数の条件下での艦隊防空値を返却(表示値 実計算では別)
   * @param {Formation} [formation] 陣形 なければ単縦と一緒
   * @param {AvoidType} [avoid] 回避補正
   * @returns {number} 艦隊防空値
   * @memberof Fleet
   */
  private getFleetAntiAir(formation?: Formation, avoid?: AvoidType): number {
    // 各艦の艦隊対空ボーナス合計
    let sumAntiAirBonus = 0;
    const ships = this.ships.filter((v) => v.isActive && !v.isEmpty);
    const shipCount = ships.length;
    for (let i = 0; i < shipCount; i += 1) {
      sumAntiAirBonus += ships[i].antiAirBonus;
    }
    sumAntiAirBonus = Math.floor(sumAntiAirBonus);

    // 艦隊防空 => int(陣形補正 * 各艦の艦隊対空ボーナス合計)
    const fleetAntiAir = Math.floor(sumAntiAirBonus * (formation ? formation.correction : 1));

    if (avoid && avoid.c2 !== 1.0) {
      // 艦隊防空補正 => int(艦隊防空 * 対空射撃回避補正(艦隊防空ボーナス))
      return Math.floor(fleetAntiAir * avoid.c2);
    }

    // 最終艦隊防空補正 / ブラウザ版(1.3)
    return 2 * (fleetAntiAir / 1.3);
  }
}
