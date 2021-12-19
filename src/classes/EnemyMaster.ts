export default class EnemyMaster {
  public id = 0;

  public name = '';

  public type = 0;

  public hp = 0;

  public antiAir = 0;

  public armor = 0;

  public slotCount = 0;

  public slots: number[];

  public items: number[];

  public isLandBase = false;

  /**
   * Creates an instance of ItemMaster.
   * API取得rowよりクラスにマッピング
   * @param {(...(number | string)[])} row
   * @memberof EnemyMaster
   */
  constructor(...row: (number | string)[]) {
    this.id = row[0] ? +row[0] : 0;
    this.name = row[1] ? row[1] as string : '';
    this.type = row[2] ? +row[2] : 0;
    this.hp = row[3] ? +row[3] : 0;
    this.antiAir = row[4] ? +row[4] : 0;
    this.armor = row[5] ? +row[5] : 0;
    this.slotCount = row[6] ? +row[6] : 0;
    const slot1 = row[7] ? +row[7] : 0;
    const slot2 = row[8] ? +row[8] : 0;
    const slot3 = row[9] ? +row[9] : 0;
    const slot4 = row[10] ? +row[10] : 0;
    const slot5 = row[11] ? +row[11] : 0;
    const item1 = row[12] ? +row[12] : 0;
    const item2 = row[13] ? +row[13] : 0;
    const item3 = row[14] ? +row[14] : 0;
    const item4 = row[15] ? +row[15] : 0;
    const item5 = row[16] ? +row[16] : 0;
    this.isLandBase = +row[17] > 0;

    this.slots = [slot1, slot2, slot3, slot4, slot5];
    this.items = [item1, item2, item3, item4, item5];
  }
}
