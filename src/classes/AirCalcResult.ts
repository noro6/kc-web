import { AIR_STATE } from './Const';

export default class AirCalcResult {
  /** 計算が完了した状態か */
  public isCalculated = false;

  /** 制空状態（複数ある場合は一番確率が高いやつ） */
  public airState: number = AIR_STATE.NONE;

  /** 制空ゲージバーの長さ */
  public airStateBarWidth = 0;

  /** 各制空状態の割合 */
  public rates: number[] = [0, 0, 0, 0, 0];
}
