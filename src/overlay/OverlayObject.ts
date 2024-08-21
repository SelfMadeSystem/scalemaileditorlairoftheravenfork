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
      title?: string;
      string?: string[];
    }
  | {
      type: "inputWrapper";
      state?: number;
    }
  | {
      type: "inputButton";
      id?: string; // why `?`?

      label: string;
      value: string;

      click: (e: MouseEvent) => void;
    }
  | {
      type: "inputNumber";
      id: string;

      increment?: number;
      label: string;
      value: number;
      maxValue?: number;
      minValue?: number;

      change?: (e: Event) => void;
    }
  | {
      type: "inputText";
      id: string;

      label: string;
      placeholder: string;
    }
  | {
      type: "inputPassword";
      id: string;

      label: string;
      placeholder: string;
    }
  | {
      type: "inputCheckbox";
      id: string;

      checked: boolean;
      label: string;
    }
  | {
      type: "inputRadio";
      id: string;

      checked?: boolean;
      label: string;
      name: string;
      value: string | number;

      src?: string;
      alt?: string;
    }
  | {
      type: "inputFile";
      id: string;

      accepted: string;

      change: (e: Event) => void;
    }
  | {
      // I'm so confused
      type: "toggle"; // ???
      id: string;

      title: string;
      string: string[];

      change: (e: Event) => void;
    }
  | {
      type: "dropdown";
      id: string;

      change: (e: Event) => void;
      data: { id: string; name: string }[];
      label: string;
    }
  | {
      // ????
      type: "canvas";
      id: string;
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
