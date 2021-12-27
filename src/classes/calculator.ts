import { AIR_STATE, CELL_TYPE } from './const';
import EnemyFleet, { Stage2Table } from './enemy/enemyFleet';
import Landbase from './landbase/landbase';
import Fleet from './fleet/fleet';
import Item from './item/item';

export default class Calculator {
  /**
   * 基地航空隊フェーズ計算処理
   * @static
   * @param {Landbase[]} landbases
   * @param {EnemyFleet} enemyFleet
   * @param {number} battle
   * @memberof Calculator
   */
  public static calculateLandbasePhase(landbases: Landbase[], enemyFleet: EnemyFleet, battle: number): void {
    const stage2List = enemyFleet.stage2;
    for (let i = 0; i < landbases.length; i += 1) {
      const landbase = landbases[i];
      const wave1 = landbase.battleTarget[0];
      const wave2 = landbase.battleTarget[1];
      const isSeparate = wave1 !== wave2;

      // 第1波 第2波どちらも担当しないならこの航空隊の計算は飛ばす
      if (wave1 !== battle && wave2 !== battle) {
        continue;
      }

      /** ======= 基地噴式強襲 ======= */
      if (landbase.hasJet) {
        Calculator.ShootDownLandbaseJet(landbase, stage2List);
      }

      /** ======= 基地航空隊 第1波 ======= */
      if (wave1 === battle) {
        const state = Calculator.getAirState(landbase.airPower, enemyFleet.landbaseAirPower);
        // 結果の格納
        landbase.resultWave1.rates[state] += 1;

        // 敵機撃墜処理
        Calculator.shootDownEnemy(state, enemyFleet);
        // 基地撃墜処理
        Calculator.ShootDownLandbase(state, landbase, stage2List);
      }

      /** ======= 基地航空隊 第2波 ======= */
      if (wave2 === battle) {
        if (isSeparate) {
          // 基地噴式強襲をもう一度
          Calculator.ShootDownLandbaseJet(landbase, stage2List);
        }

        const state = Calculator.getAirState(landbase.airPower, enemyFleet.landbaseAirPower);
        // 結果の格納
        landbase.resultWave2.rates[state] += 1;

        // 敵機撃墜処理
        Calculator.shootDownEnemy(state, enemyFleet);
        // 基地撃墜処理
        Calculator.ShootDownLandbase(state, landbase, stage2List);
      }
    }
  }

  /**
   * 本隊航空戦フェーズ計算処理
   * @static
   * @param {Fleet} fleet
   * @param {EnemyFleet} enemyFleet
   * @param {boolean} [skipStage2=true] 敵側撃墜計算を行う場合はfalseを指定して
   * @memberof Calculator
   */
  public static calculateMainPhase(fleet: Fleet, enemyFleet: EnemyFleet, calcStage2 = false): void {
    const stage2List = enemyFleet.stage2;
    // todo 連合のとき
    const state = Calculator.getAirState(fleet.airPower, enemyFleet.airPower);
    fleet.result.addRates(state);

    // 結果表示戦闘かどうか
    if (calcStage2) {
      // 平均値を取る
      fleet.result.loopSumAirPower += fleet.airPower;
      fleet.result.loopSumEnemyAirPower += enemyFleet.airPower;

      // 敵機撃墜処理
      Calculator.shootDownEnemy(state, enemyFleet, fleet.stage2);
    }
    // 味方撃墜処理
    Calculator.shootDownFleet(state, fleet, stage2List);
  }

  /**
   * 基地噴式強襲フェーズ計算 副作用は次の値の変更
   * Fleet: airPower
   * Item: airPower, slot
   * @static
   * @param {Landbase} landbase
   * @param {Stage2Table[]} stage2List
   * @memberof Calculator
   */
  public static shootDownFleetJet(fleet: Fleet, enemyFleet: EnemyFleet): void {
    if (fleet.hasJet
      && (enemyFleet.cellType === CELL_TYPE.NORMAL || enemyFleet.cellType === CELL_TYPE.GRAND)
      && !enemyFleet.isAllSubmarine) {
      // 通常 / 連合マス 潜水マスでないなら噴式機フェーズ発生
      const sumAirPower = Calculator.shootDownJetPhase(fleet.allPlanes, enemyFleet.stage2);
      // 基地噴式強襲フェーズ経過による制空値更新
      fleet.airPower = Math.floor(sumAirPower);
    }
  }

  /**
   * 引数の制空値から各制空状態のボーダー制空値を返却
   * @static
   * @param {number} airPower
   * @returns {number[]}
   * @memberof Calculator
   */
  public static getAirStatusBorder(airPower: number): number[] {
    return [
      airPower * 3,
      Math.ceil(airPower * 1.5),
      Math.floor(airPower / 1.5) + 1,
      Math.floor(airPower / 3) + 1,
      0,
    ];
  }

  /**
   * 基地噴式強襲フェーズ計算 副作用は次の値の変更
   * Landbase: airPower
   * Item: airPower, slot
   * @private
   * @static
   * @param {Landbase} landbase
   * @param {Stage2Table[]} stage2List
   * @memberof Calculator
   */
  private static ShootDownLandbaseJet(landbase: Landbase, stage2List: Stage2Table[]) {
    const sumAirPower = Calculator.shootDownJetPhase(landbase.items, stage2List);
    // 基地噴式強襲フェーズ経過による制空値更新
    landbase.airPower = Math.floor(sumAirPower * landbase.reconCorr);
  }

  /**
   * 基地航空隊通常フェーズ計算 副作用は次の値の変更
   * Landbase: airPower
   * Item: airPower, slot
   * @private
   * @static
   * @param {Landbase} landbase
   * @param {Stage2Table[]} stage2List
   * @memberof Calculator
   */
  private static ShootDownLandbase(state: number, landbase: Landbase, stage2List: Stage2Table[]) {
    let sumAirPower = 0;
    const randomRange = stage2List[0].fixDownList.length;
    const { items } = landbase;
    for (let j = 0; j < items.length; j += 1) {
      const item = items[j];
      // ====== STAGE1 ======
      item.slot -= Math.floor(0.6 * Calculator.getStage1ShootDownValue(state, item.slot));

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

    // 基地噴式強襲フェーズ経過による制空値更新
    landbase.airPower = Math.floor(sumAirPower * landbase.reconCorr);
  }

  /**
   * 噴式強襲フェーズ計算、終了時の結果の制空値を返却。副作用は次の値の変更
   * Item: airPower, slot
   * @private
   * @static
   * @param {Item[]} items
   * @param {Stage2Table[]} stage2List
   * @return {number} 噴式強襲フェーズ結果後の制空値
   * @memberof Calculator
   */
  private static shootDownJetPhase(items: Item[], stage2List: Stage2Table[]): number {
    let sumAirPower = 0;
    const randomRange = stage2List[0].fixDownList.length;
    for (let j = 0; j < items.length; j += 1) {
      const item = items[j];
      if (!item.isJet) {
        sumAirPower += item.airPower;
        continue;
      }
      // ====== STAGE1 ======
      // ジェット補正で0.6倍 切り捨て 確保固定
      item.slot -= Math.floor(0.6 * Calculator.getStage1ShootDownValue(AIR_STATE.KAKUHO, item.slot));

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
    return sumAirPower;
  }

  /**
   * 航空戦 味方側撃墜処理 副作用は次の値の変更
   * Fleet: airPower
   * Item: airPower, slot
   * @private
   * @static
   * @param {number} state
   * @param {Fleet} fleet
   * @param {Stage2Table[]} [stage2List]
   * @memberof Calculator
   */
  private static shootDownFleet(state: number, fleet: Fleet, stage2List?: Stage2Table[]) {
    const items = fleet.allPlanes;
    const randomRange = stage2List ? stage2List[0].fixDownList.length : 0;
    let sumAirPower = 0;
    for (let j = 0; j < items.length; j += 1) {
      const item = items[j];
      if (item.isRecon) {
        // 偵察機は制空争いを行わないのでスキップ
        continue;
      }

      // ====== STAGE1 ======
      item.slot -= Math.floor(this.getStage1ShootDownValue(state, item.slot));

      // ====== STAGE2 ======
      if (stage2List && item.isAttacker) {
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
      }

      // 制空値を更新
      Item.updateAirPower(item);
      sumAirPower += item.airPower;
    }

    fleet.airPower = sumAirPower;
  }

  /**
   * 航空戦 敵側撃墜処理 副作用は次の値の変更
   * EnemyFleet: airPower, landbaseAirPower
   * Item: airPower, slot
   * @private
   * @static
   * @param {number} state
   * @param {EnemyFleet} fleet
   * @memberof Calculator
   */
  private static shootDownEnemy(state: number, fleet: EnemyFleet, stage2List?: Stage2Table[]) {
    const items = fleet.allPlanes;
    const randomRange = stage2List ? stage2List[0].fixDownList.length : 0;
    let sumAirPower = 0;
    let sumLandbaseAirPower = 0;
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      // ====== STAGE1 ======
      item.slot -= this.getStage1ShootDownValueEnemy(state, item.slot);

      // ====== STAGE2 ======
      if (stage2List && item.isAttacker) {
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
      }

      // 制空値を更新
      Item.updateAirPower(item);
      if (!item.isRecon) {
        sumAirPower += item.airPower;
      }
      sumLandbaseAirPower += item.airPower;
    }

    fleet.airPower = sumAirPower;
    fleet.landbaseAirPower = sumLandbaseAirPower;
  }

  /**
   * 航空戦 stage1 撃墜数を取得 取得後、整数で丸めること
   * @private
   * @static
   * @param {number} state 制空状態 0 | 1 | 2 | 3 | 4
   * @param {number} slot 撃墜前搭載数
   * @return {number} 撃墜数
   * @memberof Calculator
   */
  private static getStage1ShootDownValue(state: number, slot: number): number {
    // 制空定数c = 確保から順に 1, 3, 5, 7, 10
    const c = [1, 3, 5, 7, 10][state];
    // A = 0 ~ (制空定数c / 3)の乱数
    const a = Math.floor(Math.random() * (((c / 3) * 1000) + 1)) / 1000;
    // slot * (A + 制空定数c / 4) / 10
    return (slot * (a + c / 4)) / 10;
  }

  /**
   * 航空戦 stage1 撃墜数を取得 敵側式
   * @private
   * @static
   * @param {number} state
   * @param {number} slot
   * @return {*}  {number}
   * @memberof Calculator
   */
  private static getStage1ShootDownValueEnemy(state: number, slot: number): number {
    // 制空定数c = 確保から順に 10, 8, 6, 4, 1
    const c = [10, 8, 6, 4, 1][state];
    // 0 ~ 制空定数c の一様な整数乱数
    const x = Math.floor(Math.random() * (c + 1));
    const y = Math.floor(Math.random() * (c + 1));
    return Math.floor((slot * (0.65 * x + 0.35 * y)) / 10);
  }

  /**
   * 彼我の制空値より、制空状態を返却
   * @private
   * @static
   * @param {number} airPower 自軍制空値
   * @param {number} enemyAirPower 相手制空値
   * @return {*}  {number}
   * @memberof Calculator
   */
  private static getAirState(airPower: number, enemyAirPower: number): number {
    const borders = Calculator.getAirStatusBorder(enemyAirPower);
    for (let i = 0; i < borders.length; i += 1) {
      if (airPower >= borders[i]) {
        return airPower > 0 ? i : AIR_STATE.SOSHITSU;
      }
    }
    return AIR_STATE.SOSHITSU;
  }
}
