import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';
import isRestrictedByShipSlotEquipRule from '../src/classes/fleet/shipSlotEquipRestriction';

describe('ship slot equip restrictions', () => {
  it('伊勢改二/日向改二の3-5スロットは主砲系を禁止する', () => {
    equal(
      isRestrictedByShipSlotEquipRule({
        shipId: 553,
        slotNumber: 3,
        itemApiTypeId: 2,
        itemId: 1,
      }),
      true,
    );
    equal(
      isRestrictedByShipSlotEquipRule({
        shipId: 554,
        slotNumber: 5,
        itemApiTypeId: 3,
        itemId: 1,
      }),
      true,
    );
    equal(
      isRestrictedByShipSlotEquipRule({
        shipId: 553,
        slotNumber: 2,
        itemApiTypeId: 2,
        itemId: 1,
      }),
      false,
    );
  });

  it('夕張改二系の4/5スロット制限を艦ごとに判定する', () => {
    equal(
      isRestrictedByShipSlotEquipRule({
        shipId: 622,
        slotNumber: 4,
        itemApiTypeId: 5,
        itemId: 1,
      }),
      true,
    );
    equal(
      isRestrictedByShipSlotEquipRule({
        shipId: 623,
        slotNumber: 4,
        itemApiTypeId: 22,
        itemId: 1,
      }),
      true,
    );
    equal(
      isRestrictedByShipSlotEquipRule({
        shipId: 624,
        slotNumber: 4,
        itemApiTypeId: 22,
        itemId: 1,
      }),
      false,
    );
    equal(
      isRestrictedByShipSlotEquipRule({
        shipId: 622,
        slotNumber: 5,
        itemApiTypeId: 13,
        itemId: 1,
      }),
      true,
    );
  });

  it('能代/矢矧系の魚雷制限を判定する', () => {
    equal(
      isRestrictedByShipSlotEquipRule({
        shipId: 662,
        slotNumber: 4,
        itemApiTypeId: 22,
        itemId: 1,
      }),
      true,
    );
    equal(
      isRestrictedByShipSlotEquipRule({
        shipId: 668,
        slotNumber: 4,
        itemApiTypeId: 22,
        itemId: 1,
      }),
      false,
    );
    equal(
      isRestrictedByShipSlotEquipRule({
        shipId: 668,
        slotNumber: 4,
        itemApiTypeId: 5,
        itemId: 1,
      }),
      true,
    );
  });

  it('防空駆逐/改三系の4スロット制限を判定する', () => {
    equal(
      isRestrictedByShipSlotEquipRule({
        shipId: 963,
        slotNumber: 4,
        itemApiTypeId: 13,
        itemId: 1,
      }),
      true,
    );
    equal(
      isRestrictedByShipSlotEquipRule({
        shipId: 961,
        slotNumber: 4,
        itemApiTypeId: 13,
        itemId: 1,
      }),
      false,
    );
    equal(
      isRestrictedByShipSlotEquipRule({
        shipId: 1035,
        slotNumber: 4,
        itemApiTypeId: 1,
        itemId: 1,
      }),
      true,
    );
  });

  it('改二補シリーズの4スロットは機銃/戦闘糧食のみ許可する', () => {
    equal(
      isRestrictedByShipSlotEquipRule({
        shipId: 743,
        slotNumber: 4,
        itemApiTypeId: 21,
        itemId: 1,
      }),
      false,
    );
    equal(
      isRestrictedByShipSlotEquipRule({
        shipId: 744,
        slotNumber: 4,
        itemApiTypeId: 43,
        itemId: 1,
      }),
      false,
    );
    equal(
      isRestrictedByShipSlotEquipRule({
        shipId: 745,
        slotNumber: 4,
        itemApiTypeId: 1,
        itemId: 1,
      }),
      true,
    );
  });

  it('装備ID指定の制限も判定できる', () => {
    equal(
      isRestrictedByShipSlotEquipRule({
        shipId: 1,
        slotNumber: 1,
        itemApiTypeId: 99,
        itemId: 10,
        restrictions: [
          {
            shipIds: [1],
            slots: [1],
            deny: { itemIds: [10] },
            note: 'test',
          },
        ],
      }),
      true,
    );
  });
});
