import { DIFFICULTY_LEVEL, AB_MODE } from '../const';
import Airbase from './airbase';

export interface AirbaseInfoBuilder {
  // eslint-disable-next-line no-use-before-define
  info?: AirbaseInfo | undefined;
  /** 基地一覧 */
  airbases?: Airbase[];
  /** 防空モード */
  isDefense?: boolean;
  /** 防空時難易度 */
  difficultyLevel?: 0 | 1 | 2 | 3 | 4;
}

export default class AirbaseInfo {
  /**
   * 基地一覧 基本的には3部隊
   * @type {Airbase[]}
   * @memberof AirbaseInfo
   */
  public readonly airbases: Airbase[];

  /**
   * 防空モードか否か
   * @type {boolean}
   * @memberof AirbaseInfo
   */
  public readonly isDefense: boolean;

  /**
   * 選択難易度 専ら防空(重爆)時専用 重爆補正がちがうっぽいね
   * @type {number}
   * @memberof AirbaseInfo
   */
  public readonly difficultyLevel: 0 | 1 | 2 | 3 | 4;

  /**
   * 防空時制空値
   * @type {number}
   * @memberof AirbaseInfo
   */
  public readonly defenseAirPower: number;

  /**
   * 適用される対重爆補正
   * @type {number}
   * @memberof AirbaseInfo
   */
  public readonly highDeffenseCoefficient: number;

  /**
   * 防空時(重爆)制空値
   * @type {number}
   * @memberof AirbaseInfo
   */
  public readonly highDefenseAirPower: number;

  /** 計算済みフラグ */
  public calculated = false;

  /** 履歴に追加しなくてもいいフラグ */
  public ignoreHistory = false;

  constructor(builder: AirbaseInfoBuilder = {}) {
    if (builder.info) {
      this.airbases = builder.airbases !== undefined ? builder.airbases : builder.info.airbases.concat();
      this.isDefense = builder.isDefense !== undefined ? builder.isDefense : builder.info.isDefense;
      this.difficultyLevel = builder.difficultyLevel !== undefined ? builder.difficultyLevel : builder.info.difficultyLevel;
    } else {
      this.isDefense = builder.isDefense !== undefined ? builder.isDefense : false;
      this.airbases = builder.airbases !== undefined ? builder.airbases : [];
      this.difficultyLevel = builder.difficultyLevel !== undefined ? builder.difficultyLevel : 0;
    }

    if (this.airbases.length < 3) {
      for (let i = 0; i < 3; i += 1) {
        this.airbases.push(new Airbase());
      }
    }

    this.defenseAirPower = 0;
    this.highDefenseAirPower = 0;

    let rocketCount = 0;

    for (let i = 0; i < this.airbases.length; i += 1) {
      const airbase = this.airbases[i];
      if (airbase.mode === AB_MODE.DEFFENSE) {
        this.defenseAirPower += airbase.defenseAirPower;
        this.highDefenseAirPower += airbase.defenseAirPower;
        rocketCount += airbase.rocketCount;
      }
    }

    // 重爆補正
    this.highDeffenseCoefficient = 1.0;
    const isHardorMedium = this.difficultyLevel === DIFFICULTY_LEVEL.HARD || this.difficultyLevel === DIFFICULTY_LEVEL.MEDIUM;
    if (rocketCount >= 3) {
      this.highDeffenseCoefficient = 1.2;
    } else if (rocketCount === 2) {
      this.highDeffenseCoefficient = 1.1;
    } else if (rocketCount === 1 && isHardorMedium) {
      this.highDeffenseCoefficient = 0.8;
    } else if (rocketCount === 0 && isHardorMedium) {
      this.highDeffenseCoefficient = 0.5;
    }
    this.highDefenseAirPower = Math.floor(this.highDefenseAirPower * this.highDeffenseCoefficient);
  }
}
