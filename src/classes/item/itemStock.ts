/**
 * 所持装備情報
 * @export
 * @class ItemStock
 */
export default class ItemStock {
  /** 装備id */
  public id = 0;

  /** 改修値別所持数 */
  public num = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

  constructor(id: number, remodel = -1) {
    this.id = id;
    if (remodel >= 0 && remodel < this.num.length) {
      this.num[remodel] = 1;
    }
  }
}
