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
  "Ctrl + C": "Copy Selected Object",
  "Ctrl + V": "Paste Object",
  "Ctrl + Z": "Undo",
  "Ctrl + S": "Save",
  "F3": "Toggle Text Border",
  "F4": "Toggle Grid",
  "F2": "Toggle Vertices",
  "F8": "Toggle Dimension Unit",
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

      // Create details element for collapsible behavior
      const details = GeneralHandler.createNode("details", {}, shortcutsContainer);

      // Create summary element for the heading
      const summary = GeneralHandler.createNode("summary", { 'class': 'panel-subheading', 'style': 'cursor: pointer;' }, details);
      
      // Add heading text to summary
      GeneralHandler.createI18nNode("span", {}, summary, 'Keyboard Shortcuts', 'text');

      // Create the list element inside details
      const list = GeneralHandler.createNode("ul", { 'class': 'shortcut-list' }, details);

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

      // Background image picker
      GeneralHandler.createNode("div", { 'class': 'input-container' }, canvasSettingsContainer); // spacer
      const bgImageLabel = GeneralHandler.createNode("div", { 'class': 'placeholder', 'for': 'background-image' }, canvasSettingsContainer);
      bgImageLabel.setAttribute('data-i18n', 'Background Image');
      bgImageLabel.textContent = i18n.t('Background Image');

      const bgImageInput = GeneralHandler.createNode("input", {
        'type': 'file',
        'class': 'input',
        'id': 'background-image',
        'accept': 'image/*'
      }, canvasSettingsContainer);
      bgImageInput.addEventListener('change', FormSettingsComponent.changeBackgroundImage);

      // Remove background image button
      GeneralHandler.createButton('remove-bg-image', 'Remove Background Image', canvasSettingsContainer, 'input',
        FormSettingsComponent.removeBackgroundImage, 'click');

      // OCR button
      GeneralHandler.createButton('ocr-bg-image', 'OCR Background Image', canvasSettingsContainer, 'input',
        FormSettingsComponent.runOcrOnBackgroundImage, 'click');

      // OCR results panel
      const ocrResultContainer = GeneralHandler.createNode("div", {
        'class': 'input-container ocr-result-container',
        'id': 'ocr-result-container',
        'style': 'display: none;'
      }, canvasSettingsContainer);
      const ocrResultLabel = GeneralHandler.createNode("div", { 'class': 'placeholder' }, ocrResultContainer);
      ocrResultLabel.setAttribute('data-i18n', 'OCR Result');
      ocrResultLabel.textContent = i18n.t('OCR Result');
      const ocrResultTextarea = GeneralHandler.createNode("textarea", {
        'class': 'input ocr-result-textarea',
        'id': 'ocr-result-textarea',
        'readonly': 'true',
        'rows': '4',
        'placeholder': i18n.t('OCR result will appear here...')
      }, ocrResultContainer);
      const ocrButtonsRow = GeneralHandler.createNode("div", { 'class': 'ocr-buttons-row' }, ocrResultContainer);
      const ocrCopyBtn = GeneralHandler.createNode("button", { 'class': 'input-button', 'id': 'ocr-copy-btn' }, ocrButtonsRow);
      ocrCopyBtn.textContent = i18n.t('Copy Text');
      ocrCopyBtn.addEventListener('click', FormSettingsComponent.copyOcrResult);
      const ocrClearBtn = GeneralHandler.createNode("button", { 'class': 'input-button', 'id': 'ocr-clear-btn' }, ocrButtonsRow);
      ocrClearBtn.textContent = i18n.t('Clear');
      ocrClearBtn.addEventListener('click', FormSettingsComponent.clearOcrResult);

      // OCR progress indicator
      const ocrProgressContainer = GeneralHandler.createNode("div", {
        'class': 'input-container ocr-progress-container',
        'id': 'ocr-progress-container',
        'style': 'display: none;'
      }, canvasSettingsContainer);
      const ocrProgressBar = GeneralHandler.createNode("div", { 'class': 'ocr-progress-bar', 'id': 'ocr-progress-bar' }, ocrProgressContainer);
      const ocrProgressText = GeneralHandler.createNode("div", { 'class': 'ocr-progress-text', 'id': 'ocr-progress-text' }, ocrProgressContainer);
      ocrProgressText.textContent = i18n.t('Initializing OCR...');

      // Background image size mode toggle
      GeneralHandler.createToggle('Image Fit', ['Cover', 'Contain', 'Stretch', 'Manual'], canvasSettingsContainer,
        GeneralSettings.backgroundImageSize === 'cover' ? 'Cover' :
        GeneralSettings.backgroundImageSize === 'contain' ? 'Contain' :
        GeneralSettings.backgroundImageSize === 'stretch' ? 'Stretch' : 'Manual',
        FormSettingsComponent.changeBackgroundImageSize);

      // Image opacity slider
      const opacityContainer = GeneralHandler.createNode("div", { 'class': 'input-container' }, canvasSettingsContainer);
      const opacityLabel = GeneralHandler.createNode("div", { 'class': 'placeholder', 'for': 'background-image-opacity' }, opacityContainer);
      opacityLabel.setAttribute('data-i18n', 'Image Opacity');
      opacityLabel.textContent = i18n.t('Image Opacity');

      const opacityValueDisplay = GeneralHandler.createNode("span", { 'class': 'range-value-display', 'id': 'bg-opacity-value' }, opacityContainer);
      opacityValueDisplay.textContent = Math.round(GeneralSettings.backgroundImageOpacity * 100) + '%';

      const opacityInput = GeneralHandler.createNode("input", {
        'type': 'range',
        'class': 'range-input',
        'id': 'background-image-opacity',
        'min': '0',
        'max': '100',
        'value': Math.round(GeneralSettings.backgroundImageOpacity * 100)
      }, opacityContainer);
      opacityInput.addEventListener('input', FormSettingsComponent.changeBackgroundImageOpacity);

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

      // Apply translations for all elements created in this panel
      try { i18n.applyTranslations(parent); } catch (_) { }
    }
  },

  // Helper method to create a color picker input
  createColorPicker: function (id, label, parent, defaultValue, changeCallback) {
    const container = GeneralHandler.createNode("div", { 'class': 'input-container' }, parent);
    const labelEl = GeneralHandler.createNode("div", { 'class': 'placeholder', 'for': id }, container);
    // Apply i18n to label
    labelEl.setAttribute('data-i18n', label);
    labelEl.innerText = i18n.t(label);

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
    CanvasGlobals.scheduleRender();
    FormSettingsComponent.saveSettings(); // Auto-save settings
  },

  changeBackgroundImage: async function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

    GeneralSettings.backgroundImage = dataUrl;
    GeneralSettings.backgroundImageSize = 'cover';
    GeneralSettings.backgroundImageScale = 1.0;
    await FormSettingsComponent.applyBackgroundImage();
    FormSettingsComponent.saveSettings();
  },

  removeBackgroundImage: function () {
    GeneralSettings.backgroundImage = null;
    GeneralSettings.backgroundImageSize = 'cover';
    GeneralSettings.backgroundImageScale = 1.0;
    FormSettingsComponent.applyBackgroundImage();
    const bgImageInput = document.getElementById('background-image');
    if (bgImageInput) bgImageInput.value = '';
    FormSettingsComponent.saveSettings();
  },

  changeBackgroundImageSize: async function (button) {
    const value = button.getAttribute('data-value').toLowerCase();
    GeneralSettings.backgroundImageSize = value;

    // Before re-applying (which removes and recreates the image),
    // capture the current visual scale so Manual mode preserves it.
    if (value === 'manual' && GeneralSettings.backgroundImage) {
      const currentBg = CanvasGlobals.canvas.getObjects().find(obj => obj.id === 'backgroundImage');
      if (currentBg) {
        GeneralSettings.backgroundImageScale = currentBg.scaleX;
        GeneralSettings.backgroundImageOffsetX = currentBg.left - CanvasGlobals.canvas.width / 2 / CanvasGlobals.canvas.getZoom();
        GeneralSettings.backgroundImageOffsetY = currentBg.top - CanvasGlobals.canvas.height / 2 / CanvasGlobals.canvas.getZoom();
      }
    }

    await FormSettingsComponent.applyBackgroundImage();
    if (value === 'manual') {
      FormSettingsComponent.enableBgImageManualMode();
    } else {
      FormSettingsComponent.disableBgImageManualMode();
    }
    FormSettingsComponent.saveSettings();
  },

  changeBackgroundImageOpacity: function (event) {
    const percent = parseInt(event.target.value) || 100;
    GeneralSettings.backgroundImageOpacity = percent / 100;
    const display = document.getElementById('bg-opacity-value');
    if (display) display.textContent = percent + '%';

    const existingBg = CanvasGlobals.canvas.getObjects().find(obj => obj.id === 'backgroundImage');
    if (existingBg) {
      existingBg.set('opacity', GeneralSettings.backgroundImageOpacity);
      CanvasGlobals.scheduleRender();
    }
    FormSettingsComponent.saveSettings();
  },

  // Canvas event handlers for background image manipulation in Manual mode
  _bgImageSyncHandlers: {
    _saveTimer: null,

    syncBgImageState: function () {
      const bg = CanvasGlobals.canvas.getObjects().find(obj => obj.id === 'backgroundImage');
      if (!bg) return;
      GeneralSettings.backgroundImageScale = bg.scaleX;
      GeneralSettings.backgroundImageOffsetX = bg.left - CanvasGlobals.canvas.width / 2 / CanvasGlobals.canvas.getZoom();
      GeneralSettings.backgroundImageOffsetY = bg.top - CanvasGlobals.canvas.height / 2 / CanvasGlobals.canvas.getZoom();
    },

    onObjectModified: function (e) {
      if (e.target && e.target.id === 'backgroundImage') {
        clearTimeout(FormSettingsComponent._bgImageSyncHandlers._saveTimer);
        FormSettingsComponent._bgImageSyncHandlers._saveTimer = setTimeout(() => {
          FormSettingsComponent._bgImageSyncHandlers.syncBgImageState();
          FormSettingsComponent.saveSettings();
        }, 200);
      }
    }
  },

  enableBgImageManualMode: function () {
    const bg = CanvasGlobals.canvas.getObjects().find(obj => obj.id === 'backgroundImage');
    if (!bg) return;
    bg.set({
      selectable: true,
      evented: true,
      lockMovementX: false,
      lockMovementY: false,
      lockScalingX: false,
      lockScalingY: false,
      hasControls: true,
      hasBorders: true,
      borderColor: '#4a90d9',
      cornerColor: '#4a90d9',
      cornerStyle: 'circle',
      cornerSize: 8,
      transparentCorners: false,
      borderScaleFactor: 1.5
    });
    bg.setCoords();
    CanvasGlobals.scheduleRender();
    CanvasGlobals.canvas.on('object:modified', FormSettingsComponent._bgImageSyncHandlers.onObjectModified);
  },

  disableBgImageManualMode: function () {
    CanvasGlobals.canvas.off('object:modified', FormSettingsComponent._bgImageSyncHandlers.onObjectModified);
    const bg = CanvasGlobals.canvas.getObjects().find(obj => obj.id === 'backgroundImage');
    if (!bg) return;
    if (CanvasGlobals.canvas.getActiveObject() === bg) {
      CanvasGlobals.canvas.discardActiveObject();
    }
    bg.set({
      selectable: false,
      evented: false,
      lockMovementX: true,
      lockMovementY: true,
      lockScalingX: true,
      lockScalingY: true,
      hasControls: false,
      hasBorders: false
    });
    bg.setCoords();
    CanvasGlobals.scheduleRender();
  },

  applyBackgroundImage: async function () {
    const existingBg = CanvasGlobals.canvas.getObjects().find(obj => obj.id === 'backgroundImage');
    if (existingBg) CanvasGlobals.canvas.remove(existingBg);

    if (!GeneralSettings.backgroundImage) {
      CanvasGlobals.scheduleRender();
      return;
    }

    try {
      const img = await fabric.Image.fromURL(GeneralSettings.backgroundImage, {
        crossOrigin: 'anonymous'
      });

      const canvasWidth = CanvasGlobals.canvas.width / CanvasGlobals.canvas.getZoom();
      const canvasHeight = CanvasGlobals.canvas.height / CanvasGlobals.canvas.getZoom();
      const mode = GeneralSettings.backgroundImageSize || 'cover';

      let scaleX, scaleY, left, top;

      if (mode === 'stretch') {
        scaleX = canvasWidth / img.width;
        scaleY = canvasHeight / img.height;
        left = canvasWidth / 2;
        top = canvasHeight / 2;
      } else if (mode === 'contain') {
        const ratio = Math.min(canvasWidth / img.width, canvasHeight / img.height);
        scaleX = ratio;
        scaleY = ratio;
        left = canvasWidth / 2;
        top = canvasHeight / 2;
      } else if (mode === 'manual') {
        const manualScale = GeneralSettings.backgroundImageScale || 1.0;
        scaleX = manualScale;
        scaleY = manualScale;
        left = canvasWidth / 2 + (GeneralSettings.backgroundImageOffsetX || 0);
        top = canvasHeight / 2 + (GeneralSettings.backgroundImageOffsetY || 0);
      } else {
        // cover (default)
        const ratio = Math.max(canvasWidth / img.width, canvasHeight / img.height);
        scaleX = ratio;
        scaleY = ratio;
        left = canvasWidth / 2;
        top = canvasHeight / 2;
      }

      const isManual = mode === 'manual';
      img.set({
        left: left,
        top: top,
        originX: 'center',
        originY: 'center',
        scaleX: scaleX,
        scaleY: scaleY,
        selectable: isManual,
        evented: isManual,
        lockMovementX: !isManual,
        lockMovementY: !isManual,
        lockScalingX: !isManual,
        lockScalingY: !isManual,
        hasControls: isManual,
        hasBorders: isManual,
        borderColor: '#4a90d9',
        cornerColor: '#4a90d9',
        cornerStyle: 'circle',
        cornerSize: 8,
        transparentCorners: false,
        borderScaleFactor: 1.5,
        opacity: GeneralSettings.backgroundImageOpacity,
        id: 'backgroundImage'
      });

      CanvasGlobals.canvas.add(img);
      const gridObj = CanvasGlobals.canvas.getObjects().find(obj => obj.id === 'grid');
      CanvasGlobals.canvas.sendObjectToBack(img);
      if (gridObj) CanvasGlobals.canvas.sendObjectToBack(gridObj);
      CanvasGlobals.scheduleRender();
    } catch (err) {
      console.error('Failed to load background image:', err);
    }
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

        CanvasGlobals.scheduleRender();
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

    // Apply background image
    FormSettingsComponent.applyBackgroundImage();

    // Re-enable manual mode handlers if needed
    if (GeneralSettings.backgroundImageSize === 'manual' && GeneralSettings.backgroundImage) {
      FormSettingsComponent.enableBgImageManualMode();
    }

    // Apply snap to grid
    CanvasGlobals.canvas.snap_pts = GeneralSettings.snapToGrid ?
      FormSettingsComponent.generateSnapPoints() : [];

    // Handle auto-save
    if (GeneralSettings.autoSave) {
      FormSettingsComponent.startAutoSaveTimer();
    } else {
      FormSettingsComponent.stopAutoSaveTimer();
    }

    CanvasGlobals.scheduleRender();
  },

  applyTextBorderSettings: function () {
    CanvasGlobals.canvas.getObjects().forEach(obj => {
      if (obj.functionalType === 'Text') {
        obj.txtFrameList.forEach(frame => {
          frame.set('stroke', GeneralSettings.showTextBorders ? obj.color : 'rgba(0,0,0,0)');
        })
      }
    });
    CanvasGlobals.scheduleRender();
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

    CanvasGlobals.scheduleRender();
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

    // Sync background image size toggle
    const bgSizeContainer = document.getElementById('Image Fit-container');
    if (bgSizeContainer) {
      const sizeMap = { cover: 'Cover', contain: 'Contain', stretch: 'Stretch', manual: 'Manual' };
      const targetLabel = sizeMap[GeneralSettings.backgroundImageSize] || 'Cover';
      bgSizeContainer.querySelectorAll('.toggle-button').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-value') === targetLabel);
        if (btn.getAttribute('data-value') === targetLabel) bgSizeContainer.selected = btn;
      });
    }

    // Sync background image opacity slider
    const bgOpacityInput = document.getElementById('background-image-opacity');
    if (bgOpacityInput) bgOpacityInput.value = Math.round(GeneralSettings.backgroundImageOpacity * 100);
    const bgOpacityValue = document.getElementById('bg-opacity-value');
    if (bgOpacityValue) bgOpacityValue.textContent = Math.round(GeneralSettings.backgroundImageOpacity * 100) + '%';

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
    CanvasGlobals.scheduleRender();
  },

  // --- OCR for background image ---
  runOcrOnBackgroundImage: async function () {
    if (!GeneralSettings.backgroundImage) {
      alert(i18n.t('No background image loaded. Please load a background image first.'));
      return;
    }

    const progressContainer = document.getElementById('ocr-progress-container');
    const progressBar = document.getElementById('ocr-progress-bar');
    const progressText = document.getElementById('ocr-progress-text');
    const resultContainer = document.getElementById('ocr-result-container');
    const resultTextarea = document.getElementById('ocr-result-textarea');

    progressContainer.style.display = 'block';
    resultContainer.style.display = 'none';
    progressBar.style.width = '0%';
    progressText.textContent = i18n.t('Initializing OCR...');

    try {
      const result = await Tesseract.recognize(
        GeneralSettings.backgroundImage,
        'eng+chi_tra',
        {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              const pct = Math.round(m.progress * 100);
              progressBar.style.width = pct + '%';
              progressText.textContent = i18n.t('Recognizing text...') + ' ' + pct + '%';
            } else if (m.status === 'loading language traineddata') {
              progressText.textContent = i18n.t('Loading language data...');
            }
          }
        }
      );

      progressBar.style.width = '100%';
      progressText.textContent = i18n.t('Done!');

      const text = result.data.text.trim();
      if (text) {
        resultTextarea.value = text;
        resultContainer.style.display = 'block';
        progressContainer.style.display = 'none';
      } else {
        progressText.textContent = i18n.t('No text found in image.');
        setTimeout(() => { progressContainer.style.display = 'none'; }, 2000);
      }
    } catch (err) {
      console.error('OCR error:', err);
      progressText.textContent = i18n.t('OCR failed:') + ' ' + err.message;
      setTimeout(() => { progressContainer.style.display = 'none'; }, 3000);
    }
  },

  copyOcrResult: function () {
    const textarea = document.getElementById('ocr-result-textarea');
    if (textarea && textarea.value) {
      navigator.clipboard.writeText(textarea.value).then(() => {
        const btn = document.getElementById('ocr-copy-btn');
        const original = btn.textContent;
        btn.textContent = i18n.t('Copied!');
        setTimeout(() => { btn.textContent = original; }, 1500);
      }).catch(() => {
        textarea.select();
        document.execCommand('copy');
      });
    }
  },

  clearOcrResult: function () {
    const resultContainer = document.getElementById('ocr-result-container');
    const resultTextarea = document.getElementById('ocr-result-textarea');
    const progressContainer = document.getElementById('ocr-progress-container');
    if (resultTextarea) resultTextarea.value = '';
    if (resultContainer) resultContainer.style.display = 'none';
    if (progressContainer) progressContainer.style.display = 'none';
  }
};


// Export the FormSettingsComponent for use in other files
export { FormSettingsComponent };