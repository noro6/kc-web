import BattleInfo from './BattleInfo';
import FleetInfo from './FleetInfo';
import LandBaseInfo from './LandBaseInfo';

export default class CalcManager {
  public landBaseInfo: LandBaseInfo;

  public battleInfo: BattleInfo;

  public fleetInfo: FleetInfo;

  constructor() {
    this.landBaseInfo = new LandBaseInfo();
    this.battleInfo = new BattleInfo();
    this.fleetInfo = new FleetInfo();
  }
}
