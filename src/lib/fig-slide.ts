import {html, TemplateResult} from '../../lit-html/lib/lit-html.js';

import {customElement, FigElement, property} from './fig-element.js';
import {FigThemeElement} from './fig-theme.js';

@customElement('fig-slide')
export class FigSlideElement extends FigElement {
  width: number = 1920;
  height: number = 1080;

  @property
  layout: string;

  private get _template(): HTMLTemplateElement|null {
    return this.querySelector('template');
  }

  private _templateFunction: (h: typeof html, layout?: TemplateResult) => TemplateResult;

  connectedCallback() {
    const template = this._template;
    if (template === null) {
      return;
    }
    console.log(template.innerHTML.indexOf('$'));
    // TODO: better encoding/decoding!
    const decodedTemplate = template.innerHTML
        .replace(/&amp;/g, '&')
        // .replace(/</g, '&lt;')
        .replace(/\\/g, '\\\\')
        .replace(/\\\$/g, '\$')
        .replace(/\`/g, '\\`');
    console.log(decodedTemplate);
    const templateContent = `return html\`${decodedTemplate}\`;`;
    this._templateFunction = new Function('html', 'layout', templateContent) as () => TemplateResult;
  }

  render() {
    return html`
      <style>
        :host {
          display: none;
        }
      </style>
    `;
  }

  renderSlide(theme?: FigThemeElement): TemplateResult|undefined {
    const layoutName = this.getAttribute('layout');
    if (this._templateFunction === undefined) {
      return;
    }
    let layout;
    if (theme && layoutName) {
      layout = theme.getLayout(layoutName);
    }
    return this._templateFunction(html, layout && layout.renderSlide(theme));
  }
}
