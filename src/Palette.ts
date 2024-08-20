export class ColourPalette {
  public colours: PaletteColour[] = [];

  addColour(colour: PaletteColour) {
    this.colours.push(colour);
  }

  isShiny(colour: number) {
    return this.colours[colour].shiny === true;
  }

  isBrushed(colour: number) {
    return this.colours[colour].brushed === true;
  }

  matchRGBA(r: number, g: number, b: number, a: number) {
    let closest = [1, 255];

    for (let x = 2; x < this.colours.length; x++) {
      const distance =
        Math.abs(r - this.colours[x].r) +
        Math.abs(g - this.colours[x].g) +
        Math.abs(b - this.colours[x].b) +
        Math.abs(a - this.colours[x].a);

      if (distance < closest[1]) {
        closest = [x, distance];
      }
    }

    return closest[0];
  }

  addCount(target: number) {
    this.colours[target].count++;
  }

  colourInformation() {
    const info = [];

    for (let x = 2; x < this.colours.length; x++) {
      info.push([this.colours[x].name, this.colours[x].count]);
    }

    return info;
  }

  countColours(target: any) {
    const tH = target.height;
    const tW = target.width;

    this.clearCount();

    for (let y = 0; y < tH; y++) {
      for (let x = 0; x < tW; x++) {
        this.addCount(target.getColour(y, x));
      }
    }
  }

  clearCount(target?: number) {
    if (target === undefined) {
      for (let x = 0; x < this.colours.length; x++) {
        this.colours[x].count = 0;
      }
    } else {
      this.colours[target].count = 0;
    }
  }

  highestCount() {
    let highest = [0, -1];

    for (let x = 1; x < this.colours.length; x++) {
      if (this.colours[x].count > highest[1]) {
        highest = [x, this.colours[x].count];
      }
    }

    return highest[0];
  }
}

export class PaletteColour {
  public id: string;
  public name: string;
  public count: number;
  public brushed: boolean;
  public plastic: boolean;
  public shiny: boolean;
  public r: number;
  public g: number;
  public b: number;
  public a: number;
  public hex: string;

  constructor() {
    this.id = "";
    this.name = "";
    this.count = 0;
    this.brushed = false;
    this.plastic = false;
    this.shiny = false;
    this.r = 0;
    this.g = 0;
    this.b = 0;
    this.a = 0;
    this.hex = "";
  }
}
