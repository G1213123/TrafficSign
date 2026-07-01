// GeneralSettings object to store shared settings across sidebar panels
export const GeneralSettings = {
  // Default values
  showTextBorders: true,
  showObjectBorders: true,
  showGrid: true,
  snapToGrid: true,
  backgroundColor: '#2f2f2f',
  gridColor: '#ffffff',
  gridSize: 20,
  showAllVertices: false,
  autoSave: true,
  autoSaveInterval: 300,
  defaultExportScale: 2,
  runTestsOnStart: false,
  xHeight: 100,
  messageColor: 'White',
  dimensionUnit: 'mm', // 'mm' or 'sw' (sign width units)
  locale: 'en', // UI language code

  // Event listeners for setting changes
  listeners: [],

  // Method to register a listener for setting changes
  addListener: function (callback) {
    this.listeners.push(callback);
  },

  // Method to notify all listeners of setting changes
  notifyListeners: function (setting, value) {
    this.listeners.forEach(callback => {
      if (typeof callback === 'function') {
        callback(setting, value);
      }
    });
  },

  // Update a setting and notify listeners
  updateSetting: function (setting, value) {
    if (this.hasOwnProperty(setting)) {
      this[setting] = value;
      this.notifyListeners(setting, value);
    }
  },

  resetSetting: function () {
    const defaultSetting = {
      showTextBorders: true,
      showObjectBorders: true,
      showGrid: true,
      snapToGrid: true,
      backgroundColor: '#2f2f2f',
      gridColor: '#ffffff',
      gridSize: 20,
      showAllVertices: false,
      autoSave: true,
      autoSaveInterval: 300,
      defaultExportScale: 2,
      runTestsOnStart: false,
      xHeight: 100,
      messageColor: 'White',
      dimensionUnit: 'mm',
      locale: 'en'
    };

    // Apply all settings at once without triggering individual notifications
    // We'll do a single notification at the end
    for (const key in defaultSetting) {
      if (defaultSetting.hasOwnProperty(key) && this.hasOwnProperty(key)) {
        this[key] = defaultSetting[key];
      }
    }

    // Notify listeners about a complete reset instead of individual properties
    this.notifyListeners('settingsReset', null);
  },

  // Method to format dimension values based on the current unit setting
  formatDimension: function (value, xHeight = 100) {
    if (this.dimensionUnit === 'sw') {
      // Convert to sign width units (value / xHeight)
      // Sign width units are calculated as dimension divided by x-height
      const swValue = (value / xHeight * 4).toFixed(1);
      return `${swValue}sw`;
    } else {
      // Return in millimeters (default)
      return `${Math.round(value)}mm`;
    }
  }
};