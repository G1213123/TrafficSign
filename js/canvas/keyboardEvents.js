import { CanvasGlobals } from "./canvas.js";
import { FormSettingsComponent } from "../sidebar/sb-settings.js";

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
        break;
      case 'Delete':
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

export { ShowHideSideBarEvent, handleArrowKeys };