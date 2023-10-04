import Const, { FLEET_TYPE, SHIP_TYPE } from '../const';
import Fleet from './fleet';
import Ship from './ship';

export interface FleetInfoBuilder {
  // eslint-disable-next-line no-use-before-define
  info?: FleetInfo | undefined;
  /** 艦隊一覧 */
  fleets?: Fleet[];
  /** 連合フラグ */
  isUnion?: boolean;
  /** 司令部レベル */
  admiralLevel?: number;
  /** 計算を行う艦隊インデックス */
  mainFleetIndex?: number;
  /** 艦隊形式 */
  fleetType?: number;
}

export default class FleetInfo {
  /** 艦隊一覧 */
  public readonly fleets: Fleet[];

  /** 連合艦隊？ */
  public readonly isUnion: boolean;

  /** 艦隊タイプ */
  public readonly fleetType: number;

  /** 司令部レベル */
  public readonly admiralLevel: number;

  /** 計算を行う艦隊番号 */
  public readonly mainFleetIndex: number;

  /** 連合艦隊 自動生成 */
  public readonly unionFleet: Fleet | undefined;

  /** 計算済みフラグ */
  public calculated = false;

  /** 履歴に追加しなくてもいいフラグ */
  public ignoreHistory = false;

  constructor(builder: FleetInfoBuilder = {}) {
    if (builder.info) {
      this.isUnion = builder.isUnion !== undefined ? builder.isUnion : builder.info.isUnion;
      this.admiralLevel = builder.admiralLevel !== undefined ? builder.admiralLevel : builder.info.admiralLevel;
      this.mainFleetIndex = builder.mainFleetIndex !== undefined ? builder.mainFleetIndex : builder.info.mainFleetIndex;
      this.fleets = builder.fleets !== undefined ? builder.fleets : builder.info.fleets.concat();
      this.fleetType = builder.fleetType ?? builder.info.fleetType;
    } else {
      this.isUnion = builder.isUnion !== undefined ? builder.isUnion : false;
      this.admiralLevel = builder.admiralLevel !== undefined ? builder.admiralLevel : 120;
      this.mainFleetIndex = builder.mainFleetIndex !== undefined ? builder.mainFleetIndex : 0;
      this.fleets = builder.fleets !== undefined ? builder.fleets : [];
      this.fleetType = builder.fleetType ?? FLEET_TYPE.SINGLE;
    }

    const minFleetCount = 4;
    const fleetCount = this.fleets.length;
    if (fleetCount < minFleetCount) {
      // 第4艦隊までは最低でも作成
      for (let i = 0; i < minFleetCount - fleetCount; i += 1) {
        this.fleets.push(new Fleet());
      }
    }

    // 艦隊形式がおかしそうなら矯正
    if (this.isUnion && !(this.fleetType === FLEET_TYPE.CTF || this.fleetType === FLEET_TYPE.STF || this.fleetType === FLEET_TYPE.TCF)) {
      this.fleetType = FLEET_TYPE.STF;
    } else if (!this.isUnion && this.fleetType !== FLEET_TYPE.SINGLE) {
      this.fleetType = FLEET_TYPE.SINGLE;
    }

    if (this.isUnion && (this.mainFleetIndex === 0 || this.mainFleetIndex === 1)) {
      // 連合艦隊にチェックが入っている場合連合艦隊オブジェクトを生成
      const mains = this.fleets[0].ships;
      // 第1艦隊全艦をnot随伴としてインスタンス化
      for (let i = 0; i < mains.length; i += 1) {
        const ship = mains[i];
        mains[i] = new Ship({ ship, isEscort: false, noStock: ship.noStock });
      }

      const escorts = this.fleets[1].ships;
      // 第2艦隊全艦を随伴としてインスタンス化
      for (let i = 0; i < escorts.length; i += 1) {
        const ship = escorts[i];
        escorts[i] = new Ship({ ship, isEscort: true, noStock: ship.noStock });
      }

      this.unionFleet = new Fleet({
        isUnion: true,
        ships: this.fleets[0].ships.concat(escorts),
        formation: this.fleets[0].formation,
      });

      // 艦隊別の制空値に初期化
      this.unionFleet.airPower = this.fleets[0].fullAirPower;
      this.unionFleet.escortAirPower = this.fleets[1].fullAirPower;
    } else if (!this.isUnion) {
      // 連合が解除されているので再度インスタンス化
      this.fleets[0] = new Fleet({ fleet: this.fleets[0], isUnion: false });
      this.fleets[1] = new Fleet({ fleet: this.fleets[1], isUnion: false });
    }
  }

  /**
   * 計算対象の艦隊データを返却
   * @readonly
   * @type {Fleet}
   * @memberof FleetInfo
   */
  public get mainFleet(): Fleet {
    let mainFleet = this.fleets[this.mainFleetIndex];
    if (this.isUnion && this.mainFleetIndex <= 1) {
      mainFleet = this.unionFleet as Fleet;
    }
    return mainFleet;
  }

  /**
   * 陣形が変更されたFleetInfoを新しく返却
   * @static
   * @param {FleetInfo} info
   * @param {number} formation
   * @return {*}  {FleetInfo}
   * @memberof FleetInfo
   */
  public static getInfoWithChangedFormation(info: FleetInfo, formation: number): FleetInfo {
    const fleets = [];
    for (let i = 0; i < info.fleets.length; i += 1) {
      fleets.push(new Fleet({ fleet: info.fleets[i], formation }));
    }

    return new FleetInfo({ info, fleets });
  }

  /**
   * 連合艦隊構成エラー用オブジェクトを返却
   * @static
   * @param {number} type
   * @param {Ship[]} ships
   * @return {*}  {({ type: string, value: number, text: '必要' | '以下' | '不可' | '旗艦' | '旗艦不可' | '高速化' }[][])}
   * @memberof FleetInfo
   */
  public static getUnionError(type: number, ships: Ship[]): { type: string, value: number, text: '必要' | '以下' | '編成不可' | '旗艦' | '旗艦不可' | '高速化' }[][] {
    const mains = ships.filter((v) => !v.isEscort);
    const escorts = ships.filter((v) => v.isEscort);

    const errors: { type: string, value: number, text: '必要' | '以下' | '編成不可' | '旗艦' | '旗艦不可' | '高速化' }[][] = [[], []];
    if (type === FLEET_TYPE.TCF) {
      // 輸送護衛部隊
      let checkedTypes: number[] = [];

      // 第1艦隊
      // 駆逐・海防が4隻いるか？
      if (mains.filter((v) => v.data.type === SHIP_TYPE.DD || v.data.type === SHIP_TYPE.DE).length < 4) {
        errors[0].push({ type: '駆逐艦または海防艦', value: 4, text: '必要' });
      }
      // 護衛空母1隻まで
      if (mains.filter((v) => v.data.type === SHIP_TYPE.CVL && v.data.minAsw).length > 1) {
        errors[0].push({ type: '護衛空母', value: 1, text: '以下' });
      }
      // 通常の軽空母は不可
      if (mains.filter((v) => v.data.type === SHIP_TYPE.CVL && !v.data.minAsw).length && !checkedTypes.includes(SHIP_TYPE.CVL)) {
        errors[0].push({ type: '軽空母', value: 0, text: '編成不可' });
        checkedTypes.push(SHIP_TYPE.CVL);
      }
      // 工作艦1隻まで
      if (mains.filter((v) => v.data.type === SHIP_TYPE.AR).length > 1) {
        errors[0].push({ type: '工作艦', value: 1, text: '以下' });
      }
      // 有効艦種一覧
      const enabledTypes = [+SHIP_TYPE.CL, SHIP_TYPE.CT, SHIP_TYPE.CAV, SHIP_TYPE.BBV, SHIP_TYPE.AV, SHIP_TYPE.LHA, SHIP_TYPE.AS, SHIP_TYPE.AO, SHIP_TYPE.AO_2, SHIP_TYPE.DD, SHIP_TYPE.DE, SHIP_TYPE.AR, SHIP_TYPE.CVL];
      for (let i = 0; i < mains.length; i += 1) {
        const shipType = mains[i].data.type;
        if (shipType && !enabledTypes.includes(shipType) && !checkedTypes.includes(shipType)) {
          const typeData = Const.SHIP_TYPES_FORMAL.find((v) => v.type === shipType);
          errors[0].push({ type: typeData ? typeData.text : '', value: 0, text: '編成不可' });
          checkedTypes.push(shipType);
        }
      }

      // 第2艦隊
      // 軽巡・練巡が旗艦にいるか？
      if (escorts[0].data.type !== SHIP_TYPE.CL && escorts[0].data.type !== SHIP_TYPE.CT) {
        errors[1].push({ type: '軽巡または練巡', value: 0, text: '旗艦' });
      }
      // 駆逐・海防が3隻いるか？
      if (escorts.filter((v) => v.data.type === SHIP_TYPE.DD || v.data.type === SHIP_TYPE.DE).length < 3) {
        errors[1].push({ type: '駆逐艦または海防艦', value: 3, text: '必要' });
      }
      // 駆逐・海防が3隻いるか？
      if (escorts.filter((v) => v.data.type === SHIP_TYPE.CL || v.data.type === SHIP_TYPE.CT).length > 2) {
        errors[1].push({ type: '軽巡または練巡', value: 2, text: '以下' });
      }
      const enabledTypes2 = [+SHIP_TYPE.DD, SHIP_TYPE.DE, SHIP_TYPE.CL, SHIP_TYPE.CT, SHIP_TYPE.CA, SHIP_TYPE.CAV];
      checkedTypes = [];
      for (let i = 0; i < escorts.length; i += 1) {
        const shipType = escorts[i].data.type;
        if (shipType && !enabledTypes2.includes(shipType) && !checkedTypes.includes(shipType)) {
          const typeData = Const.SHIP_TYPES_FORMAL.find((v) => v.type === shipType);
          errors[1].push({ type: typeData ? typeData.text : '', value: 0, text: '編成不可' });
          checkedTypes.push(shipType);
        }
      }
    } else {
      if (type === FLEET_TYPE.STF) {
        // 水上打撃部隊
        // 巡洋艦系
        const baseTypes = [+SHIP_TYPE.CL, SHIP_TYPE.CLT, SHIP_TYPE.CA, SHIP_TYPE.CAV];
        if (mains.filter((v) => v.data.isBB || baseTypes.includes(v.data.type)).length < 2) {
          errors[0].push({ type: '巡洋艦系', value: 2, text: '必要' });
        }
        // 戦艦4隻まで
        if (mains.filter((v) => v.data.isBB).length > 4) {
          errors[0].push({ type: '戦艦級', value: 4, text: '以下' });
        }
        // 重巡4隻まで
        if (mains.filter((v) => v.data.type === SHIP_TYPE.CA || v.data.type === SHIP_TYPE.CAV).length > 4) {
          errors[0].push({ type: '重巡級', value: 4, text: '以下' });
        }
        // 空母1隻まで
        if (mains.filter((v) => v.data.type === SHIP_TYPE.CV || v.data.type === SHIP_TYPE.CVB).length > 1) {
          errors[0].push({ type: '正規空母', value: 1, text: '以下' });
        }
        // 空母系1隻まで
        if (mains.some((v) => v.data.type === SHIP_TYPE.CV || v.data.type === SHIP_TYPE.CVB) && mains.some((v) => v.data.type === SHIP_TYPE.CVL)) {
          errors[0].push({ type: '軽空母と空母', value: 1, text: '以下' });
        }
        // 軽空母2隻まで
        if (mains.filter((v) => v.data.type === SHIP_TYPE.CVL).length > 2) {
          errors[0].push({ type: '軽空母', value: 2, text: '以下' });
        }
      } else if (type === FLEET_TYPE.CTF) {
        // 空母機動部隊
        // 空母系が2隻いるか？
        if (mains.filter((v) => v.data.isCV).length < 2) {
          errors[0].push({ type: '空母', value: 2, text: '必要' });
        }
        // 戦艦2隻まで
        if (mains.filter((v) => v.data.isBB).length > 2) {
          errors[0].push({ type: '戦艦級', value: 2, text: '以下' });
        }
      }

      // 共通
      // 潜水艦の旗艦配置禁止
      if (mains[0].data.type === SHIP_TYPE.SS || mains[0].data.type === SHIP_TYPE.SSV) {
        errors[0].push({ type: '潜水艦', value: 0, text: '旗艦不可' });
      }

      // 第2艦隊は共通 高速化などの特例がややこしいのでいったんまとめる
      const types = [];
      for (let i = 0; i < escorts.length; i += 1) {
        const ship = escorts[i];
        // 高速戦艦として扱うものたち => Гангут、高速のウォー様改、高速+の戦艦
        if (ship.data.originalId === 513 || (ship.speed >= 10 && ship.data.id === 364) || (ship.data.isBB && ship.speed >= 15)) {
          types.push(SHIP_TYPE.FBB);
        } else {
          types.push(ship.data.type);
        }
      }
      // 軽巡が1隻必須
      if (!types.filter((v) => v === SHIP_TYPE.CL).length) {
        errors[1].push({ type: '軽巡', value: 1, text: '必要' });
      } else if (types.filter((v) => v === SHIP_TYPE.CL).length > 1) {
        errors[1].push({ type: '軽巡', value: 1, text: '以下' });
      }
      // 駆逐が2隻いるか？
      if (types.filter((v) => v === SHIP_TYPE.DD).length < 2) {
        errors[1].push({ type: '駆逐艦', value: 2, text: '必要' });
      }
      // 重巡・航巡2隻まで
      if (types.filter((v) => v === SHIP_TYPE.CA || v === SHIP_TYPE.CAV).length > 2) {
        errors[1].push({ type: '重巡級', value: 2, text: '以下' });
      }
      // 軽空母1隻まで
      if (types.filter((v) => v === SHIP_TYPE.CVL).length > 1) {
        errors[1].push({ type: '軽空母', value: 1, text: '以下' });
      }
      // 水母1隻まで
      if (types.filter((v) => v === SHIP_TYPE.AV).length > 1) {
        errors[1].push({ type: '水母', value: 1, text: '以下' });
      }
      // 高速戦艦判定艦2隻まで
      if (types.filter((v) => v === SHIP_TYPE.FBB).length > 2) {
        errors[1].push({ type: '高速戦艦', value: 2, text: '以下' });
      }
      // 潜水艦の旗艦配置禁止
      if (types[0] === SHIP_TYPE.SS || types[0] === SHIP_TYPE.SSV) {
        errors[1].push({ type: '潜水艦', value: 0, text: '旗艦不可' });
      }
      const forbiddenTypes = [+SHIP_TYPE.CV, SHIP_TYPE.CVB, SHIP_TYPE.BB, SHIP_TYPE.BBV, SHIP_TYPE.BBB];
      const checkedTypes: number[] = [];
      for (let i = 0; i < types.length; i += 1) {
        const shipType = types[i];
        if (shipType && forbiddenTypes.includes(shipType) && !checkedTypes.includes(shipType)) {
          const typeData = Const.SHIP_TYPES_FORMAL.find((v) => v.type === shipType);
          if (shipType === SHIP_TYPE.BB || shipType === SHIP_TYPE.BBB || shipType === SHIP_TYPE.BBV) {
            errors[1].push({ type: typeData ? typeData.text : '', value: 0, text: '高速化' });
          } else {
            errors[1].push({ type: typeData ? typeData.text : '', value: 0, text: '編成不可' });
          }
          checkedTypes.push(shipType);
        }
      }
    }

    return errors;
  }
}
