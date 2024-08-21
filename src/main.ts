/*
 * Scalemail Inlay Designer v3
 * Developed by Anthony Edmonds for Lair of the Raven Ltd
 * Ported to TypeScript and continued development by SelfMadeSystem
 *
 * Copyright Lair of the Raven Ltd 2017
 * Copyright SelfMadeSystem 2024
 */

import "./style.css";
import ImageLoader, { imagePath } from "./ImageLoader";
import Entity from "./Entity";
import { ColourPalette, PaletteColour } from "./Palette";
import { Swatch } from "./Swatch";
import { ThemeSet } from "./Theme";
import { stringToElements } from "./utils";
import { OverlayInterface } from "./overlay/OverlayInterface";
import { OverlayScreen } from "./overlay/OverlayScreen";
import { OverlayObject } from "./overlay/OverlayObject";
import { makeOverlayPane, OverlayPane } from "./overlay/OverlayPane";

// Variables ==========================================================================================================
// Assets
const imageAssets = new ImageLoader(startDesigner);

// Canvases
var backgroundLayer = new EntityLayer();
var editorLayer = new EntityLayer();
const interactionLayer = document.getElementById(
  "canvasWrapper"
) as HTMLDivElement;
var uiLayer = new EntityLayer();
var photoLayer = new EntityLayer();

var canvasCenterX = 0;
var canvasCenterY = 0;
var updateInterval = 1000 / 60;

// Entities
var nEnt;
var sEnt;

// Font Styles
const fontStyles = [
  "bold 12px Montserrat",
  "12px Montserrat",
  "bold 18px Montserrat",
  "18px Montserrat",
];

var patternShape = 0;

// Gallery Variables
var loadedID = 0;
var loadedTitle = "";
var loadedAuthor = "";
var loadedPrivacy = true;
var loadedSRC = "";

var searchResults;
var searchPage = 0;
var pageLimit = 30;

var browserHistory;

var saveLayer = new EntityLayer();

var allowedCharacters = new RegExp("^[a-z0-9 _-]+$");

var restrictedWords = [
  "lair of the raven",
  "anthony edmonds",
  "cunt",
  "fag",
  "fuck",
  "nigga",
  "nigger",
  "piss",
  "shit",
  "whore",
];

var restrictedAuthors = ["raven", "lotr"];

// Interaction Variables
var panOffsetX = 0;
var panOffsetY = 0;
var panCenterX = 0;
var panCenterY = 0;

var panState = false;
var panMouse = false;
var panKey = false;

// Overlay Variables
var overlay = new OverlayInterface();
var splashText;

// Palette Variables
var palette = new ColourPalette();
var activeColour = 2;

var gradientSheen;
var gradientShiny;
var textureBrushed;

// Pattern Variables
var editorPattern = new PatternMatrix();

// Ruler Variables
var rulerUnits = "metric";
var rulerSize = "large";
var rulerData = [];
var sCount = 0;

rulerData["small"] = {
  width: 14,
  height: 22,
  gapH: 1,
  gapV: 6,
  weightS: 0.35,
  weightR: 0.13,
};
rulerData["large"] = {
  width: 22,
  height: 36,
  gapH: 2,
  gapV: 12,
  weightS: 0.54,
  weightR: 0.42,
};

rulerData["metric"] = {
  unitSize: "mm",
  multiSize: 1,
  unitWeight: "g",
  multiWeight: 1,
};
rulerData["imperial"] = {
  unitSize: '"',
  multiSize: 0.0393701,
  unitWeight: "oz",
  multiWeight: 0.035274,
};

// Scale Variables
var scaleRadius = 75;
var scaleInnerHoleOffset = 0;
var scaleInnerHoleRadius = 0;

var scaleOffsetX = 0;
var scaleOffsetY = 0;
var scaleOffsetR = 0;

var scaleOffsetXDouble = 0;
var scaleOffsetXHalf = 0;

var scaleHeightPx = 0;
var scaleHeightPxHalf = 0;
var scaleHeightPxQuarter = 0;

var scaleWidthPx = 0;
var scaleWidthPxHalf = 0;

var scaleSpacingX = 0;
var scaleSpacingXHalf = 0;

var scaleSpacingY = 0;

var scaleRatioWide = 0.609022556;
var scaleRatioHigh = 1.641975309;

// Swatch Variables
var swatches = new TemplateSwatches();
var drawEmpty = true;

// Theme Variables
var themeLibrary = new ThemeSet();
var theme = 0;

// UI Variables
var uiToolbox = new UiSection();
var uiCamera = new UiSection();

var uiOffsetX = 15;
var uiOffsetY = 15;
var uiIconSize = 30;

var currentTool = "toolboxCursor";

// Objects ============================================================================================================
// Interface
function UiSection() {
  this.name = "";
  this.buttons = [];

  this.alignRight = false;
  this.alignBottom = false;

  this.addButton = function (btn) {
    this.buttons.push(btn);
  };

  this.buildSection = function (target) {
    // Variables
    var x = 0;
    var y = this.buttons.length;
    var z = 0;
    var l = 0;

    var sx = 0;

    var ox = 0;
    var oy = 0;

    // Configure Origin
    if (this.alignRight === true) {
      ox = target.width - uiOffsetX - uiIconSize;
    } else {
      ox = uiOffsetX;
    }

    if (this.alignBottom === true) {
      oy = target.height - uiOffsetX - uiIconSize;
    } else {
      oy = uiOffsetY;
    }

    // Create Entities
    for (x = 0; x < y; x++) {
      if (this.buttons[x].pregap === true) {
        sx += uiIconSize;
      }

      target.addEntity(
        this.buttons[x].createButtonEntity(target, ox, oy + uiIconSize * x + sx)
      );

      if (
        this.buttons[x].expandable === true &&
        this.buttons[x].expanded === true
      ) {
        l = this.buttons[x].subbuttons.length;

        for (z = 0; z < l; z++) {
          if (this.buttons[x].subbuttons[z].name == currentTool) {
            this.buttons[x].selected = z;
            this.buttons[x].name = this.buttons[x].subbuttons[z].name;
            this.buttons[x].helptext = this.buttons[x].subbuttons[z].helptext;
          }

          target.addEntity(
            this.buttons[x].subbuttons[z].createButtonEntity(
              target,
              ox + uiIconSize * z,
              oy + uiIconSize * x + sx
            )
          );
        }
      }
    }
  };
}

function UiButton() {
  this.name = "";
  this.group = "";
  this.subbuttons = [];

  this.action = "";
  this.expanded = false;
  this.expandable = false;
  this.helptext = [];
  this.icon = "";
  this.pregap = false;
  this.selected = 0;
  this.state = false;
  this.tiptext = "";

  this.addButton = function (btn) {
    this.subbuttons.push(btn);
  };

  this.createButtonEntity = function (target, ox, oy) {
    if (ox === undefined) ox = 0;
    if (oy === undefined) oy = 0;

    nEnt = new Entity();
    nEnt.id = this.name;
    nEnt.object = this;
    nEnt.shape = "image";

    nEnt.mouse = true;
    nEnt.mouseClick = true;
    nEnt.mouseHover = true;

    if (this.icon !== false) {
      nEnt.imagesrc = this.icon;
    } else {
      nEnt.imagesrc = this.subbuttons[this.selected].icon;
    }

    if (currentTool == this.name) {
      nEnt.imageClipX = uiIconSize;
      nEnt.imageClipY = 0;
    } else {
      nEnt.imageClipX = 0;
      nEnt.imageClipY = 0;
    }

    nEnt.tooltip = true;
    if (this.tiptext === false) {
      nEnt.tooltipText = this.subbuttons[this.selected].tiptext;
    } else {
      nEnt.tooltipText = this.tiptext;
    }

    nEnt.originX = ox;
    nEnt.originY = oy;
    nEnt.height = uiIconSize;
    nEnt.width = uiIconSize;

    if (currentTool == this.name) {
      this.createButtonHelp(target);
    }

    return nEnt;
  };

  this.createButtonHelp = function (target) {
    var x = 0;
    var y = this.helptext.length;

    for (x = 0; x < y; x++) {
      sEnt = new Entity();
      sEnt.id = "help-" + x;
      sEnt.shape = "text";

      if (x == 0) {
        sEnt.textType = 0;
      } else {
        sEnt.textType = 1;
        sEnt.textString = "- ";
      }

      sEnt.textString += this.helptext[x];

      sEnt.originX = uiOffsetX * 2 + uiIconSize;
      sEnt.originY = uiOffsetY + 10 + 15 * x;

      target.addEntity(sEnt);
    }
  };
}

// Layer
function EntityLayer() {
  this.canvas;
  this.context;
  this.entities = [];
  this.id;

  this.lastDraw = 0;
  this.redrawQueueTimer = false;

  this.centerX = 0;
  this.centerY = 0;
  this.height = 0;
  this.offsetX = 0;
  this.offsetY = 0;
  this.reverse = false;
  this.width = 0;

  this.tooltip = false;
  this.tooltipFlip = false;
  this.tooltipText = "";
  this.tooltipX = 0;
  this.tooltipY = 0;

  this.expanded = false;

  /* Canvas Functions */
  this.setupCanvas = function () {
    this.canvas = document.getElementById(this.id);
    this.context = this.canvas.getContext("2d");

    this.canvas.style.height = "100%";
    this.canvas.style.width = "100%";

    this.context.imageSmoothingEnabled = false;
    this.context.font = fontStyles[1];

    this.scaleCanvas();
  };

  this.setupMemory = function () {
    this.canvas = document.createElement("canvas");
    this.context = this.canvas.getContext("2d");

    this.context.imageSmoothingEnabled = false;
    this.context.font = fontStyles[1];

    this.scaleCanvas(25, 25, false);

    //document.body.appendChild(this.canvas);
  };

  this.scaleCanvas = function (height, width, minimum) {
    if (height === undefined) height = window.innerHeight;
    if (width === undefined) width = window.innerWidth;
    if (minimum === undefined) minimum = true;

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
  };

  /* Entity Functions */
  this.addEntity = function (ent) {
    this.entities.push(ent);
  };

  this.clearEntities = function () {
    this.entities = [];
  };

  this.removeEntity = function (id) {
    var x = 0;
    var y = this.entities.length;

    for (x = 0; x < y; x++) {
      if (this.entities[x].id == id) {
        this.entities.splice(x, 1);
      }
    }
  };

  /* Layer Functions */
  this.redrawCanvas = function () {
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
          case "background":
            drawBackgroundDots(this, editorPattern);
            break;

          case "canvas":
            var oh = this.entities[x].imagesrc.height / 2;
            var ow = this.entities[x].imagesrc.width / 2;

            this.context.drawImage(
              this.entities[x].imagesrc,
              Math.round(this.centerX - ow + this.offsetX),
              Math.round(this.centerY - oh + this.offsetY)
            );
            return;
            break;

          case "image":
            drawImg(this.context, this.entities[x], this.offsetX, this.offsetY);
            break;

          case "palette":
            drawPalette(
              this.context,
              this.entities[x],
              this.offsetX,
              this.offsetY
            );
            break;

          case "rect":
            drawRect(
              this.context,
              this.entities[x],
              this.offsetX,
              this.offsetY
            );
            break;

          case "scale":
            //drawScale(this.context, this.entities[x], this.offsetX, this.offsetY);
            break;

          case "text":
            drawText(
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
        drawTooltip(
          this.context,
          this.tooltipX,
          this.tooltipY,
          this.tooltipText,
          this.tooltipFlip
        );
      }
    } else {
      var that = this;

      if (this.redrawQueueTimer !== false) {
        clearInterval(this.redrawQueueTimer);
      }

      this.redrawQueueTimer = setTimeout(function () {
        that.redrawCanvas();
        this.redrawQueueTimer = false;
      }, updateInterval);
    }
  };

  // Pan Functions
  this.panCanvas = function (moveX, moveY) {
    this.offsetX += moveX;
    this.offsetY += moveY;

    this.redrawCanvas();
  };

  this.panReset = function () {
    this.offsetX = 0;
    this.offsetY = 0;
    this.panCanvas(0, 0);
  };

  // Tooltip Functions
  this.setTooltip = function (x, y, tipText, flip) {
    this.tooltip = true;

    this.tooltipFlip = flip;
    this.tooltipText = tipText;

    this.tooltipX = x;
    this.tooltipY = y;
  };

  this.clearTooltip = function () {
    this.tooltip = false;

    this.tooltipFlip = false;
    this.tooltipText = "";

    this.tooltipX = 0;
    this.tooltipY = 0;
  };
}

// Palette

// Pattern
function PatternMatrix() {
  this.matrix = [];

  this.height = 0;
  this.width = 0;

  this.physicalHeight = 0;
  this.physicalWidth = 0;

  // Matrix Functions
  this.clearMatrix = function () {
    this.matrix = [];
    this.height = 0;
    this.width = 0;
  };

  this.copyMatrix = function (target) {
    this.matrix = target.matrix;
    this.getSize();
  };

  this.loadMatrix = function (matrix) {
    var x = 0;
    var s = 0;
    var y = matrix.length;
    var z = matrix[0].length;

    newPattern(this, z, y, false);

    for (x = 0; x < y; x++) {
      for (s = 0; s < z; s++) {
        this.colourScale(x, s, matrix[x][s].colour);
      }
    }
  };

  this.getSize = function () {
    // Store Matrix Size
    this.height = this.matrix.length;
    this.width = this.matrix[0].length;

    // Calculate Physical Size
    if (this.height > 0 && this.width > 0) {
      // Find corners
      var firstRow = this.findFirstColour("row", 1);
      var lastRow = this.findFirstColour("row", 0);

      var firstCol = this.findFirstColour("col", 1);
      var lastCol = this.findFirstColour("col", 0);

      // Determine Physical Size of Pattern
      if (
        firstRow[0] !== false &&
        lastRow[0] !== false &&
        firstCol[0] !== false &&
        lastCol[0] !== false
      ) {
        // Calculate Physical Size
        this.physicalHeight = lastRow[0] - firstRow[0];
        this.physicalWidth = lastCol[1] - firstCol[1];

        if (
          this.matrix[firstCol[0]][0].colour == 0 ||
          this.matrix[this.height - 1 - lastCol[0]][0].colour == 0
        ) {
          this.physicalWidth -= 0.5;
        }

        if (firstRow[0] === false && lastRow[0] === false) {
          this.physicalHeight = 0;
        } else {
          this.physicalHeight += 1;
        }

        if (firstCol[1] === false && lastCol[1] === false) {
          this.physicalWidth = 0;
        } else {
          this.physicalWidth += 1;
        }
      }
    }
  };

  this.findFirstColour = function (mode, direction) {
    if (direction === undefined) direction = 1;

    var colX = 0;
    var colY = 0;

    var rowX = 0;
    var rowY = 0;
    var rowZ = 0;

    switch (mode) {
      case "col":
        rowY = this.height;

        if (direction == 1) {
          colX = 0;
          colY = this.width;

          for (; colX < colY; colX++) {
            if (this.matrix[0][0].colour == 0) {
              rowX = 0;
              rowZ = 1;
            } else {
              rowX = 1;
              rowZ = 0;
            }

            for (; rowX < rowY; rowX += 2) {
              if (this.matrix[rowX][colX].colour > 1) {
                return [rowX, colX];
              }
            }

            for (; rowZ < rowY; rowZ += 2) {
              if (this.matrix[rowZ][colX].colour > 1) {
                return [rowZ, colX];
              }
            }
          }
        } else {
          colX = this.width - 1;
          colY = 0;

          for (; colX > colY; colX--) {
            if (this.matrix[0][0].colour == 0) {
              rowX = this.height - 2;
              rowZ = this.height - 1;
            } else {
              rowX = this.height - 1;
              rowZ = this.height - 2;
            }

            for (; rowX > 0; rowX -= 2) {
              if (this.matrix[rowX][colX].colour > 1) {
                return [rowX, colX];
              }
            }

            for (; rowZ > 0; rowZ -= 2) {
              if (this.matrix[rowZ][colX].colour > 1) {
                return [rowZ, colX];
              }
            }
          }
        }

        break;

      case "row":
        colY = this.width;

        if (direction == 1) {
          rowX = 0;
          rowY = this.height;

          for (; rowX < rowY; rowX++) {
            for (colX = 0; colX < colY; colX++) {
              if (this.matrix[rowX][colX].colour > 1) {
                return [rowX, colX];
              }
            }
          }
        } else {
          rowX = this.height - 1;
          rowY = 0;

          for (; rowX > rowY; rowX--) {
            for (colX = this.width - 1; colX > 0; colX--) {
              if (this.matrix[rowX][colX].colour > 1) {
                return [rowX, colX];
              }
            }
          }
        }

        break;
    }

    return [false, false];
  };

  // Scale Functions
  this.addScale = function (row, column, colour) {
    if (colour === undefined) colour = activeColour;

    try {
      this.matrix[row].splice(column, 0, new Scale(colour));
    } catch (err) {
      console.log("Add Scale - That matrix position doesn't exist!");
    }
  };

  this.colourScale = function (y, x, colour, expand) {
    if (expand === undefined) expand = false;

    // Auto Expand Pattern
    if (expand === true) {
      var height = this.height;
      var width = this.width;

      if (colour > 1) {
        if (y == 0) {
          this.addRow(0);
          this.width = width;
          this.fillRow(0, 1);
          this.getSize();

          y += 1;
        } else if (y == height - 1) {
          this.addRow(height);
          this.fillRow(height, 1);
          this.getSize();
        }

        if (x == 0) {
          this.addColumn(1, 0);

          x += 1;
        } else if (x == width - 1 && this.matrix[y][0].colour != 0) {
          this.addColumn(1, width);
        }
      }
    }

    // Set Colour
    this.matrix[y][x].setColour(colour);
    this.getSize();
    createInterface();
    uiLayer.redrawCanvas();
  };

  this.getColour = function (y, x) {
    return this.matrix[y][x].colour;
  };

  this.removeScale = function (row, column) {
    try {
      this.matrix[row].splice(column, 1);
    } catch (err) {
      console.log("Remove Scale - That matrix position doesn't exist!");
    }
  };

  // Row Functions
  this.addRow = function (position) {
    if (position === undefined) position = -1;

    this.matrix.splice(position, 0, []);
  };

  this.fillRow = function (row, colour) {
    var x = 0;
    var y = this.width;
    var inset = false;

    if (this.matrix[row].length === 0) {
      // Create Scales
      for (x = 0; x < y; x++) {
        this.matrix[row].push(new Scale(colour));
      }
    } else {
      for (x = 0; x < y; x++) {
        this.matrix[row][x].colour = colour;
      }
    }

    // Inset Scale
    if (this.height > 0) {
      if (row == 0) {
        if (this.matrix[row + 1][0].colour != 0) {
          inset = true;
        }
      } else {
        if (this.matrix[row - 1][0].colour != 0) {
          inset = true;
        }
      }
    } else {
      inset = true;
    }

    if (inset === true) {
      this.matrix[row][0].colour = 0;
    }
  };

  this.removeRow = function (position) {
    try {
      this.matrix.splice(position, 1);
      this.getSize();
    } catch (err) {
      console.log("Remove Row - That matrix position doesn't exist!");
    }
  };

  // Column Functions
  this.addColumn = function (colour, position) {
    if (colour === undefined) colour = activeColour;
    if (position === undefined) position = -1;

    try {
      var x = 0;
      var y = this.matrix.length;

      for (x = 0; x < y; x++) {
        this.matrix[x].splice(position, 0, new Scale(colour));

        if (position == 0 && this.matrix[x][1].colour == 0) {
          this.matrix[x][0].colour = 0;
          this.matrix[x][1].colour = 1;
        }
      }

      this.getSize();
    } catch (err) {
      console.log("Add Column - That matrix position doesn't exist!");
    }
  };

  this.fillColumn = function (column, row, colour) {
    var inset = false;
    if (this.height > 0) {
      if (row == 0) {
        if (this.matrix[row + 1][0].colour != 0) {
          inset = true;
        }
      } else {
        if (this.matrix[row - 1][0].colour != 0) {
          inset = true;
        }
      }
    } else {
      inset = true;
    }
    var x = inset ? 0 : 1;
    var y = this.matrix.length;

    for (; x < y; x += 2) {
      this.matrix[x][column].colour = colour;
    }
  };

  this.removeColumn = function (position) {
    try {
      var y = this.matrix.length;

      for (x = 0; x < y; x++) {
        this.matrix[x].splice(position, 1);
      }

      this.getSize();
    } catch (err) {
      console.log("Remove Column - That matrix position doesn't exist!");
    }
  };

  // Fill Functions

  this.validPosition = function (y, x) {
    return (
      y >= 0 && y < this.matrix.length && x >= 0 && x < this.matrix[0].length
    );
  };

  this.validPositionC = function (y, x, colour) {
    if (this.validPosition(y, x)) {
      return this.getColour(y, x) === colour;
    }
    return false;
  };

  this.fill = function (y, x, colour) {
    let c = this.getColour(y, x);
    if (c === colour) return;

    this.matrix[y][x].colour = colour;

    //offset X : y % 2 == (this.matrix.length % 2)
    let inset = false;

    // Inset Scale
    if (this.height > 0) {
      if (y == 0) {
        if (this.matrix[y + 1][0].colour != 0) {
          inset = true;
        }
      } else {
        if (this.matrix[y - 1][0].colour != 0) {
          inset = true;
        }
      }
    } else {
      inset = true;
    }

    for (let y1 = -1; y1 < 2; y1 += 2) {
      for (let x1 = inset ? -1 : 0; x1 <= (inset ? 0 : 1); x1++) {
        console.log("y " + (y % 2) + " x " + (this.matrix.length % 2));
        if (this.validPositionC(y + y1, x + x1, c)) {
          this.fill(y + y1, x + x1, colour);
          // editorPattern.colourScale(y + y1, x + x1, colour, false);
          // swatches.generatePatternSwatch(editorPattern);
          // editorLayer.redrawCanvas();
          // backgroundLayer.redrawCanvas();
        }
      }
    }
  };

  this.replaceAll = function (c1, c2) {
    if (c1 === c2) return;
    let maxY = this.matrix.length;
    let maxX = this.matrix[0].length;
    for (var y = 0; y < maxY; y++) {
      for (var x = 0; x < maxX; x++) {
        if (this.getColour(y, x) === c1) {
          this.matrix[y][x].colour = c2;
          // editorPattern.colourScale(y, x, c2, false);
          // swatches.generatePatternSwatch(editorPattern);
          // editorLayer.redrawCanvas();
          // backgroundLayer.redrawCanvas();
        }
      }
    }
  };
}

function Scale(colour) {
  this.colour = colour;

  this.setColour = function (colour) {
    if (colour === undefined) colour = false;

    if (colour === false) {
      this.colour = activeColour;
    } else {
      this.colour = colour;
    }
  };
}

// Swatches
function TemplateSwatches() {
  this.gradientSwatches = [];
  this.textureSwatches = [];
  this.scaleSwatches = [];
  this.patternSwatch;

  this.shadowBlur = 3;
  this.shadowX = 0;
  this.shadowY = 3;
  this.shadowColour = "rgba(0, 0, 0, 0.25)";

  /* Swatch Functions */
  this.generateSwatches = function () {
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

  this.generateSwatch = function (id: string) {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d")!;
    var newSwatch = new Swatch(id, canvas, context);

    //document.body.appendChild(newSwatch.canvas);

    return newSwatch;
  };

  this.scaleSwatch = function (swt: Swatch, height: number, width: number) {
    swt.height = height;
    swt.width = width;

    swt.canvas.height = height;
    swt.canvas.width = width;

    swt.canvas.style.height = height + "px";
    swt.canvas.style.width = width + "px";
  };

  this.regenerateSwatches = function () {
    this.generateGradientSwatches();
    this.generateTextureSwatches();
    this.generateScaleSwatches();
    this.generatePatternSwatch(editorPattern);
  };

  /* Pattern Functions */
  this.generatePatternSwatch = function (pattern) {
    // Resize Canvas
    var height =
      (pattern.height - 1) * scaleSpacingY + this.scaleSwatches[0].height;
    var width = pattern.width * scaleSpacingX + scaleWidthPx;

    this.scaleSwatch(this.patternSwatch, height, width);

    // Draw scales
    var patternHeight = pattern.height;
    var patternWidth = pattern.width;

    var sHalf = 0;

    var x = 0;
    var y = 0;

    var limit = 0;

    if (drawEmpty === false) {
      limit = 1;
    }

    for (y = patternHeight - 1; y >= 0; y--) {
      if (pattern.matrix[y][0].colour == 0) {
        // Odd
        sHalf = 0;
      } else {
        // Even
        sHalf = scaleSpacingXHalf;
      }

      // Add Scale Entity
      for (x = 0; x < patternWidth; x++) {
        if (pattern.matrix[y][x].colour > limit) {
          this.patternSwatch.context.drawImage(
            this.scaleSwatches[pattern.matrix[y][x].colour].canvas,
            Math.round(sHalf + scaleSpacingX * x),
            Math.round(scaleSpacingY * y)
          );
        }
      }
    }
  };

  /* Scale Functions */
  this.generateScaleSwatches = function () {
    var x = 0;
    var y = palette.colours.length;

    for (x = 0; x < y; x++) {
      this.scaleSwatch(
        this.scaleSwatches[x],
        scaleHeightPx + this.shadowY + this.shadowBlur / 2,
        scaleWidthPx + this.shadowX + this.shadowBlur / 2
      );
      this.generateScaleSwatch(
        this.scaleSwatches[x],
        palette.colours[x].hex,
        palette.colours[x].a,
        palette.colours[x].brushed,
        palette.colours[x].shiny,
        palette.colours[x].plastic
      );
    }
  };

  this.generateScaleSwatch = function (
    swatch,
    hex,
    alpha,
    brushed,
    mirror,
    plastic
  ) {
    if (brushed === undefined) brushed = false;
    if (mirror === undefined) mirror = false;
    if (plastic === undefined) plastic = false;

    var v = 0;
    var z = 0;

    if (alpha <= 60) {
      drawScalePath(swatch.context, 0, 0);
      swatch.context.fillStyle = hex;
      swatch.context.fill("evenodd");
    } else {
      // Flat Colour
      swatch.context.shadowBlur = this.shadowBlur;
      swatch.context.shadowColor = this.shadowColour;
      swatch.context.shadowOffsetX = this.shadowX;
      swatch.context.shadowOffsetY = this.shadowY;

      drawScalePath(swatch.context, 0, 0);
      swatch.context.fillStyle = hex;
      swatch.context.fill("evenodd");
      shapeShadowReset(swatch.context);

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
          drawScalePath(swatch.context, 0, 0);
          swatch.context.fillStyle = this.textureSwatches[v].pattern;
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
        drawScalePath(swatch.context, 0, 0);
        swatch.context.fillStyle = this.gradientSwatches[z].gradient;
        swatch.context.fill("evenodd");
      }
    }
  };

  /* Texture Functions */
  this.generateTextureSwatches = function () {
    var x = 0;
    var y = 2;

    var tex = [0.1, 0.225];

    for (x = 0; x < y; x++) {
      this.scaleSwatch(this.textureSwatches[x], scaleHeightPx, scaleHeightPx);
      this.generateTextureSwatch(this.textureSwatches[x], tex[x]);
    }
  };

  this.generateTextureSwatch = function (swatch: Swatch, alphaMod: number) {
    swatch.context.globalAlpha = alphaMod;
    const img = imageAssets.getImage("textureBrushed");
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
  this.generateGradientSwatches = function () {
    var x = 0;
    var y = 2;

    var gra = [0, 30];

    for (x = 0; x < y; x++) {
      this.scaleSwatch(this.gradientSwatches[x], scaleHeightPx, scaleWidthPx);
      this.generateGradientSwatch(this.gradientSwatches[x], gra[x]);
    }
  };

  this.generateGradientSwatch = function (swatch: Swatch, rgbaMod: number) {
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

// General Functions ====================================================================================================
function addEvent(object, type, method) {
  object.addEventListener(type, method, false);
}

function calculateScale(
  destinationHeight: number,
  destinationWidth: number,
  sourceHeight: number,
  sourceWidth: number
) {
  var scale = 0;
  var sh = 0;
  var sw = 0;

  sh = destinationHeight / sourceHeight;
  sw = destinationWidth / sourceWidth;

  if (sh < sw) {
    scale = sh;
  } else {
    scale = sw;
  }

  return scale;
}

function changeCSS(selector, style, value) {
  var css = document.styleSheets[0].cssRules;

  var x = 0;
  var y = 0;

  for (x = 0; x < css.length; x++) {
    if (css[x].selectorText == selector) {
      css[x].style.setProperty(style, value);
      return true;
    }
  }

  console.log("Rule " + selector + " not found.");
  return false;
}

function distanceFromScale(
  fromX: number,
  fromY: number,
  toX: number,
  toY: number,
  offsetX: number,
  offsetY: number
) {
  var scaleCenterX = toX + offsetX + scaleWidthPxHalf;
  var scaleCenterY = toY + offsetY + scaleHeightPxHalf;

  var dx = fromX - scaleCenterX;
  var dy = fromY - scaleCenterY;

  var ry = scaleRadius - scaleOffsetR * 2;

  var dist = Math.abs(Math.sqrt(dx * dx * 2.25 + dy * dy));

  if (dist < ry) {
    return true;
  }
}

function setURL(id?: string, title?: string) {
  if (id) {
    id = "?id=" + id;
  } else {
    id = "https://scalemail.lairoftheraven.uk";
  }

  //window.history.pushState(browserHistory, title, id);
}

// Background Functions ===============================================================================================
function drawBackgroundDots(canvas, pattern, colour) {
  if (colour === undefined) colour = themeLibrary.themes[theme].dotColour;

  // Variables
  var context = canvas.context;

  var h = editorLayer.entities[0].imagesrc.height / 2;
  var w = editorLayer.entities[0].imagesrc.width / 2;
  var m = 0;
  var x = 0;
  var y = 0;

  var drawX = 0;
  var drawY = 0;

  var backgroundOriginX = 0;
  var backgroundOriginY = 0;

  var backgroundOffsetX = 0;
  var backgroundOffsetY = 0;

  var stepX = scaleSpacingX;
  var stepY = scaleSpacingY * 2;

  var dot = Math.floor(scaleRadius / 30);

  if (dot < 1) {
    dot = 1;
  }

  // Calculate Bottom Left Scale
  if (pattern.matrix[pattern.matrix.length - 1][0].colour == 0) {
    m = scaleSpacingXHalf;
  }

  backgroundOriginX = canvas.centerX - w - dot + scaleSpacingX + m;
  backgroundOriginY = canvas.centerY + h - dot * 1.5;

  // Calculate Pan Offset
  backgroundOriginX += canvas.offsetX;
  backgroundOriginY += canvas.offsetY;

  // Step Back to Edge
  for (x = 0; backgroundOriginX > 0; x++) {
    backgroundOriginX -= stepX;
  }

  for (y = 0; backgroundOriginY > 0; y++) {
    backgroundOriginY -= stepY;
  }

  // Draw Dots
  context.beginPath();
  for (y = 0; (y - 1) * stepY < canvas.height; y++) {
    for (x = 0; (x - 1) * stepX < canvas.width; x++) {
      drawX = Math.round(backgroundOriginX + stepX * x);
      drawY = Math.round(backgroundOriginY + stepY * y);
      context.rect(drawX, drawY, dot, dot);

      drawX += Math.round(scaleSpacingXHalf);
      drawY -= Math.round(scaleSpacingY);
      context.rect(drawX, drawY, dot, dot);
    }
  }

  context.closePath();

  context.fillStyle = colour;
  context.fill("nonzero");
}

// Camera Functions ===================================================================================================
function takePhoto() {
  // Variables
  var canvas = photoLayer.canvas;
  var context = photoLayer.context;

  var photo;
  var a;

  var tt = "Created using Lair of the Raven's Scalemail Inlay Designer";
  var it = "";

  var ch = 0;
  var cw = 0;

  // Configure Memory Canvas
  // Set Scale Radius
  drawEmpty = false;
  zoomReset();

  // Scale to Pattern Size
  ch = swatches.patternSwatch.canvas.height;
  cw = swatches.patternSwatch.canvas.width;
  photoLayer.scaleCanvas(ch + 100, cw + 50, false);

  // Fill Layer
  context.fillStyle = themeLibrary.themes[theme].backgroundColour;
  context.fillRect(0, 0, photoLayer.width, photoLayer.height);

  // Create Image
  // Draw Pattern
  context.drawImage(swatches.patternSwatch.canvas, 25, 25);

  if (loadedTitle.length > 0) {
    tt = loadedTitle + " by " + loadedAuthor;
    it = "?id=" + loadedID;
  }

  context.fillStyle = "rgba(255, 255, 255, 0.5)";

  context.beginPath();
  context.font = fontStyles[2];
  context.fillText(tt, 25, ch + 100 - 45);

  context.font = fontStyles[3];
  context.fillText(
    "https://scalemail.lairoftheraven.uk" + it,
    25,
    ch + 100 - 25
  );
  context.closePath();

  // To Image
  photo = canvas.toDataURL("image/png");

  // Download
  a = document.getElementById("photoAnchor");

  if (loadedTitle.length < 1) {
    a.download = "mypattern.png";
  } else {
    a.download = loadedTitle + ".png";
  }

  console.log(photo);

  a.href = photo;
  a.click();

  // Restore Original Canvas
  drawEmpty = true;
  zoomExtents(editorPattern);
}

// Image to Pattern Functions =========================================================================================
// Objects
function imageMatrix() {
  this.rows = [];

  this.clearData = function () {
    this.rows = [];
  };

  this.addRow = function () {
    this.rows.push(new imageRow());
  };

  this.addPixel = function (row, r, g, b, a, p) {
    this.rows[row].addPixel(r, g, b, a, p);
  };

  this.sampleRegion = function (xOrigin, yOrigin, xWidth, yHeight) {
    var x = 0;
    var y = 0;

    xWidth += xOrigin;
    yHeight += yOrigin;

    palette.clearCount();

    for (y = yOrigin; y < yHeight; y++) {
      for (x = xOrigin; x < xWidth; x++) {
        palette.addCount(this.rows[y].pixels[x].p);
      }
    }
  };
}

function imageRow() {
  this.pixels = [];

  this.addPixel = function (r, g, b, a, p) {
    this.pixels.push(new imagePixel(r, g, b, a, p));
  };
}

function imagePixel(r, g, b, a, p) {
  if (r === undefined) r = 0;
  if (g === undefined) g = 0;
  if (b === undefined) b = 0;
  if (a === undefined) a = 0;
  if (p === undefined) p = 0;

  this.r = r;
  this.g = g;
  this.b = b;
  this.a = a;
  this.p = p;
}

// Variables
var itpCanvas;
var itpContext;

var itpMemCanvas;
var itpMemContext;

var itpImage = false;
var imageWidth;
var imageHeight;
var itpImageData = new imageMatrix();

var itpStage = 0;
var itpProcessRow = 0;
var itpProcessData;

var sampleSpacingX = 0;
var sampleSpacingY = 0;
var sampleWidthArea = 0;
var sampleHeightArea = 0;

var itpPattern = new PatternMatrix();
var itpPatternWidth = 0;
var itpPatternHeight = 0;

// Initialisation
function itpSetCanvas() {
  itpCanvas = document.getElementById("oCanvas");
  itpContext = itpCanvas.getContext("2d");

  itpCanvasResize();
  addEvent(window, "resize", itpCanvasResize);

  itpContext.font = "20px Montserrat";
}

function itpCanvasResize(event) {
  var w = itpCanvas.parentElement.clientWidth;
  var h = itpCanvas.parentElement.clientHeight;
  itpCanvas.height = h;
  itpCanvas.width = w;

  itpCanvas.style.height = "100%";
  itpCanvas.style.width = "100%";

  itpCanvasRedraw();
}

function itpCanvasRedraw() {
  itpContext.setTransform(1, 0, 0, 1, 0, 0);
  itpContext.clearRect(0, 0, itpCanvas.width, itpCanvas.height);

  switch (itpStage) {
    case 1:
      itpPreviewImage();
      break;

    case 2:
      itpPreviewImage();
      itpProgressImage(0, 0, imageWidth, itpProcessRow);
      break;

    case 3:
      itpPreviewImage();
      itpPreviewPattern();
  }
}

function itpDisableButtons() {
  document.getElementById("o-Prev").disabled = true;
  document.getElementById("o-Next").disabled = true;
}

function itpEnableButtons() {
  document.getElementById("o-Prev").disabled = false;
  document.getElementById("o-Next").disabled = false;
}

/* Processing */
function itpImageSelect(source) {
  itpStage = 1;
  itpImage = new Image();

  // Set Image on Canvas
  itpImage.onload = function () {
    itpCanvasRedraw();
    URL.revokeObjectURL(itpImage.src);
  };

  // Get Image from File
  itpImage.src = URL.createObjectURL(source);
}

function itpImageProcess() {
  if (itpImage === false) {
    alert("Please select an image to process first.");
    return false;
  }

  itpStage = 2;

  // Disable Interface & Change Cursor
  itpDisableButtons();
  overlay.showLoading();

  // Get Image Details
  imageWidth = itpImage.width;
  imageHeight = itpImage.height;

  // Configure Memory Canvas
  itpMemCanvas = document.createElement("canvas");
  itpMemContext = itpMemCanvas.getContext("2d");

  itpMemContext.imageSmoothingEnabled = false;

  itpMemCanvas.height = imageHeight;
  itpMemCanvas.width = imageWidth;

  itpMemCanvas.style.height = "100%";
  itpMemCanvas.style.width = "100%";

  // Insert Image for Processing
  itpMemContext.drawImage(itpImage, 0, 0);
  itpProcessData = itpMemContext.getImageData(0, 0, imageWidth, imageHeight);

  itpImageData.clearData();
  itpProcessRow = 0;
  itpGetPixelRow();
}

function itpGetPixelRow() {
  var x = 0;
  var z = 0;
  var y = itpProcessRow;
  var l = y * imageWidth * 4;

  var r;
  var g;
  var b;
  var a;
  var p;

  // Process Row
  itpImageData.addRow();

  for (z = 0; x < imageWidth; z += 4) {
    r = itpProcessData["data"][z + l];
    g = itpProcessData["data"][z + l + 1];
    b = itpProcessData["data"][z + l + 2];
    a = itpProcessData["data"][z + l + 3];
    p = palette.matchRGBA(r, g, b, a);

    itpImageData.addPixel(y, r, g, b, a, p);

    x++;
  }

  // Update Progress
  itpProgressImage(0, itpProcessRow, imageWidth, 1);

  // Check for End
  if (itpProcessRow + 1 < imageHeight) {
    itpProcessRow++;
  } else {
    setOverlay("newImagePattern");
    itpStage = 3;

    itpSetCanvas();
    itpCanvasRedraw();
    return;
  }

  itpGetPixelRow();
}

function itpPreviewImage() {
  var scale = calculateScale(
    itpCanvas.height,
    itpCanvas.width,
    itpImage.height,
    itpImage.width
  );

  itpContext.scale(scale, scale);
  itpContext.drawImage(itpImage, 0, 0);
}

function itpProgressImage(x, y, xw, yh) {
  itpContext.fillStyle = "rgba(255, 255, 255, 0.5)";
  itpContext.fillRect(x, y, xw, yh);
}

function itpPreviewPattern() {
  // Get Pattern Width
  itpPatternWidth = document.getElementById("o-Width").value;

  var sampleWidth = imageWidth / itpPatternWidth;
  var sampleHeight = Math.round(sampleWidth * scaleRatioHigh);

  // Calculate Pattern Offset
  var sampleRadius = sampleWidth / 2;
  var sampleOffsetX = sampleRadius / 25;

  sampleSpacingX = sampleWidth;
  sampleSpacingY =
    (sampleHeight - (sampleHeight - sampleRadius / 2 - sampleOffsetX)) * 2;

  sampleWidthArea = imageWidth - sampleSpacingX + 1;
  sampleHeightArea = imageHeight - sampleSpacingY;

  // Style Canvas
  itpContext.strokeStyle = "rgba(200, 200, 200, 1)";
  itpContext.lineWidth = 2;

  // Draw Sample Areas
  var x = 0;
  var y = 0;
  var z = 0;
  var s = 0;

  for (y = 0; y < sampleHeightArea; y += sampleSpacingY) {
    if (z % 2) {
      s = 0;
    } else {
      s = sampleSpacingX / 2;
    }

    for (x = 0; x < sampleWidthArea - s; x += sampleSpacingX) {
      itpContext.strokeRect(x + s, y, sampleSpacingX, sampleSpacingY);
    }

    z++;
  }

  itpPatternHeight = z;
}

function itpGeneratePattern() {
  itpStage = 4;
  overlay.showLoading();

  // Variables
  var colour = 0;

  var x = 0;
  var y = 0;
  var z = 0;
  var s = 0;

  var scaleX = 0;
  var scaleY = 0;
  var scaleC = 0;

  // Disable Interface
  itpDisableButtons();

  // Create pattern using defined size
  newPattern(itpPattern, itpPatternWidth, itpPatternHeight, 0, 0);

  // Get dominant colour for each sample area
  for (y = 0; y < sampleHeightArea; y += sampleSpacingY) {
    // Even/Odd Row
    if (scaleY % 2) {
      s = 0;
    } else {
      s = sampleSpacingX / 2;
    }

    // Inset Scale
    if (scaleY % 2) {
      z = 0;
    } else {
      z = 1;
    }

    // Colour Pattern
    scaleX = 0;

    for (x = 0; x < sampleWidthArea - s; x += sampleSpacingX) {
      itpImageData.sampleRegion(
        Math.floor(x + s),
        Math.floor(y),
        Math.floor(sampleSpacingX),
        Math.floor(sampleSpacingY)
      );
      scaleC = palette.highestCount();
      itpPattern.colourScale(scaleY, scaleX + z, scaleC);

      scaleX++;
    }

    scaleY++;
  }

  // Apply Pattern
  itpSendToEditor();
}

function itpSendToEditor() {
  setURL();

  editorPattern.copyMatrix(itpPattern);
  zoomExtents(editorPattern);

  uiLayer.clearTooltip();
  createInterface();
  uiLayer.redrawCanvas();

  overlay.hideOverlay();
}

// Input Functions ====================================================================================================
function checkRestricted(string, extended) {
  var x = 0;
  var y = restrictedWords.length;

  string = string.toLowerCase();

  for (x = 0; x < y; x++) {
    if (string.includes(restrictedWords[x])) {
      console.log("Couldn't you use a nicer word than that?");
      return true;
    }
  }

  if (extended === true) {
    y = restrictedAuthors.length;

    for (x = 0; x < y; x++) {
      if (string.includes(restrictedAuthors[x])) {
        console.log("Couldn't you use a nicer word than that?");
        return true;
      }
    }
  }

  return false;
}

function checkCharacters(string) {
  string = string.toLowerCase();

  if (allowedCharacters.test(string) === false) {
    console.log("Invalid character used.");
    return true;
  }

  return false;
}

function checkRadio(radios) {
  var x = 0;
  var y = radios.length;

  for (x = 0; x < y; x++) {
    if (radios[x].checked) {
      return radios[x].value;
    }
  }
}

// Interaction Functions ==============================================================================================
// Window Resize
function scaleCanvases() {
  backgroundLayer.scaleCanvas();
  backgroundLayer.redrawCanvas();

  editorLayer.scaleCanvas();
  editorLayer.redrawCanvas();

  uiLayer.scaleCanvas();
  createInterface();
  uiLayer.redrawCanvas();
}

// Zooming Functions
function zoomCanvas(inOut) {
  if (inOut > 0) {
    // Zoom Out
    if (scaleRadius > 15) {
      scaleRadius -= 5;
    }
  } else {
    // Zoom In
    if (scaleRadius < 150) {
      scaleRadius += 5;
    }
  }

  updateScaleVariables(scaleRadius);
  swatches.regenerateSwatches();

  backgroundLayer.redrawCanvas();
  editorLayer.redrawCanvas();
}

function zoomCanvasMouse(event) {
  zoomCanvas(event.deltaY);
}

function zoomExtents(sourcePattern, targetCanvas) {
  if (targetCanvas === undefined) targetCanvas = false;

  var extWidth;
  var extHeight;
  var target;

  if (targetCanvas === false) {
    target = editorLayer.canvas;
  } else {
    target = targetCanvas;
  }

  extWidth = target.width / (sourcePattern.width * scaleSpacingX);
  extHeight =
    target.height /
    ((sourcePattern.height - 1) * scaleSpacingY + scaleHeightPx * 1.1);

  if (extWidth < extHeight) {
    scaleRadius *= extWidth;
  } else {
    scaleRadius *= extHeight;
  }

  if (targetCanvas === false) {
    backgroundLayer.panReset();
    editorLayer.panReset();

    zoomCanvas(1);
  } else {
    target.panReset();
  }
}

function zoomReset() {
  scaleRadius = 75;
  zoomCanvas(0);
}

// Mouse Functions ====================================================================================================
// Canvas Mouse Interactions
function mouseHandler(event) {
  var mouseX = event.pageX;
  var mouseY = event.pageY;

  var x = 0;
  var y = 0;

  var uiRedraw = false;
  var uiChange = false;

  if (panMouse === false && panKey === false) {
    // Check UI Elements
    y = uiLayer.entities.length;

    for (x = y - 1; x > -1; x--) {
      if (mouseInteraction(event, uiLayer.entities[x]) === true) {
        switch (event.type) {
          case "mousedown":
            mouseClickUI(uiLayer.entities[x].id);
            break;

          case "mousemove":
            //console.log(uiLayer.entities[x].id + " Resolved hover.");

            setCursor("Pointer");
            // Tooltip
            if (
              uiLayer.entities[x].tooltip === true &&
              uiLayer.entities[x].tooltipText != uiLayer.tooltipText
            ) {
              var flipTooltip = false;

              if (event.pageX > uiLayer.width / 2) {
                flipTooltip = true;
              }

              uiLayer.setTooltip(
                uiLayer.entities[x].originX + uiLayer.entities[x].width,
                uiLayer.entities[x].originY + uiLayer.entities[x].height / 2,
                uiLayer.entities[x].tooltipText,
                flipTooltip
              );
              uiRedraw = true;
            }

            // Expanding
            if (uiLayer.expanded !== false) {
              if (uiLayer.expanded.group != uiLayer.entities[x].object.group) {
                if (uiLayer.entities[x].object.expandable === true) {
                  uiLayer.expanded.expanded = false;
                  uiLayer.expanded = uiLayer.entities[x].object;
                  uiLayer.entities[x].object.expanded = true;
                  uiChange = true;
                } else {
                  uiLayer.expanded.expanded = false;
                  uiLayer.expanded = false;
                  uiChange = true;
                }
              }
            } else {
              if (uiLayer.entities[x].object.expandable === true) {
                uiLayer.expanded = uiLayer.entities[x].object;
                uiLayer.entities[x].object.expanded = true;
                uiChange = true;
              }
            }

            break;
        }

        if (uiChange === true) {
          createInterface();
          uiRedraw = true;
        }

        if (uiRedraw === true) {
          uiLayer.redrawCanvas();
        }

        return true;
      }
    }

    if (uiLayer.expanded !== false) {
      uiLayer.expanded.expanded = false;
      uiLayer.expanded = false;
      createInterface();
    }

    if (uiLayer.tooltip !== false) {
      uiLayer.clearTooltip();
      uiLayer.redrawCanvas();
    }

    // Check Editor Elements
    if (currentTool != "cameraPan") {
      var patternHeight = editorPattern.height;
      var patternWidth = editorPattern.width;
      var patternX = Math.round(
        editorLayer.centerX -
          editorLayer.entities[0].imagesrc.width / 2 +
          editorLayer.offsetX
      );
      var patternY = Math.round(
        editorLayer.centerY -
          editorLayer.entities[0].imagesrc.height / 2 +
          editorLayer.offsetY
      );

      var scaleX = 0;
      var scaleY = 0;
      var sHalf = 0;

      var windowEdgeL = 0 - scaleWidthPx;
      var windowEdgeR = window.innerWidth + scaleWidthPx;
      var windowEdgeT = 0 - scaleHeightPx;
      var windowEdgeB = window.innerWidth + scaleHeightPx;

      for (y = 0; y < patternHeight; y++) {
        for (x = 0; x < patternWidth; x++) {
          if (editorPattern.matrix[y][x].colour > 0) {
            // Even-Odd Spacing
            if (editorPattern.matrix[y][0].colour == 0) {
              // Odd
              sHalf = 0;
            } else {
              // Even
              sHalf = scaleSpacingXHalf;
            }

            // Test
            scaleX = Math.round(sHalf + scaleSpacingX * x);
            scaleY = Math.round(scaleSpacingY * y);

            //editorLayer.context.globalAlpha = 0.1;
            //editorLayer.context.fillRect(patternX + scaleX, patternY + scaleY, scaleWidthPx, scaleHeightPx);

            if (
              scaleX > windowEdgeL &&
              scaleX < windowEdgeR &&
              scaleY > windowEdgeT &&
              scaleY < windowEdgeB
            ) {
              if (
                distanceFromScale(
                  mouseX,
                  mouseY,
                  scaleX,
                  scaleY,
                  patternX,
                  patternY
                ) === true
              ) {
                // console.log(
                //   "y:" + y + " x: " + x + " resolved " + event.which + "."
                // );
                switch (event.type) {
                  case "mousedown":
                    //console.log(y, x + " Resolved click.");

                    mouseDownEditor(y, x, event.which);
                    break;
                  case "mouseup":
                    mouseUpEditor(y, x, event.which);
                    break;

                  case "mousemove":
                    mouseHoverEditor(y, x, event.which);
                    break;
                }

                return true;
              }
            }
          }
        }
      }
    }
  }

  // Mouse is on Background
  switch (event.type) {
    case "mousedown":
      setCursor("Grabbing");

      panCenterX = event.pageX;
      panCenterY = event.pageY;
      panMouse = true;

      break;

    case "mousemove":
      if (panMouse === true) {
        backgroundLayer.panCanvas(
          event.pageX - panCenterX,
          event.pageY - panCenterY
        );
        editorLayer.panCanvas(
          event.pageX - panCenterX,
          event.pageY - panCenterY
        );

        panCenterX = event.pageX;
        panCenterY = event.pageY;
      } else {
        setCursor("Grab");
      }

      break;

    case "mouseleave":
    case "mouseup":
      setCursor("Grab");
      panMouse = false;

      break;
  }

  return true;
}

function keyHandler(event) {
  switch (event.which) {
    case 32:
      if (event.type == "keydown") {
        if (panMouse === false) {
          setCursor("Grab");
        }

        panKey = true;
      } else {
        panKey = false;
      }
  }
}

function mouseInteraction(event, entity, offset) {
  if (offset === undefined) offset = false;

  var mouseX = event.pageX;
  var mouseY = event.pageY;

  var offsetX = 0;
  var offsetY = 0;

  if (entity.mouse !== true) {
    return false;
  }

  if (offset === true) {
    offsetX = panOffsetX;
    offsetY = panOffsetY;
  }

  switch (event.type) {
    case "click":
      if (entity.mouseClick !== true) {
        return false;
      }

      break;

    case "mousemove":
      if (entity.mouseHover !== true) {
        return false;
      }

      break;
  }

  switch (entity.shape) {
    case "image":
      if (
        mouseX + offsetX >= entity.originX &&
        mouseX + offsetX <= entity.originX + entity.width &&
        mouseY + offsetY >= entity.originY &&
        mouseY + offsetY <= entity.originY + entity.height
      ) {
        return true;
      }

      break;

    case "palette":
    case "rect":
      if (
        mouseX + offsetX >= entity.originX - entity.strokeWeight &&
        mouseX + offsetX <=
          entity.originX + entity.width + entity.strokeWeight &&
        mouseY + offsetY >= entity.originY - entity.strokeWeight &&
        mouseY + offsetY <= entity.originY + entity.height + entity.strokeWeight
      ) {
        return true;
      }

      break;
  }

  return false;
}

let clicked = false;

function mouseDownEditor(y, x, b) {
  if (b === 1) {
    clicked = true;
    switch (currentTool) {
      case "toolboxCursor":
      case "toolboxBrush":
        editorPattern.colourScale(y, x, activeColour, true);
        swatches.generatePatternSwatch(editorPattern);
        editorLayer.redrawCanvas();
        backgroundLayer.redrawCanvas();
        break;

      //case "toolboxColumnInsert":
      //case "toolboxColumnRemove":
      //case "toolboxColumnCopy":
      //case "toolboxColumnPaste":
      case "toolboxFillRow":
        editorPattern.fillRow(y, activeColour);
        swatches.generatePatternSwatch(editorPattern);
        editorLayer.redrawCanvas();
        backgroundLayer.redrawCanvas();
        break;
      case "toolboxFillColumn":
        editorPattern.fillColumn(x, y, activeColour);
        swatches.generatePatternSwatch(editorPattern);
        editorLayer.redrawCanvas();
        backgroundLayer.redrawCanvas();
        break;
      case "toolboxFillColour":
        editorPattern.fill(y, x, activeColour);
        editorPattern.colourScale(y, x, activeColour, false);
        swatches.generatePatternSwatch(editorPattern);
        editorLayer.redrawCanvas();
        backgroundLayer.redrawCanvas();
        break;
      //case "toolboxRowInsert":
      //case "toolboxRowRemove":
      //case "toolboxRowCopy":
      //case "toolboxRowPaste":
      case "toolboxReplace":
        editorPattern.replaceAll(editorPattern.getColour(y, x), activeColour);
        swatches.generatePatternSwatch(editorPattern);
        editorLayer.redrawCanvas();
        backgroundLayer.redrawCanvas();
        break;

      default:
        backgroundLayer.redrawCanvas();
        console.log(
          "Sorry, the " + currentTool + " hasn't been implemented yet."
        );
        break;
    }
  } else if (b === 2) {
    setActiveColour(editorPattern.getColour(y, x));
  }
}

function mouseUpEditor(y, x, b) {
  clicked = false;
}

function mouseHoverEditor(y, x, b) {
  if (b === 1) {
    switch (currentTool) {
      case "toolboxBrush":
        console.log(y, x, b);
        setCursor("Brush");
        if (clicked) {
          editorPattern.colourScale(y, x, activeColour, true);
          swatches.generatePatternSwatch(editorPattern);
          editorLayer.redrawCanvas();
          backgroundLayer.redrawCanvas();
        }
        break;

      case "toolboxColumnInsert":
      case "toolboxColumnRemove":
      case "toolboxColumnCopy":
      case "toolboxColumnPaste":
        setCursor("Column");
        break;

      case "toolboxFillRow":
      case "toolboxFillColumn":
      case "toolboxFillColour":
        setCursor("Fill");
        break;

      case "toolboxReplace":
        setCursor("Replace");
        break;

      case "toolboxRowInsert":
      case "toolboxRowRemove":
      case "toolboxRowCopy":
      case "toolboxRowPaste":
        setCursor("Row");
        break;

      default:
        setCursor("Pointer");
        break;
    }
  }
}

function mouseClickUI(id) {
  var x = 0;
  var y = palette.colours.length;

  for (x = 1; x < y; x++) {
    if (id == palette.colours[x].id) {
      setActiveColour(x);
      return true;
    }
  }

  switch (id) {
    // Camera Controls
    case "cameraCenter":
      backgroundLayer.panReset();
      editorLayer.panReset();
      break;

    case "cameraExtents":
      zoomExtents(editorPattern);
      break;

    case "cameraFlip":
      console.log("This tool has not been implemented.");
      break;

    case "cameraReset":
      backgroundLayer.panReset();
      editorLayer.panReset();

      zoomReset();
      break;

    case "cameraPhoto":
      takePhoto();
      break;

    case "cameraZoomIn":
      zoomCanvas(0);
      break;

    case "cameraZoomOut":
      zoomCanvas(1);
      break;

    // Toolbox Controls
    case "toolboxHelp":
      setOverlay("help");
      overlay.showOverlay();
      break;

    case "toolboxKickstarter":
      //setOverlay("kickstarter");
      //overlay.showOverlay();

      window.open(
        "https://www.kickstarter.com/projects/r3dmm/scalemail-wall-banners?ref=8rzc9b",
        "_blank"
      );
      break;

    case "toolboxNew":
      setOverlay("new");
      overlay.showOverlay();
      break;

    case "toolboxSettings":
      setOverlay("settings");
      overlay.showOverlay();
      break;

    case "cameraPan":
    case "toolboxBrush":
    case "toolboxCursor":
    case "toolboxColumnInsert":
    case "toolboxColumnRemove":
    case "toolboxColumnCopy":
    case "toolboxColumnPaste":
    case "toolboxFillRow":
    case "toolboxFillColumn":
    case "toolboxFillColour":
    case "toolboxReplace":
    case "toolboxRowInsert":
    case "toolboxRowRemove":
    case "toolboxRowCopy":
    case "toolboxRowPaste":
      currentTool = id;
      createInterface();
      uiLayer.redrawCanvas();
      break;

    // Default
    default:
      console.log("Unhandled ID: " + id);
      break;
  }
}

// Cursor Functions
function setCursor(cursor) {
  interactionLayer.className = "cursor" + cursor;
}

// Overlay Functions ==================================================================================================

function setOverlay(windowID: string) {
  const fragment = document.createDocumentFragment();

  var wDow = overlay.getScreen(windowID);
  var bar = wDow.bar;
  var pane = wDow.pane;

  // Output Contents
  const titleNode = document.createElement("h1");
  titleNode.textContent = wDow.title;

  fragment.append(titleNode);

  fragment.append(makeOverlayPane(bar, false));
  fragment.append(makeOverlayPane(pane, true));

  // Closing
  fragment.append(
    ...stringToElements(`
    <div class='overlayFooter fontSizeSmall'>
      <p class='fontSizeSmall floatLeft'>Scalemail Designer created by Anthony Edmonds - continued development by SelfMadeSystem</p>
      <img src='images/logoLotRSmall${themeLibrary.themes[theme].logoColour}.png' alt='Lair of the Raven' class='floatRight' />
    </div>`)
  );

  // Apply
  const overlayWindow = document.getElementById("overlayWindow")!;
  overlayWindow.innerHTML = "";
  overlayWindow.appendChild(fragment);
  overlay.hideLoading();

  // Pane Actions
  switch (windowID) {
    case "newImageSelect":
      itpStage = 0;
      itpSetCanvas();
      break;

    case "settings":
      if (rulerSize == "large") {
        (document.getElementById("toggleSize") as HTMLInputElement).checked =
          true;
      }

      if (drawEmpty === true) {
        (document.getElementById("toggleEmpty") as HTMLInputElement).checked =
          true;
      }

      if (theme == 0) {
        (document.getElementById("toggleTheme") as HTMLInputElement).checked =
          true;
      }

      if (rulerUnits == "metric") {
        (document.getElementById("toggleUnits") as HTMLInputElement).checked =
          true;
      }

      break;

    case "swapPalette":
      break;
  }

  if (uiLayer.tooltip === true) {
    uiLayer.tooltip = false;
    uiLayer.redrawCanvas();
  }
}

function buildOverlays() {
  // Variables
  var nWindow;
  var nObject: OverlayObject;

  // Create New
  nWindow = new OverlayScreen("new", "Create New Pattern");

  // Bar
  // New from Shape
  nObject = {
    type: "button",
    title: "New from Shape...",
    src: "buttonNew",
    click: () => {
      setOverlay("newShape");
      patternShape = 0;
    },
  };

  nWindow.addObjectToBar(nObject);

  // New from Image
  nObject = {
    type: "button",
    title: "New from Image...",
    src: "buttonImage",
    click: () => setOverlay("newImageSelect"),
  };

  nWindow.addObjectToBar(nObject);

  // Pane
  // Information
  nObject = {
    type: "text",
    title: "Scalemail Designer",
    string: [
      "Start a new inlay design based on either a default shape, or using a simple image.",
      "You will be able to configure your new design on the next page.",
    ],
  };

  nWindow.addObjectToPane(nObject);

  overlay.addScreen(nWindow);

  // New from Shape
  nWindow = new OverlayScreen("newShape", "New from Shape");

  // Bar
  // Select Shape
  // Title
  nObject = {
    type: "text",
    title: "Select Shape",
  };

  nWindow.addObjectToBar(nObject);

  // Wrapper (Open)
  nObject = {
    type: "inputWrapper",
    state: 1,
  };

  nWindow.addObjectToBar(nObject);

  // Radio Button (Square)
  nObject = {
    type: "inputRadio",
    id: "shapeSquare",
    checked: true,
    label: "Square",
    name: "shape",
    value: 0,
    src: "shapeSquare.png",
    alt: "Square",
  };

  nWindow.addObjectToBar(nObject);

  // Radio Button (Diamond)
  nObject = {
    type: "inputRadio",
    id: "shapeDiamond",
    checked: false,
    label: "Diamond",
    name: "shape",
    value: 1,
    src: "shapeDiamond.png",
    alt: "Diamond",
  };

  nWindow.addObjectToBar(nObject);

  // Wrapper (Close)
  nObject = {
    type: "inputWrapper",
  };

  nWindow.addObjectToBar(nObject);

  // Pattern Settings
  // Title
  nObject = {
    type: "text",
    title: "Pattern Settings",
  };

  nWindow.addObjectToBar(nObject);

  // Wrapper (Open)
  nObject = {
    type: "inputWrapper",
    state: 1,
  };

  nWindow.addObjectToBar(nObject);

  // Width
  nObject = {
    type: "inputNumber",
    id: "o-Width",
    increment: 1,
    label: "Width",
    value: 5,
  };

  nWindow.addObjectToBar(nObject);

  // Height
  nObject = {
    type: "inputNumber",
    id: "o-Height",
    increment: 1,
    label: "Height",
    value: 9,
  };

  nWindow.addObjectToBar(nObject);

  // Colours
  nObject = {
    type: "dropdown",
    id: "o-Colour",
    change: (e) => setActiveColour((e.target as HTMLSelectElement).value),
    data: palette.colours,
    label: "Colour",
  };

  nWindow.addObjectToBar(nObject);

  // Wrapper (Close)
  nObject = {
    type: "inputWrapper",
  };

  nWindow.addObjectToBar(nObject);

  // Wrapper (Open)
  nObject = {
    type: "inputWrapper",
    state: 1,
  };

  nWindow.addObjectToBar(nObject);

  // Previous Button
  nObject = {
    type: "inputButton",
    id: "o-Prev",
    label: "Previous",
    value: "Previous",
    click: () => setOverlay("new"),
  };

  nWindow.addObjectToBar(nObject);

  // Create Button
  nObject = {
    type: "inputButton",
    label: "Create Pattern",
    value: "Create Pattern",
    click: newFromShape,
  };

  nWindow.addObjectToBar(nObject);

  // Wrapper (Close)
  nObject = {
    type: "inputWrapper",
  };

  nWindow.addObjectToBar(nObject);

  // Pane
  // Information
  nObject = {
    type: "text",
    title: "How to Use",
    string: [
      "Use these options to generate a new scalemail pattern from a basic shape.",
      "Select the desired shape from the options provided, then set the height, width, and colour as desired.",
      "Note that some shapes, such as the diamond, require a fixed height/width ratio that will be calculated automatically.",
    ],
  };

  nWindow.addObjectToPane(nObject);

  overlay.addScreen(nWindow);

  // New from Image
  // Selection
  nWindow = new OverlayScreen("newImageSelect", "New from Image");

  // Bar
  // Title
  nObject = {
    type: "text",
    title: "Select Image",
  };

  nWindow.addObjectToBar(nObject);

  // Wrapper (Open)
  nObject = {
    type: "inputWrapper",
    state: 1,
  };

  nWindow.addObjectToBar(nObject);

  // File Select
  nObject = {
    type: "inputFile",
    id: "o-File",
    accepted: "image/*",
    change: (e) => {
      const files = (e.target as HTMLInputElement).files;

      if (!files) {
        return;
      }

      if (files.length === 0) {
        return;
      }

      itpImageSelect(files[0]);
    },
  };

  nWindow.addObjectToBar(nObject);

  // Wrapper (Close)
  nObject = {
    type: "inputWrapper",
  };

  nWindow.addObjectToBar(nObject);

  // Information
  nObject = {
    type: "text",
    title: "How to Use",
    string: [
      "The image should be a simple motif or design.",
      "Your image will be processed on your computer and will not be uploaded.",
      "You will be able to configure your pattern after processing.",
    ],
  };

  nWindow.addObjectToBar(nObject);

  // Wrapper (Open)
  nObject = {
    type: "inputWrapper",
    state: 1,
  };

  nWindow.addObjectToBar(nObject);

  // Previous Button
  nObject = {
    type: "inputButton",
    id: "o-Prev",
    label: "Previous",
    value: "Previous",
    click: () => setOverlay("new"),
  };

  nWindow.addObjectToBar(nObject);

  // Next Button
  nObject = {
    type: "inputButton",
    id: "o-Next",
    label: "Process",
    value: "Process",
    click: itpImageProcess,
  };

  nWindow.addObjectToBar(nObject);

  // Wrapper (Close)
  nObject = {
    type: "inputWrapper",
  };

  nWindow.addObjectToBar(nObject);

  // Pane
  // Canvas
  nObject = {
    type: "canvas",
    id: "oCanvas",
  };

  nWindow.addObjectToPane(nObject);

  overlay.addScreen(nWindow);

  // Pattern
  nWindow = new OverlayScreen("newImagePattern", "Configure Pattern");

  // Bar
  // Wrapper (Open)
  nObject = {
    type: "inputWrapper",
    state: 1,
  };

  nWindow.addObjectToBar(nObject);

  // Pattern Width
  nObject = {
    type: "inputNumber",
    id: "o-Width",
    label: "Width",
    value: 10,
    change: itpCanvasRedraw,
  };

  nWindow.addObjectToBar(nObject);

  // Wrapper (Close)
  nObject = {
    type: "inputWrapper",
  };

  nWindow.addObjectToBar(nObject);

  // Title
  nObject = {
    type: "text",
    title: "How to Use",
    string: [
      "Change the width of the pattern to increase scale density.",
      "Focus on the motif/design of your image. Perform minor adjustments using the editor.",
    ],
  };

  nWindow.addObjectToBar(nObject);

  // Wrapper (Open)
  nObject = {
    type: "inputWrapper",
    state: 1,
  };

  nWindow.addObjectToBar(nObject);

  // Previous Button
  nObject = {
    type: "inputButton",
    id: "o-Prev",
    label: "Previous",
    value: "Previous",
    click: () => setOverlay("newImageSelect"),
  };

  nWindow.addObjectToBar(nObject);

  // Next Button
  nObject = {
    type: "inputButton",
    id: "o-Next",
    label: "Build",
    value: "Build",
    click: itpGeneratePattern,
  };

  nWindow.addObjectToBar(nObject);

  // Wrapper (Close)
  nObject = {
    type: "inputWrapper",
  };

  nWindow.addObjectToBar(nObject);

  // Pane
  // Canvas
  nObject = {
    type: "canvas",
    id: "oCanvas",
  };

  nWindow.addObjectToPane(nObject);

  overlay.addScreen(nWindow);

  // Swap Colours
  nWindow = new OverlayScreen("swapPalette", "Swap Colours");

  // Bar

  // Pane
  // Canvas
  nObject = {
    type: "canvas",
    id: "oCanvas",
  };

  nWindow.addObjectToPane(nObject);

  overlay.addScreen(nWindow);

  // Settings
  nWindow = new OverlayScreen("settings", "Settings");

  // Bar
  nObject = {
    type: "text",
    string: [
      "Use these toggles to configure the inlay designer.",
      "Settings are not saved or preserved. Any changes from default will need to be set every time you start the designer.",
    ],
  };

  nWindow.addObjectToBar(nObject);

  // Pane
  // Scale Size
  nObject = {
    id: "toggleSize",
    type: "toggle",
    title: "Scale Size",
    string: ["Small", "Large"],
    change: toggleSize,
  };

  nWindow.addObjectToPane(nObject);

  // Show Empty Scales
  nObject = {
    id: "toggleEmpty",
    type: "toggle",
    title: "Empty Scales",
    string: ["Hide", "Show"],
    change: toggleEmpty,
  };

  nWindow.addObjectToPane(nObject);

  // Theme
  nObject = {
    id: "toggleTheme",
    type: "toggle",
    title: "Theme",
    string: ["Light", "Dark"],
    change: toggleTheme,
  };

  nWindow.addObjectToPane(nObject);

  // Units
  nObject = {
    id: "toggleUnits",
    type: "toggle",
    title: "Measurement Units",
    string: ["Imperial", "Metric"],
    change: toggleUnits,
  };

  nWindow.addObjectToPane(nObject);

  overlay.addScreen(nWindow);

  // Kickstarter
  nWindow = new OverlayScreen("kickstarter", "Kickstarter");

  // Bar

  // Pane

  overlay.addScreen(nWindow);

  // Help & About
  nWindow = new OverlayScreen("help", "Help & About");

  // Bar
  // About
  nObject = {
    type: "text",
    title: "About",
    string: [
      "Use this tool to create scalemail inlays and patterns, share your designs with the world, and browse the community submissions.",
      "This tool may be used for any purpose.",
    ],
  };

  nWindow.addObjectToBar(nObject);

  // Legal
  nObject = {
    type: "text",
    title: "Legal",
    string: [
      "Colours, sizes, weights, dimensions, and shapes are all estimates or visual representations and may not accurately reflect the actual physical properties or dimensions of that which they represent.",
      "All patterns stored on our server are held anonymously. Your IP address and other computer identifying information is not stored.",
      "All patterns created using this tool belong to the author. Lair of the Raven infers no copyright or other claim on user submitted patterns.",
      "If you believe a pattern is in violation of your rights, please contact Lair of the Raven for removal.",
    ],
  };

  nWindow.addObjectToBar(nObject);

  // Links
  // Title
  nObject = {
    type: "text",
    title: "Links",
  };

  nWindow.addObjectToBar(nObject);

  // Lair of the Raven
  nObject = {
    type: "anchor",
    string: "Lair of the Raven",
    url: "http://lairoftheraven.uk",
  };

  nWindow.addObjectToBar(nObject);

  // Contact
  // Title
  nObject = {
    type: "text",
    title: "Contact",
  };

  nWindow.addObjectToBar(nObject);

  // E-Mail
  nObject = {
    type: "anchor",
    string: "E-Mail",
    url: "mailto:contact@lairoftheraven.uk",
  };

  nWindow.addObjectToBar(nObject);

  // Facebook
  nObject = {
    type: "anchor",
    string: "Facebook",
    url: "https://www.facebook.com/lairoftheraven/",
  };

  nWindow.addObjectToBar(nObject);

  // Reddit
  nObject = {
    type: "anchor",
    string: "Reddit",
    url: "https://www.reddit.com/r/lairoftheraven/",
  };

  nWindow.addObjectToBar(nObject);

  // Twitter
  nObject = {
    type: "anchor",
    string: "@LairoftheRaven",
    url: "https://twitter.com/LairoftheRaven",
  };

  nWindow.addObjectToBar(nObject);

  // Pane
  // Tutorial Video
  // Title
  nObject = {
    type: "text",
    title: "Tutorial Playlist",
    string: [
      "Need help using the inlay designer? Check out our video tutorial series on YouTube for a detailed breakdown!",
    ],
  };

  nWindow.addObjectToPane(nObject);

  // Introduction Video
  nObject = {
    type: "brick",
    title: "Introduction",
    url: "https://www.youtube.com/watch?v=wyye0o6paNE&list=PLu9KjnY1dxRbLRRMHNmAhpH1hNYDMyQ2z&index=1&t=3s",
    src: "tutorialIntroThumb.jpg",
  };

  nWindow.addObjectToPane(nObject);

  // Interface Video
  nObject = {
    type: "brick",
    title: "User Interface Overview",
    url: "https://www.youtube.com/watch?v=7EZebcOiM9Q&list=PLu9KjnY1dxRbLRRMHNmAhpH1hNYDMyQ2z&index=2",
    src: "tutorialIntroThumb.jpg",
  };

  nWindow.addObjectToPane(nObject);

  // Creating Video
  nObject = {
    type: "brick",
    title: "Creating a New Pattern",
    url: "https://www.youtube.com/watch?v=gTldguZj_yE&list=PLu9KjnY1dxRbLRRMHNmAhpH1hNYDMyQ2z&index=3",
    src: "tutorialCreateThumb.jpg",
  };

  nWindow.addObjectToPane(nObject);

  // Gallery Video
  nObject = {
    type: "brick",
    title: "Saving, Loading, and Sharing",
    url: "https://www.youtube.com/watch?v=-raNeXvR2Fc&list=PLu9KjnY1dxRbLRRMHNmAhpH1hNYDMyQ2z&index=4",
    src: "tutorialGalleryThumb.jpg",
  };

  nWindow.addObjectToPane(nObject);

  // Future Video
  nObject = {
    type: "brick",
    title: "Future Development",
    url: "https://www.youtube.com/watch?v=PA1ckRVSgnE&list=PLu9KjnY1dxRbLRRMHNmAhpH1hNYDMyQ2z&index=5",
    src: "tutorialIntroThumb.jpg",
  };

  nWindow.addObjectToPane(nObject);

  overlay.addScreen(nWindow);

  // Compatability Error
  nWindow = new OverlayScreen("compError", "Compatability Issue");

  // Bar

  // Pane
  nObject = {
    type: "text",
    title:
      "Looks like the browser you are using doesn't support the latest web technologies.",
    string: [
      "The Scalemail Inlay Designer requires the latest web standards, especially Canvas modes and functions.",
      "As the browser you are using doesn't support these features, I advise that you install the latest version of a web-standards compliant browser such as Firefox, Chrome, or Edge.",
      "You can continue to use the designer, but be aware that certain things may not work properly, or display incorrectly.",
    ],
  };

  nWindow.addObjectToPane(nObject);

  overlay.addScreen(nWindow);
}

// Palette Functions ==================================================================================================
function buildPalette() {
  // Void
  nEnt = new PaletteColour();

  nEnt.id = "vod";
  nEnt.name = "Void";

  nEnt.r = -255;
  nEnt.g = -255;
  nEnt.b = -255;
  nEnt.a = -255;
  nEnt.hex = "rgba(0, 0, 0, 0)";

  nEnt.brushed = false;
  nEnt.plastic = false;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Empty
  nEnt = new PaletteColour();

  nEnt.id = "non";
  nEnt.name = "Empty";

  nEnt.r = 0;
  nEnt.g = 0;
  nEnt.b = 0;
  nEnt.a = -255;
  nEnt.hex = "rgba(0, 0, 0, 0.25)";

  nEnt.brushed = false;
  nEnt.plastic = false;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Aluminium (Brushed)
  nEnt = new PaletteColour();

  nEnt.id = "alm";
  nEnt.name = "Aluminium (Brushed)";

  nEnt.r = 195;
  nEnt.g = 195;
  nEnt.b = 197;
  nEnt.a = 255;
  nEnt.hex = "rgba(195, 195, 197, 1)";

  nEnt.brushed = true;
  nEnt.plastic = false;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Aluminium (Mirror)
  nEnt = new PaletteColour();

  nEnt.id = "als";
  nEnt.name = "Aluminium (Mirror)";

  nEnt.r = 228;
  nEnt.g = 228;
  nEnt.b = 224;
  nEnt.a = 255;
  nEnt.hex = "rgba(228, 228, 224, 1)";

  nEnt.brushed = false;
  nEnt.plastic = false;
  nEnt.shiny = true;

  palette.addColour(nEnt);

  // Black
  nEnt = new PaletteColour();

  nEnt.id = "blk";
  nEnt.name = "Black";

  nEnt.r = 32;
  nEnt.g = 36;
  nEnt.b = 39;
  nEnt.a = 255;
  nEnt.hex = "rgba(32, 36, 39, 1)";

  nEnt.brushed = false;
  nEnt.plastic = false;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Blue
  nEnt = new PaletteColour();

  nEnt.id = "Blu";
  nEnt.name = "Blue";

  nEnt.r = 17;
  nEnt.g = 76;
  nEnt.b = 173;
  nEnt.a = 255;
  nEnt.hex = "rgba(17, 76, 173, 1)";

  nEnt.brushed = false;
  nEnt.plastic = false;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Bronze
  nEnt = new PaletteColour();

  nEnt.id = "brz";
  nEnt.name = "Bronze";

  nEnt.r = 133;
  nEnt.g = 108;
  nEnt.b = 46;
  nEnt.a = 255;
  nEnt.hex = "rgba(133, 108, 46, 1)";

  nEnt.brushed = false;
  nEnt.plastic = false;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Champagne
  nEnt = new PaletteColour();

  nEnt.id = "cpg";
  nEnt.name = "Champange";

  nEnt.r = 150;
  nEnt.g = 150;
  nEnt.b = 126;
  nEnt.a = 255;
  nEnt.hex = "rgba(150, 150, 126, 1)";

  nEnt.brushed = false;
  nEnt.plastic = false;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Copper (Shiny)
  nEnt = new PaletteColour();

  nEnt.id = "cpr";
  nEnt.name = "Copper (Shiny)";

  nEnt.r = 138;
  nEnt.g = 99;
  nEnt.b = 66;
  nEnt.a = 255;
  nEnt.hex = "rgba(138, 99, 66, 1)";

  nEnt.brushed = false;
  nEnt.plastic = false;
  nEnt.shiny = true;

  palette.addColour(nEnt);

  // Frost
  nEnt = new PaletteColour();

  nEnt.id = "fst";
  nEnt.name = "Frost";

  nEnt.r = 224;
  nEnt.g = 225;
  nEnt.b = 223;
  nEnt.a = 255;
  nEnt.hex = "rgba(224, 225, 223, 1)";

  nEnt.brushed = false;
  nEnt.plastic = false;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Gold (Brushed)
  nEnt = new PaletteColour();

  nEnt.id = "gld";
  nEnt.name = "Gold (Brushed)";

  nEnt.r = 170;
  nEnt.g = 166;
  nEnt.b = 124;
  nEnt.a = 255;
  nEnt.hex = "rgba(170, 166, 124, 1)";

  nEnt.brushed = true;
  nEnt.plastic = false;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Gold (Mirror)
  nEnt = new PaletteColour();

  nEnt.id = "glm";
  nEnt.name = "Gold (Mirror)";

  nEnt.r = 207;
  nEnt.g = 193;
  nEnt.b = 146;
  nEnt.a = 255;
  nEnt.hex = "rgba(207, 193, 146, 1)";

  nEnt.brushed = false;
  nEnt.plastic = false;
  nEnt.shiny = true;

  palette.addColour(nEnt);

  // Green
  nEnt = new PaletteColour();

  nEnt.id = "grn";
  nEnt.name = "Green";

  nEnt.r = 24;
  nEnt.g = 79;
  nEnt.b = 47;
  nEnt.a = 255;
  nEnt.hex = "rgba(24, 79, 47, 1)";

  nEnt.brushed = false;
  nEnt.plastic = false;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Orange
  nEnt = new PaletteColour();

  nEnt.id = "org";
  nEnt.name = "Orange";

  nEnt.r = 210;
  nEnt.g = 100;
  nEnt.b = 32;
  nEnt.a = 255;
  nEnt.hex = "rgba(210, 100, 32, 1)";

  nEnt.brushed = false;
  nEnt.plastic = false;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Pink
  nEnt = new PaletteColour();

  nEnt.id = "pnk";
  nEnt.name = "Pink";

  nEnt.r = 183;
  nEnt.g = 51;
  nEnt.b = 134;
  nEnt.a = 255;
  nEnt.hex = "rgba(183, 51, 134, 1)";

  nEnt.brushed = false;
  nEnt.plastic = false;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Purple
  nEnt = new PaletteColour();

  nEnt.id = "ppl";
  nEnt.name = "Purple";

  nEnt.r = 70;
  nEnt.g = 54;
  nEnt.b = 191;
  nEnt.a = 255;
  nEnt.hex = "rgba(70, 54, 191, 1)";

  nEnt.brushed = false;
  nEnt.plastic = false;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Red
  nEnt = new PaletteColour();

  nEnt.id = "red";
  nEnt.name = "Red";

  nEnt.r = 146;
  nEnt.g = 29;
  nEnt.b = 19;
  nEnt.a = 255;
  nEnt.hex = "rgba(146, 29, 19, 1)";

  nEnt.brushed = false;
  nEnt.plastic = false;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Clear (Plastic)
  nEnt = new PaletteColour();

  nEnt.id = "clr";
  nEnt.name = "Clear (Plastic)";

  nEnt.r = 255;
  nEnt.g = 255;
  nEnt.b = 255;
  nEnt.a = 60;
  nEnt.hex = "rgba(255, 255, 255, 0.25)";

  nEnt.brushed = false;
  nEnt.plastic = true;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Black (Plastic)
  nEnt = new PaletteColour();

  nEnt.id = "blp";
  nEnt.name = "Black (Plastic)";

  nEnt.r = 43;
  nEnt.g = 44;
  nEnt.b = 39;
  nEnt.a = 255;
  nEnt.hex = "rgba(43, 44, 39, 1)";

  nEnt.brushed = false;
  nEnt.plastic = true;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Glow in the Dark
  nEnt = new PaletteColour();

  nEnt.id = "gtd";
  nEnt.name = "Glow in the Dark (Plastic)";

  nEnt.r = 69;
  nEnt.g = 179;
  nEnt.b = 112;
  nEnt.a = 255;
  nEnt.hex = "rgba(69, 179, 112, 1)";

  nEnt.brushed = false;
  nEnt.plastic = true;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  //Meads custom stuff IDs for mead are 4 chars

  // Light purple
  nEnt = new PaletteColour();

  nEnt.id = "lprp";
  nEnt.name = "Light purple";

  nEnt.r = 175;
  nEnt.g = 131;
  nEnt.b = 208;
  nEnt.a = 255;
  nEnt.hex = "rgba(175, 131, 208, 1)";

  nEnt.brushed = false;
  nEnt.plastic = true;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Sky blue
  nEnt = new PaletteColour();

  nEnt.id = "skbl";
  nEnt.name = "Sky blue";

  nEnt.r = 124;
  nEnt.g = 202;
  nEnt.b = 212;
  nEnt.a = 255;
  nEnt.hex = "rgba(124, 202, 212, 1)";

  nEnt.brushed = false;
  nEnt.plastic = true;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Lime
  nEnt = new PaletteColour();

  nEnt.id = "lime";
  nEnt.name = "Lime";

  nEnt.r = 158;
  nEnt.g = 207;
  nEnt.b = 90;
  nEnt.a = 255;
  nEnt.hex = "rgba(158, 207, 90, 1)";

  nEnt.brushed = false;
  nEnt.plastic = true;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Gold
  nEnt = new PaletteColour();

  nEnt.id = "gold";
  nEnt.name = "Gold (more yellow but ok)";

  nEnt.r = 255;
  nEnt.g = 255;
  nEnt.b = 0;
  nEnt.a = 255;
  nEnt.hex = "rgba(255, 255, 0, 1)";

  nEnt.brushed = false;
  nEnt.plastic = true;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Transparent red
  nEnt = new PaletteColour();

  nEnt.id = "tred";
  nEnt.name = "Transparent red";

  nEnt.r = 255;
  nEnt.g = 0;
  nEnt.b = 0;
  nEnt.a = 255 * 0.1;
  nEnt.hex = "rgba(255, 0, 0, 0.3)";

  nEnt.brushed = false;
  nEnt.plastic = true;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Transparent blue
  nEnt = new PaletteColour();

  nEnt.id = "tblu";
  nEnt.name = "Transparent blue";

  nEnt.r = 0;
  nEnt.g = 0;
  nEnt.b = 255;
  nEnt.a = 255 * 0.1;
  nEnt.hex = "rgba(0, 0, 255, 0.3)";

  nEnt.brushed = false;
  nEnt.plastic = true;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Transparent green
  nEnt = new PaletteColour();

  nEnt.id = "tgrn";
  nEnt.name = "Transparent green";

  nEnt.r = 0;
  nEnt.g = 255;
  nEnt.b = 0;
  nEnt.a = 255 * 0.1;
  nEnt.hex = "rgba(0, 255, 0, 0.3)";

  nEnt.brushed = false;
  nEnt.plastic = true;
  nEnt.shiny = false;

  palette.addColour(nEnt);

  // Transparent yellow
  nEnt = new PaletteColour();

  nEnt.id = "tylw";
  nEnt.name = "Transparent yellow";

  nEnt.r = 255;
  nEnt.g = 255;
  nEnt.b = 0;
  nEnt.a = 255 * 0.1;
  nEnt.hex = "rgba(255, 255, 0, 0.3)";

  nEnt.brushed = false;
  nEnt.plastic = true;
  nEnt.shiny = false;

  palette.addColour(nEnt);
}

function setActiveColour(colour) {
  activeColour = colour;
  createInterface();
  uiLayer.redrawCanvas();
}

// Pattern Functions ==================================================================================================
function newPattern(target, width, height, patternShape, colour) {
  if (width === undefined) width = 5;
  if (height === undefined) height = 9;
  if (patternShape === undefined) patternShape = 0;
  if (colour === undefined) colour = activeColour;

  var x = 0;
  var height;
  var width;

  target.clearMatrix();

  // Resize Matrix for Diamond Pattern
  if (patternShape == 1) {
    if (width < height) {
      height = width * 2 - 1;
    } else {
      if (height % 2 == 0) {
        height++;
      }

      width = height / 2 + 0.5;
    }
  }

  // Generate Blank Matrix
  for (x = 0; x < height; x++) {
    target.addRow();
  }

  for (x = 0; x < width; x++) {
    target.addColumn(1);
  }

  target.getSize();

  // Generate Shape
  switch (patternShape) {
    case 1:
      patternShapeDiamond(target, colour);
      break;

    default:
      patternShapeSquare(target, colour);
      break;
  }
}

function newFromShape() {
  var width = document.getElementById("o-Width").value;
  var height = document.getElementById("o-Height").value;
  var shape = document.getElementsByName("shape");

  shape = parseInt(checkRadio(shape));

  editorPattern.clearMatrix();
  newPattern(editorPattern, width, height, shape);
  setURL();
  zoomExtents(editorPattern);
  createInterface();
  uiLayer.redrawCanvas();
  overlay.hideOverlay();
  swatches.generatePatternSwatch(editorPattern);
  editorLayer.redrawCanvas();
  backgroundLayer.redrawCanvas();
}

function patternShapeSquare(target, colour) {
  if (colour === undefined) colour = activeColour;

  var height = target.height;
  var width = target.width;

  var x = 0;
  var y = 0;

  for (y = 0; y < height; y++) {
    // Set Inset Scale

    if (y % 2 == 1) {
      target.matrix[y][0].colour = 0;
    } else {
      target.matrix[y][0].colour = colour;
    }

    // Set Square
    for (x = 1; x < width; x++) {
      target.matrix[y][x].colour = colour;
    }
  }

  target.getSize();
}

function patternShapeDiamond(target, colour) {
  if (colour === undefined) colour = activeColour;

  var height = target.height;
  var width = target.width;
  var breakHeight = 0;
  var breakWidth = 0;

  var x = 0;
  var y = 0;
  var z = 0;
  var s = 0;

  breakHeight = Math.floor(height / 2);
  breakWidth = Math.floor(width / 2);

  for (y = 0; y < height; y++) {
    // Set Inset Scale
    if (width % 2 == 0) {
      // Even Set Inset Scale
      if (y % 2 == 0) {
        target.matrix[y][0].colour = 0;
      }

      // Scale Offset
      if (y % 2 == 0) {
        if (y > breakHeight) {
          s--;
        }
      } else {
        if (y <= breakHeight) {
          s++;
        }
      }
    } else {
      // Odd Set Inset Scale
      if (y % 2 == 1) {
        target.matrix[y][0].colour = 0;
      }

      // Scale Offset
      if (y % 2 == 1) {
        if (y > breakHeight) {
          s--;
        }
      } else {
        if (y <= breakHeight && y > 0) {
          s++;
        }
      }
    }

    // Determine Scale Count
    if (y <= breakHeight) {
      z++;
    } else {
      z--;
    }

    // Set Diamond
    for (x = 0; x < z; x++) {
      target.matrix[y][breakWidth - s + x].colour = colour;
    }
  }

  target.getSize();
}

// Scale Functions ====================================================================================================
function calculateIntersection(x0, y0, r0, x1, y1, r1) {
  var a, dx, dy, d, h, rx, ry;
  var x2, y2;

  dx = x1 - x0;
  dy = y1 - y0;
  d = Math.sqrt(dy * dy + dx * dx);
  a = (r0 * r0 - r1 * r1 + d * d) / (2.0 * d);
  x2 = x0 + (dx * a) / d;
  y2 = y0 + (dy * a) / d;
  h = Math.sqrt(r0 * r0 - a * a);
  rx = -dy * (h / d);
  ry = dx * (h / d);

  /* Intersection Points */
  var xi = x2 + rx;
  var xi_prime = x2 - rx;
  var yi = y2 + ry;
  var yi_prime = y2 - ry;

  return [xi, xi_prime, yi, yi_prime];
}

// Server Functions =====================================================================================================
function sendRequest(target, request, responseFunction) {
  var ajaxRequest = new XMLHttpRequest();

  ajaxRequest.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      responseFunction(this.responseText);
    } else if (this.status > 399) {
      console.log("Unable to reach the server.");
    }
  };

  ajaxRequest.open(
    "POST",
    "https://scalemail.lairoftheraven.uk/parts/" + target + ".php",
    true
  );
  ajaxRequest.setRequestHeader(
    "Content-type",
    "application/x-www-form-urlencoded"
  );
  ajaxRequest.send(request);
}

function updateScaleVariables(radius) {
  if (radius === undefined) radius = 75;

  // Scale Base
  scaleRadius = radius;

  scaleInnerHoleOffset = radius / 2;
  scaleInnerHoleRadius = radius / 4;

  // Offsets
  scaleOffsetX = scaleRadius / 25;
  scaleOffsetY = 0.8879189152169245 * radius;
  scaleOffsetR = scaleRadius - scaleOffsetY;

  scaleOffsetXDouble = scaleOffsetX * 2;
  scaleOffsetXHalf = scaleOffsetX / 2;

  // Height & Width in PX
  scaleHeightPx = scaleOffsetY * 2;
  scaleHeightPxHalf = scaleHeightPx / 2;
  scaleHeightPxQuarter = scaleHeightPx / 4;

  scaleWidthPx = scaleRadius + scaleOffsetX * 2;
  scaleWidthPxHalf = scaleWidthPx / 2;

  // Spacing in PX
  scaleSpacingX = scaleWidthPx + scaleOffsetX;
  scaleSpacingY =
    scaleHeightPx - (scaleHeightPx - scaleRadius / 2 - scaleOffsetX);

  scaleSpacingXHalf = scaleSpacingX / 2;
}

// Shape Functions ====================================================================================================
function drawImg(
  context: CanvasRenderingContext2D,
  entity: Entity,
  offsetX: number,
  offsetY: number
) {
  context.beginPath();

  if (entity.imageClipX !== false) {
    context.drawImage(
      imageAssets.getImage(entity.imagesrc),
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
      imageAssets.getImage(entity.imagesrc),
      entity.originX + offsetX,
      entity.originY + offsetY
    );
  }

  context.closePath();
}

function drawPalette(
  context: CanvasRenderingContext2D,
  entity: Entity,
  offsetX: number,
  offsetY: number
) {
  // Colour
  drawRect(context, entity, offsetX, offsetY);
  context.fillStyle = entity.fillColour;
  context.fill();

  // Brush
  if (entity.fillPalette.brushed === true) {
    drawRect(context, entity, offsetX, offsetY);
    context.globalCompositeOperation = "overlay";
    context.fillStyle = swatches.textureSwatches[1].pattern;
    context.fill();
    context.globalCompositeOperation = "source-over";
  }
}

function drawRect(context, entity, offsetX, offsetY) {
  context.beginPath();
  context.rect(
    entity.originX + offsetX,
    entity.originY + offsetY,
    entity.width,
    entity.height
  );
  context.closePath();

  if (entity.stroke === true) {
    shapeStroke(context, entity.strokeColour, entity.strokeWeight);
  }

  if (entity.fill === true) {
    shapeFill(context, entity.fillColour, entity.fillOrder);
  }
}

function drawScale(context, entity, offsetX, offsetY) {
  context.drawImage(
    swatches.scaleSwatches[entity.fillPalette].canvas,
    entity.originX + offsetX,
    entity.originY + offsetY
  );
}

function drawScalePath(context, originX, originY) {
  originX += scaleOffsetXDouble;
  originY += scaleOffsetY;

  // Build Outer Scale
  context.beginPath();
  context.arc(originX, originY, scaleRadius, 5.19, 1.08);
  context.arc(
    originX + scaleRadius - scaleOffsetXDouble,
    originY,
    scaleRadius,
    2.05,
    4.23
  );
  context.closePath();

  // Cutout Hole
  context.arc(
    originX + scaleInnerHoleOffset - scaleOffsetX,
    originY - scaleInnerHoleOffset - scaleOffsetX,
    scaleInnerHoleRadius - scaleOffsetXHalf,
    0,
    2 * Math.PI
  );
  context.closePath();
}

function drawText(context, x, y, align, type, string) {
  var textWidth = 0;
  var posX = x;

  context.font = fontStyles[type];
  context.fillStyle = themeLibrary.themes[theme].fontColour;

  if (align == "right") {
    textWidth = context.measureText(string).width;
    posX -= textWidth;
  }

  context.beginPath();
  context.fillText(string, posX, y);
  context.closePath();
}

function drawTooltip(target, originX, originY, tipText, tipFlip) {
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
  shapeShadow(target, shadowOff, shadow);

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

  shapeFill(target, "rgba(60, 114, 92, 0.75)");
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

function shapeShadow(
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

function shapeShadowReset(target) {
  target.shadowBlur = 0;
  target.shadowColor = "rgba(0,0,0,0.3)";
  target.shadowOffsetX = 0;
  target.shadowOffsetY = 0;
}

function shapeStroke(target, colour, weight) {
  if (weight === undefined) weight = 2;

  target.strokeStyle = colour;
  target.lineWidth = weight;
  target.stroke();
}

function shapeFill(target, colour, order) {
  if (order === undefined) order = "nonzero";

  target.fillStyle = colour;
  target.fill(order);

  shapeShadowReset(target);
}

// Startup Functions ==================================================================================================
function setupElements() {
  // Background
  backgroundLayer.id = "canvasBackground";
  backgroundLayer.setupCanvas();

  // Editor
  editorLayer.id = "canvasEditor";
  editorLayer.setupCanvas();

  // UI
  uiLayer.id = "canvasUI";
  uiLayer.setupCanvas();

  // Gallery
  saveLayer.id = "saveLayer";
  saveLayer.setupMemory();
  saveLayer.scaleCanvas(250, 250, false);

  // Photo
  photoLayer.id = "photoLayer";
  photoLayer.setupMemory();
  photoLayer.scaleCanvas(250, 250, false);

  // Overlay
  splashText = document.getElementById("splashText");
}

function startDesigner() {
  // Configure Scales
  splashText.innerHTML = "Calculating scales...";
  updateScaleVariables(75);

  // Palette
  splashText.innerHTML = "Building colours...";
  buildPalette();

  // Pattern
  newPattern(editorPattern, 5, 9, 1);

  // Templates
  splashText.innerHTML = "Generating swatches...";

  swatches.generateSwatches();
  swatches.regenerateSwatches();

  // Editor
  nEnt = new Entity();
  nEnt.id = "memoryEditor";
  nEnt.shape = "canvas";
  nEnt.imagesrc = swatches.patternSwatch.canvas;
  nEnt.originX = 0;
  nEnt.originY = 0;
  editorLayer.addEntity(nEnt);

  editorLayer.redrawCanvas();

  // Background
  splashText.innerHTML = "Adding layers of complexity...";

  nEnt = new Entity();
  nEnt.id = "background";
  nEnt.shape = "background";

  backgroundLayer.addEntity(nEnt);
  backgroundLayer.redrawCanvas();

  // UI
  setupInterface();
  createInterface();
  uiLayer.redrawCanvas();

  // Overlays
  buildOverlays();

  // Event Triggers
  splashText.innerHTML = "Reticulating splines...";

  addEvent(interactionLayer, "click", mouseHandler);
  addEvent(interactionLayer, "mousemove", mouseHandler);
  addEvent(interactionLayer, "mousedown", mouseHandler);
  addEvent(interactionLayer, "mouseleave", mouseHandler);
  addEvent(interactionLayer, "mouseup", mouseHandler);
  addEvent(interactionLayer, "wheel", zoomCanvasMouse);

  addEvent(document, "keydown", keyHandler);
  addEvent(document, "keyup", keyHandler);

  addEvent(overlay.background, "click", function () {
    overlay.hideOverlay();
  });

  // Hide Splash Screen
  splashText.innerHTML = "Here we go!";
  overlay.hideOverlay();
  overlayBackground.className = "";

  // Check compatability
  swatches.patternSwatch.context.globalCompositeOperation = "overlay";

  if (swatches.patternSwatch.context.globalCompositeOperation !== "overlay") {
    setOverlay("compError");
    overlay.showOverlay();
  }

  swatches.patternSwatch.context.globalCompositeOperation = "source-over";
}

// Toggle Settings ====================================================================================================
function toggleEmpty() {
  if (drawEmpty === true) {
    drawEmpty = false;
  } else {
    drawEmpty = true;
  }

  swatches.regenerateSwatches();
  editorLayer.redrawCanvas();
}

function toggleSize() {
  if (rulerSize == "large") {
    rulerSize = "small";
  } else {
    rulerSize = "large";
  }

  createInterface();
  uiLayer.redrawCanvas();
}

function toggleTheme() {
  if (theme == 0) {
    theme = 1;
  } else {
    theme = 0;
  }

  changeCSS("*", "color", themeLibrary.themes[theme].fontColour);
  changeCSS(
    ".borderBottom, h1",
    "border-color",
    themeLibrary.themes[theme].fontColour
  );
  changeCSS(
    ".borderTop, .overlayFooter",
    "border-color",
    themeLibrary.themes[theme].fontColour
  );
  changeCSS(
    ".backgroundTheme",
    "background-color",
    themeLibrary.themes[theme].backgroundColour
  );
  changeCSS(
    'input[type="file"]',
    "color",
    themeLibrary.themes[theme].fontColour
  );
  changeCSS(
    ".slider",
    "background-color",
    themeLibrary.themes[theme].toggleColour
  );
  changeCSS(
    "#overlayWindow",
    "background-color",
    themeLibrary.themes[theme].overlayColour
  );

  backgroundLayer.redrawCanvas();
  createInterface();
  uiLayer.redrawCanvas();
}

function toggleUnits() {
  if (rulerUnits == "metric") {
    rulerUnits = "imperial";
  } else {
    rulerUnits = "metric";
  }

  createInterface();
  uiLayer.redrawCanvas();
}

// User Interface Functions ===========================================================================================
function setupInterface() {
  setupToolboxButtons();
  setupCameraButtons();
}

function setupCameraButtons() {
  // Configure Section
  uiCamera.name = "Camera";
  uiCamera.alignRight = true;

  // Buttons
  // Settings
  nEnt = new UiButton();

  nEnt.name = "toolboxSettings";

  nEnt.action = false;
  nEnt.icon = "iconSettings";
  nEnt.tiptext = "Editor Settings";

  uiCamera.addButton(nEnt);

  // Kickstarter
  nEnt = new UiButton();

  nEnt.name = "toolboxKickstarter";

  nEnt.action = false;
  nEnt.icon = "iconKickstarter";
  nEnt.tiptext = "Kickstarter Supporters";

  uiCamera.addButton(nEnt);

  // Help
  nEnt = new UiButton();

  nEnt.name = "toolboxHelp";

  nEnt.action = false;
  nEnt.icon = "iconHelp";
  nEnt.tiptext = "Help & About";

  uiCamera.addButton(nEnt);

  // Zoom In
  nEnt = new UiButton();

  nEnt.name = "cameraZoomIn";

  nEnt.action = false;
  nEnt.icon = "iconZoomIn";
  nEnt.pregap = true;
  nEnt.tiptext = "Zoom In";

  uiCamera.addButton(nEnt);

  // Zoom Out
  nEnt = new UiButton();

  nEnt.name = "cameraZoomOut";

  nEnt.action = false;
  nEnt.icon = "iconZoomOut";
  nEnt.tiptext = "Zoom Out";

  uiCamera.addButton(nEnt);

  // Center
  nEnt = new UiButton();

  nEnt.name = "cameraCenter";

  nEnt.action = false;
  nEnt.icon = "iconCenter";
  nEnt.tiptext = "Center View";

  uiCamera.addButton(nEnt);

  // Extents
  nEnt = new UiButton();

  nEnt.name = "cameraExtents";

  nEnt.action = false;
  nEnt.icon = "iconExtents";
  nEnt.tiptext = "Zoom to Extents";

  uiCamera.addButton(nEnt);

  // Save
  nEnt = new UiButton();

  nEnt.name = "cameraPhoto";

  nEnt.action = false;
  nEnt.icon = "iconCamera";
  nEnt.tiptext = "Save Image";

  uiCamera.addButton(nEnt);

  // Flip
  nEnt = new UiButton();

  nEnt.name = "cameraFlip";

  nEnt.action = false;
  nEnt.icon = "iconFlip";
  nEnt.tiptext = "Flip Pattern";

  uiCamera.addButton(nEnt);

  // Reset
  nEnt = new UiButton();

  nEnt.name = "cameraReset";

  nEnt.action = false;
  nEnt.icon = "iconReset";
  nEnt.tiptext = "Reset View";

  uiCamera.addButton(nEnt);
}

function setupToolboxButtons() {
  // Configure Section
  uiToolbox.name = "Toolbox";

  // Buttons
  // New
  nEnt = new UiButton();

  nEnt.name = "toolboxNew";

  nEnt.action = false;
  nEnt.icon = "iconNew";
  nEnt.tiptext = "New Pattern";

  uiToolbox.addButton(nEnt);

  // Cursor
  nEnt = new UiButton();

  nEnt.name = "toolboxCursor";

  nEnt.action = false;
  nEnt.helptext = ["Cursor Tool", "Click a scale to change its colour."];
  nEnt.icon = "iconCursor";
  nEnt.pregap = true;
  nEnt.tiptext = "Cursor Tool";

  uiToolbox.addButton(nEnt);

  // Pan
  nEnt = new UiButton();

  nEnt.name = "cameraPan";

  nEnt.action = false;
  nEnt.helptext = ["Pan Tool", "Click anywhere to pan."];
  nEnt.icon = "iconPan";
  nEnt.tiptext = "Pan Mode";

  uiToolbox.addButton(nEnt);

  // Brush
  nEnt = new UiButton();

  nEnt.name = "toolboxBrush";

  nEnt.action = false;
  nEnt.helptext = ["Brush Tool", "Click and hold to colour many scales."];
  nEnt.icon = "iconBrush";
  nEnt.tiptext = "Brush Tool";

  uiToolbox.addButton(nEnt);

  // Fill
  nEnt = new UiButton();

  nEnt.name = "toolboxFill";
  nEnt.group = "fill";

  // Fill Row
  sEnt = new UiButton();

  sEnt.name = "toolboxFillRow";
  sEnt.group = "fill";

  sEnt.action = false;
  sEnt.helptext = ["Fill Row", "Click to colour an entire row."];
  sEnt.icon = "iconFillRow";
  sEnt.tiptext = "Fill Row";

  nEnt.addButton(sEnt);

  // Fill Column
  sEnt = new UiButton();

  sEnt.name = "toolboxFillColumn";
  sEnt.group = "fill";

  sEnt.action = false;
  sEnt.helptext = ["Fill Column", "Click to colour an entire column."];
  sEnt.icon = "iconFillColumn";
  sEnt.tiptext = "Fill Column";

  nEnt.addButton(sEnt);

  // Fill Colour
  sEnt = new UiButton();

  sEnt.name = "toolboxFillColour";
  sEnt.group = "fill";

  sEnt.action = false;
  sEnt.helptext = [
    "Fill Area",
    "Click to change all adjacent scales of the same colour.",
  ];
  sEnt.icon = "iconFillColour";
  sEnt.tiptext = "Fill Colour";

  nEnt.addButton(sEnt);

  nEnt.action = false;
  nEnt.expandable = true;
  nEnt.icon = false;
  nEnt.tiptext = false;

  uiToolbox.addButton(nEnt);

  // Row
  nEnt = new UiButton();

  nEnt.name = "toolboxRow";
  nEnt.group = "row";

  // Insert Row
  sEnt = new UiButton();

  sEnt.name = "toolboxRowInsert";
  sEnt.group = "row";

  sEnt.action = false;
  sEnt.helptext = ["Insert Row", "Click to add a new row of scales."];
  sEnt.icon = "iconRowInsert";
  sEnt.tiptext = "Insert Row";

  nEnt.addButton(sEnt);

  // Remove Row
  sEnt = new UiButton();

  sEnt.name = "toolboxRowRemove";
  sEnt.group = "row";

  sEnt.action = false;
  sEnt.helptext = ["Remove Row", "Click to remove a row of scales."];
  sEnt.icon = "iconRowRemove";
  sEnt.tiptext = "Delete Row";

  nEnt.addButton(sEnt);

  // Copy Row
  sEnt = new UiButton();

  sEnt.name = "toolboxRowCopy";
  sEnt.group = "row";

  sEnt.action = false;
  sEnt.helptext = ["Copy Row", "Click to copy the colours of a row of scales."];
  sEnt.icon = "iconRowCopy";
  sEnt.tiptext = "Copy Row";

  nEnt.addButton(sEnt);

  // Paste Row
  sEnt = new UiButton();

  sEnt.name = "toolboxRowPaste";
  sEnt.group = "row";

  sEnt.action = false;
  sEnt.helptext = [
    "Paste Row",
    "Click to paste the copied colours of a row of scales.",
  ];
  sEnt.icon = "iconRowPaste";
  sEnt.tiptext = "Paste Row";

  nEnt.addButton(sEnt);

  nEnt.action = false;
  nEnt.expandable = true;
  nEnt.icon = false;
  nEnt.tiptext = false;

  uiToolbox.addButton(nEnt);

  // Column
  nEnt = new UiButton();

  nEnt.name = "toolboxColumn";
  nEnt.group = "column";

  // Insert Column
  sEnt = new UiButton();

  sEnt.name = "toolboxColumnInsert";
  sEnt.group = "column";

  sEnt.action = false;
  sEnt.helptext = ["Insert Column", "Click to insert a new column of scales."];
  sEnt.icon = "iconColumnInsert";
  sEnt.tiptext = "Insert Column";

  nEnt.addButton(sEnt);

  // Remove Column
  sEnt = new UiButton();

  sEnt.name = "toolboxColumnRemove";
  sEnt.group = "column";

  sEnt.action = false;
  sEnt.helptext = ["Remove Column", "Click to remove a column of scales."];
  sEnt.icon = "iconColumnRemove";
  sEnt.tiptext = "Delete Column";

  nEnt.addButton(sEnt);

  // Copy Column
  sEnt = new UiButton();

  sEnt.name = "toolboxColumnCopy";
  sEnt.group = "column";

  sEnt.action = false;
  sEnt.helptext = [
    "Copy Column",
    "Click to copy the colours of a column of scales.",
  ];
  sEnt.icon = "iconColumnCopy";
  sEnt.tiptext = "Copy Column";

  nEnt.addButton(sEnt);

  // Paste Column
  sEnt = new UiButton();

  sEnt.name = "toolboxColumnPaste";
  sEnt.group = "column";

  sEnt.action = false;
  sEnt.helptext = [
    "Paste Column",
    "Click to paste the copied colours of a row of scales.",
  ];
  sEnt.icon = "iconColumnPaste";
  sEnt.tiptext = "Paste Column";

  nEnt.addButton(sEnt);

  nEnt.action = false;
  nEnt.expandable = true;
  nEnt.icon = false;
  nEnt.tiptext = false;

  uiToolbox.addButton(nEnt);

  // Replace
  nEnt = new UiButton();

  nEnt.name = "toolboxReplace";

  nEnt.action = false;
  nEnt.helptext = [
    "Replace Colour",
    "Click to change all scales of a single colour.",
  ];
  nEnt.icon = "iconReplace";
  nEnt.tiptext = "Replace Colour";

  uiToolbox.addButton(nEnt);
}

function createInterface() {
  uiLayer.clearEntities();

  uiToolbox.buildSection(uiLayer);
  createPalette(uiLayer);
  uiCamera.buildSection(uiLayer);
  createData(uiLayer, editorPattern);
}

function createPalette(target) {
  var x = 0;
  var y = palette.colours.length;

  var r = 0;
  var c = 0;

  var strokeWeight = 4;
  var strokeColour = themeLibrary.themes[theme].paletteColour;

  var perRow = 4;
  var paletteIcon = uiIconSize / 1.5;

  var boxOriginX = uiOffsetX - strokeWeight / 2;
  var boxOriginY =
    target.height -
    uiOffsetY -
    paletteIcon * Math.ceil(y / perRow) -
    strokeWeight / 2;

  for (x = 1; x < y; x++) {
    if (x == activeColour) {
      strokeColour = themeLibrary.themes[theme].paletteColour;
    } else {
      strokeColour = palette.colours[x].hex;
    }

    nEnt = new Entity();
    nEnt.id = palette.colours[x].id;
    nEnt.shape = "palette";

    nEnt.mouse = true;
    nEnt.mouseClick = true;
    nEnt.mouseHover = true;

    nEnt.fill = true;
    nEnt.fillColour = palette.colours[x].hex;
    nEnt.fillPalette = palette.colours[x];

    nEnt.stroke = true;
    nEnt.strokeColour = strokeColour;
    nEnt.strokeWeight = strokeWeight;

    nEnt.tooltip = true;
    nEnt.tooltipText = palette.colours[x].name;

    nEnt.originX = boxOriginX + paletteIcon * c + strokeWeight;
    nEnt.originY = boxOriginY + paletteIcon * r + strokeWeight;
    nEnt.height = paletteIcon - strokeWeight;
    nEnt.width = paletteIcon - strokeWeight;

    target.addEntity(nEnt);

    c++;

    if (c == perRow) {
      r++;
      c = 0;
    }
  }
}

function createData(target, pattern) {
  // Variables
  var pHeight = pattern.physicalHeight;
  var pWidth = pattern.physicalWidth;
  var pData;

  var mHeight = 0;
  var mWidth = 0;
  var mFraction = "";

  var wScales = 0;
  var wRings = 0;
  var wTotal = 0;

  var output = [];

  var oHeight = 0;
  var oWidth = 0;

  var posX = 0;
  var posY = 0;

  var x = 0;
  var y = 0;
  var h = 0;

  // Generate Data
  // Scale Count & Colour Tally
  sCount = 0;
  output.push([0, "Colours Used"]);

  palette.countColours(pattern);
  pData = palette.colourInformation();

  y = pData.length;

  for (x = 0; x < y; x++) {
    if (pData[x][1] > 0) {
      output.push([1, pData[x][1] + "x " + pData[x][0]]);
      sCount += pData[x][1];
    }
  }

  // Physical Height and Width
  output.push([0, "Pattern Size"]);

  // Width
  mWidth =
    pWidth * rulerData[rulerSize].width +
    (pWidth - 1) * rulerData[rulerSize].gapH;
  mWidth *= rulerData[rulerUnits]["multiSize"];

  if (rulerUnits == "imperial") {
    mFraction = " " + inchesFraction(mWidth);
    mWidth = Math.floor(mWidth);
  }

  output.push([
    1,
    "~" + mWidth + rulerData[rulerUnits].unitSize + mFraction + " wide",
  ]);

  // Height
  mHeight =
    (pHeight - 1) * rulerData[rulerSize].gapV + rulerData[rulerSize].height;
  mHeight *= rulerData[rulerUnits]["multiSize"];

  if (rulerUnits == "imperial") {
    mFraction = " " + inchesFraction(mHeight);
    mHeight = Math.floor(mHeight);
  }

  output.push([
    1,
    "~" + mHeight + rulerData[rulerUnits].unitSize + mFraction + " high",
  ]);

  // Physical Weight
  output.push([0, "Pattern Weight"]);

  wScales =
    sCount *
    rulerData[rulerSize].weightS *
    rulerData[rulerUnits]["multiWeight"];
  wRings =
    sCount *
    rulerData[rulerSize].weightR *
    2 *
    rulerData[rulerUnits]["multiWeight"];
  wTotal = wScales + wRings;

  wScales = wScales.toFixed(2);
  wRings = wRings.toFixed(2);
  wTotal = wTotal.toFixed(2);

  output.push([
    1,
    sCount + " Scales (~" + wScales + rulerData[rulerUnits].unitWeight + ")",
  ]);
  output.push([
    1,
    sCount * 2 + " Rings (~" + wRings + rulerData[rulerUnits].unitWeight + ")",
  ]);
  output.push([1, "~" + wTotal + rulerData[rulerUnits].unitWeight + " Total"]);

  // Create Entities
  y = output.length;

  // Precompute Size
  for (x = 0; x < y; x++) {
    if (output[x][0] == 0) {
      oHeight += 25;
    } else {
      oHeight += 15;
    }
  }

  // Generate
  for (x = 0; x < y; x++) {
    if (output[x][0] == 0) {
      h = 25;
    } else {
      h = 15;
    }

    posX = target.width - 20;
    posY = target.height - 20 - oHeight + h;
    oHeight -= h;

    nEnt = new Entity();
    nEnt.id = "data-" + x;
    nEnt.shape = "text";

    nEnt.fill = true;
    nEnt.fillColour = themeLibrary.themes[theme].fontColour;

    nEnt.originX = posX;
    nEnt.originY = posY;

    nEnt.textAlign = "right";
    nEnt.textString = output[x][1];
    nEnt.textType = output[x][0];

    target.addEntity(nEnt);
  }
}

function inchesFraction(v) {
  return Math.floor(16 * (v % 1)) + "/16ths";
}

setupElements();
imageAssets.loadImages();
addEvent(window, "resize", scaleCanvases);
