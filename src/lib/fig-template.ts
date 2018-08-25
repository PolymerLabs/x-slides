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

import {html, TemplateResult} from 'lit-html';
import {FigSlideElement} from './fig-slide';
import {FigThemeElement} from './fig-theme';
import { FigSlideInstanceElement } from './fig-slide-instance';

export interface FigTemplate {
  new(): FigSlideInstanceElement;
}

/**
 * Parses an HTML template with special declarative lit-html <template>s
 *
 * <template directive="{{expr}}" parameters="{{expr}}">...</template>
 *
 * @param element
 */
function parseFigTemplate(element: HTMLTemplateElement,
                                  theme?: FigThemeElement,
                                  layout?: FigSlideElement) {
  // Convert <template> to closures
  const walker = document.createTreeWalker(
      element.content, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);

  const blocks: any[] = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;

    /**
     * Specially handle two type of <templates>:
     * 
     *  - Directives:
     * 
     *    <template directive="d(a1, a2, $this)" parameters="p1, p2">
     *    </template>
     * 
     *    This represents a call to a directive and is transformed to:
     * 
     *    ${directive(a1, a2, (p1, p2) =" html`...`")}
     * 
     *  - Blocks:
     * 
     *    <template block="name"></template>
     * 
     *    Blocks are transformed into methods on the FigSlide class.
     */
    if (isDirective(node)) {
      let directive = node.getAttribute('directive')!;

      const parametersAttr = node.getAttribute('parameters');
      const parameters =
          parametersAttr !== null ? parametersAttr.split(' ') : [];
      const directiveTemplate =
          `(${parameters.join(', ')}) => ${parseFigTemplate(node, theme, layout).render}`;

      // Replace references to `$this` in the directive expression
      // with the directiveTemplate closure
      directive = directive.replace('$this', directiveTemplate);

      // Replace the <template> with a lit-html expression
      node.parentNode!.insertBefore(new Text(`\${${directive}}`), node);
      node.remove();
    } else if (isBlock(node)) {
      const name = node.getAttribute('block')!;
      const parametersAttr = node.getAttribute('parameters');
      const parameters =
          parametersAttr !== null ? parametersAttr.split(' ') : [];
      const blockTemplate = parseFigTemplate(node, theme, layout);
      blocks.push({name, blockTemplate});
      node.remove();
    }
  }
  return {
    render: element.innerHTML,
    blocks,
  };
}

/**
 * Creates a subclass of FigSlide
 */
export function createFigTemplateClass(
  slideDefinition: FigSlideElement,
  element: HTMLTemplateElement,
  theme?: FigThemeElement,
  layout?: FigSlideElement): FigTemplate {
  const t = parseFigTemplate(element, theme, layout);

  const propertiesAttr = slideDefinition.getAttribute('properties');
  const properties = propertiesAttr === null ? [] : propertiesAttr.split(' ');
  const templateSource = `
    return class extends $BaseClass {
      static get properties() {
        return {
          ${properties.map((p) => `${p}: {},`)}
        };
      }

      render() {
        return html\`${t.render}\`;
      }

      ${t.blocks.map(({name, blockTemplate}) => `
        ${name}() {
          return html\`${blockTemplate.render}\`;
        }
      `)}
    }
    `;
  const templateFunction = new Function('html', '$BaseClass', templateSource);
  const baseClass = layout === undefined ? FigSlideInstanceElement : layout._figTemplateClass;
  const figTemplate = templateFunction(html, baseClass);
  return figTemplate;
}

const isDirective = (node: Node): node is HTMLTemplateElement =>
    node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'TEMPLATE' &&
    (node as Element).hasAttribute('directive');

const isBlock = (node: Node): node is HTMLTemplateElement =>
    node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'TEMPLATE' &&
    (node as Element).hasAttribute('block');
