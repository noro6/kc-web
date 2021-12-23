import Fleet from './Fleet';

export default class FleetInfo {
  /** 艦隊一覧 */
  public fleets: Fleet[];

  /** 連合艦隊？ */
  public readonly isUnion: boolean;

  /** 司令部レベル */
  public readonly admiralLevel: number;

  constructor() {
    this.isUnion = false;
    this.admiralLevel = 120;

    // 第5艦隊まで作成 第5艦隊は友軍として扱う
    this.fleets = [];
    for (let i = 0; i < 5; i += 1) {
      this.fleets.push(new Fleet());
    }
  }
}
