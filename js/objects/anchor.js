//TODO: check updateAllCoord for anchor object inside border / divider not working
// AnchorTree class to manage anchoring relationships between objects
import { CanvasGlobals } from '../canvas/canvas.js';
import { canvasTracker } from '../canvas/Tracker.js'; // Import canvasTracker for tracking changes
import { ShowHideSideBarEvent } from '../canvas/keyboardEvents.js';
import { showTextBox, hideTextBox, selectObjectHandler } from '../canvas/promptBox.js'; // Import selectObjectHandler for object selection

const canvas = CanvasGlobals.canvas; // Get the global canvas instance

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
        //console.warn("Attempted to end X update cycle when none is in progress");
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
        //console.warn("Attempted to end Y update cycle when none is in progress");
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
    // Remove this node from all its children's parents lists
    for (const childId of tree[objId].children) {
      if (tree[childId]) {
        tree[childId].parents = tree[childId].parents.filter(id => id !== objId);
      }
    }

    delete tree[objId]; // Finally, delete the node itself

  }

  // Helper function to find the upward chain based on current locks
  // Returns an array of objects: [{id: currentId, parentId: foundParentId}, ...]
  findUpwardChain(direction, startId) {
    const tree = direction === 'x' ? this.xTree : this.yTree;
    const chain = [];
    let currentId = startId;
    const visited = new Set(); // Prevent infinite loops

    while (currentId !== -1 && tree[currentId] && !visited.has(currentId)) {
      visited.add(currentId);
      const currentNode = tree[currentId];
      const currentObject = currentNode.object;
      let foundParentId = -1; // The parent ID determined for this step
      let lockinfo = null; // The lock information for this step

      // Find the parent based on the current lock state and verify in tree
      if (direction === 'x' && currentObject.lockXToPolygon?.TargetObject) {
        const potentialParentId = currentObject.lockXToPolygon.TargetObject.canvasID;
        if (currentNode.parents.includes(potentialParentId) && tree[potentialParentId]) {
          foundParentId = potentialParentId;
          lockinfo = currentObject.lockXToPolygon;
        }
      } else if (direction === 'y' && currentObject.lockYToPolygon?.TargetObject) {
        const potentialParentId = currentObject.lockYToPolygon.TargetObject.canvasID;
        if (currentNode.parents.includes(potentialParentId) && tree[potentialParentId]) {
          foundParentId = potentialParentId;
          lockinfo = currentObject.lockYToPolygon;
        }
      }

      // Store the current ID and the parent ID found *in this step*
      chain.push({ id: currentId, parentId: foundParentId, lockinfo: lockinfo });

      // Move to the found parent for the next iteration
      currentId = foundParentId;
    }

    if (currentId !== -1 && visited.has(currentId)) {
      console.warn(`Cycle detected during chain identification starting from ${startId} in ${direction}. Chain may be incomplete.`);
    }

    return chain; // Returns [{id: startId, parentId: p1}, {id: p1, parentId: p2}, ...]
  }

  // Helper function to update lockMovement flags and focus mode based on current locks
  updateLockAndFocus(obj) {
    if (!obj) return;

    obj.lockMovementX = !(Object.keys(obj.lockXToPolygon).length === 0);
    obj.lockMovementY = !(Object.keys(obj.lockYToPolygon).length === 0);

    if (obj.lockMovementX || obj.lockMovementY) {
      obj.enterFocusMode();
    } else {
      // Only exit focus mode if it's not locked by other means (like group selection)
      // Assuming exitFocusMode handles internal checks or is safe to call
      obj.exitFocusMode();
    }
  }

  // Reverse the anchor dependency chain starting from a pivot object
  reverseAnchorChain(direction, startPivotId) {
    const tree = direction === 'x' ? this.xTree : this.yTree;

    if (!tree[startPivotId]) {
      console.warn(`Start pivot object with ID ${startPivotId} not found in ${direction} tree.`);
      return;
    }

    // 1. Identify the entire chain to be reversed first, capturing parent links
    const chainInfo = this.findUpwardChain(direction, startPivotId);

    // If the chain only has the start node (no parents found in this direction), nothing to reverse
    if (chainInfo.length === 0 || (chainInfo.length === 1 && chainInfo[0].parentId === -1)) {
      return;
    }

    // 2. Iterate through the identified chain links and perform reversals
    // The chainInfo array gives us pairs of (childId, parentId) for each link
    for (const link of chainInfo) {
      const childId = link.id;
      const parentId = link.parentId;
      const oldLock = link.lockinfo; // The lock information for this link

      // Stop if we reach the end of a chain segment (no further parent)
      if (parentId === -1) {
        break;
      }

      // Double-check nodes exist
      if (!tree[childId] || !tree[parentId]) {
        console.warn(`Node missing during reversal (${childId} or ${parentId}). Stopping chain reversal.`);
        break;
      }

      const childNode = tree[childId];
      const childObject = childNode.object;
      const parentNode = tree[parentId];
      const parentObject = parentNode.object;


      // If the expected lock for this specific link isn't found now, it might have been changed
      // concurrently or there's an inconsistency. We rely on the chainInfo structure.
      if (!oldLock) {
        console.warn(`Could not find original lock information for link ${childId} -> ${parentId} in ${direction} during reversal. Attempting reversal based on identified chain.`);
        // Construct a placeholder oldLock if needed, assuming standard points if missing
        // This might be risky if lock points are critical and vary.
        // Alternatively, skip this link if consistency is paramount.
        // Let's try skipping for now:
        console.warn(`Skipping reversal for link ${childId} -> ${parentId} due to missing lock info.`);
        continue;
      }

      // --- Perform the reversal for this specific link ---

      // Clear the old lock on the child object for this direction
      if (direction === 'x' && childObject.canvasID === Object.values(chainInfo)[0].id) {
        childObject.lockXToPolygon = {};
      } else if (childObject.canvasID === Object.values(chainInfo)[0].id) { // direction === 'y'
        childObject.lockYToPolygon = {};
      }

      // Remove the old relationship (Parent -> Child) from tree structure
      parentNode.children = parentNode.children.filter(id => id !== childId);
      childNode.parents = childNode.parents.filter(id => id !== parentId);

      // Add the new relationship (Child -> Parent) to tree structure
      if (!childNode.children.includes(parentId)) {
        childNode.children.push(parentId);
      }
      if (!parentNode.parents.includes(childId)) {
        parentNode.parents.push(childId);
      }

      // Set the new lock on the PARENT object, making it dependent on the CHILD
      const newLock = {
        sourcePoint: oldLock.targetPoint, // Use default if missing
        targetPoint: oldLock.sourcePoint, // Use default if missing
        sourceObject: parentObject,
        TargetObject: childObject,
        spacing: -oldLock.spacing // Use default if missing
      };

      if (direction === 'x') {
        parentObject.lockXToPolygon = newLock;
      } else { // direction === 'y'
        parentObject.lockYToPolygon = newLock;
      }

      // Update lockMovement and focus mode for BOTH objects involved in this link
      this.updateLockAndFocus(childObject);
      this.updateLockAndFocus(parentObject);

    } // End for loop through the chain links
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

    // Update canvas IDs in both trees
    ['x', 'y'].forEach(direction => {
      // Remove the object from both X and Y trees
      this.removeNode(direction, objectId);
      const tree = direction === 'x' ? this.xTree : this.yTree;

      // Create a new tree with updated IDs
      const updatedTree = {};

      // Process each node in the tree
      Object.keys(tree).forEach(id => {
        const numId = parseInt(id);
        let newId;
        // If the ID needs to be updated (it's greater than the deleted object's ID)
        if (newIdMapping[numId] !== undefined) {
          newId = newIdMapping[numId];
        } else {
          newId = numId;
        }

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

document.getElementById('set-anchor').addEventListener('click', function (event) {
  const selectedArrow = event.target.parentElement.parentElement.selectedArrow;
  if (selectedArrow) {
    this.parentElement.parentElement.style.display = 'none';
    // Implement vertex selection logic here
    document.removeEventListener('keydown', ShowHideSideBarEvent);
    selectObjectHandler('Select shape to anchor to', anchorShape, selectedArrow)
    //renumberVertexLabels(shape1); // Renumber vertex labels after selection
  }
});

document.getElementById('pivot-anchor').addEventListener('click', function (e) {
  const contextMenu = document.getElementById('context-menu');
  contextMenu.style.display = 'none'; // Hide the context menu
  const obj = contextMenu.selectedArrow;

  // Check if the object and anchorTree exist
  if (obj && obj.canvasID && typeof globalAnchorTree !== 'undefined') {
    // Call the reverse function for both axes
    globalAnchorTree.reverseAnchorChain('x', obj.canvasID);
    globalAnchorTree.reverseAnchorChain('y', obj.canvasID);

    // Update coordinates and render
    if (typeof obj.updateAllCoord === 'function') {
      obj.updateAllCoord(); // Update dependencies first
    }
    obj.setCoords(); // Update the object itself
    canvas.renderAll();

    // Optional: Fire a modified event if needed for other parts of your app
    canvas.fire('object:modified', { target: obj });

  } else {
    if (!obj || !obj.canvasID) {
      console.warn('Pivot Anchor: Target object or canvasID not found.');
    }
  }
});


// Helper function to process anchor updates for a specific axis
function processUpdateCycle(direction, starterObj, updateOrder, delta, sourceList) {
  if (updateOrder.length === 0 || isNaN(delta)) {
    return; // No updates needed or invalid delta
  }

  const updatedObjectsSet = direction === 'x' ? globalAnchorTree.updatedObjectsX : globalAnchorTree.updatedObjectsY;
  const axis = direction === 'x' ? 'left' : 'top';

  // Start an update cycle with the starterObj as the starter
  globalAnchorTree.startUpdateCycle(direction, starterObj.canvasID);

  // First, explicitly update the starterObj itself to ensure proper anchoring propagation
  // This step is key to fixing the issue with one-axis movement not propagating
  if (!updatedObjectsSet.has(starterObj.canvasID)) {
    updatedObjectsSet.add(starterObj.canvasID);
    // Apply the delta directly to the starter object before calling updateAllCoord
    // This ensures the initial movement is reflected before propagation
    // No need to apply delta here as it was already applied before calling this function
    // if (delta !== 0) {
    //     starterObj.set({ [axis]: starterObj[axis] + delta });
    //     starterObj.setCoords(); // Update coordinates after direct movement
    // }
    starterObj.updateAllCoord(null, sourceList); // Propagate changes
  }

  // Update objects in the proper order (excluding the starterObj which is already processed)
  updateOrder.forEach(obj => {
    if (obj.canvasID !== starterObj.canvasID && !updatedObjectsSet.has(obj.canvasID)) {
      // Mark this object as updated
      updatedObjectsSet.add(obj.canvasID);

      // Apply the delta to each sub-anchored object first
      // This ensures they have changes to propagate to their own sub-anchored objects
      // No need to apply delta here as it was already applied before calling this function
      if (delta !== 0) {
        obj.set({ [axis]: obj[axis] + delta });
        obj.setCoords(); // Update coordinates after direct movement
      }

      // Update coordinates - this may involve both X and Y changes if anchored in both axes
      obj.updateAllCoord(null, sourceList);
    }
  });

  // End the update cycle
  globalAnchorTree.endUpdateCycle(direction);
}

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

  const parsedSpacingX = isNaN(parseInt(spacingX)) ? 0 : parseInt(spacingX);
  const parsedSpacingY = isNaN(parseInt(spacingY)) ? 0 : parseInt(spacingY);

  const deltaX = targetPoint.x - movingPoint.x + parsedSpacingX;
  const deltaY = targetPoint.y - movingPoint.y + parsedSpacingY;

  let appliedDeltaX = false;
  let appliedDeltaY = false;

  // Add X axis anchoring
  if (!isNaN(parseInt(spacingX))) {
    if (globalAnchorTree.hasCircularDependency('x', shape2.canvasID, shape1.canvasID)) {
      alert("Cannot create anchor: would create a circular dependency in X axis");
    } else {
      // Snap shape2 to shape1 with the specified spacing
      shape2.set({
        left: shape2.left + deltaX,
        lockMovementX: true,
      });
      appliedDeltaX = true; // Mark that deltaX was applied
      const anchor = { sourcePoint: vertexIndex1, targetPoint: vertexIndex2, sourceObject: shape2, TargetObject: shape1, spacing: parseInt(spacingX) }
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
    if (globalAnchorTree.hasCircularDependency('y', shape2.canvasID, shape1.canvasID)) {
      alert("Cannot create anchor: would create a circular dependency in Y axis");
    } else {
      // Snap shape2 to shape1 with the specified spacing
      shape2.set({
        top: shape2.top + deltaY,
        lockMovementY: true,
      });
      appliedDeltaY = true; // Mark that deltaY was applied
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
  }

  // Update coordinates after initial placement and adding to tree
  shape2.setCoords();

  // Use the AnchorTree to get the proper update order for anchors
  const updateOrderX = globalAnchorTree.getUpdateOrder('x', shape2.canvasID);
  const updateOrderY = globalAnchorTree.getUpdateOrder('y', shape2.canvasID);

  // Process X axis updates using the new helper function
  // Pass the delta only if it was actually applied during anchoring setup
  processUpdateCycle('x', shape2, updateOrderX, appliedDeltaX ? deltaX : NaN, sourceList);

  // Process Y axis updates using the new helper function
  // Pass the delta only if it was actually applied during anchoring setup
  processUpdateCycle('y', shape2, updateOrderY, appliedDeltaY ? deltaY : NaN, sourceList);

  shape2.updateAllCoord();

  // If no updates were triggered by anchoring (e.g., only one axis anchored, or no spacing),
  // ensure the object itself is updated if it wasn't part of an ongoing cycle.
  //if (!globalAnchorTree.isUpdating('x', shape2.canvasID) && !globalAnchorTree.isUpdating('y', shape2.canvasID)) {
  //    // Check if the object is currently part of an update cycle started elsewhere
  //    // This check might be redundant now with the processUpdateCycle logic, but kept for safety
  //    const isUpdatingX = globalAnchorTree.updateInProgressX && globalAnchorTree.updatedObjectsX.has(shape2.canvasID);
  //    const isUpdatingY = globalAnchorTree.updateInProgressY && globalAnchorTree.updatedObjectsY.has(shape2.canvasID);
  //
  //    // Only call updateAllCoord if it hasn't been updated in an ongoing cycle initiated by this function
  //    if (!isUpdatingX && !isUpdatingY) {
  //        shape2.updateAllCoord(null, sourceList);
  //    }
  //}

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

export { globalAnchorTree, anchorShape, processUpdateCycle };
