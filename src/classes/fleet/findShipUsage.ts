import FleetInfo from './fleetInfo';
import Ship from './ship';

export interface ShipUsage {
  fleetIndex: number;
  shipIndex: number;
  /** 艦隊が連合かどうかを示す（true の場合は連合艦隊） */
  isUnion: boolean;
  matchBy: 'uniqueId' | 'id' | 'predicate';
  ship: Ship;
}

export interface FindShipOpts {
  uniqueId?: number;
  id?: number;
  predicate?: (ship: Ship) => boolean;
  includeEmpty?: boolean;
}

/**
 * FleetInfo.fleets 内での艦娘の使用箇所を検索します。
 *
 * マッチ優先度: `uniqueId` → `id` → `predicate`（指定されている場合）。
 * 検出結果は艦隊インデックスと艦インデックスを含む配列で返します。
 */
export function findShipUsage(fleetInfo: FleetInfo, opts: FindShipOpts): ShipUsage[] {
  if (!fleetInfo) return [];
  const { uniqueId, id, predicate, includeEmpty } = opts || {};
  if (uniqueId === undefined && id === undefined && !predicate) {
    throw new Error('findShipUsage: must provide uniqueId, id or predicate');
  }

  const usages: ShipUsage[] = [];

  for (let fi = 0; fi < fleetInfo.fleets.length; fi += 1) {
    const fleet = fleetInfo.fleets[fi];
    if (!fleet || !fleet.ships) continue;

    for (let si = 0; si < fleet.ships.length; si += 1) {
      const ship = fleet.ships[si];
      if (!ship) continue;
      if (!includeEmpty && (ship.isEmpty || !ship.data || !ship.data.id)) continue;

      let matched = false;
      let matchBy: ShipUsage['matchBy'] | null = null;

      if (uniqueId !== undefined && ship.uniqueId === uniqueId) {
        matched = true;
        matchBy = 'uniqueId';
      } else if (id !== undefined && ship.data && ship.data.id === id) {
        matched = true;
        matchBy = 'id';
      } else if (predicate && predicate(ship)) {
        matched = true;
        matchBy = 'predicate';
      }

      if (matched && matchBy) {
        usages.push({
          fleetIndex: fi,
          shipIndex: si,
          isUnion: !!fleet.isUnion,
          matchBy,
          ship,
        });
      }
    }
  }

  return usages;
}
