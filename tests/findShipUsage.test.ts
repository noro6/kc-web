import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import Ship from '../src/classes/fleet/ship';
import ShipMaster from '../src/classes/fleet/shipMaster';
import Fleet from '../src/classes/fleet/fleet';
import FleetInfo from '../src/classes/fleet/fleetInfo';
import { findShipUsage } from '../src/classes/fleet/findShipUsage';

describe('findShipUsage', () => {
  it('finds by uniqueId and by id', () => {
    const s1 = new Ship({ master: new ShipMaster({ id: 1, s_count: 0, slots: [] } as any), uniqueId: 101 });
    const s2 = new Ship({ master: new ShipMaster({ id: 2, s_count: 0, slots: [] } as any), uniqueId: 102 });
    const s3 = new Ship({ master: new ShipMaster({ id: 3, s_count: 0, slots: [] } as any), uniqueId: 103 });
    const s4 = new Ship({ master: new ShipMaster({ id: 1, s_count: 0, slots: [] } as any), uniqueId: 104 });

    const fleet0 = new Fleet({ ships: [s1, s2] });
    const fleet1 = new Fleet({ ships: [s3, s4] });
    const info = new FleetInfo({ fleets: [fleet0, fleet1] });

    const byUnique = findShipUsage(info, { uniqueId: 101 });
    deepEqual(byUnique.length, 1);
    deepEqual([byUnique[0].fleetIndex, byUnique[0].shipIndex], [0, 0]);

    const byId = findShipUsage(info, { id: 1 });
    // two matches: fleet0[0] and fleet1[1]
    deepEqual(byId.map((u) => [u.fleetIndex, u.shipIndex]), [[0, 0], [1, 1]]);
  });

  it('supports predicate matching', () => {
    const s1 = new Ship({ master: new ShipMaster({ id: 10, s_count: 0, slots: [] } as any), uniqueId: 201 });
    const s2 = new Ship({ master: new ShipMaster({ id: 11, s_count: 0, slots: [] } as any), uniqueId: 202 });
    const fleet = new Fleet({ ships: [s1, s2] });
    const info = new FleetInfo({ fleets: [fleet] });

    const res = findShipUsage(info, { predicate: (s) => s.uniqueId === 202 });
    deepEqual(res.length, 1);
    deepEqual([res[0].fleetIndex, res[0].shipIndex], [0, 1]);
  });
});
