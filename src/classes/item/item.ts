import Const from '../const';
import ItemMaster from './itemMaster';

export interface ItemBuilder {
  // eslint-disable-next-line no-use-before-define
  item?: Item | undefined;
  /** 装備マスタ情報 未指定ならitem内のdataで作成 */
  master?: ItemMaster;
  /** 搭載数 未指定ならitemの搭載数で作成 */
  slot?: number;
  /** 熟練度 未指定ならitemの熟練度で作成 */
  level?: number;
  /** 改修値 未指定ならitemの改修値で作成 */
  remodel?: number;
}

export default class Item {
  public readonly data: ItemMaster;

  /** 熟練度 */
  public readonly level: number;

  /** 改修値 */
  public readonly remodel: number;

  /** 搭載数 */
  public readonly fullSlot: number;

  /** 改修値による対空値増分 */
  public readonly bonusAntiAir: number;

  /** 改修値による索敵値増分 */
  public readonly bonusScout: number;

  /** 熟練度による制空値増分 */
  public readonly bonusAirPower: number;

  /** 装備索敵 計算で利用 (装備の素の索敵値 + 改修係数×√★)×装備係数 */
  public readonly actualScout: number;

  /** 装備加重対空値 */
  public readonly antiAirWeight: number;

  /** 装備防空ボーナス */
  public readonly antiAirBonus: number;

  /** 制空値計算時に適用される実対空値 */
  public readonly actualAntiAir: number;

  /** 制空値計算時に適用される実対空値(防空時) */
  public readonly actualDefenseAntiAir: number;

  /** 装備制空値 */
  public readonly fullAirPower: number;

  /** 装備制空値(防空時) */
  public readonly defenseAirPower: number;

  /** 輸送量 */
  public readonly tp: number;

  /** 偵察機補正 -防空時 */
  public readonly reconCorr: number;

  /** 偵察機補正 -防空時 */
  public readonly reconCorrDeff: number;

  /** 航空機フラグ */
  public readonly isPlane: boolean;

  /** 艦戦フラグ */
  public readonly isFighter: boolean;

  /** 攻撃機フラグ */
  public readonly isAttacker: boolean;

  /** 噴式機フラグ */
  public readonly isJet: boolean;

  /** ロケット戦闘機フラグ */
  public readonly isRocket: boolean;

  /** 偵察機フラグ */
  public readonly isRecon: boolean;

  /** 大型陸上機フラグ */
  public readonly isShinzan: boolean;

  /** 最大搭載数から1までの制空値を計算し終えた配列 機体のみ有効 計算用 */
  private readonly calculatedAirPower: number[];

  /** 現在搭載数における制空値 計算用 */
  public airPower: number;

  /** 現在搭載数 計算用 */
  public slot: number;

  constructor(builder: ItemBuilder = {}) {
    if (builder.item) {
      // ItemBuilderより生成 Itemインスタンスを引継ぎ
      this.data = builder.master ? builder.master : builder.item.data;
      this.fullSlot = builder.slot !== undefined ? builder.slot : builder.item.fullSlot;
      this.remodel = builder.remodel !== undefined ? builder.remodel : builder.item.remodel;
      this.level = builder.level !== undefined ? builder.level : builder.item.level;
    } else {
      this.data = builder.master ? builder.master : new ItemMaster();
      this.fullSlot = builder.slot !== undefined ? builder.slot : 0;
      this.remodel = builder.remodel !== undefined ? builder.remodel : 0;
      this.level = builder.level !== undefined ? builder.level : 0;
    }
    this.isPlane = Const.PLANE_TYPES.includes(this.data.apiTypeId);
    this.isFighter = Const.FIGHTERS.includes(this.data.apiTypeId);
    this.isAttacker = Const.ATTACKERS.includes(this.data.apiTypeId);
    this.isRecon = Const.RECONNAISSANCES.includes(this.data.apiTypeId);
    this.isRocket = Const.ROCKET.includes(this.data.id);
    this.isShinzan = this.data.apiTypeId === 53;
    this.isJet = this.data.apiTypeId === 57;

    // 計算により算出するステータス
    this.bonusAirPower = this.getBonusAirPower();
    this.antiAirWeight = this.getAntiAirWeight();
    this.bonusAntiAir = this.getBonusAntiAir();
    this.bonusScout = this.getBonusScout();
    this.antiAirBonus = this.getAntiAirBonus();
    this.tp = this.getTransportPower();
    this.reconCorr = this.getReconCorr();
    this.reconCorrDeff = this.getReconCorrDeff();

    // (装備の素の索敵値 + 改修係数×√★)×装備係数
    this.actualScout = (this.data.scout + this.bonusScout) * this.getItemScoutCoefficient();
    this.actualAntiAir = 0;
    this.actualDefenseAntiAir = 0;

    if (this.isPlane) {
      // 出撃対空値 = 対空値 + 1.5 * 迎撃 + ボーナス対空値(改修値による)
      this.actualAntiAir = this.data.antiAir + 1.5 * this.data.interception + this.bonusAntiAir;
      // 防空対空値 = 対空値 + 迎撃 + 2 * 対爆 + ボーナス対空値(改修値による)
      this.actualDefenseAntiAir = this.data.antiAir + this.data.interception + 2 * this.data.antiBomer + this.bonusAntiAir;
    }

    // 制空値更新
    if (this.isPlane) {
      this.fullAirPower = Math.floor(this.actualAntiAir * Math.sqrt(this.fullSlot) + this.bonusAirPower);
      this.defenseAirPower = Math.floor(this.actualDefenseAntiAir * Math.sqrt(this.fullSlot) + this.bonusAirPower);
    } else {
      this.fullAirPower = 0;
      this.defenseAirPower = 0;
    }

    // 現在制空値の初期化
    this.airPower = this.fullAirPower;
    // 現在搭載数の初期化
    this.slot = this.fullSlot;

    // 搭載数による制空値パターンを全て計算
    this.calculatedAirPower = [];
    if (this.fullSlot > 0 && this.isPlane) {
      for (let slot = 0; slot <= this.fullSlot; slot += 1) {
        const ap = Math.floor(this.actualAntiAir * Math.sqrt(slot) + this.bonusAirPower);
        this.calculatedAirPower.push(ap);
      }
    }
  }

  /**
   * 現在制空値を更新 計算用
   * @memberof Item
   */
  public static updateAirPower(item: Item): void {
    if (item.slot <= 0) {
      item.airPower = 0;
      item.slot = 0;
    } else {
      item.airPower = item.calculatedAirPower[item.slot];
    }
  }

  /**
   * 計算で減衰した各種値を戻す 計算用
   * @memberof Item
   */
  public static supply(item: Item): void {
    item.slot = item.fullSlot;
    item.airPower = item.fullAirPower;
  }

  /**
   * 熟練度によるボーナス制空値を返却
   * @private
   * @returns {number}
   * @memberof Item
   */
  private getBonusAirPower(): number {
    if (this.data.id === 0 || this.fullSlot === 0 || !this.isPlane) {
      return 0;
    }
    const type = this.data.apiTypeId;
    let sum = 0;

    if (this.level >= 100) {
      if (this.isFighter) {
        sum += 22;
      } else if (type === 11) {
        sum += 6;
      }
    } else if (this.level >= 70) {
      if (this.isFighter) {
        sum += 14;
      } else if (type === 11) {
        sum += 3;
      }
    } else if (this.level >= 55) {
      if (this.isFighter) {
        sum += 9;
      } else if (type === 11) {
        sum += 1;
      }
    } else if (this.level >= 40) {
      if (this.isFighter) {
        sum += 5;
      } else if (type === 11) {
        sum += 1;
      }
    } else if (this.level >= 25) {
      if (this.isFighter) {
        sum += 2;
      } else if (type === 11) {
        sum += 1;
      }
    }

    // 内部熟練度ボーナス
    sum += Math.sqrt(this.level / 10);

    if (type === 49) {
      // 陸偵 搭載4★2以上で制空値+1
      sum += (this.remodel >= 2 && this.fullSlot === 4 ? 1 : 0);
    } else if (this.data.id === 138) {
      // 二式大艇 搭載4★4で制空+1
      sum += (this.remodel >= 4 && this.fullSlot === 4 ? 1 : 0);
    }

    return sum;
  }

  /**
   * 改修値によるボーナス対空を返却
   * @private
   * @returns {number}
   * @memberof Item
   */
  private getBonusAntiAir(): number {
    const itemId = this.data.id;
    const type = this.data.apiTypeId;
    let aa = 0;
    if (Const.FIGHTERS.includes(type)) {
      // 艦戦 夜戦 水戦
      aa = 0.2 * this.remodel;
    } else if (type === 7 && this.data.antiAir > 2 && itemId !== 277 && itemId !== 316) {
      // 艦爆 (FM-2とRe.2001 CB改は除外)
      aa = 0.25 * this.remodel;
    } else if (Const.LB_ATTACKERS.includes(type)) {
      // 陸攻
      aa = 0.5 * Math.sqrt(this.remodel);
    }
    return aa;
  }

  /**
   * 改修値によるボーナス索敵を返却
   * @private
   * @returns
   * @memberof Item
   */
  private getBonusScout() {
    let bonus = 0;
    if (this.data.apiTypeId === 12) {
      // 小型電探
      bonus = 1.25 * Math.sqrt(this.remodel);
    } else if (this.data.apiTypeId === 13) {
      // 大型電探
      bonus = 1.4 * Math.sqrt(this.remodel);
    } else if ([9, 10, 41].includes(this.data.apiTypeId)) {
      // 偵察機
      bonus = 1.2 * Math.sqrt(this.remodel);
    } else if (this.data.apiTypeId === 11) {
      // 水上爆撃機
      bonus = 1.15 * Math.sqrt(this.remodel);
    }
    return bonus;
  }

  /**
   * 装備索敵係数を返却
   * @private
   * @returns {number}
   * @memberof Item
   */
  private getItemScoutCoefficient(): number {
    let value = 0.6;
    if (this.data.apiTypeId === 8) {
      // 艦上攻撃機
      value = 0.8;
    } else if (this.data.apiTypeId === 9) {
      // 艦上偵察機
      value = 1.0;
    } else if (this.data.apiTypeId === 10) {
      // 水上偵察機
      value = 1.2;
    } else if (this.data.apiTypeId === 11) {
      // 水上爆撃機
      value = 1.1;
    }

    return value;
  }

  /**
   * この装備の加重対空値を返却
   * @private
   * @returns {number}
   * @memberof Item
   */
  private getAntiAirWeight(): number {
    let antiAirWeight = 0;
    // 加重対空値部品 => 装備対空値 * 装備倍率
    if (this.data.iconTypeId === 16) {
      // 高角砲(緑)
      antiAirWeight = this.data.antiAir * 2;
    } else if (this.data.apiTypeId === 36) {
      // 高射装置
      antiAirWeight = this.data.antiAir * 2;
    } else if (this.data.apiTypeId === 21) {
      // 機銃
      antiAirWeight = this.data.antiAir * 3;
    } else if (this.data.iconTypeId === 11) {
      // 電探
      antiAirWeight = this.data.antiAir * 1.5;
    }

    // 艦船対空改修補正 = 装備倍率(ブラウザ版採用[2倍]) * √★
    if ((this.data.iconTypeId === 16 || this.data.apiTypeId === 36) && this.data.antiAir <= 7) {
      // 対空値7以下の高角砲 高射装置
      antiAirWeight += 1 * Math.sqrt(this.remodel);
    } else if ((this.data.iconTypeId === 16 || this.data.apiTypeId === 36) && this.data.antiAir > 7) {
      // 対空値8以上の高角砲 高射装置
      antiAirWeight += 1.5 * Math.sqrt(this.remodel);
    } else if (this.data.apiTypeId === 21 && this.data.antiAir <= 7) {
      // 対空値7以下の機銃
      antiAirWeight += 2 * Math.sqrt(this.remodel);
    } else if (this.data.apiTypeId === 21 && this.data.antiAir > 7) {
      // 対空値8以上の機銃
      antiAirWeight += 3 * Math.sqrt(this.remodel);
    }

    return antiAirWeight;
  }

  /**
   * この装備の艦隊防空ボーナスを返却
   * @private
   * @returns {number}
   * @memberof Item
   */
  private getAntiAirBonus(): number {
    let antiAirBonus = 0;
    // 艦隊防空ボーナス
    if (this.data.iconTypeId === 16) {
      // 高角砲(緑)
      antiAirBonus = this.data.antiAir * 0.35;
    } else if (this.data.apiTypeId === 36) {
      // 高射装置
      antiAirBonus = this.data.antiAir * 0.35;
    } else if (this.data.apiTypeId === 18) {
      // 対空強化弾(三式)
      antiAirBonus = this.data.antiAir * 0.6;
    } else if (this.data.iconTypeId === 11) {
      // 電探
      antiAirBonus = this.data.antiAir * 0.4;
    } else if (this.data.id === 9) {
      // 46cm三連装砲
      antiAirBonus = this.data.antiAir * 0.25;
    } else {
      // その他
      antiAirBonus = this.data.antiAir * 0.2;
    }

    // 艦隊防空装備改修補正 = 装備倍率 * √★
    if ((this.data.iconTypeId === 16 || this.data.apiTypeId === 36) && this.data.antiAir <= 7) {
      // 対空値7以下の高角砲 高射装置
      antiAirBonus += 2 * Math.sqrt(this.remodel);
    } else if (this.data.iconTypeId === 16 || this.data.apiTypeId === 36) {
      // 対空値8以上の高角砲 高射装置
      antiAirBonus += 3 * Math.sqrt(this.remodel);
    } else if (this.data.iconTypeId === 11 && this.data.antiAir > 1) {
      // 対空値2以上の電探
      antiAirBonus += 1.5 * Math.sqrt(this.remodel);
    }

    return antiAirBonus;
  }

  /**
   * 輸送量を返却
   * @private
   * @returns {number}
   * @memberof Item
   */
  private getTransportPower(): number {
    switch (this.data.apiTypeId) {
      case 24:
        // 上陸用舟艇
        return 8;
      case 30:
        // 簡易輸送部材
        return 5;
      case 34:
        // おにぎり
        return 1;
      case 36:
        // 特型内火艇
        return 2;
      default:
        return 0;
    }
  }

  /**
   * 出撃時偵察機補正を返却
   * @private
   * @return {*}  {number}
   * @memberof Item
   */
  private getReconCorr(): number {
    // 出撃時補正 陸偵
    if (this.data.apiTypeId === 49) {
      // 陸上偵察機補正
      switch (this.data.scout) {
        case 9:
          return 1.18;
        case 8:
          return 1.15;
        default:
          return 1;
      }
    }
    return 1;
  }

  /**
   * 防空時偵察機補正を返却
   * @private
   * @return {*}  {number}
   * @memberof Item
   */
  private getReconCorrDeff(): number {
    // 防空時補正
    if (this.data.apiTypeId === 49) {
      // 陸上偵察機補正
      return (this.data.scout === 9 ? 1.24 : 1.18);
    }
    if (this.data.apiTypeId === 9) {
      // 艦上偵察機補正
      return (this.data.scout > 8 ? 1.3 : 1.2);
    }
    if ([10, 41].includes(this.data.apiTypeId)) {
      // 水上偵察機補正
      if (this.data.scout > 8) {
        return 1.16;
      } if (this.data.scout === 8) {
        return 1.13;
      }
      return 1.1;
    }
    return 1;
  }
}
