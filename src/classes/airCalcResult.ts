import { AIR_STATE } from './const';

export default class AirCalcResult {
  /** 計算が完了した状態か */
  public isCalculated = false;

  /** 制空状態（複数ある場合は一番確率が高いやつ） */
  public airState: number = AIR_STATE.NONE;

  /** 制空ゲージバーの長さ */
  public airStateBarWidth = 0;

  /** 各制空状態の割合 */
  public rates: number[] = [0, 0, 0, 0, 0, 0];

  /** 計算処理ループ中の表示戦闘での平均 */
  public loopSumAirPower = 0;

  /** 計算処理ループ中の表示戦闘での平均 */
  public loopSumEnemyAirPower = 0;

  /**
   * 指定した制空状態の結果を1増加させる
   * @param {number} state
   * @memberof AirCalcResult
   */
  public addRates(state: number): void {
    this.rates[state] += 1;
  }

  /**
   * 制空状態ゲージ自動計算
   * @param {number} fleetAirPower
   * @param {number[]} borders
   * @memberof AirCalcResult
   */
  public setAirStateBarWidth(fleetAirPower: number, borders: number[]): void {
    const [b0, b1, b2, b3] = borders;
    if (b0 <= 0) {
      // 敵制空値がない場合は確保固定
      this.airStateBarWidth = 100;
    } else if (fleetAirPower >= b0) {
      this.airStateBarWidth = (fleetAirPower / b0) * 100 * 0.9;
    } else if (fleetAirPower >= b1) {
      this.airStateBarWidth = (fleetAirPower / b0) * 100 * 0.9;
    } else if (fleetAirPower >= b2) {
      this.airStateBarWidth = (fleetAirPower / b1) * 100 * 0.45;
    } else if (fleetAirPower >= b3) {
      this.airStateBarWidth = (fleetAirPower / b2) * 100 * 0.2;
    } else {
      this.airStateBarWidth = (fleetAirPower / b3) * 100 * 0.1;
    }
  }
}
