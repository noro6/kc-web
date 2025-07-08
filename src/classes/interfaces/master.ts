/* eslint-disable camelcase */
export interface MasterItem {
  id: number;
  type: number;
  itype: number;
  name: string;
  abbr?: string;
  fire?: number;
  antiAir?: number;
  torpedo?: number;
  bomber?: number;
  armor?: number;
  asw?: number;
  antiBomber?: number;
  interception?: number;
  scout?: number;
  canRemodel?: number;
  accuracy?: number;
  avoid2?: number;
  radius?: number;
  cost?: number;
  avoid?: number;
  range?: number;
  grow?: number;
}
export interface MasterShip {
  id: number;
  album: number;
  type: number;
  name: string;
  yomi: string;
  s_count: number;
  slots: number[];
  final: number;
  orig: number;
  ver: number;
  range: number;
  type2: number;
  hp: number;
  hp2: number;
  max_hp: number;
  fire: number;
  torpedo: number;
  anti_air: number;
  armor: number;
  luck: number;
  max_luck: number;
  min_scout: number;
  scout: number;
  min_asw: number;
  asw: number;
  min_avoid: number;
  avoid: number;
  speed: number;
  before: number;
  next_lv: number;
  sort: number;
  fuel: number;
  ammo: number;
  blueprints: number;
  reports: number;
  catapults: number;
}
export interface MasterEnemy {
  id: number;
  type: number;
  slot_count: number;
  name: string;
  slots: number[];
  items: number[];
  hp: number;
  aa: number;
  armor: number;
  speed: number;
  unknown: number;
}
export interface ShipEquipableInfo {
  api_equip_type: Record<number, number[] | null>;
}
/**
 * api_mst_equip_exslot_ship
 * 特定艦娘が補強増設に装備可能な装備情報
 * 例: { 1: {
 *  api_ship_ids: { 1: 1, 2: 1 },
 *  api_stypes: { 1: 1, 2: 1 },
 *  api_ctypes: { 1: 1, 2: 1 },
 *  api_req_level: 1
 * }
 * 1: 装備ID key
 * api_ship_ids: 装備IDに対応する艦娘IDの配列、nullの場合はとりあえず装備不可
 * api_stypes: 装備IDに対応する艦種ID（駆逐、海防...）の配列、nullの場合はとりあえず装備不可
 * api_ctypes: 装備IDに対応する艦型ID（白露型、Fletcher級...）の配列、nullの場合はとりあえず装備不可
 * api_req_level: 装備IDに対応する最低限必要な改修値、このキー自体がない場合は制限なし
 */
export type MasterEquipmentExSlot = Record<
  number,
  {
    api_ship_ids: Record<number, 1> | null;
    api_stypes: Record<number, 1> | null;
    api_ctypes: Record<number, 1> | null;
    api_req_level?: number;
  }
>;
/**
 * api_mst_equip_ship
 * 艦娘に対する装備可能情報（マスタ情報より優先される）
 * 例: { 1: { api_equip_type: { 1: [1, 2, 3], 2: null } } }
 * 1: 艦娘ID
 * api_equip_type: 装備可能カテゴリ
 * 1: 装備可能カテゴリID
 * [1, 2, 3]: 装備可能カテゴリIDに対応する装備IDの配列、nullの場合、このカテゴリの装備は全て装備可能
 */
export type MasterEquipmentShip = Record<number, { api_equip_type: Record<number, number[] | null> }>;
/**
 * api_mst_stype
 * ただしapi_mst_stype は配列で、この型はあくまで1要素の型にすぎない
 * 例: { api_id: 1, api_name: '海防艦', api_equip_type: [1, 2, 3] }
 * api_id: 艦種ID
 * api_name: 艦種名
 * api_equip_type: 装備可能カテゴリIDの数値配列。数値配列なので、個別装備の情報は持っていない
 */
export interface MasterShipType {
  api_id: number;
  api_name: string;
  api_equip_type: number[];
}
export interface MasterWorld {
  world: number;
  name: string;
}
export interface MasterMap {
  area: number;
  name: string;
  boss: string[];
  has_detail: number;
  has_air_raid: number;
}
export interface MasterCell {
  w: number;
  m: number;
  i: number;
  n: string;
  t: number;
  r: number[];
}

export interface Master {
  api_mst_equip_exslot_ship: MasterEquipmentExSlot;
  api_mst_equip_ship: MasterEquipmentShip;
  api_mst_stype: MasterShipType[];
  worlds: MasterWorld[];
  maps: MasterMap[];
  cells: MasterCell[];
  ships: MasterShip[];
  items: MasterItem[];
  enemies: MasterEnemy[];
  area_count: number;
}
