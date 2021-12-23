import EnemyFleet from './EnemyFleet';

export default class BattleInfo {
  public readonly battleCount: number;

  public readonly fleets: EnemyFleet[];

  constructor(fleets: EnemyFleet[] = [], battleCount = 1) {
    this.battleCount = battleCount;
    this.fleets = fleets.concat();

    if (this.fleets.length > battleCount) {
      // 戦闘数まで減らす
      this.fleets = this.fleets.slice(0, battleCount);
    } else if (this.fleets.length < battleCount) {
      const sub = battleCount - this.fleets.length;
      for (let i = 0; i < sub; i += 1) {
        // 戦闘数まで敵艦隊を増やす
        this.fleets.push(new EnemyFleet());
      }
    }
  }
}
