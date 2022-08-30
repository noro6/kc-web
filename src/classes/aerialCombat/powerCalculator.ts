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
  beforeCapBonus: number;
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
    const isLandBase = defense instanceof Enemy && defense.data.isLandBase;
    const resultPowers: PowerDist[] = [];
    for (let i = 0; i < dist.length; i += 1) {
      const { slot, rate } = dist[i];
      let powers = [];
      if (isSubmarine) {
        // 対潜
        powers = AerialFirePowerCalculator.getAirbaseASWPowerDist(item, slot, args, rate);
      } else if (isLandBase) {
        // 対地
        powers = AerialFirePowerCalculator.getAirbaseFirePowerLandBase(item, slot, args, defense, rate);
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
    let allAfterCapBonus = args.rikuteiBonus * args.contactBonus * args.unionBonus * args.afterCapBonus;
    args.beforeCapBonus = 1;

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
        } else if (item.data.id === 405 && shipType === SHIP_TYPE.DD) {
          // Do 217 E-5+Hs293 VS 駆逐の場合 雷装1.1倍
          fire = item.data.torpedo * 1.1 + item.bonusTorpedo;
        } else if (item.data.id === 406 && (SHIP_TYPE.BB === shipType || SHIP_TYPE.BBV === shipType || SHIP_TYPE.BBB === shipType)) {
          // Do 217 K-2 + Fritz-X VS 戦艦の場合 雷装1.1倍
          fire = item.data.torpedo * 1.1 + item.bonusTorpedo;
        } else if (item.data.id === 444 && !(shipType === SHIP_TYPE.AO || shipType === SHIP_TYPE.AO_2)) {
          // 四式重爆 飛龍+イ号一型甲 誘導弾 雷装1.15倍
          fire = item.data.torpedo * 1.15 + item.bonusTorpedo;
        } else if (item.data.id === 454 && (shipType === SHIP_TYPE.DD || shipType === SHIP_TYPE.CL || shipType === SHIP_TYPE.CA || shipType === SHIP_TYPE.CVL)) {
          // キ102乙改＋イ号一型乙 誘導弾 VS 駆逐 or 軽巡 or 重巡 or 軽空母 の場合 雷装1.16倍
          fire = item.data.torpedo * 1.16 + item.bonusTorpedo;
        } else if (item.data.id === 459) {
          // B-25
          fire = item.actualTorpedo;

          // B-25補正
          if (shipType === SHIP_TYPE.DD) {
            // 駆逐 1.9倍
            args.beforeCapBonus = 1.9;
          } else if (shipType === SHIP_TYPE.CL || shipType === SHIP_TYPE.CLT || shipType === SHIP_TYPE.CT) {
            // 軽巡級 1.75倍
            args.beforeCapBonus = 1.75;
          } else if (shipType === SHIP_TYPE.CA || shipType === SHIP_TYPE.CAV) {
            // 重巡級 1.6倍
            args.beforeCapBonus = 1.6;
          } else if (shipType === SHIP_TYPE.CVL) {
            // 軽空母 1.3倍
            args.beforeCapBonus = 1.3;
          } else if (shipType === SHIP_TYPE.FBB || shipType === SHIP_TYPE.BB || shipType === SHIP_TYPE.BBV || shipType === SHIP_TYPE.BBB) {
            // 戦艦級 1.3倍
            args.beforeCapBonus = 1.3;
          } else if (shipType === SHIP_TYPE.AO || shipType === SHIP_TYPE.AO_2) {
            // 補給艦 1.3倍
            args.beforeCapBonus = 1.3;
          }
        } else {
          // 陸攻 上記以外
          fire = item.actualTorpedo;
        }

        // 空母棲姫特効 3.2倍
        if (defense.data.id === 1586 || defense.data.id === 1620) {
          allAfterCapBonus *= 3.2;
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
    let p = Math.floor(adj * (fire * Math.sqrt(adj2 * slot) + 25) * args.beforeCapBonus);

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
   * 航空戦火力(対陸上)を返却 -基地航空隊
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
  private static getAirbaseFirePowerLandBase(item: Item, slot: number, args: FirePowerCalcArgs, defense: Ship | Enemy, rate: number): PowerDist[] {
    // キャップ後補正まとめ (二式陸偵補正 * 触接補正 * 対連合補正 * キャップ後特殊補正)
    const allAfterCapBonus = args.rikuteiBonus * args.contactBonus * args.unionBonus * args.afterCapBonus;

    if (slot <= 0) return [{ power: 0, rate }];

    const type = item.data.apiTypeId;
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
        fire = item.data.bomber;
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
    let p = adj * (fire * Math.sqrt(adj2 * slot) + 25) * args.beforeCapBonus;

    // 爆撃特効適用対象機体か 艦爆 水爆 陸攻 噴式
    const isBomber = [7, 11, 47, 53, 57].includes(item.data.apiTypeId);

    // 砲台 離島 集積地特効
    // [[基本攻撃力 × 基地航空特効(砲台・離島姫) × 爆撃特効(集積地) + 基地航空特効(集積地)] × 爆撃特効(砲台・離島姫)]
    // 基地航空特効(全ての機体)
    if ([1665, 1666, 1667].includes(defense.data.id)) {
      // 砲台小鬼 基地航空特効1.6 爆撃特効1.55
      p = Math.floor(Math.floor(CommonCalc.softCap(p * 1.6, CAP.AS)) * (isBomber ? 1.55 : 1));
    } else if ([1668, 1669, 1671, 1672].includes(defense.data.id)) {
      // 離島棲姫 基地航空特効1.18 爆撃特効1.7
      p = Math.floor(Math.floor(CommonCalc.softCap(p * 1.18, CAP.AS)) * (isBomber ? 1.7 : 1));
    } else if (defense.data.name.indexOf('集積地') >= 0) {
      // 集積地 基地航空特効 +100 爆撃特効 2.1
      p = Math.floor(CommonCalc.softCap(p, CAP.AS) * (isBomber ? 2.1 : 1) + 100);
    } else {
      p = CommonCalc.softCap(p, CAP.AS);
    }

    if (args.isCritical) {
      // クリティカル時
      p = Math.floor(p * 1.5 * args.criticalBonus);
    }

    // 陸攻補正
    const airBaseBonus = type === 47 ? 1.8 : 1;
    return [{ power: p * airBaseBonus * allAfterCapBonus, rate }];
  }

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

  /**
   * 火力分布計算
   * @private
   * @static
   * @param {Item} item
   * @param {number} slot
   * @param {FirePowerCalcArgs} args
   * @param {boolean} isEscort
   * @param {number} rate
   * @param {boolean} [isJetPhase=false]
   * @return {*}  {PowerDist[]}
   * @memberof AerialFirePowerCalculator
   */
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

    // 雷装ボーナス適用
    fire *= args.torpedoBonus;
    fire += item.attackerTorpedoBonus;

    const loop = type === 8 ? 2 : 1;
    const retPowers = [];
    for (let i = 0; i < loop; i += 1) {
      // 基本攻撃力 = {(雷装 or 爆装) × √(搭載数) + 航空戦定数c} * キャップ前ボーナス
      let p = 0;
      if (type === 8 && i === 0) {
        // 艦攻 0.8倍
        p = Math.floor((fire * Math.sqrt(slot) + c) * 0.8 * args.beforeCapBonus);
      } else if (type === 8) {
        // 艦攻 1.5倍
        p = Math.floor((fire * Math.sqrt(slot) + c) * 1.5 * args.beforeCapBonus);
      } else {
        // それ以外 通常
        p = Math.floor((fire * Math.sqrt(slot) + c) * args.beforeCapBonus);
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

  public static getAswSupportForePowers(asw: number, slot: number, isCritical: boolean): PowerDist[] {
    const powers: { power: number, rate: number }[] = [];

    // キャップ前攻撃力＝int(int(0.6 × 機体対潜値) × √(搭載数) + 3)
    const base = Math.floor(Math.floor(0.6 * Math.max(asw, 0)) * Math.sqrt(slot) + 3);
    // キャップ適用
    const p = CommonCalc.softCap(base, CAP.AS);
    // 変動倍率
    const bonusList = [
      { value: 1.2, rate: 0.4 },
      { value: 1.5, rate: 0.1 },
      { value: 2, rate: 0.5 },
    ];

    for (let i = 0; i < bonusList.length; i += 1) {
      const bonus = bonusList[i];
      // 最終攻撃力 ＝ キャップ後攻撃力 × 1.75 × 変動倍率 × クリティカル補正
      const power = p * 1.75 * bonus.value * (isCritical ? 1.5 : 1);
      powers.push({ power, rate: bonus.rate });
    }
    return powers;
  }
}
