import ItemMaster from '@/classes/item/itemMaster';
import ShipMaster from '@/classes/fleet/shipMaster';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import SaveData from '@/classes/saveData/saveData';

export interface UsageSaveEntry {
  saveName: string;
  saveData?: SaveData;
}

export interface CollectUsageResult {
  counts: { [uniqueId: number]: number };
  usageSaveList: UsageSaveEntry[];
}

export interface CollectUsageOptions {
  targetUniqueId?: number;
}

/**
 * Traverse the SaveData tree in a single pass.
 * - Accumulates counts keyed by uniqueId.
 * - If targetUniqueId is given, collects every save file that contains the ship.
 * - Prefers parsing the saved `manager` string; falls back to `tempData`.
 */
export function collectUsage(
  root: SaveData,
  items: ItemMaster[],
  ships: ShipMaster[],
  defaultEnemies: EnemyMaster[],
  opts?: CollectUsageOptions,
): CollectUsageResult {
  const counts: { [uniqueId: number]: number } = {};
  const usageSaveList: UsageSaveEntry[] = [];
  const target = opts && typeof opts.targetUniqueId === 'number' ? opts.targetUniqueId : undefined;

  /** Count ships in a fleet list and return whether target was found. */
  const processFleets = (fleetInfo: { fleets: { ships: { uniqueId: number; data?: { id: number } }[] }[] }): boolean => {
    let found = false;
    for (let fi = 0; fi < fleetInfo.fleets.length; fi += 1) {
      const fleet = fleetInfo.fleets[fi];
      if (!fleet || !fleet.ships) continue;
      for (let si = 0; si < fleet.ships.length; si += 1) {
        const ship = fleet.ships[si];
        if (!ship || !ship.data || !ship.data.id || !ship.uniqueId) continue;
        counts[ship.uniqueId] = (counts[ship.uniqueId] || 0) + 1;
        if (typeof target !== 'undefined' && ship.uniqueId === target) found = true;
      }
    }
    return found;
  };

  const walk = (sd: SaveData | undefined) => {
    if (!sd) return;
    if (sd.isDirectory && sd.childItems && sd.childItems.length) {
      for (let i = 0; i < sd.childItems.length; i += 1) {
        walk(sd.childItems[i]);
      }
      return;
    }

    // Try parse saved manager string first
    if (sd.manager && sd.manager.length) {
      try {
        const manager = SaveData.loadSaveDataManagerString(sd.manager, items, ships, defaultEnemies);
        if (manager && manager.fleetInfo && manager.fleetInfo.fleets) {
          const found = processFleets(manager.fleetInfo);
          if (found) usageSaveList.push({ saveName: sd.name, saveData: sd });
          return;
        }
      } catch (e) {
        // parse error => fallthrough to tempData
      }
    }

    // Fallback: use tempData if present
    if (sd.tempData && sd.tempData.length) {
      let foundInFile = false;
      for (let mi = 0; mi < sd.tempData.length; mi += 1) {
        const manager = sd.tempData[mi];
        if (!manager || !manager.fleetInfo || !manager.fleetInfo.fleets) continue;
        if (processFleets(manager.fleetInfo)) foundInFile = true;
      }
      if (foundInFile) usageSaveList.push({ saveName: sd.name, saveData: sd });
    }
  };

  walk(root);

  return { counts, usageSaveList };
}
