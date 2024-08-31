import { fontStyles, updateInterval } from "./Consts";
import { DrawUtils } from "./DrawUtils";
import { PatternMatrix } from "./PatternMatrix";
import { TemplateSwatches } from "./TemplateSwatches";
import { themes } from "./Theme";

export class EditorLayer {
  public bgCanvas: HTMLCanvasElement;
  public bgContext: CanvasRenderingContext2D;
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
  public drawBg = false;

  constructor(
    public drawUtils: DrawUtils,
    private swatches: TemplateSwatches,
    public editorPattern: PatternMatrix
  ) {
    this.bgCanvas = document.getElementById(
      "canvasBackground"
    ) as HTMLCanvasElement;
    this.bgContext = this.bgCanvas.getContext("2d")!;
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

    this.bgCanvas.style.height = this.canvas.style.height = height + "px";
    this.bgCanvas.style.width = this.canvas.style.width = width + "px";

    this.bgCanvas.height = this.canvas.height = this.height;
    this.bgCanvas.width = this.canvas.width = this.width;
  }

  public redrawCanvas() {
    const now = Date.now();
    const diff = now - this.lastDraw;
    if (diff > updateInterval) {
      this.lastDraw = now;
      this.drawScales();
      this.drawBackground();
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

  public drawBackground() {
    const context = this.bgContext;
    // const pattern = this.editorPattern;
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    if (!this.drawBg) {
      return;
    }

    const colour = themes[this.drawUtils.theme].dotColour;

    // Variables
    var m = 0;

    var backgroundOriginX = 0;
    var backgroundOriginY = 0;

    var stepX = this.drawUtils.scaleSpacingX;
    var stepY = this.drawUtils.scaleSpacingY * 2;

    const dot = Math.max(1, this.drawUtils.scaleRadius / 30);

    // Calculate Bottom Left Scale
    // if (pattern.matrix[pattern.matrix.length - 1][0].colour == 0) {
    //   m = this.drawUtils.scaleSpacingX / 2;
    // }

    backgroundOriginX = -dot * 1.5 + this.drawUtils.scaleSpacingX + m;
    backgroundOriginY =
      (this.bgOffsetY * stepY) / 2 + this.drawUtils.scalePathBottom.y;

    // Calculate Pan Offset
    backgroundOriginX += this.offsetX;
    backgroundOriginY += this.offsetY;

    // Step Back to Edge
    for (let x = 0; backgroundOriginX > 0; x++) {
      backgroundOriginX -= stepX;
    }

    for (let y = 0; backgroundOriginY > 0; y++) {
      backgroundOriginY -= stepY;
    }

    context.strokeStyle = colour;

    // Draw Dots
    context.beginPath();
    for (let y = backgroundOriginY; y < this.height + stepY; y += stepY) {
      const ry = Math.round(y);
      context.moveTo(0, ry);
      context.lineTo(context.canvas.width, ry);
    }
    context.stroke();
    context.beginPath();
    for (let x = backgroundOriginX; x < this.width + stepY; x += stepX) {
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

  public panTowards(prevZoom: number, nextZoom: number, mouseX: number, mouseY: number) {
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
