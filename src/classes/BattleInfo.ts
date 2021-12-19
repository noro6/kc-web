import EnemyFleet from './EnemyFleet';

export default class BattleInfo {
  public battleCount = 1;

  public fleets: EnemyFleet[];

  constructor() {
    this.fleets = [];
    for (let i = 0; i < 10; i += 1) {
      this.fleets.push(new EnemyFleet());
    }
  }
}
