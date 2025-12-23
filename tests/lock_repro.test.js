
// Mock fabric first
const mockFabricObject = {
  on: jest.fn(),
  set: jest.fn()
};

global.fabric = {
  Line: jest.fn(() => mockFabricObject),
  Text: jest.fn(() => mockFabricObject),
  Polygon: jest.fn(() => mockFabricObject),
  Group: class {} // Mock Group for BaseGroup to extend if needed
};

// Mock dependencies BEFORE imports
jest.mock('../js/canvas/Tracker.js', () => ({
  canvasTracker: { track: jest.fn() }
}));

jest.mock('../js/canvas/canvas.js', () => ({
  CanvasGlobals: {
    canvas: {
      getZoom: jest.fn(() => 1),
      remove: jest.fn(),
      scheduleRender: jest.fn()
    },
    scheduleRender: jest.fn()
  }
}));

jest.mock('../js/sidebar/sbGeneral.js', () => ({
  GeneralSettings: {
    formatDimension: jest.fn(() => "100")
  }
}));

jest.mock('../js/canvas/keyboardEvents.js', () => ({
  ShowHideSideBarEvent: jest.fn()
}));

jest.mock('../js/canvas/promptBox.js', () => ({
  showTextBox: jest.fn(),
  hideTextBox: jest.fn(),
  selectObjectHandler: jest.fn()
}));

import { globalAnchorTree } from '../js/objects/anchor.js';
import { LockIcon } from '../js/objects/lock.js';

describe('LockIcon onClick fix', () => {
  let parentObj, childObj, grandchildObj;

  beforeEach(() => {
    // Reset globalAnchorTree
    globalAnchorTree.xTree = {};
    globalAnchorTree.yTree = {};

    // Create mock objects
    parentObj = {
      canvasID: 1,
      getBasePolygonVertex: jest.fn(() => ({ x: 0, y: 0 })),
      anchoredPolygon: [],
      lockXToPolygon: {},
      lockYToPolygon: {},
      anchorageLink: []
    };
    childObj = {
      canvasID: 2,
      getBasePolygonVertex: jest.fn(() => ({ x: 10, y: 0 })),
      anchoredPolygon: [],
      lockXToPolygon: {},
      lockYToPolygon: {},
      xHeight: 10,
      focusMode: false,
      enterFocusMode: jest.fn(),
      exitFocusMode: jest.fn(),
      anchorageLink: []
    };
    grandchildObj = {
      canvasID: 3,
      getBasePolygonVertex: jest.fn(() => ({ x: 20, y: 0 })),
      anchoredPolygon: [],
      lockXToPolygon: {},
      lockYToPolygon: {},
      anchorageLink: []
    };
  });

  test('should preserve node in tree if it has children when unlocking', () => {
    // Setup tree: Parent -> Child -> Grandchild (X direction)
    globalAnchorTree.addNode('x', childObj, parentObj); // Child depends on Parent
    globalAnchorTree.addNode('x', grandchildObj, childObj); // Grandchild depends on Child

    // Verify setup
    expect(globalAnchorTree.xTree[2]).toBeDefined();
    expect(globalAnchorTree.xTree[2].parents).toContain(1);
    expect(globalAnchorTree.xTree[2].children).toContain(3);

    // Setup LockIcon for Child -> Parent lock
    const lockParam = {
      sourceObject: childObj,
      TargetObject: parentObj,
      sourcePoint: 'E1',
      targetPoint: 'E2'
    };
    childObj.lockXToPolygon = { TargetObject: parentObj };
    
    const lockIcon = new LockIcon(childObj, lockParam, 'x');
    // Add lockIcon to anchorageLink as it would be in real app
    childObj.anchorageLink.push(lockIcon);
    
    // Trigger onClick
    lockIcon.onClick();

    // Verify:
    // 1. Node 2 (child) should still exist in tree because it has a child (3)
    expect(globalAnchorTree.xTree[2]).toBeDefined();
    
    // 2. Node 2 should NOT have Node 1 as parent anymore
    expect(globalAnchorTree.xTree[2].parents).not.toContain(1);
    
    // 3. Node 1 should NOT have Node 2 as child anymore
    expect(globalAnchorTree.xTree[1].children).not.toContain(2);
    
    // 4. Node 2 should still have Node 3 as child
    expect(globalAnchorTree.xTree[2].children).toContain(3);
  });

  test('should remove node from tree if it has NO children when unlocking', () => {
    // Setup tree: Parent -> Child (X direction)
    globalAnchorTree.addNode('x', childObj, parentObj);

    // Verify setup
    expect(globalAnchorTree.xTree[2]).toBeDefined();

    // Setup LockIcon for Child -> Parent lock
    const lockParam = {
      sourceObject: childObj,
      TargetObject: parentObj,
      sourcePoint: 'E1',
      targetPoint: 'E2'
    };
    childObj.lockXToPolygon = { TargetObject: parentObj };
    
    const lockIcon = new LockIcon(childObj, lockParam, 'x');
    childObj.anchorageLink.push(lockIcon);
    
    // Trigger onClick
    lockIcon.onClick();

    // Verify:
    // 1. Node 2 (child) should be removed from tree
    expect(globalAnchorTree.xTree[2]).toBeUndefined();
    
    // 2. Node 1 should NOT have Node 2 as child
    expect(globalAnchorTree.xTree[1].children).not.toContain(2);
  });
});
