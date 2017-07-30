import { render } from '../../lit-html/lib/labs/lit-extended.js';
import { TemplateResult } from '../../lit-html/lib/lit-html.js';

export type Constructor<T> = {new(...args: any[]): T};

const renderPromise = Promise.resolve();

function scheduleRender(renderable: FigElement) {
  renderPromise.then(() => {
    doRender(renderable);
  });
}

function doRender(renderable: FigElement) {
  renderable.needsRender = false;
  try {
    return renderable.renderCallback();
  } catch (e) {
    console.warn('error rendering', renderable['tagName']);
    console.error(e);
  }
  return;
}

export class FigElement extends HTMLElement {

  static observers: Map<string, Function[]>;

  needsRender: boolean;

  constructor() {
    super();
    this.attachShadow({mode: 'open'});
    this.needsRender = false;
    this.invalidate();
  }

  invalidate() {
    if (!this.needsRender) {
      this.needsRender = true;
      scheduleRender(this);
    }
  }

  renderCallback() {
    render(this.render(), this.shadowRoot!);
    if ('onRender' in this) {
      (this as any).onRender();
    }
  }

  /**
   * Subclasses must implement this to render their element.
   */
  render(): TemplateResult {
    throw new Error('unimplemented');
  }
}

/**
 * Property decorator applied that sets up accessors that trigger rendering.
 */
export function property(clazz: any, propName: string): any {
  const storageProp = Symbol(propName);
  return {
    configurable: true,
    enumerable: true,

    get(this: FigElement) {
      return (this as any)[storageProp];
    },

    set(this: FigElement, value: any) {
      const oldValue = (this as any)[storageProp];
      (this as any)[storageProp] = value;
      this.invalidate();

      // Run observers
      const observers = clazz.observers && clazz.observers.get(propName);
      if (observers !== undefined) {
        for (const observer of observers) {
          try {
            (this as any)[observer](value, oldValue);
          } catch (e) {
            console.error(e);
          }
        }
      }

    },
  };
}

/**
 * Class decorator that registers a custom element class.
 */
export const customElement = (tagName: string) => (clazz: any) => {
  window.customElements.define(tagName, clazz);
  return clazz;
};

/**
 * A property decorator factory that converts a class property into a
 * getter that executes a querySelector on the element's shadow root.
 *
 * By annotating the property with the correct type, element's can have
 * type-checked access to internal elements.
 *
 * This function must be invoked to return a decorator.
 */
export const query = _query((target: NodeSelector, selector: string) => 
    target.querySelector(selector));

/**
 * A property decorator that converts a class property into a getter
 * that executes a querySelectorAll on the element's shadow root.
 *
 * By annotating the property with the correct type, element's can have
 * type-checked access to internal elements. The type should be NodeList
 * with the correct type argument.
 *
 * This function must be invoked to return a decorator.
 */
export const queryAll = _query((target: NodeSelector, selector: string) =>
    target.querySelectorAll(selector));

function _query<T>(queryFn: (target: NodeSelector, selector: string) => T) {
  return (selector: string) => (proto: any, propName: string) => {
    Object.defineProperty(proto, propName, {
      get(this: HTMLElement) {
        return queryFn(this.shadowRoot!, selector);
      },
      enumerable: true,
      configurable: true,
    });
  };
}

export function observe(properties: string|string[]) {
  return (clazz: any, method: string): any => {

    if (!Array.isArray(properties)) {
      properties = [properties];
    }
    clazz.observers = clazz.observers || new Map();

    for (const property of properties) {
      let propObservers = clazz.observers.get(property);
      if (propObservers === undefined) {
        propObservers = [];
        clazz.observers.set(property, propObservers);
      }
      propObservers.push(method);
    }
  }
}
