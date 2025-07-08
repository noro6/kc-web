export interface PresetItem {
  /** 装備id */
  id: number;
  /** 改修値 */
  remodel: number;
  /** 理想id */
  assumedId?: number;
}

/**
 * 旧装備プリセットデータ構造
 * @interface OldItemPreset
 */
export interface OldItemPreset {
  /** id */
  id: number;

  /** プリセット名称 */
  name: string;

  /** プリセット装備 */
  itemIds: number[];

  /** プリセット補強増設装備 */
  exItemId: number;
}

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
  public items = [] as PresetItem[];

  /** プリセット補強増設装備 */
  public exItem: PresetItem = { id: 0, remodel: 0 };

  /** 足りないかどうか */
  public isLack = false;

  /**
   * 旧プリセデータを変換
   * @static
   * @param {OldItemPreset[]} oldPresets
   * @return {*}  {ItemPreset[]}
   * @memberof ItemPreset
   */
  public static convertOldItemPresets(oldPresets: (ItemPreset | OldItemPreset)[]): ItemPreset[] {
    if (!oldPresets || !oldPresets.length) {
      return [];
    }
    const presets: ItemPreset[] = [];
    for (let i = 0; i < oldPresets.length; i += 1) {
      const old = oldPresets[i];
      if ('items' in old && 'exItem' in old) {
        const preset = new ItemPreset();
        preset.id = old.id;
        preset.name = old.name;
        preset.items = old.items;
        preset.exItem = old.exItem;
        presets.push(preset);
      } else if ('itemIds' in old && 'exItemId' in old) {
        const newPreset = new ItemPreset();
        newPreset.id = old.id;
        newPreset.name = old.name;
        for (let j = 0; j < old.itemIds.length; j += 1) {
          newPreset.items.push({ id: old.itemIds[j], remodel: 0 });
        }
        newPreset.exItem = { id: old.exItemId, remodel: 0 };
        presets.push(newPreset);
      }
    }

    return presets;
  }
}
