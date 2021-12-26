import AirCalcResult from './AirCalcResult';
import BattleInfo from './Enemy/BattleInfo';
import { AIR_STATE, CELL_TYPE, LB_MODE } from './Const';
import EnemyFleet from './Enemy/EnemyFleet';
import FleetInfo from './Fleet/FleetInfo';
import LandBase from './LandBase/LandBase';
import LandBaseInfo from './LandBase/LandBaseInfo';

export default class CalcManager {
  /** 防空計算モードか否か 基地航空隊欄で制御 */
  public isDefense: boolean;

  public landBaseInfo: LandBaseInfo;

  public battleInfo: BattleInfo;

  public fleetInfo: FleetInfo;

  constructor() {
    this.landBaseInfo = new LandBaseInfo();
    this.battleInfo = new BattleInfo();
    this.fleetInfo = new FleetInfo();
    this.isDefense = false;
  }

  public updateInfo(): void {
    this.isDefense = this.landBaseInfo.isDefense;

    if (this.isDefense) {
      // 防空モード計算 & 結果格納
      this.calculateDefenseMode();
    } else {
      // 通常モード計算
      this.calculate();
    }
  }

  /**
   * 引数の制空値から各制空状態のボーダー制空値を返却
   * @static
   * @param {number} airPower
   * @returns {number[]}
   * @memberof CalcManager
   */
  public static getAirStatusBorder(airPower: number): number[] {
    return [
      airPower * 3,
      Math.ceil(airPower * 1.5),
      Math.floor(airPower / 1.5) + 1,
      Math.floor(airPower / 3) + 1,
      0,
    ];
  }

  private calculate(): void {
    /** 有効な基地 */
    const landbases = this.landBaseInfo.landBases.filter((v) => v.mode === LB_MODE.BATTLE);
    /** 敵艦隊 全戦闘分 */
    const battles = this.battleInfo.fleets;
    const battleCount = battles.length;

    for (let battle = 0; battle < battleCount; battle += 1) {
      const enemyFleet = battles[battle];

      // 基地航空隊フェーズの計算
      CalcManager.calculateLandbasePhase(landbases, enemyFleet, battle);
    }
  }

  private static calculateLandbasePhase(landbases: LandBase[], enemyFleet: EnemyFleet, battle: number) {
    for (let i = 0; i < landbases.length; i += 1) {
      const landbase = landbases[i];
      if (landbase.battleTarget[0] !== battle && landbase.battleTarget[1] !== battle) {
        // 第1波 第2波どちらも担当しないなら飛ばす
        continue;
      }
    }
  }

  /**
   * 防空モード計算を行い、結果を基地航空隊オブジェクトクラスにセット
   * @private
   * @memberof CalcManager
   */
  private calculateDefenseMode(): void {
    // 防空モード計算
    const lb = this.landBaseInfo;
    const enemy = this.battleInfo.airRaidFleet;

    // 相手制空値
    const enemyAirPower = enemy.airPower;
    // 制空値ボーダー
    const [b0, b1, b2, b3] = CalcManager.getAirStatusBorder(enemyAirPower);

    // 使う制空値を決定
    const airPower = enemy.cellType !== CELL_TYPE.HIGH_AIR_RAID ? lb.defenseAirPower : lb.highDefenseAirPower;

    const result = new AirCalcResult();
    if (enemyAirPower <= 0) {
      // 敵制空値がない場合は確保固定
      result.airState = AIR_STATE.KAKUHO;
      result.airStateBarWidth = 100;
      result.rates[0] = 1;
    } else if (airPower >= b0) {
      result.airStateBarWidth = (airPower / b0) * 100 * 0.9;
      result.airState = AIR_STATE.KAKUHO;
      result.rates[AIR_STATE.KAKUHO] = 1;
    } else if (airPower >= b1) {
      result.airStateBarWidth = (airPower / b0) * 100 * 0.9;
      result.airState = AIR_STATE.YUSEI;
      result.rates[AIR_STATE.YUSEI] = 1;
    } else if (airPower >= b2) {
      result.airStateBarWidth = (airPower / b1) * 100 * 0.45;
      result.airState = AIR_STATE.KINKO;
      result.rates[AIR_STATE.KINKO] = 1;
    } else if (airPower >= b3) {
      result.airStateBarWidth = (airPower / b2) * 100 * 0.2;
      result.airState = AIR_STATE.RESSEI;
      result.rates[AIR_STATE.RESSEI] = 1;
    } else {
      result.airStateBarWidth = (airPower / b3) * 100 * 0.1;
      result.airState = AIR_STATE.SOSHITSU;
      result.rates[AIR_STATE.SOSHITSU] = 1;
    }

    // 計算完了フラグ建て
    result.isCalculated = true;
    result.airStateBarWidth = Math.min(result.airStateBarWidth, 100);
    for (let i = 0; i < lb.landBases.length; i += 1) {
      // 全ての航空隊に同じ結果を挿入
      lb.landBases[i].resultWave1 = result;
      lb.landBases[i].resultWave2 = result;
    }
  }
}
