import { SHIP_TYPE } from '../const';
import { MasterEnemy } from '../interfaces/master';

export default class EnemyMaster {
  public id = 0;

  public name = '';

  public type = 0;

  public type2 = 0;

  public version = 0;

  public hp = 0;

  public antiAir = 0;

  public armor = 0;

  public slotCount = 0;

  public slots: number[] = [];

  public items: number[] = [];

  public speed = 0;

  public isLandBase = false;

  public isUnknown = false;

  public isCV = false;

  /**
   * Creates an instance of EnemyMaster.
   * @param {MasterEnemy} enemy
   * @memberof EnemyMaster
   */
  constructor(enemy?: MasterEnemy) {
    if (enemy) {
      this.id = enemy.id ? +enemy.id : 0;
      this.name = enemy.name ? enemy.name : '';
      this.type = enemy.type ? +enemy.type : 0;
      this.hp = enemy.hp ? +enemy.hp : 0;
      this.antiAir = enemy.aa ? +enemy.aa : 0;
      this.armor = enemy.armor ? +enemy.armor : 0;
      this.slotCount = enemy.slot_count ? +enemy.slot_count : 0;
      this.speed = enemy.speed ? +enemy.speed : 0;
      this.isUnknown = !!enemy.unknown;

      this.slots = enemy.slots ? enemy.slots : [];
      this.items = enemy.items ? enemy.items : [];

      this.isLandBase = this.speed === 0;

      this.isCV = this.type === SHIP_TYPE.CV || this.type === SHIP_TYPE.CVL || this.type === SHIP_TYPE.CVB;
    }
  }

  /**
   * 改造状態接尾辞を分離
   * @static
   * @return {*}  {string}
   * @memberof EnemyMaster
   */
  static getSuffix(name: string): string[] {
    let targetString = name;
    // 面倒な奴消す
    const without = [' A', ' B', ' C', ' 最終', ' 前哨', ' 弱', ' 中', ' 強', ' 最弱', '弱', '強', ' 青', ' 陸爆', ' 空襲', ' 偵察', ' 重爆', ' 15夏', '(赤)', '(白)', '(黒)', '(白赤)', '(鳥赤)', '(鳥白)', '(鳥黒)', '(陸爆中)', '(陸爆)', '(双発)', '(3-5前哨)', '(3-5最終)', '(4-5最終)'];
    for (let i = 0; i < without.length; i += 1) {
      targetString = targetString.replaceAll(without[i], '');
    }

    const resultNames = [];
    const classes = targetString.split('級');
    if (classes.length >= 2 && !targetString.includes('姫')) {
      // イロハ級
      resultNames.push(`${classes[0]}級`);
      targetString = `${classes[1]}`;

      const kai = targetString.split('改');
      if (kai.length >= 2) {
        resultNames.push(kai[0]);
        resultNames.push('改');
        targetString = `${kai[1]}`;
      }

      const summerMode = targetString.split(' 夏mode');
      if (summerMode.length >= 2) {
        resultNames.push(summerMode[0]);
        resultNames.push('夏mode');
        targetString = `${summerMode[1]}`;
      }

      resultNames.push(targetString);
      return resultNames;
    }
    // 姫級
    const remodel = targetString.split('改装');
    const kai = targetString.split('改');
    if (remodel.length === 1 && kai.length >= 2) {
      resultNames.push(kai[0]);
      resultNames.push('改');
      targetString = `${kai[1]}`;
    }

    const sumerLanding = targetString.split('II夏季上陸');
    if (sumerLanding.length >= 2) {
      resultNames.push(sumerLanding[0]);
      resultNames.push(' II夏季上陸');
      targetString = `${sumerLanding[1]}`;
    }

    const damaged = targetString.split('-壊');
    if (damaged.length >= 2) {
      resultNames.push(damaged[0]);
      resultNames.push('-壊');
      targetString = `${damaged[1]}`;
    }

    const vacMode = targetString.split(' vac.');
    if (vacMode.length >= 2) {
      resultNames.push(vacMode[0]);
      resultNames.push('vac.');
      targetString = `${vacMode[1]}`;
    }

    const flagship = targetString.split('flagship');
    if (flagship.length >= 2) {
      resultNames.push(flagship[0]);
      resultNames.push('flagship');
      targetString = `${flagship[1]}`;
    }

    const other = targetString.split('(哨戒機配備)');
    if (other.length >= 2) {
      resultNames.push('(哨戒機配備)');
      targetString = `${other[1]}`;
    }

    const level = targetString.split('[');
    if (level.length >= 2) {
      resultNames.push(level[0]);
      resultNames.push(`[${level[1]}`);
      targetString = '';
    }

    resultNames.push(targetString);
    return resultNames;
  }
}
