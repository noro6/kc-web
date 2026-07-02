import {
  SHIP_SLOT_EQUIP_RESTRICTIONS,
  ShipSlotEquipRestriction,
} from '../constants/ships';

type ShipSlotEquipRestrictionArgs = {
  shipId: number;
  slotNumber: number;
  itemApiTypeId: number;
  itemId: number;
  restrictions?: ShipSlotEquipRestriction[];
};

function isIncluded(values: number[] | undefined, value: number): boolean {
  return values?.includes(value) ?? false;
}

export default function isRestrictedByShipSlotEquipRule({
  shipId,
  slotNumber,
  itemApiTypeId,
  itemId,
  restrictions = SHIP_SLOT_EQUIP_RESTRICTIONS,
}: ShipSlotEquipRestrictionArgs): boolean {
  const matchedRules = restrictions.filter((rule) => (
    rule.shipIds.includes(shipId) && rule.slots.includes(slotNumber)
  ));

  return matchedRules.some((rule) => {
    if (isIncluded(rule.deny?.apiTypeIds, itemApiTypeId) || isIncluded(rule.deny?.itemIds, itemId)) {
      return true;
    }

    if (rule.allowOnly) {
      return !(
        isIncluded(rule.allowOnly.apiTypeIds, itemApiTypeId)
        || isIncluded(rule.allowOnly.itemIds, itemId)
      );
    }

    return false;
  });
}
