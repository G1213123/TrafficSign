// CanvasTracker utility for tracking canvas operations
import { CanvasGlobals, DrawGrid } from "./canvas.js";

const canvasObject = CanvasGlobals.canvasObject;

class CanvasTracker {
  constructor() {
    this.history = [];
    this.historyIndex = -1;
    this.maxHistory = 50;
    this.isRestoring = false;
    this.isInteractionActive = false;
    this.historyChangeCallbacks = [];
    this.saveStateTimer = null;

    // Initialize with empty state or current state if canvas is ready
    setTimeout(() => {
        if (CanvasGlobals.canvas) {
            this.saveState();
            this.setupEventListeners();
        }
    }, 100);
  }

  setupEventListeners() {
      const canvas = CanvasGlobals.canvas;
      if (!canvas) return;

      const saveHandler = () => {
          if (!this.isRestoring) {
              this.saveState();
          }
      };

      // Track mouse interaction state to group drag operations
      canvas.on('mouse:down', () => {
          this.isInteractionActive = true;
      });
      
      // mouse:up and object:modified are handled by mouseEvents.js calling endDrag()
      // We keep object:added/removed here for other operations (like paste, delete key)
      
      canvas.on('object:added', (e) => {
          if (!this.isRestoring && e.target && e.target.id !== 'grid') {
              saveHandler();
          }
      });
      canvas.on('object:removed', (e) => {
          if (!this.isRestoring && e.target && e.target.id !== 'grid') {
              saveHandler();
          }
      });
  }

  addHistoryChangeCallback(callback) {
    if (typeof callback === 'function' && !this.historyChangeCallbacks.includes(callback)) {
      this.historyChangeCallbacks.push(callback);
    }
  }

  removeHistoryChangeCallback(callback) {
    const index = this.historyChangeCallbacks.indexOf(callback);
    if (index !== -1) {
      this.historyChangeCallbacks.splice(index, 1);
    }
  }

  notifyHistoryChanged() {
    this.historyChangeCallbacks.forEach(callback => {
      try {
        callback();
      } catch (error) {
        console.error('Error in history change callback:', error);
      }
    });
  }

  saveState() {
    if (this.isRestoring) return;
    
    // Debounce saveState to prevent multiple saves in the same tick (e.g. mouseup + modified)
    if (this.saveStateTimer) {
        clearTimeout(this.saveStateTimer);
    }
    
    this.saveStateTimer = setTimeout(() => {
        this._performSaveState();
    }, 50);
  }

  _performSaveState() {
    const objects = canvasObject.filter(obj => obj.id !== 'grid');
    const state = objects.map(obj => {
        if (typeof obj.serializeToJSON === 'function') {
            return obj.serializeToJSON();
        }
    });

    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    const stateStr = JSON.stringify(state);
    if (this.historyIndex >= 0) {
        const lastStateStr = JSON.stringify(this.history[this.historyIndex].state);
        if (stateStr === lastStateStr) {
            return;
        }
    }

    this.history.push({
        state: state,
        timestamp: new Date().toLocaleTimeString(),
        description: `State ${this.history.length + 1}`
    });
    this.historyIndex++;

    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.historyIndex--;
    }

    console.log(`State saved. History: ${this.historyIndex + 1}/${this.history.length}`);
    this.notifyHistoryChanged();
  }

  async restoreState(index) {
    if (index < 0 || index >= this.history.length) return;

    this.isRestoring = true;
    const stateEntry = this.history[index];
    const canvas = CanvasGlobals.canvas;

    // Save current active object's canvasID
    const activeObject = canvas.getActiveObject();
    const activeCanvasID = activeObject ? activeObject.canvasID : null;

      // Remove all objects except grid
      const objects = canvas.getObjects();
      const objectsToRemove = objects.filter(obj => obj.id !== 'grid');
      objectsToRemove.forEach(obj => canvas.remove(obj));
      
      // Clear global object list
      if (CanvasGlobals.canvasObject) {
          CanvasGlobals.canvasObject.length = 0;
      }
      
      const stateClone = JSON.parse(JSON.stringify(stateEntry.state));
      
      // Dynamic import to avoid circular dependency
      const { buildObjectsFromJSON } = await import("../objects/build.js");
      await buildObjectsFromJSON(stateClone);

      // Ensure grid is present and correct
      DrawGrid();

      this.historyIndex = index;
      canvas.renderAll();
      
      // Dynamic import for property panel to avoid circular dependency
      const { showPropertyPanel } = await import("../sidebar/property.js");

      // Restore selection if possible
      let restored = false;
      if (activeCanvasID !== null && activeCanvasID !== undefined) {
          const restoredObj = CanvasGlobals.canvasObject.find(obj => obj.canvasID === activeCanvasID);
          if (restoredObj) {
              canvas.setActiveObject(restoredObj);
              showPropertyPanel(restoredObj);
              restored = true;
          }
      }
      
      if (!restored) {
          canvas.discardActiveObject();
          showPropertyPanel(null);
      }

      console.log(`State restored. History: ${this.historyIndex + 1}/${this.history.length}`);
      this.notifyHistoryChanged();


      this.isRestoring = false;
    
  }

  async undo() {
    if (this.historyIndex > 0) {
      await this.restoreState(this.historyIndex - 1);
      return true;
    }
    return false;
  }

  async redo() {
    if (this.historyIndex < this.history.length - 1) {
      await this.restoreState(this.historyIndex + 1);
      return true;
    }
    return false;
  }
  
  clearHistory() {
      this.history = [];
      this.historyIndex = -1;
      this.saveState(); // Save current state as initial
      this.notifyHistoryChanged();
  }

  track(action, params) {
      // If we are in the middle of an interaction (like dragging), don't save state yet.
      // We wait for endDrag() or object:modified.
      if (action === 'modifyObject' && this.isInteractionActive) {
          return;
      }
      this.saveState();
  }
  
  // Alias for compatibility with older code or user expectations
  completeDragOperations() {
      this.endDrag();
  }

  endDrag() {
      this.isInteractionActive = false;
      this.saveState();
  }
  
  trackMetadataChange(type, description) {
      this.saveState();
  }
  
  // Mock methods for UI compatibility if needed
  getUniqueChainIds() { return []; }
  getChainObjectCount() { return 0; }
}

const canvasTracker = new CanvasTracker();
window.canvasTracker = canvasTracker;

export { canvasTracker };