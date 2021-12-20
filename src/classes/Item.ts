import Const from './Const';
import ItemMaster from './ItemMaster';

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

  /** 改修値 */
  public readonly level: number;

  /** 改修値 */
  public readonly remodel: number;

  /** 搭載数 */
  public readonly slot: number;

  /** 改修値による対空値増分 */
  public readonly bonusAntiAir: number;

  /** 熟練度による制空値増分 */
  public readonly bonusAirPower: number;

  /** 装備加重対空値 */
  public readonly antiAirWeight: number;

  /** 装備防空ボーナス */
  public readonly antiAirBonus: number;

  /** 制空値計算時に適用される実対空値 */
  public readonly actualAntiAir: number;

  /** 制空値計算時に適用される実対空値(防空時) */
  public readonly actualDefenseAntiAir: number;

  /** 装備制空値 */
  public readonly airPower: number;

  /** 装備制空値(防空時) */
  public readonly defenseAirPower: number;

  /** 艦戦フラグ */
  public readonly isFighter: boolean

  /** 偵察機フラグ */
  public readonly isRecon: boolean;

  constructor(builder: ItemBuilder = {}) {
    if (builder.item) {
      // ItemBuilderより生成
      this.data = builder.master ? builder.master : builder.item.data;
      this.slot = builder.slot ? builder.slot : builder.item.slot;
      this.remodel = builder.remodel ? builder.remodel : builder.item.remodel;
      this.level = builder.level ? builder.level : builder.item.level;
    } else {
      this.data = new ItemMaster();
      this.slot = 0;
      this.remodel = 0;
      this.level = 0;
    }

    this.isFighter = Const.FIGHTERS.includes(this.data.apiTypeId);
    this.isRecon = Const.RECONNAISSANCES.includes(this.data.apiTypeId);

    // 計算により算出するステータス
    this.bonusAirPower = this.getBonusAirPower();
    this.antiAirWeight = this.getAntiAirWeight();
    this.bonusAntiAir = this.getBonusAntiAir();
    this.antiAirBonus = this.getAntiAirBonus();

    // 出撃対空値 = 対空値 + 1.5 * 迎撃 + ボーナス対空値(改修値による)
    this.actualAntiAir = this.data.antiAir + 1.5 * this.data.interception + this.bonusAntiAir;
    // 防空対空値 = 対空値 + 1.5 * 迎撃 + ボーナス対空値(改修値による)
    this.actualDefenseAntiAir = this.data.antiAir + 2 * this.data.antiBomer + this.bonusAntiAir;

    // 制空値更新
    this.airPower = Math.floor(this.actualAntiAir * Math.sqrt(this.slot) + this.bonusAirPower);
    this.defenseAirPower = Math.floor(this.actualDefenseAntiAir * Math.sqrt(this.slot) + this.bonusAirPower);
  }

  /**
   * 熟練度によるボーナス制空値を返却
   * @private
   * @returns {number}
   * @memberof Item
   */
  private getBonusAirPower(): number {
    if (this.data.id === 0 || this.slot === 0 || !Const.PLANE_TYPES.includes(this.data.apiTypeId)) {
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
      sum += (this.remodel >= 2 && this.slot === 4 ? 1 : 0);
    } else if (this.data.id === 138) {
      // 二式大艇 搭載4★4で制空+1
      sum += (this.remodel >= 4 && this.slot === 4 ? 1 : 0);
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
}
