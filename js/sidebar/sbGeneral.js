/* General Sidebar Panel */
import { CenterCoord } from '../utils.js';


// GeneralSettings object to store shared settings across sidebar panels
export const GeneralSettings = {
  ShowHideSideBar: function (event, force = null) {
    if (force === null) {
      if (document.getElementById('side-panel').className.indexOf('open') !== -1) {
        GeneralSettings.HideSideBar();
      } else {
        GeneralSettings.ShowSideBar();
      }
    } else if (force === 'on') {
      GeneralSettings.ShowSideBar();
    } else {
      GeneralSettings.HideSideBar();
    }
  },
  ShowSideBar: function () {
    document.getElementById('side-panel').className = 'side-panel open';
    document.getElementById('show_hide').childNodes[0].className =
      'fa fa-angle-double-left';
  },
  HideSideBar: function () {
    document.getElementById('side-panel').className = 'side-panel close';
    document.getElementById('show_hide').childNodes[0].className =
      'fa fa-angle-double-right';
  },

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
  autoSaveInterval: 60,
  defaultExportScale: 2,
  runTestsOnStart: false,
  xHeight: 100,
  messageColor: 'White',

  // Event listeners for setting changes
  listeners: [],

  // Method to register a listener for setting changes
  addListener: function(callback) {
    this.listeners.push(callback);
  },

  // Method to notify all listeners of setting changes
  notifyListeners: function(setting, value) {
    this.listeners.forEach(callback => {
      if (typeof callback === 'function'){
        callback(setting, value);
      }
    });
  },

  // Update a setting and notify listeners
  updateSetting: function(setting, value) {
    if (this.hasOwnProperty(setting)) {
      this[setting] = value;
      this.notifyListeners(setting, value);
    }
  },

  resetSetting: function() {
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
      autoSaveInterval: 60,
      defaultExportScale: 2,
      runTestsOnStart: false,
      xHeight: 100,
      messageColor: 'White'
    };

    for (const key in defaultSetting) {
      if (defaultSetting.hasOwnProperty(key) && this.hasOwnProperty(key)) {
        this[key] = defaultSetting[key];
      }
    }
  }
};
// Listener for the show hide button
document.getElementById('show_hide').addEventListener('click', function (event) {
  GeneralSettings.ShowHideSideBar(event);
});


// Export the GeneralHandler for use in other files