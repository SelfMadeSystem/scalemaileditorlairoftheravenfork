import { DrawUtils } from "./DrawUtils";
import { ColourPalette } from "./Palette";
import { PatternMatrix } from "./PatternMatrix";
import { Swatch } from "./Swatch";

export class TemplateSwatches {
    public gradientSwatches: Swatch[] = [];
    public textureSwatches: Swatch[] = [];
    public scaleSwatches: Swatch[] = [];
    public patternSwatch: Swatch;
  
    public shadowBlur = 3;
    public shadowX = 0;
    public shadowY = 3;
    public shadowColour = "rgba(0, 0, 0, 0.25)";
  
    /* Swatch Functions */
    constructor(private palette: ColourPalette, private drawUtils: DrawUtils) {
      var x = 0;
      var y = 0;
  
      // Gradients
      y = 2;
  
      for (x = 0; x < y; x++) {
        this.gradientSwatches.push(this.generateSwatch("gradientSwatch-" + x));
      }
  
      // Textures
      y = 2;
  
      for (x = 0; x < y; x++) {
        this.textureSwatches.push(this.generateSwatch("textureSwatch-" + x));
      }
  
      // Scales
      y = palette.colours.length;
  
      for (x = 0; x < y; x++) {
        this.scaleSwatches.push(this.generateSwatch("scaleSwatch-" + x));
      }
  
      // Pattern
      this.patternSwatch = this.generateSwatch("patternSwatch-" + x);
    };
  
    generateSwatch(id: string) {
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d")!;
      var newSwatch = new Swatch(id, canvas, context);
  
      //document.body.appendChild(newSwatch.canvas);
  
      return newSwatch;
    };
  
    scaleSwatch(swt: Swatch, height: number, width: number) {
      swt.height = height;
      swt.width = width;
  
      swt.canvas.height = height;
      swt.canvas.width = width;
  
      swt.canvas.style.height = height + "px";
      swt.canvas.style.width = width + "px";
    };
  
    regenerateSwatches(pattern: PatternMatrix) {
      this.generateGradientSwatches();
      this.generateTextureSwatches();
      this.generateScaleSwatches();
      this.generatePatternSwatch(pattern);
    };
  
    /* Pattern Functions */
    generatePatternSwatch(pattern: PatternMatrix) {
      // Resize Canvas
      var height =
        (pattern.height - 1) * this.drawUtils.scaleSpacingY +
        this.scaleSwatches[0].height;
      var width =
        pattern.width * this.drawUtils.scaleSpacingX + this.drawUtils.scaleWidthPx;
  
      this.scaleSwatch(this.patternSwatch, height, width);
  
      // Draw scales
      var patternHeight = pattern.height;
      var patternWidth = pattern.width;
  
      var sHalf = 0;
  
      var x = 0;
      var y = 0;
  
      var limit = 0;
  
      if (this.drawUtils.drawEmpty === false) {
        limit = 1;
      }
  
      for (y = patternHeight - 1; y >= 0; y--) {
        if (pattern.matrix[y][0].colour == 0) {
          // Odd
          sHalf = 0;
        } else {
          // Even
          sHalf = this.drawUtils.scaleSpacingXHalf;
        }
  
        // Add Scale Entity
        for (x = 0; x < patternWidth; x++) {
          if (pattern.matrix[y][x].colour > limit) {
            this.patternSwatch.context.drawImage(
              this.scaleSwatches[pattern.matrix[y][x].colour].canvas,
              Math.round(sHalf + this.drawUtils.scaleSpacingX * x),
              Math.round(this.drawUtils.scaleSpacingY * y)
            );
          }
        }
      }
    };
  
    /* Scale Functions */
    generateScaleSwatches() {
      var x = 0;
      var y = this.palette.colours.length;
  
      for (x = 0; x < y; x++) {
        this.scaleSwatch(
          this.scaleSwatches[x],
          this.drawUtils.scaleHeightPx + this.shadowY + this.shadowBlur / 2,
          this.drawUtils.scaleWidthPx + this.shadowX + this.shadowBlur / 2
        );
        this.generateScaleSwatch(
          this.scaleSwatches[x],
          this.palette.colours[x].hex,
          this.palette.colours[x].a,
          this.palette.colours[x].brushed,
          this.palette.colours[x].shiny,
          this.palette.colours[x].plastic
        );
      }
    };
  
    generateScaleSwatch(
      swatch: Swatch,
      hex: string,
      alpha: number,
      brushed: boolean = false,
      mirror: boolean = false,
      plastic: boolean = false,
    ) {

      var v = 0;
      var z = 0;
  
      if (alpha <= 60) {
        this.drawUtils.drawScalePath(swatch.context, 0, 0);
        swatch.context.fillStyle = hex;
        swatch.context.fill("evenodd");
      } else {
        // Flat Colour
        swatch.context.shadowBlur = this.shadowBlur;
        swatch.context.shadowColor = this.shadowColour;
        swatch.context.shadowOffsetX = this.shadowX;
        swatch.context.shadowOffsetY = this.shadowY;
  
        this.drawUtils.drawScalePath(swatch.context, 0, 0);
        swatch.context.fillStyle = hex;
        swatch.context.fill("evenodd");
        this.drawUtils.shapeShadowReset(swatch.context);
  
        swatch.context.shadowBlur = 0;
        swatch.context.shadowColor = this.shadowColour;
        swatch.context.shadowOffsetX = 0;
        swatch.context.shadowOffsetY = 0;
  
        // Brush Texture
        if (mirror === false && plastic === false) {
          if (brushed === true) {
            v = 1;
          }
  
          swatch.context.globalCompositeOperation = "overlay";
  
          if (swatch.context.globalCompositeOperation !== "overlay") {
            console.log("Browser doesn't support the overlay blend mode.");
          } else {
            this.drawUtils.drawScalePath(swatch.context, 0, 0);
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
          this.drawUtils.drawScalePath(swatch.context, 0, 0);
          swatch.context.fillStyle = this.gradientSwatches[z].gradient ?? "#f00";
          swatch.context.fill("evenodd");
        }
      }
    };
  
    /* Texture Functions */
    generateTextureSwatches() {
      var x = 0;
      var y = 2;
  
      var tex = [0.1, 0.225];
  
      for (x = 0; x < y; x++) {
        this.scaleSwatch(
          this.textureSwatches[x],
          this.drawUtils.scaleHeightPx,
          this.drawUtils.scaleHeightPx
        );
        this.generateTextureSwatch(this.textureSwatches[x], tex[x]);
      }
    };
  
    generateTextureSwatch(swatch: Swatch, alphaMod: number) {
      swatch.context.globalAlpha = alphaMod;
      const img = this.drawUtils.imageAssets.getImage("textureBrushed");
      if (img) {
        swatch.context.drawImage(img, 0, 0);
      } else {
        swatch.context.fillStyle = "rgba(255, 0, 0, 1)"; // obvious colour for debugging
        swatch.context.fillRect(0, 0, swatch.width, swatch.height);
      }
  
      const pattern = swatch.context.createPattern(swatch.canvas, "no-repeat");
      swatch.pattern = pattern ?? undefined;
    };
  
    /* Gradient Functions */
    generateGradientSwatches() {
      var x = 0;
      var y = 2;
  
      var gra = [0, 30];
  
      for (x = 0; x < y; x++) {
        this.scaleSwatch(
          this.gradientSwatches[x],
          this.drawUtils.scaleHeightPx,
          this.drawUtils.scaleWidthPx
        );
        this.generateGradientSwatch(this.gradientSwatches[x], gra[x]);
      }
    };
  
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
    };
  }