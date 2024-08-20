export class Swatch {
  public colourRGBA = "";
  public brushed = false;
  public gradient: CanvasGradient | undefined;
  public height = 0;
  public name = "";
  public palette = 0;
  public pattern: CanvasPattern | undefined;
  public shiny = false;
  public type = "";
  public width = 0;

  constructor(
    public id: string,
    public canvas: HTMLCanvasElement,
    public context: CanvasRenderingContext2D
  ) {}
}
