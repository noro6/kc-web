import { equal, ok } from 'node:assert/strict';
import { describe, it } from 'node:test';
import Convert from '../src/classes/convert';
import CalcManager from '../src/classes/calcManager';
import Fleet from '../src/classes/fleet/fleet';
import FleetInfo from '../src/classes/fleet/fleetInfo';
import Ship from '../src/classes/fleet/ship';
import ShipMaster from '../src/classes/fleet/shipMaster';
import Item from '../src/classes/item/item';
import ItemMaster from '../src/classes/item/itemMaster';
import { MasterItem, MasterShip } from '../src/classes/interfaces/master';

function createShipMaster(): ShipMaster {
  const ship: MasterShip = {
    id: 741,
    album: 741,
    type: 11,
    name: 'テスト空母',
    yomi: 'てすとくうぼ',
    s_count: 4,
    slots: [18, 18, 12, 12],
    final: 1,
    orig: 741,
    ver: 0,
    range: 1,
    type2: 1,
    hp: 67,
    hp2: 74,
    max_hp: 82,
    fire: 22,
    torpedo: 0,
    anti_air: 57,
    armor: 58,
    luck: 10,
    max_luck: 60,
    min_scout: 50,
    scout: 102,
    min_asw: 0,
    asw: 0,
    min_avoid: 30,
    avoid: 66,
    speed: 10,
    before: 0,
    next_lv: 0,
    sort: 1,
    fuel: 60,
    ammo: 55,
    blueprints: 0,
    reports: 0,
    catapults: 0,
  };

  return new ShipMaster(ship);
}

function createPlaneMaster(): ItemMaster {
  const item: MasterItem = {
    id: 93,
    type: 6,
    itype: 6,
    name: 'テスト艦戦',
    antiAir: 9,
  };

  return new ItemMaster(item);
}

describe('DeckBuilder aircraft count', () => {
  it('装備の ac を艦娘装備の搭載数として読み込む', () => {
    const shipMaster = createShipMaster();
    const planeMaster = createPlaneMaster();
    const converter = new Convert([planeMaster], [shipMaster]);
    const manager = converter.loadDeckBuilder(JSON.stringify({
      version: 4,
      hqlv: 120,
      f1: {
        s1: {
          id: shipMaster.id,
          lv: 99,
          luck: 10,
          items: {
            i1: {
              id: planeMaster.id,
              rf: 0,
              mas: 7,
              ac: 19,
            },
          },
        },
      },
    }));

    ok(manager);
    equal(manager.fleetInfo.fleets[0].ships[0].items[0].fullSlot, 19);
  });

  it('デッキビルダー出力の航空機装備に ac を含める', () => {
    const shipMaster = createShipMaster();
    const planeMaster = createPlaneMaster();
    const manager = new CalcManager();
    const ship = new Ship({
      master: shipMaster,
      items: [new Item({
        master: planeMaster,
        remodel: 2,
        level: 120,
        slot: 19,
      })],
    });

    manager.fleetInfo = new FleetInfo({
      fleets: [new Fleet({ ships: [ship] })],
      admiralLevel: 120,
    });

    const deck = Convert.createDeckBuilder(manager, []);

    equal(deck.f1?.s1?.items.i1.ac, 19);
  });
});
