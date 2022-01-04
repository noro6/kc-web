export default class ItemMaster {
  public id = 0;

  public apiTypeId = 0;

  public iconTypeId = 0;

  public name = '';

  public abbr = '';

  public fire = 0;

  public torpedo = 0;

  public bomber = 0;

  public antiAir = 0;

  public armor = 0;

  public asw = 0;

  public antiBomer = 0;

  public accuracy = 0;

  public interception = 0;

  public avoid = 0;

  public scout = 0;

  public range = 0;

  public radius = 0;

  public cost = 0;

  public canRemodel = false;

  public avoidId = 0;

  public range2 = 0;

  public grow = 0;

  /**
   * Creates an instance of ItemMaster.
   * API取得rowよりクラスにマッピング
   * @param {(...(number | string)[])} row
   * @memberof ItemMaster
   */
  constructor(...row: (number | string)[]) {
    this.id = row[0] ? +row[0] : 0;
    this.apiTypeId = row[1] ? +row[1] : 0;
    this.iconTypeId = row[2] ? +row[2] : 0;
    this.name = row[3] ? row[3] as string : '';
    this.abbr = row[4] ? row[4] as string : '';
    this.fire = row[5] ? +row[5] : 0;
    this.torpedo = row[6] ? +row[6] : 0;
    this.bomber = row[7] ? +row[7] : 0;
    this.antiAir = row[8] ? +row[8] : 0;
    this.armor = row[9] ? +row[9] : 0;
    this.asw = row[10] ? +row[10] : 0;
    this.antiBomer = row[11] ? +row[11] : 0;
    this.accuracy = row[12] ? +row[12] : 0;
    this.interception = row[13] ? +row[13] : 0;
    this.avoid = row[14] ? +row[14] : 0;
    this.scout = row[15] ? +row[15] : 0;
    this.range = row[16] ? +row[16] : 0;
    this.radius = row[17] ? +row[17] : 0;
    this.cost = row[18] ? +row[18] : 0;
    this.canRemodel = row[19] > 0;
    this.avoidId = row[20] ? +row[20] : 0;
    this.range2 = row[21] ? +row[21] : 0;
    this.grow = row[22] ? +row[22] : 0;
  }
}
