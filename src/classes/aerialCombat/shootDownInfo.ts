import Const, { Formation, AvoidType } from '../const';
import { ShipBase } from '../interfaces/shipBase';
import AntiAirCutIn from './antiAirCutIn';
import getAvailableAntiAirCutIns from './antiAirCutInRules';

export interface ShootDownStatus {
  antiAirWeightList: number[];
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
  public maxRange: number;

  constructor(
    ships: ShipBase[],
    isEnemy: boolean,
    isUnion: boolean,
    antiAirCutIn: AntiAirCutIn,
    border: number,
    formation?: Formation,
    isAirRaid = false,
  ) {
    if (formation) {
      this.shootDownStatusList = ShootDownInfo.getStage2(ships, isEnemy, isUnion, formation, antiAirCutIn, isAirRaid);
    } else {
      this.shootDownStatusList = ShootDownInfo.getStage2(
        ships,
        isEnemy,
        isUnion,
        Const.FORMATIONS[0],
        antiAirCutIn,
        isAirRaid,
      );
    }
    this.maxRange = ships.length;
    this.border = border;
  }

  /**
   * stage2撃墜数テーブルを返却
   * @static
   * @param {(ShipBase[])} ships 艦船
   * @param {boolean} isEnemy 敵側式フラグ
   * @param {boolean} isUnion 連合フラグ
   * @param {Formation} [formation] 陣形 未指定で単縦
   * @param {AntiAirCutIn} [cutIn] 対空CI 未指定で不発
   * @param {boolean} [isAirRaid] 任意空襲 未指定でなし
   * @param {AvoidType} [avoid] 任意回避補正 未指定でなし
   * @return {*}  {ShootDownStatus[]}
   * @memberof ShootDownInfo
   */
  public static getStage2(
    ships: ShipBase[],
    isEnemy: boolean,
    isUnion: boolean,
    formation: Formation,
    cutIn: AntiAirCutIn,
    isAirRaid?: boolean,
    avoid?: AvoidType,
  ): ShootDownStatus[] {
    const stage2: ShootDownStatus[] = [];
    const shipCount = ships.length;
    if (shipCount === 0) {
      // 全てが0のデータ
      for (let i = 0; i < Const.AVOID_TYPE.length; i += 1) {
        stage2.push({
          antiAirWeightList: [0],
          fixDownList: [0],
          rateDownList: [0],
          minimumDownList: [0],
        });
      }
      return stage2;
    }
    for (let i = 0; i < Const.AVOID_TYPE.length; i += 1) {
      stage2.push({
        antiAirWeightList: [],
        fixDownList: [],
        rateDownList: [],
        minimumDownList: [],
      });
    }
    // 陣形補正
    const aj1 = formation.correction;

    // 艦隊防空ボーナス合計
    let sumAntiAirBonus = 0;
    for (let i = 0; i < shipCount; i += 1) {
      sumAntiAirBonus += ships[i].antiAirBonus;
    }
    sumAntiAirBonus = Math.floor(sumAntiAirBonus);
    // 艦隊防空 => 陣形補正 * 各艦の艦隊対空ボーナス合計
    const fleetAntiAir = sumAntiAirBonus * aj1;
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

      // 装備フィットボーナス(対空)
      const itemBonusAntiAir = ship.itemBonusStatus.antiAir ?? 0;

      // 連合艦隊補正
      let unionFactor = 1.0;
      if (isUnion && ship.isEscort) {
        unionFactor = 0.48;
      } else if (isUnion && !ship.isEscort) {
        unionFactor = 0.8;
        if (isAirRaid) {
          unionFactor = 0.72;
        }
      }

      // 敵味方航空戦補正(味方:0.8, 敵:0.75)
      const aerialCorr = isEnemy ? 0.75 : 0.8;

      // 各回避補正毎にテーブルを作成
      for (let j = 0; j < Const.AVOID_TYPE.length; j += 1) {
        // 対空射撃回避補正取得
        const avoidObj = Const.AVOID_TYPE[j];
        let avoid1 = avoidObj.c1;
        let avoid2 = avoidObj.c2;
        // 対空CI補正Aに掛かると思われる係数 加重対空補正と同等？
        // => 違いました。5 / 8 / 12種に対して、弱で0 中で1 強、超で3
        // 出典 https://x.com/Divinity_123/status/1721218795878879635
        let avoid3 = avoidObj.c3;
        // 対空CI補正Bに掛かると思われる係数
        // => 上の結果を踏まえ少なくとも 5 / 8 / 12種の結果は合うように調整
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
          antiAirWeight = Math.floor(
            (Math.floor(Math.sqrt(ship.antiAir + sumItemAntiAir)) + sumAntiAirWeight) * avoid1,
          );
        } else {
          // 艦船加重対空値(味方側式) => int(((素対空 / 2 + Σ(装備対空値 * 装備倍率)) + 装備対空ボーナス * 0.8) * 対空射撃回避補正)
          antiAirWeight = Math.floor(Math.floor(ship.antiAir / 2 + sumAntiAirWeight + itemBonusAntiAir * 0.8) * avoid1);
        }
        // 加重対空格納
        stage2[j].antiAirWeightList.push(antiAirWeight);

        // 艦隊防空補正 => int(艦隊防空 * 対空射撃回避補正(艦隊防空ボーナス))
        const fleetAA = Math.floor(fleetAntiAir * avoid2);
        // 最終艦隊防空 => int(int(艦隊防空) / ブラウザ版補正(味方:1.3 敵1.0))
        const fleetAABonus = Math.floor(fleetAA) / (isEnemy ? 1 : 1.3);

        // 割合撃墜 => int(0.02 * 0.25 * 機数[あとで] * 艦船加重対空値 * 連合補正)
        stage2[j].rateDownList.push(0.02 * 0.25 * antiAirWeight * unionFactor);
        // 固定撃墜 => int((加重対空値 + int(最終艦隊防空 + 対空青字ボーナス * 0.6)) * 基本定数(0.25) * 敵味方航空戦補正 * 連合補正 * 対空CI変動ボーナス)
        stage2[j].fixDownList.push(
          Math.floor(
            (antiAirWeight + Math.floor(fleetAABonus + itemBonusAntiAir * 0.6))
              * 0.25
              * aerialCorr
              * unionFactor
              * cutInBonus1,
          ),
        );

        // 最低保証 => int(対空CI固定ボーナスA * 対空射撃補正A + 対空CI固定ボーナスB * 対空射撃補正B)
        const minimum = Math.floor(cutInBonusA * avoid3 + cutInBonusB * avoid4);
        // 最低保証
        stage2[j].minimumDownList.push(minimum);
      }
    }

    return stage2;
  }

  /**
   * 発動可能な対空CIを返却
   * @static
   * @param {ShipBase} ship
   * @return {*}  {AntiAirCutIn[]}
   * @memberof ShootDownInfo
   */
  public static getAntiAirCutIn(ship: ShipBase): AntiAirCutIn[] {
    return getAvailableAntiAirCutIns(ship);
  }
}
