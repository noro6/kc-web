import Ship from './ship';
import Const, { AvoidType, Formation } from '../const';
import Item from '../item/item';
import AirCalcResult from '../airCalcResult';
import AntiAirCutIn from '../aerialCombat/antiAirCutIn';
import ShootDownInfo from '../aerialCombat/shootDownInfo';

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
  public readonly shootDownList: ShootDownInfo[];

  /** 発動可能対空CI全種 */
  public readonly allAntiAirCutIn: AntiAirCutIn[];

  /** 現在搭載数における制空値 計算用 */
  public airPower: number;

  /** 計算結果の各制空状態の割合 */
  public results: AirCalcResult[] = [new AirCalcResult()];

  /** 表示戦闘の各制空状態の割合 */
  public mainResult = new AirCalcResult();

  /** この艦隊の随伴艦隊制空値 連合艦隊専用 */
  public escortAirPower = 0;

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
        // 0隻だった場合は空の艦娘を2隻つっこむ
        for (let i = 0; i < 2; i += 1) {
          this.ships.push(new Ship());
        }
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

    const generalCutin: AntiAirCutIn[] = [];
    const specialCutin: AntiAirCutIn[] = [];
    const enabledShips = this.ships.filter((v) => v.isActive && !v.isEmpty);

    for (let i = 0; i < enabledShips.length; i += 1) {
      const ship = enabledShips[i];
      if (ship.isActive && !ship.isEmpty) {
        this.fullAirPower += ship.fullAirPower;
        this.tp += ship.tp;

        for (let j = 0; j < ship.antiAirCutIn.length; j += 1) {
          const cutIn = ship.antiAirCutIn[j];
          // 対空カットインを振り分け
          if (cutIn.id >= 34 && cutIn.id !== 36) specialCutin.push(cutIn);
          else generalCutin.push(cutIn);
        }

        const shipPlanes = ship.items.filter((v) => v.isPlane && v.fullSlot > 0);
        if (shipPlanes.length) {
          // 連合かつ第2艦隊なら艦載機の随伴機フラグを挙げる
          if (this.isUnion && ship.isEscort) {
            for (let j = 0; j < shipPlanes.length; j += 1) {
              shipPlanes[j].isEscortItem = true;
            }
          }
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

    // 特殊CIソート => (性能順, 38種以降)
    specialCutin.sort((a, b) => (a.rateCorr !== b.rateCorr ? b.rateCorr - a.rateCorr : b.fixCorrA - a.fixCorrA));
    // 通常CIソート => (種別の降順)
    generalCutin.sort((a, b) => b.id - a.id);
    // 特殊CIを最優先とし、後続に通常CIを格納した対空CI配列 これで対空CI確定
    this.allAntiAirCutIn = specialCutin.concat(generalCutin);

    // 対空砲火情報更新 todo 陣形 空襲情報
    this.shootDownList = [];
    let sum = 1;
    let border = 0;
    for (let i = 0; i < this.allAntiAirCutIn.length; i += 1) {
      const cutIn = this.allAntiAirCutIn[i];
      const rate = sum * cutIn.rate;
      sum -= rate;
      border += rate;

      this.shootDownList.push(new ShootDownInfo(enabledShips, false, this.isUnion, cutIn, border));
    }
    // 対空CI不発データを挿入
    this.shootDownList.push(new ShootDownInfo(enabledShips, false, this.isUnion, new AntiAirCutIn(), 1));
  }

  /**
   * 引数の条件下での艦隊防空値を返却(表示値 実計算では別)
   * @param {Formation} [formation] 陣形 なければ単縦と一緒
   * @param {AvoidType} [avoid] 回避補正
   * @returns {number} 艦隊防空値
   * @memberof Fleet
   */
  public getFleetAntiAir(formation?: Formation, avoid?: AvoidType): number {
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
