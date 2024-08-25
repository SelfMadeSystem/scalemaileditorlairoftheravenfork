import { fontStyles } from "./Consts";
import Entity from "./Entity";
import { EntityLayer } from "./EntityLayer";
import ImageLoader from "./ImageLoader";
import { TemplateSwatches } from "./TemplateSwatches";
import { themes } from "./Theme";
import { uiIconSize } from "./ui";

export class DrawUtils {
  public theme: 0 | 1 = 0;

  // Scale Variables
  public scaleRadius = 75;
  public scaleInnerHoleOffset = 0;
  public scaleInnerHoleRadius = 0;

  public scaleOffsetX = 0;
  public scaleOffsetY = 0;
  public scaleOffsetR = 0;

  public scaleOffsetXDouble = 0;
  public scaleOffsetXHalf = 0;

  public scaleHeightPx = 0;
  public scaleHeightPxHalf = 0;
  public scaleHeightPxQuarter = 0;

  public scaleWidthPx = 0;
  public scaleWidthPxHalf = 0;

  public scaleSpacingX = 0;
  public scaleSpacingXHalf = 0;

  public scaleSpacingY = 0;

  public scaleRatioWide = 0.609022556;
  public scaleRatioHigh = 1.641975309;

  // Settings
  public drawEmpty = true;

  constructor(public imageAssets: ImageLoader) {}

  public drawBackgroundDots(
    context: CanvasRenderingContext2D,
    layer: EntityLayer,
    pattern: any,
    editorLayer: EntityLayer
  ) {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    const colour = themes[this.theme].dotColour;

    // Variables
    var h = editorLayer.entities[0].imageCanvas!.height / 2;
    var w = editorLayer.entities[0].imageCanvas!.width / 2;
    var m = 0;
    var x = 0;
    var y = 0;

    var drawX = 0;
    var drawY = 0;

    var backgroundOriginX = 0;
    var backgroundOriginY = 0;

    var stepX = this.scaleSpacingX;
    var stepY = this.scaleSpacingY * 2;

    var dot = Math.floor(this.scaleRadius / 30);

    if (dot < 1) {
      dot = 1;
    }

    // Calculate Bottom Left Scale
    if (pattern.matrix[pattern.matrix.length - 1][0].colour == 0) {
      m = this.scaleSpacingXHalf;
    }

    backgroundOriginX = layer.centerX - w - dot + this.scaleSpacingX + m;
    backgroundOriginY = layer.centerY + h - dot * 1.5;

    // Calculate Pan Offset
    backgroundOriginX += layer.offsetX;
    backgroundOriginY += layer.offsetY;

    // Step Back to Edge
    for (x = 0; backgroundOriginX > 0; x++) {
      backgroundOriginX -= stepX;
    }

    for (y = 0; backgroundOriginY > 0; y++) {
      backgroundOriginY -= stepY;
    }

    // Draw Dots
    context.beginPath();
    for (y = 0; (y - 1) * stepY < layer.height; y++) {
      for (x = 0; (x - 1) * stepX < layer.width; x++) {
        drawX = Math.round(backgroundOriginX + stepX * x);
        drawY = Math.round(backgroundOriginY + stepY * y);
        context.rect(drawX, drawY, dot, dot);

        drawX += Math.round(this.scaleSpacingXHalf);
        drawY -= Math.round(this.scaleSpacingY);
        context.rect(drawX, drawY, dot, dot);
      }
    }

    context.closePath();

    context.fillStyle = colour;
    context.fill("nonzero");
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
    swatches: TemplateSwatches,
  ) {
    // Colour
    this.drawRect(context, entity, offsetX, offsetY);
    context.fillStyle = entity.fillColour;
    context.fill();

    // Brush
    if (entity.fillPalette?.brushed === true) {
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

    if (entity.stroke === true) {
      this.shapeStroke(context, entity.strokeColour, entity.strokeWeight);
    }

    if (entity.fill === true) {
      this.shapeFill(context, entity.fillColour, entity.fillOrder);
    }
  }

  public drawScalePath(
    context: CanvasRenderingContext2D,
    originX: number,
    originY: number
  ) {
    originX += this.scaleOffsetXDouble;
    originY += this.scaleOffsetY;

    // Build Outer Scale
    context.beginPath();
    context.arc(originX, originY, this.scaleRadius, 5.19, 1.08);
    context.arc(
      originX + this.scaleRadius - this.scaleOffsetXDouble,
      originY,
      this.scaleRadius,
      2.05,
      4.23
    );
    context.closePath();

    // Cutout Hole
    context.moveTo(
      originX + this.scaleInnerHoleOffset - this.scaleOffsetX + this.scaleInnerHoleRadius - this.scaleOffsetXHalf,
      originY - this.scaleInnerHoleOffset - this.scaleOffsetX
    );
    context.arc(
      originX + this.scaleInnerHoleOffset - this.scaleOffsetX,
      originY - this.scaleInnerHoleOffset - this.scaleOffsetX,
      this.scaleInnerHoleRadius - this.scaleOffsetXHalf,
      0,
      2 * Math.PI
    );
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
    context.fillStyle = themes[this.theme].fontColour;

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

    if (tipFlip === true) {
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
