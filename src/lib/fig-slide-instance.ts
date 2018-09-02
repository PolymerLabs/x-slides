// These imports register languages with rainbow
import '@justinfagnani/rainbow/lib/language/python.js';
import '@justinfagnani/rainbow/lib/language/html.js';
import '@justinfagnani/rainbow/lib/language/css.js';
import '@justinfagnani/rainbow/lib/language/javascript.js';

import {color} from '@justinfagnani/rainbow';
import {LitElement} from '@polymer/lit-element';

import {customElement} from './decorators.js';

/**
 * Used to create an empty ShadowRoot to render a slide into.
 */
@customElement('fig-slide-instance')
export abstract class FigSlideInstanceElement extends LitElement {
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
