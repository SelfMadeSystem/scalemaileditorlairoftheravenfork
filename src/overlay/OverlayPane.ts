import { OverlayObject } from "./OverlayObject";

export class OverlayPane {
  public objects: OverlayObject[] = [];

  public addObject(object: OverlayObject) {
    this.objects.push(object);
  }
}
