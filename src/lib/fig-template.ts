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

export interface FigTemplate {
  new(): FigSlide;
}

export abstract class FigSlide {
  abstract render(): TemplateResult;
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
  // console.log('createFigTemplate', theme, layout);
  // Convert <template> to closures
  const walker = document.createTreeWalker(
      element.content, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);

  const blocks: any[] = [];

  while (walker.nextNode()) {
    const node = walker.currentNode;
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
  const decodedTemplate = element.innerHTML.replace(/&amp;/g, '&')
                              .replace(/&gt;/g, '>')
                              .replace(/&lt;/g, '<');
  return {
    render: decodedTemplate,
    blocks,
  };
}

export function createFigTemplate(element: HTMLTemplateElement,
  theme?: FigThemeElement,
  layout?: FigSlideElement): FigTemplate {
  const t = parseFigTemplate(element, theme, layout);

  const templateFunction = new Function('html', '$BaseClass', `
    return class extends $BaseClass {
      render() {
        return html\`${t.render}\`;
      }
      ${t.blocks.map(({name, blockTemplate}) => `
        ${name}() {
          return html\`${blockTemplate.render}\`;
        }
      `)}
    }
  `);
  const baseClass = layout === undefined ? FigSlide : layout._figTemplate;
  const figTemplate = templateFunction(html, baseClass);
  return figTemplate;
}

const isDirective = (node: Node): node is HTMLTemplateElement =>
    node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'TEMPLATE' &&
    (node as Element).hasAttribute('directive');

const isBlock = (node: Node): node is HTMLTemplateElement =>
    node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'TEMPLATE' &&
    (node as Element).hasAttribute('block');
