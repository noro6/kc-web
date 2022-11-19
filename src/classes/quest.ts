export interface QuestRequireBattle {
  area: string;
  rank: string;
  isComplete: boolean;
}

export default class Quest {
  /** id */
  public id = '';

  /** 任務名称 */
  public name = '';

  /** 任務対応 */
  public type: 'Once' | 'Quarterly' | 'Yearly' = 'Once';

  /** 報酬 燃料 */
  public fuel = 0;

  /** 報酬 弾薬 */
  public ammo = 0;

  /** 報酬 鋼材 */
  public steel = 0;

  /** 報酬 ボーキサイト */
  public bauxite = 0;

  /** 報酬 戦果 */
  public rankingPoint = 0;

  /** 要求海域 */
  public requires: QuestRequireBattle[] = [];

  /** 消化済み */
  public isCompleted = false;

  /**
   * 達成されている海域の数
   * @readonly
   * @type {number}
   * @memberof Quest
   */
  public get getCompletedCount(): number {
    return this.requires.filter((v) => v.isComplete).length;
  }

  /**
   * 達成度(%)を返却
   * @readonly
   * @type {number}
   * @memberof Quest
   */
  public get getProgressValue(): number {
    return Math.floor(100 * (this.getCompletedCount / this.requires.length));
  }
}
