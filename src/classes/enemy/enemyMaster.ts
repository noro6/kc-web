import { MasterEnemy } from '../interfaces/master';

export default class EnemyMaster {
  public id = 0;

  public name = '';

  public type = 0;

  public type2 = 0;

  public version = 0;

  public hp = 0;

  public antiAir = 0;

  public armor = 0;

  public slotCount = 0;

  public slots: number[] = [];

  public items: number[] = [];

  public isLandBase = false;

  public isUnknown = false;

  /**
   * Creates an instance of EnemyMaster.
   * @param {MasterEnemy} enemy
   * @memberof EnemyMaster
   */
  constructor(enemy?: MasterEnemy) {
    if (enemy) {
      this.id = enemy.id ? +enemy.id : 0;
      this.name = enemy.name ? enemy.name : '';
      this.type = enemy.type ? +enemy.type : 0;
      this.hp = enemy.hp ? +enemy.hp : 0;
      this.antiAir = enemy.aa ? +enemy.aa : 0;
      this.armor = enemy.armor ? +enemy.armor : 0;
      this.slotCount = enemy.slot_count ? +enemy.slot_count : 0;
      this.isLandBase = !!enemy.landbase;
      this.isUnknown = !!enemy.unknown;

      this.slots = enemy.slots ? enemy.slots : [];
      this.items = enemy.items ? enemy.items : [];
    }
  }
}
