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

  /** 索敵値 */
  public readonly scout: number;

  /** 全装備による索敵値 */
  public readonly itemsScout: number;

  /** 回避値 */
  public readonly avoid: number;

  /** 対潜値 */
  public readonly asw: number;

  /** 輸送量 */
  public readonly tp: number;

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

  /** 高射装置所持数 */
  public readonly koshaCount: number

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
    this.specialKijuCount = 0;
    this.antiAirRadarCount = 0;
    this.koshaCount = 0;

    // 以下、計算により算出するステータス
    // レベルより算出
    this.scout = this.getStatusFromLevel(this.data.maxScout, this.data.minScout);
    this.avoid = this.getStatusFromLevel(this.data.maxAvoid, this.data.minAvoid);
    this.asw = this.getStatusFromLevel(this.data.maxAsw, this.data.minAsw);
    // 索敵ボーナス
    this.bonusScout = this.getBonusScout();
    // 輸送量(艦娘分)
    this.tp = this.getTransportPower();

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

      if (item.fullSlot > 0 && item.isPlane && !item.isRecon) {
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
      // 高射装置カウント
      if (item.data.apiTypeId === 36) {
        this.koshaCount += 1;
      }
    }

    // 発動可能対空CI取得
    this.antiAirCutIn = ShootDownInfo.getAntiAirCutIn(this);

    // 防空ボーナス 小数切捨て
    this.antiAirBonus = Math.floor(this.antiAirBonus);

    // 装備もマスタもない場合空として計算対象から省く
    this.isEmpty = this.data.id === 0 && !this.items.some((v) => v.data.id > 0);
  }

  /**
   * 艦娘Lvにより算出可能なステータスを計算
   * @private
   * @param {number} max
   * @param {number} min
   * @returns {number}
   * @memberof Ship
   */
  private getStatusFromLevel(max: number, min: number): number {
    let value = 0;
    if (this.level === 99 && max > 0) {
      // Lv99ステ
      value = max;
    } else if (max > 0) {
      // Lv99以外 算出可能な場合
      value = Math.floor((max - min) * (this.level / 99) + min);
    } else {
      // 算出不可
      value = 0;
    }

    return value;
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
}
