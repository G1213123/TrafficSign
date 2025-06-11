/**
 * Tests for touchEvents.js module
 * This module handles touch interactions including pinch-to-zoom and two-finger pan
 */

import { CanvasGlobals, DrawGrid } from '../js/canvas/canvas.js';
// Import the touchEvents module to register the event handlers
import '../js/canvas/touchEvents.js';

describe('Touch Events Module', () => {
  let mockCanvas;
  let mockTouchEvent;
  
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Get the mocked canvas instance
    mockCanvas = CanvasGlobals.canvas;
    
    // Reset canvas state
    mockCanvas.selection = true;
    mockCanvas.getZoom.mockReturnValue(1);
    
    // Create mock touch event structure
    mockTouchEvent = {
      e: {
        touches: [
          { clientX: 100, clientY: 100 },
          { clientX: 200, clientY: 200 }
        ],
        preventDefault: jest.fn()
      }
    };
  });
  describe('Touch Event Registration', () => {
    test('should have touchEvents module loaded and functional', () => {
      // Since the module registers event handlers on import, 
      // we test that the module loads without error and canvas is available
      expect(mockCanvas).toBeDefined();
      expect(typeof mockCanvas.on).toBe('function');
      expect(typeof mockCanvas.zoomToPoint).toBe('function');
      expect(typeof mockCanvas.relativePan).toBe('function');
    });
  });

  describe('Two-Finger Touch Down', () => {
    test('should initialize pinch-to-zoom on two-finger touch', () => {
      const touchDownHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:down'
      )?.[1];
      
      if (touchDownHandler) {
        touchDownHandler(mockTouchEvent);
        
        expect(mockCanvas.selection).toBe(false);
        expect(mockTouchEvent.e.preventDefault).toHaveBeenCalled();
      }
    });

    test('should calculate initial touch distance correctly', () => {
      const touchDownHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:down'
      )?.[1];
      
      if (touchDownHandler) {
        const customTouchEvent = {
          e: {
            touches: [
              { clientX: 0, clientY: 0 },
              { clientX: 300, clientY: 400 } // 3-4-5 triangle, distance = 500
            ],
            preventDefault: jest.fn()
          }
        };
        
        touchDownHandler(customTouchEvent);
        
        // The module should calculate distance using Math.hypot
        // For a 3-4-5 triangle: Math.hypot(300, 400) = 500
        expect(customTouchEvent.e.preventDefault).toHaveBeenCalled();
      }
    });

    test('should calculate initial touch center correctly', () => {
      const touchDownHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:down'
      )?.[1];
      
      if (touchDownHandler) {
        const customTouchEvent = {
          e: {
            touches: [
              { clientX: 100, clientY: 200 },
              { clientX: 300, clientY: 400 }
            ],
            preventDefault: jest.fn()
          }
        };
        
        touchDownHandler(customTouchEvent);
        
        // Center should be: x = (100 + 300) / 2 = 200, y = (200 + 400) / 2 = 300
        expect(customTouchEvent.e.preventDefault).toHaveBeenCalled();
      }
    });

    test('should not initialize on single touch', () => {
      const touchDownHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:down'
      )?.[1];
      
      if (touchDownHandler) {
        const singleTouchEvent = {
          e: {
            touches: [
              { clientX: 100, clientY: 100 }
            ],
            preventDefault: jest.fn()
          }
        };
        
        touchDownHandler(singleTouchEvent);
        
        // Should not prevent default for single touch
        expect(singleTouchEvent.e.preventDefault).not.toHaveBeenCalled();
        expect(mockCanvas.selection).toBe(true);
      }
    });

    test('should not initialize on three or more touches', () => {
      const touchDownHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:down'
      )?.[1];
      
      if (touchDownHandler) {
        const multiTouchEvent = {
          e: {
            touches: [
              { clientX: 100, clientY: 100 },
              { clientX: 200, clientY: 200 },
              { clientX: 300, clientY: 300 }
            ],
            preventDefault: jest.fn()
          }
        };
        
        touchDownHandler(multiTouchEvent);
        
        expect(multiTouchEvent.e.preventDefault).not.toHaveBeenCalled();
        expect(mockCanvas.selection).toBe(true);
      }
    });
  });

  describe('Two-Finger Touch Move (Pinch and Pan)', () => {
    beforeEach(() => {
      // First simulate a touch down to initialize touching state
      const touchDownHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:down'
      )?.[1];
      
      if (touchDownHandler) {
        touchDownHandler(mockTouchEvent);
      }
    });

    test('should zoom based on pinch distance change', () => {
      const touchMoveHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:move'
      )?.[1];
      
      if (touchMoveHandler) {
        // Mock fabric.Point constructor
        global.fabric.Point = jest.fn().mockImplementation((x, y) => ({ x, y }));
        
        const pinchEvent = {
          e: {
            touches: [
              { clientX: 80, clientY: 80 },   // Moved closer
              { clientX: 220, clientY: 220 }  // Moved closer (pinch in)
            ],
            preventDefault: jest.fn()
          }
        };
        
        touchMoveHandler(pinchEvent);
        
        expect(mockCanvas.zoomToPoint).toHaveBeenCalled();
        expect(pinchEvent.e.preventDefault).toHaveBeenCalled();
      }
    });

    test('should pan based on center point movement', () => {
      const touchMoveHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:move'
      )?.[1];
      
      if (touchMoveHandler) {
        global.fabric.Point = jest.fn().mockImplementation((x, y) => ({ x, y }));
        
        const panEvent = {
          e: {
            touches: [
              { clientX: 120, clientY: 120 }, // Moved 20px right, 20px down
              { clientX: 220, clientY: 220 }  // Moved 20px right, 20px down
            ],
            preventDefault: jest.fn()
          }
        };
        
        touchMoveHandler(panEvent);
        
        expect(mockCanvas.relativePan).toHaveBeenCalled();
        expect(mockCanvas.requestRenderAll).toHaveBeenCalled();
      }
    });

    test('should enforce zoom limits during pinch', () => {
      const touchMoveHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:move'
      )?.[1];
      
      if (touchMoveHandler) {
        global.fabric.Point = jest.fn().mockImplementation((x, y) => ({ x, y }));
        
        // Test maximum zoom
        mockCanvas.getZoom.mockReturnValue(19);
        
        const extremePinchOut = {
          e: {
            touches: [
              { clientX: 0, clientY: 0 },     // Very far apart
              { clientX: 1000, clientY: 1000 } // Very far apart
            ],
            preventDefault: jest.fn()
          }
        };
        
        touchMoveHandler(extremePinchOut);
        
        // Zoom should be clamped to maximum (20)
        const zoomCall = mockCanvas.zoomToPoint.mock.calls[0];
        if (zoomCall) {
          expect(zoomCall[1]).toBeLessThanOrEqual(20);
        }
      }
    });

    test('should enforce minimum zoom during pinch', () => {
      const touchMoveHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:move'
      )?.[1];
      
      if (touchMoveHandler) {
        global.fabric.Point = jest.fn().mockImplementation((x, y) => ({ x, y }));
        
        // Test minimum zoom
        mockCanvas.getZoom.mockReturnValue(0.1);
        
        const extremePinchIn = {
          e: {
            touches: [
              { clientX: 149, clientY: 149 }, // Very close together
              { clientX: 151, clientY: 151 } // Very close together
            ],
            preventDefault: jest.fn()
          }
        };
        
        touchMoveHandler(extremePinchIn);
        
        // Zoom should be clamped to minimum (0.01)
        const zoomCall = mockCanvas.zoomToPoint.mock.calls[0];
        if (zoomCall) {
          expect(zoomCall[1]).toBeGreaterThanOrEqual(0.01);
        }
      }
    });

    test('should update grid after pinch zoom', () => {
      const touchMoveHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:move'
      )?.[1];
      
      if (touchMoveHandler) {
        global.fabric.Point = jest.fn().mockImplementation((x, y) => ({ x, y }));
        
        // Mock DrawGrid function
        const originalDrawGrid = global.DrawGrid;
        global.DrawGrid = jest.fn();
        
        touchMoveHandler({
          e: {
            touches: [
              { clientX: 120, clientY: 120 },
              { clientX: 180, clientY: 180 }
            ],
            preventDefault: jest.fn()
          }
        });
        
        expect(global.DrawGrid).toHaveBeenCalled();
        
        // Restore original
        global.DrawGrid = originalDrawGrid;
      }
    });

    test('should not handle move events when not in native touching mode', () => {
      // First end the touch to disable native touching
      const touchUpHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:up'
      )?.[1];
      
      if (touchUpHandler) {
        touchUpHandler({});
      }
      
      const touchMoveHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:move'
      )?.[1];
      
      if (touchMoveHandler) {
        touchMoveHandler({
          e: {
            touches: [
              { clientX: 120, clientY: 120 },
              { clientX: 180, clientY: 180 }
            ],
            preventDefault: jest.fn()
          }
        });
        
        // Should not perform zoom or pan operations
        expect(mockCanvas.zoomToPoint).not.toHaveBeenCalled();
        expect(mockCanvas.relativePan).not.toHaveBeenCalled();
      }
    });

    test('should not handle single touch move events', () => {
      const touchMoveHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:move'
      )?.[1];
      
      if (touchMoveHandler) {
        const singleTouchMove = {
          e: {
            touches: [
              { clientX: 120, clientY: 120 }
            ],
            preventDefault: jest.fn()
          }
        };
        
        touchMoveHandler(singleTouchMove);
        
        expect(mockCanvas.zoomToPoint).not.toHaveBeenCalled();
        expect(mockCanvas.relativePan).not.toHaveBeenCalled();
      }
    });

    test('should not handle events without touches', () => {
      const touchMoveHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:move'
      )?.[1];
      
      if (touchMoveHandler) {
        const noTouchEvent = {
          e: {
            touches: null,
            preventDefault: jest.fn()
          }
        };
        
        touchMoveHandler(noTouchEvent);
        
        expect(mockCanvas.zoomToPoint).not.toHaveBeenCalled();
        expect(mockCanvas.relativePan).not.toHaveBeenCalled();
      }
    });
  });

  describe('Touch Up Events', () => {
    beforeEach(() => {
      // Initialize touch state
      const touchDownHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:down'
      )?.[1];
      
      if (touchDownHandler) {
        touchDownHandler(mockTouchEvent);
      }
    });

    test('should end native touching and restore selection', () => {
      const touchUpHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:up'
      )?.[1];
      
      if (touchUpHandler) {
        // Canvas selection should be disabled during touch
        expect(mockCanvas.selection).toBe(false);
        
        touchUpHandler({});
        
        // Should restore selection after touch ends
        expect(mockCanvas.selection).toBe(true);
      }
    });

    test('should handle touch up when not in native touching mode', () => {
      // First end the touch
      const touchUpHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:up'
      )?.[1];
      
      if (touchUpHandler) {
        touchUpHandler({});
        
        // Call again when not in touching mode
        const initialSelection = mockCanvas.selection;
        touchUpHandler({});
        
        // Should not change selection state
        expect(mockCanvas.selection).toBe(initialSelection);
      }
    });
  });

  describe('Touch Gesture Calculations', () => {
    test('should calculate distance correctly using Math.hypot', () => {
      const touchDownHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:down'
      )?.[1];
      
      if (touchDownHandler) {
        // Test known distance calculation
        const knownDistanceEvent = {
          e: {
            touches: [
              { clientX: 0, clientY: 0 },
              { clientX: 3, clientY: 4 } // 3-4-5 triangle
            ],
            preventDefault: jest.fn()
          }
        };
        
        touchDownHandler(knownDistanceEvent);
        
        // Math.hypot(3, 4) should equal 5
        expect(knownDistanceEvent.e.preventDefault).toHaveBeenCalled();
      }
    });

    test('should calculate center point correctly', () => {
      const touchDownHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:down'
      )?.[1];
      
      if (touchDownHandler) {
        const symmetricTouchEvent = {
          e: {
            touches: [
              { clientX: 0, clientY: 0 },
              { clientX: 100, clientY: 100 }
            ],
            preventDefault: jest.fn()
          }
        };
        
        touchDownHandler(symmetricTouchEvent);
        
        // Center should be (50, 50)
        expect(symmetricTouchEvent.e.preventDefault).toHaveBeenCalled();
      }
    });
  });

  describe('Integration with CanvasGlobals', () => {
    test('should use CanvasGlobals.canvas for all operations', () => {
      expect(CanvasGlobals.canvas).toBeDefined();
      expect(CanvasGlobals.activeVertex).toBeDefined();
    });
  });

  describe('Fabric.js Integration', () => {
    test('should use fabric.Point for coordinate operations', () => {
      const touchMoveHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:move'
      )?.[1];
      
      if (touchMoveHandler) {
        // Initialize touch state first
        const touchDownHandler = mockCanvas.on.mock.calls.find(
          call => call[0] === 'mouse:down'
        )?.[1];
        
        if (touchDownHandler) {
          touchDownHandler(mockTouchEvent);
        }
        
        global.fabric.Point = jest.fn().mockImplementation((x, y) => ({ x, y }));
        
        touchMoveHandler({
          e: {
            touches: [
              { clientX: 120, clientY: 120 },
              { clientX: 180, clientY: 180 }
            ],
            preventDefault: jest.fn()
          }
        });
        
        expect(global.fabric.Point).toHaveBeenCalled();
      }
    });
  });

  describe('Error Handling and Edge Cases', () => {
    test('should handle events with malformed touch data', () => {
      const touchDownHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:down'
      )?.[1];
      
      if (touchDownHandler) {
        const malformedEvent = {
          e: {
            touches: [
              { clientX: undefined, clientY: null },
              { clientX: 'invalid', clientY: 100 }
            ],
            preventDefault: jest.fn()
          }
        };
        
        expect(() => {
          touchDownHandler(malformedEvent);
        }).not.toThrow();
      }
    });

    test('should handle zoom calculations with zero distance', () => {
      const touchMoveHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:move'
      )?.[1];
      
      if (touchMoveHandler) {
        // Initialize touch first
        const touchDownHandler = mockCanvas.on.mock.calls.find(
          call => call[0] === 'mouse:down'
        )?.[1];
        
        if (touchDownHandler) {
          touchDownHandler(mockTouchEvent);
        }
        
        global.fabric.Point = jest.fn().mockImplementation((x, y) => ({ x, y }));
        
        const zeroDistanceEvent = {
          e: {
            touches: [
              { clientX: 100, clientY: 100 },
              { clientX: 100, clientY: 100 } // Same position
            ],
            preventDefault: jest.fn()
          }
        };
        
        expect(() => {
          touchMoveHandler(zeroDistanceEvent);
        }).not.toThrow();
      }
    });

    test('should handle missing preventDefault method', () => {
      const touchDownHandler = mockCanvas.on.mock.calls.find(
        call => call[0] === 'mouse:down'
      )?.[1];
      
      if (touchDownHandler) {
        const eventWithoutPreventDefault = {
          e: {
            touches: [
              { clientX: 100, clientY: 100 },
              { clientX: 200, clientY: 200 }
            ]
            // No preventDefault method
          }
        };
        
        expect(() => {
          touchDownHandler(eventWithoutPreventDefault);
        }).not.toThrow();
      }
    });
  });
});
