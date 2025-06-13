// Setup file for Jest tests
import 'jest-canvas-mock';

// Mock fabric.js since it's not available in Node.js environment
global.fabric = {
  Canvas: jest.fn().mockImplementation(() => ({
    setZoom: jest.fn(),
    setDimensions: jest.fn(),
    absolutePan: jest.fn(),
    renderAll: jest.fn(),
    getContext: jest.fn(() => ({
      font: '',
      textBaseline: '',
      fillText: jest.fn(),
    })),
    getObjects: jest.fn(() => []),
    remove: jest.fn(),
    add: jest.fn(),
    sendObjectToBack: jest.fn(),
    calcViewportBoundaries: jest.fn(() => ({
      tl: { x: 0, y: 0 },
      br: { x: 1000, y: 1000 }
    })),
    getZoom: jest.fn(() => 1),
    getActiveObjects: jest.fn(() => []),
    discardActiveObject: jest.fn(),
    fire: jest.fn(),
    on: jest.fn(), // Add missing 'on' method for event listeners
    off: jest.fn(), // Add 'off' method as well
    viewportTransform: [1, 0, 0, 1, 0, 0],
    width: 1000,
    height: 1000,
    isDragging: false,
    lastPosX: 0,
    lastPosY: 0,
    selection: true,
    requestRenderAll: jest.fn(),
    relativePan: jest.fn(),
    zoomToPoint: jest.fn(),
    getActiveObject: jest.fn(() => null)
  })),  Object: {
    prototype: {
      toObject: jest.fn()
    }
  },
  Control: jest.fn().mockImplementation(() => ({})),
  Line: jest.fn().mockImplementation(() => ({
    set: jest.fn()
  })),
  Text: jest.fn().mockImplementation(() => ({})),
  Group: jest.fn().mockImplementation(() => ({})),
  Point: jest.fn().mockImplementation((x, y) => ({ x, y })),
  util: {
    invertTransform: jest.fn(() => [1, 0, 0, 1, 0, 0])
  }
};

// Mock DOM elements and event handling
Object.defineProperty(window, 'addEventListener', {
  value: jest.fn(),
  writable: true
});

Object.defineProperty(document, 'addEventListener', {
  value: jest.fn(),
  writable: true
});

Object.defineProperty(document, 'getElementById', {
  value: jest.fn((id) => {
    // Always return a mock element (never null) to prevent errors during testing
    return {
      id: id,
      clientWidth: 1000,
      clientHeight: 800,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      style: {
        display: '',
        left: '',
        top: '',
        width: '',
        height: ''
      },
      innerHTML: '',
      textContent: '',
      value: '',
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn(() => false),
        toggle: jest.fn()
      },
      selectedArrow: null, // For context menu
      appendChild: jest.fn(),
      removeChild: jest.fn(),
      querySelector: jest.fn(() => null),
      querySelectorAll: jest.fn(() => [])
    };
  }),
  writable: true
});

Object.defineProperty(document, 'querySelector', {
  value: jest.fn((selector) => {
    // Always return a mock element to prevent null reference errors
    return {
      selector: selector,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      style: {
        display: '',
        left: '',
        top: '',
        width: '',
        height: ''
      },
      innerHTML: '',
      textContent: '',
      classList: {
        add: jest.fn(),
        remove: jest.fn(),
        contains: jest.fn(() => false),
        toggle: jest.fn()
      },
      appendChild: jest.fn(),
      removeChild: jest.fn()
    };
  }),
  writable: true
});

Object.defineProperty(document, 'querySelectorAll', {
  value: jest.fn(() => []),
  writable: true
});

Object.defineProperty(document, 'activeElement', {
  value: {
    tagName: 'BODY'
  },
  writable: true,
  configurable: true
});

// Mock GeneralSettings global variable
global.GeneralSettings = {
  showGrid: true,
  gridColor: '#ffffff',
  gridSize: 20
};

// Mock GeneralHandler global variable
global.GeneralHandler = {
  ShowHideSideBar: jest.fn(),
  panelOpened: false
};

// Mock FormSettingsComponent
global.FormSettingsComponent = {
  saveCanvasState: jest.fn()
};

// Mock console methods
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn()
};
