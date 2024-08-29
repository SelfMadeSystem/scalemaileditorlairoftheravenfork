export const themes: ThemeStyle[] = [
  {
    id: "dark",
    fontColour: "#ffffff",

    backgroundColour: "#171717",
    dotColour: "#9c9c9c",
    overlayColour: "#4e4e4e",

    toggleColour: "#e8e8e8",
    paletteColour: "#ffffff",

    logoColour: "White",
  },
  {
    id: "light",

    fontColour: "#000000",

    backgroundColour: "#e8e8e8",
    dotColour: "#636363",
    overlayColour: "#b1b1b1",

    toggleColour: "#171717",
    paletteColour: "#000000",

    logoColour: "Black",
  },
];

export interface ThemeStyle {
  id: string;

  fontColour: string;

  backgroundColour: string;
  dotColour: string;
  overlayColour: string;

  toggleColour: string;
  paletteColour: string;

  logoColour: string;
}
