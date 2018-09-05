import '@justinfagnani/rainbow/lib/language/html.js';
import '@justinfagnani/rainbow/lib/language/css.js';
import '@justinfagnani/rainbow/lib/language/javascript.js';
import '@justinfagnani/rainbow/lib/language/python.js';

import {html, LitElement, property} from '@polymer/lit-element';

import {customElement, queryAll} from './decorators.js';
import {FigSlideInstanceElement} from './fig-slide-instance.js';
import {FigSlideElement} from './fig-slide.js';
import {FigThemeElement} from './fig-theme.js';

@customElement('fig-viewer')
export class FigViewerElement extends LitElement {
  @property() width: number = 800;

  @property() height: number = 800;

  @property() index: number = 0;

  @property({attribute: 'theme', reflect: true}) themeName?: string;

  @property()
  previousSlideInstance: FigSlideInstanceElement|undefined = undefined;
  @property() slideInstance: FigSlideInstanceElement|undefined = undefined;
  @property() nextSlideInstance: FigSlideInstanceElement|undefined = undefined;

  get theme(): FigThemeElement|undefined {
    return (this.themeName !== undefined) ?
        FigThemeElement.themes.get(this.themeName) :
        undefined;
  }

  get slides(): NodeList {
    return this.querySelectorAll(':scope > fig-slide');
  }

  get length(): number {
    return this.slides.length;
  }

  @queryAll('.container') private _containers!: NodeListOf<HTMLDivElement>;

  private _onKeyDownBound = (e: KeyboardEvent) => this._onKeyDown(e);

  private _routeBound = () => this._route();

  connectedCallback() {
    super.connectedCallback();

    const ro = new ResizeObserver((entries) => this._onResize());
    ro.observe(this);

    this.setAttribute('tabindex', this.getAttribute('tabindex') || '-1');
    this.addEventListener('keydown', this._onKeyDownBound);
    this.focus();

    window.addEventListener('popstate', this._routeBound);
    this._route();

    if (!window.customElements.get('fig-slide')) {
      window.customElements.whenDefined('fig-slide').then(() => {
        this.goto(this.index);
      });
    }
  }

  render() {
    const slide = this._getSlide();

    const ringBuffer: Array<FigSlideInstanceElement|undefined> = [];
    ringBuffer[this.index % 3] = this.previousSlideInstance;
    ringBuffer[(this.index + 1) % 3] = this.slideInstance;
    ringBuffer[(this.index + 2) % 3] = this.nextSlideInstance;
    const labels: string[] = [];
    labels[this.index % 3] = 'previous';
    labels[(this.index + 1) % 3] = 'current';
    labels[(this.index + 2) % 3] = 'next';
    // There are two style tags below because one has dynamic bindings, and we
    // don't want to invalidate all of the styles.
    return html`
      <style>
        #current.container {
          width: ${slide ? slide.width : 0}px;
          height: ${slide ? slide.height : 0}px;
        }
      </style>
      <style>
        :host {
          background-color: var(--fig-backdrop-color, black);
          background-image: var(--fig-backdrop-image, none);
          background-size: contain;
          display: flex;
          position: relative;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        .container {
          flex: 0 0 auto;
        }
        /* .container > * {
          display: block;
          height: 100%;
        } */
        #controls {
          color: white;
          font: Arial, Sans Serif;
          display: var(--fig-controls-display, flex);
          align-items: center;
          background: rgba(0, 0, 0, .5);
          position: absolute;
          height: 32px;
          width: 100%;
          bottom: 0px;
        }
        button {
          -webkit-appearance: none;
          background: none;
          border: none;
          color: white;
          fill: white;
          padding: 4px;
          outline: none;
        }
        button:hover {
          background: rgba(255, 255, 255, 0.25);
        }
        svg * {
          fill: white;
        }
        #previous, #next {
          height: 0px;
          width: 0px;
          opacity: 0;
          user-select: none;
        }
      </style>
      <div class="container" id="${labels[0]}">${ringBuffer[0]}</div>
      <div class="container" id="${labels[1]}">${ringBuffer[1]}</div>
      <div class="container" id="${labels[2]}">${ringBuffer[2]}</div>
      <div id="controls">
        <button @click=${() => this.previous()}>
          <svg style="width:24px;height:24px" viewBox="0 0 24 24">
            <path fill="#000000" d="M19,5V19H16V5M14,5V19L3,12" />
          </svg>
        </button>
        <button @click=${() => this.next()}>
          <svg style="width:24px;height:24px" viewBox="0 0 24 24">
            <path fill="#000000" d="M5,5V19H8V5M10,5V19L21,12" />
          </svg>
        </button>
        <span>
          ${this.index + 1} / ${this.length}
        </span>
      </div>
    `;
  }

  next() {
    const slide = this._getSlide();
    if (slide && slide.next()) {
      // TODO: ?
    } else if (this.index < this.length - 1) {
      this.index++;
      if (this.nextSlideInstance !== undefined) {
        this.slideInstance = this.nextSlideInstance;
      } else {
        this.slideInstance = this._getSlideInstance(this.index);
      }
      this.previousSlideInstance = this._getSlideInstance(this.index - 1);
      this.nextSlideInstance = this._getSlideInstance(this.index + 1);
    }
  }

  previous() {
    if (this.index > 0) {
      this.index--;
      this.slideInstance = this.previousSlideInstance;
      this.previousSlideInstance = this._getSlideInstance(this.index - 1);
      this.nextSlideInstance = this._getSlideInstance(this.index + 1);
    }
  }

  update(changedProps: Map<any, any>) {
    super.update(changedProps);
    if (changedProps.has('index')) {
      window.location.hash = `slide-${this.index + 1}`;
      this.dispatchEvent(
          new CustomEvent('index-changed', {detail: this.index}));
    }
  }

  goto(index: number) {
    if (index === this.index && this.slideInstance) {
      return;
    }
    if (index < 0) {
      this.index = 0;
    } else if (index > this.length - 1) {
      this.index = this.length - 1;
    } else {
      this.index = index;
    }
    this.slideInstance = this._getSlideInstance(this.index);
    this.previousSlideInstance = this._getSlideInstance(this.index - 1);
    this.nextSlideInstance = this._getSlideInstance(this.index + 1);
  }

  _route() {
    // Simple fragment-based router
    if (window.location.hash.startsWith('#slide-')) {
      const slideString = window.location.hash.substring('#slide-'.length)!;
      const index = parseInt(slideString) - 1;
      this.goto(index);
    } else {
      this.index = 0;
    }
  }

  private _getSlide(index: number = this.index): FigSlideElement|null {
    return this.slides.item(index) as FigSlideElement;
  }

  private _getSlideInstance(index: number): FigSlideInstanceElement|undefined {
    const slide = this._getSlide(index);
    if (slide !== null && slide.createInstance) {
      return slide.createInstance();
    }
  }

  _onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
      case 'PageUp':
        this.previous();
        break;
      case 'ArrowRight':
      case 'PageDown':
        this.next();
        break;
      case 'f':
        // cmd+f or ctrl+f means "enter fullscreen"
        if (event.metaKey || event.ctrlKey) {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            this.requestFullscreen();
          }
        }
      case 'b':
        // STOP button. Anything we want to do?
        break;
    }
  }

  _onResize() {
    // This is a hack, we assume that all slides are the same size, as we
    // use the info of the currently active slide to calculate the scale.
    const activeContainer =
        this.shadowRoot!.querySelector('.container#current')! as HTMLElement;
    const containerWidth = activeContainer.offsetWidth;
    const containerHeight = activeContainer.offsetHeight;
    const containerRatio = containerWidth / containerHeight;

    const viewerWidth = this.offsetWidth;
    const viewerHeight = this.offsetHeight;
    const viewerRatio = viewerWidth / viewerHeight;

    const scale = (containerRatio < viewerRatio) ?
        viewerHeight / containerHeight :
        viewerWidth / containerWidth;

    for (const container of this._containers) {
      container.style.transform = `scale(${scale})`;
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'fig-viewer': FigViewerElement;
  }
}
