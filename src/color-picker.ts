import { html, css, LitElement } from "lit";
import { PaletteColourType } from "./Palette";
import {
  customElement,
  property,
  state,
} from "lit/decorators.js";
import "toolcool-color-picker";
import type ToolCoolColorPicker from "toolcool-color-picker";

@customElement("color-picker")
export class ColorPicker extends LitElement {
  static get styles() {
    return css`
      .paletteButton {
        background: var(--colour);
        width: 1.5rem;
        height: 1.5rem;
        display: flex;
        position: relative;
        cursor: pointer;
      }

      .paletteButton .half {
        position: absolute;
        inset: 0;
        overflow: hidden;
      }

      .paletteButton .half::before {
        content: "";
        position: absolute;
        inset: 0;
        background: var(--colour);
        transform: rotate(45deg) translate(50%) scaleY(2);
      }

      .wrapper {
        position: relative;
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
      }

      .container {
        position: absolute;
        top: 100%;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 1;
        background: var(--overlay-colour);
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      .hide {
        display: none;
      }

      toolcool-color-picker {
        /* button */
        --tool-cool-color-picker-btn-bg: #0000;
        --tool-cool-color-picker-btn-border-color: #000;
        --tool-cool-color-picker-btn-border-color-inner: #363636;
        --tool-cool-color-picker-btn-border-radius: 0rem;
        --tool-cool-color-picker-btn-border-radius-inner: 0rem;
      }
    `;
  }

  private onUpdate = () => {
    // no passing object for you haha it's easier this way
    this.dispatchEvent(
      new CustomEvent("change")
    );
  };

  @property({ type: Object })
  palette: PaletteColourType = {
    name: "undefined",
    r: 0,
    g: 0,
    b: 0,
    a: 255,
    count: 0,
    brushed: false,
    plastic: false,
    shiny: false,
    color: "#000000",
  };

  @state()
  show: boolean = false;

  updateStuff() {
    this.onUpdate();
    this.requestUpdate();
  }

  changeColor(r: number, g: number, b: number, a: number) {
    const c = this.palette;
    a = Math.round(a * 255);
    r = Math.round(r);
    g = Math.round(g);
    b = Math.round(b);
    if (c.r === r && c.g === g && c.b === b && c.a === a) return;
    c.r = r;
    c.g = g;
    c.b = b;
    c.a = a;
    c.color = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
    this.updateStuff();
  }

  onChangeColor(e: CustomEvent) {
    this.changeColor(
      e.detail.color.r,
      e.detail.color.g,
      e.detail.color.b,
      e.detail.color.a
    );
  }

  onChangeName(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    this.palette.name = target.value;
    this.updateStuff();
  }

  onChangeBrush(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    this.palette.brushed = target.checked;
    this.updateStuff();
  }

  onChangePlastic(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    this.palette.plastic = target.checked;
    this.updateStuff();
  }

  onChangeShiny(e: InputEvent) {
    const target = e.target as HTMLInputElement;
    this.palette.shiny = target.checked;
    this.updateStuff();
  }

  toggle() {
    this.show = !this.show;
  }

  render() {
    return html`
      <div class="wrapper">
        <button
          @click=${this.toggle}
          class="paletteButton"
          style="--colour: ${this.palette.color}"
        >
          <span
            class="half"
            style="--colour: ${`rgb(${this.palette.r}, ${this.palette.g}, ${this.palette.b})`}"
          ></span>
        </button>
        <div class="container ${this.show ? "show" : "hide"}">
          <toolcool-color-picker
            @change=${this.onChangeColor}
            color=${this.palette.color}
          ></toolcool-color-picker>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "color-picker": ColorPicker;
    "toolcool-color-picker": ToolCoolColorPicker;
  }
}
