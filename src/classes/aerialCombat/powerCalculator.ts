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
  /** 装備 */
  item: Item,
  /** 搭載数 */
  slot: number,
  /** 防御側艦船 */
  defense: Ship | Enemy,
  /** 防御側が連合かどうか */
  isUnion: boolean;
  /** 基地計算式かどうか */
  isAirbaseMode: boolean;
  /** クリティカルかどうか */
  isCritical: boolean;
  /** クリティカル時補正 隊長機等による熟練度ボーナス */
  criticalBonus: number;
  /** 触接補正 */
  contactBonus: number;
  /** 陸上偵察機補正 */
  rikuteiBonus: number;
  /** 連合艦隊補正 */
  unionBonus: number;
  /** 手動キャップ後補正(いわゆる特効) */
  manualAfterCapBonus: number;
  /** 装備倍率(艦攻系の0.8倍, 1.5倍のアレ) */
  multipliers: number[];
}

export interface SlotDist {
  slot: number;
  rate: number;
}

export interface PowerDist {
  power: number;
  rate: number;
}

export interface PreCapTerm {
  /** 艦載機補正値 */
  airstrikeModifiers: number;
  /** 艦載機補正値 */
  typeMultiplier: number;
  /** 実計算雷装値 */
  actualTorpedo: number;
  /** キャップ前攻撃力 */
  preCapFirePower: number;
  /** キャップ前補正 */
  B25Modifiers: number;
  /** 雷装補正(誘導弾による) */
  torpedoMultiplier: number;
  /** 基本攻撃力 */
  baseFirePower: number;
  /** 砲台・離島基地航空隊特効 */
  LBASModifiers: number;
  /** 地上施設が防御側である計算かどうか */
  isLandBase: boolean;
}

export interface PostCapTerm {
  /** キャップ後火力 */
  postCapFirePower: number;
  /** 最終攻撃力 */
  finalFirePower: number;
  /** 陸攻特効 */
  airbaseAttackerMultiplier: number;
  /** 空母棲姫特効 */
  aircraftCarrierPrincessMultiplier: number;
  /** 基地航空隊補正 */
  LBASModifiers: number;
  /** 爆撃補正 */
  bomberMultiplier: number;
  /** 対潜計算かどうか */
  isSubmarine: boolean;
}

export default class AerialFirePowerCalculator {
  /**
   * 搭載数分布情報 他諸所引数により、火力分布を計算、返却 -基地
   * @static
   * @param {FirePowerCalcArgs} args 計算用引数群
   * @param {SlotDist[]} dist 搭載数分布
   * @return {*}  {PowerDist[]}
   * @memberof AerialFirePowerCalculator
   */
  public static getAirbaseFirePowers(args: FirePowerCalcArgs, dist: SlotDist[]): PowerDist[] {
    // 防御側が潜水かどうか？
    const isSubmarine = args.defense.data.type === SHIP_TYPE.SS || args.defense.data.type === SHIP_TYPE.SSV;
    const resultPowers: PowerDist[] = [];
    for (let i = 0; i < dist.length; i += 1) {
      const { slot, rate } = dist[i];
      let powers = [];
      args.slot = slot;

      if (isSubmarine) {
        // 対潜
        powers = AerialFirePowerCalculator.getAirbaseASWPowerDist(args, rate);
      } else {
        // 対潜以外
        powers = AerialFirePowerCalculator.getAirbaseFirePower(args, rate);
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
   * 火力分布計算
   * @private
   * @static
   * @param {FirePowerCalcArgs} args
   * @param {number} rate
   * @return {*}  {PowerDist[]}
   * @memberof AerialFirePowerCalculator
   */
  private static getAerialFirePower(args: FirePowerCalcArgs, rate: number): PowerDist[] {
    if (args.slot <= 0) return [{ power: 0, rate: 1 }];
    args.isAirbaseMode = false;
    const preCapTerms = AerialFirePowerCalculator.getPreCapTerms(args);
    const retPowers = [];
    for (let i = 0; i < preCapTerms.length; i += 1) {
      const power = AerialFirePowerCalculator.getPostCapAttackPower(args, preCapTerms[i].preCapFirePower).finalFirePower;
      retPowers.push({ power, rate: rate / preCapTerms.length });
    }
    return retPowers;
  }

  /**
   * 航空戦 キャップ前攻撃力やその周辺の補正値を返却
   * @static
   * @param {FirePowerCalcArgs} args
   * @return {*}  {PreCapTerm[]}
   * @memberof AerialFirePowerCalculator
   */
  public static getPreCapTerms(args: FirePowerCalcArgs): PreCapTerm[] {
    const { item, defense, isAirbaseMode } = args;
    // ※種別倍率
    const typeMultipliers = [0];

    // 航空戦定数 基本は25だが…？
    let airstrikeModifiers = 25;
    // 実利用雷装(爆装)値
    let actualTorpedo = 0;
    // 搭載数補正
    let adj = isAirbaseMode ? 1.8 : 1;
    // B-25前補正
    let B25Modifiers = 1;
    // 誘導弾雷装補正
    let torpedoMultiplier = 1;
    // 防御側が地上施設かどうか
    const isLandBase = defense.data.speed === 0;
    const shipType = args.defense.data.type;

    // カテゴリに応じていろいろ
    switch (item.data.apiTypeId) {
      case 8:
        // 艦攻
        actualTorpedo = item.actualTorpedo;
        typeMultipliers[0] = 1;
        if (!isAirbaseMode) {
          typeMultipliers[0] = 0.8;
          typeMultipliers.push(1.5);
        }
        break;
      case 7:
      case 11:
        // 艦爆 水爆
        actualTorpedo = item.actualBomber;
        typeMultipliers[0] = 1;
        break;
      case 57:
        // 噴式機
        actualTorpedo = item.actualBomber;
        typeMultipliers[0] = 0.7071;
        break;
      case 47:
        // 陸上攻撃機
        typeMultipliers[0] = 0.8;

        if (isLandBase) {
          // 対陸上型 => 爆装値で計算
          actualTorpedo = item.actualBomber;
        } else if (item.data.id === 224 && shipType === SHIP_TYPE.DD) {
          // 65戦隊 VS 駆逐の場合、雷装値25として計算
          actualTorpedo = 25 + item.bonusTorpedo;
        } else if (item.data.id === 405 && shipType === SHIP_TYPE.DD) {
          // Do 217 E-5+Hs293 VS 駆逐の場合 雷装1.1倍
          torpedoMultiplier = 1.1;
          actualTorpedo = item.data.torpedo * torpedoMultiplier + item.bonusTorpedo;
        } else if (item.data.id === 406 && (SHIP_TYPE.BB === shipType || SHIP_TYPE.BBV === shipType || SHIP_TYPE.BBB === shipType)) {
          // Do 217 K-2 + Fritz-X VS 戦艦の場合 雷装1.35倍
          torpedoMultiplier = 1.35;
          actualTorpedo = item.data.torpedo * torpedoMultiplier + item.bonusTorpedo;
        } else if ((item.data.id === 444 || item.data.id === 484) && !(shipType === SHIP_TYPE.AO || shipType === SHIP_TYPE.AO_2)) {
          // 四式重爆 飛龍+イ号一型甲 誘導弾 雷装1.15倍
          torpedoMultiplier = 1.15;
          actualTorpedo = item.data.torpedo * torpedoMultiplier + item.bonusTorpedo;
        } else if (item.data.id === 454 && (shipType === SHIP_TYPE.DD || shipType === SHIP_TYPE.CL || shipType === SHIP_TYPE.CA || shipType === SHIP_TYPE.CVL)) {
          // キ102乙改＋イ号一型乙 誘導弾 VS 駆逐 or 軽巡 or 重巡 or 軽空母 の場合 雷装1.16倍
          torpedoMultiplier = 1.16;
          actualTorpedo = item.data.torpedo * torpedoMultiplier + item.bonusTorpedo;
        } else if (item.data.id === 459) {
          // B-25
          actualTorpedo = item.actualTorpedo;

          // B-25補正
          if (shipType === SHIP_TYPE.DD) {
            // 駆逐 1.9倍
            B25Modifiers = 1.9;
          } else if (shipType === SHIP_TYPE.CL || shipType === SHIP_TYPE.CLT || shipType === SHIP_TYPE.CT) {
            // 軽巡級 1.75倍
            B25Modifiers = 1.75;
          } else if (shipType === SHIP_TYPE.CA || shipType === SHIP_TYPE.CAV) {
            // 重巡級 1.6倍
            B25Modifiers = 1.6;
          } else if (shipType === SHIP_TYPE.CVL) {
            // 軽空母 1.3倍
            B25Modifiers = 1.3;
          } else if (shipType === SHIP_TYPE.FBB || shipType === SHIP_TYPE.BB || shipType === SHIP_TYPE.BBV || shipType === SHIP_TYPE.BBB) {
            // 戦艦級 1.3倍
            B25Modifiers = 1.3;
          } else if (shipType === SHIP_TYPE.AO || shipType === SHIP_TYPE.AO_2) {
            // 補給艦 1.3倍
            B25Modifiers = 1.3;
          }
        } else {
          // 陸攻 上記以外
          actualTorpedo = item.actualTorpedo;
        }
        break;
      case 53:
        // 大型陸上機
        actualTorpedo = isLandBase ? item.actualBomber : item.actualTorpedo;
        typeMultipliers[0] = 1;
        adj = 1.0;
        break;
      default:
        break;
    }

    let LBASModifiers = 1;
    if (isAirbaseMode && [1665, 1666, 1667].includes(defense.data.id)) {
      // 砲台小鬼 基地航空特効1.6
      LBASModifiers = 1.6;
    } else if (isAirbaseMode && [1668, 1669, 1671, 1672].includes(defense.data.id)) {
      // 離島棲姫 基地航空特効1.18
      LBASModifiers = 1.18;
    }

    if (!isAirbaseMode) {
      // 航空戦雷装ボーナス適用
      actualTorpedo += item.attackerTorpedoBonus;

      if (item.data.isTorpedoAttacker) {
        // 熟練甲板要員ボーナス(雷装)適用
        actualTorpedo += item.crewTorpedoBonus;
      } else if (item.data.isAttacker) {
        // 熟練甲板要員ボーナス(爆装)適用
        actualTorpedo += item.crewBomberBonus;
      }

      // 連合艦隊の場合航空戦定数に補正
      // 対連合艦隊時補正(主力: -10, 随伴: -20)
      if (args.isUnion && defense.isEscort) airstrikeModifiers -= 20;
      else if (args.isUnion) airstrikeModifiers -= 10;
    }

    const terms = [];

    for (let i = 0; i < typeMultipliers.length; i += 1) {
      // 基本攻撃力 = 種別倍率 × {(雷装 or 爆装) × √(搭載数補正 × 搭載数) + 航空戦定数}
      const baseFirePower = typeMultipliers[i] * (actualTorpedo * Math.sqrt(adj * args.slot) + airstrikeModifiers);
      // キャップ前攻撃力 = 基本攻撃力 * B-25補正 * 基地航空隊補正(離島・砲台)
      const preCapFirePower = baseFirePower * B25Modifiers * LBASModifiers;

      terms.push({
        airstrikeModifiers,
        baseFirePower,
        preCapFirePower,
        actualTorpedo,
        typeMultiplier: typeMultipliers[i],
        B25Modifiers,
        torpedoMultiplier,
        isLandBase,
        LBASModifiers,
      });
    }
    return terms;
  }

  /**
   * 基地航空隊 キャップ後攻撃力やその周辺の補正値を返却
   * @static
   * @param {FirePowerCalcArgs} args
   * @param {number} power
   * @return {*}  {PostCapTerm}
   * @memberof AerialFirePowerCalculator
   */
  public static getPostCapAttackPower(args: FirePowerCalcArgs, power: number): PostCapTerm {
    const { item, isAirbaseMode, defense } = args;
    // 陸偵補正
    const preCapFirePower = power * args.rikuteiBonus;
    // キャップ適用
    const postCapFirePower = CommonCalc.softCap(preCapFirePower, CAP.AS);

    let finalFirePower = postCapFirePower;
    let LBASModifiers = 0;
    let bomberMultiplier = 1;

    if (isAirbaseMode) {
      // 爆撃特効適用対象機体か 艦爆 水爆 陸攻 噴式
      const isBomber = [7, 11, 47, 53, 57].includes(item.data.apiTypeId);
      if (isBomber && [1665, 1666, 1667].includes(defense.data.id)) {
        // 砲台小鬼 爆撃特効1.55
        bomberMultiplier = 1.55;
        finalFirePower = Math.floor(finalFirePower * bomberMultiplier);
      } else if (isBomber && [1668, 1669, 1671, 1672].includes(defense.data.id)) {
        // 離島棲姫 爆撃特効1.7
        bomberMultiplier = 1.7;
        finalFirePower = Math.floor(finalFirePower * bomberMultiplier);
      } else if (defense.data.name.indexOf('集積地') >= 0) {
        // 集積地姫 爆撃特効2.1 基地航空特効 +100
        bomberMultiplier = isBomber ? 2.1 : 1;
        LBASModifiers = 100;
        // a5 b5補正のため計算しなおし
        finalFirePower = CommonCalc.softCap(preCapFirePower, CAP.AS, bomberMultiplier, LBASModifiers);
      } else {
        finalFirePower = Math.floor(finalFirePower * bomberMultiplier);
      }
    }

    if (args.isCritical) {
      // クリティカル時
      finalFirePower = Math.floor(finalFirePower * 1.5 * args.criticalBonus);
    }

    // 陸攻補正
    const airBaseBonus = item.data.apiTypeId === 47 ? 1.8 : 1;
    // 空母棲姫特効
    let aircraftCarrierPrincessMultiplier = 1;
    if (item.data.isABAttacker && (defense.data.id === 1586 || defense.data.id === 1620)) {
      aircraftCarrierPrincessMultiplier = 3.2;
    }

    if (isAirbaseMode) {
      // 基地キャップ後処理
      // 触接補正 * 対連合補正 * キャップ後特殊補正
      const multiplier = args.contactBonus * args.unionBonus * args.manualAfterCapBonus;
      finalFirePower = finalFirePower * airBaseBonus * aircraftCarrierPrincessMultiplier * multiplier;
    } else {
      // 通常航空戦キャップ後処理
      // 触接補正 * キャップ後特殊補正
      finalFirePower = finalFirePower * args.contactBonus * args.manualAfterCapBonus;
    }

    return {
      airbaseAttackerMultiplier: airBaseBonus,
      aircraftCarrierPrincessMultiplier,
      bomberMultiplier,
      finalFirePower,
      LBASModifiers,
      postCapFirePower,
      isSubmarine: false,
    };
  }

  /**
   * 航空戦火力を返却 -基地航空隊
   * @private
   * @static
   * @param {FirePowerCalcArgs} args 航空戦火力引数群
   * @param {number} rate この搭載数の確率
   * @return {*}  {PowerDist[]}
   * @memberof AerialFirePowerCalculator
   */
  private static getAirbaseFirePower(args: FirePowerCalcArgs, rate: number): PowerDist[] {
    if (args.slot <= 0) return [{ power: 0, rate }];

    args.isAirbaseMode = true;
    const terms = AerialFirePowerCalculator.getPreCapTerms(args);
    // キャップ前攻撃力
    const power = terms[0].preCapFirePower;
    // 最終攻撃力
    const finalPower = AerialFirePowerCalculator.getPostCapAttackPower(args, power).finalFirePower;
    return [{ power: finalPower, rate }];
  }

  /**
   * 基地航空隊 -対潜 キャップ前攻撃力やその周辺の補正値を返却
   * さしあたり、補正の最大と最小の場合を返却する。基本攻撃力は同一(種別係数をかける前)
   * @static
   * @param {Item} item
   * @param {number} slot
   * @param {(Ship | Enemy)} defense
   * @return {*}  {PreCapTerm}
   * @memberof AerialFirePowerCalculator
   */
  public static getAirbasePreCapAswAttackPowers(args: FirePowerCalcArgs): PreCapTerm[] {
    const { slot, item } = args;
    // 航空戦定数 25
    const airstrikeModifiers = 25;
    // 基本攻撃力 = {対潜 × √(1.8 × 搭載数) + 航空戦定数}
    const baseFirePower = (slot > 0 && item.data.asw >= 7) ? item.data.asw * Math.sqrt(1.8 * slot) + airstrikeModifiers : 0;
    // A 対潜10以上で0.7 それ以外0.35
    const a = item.data.asw >= 10 ? 0.7 : 0.35;
    // B 対潜10以上で0.3、それ以外0.45
    const b = item.data.asw >= 10 ? 0.3 : 0.45;

    // 基本攻撃力 = {対潜 × √(1.8 × 搭載数) + 25} × {A + (0 ~ Bの乱数)}
    const terms: PreCapTerm[] = [];
    // 最小の場合 = {対潜 × √(1.8 × 搭載数) + 25} × {A + 0}
    const minTypeMultiplier = a;
    terms.push({
      airstrikeModifiers,
      baseFirePower,
      preCapFirePower: baseFirePower * minTypeMultiplier,
      actualTorpedo: item.data.asw,
      typeMultiplier: minTypeMultiplier,
      B25Modifiers: 1,
      torpedoMultiplier: 1,
      LBASModifiers: 1,
      isLandBase: false,
    });

    // 最大の場合 = {対潜 × √(1.8 × 搭載数) + 25} × {A + (0 ~ B)}
    const typeMultiplier = a + b;
    terms.push({
      airstrikeModifiers,
      baseFirePower,
      preCapFirePower: baseFirePower * typeMultiplier,
      actualTorpedo: item.data.asw,
      typeMultiplier,
      B25Modifiers: 1,
      torpedoMultiplier: 1,
      LBASModifiers: 1,
      isLandBase: false,
    });

    return terms;
  }

  /**
   * 基地航空隊 -対潜 キャップ後攻撃力やその周辺の補正値を返却
   * @static
   * @param {Item} item
   * @param {number} baseFirePower
   * @param {number} typeMultiplier A+B
   * @param {FirePowerCalcArgs} args
   * @return {*}  {PostCapTerm}
   * @memberof AerialFirePowerCalculator
   */
  public static getAirbasePostCapAswAttackPower(args: FirePowerCalcArgs, baseFirePower: number, typeMultiplier: number): PostCapTerm {
    // 基本攻撃力 = {対潜 × √(1.8 × 搭載数) + 25} × {A + (0 ~ Bの乱数)}（再掲）
    const preCapFirePower = baseFirePower * typeMultiplier * args.rikuteiBonus;
    const postCapFirePower = CommonCalc.softCap(preCapFirePower, CAP.AS);

    let finalFirePower = postCapFirePower;
    // クリティカル補正
    if (args.isCritical) {
      finalFirePower = Math.floor(finalFirePower * 1.5 * args.criticalBonus);
    }
    // 陸攻補正
    let airbaseAttackerMultiplier = 1;
    if (args.item.data.apiTypeId === 47) {
      airbaseAttackerMultiplier = 1.8;
    }
    // 触接 特効を付与
    finalFirePower = finalFirePower * airbaseAttackerMultiplier * args.contactBonus * args.manualAfterCapBonus;

    // 水上偵察機攻撃力 0 補正
    if (Const.RECONNAISSANCES.includes(args.item.data.apiTypeId)) {
      finalFirePower = 1;
    }

    return {
      airbaseAttackerMultiplier,
      aircraftCarrierPrincessMultiplier: 1,
      bomberMultiplier: 1,
      finalFirePower,
      LBASModifiers: 0,
      postCapFirePower,
      isSubmarine: true,
    };
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
  public static getAirbaseASWPowerDist(args: FirePowerCalcArgs, rate: number): PowerDist[] {
    if (args.item.data.asw < 7) return [{ power: 0, rate: 1 }];

    const powers: { power: number, rate: number }[] = [];
    const preCapTerms = AerialFirePowerCalculator.getAirbasePreCapAswAttackPowers(args);
    // 補正最小
    const a = preCapTerms[0].typeMultiplier;
    // 補正最大
    const bMax = preCapTerms[1].typeMultiplier - preCapTerms[0].typeMultiplier;
    // 基本火力(種別補正を乗算する前)
    const { baseFirePower } = preCapTerms[0];

    // 1事象あたりの確率
    const rateStep = 1 / (bMax * 100 + 1);
    // 0.01刻みの乱数と仮定する
    for (let b = 0; b <= bMax * 100; b += 1) {
      // 最終攻撃力を取得
      const { finalFirePower } = AerialFirePowerCalculator.getAirbasePostCapAswAttackPower(args, baseFirePower, (a + b / 100));
      // 火力とその確率を格納
      const p = powers.find((v) => v.power === finalFirePower);
      if (p) p.rate += (rateStep * rate);
      else powers.push({ power: finalFirePower, rate: rateStep * rate });
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
  public static getAerialFirePowers(args: FirePowerCalcArgs, dist: SlotDist[]): PowerDist[] {
    const resultPowers: PowerDist[] = [];
    for (let i = 0; i < dist.length; i += 1) {
      const { slot, rate } = dist[i];
      let powers = [];
      // 通常
      args.slot = slot;
      powers = AerialFirePowerCalculator.getAerialFirePower(args, rate);

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
   *
   *
   * @static
   * @param {number} asw
   * @param {number} slot
   * @param {boolean} isCritical
   * @return {*}  {PowerDist[]}
   * @memberof AerialFirePowerCalculator
   */
  public static getAswSupportFirePowers(asw: number, slot: number, isCritical: boolean): PowerDist[] {
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

  /**
   * 航空支援火力計算
   * @static
   * @param {Item} item 装備
   * @param {number} slot 搭載
   * @param {FirePowerCalcArgs} args
   * @param {boolean} isEscort
   * @param {number} rate
   * @param {boolean} [isJetPhase=false]
   * @return {*}  {PowerDist[]}
   * @memberof AerialFirePowerCalculator
   */
  public static getAirstrikeSupportPower(item: Item, slot: number, args: FirePowerCalcArgs, isEscort: boolean, rate: number, isJetPhase = false): PowerDist[] {
    if (slot <= 0) return [{ power: 0, rate: 1 }];
    let fire = 0;

    if (item.data.isTorpedoAttacker) {
      // 雷撃機 => 改修なし素装備値 0.8倍と1.5倍あり 下で特殊処理アリ
      fire = item.data.torpedo;
    } else if (item.data.isAttacker) {
      // 艦爆 水爆 噴式機 改修なし素装備値
      fire = item.data.bomber / (isJetPhase ? Math.SQRT2 : 1);
    }

    // 雷装ボーナス適用 => 不明。0で
    fire += 0 * item.attackerTorpedoBonus;
    fire += 0 * item.crewTorpedoBonus;

    const retPowers = [];
    for (let i = 0; i < args.multipliers.length; i += 1) {
      // 基本攻撃力 = {(雷装 or 爆装) × √(搭載数) + 支援航空戦定数(+3)}
      let p = Math.floor((fire * Math.sqrt(slot) + 3) * args.multipliers[i]);
      // キャップ適用
      p = CommonCalc.softCap(p, CAP.AS);
      if (args.isCritical) {
        // クリティカル時
        p = Math.floor(p * 1.5 * args.criticalBonus);
      }

      // 支援補正1.35を掛けて終わり
      retPowers.push({ power: p * 1.35, rate: rate / args.multipliers.length });
    }
    return retPowers;
  }

  /**
   * 空母夜間航空攻撃の基本火力を返却
   * @static
   * @param {Ship} ship
   * @param {number} [contactBonus=0] 夜偵
   * @return {*}  {number}
   * @memberof AerialFirePowerCalculator
   */
  public static getAircraftNightAttackPrePower(ship: Ship, contactBonus = 0): number {
    // 艦娘の素火力 + 熟練甲板ボーナス(火力青字 + 爆装青地)
    let power = ship.data.fire + ship.nightAttackCrewFireBonus + ship.nightAttackCrewBomberBonus;
    if (ship.itemBonusStatus.torpedo) {
      // 雷装ボーナス
      power += ship.itemBonusStatus.torpedo;
    }

    for (let i = 0; i < ship.items.length; i += 1) {
      const item = ship.items[i];
      if (!item.data.isNightAircraftItem) {
        // 夜間機以外は飛ばし
        continue;
      }

      // +（夜間飛行機の火力 + 雷装 + 爆装）
      power += (item.data.fire + (item.data.isTorpedoAttacker ? item.data.torpedo : item.data.bomber));
      const totalStatus = item.data.fire + item.data.torpedo + item.data.bomber + item.data.asw;
      if (item.data.iconTypeId === 45 || item.data.iconTypeId === 46) {
        // 夜間飛行機搭載補正 = A(3.0) × 搭載数 + B(0.45) × (火力 + 雷装 + 爆装 + 対潜) × √(搭載数) + √(★)
        power += (3 * item.fullSlot + 0.45 * totalStatus * Math.sqrt(item.fullSlot) + Math.sqrt(item.remodel));
      } else {
        // 夜間飛行機搭載補正 = B(0.3) × (火力 + 雷装 + 爆装 + 対潜) × √(搭載数) + √(★)
        power += (0.3 * totalStatus * Math.sqrt(item.fullSlot) + Math.sqrt(item.remodel));
      }
    }

    return power + contactBonus;
  }
}
