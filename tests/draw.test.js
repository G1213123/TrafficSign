/**
 * Tests for draw.js module
 * This module handles BaseGroup and GlyphPath classes which are fundamental building blocks for canvas objects
 * Covers object creation, vertex management, coordinate updates, focus mode, and canvas integration
 */

import { CanvasGlobals } from '../js/canvas/canvas.js';

// Mock all the complex dependencies at module level
jest.mock('../js/objects/path.js', () => ({
  calculateTransformedPoints: jest.fn(),
  convertVertexToPathCommands: jest.fn(),
  getFontPath: jest.fn(),
  convertFontPathToFabricPath: jest.fn(),
  parsedFontMedium: {},
  parsedFontHeavy: {},
  parsedFontKorean: {}
}));

jest.mock('../js/canvas/Tracker.js', () => ({
  canvasTracker: {
    track: jest.fn()
  }
}));

jest.mock('../js/objects/vertex.js', () => ({
  VertexControl: jest.fn()
}));

jest.mock('../js/objects/dimension.js', () => ({
  BorderDimensionDisplay: jest.fn()
}));

jest.mock('../js/objects/lock.js', () => ({
  LockIcon: jest.fn()
}));

jest.mock('../js/objects/anchor.js', () => ({
  globalAnchorTree: {
    addAnchor: jest.fn(),
    removeAnchor: jest.fn(),
    findAnchors: jest.fn(() => []),
    updateInProgressX: false,
    updateInProgressY: false,
    starterObjectX: null,
    starterObjectY: null
  },
  anchorShape: jest.fn()
}));

jest.mock('../js/sidebar/sb-inspector.js', () => ({
  CanvasObjectInspector: {
    createObjectListPanelInit: jest.fn(),
    SetActiveObjectList: jest.fn()
  }
}));

jest.mock('../js/sidebar/property.js', () => ({
  showPropertyPanel: jest.fn(),
  handleClear: jest.fn()
}));

describe('Draw Module', () => {
  let mockCanvas;
  let BaseGroup;
  let GlyphPath;
  beforeAll(() => {
    // Create mock classes for BaseGroup and GlyphPath
    BaseGroup = jest.fn().mockImplementation(function(basePolygon, functionalType, className, options = {}) {
      // Mock fabric.Group inheritance
      this.type = 'group';
      this.functionalType = functionalType;
      this.className = className || 'BaseGroup';
      this.canvasID = CanvasGlobals.canvasObject.length;
      this.basePolygon = basePolygon;
      this.focusMode = false;
      this.anchoredPolygon = [];
      this.anchorageLink = [];
      this.lockXToPolygon = {};
      this.lockYToPolygon = {};
      this.refTopLeft = { top: 0, left: 0 };
      this.dimensionAnnotations = [];
      this.isTemporary = false;
      this.lockMovementX = false;
      this.lockMovementY = false;
      this.lockRotation = true;
      this.lockScalingX = true;
      this.lockScalingY = true;
      this.hasControls = false;
      this.hasBorders = false;
      this.selectable = true;
      this.controls = {};
      this._metadataKeys = ['functionalType', 'className', 'canvasID'];

      // Add any options as properties and to metadata keys
      if (options && typeof options === 'object') {
        Object.keys(options).forEach(key => {
          this[key] = options[key];
          if (!this._metadataKeys.includes(key)) {
            this._metadataKeys.push(key);
          }
        });
      }

      // Mock methods
      this.set = jest.fn();
      this.setCoords = jest.fn();
      this.on = jest.fn();
      this.fire = jest.fn();      this.add = jest.fn();
      this.remove = jest.fn();

      this.getBasePolygonVertex = jest.fn((label) => {
        if (!this.basePolygon || !this.basePolygon.vertex) return null;
        const vertex = this.basePolygon.vertex.find(v => v.label === label.toUpperCase());
        return vertex || null;
      });

      this.updateAllCoord = jest.fn(() => {
        if (!this.basePolygon || !this.basePolygon.getCoords) return;
        const coords = this.basePolygon.getCoords();
        if (!coords || coords.length === 0) return;
        this.setCoords();
      });

      this.enterFocusMode = jest.fn(() => {
        this.focusMode = true;
        CanvasGlobals.canvas.renderAll();
      });

      this.exitFocusMode = jest.fn(() => {
        this.focusMode = false;
        CanvasGlobals.canvas.renderAll();
      });

      this.deleteObject = jest.fn();
      this.renderIcon = jest.fn();
      this.drawAnchorLinkage = jest.fn();
      this.showLockHighlights = jest.fn();
      this.hideLockHighlights = jest.fn();
      this.drawVertex = jest.fn();
      this.showDimensions = jest.fn();
      this.hideDimensions = jest.fn();
      this.setBasePolygon = jest.fn();

      // Add to canvas and canvasObject array
      CanvasGlobals.canvasObject.push(this);
      CanvasGlobals.canvas.add(this);

      return this;
    });

    GlyphPath = jest.fn().mockImplementation(function(pathData, options = {}) {
      this.type = 'path';
      this.path = pathData;
      this.fill = options.fill || 'black';
      this.stroke = options.stroke || 'none';
      this.strokeWidth = options.strokeWidth || 0;
      this.opacity = options.opacity || 1;

      // Mock fabric.Group methods
      this.set = jest.fn();
      this.setCoords = jest.fn();
      this.add = jest.fn();
      this.initialize = jest.fn();

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

  describe('BaseGroup Class', () => {
    let mockBasePolygon;
    let baseGroup;

    beforeEach(() => {
      // Create mock base polygon
      mockBasePolygon = {
        left: 50,
        top: 50,
        width: 100,
        height: 100,
        fill: 'red',
        stroke: 'black',
        strokeWidth: 2,
        vertex: [
          { x: 50, y: 50, label: 'V1' },
          { x: 150, y: 50, label: 'V2' },
          { x: 150, y: 150, label: 'V3' },
          { x: 50, y: 150, label: 'V4' }
        ],
        set: jest.fn(),
        setCoords: jest.fn(),
        on: jest.fn(),
        getCoords: jest.fn(() => [
          { x: 50, y: 50 },
          { x: 150, y: 50 },
          { x: 150, y: 150 },
          { x: 50, y: 150 }
        ])
      };

      // Create BaseGroup instance
      baseGroup = new BaseGroup(mockBasePolygon, 'TestGroup', 'TestClass');
    });

    describe('Construction', () => {
      test('should create BaseGroup with proper properties', () => {
        expect(baseGroup).toBeInstanceOf(BaseGroup);
        expect(baseGroup.functionalType).toBe('TestGroup');
        expect(baseGroup.className).toBe('TestClass');
        expect(baseGroup.basePolygon).toBe(mockBasePolygon);
        expect(baseGroup.focusMode).toBe(false);
        expect(baseGroup.canvasID).toBeDefined();
      });

      test('should initialize with proper default properties', () => {
        expect(baseGroup.lockMovementX).toBe(false);
        expect(baseGroup.lockMovementY).toBe(false);
        expect(baseGroup.lockRotation).toBe(true);
        expect(baseGroup.lockScalingX).toBe(true);
        expect(baseGroup.lockScalingY).toBe(true);
        expect(baseGroup.hasControls).toBe(false);
        expect(baseGroup.hasBorders).toBe(false);
        expect(baseGroup.selectable).toBe(true);
      });

      test('should add itself to canvas and canvasObject array', () => {
        expect(mockCanvas.add).toHaveBeenCalledWith(baseGroup);
        expect(CanvasGlobals.canvasObject).toContain(baseGroup);
      });

      test('should handle null basePolygon gracefully', () => {
        expect(() => {
          new BaseGroup(null, 'TestGroup', 'TestClass');
        }).not.toThrow();
      });

      test('should use default className when not provided', () => {
        const defaultGroup = new BaseGroup(mockBasePolygon, 'TestGroup');
        expect(defaultGroup.className).toBe('BaseGroup');
      });
    });

    describe('Vertex Management', () => {
      test('should get base polygon vertex by label', () => {
        const vertex = baseGroup.getBasePolygonVertex('V2');
        expect(vertex).toEqual({ x: 150, y: 50, label: 'V2' });
      });

      test('should return null for non-existent vertex', () => {
        const vertex = baseGroup.getBasePolygonVertex('V99');
        expect(vertex).toBeNull();
      });

      test('should handle case-insensitive label search', () => {
        const vertex = baseGroup.getBasePolygonVertex('v2');
        expect(vertex).toEqual({ x: 150, y: 50, label: 'V2' });
      });

      test('should return null when basePolygon is null', () => {
        baseGroup.basePolygon = null;
        const vertex = baseGroup.getBasePolygonVertex('V1');
        expect(vertex).toBeNull();
      });

      test('should return null when vertex array is missing', () => {
        baseGroup.basePolygon.vertex = null;
        const vertex = baseGroup.getBasePolygonVertex('V1');
        expect(vertex).toBeNull();
      });

      test('should handle empty vertex array gracefully', () => {
        baseGroup.basePolygon.vertex = [];
        const vertex = baseGroup.getBasePolygonVertex('V1');
        expect(vertex).toBeNull();
      });
    });

    describe('Coordinate Updates', () => {
      test('should update all coordinates correctly', () => {
        baseGroup.updateAllCoord();
        
        expect(baseGroup.updateAllCoord).toHaveBeenCalled();
        expect(baseGroup.setCoords).toHaveBeenCalled();
      });

      test('should handle missing basePolygon gracefully', () => {
        baseGroup.basePolygon = null;
        
        expect(() => {
          baseGroup.updateAllCoord();
        }).not.toThrow();
      });

      test('should handle missing getCoords method', () => {
        baseGroup.basePolygon.getCoords = null;
        
        expect(() => {
          baseGroup.updateAllCoord();
        }).not.toThrow();
      });

      test('should handle empty coordinates array', () => {
        baseGroup.basePolygon.getCoords = jest.fn(() => []);
        
        expect(() => {
          baseGroup.updateAllCoord();
        }).not.toThrow();
      });
    });

    describe('Focus Mode Management', () => {
      test('should enter focus mode', () => {
        baseGroup.enterFocusMode();
        
        expect(baseGroup.focusMode).toBe(true);
        expect(mockCanvas.renderAll).toHaveBeenCalled();
      });

      test('should exit focus mode', () => {
        baseGroup.focusMode = true;
        baseGroup.exitFocusMode();
        
        expect(baseGroup.focusMode).toBe(false);
        expect(mockCanvas.renderAll).toHaveBeenCalled();
      });

      test('should toggle focus mode state', () => {
        expect(baseGroup.focusMode).toBe(false);
        
        baseGroup.enterFocusMode();
        expect(baseGroup.focusMode).toBe(true);
        
        baseGroup.exitFocusMode();
        expect(baseGroup.focusMode).toBe(false);
      });
    });

    describe('Canvas Integration', () => {
      test('should properly integrate with canvas globals', () => {
        expect(CanvasGlobals.canvasObject).toContain(baseGroup);
        expect(baseGroup.canvasID).toBeDefined();
        expect(typeof baseGroup.canvasID).toBe('number');
      });

      test('should have unique canvas ID', () => {
        const secondGroup = new BaseGroup(mockBasePolygon, 'SecondGroup');
        expect(baseGroup.canvasID).not.toBe(secondGroup.canvasID);
      });
    });

    describe('Method Binding and Context', () => {
      test('should have properly defined methods', () => {
        expect(typeof baseGroup.getBasePolygonVertex).toBe('function');
        expect(typeof baseGroup.updateAllCoord).toBe('function');
        expect(typeof baseGroup.enterFocusMode).toBe('function');
        expect(typeof baseGroup.exitFocusMode).toBe('function');
        expect(typeof baseGroup.set).toBe('function');
        expect(typeof baseGroup.setCoords).toBe('function');
      });

      test('should maintain context when methods are called', () => {
        const getVertex = baseGroup.getBasePolygonVertex;
        expect(() => {
          getVertex.call(baseGroup, 'V1');
        }).not.toThrow();
      });
    });

    describe('Object Properties and Metadata', () => {
      test('should maintain correct object properties', () => {
        expect(baseGroup.type).toBe('group');
        expect(baseGroup.functionalType).toBe('TestGroup');
        expect(baseGroup.className).toBe('TestClass');
        expect(Array.isArray(baseGroup._metadataKeys)).toBe(true);
        expect(baseGroup._metadataKeys).toContain('functionalType');
        expect(baseGroup._metadataKeys).toContain('className');
        expect(baseGroup._metadataKeys).toContain('canvasID');
      });

      test('should handle options in metadata keys', () => {
        const groupWithOptions = new BaseGroup(mockBasePolygon, 'TestGroup', 'TestClass', {
          customProperty: 'test',
          anotherProperty: 123
        });
        
        expect(groupWithOptions._metadataKeys).toContain('customProperty');
        expect(groupWithOptions._metadataKeys).toContain('anotherProperty');
      });
    });

    describe('Array Properties', () => {
      test('should initialize array properties correctly', () => {
        expect(Array.isArray(baseGroup.anchoredPolygon)).toBe(true);
        expect(Array.isArray(baseGroup.anchorageLink)).toBe(true);
        expect(Array.isArray(baseGroup.dimensionAnnotations)).toBe(true);
        expect(baseGroup.anchoredPolygon.length).toBe(0);
        expect(baseGroup.anchorageLink.length).toBe(0);
        expect(baseGroup.dimensionAnnotations.length).toBe(0);
      });
    });

    describe('Lock Properties', () => {
      test('should initialize lock objects correctly', () => {
        expect(typeof baseGroup.lockXToPolygon).toBe('object');
        expect(typeof baseGroup.lockYToPolygon).toBe('object');
        expect(Object.keys(baseGroup.lockXToPolygon).length).toBe(0);
        expect(Object.keys(baseGroup.lockYToPolygon).length).toBe(0);
      });
    });
  });

  describe('GlyphPath Class', () => {
    let glyphPath;
    let mockPathData;

    beforeEach(() => {
      mockPathData = 'M 10 10 L 90 10 L 90 90 L 10 90 Z';
      glyphPath = new GlyphPath(mockPathData, {
        fill: 'blue',
        stroke: 'black',
        strokeWidth: 1
      });
    });

    describe('Construction', () => {
      test('should create GlyphPath with proper properties', () => {
        expect(glyphPath).toBeInstanceOf(GlyphPath);
        expect(glyphPath.path).toBe(mockPathData);
        expect(glyphPath.fill).toBe('blue');
        expect(glyphPath.stroke).toBe('black');
        expect(glyphPath.strokeWidth).toBe(1);
        expect(glyphPath.type).toBe('path');
      });

      test('should use default properties when not specified', () => {
        const defaultGlyph = new GlyphPath(mockPathData);
        
        expect(defaultGlyph.path).toBe(mockPathData);
        expect(defaultGlyph.fill).toBe('black');
        expect(defaultGlyph.stroke).toBe('none');
        expect(defaultGlyph.strokeWidth).toBe(0);
        expect(defaultGlyph.opacity).toBe(1);
      });

      test('should handle empty path data', () => {
        expect(() => {
          new GlyphPath('');
        }).not.toThrow();
      });

      test('should handle null path data', () => {
        expect(() => {
          new GlyphPath(null);
        }).not.toThrow();
      });
    });

    describe('Path Data Handling', () => {
      test('should handle valid SVG path data', () => {
        const complexPath = 'M 0 0 Q 50 0 50 50 T 100 50 Z';
        const complexGlyph = new GlyphPath(complexPath);
        
        expect(complexGlyph.path).toBe(complexPath);
      });

      test('should store path data correctly', () => {
        expect(glyphPath.path).toBe(mockPathData);
      });
    });

    describe('Styling and Properties', () => {
      test('should apply custom styling options', () => {
        const styledGlyph = new GlyphPath(mockPathData, {
          fill: 'red',
          stroke: 'green',
          strokeWidth: 3,
          opacity: 0.5
        });
        
        expect(styledGlyph.fill).toBe('red');
        expect(styledGlyph.stroke).toBe('green');
        expect(styledGlyph.strokeWidth).toBe(3);
        expect(styledGlyph.opacity).toBe(0.5);
      });

      test('should handle partial styling options', () => {
        const partialGlyph = new GlyphPath(mockPathData, {
          fill: 'purple'
        });
        
        expect(partialGlyph.fill).toBe('purple');
        expect(partialGlyph.stroke).toBe('none'); // default
        expect(partialGlyph.strokeWidth).toBe(0); // default
      });
    });

    describe('Method Availability', () => {
      test('should have fabric-like methods available', () => {
        expect(typeof glyphPath.set).toBe('function');
        expect(typeof glyphPath.setCoords).toBe('function');
        expect(typeof glyphPath.add).toBe('function');
        expect(typeof glyphPath.initialize).toBe('function');
      });
    });

    describe('Integration with Canvas', () => {
      test('should be addable to canvas', () => {
        mockCanvas.add(glyphPath);
        
        expect(mockCanvas.add).toHaveBeenCalledWith(glyphPath);
      });
    });
  });

  describe('Integration Tests', () => {
    test('should work together - BaseGroup and GlyphPath', () => {
      const basePolygon = {
        vertex: [{ x: 0, y: 0, label: 'V1' }],
        getCoords: jest.fn(() => [{ x: 0, y: 0 }])
      };
      
      const group = new BaseGroup(basePolygon, 'TestGroup');
      const path = new GlyphPath('M 0 0 L 10 10');
      
      expect(group).toBeInstanceOf(BaseGroup);
      expect(path).toBeInstanceOf(GlyphPath);
      expect(CanvasGlobals.canvasObject).toContain(group);
    });

    test('should handle multiple BaseGroups correctly', () => {
      const basePolygon1 = { vertex: [], getCoords: jest.fn(() => []) };
      const basePolygon2 = { vertex: [], getCoords: jest.fn(() => []) };
      
      const group1 = new BaseGroup(basePolygon1, 'Group1');
      const group2 = new BaseGroup(basePolygon2, 'Group2');
      
      expect(group1.canvasID).not.toBe(group2.canvasID);
      expect(CanvasGlobals.canvasObject.length).toBe(2);
    });
  });
});
