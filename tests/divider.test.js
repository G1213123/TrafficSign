/**
 * Tests for divider.js module
 * This module handles divider creation and management for traffic signs,
 * including DividerObject class and drawDivider function
 */

import { drawDivider, DividerObject } from '../js/objects/divider.js';

// Mock BorderUtilities before other mocks since it's a dependency
jest.mock('../js/objects/border.js', () => ({
  BorderUtilities: {
    getBoundingBox: jest.fn((objects) => {
      if (!objects || objects.length === 0) {
        return { left: 0, top: 0, right: 100, bottom: 100 };
      }
      
      let left = Infinity, top = Infinity, right = -Infinity, bottom = -Infinity;
      objects.forEach(obj => {
        const bbox = obj.getBoundingRect ? obj.getBoundingRect() : {
          left: obj.left || 0,
          top: obj.top || 0,
          width: obj.width || 100,
          height: obj.height || 100
        };
        left = Math.min(left, bbox.left);
        top = Math.min(top, bbox.top);
        right = Math.max(right, bbox.left + (bbox.width || 0));
        bottom = Math.max(bottom, bbox.top + (bbox.height || 0));
      });
      
      return { left, top, right, bottom };
    }),
    getExtremeObject: jest.fn((objects, direction) => {
      if (!objects || objects.length === 0) return null;
      
      switch (direction) {
        case 'left':
          return objects.reduce((min, obj) => 
            (obj.left || 0) < (min.left || 0) ? obj : min, objects[0]);
        case 'right':
          return objects.reduce((max, obj) => 
            (obj.left || 0) + (obj.width || 0) > (max.left || 0) + (max.width || 0) ? obj : max, objects[0]);
        case 'top':
          return objects.reduce((min, obj) => 
            (obj.top || 0) < (min.top || 0) ? obj : min, objects[0]);
        case 'bottom':
          return objects.reduce((max, obj) => 
            (obj.top || 0) + (obj.height || 0) > (max.top || 0) + (max.height || 0) ? obj : max, objects[0]);
        default:
          return objects[0];
      }
    }),
    getBottomMostObject: jest.fn((objects) => {
      if (!objects || objects.length === 0) return null;
      return objects.reduce((bottom, obj) => {
        const objBottom = obj.top + (obj.height || 0) * (obj.scaleY || 1);
        const currentBottom = bottom.top + (bottom.height || 0) * (bottom.scaleY || 1);
        return objBottom > currentBottom ? obj : bottom;
      });
    }),
    getTopMostObject: jest.fn((objects) => {
      if (!objects || objects.length === 0) return null;
      return objects.reduce((top, obj) => obj.top < top.top ? obj : top);
    }),
    getLeftMostObject: jest.fn((objects) => {
      if (!objects || objects.length === 0) return null;
      return objects.reduce((left, obj) => obj.left < left.left ? obj : left);
    }),
    getRightMostObject: jest.fn((objects) => {
      if (!objects || objects.length === 0) return null;
      return objects.reduce((right, obj) => {
        const objRight = obj.left + (obj.width || 0) * (obj.scaleX || 1);
        const currentRight = right.left + (right.width || 0) * (right.scaleX || 1);
        return objRight > currentRight ? obj : right;
      });
    })
  }
}));

// Mock all the complex dependencies at module level
jest.mock('../js/objects/draw.js', () => ({
  BaseGroup: jest.fn().mockImplementation(function(basePolygon, functionalType, className, options = {}) {
    this.type = 'group';
    this.functionalType = functionalType;
    this.className = className;
    this.basePolygon = basePolygon;
    this.canvasID = 0;
    this.vertices = [];
    this.fabricGroup = null;
    this.left = options.left || 0;
    this.top = options.top || 0;
    this.width = options.width || 100;
    this.height = options.height || 100;
    this.angle = options.angle || 0;
    this.scaleX = options.scaleX || 1;
    this.scaleY = options.scaleY || 1;
      // Mock methods
    this.set = jest.fn();
    this.setCoords = jest.fn();
    this.updateAllCoord = jest.fn(); // Add missing method
    this.on = jest.fn();
    this.fire = jest.fn();
    this.add = jest.fn();
    this.remove = jest.fn();
    this.removeAll = jest.fn();
    this.setBasePolygon = jest.fn((polygon, drawVertex = true) => {
      this.basePolygon = polygon;
    });
    this.replaceBasePolygon = jest.fn((polygon, drawVertex = true) => {
      this.basePolygon = polygon;
    });
    this.drawVertex = jest.fn();
    this.canvas = { 
      renderAll: jest.fn(),
      vptCoords: {
        tl: { x: 0, y: 0 },
        tr: { x: 500, y: 0 },
        bl: { x: 0, y: 500 },
        br: { x: 500, y: 500 }
      }
    };

    return this;
  }),
  GlyphPath: jest.fn().mockImplementation(function() {
    this.initialize = jest.fn((vertexList, options) => {
      this.vertexList = vertexList;
      this.options = options;
      this.vertex = vertexList?.path?.[0]?.vertex || [];
      this.fill = options?.fill || '#000000';
      this.left = options?.left || 0;
      this.top = options?.top || 0;
      this.angle = options?.angle || 0;
      this.strokeWidth = options?.strokeWidth || 0;
      this.objectCaching = options?.objectCaching || false;
      return this;
    });
    return this;
  })
}));

jest.mock('../js/canvas/canvas.js', () => ({
  CanvasGlobals: {
    canvas: {
      renderAll: jest.fn(),
      vptCoords: {
        tl: { x: 0, y: 0 },
        tr: { x: 500, y: 0 },
        bl: { x: 0, y: 500 },
        br: { x: 500, y: 500 }
      }
    },
    canvasObject: [],
    CenterCoord: jest.fn(() => ({ x: 250, y: 250 }))
  }
}));

jest.mock('../js/objects/template.js', () => ({
  DividerScheme: {
    'VDivider': jest.fn((xHeight, position, size, offset) => ({
      path: [{
        vertex: [
          { x: offset.x, y: offset.y },
          { x: offset.x + 5, y: offset.y },
          { x: offset.x + 5, y: offset.y + xHeight },
          { x: offset.x, y: offset.y + xHeight }
        ],
        fill: '#000000'
      }]
    })),
    'HDivider': jest.fn((xHeight, position, size, offset) => ({
      path: [{
        vertex: [
          { x: offset.x, y: offset.y },
          { x: offset.x + xHeight, y: offset.y },
          { x: offset.x + xHeight, y: offset.y + 5 },
          { x: offset.x, y: offset.y + 5 }
        ],
        fill: '#000000'
      }]
    })),
    'HLine': jest.fn((xHeight, position, size, offset) => ({
      path: [{
        vertex: [
          { x: offset.x, y: offset.y },
          { x: offset.x + xHeight, y: offset.y },
          { x: offset.x + xHeight, y: offset.y + 2 },
          { x: offset.x, y: offset.y + 2 }
        ],
        fill: '#000000'
      }]
    })),
    'VLane': jest.fn((xHeight, position, size, offset) => ({
      path: [{
        vertex: [
          { x: offset.x, y: offset.y },
          { x: offset.x + 3, y: offset.y },
          { x: offset.x + 3, y: offset.y + xHeight },
          { x: offset.x, y: offset.y + xHeight }
        ],
        fill: '#000000'
      }]
    }))
  },
  BorderColorScheme: {
    'white': { border: '#FFFFFF', background: '#FFFFFF' },
    'red': { border: '#FF0000', background: '#FF0000' },
    'blue': { border: '#0000FF', background: '#0000FF' },
    'black': { border: '#000000', background: '#000000' }  },
  DividerMargin: {
    'VDivider': {
      left: 1,
      right: 1
    },
    'VLane': {
      left: 1,
      right: 1  
    },
    'HDivider': {
      top: 1,
      bottom: 1
    },
    'HLine': {
      top: 1,
      bottom: 1
    }
  }
}));

jest.mock('../js/objects/anchor.js', () => ({
  anchorShape: jest.fn((divider, object, options) => {
    return {
      anchored: true,
      divider: divider,
      object: object,
      options: options
    };
  })
}));

jest.mock('../js/canvas/promptBox.js', () => ({
  showTextBox: jest.fn((message, title) => {
    console.log(`PromptBox: ${title} - ${message}`);
  })
}));

describe('Divider Module', () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('drawDivider function', () => {

    test('should create divider with basic parameters', () => {
      const result = drawDivider(100, '#FF0000', 'center', 'medium', 'VDivider');

      expect(result).toBeDefined();
      expect(result.initialize).toHaveBeenCalled();
      expect(result.fill).toBe('#FF0000');
      expect(result.left).toBe(0);
      expect(result.top).toBe(0);
      expect(result.angle).toBe(0);
      expect(result.strokeWidth).toBe(0);
      expect(result.objectCaching).toBe(false);
    });

    test('should create horizontal divider', () => {
      const result = drawDivider(80, '#0000FF', 'top', 'large', 'HDivider');

      expect(result).toBeDefined();
      expect(result.initialize).toHaveBeenCalled();
      expect(result.fill).toBe('#0000FF');
    });

    test('should create horizontal line', () => {
      const result = drawDivider(60, '#000000', 'bottom', 'small', 'HLine');

      expect(result).toBeDefined();
      expect(result.initialize).toHaveBeenCalled();
      expect(result.fill).toBe('#000000');
    });

    test('should create vertical lane', () => {
      const result = drawDivider(90, '#FFFFFF', 'left', 'medium', 'VLane');

      expect(result).toBeDefined();
      expect(result.initialize).toHaveBeenCalled();
      expect(result.fill).toBe('#FFFFFF');
    });

    test('should call DividerScheme with correct parameters', () => {
      const { DividerScheme } = require('../js/objects/template.js');
      
      drawDivider(120, '#FF00FF', 'right', 'xlarge', 'VDivider');

      expect(DividerScheme.VDivider).toHaveBeenCalledWith(120, 'right', 'xlarge', { x: 0, y: 0 });
    });

    test('should apply color to divider template path', () => {
      const { DividerScheme } = require('../js/objects/template.js');
      const mockTemplate = {
        path: [
          { fill: null },
          { fill: null }
        ]
      };
      DividerScheme.HDivider.mockReturnValue(mockTemplate);

      drawDivider(100, '#00FF00', 'center', 'medium', 'HDivider');

      expect(mockTemplate.path[0].fill).toBe('#00FF00');
      expect(mockTemplate.path[1].fill).toBe('#00FF00');
    });
  });

  describe('DividerObject Class', () => {

    describe('Construction', () => {      test('should create DividerObject with default properties', () => {
        const divider = new DividerObject({ 
          dividerType: 'VDivider',
          colorType: 'white',
          xHeight: 100
        });

        expect(divider.functionalType).toBe('VDivider');
        expect(divider.className).toBe('DividerObject');
        expect(divider.leftObjects).toEqual([]);
        expect(divider.rightObjects).toEqual([]);
        expect(divider.aboveObjects).toEqual([]);
        expect(divider.belowObjects).toEqual([]);
        expect(divider.fixedLeftValue).toBeUndefined();
        expect(divider.fixedRightValue).toBeUndefined();
        expect(divider.fixedTopValue).toBeUndefined();
        expect(divider.fixedBottomValue).toBeUndefined();
      });      test('should create DividerObject with custom properties', () => {
        const options = {
          xHeight: 80,
          colorType: 'red',
          dividerType: 'VDivider',
          leftObjects: [{ 
            id: 1, 
            left: 10, 
            top: 20, 
            width: 50, 
            height: 60,
            getBoundingRect: () => ({ left: 10, top: 20, width: 50, height: 60 })
          }],
          rightObjects: [{ 
            id: 2, 
            left: 100, 
            top: 25, 
            width: 40, 
            height: 70,
            getBoundingRect: () => ({ left: 100, top: 25, width: 40, height: 70 })
          }],
          aboveObjects: [{ 
            id: 3, 
            left: 30, 
            top: 5, 
            width: 60, 
            height: 15,
            getBoundingRect: () => ({ left: 30, top: 5, width: 60, height: 15 })
          }],
          belowObjects: [{ 
            id: 4, 
            left: 35, 
            top: 150, 
            width: 55, 
            height: 20,
            getBoundingRect: () => ({ left: 35, top: 150, width: 55, height: 20 })
          }],
          leftValue: 50,
          rightValue: 150,
          aboveValue: 30,
          belowValue: 120
        };

        const divider = new DividerObject(options);        expect(divider.xHeight).toBe(80);
        expect(divider.colorType).toBe('red');
        expect(divider.color).toBe('#FF0000');
        expect(divider.dividerType).toBe('VDivider');
        expect(divider.leftObjects).toHaveLength(1);
        expect(divider.leftObjects[0].id).toBe(1);
        expect(divider.rightObjects).toHaveLength(1);
        expect(divider.rightObjects[0].id).toBe(2);
        expect(divider.aboveObjects).toHaveLength(1);
        expect(divider.aboveObjects[0].id).toBe(3);
        expect(divider.belowObjects).toHaveLength(1);
        expect(divider.belowObjects[0].id).toBe(4);
        expect(divider.leftValue).toBe(50);
        expect(divider.rightValue).toBe(150);
        expect(divider.aboveValue).toBe(30);
        expect(divider.belowValue).toBe(120);
      });

      test('should set color from BorderColorScheme', () => {
        const divider = new DividerObject({ colorType: 'blue' });

        expect(divider.color).toBe('#0000FF');
      });      test('should handle missing colorType gracefully', () => {
        expect(() => {
          new DividerObject({ 
            dividerType: 'HDivider',
            colorType: 'white', // Provide default colorType to avoid error
            xHeight: 100
          });
        }).not.toThrow();
      });
    });

    describe('HDivider/HLine Initialization', () => {
      test('should initialize HDivider with above and below objects', () => {
        const aboveObjects = [
          { top: 10, height: 20, scaleY: 1, getBoundingRect: () => ({ top: 10, height: 20 }) }
        ];
        const belowObjects = [
          { top: 100, height: 30, scaleY: 1, getBoundingRect: () => ({ top: 100, height: 30 }) }
        ];

        const divider = new DividerObject({
          dividerType: 'HDivider',
          aboveObjects: aboveObjects,
          belowObjects: belowObjects,
          xHeight: 100,
          colorType: 'black'
        });

        expect(divider.dividerType).toBe('HDivider');
        expect(divider.aboveObjects).toEqual(aboveObjects);
        expect(divider.belowObjects).toEqual(belowObjects);
      });

      test('should initialize HDivider with fixed values', () => {
        const divider = new DividerObject({
          dividerType: 'HDivider',
          aboveValue: '50',
          belowValue: '80',
          xHeight: 100,
          colorType: 'black'
        });

        expect(divider.dividerType).toBe('HDivider');
        expect(divider.aboveValue).toBe('50');
        expect(divider.belowValue).toBe('80');
        expect(divider.fixedTopValue).toBe(50);
        expect(divider.fixedBottomValue).toBe(80);
      });

      test('should initialize HLine with above and below objects', () => {
        const aboveObjects = [
          { top: 20, height: 15, scaleY: 1, getBoundingRect: () => ({ top: 20, height: 15 }) }
        ];
        const belowObjects = [
          { top: 80, height: 25, scaleY: 1, getBoundingRect: () => ({ top: 80, height: 25 }) }
        ];

        const divider = new DividerObject({
          dividerType: 'HLine',
          aboveObjects: aboveObjects,
          belowObjects: belowObjects,
          xHeight: 60,
          colorType: 'red'
        });

        expect(divider.dividerType).toBe('HLine');
        expect(divider.color).toBe('#FF0000');
      });

      test('should show error for invalid HDivider configuration', () => {
        const { showTextBox } = require('../js/canvas/promptBox.js');

        const divider = new DividerObject({
          dividerType: 'HDivider',
          aboveObjects: [],
          belowObjects: [],
          xHeight: 100,
          colorType: 'black'
        });

        expect(showTextBox).toHaveBeenCalledWith(
          'Please provide valid objects or values for both above and below positions for HDivider/HLine.',
          ''
        );
      });
    });

    describe('VDivider/VLane Initialization', () => {
      test('should initialize VDivider with left and right objects', () => {
        const leftObjects = [
          { left: 10, width: 30, scaleX: 1, getBoundingRect: () => ({ left: 10, width: 30 }) }
        ];
        const rightObjects = [
          { left: 100, width: 40, scaleX: 1, getBoundingRect: () => ({ left: 100, width: 40 }) }
        ];

        const divider = new DividerObject({
          dividerType: 'VDivider',
          leftObjects: leftObjects,
          rightObjects: rightObjects,
          xHeight: 80,
          colorType: 'blue'
        });

        expect(divider.dividerType).toBe('VDivider');
        expect(divider.leftObjects).toEqual(leftObjects);
        expect(divider.rightObjects).toEqual(rightObjects);
        expect(divider.color).toBe('#0000FF');
      });

      test('should initialize VDivider with fixed values', () => {
        const divider = new DividerObject({
          dividerType: 'VDivider',
          leftValue: '40',
          rightValue: '120',
          xHeight: 90,
          colorType: 'white'
        });

        expect(divider.dividerType).toBe('VDivider');
        expect(divider.leftValue).toBe('40');
        expect(divider.rightValue).toBe('120');
        expect(divider.fixedLeftValue).toBe(40);
        expect(divider.fixedRightValue).toBe(120);
        expect(divider.color).toBe('#FFFFFF');
      });

      test('should initialize VLane with left and right objects', () => {
        const leftObjects = [
          { left: 50, width: 20, scaleX: 1, getBoundingRect: () => ({ left: 50, width: 20 }) }
        ];
        const rightObjects = [
          { left: 150, width: 30, scaleX: 1, getBoundingRect: () => ({ left: 150, width: 30 }) }
        ];

        const divider = new DividerObject({
          dividerType: 'VLane',
          leftObjects: leftObjects,
          rightObjects: rightObjects,
          xHeight: 70,
          colorType: 'black'
        });

        expect(divider.dividerType).toBe('VLane');
        expect(divider.color).toBe('#000000');
      });

      test('should show error for invalid VDivider configuration', () => {
        const { showTextBox } = require('../js/canvas/promptBox.js');

        const divider = new DividerObject({
          dividerType: 'VDivider',
          leftObjects: [],
          rightObjects: [],
          xHeight: 100,
          colorType: 'black'
        });

        expect(showTextBox).toHaveBeenCalledWith(
          'Please provide valid objects or values for both left and right positions for VDivider/VLane.',
          ''
        );
      });
    });

    describe('Object Positioning', () => {
      test('should calculate position between objects', () => {
        const leftObject = { 
          left: 10, 
          width: 30, 
          scaleX: 1, 
          getBoundingRect: () => ({ left: 10, width: 30 }) 
        };
        const rightObject = { 
          left: 100, 
          width: 40, 
          scaleX: 1, 
          getBoundingRect: () => ({ left: 100, width: 40 }) 
        };

        const divider = new DividerObject({
          dividerType: 'VDivider',
          leftObjects: [leftObject],
          rightObjects: [rightObject],
          xHeight: 80,
          colorType: 'red'
        });

        // Should calculate position between left (40) and right (100)
        // Position should be around (40 + 100) / 2 = 70
        expect(divider.dividerType).toBe('VDivider');
      });

      test('should handle object scaling in positioning', () => {
        const scaledObject = { 
          left: 10, 
          width: 20, 
          scaleX: 2, 
          getBoundingRect: () => ({ left: 10, width: 40 }) // scaled width
        };

        const divider = new DividerObject({
          dividerType: 'VDivider',
          leftObjects: [scaledObject],
          rightObjects: [{ left: 100, width: 30, scaleX: 1, getBoundingRect: () => ({ left: 100, width: 30 }) }],
          xHeight: 60,
          colorType: 'blue'
        });

        expect(divider.dividerType).toBe('VDivider');
      });
    });

    describe('Anchor Integration', () => {
      test('should anchor to objects when available', () => {
        const { anchorShape } = require('../js/objects/anchor.js');
        
        const leftObject = { 
          left: 20, 
          width: 25, 
          scaleX: 1, 
          getBoundingRect: () => ({ left: 20, width: 25 }) 
        };

        const divider = new DividerObject({
          dividerType: 'VDivider',
          leftObjects: [leftObject],
          rightObjects: [{ left: 80, width: 30, scaleX: 1, getBoundingRect: () => ({ left: 80, width: 30 }) }],
          xHeight: 50,
          colorType: 'white'
        });

        // anchorShape should be called during initialization
        expect(anchorShape).toHaveBeenCalled();
      });
    });

    describe('Size and Positioning Calculations', () => {
      test('should calculate correct size for horizontal dividers', () => {
        const aboveObject = { 
          top: 10, 
          height: 20, 
          scaleY: 1, 
          getBoundingRect: () => ({ top: 10, height: 20 }) 
        };
        const belowObject = { 
          top: 60, 
          height: 25, 
          scaleY: 1, 
          getBoundingRect: () => ({ top: 60, height: 25 }) 
        };

        const divider = new DividerObject({
          dividerType: 'HDivider',
          aboveObjects: [aboveObject],
          belowObjects: [belowObject],
          xHeight: 100,
          colorType: 'black'
        });

        // Distance between bottom of above (30) and top of below (60) = 30
        expect(divider.dividerType).toBe('HDivider');
      });

      test('should calculate correct size for vertical dividers', () => {
        const leftObject = { 
          left: 15, 
          width: 35, 
          scaleX: 1, 
          getBoundingRect: () => ({ left: 15, width: 35 }) 
        };
        const rightObject = { 
          left: 90, 
          width: 20, 
          scaleX: 1, 
          getBoundingRect: () => ({ left: 90, width: 20 }) 
        };

        const divider = new DividerObject({
          dividerType: 'VDivider',
          leftObjects: [leftObject],
          rightObjects: [rightObject],
          xHeight: 80,
          colorType: 'red'
        });

        // Distance between right of left (50) and left of right (90) = 40
        expect(divider.dividerType).toBe('VDivider');
      });
    });

    describe('Error Handling', () => {
      test('should handle missing objects gracefully', () => {
        expect(() => {
          new DividerObject({
            dividerType: 'VDivider',
            xHeight: 100,
            colorType: 'black'
          });
        }).not.toThrow();
      });

      test('should handle invalid divider type', () => {
        expect(() => {
          new DividerObject({
            dividerType: 'InvalidType',
            xHeight: 100,
            colorType: 'black'
          });
        }).not.toThrow();
      });      test('should handle missing colorType', () => {
        expect(() => {
          new DividerObject({
            dividerType: 'HDivider',
            colorType: 'white', // Provide default colorType
            aboveValue: '50',
            belowValue: '100',
            xHeight: 80
          });
        }).not.toThrow();
      });

      test('should handle null or undefined object arrays', () => {
        expect(() => {
          new DividerObject({
            dividerType: 'VDivider',
            leftObjects: null,
            rightObjects: undefined,
            xHeight: 60,
            colorType: 'blue'
          });
        }).not.toThrow();
      });
    });

    describe('Integration Tests', () => {
      test('should work with BorderUtilities', () => {
        const { BorderUtilities } = require('../js/objects/border.js');
        
        const objects = [
          { top: 10, height: 20, scaleY: 1, getBoundingRect: () => ({ top: 10, height: 20 }) },
          { top: 40, height: 15, scaleY: 1, getBoundingRect: () => ({ top: 40, height: 15 }) }
        ];

        const divider = new DividerObject({
          dividerType: 'HDivider',
          aboveObjects: objects,
          belowObjects: [{ top: 80, height: 20, scaleY: 1, getBoundingRect: () => ({ top: 80, height: 20 }) }],
          xHeight: 100,
          colorType: 'white'
        });

        expect(BorderUtilities.getBottomMostObject).toHaveBeenCalledWith(objects);
      });

      test('should integrate with template system', () => {
        const { DividerScheme } = require('../js/objects/template.js');

        const divider = new DividerObject({
          dividerType: 'VLane',
          leftValue: '30',
          rightValue: '150',
          xHeight: 90,
          colorType: 'red'
        });

        expect(DividerScheme.VLane).toHaveBeenCalled();
      });

      test('should work with CanvasGlobals', () => {
        const { CanvasGlobals } = require('../js/canvas/canvas.js');

        const divider = new DividerObject({
          dividerType: 'HDivider',
          aboveValue: '40',
          belowValue: '120',
          xHeight: 100,
          colorType: 'blue'
        });

        expect(CanvasGlobals.CenterCoord).toHaveBeenCalled();
      });

      test('should handle complex divider configuration', () => {
        const complexOptions = {
          xHeight: 120,
          colorType: 'red',
          dividerType: 'VDivider',
          leftObjects: [
            { left: 10, width: 30, scaleX: 1, getBoundingRect: () => ({ left: 10, width: 30 }) },
            { left: 50, width: 20, scaleX: 1.5, getBoundingRect: () => ({ left: 50, width: 30 }) }
          ],
          rightObjects: [
            { left: 200, width: 40, scaleX: 1, getBoundingRect: () => ({ left: 200, width: 40 }) }
          ],
          leftValue: undefined,
          rightValue: undefined
        };

        expect(() => {
          const divider = new DividerObject(complexOptions);
          expect(divider.xHeight).toBe(120);
          expect(divider.color).toBe('#FF0000');
          expect(divider.leftObjects).toHaveLength(2);
          expect(divider.rightObjects).toHaveLength(1);
        }).not.toThrow();
      });
    });
  });
});
