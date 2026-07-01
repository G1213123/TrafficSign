import { Point } from 'fabric';
import { CanvasGlobals, DrawGrid } from './canvas.js';

export function setupTouchEvents(canvas) {
  if (!canvas) return () => {};

  let lastTouchDistanceNative = 1;
  let lastTouchCenterNative = null;
  let isNativeTouching = false;

  const handleMouseDown = function (opt) {
    const e = opt.e;
    if (e.touches && e.touches.length === 2) {
      isNativeTouching = true;
      canvas.selection = false;
      const t1 = e.touches[0], t2 = e.touches[1];
      lastTouchDistanceNative = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
      lastTouchCenterNative = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
      opt.e.preventDefault();
    }
  };

  const handleMouseMove = function (opt) {
    const e = opt.e;
    if (!isNativeTouching || !e.touches || e.touches.length !== 2) return;

    const t1 = e.touches[0], t2 = e.touches[1];
    const currentDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    const currentCenter = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };

    let zoom = canvas.getZoom() * (currentDistance / lastTouchDistanceNative);
    zoom = Math.max(0.01, Math.min(zoom, 20));
    canvas.zoomToPoint(new Point(lastTouchCenterNative.x, lastTouchCenterNative.y), zoom);
    DrawGrid();

    const dx = currentCenter.x - lastTouchCenterNative.x;
    const dy = currentCenter.y - lastTouchCenterNative.y;
    canvas.relativePan(new Point(dx, dy));

    lastTouchDistanceNative = currentDistance;
    lastTouchCenterNative = currentCenter;

    CanvasGlobals.scheduleRender();
    opt.e.preventDefault();
  };

  const handleMouseUp = function () {
    if (isNativeTouching) {
      isNativeTouching = false;
      canvas.selection = true;
    }
  };

  canvas.on('mouse:down', handleMouseDown);
  canvas.on('mouse:move', handleMouseMove);
  canvas.on('mouse:up', handleMouseUp);

  return () => {
    canvas.off('mouse:down', handleMouseDown);
    canvas.off('mouse:move', handleMouseMove);
    canvas.off('mouse:up', handleMouseUp);
  };
}