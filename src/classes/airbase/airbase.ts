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

  /** 基地半径 */
  public readonly range: number;

  /** 出撃制空値 */
  public readonly fullAirPower: number;

  /** 偵察機補正 -出撃時 */
  public readonly reconCorr: number;

  /** 防空制空値 */
  public readonly defenseAirPower: number;

  /** 偵察機補正 -防空時 */
  public readonly reconCorrDeff: number;

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

  /** 計算結果の各制空状態の割合 */
  public resultWave1 = new AirCalcResult();

  /** 計算結果の各制空状態の割合 */
  public resultWave2 = new AirCalcResult();

  /** 現在搭載数における制空値 計算用 */
  public airPower: number;

  /** 補給処理が要るかどうか 計算用 */
  public needSupply = false;

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
    this.range = this.getRange();

    // 制空値とか
    this.fullAirPower = 0;
    this.defenseAirPower = 0;
    this.rocketCount = 0;
    this.hasJet = false;
    this.reconCorr = 1;
    this.reconCorrDeff = 1;
    this.fuel = 0;
    this.ammo = 0;
    this.steel = 0;
    this.bauxite = 0;
    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      if (item.fullSlot > 0) {
        this.fullAirPower += item.fullAirPower;
        this.defenseAirPower += item.defenseAirPower;
      }
      if (item.isRocket) {
        this.rocketCount += 1;
      }
      if (!this.hasJet && item.isJet) {
        this.hasJet = true;
      }

      // この航空隊の偵察機補正を取得
      if (this.reconCorr < item.reconCorr) {
        // 最大の補正値にする
        this.reconCorr = item.reconCorr;
      }
      if (this.reconCorrDeff < item.reconCorrDeff) {
        // 最大の補正値にする
        this.reconCorrDeff = item.reconCorrDeff;
      }

      this.fuel += item.fuel;
      this.ammo += item.ammo;
      this.steel += item.steel;
      this.bauxite += item.bauxite;
    }

    // 補正値で更新
    this.fullAirPower = Math.floor(this.fullAirPower * this.reconCorr);
    this.defenseAirPower = Math.floor(this.defenseAirPower * this.reconCorrDeff);
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
  private getRange(): number {
    let minRange = 999;
    let maxLos = 1;
    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      if (item.data.id) {
        // 最も短い半径
        minRange = item.data.radius < minRange ? item.data.radius : minRange;

        // 偵察機の中でで最も長い半径を取得
        if (item.isRecon) {
          maxLos = maxLos < item.data.radius ? item.data.radius : maxLos;
        }
      }
    }

    if (maxLos < 999 && maxLos > minRange) {
      // 偵察機による半径拡張
      return Math.round(minRange + Math.min(Math.sqrt(maxLos - minRange), 3));
    }
    return minRange === 999 ? 0 : minRange;
  }

  /**
   * 計算で減衰した各種値を戻す 計算用
   * @memberof Airbase
   */
  public static supply(airbase: Airbase): void {
    airbase.airPower = airbase.fullAirPower;
    for (let i = 0; i < airbase.items.length; i += 1) {
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
