import { DIFFICULTY_LEVEL, LB_MODE } from '../Const';
import LandBase from './LandBase';

export interface LandBaseInfoBuilder {
  // eslint-disable-next-line no-use-before-define
  info?: LandBaseInfo | undefined;
  /** 基地一覧 */
  landBases?: LandBase[];
  /** 防空モード */
  isDefense?: boolean;
  /** 防空時難易度 */
  difficultyLevel?: 0 | 1 | 2 | 3 | 4;
}

export default class LandBaseInfo {
  /**
   * 基地一覧 基本的には3部隊
   * @type {LandBase[]}
   * @memberof LandBaseInfo
   */
  public readonly landBases: LandBase[];

  /**
   * 防空モードか否か
   * @type {boolean}
   * @memberof LandBaseInfo
   */
  public readonly isDefense: boolean;

  /**
   * 選択難易度 専ら防空(重爆)時専用 重爆補正がちがうっぽいね
   * @type {number}
   * @memberof LandBaseInfo
   */
  public readonly difficultyLevel: 0 | 1 | 2 | 3 | 4;

  /**
   * 防空時制空値
   * @type {number}
   * @memberof LandBaseInfo
   */
  public readonly defenseAirPower: number;

  /**
   * 適用される対重爆補正
   * @type {number}
   * @memberof LandBaseInfo
   */
  public readonly highDeffenseCoefficient: number;

  /**
   * 防空時(重爆)制空値
   * @type {number}
   * @memberof LandBaseInfo
   */
  public readonly highDefenseAirPower: number;

  constructor(builder: LandBaseInfoBuilder = {}) {
    console.log('LandBaseInfo initialize');
    if (builder.info) {
      this.landBases = builder.landBases !== undefined ? builder.landBases : builder.info.landBases.concat();
      this.isDefense = builder.isDefense !== undefined ? builder.isDefense : builder.info.isDefense;
      this.difficultyLevel = builder.difficultyLevel !== undefined ? builder.difficultyLevel : builder.info.difficultyLevel;
    } else {
      this.isDefense = builder.isDefense !== undefined ? builder.isDefense : false;
      this.landBases = builder.landBases !== undefined ? builder.landBases : [];
      this.difficultyLevel = builder.difficultyLevel !== undefined ? builder.difficultyLevel : 0;
    }

    if (this.landBases.length < 3) {
      for (let i = 0; i < 3; i += 1) {
        this.landBases.push(new LandBase());
      }
    }

    this.defenseAirPower = 0;
    this.highDefenseAirPower = 0;

    let rocketCount = 0;

    for (let i = 0; i < this.landBases.length; i += 1) {
      const landbase = this.landBases[i];
      if (landbase.mode === LB_MODE.DEFFENSE) {
        this.defenseAirPower += landbase.defenseAirPower;
        this.highDefenseAirPower += landbase.defenseAirPower;
        rocketCount += landbase.rocketCount;
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
