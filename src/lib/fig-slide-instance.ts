import {html, LitElement, property} from '@polymer/lit-element';

import {customElement, query} from './decorators.js';
import {color} from '@justinfagnani/rainbow';

/**
 * Used to create an empty ShadowRoot to render a slide into.
 */
@customElement('fig-slide-instance')
export abstract class FigSlideInstanceElement extends LitElement {

  // writing the update() override signature is a little annoying without
  // PropertyKey
  async update(changedProperties: Map<string, unknown>) {
    super.update(changedProperties);
    await color(this.shadowRoot);
    // const codeBlocks = this.shadowRoot!.querySelectorAll('pre');
    // await Promise.all(Array.from(codeBlocks).map((b) => color(b)));
  }
}
