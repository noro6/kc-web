import { sum } from 'lodash';
import Item from '../item/item';
import Ship from './ship';
import ShipValidation from './shipValidation';
import Const from '../const';
import Fleet from './fleet';
import ShipStock from './shipStock';
import ItemStock from '../item/itemStock';
import CalcManager from '../calcManager';
import AirbaseInfo from '../airbase/airbaseInfo';
import FleetInfo from './fleetInfo';
import Airbase from '../airbase/airbase';

interface SearchCond {
  apiTypeId?: number;
  iconTypeId?: number;
  maxAA?: number;
  minAA?: number;
  isSpecial?: boolean;
}

/**
 * 何もいい名前が思いつかなかった
 * @export
 * @class Optimizer
 */
export default class Optimizer {
  /**
   * 与えられた艦、装備からなるべく適切な対空CI用の装備配列を返却するつもりの関数
   * @static
   * @param {Ship} ship
   * @param {Item[]} allItems
   * @param {boolean} [isStockMode=false] 所持数制限モード ONなら2回同じ装備を使用しない処理が入る
   * @memberof Optimizer
   */
  public static getShipAACITriggerItems(ship: Ship, allItems: Item[], isStockMode = false): { id: number, items: Item[] }[] {
    // まず装備可能なものだけ取得
    const items = allItems.filter((v) => ShipValidation.isValidItem(ship.data, v.data));
    const gun = Optimizer.getBestAAItem(ship, items, { iconTypeId: 16 });
    const antiAirRadar = Optimizer.getBestAAItem(ship, items, { iconTypeId: 11, minAA: 1 });
    const specialMachineGun = Optimizer.getBestAAItem(ship, items, { apiTypeId: 21, isSpecial: true });
    const shipId = ship.data.id;

    const cutInPreset = [];

    if (ship.data.type2 === 54) {
      // 秋月型 => 1種, 2種, 3種
      const radar = Optimizer.getBestAAItem(ship, items, { iconTypeId: 11 });
      // 2本目の高角砲探索(1本目の高角砲を間引く)
      const gun1Index = items.findIndex((v) => v.data.id === gun.data.id && v.remodel === gun.remodel);
      const gun2 = Optimizer.getBestAAItem(ship, isStockMode ? items.filter((v, i) => i !== gun1Index) : items, { iconTypeId: 16 });
      return [
        { id: 1, items: [gun, gun2, radar] },
        { id: 2, items: [gun, radar] },
        { id: 3, items: [gun, gun2] },
      ];
    }
    if (shipId === 428) {
      // 摩耶様改二 => 10種, 11種
      return [
        { id: 10, items: [gun, antiAirRadar, specialMachineGun] },
        { id: 11, items: [gun, specialMachineGun] },
      ];
    }
    if (shipId === 141) {
      // 五十鈴改二 => 14種, 15種
      const machineGun = Optimizer.getBestAAItem(ship, items, { apiTypeId: 21 });
      return [
        { id: 14, items: [gun, antiAirRadar, machineGun] },
        { id: 15, items: [gun, machineGun] },
      ];
    }
    if (shipId === 470 || shipId === 622) {
      // 霞改二乙 夕張改二 => 16種, 17種
      const machineGun = Optimizer.getBestAAItem(ship, items, { apiTypeId: 21 });
      return [
        { id: 16, items: [gun, antiAirRadar, machineGun] },
        { id: 17, items: [gun, machineGun] },
      ];
    }
    if (shipId === 418) {
      // 皐月改二 => 18種
      cutInPreset.push({ id: 18, items: [specialMachineGun] });
    }
    if (shipId === 487) {
      // 鬼怒改二 => 19種, 20種
      const weakGun = Optimizer.getBestAAItem(ship, items, { iconTypeId: 16, maxAA: 7 });
      return [
        { id: 19, items: [weakGun, specialMachineGun] },
        { id: 20, items: [specialMachineGun] },
      ];
    }
    if (shipId === 488) {
      // 由良改二 => 21種
      cutInPreset.push({ id: 21, items: [gun, antiAirRadar] });
    }
    if (shipId === 548) {
      // 文月改二 => 22種
      cutInPreset.push({ id: 22, items: [specialMachineGun] });
    }
    if (shipId === 329 || shipId === 530) {
      // UIT-25 伊504 => 23種
      const weakMachineGun = Optimizer.getBestAAItem(ship, items, { apiTypeId: 21, maxAA: 8 });
      return [{ id: 22, items: [weakMachineGun] }];
    }
    if (shipId === 478) {
      // 龍田改二 => 24種
      const weakMachineGun = Optimizer.getBestAAItem(ship, items, { apiTypeId: 21, maxAA: 8 });
      cutInPreset.push({ id: 22, items: [gun, weakMachineGun] });
    }
    if ([82, 88, 553, 554].includes(shipId)) {
      // 伊勢型改 / 改二 => 25種, 28種
      const hunshin = items.find((v) => v.data.id === 274) ?? new Item();
      const sanshiki = Optimizer.getBestAAItem(ship, items, { apiTypeId: 18 });
      return [
        { id: 25, items: [antiAirRadar, sanshiki, hunshin] },
        { id: 28, items: [antiAirRadar, hunshin] },
      ];
    }
    if (shipId === 148) {
      // 武蔵改 => 28種
      const hunshin = items.find((v) => v.data.id === 274) ?? new Item();
      cutInPreset.push({ id: 28, items: [antiAirRadar, hunshin] });
    }
    if (shipId === 557 || shipId === 558) {
      // 磯風乙改 / 浜風乙改 => 29種
      cutInPreset.push({ id: 29, items: [gun, antiAirRadar] });
    }
    if (shipId === 477) {
      // 天龍改二 => 24種, 30種, 31種
      const gun1Index = items.findIndex((v) => v.data.id === gun.data.id && v.remodel === gun.remodel);
      // 2本目の高角砲探索(1本目の高角砲を間引く)
      const gun2 = Optimizer.getBestAAItem(ship, isStockMode ? items.filter((v, i) => i !== gun1Index) : items, { iconTypeId: 16 });
      const gun2Index = items.findIndex((v, i) => i !== gun1Index && v.data.id === gun2.data.id && v.remodel === gun2.remodel);
      // 3本目の高角砲探索(1, 2本目の高角砲を間引く)
      const gun3 = Optimizer.getBestAAItem(ship, isStockMode ? items.filter((v, i) => i !== gun1Index && i !== gun2Index) : items, { iconTypeId: 16 });
      const weakMachineGun = Optimizer.getBestAAItem(ship, items, { apiTypeId: 21, maxAA: 8 });
      return [
        { id: 24, items: [gun, weakMachineGun] },
        { id: 30, items: [gun, gun2, gun3] },
        { id: 31, items: [gun, gun2] },
      ];
    }
    if (shipId === 579 || shipId === 630) {
      // Gotland改以降 => 30種 (高角砲3), 33種 (高角砲, 素対空値4以上の機銃)
      const gun1Index = items.findIndex((v) => v.data.id === gun.data.id && v.remodel === gun.remodel);
      // 2本目の高角砲探索(1本目の高角砲を間引く)
      const gun2 = Optimizer.getBestAAItem(ship, isStockMode ? items.filter((v, i) => i !== gun1Index) : items, { iconTypeId: 16 });
      const gun2Index = items.findIndex((v, i) => i !== gun1Index && v.data.id === gun2.data.id && v.remodel === gun2.remodel);
      // 3本目の高角砲探索(1, 2本目の高角砲を間引く)
      const gun3 = Optimizer.getBestAAItem(ship, isStockMode ? items.filter((v, i) => i !== gun1Index && i !== gun2Index) : items, { iconTypeId: 16 });
      const machineGun = Optimizer.getBestAAItem(ship, items, { apiTypeId: 21, minAA: 4 });
      return [
        { id: 30, items: [gun, gun2, gun3] },
        { id: 33, items: [gun, machineGun] },
      ];
    }
    if (Const.GBR.includes(ship.data.type2) || (ship.data.type2 === 6 && ship.data.version >= 2)) {
      // 英国艦艇 / 金剛型改二以降 => 32種
      const mainGun = items.find((v) => v.data.id === 300) ?? new Item();
      const ponpon = items.find((v) => v.data.id === 191) ?? new Item();
      const rocketIndex = items.findIndex((v) => v.data.id === 301);
      const rocketLauncher = items[rocketIndex] ?? new Item();
      const rocketLauncher2 = items.find((v, i) => v.data.id === 301 && (isStockMode ? i !== rocketIndex : true)) ?? new Item();

      // のちの条件分岐で榛名改二乙があるため return しない
      cutInPreset.push({ id: 32, items: [mainGun, ponpon] });
      cutInPreset.push({ id: 32, items: [rocketLauncher, ponpon] });
      cutInPreset.push({ id: 32, items: [rocketLauncher, rocketLauncher2] });
    }
    if (ship.data.type2 === 91) {
      // Fletcher級 => 34種, 35種, 36種, 37種
      const GFCSGunIndex = items.findIndex((v) => v.data.id === 308) ?? new Item();
      const GFCSGun = items[GFCSGunIndex] ?? new Item();
      const GFCSGun2 = items.find((v, i) => v.data.id === 308 && (isStockMode ? i !== GFCSGunIndex : true)) ?? new Item();

      const gun5inchKaiIndex = items.findIndex((v) => v.data.id === 313) ?? new Item();
      const gun5inchKai = items[gun5inchKaiIndex] ?? new Item();
      const gun5inchKai2 = items.find((v, i) => v.data.id === 313 && (isStockMode ? i !== gun5inchKaiIndex : true)) ?? new Item();
      const gun5inchIndex = items.findIndex((v) => v.data.id === 284) ?? new Item();
      const gun5inch = items[gun5inchIndex] ?? new Item();
      const gun5inch2 = items.find((v, i) => v.data.id === 284 && (isStockMode ? i !== gun5inchIndex : true)) ?? new Item();
      const radarGFCSMk37 = items.find((v) => v.data.id === 307) ?? new Item();

      // あるやつから詰め込む
      const ci3637Items = [];
      if (gun5inchKai.data.id) ci3637Items.push(gun5inchKai);
      if (gun5inchKai2.data.id) ci3637Items.push(gun5inchKai2);
      if (ci3637Items.length < 2 && gun5inch.data.id) ci3637Items.push(gun5inch);
      if (ci3637Items.length < 2) ci3637Items.push(gun5inch2);

      return [
        { id: 34, items: [GFCSGun, GFCSGun2] },
        { id: 35, items: [GFCSGun, gun5inchKai] },
        { id: 36, items: ci3637Items.concat(radarGFCSMk37) },
        { id: 37, items: ci3637Items },
      ];
    }
    if (ship.data.type2 === 99) {
      // Atlanta級 => 38種, 39種, 40種, 41種
      const GFCS5inchIndex = items.findIndex((v) => v.data.id === 363) ?? new Item();
      const GFCS5inchGun = items[GFCS5inchIndex] ?? new Item();
      const GFCS5inchGun2 = items.find((v, i) => v.data.id === 363 && (isStockMode ? i !== GFCS5inchIndex : true)) ?? new Item();
      const gun5inchIndex = items.findIndex((v) => v.data.id === 362) ?? new Item();
      const gun5inch = items[gun5inchIndex] ?? new Item();
      const gun5inch2 = items.find((v, i) => v.data.id === 362 && (isStockMode ? i !== gun5inchIndex : true)) ?? new Item();
      const radarGFCSMk37 = items.find((v) => v.data.id === 307) ?? new Item();

      // あるやつから詰め込む
      const ci4041Items = [];
      if (GFCS5inchGun.data.id) ci4041Items.push(GFCS5inchGun);
      if (GFCS5inchGun2.data.id) ci4041Items.push(GFCS5inchGun2);
      if (ci4041Items.length < 2 && gun5inch.data.id) ci4041Items.push(gun5inch);
      if (ci4041Items.length < 2) ci4041Items.push(gun5inch2);

      return [
        { id: 38, items: [GFCS5inchGun, GFCS5inchGun2] },
        { id: 39, items: [GFCS5inchGun, gun5inch] },
        { id: 40, items: ci4041Items.concat(radarGFCSMk37) },
        { id: 41, items: ci4041Items },
      ];
    }
    if (shipId === 546 || shipId === 911 || shipId === 916) {
      // 大和型改二 => 26種, 42種, 43種, 44種, 45種
      const syuchu10cmIndex = items.findIndex((v) => v.data.id === 464) ?? new Item();
      const syuchu10cm = items[syuchu10cmIndex] ?? new Item();
      const syuchu10cm2 = items.find((v, i) => v.data.id === 464 && (isStockMode ? i !== syuchu10cmIndex : true)) ?? new Item();
      const yamatoRadar = items.find((v) => v.data.id === 460) ?? new Item();
      const yamatoRadar2 = items.find((v) => v.data.id === 142) ?? new Item();
      const ex10cmSecGun = items.find((v) => v.data.id === 275) ?? new Item();
      const machineGun = Optimizer.getBestAAItem(ship, items, { apiTypeId: 21, minAA: 6 });
      const ciItems = [syuchu10cm, yamatoRadar.data.id ? yamatoRadar : yamatoRadar2];
      return [
        { id: 26, items: [antiAirRadar, ex10cmSecGun] },
        { id: 42, items: ciItems.concat([machineGun, syuchu10cm2]) },
        { id: 43, items: ciItems.concat(syuchu10cm2) },
        { id: 44, items: ciItems.concat(machineGun) },
        { id: 45, items: ciItems },
      ];
    }
    if (shipId === 593) {
      // 榛名改二乙 => 46種 (35.6改三 or 改四, 対空電探, 特殊機銃)
      const gun356Kai4 = items.find((v) => v.data.id === 503) ?? new Item();
      const gun356Kai3 = items.find((v) => v.data.id === 502) ?? new Item();
      cutInPreset.push({ id: 46, items: [gun356Kai4.data.id ? gun356Kai4 : gun356Kai3, antiAirRadar, specialMachineGun] });
    }

    if (cutInPreset.length < 2) {
      // 汎用
      // 2本目の高角砲探索(1本目の高角砲を間引く)
      const specialGun = Optimizer.getBestAAItem(ship, items, { iconTypeId: 16, isSpecial: true });
      const gun1Index = items.findIndex((v) => v.data.id === specialGun.data.id && v.remodel === specialGun.remodel);
      const specialGun2 = Optimizer.getBestAAItem(ship, isStockMode ? items.filter((v, i) => i !== gun1Index) : items, { iconTypeId: 16, isSpecial: true });
      cutInPreset.push({ id: 5, items: [specialGun, specialGun2, antiAirRadar] });
      const kosha = Optimizer.getBestAAItem(ship, items, { apiTypeId: 36 });
      cutInPreset.push({ id: 7, items: [gun, antiAirRadar, kosha] });
      cutInPreset.push({ id: 8, items: [specialGun, antiAirRadar] });
      cutInPreset.push({ id: 9, items: [gun, kosha] });
      const machineGun = Optimizer.getBestAAItem(ship, items, { apiTypeId: 21, minAA: 3 });
      cutInPreset.push({ id: 12, items: [specialMachineGun, antiAirRadar, machineGun] });
      cutInPreset.push({ id: 13, items: [specialGun, antiAirRadar, specialMachineGun] });
    }

    return cutInPreset.filter((x) => x.items.some((y) => y.data.id));
  }

  /**
   * 条件に一致する装備可能な最高対空の装備を取得
   * @private
   * @static
   * @param {Ship} ship
   * @param {Item[]} allItems
   * @param {SearchCond} cond
   * @return {*}  {Item}
   * @memberof Optimizer
   */
  private static getBestAAItem(ship: Ship, allItems: Item[], cond: SearchCond): Item {
    // 種別で制限取得
    const items = allItems.filter((v) => {
      let value = true;
      if (cond.apiTypeId) value &&= v.data.apiTypeId === cond.apiTypeId;
      if (cond.iconTypeId) value &&= v.data.iconTypeId === cond.iconTypeId;
      if (cond.minAA) value &&= v.data.antiAir >= cond.minAA;
      if (cond.maxAA) value &&= v.data.antiAir <= cond.maxAA;
      if (cond.isSpecial) value &&= v.data.isSpecial;
      return value;
    });

    // このうち最も対空ボーナス合わせて性能が高いやつを取得
    let maxAntiAirBonus = 0;
    let maxAntiAirWeight = 0;
    let subMaxScore = 0;
    let returnItem = new Item();
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      const bonuses = Ship.getItemBonus(ship.data, [item]);
      // サブ性能 対空性能が同じだった場合はこっちで比較する用の保険
      const sumAABonus = sum(bonuses.map((v) => v.antiAir ?? 0));
      const score1 = item.antiAirBonus + (item.data.iconTypeId === 16 ? 50 : 10) * sumAABonus;
      const score2 = item.antiAirWeight + sumAABonus;
      const subScore = item.dayBattleFirePower + sum(bonuses.map((v) => v.firePower ?? 0));
      let decideFlag = false;

      if (score1 > maxAntiAirBonus) {
        // 艦隊防空ボーナスが高いなら
        decideFlag = true;
      } else if (score1 === maxAntiAirBonus && score2 > maxAntiAirWeight) {
        // 艦隊防空ボーナスは同じだけど加重対空が高いなら
        decideFlag = true;
      } else if (score1 === maxAntiAirBonus && score2 === maxAntiAirWeight && subScore > subMaxScore) {
        // 艦隊防空ボーナスも加重対空も同じなら火力
        decideFlag = true;
      }

      if (decideFlag) {
        maxAntiAirBonus = score1;
        maxAntiAirWeight = score2;
        subMaxScore = subScore;
        returnItem = item;
      }
    }

    return returnItem;
  }

  /**
   * 戦闘機を最適化した新しい艦隊データを返却
   * @static
   * @memberof Fleet
   */
  public static getOptimizedFighterFleet(ships: Ship[]): Ship[] {
    // 戦闘機を抽出
    const allFighterSlots: { shipIndex: number, slotIndex: number, slot: number }[] = [];
    const allFighters: Item[] = [];
    const allSPFighterSlots: { shipIndex: number, slotIndex: number, slot: number }[] = [];
    const allSPFighters: Item[] = [];

    for (let i = 0; i < ships.length; i += 1) {
      const ship = ships[i];
      if (ship.isEmpty || !ship.isActive) {
        continue;
      }
      for (let j = 0; j < ship.items.length; j += 1) {
        const item = ship.items[j];
        if (item.data.isFighter) {
          if (item.data.apiTypeId === 6) {
            // 艦戦
            allFighterSlots.push({ shipIndex: i, slotIndex: j, slot: item.fullSlot });
            allFighters.push(item);
          } else if (item.data.apiTypeId === 45) {
            // 水戦
            allSPFighterSlots.push({ shipIndex: i, slotIndex: j, slot: item.fullSlot });
            allSPFighters.push(item);
          }
        }
      }
    }

    // 搭載数の多い順にソート
    allFighterSlots.sort((a, b) => b.slot - a.slot);
    allSPFighterSlots.sort((a, b) => b.slot - a.slot);
    // 対空の高い順にソート
    allFighters.sort((a, b) => b.actualAntiAir - a.actualAntiAir);
    allSPFighters.sort((a, b) => b.actualAntiAir - a.actualAntiAir);

    // 艦戦 出撃対空順に、最大のスロットに埋めていく
    for (let i = 0; i < allFighters.length; i += 1) {
      const { shipIndex, slotIndex, slot } = allFighterSlots[i];
      ships[shipIndex].items[slotIndex] = new Item({ item: allFighters[i], slot });
    }
    // 水戦 出撃対空順に、最大のスロットに埋めていく
    for (let i = 0; i < allSPFighterSlots.length; i += 1) {
      const { shipIndex, slotIndex, slot } = allSPFighterSlots[i];
      ships[shipIndex].items[slotIndex] = new Item({ item: allSPFighters[i], slot });
    }

    // 装備群を再装備させる形で最インスタンス化
    const resultShips = [];
    for (let i = 0; i < ships.length; i += 1) {
      const ship = ships[i];
      resultShips.push(new Ship({ ship, items: ship.items }));
    }

    return resultShips;
  }

  /**
   * 与えられた計算に対して、所持データを反映させたFleetを返却する
   * @static
   * @param {Fleet[]} fleets ベースとなるFleet
   * @param {ShipStock[]} ships 在籍艦娘リスト
   * @param {ItemStock[]} items 所持装備リスト(副作用あり)
   * @param {boolean} toEmpty 置換モード trueなら、在庫がなかった場合にはずす
   * @return {*}  {Fleet[]}
   * @memberof Optimizer
   */
  public static reflectStockData(manager: CalcManager, ships: ShipStock[], items: ItemStock[], toEmpty: boolean): { airbaseInfo: AirbaseInfo, fleetInfo: FleetInfo } {
    /** ======= 基地データの反映 ======= */
    const { airbases } = manager.airbaseInfo;
    const newAirbases: Airbase[] = [];
    for (let i = 0; i < airbases.length; i += 1) {
      const airbase = airbases[i];
      // 装備のチェックをする
      const newItems: Item[] = [];
      for (let j = 0; j < airbase.items.length; j += 1) {
        newItems.push(Optimizer.getReflectedItem(airbase.items[j], items, toEmpty));
      }
      // 装備の精査が終わったので置き換え
      newAirbases.push(new Airbase({ airbase, items: newItems }));
    }

    /** ======= 艦隊データの反映 ======= */

    const { fleets } = manager.fleetInfo;
    const newFleets: Fleet[] = [];

    // 配備済み艦隊ユニークidリスト
    const usedShipUniqueIds: number[] = [];
    for (let i = 0; i < fleets.length; i += 1) {
      const fleet = fleets[i];
      const newShips: Ship[] = [];
      for (let j = 0; j < fleet.ships.length; j += 1) {
        const ship = fleet.ships[j];
        if (!ship.data.id) {
          // なんも中身がないならそのまま突っ込んで次
          newShips.push(ship);
          continue;
        }

        let newShip: Ship;
        // 現在の所持登録データから検索かつ、まだ配備されていないかどうかチェック
        const stockShips = ships.filter((v) => v.id === ship.data.id && !usedShipUniqueIds.includes(v.uniqueId));
        if (stockShips.length) {
          stockShips.sort((a, b) => {
            // ベースに海域がある場合
            if (ship.area) {
              // 札がそれぞれ違う
              if (a.area !== b.area) {
                // 一致していたものを優先
                if (a.area === ship.area) return -1;
                if (b.area === ship.area) return 1;
                // 札がついていないもの優先
                if (a.area === 0) return -1;
                if (b.area === 0) return 1;
              }
            }
            // レベルが高い順 => 運が高い順 => 札が若い順
            if (a.level !== b.level) return b.level - a.level;
            if (a.improvement.luck !== b.improvement.luck) return b.level - a.level;
            return a.area - b.area;
          });
          const stock = stockShips[0];
          // いたのでいったんステータス系を反映
          newShip = new Ship({
            ship,
            level: stock.level,
            hp: (stock.level > 99 ? ship.data.hp2 : ship.data.hp) + stock.improvement.hp,
            asw: Ship.getStatusFromLevel(stock.level, ship.data.maxAsw, ship.data.minAsw) + stock.improvement.asw,
            luck: ship.data.luck + stock.improvement.luck,
            area: stock.area,
            uniqueId: stock.uniqueId,
            releaseExpand: stock.releaseExpand,
          });
          // 配備済みとして記録
          usedShipUniqueIds.push(stock.uniqueId);
        } else if (toEmpty) {
          // いなかったら外す設定なので空データを突っ込む
          newShip = new Ship();
        } else {
          // いなかったら引き継ぐ設定だが、在庫なしプロパティを起動
          newShip = new Ship({ ship, noStock: true });
        }

        // 装備のチェックをする
        const newItems: Item[] = [];
        for (let k = 0; k < newShip.items.length; k += 1) {
          newItems.push(Optimizer.getReflectedItem(newShip.items[k], items, toEmpty));
        }
        // 補強増設
        const exItem = Optimizer.getReflectedItem(newShip.exItem, items, toEmpty, !newShip.releaseExpand);

        // 装備の精査も終わったのでやっと置き換えられる
        newShips.push(new Ship({
          ship: newShip, items: newItems, exItem, noStock: newShip.noStock,
        }));
      }

      // 艦隊再配備
      newFleets.push(new Fleet({ fleet, ships: newShips }));
    }

    return {
      airbaseInfo: new AirbaseInfo({ info: manager.airbaseInfo, airbases: newAirbases }),
      fleetInfo: new FleetInfo({ info: manager.fleetInfo, fleets: newFleets }),
    };
  }

  /**
   * 装備在庫より、装備を置換したものを返却する。
   * 在庫に存在すれば最も改修値の高いものを置き換える
   * 在庫に存在しなければ外すかそのまま
   * @private
   * @static
   * @param {Item} item ベース装備
   * @param {ItemStock[]} stock 装備在庫
   * @param {boolean} toEmpty trueならば存在しなかったときに空の装備を返却する
   * @param {boolean} noStock 手動エラー
   * @return {*}  {Item}
   * @memberof Optimizer
   */
  private static getReflectedItem(item: Item, stock: ItemStock[], toEmpty: boolean, noStock = false): Item {
    if (!item.data.id) {
      // 空の装備はそのまま
      return item;
    }
    const stockItem = stock.find((v) => v.id === item.data.id && v.num.some((remodel) => remodel > 0));
    if (stockItem) {
      let maxRemodel = 10;
      // 新型缶★7未満は特別対応 => ここで★7以上を用いると高速+が解除されるおそれがある
      // 実際は艦隊全体を俯瞰した、もう少しちゃんとした最適化処理がいる いつかやるかも
      if (item.data.id === 87 && item.remodel < 7) {
        maxRemodel = 6;
      }
      // 装備あった => 最も改修値が高いものをとってくる
      for (let remodel = maxRemodel; remodel >= 0; remodel -= 1) {
        if (stockItem.num[remodel]) {
          // 装備置き換え
          // 在庫から直で減らす concatしてるので大丈夫！
          stockItem.num[remodel] -= 1;
          return new Item({ item, remodel, noStock });
        }
      }
    } else if (toEmpty) {
      // なかったら外す設定なので空データ
      return new Item();
    }

    // それ以外はそのままだけど在庫なしエラーだけ出す。在庫なしエラーが出るのはここだけの特別対応！
    return new Item({ item, noStock: true });
  }
}
