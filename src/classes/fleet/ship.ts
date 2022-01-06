import ShipMaster from './shipMaster';
import Item from '../item/item';
import Const, { SHIP_TYPE } from '../const';
import AntiAirCutIn from '../aerialCombat/antiAirCutIn';

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

export default class Ship {
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
  private readonly specialKokakuCount: number;

  /** 高角砲所持数 */
  private readonly kokakuCount: number;

  /** 特殊機銃所持数 */
  private readonly specialKijuCount: number;

  /** 機銃所持数 */
  private readonly kijuCount: number;

  /** 対空電探所持数 */
  private readonly antiAirRadarCount: number;

  /** 高射装置所持数 */
  private readonly koshaCount: number

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

    // 装備が空だったらマスタのスロット数だけ作成
    if (this.items.length === 0) {
      for (let i = 0; i < this.data.slotCount; i += 1) {
        this.items.push(new Item({ slot: this.data.slots[i] }));
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
    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      // 装備防空ボーナス
      this.antiAirBonus += item.antiAirBonus;
      if (item.fullSlot > 0 && item.isPlane && !item.isRecon) {
        // 通常制空値
        this.fullAirPower += item.fullAirPower;
      }

      // ジェット機所持
      if (!this.hasJet && item.isJet) {
        this.hasJet = true;
      }

      // 高角砲カウント
      if (item.data.iconTypeId === 16 && item.data.antiAir <= 7) {
        this.kokakuCount += 1;
      }
      // 特殊高角砲カウント
      if (item.data.iconTypeId === 16 && item.data.antiAir > 7) {
        this.specialKokakuCount += 1;
      }
      // 機銃カウント
      if (item.data.apiTypeId === 21 && item.data.antiAir <= 8) {
        this.kijuCount += 1;
      }
      // 特殊機銃カウント
      if (item.data.apiTypeId === 21 && item.data.antiAir > 8) {
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

      // 装備索敵関係
      this.itemsScout += item.actualScout;
      // 輸送量
      this.tp += item.tp;
    }
    // 補強増設分
    this.antiAirBonus += this.exItem.antiAirBonus;
    this.itemsScout += this.exItem.actualScout;
    this.tp += this.exItem.tp;

    // 発動可能対空CI取得
    this.antiAirCutIn = this.getAntiAirCutIn();

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
    const { items } = this;
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

  /**
   * 発動可能な対空CI種別を返却
   * @private
   * @return {*}  {AntiAirCutIn[]}
   * @memberof Ship
   */
  private getAntiAirCutIn(): AntiAirCutIn[] {
    const cutInIds: number[] = [];
    // 装備一覧
    const items = this.items.concat(this.exItem);
    const {
      kokakuCount, specialKijuCount, specialKokakuCount, antiAirRadarCount, koshaCount, kijuCount,
    } = this;
    // 艦型
    const { type2 } = this.data;
    // 艦娘id
    const shipId = this.data.id;
    // 高角砲の数
    const allKokaku = kokakuCount + specialKokakuCount;
    // 高角砲の有無
    const hasKoukaku = allKokaku > 0;
    // 三式弾の有無
    const hasSanshiki = items.some((v) => v.data.apiTypeId === 18);

    if (type2 === 54) {
      // 秋月型
      // 電探があるか？ (対空値関係なし)
      const hasRadar = items.some((v) => v.data.apiTypeId === 11);
      // 1種 (高角砲2, 電探)
      if (allKokaku >= 2 && hasRadar) cutInIds.push(1);
      // 2種 (高角砲, 電探)
      else if (hasKoukaku && hasRadar) cutInIds.push(2);
      // 3種 (高角砲2) 共存なし
      else if (allKokaku >= 2) cutInIds.push(3);
    } else {
      // Atlanta級
      if (type2 === 99) {
        const hasGFCSMk37 = items.some((v) => v.data.id === 307);
        // GFCS Mk.37+5inch連装両用砲(集中配備) × 2
        if (items.filter((v) => v.data.id === 363).length >= 2) {
          // 38種
          cutInIds.push(38);
          if (hasGFCSMk37) cutInIds.push(40);
          cutInIds.push(41);
        }
        // GFCS Mk.37+5inch連装両用砲(集中配備), 5inch連装両用砲(集中配備)
        if (items.some((v) => v.data.id === 363) && items.some((v) => v.data.id === 362)) {
          // 39種
          cutInIds.push(39);
          // 40種 (GFCS Mk.37)
          if (hasGFCSMk37 && !cutInIds.includes(40)) cutInIds.push(40);
          // 41種
          if (!cutInIds.includes(41)) cutInIds.push(41);
        }
        // 5inch連装両用砲(集中配備) * 2
        if (items.filter((v) => v.data.id === 362).length >= 2) {
          // 40種 (GFCS Mk.37)
          if (hasGFCSMk37 && !cutInIds.includes(40)) cutInIds.push(40);
          // 41種
          if (!cutInIds.includes(41)) cutInIds.push(41);
        }
      } else if (type2 === 91) {
        // Fletcher級
        const hasGFCSMk37 = items.some((v) => v.data.id === 307);
        // 34種 (5inch単装砲 Mk.30改+GFCS Mk.37, 5inch単装砲 Mk.30改+GFCS Mk.37)
        if (items.filter((v) => v.data.id === 308).length >= 2) cutInIds.push(34);
        // 35種 (5inch単装砲 Mk.30改+GFCS Mk.37, 5inch単装砲 Mk.30 / 改)
        if (items.some((v) => v.data.id === 308) && items.some((v) => v.data.id === 284 || v.data.id === 313)) cutInIds.push(35);
        // 36種 (5inch単装砲 Mk.30 / 改 2種, GFCS Mk.37)
        if (items.filter((v) => v.data.id === 284 || v.data.id === 313).length >= 2 && hasGFCSMk37) cutInIds.push(36);
        // 37種 (5inch単装砲 Mk.30改 2種)
        if (items.filter((v) => v.data.id === 313).length >= 2) cutInIds.push(37);
      } else if (shipId === 228) {
        // 摩耶様改二
        // 10種 (高角砲, 特殊機銃, 対空電探)
        if (hasKoukaku && specialKijuCount && antiAirRadarCount) cutInIds.push(10);
        // 11種 (高角砲, 特殊機銃)
        if (hasKoukaku && specialKijuCount) cutInIds.push(11);
      } else if (shipId === 141) {
        // 五十鈴改二
        // 14種 (高角砲, 対空機銃, 対空電探)
        if (hasKoukaku && kijuCount && antiAirRadarCount) cutInIds.push(14);
        // 15種 (高角砲, 対空機銃)
        if (hasKoukaku && kijuCount) cutInIds.push(15);
      } else if (shipId === 270 || shipId === 422) {
        // 霞改二乙 夕張改二
        // 16種 (高角砲, 対空機銃, 対空電探)
        if (hasKoukaku && kijuCount && antiAirRadarCount) cutInIds.push(16);
        // 17種 (高角砲, 対空機銃)
        if (hasKoukaku && kijuCount) cutInIds.push(17);
      } else if (shipId === 287) {
        // 鬼怒改二
        // 19種 (よわ高角砲, 特殊機銃)
        if (kokakuCount > 0 && specialKijuCount) cutInIds.push(19);
      } else if (shipId === 288) {
        // 由良改二
        // 21種 (高角砲, 対空電探)
        if (hasKoukaku && antiAirRadarCount) cutInIds.push(21);
      } else if ([102, 103, 353, 354].includes(shipId)) {
        // 伊勢型改 / 改二
        // 25種 (噴進砲改二, 対空電探, 三式弾)
        if (antiAirRadarCount && hasSanshiki && items.some((v) => v.data.id === 274)) cutInIds.push(25);
      }

      // 汎用
      // 全ての水上艦 => 判定できないが必須装備が潜水艦を弾ける
      // 戦艦 航空戦艦 => 判定できないが大口径主砲を積めるのが戦艦だけ

      // 4種 (大口径, 三式弾, 高射装置, 対空電探)
      if (items.some((v) => v.data.apiTypeId === 3) && hasSanshiki && koshaCount && antiAirRadarCount) cutInIds.push(4);
      // 5種 (特殊高角砲2, 対空電探)
      if (specialKokakuCount >= 2 && antiAirRadarCount) cutInIds.push(5);
      // 6種 (大口径, 三式弾, 高射装置)
      if (items.some((v) => v.data.apiTypeId === 3) && hasSanshiki && koshaCount) cutInIds.push(6);
      // 8種 (特殊高角砲, 対空電探)
      if (specialKokakuCount && antiAirRadarCount) cutInIds.push(8);
      // 7種 (高角砲, 高射装置, 対空電探)
      if (hasKoukaku && koshaCount && antiAirRadarCount) cutInIds.push(7);

      if (shipId === 148 || shipId === 346) {
        // 武蔵改 / 改二
        // 26種 (武蔵改二, 10cm改+増設, 対空電探)
        if (shipId === 346 && antiAirRadarCount && items.some((v) => v.data.id === 275)) cutInIds.push(26);
        // 28種 (噴進砲改二, 対空電探)
        if (antiAirRadarCount && items.some((v) => v.data.id === 274)) cutInIds.push(28);
      } else if ([102, 103, 353, 354].includes(shipId)) {
        // 伊勢型改 / 改二
        // 28種 (噴進砲改二, 対空電探)
        if (antiAirRadarCount && items.some((v) => v.data.id === 274)) cutInIds.push(28);
      } else if (shipId === 357 || shipId === 358) {
        // 磯風乙改 / 浜風乙改
        // 29種 (高角砲, 対空電探)
        if (hasKoukaku && antiAirRadarCount) cutInIds.push(29);
      }

      // 9種 (高角砲, 高射装置)
      if (hasKoukaku && koshaCount) cutInIds.push(9);

      // Gotland改以降
      if (shipId === 379 || shipId === 430) {
        // 33種 (高角砲, 通常機銃)
        if (hasKoukaku && kijuCount) cutInIds.push(33);
      }

      // 12種 (特殊機銃, 素対空値3以上の機銃, 対空電探)
      if (specialKijuCount && items.filter((v) => v.data.apiTypeId === 21 && v.data.antiAir >= 3).length >= 2 && antiAirRadarCount) cutInIds.push(12);

      // 皐月改二
      if (shipId === 218) {
        // 18種 (特殊機銃)
        if (specialKijuCount) cutInIds.push(18);
      } else if (shipId === 287) {
        // 鬼怒改二
        // 20種 (特殊機銃)
        if (specialKijuCount) cutInIds.push(20);
      } else if (shipId === 348) {
        // 文月改二
        // 22種 (特殊機銃)
        if (specialKijuCount) cutInIds.push(22);
      } else if (shipId === 329 || shipId === 330) {
        // UIT-25 伊504
        // 23種 (通常機銃)
        if (kijuCount) cutInIds.push(23);
      } else if (shipId === 278) {
        // 龍田改二
        // 24種 (高角砲, 通常機銃)
        if (kokakuCount && kijuCount) cutInIds.push(24);
      } else if (shipId === 277) {
        // 天龍改二
        // 24種 (高角砲, 通常機銃)
        if (kokakuCount && kijuCount) cutInIds.push(24);
        // 30種 (高角砲3)
        if (allKokaku >= 3) cutInIds.push(30);
        // 31種 (高角砲2)
        if (allKokaku >= 2) cutInIds.push(31);
      } else if (shipId === 379 || shipId === 430) {
        // Gotland改以降
        // 30種 (高角砲3)
        if (allKokaku >= 3) cutInIds.push(30);
      } else if (Const.GBR.includes(type2) || (type2 === 6 && this.data.version >= 2)) {
        // 英国艦艇 / 金剛型改二以降
        // 32種 (16inch Mk.I三連装砲改+FCR type284, QF 2ポンド8連装ポンポン砲)
        if (items.some((v) => v.data.id === 300) && items.some((v) => v.data.id === 191)) cutInIds.push(32);
        // 32種 (20連装7inch UP Rocket Launchers, QF 2ポンド8連装ポンポン砲)
        else if (items.some((v) => v.data.id === 301) && items.some((v) => v.data.id === 191)) cutInIds.push(32);
        // 32種 (20連装7inch UP Rocket Launchers, 20連装7inch UP Rocket Launchers)
        else if (items.filter((v) => v.data.id === 301).length >= 2) cutInIds.push(32);
      }
    }

    // マスタより、対空CIオブジェクトを格納
    const antiAirCutIns: AntiAirCutIn[] = [];
    // 優先度順により、先に格納された対空CIの発生率より低いものは、格納すらしない
    let maxRate = 0;
    for (let i = 0; i < cutInIds.length; i += 1) {
      const cutinId = cutInIds[i];
      const cutIn = Const.ANTIAIR_CUTIN.find((v) => v.id === cutinId);
      if (!cutIn) continue;

      let rate = cutIn.rate / 101;

      if (cutIn.id < 34 && maxRate < rate) {
        // 既に発動可能な対空CIより発動率が高いなら格納OK ただし先に判定に入っている種別分確率を差っ引く
        rate -= maxRate;
        maxRate += rate;
      }

      // 発動率があるなら格納
      if (rate > 0) {
        antiAirCutIns.push(new AntiAirCutIn(cutIn.id, cutIn.adj[0], cutIn.adj[1], rate));
      }
    }
    return antiAirCutIns;
  }
}
