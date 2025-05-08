import { CanvasGlobals,DrawGrid } from './canvas.js';
const canvas = CanvasGlobals.canvas; // Access the global canvas object
const activeVertex = CanvasGlobals.activeVertex; // Access the global active vertex object
// —————————————————————————————
// native touch pinch-to-zoom & two-finger pan
// using Fabric pointer events (no external libs)
// —————————————————————————————
let lastTouchDistanceNative = 1;
let lastTouchCenterNative = null;
let isNativeTouching = false;

canvas.on('mouse:down', function(opt) {
  const e = opt.e;
  if (e.touches && e.touches.length === 2) {
    isNativeTouching = true;
    canvas.selection = false;
    const t1 = e.touches[0], t2 = e.touches[1];
    lastTouchDistanceNative = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
    lastTouchCenterNative = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
    opt.e.preventDefault();
  }
});

canvas.on('mouse:move', function(opt) {
  const e = opt.e;
  if (!isNativeTouching || !e.touches || e.touches.length !== 2) return;
  const t1 = e.touches[0], t2 = e.touches[1];
  const currentDistance = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
  const currentCenter = { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };

  // zoom
  let zoom = canvas.getZoom() * (currentDistance / lastTouchDistanceNative);
  zoom = Math.max(0.01, Math.min(zoom, 20));
  canvas.zoomToPoint(new fabric.Point(lastTouchCenterNative.x, lastTouchCenterNative.y), zoom);
  DrawGrid(); // Update grid after zoom

  // pan
  const dx = currentCenter.x - lastTouchCenterNative.x;
  const dy = currentCenter.y - lastTouchCenterNative.y;
  canvas.relativePan(new fabric.Point(dx, dy));

  lastTouchDistanceNative = currentDistance;
  lastTouchCenterNative = currentCenter;

  canvas.requestRenderAll();
  opt.e.preventDefault();
});

canvas.on('mouse:up', function(opt) {
  if (isNativeTouching) {
    isNativeTouching = false;
    canvas.selection = true;
  }
});