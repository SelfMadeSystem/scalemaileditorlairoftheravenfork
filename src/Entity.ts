import { PaletteColour } from "./Palette";
import { UiButton } from "./ui/UiButton";

export default class Entity {
  public id = "";
  public object: UiButton | undefined;
  public shape = "";

  public mouse = false;
  public mouseClick = false;
  public mouseHover = false;
  public mousePointer = false;

  public fill = false;
  public fillColour = "";
  public fillOrder: CanvasFillRule = "nonzero";
  public fillPalette: PaletteColour | undefined;

  public stroke = false;
  public strokeColour = "";
  public strokeWeight = 0;

  public imageCanvas: HTMLCanvasElement | undefined;
  public imagesrc = "";
  public imageClipX = 0;
  public imageClipY = 0;

  public tooltip = false;
  public tooltipText: string | undefined;
  public tooltipFlip = false;

  public originX = 0;
  public originY = 0;
  public height = 0;
  public width = 0;

  public textAlign = "";
  public textString = "";
  public textType = 0;
}
