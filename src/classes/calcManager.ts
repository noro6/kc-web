import { AIR_STATE, CELL_TYPE, LB_MODE } from './const';
import AirCalcResult from './airCalcResult';
import BattleInfo from './enemy/battleInfo';
import FleetInfo from './fleet/fleetInfo';
import Landbase from './landbase/landbase';
import LandbaseInfo from './landbase/landbaseInfo';
import Item from './item/item';
import Calculator from './calculator';

export default class CalcManager {
  /** 防空計算モードか否か 基地航空隊欄で制御 */
  public isDefense: boolean;

  public landbaseInfo: LandbaseInfo;

  public battleInfo: BattleInfo;

  public fleetInfo: FleetInfo;

  constructor() {
    this.landbaseInfo = new LandbaseInfo();
    this.battleInfo = new BattleInfo();
    this.fleetInfo = new FleetInfo();
    this.isDefense = false;
  }

  public async updateInfo(): Promise<void> {
    this.isDefense = this.landbaseInfo.isDefense;
    console.time('calculated');

    if (this.isDefense) {
      // 防空モード計算 & 結果格納
      this.calculateDefenseMode();
    } else {
      // 通常モード計算
      this.calculate();
    }
    console.timeEnd('calculated');
  }

  private calculate(): void {
    // プロパティのみを取り出す
    const cloned = JSON.stringify(this);
    const calcInfo = JSON.parse(cloned) as CalcManager;

    const maxCount = 5000;

    /** 計算対象の基地 */
    const landbases = calcInfo.landbaseInfo.landbases.filter((v) => v.mode === LB_MODE.BATTLE);

    /** 計算対象の艦隊 todo いい感じに選ぶ */
    const fleet = calcInfo.fleetInfo.fleets.concat()[0];

    /** 敵艦隊 全戦闘分 */
    const battles = calcInfo.battleInfo.fleets.concat();
    const battleCount = battles.length;

    // 計算結果表示戦闘
    const mainBattle = 0;

    // 初期化
    for (let i = 0; i < landbases.length; i += 1) {
      landbases[i].resultWave1 = new AirCalcResult();
      landbases[i].resultWave2 = new AirCalcResult();
    }
    fleet.result = new AirCalcResult();

    for (let count = 0; count < maxCount; count += 1) {
      // 設定された戦闘回数下記の各計算処理を行う
      for (let battle = 0; battle < battleCount; battle += 1) {
        const enemyFleet = battles[battle];

        /** ======= 基地航空隊フェーズ ======= */
        Calculator.calculateLandbasePhase(landbases, enemyFleet, battle);

        /** ======= 友軍艦隊航空支援フェーズ ======= */
        // todo

        /** ======= 本隊噴式機フェーズ ======= */
        Calculator.shootDownFleetJet(fleet, enemyFleet);

        /** ======= 本隊航空戦フェーズ ======= */
        Calculator.calculateMainPhase(fleet, enemyFleet, battle === mainBattle);

        /** ======= 本隊航空戦フェーズ2回目(航空戦マスなら) ======= */
        if (enemyFleet.cellType === CELL_TYPE.AERIAL_COMBAT) {
          Calculator.calculateMainPhase(fleet, enemyFleet, battle === mainBattle);
        }

        // 敵艦隊の補給
        for (let i = 0; i < enemyFleet.allPlanes.length; i += 1) {
          Item.supply(enemyFleet.allPlanes[i]);
        }
      }

      // 次のシミュレーションに備え、減った艦載機や制空値を補給
      for (let i = 0; i < landbases.length; i += 1) {
        Landbase.supply(landbases[i]);
      }
      for (let i = 0; i < fleet.allPlanes.length; i += 1) {
        Item.supply(fleet.allPlanes[i]);
      }
      fleet.airPower = fleet.fullAirPower;
    }

    // 結果が返ってきたので各種表示できるように調整
    fleet.result.airState = fleet.result.rates.indexOf(Math.max(...fleet.result.rates));
    // 平均値にする
    fleet.result.loopSumAirPower /= maxCount;
    fleet.result.loopSumEnemyAirPower /= maxCount;
    const borders = Calculator.getAirStatusBorder(Math.floor(fleet.result.loopSumEnemyAirPower));
    fleet.result.setAirStateBarWidth(Math.floor(fleet.result.loopSumAirPower), borders);
    fleet.result.rates = fleet.result.rates.map((v) => (100 * v) / maxCount);

    this.fleetInfo.fleets[0].result = fleet.result;
  }

  /**
   * 防空モード計算を行い、結果を基地航空隊オブジェクトクラスにセット
   * @private
   * @memberof CalcManager
   */
  private calculateDefenseMode(): void {
    // 防空モード計算
    const lb = this.landbaseInfo;
    const enemy = this.battleInfo.airRaidFleet;

    // 相手制空値
    const enemyAirPower = enemy.airPower;
    // 制空値ボーダー
    const borders = Calculator.getAirStatusBorder(enemyAirPower);
    const [b0, b1, b2, b3] = borders;

    // 使う制空値を決定
    const airPower = enemy.cellType !== CELL_TYPE.HIGH_AIR_RAID ? lb.defenseAirPower : lb.highDefenseAirPower;

    const result = new AirCalcResult();
    if (enemyAirPower <= 0) {
      // 敵制空値がない場合は確保固定
      result.airState = AIR_STATE.KAKUHO;
      result.rates[0] = 1;
    } else if (airPower >= b0) {
      result.airState = AIR_STATE.KAKUHO;
      result.rates[AIR_STATE.KAKUHO] = 1;
    } else if (airPower >= b1) {
      result.airState = AIR_STATE.YUSEI;
      result.rates[AIR_STATE.YUSEI] = 1;
    } else if (airPower >= b2) {
      result.airState = AIR_STATE.KINKO;
      result.rates[AIR_STATE.KINKO] = 1;
    } else if (airPower >= b3) {
      result.airState = AIR_STATE.RESSEI;
      result.rates[AIR_STATE.RESSEI] = 1;
    } else {
      result.airState = AIR_STATE.SOSHITSU;
      result.rates[AIR_STATE.SOSHITSU] = 1;
    }

    result.setAirStateBarWidth(airPower, borders);

    // 計算完了フラグ建て
    result.isCalculated = true;
    result.airStateBarWidth = Math.min(result.airStateBarWidth, 100);
    for (let i = 0; i < lb.landbases.length; i += 1) {
      // 全ての航空隊に同じ結果を挿入
      lb.landbases[i].resultWave1 = result;
      lb.landbases[i].resultWave2 = result;
    }
  }
}
