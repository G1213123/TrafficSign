/* Info Panel */
import { GeneralSettings, GeneralHandler } from './sbGeneral.js';
import { CanvasGlobals } from '../canvas/canvas.js';

let FormInfoComponent = {
  // Adding General settings : e.g. turn off text borders, change background color, show grid, etc.
  InfoPanelInit: function () {
    GeneralHandler.tabNum = 9
    GeneralHandler.PanelInit() // Call PanelInit to clear the form and set up handlers
    GeneralHandler.setActiveComponentOff(FormInfoComponent.InfoHandlerOff); // Register the off handler

    // Find the static info content div
    const staticInfoContent = document.getElementById('info-content-static');
    if (staticInfoContent) {
      // Make the static content visible (it stays in its original place in index.html)
      staticInfoContent.style.display = 'block';
    } else {
      console.error("Static info content div (#info-content-static) not found in HTML.");
    }
  },

  // Function to hide the static info panel when switching tabs or closing panel
  InfoHandlerOff: function () {
    const staticInfoContent = document.getElementById('info-content-static');
    if (staticInfoContent) {
      staticInfoContent.style.display = 'none';
    }
  },
};

// Export the FormInfoComponent for use in other files
export { FormInfoComponent };