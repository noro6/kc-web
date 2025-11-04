import Enemy from './enemy';
import Const, {
  AvoidType, CELL_TYPE, Formation,
} from '../const';
import Item from '../item/item';
import CommonCalc from '../commonCalc';
import ShootDownInfo, { ShootDownStatus } from '../aerialCombat/shootDownInfo';
import AntiAirCutIn from '../aerialCombat/antiAirCutIn';
import { ContactRate } from '../interfaces/contactRate';

export interface EnemyFleetBuilder {
  // eslint-disable-next-line no-use-before-define
  fleet?: EnemyFleet | undefined;
  /** 敵一覧 未指定ならfleetの敵一覧で作成 */
  enemies?: Enemy[];
  /** 陣形 未指定ならfleetの陣形で作成 */
  formation?: number;
  /** 戦闘形式 未指定ならfleetの戦闘形式で作成 */
  cellType?: number;
  /** 半径 未指定ならfleetの半径で作成 */
  radius?: number[];
  /** 海域 もっぱら基地のエラーのため */
  area?: number;
  /** セル名称 */
  nodeName?: string;
  /** 味方の陣形 未指定ならfleetの陣形で作成 */
  mainFleetFormation?: number;
}

export default class EnemyFleet {
  /** 敵一覧 */
  public readonly enemies: Enemy[];

  /** 陣形id */
  public readonly formation: number;

  /** 陣形 -このマスで選択する陣形 */
  public readonly mainFleetFormation: number;

  /** 戦闘形式 */
  public readonly cellType: number;

  /** 航空戦発生しない戦闘形式 (夜戦マス) */
  public readonly isSkipAerialCombatCell: boolean;

  /** 空襲マス */
  public readonly isAirRaidCell: boolean;

  /** 航空戦マス */
  public readonly isAerialCombatCell: boolean;

  /** 通常戦闘マス (通常 / 連合マス) */
  public readonly isSurfaceCell: boolean;

  /** 連合艦隊かそうでないか */
  public readonly isUnion: boolean;

  /** 半径 */
  public readonly radius: number[];

  /** 海域 xxy形式(x:海域 y:マップ) 一応400以上がイベント海域 (例: 1-1 => 11, E-7 => 407) */
  public readonly area: number;

  /** セル名称 */
  public readonly nodeName: string;

  /** 全員潜水艦かどうか */
  public readonly isAllSubmarine: boolean;

  /** 全員PTかどうか */
  public readonly isAllPT: boolean;

  /** 対潜支援が実行できるマスであるかどうか */
  public readonly isAswSupportCell: boolean;

  /** 艦載機を保持しているかどうか */
  public readonly hasPlane: boolean;

  /** 艦隊防空値 */
  public readonly fleetAntiAir: number;

  /** 制空値 -減衰なし最大 */
  public readonly fullAirPower: number;

  /** 制空値 -減衰なし各種ボーダー */
  public readonly fullBorders: number[];

  /** 主力艦制空値 */
  public readonly mainAirPower: number;

  /** 随伴艦制空値 */
  public readonly escortAirPower: number;

  /** 制空値【対基地】-減衰なし最大 */
  public readonly fullAirbaseAirPower: number;

  /** 制空値 -減衰なし各種ボーダー */
  public readonly fullAirbaseBorders: number[];

  /** 主力艦制空値【対基地】 */
  public readonly mainAirbaseAirPower: number;

  /** 随伴艦制空値【対基地】 */
  public readonly escortAirbaseAirPower: number;

  /** 敵主力艦隊一覧 通常艦隊もここ(空の敵艦が除かれている) */
  public readonly mainEnemies: Enemy[];

  /** 敵随伴艦隊一覧(空の敵艦が除かれている) */
  public readonly escortEnemies: Enemy[];

  /** stage2 対空CI不発時撃墜テーブル 基本スペック */
  public readonly noCutInStage2: ShootDownStatus[];

  /** stage2 撃墜テーブル 表示用 基本スペック */
  public readonly shootDownList: ShootDownInfo[];

  /** stage2 対空CI不発時撃墜テーブル 本隊航空戦前に沈むと仮定されている敵がいる場合 */
  public readonly mainPhaseNoCutInStage2: ShootDownStatus[];

  /** stage2 撃墜テーブル 本隊航空戦用 本隊航空戦前に沈むと仮定されている敵がいる場合 */
  public readonly mainPhaseShootDownList: ShootDownInfo[];

  /** 発動可能対空CI全種 */
  public readonly allAntiAirCutIn: AntiAirCutIn[];

  /** 未確定の敵がいるかどうか */
  public readonly existUnknownEnemy: boolean;

  /** 制空値 計算用 */
  public airPower: number;

  /** 制空値【対基地】 計算用 */
  public airbaseAirPower: number;

  /** 補給処理が要るかどうか 計算用 */
  public needSupply = false;

  /** 敵の装備艦載機一覧 計算用 */
  public readonly allPlanes: { enemyIndex: number, item: Item }[];

  /**
   * 海域id
   * @readonly
   * @type {number}
   * @memberof EnemyFleet
   */
  public get world(): number {
    return Math.floor(this.area / 10);
  }

  /**
   * map番号
   * @readonly
   * @type {number}
   * @memberof EnemyFleet
   */
  public get map(): number {
    return this.area % 10;
  }

  constructor(builder: EnemyFleetBuilder = {}) {
    if (builder.fleet) {
      // builderよりそのままインスタンスを引継ぎ
      this.enemies = builder.enemies ? builder.enemies.concat() : builder.fleet.enemies.concat();
      this.formation = builder.formation !== undefined ? builder.formation : builder.fleet.formation;
      this.mainFleetFormation = builder.mainFleetFormation !== undefined ? builder.mainFleetFormation : builder.fleet.mainFleetFormation;
      this.cellType = builder.cellType !== undefined ? builder.cellType : builder.fleet.cellType;
      this.radius = builder.radius !== undefined ? builder.radius : builder.fleet.radius;
      this.area = builder.area !== undefined ? builder.area : builder.fleet.area;
      this.nodeName = builder.nodeName !== undefined ? builder.nodeName : builder.fleet.nodeName;

      if (!this.radius) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const oldRadius = (builder.fleet as unknown as any).range;
        if (oldRadius) {
          this.radius = [oldRadius];
        }
      }
    } else {
      this.enemies = builder.enemies ? builder.enemies.concat() : [];
      this.formation = builder.formation !== undefined ? builder.formation : 1;
      this.mainFleetFormation = builder.mainFleetFormation !== undefined ? builder.mainFleetFormation : 1;
      this.cellType = builder.cellType !== undefined ? builder.cellType : 1;
      this.radius = builder.radius !== undefined ? builder.radius : [0];
      this.area = builder.area !== undefined ? builder.area : 0;
      this.nodeName = builder.nodeName !== undefined ? builder.nodeName : '';
    }

    if (!(this.radius instanceof Array)) {
      if (+this.radius) {
        this.radius = [+this.radius];
      } else {
        this.radius = [0];
      }
    }

    const enemyCount = this.enemies.length;
    if (enemyCount < 6) {
      // 6隻までは増やす
      for (let i = 0; i < 6 - enemyCount; i += 1) {
        this.enemies.push(new Enemy());
      }
    }

    // 航空戦のスキップ設定
    this.isSkipAerialCombatCell = this.cellType === CELL_TYPE.NIGHT || this.cellType === CELL_TYPE.RADAR;
    this.isAirRaidCell = this.cellType === CELL_TYPE.AIR_RAID;
    this.isAerialCombatCell = this.cellType === CELL_TYPE.AERIAL_COMBAT;
    this.isSurfaceCell = this.cellType === CELL_TYPE.NORMAL || this.cellType === CELL_TYPE.GRAND || this.cellType === CELL_TYPE.AERIAL_COMBAT;
    this.isAswSupportCell = false;

    // 計算により算出するステータス
    this.isAllSubmarine = this.enemies.some((v) => v.data.id);
    this.isAllPT = this.enemies.some((v) => v.data.id);
    this.hasPlane = false;
    this.isUnion = this.cellType === CELL_TYPE.GRAND;
    const formation = Const.FORMATIONS.find((v) => v.value === this.formation) as Formation;
    this.fleetAntiAir = this.getFleetAntiAir(formation);

    // 制空値合計
    this.fullAirPower = 0;
    this.mainAirPower = 0;
    this.escortAirPower = 0;
    this.fullAirbaseAirPower = 0;
    this.mainAirbaseAirPower = 0;
    this.escortAirbaseAirPower = 0;

    this.allPlanes = [];
    this.mainEnemies = [];
    this.escortEnemies = [];
    const enabledEnemies = this.enemies.filter((v) => v.data.id > 0);
    this.allAntiAirCutIn = [];
    this.existUnknownEnemy = false;

    // stage2に計上する敵一覧
    const enabledStage2Enemies = [];

    for (let i = 0; i < enabledEnemies.length; i += 1) {
      const enemy = enabledEnemies[i];
      this.fullAirPower += enemy.fullAirPower;
      this.fullAirbaseAirPower += enemy.fullLBAirPower;

      // 非対潜空襲マスの場合 or 対潜空襲マスかつ潜水艦の場合 => いいかえれば、対潜空襲マスで潜水艦以外だったらダメ
      if (this.cellType !== CELL_TYPE.AIR_SUPPORTED_ASW || enemy.isSubmarine) {
        // stage2撃墜が可能
        enabledStage2Enemies.push(enemy);
        this.allAntiAirCutIn = this.allAntiAirCutIn.concat(enemy.antiAirCutIn);
      }

      if (!enemy.isEscort) {
        this.mainAirPower += enemy.fullAirPower;
        this.mainAirbaseAirPower += enemy.fullLBAirPower;
        this.mainEnemies.push(enemy);
      } else {
        this.escortAirPower += enemy.fullAirPower;
        this.escortAirbaseAirPower += enemy.fullLBAirPower;
        this.escortEnemies.push(enemy);
      }

      if (this.isAllSubmarine && !enemy.isSubmarine) {
        this.isAllSubmarine = false;
      }

      // 潜水艦が一隻でも含まれていれば
      if (!this.isAswSupportCell && enemy.isSubmarine) {
        // 対潜支援実行可能マスとする
        this.isAswSupportCell = true;
      }

      if (this.isAllPT && enemy.data.name.indexOf('PT') < 0 && enemy.data.name.indexOf('Schnellboot') < 0) {
        this.isAllPT = false;
      }

      // 艦載機を持つ敵のみ格納
      if (enemy.hasPlane) {
        const planes = enemy.items.filter((v) => v.data.isPlane);
        for (let j = 0; j < planes.length; j += 1) {
          planes[j].isEscortItem = this.isUnion && enemy.isEscort;
          planes[j].disabledItem = enemy.disabledMainAerialPhase;
          this.allPlanes.push({ enemyIndex: i, item: planes[j] });
        }
        if (!this.hasPlane && planes.find((v) => !v.data.isRecon)) {
          this.hasPlane = true;
        }
      }

      if (!this.existUnknownEnemy && enemy.data.isUnknown) {
        this.existUnknownEnemy = true;
      }
    }

    this.airPower = this.fullAirPower;
    this.airbaseAirPower = this.fullAirbaseAirPower;
    this.fullBorders = CommonCalc.getAirStatusBorder(this.fullAirPower);
    this.fullAirbaseBorders = CommonCalc.getAirStatusBorder(this.fullAirbaseAirPower);

    // 対空砲火情報を更新
    const priorities = Const.ANTI_AIR_CUT_IN_PRIORITIES;
    this.allAntiAirCutIn.sort((a, b) => {
      const indexA = priorities.indexOf(a.id);
      const indexB = priorities.indexOf(b.id);
      return (indexA >= 0 ? indexA : 99) - (indexB >= 0 ? indexB : 99);
    });

    // 対空砲火情報更新
    this.shootDownList = [];
    this.mainPhaseShootDownList = [];

    // 本隊航空戦で間引く敵indexを列挙
    const disabledIndex: number[] = [];
    for (let i = 0; i < enabledEnemies.length; i += 1) {
      if (enabledEnemies[i].disabledMainAerialPhase) {
        disabledIndex.push(i);
      }
    }

    let sum = 1;
    let border = 0;
    for (let i = 0; i < this.allAntiAirCutIn.length; i += 1) {
      const cutIn = this.allAntiAirCutIn[i];
      const rate = sum * cutIn.rate;
      sum -= rate;
      border += rate;

      this.shootDownList.push(new ShootDownInfo(enabledStage2Enemies, true, this.isUnion, cutIn, border, formation));

      const mainPhase = new ShootDownInfo(enabledStage2Enemies, true, this.isUnion, cutIn, border, formation);
      if (disabledIndex.length) {
        // 間引く対象indexが存在しているなら撃墜テーブルから間引く
        mainPhase.maxRange -= disabledIndex.length;
        for (let j = 0; j < Const.AVOID_TYPE.length; j += 1) {
          const list = mainPhase.shootDownStatusList[j];
          list.antiAirWeightList = list.antiAirWeightList.filter((v, idx) => !disabledIndex.includes(idx));
          list.fixDownList = list.fixDownList.filter((v, idx) => !disabledIndex.includes(idx));
          list.rateDownList = list.rateDownList.filter((v, idx) => !disabledIndex.includes(idx));
          list.minimumDownList = list.minimumDownList.filter((v, idx) => !disabledIndex.includes(idx));
        }
      }
      this.mainPhaseShootDownList.push(mainPhase);
    }
    // 対空CI不発データを挿入
    const noCutInStage2 = new ShootDownInfo(enabledStage2Enemies, true, this.isUnion, new AntiAirCutIn(), 1, formation);
    this.shootDownList.push(noCutInStage2);
    this.noCutInStage2 = noCutInStage2.shootDownStatusList;

    // 間引いた分も作る
    const mainPhaseNoCutInStage2 = new ShootDownInfo(enabledStage2Enemies, true, this.isUnion, new AntiAirCutIn(), 1, formation);
    if (disabledIndex.length) {
      // 間引く対象indexが存在しているなら撃墜テーブルから間引く
      mainPhaseNoCutInStage2.maxRange -= disabledIndex.length;
      for (let j = 0; j < Const.AVOID_TYPE.length; j += 1) {
        const list = mainPhaseNoCutInStage2.shootDownStatusList[j];
        list.antiAirWeightList = list.antiAirWeightList.filter((v, idx) => !disabledIndex.includes(idx));
        list.fixDownList = list.fixDownList.filter((v, idx) => !disabledIndex.includes(idx));
        list.rateDownList = list.rateDownList.filter((v, idx) => !disabledIndex.includes(idx));
        list.minimumDownList = list.minimumDownList.filter((v, idx) => !disabledIndex.includes(idx));
      }
    }
    this.mainPhaseShootDownList.push(mainPhaseNoCutInStage2);
    this.mainPhaseNoCutInStage2 = mainPhaseNoCutInStage2.shootDownStatusList;
  }

  /**
   * 引数の条件下での艦隊防空値を返却
   * @param {Formation} [formation] 陣形 なければ単縦と一緒
   * @param {AvoidType} [avoid] 回避補正
   * @returns {number} 艦隊防空値
   * @memberof EnemyFleet
   */
  public getFleetAntiAir(formation?: Formation, avoid?: AvoidType): number {
    // 各艦の艦隊対空ボーナス合計
    let sumAntiAirBonus = 0;
    const enemyCount = this.enemies.length;
    for (let i = 0; i < enemyCount; i += 1) {
      sumAntiAirBonus += this.enemies[i].antiAirBonus;
    }
    sumAntiAirBonus = Math.floor(sumAntiAirBonus);

    // 艦隊防空 => int(陣形補正 * 各艦の艦隊対空ボーナス合計)
    const fleetAntiAir = Math.floor(sumAntiAirBonus * (formation ? formation.correction : 1));

    if (avoid && avoid.c2 !== 1.0) {
      // 艦隊防空補正 => int(艦隊防空 * 対空射撃回避補正(艦隊防空ボーナス))
      return Math.floor(fleetAntiAir * avoid.c2);
    }

    // 艦隊防空補正 => 艦隊防空
    return fleetAntiAir;
  }

  /**
   * この艦隊の触接情報テーブルを取得
   * @returns {ContactRate[]}
   * @memberof Fleet
   */
  public getContactRates(isUnion = false): ContactRate[] {
    const items = isUnion ? this.allPlanes.map((v) => v.item) : this.allPlanes.map((v) => v.item).filter((v) => !v.isEscortItem);
    return Item.getContactRates(items);
  }
}
