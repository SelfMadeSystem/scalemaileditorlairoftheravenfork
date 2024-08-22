import { fontStyles, updateInterval } from "./Consts";
import { DrawUtils } from "./DrawUtils";
import Entity from "./Entity";

export class EntityLayer {
  public canvas: HTMLCanvasElement;
  public context: CanvasRenderingContext2D;
  public entities: Entity[] = [];
  public id: string;

  public lastDraw = 0;
  public redrawQueueTimer = -1;

  public centerX = 0;
  public centerY = 0;
  public height = 0;
  public offsetX = 0;
  public offsetY = 0;
  public reverse = false;
  public width = 0;

  public tooltip = false;
  public tooltipFlip = false;
  public tooltipText = "";
  public tooltipX = 0;
  public tooltipY = 0;

  public expanded = false;

  constructor(
    props:
      | string
      | {
          id: string;
          width: number;
          height: number;
        },
    private drawUtils: DrawUtils
  ) {
    if (typeof props === "string") {
      this.id = props;
      this.canvas = document.getElementById(this.id) as HTMLCanvasElement;
      this.context = this.canvas.getContext("2d")!;

      this.canvas.style.height = "100%";
      this.canvas.style.width = "100%";

      this.context.imageSmoothingEnabled = false;
      this.context.font = fontStyles[1];

      this.scaleCanvas();
    } else {
      this.id = ""; // No ID; doesn't matter
      this.canvas = document.createElement("canvas");
      this.context = this.canvas.getContext("2d")!;

      this.context.imageSmoothingEnabled = false;
      this.context.font = fontStyles[1];

      this.scaleCanvas(props.height, props.width, false);
    }
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

    this.canvas.style.height = height + "px";
    this.canvas.style.width = width + "px";

    this.canvas.height = this.height;
    this.canvas.width = this.width;

    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }

  /* Entity Functions */
  public addEntity(...ent: Entity[]) {
    this.entities.push(...ent);
  }

  public clearEntities() {
    this.entities = [];
  }

  public removeEntity(id: string) {
    var x = 0;
    var y = this.entities.length;

    for (x = 0; x < y; x++) {
      if (this.entities[x].id == id) {
        this.entities.splice(x, 1);
      }
    }
  }

  /* Layer Functions */
  public redrawCanvas() {
    if (this.lastDraw + updateInterval < Date.now()) {
      this.lastDraw = Date.now();

      var x = 0;
      var y = this.entities.length;
      var z = 1;

      // Set Write Direction
      if (this.reverse === true) {
        x = y - 1;
        y = 0;
        z = -1;
      }

      // Erase Canvas
      this.context.clearRect(0, 0, this.width, this.height);

      // Draw Entities
      for (; x != y; x += z) {
        switch (this.entities[x].shape) {
          case "canvas":
            var oh = this.entities[x].imageCanvas!.height / 2;
            var ow = this.entities[x].imageCanvas!.width / 2;

            this.context.drawImage(
              this.entities[x].imageCanvas!,
              Math.round(this.centerX - ow + this.offsetX),
              Math.round(this.centerY - oh + this.offsetY)
            );
            return;
            break;

          case "image":
            this.drawUtils.drawImg(this.context, this.entities[x], this.offsetX, this.offsetY);
            break;

          case "palette":
            this.drawUtils.drawPalette(
              this.context,
              this.entities[x],
              this.offsetX,
              this.offsetY
            );
            break;

          case "rect":
            this.drawUtils.drawRect(
              this.context,
              this.entities[x],
              this.offsetX,
              this.offsetY
            );
            break;

          case "text":
            this.drawUtils.drawText(
              this.context,
              this.entities[x].originX,
              this.entities[x].originY,
              this.entities[x].textAlign,
              this.entities[x].textType,
              this.entities[x].textString
            );
            break;
        }
      }

      // Draw Tooltip
      if (this.tooltip === true) {
        this.drawUtils.drawTooltip(
          this.context,
          this.tooltipX,
          this.tooltipY,
          this.tooltipText,
          this.tooltipFlip
        );
      }
    } else {
      var that = this;

      if (this.redrawQueueTimer >= 0) {
        clearInterval(this.redrawQueueTimer);
      }

      this.redrawQueueTimer = setTimeout(() => {
        that.redrawCanvas();
        this.redrawQueueTimer = -1;
      }, updateInterval);
    }
  }

  // Pan Functions
  public panCanvas(moveX: number, moveY: number) {
    this.offsetX += moveX;
    this.offsetY += moveY;

    this.redrawCanvas();
  }

  public panReset() {
    this.offsetX = 0;
    this.offsetY = 0;
    this.panCanvas(0, 0);
  }

  // Tooltip Functions
  public setTooltip(x: number, y: number, tipText: string, flip: boolean) {
    this.tooltip = true;

    this.tooltipFlip = flip;
    this.tooltipText = tipText;

    this.tooltipX = x;
    this.tooltipY = y;
  }

  public clearTooltip() {
    this.tooltip = false;

    this.tooltipFlip = false;
    this.tooltipText = "";

    this.tooltipX = 0;
    this.tooltipY = 0;
  }
}
