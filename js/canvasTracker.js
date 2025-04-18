// CanvasTracker utility for tracking canvas operations
import { CanvasGlobals } from "./canvas.js";

class CanvasTracker {
  constructor() {
    this.history = [];
    this.dragBuffer = {};
    this.isDragging = false;
    this.currentChainId = null;
    this.chainedObjects = new Set(); // Set of object IDs in current chain
    this.historyChangeCallbacks = []; // Callbacks to notify when history changes
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

      } else {
        // Accumulate the deltas
        this.dragBuffer[objectId].deltaX += params[0].deltaX;
        this.dragBuffer[objectId].deltaY += params[0].deltaY;
        this.dragBuffer[objectId].currentParams = JSON.parse(JSON.stringify(params[0])); // Update current state
      }

      this.isDragging = true;

      // We don't add to history yet - will do that when drag ends
      return;
    }

    // If we reach here with isDragging true, it means drag has ended
    if (this.isDragging) {
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

    Object.keys(this.dragBuffer).forEach(objectId => {
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
}

// Add to the global scope
window.CanvasTracker = CanvasTracker;


// Initialize canvas tracker to monitor object creation, deletion, and modification
const canvasTracker = new CanvasTracker();

// Add event listeners to detect the end of drag operations
CanvasGlobals.canvas.on('mouse:up', function () {
  // When mouse is released, signal the end of any ongoing drag
  canvasTracker.endDrag();
});

CanvasGlobals.canvas.on('object:modified', function () {
  // When an object is modified (e.g., after resizing or rotation is complete), signal the end of any drag
  canvasTracker.endDrag();
});

export { canvasTracker };