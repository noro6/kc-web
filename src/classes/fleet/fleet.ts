import Ship from './ship';
import Const, { AvoidType, Formation } from '../const';
import Item from '../item/item';
import AirCalcResult from '../airCalcResult';
import AntiAirCutIn from '../aerialCombat/antiAirCutIn';
import ShootDownInfo from '../aerialCombat/shootDownInfo';
import { ContactRate } from '../interfaces/contactRate';

export interface FleetBuilder {
  // eslint-disable-next-line no-use-before-define
  fleet?: Fleet | undefined;
  /** 敵一覧 未指定ならfleetの敵一覧で作成 */
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

  /** 輸送量 */
  public readonly tp: number;

  /** 航空戦が可能な機体ありなし */
  public readonly hasPlane: boolean;

  /** 噴式機ありなし */
  public readonly hasJet: boolean;

  /** 艦隊防空値(ブラウザ版表示値) */
  public readonly fleetAntiAir: number;

  /** この艦隊の全艦載機装備 搭載数1以上 計算用 */
  public readonly allPlanes: Item[];

  /** stage2 撃墜テーブル */
  public readonly shootDownList: ShootDownInfo[];

  /** 発動可能対空CI全種 */
  public readonly allAntiAirCutIn: AntiAirCutIn[];

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
      this.formation = builder.formation !== undefined ? builder.formation : builder.fleet.formation;
      this.isUnion = builder.isUnion !== undefined ? builder.isUnion : builder.fleet.isUnion;
    } else {
      this.ships = builder.ships ? builder.ships.concat() : [];
      this.formation = builder.formation !== undefined ? builder.formation : 1;
      this.isUnion = builder.isUnion !== undefined ? builder.isUnion : false;

      if (this.ships.length === 0) {
        // 0隻だった場合は空の艦娘を1隻つっこむ
        this.ships.push(new Ship());
      }
    }

    // 計算により算出するステータス
    const formation = Const.FORMATIONS.find((v) => v.value === this.formation);
    this.fleetAntiAir = this.getFleetAntiAir(formation);
    this.tp = 0;
    this.fullAirPower = 0;
    this.hasJet = false;
    this.hasPlane = false;

    this.allPlanes = [];

    const generalCutin: AntiAirCutIn[] = [];
    const specialCutin: AntiAirCutIn[] = [];
    const enabledShips = this.ships.filter((v) => v.isActive && !v.isEmpty);

    for (let i = 0; i < enabledShips.length; i += 1) {
      const ship = enabledShips[i];
      if (ship.isActive && !ship.isEmpty) {
        this.fullAirPower += ship.fullAirPower;
        this.tp += ship.tp;

        for (let j = 0; j < ship.antiAirCutIn.length; j += 1) {
          const cutIn = ship.antiAirCutIn[j];
          // 対空カットインを振り分け
          if (cutIn.id >= 34 && cutIn.id !== 36) specialCutin.push(cutIn);
          else generalCutin.push(cutIn);
        }

        const shipPlanes = ship.items.filter((v) => v.isPlane && v.fullSlot > 0);
        if (shipPlanes.length) {
          // 連合かつ第2艦隊なら艦載機の随伴機フラグを挙げる
          if (this.isUnion && ship.isEscort) {
            for (let j = 0; j < shipPlanes.length; j += 1) {
              shipPlanes[j].isEscortItem = true;
            }
          }
          this.allPlanes = this.allPlanes.concat(shipPlanes);
          if (!this.hasPlane && this.allPlanes.find((v) => !v.isRecon)) {
            this.hasPlane = true;
          }
        }
        if (!this.hasJet && ship.hasJet) {
          this.hasJet = true;
        }
      }
    }

    this.airPower = this.fullAirPower;

    // 対空砲火情報を更新
    // 特殊CIソート => (性能順, 38種以降)
    specialCutin.sort((a, b) => (a.rateCorr !== b.rateCorr ? b.rateCorr - a.rateCorr : b.fixCorrA - a.fixCorrA));
    // 通常CIソート => (種別の降順)
    generalCutin.sort((a, b) => b.id - a.id);
    // 特殊CIを最優先とし、後続に通常CIを格納した対空CI配列 これで対空CI確定
    this.allAntiAirCutIn = specialCutin.concat(generalCutin);

    // 対空砲火情報更新 todo 陣形 空襲情報
    this.shootDownList = [];
    let sum = 1;
    let border = 0;
    for (let i = 0; i < this.allAntiAirCutIn.length; i += 1) {
      const cutIn = this.allAntiAirCutIn[i];
      const rate = sum * cutIn.rate;
      sum -= rate;
      border += rate;

      this.shootDownList.push(new ShootDownInfo(enabledShips, false, this.isUnion, cutIn, border));
    }
    // 対空CI不発データを挿入
    this.shootDownList.push(new ShootDownInfo(enabledShips, false, this.isUnion, new AntiAirCutIn(), 1));
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
      sumAntiAirBonus += ships[i].antiAirBonus;
    }
    sumAntiAirBonus = Math.floor(sumAntiAirBonus);

    // 艦隊防空 => int(陣形補正 * 各艦の艦隊対空ボーナス合計) / ブラウザ版(1.3)
    const fleetAntiAir = Math.floor(sumAntiAirBonus * (formation ? formation.correction : 1)) / 1.3;

    if (avoid && avoid.c2 !== 1.0) {
      // 艦隊防空補正 => int(艦隊防空 * 対空射撃回避補正(艦隊防空ボーナス))
      return 2 * Math.floor(fleetAntiAir * avoid.c2);
    }
    // 最終艦隊防空補正 ブラウザ版式表示値
    return 2 * fleetAntiAir;
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
        // Σ(√艦娘の素の索敵値)
        block1 += Math.sqrt(ship.scout + ship.bonusScout);
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
    let sumCotactValue = 0;
    // 補正率別 触接選択率テーブル[ 0:確保時, 1:優勢時, 2:劣勢時 ]
    const contact120 = [[] as number[], [] as number[], [] as number[]];
    const contact117 = [[] as number[], [] as number[], [] as number[]];
    const contact112 = [[] as number[], [] as number[], [] as number[]];

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (item.isRecon) {
        sumCotactValue += Math.floor(item.data.scout * Math.sqrt(item.fullSlot));
      }
      // 制空状態3つループ
      for (let j = 0; j < 3; j += 1) {
        if (item.data.accuracy >= 3) contact120[j].push(item.contactSelectRates[j]);
        else if (item.data.accuracy === 2) contact117[j].push(item.contactSelectRates[j]);
        else contact112[j].push(item.contactSelectRates[j]);
      }
    }
    // 触接開始率 = int(sum(索敵 * sqrt(搭載)) + 1) / (70 - 15 * c)
    const a = Math.floor(sumCotactValue) + 1;
    const contactStartRate = [
      Math.min(a / 25, 1),
      Math.min(a / 40, 1),
      Math.min(a / 55, 1),
    ];

    // 実触接率 = [ 0:確保, 1:優勢, 2:劣勢 ]
    const actualContactRate = [
      { contact120: 0, contact117: 0, contact112: 0 },
      { contact120: 0, contact117: 0, contact112: 0 },
      { contact120: 0, contact117: 0, contact112: 0 },
    ];
    let sum = 1;
    // 制空状態3つループ
    for (let i = 0; i < 3; i += 1) {
      // 開始触接率
      let tmpRate = contactStartRate[i];

      // 補正のデカいものから優先的に
      if (contact120[i].length) {
        sum = 1;
        // 全て選択されない確率の導出
        for (let j = 0; j < contact120[i].length; j += 1) {
          // 発動しない率
          sum *= (1 - contact120[i][j]);
        }

        // 選択される率
        const rate = tmpRate * (1 - sum);
        actualContactRate[i].contact120 = rate;
        tmpRate -= rate;
      }

      if (contact117[i].length) {
        sum = 1;
        for (let j = 0; j < contact117[i].length; j += 1) {
          sum *= (1 - contact117[i][j]);
        }
        const rate = tmpRate * (1 - sum);
        actualContactRate[i].contact117 = rate;
        tmpRate -= rate;
      }

      if (contact112[i].length) {
        sum = 1;
        for (let j = 0; j < contact112[i].length; j += 1) {
          sum *= (1 - contact112[i][j]);
        }
        const rate = tmpRate * (1 - sum);
        actualContactRate[i].contact112 = rate;
      }
    }

    const contactTable = [
      {
        startRate: 0, contact120: 0, contact117: 0, contact112: 0, sumRate: 0,
      },
      {
        startRate: 0, contact120: 0, contact117: 0, contact112: 0, sumRate: 0,
      },
      {
        startRate: 0, contact120: 0, contact117: 0, contact112: 0, sumRate: 0,
      },
    ];
    // 制空状態3つループ
    for (let i = 0; i < 3; i += 1) {
      const rate = actualContactRate[i];
      const sumRate = rate.contact120 + rate.contact117 + rate.contact112;

      // 開始触接率
      contactTable[i].startRate = 100 * contactStartRate[i];
      // 順に120% 117% 112% の選択率
      contactTable[i].contact120 = 100 * rate.contact120;
      contactTable[i].contact117 = 100 * rate.contact117;
      contactTable[i].contact112 = 100 * rate.contact112;
      // 最終的な合計の触接率
      contactTable[i].sumRate = Math.min(100 * sumRate, 100);
    }
    return contactTable;
  }
}
