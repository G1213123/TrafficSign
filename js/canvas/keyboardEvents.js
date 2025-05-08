import { CanvasGlobals } from "./canvas.js";

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

export { ShowHideSideBarEvent, handleArrowKeys };