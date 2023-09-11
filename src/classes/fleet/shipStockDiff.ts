import ShipStock from './shipStock';

/**
 * 在籍艦娘情報
 * @export
 * @class ShipStock
 */
export default class ShipStockDiff {
  /** 新規で配属された方々 */
  public newcomers: ShipStock[] = [];

  /** ステータスの差分があった方々 格納されるのは過去の状態 */
  public diffs: ShipStock[] = [];

  /** 除籍された方々 */
  public expulsionShips: ShipStock[] = [];
}
