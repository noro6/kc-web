import { padStart } from 'lodash';

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
   * 日本標準時時刻に変換
   * @static
   * @param {Date} date
   * @returns {Date}
   * @memberof Quest
   */
  private static toJSTDate(date: Date): Date {
    return new Date(date.getTime() + (new Date().getTimezoneOffset() + 9 * 60) * 60 * 1000);
  }

  /**
   * 任務のリセット日を返却
   * @param {Date} baseDate 算出基準日
   * @memberof Quest
   */
  public static getResetDateTime(quest: Quest, baseDate: Date): number {
    const today = Quest.toJSTDate(baseDate);
    // 現在月(1～12)
    const month = today.getMonth() + 1;

    let resetDateTime = 0;

    if (quest.type === 'Quarterly') {
      // 12月の更新日を超えているなら
      if (month > 11 && today.getDate() === 1 && today.getHours() >= 5) {
        // 来年の3月1日05:00:00
        resetDateTime = new Date(`${today.getFullYear() + 1}-03-01T05:00:00+0900`).getTime();
      } else {
        // 直近の [3,6,9,12]月 1日 05:00:00
        const nextResetMonth = month + (3 - (month % 3));
        resetDateTime = new Date(`${today.getFullYear()}-${padStart(`${nextResetMonth}`, 2, '0')}-01T05:00:00+0900`).getTime();
      }
    } else if (quest.type === 'Yearly') {
      // 実行日付と同じ年の更新時刻を過ぎているかどうか
      const thisYearClosingDateTime = new Date(`${today.getFullYear()}-${padStart(`${quest.resetMonth}`, 2, '0')}-01T05:00:00+0900`).getTime();
      if (today.getTime() < thisYearClosingDateTime) {
        // 過ぎていないなら、今年の更新月4:59:59
        resetDateTime = thisYearClosingDateTime;
      } else {
        // 過ぎているなら、来年の更新月4:59:59
        resetDateTime = new Date(`${today.getFullYear() + 1}-${padStart(`${quest.resetMonth}`, 2, '0')}-01T05:00:00+0900`).getTime();
      }
    }

    return resetDateTime;
  }

  /**
   * 任務の締日を返却
   * @param {Date} baseDate 算出基準日
   * @memberof Quest
   */
  public static getClosingDateTime(quest: Quest, baseDate: Date): number {
    // JSTにおける現在時刻を取得
    const today = Quest.toJSTDate(baseDate);
    // 現在月(1～12)
    const month = today.getMonth() + 1;
    const oneDayTime = 24 * 60 * 60 * 1000;

    let closingDateTime = 0;

    if (quest.type === 'Quarterly') {
      // 12月の更新日を超えているなら
      if (month > 11 && today.getDate() === 1 && today.getHours() >= 5) {
        // 来年の2月末 => 3月1日13:59:59から-24時間分
        closingDateTime = new Date(`${today.getFullYear() + 1}-03-01T13:59:59+0900`).getTime() - oneDayTime;
      } else {
        // 直近の2,5,8,11月末 => 直近の [3,6,9,12]月 1日 13:59:59から-24時間分
        const nextResetMonth = month + (3 - (month % 3));
        closingDateTime = new Date(`${today.getFullYear()}-${padStart(`${nextResetMonth}`, 2, '0')}-01T13:59:59+0900`).getTime() - oneDayTime;
      }
    } else if (quest.type === 'Yearly') {
      // 実行日付と同じ年のリセット時刻直前を過ぎているかどうか
      const thisYearClosingDateTime = new Date(`${today.getFullYear()}-${padStart(`${quest.resetMonth}`, 2, '0')}-01T05:00:00+0900`).getTime();
      if (today.getTime() < thisYearClosingDateTime) {
        // 過ぎていないなら、今年の更新月4:59:59
        closingDateTime = new Date(`${today.getFullYear()}-${padStart(`${quest.resetMonth}`, 2, '0')}-01T04:59:59+0900`).getTime();
      } else {
        // 過ぎているなら、来年の更新月4:59:59
        closingDateTime = new Date(`${today.getFullYear() + 1}-${padStart(`${quest.resetMonth}`, 2, '0')}-01T04:59:59+0900`).getTime();
      }
    }

    return closingDateTime;
  }
}
