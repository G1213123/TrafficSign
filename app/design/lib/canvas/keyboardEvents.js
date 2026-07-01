import { ActiveSelection } from 'fabric';
import { CanvasGlobals } from '../../components/canvas/canvas.js';
import { GeneralSettings } from '../../components/sidebars/settings.js';
import { canvasTracker } from '../utils/Tracker.js';

function isTextInputFocused() {
  const activeElement = document.activeElement;
  return !!activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA');
}

export function ShowHideSideBarEvent(event) {
  if (event.key === 'Escape' || event.keyCode === 27) {
    window.dispatchEvent(new CustomEvent('toggle-sidebar'));
  }
}

export function handleArrowKeys(event) {
  const canvas = CanvasGlobals.canvas;
  if (!canvas) return false;

  const activeObjects = canvas.getActiveObjects?.() || [];
  let moved = false;
  let deltaX = 0;
  let deltaY = 0;

  activeObjects.forEach(obj => {
    switch (event.key) {
      case 'ArrowUp':
        if (!obj.lockMovementY) {
          obj.top -= 1;
          deltaY = -1;
          moved = true;
        }
        break;
      case 'ArrowDown':
        if (!obj.lockMovementY) {
          obj.top += 1;
          deltaY = 1;
          moved = true;
        }
        break;
      case 'ArrowLeft':
        if (!obj.lockMovementX) {
          obj.left -= 1;
          deltaX = -1;
          moved = true;
        }
        break;
      case 'ArrowRight':
        if (!obj.lockMovementX) {
          obj.left += 1;
          deltaX = 1;
          moved = true;
        }
        break;
      case 'Delete':
        if (isTextInputFocused()) {
          return;
        }

        if (obj.deleteObject) {
          canvas.discardActiveObject(obj);
          canvas.fire('object:deselected', { target: obj });
          obj.deleteObject(null, obj);
          moved = true;
        }
        break;
    }

    if (moved) {
      obj.updateAllCoord();
      obj.setCoords();
      obj.fire('moving');
      canvas.fire('object:modified', { target: obj });

      canvasTracker.track('modifyObject', [{
        type: 'BaseGroup',
        id: obj.canvasID,
        functionalType: obj.functionalType,
        deltaX: deltaX,
        deltaY: deltaY,
        isInitialMover: true,
      }], 'Object moved with arrow keys');
    }
  });

  if (moved) {
    CanvasGlobals.scheduleRender();
  }

  return moved;
}

let _clipboard = null;

function copy() {
  const canvas = CanvasGlobals.canvas;
  if (!canvas) return;

  const activeObjects = canvas.getActiveObjects?.() || [];
  if (activeObjects.length > 0) {
    _clipboard = [];
    activeObjects.forEach(obj => {
      if (typeof obj.serializeToJSON === 'function') {
        _clipboard.push(obj.serializeToJSON());
      }
    });
  }
}

async function paste() {
  const canvas = CanvasGlobals.canvas;
  if (!canvas || !_clipboard || _clipboard.length === 0) return;

  const dataToPaste = JSON.parse(JSON.stringify(_clipboard));

  dataToPaste.forEach(data => {
    if (data.left !== undefined) data.left += 20;
    if (data.top !== undefined) data.top += 20;
    if (data.fixedWidthCoords) {
      data.fixedWidthCoords.x += 20;
      data.fixedWidthCoords.y += 20;
    }
    if (data.fixedHeightCoords) {
      data.fixedHeightCoords.x += 20;
      data.fixedHeightCoords.y += 20;
    }
  });

  canvas.discardActiveObject();

  try {
    const { buildObjectsFromJSON } = await import('../objects/build.js');
    const newObjects = await buildObjectsFromJSON(dataToPaste);

    if (newObjects && newObjects.length > 0) {
      const selection = new ActiveSelection(newObjects, {
        canvas,
      });
      canvas.setActiveObject(selection);
      canvas.requestRenderAll();
    }
  } catch (error) {
    console.error('Error pasting objects:', error);
  }
}

function handleVertexTabCycle(event) {
  if (event.key !== 'Tab' || !CanvasGlobals.activeVertex || isTextInputFocused()) {
    return false;
  }

  event.preventDefault();

  const activeVertex = CanvasGlobals.activeVertex;
  const currentBaseGroup = activeVertex.baseGroup;
  const currentVertex = activeVertex.vertex;
  const eVertices = currentBaseGroup.basePolygon.vertex.filter(v => v.label.startsWith('E'));

  eVertices.sort((a, b) => {
    const aNum = parseInt(a.label.substring(1));
    const bNum = parseInt(b.label.substring(1));
    return aNum - bNum;
  });

  let nextVertex;

  if (currentVertex.label.startsWith('V')) {
    nextVertex = event.shiftKey ? eVertices[eVertices.length - 1] : eVertices.find(v => v.label === 'E3') || eVertices[0];
  } else if (currentVertex.label.startsWith('E')) {
    const currentIndex = eVertices.findIndex(v => v.label === currentVertex.label);
    nextVertex = event.shiftKey
      ? eVertices[(currentIndex - 1 + eVertices.length) % eVertices.length]
      : eVertices[(currentIndex + 1) % eVertices.length];
  } else {
    nextVertex = event.shiftKey ? eVertices[eVertices.length - 1] : eVertices[0];
  }

  if (!nextVertex) return true;

  const currentVertexPosition = { x: currentVertex.x, y: currentVertex.y };
  if (typeof currentVertexPosition.x !== 'number' || isNaN(currentVertexPosition.x) || typeof currentVertexPosition.y !== 'number' || isNaN(currentVertexPosition.y)) {
    return true;
  }

  activeVertex.cleanupDrag();

  const nextVertexControl = currentBaseGroup.controls[nextVertex.label];
  if (!nextVertexControl) return true;

  CanvasGlobals.activeVertex = nextVertexControl;
  CanvasGlobals.activeVertex.isDown = true;
  CanvasGlobals.activeVertex.isDragging = true;
  CanvasGlobals.activeVertex.originalPosition = { left: currentBaseGroup.left, top: currentBaseGroup.top };
  CanvasGlobals.activeVertex.vertexOriginalPosition = { x: nextVertex.x, y: nextVertex.y };

  const offsetX = nextVertex.x - currentBaseGroup.left;
  const offsetY = nextVertex.y - currentBaseGroup.top;
  CanvasGlobals.activeVertex.vertexOffset = {
    x: isNaN(offsetX) ? 0 : offsetX,
    y: isNaN(offsetY) ? 0 : offsetY,
  };

  const deltaX = currentVertexPosition.x - nextVertex.x;
  const deltaY = currentVertexPosition.y - nextVertex.y;

  if (!currentBaseGroup.lockMovementX && typeof deltaX === 'number' && !isNaN(deltaX)) {
    currentBaseGroup.set({ left: currentBaseGroup.left + deltaX });
  }
  if (!currentBaseGroup.lockMovementY && typeof deltaY === 'number' && !isNaN(deltaY)) {
    currentBaseGroup.set({ top: currentBaseGroup.top + deltaY });
  }

  try {
    currentBaseGroup.setCoords();
    currentBaseGroup.updateAllCoord();
    document.addEventListener('keydown', CanvasGlobals.activeVertex.cancelDragRef);
    CanvasGlobals.canvas.on('mouse:move', CanvasGlobals.activeVertex.handleMouseMoveRef);
    CanvasGlobals.canvas.on('mouse:up', CanvasGlobals.activeVertex.handleMouseUpRef);
    currentBaseGroup.enterFocusMode();
    CanvasGlobals.canvas.defaultCursor = 'move';
    CanvasGlobals.scheduleRender();
  } catch (err) {
    console.error('Error during vertex cycling:', err);

    if (CanvasGlobals.activeVertex) {
      CanvasGlobals.activeVertex.cleanupDrag();
      CanvasGlobals.activeVertex = null;
    }

    CanvasGlobals.canvas.defaultCursor = 'default';
    CanvasGlobals.scheduleRender();
  }

  return true;
}

function handleKeyboardDown(event) {
  if (handleVertexTabCycle(event)) return;

  if (event.key === 'Escape') {
    ShowHideSideBarEvent(event);
    return;
  }

  if (event.ctrlKey && (event.key === 'c' || event.key === 'C')) {
    if (isTextInputFocused()) return;
    copy();
    return;
  }

  if (event.ctrlKey && (event.key === 'v' || event.key === 'V')) {
    if (isTextInputFocused()) return;
    paste();
    return;
  }

  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Delete'].includes(event.key)) {
    if (handleArrowKeys(event)) {
      event.preventDefault();
    }
    return;
  }

  const settings = window.FormSettingsComponent;
  if (!settings) return;

  if (event.key === 'F3') {
    event.preventDefault();
    GeneralSettings.showTextBorders = !GeneralSettings.showTextBorders;
    settings.applyTextBorderSettings();
    settings.updateSettingsUI();
    settings.saveSettings();
  }

  if (event.key === 'F4') {
    event.preventDefault();
    GeneralSettings.showGrid = !GeneralSettings.showGrid;
    settings.applyGridSettings();
    settings.updateSettingsUI();
    settings.saveSettings();
  }

  if (event.key === 'F2') {
    event.preventDefault();
    GeneralSettings.showAllVertices = !GeneralSettings.showAllVertices;
    settings.applyVertexDisplaySettings();
    settings.updateSettingsUI();
    settings.saveSettings();
  }

  if (event.key === 'F8') {
    event.preventDefault();
    GeneralSettings.dimensionUnit = GeneralSettings.dimensionUnit === 'mm' ? 'sw' : 'mm';
    settings.refreshDimensionDisplays();
    settings.updateSettingsUI();
    settings.saveSettings();
  }
}

export function setupKeyboardEvents() {
  document.addEventListener('keydown', handleKeyboardDown);
  return () => document.removeEventListener('keydown', handleKeyboardDown);
}
