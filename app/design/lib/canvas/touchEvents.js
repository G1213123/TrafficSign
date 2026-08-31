import { Point } from 'fabric';
import { useEffect, useRef } from 'react';
import { CanvasGlobals, DrawGrid } from '../../components/canvas/canvas.js';

let touchEventController = null;

export function useTouchLongPress(onLongPress, { delay = 500, moveThreshold = 10, onLongPressEnd } = {}) {
  const timerRef = useRef(null);
  const startYRef = useRef(0);
  const suppressClickRef = useRef(false);

  const clearTimer = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  useEffect(() => () => clearTimer(), []);

  const touchHandlers = {
    onTouchStart: (event) => {
      clearTimer();
      startYRef.current = event.touches[0]?.clientY ?? 0;
      suppressClickRef.current = false;
      timerRef.current = setTimeout(() => {
        suppressClickRef.current = true;
        onLongPress(event);
        timerRef.current = null;
      }, delay);
    },
    onTouchMove: (event) => {
      const touchMoveY = event.touches[0]?.clientY ?? startYRef.current;
      if (Math.abs(touchMoveY - startYRef.current) > moveThreshold) {
        clearTimer();
      }
    },
    onTouchEnd: () => {
      clearTimer();
      if (suppressClickRef.current) {
        onLongPressEnd?.();
      }
    },
  };

  const shouldSuppressClick = () => {
    if (!suppressClickRef.current) return false;
    suppressClickRef.current = false;
    return true;
  };

  return { touchHandlers, shouldSuppressClick };
}

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
      if (!CanvasGlobals.canvasInteractionLocked) {
        canvas.selection = true;
      }
    }
  };

  canvas.on('mouse:down', handleMouseDown);
  canvas.on('mouse:move', handleMouseMove);
  canvas.on('mouse:up', handleMouseUp);

  let isPaused = false;
  touchEventController = {
    pause() {
      if (isPaused) return;
      isPaused = true;
      canvas.off('mouse:down', handleMouseDown);
      canvas.off('mouse:move', handleMouseMove);
      canvas.off('mouse:up', handleMouseUp);
    },
    resume() {
      if (!isPaused) return;
      isPaused = false;
      canvas.on('mouse:down', handleMouseDown);
      canvas.on('mouse:move', handleMouseMove);
      canvas.on('mouse:up', handleMouseUp);
    },
  };

  return () => {
    if (touchEventController) touchEventController = null;
    canvas.off('mouse:down', handleMouseDown);
    canvas.off('mouse:move', handleMouseMove);
    canvas.off('mouse:up', handleMouseUp);
  };
}

export function pauseTouchEvents() {
  touchEventController?.pause();
}

export function resumeTouchEvents() {
  touchEventController?.resume();
}