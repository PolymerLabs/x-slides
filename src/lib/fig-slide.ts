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
import {TemplateResult} from 'lit-html';

import {customElement} from './decorators.js';
import {createFigTemplate, FigTemplate} from './fig-template.js';
import {FigThemeElement} from './fig-theme.js';
import {FigViewerElement} from './fig-viewer.js';

@customElement('fig-slide')
export class FigSlideElement extends LitElement {
  width: number = 1920;
  height: number = 1080;

  @property() step: number = 0;

  @property({attribute : 'name', reflect: true}) name?: string;

  @property({attribute : 'layout', reflect: true}) layoutName?: string;

  private get _template(): HTMLTemplateElement|null {
    return this.querySelector('template');
  }

  _figTemplate?: FigTemplate;

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
    this._figTemplate = createFigTemplate(template, theme, layout);
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

  renderSlide(): TemplateResult|undefined {
    console.log('renderSlide', this._figTemplate);
    if (this._figTemplate !== undefined) {
      const i = new (this._figTemplate)()
      return i.render();
    }
  }

  next(): boolean { return false; }
}
