/**
 * Main Sidebar Controller
 * 
 * This file serves as the entry point for the sidebar functionality.
 * It loads component modules on demand when they are first needed.
 */

// Initialize global variables

let tabNum = 2;


// Keyboard shortcut for showing/hiding sidebar
function ShowHideSideBarEvent(e) {
  switch (e.keyCode) {
    case 27: // esc
      GeneralHandler.ShowHideSideBar(e);
      break;
  }
}

/**
 * Module loading system - Tracks which modules have been loaded
 * and dynamically loads them when needed
 */
const SidebarModuleSystem = {
  loadedModules: {},

  // Module definitions with their corresponding file paths
  modules: {
    'GeneralHandler': 'js/sidebar/sbGeneral.js',
    'FormTextAddComponent': 'js/sidebar/sb-text.js',
    'FormDrawAddComponent': 'js/sidebar/sb-draw.js',
    'FormBorderWrapComponent': 'js/sidebar/sb-border.js',
    'FormDrawMapComponent': 'js/sidebar/sb-map.js',
    'FormExportComponent': 'js/sidebar/sb-export.js',
    'FormDebugComponent': 'js/sidebar/sb-debug.js',
    'FormSettingsComponent': 'js/sidebar/sb-settings.js',
    'FormTemplateComponent': 'js/sidebar/sb-template.js',
    'CanvasObjectInspector': 'js/sidebar/sb-inspector.js',
    'CanvasTrackerUI': 'js/sidebar/sb-tracker.js'
  },

  /**
   * Load a module dynamically
   * @param {string} moduleName - Name of the module to load
   * @returns {Promise} - Resolves when the module is loaded
   */
  loadModule: function (moduleName) {
    return new Promise((resolve, reject) => {
      // If module is already loaded, resolve immediately
      if (this.loadedModules[moduleName]) {
        resolve(window[moduleName]);
        return;
      }

      const moduleUrl = this.modules[moduleName];
      if (!moduleUrl) {
        reject(new Error(`Module ${moduleName} not found in module registry`));
        return;
      }

      // Create a script element to load the module
      const script = document.createElement('script');
      script.src = `${moduleUrl}?v=${Date.now()}`; // Add timestamp to prevent caching
      script.async = true;

      // Handle script loading events
      script.onload = () => {
        this.loadedModules[moduleName] = true;
        resolve(window[moduleName]);
      };

      script.onerror = () => {
        reject(new Error(`Failed to load module ${moduleName} from ${moduleUrl}`));
      };

      // Add the script element to the document
      document.head.appendChild(script);
    });
  },

  /**
   * Ensure multiple modules are loaded
   * @param {Array<string>} moduleNames - Array of module names to load
   * @returns {Promise} - Resolves when all modules are loaded
   */
  ensureModulesLoaded: function (moduleNames) {
    const promises = moduleNames.map(name => this.loadModule(name));
    return Promise.all(promises);
  }
};

/**
 * Initialize the sidebar when the document is loaded
 */
document.addEventListener('DOMContentLoaded', function () {
  // Load the GeneralHandler module first as it's required by all other modules
  SidebarModuleSystem.loadModule('GeneralHandler').then(() => {
    // Set up the sidebar state
    GeneralHandler.ShowHideSideBar(null, 'on');


  }).then(() => {
    // Add event listeners to sidebar buttons that will load their modules on first click

    // Settings module button
    SidebarHelpers.loadSettingsModule().then(module => {
      FormSettingsComponent.settingsPanelInit();
      document.getElementById('btn_settings').onclick = FormSettingsComponent.settingsPanelInit || function () { };
    });

    // Event listener for the tracker button
    if (typeof CanvasTrackerComponent == 'undefined') {
      SidebarHelpers.loadTrackerModule().then(module => {
        // Create singleton instance
        window.CanvasTrackerComponent = new CanvasTrackerUI();
      });
    }
    document.getElementById('btn_tracker').addEventListener('click', function () {
      if (CanvasTrackerComponent && CanvasTrackerComponent.initialized) {
        CanvasTrackerComponent.restoreUI();
      } else {
        CanvasTrackerComponent.initialize();
      }
    });
    
    // Text module button
    document.getElementById('btn_text').addEventListener('click', function (e) {
      SidebarHelpers.loadTextModule().then(module => {
        // After first load, subsequent clicks can directly call the handler
        document.getElementById('btn_text').onclick = FormTextAddComponent.textPanelInit || function () { };
      });
    });

    // Draw module button (# Default module)
    SidebarHelpers.loadDrawModule().then(module => {
      document.getElementById('btn_draw').onclick = FormDrawAddComponent.drawPanelInit || function () { };
    });


    // Border module button
    document.getElementById('btn_border').addEventListener('click', function (e) {
      SidebarHelpers.loadBorderModule().then(module => {
        document.getElementById('btn_border').onclick = FormBorderWrapComponent.BorderPanelInit || function () { };
      });
    });

    // Map module button
    document.getElementById('btn_map').addEventListener('click', function (e) {
      SidebarHelpers.loadMapModule().then(module => {
        document.getElementById('btn_map').onclick = FormDrawMapComponent.drawMapPanelInit || function () { };
      });
    });

    // Export module button
    document.getElementById('btn_export').addEventListener('click', function (e) {
      SidebarHelpers.loadExportModule().then(module => {
        document.getElementById('btn_export').onclick = FormExportComponent.exportPanelInit || function () { };
      });
    });
    // Debug module button (if it exists)
    const debugBtn = document.getElementById('btn_debug');
    if (debugBtn) {
      debugBtn.addEventListener('click', function (e) {
        SidebarHelpers.loadDebugModule().then(module => {
          debugBtn.onclick = FormDebugComponent.DebugPanelInit || function () { };
        });
      });
    }
    
    // Template module button
    const templateBtn = document.getElementById('btn_template');
    if (templateBtn) {
      templateBtn.addEventListener('click', function (e) {
        SidebarHelpers.loadTemplateModule().then(module => {
          templateBtn.onclick = FormTemplateComponent.templatePanelInit || function () { };
        });
      });
    }

    canvas.renderAll();


  });
});

/**
 * Module helper functions for the sidebar buttons
 */
const SidebarHelpers = {
  loadTextModule: function () {
    return SidebarModuleSystem.loadModule('FormTextAddComponent')
      .then(module => {
        FormTextAddComponent.textPanelInit();
        return module;
      });
  },

  loadDrawModule: function () {
    return SidebarModuleSystem.loadModule('FormDrawAddComponent')
      .then(module => {
        FormDrawAddComponent.drawPanelInit();
        return module;
      });
  },

  loadBorderModule: function () {
    return SidebarModuleSystem.loadModule('FormBorderWrapComponent')
      .then(module => {
        FormBorderWrapComponent.BorderPanelInit();
        return module;
      });
  },

  loadMapModule: function () {
    return SidebarModuleSystem.loadModule('FormDrawMapComponent')
      .then(module => {
        FormDrawMapComponent.drawMapPanelInit();
        return module;
      });
  },

  loadExportModule: function () {
    return SidebarModuleSystem.loadModule('FormExportComponent')
      .then(module => {
        FormExportComponent.exportPanelInit();
        return module;
      });
  },

  loadTrackerModule: function () {
    return SidebarModuleSystem.loadModule('CanvasTrackerUI')
      .then(CanvasTrackerUIClass => {
        const trackerUI = new CanvasTrackerUI();
        if (trackerUI.initialized) {
          trackerUI.restoreUI();
        } else {
          trackerUI.initialize();
        }
        return trackerUI;
      });
  },

  loadDebugModule: function () {
    return SidebarModuleSystem.loadModule('FormDebugComponent')
      .then(module => {
        FormDebugComponent.DebugPanelInit();
        return module;
      });
  },
  loadSettingsModule: function () {
    return SidebarModuleSystem.loadModule('FormSettingsComponent')
      .then(module => {
        FormSettingsComponent.settingsPanelInit();
        return module;
      });
  },
  
  loadTemplateModule: function () {
    return SidebarModuleSystem.loadModule('FormTemplateComponent')
      .then(module => {
        FormTemplateComponent.templatePanelInit();
        return module;
      });
  }
};

// Export sidebar helpers for use in events.js
window.SidebarHelpers = SidebarHelpers;

