export default class Item {
  public id = 0;

  public name = '';

  public level = 0;

  public remodel = 0;

  public slot = 0;

  clear(): void {
    this.id = 0;
    this.name = '';
    this.level = 0;
    this.remodel = 0;
    this.slot = 0;
  }
}
