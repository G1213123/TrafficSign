/* Debug Panel */
import { createNode } from './domHelpers.js';

let FormDebugComponent = {
  // Adding General settings : e.g. turn off text borders, change background color, show grid, etc.

  DebugPanelInit: function () {
    tabNum = 6
    var parent = GeneralHandler.PanelInit()
    if (parent) {

        // Create a container for debug info
        var debugInfoContainer = createNode("div", { 'class': 'input-group-container' }, parent);
        FormDebugComponent.createDebugInfoPanel(debugInfoContainer);
        const sponsorDiv = createNode("div", { 'class': `coffee-link-container` }, parent);
        sponsorDiv.innerHTML = '<a href="https://www.buymeacoffee.com/G1213123" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="Buy Me A Coffee" height="41" width="174" style="max-width:100%;"></a>';

        // Add GitHub repository link
        const githubLink = createNode("div", { 'class': 'github-link-container' }, sponsorDiv);
        githubLink.innerHTML = '<a href="https://github.com/G1213123/TrafficSign" target="_blank"><i class="fa-brands fa-github"></i><span>Visit GitHub Repository</span></a>';


      // Update the sidebar when an object is selected
      canvas.on('selection:created', FormDebugComponent.selectionListener);
      canvas.on('selection:updated', FormDebugComponent.selectionListener);
      canvas.on('object:modified', FormDebugComponent.selectionListener);
      // Clear the sidebar when no object is selected
      canvas.on('selection:cleared', FormDebugComponent.clearSelectionListener);
      if (canvas.getActiveObject()) {
        FormDebugComponent.updateDebugInfo(canvas.getActiveObjects());
      } 
    }
    FormDebugComponent.selectionListenerRef = FormDebugComponent.selectionListener.bind(FormDebugComponent)
    FormDebugComponent.clearSelectionListenerRef = FormDebugComponent.clearSelectionListener.bind(FormDebugComponent)
    if (tabNum == 6) {
      FormDebugComponent.DebugHandlerOn();
    }
  },
  selectionListener: function (event) {
    let selectedObject = null
    if (event.target) {
      selectedObject = event.target;
    } else {
      selectedObject = event.selected[0];
    }
    FormDebugComponent.updateDebugInfo(selectedObject);
  },
  clearSelectionListener: function (event) {
    const debugInfoPanel = document.getElementById('debug-info-panel');
    if (debugInfoPanel) {
      debugInfoPanel.innerHTML = '';
      const div = document.createElement('div');
      div.innerText = 'Select Object for Info';
      debugInfoPanel.appendChild(div);
    }
  },
  createDebugInfoPanel: function (parent) {
    const debugInfoPanel = document.createElement('div');
    debugInfoPanel.id = 'debug-info-panel';
    parent.appendChild(debugInfoPanel);
    const div = document.createElement('div');
    div.innerText = 'Select Object for Info';
    debugInfoPanel.appendChild(div);
  },

  updateDebugInfo: function (objects) {
    const debugInfoPanel = document.getElementById('debug-info-panel');
    if (debugInfoPanel) {
      objects.length ? object = objects[0] : object = objects
      debugInfoPanel.innerHTML = ''; // Clear previous info

      if (object.getEffectiveCoords) {

        const div = document.createElement('div');
        div.style.fontWeight = 'bold'; // Make text bold
        div.style.textDecoration = 'underline'; // Add underline
        div.innerText = `${object._showName}`;
        debugInfoPanel.appendChild(div);

        point = object.getEffectiveCoords()
        const properties = [
          { label: 'Top', value: Math.round(object.top) },
          { label: 'Left', value: Math.round(object.left) },
          { label: 'Right', value: Math.round(object.left+object.width) },
          { label: 'Bottom', value: Math.round(object.top+object.height) },
          { label: 'Width', value: Math.round(object.width) },
          { label: 'Height', value: Math.round(object.height) },
          { label: 'Effective Position', value: `x: ${Math.round(point[0].x)}, y: ${Math.round(point[0].y)}` },
          { label: 'Effective Width', value: Math.round(point[1].x - point[0].x) },
          { label: 'Effective Height', value: Math.round(point[2].y - point[0].y) },

        ];

        properties.forEach(prop => {
          const div = document.createElement('div');
          div.innerText = `${prop.label}: ${prop.value}`;
          debugInfoPanel.appendChild(div);
        });
      }
    }
  },

  DebugHandlerOn: function(event){
      // Update the sidebar when an object is selected
      canvas.on('selection:created', FormDebugComponent.selectionListenerRef);
      canvas.on('selection:updated', FormDebugComponent.selectionListenerRef);
      canvas.on('object:modified', FormDebugComponent.selectionListenerRef);
      // Clear the sidebar when no object is selected
      canvas.on('selection:cleared', FormDebugComponent.clearSelectionListenerRef);
  },

  DebugHandlerOff: function (event) {
      canvas.off('selection:created', FormDebugComponent.selectionListenerRef)
      canvas.off('selection:updated', FormDebugComponent.selectionListenerRef)
      canvas.off('selection:cleared', FormDebugComponent.clearSelectionListenerRef)
  }
}

// Export the FormDebugComponent for use in other files