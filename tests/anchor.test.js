import { globalAnchorTree, anchorShape, processUpdateCycle } from '../js/objects/anchor.js';

// Mock the promptBox module to avoid DOM interactions
jest.mock('../js/canvas/promptBox.js', () => ({
  showTextBox: jest.fn((text, withAnswerBox, event, callback) => {
    // For tests that check user cancellation, return null
    if (text.includes('vertex') && text.includes('From')) {
      return 'E1'; // Default vertex
    }
    if (text.includes('spacing')) {
      return '10'; // Default spacing
    }
    if (withAnswerBox !== null) {
      return withAnswerBox; // Return the provided default value
    }
    return null;
  }),
  hideTextBox: jest.fn(),
  selectObjectHandler: jest.fn()
}));

// Mock the canvas module
jest.mock('../js/canvas/canvas.js', () => ({
  CanvasGlobals: {
    canvas: {
      add: jest.fn(),
      remove: jest.fn(),
      renderAll: jest.fn(),
      bringObjectToFront: jest.fn(),
      fire: jest.fn(),
      getActiveObject: jest.fn(),
      setActiveObject: jest.fn(),
      sendObjectToBack: jest.fn(),
      bringObjectForward: jest.fn(),
      sendObjectBackwards: jest.fn(),
      getObjects: jest.fn(() => []),
      findTarget: jest.fn()
    }
  }
}));

// Mock the tracker module
jest.mock('../js/canvas/Tracker.js', () => ({
  canvasTracker: {
    track: jest.fn()
  }
}));

// Mock keyboard events
jest.mock('../js/canvas/keyboardEvents.js', () => ({
  ShowHideSideBarEvent: jest.fn()
}));

// Import the mocked modules to access their functions in tests
import { showTextBox } from '../js/canvas/promptBox.js';
import { canvasTracker } from '../js/canvas/Tracker.js';
import { CanvasGlobals } from '../js/canvas/canvas.js';

describe('Anchor Module', () => {
  let mockShape1, mockShape2;

  // Factory function to create fresh mock shapes
  const createMockShape = (id, left = 100, top = 100) => ({
    canvasID: id,
    functionalType: 'BaseGroup',
    left: left,
    top: top,
    width: 50,
    height: 50,
    xHeight: 75,
    lockXToPolygon: {},
    lockYToPolygon: {},
    lockMovementX: false,
    lockMovementY: false,
    anchoredPolygon: [],
    widthObjects: [],
    heightObjects: [],
    set: jest.fn(function (props) {
      Object.assign(this, props);
    }),
    setCoords: jest.fn(),
    updateAllCoord: jest.fn(),
    getBasePolygonVertex: jest.fn((vertex) => {
      const coords = {
        'E1': id === 1 ? { x: 125, y: 100 } : { x: 220, y: 200 },
        'E2': id === 1 ? { x: 150, y: 125 } : { x: 240, y: 220 },
        'E3': id === 1 ? { x: 125, y: 150 } : { x: 220, y: 240 },
        'E4': id === 1 ? { x: 100, y: 125 } : { x: 200, y: 220 }
      };
      return coords[vertex] || (id === 1 ? { x: 125, y: 125 } : { x: 220, y: 220 });
    }),
    enterFocusMode: jest.fn(),
    exitFocusMode: jest.fn()
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock global functions
    global.alert = jest.fn();

    // Reset global anchor tree state
    globalAnchorTree.xTree = {};
    globalAnchorTree.yTree = {};
    globalAnchorTree.updateInProgressX = false;
    globalAnchorTree.updateInProgressY = false;
    globalAnchorTree.updatedObjectsX = new Set();
    globalAnchorTree.updatedObjectsY = new Set();
    globalAnchorTree.starterObjectX = null;
    globalAnchorTree.starterObjectY = null;
    globalAnchorTree.updateDepthX = 0;
    globalAnchorTree.updateDepthY = 0;

    // Create completely fresh mock shapes for each test
    mockShape1 = createMockShape(1, 100, 100);
    mockShape2 = createMockShape(2, 200, 200);
  });

  describe('AnchorTree Class', () => {
    describe('Update Cycle Management', () => {
      test('should start and end update cycles correctly', () => {
        // Start X update cycle
        globalAnchorTree.startUpdateCycle('x', 1);

        expect(globalAnchorTree.updateInProgressX).toBe(true);
        expect(globalAnchorTree.starterObjectX).toBe(1);
        expect(globalAnchorTree.updateDepthX).toBe(1);

        // Start Y update cycle
        globalAnchorTree.startUpdateCycle('y', 2);

        expect(globalAnchorTree.updateInProgressY).toBe(true);
        expect(globalAnchorTree.starterObjectY).toBe(2);
        expect(globalAnchorTree.updateDepthY).toBe(1);

        // End cycles
        globalAnchorTree.endUpdateCycle('x');
        globalAnchorTree.endUpdateCycle('y');

        expect(globalAnchorTree.updateInProgressX).toBe(false);
        expect(globalAnchorTree.updateInProgressY).toBe(false);
        expect(globalAnchorTree.updateDepthX).toBe(0);
        expect(globalAnchorTree.updateDepthY).toBe(0);
      });

      test('should handle nested update cycles', () => {
        // Start nested X update cycles
        globalAnchorTree.startUpdateCycle('x', 1);
        globalAnchorTree.startUpdateCycle('x', 1);

        expect(globalAnchorTree.updateDepthX).toBe(2);
        expect(globalAnchorTree.starterObjectX).toBe(1);

        // End one level
        globalAnchorTree.endUpdateCycle('x');
        expect(globalAnchorTree.updateInProgressX).toBe(true);
        expect(globalAnchorTree.updateDepthX).toBe(1);

        // End final level
        globalAnchorTree.endUpdateCycle('x');
        expect(globalAnchorTree.updateInProgressX).toBe(false);
        expect(globalAnchorTree.updateDepthX).toBe(0);
      });

      test('should handle ending non-existent update cycles safely', () => {
        // Try to end cycles that haven't started
        globalAnchorTree.endUpdateCycle('x');
        globalAnchorTree.endUpdateCycle('y');

        expect(globalAnchorTree.updateDepthX).toBe(0);
        expect(globalAnchorTree.updateDepthY).toBe(0);
        expect(globalAnchorTree.updateInProgressX).toBe(false);
        expect(globalAnchorTree.updateInProgressY).toBe(false);
      });

      test('should identify update starter correctly', () => {
        globalAnchorTree.startUpdateCycle('x', 1);
        globalAnchorTree.startUpdateCycle('y', 2);

        expect(globalAnchorTree.isUpdateStarter('x', 1)).toBe(true);
        expect(globalAnchorTree.isUpdateStarter('x', 2)).toBe(false);
        expect(globalAnchorTree.isUpdateStarter('y', 2)).toBe(true);
        expect(globalAnchorTree.isUpdateStarter('y', 1)).toBe(false);
      });
    });

    describe('Node Management', () => {
      test('should add nodes to the tree correctly', () => {
        globalAnchorTree.addNode('x', mockShape2, mockShape1);

        expect(globalAnchorTree.xTree[1]).toBeDefined();
        expect(globalAnchorTree.xTree[2]).toBeDefined();
        expect(globalAnchorTree.xTree[2].parents).toContain(1);
        expect(globalAnchorTree.xTree[1].children).toContain(2);
      });

      test('should remove nodes from the tree correctly', () => {
        // Add nodes first
        globalAnchorTree.addNode('x', mockShape2, mockShape1);
        globalAnchorTree.addNode('y', mockShape2, mockShape1);

        // Remove node
        globalAnchorTree.removeNode('x', 2);

        expect(globalAnchorTree.xTree[2]).toBeUndefined();
        expect(globalAnchorTree.xTree[1].children).not.toContain(2);
        // Y tree should remain unaffected
        expect(globalAnchorTree.yTree[2]).toBeDefined();
      });

      test('should handle removing non-existent nodes safely', () => {
        expect(() => {
          globalAnchorTree.removeNode('x', 999);
        }).not.toThrow();
      });

      test('should prevent duplicate parent-child relationships', () => {
        globalAnchorTree.addNode('x', mockShape2, mockShape1);
        globalAnchorTree.addNode('x', mockShape2, mockShape1); // Add same relationship again

        expect(globalAnchorTree.xTree[2].parents.length).toBe(1);
        expect(globalAnchorTree.xTree[1].children.length).toBe(1);
      });
    });

    describe('Chain Finding and Traversal', () => {
      test('should find upward chain correctly', () => {
        // Create fresh shapes for this specific test
        const testShape1 = createMockShape(1);
        const testShape2 = createMockShape(2);
        const testShape3 = createMockShape(3);

        // Set up the chain relationships
        testShape3.lockXToPolygon = { TargetObject: testShape2 };
        testShape2.lockXToPolygon = { TargetObject: testShape1 };

        globalAnchorTree.addNode('x', testShape3, testShape2);
        globalAnchorTree.addNode('x', testShape2, testShape1);

        const chain = globalAnchorTree.findUpwardChain('x', 3);

        expect(chain.length).toBe(3);
        expect(chain[0].id).toBe(3);
        expect(chain[0].parentId).toBe(2);
        expect(chain[1].id).toBe(2);
        expect(chain[1].parentId).toBe(1);
        expect(chain[2].id).toBe(1);
        expect(chain[2].parentId).toBe(-1);
      });

      test('should handle chains with no parents', () => {
        globalAnchorTree.addNode('x', mockShape1, { canvasID: 999, lockXToPolygon: {} });

        const chain = globalAnchorTree.findUpwardChain('x', 1);

        expect(chain.length).toBe(1);
        expect(chain[0].parentId).toBe(-1);
      }); test('should detect and handle circular references safely', () => {
        // Create fresh shapes for this specific test
        const testShape1 = createMockShape(1);
        const testShape2 = createMockShape(2);

        // Create circular reference scenario
        testShape1.lockXToPolygon = { TargetObject: testShape2 };
        testShape2.lockXToPolygon = { TargetObject: testShape1 };

        globalAnchorTree.addNode('x', testShape1, testShape2);
        globalAnchorTree.addNode('x', testShape2, testShape1);

        const chain = globalAnchorTree.findUpwardChain('x', 1);

        // Should handle circular reference gracefully
        expect(chain.length).toBeGreaterThan(0);
      });
    });

    describe('Update Order Calculation', () => {
      test('should calculate correct update order', () => {
        // Create dependency chain: shape1 -> shape2
        globalAnchorTree.addNode('x', mockShape2, mockShape1);

        const updateOrder = globalAnchorTree.getUpdateOrder('x', 1);

        expect(updateOrder.length).toBe(2);
        expect(updateOrder[0]).toBe(mockShape1); // Starting object first
        expect(updateOrder[1]).toBe(mockShape2); // Dependent object second
      });

      test('should handle objects not in tree', () => {
        const updateOrder = globalAnchorTree.getUpdateOrder('x', 999);

        expect(updateOrder).toEqual([]);
      }); test('should handle complex dependency chains', () => {
        // Create fresh shapes for this specific test
        const testShape1 = createMockShape(1);
        const testShape2 = createMockShape(2);
        const testShape3 = createMockShape(3);

        globalAnchorTree.addNode('x', testShape2, testShape1);
        globalAnchorTree.addNode('x', testShape3, testShape2);

        const updateOrder = globalAnchorTree.getUpdateOrder('x', 1);

        expect(updateOrder.length).toBe(3);
        expect(updateOrder[0]).toBe(testShape1);
        expect(updateOrder).toContain(testShape2);
        expect(updateOrder).toContain(testShape3);
      });
    });

    describe('Circular Dependency Detection', () => {
      test('should detect circular dependencies', () => {
        // Add shape2 -> shape1 relationship first
        globalAnchorTree.addNode('x', mockShape2, mockShape1);

        // Try to add shape1 -> shape2 (would create circle)
        const hasCircle = globalAnchorTree.hasCircularDependency('x', 1, 2);

        expect(hasCircle).toBe(true);
      });

      test('should allow non-circular dependencies', () => {
        const hasCircle = globalAnchorTree.hasCircularDependency('x', 2, 1);

        expect(hasCircle).toBe(false);
      });

      test('should handle non-existent objects', () => {
        const hasCircle = globalAnchorTree.hasCircularDependency('x', 999, 1000);

        expect(hasCircle).toBe(false);
      });
    });

    describe('Lock and Focus Management', () => {
      test('should update lock and focus correctly', () => {
        const testShape = createMockShape(1);
        testShape.lockXToPolygon = { TargetObject: createMockShape(2) };

        globalAnchorTree.updateLockAndFocus(testShape);

        expect(testShape.lockMovementX).toBe(true);
        expect(testShape.lockMovementY).toBe(false);
        expect(testShape.enterFocusMode).toHaveBeenCalled();
      }); test('should exit focus mode when no locks exist', () => {
        const testShape = createMockShape(1);
        testShape.lockXToPolygon = {};
        testShape.lockYToPolygon = {};

        globalAnchorTree.updateLockAndFocus(testShape);

        expect(testShape.lockMovementX).toBe(false);
        expect(testShape.lockMovementY).toBe(false);
        expect(testShape.exitFocusMode).toHaveBeenCalled();
      });

      test('should handle null objects safely', () => {
        expect(() => {
          globalAnchorTree.updateLockAndFocus(null);
        }).not.toThrow();
      });
    });

    describe('Root Object Identification', () => {
      test('should identify root objects correctly', () => {
        globalAnchorTree.addNode('x', mockShape2, mockShape1);

        const roots = globalAnchorTree.getRoots('x');

        expect(roots).toContain(mockShape1);
        expect(roots).not.toContain(mockShape2);
      });

      test('should return empty array when no objects exist', () => {
        const roots = globalAnchorTree.getRoots('x');

        expect(roots).toEqual([]);
      });
    });

    describe('Pending Updates', () => {
      test('should get pending updates correctly', () => {
        globalAnchorTree.addNode('x', mockShape2, mockShape1);
        globalAnchorTree.startUpdateCycle('x', 1);

        const pending = globalAnchorTree.getPendingUpdates('x', 1);

        expect(pending).toContain(mockShape1);
        expect(pending).toContain(mockShape2);
      });

      test('should return empty array for non-existent objects', () => {
        const pending = globalAnchorTree.getPendingUpdates('x', 999);

        expect(pending).toEqual([]);
      });
    }); describe('Delete Handling', () => {
      test('should handle object deletion and ID remapping', () => {
        globalAnchorTree.addNode('x', mockShape2, mockShape1);

        // Verify initial state
        expect(globalAnchorTree.xTree[1]).toBeDefined();
        expect(globalAnchorTree.xTree[2]).toBeDefined();

        // Simulate deleting object with ID 1, causing ID 2 to become ID 1
        const newIdMapping = { 2: 1 };
        globalAnchorTree.updateOnDelete(1, newIdMapping);

        // After deletion and remapping, old ID 1 should be gone and ID 2 should become ID 1
        expect(globalAnchorTree.xTree[2]).toBeUndefined();
        expect(globalAnchorTree.xTree[1]).toBeDefined();
      });
    });
  });
  describe('processUpdateCycle Function', () => {
    test('should process update cycle correctly', () => {
      const updateOrder = [mockShape1, mockShape2];
      const initialLeft = mockShape2.left;

      processUpdateCycle('x', mockShape1, updateOrder, 10, []);

      expect(mockShape2.set).toHaveBeenCalledWith({ left: initialLeft + 10 });
      expect(mockShape2.setCoords).toHaveBeenCalled();
      expect(mockShape2.updateAllCoord).toHaveBeenCalled();
    });

    test('should handle empty update order', () => {
      expect(() => {
        processUpdateCycle('x', mockShape1, [], 10, []);
      }).not.toThrow();
    });

    test('should handle invalid delta', () => {
      const updateOrder = [mockShape1, mockShape2];

      expect(() => {
        processUpdateCycle('x', mockShape1, updateOrder, NaN, []);
      }).not.toThrow();
    });

    test('should skip already updated objects', () => {
      globalAnchorTree.startUpdateCycle('x', 1);
      globalAnchorTree.updatedObjectsX.add(2);

      const updateOrder = [mockShape1, mockShape2];

      processUpdateCycle('x', mockShape1, updateOrder, 10, []);

      // mockShape2 should not be updated as it's already in the updated set
      expect(mockShape2.set).not.toHaveBeenCalled();
    });
  }); describe('anchorShape Function', () => {
    beforeEach(() => {
      // Reset mock calls, but don't set default implementations
      jest.clearAllMocks();
    }); test('should create anchor between two shapes', async () => {
      // Setup showTextBox mock to return default values
      showTextBox
        .mockResolvedValueOnce('E1') // vertexIndex1
        .mockResolvedValueOnce('E2') // vertexIndex2
        .mockResolvedValueOnce('10') // spacingX
        .mockResolvedValueOnce('5');  // spacingY

      await anchorShape(mockShape1, mockShape2);

      expect(mockShape2.lockXToPolygon).toBeDefined();
      expect(mockShape2.lockXToPolygon.TargetObject).toBe(mockShape1);
      expect(mockShape2.lockYToPolygon).toBeDefined();
      expect(mockShape2.lockYToPolygon.TargetObject).toBe(mockShape1);
      expect(mockShape2.set).toHaveBeenCalled();
      expect(mockShape2.setCoords).toHaveBeenCalled();
    });

    test('should handle arrays of shapes', async () => {
      // Setup showTextBox mock to return default values
      showTextBox
        .mockResolvedValueOnce('E1') // vertexIndex1
        .mockResolvedValueOnce('E2') // vertexIndex2
        .mockResolvedValueOnce('10') // spacingX
        .mockResolvedValueOnce('5');  // spacingY

      await anchorShape([mockShape1], [mockShape2]);

      expect(mockShape2.lockXToPolygon.TargetObject).toBe(mockShape1);
    }); test('should use provided options instead of prompts', async () => {
      const options = {
        vertexIndex1: 'E1',
        vertexIndex2: 'E2',
        spacingX: 15,
        spacingY: 20
      };

      await anchorShape(mockShape1, mockShape2, options);

      expect(showTextBox).not.toHaveBeenCalled();
      expect(mockShape2.lockXToPolygon.spacing).toBe(15);
      expect(mockShape2.lockYToPolygon.spacing).toBe(20);
    }); test('should skip X axis when already anchored', async () => {
      const testShape1 = createMockShape(1);
      const testShape2 = createMockShape(2);
      testShape2.lockXToPolygon = { TargetObject: testShape1 };

      showTextBox
        .mockResolvedValueOnce('E1') // vertexIndex1
        .mockResolvedValueOnce('E2') // vertexIndex2        .mockResolvedValueOnce('') // spacingX (empty, should skip)
        .mockResolvedValueOnce('5'); // spacingY

      await anchorShape(testShape1, testShape2);

      expect(testShape2.lockYToPolygon.TargetObject).toBe(testShape1);
    });
    test('should skip Y axis when already anchored', async () => {
      const testShape1 = createMockShape(1);
      const testShape2 = createMockShape(2);
      testShape2.lockYToPolygon = { TargetObject: testShape1 };

      showTextBox
        .mockResolvedValueOnce('E1') // vertexIndex1
        .mockResolvedValueOnce('E2') // vertexIndex2
        .mockResolvedValueOnce('10') // spacingX
        .mockResolvedValueOnce(''); // spacingY (empty, should skip)

      await anchorShape(testShape1, testShape2);

      expect(testShape2.lockXToPolygon.TargetObject).toBe(testShape1);
      expect(testShape2.lockXToPolygon.spacing).toBe(10);
    });

    test('should prevent circular dependencies', async () => {
      // Create fresh shapes for this specific test
      const testShape1 = createMockShape(1);
      const testShape2 = createMockShape(2);

      // Test the circular dependency detection directly first
      globalAnchorTree.xTree = {};
      globalAnchorTree.yTree = {};

      // Add testShape1 as child of testShape2 in X tree (testShape1 -> testShape2)
      globalAnchorTree.addNode('x', testShape1, testShape2);

      // Test: would adding testShape2 as child of testShape1 create a cycle?
      // This should return true because: testShape2 -> testShape1 -> testShape2 (cycle)
      const hasCycle = globalAnchorTree.hasCircularDependency('x', testShape2.canvasID, testShape1.canvasID);

      // If the direct test fails, the issue is in the circular dependency logic
      expect(hasCycle).toBe(true);

    });


    test('should return early when user cancels vertex input', async () => {
      // Mock showTextBox to return null for cancellation
      showTextBox.mockResolvedValueOnce(null);
      const testShape1 = createMockShape(1);
      const testShape2 = createMockShape(2);
      const result = await anchorShape(testShape1, testShape2);

      expect(result).toBeUndefined();
    });

    test('should return early when user cancels spacing input', async () => {
      // Mock showTextBox to return valid vertices but null for spacing
      const testShape1 = createMockShape(1);
      const testShape2 = createMockShape(2);
      showTextBox
        .mockResolvedValueOnce('E1') // vertexIndex1
        .mockResolvedValueOnce('E2') // vertexIndex2  
        .mockResolvedValueOnce(null); // User cancels spacingX

      const result = await anchorShape(testShape1, testShape2);

      expect(result).toBeUndefined();
    });

    describe('Error Handling and Edge Cases', () => {
      test('should handle missing object properties gracefully', () => {
        const incompleteShape = { canvasID: 999 };

        expect(() => {
          globalAnchorTree.addNode('x', incompleteShape, mockShape1);
        }).not.toThrow();
      });
    });

    test('should handle update cycle without starter ID', () => {
      console.warn = jest.fn();

      globalAnchorTree.startUpdateCycle('x', null);

      expect(console.warn).toHaveBeenCalledWith('No starter ID provided to startUpdateCycle');
    });

    test('should handle circular reference detection in findUpwardChain', () => {
      const testShape1 = createMockShape(1);
      const testShape2 = createMockShape(2);
      console.warn = jest.fn();

      // Create a simple cycle
      testShape1.lockXToPolygon = { TargetObject: testShape2 };
      testShape2.lockXToPolygon = { TargetObject: testShape1 };

      globalAnchorTree.addNode('x', testShape1, testShape2);
      globalAnchorTree.addNode('x', testShape2, testShape1);

      const chain = globalAnchorTree.findUpwardChain('x', 1);

      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Cycle detected'));
      expect(chain).toBeDefined();
    });

    test('should handle reverseAnchorChain with missing objects', () => {
      console.warn = jest.fn();

      globalAnchorTree.reverseAnchorChain('x', 999);

      expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('not found in x tree'));
    });

    /*
    describe('Integration Tests', () => {
      
      test('should handle complete anchor workflow', async () => {
        globalAnchorTree.startUpdateCycle('x', null);
        // Create anchor
        const testShape1 = createMockShape(1);
        const testShape2 = createMockShape(2);
        await anchorShape(testShape1, testShape2);

        // Verify tree structure
        //expect(globalAnchorTree.xTree[2]).toBeDefined();
        //expect(globalAnchorTree.yTree[2]).toBeDefined();

        // Verify object relationships
        //expect(testShape1.anchoredPolygon).toContain(testShape2);
        expect(testShape2.lockMovementX).toBe(true);
        expect(testShape2.lockMovementY).toBe(true);

        // Verify canvas updates
        expect(CanvasGlobals.canvas.bringObjectToFront).toHaveBeenCalledWith(testShape1);
        expect(CanvasGlobals.canvas.renderAll).toHaveBeenCalled();
      });
      
      test('should handle complex multi-object anchor chains', async () => {
        const testShape1 = createMockShape(1);
        const testShape2 = createMockShape(2);
        const testShape3 = createMockShape(3);

        // Create chain: shape1 -> shape2 -> shape3
        await anchorShape(testShape1, testShape2);
        await anchorShape(testShape2, testShape3);

        const updateOrder = globalAnchorTree.getUpdateOrder('x', 1);

        expect(updateOrder.length).toBe(3);
        expect(updateOrder).toContain(testShape1);
        expect(updateOrder).toContain(testShape2);
        expect(updateOrder).toContain(testShape3);
      });
    });
    */
    
  });

});