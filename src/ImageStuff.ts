import { ColourPalette } from "./Palette";

export class ImageMatrix {
  public rows: ImageRow[] = [];

  clearData() {
    this.rows = [];
  }

  addRow() {
    this.rows.push(new ImageRow());
  }

  addPixel(row: number, r: number, g: number, b: number, a: number, p: number) {
    this.rows[row].addPixel(r, g, b, a, p);
  }

  sampleRegion(
    palette: ColourPalette,
    xOrigin: number,
    yOrigin: number,
    xWidth: number,
    yHeight: number
  ) {
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
  }
}

export class ImageRow {
  public pixels: ImagePixel[] = [];

  addPixel(r: number, g: number, b: number, a: number, p: number) {
    this.pixels.push(new ImagePixel(r, g, b, a, p));
  }
}

export class ImagePixel {
  constructor(
    public r: number,
    public g: number,
    public b: number,
    public a: number,
    public p: number
  ) {}
}
