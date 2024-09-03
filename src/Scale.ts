import { JSONObj, JSONVal, SaveData } from "./Saver";

export class Scale implements SaveData {
  public colour: number;
  constructor(data: number | JSONVal) {
    if (typeof data === "number") {
      this.colour = data;
    } else {
      this.colour = -1;
      if (
        typeof data === "object" &&
        data &&
        "colour" in data &&
        typeof data.colour === "number"
      ) {
        this.colour = data.colour;
      } else {
        console.warn("Invalid Scale Data:", data);
      }
    }
  }

  setColour(colour: number) {
    // if (colour === undefined) colour = false;

    // if (colour === false) {
    //   this.colour = activeColour;
    // } else {
    this.colour = colour;
    // }
  }

  // Save data
  saveTo(): JSONObj {
    return {
      colour: this.colour,
    };
  }

  // Load data
  loadFrom(_: JSONObj) {
    throw new Error("Use constructor instead");
  }
}
