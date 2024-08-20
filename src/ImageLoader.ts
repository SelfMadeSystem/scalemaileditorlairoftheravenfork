const imagePath = "images/";

export default class ImageLoader {
  public list: [string, string][] = [
    // Toolbox
    ["iconNew", "iconNew.png"],
    ["iconOpen", "iconOpen.png"],
    ["iconSave", "iconSave.png"],
    ["iconSettings", "iconSettings.png"],

    ["iconBrush", "iconBrush.png"],
    ["iconColumnCopy", "iconColumnCopy.png"],
    ["iconColumnInsert", "iconColumnInsert.png"],
    ["iconColumnPaste", "iconColumnPaste.png"],
    ["iconColumnRemove", "iconColumnRemove.png"],
    ["iconCursor", "iconCursor.png"],
    ["iconFillColour", "iconFillColour.png"],
    ["iconFillColumn", "iconFillColumn.png"],
    ["iconFillRow", "iconFillRow.png"],
    ["iconFlip", "iconFlip.png"],
    ["iconKickstarter", "iconKickstarter.png"],
    ["iconReplace", "iconReplace.png"],
    ["iconRowCopy", "iconRowCopy.png"],
    ["iconRowInsert", "iconRowInsert.png"],
    ["iconRowPaste", "iconRowPaste.png"],
    ["iconRowRemove", "iconRowRemove.png"],
    ["iconShare", "iconShare.png"],

    // Camera
    ["iconZoomIn", "iconZoomIn.png"],
    ["iconZoomOut", "iconZoomOut.png"],
    ["iconCenter", "iconCenter.png"],
    ["iconExtents", "iconExtents.png"],
    ["iconReset", "iconReset.png"],
    ["iconPan", "iconPan.png"],
    ["iconHelp", "iconHelp.png"],
    ["iconCamera", "iconCamera.png"],

    // Overlay
    ["newShape", "buttonNew.png"],
    ["newImage", "buttonImage.png"],

    ["shapeSquare", "shapeSquare.png"],
    ["shapeDiamond", "shapeDiamond.png"],

    // Textures
    ["textureBrushed", "textureBrushed2.jpg"],
  ];
  public loadedImages: Map<string, HTMLImageElement> = new Map();
  public totalLoaded: number = 0;

  constructor(private onLoad: () => void) {}

  loadImages() {
    for (let i = 0; i < this.list.length; i++) {
      const [id, src] = this.list[i];
      this.loadImage(id, src);
    }
  }

  loadImage(id: string, src: string) {
    const img = new Image();

    img.addEventListener("load", () => {
      this.loadComplete();
    });

    img.id = id;
    img.src = imagePath + src;

    this.loadedImages.set(id, img);
  }

  loadComplete() {
    this.totalLoaded++;

    if (this.totalLoaded === this.list.length) {
      this.onLoad();
    }
  }

  getImage(id: string): HTMLImageElement | undefined {
    if (this.loadedImages.has(id)) {
      return this.loadedImages.get(id);
    }

    console.error("Unable to load " + id);
    return undefined;
  }
}
