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
import {FigSlideInstanceElement} from './fig-slide-instance';
import {FigThemeElement} from './fig-theme';

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
function parseFigTemplate(
    element: HTMLTemplateElement, theme?: FigThemeElement,
    layout?: FigSlideElement) {
  const blocks = new Map < string | null, {
    node: HTMLTemplateElement;
    parameters: string[],
  }
  > ();

  const parseBlock = (node: HTMLTemplateElement) => {
    let name = node.getAttribute('block');
    if (blocks.has(name)) {
      console.error(`Duplicate block name: ${name}`);
    }
    const parametersAttr = node.getAttribute('parameters');
    const parameters = parametersAttr !== null ? parametersAttr.split(' ') : [];

    const walker = document.createTreeWalker(
        element.content, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (isBlock(node)) {
        parseBlock(node);
        node.remove();
      } else if (isDirective(node)) {
        parseDirective(node);
      }
    }
    // const blockTemplate = parseFigTemplate(node, theme, layout);
    blocks.set(name, {node, parameters});
  };

  const parseDirective = (node: HTMLTemplateElement) => {
    let directiveExpr = node.getAttribute('directive')!;
    const parametersAttr = node.getAttribute('parameters');
    const parameters = parametersAttr !== null ? parametersAttr.split(' ') : [];

    const walker = document.createTreeWalker(
        element.content, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);

    while (walker.nextNode()) {
      if (isDirective(node)) {
        parseDirective(node);
        node.remove();
      }
    }

    const directiveTemplate = `(${parameters.join(', ')}) => ${node.innerHTML}`;

    // Replace references to `$this` in the directive expression
    // with the directiveTemplate closure
    directiveExpr = directiveExpr.replace('$this', directiveTemplate);

    // Replace the <template> with a lit-html expression
    node.parentNode!.replaceChild(new Text(`\${${directiveExpr}}`), node);
  };

  parseBlock(element);
  return blocks;
}

/**
 * Creates a subclass of FigSlide
 */
export function createFigTemplateClass(
    slideDefinition: FigSlideElement, element: HTMLTemplateElement,
    theme?: FigThemeElement, layout?: FigSlideElement): FigTemplate {
  const blocks = parseFigTemplate(element, theme, layout);
  const defaultBlock = blocks.get(null);

  const propertiesAttr = slideDefinition.getAttribute('properties');
  const properties = propertiesAttr === null ? [] : propertiesAttr.split(' ');
  const templateSource = `
    return class extends $BaseClass {
      static get properties() {
        return {
          ${properties.map((p) => `${p}: {},`)}
        };
      }

      ${
      defaultBlock ? `renderDefault() {
        return html\`${defaultBlock.node.innerHTML}\`;
      }` :
                     ''}

      ${
      Array.from(blocks.entries())
          .filter(([name]) => name !== null)
          .map(([name, block]) => `
        ${name}() {
          return html\`${block.node.innerHTML}\`;
        }
      `)}
    }
    `;
  console.log(templateSource);
  const templateFunction = new Function('html', '$BaseClass', templateSource);
  const baseClass =
      layout === undefined ? FigSlideInstanceElement : layout._figTemplateClass;
  const figTemplate = templateFunction(html, baseClass);
  return figTemplate;
}

const isDirective = (node: Node): node is HTMLTemplateElement =>
    node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'TEMPLATE' &&
    (node as Element).hasAttribute('directive');

const isBlock = (node: Node): node is HTMLTemplateElement =>
    node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'TEMPLATE' &&
    (node as Element).hasAttribute('block');
