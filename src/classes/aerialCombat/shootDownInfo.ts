import Const, { Formation, AvoidType } from '../const';
import { ShipBase } from '../interfaces/shipBase';
import AntiAirCutIn from './antiAirCutIn';

export interface ShootDownStatus {
  antiAirWeightList: number[];
  rateDownList: number[];
  fixDownList: number[];
  minimumDownList: number[];
}

export default class ShootDownInfo {
  /**
   * 対空射撃回避区分毎の撃墜性能(固定 割合 最低保証)セット
   * @type {ShootDownStatus[]}
   * @memberof ShootDownInfo
   */
  public readonly shootDownStatusList: ShootDownStatus[];

  /** 発動可能ランダム域ボーダー */
  public readonly border: number;

  /** 対空砲火可能艦数 */
  public maxRange: number;

  constructor(ships: ShipBase[], isEnemy: boolean, isUnion: boolean, antiAirCutIn: AntiAirCutIn, border: number, formation?: Formation, isAirRaid = false) {
    if (formation) {
      this.shootDownStatusList = ShootDownInfo.getStage2(ships, isEnemy, isUnion, formation, antiAirCutIn, isAirRaid);
    } else {
      this.shootDownStatusList = ShootDownInfo.getStage2(ships, isEnemy, isUnion, Const.FORMATIONS[0], antiAirCutIn, isAirRaid);
    }
    this.maxRange = ships.length;
    this.border = border;
  }

  /**
   * stage2撃墜数テーブルを返却
   * @static
   * @param {(ShipBase[])} ships 艦船
   * @param {boolean} isEnemy 敵側式フラグ
   * @param {boolean} isUnion 連合フラグ
   * @param {Formation} [formation] 陣形 未指定で単縦
   * @param {AntiAirCutIn} [cutIn] 対空CI 未指定で不発
   * @param {boolean} [isAirRaid] 任意空襲 未指定でなし
   * @param {AvoidType} [avoid] 任意回避補正 未指定でなし
   * @return {*}  {ShootDownStatus[]}
   * @memberof ShootDownInfo
   */
  public static getStage2(ships: ShipBase[], isEnemy: boolean, isUnion: boolean, formation: Formation, cutIn: AntiAirCutIn, isAirRaid?: boolean, avoid?: AvoidType): ShootDownStatus[] {
    const stage2: ShootDownStatus[] = [];
    const shipCount = ships.length;
    if (shipCount === 0) {
      // 全てが0のデータ
      for (let i = 0; i < Const.AVOID_TYPE.length; i += 1) {
        stage2.push({
          antiAirWeightList: [0], fixDownList: [0], rateDownList: [0], minimumDownList: [0],
        });
      }
      return stage2;
    }
    for (let i = 0; i < Const.AVOID_TYPE.length; i += 1) {
      stage2.push({
        antiAirWeightList: [], fixDownList: [], rateDownList: [], minimumDownList: [],
      });
    }
    // 陣形補正
    const aj1 = formation.correction;

    // 艦隊防空ボーナス合計
    let sumAntiAirBonus = 0;
    for (let i = 0; i < shipCount; i += 1) {
      sumAntiAirBonus += ships[i].antiAirBonus;
    }
    sumAntiAirBonus = Math.floor(sumAntiAirBonus);
    // 艦隊防空 => 陣形補正 * 各艦の艦隊対空ボーナス合計
    const fleetAntiAir = sumAntiAirBonus * aj1;
    // 対空CI変動ボーナス
    const cutInBonus1 = cutIn.rateCorr;
    // 対空CI固定ボーナスA 敵側かつ不発なら0
    const cutInBonusA = isEnemy && cutIn.id === 0 ? 0 : cutIn.fixCorrA;
    // 対空CI固定ボーナスB
    const cutInBonusB = cutIn.fixCorrB;

    for (let i = 0; i < shipCount; i += 1) {
      const ship = ships[i];
      let sumAntiAirWeight = 0;
      let sumItemAntiAir = 0;

      // この艦娘の装備各値の合計
      for (let j = 0; j < ship.items.length; j += 1) {
        // 装備加重対空値の加算
        sumAntiAirWeight += ship.items[j].antiAirWeight;
        // 装備対空値の加算
        sumItemAntiAir += ship.items[j].data.antiAir;
      }
      // 補強増設の分を加算
      sumAntiAirWeight += ship.exItem.antiAirWeight;
      sumItemAntiAir += ship.exItem.data.antiAir;

      // 装備フィットボーナス(対空)
      const itemBonusAntiAir = ship.itemBonusStatus.antiAir ?? 0;

      // 連合艦隊補正
      let unionFactor = 1.0;
      if (isUnion && ship.isEscort) {
        unionFactor = 0.48;
      } else if (isUnion && !ship.isEscort) {
        unionFactor = 0.8;
        if (isAirRaid) {
          unionFactor = 0.72;
        }
      }

      // 敵味方航空戦補正(味方:0.8, 敵:0.75)
      const aerialCorr = isEnemy ? 0.75 : 0.8;

      // 各回避補正毎にテーブルを作成
      for (let j = 0; j < Const.AVOID_TYPE.length; j += 1) {
        // 対空射撃回避補正取得
        const avoidObj = Const.AVOID_TYPE[j];
        let avoid1 = avoidObj.c1;
        let avoid2 = avoidObj.c2;
        // 対空CI補正Aに掛かると思われる係数 加重対空補正と同等？
        // => 違いました。5 / 8 / 12種に対して、弱で0 中で1 強、超で3
        // 出典 https://x.com/Divinity_123/status/1721218795878879635
        let avoid3 = avoidObj.c3;
        // 対空CI補正Bに掛かると思われる係数
        // => 上の結果を踏まえ少なくとも 5 / 8 / 12種の結果は合うように調整
        let avoid4 = avoidObj.c4;

        if (j === Const.AVOID_TYPE.length - 1 && avoid) {
          // 任意の射撃回避補正値を置き換え
          avoid1 = avoid.c1;
          avoid2 = avoid.c2;
          avoid3 = avoid.c3;
          avoid4 = avoid.c4;
        }

        // 艦船加重対空値
        let antiAirWeight = 0;
        if (isEnemy) {
          // 艦船加重対空値(敵側式) => int((int(sqrt(素対空 + 装備対空)) + Σ(装備対空値 * 装備倍率)) * 対空射撃回避補正)
          antiAirWeight = Math.floor((Math.floor(Math.sqrt(ship.antiAir + sumItemAntiAir)) + sumAntiAirWeight) * avoid1);
        } else {
          // 艦船加重対空値(味方側式) => int(((素対空 / 2 + Σ(装備対空値 * 装備倍率)) + 装備対空ボーナス * 0.75) * 対空射撃回避補正)
          antiAirWeight = Math.floor(Math.floor(Math.floor(ship.antiAir / 2 + sumAntiAirWeight) + itemBonusAntiAir * 0.75) * avoid1);
        }
        // 加重対空格納
        stage2[j].antiAirWeightList.push(antiAirWeight);

        // 艦隊防空補正 => int(艦隊防空 * 対空射撃回避補正(艦隊防空ボーナス))
        const fleetAA = Math.floor(fleetAntiAir * avoid2);
        // 最終艦隊防空 => int(int(艦隊防空) / ブラウザ版補正(味方:1.3 敵1.0))
        const fleetAABonus = Math.floor(fleetAA) / (isEnemy ? 1 : 1.3);

        // 割合撃墜 => int(0.02 * 0.25 * 機数[あとで] * 艦船加重対空値 * 連合補正)
        stage2[j].rateDownList.push(0.02 * 0.25 * antiAirWeight * unionFactor);
        // 固定撃墜 => int((加重対空値 + int(最終艦隊防空 + 対空青字ボーナス * 0.6)) * 基本定数(0.25) * 敵味方航空戦補正 * 連合補正 * 対空CI変動ボーナス)
        stage2[j].fixDownList.push(Math.floor((antiAirWeight + Math.floor(fleetAABonus + itemBonusAntiAir * 0.6)) * 0.25 * aerialCorr * unionFactor * cutInBonus1));

        // 最低保証 => int(対空CI固定ボーナスA * 対空射撃補正A + 対空CI固定ボーナスB * 対空射撃補正B)
        const minimum = Math.floor(cutInBonusA * avoid3 + cutInBonusB * avoid4);
        // 最低保証
        stage2[j].minimumDownList.push(minimum);
      }
    }

    return stage2;
  }

  /**
  * 発動可能な対空CIを返却
  * @private
  * @return {*}  {AntiAirCutIn[]}
  */
  public static getAntiAirCutIn(ship: ShipBase): AntiAirCutIn[] {
    const cutInIds: number[] = [];
    // 装備一覧
    const items = ship.items.concat(ship.exItem);
    const {
      kokakuCount, specialKijuCount, specialKokakuCount, antiAirRadarCount, koshaCount, kijuCount,
    } = ship;
    // 艦型
    const { type2 } = ship.data;
    // 艦娘id
    const shipId = ship.data.id;
    // 高角砲の数
    const allKokaku = kokakuCount + specialKokakuCount;
    // 高角砲の有無
    const hasKokaku = allKokaku > 0;
    // 三式弾の有無
    const hasSanshiki = items.some((v) => v.data.apiTypeId === 18);

    if (type2 === 54) {
      // 秋月型
      // 電探
      const hasRadar = items.some((v) => v.data.iconTypeId === 11);
      // 1種 (高角砲2, 電探)
      if (allKokaku >= 2 && hasRadar) cutInIds.push(1);
      // 2種 (高角砲, 電探)
      if (hasKokaku && hasRadar) cutInIds.push(2);
      // 3種 (高角砲2) 共存なし
      if (allKokaku >= 2) cutInIds.push(3);
      // 48種 (初月砲2, 対空4以上の電探)
      if (items.filter((v) => v.data.id === 533).length >= 2 && items.some((v) => v.data.iconTypeId === 11 && v.data.antiAir >= 4)) cutInIds.push(48);
    } else if (shipId === 428) {
      // 摩耶様改二
      // 10種 (高角砲, 特殊機銃, 対空電探)
      if (hasKokaku && specialKijuCount && antiAirRadarCount) cutInIds.push(10);
      // 11種 (高角砲, 特殊機銃)
      if (hasKokaku && specialKijuCount) cutInIds.push(11);
    } else if (shipId === 141) {
      // 五十鈴改二
      // 14種 (高角砲, 対空機銃, 対空電探)
      if (hasKokaku && (kijuCount || specialKijuCount) && antiAirRadarCount) cutInIds.push(14);
      // 15種 (高角砲, 対空機銃)
      if (hasKokaku && (kijuCount || specialKijuCount)) cutInIds.push(15);
    } else if (shipId === 470 || shipId === 622) {
      // 霞改二乙 夕張改二
      // 16種 (高角砲, 対空機銃, 対空電探)
      if (hasKokaku && (kijuCount || specialKijuCount) && antiAirRadarCount) cutInIds.push(16);
      // 17種 (高角砲, 対空機銃)
      if (shipId === 470 && hasKokaku && (kijuCount || specialKijuCount)) cutInIds.push(17);
    } else if (shipId === 418) {
      // 皐月改二
      // 18種 (特殊機銃)
      if (specialKijuCount) cutInIds.push(18);
    } else if (shipId === 487) {
      // 鬼怒改二
      // 19種 (よわ高角砲, 特殊機銃)
      if (kokakuCount > 0 && specialKijuCount) cutInIds.push(19);
      // 20種 (特殊機銃)
      if (specialKijuCount) cutInIds.push(20);
    } else if (shipId === 488) {
      // 由良改二
      // 21種 (高角砲, 対空電探)
      if (hasKokaku && antiAirRadarCount) cutInIds.push(21);
    } else if (shipId === 548) {
      // 文月改二
      // 22種 (特殊機銃)
      if (specialKijuCount) cutInIds.push(22);
    } else if (shipId === 329 || shipId === 530) {
      // UIT-25 伊504
      // 23種 (通常機銃)
      if (kijuCount) cutInIds.push(23);
    } else if (shipId === 478) {
      // 龍田改二
      // 24種 (高角砲, 通常機銃)
      if (allKokaku && kijuCount) cutInIds.push(24);
    } else if ([82, 88, 553, 554].includes(shipId)) {
      // 伊勢型改 / 改二
      // 25種 (噴進砲改二, 対空電探, 三式弾)
      if (antiAirRadarCount && hasSanshiki && items.some((v) => v.data.id === 274)) cutInIds.push(25);
      // 28種 (噴進砲改二, 対空電探)
      if (antiAirRadarCount && items.some((v) => v.data.id === 274)) cutInIds.push(28);
    } else if (shipId === 148) {
      // 武蔵改
      // 28種 (噴進砲改二, 対空電探)
      if (antiAirRadarCount && items.some((v) => v.data.id === 274)) cutInIds.push(28);
    } else if (type2 === 52) {
      // 大淀
      // 27種 (10cm改+増設 対空電探)
      if (antiAirRadarCount && items.some((v) => v.data.id === 274) && items.some((v) => v.data.id === 275)) cutInIds.push(27);
    } else if (shipId === 557 || shipId === 558) {
      // 磯風乙改 / 浜風乙改
      // 29種 (高角砲, 対空電探)
      if (hasKokaku && antiAirRadarCount) cutInIds.push(29);
    } else if (shipId === 477) {
      // 天龍改二
      // 24種 (高角砲, 通常機銃)
      if (allKokaku && kijuCount) cutInIds.push(24);
      // 30種 (高角砲3)
      if (allKokaku >= 3) cutInIds.push(30);
      // 31種 (高角砲2)
      if (allKokaku >= 2) cutInIds.push(31);
    } else if (shipId === 579 || shipId === 630) {
      // Gotland改以降
      // 30種 (高角砲3)
      if (allKokaku >= 3) cutInIds.push(30);
      // 33種 (高角砲, 素対空値4以上の機銃)
      if (hasKokaku && items.some((v) => v.data.apiTypeId === 21 && v.data.antiAir >= 4)) cutInIds.push(33);
    } else if (Const.GBR.includes(type2) || (type2 === 6 && ship.data.version >= 2)) {
      // 英国艦艇 / 金剛型改二以降
      // 32種 (16inch Mk.I三連装砲改+FCR type284, QF 2ポンド8連装ポンポン砲)
      if (items.some((v) => v.data.id === 300) && items.some((v) => v.data.id === 191)) cutInIds.push(32);
      // 32種 (20連装7inch UP Rocket Launchers, QF 2ポンド8連装ポンポン砲)
      else if (items.some((v) => v.data.id === 301) && items.some((v) => v.data.id === 191)) cutInIds.push(32);
      // 32種 (20連装7inch UP Rocket Launchers, 20連装7inch UP Rocket Launchers)
      else if (items.filter((v) => v.data.id === 301).length >= 2) cutInIds.push(32);
    } else if (type2 === 91) {
      // Fletcher級
      const hasGFCSMk37 = items.some((v) => v.data.id === 307);
      // 34種 (5inch単装砲 Mk.30改+GFCS Mk.37, 5inch単装砲 Mk.30改+GFCS Mk.37)
      if (items.filter((v) => v.data.id === 308).length >= 2) cutInIds.push(34);
      // 35種 (5inch単装砲 Mk.30改+GFCS Mk.37, 5inch単装砲 Mk.30 / 改)
      if (items.some((v) => v.data.id === 308) && items.some((v) => v.data.id === 284 || v.data.id === 313)) cutInIds.push(35);
      // 36種 (5inch単装砲 Mk.30 / 改 2種, GFCS Mk.37)
      if (items.filter((v) => v.data.id === 284 || v.data.id === 313).length >= 2 && hasGFCSMk37) cutInIds.push(36);
      // 37種 (5inch単装砲 Mk.30改 2種)
      if (items.filter((v) => v.data.id === 313).length >= 2) cutInIds.push(37);
    } else if (type2 === 99) {
      // Atlanta級
      const GFCS5inchCount = items.filter((v) => v.data.id === 363).length;
      const normal5inchCount = items.filter((v) => v.data.id === 362).length;
      // 38種 (GFCS Mk.37+5inch連装両用砲(集中配備) x2)
      if (GFCS5inchCount >= 2) cutInIds.push(38);
      // 39種 (GFCS Mk.37+5inch連装両用砲(集中配備) と 5inch連装両用砲(集中配備) の両方が存在)
      if (GFCS5inchCount && normal5inchCount) cutInIds.push(39);
      // 40種 (GFCS Mk.37+5inch連装両用砲(集中配備) or 5inch連装両用砲(集中配備) の合計が2 + GFCS Mk.37)
      if (GFCS5inchCount + normal5inchCount >= 2 && items.some((v) => v.data.id === 307)) cutInIds.push(40);
      // 41種 (GFCS Mk.37+5inch連装両用砲(集中配備) or 5inch連装両用砲(集中配備) の合計が2)
      if (GFCS5inchCount + normal5inchCount >= 2) cutInIds.push(41);
    } else if ((shipId === 546 || shipId === 911 || shipId === 916)) {
      // 大和型改二
      const hasYamatoRadar = items.some((v) => v.data.id === 142 || v.data.id === 460);
      const hasMore6AAKiju = items.some((v) => v.data.apiTypeId === 21 && v.data.antiAir >= 6);
      const syuchu10cmCount = items.filter((v) => v.data.id === 464).length;
      // 26種 (大和型改二, 10cm改+増設, 対空電探)
      if (antiAirRadarCount && items.some((v) => v.data.id === 275)) cutInIds.push(26);
      // 28種 (噴進砲改二, 対空電探)
      if (shipId === 546 && antiAirRadarCount && items.some((v) => v.data.id === 274)) cutInIds.push(28);
      // 42種（大和電探 + 10cm高角砲集中配備 * 2 + 素対空値6以上の機銃）
      if (hasYamatoRadar && syuchu10cmCount >= 2 && hasMore6AAKiju) cutInIds.push(42);
      // 43種（大和電探 + 10cm高角砲集中配備 * 2）
      if (hasYamatoRadar && syuchu10cmCount >= 2) cutInIds.push(43);
      // 44種（大和電探 + 10cm高角砲集中配備 + 素対空値6以上の機銃）
      if (hasYamatoRadar && syuchu10cmCount && hasMore6AAKiju) cutInIds.push(44);
      // 45種（大和電探 + 10cm高角砲集中配備）
      if (hasYamatoRadar && syuchu10cmCount) cutInIds.push(45);
    } else if (type2 === 23 && ship.data.antiAir >= 70) {
      // 白露型対空70以上
      // 春雨砲所持
      const harusameGunCount = items.filter((v) => v.data.id === 529).length;
      // 25mm対空機銃増備
      const has25mmAAGun = items.some((v) => v.data.id === 505);
      // 対空4以上の電探所持
      const hasSPAntiAirRadar = items.some((v) => v.data.iconTypeId === 11 && v.data.antiAir >= 4);
      if (harusameGunCount >= 2 || (harusameGunCount && (hasSPAntiAirRadar || has25mmAAGun))) cutInIds.push(47);
    } else if (shipId === 979) {
      // 稲木改二
      // 17種 (高角砲, 対空機銃)
      if (hasKokaku && (kijuCount || specialKijuCount)) cutInIds.push(17);
      // 18種 (特殊機銃)
      if (specialKijuCount) cutInIds.push(18);
      // 31種 (高角砲2)
      if (allKokaku >= 2) cutInIds.push(31);
    } else if (shipId === 981 || shipId === 986 || shipId === 426) {
      // 藤波改二 / 吹雪改二 / 白雪改二
      // 49種 (特殊高角砲2, 対空電探)
      if (specialKokakuCount >= 2 && antiAirRadarCount) cutInIds.push(49);
    }
    if (shipId === 593) {
      // 榛名改二乙
      // 46種 (35.6改三 or 改四, 対空電探, 特殊機銃)
      if (specialKijuCount && antiAirRadarCount && items.some((v) => v.data.id === 502 || v.data.id === 503)) cutInIds.push(46);
    }
    if (shipId === 986 || shipId === 426 || type2 === 54) {
      // 吹雪改二 / 白雪改二 / 秋月型
      // 10cm連装高角砲改+高射装置改
      const aaGunCount = items.filter((v) => v.data.id === 533).length;
      // 10cm連装高角砲改
      const aaGun2Count = items.filter((v) => v.data.id === 553).length;
      // 94式高射装置
      const kosha94Count = items.filter((v) => v.data.id === 121).length;
      // 対空4以上の電探所持
      const hasSPAntiAirRadar = items.some((v) => v.data.iconTypeId === 11 && v.data.antiAir >= 4);
      // 50種 (10cm連装高角砲改どっちかx2, 対空4電探, 94高射装置)
      if (aaGunCount + aaGun2Count >= 2 && hasSPAntiAirRadar && kosha94Count) cutInIds.push(50);
      if (shipId === 986 || shipId === 426) {
        // 吹雪改二 / 白雪改二
        // 対空5以上の機銃所持
        const hasMore5AAKiju = items.some((v) => v.data.apiTypeId === 21 && v.data.antiAir >= 5);
        // 51種 (10cm連装高角砲改どっちか, 対空4電探, 対空5機銃)
        if ((aaGunCount || aaGun2Count) && hasSPAntiAirRadar && hasMore5AAKiju) cutInIds.push(51);
        // 52種 (10cm連装高角砲改2, 94高射装置)
        if (aaGun2Count >= 2 && kosha94Count) cutInIds.push(52);
      }
    }

    // 汎用
    // 全ての水上艦 => 判定できないが必須装備が潜水艦を弾ける
    // 戦艦 航空戦艦 => 判定できないが大口径主砲を積めるのが戦艦だけ

    // 4種 (大口径, 三式弾, 高射装置, 対空電探)
    if (items.some((v) => v.data.apiTypeId === 3) && hasSanshiki && koshaCount && antiAirRadarCount) cutInIds.push(4);
    // 5種 (特殊高角砲2, 対空電探, 秋月型以外)
    if (specialKokakuCount >= 2 && antiAirRadarCount && type2 !== 54) cutInIds.push(5);
    // 6種 (大口径, 三式弾, 高射装置)
    if (items.some((v) => v.data.apiTypeId === 3) && hasSanshiki && koshaCount) cutInIds.push(6);
    // 7種 (高角砲, 高射装置, 対空電探, 秋月型以外)
    if (hasKokaku && koshaCount && antiAirRadarCount && type2 !== 54) cutInIds.push(7);
    // 8種 (特殊高角砲, 対空電探, 秋月型以外)
    if (specialKokakuCount && antiAirRadarCount && type2 !== 54) cutInIds.push(8);
    // 9種 (高角砲, 高射装置)
    if (hasKokaku && koshaCount) cutInIds.push(9);
    // 12種 (特殊機銃, 素対空値3以上の機銃, 対空電探)
    if (specialKijuCount && items.filter((v) => v.data.apiTypeId === 21 && v.data.antiAir >= 3).length >= 2 && antiAirRadarCount) cutInIds.push(12);
    // 13種 (特殊機銃, 特殊高角砲, 対空電探, 摩耶改二以外)
    if (specialKijuCount && specialKokakuCount && antiAirRadarCount && shipId !== 428) cutInIds.push(13);

    // マスタより、対空CIオブジェクトを格納
    const antiAirCutIns: AntiAirCutIn[] = [];
    for (let i = 0; i < cutInIds.length; i += 1) {
      const cutinId = cutInIds[i];
      const cutIn = Const.ANTI_AIR_CUTIN.find((v) => v.id === cutinId);
      if (!cutIn) continue;

      const rate = cutIn.rate / 101;
      antiAirCutIns.push(new AntiAirCutIn(cutIn.id, cutIn.rateBonus, cutIn.c1, cutIn.c2, rate));
    }
    return antiAirCutIns;
  }
}
