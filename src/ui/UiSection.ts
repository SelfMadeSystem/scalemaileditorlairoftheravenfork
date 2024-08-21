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
    // Variables
    var x = 0;
    var y = this.buttons.length;
    var z = 0;
    var l = 0;

    var sx = 0;

    var ox = 0;
    var oy = 0;

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
    for (x = 0; x < y; x++) {
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
        l = this.buttons[x].subbuttons.length;

        for (z = 0; z < l; z++) {
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
