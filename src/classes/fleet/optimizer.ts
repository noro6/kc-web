import { sum } from 'lodash';
import Item from '../item/item';
import Ship from './ship';
import ShipValidation from './shipValidation';

interface SearchCond {
  apiTypeId?: number;
  iconTypeId?: number;
  maxAA?: number;
  minAA?: number;
  isSpecial?: boolean;
}

/**
 * 何もいい名前が思いつかなかった
 * @export
 * @class Optimizer
 */
export default class Optimizer {
  /**
   * 与えられた艦、装備からなるべく適切な対空CI用の装備配列を返却するつもりの関数
   * @static
   * @param {Ship} ship
   * @param {Item[]} allItems
   * @param {boolean} [isStockMode=false] 所持数制限モード ONなら2回同じ装備を使用しない処理が入る
   * @memberof Optimizer
   */
  public static getShipAACITriggerItems(ship: Ship, allItems: Item[], isStockMode = false): { id: number, items: Item[] }[] {
    // まず装備可能なものだけ取得
    const items = allItems.filter((v) => ShipValidation.isValidItem(ship.data, v.data));
    const gun = Optimizer.getBestAAItem(ship, items, { iconTypeId: 16 });
    const antiAirRadar = Optimizer.getBestAAItem(ship, items, { iconTypeId: 11, minAA: 1 });
    const specialMachineGun = Optimizer.getBestAAItem(ship, items, { apiTypeId: 21, isSpecial: true });
    const shipId = ship.data.id;

    if (ship.data.type2 === 54) {
      // 秋月型 => 1種, 2種, 3種
      const radar = Optimizer.getBestAAItem(ship, items, { iconTypeId: 11 });
      // 2本目の高角砲探索(1本目の高角砲を間引く)
      const gun1Index = items.findIndex((v) => v.data.id === gun.data.id && v.remodel === gun.remodel);
      const gun2 = Optimizer.getBestAAItem(ship, isStockMode ? items.filter((v, i) => i !== gun1Index) : items, { iconTypeId: 16 });
      return [
        { id: 1, items: [gun, gun2, radar] },
        { id: 2, items: [gun, radar] },
        { id: 3, items: [gun, gun2] },
      ];
    }
    if (shipId === 428) {
      // 摩耶様改二 => 10種, 11種
      return [
        { id: 10, items: [gun, antiAirRadar, specialMachineGun] },
        { id: 11, items: [gun, specialMachineGun] },
      ];
    }
    if (shipId === 141) {
      // 五十鈴改二 => 14種, 15種
      const machineGun = Optimizer.getBestAAItem(ship, items, { apiTypeId: 21 });
      return [
        { id: 14, items: [gun, antiAirRadar, machineGun] },
        { id: 15, items: [gun, machineGun] },
      ];
    }
    if (shipId === 470 || shipId === 622) {
      // 霞改二乙 夕張改二 => 16種, 17種
      const machineGun = Optimizer.getBestAAItem(ship, items, { apiTypeId: 21 });
      return [
        { id: 16, items: [gun, antiAirRadar, machineGun] },
        { id: 17, items: [gun, machineGun] },
      ];
    }
    if (shipId === 418) {
      // 皐月改二 => 18種
      return [{ id: 18, items: [specialMachineGun] }];
    }
    if (shipId === 487) {
      // 鬼怒改二 => 19種, 20種
      const weakGun = Optimizer.getBestAAItem(ship, items, { iconTypeId: 16, maxAA: 7 });
      return [
        { id: 19, items: [weakGun, specialMachineGun] },
        { id: 20, items: [specialMachineGun] },
      ];
    }
    if (shipId === 488) {
      // 由良改二 => 21種
      return [{ id: 21, items: [gun, antiAirRadar] }];
    }
    if (shipId === 548) {
      // 文月改二 => 22種
      return [{ id: 22, items: [specialMachineGun] }];
    }
    if (shipId === 329 || shipId === 530) {
      // UIT-25 伊504 => 23種
      const weakMachineGun = Optimizer.getBestAAItem(ship, items, { apiTypeId: 21, maxAA: 8 });
      return [{ id: 22, items: [weakMachineGun] }];
    }
    if (shipId === 478) {
      // 龍田改二 => 24種
      const weakMachineGun = Optimizer.getBestAAItem(ship, items, { apiTypeId: 21, maxAA: 8 });
      return [{ id: 22, items: [gun, weakMachineGun] }];
    }
    if ([82, 88, 553, 554].includes(shipId)) {
      // 伊勢型改 / 改二 => 25種, 28種
      const hunshin = items.find((v) => v.data.id === 274) ?? new Item();
      const sanshiki = Optimizer.getBestAAItem(ship, items, { apiTypeId: 18 });
      return [
        { id: 25, items: [antiAirRadar, sanshiki, hunshin] },
        { id: 28, items: [antiAirRadar, hunshin] },
      ];
    }
    if (shipId === 148) {
      // 武蔵改 => 28種
      const hunshin = items.find((v) => v.data.id === 274) ?? new Item();
      return [{ id: 28, items: [antiAirRadar, hunshin] }];
    }
    if (shipId === 557 || shipId === 558) {
      // 磯風乙改 / 浜風乙改 => 29種
      return [{ id: 29, items: [gun, antiAirRadar] }];
    }
    return [];
  }

  private static getBestAAItem(ship: Ship, allItems: Item[], cond: SearchCond): Item {
    // 種別で制限取得
    const items = allItems.filter((v) => {
      let value = true;
      if (cond.apiTypeId) value = value && v.data.apiTypeId === cond.apiTypeId;
      if (cond.iconTypeId) value = value && v.data.iconTypeId === cond.iconTypeId;
      if (cond.minAA) value = value && v.data.antiAir >= cond.minAA;
      if (cond.maxAA) value = value && v.data.antiAir <= cond.maxAA;
      if (cond.isSpecial) value = value && v.data.isSpecial;
      return value;
    });

    // このうち最も対空ボーナス合わせて性能が高いやつを取得
    let maxScore = 0;
    let subMaxScore = 0;
    let returnItem = new Item();
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const bonuses = Ship.getItemBonus(ship.data, [item]);
      // 対空性能
      const score = item.data.antiAir + sum(bonuses.map((v) => v.antiAir ?? 0));
      // サブ性能 対空性能が同じだった場合はこっちで比較する用の保険
      const subScore = item.data.fire + sum(bonuses.map((v) => v.firePower ?? 0));

      if (score > maxScore || (score === maxScore && subScore > subMaxScore)) {
        maxScore = score;
        subMaxScore = subScore;
        returnItem = item;
      }
    }

    return returnItem;
  }

  /**
   * 戦闘機を最適化した新しい艦隊データを返却
   * @static
   * @memberof Fleet
   */
  public static getOptimizedFighterFleet(ships: Ship[]): Ship[] {
    // 戦闘機を抽出
    const allFighterSlots: { shipIndex: number, slotIndex: number, slot: number }[] = [];
    const allFighters: Item[] = [];
    const allSPFighterSlots: { shipIndex: number, slotIndex: number, slot: number }[] = [];
    const allSPFighters: Item[] = [];

    for (let i = 0; i < ships.length; i += 1) {
      const ship = ships[i];
      if (ship.isEmpty || !ship.isActive) {
        continue;
      }
      for (let j = 0; j < ship.items.length; j += 1) {
        const item = ship.items[j];
        if (item.data.isFighter) {
          if (item.data.apiTypeId === 6) {
            // 艦戦
            allFighterSlots.push({ shipIndex: i, slotIndex: j, slot: item.fullSlot });
            allFighters.push(item);
          } else if (item.data.apiTypeId === 45) {
            // 水戦
            allSPFighterSlots.push({ shipIndex: i, slotIndex: j, slot: item.fullSlot });
            allSPFighters.push(item);
          }
        }
      }
    }

    // 搭載数の多い順にソート
    allFighterSlots.sort((a, b) => b.slot - a.slot);
    allSPFighterSlots.sort((a, b) => b.slot - a.slot);
    // 対空の高い順にソート
    allFighters.sort((a, b) => b.actualAntiAir - a.actualAntiAir);
    allSPFighters.sort((a, b) => b.actualAntiAir - a.actualAntiAir);

    // 艦戦 出撃対空順に、最大のスロットに埋めていく
    for (let i = 0; i < allFighters.length; i += 1) {
      const { shipIndex, slotIndex, slot } = allFighterSlots[i];
      ships[shipIndex].items[slotIndex] = new Item({ item: allFighters[i], slot });
    }
    // 水戦 出撃対空順に、最大のスロットに埋めていく
    for (let i = 0; i < allSPFighterSlots.length; i += 1) {
      const { shipIndex, slotIndex, slot } = allSPFighterSlots[i];
      ships[shipIndex].items[slotIndex] = new Item({ item: allSPFighters[i], slot });
    }

    // 装備群を再装備させる形で最インスタンス化
    const resultShips = [];
    for (let i = 0; i < ships.length; i += 1) {
      const ship = ships[i];
      resultShips.push(new Ship({ ship, items: ship.items }));
    }

    return resultShips;
  }
}
