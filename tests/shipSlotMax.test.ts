import { deepEqual, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';
import Convert from '../src/classes/convert';
import Ship from '../src/classes/fleet/ship';
import ShipMaster from '../src/classes/fleet/shipMaster';
import ShipStock from '../src/classes/fleet/shipStock';
import { MasterShip } from '../src/classes/interfaces/master';

function createShipMaster(): ShipMaster {
  const ship: MasterShip = {
    id: 888,
    album: 488,
    type: 11,
    name: 'テスト空母',
    yomi: 'てすとくうぼ',
    s_count: 4,
    slots: [18, 18, 12, 6],
    final: 1,
    orig: 888,
    ver: 0,
    range: 4,
    type2: 1,
    hp: 70,
    hp2: 71,
    max_hp: 80,
    fire: 13,
    torpedo: 0,
    anti_air: 44,
    armor: 36,
    luck: 42,
    max_luck: 98,
    min_scout: 50,
    scout: 90,
    min_asw: 0,
    asw: 0,
    min_avoid: 40,
    avoid: 80,
    speed: 10,
    before: 0,
    next_lv: 0,
    sort: 1,
    fuel: 60,
    ammo: 60,
    blueprints: 0,
    reports: 0,
    catapults: 0,
  };

  return new ShipMaster(ship);
}

describe('Ship stock slot max', () => {
  it('api_onslot_max を在籍艦娘の最大搭載数として読み込む', () => {
    const [stock] = Convert.readShipStockJson(JSON.stringify([{
      api_id: 1443,
      api_ship_id: 888,
      api_lv: 184,
      api_exp: [15131130, 868870, 13],
      api_kyouka: [47, 0, 49, 38, 10, 1, 0],
      api_slot_ex: 260625,
      api_sally_area: 0,
      api_sp_effect_items: [],
      api_onslot: [20, 20, 14, 5, 0],
      api_onslot_max: [21, 21, 15, 6, 0],
      api_slotnum: 4,
    }]));

    deepEqual(stock.slots, [21, 21, 15, 6]);
  });

  it('api_onslot_max がない場合は現在値 api_onslot を保存しない', () => {
    const [stock] = Convert.readShipStockJson(JSON.stringify([{
      api_id: 1443,
      api_ship_id: 888,
      api_lv: 184,
      api_exp: [15131130, 868870, 13],
      api_kyouka: [47, 0, 49, 38, 10, 1, 0],
      api_slot_ex: 260625,
      api_sally_area: 0,
      api_sp_effect_items: [],
      api_onslot: [20, 20, 14, 5, 0],
      api_slotnum: 4,
    }]));

    deepEqual(stock.slots, []);
  });

  it('短縮JSONでも最大搭載数を保持する', () => {
    const stock = new ShipStock();
    stock.uniqueId = 1443;
    stock.id = 888;
    stock.level = 184;
    stock.exp = 15131130;
    stock.slots = [21, 21, 15, 6];

    const [restored] = Convert.readShipStockJson(ShipStock.createFleetAnalyticsCode([stock]));

    deepEqual(restored.slots, stock.slots);
  });

  it('IndexedDB旧データのように slots 未定義でも正規化できる', () => {
    const legacy = {
      uniqueId: 1443,
      id: 888,
      level: 184,
      exp: 15131130,
      improvement: {
        fire: 0, torpedo: 0, antiAir: 0, armor: 0, luck: 0, hp: 0, asw: 0,
      },
      releaseExpand: true,
      area: 0,
      spEffectItems: [],
      isManualInput: false,
    } as unknown as ShipStock;

    equal(legacy.slots, undefined);

    const [normalized] = ShipStock.normalize([legacy]);
    deepEqual(normalized.slots, []);
    // 一覧生成相当: slots 未定義でも落ちずにマスタ搭載数へフォールバックできる
    const master = createShipMaster();
    const slots = normalized.slots?.length ? normalized.slots : master.slots;
    deepEqual(slots, master.slots);
  });

  it('Ship 生成時に個体ごとの最大搭載数を初期スロットへ反映する', () => {
    const master = createShipMaster();
    const ship = new Ship({ master, slots: [21, 21, 15, 6] });

    deepEqual(ship.slots, [21, 21, 15, 6]);
    equal(ship.items[0].fullSlot, 21);
    equal(ship.items[2].fullSlot, 15);
  });
});
