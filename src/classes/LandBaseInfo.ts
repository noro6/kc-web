import LandBase from './LandBase';

export default class LandBaseInfo {
  public readonly id: number;

  public readonly landBases: LandBase[];

  constructor() {
    this.id = 1;
    this.landBases = [];
  }
}
