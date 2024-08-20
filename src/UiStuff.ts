function UiSection() {
  this.name = "";
  this.buttons = [];

  this.alignRight = false;
  this.alignBottom = false;

  this.addButton = function (btn) {
    this.buttons.push(btn);
  };

  this.buildSection = function (target) {
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
        this.buttons[x].createButtonEntity(target, ox, oy + uiIconSize * x + sx)
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
            this.buttons[x].subbuttons[z].createButtonEntity(
              target,
              ox + uiIconSize * z,
              oy + uiIconSize * x + sx
            )
          );
        }
      }
    }
  };
}

function UiButton() {
  this.name = "";
  this.group = "";
  this.subbuttons = [];

  this.action = "";
  this.expanded = false;
  this.expandable = false;
  this.helptext = [];
  this.icon = "";
  this.pregap = false;
  this.selected = 0;
  this.state = false;
  this.tiptext = "";

  this.addButton = function (btn) {
    this.subbuttons.push(btn);
  };

  this.createButtonEntity = function (target, ox, oy) {
    if (ox === undefined) ox = 0;
    if (oy === undefined) oy = 0;

    nEnt = new Entity();
    nEnt.id = this.name;
    nEnt.object = this;
    nEnt.shape = "image";

    nEnt.mouse = true;
    nEnt.mouseClick = true;
    nEnt.mouseHover = true;

    if (this.icon !== false) {
      nEnt.imagesrc = this.icon;
    } else {
      nEnt.imagesrc = this.subbuttons[this.selected].icon;
    }

    if (currentTool == this.name) {
      nEnt.imageClipX = uiIconSize;
      nEnt.imageClipY = 0;
    } else {
      nEnt.imageClipX = 0;
      nEnt.imageClipY = 0;
    }

    nEnt.tooltip = true;
    if (this.tiptext === false) {
      nEnt.tooltipText = this.subbuttons[this.selected].tiptext;
    } else {
      nEnt.tooltipText = this.tiptext;
    }

    nEnt.originX = ox;
    nEnt.originY = oy;
    nEnt.height = uiIconSize;
    nEnt.width = uiIconSize;

    if (currentTool == this.name) {
      this.createButtonHelp(target);
    }

    return nEnt;
  };

  this.createButtonHelp = function (target) {
    var x = 0;
    var y = this.helptext.length;

    for (x = 0; x < y; x++) {
      sEnt = new Entity();
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

      target.addEntity(sEnt);
    }
  };
}
