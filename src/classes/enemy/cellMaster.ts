export interface RawCell {
  a: number;
  n: string;
  d: string;
  l: number;
  t: number;
  f: number;
  r: number;
  e: number[];
  c: string;
}

export default class CellMaster {
  /** 識別id [] */
  public area: number;

  /** セル名 ABC */
  public node: string;

  /** セル名詳細 */
  public detail: string;

  /** 難易度 */
  public level: number;

  public cellType: number;

  public formation: number;

  public radius: number;

  public enemies: number[];

  public coords: string;

  constructor(raw: RawCell) {
    this.area = raw.a;
    this.node = raw.n;
    this.detail = raw.d;
    this.level = raw.l;
    this.cellType = raw.t;
    this.formation = raw.f;
    this.radius = raw.r;
    this.enemies = raw.e;
    this.coords = raw.c;
  }
}
