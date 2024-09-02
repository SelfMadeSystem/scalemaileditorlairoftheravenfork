import { PatternMatrix } from "./PatternMatrix";
import { JSONObj, SaveData } from "./Saver";

export class ColourPalette implements SaveData {
  public colours: PaletteColour[] = [];

  constructor() {
    this.build();
  }

  // Save data
  saveTo(): JSONObj {
    return {
      colours: this.colours.slice(2).map((x) => x.saveTo()),
    };
  }

  loadFrom(data: JSONObj): void {
    if (Array.isArray(data.colours)) {
      const newColours = data.colours.map((x) => {
        if (typeof x !== "object" || !x || Array.isArray(x)) {
          throw new Error("Invalid palette colour data: " + JSON.stringify(x));
        }
        return PaletteColour.loadFrom(x);
      });

      this.colours = [...this.colours.slice(0, 2), ...newColours];
    }
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

  resetColors() {
    this.colours = [];

    this.build();
  }

  private build() {
    this.addColour(new PaletteColour("Void", 0, 0, 0, 0));

    this.addColour(new PaletteColour("Empty", 0, 0, 0, 60));

    this.addColour(
      new PaletteColour("Aluminium (Brushed)", 195, 195, 197, 255).setBrushed()
    );

    this.addColour(
      new PaletteColour("Aluminium (Mirror)", 228, 228, 224, 255).setShiny()
    );
    this.addColour(new PaletteColour("Black", 32, 36, 39, 255));
    this.addColour(new PaletteColour("Blue", 17, 76, 173, 255));
    this.addColour(new PaletteColour("Bronze", 133, 108, 46, 255));
    this.addColour(new PaletteColour("Champange", 150, 150, 126, 255));
    this.addColour(
      new PaletteColour("Copper (Shiny)", 138, 99, 66, 255).setShiny()
    );
    this.addColour(new PaletteColour("Frost", 224, 225, 223, 255));
    this.addColour(
      new PaletteColour("Gold (Brushed)", 170, 166, 124, 255).setBrushed()
    );
    this.addColour(
      new PaletteColour("Gold (Mirror)", 207, 193, 146, 255).setShiny()
    );
    this.addColour(new PaletteColour("Green", 24, 79, 47, 255));
    this.addColour(new PaletteColour("Orange", 210, 100, 32, 255));
    this.addColour(new PaletteColour("Pink", 183, 51, 134, 255));
    this.addColour(new PaletteColour("Purple", 70, 54, 191, 255));
    this.addColour(new PaletteColour("Red", 146, 29, 19, 255));
    this.addColour(
      new PaletteColour("Clear (Plastic)", 255, 255, 255, 60).setPlastic()
    );
    this.addColour(
      new PaletteColour("Black (Plastic)", 43, 44, 39, 255).setPlastic()
    );
    this.addColour(
      new PaletteColour(
        "Glow in the Dark (Plastic)",
        69,
        179,
        112,
        255
      ).setPlastic()
    );
    this.addColour(
      new PaletteColour("Light purple", 175, 131, 208, 255).setPlastic()
    );
    this.addColour(
      new PaletteColour("Sky blue", 124, 202, 212, 255).setPlastic()
    );
    this.addColour(new PaletteColour("Lime", 158, 207, 90, 255).setPlastic());
    this.addColour(
      new PaletteColour(
        "Gold (more yellow but ok)",
        255,
        255,
        0,
        255
      ).setPlastic()
    );
    this.addColour(
      new PaletteColour("Transparent red", 255, 0, 0, 60).setPlastic()
    );
    this.addColour(
      new PaletteColour("Transparent blue", 0, 0, 255, 60).setPlastic()
    );
    this.addColour(
      new PaletteColour("Transparent green", 0, 255, 0, 60).setPlastic()
    );
    this.addColour(
      new PaletteColour("Transparent yellow", 255, 255, 0, 60).setPlastic()
    );
  }
}

export interface PaletteColourType {
  name: string;
  r: number;
  g: number;
  b: number;
  a: number;
  count: number;
  brushed: boolean;
  plastic: boolean;
  shiny: boolean;
  color: string;
}

export class PaletteColour {
  public count: number = 0;
  public brushed: boolean = false;
  public plastic: boolean = false;
  public shiny: boolean = false;
  public color: string;

  constructor(
    public name: string,
    public r: number,
    public g: number,
    public b: number,
    public a: number
  ) {
    this.color = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
  }

  private setCount(count: number) {
    this.count = count;
    return this;
  }

  setBrushed(brushed = true) {
    this.brushed = brushed;
    return this;
  }

  setPlastic(plastic = true) {
    this.plastic = plastic;
    return this;
  }

  setShiny(shiny = true) {
    this.shiny = shiny;
    return this;
  }

  // Save Data
  saveTo(): JSONObj {
    return {
      name: this.name,
      r: this.r,
      g: this.g,
      b: this.b,
      a: this.a,
      count: this.count,
      brushed: this.brushed,
      plastic: this.plastic,
      shiny: this.shiny,
    };
  }

  // Load Data
  static loadFrom(data: JSONObj) {
    const { name, r, g, b, a, count, brushed, plastic, shiny } = data;
    if (
      typeof name !== "string" ||
      typeof r !== "number" ||
      typeof g !== "number" ||
      typeof b !== "number" ||
      typeof a !== "number" ||
      typeof count !== "number" ||
      typeof brushed !== "boolean" ||
      typeof plastic !== "boolean" ||
      typeof shiny !== "boolean"
    ) {
      throw new Error("Invalid palette colour data: " + JSON.stringify(data));
    }
    return new PaletteColour(name, r, g, b, a)
      .setCount(count)
      .setBrushed(brushed)
      .setPlastic(plastic)
      .setShiny(shiny);
  }
}
