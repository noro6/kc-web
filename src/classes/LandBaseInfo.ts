import { LB_MODE } from './Const';
import LandBase from './LandBase';

export default class LandBaseInfo {
  public readonly landBases: LandBase[];

  public readonly isDefense: boolean;

  public readonly defenseAirPower: number;

  constructor(isDefense = false, landBases: LandBase[] = []) {
    this.isDefense = isDefense;
    this.landBases = landBases;

    if (this.landBases.length < 3) {
      for (let i = 0; i < 3; i += 1) {
        this.landBases.push(new LandBase(i + 1, LB_MODE.WAIT));
      }
    }

    this.defenseAirPower = 0;
    for (let i = 0; i < this.landBases.length; i += 1) {
      this.defenseAirPower = this.landBases[i].defenseAirPower;
    }
  }
}
