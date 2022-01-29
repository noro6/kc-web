import { AIR_STATE } from './const';

export default class CommonCalc {
  /**
   * 引数の制空値から各制空状態のボーダー制空値を返却
   * @static
   * @param {number} airPower
   * @returns {number[]}
   * @memberof Calculator
   */
  public static getAirStatusBorder(airPower: number): number[] {
    if (airPower === 0) {
      return [0, 0, 0, 0, 0];
    }
    return [
      airPower * 3,
      Math.ceil(airPower * 1.5),
      Math.floor(airPower / 1.5) + 1,
      Math.floor(airPower / 3) + 1,
      0,
    ];
  }

  /**
   * 航空戦 stage1 撃墜数を取得 取得後、整数で丸めること
   * @static
   * @param {number} state 制空状態 0 | 1 | 2 | 3 | 4
   * @param {number} slot 撃墜前搭載数
   * @return {number} 撃墜数
   * @memberof Calculator
   */
  public static getStage1ShootDownValue(state: number, slot: number): number {
    // 制空定数c = 確保から順に 1, 3, 5, 7, 10
    const c = [1, 3, 5, 7, 10][state];
    // A = 0 ~ (制空定数c / 3)の乱数
    const a = Math.floor(Math.random() * (((c / 3) * 1000) + 1)) / 1000;
    // slot * (A + 制空定数c / 4) / 10
    return (slot * (a + c / 4)) / 10;
  }

  /**
   * 航空戦 stage1 撃墜数を取得 敵側式
   * @static
   * @param {number} state
   * @param {number} slot
   * @return {*}  {number}
   * @memberof Calculator
   */
  public static getStage1ShootDownValueEnemy(state: number, slot: number): number {
    // 制空定数c = 確保から順に 10, 8, 6, 4, 1
    const c = [10, 8, 6, 4, 1][state];
    // 0 ~ 制空定数c の一様な整数乱数
    const x = Math.floor(Math.random() * (c + 1));
    const y = Math.floor(Math.random() * (c + 1));
    return Math.floor((slot * (0.65 * x + 0.35 * y)) / 10);
  }

  /**
   * 彼我の制空値より、制空状態を返却
   * @static
   * @param {number} airPower 自軍制空値
   * @param {number} enemyAirPower 相手制空値
   * @param {boolean} [hasPlane=true] 機体を所持しているか？普通はtrue
   * @returns {number}
   * @memberof Calculator
   */
  public static getAirState(airPower: number, enemyAirPower: number, hasPlane = true): number {
    if (enemyAirPower === 0 && airPower === 0) {
      return hasPlane ? AIR_STATE.KAKUHO : AIR_STATE.NONE;
    }
    const borders = CommonCalc.getAirStatusBorder(enemyAirPower);
    for (let i = 0; i < borders.length; i += 1) {
      if (airPower >= borders[i]) {
        return airPower > 0 ? i : AIR_STATE.SOSHITSU;
      }
    }
    return AIR_STATE.SOSHITSU;
  }

  /**
   * キャップ適用値を返却
   * @param {number} power キャップ前火力
   * @param {number} cap キャップ値
   * @returns {number} キャップ後火力
   */
  public static softCap(power: number, cap: number): number {
    return power > cap ? cap + Math.sqrt(power - cap) : power;
  }

  /**
   * ダメージ分布を返却
   * @static
   * @param {{ power: number, rate: number }[]} powers
   * @param {number} armor
   * @param {number} ammoRate
   * @param {number} HP
   * @param {boolean} [isEnemy=false]
   * @return {*}  {{ damage: number, rate: number }[]}
   * @memberof CommonCalc
   */
  public static getDamageDistribution(powers: { power: number, rate: number }[], armor: number, ammoRate: number, HP: number, isEnemy = false): { damage: number, rate: number }[] {
    // 各ダメージ値とその確率のdictionary
    const damageDist: { damage: number, rate: number }[] = [];

    // 0～(装甲 - 1)まで
    const step = 1 / armor;
    for (let i = 0; i < armor; i += 1) {
      const tempArmor = armor * 0.7 + i * 0.6;
      for (let k = 0; k < powers.length; k += 1) {
        const p = powers[k];
        // 最終ダメージ 0以下は0にする
        const damage = p.power - tempArmor > 0 ? Math.floor((p.power - tempArmor) * ammoRate) : 0;
        if (damage >= HP && !isEnemy) {
          // 味方艦隊 撃沈してしまう時ダメージ置換
          const step2 = 1 / HP;
          for (let j = 0; j < HP; j += 1) {
            // 被ダメージ = [現在HP × 0.5 + 整数乱数(0 ～ 現在HP-1) × 0.3](端数切捨て)
            const damage2 = Math.floor(HP * 0.5 + j * 0.3);
            const rate = step * p.rate * step2;
            const data = damageDist.find((v) => v.damage === damage2);
            if (data) {
              // あれば加算
              data.rate += rate;
            } else {
              // なければ初期化
              damageDist.push({ damage: damage2, rate });
            }
          }
        } else {
          const rate = step * p.rate;
          const data = damageDist.find((v) => v.damage === damage);
          if (data) {
            // あれば加算
            data.rate += rate;
          } else {
            // なければ初期化
            damageDist.push({ damage, rate });
          }
        }
      }
    }

    return damageDist;
  }
}
