import { equal } from 'node:assert/strict';
import { describe, it } from 'node:test';
import LZString from 'lz-string';
import CalcManager from '../src/classes/calcManager';
import Fleet from '../src/classes/fleet/fleet';
import FleetInfo from '../src/classes/fleet/fleetInfo';
import Ship from '../src/classes/fleet/ship';
import ShipMaster from '../src/classes/fleet/shipMaster';
import { MasterShip } from '../src/classes/interfaces/master';
import SaveData from '../src/classes/saveData/saveData';

function createShipMaster(id: number): ShipMaster {
  return new ShipMaster({ id } as MasterShip);
}

describe('URL用セーブデータ', () => {
  it('海色リボンと白たすきを載せ、札と所持艦idは落とす', () => {
    const ribbonMaster = createShipMaster(1);
    const plainMaster = createShipMaster(2);
    const manager = new CalcManager();
    manager.fleetInfo = new FleetInfo({
      fleets: [new Fleet({
        ships: [
          new Ship({
            master: ribbonMaster, spEffectItemId: 1, area: 5, uniqueId: 42,
          }),
          new Ship({
            master: plainMaster, spEffectItemId: 2, area: 3, uniqueId: 7,
          }),
        ],
      })],
    });

    const save = new SaveData();
    save.tempData = [manager];
    save.tempIndex = 0;

    const urlJson = LZString.decompressFromEncodedURIComponent(save.createURLSaveDataString());
    const ships = JSON.parse(urlJson).fleetInfo.fleets[0].ships as { sp?: number; ar?: number; un?: number }[];
    equal(ships[0].sp, 1);
    equal(ships[1].sp, 2);
    equal(ships[0].ar, undefined);
    equal(ships[0].un, undefined);
    equal(ships[1].ar, undefined);
    equal(ships[1].un, undefined);

    const loaded = SaveData.decodeURLSaveData(save.createURLSaveDataString()).loadManagerData([], [ribbonMaster, plainMaster], []);
    const loadedShips = loaded.fleetInfo.fleets[0].ships;
    equal(loadedShips[0].spEffectItemId, 1);
    equal(loadedShips[1].spEffectItemId, 2);
    equal(loadedShips[0].area, 0);
    equal(loadedShips[0].uniqueId, 0);
  });
});
