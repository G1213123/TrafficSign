import { CanvasGlobals } from "./canvas.js";
import { FormSettingsComponent } from "../sidebar/sb-settings.js";
import { GeneralSettings } from "../sidebar/sbGeneral.js";
import { canvasTracker } from "./Tracker.js";
import { showPropertyPanel } from "../sidebar/property.js";
import { buildObjectsFromJSON } from "../objects/build.js";

// Keyboard shortcut for showing/hiding sidebar
function ShowHideSideBarEvent(e) {
  switch (e.keyCode) {
    case 27: // esc
      GeneralHandler.ShowHideSideBar(e);
      break;
  }
}

// Method to handle arrow key presses for all active objects
function handleArrowKeys(event) {
  const activeObjects = CanvasGlobals.canvas.getActiveObjects();
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
        // Check if user is currently inputting something - if so, don't delete objects
        if (document.activeElement.tagName === 'INPUT' ||
          document.activeElement.tagName === 'TEXTAREA') {
          return; // Exit early if user is typing in an input field
        }

        if (obj.deleteObject) {
          CanvasGlobals.canvas.discardActiveObject(obj)
          CanvasGlobals.canvas.fire('object:deselected', { target: obj });
          obj.deleteObject(null, obj)
        }
        break;
    }    
    if (moved) {
      obj.updateAllCoord();
      obj.setCoords();
      obj.fire('moving');
      // Notify listeners (e.g., property panel) that object was modified
      CanvasGlobals.canvas.fire('object:modified', { target: obj });

      // Track the movement for undo/redo
      canvasTracker.track('modifyObject', [{
        type: 'BaseGroup',
        id: obj.canvasID,
        functionalType: obj.functionalType,
        deltaX: deltaX,
        deltaY: deltaY,
        isInitialMover:  true,
      }], 'Object moved with arrow keys');
    }
  });

  if (moved) {
  CanvasGlobals.scheduleRender();
  }
}

// Add event listener for arrow keys to the canvas
document.addEventListener('keydown', handleArrowKeys);

// Add event listener for Ctrl+S to save canvas state
document.addEventListener('keydown', function (event) {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault(); // Prevent the browser's default save action
    FormSettingsComponent.saveCanvasState();
    // Optionally, provide some feedback to the user, e.g., a console log or a small notification
    console.log('Canvas state saved (Ctrl+S)');
  }
});

// Add event listeners for undo/redo functionality
document.addEventListener('keydown', function (event) {
  // Check if user is currently inputting something - if so, don't trigger undo/redo
  if (document.activeElement.tagName === 'INPUT' ||
    document.activeElement.tagName === 'TEXTAREA') {
    return; // Exit early if user is typing in an input field
  }
  // Ctrl+Z for undo (try state-based first, fallback to original)
  if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
    event.preventDefault();
    if (typeof canvasTracker.undo === 'function') {
        canvasTracker.undo().then(success => {
            if (success) console.log('Undo performed');
            else console.log('Nothing to undo');
        });
    }
  }

  // Ctrl+Y or Ctrl+Shift+Z for redo (try state-based first, fallback to original)
  if ((event.ctrlKey && event.key === 'y') ||
    (event.ctrlKey && event.shiftKey && event.key === 'Z')) {
    event.preventDefault();
    if (typeof canvasTracker.redo === 'function') {
        canvasTracker.redo().then(success => {
            if (success) console.log('Redo performed');
            else console.log('Nothing to redo');
        });
    }
  }

  // Refresh property panel when arrow keys are pressed
    const panel = document.getElementById('property-panel');
    if (panel.style.display !== 'block') return;
    const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
    if (arrowKeys.includes(event.key)) {
      // Update content based on current active object
      const obj = CanvasGlobals.canvas.getActiveObject();
      if (obj) showPropertyPanel(obj);
    }
});

// Clipboard for copy/paste
let _clipboard = null;

function copy() {
  const activeObjects = CanvasGlobals.canvas.getActiveObjects();
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
  if (!_clipboard || _clipboard.length === 0) return;
  
  // Deep copy the clipboard data to avoid modifying the original clipboard
  const dataToPaste = JSON.parse(JSON.stringify(_clipboard));
  
  // Offset the objects
  dataToPaste.forEach(data => {
    if (data.left !== undefined) data.left += 20;
    if (data.top !== undefined) data.top += 20;
    // Also offset fixedWidthCoords/fixedHeightCoords if they exist (for BorderGroup)
    if (data.fixedWidthCoords) {
        data.fixedWidthCoords.x += 20;
        data.fixedWidthCoords.y += 20;
    }
    if (data.fixedHeightCoords) {
        data.fixedHeightCoords.x += 20;
        data.fixedHeightCoords.y += 20;
    }
  });

  CanvasGlobals.canvas.discardActiveObject();
  
  try {
    const newObjects = await buildObjectsFromJSON(dataToPaste);
    
    if (newObjects && newObjects.length > 0) {
      const selection = new fabric.ActiveSelection(newObjects, {
        canvas: CanvasGlobals.canvas,
      });
      CanvasGlobals.canvas.setActiveObject(selection);
      CanvasGlobals.canvas.requestRenderAll();
    }
  } catch (error) {
    console.error("Error pasting objects:", error);
  }
}

document.addEventListener('keydown', function(e) {
    // Ctrl+C
    if (e.ctrlKey && (e.key === 'c' || e.key === 'C')) {
        // Check if input is focused
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        copy();
    }
    // Ctrl+V
    if (e.ctrlKey && (e.key === 'v' || e.key === 'V')) {
        if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
        paste();
    }
    
    // F3 - Toggle Text Border
    if (e.key === 'F3') {
        e.preventDefault();
        GeneralSettings.showTextBorders = !GeneralSettings.showTextBorders;
        FormSettingsComponent.applyTextBorderSettings();
        FormSettingsComponent.updateSettingsUI();
        FormSettingsComponent.saveSettings();
    }
    // F4 - Toggle Grid
    if (e.key === 'F4') {
        e.preventDefault();
        GeneralSettings.showGrid = !GeneralSettings.showGrid;
        FormSettingsComponent.applyGridSettings();
        FormSettingsComponent.updateSettingsUI();
        FormSettingsComponent.saveSettings();
    }
    // F2 - Toggle Vertices
    if (e.key === 'F2') {
        e.preventDefault();
        GeneralSettings.showAllVertices = !GeneralSettings.showAllVertices;
        FormSettingsComponent.applyVertexDisplaySettings();
        FormSettingsComponent.updateSettingsUI();
        FormSettingsComponent.saveSettings();
    }
    // F8 - Toggle Dimension Unit
    if (e.key === 'F8') {
        e.preventDefault();
        GeneralSettings.dimensionUnit = GeneralSettings.dimensionUnit === 'mm' ? 'sw' : 'mm';
        FormSettingsComponent.refreshDimensionDisplays();
        FormSettingsComponent.updateSettingsUI();
        FormSettingsComponent.saveSettings();
    }
});


export { ShowHideSideBarEvent, handleArrowKeys };