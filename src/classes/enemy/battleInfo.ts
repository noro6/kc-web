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
}
