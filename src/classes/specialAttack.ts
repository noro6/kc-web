import { sum } from 'lodash';
import { SHIP_TYPE } from './const';
import Enemy from './enemy/enemy';
import Ship from './fleet/ship';

export default class SpecialAttack {
  /**
     * 夜間特殊攻撃発動率を返却
     * @static
     * @param {(Ship | Enemy)} parent
     * @param {boolean} isFlagship
     * @return {*}  {{ text: string, rate: number[], multiplier?: number }[]}
     * @memberof SpecialAttack
     */
  public static getNightBattleSpecialAttackRate(parent: Ship | Enemy, isFlagship: boolean): { text: string, rate: number[], multiplier?: number }[] {
    const items = parent.items.concat(parent.exItem);
    const specialAttacks: { text: string, value: number, multiplier?: number }[] = [];

    const mainGunCount = items.filter((v) => [1, 2, 3].includes(v.data.apiTypeId)).length;
    const subGunCount = items.filter((v) => v.data.apiTypeId === 4).length;
    const torpCount = items.filter((v) => v.data.apiTypeId === 5 || v.data.apiTypeId === 32).length;
    const hasSkilledPersonnel = items.some((v) => v.data.id === 412);
    const hasPersonnel = items.some((v) => v.data.id === 129);

    if (parent.data.type === SHIP_TYPE.DD) {
      // 駆逐カットイン判定
      if (mainGunCount && torpCount && parent.surfaceRadarCount) {
        specialAttacks.push({ text: '主魚電CI', value: 115 });
      }
      if (torpCount && parent.surfaceRadarCount && (hasSkilledPersonnel || hasPersonnel)) {
        specialAttacks.push({ text: '魚見電CI', value: 140 });
      }
      if (torpCount >= 2 && hasSkilledPersonnel) {
        specialAttacks.push({ text: '魚水魚CI', value: 124 });
      }
      if (torpCount && hasSkilledPersonnel && items.some((v) => v.data.id === 75)) {
        specialAttacks.push({ text: '魚ド水CI', value: 122 });
      }
    }

    if (parent.data.type === SHIP_TYPE.SS || parent.data.type === SHIP_TYPE.SSV) {
      // 潜水カットイン判定
      const lateModelTorpCount = items.filter((v) => v.data.isLateModelTorpedo).length;
      if (lateModelTorpCount && items.some((v) => v.data.apiTypeId === 51)) {
        specialAttacks.push({ text: '潜電魚CI', value: 105 });
      } else if (lateModelTorpCount >= 2) {
        specialAttacks.push({ text: '潜魚雷CI', value: 110 });
      }
    }

    // 汎用CI判定
    if (mainGunCount >= 3) {
      specialAttacks.push({ text: '主主主CI', value: 140 });
    } else if (mainGunCount >= 2 && subGunCount) {
      specialAttacks.push({ text: '主主副CI', value: 130 });
    } else if (torpCount >= 2) {
      if (parent.data.type === SHIP_TYPE.SS || parent.data.type === SHIP_TYPE.SSV) {
        if (!specialAttacks.length) {
          specialAttacks.push({ text: '魚雷CI', value: 122 });
        }
      } else {
        specialAttacks.push({ text: '魚雷CI', value: 122 });
      }
    } else if (mainGunCount && torpCount) {
      specialAttacks.push({ text: '砲雷CI', value: 115 });
    }

    // 連撃
    if (!specialAttacks.length && (mainGunCount + subGunCount) >= 2 && !parent.enabledAircraftNightAttack) {
      specialAttacks.push({ text: '連撃', value: 0 });
    }

    // 空母夜戦判定
    if (parent.enabledAircraftNightAttack) {
      const nightFighterCount = items.filter((v) => v.data.iconTypeId === 45 && v.fullSlot).length;
      const nightAttackerCount = items.filter((v) => v.data.iconTypeId === 46 && v.fullSlot).length;
      const nightSuiseiCount = items.filter((v) => v.data.id === 320 && v.fullSlot).length;
      const nightPlaneCount = nightFighterCount + nightAttackerCount + nightSuiseiCount + items.filter((v) => [154, 242, 243, 244, 1582, 1618].includes(v.data.id) && v.fullSlot).length;
      if (nightFighterCount >= 2 && nightAttackerCount) {
        specialAttacks.push({ text: '夜襲CIA', value: 105, multiplier: 1.25 });
      }
      if (nightFighterCount && nightAttackerCount) {
        specialAttacks.push({ text: '夜襲CIB', value: 120, multiplier: 1.20 });
      }
      if (nightFighterCount && nightSuiseiCount) {
        specialAttacks.push({ text: '光電管彗星CI', value: 120, multiplier: 1.20 });
      } else if (nightAttackerCount && nightSuiseiCount) {
        specialAttacks.push({ text: '光電管彗星CI', value: 120, multiplier: 1.20 });
      }
      if (nightFighterCount && nightPlaneCount >= 3) {
        if (nightFighterCount !== 2 || nightAttackerCount !== 1) {
          specialAttacks.push({ text: '夜襲CIC', value: 130, multiplier: 1.18 });
        }
      }
    }

    // 旗艦補正 +15
    const flagshipCorr = isFlagship ? 15 : 0;
    // 損傷補正 あるなら +18
    const damageCorr = 0;
    // const damageCorr = 18;
    // 味方探照灯補正 +7
    const lightCorr = 7;
    // 味方照明弾補正 +4
    const starShellCorr = 4;
    // 見張員補正
    let personnelCorr = hasPersonnel ? 5 : 0;
    if (hasSkilledPersonnel && (parent.data.type === SHIP_TYPE.DD || parent.data.type === SHIP_TYPE.CL || parent.data.type === SHIP_TYPE.CLT)) {
      // 水雷見張員補正 => 駆逐 & 軽巡級 +7
      personnelCorr += 7;
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
      if (parent.luck >= 50) {
        chip = Math.floor(65 + Math.floor(Math.sqrt(parent.luck - 50)) + 0.8 * Math.sqrt(parent.level));
      } else {
        chip = Math.floor(15 + parent.luck + 0.75 * Math.sqrt(parent.level));
      }
      chip += (flagshipCorr + personnelCorr + damageCorr);
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

      results.push({ text: attack.text, rate, multiplier: attack.multiplier });
    }

    return results;
  }

  /**
   * 昼戦特殊攻撃発動率を返却
   * @param {number} fleetRosCorr
   * @param {boolean} isFlagship
   * @return {*}  {{ text: string, rate: number[] }[]}
   * @memberof Ship
   */
  public static getDayBattleSpecialAttackRate(parent: Ship | Enemy, fleetRosCorr: number, isFlagship: boolean): { text: string, rate: number[] }[] {
    const items = parent.items.concat(parent.exItem);
    const specialAttacks: { text: string, value: number }[] = [];

    // 弾着観測射撃判定
    if (items.some((v) => v.fullSlot && (v.data.apiTypeId === 10 || v.data.apiTypeId === 11))) {
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
    if (parent.items.some((v) => v.fullSlot && v.data.apiTypeId === 8) && parent.data.speed !== 0) {
      // 艦攻は必須
      const bomberCount = items.filter((v) => v.fullSlot && v.data.apiTypeId === 7).length;
      // FBA => 艦攻 + 艦爆 + 艦戦
      if (parent.items.some((v) => v.fullSlot && v.data.apiTypeId === 6) && bomberCount) {
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
      Math.floor(Math.floor(Math.sqrt(parent.luck) + 10) + 0.7 * (fleetRosCorr + 1.6 * sumItemScout) + 10) + flagshipCorr,
      Math.floor(Math.floor(Math.sqrt(parent.luck) + 10) + 0.6 * (fleetRosCorr + 1.2 * sumItemScout)) + flagshipCorr,
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
}
