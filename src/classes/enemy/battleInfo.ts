import { CELL_TYPE } from '../const';
import { MasterMap } from '../interfaces/master';
import EnemyFleet from './enemyFleet';

export interface BattleInfoBuilder {
  // eslint-disable-next-line no-use-before-define
  info?: BattleInfo | undefined;
  /** 艦隊一覧 */
  fleets?: EnemyFleet[];
  /** 空襲用敵艦隊 */
  airRaidFleet?: EnemyFleet;
  /** 戦闘回数 */
  battleCount?: number;
}

export default class BattleInfo {
  public readonly battleCount: number;

  /** 敵艦隊 戦闘の数だけ */
  public readonly fleets: EnemyFleet[];

  /** 防空用敵艦隊 */
  public readonly airRaidFleet: EnemyFleet;

  /** 計算済みフラグ */
  public calculated = false;

  /** 履歴に追加しなくてもいいフラグ */
  public ignoreHistory = false;

  constructor(builder: BattleInfoBuilder = {}) {
    if (builder.info) {
      this.battleCount = builder.battleCount !== undefined ? builder.battleCount : builder.info.battleCount;
      this.fleets = builder.fleets !== undefined ? builder.fleets.concat() : builder.info.fleets.concat();
      this.airRaidFleet = builder.airRaidFleet !== undefined ? builder.airRaidFleet : builder.info.airRaidFleet;
    } else {
      this.battleCount = builder.battleCount !== undefined ? builder.battleCount : 1;
      this.fleets = builder.fleets !== undefined ? builder.fleets.concat() : [];
      this.airRaidFleet = builder.airRaidFleet !== undefined ? builder.airRaidFleet : new EnemyFleet();
    }

    // 最低戦闘数チェック
    if (this.battleCount < 1) {
      this.battleCount = 1;
    }
    if (this.fleets.length > this.battleCount) {
      // 戦闘数まで減らす
      this.fleets = this.fleets.slice(0, this.battleCount);
    } else if (this.fleets.length < this.battleCount) {
      const sub = this.battleCount - this.fleets.length;
      for (let i = 0; i < sub; i += 1) {
        // 戦闘数まで敵艦隊を増やす
        this.fleets.push(new EnemyFleet());
      }
    }
  }

  /**
   * 設定された各戦闘での燃料 弾薬消費を取得
   * @param {MasterMap[]} maps
   * @returns {number[][]}
   * @memberof BattleInfo
   */
  public getResourceConsumptions(maps: MasterMap[]): number[][] {
    // 消費量を計算
    const consumptions: number[][] = [];
    for (let i = 0; i < this.fleets.length; i += 1) {
      const {
        cellType, isAllSubmarine, isAllPT, area, nodeName,
      } = this.fleets[i];
      const isBoss = maps.some((v) => v.area === area && v.boss.includes(nodeName));
      const world = area ? Math.floor(area / 10) : 1;
      if (cellType === CELL_TYPE.AIR_RAID) {
        // 空襲マス
        if (world === 6) {
          // 6-4 6-5
          consumptions.push([4, 8]);
        } else {
          consumptions.push([6, 4]);
        }
      } else if (isAllPT) {
        // 全員PTマス
        consumptions.push([4, 8]);
      } else if (cellType === CELL_TYPE.NIGHT) {
        // 開幕夜戦マス
        consumptions.push([10, 10]);
      } else if (isAllSubmarine && !isBoss && area !== 41 && area !== 43) {
        // 全員潜水艦(第4海域以外、ボス戦闘以外)
        consumptions.push([8, 0]);
      } else {
        // その他のマス
        consumptions.push([20, 20]);
      }
    }

    return consumptions;
  }
}
