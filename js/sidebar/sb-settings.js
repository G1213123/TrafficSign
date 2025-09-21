/* Settings Panel */
import { GeneralSettings, GeneralHandler } from './sbGeneral.js';
import { CanvasGlobals, DrawGrid } from '../canvas/canvas.js';
import { runTests, testToRun } from '../tests/test.js';
import { FormExportComponent } from './sb-export.js';
import { buildObjectsFromJSON } from '../objects/build.js';
import { FontPriorityManager } from '../modal/md-font.js';
import { i18n } from '../i18n/i18n.js';

// Define shortcuts in a constant object
const KEYBOARD_SHORTCUTS = {
  "Arrow Keys": "Nudge Selected Object",
  "Delete": "Delete Selected Object",
  "Escape": "Cancel Action / Toggle / Close Panel",
  "Enter": "Confirm Input",
  "Tab": "Switch Vertex / Unit",
  "Ctrl + Z": "Undo",
  "Ctrl + S": "Save",
};

let FormSettingsComponent = {

  // Initialize the settings panel
  settingsPanelInit: function () {
    GeneralHandler.tabNum = 10;
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      // Load saved settings if they exist
      //FormSettingsComponent.loadSettings();


      // Create a container for shortcuts
      var shortcutsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container shortcut-list-container' }, parent);

      // Create heading for shortcuts
  GeneralHandler.createI18nNode("h3", { 'class': 'panel-subheading' }, shortcutsContainer, 'Keyboard Shortcuts', 'text');

      // Create the list element
      const list = GeneralHandler.createNode("ul", { 'class': 'shortcut-list' }, shortcutsContainer);

      // Loop through the shortcuts object and create list items
      for (const key in KEYBOARD_SHORTCUTS) {
        if (KEYBOARD_SHORTCUTS.hasOwnProperty(key)) {
          const description = KEYBOARD_SHORTCUTS[key];

          // Create list item
          const listItem = GeneralHandler.createNode("li", { 'class': 'shortcut-item' }, list);

          // Create key span
          const keySpan = GeneralHandler.createNode("span", { 'class': 'shortcut-key' }, listItem);
          keySpan.textContent = key;

          // Create description span
          const descriptionSpan = GeneralHandler.createNode("span", { 'class': 'shortcut-description' }, listItem);
          descriptionSpan.setAttribute('data-i18n', description);
          descriptionSpan.textContent = description;
        }
      }

      // Create a container for visual settings
      var visualSettingsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);

      // App Language toggle
      GeneralHandler.createToggle('App Language', ['English', 'Chinese'], visualSettingsContainer,
        (GeneralSettings.locale === 'zh') ? 'Chinese' : 'English',
        FormSettingsComponent.toggleAppLanguage);

      // Add toggle switches for visibility settings
      GeneralHandler.createToggle('Show Text Borders', ['Yes', 'No'], visualSettingsContainer,
        GeneralSettings.showTextBorders ? 'Yes' : 'No',
        FormSettingsComponent.toggleTextBorders);

      GeneralHandler.createToggle('Show Grid', ['Yes', 'No'], visualSettingsContainer,
        GeneralSettings.showGrid ? 'Yes' : 'No',
        FormSettingsComponent.toggleGrid);

      // Show All Vertices toggle
      GeneralHandler.createToggle('Show All Vertices', ['Yes', 'No'], visualSettingsContainer,
        GeneralSettings.showAllVertices ? 'Yes' : 'No',
        FormSettingsComponent.toggleShowAllVertices);

      // Dimension Unit toggle
      GeneralHandler.createToggle('Dimension Unit', ['mm', 'sw'], visualSettingsContainer,
        GeneralSettings.dimensionUnit || 'mm',
        FormSettingsComponent.toggleDimensionUnit);

      //GeneralHandler.createToggle('Snap to Grid', ['Yes', 'No'], visualSettingsContainer, 
      //  GeneralSettings.snapToGrid ? 'Yes' : 'No', 
      //  FormSettingsComponent.toggleSnapToGrid);

      // Create a container for canvas settings
      var canvasSettingsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);

      // Background color picker
      const bgColorPicker = FormSettingsComponent.createColorPicker(
        'background-color',
        'Background Color',
        canvasSettingsContainer,
        GeneralSettings.backgroundColor,
        FormSettingsComponent.changeBackgroundColor
      );

      // Grid color picker
      const gridColorPicker = FormSettingsComponent.createColorPicker(
        'grid-color',
        'Grid Color',
        canvasSettingsContainer,
        GeneralSettings.gridColor,
        FormSettingsComponent.changeGridColor
      );

      // Grid size input
      GeneralHandler.createInput('grid-size', 'Grid Size', canvasSettingsContainer,
        GeneralSettings.gridSize,
        FormSettingsComponent.changeGridSize, 'input');

      // Create a container for performance settings
      var performanceSettingsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      
      // Auto-save toggle
      GeneralHandler.createToggle('Auto Save', ['Yes', 'No'], performanceSettingsContainer, 
        GeneralSettings.autoSave ? 'Yes' : 'No', 
        FormSettingsComponent.toggleAutoSave);
      
      // Auto-save interval
      GeneralHandler.createInput('auto-save-interval', 'Auto Save Interval (seconds)', performanceSettingsContainer, 
        GeneralSettings.autoSaveInterval,
        FormSettingsComponent.changeAutoSaveInterval, 'input');
      
      // Add save/reset buttons
      const buttonContainer = GeneralHandler.createNode("div", { 'class': 'settings-buttons-container' }, performanceSettingsContainer);

      // Manual Save button
      GeneralHandler.createButton('manual-save', 'Save Canvas', buttonContainer, 'input',
        FormSettingsComponent.saveCanvasState, 'click');

      // Clear Saved Canvas button
      GeneralHandler.createButton('clear-saved-canvas', 'Clear Saved Canvas', buttonContainer, 'input',
        FormSettingsComponent.clearSavedCanvas, 'click');

      // Reset settings button
      GeneralHandler.createButton('reset-settings', 'Reset Settings', buttonContainer, 'input',
        FormSettingsComponent.resetSettings, 'click');

      // Create a container for testing
      var testingContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);


      // Add Run Tests button
      GeneralHandler.createButton('run-tests', 'Run Tests', testingContainer, 'input',
        FormSettingsComponent.runTests, 'click');

      // Add Run Tests on Start toggle
      GeneralHandler.createToggle('Run Tests on Start', ['Yes', 'No'], testingContainer,
        GeneralSettings.runTestsOnStart ? 'Yes' : 'No',
        FormSettingsComponent.toggleRunTestsOnStart);
    }
  },

  // Helper method to create a color picker input
  createColorPicker: function (id, label, parent, defaultValue, changeCallback) {
    const container = GeneralHandler.createNode("div", { 'class': 'input-container' }, parent);
    const labelEl = GeneralHandler.createNode("div", { 'class': 'placeholder', 'for': id }, container);
    labelEl.innerHTML = label;

    const input = GeneralHandler.createNode("input", {
      'type': 'color',
      'class': 'color-picker',
      'id': id,
      'value': defaultValue
    }, container, changeCallback, 'input');

    return input;
  },

  // Visual settings toggle handlers
  toggleAppLanguage: function (button) {
    const value = button.getAttribute('data-value');
    const locale = (value === 'Chinese') ? 'zh' : 'en';
    GeneralSettings.locale = locale;
    FormSettingsComponent.saveSettings();
    try {
      i18n.setLocale(locale);
      i18n.applyTranslations(document);
    } catch (e) {
      console.warn('Failed to apply translations:', e);
    }
  },

  toggleTextBorders: function (button) {
    const value = button.getAttribute('data-value') === 'Yes';
    GeneralSettings.showTextBorders = value;
    FormSettingsComponent.applyTextBorderSettings();
    FormSettingsComponent.saveSettings(); // Auto-save settings
  },

  toggleGrid: function (button) {
    const value = button.getAttribute('data-value') === 'Yes';
    GeneralSettings.showGrid = value;
    FormSettingsComponent.applyGridSettings();
    FormSettingsComponent.saveSettings(); // Auto-save settings
  },

  toggleSnapToGrid: function (button) {
    const value = button.getAttribute('data-value') === 'Yes';
    GeneralSettings.snapToGrid = value;
    // Apply snap to grid setting to canvas
    CanvasGlobals.canvas.snap_pts = value ? FormSettingsComponent.generateSnapPoints() : [];
    FormSettingsComponent.saveSettings(); // Auto-save settings
  },

  // Toggle handler for Show All Vertices
  toggleShowAllVertices: function (button) {
    const value = button.getAttribute('data-value') === 'Yes';
    GeneralSettings.showAllVertices = value;
    FormSettingsComponent.applyVertexDisplaySettings();
    FormSettingsComponent.saveSettings(); // Auto-save settings
  },

  // Toggle handler for Dimension Unit
  toggleDimensionUnit: function (button) {
    const value = button.getAttribute('data-value');
    GeneralSettings.dimensionUnit = value;
    
    // Refresh any visible dimension displays
    FormSettingsComponent.refreshDimensionDisplays();
    
    FormSettingsComponent.saveSettings(); // Auto-save settings
  },

  // Toggle handler for Run Tests on Start
  toggleRunTestsOnStart: function (button) {
    const value = button.getAttribute('data-value') === 'Yes';
    GeneralSettings.runTestsOnStart = value;
    FormSettingsComponent.saveSettings(); // Auto-save settings
  },

  // Canvas settings change handlers
  changeBackgroundColor: function (event) {
    GeneralSettings.backgroundColor = event.target.value;
    CanvasGlobals.canvas.backgroundColor = event.target.value;
    CanvasGlobals.canvas.renderAll();
    FormSettingsComponent.saveSettings(); // Auto-save settings
  },

  changeGridColor: function (event) {
    GeneralSettings.gridColor = event.target.value;
    FormSettingsComponent.applyGridSettings();
    FormSettingsComponent.saveSettings(); // Auto-save settings
  },

  changeGridSize: function (event) {
    GeneralSettings.gridSize = parseInt(event.target.value) || 20;
    FormSettingsComponent.applyGridSettings();
    if (GeneralSettings.snapToGrid) {
      CanvasGlobals.canvas.snap_pts = FormSettingsComponent.generateSnapPoints();
    }
    FormSettingsComponent.saveSettings(); // Auto-save settings
  },

  // Performance settings handlers
  toggleAutoSave: function (button) {
    const value = button.getAttribute('data-value') === 'Yes';
    GeneralSettings.autoSave = value;

    // Start or stop autosave timer
    if (value) {
      FormSettingsComponent.startAutoSaveTimer();
    } else {
      FormSettingsComponent.stopAutoSaveTimer();
    }
    FormSettingsComponent.saveSettings(); // Auto-save settings
  },

  changeAutoSaveInterval: function (event) {
    const interval = parseInt(event.target.value) || 60;
    GeneralSettings.autoSaveInterval = interval;

    // Restart timer if enabled
    if (GeneralSettings.autoSave) {
      FormSettingsComponent.stopAutoSaveTimer();
      FormSettingsComponent.startAutoSaveTimer();
    }
    FormSettingsComponent.saveSettings(); // Auto-save settings
  },

  // Auto-save timer methods
  autoSaveTimerId: null,

  startAutoSaveTimer: function () {
    if (FormSettingsComponent.autoSaveTimerId !== null) {
      clearInterval(FormSettingsComponent.autoSaveTimerId);
    }

    const interval = GeneralSettings.autoSaveInterval * 1000;
    FormSettingsComponent.autoSaveTimerId = setInterval(() => {
      FormSettingsComponent.saveCanvasState();
    }, interval);
  },

  stopAutoSaveTimer: function () {
    if (FormSettingsComponent.autoSaveTimerId !== null) {
      clearInterval(FormSettingsComponent.autoSaveTimerId);
      FormSettingsComponent.autoSaveTimerId = null;
    }
  },

  simpleStringify: function (object) {
    const simpleObject = {};
    for (const prop in object) {
      if (!object.hasOwnProperty(prop)) {
        continue;
      }
      if (typeof (object[prop]) == 'object') {
        continue;
      }
      if (typeof (object[prop]) == 'function') {
        continue;
      }
      simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject);
  },

  saveCanvasState: function () {
    // Save the current canvas state to localStorage
    try {
      // Save canvas properties (background color, etc.)
      const canvasJSON = FormSettingsComponent.simpleStringify(CanvasGlobals.canvas);
      localStorage.setItem('canvasState', canvasJSON);

      // Save canvas objects (shapes, texts, etc.)
      const canvasObjects = FormExportComponent.exportCanvasToJSON(false);
      localStorage.setItem('canvasObjects', canvasObjects);

      console.log('Canvas state and objects auto-saved', new Date());
      // Optionally, provide user feedback about the save
      // For example, using a toast notification or a status message
      GeneralHandler.showToast("Canvas state saved!"); 
    } catch (e) {
      console.error('Failed to auto-save canvas state', e);
      GeneralHandler.showToast("Error saving canvas state.", "error");
    }
  },

  clearSavedCanvas: function () {
    try {
      localStorage.removeItem('canvasState');
      localStorage.removeItem('canvasObjects');
      console.log('Saved canvas state and objects cleared from localStorage');
      GeneralHandler.showToast("Cleared saved canvas data!");
      // Optionally, you might want to reload or reset the canvas view here
      // For example, by reloading the page or resetting the canvas to a default state
      // CanvasGlobals.canvas.clear(); // Example: Clears the canvas
      // FormSettingsComponent.loadSettings(); // Reloads initial settings without saved state
    } catch (e) {
      console.error('Failed to clear saved canvas state', e);
      GeneralHandler.showToast("Error clearing saved canvas data.", "error");
    }
  },

  // Settings persistence
  saveSettings: function () {
    try {
      // Save settings
      localStorage.setItem('appSettings', JSON.stringify(GeneralSettings));

      // Also save canvas state
      //FormSettingsComponent.saveCanvasState();

      console.log('Settings and canvas state saved to localStorage');
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },

  loadCanvasState: async function () {
    try {
      const savedCanvas = localStorage.getItem('canvasState');
      if (savedCanvas) {
        const parsedCanvas = JSON.parse(savedCanvas);

        // Apply saved canvas properties
        //for (const prop in parsedCanvas) {
        //  if (CanvasGlobals.canvas.hasOwnProperty(prop) && typeof CanvasGlobals.canvas[prop] !== 'function' && CanvasGlobals.canvas[prop] !== 'width' && CanvasGlobals.canvas[prop] !== 'height' ) {
        //    CanvasGlobals.canvas[prop] = parsedCanvas[prop];
        //  }
        //}

        // Reload canvas objects if they're saved separately
        if (localStorage.getItem('canvasObjects')) {
          try {
            const jsonData = JSON.parse(localStorage.getItem('canvasObjects'));
            if (jsonData.meta && Array.isArray(jsonData.objects)) {
              console.log("Importing JSON with metadata:", jsonData.meta);
              const objectsToLoad = jsonData.objects;
              if (typeof buildObjectsFromJSON === 'function') {
                await buildObjectsFromJSON(objectsToLoad, CanvasGlobals.canvas);
              } else {
                console.error("buildObjectsFromJSON function is not available.");
                // As a fallback, try Fabric's loadFromJSON if custom deserialization isn't critical
                // Note: This will not handle custom object types or re-linking logic.
                // CanvasGlobals.canvas.loadFromJSON(jsonString, () => {
                //   CanvasGlobals.canvas.renderAll();
                //   console.log("Canvas loaded from JSON using Fabric.js default loader.");
                // });
              }
            } else {
              // Assume old format (array of objects) for backward compatibility
              objectsToLoad = jsonData;
              console.log("Importing JSON in old format (array of objects).");
            }
          } catch (e) {
            console.error('Failed to load canvas objects', e);
          }
        }

        CanvasGlobals.canvas.renderAll();
        console.log('Canvas state loaded from localStorage');
        return true;
      }
      return false;
    } catch (e) {
      console.error('Failed to load canvas state', e);
      return false;
    }
  },

  loadSettings: async function () {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);

        // Update existing settings instead of reassigning
        Object.keys(parsedSettings).forEach(key => {
          if (GeneralSettings.hasOwnProperty(key)) {
            GeneralSettings[key] = parsedSettings[key];
          }
        });

        // Apply loaded settings to the canvas
        FormSettingsComponent.applyAllSettings();
        FormSettingsComponent.updateSettingsUI();

        // Run tests if enabled
        if (GeneralSettings.runTestsOnStart) {
          FormSettingsComponent.runTests();
        }

      }
      this.startAutoSaveTimer()
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  },
  resetSettings: function () {
    // Default settings
    GeneralSettings.resetSetting();

    // Reset font manager settings
    try {
      FontPriorityManager.resetToDefaults();
      console.log('Font manager settings reset successfully');
    } catch (error) {
      console.error('Error resetting font manager settings:', error);
    }

    // Apply all settings
    FormSettingsComponent.applyAllSettings();

    // Update UI
    FormSettingsComponent.updateSettingsUI();

    // Save the default settings and clear canvas objects
    //localStorage.removeItem('canvasObjects');
    FormSettingsComponent.saveSettings();

    console.log('Settings reset to defaults');
    GeneralHandler.showToast("Settings reset to defaults!");
  },

  // Apply settings to the canvas
  applyAllSettings: function () {
    FormSettingsComponent.applyTextBorderSettings();
    FormSettingsComponent.applyGridSettings();
    FormSettingsComponent.applyVertexDisplaySettings();

    // Apply background color
    CanvasGlobals.canvas.backgroundColor = GeneralSettings.backgroundColor;

    // Apply snap to grid
    CanvasGlobals.canvas.snap_pts = GeneralSettings.snapToGrid ?
      FormSettingsComponent.generateSnapPoints() : [];

    // Handle auto-save
    if (GeneralSettings.autoSave) {
      FormSettingsComponent.startAutoSaveTimer();
    } else {
      FormSettingsComponent.stopAutoSaveTimer();
    }

    CanvasGlobals.canvas.renderAll();
  },

  applyTextBorderSettings: function () {
    CanvasGlobals.canvas.getObjects().forEach(obj => {
      if (obj.functionalType === 'Text') {
        obj.txtFrameList.forEach(frame => {
          frame.set('stroke', GeneralSettings.showTextBorders ? obj.color : 'rgba(0,0,0,0)');
        })
      }
    });
    CanvasGlobals.canvas.renderAll();
  },


  applyGridSettings: function () {
    // This requires rebuilding the grid with new settings
    DrawGrid(); // This is the existing function that draws the grid
  },

  applyVertexDisplaySettings: function () {
    // Update the active object if there is one
    const activeObject = CanvasGlobals.canvas.getActiveObject();
    if (activeObject && activeObject instanceof fabric.BaseGroup) {
      activeObject.drawVertex(false);
    }

    // Also update all BaseGroup objects on the canvas to ensure 
    // they respect the setting when selected later
    CanvasGlobals.canvasObject.forEach(obj => {
      if (obj instanceof fabric.BaseGroup && obj.basePolygon) {
        obj.drawVertex(false);
      }
    });

    CanvasGlobals.canvas.renderAll();
  },

  generateSnapPoints: function () {
    // Generate snap points based on grid size
    const gridSize = GeneralSettings.gridSize;
    const points = [];

    // Generate grid snap points within the current viewport
    const bounds = CanvasGlobals.canvas.calcViewportBoundaries();
    const xMin = Math.floor(bounds.tl.x / gridSize) * gridSize;
    const xMax = Math.ceil(bounds.br.x / gridSize) * gridSize;
    const yMin = Math.floor(bounds.tl.y / gridSize) * gridSize;
    const yMax = Math.ceil(bounds.br.y / gridSize) * gridSize;

    for (let x = xMin; x <= xMax; x += gridSize) {
      for (let y = yMin; y <= yMax; y += gridSize) {
        points.push({ x, y });
      }
    }

    return points;
  },

  updateSettingsUI: function () {
    // Update UI elements to reflect current settings
    const updateToggle = (id, value) => {
      const container = document.getElementById(id);
      if (!container) return;

      const buttons = container.querySelectorAll('.toggle-button');
      buttons.forEach(button => {
        const isActive = (button.getAttribute('data-value') === 'Yes') === value;
        if (isActive) {
          button.classList.add('active');
          container.selected = button;
        } else {
          button.classList.remove('active');
        }
      });
    };

    // Update toggles
    updateToggle('Show Text Borders-container', GeneralSettings.showTextBorders);
    updateToggle('Show Object Borders-container', GeneralSettings.showObjectBorders);
    updateToggle('Show Grid-container', GeneralSettings.showGrid);
    updateToggle('Snap to Grid-container', GeneralSettings.snapToGrid);
    updateToggle('Show All Vertices-container', GeneralSettings.showAllVertices);
    updateToggle('Auto Save-container', GeneralSettings.autoSave);
    updateToggle('Run Tests on Start-container', GeneralSettings.runTestsOnStart);

    // Update App Language toggle
    const langContainer = document.getElementById('App Language-container');
    if (langContainer) {
      const buttons = langContainer.querySelectorAll('.toggle-button');
      const desired = GeneralSettings.locale === 'zh' ? 'Chinese' : 'English';
      buttons.forEach(btn => {
        const isActive = btn.getAttribute('data-value') === desired;
        btn.classList.toggle('active', isActive);
        if (isActive) { langContainer.selected = btn; }
      });
    }

    // Handle dimension unit toggle separately (it's not a boolean)
    const updateDimensionUnit = (id, value) => {
      const container = document.getElementById(id);
      if (!container) return;

      const buttons = container.querySelectorAll('.toggle-button');
      buttons.forEach(button => {
        const isActive = button.getAttribute('data-value') === value;
        if (isActive) {
          button.classList.add('active');
          container.selected = button;
        } else {
          button.classList.remove('active');
        }
      });
    };
    updateDimensionUnit('Dimension Unit-container', GeneralSettings.dimensionUnit);

    // Update color inputs
    const bgColorInput = document.getElementById('background-color');
    if (bgColorInput) bgColorInput.value = GeneralSettings.backgroundColor;

    const gridColorInput = document.getElementById('grid-color');
    if (gridColorInput) gridColorInput.value = GeneralSettings.gridColor;

    // Update number inputs
    const gridSizeInput = document.getElementById('grid-size');
    if (gridSizeInput) gridSizeInput.value = GeneralSettings.gridSize;

    const autoSaveIntervalInput = document.getElementById('auto-save-interval');
    if (autoSaveIntervalInput) autoSaveIntervalInput.value = GeneralSettings.autoSaveInterval;
  },

  // Run tests function
  runTests: function () {
    if (typeof runTests === 'function' && typeof testToRun !== 'undefined') {
      console.clear();
      console.log("Starting tests from settings panel...");
      runTests(testToRun);
    } else {
      console.error("Test runner not available. Make sure test.js is loaded.");
    }
  },

  // Refresh dimension displays when unit setting changes
  refreshDimensionDisplays: function () {
    // Refresh lock icon dimensions
    if (CanvasGlobals.canvasObject) {
      CanvasGlobals.canvasObject.forEach(obj => {
        if (obj.lockIcons && obj.lockIcons.length > 0) {
          obj.lockIcons.forEach(lockIcon => {
            if (lockIcon.refreshDimensions && typeof lockIcon.refreshDimensions === 'function') {
              lockIcon.refreshDimensions();
            }
          });
        }
      });
    }
    
    // Force canvas re-render
    CanvasGlobals.canvas.renderAll();
  }
};


// Export the FormSettingsComponent for use in other files
export { FormSettingsComponent };