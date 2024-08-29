import { OverlayObject } from "./OverlayObject";
import { OverlayPane } from "./OverlayPane";

export class OverlayScreen {
  public bar = new OverlayPane();
  public pane = new OverlayPane();

  constructor(public id: string, public title: string) {}

  public addObjectToBar(object: OverlayObject) {
    this.bar.addObject(object);
  }

  public addObjectToPane(object: OverlayObject) {
    this.pane.addObject(object);
  }
}
