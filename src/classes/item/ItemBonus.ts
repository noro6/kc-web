import Const from '../const';

export type ItemBonusStatus = {
  firePower?: number, torpedo?: number, antiAir?: number, armor?: number, asw?: number, scout?: number, avoid?: number, accuracy?: number, bomber?: number, range?: number, fromTypeId?: number
}

type Bonus = {
  bonus: ItemBonusStatus
  shipBase?: number[]
  shipClass?: number[]
  shipCountry?: number[]
  shipType?: number[]
  shipId?: number[]
  requiresType?: number[]
  requiresId?: number[]
  requiresSR?: number
  requiresAR?: number
  requiresAccR?: number
  requiresIdNum?: number
  requiresIdLevel?: number
  num?: number
  remodel?: number
}

type Bonuses = {
  types?: number[]
  ids?: number[]
  bonuses: Bonus[]
}

export default class ItemBonus {
  /**
   * 装備ボーナス配列から合計のボーナスを算出する
   * @static
   * @param {ItemBonusStatus[]} bonuses
   * @return {*}  {ItemBonusStatus}
   * @memberof ItemBonus
   */
  public static getTotalBonus(bonuses: ItemBonusStatus[]): ItemBonusStatus {
    const bonus = {
      firePower: 0,
      torpedo: 0,
      antiAir: 0,
      armor: 0,
      asw: 0,
      scout: 0,
      avoid: 0,
      accuracy: 0,
      bomber: 0,
      range: 0,
    };

    for (let i = 0; i < bonuses.length; i += 1) {
      const v = bonuses[i];
      bonus.firePower += v.firePower ? v.firePower : 0;
      bonus.torpedo += v.torpedo ? v.torpedo : 0;
      bonus.antiAir += v.antiAir ? v.antiAir : 0;
      bonus.armor += v.armor ? v.armor : 0;
      bonus.asw += v.asw ? v.asw : 0;
      bonus.scout += v.scout ? v.scout : 0;
      bonus.avoid += v.avoid ? v.avoid : 0;
      bonus.accuracy += v.accuracy ? v.accuracy : 0;
      bonus.bomber += v.bomber ? v.bomber : 0;
      bonus.range += v.range ? v.range : 0;
    }

    return bonus;
  }

  public static readonly bonusData: Bonuses[] = [
    {
      types: [9],
      bonuses: [
        {
          bonus: { scout: 1 },
          shipType: [7, 10, 11, 18],
          num: 1,
          remodel: 2,
        },
        {
          bonus: { firePower: 1 },
          shipType: [7, 10, 11, 18],
          num: 1,
          remodel: 4,
        },
        {
          bonus: { scout: 1 },
          shipType: [7, 10, 11, 18],
          num: 1,
          remodel: 6,
        },
        {
          bonus: { firePower: 1, scout: 1 },
          shipType: [7, 10, 11, 18],
          num: 1,
          remodel: 10,
        },
      ],
    },
    {
      types: [10],
      bonuses: [
        {
          bonus: { firePower: 2, asw: 3, avoid: 1 },
          shipId: [662, 663, 668],
          num: 1,
        },
        {
          bonus: { firePower: 2 },
          shipId: [501, 506],
          num: 1,
        },
      ],
    },
    {
      types: [11],
      bonuses: [
        {
          bonus: { firePower: 1, asw: 1, avoid: 1 },
          shipId: [662, 663, 668],
          num: 1,
        },

        {
          bonus: { firePower: 1, avoid: 1 },
          shipId: [501, 506],
          num: 1,
        },
      ],
    },
    {
      types: [12, 13],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 2, avoid: 3 },
          shipId: [569, 648],
          requiresAR: 1,
          num: 1,
        },
      ],
    },
    {
      types: [25],
      bonuses: [
        {
          bonus: { asw: 4, avoid: 1 },
          shipId: [662],
          num: 1,
        },
        {
          bonus: { asw: 3, avoid: 1 },
          shipId: [663, 668],
          num: 1,
        },
      ],
    },
    {
      types: [29],
      bonuses: [
        {
          bonus: { firePower: 4, avoid: -1 },
          shipBase: [34, 55, 69, 85, 86],
          num: 1,
        },
        {
          bonus: { firePower: 4, torpedo: 8 },
          shipBase: [55],
          num: 1,
        },
        {
          bonus: { firePower: 2 },
          shipBase: [132],
        },
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipBase: [20],
        },
        {
          bonus: { firePower: 4, torpedo: 2 },
          shipId: [662, 663, 668],
          num: 1,
        },
      ],
    },
    {
      types: [42],
      bonuses: [
        {
          bonus: { firePower: 6, avoid: -2 },
          shipBase: [85, 86],
          num: 1,
        },
        {
          bonus: { firePower: 4, avoid: -1 },
          shipBase: [131, 143],
          num: 1,
        },
        {
          bonus: { firePower: 3, torpedo: 3 },
          shipId: [592],
          num: 1,
        },
        {
          bonus: { torpedo: 5 },
          shipId: [592],
          requiresId: [174],
          num: 1,
        },
      ],
    },
    {
      ids: [3, 122],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 2, avoid: 1 },
          shipClass: [54],
        },
      ],
    },
    {
      ids: [5],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipClass: [9, 52],
        },
        {
          bonus: { firePower: 1 },
          shipClass: [52],
        },
      ],
    },
    {
      ids: [15],
      bonuses: [
        {
          bonus: { torpedo: 2 },
          shipId: [566, 567, 568, 648, 651, 656, 670, 915],
          num: 1,
        },
        {
          bonus: { torpedo: 2 },
          shipId: [566, 567, 568, 648, 651, 656, 670, 915],
          num: 2,
        },
        {
          bonus: { torpedo: 5, avoid: 1 },
          shipBase: [642],
          num: 1,
        },
      ],
    },
    {
      ids: [18, 52],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipId: [156, 277, 278],
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipId: [594, 646, 698],
        },
        {
          bonus: { firePower: 2, avoid: 1 },
          shipId: [599, 610],
        },
      ],
    },
    {
      ids: [19],
      bonuses: [
        {
          bonus: { antiAir: 1, avoid: 1 },
          shipType: [7],
        },
        {
          bonus: { firePower: 2, asw: 3 },
          shipClass: [75, 76],
        },
        {
          bonus: {
            firePower: 2, antiAir: 2, asw: 2, avoid: 2,
          },
          shipBase: [89],
        },
        {
          bonus: {
            firePower: 1, avoid: 1, asw: 1, antiAir: 1,
          },
          shipId: [894, 899],
        },
      ],
    },
    {
      ids: [24, 57, 111],
      bonuses: [
        {
          bonus: { firePower: 2 },
          shipId: [553, 554],
        },
      ],
    },
    {
      ids: [26, 62, 79, 80, 81, 207, 208],
      bonuses: [
        {
          bonus: { firePower: 2, avoid: 1 },
          shipId: [662],
          num: 1,
        },
        {
          bonus: { firePower: 2 },
          shipId: [501, 506, 663, 668],
          num: 1,
        },
        {
          bonus: { antiAir: 1, avoid: 1 },
          shipId: [501, 506, 663, 668],
        },
      ],
    },
    {
      ids: [30, 410],
      bonuses: [
        {
          bonus: { antiAir: 3, avoid: 2, scout: 2 },
          shipId: [73, 501, 506],
          num: 1,
        },
        {
          bonus: { antiAir: 3, avoid: 2, scout: 2 },
          shipClass: [54],
          num: 1,
        },
      ],
    },
    {
      ids: [410],
      bonuses: [
        {
          bonus: {
            firePower: 1, antiAir: 2, armor: 1, avoid: 2,
          },
          shipId: [73, 501, 506],
          num: 1,
        },
        {
          bonus: {
            firePower: 1, antiAir: 2, armor: 1, avoid: 2,
          },
          shipClass: [54],
          num: 1,
        },
      ],
    },
    {
      ids: [35],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipId: [149, 591, 592],
          num: 1,
        },
        {
          bonus: { antiAir: 1 },
          shipId: [150],
          num: 1,
        },
        {
          bonus: { antiAir: 1, avoid: 1 },
          shipId: [151, 593, 954],
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipId: [152],
          num: 1,
        },
      ],
    },
    {
      ids: [39, 40, 49, 131],
      bonuses: [
        {
          bonus: { antiAir: 2, avoid: 1 },
          shipId: [662, 663],
        },
        {
          bonus: { antiAir: 3, avoid: 2 },
          shipId: [668],
        },
        {
          bonus: { firePower: 1, antiAir: 2, avoid: 2 },
          shipClass: [56],
        },
        {
          bonus: { antiAir: 2, avoid: 2 },
          shipClass: [56],
          requiresAR: 1,
          num: 1,
        },
      ],
    },
    {
      ids: [44, 45, 287, 288],
      bonuses: [
        {
          bonus: { asw: 3, avoid: 2 },
          shipClass: [56],
        },
      ],
    },
    {
      ids: [46, 47, 132, 149, 438],
      bonuses: [
        {
          bonus: { asw: 2, avoid: 3 },
          shipClass: [56],
          num: 1,
        },
      ],
    },
    {
      ids: [47, 438],
      bonuses: [
        {
          bonus: { firePower: 1, asw: 3, avoid: 2 },
          shipBase: [43, 425, 471, 473, 457, 122],
        },
        {
          bonus: { asw: 2, avoid: 2 },
          shipBase: [16, 36, 414, 167, 170, 527],
        },
      ],
    },
    {
      ids: [50],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipClass: [7, 13],
        },
        {
          bonus: { firePower: 1, torpedo: 1, avoid: 1 },
          shipClass: [7, 13],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: -1, torpedo: -1, avoid: -1 },
          shipClass: [7, 13],
          requiresSR: 1,
          requiresId: [90],
          num: 1,
        },
        {
          bonus: { firePower: 2, avoid: 1 },
          shipClass: [8, 9, 29, 31],
        },
        {
          bonus: { firePower: 3, torpedo: 2, avoid: 2 },
          shipClass: [8, 9, 29, 31],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipClass: [9, 31],
          requiresId: [50],
          requiresIdNum: 2,
        },
        {
          bonus: { firePower: 1 },
          shipId: [501, 506],
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipId: [501, 506],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 1, antiAir: 3, avoid: 2 },
          shipId: [501, 506],
          requiresId: [30, 410],
          num: 1,
        },
        {
          bonus: { firePower: 2 },
          shipId: [501, 506],
          requiresId: [410],
          num: 1,
        },
      ],
    },
    {
      ids: [58],
      bonuses: [
        {
          bonus: { torpedo: 1 },
          shipClass: [22, 54],
        },
        {
          bonus: { torpedo: 1 },
          shipType: [4],
        },
      ],
    },
    {
      ids: [59],
      bonuses: [
        {
          bonus: { antiAir: 1, avoid: 1 },
          shipId: [501, 506],
          num: 1,
        },
      ],
    },
    {
      ids: [60, 154, 219],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 1 },
          shipBase: [75, 92, 102, 103, 116],
        },
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 1 },
          shipId: [185, 282, 318],
        },
        {
          bonus: { firePower: 2, antiAir: 1, avoid: 2 },
          shipId: [883, 888],
        },
      ],
    },
    {
      ids: [61],
      bonuses: [
        {
          bonus: {
            firePower: 3, armor: 1, accuracy: 5, avoid: 2, range: 1,
          },
          shipId: [553],
          num: 1,
        },
        {
          bonus: {
            firePower: 3, armor: 3, accuracy: 5, avoid: 3, range: 1,
          },
          shipId: [554],
          num: 1,
        },
        {
          bonus: { accuracy: 5, range: 1 },
          shipId: [196, 197],
          num: 1,
        },
        {
          bonus: { firePower: 3, scout: 3 },
          shipBase: [90],
          num: 1,
          remodel: 1,
        },
        {
          bonus: { firePower: 2, scout: 2 },
          shipBase: [91],
          num: 1,
          remodel: 1,
        },
        {
          bonus: { firePower: 1, scout: 1 },
          shipId: [508, 509, 560],
          num: 1,
          remodel: 1,
        },
        {
          bonus: { firePower: 1, scout: 1 },
          shipId: [197],
          num: 1,
          remodel: 8,
        },
      ],
    },
    {
      ids: [63],
      bonuses: [
        {
          bonus: { antiAir: 1 },
          shipClass: [1, 5, 10],
        },
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 2 },
          shipBase: [45],
        },
        {
          bonus: { torpedo: 1 },
          shipId: [144],
        },
        {
          bonus: { firePower: 1 },
          shipId: [145, 627],
        },
        {
          bonus: { avoid: 1 },
          shipId: [242, 244, 497, 498],
        },
        {
          bonus: { avoid: 2 },
          shipId: [469],
        },
        {
          bonus: { firePower: 2 },
          shipId: [903, 908],
        },
      ],
    },
    {
      ids: [66, 220],
      bonuses: [
        {
          bonus: { antiAir: 2, avoid: 1 },
          shipId: [662, 663, 668],
        },
        {
          bonus: { firePower: 1, antiAir: 2, avoid: 2 },
          shipId: [501, 506],
        },
        {
          bonus: { antiAir: 1, avoid: 2 },
          shipId: [501, 506, 662, 663, 668],
          requiresAR: 1,
          num: 1,
        },
      ],
    },
    {
      ids: [220],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 3, avoid: 2 },
          shipId: [501, 506, 662, 663, 668],
        },
        {
          bonus: { antiAir: 3, avoid: 3 },
          shipId: [501, 506, 662, 663, 668, 894, 899],
          requiresAR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 2, avoid: 2 },
          shipId: [894, 899],
        },
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 1 },
          shipId: [894, 899],
          remodel: 10,
        },
      ],
    },
    {
      ids: [67],
      bonuses: [
        {
          bonus: { torpedo: -5 },
        },
        {
          bonus: { torpedo: 5 },
          shipType: [13, 14],
        },
      ],
    },
    {
      ids: [69],
      bonuses: [
        {
          bonus: { firePower: 1, asw: 2 },
          shipId: [554, 646],
        },
        {
          bonus: { firePower: 1, asw: 1 },
          shipId: [553],
        },
      ],
    },
    {
      ids: [78],
      bonuses: [
        {
          bonus: { firePower: 1, avoid: 1 },
          shipClass: [48],
        },
        {
          bonus: { firePower: 2, torpedo: 2, avoid: 2 },
          shipClass: [48],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipClass: [48],
          remodel: 7,
        },
        {
          bonus: { armor: 1 },
          shipClass: [48],
          remodel: 10,
        },
      ],
    },
    {
      ids: [79, 81],
      bonuses: [
        {
          bonus: { firePower: 3 },
          shipId: [553, 554],
        },
        {
          bonus: { firePower: 2 },
          shipId: [82, 88, 411, 412],
        },
      ],
    },
    {
      ids: [82],
      bonuses: [
        {
          bonus: { asw: 1, avoid: 1 },
          shipClass: [76],
        },
      ],
    },
    {
      ids: [87],
      bonuses: [
        {
          bonus: { torpedo: 1, avoid: 2 },
          shipId: [591, 592, 593, 954],
          num: 1,
        },
        {
          bonus: { avoid: 1 },
          shipId: [591, 592, 593, 954],
          num: 1,
          remodel: 6,
        },
        {
          bonus: { torpedo: 1 },
          shipId: [591, 592, 593, 954],
          num: 1,
          remodel: 8,
        },
        {
          bonus: { firePower: 1 },
          shipId: [591, 592, 593, 954],
          num: 1,
          remodel: 10,
        },
      ],
    },
    {
      ids: [90],
      bonuses: [
        {
          bonus: { firePower: 2, avoid: 1 },
          shipId: [142],
        },
        {
          bonus: { firePower: 1 },
          shipId: [295, 416, 417],
        },
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipId: [264],
        },
        {
          bonus: { firePower: 1 },
          shipClass: [7, 8, 9, 13, 29, 31],
        },
        {
          bonus: { antiAir: 5, avoid: 2 },
          shipBase: [61],
          requiresAR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 3, torpedo: 2, avoid: 2 },
          shipClass: [7, 13],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipId: [501, 506],
        },
      ],
    },
    {
      ids: [93],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipBase: [90],
          num: 1,
        },
        {
          bonus: { firePower: 3 },
          shipBase: [91],
          num: 1,
        },
      ],
    },
    {
      ids: [94],
      bonuses: [
        {
          bonus: { firePower: 3 },
          shipId: [197],
          num: 1,
        },
        {
          bonus: { firePower: 7 },
          shipId: [196],
          num: 1,
        },
      ],
    },
    {
      ids: [99],
      bonuses: [
        {
          bonus: { firePower: 4 },
          shipBase: [90],
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipBase: [91],
          num: 1,
        },
      ],
    },
    {
      ids: [100],
      bonuses: [
        {
          bonus: { firePower: 6 },
          shipId: [197],
          num: 1,
        },
        {
          bonus: { firePower: 3 },
          shipId: [196],
          num: 1,
        },
        {
          bonus: { firePower: 4 },
          shipId: [553, 554],
        },
      ],
    },
    {
      ids: [104],
      bonuses: [
        {
          bonus: { firePower: 2 },
          shipId: [149, 591],
        },
        {
          bonus: { firePower: 1 },
          shipId: [150, 152, 592],
        },
        {
          bonus: { firePower: 2, antiAir: 1, avoid: 2 },
          shipId: [151, 593, 954],
        },
      ],
    },
    {
      ids: [106, 450],
      bonuses: [
        {
          bonus: {
            firePower: 1, antiAir: 2, armor: 1, avoid: 3,
          },
          shipId: [145, 151, 407, 419, 541, 593, 911, 916, 954],
        },
        {
          bonus: { antiAir: 1, armor: 1, avoid: 3 },
          shipBase: [35, 183, 465],
        },
        {
          bonus: { antiAir: 2, armor: 1, avoid: 2 },
          shipBase: [20, 49, 139, 167, 170, 425, 532],
        },
        {
          bonus: {
            firePower: 1, antiAir: 1, armor: 1, avoid: 1,
          },
          shipId: [663, 668],
          num: 1,
        },
        {
          bonus: { antiAir: 1, avoid: 1 },
          shipId: [668],
          num: 1,
        },
      ],
    },
    {
      ids: [450],
      bonuses: [
        {
          bonus: {
            firePower: 1, antiAir: 2, armor: 1, avoid: 3,
          },
          shipClass: [101],
        },
        {
          bonus: { antiAir: 1, armor: 1, avoid: 2 },
          shipType: [1],
        },
      ],
    },
    {
      ids: [115],
      bonuses: [
        {
          bonus: { firePower: 2, avoid: 1, scout: 2 },
          shipClass: [47, 55],
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipClass: [47, 55],
          remodel: 10,
        },
      ],
    },
    {
      ids: [118],
      bonuses: [
        {
          bonus: { firePower: 1, avoid: 2, scout: 2 },
          shipClass: [52],
        },
        {
          bonus: { firePower: 2, scout: 1 },
          shipClass: [52],
          remodel: 10,
        },
      ],
    },
    {
      ids: [119],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipClass: [34, 56],
        },
        {
          bonus: { firePower: 2, torpedo: 1 },
          shipClass: [90],
        },
      ],
    },
    {
      ids: [121],
      bonuses: [
        {
          bonus: { antiAir: 4, avoid: 2 },
          shipClass: [54],
          num: 1,
        },
        {
          bonus: { antiAir: 2, avoid: 2 },
          shipClass: [54],
          requiresAR: 1,
          num: 1,
        },
      ],
    },
    {
      ids: [122],
      bonuses: [
        {
          bonus: { firePower: 5, antiAir: 3, avoid: 2 },
          shipId: [656],
          remodel: 4,
        },
        {
          bonus: { firePower: 4, avoid: 3 },
          shipId: [656],
          requiresSR: 1,
          num: 1,
          remodel: 4,
        },
        {
          bonus: { antiAir: 4, avoid: 3 },
          shipId: [656],
          requiresAR: 1,
          num: 1,
          remodel: 4,
        },
      ],
    },
    {
      ids: [129],
      bonuses: [
        {
          bonus: {
            firePower: 1, torpedo: 2, asw: 2, avoid: 2, scout: 1,
          },
          shipClass: [1, 5, 10, 12, 18, 22, 23, 28, 30, 38, 54, 66, 101],
        },
        {
          bonus: {
            firePower: 1, torpedo: 2, avoid: 2, scout: 3,
          },
          shipClass: [4, 16, 20, 21, 34, 41, 52, 56],
        },
        {
          bonus: { firePower: 1, avoid: 2, scout: 3 },
          shipClass: [7, 8, 9, 13, 29, 31],
        },
      ],
    },
    {
      ids: [139],
      bonuses: [
        {
          bonus: { firePower: 2, antiAir: 1 },
          shipId: [662, 663, 668],
        },
      ],
    },
    {
      ids: [143],
      bonuses: [
        {
          bonus: { firePower: 3 },
          shipBase: [83],
          num: 1,
        },
        {
          bonus: { firePower: 2 },
          shipBase: [84, 110],
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipBase: [76, 111],
          num: 1,
        },
      ],
    },
    {
      ids: [144],
      bonuses: [
        {
          bonus: { firePower: 3 },
          shipBase: [83],
          num: 1,
        },
        {
          bonus: { firePower: 2 },
          shipBase: [84, 110],
          num: 1,
        },
        {
          bonus: { firePower: 2 },
          shipId: [461, 466],
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipBase: [76, 111],
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipId: [462, 467],
          num: 1,
        },
      ],
    },
    {
      ids: [147],
      bonuses: [
        {
          bonus: { firePower: 1, avoid: 1 },
          shipClass: [61],
        },
      ],
    },
    {
      ids: [149],
      bonuses: [
        {
          bonus: { asw: 1, avoid: 3 },
          shipId: [141, 160, 488, 622, 623, 656],
          num: 1,
        },
        {
          bonus: { asw: 3, avoid: 5 },
          shipId: [624],
          num: 1,
        },
        {
          bonus: { asw: 2, avoid: 4 },
          shipId: [662],
          num: 1,
        },
        {
          bonus: { asw: 1, avoid: 2 },
          shipClass: [54],
          num: 1,
        },
      ],
    },
    {
      ids: [165, 216],
      bonuses: [
        {
          bonus: { antiAir: 2, avoid: 2 },
          shipId: [501, 506],
          num: 1,
        },
      ],
    },
    {
      ids: [171],
      bonuses: [
        {
          bonus: { avoid: 1 },
          shipCountry: Const.USA,
          num: 1,
          remodel: 5,
        },
        {
          bonus: { firePower: 1 },
          shipCountry: Const.USA,
          num: 1,
          remodel: 10,
        },
        {
          bonus: { firePower: 1, scout: 1 },
          shipClass: [65, 93, 102, 107],
          num: 1,
        },
        {
          bonus: { scout: 1 },
          shipClass: [65, 93, 102, 107],
          num: 1,
          remodel: 3,
        },
        {
          bonus: { scout: 1 },
          shipClass: [65, 93, 102, 107],
          num: 1,
          remodel: 8,
        },
      ],
    },
    {
      ids: [174],
      bonuses: [
        {
          bonus: { torpedo: 1, avoid: 2 },
          shipClass: [66],
        },
        {
          bonus: { torpedo: 6, avoid: 3 },
          shipId: [591, 592, 954],
        },
        {
          bonus: { torpedo: 5, avoid: 2 },
          shipId: [593],
        },
        {
          bonus: { firePower: 2, torpedo: 4, avoid: 4 },
          shipId: [488, 622, 623, 624],
        },
      ],
    },
    {
      ids: [179],
      bonuses: [
        {
          bonus: { torpedo: 1 },
          shipClass: [54],
        },
      ],
    },
    {
      ids: [184],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 2, avoid: 3 },
          shipClass: [68],
        },
      ],
    },
    {
      ids: [188],
      bonuses: [
        {
          bonus: { firePower: 3, antiAir: 1, avoid: 1 },
          shipClass: [68],
        },
      ],
    },
    {
      ids: [189],
      bonuses: [
        {
          bonus: { antiAir: 1, avoid: 2 },
          shipClass: [63, 68],
        },
      ],
    },
    {
      ids: [194],
      bonuses: [
        {
          bonus: { firePower: 3, avoid: 2, scout: 2 },
          shipClass: [70],
        },
        {
          bonus: { avoid: 1, scout: 2 },
          shipClass: [62, 72],
        },
        {
          bonus: { firePower: 1, avoid: 2, scout: 2 },
          shipId: [392],
        },
      ],
    },
    {
      ids: [204],
      bonuses: [
        {
          bonus: { torpedo: 1, armor: 1 },
          shipId: [591, 592, 593, 954],
          num: 1,
        },
        {
          bonus: { armor: 1 },
          shipId: [591, 592, 593, 954],
          num: 1,
          remodel: 7,
        },
        {
          bonus: { torpedo: 1 },
          shipId: [591, 592, 593, 954],
          num: 1,
          remodel: 10,
        },
      ],
    },
    {
      ids: [217],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 5, avoid: 3 },
          shipId: [501, 506],
        },
      ],
    },
    {
      ids: [228],
      bonuses: [
        {
          bonus: {
            firePower: 3, antiAir: 3, asw: 4, avoid: 4,
          },
          shipBase: [89],
        },
        {
          bonus: {
            firePower: 1, avoid: 2, asw: 2, antiAir: 1,
          },
          shipId: [894, 899],
        },
        {
          bonus: {
            firePower: 2, antiAir: 1, asw: 5, avoid: 1,
          },
          shipClass: [75, 76],
        },
        {
          bonus: { antiAir: 1, asw: 2, avoid: 1 },
          shipType: [7],
        },
      ],
    },
    {
      ids: [229],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipId: [622, 623, 624],
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipId: [622, 623, 624],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 2, avoid: 2 },
          shipId: [622, 623, 624],
          requiresAR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 2, antiAir: 3, asw: 2 },
          shipId: [656],
        },
        {
          bonus: { firePower: 2, avoid: 2 },
          shipId: [656],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 3, avoid: 2 },
          shipId: [656],
          requiresAR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 2 },
          shipId: [160, 487, 488],
          remodel: 7,
        },
        {
          bonus: { firePower: 3, avoid: 2 },
          shipId: [160, 487, 488],
          requiresSR: 1,
          num: 1,
          remodel: 7,
        },
        {
          bonus: { antiAir: 2 },
          shipId: [220],
          remodel: 7,
        },
        {
          bonus: { antiAir: 1 },
          shipId: [23, 224, 289, 488],
          remodel: 7,
        },
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipClass: [28, 66],
          remodel: 7,
        },
        {
          bonus: { firePower: 2, avoid: 3 },
          shipClass: [28, 66],
          requiresSR: 1,
          num: 1,
          remodel: 7,
        },
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipType: [1],
          remodel: 7,
        },
        {
          bonus: { firePower: 1, avoid: 4 },
          shipType: [1],
          requiresSR: 1,
          num: 1,
          remodel: 7,
        },
        {
          bonus: { firePower: 2 },
          shipBase: [23, 56, 113],
          remodel: 7,
        },
      ],
    },
    {
      ids: [235],
      bonuses: [
        {
          bonus: { firePower: 2, antiAir: 1 },
          shipClass: [9, 52],
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipId: [321],
        },
        {
          bonus: { firePower: 3, avoid: 2 },
          shipId: [321],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 3, avoid: 3 },
          shipId: [321],
          requiresAR: 1,
          num: 1,
        },
      ],
    },
    {
      ids: [237],
      bonuses: [
        {
          bonus: { firePower: 4, avoid: 2 },
          shipId: [553, 554],
        },
        {
          bonus: { firePower: 3, avoid: 1 },
          shipId: [82, 88],
        },
        {
          bonus: { firePower: 2 },
          shipId: [411, 412],
        },
      ],
    },
    {
      ids: [237, 322, 323, 490],
      bonuses: [
        {
          bonus: { firePower: 3, avoid: 1 },
          shipId: [662],
          num: 1,
        },
        {
          bonus: { firePower: 3, antiAir: 1, avoid: 2 },
          shipId: [501, 506, 553, 554, 663, 668],
        },
      ],
    },
    {
      ids: [238, 239],
      bonuses: [
        {
          bonus: { torpedo: 1, avoid: 1 },
          shipId: [501, 506],
          num: 1,
        },
      ],
    },
    {
      ids: [242],
      bonuses: [
        {
          bonus: { firePower: 2, avoid: 1 },
          shipClass: [78],
        },
        {
          bonus: { firePower: 1 },
          shipBase: [89],
        },
      ],
    },
    {
      ids: [243],
      bonuses: [
        {
          bonus: { firePower: 3, avoid: 1 },
          shipClass: [78],
        },
        {
          bonus: { firePower: 2 },
          shipBase: [89],
        },
      ],
    },
    {
      ids: [244],
      bonuses: [
        {
          bonus: { firePower: 4, avoid: 2 },
          shipClass: [78],
        },
        {
          bonus: { firePower: 3 },
          shipBase: [89],
        },
      ],
    },
    {
      ids: [266],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipId: [566, 567, 568, 656, 670, 915],
          num: 1,
        },
        {
          bonus: { firePower: 2 },
          shipId: [566, 567, 568, 656, 670, 915],
          num: 2,
        },
        {
          bonus: { firePower: 1 },
          shipClass: [18, 23],
        },
        {
          bonus: { firePower: 1, torpedo: 3, avoid: 1 },
          shipClass: [18, 23],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipClass: [30],
        },
        {
          bonus: { firePower: 2, torpedo: 3, avoid: 1 },
          shipClass: [30],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { avoid: 1 },
          shipBase: [20, 43, 167],
        },
      ],
    },
    {
      ids: [267],
      bonuses: [
        {
          bonus: { firePower: 2, avoid: 1 },
          shipClass: [22, 38],
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipClass: [30],
        },
        {
          bonus: { firePower: 1 },
          shipId: [566, 567, 568, 656, 670, 915],
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipId: [542, 543, 563, 564, 569, 578],
        },
        {
          bonus: { firePower: 1, torpedo: 3, avoid: 2 },
          shipId: [229, 542, 543, 563, 564, 569, 578, 648, 649],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 2, torpedo: 3, avoid: 1 },
          shipClass: [38],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 2 },
          shipId: [648, 649],
        },
        {
          bonus: { firePower: 2, torpedo: 3, avoid: 1 },
          shipId: [648],
          requiresSR: 1,
          num: 1,
        },
      ],
    },
    {
      ids: [366],
      bonuses: [
        {
          bonus: { firePower: 2, avoid: 1 },
          shipClass: [22, 38],
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipClass: [30],
        },
        {
          bonus: { firePower: 1, antiAir: 2 },
          shipId: [566, 567, 568, 656, 670, 915],
          num: 1,
        },
        {
          bonus: { firePower: 1, antiAir: 2 },
          shipId: [566, 567, 568, 656, 670, 915],
          num: 2,
        },
        {
          bonus: { firePower: 1 },
          shipId: [542, 543, 563, 564, 569, 578],
        },
        {
          bonus: { firePower: 2 },
          shipId: [648, 649],
        },
        {
          bonus: { antiAir: 3, firePower: 1, accuracy: 1 },
          shipId: [229, 542, 543, 563, 564, 569, 578, 648, 649],
          num: 1,
        },
        {
          bonus: {
            firePower: 2, torpedo: 4, avoid: 2, accuracy: 2,
          },
          shipId: [229, 542, 543, 563, 564, 569, 578, 648, 649],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: {
            firePower: 1, antiAir: 5, avoid: 3, accuracy: 1,
          },
          shipId: [229, 542, 543, 563, 564, 569, 578, 648, 649],
          requiresAR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 2, firePower: 2 },
          shipId: [229, 542, 543, 563, 564, 569, 578, 648, 649],
          num: 2,
        },
        {
          bonus: { accuracy: 1 },
          shipId: [229, 542, 543, 563, 564, 569, 578, 648, 649],
          remodel: 5,
        },
        {
          bonus: { firePower: 1 },
          shipId: [229, 542, 543, 563, 564, 569, 578, 648, 649],
          remodel: 8,
        },
        {
          bonus: { accuracy: 1 },
          shipId: [229, 542, 543, 563, 564, 569, 578, 648, 649],
          remodel: 10,
        },
        {
          bonus: { firePower: 1, antiAir: 2 },
          shipId: [569, 648],
          num: 1,
        },
      ],
    },
    {
      ids: [267, 366],
      bonuses: [
        {
          bonus: { firePower: 2, antiAir: 2, avoid: 3 },
          shipId: [648],
          requiresId: [129, 412],
          num: 1,
        },
        {
          bonus: { firePower: 3, avoid: -3 },
          shipId: [648],
          requiresId: [74],
          num: 1,
        },
      ],
    },
    {
      ids: [268],
      bonuses: [
        {
          bonus: { avoid: 7, armor: 2 },
          shipBase: [100, 101],
          num: 1,
        },
      ],
    },
    {
      ids: [278],
      bonuses: [
        {
          bonus: { antiAir: 1, avoid: 3, scout: 1 },
          shipCountry: Const.USA,
          num: 1,
        },
        {
          bonus: { antiAir: 1, avoid: 2 },
          shipClass: [67, 78, 82, 88, 108, 112],
          num: 1,
        },
        {
          bonus: { antiAir: 1, avoid: 1 },
          shipClass: [96],
          num: 1,
        },
      ],
    },
    {
      ids: [279],
      bonuses: [
        {
          bonus: {
            firePower: 2, antiAir: 2, avoid: 3, scout: 2,
          },
          shipCountry: Const.USA,
          num: 1,
        },
        {
          bonus: {
            firePower: 1, antiAir: 1, avoid: 2, scout: 1,
          },
          shipClass: [67, 78, 82, 88, 108, 112],
          num: 1,
        },
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 1 },
          shipClass: [96],
          num: 1,
        },
      ],
    },
    {
      ids: [282],
      bonuses: [
        {
          bonus: { firePower: 2, armor: 1 },
          shipClass: [73, 81],
        },
        {
          bonus: { firePower: 2, armor: 1 },
          shipId: [147],
        },
        {
          bonus: { firePower: 2, armor: 1 },
          shipBase: [115],
        },
      ],
    },
    {
      ids: [283],
      bonuses: [
        {
          bonus: { firePower: 1, torpedo: 3, armor: 1 },
          shipClass: [73, 81],
        },
        {
          bonus: { firePower: 1, torpedo: 3, armor: 1 },
          shipId: [147],
        },
      ],
    },
    {
      ids: [285],
      bonuses: [
        {
          bonus: { torpedo: 2, avoid: 1 },
          shipId: [147, 195, 326, 407, 419, 420, 426, 437, 627, 647, 665, 666, 903, 908, 959],
          num: 1,
        },
        {
          bonus: { torpedo: 2, avoid: 1 },
          shipId: [147, 195, 326, 407, 419, 420, 426, 437, 627, 647, 665, 666, 903, 908, 959],
          num: 2,
        },
        {
          bonus: { firePower: 1, torpedo: 1 },
          shipId: [147, 195, 326, 407, 419, 420, 426, 437, 627, 647, 665, 666, 903, 908, 959],
          num: 1,
          remodel: 10,
        },
        {
          bonus: { firePower: 1 },
          shipId: [147, 195, 326, 407, 419, 420, 426, 437, 627, 647, 665, 666, 903, 908, 959],
          num: 2,
          remodel: 10,
        },
        {
          bonus: { torpedo: 3 },
          shipId: [147, 195, 326, 407, 419, 420, 426, 437, 627, 647, 665, 666, 903, 908, 959],
          num: 3,
          remodel: 10,
        },
        {
          bonus: { torpedo: 2 },
          shipId: [903],
          num: 2,
        },
        {
          bonus: { torpedo: 2 },
          shipId: [903],
          num: 3,
        },
        {
          bonus: { torpedo: 1 },
          shipId: [908, 959],
          num: 2,
        },
        {
          bonus: { torpedo: 1 },
          shipId: [908, 959],
          num: 3,
        },
      ],
    },
    {
      ids: [286],
      bonuses: [
        {
          bonus: { torpedo: 2, avoid: 1 },
          shipId: [144, 145, 198, 199, 463, 464, 468, 469, 470, 489, 490, 497, 498, 542, 543, 563, 564, 566, 567, 568, 569, 578, 587, 588, 648, 649, 651, 656, 667, 670, 915],
          num: 1,
        },
        {
          bonus: { torpedo: 2, avoid: 1 },
          shipId: [144, 145, 198, 199, 463, 464, 468, 469, 470, 489, 490, 497, 498, 542, 543, 563, 564, 566, 567, 568, 569, 578, 587, 588, 648, 649, 651, 656, 667, 670, 915],
          num: 2,
        },
        {
          bonus: { firePower: 1 },
          shipId: [144, 145, 198, 199, 463, 464, 468, 469, 470, 489, 490, 497, 498, 542, 543, 563, 564, 566, 567, 568, 569, 578, 587, 588, 648, 649, 651, 656, 667, 670, 915],
          num: 1,
          remodel: 10,
        },
        {
          bonus: { firePower: 1 },
          shipId: [144, 145, 198, 199, 463, 464, 468, 469, 470, 489, 490, 497, 498, 542, 543, 563, 564, 566, 567, 568, 569, 578, 587, 588, 648, 649, 651, 656, 667, 670, 915],
          num: 2,
          remodel: 10,
        },
        {
          bonus: { torpedo: 1 },
          shipId: [144, 145, 198, 199, 463, 464, 468, 469, 470, 489, 490, 497, 498, 542, 543, 563, 564, 566, 567, 568, 569, 578, 587, 588, 648, 649, 651, 656, 667, 670, 915],
          shipClass: [30],
          num: 1,
          remodel: 5,
        },
        {
          bonus: { torpedo: 1 },
          shipId: [144, 145, 198, 199, 463, 464, 468, 469, 470, 489, 490, 497, 498, 542, 543, 563, 564, 566, 567, 568, 569, 578, 587, 588, 648, 649, 651, 656, 667, 670, 915],
          shipClass: [30],
          num: 2,
          remodel: 5,
        },
        {
          bonus: { torpedo: 7, avoid: 2 },
          shipBase: [642],
          num: 1,
        },
        {
          bonus: { torpedo: 2 },
          shipBase: [642],
          num: 1,
          remodel: 7,
        },
        {
          bonus: { torpedo: 2 },
          shipBase: [642],
          num: 1,
          remodel: 10,
        },
        {
          bonus: { torpedo: 2 },
          shipId: [662, 663, 668],
        },
        {
          bonus: { torpedo: 3, avoid: 2 },
          shipId: [662, 663, 668],
          requiresSR: 1,
          num: 1,
        },
      ],
    },
    {
      ids: [287],
      bonuses: [
        {
          bonus: { asw: 1, avoid: 1 },
          shipId: [141, 160, 488, 624, 656],
        },
        {
          bonus: { asw: 3 },
          shipId: [662],
        },
      ],
    },
    {
      ids: [288],
      bonuses: [
        {
          bonus: { asw: 2, avoid: 1 },
          shipId: [141, 160, 488, 656],
        },
        {
          bonus: { firePower: 1, asw: 3, avoid: 2 },
          shipId: [624],
        },
        {
          bonus: { asw: 4, avoid: 1 },
          shipId: [662],
        },
      ],
    },
    {
      ids: [289],
      bonuses: [
        {
          bonus: { firePower: 2, antiAir: 1 },
          shipId: [149, 591],
        },
        {
          bonus: { firePower: 1 },
          shipId: [150, 152, 592],
        },
        {
          bonus: { firePower: 2, antiAir: 2, avoid: 2 },
          shipId: [151, 593, 954],
        },
        {
          bonus: { firePower: 2, avoid: 2 },
          shipId: [149, 151, 591, 593, 954],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { avoid: 1 },
          shipId: [151, 593, 954],
          remodel: 1,
        },
        {
          bonus: { antiAir: 1 },
          shipId: [151, 593, 954],
          remodel: 3,
        },
        {
          bonus: { firePower: 1 },
          shipId: [151, 593, 954],
          remodel: 5,
        },
        {
          bonus: { avoid: 1 },
          shipId: [151, 593, 954],
          remodel: 7,
        },
        {
          bonus: { antiAir: 1 },
          shipId: [151, 593, 954],
          remodel: 8,
        },
        {
          bonus: { firePower: 1 },
          shipId: [151, 593, 954],
          remodel: 9,
        },
        {
          bonus: { avoid: 1 },
          shipId: [151, 593, 954],
          remodel: 10,
        },
        {
          bonus: { antiAir: 1 },
          shipId: [591],
          remodel: 4,
        },
        {
          bonus: { avoid: 1 },
          shipId: [591],
          remodel: 6,
        },
        {
          bonus: { firePower: 1 },
          shipId: [591],
          remodel: 8,
        },
        {
          bonus: { avoid: 1 },
          shipId: [591],
          remodel: 10,
        },
        {
          bonus: { antiAir: 1 },
          shipId: [149, 150, 152, 592],
          remodel: 7,
        },
        {
          bonus: { firePower: 1 },
          shipId: [149, 150, 152, 592],
          remodel: 9,
        },
        {
          bonus: { avoid: 1 },
          shipId: [149, 150, 152, 592],
          remodel: 10,
        },
      ],
    },
    {
      ids: [290],
      bonuses: [
        {
          bonus: {
            firePower: 3, antiAir: 2, accuracy: 3, avoid: 1,
          },
          shipId: [553, 554],
        },
        {
          bonus: { avoid: 1 },
          shipId: [554],
        },
        {
          bonus: { firePower: 2, antiAir: 2, avoid: 1 },
          shipId: [82, 88],
        },
        {
          bonus: { antiAir: 2, avoid: 3 },
          shipId: [82, 88, 553, 554],
          requiresAR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipId: [411, 412],
        },
      ],
    },
    {
      ids: [291],
      bonuses: [
        {
          bonus: { firePower: 6, avoid: 1 },
          shipId: [553, 554],
        },
      ],
    },
    {
      ids: [292],
      bonuses: [
        {
          bonus: { firePower: 8, antiAir: 1, avoid: 2 },
          shipId: [553, 554],
        },
      ],
    },
    {
      ids: [293],
      bonuses: [
        {
          bonus: { firePower: 2, antiAir: 1, avoid: 3 },
          shipClass: [28, 66],
        },
        {
          bonus: { firePower: 2, torpedo: 1, avoid: 3 },
          shipClass: [28, 66],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 2, torpedo: 4 },
          shipClass: [28, 66],
          requiresId: [174],
          num: 1,
        },
        {
          bonus: { firePower: 1, torpedo: 3 },
          shipClass: [28, 66],
          requiresId: [174],
          requiresIdNum: 2,
          num: 1,
        },
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 2 },
          shipClass: [74, 77],
        },
        {
          bonus: { firePower: 2, asw: 1, avoid: 3 },
          shipClass: [74, 77],
          requiresSR: 1,
          num: 1,
        },
      ],
    },
    {
      ids: [294],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipClass: [1, 5, 12],
        },
        {
          bonus: { firePower: 3, torpedo: 1, avoid: 2 },
          shipClass: [1, 5, 12],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 1, torpedo: 3 },
          shipClass: [1, 5, 12],
          requiresId: [13, 125, 285],
          num: 1,
        },
        {
          bonus: { firePower: 1, torpedo: 2 },
          shipClass: [1, 5, 12],
          requiresId: [13, 125, 285],
          requiresIdNum: 2,
          num: 1,
        },
        {
          bonus: { torpedo: 1 },
          shipClass: [1, 5, 12],
          requiresId: [285],
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipId: [959],
        },
        {
          bonus: { firePower: 2 },
          shipId: [959],
          num: 2,
        },
        {
          bonus: { firePower: 3 },
          shipId: [959],
          num: 3,
        },
        {
          bonus: { accuracy: 4 },
          shipId: [959],
          remodel: 6,
        },
        {
          bonus: { firePower: 6 },
          shipId: [959],
          remodel: 7,
        },
        {
          bonus: { firePower: 1 },
          shipId: [959],
          remodel: 8,
        },
        {
          bonus: { firePower: 1 },
          shipId: [959],
          remodel: 9,
        },
        {
          bonus: { firePower: 1 },
          shipId: [959],
          remodel: 10,
        },
      ],
    },
    {
      ids: [295],
      bonuses: [
        {
          bonus: { firePower: 2, antiAir: 2 },
          shipClass: [1, 5, 12],
        },
        {
          bonus: { firePower: 3, torpedo: 1, avoid: 2 },
          shipClass: [1, 5, 12],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 6 },
          shipClass: [1, 5, 12],
          requiresAR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 1, antiAir: 1, asw: 1 },
          shipId: [666],
        },
        {
          bonus: { firePower: 1, torpedo: 3 },
          shipClass: [1, 5, 12],
          requiresId: [13, 125, 285],
          num: 1,
        },
        {
          bonus: { firePower: 1, torpedo: 2 },
          shipClass: [1, 5, 12],
          requiresId: [13, 125, 285],
          requiresIdNum: 2,
          num: 1,
        },
        {
          bonus: { torpedo: 1 },
          shipClass: [1, 5, 12],
          requiresId: [285],
          num: 1,
        },
        {
          bonus: { firePower: 2 },
          shipId: [959],
        },
        {
          bonus: { firePower: 2 },
          shipId: [959],
          num: 2,
        },
        {
          bonus: { firePower: 3 },
          shipId: [959],
          num: 3,
        },
      ],
    },
    {
      ids: [296],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipClass: [1, 5, 10],
        },
        {
          bonus: { firePower: 1, torpedo: 2, avoid: 2 },
          shipClass: [1, 5, 10],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 5 },
          shipClass: [1, 5, 10],
          requiresAR: 1,
          num: 1,
        },
        {
          bonus: { avoid: 1 },
          shipClass: [10],
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipClass: [23],
        },
        {
          bonus: { firePower: 1, torpedo: 3, avoid: 2 },
          shipClass: [23],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 6 },
          shipClass: [23],
          requiresAR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipId: [145],
        },
        {
          bonus: { firePower: 1, torpedo: 1 },
          shipId: [144],
        },
        {
          bonus: { avoid: 1 },
          shipId: [242, 244, 469, 587, 588, 667],
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipId: [497],
        },
        {
          bonus: { antiAir: 1, avoid: 1 },
          shipId: [498],
        },
        {
          bonus: { firePower: 2, torpedo: 1 },
          shipId: [627],
        },
        {
          bonus: { firePower: 1, torpedo: 3 },
          shipClass: [1, 5, 10],
          requiresId: [125, 285],
          num: 1,
        },
        {
          bonus: { firePower: 1, torpedo: 3 },
          shipClass: [23],
          requiresId: [15, 286],
          num: 1,
        },
        {
          bonus: { firePower: 3 },
          shipId: [903, 908],
        },
      ],
    },
    {
      ids: [297],
      bonuses: [
        {
          bonus: { avoid: 2 },
          shipClass: [12],
        },
        {
          bonus: { avoid: 1 },
          shipClass: [1, 5],
        },
      ],
    },
    {
      ids: [298, 299, 300],
      bonuses: [
        {
          bonus: { firePower: 2, armor: 1 },
          shipClass: [67, 78, 82, 88, 108, 112],
        },
        {
          bonus: { avoid: -2 },
          shipClass: [67],
        },
        {
          bonus: { firePower: 1, armor: 1, avoid: -3 },
          shipId: [149, 150, 151, 152],
        },
        {
          bonus: { firePower: 2, armor: 1, avoid: -2 },
          shipId: [591, 592],
        },
        {
          bonus: { firePower: 1, armor: 1, avoid: -1 },
          shipId: [593, 954],
        },
      ],
    },
    {
      ids: [301],
      bonuses: [
        {
          bonus: { antiAir: 2, armor: 1, avoid: 1 },
          shipClass: [67, 78, 82, 88, 108, 112],
        },
      ],
    },
    {
      ids: [302],
      bonuses: [
        {
          bonus: { asw: 1, avoid: 1 },
          shipClass: [76],
        },
      ],
    },
    {
      ids: [303],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipClass: [4, 16, 20, 41],
        },
        {
          bonus: { firePower: 1, antiAir: 2, avoid: 1 },
          shipClass: [89],
        },
      ],
    },
    {
      ids: [304],
      bonuses: [
        {
          bonus: { firePower: 1, asw: 1, avoid: 1 },
          shipClass: [4, 16, 20, 41],
        },
        {
          bonus: { firePower: 1, asw: 2, avoid: 2 },
          shipClass: [89],
        },
      ],
    },
    {
      ids: [305, 306],
      bonuses: [
        {
          bonus: { asw: 1, avoid: 1 },
          shipClass: [76],
        },
        {
          bonus: { asw: 2, avoid: 1 },
          shipBase: [534],
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipBase: [432, 444],
        },
      ],
    },
    {
      ids: [307],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 1 },
          shipCountry: Const.USA,
        },
      ],
    },
    {
      ids: [308],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 1 },
          shipCountry: Const.USA,
        },
        {
          bonus: { firePower: 1 },
          shipType: [2],
        },
        {
          bonus: { antiAir: 1, avoid: 1 },
          shipType: [1],
        },
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 1 },
          shipId: [651, 656],
        },
      ],
    },
    {
      ids: [310],
      bonuses: [
        {
          bonus: { firePower: 2, antiAir: 1, avoid: 1 },
          shipClass: [34],
        },
        {
          bonus: { firePower: 2 },
          shipClass: [34],
          remodel: 10,
        },
        {
          bonus: { firePower: 2, avoid: 1 },
          shipClass: [56],
        },
        {
          bonus: { firePower: 2, avoid: 2 },
          shipClass: [56],
          remodel: 10,
        },
        {
          bonus: {
            firePower: 3, torpedo: 2, antiAir: 1, avoid: 1,
          },
          shipClass: [90],
        },
        {
          bonus: { firePower: 1, torpedo: 1 },
          shipClass: [90],
          remodel: 10,
        },
        {
          bonus: { firePower: 2, asw: 1, avoid: 1 },
          shipId: [622, 623, 624],
        },
        {
          bonus: { firePower: 3, torpedo: 2, avoid: 2 },
          shipId: [622, 623, 624],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 1, torpedo: 1 },
          shipId: [622, 623, 624],
          remodel: 7,
        },
      ],
    },
    {
      ids: [313],
      bonuses: [
        {
          bonus: {
            firePower: 2, antiAir: 2, armor: 1, avoid: 1,
          },
          shipClass: [87, 91],
        },
        {
          bonus: {
            firePower: 2, antiAir: 2, armor: 1, avoid: 1,
          },
          shipId: [651, 656],
        },
      ],
    },
    {
      ids: [314],
      bonuses: [
        {
          bonus: { firePower: 1, torpedo: 3 },
          shipClass: [87, 91],
        },
      ],
    },
    {
      ids: [315],
      bonuses: [
        {
          bonus: { firePower: 2, avoid: 3, scout: 4 },
          shipCountry: Const.USA,
        },
        {
          bonus: { firePower: 1 },
          shipClass: [87, 91],
        },
        {
          bonus: { range: 1 },
          shipClass: [87, 91],
          num: 1,
        },
        {
          bonus: {
            firePower: 2, avoid: 2, scout: 3, range: 1,
          },
          shipId: [651, 656],
          num: 1,
        },
      ],
    },
    {
      ids: [316],
      bonuses: [
        {
          bonus: { firePower: 4, antiAir: 1, avoid: 1 },
          shipClass: [68],
        },
      ],
    },
    {
      ids: [317],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipClass: [6],
          num: 1,
        },
        {
          bonus: { firePower: 2, antiAir: 2 },
          shipId: [149, 591, 592],
          num: 1,
        },
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipId: [150],
          num: 1,
        },
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 1 },
          shipId: [151],
          num: 1,
        },
        {
          bonus: { firePower: 1, antiAir: 3, avoid: 2 },
          shipId: [593],
          num: 1,
        },
        {
          bonus: { firePower: 2, antiAir: 2, avoid: 1 },
          shipId: [954],
          num: 1,
        },
        {
          bonus: { firePower: 2, antiAir: 1 },
          shipId: [152],
          num: 1,
        },
        {
          bonus: { firePower: 1, antiAir: 2 },
          shipId: [541],
          num: 1,
        },
        {
          bonus: { firePower: 2, antiAir: 2, avoid: 1 },
          shipId: [573],
          num: 1,
        },
      ],
    },
    {
      ids: [318],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipId: [411, 412],
        },
        {
          bonus: { firePower: 2, antiAir: 2, avoid: 2 },
          shipId: [82, 88],
        },
        {
          bonus: {
            firePower: 2, antiAir: 2, accuracy: 3, avoid: 2,
          },
          shipId: [553],
        },
        {
          bonus: { armor: 1, avoid: 2 },
          shipId: [553],
          requiresId: [290],
          num: 1,
        },
        {
          bonus: {
            firePower: 3, antiAir: 2, accuracy: 3, avoid: 2,
          },
          shipId: [554],
        },
        {
          bonus: {
            firePower: 1, armor: 1, accuracy: 1, avoid: 2,
          },
          shipId: [554],
          requiresId: [290],
          num: 1,
        },
        {
          bonus: { antiAir: 2, accuracy: 1, avoid: 3 },
          shipId: [82, 88, 553, 554],
          requiresAR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: -2, accuracy: -1, avoid: -3 },
          shipId: [82, 88, 553, 554],
          requiresAR: 1,
          requiresId: [290],
          num: 1,
        },
        {
          bonus: {
            firePower: 3, antiAir: 2, accuracy: 2, avoid: 1,
          },
          shipId: [541, 573],
        },
        {
          bonus: {
            firePower: 2, armor: 1, accuracy: 1, avoid: 2,
          },
          shipId: [541, 573],
          requiresId: [290],
          num: 1,
        },
      ],
    },
    {
      ids: [319],
      bonuses: [
        {
          bonus: { firePower: 7, antiAir: 3, avoid: 2 },
          shipId: [553, 554],
        },
      ],
    },
    {
      ids: [320],
      bonuses: [
        {
          bonus: { firePower: 2 },
          shipId: [553],
        },
        {
          bonus: { firePower: 3 },
          shipId: [196, 197],
        },
        {
          bonus: { firePower: 4 },
          shipId: [508, 509, 554],
        },
      ],
    },
    {
      ids: [322],
      bonuses: [
        {
          bonus: {
            firePower: 5, antiAir: 2, asw: 1, avoid: 2,
          },
          shipId: [553, 554],
        },
      ],
    },
    {
      ids: [323],
      bonuses: [
        {
          bonus: {
            firePower: 6, antiAir: 3, asw: 2, avoid: 3,
          },
          shipId: [553, 554],
        },
      ],
    },
    {
      ids: [324, 325],
      bonuses: [
        {
          bonus: { firePower: 2, asw: 3, avoid: 1 },
          shipId: [554, 646],
        },
        {
          bonus: { firePower: 1, asw: 2, avoid: 1 },
          shipId: [553],
        },
      ],
    },
    {
      ids: [326],
      bonuses: [
        {
          bonus: { firePower: 3, asw: 5, avoid: 3 },
          shipId: [646],
        },
        {
          bonus: { firePower: 3, asw: 4, avoid: 2 },
          shipId: [554],
        },
        {
          bonus: { firePower: 1, asw: 3, avoid: 1 },
          shipId: [553],
        },
      ],
    },
    {
      ids: [327],
      bonuses: [
        {
          bonus: { firePower: 5, asw: 6, avoid: 4 },
          shipId: [646],
        },
        {
          bonus: { firePower: 4, asw: 5, avoid: 2 },
          shipId: [554],
        },
        {
          bonus: { firePower: 2, asw: 4, avoid: 1 },
          shipId: [553],
        },
      ],
    },
    {
      ids: [328],
      bonuses: [
        {
          bonus: { firePower: 1, avoid: 1 },
          shipBase: [78, 79, 85, 86],
        },
        {
          bonus: { firePower: 1 },
          shipId: [149, 150, 151, 152, 209, 210, 211, 212],
        },
        {
          bonus: { firePower: 2, torpedo: 1 },
          shipId: [591],
        },
        {
          bonus: { firePower: 2, antiAir: 1 },
          shipId: [592, 954],
        },
        {
          bonus: { firePower: 1, antiAir: 2 },
          shipId: [593],
        },
        {
          bonus: { firePower: 1 },
          shipBase: [26, 27, 77, 87],
        },
      ],
    },
    {
      ids: [329],
      bonuses: [
        {
          bonus: { firePower: 1, avoid: 1 },
          shipBase: [78, 79, 85, 86],
        },
        {
          bonus: { firePower: 1 },
          shipId: [209, 210, 211, 212],
        },
        {
          bonus: { firePower: 2, antiAir: 1 },
          shipId: [149, 150, 151, 152],
        },
        {
          bonus: { firePower: 3, torpedo: 2, antiAir: 1 },
          shipId: [591, 592, 954],
        },
        {
          bonus: { firePower: 2, torpedo: 1, antiAir: 3 },
          shipId: [593],
        },
        {
          bonus: { firePower: 1 },
          shipBase: [26, 27, 77, 87],
        },
      ],
    },
    {
      ids: [330],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipClass: [93],
        },
        {
          bonus: { firePower: 1 },
          shipClass: [19, 88],
        },
        {
          bonus: { firePower: 1 },
          shipId: [541, 573, 576],
        },
      ],
    },
    {
      ids: [331],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipClass: [93],
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipId: [918, 1496],
        },
        {
          bonus: { firePower: 1 },
          shipClass: [19, 88],
        },
        {
          bonus: { firePower: 1 },
          shipId: [541, 573, 576],
        },
      ],
    },
    {
      ids: [332],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipClass: [93],
        },
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 1 },
          shipId: [918, 1496],
        },
        {
          bonus: { firePower: 1 },
          shipClass: [19, 88],
        },
        {
          bonus: { firePower: 1 },
          shipId: [541, 573, 576],
        },
      ],
    },
    {
      ids: [335],
      bonuses: [
        {
          bonus: { antiAir: 1, avoid: 1 },
          shipId: [277, 278],
        },
        {
          bonus: { antiAir: 2, avoid: 1 },
          shipId: [594, 599, 610, 646, 698],
        },
      ],
    },
    {
      ids: [336],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 1 },
          shipId: [277, 278],
        },
        {
          bonus: { firePower: 1, antiAir: 2, avoid: 1 },
          shipId: [594, 599, 610, 646, 698],
        },
      ],
    },
    {
      ids: [337],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 1 },
          shipId: [277, 278],
        },
        {
          bonus: { firePower: 2, antiAir: 2, avoid: 1 },
          shipId: [594, 599, 610, 646, 698],
        },
      ],
    },
    {
      ids: [338],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 2 },
          shipId: [277, 278],
        },
        {
          bonus: { firePower: 1, antiAir: 2, avoid: 3 },
          shipId: [594, 646, 698],
        },
        {
          bonus: { firePower: 4, antiAir: 3, avoid: 4 },
          shipId: [599, 610],
        },
      ],
    },
    {
      ids: [339],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 2, avoid: 2 },
          shipId: [277, 278],
        },
        {
          bonus: { firePower: 1, antiAir: 3, avoid: 4 },
          shipId: [594, 646, 698],
        },
        {
          bonus: { firePower: 6, antiAir: 4, avoid: 5 },
          shipId: [599, 610],
        },
      ],
    },
    {
      ids: [340],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 1 },
          shipBase: [589, 590],
        },
      ],
    },
    {
      ids: [341],
      bonuses: [
        {
          bonus: { firePower: 2, antiAir: 1, avoid: 1 },
          shipBase: [589, 590],
        },
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 1 },
          shipBase: [574],
        },
      ],
    },
    {
      ids: [342],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipId: [277, 278, 461, 462, 466, 467],
        },
        {
          bonus: { firePower: 2, antiAir: 1, avoid: 1 },
          shipId: [594, 646, 698],
        },
        {
          bonus: { firePower: 3, antiAir: 2, avoid: 2 },
          shipId: [599, 610],
        },
      ],
    },
    {
      ids: [343],
      bonuses: [
        {
          bonus: { firePower: 2 },
          shipId: [277, 278],
        },
        {
          bonus: { firePower: 1 },
          shipId: [461, 462, 466, 467],
        },
        {
          bonus: { firePower: 3, antiAir: 2, avoid: 1 },
          shipId: [594, 646, 698],
        },
        {
          bonus: { firePower: 5, antiAir: 3, avoid: 3 },
          shipId: [599, 610],
        },
      ],
    },
    {
      ids: [344],
      bonuses: [
        {
          bonus: { firePower: 3 },
          shipId: [599, 610],
        },
        {
          bonus: { firePower: 2, asw: 2 },
          shipId: [555, 560],
        },
        {
          bonus: { firePower: 4, asw: 1 },
          shipId: [318],
        },
        {
          bonus: { firePower: 2, asw: 1 },
          shipId: [282],
        },
        {
          bonus: { firePower: 4, asw: 2 },
          shipId: [888],
        },
        {
          bonus: { firePower: 5, asw: 2 },
          shipId: [883],
        },
      ],
    },
    {
      ids: [345],
      bonuses: [
        {
          bonus: { firePower: 3, avoid: 1 },
          shipId: [599, 610],
        },
        {
          bonus: { firePower: 3, asw: 2, avoid: 2 },
          shipId: [555, 560],
        },
        {
          bonus: { firePower: 5, asw: 1, avoid: 2 },
          shipId: [318],
        },
        {
          bonus: { firePower: 3, asw: 1, avoid: 1 },
          shipId: [282],
        },
        {
          bonus: { firePower: 4, asw: 2, avoid: 2 },
          shipId: [888],
        },
        {
          bonus: { firePower: 5, asw: 2, avoid: 3 },
          shipId: [883],
        },
      ],
    },
    {
      ids: [356, 357],
      bonuses: [
        {
          bonus: { firePower: 2 },
          shipClass: [95],
        },
        {
          bonus: { firePower: 1 },
          shipClass: [9],
        },
      ],
    },
    {
      ids: [358],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 1 },
          shipCountry: Const.USA,
        },
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 1 },
          shipClass: [67, 78, 82, 88, 108, 112],
        },
        {
          bonus: { firePower: 1, antiAir: 2, avoid: 2 },
          shipClass: [95],
        },
      ],
    },
    {
      ids: [359],
      bonuses: [
        {
          bonus: { firePower: 2, antiAir: 2, avoid: 1 },
          shipBase: [613],
        },
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 1 },
          shipBase: [115],
        },
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipId: [622, 623, 624],
        },
      ],
    },
    {
      ids: [360, 361],
      bonuses: [
        {
          bonus: { firePower: 2, antiAir: 2, avoid: 1 },
          shipBase: [604],
        },
        {
          bonus: { firePower: 2, antiAir: 1, avoid: 1 },
          shipBase: [574],
        },
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipClass: [41],
        },
      ],
    },
    {
      ids: [362, 363],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 2, avoid: 1 },
          shipClass: [99],
        },
        {
          bonus: { firePower: -3, antiAir: -3, avoid: -8 },
          shipClass: [21, 34],
        },
        {
          bonus: { firePower: -3, antiAir: -2, avoid: -6 },
          shipClass: [4, 16, 20],
        },
        {
          bonus: { firePower: -2, antiAir: -1, avoid: -4 },
          shipClass: [56, 89],
        },
        {
          bonus: { antiAir: -1, avoid: -2 },
          shipClass: [41, 52, 98],
        },
        {
          bonus: { antiAir: 1, avoid: 1 },
          shipCountry: Const.USA,
        },
      ],
    },
    {
      ids: [364],
      bonuses: [
        {
          bonus: { firePower: 1, torpedo: 1, avoid: 5 },
          shipId: [118, 119, 506, 586, 623, 657, 668],
        },
        {
          bonus: { torpedo: 1 },
          shipId: [119],
        },
        {
          bonus: { firePower: 1, torpedo: 3 },
          shipId: [623],
        },
        {
          bonus: { firePower: -1, avoid: -7 },
        },
      ],
    },
    {
      ids: [365],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipClass: [2, 6, 19, 26, 37],
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipId: [136, 148, 541, 546, 573, 593, 911, 916],
          num: 1,
        },
        {
          bonus: { firePower: 2 },
          shipId: [591, 592, 954],
          num: 1,
        },
      ],
    },
    {
      ids: [367],
      bonuses: [
        {
          bonus: {
            firePower: 2, asw: 1, avoid: 1, scout: 1,
          },
          shipBase: [574],
        },
        {
          bonus: {
            firePower: 1, asw: 1, avoid: 1, scout: 1,
          },
          shipClass: [70],
        },
        {
          bonus: { firePower: 1, avoid: 1, scout: 1 },
          shipClass: [62, 72],
        },
        {
          bonus: { firePower: 2, avoid: 2, scout: 2 },
          shipClass: [67, 78, 82, 88, 108, 112],
        },
      ],
    },
    {
      ids: [368],
      bonuses: [
        {
          bonus: {
            firePower: 4, asw: 3, avoid: 2, scout: 3,
          },
          shipBase: [574],
        },
        {
          bonus: {
            firePower: 2, torpedo: 2, avoid: 1, scout: 1,
          },
          shipId: [630],
          num: 1,
        },
        {
          bonus: {
            firePower: 2, asw: 3, avoid: 1, scout: 2,
          },
          shipClass: [70],
        },
        {
          bonus: {
            firePower: 1, asw: 2, avoid: 1, scout: 2,
          },
          shipClass: [62, 72],
        },
        {
          bonus: {
            firePower: 2, asw: 2, avoid: 2, scout: 2,
          },
          shipClass: [67, 78, 82, 88, 108, 112],
        },
      ],
    },
    {
      ids: [369],
      bonuses: [
        {
          bonus: {
            firePower: 5, asw: 4, avoid: 4, scout: 3,
          },
          shipBase: [574],
        },
        {
          bonus: {
            firePower: 3, torpedo: 3, avoid: 2, scout: 2,
          },
          shipId: [630],
          num: 1,
        },
        {
          bonus: {
            firePower: 3, asw: 3, avoid: 2, scout: 3,
          },
          shipClass: [70],
        },
        {
          bonus: {
            firePower: 2, asw: 2, avoid: 1, scout: 2,
          },
          shipClass: [62, 72],
        },
        {
          bonus: {
            firePower: 2, asw: 2, avoid: 2, scout: 2,
          },
          shipClass: [67, 78, 82, 88, 108, 112],
        },
      ],
    },
    {
      ids: [370],
      bonuses: [
        {
          bonus: {
            firePower: 1, asw: 3, avoid: 1, scout: 2,
          },
          shipBase: [574],
        },
        {
          bonus: {
            firePower: 1, asw: 3, avoid: 1, scout: 1,
          },
          shipClass: [70],
        },
        {
          bonus: {
            firePower: 1, asw: 2, avoid: 1, scout: 1,
          },
          shipClass: [62, 72],
        },
        {
          bonus: {
            firePower: 2, asw: 3, avoid: 2, scout: 2,
          },
          shipClass: [67, 78, 82, 88, 108, 112],
        },
        {
          bonus: { firePower: 4, avoid: 1, scout: 1 },
          shipBase: [439],
          num: 1,
        },
      ],
    },
    {
      ids: [371],
      bonuses: [
        {
          bonus: {
            firePower: 4, asw: 2, avoid: 3, scout: 6,
          },
          shipBase: [574],
        },
        {
          bonus: { firePower: 2, avoid: 2, scout: 3 },
          shipId: [630],
          num: 1,
        },
        {
          bonus: {
            firePower: 2, asw: 1, avoid: 2, scout: 4,
          },
          shipClass: [70],
        },
        {
          bonus: { firePower: 2, avoid: 1, scout: 3 },
          shipClass: [79],
        },
        {
          bonus: {
            firePower: 3, asw: 1, avoid: 2, scout: 3,
          },
          shipClass: [67, 78, 82, 88, 108, 112],
        },
        {
          bonus: { firePower: 3, avoid: 2, scout: 2 },
          shipClass: [88],
          num: 1,
        },
      ],
    },
    {
      ids: [372],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipBase: [75, 92, 110, 111, 153],
        },
        {
          bonus: { torpedo: 1 },
          shipBase: [110, 111, 153],
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipId: [108, 109, 291, 292, 296, 297, 508, 509],
        },
        {
          bonus: { asw: 1 },
          shipId: [74, 116, 117, 185, 282, 318, 555, 560],
        },
        {
          bonus: { torpedo: 1 },
          shipId: [318, 555, 560],
          num: 1,
        },
        {
          bonus: { firePower: 2, asw: 1 },
          shipId: [883, 888],
        },
        {
          bonus: { torpedo: 2 },
          shipId: [883, 888],
          num: 1,
        },
      ],
    },
    {
      ids: [373],
      bonuses: [
        {
          bonus: { firePower: 2 },
          shipBase: [110],
        },
        {
          bonus: { firePower: 1 },
          shipBase: [75, 92, 111, 153],
        },
        {
          bonus: { torpedo: 2, avoid: 2 },
          shipBase: [110, 153],
          num: 1,
        },
        {
          bonus: { torpedo: 2, avoid: 3 },
          shipBase: [111],
          num: 1,
        },
        {
          bonus: { torpedo: 1, avoid: 1 },
          shipBase: [75, 92],
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipId: [108, 109, 291, 292, 296, 297, 508, 509],
        },
        {
          bonus: { asw: 1 },
          shipId: [74, 116],
        },
        {
          bonus: { firePower: 1, asw: 1 },
          shipId: [117, 185, 282],
        },
        {
          bonus: { firePower: 1, asw: 2 },
          shipId: [318, 555, 560, 883],
        },
        {
          bonus: { firePower: 2, asw: 2 },
          shipId: [888],
        },
        {
          bonus: { torpedo: 1 },
          shipId: [117, 185, 282, 291, 292],
          num: 1,
        },
        {
          bonus: { torpedo: 1, avoid: 1 },
          shipId: [296, 297, 318, 555, 560],
          num: 1,
        },
        {
          bonus: { torpedo: 2, avoid: 2 },
          shipId: [508, 509, 888],
          num: 1,
        },
        {
          bonus: { torpedo: 3, avoid: 4 },
          shipId: [883],
          num: 1,
        },
      ],
    },
    {
      ids: [374],
      bonuses: [
        {
          bonus: { firePower: 3 },
          shipBase: [110],
        },
        {
          bonus: { firePower: 2 },
          shipBase: [111, 153],
        },
        {
          bonus: { firePower: 1 },
          shipBase: [75, 92],
        },
        {
          bonus: { torpedo: 3, avoid: 3 },
          shipBase: [110],
          num: 1,
        },
        {
          bonus: { torpedo: 3, avoid: 4 },
          shipBase: [111],
          num: 1,
        },
        {
          bonus: { torpedo: 3, avoid: 2 },
          shipBase: [153],
          num: 1,
        },
        {
          bonus: { torpedo: 2, avoid: 2 },
          shipBase: [75, 92],
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipId: [108, 109],
        },
        {
          bonus: { firePower: 1, asw: 1 },
          shipId: [74, 116, 291, 292, 296, 297],
        },
        {
          bonus: { firePower: 1, asw: 2 },
          shipId: [117, 185, 282, 508, 509],
        },
        {
          bonus: { firePower: 1, asw: 3 },
          shipId: [318, 555, 560],
        },
        {
          bonus: { firePower: 2, asw: 3 },
          shipId: [883],
        },
        {
          bonus: { firePower: 3, asw: 3 },
          shipId: [888],
        },
        {
          bonus: { torpedo: 1 },
          shipId: [108, 109, 291, 292],
          num: 1,
        },
        {
          bonus: { torpedo: 1, avoid: 1 },
          shipId: [117, 185, 282, 296, 297],
          num: 1,
        },
        {
          bonus: { torpedo: 1, avoid: 2 },
          shipId: [318, 555, 560],
          num: 1,
        },
        {
          bonus: { torpedo: 2, avoid: 3 },
          shipId: [508, 509, 888],
          num: 1,
        },
        {
          bonus: { torpedo: 3, avoid: 5 },
          shipId: [883],
          num: 1,
        },
      ],
    },
    {
      ids: [375],
      bonuses: [
        {
          bonus: {
            firePower: 3, antiAir: 3, asw: 3, avoid: 3,
          },
          shipClass: [69, 83, 84, 105, 116, 118],
        },
        {
          bonus: {
            firePower: 1, antiAir: 1, asw: 1, avoid: 1,
          },
          shipBase: [84],
        },
      ],
    },
    {
      ids: [376],
      bonuses: [
        {
          bonus: { firePower: 2, torpedo: 4 },
          shipCountry: Const.USA,
        },
        {
          bonus: { firePower: 1, torpedo: 2 },
          shipClass: [67, 78, 82, 88, 108, 112],
        },
        {
          bonus: { firePower: 1, torpedo: 1 },
          shipClass: [96],
        },
      ],
    },
    {
      ids: [377],
      bonuses: [
        {
          bonus: { asw: 2, avoid: 1 },
          shipCountry: Const.USA,
          num: 1,
        },
        {
          bonus: { asw: 1, avoid: 2 },
          shipId: [629, 651, 656],
          num: 1,
        },
        {
          bonus: { asw: 1, avoid: 1 },
          shipClass: [67, 78, 82, 88, 96, 108, 112],
          num: 1,
        },
      ],
    },
    {
      ids: [378],
      bonuses: [
        {
          bonus: { asw: 3, avoid: 1 },
          shipCountry: Const.USA,
          num: 1,
        },
        {
          bonus: { asw: 1, avoid: 1 },
          shipId: [629, 651, 656],
          num: 1,
        },
        {
          bonus: { asw: 2, avoid: 1 },
          shipClass: [67, 78, 82, 88, 108, 112],
          num: 1,
        },
        {
          bonus: { asw: 1, avoid: 1 },
          shipClass: [96],
          num: 1,
        },
      ],
    },
    {
      ids: [379],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 2 },
          shipType: [1],
        },
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipType: [16, 21],
        },
        {
          bonus: { firePower: 1, antiAir: 2 },
          shipClass: [28, 66, 101],
        },
        {
          bonus: { firePower: 2, antiAir: 2 },
          shipClass: [101],
          num: 1,
        },
        {
          bonus: { firePower: 2 },
          shipBase: [22, 23, 56, 113],
        },
        {
          bonus: { firePower: 2, antiAir: 2 },
          shipBase: [24, 25],
        },
        {
          bonus: { asw: 1 },
          shipBase: [22, 23, 56, 113, 115],
        },
        {
          bonus: { firePower: 1 },
          shipBase: [51, 52, 115],
        },
        {
          bonus: { antiAir: 4 },
          shipId: [488],
        },
        {
          bonus: { antiAir: 3 },
          shipId: [141, 160, 220, 487],
        },
        {
          bonus: { antiAir: 2 },
          shipId: [22, 23, 56, 113, 219, 224, 289],
        },
        {
          bonus: { firePower: 3, antiAir: 3 },
          shipId: [651, 656],
        },
        {
          bonus: { asw: 2, avoid: 3 },
          shipId: [656],
        },
        {
          bonus: { asw: 1 },
          shipId: [141, 160, 487, 488],
        },
        {
          bonus: { asw: 2 },
          shipId: [477, 478, 624],
        },
        {
          bonus: { antiAir: 2 },
          shipId: [477, 478, 622, 624],
        },
        {
          bonus: { firePower: 2, antiAir: 2 },
          shipId: [146, 547, 652, 657],
          num: 1,
        },
        {
          bonus: { firePower: 1, avoid: 2 },
          shipType: [3, 4, 16, 21],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 1, avoid: 4 },
          shipType: [1],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 2, avoid: 3 },
          shipClass: [21, 28, 34, 66],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 4, avoid: 3 },
          shipClass: [101],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 2, avoid: 2 },
          shipId: [488, 651, 656],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipId: [118, 119, 141, 146, 160, 487, 547, 652, 657],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 3, avoid: 2 },
          shipId: [656],
          requiresAR: 1,
          num: 1,
        },
      ],
    },
    {
      ids: [380],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 2 },
          shipType: [16, 21],
        },
        {
          bonus: { firePower: 1, antiAir: 2 },
          shipClass: [101],
        },
        {
          bonus: { firePower: 2, antiAir: 2 },
          shipClass: [101],
          num: 1,
        },
        {
          bonus: { firePower: 2 },
          shipBase: [22, 23, 56, 113],
        },
        {
          bonus: { firePower: 3, antiAir: 2 },
          shipBase: [24, 25],
        },
        {
          bonus: { asw: 1 },
          shipBase: [22, 23, 56, 113, 115],
        },
        {
          bonus: { firePower: 1 },
          shipBase: [51, 52, 115],
        },
        {
          bonus: { antiAir: 4 },
          shipId: [488],
        },
        {
          bonus: { antiAir: 3 },
          shipId: [141, 160, 220, 487],
        },
        {
          bonus: { antiAir: 2 },
          shipId: [22, 23, 56, 113, 219, 224, 289],
        },
        {
          bonus: { firePower: 3, antiAir: 3 },
          shipId: [651, 656],
        },
        {
          bonus: { firePower: 2, antiAir: 2 },
          shipId: [407, 665],
        },
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 2 },
          shipId: [407, 665],
          num: 1,
        },
        {
          bonus: { asw: 1 },
          shipId: [141, 160, 487, 488],
        },
        {
          bonus: { asw: 2 },
          shipId: [477, 478, 624],
        },
        {
          bonus: { antiAir: 2 },
          shipId: [477, 478, 622, 624],
        },
        {
          bonus: { firePower: 3 },
          shipId: [652, 657],
        },
        {
          bonus: { firePower: 2 },
          shipId: [146, 547],
          num: 1,
        },
        {
          bonus: { antiAir: 2 },
          shipId: [146, 547, 652, 657],
          num: 1,
        },
        {
          bonus: { firePower: 2, avoid: 1 },
          shipType: [3, 4, 16, 21],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 4, avoid: 3 },
          shipClass: [101],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 1, avoid: 2 },
          shipId: [118, 119, 141, 160, 487, 488, 651, 656],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 1, avoid: 3 },
          shipId: [146, 547, 652, 657],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 2, avoid: 1 },
          shipId: [407, 665],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 1, antiAir: 2, avoid: 1 },
          shipId: [407, 665],
          requiresType: [21],
          num: 1,
        },
      ],
    },
    {
      ids: [381],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipCountry: Const.USA,
        },
        {
          bonus: { firePower: 1 },
          shipClass: [102],
        },
        {
          bonus: { firePower: 1 },
          shipCountry: Const.USA,
          remodel: 6,
        },
      ],
    },
    {
      ids: [382],
      bonuses: [
        {
          bonus: { antiAir: 2, asw: 1, avoid: 2 },
          shipType: [1],
        },
        {
          bonus: { firePower: 2, avoid: 3 },
          shipType: [1],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 2, avoid: 3 },
          shipType: [1],
          requiresAR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 2, avoid: 1 },
          shipClass: [28, 66, 101],
        },
        {
          bonus: { firePower: 1, avoid: 2 },
          shipClass: [28, 66, 101],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 2, avoid: 2 },
          shipClass: [28, 66, 101],
          requiresAR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 1 },
          shipBase: [23, 56, 113],
        },
        {
          bonus: { avoid: 1 },
          shipId: [220, 224, 289],
        },
        {
          bonus: { avoid: 1 },
          shipId: [160, 487, 488],
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipId: [160, 487, 488],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 2, avoid: 2 },
          shipId: [160, 487, 488],
          requiresAR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 3, avoid: 2 },
          shipId: [656],
        },
        {
          bonus: { firePower: 2, avoid: 2 },
          shipId: [656],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 3, avoid: 2 },
          shipId: [656],
          requiresAR: 1,
          num: 1,
        },
      ],
    },
    {
      ids: [383],
      bonuses: [
        {
          bonus: { torpedo: 2 },
          shipClass: [44],
        },
        {
          bonus: { torpedo: 1 },
          shipBase: [127],
        },
        {
          bonus: { torpedo: 3 },
          shipId: [636],
        },
        {
          bonus: { torpedo: 4 },
          shipId: [607],
        },
      ],
    },
    {
      ids: [384],
      bonuses: [
        {
          bonus: { avoid: 3 },
          shipClass: [44],
        },
        {
          bonus: { avoid: 2 },
          shipBase: [127],
        },
        {
          bonus: { avoid: 3 },
          shipId: [636],
        },
        {
          bonus: { avoid: 4 },
          shipId: [607],
        },
        {
          bonus: { torpedo: 3, avoid: 2 },
          requiresId: [213, 214, 383],
          num: 1,
        },
      ],
    },
    {
      ids: [385],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipCountry: Const.USA,
        },
        {
          bonus: { firePower: 1 },
          shipCountry: Const.USA,
          remodel: 6,
        },
        {
          bonus: { armor: 1 },
          shipCountry: Const.USA,
          remodel: 10,
        },
        {
          bonus: { firePower: 1, armor: 1 },
          shipClass: [102, 107],
        },
        {
          bonus: { firePower: 1 },
          shipClass: [93],
        },
        {
          bonus: { firePower: 1 },
          shipType: [8],
        },
      ],
    },
    {
      ids: [386, 387],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipCountry: Const.USA,
        },
        {
          bonus: { firePower: 1 },
          shipCountry: Const.USA,
          remodel: 2,
        },
        {
          bonus: { firePower: 1 },
          shipCountry: Const.USA,
          remodel: 7,
        },
      ],
    },
    {
      ids: [389],
      bonuses: [
        {
          bonus: { firePower: 2, avoid: 2 },
          shipId: [594, 599],
        },
        {
          bonus: { firePower: 3, avoid: 2 },
          shipId: [610, 698],
        },
        {
          bonus: { firePower: 4, asw: 4, avoid: 3 },
          shipId: [646],
        },
        {
          bonus: { firePower: 3, asw: 6 },
          shipId: [646],
          requiresType: [25],
          num: 1,
        },
        {
          bonus: { firePower: 5, asw: 4 },
          shipId: [646],
          requiresId: [326, 327],
          num: 1,
        },
        {
          bonus: { firePower: 2, asw: 3, avoid: 1 },
          shipCountry: Const.USA,
        },
      ],
    },
    {
      ids: [390],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipCountry: Const.USA,
        },
        {
          bonus: { firePower: 1 },
          shipCountry: Const.USA,
          remodel: 3,
        },
        {
          bonus: { avoid: 1 },
          shipCountry: Const.USA,
          remodel: 6,
        },
        {
          bonus: { armor: 1 },
          shipCountry: Const.USA,
          remodel: 10,
        },
        {
          bonus: { firePower: 1, armor: 1 },
          shipClass: [102, 107],
        },
        {
          bonus: { firePower: 1 },
          shipClass: [93],
        },
        {
          bonus: { firePower: 1 },
          shipType: [8],
        },
      ],
    },
    {
      ids: [391],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipBase: [75, 92, 110, 111],
        },
        {
          bonus: { firePower: 1 },
          shipId: [116, 117, 185, 282, 318, 883, 888],
        },
        {
          bonus: { avoid: 1 },
          shipId: [117, 318, 883, 888],
          num: 1,
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipId: [555, 560],
        },
      ],
    },
    {
      ids: [392],
      bonuses: [
        {
          bonus: { firePower: 2, avoid: 1 },
          shipBase: [110, 111],
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipBase: [75, 92],
        },
        {
          bonus: { firePower: 2, avoid: 1 },
          shipId: [116, 185, 282],
        },
        {
          bonus: { firePower: 2, avoid: 2 },
          shipId: [117, 318, 883, 888],
        },
        {
          bonus: { firePower: 3, avoid: 2 },
          shipId: [555, 560],
        },
      ],
    },
    {
      ids: [393],
      bonuses: [
        {
          bonus: { firePower: 2, antiAir: 1, avoid: 1 },
          shipClass: [61],
        },
      ],
    },
    {
      ids: [394],
      bonuses: [
        {
          bonus: { firePower: 2, antiAir: 1, avoid: 2 },
          shipClass: [61],
        },
        {
          bonus: { avoid: 1 },
          shipBase: [614],
        },
      ],
    },
    {
      ids: [397],
      bonuses: [
        {
          bonus: { firePower: 5, antiAir: 2, avoid: 1 },
          shipId: [651],
        },
        {
          bonus: { firePower: 4, avoid: 1 },
          shipId: [651],
          remodel: 4,
        },
        {
          bonus: { firePower: 3, antiAir: 1, avoid: 1 },
          shipId: [656],
        },
        {
          bonus: { firePower: 3, avoid: 3 },
          shipId: [651, 656],
          requiresSR: 1,
          num: 1,
        },
      ],
    },
    {
      ids: [398],
      bonuses: [
        {
          bonus: { firePower: 4, antiAir: 4, avoid: 2 },
          shipId: [651],
        },
        {
          bonus: { firePower: 3, avoid: 2 },
          shipId: [651],
          remodel: 4,
        },
        {
          bonus: { firePower: 3, antiAir: 2, avoid: 2 },
          shipId: [656],
        },
        {
          bonus: { firePower: 2, avoid: 1 },
          shipId: [656],
          remodel: 4,
        },
        {
          bonus: { firePower: 3, avoid: 3 },
          shipId: [651, 656],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 3, avoid: 3 },
          shipId: [651, 656],
          requiresAR: 1,
          num: 1,
        },
      ],
    },
    {
      ids: [399],
      bonuses: [
        {
          bonus: { firePower: 1, avoid: 2 },
          shipClass: [108],
        },
        {
          bonus: { firePower: 1 },
          shipClass: [108],
          remodel: 3,
        },
        {
          bonus: { firePower: 1 },
          shipClass: [108],
          remodel: 5,
        },
      ],
    },
    {
      ids: [400],
      bonuses: [
        {
          bonus: {
            firePower: 1, torpedo: 5, armor: 1, avoid: 2,
          },
          shipId: [147],
        },
        {
          bonus: { firePower: 2 },
          shipId: [147],
          requiresId: [282],
          num: 1,
        },
        {
          bonus: {
            firePower: 1, torpedo: 5, armor: 1, avoid: 2,
          },
          shipClass: [73, 81],
        },
        {
          bonus: { firePower: 2 },
          shipClass: [73, 81],
          requiresId: [282],
          num: 1,
        },
      ],
    },
    {
      ids: [407],
      bonuses: [
        {
          bonus: { firePower: 4, antiAir: 2, avoid: 1 },
          shipId: [662, 663, 668],
        },
        {
          bonus: { firePower: 2, torpedo: 2, avoid: 2 },
          shipId: [662, 663, 668],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 2, avoid: 3 },
          shipId: [662, 663, 668],
          requiresAR: 1,
          num: 1,
        },
      ],
    },
    {
      ids: [408],
      bonuses: [
        {
          bonus: { firePower: 2, avoid: 2, scout: 2 },
          shipBase: [621],
        },
        {
          bonus: {
            firePower: 1, asw: 1, avoid: 1, scout: 1,
          },
          shipBase: [161],
        },
        {
          bonus: { firePower: 1, avoid: -5, scout: 1 },
          shipType: [2],
        },
      ],
    },
    {
      ids: [409],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 2, avoid: 3 },
          shipBase: [621],
        },
        {
          bonus: {
            firePower: 1, antiAir: 1, asw: 1, avoid: 2,
          },
          shipBase: [161],
        },
      ],
    },
    {
      ids: [411],
      bonuses: [
        {
          bonus: { avoid: -9 },
          shipType: [2],
        },
        {
          bonus: { avoid: -7 },
          shipType: [3, 4],
        },
        {
          bonus: { avoid: -6 },
          shipType: [21],
        },
        {
          bonus: { avoid: -5 },
          shipType: [5, 6],
        },
        {
          bonus: { firePower: 1, antiAir: 2, avoid: 3 },
          shipId: [593],
          num: 1,
        },
        {
          bonus: { firePower: 3, antiAir: 4 },
          shipId: [151, 411, 412, 593, 954],
          num: 1,
        },
        {
          bonus: { firePower: 2, antiAir: 2 },
          shipId: [541, 553, 554, 573],
          num: 1,
        },
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipId: [151, 411, 412, 541, 553, 554, 573, 593, 954],
          remodel: 4,
          num: 1,
        },
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipId: [151, 411, 412, 541, 553, 554, 573, 593, 954],
          remodel: 10,
          num: 1,
        },
      ],
    },
    {
      ids: [412],
      bonuses: [
        {
          bonus: { firePower: 2, torpedo: 4, asw: 2 },
          shipClass: [1, 5, 10, 12, 18, 22, 23, 28, 30, 38, 54, 66, 101],
          num: 1,
        },
        {
          bonus: { avoid: 3, scout: 1 },
          shipClass: [1, 5, 10, 12, 18, 22, 23, 28, 30, 38, 54, 66, 101],
        },
        {
          bonus: { firePower: 3, torpedo: 3 },
          shipClass: [4, 16, 20, 21, 34, 41, 52, 56],
          num: 1,
        },
        {
          bonus: { avoid: 2, scout: 3 },
          shipClass: [4, 16, 20, 21, 34, 41, 52, 56],
        },
        {
          bonus: { firePower: 1 },
          shipClass: [7, 8, 9, 13, 29, 31],
          num: 1,
        },
        {
          bonus: { avoid: 1, scout: 1 },
          shipClass: [7, 8, 9, 13, 29, 31],
        },
        {
          bonus: { firePower: 1 },
          shipClass: [1, 5, 10, 12, 18, 22, 23, 28, 30, 38, 54, 66, 101, 4, 16, 20, 21, 34, 41, 52, 56],
          num: 1,
          remodel: 4,
        },
        {
          bonus: { torpedo: 1 },
          shipClass: [1, 5, 10, 12, 18, 22, 23, 28, 30, 38, 54, 66, 101, 4, 16, 20, 21, 34, 41, 52, 56],
          num: 1,
          remodel: 8,
        },
      ],
    },
    {
      ids: [413],
      bonuses: [
        {
          bonus: { firePower: 2, torpedo: 2, avoid: 4 },
          shipClass: [1, 5, 10, 12, 18, 22, 23, 28, 30, 38, 54, 66, 101],
          num: 1,
        },
        {
          bonus: { firePower: 4, torpedo: 2, avoid: 2 },
          shipClass: [4, 16, 20, 21, 34, 41, 52, 56],
          num: 1,
        },
        {
          bonus: { firePower: 2, torpedo: 3, avoid: 3 },
          shipClass: [38, 54],
          num: 1,
        },
        {
          bonus: { firePower: 1, torpedo: 2, avoid: 2 },
          shipClass: [4, 16, 20, 41, 52],
          num: 1,
        },
        {
          bonus: { torpedo: 1, antiAir: 2, avoid: 1 },
          shipClass: [21, 34],
          num: 1,
        },
        {
          bonus: { antiAir: 1, avoid: 1 },
          shipBase: [23, 41, 50, 56, 138, 139, 410, 484],
          num: 1,
        },
        {
          bonus: { firePower: 1, torpedo: 1 },
          shipBase: [54, 55, 135, 422],
          num: 1,
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipId: [543],
          num: 1,
        },
        {
          bonus: { firePower: 2 },
          shipId: [159],
          num: 1,
        },
      ],
    },
    {
      ids: [414],
      bonuses: [
        {
          bonus: { scout: 1 },
          shipCountry: Const.USA,
          num: 1,
        },
        {
          bonus: { firePower: 1, scout: 1 },
          shipClass: [95, 99, 106, 110, 121],
          num: 1,
        },
        {
          bonus: { avoid: 1 },
          shipCountry: Const.USA,
          num: 1,
          remodel: 5,
        },
        {
          bonus: { scout: 1 },
          shipClass: [95, 99, 106, 110, 121],
          num: 1,
          remodel: 3,
        },
        {
          bonus: { avoid: 1 },
          shipClass: [95, 99, 106, 110, 121],
          num: 1,
          remodel: 8,
        },
        {
          bonus: { firePower: 1 },
          shipClass: [95, 99, 106, 110, 121],
          num: 1,
          remodel: 10,
        },
      ],
    },
    {
      ids: [415],
      bonuses: [
        {
          bonus: { asw: 1, scout: 1 },
          shipCountry: Const.USA,
          num: 1,
        },
        {
          bonus: { avoid: 1 },
          shipCountry: Const.USA,
          num: 1,
          remodel: 5,
        },
        {
          bonus: { firePower: 1 },
          shipClass: [95, 99, 106, 110, 121],
          num: 1,
        },
        {
          bonus: { avoid: 1 },
          shipClass: [95, 99, 106, 110, 121],
          num: 1,
          remodel: 3,
        },
        {
          bonus: { firePower: 1 },
          shipClass: [95, 99, 106, 110, 121],
          num: 1,
          remodel: 8,
        },
      ],
    },
    {
      ids: [195],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipCountry: Const.USA,
        },
      ],
    },
    {
      ids: [419],
      bonuses: [
        {
          bonus: { firePower: 2 },
          shipCountry: Const.USA,
        },
        {
          bonus: { firePower: 1 },
          shipCountry: Const.USA,
          remodel: 2,
        },
        {
          bonus: { firePower: 1 },
          shipCountry: Const.USA,
          remodel: 7,
        },
      ],
    },
    {
      ids: [420],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipCountry: Const.USA,
        },
        {
          bonus: { firePower: 1 },
          remodel: 3,
          shipCountry: Const.USA,
        },
        {
          bonus: { firePower: 1 },
          shipClass: [67, 78, 82, 88, 108, 112],
        },
        {
          bonus: { firePower: 1 },
          remodel: 3,
          shipClass: [67, 78, 82, 88, 108, 112],
        },
        {
          bonus: { firePower: 1 },
          shipClass: [84],
        },
        {
          bonus: { firePower: -1 },
          shipClass: [78],
        },
        {
          bonus: { firePower: -2, avoid: -1, armor: -2 },
          shipType: [7],
        },
      ],
    },
    {
      ids: [421],
      bonuses: [
        {
          bonus: { firePower: 2 },
          shipCountry: Const.USA,
        },
        {
          bonus: { firePower: 1 },
          remodel: 5,
          shipCountry: Const.USA,
        },
        {
          bonus: { firePower: 2 },
          shipClass: [67, 78, 82, 88, 108, 112],
        },
        {
          bonus: { firePower: 1 },
          remodel: 5,
          shipClass: [67, 78, 82, 88, 108, 112],
        },
        {
          bonus: { firePower: 1 },
          shipClass: [84],
        },
        {
          bonus: { firePower: -1 },
          shipClass: [78],
        },
        {
          bonus: { firePower: -2, avoid: -1, armor: -2 },
          shipType: [7],
        },
      ],
    },
    {
      ids: [277],
      bonuses: [
        {
          bonus: { firePower: 1, avoid: 1 },
          shipCountry: Const.USA,
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipClass: [67, 78, 82, 88, 108, 112],
        },
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 1 },
          shipClass: [83],
        },
      ],
    },
    {
      ids: [422],
      bonuses: [
        {
          bonus: { firePower: 1, avoid: 1 },
          shipCountry: Const.USA,
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipClass: [67, 78, 82, 88, 108, 112],
        },
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipClass: [84],
        },
        {
          bonus: { firePower: 2, antiAir: 2, avoid: 2 },
          shipId: [707],
        },
      ],
    },
    {
      ids: [423],
      bonuses: [
        {
          bonus: {
            firePower: 2, antiAir: 2, avoid: 2, scout: 2,
          },
          shipClass: [78, 112],
        },
        {
          bonus: {
            firePower: 2, antiAir: 2, avoid: 2, scout: 2,
          },
          shipClass: [67, 78, 82, 88, 108, 112],
        },
        {
          bonus: {
            firePower: 1, antiAir: 1, avoid: 1, scout: 1,
          },
          shipCountry: Const.USA,
        },
      ],
    },
    {
      ids: [424],
      bonuses: [
        {
          bonus: { firePower: 2, torpedo: 3 },
          shipClass: [67, 78, 82, 88, 108, 112],
        },
        {
          bonus: { firePower: 1 },
          shipClass: [67, 78, 82, 88, 108, 112],
          remodel: 2,
        },
        {
          bonus: { firePower: 1 },
          shipClass: [67, 78, 82, 88, 108, 112],
          remodel: 6,
        },
      ],
    },
    {
      ids: [425],
      bonuses: [
        {
          bonus: {
            firePower: 2, asw: 2, torpedo: 1, scout: 1,
          },
          shipClass: [67, 78, 82, 88, 108, 112],
        },
        {
          bonus: { asw: 1 },
          shipClass: [67, 78, 82, 88, 108, 112],
          remodel: 2,
        },
        {
          bonus: { firePower: 1 },
          shipClass: [67, 78, 82, 88, 108, 112],
          remodel: 4,
        },
        {
          bonus: { asw: 1 },
          shipClass: [67, 78, 82, 88, 108, 112],
          remodel: 6,
        },
        {
          bonus: { torpedo: 1 },
          shipClass: [67, 78, 82, 88, 108, 112],
          remodel: 8,
        },
        {
          bonus: { asw: 1 },
          shipClass: [67, 78, 82, 88, 108, 112],
          remodel: 10,
        },
      ],
    },
    {
      ids: [430],
      bonuses: [
        {
          bonus: { antiAir: 1, avoid: 1 },
          shipClass: [113],
        },
        {
          bonus: { antiAir: 2, avoid: 1 },
          shipClass: [58, 61, 64, 68, 80, 92, 113],
        },
        {
          bonus: { avoid: 1 },
          shipClass: [58, 61, 64, 68, 80, 92, 113],
          remodel: 2,
        },
        {
          bonus: { antiAir: 1 },
          shipClass: [58, 61, 64, 68, 80, 92, 113],
          remodel: 4,
        },
        {
          bonus: { avoid: 1 },
          shipClass: [58, 61, 64, 68, 80, 92, 113],
          remodel: 7,
        },
        {
          bonus: { antiAir: 1 },
          shipClass: [58, 61, 64, 68, 80, 92, 113],
          remodel: 10,
        },
      ],
    },
    {
      ids: [426],
      bonuses: [
        {
          bonus: { firePower: 3, avoid: 1 },
          shipClass: [113],
        },
        {
          bonus: { firePower: 2, avoid: 1 },
          shipClass: [73],
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipClass: [113],
          requiresId: [426, 427],
          requiresIdNum: 2,
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipClass: [73],
          requiresId: [426, 427],
          requiresIdNum: 2,
          num: 1,
        },
      ],
    },
    {
      ids: [428],
      bonuses: [
        {
          bonus: { firePower: 3, avoid: 1 },
          shipClass: [113],
        },
        {
          bonus: { firePower: 2, avoid: 1 },
          shipClass: [73],
        },
        {
          bonus: { firePower: 1, avoid: 2 },
          shipClass: [58],
        },
        {
          bonus: { firePower: 2, avoid: 1 },
          shipClass: [58, 113],
          requiresId: [428, 429],
          requiresIdNum: 2,
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipClass: [73],
          requiresId: [428, 429],
          requiresIdNum: 2,
          num: 1,
        },
      ],
    },
    {
      ids: [427, 429],
      bonuses: [
        {
          bonus: { firePower: 2 },
          shipClass: [113],
        },
        {
          bonus: { firePower: 1 },
          shipClass: [73],
        },
      ],
    },
    {
      ids: [434, 435],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 2 },
          shipClass: [112],
        },
        {
          bonus: { firePower: 1, antiAir: 2, avoid: 3 },
          shipClass: [67, 78, 82, 88, 108, 112],
        },
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 2 },
          shipCountry: Const.USA,
        },
      ],
    },
    {
      ids: [437],
      bonuses: [
        {
          bonus: { firePower: 3, antiAir: 3, avoid: 4 },
          shipId: [285],
        },
        {
          bonus: { firePower: 4, antiAir: 4, avoid: 4 },
          shipId: [894, 899],
        },
        {
          bonus: { firePower: 2, antiAir: 2, avoid: 3 },
          shipId: [196, 197],
        },
        {
          bonus: { firePower: 2, antiAir: 2, avoid: 2 },
          shipId: [508, 509, 646],
        },
        {
          bonus: { firePower: 1, antiAir: 2, avoid: 2 },
          shipId: [888, 883, 553, 554],
        },
      ],
    },
    {
      ids: [271],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipId: [508, 509, 888, 883],
          remodel: 4,
        },
        {
          bonus: { antiAir: 2 },
          shipId: [508, 509, 888, 883],
          remodel: 6,
        },
        {
          bonus: { avoid: 2 },
          shipId: [508, 509, 888, 883],
          remodel: 8,
        },
        {
          bonus: { firePower: 1 },
          shipId: [508, 509, 888, 883],
          remodel: 10,
        },
      ],
    },
    {
      ids: [438],
      bonuses: [
        {
          bonus: { asw: 1, avoid: 1 },
          shipClass: [66, 28, 12, 1, 5, 10, 23, 18, 30, 38, 22, 54, 101],
          num: 1,
        },
        {
          bonus: { asw: 1, avoid: 1 },
          shipId: [141, 160, 488],
          num: 1,
        },
        {
          bonus: { asw: 1 },
          shipId: [145, 363, 476, 578, 588, 667],
          remodel: 4,
          num: 1,
        },
        {
          bonus: { avoid: 1 },
          shipId: [145, 363, 476, 578, 588, 667],
          remodel: 6,
          num: 1,
        },
        {
          bonus: { asw: 1 },
          shipId: [145, 363, 476, 578, 588, 667],
          remodel: 8,
          num: 1,
        },
        {
          bonus: { avoid: 1 },
          shipId: [145, 363, 476, 578, 588, 667],
          remodel: 10,
          num: 1,
        },
        {
          bonus: { asw: 1 },
          shipBase: [16, 36, 47, 122, 167, 170, 414, 458, 459],
          num: 1,
        },
        {
          bonus: { asw: 1, avoid: 1 },
          shipBase: [43, 457, 471, 473, 585, 611],
          num: 1,
        },
      ],
    },
    {
      ids: [136],
      bonuses: [
        {
          bonus: { armor: 2, avoid: 1 },
          shipClass: [58, 61, 64, 68, 80, 92, 113],
          num: 1,
        },
        {
          bonus: { armor: 1, avoid: 1 },
          shipId: [879],
          num: 1,
        },
        {
          bonus: { armor: 1 },
          shipClass: [58, 61, 64, 68, 80, 92, 113],
          remodel: 3,
        },
        {
          bonus: { armor: 1 },
          shipClass: [58, 61, 64, 68, 80, 92, 113],
          remodel: 6,
        },
        {
          bonus: { armor: 1 },
          shipClass: [58, 61, 64, 68, 80, 92, 113],
          remodel: 10,
        },
      ],
    },
    {
      ids: [439],
      bonuses: [
        {
          bonus: { asw: 1, avoid: 1 },
          shipType: [1, 2, 3, 21],
          num: 1,
        },
        {
          bonus: { asw: 1 },
          shipType: [1],
          num: 1,
        },
        {
          bonus: { asw: 1 },
          shipClass: [101],
          num: 1,
        },
        {
          bonus: { asw: 2 },
          shipCountry: Const.USA.concat(Const.GBR),
          num: 1,
        },
      ],
    },
    {
      ids: [440, 441],
      bonuses: [
        {
          bonus: { torpedo: 2 },
          shipClass: [114],
          num: 1,
        },
      ],
    },
    {
      ids: [442, 443],
      bonuses: [
        {
          bonus: { torpedo: 2 },
          shipClass: [114],
          num: 1,
        },
      ],
    },
    {
      ids: [447],
      bonuses: [
        {
          bonus: { firePower: 1 },
          remodel: 2,
        },
        {
          bonus: { antiAir: 1 },
          remodel: 4,
        },
        {
          bonus: { asw: 1 },
          remodel: 6,
        },
        {
          bonus: { avoid: 1 },
          remodel: 8,
        },
        {
          bonus: { asw: 1 },
          remodel: 10,
        },
        {
          bonus: { firePower: 1, asw: 1, avoid: 2 },
          shipClass: [76],
        },
        {
          bonus: { firePower: 1, asw: 1, avoid: 1 },
          shipBase: [522],
        },
        {
          bonus: { firePower: 1, asw: 2, avoid: 1 },
          shipBase: [89, 184],
        },
        {
          bonus: {
            firePower: 1, avoid: 1, asw: 1, antiAir: 1,
          },
          shipId: [894, 899],
        },
      ],
    },
    {
      ids: [84],
      bonuses: [
        {
          bonus: { antiAir: 1, avoid: 1 },
          remodel: 4,
        },
        {
          bonus: { antiAir: 1 },
          requiresAR: 1,
          num: 1,
          remodel: 4,
        },
        {
          bonus: { antiAir: 1, avoid: 1 },
          shipCountry: Const.DEU.concat(Const.ITA),
          remodel: 4,
        },
        {
          bonus: { firePower: 1, antiAir: 1 },
          remodel: 7,
        },
        {
          bonus: { antiAir: 1, avoid: 1 },
          remodel: 10,
        },
        {
          bonus: { firePower: 1 },
          shipCountry: Const.DEU.concat(Const.ITA),
          remodel: 10,
          num: 1,
        },
      ],
    },
    {
      ids: [70],
      bonuses: [
        {
          bonus: { firePower: 1, asw: 1 },
          shipBase: [900],
        },
      ],
    },
    {
      ids: [346],
      bonuses: [
        {
          bonus: { avoid: 1, asw: 1 },
          shipBase: [900],
          num: 1,
        },
      ],
    },
    {
      ids: [347],
      bonuses: [
        {
          bonus: { avoid: 2, asw: 2 },
          shipBase: [900],
          num: 1,
        },
      ],
    },
    {
      ids: [451],
      bonuses: [
        {
          bonus: { firePower: 1, asw: 2 },
          shipBase: [161],
        },
        {
          bonus: { firePower: 1 },
          shipId: [166],
          remodel: 1,
        },
        {
          bonus: { asw: 1 },
          shipId: [166],
          remodel: 3,
        },
        {
          bonus: { accuracy: 1 },
          shipId: [166],
          remodel: 5,
        },
        {
          bonus: { asw: 1 },
          shipId: [166],
          remodel: 7,
        },
        {
          bonus: { firePower: 1 },
          shipId: [166],
          remodel: 10,
        },
        {
          bonus: { firePower: 1, asw: 3 },
          shipBase: [900],
        },
        {
          bonus: { firePower: 2 },
          shipBase: [900],
          remodel: 1,
        },
        {
          bonus: { accuracy: 1 },
          shipBase: [900],
          remodel: 2,
        },
        {
          bonus: { asw: 1 },
          shipBase: [900],
          remodel: 3,
        },
        {
          bonus: { firePower: 1 },
          shipBase: [900],
          remodel: 4,
        },
        {
          bonus: { accuracy: 1 },
          shipBase: [900],
          remodel: 6,
        },
        {
          bonus: { asw: 1 },
          shipBase: [900],
          remodel: 8,
        },
        {
          bonus: { firePower: 1 },
          shipBase: [900],
          remodel: 10,
        },
      ],
    },
    {
      ids: [455],
      bonuses: [
        {
          bonus: { firePower: 2, antiAir: 1 },
          shipClass: [1, 5, 12],
        },
        {
          bonus: { firePower: 3, torpedo: 1, avoid: 2 },
          shipClass: [1, 5, 12],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 4 },
          shipClass: [1, 5, 12],
          requiresAR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipClass: [12],
        },
        {
          bonus: { firePower: 1 },
          shipBase: [486],
        },
        {
          bonus: {
            firePower: 1, torpedo: 1, asw: 1, avoid: 1,
          },
          shipId: [647],
        },
        {
          bonus: { firePower: 1, asw: 1 },
          shipId: [666],
        },
        {
          bonus: { firePower: 1, torpedo: 3 },
          shipClass: [1, 5, 12],
          requiresId: [13, 125, 285],
          num: 1,
        },
        {
          bonus: { firePower: 1, torpedo: 2 },
          shipClass: [1, 5, 12],
          requiresId: [13, 125, 285],
          requiresIdNum: 2,
          num: 1,
        },
        {
          bonus: { torpedo: 1 },
          shipClass: [1, 5, 12],
          requiresId: [285],
          num: 1,
        },
        {
          bonus: { firePower: 2 },
          shipId: [959],
        },
        {
          bonus: { firePower: 2 },
          shipId: [959],
          num: 2,
        },
        {
          bonus: { firePower: 3 },
          shipId: [959],
          num: 3,
        },
      ],
    },
    {
      ids: [456],
      bonuses: [
        {
          bonus: { firePower: 3, avoid: 4, scout: 4 },
          shipCountry: Const.USA,
        },
        {
          bonus: { accuracy: 3 },
          shipCountry: Const.USA,
          num: 1,
        },
        {
          bonus: { firePower: 2, avoid: 2, scout: 2 },
          shipCountry: Const.GBR.concat(Const.AUS),
        },
        {
          bonus: { accuracy: 2 },
          shipCountry: Const.GBR.concat(Const.AUS),
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipClass: [87, 91],
        },
        {
          bonus: { range: 1 },
          shipClass: [87, 91],
          num: 1,
        },
        {
          bonus: {
            firePower: 2, avoid: 2, scout: 3, range: 1, accuracy: 2,
          },
          shipId: [651, 656],
          num: 1,
        },
      ],
    },
    {
      ids: [457, 461],
      bonuses: [
        {
          bonus: { torpedo: 3, avoid: 3 },
          shipClass: [109],
          num: 1,
        },
        {
          bonus: { torpedo: 2, avoid: 2 },
          shipClass: [71, 103],
          num: 1,
        },
        {
          bonus: { torpedo: 1, avoid: 4 },
          shipClass: [44],
          num: 1,
        },
      ],
    },
    {
      ids: [461],
      bonuses: [
        {
          bonus: { torpedo: 1 },
          shipClass: [109],
          remodel: 2,
        },
        {
          bonus: { avoid: 1 },
          shipClass: [71, 103, 109],
          remodel: 3,
        },
        {
          bonus: { torpedo: 1 },
          shipClass: [44, 71, 103, 109],
          remodel: 4,
        },
        {
          bonus: { accuracy: 1 },
          shipClass: [109],
          remodel: 5,
        },
        {
          bonus: { torpedo: 1 },
          shipClass: [44, 71, 103, 109],
          remodel: 6,
        },
        {
          bonus: { torpedo: 1 },
          shipClass: [44, 71, 103, 109],
          remodel: 8,
        },
        {
          bonus: { accuracy: 1 },
          shipClass: [44, 71, 103, 109],
          remodel: 10,
        },
      ],
    },
    {
      ids: [458],
      bonuses: [
        {
          bonus: { torpedo: 3, avoid: 6 },
          shipClass: [109],
          num: 1,
        },
        {
          bonus: { torpedo: 3, avoid: 4 },
          shipClass: [71, 103],
          num: 1,
        },
        {
          bonus: { torpedo: 3, avoid: 3 },
          shipClass: [44],
          num: 1,
        },
        {
          bonus: { accuracy: 1 },
          shipClass: [44, 71, 103, 109],
          remodel: 4,
        },
        {
          bonus: { avoid: 1 },
          shipClass: [44, 71, 103, 109],
          remodel: 6,
        },
        {
          bonus: { torpedo: 1 },
          shipClass: [44, 71, 103, 109],
          remodel: 8,
        },
        {
          bonus: { avoid: 1 },
          shipType: [13, 14],
          remodel: 3,
        },
        {
          bonus: { torpedo: 1 },
          shipType: [13, 14],
          remodel: 5,
        },
        {
          bonus: { accuracy: 1 },
          shipType: [13, 14],
          remodel: 10,
        },
        {
          bonus: { torpedo: 7, accuracy: 5 },
          shipType: [13, 14],
          remodel: 2,
          requiresId: [461],
          requiresIdLevel: 4,
          num: 1,
        },
      ],
    },
    {
      ids: [465],
      bonuses: [
        {
          bonus: { firePower: 2, avoid: 8, accuracy: 2 },
          shipId: [916],
        },
        {
          bonus: { avoid: 2, accuracy: 1 },
          shipId: [916],
          requiresId: [460],
          num: 1,
        },
        {
          bonus: { firePower: 1, avoid: 2, accuracy: 1 },
          shipId: [546, 911],
        },
        {
          bonus: { avoid: 1, accuracy: 1 },
          shipId: [546, 911],
          requiresId: [460],
          num: 1,
        },
        {
          bonus: { firePower: 2, accuracy: 2 },
          shipClass: [37],
          requiresId: [142, 460],
          num: 1,
        },
      ],
    },
    {
      ids: [464],
      bonuses: [
        {
          bonus: { antiAir: 3, avoid: 2 },
          shipClass: [37],
        },
        {
          bonus: { antiAir: 2, avoid: 1, accuracy: 1 },
          shipClass: [37],
          requiresId: [142, 460],
          num: 1,
        },
        {
          bonus: { antiAir: -2, avoid: -2 },
          shipClass: [6, 73, 113],
        },
        {
          bonus: { antiAir: 2, avoid: 2 },
          shipId: [546, 593, 911, 916, 954],
        },
        {
          bonus: {
            firePower: 2, antiAir: 2, avoid: 2, accuracy: 3,
          },
          shipId: [546, 593, 911, 916, 954],
          requiresId: [460],
          num: 1,
        },
      ],
    },
    {
      ids: [463],
      bonuses: [
        {
          bonus: {
            firePower: 1, antiAir: 2, avoid: 1, accuracy: 1,
          },
          shipClass: [37],
        },
        {
          bonus: { antiAir: 1, avoid: 1, accuracy: 1 },
          shipClass: [37],
          requiresId: [142, 460],
          num: 1,
        },
        {
          bonus: { firePower: 1, avoid: 1, accuracy: 2 },
          shipId: [546, 911, 916],
        },
        {
          bonus: { firePower: 1, avoid: 1, accuracy: 2 },
          shipId: [546, 911, 916],
          requiresId: [460],
          num: 1,
        },
      ],
    },
    {
      ids: [12],
      bonuses: [
        {
          bonus: { firePower: 1, avoid: 1, accuracy: 1 },
          shipClass: [37],
        },
        {
          bonus: { avoid: 1, accuracy: 1 },
          shipClass: [37],
          requiresId: [142, 460],
          num: 1,
        },
      ],
    },
    {
      ids: [234],
      bonuses: [
        {
          bonus: {
            firePower: 1, antiAir: 1, avoid: 1, accuracy: 1,
          },
          shipClass: [37],
        },
        {
          bonus: { antiAir: 1, avoid: 1, accuracy: 1 },
          shipClass: [37],
          requiresId: [142, 460],
          num: 1,
        },
      ],
    },
    {
      ids: [128, 281],
      bonuses: [
        {
          bonus: { firePower: 1, accuracy: 1 },
          shipId: [546, 911, 916],
        },
        {
          bonus: { avoid: 1, accuracy: 1 },
          shipId: [546, 911, 916],
          requiresId: [460],
          num: 1,
        },
        {
          bonus: { firePower: 1, accuracy: 2 },
          shipClass: [37],
          requiresId: [142, 460],
          num: 1,
        },
      ],
    },
    {
      ids: [466],
      bonuses: [
        {
          bonus: { firePower: 1, accuracy: 1 },
          shipId: [112, 156, 277, 278, 279, 280, 288],
        },
        {
          bonus: { firePower: 2, avoid: 2, accuracy: 1 },
          shipId: [461, 462, 466, 467],
        },
        {
          bonus: { firePower: 1, avoid: 1, accuracy: 2 },
          shipId: [196, 197, 594, 599, 610, 646, 698],
        },
      ],
    },
    {
      ids: [467],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 2 },
          shipCountry: Const.USA,
        },
        {
          bonus: {
            firePower: 1, antiAir: 1, avoid: 1, accuracy: 2,
          },
          shipCountry: Const.USA,
          requiresId: [279, 307, 315, 456],
          num: 1,
        },
        {
          bonus: { antiAir: 2, avoid: 2 },
          shipCountry: Const.USA,
          requiresId: [278, 279],
          num: 1,
        },
        {
          bonus: { antiAir: 2, avoid: 1 },
          shipClass: [65, 93, 102, 107],
        },
      ],
    },
    {
      ids: [247],
      bonuses: [
        {
          bonus: { firePower: 2, accuracy: 2 },
          shipCountry: Const.FRA,
        },
        {
          bonus: { firePower: 1, accuracy: 1 },
          shipCountry: Const.FRA,
          remodel: 4,
        },
        {
          bonus: { firePower: 1, avoid: 1, accuracy: 1 },
          shipCountry: Const.FRA,
          remodel: 8,
        },
        {
          bonus: { avoid: 1, accuracy: 1 },
          shipCountry: Const.FRA,
          remodel: 10,
        },
        {
          bonus: { firePower: 2, avoid: 2, accuracy: 2 },
          shipClass: [79],
          requiresId: [245, 246, 468],
        },
      ],
    },
    {
      ids: [245, 246],
      bonuses: [
        {
          bonus: { firePower: 2, accuracy: 1 },
          shipClass: [79],
        },
      ],
    },
    {
      ids: [468],
      bonuses: [
        {
          bonus: { firePower: 3, accuracy: 1 },
          shipClass: [79],
        },
        {
          bonus: { firePower: 1, accuracy: 1 },
          shipClass: [79],
          remodel: 4,
        },
        {
          bonus: { firePower: 1, accuracy: 1 },
          shipClass: [79],
          remodel: 8,
        },
        {
          bonus: { accuracy: 1 },
          shipClass: [79],
          remodel: 10,
        },
      ],
    },
    {
      ids: [470],
      bonuses: [
        {
          bonus: { firePower: 1 },
          shipClass: [18, 23],
        },
        {
          bonus: {
            firePower: 1, avoid: 1, torpedo: 3, accuracy: 1,
          },
          shipClass: [18, 23],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 2 },
          shipClass: [30],
        },
        {
          bonus: {
            firePower: 2, avoid: 1, torpedo: 3, accuracy: 3,
          },
          shipClass: [30],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { avoid: 2 },
          shipBase: [20, 43, 167],
        },
        {
          bonus: { firePower: 1, accuracy: 2 },
          shipId: [145, 566, 567, 568, 651, 656, 670, 915],
          num: 1,
        },
        {
          bonus: { firePower: 2 },
          shipId: [145, 566, 567, 568, 651, 656, 670, 915],
          num: 2,
        },
        {
          bonus: { accuracy: 1 },
          shipId: [145, 566, 567, 568, 651, 656, 670, 915],
          remodel: 5,
        },
        {
          bonus: { firePower: 1 },
          shipId: [145, 566, 567, 568, 651, 656, 670, 915],
          remodel: 8,
        },
        {
          bonus: { accuracy: 1 },
          shipId: [145, 566, 567, 568, 651, 656, 670, 915],
          remodel: 10,
        },
      ],
    },
    {
      ids: [471],
      bonuses: [
        {
          bonus: { firePower: 2, avoid: 2, accuracy: 2 },
          shipCountry: Const.FRA,
        },
        {
          bonus: { firePower: 2, accuracy: 1 },
          shipClass: [79],
        },
        {
          bonus: { avoid: 1, accuracy: 1 },
          shipCountry: Const.FRA,
          remodel: 6,
        },
        {
          bonus: { firePower: 1, avoid: 1, accuracy: 1 },
          shipCountry: Const.FRA,
          remodel: 8,
        },
        {
          bonus: { firePower: 1, accuracy: 1 },
          shipCountry: Const.FRA,
          remodel: 10,
        },
      ],
    },
    {
      ids: [472],
      bonuses: [
        {
          bonus: { asw: 2 },
          shipCountry: Const.USA,
        },
        {
          bonus: { asw: 1 },
          shipCountry: Const.GBR,
        },
        {
          bonus: { avoid: 1 },
          shipType: [1],
        },
        {
          bonus: { asw: 1, avoid: 1, accuracy: 1 },
          shipId: [920],
          num: 1,
        },
      ],
    },
    {
      ids: [227],
      bonuses: [
        {
          bonus: { asw: 1 },
          remodel: 8,
        },
        {
          bonus: { asw: 1 },
          remodel: 10,
        },
      ],
    },
    {
      ids: [132],
      bonuses: [
        {
          bonus: { avoid: 1 },
          remodel: 3,
          num: 1,
        },
        {
          bonus: { asw: 1 },
          remodel: 5,
          num: 1,
        },
        {
          bonus: { avoid: 1 },
          remodel: 7,
          num: 1,
        },
        {
          bonus: { asw: 1 },
          remodel: 8,
          num: 1,
        },
        {
          bonus: { accuracy: 1 },
          remodel: 9,
          num: 1,
        },
        {
          bonus: { asw: 1 },
          remodel: 10,
          num: 1,
        },
        {
          bonus: { avoid: 1 },
          shipId: [546, 911, 916],
          num: 1,
        },
        {
          bonus: { avoid: 2 },
          shipId: [156, 461, 462, 466, 467],
          num: 1,
        },
      ],
    },
    {
      ids: [473],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 1 },
          shipCountry: Const.USA,
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipCountry: Const.GBR,
        },
      ],
    },
    {
      ids: [474],
      bonuses: [
        {
          bonus: { firePower: 2, antiAir: 1, avoid: 1 },
          shipCountry: Const.USA,
        },
        {
          bonus: { firePower: 1, antiAir: 1, avoid: 1 },
          shipCountry: Const.GBR,
        },
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipCountry: Const.FRA,
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          shipId: [707, 930],
        },
      ],
    },
    {
      ids: [478],
      bonuses: [
        {
          bonus: { firePower: 1 },
          remodel: 1,
          num: 1,
        },
        {
          bonus: { accuracy: 1 },
          remodel: 2,
          num: 1,
        },
        {
          bonus: { avoid: 1 },
          remodel: 3,
          num: 1,
        },
        {
          bonus: { bomber: 1 },
          remodel: 4,
          num: 1,
        },
        {
          bonus: { torpedo: 1 },
          remodel: 5,
          num: 1,
        },
        {
          bonus: { antiAir: 1 },
          remodel: 6,
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          remodel: 7,
          num: 1,
        },
        {
          bonus: { accuracy: 1 },
          remodel: 8,
          num: 1,
        },
        {
          bonus: { avoid: 1 },
          remodel: 9,
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          remodel: 10,
          num: 1,
        },
      ],
    },
    {
      ids: [483],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipClass: [6],
          num: 1,
        },
        {
          bonus: { accuracy: 1 },
          shipClass: [6],
          remodel: 6,
          num: 1,
        },
        {
          bonus: { accuracy: 1 },
          shipClass: [6],
          remodel: 10,
          num: 1,
        },
        {
          bonus: { firePower: 2, antiAir: 2 },
          shipId: [149],
          num: 1,
        },
        {
          bonus: { firePower: 3, antiAir: 3, avoid: 1 },
          shipId: [591],
          num: 1,
        },
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipId: [150],
          num: 1,
        },
        {
          bonus: { firePower: 2, antiAir: 2, avoid: 2 },
          shipId: [592],
          num: 1,
        },
        {
          bonus: { firePower: 1, antiAir: 2, avoid: 2 },
          shipId: [151],
          num: 1,
        },
        {
          bonus: { firePower: 2, antiAir: 5, avoid: 3 },
          shipId: [593],
          num: 1,
        },
        {
          bonus: { firePower: 2, antiAir: 4, avoid: 2 },
          shipId: [954],
          num: 1,
        },
        {
          bonus: { firePower: 2, antiAir: 2 },
          shipId: [152],
          num: 1,
        },
        {
          bonus: { firePower: 2, antiAir: 2, avoid: 2 },
          shipId: [546, 911, 916],
          num: 1,
        },
        {
          bonus: { accuracy: 1 },
          shipId: [546, 911, 916],
          remodel: 8,
          num: 1,
        },
        {
          bonus: { firePower: 1, antiAir: 2, avoid: 1 },
          shipId: [553, 554],
          num: 1,
        },
        {
          bonus: { firePower: 1, antiAir: 2 },
          shipId: [541, 411, 412],
          num: 1,
        },
        {
          bonus: { firePower: 2, antiAir: 2, avoid: 1 },
          shipId: [573],
          num: 1,
        },
      ],
    },
    {
      ids: [485],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 3, avoid: 2 },
          shipClass: [9],
        },
        {
          bonus: { antiAir: 2, avoid: 1, accuracy: 1 },
          shipId: [501, 506],
        },
        {
          bonus: { firePower: 1 },
          remodel: 3,
        },
        {
          bonus: { antiAir: 1 },
          remodel: 5,
        },
        {
          bonus: { avoid: 1 },
          remodel: 7,
        },
        {
          bonus: { accuracy: 1 },
          remodel: 10,
        },
      ],
    },
    {
      ids: [275],
      bonuses: [
        {
          bonus: { firePower: 1, antiAir: 3, avoid: 2 },
          shipId: [894, 899],
        },
        {
          bonus: { antiAir: 3, avoid: 3 },
          shipId: [894, 899],
          requiresAR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 1, avoid: 1 },
          shipId: [894, 899],
          remodel: 7,
        },
        {
          bonus: { firePower: 1, antiAir: 1, accuracy: 1 },
          shipId: [894, 899],
          remodel: 10,
        },
      ],
    },
    {
      ids: [486],
      bonuses: [
        {
          bonus: {
            firePower: 4, antiAir: 4, avoid: 3, accuracy: 2,
          },
          shipId: [894, 899],
        },
        {
          bonus: {
            firePower: 2, antiAir: 2, avoid: 2, accuracy: 1,
          },
          shipId: [883, 888],
        },
        {
          bonus: { avoid: 1, accuracy: 1 },
          remodel: 6,
        },
        {
          bonus: { antiAir: 1, avoid: 1 },
          remodel: 8,
        },
        {
          bonus: { firePower: 1, accuracy: 1 },
          remodel: 10,
        },
      ],
    },
    {
      ids: [487],
      bonuses: [
        {
          bonus: {
            firePower: 5, antiAir: 3, avoid: 2, accuracy: 4,
          },
          shipId: [894, 899],
        },
        {
          bonus: {
            firePower: 3, antiAir: 1, avoid: 1, accuracy: 2,
          },
          shipId: [883, 888],
        },
        {
          bonus: { firePower: 1, avoid: 1 },
          remodel: 6,
        },
        {
          bonus: { antiAir: 1, accuracy: 1 },
          remodel: 8,
        },
        {
          bonus: { firePower: 1, accuracy: 1 },
          remodel: 10,
        },
      ],
    },
    {
      ids: [488],
      bonuses: [
        {
          bonus: { asw: 1, avoid: 1 },
          shipType: [2],
          shipCountry: Const.JPN,
        },
        {
          bonus: { asw: 1, avoid: 1 },
          shipClass: [74, 77, 85, 104, 117],
        },
        {
          bonus: { asw: 5, avoid: 4, accuracy: 2 },
          shipId: [145],
        },
        {
          bonus: { asw: 2, avoid: 1, accuracy: 1 },
          shipId: [228, 243, 557, 558, 651, 656],
        },
        {
          bonus: { asw: 1 },
          shipId: [43, 235, 407, 411, 412, 419, 537, 538, 663, 668],
        },
        {
          bonus: { avoid: 1 },
          shipId: [145],
          remodel: 3,
        },
        {
          bonus: { asw: 1 },
          shipId: [145],
          remodel: 5,
        },
        {
          bonus: { accuracy: 1 },
          shipId: [145],
          remodel: 7,
        },
        {
          bonus: { avoid: 1 },
          shipId: [145],
          remodel: 8,
        },
        {
          bonus: { asw: 1 },
          shipId: [145],
          remodel: 9,
        },
        {
          bonus: { asw: 1 },
          shipId: [145],
          remodel: 10,
        },
        {
          bonus: { asw: 1 },
          shipId: [228, 243, 557, 558, 651, 656, 43, 235, 407, 411, 412, 419, 537, 538, 663, 668],
          remodel: 5,
        },
        {
          bonus: { avoid: 1 },
          shipId: [228, 243, 557, 558, 651, 656, 43, 235, 407, 411, 412, 419, 537, 538, 663, 668],
          remodel: 7,
        },
        {
          bonus: { accuracy: 1 },
          shipId: [228, 243, 557, 558, 651, 656, 43, 235, 407, 411, 412, 419, 537, 538, 663, 668],
          remodel: 9,
        },
        {
          bonus: { asw: 1 },
          shipId: [228, 243, 557, 558, 651, 656, 43, 235, 407, 411, 412, 419, 537, 538, 663, 668],
          remodel: 10,
        },
      ],
    },
    {
      ids: [489, 491],
      bonuses: [
        {
          bonus: {
            firePower: 1, antiAir: 2, avoid: 1, asw: 1, accuracy: 1,
          },
          shipBase: [161, 900, 943],
        },
        {
          bonus: {
            firePower: 2, antiAir: 2, avoid: 2, asw: 1, accuracy: 1,
          },
          shipId: [717, 948],
        },
        {
          bonus: { avoid: 1 },
          remodel: 3,
        },
        {
          bonus: { asw: 1 },
          remodel: 6,
        },
        {
          bonus: { accuracy: 1 },
          remodel: 8,
        },
        {
          bonus: { firePower: 1 },
          remodel: 10,
        },
      ],
    },
    {
      ids: [500, 501],
      bonuses: [
        {
          bonus: { avoid: 4 },
          shipId: [959],
        },
        {
          bonus: { avoid: 3 },
          shipBase: [14, 54, 61, 471, 473, 486, 561, 562],
        },
        {
          bonus: { avoid: 2 },
          shipBase: [9, 37, 41, 49, 65, 67, 479, 484],
        },
      ],
    },
    {
      ids: [502],
      bonuses: [
        {
          bonus: { firePower: 5, antiAir: 4, avoid: 3 },
          shipId: [593],
        },
        {
          bonus: { firePower: 3, antiAir: 3, avoid: 3 },
          shipId: [954],
        },
        {
          bonus: { firePower: 2, antiAir: 2, avoid: 1 },
          shipId: [151],
        },
        {
          bonus: { firePower: 2, antiAir: 1, avoid: 1 },
          shipId: [591],
        },
        {
          bonus: { firePower: 2, antiAir: 1 },
          shipId: [149],
        },
        {
          bonus: { firePower: 1, antiAir: 1 },
          shipId: [592],
        },
        {
          bonus: { firePower: 1 },
          shipId: [150, 152],
        },
        {
          bonus: { avoid: 1 },
          shipId: [593, 954],
          remodel: 1,
        },
        {
          bonus: { antiAir: 1 },
          shipId: [593, 954],
          remodel: 3,
        },
        {
          bonus: { firePower: 1 },
          shipId: [593, 954],
          remodel: 5,
        },
        {
          bonus: { avoid: 1 },
          shipId: [593, 954],
          remodel: 7,
        },
        {
          bonus: { antiAir: 1 },
          shipId: [593, 954],
          remodel: 8,
        },
        {
          bonus: { firePower: 1 },
          shipId: [593, 954],
          remodel: 9,
        },
        {
          bonus: { antiAir: 1 },
          shipId: [593, 954],
          remodel: 10,
        },
        {
          bonus: { avoid: 1 },
          shipId: [151],
          remodel: 2,
        },
        {
          bonus: { antiAir: 1 },
          shipId: [151, 591],
          remodel: 4,
        },
        {
          bonus: { firePower: 1 },
          shipId: [151, 591],
          remodel: 6,
        },
        {
          bonus: { avoid: 1 },
          shipId: [151, 591],
          remodel: 8,
        },
        {
          bonus: { antiAir: 1 },
          shipId: [151, 591],
          remodel: 10,
        },
        {
          bonus: { avoid: 1 },
          shipId: [149, 150, 152, 592],
          remodel: 5,
        },
        {
          bonus: { firePower: 1 },
          shipId: [149, 150, 152, 592],
          remodel: 8,
        },
        {
          bonus: { antiAir: 1 },
          shipId: [149, 150, 152, 592],
          remodel: 10,
        },
        {
          bonus: { firePower: 3, avoid: 4 },
          shipId: [593],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 2, avoid: 2 },
          shipId: [149, 151, 591, 954],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { antiAir: 1 },
          shipId: [151, 593, 954],
          requiresId: [410],
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipId: [151, 593, 954],
          requiresId: [410],
          requiresIdLevel: 7,
          num: 1,
        },
        {
          bonus: { avoid: 1 },
          shipId: [151, 593, 954],
          requiresId: [410],
          requiresIdLevel: 10,
          num: 1,
        },
        {
          bonus: { antiAir: 2 },
          shipId: [151, 593, 954],
          requiresId: [411],
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipId: [151, 593, 954],
          requiresId: [411],
          requiresIdLevel: 2,
          num: 1,
        },
        {
          bonus: { avoid: 1 },
          shipId: [151, 593, 954],
          requiresId: [411],
          requiresIdLevel: 4,
          num: 1,
        },
        {
          bonus: { accuracy: 1 },
          shipId: [151, 593, 954],
          requiresId: [411],
          requiresIdLevel: 6,
          num: 1,
        },
        {
          bonus: { antiAir: 1 },
          shipId: [151, 593, 954],
          requiresId: [411],
          requiresIdLevel: 8,
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipId: [151, 593, 954],
          requiresId: [411],
          requiresIdLevel: 10,
          num: 1,
        },
      ],
    },
    {
      ids: [503],
      bonuses: [
        {
          bonus: { firePower: 4, antiAir: 4, accuracy: 2 },
          shipId: [593],
        },
        {
          bonus: { firePower: 4, antiAir: 3, accuracy: 2 },
          shipId: [954],
        },
        {
          bonus: { firePower: 2, antiAir: 2, accuracy: 1 },
          shipId: [151],
        },
        {
          bonus: { firePower: 3, antiAir: 1, accuracy: 1 },
          shipId: [591, 592],
        },
        {
          bonus: { firePower: 2, antiAir: 1 },
          shipId: [149],
        },
        {
          bonus: { firePower: 2 },
          shipId: [150, 152],
        },
        {
          bonus: { firePower: 1 },
          shipId: [593, 954],
          remodel: 1,
        },
        {
          bonus: { antiAir: 1 },
          shipId: [593, 954],
          remodel: 2,
        },
        {
          bonus: { accuracy: 1 },
          shipId: [593, 954],
          remodel: 4,
        },
        {
          bonus: { firePower: 1 },
          shipId: [593, 954],
          remodel: 6,
        },
        {
          bonus: { antiAir: 1 },
          shipId: [593, 954],
          remodel: 8,
        },
        {
          bonus: { accuracy: 1 },
          shipId: [593, 954],
          remodel: 10,
        },
        {
          bonus: { firePower: 1 },
          shipId: [151, 591, 592],
          remodel: 2,
        },
        {
          bonus: { antiAir: 1 },
          shipId: [151, 591, 592],
          remodel: 4,
        },
        {
          bonus: { accuracy: 1 },
          shipId: [151, 591, 592],
          remodel: 6,
        },
        {
          bonus: { firePower: 1 },
          shipId: [151, 591, 592],
          remodel: 8,
        },
        {
          bonus: { accuracy: 1 },
          shipId: [151, 591, 592],
          remodel: 10,
        },
        {
          bonus: { accuracy: 1 },
          shipId: [149, 150, 152],
          remodel: 4,
        },
        {
          bonus: { firePower: 1 },
          shipId: [149, 150, 152],
          remodel: 7,
        },
        {
          bonus: { antiAir: 1 },
          shipId: [149, 150, 152],
          remodel: 10,
        },
        {
          bonus: { firePower: 3, accuracy: 3, avoid: 2 },
          shipId: [954],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 2, accuracy: 2, avoid: 1 },
          shipId: [151, 591, 592, 593],
          requiresSR: 1,
          num: 1,
        },
        {
          bonus: { torpedo: 4 },
          shipId: [591, 592, 593, 954],
          requiresId: [174],
          num: 1,
        },
        {
          bonus: { torpedo: 1 },
          shipId: [591, 592, 593, 954],
          requiresId: [174],
          requiresIdLevel: 6,
          num: 1,
        },
        {
          bonus: { accuracy: 1 },
          shipId: [591, 592, 593, 954],
          requiresId: [174],
          requiresIdLevel: 8,
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipId: [591, 592, 593, 954],
          requiresId: [174],
          requiresIdLevel: 10,
          num: 1,
        },
        {
          bonus: { firePower: 2, accuracy: 2, avoid: 2 },
          shipId: [591, 592, 593, 954],
          requiresAccR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 1 },
          shipId: [591],
          requiresAccR: 1,
          num: 1,
        },
        {
          bonus: { firePower: 2 },
          shipId: [954],
          requiresAccR: 1,
          num: 1,
        },
      ],
    },
  ];
}
