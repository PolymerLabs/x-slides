import {html, LitElement, property} from '@polymer/lit-element';

import {customElement} from './decorators.js';
import {FigSlideElement} from './fig-slide.js';

@customElement('fig-theme')
export class FigThemeElement extends LitElement {

  static themes = new Map<string, FigThemeElement>();

  @property({attribute : 'name', reflect: true}) name?: string;

  get theme() {
    console.log('A');
    return this;
  }

  connectedCallback() {
    super.connectedCallback();
    if (this.name !== undefined) {
      FigThemeElement.themes.set(this.name, this);
    }
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

  /**
   * A layout is a named slide in a theme. aka a "master" slide.
   *
   * @param name
   */
  getLayout(name: string): FigSlideElement|undefined {
    const template =
        this.querySelector(`fig-slide[name=${name}]`) as FigSlideElement;
    if (!template) {
      console.warn(`no layout ${name} in theme ${this.name}`);
    }
    return template === null ? undefined : template;
  }
}
