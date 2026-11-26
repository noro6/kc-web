import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';
import Ship from '../src/classes/fleet/ship';
import ShipMaster from '../src/classes/fleet/shipMaster';
import Item from '../src/classes/item/item';
import ItemBonus from '../src/classes/item/ItemBonus';
import ItemMaster from '../src/classes/item/itemMaster';
import { MasterItem, MasterShip } from '../src/classes/interfaces/master';

function shipOf(partial: Partial<MasterShip>): ShipMaster {
  return new ShipMaster({
    id: 1,
    album: 1,
    type: 3,
    name: 'test',
    yomi: 'test',
    s_count: 4,
    slots: [0, 0, 0, 0],
    final: 0,
    orig: 1,
    ver: 0,
    range: 1,
    type2: 99,
    hp: 30,
    ...partial,
  } as MasterShip);
}

function equip(id: number, remodel = 0, type = 1): Item {
  const master = {
    id,
    type,
    itype: type === 12 || type === 13 ? 11 : 0,
    name: String(id),
  } as MasterItem;
  return new Item({ master: new ItemMaster(master), remodel });
}

function hasCombined(bonuses: { firePower?: number; accuracy?: number; antiAir?: number; avoid?: number }[]): boolean {
  return bonuses.some((b) => b.firePower === 1 && b.accuracy === 1 && b.antiAir === 4 && b.avoid === 3);
}

describe('ItemBonus の同時装備', () => {
  const ship = shipOf({ id: 9000, type: 3, type2: 99, orig: 9000 });

  it('13号対空電探改★4だけでは 22号対水上電探との組ボーナスは付かない', () => {
    const bonuses = Ship.getItemBonus(ship, [equip(517), equip(450, 4)]);
    equal(hasCombined(bonuses), false);
  });

  it('22号対水上電探改四★3と13号対空電探改★4が揃うと組ボーナスが付く', () => {
    const bonuses = Ship.getItemBonus(ship, [equip(517), equip(267, 3), equip(450, 4)]);
    equal(hasCombined(bonuses), true);
  });

  it('22号対水上電探改四が★3未満なら組ボーナスも単体シナジーも付かない', () => {
    const bonuses = Ship.getItemBonus(ship, [equip(517), equip(267, 2), equip(450, 4)]);
    equal(hasCombined(bonuses), false);
    equal(bonuses.some((b) => b.firePower === 1 && b.accuracy === 1 && !b.antiAir), false);
  });

  it('ボーナス定義そのものに fromTypeId を書き込まない', () => {
    const baseShip = shipOf({ id: 1, orig: 132, type2: 1 });
    Ship.getItemBonus(baseShip, [equip(1, 0, 29), equip(2, 0, 29)]);
    const row = ItemBonus.bonusData.find((e) => e.types && e.types.includes(29));
    const template = row?.bonuses.find((b) => b.shipBase && b.shipBase.includes(132));
    equal(template?.bonus.fromTypeId, undefined);
  });
});
