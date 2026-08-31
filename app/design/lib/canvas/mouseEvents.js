import { CanvasGlobals, DrawGrid } from '../../components/canvas/canvas.js';
import { canvasTracker } from '../utils/Tracker.js';

const getCanvas = () => CanvasGlobals.canvas;

let currentSnapHoverObjects = [];

function clearSnapHoverEnvelope() {
  currentSnapHoverObjects.forEach(obj => {
    if (obj && typeof obj.hideHoverSnapVertexEnvelope === 'function') {
      obj.hideHoverSnapVertexEnvelope();
    }
  });
  currentSnapHoverObjects = [];
}

function updateSnapHoverEnvelope(canvas, opt) {
  const activeVertex = CanvasGlobals.activeVertex;
  const isSnapMode = !!(activeVertex && activeVertex.isDragging && activeVertex.baseGroup);

  if (!isSnapMode) {
    clearSnapHoverEnvelope();
    return;
  }

  const pointer = canvas.getScenePoint(opt.e);
  const activeSnapObject = activeVertex.baseGroup;
  const hoveredObjects = [];

  for (let i = canvas.getObjects().length - 1; i >= 0; i--) {
    const obj = canvas.getObjects()[i];
    if (!obj || obj === activeSnapObject) continue;
    if (typeof obj.getBoundingRect !== 'function') continue;

    const bbox = obj.getBoundingRect();
    const insideBBox =
      pointer.x >= bbox.left &&
      pointer.x <= bbox.left + bbox.width &&
      pointer.y >= bbox.top &&
      pointer.y <= bbox.top + bbox.height;

    if (insideBBox) {
      hoveredObjects.push(obj);
    }
  }

  const removedObjects = currentSnapHoverObjects.filter(obj => !hoveredObjects.includes(obj));
  const addedObjects = hoveredObjects.filter(obj => !currentSnapHoverObjects.includes(obj));

  if (removedObjects.length === 0 && addedObjects.length === 0) {
    return;
  }

  removedObjects.forEach(obj => {
    if (obj && typeof obj.hideHoverSnapVertexEnvelope === 'function') {
      obj.hideHoverSnapVertexEnvelope();
    }
  });

  addedObjects.forEach(obj => {
    if (obj && typeof obj.showHoverSnapVertexEnvelope === 'function') {
      obj.showHoverSnapVertexEnvelope();
    }
  });

  currentSnapHoverObjects = hoveredObjects;
}

export function setupMouseEvents(canvas) {
  if (!canvas) return () => {};

  const handleMouseDown = function (opt) {
    const e = opt.e;
    if (e.touches && e.touches.length > 1) return;
    if (e.button === 1) {
      canvas.isDragging = true;
      canvas.selection = false;
      canvas.lastPosX = e.clientX;
      canvas.lastPosY = e.clientY;
    }
  };

  const handleMouseMove = function (opt) {
    const e = opt.e;
    if (e.touches && e.touches.length > 1) return;

    if (canvas.isDragging) {
      const vpt = canvas.viewportTransform;
      vpt[4] += e.clientX - canvas.lastPosX;
      vpt[5] += e.clientY - canvas.lastPosY;
      CanvasGlobals.scheduleRender();
      canvas.lastPosX = e.clientX;
      canvas.lastPosY = e.clientY;
      DrawGrid();
      canvas.getObjects().forEach(obj => {
        obj.setCoords();
      });
    }

    updateSnapHoverEnvelope(canvas, opt);
  };

  const handleMouseUp = function (opt) {
    canvas.isDragging = false;
    if (!CanvasGlobals.canvasInteractionLocked) {
      canvas.selection = true;
    }
    clearSnapHoverEnvelope();
  };

  const handleMouseWheel = function (opt) {
    const e = opt.e;
    let zoom = canvas.getZoom();
    zoom *= 0.999 ** e.deltaY;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    canvas.zoomToPoint({ x: e.offsetX, y: e.offsetY }, zoom);
    e.preventDefault();
    e.stopPropagation();
    DrawGrid();

    const activeObj = canvas.getActiveObject();
    if (activeObj && activeObj.anchorageLink && activeObj.anchorageLink.length > 0) {
      activeObj.drawAnchorLinkage();
    }

    if (activeObj && activeObj.showDimensions) {
      activeObj.showDimensions();
    }

    const activeVertex = CanvasGlobals.activeVertex;
    if (activeVertex) {
      activeVertex.clearSnapHighlight();
      activeVertex.addSnapHighlight();
    }

    canvas.getObjects().forEach(obj => {
      obj.setCoords();
    });
    CanvasGlobals.scheduleRender();
  };

  const lockGroupSelection = function () {
    const activeObjects = canvas.getActiveObject();
    if (activeObjects && activeObjects.type === 'activeselection') {
      activeObjects.lockMovementX = true;
      activeObjects.lockMovementY = true;
      activeObjects.lockScalingX = true;
      activeObjects.lockScalingY = true;
      activeObjects.lockRotation = true;
      activeObjects.lockUniScaling = true;
      activeObjects.hasControls = false;
    }
  };

  const handleObjectModified = function () {
    canvasTracker.endDrag();
  };

  canvas.on('mouse:down', handleMouseDown);
  canvas.on('mouse:move', handleMouseMove);
  canvas.on('mouse:up', handleMouseUp);
  canvas.on('mouse:wheel', handleMouseWheel);
  canvas.on({
    'selection:updated': lockGroupSelection,
    'selection:created': lockGroupSelection
  });
  canvas.on('object:modified', handleObjectModified);

  return () => {
    canvas.off('mouse:down', handleMouseDown);
    canvas.off('mouse:move', handleMouseMove);
    canvas.off('mouse:up', handleMouseUp);
    canvas.off('mouse:wheel', handleMouseWheel);
    canvas.off('selection:updated', lockGroupSelection);
    canvas.off('selection:created', lockGroupSelection);
    canvas.off('object:modified', handleObjectModified);
    clearSnapHoverEnvelope();
  };
}