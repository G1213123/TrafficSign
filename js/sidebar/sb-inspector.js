/* Object Inspector Panel */
import { CanvasGlobals } from '../canvas/canvas.js';
import { showPropertyPanel } from './property.js';

let CanvasObjectInspector = {
  createObjectListPanelInit: function () {
    const objectListPanel = document.getElementById('objectListPanel');

    // Clear the existing content
    objectListPanel.innerHTML = '';

    // Loop through the CanvasObject array and append object names to the list
    CanvasGlobals.canvasObject.forEach((obj, index) => {
      const div = document.createElement('div');
      div.className = 'object-list-item';
      div.innerText = obj._showName;
      div.id = `Group (${index})`;
      div.addEventListener('click', () => {
        // Remove 'selected' class from all items
        document.querySelectorAll('.object-list-item').forEach(item => item.classList.remove('selected'));
        // Add 'selected' class to the clicked item
        div.classList.add('selected');
        CanvasGlobals.canvas.setActiveObject(obj);
        CanvasGlobals.canvas.renderAll();
        // Scroll the parent container to the clicked item
        div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      div.addEventListener('dblclick', () => {
        showPropertyPanel(obj);
      });
      objectListPanel.appendChild(div);
    });
  },

  SetActiveObjectList: function (setActive) {
    const index = CanvasGlobals.canvasObject.indexOf(setActive);
    // Remove 'selected' class from all items
    document.querySelectorAll('.object-list-item').forEach(item => {
      if (item.id == `Group (${index})`) {
        item.classList.add('selected');
        // Scroll the parent container to the active item
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  },
  
  initPanelToggle: function() {
    const heading = document.querySelector('.object-list-heading');
    const panel = document.getElementById('objectListPanel');
    const icon = document.getElementById('toggle-object-list');
    
    heading.addEventListener('click', () => {
      // Toggle the contracted class on the panel
      panel.classList.toggle('contracted');
      
      // Toggle the rotated class on the icon
      icon.classList.toggle('rotated');
      
      // Make sure the icon matches the correct state:
      // When panel is contracted (hidden) - icon should point up (rotated)
      // When panel is expanded - icon should point down (not rotated)
      if (panel.classList.contains('contracted')) {
        icon.classList.add('rotated');  // Panel is contracted, icon points up
      } else {
        icon.classList.remove('rotated'); // Panel is expanded, icon points down
      }
    });
  }
}

// Initialize the panel toggle functionality when the script loads
CanvasObjectInspector.initPanelToggle();

// Export the CanvasObjectInspector for use in other files
export { CanvasObjectInspector };