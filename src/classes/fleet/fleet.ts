import Ship from './ship';
import Const, {
  AvoidType, FORMATION, Formation, SHIP_TYPE, SUPPORT_TYPE,
} from '../const';
import Item from '../item/item';
import AirCalcResult from '../airCalcResult';
import AntiAirCutIn from '../aerialCombat/antiAirCutIn';
import ShootDownInfo from '../aerialCombat/shootDownInfo';
import { ContactRate } from '../interfaces/contactRate';

export interface FleetBuilder {
  // eslint-disable-next-line no-use-before-define
  fleet?: Fleet | undefined;
  /** 艦一覧 未指定ならfleetの艦一覧で作成 */
  ships?: Ship[];
  /** 陣形 未指定ならfleetの陣形で作成 */
  formation?: number;
  /** 連合フラグ 未指定ならfleetの連合フラグで作成 */
  isUnion?: boolean;
}

export default class Fleet {
  /** この艦隊を構成する艦娘一覧 */
  public readonly ships: Ship[];

  /** 陣形 */
  public readonly formation: number;

  /** 連合艦隊フラグ */
  public readonly isUnion: boolean;

  /** 艦隊制空値 */
  public readonly fullAirPower: number;

  /** 支援タイプ Const.SUPPORT_TYPE参照 */
  public readonly supportTypes: number[];

  /** 支援制空値 */
  public readonly supportAirPower: number;

  /** 輸送量 */
  public readonly tp: number;

  /** 航空戦が可能な機体ありなし(主力 & 随伴) */
  public readonly hasPlane: boolean;

  /** 航空戦が可能な機体ありなし(主力のみ) */
  public readonly hasMainPlane: boolean;

  /** 噴式機ありなし */
  public readonly hasJet: boolean;

  /** 艦隊防空値(ブラウザ版表示値) */
  public readonly fleetAntiAir: number;

  /** この艦隊の全艦載機装備 搭載数1以上 計算用 */
  public readonly allPlanes: Item[];

  /** stage2 撃墜テーブル */
  public readonly shootDownList: ShootDownInfo[];

  /** stage2 撃墜テーブル(空襲) */
  public readonly shootDownListAirRaid: ShootDownInfo[];

  /** 発動可能対空CI全種 */
  public readonly allAntiAirCutIn: AntiAirCutIn[];

  /** 艦隊索敵補正 */
  public readonly fleetRosCorr: number;

  /** 夜偵発動率 */
  public readonly nightContactRate: number;

  /** 艦隊区分(速力) */
  public readonly fleetSpeed: string;

  /** 現在搭載数における制空値 計算用 */
  public airPower: number;

  /** 計算結果の各制空状態の割合 */
  public results: AirCalcResult[] = [new AirCalcResult()];

  /** 表示戦闘の各制空状態の割合 */
  public mainResult = new AirCalcResult();

  /** この艦隊の随伴艦隊制空値 連合艦隊専用 */
  public escortAirPower = 0;

  constructor(builder: FleetBuilder = {}) {
    if (builder.fleet) {
      // builderよりそのままインスタンスを引継ぎ
      this.ships = builder.ships ? builder.ships.concat() : builder.fleet.ships.concat();
      this.isUnion = builder.isUnion !== undefined ? builder.isUnion : builder.fleet.isUnion;
      this.formation = builder.formation !== undefined ? builder.formation : builder.fleet.formation;
    } else {
      this.ships = builder.ships ? builder.ships.concat() : [];
      this.isUnion = builder.isUnion !== undefined ? builder.isUnion : false;
      this.formation = builder.formation !== undefined ? builder.formation : FORMATION.LINE_AHEAD;

      if (this.ships.length === 0) {
        // 0隻だった場合は空の艦娘を6隻分つっこむ
        for (let i = 0; i < 6; i += 1) {
          this.ships.push(new Ship());
        }
      }
    }

    // 計算により算出するステータス
    const formation = Const.FORMATIONS.find((v) => v.value === this.formation);
    this.fleetAntiAir = this.getFleetAntiAir(formation);
    this.tp = 0;
    this.fullAirPower = 0;
    this.supportAirPower = 0;
    this.fleetRosCorr = 0;
    this.hasJet = false;
    this.hasPlane = false;
    this.hasMainPlane = false;
    this.allPlanes = [];

    this.allAntiAirCutIn = [];
    const enabledShips = this.ships.filter((v) => v.isActive && !v.isEmpty);

    let sumShipRos = 0;
    let sumSPRos = 0;
    let nightContactFailureRate = 1;
    for (let i = 0; i < enabledShips.length; i += 1) {
      const ship = enabledShips[i];
      if (ship.isActive && !ship.isEmpty) {
        this.fullAirPower += ship.fullAirPower;
        this.supportAirPower += ship.supportAirPower;
        this.tp += ship.tp;
        sumShipRos += ship.scout;
        sumSPRos += ship.sumSPRos;

        // 夜偵発動率計算
        if (!this.isUnion || (this.isUnion && ship.isEscort)) {
          nightContactFailureRate -= nightContactFailureRate * ship.nightContactRate;
        }
        this.allAntiAirCutIn = this.allAntiAirCutIn.concat(ship.antiAirCutIn);

        const shipPlanes = ship.items.filter((v) => v.data.isPlane && v.fullSlot > 0);
        if (shipPlanes.length) {
          // 連合かつ第2艦隊なら艦載機の随伴機フラグを挙げる
          if (this.isUnion && ship.isEscort) {
            for (let j = 0; j < shipPlanes.length; j += 1) {
              shipPlanes[j].isEscortItem = true;
            }
          } else {
            // そうでないなら随伴機フラグを解除
            for (let j = 0; j < shipPlanes.length; j += 1) {
              shipPlanes[j].isEscortItem = false;
            }
          }
          this.allPlanes = this.allPlanes.concat(shipPlanes);
          if (!this.hasPlane && this.allPlanes.find((v) => !v.data.isRecon)) {
            this.hasPlane = true;
          }
          if (!this.hasMainPlane && this.allPlanes.find((v) => !v.data.isRecon && !v.isEscortItem)) {
            this.hasMainPlane = true;
          }
        }
        if (!this.hasJet && ship.hasJet) {
          this.hasJet = true;
        }
      }
    }

    this.nightContactRate = 1 - nightContactFailureRate;

    // 艦隊索敵補正: A = ∑(艦船の素索敵值) + ∑(水偵/水爆の裝備索敵值*int(sqrt(水偵/水爆の機數)))
    // 艦隊索敵補正 = int(sqrt(A) + 0.1 * A)
    const rosA = sumShipRos + sumSPRos;
    this.fleetRosCorr = Math.floor(Math.sqrt(rosA) + 0.1 * rosA);

    this.airPower = this.fullAirPower;

    const speeds = enabledShips.map((v) => v.speed);
    if (!speeds.length) {
      this.fleetSpeed = '';
    } else if (speeds.every((v) => v >= 20)) {
      this.fleetSpeed = '最速';
    } else if (speeds.every((v) => v >= 15)) {
      this.fleetSpeed = '高速+';
    } else if (speeds.every((v) => v >= 10)) {
      this.fleetSpeed = '高速';
    } else if (speeds.every((v) => v === 5)) {
      this.fleetSpeed = '低速統一';
    } else {
      this.fleetSpeed = '低速';
    }

    // 対空砲火情報を更新
    const priorities = Const.ANTI_AIR_CUT_IN_PRIORITIES;
    this.allAntiAirCutIn.sort((a, b) => {
      const indexA = priorities.indexOf(a.id);
      const indexB = priorities.indexOf(b.id);
      return (indexA >= 0 ? indexA : 99) - (indexB >= 0 ? indexB : 99);
    });

    // 対空砲火情報更新
    this.shootDownList = [];
    this.shootDownListAirRaid = [];
    let sum = 1;
    let border = 0;
    for (let i = 0; i < this.allAntiAirCutIn.length; i += 1) {
      const cutIn = this.allAntiAirCutIn[i];
      const rate = sum * cutIn.rate;
      sum -= rate;
      border += rate;

      this.shootDownList.push(new ShootDownInfo(enabledShips, false, this.isUnion, cutIn, border, formation));
      this.shootDownListAirRaid.push(new ShootDownInfo(enabledShips, false, this.isUnion, cutIn, border, formation, true));
    }
    // 対空CI不発データを挿入
    const noCutinData = new ShootDownInfo(enabledShips, false, this.isUnion, new AntiAirCutIn(), 1, formation);
    this.shootDownList.push(noCutinData);
    this.shootDownListAirRaid.push(new ShootDownInfo(enabledShips, false, this.isUnion, new AntiAirCutIn(), 1, formation, true));

    // 画面表示用撃墜数格納
    for (let i = 0; i < enabledShips.length; i += 1) {
      enabledShips[i].fixDown = noCutinData.shootDownStatusList[0].fixDownList[i];
      enabledShips[i].rateDown = noCutinData.shootDownStatusList[0].rateDownList[i];
    }

    this.supportTypes = this.getSupportTypes();
  }

  /**
   * 引数の条件下での艦隊防空値を返却(表示値 実計算では別)
   * @param {Formation} [formation] 陣形 なければ単縦と一緒
   * @param {AvoidType} [avoid] 回避補正
   * @returns {number} 艦隊防空値
   * @memberof Fleet
   */
  public getFleetAntiAir(formation?: Formation, avoid?: AvoidType): number {
    // 各艦の艦隊対空ボーナス合計
    let sumAntiAirBonus = 0;
    const ships = this.ships.filter((v) => v.isActive && !v.isEmpty);
    const shipCount = ships.length;
    for (let i = 0; i < shipCount; i += 1) {
      // 装備フィットボーナス(対空)
      const itemBonusAntiAir = ships[i].itemBonusStatus.antiAir ?? 0;
      sumAntiAirBonus += ships[i].antiAirBonus + itemBonusAntiAir;
    }
    sumAntiAirBonus = Math.floor(sumAntiAirBonus);

    // 艦隊防空 => int(陣形補正 * 各艦の艦隊対空ボーナス合計) / ブラウザ版(1.3)
    const fleetAntiAir = Math.floor(sumAntiAirBonus * (formation ? formation.correction : 1)) / 1.3;

    if (avoid && avoid.c2 !== 1.0) {
      // 艦隊防空補正 => int(艦隊防空 * 対空射撃回避補正(艦隊防空ボーナス))
      return Math.floor(fleetAntiAir * avoid.c2);
    }
    // 最終艦隊防空補正 改式表示値
    return fleetAntiAir;
  }

  /**
   * 艦娘配列の合計索敵スコアを分岐点係数毎に取得 係数は第3引数の値だけ増やせる
   * @static
   * @param {Ship[]} ships 艦娘配列
   * @param {number} [admiralLevel=120]
   * @param {number} [cCount=4]
   * @returns {number[]}
   * @memberof Fleet
   */
  public static getScoutScore(argShips: Ship[], admiralLevel = 120, cCount = 4): number[] {
    // Σ(√艦娘の素の索敵値) + Σ{(装備の素の索敵値 + 改修係数×√★)×装備係数}×分岐点係数 - ⌈艦隊司令部Lv.×司令部補正係数⌉ + 2×(6 - 分岐点に到達した際の隻数)
    const scoutScores = [];
    const block3 = admiralLevel * 0.4;
    const ships = argShips.filter((v) => v.isActive && !v.isEmpty);

    // 分岐点係数
    for (let i = 1; i <= cCount; i += 1) {
      let block1 = 0;
      let block2 = 0;
      for (let j = 0; j < ships.length; j += 1) {
        const ship = ships[j];
        // Σ(√艦娘の素の索敵値 + 装備ボーナス)
        block1 += Math.sqrt(ship.scout + (ship.itemBonusStatus.scout ?? 0));
        // Σ{(装備の素の索敵値 + 改修係数×√★)×装備係数}×分岐点係数
        block2 += ship.itemsScout * i;
      }
      scoutScores.push(block1 + block2 - Math.ceil(block3) + (2 * (6 - ships.length)));
    }
    return scoutScores;
  }

  /**
   * 連合艦隊時の索敵を取得 司令部レベルによって変わるため画面側で呼び出す
   * @param {number} [admiralLevel=120] 司令部レベル
   * @param {number} [cCount=4] 分岐点係数の数
   * @returns {number[]}
   * @memberof Fleet
   */
  public getUnionScoutScore(admiralLevel = 120, cCount = 4): number[] {
    const mainShips = this.ships.filter((v) => !v.isEscort);
    const mainScouts = Fleet.getScoutScore(mainShips, admiralLevel, cCount);

    const escortShips = this.ships.filter((v) => v.isEscort);
    const subScouts = Fleet.getScoutScore(escortShips, admiralLevel, cCount);

    const result: number[] = [];
    for (let i = 0; i < cCount; i += 1) {
      result.push(mainScouts[i] + subScouts[i]);
    }

    return result;
  }

  /**
   * この艦隊の触接情報テーブルを取得
   * @returns {ContactRate[]}
   * @memberof Fleet
   */
  public getContactRates(isUnion = false): ContactRate[] {
    const items = isUnion ? this.allPlanes : this.allPlanes.filter((v) => !v.isEscortItem);
    return Item.getContactRates(items);
  }

  /**
   * 発生する支援種別を返却
   * @returns {number}
   * @memberof Fleet
   */
  private getSupportTypes(): number[] {
    // 駆逐2チェック
    if (this.ships.filter((v) => v.data.type === SHIP_TYPE.DD).length < 2) {
      return [SUPPORT_TYPE.NOT_FOUND_DD];
    }

    const types = this.ships.map((v) => v.data.type);
    // 空母系
    const countCA = types.filter((v) => v === SHIP_TYPE.CV || v === SHIP_TYPE.CVB || v === SHIP_TYPE.CVL).length;
    // 航空支援系A(水母 揚陸艦)
    const aerialACount = types.filter((v) => v === SHIP_TYPE.AV || v === SHIP_TYPE.LHA).length;
    // 航空支援系B(航戦 航巡 補給)
    const aerialBCount = types.filter((v) => v === SHIP_TYPE.BBV || v === SHIP_TYPE.CAV || v === SHIP_TYPE.AO || v === SHIP_TYPE.AO_2).length;
    // 砲撃支援系存在(戦艦 重巡)
    const hasFIreType = types.some((v) => v === SHIP_TYPE.BB || v === SHIP_TYPE.FBB || v === SHIP_TYPE.BBB || v === SHIP_TYPE.CA);

    if (hasFIreType && (countCA + aerialACount < 2)) {
      // 砲撃支援系存在し、空母系 + 航空支援系Aが2未満
      return [SUPPORT_TYPE.SHELLING];
    }

    // 航空支援判定
    if (countCA || aerialACount >= 2 || aerialBCount >= 2) {
      const supports = [];
      // 対潜支援判定 軽空母がいるかつ対潜艦1
      const cvlIndex = this.ships.findIndex((v) => v.data.type === SHIP_TYPE.CVL);
      // ↑の軽空母以外で対潜支援参加可能
      if (cvlIndex >= 0 && this.ships.filter((v, i) => i !== cvlIndex && v.enabledASWSupport).length) {
        supports.push(SUPPORT_TYPE.ANTI_SUBMARINE);
      } if (cvlIndex >= 0 && this.ships.filter((v) => v.data.type === SHIP_TYPE.DE).length >= 2) {
        // 海防艦 * 2でもOK
        supports.push(SUPPORT_TYPE.ANTI_SUBMARINE);
      }

      // 航空支援
      if (this.allPlanes.some((v) => v.data.isAttacker)) {
        supports.push(SUPPORT_TYPE.AIRSTRIKE);
      }

      if (supports.length) {
        return supports;
      }
      return [SUPPORT_TYPE.NONE];
    }
    return [SUPPORT_TYPE.LONG_RANGE_TORPEDO];
  }

  /**
   * 支援種別名称を返却
   * @return {*}  {string}
   * @memberof Fleet
   */
  public getSupportTypeName(): string {
    const supports = Const.SUPPORTS;
    const typeNames = this.supportTypes.map((v) => {
      const support = supports.find((w) => w.value === v);
      return support ? support.text : '-';
    });
    return typeNames.join(' / ');
  }

  /**
   * 支援種別名称を返却
   * @return {*}  {string}
   * @memberof Fleet
   */
  public getSupportTypeNames(): string[] {
    const supports = Const.SUPPORTS;
    return this.supportTypes.map((v) => {
      const support = supports.find((w) => w.value === v);
      return support ? support.text : '-';
    });
  }
}
