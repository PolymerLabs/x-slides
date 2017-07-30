import {html} from '../../lit-html/lib/lit-html.js';

import {customElement, FigElement, property} from './fig-element.js';
import {FigSlideElement} from './fig-slide.js';

@customElement('fig-theme')
export class FigThemeElement extends FigElement {
  @property
  name: string;

  render() {
    return html`
      <style>
        :host {
          display: none;
        }
      </style>
    `;
  }

  getLayout(name: string): FigSlideElement|undefined {
    const template = this.querySelector(`fig-slide[name=${name}]`) as FigSlideElement;
    if (!template) {
      console.warn('no layout', name);
    }
    return template || undefined;
  }
}
