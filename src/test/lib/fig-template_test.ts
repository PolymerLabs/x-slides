
import {html, render} from 'lit-html';
import {repeat} from 'lit-html/directives/repeat';

import {createFigTemplate} from '../../lib/fig-template.js';
import {stripExpressionMarkers} from '../strip-markers.js';

/// <reference path="../../../node_modules/@types/mocha/index.d.ts" />
/// <reference path="../../../node_modules/@types/chai/index.d.ts" />

const assert = chai.assert;

suite('fig-template', () => {
  let container: HTMLDivElement;
  let templateElement: HTMLTemplateElement;

  setup(() => {
    container = document.createElement('div');
    templateElement = document.createElement('template');
  })

  test('create a simple template', () => {
    templateElement.innerHTML = `<div>\${data.foo}</div>`;
    const templateFunction = createFigTemplate(templateElement, [ 'data' ]);
    const scope = {data : {foo : 'foo'}};
    render(templateFunction(scope), container);
    assert.equal(stripExpressionMarkers(container.innerHTML), '<div>foo</div>');
  });

  test('nested template', () => {
    templateElement.innerHTML = `
      <div>
        <template directive="repeat(data.items, $this)" parameters="item">
          \${item}
        </template>
      </div>`;
    const templateFunction =
        createFigTemplate(templateElement, [ 'data', 'repeat' ]);
    const scope = {
      data : {
        items : [ 'foo', 'bar' ],
      },
      repeat : repeat,
    };
    render(templateFunction(scope), container);
    assert.equal(stripExpressionMarkers(container.innerHTML), `
      <div>
        
          foo
        
          bar
        
      </div>`);
  });

  test.only('template references', () => {
    templateElement.innerHTML =
        `<template directive="block(foo, $this)"></template>`;
    // const call = (f: Function, ...args: any[]) => f.apply(undefined, args);
    const block = (f: Function, $this: any) => {
      console.log('block', f, $this);
      if (f === undefined) {
        return $this;
      } else if (typeof f === 'function') {
        return f();
      } else {
        return f;
      }
    };
    const foo = () => html`<h1>foo</h1>`;
    const templateFunction =
        createFigTemplate(templateElement, [ 'block', 'foo' ]);
    const scope = {
      block,
      foo,
    };
    render(templateFunction(scope), container);
    console.log(container.innerHTML);
    // assert.equal(container.innerHTML, '<div>foobar</div>');
  });
});
