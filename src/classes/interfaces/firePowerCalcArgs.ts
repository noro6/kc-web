/**
 * 航空戦火力計算に必要な引数群
 * @export
 * @interface FirePowerCalcArgs
 */
export interface FirePowerCalcArgs {
  /** クリティカルかどうか */
  isCritical: boolean;
  /** クリティカル時補正 隊長機等による熟練度ボーナス */
  criticalBonus: number;
  /** 触接補正 */
  contactBonus: number;
  /** 陸上偵察機補正 */
  rikuteiBonus: number;
  /** 連合艦隊補正 */
  unionBonus: number;
  /** その他特効補正 */
  specialBonus: number;
  /** キャップ前補正 */
  beforCapBonus: number;
  /** キャップ後補正 */
  afterCapBonus: number;
  /** 雷装ボーナス(装備フィットによる) */
  torpedoBonus: number;
}
