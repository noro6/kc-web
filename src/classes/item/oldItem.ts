import Const from '../const';

/**
 * 旧シミュセーブデータ装備情報
 * @export
 * @class OldItem
 */
export default class OldItem {
  /** 装備id */
  public id = 0;

  /** 熟練度 */
  public level = 0;

  /** 改修値 */
  public remodel = 0;

  /** 搭載数 */
  public slot = 0;

  /** スロット位置 -1で補強増設 */
  public index = 0;

  /**
   * [0:id, 1:熟練, 2:改修値, 3:搭載数, 4:スロット位置, 5: スロットロック(任意、ロック済みtrue]
   * @param {number[]} data
   * @memberof OldItem
   */
  constructor(data: number[]) {
    this.id = data[0] ? +data[0] : 0;
    this.level = data[1] ? +data[1] : 0;
    this.remodel = data[2] ? +data[2] : 0;
    this.slot = data[3] ? +data[3] : 0;
    this.index = data[4] ? +data[4] : 0;

    // 熟練度変換
    if (this.level < Const.PROF_LEVEL_BORDER.length) {
      this.level = Const.PROF_LEVEL_BORDER[this.level];
    }
  }
}
