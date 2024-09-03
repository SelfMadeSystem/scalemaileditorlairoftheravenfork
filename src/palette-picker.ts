import { html, LitElement } from "lit";
import { ColourPalette, PaletteColour } from "./Palette";
import { TemplateSwatches } from "./TemplateSwatches";
import { Swatch } from "./Swatch";
import { customElement, state } from "lit/decorators.js";
import "./color-picker";

@customElement("palette-picker")
export class PalettePicker extends LitElement {
  constructor(
    public palette: ColourPalette,
    public swatches: TemplateSwatches,
    public onUpdate: () => void
  ) {
    super();
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  @state()
  show: boolean = false;

  createPalette() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    const random = "#" + r.toString(16) + g.toString(16) + b.toString(16);
    this.palette.addColour(new PaletteColour(random, r, g, b, 255));
    this.swatches.scaleSwatches.push(new Swatch());
    this.updateStuff();
  }

  updateStuff() {
    this.swatches.generateScaleSwatches();
    this.onUpdate();
  }

  onChangeColor(_e: CustomEvent, _i: number) {
    this.updateStuff();
  }

  toggle() {
    this.show = !this.show;
  }

  render() {
    if (!this.show) {
      return html``;
    }
    return html`
      <div class="container">
        <div class="bg" @click=${() => this.toggle()}></div>
        <div class="palette-container">
          <div class="palette">
            ${this.palette.colours
              .slice(2)
              .map(
                (colour: PaletteColour, i: number) => html`
                  <color-picker .palette=${colour} @change=${(e: CustomEvent) => this.onChangeColor(e, i + 2)}></color-picker>
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
  }
}
