export default class AntiAirCutIn {
  /** カットイン種別id */
  public readonly id: number;

  /** 割合撃墜ボーナス */
  public readonly rateCorr: number;

  /** 固定撃墜ボーナス */
  public readonly fixCorr: number;

  /** 発動率 */
  public readonly rate: number;

  constructor(id: number, rateCorr: number, fixCorr: number, rate: number) {
    this.id = id;
    this.rateCorr = rateCorr;
    this.fixCorr = fixCorr;
    this.rate = rate;
  }
}
