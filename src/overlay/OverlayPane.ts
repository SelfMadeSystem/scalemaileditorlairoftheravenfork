import { imagePath } from "../ImageLoader";
import { OverlayObject } from "./OverlayObject";

export class OverlayPane {
  public objects: OverlayObject[] = [];

  public addObject(object: OverlayObject) {
    this.objects.push(object);
  }
}

export function makeOverlayPane(
  pane: OverlayPane,
  isPane = true
): HTMLDivElement {
  const outerDiv = document.createElement("div");
  let innerDiv = outerDiv;
  if (isPane) {
    outerDiv.classList.add("overlayPane");
    const newDiv = document.createElement("div");
    newDiv.classList.add("htmlArea");
    outerDiv.append(newDiv);
    innerDiv = newDiv;
  } else {
    outerDiv.classList.add("overlayPane", "bar");
  }

  // Create Objects
  for (const object of pane.objects) {
    // Write HTML
    switch (object.type) {
      case "anchor": {
        const a = document.createElement("a");
        a.href = object.url;
        a.textContent = object.string;
        innerDiv.append(a);
        break;
      }

      case "brick": {
        const a = document.createElement("a");
        a.href = object.url;

        const div = document.createElement("div");
        div.classList.add("areaBrick", "backgroundTheme", "cursorPointer");
        const img = document.createElement("img");
        img.src = imagePath + object.src; // no `+ ".png"` for some reason
        img.alt = object.title ?? "";
        div.append(img);
        const p = document.createElement("p");
        p.textContent = object.title;
        div.append(p);
        a.append(div);
        innerDiv.append(a);
        break;
      }

      case "button": {
        const button = document.createElement("button");
        button.classList.add("overlayButton");
        button.addEventListener("click", object.click);

        if (object.src !== undefined) {
          const img = document.createElement("img");
          img.src = imagePath + object.src + ".png";
          img.alt = object.title ?? "";
          button.append(img);
        }

        const p = document.createElement("p");
        p.textContent = object.title;
        button.append(p);

        innerDiv.append(button);

        break;
      }

      case "canvas": {
        const canvas = document.createElement("canvas");
        canvas.id = object.id;
        canvas.classList.add("overlayCanvas");
        innerDiv.append(canvas);
        break;
      }

      case "dropdown": {
        const div = document.createElement("div");
        div.classList.add("inputDIV");

        const label = document.createElement("label");
        label.textContent = object.label;
        label.htmlFor = object.id;
        div.append(label);

        const select = document.createElement("select");
        select.id = object.id;
        select.addEventListener("change", object.change);
        div.append(select);

        for (let n = 0; n < object.data.length; n++) {
          const option = document.createElement("option");
          option.value = n.toString();
          option.textContent = object.data[n].name;
          select.append(option);
        }

        innerDiv.append(div);
        break;
      }

      case "inputButton": {
        const button = document.createElement("button");
        button.classList.add("overlayButton");
        button.addEventListener("click", object.click);
        if (object.id) button.id = object.id;
        button.textContent = object.value;
        innerDiv.append(button);
        break;
      }

      case "inputCheckbox": {
        const div = document.createElement("div");
        div.classList.add("inputDIV");

        const label = document.createElement("label");
        label.textContent = object.label;
        label.htmlFor = object.id;
        div.append(label);

        const input = document.createElement("input");
        input.id = object.id;
        input.type = "checkbox";
        input.checked = object.checked;
        // no events
        div.append(input);

        innerDiv.append(div);
        break;
      }

      case "inputFile": {
        // content += "<div class='inputDIV'>";
        // content +=
        //   "<label for='" + object.id + "'>" + object.label + "</label>";
        // content +=
        //   "<input id='" +
        //   object.id +
        //   "' type='file' accept='" +
        //   object.accepted +
        //   "' " +
        //   xClick +
        //   xChange +
        //   xHover +
        //   "/>";
        // content += "</div>";

        const div = document.createElement("div");
        div.classList.add("inputDIV");

        // const label = document.createElement("label");
        // label.textContent = object.label;
        // label.htmlFor = object.id;
        // div.append(label);

        const input = document.createElement("input");
        input.id = object.id;
        input.type = "file";
        input.accept = object.accepted;
        input.addEventListener("change", object.change);
        div.append(input);

        innerDiv.append(div);
        break;
      }

      case "inputRadio": {
        // if (object.src) {
        //   tmp =
        //     "<img src='" +
        //     imagePath +
        //     object.src +
        //     "' alt='" +
        //     object.alt +
        //     "' />";
        //   c = "hidden";
        // } else {
        //   tmp = object.label;
        //   c = "";
        // }

        // tmp = "<label for='" + object.id + "'>" + tmp + "</label>";

        // if (object.checked) {
        //   n = "checked ";
        // } else {
        //   n = "";
        // }

        // content += "<div class='inputDIV'>";
        // if (!object.src) {
        //   content += tmp;
        // }

        // content +=
        //   "<input id='" +
        //   object.id +
        //   "' type='radio' " +
        //   n +
        //   "class='" +
        //   c +
        //   "' name='" +
        //   object.name +
        //   "' value='" +
        //   object.value +
        //   "' " +
        //   xClick +
        //   xChange +
        //   xHover +
        //   "/>";

        // if (object.src !== false) {
        //   content += tmp;
        // }

        // content += "</div>";

        const div = document.createElement("div");
        div.classList.add("inputDIV");

        const input = document.createElement("input");
        input.id = object.id;
        input.type = "radio";
        input.name = object.name;
        input.value = object.value.toString();

        if (object.src) {
          input.classList.add("hidden");
        }

        if (object.checked) {
          input.checked = true;
        }
        div.appendChild(input);

        const label = document.createElement("label");
        label.setAttribute("for", object.id);

        if (object.src) {
          const img = document.createElement("img");
          img.src = imagePath + object.src;
          img.alt = object.alt ?? "";
          label.append(img);
        } else {
          label.textContent = object.label;
        }

        div.appendChild(label);

        innerDiv.append(div);
        break;
      }

      case "inputNumber": {
        const div = document.createElement("div");
        div.classList.add("inputDIV");

        const label = document.createElement("label");
        label.setAttribute("for", object.id);
        label.textContent = object.label;
        div.appendChild(label);

        const input = document.createElement("input");
        input.id = object.id;
        input.type = "number";
        if (object.minValue) input.min = object.minValue.toString();
        if (object.maxValue) input.max = object.maxValue.toString();
        if (object.increment) input.step = object.increment.toString();
        if (object.value) input.value = object.value.toString();

        if (object.change) {
          input.addEventListener("change", object.change);
        }

        div.appendChild(input);
        innerDiv.append(div);
        break;
      }

      case "inputPassword": {
        const div = document.createElement("div");
        div.classList.add("inputDIV");

        const label = document.createElement("label");
        label.setAttribute("for", object.id);
        label.textContent = object.label;
        div.appendChild(label);

        const input = document.createElement("input");
        input.id = object.id;
        input.type = "password";
        input.placeholder = object.placeholder;

        div.appendChild(input);
        innerDiv.append(div);
        break;
      }

      case "inputText": {
        const div = document.createElement("div");
        div.classList.add("inputDIV");

        const label = document.createElement("label");
        label.setAttribute("for", object.id);
        label.textContent = object.label;
        div.appendChild(label);

        const input = document.createElement("input");
        input.id = object.id;
        input.placeholder = object.placeholder;

        div.appendChild(input);
        innerDiv.append(div);
        break;
      }

      case "inputWrapper":
        // TODO: Definitely remove this
        if (object.state === 1) {
          const div = document.createElement("div");
          div.classList.add("inputWrapper");
          innerDiv.append(div);
          innerDiv = div;
        } else {
          innerDiv = innerDiv.parentElement as HTMLDivElement;
        }
        break;

      case "text": {
        if (object.title) {
          const titleNode = document.createElement("h2");
          titleNode.textContent = object.title;

          innerDiv.appendChild(titleNode);
        }

        if (typeof object.string == "string") {
          const textNode = document.createElement("p");
          textNode.textContent = object.string;

          innerDiv.appendChild(textNode);
        } else if (Array.isArray(object.string)) {
          for (let c = 0; c < object.string.length; c++) {
            const textNode = document.createElement("p");
            textNode.textContent = object.string[c];

            innerDiv.appendChild(textNode);
          }
        }

        break;
      }

      case "toggle": {
        const h2 = document.createElement("h2");
        h2.textContent = object.title;
        innerDiv.appendChild(h2);

        const pl = document.createElement("p");
        pl.classList.add("toggleText", "left");
        pl.textContent = object.string[0];
        innerDiv.appendChild(pl);

        const toggle = document.createElement("label");
        toggle.classList.add("toggle");

        const input = document.createElement("input");
        input.id = object.id;
        input.type = "checkbox";
        input.onchange = object.change;
        toggle.appendChild(input);

        const div = document.createElement("div");
        div.classList.add("slider");
        toggle.appendChild(div);
        innerDiv.appendChild(toggle);

        const pr = document.createElement("p");
        pr.classList.add("toggleText", "right");
        pr.textContent = object.string[1];
        innerDiv.appendChild(pr);
        break;
      }

      default:
        console.log("Unhandled object: " + object);
        break;
    }
  }

  return outerDiv;
}
