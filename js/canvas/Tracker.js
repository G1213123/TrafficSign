// CanvasTracker utility for tracking canvas operations
import { CanvasGlobals } from "./canvas.js";
import { showPropertyPanel } from "../sidebar/property.js";

// Import object creation system for proper object regeneration
let ObjectBuilderFactory = null;
try {
  import('../objects/build.js').then(module => {
    ObjectBuilderFactory = module.ObjectBuilderFactory;
  });
} catch (error) {
  console.warn('Could not load ObjectBuilderFactory, will use fallback object creation');
}

// Import globalAnchorTree for anchor preservation during restoration
let globalAnchorTree = null;
try {
  import('../objects/anchor.js').then(module => {
    globalAnchorTree = module.globalAnchorTree;
  });
} catch (error) {
  console.warn('Could not load globalAnchorTree, anchor preservation will be limited');
}

class CanvasTracker {
  constructor() {
    this.history = [];
    this.dragBuffer = {};
    this.isDragging = false;
    this.currentChainId = null;
    this.chainedObjects = new Set(); // Set of object IDs in current chain
    this.historyChangeCallbacks = []; // Callbacks to notify when history changes

    // New JSON state-based tracking properties
    this.stateHistory = [];
    this.currentStateIndex = -1;
    this.maxStateHistory = 50;
    this.isCapturingState = false;
    this.pendingStateCapture = false;

    // Capture initial canvas state
    //this.captureInitialState();
  }

  // Add callback to be notified when history changes
  addHistoryChangeCallback(callback) {
    if (typeof callback === 'function' && !this.historyChangeCallbacks.includes(callback)) {
      this.historyChangeCallbacks.push(callback);
    }
  }

  // Remove a previously added callback
  removeHistoryChangeCallback(callback) {
    const index = this.historyChangeCallbacks.indexOf(callback);
    if (index !== -1) {
      this.historyChangeCallbacks.splice(index, 1);
    }
  }

  // Notify all callbacks that history has changed
  notifyHistoryChanged() {
    this.historyChangeCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in history change callback:', error);
      }
    });
  }

  track(action, params) {
    // If this is a modification during active dragging, accumulate it
    if (action === 'modifyObject' && params && params.length > 0) {
      const objectId = params[0].id;

      // If this is the first movement for this object, initialize tracking
      if (!this.dragBuffer[objectId]) {
        this.dragBuffer[objectId] = {
          startParams: JSON.parse(JSON.stringify(params[0])), // Clone the starting state
          currentParams: JSON.parse(JSON.stringify(params[0])), // Clone for tracking
          deltaX: 0,
          deltaY: 0,
          chainId: this.currentChainId || this.generateChainId() // Assign chain ID
        };

        // If there's no current chain ID, this is the first object in a new chain
        if (!this.currentChainId) {
          this.currentChainId = this.dragBuffer[objectId].chainId;
          this.chainedObjects.clear();
        }

        // Add this object to the current chain
        this.chainedObjects.add(objectId);
        this.isDragging = true;

      } else {
        // Accumulate the deltas
        this.dragBuffer[objectId].deltaX += params[0].deltaX;
        this.dragBuffer[objectId].deltaY += params[0].deltaY;
        this.dragBuffer[objectId].currentParams = JSON.parse(JSON.stringify(params[0])); // Update current state
      }


      // We don't add to history yet - will do that when drag ends
      return;
    }

    // If we reach here with isDragging true, it means drag has ended
    if (this.isDragging && action !== 'propertyChanged') {
      this.completeDragOperations();
    }

    // For non-modification actions or after drag complete, add to history normally
    this.history.push({
      timestamp: new Date().toISOString(),
      action,
      params,
      chainId: null // Non-modification actions aren't part of a chain
    });

    // Notify listeners that history has changed
    this.notifyHistoryChanged();
  }

  // Generate a unique chain ID
  generateChainId() {
    return `chain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Called to finish a drag operation and record the accumulated movement
  completeDragOperations() {
    const objectsInCurrentChain = [...this.chainedObjects];
    let historyChanged = false;

    objectsInCurrentChain.forEach(objectId => {
      const buffer = this.dragBuffer[objectId];

      // Only record if there was actual movement
      if (buffer.deltaX !== 0 || buffer.deltaY !== 0) {
        // Create a single history entry with the total movement
        const params = JSON.parse(JSON.stringify(buffer.currentParams));
        params.deltaX = buffer.deltaX;
        params.deltaY = buffer.deltaY;

        this.history.push({
          timestamp: new Date().toISOString(),
          action: 'modifyObject',
          params: [params],
          chainId: buffer.chainId, // Add the chain ID to associate with other objects in same movement
          chainObjects: objectsInCurrentChain // Include list of all objects in chain for reference
        });

        historyChanged = true;
      }
    });

    // Reset drag tracking
    this.dragBuffer = {};
    this.isDragging = false;
    this.currentChainId = null;
    this.chainedObjects.clear();

    // Notify listeners if history actually changed
    if (historyChanged) {
      this.notifyHistoryChanged();
    }
  }

  // Method to manually signal the end of a drag operation
  endDrag() {
    if (this.isDragging) {
      this.completeDragOperations();
    }
  }

  // Get all entries that are part of the same chain as the given entry
  getChainedEntries(entry) {
    if (!entry.chainId) return [entry]; // Not part of a chain

    return this.history.filter(item => item.chainId === entry.chainId);
  }

  replay(canvas) {
    this.history.forEach(entry => {
      const { action, params } = entry;
      if (typeof canvas[action] === 'function') {
        canvas[action](...params);
      } else {
        console.warn(`Action ${action} is not a function on the canvas object.`);
      }
    });
  }

  clearHistory() {
    this.history = [];
    this.dragBuffer = {};
    this.isDragging = false;
    this.currentChainId = null;
    this.chainedObjects.clear();

    // Notify listeners that history has changed
    this.notifyHistoryChanged();
  }

  // Get a unique list of chain IDs from history
  getUniqueChainIds() {
    return [...new Set(this.history
      .filter(entry => entry.chainId)
      .map(entry => entry.chainId))];
  }

  // Get a count of objects in a chain
  getChainObjectCount(chainId) {
    if (!chainId) return 0;

    // Find first entry with this chain to get the full list
    const chainEntry = this.history.find(entry => entry.chainId === chainId);
    return chainEntry && chainEntry.chainObjects ? chainEntry.chainObjects.length : 1;
  }


  // Undo using enhanced property-based restoration
  undoState() {
    if (this.currentStateIndex <= 0) {
      console.log('Nothing to undo');
      return false;
    }

    this.currentStateIndex--;
    const targetState = this.stateHistory[this.currentStateIndex];

    console.log(`Undoing to: ${targetState.description || targetState.action}`);

    // Try property-based restoration first (faster and more precise)
    if (targetState.objectProperties) {
      console.log('Using property-based restoration');
      return this.restoreFromObjectProperties(targetState.objectProperties);
    } else {
      // Fallback to full canvas restoration
      console.log('Using full canvas restoration');
      return this.restoreCanvasState(targetState.canvasState);
    }
  }

  // Redo using enhanced property-based restoration
  redoState() {
    if (this.currentStateIndex >= this.stateHistory.length - 1) {
      console.log('Nothing to redo');
      return false;
    }

    this.currentStateIndex++;
    const targetState = this.stateHistory[this.currentStateIndex];

    console.log(`Redoing to: ${targetState.description || targetState.action}`);

    // Try property-based restoration first (faster and more precise)
    if (targetState.objectProperties) {
      console.log('Using property-based restoration');
      return this.restoreFromObjectProperties(targetState.objectProperties);
    } else {
      // Fallback to full canvas restoration
      console.log('Using full canvas restoration');
      return this.restoreCanvasState(targetState.canvasState);
    }
  }

  // Restore canvas to a specific state
  restoreCanvasState(canvasState) {
    if (!canvasState || !CanvasGlobals.canvas) {
      console.error('Cannot restore canvas state: invalid state or canvas');
      return false;
    }

    this.isCapturingState = true; // Prevent tracking during restore

    try {
      // Clear current canvas
      CanvasGlobals.canvas.clear();

      // Clear the global canvas object array
      if (CanvasGlobals.canvasObject) {
        CanvasGlobals.canvasObject.length = 0;
      }

      // Load the state using Fabric.js built-in method
      CanvasGlobals.canvas.loadFromJSON(canvasState, () => {
        // Callback after loading is complete

        // Rebuild the global canvasObject array from loaded objects
        if (CanvasGlobals.canvasObject) {
          const loadedObjects = CanvasGlobals.canvas.getObjects();
          // Filter out grid or other special objects if needed
          const userObjects = loadedObjects.filter(obj => obj.id !== 'grid');
          CanvasGlobals.canvasObject.push(...userObjects);
        }

        // Re-render the canvas
  CanvasGlobals.scheduleRender();

        console.log('Canvas state restored successfully');
        this.isCapturingState = false;
      });

      return true;
    } catch (error) {
      console.error('Error restoring canvas state:', error);
      this.isCapturingState = false;
      return false;
    }
  }


  // Compare object properties between two states
  objectPropertiesAreEqual(props1, props2) {
    try {
      return JSON.stringify(props1) === JSON.stringify(props2);
    } catch (error) {
      console.error('Error comparing object properties:', error);
      return false;
    }
  }




  // Track a property change with before/after values for undo
  trackPropertyChange(objectId, propertyKey, oldValue, newValue, description = null) {
    if (this.isCapturingState) return; // Don't track during restoration

    const obj = CanvasGlobals.canvas.getObjects().find(o => o.id === objectId);
    if (!obj) {
      console.warn(`Cannot track property change for object ${objectId} - object not found`);
      return;
    }

    // Create a property change entry
    const changeEntry = {
      timestamp: new Date().toISOString(),
      action: 'propertyChanged',
      sourceObjectId: objectId,
      propertyKey: propertyKey,
      oldValue: JSON.parse(JSON.stringify(oldValue)), // Deep copy to preserve state
      newValue: JSON.parse(JSON.stringify(newValue)), // Deep copy to preserve state
      objectType: obj.functionalType || obj.type,
      description: description || `${propertyKey} changed on ${obj.functionalType || obj.type} (ID: ${objectId})`
    };

    // Add to history
    this.history.push(changeEntry);

    // Notify listeners that history has changed
    this.notifyHistoryChanged();

    console.log('Property change tracked:', changeEntry);
  }

  // Undo a property change by restoring the old value
  undoPropertyChange(historyEntry) {
    if (!historyEntry || historyEntry.action !== 'propertyChanged') {
      console.warn('Invalid property change entry for undo');
      return false;
    }

    const { id, propertyKey, oldValue } = historyEntry.params[0];


    // Find the corresponding canvas object in CanvasGlobals.canvasObject
    const canvasObj = CanvasGlobals.canvasObject.find(o => o.canvasID === id);
    if (!canvasObj) {
      console.warn(`Cannot undo property change - canvas object ${id} not found`);
      return false;
    }

    this.isCapturingState = true; // Prevent tracking during undo

    try {
      // Restore the old value
      if (propertyKey === 'color' || propertyKey === 'fill') {
        canvasObj[propertyKey] = oldValue; // Direct assignment for color/fill
      } else {
        canvasObj.set(propertyKey, oldValue);
      }

      // Rebuild the object using the same pattern as property.js
      if (typeof canvasObj.removeAll === 'function') {
        canvasObj.removeAll();
      }
      if (typeof canvasObj.initialize === 'function') {
        canvasObj.initialize();
      }
      if (typeof canvasObj.updateAllCoord === 'function') {
        canvasObj.updateAllCoord();
      }

      // Special handling for borders
      if (canvasObj.functionalType === 'Border' && typeof canvasObj.processResize === 'function') {
        canvasObj.processResize();
      }

  CanvasGlobals.scheduleRender();
      showPropertyPanel(canvasObj); // Refresh panel

      console.log(`Undid property change: ${propertyKey} restored to ${oldValue} on object ${id}`);
      return true;
    } catch (error) {
      console.error('Error undoing property change:', error);
      return false;
    } finally {
      this.isCapturingState = false;
    }
  }

}


// Initialize canvas tracker to monitor object creation, deletion, and modification
const canvasTracker = new CanvasTracker();

// Add tracker to global scope for testing
window.canvasTracker = canvasTracker;

console.log('Property change tracking enabled! Use demoPropertyTracking() to test.');

/*

// ENHANCED EVENT LISTENERS FOR DETAILED PROPERTY TRACKING

// Track object property changes
CanvasGlobals.canvas.on('object:added', function(e) {
  if (e.target && e.target.id && e.target.id !== 'grid') {
    canvasTracker.trackMetadataChange('objectAdded', `Object ${e.target.id} added`);
  }
});

CanvasGlobals.canvas.on('object:removed', function(e) {
  if (e.target && e.target.id && e.target.id !== 'grid') {
    canvasTracker.trackMetadataChange('objectRemoved', `Object ${e.target.id} removed`);
  }
});

CanvasGlobals.canvas.on('object:scaling', function(e) {
  if (e.target && e.target.id) {
    canvasTracker.trackMetadataChange('objectScaling', `Object ${e.target.id} scaling`);
  }
});

CanvasGlobals.canvas.on('object:rotating', function(e) {
  if (e.target && e.target.id) {
    canvasTracker.trackMetadataChange('objectRotating', `Object ${e.target.id} rotating`);
  }
});

CanvasGlobals.canvas.on('selection:created', function(e) {
  if (e.target) {
    canvasTracker.trackMetadataChange('selectionCreated', 'Selection created');
  }
});

CanvasGlobals.canvas.on('selection:cleared', function(e) {
  canvasTracker.trackMetadataChange('selectionCleared', 'Selection cleared');
});

// Enhanced property change tracking via fabric.js set method override
if (typeof fabric !== 'undefined' && fabric.Object && fabric.Object.prototype) {
  const originalSet = fabric.Object.prototype.set;
  
  fabric.Object.prototype.set = function(key, value) {
    const result = originalSet.call(this, key, value);
    
    // Track changes to important properties
    if (this.id && this.id !== 'grid') {
      const trackedProperties = [
        'fill', 'stroke', 'strokeWidth', 'opacity',
        'text', 'fontFamily', 'fontSize', 'fontWeight', 'textAlign',
        'symbol', 'functionalType', 'txtChar'
      ];
      
      // Check if this is a property we want to track
      if (typeof key === 'string' && trackedProperties.includes(key)) {
        canvasTracker.trackMetadataChange(
          'propertyChanged', 
          `Object ${this.id}: ${key} changed to ${value}`
        );
      } else if (typeof key === 'object') {
        // Handle case where multiple properties are set at once
        const changedTrackedProps = Object.keys(key).filter(k => trackedProperties.includes(k));
        if (changedTrackedProps.length > 0) {
          canvasTracker.trackMetadataChange(
            'propertiesChanged',
            `Object ${this.id}: properties ${changedTrackedProps.join(', ')} changed`
          );
        }
      }
    }
    
    return result;
  };
}
*/
export { canvasTracker };