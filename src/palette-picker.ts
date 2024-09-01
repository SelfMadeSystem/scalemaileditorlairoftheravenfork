import { html, css, LitElement } from "lit";
import { ColourPalette, PaletteColour } from "./Palette";
import { TemplateSwatches } from "./TemplateSwatches";
import { Swatch } from "./Swatch";
import { customElement, property } from "lit/decorators.js";
import "toolcool-color-picker";
import type ColorPicker from "toolcool-color-picker";

function rgbaToHex(r: number, g: number, b: number, a: number) {
  if (a === 255) {
    return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
  } else {
    return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}${a
      .toString(16)
      .padStart(2, "0")}`;
  }
}

@customElement("palette-picker")
export class PalettePicker extends LitElement {
  static get styles() {
    return css`
      .container {
        position: absolute;
        inset: 0;
        z-index: 1;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
      }

      .hide {
        display: none;
      }

      .bg {
        position: absolute;
        inset: 0;
        z-index: -1;
        background: #000;
        opacity: 0.5;
        cursor: pointer;
      }

      .palette {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
      }

      .palette-container {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        gap: 10px;
        padding: 10px;
        max-width: 50%;
        background: #363636;
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

  constructor(
    public palette: ColourPalette,
    public swatches: TemplateSwatches,
    public onUpdate: () => void
  ) {
    super();
  }

  @property({ type: Boolean })
  show: boolean = false;

  createPalette() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const random = "#" + r.toString(16) + g.toString(16) + b.toString(16);
    this.palette.addColour(new PaletteColour(random, r, g, b, 255));
    this.swatches.scaleSwatches.push(new Swatch());
    this.swatches.generateScaleSwatches();

    this.onUpdate();
  }

  changeColor(i: number, r: number, g: number, b: number, a: number) {
    const c = this.palette.colours[i];
    a = Math.round(a * 255);
    if (c.r === r && c.g === g && c.b === b && c.a === a) return;
    c.r = r;
    c.g = g;
    c.b = b;
    c.a = a;
    c.color = `rgba(${r}, ${g}, ${b}, ${a / 255})`;
    c.name = rgbaToHex(r, g, b, a);
    this.onUpdate();
  }

  onChangeColor(e: CustomEvent, i: number) {
    this.changeColor(
      i,
      e.detail.color.r,
      e.detail.color.g,
      e.detail.color.b,
      e.detail.color.a
    );
  }

  toggle() {
    this.show = !this.show;
  }

  firstUpdated() {
    // Wait for the palette-picker component to be rendered
    this.updateComplete.then(() => {
      // Select all toolcool-color-picker elements
      const colorPickers = this.shadowRoot!.querySelectorAll('toolcool-color-picker');
      colorPickers.forEach((picker, i) => {
        const button = picker.shadowRoot!.querySelector('button');
        
        button!.title = this.palette.colours[i + 2].name;
      });
    });
  }

  render() {
    return html`
      <div class="container ${this.show ? "show" : "hide"}">
        <div class="bg" @click=${() => this.toggle()}></div>
        <div class="palette-container">
          <div class="palette">
            ${this.palette.colours.slice(2).map(
              (colour: PaletteColour, i: number) => html`
                <toolcool-color-picker
                  @change=${(e: CustomEvent) => this.onChangeColor(e, i + 2)}
                  color=${colour.color}
                  button-width="30px"
                  button-height="30px"
                  button-padding="0px"
                ></toolcool-color-picker>
              `
            )}
          </div>
          <button @click=${() => (this.createPalette(), this.requestUpdate())}>
            Add Colour
          </button>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "palette-picker": PalettePicker;
    "toolcool-color-picker": ColorPicker;
  }
}
