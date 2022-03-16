import * as _ from 'lodash';
import ShipMaster from './shipMaster';
import Item from '../item/item';
import Const, { SHIP_TYPE } from '../const';
import AntiAirCutIn from '../aerialCombat/antiAirCutIn';
import { ShipBase } from '../interfaces/shipBase';
import ShootDownInfo from '../aerialCombat/shootDownInfo';

export interface ShipBuilder {
  // eslint-disable-next-line no-use-before-define
  ship?: Ship | undefined;
  /** 装備マスタ情報 未指定ならship内のdataで作成 */
  master?: ShipMaster;
  /** 装備 未指定ならshipの装備で作成 */
  items?: Item[];
  /** 補強増設 未指定ならshipの補強増設で作成 */
  exItem?: Item;
  /** 練度 */
  level?: number;
  /** 運 */
  luck?: number;
  /** 対空 */
  antiAir?: number;
  /** 随伴艦フラグ */
  isEscort?: boolean;
  /** 有効フラグ */
  isActive?: boolean
}

export default class Ship implements ShipBase {
  /** 艦娘マスタ情報 */
  public readonly data: ShipMaster;

  /** 装備一覧 */
  public readonly items: Item[];

  /** 補強増設枠 */
  public readonly exItem: Item;

  /** 練度 */
  public readonly level: number;

  /** 計算で適用する運 */
  public readonly luck: number;

  /** 計算で適用する対空 */
  public readonly antiAir: number;

  /** 計算で適用する装甲 */
  public readonly actualArmor: number;

  /** 索敵値 */
  public readonly scout: number;

  /** 全装備による索敵値 */
  public readonly itemsScout: number;

  /** 回避値 */
  public readonly avoid: number;

  /** 対潜値 */
  public readonly asw: number;

  /** 装備による対潜上昇値 */
  public readonly itemAsw: number;

  /** 装備ボーナスによる対潜上昇値 */
  public itemBonusAsw: number;

  /** 対潜合計 */
  public readonly actualAsw: number;

  /** 先制対潜可 */
  public readonly enabledTSBK: boolean;

  /** 最終的な射程 */
  public readonly actualRange: number;

  /** 輸送量 */
  public readonly tp: number;

  /** 噴進弾幕率 */
  public readonly hunshinRate: number;

  /** 有効無効 */
  public readonly isActive: boolean;

  /** 装備が空 計算対象として数えない */
  public readonly isEmpty: boolean;

  /** 防空ボーナス */
  public readonly antiAirBonus: number;

  /** 随伴艦フラグ */
  public readonly isEscort: boolean;

  /** 噴式機ありなし */
  public readonly hasJet: boolean;

  /** 制空値(搭載数満タン) */
  public readonly fullAirPower: number;

  /** 装備による索敵ボーナス */
  public readonly bonusScout: number;

  /** 発動可能対空CI */
  public readonly antiAirCutIn: AntiAirCutIn[];

  /** 特殊高角砲所持数 */
  public readonly specialKokakuCount: number;

  /** 高角砲所持数 */
  public readonly kokakuCount: number;

  /** 特殊機銃所持数 */
  public readonly specialKijuCount: number;

  /** 機銃所持数 */
  public readonly kijuCount: number;

  /** 対空電探所持数 */
  public readonly antiAirRadarCount: number;

  /** 水上電探所持数 */
  public readonly surfaceRadarCount: number;

  /** 高射装置所持数 */
  public readonly koshaCount: number;

  /** 固定撃墜 画面表示用 */
  public fixDown = 0;

  /** 割合撃墜 画面表示用 */
  public rateDown = 0;

  constructor(builder: ShipBuilder = {}) {
    if (builder.ship) {
      this.data = builder.master !== undefined ? builder.master : builder.ship.data;
      this.level = builder.level !== undefined ? builder.level : builder.ship.level;
      this.luck = builder.luck !== undefined ? builder.luck : builder.ship.luck;
      this.antiAir = builder.antiAir !== undefined ? builder.antiAir : builder.ship.antiAir;
      this.items = builder.items !== undefined ? builder.items.concat() : builder.ship.items.concat();
      this.exItem = builder.exItem !== undefined ? builder.exItem : builder.ship.exItem;
      this.isActive = builder.isActive !== undefined ? builder.isActive : builder.ship.isActive;
      this.isEscort = builder.isEscort !== undefined ? builder.isEscort : builder.ship.isEscort;
    } else {
      this.data = builder.master !== undefined ? builder.master : new ShipMaster();
      this.level = builder.level !== undefined ? builder.level : 99;
      this.luck = builder.luck !== undefined ? builder.luck : this.data.luck;
      this.antiAir = builder.antiAir !== undefined ? builder.antiAir : this.data.antiAir;
      this.items = builder.items !== undefined ? builder.items.concat() : [];
      this.exItem = builder.exItem !== undefined ? builder.exItem : new Item();
      this.isActive = builder.isActive !== undefined ? builder.isActive : true;
      this.isEscort = builder.isEscort !== undefined ? builder.isEscort : false;
    }

    // 装備数をマスタのスロット数に合わせる
    if (this.items.length < this.data.slotCount) {
      // 少ないケース => 追加
      for (let i = this.items.length; i < this.data.slotCount; i += 1) {
        this.items.push(new Item({ slot: this.data.slots[i] }));
      }
    } else if (this.items.length > this.data.slotCount) {
      // 多いケース => 絞る
      this.items = this.items.slice(0, this.data.slotCount);
    }

    // 空の装備の搭載数を戻す
    for (let i = 0; i < this.data.slotCount; i += 1) {
      const fullSlot = this.data.slots[i];
      const item = this.items[i];
      if (item.data.id === 0 && fullSlot > 0) {
        this.items[i] = new Item({ slot: fullSlot });
      }
    }

    this.fullAirPower = 0;
    this.antiAirBonus = 0;
    this.itemsScout = 0;
    this.hasJet = false;
    this.specialKokakuCount = 0;
    this.kokakuCount = 0;
    this.kijuCount = 0;
    this.actualArmor = this.data.armor;
    this.specialKijuCount = 0;
    this.antiAirRadarCount = 0;
    this.surfaceRadarCount = 0;
    this.koshaCount = 0;
    this.hunshinRate = 0;
    this.enabledTSBK = false;

    // 以下、計算により算出するステータス
    // レベルより算出
    this.scout = Ship.getStatusFromLevel(this.level, this.data.maxScout, this.data.minScout);
    this.avoid = Ship.getStatusFromLevel(this.level, this.data.maxAvoid, this.data.minAvoid);
    this.asw = Ship.getStatusFromLevel(this.level, this.data.maxAsw, this.data.minAsw);

    // 索敵ボーナス
    this.bonusScout = this.getBonusScout();
    // 輸送量(艦娘分)
    this.tp = this.getTransportPower();
    // 射程(基本値)
    this.actualRange = Math.max(this.data.range, 1);

    // 装備一覧より取得
    const items = this.items.concat(this.exItem);
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];

      // 装備防空ボーナス
      this.antiAirBonus += item.antiAirBonus;
      // 装備索敵関係
      this.itemsScout += item.itemScout;
      // 輸送量
      this.tp += item.tp;
      // 装甲値
      this.actualArmor += item.data.armor;
      // 射程(大きくなるなら)
      if (item.data.range > this.actualRange) {
        this.actualRange = item.data.range;
      }

      if (item.fullSlot > 0 && item.isPlane && !item.isRecon && !item.isABAttacker) {
        // 通常制空値
        this.fullAirPower += item.fullAirPower;
      }
      // ジェット機所持
      if (!this.hasJet && item.isJet) {
        this.hasJet = true;
      }
      // 高角砲カウント
      if (item.data.iconTypeId === 16 && !item.data.isSpecial) {
        this.kokakuCount += 1;
      }
      // 特殊高角砲カウント
      if (item.data.iconTypeId === 16 && item.data.isSpecial) {
        this.specialKokakuCount += 1;
      }
      // 機銃カウント
      if (item.data.apiTypeId === 21 && !item.data.isSpecial) {
        this.kijuCount += 1;
      }
      // 特殊機銃カウント
      if (item.data.apiTypeId === 21 && item.data.isSpecial) {
        this.specialKijuCount += 1;
      }
      // 対空電探カウント
      if (item.data.iconTypeId === 11 && item.data.antiAir > 0) {
        this.antiAirRadarCount += 1;
      }
      // 水上電探カウント
      if (item.data.iconTypeId === 11 && item.data.scout > 4) {
        this.surfaceRadarCount += 1;
      }
      // 高射装置カウント
      if (item.data.apiTypeId === 36) {
        this.koshaCount += 1;
      }

      // SGレーダー(初期型) + [ アメリカ駆逐 / 丹陽 / 雪風改二 ] は射程長
      if (item.data.id === 315 && (this.data.type2 === 87 || this.data.type2 === 91 || this.data.id === 651 || this.data.id === 656)) {
        this.actualRange = 3;
      }
    }

    // 伊勢 / 日向 / 飛龍 / 蒼龍の改二 二式艦上偵察機で射程バフ +1
    if (this.items.some((v) => v.data.id === 61) && [553, 554, 196, 197].includes(this.data.id)) {
      this.actualRange += 1;
    }

    // 発動可能対空CI取得
    this.antiAirCutIn = ShootDownInfo.getAntiAirCutIn(this);

    // 防空ボーナス 小数切捨て
    this.antiAirBonus = Math.floor(this.antiAirBonus);

    if (this.kijuCount) {
      // 噴進率計算
      this.hunshinRate = this.getHunshinRate();
    }

    // 装備対潜ボーナスと装備素対潜を取得
    this.itemBonusAsw = 0;
    this.itemAsw = this.getBonusAsw();
    // 最終対潜値
    this.actualAsw = this.asw + this.itemAsw + this.itemBonusAsw;
    // 先制対潜の可否を判定
    this.enabledTSBK = this.getEnabledTSBK();

    // 装備もマスタもない場合空として計算対象から省く
    this.isEmpty = this.data.id === 0 && !this.items.some((v) => v.data.id > 0);
  }

  /**
   * 艦娘Lvにより算出可能なステータスを計算
   * @static
   * @param {number} level 練度
   * @param {number} max Lv.99時最大値
   * @param {number} min 初期値
   * @returns {number}
   * @memberof Ship
   */
  public static getStatusFromLevel(level: number, max: number, min: number): number {
    let value = 0;
    if (level === 99 && max > 0) {
      // Lv99ステ
      value = max;
    } else if (max > 0) {
      // Lv99以外 算出可能な場合
      value = Math.floor((max - min) * (level / 99) + min);
    } else {
      // 算出不可
      value = 0;
    }

    return value;
  }

  /**
   * 命中項を返却
   * @static
   * @param {number} level
   * @param {number} luck
   * @returns {number}
   * @memberof Ship
   */
  public static getAccuracyValue(level: number, luck: number): number {
    return Math.floor(2 * Math.sqrt(level) + 1.5 * Math.sqrt(luck));
  }

  /**
   * 回避項を返却
   * @static
   * @param {number} avoid
   * @param {number} luck
   * @returns {number}
   * @memberof Ship
   */
  public static getAvoidValue(avoid: number, luck: number): number {
    const baseAvoid = Math.floor(avoid + Math.sqrt(2 * luck));
    if (avoid >= 65) {
      return Math.floor(55 + 2 * Math.sqrt(baseAvoid - 65));
    }
    if (avoid >= 45) {
      return Math.floor(40 + 3 * Math.sqrt(baseAvoid - 40));
    }
    return baseAvoid;
  }

  /**
   * CI項を返却
   * @static
   * @param {number} level
   * @param {number} luck
   * @returns {number}
   * @memberof Ship
   */
  public static getCIValue(level: number, luck: number): number {
    if (luck >= 50) {
      return Math.floor(65 + Math.sqrt(luck - 50) + 0.8 * Math.sqrt(level));
    }
    return Math.floor(15 + luck + 0.75 * Math.sqrt(level));
  }

  /**
   * この艦の熟練クリティカルボーナスを算出
   * @return {*}  {number}
   * @memberof Ship
   */
  public getProfCriticalBonus(): number {
    let bonus = 0;
    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      // 対象は搭載数が存在する攻撃機か大型飛行艇
      if (item.slot > 0 && (item.isAttacker || item.data.apiTypeId === 41)) {
        // 熟練度定数C
        const c = [0, 1, 2, 3, 4, 5, 7, 10][item.levelAlt];
        // 隊長機補正
        const div = i === 0 ? 100 : 200;
        bonus += Math.floor(Math.sqrt(item.level) + c) / div;
      }
    }

    // 補正値 = int(√内部熟練度  + C) / (100 or 200)
    return 1 + bonus;
  }

  /**
   * 装備ボーナス(索敵)の設定
   * @memberof Fleet
   */
  private getBonusScout() {
    let sumBonus = 0;
    const { id, type, type2 } = this.data;
    const items = this.items.concat(this.exItem);
    const isAmerica = Const.USA.includes(type2);
    const isJapanese = Const.isJPN(type2);

    // 累積不可
    // SKレーダー
    if (items.some((v) => v.data.id === 278)) {
      // 米艦
      if (isAmerica) sumBonus += 1;
    }
    // SK＋SGレーダー
    if (items.some((v) => v.data.id === 279)) {
      // 米艦
      if (isAmerica) sumBonus += 2;
      // 英艦
      if (Const.GBR.includes(type2)) sumBonus += 1;
    }
    // 21号対空電探
    if (items.some((v) => v.data.id === 30)) {
      // 秋月型か最上改二
      if (type2 === 54 || id === 301 || id === 306) sumBonus += 2;
    }
    // 21号対空電探改二
    if (items.some((v) => v.data.id === 410)) {
      // 秋月型か最上改二
      if (type2 === 54 || id === 301 || id === 306) sumBonus += 2;
    }
    // OS2U
    if (items.some((v) => v.data.id === 171)) {
      // 米戦艦
      if ([8, 9, 10].includes(type) && isAmerica) {
        // 最大改修値
        const remodel = Math.max.apply(null, items.filter((v) => v.data.id === 171).map((v) => v.remodel));
        if (remodel >= 8) sumBonus += 3;
        else if (remodel >= 3) sumBonus += 2;
        else sumBonus += 1;
      }
    }
    // SOC Seagull
    if (items.some((v) => v.data.id === 414)) {
      // 米艦
      if (isAmerica) {
        // 戦艦
        if ([8, 9, 10].includes(type)) sumBonus += 1;
        else {
          const remodel = Math.max.apply(null, items.filter((v) => v.data.id === 414).map((v) => v.remodel));
          if (remodel >= 4) sumBonus += 3;
          else sumBonus += 2;
        }
      }
    }
    // Swordfish Mk.II改(水偵型)
    if (items.some((v) => v.data.id === 370)) {
      // Warspite
      if (type2 === 67) sumBonus += 3;
      // Gotland級 その他の英艦
      else if (type2 === 89 || Const.GBR.includes(type2)) sumBonus += 2;
      // コマちゃん 瑞穂 神威
      else if ([62, 70, 72].includes(type2)) sumBonus += 1;
    }
    // Fairey Seafox改
    if (items.some((v) => v.data.id === 371)) {
      // Gotland andra
      if (id === 430) sumBonus += 9;
      // Gotland
      else if (type2 === 89) sumBonus += 6;
      // Nelson
      else if (type2 === 88) sumBonus += 5;
      // コマちゃん
      else if (type2 === 70) sumBonus += 4;
      // Warspite Sheffield Richelieu
      else if (type2 === 67 || type2 === 79 || type2 === 108) sumBonus += 3;
    }
    // Swordfish Mk.III改(水上機型)
    if (id === 430 && items.some((v) => v.data.id === 368)) {
      // Gotoland andra 1つめだけ
      sumBonus += 1;
    }
    // Swordfish Mk.III改(水上機型/熟練)
    if (id === 430 && items.some((v) => v.data.id === 369)) {
      // Gotoland andra 1つめだけ
      sumBonus += 2;
    }
    // 二式艦上偵察機
    if (items.some((v) => v.data.id === 61)) {
      const remodel = Math.max.apply(null, items.filter((v) => v.data.id === 61).map((v) => v.remodel));
      // 基本ボーナス
      if (remodel === 10) sumBonus += 3;
      else if (remodel >= 6) sumBonus += 2;
      else if (remodel >= 2) sumBonus += 1;

      if (type2 === 17) {
        // 蒼龍
        if (remodel >= 8) sumBonus += 4;
        else if (remodel >= 1) sumBonus += 3;
      } else if (type2 === 25) {
        // 飛龍
        if (remodel >= 1) sumBonus += 2;
      } else if ([308, 309, 360].includes(id)) {
        // 鈴熊 瑞鳳改二乙
        if (remodel >= 1) sumBonus += 1;
      }
    }
    // 彩雲
    if (items.some((v) => v.data.id === 54 && v.remodel >= 2)) {
      sumBonus += 1;
    }
    // 彩雲(偵四)
    if (items.some((v) => v.data.id === 273 && v.remodel >= 2)) {
      sumBonus += 1;
    }
    // 試製景雲
    if (items.some((v) => v.data.id === 151 && v.remodel >= 2)) {
      const remodel = Math.max.apply(null, items.filter((v) => v.data.id === 151).map((v) => v.remodel));
      // 基本ボーナス
      if (remodel === 10) sumBonus += 3;
      else if (remodel >= 6) sumBonus += 2;
      else if (remodel >= 2) sumBonus += 1;
    }

    // 累積可能装備ボーナス
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      // 紫雲
      if (item.data.id === 118) {
        // 大淀型
        if (type2 === 52) {
          if (item.remodel === 10) sumBonus += 3;
          else sumBonus += 2;
        }
      }
      // Late298B
      if (item.data.id === 194) {
        // Richelieu コマちゃん 瑞穂 神威
        if ([62, 70, 72, 79].includes(type2)) sumBonus += 2;
      }
      // Swordfish(水上機型)
      if (item.data.id === 367) {
        // Gotland コマちゃん 瑞穂 神威
        if ([62, 70, 72, 89].includes(type2)) sumBonus += 1;
      }
      // Swordfish Mk.III改(水上機型)
      if (item.data.id === 368) {
        // Gotoland
        if (type2 === 89) sumBonus += 3;
        // コマちゃん 瑞穂 神威
        else if ([62, 70, 72].includes(type2)) sumBonus += 2;
      }
      // Swordfish Mk.III改(水上機型/熟練)
      if (item.data.id === 369) {
        // Gotoland コマちゃん
        if ([70, 89].includes(type2)) sumBonus += 3;
        // 瑞穂 神威
        else if ([62, 72].includes(type2)) sumBonus += 2;
      }
      // 装甲艇(AB)
      if (item.data.id === 408) {
        // 神州丸
        if (type2 === 97) sumBonus += 2;
        // あきつ丸か駆逐
        else if (type2 === 45 || type === 2) sumBonus += 1;
      }
      // 熟練見張員
      if (isJapanese && item.data.id === 129) {
        // 日本軽巡 重巡
        if ([3, 4, 5, 6].includes(type)) sumBonus += 3;
        // 日本駆逐
        else if (type === 2) sumBonus += 1;
      }
      // 水雷戦隊 熟練見張員
      if (isJapanese && item.data.id === 412) {
        // 日本軽巡級
        if ([3, 4].includes(type)) sumBonus += 3;
        // 日本駆逐 重巡級
        else if ([2, 5, 6].includes(type)) sumBonus += 1;
      }
    }

    return sumBonus;
  }

  /**
   * 装備対潜ボーナス + 装備素対潜の合計を取得
   * @private
   * @return {number}
   * @memberof Ship
   */
  private getBonusAsw(): number {
    let sumAsw = 0;
    let sumBonusAsw = 0;
    const {
      type, type2, originalId, id,
    } = this.data;
    const items = this.items.concat(this.exItem);
    let sanshikiKaiCount = 0;
    let sanshikiKaiRemodel = 0;
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      // 素の対潜値を加算
      sumAsw += item.data.asw;

      // 単純累積ボーナス対潜値を加算
      if (item.data.id === 47) {
        // 三式水中探信儀
        if ([271, 273, 80, 257, 119, 225].includes(originalId)) {
          // 神風 春風 時雨 山風 舞風 朝霜 => +3
          sumBonusAsw += 3;
        } else if ([70, 73, 214, 167, 170, 327].includes(originalId)) {
          // 潮 雷 山雲 磯風 浜風 岸波 => +2
          sumBonusAsw += 2;
        }
      } else if (item.data.id === 149) {
        // 四式水中聴音機
        if (type2 === 54) {
          // 秋月型 => +1
          sumBonusAsw += 1;
        } else if ([656, 141, 488, 160, 622, 623].includes(id)) {
          // 雪風改二 五十鈴改二 由良改二 那珂改二 夕張改二/改二特 => +1
          sumBonusAsw += 1;
        } else if (id === 624) {
          // 夕張改二丁 => +3
          sumBonusAsw += 3;
        } else if (id === 662) {
          // 能代改二 => +2
          sumBonusAsw += 2;
        }
      } else if (item.data.id === 438) {
        // 三式水中探信儀改の数と改修値だけカウント
        sanshikiKaiCount += 1;
        sanshikiKaiRemodel = Math.max(sanshikiKaiRemodel, item.remodel);
      } else if (item.data.id === 129 && type === SHIP_TYPE.DD && Const.isJPN(type2)) {
        // 熟練見張員 日本駆逐 => +2
        sumBonusAsw += 2;
      } else if (type2 === 56 && items.some((v) => [44, 45, 287, 288].includes(v.data.id))) {
        // 香取・鹿島 国産爆雷投射機で対潜+2
        sumBonusAsw += 2;
      } else if (item.data.id === 287) {
        // 三式爆雷投射機 集中配備
        if ([656, 141, 488, 160, 624].includes(id)) {
          // 雪風改二 五十鈴改二 由良改二 那珂改二 夕張改二丁 => +1
          sumBonusAsw += 1;
        } else if (id === 662) {
          // 能代改二 => +3
          sumBonusAsw += 2;
        }
      } else if (item.data.id === 287) {
        // 試製15cm9連装対潜噴進砲
        if ([656, 141, 488, 160, 624].includes(id)) {
          // 雪風改二 五十鈴改二 由良改二 那珂改二  => +2
          sumBonusAsw += 2;
        } else if (id === 624) {
          // 夕張改二丁 => +3
          sumBonusAsw += 3;
        } else if (id === 662) {
          // 能代改二 => +4
          sumBonusAsw += 4;
        }
      } else if (item.data.id === 377) {
        // RUR-4A Weapon Alpha改
        if (id === 629) {
          // Fletcher Mk.II => +3
          sumBonusAsw += 3;
        } else if (Const.USA.includes(type2)) {
          // アメリカ艦 => +2
          sumBonusAsw += 2;
        } else if (Const.GBR.includes(type2) || id === 651 || id === 656 || Const.AUS.includes(type2)) {
          // イギリス艦 or 丹陽 or 雪風改二 or Perth => +1
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 378) {
        // 対潜短魚雷(試作初期型)
        if (id === 629) {
          // Fletcher Mk.II => +4
          sumBonusAsw += 4;
        } else if (Const.USA.includes(type2)) {
          // アメリカ艦 => +3
          sumBonusAsw += 3;
        } else if (Const.GBR.includes(type2)) {
          // イギリス艦 => +2
          sumBonusAsw += 2;
        } else if (id === 651 || id === 656 || Const.AUS.includes(type2)) {
          // 丹陽 or 雪風改二 or Perth => +1
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 382) {
        // 12cm単装高角砲E型
        if (type === SHIP_TYPE.DE) {
          // 海防艦 => +1
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 229) {
        // 12.7cm単装高角砲(後期型)
        if (id === 656) {
          // 雪風改二 => +2
          sumBonusAsw += 2;
        }
      } else if (item.data.id === 379) {
        // 12.7cm単装高角砲改二
        if ([656, 141, 487, 488, 160, 624].includes(id) || type2 === 21) {
          // 雪風改二 五十鈴改二 鬼怒改二 由良改二 那珂改二 夕張改二丁 天龍型 => +2
          sumBonusAsw += 2;
        } else if (id === 624) {
          // 夕張改二丁 => +3
          sumBonusAsw += 3;
        } else if (type2 === 34 || [22, 219, 23, 220, 56, 224, 113, 289].includes(id)) {
          // 五十鈴 鬼怒 那珂 由良 夕張
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 380) {
        // 12.7cm連装高角砲改二
        if ([141, 487, 488, 160, 624].includes(id) || type2 === 21) {
          // 五十鈴改二 鬼怒改二 由良改二 那珂改二 夕張改二丁 天龍型 => +2
          sumBonusAsw += 2;
        } else if (id === 624) {
          // 夕張改二丁 => +3
          sumBonusAsw += 3;
        } else if (type2 === 34 || [22, 219, 23, 220, 56, 224, 113, 289].includes(id)) {
          // 五十鈴 鬼怒 那珂 由良 夕張
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 310) {
        // 14cm連装砲改
        if ([622, 623, 624].includes(id)) {
          // 夕張改二シリーズ => +1
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 82 || item.data.id === 302) {
        // 九七式艦攻(九三一空)シリーズ
        if (type2 === 76) {
          // 大鷹型 => +1
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 344 || item.data.id === 345) {
        // 九七式艦攻の名前の長いやつ
        if ([883, 888, 555, 560].includes(id)) {
          // 龍鳳改二/戊 瑞鳳改二/乙 => +2
          sumBonusAsw += 2;
        } else if ([282, 318].includes(id)) {
          // 龍鳳改 / 祥鳳改 => +1
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 344 || item.data.id === 345) {
        // 九七式艦攻の名前の長いやつ
        if ([883, 888, 555, 560].includes(id)) {
          // 龍鳳改二/戊 瑞鳳改二/乙 => +2
          sumBonusAsw += 2;
        } else if ([282, 318].includes(id)) {
          // 龍鳳改 / 祥鳳改 => +1
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 372) {
        // 天山一二型甲
        if (type2 === 11 || type2 === 51) {
          // 龍鳳 / 祥鳳型 => +1
          sumBonusAsw += 1;
        }
      }
    }

    // 累積無しボーナス
    // 水雷戦隊 熟練見張員 日本駆逐 => +2
    if (items.some((v) => v.data.id === 412) && type === SHIP_TYPE.DD && Const.isJPN(type2)) {
      sumBonusAsw += 2;
    }

    if (type2 === 56 && items.some((v) => [46, 47, 149, 438].includes(v.data.id))) {
      // 香取・鹿島 国産ソナーで対潜+2
      sumBonusAsw += 2;
    } else if (sanshikiKaiCount) {
      // 三式水中探信儀改
      // 改修ボーナス
      if (sanshikiKaiRemodel >= 8) {
        if ([476, 363, 145, 588, 667, 578].includes(id)) {
          // 神風改 春風改 時雨改二 山風改二 改二丁 朝霜改二 => +2
          sumBonusAsw += 2;
        }
      } else if (sanshikiKaiRemodel >= 4) {
        if ([476, 363, 145, 588, 667, 578].includes(id)) {
          // 神風改 春風改 時雨改二 山風改二 改二丁 朝霜改二 => +1
          sumBonusAsw += 1;
        }
      }
      // 単体ボーナス
      if ([271, 273, 80, 257, 119].includes(originalId)) {
        // 神風 春風 時雨 山風 舞風 => +5, +8
        if (sanshikiKaiCount === 1) {
          sumBonusAsw += 5;
        } else if (sanshikiKaiCount >= 2) {
          sumBonusAsw += 8;
        }
      } else if ([70, 73, 214, 167, 170].includes(originalId)) {
        //  潮 雷 山雲 磯風 浜風 => +4, +6
        if (sanshikiKaiCount === 1) {
          sumBonusAsw += 4;
        } else if (sanshikiKaiCount >= 2) {
          sumBonusAsw += 6;
        }
      } else if (originalId === 225) {
        // 朝霜 => +4, +7
        if (sanshikiKaiCount === 1) {
          sumBonusAsw += 4;
        } else if (sanshikiKaiCount >= 2) {
          sumBonusAsw += 7;
        }
      } else if (originalId === 327) {
        // 岸波 => +3, +5
        if (sanshikiKaiCount === 1) {
          sumBonusAsw += 3;
        } else if (sanshikiKaiCount >= 2) {
          sumBonusAsw += 5;
        }
      } else if ([258, 259, 84].includes(originalId)) {
        // 海風 江風 涼風 => +2
        sumBonusAsw += 2;
      } else if ([141, 488, 160].includes(id) || [385, 411].includes(originalId)) {
        // 五十鈴改二 由良改二 那珂改二 石垣 御蔵 => +1
        sumBonusAsw += 1;
      } else if (type === SHIP_TYPE.DD && Const.isJPN(type2)) {
        // その他日本駆逐
        sumBonusAsw += 1;
      }
    }

    if (items.some((v) => v.data.id === 439)) {
      // Hedgehog(初期型)
      if (Const.USA.includes(type2) || Const.GBR.includes(type2)) {
        // アメリカ艦 イギリス艦 => +3
        sumBonusAsw += 3;
      } else if (type === SHIP_TYPE.DE || type2 === 101) {
        // 海防艦 or 松型 => +2
        sumBonusAsw += 2;
      } else if (type === SHIP_TYPE.DD || type === SHIP_TYPE.CL || type === SHIP_TYPE.CT) {
        // その他軽巡 駆逐 練巡
        sumBonusAsw += 1;
      }
    }

    // 12cm単装砲改二 + 水上電探
    if ((type2 === 74 || type2 === 77) && items.some((v) => v.data.id === 293) && this.surfaceRadarCount) {
      // 占守型・択捉型 => +1
      sumBonusAsw += 1;
    }

    this.itemBonusAsw = sumBonusAsw;

    return sumAsw;
  }

  /**
   * 先制対潜の可否を判定
   * @private
   * @return {boolean} 可能ならtrue
   * @memberof Ship
   */
  private getEnabledTSBK(): boolean {
    if ([141, 478, 624, 394, 893, 681].includes(this.data.id) || this.data.type2 === 91) {
      // 無条件発動 順に五十鈴改二 龍田改二 夕張改二丁 J級改 Samuel B.Roberts改 Fletcher級
      return true;
    }

    const { type } = this.data;
    const items = this.items.concat(this.exItem);
    // ソナー有無
    const hasSonar = items.some((v) => v.data.apiTypeId === 14 || v.data.apiTypeId === 40);

    if (type === SHIP_TYPE.DE) {
      // 海防艦
      if (this.actualAsw >= 60 && hasSonar) {
        // => 対潜値60 + ソナー有
        return true;
      }
      if (this.actualAsw >= 75) {
        // => 対潜値75 + 装備対潜値合計が4以上
        let sumAsw = 0;
        for (let i = 0; i < items.length; i += 1) {
          sumAsw += items[i].data.asw;
        }
        return sumAsw >= 4;
      }
    }

    if (type === SHIP_TYPE.DD || type === SHIP_TYPE.CL || type === SHIP_TYPE.CLT || type === SHIP_TYPE.CT || type === SHIP_TYPE.AO || type === SHIP_TYPE.AO_2) {
      // 駆逐 軽巡 練巡 雷巡 補給
      // => 対潜値100 + ソナー
      return this.actualAsw >= 100 && hasSonar;
    }

    if ((this.data.type2 === 76 && this.data.name.indexOf('改') >= 0) || this.data.id === 646) {
      // 大鷹型改 改二 or 加賀改二護
      // => 対潜値1以上の艦攻/艦爆 or 対潜哨戒機 or 回転翼機
      return items.some((v) => (v.isAttacker && v.data.asw >= 1) || v.data.apiTypeId === 25 || v.data.apiTypeId === 26);
    }

    if (type === SHIP_TYPE.CVL) {
      // 軽空母/護衛空母
      const hasASWPlane = items.some((v) => v.data.apiTypeId === 25 || v.data.apiTypeId === 26);
      if (hasSonar && this.actualAsw >= 50 && (hasASWPlane || items.some((v) => v.data.apiTypeId === 8 && v.data.asw >= 7))) {
        // => 対潜値50 + ソナー + (対潜値7以上の艦攻 or 対潜哨戒機 or 回転翼機)
        return true;
      }
      if (this.actualAsw >= 65 && (hasASWPlane || items.some((v) => v.data.apiTypeId === 8 && v.data.asw >= 7))) {
        // => 対潜値65 + (対潜値7以上の艦攻 or 対潜哨戒機 or 回転翼機)
        return true;
      }
      if (hasSonar && this.actualAsw >= 100) {
        // => 対潜値100 + ソナー + (対潜値1以上の艦攻/艦爆 or 対潜哨戒機 or 回転翼機)
        return hasASWPlane || items.some((v) => v.isAttacker && v.data.asw >= 1);
      }
    }

    if (this.data.id === 554) {
      // 日向改二
      if (items.some((v) => v.data.id === 326 || v.data.id === 327)) {
        // => S-51J / S-51J改 どっちかが存在
        return true;
      }
      // => カ号 / オ号改 / オ号改二 の数が2以上
      return items.filter((v) => v.data.id === 69 || v.data.id === 324 || v.data.id === 325).length >= 2;
    }

    if (type === SHIP_TYPE.BBV || type === SHIP_TYPE.LHA) {
      // 陸軍と航空戦艦
      // => 対潜値100 + ソナー + (水上爆撃機 or 対潜哨戒機 or 回転翼機)
      return this.actualAsw >= 100 && hasSonar && items.some((v) => v.data.apiTypeId === 11 || v.data.apiTypeId === 25 || v.data.apiTypeId === 26);
    }

    return false;
  }

  /**
   * 艦種 艦娘毎によるTPを返却
   * @private
   * @returns {number}
   * @memberof Ship
   */
  private getTransportPower(): number {
    // 艦種固定値
    switch (this.data.type) {
      case SHIP_TYPE.DD:
        return 5;

      case SHIP_TYPE.CL:
        // 鬼怒改二
        if (this.data.id === 487) {
          return 10;
        }
        return 2;

      case SHIP_TYPE.CT:
        return 6;

      case SHIP_TYPE.CAV:
        return 4;

      case SHIP_TYPE.BBV:
        return 7;

      case SHIP_TYPE.AO:
      case SHIP_TYPE.AO_2:
        return 15;

      case SHIP_TYPE.AV:
        return 9;

      case SHIP_TYPE.LHA:
        return 12;

      case SHIP_TYPE.SSV:
        return 1;

      case SHIP_TYPE.AS:
        return 7;

      default:
        return 0;
    }
  }

  /**
   * 噴進弾幕発動率を返却
   * @private
   * @return {*}
   * @memberof Ship
   */
  private getHunshinRate() {
    let rate = 0;
    // 噴進砲改二チェック
    const items = [...this.items, this.exItem];
    const hunshinCount = items.filter((v) => v.data.id === 274).length;

    // 艦種チェック
    if (hunshinCount && [6, 7, 10, 11, 16, 18].includes(this.data.type)) {
      // 艦船加重対空値(改式) = int(素対空 / 2 + Σ(装備対空値 * 装備倍率))
      const antiAirWeight = this.antiAir + 2 * _.sum(items.map((v) => v.antiAirWeight));
      rate = (0.9 * Math.min(this.luck, 50) + Math.floor(antiAirWeight)) / 281;

      // 複数積みボーナス
      if (hunshinCount === 2) {
        rate += 0.15;
      } else if (hunshinCount >= 3) {
        rate += 0.3;
      }

      // 伊勢型ボーナス
      if (this.data.type2 === 2) {
        rate += 0.25;
      }
    }

    return 100 * rate;
  }
}
