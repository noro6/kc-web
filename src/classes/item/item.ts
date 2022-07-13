import CommonCalc from '../commonCalc';
import { ContactRate } from '../interfaces/contactRate';
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

/**
 * 装備中の装備クラス
 * @export
 * @class Item
 */
export default class Item {
  public readonly data: ItemMaster;

  /** 熟練度 0~120 */
  public readonly level: number;

  /** 改修値 */
  public readonly remodel: number;

  /** 搭載数 */
  public readonly fullSlot: number;

  /** 改修値による火力値増分 */
  public readonly bonusFire: number;

  /** 改修値による雷装値増分 */
  public readonly bonusTorpedo: number;

  /** 改修値による爆装値増分 */
  public readonly bonusBomber: number;

  /** 改修値による対空値増分 */
  public readonly bonusAntiAir: number;

  /** 改修値による命中値増分 */
  public readonly bonusAccuracy: number;

  /** 改修値による対潜値増分 */
  public readonly bonusAsw: number;

  /** 改修値による索敵値増分 */
  public readonly bonusScout: number;

  /** 熟練度による制空値増分 */
  public readonly bonusAirPower: number;

  /** 装備索敵 計算で利用 (装備の素の索敵値 + 改修係数×√★)×装備係数 */
  public readonly itemScout: number;

  /** 装備加重対空値 */
  public readonly antiAirWeight: number;

  /** 装備防空ボーナス */
  public readonly antiAirBonus: number;

  /** 改修効果込み実火力値 */
  public readonly actualFire: number;

  /** 制空値計算時に適用される実対空値 */
  public readonly actualAntiAir: number;

  /** 改修効果込み実雷装値 */
  public readonly actualTorpedo: number;

  /** 改修効果込み実爆装値 */
  public readonly actualBomber: number;

  /** 改修効果込み実対潜値 */
  public readonly actualAsw: number;

  /** 改修効果込み実命中値 */
  public readonly actualAccuracy: number;

  /** 改修効果込み実索敵値 */
  public readonly actualScout: number;

  /** 制空値計算時に適用される実対空値(防空時) */
  public readonly actualDefenseAntiAir: number;

  /** 装備制空値 */
  public readonly fullAirPower: number;

  /** 装備制空値(防空時) */
  public readonly fullDefenseAirPower: number;

  /** 支援制空値 */
  public readonly supportAirPower: number;

  /** 触接選択率 [確保時, 優勢時, 劣勢時] */
  public readonly contactSelectRates: number[];

  /** 輸送量 */
  public readonly tp: number;

  /** 基地1出撃燃料 */
  public readonly fuel: number;

  /** 基地1出撃弾薬 */
  public readonly ammo: number;

  /** 鋼材 */
  public readonly steel: number;

  /** 基地配備時消費ボーキ */
  public readonly bauxite: number;

  /** 偵察機補正 -出撃時 */
  public readonly reconCorr: number;

  /** 偵察機補正 -防空時 */
  public readonly reconCorrDefense: number;

  /** 最大搭載数から1までの制空値を計算し終えた配列 機体のみ有効 計算用 */
  private readonly calculatedAirPower: number[];

  /** 最大搭載数から1までの防空制空値を計算し終えた配列 機体のみ有効 計算用 */
  private readonly calculatedDefenseAirPower: number[];

  /** 航空戦雷装ボーナス 艦娘インスタンス化時限定変更 */
  public attackerTorpedoBonus = 0;

  /** 現在搭載数における制空値 計算用 */
  public airPower: number;

  /** 現在搭載数における制空値 計算用 */
  public defenseAirPower: number;

  /** 現在搭載数 計算用 */
  public slot: number;

  /** 搭載数推移 表示用 */
  public slotHistories: number[];

  /** 戦闘後搭載数 表示用 */
  public slotResult = 0;

  /** 全滅率 表示用 */
  public deathRate = 0;

  /** 第2艦隊搭載機かどうかフラグ 計算用 */
  public isEscortItem = false;

  /** スロット分布のための記録が必要 */
  public needRecord = false;

  /** 補給前搭載数分布 */
  public dist: number[] = []

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

    // 現在搭載数の初期化
    this.slot = this.fullSlot;

    // 計算により算出するステータス
    this.bonusAirPower = this.getBonusAirPower();
    this.antiAirWeight = this.getAntiAirWeight();
    this.bonusFire = this.getBonusFire();
    this.bonusTorpedo = this.getBonusTorpedo();
    this.bonusBomber = this.getBonusBomber();
    this.bonusAntiAir = this.getBonusAntiAir();
    this.bonusAccuracy = this.getBonusAccuracy();
    this.bonusAsw = this.getBonusAsw();
    this.bonusScout = this.getBonusScout();
    this.antiAirBonus = this.getAntiAirBonus();
    this.tp = this.getTransportPower();
    this.reconCorr = this.getReconCorr();
    this.reconCorrDefense = this.getReconCorrDefense();
    this.contactSelectRates = this.getContactSelectRates();

    // (装備の素の索敵値 + 改修係数×√★)×装備係数
    this.itemScout = (this.data.scout + this.bonusScout) * this.getItemScoutCoefficient();
    this.actualFire = this.data.fire + this.bonusFire;
    this.actualTorpedo = this.data.torpedo + this.bonusTorpedo;
    this.actualBomber = this.data.bomber + this.bonusBomber;
    this.actualAsw = this.data.asw + this.bonusAsw;
    this.actualAccuracy = this.data.accuracy + this.bonusAccuracy;
    this.actualScout = this.data.scout + this.bonusScout;

    this.calculatedAirPower = [];
    this.calculatedDefenseAirPower = [];

    if (this.data.isPlane) {
      // 出撃対空値 = 対空値 + 1.5 * 迎撃 + ボーナス対空値(改修値による)
      this.actualAntiAir = this.data.antiAir + 1.5 * this.data.interception + this.bonusAntiAir;
      // 防空対空値 = 対空値 + 迎撃 + 2 * 対爆 + ボーナス対空値(改修値による)
      this.actualDefenseAntiAir = this.data.antiAir + this.data.interception + 2 * this.data.antiBomber + this.bonusAntiAir;

      // 出撃コスト算出
      this.fuel = this.fullSlot;
      this.ammo = Math.ceil(this.fullSlot * 0.6);
      this.bauxite = this.data.cost * (this.data.isRecon ? 4 : 18);
      this.steel = this.data.isJet ? Math.round(this.fullSlot * this.data.cost * 0.2) : 0;
      if (this.data.isABAttacker) {
        // 陸攻補正
        this.fuel = Math.ceil(this.fullSlot * (this.data.isShinzan ? 2 : 1.5));
        this.ammo = this.data.isShinzan ? this.fullSlot * 2 : Math.floor(this.fullSlot * 0.7);
        this.bauxite = this.data.cost * (this.data.isShinzan ? 9 : 18);
      } else if (this.data.apiTypeId === 41) {
        // 大型偵察機補正
        this.fuel = this.fullSlot * 3;
        this.ammo = this.fullSlot;
      }

      // 制空値更新
      if (this.data.isPlane) {
        this.fullAirPower = Math.floor(this.actualAntiAir * Math.sqrt(this.fullSlot) + this.bonusAirPower);
        this.fullDefenseAirPower = Math.floor(this.actualDefenseAntiAir * Math.sqrt(this.fullSlot) + this.bonusAirPower);
        this.supportAirPower = Math.floor(this.data.antiAir * Math.sqrt(this.fullSlot));
      } else {
        this.fullAirPower = 0;
        this.fullDefenseAirPower = 0;
        this.defenseAirPower = 0;
        this.supportAirPower = 0;
      }

      // 現在制空値の初期化
      this.airPower = this.fullAirPower;
      this.defenseAirPower = this.fullDefenseAirPower;

      // 搭載数による制空値パターンを全て計算しておく
      if (this.fullSlot > 0 && this.data.isPlane) {
        for (let slot = 0; slot <= this.fullSlot; slot += 1) {
          this.calculatedAirPower.push(Math.floor(this.actualAntiAir * Math.sqrt(slot) + this.bonusAirPower));
          this.calculatedDefenseAirPower.push(Math.floor(this.actualDefenseAntiAir * Math.sqrt(slot) + this.bonusAirPower));
        }
      }
    } else {
      // 以下、航空機でないなら関係ない数値たち
      this.actualAntiAir = 0;
      this.actualDefenseAntiAir = 0;
      this.fuel = 0;
      this.ammo = 0;
      this.bauxite = 0;
      this.steel = 0;
      this.fullAirPower = 0;
      this.fullDefenseAirPower = 0;
      this.supportAirPower = 0;
      this.airPower = 0;
      this.defenseAirPower = 0;
    }
    this.slotHistories = [];
  }

  /**
   * 熟練度 0 ~ 7表示
   * @readonly
   * @type {number}
   * @memberof Item
   */
  get levelAlt(): number {
    return CommonCalc.getProfLevel(this.level);
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
   * 現在防空制空値を更新 計算用
   * @memberof Item
   */
  public static updateDefenseAirPower(item: Item): void {
    if (item.slot <= 0) {
      item.defenseAirPower = 0;
      item.slot = 0;
    } else {
      item.defenseAirPower = item.calculatedDefenseAirPower[item.slot];
    }
  }

  /**
   * 計算で減衰した各種値を戻す 計算用
   * @memberof Item
   */
  public static supply(item: Item): void {
    if (item.needRecord) {
      item.dist.push(item.slot);
    }
    item.slot = item.fullSlot;
    item.airPower = item.fullAirPower;
    item.defenseAirPower = item.fullDefenseAirPower;
  }

  /**
   * 熟練度によるボーナス制空値を返却
   * @private
   * @returns {number}
   * @memberof Item
   */
  private getBonusAirPower(): number {
    if (this.data.id === 0 || this.fullSlot === 0 || !this.data.isPlane) {
      return 0;
    }
    const type = this.data.apiTypeId;
    let sum = 0;

    if (this.level >= 100) {
      if (this.data.isFighter) {
        sum += 22;
      } else if (type === 11) {
        sum += 6;
      }
    } else if (this.level >= 70) {
      if (this.data.isFighter) {
        sum += 14;
      } else if (type === 11) {
        sum += 3;
      }
    } else if (this.level >= 55) {
      if (this.data.isFighter) {
        sum += 9;
      } else if (type === 11) {
        sum += 1;
      }
    } else if (this.level >= 40) {
      if (this.data.isFighter) {
        sum += 5;
      } else if (type === 11) {
        sum += 1;
      }
    } else if (this.level >= 25) {
      if (this.data.isFighter) {
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
   * 改修値によるボーナス火力を返却
   * @private
   * @return {*}  {number}
   * @memberof Item
   */
  private getBonusFire(): number {
    // 大口径主砲
    if (this.data.apiTypeId === 3) {
      return 1.5 * Math.sqrt(this.remodel);
    }
    // その他主砲 / 副砲 / 徹甲弾 / 機銃 / 探照灯 / 高射装置 / 大発
    if ([1, 2, 4, 19, 21, 24, 29, 36, 42].includes(this.data.apiTypeId)) {
      // 一部副砲
      if ([10, 66, 220, 275].includes(this.data.id)) {
        return 0.2 * this.remodel;
      } if ([12, 234, 247].includes(this.data.id)) {
        return 0.3 * this.remodel;
      }
      return Math.sqrt(this.remodel);
    }
    // ソナー 爆雷
    if ([14, 15].includes(this.data.apiTypeId)) {
      return 0.75 * Math.sqrt(this.remodel);
    }
    return 0;
  }

  /**
   * 改修値によるボーナス雷装を返却
   * @private
   * @return {*}  {number}
   * @memberof Item
   */
  private getBonusTorpedo(): number {
    // 艦攻
    if (this.data.apiTypeId === 8) {
      return 0.2 * this.remodel;
    }
    // 陸攻 重爆
    if (this.data.isABAttacker) {
      return 0.7 * Math.sqrt(this.remodel);
    }
    // 魚雷 / 機銃
    if (this.data.apiTypeId === 5 || this.data.apiTypeId === 21) {
      return 1.2 * Math.sqrt(this.remodel);
    }
    return 0;
  }

  /**
   *
   * 改修値によるボーナス爆装を返却
   *
   * @private
   * @return {*}  {number}
   * @memberof Item
   */
  private getBonusBomber(): number {
    const type = this.data.apiTypeId;
    // 艦爆 (爆戦ってついてないやつ)
    if (type === 7 && !this.data.isBakusen) {
      return 0.2 * this.remodel;
    }
    // 水爆
    if (type === 11) {
      return 0.2 * this.remodel;
    }
    return 0;
  }

  /**
   * 改修値によるボーナス対空を返却
   * @private
   * @returns {number}
   * @memberof Item
   */
  private getBonusAntiAir(): number {
    // 艦戦 夜戦 水戦
    if (this.data.isFighter) {
      return 0.2 * this.remodel;
    }
    // 艦爆(爆戦って付いてるやつ)
    if (this.data.apiTypeId === 7 && this.data.isBakusen) {
      return 0.25 * this.remodel;
    }
    // 陸攻
    if (this.data.isABAttacker) {
      return 0.5 * Math.sqrt(this.remodel);
    }
    return 0;
  }

  /**
   * 改修値によるボーナス対潜を返却
   * @private
   * @return {*}  {number}
   * @memberof Item
   */
  private getBonusAsw(): number {
    const type = this.data.apiTypeId;
    // ソナー 爆雷
    if ([14, 15].includes(type)) {
      return Math.sqrt(this.remodel);
    }
    // 艦攻
    if (type === 8) {
      return 0.2 * this.remodel;
    }
    // 艦爆 (爆戦ってついてないやつ)
    if (type === 7 && !this.data.isBakusen) {
      return 0.2 * this.remodel;
    }
    return 0;
  }

  /**
   * 改修値によるボーナス命中を返却
   * @private
   * @return {*}  {number}
   * @memberof Item
   */
  private getBonusAccuracy(): number {
    // 一部電探 電探改修可能変更時注意
    if ([28, 29, 31, 32, 88, 89, 141, 240, 278, 279, 315].includes(this.data.id)) {
      return 1.7 * Math.sqrt(this.remodel);
    }
    // 主砲 副砲 徹甲弾 高射装置 探照灯
    if ([1, 2, 3, 4, 12, 13, 19, 29, 36, 42].includes(this.data.apiTypeId)) {
      return Math.sqrt(this.remodel);
    }
    return 0;
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
    } else if (this.data.isRecon) {
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
      case 43:
        // おにぎり
        return 1;
      case 46:
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
  private getReconCorrDefense(): number {
    // 防空時補正
    if (this.data.apiTypeId === 49) {
      // 陸上偵察機補正
      return (this.data.scout === 9 ? 1.24 : 1.18);
    }
    if (this.data.apiTypeId === 9) {
      // 艦上偵察機補正
      return (this.data.scout > 8 ? 1.3 : 1.2);
    }
    if (this.data.isRecon) {
      // それ以外の偵察機補正
      if (this.data.scout > 8) {
        return 1.16;
      } if (this.data.scout === 8) {
        return 1.13;
      }
      return 1.1;
    }
    return 1;
  }

  /**
   * 触接選択率を返却
   * @private
   * @returns {number[]}
   * @memberof Item
   */
  private getContactSelectRates(): number[] {
    if ([8, 9, 10, 41, 49].includes(this.data.apiTypeId)) {
      const { remodel } = this;
      let { scout } = this.data;
      switch (this.data.id) {
        case 102:
          // 九八式水上偵察機(夜偵)
          scout = Math.ceil(scout + 0.1 * remodel);
          break;
        case 25:
        case 138:
        case 163:
        case 304:
        case 370:
        case 239:
          // 零式水上偵察機
          // 二式大艇
          // Ro.43水偵
          // S9 Osprey
          // Swordfish Mk.II改(水偵型)
          // 零式水上偵察機11型乙(熟練)
          scout = Math.ceil(scout + 0.14 * remodel);
          break;
        case 59:
          // 零式水上観測機
          scout = Math.ceil(scout + 0.2 * remodel);
          break;
        case 61:
          // 二式艦上偵察機
          scout = Math.ceil(scout + 0.25 * remodel);
          break;
        case 151:
          // 試製景雲(艦偵型)
          scout = Math.ceil(scout + 0.4 * remodel);
          break;
        default:
          break;
      }

      // 触接選択率 => 20 - (2 * 制空定数[3, 2, 1])
      return [scout / 14, scout / 16, scout / 18];
    }
    return [0, 0, 0];
  }

  /**
   * 熟練クリティカル補正を算出 -現行では基地航空隊用
   * @return {*}  {number}
   * @memberof Item
   */
  public getProfCriticalBonus(): number {
    let bonus = 0;
    // 搭載数が存在する攻撃機か大型飛行艇
    if (this.slot > 0 && (this.data.isAttacker || this.data.apiTypeId === 41)) {
      // 熟練度定数C
      const c = [0, 1, 2, 3, 4, 5, 7, 10][this.levelAlt];
      bonus += Math.floor(Math.sqrt(this.level) + c) / 100;
    }
    // 補正値 = int(√内部熟練度  + C) / 100
    return 1 + bonus;
  }

  /**
   * 装備配列より触接情報テーブルを取得
   * @returns {ContactRate[]}
   * @memberof Fleet
   */
  public static getContactRates(items: Item[]): ContactRate[] {
    let sumContactValue = 0;
    // 補正率別 触接選択率テーブル[ 0:確保時, 1:優勢時, 2:劣勢時 ]
    const contact120 = [[] as number[], [] as number[], [] as number[]];
    const contact117 = [[] as number[], [] as number[], [] as number[]];
    const contact112 = [[] as number[], [] as number[], [] as number[]];

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (item.data.isRecon) {
        sumContactValue += Math.floor(item.data.scout * Math.sqrt(item.fullSlot));
      }
      // 制空状態3つループ
      for (let j = 0; j < 3; j += 1) {
        if (item.data.accuracy >= 3) contact120[j].push(item.contactSelectRates[j]);
        else if (item.data.accuracy === 2) contact117[j].push(item.contactSelectRates[j]);
        else contact112[j].push(item.contactSelectRates[j]);
      }
    }
    // 触接開始率 = int(sum(索敵 * sqrt(搭載)) + 1) / (70 - 15 * c)
    const a = Math.floor(sumContactValue) + 1;
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
