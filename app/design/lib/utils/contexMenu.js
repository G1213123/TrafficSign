import { showPropertyPanel } from './property.js'; // Import showPropertyPanel
import { CanvasGlobals } from "../canvas/canvas.js"; // Import CanvasGlobals

// Context menu
let cursorClickMode = 'normal'; // Default click mode

function clickModelHandler(event) {
  const canvas = CanvasGlobals.canvas; // Access the global canvas object inside the handler
  if (!canvas) return;

  switch (cursorClickMode) {
    case 'normal': {
      if (event.e.button === 2 && event.target) { // Right click
        event.e.preventDefault();
        contextMenu.style.top = `${event.e.clientY}px`;
        contextMenu.style.left = `${event.e.clientX}px`;
        contextMenu.style.display = 'block';
        // Reset potential submenu flip state when showing
        const pivotItem = document.getElementById('pivot-anchor');
        if (pivotItem) pivotItem.classList.remove('open-left');
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

export function setupContextMenu(canvas) {

  canvas.on('mouse:down', function (event) {
    clickModelHandler(event);
  });

}


//document.addEventListener('contextmenu', function (event) {
//  event.preventDefault();
//});


// Add handlers for context-menu actions
const deleteMenuItem = document.getElementById('delete-object');
if (deleteMenuItem) {

  deleteMenuItem.addEventListener('click', function (e) {
    e.preventDefault();
    contextMenu.style.display = 'none';
    const obj = contextMenu.selectedArrow;
    if (obj && typeof obj.deleteObject === 'function') {
      obj.deleteObject(null, { target: obj });
    }
  });
}

const editMenuItem = document.getElementById('edit-object');
if (editMenuItem) {
  editMenuItem.addEventListener('click', function (e) {
    e.preventDefault();
    contextMenu.style.display = 'none';
    const obj = contextMenu.selectedArrow;
    // if (obj && typeof obj.onDoubleClick === 'function') { // Old behavior
    //   obj.onDoubleClick();
    // }
    if (obj) { // New behavior
      showPropertyPanel(obj);
    }
  });
}

// Dynamically flip submenu to left if it would overflow the viewport on the right
const pivotMenuItem = document.getElementById('pivot-anchor');
if (pivotMenuItem) {
  pivotMenuItem.addEventListener('mouseenter', () => {
    const submenu = pivotMenuItem.querySelector('.context-submenu');
    if (!submenu) return;

    // Compute after hover shows submenu (CSS handles display); delay a tick if needed
    requestAnimationFrame(() => {
      const submenuRect = submenu.getBoundingClientRect();
      const overflowRight = submenuRect.right > (window.innerWidth - 4);
      if (overflowRight) {
        pivotMenuItem.classList.add('open-left');
      } else {
        pivotMenuItem.classList.remove('open-left');
      }
    });
  });
}

export default function contextMenu() {
  return (
    <div id="context-menu">
      <ul>
        <li id="set-anchor" data-i18n="Set Anchor">Set Anchor</li>
        <li id="pivot-anchor"><span data-i18n="Pivot Anchor">Pivot Anchor</span>
          <ul class="context-submenu">
            <li id="pivot-anchor-x" data-i18n="X-axis">X-axis</li>
            <li id="pivot-anchor-y" data-i18n="Y-axis">Y-axis</li>
            <li id="pivot-anchor-both" data-i18n="Both">Both</li>
          </ul>
        </li>
        <li id="edit-object" data-i18n="Edit">Edit</li>
        <li id="delete-object" data-i18n="Delete">Delete</li>
        <li id="property" data-i18n="Property">Property</li>
      </ul>
    </div>
  )
};

export { cursorClickMode }