// These imports register languages with rainbow
import '@justinfagnani/rainbow/lib/language/python.js';
import '@justinfagnani/rainbow/lib/language/html.js';
import '@justinfagnani/rainbow/lib/language/css.js';
import '@justinfagnani/rainbow/lib/language/javascript.js';

import {color} from '@justinfagnani/rainbow';
import {html, LitElement, property} from '@polymer/lit-element';

import {customElement} from './decorators.js';
import {FigSlideElement} from './fig-slide.js';

/**
 * Used to create an empty ShadowRoot to render a slide into.
 */
@customElement('fig-slide-instance')
export abstract class FigSlideInstanceElement extends LitElement {
  /**
   * The FigSlideElement that created this instance.
   */
  @property() slide!: FigSlideElement;

  /**
   * Current build step
   */
  @property() step: number = 0;

  /**
   * Number of build steps
   */
  get stepCount(): number {
    return this.shadowRoot!.querySelectorAll('[appear]').length;
  }

  next(): boolean {
    if (this.step < this.stepCount) {
      this.step++;
      return true;
    }
    return false;
  }

  previous(): boolean {
    if (this.step > 0) {
      this.step--;
      return true;
    }
    return false;
  }

  render() {
    return html`
      <style>
        :host {
          display: block;
          box-sizing: border-box;
          width: ${this.slide.width}px;
          height: ${this.slide.height}px;
        }
        [appear] {
          visibility: hidden;
        }
        [visible], [appear]:nth-of-type(-n+${this.step}) {
          visibility: visible;
        }
        [appear][dissappear] {
          visibility: hidden;
        }
        [dissappear]:nth-of-type(${this.step}) {
          visibility: visible;
        }
      </style>
      ${this.styles()}
      ${this.renderDefault()}
    `;
  }

  renderDefault() {}

  styles() {
    html`
      <style>
        :host {
          display: block;
          width: ${this.slide.width}px;
          height: ${this.slide.height}px;
        }
        [appear] {
          visibility: hidden;
        }
        [visible], [appear]:nth-of-type(-n+${this.step}) {
          visibility: visible;
        }
        [appear][dissappear] {
          visibility: hidden;
        }
        [dissappear]:nth-of-type(${this.step}) {
          visibility: visible;
        }
      </style>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'fig-slide-instance': FigSlideInstanceElement;
  }
}
