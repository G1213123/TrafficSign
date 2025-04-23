/**
 * Main Sidebar Controller
 * 
 * This file serves as the entry point for the sidebar functionality.
 * It loads component modules on demand when they are first needed.
 */

import { GeneralHandler , GeneralSettings} from './sbGeneral.js';
import { FormTextAddComponent } from './sb-text.js';
import { FormDrawAddComponent } from './sb-draw.js';
import { FormBorderWrapComponent } from './sb-border.js';
import { FormDrawMapComponent } from './sb-map.js';
import { FormExportComponent } from './sb-export.js';
import { FormDebugComponent } from './sb-debug.js';
import { FormSettingsComponent } from './sb-settings.js';
import { FormTemplateComponent } from './sb-template.js';
import { FormMeasureComponent } from './sb-measure.js';
import { CanvasTrackerUI } from './sb-tracker.js';
// Assuming CanvasObjectInspector might be needed, import if necessary
import {CanvasObjectInspector} from './sb-inspector.js';
import { CanvasGlobals } from '../canvas.js';


window.GeneralSettings = GeneralSettings; // Make GeneralSettings globally accessible
window.GeneralHandler = GeneralHandler; // Make GeneralHandler globally accessible

document.addEventListener('DOMContentLoaded', function () {
  // Initialize GeneralHandler first if needed (assuming it has an init function)
  GeneralHandler.ShowHideSideBar(null, 'on');

  // Settings module button - Initialize directly
  FormSettingsComponent.settingsPanelInit();
  document.getElementById('btn_settings').onclick = FormSettingsComponent.settingsPanelInit;

  // Tracker module button
  let canvasTrackerComponentInstance; // Keep instance reference
  document.getElementById('btn_tracker').addEventListener('click', function () {
    if (!canvasTrackerComponentInstance) {
      canvasTrackerComponentInstance = new CanvasTrackerUI();
      canvasTrackerComponentInstance.initialize();
    } else {
      if (canvasTrackerComponentInstance.initialized) { // Check if already initialized
        canvasTrackerComponentInstance.restoreUI();
      } else {
        canvasTrackerComponentInstance.initialize(); // Initialize if not yet done
      }
    }
  });

  // Text module button
  const btnText = document.getElementById('btn_text');
  btnText.addEventListener('click', FormTextAddComponent.textPanelInit); // Directly assign handler
  btnText.onclick = FormTextAddComponent.textPanelInit; // Keep the onclick assignment if you still want to replace the listener after first click

  // Draw module button (# Default module)
  FormDrawAddComponent.drawPanelInit(); // Initialize Draw panel by default
  document.getElementById('btn_draw').onclick = FormDrawAddComponent.drawPanelInit;

  // Border module button
  document.getElementById('btn_border').onclick = FormBorderWrapComponent.BorderPanelInit;

  // Map module button
  document.getElementById('btn_map').onclick = FormDrawMapComponent.drawMapPanelInit;

  // Export module button
  document.getElementById('btn_export').onclick = FormExportComponent.exportPanelInit;

  // Debug module button (if it exists)
  const debugBtn = document.getElementById('btn_debug');
  if (debugBtn) {
    debugBtn.onclick = FormDebugComponent.DebugPanelInit;
  }

  // Template module button
  const templateBtn = document.getElementById('btn_template');
  if (templateBtn) {
    templateBtn.onclick = FormTemplateComponent.templatePanelInit;
  }

  // Measure tool button
  const measureBtn = document.getElementById('btn_measure');
  if (measureBtn) {
    measureBtn.onclick = FormMeasureComponent.measurePanelInit;
  }

  // Assuming 'canvas' is a global or accessible variable
  if (typeof canvas !== 'undefined' && canvas.renderAll) {
    canvas.renderAll();
  }
});

