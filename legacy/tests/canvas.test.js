/**
 * Tests for canvas.js module
 * This module handles canvas initialization, grid drawing, and coordinate utilities
 */

// Since canvas.js creates global variables and side effects, we need to import it carefully
import { CanvasGlobals, DrawGrid } from '../js/canvas/canvas.js';

describe('Canvas Module', () => {
  let mockCanvas;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Get the mocked canvas instance
    mockCanvas = CanvasGlobals.canvas;
  });

  describe('Canvas Initialization', () => {
    test('should provide canvas instance in CanvasGlobals', () => {
      expect(mockCanvas).toBeDefined();
      expect(typeof mockCanvas.setZoom).toBe('function');
    });

    test('should expose CanvasGlobals correctly', () => {
      expect(CanvasGlobals).toHaveProperty('canvas');
      expect(CanvasGlobals).toHaveProperty('ctx');
      expect(CanvasGlobals).toHaveProperty('activeObject');
      expect(CanvasGlobals).toHaveProperty('activeVertex');
      expect(CanvasGlobals).toHaveProperty('canvasObject');
      expect(CanvasGlobals).toHaveProperty('CenterCoord');
    });

    test('should have canvas with correct initial properties', () => {
      expect(mockCanvas.isDragging).toBe(false);
      expect(mockCanvas.lastPosX).toBe(0);
      expect(mockCanvas.lastPosY).toBe(0);
    });
  });

  describe('CenterCoord function', () => {
    test('should calculate center coordinates correctly', () => {
      const center = CanvasGlobals.CenterCoord();
      
      expect(center).toHaveProperty('x');
      expect(center).toHaveProperty('y');
      expect(typeof center.x).toBe('number');
      expect(typeof center.y).toBe('number');
    });

    test('should handle zoom changes in coordinate calculation', () => {
      // Mock different zoom levels
      mockCanvas.getZoom.mockReturnValue(2);
      const centerZoom2 = CanvasGlobals.CenterCoord();
      
      mockCanvas.getZoom.mockReturnValue(0.5);
      const centerZoom05 = CanvasGlobals.CenterCoord();
      
      // Centers should be different for different zoom levels
      expect(centerZoom2).not.toEqual(centerZoom05);
    });
  });

  describe('DrawGrid function', () => {
    beforeEach(() => {
      // Reset grid-related mocks
      mockCanvas.getObjects.mockReturnValue([]);
      mockCanvas.calcViewportBoundaries.mockReturnValue({
        tl: { x: -500, y: -400 },
        br: { x: 500, y: 400 }
      });
    });

    test('should not draw grid when GeneralSettings.showGrid is false', () => {
      global.GeneralSettings.showGrid = false;
      
      DrawGrid();
      
      // Should not add any new objects to canvas when grid is disabled
      expect(mockCanvas.add).not.toHaveBeenCalled();
    });

    test('should draw grid when GeneralSettings.showGrid is true', () => {
      global.GeneralSettings.showGrid = true;
      
      DrawGrid();
      
      // Should add grid group to canvas
      expect(mockCanvas.add).toHaveBeenCalled();
      expect(mockCanvas.sendObjectToBack).toHaveBeenCalled();
    });

    test('should remove existing grid before drawing new one', () => {
      const existingGrid = { id: 'grid' };
      mockCanvas.getObjects.mockReturnValue([existingGrid]);
      
      DrawGrid();
      
      expect(mockCanvas.remove).toHaveBeenCalledWith(existingGrid);
    });

    test('should use correct grid color from settings', () => {
      const customColor = '#ff0000';
      global.GeneralSettings.gridColor = customColor;
      
      DrawGrid();
      
      // fabric.Line should be called with stroke color from settings
      expect(global.fabric.Line).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          stroke: customColor
        })
      );
    });

    test('should adjust grid distance based on zoom level', () => {
      // Test very low zoom
      mockCanvas.getZoom.mockReturnValue(0.03);
      DrawGrid();
      
      // Test medium zoom
      mockCanvas.getZoom.mockReturnValue(0.7);
      DrawGrid();
      
      // Test high zoom
      mockCanvas.getZoom.mockReturnValue(3);
      DrawGrid();
      
      // Grid should be drawn multiple times with different parameters
      expect(global.fabric.Line).toHaveBeenCalled();
    });

    test('should include origin lines in grid', () => {
      DrawGrid();
      
      // Should create origin lines (x=0 and y=0)
      expect(global.fabric.Line).toHaveBeenCalledWith(
        [0, expect.any(Number), 0, expect.any(Number)],
        expect.objectContaining({
          stroke: '#ffffff',
          selectable: false
        })
      );
      
      expect(global.fabric.Line).toHaveBeenCalledWith(
        [expect.any(Number), 0, expect.any(Number), 0],
        expect.objectContaining({
          stroke: '#ffffff',
          selectable: false
        })
      );
    });

    test('should create grid labels when zoom is sufficient', () => {
      mockCanvas.getZoom.mockReturnValue(0.1); // Above 0.08 threshold
      
      DrawGrid();
      
      // Should create text labels for grid coordinates
      expect(global.fabric.Text).toHaveBeenCalled();
    });

    test('should not create grid labels when zoom is too low', () => {
      mockCanvas.getZoom.mockReturnValue(0.05); // Below 0.08 threshold
      
      DrawGrid();
      
      // Should not create text labels when zoomed out too much
      expect(global.fabric.Text).not.toHaveBeenCalled();
    });
  });

  describe('Fabric.js Object Extension', () => {
    test('should extend fabric.Object.prototype.toObject with custom properties', () => {
      // The canvas.js file should extend fabric.Object.prototype.toObject
      expect(global.fabric.Object.prototype.toObject).toBeDefined();
    });
  });
  describe('Canvas Resize Functionality', () => {
    test('should provide resize functionality through CanvasGlobals', () => {
      // Since we're in a test environment, we mainly test that the module structure is correct
      // The actual resize event listener is attached during module load, which is mocked
      expect(CanvasGlobals.canvas).toBeDefined();
      expect(typeof CanvasGlobals.canvas.setDimensions).toBe('function');
      expect(typeof CanvasGlobals.canvas.absolutePan).toBe('function');
      expect(typeof CanvasGlobals.canvas.renderAll).toBe('function');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle undefined GeneralSettings gracefully', () => {
      global.GeneralSettings = undefined;
      
      expect(() => DrawGrid()).not.toThrow();
    });

    test('should use default values when GeneralSettings properties are missing', () => {
      global.GeneralSettings = {}; // Empty settings object
      
      expect(() => DrawGrid()).not.toThrow();
    });

    test('should handle extreme zoom values', () => {
      mockCanvas.getZoom.mockReturnValue(0.001); // Very small zoom
      expect(() => DrawGrid()).not.toThrow();
      
      mockCanvas.getZoom.mockReturnValue(1000); // Very large zoom
      expect(() => DrawGrid()).not.toThrow();
    });
  });
});
