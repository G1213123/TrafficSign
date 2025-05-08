
import { CanvasGlobals } from "./canvas.js";

const canvas = CanvasGlobals.canvas; // Access the global canvas object
// Context menu
const contextMenu = document.getElementById('context-menu');
let cursorClickMode = 'normal'; // Default click mode

function clickModelHandler(event) {
  switch (cursorClickMode) {
    case 'normal': {
      if (event.e.button === 2 && event.target) { // Right click
        event.e.preventDefault();
        contextMenu.style.top = `${event.e.clientY}px`;
        contextMenu.style.left = `${event.e.clientX}px`;
        contextMenu.style.display = 'block';
        contextMenu.selectedArrow = event.target;
      } else {
        contextMenu.style.display = 'none';
      }
    }
      break;
    case 'select': {
      if (event.e.button === 0 && event.target) {
        contextMenu.selectedArrow = event.target;
        cursorClickMode = 'normal';
        contextMenu.style.display = 'none'; // Ensure context menu is hidden
      }
    }
      break;
  }
}

canvas.on('mouse:down', function (event) {
  clickModelHandler(event)
});


document.addEventListener('contextmenu', function (event) {
  event.preventDefault();
});


// Add handlers for context-menu actions
const deleteMenuItem = document.getElementById('delete-object');
deleteMenuItem.addEventListener('click', function (e) {
  e.preventDefault();
  contextMenu.style.display = 'none';
  const obj = contextMenu.selectedArrow;
  if (obj && typeof obj.deleteObject === 'function') {
    obj.deleteObject(null, { target: obj });
  }
});

const editMenuItem = document.getElementById('edit-object');
editMenuItem.addEventListener('click', function (e) {
  e.preventDefault();
  contextMenu.style.display = 'none';
  const obj = contextMenu.selectedArrow;
  if (obj && typeof obj.onDoubleClick === 'function') {
    obj.onDoubleClick();
  }
});

export {cursorClickMode}