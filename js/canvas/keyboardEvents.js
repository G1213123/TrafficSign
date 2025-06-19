import { CanvasGlobals } from "./canvas.js";
import { FormSettingsComponent } from "../sidebar/sb-settings.js";
import { canvasTracker } from "./Tracker.js";

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

  activeObjects.forEach(obj => {
    switch (event.key) {
      case 'ArrowUp':
        if (!obj.lockMovementY) {
          obj.top -= 1;
          moved = true;
        }
        break;
      case 'ArrowDown':
        if (!obj.lockMovementY) {
          obj.top += 1;
          moved = true;
        }
        break;
      case 'ArrowLeft':
        if (!obj.lockMovementX) {
          obj.left -= 1;
          moved = true;
        }
        break;
      case 'ArrowRight':
        if (!obj.lockMovementX) {
          obj.left += 1;
          moved = true;
        }
        break;      case 'Delete':
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
    }    if (moved) {
      obj.updateAllCoord();
      obj.setCoords();
      obj.fire('moving');
      // Notify listeners (e.g., property panel) that object was modified
      CanvasGlobals.canvas.fire('object:modified', { target: obj });
      
      // Track the movement for undo/redo
      canvasTracker.track('modifyObject', { object: obj }, 'Object moved with arrow keys');
    }
  });

  if (moved) {
    CanvasGlobals.canvas.renderAll();
  }
}

// Add event listener for arrow keys to the canvas
document.addEventListener('keydown', handleArrowKeys);

// Add event listener for Ctrl+S to save canvas state
document.addEventListener('keydown', function(event) {
  if (event.ctrlKey && event.key === 's') {
    event.preventDefault(); // Prevent the browser's default save action
    FormSettingsComponent.saveCanvasState();
    // Optionally, provide some feedback to the user, e.g., a console log or a small notification
    console.log('Canvas state saved (Ctrl+S)');
  }
});

// Add event listeners for undo/redo functionality
document.addEventListener('keydown', function(event) {
  // Check if user is currently inputting something - if so, don't trigger undo/redo
  if (document.activeElement.tagName === 'INPUT' || 
      document.activeElement.tagName === 'TEXTAREA') {
    return; // Exit early if user is typing in an input field
  }
  // Ctrl+Z for undo (try state-based first, fallback to original)
  if (event.ctrlKey && event.key === 'z' && !event.shiftKey) {
    event.preventDefault();
    const stateSuccess = canvasTracker.undoState();
    if (stateSuccess) {
      console.log('State-based undo performed');
    } else {
      // Fallback to original undo method if available
      if (typeof canvasTracker.undo === 'function') {
        const originalSuccess = canvasTracker.undo();
        if (originalSuccess) {
          console.log('Original undo performed');
        } else {
          console.log('Nothing to undo');
        }
      } else {
        console.log('Nothing to undo');
      }
    }
  }
  
  // Ctrl+Y or Ctrl+Shift+Z for redo (try state-based first, fallback to original)
  if ((event.ctrlKey && event.key === 'y') || 
      (event.ctrlKey && event.shiftKey && event.key === 'Z')) {
    event.preventDefault();
    const stateSuccess = canvasTracker.redoState();
    if (stateSuccess) {
      console.log('State-based redo performed');
    } else {
      // Fallback to original redo method if available
      if (typeof canvasTracker.redo === 'function') {
        const originalSuccess = canvasTracker.redo();
        if (originalSuccess) {
          console.log('Original redo performed');
        } else {
          console.log('Nothing to redo');
        }
      } else {
        console.log('Nothing to redo');
      }
    }
  }
});

export { ShowHideSideBarEvent, handleArrowKeys };