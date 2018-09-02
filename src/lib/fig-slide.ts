/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */

import {html, LitElement, property} from '@polymer/lit-element';

import {customElement} from './decorators.js';
import {createFigTemplateClass, FigTemplate} from './fig-template.js';
import {FigThemeElement} from './fig-theme.js';
import { FigSlideInstanceElement } from './fig-slide-instance.js';

let slideCount = 0;

@customElement('fig-slide')
export class FigSlideElement extends LitElement {
  width: number = 1920;
  height: number = 1080;

  @property() step: number = 0;

  @property({attribute : 'name', reflect: true})
  name?: string;

  @property({attribute : 'layout', reflect: true})
  layoutName?: string;

  private get _template(): HTMLTemplateElement|null {
    return this.querySelector('template');
  }

  _figTemplateClass?: FigTemplate;

  connectedCallback() {
    super.connectedCallback();
    // Get the slide template from the child content and compile it into a
    // lit-html template function.
    const template = this._template;
    if (template === null) {
      return;
    }
    const theme: FigThemeElement =
        (this.parentElement instanceof FigThemeElement)
            ? this.parentElement
            : (this.parentElement as any).theme;
    const layout = (theme !== undefined && this.layoutName)
                       ? theme.getLayout(this.layoutName)
                       : undefined;
    this._figTemplateClass = createFigTemplateClass(this, template, theme, layout);
    const tagName = `fig-slide-instance-${slideCount++}`;
    customElements.define(tagName, this._figTemplateClass);
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

  createInstance(): FigSlideInstanceElement|undefined {
    if (this._figTemplateClass !== undefined) {
      return new (this._figTemplateClass)()
    }
  }

  next(): boolean { return false; }
}

declare global {
  interface HTMLElementTagNameMap {
    'fig-slide': FigSlideElement;
  }
}
