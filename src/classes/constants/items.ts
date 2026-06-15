/** 航空戦に関係する装備カテゴリ */
export const PLANE_TYPES = [6, 7, 8, 9, 10, 11, 25, 26, 41, 45, 47, 48, 49, 53, 56, 57];

/** 空母のみ搭載可である機体カテゴリ */
export const CB_PLANE_TYPES = [6, 7, 8, 9, 57];

/** 水上機 */
export const SP_PLANE_TYPES = [10, 11, 41, 45];

/** 基地航空隊のみ搭載可である機体カテゴリ */
export const AB_PLANE_TYPES = [47, 48, 49, 53];

/** 艦戦カテゴリ */
export const FIGHTERS = [6, 45, 48, 56];

/** 攻撃機カテゴリ */
export const ATTACKERS = [7, 8, 11, 47, 53, 57];

/** 対潜哨戒機 オートジャイロ */
export const ASW_PLANES = [25, 26];

/** 偵察機カテゴリ */
export const RECONNAISSANCES = [9, 10, 41, 49];

/** 陸上攻撃機カテゴリ */
export const AB_ATTACKERS = [47, 53];

/** 大型陸上機カテゴリ */
export const AB_ATTACKERS_LARGE = [53];

/** 狭義の爆雷カテゴリ */
export const STRICT_DEPTH_CHARGE = [226, 227, 378, 439, 488];

/** ロケット戦闘機id */
export const ROCKET = [350, 351, 352];

/** 爆戦id */
export const BAKUSEN = [60, 154, 219, 447, 487];

/** 対地攻撃可能な艦爆id */
export const ENABLED_LAND_BASE_ATTACK = [64, 148, 233, 277, 305, 306, 319, 320, 391, 392, 420, 421, 474, 552];

/** 対潜支援可能艦種 */
export const ENABLED_ASW_SUPPORT = [7, 8, 10, 11, 45, 41, 25, 26];

/** 潜水艦後期型魚雷 */
export const LATE_MODEL_TORPEDO = [213, 214, 383, 441, 443, 457, 461, 512];

export const ITEM_API_TYPE = [
  { id: 6, name: '艦上戦闘機', sortKey: ['antiAir', 'accuracy', 'avoid', 'scout', 'radius', 'cost'] },
  { id: 7, name: '艦上爆撃機', sortKey: ['bomber', 'antiAir', 'accuracy', 'asw', 'avoid', 'scout', 'radius', 'avoidId', 'cost'] },
  { id: 8, name: '艦上攻撃機', sortKey: ['torpedo', 'antiAir', 'accuracy', 'asw', 'avoid', 'scout', 'radius', 'avoidId', 'cost'] },
  { id: 9, name: '艦上偵察機', sortKey: ['scout', 'accuracy', 'avoid', 'antiAir', 'radius', 'avoidId', 'cost'] },
  { id: 57, name: '噴式戦闘爆撃機', sortKey: ['bomber', 'antiAir', 'accuracy', 'avoid', 'scout', 'radius', 'avoidId', 'cost'] },
  { id: 56, name: '噴式艦上戦闘機', sortKey: ['antiAir', 'accuracy', 'avoid', 'scout', 'radius', 'cost'] },
  { id: 10, name: '水上偵察機', sortKey: ['scout', 'accuracy', 'avoid', 'antiAir', 'radius', 'avoidId', 'cost'] },
  { id: 11, name: '水上爆撃機', sortKey: ['bomber', 'antiAir', 'accuracy', 'avoid', 'scout', 'radius', 'avoidId', 'cost'] },
  { id: 45, name: '水上戦闘機', sortKey: ['antiAir', 'avoid', 'accuracy', 'scout', 'radius', 'cost'] },
  { id: 41, name: '大型飛行艇', sortKey: ['scout', 'accuracy', 'avoid', 'antiAir', 'radius', 'avoidId', 'cost'] },
  { id: 47, name: '陸上攻撃機', sortKey: ['torpedo', 'bomber', 'antiAir', 'asw', 'accuracy', 'avoid', 'scout', 'radius', 'avoidId', 'cost'] },
  { id: 53, name: '大型陸上機', sortKey: ['torpedo', 'bomber', 'antiAir', 'accuracy', 'avoid', 'scout', 'radius', 'avoidId', 'cost'] },
  { id: 48, name: '局地/陸軍戦闘機', sortKey: ['antiAir', 'antiBomber', 'interception', 'radius', 'cost', 'sortieAntiAir', 'defenseAntiAir'] },
  { id: 49, name: '陸上偵察機', sortKey: ['scout', 'accuracy', 'avoid', 'antiAir', 'radius', 'avoidId', 'cost'] },
  { id: 1, name: '小口径主砲', sortKey: ['fire', 'accuracy', 'antiAir', 'armor', 'range'] },
  { id: 2, name: '中口径主砲', sortKey: ['fire', 'accuracy', 'antiAir', 'armor', 'range'] },
  { id: 3, name: '大口径主砲', sortKey: ['fire', 'accuracy', 'antiAir', 'armor', 'range'] },
  { id: 4, name: '副砲', sortKey: ['fire', 'accuracy', 'antiAir', 'armor', 'range'] },
  { id: 5, name: '魚雷', sortKey: ['torpedo', 'accuracy', 'armor'] },
  { id: 12, name: '小型電探', sortKey: ['antiAir', 'accuracy', 'scout', 'fire', 'armor'] },
  { id: 13, name: '大型電探', sortKey: ['antiAir', 'accuracy', 'scout', 'fire', 'armor'] },
  { id: 14, name: 'ソナー', sortKey: ['asw', 'accuracy', 'scout'] },
  { id: 15, name: '爆雷', sortKey: ['asw', 'accuracy'] },
  { id: 17, name: '機関部強化' },
  { id: 18, name: '対空強化弾' },
  { id: 19, name: '対艦強化弾' },
  { id: 21, name: '対空機銃', sortKey: ['antiAir', 'accuracy', 'fire', 'armor', 'avoid'] },
  { id: 22, name: '特殊潜航艇', sortKey: ['torpedo', 'accuracy', 'avoid', 'scout'] },
  { id: 23, name: '応急修理要員' },
  { id: 24, name: '上陸用舟艇', sortKey: ['fire', 'antiAir', 'armor', 'avoid', 'tp', 'tp2'] },
  { id: 25, name: '回転翼機' },
  { id: 26, name: '対潜哨戒機' },
  { id: 27, name: '追加装甲(中型)' },
  { id: 28, name: '追加装甲(大型)' },
  { id: 29, name: '探照灯' },
  { id: 30, name: '簡易輸送部材' },
  { id: 31, name: '艦艇修理施設' },
  { id: 32, name: '潜水艦魚雷', sortKey: ['torpedo', 'accuracy', 'avoid'] },
  { id: 33, name: '照明弾' },
  { id: 34, name: '司令部施設' },
  { id: 35, name: '航空要員' },
  { id: 36, name: '高射装置' },
  { id: 37, name: '対地装備' },
  { id: 39, name: '水上艦要員' },
  { id: 40, name: '大型ソナー' },
  { id: 42, name: '大型探照灯' },
  { id: 43, name: '戦闘糧食' },
  { id: 44, name: '補給物資' },
  { id: 46, name: '特型内火艇' },
  { id: 50, name: '輸送機材' },
  { id: 51, name: '潜水艦装備' },
  { id: 52, name: '陸戦部隊' },
  { id: 54, name: '艦載発煙装置' },
  { id: 55, name: '防空気球' },
];

/**
 * 補強増設に搭載可能
 * そうそうかわんないけど、定期的に api_mst_equip_exslot チェックして更新
 * @static
 * @memberof Const
 */
export const EXPANDED_ITEM_TYPE = [16, 21, 23, 27, 28, 36, 39, 43, 44];

/**
 * 装備一覧 ちょっとまとめたやつと、装備一覧表示のステータス
 * @static
 * @memberof Const
 */
export const ITEM_TYPES_ALT = [
  {
    id: 1, text: '小口径主砲', viewStatus: ['actualFire', 'antiAir', 'actualAccuracy', 'nightBattleFirePower', 'antiAirWeight', 'antiAirBonus'], types: [1],
  },
  {
    id: 2, text: '中口径主砲', viewStatus: ['actualFire', 'antiAir', 'actualAccuracy', 'nightBattleFirePower', 'antiAirWeight', 'antiAirBonus'], types: [2],
  },
  {
    id: 3, text: '大口径主砲', viewStatus: ['actualFire', 'antiAir', 'actualAccuracy', 'nightBattleFirePower', 'antiAirBonus', 'actualRange'], types: [3],
  },
  {
    id: 5, text: '魚雷', viewStatus: ['actualTorpedo', 'nightBattleFirePower', 'actualFire', 'actualAccuracy', 'actualAvoid', 'actualArmor'], types: [5, 22, 32],
  },
  {
    id: 6, text: '艦戦', viewStatus: ['antiAir', 'actualAntiAir', 'actualAccuracy', 'actualAvoid', 'radius', 'airPower'], types: [6, 56],
  },
  {
    id: 7, text: '艦爆', viewStatus: ['actualBomber', 'actualAntiAir', 'actualAccuracy', 'actualAsw', 'radius', 'avoidId'], types: [7],
  },
  {
    id: 8, text: '艦攻', viewStatus: ['actualTorpedo', 'actualAntiAir', 'actualAccuracy', 'actualAsw', 'radius', 'avoidId'], types: [8],
  },
  {
    id: 9, text: '艦偵', viewStatus: ['actualScout', 'actualFire', 'actualAccuracy', 'actualAntiAir', 'radius', 'cost'], types: [9],
  },
  {
    id: 57, text: '噴式機', viewStatus: ['actualBomber', 'actualAccuracy', 'actualAntiAir', 'avoidId', 'airPower', 'cost'], types: [57, 56],
  },
  {
    id: 10, text: '水偵', viewStatus: ['actualScout', 'actualFire', 'actualAccuracy', 'actualAsw', 'radius', 'cost'], types: [10],
  },
  {
    id: 1100, text: '水爆', viewStatus: ['actualBomber', 'actualAntiAir', 'actualAccuracy', 'actualAsw', 'radius', 'avoidId'], types: [11],
  },
  {
    id: 4500, text: '水戦', viewStatus: ['antiAir', 'actualAntiAir', 'actualScout', 'actualAccuracy', 'radius', 'airPower'], types: [45],
  },
  {
    id: 41, text: '大型飛行艇', viewStatus: ['actualScout', 'actualAccuracy', 'actualAsw', 'radius', 'cost'], types: [41],
  },
  {
    id: 12, text: '電探', viewStatus: ['actualAccuracy', 'actualScout', 'antiAir', 'nightBattleFirePower', 'antiAirWeight', 'antiAirBonus'], types: [12, 13],
  },
  {
    id: 14, text: '対潜装備', viewStatus: ['actualAsw', 'actualAccuracy', 'actualArmor', 'actualAvoid', 'actualScout'], types: [14, 15, 40],
  },
  {
    id: 4, text: '副砲', viewStatus: ['actualFire', 'antiAir', 'actualAccuracy', 'nightBattleFirePower', 'antiAirWeight', 'antiAirBonus'], types: [4],
  },
  {
    id: 21, text: '機銃', viewStatus: ['antiAir', 'actualFire', 'actualAccuracy', 'actualArmor', 'antiAirWeight', 'antiAirBonus'], types: [21],
  },
  {
    id: 24, text: '上陸用舟艇', viewStatus: ['actualFire', 'antiAir', 'actualScout', 'actualAvoid', 'tp', 'tp2'], types: [24, 30, 46, 52],
  },
  {
    id: 47, text: '陸攻', viewStatus: ['actualTorpedo', 'actualBomber', 'actualAntiAir', 'radius', 'cost', 'avoidId'], types: [47, 53],
  },
  {
    id: 48, text: '局戦', viewStatus: ['actualAntiAir', 'actualDefenseAntiAir', 'antiBomber', 'radius', 'airPower', 'defenseAirPower'], types: [48],
  },
  {
    id: 49, text: '陸偵', viewStatus: ['actualAntiAir', 'actualScout', 'actualAccuracy', 'radius', 'actualArmor', 'cost'], types: [49],
  },
  {
    id: 17, text: 'その他', viewStatus: ['radius', 'nightBattleFirePower', 'actualAccuracy', 'actualScout', 'actualAsw', 'actualArmor'], types: [17, 18, 19, 23, 25, 26, 27, 28, 29, 31, 33, 34, 35, 36, 37, 39, 42, 43, 44, 50, 51, 54, 55],
  },
];
