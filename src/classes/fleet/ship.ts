import sum from 'lodash/sum';
import { cloneDeep } from 'lodash';
import ShipMaster from './shipMaster';
import Item from '../item/item';
import Const, { FLEET_TYPE, SHIP_TYPE } from '../const';
import AntiAirCutIn from '../aerialCombat/antiAirCutIn';
import { ShipBase } from '../interfaces/shipBase';
import ShootDownInfo from '../aerialCombat/shootDownInfo';
import ItemBonus, { ItemBonusStatus } from '../item/ItemBonus';

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
  /** 装備「なし」対潜 */
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
  /** 所持管理ユニークid */
  uniqueId?: number;
  /** 補強増設空いてるか */
  releaseExpand?: boolean;
  /** 在庫にないけど配備されている警告用 再装備時にはこの情報は引き継がない */
  noStock?: boolean;
  /** 装備受け皿用枠でインスタンス化するかどうか */
  isTray?: boolean;
  /** 海色リボン 白たすき */
  spEffectItemId?: number;
}

/** 表示ステータス */
export type ShipDisplayStatus = {
  HP: number;
  firePower: number;
  armor: number;
  torpedo: number;
  avoid: number;
  antiAir: number;
  asw: number;
  LoS: number;
  luck: number;
  range: number;
  accuracy: number;
  bomber: number;
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

  /** 表示ステータス (装備 + 装備ボーナス込み) */
  public readonly displayStatus: ShipDisplayStatus;

  /** 装備ボーナス合計 まとめ */
  public readonly itemBonusStatus: ItemBonusStatus;

  /** 装備フィットボーナスすべて */
  public readonly itemBonuses: ItemBonusStatus[];

  /** 耐久 */
  public readonly hp: number;

  /** 計算で適用する運 */
  public readonly luck: number;

  /** 砲戦火力基礎値(連合とかで変わるので、とりあえずの基本値) */
  public readonly baseDayBattleFirePower: number;

  /** 支援射撃火力 */
  public readonly supportFirePower: number;

  /** 夜戦火力 */
  public readonly nightBattleFirePower: number;

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

  /** 通常命中 */
  public readonly accuracy: number;

  /** 支援命中 */
  public readonly supportAccuracy: number;

  /** 装備「なし」対潜値 */
  public readonly asw: number;

  /** 改修分対潜値 */
  public readonly improveAsw: number;

  /** 装備による対潜上昇値 */
  public readonly itemAsw: number;

  /** 先制対潜可 */
  public readonly enabledTSBK: boolean;

  /** 輸送量 */
  public readonly tp: number;

  /** 輸送量(戦車) */
  public readonly tp2: number;

  /** 輸送量(戦車) */
  public readonly tp3: number;

  /** 速力 */
  public readonly speed: number;

  /** 消費燃料 */
  public readonly fuel: number;

  /** 消費弾薬 */
  public readonly ammo: number;

  /** 出撃海域 */
  public readonly area: number;

  /** 所持数登録ユニークid */
  public readonly uniqueId: number;

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

  /** 航空支援制空値 */
  public readonly supportAirPower: number;

  /** 対潜支援制空値 */
  public readonly supportAswAirPower: number;

  /** 対潜支援参加可能 */
  public readonly enabledASWSupport: boolean;

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

  /** 夜襲 発動可能判定 */
  public readonly enabledAircraftNightAttack: boolean;

  /** 夜襲 熟練甲板要員火力ボーナス */
  public readonly nightAttackCrewFireBonus: number;

  /** 夜襲 熟練甲板要員爆装ボーナス */
  public readonly nightAttackCrewBomberBonus: number;

  /** 補強増設空いてる？ */
  public readonly releaseExpand: boolean;

  /** 所持なしなのに配備されてる */
  public readonly noStock: boolean;

  /** 装備置き場用プロパティ */
  public readonly isTray: boolean;

  /** 海色リボン 白たすき */
  public readonly spEffectItemId: number;

  /** 先制対潜不足対潜値 */
  public missingAsw = 0;

  /** 先制対潜可になるまでの残りLevel */
  public needTSBKLevel = 0;

  /** 固定撃墜 画面表示用 */
  public fixDown = 0;

  /** 割合撃墜 画面表示用 */
  public rateDown = 0;

  /** 棒立ち率 */
  public allPlaneDeathRate = 0;

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
      this.area = builder.area !== undefined ? builder.area : builder.ship.area;
      this.uniqueId = builder.uniqueId !== undefined ? builder.uniqueId : builder.ship.uniqueId;
      this.releaseExpand = builder.releaseExpand !== undefined ? builder.releaseExpand : builder.ship.releaseExpand;
      this.noStock = builder.noStock ?? false;
      this.isTray = builder.isTray !== undefined ? builder.isTray : builder.ship.isTray;
      this.spEffectItemId = builder.spEffectItemId !== undefined ? builder.spEffectItemId : builder.ship.spEffectItemId;
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
      this.area = builder.area !== undefined ? builder.area : 0;
      this.uniqueId = builder.uniqueId !== undefined ? builder.uniqueId : 0;
      this.releaseExpand = builder.releaseExpand !== undefined ? builder.releaseExpand : true;
      this.noStock = builder.noStock ?? false;
      this.isTray = builder.isTray ?? false;
      this.spEffectItemId = builder.spEffectItemId ?? 0;
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

    // 異常値によるステータス修正
    if (this.asw === 0 && this.data.minAsw && this.data.maxAsw) {
      this.asw = Ship.getStatusFromLevel(this.level, this.data.maxAsw, this.data.minAsw);
    }
    if (this.luck === 0 && this.data.luck) {
      this.luck = this.data.luck;
    }
    if (this.hp === 0) {
      this.hp = this.data.hp;
    }

    // レベルによる耐久修正
    if (this.level > 99 && this.hp < this.data.hp2) {
      this.hp = this.data.hp2;
    } else if (this.level <= 99 && (this.hp === this.data.hp2 || this.hp === 0)) {
      this.hp = this.data.hp;
    }

    this.fullAirPower = 0;
    this.supportAirPower = 0;
    this.supportAswAirPower = 0;
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
    this.nightBattleFirePower = 0;
    this.nightAttackCrewFireBonus = 0;
    this.nightAttackCrewBomberBonus = 0;
    this.accuracy = 0;
    this.supportAccuracy = 0;
    this.fuel = Math.max(this.level > 99 ? Math.floor(this.data.fuel * 0.85) : this.data.fuel, 1);
    this.ammo = Math.max(this.level > 99 ? Math.floor(this.data.ammo * 0.85) : this.data.ammo, 1);

    // 以下、計算により算出するステータス
    // レベルより算出
    this.scout = Ship.getStatusFromLevel(this.level, this.data.maxScout, this.data.minScout);
    this.avoid = Ship.getStatusFromLevel(this.level, this.data.maxAvoid, this.data.minAvoid);
    this.improveAsw = Math.max(this.asw - Ship.getStatusFromLevel(this.level, this.data.maxAsw, this.data.minAsw), 0);

    // ステータス表示値
    this.displayStatus = {
      HP: this.hp,
      firePower: this.data.fire,
      armor: this.data.armor,
      torpedo: this.data.torpedo,
      avoid: this.avoid,
      antiAir: this.antiAir,
      asw: this.asw,
      LoS: this.scout,
      luck: this.luck,
      range: Math.max(this.data.range, 1),
      accuracy: 0,
      bomber: 0,
    };
    this.itemBonusStatus = {
      firePower: 0,
      torpedo: 0,
      antiAir: 0,
      armor: 0,
      asw: 0,
      scout: 0,
      avoid: 0,
      accuracy: 0,
      bomber: 0,
      range: 0,
    };

    // 輸送量(艦娘分)
    this.tp = this.getTransportPower();
    this.tp2 = this.getTransportPower2();
    this.tp3 = this.getTransportPower3();

    /** 対潜支援参加可能な艦種であるかどうか */
    const enabledASWSupport = [SHIP_TYPE.CVL, SHIP_TYPE.AV, SHIP_TYPE.AO, SHIP_TYPE.AO_2, SHIP_TYPE.LHA, SHIP_TYPE.CL, +SHIP_TYPE.CT].includes(this.data.type);

    /** 夜偵"失敗率" */
    let nightContactFailureRate = 1;
    // 装備一覧より取得
    const items = this.items.concat(this.exItem);
    // 装備ボーナス算出
    this.itemBonuses = Ship.getItemBonus(this.data, items);
    // 海色リボン 白たすき系
    if (this.spEffectItemId === 1) {
      // 海色リボン
      this.itemBonuses.push({ torpedo: 1, armor: 1 });
    } else if (this.spEffectItemId === 2) {
      // 白たすき
      this.itemBonuses.push({ firePower: 2, avoid: 2 });
    }

    let crewTorpedoBonus = 0;
    let crewBomberBonus = 0;
    const crewBonuses = this.itemBonuses.filter((v) => v.fromTypeId === 35);
    for (let i = 0; i < crewBonuses.length; i += 1) {
      const bonus = crewBonuses[i];
      // 搭乗員雷装ボーナスを取得
      if (bonus.torpedo && crewTorpedoBonus < bonus.torpedo) {
        crewTorpedoBonus = bonus.torpedo;
      }
      // 搭乗員爆装ボーナスを取得
      if (bonus.bomber && crewBomberBonus < bonus.bomber) {
        crewBomberBonus = bonus.bomber;
      }
      // 搭乗員夜襲(爆装)ボーナスを加算
      if (bonus.bomber) {
        this.nightAttackCrewBomberBonus += bonus.bomber;
      }
      // 搭乗員夜襲(火力)ボーナスを加算
      if (bonus.firePower) {
        this.nightAttackCrewFireBonus += bonus.firePower;
      }
    }

    /** 雷装ボーナス適用装備(最も雷装 or 爆装が高い) */
    let maximumAttacker = new Item();

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];

      // 装備ステータス 単純加算
      this.displayStatus.firePower += item.data.fire;
      this.displayStatus.armor += item.data.armor;
      this.displayStatus.torpedo += item.data.torpedo;
      this.displayStatus.avoid += item.data.avoid;
      this.displayStatus.antiAir += item.data.antiAir;
      this.displayStatus.asw += item.data.asw;
      this.displayStatus.LoS += item.data.scout;
      this.displayStatus.bomber += item.data.bomber;
      this.displayStatus.accuracy += item.data.accuracy;
      this.accuracy += item.data.accuracy;
      this.supportAccuracy += item.data.accuracy;

      // 装備防空ボーナス
      this.antiAirBonus += item.antiAirBonus;
      // 装備索敵関係
      this.itemsScout += item.itemScout;
      // 対潜値
      this.itemAsw += item.data.asw;
      // 輸送量
      this.tp += item.tp;
      this.tp2 += item.tp2;
      this.tp3 += item.tp3;
      // 装甲値
      this.actualArmor += item.data.armor;

      // 射程(大きくなるなら)
      if (item.data.range > this.displayStatus.range) {
        this.displayStatus.range = item.data.range;
      }

      if (item.fullSlot > 0 && item.data.isPlane && !item.data.isRecon && !item.data.isABAttacker) {
        // 制空値を加算 (搭載数1以上 航空機 偵察機でない 陸攻でない)
        this.fullAirPower += item.fullAirPower;
        this.supportAirPower += item.supportAirPower;
      }
      this.supportAswAirPower += item.supportAswAirPower;

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
        item.attackerTorpedoBonus = 0;
        item.crewTorpedoBonus = crewTorpedoBonus;
        item.crewBomberBonus = crewBomberBonus;

        const temp = Math.max(maximumAttacker.data.torpedo, maximumAttacker.data.bomber);
        const value = Math.max(item.data.torpedo, item.data.bomber);
        if (temp < value) {
          // 最も雷装 or 爆装の高い機体を一時保持
          maximumAttacker = item;
        }
      }

      if (item.data.iconTypeId === 11) {
        // 対空電探
        if (item.data.antiAir > 1) this.antiAirRadarCount += 1;
        // 水上電探
        if (item.data.scout > 4) this.surfaceRadarCount += 1;
      }
      if (item.data.iconTypeId === 16) {
        // 特殊高角砲
        if (item.data.isSpecial) this.specialKokakuCount += 1;
        // 高角砲
        else this.kokakuCount += 1;
      }
      if (item.data.apiTypeId === 21) {
        // 特殊機銃
        if (item.data.isSpecial) this.specialKijuCount += 1;
        // 機銃
        else this.kijuCount += 1;
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
        nightContactFailureRate -= nightContactFailureRate * Math.min((Math.floor(Math.sqrt(item.data.scout) * Math.sqrt(this.level)) / 25), 1);
      }

      // 夜戦火力
      this.nightBattleFirePower += item.bonusNightFire;
      this.accuracy += item.bonusAccuracy;
    }

    this.nightContactRate = 1 - nightContactFailureRate;

    // 速力計算
    this.speed = this.getShipSpeed();

    if (this.itemBonuses.length) {
      // 装備ボーナスを表示値に加算
      this.itemBonusStatus = ItemBonus.getTotalBonus(this.itemBonuses);
      this.displayStatus.firePower += this.itemBonusStatus.firePower ?? 0;
      this.displayStatus.armor += this.itemBonusStatus.armor ?? 0;
      this.displayStatus.torpedo += this.itemBonusStatus.torpedo ?? 0;
      this.displayStatus.avoid += this.itemBonusStatus.avoid ?? 0;
      this.displayStatus.antiAir += this.itemBonusStatus.antiAir ?? 0;
      this.displayStatus.asw += this.itemBonusStatus.asw ?? 0;
      this.displayStatus.LoS += this.itemBonusStatus.scout ?? 0;
      this.displayStatus.range += this.itemBonusStatus.range ?? 0;
      this.displayStatus.bomber += this.itemBonusStatus.bomber ?? 0;
      this.displayStatus.accuracy += this.itemBonusStatus.accuracy ?? 0;
      this.accuracy += this.itemBonusStatus.accuracy ?? 0;
    }

    // 空母夜襲発動判定
    this.enabledAircraftNightAttack = (this.data.isCV && ([545, 599, 610, 883].includes(this.data.id) || (items.some((w) => w.data.id === 258 || w.data.id === 259)))) || this.data.id === 1008;

    if (this.enabledAircraftNightAttack) {
      // 空母夜襲火力に置き換え
      this.nightBattleFirePower = this.getAircraftNightAttackPrePower(0);
    } else {
      // 夜戦火力加算
      this.nightBattleFirePower += (this.displayStatus.firePower + this.displayStatus.torpedo);
    }

    // 航空戦雷装ボーナス適用装備抽出 & セット
    if (this.itemBonuses.length && maximumAttacker.data.isAttacker) {
      const torpBomberTorpedoBonuses = [];
      const seaplaneBomberTorpedoBonuses = [];

      for (let i = 0; i < this.itemBonuses.length; i += 1) {
        const bonus = this.itemBonuses[i];
        if (bonus.torpedo && bonus.fromTypeId && bonus.fromTypeId === 8) {
          // 艦攻による雷装ボーナス
          torpBomberTorpedoBonuses.push(bonus.torpedo);
        } else if (bonus.torpedo && bonus.fromTypeId && bonus.fromTypeId === 11) {
          // 水上爆撃機による雷装ボーナス
          seaplaneBomberTorpedoBonuses.push(bonus.torpedo);
        }
      }

      if (torpBomberTorpedoBonuses.length) {
        // 適用装備の最も低い雷装ボーナスを加算
        maximumAttacker.attackerTorpedoBonus += torpBomberTorpedoBonuses.sort((a, b) => a - b)[0];
      }
      if (seaplaneBomberTorpedoBonuses.length) {
        // 適用装備の最も高い雷装ボーナスを加算
        maximumAttacker.attackerTorpedoBonus += seaplaneBomberTorpedoBonuses.sort((a, b) => b - a)[0];
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
    // 先制対潜の可否を判定
    this.enabledTSBK = this.getEnabledTSBK();

    // 装備もマスタもない場合空として計算対象から省く
    this.isEmpty = this.data.id === 0 && !this.items.some((v) => v.data.id > 0);

    // 昼戦基礎火力算出
    this.baseDayBattleFirePower = Ship.getDayBattleFirePower(this, FLEET_TYPE.SINGLE, false);
    this.supportFirePower = this.getSupportFirePower();
  }

  /**
   * 昼戦砲撃火力を返却
   * @static
   * @param {Ship} ship
   * @param {number} fleetType
   * @param {boolean} enemyIsUnion
   * @returns {number}
   * @memberof Ship
   */
  public static getDayBattleFirePower(ship: Ship, fleetType: number, enemyIsUnion: boolean): number {
    let dayBattleFirePower = 0;

    let correct = 0;

    if (fleetType === FLEET_TYPE.CTF) {
      // 空母機動
      if (ship.isEscort) {
        // 随伴 => 敵連合-5 敵通常+10
        correct = enemyIsUnion ? -5 : 10;
      } else {
        // 本隊 => +2
        correct = 2;
      }
    } else if (fleetType === FLEET_TYPE.STF) {
      // 水上打撃
      if (ship.isEscort) {
        // 随伴 => -5
        correct = -5;
      } else {
        // 本隊 => 敵連合+2 敵通常+10
        correct = enemyIsUnion ? 2 : 10;
      }
    } else if (fleetType === FLEET_TYPE.TCF) {
      // 輸送護衛
      if (ship.isEscort) {
        // 随伴 => 敵連合-5 敵通常+10
        correct = enemyIsUnion ? -5 : 10;
      } else {
        // 本隊 => -5
        correct = -5;
      }
    }

    const items = ship.items.concat(ship.exItem);
    let sumRemodelBonusFirePower = 0;
    for (let i = 0; i < items.length; i += 1) {
      sumRemodelBonusFirePower += items[i].bonusFire;
    }

    if (ship.data.isCV || ([352, 717, 1008].includes(ship.data.id) && items.some((v) => v.data.isAttacker && v.data.apiTypeId !== 11 && !v.data.isAswPlane))) {
      // 空母系 or (速吸 or 山汐丸 + 艦攻艦爆 or しまね丸 + 艦攻艦爆)
      dayBattleFirePower = Math.floor(1.5 * (ship.displayStatus.firePower + ship.displayStatus.torpedo + Math.floor(1.3 * ship.displayStatus.bomber) + sumRemodelBonusFirePower + correct)) + 55;
    } else {
      dayBattleFirePower = ship.displayStatus.firePower + sumRemodelBonusFirePower + correct + 5;
    }
    return dayBattleFirePower;
  }

  /**
   * 支援火力を返却
   * @return {*}  {number}
   * @memberof Ship
   */
  public getSupportFirePower(): number {
    let supportFirePower = 0;
    if (this.data.isCV || ([717].includes(this.data.id) && this.items.some((v) => v.data.isAttacker && !v.data.isAswPlane))) {
      // 空母系 山汐丸
      supportFirePower = Math.floor(1.5 * (this.displayStatus.firePower + this.displayStatus.torpedo + Math.floor(1.3 * this.displayStatus.bomber) - 1)) + 55;
    } else {
      supportFirePower = this.displayStatus.firePower + 4;
    }
    return supportFirePower;
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
   * 指定数値に到達するために必要なLevelを算出
   * @static
   * @param {number} target
   * @param {number} max Lv.99時最大値
   * @param {number} min 初期値
   * @return {*} 必要Level
   * @memberof Ship
   */
  public static getRequiredLevel(target: number, max: number, min: number): number {
    if (!(max - min)) {
      return 0;
    }
    return Math.max(Math.ceil((99 * (target - min)) / (max - min)), 1);
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
   * 指定命中項に到達するために必要なLevelを算出
   * @static
   * @param {number} target 目標数値
   * @param {number} luck 運
   * @return {*}  {number} 必要Level
   * @memberof Ship
   */
  public static getRequiredLevelAccuracy(target: number, luck: number): number {
    if (target - (3 / 2) * Math.sqrt(luck) >= 0) {
      return Math.ceil(((target - (3 / 2) * Math.sqrt(luck)) ** 2) / 4);
    }
    return 0;
  }

  /**
   * 指定命中項に到達するために必要な運を算出
   * @static
   * @param {number} target 目標数値
   * @param {number} level Level
   * @return {*}  {number} 必要運
   * @memberof Ship
   */
  public static getRequiredLuckAccuracy(target: number, level: number): number {
    return Math.ceil((4 / 9) * (target - (2 * Math.sqrt(level))) ** 2);
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
   * 指定CI項に到達するために必要なLevelを算出
   * @static
   * @param {number} target 目標数値
   * @param {number} luck 運
   * @return {*}  {number} 必要Level
   * @memberof Ship
   */
  public static getRequiredLevelCI(target: number, luck: number): number {
    if (luck >= 50) {
      if (target - (65 + Math.sqrt(luck - 50)) >= 0) {
        return Math.ceil((25 * (target - (65 + Math.sqrt(luck - 50))) ** 2) / 16);
      }
      return 0;
    }

    if (target - (15 + luck) >= 0) {
      return Math.ceil((16 * (target - (15 + luck)) ** 2) / 9);
    }
    return 0;
  }

  /**
   * 指定CI項に到達するために必要な運を算出
   * @static
   * @param {number} target 目標数値
   * @param {number} level Level
   * @return {*}  {number} 必要運
   * @memberof Ship
   */
  public static getRequiredLuckCI(target: number, level: number): number {
    const luck = Math.ceil(target - (15 + 0.75 * Math.sqrt(level)));
    if (luck > 50) {
      // 運50を超える場合は別式
      return Math.ceil((target - (65 + 0.8 * Math.sqrt(level))) ** 2 + 50);
    }
    return luck;
  }

  /**
   * 速力を決定
   * @memberof Ship
   */
  public getShipSpeed(): number {
    const items = this.items.concat(this.exItem);
    const hasTurbine = items.some((v) => v.data.id === 33);
    const boilerCount = items.filter((v) => v.data.id === 34).length;
    const newModelBoilerCount = items.filter((v) => v.data.id === 87).length;
    const totalBoilerCount = boilerCount + newModelBoilerCount;
    // 改修★+7以上の新型缶個数
    const remodeledNewModelBoilerCount = items.filter((v) => v.data.id === 87 && v.remodel >= 7).length;

    if (this.data.speed === 10) {
      // 高速
      if ([22, 81, 43, 33, 31, 9].includes(this.data.type2) || this.data.id === 951) {
        // 島風型, Ташкент級, 天津風改二, 大鳳型, 翔鶴型, 利根型, 最上型
        if ((hasTurbine && newModelBoilerCount) || (hasTurbine && totalBoilerCount >= 2) || remodeledNewModelBoilerCount >= 2) {
          // タービン + 新型缶 または タービン + いずれかの缶x2 または 改修★+7以上の新型缶x2 => 最速
          return 20;
        }
        if ((hasTurbine && totalBoilerCount) || remodeledNewModelBoilerCount) {
          // いずれかの缶 または 改修★+7以上の新型缶
          return 15;
        }
      } else if ([41, 17, 25, 6, 65, 37].includes(this.data.type2) || [181, 404, 331].includes(this.data.originalId)) {
        // 阿賀野型, 蒼龍型, 飛龍型, 金剛型, Iowa級, 大和型
        // 天津風, 雲龍, 天城
        if (hasTurbine && newModelBoilerCount && totalBoilerCount >= 2) {
          // 新型缶 + いずれかの缶 => 最速
          return 20;
        }
        if (hasTurbine && totalBoilerCount) {
          // いずれかの缶 => 高速+
          return 15;
        }
      } else if ([3, 87].includes(this.data.type2) || this.data.type === SHIP_TYPE.AV) {
        // 加賀型, Samuel, 水母
        if (hasTurbine && totalBoilerCount) {
          // いずれかの缶 => 高速+
          return 15;
        }
      } else {
        // それ以外の高速
        if (hasTurbine && (newModelBoilerCount >= 2 || totalBoilerCount >= 3)) {
          // 新型缶x2 || いずれかの缶x3 => 最速
          return 20;
        }
        if (hasTurbine && totalBoilerCount) {
          // いずれかの缶 => 高速+
          return 15;
        }
      }
    } else if (this.data.speed === 5) {
      // 低速
      if ([37].includes(this.data.type2) || this.data.id === 541 || this.data.id === 573) {
        // 大和型, 長門改二, 陸奥改二
        if (hasTurbine && newModelBoilerCount && totalBoilerCount >= 3) {
          // タービン + 新型缶含むいずれかの缶x3 => 最速
          return 20;
        }
        if (hasTurbine && remodeledNewModelBoilerCount >= 2) {
          // タービン + 改修★7新型缶x2 => 最速
          return 20;
        }
        if (hasTurbine && newModelBoilerCount && totalBoilerCount >= 2) {
          // タービン + 新型缶含むいずれかの缶x2 => 高速+
          return 15;
        }
        if (hasTurbine && remodeledNewModelBoilerCount) {
          // タービン + 改修★7新型缶 => 高速+
          return 15;
        }
        if (hasTurbine && totalBoilerCount) {
          // タービン + いずれかの缶 => 高速
          return 10;
        }
      } else if (this.data.id === 894 || this.data.id === 899) {
        // 鳳翔改二 / 戦
        if (hasTurbine && newModelBoilerCount >= 2) {
          // タービン + 新型缶x2 => 最速
          return 20;
        }
        if (hasTurbine && newModelBoilerCount) {
          // タービン + 新型缶 => 高速+
          return 15;
        }
        if (hasTurbine && totalBoilerCount) {
          // タービン + いずれかの缶 => 高速
          return 10;
        }
        if (newModelBoilerCount) {
          // 新型缶 => 高速
          return 10;
        }
      } else if (this.data.originalId === 561 || this.data.id === 623) {
        // Samuel B.Roberts, 夕張改二特
        if (hasTurbine && (newModelBoilerCount >= 2 || totalBoilerCount >= 3)) {
          // タービン + (新型缶x2 || いずれかの缶x3) => 高速+
          return 15;
        }
        if (hasTurbine) {
          // タービン => 高速
          return 10;
        }
      } else if (this.data.type2 === 109 || this.data.id === 979) {
        // 潜高型, 稲木改二
        if (hasTurbine && (newModelBoilerCount || totalBoilerCount >= 3)) {
          // タービン + (新型缶 or いずれかの缶x3) => 高速+
          return 15;
        }
        if (newModelBoilerCount || (hasTurbine && totalBoilerCount)) {
          // タービン + いずれかの缶 || 新型缶 => 高速
          return 10;
        }
      } else if (this.data.type === SHIP_TYPE.SS || this.data.type === SHIP_TYPE.SSV || [45, 49, 60].includes(this.data.type2)) {
        // 潜水艦, 潜水空母, 特種船丙型, 工作艦, 改風早型
        if (hasTurbine && totalBoilerCount) {
          // タービン + いずれかの缶 => 高速
          return 10;
        }
      } else {
        // その他の低速艦
        if (hasTurbine && (newModelBoilerCount >= 2 || totalBoilerCount >= 3)) {
          // タービン + (新型缶x2 || いずれかの缶x3) => 高速+
          return 15;
        }
        if (hasTurbine && totalBoilerCount) {
          // タービン + いずれかの缶 => 高速
          return 10;
        }
      }
    }

    return this.data.speed;
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
      // 対象は搭載数が存在する攻撃機か大型飛行艇(api_id: 41)か対潜哨戒機
      if (item.slot > 0 && (item.data.isAttacker || item.data.apiTypeId === 41 || (item.data.isAswBomber2))) {
        // 熟練度定数C
        const c = [0, 1, 2, 3, 4, 5, 7, 10][item.levelAlt];

        if (item.data.isAswPlane) {
          // 対潜哨戒機
          if (i === 0) {
            // 隊長機補正
            bonus += Math.floor(Math.sqrt(item.level) + c) / 128;
          } else {
            bonus += Math.floor(Math.sqrt(item.level) + c) / 242;
          }
        } else if (i === 0) {
          // 隊長機補正
          bonus += Math.floor(Math.sqrt(item.level) + c) / 100;
        } else {
          bonus += Math.floor(Math.sqrt(item.level) + c) / 200;
        }
      }
    }

    // 補正値 = int(√内部熟練度  + C) / (隊長機によって変動 100 ~ 240)
    return 1 + bonus;
  }

  /**
   * 装備ボーナスを取得
   * @static
   * @param {ShipMaster} ship
   * @param {Item[]} items
   * @return {*}  {ItemBonusStatus}
   * @memberof Ship
   */
  public static getItemBonus(ship: ShipMaster, items: Item[]): ItemBonusStatus[] {
    if (!items.some((v) => v.data.id)) {
      return [];
    }

    const sumBonuses: ItemBonusStatus[] = [];

    let antiAirRadarCount = 0;
    let surfaceRadarCount = 0;
    let accuracyRadarCount = 0;

    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      // 対空電探カウント
      if (item.data.iconTypeId === 11 && item.data.antiAir > 1) {
        antiAirRadarCount += 1;
      }
      // 水上電探カウント
      if (item.data.iconTypeId === 11 && item.data.scout > 4) {
        surfaceRadarCount += 1;
      }
      // 命中付き電探カウント
      if (item.data.iconTypeId === 11 && item.data.accuracy >= 8) {
        accuracyRadarCount += 1;
      }
    }
    const {
      id, type, type2, originalId,
    } = ship;

    const { bonusData } = ItemBonus;
    for (let i = 0; i < bonusData.length; i += 1) {
      const { types, ids, bonuses } = bonusData[i];
      if ((types || ids) && bonuses) {
        /** ボーナスの発生ベースとなる装備 */
        let fitItems: Item[] | undefined;

        // そもそもの存在チェック
        if (types) {
          fitItems = items.filter((v) => types.includes(v.data.apiTypeId));
        } else if (ids) {
          fitItems = items.filter((v) => ids.includes(v.data.id));
        }
        if (!fitItems || !fitItems.length) {
          continue;
        }

        for (let j = 0; j < bonuses.length; j += 1) {
          const bonus = bonuses[j];
          // 未改造判定
          if (bonus.shipBase && !bonus.shipBase.includes(originalId)) {
            continue;
          }
          // 艦型判定
          if (bonus.shipClass && !bonus.shipClass.includes(type2)) {
            continue;
          }
          // 国籍判定
          if (bonus.shipCountry && !bonus.shipCountry.includes(type2)) {
            continue;
          }
          // 艦種判定
          if (bonus.shipType && !bonus.shipType.includes(type)) {
            continue;
          }
          // 艦id判定
          if (bonus.shipId && !bonus.shipId.includes(id)) {
            continue;
          }
          // 対空電探判定
          if (bonus.requiresAR && !antiAirRadarCount) {
            continue;
          }
          // 水上電探判定
          if (bonus.requiresSR && !surfaceRadarCount) {
            continue;
          }
          // 命中付き電探判定
          if (bonus.requiresAccR && !accuracyRadarCount) {
            continue;
          }
          // 装備固有id判定
          if (bonus.requiresId) {
            /** このボーナス発生に必要な装備id 複数ある場合はいずれか */
            const requiredItems = bonus.requiresId;
            /** このボーナス発生に必要な装備の最低改修値 */
            const requireRemodel = bonus.requiresIdLevel ?? 0;
            /** 現在搭載中の装備のうち、ボーナス発生に必要な装備たち */
            const targetItems = items.filter((v) => requiredItems.includes(v.data.id));
            // 個数判定
            if (bonus.requiresIdNum && targetItems.length < bonus.requiresIdNum) {
              // ボーナス発生に必要な装備個数がたりなかったので却下
              continue;
            } else if (requireRemodel && !targetItems.some((v) => v.remodel >= requireRemodel)) {
              // ボーナス発生に必要な装備の改修値が足りなかったので却下
              continue;
            } else if (!targetItems.length) {
              // ボーナス発生に必要な装備がなかったので却下
              continue;
            } else if (bonus.requiresId2) {
              /** このボーナス発生に必要な装備id 複数ある場合はいずれか */
              const requiredItems2 = bonus.requiresId2;
              /** このボーナス発生に必要な装備の最低改修値 */
              const requireRemodel2 = bonus.requiresIdLevel2 ?? 0;
              /** 現在搭載中の装備のうち、ボーナス発生に必要な装備たち */
              const targetItems2 = items.filter((v) => requiredItems2.includes(v.data.id));
              if (!targetItems2.length) {
                // ボーナス発生に必要な装備がなかったので却下
                continue;
              } else if (requireRemodel2 && !targetItems2.some((v) => v.remodel >= requireRemodel2)) {
                // ボーナス発生に必要な装備の改修値が足りなかったので却下
                continue;
              }
            }
          }
          // 装備種別判定
          if (bonus.requiresType && !items.some((v) => bonus.requiresType?.includes(v.data.apiTypeId))) {
            continue;
          }

          // 改修判定
          const minRemodel = bonus.remodel;
          if (minRemodel) {
            const remodelFits = fitItems.filter((v) => v.remodel >= minRemodel);
            // 合致した装備からさらに改修値で判定
            if (!remodelFits.length) {
              continue;
            }
            // 合致した装備からさらに個数で判定
            if (bonus.num && remodelFits.length < bonus.num) {
              continue;
            } else if (!bonus.num) {
              // 個数制限がない場合はその数だけ回す
              for (let b = 0; b < remodelFits.length; b += 1) {
                sumBonuses.push(Object.assign(bonus.bonus, { fromTypeId: remodelFits[b].data.apiTypeId }));
              }
            } else {
              // ようやくBonusを適用
              sumBonuses.push(Object.assign(bonus.bonus, { fromTypeId: remodelFits[0].data.apiTypeId }));
            }
          } else if (bonus.num && fitItems.length < bonus.num) {
            // 合致した装備からさらに個数で判定
            continue;
          } else if (!bonus.num) {
            // 個数制限がない場合はその数だけ回す
            for (let b = 0; b < fitItems.length; b += 1) {
              sumBonuses.push(Object.assign(bonus.bonus, { fromTypeId: fitItems[b].data.apiTypeId }));
            }
          } else {
            // ようやくBonusを適用
            sumBonuses.push(Object.assign(bonus.bonus, { fromTypeId: fitItems[0].data.apiTypeId }));
          }
        }
      }
    }
    return sumBonuses;
  }

  /**
   * 指定したスロットにある装備特有の装備ボーナスを取得
   *  => 指定スロットの装備を外した場合との差分から算出する
   * @param {number} slotIndex
   * @return {*}  {ItemBonusStatus}
   * @memberof Ship
   */
  public getItemBonusDiff(slotIndex: number): ItemBonusStatus {
    // この装備がなかった場合のボーナスと比較した分をこの装備のボーナスとする
    const baseItems = this.items.concat();
    baseItems.push(this.exItem);
    const tempItems = cloneDeep(baseItems);
    tempItems[(slotIndex < 0 || slotIndex === Const.EXPAND_SLOT_INDEX) ? tempItems.length - 1 : slotIndex] = new Item();

    const emptyBonus = Ship.getItemBonus(this.data, tempItems);
    // 未装備時のボーナス合計
    const totalEmptyBonus = ItemBonus.getTotalBonus(emptyBonus);
    // 装備している現在のボーナス これをベースに、未装備時のボーナスを差っ引いていく
    const totalBonus = ItemBonus.getTotalBonus(this.itemBonuses);
    // 未装備時と、装備時のボーナスの差分を取る
    if (totalBonus.firePower !== undefined) {
      totalBonus.firePower -= totalEmptyBonus.firePower ?? 0;
    }
    if (totalBonus.torpedo !== undefined) {
      totalBonus.torpedo -= totalEmptyBonus.torpedo ?? 0;
    }
    if (totalBonus.antiAir !== undefined) {
      totalBonus.antiAir -= totalEmptyBonus.antiAir ?? 0;
    }
    if (totalBonus.armor !== undefined) {
      totalBonus.armor -= totalEmptyBonus.armor ?? 0;
    }
    if (totalBonus.asw !== undefined) {
      totalBonus.asw -= totalEmptyBonus.asw ?? 0;
    }
    if (totalBonus.avoid !== undefined) {
      totalBonus.avoid -= totalEmptyBonus.avoid ?? 0;
    }
    if (totalBonus.accuracy !== undefined) {
      totalBonus.accuracy -= totalEmptyBonus.accuracy ?? 0;
    }
    if (totalBonus.range !== undefined) {
      totalBonus.range -= totalEmptyBonus.range ?? 0;
    }
    if (totalBonus.bomber !== undefined) {
      totalBonus.bomber -= totalEmptyBonus.bomber ?? 0;
    }
    if (totalBonus.scout !== undefined) {
      totalBonus.scout -= totalEmptyBonus.scout ?? 0;
    }

    // 海色リボン 白たすきの分を引く
    if (this.spEffectItemId === 1 && totalBonus.torpedo && totalBonus.armor) {
      // 海色リボン
      totalBonus.torpedo -= 1;
      totalBonus.armor -= 1;
    } else if (this.spEffectItemId === 2 && totalBonus.firePower && totalBonus.avoid) {
      // 白たすき
      totalBonus.firePower -= 2;
      totalBonus.avoid -= 2;
    }

    return totalBonus;
  }

  /**
   * 先制対潜の可否を判定
   * @private
   * @return {boolean} 可能ならtrue
   * @memberof Ship
   */
  private getEnabledTSBK(): boolean {
    if (this.data.id === 0) {
      return false;
    }

    // 無条件先制対潜 初期値50
    if (this.data.minAsw >= 50 && !this.data.isCV && !this.data.isBB) {
      return true;
    }

    const { type } = this.data;
    const items = this.items.concat(this.exItem);
    // ソナー有無
    const hasSonar = items.some((v) => v.data.apiTypeId === 14 || v.data.apiTypeId === 40);

    if (type === SHIP_TYPE.DE) {
      // 海防艦
      if (this.displayStatus.asw >= 75 && this.itemAsw >= 4) {
        // => 表示対潜値75 + 装備対潜値合計が4以上
        if (this.displayStatus.asw >= 75) {
          return true;
        }
        this.missingAsw = 75 - this.displayStatus.asw;
      }
      if (this.displayStatus.asw >= 60 && hasSonar) {
        // => 表示対潜値60 + ソナー有
        if (this.displayStatus.asw >= 60) {
          return true;
        }
        this.missingAsw = 60 - this.displayStatus.asw;
      }
    }

    if (this.data.id === 717) {
      // 山汐丸改
      if (items.some((v) => v.data.isAttacker)) {
        // 攻撃機があるなら => 表示対潜値100 + ソナー + (攻撃機 or 対潜哨戒機 or 回転翼機)
        if (hasSonar && items.some((v) => (v.data.isAttacker && v.data.asw >= 1) || v.data.isAswPlane)) {
          if (this.displayStatus.asw >= 100) {
            return true;
          }
          this.missingAsw = 100 - this.displayStatus.asw;
        }
      } else if (hasSonar) {
        if (this.displayStatus.asw >= 100) {
          return true;
        }
        this.missingAsw = 100 - this.displayStatus.asw;
      }
    } else if (type === SHIP_TYPE.DD || type === SHIP_TYPE.CL || type === SHIP_TYPE.CLT || type === SHIP_TYPE.CT || type === SHIP_TYPE.AO || type === SHIP_TYPE.AO_2) {
      // 駆逐 軽巡 練巡 雷巡 補給
      // => 表示対潜値100 + ソナー
      if (hasSonar) {
        if (this.displayStatus.asw >= 100) {
          return true;
        }
        this.missingAsw = 100 - this.displayStatus.asw;
      }
    }

    if ((this.data.type2 === 76 && this.data.name.indexOf('改') >= 0) || this.data.id === 646) {
      // 大鷹型改 改二 or 加賀改二護
      // => 対潜値1以上の艦攻/艦爆 or 対潜哨戒機 or 回転翼機
      return items.some((v) => (v.data.isAttacker && v.data.asw >= 1) || v.data.isAswPlane);
    }

    if (type === SHIP_TYPE.CVL) {
      // 軽空母 / 護衛空母
      const hasAswPlane = items.some((v) => v.fullSlot && v.data.isAswPlane);
      const hasEmptyASWPlane = items.some((v) => v.fullSlot === 0 && v.data.isAswPlane);

      if (this.data.id === 508 || this.data.id === 509) {
        // 鈴熊はできない
        return false;
      }

      if (hasSonar && (hasAswPlane || items.some((v) => v.data.isAttacker && v.data.asw >= 1))) {
        // => 表示対潜値100 + ソナー + (対潜値1以上の艦攻/艦爆 or 対潜哨戒機 or 回転翼機)
        if (this.displayStatus.asw >= 100) {
          return true;
        }
        this.missingAsw = 100 - this.displayStatus.asw;
      }
      if (hasAswPlane || items.some((v) => v.data.apiTypeId === 8 && v.data.asw >= 7) || (hasEmptyASWPlane && items.some((v) => v.data.isAttacker && v.data.asw && v.fullSlot))) {
        // => 表示対潜値65 + (対潜値7以上の艦攻 or 対潜哨戒機 or 回転翼機)
        // または、表示対潜値65 + 搭載数0の対潜哨戒機 or 回転翼機 + 対潜1以上の攻撃機
        if (this.displayStatus.asw >= 65) {
          return true;
        }
        this.missingAsw = 65 - this.displayStatus.asw;
      }
      if (hasSonar && (hasAswPlane || items.some((v) => v.data.apiTypeId === 8 && v.data.asw >= 7) || (hasEmptyASWPlane && items.some((v) => v.data.isAttacker && v.data.asw && v.fullSlot)))) {
        // => 表示対潜値50 + ソナー + (対潜値7以上の艦攻 or 対潜哨戒機 or 回転翼機)
        // 表示対潜値50 + ソナー + 搭載数0の対潜哨戒機 or 回転翼機 + 対潜1以上の攻撃機
        if (this.displayStatus.asw >= 50) {
          return true;
        }
        this.missingAsw = 50 - this.displayStatus.asw;
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
    if (this.data.id === 411 || this.data.id === 412) {
      // 扶桑型改二
      // => 表示対潜値100 + ソナー + (水上爆撃機 or 爆雷 or 対潜哨戒機 or 回転翼機)
      if (hasSonar && items.some((v) => v.data.apiTypeId === 11 || v.data.apiTypeId === 15 || v.data.isAswPlane)) {
        if (this.displayStatus.asw >= 100) {
          return true;
        }
        this.missingAsw = 100 - this.displayStatus.asw;
      }
    }

    if (type === SHIP_TYPE.BBV || type === SHIP_TYPE.LHA) {
      // 陸軍と航空戦艦
      // => 表示対潜値100 + ソナー + (攻撃機 or 対潜哨戒機 or 回転翼機)
      if (hasSonar && items.some((v) => (v.data.isAttacker && v.data.asw >= 1) || v.data.isAswPlane)) {
        if (this.displayStatus.asw >= 100) {
          return true;
        }
        this.missingAsw = 100 - this.displayStatus.asw;
      }
    }

    // 対潜値が問題で先制対潜に失敗しているなら、残りの対潜値から上げるべきレベルを算出
    if (this.missingAsw > 0 && this.data.maxAsw) {
      // 目標対潜値 = (装備なし表示値 - 対潜改修分) + 残りの必要対潜値
      const targetAsw = (this.asw - this.improveAsw) + this.missingAsw;
      this.needTSBKLevel = Ship.getRequiredLevel(targetAsw, this.data.maxAsw, this.data.minAsw);
    }

    this.missingAsw = Math.max(this.missingAsw, 0);

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
   * 艦種 艦娘毎によるTPを返却
   * @private
   * @returns {number}
   * @memberof Ship
   */
  private getTransportPower2(): number {
    // 艦種固定値
    switch (this.data.type) {
      case SHIP_TYPE.DD:
        return 3.25;

      case SHIP_TYPE.CL:
        return 1.3;

      case SHIP_TYPE.CT:
        return 3.9;

      case SHIP_TYPE.CAV:
        return 2.6;

      case SHIP_TYPE.BBV:
        return 4.55;

      case SHIP_TYPE.AO:
      case SHIP_TYPE.AO_2:
        return 9.75;

      case SHIP_TYPE.AV:
        return 5.85;

      case SHIP_TYPE.LHA:
        return 7.8;

      case SHIP_TYPE.SSV:
        return 0.65;

      case SHIP_TYPE.AS:
        return 4.55;

      default:
        return 0;
    }
  }

  /**
   * 艦種 艦娘毎によるTPを返却
   * @private
   * @returns {number}
   * @memberof Ship
   */
  private getTransportPower3(): number {
    // 艦種固定値
    switch (this.data.type) {
      case SHIP_TYPE.DD:
        return 4;

      case SHIP_TYPE.CL:
        return 1.6;

      case SHIP_TYPE.CT:
        return 4.8;

      case SHIP_TYPE.CAV:
        return 3.2;

      case SHIP_TYPE.BBV:
        return 5.6;

      case SHIP_TYPE.AO:
      case SHIP_TYPE.AO_2:
        return 12;

      case SHIP_TYPE.AV:
        return 7.2;

      case SHIP_TYPE.LHA:
        return 9.6;

      case SHIP_TYPE.SSV:
        return 0.8;

      case SHIP_TYPE.AS:
        return 5.6;

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
   * 空母夜間航空攻撃の基本火力を返却
   * @static
   * @param {number} [contactBonus=0] 夜偵
   * @param {boolean} [isLandBase=false] 地上施設かどうか
   * @returns {number}
   * @memberof AerialFirePowerCalculator
   */
  public getAircraftNightAttackPrePower(contactBonus = 0, isLandBase = false): number {
    // 艦娘の素火力 + 熟練甲板ボーナス(火力青字 + 爆装青字)
    let power = this.data.fire + this.nightAttackCrewFireBonus + this.nightAttackCrewBomberBonus;
    if (this.itemBonusStatus.torpedo) {
      // 雷装ボーナス
      power += this.itemBonusStatus.torpedo;
    }

    for (let i = 0; i < this.items.length; i += 1) {
      const item = this.items[i];
      if (!item.data.isNightAircraftItem) {
        // 夜間機以外は飛ばし
        continue;
      }

      // +（夜間飛行機の火力 + 雷装(対地時無効) + 爆装）
      if (isLandBase) {
        power += (item.data.fire + (item.data.isTorpedoAttacker ? 0 : item.data.bomber));
      } else {
        power += (item.data.fire + (item.data.isTorpedoAttacker ? item.data.torpedo : item.data.bomber));
      }
      const totalStatus = item.data.fire + item.data.torpedo + item.data.bomber + item.data.asw;
      if (item.data.iconTypeId === 45 || item.data.iconTypeId === 46 || item.data.iconTypeId === 58) {
        // 夜間飛行機搭載補正 = A(3.0) × 搭載数 + B(0.45) × (火力 + 雷装 + 爆装 + 対潜) × √(搭載数) + √(★)
        power += (3 * item.fullSlot + 0.45 * totalStatus * Math.sqrt(item.fullSlot) + Math.sqrt(item.remodel));
      } else {
        // 夜間飛行機搭載補正 = B(0.3) × (火力 + 雷装 + 爆装 + 対潜) × √(搭載数) + √(★)
        power += (0.3 * totalStatus * Math.sqrt(item.fullSlot) + Math.sqrt(item.remodel));
      }
    }

    return power + contactBonus;
  }

  /**
   * 爆雷の装甲減少補正値を返却
   * @returns
   */
  public getAswArmorDeBuff(): number {
    const items = this.items.concat(this.exItem);
    // 爆雷と一部装備
    const targets = [226, 227, 377, 378, 439, 472, 488];
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

  /**
   * 装備をセットしなおした新しいShipクラスを返却
   * @param {Item} item セット対象の装備データ
   * @param {number} slot セット先のスロット番号 補強増設は定数でね
   * @param {{ id: number, level: number }[]} initialLevels 初期熟練度情報
   * @return {Ship} {Ship} 装備を更新した新しいShipインスタンス
   * @memberof Ship
   */
  public putItem(item: Item, slot: number, initialLevels: { id: number, level: number }[]) {
    // 新しい装備配列を生成
    const items = this.items.concat();
    let level = 0;
    if (initialLevels) {
      // 設定情報より初期熟練度を解決
      const initData = initialLevels.find((v) => v.id === item.data.apiTypeId);
      if (initData) {
        level = initData.level;
      }
    }

    if (slot < items.length) {
      if (item.data.apiTypeId === 41 && this.data.type2 === 90) {
        // 日進 & 大型飛行艇
        items[slot] = new Item({
          item: items[slot],
          master: item.data,
          remodel: item.remodel,
          level,
          slot: 1,
        });
      } else {
        // 装備を置き換え
        items[slot] = new Item({
          item: items[slot],
          master: item.data,
          remodel: item.remodel,
          level,
        });
      }
      // 装備を変更した艦娘インスタンス再生成
      return new Ship({ ship: this, items });
    } if (slot === Const.EXPAND_SLOT_INDEX) {
      // 補強増設を変更した艦娘インスタンス再生成
      const builder: ShipBuilder = { ship: this, exItem: new Item({ item: this.exItem, master: item.data, remodel: item.remodel }) };
      return new Ship(builder);
    }
    // 搭載失敗
    return this;
  }
}
