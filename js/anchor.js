//TODO: check updateAllCoord for anchor object inside border / divider not working
// AnchorTree class to manage anchoring relationships between objects
class AnchorTree {
  constructor() {
    this.xTree = {}; // Object to store X-axis anchor relationships
    this.yTree = {}; // Object to store Y-axis anchor relationships
    this.updateInProgress = false; // Flag to track if an update cycle is in progress
    this.updatedObjects = new Set(); // Track objects that have been updated in the current cycle
  }

  // Start a new update cycle
  startUpdateCycle() {
    this.updateInProgress = true;
    this.updatedObjects.clear();
  }

  // End the current update cycle
  endUpdateCycle() {
    this.updateInProgress = false;
    this.updatedObjects.clear();
  }

  // Add a node to the tree (either X or Y direction)
  addNode(direction, sourceObj, targetObj) {
    const tree = direction === 'x' ? this.xTree : this.yTree;
    
    // Create entries for both objects if they don't exist
    if (!tree[sourceObj.canvasID]) {
      tree[sourceObj.canvasID] = {
        object: sourceObj,
        parents: [],
        children: []
      };
    }
    
    if (!tree[targetObj.canvasID]) {
      tree[targetObj.canvasID] = {
        object: targetObj,
        parents: [],
        children: []
      };
    }
    
    // Add parent-child relationship
    if (!tree[sourceObj.canvasID].parents.includes(targetObj.canvasID)) {
      tree[sourceObj.canvasID].parents.push(targetObj.canvasID);
    }
    
    if (!tree[targetObj.canvasID].children.includes(sourceObj.canvasID)) {
      tree[targetObj.canvasID].children.push(sourceObj.canvasID);
    }
  }
  
  // Remove a node from the tree (either X or Y direction)
  removeNode(direction, objId) {
    const tree = direction === 'x' ? this.xTree : this.yTree;
    
    if (!tree[objId]) return;
    
    // Remove this node from all its parents' children lists
    for (const parentId of tree[objId].parents) {
      if (tree[parentId]) {
        tree[parentId].children = tree[parentId].children.filter(id => id !== objId);
      }
    }
    
    // Remove this node from all its children's parent lists
    for (const childId of tree[objId].children) {
      if (tree[childId]) {
        tree[childId].parents = tree[childId].parents.filter(id => id !== objId);
      }
    }
    
    // Delete the node
    delete tree[objId];
  }
  
  // Get all affected objects (in proper update order) when an object is moved
  getUpdateOrder(direction, startObjId) {
    const tree = direction === 'x' ? this.xTree : this.yTree;
    const visited = new Set();
    const updateOrder = [];
    
    // Skip if object isn't in the tree
    if (!tree[startObjId]) return updateOrder;
    
    // Helper function for depth-first traversal
    const visit = (nodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      // First process all children (dependencies)
      for (const childId of (tree[nodeId]?.children || [])) {
        visit(childId);
      }
      
      // Add this node to the update order
      updateOrder.push(nodeId);
    };
    
    // Start traversal from the given object
    visit(startObjId);
    
    // Return the objects in update order (children first, then parents)
    return updateOrder.map(id => tree[id].object);
  }
  
  // Check for circular dependencies
  hasCircularDependency(direction, sourceId, targetId) {
    const tree = direction === 'x' ? this.xTree : this.yTree;
    
    // If either object is not in the tree, there's no circular dependency
    if (!tree[sourceId] || !tree[targetId]) return false;
    
    // Check if adding this edge would create a cycle
    const visited = new Set();
    
    // Helper function for cycle detection
    const hasCycle = (currentId) => {
      if (currentId === sourceId) return true; // Found a cycle
      if (visited.has(currentId)) return false;
      
      visited.add(currentId);
      
      // Check all parents
      for (const parentId of tree[currentId].parents) {
        if (hasCycle(parentId)) return true;
      }
      
      return false;
    };
    
    // Start from the target and see if we can reach the source
    return hasCycle(targetId);
  }
  
  // Get pending updates for an object (nodes that would be affected by moving this object)
  getPendingUpdates(direction, objId) {
    const tree = direction === 'x' ? this.xTree : this.yTree;
    
    // If the object isn't in the tree, there are no pending updates
    if (!tree[objId]) return [];
    
    const visited = new Set();
    const pendingUpdates = [];
    
    // Helper function to recursively collect all child nodes that haven't been updated yet
    const collectPendingUpdates = (nodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);
      
      // If this node hasn't been updated yet in the current cycle, add it to pending updates
      if (this.updateInProgress && !this.updatedObjects.has(nodeId)) {
        // Get the actual object reference from the node
        const obj = tree[nodeId].object;
        pendingUpdates.push(obj);
      }
      
      // Process all children recursively
      for (const childId of (tree[nodeId]?.children || [])) {
        collectPendingUpdates(childId);
      }
    };
    
    // Start collecting from the given object
    collectPendingUpdates(objId);
    
    return pendingUpdates;
  }

  // Get the root objects (objects with no parents)
  getRoots(direction) {
    const tree = direction === 'x' ? this.xTree : this.yTree;
    return Object.entries(tree)
      .filter(([_, node]) => node.parents.length === 0)
      .map(([_, node]) => node.object);
  }
}

// Create a global instance of the AnchorTree
const globalAnchorTree = new AnchorTree();

document.getElementById('set-anchor').addEventListener('click', function () {
    if (selectedArrow) {
      this.parentElement.parentElement.style.display = 'none';
      // Implement vertex selection logic here
      const shape1 = selectedArrow
      selectedArrow = null
      document.removeEventListener('keydown', ShowHideSideBarEvent);
      selectObjectHandler('Select shape to anchor to', anchorShape, shape1)
      //renumberVertexLabels(shape1); // Renumber vertex labels after selection
    }
  });
  
  async function anchorShape(inputShape1, inputShape2, options = {}, sourceList = []) {
  
    const shape1 = Array.isArray(inputShape1) ? inputShape1[0] : inputShape1
    const shape2 = Array.isArray(inputShape2) ? inputShape2[0] : inputShape2
    const xHeight = shape1.xHeight || shape2.xHeight || parseInt(document.getElementById("input-xHeight").value)
  
    const vertexIndex1 = options.vertexIndex1 ? options.vertexIndex1 : await showTextBox('Enter vertex index for First Polygon:', 'E1')
    if (!vertexIndex1) { setInterval(document.addEventListener('keydown', ShowHideSideBarEvent), 1000); return }
    const vertexIndex2 = options.vertexIndex2 ? options.vertexIndex2 : await showTextBox('Enter vertex index for Second Polygon:', 'E1')
    if (!vertexIndex2) { document.addEventListener('keydown', ShowHideSideBarEvent); return }
    
    // Check if object is already anchored in X axis
    const isAlreadyAnchoredInX = Object.keys(shape2.lockXToPolygon || {}).length > 0;
    const spacingX = options.spacingX != null ? options.spacingX : 
                     isAlreadyAnchoredInX ? '' : 
                     await showTextBox('Enter spacing in X \n (Leave empty if no need for axis):', 0, 'keydown', null, xHeight)
    if (spacingX == null) { document.addEventListener('keydown', ShowHideSideBarEvent); return }
    
    // Check if object is already anchored in Y axis
    const isAlreadyAnchoredInY = Object.keys(shape2.lockYToPolygon || {}).length > 0;
    const spacingY = options.spacingY != null ? options.spacingY : 
                     isAlreadyAnchoredInY ? '' : 
                     await showTextBox('Enter spacing in Y \n (Leave empty if no need for axis):', 0, 'keydown', null, xHeight)
    if (spacingY == null) { document.addEventListener('keydown', ShowHideSideBarEvent); return }
  
    const movingPoint = shape2.getBasePolygonVertex(vertexIndex1.toUpperCase())
    const targetPoint = shape1.getBasePolygonVertex(vertexIndex2.toUpperCase())
    
    // Track anchor operations - prepare tracking params
    const anchorTrackParams = {
      type: 'Anchor',
      source: {
        id: shape2.canvasID,
        functionalType: shape2.functionalType,
        vertex: vertexIndex1
      },
      target: {
        id: shape1.canvasID,
        functionalType: shape1.functionalType,
        vertex: vertexIndex2
      },
      spacingX: spacingX,
      spacingY: spacingY
    };

    // Add X axis anchoring
    if (!isNaN(parseInt(spacingX))) {
      // Check for circular dependencies before adding to X tree
      if (globalAnchorTree.hasCircularDependency('x', shape2.canvasID, shape1.canvasID)) {
        alert("Cannot create anchor: would create a circular dependency in X axis");
      } else {
        // Snap arrow 1 to arrow 2 with the specified spacing
        shape2.set({
          left: shape2.left + targetPoint.x - movingPoint.x + parseInt(spacingX),
          lockMovementX: true,
        });
        anchor = { sourcePoint: vertexIndex1, targetPoint: vertexIndex2, sourceObject: shape2, TargetObject: shape1, spacing: parseInt(spacingX) }
        shape2.lockXToPolygon = anchor

        // Add to the anchor tree
        globalAnchorTree.addNode('x', shape2, shape1);

        if (shape1.functionalType == 'Border'){
          if (shape1.widthObjects.includes(shape2)){
            shape1.widthObjects.splice(shape1.widthObjects.indexOf(shape2), 1)
          }
        }
      }
    } else if (spacingX.toUpperCase() == 'EQ') {
      selectObjectHandler('Select first shape to equal distance locking', function (shape3) {
        // Use selectObjectHandler to select the second shape
        selectObjectHandler('Select second shape to equal distance locking', async function (shape4) {
          // Pass the selected shapes to your remaining code
          const vertexIndex3 = await showTextBox('Enter vertex index for Polygon 3:', 'E1')
          if (vertexIndex3 === null) return;
          const vertexIndex4 = await showTextBox('Enter vertex index for Polygon 4:', 'E1')
          if (vertexIndex4 === null) return;
  
          anchor = { sourcePoint: vertexIndex1, targetPoint: vertexIndex2, sourceObject: shape2, TargetObject: shape1, secondSourcePoint: vertexIndex3, secondTargetPoint: vertexIndex4, secondSourceObject: shape3[0], secondTargetObject: shape4[0] }
          
          // Track equal-distance X anchoring
          const eqAnchorTrackParams = {
            type: 'EqualAnchor',
            axis: 'x',
            source1: {
              id: shape2.canvasID,
              functionalType: shape2.functionalType,
              vertex: vertexIndex1
            },
            target1: {
              id: shape1.canvasID,
              functionalType: shape1.functionalType,
              vertex: vertexIndex2
            },
            source2: {
              id: shape3[0].canvasID,
              functionalType: shape3[0].functionalType,
              vertex: vertexIndex3
            },
            target2: {
              id: shape4[0].canvasID,
              functionalType: shape4[0].functionalType,
              vertex: vertexIndex4
            }
          };
          
          // Track the equal anchoring operation in history
          if (canvasTracker) {
            canvasTracker.track('anchorObject', [eqAnchorTrackParams]);
          }
          
          EQanchorShape('x', anchor)
          shape2.lockXToPolygon = anchor
          shape3.lockXToPolygon = anchor

          // Add EQ relationships to the anchor tree
          globalAnchorTree.addNode('x', shape2, shape1);
          globalAnchorTree.addNode('x', shape3[0], shape4[0]);
        });
      });
    }

    // Add Y axis anchoring
    if (!isNaN(parseInt(spacingY))) {
      // Check for circular dependencies before adding to Y tree
      if (globalAnchorTree.hasCircularDependency('y', shape2.canvasID, shape1.canvasID)) {
        alert("Cannot create anchor: would create a circular dependency in Y axis");
      } else {
        // Snap arrow 1 to arrow 2 with the specified spacing
        shape2.set({
          top: shape2.top + targetPoint.y - movingPoint.y + parseInt(spacingY),
          lockMovementY: true,
        });
        const anchor = { sourcePoint: vertexIndex1, targetPoint: vertexIndex2, sourceObject: shape2, TargetObject: shape1, spacing: parseInt(spacingY) }
        shape2.lockYToPolygon = anchor

        // Add to the anchor tree
        globalAnchorTree.addNode('y', shape2, shape1);

        if (shape1.functionalType == 'Border'){
          if (shape1.heightObjects.includes(shape2)){
            shape1.heightObjects.splice(shape1.heightObjects.indexOf(shape2), 1)
          }
        }
      }
    } else if (spacingY.toUpperCase() == 'EQ') {
      selectObjectHandler('Select first shape to equal distance locking', function (shape3) {
        // Use selectObjectHandler to select the second shape
        selectObjectHandler('Select second shape to equal distance locking', async function (shape4) {
          // Pass the selected shapes to your remaining code
          const vertexIndex3 = await showTextBox('Enter vertex index for Polygon 3:', 'E1')
          if (vertexIndex3 === null) return;
          const vertexIndex4 = await showTextBox('Enter vertex index for Polygon 4:', 'E1')
          if (vertexIndex4 === null) return;
  
          const anchor = { sourcePoint: vertexIndex1, targetPoint: vertexIndex2, sourceObject: shape2, TargetObject: shape1, secondSourcePoint: vertexIndex3, secondTargetPoint: vertexIndex4, secondSourceObject: shape3[0], secondTargetObject: shape4[0] }
          
          // Track equal-distance Y anchoring
          const eqAnchorTrackParams = {
            type: 'EqualAnchor',
            axis: 'y',
            source1: {
              id: shape2.canvasID,
              functionalType: shape2.functionalType,
              vertex: vertexIndex1
            },
            target1: {
              id: shape1.canvasID,
              functionalType: shape1.functionalType,
              vertex: vertexIndex2
            },
            source2: {
              id: shape3[0].canvasID,
              functionalType: shape3[0].functionalType,
              vertex: vertexIndex3
            },
            target2: {
              id: shape4[0].canvasID,
              functionalType: shape4[0].functionalType,
              vertex: vertexIndex4
            }
          };
          
          // Track the equal anchoring operation in history
          if (canvasTracker) {
            canvasTracker.track('anchorObject', [eqAnchorTrackParams]);
          }
          
          EQanchorShape('y', anchor)
          shape2.lockYToPolygon = anchor
          shape3.lockYToPolygon = anchor

          // Add EQ relationships to the anchor tree
          globalAnchorTree.addNode('y', shape2, shape1);
          globalAnchorTree.addNode('y', shape3[0], shape4[0]);
        });
      });
    }

    // Use the AnchorTree to get the proper update order for anchors
    const updateOrderX = globalAnchorTree.getUpdateOrder('x', shape2.canvasID);
    const updateOrderY = globalAnchorTree.getUpdateOrder('y', shape2.canvasID);
    
    // Combine and deduplicate the update orders
    const combinedUpdateOrder = [...new Set([...updateOrderX, ...updateOrderY])];
    
    // Update coordinates in the proper order
    if (combinedUpdateOrder.length > 0) {
      combinedUpdateOrder.forEach(obj => {
        if (!sourceList.includes(obj)) {
          obj.updateAllCoord(null, sourceList);
        }
      });
    } else if (!sourceList.includes(shape2)) {
      shape2.updateAllCoord(null, sourceList);
    }
  
    if (!shape1.anchoredPolygon.includes(shape2)) {
      shape1.anchoredPolygon.push(shape2)
    }
  
    if (!shape1.borderType) {
      canvas.bringObjectToFront(shape1)
    }

    // Set focus mode to anchored object if applicable
    if (shape2.lockMovementX && shape2.lockMovementY) {
      shape2.enterFocusMode();
    }
  
    document.addEventListener('keydown', ShowHideSideBarEvent);
  
    canvas.renderAll();
    
    // Track the regular anchoring operation in history
    // Only track if both X and Y aren't "EQ" (those are tracked separately)
    if (canvasTracker && !(spacingX.toString().toUpperCase() === 'EQ' && spacingY.toString().toUpperCase() === 'EQ')) {
      canvasTracker.track('anchorObject', [anchorTrackParams]);
    }
    
    // Return a resolved promise to allow for chaining
    return Promise.resolve();
  }
  
  function EQanchorShape(direction, options, sourceList = []) {
    const [shape1, shape2, shape3, shape4] = [options.TargetObject, options.sourceObject, options.secondSourceObject, options.secondTargetObject]
    const [vertexIndex1, vertexIndex2, vertexIndex3, vertexIndex4] = [options.sourcePoint, options.targetPoint, options.secondSourcePoint, options.secondTargetPoint]
    const movingPoint = shape2.getBasePolygonVertex(vertexIndex1.toUpperCase())
    const targetPoint = shape1.getBasePolygonVertex(vertexIndex2.toUpperCase())
    const secondMovingPoint = shape3.getBasePolygonVertex(vertexIndex3.toUpperCase())
    const secondTargetPoint = shape4.getBasePolygonVertex(vertexIndex4.toUpperCase())
  
    if (direction == 'x') {
      const totalFloat = (movingPoint.x - targetPoint.x) + (secondTargetPoint.x - secondMovingPoint.x)
      anchorShape(shape1, shape2, {
        vertexIndex1: vertexIndex1,
        vertexIndex2: vertexIndex2,
        spacingX: totalFloat / 2,
        spacingY: ''
      }, sourceList)
      anchorShape(shape4, shape3, {
        vertexIndex1: vertexIndex4,
        vertexIndex2: vertexIndex3,
        spacingX: -totalFloat / 2,
        spacingY: ''
      }, sourceList)
      shape2.lockXToPolygon = options
      shape3.lockXToPolygon = options
    } else {
      const totalFloat = (movingPoint.y - targetPoint.y) + (secondTargetPoint.y - secondMovingPoint.y)
      anchorShape(shape1, shape2, {
        vertexIndex1: vertexIndex1,
        vertexIndex2: vertexIndex2,
        spacingX: '',
        spacingY: totalFloat / 2,
      }, sourceList)
      anchorShape(shape4, shape3, {
        vertexIndex1: vertexIndex4,
        vertexIndex2: vertexIndex3,
        spacingX: '',
        spacingY: -totalFloat / 2,
      }, sourceList)
      shape2.lockYToPolygon = options
      shape3.lockYToPolygon = options
  
      // Use the AnchorTree to get the proper update order
      const updateOrderY = globalAnchorTree.getUpdateOrder('y', shape2.canvasID)
        .concat(globalAnchorTree.getUpdateOrder('y', shape3.canvasID));
      
      // Update in proper order
      updateOrderY.forEach(obj => {
        if (!sourceList.includes(obj)) {
          obj.updateAllCoord(null, sourceList);
        }
      });
    }
  }
