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
  public area: number;

  public node: string;

  public detail: string;

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
