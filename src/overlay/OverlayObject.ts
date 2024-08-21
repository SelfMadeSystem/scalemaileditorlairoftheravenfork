/* function OverlayObject() {
    this.type = "";
    this.id = "";
  
    this.title = "";
    this.string = [];
  
    this.accepted = "";
    this.checked = false;
    this.data = [];
    this.enabled = true;
    this.focused = false;
    this.increment = 0;
    this.label = "";
    this.length = 0;
    this.maxValue = 999;
    this.minValue = 0;
    this.name = "";
    this.state = 0;
    this.target = "_blank";
    this.placeholder = false;
    this.playlist = "";
    this.url = "";
    this.value = "";
  
    this.src = false;
    this.alt = "";
  
    this.click = false;
    this.hover = false;
    this.change = false;
  } */

export type OverlayObject =
  | {
      type: "button";
      title: string;
      src: string;
      click: (e: MouseEvent) => void;
    }
  | {
      type: "text";
      title: string;
      string?: string[];
    }
  | {
      type: "inputWrapper";
      state?: number;
    }
  | {
      type: "inputRadio";
      id: string;

      checked?: boolean;
      label: string;
      name: string;
      value: number;

      src?: string;
      alt?: string;
    }
  | {
      type: "inputNumber";
      id: string;

      increment?: number;
      label: string;
      value: number;
      maxValue: number;
      minValue: number;

      change?: string; // TODO: make this a (e) => void
    }
  | {
      type: "dropdown";
      id: string;

      change: string; // TODO: make this a (e) => void
      data: { id: string; name: string }[];
      label: string;
    }
  | {
      type: "inputButton";
      id?: string; // why `?`?

      focused?: boolean;
      label: string;
      value: string;

      click: string; // TODO: make this a (e) => void
    }
  | {
      type: "inputFile";
      id: string;

      accepted: string;

      change: string; // TODO: make this a (e) => void
    }
  | {
      // ????
      type: "canvas";
      id: string;
    }
  | {
      type: "inputText";
      id: string;

      label: string;
      placeholder: string;
      value: string;
    }
  | {
      type: "inputCheckbox";
      id: string;

      checked: boolean;
      label: string;
    }
  | {
      // I'm so confused
      type: "toggle"; // ???
      id: string;

      title: string;
      string: string[];

      change: string; // TODO: make this a (e) => void
    }
  | {
      type: "share";
    }
  | {
      type: "anchor";

      string: string;
      url: string;
    }
  | {
      // tf's a brick
      type: "brick";

      title: string;
      url: string;
      src: string;
    };
