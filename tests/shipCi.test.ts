import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';
import Ship from '../src/classes/fleet/ship';

const MAX_LUCK = 200;

function bruteForceRequiredLuck(target: number, level: number): number {
  for (let luck = 0; luck <= MAX_LUCK; luck += 1) {
    if (Ship.getCIValue(level, luck) >= target) {
      return luck;
    }
  }
  return MAX_LUCK + 1;
}

describe('Ship CI term helpers', () => {
  it('必要運は現在のCI項計算式で目標値に到達する最小値を返す', () => {
    equal(Ship.getCIValue(99, 60), 75);
    equal(Ship.getRequiredLuckCI(76, 99), 66);
    equal(Ship.getCIValue(99, Ship.getRequiredLuckCI(76, 99)), 76);
  });

  it('必要運はCI項計算式との整合性を保つ', () => {
    for (let level = 1; level <= 188; level += 1) {
      for (let luck = 0; luck <= 120; luck += 1) {
        const target = Ship.getCIValue(level, luck) + 1;
        equal(
          Ship.getRequiredLuckCI(target, level),
          bruteForceRequiredLuck(target, level),
          `level=${level}, luck=${luck}, target=${target}`,
        );
      }
    }
  });
});
