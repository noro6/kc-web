import { DIFFICULTY_LEVEL, LB_MODE } from '../const';
import Landbase from './landbase';

export interface LandbaseInfoBuilder {
  // eslint-disable-next-line no-use-before-define
  info?: LandbaseInfo | undefined;
  /** 基地一覧 */
  landbases?: Landbase[];
  /** 防空モード */
  isDefense?: boolean;
  /** 防空時難易度 */
  difficultyLevel?: 0 | 1 | 2 | 3 | 4;
}

export default class LandbaseInfo {
  /**
   * 基地一覧 基本的には3部隊
   * @type {Landbase[]}
   * @memberof LandbaseInfo
   */
  public readonly landbases: Landbase[];

  /**
   * 防空モードか否か
   * @type {boolean}
   * @memberof LandbaseInfo
   */
  public readonly isDefense: boolean;

  /**
   * 選択難易度 専ら防空(重爆)時専用 重爆補正がちがうっぽいね
   * @type {number}
   * @memberof LandbaseInfo
   */
  public readonly difficultyLevel: 0 | 1 | 2 | 3 | 4;

  /**
   * 防空時制空値
   * @type {number}
   * @memberof LandbaseInfo
   */
  public readonly defenseAirPower: number;

  /**
   * 適用される対重爆補正
   * @type {number}
   * @memberof LandbaseInfo
   */
  public readonly highDeffenseCoefficient: number;

  /**
   * 防空時(重爆)制空値
   * @type {number}
   * @memberof LandbaseInfo
   */
  public readonly highDefenseAirPower: number;

  constructor(builder: LandbaseInfoBuilder = {}) {
    if (builder.info) {
      this.landbases = builder.landbases !== undefined ? builder.landbases : builder.info.landbases.concat();
      this.isDefense = builder.isDefense !== undefined ? builder.isDefense : builder.info.isDefense;
      this.difficultyLevel = builder.difficultyLevel !== undefined ? builder.difficultyLevel : builder.info.difficultyLevel;
    } else {
      this.isDefense = builder.isDefense !== undefined ? builder.isDefense : false;
      this.landbases = builder.landbases !== undefined ? builder.landbases : [];
      this.difficultyLevel = builder.difficultyLevel !== undefined ? builder.difficultyLevel : 0;
    }

    if (this.landbases.length < 3) {
      for (let i = 0; i < 3; i += 1) {
        this.landbases.push(new Landbase());
      }
    }

    this.defenseAirPower = 0;
    this.highDefenseAirPower = 0;

    let rocketCount = 0;

    for (let i = 0; i < this.landbases.length; i += 1) {
      const landbase = this.landbases[i];
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
