import LayoutBase from '@squarespace/layout-base';
import { ImageLoader } from '@squarespace/core';
import { createStyleNode } from './utils/createStyleNode';


const activeClassname = 'active';
const defaultConfig = {
  loop: true,
  imageLoaderOptions: {
    load: true,
    mode: 'fill'
  },
  autoplay: {
    enabled: false
  }
};

/**
 * A class to create a slideshow layout. Setting the `index` property will
 * automatically advance the slide to that index.
 */
class Slideshow extends LayoutBase {

  /**
   * @param  {HTMLElement} rootNode                               Node containing slideshow
   * @param  {Object}      config                                 Config object
   * @param  {String}      config.elementSelector                 Selector of child element
   * @param  {Number}      config.transitionDuration              Duration of transition
   * @param  {Boolean}     config.loop                            Whether or not to loop back to the beginning/end
   * @param  {Object}      config.controls                        Object with controls selector
   * @param  {String}      config.controls.previous               Selector for previous control
   * @param  {String}      config.controls.next                   Selector for next control
   * @param  {String}      config.controls.indicators             Selector for individual indicator
   * @param  {Object}      config.autoplay                        Object with autoplay config
   * @param  {Boolean}     config.autoplay.enabled                Whether autoplay is enabled
   * @param  {Number}      config.autoplay.delay                  Duration of each autoplay slide
   * @param  {Function}    config.autoplay.afterInteractionEnd    Callback to execute after mousing out
   * @param  {Function}    config.imageLoaderOptions              ImageLoader config
   */
  constructor(rootNode, config) {
    super(rootNode, Object.assign({}, defaultConfig, config));

    this._index = 0;
    this.eventHandlers = [];
  }

  /**
   * @return {Number} Current Index
   */
  get index() {
    return this._index;
  }

  /**
   * Sets index, updating the private variable to the new index provided, and
   * handling all logic to advance the slide to that number, including adding
   * the active classname, restarting autoplay, and setting the timeout for
   * the transition delay if configured.
   * @param  {Number} newIndex
   */
  set index(newIndex) {
    if (newIndex > this.elements.length - 1) {
      if (!this.config.loop) {
        return;
      }
      this._index = 0;
    } else if (newIndex < 0) {
      if (!this.config.loop) {
        return;
      }
      this._index = this.elements.length - 1;
    } else {
      this._index = newIndex;
    }
    this.setActiveElement(this._index);

    // Transition delay
    if (this.config.transitionDuration) {
      this.isTransitioning = true;
      this.transitionTimeout = setTimeout(() => {
        this.isTransitioning = false;
      }, this.config.transitionDuration);
    }

    // Autoplay
    if (!this.isInteracting) {
      this.stopAutoplay();
      this.startAutoplay();
    }
  }

  /**
   * Convenience method for attaching event handlers. Binds context, and keeps
   * track of all event handlers so they can be easily detached.
   * @param  {HTMLElement} node      Node to add event listener to
   * @param  {String}      event     Event type to listen to
   * @param  {Function}    callback  Function to run when event occurs
   */
  on(node, event, callback) {
    const boundCallback = callback.bind(this);
    this.eventHandlers.push({ node, event, boundCallback });
    node.addEventListener(event, boundCallback);
  }

  /**
   * Apply relevant styles for the gallery by generating a CSS style node with
   * innerText being the styles.
   */
  setStyles() {
    this.rootNode.classList.add('gallery-root');
    if (this.styleNode) {
      this.rootNode.removeChild(this.styleNode);
    }
    const styleText = {
      '.gallery-root': {
        position: 'relative'
      },
      [this.config.elementSelector]: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%'
      },
      [`${this.config.elementSelector}:not(.active)`]: {
        opacity: 0,
        'z-index': 0
      },
      [`${this.config.elementSelector}.active`]: {
        opacity: 1,
        'z-index': 1
      }
    };
    this.styleNode = createStyleNode(styleText);
    this.rootNode.appendChild(this.styleNode);
  }

  /**
   * Convenience method to take a callback function (provided by the implementer
   * of this class), validate it, and run it if it is a function.
   * @param  {Function} fn  Callback to execute
   */
  executeCallback(fn) {
    if (typeof fn !== 'function') {
      console.error('Callback is not a function');
      return;
    }
    fn();
  }

  /**
   * Given the config.elementSelector, selects all elements matching that
   * selector in the rootNode and returns them as an Array.
   * @return {Array}
   */
  getElements() {
    const els = this.rootNode.querySelectorAll(this.config.elementSelector);
    return Array.from(els);
  }

  /**
   * Given the indicators' selector from config, returns an array of all the
   * elements matching that selector in the rootNode and returns them as an
   * Array.
   * @return {Array}
   */
  getIndicators() {
    if (!this.config.controls || !this.config.controls.indicators) {
      return null;
    }
    const indicators = this.rootNode.querySelectorAll(this.config.controls.indicators);
    return Array.from(indicators);
  }

  /**
   * Given an index, adds the active classname to the element and the indicator
   * corresponding to that index.
   * @param {Number} index
   */
  setActiveElement(index = 0) {
    this.elements.forEach((el, i) => {
      el.classList.toggle(activeClassname, i === index);
    });

    // Indicator
    if (!this.indicators) {
      return;
    }
    this.indicators.forEach((el, i) => {
      el.classList.toggle(activeClassname, i === index);
    });
  }

  /**
   * Select the first image with data-src attribute in each element, and loads
   * loads the image with provided imageLoaderOptions.
   */
  loadImages() {
    this.elements.forEach((el) => {
      const img = el.querySelector('img[data-src]');
      ImageLoader.load(img, this.config.imageLoaderOptions);
    });
  }

  /**
   * Starts autoplay, and binds handlers to stop autoplay on mouseover and
   * restart it on mouseout.
   */
  setupAutoplay() {
    if (!this.config.autoplay || !this.config.autoplay.enabled) {
      return;
    }
    this.startAutoplay();

    // Mouseover and mouseout will mess with the controls click handler if this
    // is a touch device, so don't bind them in those situations.
    if ('ontouchstart' in document.documentElement) {
      return;
    }

    this.on(this.rootNode, 'mouseover', () => {
      this.isInteracting = true;
      this.rootNode.classList.add('interacting');
      this.stopAutoplay();
    });
    this.on(this.rootNode, 'mouseout', () => {
      this.isInteracting = false;
      this.rootNode.classList.remove('interacting');
      this.executeCallback(this.config.afterInteractionEnd);
      this.startAutoplay();
    });
  }

  /**
   * Starts autoplay if it's enabled, and there isn't already an autoplay
   * timeout running.
   */
  startAutoplay() {
    if (!this.config.autoplay || !this.config.autoplay.enabled || this.autoplayTimeout) {
      return;
    }

    this.autoplayTimeout = setTimeout(() => {
      this.index++;
    }, this.config.autoplay.delay || 5000);
  }

  /**
   * Stops autoplay, clearing the autoplay timeout if there is one.
   */
  stopAutoplay() {
    clearTimeout(this.autoplayTimeout);
    this.autoplayTimeout = null;
  }

  /**
   * Walk up the DOM to find a target that matches one of the array of given
   * selectors. Used for click handlers.
   *
   * @param  {HTMLElement} initialTarget  Node to start walking the DOM from
   * @param  {Array}       selectors      Selectors to check against
   * @return {HTMLElement}                Found element, or null if none
   */
  findAncestor(initialTarget, selectors) {
    const match = (el) => {
      return selectors.some((sel) => {
        return el.matches(sel);
      });
    };
    let target = initialTarget;
    while (!match(target) && target !== this.rootNode) {
      target = target.parentElement;
    }

    if (!target || target === this.rootNode) {
      return null;
    }

    return target;
  }

  /**
   * Click handler for controls. When anything is clicked, walk up the DOM
   * to determine whether or not it's a control or an ancestor of a control.
   * If so, set the index to the proper number.
   *
   * The click intentionally does not do anything if the gallery is in the
   * middle of a transition.
   *
   * @param  {Object} e  Click event object
   */
  handleControlsClick(e) {
    if (this.isTransitioning) {
      return;
    }

    const selectors = Object.values(this.config.controls);
    const target = this.findAncestor(e.target, selectors);

    if (!target) {
      return;
    }

    e.preventDefault();

    if (target.matches(this.config.controls.previous)) {
      this.index--;
    } else if (target.matches(this.config.controls.next)) {
      this.index++;
    } else if (target.matches(this.config.controls.indicators)) {
      this.indicators.forEach((el, i) => {
        if (target === el) {
          this.index = i;
        }
      });
    } else {
      return;
    }
  }

  /**
   * Gets indicators, and adds event listener for click on rootNode.
   */
  setupControls() {
    if (!this.config.controls) {
      return;
    }

    this.indicators = this.getIndicators();
    this.on(this.rootNode, 'click', this.handleControlsClick);
  }

  /**
   * Figures out if the rootNode is currently visible.
   * @return {Boolean}
   */
  isInView() {
    const { top, height } = this.rootNode.getBoundingClientRect();
    if (top >= window.innerHeight || top + height <= 0) {
      return false;
    }
    return true;
  }

  /**
   * Keydown handler. If left or right arrow keys are pressed and this slideshow
   * is in view, increment or decrement the index.
   * @param  {Object} e  Keydown event object
   * @return {Number}    Current index
   */
  handleKeydown(e) {
    if (this.isTransitioning || !this.isInView()) {
      return;
    }

    const isLeftArrow = e.keyCode === 37;
    const isRightArrow = e.keyCode === 39;

    if (!isLeftArrow && !isRightArrow) {
      return;
    }

    e.preventDefault();
    e.stopImmediatePropagation();

    return isRightArrow ? this.index++ : this.index--;
  }

  /**
   * Binds the keydown handler to keydown.
   */
  setupKeydown() {
    this.on(window, 'keydown', this.handleKeydown);
  }

  /**
   * Resize handler. Reloads images, and runs the afterResize callback if there
   * is one.
   */
  handleResize() {
    this.loadImages();
    if (typeof this.config.afterResize === 'function') {
      this.config.afterResize();
    }
  }

  /**
   * The master layout function. Runs all the logic needed to lay out the
   * slideshow.
   * @param  {Object} config  Updated config object
   */
  layout(config) {
    this.beforeLayout(config);
    this.setStyles();
    this.elements = this.getElements();
    this.setActiveElement(0);
    this.loadImages();
    this.setupAutoplay();
    this.setupControls();
    this.setupKeydown();
    this.on(window, 'resize', this.handleResize);
    this.afterLayout();
  }

  /**
   * Destructor. Clears timeouts, unbinds event listeners, and removes the style
   * node added by setStyles.
   * @param  {Object} config  Updated config object
   */
  destroy(config) {
    this.beforeDestroy();

    // Clear autoplay
    this.stopAutoplay();

    // Clear transition timeout
    clearTimeout(this.transitionTimeout);

    // Unbind event handlers
    this.eventHandlers.forEach((handler) => {
      const { node, event, boundCallback } = handler;
      node.removeEventListener(event, boundCallback);
    });
    this.eventHandlers = [];

    // Remove style node
    this.styleNode.parentNode.removeChild(this.styleNode);

    this.afterDestroy();
  }
}



export default Slideshow;