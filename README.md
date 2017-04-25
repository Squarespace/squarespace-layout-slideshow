Squarespace Layout: Slideshow
-------------------------------

A module to lay out a group of elements in a slideshow.

*NOTICE: This code is licensed to you pursuant to Squarespace’s Developer Terms of Use. See license section below.*

## Usage

```sh
npm install --save @squarespace/layout-slideshow;
```

```js
const Slideshow = require('@squarespace/layout-slideshow');

const slideshow = new Slideshow(rootNode, {
  config
});
```

### Using ES6

If you prefer to handle transpiling and polyfilling on your own, you can import ES6 from Slideshow:

```js
import Slideshow from '@squarespace/layout-slideshow/src';
```

Alternately, Slideshow specifies a `module` property in `package.json` that points to the uncompiled `src/index.js`, so you may be able to simply import `@squarespace/layout-slideshow` if you're using one of the following bundlers:
* [Webpack 2](https://webpack.js.org/configuration/resolve/#resolve-mainfields)
* [Rollup](https://github.com/rollup/rollup-plugin-node-resolve#rollup-plugin-node-resolve)

## Reference

### new Slideshow(rootNode, {config})
**Params**
* rootNode `HTMLElement` - Node containing slideshow
* config `Object` - Config object
* config.elementSelector `String` - Selector of child element
* config.transitionDuration `Number` - Duration of transition
* config.loop `Boolean` - Whether or not to loop back to the beginning/end
* config.controls `Object` - Object with controls selector
* config.controls.previous `String` - Selector for previous control
* config.controls.next `String` - Selector for next control
* config.controls.indicators `String` - Selector for individual indicator
* config.autoplay `Object` - Object with autoplay config
* config.autoplay.enabled `Boolean` - Whether autoplay is enabled
* config.autoplay.delay `Number` - Duration of each autoplay slide
* config.autoplay.afterInteractionEnd `Function` - Callback to execute after mousing out
* config.imageLoaderOptions `Function` - ImageLoader config

### Slideshow.layout(config)
Layout the slideshow and bind event listeners.

### Slideshow.destroy()
Clear timeouts, unbind event listeners, stop autoplay

## License
Portions Copyright © 2016 Squarespace, Inc. This code is licensed to you pursuant to Squarespace’s Developer Terms of Use, available at http://developers.squarespace.com/developer-terms-of-use (the “Developer Terms”). You may only use this code on websites hosted by Squarespace, and in compliance with the Developer Terms. TO THE FULLEST EXTENT PERMITTED BY LAW, SQUARESPACE PROVIDES ITS CODE TO YOU ON AN “AS IS” BASIS WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.