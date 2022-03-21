/**
 * 装備プリセット
 * @export
 * @class ItemPreset
 */
export default class ItemPreset {
  /** id */
  public id = 0;

  /** プリセット名称 */
  public name = '';

  /** プリセット装備 */
  public itemIds = [] as number[];

  /** プリセット補強増設装備 */
  public exItemId = 0;
}
