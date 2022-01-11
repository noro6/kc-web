import Fleet, { FleetBuilder } from './fleet';
import Ship from './ship';

export interface FleetInfoBuilder {
  // eslint-disable-next-line no-use-before-define
  info?: FleetInfo | undefined;
  /** 艦隊一覧 */
  fleets?: Fleet[];
  /** 連合フラグ */
  isUnion?: boolean;
  /** 司令部レベル */
  admiralLevel?: number;
  /** 計算を行う艦隊インデックス */
  mainFleetIndex?: number;
}

export default class FleetInfo {
  /** 艦隊一覧 */
  public readonly fleets: Fleet[];

  /** 連合艦隊？ */
  public readonly isUnion: boolean;

  /** 司令部レベル */
  public readonly admiralLevel: number;

  /** 計算を行う艦隊番号 */
  public readonly mainFleetIndex: number;

  /** 連合艦隊 自動生成 */
  public readonly unionFleet: Fleet | undefined;

  /** 計算済みフラグ */
  public calculated = false;

  /** 履歴に追加しなくてもいいフラグ */
  public ignoreHistory = false;

  constructor(builder: FleetInfoBuilder = {}) {
    if (builder.info) {
      this.isUnion = builder.isUnion !== undefined ? builder.isUnion : builder.info.isUnion;
      this.admiralLevel = builder.admiralLevel !== undefined ? builder.admiralLevel : builder.info.admiralLevel;
      this.mainFleetIndex = builder.mainFleetIndex !== undefined ? builder.mainFleetIndex : builder.info.mainFleetIndex;
      this.fleets = builder.fleets !== undefined ? builder.fleets : builder.info.fleets.concat();
    } else {
      this.isUnion = builder.isUnion !== undefined ? builder.isUnion : false;
      this.admiralLevel = builder.admiralLevel !== undefined ? builder.admiralLevel : 120;
      this.mainFleetIndex = builder.mainFleetIndex !== undefined ? builder.mainFleetIndex : 0;

      this.fleets = builder.fleets !== undefined ? builder.fleets : [];
    }

    const fleetCount = this.fleets.length;
    if (fleetCount < 5) {
      // 第5艦隊まで作成 第5艦隊は友軍として扱う
      for (let i = 0; i < 5 - fleetCount; i += 1) {
        this.fleets.push(new Fleet());
      }
    }

    if (this.isUnion && (this.mainFleetIndex === 0 || this.mainFleetIndex === 1)) {
      // 連合艦隊にチェックが入っている場合連合艦隊オブジェクトを生成

      const escorts = this.fleets[1].ships;
      // 第2艦隊全艦を随伴としてインスタンス化
      for (let i = 0; i < escorts.length; i += 1) {
        const ship = escorts[i];
        escorts[i] = new Ship({ ship, isEscort: true });
      }

      const b: FleetBuilder = {
        isUnion: true,
        ships: this.fleets[0].ships.concat(escorts),
      };
      this.unionFleet = new Fleet(b);

      // 艦隊別の制空値に初期化
      this.unionFleet.airPower = this.fleets[0].fullAirPower;
      this.unionFleet.escortAirPower = this.fleets[1].fullAirPower;
    }
  }

  /**
   * 計算対象の艦隊データを返却
   * @readonly
   * @type {Fleet}
   * @memberof FleetInfo
   */
  public get mainFleet(): Fleet {
    let mainFleet = this.fleets[this.mainFleetIndex];
    if (this.isUnion && this.mainFleetIndex <= 1) {
      mainFleet = this.unionFleet as Fleet;
    }
    return mainFleet;
  }
}
