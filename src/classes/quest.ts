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

  /** 任務リセット月(年次作戦のみ利用) 1 ～ 12 */
  public resetMonth = 6;

  /** 任務締日 */
  public closingDateTime = 0;

  /** 任務リセット日 */
  public resetDateTime = 0;

  /** 達成日 */
  public completedDate = 0;

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

  /**
   * 強制日本標準時時刻作成
   * @static
   * @param {Date} date
   * @returns {Date}
   * @memberof Quest
   */
  public static createJSTDate(date: Date): Date {
    return new Date(date.getTime() + (new Date().getTimezoneOffset() + 9 * 60) * 60 * 1000);
  }

  /**
   * 任務のリセット日を返却
   * @param {Date} baseDate 算出基準日
   * @memberof Quest
   */
  public setResetDateTime(baseDate: Date): void {
    const today = Quest.createJSTDate(baseDate);
    const month = today.getMonth();

    if (this.type === 'Quarterly') {
      if (month % 3 === 2 && today.getDate() === 1 && today.getHours() <= 4) {
        // 本日の5:00:00更新
        this.resetDateTime = Quest.createJSTDate(new Date(today.getFullYear(), month, 1, 5, 0, 0)).getTime();
      } else {
        // 次回更新月の5:00:00更新
        this.resetDateTime = Quest.createJSTDate(new Date(today.getFullYear(), month + 2 - ((month + 1) % 3) + 1, 1, 5, 0, 0)).getTime();
      }
    } else if (this.type === 'Yearly') {
      const resetMonth = this.resetMonth - 1;
      const thisYearResetDate = Quest.createJSTDate(new Date(today.getFullYear(), resetMonth, 1, 5, 0, 0)).getTime();
      if (today.getTime() < thisYearResetDate) {
        // 今年の 6/1 4:59:59までに任務達成していたら今年の 6/1 5:00:00
        this.resetDateTime = thisYearResetDate;
      } else {
        // 上記を超えていたら、来年の 6/1 5:00:00
        this.resetDateTime = Quest.createJSTDate(new Date(today.getFullYear() + 1, resetMonth, 1, 5, 0, 0)).getTime();
      }
    } else {
      this.resetDateTime = 0;
    }
  }

  /**
   * 任務の締日を返却
   * @param {Date} baseDate 算出基準日
   * @memberof Quest
   */
  public setClosingDateTime(baseDate: Date): void {
    const today = Quest.createJSTDate(baseDate);
    const month = today.getMonth();

    if (this.type === 'Quarterly') {
      // 2,5,8,11の月末 13:59締日
      this.closingDateTime = Quest.createJSTDate(new Date(today.getFullYear(), month + 2 - ((month + 1) % 3) + 1, 0, 13, 59, 59)).getTime();
    } else if (this.type === 'Yearly') {
      const resetMonth = this.resetMonth - 1;
      // 実行日付と同じ年の5月末を過ぎているかどうか
      const thisYearClosingDateTime = Quest.createJSTDate(new Date(today.getFullYear(), resetMonth, 1, 4, 59, 59)).getTime();
      if (today.getTime() < thisYearClosingDateTime) {
        // 過ぎていないなら、今年の更新月4:59:59
        this.closingDateTime = thisYearClosingDateTime;
      } else {
        // 過ぎているなら、来年の更新月4:59:59
        this.closingDateTime = Quest.createJSTDate(new Date(today.getFullYear() + 1, resetMonth, 1, 4, 59, 59)).getTime();
      }
    } else {
      this.closingDateTime = 0;
    }
  }
}
