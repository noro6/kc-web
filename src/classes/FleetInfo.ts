import Fleet from './Fleet';

export default class FleetInfo {
  /** 艦隊一覧 第4艦隊まで */
  public fleets: Fleet[];

  /** 連合艦隊？ */
  public readonly isUnion: boolean;

  /** 司令部レベル */
  public readonly admiralLevel: number;

  constructor() {
    this.isUnion = false;
    this.admiralLevel = 120;

    /** 第4艦隊まで作成 */
    this.fleets = [];
    for (let i = 0; i < 4; i += 1) {
      this.fleets.push(new Fleet());
    }
  }
}
