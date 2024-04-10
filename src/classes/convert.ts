import LZString from 'lz-string';
import CalcManager from './calcManager';
import Const, { CELL_TYPE, FLEET_TYPE, FORMATION } from './const';
import Fleet from './fleet/fleet';
import FleetInfo from './fleet/fleetInfo';
import Item from './item/item';
import ItemMaster from './item/itemMaster';
import Airbase from './airbase/airbase';
import AirbaseInfo from './airbase/airbaseInfo';
import Ship from './fleet/ship';
import ShipMaster from './fleet/shipMaster';
import ItemStock from './item/itemStock';
import ShipStock from './fleet/shipStock';
import CommonCalc from './commonCalc';
import SaveData from './saveData/saveData';
import LZStringMod from './lz-string-mod';
import OldItem from './item/oldItem';
import OldShip from './fleet/oldShip';
import BattleInfo from './enemy/battleInfo';
import EnemyMaster from './enemy/enemyMaster';
import Enemy from './enemy/enemy';
import EnemyFleet from './enemy/enemyFleet';
import { MasterCell } from './interfaces/master';
import FirebaseManager from './firebaseManager';

interface DeckBuilderSpecialEffectItem {
  /** 種別 (1=海色リボン 2=白たすき ) */
  kind?: 1 | 2;
  fp: number;
  tp: number;
  ar: number;
  ev: number;
}

/** デッキビルダー 装備個別 */
interface DeckBuilderItem {
  /** 装備id */
  id: number,
  /** 改修値 */
  rf: number,
  /** 熟練度 */
  mas?: number
}

/** デッキビルダー 艦娘 */
interface DeckBuilderShip {
  /** 艦娘id */
  id: number,
  /** 艦娘Level */
  lv: number,
  /** 艦娘運 -1で通常 */
  luck: number,
  /** 耐久 */
  hp?: number;
  /** 火力 */
  fp?: number;
  /** 雷装 */
  tp?: number;
  /** 対空 */
  aa?: number;
  /** 装甲 */
  ar?: number;
  /** 対潜 */
  asw?: number;
  /** 回避 */
  ev?: number;
  /** 索敵 */
  los?: number;
  /** 補強増設 */
  exa?: boolean;
  /** 装備データ */
  items: { [name: string]: DeckBuilderItem };
  /** 特殊アイテム 海色リボンなど */
  spi?: DeckBuilderSpecialEffectItem[];
}

/** デッキビルダー 艦隊 */
interface DeckBuilderFleet {
  /** 艦隊名 */
  name?: string;
  /** 陣形 */
  t?: number;
  /** 艦娘1 */
  s1?: DeckBuilderShip;
  /** 艦娘2 */
  s2?: DeckBuilderShip;
  /** 艦娘3 */
  s3?: DeckBuilderShip;
  /** 艦娘4 */
  s4?: DeckBuilderShip;
  /** 艦娘5 */
  s5?: DeckBuilderShip;
  /** 艦娘6 */
  s6?: DeckBuilderShip;
  /** 艦娘7 */
  s7?: DeckBuilderShip;
}

/** デッキビルダー 基地 */
interface DeckBuilderAirbase {
  /** 基地名称 */
  name?: string;
  /** 待機 出撃 防空 */
  mode: number;
  /** 装備データ */
  items: { [name: string]: DeckBuilderItem };
  /** 派遣先 DeckBuilderCell.cに対応 */
  sp?: number[];
}

/** デッキビルダー敵編成データ */
interface DeckBuilderEnemyEquipment {
  /** 装備id */
  id: number;
}
/** デッキビルダー敵編成データ */
interface DeckBuilderEnemyShip {
  /** 敵id */
  id: number;
  /** 装備 */
  items: DeckBuilderEnemyEquipment[];
}
/** デッキビルダー敵編成データ */
interface DeckBuilderEnemyFleet {
  /** 敵艦隊名 ここでは使わないかな */
  name?: string;
  /** 敵情報一覧 */
  s: DeckBuilderEnemyShip[];
}
/** デッキビルダーセルデータ */
interface DeckBuilderCell {
  /** セルid */
  c: number;
  /** 味方陣形 */
  pf: number;
  /** 敵陣形 */
  ef: number;
  /** 第1艦隊 */
  f1: DeckBuilderEnemyFleet;
  /** 第2艦隊 */
  f2?: DeckBuilderEnemyFleet;
}
/** デッキビルダー出撃データ */
interface DeckBuilderSortieData {
  /** 海域id (world) */
  a: number;
  /** マップid (map) */
  i: number;
  c: DeckBuilderCell[];
}

/** デッキビルダー形式 全体 */
interface DeckBuilder {
  version: number,
  hqlv: number,
  f1?: DeckBuilderFleet,
  f2?: DeckBuilderFleet,
  f3?: DeckBuilderFleet,
  f4?: DeckBuilderFleet,
  a1?: DeckBuilderAirbase,
  a2?: DeckBuilderAirbase,
  a3?: DeckBuilderAirbase,
  s?: DeckBuilderSortieData,
}

type shipStockJson = { 'api_id': number, 'api_ship_id': number, 'api_lv': number, 'api_exp': number[], 'api_kyouka': number[], 'api_slot_ex': number, 'api_sally_area': number, 'api_sp_effect_items': { 'api_kind': number }[] };
type shipStockJson2 = { 'id': number, 'ship_id': number, 'lv': number, 'exp': number[], 'st': number[], 'ex': number, 'area': number, 'sp': number[] };
type itemStockJson = { 'api_slotitem_id': number, 'api_level': number };
type itemStockJson2 = { 'id': number, 'lv': number };

type oldShipStockSt = { 'id': number, 'lv': number, 'exp': number, 'st': number[], 'ex': number, 'area': number };

export interface OldShipStockJson {
  id: number, details: oldShipStockSt[]
}

export default class Convert {
  /** 装備マスタ */
  private readonly itemMasters: ItemMaster[];

  /** 艦船マスタ */
  private readonly shipMasters: ShipMaster[];

  /** 敵艦船マスタ */
  private readonly enemyMasters: EnemyMaster[];

  /** セルマスタ */
  private readonly cellMasters: MasterCell[];

  constructor(items: ItemMaster[], ships: ShipMaster[], enemies: EnemyMaster[] = [], cells: MasterCell[] = []) {
    this.itemMasters = items;
    this.shipMasters = ships;
    this.enemyMasters = enemies;
    this.cellMasters = cells;
  }

  /**
   * 通常デッキビルダー形式データを読み込み、計算データへと変換
   * @param {string} text
   * @returns {CalcManager}
   * @memberof Convert
   */
  public loadDeckBuilder(text: string): CalcManager | undefined {
    try {
      const json = JSON.parse(text) as DeckBuilder;

      if (!(json.a1 || json.a2 || json.a3 || json.f1 || json.f2 || json.f3 || json.f4 || json.s)) {
        return undefined;
      }

      /** 通ったセルid */
      const cellIds: number[][] = [];
      let lastFormation: number = FORMATION.LINE_AHEAD;
      // 出撃情報の取得と生成
      let sortieInfo = new BattleInfo();
      if (json.s) {
        const sortie = json.s;
        const enemyFleets: EnemyFleet[] = [];
        for (let i = 0; i < sortie.c.length; i += 1) {
          const cell = sortie.c[i];
          lastFormation = cell.pf;
          const enemies: Enemy[] = [];
          // 第1艦隊の復元
          for (let j = 0; j < 6; j += 1) {
            const enemy = cell.f1.s[j];
            if (enemy && enemy.id) {
              enemies.push(Enemy.createEnemyFromMasterId(enemy.id, false, this.enemyMasters, this.itemMasters));
            }
          }

          // 第2艦隊の復元
          if (cell.f2) {
            for (let j = 0; j < cell.f2.s.length; j += 1) {
              const enemy = cell.f2.s[j];
              if (enemy.id) {
                enemies.push(Enemy.createEnemyFromMasterId(enemy.id, true, this.enemyMasters, this.itemMasters));
              }
            }
          }

          const cellMaster = this.cellMasters.find((v) => v.w === sortie.a && v.m === sortie.i && v.i === cell.c);
          if (cellMaster) {
            // このセルと同じセルを表すidを全て取得する => 基地のspの値と、sortie.cが必ずしも一致しないため
            const ids = this.cellMasters.filter((v) => v.w === cellMaster.w && v.m === cellMaster.m && v.n === cellMaster.n);
            if (ids) {
              cellIds.push(ids.map((v) => v.i));
            }

            enemyFleets.push(new EnemyFleet({
              area: +`${cellMaster.w}${cellMaster.m}`,
              enemies,
              formation: Convert.replaceFormationId(cell.ef),
              mainFleetFormation: Convert.replaceFormationId(cell.pf),
              cellType: cellMaster.t,
              nodeName: cellMaster.n,
              radius: cellMaster.r,
            }));
          } else {
            enemyFleets.push(new EnemyFleet({ enemies, formation: cell.ef, mainFleetFormation: cell.pf }));
          }
        }

        sortieInfo = new BattleInfo({ fleets: enemyFleets, battleCount: enemyFleets.length });
      }

      // 基地情報の取得と生成
      const airbases: Airbase[] = [];
      for (let a = 1; a <= 3; a += 1) {
        const airbase = json[`a${a}` as 'a1' | 'a2' | 'a3'];
        if (airbase) {
          airbases.push(this.convertDeckToAirbase(airbase, cellIds));
        } else {
          airbases.push(new Airbase());
        }
      }

      // 艦娘情報の取得と生成
      const fleets: Fleet[] = [];
      for (let f = 1; f <= 4; f += 1) {
        const fleet = json[`f${f}` as 'f1' | 'f2' | 'f3' | 'f4'];
        if (fleet) {
          const ships: Ship[] = [];
          for (let s = 1; s <= 7; s += 1) {
            const data = fleet[`s${s}` as 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7'];
            if (data && data.id) {
              ships.push(this.convertDeckToShip(data));
            } else if (s <= 6) {
              // 6隻までは入れ続ける
              ships.push(new Ship());
            }
          }
          fleets.push(new Fleet({ ships, formation: Convert.replaceFormationId(lastFormation) }));
        } else {
          fleets.push(new Fleet());
        }
      }

      if (!airbases.length && !fleets.length && !sortieInfo) {
        return undefined;
      }

      const info = new CalcManager();
      const admiralLevel = json.hqlv ?? 120;
      const fleetType = json.f1 && json.f1.t ? json.f1 && json.f1.t : FLEET_TYPE.SINGLE;
      const isUnion = !!(json.f1 && json.f1.t);

      // 基地データ投入
      info.airbaseInfo = new AirbaseInfo({ airbases });
      // 艦隊データ投入
      info.fleetInfo = new FleetInfo({
        fleets, admiralLevel, isUnion, fleetType,
      });
      // 戦闘データ投入
      info.battleInfo = new BattleInfo({ info: sortieInfo });

      return info;
    } catch (error) {
      console.error(error);
      throw new Error('デッキビルダー形式ではありませんでした。');
    }
  }

  /**
   * デッキビルダー基地情報からAirbaseインスタンスの生成を頑張ってみる
   * エラー起きてもそのまま投げます
   * @private
   * @param {DeckBuilderAirbase} a
   * @param {number[]} cells
   * @return {*}  {Airbase}
   * @memberof Convert
   */
  private convertDeckToAirbase(a: DeckBuilderAirbase, cells: number[][]): Airbase {
    const items: Item[] = [];
    for (let i = 1; i <= 4; i += 1) {
      const key = `i${i}`;
      const item = a.items[key] || { id: 0, rf: 0, mas: 0 };
      const master = this.itemMasters.find((v) => v.id === item.id) || new ItemMaster();
      let slot = 18;
      if (Const.RECONNAISSANCES.includes(master?.apiTypeId)) {
        slot = 4;
      } else if (Const.AB_ATTACKERS_LARGE.includes(master?.apiTypeId)) {
        slot = 9;
      }
      items.push(new Item({
        master, remodel: item.rf, level: Const.PROF_LEVEL_BORDER[item.mas ?? 0], slot,
      }));
    }

    if (cells.length && a.sp && a.sp.length) {
      return new Airbase({
        mode: a.mode,
        items,
        battleTarget: a.sp.map((v) => {
          const target = cells.findIndex((w) => w.some((x) => x === v));
          // 派遣先が見つかればそこだしみつからなければ最終戦闘
          return target >= 0 ? target : cells.length - 1;
        }),
      });
    }
    return new Airbase({ mode: a.mode, items });
  }

  /**
   * デッキビルダー艦娘情報からShipインスタンスの生成を頑張ってみる
   * エラー起きてもそのまま投げます
   * @private
   * @param {DeckBuilderShip} s
   * @returns {Airbase}
   * @memberof Convert
   */
  private convertDeckToShip(s: DeckBuilderShip): Ship {
    const master = this.shipMasters.find((v) => v.id === +s.id) || new ShipMaster();
    const shipLv = s.lv || 99;
    const releaseExpand = s.exa ?? undefined;
    const luck = (s.luck && s.luck > 0) ? s.luck : master.luck;
    const baseHP = (shipLv > 99 ? master.hp2 : master.hp);
    const hp = (s.hp && s.hp > 0) ? s.hp : baseHP;
    const items: Item[] = [];
    const spEffectItemId = s.spi && s.spi.length ? s.spi[0].kind : 0;
    let exItem = new Item();

    for (let i = 0; i < master.slotCount; i += 1) {
      const key = `i${i + 1}`;
      const item = s.items[key] || { id: 0, rf: 0, mas: 0 };
      const itemMaster = this.itemMasters.find((v) => v.id === item.id);
      const level = Const.PROF_LEVEL_BORDER[item.mas ?? 0];
      if (itemMaster && itemMaster.apiTypeId === 41 && master.type2 === 90) {
        // 日進 & 大型飛行艇
        items.push(new Item({
          master: itemMaster, remodel: item.rf, level, slot: 1,
        }));
      } else {
        items.push(new Item({
          master: itemMaster, remodel: item.rf, level, slot: master.slots[i],
        }));
      }
    }

    // 補強増設 keyがixか、装備スロットインデックス+1を検索
    if (Object.keys(s.items).includes('ix') || Object.keys(s.items).includes(`i${master.slotCount + 1}`)) {
      const item = s.items.ix || s.items[`i${master.slotCount + 1}`] || { id: 0, rf: 0, mas: 0 };
      const itemMaster = this.itemMasters.find((v) => v.id === item.id);
      const level = Const.PROF_LEVEL_BORDER[item.mas ?? 0];
      exItem = new Item({ master: itemMaster, remodel: item.rf, level });
    }

    if (s.asw && s.asw > 0) {
      // デッキビルダー形式に対潜値が含まれていた場合 => 装備 + 改修 + ボーナス分なので、切り分ける必要がある
      const origAsw = Ship.getStatusFromLevel(shipLv, master.maxAsw, master.minAsw);
      // 対潜なしで一度艦娘を生成 => なぜ？ => 対潜改修値を特定するために、改修なしで素朴に生成したときの対潜値を見たい
      const ship = new Ship({
        master, level: shipLv, luck, items, exItem, hp, releaseExpand, spEffectItemId,
      });
      // 表示対潜の差分を見る => これが対潜改修分
      const increasedAsw = s.asw - ship.displayStatus.asw;
      if (increasedAsw > 0) {
        // 対潜改修値が存在したので、再生成して返却
        return new Ship({ ship, asw: origAsw + increasedAsw });
      }
      // 対潜改修値がないか（なぜか）負だった => とりあえずなしとする
      return ship;
    }

    return new Ship({
      master, level: shipLv, luck, items, exItem, hp, releaseExpand, spEffectItemId,
    });
  }

  /**
   * 所持装備情報JSONデータを解析して所持数配列を返却
   * @static
   * @param {string} value
   * @param {boolean} [isLockOnly=true] ロック済みのみならtrueを指定する
   * @returns {ItemStock[]}
   * @memberof Convert
   */
  public static readItemStockJson(value: string, isLockOnly = false): ItemStock[] {
    if (!value) {
      return [];
    }
    let text = value;
    if (value.startsWith('svdata=')) {
      // eslint-disable-next-line camelcase
      type apiItemSlot = { api_slotitem_id: number, api_level: number, api_locked: number };
      // svdata=を消して一度パースしてみる
      const json = JSON.parse(value.replace('svdata=', ''));
      let items: apiItemSlot[] = [];
      if (json.api_data && json.api_data.api_slot_item && json.api_data.api_slot_item.length) {
        items = json.api_data.api_slot_item;
      } else if (json.api_data && json.api_data.length) {
        const row = json.api_data[0] as apiItemSlot;
        if (row && row.api_slotitem_id && (row.api_level === 0 || row.api_level)) {
          items = json.api_data;
        }
      }

      if (items.length) {
        text = JSON.stringify(items.map((v) => ({ id: v.api_slotitem_id, lv: v.api_level, locked: v.api_locked })).filter((v) => !isLockOnly || v.locked), ['id', 'lv']);
      }
    }

    const json = JSON.parse(text) as (itemStockJson | itemStockJson2)[];
    if (!json.length) {
      return [];
    }
    const itemList: ItemStock[] = [];
    for (let i = 0; i < json.length; i += 1) {
      const data = json[i];
      if ('api_slotitem_id' in data && 'api_level' in data) {
        const id = data.api_slotitem_id;
        const remodel = Math.min(data.api_level, 10);
        const itemStock = itemList.find((v) => v.id === id);
        if (itemStock) {
          itemStock.num[remodel] += 1;
        } else {
          itemList.push(new ItemStock(id, remodel));
        }
      } else if ('id' in data && 'lv' in data) {
        const { id } = data;
        const remodel = Math.min(data.lv, 10);
        const itemStock = itemList.find((v) => v.id === id);
        if (itemStock) {
          itemStock.num[remodel] += 1;
        } else {
          itemList.push(new ItemStock(id, remodel));
        }
      }
    }
    return itemList;
  }

  /**
   * 在籍艦娘情報JSONデータを解析して在籍情報配列を返却
   * @static
   * @param {string} value 読み込むデータ
   * @param {boolean} [isLockOnly=true] ロック済みのみならtrueを指定する
   * @param {number} [minLevel=1] 取り込み最小レベル
   * @return {*}  {ShipStock[]}
   * @memberof Convert
   */
  public static readShipStockJson(value: string, isLockOnly = false, minLevel = 1): ShipStock[] {
    if (!value) {
      return [];
    }

    let text = value;
    if (value.startsWith('svdata=')) {
      // svdata=を消して一度パースしてみる
      const json = JSON.parse(value.replace('svdata=', ''));
      if (json.api_data && json.api_data.api_ship && json.api_data.api_ship.length) {
        // eslint-disable-next-line camelcase
        const ships = json.api_data.api_ship as { api_locked: number }[];
        text = JSON.stringify(ships.filter((v) => !isLockOnly || v.api_locked));
      }
    }

    const json = JSON.parse(text) as (shipStockJson | shipStockJson2)[];
    if (!json.length) {
      return [];
    }

    const shipList: ShipStock[] = [];
    let uniqueId = 1;
    const hasUniqueId = json.every((v) => ('api_id' in v && 'api_ship_id' in v && 'api_lv' in v && 'api_exp' in v) || ('id' in v && 'ship_id' in v && 'lv' in v && 'exp' in v));

    for (let i = 0; i < json.length; i += 1) {
      const data = json[i];
      const shipStock = new ShipStock();

      // 基本の情報 どちらかに入らなければ飛ばす
      if ('api_ship_id' in data && 'api_lv' in data && 'api_exp' in data) {
        shipStock.id = +data.api_ship_id;
        shipStock.level = +data.api_lv;
        // 参考：経験値 [0]=累積, [1]=次のレベルまで, [2]=経験値バー割合
        shipStock.exp = +data.api_exp[0];
      } else if ('id' in data && 'lv' in data && 'exp' in data) {
        if (hasUniqueId) {
          // 短縮新版 idは固有id、ship_idに艦娘マスタidが入っているケース
          shipStock.id = +data.ship_id;
        } else {
          // 短縮旧版 idに艦娘マスタidが入っているケース
          shipStock.id = +data.id;
        }
        shipStock.level = +data.lv;
        shipStock.exp = +data.exp[0];
      } else {
        // 判別不能！次！
        continue;
      }

      if (!shipStock.id) {
        // なんかデータおかしいので次
        continue;
      }

      if (hasUniqueId) {
        if ('api_id' in data) {
          shipStock.uniqueId = +data.api_id;
        } else if ('id' in data) {
          shipStock.uniqueId = +data.id;
        }
      } else {
        // 被りなしid付与
        shipStock.uniqueId = uniqueId;
        uniqueId += 1;
      }

      // 拡張情報 -補強増設解放
      if ('api_slot_ex' in data) {
        shipStock.releaseExpand = !!data.api_slot_ex;
      } else if ('ex' in data) {
        shipStock.releaseExpand = !!data.ex;
      }

      // 参考：近代化改修状態 [0]=火力, [1]=雷装, [2]=対空, [3]=装甲, [4]=運, [5]=耐久, [6]=対潜
      if ('api_kyouka' in data && data.api_kyouka.length >= 7) {
        shipStock.improvement.fire = +data.api_kyouka[0];
        shipStock.improvement.torpedo = +data.api_kyouka[1];
        shipStock.improvement.antiAir = +data.api_kyouka[2];
        shipStock.improvement.armor = +data.api_kyouka[3];
        shipStock.improvement.luck = +data.api_kyouka[4];
        shipStock.improvement.hp = +data.api_kyouka[5];
        shipStock.improvement.asw = +data.api_kyouka[6];
      } else if ('st' in data && data.st.length >= 7) {
        shipStock.improvement.fire = +data.st[0];
        shipStock.improvement.torpedo = +data.st[1];
        shipStock.improvement.antiAir = +data.st[2];
        shipStock.improvement.armor = +data.st[3];
        shipStock.improvement.luck = +data.st[4];
        shipStock.improvement.hp = +data.st[5];
        shipStock.improvement.asw = +data.st[6];
      }

      // 拡張情報 -出撃海域札
      if ('api_sally_area' in data) {
        shipStock.area = data.api_sally_area;
      } else if ('area' in data) {
        shipStock.area = data.area;
      }

      // 拡張情報 -海色リボン 白たすき
      if ('api_sp_effect_items' in data && data.api_sp_effect_items.length) {
        for (let j = 0; j < data.api_sp_effect_items.length; j += 1) {
          const kind = data.api_sp_effect_items[j].api_kind;
          if (kind === 1) {
            // 海色リボン
            shipStock.spEffectItems.push({ kind, torpedo: 1, armor: 1 });
          } else if (kind === 2) {
            // 白たすき
            shipStock.spEffectItems.push({ kind, fire: 2, avoid: 2 });
          }
        }
      } else if ('sp' in data && data.sp.length) {
        for (let j = 0; j < data.sp.length; j += 1) {
          const kind = data.sp[j];
          if (kind === 1) {
            // 海色リボン
            shipStock.spEffectItems.push({ kind, torpedo: 1, armor: 1 });
          } else if (kind === 2) {
            // 白たすき
            shipStock.spEffectItems.push({ kind, fire: 2, avoid: 2 });
          }
        }
      }

      // エラーチェック & 修正
      if (!shipStock.level) shipStock.level = 1;
      if (!shipStock.exp) shipStock.exp = 0;
      if (!shipStock.improvement.fire) shipStock.improvement.fire = 0;
      if (!shipStock.improvement.torpedo) shipStock.improvement.torpedo = 0;
      if (!shipStock.improvement.antiAir) shipStock.improvement.antiAir = 0;
      if (!shipStock.improvement.armor) shipStock.improvement.armor = 0;
      if (!shipStock.improvement.luck) shipStock.improvement.luck = 0;
      if (!shipStock.improvement.hp) shipStock.improvement.hp = 0;
      if (!shipStock.improvement.asw) shipStock.improvement.asw = 0;
      if (!shipStock.area) shipStock.area = 0;

      if (shipStock.level < minLevel) {
        // 最小レベル条件
        continue;
      }

      // 晴れてようやく追加
      shipList.push(shipStock);
    }
    return shipList;
  }

  /**
   * 計算データからデッキビルダー形式データを生成 文字列化
   * @static
   * @param {CalcManager} manager
   * @returns {string}
   * @memberof Convert
   */
  public static createDeckBuilderToString(manager: CalcManager, cells: MasterCell[]): string {
    return JSON.stringify(Convert.createDeckBuilder(manager, cells));
  }

  /**
   * DeckBuilderオブジェクトそのままで返却
   * @static
   * @param {CalcManager} manager
   * @param {boolean} [includeStatus=false]
   * @return {*}  {DeckBuilder}
   * @memberof Convert
   */
  public static createDeckBuilder(manager: CalcManager, cells: MasterCell[], includeStatus = false): DeckBuilder {
    const deckBuilder = {
      version: 4, hqlv: manager.fleetInfo.admiralLevel, f1: {}, f2: {}, f3: {}, f4: {},
    } as DeckBuilder;
    try {
      // 艦隊データ
      const { fleets, fleetType } = manager.fleetInfo;
      for (let i = 0; i < fleets.length; i += 1) {
        if (i >= 4) break;
        const ships = fleets[i].ships.filter((v) => v.isActive && !v.isEmpty);
        if (ships.length) {
          const builder = { name: `第${i + 1}艦隊`, t: fleetType };
          Convert.setDeckBuilderFleet(builder, ships, includeStatus);
          deckBuilder[`f${i + 1}` as 'f1' | 'f2' | 'f3' | 'f4'] = builder;
        }
      }

      // 基地データ
      const { airbases } = manager.airbaseInfo;
      for (let i = 0; i < airbases.length; i += 1) {
        const airbase = airbases[i];
        const items = Convert.getDeckBuilderItems(airbase.items);
        deckBuilder[`a${i + 1}` as 'a1' | 'a2' | 'a3'] = { name: `第${i + 1}基地航空隊`, items, mode: airbase.mode };
      }

      // 出撃データ => 最終戦闘をベースで考える
      const lastBattle = manager.battleInfo.fleets[manager.battleInfo.fleets.length - 1];
      if (lastBattle) {
        const c: DeckBuilderCell[] = [];
        for (let i = 0; i < manager.battleInfo.fleets.length; i += 1) {
          const cell = manager.battleInfo.fleets[i];
          const enemies1: DeckBuilderEnemyShip[] = [];
          const enemies2: DeckBuilderEnemyShip[] = [];
          for (let j = 0; j < cell.enemies.length; j += 1) {
            const enemy = cell.enemies[j];
            if (j < 6 && enemy.data.id) enemies1.push({ id: enemy.data.id, items: enemy.items.map((v) => ({ id: v.data.id })) });
            else if (enemy.data.id) enemies2.push({ id: enemy.data.id, items: enemy.items.map((v) => ({ id: v.data.id })) });
          }

          const cellMaster = cells.find((v) => v.w === cell.world && v.m === cell.map && v.n === cell.nodeName);
          if (enemies2.length) {
            c.push({
              c: cellMaster ? cellMaster.i : 0,
              pf: Convert.replaceAltFormationId(cell.mainFleetFormation),
              ef: Convert.replaceAltFormationId(cell.formation),
              f1: { s: enemies1 },
              f2: { s: enemies2 },
            });
          } else {
            c.push({
              c: cellMaster ? cellMaster.i : 0,
              pf: Convert.replaceAltFormationId(cell.mainFleetFormation),
              ef: Convert.replaceAltFormationId(cell.formation),
              f1: { s: enemies1 },
            });
          }
        }

        deckBuilder.s = { a: lastBattle.world, i: lastBattle.map, c };
      }

      return deckBuilder;
    } catch (error) {
      console.error(error);
      return deckBuilder;
    }
  }

  /**
   * デッキビルダー形式艦隊セット
   * @private
   * @static
   * @param {{ [name: string]: DeckBuilderShip }} fleet
   * @param {Ship[]} ships
   * @param {boolean} [includeStatus=false]
   * @memberof Convert
   */
  private static setDeckBuilderFleet(fleet: DeckBuilderFleet, ships: Ship[], includeStatus = false): void {
    for (let i = 0; i < ships.length; i += 1) {
      const ship = ships[i];
      const items = Convert.getDeckBuilderItems(ship.items);
      if (ship.exItem.data.id) {
        const level = CommonCalc.getProfLevel(ship.exItem.level);
        if (ship.exItem.data.isPlane) {
          items.ix = { id: ship.exItem.data.id, rf: ship.exItem.remodel, mas: level };
        } else {
          items.ix = { id: ship.exItem.data.id, rf: ship.exItem.remodel };
        }
      }
      const data: DeckBuilderShip = {
        id: ship.data.id,
        lv: ship.level,
        exa: !!ship.releaseExpand || !!ship.exItem.data.id,
        items,
        hp: ship.hp,
        asw: ship.displayStatus.asw,
        luck: ship.luck,
      };

      // ステータスを含める場合
      if (includeStatus) {
        data.fp = ship.displayStatus.firePower;
        data.tp = ship.displayStatus.torpedo;
        data.aa = ship.displayStatus.antiAir;
        data.ar = ship.displayStatus.armor;
        data.los = ship.displayStatus.LoS;
        data.ev = ship.displayStatus.avoid;
      }

      if (ship.spEffectItemId === 1) {
        data.spi = [{
          kind: 1, fp: 0, tp: 1, ar: 1, ev: 0,
        }];
      } else if (ship.spEffectItemId === 2) {
        data.spi = [{
          kind: 2, fp: 2, tp: 1, ar: 1, ev: 2,
        }];
      }

      const s = `s${i + 1}` as 's1' | 's2' | 's3' | 's4' | 's5' | 's6' | 's7';
      fleet[s] = data;
    }
  }

  /**
   * デッキビルダー形式装備オブジェクトを返却
   * @private
   * @static
   * @param {Item[]} items
   * @returns {{ [name: string]: DeckBuilderItem }}
   * @memberof Convert
   */
  private static getDeckBuilderItems(items: Item[]): { [name: string]: DeckBuilderItem } {
    const deckItem: { [name: string]: DeckBuilderItem } = {};
    for (let j = 0; j < items.length; j += 1) {
      const item = items[j];
      if (!item.data.id) {
        continue;
      }
      if (item.data.isPlane) {
        deckItem[`i${j + 1}`] = { id: item.data.id, rf: item.remodel, mas: CommonCalc.getProfLevel(item.level) };
      } else {
        deckItem[`i${j + 1}`] = { id: item.data.id, rf: item.remodel };
      }
    }

    return deckItem;
  }

  /**
   * 旧シミュレータデータから
   * @param {string[]} raw
   * @return {*}  {SaveData[]}
   * @memberof Convert
   */
  public convertOldSimulatorToSaveData(raw: string[], setting: { presetFolders: [] }): SaveData | undefined {
    if (!raw.length) {
      return undefined;
    }

    const importedRoot = new SaveData();
    importedRoot.isDirectory = true;
    importedRoot.isUnsaved = false;
    importedRoot.isOpen = true;
    importedRoot.highlight = true;

    // フォルダ情報チェック
    const oldFolders: { id: number, name: string }[] = setting && setting.presetFolders ? setting.presetFolders : [];
    const folders: { id: number, name: string, data: SaveData[] }[] = [];
    for (let i = 0; i < oldFolders.length; i += 1) {
      folders.push({ id: oldFolders[i].id, name: oldFolders[i].name, data: [] });
    }

    for (let i = 0; i < raw.length; i += 1) {
      // データ: [0:id, 1:編成名, 2:Base64化データ, 3:メモ, 4:更新日時, 5:フォルダID]
      const saveData = new SaveData();
      saveData.name = raw[i].length >= 2 ? raw[i][1] : '旧データ';
      saveData.remarks = raw[i].length >= 4 ? raw[i][3] : '';
      saveData.isUnsaved = false;

      // 日付変換
      const editedDate = raw[i].length >= 5 ? Date.parse(raw[i][4]) : '';
      if (editedDate) {
        saveData.editedDate = editedDate;
      }

      const dataString = raw[i].length >= 3 ? raw[i][2] : '';

      if (dataString) {
        // 各々復元
        const manager = this.restoreOldSaveData(dataString);
        if (!manager) {
          continue;
        }
        saveData.tempData = [manager];
        saveData.tempIndex = 0;
        saveData.saveManagerData();

        // フォルダチェック
        const folderId = raw[i].length >= 6 ? +raw[i][5] : 0;
        const folder = folders.find((v) => v.id === folderId);
        if (folder) {
          folder.data.push(saveData);
        } else {
          importedRoot.childItems.push(saveData);
        }
      }
    }

    for (let i = 0; i < folders.length; i += 1) {
      // データが存在するフォルダのみ取り込み
      if (folders[i].data.length) {
        const folder = new SaveData();
        folder.name = folders[i].name;
        folder.isDirectory = true;
        folder.isUnsaved = false;
        folder.childItems = folders[i].data;
        importedRoot.childItems.push(folder);
      }
    }

    return importedRoot;
  }

  public restoreOldSaveData(dataString: string): CalcManager | undefined {
    const decoded = LZStringMod.decompressFromEncodedURIComponent(dataString);
    if (!decoded) {
      return undefined;
    }
    const json = JSON.parse(decoded);

    // 各々復元
    const manager = new CalcManager();
    const isDefense = !!json[4];
    const admiralLevel = json[6] ? +json[6] : undefined;
    manager.airbaseInfo = this.restoreAirbase(json[0], isDefense);
    manager.fleetInfo = this.restoreFleet(json[1], admiralLevel);
    manager.battleInfo = this.restoreEnemies(json[2], json[5]);

    return manager;
  }

  /**
   * 旧シミュ形式から基地情報を復元、返却
   * @private
   * @param {*} old
   * @return {*}  {AirbaseInfo}
   * @memberof Convert
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private restoreAirbase(old: any, isDefense = false): AirbaseInfo {
    // 基地: [0:機体群, 1:札群, 2:ターゲット戦闘番号[1-1, 1-2, 2-1, ..., 3-2]]
    const oldItems = old[0];
    const oldAirbaseModes = old[1];
    const oldAirbaseTargets = old[2];

    const tempAirbaseInfo = new AirbaseInfo();
    for (let i = 0; i < oldItems.length; i += 1) {
      // 旧装備変換
      const oldItem = new OldItem(oldItems[i]);
      const slotIndex = oldItem.index;
      const airbase = tempAirbaseInfo.airbases[Math.floor(slotIndex / 4)];
      if (airbase) {
        const master = this.itemMasters.find((v) => v.id === oldItem.id);
        const item = new Item({
          master, level: oldItem.level, remodel: oldItem.remodel, slot: oldItem.slot,
        });
        airbase.items[slotIndex % 4] = item;
      }
    }

    // 一度再インスタンス化
    const newAirbases: Airbase[] = [];
    for (let i = 0; i < tempAirbaseInfo.airbases.length; i += 1) {
      const mode = oldAirbaseModes[i];
      let newMode = 0;
      if (mode === 2) {
        // 出撃は1
        newMode = 1;
      } else if (mode === 0) {
        // 防空は2
        newMode = 2;
      }

      if (oldAirbaseTargets) {
        const battleTarget = oldAirbaseTargets.length ? [oldAirbaseTargets[2 * i], oldAirbaseTargets[2 * i + 1]] : [0, 0];
        newAirbases.push(new Airbase({ airbase: tempAirbaseInfo.airbases[i], battleTarget, mode: newMode }));
      } else {
        newAirbases.push(new Airbase({ airbase: tempAirbaseInfo.airbases[i], mode: newMode }));
      }
    }

    return new AirbaseInfo({ airbases: newAirbases, isDefense });
  }

  /**
   * 旧シミュ形式から艦隊情報を復元、返却
   * @private
   * @param {any[]} old
   * @param {number} [admiralLevel=120]
   * @return {*}  {FleetInfo}
   * @memberof Convert
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private restoreFleet(old: any[], admiralLevel = 120): FleetInfo {
    const fleetInfo = new FleetInfo();

    // 第1 第2までしか取り扱っていない
    const ships1: Ship[] = [];
    const ships2: Ship[] = [];

    let isUnion = false;

    for (let i = 0; i < old.length; i += 1) {
      // 旧艦娘情報
      const oldShip = new OldShip(old[i]);
      // 現行マスタから情報取得
      const shipMaster = this.shipMasters.find((v) => v.albumId === oldShip.albumId);
      if (!shipMaster) {
        continue;
      }
      const tempShip = new Ship({
        master: shipMaster, level: oldShip.level, isActive: oldShip.isActive, luck: oldShip.luck,
      });
      const tempItems = tempShip.items;
      let exItem = new Item();

      const oldItems = oldShip.items;
      for (let j = 0; j < oldItems.length; j += 1) {
        // 旧装備変換
        const oldItem = oldItems[j];
        const master = this.itemMasters.find((v) => v.id === oldItem.id);
        const item = new Item({
          master, level: oldItem.level, remodel: oldItem.remodel, slot: oldItem.slot,
        });

        if (oldItem.index >= 0 && oldItem.index < tempItems.length) {
          // 装備置き換え
          tempItems[oldItem.index] = item;
        } else if (oldItem.index === -1) {
          // -1の場合補強増設
          exItem = item;
        }
      }
      // 再度インスタンス化
      if (oldShip.index < 6 || (oldShip.isYugeki && oldShip.index < 7)) {
        // 通常の6隻以外に、遊撃フラグかつ7番目も第1とする
        ships1.push(new Ship({ ship: tempShip, items: tempItems, exItem }));
      } else {
        ships2.push(new Ship({ ship: tempShip, items: tempItems, exItem }));
      }

      // どこかでだれかが連合フラグなら連合とする
      if (oldShip.isUnion) {
        isUnion = true;
      }
    }

    const fleet1 = new Fleet({ ships: ships1 });
    const fleet2 = new Fleet({ ships: ships2 });

    return new FleetInfo({
      info: fleetInfo, fleets: [fleet1, fleet2], isUnion, admiralLevel,
    });
  }

  /**
   * 旧シミュ形式から艦隊情報を復元、返却
   * 敵艦: [0:戦闘位置, 1:[敵id配列], 2:マス名, 3:マス種別, 4:陣形, 5:半径]
   * @private
   * @param {*} old
   * @return {*}  {AirbaseInfo}
   * @memberof Convert
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private restoreEnemies(old: any[], old2: any[] = []): BattleInfo {
    const fleets: EnemyFleet[] = [];
    for (let i = 0; i < old.length; i += 1) {
      const enemies: Enemy[] = [];
      const oldFleetInfo = old[i];
      const oldEnemyIds = oldFleetInfo[1];
      for (let j = 0; j < oldEnemyIds.length; j += 1) {
        const enemy = Enemy.createEnemyFromMasterId(1500 + oldEnemyIds[j], j > 5, this.enemyMasters, this.itemMasters);
        if (enemy.data.id) {
          enemies.push(enemy);
        }
      }

      const nodeNames = oldFleetInfo[2] ? oldFleetInfo[2].split('_') : '';
      const nodeName = nodeNames.length > 1 ? nodeNames[1] : '-';
      const cellType = oldFleetInfo[3] ? +oldFleetInfo[3] : CELL_TYPE.NORMAL;
      const formation = oldFleetInfo[4] ? +oldFleetInfo[4] : FORMATION.LINE_AHEAD;
      const range = oldFleetInfo[5] ? +oldFleetInfo[5] : 0;

      if (enemies.length) {
        fleets.push(new EnemyFleet({
          enemies, formation, cellType, radius: [range], nodeName,
        }));
      }
    }

    // 防空時敵 いれば
    if (old2.length && old2[0].some((v: number) => v !== 0)) {
      // 防空モード敵艦隊: [0:[敵id配列], 1:マス種別, 2:陣形]
      const enemies: Enemy[] = [];
      const oldEnemyIds = old2[0];
      for (let j = 0; j < oldEnemyIds.length; j += 1) {
        const enemy = Enemy.createEnemyFromMasterId(1500 + oldEnemyIds[j], j > 5, this.enemyMasters, this.itemMasters);
        if (enemy.data.id) {
          enemies.push(enemy);
        }
      }
      if (enemies.length) {
        const cellType = old2[1] ? +old2[1] : CELL_TYPE.HIGH_AIR_RAID;
        const formation = old2[2] ? +old2[2] : FORMATION.DIAMOND;
        const airRaidFleet = new EnemyFleet({ enemies, cellType, formation });
        return new BattleInfo({ fleets, airRaidFleet, battleCount: fleets.length });
      }
    }
    return new BattleInfo({ fleets, battleCount: fleets.length });
  }

  /**
   * 日付をフォーマット
   * @param {Date} date
   * @param {string} format
   * @returns
   */
  public static formatDate(date: Date, format: string): string {
    format = format.replace(/yyyy/g, date.getFullYear().toString());
    format = format.replace(/yy/g, (date.getFullYear() % 100).toString());
    format = format.replace(/MM/g, (`0${date.getMonth() + 1}`).slice(-2));
    format = format.replace(/dd/g, (`0${date.getDate()}`).slice(-2));
    format = format.replace(/HH/g, (`0${date.getHours()}`).slice(-2));
    format = format.replace(/mm/g, (`0${date.getMinutes()}`).slice(-2));
    format = format.replace(/ss/g, (`0${date.getSeconds()}`).slice(-2));
    format = format.replace(/SSS/g, (`00${date.getMilliseconds()}`).slice(-3));
    return format;
  }

  /**
   * 英プロパティ名から日変換
   * @static
   * @param {string} value
   * @return {*}  {string}
   * @memberof Convert
   */
  public static convertAttributeString(value: string): string {
    switch (value) {
      case 'fire':
        return '火力';
      case 'torpedo':
        return '雷装';
      case 'bomber':
        return '爆装';
      case 'antiAir':
        return '対空';
      case 'accuracy':
        return '命中';
      case 'scout':
        return '索敵';
      case 'avoid':
        return '回避';
      case 'antiBomber':
        return '対爆';
      case 'interception':
        return '迎撃';
      case 'armor':
        return '装甲';
      case 'asw':
        return '対潜';
      case 'range':
        return '射程';
      case 'radius':
        return '半径';
      case 'cost':
        return '配置コスト';
      case 'avoidId':
        return '射撃回避';
      case 'sortieAntiAir':
        return '出撃対空';
      case 'defenseAntiAir':
        return '防空対空';
      default:
        return value;
    }
  }

  /**
   * 艦種名 翻訳用に分割
   * @static
   * @param {string} name
   * @return {*}  {string[]}
   * @memberof Convert
   */
  public static getShipTypeNameArray(name: string): string[] {
    if (name === '潜高型' || name === '特種船丙型' || name === '特種船M丙型' || name === 'UボートIXC型') {
      return [name];
    }

    const array = [];
    if (name.startsWith('巡潜')) {
      array.push('巡潜');
      name = name.slice(2);

      const level = name.substring(0, 1);
      if (['甲', '乙', '丙', '丁'].includes(level)) {
        array.push('甲');
        name = name.slice(1);
      }

      if (name.endsWith('改二')) {
        array.push(name.slice(0, -2));
        array.push(name.slice(-2));
        name = '';
      }
    }
    if (name.endsWith('型') || name.endsWith('級')) {
      array.push(name.slice(0, -1));
      array.push(name.slice(-1));
    } else if (name) {
      array.push(name);
    }

    return array;
  }

  /**
   * Created by romulus on 2014/9/10.
   * @static
   * @param {string} dataString
   * @return {*}  {string}
   * @memberof Convert
   */
  public static encode64(dataString: string): string {
    const CODE = ['0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111',
      '1000', '1001', '1010', '1011', '1100', '1101'];
    const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-';
    let buff = '';
    let outputString = '';
    for (let j = 0; j < dataString.length; j += 1) {
      const c = dataString.charAt(j);
      let pos: number;
      if (c === ',') {
        pos = 10;
      } else if (c === '|') {
        pos = 11;
      } else if (c === '.') {
        pos = 12;
      } else if (c === ':') {
        pos = 13;
      } else {
        // eslint-disable-next-line radix
        pos = parseInt(c);
      }
      buff += CODE[pos];
      if (buff.length >= 6) {
        const seg = buff.slice(0, 6);
        outputString += BASE64.charAt(parseInt(seg, 2));
        buff = buff.slice(6);
      }
    }
    if (buff.length > 0) {
      while (buff.length < 6) {
        buff += '1';
      }
      outputString += BASE64.charAt(parseInt(buff, 2));
    }
    return outputString;
  }

  public static decode64(inputString: string): string {
    const CODE = ['0000', '0001', '0010', '0011', '0100', '0101', '0110', '0111',
      '1000', '1001', '1010', '1011', '1100', '1101'];
    const BASE64 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-';
    let dataString = '';
    let buff = '';
    for (let j = 0; j < inputString.length; j += 1) {
      let inp = BASE64.indexOf(inputString[j]).toString(2);
      while (inp.length < 6) {
        inp = `0${inp}`;
      }
      buff += inp;
      while (buff.length >= 4) {
        const seg = buff.slice(0, 4);
        const pos = CODE.indexOf(seg);
        if (pos === -1) {
          // Padding, do nothing
        } else if (pos === 10) {
          dataString += ',';
        } else if (pos === 11) {
          dataString += '|';
        } else if (pos === 12) {
          dataString += '.';
        } else if (pos === 13) {
          dataString += ':';
        } else {
          dataString += pos;
        }
        buff = buff.slice(4);
      }
    }
    return dataString;
  }

  /**
   * 旧在籍艦娘情報を新版に変換
   * @static
   * @param {oldShipStockJson[]} data
   * @return {*}  {ShipStock[]}
   * @memberof Convert
   */
  public static restoreShipStock(data: OldShipStockJson[], shipMasters: ShipMaster[]): ShipStock[] {
    const newStocks = [];
    let indexId = 1;
    for (let i = 0; i < data.length; i += 1) {
      const shipAlbumId = data[i].id;
      const oldDetails = data[i].details;

      const shipMaster = shipMasters.find((v) => v.albumId === shipAlbumId);
      if (!shipMaster) {
        continue;
      }
      for (let j = 0; j < oldDetails.length; j += 1) {
        const detail = oldDetails[j];

        const newStock = new ShipStock();
        newStock.uniqueId = indexId;
        newStock.id = shipMaster.id;
        newStock.area = detail.area && detail.area > 0 ? detail.area : 0;
        newStock.exp = detail.exp ? detail.exp : 0;
        newStock.level = detail.lv ? detail.lv : 1;
        newStock.releaseExpand = !!detail.ex;
        if (detail.st && detail.st.length) {
          const status = detail.st;
          newStock.improvement.fire = status[0] ? status[0] : 0;
          newStock.improvement.torpedo = status[1] ? status[1] : 0;
          newStock.improvement.antiAir = status[2] ? status[2] : 0;
          newStock.improvement.armor = status[3] ? status[3] : 0;
          newStock.improvement.luck = status[4] ? status[4] : 0;
          newStock.improvement.hp = status[5] ? status[5] : 0;
          newStock.improvement.asw = status[6] ? status[6] : 0;
        }

        newStocks.push(newStock);
        indexId += 1;
      }
    }

    return newStocks;
  }

  /**
   * 旧所持装備情報を新版に変換
   * @static
   * @param {ItemStock[]} data
   * @return {*}  {ItemStock[]}
   * @memberof Convert
   */
  public static restoreItemStock(data: ItemStock[]): ItemStock[] {
    const newStocks = [];

    for (let i = 0; i < data.length; i += 1) {
      const old = data[i] as ItemStock;

      // 念のため不正データがないかチェック
      if (old.id && old.num && old.num.length && old.num.length === 11) {
        const newStock = new ItemStock(old.id);
        newStock.num = old.num.concat();
        newStocks.push(newStock);
      }
    }
    return newStocks;
  }

  /**
   * 陣形idをこのサイト用に置き換え
   * @static
   * @param {number} api
   * @return {*}  {number}
   * @memberof Convert
   */
  public static replaceFormationId(api?: number): number {
    // 旧シミュのせいでこんなことになってる 過去の自分をぶん殴るべき
    if (api === 11) return FORMATION.FORMATION1;
    if (api === 12) return FORMATION.FORMATION2;
    if (api === 13) return FORMATION.FORMATION3;
    if (api === 14) return FORMATION.FORMATION4;
    return api ?? 1;
  }

  /**
   * 陣形id置き換え
   * @static
   * @param {number} formationId
   * @return {*}  {number}
   * @memberof Convert
   */
  public static replaceAltFormationId(formationId?: number): number {
    // 旧シミュのせいでこんなことになってる 過去の自分をぶん殴るべき
    if (formationId === FORMATION.FORMATION1) return 11;
    if (formationId === FORMATION.FORMATION2) return 12;
    if (formationId === FORMATION.FORMATION3) return 13;
    if (formationId === FORMATION.FORMATION4) return 14;
    return formationId ?? 1;
  }

  /**
   * 汎用
   * @static
   * @param {string} str
   * @returns
   * @memberof Convert
   */
  public static restoreTest(str: string) {
    const json = LZString.decompressFromEncodedURIComponent(str);
    return FirebaseManager.restoreShipsString(json ?? '[]');
  }

  /**
   * 汎用
   * @static
   * @param {string} str
   * @returns
   * @memberof Convert
   */
  public static restoreItemTest(str: string) {
    const json = LZString.decompressFromEncodedURIComponent(str);
    return FirebaseManager.restoreItemsString(json ?? '[]');
  }
}
