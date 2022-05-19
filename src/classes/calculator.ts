import { AB_MODE, AIR_STATE } from './const';
import EnemyFleet from './enemy/enemyFleet';
import Airbase from './airbase/airbase';
import Fleet from './fleet/fleet';
import Item from './item/item';
import CommonCalc from './commonCalc';
import ShootDownInfo, { ShootDownStatus } from './aerialCombat/shootDownInfo';
import AirbaseInfo from './airbase/airbaseInfo';
import AirCalcResult from './airCalcResult';

type JetPhaseResult = {
  sumAirPower: number;
  usedSteel: number;
};

export default class Calculator {
  /**
   * 基地航空隊フェーズ計算処理
   * @static
   * @param {Airbase[]} airbases
   * @param {EnemyFleet} enemyFleet
   * @param {number} battle
   * @memberof Calculator
   */
  public static calculateAirbasePhase(airbases: Airbase[], enemyFleet: EnemyFleet, battle: number): void {
    for (let i = 0; i < airbases.length; i += 1) {
      const airbase = airbases[i];
      const wave1 = airbase.battleTarget[0];
      const wave2 = airbase.battleTarget[1];

      // 第1波 第2波どちらも担当しないならこの航空隊の計算は飛ばす
      if (wave1 !== battle && wave2 !== battle) {
        continue;
      }

      /** ======= 基地航空隊 第1波 ======= */
      if (wave1 === battle) {
        /** ======= 基地噴式強襲 ======= */
        if (airbase.hasJet) {
          Calculator.ShootDownAirbaseJet(airbase, enemyFleet.noCutInStage2);
        }

        const state = CommonCalc.getAirState(airbase.airPower, enemyFleet.airbaseAirPower);
        // 結果の格納
        airbase.resultWave1.rates[state] += 1;
        airbase.resultWave1.loopSumAirPower += airbase.airPower;
        airbase.resultWave1.loopSumEnemyAirPower += enemyFleet.airbaseAirPower;

        // 敵機撃墜処理
        Calculator.shootDownEnemy(state, enemyFleet, [], true);
        if (airbase.isSeparate) {
          // 基地撃墜処理
          Calculator.ShootDownAirbase(state, airbase, enemyFleet);
        }
      }

      /** ======= 基地航空隊 第2波 ======= */
      if (wave2 === battle) {
        /** ======= 基地噴式強襲 ======= */
        if (airbase.hasJet && airbase.isSeparate) {
          // 分散のときだけ
          Calculator.ShootDownAirbaseJet(airbase, enemyFleet.noCutInStage2);
        }

        const state = CommonCalc.getAirState(airbase.airPower, enemyFleet.airbaseAirPower);
        // 結果の格納
        airbase.resultWave2.rates[state] += 1;
        airbase.resultWave2.loopSumAirPower += airbase.airPower;
        airbase.resultWave2.loopSumEnemyAirPower += enemyFleet.airbaseAirPower;

        // 敵機撃墜処理
        Calculator.shootDownEnemy(state, enemyFleet, [], true);
        if (airbase.isSeparate || airbase.needShootDown) {
          // 基地撃墜処理
          Calculator.ShootDownAirbase(state, airbase, enemyFleet);
        }
      }
    }
  }

  /**
   * 本隊航空戦フェーズ計算処理
   * @static
   * @param {Fleet} fleet
   * @param {EnemyFleet} enemyFleet
   * @param {number} battle
   * @param {boolean} [calcStage2=true] 敵側撃墜計算を行う場合はtrueを指定して
   * @memberof Calculator
   */
  public static calculateMainPhase(fleet: Fleet, enemyFleet: EnemyFleet, battle: number, calcStage2 = false): void {
    const result = fleet.results[battle];
    const airPower = enemyFleet.isUnion ? (fleet.airPower + fleet.escortAirPower) : fleet.airPower;
    const state = CommonCalc.getAirState(airPower, enemyFleet.airPower, fleet.hasPlane || enemyFleet.hasPlane);

    // 戦闘開始時の結果記録
    result.addRates(state);
    result.loopSumAirPower += airPower;
    result.loopSumEnemyAirPower += enemyFleet.airPower;

    // 結果表示戦闘かどうか
    if (calcStage2) {
      // 敵機撃墜処理
      if (enemyFleet.isAirRaidCell) {
        Calculator.shootDownEnemy(state, enemyFleet, fleet.shootDownListAirRaid);
      } else {
        Calculator.shootDownEnemy(state, enemyFleet, fleet.shootDownList);
      }
    }
    // 味方撃墜処理
    Calculator.shootDownFleet(state, fleet, enemyFleet, battle);
  }

  /**
   * 本隊航空戦マス 2回目のフェーズ計算処理
   * つまるところ敵撃墜処理をせず結果も格納しない、味方側の撃墜だけやるやつ
   * @static
   * @param {Fleet} fleet
   * @param {EnemyFleet} enemyFleet
   * @memberof Calculator
   */
  public static calculateAerialConbatCellPhase(fleet: Fleet, enemyFleet: EnemyFleet): void {
    const state = CommonCalc.getAirState(fleet.airPower, enemyFleet.airPower, fleet.hasPlane);
    // 味方撃墜処理
    Calculator.shootDownFleet(state, fleet, enemyFleet);
  }

  /**
   * 支援艦隊 -航空支援制空判定
   * @static
   * @param {Fleet} fleet
   * @param {EnemyFleet} enemyFleet
   * @memberof Calculator
   */
  public static calculateAerialSupportPhase(fleets: Fleet[], enemyFleet: EnemyFleet, battle: number): void {
    for (let i = 0; i < fleets.length; i += 1) {
      const fleet = fleets[i];
      if (fleet.hasPlane) {
        const state = CommonCalc.getAirState(fleet.supportAirPower, enemyFleet.airPower);
        const result = fleet.results[battle];
        result.addSupportRates(state);
        result.loopSumEnemySupportAirPower += enemyFleet.airPower;
      }
    }
  }

  /**
   * 噴式強襲フェーズ計算 副作用は次の値の変更
   * Fleet: airPower
   * Item: airPower, slot
   * @static
   * @param {Airbase} airbase
   * @param {ShootDownStatus[]} stage2List
   * @returns {number} 使った鋼材の数
   * @memberof Calculator
   */
  public static shootDownFleetJet(fleet: Fleet, enemyFleet: EnemyFleet): number {
    if (fleet.hasJet && enemyFleet.isSurfaceCell && !enemyFleet.isAllSubmarine) {
      // 通常 / 連合マス 潜水マスでないなら噴式機フェーズ発生 対空CI無しテーブルで実行
      const jetPhaseResult = Calculator.shootDownJetPhase(fleet.allPlanes, enemyFleet.noCutInStage2);
      // 噴式強襲フェーズ経過による制空値更新
      fleet.airPower = Math.floor(jetPhaseResult.sumAirPower);

      return jetPhaseResult.usedSteel;
    }

    return 0;
  }

  /**
   * 基地噴式強襲フェーズ計算 副作用は次の値の変更
   * Airbase: airPower
   * Item: airPower, slot
   * @private
   * @static
   * @param {Airbase} airbase
   * @param {ShootDownStatus[]} stage2List
   * @memberof Calculator
   */
  private static ShootDownAirbaseJet(airbase: Airbase, stage2List: ShootDownStatus[]) {
    const jetPhaseResult = Calculator.shootDownJetPhase(airbase.items, stage2List);
    // 基地噴式強襲フェーズ経過による制空値更新
    airbase.airPower = Math.floor(jetPhaseResult.sumAirPower * airbase.reconCorr);
    airbase.needSupply = true;
  }

  /**
   * 基地航空隊通常フェーズ計算 副作用は次の値の変更
   * Airbase: airPower
   * Item: airPower, slot
   * @private
   * @static
   * @param {Airbase} airbase
   * @param {ShootDownInfo[]} shootDownList
   * @memberof Calculator
   */
  private static ShootDownAirbase(state: number, airbase: Airbase, enemyFleet: EnemyFleet) {
    let sumAirPower = 0;
    const st2List = enemyFleet.noCutInStage2;
    const randomRange = st2List[0].fixDownList.length;
    const { items } = airbase;
    for (let j = 0; j < items.length; j += 1) {
      const item = items[j];
      // ====== STAGE1 ======
      // ジェットなら0.6倍 切り捨て
      item.slot -= Math.floor(CommonCalc.getStage1ShootDownValue(state, item.slot) * (item.data.isJet ? 0.6 : 1));

      // ====== STAGE2 ======
      if (item.data.isAttacker) {
        // 撃墜担当を選出
        const index = Math.floor(Math.random() * randomRange);
        if (Math.random() >= 0.5) {
          // 割合撃墜 50%で成功
          item.slot -= Math.floor(st2List[item.data.avoidId].rateDownList[index] * item.slot);
        }
        if (Math.random() >= 0.5) {
          // 固定撃墜 50%で成功
          item.slot -= st2List[item.data.avoidId].fixDownList[index];
        }
        // 最低保証
        item.slot -= st2List[item.data.avoidId].minimumDownList[index];
      }

      // 制空値を更新
      Item.updateAirPower(item);
      sumAirPower += item.airPower;
    }

    // 制空値更新
    airbase.airPower = Math.floor(sumAirPower * airbase.reconCorr);
    airbase.needSupply = true;
  }

  /**
   * 噴式強襲フェーズ計算、終了時の結果の制空値を返却。副作用は次の値の変更
   * Item: airPower, slot
   * @private
   * @static
   * @param {Item[]} items
   * @param {ShootDownStatus[]} stage2List
   * @return {JetPhaseResult} 噴式強襲フェーズ結果
   * @memberof Calculator
   */
  private static shootDownJetPhase(items: Item[], stage2List: ShootDownStatus[]): JetPhaseResult {
    let sumAirPower = 0;
    let usedSteel = 0;
    const randomRange = stage2List[0].fixDownList.length;
    for (let j = 0; j < items.length; j += 1) {
      const item = items[j];
      if (!item.data.isJet || item.isEscortItem) {
        if (!item.data.isRecon) {
          sumAirPower += item.airPower;
        }
        continue;
      }
      // 鋼材のお支払い
      usedSteel += Math.round(item.slot * item.data.cost * 0.2);

      // ====== STAGE1 ======
      // ジェット補正で0.6倍 切り捨て 確保固定
      item.slot -= Math.floor(0.6 * CommonCalc.getStage1ShootDownValue(AIR_STATE.KAKUHO, item.slot));

      // ====== STAGE2 ======
      // 撃墜担当を選出
      const index = Math.floor(Math.random() * randomRange);
      if (Math.random() >= 0.5) {
        // 割合撃墜 50%で成功
        item.slot -= Math.floor(stage2List[item.data.avoidId].rateDownList[index] * item.slot);
      }
      if (Math.random() >= 0.5) {
        // 固定撃墜 50%で成功
        item.slot -= stage2List[item.data.avoidId].fixDownList[index];
      }

      // 制空値を更新
      Item.updateAirPower(item);
      sumAirPower += item.airPower;
    }

    // 渡されたItem[]の制空値の合計 撃墜が発生している場合は下がっている
    return { sumAirPower, usedSteel };
  }

  /**
   * 航空戦 味方側撃墜処理 副作用は次の値の変更
   * Fleet: airPower
   * Item: airPower, slot
   * @private
   * @static
   * @param {number} state
   * @param {Fleet} fleet
   * @param {ShootDownStatus[]} shootDownList
   * @param {boolean} [cellType] 戦闘形式 省略で通常マス
   * @param {*} [battle=-1] 戦闘番号(？戦目) 専ら搭載数記録用の引数 省略で搭載数を記録しない
   * @memberof Calculator
   */
  private static shootDownFleet(state: number, fleet: Fleet, enemyFleet: EnemyFleet, battle = -1) {
    const items = fleet.allPlanes;
    const itemLength = items.length;
    let st2List = enemyFleet.noCutInStage2;
    let randomRange = st2List[0].fixDownList.length;

    if (enemyFleet.shootDownList.length > 1) {
      // 対空CIの発動判定
      const pickRate = Math.random();
      const shootDown = enemyFleet.shootDownList.find((v) => v.border > pickRate);
      if (shootDown) {
        st2List = shootDown.shootDownStatusList;
        randomRange = shootDown.maxRange;
      }
    }

    let sumAirPower = 0;
    let sumEscortAirPower = 0;
    for (let j = 0; j < itemLength; j += 1) {
      const item = items[j];
      if (battle >= 0) {
        // 開始時搭載数を記録
        item.slotHistories[battle] += item.slot;
      }

      if (enemyFleet.isSkipAerialCombatCell || item.data.isRecon || (item.isEscortItem && !enemyFleet.isUnion)) {
        // 夜戦マス、または偵察機、または非連合マスでの随伴機体は制空争いを行わないのでスキップ 制空値だけは加算
        if (!item.data.isRecon) {
          if (item.isEscortItem) {
            sumEscortAirPower += item.airPower;
          } else {
            sumAirPower += item.airPower;
          }
        }
        continue;
      }

      // ====== STAGE1 ======
      // ジェットなら0.6倍 切り捨て
      item.slot -= Math.floor(CommonCalc.getStage1ShootDownValue(state, item.slot) * (item.data.isJet ? 0.6 : 1));

      // ====== STAGE2 ======
      if (!enemyFleet.isAirRaidCell && st2List.length && item.data.isAttacker) {
        // 撃墜担当を選出
        const index = Math.floor(Math.random() * randomRange);
        const shootDownStatus = st2List[item.data.avoidId];
        if (Math.random() >= 0.5) {
          // 割合撃墜 50%で成功
          item.slot -= Math.floor(shootDownStatus.rateDownList[index] * item.slot);
        }
        if (Math.random() >= 0.5) {
          // 固定撃墜 50%で成功
          item.slot -= shootDownStatus.fixDownList[index];
        }
        // 最低保証
        item.slot -= shootDownStatus.minimumDownList[index];
      }

      // 制空値を更新
      Item.updateAirPower(item);
      if (item.isEscortItem) {
        sumEscortAirPower += item.airPower;
      } else {
        sumAirPower += item.airPower;
      }
    }

    fleet.airPower = sumAirPower;
    fleet.escortAirPower = sumEscortAirPower;
  }

  /**
   * 航空戦 敵側撃墜処理 副作用は次の値の変更
   * EnemyFleet: airPower, airbaseAirPower
   * Item: airPower, slot
   * @private
   * @static
   * @param {number} state
   * @param {EnemyFleet} fleet
   * @memberof Calculator
   */
  private static shootDownEnemy(state: number, fleet: EnemyFleet, shootDownList: ShootDownInfo[], isAirbase = false) {
    const items = fleet.allPlanes;
    const itemLength = items.length;
    let st2List: ShootDownStatus[] = [];
    let randomRange = 0;

    if (shootDownList) {
      // 対空CIの発動判定
      const pickRate = Math.random();
      const shootDown = shootDownList.find((v) => v.border > pickRate);
      if (shootDown) {
        st2List = shootDown.shootDownStatusList;
        randomRange = shootDown.maxRange;
      }
    }

    let sumAirPower = 0;
    let sumAirbaseAirPower = 0;

    for (let i = 0; i < itemLength; i += 1) {
      const item = items[i];
      // 基地は全て。通常航空戦は攻撃機かつ陸攻でない
      if (isAirbase || (!isAirbase && !item.data.isABAttacker && !item.data.isRecon)) {
        // ====== STAGE1 ======
        item.slot -= CommonCalc.getStage1ShootDownValueEnemy(state, item.slot);

        // ====== STAGE2 ======
        if (randomRange && item.data.isAttacker) {
          // 撃墜担当を選出
          const index = Math.floor(Math.random() * randomRange);
          const shootDwonStatus = st2List[item.data.avoidId];
          if (Math.random() >= 0.5) {
            // 割合撃墜 50%で成功
            item.slot -= Math.floor(shootDwonStatus.rateDownList[index] * item.slot);
          }
          if (Math.random() >= 0.5) {
            // 固定撃墜 50%で成功
            item.slot -= shootDwonStatus.fixDownList[index];
          }
          // 最低保証
          item.slot -= shootDwonStatus.minimumDownList[index];
        }
      }

      // 制空値を更新
      Item.updateAirPower(item);
      if (!item.data.isRecon && !item.data.isABAttacker) {
        sumAirPower += item.airPower;
      }
      sumAirbaseAirPower += item.airPower;
    }

    fleet.airPower = sumAirPower;
    fleet.airbaseAirPower = sumAirbaseAirPower;
    fleet.needSupply = true;
  }

  /**
   * 超重爆防空1フェーズ分計算
   * @static
   * @param {AirbaseInfo} airbaseInfo
   * @param {EnemyFleet} enemyFleet
   * @param {AirCalcResult} result
   * @memberof Calculator
   */
  public static calculateSuperAirRaid(airbaseInfo: AirbaseInfo, enemyFleet: EnemyFleet, result: AirCalcResult): void {
    const state = CommonCalc.getAirState(airbaseInfo.superHighDefenseAirPower, enemyFleet.airbaseAirPower);
    // 結果の格納
    result.rates[state] += 1;
    result.loopSumAirPower += airbaseInfo.superHighDefenseAirPower;
    result.loopSumEnemyAirPower += enemyFleet.airbaseAirPower;

    // 敵機撃墜処理 => 2022/3現在撃墜なし
    // Calculator.shootDownEnemy(state, enemyFleet, [], true);

    // 基地撃墜処理
    Calculator.ShootDownAirbaseAirRaid(state, airbaseInfo);
  }

  /**
   * 基地航空隊 超重爆防空撃墜処理 副作用は次の値の変更
   * AirBaseInfo: superHighDefenseAirPower
   * AirBase: defenseAirPower, slot
   * Item: airPower, slot
   * @private
   * @static
   * @param {Airbase} airbase
   * @param {ShootDownInfo[]} shootDownList
   * @memberof Calculator
   */
  private static ShootDownAirbaseAirRaid(state: number, airbaseInfo: AirbaseInfo) {
    let sumAirPower = 0;
    for (let i = 0; i < airbaseInfo.airbases.length; i += 1) {
      const airbase = airbaseInfo.airbases[i];

      if (airbase.mode !== AB_MODE.DEFFENSE) {
        continue;
      }

      const { items } = airbase;
      let sumAirbaseAirPower = 0;
      for (let j = 0; j < items.length; j += 1) {
        const item = items[j];
        // ====== STAGE1 ======
        // ジェットなら0.6倍 切り捨て
        item.slot -= Math.floor(CommonCalc.getStage1ShootDownValue(state, item.slot) * (item.data.isJet ? 0.6 : 1));

        // 制空値を更新
        Item.updateDefenseAirPower(item);
        sumAirbaseAirPower += item.defenseAirPower;
      }

      // 制空値加算
      sumAirPower += Math.floor(sumAirbaseAirPower * airbase.reconCorrDeff);
    }

    // 制空値更新
    airbaseInfo.superHighDefenseAirPower = Math.floor(sumAirPower * airbaseInfo.superHighAirRaidCoefficient);
  }
}
