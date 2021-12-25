import Fleet from './Fleet';

export interface FleetInfoBuilder {
  // eslint-disable-next-line no-use-before-define
  info?: FleetInfo | undefined;
  /** 艦隊一覧 */
  fleets?: Fleet[];
  /** 連合フラグ */
  isUnion?: boolean;
  /** 司令部レベル */
  admiralLevel?: number;
}

export default class FleetInfo {
  /** 艦隊一覧 */
  public fleets: Fleet[];

  /** 連合艦隊？ */
  public readonly isUnion: boolean;

  /** 司令部レベル */
  public readonly admiralLevel: number;

  constructor(builder: FleetInfoBuilder = {}) {
    console.log('FleetInfo initialize');
    if (builder.info) {
      this.isUnion = builder.isUnion !== undefined ? builder.isUnion : builder.info.isUnion;
      this.admiralLevel = builder.admiralLevel !== undefined ? builder.admiralLevel : builder.info.admiralLevel;

      this.fleets = builder.fleets !== undefined ? builder.fleets : builder.info.fleets.concat();
    } else {
      this.isUnion = builder.isUnion !== undefined ? builder.isUnion : false;
      this.admiralLevel = builder.admiralLevel !== undefined ? builder.admiralLevel : 120;

      this.fleets = builder.fleets !== undefined ? builder.fleets : [];
    }

    const fleetCount = this.fleets.length;
    if (fleetCount < 5) {
      // 第5艦隊まで作成 第5艦隊は友軍として扱う
      for (let i = 0; i < 5 - fleetCount; i += 1) {
        this.fleets.push(new Fleet());
      }
    }
  }
}
