import {html} from '../../lit-html/lib/lit-html.js';

import {customElement, FigElement, observe, property, query} from './fig-element.js';
import {FigSlideElement} from './fig-slide.js';
import {FigThemeElement} from './fig-theme.js';
import {setCurrentSlide, setCurrentSlideContainer} from './globals.js';

@customElement('fig-viewer') export class FigViewerElement extends FigElement {
  @property
  width: number = 800;

  @property
  height: number = 800;

  @property
  index: number;

  get slides(): NodeList {
    return this.querySelectorAll(':scope > fig-slide');
  }

  get length(): number {
    return this.slides.length;
  }

  @query('#container')
  private _container: HTMLDivElement;

  private _nextClick = () => this.next();

  private _previousClick = () => this.previous();

  private _onResizeBound = () => this._onResize();

  private _onKeyDownBound = (e: KeyboardEvent) => this._onKeyDown(e);

  private _routeBound = () => this._route();

  _getTheme() {
    return (this.querySelector('fig-theme') || undefined) as FigThemeElement;
  }

  connectedCallback() {
    window.addEventListener('resize', this._onResizeBound);
    requestAnimationFrame(this._onResizeBound);
    this.setAttribute('tabindex', this.getAttribute('tabindex') || '-1');
    this.addEventListener('keydown', this._onKeyDownBound);
    this.focus();

    window.addEventListener('popstate', this._routeBound);
    this._route();
  }

  disconnectedCallback() {
    window.removeEventListener('resize', this._onResizeBound);
  }

  render() {
    const slide = this._getSlide();
    // There are two style tags below because one has dynamic bindings, and we
    // don't want to invalidate all of the styles.
    return html`
      <style>
        #container {
          width: ${slide ? slide.width : 0}px;
          height: ${slide ? slide.height : 0}px;
        }
      </style>
      <style>
        :host {
          background: black;
          display: flex;
          position: relative;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        #container {
          flex: 0 0 auto;
        }
        #controls {
          color: white;
          font: Arial, Sans Serif;
          display: flex;
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
      </style>
      <div id="container">${slide && slide.renderSlide(this._getTheme())}</div>
      <div id="controls">
        <button on-click=${()=>this._previousClick}>
          <svg style="width:24px;height:24px" viewBox="0 0 24 24">
            <path fill="#000000" d="M19,5V19H16V5M14,5V19L3,12" />
          </svg>
        </button>
        <button on-click=${()=>this._nextClick}>
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

  onRender() {
    setCurrentSlide(this._getSlide());
    setCurrentSlideContainer(this._container);
  }

  next() {
    if (this.index < this.length - 1) {
      this.index++;
    }
  }

  previous() {
    if (this.index > 0) {
      this.index--;
    }
  }

  @observe('index')
  _indexChanged(index: number) {
    window.location.hash = `slide-${index}`;
  }

  goto(index: number) {
    if (index < 0) {
      this. index = 0;
    } else if (index > this.length - 1) {
      this.index = this.length - 1;
    } else {
      this.index = index;
    }
  }

  _route() {
    // Simple fragment-based router
    if (window.location.hash.startsWith('#slide-')) {
      const slideString = window.location.hash.substring('#slide-'.length)!
      const index = parseInt(slideString);
      this.goto(index);
    } else {
      this.index = 0;
    }
  }

  private _getSlide(index: number = this.index): FigSlideElement|null {
    return this.slides.item(index) as FigSlideElement;
  }

  _onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowLeft':
        this.previous();
        break;
      case 'ArrowRight':
        this.next();
        break;
    }
  }

  _onResize() {
    const container = this._container;
    const style = container.style;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;
    const containerRatio = containerWidth / containerHeight;

    const viewerWidth = this.offsetWidth;
    const viewerHeight = this.offsetHeight;
    const viewerRatio = viewerWidth / viewerHeight;

    const scale = (containerRatio < viewerRatio)
        ? viewerHeight / containerHeight
        : viewerWidth / containerWidth;

    style.transform = `scale(${scale})`;
  }

}
