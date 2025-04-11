// utils.js

/**
 * Utility debounce function to limit rapid successive updates
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @return {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * Gets center coordinates accounting for canvas pan/zoom
 * @param {fabric.Canvas} canvas - the canvas.
 * @return {Object} Center coordinates {x, y}
 */
export function getCenterCoordinates(canvas) {
  // Center the object on the canvas viewport
  const centerX = canvas.width / 2 / canvas.getZoom();
  const centerY = canvas.height / 2 / canvas.getZoom();

  // Account for any panning that has been done
  const vpt = canvas.viewportTransform;
  const actualCenterX = (centerX - vpt[4]) / vpt[0];
  const actualCenterY = (centerY - vpt[5]) / vpt[3];

  return { x: actualCenterX, y: actualCenterY };
}

/**
 * Gets center coordinates accounting for canvas pan/zoom
 * @param {fabric.Canvas} canvas - the canvas.
 * @return {Object} Center coordinates {x, y}
 */
export function CenterCoord(canvas) {
  var zoom = canvas.getZoom();
  return {
    x: fabric.util.invertTransform(canvas.viewportTransform)[4] + (canvas.width / zoom) / 2,
    y: fabric.util.invertTransform(canvas.viewportTransform)[5] + (canvas.height / zoom) / 2
  };
}