import { deepEqual, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';
import { SHIP_TYPE } from '../src/classes/const';
import getSpecialAttackPartnerHintMasterIds, {
  DisplayHintTier,
  HintTier,
  getSpecialAttackWarningCompanionCounts,
  hasSatisfiedBattleshipSpecialAttack,
} from '../src/classes/fleet/fleetSpecialAttackPartnerHint';

const shipTypeByMasterId = new Map<number, number>([
  [151, SHIP_TYPE.BBB],
  [178, SHIP_TYPE.BB],
  [360, SHIP_TYPE.BB],
  [392, SHIP_TYPE.BB],
  [411, SHIP_TYPE.BBV],
  [412, SHIP_TYPE.BBV],
  [446, SHIP_TYPE.BB],
  [447, SHIP_TYPE.BB],
  [275, SHIP_TYPE.BB],
  [276, SHIP_TYPE.BB],
  [541, SHIP_TYPE.BB],
  [546, SHIP_TYPE.BB],
  [553, SHIP_TYPE.BBV],
  [554, SHIP_TYPE.BBV],
  [573, SHIP_TYPE.BB],
  [576, SHIP_TYPE.BB],
  [577, SHIP_TYPE.BB],
  [591, SHIP_TYPE.FBB],
  [592, SHIP_TYPE.FBB],
  [593, SHIP_TYPE.BBB],
  [659, SHIP_TYPE.BB],
  [694, SHIP_TYPE.FBB],
  [697, SHIP_TYPE.BB],
  [724, SHIP_TYPE.BB],
  [733, SHIP_TYPE.BB],
  [918, SHIP_TYPE.BB],
  [954, SHIP_TYPE.BBB],
  [969, SHIP_TYPE.BB],
  [1496, SHIP_TYPE.BB],
  [5001, SHIP_TYPE.AS],
  [5002, SHIP_TYPE.SS],
  [5003, SHIP_TYPE.SSV],
  [5004, SHIP_TYPE.SS],
]);

function getSortedEntries(map: Map<number, DisplayHintTier>): [number, HintTier][] {
  return [...map.entries()]
    .filter((entry): entry is [number, HintTier] => entry[1] > 0)
    .sort((a, b) => a[0] - b[0]);
}

describe('getSpecialAttackPartnerHintMasterIds', () => {
  it('随伴未配置なら旗艦枠ではヒントを返さない', () => {
    deepEqual(getSortedEntries(getSpecialAttackPartnerHintMasterIds(0, [0, 0, 0], shipTypeByMasterId)), []);
  });

  it('2番艦が武蔵なら旗艦枠で大和改二を候補表示する', () => {
    deepEqual(getSortedEntries(getSpecialAttackPartnerHintMasterIds(0, [0, 546, 0], shipTypeByMasterId)), [[911, 3], [916, 3]]);
  });

  it('2番艦がRichelieu級やIowa級なら旗艦枠で大和改二を中段階表示する', () => {
    deepEqual(getSortedEntries(getSpecialAttackPartnerHintMasterIds(0, [0, 392, 0], shipTypeByMasterId)), [[911, 1], [916, 1]]);
  });

  it('2番艦武蔵かつ3番艦長門改二なら旗艦枠で大和改二を候補表示する', () => {
    deepEqual(getSortedEntries(getSpecialAttackPartnerHintMasterIds(0, [0, 546, 541], shipTypeByMasterId)), [[911, 3], [916, 3]]);
  });

  it('2番艦金剛改二丙かつ3番艦比叡改二丙なら旗艦枠に即成立する候補をまとめて表示する', () => {
    deepEqual(getSortedEntries(getSpecialAttackPartnerHintMasterIds(0, [0, 591, 592], shipTypeByMasterId)), []);
  });

  it('大和旗艦で2番艦選択時に2隻タッチ候補を倍率別に表示する', () => {
    deepEqual(getSortedEntries(getSpecialAttackPartnerHintMasterIds(1, [911, 0, 0], shipTypeByMasterId)), [[178, 1], [360, 1], [392, 1], [546, 3], [724, 1], [969, 1]]);
  });

  it('大和旗艦で3番艦が長門改二なら2番艦候補に tier を載せる', () => {
    deepEqual(getSortedEntries(getSpecialAttackPartnerHintMasterIds(1, [911, 0, 541], shipTypeByMasterId)), [[178, 1], [360, 1], [392, 1], [546, 3], [573, 1], [724, 1], [969, 1]]);
  });

  it('大和旗艦で2番艦が武蔵なら3番艦に中段階候補を表示する', () => {
    deepEqual(getSortedEntries(getSpecialAttackPartnerHintMasterIds(2, [911, 546, 0], shipTypeByMasterId)), [[541, 2], [573, 2]]);
  });

  it('大和旗艦で3番艦が比叡改二丙なら2番艦候補に tier を載せる', () => {
    deepEqual(getSortedEntries(getSpecialAttackPartnerHintMasterIds(1, [911, 0, 592], shipTypeByMasterId)), [[178, 1], [360, 1], [392, 1], [546, 3], [724, 1], [969, 1]]);
  });

  it('長門改二旗艦で2番艦選択時は戦艦艦種の候補をまとめて表示する', () => {
    deepEqual(
      getSortedEntries(getSpecialAttackPartnerHintMasterIds(1, [541, 0, 0], shipTypeByMasterId)),
      [[276, 2], [573, 2], [576, 1]],
    );
  });

  it('2番艦が高速戦艦でも旗艦一覧で長門改二を候補表示する', () => {
    deepEqual(getSortedEntries(getSpecialAttackPartnerHintMasterIds(0, [0, 591, 0], shipTypeByMasterId)), []);
  });

  it('Colorado旗艦で3番艦が未配置なら2番艦候補はまだ出さない', () => {
    deepEqual(getSortedEntries(getSpecialAttackPartnerHintMasterIds(1, [918, 0, 0], shipTypeByMasterId)), []);
  });

  it('Colorado旗艦で2番艦が戦艦なら3番艦候補を出す', () => {
    equal(getSpecialAttackPartnerHintMasterIds(2, [918, 591, 0], shipTypeByMasterId).has(392), true);
    equal(getSpecialAttackPartnerHintMasterIds(2, [918, 591, 0], shipTypeByMasterId).get(392), 0);
  });

  it('潜水母艦タッチで2番3番が潜水艦なら旗艦候補を出す', () => {
    deepEqual(getSortedEntries(getSpecialAttackPartnerHintMasterIds(0, [0, 5002, 5003], shipTypeByMasterId)), []);
  });

  it('潜水母艦タッチで2番3番4番が潜水艦なら旗艦候補を出す', () => {
    deepEqual(getSortedEntries(getSpecialAttackPartnerHintMasterIds(0, [0, 5002, 5003, 5004], shipTypeByMasterId)), []);
  });

  it('潜水母艦タッチで3番艦が未配置なら2番艦候補はまだ出さない', () => {
    deepEqual(getSortedEntries(getSpecialAttackPartnerHintMasterIds(1, [5001, 0, 0], shipTypeByMasterId)), []);
  });

  it('潜水母艦タッチで2番3番が潜水艦なら4番艦候補を出す', () => {
    deepEqual(getSortedEntries(getSpecialAttackPartnerHintMasterIds(3, [5001, 5002, 5003, 0], shipTypeByMasterId)), []);
  });

  it('潜水母艦旗艦で潜水艦が後ろにいるだけなら配置警告を返す', () => {
    deepEqual(getSpecialAttackWarningCompanionCounts([5001, 151, 446, 0, 5002, 5003], shipTypeByMasterId), [2]);
  });

  it('潜水母艦旗艦で4番艦条件だけ未成立なら4隻配置警告を返す', () => {
    deepEqual(getSpecialAttackWarningCompanionCounts([5001, 5002, 5003, 151, 5004], shipTypeByMasterId), [3]);
  });

  it('戦艦特殊砲撃が成立していれば true を返す', () => {
    equal(hasSatisfiedBattleshipSpecialAttack([911, 546, 541, 0], shipTypeByMasterId), true);
  });

  it('潜水艦特殊砲撃は戦艦特殊砲撃に含めない', () => {
    equal(hasSatisfiedBattleshipSpecialAttack([5001, 5002, 5003, 0], shipTypeByMasterId), false);
  });

  it('3隻条件の相方が未配置なら先送り候補を出さない', () => {
    const result = getSpecialAttackPartnerHintMasterIds(2, [911, 0, 0], shipTypeByMasterId);
    equal(result.has(541), false);
    equal(result.has(573), false);
  });

  it('tier 0 の候補は map に残るが chevron 用一覧には出さない', () => {
    const result = getSpecialAttackPartnerHintMasterIds(1, [541, 0, 0], shipTypeByMasterId);
    equal(result.get(591), 0);
    equal(result.has(591), true);
    equal(getSortedEntries(result).some(([masterId]) => masterId === 591), false);
  });
});
