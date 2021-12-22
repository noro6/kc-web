import EnemyFleet from './EnemyFleet';

export default class BattleInfo {
  public battleCount = 1;

  public fleets: EnemyFleet[];

  constructor() {
    this.fleets = [];
    this.fleets.push(new EnemyFleet());
  }
}
