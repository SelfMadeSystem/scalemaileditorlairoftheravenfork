import { uiIconSize, uiOffsetX, uiOffsetY } from ".";
import Entity from "../Entity";

export class UiButton {
  public name = "";
  public group = "";
  public subbuttons: UiButton[] = [];

  public expanded = false;
  public expandable = false;
  public helptext: string[] = [];
  public icon: string | undefined;
  public pregap = false;
  public selected = 0;
  public state = false;
  public tiptext: string | undefined;

  public addButton(btn: UiButton) {
    this.subbuttons.push(btn);
  }

  createButtonEntity(isCurrentTool: boolean, ox = 0, oy = 0): Entity[] {
    const nEnt = new Entity();
    nEnt.id = this.name;
    nEnt.object = this;
    nEnt.shape = "image";

    nEnt.mouse = true;
    nEnt.mouseClick = true;
    nEnt.mouseHover = true;

    nEnt.imagesrc = this.icon ?? this.subbuttons[this.selected]?.icon ?? "";

    if (isCurrentTool) {
      nEnt.imageClipX = uiIconSize;
    }

    nEnt.tooltip = true;
    nEnt.tooltipText = this.tiptext ?? this.subbuttons[this.selected]?.tiptext;

    nEnt.originX = ox;
    nEnt.originY = oy;
    nEnt.height = uiIconSize;
    nEnt.width = uiIconSize;

    const entities: Entity[] = [nEnt];
    if (isCurrentTool) {
      entities.push(...this.createButtonHelp());
    }

    return entities;
  }

  createButtonHelp(): Entity[] {
    const entities: Entity[] = [];
    for (let x = 0; x < this.helptext.length; x++) {
      const sEnt = new Entity();
      sEnt.id = "help-" + x;
      sEnt.shape = "text";

      if (x == 0) {
        sEnt.textType = 0;
      } else {
        sEnt.textType = 1;
        sEnt.textString = "- ";
      }

      sEnt.textString += this.helptext[x];

      sEnt.originX = uiOffsetX * 2 + uiIconSize;
      sEnt.originY = uiOffsetY + 10 + 15 * x;

      entities.push(sEnt);
    }

    return entities;
  }
}
