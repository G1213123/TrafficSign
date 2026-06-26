/**
 * Main Sidebar Controller
 * 
 * This file serves as the entry point for the sidebar functionality.
 * It loads component modules on demand when they are first needed.
 */

import { GeneralHandler, GeneralSettings } from './sbGeneral.js';
import { FormTextAddComponent } from './sb-text.js';
import { FormDrawAddComponent } from './sb-draw.js';
import { FormBorderWrapComponent } from './sb-border.js';
import { FormDrawMapComponent } from './sb-map.js';
import { FormExportComponent } from './sb-export.js';
import { FormInfoComponent } from './sb-info.js';
import { FormSettingsComponent } from './sb-settings.js';
import { FormTemplateComponent } from './sb-template.js';
import { FormMeasureComponent } from './sb-measure.js';
import { CanvasTrackerUI } from './sb-tracker.js';
// Assuming CanvasObjectInspector might be needed, import if necessary
import { CanvasObjectInspector } from './sb-inspector.js';
import { CanvasGlobals } from '../canvas/canvas.js';
import { i18n } from '../i18n/i18n.js';


window.GeneralSettings = GeneralSettings; // Make GeneralSettings globally accessible
window.GeneralHandler = GeneralHandler; // Make GeneralHandler globally accessible

// Define a mapping from hash to button ID and its init function
const routeMappings = {
  'text': { buttonId: 'btn_text', initFn: FormTextAddComponent.textPanelInit },
  'draw': { buttonId: 'btn_draw', initFn: FormDrawAddComponent.drawPanelInit },
  'border': { buttonId: 'btn_border', initFn: FormBorderWrapComponent.BorderPanelInit },
  'map': { buttonId: 'btn_map', initFn: FormDrawMapComponent.drawMapPanelInit },
  'export': { buttonId: 'btn_export', initFn: FormExportComponent.exportPanelInit },
  'info': { buttonId: 'btn_info', initFn: FormInfoComponent.InfoPanelInit },
  'settings': { buttonId: 'btn_settings', initFn: FormSettingsComponent.settingsPanelInit },
  'templates': { buttonId: 'btn_template', initFn: FormTemplateComponent.templatePanelInit },
  'measure': { buttonId: 'btn_measure', initFn: FormMeasureComponent.measurePanelInit },
  'tracker': { buttonId: 'btn_tracker', initFn: () => {
    let instance = window.canvasTrackerComponentInstance;
    if (instance && instance.initialized) {
      instance.restoreUI();
    } else if (instance) {
      instance.initialize();
    }
    // Note: This assumes canvasTrackerComponentInstance is globally available or passed appropriately.
    // If not, this specific route might need a different handling strategy for initialization.
  } }
};

function activatePanelFromHash() {
  const hash = window.location.hash.substring(1); // Remove #
  const route = routeMappings[hash];
  if (route) {
    const button = document.getElementById(route.buttonId);
    if (button) {
      // Ensure the panel initialization logic is called.
      // Some panels might already be initialized by default (e.g., settings).
      // Others are initialized on click. We need to ensure the correct state.
      if (typeof route.initFn === 'function') {
        route.initFn(); // Call the panel's initialization function
      }
      // Simulate a click if the initFn doesn't cover all click actions (like UI highlighting)
      // or if direct initFn call isn't sufficient.
      // However, calling initFn is generally preferred to avoid unintended side effects of a raw click.
      // If initFn handles UI updates (like active class), a direct click might not be needed.
      // For simplicity and to ensure UI consistency, we can also trigger a click.
      // Be cautious if initFn and click handler do redundant work or conflict.
      button.click();
    }
  } else if (hash === '') {
    // Default to draw panel or settings if no hash or unknown hash
    const defaultButton = document.getElementById(routeMappings['draw'].buttonId);
    if (defaultButton) {
      defaultButton.click();
    }
  }
}

/*
function updateHash(newHash) {
  if (window.location.hash !== `#${newHash}`) {
    window.location.hash = newHash;
  }
}
*/

document.addEventListener('DOMContentLoaded', function () {
  // Initialize GeneralHandler first if needed (assuming it has an init function)
  GeneralHandler.ShowHideSideBar(null, 'on');

  // Store the tracker instance globally or in a way accessible to routeMappings
  window.canvasTrackerComponentInstance = new CanvasTrackerUI();
  // Initializing tracker here might be too early if it depends on other DOM elements not yet ready.
  // Consider initializing it within its route activation or ensuring all dependencies are met.

  // Setup button clicks to update hash and call their original functions
  Object.keys(routeMappings).forEach(hashKey => {
    const route = routeMappings[hashKey];
    const button = document.getElementById(route.buttonId);
    if (button) {
      const originalOnClick = button.onclick; // Store original if any (though addEventListener is better)
      const originalAddEventListenerFn = route.initFn; // Assuming initFn is the primary action

      button.onclick = null; // Clear existing onclick to avoid double calls if we use addEventListener
      button.addEventListener('click', function(event) {
        // Call the original initialization/handler function
        if (hashKey === 'tracker') { // Special handling for tracker
            let instance = window.canvasTrackerComponentInstance;
            if (!instance.initialized) { // Initialize tracker only if not already
                instance.initialize();
            } else {
                instance.restoreUI();
            }
        } else if (typeof originalAddEventListenerFn === 'function') {
          originalAddEventListenerFn.call(this, event); // Call the original function
        } else if (typeof originalOnClick === 'function' && hashKey !== 'tracker') {
            // Fallback for any `button.onclick = ` style handlers if not covered by initFn
            originalOnClick.call(this, event);
        }
        //updateHash(hashKey); // Update the hash
        // Apply translations for any newly created panel content
        try { i18n.applyTranslations(document.getElementById('input-form')); } catch (_) {}
      });
    }
  });


  // Settings module button - Initialize directly as it might be a default view
  // And ensure its click updates the hash
  const settingsButton = document.getElementById(routeMappings['settings'].buttonId);
  if (settingsButton) {
    // FormSettingsComponent.settingsPanelInit(); // Initialized by default or on first load
     settingsButton.addEventListener('click', () => { // Ensure hash updates
        FormSettingsComponent.settingsPanelInit(); // Redundant if already handled by generic setup, but safe
        //updateHash('settings');
    });
  }
  // Tracker needs special handling due to its instance-based setup
  const trackerButton = document.getElementById(routeMappings['tracker'].buttonId);
  if (trackerButton) {
    // The generic setup above should handle the tracker click to call its init/restore.
    // We just ensure the instance is created early enough.
    // window.canvasTrackerComponentInstance.initialize(); // Initialize tracker; might be better done lazily
  }


  // Listen for hash changes to activate panels
  window.addEventListener('hashchange', activatePanelFromHash);

  // Activate panel based on initial hash on page load
  // Ensure this runs after all buttons have their new event listeners attached.
  // activatePanelFromHash();


  // Assuming 'canvas' is a global or accessible variable
  if (typeof canvas !== 'undefined' && canvas.renderAll) {
  CanvasGlobals.scheduleRender();
  }
});

export {activatePanelFromHash}