import { uiIconSize, uiOffsetX, uiOffsetY } from ".";
import { UiButton } from "./UiButton";

export class UiSection {
  public name = "";
  public buttons: UiButton[] = [];

  public alignRight = false;
  public alignBottom = false;

  addButton(btn: UiButton) {
    this.buttons.push(btn);
  }

  buildSection(target: any, currentTool: string) {
    let sx = 0;

    let ox = 0;
    let oy = 0;

    // Configure Origin
    if (this.alignRight === true) {
      ox = target.width - uiOffsetX - uiIconSize;
    } else {
      ox = uiOffsetX;
    }

    if (this.alignBottom === true) {
      oy = target.height - uiOffsetX - uiIconSize;
    } else {
      oy = uiOffsetY;
    }

    // Create Entities
    for (let x = 0; x < this.buttons.length; x++) {
      if (this.buttons[x].pregap === true) {
        sx += uiIconSize;
      }

      target.addEntity(
        ...this.buttons[x].createButtonEntity(
          currentTool === this.buttons[x].name,
          ox,
          oy + uiIconSize * x + sx
        )
      );

      if (
        this.buttons[x].expandable === true &&
        this.buttons[x].expanded === true
      ) {
        for (let z = 0; z < this.buttons[x].subbuttons.length; z++) {
          if (this.buttons[x].subbuttons[z].name == currentTool) {
            this.buttons[x].selected = z;
            this.buttons[x].name = this.buttons[x].subbuttons[z].name;
            this.buttons[x].helptext = this.buttons[x].subbuttons[z].helptext;
          }

          target.addEntity(
            ...this.buttons[x].subbuttons[z].createButtonEntity(
              currentTool === this.buttons[x].subbuttons[z].name,
              ox + uiIconSize * z,
              oy + uiIconSize * x + sx
            )
          );
        }
      }
    }
  }
}
