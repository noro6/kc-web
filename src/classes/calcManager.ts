import { AIR_STATE, CELL_TYPE, AB_MODE } from './const';
import AirCalcResult from './airCalcResult';
import BattleInfo from './enemy/battleInfo';
import FleetInfo from './fleet/fleetInfo';
import Airbase from './airbase/airbase';
import AirbaseInfo from './airbase/airbaseInfo';
import Item from './item/item';
import Calculator from './calculator';
import CommonCalc from './commonCalc';

export default class CalcManager {
  /** 防空計算モードか否か 基地航空隊欄で制御 */
  public isDefense: boolean;

  public airbaseInfo: AirbaseInfo;

  public battleInfo: BattleInfo;

  public fleetInfo: FleetInfo;

  constructor() {
    this.airbaseInfo = new AirbaseInfo();
    this.battleInfo = new BattleInfo();
    this.fleetInfo = new FleetInfo();
    this.isDefense = false;
  }

  public async updateInfo(): Promise<void> {
    this.isDefense = this.airbaseInfo.isDefense;
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

    // 計算回数
    const maxCount = 5000;

    // 計算対象の基地
    const airbases = calcInfo.airbaseInfo.airbases.filter((v) => v.mode === AB_MODE.BATTLE && v.items.find((i) => i.data.id > 0));

    // 計算対象の艦隊
    const fleet = calcInfo.fleetInfo.fleets[calcInfo.fleetInfo.mainFleetIndex];

    // 敵艦隊 全戦闘分
    const battles = calcInfo.battleInfo.fleets;
    const battleCount = battles.length;

    // 計算結果表示戦闘
    const mainBattle = 0;

    // 初期化
    for (let i = 0; i < airbases.length; i += 1) {
      airbases[i].resultWave1 = new AirCalcResult();
      airbases[i].resultWave2 = new AirCalcResult();
    }

    fleet.results = [];
    for (let i = 0; i < battleCount; i += 1) {
      fleet.results.push(new AirCalcResult());
    }
    // 艦載機の各戦闘開始時搭載数記録用の配列の初期化
    for (let i = 0; i < fleet.allPlanes.length; i += 1) {
      const item = fleet.allPlanes[i];
      for (let j = 0; j < battleCount; j += 1) {
        item.slotHistories.push(0);
      }
    }

    for (let count = 0; count < maxCount; count += 1) {
      // 設定された戦闘回数下記の各計算処理を行う
      for (let battle = 0; battle < battleCount; battle += 1) {
        const enemyFleet = battles[battle];

        /** ======= 基地航空隊フェーズ ======= */
        Calculator.calculateAirbasePhase(airbases, enemyFleet, battle);

        /** ======= 友軍艦隊航空支援フェーズ ======= */
        // todo

        /** ======= 本隊噴式機フェーズ ======= */
        Calculator.shootDownFleetJet(fleet, enemyFleet);

        /** ======= 本隊航空戦フェーズ ======= */
        Calculator.calculateMainPhase(fleet, enemyFleet, battle, battle === mainBattle);

        /** ======= 本隊航空戦フェーズ2回目(航空戦マスなら) ======= */
        if (enemyFleet.cellType === CELL_TYPE.AERIAL_COMBAT) {
          Calculator.calculateAerialConbatCellPhase(fleet, enemyFleet);
        }

        // 減ったフラグがたってるなら
        if (enemyFleet.needSupply) {
          // 敵艦隊の補給
          for (let i = 0; i < enemyFleet.allPlanes.length; i += 1) {
            Item.supply(enemyFleet.allPlanes[i]);
          }
          enemyFleet.airPower = enemyFleet.fullAirPower;
          enemyFleet.airbaseAirPower = enemyFleet.fullAirbaseAirPower;
          enemyFleet.needSupply = false;
        }
      }

      // 次のシミュレーションに備え、減った艦載機や制空値を補給
      for (let i = 0; i < airbases.length; i += 1) {
        const airbase = airbases[i];
        if (airbase.needSupply) {
          // 基地補給
          Airbase.supply(airbases[i]);
          airbase.needSupply = false;
        }
      }
      for (let i = 0; i < fleet.allPlanes.length; i += 1) {
        // 艦隊装備補給
        const item = fleet.allPlanes[i];
        item.slotResult += item.slot;
        item.deathRate += item.slot <= 0 ? 1 : 0;
        Item.supply(item);
      }
      fleet.airPower = fleet.fullAirPower;
    }

    // 基地航空隊計算結果を整形してセット
    for (let i = 0; i < calcInfo.airbaseInfo.airbases.length; i += 1) {
      const lb = calcInfo.airbaseInfo.airbases[i];
      if (lb.mode === AB_MODE.BATTLE && lb.items.find((v) => v.data.id > 0)) {
        AirCalcResult.formatResult(lb.resultWave1, maxCount);
        AirCalcResult.formatResult(lb.resultWave2, maxCount);

        this.airbaseInfo.airbases[i].resultWave1 = lb.resultWave1;
        this.airbaseInfo.airbases[i].resultWave2 = lb.resultWave2;
      }
    }

    // 本隊計算結果を整形してセット
    const mainFleet = this.fleetInfo.fleets[this.fleetInfo.mainFleetIndex];
    for (let i = 0; i < battleCount; i += 1) {
      AirCalcResult.formatResult(fleet.results[i], maxCount);
      mainFleet.results = fleet.results;
    }
    mainFleet.mainResult = fleet.results[mainBattle];

    for (let i = 0; i < fleet.allPlanes.length; i += 1) {
      const item = fleet.allPlanes[i];
      const mainItem = mainFleet.allPlanes[i];
      mainItem.slotHistories = item.slotHistories.map((v) => Math.round(v / maxCount));
      mainItem.slotResult = Math.floor(item.slotResult / maxCount);
      const deathRate = (100 * item.deathRate) / maxCount;
      mainItem.deathRate = deathRate >= 1 ? Math.round(deathRate) : Math.ceil(deathRate);
    }
  }

  /**
   * 防空モード計算を行い、結果を基地航空隊オブジェクトクラスにセット
   * @private
   * @memberof CalcManager
   */
  private calculateDefenseMode(): void {
    // 防空モード計算
    const lb = this.airbaseInfo;
    const enemy = this.battleInfo.airRaidFleet;

    // 相手制空値
    const enemyAirPower = enemy.airPower;
    // 制空値ボーダー
    const borders = CommonCalc.getAirStatusBorder(enemyAirPower);
    const [b0, b1, b2, b3] = borders;

    // 使う制空値を決定
    const airPower = enemy.cellType !== CELL_TYPE.HIGH_AIR_RAID ? lb.defenseAirPower : lb.highDefenseAirPower;
    const result = new AirCalcResult();
    result.loopSumAirPower = airPower;
    result.loopSumEnemyAirPower = enemyAirPower;

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

    AirCalcResult.formatResult(result, 1);
    for (let i = 0; i < lb.airbases.length; i += 1) {
      // 全ての航空隊に同じ結果を挿入
      lb.airbases[i].resultWave1 = result;
      lb.airbases[i].resultWave2 = result;
    }
  }
}
