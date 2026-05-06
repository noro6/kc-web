import ItemMaster from '@/classes/item/itemMaster';
import ShipMaster from '@/classes/fleet/shipMaster';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import SaveData from '@/classes/saveData/saveData';

export interface UsageSaveEntry {
  saveName: string;
  saveData?: SaveData;
}

export interface CollectUsageResult {
  /** Number of times each ship (by uniqueId) appears across all saves. */
  counts: { [uniqueId: number]: number };
  /** For each uniqueId, the list of save files that contain it. */
  usageMap: { [uniqueId: number]: UsageSaveEntry[] };
}

/**
 * Traverse the SaveData tree in a single pass and build both:
 * - `counts`: appearance count per uniqueId
 * - `usageMap`: reverse index from uniqueId to the save files that contain it
 * Prefers parsing the saved `manager` string; falls back to `tempData`.
 */
export function collectUsage(
  root: SaveData,
  items: ItemMaster[],
  ships: ShipMaster[],
  defaultEnemies: EnemyMaster[],
): CollectUsageResult {
  const counts: { [uniqueId: number]: number } = {};
  const usageMap: { [uniqueId: number]: UsageSaveEntry[] } = {};

  /** Process all fleets, updating counts and usageMap for this save entry. */
  const processFleets = (
    fleetInfo: { fleets: { ships: { uniqueId: number; data?: { id: number } }[] }[] },
    entry: UsageSaveEntry,
  ) => {
    for (let fi = 0; fi < fleetInfo.fleets.length; fi += 1) {
      const fleet = fleetInfo.fleets[fi];
      if (!fleet || !fleet.ships) continue;
      for (let si = 0; si < fleet.ships.length; si += 1) {
        const ship = fleet.ships[si];
        if (!ship || !ship.data || !ship.data.id || !ship.uniqueId) continue;
        counts[ship.uniqueId] = (counts[ship.uniqueId] || 0) + 1;
        if (!usageMap[ship.uniqueId]) usageMap[ship.uniqueId] = [];
        // Avoid adding the same save file twice (e.g. multiple fleets in same file)
        if (!usageMap[ship.uniqueId].includes(entry)) {
          usageMap[ship.uniqueId].push(entry);
        }
      }
    }
  };

  const walk = (sd: SaveData | undefined) => {
    if (!sd) return;
    if (sd.isDirectory && sd.childItems && sd.childItems.length) {
      for (let i = 0; i < sd.childItems.length; i += 1) {
        walk(sd.childItems[i]);
      }
      return;
    }

    const entry: UsageSaveEntry = { saveName: sd.name, saveData: sd };

    // Try parse saved manager string first
    if (sd.manager && sd.manager.length) {
      try {
        const manager = SaveData.loadSaveDataManagerString(sd.manager, items, ships, defaultEnemies);
        if (manager && manager.fleetInfo && manager.fleetInfo.fleets) {
          processFleets(manager.fleetInfo, entry);
          return;
        }
      } catch (e) {
        // parse error => fallthrough to tempData
      }
    }

    // Fallback: use tempData if present
    if (sd.tempData && sd.tempData.length) {
      for (let mi = 0; mi < sd.tempData.length; mi += 1) {
        const manager = sd.tempData[mi];
        if (!manager || !manager.fleetInfo || !manager.fleetInfo.fleets) continue;
        processFleets(manager.fleetInfo, entry);
      }
    }
  };

  walk(root);

  return { counts, usageMap };
}
