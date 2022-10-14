import { FLEET_TYPE } from '../const';
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
  /** 艦隊形式 */
  fleetType?: number;
}

export default class FleetInfo {
  /** 艦隊一覧 */
  public readonly fleets: Fleet[];

  /** 連合艦隊？ */
  public readonly isUnion: boolean;

  /** 艦隊タイプ */
  public readonly fleetType: number;

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
      this.fleetType = builder.fleetType ?? builder.info.fleetType;
    } else {
      this.isUnion = builder.isUnion !== undefined ? builder.isUnion : false;
      this.admiralLevel = builder.admiralLevel !== undefined ? builder.admiralLevel : 120;
      this.mainFleetIndex = builder.mainFleetIndex !== undefined ? builder.mainFleetIndex : 0;
      this.fleets = builder.fleets !== undefined ? builder.fleets : [];
      this.fleetType = builder.fleetType ?? FLEET_TYPE.SINGLE;
    }

    const fleetCount = this.fleets.length;
    if (fleetCount < 5) {
      // 第5艦隊まで作成 第5艦隊は友軍として扱う
      for (let i = 0; i < 5 - fleetCount; i += 1) {
        this.fleets.push(new Fleet());
      }
    }

    // 艦隊形式がおかしそうなら矯正
    if (this.isUnion && !(this.fleetType === FLEET_TYPE.CTF || this.fleetType === FLEET_TYPE.STF || this.fleetType === FLEET_TYPE.TCF)) {
      this.fleetType = FLEET_TYPE.STF;
    } else if (!this.isUnion && this.fleetType !== FLEET_TYPE.SINGLE) {
      this.fleetType = FLEET_TYPE.SINGLE;
    }

    if (this.isUnion && (this.mainFleetIndex === 0 || this.mainFleetIndex === 1)) {
      // 連合艦隊にチェックが入っている場合連合艦隊オブジェクトを生成

      const mains = this.fleets[0].ships;
      // 第1艦隊全艦をnot随伴としてインスタンス化
      for (let i = 0; i < mains.length; i += 1) {
        const ship = mains[i];
        mains[i] = new Ship({ ship, isEscort: false });
      }

      const escorts = this.fleets[1].ships;
      // 第2艦隊全艦を随伴としてインスタンス化
      for (let i = 0; i < escorts.length; i += 1) {
        const ship = escorts[i];
        escorts[i] = new Ship({ ship, isEscort: true });
      }

      const b: FleetBuilder = {
        isUnion: true,
        ships: this.fleets[0].ships.concat(escorts),
        formation: this.fleets[0].formation,
      };
      this.unionFleet = new Fleet(b);

      // 艦隊別の制空値に初期化
      this.unionFleet.airPower = this.fleets[0].fullAirPower;
      this.unionFleet.escortAirPower = this.fleets[1].fullAirPower;
    } else if (!this.isUnion) {
      // 連合が解除されているので再度インスタンス化
      this.fleets[0] = new Fleet({ fleet: this.fleets[0], isUnion: false });
      this.fleets[1] = new Fleet({ fleet: this.fleets[1], isUnion: false });
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

  /**
   * 陣形が変更されたFleetInfoを新しく返却
   * @static
   * @param {FleetInfo} info
   * @param {number} formation
   * @return {*}  {FleetInfo}
   * @memberof FleetInfo
   */
  public static getInfoWithChangedFormation(info: FleetInfo, formation: number): FleetInfo {
    const fleets = [];
    for (let i = 0; i < info.fleets.length; i += 1) {
      fleets.push(new Fleet({ fleet: info.fleets[i], formation }));
    }

    return new FleetInfo({ info, fleets });
  }
}
