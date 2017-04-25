/**
 * Given an object corresponding to a CSS declaration block, create a style node
 * where the innerText is those styles.
 *
 * Example input:
 * '.my-selector': {
 *   position: 'relative',
 *   'z-index': 1
 * };
 *
 * @param  {Object} style
 * @return {HTMLElement}
 */
export const createStyleNode = (style) => {
  const styleNode = document.createElement('style');
  styleNode.innerText = Object.keys(style).reduce((acc, sel, i) => {
    acc += sel + '{';
    Object.keys(style[sel]).forEach((prop) => {
      acc += `${prop}:${style[sel][prop]};`;
    });
    acc += '}';
    return acc;
  }, '');

  return styleNode;
};