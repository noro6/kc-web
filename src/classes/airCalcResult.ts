import Const from './const';

export default class AirCalcResult {
  /** 制空状態（複数ある場合は一番確率が高いやつ） */
  public airState: { text: string; value: number; color: string; } = Const.AIR_STATUS[Const.AIR_STATUS.length - 1];

  /** 制空状態テキスト */
  public airStateText = '';

  /** 制空ゲージバーの長さ */
  public airStateBarWidth = 0;

  /** 各制空状態の割合 */
  public rates = [0, 0, 0, 0, 0, 0];

  /** 各制空状態の割合 */
  public supportRates = [0, 0, 0, 0, 0, 0];

  /** 計算処理ループ中の表示戦闘での制空値記録用 */
  public loopSumAirPower = 0;

  /** 計算処理ループ中の表示戦闘での敵制空値記録用 */
  public loopSumEnemyAirPower = 0;

  /** 計算処理ループ中の表示戦闘での敵制空値記録用 */
  public loopSumEnemySupportAirPower = 0;

  /** 計算処理ループ中の表示戦闘での制空値記録用 */
  public avgAirPower = 0;

  /** 計算処理ループ中の表示戦闘での敵制空値記録用 */
  public avgEnemyAirPower = 0;

  /** 撃ち落とされた艦載機合計 ボーキ算出に必要 */
  public avgDownSlot = 0;

  /** 使われた鋼材合計 */
  public avgUsedSteels = 0;

  /**
   * 計算結果をいい感じに整形
   * @param {number} maxCount
   * @memberof AirCalcResult
   */
  public static formatResult(result: AirCalcResult, maxCount: number): void {
    // 最も高い制空状態を格納
    const state = result.rates.indexOf(Math.max(...result.rates));
    const airState = Const.AIR_STATUS.find((v) => v.value === state);
    result.airState = airState || Const.AIR_STATUS[Const.AIR_STATUS.length - 1];

    // 平均値にする
    result.avgAirPower = Math.round(result.loopSumAirPower / maxCount);
    result.avgEnemyAirPower = Math.round(result.loopSumEnemyAirPower / maxCount);
    const [b0, b1, b2, b3] = AirCalcResult.getBorders(result.avgEnemyAirPower);

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
   * 指定した制空状態の結果を1増加させる -支援艦隊
   * @param {number} state
   * @memberof AirCalcResult
   */
  public addSupportRates(state: number): void {
    this.supportRates[state] += 1;
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
