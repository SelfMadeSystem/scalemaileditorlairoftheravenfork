/*
 * Scalemail Inlay Designer v3
 * Developed by Anthony Edmonds for Lair of the Raven Ltd
 * Ported to TypeScript and continued development by SelfMadeSystem
 *
 * Copyright Lair of the Raven Ltd 2017
 * Copyright SelfMadeSystem 2024
 */

import "./style.css";
import ImageLoader from "./ImageLoader";
import Entity from "./Entity";
import { ColourPalette } from "./Palette";
import { overlayInterface, setOverlay } from "./overlay/OverlayInterface";
import { OverlayScreen } from "./overlay/OverlayScreen";
import { UiButton } from "./ui/UiButton";
import { UiSection } from "./ui/UiSection";
import { DrawUtils } from "./DrawUtils";
import { EntityLayer } from "./EntityLayer";
import { fontStyles } from "./Consts";
import { uiIconSize, uiOffsetX, uiOffsetY } from "./ui";
import { PatternMatrix } from "./PatternMatrix";
import { TemplateSwatches } from "./TemplateSwatches";
import { ImageMatrix } from "./ImageStuff";
import { Pos, posAdd, posDistSq } from "./utils";
import { EditorLayer } from "./EditorLayer";
import { PalettePicker } from "./palette-picker";
import { getCurrentTheme, getTheme, setDefaultTheme, setTheme } from "./Theme";
import { Saver } from "./Saver";

// Variables ==========================================================================================================
const imageLoader = new ImageLoader(startDesigner);

// Palette Variables
const palette = new ColourPalette();
var activeColour = 2;

// Draw Utils
const drawUtils = new DrawUtils(imageLoader);

// Swatch Variables
const swatches = new TemplateSwatches(palette, drawUtils);

// Pattern Variables
const editorPattern = new PatternMatrix();

const interactionLayer = document.getElementById(
  "canvasWrapper"
) as HTMLDivElement;

const editorLayer = new EditorLayer(drawUtils, swatches, editorPattern);
const uiLayer = new EntityLayer("canvasUI", drawUtils, swatches);
const photoLayer = new EntityLayer(
  {
    id: "photoLayer",
    width: 250,
    height: 250,
  },
  drawUtils,
  swatches
);

const palettePicker = new PalettePicker(palette, swatches, () => {
  createInterface();
  uiLayer.redrawCanvas();
  editorLayer.redrawCanvas();
});
document.body.appendChild(palettePicker);

// Save
const saver = new Saver(
  {
    pattern: editorPattern,
    palette: palette,
  },
  () => {},
  () => {
    createInterface();
    uiLayer.redrawCanvas();
    editorLayer.redrawCanvas();
  }
);

// Interaction Variables
var panCenterX = 0;
var panCenterY = 0;

var panMouse = false;
var panKey = false;

// Overlay Variables
const splashText = document.getElementById("splashText")!;

// UI Variables
var uiToolbox = new UiSection();
var uiCamera = new UiSection();

var currentTool = "toolboxCursor";

// General Functions ====================================================================================================
function calculateScale(
  destinationHeight: number,
  destinationWidth: number,
  sourceHeight: number,
  sourceWidth: number
) {
  return Math.min(
    destinationHeight / sourceHeight,
    destinationWidth / sourceWidth
  );
}

function changeCSS(selector: string, style: string, value: string) {
  const css = document.styleSheets[0].cssRules;

  for (let x = 0; x < css.length; x++) {
    const rule = css[x] as CSSStyleRule;
    if (rule.selectorText == selector) {
      rule.style.setProperty(style, value);
      return true;
    }
  }

  console.log("Rule " + selector + " not found.");
  return false;
}

function isMouseOnScale(
  mouseX: number,
  mouseY: number,
  pxX: number,
  pxY: number
) {
  const m: Pos = {
    x: mouseX,
    y: mouseY,
  };
  const o: Pos = {
    x: pxX,
    y: pxY,
  };
  const c1 = posAdd(drawUtils.scalePathCenter1, o);
  const c2 = posAdd(drawUtils.scalePathCenter2, o);

  const dist = Math.max(posDistSq(c1, m), posDistSq(c2, m));

  if (dist < drawUtils.scalePathRadius * drawUtils.scalePathRadius) {
    return true;
  }
}

function setURL() {
  // lol
}

// Camera Functions ===================================================================================================
function takePhoto() {
  // Variables
  var canvas = photoLayer.canvas;
  var context = photoLayer.context;

  var photo;

  var tt = "Created using Lair of the Raven's Scalemail Inlay Designer";
  var it = "";

  var ch = 0;
  var cw = 0;

  // Configure Memory Canvas
  // Set Scale Radius
  drawUtils.drawEmpty = false;
  zoomReset();

  // Scale to Pattern Size
  swatches.generatePatternSwatch(editorPattern);
  ch = swatches.patternSwatch.canvas.height;
  cw = swatches.patternSwatch.canvas.width;
  photoLayer.scaleCanvas(ch + 100, cw + 50, false);

  // Fill Layer
  context.fillStyle = getCurrentTheme().backgroundColour;
  context.fillRect(0, 0, photoLayer.width, photoLayer.height);

  // Create Image
  // Draw Pattern
  context.drawImage(swatches.patternSwatch.canvas, 25, 25);

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
  const a = document.getElementById("photoAnchor") as HTMLAnchorElement;

  a.download = "mypattern.png";

  console.log(photo);

  a.href = photo;
  a.click();

  // Restore Original Canvas
  drawUtils.drawEmpty = true;
  zoomExtents(editorPattern);
}

// Image to Pattern Functions =========================================================================================
// Objects

// Variables
var itpCanvas: HTMLCanvasElement;
var itpContext: CanvasRenderingContext2D;

var itpMemCanvas;
var itpMemContext;

var itpImage: HTMLImageElement;
var imageWidth = 0;
var imageHeight = 0;
var itpImageData = new ImageMatrix();

var itpStage = 0;
var itpProcessRow = 0;
var itpProcessData: ImageData;

var sampleSpacingX = 0;
var sampleSpacingY = 0;
var sampleWidthArea = 0;
var sampleHeightArea = 0;

var itpPattern = new PatternMatrix();
var itpPatternWidth = 0;
var itpPatternHeight = 0;

// Initialisation
function itpSetCanvas() {
  itpCanvas = document.getElementById("oCanvas") as HTMLCanvasElement;
  itpContext = itpCanvas.getContext("2d")!;

  itpCanvasResize();
  window.addEventListener("resize", itpCanvasResize);

  itpContext.font = "20px Montserrat";
}

function itpCanvasResize() {
  var w = itpCanvas.parentElement!.clientWidth;
  var h = itpCanvas.parentElement!.clientHeight;
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
  (document.getElementById("o-Prev") as HTMLInputElement).disabled = true;
  (document.getElementById("o-Next") as HTMLInputElement).disabled = true;
}

/* Processing */
function itpImageSelect(source: File) {
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
  if (!itpImage) {
    alert("Please select an image to process first.");
    return false;
  }

  itpStage = 2;

  // Disable Interface & Change Cursor
  itpDisableButtons();
  overlayInterface.showLoading();

  // Get Image Details
  imageWidth = itpImage.width;
  imageHeight = itpImage.height;

  // Configure Memory Canvas
  itpMemCanvas = document.createElement("canvas");
  itpMemContext = itpMemCanvas.getContext("2d")!;

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

function itpProgressImage(x: number, y: number, xw: number, yh: number) {
  itpContext.fillStyle = "rgba(255, 255, 255, 0.5)";
  itpContext.fillRect(x, y, xw, yh);
}

function itpPreviewPattern() {
  // Get Pattern Width
  itpPatternWidth = Number(
    (document.getElementById("o-Width") as HTMLInputElement).value
  );

  var sampleWidth = imageWidth / itpPatternWidth;
  var sampleHeight = Math.round(sampleWidth * drawUtils.scaleRatioHigh);

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
  overlayInterface.showLoading();

  // Variables
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
        palette,
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

  overlayInterface.hideOverlay();
}

// Input Functions ====================================================================================================
function checkRadio(radios: NodeListOf<HTMLInputElement>) {
  var x = 0;
  var y = radios.length;

  for (x = 0; x < y; x++) {
    if (radios[x].checked) {
      return radios[x].value;
    }
  }

  return radios[0].value;
}

// Interaction Functions ==============================================================================================
// Window Resize
function scaleCanvases() {
  editorLayer.scaleCanvas();
  editorLayer.redrawCanvas();

  uiLayer.scaleCanvas();
  createInterface();
  uiLayer.redrawCanvas();
}

// Zooming Functions
function zoomCanvas(scroll: number, mouse?: Pos) {
  const scrollSpeed = scroll;
  const zoomFactor = 1.1;
  const minScale = 15;
  const maxScale = 300;

  const ogZoom = drawUtils.scaleRadius;

  if (scrollSpeed > 0) {
    // Zoom Out
    if (drawUtils.scaleRadius > minScale) {
      drawUtils.scaleRadius /= Math.pow(zoomFactor, scrollSpeed / 100);
      drawUtils.scaleRadius = Math.max(drawUtils.scaleRadius, minScale);
    }
  } else if (scrollSpeed < 0) {
    // Zoom In
    if (drawUtils.scaleRadius < maxScale) {
      drawUtils.scaleRadius *= Math.pow(zoomFactor, -scrollSpeed / 100);
      drawUtils.scaleRadius = Math.min(drawUtils.scaleRadius, maxScale);
    }
  }

  if (mouse) {
    editorLayer.panTowards(ogZoom, drawUtils.scaleRadius, mouse.x, mouse.y);
  }

  drawUtils.updateScaleVariables(drawUtils.scaleRadius);
}

function zoomCanvasMouse(event: WheelEvent) {
  zoomCanvas(event.deltaY, {
    x: event.pageX,
    y: event.pageY,
  });
  editorLayer.redrawCanvas();
}

function zoomExtents(sourcePattern: PatternMatrix) {
  var extWidth;
  var extHeight;
  const target = editorLayer.canvas;

  extWidth = target.width / (sourcePattern.width * drawUtils.scaleSpacingX);
  extHeight =
    target.height /
    ((sourcePattern.height - 1) * drawUtils.scaleSpacingY +
      drawUtils.scaleHeight * 1.1);

  if (extWidth < extHeight) {
    drawUtils.scaleRadius *= extWidth;
  } else {
    drawUtils.scaleRadius *= extHeight;
  }

  zoomCanvas(1);
  swatches.regenerateSwatches();
  editorLayer.panCenter();
  editorLayer.redrawCanvas();
}

function zoomReset() {
  drawUtils.scaleRadius = 75;
  zoomCanvas(0);
  swatches.regenerateSwatches();
  editorLayer.panCenter();
  editorLayer.redrawCanvas();
}

// Mouse Functions ====================================================================================================
// Canvas Mouse Interactions
function mouseHandler(event: MouseEvent) {
  const mouseX = event.pageX;
  const mouseY = event.pageY;

  let uiRedraw = false;
  let uiChange = false;

  if (!panMouse && !panKey) {
    const testEvent = {
      mouseX,
      mouseY,
      type: event.type,
    };
    if (testEvent.type === "mousemove") {
      testEvent.type = "move";
    }
    // Check UI Elements
    for (let x = uiLayer.entities.length - 1; x > -1; x--) {
      if (mouseInteraction(testEvent, uiLayer.entities[x])) {
        switch (event.type) {
          case "mousedown":
            mouseClickUI(uiLayer.entities[x].id);
            break;

          case "mousemove":
            setCursor("Pointer");
            // Tooltip
            // TODO: Refactor; this is messy
            const tooltipText = uiLayer.entities[x].tooltipText;
            if (
              tooltipText !== undefined &&
              uiLayer.entities[x].tooltip &&
              tooltipText != uiLayer.tooltipText
            ) {
              var flipTooltip = false;

              if (event.pageX > uiLayer.width / 2) {
                flipTooltip = true;
              }

              uiLayer.setTooltip(
                uiLayer.entities[x].originX + uiLayer.entities[x].width,
                uiLayer.entities[x].originY + uiLayer.entities[x].height / 2,
                tooltipText,
                flipTooltip
              );
              uiRedraw = true;
            }

            // Expanding
            const obj = uiLayer.entities[x].object;
            if (obj) {
              if (uiLayer.expanded !== undefined) {
                if (uiLayer.expanded.group != obj.group) {
                  if (obj.expandable) {
                    uiLayer.expanded.expanded = false;
                    uiLayer.expanded = obj;
                    obj.expanded = true;
                    uiChange = true;
                  } else {
                    uiLayer.expanded.expanded = false;
                    uiLayer.expanded = undefined;
                    uiChange = true;
                  }
                }
              } else {
                if (obj.expandable) {
                  uiLayer.expanded = obj;
                  obj.expanded = true;
                  uiChange = true;
                }
              }
            }

            break;
        }

        if (uiChange) {
          createInterface();
          uiRedraw = true;
        }

        if (uiRedraw) {
          uiLayer.redrawCanvas();
        }

        return true;
      }
    }

    if (uiLayer.expanded !== undefined) {
      uiLayer.expanded.expanded = false;
      uiLayer.expanded = undefined;
      createInterface();
    }

    if (uiLayer.tooltip !== false) {
      uiLayer.clearTooltip();
      uiLayer.redrawCanvas();
    }

    // Check Editor Elements
    if (currentTool != "cameraPan") {
      const patternHeight = editorPattern.height;
      const patternWidth = editorPattern.width;
      const canvasX = Math.round(editorLayer.offsetX);
      const canvasY = Math.round(editorLayer.offsetY);

      var sHalf = 0;

      var windowEdgeL = 0 - drawUtils.scaleWidth;
      var windowEdgeR = window.innerWidth + drawUtils.scaleWidth;
      var windowEdgeT = 0 - drawUtils.scaleHeight;
      var windowEdgeB = window.innerWidth + drawUtils.scaleHeight;

      for (let y = 0; y < patternHeight; y++) {
        for (let x = 0; x < patternWidth; x++) {
          if (x > 0 || editorPattern.matrix[y][x].colour > 0) {
            // Even-Odd Spacing
            if (editorPattern.matrix[y][0].colour == 0) {
              // Odd
              sHalf = 0;
            } else {
              // Even
              sHalf = drawUtils.scaleSpacingX / 2;
            }

            // Test
            const scaleX = Math.round(sHalf + drawUtils.scaleSpacingX * x);
            const scaleY = Math.round(drawUtils.scaleSpacingY * y);

            const pxX = canvasX + scaleX;
            const pxY = canvasY + scaleY;

            if (
              pxX > windowEdgeL &&
              pxX < windowEdgeR &&
              pxY > windowEdgeT &&
              pxY < windowEdgeB
            ) {
              if (isMouseOnScale(mouseX, mouseY, pxX, pxY)) {
                switch (event.type) {
                  case "mousedown":
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
      if (panMouse) {
        editorLayer.panCanvas(
          event.pageX - panCenterX,
          event.pageY - panCenterY
        );
        editorLayer.redrawCanvas();

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

let prevCenterX = 0;
let prevCenterY = 0;
let prevRadius = 0;
let prevTouchCount = 0;

function touchHandler(event: TouchEvent) {
  if (event.touches.length > 1) {
    const touches = Array.from(event.touches);

    let centerX = 0;
    let centerY = 0;

    for (const touch of touches) {
      centerX += touch.pageX;
      centerY += touch.pageY;
    }

    centerX /= touches.length;
    centerY /= touches.length;

    let radius = 0;

    for (const touch of touches) {
      radius += Math.sqrt(
        (centerX - touch.pageX) ** 2 + (centerY - touch.pageY) ** 2
      );
    }

    radius /= touches.length;

    if (
      prevCenterX &&
      prevCenterY &&
      prevRadius &&
      touches.length === prevTouchCount
    ) {
      const deltaX = centerX - prevCenterX;
      const deltaY = centerY - prevCenterY;
      const delta = radius - prevRadius;
      zoomCanvas(-delta * 5, {
        x: centerX,
        y: centerY,
      });
      editorLayer.panCanvas(deltaX, deltaY);
      editorLayer.redrawCanvas();
    }

    prevCenterX = centerX;
    prevCenterY = centerY;
    prevRadius = radius;
    prevTouchCount = touches.length;
    return;
  } else {
    prevCenterX = 0;
    prevCenterY = 0;
    prevRadius = 0;
    prevTouchCount = 0;
  }

  const touch = event.touches[0];
  const touchX = touch?.pageX ?? 0;
  const touchY = touch?.pageY ?? 0;
  event.preventDefault();

  let uiRedraw = false;
  let uiChange = false;

  if (!panMouse && !panKey) {
    // Check UI Elements
    for (let x = uiLayer.entities.length - 1; x > -1; x--) {
      const testEvent = {
        mouseX: touchX,
        mouseY: touchY,
        type: event.type,
      };
      if (testEvent.type === "touchmove") {
        testEvent.type = "move";
      }
      if (mouseInteraction(testEvent, uiLayer.entities[x])) {
        switch (event.type) {
          case "touchstart":
            mouseClickUI(uiLayer.entities[x].id);
            break;

          case "touchmove":
            setCursor("Pointer");
            // Tooltip
            // TODO: Refactor; this is messy
            const tooltipText = uiLayer.entities[x].tooltipText;
            if (
              tooltipText !== undefined &&
              uiLayer.entities[x].tooltip &&
              tooltipText != uiLayer.tooltipText
            ) {
              var flipTooltip = false;

              if (touchX > uiLayer.width / 2) {
                flipTooltip = true;
              }

              uiLayer.setTooltip(
                uiLayer.entities[x].originX + uiLayer.entities[x].width,
                uiLayer.entities[x].originY + uiLayer.entities[x].height / 2,
                tooltipText,
                flipTooltip
              );
              uiRedraw = true;
            }

            // Expanding
            const obj = uiLayer.entities[x].object;
            if (obj) {
              if (uiLayer.expanded !== undefined) {
                if (uiLayer.expanded.group != obj.group) {
                  if (obj.expandable) {
                    uiLayer.expanded.expanded = false;
                    uiLayer.expanded = obj;
                    obj.expanded = true;
                    uiChange = true;
                  } else {
                    uiLayer.expanded.expanded = false;
                    uiLayer.expanded = undefined;
                    uiChange = true;
                  }
                }
              } else {
                if (obj.expandable) {
                  uiLayer.expanded = obj;
                  obj.expanded = true;
                  uiChange = true;
                }
              }
            }

            break;
        }

        if (uiChange) {
          createInterface();
          uiRedraw = true;
        }

        if (uiRedraw) {
          uiLayer.redrawCanvas();
        }

        return true;
      }
    }

    if (uiLayer.expanded !== undefined) {
      uiLayer.expanded.expanded = false;
      uiLayer.expanded = undefined;
      createInterface();
    }

    if (uiLayer.tooltip !== false) {
      uiLayer.clearTooltip();
      uiLayer.redrawCanvas();
    }

    // Check Editor Elements
    if (currentTool != "cameraPan") {
      const patternHeight = editorPattern.height;
      const patternWidth = editorPattern.width;
      const canvasX = Math.round(editorLayer.offsetX);
      const canvasY = Math.round(editorLayer.offsetY);

      var sHalf = 0;

      var windowEdgeL = 0 - drawUtils.scaleWidth;
      var windowEdgeR = window.innerWidth + drawUtils.scaleWidth;
      var windowEdgeT = 0 - drawUtils.scaleHeight;
      var windowEdgeB = window.innerWidth + drawUtils.scaleHeight;

      for (let y = 0; y < patternHeight; y++) {
        for (let x = 0; x < patternWidth; x++) {
          if (x > 0 || editorPattern.matrix[y][x].colour > 0) {
            // Even-Odd Spacing
            if (editorPattern.matrix[y][0].colour == 0) {
              // Odd
              sHalf = 0;
            } else {
              // Even
              sHalf = drawUtils.scaleSpacingX / 2;
            }

            // Test
            const scaleX = Math.round(sHalf + drawUtils.scaleSpacingX * x);
            const scaleY = Math.round(drawUtils.scaleSpacingY * y);

            const pxX = canvasX + scaleX;
            const pxY = canvasY + scaleY;

            if (
              pxX > windowEdgeL &&
              pxX < windowEdgeR &&
              pxY > windowEdgeT &&
              pxY < windowEdgeB
            ) {
              if (isMouseOnScale(touchX, touchY, pxX, pxY)) {
                switch (event.type) {
                  case "touchstart":
                    mouseDownEditor(y, x, 1);
                    break;
                  case "touchend":
                    mouseUpEditor(y, x, 0);
                    break;

                  case "touchmove":
                    mouseHoverEditor(y, x, 1);
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
    case "touchstart":
      setCursor("Grabbing");

      panCenterX = touchX;
      panCenterY = touchY;
      panMouse = true;

      break;

    case "touchmove":
      if (panMouse) {
        editorLayer.panCanvas(touchX - panCenterX, touchY - panCenterY);
        editorLayer.redrawCanvas();

        panCenterX = touchX;
        panCenterY = touchY;
      } else {
        setCursor("Grab");
      }

      break;

    case "touchend":
      setCursor("Grab");
      panMouse = false;

      break;
  }
}

function keyHandler(event: KeyboardEvent) {
  switch (event.key) {
    case "Shift": {
      if (event.type == "keydown") {
        if (!panMouse) {
          setCursor("Grab");
        }

        panKey = true;
      } else {
        panKey = false;
      }
      break;
    }
    case "s": {
      if (event.type == "keydown" && event.ctrlKey) {
        saver.saveToLocalStorage();
        event.preventDefault();
      }
      break;
    }
    case "Escape": {
      if (event.type == "keydown" && event.ctrlKey) {
        saver.clearLocalStorage();
        window.location.reload();
      }
      break;
    }
  }
}

function mouseInteraction(
  {
    mouseX,
    mouseY,
    type,
  }: {
    mouseX: number;
    mouseY: number;
    type: "click" | "move" | string;
  },
  entity: Entity
) {
  if (entity.mouse !== true) {
    return false;
  }

  switch (type) {
    case "click":
      if (entity.mouseClick !== true) {
        return false;
      }

      break;

    case "move":
      if (entity.mouseHover !== true) {
        return false;
      }

      break;
  }

  switch (entity.shape) {
    case "image":
      if (
        mouseX >= entity.originX &&
        mouseX <= entity.originX + entity.width &&
        mouseY >= entity.originY &&
        mouseY <= entity.originY + entity.height
      ) {
        return true;
      }

      break;

    case "palette":
      if (
        mouseX >= entity.originX - entity.strokeWeight &&
        mouseX <= entity.originX + entity.width + entity.strokeWeight &&
        mouseY >= entity.originY - entity.strokeWeight &&
        mouseY <= entity.originY + entity.height + entity.strokeWeight
      ) {
        return true;
      }

      break;
  }

  return false;
}

let clicked = false;

function mouseDownEditor(y: number, x: number, b: number) {
  if (b === 1) {
    clicked = true;
    switch (currentTool) {
      case "toolboxCursor":
      case "toolboxBrush":
        editorPattern.colourScale(y, x, activeColour, editorLayer);
        editorLayer.redrawCanvas();

        break;

      //case "toolboxColumnInsert":
      //case "toolboxColumnRemove":
      //case "toolboxColumnCopy":
      //case "toolboxColumnPaste":
      case "toolboxFillRow":
        editorPattern.fillRow(y, activeColour);
        editorLayer.redrawCanvas();

        break;
      case "toolboxFillColumn":
        editorPattern.fillColumn(x, y, activeColour);
        editorLayer.redrawCanvas();

        break;
      case "toolboxFillColour":
        editorPattern.fill(y, x, activeColour);
        editorPattern.colourScale(y, x, activeColour);
        editorLayer.redrawCanvas();

        break;
      //case "toolboxRowInsert":
      //case "toolboxRowRemove":
      //case "toolboxRowCopy":
      //case "toolboxRowPaste":
      case "toolboxReplace":
        editorPattern.replaceAll(editorPattern.getColour(y, x), activeColour);
        editorLayer.redrawCanvas();

        break;

      default:
        console.log(
          "Sorry, the " + currentTool + " hasn't been implemented yet."
        );
        break;
    }
  } else if (b === 2) {
    setActiveColour(editorPattern.getColour(y, x));
  }
}

function mouseUpEditor(_y: number, _x: number, _b: any) {
  clicked = false;
}

function mouseHoverEditor(y: number, x: number, b: number) {
  if (b === 1) {
    switch (currentTool) {
      case "toolboxBrush":
        setCursor("Brush");
        if (clicked) {
          editorPattern.colourScale(y, x, activeColour, editorLayer);
          editorLayer.redrawCanvas();
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

function mouseClickUI(id: string) {
  if (id.startsWith("palette")) {
    setActiveColour(parseInt(id.replace("palette", "")));
    return;
  }

  switch (id) {
    // Camera Controls
    case "cameraCenter":
      editorLayer.panCenter();
      editorLayer.redrawCanvas();

      break;

    case "cameraExtents":
      zoomExtents(editorPattern);
      break;

    case "cameraFlip":
      editorPattern.flip();
      editorLayer.redrawCanvas();
      break;

    case "cameraReset":
      zoomReset();
      break;

    case "cameraPhoto":
      takePhoto();
      break;

    case "cameraZoomIn":
      zoomCanvas(-100, {
        x: editorLayer.canvas.width / 2,
        y: editorLayer.canvas.height / 2,
      });
      editorLayer.redrawCanvas();
      break;

    case "cameraZoomOut":
      zoomCanvas(100, {
        x: editorLayer.canvas.width / 2,
        y: editorLayer.canvas.height / 2,
      });
      editorLayer.redrawCanvas();
      break;

    // Toolbox Controls
    case "toolboxHelp":
      setOverlay("help");
      overlayInterface.showOverlay();

      uiLayer.tooltip = false;
      uiLayer.redrawCanvas();
      break;

    case "toolboxNew":
      setOverlay("new");
      overlayInterface.showOverlay();

      uiLayer.tooltip = false;
      uiLayer.redrawCanvas();
      break;

    case "toolboxOpen": {
      const input = document.createElement("input");
      input.type = "file";

      input.onchange = () => {
        const file = input.files?.[0];
        if (file) {
          file.text().then((text) => {
            saver.loadFromString(text);
          });
        }
      };

      input.click();
      break;
    }

    case "toolboxSave": {
      const text = saver.saveToString();
      const blob = new Blob([text], { type: "text/plain" });
      const link = document.createElement("a");
      link.download = "scalemail.json";
      link.href = window.URL.createObjectURL(blob);
      link.click();
      break;
    }

    case "toolboxSettings":
      setOverlay("settings");

      if (drawUtils.drawEmpty) {
        (document.getElementById("toggleEmpty") as HTMLInputElement).checked =
          true;
      }

      if (getTheme() === "light") {
        (document.getElementById("toggleTheme") as HTMLInputElement).checked =
          true;
      }

      if (editorLayer.doDrawGrid) {
        (document.getElementById("toggleGrid") as HTMLInputElement).checked =
          true;
      }

      overlayInterface.showOverlay();

      uiLayer.tooltip = false;
      uiLayer.redrawCanvas();
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
function setCursor(cursor: string) {
  interactionLayer.className = "cursor" + cursor;
}

// Overlay Functions ==================================================================================================

function buildOverlays() {
  // Variables
  var nWindow;
  // Create New
  nWindow = new OverlayScreen("new", "Create New Pattern");

  // Bar
  // New from Shape
  nWindow.addObjectToBar({
    type: "button",
    title: "New from Shape...",
    src: "buttonNew",
    click: () => {
      setOverlay("newShape");
    },
  });

  // New from Image
  nWindow.addObjectToBar({
    type: "button",
    title: "New from Image...",
    src: "buttonImage",
    click: () => {
      setOverlay("newImageSelect");
      itpStage = 0;
      itpSetCanvas();
    },
  });

  // Pane
  // Information
  nWindow.addObjectToPane({
    type: "text",
    title: "Scalemail Designer",
    string: [
      "Start a new inlay design based on either a default shape, or using a simple image.",
      "You will be able to configure your new design on the next page.",
    ],
  });

  overlayInterface.addScreen(nWindow);

  // New from Shape
  nWindow = new OverlayScreen("newShape", "New from Shape");

  // Bar
  // Select Shape
  // Title
  nWindow.addObjectToBar({
    type: "text",
    title: "Select Shape",
  });

  // Wrapper (Open)
  nWindow.addObjectToBar({
    type: "inputWrapper",
    state: 1,
  });

  // Radio Button (Square)
  nWindow.addObjectToBar({
    type: "inputRadio",
    id: "shapeSquare",
    checked: true,
    label: "Square",
    name: "shape",
    value: 0,
    src: "shapeSquare.png",
    alt: "Square",
  });

  // Radio Button (Diamond)
  nWindow.addObjectToBar({
    type: "inputRadio",
    id: "shapeDiamond",
    checked: false,
    label: "Diamond",
    name: "shape",
    value: 1,
    src: "shapeDiamond.png",
    alt: "Diamond",
  });

  // Wrapper (Close)
  nWindow.addObjectToBar({
    type: "inputWrapper",
  });

  // Pattern Settings
  // Title
  nWindow.addObjectToBar({
    type: "text",
    title: "Pattern Settings",
  });

  // Wrapper (Open)
  nWindow.addObjectToBar({
    type: "inputWrapper",
    state: 1,
  });

  // Width
  nWindow.addObjectToBar({
    type: "inputNumber",
    id: "o-Width",
    increment: 1,
    label: "Width",
    value: 5,
  });

  // Height
  nWindow.addObjectToBar({
    type: "inputNumber",
    id: "o-Height",
    increment: 1,
    label: "Height",
    value: 9,
  });

  // Colours
  nWindow.addObjectToBar({
    type: "dropdown",
    id: "o-Colour",
    change: (e) =>
      setActiveColour(Number((e.target as HTMLSelectElement).value)),
    data: palette.colours,
    label: "Colour",
  });

  // Wrapper (Close)
  nWindow.addObjectToBar({
    type: "inputWrapper",
  });

  // Wrapper (Open)
  nWindow.addObjectToBar({
    type: "inputWrapper",
    state: 1,
  });

  // Previous Button
  nWindow.addObjectToBar({
    type: "inputButton",
    id: "o-Prev",
    label: "Previous",
    value: "Previous",
    click: () => setOverlay("new"),
  });

  // Create Button
  nWindow.addObjectToBar({
    type: "inputButton",
    label: "Create Pattern",
    value: "Create Pattern",
    click: newFromShape,
  });

  // Wrapper (Close)
  nWindow.addObjectToBar({
    type: "inputWrapper",
  });

  // Pane
  // Information
  nWindow.addObjectToPane({
    type: "text",
    title: "How to Use",
    string: [
      "Use these options to generate a new scalemail pattern from a basic shape.",
      "Select the desired shape from the options provided, then set the height, width, and colour as desired.",
      "Note that some shapes, such as the diamond, require a fixed height/width ratio that will be calculated automatically.",
    ],
  });

  overlayInterface.addScreen(nWindow);

  // New from Image
  // Selection
  nWindow = new OverlayScreen("newImageSelect", "New from Image");

  // Bar
  // Title
  nWindow.addObjectToBar({
    type: "text",
    title: "Select Image",
  });

  // Wrapper (Open)
  nWindow.addObjectToBar({
    type: "inputWrapper",
    state: 1,
  });

  // File Select
  nWindow.addObjectToBar({
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
  });

  // Wrapper (Close)
  nWindow.addObjectToBar({
    type: "inputWrapper",
  });

  // Information
  nWindow.addObjectToBar({
    type: "text",
    title: "How to Use",
    string: [
      "The image should be a simple motif or design.",
      "Your image will be processed on your computer and will not be uploaded.",
      "You will be able to configure your pattern after processing.",
    ],
  });

  // Wrapper (Open)
  nWindow.addObjectToBar({
    type: "inputWrapper",
    state: 1,
  });

  // Previous Button
  nWindow.addObjectToBar({
    type: "inputButton",
    id: "o-Prev",
    label: "Previous",
    value: "Previous",
    click: () => setOverlay("new"),
  });

  // Next Button
  nWindow.addObjectToBar({
    type: "inputButton",
    id: "o-Next",
    label: "Process",
    value: "Process",
    click: itpImageProcess,
  });

  // Wrapper (Close)
  nWindow.addObjectToBar({
    type: "inputWrapper",
  });

  // Pane
  // Canvas
  nWindow.addObjectToPane({
    type: "canvas",
    id: "oCanvas",
  });

  overlayInterface.addScreen(nWindow);

  // Pattern
  nWindow = new OverlayScreen("newImagePattern", "Configure Pattern");

  // Bar
  // Wrapper (Open)
  nWindow.addObjectToBar({
    type: "inputWrapper",
    state: 1,
  });

  // Pattern Width
  nWindow.addObjectToBar({
    type: "inputNumber",
    id: "o-Width",
    label: "Width",
    value: 10,
    change: itpCanvasRedraw,
  });

  // Wrapper (Close)
  nWindow.addObjectToBar({
    type: "inputWrapper",
  });

  // Title
  nWindow.addObjectToBar({
    type: "text",
    title: "How to Use",
    string: [
      "Change the width of the pattern to increase scale density.",
      "Focus on the motif/design of your image. Perform minor adjustments using the editor.",
    ],
  });

  // Wrapper (Open)
  nWindow.addObjectToBar({
    type: "inputWrapper",
    state: 1,
  });

  // Previous Button
  nWindow.addObjectToBar({
    type: "inputButton",
    id: "o-Prev",
    label: "Previous",
    value: "Previous",
    click: () => {
      setOverlay("newImageSelect");
      itpStage = 0;
      itpSetCanvas();
    },
  });

  // Next Button
  nWindow.addObjectToBar({
    type: "inputButton",
    id: "o-Next",
    label: "Build",
    value: "Build",
    click: itpGeneratePattern,
  });

  // Wrapper (Close)
  nWindow.addObjectToBar({
    type: "inputWrapper",
  });

  // Pane
  // Canvas
  nWindow.addObjectToPane({
    type: "canvas",
    id: "oCanvas",
  });

  overlayInterface.addScreen(nWindow);

  // Settings
  nWindow = new OverlayScreen("settings", "Settings");

  // Bar
  nWindow.addObjectToBar({
    type: "text",
    string: [
      "Use these toggles to configure the inlay designer.",
      "Settings are not saved or preserved. Any changes from default will need to be set every time you start the designer.",
    ],
  });

  // Pane
  nWindow.addObjectToPane({
    type: "button",
    title: "Open Palette Picker",
    click: () => {
      palettePicker.toggle();
    },
  });
  // Show Empty Scales
  nWindow.addObjectToPane({
    id: "toggleEmpty",
    type: "toggle",
    title: "Empty Scales",
    string: ["Hide", "Show"],
    change: toggleEmpty,
  });

  // Theme
  nWindow.addObjectToPane({
    id: "toggleTheme",
    type: "toggle",
    title: "Theme",
    string: ["Dark", "Light"],
    change: toggleTheme,
  });

  // Grid
  nWindow.addObjectToPane({
    id: "toggleGrid",
    type: "toggle",
    title: "Grid",
    string: ["Off", "On"],
    change: toggleGrid,
  });

  overlayInterface.addScreen(nWindow);

  // Help & About
  nWindow = new OverlayScreen("help", "Help & About");

  // Bar
  // About
  nWindow.addObjectToBar({
    type: "text",
    title: "About",
    string: [
      "Use this tool to create scalemail inlays and patterns, share your designs with the world, and browse the community submissions.",
      "This tool may be used for any purpose.",
    ],
  });

  // Keyboard
  nWindow.addObjectToBar({
    type: "text",
    title: "Keyboard",
    string: [
      "Hold shift to pan the pattern.",
      "Ctrl + S to save to local storage.",
      "Ctrl + Esc to clear local storage and reset the pattern and palette.",
    ],
  });

  // Legal
  nWindow.addObjectToBar({
    type: "text",
    title: "Legal",
    string: [
      "Colours, sizes, weights, dimensions, and shapes are all estimates or visual representations and may not accurately reflect the actual physical properties or dimensions of that which they represent.",
      "All patterns stored on our server are held anonymously. Your IP address and other computer identifying information is not stored.",
      "All patterns created using this tool belong to the author. Lair of the Raven infers no copyright or other claim on user submitted patterns.",
      "If you believe a pattern is in violation of your rights, please contact Lair of the Raven for removal.",
    ],
  });

  // Links
  // Title
  nWindow.addObjectToBar({
    type: "text",
    title: "Links",
  });

  // Lair of the Raven
  nWindow.addObjectToBar({
    type: "anchor",
    string: "Lair of the Raven",
    url: "http://lairoftheraven.uk",
  });

  // Contact
  // Title
  nWindow.addObjectToBar({
    type: "text",
    title: "Contact",
  });

  // E-Mail
  nWindow.addObjectToBar({
    type: "anchor",
    string: "E-Mail",
    url: "mailto:contact@lairoftheraven.uk",
  });

  // Facebook
  // nWindow.addObjectToBar({
  //   type: "anchor",
  //   string: "Facebook",
  //   url: "https://www.facebook.com/lairoftheraven/",
  // });

  // Reddit
  // nWindow.addObjectToBar({
  //   type: "anchor",
  //   string: "Reddit",
  //   url: "https://www.reddit.com/r/lairoftheraven/",
  // });

  // Twitter
  // nWindow.addObjectToBar({
  //   type: "anchor",
  //   string: "@LairoftheRaven",
  //   url: "https://twitter.com/LairoftheRaven",
  // });

  // Pane
  // Tutorial Video
  // Title
  nWindow.addObjectToPane({
    type: "text",
    title: "Tutorial Playlist",
    string: [
      "Need help using the inlay designer? Check out our video tutorial series on YouTube for a detailed breakdown!",
      `Note: this series was made in 2017 and only covers the original version of the inlay designer.
      The series does not cover any of the additions, improvements or new features of the fork.`,
    ],
  });

  // Introduction Video
  nWindow.addObjectToPane({
    type: "brick",
    title: "Introduction",
    url: "https://www.youtube.com/watch?v=wyye0o6paNE&list=PLu9KjnY1dxRbLRRMHNmAhpH1hNYDMyQ2z&index=1&t=3s",
    src: "tutorialIntroThumb.jpg",
  });

  // Interface Video
  nWindow.addObjectToPane({
    type: "brick",
    title: "User Interface Overview",
    url: "https://www.youtube.com/watch?v=7EZebcOiM9Q&list=PLu9KjnY1dxRbLRRMHNmAhpH1hNYDMyQ2z&index=2",
    src: "tutorialIntroThumb.jpg",
  });

  // Creating Video
  nWindow.addObjectToPane({
    type: "brick",
    title: "Creating a New Pattern",
    url: "https://www.youtube.com/watch?v=gTldguZj_yE&list=PLu9KjnY1dxRbLRRMHNmAhpH1hNYDMyQ2z&index=3",
    src: "tutorialCreateThumb.jpg",
  });

  // Gallery Video
  nWindow.addObjectToPane({
    type: "brick",
    title: "Saving, Loading, and Sharing",
    url: "https://www.youtube.com/watch?v=-raNeXvR2Fc&list=PLu9KjnY1dxRbLRRMHNmAhpH1hNYDMyQ2z&index=4",
    src: "tutorialGalleryThumb.jpg",
  });

  // Future Video
  nWindow.addObjectToPane({
    type: "brick",
    title: "Future Development",
    url: "https://www.youtube.com/watch?v=PA1ckRVSgnE&list=PLu9KjnY1dxRbLRRMHNmAhpH1hNYDMyQ2z&index=5",
    src: "tutorialIntroThumb.jpg",
  });

  overlayInterface.addScreen(nWindow);

  // Compatability Error
  nWindow = new OverlayScreen("compError", "Compatability Issue");

  // Bar

  // Pane
  nWindow.addObjectToPane({
    type: "text",
    title:
      "Looks like the browser you are using doesn't support the latest web technologies.",
    string: [
      "The Scalemail Inlay Designer requires the latest web standards, especially Canvas modes and functions.",
      "As the browser you are using doesn't support these features, I advise that you install the latest version of a web-standards compliant browser such as Firefox, Chrome, or Edge.",
      "You can continue to use the designer, but be aware that certain things may not work properly, or display incorrectly.",
    ],
  });

  overlayInterface.addScreen(nWindow);
}

// Palette Functions ==================================================================================================
function setActiveColour(colour: number) {
  activeColour = colour;
  createInterface();
  uiLayer.redrawCanvas();
}

// Pattern Functions ==================================================================================================
function newPattern(
  target: PatternMatrix,
  width = 5,
  height = 9,
  patternShape = 0,
  colour = activeColour
) {
  var x = 0;

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
  var width = (document.getElementById("o-Width") as HTMLInputElement).value;
  var height = (document.getElementById("o-Height") as HTMLInputElement).value;
  var shapeElements = document.getElementsByName(
    "shape"
  ) as NodeListOf<HTMLInputElement>;

  const shape = parseInt(checkRadio(shapeElements));

  editorPattern.clearMatrix();
  newPattern(editorPattern, Number(width), Number(height), shape);
  setURL();
  zoomExtents(editorPattern);
  createInterface();
  uiLayer.redrawCanvas();
  overlayInterface.hideOverlay();
  editorLayer.redrawCanvas();
}

function patternShapeSquare(target: PatternMatrix, colour: number) {
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

function patternShapeDiamond(target: PatternMatrix, colour: number) {
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

// Toggle Settings ====================================================================================================
function toggleEmpty() {
  if (drawUtils.drawEmpty) {
    drawUtils.drawEmpty = false;
  } else {
    drawUtils.drawEmpty = true;
  }

  editorLayer.redrawCanvas();
}

function toggleTheme() {
  setTheme(getTheme() == "light" ? "dark" : "light");

  // changeCSS("*", "color", getCurrentTheme().fontColour);
  // changeCSS(
  //   ".borderBottom, h1",
  //   "border-color",
  //   getCurrentTheme().fontColour
  // );
  // changeCSS(
  //   ".borderTop, .overlayFooter",
  //   "border-color",
  //   getCurrentTheme().fontColour
  // );
  // changeCSS(
  //   ".backgroundTheme",
  //   "background-color",
  //   getCurrentTheme().backgroundColour
  // );
  // changeCSS('input[type="file"]', "color", getCurrentTheme().fontColour);
  // changeCSS(
  //   ".slider",
  //   "background-color",
  //   getCurrentTheme().toggleColour
  // );
  changeCSS(
    "#overlayWindow",
    "background-color",
    getCurrentTheme().overlayColour
  );

  createInterface();
  uiLayer.redrawCanvas();
}

function toggleGrid() {
  editorLayer.doDrawGrid = !editorLayer.doDrawGrid;
  editorLayer.redrawCanvas();
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
  let nEnt = new UiButton();

  nEnt.name = "toolboxSettings";

  nEnt.icon = "iconSettings";
  nEnt.tiptext = "Editor Settings";

  uiCamera.addButton(nEnt);

  // Help
  nEnt = new UiButton();

  nEnt.name = "toolboxHelp";

  nEnt.icon = "iconHelp";
  nEnt.tiptext = "Help & About";

  uiCamera.addButton(nEnt);

  // Zoom In
  nEnt = new UiButton();

  nEnt.name = "cameraZoomIn";

  nEnt.icon = "iconZoomIn";
  nEnt.pregap = true;
  nEnt.tiptext = "Zoom In";

  uiCamera.addButton(nEnt);

  // Zoom Out
  nEnt = new UiButton();

  nEnt.name = "cameraZoomOut";

  nEnt.icon = "iconZoomOut";
  nEnt.tiptext = "Zoom Out";

  uiCamera.addButton(nEnt);

  // Center
  nEnt = new UiButton();

  nEnt.name = "cameraCenter";

  nEnt.icon = "iconCenter";
  nEnt.tiptext = "Center View";

  uiCamera.addButton(nEnt);

  // Extents
  nEnt = new UiButton();

  nEnt.name = "cameraExtents";

  nEnt.icon = "iconExtents";
  nEnt.tiptext = "Zoom to Extents";

  uiCamera.addButton(nEnt);

  // Save
  nEnt = new UiButton();

  nEnt.name = "cameraPhoto";

  nEnt.icon = "iconCamera";
  nEnt.tiptext = "Save Image";

  uiCamera.addButton(nEnt);

  // Flip
  nEnt = new UiButton();

  nEnt.name = "cameraFlip";

  nEnt.icon = "iconFlip";
  nEnt.tiptext = "Flip Pattern";

  uiCamera.addButton(nEnt);

  // Reset
  nEnt = new UiButton();

  nEnt.name = "cameraReset";

  nEnt.icon = "iconReset";
  nEnt.tiptext = "Reset View";

  uiCamera.addButton(nEnt);
}

function setupToolboxButtons() {
  // Configure Section
  uiToolbox.name = "Toolbox";

  // Buttons
  // New
  let pEnt = new UiButton();

  pEnt.name = "toolboxNew";

  pEnt.icon = "iconNew";
  pEnt.tiptext = "New Pattern";

  uiToolbox.addButton(pEnt);

  // Open
  pEnt = new UiButton();

  pEnt.name = "toolboxOpen";

  pEnt.icon = "iconOpen";
  pEnt.tiptext = "Open Pattern";

  uiToolbox.addButton(pEnt);

  // Save
  pEnt = new UiButton();

  pEnt.name = "toolboxSave";

  pEnt.icon = "iconSave";
  pEnt.tiptext = "Save Pattern";

  uiToolbox.addButton(pEnt);

  // Cursor
  pEnt = new UiButton();

  pEnt.name = "toolboxCursor";

  pEnt.helptext = ["Cursor Tool", "Click a scale to change its colour."];
  pEnt.icon = "iconCursor";
  pEnt.pregap = true;
  pEnt.tiptext = "Cursor Tool";

  uiToolbox.addButton(pEnt);

  // Pan
  pEnt = new UiButton();

  pEnt.name = "cameraPan";

  pEnt.helptext = ["Pan Tool", "Click anywhere to pan."];
  pEnt.icon = "iconPan";
  pEnt.tiptext = "Pan Mode";

  uiToolbox.addButton(pEnt);

  // Brush
  pEnt = new UiButton();

  pEnt.name = "toolboxBrush";

  pEnt.helptext = ["Brush Tool", "Click and hold to colour many scales."];
  pEnt.icon = "iconBrush";
  pEnt.tiptext = "Brush Tool";

  uiToolbox.addButton(pEnt);

  // Fill
  pEnt = new UiButton();

  pEnt.name = "toolboxFill";
  pEnt.group = "fill";
  pEnt.expandable = true;

  // Fill Colour
  let cEnt = new UiButton();

  cEnt.name = "toolboxFillColour";
  cEnt.group = "fill";

  cEnt.helptext = [
    "Fill Area",
    "Click to change all adjacent scales of the same colour.",
  ];
  cEnt.icon = "iconFillColour";
  cEnt.tiptext = "Fill Colour";

  pEnt.addButton(cEnt);

  // Fill Row
  cEnt = new UiButton();

  cEnt.name = "toolboxFillRow";
  cEnt.group = "fill";

  cEnt.helptext = ["Fill Row", "Click to colour an entire row."];
  cEnt.icon = "iconFillRow";
  cEnt.tiptext = "Fill Row";

  pEnt.addButton(cEnt);

  // Fill Column
  cEnt = new UiButton();

  cEnt.name = "toolboxFillColumn";
  cEnt.group = "fill";

  cEnt.helptext = ["Fill Column", "Click to colour an entire column."];
  cEnt.icon = "iconFillColumn";
  cEnt.tiptext = "Fill Column";

  pEnt.addButton(cEnt);

  uiToolbox.addButton(pEnt);

  // TODO: Add row and column tools
  /* // Row
  pEnt = new UiButton();

  pEnt.name = "toolboxRow";
  pEnt.group = "row";

  // Insert Row
  cEnt = new UiButton();

  cEnt.name = "toolboxRowInsert";
  cEnt.group = "row";

  cEnt.helptext = ["Insert Row", "Click to add a new row of scales."];
  cEnt.icon = "iconRowInsert";
  cEnt.tiptext = "Insert Row";

  pEnt.addButton(cEnt);

  // Remove Row
  cEnt = new UiButton();

  cEnt.name = "toolboxRowRemove";
  cEnt.group = "row";

  cEnt.helptext = ["Remove Row", "Click to remove a row of scales."];
  cEnt.icon = "iconRowRemove";
  cEnt.tiptext = "Delete Row";

  pEnt.addButton(cEnt);

  // Copy Row
  cEnt = new UiButton();

  cEnt.name = "toolboxRowCopy";
  cEnt.group = "row";

  cEnt.helptext = ["Copy Row", "Click to copy the colours of a row of scales."];
  cEnt.icon = "iconRowCopy";
  cEnt.tiptext = "Copy Row";

  pEnt.addButton(cEnt);

  // Paste Row
  cEnt = new UiButton();

  cEnt.name = "toolboxRowPaste";
  cEnt.group = "row";

  cEnt.helptext = [
    "Paste Row",
    "Click to paste the copied colours of a row of scales.",
  ];
  cEnt.icon = "iconRowPaste";
  cEnt.tiptext = "Paste Row";

  pEnt.addButton(cEnt);

  pEnt.expandable = true;

  uiToolbox.addButton(pEnt); */

  /* // Column
  pEnt = new UiButton();

  pEnt.name = "toolboxColumn";
  pEnt.group = "column";

  // Insert Column
  cEnt = new UiButton();

  cEnt.name = "toolboxColumnInsert";
  cEnt.group = "column";

  cEnt.helptext = ["Insert Column", "Click to insert a new column of scales."];
  cEnt.icon = "iconColumnInsert";
  cEnt.tiptext = "Insert Column";

  pEnt.addButton(cEnt);

  // Remove Column
  cEnt = new UiButton();

  cEnt.name = "toolboxColumnRemove";
  cEnt.group = "column";

  cEnt.helptext = ["Remove Column", "Click to remove a column of scales."];
  cEnt.icon = "iconColumnRemove";
  cEnt.tiptext = "Delete Column";

  pEnt.addButton(cEnt);

  // Copy Column
  cEnt = new UiButton();

  cEnt.name = "toolboxColumnCopy";
  cEnt.group = "column";

  cEnt.helptext = [
    "Copy Column",
    "Click to copy the colours of a column of scales.",
  ];
  cEnt.icon = "iconColumnCopy";
  cEnt.tiptext = "Copy Column";

  pEnt.addButton(cEnt);

  // Paste Column
  cEnt = new UiButton();

  cEnt.name = "toolboxColumnPaste";
  cEnt.group = "column";

  cEnt.helptext = [
    "Paste Column",
    "Click to paste the copied colours of a row of scales.",
  ];
  cEnt.icon = "iconColumnPaste";
  cEnt.tiptext = "Paste Column";

  pEnt.addButton(cEnt);

  pEnt.expandable = true;

  uiToolbox.addButton(pEnt); */

  // Replace
  pEnt = new UiButton();

  pEnt.name = "toolboxReplace";

  pEnt.helptext = [
    "Replace Colour",
    "Click to change all scales of a single colour.",
  ];
  pEnt.icon = "iconReplace";
  pEnt.tiptext = "Replace Colour";

  uiToolbox.addButton(pEnt);
}

function createInterface() {
  uiLayer.clearEntities();

  uiToolbox.buildSection(uiLayer, currentTool);
  createPalette(uiLayer);
  uiCamera.buildSection(uiLayer, currentTool);
  createData(uiLayer, editorPattern);
}

function createPalette(target: EntityLayer) {
  const colors = palette.colours.length;

  let r = 0;
  let c = 0;

  const strokeWeight = 4;

  const perRow = Math.ceil(Math.pow(colors, 0.6) / 2);
  var paletteIcon = uiIconSize / 1.5;

  var boxOriginX = uiOffsetX - strokeWeight / 2;
  var boxOriginY =
    target.height -
    uiOffsetY -
    paletteIcon * Math.ceil((colors - 1) / perRow) -
    strokeWeight / 2;

  for (let x = 1; x < colors; x++) {
    const strokeColour =
      x === activeColour
        ? getCurrentTheme().paletteColour
        : palette.colours[x].color;

    const nEnt = new Entity();
    nEnt.id = "palette" + x;
    nEnt.shape = "palette";

    nEnt.mouse = true;
    nEnt.mouseClick = true;
    nEnt.mouseHover = true;

    nEnt.fill = true;
    nEnt.fillColour = palette.colours[x].color;
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

function createData(target: EntityLayer, pattern: PatternMatrix) {
  // Variables
  var pData;

  var output: [0 | 1, string][] = [];

  var oHeight = 0;

  var posX = 0;
  var posY = 0;

  var x = 0;
  var y = 0;
  var h = 0;

  // Generate Data
  // Scale Count & Colour Tally
  var sCount = 0;
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

    const nEnt = new Entity();
    nEnt.id = "data-" + x;
    nEnt.shape = "text";

    nEnt.fill = true;
    nEnt.fillColour = getCurrentTheme().fontColour;

    nEnt.originX = posX;
    nEnt.originY = posY;

    nEnt.textAlign = "right";
    nEnt.textString = output[x][1];
    nEnt.textType = output[x][0];

    target.addEntity(nEnt);
  }
}

// Startup Functions ==================================================================================================
function startDesigner() {
  // Configure Scales
  splashText.innerHTML = "Calculating scales...";
  drawUtils.updateScaleVariables(75);

  // Pattern
  newPattern(editorPattern, 5, 9, 1);

  // Templates
  splashText.innerHTML = "Generating swatches...";

  // Editor
  editorLayer.redrawCanvas();

  // Background
  splashText.innerHTML = "Adding layers of complexity...";

  // UI
  setupInterface();
  createInterface();
  uiLayer.redrawCanvas();

  // Overlays
  buildOverlays();

  // Event Triggers
  splashText.innerHTML = "Reticulating splines...";

  interactionLayer.addEventListener("click", mouseHandler);
  interactionLayer.addEventListener("mousemove", mouseHandler);
  interactionLayer.addEventListener("mousedown", mouseHandler);
  interactionLayer.addEventListener("mouseleave", mouseHandler);
  interactionLayer.addEventListener("mouseup", mouseHandler);
  interactionLayer.addEventListener("touchstart", touchHandler);
  interactionLayer.addEventListener("touchmove", touchHandler);
  interactionLayer.addEventListener("touchend", touchHandler);
  interactionLayer.addEventListener("wheel", zoomCanvasMouse);

  document.addEventListener("keydown", keyHandler);
  document.addEventListener("keyup", keyHandler);

  overlayInterface.background.addEventListener("click", function () {
    overlayInterface.hideOverlay();
  });

  // Load from local storage
  splashText.innerHTML = "Loading settings...";
  setDefaultTheme();
  saver.loadFromLocalStorage();

  // Hide Splash Screen
  splashText.innerHTML = "Here we go!";
  overlayInterface.hideOverlay();
  document.getElementById("overlayBackground")!.className = "";

  // Check compatability
  swatches.patternSwatch.context.globalCompositeOperation = "overlay";

  if (swatches.patternSwatch.context.globalCompositeOperation !== "overlay") {
    setOverlay("compError");
    overlayInterface.showOverlay();
  }

  swatches.patternSwatch.context.globalCompositeOperation = "source-over";

  editorLayer.panCenter();
  scaleCanvases();
}

drawUtils.imageAssets.loadImages();
window.addEventListener("resize", scaleCanvases);
