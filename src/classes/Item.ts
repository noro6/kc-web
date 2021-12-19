import Const from './Const';
import ItemMaster from './ItemMaster';

export default class Item {
  public data: ItemMaster;

  public level = 0;

  public remodel = 0;

  public slot = 0;

  public max = 99;

  public init = 99;

  public actualAntiAir = 0;

  public bonusAntiAir = 0;

  public bonusAirPower = 0;

  public antiAirWeight = 0;

  public antiAirBonus = 0;

  public isFighter = false;

  public isRecon = false;

  public airPower = 0;

  constructor(itemMaster: ItemMaster = new ItemMaster()) {
    this.data = itemMaster;
    this.level = 0;
    this.remodel = 0;
    this.slot = 0;
    this.max = 99;
    this.init = 99;
    this.isFighter = Const.FIGHTERS.includes(itemMaster.apiTypeId);
    this.isRecon = Const.RECONNAISSANCES.includes(itemMaster.apiTypeId);
    this.actualAntiAir = this.data.antiAir + 1.5 * this.data.interception;
    this.updateStatus();
  }

  /**
   * 未装備状態に戻す
   * @memberof Item
   */
  public clear(): void {
    this.data = new ItemMaster();
    this.level = 0;
    this.remodel = 0;
    this.slot = 0;
    this.max = 99;
    this.init = 99;
    this.isFighter = false;
    this.isRecon = false;
    this.actualAntiAir = 0;
    this.updateStatus();
  }

  /**
   * 別のインスタンスでこのインスタンスを上書きする
   * ただし、搭載数が0ではない場合は据え置く
   * @param {Item} item
   * @memberof Item
   */
  public setItem(item: Item): void {
    this.data = item.data;
    this.level = item.level;
    this.remodel = item.remodel;
    this.slot = this.slot > 0 ? this.slot : item.slot;
    this.max = item.max;
    this.init = item.init;
    this.isFighter = item.isFighter;
    this.isRecon = item.isRecon;
    this.actualAntiAir = this.data.antiAir + 1.5 * this.data.interception;
    this.updateStatus();
  }

  /**
   * 基本ステータス以外の更新
   * 改修値や熟練度変更時に呼び出すこと
   * @memberof Item
   */
  public updateStatus(): void {
    this.updateBonusAntiAir();
    this.updateBonusAirPower();
    this.updateAntiAirWeight();
    this.updateAntiAirBonus();
  }

  /**
   * 熟練度によるボーナス制空値を更新
   * @returns {void}
   * @memberof Item
   */
  private updateBonusAirPower(): void {
    if (this.data.id === 0 || this.slot === 0 || !Const.PLANE_TYPES.includes(this.data.apiTypeId)) {
      this.bonusAirPower = 0;
      return;
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

    this.bonusAirPower = sum;
  }

  /**
   * 改修値によるボーナス対空を更新
   * @memberof Item
   */
  private updateBonusAntiAir(): void {
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
    this.bonusAntiAir = aa;
  }

  /**
   * この装備の加重対空値を更新する
   * @memberof Item
   */
  private updateAntiAirWeight(): void {
    // 加重対空値部品 => 装備対空値 * 装備倍率
    if (this.data.iconTypeId === 16) {
      // 高角砲(緑)
      this.antiAirWeight = this.data.antiAir * 2;
    } else if (this.data.apiTypeId === 36) {
      // 高射装置
      this.antiAirWeight = this.data.antiAir * 2;
    } else if (this.data.apiTypeId === 21) {
      // 機銃
      this.antiAirWeight = this.data.antiAir * 3;
    } else if (this.data.iconTypeId === 11) {
      // 電探
      this.antiAirWeight = this.data.antiAir * 1.5;
    }

    // 艦船対空改修補正 = 装備倍率(ブラウザ版採用[2倍]) * √★
    if ((this.data.iconTypeId === 16 || this.data.apiTypeId === 36) && this.data.antiAir <= 7) {
      // 対空値7以下の高角砲 高射装置
      this.antiAirWeight += 1 * Math.sqrt(this.remodel);
    } else if ((this.data.iconTypeId === 16 || this.data.apiTypeId === 36) && this.data.antiAir > 7) {
      // 対空値8以上の高角砲 高射装置
      this.antiAirWeight += 1.5 * Math.sqrt(this.remodel);
    } else if (this.data.apiTypeId === 21 && this.data.antiAir <= 7) {
      // 対空値7以下の機銃
      this.antiAirWeight += 2 * Math.sqrt(this.remodel);
    } else if (this.data.apiTypeId === 21 && this.data.antiAir > 7) {
      // 対空値8以上の機銃
      this.antiAirWeight += 3 * Math.sqrt(this.remodel);
    }
  }

  /**
   * この装備の艦隊防空ボーナスを更新する
   * @memberof Item
   */
  private updateAntiAirBonus(): void {
    // 艦隊防空ボーナス
    if (this.data.iconTypeId === 16) {
      // 高角砲(緑)
      this.antiAirBonus = this.data.antiAir * 0.35;
    } else if (this.data.apiTypeId === 36) {
      // 高射装置
      this.antiAirBonus = this.data.antiAir * 0.35;
    } else if (this.data.apiTypeId === 18) {
      // 対空強化弾(三式)
      this.antiAirBonus = this.data.antiAir * 0.6;
    } else if (this.data.iconTypeId === 11) {
      // 電探
      this.antiAirBonus = this.data.antiAir * 0.4;
    } else if (this.data.id === 9) {
      // 46cm三連装砲
      this.antiAirBonus = this.data.antiAir * 0.25;
    } else {
      // その他
      this.antiAirBonus = this.data.antiAir * 0.2;
    }

    // 艦隊防空装備改修補正 = 装備倍率 * √★
    if ((this.data.iconTypeId === 16 || this.data.apiTypeId === 36) && this.data.antiAir <= 7) {
      // 対空値7以下の高角砲 高射装置
      this.antiAirBonus += 2 * Math.sqrt(this.remodel);
    } else if (this.data.iconTypeId === 16 || this.data.apiTypeId === 36) {
      // 対空値8以上の高角砲 高射装置
      this.antiAirBonus += 3 * Math.sqrt(this.remodel);
    } else if (this.data.iconTypeId === 11 && this.data.antiAir > 1) {
      // 対空値2以上の電探
      this.antiAirBonus += 1.5 * Math.sqrt(this.remodel);
    }
  }
}
