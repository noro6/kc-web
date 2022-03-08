import OldItem from '../item/oldItem';

/**
 * 旧シミュセーブデータ艦娘情報
 * @export
 * @class OldShip
 */
export default class OldShip {
  /** 図鑑id */
  public albumId = 0;

  /** 旧装備配列 */
  public items: OldItem[] = [];

  /** 改修値 */
  public index: number;

  /** 練度 */
  public level: number;

  /** 有効無効 */
  public isActive = false;

  /** 運 */
  public luck?: number;

  /** 連合フラグ */
  public isUnion: boolean;

  /** 遊撃フラグ */
  public isYugeki: boolean;

  /**
   * 艦隊: [0:id, 1: Item配列, 2: 配属位置, 3:無効フラグ, 4:練度, 5:艦隊タイプ(通常0 連合1 遊撃2), 6:運, 7:海域]
   * @param {any} data
   * @memberof OldItem
   */
  /* eslint-disable-next-line */
  constructor(data: any) {
    this.albumId = data[0] ? +data[0] : 0;
    // 装備
    for (let i = 0; i < data[1].length; i += 1) {
      this.items.push(new OldItem(data[1][i]));
    }
    this.index = data[2] ? +data[2] : 0;
    this.isActive = !data[3];
    this.level = data[4] ? +data[4] : 99;
    this.isUnion = +data[5] === 1;
    this.isYugeki = +data[5] === 2;
    this.luck = data[6] ? +data[6] : undefined;
  }
}
