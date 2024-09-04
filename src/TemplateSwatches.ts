import { DrawUtils } from "./DrawUtils";
import { ColourPalette } from "./Palette";
import { PatternMatrix } from "./PatternMatrix";
import { Swatch } from "./Swatch";

export class TemplateSwatches {
  public gradientSwatches: [Swatch, Swatch] = [new Swatch(), new Swatch()];
  public textureSwatches: [Swatch, Swatch] = [new Swatch(), new Swatch()];
  public scaleSwatches: Swatch[];
  public patternSwatch: Swatch = new Swatch();

  public shadowBlur = 3;
  public shadowX = 0;
  public shadowY = 3;
  public shadowColour = "rgba(0, 0, 0, 0.25)";

  /* Swatch Functions */
  constructor(private palette: ColourPalette, private drawUtils: DrawUtils) {
    this.scaleSwatches = new Array(palette.colours.length)
      .fill(0)
      .map(() => new Swatch());
  }

  scaleSwatch(swt: Swatch, height: number, width: number) {
    swt.height = height;
    swt.width = width;

    swt.canvas.height = height;
    swt.canvas.width = width;

    swt.canvas.style.height = height + "px";
    swt.canvas.style.width = width + "px";
  }

  regenerateSwatches() {
    this.generateGradientSwatches();
    this.generateTextureSwatches();
    this.generateScaleSwatches();
  }

  /* Pattern Functions */
  generatePatternSwatch(pattern: PatternMatrix) {
    // Resize Canvas
    var height =
      (pattern.height - 1) * this.drawUtils.scaleSpacingY +
      this.scaleSwatches[0].height;
    var width =
      pattern.width * this.drawUtils.scaleSpacingX + this.drawUtils.scaleWidth;

    this.scaleSwatch(this.patternSwatch, height, width);

    // Draw scales
    var patternHeight = pattern.height;
    var patternWidth = pattern.width;

    var sHalf = 0;

    var limit = 0;

    if (this.drawUtils.drawEmpty === false) {
      limit = 1;
    }

    for (let y = patternHeight - 1; y >= 0; y--) {
      if (pattern.matrix[y][0].colour == 0) {
        // Odd
        sHalf = 0;
      } else {
        // Even
        sHalf = this.drawUtils.scaleSpacingX / 2;
      }

      // Add Scale Entity
      for (let x = 0; x < patternWidth; x++) {
        if (pattern.matrix[y][x].colour <= limit) {
          continue;
        }

        const posX = sHalf + this.drawUtils.scaleSpacingX * x;
        const posY = this.drawUtils.scaleSpacingY * y;

        this.patternSwatch.context.drawImage(
          this.scaleSwatches[pattern.matrix[y][x].colour].canvas,
          posX,
          posY
        );
      }
    }
  }

  /* Scale Functions */
  generateScaleSwatches() {
    if (this.palette.colours.length !== this.scaleSwatches.length) {
      this.scaleSwatches = new Array(this.palette.colours.length)
        .fill(0)
        .map(() => new Swatch());
    }
    for (let x = 0; x < this.palette.colours.length; x++) {
      this.scaleSwatch(
        this.scaleSwatches[x],
        this.drawUtils.scaleHeight + this.shadowY + this.shadowBlur / 2,
        this.drawUtils.scaleWidth + this.shadowX + this.shadowBlur / 2
      );
      this.generateScaleSwatch(
        this.scaleSwatches[x],
        this.palette.colours[x].color,
        this.palette.colours[x].a,
        this.palette.colours[x].brushed,
        this.palette.colours[x].shiny,
        this.palette.colours[x].plastic
      );
    }
  }

  generateScaleSwatch(
    swatch: Swatch,
    hex: string,
    alpha: number,
    brushed: boolean = false,
    mirror: boolean = false,
    plastic: boolean = false
  ) {
    var v = 0;
    var z = 0;

    if (alpha <= 60) {
      this.drawUtils.drawScalePath(swatch.context);
      swatch.context.fillStyle = hex;
      swatch.context.fill("evenodd");
    } else {
      // Flat Colour
      swatch.context.shadowBlur = this.shadowBlur;
      swatch.context.shadowColor = this.shadowColour;
      swatch.context.shadowOffsetX = this.shadowX;
      swatch.context.shadowOffsetY = this.shadowY;

      this.drawUtils.drawScalePath(swatch.context);
      swatch.context.fillStyle = hex;
      swatch.context.fill("evenodd");
      this.drawUtils.shapeShadowReset(swatch.context);

      swatch.context.shadowBlur = 0;
      swatch.context.shadowColor = this.shadowColour;
      swatch.context.shadowOffsetX = 0;
      swatch.context.shadowOffsetY = 0;

      // Brush Texture
      if (plastic === false) {
        if (brushed === true) {
          v = 1;
        }

        swatch.context.globalCompositeOperation = "overlay";

        if (swatch.context.globalCompositeOperation !== "overlay") {
          console.log("Browser doesn't support the overlay blend mode.");
        } else {
          this.drawUtils.drawScalePath(swatch.context);
          swatch.context.fillStyle = this.textureSwatches[v].pattern ?? "#f00";
          swatch.context.fill("evenodd");
        }
      }

      // Sheen Gradient
      if (mirror === true) {
        z = 1;
      }

      swatch.context.globalCompositeOperation = "overlay";

      if (swatch.context.globalCompositeOperation !== "overlay") {
        console.log("Browser doesn't support the overlay blend mode.");
      } else {
        this.drawUtils.drawScalePath(swatch.context);
        swatch.context.fillStyle = this.gradientSwatches[z].gradient ?? "#f00";
        swatch.context.fill("evenodd");
      }
    }
  }

  /* Texture Functions */
  generateTextureSwatches() {
    var x = 0;
    var y = 2;

    var tex = [0.1, 0.225];

    for (x = 0; x < y; x++) {
      this.scaleSwatch(
        this.textureSwatches[x],
        this.drawUtils.scaleHeight,
        this.drawUtils.scaleHeight
      );
      this.generateTextureSwatch(this.textureSwatches[x], tex[x]);
    }
  }

  generateTextureSwatch(swatch: Swatch, alphaMod: number) {
    swatch.context.globalAlpha = alphaMod;
    const img = this.drawUtils.imageAssets.getImage("textureBrushed");
    if (img) {
      swatch.context.drawImage(img, 0, 0, swatch.width, swatch.height);
    } else {
      swatch.context.fillStyle = "rgba(255, 0, 0, 1)"; // obvious colour for debugging
      swatch.context.fillRect(0, 0, swatch.width, swatch.height);
    }

    const pattern = swatch.context.createPattern(swatch.canvas, "no-repeat");
    swatch.pattern = pattern ?? undefined;
  }

  /* Gradient Functions */
  generateGradientSwatches() {
    var x = 0;
    var y = 2;

    var gra = [0, 30];

    for (x = 0; x < y; x++) {
      this.scaleSwatch(
        this.gradientSwatches[x],
        this.drawUtils.scaleHeight,
        this.drawUtils.scaleWidth
      );
      this.generateGradientSwatch(this.gradientSwatches[x], gra[x]);
    }
  }

  generateGradientSwatch(swatch: Swatch, rgbaMod: number) {
    var gradient = swatch.context.createLinearGradient(0, 0, swatch.width, 0);

    gradient.addColorStop(
      0,
      "rgba(" +
        (85 - rgbaMod) +
        ", " +
        (85 - rgbaMod) +
        ", " +
        (85 - rgbaMod) +
        ", 1)"
    );

    gradient.addColorStop(
      0.425,
      "rgba(" +
        (104 - rgbaMod) +
        ", " +
        (104 - rgbaMod) +
        ", " +
        (104 - rgbaMod) +
        ", 1)"
    );
    gradient.addColorStop(
      0.475,
      "rgba(" +
        (119 - rgbaMod) +
        ", " +
        (119 - rgbaMod) +
        ", " +
        (119 - rgbaMod) +
        ", 1)"
    );

    gradient.addColorStop(
      0.525,
      "rgba(" +
        (119 + rgbaMod) +
        ", " +
        (119 + rgbaMod) +
        ", " +
        (119 + rgbaMod) +
        ", 1)"
    );
    gradient.addColorStop(
      0.575,
      "rgba(" +
        (134 + rgbaMod) +
        ", " +
        (134 + rgbaMod) +
        ", " +
        (134 + rgbaMod) +
        ", 1)"
    );

    gradient.addColorStop(
      1,
      "rgba(" +
        (175 + rgbaMod) +
        ", " +
        (175 + rgbaMod) +
        ", " +
        (175 + rgbaMod) +
        ", 1)"
    );

    swatch.gradient = gradient;
  }
}
