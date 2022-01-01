import { AIR_STATE } from './const';

export default class AirCalcResult {
  /** 制空状態（複数ある場合は一番確率が高いやつ） */
  public airState: number = AIR_STATE.NONE;

  /** 制空ゲージバーの長さ */
  public airStateBarWidth = 0;

  /** 各制空状態の割合 */
  public rates: number[] = [0, 0, 0, 0, 0, 0];

  /** 計算処理ループ中の表示戦闘での制空値記録用 */
  public loopSumAirPower = 0;

  /** 計算処理ループ中の表示戦闘での敵制空値記録用 */
  public loopSumEnemyAirPower = 0;

  /** 計算処理ループ中の表示戦闘での制空値記録用 */
  public avgAirPower = 0;

  /** 計算処理ループ中の表示戦闘での敵制空値記録用 */
  public avgEnemyAirPower = 0;

  /**
   * 計算結果をいい感じに整形
   * @param {number} maxCount
   * @memberof AirCalcResult
   */
  public static formatResult(result: AirCalcResult, maxCount: number): void {
    // 最も高い制空状態を格納
    result.airState = result.rates.indexOf(Math.max(...result.rates));

    // 平均値にする
    result.avgAirPower = result.loopSumAirPower / maxCount;
    result.avgEnemyAirPower = result.loopSumEnemyAirPower / maxCount;
    const [b0, b1, b2, b3] = AirCalcResult.getBorders(Math.floor(result.avgEnemyAirPower));

    if (b0 <= 0) {
      // 敵制空値がない場合は確保固定
      result.airStateBarWidth = 100;
    } else if (result.avgAirPower >= b0) {
      result.airStateBarWidth = (result.avgAirPower / b0) * 100 * 0.9;
    } else if (result.avgAirPower >= b1) {
      result.airStateBarWidth = (result.avgAirPower / b0) * 100 * 0.9;
    } else if (result.avgAirPower >= b2) {
      result.airStateBarWidth = (result.avgAirPower / b1) * 100 * 0.45;
    } else if (result.avgAirPower >= b3) {
      result.airStateBarWidth = (result.avgAirPower / b2) * 100 * 0.2;
    } else {
      result.airStateBarWidth = (result.avgAirPower / b3) * 100 * 0.1;
    }

    // 念のため
    result.airStateBarWidth = Math.min(result.airStateBarWidth, 100);
    // レートを百分率表記に変換
    result.rates = result.rates.map((v) => (100 * v) / maxCount);
  }

  /**
   * 指定した制空状態の結果を1増加させる
   * @param {number} state
   * @memberof AirCalcResult
   */
  public addRates(state: number): void {
    this.rates[state] += 1;
  }

  /**
   * 引数の制空値から各制空状態のボーダー制空値を返却
   * @static
   * @param {number} airPower
   * @returns {number[]}
   * @memberof Calculator
   */
  private static getBorders(airPower: number): number[] {
    return [
      airPower * 3,
      Math.ceil(airPower * 1.5),
      Math.floor(airPower / 1.5) + 1,
      Math.floor(airPower / 3) + 1,
      0,
    ];
  }
}
