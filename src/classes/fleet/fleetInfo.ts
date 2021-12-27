import Fleet from './fleet';

export interface FleetInfoBuilder {
  // eslint-disable-next-line no-use-before-define
  info?: FleetInfo | undefined;
  /** 艦隊一覧 */
  fleets?: Fleet[];
  /** 連合フラグ */
  isUnion?: boolean;
  /** 司令部レベル */
  admiralLevel?: number;
}

export default class FleetInfo {
  /** 艦隊一覧 */
  public readonly fleets: Fleet[];

  /** 連合艦隊？ */
  public readonly isUnion: boolean;

  /** 司令部レベル */
  public readonly admiralLevel: number;

  constructor(builder: FleetInfoBuilder = {}) {
    if (builder.info) {
      this.isUnion = builder.isUnion !== undefined ? builder.isUnion : builder.info.isUnion;
      this.admiralLevel = builder.admiralLevel !== undefined ? builder.admiralLevel : builder.info.admiralLevel;

      this.fleets = builder.fleets !== undefined ? builder.fleets : builder.info.fleets.concat();
    } else {
      this.isUnion = builder.isUnion !== undefined ? builder.isUnion : false;
      this.admiralLevel = builder.admiralLevel !== undefined ? builder.admiralLevel : 120;

      this.fleets = builder.fleets !== undefined ? builder.fleets : [];
    }

    const fleetCount = this.fleets.length;
    if (fleetCount < 5) {
      // 第5艦隊まで作成 第5艦隊は友軍として扱う
      for (let i = 0; i < 5 - fleetCount; i += 1) {
        this.fleets.push(new Fleet());
      }
    }
  }

  /**
   * 指定艦隊の索敵スコアを分岐点係数毎に取得 係数は第2引数の値だけ増やせる
   * @param {number} fleetIndex 艦隊番号
   * @param {number} [cCount=4] 分岐点係数 デフォルト4
   * @returns {number[]}
   * @memberof FleetInfo
   */
  public getScoutScore(fleetIndex: number, cCount = 4): number[] {
    // Σ(√艦娘の素の索敵値) + Σ{(装備の素の索敵値 + 改修係数×√★)×装備係数}×分岐点係数 - ⌈艦隊司令部Lv.×司令部補正係数⌉ + 2×(6 - 分岐点に到達した際の隻数)
    const scoutScores = [];
    const fleet = this.fleets[fleetIndex];
    const block3 = this.admiralLevel * 0.4;
    const ships = fleet.ships.filter((v) => v.isActive && v.data.id > 0);

    // 分岐点係数
    for (let i = 1; i <= cCount; i += 1) {
      let block1 = 0;
      let block2 = 0;
      for (let j = 0; j < ships.length; j += 1) {
        const ship = ships[j];
        // Σ(√艦娘の素の索敵値)
        block1 += Math.sqrt(ship.scout + ship.bonusScout);
        // Σ{(装備の素の索敵値 + 改修係数×√★)×装備係数}×分岐点係数
        block2 += ship.itemsScout * i;
      }
      scoutScores.push(block1 + block2 - Math.ceil(block3) + (2 * (6 - ships.length)));
    }

    return scoutScores;
  }
}
