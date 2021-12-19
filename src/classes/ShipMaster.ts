export default class ShipMaster {
  public id = 0;

  public albumId = 0;

  public name = '';

  public type = 0;

  public type2 = 0;

  public slotCount = 0;

  public slot1 = 0;

  public slot2 = 0;

  public slot3 = 0;

  public slot4 = 0;

  public slot5 = 0;

  public version = 0;

  public isFinal = false;

  public originalId = 0;

  public range = 0;

  public hp = 0;

  public hp2 = 0;

  public maxHp = 0;

  public fire = 0;

  public torpedo = 0;

  public antiAir = 0;

  public armor = 0;

  public luck = 0;

  public maxLuck = 0;

  public minScout = 0;

  public maxScout = 0;

  public minAsw = 0;

  public maxAsw = 0;

  public minAvoid = 0;

  public maxAvoid = 0;

  /**
   * Creates an instance of ShipMaster.
   * API取得rowよりクラスにマッピング
   * @param {(...(number | string)[])} row
   * @memberof ShipMaster
   */
  constructor(...row: (number | string)[]) {
    this.id = row[0] ? +row[0] as number : 0;
    this.albumId = row[1] ? +row[1] as number : 0;
    this.name = row[2] ? row[2] as string : '';
    this.type = row[3] ? +row[3] as number : 0;
    this.type2 = row[4] ? +row[4] as number : 0;
    this.slotCount = row[5] ? +row[5] as number : 0;
    this.slot1 = row[6] ? +row[6] as number : 0;
    this.slot2 = row[7] ? +row[7] as number : 0;
    this.slot3 = row[8] ? +row[8] as number : 0;
    this.slot4 = row[9] ? +row[9] as number : 0;
    this.slot5 = row[10] ? +row[10] as number : 0;
    this.version = row[11] ? +row[11] as number : 0;
    this.isFinal = !!row[12];
    this.originalId = row[13] ? +row[13] as number : 0;
    this.range = row[14] ? +row[14] as number : 0;
    this.hp = row[15] ? +row[15] as number : 0;
    this.hp2 = row[16] ? +row[16] as number : 0;
    this.maxHp = row[17] ? +row[17] as number : 0;
    this.fire = row[18] ? +row[18] as number : 0;
    this.torpedo = row[19] ? +row[19] as number : 0;
    this.antiAir = row[20] ? +row[20] as number : 0;
    this.armor = row[21] ? +row[21] as number : 0;
    this.luck = row[22] ? +row[22] as number : 0;
    this.maxLuck = row[23] ? +row[23] as number : 0;
    this.minScout = row[24] ? +row[24] as number : 0;
    this.maxScout = row[25] ? +row[25] as number : 0;
    this.minAsw = row[26] ? +row[26] as number : 0;
    this.maxAsw = row[27] ? +row[27] as number : 0;
    this.minAvoid = row[28] ? +row[28] as number : 0;
    this.maxAvoid = row[29] ? +row[29] as number : 0;
  }
}
