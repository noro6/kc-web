export default class AntiAirCutIn {
  /** カットイン種別id */
  public readonly id: number;

  /** 割合撃墜ボーナス */
  public readonly rateCorr: number;

  /** 固定撃墜ボーナスA */
  public readonly fixCorrA: number;

  /** 固定撃墜ボーナスB */
  public readonly fixCorrB: number;

  /** 発動率 */
  public readonly rate: number;

  constructor(id = 0, rateCorr = 1, fixCorrA = 1, fixCorrB = 0, rate = 1) {
    this.id = id;
    this.rateCorr = rateCorr;
    this.fixCorrA = fixCorrA;
    this.fixCorrB = fixCorrB;
    this.rate = rate;
  }
}
