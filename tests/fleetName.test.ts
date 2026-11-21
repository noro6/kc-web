import { deepEqual, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';
import CalcManager from '../src/classes/calcManager';
import Fleet from '../src/classes/fleet/fleet';
import FleetInfo from '../src/classes/fleet/fleetInfo';
import SaveData from '../src/classes/saveData/saveData';

describe('艦隊タブ名', () => {
  it('未設定は空文字で、艦隊数に揃う', () => {
    const info = new FleetInfo();
    equal(info.fleetNames.length, info.fleets.length);
    equal(info.fleetNames.every((name) => name === ''), true);
  });

  it('空白と改行を除き、12文字で切る', () => {
    equal(FleetInfo.normalizeFleetName('  イベントE5  '), 'イベントE5');
    equal(FleetInfo.normalizeFleetName('あいうえおかきくけこさしす'), 'あいうえおかきくけこさし');
    equal(FleetInfo.normalizeFleetName('  \n  '), '');
    equal(FleetInfo.normalizeFleetName(null), '');
  });

  it('再生成しても名前を引き継ぎ、削除した枠の名前は残らない', () => {
    const fleets = [new Fleet(), new Fleet(), new Fleet(), new Fleet(), new Fleet()];
    const original = new FleetInfo({ fleets, fleetNames: ['決戦', '支援', '対潜', '輸送', '予備'] });
    const kept = [];
    const keptNames = [];
    for (let i = 0; i < original.fleets.length; i += 1) {
      if (i === 1) {
        continue;
      }
      kept.push(original.fleets[i]);
      keptNames.push(original.fleetNames[i]);
    }
    const next = new FleetInfo({ info: original, fleets: kept, fleetNames: keptNames });

    deepEqual(next.fleetNames, ['決戦', '対潜', '輸送', '予備']);
  });

  it('セーブ文字列を経由しても名前が戻る', () => {
    const save = new SaveData();
    const manager = new CalcManager();
    manager.fleetInfo = new FleetInfo({
      fleetNames: ['  イベントE5  ', 'あいうえおかきくけこさしす', '支援'],
    });
    save.tempData = [manager];
    save.tempIndex = 0;
    save.saveManagerData();
    save.tempData = [];

    const loaded = save.loadManagerData([], [], []);
    deepEqual(loaded.fleetInfo.fleetNames.slice(0, 3), ['イベントE5', 'あいうえおかきくけこさし', '支援']);
  });

  it('名前を持たない古いセーブは空文字になる', () => {
    const save = new SaveData();
    const manager = new CalcManager();
    save.tempData = [manager];
    save.tempIndex = 0;
    save.saveManagerData();

    const raw = JSON.parse(save.manager) as { fleetInfo: { fleetNames?: string[] } };
    delete raw.fleetInfo.fleetNames;
    save.manager = JSON.stringify(raw);
    save.tempData = [];

    const loaded = save.loadManagerData([], [], []);
    equal(loaded.fleetInfo.fleetNames.every((name) => name === ''), true);
    equal(loaded.fleetInfo.fleetNames.length, loaded.fleetInfo.fleets.length);
  });
});
