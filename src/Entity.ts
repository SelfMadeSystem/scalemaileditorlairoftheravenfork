export default class Entity {
  public id = "";
  public object = false;
  public shape = "";

  public mouse = false;
  public mouseClick = false;
  public mouseHover = false;
  public mousePointer = false;

  public fill = false;
  public fillColour = "";
  public fillOrder = "nonzero";
  public fillPalette = 0;

  public stroke = false;
  public strokeColour = "";
  public strokeWeight = 0;

  public imagesrc = "";
  public imageClipX = false;
  public imageClipY = false;

  public tooltip = false;
  public tooltipText = "";
  public tooltipFlip = false;

  public originX = 0;
  public originY = 0;
  public height = 0;
  public width = 0;

  public textAlign = "";
  public textString = "";
  public textType = 0;
}
