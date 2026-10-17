import { deepEqual, equal } from 'node:assert/strict';
import { describe, it } from 'node:test';
import ShootDownInfo from '../src/classes/aerialCombat/shootDownInfo';
import Const from '../src/classes/const';
import ShipMaster from '../src/classes/fleet/shipMaster';
import { MasterShip } from '../src/classes/interfaces/master';
import { ShipBase } from '../src/classes/interfaces/shipBase';
import ItemMaster from '../src/classes/item/itemMaster';

const item = (id: number, name: string, type: number, itype: number, antiAir: number) => new ItemMaster({
  id, name, type, itype, antiAir,
});

const ship = (id: number, name: string, type2: number, ver: number, antiAir: number) => new ShipMaster({
  id, name, type2, ver, anti_air: antiAir,
} as MasterShip);

const EMPTY = new ItemMaster();

// 高角砲
const KOKAKU = item(10, '12.7cm連装高角砲', 4, 16, 4);
const SP_KOKAKU = item(122, '10cm連装高角砲+高射装置', 1, 16, 10);
const KOKAKU_HOUKA = item(71, '10cm連装高角砲(砲架)', 4, 16, 7);
const KOKAKU_8CM_ZOSETSU = item(220, '8cm高角砲改+増設機銃', 4, 16, 7);
const KOKAKU_10CM_ZOSETSU = item(275, '10cm連装高角砲改+増設機銃', 4, 16, 9);
const AKIZUKI_GUN = item(533, '10cm連装高角砲改+高射装置改', 1, 16, 11);
const KOKAKU_10CM_KAI = item(553, '10cm連装高角砲改', 1, 16, 7);
const SYUCHU_10CM = item(464, '10cm連装高角砲群 集中配備', 4, 16, 12);
const MK30 = item(284, '5inch単装砲 Mk.30', 1, 16, 6);
const MK30_KAI = item(313, '5inch単装砲 Mk.30改', 1, 16, 7);
const MK30_KAI_GFCS = item(308, '5inch単装砲 Mk.30改+GFCS Mk.37', 1, 16, 11);
const ATLANTA_GUN = item(362, '5inch連装両用砲(集中配備)', 2, 16, 11);
const ATLANTA_GFCS_GUN = item(363, 'GFCS Mk.37+5inch連装両用砲(集中配備)', 2, 16, 14);

// 主砲
const C_KAI3H = item(529, '12.7cm連装砲C型改三H', 1, 1, 5);
const BIG_GUN = item(8, '41cm連装砲', 3, 3, 4);
const MK1_FCR = item(300, '16inch Mk.I三連装砲改+FCR type284', 3, 3, 7);
const HARUNA_GUN = item(502, '35.6cm連装砲改三(ダズル迷彩仕様)', 3, 3, 6);
const HARUNA_GUN_KAI4 = item(503, '35.6cm連装砲改四', 3, 3, 5);

// 機銃
const KIJU = item(39, '25mm連装機銃', 21, 15, 5);
const KIJU_WEAK = item(37, '7.7mm機銃', 21, 15, 2);
const KIJU_AA3 = item(38, '12.7mm単装機銃', 21, 15, 3);
const KIJU_AA4 = item(49, '25mm単装機銃', 21, 15, 4);
const KIJU_AA6 = item(40, '25mm三連装機銃', 21, 15, 6);
const SP_KIJU = item(131, '25mm三連装機銃 集中配備', 21, 15, 9);
const KIJU_ZOBI = item(505, '25mm対空機銃増備', 21, 15, 7);
const POMPOM = item(191, 'QF 2ポンド8連装ポンポン砲', 21, 15, 10);
const UP_ROCKET = item(301, '20連装7inch UP Rocket Launchers', 21, 15, 7);
const HUNSHIN_KAI2 = item(274, '12cm30連装噴進砲改二', 21, 15, 8);

// 電探
const RADAR13 = item(27, '13号対空電探', 12, 11, 2);
const RADAR21 = item(30, '21号対空電探', 13, 11, 4);
const SURFACE_RADAR = item(28, '22号対水上電探', 12, 11, 0);
const YAMATO_RADAR = item(142, '15m二重測距儀+21号電探改二', 13, 11, 8);
const YAMATO_RADAR_KAI = item(460, '15m二重測距儀改+21号電探改二+熟練射撃指揮所', 13, 11, 8);
const GFCS_MK37 = item(307, 'GFCS Mk.37', 12, 11, 7);

// その他
const SANSHIKI = item(35, '三式弾', 18, 12, 5);
const KOSHA94 = item(121, '94式高射装置', 36, 30, 3);

// 艦固有の分岐に入らない艦代表
const MUTSUKI = ship(1, '睦月', 28, 0, 29);

function createShip(data: ShipMaster, items: ItemMaster[], exItem: ItemMaster = EMPTY): ShipBase {
  const all = [...items, exItem];
  const count = (predicate: (v: ItemMaster) => boolean) => all.filter(predicate).length;

  return {
    data,
    items: items.map((v) => ({ data: v })),
    exItem: { data: exItem },
    kokakuCount: count((v) => v.iconTypeId === 16 && !v.isSpecial),
    specialKokakuCount: count((v) => v.iconTypeId === 16 && v.isSpecial),
    kijuCount: count((v) => v.apiTypeId === 21 && !v.isSpecial),
    specialKijuCount: count((v) => v.apiTypeId === 21 && v.isSpecial),
    antiAirRadarCount: count((v) => v.iconTypeId === 11 && v.antiAir > 1),
    koshaCount: count((v) => v.apiTypeId === 36),
  } as unknown as ShipBase;
}

function cutInIds(data: ShipMaster, items: ItemMaster[], exItem?: ItemMaster): number[] {
  return ShootDownInfo.getAntiAirCutIn(createShip(data, items, exItem))
    .map((v) => v.id)
    .sort((a, b) => a - b);
}

describe('ShootDownInfo.getAntiAirCutIn', () => {
  describe('共通', () => {
    it('装備なしなら発動可能な対空CIはない', () => {
      deepEqual(cutInIds(MUTSUKI, []), []);
    });

    it('補強増設の装備も判定に含める', () => {
      deepEqual(cutInIds(ship(488, '由良改二', 20, 2, 88), [KOKAKU], RADAR13), [21]);
    });

    it('マスタの発動率を 101 で割った値を発動率とする', () => {
      const [cutIn] = ShootDownInfo.getAntiAirCutIn(createShip(ship(418, '皐月改二', 28, 2, 82), [SP_KIJU]));
      const master = Const.ANTI_AIR_CUTIN.find((v) => v.id === 18);
      equal(cutIn.id, 18);
      equal(cutIn.rate, (master?.rate ?? 0) / 101);
    });
  });

  describe('汎用', () => {
    it('4種 / 6種: 大口径, 三式弾, 高射装置(, 対空電探)', () => {
      deepEqual(cutInIds(MUTSUKI, [BIG_GUN, SANSHIKI, KOSHA94, RADAR13]), [4, 6]);
      deepEqual(cutInIds(MUTSUKI, [BIG_GUN, SANSHIKI, KOSHA94]), [6]);
    });

    it('5種 / 8種: 特殊高角砲, 対空電探', () => {
      deepEqual(cutInIds(MUTSUKI, [SP_KOKAKU, SP_KOKAKU, RADAR13]), [5, 8]);
      deepEqual(cutInIds(MUTSUKI, [SP_KOKAKU, RADAR13]), [8]);
    });

    it('7種 / 9種: 高角砲, 高射装置(, 対空電探)', () => {
      deepEqual(cutInIds(MUTSUKI, [KOKAKU, KOSHA94, RADAR13]), [7, 9]);
      deepEqual(cutInIds(MUTSUKI, [KOKAKU, KOSHA94]), [9]);
    });

    it('対空電探扱いされない電探では対空電探が必要な種別は発動しない', () => {
      deepEqual(cutInIds(MUTSUKI, [KOKAKU, KOSHA94, SURFACE_RADAR]), [9]);
    });

    it('12種: 特殊機銃, 対空3以上の機銃2つ, 対空電探', () => {
      deepEqual(cutInIds(MUTSUKI, [SP_KIJU, KIJU, RADAR13]), [12]);
      deepEqual(cutInIds(MUTSUKI, [SP_KIJU, KIJU_AA3, RADAR13]), [12]);
      deepEqual(cutInIds(MUTSUKI, [SP_KIJU, KIJU_WEAK, RADAR13]), []);
    });

    it('13種: 特殊機銃, 特殊高角砲, 対空電探', () => {
      deepEqual(cutInIds(MUTSUKI, [SP_KIJU, SP_KOKAKU, RADAR13]), [8, 13]);
    });
  });

  describe('秋月型', () => {
    const akizuki = ship(421, '秋月', 54, 0, 104);
    const akizukiKai = ship(330, '秋月改', 54, 1, 116);

    it('1種 / 2種 / 3種', () => {
      deepEqual(cutInIds(akizuki, [KOKAKU, KOKAKU, RADAR13]), [1, 2, 3]);
      deepEqual(cutInIds(akizuki, [KOKAKU, RADAR13]), [2]);
      deepEqual(cutInIds(akizuki, [KOKAKU, KOKAKU]), [3]);
    });

    it('2種は対空電探が必要だが、1種は対空電探でない電探でも発動する', () => {
      deepEqual(cutInIds(akizuki, [KOKAKU, SURFACE_RADAR]), []);
      deepEqual(cutInIds(akizuki, [KOKAKU, KOKAKU, SURFACE_RADAR]), [1, 3]);
    });

    it('5種 / 7種 / 8種 は発動しない', () => {
      deepEqual(cutInIds(akizuki, [SP_KOKAKU, SP_KOKAKU, KOSHA94, RADAR13]), [1, 2, 3, 9]);
    });

    it('48種: 改以降, 初月砲2, 対空4以上の電探', () => {
      deepEqual(cutInIds(akizukiKai, [AKIZUKI_GUN, AKIZUKI_GUN, RADAR21]), [1, 2, 3, 48]);
      deepEqual(cutInIds(akizuki, [AKIZUKI_GUN, AKIZUKI_GUN, RADAR21]), [1, 2, 3]);
      deepEqual(cutInIds(akizukiKai, [AKIZUKI_GUN, AKIZUKI_GUN, RADAR13]), [1, 2, 3]);
    });

    it('50種: 10cm連装高角砲改どちらか2, 対空4以上の電探, 94式高射装置', () => {
      deepEqual(cutInIds(akizuki, [AKIZUKI_GUN, KOKAKU_10CM_KAI, RADAR21, KOSHA94]), [1, 2, 3, 9, 50]);
    });

    it('52種: 10cm連装高角砲改2, 94式高射装置', () => {
      deepEqual(cutInIds(akizuki, [KOKAKU_10CM_KAI, KOKAKU_10CM_KAI, KOSHA94]), [3, 9, 52]);
    });
  });

  describe('艦娘固有', () => {
    it('摩耶改二 10種 / 11種 (13種は発動しない)', () => {
      const maya = ship(428, '摩耶改二', 8, 2, 106);
      deepEqual(cutInIds(maya, [KOKAKU, SP_KIJU, RADAR13]), [10, 11]);
      deepEqual(cutInIds(maya, [SP_KOKAKU, SP_KIJU, RADAR13]), [8, 10, 11]);
      deepEqual(cutInIds(maya, [KOKAKU, SP_KIJU]), [11]);
      deepEqual(cutInIds(maya, [SP_KIJU, RADAR13]), []);
    });

    it('五十鈴改二 14種 / 15種', () => {
      const isuzu = ship(141, '五十鈴改二', 20, 2, 85);
      deepEqual(cutInIds(isuzu, [KOKAKU, KIJU, RADAR13]), [14, 15]);
      deepEqual(cutInIds(isuzu, [KOKAKU, SP_KIJU]), [15]);
      deepEqual(cutInIds(isuzu, [KIJU, RADAR13]), []);
    });

    it('霞改二乙 16種 / 17種, 夕張改二 16種', () => {
      const kasumi = ship(470, '霞改二乙', 18, 3, 83);
      const yubari = ship(622, '夕張改二', 34, 2, 88);
      deepEqual(cutInIds(kasumi, [KOKAKU, KIJU, RADAR13]), [16, 17]);
      deepEqual(cutInIds(yubari, [KOKAKU, KIJU, RADAR13]), [16]);
      deepEqual(cutInIds(yubari, [KOKAKU, KIJU]), []);
    });

    it('皐月改二 18種', () => {
      deepEqual(cutInIds(ship(418, '皐月改二', 28, 2, 82), [SP_KIJU]), [18]);
    });

    it('鬼怒改二 19種 / 20種 (19種は特殊でない高角砲が必要)', () => {
      const kinu = ship(487, '鬼怒改二', 20, 2, 86);
      deepEqual(cutInIds(kinu, [KOKAKU, SP_KIJU]), [19, 20]);
      deepEqual(cutInIds(kinu, [SP_KOKAKU, SP_KIJU]), [20]);
    });

    it('由良改二 21種', () => {
      deepEqual(cutInIds(ship(488, '由良改二', 20, 2, 88), [KOKAKU, RADAR13]), [21]);
      deepEqual(cutInIds(ship(488, '由良改二', 20, 2, 88), [RADAR13]), []);
    });

    it('文月改二 22種', () => {
      deepEqual(cutInIds(ship(548, '文月改二', 28, 2, 82), [SP_KIJU]), [22]);
    });

    it('UIT-25 / 伊504 23種', () => {
      const uit25 = ship(539, 'UIT-25', 80, 2, 25);
      deepEqual(cutInIds(uit25, [KIJU]), [23]);
      deepEqual(cutInIds(ship(530, '伊504', 80, 3, 28), [KIJU]), [23]);
      deepEqual(cutInIds(uit25, [SP_KIJU]), []);
    });

    it('龍田改二 24種', () => {
      deepEqual(cutInIds(ship(478, '龍田改二', 21, 2, 80), [KOKAKU, KIJU]), [24]);
      deepEqual(cutInIds(ship(478, '龍田改二', 21, 2, 80), [KIJU]), []);
    });

    it('伊勢型 25種 / 28種', () => {
      deepEqual(cutInIds(ship(553, '伊勢改二', 2, 2, 85), [HUNSHIN_KAI2, RADAR13, SANSHIKI]), [25, 28]);
      [ship(82, '伊勢改', 2, 1, 92), ship(88, '日向改', 2, 1, 92), ship(553, '伊勢改二', 2, 2, 85), ship(554, '日向改二', 2, 2, 84)].forEach((v) => {
        deepEqual(cutInIds(v, [HUNSHIN_KAI2, RADAR13]), [28], v.name);
      });
      deepEqual(cutInIds(ship(553, '伊勢改二', 2, 2, 85), [HUNSHIN_KAI2, SANSHIKI]), []);
    });

    it('武蔵改 28種', () => {
      deepEqual(cutInIds(ship(148, '武蔵改', 37, 1, 99), [HUNSHIN_KAI2, RADAR13]), [28]);
      deepEqual(cutInIds(ship(148, '武蔵改', 37, 1, 99), [HUNSHIN_KAI2]), []);
    });

    it('大淀型 27種', () => {
      const oyodo = ship(321, '大淀改', 52, 1, 77);
      deepEqual(cutInIds(oyodo, [HUNSHIN_KAI2, RADAR13, KOKAKU_HOUKA]), [27]);
      deepEqual(cutInIds(oyodo, [HUNSHIN_KAI2, RADAR13, KOKAKU_8CM_ZOSETSU]), [27]);
      deepEqual(cutInIds(oyodo, [HUNSHIN_KAI2, RADAR13, KOKAKU_10CM_ZOSETSU]), [8, 27]);
      deepEqual(cutInIds(oyodo, [HUNSHIN_KAI2, RADAR13, KOKAKU]), []);
    });

    it('磯風乙改 / 浜風乙改 29種', () => {
      deepEqual(cutInIds(ship(557, '磯風乙改', 30, 2, 91), [KOKAKU, RADAR13]), [29]);
      deepEqual(cutInIds(ship(558, '浜風乙改', 30, 2, 93), [KOKAKU, RADAR13]), [29]);
      deepEqual(cutInIds(ship(557, '磯風乙改', 30, 2, 91), [RADAR13]), []);
    });

    it('天龍改二 24種 / 30種 / 31種', () => {
      const tenryu = ship(477, '天龍改二', 21, 2, 89);
      deepEqual(cutInIds(tenryu, [KOKAKU, KOKAKU, KOKAKU, KIJU]), [24, 30, 31]);
      deepEqual(cutInIds(tenryu, [KOKAKU, KOKAKU]), [31]);
    });

    it('Gotland改 30種 / 33種', () => {
      const gotland = ship(579, 'Gotland改', 89, 1, 102);
      deepEqual(cutInIds(gotland, [KOKAKU, KOKAKU, KOKAKU, KIJU]), [30, 33]);
      deepEqual(cutInIds(gotland, [KOKAKU, KIJU_AA4]), [33]);
      deepEqual(cutInIds(gotland, [KOKAKU, KIJU_AA3]), []);
      deepEqual(cutInIds(ship(630, 'Gotland andra', 89, 2, 90), [KOKAKU, KOKAKU, KOKAKU]), [30]);
    });

    it('英国艦 / 金剛型改二 32種', () => {
      const warspite = ship(439, 'Warspite', 67, 0, 88);
      deepEqual(cutInIds(warspite, [MK1_FCR, POMPOM]), [32]);
      deepEqual(cutInIds(warspite, [UP_ROCKET, POMPOM]), [32]);
      deepEqual(cutInIds(warspite, [UP_ROCKET, UP_ROCKET]), [32]);
      deepEqual(cutInIds(warspite, [POMPOM]), []);
      deepEqual(cutInIds(ship(149, '金剛改二', 6, 2, 87), [UP_ROCKET, POMPOM]), [32]);
      deepEqual(cutInIds(ship(209, '金剛改', 6, 1, 79), [UP_ROCKET, POMPOM]), []);
    });

    it('Fletcher級 34種 / 35種 / 36種 / 37種', () => {
      const johnston = ship(562, 'Johnston', 91, 0, 60);
      deepEqual(cutInIds(johnston, [MK30_KAI_GFCS, MK30_KAI_GFCS]), [34]);
      deepEqual(cutInIds(johnston, [MK30_KAI_GFCS, MK30_KAI]), [35]);
      deepEqual(cutInIds(johnston, [MK30_KAI_GFCS, MK30]), [35]);
      deepEqual(cutInIds(johnston, [MK30, MK30_KAI, GFCS_MK37]), [36]);
      deepEqual(cutInIds(johnston, [MK30_KAI, MK30_KAI]), [37]);
    });

    it('Atlanta級 38種 / 39種 / 40種 / 41種', () => {
      const atlanta = ship(597, 'Atlanta', 99, 0, 120);
      deepEqual(cutInIds(atlanta, [ATLANTA_GFCS_GUN, ATLANTA_GFCS_GUN]), [38, 41]);
      deepEqual(cutInIds(atlanta, [ATLANTA_GFCS_GUN, ATLANTA_GUN, GFCS_MK37]), [5, 8, 39, 40, 41]);
      deepEqual(cutInIds(atlanta, [ATLANTA_GUN, ATLANTA_GUN]), [41]);
    });

    it('大和型改二 42種 / 43種 / 44種 / 45種', () => {
      const yamato = ship(911, '大和改二', 37, 2, 108);
      const yamatoJu = ship(916, '大和改二重', 37, 3, 112);
      [yamato, yamatoJu, ship(546, '武蔵改二', 37, 2, 105)].forEach((v) => {
        deepEqual(cutInIds(v, [YAMATO_RADAR, SYUCHU_10CM, SYUCHU_10CM, SP_KIJU]), [5, 8, 13, 42, 43, 44, 45], v.name);
      });
      deepEqual(cutInIds(yamato, [YAMATO_RADAR, SYUCHU_10CM, SYUCHU_10CM, KIJU_AA6]), [5, 8, 42, 43, 44, 45]);
      deepEqual(cutInIds(yamato, [YAMATO_RADAR, SYUCHU_10CM, SYUCHU_10CM, KIJU]), [5, 8, 43, 45]);
      deepEqual(cutInIds(yamatoJu, [YAMATO_RADAR, SYUCHU_10CM]), [8, 45]);
      deepEqual(cutInIds(yamatoJu, [RADAR13, SYUCHU_10CM, SYUCHU_10CM]), [5, 8]);
      deepEqual(cutInIds(yamato, [YAMATO_RADAR_KAI, SYUCHU_10CM]), [8, 45]);
      deepEqual(cutInIds(yamato, [YAMATO_RADAR, SYUCHU_10CM, KIJU_AA6]), [8, 44, 45]);
      deepEqual(cutInIds(yamato, [YAMATO_RADAR, SYUCHU_10CM, KIJU]), [8, 45]);
    });

    it('武蔵改二 26種 / 28種, 大和改二は28種なし', () => {
      deepEqual(cutInIds(ship(546, '武蔵改二', 37, 2, 105), [HUNSHIN_KAI2, RADAR13, KOKAKU_10CM_ZOSETSU]), [8, 26, 28]);
      deepEqual(cutInIds(ship(911, '大和改二', 37, 2, 108), [HUNSHIN_KAI2, RADAR13, KOKAKU_10CM_ZOSETSU]), [8, 26]);
    });

    it('白露型(素対空70以上) 47種', () => {
      const shiratsuyuKai2 = ship(497, '白露改二', 23, 2, 71);
      deepEqual(cutInIds(shiratsuyuKai2, [C_KAI3H, C_KAI3H]), [47]);
      deepEqual(cutInIds(shiratsuyuKai2, [C_KAI3H, RADAR21]), [47]);
      deepEqual(cutInIds(shiratsuyuKai2, [C_KAI3H, KIJU_ZOBI]), [47]);
      deepEqual(cutInIds(shiratsuyuKai2, [C_KAI3H, RADAR13]), []);
      deepEqual(cutInIds(ship(498, '村雨改二', 23, 2, 70), [C_KAI3H, C_KAI3H]), [47]);
      deepEqual(cutInIds(ship(587, '海風改二', 23, 2, 69), [C_KAI3H, C_KAI3H]), []);
    });

    it('榛名改二乙 46種', () => {
      const haruna = ship(593, '榛名改二乙', 6, 3, 94);
      deepEqual(cutInIds(haruna, [HARUNA_GUN, SP_KIJU, RADAR13]), [46]);
      deepEqual(cutInIds(haruna, [HARUNA_GUN_KAI4, SP_KIJU, RADAR13]), [46]);
      deepEqual(cutInIds(haruna, [HARUNA_GUN, SP_KIJU]), []);
      deepEqual(cutInIds(haruna, [HARUNA_GUN, RADAR13]), []);
    });

    it('稲木改二 17種 / 18種 / 31種', () => {
      deepEqual(cutInIds(ship(979, '稲木改二', 117, 2, 77), [KOKAKU, KOKAKU, SP_KIJU]), [17, 18, 31]);
      deepEqual(cutInIds(ship(979, '稲木改二', 117, 2, 77), [KIJU]), []);
    });

    it('飛龍改三 10種 / 11種 / 27種 / 53種 (13種は発動しない)', () => {
      const hiryu = ship(1031, '飛龍改三', 25, 3, 90);
      deepEqual(cutInIds(hiryu, [SP_KOKAKU, SP_KIJU, RADAR21]), [8, 10, 11, 53]);
      deepEqual(cutInIds(hiryu, [HUNSHIN_KAI2, RADAR13, KOKAKU_HOUKA]), [27]);
      deepEqual(cutInIds(hiryu, [HUNSHIN_KAI2, RADAR13, KOKAKU_8CM_ZOSETSU]), [27]);
      deepEqual(cutInIds(hiryu, [HUNSHIN_KAI2, RADAR13, KOKAKU_10CM_ZOSETSU]), [8, 27]);
      deepEqual(cutInIds(hiryu, [RADAR13, KOKAKU_HOUKA]), []);
      deepEqual(cutInIds(hiryu, [KOKAKU_10CM_ZOSETSU, RADAR21]), [8, 53]);
      deepEqual(cutInIds(hiryu, [SP_KOKAKU]), []);
      deepEqual(cutInIds(hiryu, [SP_KIJU, RADAR21]), []);
    });

    it('時雨改三 / 吹雪改三 15種 / 16種 / 21種 / 24種', () => {
      [ship(961, '時雨改三', 23, 3, 87), ship(1035, '吹雪改三', 12, 3, 82)].forEach((v) => {
        deepEqual(cutInIds(v, [KOKAKU, KIJU, RADAR13]), [15, 16, 21, 24], v.name);
        deepEqual(cutInIds(v, [KOKAKU, KIJU]), [15, 24], v.name);
        deepEqual(cutInIds(v, [KIJU, RADAR13]), [], v.name);
      });
    });

    it('時雨改三は白露型の 47種 も発動する', () => {
      deepEqual(cutInIds(ship(961, '時雨改三', 23, 3, 87), [C_KAI3H, C_KAI3H]), [47]);
    });

    it('吹雪改三護 2種 / 21種 / 34種 / 35種 / 36種 / 48種', () => {
      const fubukiGo = ship(1040, '吹雪改三護(六式)', 12, 4, 92);
      deepEqual(cutInIds(fubukiGo, [KOKAKU, RADAR13]), [2, 21]);
      deepEqual(cutInIds(fubukiGo, [KOKAKU, SURFACE_RADAR]), []);
      deepEqual(cutInIds(fubukiGo, [RADAR13]), []);
      deepEqual(cutInIds(fubukiGo, [MK30_KAI_GFCS, MK30_KAI_GFCS, RADAR21]), [2, 5, 8, 21, 34, 49]);
      deepEqual(cutInIds(fubukiGo, [MK30_KAI_GFCS, MK30_KAI]), [35]);
      deepEqual(cutInIds(fubukiGo, [MK30_KAI_GFCS, MK30]), [35]);
      deepEqual(cutInIds(fubukiGo, [MK30, MK30_KAI, GFCS_MK37]), [2, 21, 36]);
      deepEqual(cutInIds(fubukiGo, [KOKAKU, GFCS_MK37]), [2, 21]);
      deepEqual(cutInIds(fubukiGo, [AKIZUKI_GUN, AKIZUKI_GUN, RADAR21]), [2, 5, 8, 21, 48, 49]);
      deepEqual(cutInIds(fubukiGo, [AKIZUKI_GUN, AKIZUKI_GUN]), []);
    });

    it('北上改三 10種 / 14種 / 21種 / 49種 / 53種 (13種は発動しない)', () => {
      const kitakami = ship(1071, '北上改三', 4, 3, 96);
      deepEqual(cutInIds(kitakami, [SP_KOKAKU, SP_KIJU, RADAR21]), [8, 10, 14, 21, 53]);
      deepEqual(cutInIds(kitakami, [SP_KOKAKU, SP_KOKAKU, RADAR13]), [5, 8, 21, 49]);
      deepEqual(cutInIds(kitakami, [KOKAKU_10CM_ZOSETSU, RADAR21]), [8, 21, 53]);
      deepEqual(cutInIds(kitakami, [SP_KIJU, RADAR21]), []);
      deepEqual(cutInIds(kitakami, [RADAR13]), []);
    });
  });

  describe('10cm連装高角砲改グループ (吹雪改二など)', () => {
    const fubuki = ship(426, '吹雪改二', 12, 2, 78);

    it('49種: 特殊高角砲2, 対空電探', () => {
      deepEqual(cutInIds(fubuki, [SP_KOKAKU, SP_KOKAKU, RADAR13]), [5, 8, 49]);
    });

    it('50種: 10cm連装高角砲改どちらか2, 対空4以上の電探, 94式高射装置', () => {
      deepEqual(cutInIds(fubuki, [AKIZUKI_GUN, KOKAKU_10CM_KAI, RADAR21, KOSHA94]), [7, 8, 9, 50]);
    });

    it('51種: 10cm連装高角砲改どちらか, 対空4以上の電探, 対空5以上の機銃', () => {
      deepEqual(cutInIds(fubuki, [AKIZUKI_GUN, RADAR21, KIJU]), [8, 51]);
      deepEqual(cutInIds(fubuki, [AKIZUKI_GUN, RADAR21, KIJU_WEAK]), [8]);
    });

    it('52種: 10cm連装高角砲改2, 94式高射装置', () => {
      deepEqual(cutInIds(fubuki, [KOKAKU_10CM_KAI, KOKAKU_10CM_KAI, KOSHA94]), [9, 52]);
    });

    it('グループの全艦が 49種 (秋月型以外) / 52種 の判定対象になる', () => {
      const members = [
        fubuki,
        ship(981, '藤波改二', 38, 2, 79),
        ship(982, '早波改二', 38, 2, 78),
        ship(983, '浜波改二', 38, 2, 80),
        ship(986, '白雪改二', 12, 2, 83),
        ship(987, '初雪改二', 12, 2, 85),
        ship(1033, '玉波改二', 38, 2, 79),
        ship(1035, '吹雪改三', 12, 3, 82),
        ship(1040, '吹雪改三護(六式)', 12, 4, 92),
      ];
      members.forEach((member) => {
        equal(cutInIds(member, [SP_KOKAKU, SP_KOKAKU, RADAR13]).includes(49), true, `${member.name} 49種`);
        equal(cutInIds(member, [KOKAKU_10CM_KAI, KOKAKU_10CM_KAI, KOSHA94]).includes(52), true, `${member.name} 52種`);
      });
      const akizuki = ship(421, '秋月', 54, 0, 104);
      equal(cutInIds(akizuki, [SP_KOKAKU, SP_KOKAKU, RADAR13]).includes(49), false);
      equal(cutInIds(akizuki, [KOKAKU_10CM_KAI, KOKAKU_10CM_KAI, KOSHA94]).includes(52), true);
    });

    it('グループ外の艦は 49〜52種 を発動しない', () => {
      deepEqual(cutInIds(MUTSUKI, [SP_KOKAKU, SP_KOKAKU, RADAR13]), [5, 8]);
      deepEqual(cutInIds(MUTSUKI, [KOKAKU_10CM_KAI, KOKAKU_10CM_KAI, KOSHA94]), [9]);
    });
  });
});
