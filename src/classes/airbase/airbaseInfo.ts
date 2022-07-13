import AirCalcResult from '../airCalcResult';
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

  /** 選択難易度 専ら防空(重爆)時専用 重爆補正がちがうっぽいね */
  public readonly difficultyLevel: 0 | 1 | 2 | 3 | 4;

  /** 防空時制空値 */
  public readonly defenseAirPower: number;

  /** 適用される対重爆補正 */
  public readonly highDefenseCoefficient: number;

  /** 防空時(重爆)制空値 */
  public readonly highDefenseAirPower: number;

  /** 超重爆補正A */
  public readonly superHighAirRaidCorrA: number;

  /** 超重爆補正B */
  public readonly superHighAirRaidCorrB: number;

  /** 超重爆補正C */
  public readonly superHighAirRaidCorrC: number;

  /** 対超重爆ロケット補正A */
  public readonly superHighAirRaidRocketCoefficientA: number;

  /** 対超重爆ロケット補正B */
  public readonly superHighAirRaidRocketCoefficientB: number;

  /** 最終超重爆補正 */
  public readonly superHighAirRaidCoefficient: number;

  /** 防空時(超重爆)制空値 */
  public readonly fullSuperHighDefenseAirPower: number;

  /** 防空時(超重爆)各種Wave結果 */
  public superHighAirRaidResults: AirCalcResult[];

  /** 防空時(超重爆)制空値 計算中可変 */
  public superHighDefenseAirPower: number;

  /** 防空モードか否か ここを変更して計算を起こすと対応したモードで計算される */
  public isDefense: boolean;

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
      const sub = 3 - this.airbases.length;
      for (let i = 0; i < sub; i += 1) {
        this.airbases.push(new Airbase());
      }
    }

    this.defenseAirPower = 0;
    this.highDefenseAirPower = 0;
    this.superHighDefenseAirPower = 0;
    this.superHighAirRaidRocketCoefficientA = 0;
    this.superHighAirRaidRocketCoefficientB = 0;

    let rocketCount = 0;
    let sumSuperHighAirRaidTypeAItemCount = 0;
    let sumSuperHighAirRaidTypeBItemCount = 0;
    let sumSuperHighAirRaidTypeCItemCount = 0;
    for (let i = 0; i < this.airbases.length; i += 1) {
      const airbase = this.airbases[i];
      if (airbase.mode === AB_MODE.DEFENSE) {
        this.defenseAirPower += airbase.defenseAirPower;
        rocketCount += airbase.rocketCount;
        sumSuperHighAirRaidTypeAItemCount += airbase.superHighAirRaidTypeAItemCount;
        sumSuperHighAirRaidTypeBItemCount += airbase.superHighAirRaidTypeBItemCount;
        sumSuperHighAirRaidTypeCItemCount += airbase.superHighAirRaidTypeCItemCount;
      }
    }

    // 重爆補正
    this.highDefenseCoefficient = 1.0;
    const isHardOrMedium = this.difficultyLevel === DIFFICULTY_LEVEL.HARD || this.difficultyLevel === DIFFICULTY_LEVEL.MEDIUM;
    if (rocketCount >= 3) {
      this.highDefenseCoefficient = 1.2;
    } else if (rocketCount === 2) {
      this.highDefenseCoefficient = 1.1;
    } else if (rocketCount === 1 && isHardOrMedium) {
      this.highDefenseCoefficient = 0.8;
    } else if (rocketCount === 0 && isHardOrMedium) {
      this.highDefenseCoefficient = 0.5;
    }
    this.highDefenseAirPower = Math.floor(this.defenseAirPower * this.highDefenseCoefficient);

    // 超重爆補正計算
    // 超重爆補正A
    this.superHighAirRaidCorrA = sumSuperHighAirRaidTypeAItemCount * 0.07;

    // 超重爆補正B
    switch (sumSuperHighAirRaidTypeBItemCount) {
      case 0:
        this.superHighAirRaidCorrB = 0;
        break;
      case 1:
        this.superHighAirRaidCorrB = 0.11;
        break;
      case 2:
        this.superHighAirRaidCorrB = 0.14;
        break;
      default:
        // 3以上、不明
        this.superHighAirRaidCorrB = 0.14;
        break;
    }

    // 超重爆補正C
    switch (sumSuperHighAirRaidTypeCItemCount) {
      case 0:
        this.superHighAirRaidCorrC = 0;
        break;
      case 1:
        this.superHighAirRaidCorrC = 0.177;
        break;
      case 2:
        this.superHighAirRaidCorrC = 0.287;
        break;
      default:
        // 3以上、不明
        this.superHighAirRaidCorrC = 0.397;
        break;
    }
    switch (rocketCount) {
      case 0:
        this.superHighAirRaidRocketCoefficientA = 0.5;
        this.superHighAirRaidRocketCoefficientB = 0.3;
        break;
      case 1:
        this.superHighAirRaidRocketCoefficientA = 0.95;
        this.superHighAirRaidRocketCoefficientB = 0.55;
        break;
      case 2:
        this.superHighAirRaidRocketCoefficientA = 1; // 不明
        this.superHighAirRaidRocketCoefficientB = 0.85;
        break;
      case 3:
        this.superHighAirRaidRocketCoefficientA = 1;
        this.superHighAirRaidRocketCoefficientB = 1;
        break;
      case 4:
        this.superHighAirRaidRocketCoefficientA = 1;
        this.superHighAirRaidRocketCoefficientB = 1.07;
        break;
      default:
        // 5以上
        this.superHighAirRaidRocketCoefficientA = 1; // 不明
        this.superHighAirRaidRocketCoefficientB = 1.11;
        break;
    }

    // 補正合計
    this.superHighAirRaidCoefficient = (this.superHighAirRaidCorrA + this.superHighAirRaidCorrB + this.superHighAirRaidCorrC) * this.superHighAirRaidRocketCoefficientA + this.superHighAirRaidRocketCoefficientB;
    // 超重爆最終制空値
    this.superHighDefenseAirPower = Math.floor(this.defenseAirPower * this.superHighAirRaidCoefficient);
    this.fullSuperHighDefenseAirPower = this.superHighDefenseAirPower;
    this.superHighAirRaidResults = [new AirCalcResult(), new AirCalcResult(), new AirCalcResult()];
  }
}
