import Const, { Formation, AvoidType } from '../const';
import Enemy from '../enemy/enemy';
import Ship from '../fleet/ship';
import AntiAirCutIn from './antiAirCutIn';

export interface ShootDownStatus {
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

  /** 発動可能ランダム域ボーダー */
  public readonly border: number;

  /** 対空砲火可能艦数 */
  public readonly maxRange: number;

  constructor(ships: Ship[] | Enemy[], isEnemy: boolean, isUnion: boolean, antiAirCutIn: AntiAirCutIn, border: number) {
    const formation = Const.FORMATIONS[0];
    this.shootDownStatusList = ShootDownInfo.getStage2(ships, isEnemy, isUnion, formation, antiAirCutIn);
    this.maxRange = ships.length;
    this.border = border;
  }

  /**
   * stage2撃墜数テーブルを返却
   * @static
   * @param {(Ship[] | Enemy[])} ships 艦船
   * @param {boolean} isEnemy 敵側式フラグ
   * @param {boolean} isUnion 連合フラグ
   * @param {Formation} [formation] 陣形 未指定で単縦
   * @param {AntiAirCutIn} [cutIn] 対空CI 未指定で不発
   * @param {AvoidType} [avoid] 任意回避補正 未指定でなし
   * @return {*}  {ShootDownStatus[]}
   * @memberof ShootDownInfo
   */
  public static getStage2(ships: Ship[] | Enemy[], isEnemy: boolean, isUnion: boolean, formation: Formation, cutIn = new AntiAirCutIn(), avoid?: AvoidType): ShootDownStatus[] {
    const stage2: ShootDownStatus[] = [];
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
    const aj1 = formation.correction;

    // 艦隊防空ボーナス合計
    let sumAntiAirBonus = 0;
    for (let i = 0; i < shipCount; i += 1) {
      sumAntiAirBonus += ships[i].antiAirBonus;
    }
    sumAntiAirBonus = Math.floor(sumAntiAirBonus);
    // 艦隊防空 => int((陣形補正 * 各艦の艦隊対空ボーナス合計) / ブラウザ版補正(味方:1.3 敵1.0))
    const fleetAntiAir = Math.floor((sumAntiAirBonus * aj1) / (isEnemy ? 1 : 1.3));
    // 対空CI変動ボーナス
    const cutInBonus1 = cutIn.rateCorr;
    // 対空CI固定ボーナスA 敵側かつ不発なら0
    const cutInBonusA = isEnemy && cutIn.id === 0 ? 0 : cutIn.fixCorrA;
    // 対空CI固定ボーナスB
    const cutInBonusB = cutIn.fixCorrB;

    for (let i = 0; i < shipCount; i += 1) {
      const ship = ships[i];
      let sumAntiAirWeight = 0;
      let sumItemAntiAir = 0;

      // この艦娘の装備各値の合計
      for (let j = 0; j < ship.items.length; j += 1) {
        // 装備加重対空値の加算
        sumAntiAirWeight += ship.items[j].antiAirWeight;
        // 装備対空値の加算
        sumItemAntiAir += ship.items[j].data.antiAir;
      }
      // 補強増設の分を加算
      sumAntiAirWeight += ship.exItem.antiAirWeight;
      sumItemAntiAir += ship.exItem.data.antiAir;

      // 連合艦隊補正
      let unionFactor = 1.0;
      if (isUnion && ship.isEscort) {
        unionFactor = 0.48;
      } else if (isUnion && !ship.isEscort) {
        unionFactor = 0.8;
      }

      // 敵味方航空戦補正(味方:0.8, 敵:0.75)
      const aerialCorr = isEnemy ? 0.75 : 0.8;

      // 各回避補正毎にテーブルを作成
      for (let j = 0; j < Const.AVOID_TYPE.length; j += 1) {
        // 対空射撃回避補正取得
        const avoidObj = Const.AVOID_TYPE[j];
        let avoid1 = avoidObj.c1;
        let avoid2 = avoidObj.c2;
        let avoid3 = avoidObj.c3;
        let avoid4 = avoidObj.c4;

        if (j === Const.AVOID_TYPE.length - 1 && avoid) {
          // 任意の射撃回避補正値を置き換え
          avoid1 = avoid.c1;
          avoid2 = avoid.c2;
          avoid3 = avoid.c3;
          avoid4 = avoid.c4;
        }

        // 艦船加重対空値
        let antiAirWeight = 0;
        if (isEnemy) {
          // 艦船加重対空値(敵側式) => int((int(sqrt(素対空 + 装備対空)) + Σ(装備対空値 * 装備倍率)) * 対空射撃回避補正)
          antiAirWeight = Math.floor((Math.floor(Math.sqrt(ship.antiAir + sumItemAntiAir)) + sumAntiAirWeight) * avoid1);
        } else {
          // 艦船加重対空値(味方側式) => int((素対空 / 2 + Σ(装備対空値 * 装備倍率)) * 対空射撃回避補正)
          antiAirWeight = Math.floor((ship.antiAir / 2 + sumAntiAirWeight) * avoid1);
        }

        // 艦隊防空補正 => int(艦隊防空 * 対空射撃回避補正(艦隊防空ボーナス))
        const fleetAA = Math.floor(fleetAntiAir * avoid2);

        // 割合撃墜 => int(0.02 * 0.25 * 機数[あとで] * 艦船加重対空値 * 連合補正)
        stage2[j].rateDownList.push(0.02 * 0.25 * antiAirWeight * unionFactor);
        // 固定撃墜 => int((加重対空値 + 艦隊防空補正) * 基本定数(0.25) * 敵味方航空戦補正 * 連合補正 * 対空CI変動ボーナス)
        stage2[j].fixDownList.push(Math.floor((antiAirWeight + fleetAA) * 0.25 * aerialCorr * unionFactor * cutInBonus1));

        // 最低保証 => 対空CI固定ボーナスA * 対空射撃補正A + 対空CI固定ボーナスB * 対空射撃補正B
        const minimum = Math.floor(cutInBonusA * avoid3 + cutInBonusB * avoid4);
        // 最低保証
        stage2[j].minimumDownList.push(minimum);
      }
    }

    return stage2;
  }
}
