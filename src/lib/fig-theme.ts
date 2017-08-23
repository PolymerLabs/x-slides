/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at http:polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at http:polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at http:polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at http:polymer.github.io/PATENTS.txt
 */
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
