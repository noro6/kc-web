import { MasterItem } from '../interfaces/master';

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

  public grow = 0;

  public isSpecial = false;

  /**
   * Creates an instance of ItemMaster.
   * API取得itemよりクラスにマッピング
   * @param {(...(number | string)[])} item
   * @memberof ItemMaster
   */
  constructor(item?: MasterItem) {
    if (item) {
      this.id = item.id ? item.id : 0;
      this.apiTypeId = item.type ? +item.type : 0;
      this.iconTypeId = item.itype ? +item.itype : 0;
      this.name = item.name ? item.name : '';
      this.abbr = item.abbr ? item.abbr : '';
      this.fire = item.fire ? +item.fire : 0;
      this.torpedo = item.torpedo ? +item.torpedo : 0;
      this.bomber = item.bomber ? +item.bomber : 0;
      this.antiAir = item.antiAir ? +item.antiAir : 0;
      this.armor = item.armor ? +item.armor : 0;
      this.asw = item.asw ? +item.asw : 0;
      this.antiBomer = item.antiBomber ? +item.antiBomber : 0;
      this.accuracy = item.accuracy ? +item.accuracy : 0;
      this.interception = item.interception ? +item.interception : 0;
      this.avoid = item.avoid2 ? +item.avoid2 : 0;
      this.scout = item.scout ? +item.scout : 0;
      this.range = item.range ? +item.range : 0;
      this.radius = item.radius ? +item.radius : 0;
      this.cost = item.cost ? +item.cost : 0;
      this.canRemodel = !!item.canRemodel;
      this.avoidId = item.avoid ? +item.avoid : 0;
      this.grow = item.grow ? +item.grow : 0;
    }

    // 特殊機銃 特殊高角砲判定
    this.isSpecial = (this.apiTypeId === 21 && this.antiAir > 8) || (this.iconTypeId === 16 && this.antiAir > 7);
  }
}
