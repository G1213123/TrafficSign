import { CanvasGlobals, DrawGrid } from '../../components/canvas/canvas.js';
import { i18n } from '../i18n/i18n.js';

const STORAGE_KEY = 'appSettings';
const CANVAS_STATE_KEY = 'canvasState';
const CANVAS_OBJECTS_KEY = 'canvasObjects';

const DEFAULT_SETTINGS = {
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
  locale: 'en',
};

const persistSettings = (settings) => {
  const snapshot = Object.keys(DEFAULT_SETTINGS).reduce((accumulator, key) => {
    accumulator[key] = settings[key];
    return accumulator;
  }, {});

  localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
};

const getCanvas = () => CanvasGlobals.canvas;

const getCanvasObjects = () => {
  const canvas = getCanvas();
  return canvas?.getObjects?.() || [];
};

const simpleStringify = (object) => {
  const simpleObject = {};

  for (const prop in object) {
    if (!Object.prototype.hasOwnProperty.call(object, prop)) {
      continue;
    }

    if (typeof object[prop] === 'object') {
      continue;
    }

    if (typeof object[prop] === 'function') {
      continue;
    }

    simpleObject[prop] = object[prop];
  }

  return JSON.stringify(simpleObject);
};

const exportCanvasToJSON = () => {
  const canvas = getCanvas();
  if (!canvas) {
    return null;
  }

  const objectsToSerialize = CanvasGlobals.canvasObject || getCanvasObjects();
  const serializedObjectsArray = [];

  for (const object of objectsToSerialize) {
    if (typeof object?.serializeToJSON === 'function') {
      serializedObjectsArray.push(object.serializeToJSON());
    }
  }

  const appNameMeta = document.querySelector('meta[name="application-name"]');
  const appVersionMeta = document.querySelector('meta[name="application-version"]');

  const exportData = {
    meta: {
      title: appNameMeta ? appNameMeta.getAttribute('content') : 'TrafficSign',
      version: appVersionMeta ? appVersionMeta.getAttribute('content') : '0.0.0',
      exportDate: new Date().toISOString(),
    },
    objects: serializedObjectsArray,
  };

  return JSON.stringify(exportData, null, 2);
};

const applyLocale = (locale) => {
  try {
    i18n.setLocale(locale);
    i18n.applyTranslations(document);
  } catch (_) {
    // Ignore translation failures in environments without a mounted document tree.
  }
};

const applyAllCanvasSettings = () => {
  GeneralSettings.applyTextBorderSettings();
  GeneralSettings.applyGridSettings();
  GeneralSettings.applyVertexDisplaySettings();
  GeneralSettings.refreshDimensionDisplays();

  const canvas = getCanvas();
  if (!canvas) return;

  canvas.backgroundColor = GeneralSettings.backgroundColor;

  canvas.snap_pts = GeneralSettings.snapToGrid ? GeneralSettings.generateSnapPoints() : [];

  if (GeneralSettings.autoSave) {
    GeneralSettings.startAutoSaveTimer();
  } else {
    GeneralSettings.stopAutoSaveTimer();
  }

  canvas.requestRenderAll?.();
};

export const GeneralSettings = {
  ...DEFAULT_SETTINGS,

  listeners: [],
  autoSaveTimerId: null,

  addListener(callback) {
    this.listeners.push(callback);
  },

  notifyListeners(setting, value) {
    this.listeners.forEach((callback) => {
      if (typeof callback === 'function') {
        callback(setting, value);
      }
    });
  },

  updateSetting(setting, value) {
    if (!Object.prototype.hasOwnProperty.call(DEFAULT_SETTINGS, setting)) {
      return;
    }

    this[setting] = value;

    if (setting === 'locale') {
      applyLocale(value);
    }

    if (setting === 'showTextBorders') {
      this.applyTextBorderSettings();
    }

    if (setting === 'showGrid') {
      this.applyGridSettings();
    }

    if (setting === 'showAllVertices') {
      this.applyVertexDisplaySettings();
    }

    if (setting === 'dimensionUnit') {
      this.refreshDimensionDisplays();
    }

    if (setting === 'autoSave') {
      if (value) {
        this.startAutoSaveTimer();
      } else {
        this.stopAutoSaveTimer();
      }
    }

    if (setting === 'gridSize' || setting === 'snapToGrid') {
      const canvas = getCanvas();
      if (canvas) {
        canvas.snap_pts = this.snapToGrid ? this.generateSnapPoints() : [];
        canvas.requestRenderAll?.();
      }
    }

    this.notifyListeners(setting, value);
    this.saveSettings();
  },

  resetSetting() {
    Object.keys(DEFAULT_SETTINGS).forEach((key) => {
      this[key] = DEFAULT_SETTINGS[key];
    });

    applyLocale(this.locale);
    this.notifyListeners('settingsReset', null);
    applyAllCanvasSettings();
    this.saveSettings();
  },

  saveSettings() {
    try {
      persistSettings(this);
    } catch (error) {
      console.error('Failed to save settings', error);
    }
  },

  loadSettings() {
    try {
      const savedSettings = localStorage.getItem(STORAGE_KEY);
      if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        Object.keys(DEFAULT_SETTINGS).forEach((key) => {
          if (Object.prototype.hasOwnProperty.call(parsedSettings, key)) {
            this[key] = parsedSettings[key];
          }
        });
      }

      applyLocale(this.locale);
      applyAllCanvasSettings();
      this.updateSettingsUI();

      if (this.runTestsOnStart) {
        this.runTests();
      }

      this.saveSettings();
    } catch (error) {
      console.error('Failed to load settings', error);
    }
  },

  updateSettingsUI() {
    this.notifyListeners('settingsUpdated', null);
  },

  applyTextBorderSettings() {
    getCanvasObjects().forEach((object) => {
      if (typeof object.updateTextElements === 'function') {
        object.updateTextElements();
      }
    });
    getCanvas()?.requestRenderAll?.();
  },

  applyGridSettings() {
    const canvas = getCanvas();
    if (!canvas) return;

    const existingGrid = canvas.getObjects?.().find((object) => object.id === 'grid');
    if (existingGrid) {
      canvas.remove(existingGrid);
    }

    if (this.showGrid) {
      DrawGrid();
    } else {
      canvas.requestRenderAll?.();
    }
  },

  applyVertexDisplaySettings() {
    getCanvasObjects().forEach((object) => {
      if (typeof object.drawVertex === 'function') {
        object.drawVertex(false);
      }
    });
    getCanvas()?.requestRenderAll?.();
  },

  refreshDimensionDisplays() {
    getCanvasObjects().forEach((object) => {
      if (typeof object.refreshDimensions === 'function') {
        object.refreshDimensions();
      }
    });
    getCanvas()?.requestRenderAll?.();
  },

  generateSnapPoints() {
    const canvas = getCanvas();
    if (!canvas) return [];

    const points = [];
    const step = Number(this.gridSize) || 20;
    const viewport = canvas.calcViewportBoundaries?.();
    if (!viewport) return points;

    const xmin = viewport.tl.x;
    const xmax = viewport.br.x;
    const ymin = viewport.tl.y;
    const ymax = viewport.br.y;

    for (let x = Math.floor(xmin / step) * step; x <= xmax; x += step) {
      for (let y = Math.floor(ymin / step) * step; y <= ymax; y += step) {
        points.push({ x, y });
      }
    }

    return points;
  },

  startAutoSaveTimer() {
    if (this.autoSaveTimerId !== null) {
      clearInterval(this.autoSaveTimerId);
    }

    this.autoSaveTimerId = setInterval(() => {
      this.saveCanvasState();
    }, Math.max(1, Number(this.autoSaveInterval) || 300) * 1000);
  },

  stopAutoSaveTimer() {
    if (this.autoSaveTimerId !== null) {
      clearInterval(this.autoSaveTimerId);
      this.autoSaveTimerId = null;
    }
  },

  saveCanvasState() {
    const canvas = getCanvas();
    if (!canvas) return;

    try {
      localStorage.setItem(CANVAS_STATE_KEY, simpleStringify(canvas));
      const exportedCanvas = exportCanvasToJSON();
      if (exportedCanvas) {
        localStorage.setItem(CANVAS_OBJECTS_KEY, exportedCanvas);
      }
    } catch (error) {
      console.error('Failed to save canvas state', error);
    }
  },

  clearSavedCanvas() {
    try {
      localStorage.removeItem(CANVAS_STATE_KEY);
      localStorage.removeItem(CANVAS_OBJECTS_KEY);
    } catch (error) {
      console.error('Failed to clear saved canvas state', error);
    }
  },

  runTests() {
    import('../tests/test.js').then(({ runTests, testToRun }) => {
      runTests(testToRun);
    }).catch((error) => {
      console.error('Failed to run tests', error);
    });
  },

  formatDimension(value, xHeight = 100) {
    if (this.dimensionUnit === 'sw') {
      const swValue = (value / xHeight * 4).toFixed(1);
      return `${swValue}sw`;
    }

    return `${Math.round(value)}mm`;
  },
};