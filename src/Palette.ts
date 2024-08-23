import { PatternMatrix } from "./PatternMatrix";

export class ColourPalette {
  public colours: PaletteColour[] = [];

  constructor() {
    this.build();
  }

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
    const info: [string, number][] = [];

    for (let x = 2; x < this.colours.length; x++) {
      info.push([this.colours[x].name, this.colours[x].count]);
    }

    return info;
  }

  countColours(target: PatternMatrix) {
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

  private build() {
    // Void
    let nEnt = new PaletteColour();

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);

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

    this.addColour(nEnt);
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
