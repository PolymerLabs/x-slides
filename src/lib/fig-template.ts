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

// Given an HTML template, convert it into a lit-html template function
import {html, TemplateResult} from 'lit-html';

import {FigSlideElement} from './fig-slide';
import {FigThemeElement} from './fig-theme';

export interface FigTemplate {
  (): TemplateResult;
  [name: string]: () => TemplateResult
}

/**
 * Parses an HTML template with special declarative lit-html <template>s
 *
 * <template directive="{{expr}}" parameters="{{expr}}">...</template>
 *
 * @param element
 */
export function createFigTemplate(element: HTMLTemplateElement,
                                  theme?: FigThemeElement,
                                  layout?: FigSlideElement): FigTemplate {
  console.log('createFigTemplate', theme, layout);
  // Convert <template> to closures
  const walker = document.createTreeWalker(
      element.content, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);

  const blocks: any = {};

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (isDirective(node)) {
      let directive = node.getAttribute('directive')!;

      const parametersAttr = node.getAttribute('parameters');
      const parameters =
          parametersAttr !== null ? parametersAttr.split(' ') : [];
      const directiveTemplate =
          `(${parameters.join(', ')}) => ${createFigTemplate(node, theme, layout)}`;

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
      const blockTemplate = createFigTemplate(node, theme, layout);
      blocks[name] = blockTemplate;
      node.remove();
    }
  }
  const decodedTemplate = element.innerHTML.replace(/&amp;/g, '&')
                              .replace(/&gt;/g, '>')
                              .replace(/&lt;/g, '<');

  const templateFunction = new Function('html', 'theme', 'layout',
                                        `return html\`${decodedTemplate}\`;`);
  const figTemplate =
      (() => {
        return templateFunction(html, theme, layout && layout._figTemplate);
      }) as FigTemplate;
  Object.assign(figTemplate, blocks);
  return figTemplate;
}

// export function createFigTemplate(element: HTMLTemplateElement,
//                                   vars: string[]): FigTemplate {
//   const templateContent = parseFigTemplate(element);
//   const templateFunction =
//       new Function('_lit_html_tag_', ...vars, `
//         console.log('templateFunction called');
//         return ${templateContent};
//       `);
//   console.log('templateFunction', templateFunction);

//   return (scope: any) => {
//     const args = vars.map((arg) => scope[arg]);
//     return templateFunction(html, ...args);
//   }
// }

const isDirective = (node: Node): node is HTMLTemplateElement =>
    node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'TEMPLATE' &&
    (node as Element).hasAttribute('directive');

const isBlock = (node: Node): node is HTMLTemplateElement =>
    node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'TEMPLATE' &&
    (node as Element).hasAttribute('block');
