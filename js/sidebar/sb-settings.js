/* Settings Panel */
let FormSettingsComponent = {

  // Initialize the settings panel
  settingsPanelInit: function () {
    tabNum = 7
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      // Load saved settings if they exist
      FormSettingsComponent.loadSettings();

      // Create a container for visual settings
      var visualSettingsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      
      // Add toggle switches for visibility settings
      GeneralHandler.createToggle('Show Text Borders', ['Yes', 'No'], visualSettingsContainer, 
        GeneralSettings.showTextBorders ? 'Yes' : 'No', 
        FormSettingsComponent.toggleTextBorders);
        
      GeneralHandler.createToggle('Show Grid', ['Yes', 'No'], visualSettingsContainer, 
        GeneralSettings.showGrid ? 'Yes' : 'No', 
        FormSettingsComponent.toggleGrid);
      
      GeneralHandler.createToggle('Snap to Grid', ['Yes', 'No'], visualSettingsContainer, 
        GeneralSettings.snapToGrid ? 'Yes' : 'No', 
        FormSettingsComponent.toggleSnapToGrid);

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
      //var performanceSettingsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
//
      //// Auto-save toggle
      //GeneralHandler.createToggle('Auto Save', ['Yes', 'No'], performanceSettingsContainer, 
      //  GeneralSettings.autoSave ? 'Yes' : 'No', 
      //  FormSettingsComponent.toggleAutoSave);
      //
      //// Auto-save interval
      //GeneralHandler.createInput('auto-save-interval', 'Auto Save Interval (seconds)', performanceSettingsContainer, 
      //  GeneralSettings.autoSaveInterval,
      //  FormSettingsComponent.changeAutoSaveInterval, 'input');
//
      // Add save/reset buttons
      const buttonContainer = GeneralHandler.createNode("div", { 'class': 'settings-buttons-container' }, parent);
      
      // Save settings button
      GeneralHandler.createButton('save-settings', 'Save Settings', buttonContainer, 'input',
        FormSettingsComponent.saveSettings, 'click');
      
      // Reset settings button
      GeneralHandler.createButton('reset-settings', 'Reset Settings', buttonContainer, 'input',
        FormSettingsComponent.resetSettings, 'click');
    }
  },

  // Helper method to create a color picker input
  createColorPicker: function(id, label, parent, defaultValue, changeCallback) {
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
  toggleTextBorders: function(button) {
    const value = button.getAttribute('data-value') === 'Yes';
    GeneralSettings.showTextBorders = value;
    FormSettingsComponent.applyTextBorderSettings();
  },


  toggleGrid: function(button) {
    const value = button.getAttribute('data-value') === 'Yes';
    GeneralSettings.showGrid = value;
    FormSettingsComponent.applyGridSettings();
  },

  toggleSnapToGrid: function(button) {
    const value = button.getAttribute('data-value') === 'Yes';
    GeneralSettings.snapToGrid = value;
    // Apply snap to grid setting to canvas
    canvas.snap_pts = value ? FormSettingsComponent.generateSnapPoints() : [];
  },

  // Canvas settings change handlers
  changeBackgroundColor: function(event) {
    GeneralSettings.backgroundColor = event.target.value;
    canvas.backgroundColor = event.target.value;
    canvas.renderAll();
  },

  changeGridColor: function(event) {
    GeneralSettings.gridColor = event.target.value;
    FormSettingsComponent.applyGridSettings();
  },

  changeGridSize: function(event) {
    GeneralSettings.gridSize = parseInt(event.target.value) || 20;
    FormSettingsComponent.applyGridSettings();
    if (GeneralSettings.snapToGrid) {
      canvas.snap_pts = FormSettingsComponent.generateSnapPoints();
    }
  },

  // Performance settings handlers
  toggleAutoSave: function(button) {
    const value = button.getAttribute('data-value') === 'Yes';
    GeneralSettings.autoSave = value;
    
    // Start or stop autosave timer
    if (value) {
      FormSettingsComponent.startAutoSaveTimer();
    } else {
      FormSettingsComponent.stopAutoSaveTimer();
    }
  },

  changeAutoSaveInterval: function(event) {
    const interval = parseInt(event.target.value) || 60;
    GeneralSettings.autoSaveInterval = interval;
    
    // Restart timer if enabled
    if (GeneralSettings.autoSave) {
      FormSettingsComponent.stopAutoSaveTimer();
      FormSettingsComponent.startAutoSaveTimer();
    }
  },

  // Auto-save timer methods
  autoSaveTimerId: null,
  
  startAutoSaveTimer: function() {
    if (FormSettingsComponent.autoSaveTimerId !== null) {
      clearInterval(FormSettingsComponent.autoSaveTimerId);
    }
    
    const interval = GeneralSettings.autoSaveInterval * 1000;
    FormSettingsComponent.autoSaveTimerId = setInterval(() => {
      FormSettingsComponent.saveCanvasState();
    }, interval);
  },
  
  stopAutoSaveTimer: function() {
    if (FormSettingsComponent.autoSaveTimerId !== null) {
      clearInterval(FormSettingsComponent.autoSaveTimerId);
      FormSettingsComponent.autoSaveTimerId = null;
    }
  },

  simpleStringify: function(object) {
    const simpleObject = {};
    for (const prop in object) {
        if (!object.hasOwnProperty(prop)) {
            continue;
        }
        if (typeof(object[prop]) == 'object') {
            continue;
        }
        if (typeof(object[prop]) == 'function') {
            continue;
        }
        simpleObject[prop] = object[prop];
    }
    return JSON.stringify(simpleObject);
  },
  
  saveCanvasState: function() {
    // Save the current canvas state to localStorage
    try {
      const canvasJSON = FormSettingsComponent.simpleStringify(canvas);
      localStorage.setItem('canvasState', canvasJSON);
      console.log('Canvas state auto-saved', new Date());
    } catch (e) {
      console.error('Failed to auto-save canvas state', e);
    }
  },

  // Settings persistence
  saveSettings: function() {
    try {
      localStorage.setItem('appSettings', JSON.stringify(GeneralSettings));
      console.log('Settings saved to localStorage');
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  },
  
  loadSettings: function() {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        // Merge saved settings with defaults
        GeneralSettings = {
          ...GeneralSettings,
          ...parsedSettings
        };
        
        // Apply loaded settings to the canvas
        FormSettingsComponent.applyAllSettings();
        FormSettingsComponent.updateSettingsUI();
      } 
    } catch (e) {
      console.error('Failed to load settings', e);
    }
  },
  
  resetSettings: function() {
    // Default settings
    GeneralSettings = {
      showTextBorders: true,
      showObjectBorders: true,
      showGrid: true,
      snapToGrid: true,
      backgroundColor: '#2f2f2f',
      gridColor: '#ffffff',
      gridSize: 20,
      autoSave: true,
      autoSaveInterval: 60,
      defaultExportScale: 2
    };
    
    // Apply all settings
    FormSettingsComponent.applyAllSettings();
    
    // Update UI
    FormSettingsComponent.updateSettingsUI();

    // Save the default settings
    FormSettingsComponent.saveSettings();
    
    console.log('Settings reset to defaults');
  },
  
  // Apply settings to the canvas
  applyAllSettings: function() {
    FormSettingsComponent.applyTextBorderSettings();
    FormSettingsComponent.applyGridSettings();
    
    // Apply background color
    canvas.backgroundColor = GeneralSettings.backgroundColor;
    
    // Apply snap to grid
    canvas.snap_pts = GeneralSettings.snapToGrid ? 
      FormSettingsComponent.generateSnapPoints() : [];
    
    // Handle auto-save
    if (GeneralSettings.autoSave) {
      FormSettingsComponent.startAutoSaveTimer();
    } else {
      FormSettingsComponent.stopAutoSaveTimer();
    }
    
    canvas.renderAll();
  },
  
  applyTextBorderSettings: function() {
    canvas.getObjects().forEach(obj => {
      if (obj.functionalType === 'Text') {
        obj.txtFrameList.forEach(frame => {
          frame.set('stroke', GeneralSettings.showTextBorders ? '#fff' : 'rgba(0,0,0,0)');
        })
      }
    });
    canvas.renderAll();
  },
  
  
  applyGridSettings: function() {
    // This requires rebuilding the grid with new settings
    DrawGrid(); // This is the existing function that draws the grid
  },
  
  generateSnapPoints: function() {
    // Generate snap points based on grid size
    const gridSize = GeneralSettings.gridSize;
    const points = [];
    
    // Generate grid snap points within the current viewport
    const bounds = canvas.calcViewportBoundaries();
    const xMin = Math.floor(bounds.tl.x / gridSize) * gridSize;
    const xMax = Math.ceil(bounds.br.x / gridSize) * gridSize;
    const yMin = Math.floor(bounds.tl.y / gridSize) * gridSize;
    const yMax = Math.ceil(bounds.br.y / gridSize) * gridSize;
    
    for (let x = xMin; x <= xMax; x += gridSize) {
      for (let y = yMin; y <= yMax; y += gridSize) {
        points.push({x, y});
      }
    }
    
    return points;
  },
  
  updateSettingsUI: function() {
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
    updateToggle('Auto Save-container', GeneralSettings.autoSave);
    
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
  }
};

// Export the FormSettingsComponent for use in other files