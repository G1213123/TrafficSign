/**
 * Test utilities and helpers for the Traffic Sign application
 */

/**
 * Creates a mock canvas object with common methods
 */
export function createMockCanvas(overrides = {}) {
  return {
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
    viewportTransform: [1, 0, 0, 1, 0, 0],
    width: 1000,
    height: 1000,
    isDragging: false,
    lastPosX: 0,
    lastPosY: 0,
    ...overrides
  };
}

/**
 * Creates mock GeneralSettings with default values
 */
export function createMockGeneralSettings(overrides = {}) {
  return {
    showGrid: true,
    gridColor: '#ffffff',
    gridSize: 20,
    ...overrides
  };
}

/**
 * Helper to reset all mocks before each test
 */
export function resetAllMocks() {
  jest.clearAllMocks();
}

/**
 * Mock DOM element for canvas container
 */
export function createMockCanvasContainer(width = 1000, height = 800) {
  return {
    clientWidth: width,
    clientHeight: height
  };
}
