// These imports register languages with rainbow
import '@justinfagnani/rainbow/lib/language/python.js';
import '@justinfagnani/rainbow/lib/language/html.js';
import '@justinfagnani/rainbow/lib/language/css.js';
import '@justinfagnani/rainbow/lib/language/javascript.js';

import {color} from '@justinfagnani/rainbow';
import {html, LitElement, property} from '@polymer/lit-element';

import {customElement} from './decorators.js';

/**
 * Used to create an empty ShadowRoot to render a slide into.
 */
@customElement('fig-slide-instance')
export abstract class FigSlideInstanceElement extends LitElement {
  @property() step: number = 0;

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
  // writing the update() override signature is a little annoying without
  // PropertyKey
  async update(changedProperties: Map<string, unknown>) {
    super.update(changedProperties);
    await color(this.shadowRoot!);
  }

  async firstRendered() {
    await color(this.shadowRoot!);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'fig-slide-instance': FigSlideInstanceElement;
  }
}
