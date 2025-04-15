//TODO: check updateAllCoord for anchor object inside border / divider not working
// AnchorTree class to manage anchoring relationships between objects
class AnchorTree {
  constructor() {
    this.xTree = {}; // Object to store X-axis anchor relationships
    this.yTree = {}; // Object to store Y-axis anchor relationships
    this.updateInProgressX = false; // Flag to track if an X-axis update cycle is in progress
    this.updateInProgressY = false; // Flag to track if a Y-axis update cycle is in progress
    this.updatedObjectsX = new Set(); // Track objects that have been updated in X-axis
    this.updatedObjectsY = new Set(); // Track objects that have been updated in Y-axis
    this.starterObjectX = null; // Track which object started the X update chain
    this.starterObjectY = null; // Track which object started the Y update chain
    this.updateDepthX = 0; // Track nesting level of X updates
    this.updateDepthY = 0; // Track nesting level of Y updates
  }

  // Start a new update cycle for a specific direction
  startUpdateCycle(direction, starterId) {
    if (starterId === null) {
      console.warn("No starter ID provided to startUpdateCycle");
    }

    if (direction === 'x') {
      // Only set the starter object if this is the first level of the update
      if (!this.updateInProgressX) {
        this.starterObjectX = starterId;
        this.updatedObjectsX.clear();
      }
      this.updateInProgressX = true;
      this.updateDepthX++;
    } else {
      // Only set the starter object if this is the first level of the update
      if (!this.updateInProgressY) {
        this.starterObjectY = starterId;
        this.updatedObjectsY.clear();
      }
      this.updateInProgressY = true;
      this.updateDepthY++;
    }
  }

  // Check if the object is the starter of the current update chain
  isUpdateStarter(direction, objectId) {
    if (direction === 'x') {
      return this.starterObjectX === objectId;
    } else {
      return this.starterObjectY === objectId;
    }
  }

  // End the current update cycle for a specific direction
  endUpdateCycle(direction) {
    if (direction === 'x') {
      // Add safety check to prevent negative depth
      if (this.updateDepthX <= 0) {
        console.warn("Attempted to end X update cycle when none is in progress");
        this.updateDepthX = 0;
        this.updateInProgressX = false;
        this.updatedObjectsX.clear();
        this.starterObjectX = null;
        return;
      }

      this.updateDepthX--;
      // Only fully end the cycle when we're back at the top level
      if (this.updateDepthX === 0) {
        this.updateInProgressX = false;
        this.updatedObjectsX.clear();
        this.starterObjectX = null;
      }
    } else {
      // Add safety check to prevent negative depth
      if (this.updateDepthY <= 0) {
        console.warn("Attempted to end Y update cycle when none is in progress");
        this.updateDepthY = 0;
        this.updateInProgressY = false;
        this.updatedObjectsY.clear();
        this.starterObjectY = null;
        return;
      }

      this.updateDepthY--;
      // Only fully end the cycle when we're back at the top level
      if (this.updateDepthY === 0) {
        this.updateInProgressY = false;
        this.updatedObjectsY.clear();
        this.starterObjectY = null;
      }
    }
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

    // Special case: If this is the starting object of the movement, 
    // put it at the beginning of the update order
    updateOrder.push(startObjId);
    visited.add(startObjId);

    // Helper function for depth-first traversal
    const visit = (nodeId) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      // Add this node to the update order
      updateOrder.push(nodeId);

      // Then process all children (dependencies)
      for (const childId of (tree[nodeId]?.children || [])) {
        visit(childId);
      }
    };

    // Process all direct children of the starting object
    for (const childId of (tree[startObjId]?.children || [])) {
      visit(childId);
    }

    // Return the objects in the correct update order (starter object first, then its dependencies)
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
      if ((direction === 'x' && this.updateInProgressX && !this.updatedObjectsX.has(nodeId)) ||
        (direction === 'y' && this.updateInProgressY && !this.updatedObjectsY.has(nodeId))) {
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

  // Handle updates to the tree structure when an object is deleted
  updateOnDelete(objectId, newIdMapping) {
    // Remove the object from both X and Y trees
    this.removeNode('x', objectId);
    this.removeNode('y', objectId);

    // Update canvas IDs in both trees
    ['x', 'y'].forEach(direction => {
      const tree = direction === 'x' ? this.xTree : this.yTree;

      // Create a new tree with updated IDs
      const updatedTree = {};

      // Process each node in the tree
      Object.keys(tree).forEach(id => {
        const numId = parseInt(id);

        // If the ID needs to be updated (it's greater than the deleted object's ID)
        if (newIdMapping[numId] !== undefined) {
          const newId = newIdMapping[numId];

          // Copy the node with the new ID
          updatedTree[newId] = tree[numId];
          updatedTree[newId].object = tree[numId].object;

          // Update parent references
          updatedTree[newId].parents = tree[numId].parents.map(parentId =>
            newIdMapping[parentId] !== undefined ? newIdMapping[parentId] : parentId
          );

          // Update child references
          updatedTree[newId].children = tree[numId].children.map(childId =>
            newIdMapping[childId] !== undefined ? newIdMapping[childId] : childId
          );
        }
        // If the ID is not affected by deletion, just copy it as-is
        else if (numId < objectId) {
          updatedTree[numId] = tree[numId];
        }
      });

      // Replace the old tree with the updated one
      if (direction === 'x') {
        this.xTree = updatedTree;
      } else {
        this.yTree = updatedTree;
      }
    });
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

  const deltaX = targetPoint.x - movingPoint.x + (isNaN(parseInt(spacingX)) ? 0 : parseInt(spacingX));
  const deltaY = targetPoint.y - movingPoint.y + (isNaN(parseInt(spacingY)) ? 0 : parseInt(spacingY));

  // Add X axis anchoring
  if (!isNaN(parseInt(spacingX))) {
    // Check for circular dependencies before adding to X tree
    if (globalAnchorTree.hasCircularDependency('x', shape2.canvasID, shape1.canvasID)) {
      alert("Cannot create anchor: would create a circular dependency in X axis");
    } else {
      // Snap arrow 1 to arrow 2 with the specified spacing
      shape2.set({
        left: shape2.left + deltaX,
        lockMovementX: true,
      });
      anchor = { sourcePoint: vertexIndex1, targetPoint: vertexIndex2, sourceObject: shape2, TargetObject: shape1, spacing: parseInt(spacingX) }
      shape2.lockXToPolygon = anchor

      // Add to the anchor tree
      globalAnchorTree.addNode('x', shape2, shape1);

      if (shape1.functionalType == 'Border') {
        if (shape1.widthObjects.includes(shape2)) {
          shape1.widthObjects.splice(shape1.widthObjects.indexOf(shape2), 1)
        }
      }
    }
  }

  // Add Y axis anchoring
  if (!isNaN(parseInt(spacingY))) {
    // Check for circular dependencies before adding to Y tree
    if (globalAnchorTree.hasCircularDependency('y', shape2.canvasID, shape1.canvasID)) {
      alert("Cannot create anchor: would create a circular dependency in Y axis");
    } else {
      // Snap arrow 1 to arrow 2 with the specified spacing
      shape2.set({
        top: shape2.top + deltaY,
        lockMovementY: true,
      });
      const anchor = { sourcePoint: vertexIndex1, targetPoint: vertexIndex2, sourceObject: shape2, TargetObject: shape1, spacing: parseInt(spacingY) }
      shape2.lockYToPolygon = anchor

      // Add to the anchor tree
      globalAnchorTree.addNode('y', shape2, shape1);

      if (shape1.functionalType == 'Border') {
        if (shape1.heightObjects.includes(shape2)) {
          shape1.heightObjects.splice(shape1.heightObjects.indexOf(shape2), 1)
        }
      }
    }
  }  // Use the AnchorTree to get the proper update order for anchors
  const updateOrderX = globalAnchorTree.getUpdateOrder('x', shape2.canvasID);
  const updateOrderY = globalAnchorTree.getUpdateOrder('y', shape2.canvasID);
  // Process X axis updates
  if (updateOrderX.length > 0 && !isNaN(parseInt(spacingX))) {
    // Start an X-axis update cycle with the shape2 as the starter
    globalAnchorTree.startUpdateCycle('x', shape2.canvasID);

    // First, explicitly update shape2 itself to ensure proper anchoring propagation
    // This step is key to fixing the issue with one-axis movement not propagating
    if (!globalAnchorTree.updatedObjectsX.has(shape2.canvasID)) {
      globalAnchorTree.updatedObjectsX.add(shape2.canvasID);
      shape2.updateAllCoord(null, sourceList);
    }

    // Update objects in the proper order for X axis (excluding shape2 which is already processed)
    updateOrderX.forEach(obj => {
      if (obj.canvasID !== shape2.canvasID && !globalAnchorTree.updatedObjectsX.has(obj.canvasID)) {
        // Mark this object as updated in X axis
        globalAnchorTree.updatedObjectsX.add(obj.canvasID);
        
        // Apply the X delta to each sub-anchored object first
        // This ensures they have changes to propagate to their own sub-anchored objects
        if (obj !== shape2 && deltaX !== 0) {
          obj.set({ left: obj.left + deltaX });
          obj.setCoords();
        }
        
        // Update coordinates - this may involve both X and Y changes
        obj.updateAllCoord(null, sourceList);
      }
    });

    // End the X-axis update cycle
    globalAnchorTree.endUpdateCycle('x');
  }
  // Process Y axis updates
  if (updateOrderY.length > 0  && !isNaN(parseInt(spacingY))) {
    // Start a Y-axis update cycle with the shape2 as the starter
    globalAnchorTree.startUpdateCycle('y', shape2.canvasID);

    // First, explicitly update shape2 itself to ensure proper anchoring propagation
    // This step is key to fixing the issue with one-axis movement not propagating
    if (!globalAnchorTree.updatedObjectsY.has(shape2.canvasID)) {
      globalAnchorTree.updatedObjectsY.add(shape2.canvasID);
      shape2.updateAllCoord(null, sourceList);
    }

    // Update objects in the proper order for Y axis (excluding shape2 which is already processed)
    updateOrderY.forEach(obj => {
      if (obj.canvasID !== shape2.canvasID && !globalAnchorTree.updatedObjectsY.has(obj.canvasID)) {
        // Mark this object as updated in Y axis
        globalAnchorTree.updatedObjectsY.add(obj.canvasID);
        
        // Apply the Y delta to each sub-anchored object first
        // This ensures they have changes to propagate to their own sub-anchored objects
        if (obj !== shape2 && deltaY !== 0) {
          obj.set({ top: obj.top + deltaY });
          obj.setCoords();
        }
        
        // Update coordinates - this may involve both X and Y changes
        obj.updateAllCoord(null, sourceList);
      }
    });

    // End the Y-axis update cycle
    globalAnchorTree.endUpdateCycle('y');
  }

  // If no updates from either axis, just update the object itself
  if (updateOrderX.length === 0 && updateOrderY.length === 0 && !sourceList.includes(shape2)) {
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
  } else {
    shape2.exitFocusMode();
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
