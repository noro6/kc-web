import ItemMaster from '@/classes/item/itemMaster';
import ShipMaster from '@/classes/fleet/shipMaster';
import EnemyMaster from '@/classes/enemy/enemyMaster';
import SaveData from '@/classes/saveData/saveData';

export interface UsageSaveEntry {
  saveName: string;
  saveData?: SaveData;
}

export interface CollectUsageResult {
  /** 各艦娘（uniqueId）が全セーブデータに登場する回数 */
  counts: { [uniqueId: number]: number };
  /** uniqueId ごとに、その艦娘を含むセーブファイルの一覧 */
  usageMap: { [uniqueId: number]: UsageSaveEntry[] };
}

/**
 * SaveData ツリーを一度だけ走査して以下を構築する。
 * - `counts`：uniqueId ごとの出現回数
 * - `usageMap`：uniqueId → 含むセーブファイルの逆引きインデックス
 * 保存済み manager 文字列のパースを優先し、失敗時は tempData にフォールバックする。
 */
export function collectUsage(
  root: SaveData,
  items: ItemMaster[],
  ships: ShipMaster[],
  defaultEnemies: EnemyMaster[],
): CollectUsageResult {
  const counts: { [uniqueId: number]: number } = {};
  const usageMap: { [uniqueId: number]: UsageSaveEntry[] } = {};

  /** 艦隊リストを処理し、counts と usageMap をこのセーブエントリ分だけ更新する */
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
        // 同一ファイルの複数艦隊で重複登録しないようにする
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

    // まず保存済み manager 文字列のパースを試みる
    if (sd.manager && sd.manager.length) {
      try {
        const manager = SaveData.loadSaveDataManagerString(sd.manager, items, ships, defaultEnemies);
        if (manager && manager.fleetInfo && manager.fleetInfo.fleets) {
          processFleets(manager.fleetInfo, entry);
          return;
        }
      } catch (e) {
        // パース失敗 => tempData にフォールバック
      }
    }

    // フォールバック：tempData が存在する場合に使用する
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
