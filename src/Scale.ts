export class Scale {
  constructor(public colour: number) {}

  setColour(colour: number) {
    // if (colour === undefined) colour = false;

    // if (colour === false) {
    //   this.colour = activeColour;
    // } else {
    this.colour = colour;
    // }
  }
}
