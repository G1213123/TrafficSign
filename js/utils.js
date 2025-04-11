// utils.js

export function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(context, args)
    }, wait);
  };
}

export function getCenterCoordinates(canvas) {
  
  const centerX = canvas.width / 2 / canvas.getZoom();
  const centerY = canvas.height / 2 / canvas.getZoom();

  // Account for any panning that has been done
  const vpt = canvas.viewportTransform;
  const actualCenterX = (centerX - vpt[4]) / vpt[0];
  const actualCenterY = (centerY - vpt[5]) / vpt[3];

  return { x: actualCenterX, y: actualCenterY };
}