import { AIR_STATE, CELL_TYPE, AB_MODE } from './const';
import AirCalcResult from './airCalcResult';
import BattleInfo from './enemy/battleInfo';
import FleetInfo from './fleet/fleetInfo';
import Airbase from './airbase/airbase';
import AirbaseInfo from './airbase/airbaseInfo';
import Item from './item/item';
import Calculator from './calculator';
import CommonCalc from './commonCalc';
import Fleet from './fleet/fleet';

export default class CalcManager {
  /** 防空計算モードか否か 基地航空隊欄で制御 */
  public isDefense: boolean;

  public airbaseInfo: AirbaseInfo;

  public battleInfo: BattleInfo;

  public fleetInfo: FleetInfo;

  public mainBattle: number;

  public resetAll: boolean;

  constructor() {
    this.airbaseInfo = new AirbaseInfo();
    this.battleInfo = new BattleInfo();
    this.fleetInfo = new FleetInfo();
    this.isDefense = false;
    this.mainBattle = 0;
    this.resetAll = false;
  }

  /**
   * 計算処理を行い、各種結果情報を更新
   * @return {*}  {Promise<void>}
   * @memberof CalcManager
   */
  public async updateInfo(simulationCount = 10000): Promise<void> {
    this.isDefense = this.airbaseInfo.isDefense;
    this.mainBattle = this.mainBattle < 0 ? 0 : this.mainBattle;

    if (this.isDefense) {
      // 防空モード計算 & 結果格納
      this.calculateDefenseMode();
    } else {
      // 通常モード計算
      this.calculate(simulationCount);
    }
  }

  /**
   * 計算実行
   * @private
   * @param {number} maxCount シミュレーション回数
   * @memberof CalcManager
   */
  private calculate(maxCount: number): void {
    // 計算結果表示戦闘
    const { mainBattle } = this;

    // プロパティのみを取り出す
    const cloned = JSON.stringify(this);
    const calcInfo = JSON.parse(cloned) as CalcManager;

    // 計算対象の基地
    const airbases = calcInfo.airbaseInfo.airbases.filter((v) => v.mode === AB_MODE.BATTLE && v.items.find((i) => i.data.id > 0));

    // 計算対象の艦隊
    const { fleetInfo } = calcInfo;
    let fleet = fleetInfo.fleets[calcInfo.fleetInfo.mainFleetIndex];
    if (fleetInfo.isUnion && fleetInfo.mainFleetIndex <= 1) {
      // 連合艦隊にチェックが入っており、第1または第2艦隊が選択されている場合は連合艦隊をメイン計算艦隊にする
      fleet = fleetInfo.unionFleet as Fleet;
    }
    const fullAirPower = fleet.airPower;
    const fullEscortAirPower = fleet.escortAirPower;

    // 敵艦隊 全戦闘分
    const battles = calcInfo.battleInfo.fleets;
    const battleCount = battles.length;

    // シミュレーション中に撃墜された艦載機総数
    let sumDownSlot = 0;
    // シミュレーション中に消費された鋼材総数
    let sumUsedSteels = 0;

    // 初期化
    for (let i = 0; i < airbases.length; i += 1) {
      airbases[i].resultWave1 = new AirCalcResult();
      airbases[i].resultWave2 = new AirCalcResult();
    }

    // 計算結果格納用リザルト全艦隊初期化
    for (let i = 0; i < fleetInfo.fleets.length; i += 1) {
      const f = fleetInfo.fleets[i];
      f.results = [];
      for (let j = 0; j < battleCount; j += 1) {
        f.results.push(new AirCalcResult());
      }
    }

    fleet.results = [];
    for (let j = 0; j < battleCount; j += 1) {
      fleet.results.push(new AirCalcResult());
    }

    // 艦載機の各戦闘開始時搭載数記録用の配列の初期化
    for (let i = 0; i < fleet.allPlanes.length; i += 1) {
      const item = fleet.allPlanes[i];
      item.slotHistories = [];
      item.slotResult = 0;
      item.deathRate = 0;
      for (let j = 0; j < battleCount; j += 1) {
        item.slotHistories.push(0);
      }
    }
    for (let i = 0; i < battles.length; i += 1) {
      const items = battles[i].allPlanes;
      for (let j = 0; j < items.length; j += 1) {
        const item = items[j];
        item.slotResult = 0;
        item.deathRate = 0;
      }
    }

    for (let count = 0; count < maxCount; count += 1) {
      // 設定された戦闘回数下記の各計算処理を行う
      for (let battle = 0; battle < battleCount; battle += 1) {
        const enemyFleet = battles[battle];
        const isMainBattle = mainBattle === battle;

        /** ======= 基地航空隊フェーズ ======= */
        Calculator.calculateAirbasePhase(airbases, enemyFleet, battle);

        /** ======= 友軍艦隊航空支援フェーズ ======= */
        // todo

        /** ======= 本隊噴式機フェーズ ======= */
        sumUsedSteels += Calculator.shootDownFleetJet(fleet, enemyFleet);

        /** ======= 本隊航空戦フェーズ ======= */
        Calculator.calculateMainPhase(fleet, enemyFleet, battle, isMainBattle);

        /** ======= 本隊航空戦フェーズ2回目(航空戦マスなら) ======= */
        if (enemyFleet.cellType === CELL_TYPE.AERIAL_COMBAT) {
          Calculator.calculateAerialConbatCellPhase(fleet, enemyFleet);
        }

        /** ======= 支援艦隊 航空支援フェーズ ======= */
        if (isMainBattle) {
          Calculator.calculateAerialSupportPhase(fleetInfo.fleets, enemyFleet, battle);
        }

        // 減ったフラグがたってるなら
        if (enemyFleet.needSupply) {
          // 敵艦隊の補給
          for (let i = 0; i < enemyFleet.allPlanes.length; i += 1) {
            const item = enemyFleet.allPlanes[i];
            item.slotResult += item.slot;
            item.deathRate += item.slot ? 0 : 1;
            Item.supply(enemyFleet.allPlanes[i]);
          }
          enemyFleet.airPower = enemyFleet.fullAirPower;
          enemyFleet.airbaseAirPower = enemyFleet.fullAirbaseAirPower;
          enemyFleet.needSupply = false;
        }
      }

      // 次の計算に備え、減った艦載機や制空値を補給したり記録したりいろいろ
      for (let i = 0; i < airbases.length; i += 1) {
        const airbase = airbases[i];
        if (airbase.needSupply) {
          // 基地補給
          Airbase.supply(airbases[i]);
          airbase.needSupply = false;
        }
      }

      for (let i = 0; i < fleet.allPlanes.length; i += 1) {
        const item = fleet.allPlanes[i];
        // いろいろ記録
        item.slotResult += item.slot;
        item.deathRate += item.slot === 0 ? 1 : 0;
        sumDownSlot += (item.fullSlot - item.slot);
        // 艦隊装備補給
        Item.supply(item);
      }
      fleet.airPower = fullAirPower;
      fleet.escortAirPower = fullEscortAirPower;
    }

    // 基地航空隊計算結果を整形してセット
    for (let i = 0; i < calcInfo.airbaseInfo.airbases.length; i += 1) {
      const lb = calcInfo.airbaseInfo.airbases[i];
      if (lb.mode === AB_MODE.BATTLE && lb.items.find((v) => v.data.id > 0)) {
        AirCalcResult.formatResult(lb.resultWave1, maxCount);
        AirCalcResult.formatResult(lb.resultWave2, maxCount);

        this.airbaseInfo.airbases[i].resultWave1 = lb.resultWave1;
        this.airbaseInfo.airbases[i].resultWave2 = lb.resultWave2;

        const recordedItemIndex = lb.items.findIndex((v) => v.needRecord);
        if (recordedItemIndex >= 0) {
          const item = this.airbaseInfo.airbases[i].items[recordedItemIndex];
          item.dist = lb.items[recordedItemIndex].dist.concat();
          item.needRecord = false;
        }
      }
    }

    // 本隊計算結果を整形してセット
    const { mainFleet } = this.fleetInfo;
    for (let i = 0; i < battleCount; i += 1) {
      AirCalcResult.formatResult(fleet.results[i], maxCount);
      mainFleet.results = fleet.results;
    }
    mainFleet.mainResult = fleet.results[mainBattle];
    mainFleet.mainResult.avgDownSlot = sumDownSlot / maxCount;
    mainFleet.mainResult.avgUsedSteels = sumUsedSteels / maxCount;

    for (let i = 0; i < fleet.allPlanes.length; i += 1) {
      const item = fleet.allPlanes[i];
      const mainItem = mainFleet.allPlanes[i];
      // いろいろ搭載数とか記録したやつを受け渡す
      mainItem.slotHistories = item.slotHistories.map((v) => Math.round(v / maxCount));
      mainItem.slotResult = Math.round(item.slotResult / maxCount);
      const deathRate = (100 * item.deathRate) / maxCount;
      mainItem.deathRate = deathRate >= 1 ? Math.round(deathRate) : Math.ceil(deathRate);
      if (mainItem.needRecord) {
        mainItem.dist = item.dist;
      }
    }

    const enemyItems = this.battleInfo.fleets[mainBattle].allPlanes;
    const calculatedEnemyItems = battles[mainBattle].allPlanes;
    for (let i = 0; i < enemyItems.length; i += 1) {
      const item = calculatedEnemyItems[i];
      const mainItem = enemyItems[i];
      // 残数、全滅率を記録したやつを受け渡す
      mainItem.slotResult = Math.round(item.slotResult / maxCount);
      mainItem.deathRate = (100 * item.deathRate) / maxCount;
      if (mainItem.needRecord) {
        mainItem.dist = item.dist;
      }
    }

    // 支援艦隊の結果格納
    for (let i = 0; i < fleetInfo.fleets.length; i += 1) {
      const f = fleetInfo.fleets[i];
      if (!this.fleetInfo.fleets[i].results[mainBattle]) {
        this.fleetInfo.fleets[i].results = [];
        for (let count = 0; count <= mainBattle; count += 1) {
          this.fleetInfo.fleets[i].results.push(new AirCalcResult());
        }
      }
      this.fleetInfo.fleets[i].results[mainBattle].supportRates = f.results[mainBattle].supportRates.map((v) => (100 * v) / maxCount);
      this.fleetInfo.fleets[i].results[mainBattle].loopSumEnemySupportAirPower = f.results[mainBattle].loopSumEnemySupportAirPower / maxCount;
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
    const enemyAirPower = enemy.airbaseAirPower;
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
      result.airState.value = AIR_STATE.KAKUHO;
      result.rates[0] = 1;
    } else if (airPower >= b0) {
      result.airState.value = AIR_STATE.KAKUHO;
      result.rates[AIR_STATE.KAKUHO] = 1;
    } else if (airPower >= b1) {
      result.airState.value = AIR_STATE.YUSEI;
      result.rates[AIR_STATE.YUSEI] = 1;
    } else if (airPower >= b2) {
      result.airState.value = AIR_STATE.KINKO;
      result.rates[AIR_STATE.KINKO] = 1;
    } else if (airPower >= b3) {
      result.airState.value = AIR_STATE.RESSEI;
      result.rates[AIR_STATE.RESSEI] = 1;
    } else {
      result.airState.value = AIR_STATE.SOSHITSU;
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
