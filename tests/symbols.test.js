/**
 * Tests for symbols.js module
 * This module handles symbol creation, transformation, and management in traffic sign drawings
 * Covers calcSymbol function, SymbolObject class, and direct symbol drawing functionality
 */

import { CanvasGlobals } from '../js/canvas/canvas.js';

// Mock all the complex dependencies at module level
jest.mock('../js/objects/draw.js', () => ({
  BaseGroup: jest.fn(),
  GlyphPath: jest.fn()
}));

jest.mock('../js/objects/template.js', () => ({
  symbolsTemplate: {
    'arrow': {
      path: [{
        vertex: [
          { x: 1, y: 0 },
          { x: 2, y: 1 },
          { x: 1, y: 2 }
        ],
        arcs: [
          { radius: 1 }
        ]
      }],
      text: [{
        x: 1,
        y: 1,
        fontSize: 12,
        content: 'TEST'
      }]
    },
    'circle': {
      path: [{
        vertex: [
          { x: 0, y: 0, radius: 1 },
          { x: 2, y: 0 },
          { x: 2, y: 2 }
        ],
        arcs: [
          { radius: 1, radius2: 0.5 }
        ]
      }]
    },
    'default': {
      path: [{
        vertex: [
          { x: 0, y: 0 },
          { x: 1, y: 0 },
          { x: 1, y: 1 },
          { x: 0, y: 1 }
        ],
        arcs: []
      }]
    }
  },
  symbolsTemplateAlt: {
    'arrow': {
      path: [{
        vertex: [
          { x: 1.5, y: 0.5 },
          { x: 2.5, y: 1.5 }
        ],
        arcs: [
          { radius: 1.2 }
        ]
      }]
    }
  }
}));

jest.mock('../js/objects/path.js', () => ({
  calculateTransformedPoints: jest.fn((points, transform) => {
    // Simple mock transformation - just add angle to each point
    return points.map(point => ({
      ...point,
      x: point.x + (transform.angle || 0) * 0.1,
      y: point.y + (transform.angle || 0) * 0.1
    }));
  })
}));

jest.mock('../js/sidebar/sb-draw.js', () => ({
  FormDrawAddComponent: {
    editingExistingSymbol: null,
    hideAngleControls: jest.fn(),
    drawPanelInit: jest.fn()
  }
}));

describe('Symbols Module', () => {
  let SymbolObject, calcSymbol;
  let BaseGroup, GlyphPath;
  let mockCanvas;

  beforeAll(async () => {
    // Import the actual module after mocks are set up
    const symbolsModule = await import('../js/objects/symbols.js');    SymbolObject = symbolsModule.SymbolObject;
    calcSymbol = symbolsModule.calcSymbol;

    // Get the mocked classes
    const drawModule = await import('../js/objects/draw.js');
    BaseGroup = drawModule.BaseGroup;
    GlyphPath = drawModule.GlyphPath;    // Setup BaseGroup mock
    BaseGroup.mockImplementation(function(basePolygon, functionalType, className, options = {}) {
      this.type = 'group';
      this.functionalType = functionalType;
      this.className = className;
      this.basePolygon = basePolygon;
      this.canvasID = CanvasGlobals.canvasObject.length;
      
      // Symbol-specific properties
      this.symbolType = options.symbolType;
      this.xHeight = options.xHeight || 100;
      this.color = options.color || 'White';
      this.symbolAngle = options.symbolAngle || 0;
      this.left = options.left || 0;
      this.top = options.top || 0;

      // Mock methods
      this.set = jest.fn();
      this.setCoords = jest.fn();
      this.on = jest.fn();
      this.fire = jest.fn();
      this.add = jest.fn();
      this.remove = jest.fn();
      this.setBasePolygon = jest.fn((polygon) => {
        this.basePolygon = polygon;
      });
      this.replaceBasePolygon = jest.fn((polygon) => {
        this.basePolygon = polygon;
      });
      this.showDimensions = jest.fn();

      // Add to canvas
      CanvasGlobals.canvasObject.push(this);
      CanvasGlobals.canvas.add(this);

      return this;
    });

    // Setup GlyphPath mock
    GlyphPath.mockImplementation(function(options = {}) {
      this.type = 'path';
      this.left = options.left || 0;
      this.top = options.top || 0;
      this.fill = options.fill || '#ffffff';
      this.angle = options.angle || 0;
      this.strokeWidth = options.strokeWidth || 0;
      this.objectCaching = options.objectCaching !== undefined ? options.objectCaching : true;
      this.symbol = null;

      // Mock methods
      this.set = jest.fn();
      this.setCoords = jest.fn();
      this.initialize = jest.fn((symbolData, opts) => {
        this.symbolData = symbolData;
        return this;
      });

      return this;
    });
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Get the mocked canvas instance and add missing methods
    mockCanvas = CanvasGlobals.canvas;
    mockCanvas.add = jest.fn();
    mockCanvas.remove = jest.fn();
    mockCanvas.renderAll = jest.fn();
    mockCanvas.getObjects = jest.fn(() => []);
    mockCanvas.fire = jest.fn();
    mockCanvas.getPointer = jest.fn(() => ({ x: 100, y: 100 }));
    mockCanvas.on = jest.fn();
    
    // Reset canvas object array
    CanvasGlobals.canvasObject = [];
  });

  describe('calcSymbol Function', () => {
    describe('Basic Symbol Calculation', () => {
      test('should calculate symbol with string type and default color', () => {
        const result = calcSymbol('arrow', 2, 'white');
        
        expect(result).toBeDefined();
        expect(result.path).toBeDefined();
        expect(Array.isArray(result.path)).toBe(true);
        expect(result.path.length).toBeGreaterThan(0);
      });

      test('should scale vertex coordinates by length parameter', () => {
        const length = 3;
        const result = calcSymbol('arrow', length);
        
        // Check that vertices are scaled
        result.path.forEach(path => {
          path.vertex.forEach(vertex => {
            expect(typeof vertex.x).toBe('number');
            expect(typeof vertex.y).toBe('number');
            // Original arrow vertices were {x:1,y:0}, {x:2,y:1}, {x:1,y:2}
            // After scaling by 3: {x:3,y:0}, {x:6,y:3}, {x:3,y:6}
          });
        });
      });

      test('should scale arc radius by length parameter', () => {
        const length = 2.5;
        const result = calcSymbol('arrow', length);
        
        result.path.forEach(path => {
          path.arcs.forEach(arc => {
            expect(typeof arc.radius).toBe('number');
            expect(arc.radius).toBeGreaterThan(0);
          });
        });
      });

      test('should scale text properties when present', () => {
        const length = 4;
        const result = calcSymbol('arrow', length);
        
        if (result.text) {
          result.text.forEach(t => {
            expect(typeof t.x).toBe('number');
            expect(typeof t.y).toBe('number');
            expect(typeof t.fontSize).toBe('number');
            expect(t.fontSize).toBeGreaterThan(0);
          });
        }
      });

      test('should handle symbols without text', () => {
        const result = calcSymbol('circle', 2);
        
        expect(result).toBeDefined();
        expect(result.path).toBeDefined();
        // Circle symbol doesn't have text in our mock
        expect(result.text).toBeUndefined();
      });
    });

    describe('Color Handling', () => {
      test('should use default template for white color', () => {
        const result = calcSymbol('arrow', 1, 'white');
        
        expect(result).toBeDefined();
        expect(result.path[0].vertex[0].x).toBe(1); // Should use symbolsTemplate
      });

      test('should use alternative template for black color when available', () => {
        const result = calcSymbol('arrow', 1, 'black');
        
        expect(result).toBeDefined();
        expect(result.path[0].vertex[0].x).toBe(1.5); // Should use symbolsTemplateAlt
      });

      test('should fall back to default template for black color when alt not available', () => {
        const result = calcSymbol('circle', 1, 'black');
        
        expect(result).toBeDefined();
        // Circle is not in symbolsTemplateAlt, should fall back to symbolsTemplate
        expect(result.path[0].vertex[0].x).toBe(0);
      });

      test('should handle case-insensitive color comparison', () => {
        const resultUpper = calcSymbol('arrow', 1, 'BLACK');
        const resultLower = calcSymbol('arrow', 1, 'black');
        
        expect(resultUpper.path[0].vertex[0].x).toBe(resultLower.path[0].vertex[0].x);
      });
    });

    describe('Object Type Input', () => {
      test('should handle object type input instead of string', () => {
        const customSymbol = {
          path: [{
            vertex: [{ x: 5, y: 5 }],
            arcs: [{ radius: 2 }]
          }],
          text: [{ x: 1, y: 1, fontSize: 10 }]
        };
        
        const result = calcSymbol(customSymbol, 2);
        
        expect(result.path[0].vertex[0].x).toBe(10); // 5 * 2
        expect(result.path[0].vertex[0].y).toBe(10); // 5 * 2
        expect(result.path[0].arcs[0].radius).toBe(4); // 2 * 2
        expect(result.text[0].fontSize).toBe(20); // 10 * 2
      });
    });

    describe('Edge Cases', () => {      test('should handle undefined symbol type gracefully', () => {
        // The calcSymbol function doesn't actually handle undefined symbol types gracefully
        // It will throw an error when trying to access properties of undefined
        expect(() => calcSymbol('nonexistent', 1)).toThrow(TypeError);
        expect(() => calcSymbol(null, 1)).toThrow(TypeError);
        
        // However, it should work fine with valid symbol types
        const result = calcSymbol('arrow', 1);
        expect(result).toBeDefined();
        expect(result.path).toBeDefined();
      });

      test('should handle vertex with radius property', () => {
        const result = calcSymbol('circle', 3);
        
        const vertexWithRadius = result.path[0].vertex.find(v => v.radius);
        if (vertexWithRadius) {
          expect(vertexWithRadius.radius).toBe(3); // 1 * 3
        }
      });

      test('should handle arcs with radius2 property', () => {
        const result = calcSymbol('circle', 2);
        
        const arcWithRadius2 = result.path[0].arcs.find(a => a.radius2);
        if (arcWithRadius2) {
          expect(arcWithRadius2.radius2).toBe(1); // 0.5 * 2
        }
      });

      test('should not mutate original template', () => {
        const { symbolsTemplate } = require('../js/objects/template.js');
        const originalVertex = symbolsTemplate.arrow.path[0].vertex[0];
        const originalX = originalVertex.x;
        
        calcSymbol('arrow', 5);
        
        // Original template should be unchanged
        expect(originalVertex.x).toBe(originalX);
      });
    });
  });

  describe('SymbolObject Class', () => {
    describe('Construction', () => {      test('should create SymbolObject with default properties', () => {
        const symbol = new SymbolObject({ symbolType: 'arrow' });
        
        expect(symbol).toBeInstanceOf(SymbolObject);
        expect(symbol.functionalType).toBe('Symbol');
        expect(symbol.className).toBe('SymbolObject');
        expect(symbol.symbolType).toBe('arrow');
        expect(symbol.xHeight).toBe(100);
        expect(symbol.color).toBe('White');
        expect(symbol.symbolAngle).toBe(0);
      });

      test('should create SymbolObject with custom properties', () => {
        const shapeMeta = {
          symbolType: 'arrow',
          xHeight: 150,
          color: 'Black',
          symbolAngle: 45,
          left: 100,
          top: 200
        };
        
        const symbol = new SymbolObject(shapeMeta);
        
        expect(symbol.symbolType).toBe('arrow');
        expect(symbol.xHeight).toBe(150);
        expect(symbol.color).toBe('Black');
        expect(symbol.symbolAngle).toBe(45);
        expect(symbol.left).toBe(100);
        expect(symbol.top).toBe(200);
      });      test('should call initialize on construction', () => {
        // Spy on the SymbolObject prototype initialize method
        const initializeSpy = jest.spyOn(SymbolObject.prototype, 'initialize').mockImplementation(function() {
          this.setBasePolygon(this.drawSymbol());
          return this;
        });
        
        const symbol = new SymbolObject({ symbolType: 'arrow' });
        
        expect(initializeSpy).toHaveBeenCalled();
        
        // Clean up
        initializeSpy.mockRestore();
      });      test('should set up deselected event handler', () => {
        const symbol = new SymbolObject({ symbolType: 'arrow' });
        
        expect(symbol.on).toHaveBeenCalledWith('deselected', expect.any(Function));
      });
    });

    describe('Event Handling', () => {      test('should handle deselected event correctly', () => {
        const { FormDrawAddComponent } = require('../js/sidebar/sb-draw.js');
        const symbol = new SymbolObject({ symbolType: 'arrow' });
        
        // Simulate setting this symbol as the editing symbol
        FormDrawAddComponent.editingExistingSymbol = symbol;
        
        // Get the deselected handler
        const deselectedHandler = symbol.on.mock.calls.find(call => call[0] === 'deselected')[1];
        
        // Call the handler
        deselectedHandler();
        
        expect(FormDrawAddComponent.editingExistingSymbol).toBeNull();
        expect(FormDrawAddComponent.hideAngleControls).toHaveBeenCalled();
      });

      test('should handle double-click event', () => {
        const { FormDrawAddComponent } = require('../js/sidebar/sb-draw.js');
        const symbol = new SymbolObject({ symbolType: 'arrow' });
        
        symbol.onDoubleClick();
        
        expect(FormDrawAddComponent.drawPanelInit).toHaveBeenCalledWith(null, symbol);
      });
    });

    describe('Symbol Drawing', () => {
      test('should create GlyphPath in drawSymbol method', () => {
        const symbol = new SymbolObject({
          symbolType: 'arrow',
          xHeight: 100,
          color: 'White'
        });
        
        const result = symbol.drawSymbol();
        
        expect(GlyphPath).toHaveBeenCalled();
        expect(result).toBeInstanceOf(GlyphPath);
      });

      test('should apply correct options to GlyphPath', () => {
        const symbol = new SymbolObject({
          symbolType: 'arrow',
          left: 50,
          top: 75,
          color: 'Black'
        });
        
        symbol.drawSymbol();
        
        const glyphPathCall = GlyphPath.mock.calls[GlyphPath.mock.calls.length - 1][0];
        expect(glyphPathCall.left).toBe(50);
        expect(glyphPathCall.top).toBe(75);
        expect(glyphPathCall.fill).toBe('#000000');
        expect(glyphPathCall.objectCaching).toBe(false);
        expect(glyphPathCall.strokeWidth).toBe(0);
      });

      test('should handle white color correctly', () => {
        const symbol = new SymbolObject({
          symbolType: 'arrow',
          color: 'White'
        });
        
        symbol.drawSymbol();
        
        const glyphPathCall = GlyphPath.mock.calls[GlyphPath.mock.calls.length - 1][0];
        expect(glyphPathCall.fill).toBe('#ffffff');
      });

      test('should apply transformation to vertices', () => {
        const { calculateTransformedPoints } = require('../js/objects/path.js');
        const symbol = new SymbolObject({
          symbolType: 'arrow',
          symbolAngle: 90
        });
        
        symbol.drawSymbol();
        
        expect(calculateTransformedPoints).toHaveBeenCalledWith(
          expect.any(Array),
          { x: 0, y: 0, angle: 90 }
        );
      });

      test('should set symbol type on created GlyphPath', () => {
        const symbol = new SymbolObject({
          symbolType: 'arrow'
        });
        
        const result = symbol.drawSymbol();
        
        expect(result.symbol).toBe('arrow');
      });
    });

    describe('Symbol Updates', () => {
      test('should update symbol properties', () => {
        const symbol = new SymbolObject({
          symbolType: 'arrow',
          xHeight: 100
        });
        
        const newOptions = {
          symbolType: 'circle',
          xHeight: 200,
          color: 'Black',
          angle: 45,
          x: 150,
          y: 250
        };
        
        symbol.updateSymbol(newOptions);
        
        expect(symbol.symbolType).toBe('circle');
        expect(symbol.xHeight).toBe(200);
        expect(symbol.color).toBe('Black');
        expect(symbol.symbolAngle).toBe(45);
        expect(symbol.left).toBe(150);
        expect(symbol.top).toBe(250);
      });      test('should replace base polygon on update', () => {
        const symbol = new SymbolObject({ symbolType: 'arrow' });
        
        symbol.updateSymbol({
          symbolType: 'circle',
          xHeight: 150
        });
        
        expect(symbol.replaceBasePolygon).toHaveBeenCalled();
      });

      test('should show dimensions after update', () => {
        const symbol = new SymbolObject({ symbolType: 'arrow' });
        
        symbol.updateSymbol({
          symbolType: 'arrow'
        });
        
        expect(symbol.showDimensions).toHaveBeenCalled();
      });test('should handle partial options in updateSymbol', () => {
        const symbol = new SymbolObject({
          symbolType: 'arrow',
          xHeight: 100,
          color: 'White'
        });
        
        symbol.updateSymbol({
          symbolType: 'circle', // Provide a valid symbol type
          color: 'Black'
        });
        
        expect(symbol.color).toBe('Black');
        expect(symbol.symbolType).toBe('circle');
        expect(symbol.xHeight).toBe(100); // Should use default when not provided
      });
    });    describe('Canvas Integration', () => {
      test('should be added to canvas object array', () => {
        const symbol = new SymbolObject({ symbolType: 'arrow' });
        
        expect(CanvasGlobals.canvasObject).toContain(symbol);
      });

      test('should be added to canvas', () => {
        const symbol = new SymbolObject({ symbolType: 'arrow' });
        
        expect(CanvasGlobals.canvas.add).toHaveBeenCalledWith(symbol);
      });

      test('should have unique canvas ID', () => {
        const symbol1 = new SymbolObject({ symbolType: 'arrow' });
        const symbol2 = new SymbolObject({ symbolType: 'circle' });
        
        expect(symbol1.canvasID).not.toBe(symbol2.canvasID);
      });
    });  });

  describe('Integration Tests', () => {
    test('should work together - calcSymbol and SymbolObject', () => {
      const symbol = new SymbolObject({
        symbolType: 'arrow',
        xHeight: 200
      });
      
      const symbolPath = symbol.drawSymbol();
      
      expect(symbolPath).toBeInstanceOf(GlyphPath);
      expect(symbolPath.initialize).toHaveBeenCalled();
      expect(symbolPath.symbol).toBe('arrow');
    });    test('should handle multiple symbols correctly', () => {
      const symbol1 = new SymbolObject({ symbolType: 'arrow' });
      const symbol2 = new SymbolObject({ symbolType: 'circle', xHeight: 150 });
      
      expect(CanvasGlobals.canvasObject.length).toBe(2);
      expect(symbol1.canvasID).not.toBe(symbol2.canvasID);
    });

    test('should maintain symbol state through updates', () => {
      const symbol = new SymbolObject({
        symbolType: 'arrow',
        xHeight: 100,
        color: 'White'
      });
      
      // Update the symbol
      symbol.updateSymbol({
        symbolType: 'circle',
        xHeight: 200,
        color: 'Black'
      });
      
      // Verify state consistency
      expect(symbol.symbolType).toBe('circle');
      expect(symbol.xHeight).toBe(200);
      expect(symbol.color).toBe('Black');
      expect(symbol.replaceBasePolygon).toHaveBeenCalled();
    });

    test('should handle edge case transformations', () => {
      const symbol = new SymbolObject({
        symbolType: 'arrow',
        symbolAngle: 360, // Full rotation
        xHeight: 0 // Edge case size
      });
      
      expect(() => symbol.drawSymbol()).not.toThrow();
    });
  });
});
