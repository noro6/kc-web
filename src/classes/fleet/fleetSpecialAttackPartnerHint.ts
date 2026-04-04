/**
 * 旗艦が条件を満たしているとき、随伴枠で選ぶと特殊攻撃の組み合わせになり得る艦（装備一覧の装備ボーナス強調と同趣旨）。
 * api_mst_ship.api_id を列挙。ゲーム仕様変更時はここを更新する。
 *
 * タッチは「1番・2番・（三隻タッチなら）3番」に特定の艦がいれば発動し、4番艦以降は発動条件に含めない前提でヒントする。
 * 空きスロットはマスタID 0（本サイトの空の艦娘）とみなす。
 *
 * ヒントは「いま選ぶ艦でタッチ編成が成立する」場合に限り出す（先送りの候補は出さない）。
 */
type MasterIdCondition = number | readonly number[];
type PairMasterIds = ReadonlyArray<readonly [number, number]>;
type PartnerMasterIds = readonly number[] | PairMasterIds;

type SpecialAttackPartnerRule = {
  flagshipMasterIds: readonly number[];
  partnerMasterIds?: PartnerMasterIds;
  secondShipMustBe?: MasterIdCondition;
  thirdShipMustBe?: MasterIdCondition;
};

const SPECIAL_ATTACK_PARTNER_RULES: readonly SpecialAttackPartnerRule[] = [
  {
    // 大和タッチ2隻
    flagshipMasterIds: [911, 916],
    partnerMasterIds: [546, 392, 969, 724, 360, 178],
  },
  {
    // 大和タッチ3隻
    flagshipMasterIds: [911, 916],
    secondShipMustBe: 546,
    thirdShipMustBe: [541, 573],
  },
  {
    // 大和タッチ3隻（随伴の順不同）
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
      [1496, 918], // Colorado改 + Maryland改
      [392, 724], // Richelieu改 + Jean Bart改
      [969, 724], // Richelieu Deux + Jean Bart改
    ],
  },
  {
    // 武蔵タッチ
    flagshipMasterIds: [546],
    partnerMasterIds: [911, 916],
  },
  {
    // 長門タッチ
    flagshipMasterIds: [541],
    partnerMasterIds: [573],
  },
  {
    // 陸奥タッチ
    flagshipMasterIds: [573],
    partnerMasterIds: [541],
  },
  {
    // 金剛タッチ
    flagshipMasterIds: [591],
    partnerMasterIds: [592, 593, 151, 954, 694, 364, 733],
  },
  {
    // 比叡タッチ
    flagshipMasterIds: [592],
    partnerMasterIds: [591, 593, 954, 694, 152],
  },
  {
    // 榛名タッチ
    flagshipMasterIds: [593, 954],
    partnerMasterIds: [591, 592, 694],
  },
  {
    // 霧島タッチ
    flagshipMasterIds: [694],
    partnerMasterIds: [591, 592, 593, 954, 697],
  },
  {
    // Warspiteタッチ
    flagshipMasterIds: [364],
    partnerMasterIds: [733],
  },
  {
    // Valliantタッチ
    flagshipMasterIds: [733],
    partnerMasterIds: [364],
  },
  {
    // Richelieuタッチ
    flagshipMasterIds: [969, 392],
    partnerMasterIds: [724],
  },
  {
    // Jean Bartタッチ
    flagshipMasterIds: [724],
    partnerMasterIds: [969, 392],
  },
];

/**
 * 艦娘選択UIで、置くと特殊攻撃の組み合わせになり得るマスターID一覧を返す。
 * @param targetSlotIndex - 編集中のスロット（0 が旗艦、1 以降が随伴）。
 * @param fleetMasterIds - 同一艦隊の各スロットのマスターID。空枠は 0。
 * @returns 強調表示候補となるマスターIDの配列（重複なし）。
 */
function matchesCondition(masterId: number, condition: MasterIdCondition): boolean {
  if (Array.isArray(condition)) {
    return condition.includes(masterId);
  }

  return masterId === condition;
}

function addConditionIds(condition: MasterIdCondition, result: Set<number>): void {
  const ids = Array.isArray(condition) ? condition : [condition];
  ids.forEach((id) => {
    if (id > 0) {
      result.add(id);
    }
  });
}

function isPairMasterIds(partnerMasterIds?: PartnerMasterIds): partnerMasterIds is PairMasterIds {
  return !!partnerMasterIds && partnerMasterIds.length > 0 && Array.isArray(partnerMasterIds[0]);
}

function getSpecialAttackPartnerHintMasterIds(targetSlotIndex: number, fleetMasterIds: readonly number[]): number[] {
  if (targetSlotIndex < 0 || targetSlotIndex > 2) {
    return [];
  }

  const normalizedFleetMasterIds = fleetMasterIds.slice(0, 3);
  normalizedFleetMasterIds[targetSlotIndex] = 0;

  const flagshipMasterId = normalizedFleetMasterIds[0] ?? 0;
  const secondShipMasterId = normalizedFleetMasterIds[1] ?? 0;
  const thirdShipMasterId = normalizedFleetMasterIds[2] ?? 0;
  if (targetSlotIndex !== 0 && !flagshipMasterId) {
    return [];
  }

  const result = new Set<number>();
  SPECIAL_ATTACK_PARTNER_RULES.forEach((rule) => {
    if (rule.secondShipMustBe && rule.thirdShipMustBe) {
      if (targetSlotIndex === 0) {
        if (secondShipMasterId && thirdShipMasterId && matchesCondition(secondShipMasterId, rule.secondShipMustBe) && matchesCondition(thirdShipMasterId, rule.thirdShipMustBe)) {
          rule.flagshipMasterIds.forEach((id) => result.add(id));
        }
      } else {
        if (!rule.flagshipMasterIds.includes(flagshipMasterId)) {
          return;
        }

        if (targetSlotIndex === 1 && thirdShipMasterId && matchesCondition(thirdShipMasterId, rule.thirdShipMustBe)) {
          addConditionIds(rule.secondShipMustBe, result);
        } else if (targetSlotIndex === 2 && secondShipMasterId && matchesCondition(secondShipMasterId, rule.secondShipMustBe)) {
          addConditionIds(rule.thirdShipMustBe, result);
        }
      }

      return;
    }

    if (isPairMasterIds(rule.partnerMasterIds)) {
      if (targetSlotIndex === 0) {
        if (!secondShipMasterId || !thirdShipMasterId) {
          return;
        }

        const isMatched = rule.partnerMasterIds.some(
          ([leftId, rightId]) => (leftId === secondShipMasterId && rightId === thirdShipMasterId) || (leftId === thirdShipMasterId && rightId === secondShipMasterId),
        );
        if (isMatched) {
          rule.flagshipMasterIds.forEach((id) => result.add(id));
        }
      } else {
        if (!rule.flagshipMasterIds.includes(flagshipMasterId)) {
          return;
        }

        const fixedPartnerId = targetSlotIndex === 1 ? thirdShipMasterId : secondShipMasterId;
        if (!fixedPartnerId) {
          return;
        }

        rule.partnerMasterIds.forEach(([leftId, rightId]) => {
          if (leftId === fixedPartnerId) {
            result.add(rightId);
          }
          if (rightId === fixedPartnerId) {
            result.add(leftId);
          }
        });
      }
      return;
    }

    if (rule.partnerMasterIds) {
      if (targetSlotIndex === 0) {
        if (secondShipMasterId && rule.partnerMasterIds.includes(secondShipMasterId)) {
          rule.flagshipMasterIds.forEach((id) => result.add(id));
        }
      } else if (targetSlotIndex === 1) {
        if (!rule.flagshipMasterIds.includes(flagshipMasterId)) {
          return;
        }

        rule.partnerMasterIds.forEach((id) => {
          if (id > 0) {
            result.add(id);
          }
        });
      }
    }
  });

  return [...result];
}

export default getSpecialAttackPartnerHintMasterIds;
