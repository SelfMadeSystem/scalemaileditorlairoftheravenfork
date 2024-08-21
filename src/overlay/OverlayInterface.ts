import { OverlayScreen } from "./OverlayScreen";

export class OverlayInterface {
  public background = document.getElementById(
    "overlayBackground"
  ) as HTMLDivElement;
  public loading = document.getElementById("overlayLoading") as HTMLDivElement;
  public pane = document.getElementById("overlayWindow") as HTMLDivElement;
  public wrapper = document.getElementById("overlayWrapper") as HTMLDivElement;

  public screens: Map<string, any> = new Map();

  /* Screens */
  public addScreen(screen: OverlayScreen) {
    this.screens.set(screen.id, screen);
  }

  public getScreen(id: string) {
    return this.screens.get(id);
  }

  /* Toggles */
  public showOverlay() {
    this.wrapper.className = "show";
  }

  public hideOverlay() {
    this.wrapper.className = "";
    this.pane.innerHTML = "";
  }

  public showLoading() {
    this.loading.className = "show";
  }

  public hideLoading() {
    this.loading.className = "";
  }
}
