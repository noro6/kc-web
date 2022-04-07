import Convert from '../convert';

/**
 * 共有URL発行履歴
 * @export
 * @class OutputHistory
 */
export default class OutputHistory {
  /** id */
  public id = 0;

  /** 編成キー */
  public key = '';

  /** メモ */
  public remarks = '';

  /** 作成日付 */
  public createdAt = Convert.formatDate(new Date(), 'yyyy/MM/dd HH:mm:ss');
}
