/**
 * Fix for Google Translate DOM manipulation crashes in React applications.
 *
 * When Google Translate automatically translates text on a webpage, it wraps or replaces
 * text nodes with <font> elements or alters parent-child node relationships in the DOM.
 *
 * When React attempts to perform DOM operations (e.g. removeChild or insertBefore) on these
 * text nodes during re-renders, route transitions, or component unmounts, the browser throws an
 * unhandled DOMException (NotFoundError: Failed to execute 'removeChild' on 'Node').
 *
 * In React, an uncaught error in DOM manipulation causes the entire fiber tree to unmount,
 * resulting in a Blank White Screen (White Screen of Death).
 *
 * This patch safely intercepts Node.prototype.removeChild and Node.prototype.insertBefore
 * to prevent parent mismatch DOMExceptions from crashing React.
 */

if (typeof window !== "undefined" && typeof Node !== "undefined" && Node.prototype) {
  const originalRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function (child) {
    if (child && child.parentNode !== this) {
      if (console && console.warn) {
        console.warn("Google Translate fix: Node.removeChild parent mismatch prevented", this, child);
      }
      return child;
    }
    return originalRemoveChild.call(this, child);
  };

  const originalInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function (newNode, referenceNode) {
    if (referenceNode && referenceNode.parentNode !== this) {
      if (console && console.warn) {
        console.warn("Google Translate fix: Node.insertBefore parent mismatch prevented", this, newNode, referenceNode);
      }
      return newNode;
    }
    return originalInsertBefore.call(this, newNode, referenceNode);
  };
}
