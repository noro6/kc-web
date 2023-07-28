import { sum } from 'lodash';
import Item from './item';

export type AnalyticsResult = {
  label: string;
  color: string;
  score: number;
  details: { label: string, max: number, value: number, color: string }[]
  entries: Item[];
  disabledRemodel?: boolean;
}

export default class ItemAnalyzer {
  public static getAllResult(items: Item[]): AnalyticsResult[] {
    return [
      ItemAnalyzer.getAirRaidDefensePower(items),
      ItemAnalyzer.getFighterPower(items),
      ItemAnalyzer.getSupportGun(items),
      ItemAnalyzer.getTorpedo(items),
    ];
  }

  public static getAirRaidDefensePower(items: Item[]): AnalyticsResult {
    // 防空機上位12機を取得
    const defender = items.filter((v) => v.fullDefenseAirPower);
    const pickedItems = defender.sort((a, b) => b.fullDefenseAirPower - a.fullDefenseAirPower).slice(0, 12);

    const totalFullDefenseAirPower = sum(pickedItems.map((v) => v.fullDefenseAirPower)) ?? 0;

    // ロケット戦闘機数を取得
    const rocketCount = items.filter((v) => v.data.isRocket).length;

    const details = [
      {
        label: '制空値', max: 1300, value: totalFullDefenseAirPower, color: 'success',
      },
      {
        label: 'ロケット数', max: 3, value: rocketCount, color: 'light-green',
      },
    ];

    const scoreA = Math.min(1, totalFullDefenseAirPower / 1300);
    const scoreB = Math.min(1, rocketCount / 3);
    const score = 0.7 * scoreA + 0.3 * scoreB;

    return {
      label: '防空', color: 'success', score: Math.round(100 * score), entries: pickedItems, details,
    };
  }

  public static getSupportGun(items: Item[]): AnalyticsResult {
    // 大口径命中上位16基を取得
    const mainGuns = items.filter((v) => v.data.apiTypeId === 3);
    const pickedItems = mainGuns.sort((a, b) => {
      const valueA = a.data.accuracy * 3 + a.data.fire;
      const valueB = b.data.accuracy * 3 + b.data.fire;
      if (valueB !== valueA) return valueB - valueA;
      if (a.data.accuracy !== b.data.accuracy) return b.data.accuracy - a.data.accuracy;
      return b.data.fire - a.data.fire;
    }).slice(0, 16);

    // GFCS16本分
    const maxFire = 24 * 16;
    const maxAcc = 7 * 16;

    const scoreA = sum(pickedItems.map((v) => v.data.fire)) ?? 0;
    const scoreB = sum(pickedItems.map((v) => v.data.accuracy)) ?? 0;

    const details = [
      {
        label: '火力', max: maxFire, value: scoreA, color: 'error',
      },
      {
        label: '命中', max: maxAcc, value: scoreB, color: 'orange',
      },
    ];

    const score = 0.5 * (scoreA / maxFire) + 0.5 * (scoreB / maxAcc);

    return {
      label: '支援主砲', color: 'error', score: Math.round(100 * score), entries: pickedItems, details, disabledRemodel: true,
    };
  }

  public static getTorpedo(items: Item[]): AnalyticsResult {
    // 魚雷上位20個を取得
    const base = items.filter((v) => v.data.apiTypeId === 5);
    const pickedItems = base.sort((a, b) => {
      const valueA = a.nightBattleFirePower;
      const valueB = b.nightBattleFirePower;
      if (valueB !== valueA) return valueB - valueA;
      if (a.actualTorpedo !== b.actualTorpedo) return b.actualTorpedo - a.actualTorpedo;
      return b.actualFire - a.actualFire;
    }).slice(0, 20);

    // てきとう
    const max = 15 * 20;
    const scoreA = Math.floor(sum(pickedItems.map((v) => v.nightBattleFirePower)) ?? 0);

    const details = [
      {
        label: '雷装', max, value: scoreA, color: 'blue darken-1',
      },
    ];

    const score = Math.min(1, scoreA / max);

    return {
      label: '雷装', color: 'blue darken-1', score: Math.round(100 * score), entries: pickedItems, details,
    };
  }

  public static getFighterPower(items: Item[]): AnalyticsResult {
    // 戦闘機上位8機を取得
    const fighter = items.filter((v) => v.data.isFighter && v.data.apiTypeId !== 6 && v.data.apiTypeId !== 45);
    const pickedItems = fighter.sort((a, b) => {
      const valueA = a.fullAirPower + 8 * a.data.radius;
      const valueB = b.fullAirPower + 8 * b.data.radius;
      if (valueB !== valueA) return valueB - valueA;
      if (a.fullAirPower !== b.fullAirPower) return b.fullAirPower - a.fullAirPower;
      return b.data.radius - a.data.radius;
    }).slice(0, 8);

    const totalFullDefenseAirPower = sum(pickedItems.map((v) => v.fullDefenseAirPower)) ?? 0;
    const totalRadius = sum(pickedItems.map((v) => v.data.radius)) ?? 0;

    const details = [
      {
        label: '制空値', max: 750, value: totalFullDefenseAirPower, color: 'success',
      },
      {
        label: '半径', max: 45, value: totalRadius, color: 'yellow',
      },
    ];

    const scoreA = Math.min(1, totalFullDefenseAirPower / 750);
    const scoreB = Math.min(1, totalRadius / 45);
    const score = 0.5 * scoreA + 0.5 * scoreB;

    return {
      label: '基地制空', color: 'success', score: Math.round(100 * score), entries: pickedItems, details,
    };
  }

  public static getAntiLandBase(items: Item[]): AnalyticsResult {
    // 戦車、WG、大発系を取得
    const fighter = items.filter((v) => v.data.isFighter && v.data.apiTypeId !== 6 && v.data.apiTypeId !== 45);
    const pickedItems = fighter.sort((a, b) => {
      const valueA = a.fullAirPower + 8 * a.data.radius;
      const valueB = b.fullAirPower + 8 * b.data.radius;
      if (valueB !== valueA) return valueB - valueA;
      if (a.fullAirPower !== b.fullAirPower) return b.fullAirPower - a.fullAirPower;
      return b.data.radius - a.data.radius;
    }).slice(0, 20);

    const totalFullDefenseAirPower = sum(pickedItems.map((v) => v.fullDefenseAirPower)) ?? 0;
    const totalRadius = sum(pickedItems.map((v) => v.data.radius)) ?? 0;

    const details = [
      {
        label: '制空値', max: 750, value: totalFullDefenseAirPower, color: 'success',
      },
      {
        label: '半径', max: 45, value: totalRadius, color: 'yellow',
      },
    ];

    const scoreA = Math.min(1, totalFullDefenseAirPower / 750);
    const scoreB = Math.min(1, totalRadius / 45);
    const score = 0.5 * scoreA + 0.5 * scoreB;

    return {
      label: '基地制空', color: 'success', score: Math.round(100 * score), entries: pickedItems, details,
    };
  }
}
