import {LitElement} from '@polymer/lit-element';

import {customElement} from './decorators.js';
import {color} from '@justinfagnani/rainbow';

// These imports register languages with rainbow
import '@justinfagnani/rainbow/lib/language/html.js';
import '@justinfagnani/rainbow/lib/language/css.js';
import '@justinfagnani/rainbow/lib/language/javascript.js';

/**
 * Used to create an empty ShadowRoot to render a slide into.
 */
@customElement('fig-slide-instance')
export abstract class FigSlideInstanceElement extends LitElement {

  // writing the update() override signature is a little annoying without
  // PropertyKey
  async update(changedProperties: Map<string, unknown>) {
    super.update(changedProperties);
    console.log('before Color');
    // await color(this.shadowRoot!);
    console.log('after Color');
    // const codeBlocks = this.shadowRoot!.querySelectorAll('pre');
    // await Promise.all(Array.from(codeBlocks).map((b) => color(b)));
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'fig-slide-instance': FigSlideInstanceElement;
  }
}
