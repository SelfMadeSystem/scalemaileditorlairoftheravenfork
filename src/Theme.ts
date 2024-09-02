export type ThemeNames = "light" | "dark";

export function setTheme(theme: ThemeNames) {
  if (theme == "light") {
    document.body.classList.add("light");
    document.body.classList.remove("dark");
  } else {
    document.body.classList.add("dark");
    document.body.classList.remove("light");
  }
  themeCache = getRealTheme();
  localStorage.setItem("theme", theme);
}

export function setDefaultTheme() {
  const theme = localStorage.getItem("theme");
  if (theme == "light" || theme == "dark") {
    setTheme(theme);
  }

  setTheme(getTheme());
}

export function getTheme(): ThemeNames {
  if (document.body.classList.contains("light")) {
    return "light";
  } else if (document.body.classList.contains("dark")) {
    return "dark";
  }
  const localStorageTheme = localStorage.getItem("theme");
  if (localStorageTheme == "light" || localStorageTheme == "dark") {
    return localStorageTheme;
  }
  const wantsLight = window.matchMedia("(prefers-color-scheme: light)").matches;
  return wantsLight ? "light" : "dark";
}

let themeCache: ThemeStyle = getRealTheme();

function getRealTheme(): ThemeStyle {
  const calculatedStyle = getComputedStyle(document.body);
  return {
    fontColour: calculatedStyle.getPropertyValue("--font-colour"),
    backgroundColour: calculatedStyle.getPropertyValue("--background-colour"),
    dotColour: calculatedStyle.getPropertyValue("--dot-colour"),
    overlayColour: calculatedStyle.getPropertyValue("--overlay-colour"),
    toggleColour: calculatedStyle.getPropertyValue("--toggle-colour"),
    paletteColour: calculatedStyle.getPropertyValue("--palette-colour"),
    logoColour: calculatedStyle.getPropertyValue("--logo-colour"),
  };
}

export function getCurrentTheme(): ThemeStyle {
  return themeCache;
}

export interface ThemeStyle {
  fontColour: string;

  backgroundColour: string;
  dotColour: string;
  overlayColour: string;

  toggleColour: string;
  paletteColour: string;

  logoColour: string;
}
