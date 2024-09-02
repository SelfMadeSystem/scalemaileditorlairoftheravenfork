import { fontStyles, updateInterval } from "./Consts";
import { DrawUtils } from "./DrawUtils";
import { PatternMatrix } from "./PatternMatrix";
import { TemplateSwatches } from "./TemplateSwatches";
import { getCurrentTheme } from "./Theme";

export class EditorLayer {
  public gridCanvas: HTMLCanvasElement;
  public gridContext: CanvasRenderingContext2D;
  public canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;

  public lastDraw = 0;
  public redrawQueueTimer = -1;

  public height = 0;
  public width = 0;
  public offsetX = 0;
  public offsetY = 0;
  public bgOffsetY = 0;
  public reverse = false;
  public doDrawGrid = false;

  constructor(
    public drawUtils: DrawUtils,
    private swatches: TemplateSwatches,
    public editorPattern: PatternMatrix
  ) {
    this.gridCanvas = document.getElementById(
      "canvasGrid"
    ) as HTMLCanvasElement;
    this.gridContext = this.gridCanvas.getContext("2d")!;
    this.canvas = document.getElementById("canvasEditor") as HTMLCanvasElement;
    this.context = this.canvas.getContext("2d")!;

    this.canvas.style.height = "100%";
    this.canvas.style.width = "100%";

    this.context.imageSmoothingEnabled = false;
    this.context.font = fontStyles[1];

    this.scaleCanvas();
  }

  public scaleCanvas(
    height = window.innerHeight,
    width = window.innerWidth,
    minimum = true
  ) {
    if (minimum === true) {
      if (height < 600) {
        height = 600;
      }

      if (width < 800) {
        width = 800;
      }
    }

    this.height = height;
    this.width = width;

    this.gridCanvas.style.height = this.canvas.style.height = height + "px";
    this.gridCanvas.style.width = this.canvas.style.width = width + "px";

    this.gridCanvas.height = this.canvas.height = this.height;
    this.gridCanvas.width = this.canvas.width = this.width;
  }

  public redrawCanvas() {
    const now = Date.now();
    const diff = now - this.lastDraw;
    if (diff > updateInterval) {
      this.lastDraw = now;
      this.drawScales();
      this.drawGrid();
    } else {
      var that = this;

      if (this.redrawQueueTimer >= 0) {
        clearInterval(this.redrawQueueTimer);
      }

      this.redrawQueueTimer = setTimeout(() => {
        that.redrawCanvas();
        this.redrawQueueTimer = -1;
      }, updateInterval - diff);
    }
  }

  public drawScales() {
    this.context.clearRect(0, 0, this.width, this.height);
    this.context.drawImage(
      this.swatches.patternSwatch.canvas,
      this.offsetX,
      this.offsetY
    );
  }

  public drawGrid() {
    const context = this.gridContext;
    // const pattern = this.editorPattern;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    if (!this.doDrawGrid) {
      return;
    }

    const colour = getCurrentTheme().dotColour;

    // Variables
    var m = 0;

    var gridOriginX = 0;
    var gridOriginY = 0;

    var stepX = this.drawUtils.scaleSpacingX;
    var stepY = this.drawUtils.scaleSpacingY * 2;

    const dot = Math.max(1, this.drawUtils.scaleRadius / 30);

    // Calculate Bottom Left Scale
    // if (pattern.matrix[pattern.matrix.length - 1][0].colour == 0) {
    //   m = this.drawUtils.scaleSpacingX / 2;
    // }

    gridOriginX = -dot * 1.5 + this.drawUtils.scaleSpacingX + m;
    gridOriginY =
      (this.bgOffsetY * stepY) / 2 + this.drawUtils.scalePathBottom.y;

    // Calculate Pan Offset
    gridOriginX += this.offsetX;
    gridOriginY += this.offsetY;

    // Step Back to Edge
    for (let x = 0; gridOriginX > 0; x++) {
      gridOriginX -= stepX;
    }

    for (let y = 0; gridOriginY > 0; y++) {
      gridOriginY -= stepY;
    }

    context.strokeStyle = colour;

    // Draw Grid Lines
    context.beginPath();
    for (let y = gridOriginY; y < this.height + stepY; y += stepY) {
      const ry = Math.round(y);
      context.moveTo(0, ry);
      context.lineTo(context.canvas.width, ry);
    }
    context.stroke();
    context.beginPath();
    for (let x = gridOriginX; x < this.width + stepY; x += stepX) {
      const rx = Math.round(x);
      context.moveTo(rx, 0);
      context.lineTo(rx, context.canvas.height);
    }
    context.stroke();
  }

  // Pan Functions
  public panCanvas(moveX: number, moveY: number) {
    this.offsetX += moveX;
    this.offsetY += moveY;
  }

  public panTowards(
    prevZoom: number,
    nextZoom: number,
    mouseX: number,
    mouseY: number
  ) {
    mouseX -= this.offsetX;
    mouseY -= this.offsetY;
    const zoomDiff = nextZoom / prevZoom;
    const newMouseX = mouseX * zoomDiff;
    const newMouseY = mouseY * zoomDiff;
    this.panCanvas(mouseX - newMouseX, mouseY - newMouseY);
  }

  public panCenter() {
    this.offsetX =
      this.canvas.width / 2 - this.swatches.patternSwatch.canvas.width / 2;
    this.offsetY =
      this.canvas.height / 2 - this.swatches.patternSwatch.canvas.height / 2;
  }
}
