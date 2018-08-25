import {FigSlideElement} from './fig-slide.js';

export let currentSlide: FigSlideElement|null;
export function setCurrentSlide(slide: FigSlideElement|null) {
  currentSlide = slide;
}

export let currentSlideContainer: HTMLElement|null;
export function setCurrentSlideContainer(e: HTMLElement|null) {
  currentSlideContainer = e;
}
