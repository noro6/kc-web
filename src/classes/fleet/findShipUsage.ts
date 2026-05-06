import FleetInfo from '@/classes/fleet/fleetInfo';
import Ship from '@/classes/fleet/ship';

export interface ShipUsage {
  fleetIndex: number;
  shipIndex: number;
  isUnion: boolean;
  matchBy: 'uniqueId';
  ship: Ship;
}

/** Search a FleetInfo for a ship by uniqueId and return ShipUsage[] */
export function findShipUsageInFleet(
  fleetInfo: FleetInfo,
  uniqueId: number | undefined,
): ShipUsage[] {
  if (!fleetInfo) return [];
  if (uniqueId === undefined) return [];

  const usages: ShipUsage[] = [];
  for (let fi = 0; fi < fleetInfo.fleets.length; fi += 1) {
    const fleet = fleetInfo.fleets[fi];
    if (!fleet || !fleet.ships) continue;
    for (let si = 0; si < fleet.ships.length; si += 1) {
      const ship = fleet.ships[si];
      if (!ship || ship.isEmpty || !ship.data || !ship.data.id) continue;
      if (ship.uniqueId === uniqueId) {
        usages.push({
          fleetIndex: fi,
          shipIndex: si,
          isUnion: !!fleet.isUnion,
          matchBy: 'uniqueId',
          ship,
        });
      }
    }
  }
  return usages;
}
