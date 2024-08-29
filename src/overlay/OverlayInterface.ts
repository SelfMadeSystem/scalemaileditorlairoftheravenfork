import { stringToElements } from "../utils";
import { makeOverlayPane } from "./OverlayPane";
import { OverlayScreen } from "./OverlayScreen";

class OverlayInterface {
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

export const overlayInterface = new OverlayInterface();

export function setOverlay(windowID: string) {
  const fragment = document.createDocumentFragment();

  const { bar, pane, title } = overlayInterface.getScreen(windowID);

  // Output Contents
  const titleNode = document.createElement("h1");
  titleNode.textContent = title;

  fragment.append(titleNode);

  fragment.append(makeOverlayPane(bar, false));
  fragment.append(makeOverlayPane(pane, true));

  // Closing
  fragment.append(
    ...stringToElements(`
    <div class='overlayFooter fontSizeSmall'>
      <p class='fontSizeSmall floatLeft'>Scalemail Designer created by Anthony Edmonds - continued development by SelfMadeSystem</p>
    </div>`)
  );

  // Apply
  const overlayWindow = document.getElementById("overlayWindow")!;
  overlayWindow.innerHTML = "";
  overlayWindow.appendChild(fragment);
  overlayInterface.hideLoading();
}