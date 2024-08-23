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
  public canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  constructor() {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d")!;
  }
}
