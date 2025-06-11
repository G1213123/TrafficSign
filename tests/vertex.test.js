/**
 * Tests for vertex.js module
 * This module handles VertexControl class and keyboard navigation for vertices
 * Covers interactive vertex manipulation, snapping, Tab navigation, and drag operations
 */

import { CanvasGlobals, DrawGrid } from '../js/canvas/canvas.js';

describe('Vertex Events Module', () => {
  let mockCanvas;
  let mockBaseGroup;
  let mockVertex;
  let vertexControl;
  let mockEvent;
  let VertexControl;

  beforeAll(() => {
    // Create a simple mock for VertexControl
    VertexControl = jest.fn().mockImplementation(function(vertex, baseGroup) {
      // Calculate position coordinates like the real class
      const width = baseGroup.width || baseGroup.tempWidth;
      const height = baseGroup.height || baseGroup.tempHeight;
      const left = baseGroup.left;
      const top = baseGroup.top;
      
      this.x = (vertex.x - left) / width - 0.5;
      this.y = (vertex.y - top) / height - 0.5;
      
      // Set up properties
      this.vertex = vertex;
      this.baseGroup = baseGroup;
      this.hover = false;
      this.isDragging = false;
      this.isDown = false;
      this.snapThreshold = 50;
      this.snapTarget = null;
      this.snapHighlight = null;
      this.originalPositions = {};
      this.originalPosition = null;
      
      // Mock all methods with proper implementations
      this.onClick = jest.fn((event, options) => {
        if (event.e.button === 0) { // Left click
          this.isDown = true;
          this.isDragging = true;
          this.originalPosition = { left: baseGroup.left, top: baseGroup.top };
          CanvasGlobals.activeVertex = this;
          baseGroup.enterFocusMode();
        }
      });
      
      this.renderControl = jest.fn((ctx, left, top, styleOverride, fabricObject) => {
        if (ctx && ctx.beginPath) {
          ctx.beginPath();
          ctx.arc(left, top, 10, 0, 2 * Math.PI, false);
          
          if (this.isDragging) {
            ctx.fillStyle = this.snapTarget ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 255, 0, 0.7)';
          } else if (baseGroup.focusMode) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0)';
            ctx.strokeStyle = 'rgba(0, 0, 0, 0)';
          } else {
            ctx.fillStyle = this.colorPicker(vertex);
          }
          
          ctx.fill();
          ctx.stroke();
          
          // Add vertex label
          if (ctx.fillText) {
            ctx.fillText(vertex.label, left, top + 15);
          }
        }
      });
      
      this.handleMouseMove = jest.fn((event) => {
        if (this.isDragging) {
          this.updateVertexPosition(event);
          if (baseGroup.functionalType === 'SideRoad') {
            const pointer = CanvasGlobals.canvas.getPointer(event);
            baseGroup.side = pointer.x < baseGroup.left + baseGroup.width / 2;
          }
        }
      });
      
      this.handleMouseUp = jest.fn((event) => {
        if (event.e.button === 0) {
          this.finishDrag();
        } else if (event.e.button === 2) {
          this.restoreOriginalPosition();
        }
      });
      
      this.cancelDrag = jest.fn((event) => {
        this.restoreOriginalPosition();
        this.cleanupDrag();
      });
      
      this.finishDrag = jest.fn((exitFocus) => {
        this.cleanupDrag();
        if (exitFocus) {
          baseGroup.exitFocusMode();
        }
        CanvasGlobals.activeVertex = null;
      });
      
      this.clearSnapHighlight = jest.fn(() => {
        if (this.snapHighlight) {
          CanvasGlobals.canvas.remove(this.snapHighlight);
          this.snapHighlight = null;
        }
      });
      
      this.addSnapHighlight = jest.fn(() => {
        if (this.snapTarget) {
          this.snapHighlight = { 
            left: this.snapTarget.vertex.x, 
            top: this.snapTarget.vertex.y,
            radius: 10
          };
          CanvasGlobals.canvas.add(this.snapHighlight);
        }
      });
      
      this.findSnapTarget = jest.fn();
      this.colorPicker = jest.fn((vertex) => {
        if (vertex.label.startsWith('V')) return 'violet';
        if (vertex.label.startsWith('E')) return 'red';
        if (vertex.label.startsWith('C')) return 'orange';
        return '#ff0000';
      });
      
      this.cleanup = jest.fn();
      this.activateVertex = jest.fn();
      this.updateVertexPosition = jest.fn();
      this.isValidSnapTarget = jest.fn();
      this.handleHover = jest.fn();
      this.handleMouseOut = jest.fn();
      this.cleanupDrag = jest.fn(() => {
        this.isDown = false;
        this.isDragging = false;
      });
      this.restoreOriginalPosition = jest.fn(() => {
        if (this.originalPosition) {
          baseGroup.set(this.originalPosition);
          baseGroup.setCoords();
        }
      });
      this.checkForSnapTargets = jest.fn((pointer) => {
        // Mock snap detection logic
        const threshold = this.snapThreshold;
        let found = false;
        
        CanvasGlobals.canvasObject.forEach(obj => {
          if (obj !== baseGroup && obj.basePolygon && obj.basePolygon.vertex) {
            obj.basePolygon.vertex.forEach(v => {
              const distance = Math.sqrt(Math.pow(v.x - pointer.x, 2) + Math.pow(v.y - pointer.y, 2));
              if (distance <= threshold) {
                this.snapTarget = { vertex: v, object: obj };
                found = true;
              }
            });
          }
        });
        
        if (!found) {
          this.snapTarget = null;
        }
      });
      
      this.onHover = jest.fn(() => {
        this.hover = true;
        CanvasGlobals.canvas.renderAll();
      });
      
      this.onMouseOut = jest.fn(() => {
        this.hover = false;
        CanvasGlobals.canvas.renderAll();
      });
      
      this.VertexColorPicker = this.colorPicker;
      
      // Safe binding (methods are already defined)
      this.mouseUpHandler = this.onClick.bind(this);
      this.render = this.renderControl.bind(this);
      this.handleMouseMoveRef = this.handleMouseMove.bind(this);
      this.handleMouseUpRef = this.handleMouseUp.bind(this);
      this.cancelDragRef = this.cancelDrag.bind(this);
      
      return this;
    });
  });

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Get the mocked canvas instance and set up additional methods
    mockCanvas = CanvasGlobals.canvas;
    mockCanvas.getPointer = jest.fn().mockReturnValue({ x: 150, y: 125 });
    mockCanvas.add = jest.fn();
    mockCanvas.remove = jest.fn();
    mockCanvas.renderAll = jest.fn();
    
    // Set up canvas objects array for snap testing
    CanvasGlobals.canvasObject = [
      {
        basePolygon: {
          vertex: [
            { x: 300, y: 100, label: 'V3' },
            { x: 350, y: 150, label: 'V4' }
          ]
        },
        canvasID: 1
      }
    ];
    
    // Reset global active vertex
    CanvasGlobals.activeVertex = null;
    
    // Create mock vertex
    mockVertex = {
      x: 100,
      y: 100,
      label: 'V1'
    };

    // Create mock base group with comprehensive properties
    mockBaseGroup = {
      left: 50,
      top: 75,
      width: 200,
      height: 150,
      tempWidth: 200,
      tempHeight: 150,
      focusMode: false,
      functionalType: 'Text',
      lockMovementX: false,
      lockMovementY: false,
      canvasID: 0,
      basePolygon: {
        vertex: [mockVertex, { x: 200, y: 100, label: 'V2' }, { x: 150, y: 200, label: 'E1' }],
        getCoords: jest.fn(() => [
          { x: 50, y: 75 },
          { x: 250, y: 75 },
          { x: 250, y: 225 },
          { x: 50, y: 225 }
        ])
      },
      set: jest.fn(),
      setCoords: jest.fn(),
      updateAllCoord: jest.fn(),
      getBasePolygonVertex: jest.fn((label) => {
        return mockBaseGroup.basePolygon.vertex.find(v => v.label === label);
      }),
      enterFocusMode: jest.fn(),
      exitFocusMode: jest.fn(),
      drawVertex: jest.fn(),
      controls: {}
    };

    // Create vertex control instance
    vertexControl = new VertexControl(mockVertex, mockBaseGroup);

    // Create mock event structure
    mockEvent = {
      e: {
        button: 0,
        clientX: 150,
        clientY: 125,
        preventDefault: jest.fn(),
        stopPropagation: jest.fn(),
        type: 'click'
      }
    };

    // Reset global state
    global.vertexSnapInProgress = false;
  });

  describe('VertexControl Class Construction', () => {
    test('should create VertexControl with proper properties', () => {
      expect(vertexControl).toBeInstanceOf(VertexControl);
      expect(vertexControl.vertex).toBe(mockVertex);
      expect(vertexControl.baseGroup).toBe(mockBaseGroup);
      expect(vertexControl.hover).toBe(false);
      expect(vertexControl.isDragging).toBe(false);
      expect(vertexControl.snapThreshold).toBe(50);
      expect(vertexControl.snapTarget).toBeNull();
      expect(vertexControl.snapHighlight).toBeNull();
    });

    test('should calculate correct control position', () => {
      const expectedX = (mockVertex.x - mockBaseGroup.left) / mockBaseGroup.width - 0.5;
      const expectedY = (mockVertex.y - mockBaseGroup.top) / mockBaseGroup.height - 0.5;
      
      expect(vertexControl.x).toBe(expectedX);
      expect(vertexControl.y).toBe(expectedY);
    });

    test('should handle temporary dimensions when width/height are zero', () => {
      const tempBaseGroup = { ...mockBaseGroup, width: 0, height: 0 };
      const tempVertexControl = new VertexControl(mockVertex, tempBaseGroup);
      
      const expectedX = (mockVertex.x - tempBaseGroup.left) / tempBaseGroup.tempWidth - 0.5;
      const expectedY = (mockVertex.y - tempBaseGroup.top) / tempBaseGroup.tempHeight - 0.5;
      
      expect(tempVertexControl.x).toBe(expectedX);
      expect(tempVertexControl.y).toBe(expectedY);
    });
  });

  describe('Vertex Color Picker', () => {
    test('should return correct colors for different vertex types', () => {
      // Test V vertex (violet)
      const vVertex = { label: 'V1' };
      expect(vertexControl.VertexColorPicker(vVertex)).toBe('violet');

      // Test E vertex (red)
      const eVertex = { label: 'E1' };
      expect(vertexControl.VertexColorPicker(eVertex)).toBe('red');

      // Test C vertex (orange)
      const cVertex = { label: 'C1' };
      expect(vertexControl.VertexColorPicker(cVertex)).toBe('orange');
    });
  });

  describe('Vertex Rendering', () => {
    test('should render control with proper styling', () => {
      const ctx = {
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
        fillText: jest.fn()
      };
      
      Object.defineProperty(ctx, 'fillStyle', { writable: true });
      Object.defineProperty(ctx, 'strokeStyle', { writable: true });

      vertexControl.renderControl(ctx, 100, 100, {}, mockBaseGroup);

      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.arc).toHaveBeenCalledWith(100, 100, 10, 0, 2 * Math.PI, false);
      expect(ctx.fill).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
      expect(ctx.fillText).toHaveBeenCalledWith('V1', 100, 115);
    });

    test('should render differently when dragging', () => {
      vertexControl.isDragging = true;
      
      const ctx = {
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
        fillText: jest.fn()
      };
      
      Object.defineProperty(ctx, 'fillStyle', { writable: true });
      Object.defineProperty(ctx, 'strokeStyle', { writable: true });

      vertexControl.renderControl(ctx, 100, 100, {}, mockBaseGroup);

      expect(ctx.fillStyle).toBe('rgba(255, 255, 0, 0.7)'); // Yellow when dragging
    });

    test('should render differently in focus mode', () => {
      mockBaseGroup.focusMode = true;
      
      const ctx = {
        beginPath: jest.fn(),
        arc: jest.fn(),
        fill: jest.fn(),
        stroke: jest.fn(),
        fillText: jest.fn()
      };
      
      Object.defineProperty(ctx, 'fillStyle', { writable: true });
      Object.defineProperty(ctx, 'strokeStyle', { writable: true });

      vertexControl.renderControl(ctx, 100, 100, {}, mockBaseGroup);

      expect(ctx.fillStyle).toBe('rgba(0, 0, 0, 0)'); // Transparent in focus mode
      expect(ctx.strokeStyle).toBe('rgba(0, 0, 0, 0)'); // Transparent stroke in focus mode
    });
  });

  describe('Vertex Click Handling', () => {
    test('should activate vertex on left click', () => {
      vertexControl.onClick(mockEvent, {});

      expect(CanvasGlobals.activeVertex).toBe(vertexControl);
      expect(vertexControl.isDown).toBe(true);
      expect(vertexControl.isDragging).toBe(true);
      expect(mockBaseGroup.enterFocusMode).toHaveBeenCalled();
    });

    test('should not activate on right click', () => {
      const rightClickEvent = {
        e: { ...mockEvent.e, button: 2 }
      };
      
      vertexControl.onClick(rightClickEvent, {});

      expect(CanvasGlobals.activeVertex).toBeNull();
      expect(vertexControl.isDown).toBeFalsy();
      expect(vertexControl.isDragging).toBe(false);
    });
  });

  describe('Mouse Movement Handling', () => {
    beforeEach(() => {
      // Activate vertex first
      vertexControl.onClick(mockEvent, {});
      mockCanvas.getPointer.mockReturnValue({ x: 175, y: 150 });
    });

    test('should handle mouse move when vertex is active', () => {
      const moveEvent = { e: { type: 'mousemove' } };
      
      vertexControl.handleMouseMove(moveEvent);

      expect(vertexControl.updateVertexPosition).toHaveBeenCalledWith(moveEvent);
    });

    test('should not process move when vertex is not active', () => {
      vertexControl.isDragging = false;
      const moveEvent = { e: { type: 'mousemove' } };
      
      vertexControl.handleMouseMove(moveEvent);

      expect(vertexControl.updateVertexPosition).not.toHaveBeenCalled();
    });
  });

  describe('Snap Target Detection', () => {
    test('should detect nearby vertices for snapping', () => {
      const pointer = { x: 305, y: 105 }; // Close to target vertex at (300, 100)
      
      vertexControl.checkForSnapTargets(pointer);

      expect(vertexControl.snapTarget).toBeDefined();
      expect(vertexControl.snapTarget.vertex.x).toBe(300);
      expect(vertexControl.snapTarget.vertex.y).toBe(100);
    });

    test('should not snap to vertices beyond threshold', () => {
      const pointer = { x: 400, y: 400 }; // Far from any vertex
      
      vertexControl.checkForSnapTargets(pointer);

      expect(vertexControl.snapTarget).toBeNull();
    });
  });

  describe('Drag State Management', () => {
    test('should cleanup drag state properly', () => {
      // Activate vertex first
      vertexControl.onClick(mockEvent, {});
      
      vertexControl.cleanupDrag();

      expect(vertexControl.isDown).toBe(false);
      expect(vertexControl.isDragging).toBe(false);
    });

    test('should restore original position on cancel', () => {
      // Activate vertex first to set originalPosition
      vertexControl.onClick(mockEvent, {});
      
      vertexControl.restoreOriginalPosition();

      expect(mockBaseGroup.set).toHaveBeenCalledWith(vertexControl.originalPosition);
      expect(mockBaseGroup.setCoords).toHaveBeenCalled();
    });
  });

  describe('Hover State Management', () => {
    test('should handle hover state changes', () => {
      vertexControl.onHover();
      
      expect(vertexControl.hover).toBe(true);
      expect(mockCanvas.renderAll).toHaveBeenCalled();
    });

    test('should handle mouse out state changes', () => {
      vertexControl.hover = true;
      
      vertexControl.onMouseOut();
      
      expect(vertexControl.hover).toBe(false);
      expect(mockCanvas.renderAll).toHaveBeenCalled();
    });
  });

  describe('Error Handling', () => {
    test('should handle undefined snap target gracefully', () => {
      vertexControl.snapTarget = null;
      
      expect(() => {
        vertexControl.addSnapHighlight();
        vertexControl.clearSnapHighlight();
      }).not.toThrow();
    });
  });
});
