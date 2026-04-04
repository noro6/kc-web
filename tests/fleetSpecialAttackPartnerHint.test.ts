import { deepEqual, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';
import getSpecialAttackPartnerHintMasterIds from '../src/classes/fleet/fleetSpecialAttackPartnerHint';

describe('getSpecialAttackPartnerHintMasterIds', () => {
  it('随伴未配置なら旗艦枠ではヒントを返さない', () => {
    deepEqual(getSpecialAttackPartnerHintMasterIds(0, [0, 0, 0]), []);
  });

  it('2番艦が武蔵なら旗艦枠で大和改二を候補表示する', () => {
    deepEqual(getSpecialAttackPartnerHintMasterIds(0, [0, 546, 0]), [911, 916]);
  });

  it('2番艦武蔵かつ3番艦長門改二なら旗艦枠で大和改二を候補表示する', () => {
    deepEqual(getSpecialAttackPartnerHintMasterIds(0, [0, 546, 541]), [911, 916]);
  });

  it('2番艦金剛改二丙かつ3番艦比叡改二丙なら旗艦枠に即成立する候補をまとめて表示する', () => {
    deepEqual(getSpecialAttackPartnerHintMasterIds(0, [0, 591, 592]), [911, 916, 592, 593, 954, 694]);
  });

  it('大和旗艦で2番艦選択時に武蔵を候補表示する', () => {
    deepEqual(getSpecialAttackPartnerHintMasterIds(1, [911, 0, 0]), [546]);
  });

  it('大和旗艦で3番艦が長門改二なら2番艦に即成立する候補をまとめて表示する', () => {
    deepEqual(getSpecialAttackPartnerHintMasterIds(1, [911, 0, 541]), [546, 573]);
  });

  it('大和旗艦で2番艦が武蔵なら3番艦に長門改二と陸奥改二を候補表示する', () => {
    deepEqual(getSpecialAttackPartnerHintMasterIds(2, [911, 546, 0]), [541, 573]);
  });

  it('大和旗艦で3番艦が比叡改二丙なら2番艦に即成立する候補をまとめて表示する', () => {
    deepEqual(getSpecialAttackPartnerHintMasterIds(1, [911, 0, 592]), [546, 591, 694]);
  });

  it('3隻条件の相方が未配置なら先送り候補を出さない', () => {
    const result = getSpecialAttackPartnerHintMasterIds(2, [911, 0, 0]);
    equal(result.includes(541), false);
    equal(result.includes(573), false);
  });
});
