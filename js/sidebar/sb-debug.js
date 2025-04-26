/* Debug Panel */
import { GeneralSettings, GeneralHandler } from './sbGeneral.js';
import { CanvasGlobals } from '../canvas.js';

let FormDebugComponent = {
  // Adding General settings : e.g. turn off text borders, change background color, show grid, etc.
  DebugPanelInit: function () {
    GeneralHandler.tabNum = 9
    var parent = GeneralHandler.PanelInit()
    GeneralHandler.setActiveComponentOff(FormDebugComponent.DebugHandlerOff);
    if (parent) {

      // Create a container for debug info
      var debugInfoContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      FormDebugComponent.createDebugInfoPanel(debugInfoContainer);

      const sponsorDiv = GeneralHandler.createNode("div", { 'class': `coffee-link-container` }, parent)
      sponsorDiv.innerHTML = '<a href="https://www.buymeacoffee.com/G1213123" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="Buy Me A Coffee" height="41" width="174" style="max-width:100%;"></a>'

      // Add GitHub repository link
      const githubLink = GeneralHandler.createNode("div", { 'class': 'github-link-container' }, sponsorDiv);
      githubLink.innerHTML = '<a href="https://github.com/G1213123/TrafficSign" target="_blank"><i class="fa-brands fa-github"></i><span>Visit GitHub Repository</span></a>';

      // Add legal disclaimer
      const disclaimerDiv = GeneralHandler.createNode("div", { 'class': 'legal-disclaimer' }, parent);
      disclaimerDiv.style.fontSize = '12px';
      disclaimerDiv.style.color = '#aaa';
      disclaimerDiv.style.padding = '10px';
      disclaimerDiv.style.marginTop = '20px';
      disclaimerDiv.style.borderTop = '1px solid #444';

      disclaimerDiv.innerHTML = `
        <h4 style="margin: 5px 0; color: #ddd;">Disclaimer</h4>
        <p>Fonts used are subject to their respective licenses: Transport fonts (Crown Copyright), NotoSansHK (SIL OFL), and 教育部標準楷書字形檔(Version 5.00) (CC 「姓名標示-禁止改作」).</p>
        <p>This application is for personal and non-commercial use only.</p>
        <p>The creator assumes no liability for any damages resulting from the use of this application or its outputs.</p>
      `;

      // Update the sidebar when an object is selected
      CanvasGlobals.canvas.on('selection:created', FormDebugComponent.selectionListener);
      CanvasGlobals.canvas.on('selection:updated', FormDebugComponent.selectionListener);
      CanvasGlobals.canvas.on('object:modified', FormDebugComponent.selectionListener);
      // Clear the sidebar when no object is selected
      CanvasGlobals.canvas.on('selection:cleared', FormDebugComponent.clearSelectionListener);
      if (CanvasGlobals.canvas.getActiveObject()) {
        FormDebugComponent.updateDebugInfo(CanvasGlobals.canvas.getActiveObjects());
      }
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
    let object = null
    if (debugInfoPanel) {
      objects.length ? object = objects[0] : object = objects
      debugInfoPanel.innerHTML = ''; // Clear previous info

      if (object.getEffectiveCoords) {

        const div = document.createElement('div');
        div.style.fontWeight = 'bold'; // Make text bold
        div.style.textDecoration = 'underline'; // Add underline
        div.innerText = `${object._showName}`;
        debugInfoPanel.appendChild(div);

        const point = object.getEffectiveCoords()
        const properties = [
          { label: 'Top', value: Math.round(object.top) },
          { label: 'Left', value: Math.round(object.left) },
          { label: 'Right', value: Math.round(object.left + object.width) },
          { label: 'Bottom', value: Math.round(object.top + object.height) },
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

  DebugHandlerOff: function (event) {
    CanvasGlobals.canvas.off('selection:created', this.selectionListener)
    CanvasGlobals.canvas.off('selection:updated', this.selectionListener)
    CanvasGlobals.canvas.off('selection:cleared', this.clearSelectionListener)
  },
};

// Export the FormDebugComponent for use in other files
export { FormDebugComponent };