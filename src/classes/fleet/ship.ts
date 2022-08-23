import sum from 'lodash/sum';
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
  /** 対潜 */
  asw?: number;
  /** 対空 */
  antiAir?: number;
  /** 耐久 */
  hp?: number;
  /** 随伴艦フラグ */
  isEscort?: boolean;
  /** 有効フラグ */
  isActive?: boolean;
  /** 出撃海域 */
  area?: number;
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

  /** 耐久 */
  public readonly hp: number;

  /** 計算で適用する運 */
  public readonly luck: number;

  /** 計算で適用する対空 */
  public readonly antiAir: number;

  /** 計算で適用する装甲 */
  public readonly actualArmor: number;

  /** 素の索敵値 */
  public readonly scout: number;

  /** 全装備による索敵値 */
  public readonly itemsScout: number;

  /** 回避値 */
  public readonly avoid: number;

  /** 対潜値 */
  public readonly asw: number;

  /** 改修分対潜値 */
  public readonly improveAsw: number;

  /** 装備による対潜上昇値 */
  public readonly itemAsw: number;

  /** 装備ボーナスによる対潜上昇値 */
  public readonly itemBonusAsw: number;

  /** 対潜合計(表示値) */
  public readonly actualAsw: number;

  /** 先制対潜可 */
  public readonly enabledTSBK: boolean;

  /** 最終的な射程 */
  public readonly actualRange: number;

  /** 輸送量 */
  public readonly tp: number;

  /** 出撃海域 */
  public readonly area: number;

  /** 噴進弾幕率 */
  public readonly hunshinRate: number;

  /** 有効無効 */
  public readonly isActive: boolean;

  /** 装備が空 計算対象として数えない */
  public readonly isEmpty: boolean;

  /** 防空ボーナス */
  public readonly antiAirBonus: number;

  /** 航空戦雷装ボーナス一覧 */
  public readonly torpedoBonuses: number[];

  /** 随伴艦フラグ */
  public readonly isEscort: boolean;

  /** 噴式機ありなし */
  public readonly hasJet: boolean;

  /** 制空値(搭載数満タン) */
  public readonly fullAirPower: number;

  /** 支援制空値 */
  public readonly supportAirPower: number;

  /** 対潜支援参加可能 */
  public readonly enabledASWSupport: boolean;

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

  /** 水偵/水爆の裝備索敵值 * int(sqrt(水偵/水爆の機數) */
  public readonly sumSPRos: number;

  /** 夜偵発動率 */
  public readonly nightContactRate: number;

  /** 装備ボーナス対空値合計 */
  public readonly totalBonusAntiAir: number;

  /** 固定撃墜 画面表示用 */
  public fixDown = 0;

  /** 割合撃墜 画面表示用 */
  public rateDown = 0;

  constructor(builder: ShipBuilder = {}) {
    if (builder.ship) {
      this.data = builder.master !== undefined ? builder.master : builder.ship.data;
      this.level = builder.level !== undefined ? builder.level : builder.ship.level;
      this.luck = builder.luck !== undefined ? builder.luck : builder.ship.luck;
      this.asw = builder.asw !== undefined ? builder.asw : builder.ship.asw;
      this.antiAir = builder.antiAir !== undefined ? builder.antiAir : builder.ship.antiAir;
      this.items = builder.items !== undefined ? builder.items.concat() : builder.ship.items.concat();
      this.exItem = builder.exItem !== undefined ? builder.exItem : builder.ship.exItem;
      this.isActive = builder.isActive !== undefined ? builder.isActive : builder.ship.isActive;
      this.isEscort = builder.isEscort !== undefined ? builder.isEscort : builder.ship.isEscort;
      this.hp = builder.hp !== undefined ? builder.hp : builder.ship.hp;
      this.area = builder.area !== undefined ? Math.max(builder.area) : Math.max(builder.ship.area);
    } else {
      this.data = builder.master !== undefined ? builder.master : new ShipMaster();
      this.level = builder.level !== undefined ? builder.level : 99;
      this.luck = builder.luck !== undefined ? builder.luck : this.data.luck;
      this.asw = builder.asw !== undefined ? builder.asw : Ship.getStatusFromLevel(this.level, this.data.maxAsw, this.data.minAsw);
      this.antiAir = builder.antiAir !== undefined ? builder.antiAir : this.data.antiAir;
      this.items = builder.items !== undefined ? builder.items.concat() : [];
      this.exItem = builder.exItem !== undefined ? builder.exItem : new Item();
      this.isActive = builder.isActive !== undefined ? builder.isActive : true;
      this.isEscort = builder.isEscort !== undefined ? builder.isEscort : false;
      this.hp = builder.hp !== undefined ? builder.hp : this.data.hp;
      this.area = builder.area !== undefined ? Math.max(builder.area) : 0;
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

    // レベルによる耐久修正
    if (this.level > 99 && this.hp < this.data.hp2) {
      this.hp = this.data.hp2;
    } else if (this.level <= 99 && (this.hp === this.data.hp2 || this.hp === 0)) {
      this.hp = this.data.hp;
    }

    this.fullAirPower = 0;
    this.supportAirPower = 0;
    this.antiAirBonus = 0;
    this.itemsScout = 0;
    this.itemAsw = 0;
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
    this.enabledASWSupport = false;
    this.sumSPRos = 0;

    // 以下、計算により算出するステータス
    // レベルより算出
    this.scout = Ship.getStatusFromLevel(this.level, this.data.maxScout, this.data.minScout);
    this.avoid = Ship.getStatusFromLevel(this.level, this.data.maxAvoid, this.data.minAvoid);
    this.improveAsw = Math.max(this.asw - Ship.getStatusFromLevel(this.level, this.data.maxAsw, this.data.minAsw), 0);

    // 索敵ボーナス
    this.bonusScout = this.getBonusScout();
    // 対潜ボーナス
    this.itemBonusAsw = this.getBonusAsw();
    // 対空ボーナス
    this.totalBonusAntiAir = this.getBonusAntiAir();
    // 輸送量(艦娘分)
    this.tp = this.getTransportPower();
    // 射程(基本値)
    this.actualRange = Math.max(this.data.range, 1);
    // 雷装ボーナス一覧
    this.torpedoBonuses = [];
    // 雷装ボーナス適用装備(最も雷装 or 爆装が高い)
    let maximumAttacker = new Item();

    // 対潜支援参加可能艦種
    const enabledASWSupport = [SHIP_TYPE.CVL, SHIP_TYPE.AV, SHIP_TYPE.AO, SHIP_TYPE.AO_2, SHIP_TYPE.LHA, SHIP_TYPE.CL, +SHIP_TYPE.CT].includes(this.data.type);

    let nightContactFailureRate = 1;
    // 装備一覧より取得
    const items = this.items.concat(this.exItem);
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];

      // 装備防空ボーナス
      this.antiAirBonus += item.antiAirBonus;
      // 装備索敵関係
      this.itemsScout += item.itemScout;
      // 対潜値
      this.itemAsw += item.data.asw;
      // 輸送量
      this.tp += item.tp;
      // 装甲値
      this.actualArmor += item.data.armor;
      // 射程(大きくなるなら)
      if (item.data.range > this.actualRange) {
        this.actualRange = item.data.range;
      }

      if (item.fullSlot > 0 && item.data.isPlane && !item.data.isRecon && !item.data.isABAttacker) {
        // 通常制空値
        this.fullAirPower += item.fullAirPower;
        this.supportAirPower += item.supportAirPower;
      }
      // ジェット機所持
      if (!this.hasJet && item.data.isJet) {
        this.hasJet = true;
      }

      if (item.fullSlot > 0 && (item.data.apiTypeId === 10 || item.data.apiTypeId === 11)) {
        // 水偵/水爆の裝備索敵值 * int(sqrt(水偵/水爆の機數)
        this.sumSPRos += item.data.scout * Math.floor(Math.sqrt(item.fullSlot));
      }

      // 雷装ボーナス
      if (item.data.isAttacker) {
        this.torpedoBonuses.push(this.getAttackerTorpedoBonus(item));
        item.attackerTorpedoBonus = 0;

        const temp = Math.max(maximumAttacker.data.torpedo, maximumAttacker.data.bomber);
        const value = Math.max(item.data.torpedo, item.data.bomber);
        if (temp < value) {
          maximumAttacker = item;
        }
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

      // 対潜支援参加可装備チェック
      if (!this.enabledASWSupport && enabledASWSupport && Const.ENABLED_ASW_SUPPORT.includes(item.data.apiTypeId)) {
        this.enabledASWSupport = true;
      }

      // 夜偵
      if (item.fullSlot && item.data.iconTypeId === 50) {
        // 夜偵発動率 = (int(sqrt(偵察機索敵值)*sqrt(Lv))) / 25
        nightContactFailureRate -= nightContactFailureRate * (Math.floor(Math.sqrt(item.data.scout) * Math.sqrt(this.level)) / 25);
      }
    }

    this.nightContactRate = 1 - nightContactFailureRate;

    // 雷装ボーナス適用装備抽出 & セット
    if (this.torpedoBonuses.length) {
      // 適用装備の雷装ボーナスプロパティを更新
      maximumAttacker.attackerTorpedoBonus = +this.torpedoBonuses.sort((a, b) => b - a)[0];
    }

    // 伊勢 / 日向 / 飛龍 / 蒼龍の改二 二式艦上偵察機で射程バフ +1
    if (this.items.some((v) => v.data.id === 61) && [553, 554, 196, 197].includes(this.data.id)) {
      this.actualRange += 1;
    }

    // アメリカ駆逐 / 丹陽 / 雪風改二
    if (this.data.type2 === 87 || this.data.type2 === 91 || this.data.id === 651 || this.data.id === 656) {
      // SGレーダー(初期型) 射程+1
      if (this.items.some((v) => v.data.id === 315)) {
        this.actualRange += 1;
      }
      // SGレーダー(後期型) 射程+1
      if (this.items.some((v) => v.data.id === 456)) {
        this.actualRange += 1;
      }
    }

    // 発動可能対空CI取得
    this.antiAirCutIn = ShootDownInfo.getAntiAirCutIn(this);

    // 防空ボーナス 小数切捨て 100倍されていたため戻す
    this.antiAirBonus = Math.floor(this.antiAirBonus / 100);

    if (this.kijuCount) {
      // 噴進率計算
      this.hunshinRate = this.getHunshinRate();
    }
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
      if (item.slot > 0 && (item.data.isAttacker || item.data.apiTypeId === 41)) {
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
    // SK レーダー
    if (items.some((v) => v.data.id === 278)) {
      // 米艦
      if (isAmerica) sumBonus += 1;
    }
    // SK＋SG レーダー
    if (items.some((v) => v.data.id === 279)) {
      // 米艦
      if (isAmerica) sumBonus += 2;
      // 英艦
      if (Const.GBR.includes(type2)) sumBonus += 1;
    }
    // 21号対空電探
    if (items.some((v) => v.data.id === 30)) {
      // 秋月型か最上改二
      if (type2 === 54 || id === 501 || id === 506) sumBonus += 2;
    }
    // 21号対空電探改二
    if (items.some((v) => v.data.id === 410)) {
      // 秋月型か最上改二
      if (type2 === 54 || id === 501 || id === 506) sumBonus += 2;
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
      if (id === 630) sumBonus += 9;
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
    if (id === 630 && items.some((v) => v.data.id === 368)) {
      // Gotland andra 1つめだけ
      sumBonus += 1;
    }
    // Swordfish Mk.III改(水上機型/熟練)
    if (id === 630 && items.some((v) => v.data.id === 369)) {
      // Gotland andra 1つめだけ
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
      } else if ([508, 509, 560].includes(id)) {
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
    // 装甲艇(AB)
    if (items.some((v) => v.data.id === 408)) {
      // 神州丸
      if (type2 === 97) sumBonus += 2;
      // あきつ丸か駆逐
      else if (type2 === 45 || type === 2) sumBonus += 1;
    }
    // SGレーダー(初期型)
    if (items.some((v) => v.data.id === 315)) {
      // 雪風改二 / 丹陽
      if (id === 651 || id === 656) {
        sumBonus += 3;
      }
    }
    // SGレーダー(後期型)
    if (items.some((v) => v.data.id === 456)) {
      // 雪風改二 / 丹陽
      if (id === 651 || id === 656) {
        sumBonus += 3;
      }
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
        // Gotland
        if (type2 === 89) sumBonus += 3;
        // コマちゃん 瑞穂 神威
        else if ([62, 70, 72].includes(type2)) sumBonus += 2;
      }
      // Swordfish Mk.III改(水上機型/熟練)
      if (item.data.id === 369) {
        // Gotland コマちゃん
        if ([70, 89].includes(type2)) sumBonus += 3;
        // 瑞穂 神威
        else if ([62, 72].includes(type2)) sumBonus += 2;
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
      // SGレーダー(初期型)
      if (item.data.id === 315) {
        // アメリカ人
        if (isAmerica) {
          sumBonus += 4;
        }
      }
      // SGレーダー(後期型)
      if (item.data.id === 456) {
        if (isAmerica) {
          // アメリカ人
          sumBonus += 4;
        } else if (Const.GBR.includes(this.data.type2)) {
          // イギリス人
          sumBonus += 2;
        }
      }
    }

    return sumBonus;
  }

  /**
   * 装備対潜ボーナス(フィット)の合計を取得
   * @private
   * @return {number}
   * @memberof Ship
   */
  private getBonusAsw(): number {
    let sumBonusAsw = 0;
    const {
      type, type2, originalId, id,
    } = this.data;
    const items = this.items.concat(this.exItem);
    let sanshikiKaiCount = 0;
    let sanshikiKaiRemodel = 0;
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];

      // 累積ボーナス対潜値算出
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
      } else if (item.data.id === 472) {
        // Mk.32 対潜魚雷(Mk.2落射機)
        if (id === 920) {
          // Samuel B.Roberts Mk.II => +3
          sumBonusAsw += 3;
        } else if (Const.USA.includes(type2)) {
          // アメリカ艦 => +2
          sumBonusAsw += 2;
        } else if (Const.GBR.includes(type2)) {
          // イギリス艦 => +1
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
      } else if (item.data.id === 373) {
        // 天山一二型甲改(空六号電探改装備機)
        if ([883, 888, 555, 560].includes(id)) {
          // 龍鳳改 / 龍鳳改二 / 戊 瑞鳳改二 / 乙 => +2
          sumBonusAsw += 2;
        } else if (type2 === 11 || type2 === 51) {
          // その他の 龍鳳 / 祥鳳型 => +1
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 374) {
        // 天山一二型甲改(熟練/空六号電探改装備機)
        if ([883, 888, 555, 560].includes(id)) {
          // 龍鳳改 / 龍鳳改二 / 戊 / 瑞鳳改二 / 乙 => +3
          sumBonusAsw += 3;
        } else if (type2 === 9 || type2 === 11 || type2 === 51) {
          // その他の 龍鳳 / 祥鳳型 / 最上型(鈴熊) => +2
          sumBonusAsw += 2;
        } else if (id === 296 || id === 297) {
          // ちとちよ改二 => +1
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 425) {
        // Barracuda Mk.III
        if (item.remodel >= 2 && Const.GBR.includes(type2)) {
          // 紅茶 => +4 / +3
          sumBonusAsw += item.remodel >= 6 ? 4 : 3;
        }
      } else if (item.data.id === 389) {
        // TBM-3W+3S
        if (id === 646) {
          // 加賀改二護 => +4
          sumBonusAsw += 4;
        } else if (Const.USA.includes(type2)) {
          // アメリカ艦 => +3
          sumBonusAsw += 3;
        }
      } else if (item.data.id === 305) {
        // Ju87C改二(KMX搭載機)
        if (originalId === 324) {
          // 神鷹 => +3
          sumBonusAsw += 3;
        } else if (type2 === 76) {
          // 大鷹 雲鷹 => +1
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 305 || item.data.id === 305) {
        // Ju87C改二(KMX搭載機)系列
        if (originalId === 324) {
          // 神鷹 => +3
          sumBonusAsw += 3;
        } else if (type2 === 76) {
          // その他大鷹型 => +1
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 19) {
        // 九六式艦戦
        if (type2 === 76) {
          // 大鷹型 => +3
          sumBonusAsw += 3;
        } else if (originalId === 25) {
          // 鳳翔 => +2
          sumBonusAsw += 2;
        }
      } else if (item.data.id === 228) {
        // 九六式艦戦改
        if (type2 === 76) {
          // 大鷹型 => +7
          sumBonusAsw += 7;
        } else if (originalId === 25) {
          // 鳳翔 => +6
          sumBonusAsw += 6;
        } else if (type === SHIP_TYPE.CVL) {
          // その他軽空母 => +2
          sumBonusAsw += 2;
        }
      } else if (item.data.id === 375) {
        // XF5U パンケーキ
        if (originalId === 7) {
          // 加賀 => +1
          sumBonusAsw += 4;
        } else if (Const.USA.includes(type2)) {
          // アメリカ艦 => +3
          sumBonusAsw += 3;
        }
      } else if (item.data.id === 304) {
        // S9 Osprey
        if ([4, 16, 20, 41].includes(type2)) {
          // 球磨型 長良型 川内型 阿賀野型 => +1
          sumBonusAsw += 1;
        } else if (type2 === 89) {
          // Gotland => +2
          sumBonusAsw += 2;
        }
      } else if (item.data.id === 370) {
        // Swordfish Mk.II改(水偵型)
        if (Const.GBR.includes(type2) || type2 === 70 || type2 === 89) {
          // イギリス艦 ゴト コマ => +3
          sumBonusAsw += 3;
        } else if (type2 === 62 || type2 === 72) {
          // 瑞穂 神威 => +2
          sumBonusAsw += 2;
        }
      } else if (item.data.id === 371) {
        // Fairey Seafox改
        if (type2 === 89) {
          // Gotland => +2
          sumBonusAsw += 2;
        } else if (Const.GBR.includes(type2)) {
          // イギリス艦 コマ => +1
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 322) {
        // 瑞雲改二(六三四空)
        if (id === 553 || id === 554) {
          // 伊勢型改二 => +1
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 323) {
        // 瑞雲改二(六三四空/熟練)
        if (id === 553 || id === 554) {
          // 伊勢型改二 => +2
          sumBonusAsw += 2;
        }
      } else if (item.data.id === 367) {
        // Swordfish(水上機型)
        if (type2 === 70 || type2 === 89) {
          // ゴト コマ => +1
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 368) {
        // Swordfish Mk.III改(水上機型)
        if (type2 === 70 || type2 === 89) {
          // ゴト コマ => +3
          sumBonusAsw += 3;
        } else if (type2 === 62 || type2 === 72) {
          // 瑞穂 神威 => +2
          sumBonusAsw += 2;
        }
      } else if (item.data.id === 369) {
        // Swordfish Mk.III改(水上機型/熟練)
        if (type2 === 89) {
          // Gotland => +4
          sumBonusAsw += 4;
        } else if (type2 === 70) {
          // コマ => +3
          sumBonusAsw += 3;
        } else if (type2 === 62 || type2 === 72) {
          // 瑞穂 神威 => +2
          sumBonusAsw += 2;
        }
      } else if (item.data.id === 69) {
        // カ号観測機
        if (id === 553) {
          // 伊勢改二 => +1
          sumBonusAsw += 1;
        } else if (id === 554 || id === 646) {
          // 日向改二 加賀改二護 => +2
          sumBonusAsw += 2;
        }
      } else if (item.data.id === 324 || item.data.id === 325) {
        // オ号観測機改 / 改二
        if (id === 553) {
          // 伊勢改二 => +2
          sumBonusAsw += 2;
        } else if (id === 554 || id === 646) {
          // 日向改二 加賀改二護 => +3
          sumBonusAsw += 3;
        }
      } else if (item.data.id === 326) {
        // S-51J
        if (id === 553) {
          // 伊勢改二 => +3
          sumBonusAsw += 3;
        } else if (id === 554) {
          // 日向改二 => +4
          sumBonusAsw += 4;
        } else if (id === 646) {
          // 加賀改二護 => +5
          sumBonusAsw += 5;
        }
      } else if (item.data.id === 327) {
        // S-51J改
        if (id === 553) {
          // 伊勢改二 => +4
          sumBonusAsw += 4;
        } else if (id === 554) {
          // 日向改二 => +5
          sumBonusAsw += 5;
        } else if (id === 646) {
          // 加賀改二護 => +6
          sumBonusAsw += 6;
        }
      } else if (item.data.id === 408) {
        // 装甲艇(AB艇)
        if (type2 === 45) {
          // あきつ丸 => +1
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 408 || item.data.id === 409) {
        // 装甲艇(AB艇) / 武装大発
        if (type2 === 45) {
          // あきつ丸 => +1
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 455) {
        // 試製 長12.7cm連装砲A型改四
        if (id === 647) {
          // 浦波改二 => +1
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 70) {
        // 三式指揮連絡機
        if (type2 === 115) {
          // 山汐丸 => +1
          sumBonusAsw += 1;
        }
      } else if (item.data.id === 451) {
        // 三式指揮連絡機改
        if (item.remodel >= 8) {
          if (type2 === 115) {
            // 山汐丸 => +5
            sumBonusAsw += 5;
          } else if (type2 === 45) {
            // あきつ丸 => +4
            sumBonusAsw += 4;
          }
        } else if (item.remodel >= 3) {
          if (type2 === 115) {
            // 山汐丸 => +4
            sumBonusAsw += 4;
          } else if (type2 === 45) {
            // あきつ丸 => +3
            sumBonusAsw += 3;
          }
        } else if (type2 === 115) {
          // 山汐丸 => +3
          sumBonusAsw += 3;
        } else if (type2 === 45) {
          // あきつ丸 => +2
          sumBonusAsw += 2;
        }
      }
    }

    // 累積無しボーナス
    // 水雷戦隊 熟練見張員 日本駆逐 => +2
    if (items.some((v) => v.data.id === 412) && type === SHIP_TYPE.DD && Const.isJPN(type2)) {
      sumBonusAsw += 2;
    }
    if (items.some((v) => v.data.id === 132 && v.remodel >= 10)) {
      // 零式水中聴音機 ★10
      sumBonusAsw += 3;
    } else if (items.some((v) => v.data.id === 132 && v.remodel >= 5)) {
      // 零式水中聴音機 ★5
      sumBonusAsw += 1;
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

    // シナジーボーナス
    // 12cm単装砲改二 + 水上電探
    if ((type2 === 74 || type2 === 77) && items.some((v) => v.data.id === 293) && this.surfaceRadarCount) {
      // 占守型・択捉型 => +1
      sumBonusAsw += 1;
    }
    // 加賀改二護 + TBM-3W+3S
    if (id === 646 && items.some((v) => v.data.id === 389) && items.some((v) => v.data.apiTypeId === 25)) {
      if (items.some((v) => v.data.id === 326 || v.data.id === 327)) {
        // ヘリ系 + TBM-3W+3S => +10
        sumBonusAsw += 10;
      } else {
        // それ以外 + TBM-3W+3S => +6
        sumBonusAsw += 6;
      }
    }
    // 能代改二 矢矧改二 矢矧改二乙
    if ([662, 663, 668].includes(id)) {
      if (items.some((v) => v.data.apiTypeId === 10)) {
        // 水上偵察機が存在 => +3
        sumBonusAsw += 3;
      }
      if (items.some((v) => v.data.apiTypeId === 11)) {
        // 水上爆撃機が存在 => +1
        sumBonusAsw += 1;
      }
      if (id === 662 && items.some((v) => v.data.apiTypeId === 25)) {
        // 能代改二 + オートジャイロが存在 => +4
        sumBonusAsw += 4;
      } else if ((id === 663 || id === 668) && items.some((v) => v.data.apiTypeId === 25)) {
        // 矢矧改二 矢矧改二乙 + オートジャイロが存在 => +3
        sumBonusAsw += 3;
      }
    }
    return sumBonusAsw;
  }

  /**
   * 装備対空ボーナス(フィット)の合計を取得
   * @private
   * @return {number}
   * @memberof Ship
   */
  private getBonusAntiAir(): number {
    let total = 0;
    const {
      type, type2, id, version, originalId,
    } = this.data;
    const items = this.items.concat(this.exItem);
    const isUSA = Const.USA.includes(type2);

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];

      // 累積ボーナス対空値算出
      if (item.data.id === 122) {
        // 10cm高角砲＋高射装置
        if (item.remodel >= 4 && id === 656) {
          // ★+4以上 + 雪風改二 => +3
          total += 3;
        } else if (type2 === 54) {
          // 秋月型 => +2
          total += 2;
        }
      } else if (item.data.id === 63) {
        // 12.7cm連装砲B型改二
        if ([1, 5, 10].includes(type2) || id === 144 || id === 245) {
          // 綾波型 暁型 初春型 夕立改 夕立改二 => +1
          total += 1;
        }
      } else if (item.data.id === 308) {
        // 5inch単装砲 Mk.30改＋GFCS Mk.37
        if (id === 651 || id === 656 || type === SHIP_TYPE.DE || (Const.USA.includes(type2) && (type === SHIP_TYPE.DD || type === SHIP_TYPE.CL))) {
          // 丹陽 雪風改二 海防艦 米(軽巡 駆逐) => +1
          total += 1;
        }
      } else if (item.data.id === 313) {
        // 5inch単装砲 Mk.30 改
        if (type2 === 87 || type2 === 91 || id === 651 || id === 656) {
          // Fletcher Johnston Samuel B.Roberts 丹陽 雪風改二 => +2
          total += 2;
        }
      } else if (item.data.id === 3) {
        // 10cm連装高角砲
        if (type2 === 54) {
          // 秋月型 => +2
          total += 2;
        }
      } else if (item.data.id === 295) {
        // 12.7cm連装砲A型改三(戦時改修)＋高射装置
        if (id === 666) {
          // 磯波改二 => +3
          total += 3;
        } else if ([1, 5, 12].includes(type2)) {
          // 吹雪型 綾波型 暁型 => +2
          total += 2;
        }
      } else if (item.data.id === 455) {
        // 試製 長12.7cm連装砲A型改四
        if ([1, 5, 12].includes(type2)) {
          // 吹雪型 綾波型 暁型 => +1
          total += 1;
        }
      } else if (item.data.id === 296) {
        // 12.7cm連装砲B型改四(戦時改修)＋高射装置
        if (id === 145 || id === 498) {
          // 時雨改二 村雨改二 => +1
          total += 1;
        }
      } else if (item.data.id === 293) {
        // 12cm単装砲改二
        if ([66, 28, 74, 77].includes(type2)) {
          // 神風型 睦月型 占守型 択捉型 => +1
          total += 1;
        }
      } else if (item.data.id === 229) {
        // 12.7cm単装高角砲(後期型)
        if (item.remodel >= 7) {
          if ([66, 28, 74, 77].includes(type2) || type === SHIP_TYPE.DE || [23, 289, 224].includes(id)) {
            // 神風型 睦月型 海防艦 由良 鬼怒改 那珂改 => +1
            total += 1;
          } else if (id === 220 || id === 487 || id === 160) {
            // 由良改 鬼怒改二 那珂改二 => +2
            total += 2;
          } else if (id === 488) {
            // 由良改二 => +3
            total += 3;
          }
        } else if (id === 622 || id === 623 || id === 624) {
          // 夕張改二シリーズ => +1
          total += 1;
        } else if (id === 656) {
          // 雪風改二 => +1
          total += 3;
        }
      } else if (item.data.id === 379) {
        // 12.7cm単装高角砲改二
        if (id === 488) {
          // 由良改二 => +4
          total += 4;
        } else if ([651, 656, 220, 141, 487, 160].includes(id)) {
          // 丹陽 雪風改二 由良改 五十鈴改二 鬼怒改二 那珂改二 => +3
          total += 3;
        } else if ([66, 28, 101].includes(type2) || type === SHIP_TYPE.DE || [477, 478, 652, 622, 624].includes(id) || [43, 109, 48, 45, 20, 19].includes(this.data.originalId)) {
          // 神風型 睦月型 松型 海防艦 天龍改二 龍田改二 球磨改二 夕張改二 夕張改二丁 => +2
          // 五十鈴 鬼怒 那珂 由良 北上 大井 => +2
          total += 2;
        } else if (type === SHIP_TYPE.CT || type === SHIP_TYPE.AV) {
          // 練習巡洋艦 水上機母艦 => +1
          total += 1;
        }
      } else if (item.data.id === 380) {
        // 12.7cm連装高角砲改二
        if (id === 488) {
          // 由良改二 => +4
          total += 4;
        } else if ([651, 656, 220, 141, 487, 160].includes(id)) {
          // 丹陽 雪風改二 由良改 五十鈴改二 鬼怒改二 那珂改二 => +3
          total += 3;
        } else if (type2 === 101 || [477, 478, 622, 624, 665, 407].includes(id)) {
          // 松型 天龍改二 龍田改二 夕張改二 夕張改二丁 曙改二 潮改二 => +2
          // 五十鈴 鬼怒 那珂 由良 北上 大井 => +2
          total += 2;
        } else if (type === SHIP_TYPE.CT || type === SHIP_TYPE.AV || [43, 109, 48, 45, 20, 19].includes(originalId)) {
          // 練習巡洋艦 水上機母艦 五十鈴 鬼怒 那珂 由良 北上 大井  => +2
          total += 2;
        }
      } else if (item.data.id === 382) {
        // 12cm単装高角砲E型
        if (id === 656) {
          // 雪風改二 => +3
          total += 3;
        } else if ([66, 28, 101].includes(type2) || type === SHIP_TYPE.DE) {
          // 神風型 睦月型 松型 海防艦 => +2
          total += 2;
        } else if ([45, 48, 109].includes(originalId)) {
          // 由良 那珂 鬼怒 => +1
          total += 1;
        }
      } else if (item.data.id === 397) {
        // 現地改装12.7cm連装高角砲
        if (id === 651) {
          // 丹陽 => +2
          total += 2;
        } else if (id === 656) {
          // 雪風改二 => +1
          total += 1;
        }
      } else if (item.data.id === 398) {
        // 現地改装10cm連装高角砲
        if (id === 651) {
          // 丹陽 => +4
          total += 4;
        } else if (id === 656) {
          // 雪風改二 => +2
          total += 2;
        }
      } else if (item.data.id === 393) {
        // 120mm/50 連装砲 mod.1936
        if (type2 === 61) {
          // Maestrale級 => +1
          total += 1;
        }
      } else if (item.data.id === 394) {
        // 120mm/50 連装砲改 A.mod.1937
        if (type2 === 61) {
          // Maestrale級 => +1
          total += 1;
        }
      } else if (item.data.id === 407) {
        // 15.2cm連装砲改二
        if (type2 === 41 || this.data.version >= 2) {
          // 阿賀野型改二  => +2
          total += 2;
        }
      } else if (item.data.id === 139) {
        // 15.2cm連装砲改
        if (type2 === 41 || this.data.version >= 2) {
          // 阿賀野型改二  => +1
          total += 1;
        }
      } else if (item.data.id === 310) {
        // 14cm連装砲改
        if (originalId === 111 || originalId === 381) {
          // 夕張 日進 => +1
          total += 1;
        }
      } else if (item.data.id === 235) {
        // 15.5cm三連装砲改
        if (type2 === 9 || type2 === 52) {
          // 大淀型 最上型 => +1
          total += 1;
        }
      } else if (item.data.id === 90) {
        // 20.3cm(2号)連装砲
        if (id === 264) {
          // 青葉改 => +1
          total += 1;
        }
      } else if (item.data.id === 340) {
        // 152mm/55 三連装速射砲
        if (type2 === 92) {
          // L.d.S.D.d.Abruzzi級 => +1
          total += 1;
        }
      } else if (item.data.id === 341) {
        // 152mm/55 三連装速射砲改
        if (type2 === 92 || type2 === 89) {
          // L.d.S.D.d.Abruzzi級 Gotland級 => +1
          total += 1;
        }
      } else if (item.data.id === 303) {
        // Bofors 15.2cm連装砲 Model1930
        if (type2 === 89) {
          // Gotland級 => +2
          total += 2;
        } else if (type2 === 4 || type2 === 16 || type2 === 20 || type2 === 41) {
          // 球磨型 長良型 川内型 阿賀野型 => +1
          total += 1;
        }
      } else if (item.data.id === 360 || item.data.id === 361) {
        // Bofors 15cm連装速射砲 Mk.9 Model 1938
        // Bofors 15cm連装速射砲 Mk.9改＋単装速射砲 Mk.10改 Model 1938
        if (type2 === 98) {
          // De Ruyter級 => +2
          total += 2;
        } else if (type2 === 41 || type2 === 89) {
          // 阿賀野型 Gotland級 => +1
          total += 1;
        }
      } else if (item.data.id === 362) {
        // 5inch連装両用砲(集中配備)
        if (type2 === 99) {
          // Atlanta級 => +2
          total += 2;
        } else if (isUSA) {
          // 米艦 => +1
          total += 1;
        } else if (type2 === 52 || type2 === 41 || type2 === 98 || type2 === 89 || type === SHIP_TYPE.CT) {
          // 大淀型 阿賀野型 De Ruyter級 Gotland級 練習巡洋艦 => -1
          total -= 1;
        } else if (type2 === 4 || type2 === 20 || type2 === 16) {
          // 球磨型 長良型 川内型 => -2
          total -= 2;
        } else if (type2 === 21 || type2 === 34) {
          // 天龍型 夕張型 => -3
          total -= 3;
        }
      } else if (item.data.id === 363) {
        // GFCS Mk.37＋5inch連装両用砲(集中配備)
        if (type2 === 99) {
          // Atlanta級 => +3
          total += 3;
        } else if (isUSA) {
          // 米艦 => +1
          total += 1;
        } else if (type2 === 52 || type2 === 41 || type2 === 98 || type2 === 89 || type === SHIP_TYPE.CT) {
          // 大淀型 阿賀野型 De Ruyter級 Gotland級 練習巡洋艦 => -1
          total -= 1;
        } else if (type2 === 4 || type2 === 20 || type2 === 16) {
          // 球磨型 長良型 川内型 => -2
          total -= 2;
        } else if (type2 === 21 || type2 === 34) {
          // 天龍型 夕張型 => -3
          total -= 3;
        }
      } else if (item.data.id === 359) {
        // 6inch 連装速射砲 Mk.XXI
        if (type2 === 96) {
          // Perth級 => +2
          total += 2;
        } else if (id === 622 || id === 623 || id === 624) {
          // 夕張改二シリーズ => +2
          total += 2;
        } else if (type2 === 34) {
          // 夕張型 => +1
          total += 1;
        }
      } else if (item.data.id === 289) {
        // 35.6cm三連装砲改(ダズル迷彩仕様)
        if (id === 151) {
          // 榛名改二 => +2
          total += 2;
        } else if (id === 149) {
          // 金剛改二 => +1
          total += 1;
        }
      } else if (item.data.id === 290) {
        // 41cm三連装砲改二
        if (id === 553 || id === 554 || id === 82 || id === 88) {
          // 伊勢型改 改二 => +2
          total += 2;
        }
      } else if (item.data.id === 318) {
        // 41cm連装砲改二
        if (id === 553 || id === 554 || id === 82 || id === 88 || id === 541 || id === 573) {
          // 伊勢型改 改二 長門改二 陸奥改二 => +2
          total += 2;
        }
      } else if (item.data.id === 104) {
        // 35.6cm連装砲(ダズル迷彩)
        if (id === 151) {
          // 榛名改二 => +1
          total += 1;
        }
      } else if (item.data.id === 328) {
        // 35.6cm連装砲改
        if (id === 598) {
          // 比叡改二丙 => +1
          total += 1;
        }
      } else if (item.data.id === 329) {
        // 35.6cm連装砲改二
        if (id === 591 || id === 598) {
          // 比叡改二丙 金剛改二丙 => +2
          total += 2;
        } else if (id === 149 || id === 150 || id === 151 || id === 152) {
          // 金剛型改二 => +1
          total += 1;
        }
      } else if (item.data.id === 332) {
        // 16inch Mk.VIII連装砲改
        if (type2 === 93 && version >= 1) {
          // Colorado級改 => +1
          total += 1;
        }
      } else if (item.data.id === 234) {
        // 15.5cm三連装副砲改
        if (type2 === 37) {
          // 大和型 => +1
          total += 1;
        }
      } else if (item.data.id === 66) {
        // 8cm高角砲
        if (id === 662 || id === 663 || id === 668 || id === 501 || id === 506) {
          // 能代の改二 矢矧の改二 最上の改二 => +2
          total += 2;
        }
      } else if (item.data.id === 220) {
        // 8cm高角砲改＋増設機銃
        if (id === 662 || id === 663 || id === 668 || id === 501 || id === 506) {
          // 能代の改二 矢矧の改二 最上の改二 => +5
          total += 5;
        }
      } else if (item.data.id === 464) {
        // 10cm連装高角砲群 集中配備
        if (id === 911 || id === 916 || id === 546) {
          // 大和型改二 => +5
          total += 5;
        } else if (type2 === 37) {
          // 大和型 => +3
          total += 3;
        } else if (type2 === 6 || type2 === 73 || type2 === 113) {
          // 金剛型 Гангут級 Conte di Cavour級 => -2
          total -= 2;
        }
      } else if (item.data.id === 467) {
        // 5inch連装砲(副砲配置)集中配備
        if (isUSA && (type === SHIP_TYPE.BB || type === SHIP_TYPE.BBB || type === SHIP_TYPE.BBV || type === SHIP_TYPE.FBB)) {
          // 米戦艦 => +3
          total += 3;
        }
      } else if (item.data.id === 358) {
        // 5inch 単装高角砲群
        if (type2 === 110 || type2 === 95) {
          // Brooklyn級 Northampton級  => +3
          total += 3;
        } else if (isUSA || Const.GBR.includes(type2)) {
          // その他 米艦 英艦 => +1
          total += 1;
        }
      } else if (item.data.id === 430) {
        // 65mm／64 単装速射砲改
        if (type2 === 113) {
          // Conte di Cavour級  => +3
          total += 3;
        } else if (Const.ITA.includes(type2)) {
          // その他 伊艦 => +2
          total += 2;
        }
      } else if (item.data.id === 322) {
        // 瑞雲改二(六三四空)
        if (id === 553 || id === 554) {
          // 伊勢型改二 => +2
          total += 2;
        } else if (id === 662 || id === 663 || id === 668 || id === 501 || id === 506) {
          // 能代の改二 矢矧の改二 最上の改二 => +1
          total += 1;
        }
      } else if (item.data.id === 323) {
        // 瑞雲改二(六三四空／熟練)
        if (id === 553 || id === 554) {
          // 伊勢型改二 => +3
          total += 2;
        } else if (id === 662 || id === 663 || id === 668 || id === 501 || id === 506) {
          // 能代の改二 矢矧の改二 最上の改二 => +1
          total += 1;
        }
      } else if (item.data.apiTypeId === 11) {
        // その他の水上爆撃機
        if (id === 662 || id === 663 || id === 668 || id === 501 || id === 506) {
          // 能代の改二 矢矧の改二 最上の改二 => +1
          total += 1;
        }
      } else if (item.data.id === 217) {
        // 強風改
        if (id === 501 || id === 506) {
          // 最上の改二 => +5
          total += 5;
        }
      } else if (item.data.id === 19) {
        // 九六式艦戦
        if (type2 === 27) {
          // 鳳翔型 => +3
          total += 3;
        } else if (type === SHIP_TYPE.CVL) {
          // その他の軽空母 => +1
          total += 1;
        }
      } else if (item.data.id === 228) {
        // 九六式艦戦改
        if (type2 === 27) {
          // 鳳翔型 => +4
          total += 4;
        } else if (type2 === 75 || type2 === 76) {
          // 大鷹型 => +2
          total += 2;
        } else if (type === SHIP_TYPE.CVL) {
          // その他の軽空母 => +1
          total += 1;
        }
      } else if (item.data.id === 271) {
        // 紫電改四
        if (item.remodel >= 6 && (type2 === 9 || id === 883 || id === 888)) {
          // ★6以上 鈴谷改二 熊野改二 龍鳳改二 => +2
          total += 2;
        }
      } else if (item.data.id === 335 || item.data.id === 336) {
        // 烈風改(試製艦載型) or 烈風改二
        if ((type2 === 3 || type2 === 14) && version >= 2) {
          // 赤城 加賀の改二 => +2
          total += 2;
        } else if ((type2 === 3 || type2 === 14) && version >= 1) {
          // 赤城 加賀の改 => +1
          total += 1;
        }
      } else if (item.data.id === 338) {
        // 烈風改二戊型
        if (id === 599 || id === 610) {
          // 赤城改二戊 加賀改二戊 => +3
          total += 3;
        } else if ((type2 === 3 || type2 === 14) && version >= 2) {
          // 赤城 加賀の改二 => +2
          total += 2;
        } else if ((type2 === 3 || type2 === 14) && version >= 1) {
          // 赤城 加賀の改 => +1
          total += 1;
        }
      } else if (item.data.id === 339) {
        // 烈風改二戊型(一航戦／熟練)
        if (id === 599 || id === 610) {
          // 赤城改二戊 加賀改二戊 => +4
          total += 4;
        } else if ((type2 === 3 || type2 === 14) && version >= 2) {
          // 赤城 加賀の改二 => +3
          total += 3;
        } else if ((type2 === 3 || type2 === 14) && version >= 1) {
          // 赤城 加賀の改 => +2
          total += 2;
        }
      } else if (item.data.id === 184) {
        // Re.2001 OR改
        if (type2 === 68) {
          // Aquila級 => +2
          total += 2;
        }
      } else if (item.data.id === 189) {
        // Re.2005 改
        if (type2 === 68 || type2 === 63) {
          // Aquila級 Graf Zeppelin級 => +1
          total += 1;
        }
      } else if (item.data.id === 375) {
        // XF5U
        if (isUSA) {
          // 米艦 => +3
          total += 3;
        } else if (type2 === 3) {
          // 加賀型 => +1
          total += 1;
        }
      } else if (item.data.id === 422) {
        // FR-1 Fireball
        if (type2 === 83) {
          // Casablanca級 => +2
          total += 2;
        } else if (type2 === 84) {
          // Essex級 => +1
          total += 1;
        }
      } else if (item.data.id === 434) {
        // Corsair Mk.II
        if (type2 === 112) {
          // Illustrious級 => +3
          total += 3;
        } else if (type2 === 78) {
          // Ark Royal級 => +2
          total += 2;
        } else if (isUSA) {
          // 米艦 => +1
          total += 1;
        }
      } else if (item.data.id === 435) {
        // Corsair Mk.II(Ace)
        if (type2 === 112) {
          // Illustrious級 => +3
          total += 3;
        } else if (type2 === 78) {
          // Ark Royal級 => +2
          total += 2;
        } else if (isUSA) {
          // 米艦 => +1
          total += 1;
        }
      } else if (item.data.id === 437) {
        // 試製 陣風
        if (type2 === 27 && version >= 1) {
          // 鳳翔改 => +3
          total += 3;
        } else if ([196, 197, 508, 509, 646, 883, 888, 553, 554].includes(id)) {
          // 蒼龍改二 飛龍改二 鈴谷航改二 熊野航改二 加賀改二護 龍鳳改二戊 龍鳳改二 伊勢改二 日向改二 => +2
          total += 2;
        }
      } else if (item.data.id === 292) {
        // 彗星二二型(六三四空／熟練)
        if (id === 553 || id === 554) {
          // 伊勢改二 日向改二 => +1
          total += 1;
        }
      } else if (item.data.id === 319) {
        // 彗星一二型(六三四空／三号爆弾搭載機)
        if (id === 553 || id === 554) {
          // 伊勢改二 日向改二 => +3
          total += 3;
        }
      } else if (item.data.id === 60) {
        // 零式艦戦62型(爆戦)
        if ([11, 24, 51, 15].includes(type2)) {
          // 祥鳳型 飛鷹型 龍鳳型 千歳型 => +1
          total += 1;
        }
      } else if (item.data.id === 154) {
        // 零戦62型(爆戦／岩井隊)
        if ([11, 24, 51, 15].includes(type2)) {
          // 祥鳳型 飛鷹型 龍鳳型 千歳型 => +1
          total += 1;
        }
      } else if (item.data.id === 219) {
        // 零式艦戦63型(爆戦)
        if ([11, 24, 51, 15].includes(type2)) {
          // 祥鳳型 飛鷹型 龍鳳型 千歳型 => +1
          total += 1;
        }
      } else if (item.data.id === 447) {
        // 零式艦戦64型(複座KMX搭載機)
        if (item.remodel >= 4) {
          // ★4以上 => +1
          total += 1;
        }
      } else if (item.data.id === 316) {
        // Re.2001 CB改
        if (type2 === 68) {
          // Aquila級 => +1
          total += 1;
        }
      } else if (item.data.id === 277) {
        // FM-2
        if (type2 === 83) {
          // Casablanca級 => +1
          total += 1;
        }
      } else if (item.data.id === 342) {
        // 流星改(一航戦)
        if (id === 599 || id === 610) {
          // 赤城改二戊 加賀改二戊 => +2
          total += 2;
        } else if ((type2 === 3 || type2 === 14) && version >= 2) {
          // 赤城 加賀の改二 => +1
          total += 1;
        }
      } else if (item.data.id === 343) {
        // 流星改(一航戦／熟練)
        if (id === 599 || id === 610) {
          // 赤城改二戊 加賀改二戊 => +3
          total += 3;
        } else if ((type2 === 3 || type2 === 14) && version >= 2) {
          // 赤城 加賀の改二 => +2
          total += 2;
        }
      } else if (item.data.id === 188) {
        // Re.2001 G改
        if (type2 === 68) {
          // Aquila級 => +1
          total += 1;
        }
      } else if (item.data.id === 307) {
        // GFCS Mk.37
        if (isUSA) {
          // 米艦 => +1
          total += 1;
        }
      } else if (item.data.id === 106 || item.data.id === 450) {
        // 13号対空電探改 or 13号対空電探改(後期型)
        if ([407, 145, 419, 151, 541].includes(id)) {
          // 潮改二 時雨改二 初霜改二 榛名改二 長門改二
          total += 2;
        } else if ([139, 90, 5, 167, 170, 225, 332].includes(originalId)) {
          // 矢矧 霞 雪風 磯風 浜風 朝霜 涼月 => +2
          total += 2;
        } else if ([183, 72, 265].includes(originalId)) {
          // 大淀 響 鹿島
          total += 1;
        }
      } else if (item.data.id === 411) {
        // 42号対空電探改二
        if (item.remodel >= 10) {
          // ★10
          if (id === 151 || id === 411 || id === 412) {
            // 榛名改二 扶桑改二 山城改二 => +6
            total += 6;
          } else if (id === 541 || id === 573 || id === 553 || id === 554) {
            // 長門改二 陸奥改二 伊勢改二 日向改二 => +4
            total += 4;
          }
        } else if (item.remodel >= 4) {
          // ★4~
          if (id === 151 || id === 411 || id === 412) {
            // 榛名改二 扶桑改二 山城改二 => +5
            total += 5;
          } else if (id === 541 || id === 573 || id === 553 || id === 554) {
            // 長門改二 陸奥改二 伊勢改二 日向改二 => +3
            total += 3;
          }
        } else if (id === 151 || id === 411 || id === 412) {
          // 榛名改二 扶桑改二 山城改二 => +4
          total += 4;
        } else if (id === 541 || id === 573 || id === 553 || id === 554) {
          // 長門改二 陸奥改二 伊勢改二 日向改二 => +2
          total += 2;
        }
      } else if (item.data.id === 74) {
        // 探照灯
        if (originalId === 5) {
          // 雪風 => +1
          total += 1;
        }
      } else if (item.data.id === 413) {
        // 精鋭水雷戦隊 司令部
        if (type2 === 21 || type2 === 34) {
          // 天龍型 夕張型 => +2
          total += 2;
        } else if (id === 419 || originalId === 45 || originalId === 48 || originalId === 138 || originalId === 139) {
          // 初霜改二 由良 那珂 能代 矢矧 => +1
          total += 1;
        }
      } else if (item.data.id === 49 || item.data.id === 39 || item.data.id === 40 || item.data.id === 131) {
        // 25mm単装機銃 or 25mm連装機銃 or 25mm三連装機銃 or 25mm三連装機銃 集中配備
        if (id === 663 || id === 668) {
          // 矢矧の改二 => +3
          total += 3;
        } else if (id === 662 || type === SHIP_TYPE.CT) {
          // 能代改二 練習巡洋艦=> +2
          total += 2;
        }
      } else if (item.data.id === 301) {
        // 20連装7inch UP Rocket Launchers
        if (Const.GBR.includes(type2)) {
          // 英艦 => +2
          total += 2;
        }
      } else if (item.data.id === 409) {
        // 武装大発
        if (type2 === 97) {
          // 神州丸 => +2
          total += 2;
        } else if (type2 === 45) {
          // あきつ丸 => +1
          total += 1;
        }
      }
    }

    // 累積無しボーナス
    // 12.7cm単装高角砲改二
    if (items.some((v) => v.data.id === 379) && type2 === 101) {
      // 松型  => +2
      total += 2;
    }
    // 12.7cm連装高角砲改二
    if (items.some((v) => v.data.id === 380)) {
      if (type2 === 101 || id === 652) {
        // 松型 球磨改二 => +2
        total += 2;
      } else if ([665, 407].includes(id)) {
        // 曙改二 潮改二 => +1
        total += 1;
      }
    }
    // 21号対空電探改二
    if (items.some((v) => v.data.id === 410)) {
      if (type2 === 54 || id === 73 || id === 501 || id === 506) {
        // 秋月型 最上改 改二 => +5
        total += 5;
      }
    } else if (items.some((v) => v.data.id === 30)) {
      // 21号対空電探
      if (type2 === 54 || id === 73 || id === 501 || id === 506) {
        // 秋月型 最上改 改二 => +3
        total += 3;
      }
    }
    // 8cm高角砲
    if (items.some((v) => v.data.id === 66) && this.antiAirRadarCount) {
      if (id === 662 || id === 663 || id === 668 || id === 501 || id === 506) {
        // 能代の改二 矢矧の改二 最上の改二 => +1
        total += 1;
      }
    }
    // 8cm高角砲改＋増設機銃
    if (items.some((v) => v.data.id === 220) && this.antiAirRadarCount) {
      if (id === 662 || id === 663 || id === 668 || id === 501 || id === 506) {
        // 能代の改二 矢矧の改二 最上の改二 => +4
        total += 4;
      }
    }
    // 零式水上観測機
    if (items.some((v) => v.data.id === 59)) {
      if (id === 501 || id === 506) {
        // 最上改二 => +1
        total += 1;
      }
    }
    // 二式水戦改 or 二式水戦改(熟練)
    if (items.some((v) => v.data.id === 165 || v.data.id === 216)) {
      if (id === 501 || id === 506) {
        // 最上改二 => +2
        total += 2;
      }
    }
    // SKレーダー
    if (items.some((v) => v.data.id === 278)) {
      if (isUSA || Const.GBR.includes(type2) || type2 === 96) {
        // 米艦 英艦 Perth級 => +1
        total += 1;
      }
    }
    // SK＋SGレーダー
    if (items.some((v) => v.data.id === 279)) {
      if (isUSA) {
        // 米艦 => +2
        total += 2;
      } else if (Const.GBR.includes(type2) || type2 === 96) {
        // 米艦 英艦 Perth級 => +1
        total += 1;
      }
    }
    // 13号対空電探改 or 13号対空電探改(後期型)
    if (items.some((v) => v.data.id === 106 || v.data.id === 450)) {
      if (id === 668) {
        // 矢矧改二乙 => +2
        total += 2;
      } else if (id === 663) {
        // 矢矧改二 => +1
        total += 1;
      }
    }
    // 対空電探
    if (this.antiAirRadarCount) {
      if (id === 648 || id === 569) {
        // 秋雲改二 沖波改二 => +2
        total += 2;
      }
    }
    // 94式高射装置
    if (items.some((v) => v.data.id === 121)) {
      if (type2 === 54) {
        // 秋月型 => +4
        total += 4;
      }
    }
    // 三式弾
    if (items.some((v) => v.data.id === 35)) {
      if ([21, 22, 23].includes(originalId) && version >= 2) {
        // 金剛改二 比叡改二 榛名改二 => +1
        total += 1;
      }
    }
    // 三式弾改
    if (items.some((v) => v.data.id === 317)) {
      if (id === 149 || id === 591 || id === 592) {
        // 金剛改二 金剛改二丙 比叡改二丙 => +3
        total += 3;
      } else if ((type2 === 6 || type2 === 19) && version >= 2) {
        // 金剛型改二 長門型改二 => +2
        total += 2;
      } else if (type2 === 6) {
        // 金剛型 => +1
        total += 1;
      }
    }

    // シナジーボーナス
    // 12.7cm連装砲A型改三(戦時改修)＋高射装置 + 対空電探
    if (items.some((v) => v.data.id === 295) && this.antiAirRadarCount && [1, 5, 12].includes(type2)) {
      // 吹雪型 綾波型 暁型  => +6
      total += 6;
    }
    // 試製 長12.7cm連装砲A型改四 + 対空電探
    if (items.some((v) => v.data.id === 455) && this.antiAirRadarCount && [1, 5, 12].includes(type2)) {
      // 吹雪型 綾波型 暁型  => +4
      total += 4;
    }
    // 12.7cm連装砲B型改四(戦時改修)＋高射装置 + 対空電探
    if (items.some((v) => v.data.id === 296) && this.antiAirRadarCount) {
      if ([1, 5, 10].includes(type2)) {
        // 綾波型 暁型 初春型 => +5
        total += 5;
      } else if (type2 === 23) {
        // 白露型 => 6
        total += 6;
      }
    }
    // 12.7cm連装砲D型改二or改三 + 見張員
    if (items.some((v) => v.data.id === 267 || v.data.id === 366) && items.some((v) => v.data.id === 129 || 412) && id === 448) {
      if ([1, 5, 10].includes(type2)) {
        // 秋雲改二 => +2
        total += 2;
      }
    }
    // 12.7cm単装後期型 + 対空電探
    if (items.some((v) => v.data.id === 229) && this.antiAirRadarCount) {
      if (id === 622 || id === 623 || id === 624) {
        // 夕張改二シリーズ => +2
        total += 2;
      } else if (id === 656) {
        // 雪風改二 => +3
        total += 3;
      }
    }
    // 12.7cm単装高角砲改二 + 対空電探
    if (items.some((v) => v.data.id === 379) && this.antiAirRadarCount && id === 656) {
      // 雪風改二 => +3
      total += 3;
    }
    // 12.7cm連装高角砲改二 + 機銃
    if (items.some((v) => v.data.id === 380) && this.kijuCount && id === 656 && [665, 407].includes(id)) {
      // 曙改二 潮改二 => +2
      total += 2;
    }
    // 12cm単装高角砲E型 + 対空電探
    if (items.some((v) => v.data.id === 382) && this.antiAirRadarCount) {
      if (id === 656) {
        // 雪風改二 => +3
        total += 3;
      } else if ([66, 28, 101].includes(type2) || type === SHIP_TYPE.DE || [488, 487, 160].includes(id)) {
        // 神風型 睦月型 松型 海防艦 由良改二 鬼怒改二 那珂改二 => +2
        total += 2;
      }
    }
    // 10cm高角砲＋高射装置★4 + 対空電探
    if (items.some((v) => v.data.id === 122 && v.remodel >= 4) && this.antiAirRadarCount && id === 656) {
      // 雪風改二 => +4
      total += 4;
    }
    // 現地改装10cm連装高角砲 + 対空電探
    if (items.some((v) => v.data.id === 398) && this.antiAirRadarCount && (id === 651 || id === 656)) {
      // 丹陽 雪風改二 => +3
      total += 3;
    }
    // 15.2cm連装砲改二 + 対空電探
    if (items.some((v) => v.data.id === 407) && this.antiAirRadarCount) {
      if (type2 === 41 || this.data.version >= 2) {
        // 阿賀野型改二  => +2
        total += 2;
      }
    }
    // 15.5cm三連装砲改 + 対空電探
    if (items.some((v) => v.data.id === 235) && this.antiAirRadarCount && type2 === 52) {
      // 大淀  => +3
      total += 3;
    }
    // 20.3cm(2号)連装砲 + 対空電探
    if (items.some((v) => v.data.id === 90) && this.antiAirRadarCount && id === 264) {
      // 青葉改 => +5
      total += 5;
    }
    // 20.3cm(3号)連装砲 + (21号対空電探 or 21号対空電探改二)
    if (items.some((v) => v.data.id === 50) && items.some((v) => v.data.id === 30 || v.data.id === 410)) {
      if (id === 501 || id === 506) {
        // 最上改二 最上改二特 => +3
        total += 3;
      }
    }
    if ((items.some((v) => v.data.id === 290) || items.some((v) => v.data.id === 318)) && this.antiAirRadarCount) {
      // (41cm三連装砲改二 or 41cm連装砲改二) + 対空電探
      if (type2 === 2) {
        // 伊勢型 => +2
        total += 2;
      }
    }
    if (items.some((v) => v.data.id === 234) && items.some((v) => v.data.id === 142 || v.data.id === 460)) {
      // 15.5cm三連装副砲改 + (15m二重測距儀改＋21号電探改二 or 15m二重測距儀改＋21号電探改二＋熟練射撃指揮所)
      if (type2 === 37) {
        // 大和型 => +1
        total += 1;
      }
    }
    if (items.some((v) => v.data.id === 464)) {
      // 10cm連装高角砲群 集中配備
      if (items.some((v) => v.data.id === 460)) {
        // + 15m二重測距儀改＋21号電探改二＋熟練射撃指揮所
        if (id === 911 || id === 916 || id === 546) {
          // 大和型改二 => +4
          total += 4;
        } else if (type2 === 37) {
          // 大和型 => +2
          total += 2;
        }
      } else if (items.some((v) => v.data.id === 142)) {
        // + 15m二重測距儀改＋21号電探改二
        if (type2 === 37) {
          // 大和型 => +2
          total += 2;
        }
      }
    }
    if (items.some((v) => v.data.id === 467) && isUSA) {
      // 5inch連装砲(副砲配置)集中配備 かつ 米艦
      if (items.some((v) => v.data.id === 279)) {
        // SK＋SGレーダー => +3
        total += 3;
      } else if (items.some((v) => v.data.id === 278)) {
        // SKレーダー => +2
        total += 2;
      } else if (items.some((v) => v.data.id === 307 || v.data.id === 315 || v.data.id === 456)) {
        // GFCS Mk.37 or SG レーダー(初期型) or SG レーダー(後期型) => +1
        total += 1;
      }
    }
    // 94式高射装置
    if (items.some((v) => v.data.id === 121) && this.antiAirRadarCount) {
      if (type2 === 54) {
        // 秋月型 => +2
        total += 2;
      }
    }

    return total;
  }

  /**
   * 先制対潜の可否を判定
   * @private
   * @return {boolean} 可能ならtrue
   * @memberof Ship
   */
  private getEnabledTSBK(): boolean {
    if ([141, 478, 624, 394, 893, 681, 920].includes(this.data.id) || this.data.type2 === 91) {
      // 無条件発動 順に五十鈴改二 龍田改二 夕張改二丁 J級改 Samuel B.Roberts(改 or MK.II) Fletcher級
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
      return items.some((v) => (v.data.isAttacker && v.data.asw >= 1) || v.data.apiTypeId === 25 || v.data.apiTypeId === 26);
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
        return hasASWPlane || items.some((v) => v.data.isAttacker && v.data.asw >= 1);
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
   * 装備航空戦雷装ボーナスを取得
   * @param {Item} item
   * @return {*}  {number}
   * @memberof Ship
   */
  public getAttackerTorpedoBonus(item: Item): number {
    const ship = this.data;
    const itemId = item.data.id;
    if (itemId === 372) {
      // 天山一二型甲
      if (ship.id === 883 || ship.id === 888) {
        // 龍鳳改二 / 戊
        return 2;
      }
      if ([33, 43].includes(ship.type2)) {
        // 翔鶴型 大鳳
        return 1;
      }
    } else if (itemId === 373) {
      // 天山一二型甲改(空六号電探改装備機)
      if (ship.id === 883) {
        // 龍鳳改二戊
        return 3;
      }
      if (ship.id === 888 || [9, 33, 43].includes(ship.type2)) {
        // 龍鳳改二 最上型 翔鶴型 大鳳
        return 2;
      }
      if ([24, 51].includes(ship.type2) || [291, 292, 296, 297, 282, 555, 560].includes(ship.id)) {
        // 飛鷹型 龍鳳型 祥鳳と千歳型の改以降っぽいかんじ
        return 1;
      }
    } else if (itemId === 374) {
      // 天山一二型甲改(熟練/空六号電探改装備機)
      if ([461, 462, 466, 467, 153, 156].includes(ship.id)) {
        // 鶴改二 / 改二甲 大鳳
        return 3;
      }
      if ([883, 888, 508, 509, 283, 408].includes(ship.id)) {
        // 龍鳳改二 最上型改二 飛鷹改 隼鷹改二
        return 2;
      }
      if ([296, 297, 282, 555, 560, 318].includes(ship.id)) {
        // 祥鳳と千歳型最終 龍鳳改
        return 1;
      }
    } else if (itemId === 424) {
      // Barracuda Mk.II
      if (Const.GBR.includes(ship.type2)) {
        // イギリス人
        return 3;
      }
    } else if (itemId === 425) {
      // Barracuda Mk.III
      if (Const.GBR.includes(ship.type2)) {
        // Ark Victorious
        return 1;
      }
    } else if (itemId === 368) {
      // Swordfish Mk.III改(水上機型)
      if (ship.id === 630) {
        // Gotland andra
        return 2;
      }
    } else if (itemId === 369) {
      // Swordfish Mk.III改(水上機型/熟練)
      if (ship.id === 630) {
        // Gotland andra
        return 3;
      }
    }

    return 0;
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
      const antiAirWeight = this.antiAir + 2 * sum(items.map((v) => v.antiAirWeight));
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

  /**
   * 昼戦特殊攻撃発動率を返却
   * @param {number} fleetRosCorr
   * @param {boolean} isFlagship
   * @return {*}  {{ text: string, rate: number[] }[]}
   * @memberof Ship
   */
  public getDayBattleSpecialAttackRate(fleetRosCorr: number, isFlagship: boolean): { text: string, rate: number[] }[] {
    const items = this.items.concat(this.exItem);
    const specialAttacks: { text: string, value: number }[] = [];

    // 弾着観測射撃判定
    if (items.some((v) => v.data.apiTypeId === 10 || v.data.apiTypeId === 11)) {
      // 水上機は必須
      const mainGunCount = items.filter((v) => [1, 2, 3].includes(v.data.apiTypeId)).length;
      const subGunCount = items.filter((v) => v.data.apiTypeId === 4).length;
      // 主主CI => 主砲 * 2 + 徹甲弾
      if (mainGunCount >= 2 && items.some((v) => v.data.apiTypeId === 19)) {
        specialAttacks.push({ text: '主主CI', value: 150 });
      }
      // 主徹CI => 主 + 副 + 徹
      if (mainGunCount && subGunCount && items.some((v) => v.data.apiTypeId === 19)) {
        specialAttacks.push({ text: '主徹CI', value: 140 });
      }
      // 主電CI => 主 + 副 + 電
      if (mainGunCount && subGunCount && items.some((v) => [12, 13].includes(v.data.apiTypeId))) {
        specialAttacks.push({ text: '主電CI', value: 130 });
      }
      // 主副CI => 主 + 副
      if (mainGunCount && subGunCount) {
        specialAttacks.push({ text: '主副CI', value: 120 });
      }
      // 主主CI => 主砲 * 2
      if (mainGunCount >= 2) {
        specialAttacks.push({ text: '連撃', value: 130 });
      }
    }

    // 空母カットイン判定
    if (this.items.some((v) => v.data.apiTypeId === 8)) {
      // 艦攻は必須
      const bomberCount = items.filter((v) => v.data.apiTypeId === 7).length;
      // FBA => 艦攻 + 艦爆 + 艦戦
      if (this.items.some((v) => v.data.apiTypeId === 6) && bomberCount) {
        specialAttacks.push({ text: 'FBA', value: 125 });
      }
      // BBA => 艦攻 + 艦爆2
      if (bomberCount >= 2) {
        specialAttacks.push({ text: 'BBA', value: 140 });
      }
      // BA => 艦攻 + 艦爆
      if (bomberCount) {
        specialAttacks.push({ text: 'BA', value: 155 });
      }
    }

    // 旗艦補正 + 15
    const flagshipCorr = isFlagship ? 15 : 0;
    const results = [];

    const sumItemScout = sum(items.map((v) => v.data.scout));
    // 観測項算出
    // 制空確保: int( int( sqrt(運) + 10 ) + 0.7 * ( 艦隊索敵補正 + 1.6 * 攻擊艦の裝備索敵值合計 ) + 10 ) + 旗艦補正
    // 航空優勢: int( int( sqrt(運) + 10 ) + 0.6 * ( 艦隊索敵補正 + 1.2 * 攻擊艦の裝備索敵值合計 ) ) + 旗艦補正
    const rosValue = [
      Math.floor(Math.floor(Math.sqrt(this.luck) + 10) + 0.7 * (fleetRosCorr + 1.6 * sumItemScout) + 10) + flagshipCorr,
      Math.floor(Math.floor(Math.sqrt(this.luck) + 10) + 0.6 * (fleetRosCorr + 1.2 * sumItemScout)) + flagshipCorr,
    ];

    const sumRate = [1, 1];
    for (let i = 0; i < specialAttacks.length; i += 1) {
      const attack = specialAttacks[i];
      // 発動率 = Roundup(観測項) / 観測種別定數
      const rate = rosValue.map((v, index) => (sumRate[index] * Math.ceil(v)) / attack.value);
      sumRate[0] -= rate[0];
      sumRate[1] -= rate[1];
      results.push({ text: attack.text, rate });
    }

    return results;
  }

  /**
   * 夜間特殊攻撃発動率を返却
   * @param {number} fleetRosCorr
   * @param {boolean} isFlagship
   * @return {*}  {{ text: string, rate: number[] }[]}
   * @memberof Ship
   */
  public getNightBattleSpecialAttackRate(isFlagship: boolean): { text: string, rate: number[] }[] {
    const items = this.items.concat(this.exItem);
    const specialAttacks: { text: string, value: number }[] = [];

    const mainGunCount = items.filter((v) => [1, 2, 3].includes(v.data.apiTypeId)).length;
    const subGunCount = items.filter((v) => v.data.apiTypeId === 4).length;
    const torpCount = items.filter((v) => v.data.apiTypeId === 5 || v.data.apiTypeId === 32).length;
    const hasSkilledPersonnel = items.some((v) => v.data.id === 412);
    const hasPersonnel = items.some((v) => v.data.id === 129);

    if (this.data.type === SHIP_TYPE.DD) {
      // 駆逐カットイン判定
      if (mainGunCount && torpCount && this.surfaceRadarCount) {
        specialAttacks.push({ text: '主魚電CI', value: 115 });
      }
      if (torpCount && this.surfaceRadarCount && (hasSkilledPersonnel || hasPersonnel)) {
        specialAttacks.push({ text: '魚見電CI', value: 140 });
      }
      if (torpCount >= 2 && hasSkilledPersonnel) {
        specialAttacks.push({ text: '魚水魚CI', value: 125 });
      }
      if (torpCount && hasSkilledPersonnel && items.some((v) => v.data.id === 75)) {
        specialAttacks.push({ text: '魚ド水CI', value: 122 });
      }
    }

    // 汎用CI判定
    if (mainGunCount >= 3) {
      specialAttacks.push({ text: '主主主CI', value: 140 });
    } else if (mainGunCount >= 2 && subGunCount) {
      specialAttacks.push({ text: '主主副CI', value: 130 });
    } else if (torpCount >= 2) {
      specialAttacks.push({ text: '魚雷CI', value: 122 });
    } else if (mainGunCount && torpCount) {
      specialAttacks.push({ text: '砲雷CI', value: 115 });
    }

    if (this.data.type === SHIP_TYPE.SS || this.data.type === SHIP_TYPE.SSV) {
      // 潜水カットイン判定
      const lateModelTorpCount = items.filter((v) => [213, 214, 383, 441, 443, 457, 461].includes(v.data.id)).length;
      if (lateModelTorpCount && items.some((v) => v.data.apiTypeId === 51)) {
        specialAttacks.push({ text: '潜電魚CI', value: 105 });
      } else if (lateModelTorpCount >= 2) {
        specialAttacks.push({ text: '潜魚雷CI', value: 110 });
      }
    }

    // 連撃
    if (!specialAttacks.length && (mainGunCount + subGunCount) >= 2) {
      specialAttacks.push({ text: '連撃', value: 0 });
    }

    // 空母夜戦判定
    if (this.data.type === SHIP_TYPE.CV || this.data.type === SHIP_TYPE.CVL || this.data.type === SHIP_TYPE.CVB) {
      // 夜間航空攻撃発動判定
      if ([545, 599, 610, 883].includes(this.data.id) || items.some((v) => v.data.id === 258 || v.data.id === 259)) {
        const nightFighterCount = items.filter((v) => v.data.iconTypeId === 45).length;
        const nightAttackerCount = items.filter((v) => v.data.iconTypeId === 46).length;
        const nightSuiseiCount = items.filter((v) => v.data.id === 320).length;
        const nightPlaneCount = nightFighterCount + nightAttackerCount + nightSuiseiCount + items.filter((v) => [154, 242, 243, 244].includes(v.data.id)).length;
        if (nightFighterCount >= 2 && nightAttackerCount) {
          specialAttacks.push({ text: '夜襲CIA', value: 105 });
        }
        if (nightFighterCount && nightAttackerCount) {
          specialAttacks.push({ text: '夜襲CIB', value: 120 });
        }
        if (nightFighterCount && nightSuiseiCount) {
          specialAttacks.push({ text: '光電管彗星CI', value: 115 });
        } else if (nightAttackerCount && nightSuiseiCount) {
          specialAttacks.push({ text: '光電管彗星CI', value: 115 });
        }
        if (nightFighterCount && nightPlaneCount >= 2) {
          specialAttacks.push({ text: '夜襲CIC', value: 130 });
        }
      }
    }

    // 旗艦補正 +15
    const flagshipCorr = isFlagship ? 15 : 0;
    // 損傷補正 +18
    // const damageCorr = isDamaged ? 18 : 0;
    // 味方探照灯補正 +7
    const lightCorr = 7;
    // 味方照明弾補正 +4
    const starShellCorr = 4;
    let personnelCorr = hasPersonnel || hasSkilledPersonnel ? 5 : 0;
    if (this.data.type === SHIP_TYPE.DD || this.data.type === SHIP_TYPE.CL || this.data.type === SHIP_TYPE.CLT) {
      personnelCorr = hasSkilledPersonnel ? 9 : personnelCorr;
    }

    const results = [];
    const sumRates = [1, 1, 1, 1];
    for (let i = 0; i < specialAttacks.length; i += 1) {
      const attack = specialAttacks[i];

      if (!attack.value) {
        results.push({ text: attack.text, rate: [0.99, 0.99, 0.99, 0.99] });
        continue;
      }

      let chip = 0;
      if (this.luck >= 50) {
        chip = Math.floor(65 + Math.sqrt(this.luck - 50) + 0.8 * Math.sqrt(this.level));
      } else {
        chip = Math.floor(15 + this.luck + 0.75 * Math.sqrt(this.level));
      }
      chip += (flagshipCorr + personnelCorr);
      const rate = [
        sumRates[0] * (chip / attack.value),
        sumRates[1] * ((chip + lightCorr) / attack.value),
        sumRates[2] * ((chip + starShellCorr) / attack.value),
        sumRates[3] * ((chip + lightCorr + starShellCorr) / attack.value),
      ];
      sumRates[0] -= rate[0];
      sumRates[1] -= rate[1];
      sumRates[2] -= rate[2];
      sumRates[3] -= rate[3];

      results.push({ text: attack.text, rate });
    }

    return results;
  }

  /**
   * 爆雷の装甲減少補正値を返却
   * @returns
   */
  public getAswArmorDeBuff(): number {
    const items = this.items.concat(this.exItem);
    // 爆雷と一部装備
    const targets = [226, 227, 377, 378, 439, 472];
    let sumCorr = 0;

    const isDE = this.data.type === SHIP_TYPE.DE;
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      if (item && targets.includes(item.data.id)) {
        sumCorr -= (Math.sqrt(item.data.asw - 2) + (isDE ? 1 : 0));
      }
    }

    return sumCorr;
  }
}
