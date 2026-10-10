import { deepEqual } from 'node:assert/strict';
import { describe, it } from 'node:test';
import Ship from '../src/classes/fleet/ship';
import ShipMaster from '../src/classes/fleet/shipMaster';
import Fleet from '../src/classes/fleet/fleet';
import FleetInfo from '../src/classes/fleet/fleetInfo';
import { findShipUsageInFleet } from '../src/classes/fleet/findShipUsage';

describe('findShipUsage', () => {
  it('finds by uniqueId only', () => {
    const s1 = new Ship({ master: new ShipMaster({ id: 1, s_count: 0, slots: [] } as any), uniqueId: 101 });
    const s2 = new Ship({ master: new ShipMaster({ id: 2, s_count: 0, slots: [] } as any), uniqueId: 102 });
    const s3 = new Ship({ master: new ShipMaster({ id: 3, s_count: 0, slots: [] } as any), uniqueId: 103 });
    const s4 = new Ship({ master: new ShipMaster({ id: 1, s_count: 0, slots: [] } as any), uniqueId: 104 });

    const fleet0 = new Fleet({ ships: [s1, s2] });
    const fleet1 = new Fleet({ ships: [s3, s4] });
    const info = new FleetInfo({ fleets: [fleet0, fleet1] });

    const byUnique = findShipUsageInFleet(info, 101);
    deepEqual(byUnique.length, 1);
    deepEqual([byUnique[0].fleetIndex, byUnique[0].shipIndex], [0, 0]);

    const byUnique2 = findShipUsageInFleet(info, 104);
    deepEqual(byUnique2.length, 1);
    deepEqual([byUnique2[0].fleetIndex, byUnique2[0].shipIndex], [1, 1]);
  });
});
