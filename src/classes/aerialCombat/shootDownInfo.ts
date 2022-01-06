import Const, { Formation, AvoidType } from '../const';
import { Stage2Table } from '../enemy/enemyFleet';
import Fleet from '../fleet/fleet';

interface ShootDownStatus {
  rateDownList: number[];
  fixDownList: number[];
  minimumDownList: number[];
}

export default class ShootDownInfo {
  /**
   * 対空射撃回避区分毎の撃墜性能(固定 割合 最低保証)セット
   * @type {ShootDownStatus[]}
   * @memberof ShootDownInfo
   */
  public readonly shootDownStatusList: ShootDownStatus[];

  constructor(fleet: Fleet) {
    this.shootDownStatusList = ShootDownInfo.getStage2(fleet);
  }

  /**
   * stage2撃墜数テーブルを返却 -味方側式
   * @param {Formation} [formation] 陣形 未指定で単縦
   * @param {AvoidType} [avoid] 「任意」の射撃回避性能を指定する場合セット 未指定で通常
   * @return {*}  {Stage2Table[]} 各回避補正毎のstage2情報
   * @memberof Fleet
   */
  public static getStage2(fleet: Fleet, formation?: Formation, avoid?: AvoidType): ShootDownStatus[] {
    const stage2: Stage2Table[] = [];
    const ships = fleet.ships.filter((v) => v.isActive && !v.isEmpty);
    const shipCount = ships.length;
    if (shipCount === 0) {
      // 全てが0のデータ
      for (let i = 0; i < Const.AVOID_TYPE.length; i += 1) {
        stage2.push({ fixDownList: [0], rateDownList: [0], minimumDownList: [0] });
      }
      return stage2;
    }
    for (let i = 0; i < Const.AVOID_TYPE.length; i += 1) {
      stage2.push({ fixDownList: [], rateDownList: [], minimumDownList: [] });
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
      if (fleet.isUnion && ship.isEscort) {
        unionFactor = 0.48;
      } else if (fleet.isUnion && !ship.isEscort) {
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
        // 最低保証 => 一応補正を掛ける 不明だけどとりあえず射撃回避持ちは0になる
        stage2[j].minimumDownList.push(Math.floor(1 * (avoid1 < 1 ? 0.99 : 1)));
      }
    }

    return stage2;
  }
}
