import AirCalcResult from '../airCalcResult';
import { AB_MODE } from '../const';
import { ContactRate } from '../interfaces/contactRate';
import Item from '../item/item';

export interface AirbaseBuilder {
  // eslint-disable-next-line no-use-before-define
  airbase?: Airbase | undefined;
  /** 装備 未指定ならshipの装備で作成 */
  items?: Item[];
  /** 基地お札 */
  mode?: number;
  /** 基地出撃戦闘番号 */
  battleTarget?: number[];
}

export default class Airbase {
  /** 装備一覧 */
  public readonly items: Item[];

  /** 基地お札 */
  public readonly mode: number;

  /** 出撃戦闘 1波 2波 */
  public readonly battleTarget: number[];

  /** 基地分散かどうか */
  public readonly isSeparate: boolean;

  /** 基地半径 */
  public readonly radius: number;

  /** 出撃制空値 */
  public readonly fullAirPower: number;

  /** 偵察機補正 -出撃時 */
  public readonly reconCorr: number;

  /** 防空制空値 */
  public readonly defenseAirPower: number;

  /** 偵察機補正 -防空時 */
  public readonly reconCorrDefense: number;

  /** ロケット戦闘機の数 */
  public readonly rocketCount: number;

  /** 噴式機ありなし */
  public readonly hasJet: boolean;

  /** 出撃時燃料消費 */
  public readonly fuel: number;

  /** 出撃時弾薬消費 */
  public readonly ammo: number;

  /** 出撃時鋼材消費 */
  public readonly steel: number;

  /** 配備時ボーキ消費 */
  public readonly bauxite: number;

  /** 超重爆補正A適用機体数 */
  public readonly superHighAirRaidTypeAItemCount: number;

  /** 超重爆補正B適用機体数 */
  public readonly superHighAirRaidTypeBItemCount: number;

  /** 超重爆補正C適用機体数 */
  public readonly superHighAirRaidTypeCItemCount: number;

  /** 計算結果の各制空状態の割合 */
  public resultWave1 = new AirCalcResult();

  /** 計算結果の各制空状態の割合 */
  public resultWave2 = new AirCalcResult();

  /** 現在搭載数における制空値 計算用 */
  public airPower: number;

  /** 集中のときでも撃墜処理を行わせたいフラグ 計算用 */
  public needShootDown = false;

  constructor(builder: AirbaseBuilder = {}) {
    if (builder.airbase) {
      this.items = builder.items !== undefined ? builder.items : builder.airbase.items.concat();
      this.mode = builder.mode !== undefined ? builder.mode : builder.airbase.mode;
      this.battleTarget = builder.battleTarget !== undefined ? builder.battleTarget : builder.airbase.battleTarget;
    } else {
      this.items = builder.items !== undefined ? builder.items : [];
      this.mode = builder.mode !== undefined ? builder.mode : AB_MODE.WAIT;
      this.battleTarget = builder.battleTarget !== undefined ? builder.battleTarget : [0, 0];
    }

    const itemCount = this.items.length;
    if (itemCount < 4) {
      for (let i = 0; i < 4 - itemCount; i += 1) {
        // 第4隊まで自動生成
        this.items.push(new Item());
      }
    }

    // 半径取得
    this.radius = this.getRadius();

    // 制空値とか
    this.fullAirPower = 0;
    this.defenseAirPower = 0;
    this.rocketCount = 0;
    this.hasJet = false;
    this.reconCorr = 1;
    this.reconCorrDefense = 1;
    this.superHighAirRaidTypeAItemCount = 0;
    this.superHighAirRaidTypeBItemCount = 0;
    this.superHighAirRaidTypeCItemCount = 0;
    this.fuel = 0;
    this.ammo = 0;
    this.steel = 0;
    this.bauxite = 0;
    this.isSeparate = this.battleTarget[0] !== this.battleTarget[1];

    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      if (item.fullSlot > 0) {
        this.fullAirPower += item.fullAirPower;
        this.defenseAirPower += item.defenseAirPower;
      }
      if (item.data.isRocket) {
        this.rocketCount += 1;
      }
      if (!this.hasJet && item.data.isJet) {
        this.hasJet = true;
      }

      // この航空隊の偵察機補正を取得
      if (this.reconCorr < item.reconCorr) {
        // 最大の補正値にする
        this.reconCorr = item.reconCorr;
      }
      if (this.reconCorrDefense < item.reconCorrDefense) {
        // 最大の補正値にする
        this.reconCorrDefense = item.reconCorrDefense;
      }

      // 超重爆A補正 => 屠龍(445) / 雷電(175) / 烈風改(333) / 飛燕244(177)
      if ([445, 175, 177, 333].includes(item.data.id)) {
        this.superHighAirRaidTypeAItemCount += 1;
      }

      // 超重爆補正B該当機の数加算 => 紫電343(263) / Fw190(354)
      if ([263, 354].includes(item.data.id)) {
        this.superHighAirRaidTypeBItemCount += 1;
      }

      // 超重爆補正C該当機の数加算 => 烈風改(三五二/熟練)(334) / キ96(452) / 屠龍丙(446)
      if ([334, 452, 446].includes(item.data.id)) {
        this.superHighAirRaidTypeCItemCount += 1;
      }

      this.fuel += item.fuel;
      this.ammo += item.ammo;
      this.steel += item.steel;
      this.bauxite += item.bauxite;
    }

    // 補正値で更新
    this.fullAirPower = Math.floor(this.fullAirPower * this.reconCorr);
    this.defenseAirPower = Math.floor(this.defenseAirPower * this.reconCorrDefense);
    this.airPower = this.fullAirPower;

    // 装備なんもないなら自動で待機にする
    if (!this.items.some((v) => v.data.id > 0)) {
      this.mode = AB_MODE.WAIT;
    }
  }

  /**
   * 有効な装備のみ取得
   * @readonly
   * @type {Item[]}
   * @memberof Airbase
   */
  public get enabledItems(): Item[] {
    return this.items.filter((v) => v.data.id > 0);
  }

  /**
   * 航空隊の半径を返却
   * @readonly
   * @type {number}
   * @memberof Airbase
   */
  private getRadius(): number {
    let maxRange = 999;
    let minRange = 999;
    let maxLos = 1;
    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      if (item.data.id) {
        // 最も短い半径を更新
        minRange = item.data.radius < minRange ? item.data.radius : minRange;

        // 対潜哨戒機による半径最大制限
        if (item.data.isAswPlane && item.data.radius < maxRange) {
          maxRange = item.data.radius;
        }

        // 偵察機の中で最も長い半径を取得
        if (item.data.isRecon) {
          maxLos = maxLos < item.data.radius ? item.data.radius : maxLos;
        }
      }
    }

    let radius = minRange === 999 ? 0 : minRange;

    if (maxLos < 999 && maxLos > minRange) {
      // 偵察機による半径拡張
      radius = Math.round(minRange + Math.min(Math.sqrt(maxLos - minRange), 3));
    }

    return Math.min(radius, maxRange);
  }

  /**
   * 計算で減衰した各種値を戻す 計算用
   * @memberof Airbase
   */
  public static supply(airbase: Airbase): void {
    airbase.airPower = airbase.fullAirPower;
    for (let i = 0; i < airbase.items.length; i += 1) {
      const item = airbase.items[i];
      item.deathRate += item.slot === 0 ? 1 : 0;
      Item.supply(airbase.items[i]);
    }
  }

  /**
   * この艦隊の触接情報テーブルを取得
   * @returns {ContactRate[]}
   * @memberof Fleet
   */
  public getContactRates(): ContactRate[] {
    return Item.getContactRates(this.items);
  }
}
