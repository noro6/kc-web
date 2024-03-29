/* eslint-disable camelcase */
export interface MasterItem { id: number, type: number, itype: number, name: string, abbr?: string, fire?: number, antiAir?: number, torpedo?: number, bomber?: number, armor?: number, asw?: number, antiBomber?: number, interception?: number, scout?: number, canRemodel?: number, accuracy?: number, avoid2?: number, radius?: number, cost?: number, avoid?: number, range?: number, grow?: number }
export interface MasterShip { id: number, album: number, type: number, name: string, yomi: string, s_count: number, slots: number[], final: number, orig: number, ver: number, range: number, type2: number, hp: number, hp2: number, max_hp: number, fire: number, torpedo: number, anti_air: number, armor: number, luck: number, max_luck: number, min_scout: number, scout: number, min_asw: number, asw: number, min_avoid: number, avoid: number, speed: number, before: number, next_lv: number, sort: number, fuel: number, ammo: number, blueprints: number, reports: number, catapults: number }
export interface MasterEnemy { id: number, type: number, slot_count: number, name: string, slots: number[], items: number[], hp: number, aa: number, armor: number, speed: number, unknown: number }
export interface MasterShipType { api_id: number, api_name: string, api_equip_type: number[] }
/** 特定艦娘が装備可能な装備カテゴリ */
export interface MasterEquipmentShip { api_ship_id: number, api_equip_type: number[] }
/** 特定艦娘が補強増設に装備可能な装備id */
export interface MasterEquipmentExSlot { [key: string]: { api_ship_ids: { [key: string]: number } | null, api_stypes: { [key: string]: number } | null, api_ctypes: { [key: string]: number } | null, api_req_level: number | null } }
export interface FormattedMasterEquipmentExSlot { api_slotitem_id: number, api_ship_ids: number[], api_stypes: number[], api_ctypes: number[], api_req_level?: number }
export interface MasterWorld { world: number, name: string }
export interface MasterMap { area: number, name: string, boss: string[], has_detail: number, has_air_raid: number }
export interface MasterCell { w: number, m: number, i: number, n: string, t: number, r: number[] }

export interface Master {
  api_mst_equip_exslot_ship: MasterEquipmentExSlot[],
  api_mst_equip_ship: MasterEquipmentShip[],
  api_mst_stype: MasterShipType[],
  worlds: MasterWorld[],
  maps: MasterMap[],
  cells: MasterCell[],
  ships: MasterShip[],
  items: MasterItem[],
  enemies: MasterEnemy[],
  area_count: number
}
