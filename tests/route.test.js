/**
 * Tests for route.js module
 * This module handles route drawing and management for traffic signs, including main roads,
 * side roads, and roundabouts with vertex calculations, constraints, and interactions
 */

import { CanvasGlobals } from '../js/canvas/canvas.js';

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
    this.refTopLeft = { left: this.left, top: this.top };
    this.sideRoad = [];
    
    // Mock methods
    this.set = jest.fn();
    this.setCoords = jest.fn();
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
    this.canvas = { renderAll: jest.fn() };

    return this;
  }),
  GlyphPath: jest.fn().mockImplementation(function() {
    this.initialize = jest.fn((vertexList, options) => {
      this.vertexList = vertexList;
      this.options = options;
      this.vertex = vertexList?.path?.[0]?.vertex || [];
      return this;
    });
    this.vertex = [];
    this.setCoords = jest.fn();
    return this;
  })
}));

jest.mock('../js/objects/path.js', () => ({
  calculateTransformedPoints: jest.fn((points, transform) => {
    // Handle both single vertex array and path structure
    if (Array.isArray(points)) {
      return points.map(point => ({
        x: point.x + transform.x + Math.cos(transform.angle * Math.PI / 180) * 5,
        y: point.y + transform.y + Math.sin(transform.angle * Math.PI / 180) * 5,
        radius: point.radius,
        display: point.display,
        label: point.label
      }));
    } else if (points && points.path && points.path[0] && points.path[0].vertex) {
      return points.path[0].vertex.map(point => ({
        x: point.x + transform.x + Math.cos(transform.angle * Math.PI / 180) * 5,
        y: point.y + transform.y + Math.sin(transform.angle * Math.PI / 180) * 5,
        radius: point.radius,
        display: point.display,
        label: point.label
      }));
    }
    return [];
  }),
  getInsertOffset: jest.fn((vertexList) => ({ left: 50, top: 50 }))
}));

jest.mock('../js/objects/template.js', () => ({
  roadMapTemplate: {
    'Root': {
      path: [{ 
        vertex: [
          { x: 1, y: 24, label: 'V1', start: 1, display: 0 },
          { x: -1, y: 24, label: 'V2', start: 0, display: 0 }
        ],
        arcs: []
      }]
    },
    'Arrow': {
      path: [{ 
        vertex: [
          { x: -1, y: 1, label: 'V1', start: 1, display: 1 },
          { x: 0, y: 0, label: 'V2', start: 0, display: 1 },
          { x: 1, y: 1, label: 'V3', start: 0, display: 1 }
        ],
        arcs: []
      }]
    },
    'Stub': {
      path: [{ 
        vertex: [
          { x: -1, y: 0, label: 'V1', start: 0, display: 1 },
          { x: 0, y: 0, label: 'V2', start: 1, display: 1 },
          { x: 1, y: 0, label: 'V3', start: 0, display: 1 }
        ],
        arcs: []
      }]
    },
    'UArrow Conventional': {
      path: [{ 
        vertex: [
          { x: 6, y: 33.4, label: 'V31', start: 1, display: 1 },
          { x: 8, y: 31.4, label: 'V32', start: 0, display: 0 },
          { x: 8, y: 9.3808, label: 'V33', start: 0, display: 0 },
          { x: 8.3077, y: 8.6592, label: 'V34', start: 0, display: 0 },
          { x: 2.7692, y: 11.6761, label: 'V35', start: 0, display: 0 },
          { x: 4, y: 12.6491, label: 'V36', start: 0, display: 0 },
          { x: 4, y: 31.4, label: 'V37', start: 0, display: 0 }
        ],
        arcs: [
          { start: 'V33', end: 'V34', radius: 1, direction: 1, sweep: 0 },
          { start: 'V34', end: 'V35', radius: 12, direction: 1, sweep: 0 },
          { start: 'V35', end: 'V36', radius: 1, direction: 1, sweep: 0 }
        ]
      }]
    },
    'UArrow Spiral': {
      path: [{ 
        vertex: [
          { x: 6, y: 35.4, label: 'V31', start: 1, display: 1 },
          { x: 8, y: 33.4, label: 'V32', start: 0, display: 0 },
          { x: 8, y: 9.3808, label: 'V33', start: 0, display: 0 },
          { x: 8.3077, y: 8.6592, label: 'V34', start: 0, display: 0 },
          { x: 2.7692, y: 11.6761, label: 'V35', start: 0, display: 0 },
          { x: 4, y: 12.6491, label: 'V36', start: 0, display: 0 },
          { x: 4, y: 33.4, label: 'V37', start: 0, display: 0 }
        ],
        arcs: [
          { start: 'V33', end: 'V34', radius: 1, direction: 1, sweep: 0 },
          { start: 'V34', end: 'V35', radius: 12, direction: 1, sweep: 0 },
          { start: 'V35', end: 'V36', radius: 1, direction: 1, sweep: 0 }        ]
      }]
    },
    'Conventional Roundabout': {
      path: [{
        vertex: [
          { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
          { x: 100, y: 0, label: 'V2', start: 0, display: 1 },
          { x: 100, y: 100, label: 'V3', start: 0, display: 1 },
          { x: 0, y: 100, label: 'V4', start: 0, display: 1 }
        ],
        arcs: []
      }]
    },
    'Spiral Roundabout': {
      path: [{
        vertex: [
          { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
          { x: 80, y: 0, label: 'V2', start: 0, display: 1 },
          { x: 80, y: 80, label: 'V3', start: 0, display: 1 },
          { x: 0, y: 80, label: 'V4', start: 0, display: 1 }
        ],
        arcs: []
      }]
    },    'Small Conventional': {
      path: [{ 
        vertex: [
          { x: -30, y: -30, radius: 15, display: 1 },
          { x: 30, y: -30, radius: 15, display: 1 },
          { x: 30, y: 30, radius: 15, display: 1 },
          { x: -30, y: 30, radius: 15, display: 1 }
        ],
        arcs: []
      }]
    },    'Small Spiral': {
      path: [{ 
        vertex: [
          { x: -30, y: -30, radius: 15, display: 1 },
          { x: 30, y: -30, radius: 15, display: 1 },
          { x: 30, y: 30, radius: 15, display: 1 },
          { x: -30, y: 30, radius: 15, display: 1 }
        ],
        arcs: []
      }]
    }
  }
}));

jest.mock('../js/objects/symbols.js', () => ({
  calcSymbol: jest.fn((template, length) => {
    // Return a deep copy with modified coordinates based on length
    const result = JSON.parse(JSON.stringify(template));
    result.path.forEach(path => {
      path.vertex.forEach(vertex => {
        vertex.x *= length / 25; // Scale based on length
        vertex.y *= length / 25;
      });
    });
    return result;
  })
}));

jest.mock('../js/canvas/keyboardEvents.js', () => ({
  ShowHideSideBarEvent: jest.fn()
}));

// Setup canvas globals
CanvasGlobals.canvas = {
  add: jest.fn(),
  remove: jest.fn(),
  renderAll: jest.fn(),
  getActiveObjects: jest.fn(() => [])
};
CanvasGlobals.canvasObject = [];

// Mock DOM elements
global.document = {
  getElementById: jest.fn((id) => {
    const mockElement = {
      classList: {
        add: jest.fn(),
        remove: jest.fn()
      },
      style: {},
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      disabled: false
    };
    return mockElement;
  })
};

// Fix Math.tan mock to avoid stack overflow
const originalTan = Math.tan;
Math.tan = jest.fn().mockImplementation((x) => {
  return originalTan(x);
});

describe('Route Module', () => {
  let MainRoadSymbol, SideRoadSymbol, calcMainRoadVertices, calcRoundaboutVertices, roadMapOnSelect, roadMapOnDeselect;
  let BaseGroup, GlyphPath;

  beforeAll(async () => {
    // Import the actual module after mocks are set up
    const routeModule = await import('../js/objects/route.js');
    MainRoadSymbol = routeModule.MainRoadSymbol;
    SideRoadSymbol = routeModule.SideRoadSymbol;
    calcMainRoadVertices = routeModule.calcMainRoadVertices;
    calcRoundaboutVertices = routeModule.calcRoundaboutVertices;
    roadMapOnSelect = routeModule.roadMapOnSelect;
    roadMapOnDeselect = routeModule.roadMapOnDeselect;

    // Get the mocked classes
    const drawModule = await import('../js/objects/draw.js');
    BaseGroup = drawModule.BaseGroup;
    GlyphPath = drawModule.GlyphPath;
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    CanvasGlobals.canvasObject.length = 0;
  });

  describe('Vertex Calculation Functions', () => {
    describe('calcMainRoadVertices', () => {
      test('should calculate vertices for main road with proper structure', () => {
        const routeList = [
          { angle: 0, x: 100, y: 50, width: 2, shape: 'Root' },
          { angle: 180, x: 100, y: 150, width: 2, shape: 'Root' }
        ];
        const xHeight = 100;

        const result = calcMainRoadVertices(xHeight, routeList);

        expect(result).toHaveProperty('path');
        expect(result.path).toHaveLength(1);
        expect(result.path[0]).toHaveProperty('vertex');
        expect(result.path[0]).toHaveProperty('arcs');
        expect(result.path[0].vertex).toBeInstanceOf(Array);
        expect(result.path[0].vertex.length).toBeGreaterThan(0);
      });

      test('should handle vertex reordering correctly', () => {
        const routeList = [
          { angle: 0, x: 100, y: 50, width: 2, shape: 'Root' },
          { angle: 180, x: 100, y: 150, width: 2, shape: 'Root' }
        ];

        const result = calcMainRoadVertices(100, routeList);

        expect(result.path[0].vertex).toBeInstanceOf(Array);
        result.path[0].vertex.forEach(vertex => {
          expect(vertex).toHaveProperty('x');
          expect(vertex).toHaveProperty('y');
        });
      });

      test('should assign vertex labels', () => {
        const routeList = [
          { angle: 0, x: 100, y: 50, width: 2, shape: 'Root' },
          { angle: 180, x: 100, y: 150, width: 2, shape: 'Root' }
        ];

        const result = calcMainRoadVertices(100, routeList);

        result.path[0].vertex.forEach(vertex => {
          expect(vertex).toHaveProperty('label');
          expect(vertex.label).toMatch(/^V\d+$/);
        });
      });
    });

    describe('calcRoundaboutVertices', () => {      test('should calculate conventional roundabout vertices', () => {
        const routeList = [
          { shape: 'Small', roadType: 'Conventional Roundabout' },
          { x: 100, y: 100 }
        ];
        const xHeight = 100;

        const result = calcRoundaboutVertices('Conventional', xHeight, routeList);

        expect(result).toHaveProperty('path');
        expect(result.path).toBeInstanceOf(Array);
        expect(result.path[0]).toHaveProperty('vertex');
      });      test('should calculate spiral roundabout vertices', () => {
        const routeList = [
          { shape: 'Small', roadType: 'Spiral Roundabout' },
          { x: 100, y: 100 }
        ];
        const xHeight = 100;

        const result = calcRoundaboutVertices('Spiral', xHeight, routeList);

        expect(result).toHaveProperty('path');
        expect(result.path).toBeInstanceOf(Array);
      });      test('should apply proper transformation to roundabout center', () => {
        const routeList = [
          { shape: 'Small', roadType: 'Conventional Roundabout' },
          { x: 200, y: 150 }
        ];

        calcRoundaboutVertices('Conventional', 100, routeList);

        const { calculateTransformedPoints } = require('../js/objects/path.js');
        expect(calculateTransformedPoints).toHaveBeenCalledWith(
          expect.any(Array),
          expect.objectContaining({
            x: 200,
            y: 150,
            angle: 0
          })
        );
      });
    });
  });

  describe('MainRoadSymbol Class', () => {
    describe('Construction', () => {
      test('should create MainRoadSymbol with default properties', () => {
        const routeList = [
          { angle: 0, x: 100, y: 50, width: 2, shape: 'Root' },
          { angle: 180, x: 100, y: 150, width: 2, shape: 'Root' }
        ];

        const mainRoad = new MainRoadSymbol({ routeList });

        expect(mainRoad.functionalType).toBe('MainRoad');
        expect(mainRoad.className).toBe('MainRoadSymbol');
        expect(mainRoad.routeList).toEqual(routeList);
        expect(mainRoad.xHeight).toBe(100);
        expect(mainRoad.rootLength).toBe(7);
        expect(mainRoad.tipLength).toBe(12);
        expect(mainRoad.color).toBe('white');
        expect(mainRoad.roadType).toBe('Main Line');
        expect(mainRoad.sideRoad).toEqual([]);
        expect(mainRoad.RAfeature).toBe('Conventional');
      });      test('should create MainRoadSymbol with custom properties', () => {
        const routeList = [
          { angle: 0, x: 50, y: 25, width: 3, shape: 'Small' },
          { x: 100, y: 100 } // center point for roundabout
        ];
        const options = {
          routeList,
          xHeight: 120,
          rootLength: 8,
          tipLength: 15,
          color: 'black',
          roadType: 'Conventional Roundabout',
          RAfeature: 'U-turn'
        };

        const mainRoad = new MainRoadSymbol(options);

        expect(mainRoad.routeList).toEqual(routeList);
        expect(mainRoad.xHeight).toBe(120);
        expect(mainRoad.rootLength).toBe(8);
        expect(mainRoad.tipLength).toBe(15);
        expect(mainRoad.color).toBe('black');
        expect(mainRoad.roadType).toBe('Conventional Roundabout');
        expect(mainRoad.RAfeature).toBe('U-turn');
      });      test('should bind event handlers during construction', () => {
        const routeList = [
          { angle: 0, x: 100, y: 50, width: 2, shape: 'Root' },
          { angle: 180, x: 100, y: 150, width: 2, shape: 'Root' }
        ];
        const mainRoad = new MainRoadSymbol({ routeList });

        expect(mainRoad.on).toHaveBeenCalledWith('selected', roadMapOnSelect);
        expect(mainRoad.on).toHaveBeenCalledWith('deselected', roadMapOnDeselect);
        expect(mainRoad.on).toHaveBeenCalledWith('moving', expect.any(Function));
        expect(mainRoad.on).toHaveBeenCalledWith('moved', expect.any(Function));
        expect(mainRoad.on).toHaveBeenCalledWith('modified', expect.any(Function));
      });
    });

    describe('Initialization', () => {
      test('should initialize with proper GlyphPath configuration', () => {
        const routeList = [
          { angle: 0, x: 100, y: 50, width: 2, shape: 'Root' },
          { angle: 180, x: 100, y: 150, width: 2, shape: 'Root' }
        ];
        const mainRoad = new MainRoadSymbol({ routeList, color: 'red' });

        const glyphInstance = GlyphPath.mock.results[0].value;
        expect(glyphInstance.initialize).toHaveBeenCalledWith(
          expect.objectContaining({
            path: expect.any(Array)
          }),
          expect.objectContaining({
            left: 0,
            top: 0,
            angle: 0,
            fill: 'red',
            objectCaching: false,
            dirty: true,
            strokeWidth: 0
          })
        );
      });
    });

    describe('receiveNewRoute', () => {
      test('should handle new side road addition for Main Line', () => {
        const routeList = [
          { angle: 0, x: 100, y: 50, width: 2, shape: 'Root' },
          { angle: 180, x: 100, y: 150, width: 2, shape: 'Root' }
        ];
        const mainRoad = new MainRoadSymbol({ routeList, roadType: 'Main Line' });

        const mockSideRoad = {
          basePolygon: {
            vertex: [
              { x: 50, y: 25 },
              { x: 150, y: 25 },
              { x: 150, y: 75 },
              { x: 50, y: 75 }
            ]
          },
          top: 25,
          height: 50,
          side: false
        };

        mainRoad.receiveNewRoute(mockSideRoad);

        expect(mainRoad.sideRoad).toContain(mockSideRoad);
        expect(mainRoad.replaceBasePolygon).toHaveBeenCalled();
      });      test('should not modify for non-Main Line roads', () => {
        const routeList = [
          { shape: 'Small', x: 100, y: 100 },
          { x: 150, y: 150 } // center point for roundabout
        ];
        const mainRoad = new MainRoadSymbol({ 
          routeList, 
          roadType: 'Conventional Roundabout' 
        });

        const mockSideRoad = {
          basePolygon: { vertex: [] },
          top: 25,
          height: 50
        };

        const initialCallCount = mainRoad.replaceBasePolygon.mock.calls.length;
        mainRoad.receiveNewRoute(mockSideRoad);

        expect(mainRoad.sideRoad.length).toBe(1);
        expect(mainRoad.replaceBasePolygon.mock.calls.length).toBe(initialCallCount);
      });
    });

    describe('onMove', () => {
      test('should update side roads when main road moves', () => {
        const routeList = [
          { angle: 0, x: 100, y: 50, width: 2, shape: 'Root' },
          { angle: 180, x: 100, y: 150, width: 2, shape: 'Root' }
        ];
        const mainRoad = new MainRoadSymbol({ routeList, roadType: 'Main Line' });        const mockSideRoad = {
          onMove: jest.fn(),
          basePolygon: {
            vertex: [
              { x: 0, y: 0 },
              { x: 50, y: 0 },
              { x: 50, y: 50 },
              { x: 25, y: 75 }, // vertex[3]
              { x: 0, y: 100 }  // vertex[4]
            ]
          },
          side: false // so it uses vertex[3]
        };
        mainRoad.sideRoad = [mockSideRoad];

        mainRoad.onMove({});

        expect(mockSideRoad.onMove).toHaveBeenCalledWith(null, true);
        expect(mainRoad.setCoords).toHaveBeenCalled();
      });
    });
  });

  describe('SideRoadSymbol Class', () => {
    let mockMainRoad;

    beforeEach(() => {
      mockMainRoad = {
        routeList: [
          { angle: 0, x: 100, y: 50, width: 2, shape: 'Root' },
          { angle: 180, x: 100, y: 150, width: 2, shape: 'Root' }
        ],
        roadType: 'Main Line',
        xHeight: 100,
        rootLength: 7,
        tipLength: 12,
        receiveNewRoute: jest.fn(),
        setCoords: jest.fn()
      };
    });

    describe('Construction', () => {
      test('should create SideRoadSymbol with default properties', () => {
        const routeList = [
          { x: 150, y: 75, angle: 45, shape: 'Arrow', width: 2 }
        ];

        const sideRoad = new SideRoadSymbol({ 
          routeList, 
          mainRoad: mockMainRoad 
        });        expect(sideRoad.functionalType).toBe('SideRoad');
        expect(sideRoad.className).toBe('SideRoadSymbol');
        expect(sideRoad.routeList).toHaveLength(1);
        expect(sideRoad.routeList[0]).toMatchObject({
          angle: 45,
          shape: 'Arrow', 
          width: 2
        });
        expect(sideRoad.xHeight).toBe(100);
        expect(sideRoad.color).toBe('white');
        expect(sideRoad.mainRoad).toBe(mockMainRoad);
        expect(sideRoad.side).toBe(false);
        expect(sideRoad.branchIndex).toBe(0);
      });

      test('should create SideRoadSymbol with custom properties', () => {
        const routeList = [
          { x: 200, y: 100, angle: 90, shape: 'Stub', width: 3 }
        ];
        const options = {
          routeList,
          xHeight: 120,
          color: 'blue',
          mainRoad: mockMainRoad,
          side: true,
          branchIndex: 2
        };        const sideRoad = new SideRoadSymbol(options);

        expect(sideRoad.routeList).toHaveLength(1);
        expect(sideRoad.routeList[0]).toMatchObject({
          angle: 90,
          shape: 'Stub',
          width: 3
        });
        expect(sideRoad.xHeight).toBe(120);
        expect(sideRoad.color).toBe('blue');
        expect(sideRoad.side).toBe(true);
        expect(sideRoad.branchIndex).toBe(2);
      });

      test('should bind event handlers during construction', () => {
        const routeList = [
          { x: 150, y: 75, angle: 45, shape: 'Arrow', width: 2 }
        ];

        const sideRoad = new SideRoadSymbol({ 
          routeList, 
          mainRoad: mockMainRoad 
        });

        expect(sideRoad.on).toHaveBeenCalledWith('moving', expect.any(Function));
        expect(sideRoad.on).toHaveBeenCalledWith('moved', expect.any(Function));
        expect(sideRoad.on).toHaveBeenCalledWith('modified', expect.any(Function));
      });
    });

    describe('Constraint Application', () => {
      test('should apply constraints for Main Line', () => {
        const routeList = [
          { x: 120, y: 75, angle: 45, shape: 'Arrow', width: 2 }
        ];

        const sideRoad = new SideRoadSymbol({ 
          routeList, 
          mainRoad: mockMainRoad,
          side: false
        });

        expect(mockMainRoad.receiveNewRoute).toHaveBeenCalledWith(sideRoad);
      });

      test('should handle roundabout constraints', () => {
        const roundaboutMainRoad = {
          ...mockMainRoad,
          roadType: 'Conventional Roundabout',
          routeList: [
            { shape: 'Small' },
            { x: 100, y: 100 }
          ]
        };

        const routeList = [
          { x: 150, y: 150, angle: 45, shape: 'Arrow', width: 2 }
        ];

        const sideRoad = new SideRoadSymbol({ 
          routeList, 
          mainRoad: roundaboutMainRoad 
        });

        expect(sideRoad.routeList).toBeDefined();
      });
    });

    describe('onMove', () => {
      test('should update position and main road when side road moves', () => {
        const routeList = [
          { x: 150, y: 75, angle: 45, shape: 'Arrow', width: 2 }
        ];

        const sideRoad = new SideRoadSymbol({ 
          routeList, 
          mainRoad: mockMainRoad 
        });

        sideRoad.onMove({}, true);

        expect(mockMainRoad.receiveNewRoute).toHaveBeenCalled();
        expect(mockMainRoad.setCoords).toHaveBeenCalled();
        expect(sideRoad.replaceBasePolygon).toHaveBeenCalled();
        expect(sideRoad.drawVertex).toHaveBeenCalled();
      });

      test('should not update main road when updateRoot is false', () => {
        const routeList = [
          { x: 150, y: 75, angle: 45, shape: 'Arrow', width: 2 }
        ];

        const sideRoad = new SideRoadSymbol({ 
          routeList, 
          mainRoad: mockMainRoad 
        });

        jest.clearAllMocks();

        sideRoad.onMove({}, false);

        expect(mockMainRoad.receiveNewRoute).not.toHaveBeenCalled();
        expect(mockMainRoad.setCoords).not.toHaveBeenCalled();
      });      test('should return early if no main road', () => {
        const routeList = [
          { x: 150, y: 75, angle: 45, shape: 'Arrow', width: 2 }
        ];

        expect(() => {
          new SideRoadSymbol({ 
            routeList, 
            mainRoad: null 
          });
        }).toThrow();
      });
    });
  });

  describe('Event Handlers', () => {
    describe('roadMapOnSelect', () => {
      test('should handle route selection', () => {
        CanvasGlobals.canvas.getActiveObjects.mockReturnValue([
          { functionalType: 'MainRoad' }
        ]);

        expect(() => roadMapOnSelect({})).not.toThrow();
      });

      test('should handle selection with multiple objects', () => {
        CanvasGlobals.canvas.getActiveObjects.mockReturnValue([
          { functionalType: 'MainRoad' },
          { functionalType: 'SideRoad' }
        ]);

        expect(() => roadMapOnSelect({})).not.toThrow();
      });
    });

    describe('roadMapOnDeselect', () => {
      test('should handle route deselection', () => {
        expect(() => roadMapOnDeselect({})).not.toThrow();
      });
    });
  });

  describe('Error Handling', () => {
    test('should handle missing shape data', () => {
      const routeList = [
        { angle: 0, x: 100, y: 50, width: 2 } // Missing shape
      ];

      expect(() => {
        calcMainRoadVertices(100, routeList);
      }).toThrow();
    });    test('should handle invalid route data gracefully', () => {
      const routeList = [
        { angle: null, x: 100, y: 50, width: 2, shape: 'Root' }
      ];

      expect(() => {
        calcMainRoadVertices(100, routeList);
      }).toThrow();
    });

    test('should handle missing main road reference', () => {
      const routeList = [
        { x: 150, y: 75, angle: 45, shape: 'Arrow', width: 2 }
      ];

      expect(() => {
        new SideRoadSymbol({ routeList, mainRoad: null });
      }).toThrow();
    });
  });
});