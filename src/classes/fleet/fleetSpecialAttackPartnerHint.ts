import { SHIP_TYPE } from '@/classes/const';

/**
 * 旗艦が条件を満たしているとき、随伴枠で選ぶと特殊攻撃の組み合わせになり得る艦（装備一覧の装備ボーナス強調と同趣旨）。
 * api_mst_ship.api_id を列挙。ゲーム仕様変更時はここを更新する。
 *
 * タッチは「1番・2番・3番」に特定の艦がいれば発動し、例外的に潜水母艦タッチのみ 4番艦まで条件に含めてヒントする。
 * 空きスロットはマスタID 0（本サイトの空の艦娘）とみなす。
 *
 * ヒントは「いま選ぶ艦でタッチ編成が成立する」場合に限り出す（先送りの候補は出さない）。
 * 倍率差は UI 向けに 1-3 の段階へ丸め、同じ艦が複数ルールに該当した場合は最大段階を優先する。
 * `tier` が 0 のルールは「候補としては表示するが、chevron は出さない」扱い。
 */
export type HintTier = 1 | 2 | 3;
export type DisplayHintTier = HintTier | 0;
type OptionalHintTier = DisplayHintTier | undefined;

type MasterIdCondition = number | readonly number[];
type ShipTypeCondition = readonly number[];
type PairMasterIds = ReadonlyArray<readonly [number, number]>;
type PartnerMasterIds = readonly number[] | PairMasterIds;

type SpecialAttackPartnerRule = {
  flagshipMasterIds?: readonly number[];
  flagshipShipTypes?: ShipTypeCondition;
  partnerMasterIds?: PartnerMasterIds;
  partnerShipTypes?: ShipTypeCondition;
  secondShipMustBe?: MasterIdCondition;
  secondShipTypes?: ShipTypeCondition;
  thirdShipMustBe?: MasterIdCondition;
  thirdShipTypes?: ShipTypeCondition;
  fourthShipMustBe?: MasterIdCondition;
  fourthShipTypes?: ShipTypeCondition;
  tier?: HintTier | 0;
};

const BATTLESHIP_TYPES = [SHIP_TYPE.FBB, SHIP_TYPE.BB, SHIP_TYPE.BBV, SHIP_TYPE.BBB] as const;

const SPECIAL_ATTACK_PARTNER_RULES: readonly SpecialAttackPartnerRule[] = [
  {
    // 大和タッチ2隻（高倍率）
    flagshipMasterIds: [911, 916],
    partnerMasterIds: [546],
    tier: 3,
  },
  {
    // 大和タッチ2隻（低倍率）
    flagshipMasterIds: [911, 916],
    partnerMasterIds: [392, 969, 724, 360, 178],
    tier: 1,
  },
  {
    // 大和タッチ3隻（高倍率）
    flagshipMasterIds: [911, 916],
    secondShipMustBe: 546,
    thirdShipMustBe: [541, 573],
    tier: 2,
  },
  {
    // 大和タッチ3隻（随伴の順不同・中倍率）
    flagshipMasterIds: [911, 916],
    partnerMasterIds: [
      [541, 573], // 長門改二 + 陸奥改二
      [553, 554], // 伊勢改二 + 日向改二
    ],
    tier: 1,
  },
  {
    // 大和タッチ3隻（随伴の順不同・低倍率）
    flagshipMasterIds: [911, 916],
    partnerMasterIds: [
      [541, 573], // 長門改二 + 陸奥改二
      [553, 554], // 伊勢改二 + 日向改二
      [411, 412], // 扶桑改二 + 山城改二
      [591, 592], // 金剛改二丙 + 比叡改二丙
      [591, 593], // 金剛改二丙 + 榛名改二乙
      [591, 954], // 金剛改二丙 + 榛名改二丙
      [591, 694], // 金剛改二丙 + 霧島改二丙
      [592, 694], // 比叡改二丙 + 霧島改二丙
      [446, 447], // Italia + Roma改
      [364, 576], // Warspite改 + Nelson改
      [364, 733], // Warspite改 + Valliant改
      [576, 577], // Nelson改 + Rodney改
      [659, 697], // Washington改 + South Dakota改
      [392, 724], // Richelieu改 + Jean Bart改
      [969, 724], // Richelieu Deux + Jean Bart改
      [1496, 918], // Colorado改 + Maryland改
    ],
    tier: 0,
  },
  {
    // 武蔵タッチ
    flagshipMasterIds: [546],
    partnerMasterIds: [911, 916],
    tier: 3,
  },
  {
    // 長門タッチ（高倍率）
    flagshipMasterIds: [541],
    partnerMasterIds: [573, 276],
    tier: 2,
  },
  {
    // 長門タッチ（中倍率）
    flagshipMasterIds: [541],
    partnerMasterIds: [576],
    tier: 1,
  },
  {
    // 長門タッチ（低倍率）
    flagshipMasterIds: [541],
    partnerShipTypes: BATTLESHIP_TYPES,
    tier: 0,
  },
  {
    // 陸奥タッチ（高倍率）
    flagshipMasterIds: [573],
    partnerMasterIds: [541, 276],
    tier: 2,
  },
  {
    // 陸奥タッチ（中倍率）
    flagshipMasterIds: [573],
    partnerMasterIds: [576],
    tier: 1,
  },
  {
    // 陸奥タッチ（低倍率）
    flagshipMasterIds: [573],
    partnerShipTypes: BATTLESHIP_TYPES,
    tier: 0,
  },
  {
    // 金剛タッチ
    flagshipMasterIds: [591],
    partnerMasterIds: [592, 593, 151, 954, 694, 364, 733],
    tier: 0,
  },
  {
    // 比叡タッチ
    flagshipMasterIds: [592],
    partnerMasterIds: [591, 593, 954, 694, 152],
    tier: 0,
  },
  {
    // 榛名タッチ
    flagshipMasterIds: [593, 954],
    partnerMasterIds: [591, 592, 694],
    tier: 0,
  },
  {
    // 霧島タッチ
    flagshipMasterIds: [694],
    partnerMasterIds: [591, 592, 593, 954, 697],
    tier: 0,
  },
  {
    // Warspiteタッチ
    flagshipMasterIds: [364],
    partnerMasterIds: [733],
    tier: 0,
  },
  {
    // Valliantタッチ
    flagshipMasterIds: [733],
    partnerMasterIds: [364],
    tier: 0,
  },
  {
    // Richelieuタッチ
    flagshipMasterIds: [969, 392],
    partnerMasterIds: [724],
    tier: 0,
  },
  {
    // Jean Bartタッチ
    flagshipMasterIds: [724],
    partnerMasterIds: [969, 392],
    tier: 0,
  },
  {
    // Colorado / Maryland タッチ
    flagshipMasterIds: [1496, 601, 913, 918],
    secondShipTypes: BATTLESHIP_TYPES,
    thirdShipTypes: BATTLESHIP_TYPES,
    tier: 0,
  },
  {
    // 潜水母艦タッチ（三隻タッチ）
    flagshipShipTypes: [SHIP_TYPE.AS],
    secondShipTypes: [SHIP_TYPE.SS, SHIP_TYPE.SSV],
    thirdShipTypes: [SHIP_TYPE.SS, SHIP_TYPE.SSV],
    tier: 0,
  },
  {
    // 潜水母艦タッチ（四隻タッチ）
    flagshipShipTypes: [SHIP_TYPE.AS],
    secondShipTypes: [SHIP_TYPE.SS, SHIP_TYPE.SSV],
    thirdShipTypes: [SHIP_TYPE.SS, SHIP_TYPE.SSV],
    fourthShipTypes: [SHIP_TYPE.SS, SHIP_TYPE.SSV],
    tier: 0,
  },
];

function mergeHintTier(result: Map<number, DisplayHintTier>, masterIds: readonly number[], tier: OptionalHintTier): void {
  if (typeof tier === 'undefined') {
    return;
  }

  masterIds.forEach((masterId) => {
    if (masterId <= 0) {
      return;
    }

    const currentTier = result.get(masterId);
    if (typeof currentTier === 'undefined' || currentTier < tier) {
      result.set(masterId, tier);
    }
  });
}

function matchesCondition(masterId: number, condition: MasterIdCondition): boolean {
  if (Array.isArray(condition)) {
    return condition.includes(masterId);
  }

  return masterId === condition;
}

function addConditionIds(condition: MasterIdCondition, tier: OptionalHintTier, result: Map<number, DisplayHintTier>): void {
  const ids = Array.isArray(condition) ? condition : [condition];
  mergeHintTier(result, ids, tier);
}

function matchesShipType(masterId: number, shipTypes: ShipTypeCondition, shipTypeByMasterId: ReadonlyMap<number, number>): boolean {
  const shipType = shipTypeByMasterId.get(masterId);
  return typeof shipType === 'number' && shipTypes.includes(shipType);
}

function matchesRuleSlot(
  masterId: number,
  mustBe: MasterIdCondition | undefined,
  shipTypes: ShipTypeCondition | undefined,
  shipTypeByMasterId: ReadonlyMap<number, number>,
): boolean {
  return (!!mustBe && matchesCondition(masterId, mustBe))
    || (!!shipTypes && matchesShipType(masterId, shipTypes, shipTypeByMasterId));
}

function addShipTypeIds(
  shipTypes: ShipTypeCondition,
  shipTypeByMasterId: ReadonlyMap<number, number>,
  tier: OptionalHintTier,
  result: Map<number, DisplayHintTier>,
): void {
  const masterIds: number[] = [];
  shipTypeByMasterId.forEach((shipType, masterId) => {
    if (shipTypes.includes(shipType)) {
      masterIds.push(masterId);
    }
  });
  mergeHintTier(result, masterIds, tier);
}

function isPairMasterIds(partnerMasterIds?: PartnerMasterIds): partnerMasterIds is PairMasterIds {
  return !!partnerMasterIds && partnerMasterIds.length > 0 && Array.isArray(partnerMasterIds[0]);
}

function getRuleConditionalSlots(rule: SpecialAttackPartnerRule): {
  slotIndex: number;
  mustBe?: MasterIdCondition;
  shipTypes?: ShipTypeCondition;
}[] {
  return [
    {
      slotIndex: 1,
      mustBe: rule.secondShipMustBe,
      shipTypes: rule.secondShipTypes,
    },
    {
      slotIndex: 2,
      mustBe: rule.thirdShipMustBe,
      shipTypes: rule.thirdShipTypes,
    },
    {
      slotIndex: 3,
      mustBe: rule.fourthShipMustBe,
      shipTypes: rule.fourthShipTypes,
    },
  ].filter((slot) => slot.mustBe || slot.shipTypes);
}

function matchesPair(secondShipMasterId: number, thirdShipMasterId: number, pairMasterIds: PairMasterIds): boolean {
  return pairMasterIds.some(
    ([leftId, rightId]) => (leftId === secondShipMasterId && rightId === thirdShipMasterId) || (leftId === thirdShipMasterId && rightId === secondShipMasterId),
  );
}

function getRequiredCompanionCount(rule: SpecialAttackPartnerRule): number {
  if (rule.fourthShipMustBe || rule.fourthShipTypes) {
    return 3;
  }
  if (rule.secondShipMustBe || rule.secondShipTypes || rule.thirdShipMustBe || rule.thirdShipTypes || isPairMasterIds(rule.partnerMasterIds)) {
    return 2;
  }
  return 1;
}

function ruleMatchesFlagship(rule: SpecialAttackPartnerRule, flagshipMasterId: number, shipTypeByMasterId: ReadonlyMap<number, number>): boolean {
  return !!rule.flagshipMasterIds?.includes(flagshipMasterId)
    || (!!rule.flagshipShipTypes && matchesShipType(flagshipMasterId, rule.flagshipShipTypes, shipTypeByMasterId));
}

function ruleMatchesLeadingSlots(
  rule: SpecialAttackPartnerRule,
  secondShipMasterId: number,
  thirdShipMasterId: number,
  fourthShipMasterId: number,
  shipTypeByMasterId: ReadonlyMap<number, number>,
): boolean {
  const conditionalSlots = getRuleConditionalSlots(rule);
  if (conditionalSlots.length) {
    return conditionalSlots.every((slot) => {
      let masterId = fourthShipMasterId;
      if (slot.slotIndex === 1) {
        masterId = secondShipMasterId;
      } else if (slot.slotIndex === 2) {
        masterId = thirdShipMasterId;
      }
      return !!masterId && matchesRuleSlot(masterId, slot.mustBe, slot.shipTypes, shipTypeByMasterId);
    });
  }

  if (isPairMasterIds(rule.partnerMasterIds)) {
    return !!secondShipMasterId && !!thirdShipMasterId && matchesPair(secondShipMasterId, thirdShipMasterId, rule.partnerMasterIds);
  }

  if (rule.partnerMasterIds) {
    return !!secondShipMasterId && rule.partnerMasterIds.includes(secondShipMasterId);
  }

  if (rule.partnerShipTypes) {
    return !!secondShipMasterId && matchesShipType(secondShipMasterId, rule.partnerShipTypes, shipTypeByMasterId);
  }

  return false;
}

function canFillConditionalSlots(
  conditionalSlots: { slotIndex: number; mustBe?: MasterIdCondition; shipTypes?: ShipTypeCondition }[],
  escortMasterIds: readonly number[],
  shipTypeByMasterId: ReadonlyMap<number, number>,
  usedIndices: number[] = [],
): boolean {
  if (!conditionalSlots.length) {
    return true;
  }

  const [currentSlot, ...restSlots] = conditionalSlots;
  for (let i = 0; i < escortMasterIds.length; i += 1) {
    if (usedIndices.includes(i)) {
      continue;
    }
    if (!matchesRuleSlot(escortMasterIds[i], currentSlot.mustBe, currentSlot.shipTypes, shipTypeByMasterId)) {
      continue;
    }
    if (canFillConditionalSlots(restSlots, escortMasterIds, shipTypeByMasterId, usedIndices.concat(i))) {
      return true;
    }
  }

  return false;
}

function ruleCanBeSatisfiedByFleet(
  rule: SpecialAttackPartnerRule,
  escortMasterIds: readonly number[],
  shipTypeByMasterId: ReadonlyMap<number, number>,
): boolean {
  const conditionalSlots = getRuleConditionalSlots(rule);
  if (conditionalSlots.length) {
    return canFillConditionalSlots(conditionalSlots, escortMasterIds, shipTypeByMasterId);
  }

  if (isPairMasterIds(rule.partnerMasterIds)) {
    return rule.partnerMasterIds.some(([leftId, rightId]) => escortMasterIds.includes(leftId) && escortMasterIds.includes(rightId));
  }

  if (rule.partnerMasterIds) {
    const { partnerMasterIds } = rule;
    return escortMasterIds.some((masterId) => partnerMasterIds.includes(masterId));
  }

  if (rule.partnerShipTypes) {
    return escortMasterIds.some((masterId) => matchesShipType(masterId, rule.partnerShipTypes as ShipTypeCondition, shipTypeByMasterId));
  }

  return false;
}

export function getSpecialAttackWarningCompanionCounts(
  fleetMasterIds: readonly number[],
  shipTypeByMasterId: ReadonlyMap<number, number>,
): number[] {
  const flagshipMasterId = fleetMasterIds[0] ?? 0;
  if (!flagshipMasterId) {
    return [];
  }

  const secondShipMasterId = fleetMasterIds[1] ?? 0;
  const thirdShipMasterId = fleetMasterIds[2] ?? 0;
  const fourthShipMasterId = fleetMasterIds[3] ?? 0;
  const escortMasterIds = fleetMasterIds.slice(1).filter((masterId) => masterId > 0);
  const warningCounts = new Set<number>();

  SPECIAL_ATTACK_PARTNER_RULES.forEach((rule) => {
    if (!ruleMatchesFlagship(rule, flagshipMasterId, shipTypeByMasterId)) {
      return;
    }
    if (ruleMatchesLeadingSlots(rule, secondShipMasterId, thirdShipMasterId, fourthShipMasterId, shipTypeByMasterId)) {
      return;
    }
    if (!ruleCanBeSatisfiedByFleet(rule, escortMasterIds, shipTypeByMasterId)) {
      return;
    }
    warningCounts.add(getRequiredCompanionCount(rule));
  });

  return [...warningCounts].sort((a, b) => a - b);
}

export function hasSatisfiedBattleshipSpecialAttack(
  fleetMasterIds: readonly number[],
  shipTypeByMasterId: ReadonlyMap<number, number>,
): boolean {
  const flagshipMasterId = fleetMasterIds[0] ?? 0;
  if (!flagshipMasterId) {
    return false;
  }

  const secondShipMasterId = fleetMasterIds[1] ?? 0;
  const thirdShipMasterId = fleetMasterIds[2] ?? 0;
  const fourthShipMasterId = fleetMasterIds[3] ?? 0;

  return SPECIAL_ATTACK_PARTNER_RULES.some((rule) => {
    if (rule.flagshipShipTypes?.includes(SHIP_TYPE.AS)) {
      return false;
    }
    if (!ruleMatchesFlagship(rule, flagshipMasterId, shipTypeByMasterId)) {
      return false;
    }
    return ruleMatchesLeadingSlots(rule, secondShipMasterId, thirdShipMasterId, fourthShipMasterId, shipTypeByMasterId);
  });
}

function getSpecialAttackPartnerHintMasterIds(
  targetSlotIndex: number,
  fleetMasterIds: readonly number[],
  shipTypeByMasterId: ReadonlyMap<number, number>,
): Map<number, DisplayHintTier> {
  if (targetSlotIndex < 0 || targetSlotIndex > 3) {
    return new Map();
  }

  const normalizedFleetMasterIds = fleetMasterIds.slice(0, 4);
  normalizedFleetMasterIds[targetSlotIndex] = 0;

  const flagshipMasterId = normalizedFleetMasterIds[0] ?? 0;
  const secondShipMasterId = normalizedFleetMasterIds[1] ?? 0;
  const thirdShipMasterId = normalizedFleetMasterIds[2] ?? 0;
  const fourthShipMasterId = normalizedFleetMasterIds[3] ?? 0;
  if (targetSlotIndex !== 0 && !flagshipMasterId) {
    return new Map();
  }

  const result = new Map<number, DisplayHintTier>();
  SPECIAL_ATTACK_PARTNER_RULES.forEach((rule) => {
    const flagshipMatched = !!rule.flagshipMasterIds?.includes(flagshipMasterId)
      || (!!rule.flagshipShipTypes && matchesShipType(flagshipMasterId, rule.flagshipShipTypes, shipTypeByMasterId));

    if (rule.secondShipMustBe || rule.secondShipTypes || rule.thirdShipMustBe || rule.thirdShipTypes || rule.fourthShipMustBe || rule.fourthShipTypes) {
      const conditionalSlots = [
        {
          slotIndex: 1,
          masterId: secondShipMasterId,
          mustBe: rule.secondShipMustBe,
          shipTypes: rule.secondShipTypes,
        },
        {
          slotIndex: 2,
          masterId: thirdShipMasterId,
          mustBe: rule.thirdShipMustBe,
          shipTypes: rule.thirdShipTypes,
        },
        {
          slotIndex: 3,
          masterId: fourthShipMasterId,
          mustBe: rule.fourthShipMustBe,
          shipTypes: rule.fourthShipTypes,
        },
      ].filter((slot) => slot.mustBe || slot.shipTypes);

      if (targetSlotIndex === 0) {
        const allCompanionsMatched = conditionalSlots.every((slot) => slot.masterId && matchesRuleSlot(slot.masterId, slot.mustBe, slot.shipTypes, shipTypeByMasterId));
        if (allCompanionsMatched) {
          if (rule.flagshipShipTypes) {
            addShipTypeIds(rule.flagshipShipTypes, shipTypeByMasterId, rule.tier, result);
          } else if (rule.flagshipMasterIds) {
            mergeHintTier(result, rule.flagshipMasterIds, rule.tier);
          }
        }
      } else {
        if (!flagshipMatched) {
          return;
        }

        const targetSlot = conditionalSlots.find((slot) => slot.slotIndex === targetSlotIndex);
        if (!targetSlot) {
          return;
        }

        const fixedSlotsMatched = conditionalSlots
          .filter((slot) => slot.slotIndex !== targetSlotIndex)
          .every((slot) => slot.masterId && matchesRuleSlot(slot.masterId, slot.mustBe, slot.shipTypes, shipTypeByMasterId));
        if (!fixedSlotsMatched) {
          return;
        }

        if (targetSlot.mustBe) {
          addConditionIds(targetSlot.mustBe, rule.tier, result);
        } else if (targetSlot.shipTypes) {
          addShipTypeIds(targetSlot.shipTypes, shipTypeByMasterId, rule.tier, result);
        }
      }
      return;
    }

    if (isPairMasterIds(rule.partnerMasterIds)) {
      if (targetSlotIndex === 0) {
        if (!secondShipMasterId || !thirdShipMasterId || !matchesPair(secondShipMasterId, thirdShipMasterId, rule.partnerMasterIds)) {
          return;
        }

        if (rule.flagshipShipTypes) {
          addShipTypeIds(rule.flagshipShipTypes, shipTypeByMasterId, rule.tier, result);
        } else if (rule.flagshipMasterIds) {
          mergeHintTier(result, rule.flagshipMasterIds, rule.tier);
        }
      } else {
        if (!flagshipMatched) {
          return;
        }

        const fixedPartnerId = targetSlotIndex === 1 ? thirdShipMasterId : secondShipMasterId;
        if (!fixedPartnerId) {
          return;
        }

        const partnerMasterIds = rule.partnerMasterIds.reduce<number[]>((acc, [leftId, rightId]) => {
          if (leftId === fixedPartnerId) {
            acc.push(rightId);
          }
          if (rightId === fixedPartnerId) {
            acc.push(leftId);
          }
          return acc;
        }, []);
        mergeHintTier(result, partnerMasterIds, rule.tier);
      }
      return;
    }

    if (rule.partnerMasterIds) {
      if (targetSlotIndex === 0) {
        if (secondShipMasterId && rule.partnerMasterIds.includes(secondShipMasterId)) {
          if (rule.flagshipShipTypes) {
            addShipTypeIds(rule.flagshipShipTypes, shipTypeByMasterId, rule.tier, result);
          } else if (rule.flagshipMasterIds) {
            mergeHintTier(result, rule.flagshipMasterIds, rule.tier);
          }
        }
      } else if (targetSlotIndex === 1) {
        if (!flagshipMatched) {
          return;
        }

        mergeHintTier(result, rule.partnerMasterIds, rule.tier);
      }
      return;
    }

    if (rule.partnerShipTypes) {
      if (targetSlotIndex === 0) {
        if (secondShipMasterId && matchesShipType(secondShipMasterId, rule.partnerShipTypes, shipTypeByMasterId)) {
          if (rule.flagshipShipTypes) {
            addShipTypeIds(rule.flagshipShipTypes, shipTypeByMasterId, rule.tier, result);
          } else if (rule.flagshipMasterIds) {
            mergeHintTier(result, rule.flagshipMasterIds, rule.tier);
          }
        }
      } else if (targetSlotIndex === 1) {
        if (!flagshipMatched) {
          return;
        }

        addShipTypeIds(rule.partnerShipTypes, shipTypeByMasterId, rule.tier, result);
      }
    }
  });

  return result;
}

export default getSpecialAttackPartnerHintMasterIds;
