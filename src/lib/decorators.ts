/**
 * Class decorator that registers a custom element class.
 */
export const customElement = (tagName: keyof HTMLElementTagNameMap) => (clazz: any) => {
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
      get(this: HTMLElement) { return queryFn(this.shadowRoot!, selector); },
      enumerable : true,
      configurable : true,
    });
  };
}
