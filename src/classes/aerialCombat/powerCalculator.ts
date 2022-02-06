import CommonCalc from '../commonCalc';
import Const, { SHIP_TYPE, CAP } from '../const';
import Enemy from '../enemy/enemy';
import Ship from '../fleet/ship';
import Item from '../item/item';

/**
 * 航空戦火力計算に必要な引数群
 * @export
 * @interface FirePowerCalcArgs
 */
export interface FirePowerCalcArgs {
  /** クリティカルかどうか */
  isCritical: boolean;
  /** クリティカル時補正 隊長機等による熟練度ボーナス */
  criticalBonus: number;
  /** 触接補正 */
  contactBonus: number;
  /** 陸上偵察機補正 */
  rikuteiBonus: number;
  /** 防御側が連合かどうか */
  isUnion: boolean;
  /** 連合艦隊補正 */
  unionBonus: number;
  /** その他特効補正 */
  specialBonus: number;
  /** キャップ前補正 */
  beforCapBonus: number;
  /** キャップ後補正 */
  afterCapBonus: number;
  /** 雷装ボーナス(装備フィットによる) */
  torpedoBonus: number;
}

export interface SlotDist {
  slot: number;
  rate: number;
}

export interface PowerDist {
  power: number;
  rate: number;
}

export default class AerialFirePowerCalculator {
  /**
   * 搭載数分布情報 他諸所引数により、火力分布を計算、返却 -基地
   * @static
   * @param {Item} item 攻撃機
   * @param {SlotDist[]} dist 搭載数分布
   * @param {(Ship | Enemy)} defense 防御側
   * @param {FirePowerCalcArgs} args 計算用引数群
   * @return {*}  {PowerDist[]}
   * @memberof AerialFirePowerCalculator
   */
  public static getAirbaseFirePowers(item: Item, dist: SlotDist[], defense: Ship | Enemy, args: FirePowerCalcArgs): PowerDist[] {
    // 防御側が潜水かどうか？
    const isSubmarine = defense.data.type === SHIP_TYPE.SS || defense.data.type === SHIP_TYPE.SSV;
    const resultPowers: PowerDist[] = [];
    for (let i = 0; i < dist.length; i += 1) {
      const { slot, rate } = dist[i];
      let powers = [];
      if (isSubmarine) {
        // 対潜
        powers = AerialFirePowerCalculator.getAirbaseASWPowerDist(item, slot, args, rate);
      } else {
        // 通常
        powers = AerialFirePowerCalculator.getAirbaseFirePower(item, slot, args, defense, rate);
      }

      // 同一の火力をまとめる
      for (let j = 0; j < powers.length; j += 1) {
        const { power } = powers[j];
        const data = resultPowers.find((v) => v.power === power);
        if (data) data.rate += powers[j].rate;
        else resultPowers.push(powers[j]);
      }
    }
    return resultPowers;
  }

  /**
   * 航空戦火力を返却 -基地航空隊
   * @private
   * @static
   * @param {Item} item 攻撃機
   * @param {number} slot 搭載数
   * @param {FirePowerCalcArgs} args 航空戦火力引数群
   * @param {(Ship | Enemy)} defense 防御側艦
   * @param {number} rate この搭載数の確率
   * @return {*}  {PowerDist[]}
   * @memberof AerialFirePowerCalculator
   */
  private static getAirbaseFirePower(item: Item, slot: number, args: FirePowerCalcArgs, defense: Ship | Enemy, rate: number): PowerDist[] {
    // キャップ後補正まとめ (二式陸偵補正 * 触接補正 * 対連合補正 * キャップ後特殊補正)
    const allAfterCapBonus = args.rikuteiBonus * args.contactBonus * args.unionBonus * args.afterCapBonus;

    if (slot <= 0) return [{ power: 0, rate }];

    const type = item.data.apiTypeId;
    const shipType = defense.data.type;
    let fire = 0;
    // ※種別倍率：艦攻・艦爆・水爆 = 1.0、陸攻 = 0.8、噴式機 = 0.7071 (≒1.0/√2) そのた0
    let adj = 0;
    // 搭載数補正
    let adj2 = 1.8;
    switch (type) {
      case 8:
        // 艦攻
        fire = item.actualTorpedo;
        adj = 1.0;
        break;
      case 7:
      case 11:
        // 艦爆 水爆
        fire = item.actualBomber;
        adj = 1.0;
        break;
      case 57:
        // 噴式機
        fire = item.actualBomber;
        adj = 0.7071;
        break;
      case 47:
        // 陸上攻撃機
        if (item.data.id === 224 && shipType === SHIP_TYPE.DD) {
          // 65戦隊 VS 駆逐の場合、雷装値25として計算
          fire = 25 + item.bonusTorpedo;
        } else if (item.data.id === 444) {
          // 四式重爆 飛龍+イ号一型甲 誘導弾 雷装1.15倍
          fire = item.data.torpedo * 1.15 + item.bonusTorpedo;
        } else if (item.data.id === 405 && shipType === SHIP_TYPE.DD) {
          // Do 217 E-5+Hs293 VS 駆逐の場合 雷装1.1倍
          fire = item.data.torpedo * 1.1 + item.bonusTorpedo;
        } else if (item.data.id === 406 && (SHIP_TYPE.BB === shipType || SHIP_TYPE.BBV === shipType || SHIP_TYPE.BBB === shipType)) {
          // Do 217 K-2 + Fritz-X VS 戦艦の場合 雷装1.1倍
          fire = item.data.torpedo * 1.1 + item.bonusTorpedo;
        } else {
          // 陸攻 上記以外
          fire = item.actualTorpedo;
        }
        adj = 0.8;
        break;
      case 53:
        // 大型陸上機
        fire = item.actualTorpedo;
        adj = 1.0;
        adj2 = 1.0;
        break;
      default:
        break;
    }

    // 雷装ボーナス適用
    fire *= args.torpedoBonus;
    // 基本攻撃力 = 種別倍率 × {(雷装 or 爆装) × √(搭載数補正 × 搭載数) + 25} * キャップ前ボーナス
    let p = Math.floor(adj * (fire * Math.sqrt(adj2 * slot) + 25) * args.beforCapBonus);

    // キャップ
    p = CommonCalc.softCap(p, CAP.AS);

    if (args.isCritical) {
      // クリティカル時
      p = Math.floor(p * 1.5 * args.criticalBonus);
    }

    // 陸攻補正
    const airBaseBonus = type === 47 ? 1.8 : 1;

    return [{ power: p * airBaseBonus * allAfterCapBonus, rate }];
  }

  /**
   * @param {number} slot
   * @param {FirePowerCalcArgs} args
   * @param {number=1} slot
   * @returns {{ power: number, rate: number }[]}
   * @memberof Item
   */

  /**
   * 航空戦対潜火力を返却 -基地航空隊
   * @static
   * @param {Item} item 攻撃機
   * @param {number} slot 搭載数
   * @param {FirePowerCalcArgs} args 引数群
   * @param {number} rate この搭載数の確率
   * @return {*}  {PowerDist[]}
   * @memberof AerialFirePowerCalculator
   */
  public static getAirbaseASWPowerDist(item: Item, slot: number, args: FirePowerCalcArgs, rate: number): PowerDist[] {
    if (item.data.asw < 7) return [{ power: 0, rate: 1 }];

    const powers: { power: number, rate: number }[] = [];

    // キャップ後補正まとめ (触接補正 * キャップ後特殊補正)
    const allAfterCapBonus = args.contactBonus * args.afterCapBonus;

    // 基本攻撃力 = {対潜 × √(1.8 × 搭載数) + 25} × {A + (0 ~ Bの乱数)}
    const base = slot > 0 ? item.data.asw * Math.sqrt(1.8 * slot) + 25 : 0;
    // A 対潜10以上で0.7 それ以外0.35
    const a = item.data.asw >= 10 ? 0.7 : 0.35;
    // B 対潜10以上で0.3、それ以外0.45
    const bMax = item.data.asw >= 10 ? 0.3 : 0.45;
    // 1事象あたりの確率
    const rateStep = 1 / (bMax * 100 + 1);
    // 0.01刻みの乱数と仮定する
    for (let b = 0; b <= bMax * 100; b += 1) {
      // 基本攻撃力 = {対潜 × √(1.8 × 搭載数) + 25} × {A + (0 ~ Bの乱数)}（再掲）
      let basePower = Math.floor(CommonCalc.softCap(base * (a + (b / 100)), CAP.AS));
      // クリティカル補正
      if (args.isCritical) basePower = Math.floor(basePower * 1.5 * args.criticalBonus);
      // 陸攻補正 * 触接補正付与
      let power = basePower * (item.data.apiTypeId === 47 ? 1.8 : 1) * allAfterCapBonus;
      // 水上偵察機攻撃力 0 補正
      if (Const.RECONNAISSANCES.includes(item.data.apiTypeId)) power = 1;
      // 火力とその確率を格納
      const p = powers.find((v) => v.power === power);
      if (p) p.rate += (rateStep * rate);
      else powers.push({ power, rate: rateStep * rate });
    }

    return powers;
  }

  /**
   * 搭載数分布情報 他諸所引数により、火力分布を計算、返却 -通常
   * @static
   * @param {Item} item 攻撃機
   * @param {SlotDist[]} dist 搭載数分布
   * @param {(Ship | Enemy)} defense 防御側
   * @param {FirePowerCalcArgs} args 計算用引数群
   * @return {*}  {PowerDist[]}
   * @memberof AerialFirePowerCalculator
   */
  public static getAerialFirePowers(item: Item, dist: SlotDist[], defense: Ship | Enemy, args: FirePowerCalcArgs): PowerDist[] {
    const resultPowers: PowerDist[] = [];
    for (let i = 0; i < dist.length; i += 1) {
      const { slot, rate } = dist[i];
      let powers = [];
      // 通常
      powers = AerialFirePowerCalculator.getAerialFirePower(item, slot, args, defense.isEscort, rate);

      // 同一の火力をまとめる
      for (let j = 0; j < powers.length; j += 1) {
        const { power } = powers[j];
        const data = resultPowers.find((v) => v.power === power);
        if (data) data.rate += powers[j].rate;
        else resultPowers.push(powers[j]);
      }
    }
    return resultPowers;
  }

  private static getAerialFirePower(item: Item, slot: number, args: FirePowerCalcArgs, isEscort: boolean, rate: number, isJetPhase = false): PowerDist[] {
    // キャップ後補正まとめ (二式陸偵補正 * 触接補正 * 対連合補正 * キャップ後特殊補正)
    const allAfterCapBonus = args.contactBonus * args.afterCapBonus;
    if (slot <= 0) return [{ power: 0, rate: 1 }];

    const type = item.data.apiTypeId;

    // 航空戦定数: 25
    let c = 25;
    // 対連合艦隊時補正(主力: -10, 随伴: -20)
    if (args.isUnion && isEscort) c -= 20;
    else if (args.isUnion) c -= 10;

    let fire = 0;
    switch (type) {
      case 8:
      case 47:
      case 53:
        // 艦攻 0.8倍と1.5倍あり 下で特殊処理アリ
        fire = item.actualTorpedo;
        break;
      case 7:
      case 11:
      case 57:
        // 艦爆 水爆 噴式機
        fire = item.actualBomber / (isJetPhase ? Math.SQRT2 : 1);
        break;
      default:
        break;
    }

    const loop = type === 8 ? 2 : 1;
    const retPowers = [];
    for (let i = 0; i < loop; i += 1) {
      // 雷装ボーナス適用
      fire *= args.torpedoBonus;

      // 基本攻撃力 = {(雷装 or 爆装) × √(搭載数) + 航空戦定数c} * キャップ前ボーナス
      let p = 0;
      if (type === 8 && i === 0) {
        // 艦攻 0.8倍
        p = Math.floor((fire * Math.sqrt(slot) + c) * 0.8 * args.beforCapBonus);
      } else if (type === 8) {
        // 艦攻 1.5倍
        p = Math.floor((fire * Math.sqrt(slot) + c) * 1.5 * args.beforCapBonus);
      } else {
        // それ以外 通常
        p = Math.floor((fire * Math.sqrt(slot) + c) * args.beforCapBonus);
      }

      // キャップ適用
      p = CommonCalc.softCap(p, CAP.AS);
      if (args.isCritical) {
        // クリティカル時
        p = Math.floor(p * 1.5 * args.criticalBonus);
      }

      // キャップ後補正を掛けて終わり
      retPowers.push({ power: p * allAfterCapBonus, rate: rate / loop });
    }
    return retPowers;
  }
}
