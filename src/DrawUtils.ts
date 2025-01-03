import { fontStyles } from "./Consts";
import Entity from "./Entity";
import ImageLoader from "./ImageLoader";
import { TemplateSwatches } from "./TemplateSwatches";
import { getCurrentTheme } from "./Theme";
import { uiIconSize } from "./ui";
import { arc, findCircle, Pos } from "./utils";

export class DrawUtils {
  // Scale Variables
  public scaleRadius = 75;

  // Height & Width
  public scaleHeight = 0;
  public scaleWidth = 0;

  // Spacing
  public scaleSpacingX = 0;
  public scaleSpacingY = 0;

  // Scale Path pre calc
  public scalePathCenter1: Pos = { x: 0, y: 0 };
  public scalePathCenter2: Pos = { x: 0, y: 0 };
  public scalePathRadius = 0;
  public scalePathTop: Pos = { x: 0, y: 0 };
  public scalePathBottom: Pos = { x: 0, y: 0 };

  // Hole
  public scaleHole = 0;

  // Ratio
  // Measurements taken from https://theringlord.com/24k-gold-plate-large-scales/
  // Size: 7/8” x 1.41” with 0.35” hole (22.2mm x 35.8mm,8.9mm hole)
  // 22.5 / 35.8 = 0.628491620
  // 8.9 / 22.5 = 0.395555556
  // Hole's distance from top is not provided by TheRingLord.
  public scaleRatioWide = 0.62849162;
  public scaleRatioHigh = 1 / this.scaleRatioWide;
  public scaleRatioHole = 0.395555556;

  // Settings
  public drawEmpty = true;

  constructor(public imageAssets: ImageLoader) {}

  updateScaleVariables(radius = 75) {
    // Scale Base
    this.scaleRadius = radius;

    // Height & Width in PX
    this.scaleHeight = radius * this.scaleRatioHigh;
    this.scaleWidth = radius;

    // Spacing in PX
    this.scaleSpacingX = this.scaleWidth + radius * 0.1;
    this.scaleSpacingY = radius * 0.46;

    // Scale Path pre calc
    const middleX = this.scaleWidth / 2;
    const middleY = this.scaleHeight / 2;
    this.scalePathTop = { x: middleX, y: 0 };
    this.scalePathBottom = { x: middleX, y: this.scaleHeight };
    const { center: c1, radius: r1 } = findCircle(
      middleX,
      0,
      0,
      middleY,
      middleX,
      this.scaleHeight
    );
    this.scalePathCenter2 = { x: this.scaleWidth - c1.x, y: c1.y };
    this.scalePathCenter1 = c1;
    this.scalePathRadius = r1;

    // Hole
    // divide by 2 because `radius` refers to the outer radius which is equal to
    // the inner diameter, so divide by 2 to get the inner radius
    this.scaleHole = (radius * this.scaleRatioHole) / 2;
  }

  public drawImg(
    context: CanvasRenderingContext2D,
    entity: Entity,
    offsetX: number,
    offsetY: number
  ) {
    context.beginPath();

    if (entity.width > 0 && entity.height > 0) {
      context.drawImage(
        this.imageAssets.getImage(entity.imagesrc)!,
        entity.imageClipX,
        entity.imageClipY,
        entity.width,
        entity.height,
        entity.originX + offsetX,
        entity.originY + offsetY,
        entity.width,
        entity.height
      );
    } else {
      context.drawImage(
        this.imageAssets.getImage(entity.imagesrc)!,
        entity.originX + offsetX,
        entity.originY + offsetY
      );
    }

    context.closePath();
  }

  public drawPalette(
    context: CanvasRenderingContext2D,
    entity: Entity,
    offsetX: number,
    offsetY: number,
    swatches: TemplateSwatches
  ) {
    // Colour
    this.drawRect(context, entity, offsetX, offsetY);
    context.fillStyle = entity.fillColour;
    context.fill();

    // Brush
    if (entity.fillPalette?.brushed) {
      this.drawRect(context, entity, offsetX, offsetY);
      context.globalCompositeOperation = "overlay";
      context.fillStyle = swatches.textureSwatches[1].pattern ?? "#f00";
      context.fill();
      context.globalCompositeOperation = "source-over";
    }
  }

  public drawRect(
    context: CanvasRenderingContext2D,
    entity: Entity,
    offsetX: number,
    offsetY: number
  ) {
    context.beginPath();
    context.rect(
      entity.originX + offsetX,
      entity.originY + offsetY,
      entity.width,
      entity.height
    );
    context.closePath();

    if (entity.stroke) {
      this.shapeStroke(context, entity.strokeColour, entity.strokeWeight);
    }

    if (entity.fill) {
      this.shapeFill(context, entity.fillColour, entity.fillOrder);
    }
  }

  public drawScalePath(context: CanvasRenderingContext2D) {
    // Build Outer Scale
    context.beginPath();
    const middleX = this.scaleWidth / 2;
    arc(
      context,
      this.scalePathCenter1,
      this.scalePathRadius,
      this.scalePathBottom,
      this.scalePathTop
    );
    arc(
      context,
      this.scalePathCenter2,
      this.scalePathRadius,
      this.scalePathTop,
      this.scalePathBottom
    );
    context.closePath();

    // Cutout Hole
    const holeY = this.scaleHeight * 0.19; // estimate
    context.moveTo(middleX + this.scaleHole, holeY);
    context.arc(middleX, holeY, this.scaleHole, 0, 2 * Math.PI);
    context.closePath();
  }

  public drawText(
    context: CanvasRenderingContext2D,
    x: any,
    y: number,
    align: string,
    type: number,
    string: string
  ) {
    var textWidth = 0;
    var posX = x;

    context.font = fontStyles[type];
    context.fillStyle = getCurrentTheme().fontColour;

    if (align == "right") {
      textWidth = context.measureText(string).width;
      posX -= textWidth;
    }

    context.beginPath();
    context.fillText(string, posX, y);
    context.closePath();
  }

  public drawTooltip(
    target: CanvasRenderingContext2D,
    originX: number,
    originY: number,
    tipText: string,
    tipFlip: boolean
  ) {
    var textWidth = target.measureText(tipText).width;
    var textHeight = 10;
    var textPadding = 10;

    var boxX = originX;
    var boxY = originY - (textHeight + textPadding) / 2;
    var triA = 0;
    var triB = textHeight;

    var shadow = 3;
    var shadowOff = 3;

    if (tipFlip) {
      boxX = originX - uiIconSize - textPadding - textWidth - textHeight * 2;
      triA = textWidth + textPadding + textHeight * 2;
      triB = textWidth + textPadding + textHeight;

      shadowOff = -3;
    }

    // Build Background
    this.shapeShadow(target, shadowOff, shadow);

    target.beginPath();
    target.rect(
      boxX + textHeight,
      boxY,
      textWidth + textPadding,
      textHeight + textPadding
    );

    target.moveTo(boxX + triA, boxY + (textHeight + textPadding) / 2);
    target.lineTo(boxX + triB, boxY);
    target.lineTo(boxX + triB, boxY + (textHeight + textPadding));

    this.shapeFill(target, "rgba(60, 114, 92, 0.75)");
    target.closePath();

    // Build Text
    target.beginPath();
    target.fillStyle = "#ffffff";
    target.fillText(
      tipText,
      boxX + textHeight + textPadding / 4,
      boxY + textPadding + 3
    );
    target.closePath();
  }

  public shapeShadow(
    ctx: CanvasRenderingContext2D,
    shadowBlur = 5,
    offsetX = 0,
    offsetY = 0,
    colour = "rgba(0, 0, 0, 0.3)"
  ) {
    ctx.shadowBlur = shadowBlur;
    ctx.shadowColor = colour;
    ctx.shadowOffsetX = offsetX;
    ctx.shadowOffsetY = offsetY;
  }

  public shapeShadowReset(target: CanvasRenderingContext2D) {
    target.shadowBlur = 0;
    target.shadowColor = "rgba(0,0,0,0.3)";
    target.shadowOffsetX = 0;
    target.shadowOffsetY = 0;
  }

  public shapeStroke(
    target: CanvasRenderingContext2D,
    colour: string,
    weight = 2
  ) {
    target.strokeStyle = colour;
    target.lineWidth = weight;
    target.stroke();
  }

  public shapeFill(
    target: CanvasRenderingContext2D,
    colour: string,
    order: CanvasFillRule = "nonzero"
  ) {
    target.fillStyle = colour;
    target.fill(order);

    this.shapeShadowReset(target);
  }
}
