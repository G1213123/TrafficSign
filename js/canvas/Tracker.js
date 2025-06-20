// CanvasTracker utility for tracking canvas operations
import { CanvasGlobals } from "./canvas.js";

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
    this.captureInitialState();
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

  // NEW JSON STATE-BASED METHODS - Added alongside existing functionality

  // Capture the initial canvas state
  captureInitialState() {
    if (!CanvasGlobals.canvas) return;
    
    const initialState = this.captureCanvasState();
    if (initialState) {
      this.stateHistory = [{
        timestamp: new Date().toISOString(),
        action: 'initial',
        canvasState: initialState,
        description: 'Initial canvas state'
      }];
      this.currentStateIndex = 0;
    }
  }

  // Capture current canvas state as JSON
  captureCanvasState() {
    if (!CanvasGlobals.canvas) return null;
    
    try {
      // Use Fabric.js built-in JSON serialization
      const canvasState = CanvasGlobals.canvas.toJSON([
        'basePolygon', 'anchoredPolygon', 'functionalType', 'txtChar', 
        'text', 'insertionPoint', 'vertex', 'refTopLeft', 'symbol', 'xHeight',
        'canvasID', 'lockXToPolygon', 'lockYToPolygon', 'borderGroup', 'mainRoad'
      ]);
      
      return canvasState;
    } catch (error) {
      console.error('Error capturing canvas state:', error);
      return null;
    }
  }

  // Track metadata changes (new functionality)
  trackMetadataChange(action, description) {
    if (this.isCapturingState) return;
    
    // Schedule a state capture (debounced to avoid too many captures)
    if (this.pendingStateCapture) {
      clearTimeout(this.pendingStateCapture);
    }

    this.pendingStateCapture = setTimeout(() => {
      this.captureCurrentState(action, description);
      this.pendingStateCapture = false;
    }, 100); // 100ms delay
  }

  // Capture current state and add to state history
  captureCurrentState(action, description) {
    if (this.isCapturingState) return;
    
    this.isCapturingState = true;
    
    try {
      const currentState = this.captureCanvasState();
      
      if (!currentState) {
        console.warn('Failed to capture canvas state');
        return;
      }

      // Check if the new state is different from the current one
      if (this.currentStateIndex >= 0 && this.stateHistory[this.currentStateIndex]) {
        const lastState = this.stateHistory[this.currentStateIndex].canvasState;
        if (this.statesAreEqual(currentState, lastState)) {
          return; // No change, don't add to history
        }
      }

      // Remove any future history if we're not at the end
      if (this.currentStateIndex < this.stateHistory.length - 1) {
        this.stateHistory = this.stateHistory.slice(0, this.currentStateIndex + 1);
      }

      // Add new state to history
      const historyEntry = {
        timestamp: new Date().toISOString(),
        action: action,
        canvasState: currentState,
        description: description || action
      };

      this.stateHistory.push(historyEntry);
      this.currentStateIndex = this.stateHistory.length - 1;

      // Limit history size
      if (this.stateHistory.length > this.maxStateHistory) {
        this.stateHistory.shift();
        this.currentStateIndex--;
      }

      this.notifyHistoryChanged();
    } catch (error) {
      console.error('Error capturing current state:', error);
    } finally {
      this.isCapturingState = false;
    }
  }

  // Compare two canvas states
  statesAreEqual(state1, state2) {
    try {
      return JSON.stringify(state1) === JSON.stringify(state2);
    } catch (error) {
      console.error('Error comparing states:', error);
      return false;
    }
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
        CanvasGlobals.canvas.renderAll();
        
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

  // Get state history information
  getStateHistoryInfo() {
    return {
      totalEntries: this.stateHistory.length,
      currentIndex: this.currentStateIndex,
      canUndo: this.currentStateIndex > 0,
      canRedo: this.currentStateIndex < this.stateHistory.length - 1,
      currentEntry: this.stateHistory[this.currentStateIndex] || null
    };
  }

  // Get summary of state history
  getStateHistorySummary() {
    return this.stateHistory.map((entry, index) => ({
      index,
      action: entry.action,
      description: entry.description,
      timestamp: entry.timestamp,
      isCurrent: index === this.currentStateIndex
    }));
  }

  // Utility function to manually track specific changes
  trackChange(description) {
    this.trackMetadataChange('manualChange', description);
  }

  // Utility function to track text changes
  trackTextChange(objectId, oldText, newText) {
    this.trackMetadataChange('textChanged', `Text changed from "${oldText}" to "${newText}"`);
  }

  // Utility function to track color changes
  trackColorChange(objectId, property, oldColor, newColor) {
    this.trackMetadataChange('colorChanged', `${property} changed from ${oldColor} to ${newColor}`);
  }

  // Utility function to track symbol changes
  trackSymbolChange(objectId, oldSymbol, newSymbol) {
    this.trackMetadataChange('symbolChanged', `Symbol changed from "${oldSymbol}" to "${newSymbol}"`);
  }

  // Utility method to check if an object has anchor relationships
  objectHasAnchorRelationships(properties) {
    return !!(properties.lockXToPolygon && Object.keys(properties.lockXToPolygon).length > 0) ||
           !!(properties.lockYToPolygon && Object.keys(properties.lockYToPolygon).length > 0) ||
           !!(properties.anchoredPolygon && properties.anchoredPolygon.length > 0);
  }

  // Utility method to log anchor relationships for debugging
  logAnchorRelationships(objectId, properties) {
    if (this.objectHasAnchorRelationships(properties)) {
      console.log(`Object ${objectId} has anchor relationships:`, {
        lockXToPolygon: properties.lockXToPolygon,
        lockYToPolygon: properties.lockYToPolygon,
        anchoredPolygon: properties.anchoredPolygon
      });
    }
  }

  // Enhanced utility method for tracking anchor state changes
  trackAnchorChange(description, sourceObjectId, targetObjectId, axis, spacing) {
    this.trackMetadataChange('anchorChange', 
      `${description}: ${sourceObjectId} -> ${targetObjectId} (${axis}, spacing: ${spacing})`
    );
  }

  // Enhanced utility method for tracking anchor removal
  trackAnchorRemoval(description, sourceObjectId, targetObjectId, axis) {
    this.trackMetadataChange('anchorRemoval', 
      `${description}: ${sourceObjectId} -/-> ${targetObjectId} (${axis})`
    );
  }

  // ENHANCED PROPERTY TRACKING METHODS

  // Capture detailed object properties for each object at current state
  captureObjectProperties() {
    if (!CanvasGlobals.canvas) return {};

    const objectProperties = {};
    const objects = CanvasGlobals.canvas.getObjects();

    objects.forEach(obj => {
      if (obj.id && obj.id !== 'grid') { // Skip grid and objects without IDs
        objectProperties[obj.id] = this.extractObjectProperties(obj);
      }
    });

    return objectProperties;
  }
  // Extract comprehensive properties from a single object
  extractObjectProperties(obj) {
    const properties = {
      // Basic Fabric.js properties
      id: obj.id,
      type: obj.type,
      left: obj.left,
      top: obj.top,
      width: obj.width,
      height: obj.height,
      scaleX: obj.scaleX,
      scaleY: obj.scaleY,
      angle: obj.angle,
      opacity: obj.opacity,
      visible: obj.visible,
      selectable: obj.selectable,
      
      // Color and styling properties
      fill: obj.fill,
      stroke: obj.stroke,
      strokeWidth: obj.strokeWidth,
      strokeDashArray: obj.strokeDashArray,
      
      // Text properties (if applicable)
      text: obj.text,
      fontFamily: obj.fontFamily,
      fontSize: obj.fontSize,
      fontWeight: obj.fontWeight,
      fontStyle: obj.fontStyle,
      textAlign: obj.textAlign,
      lineHeight: obj.lineHeight,
      charSpacing: obj.charSpacing,
      
      // Custom application properties
      objectType: obj.constructor.name, // Important: this tells us how to recreate the object
      functionalType: obj.functionalType,
      symbol: obj.symbol,
      symbolType: obj.symbolType, // For SymbolObject
      txtChar: obj.txtChar,
      insertionPoint: obj.insertionPoint,
      vertex: obj.vertex,
      refTopLeft: obj.refTopLeft,
      xHeight: obj.xHeight,
      canvasID: obj.canvasID,
      lockXToPolygon: obj.lockXToPolygon,
      lockYToPolygon: obj.lockYToPolygon,
      borderGroup: obj.borderGroup,
      mainRoad: obj.mainRoad,
      basePolygon: obj.basePolygon,
      anchoredPolygon: obj.anchoredPolygon,
      
      // Additional properties for different object types
      color: obj.color, // For TextObject and SymbolObject
      font: obj.font, // For TextObject
      symbolAngle: obj.symbolAngle, // For SymbolObject
      
      // Capture timestamp for this property snapshot
      timestamp: new Date().toISOString()
    };

    // Remove undefined properties to keep the data clean
    Object.keys(properties).forEach(key => {
      if (properties[key] === undefined) {
        delete properties[key];
      }
    });

    return properties;
  }

  // Enhanced state capture that includes detailed object properties
  captureDetailedState(action, description) {
    if (this.isCapturingState) return;
    
    this.isCapturingState = true;
    
    try {
      const canvasState = this.captureCanvasState();
      const objectProperties = this.captureObjectProperties();
      
      if (!canvasState) {
        console.warn('Failed to capture canvas state');
        return;
      }

      // Check if the new state is different from the current one
      if (this.currentStateIndex >= 0 && this.stateHistory[this.currentStateIndex]) {
        const lastEntry = this.stateHistory[this.currentStateIndex];
        if (this.statesAreEqual(canvasState, lastEntry.canvasState) && 
            this.objectPropertiesAreEqual(objectProperties, lastEntry.objectProperties)) {
          return; // No change, don't add to history
        }
      }

      // Remove any future history if we're not at the end
      if (this.currentStateIndex < this.stateHistory.length - 1) {
        this.stateHistory = this.stateHistory.slice(0, this.currentStateIndex + 1);
      }

      // Add new detailed state to history
      const historyEntry = {
        timestamp: new Date().toISOString(),
        action: action,
        canvasState: canvasState,
        objectProperties: objectProperties,
        description: description || action,
        objectCount: Object.keys(objectProperties).length
      };

      this.stateHistory.push(historyEntry);
      this.currentStateIndex = this.stateHistory.length - 1;

      // Limit history size
      if (this.stateHistory.length > this.maxStateHistory) {
        this.stateHistory.shift();
        this.currentStateIndex--;
      }

      this.notifyHistoryChanged();
      console.log(`Captured detailed state: ${description || action} (${Object.keys(objectProperties).length} objects)`);
    } catch (error) {
      console.error('Error capturing detailed state:', error);
    } finally {
      this.isCapturingState = false;
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

  // Apply properties to a specific object
  applyPropertiesToObject(objectId, properties) {
    if (!CanvasGlobals.canvas || !properties) return false;

    const obj = CanvasGlobals.canvas.getObjects().find(o => o.id === objectId);
    if (!obj) {
      console.warn(`Object with ID ${objectId} not found`);
      return false;
    }

    try {
      // Apply each property to the object
      Object.keys(properties).forEach(key => {
        if (key !== 'id' && key !== 'timestamp' && properties[key] !== undefined) {
          obj.set(key, properties[key]);
        }
      });

      // Trigger object update
      obj.setCoords();
      CanvasGlobals.canvas.renderAll();
      
      console.log(`Applied properties to object ${objectId}:`, properties);
      return true;
    } catch (error) {
      console.error(`Error applying properties to object ${objectId}:`, error);
      return false;
    }
  }  // Regenerate a specific object from stored properties using proper object creation system
  regenerateObjectFromProperties(objectId, properties) {
    if (!CanvasGlobals.canvas || !properties) return false;

    try {
      // Remove existing object if it exists
      const existingObj = CanvasGlobals.canvas.getObjects().find(o => o.id === objectId);
      if (existingObj) {
        CanvasGlobals.canvas.remove(existingObj);
        
        // Remove from global array too
        if (CanvasGlobals.canvasObject) {
          const index = CanvasGlobals.canvasObject.findIndex(o => o.id === objectId);
          if (index !== -1) {
            CanvasGlobals.canvasObject.splice(index, 1);
          }
        }
      }

      // Try to use ObjectBuilderFactory if available
      if (ObjectBuilderFactory) {
        return this._createObjectUsingFactory(objectId, properties);
      } else {
        // Wait a bit for the dynamic import to complete, then try again
        setTimeout(() => {
          if (ObjectBuilderFactory) {
            this._createObjectUsingFactory(objectId, properties);
          } else {
            console.log('ObjectBuilderFactory not available, using fallback');
            this._createBasicFabricObject(objectId, properties);
          }
        }, 100);
        return true;
      }
    } catch (error) {
      console.error(`Error regenerating object ${objectId}:`, error);
      return false;
    }
  }

  // Create object using the proper ObjectBuilderFactory system
  _createObjectUsingFactory(objectId, properties) {
    try {
      // Determine object type from properties or use BaseGroup as fallback
      const objectType = properties.objectType || 'BaseGroup';
      
      // Prepare constructor options from properties
      const constructorOptions = { ...properties };
      
      // Remove properties that shouldn't be in constructor options
      delete constructorOptions.timestamp;
      delete constructorOptions.id;
      delete constructorOptions.type; // This is fabric type, not our objectType
      
      // Handle different object types properly
      switch (objectType) {
        case 'TextObject':
          // For TextObject, ensure we have the required properties
          constructorOptions.text = properties.text || '';
          constructorOptions.xHeight = properties.xHeight || 100;
          constructorOptions.color = properties.fill || properties.color || '#ffffff';
          constructorOptions.font = properties.fontFamily || properties.font || 'TransportMedium';
          constructorOptions.left = properties.left || 0;
          constructorOptions.top = properties.top || 0;
          break;

        case 'SymbolObject':
          // For SymbolObject, ensure we have the required properties
          constructorOptions.symbolType = properties.symbol || properties.symbolType;
          constructorOptions.xHeight = properties.xHeight || 100;
          constructorOptions.color = properties.fill || properties.color || 'White';
          constructorOptions.symbolAngle = properties.angle || properties.symbolAngle || 0;
          constructorOptions.left = properties.left || 0;
          constructorOptions.top = properties.top || 0;
          break;

        case 'BaseGroup':
        default:
          // For BaseGroup and others, use properties as-is
          constructorOptions.functionalType = properties.functionalType || 'BaseGroup';
          break;
      }

      // Create the object using the proper factory system
      const newObj = ObjectBuilderFactory.create(objectType, properties, null, constructorOptions);
      
      if (newObj) {
        // Apply any additional properties that might not be handled by constructor
        Object.keys(properties).forEach(key => {
          if (key !== 'objectType' && key !== 'timestamp' && key !== 'id' && 
              properties[key] !== undefined && newObj.set) {
            try {
              newObj.set(key, properties[key]);
            } catch (e) {
              // Skip properties that can't be set
            }
          }
        });

        // Ensure the object has the correct ID
        if (properties.id) {
          newObj.id = properties.id;
        }

        // Update coordinates and render
        if (newObj.setCoords) {
          newObj.setCoords();
        }
        CanvasGlobals.canvas.renderAll();
        
        console.log(`Regenerated ${objectType} object ${objectId} from properties using ObjectBuilderFactory`);
        return true;
      } else {
        console.error(`Failed to create ${objectType} object using ObjectBuilderFactory`);
        return this._createBasicFabricObject(objectId, properties);
      }
    } catch (error) {
      console.error(`Error creating object using factory:`, error);
      return this._createBasicFabricObject(objectId, properties);
    }
  }

  // Fallback method for creating basic fabric objects when build system is not available
  _createBasicFabricObject(objectId, properties) {
    let newObj = null;

    try {
      switch (properties.type) {
        case 'text':
        case 'i-text':
          newObj = new fabric.IText(properties.text || '', {
            left: properties.left,
            top: properties.top,
            fontFamily: properties.fontFamily,
            fontSize: properties.fontSize,
            fontWeight: properties.fontWeight,
            fontStyle: properties.fontStyle,
            fill: properties.fill,
            textAlign: properties.textAlign
          });
          break;

        case 'rect':
          newObj = new fabric.Rect({
            left: properties.left,
            top: properties.top,
            width: properties.width,
            height: properties.height,
            fill: properties.fill,
            stroke: properties.stroke,
            strokeWidth: properties.strokeWidth
          });
          break;

        case 'circle':
          newObj = new fabric.Circle({
            left: properties.left,
            top: properties.top,
            radius: properties.radius || Math.min(properties.width, properties.height) / 2,
            fill: properties.fill,
            stroke: properties.stroke,
            strokeWidth: properties.strokeWidth
          });
          break;

        case 'polygon':
          newObj = new fabric.Polygon(properties.points || [], {
            left: properties.left,
            top: properties.top,
            fill: properties.fill,
            stroke: properties.stroke,
            strokeWidth: properties.strokeWidth
          });
          break;

        default:
          console.warn(`Cannot create fallback object for type: ${properties.type}`);
          return false;
      }

      if (newObj) {
        // Apply all other properties
        Object.keys(properties).forEach(key => {
          if (key !== 'type' && key !== 'timestamp' && key !== 'id' && properties[key] !== undefined) {
            try {
              newObj.set(key, properties[key]);
            } catch (e) {
              // Skip properties that can't be set
            }
          }
        });

        // Set the ID
        if (properties.id) {
          newObj.id = properties.id;
        }

        // Add to canvas
        CanvasGlobals.canvas.add(newObj);
        
        // Update global object array if it exists
        if (CanvasGlobals.canvasObject && !CanvasGlobals.canvasObject.find(o => o.id === objectId)) {
          CanvasGlobals.canvasObject.push(newObj);
        }

        CanvasGlobals.canvas.renderAll();
        console.log(`Created fallback fabric object ${objectId}`);
        return true;
      }
    } catch (error) {
      console.error(`Error creating fallback object ${objectId}:`, error);
      return false;
    }

    return false;
  }  // Restore objects from property snapshots (alternative to full canvas restoration)
  restoreFromObjectProperties(objectProperties) {
    if (!CanvasGlobals.canvas || !objectProperties) return false;

    this.isCapturingState = true; // Prevent tracking during restore

    // Store original anchor tree state to restore later
    let originalUpdateInProgressX = false;
    let originalUpdateInProgressY = false;
    let originalUpdatedObjectsX = null;
    let originalUpdatedObjectsY = null;

    try {
      // Temporarily disable anchor group updates during restoration
      if (globalAnchorTree) {
        originalUpdateInProgressX = globalAnchorTree.updateInProgressX;
        originalUpdateInProgressY = globalAnchorTree.updateInProgressY;
        originalUpdatedObjectsX = new Set(globalAnchorTree.updatedObjectsX);
        originalUpdatedObjectsY = new Set(globalAnchorTree.updatedObjectsY);
        
        // Mark as "update in progress" to prevent anchor group updates
        globalAnchorTree.updateInProgressX = true;
        globalAnchorTree.updateInProgressY = true;
        globalAnchorTree.updatedObjectsX.clear();
        globalAnchorTree.updatedObjectsY.clear();
        
        console.log('Disabled anchor group updates during restoration');
      }

      // Get current objects for comparison
      const currentObjects = new Set(CanvasGlobals.canvas.getObjects().map(o => o.id).filter(id => id && id !== 'grid'));
      const targetObjects = new Set(Object.keys(objectProperties));

      // Remove objects that shouldn't exist in target state
      currentObjects.forEach(objectId => {
        if (!targetObjects.has(objectId)) {
          const obj = CanvasGlobals.canvas.getObjects().find(o => o.id === objectId);
          if (obj) {
            CanvasGlobals.canvas.remove(obj);
            // Remove from global array too
            if (CanvasGlobals.canvasObject) {
              const index = CanvasGlobals.canvasObject.findIndex(o => o.id === objectId);
              if (index !== -1) {
                CanvasGlobals.canvasObject.splice(index, 1);
              }
            }
          }
        }
      });

      // Update or create objects to match target properties
      Object.keys(objectProperties).forEach(objectId => {
        const properties = objectProperties[objectId];
        const existingObj = CanvasGlobals.canvas.getObjects().find(o => o.id === objectId);

        if (existingObj) {
          // Apply properties to existing object with anchor preservation
          this.applyPropertiesToObjectWithAnchorPreservation(objectId, properties);
        } else {
          // Regenerate missing object with anchor preservation
          this.regenerateObjectFromPropertiesWithAnchorPreservation(objectId, properties);
        }
      });

      CanvasGlobals.canvas.renderAll();
      console.log(`Restored ${Object.keys(objectProperties).length} objects from properties with anchor preservation`);
      return true;
    } catch (error) {
      console.error('Error restoring from object properties:', error);
      return false;
    } finally {
      // Restore original anchor tree state
      if (globalAnchorTree) {
        globalAnchorTree.updateInProgressX = originalUpdateInProgressX;
        globalAnchorTree.updateInProgressY = originalUpdateInProgressY;
        globalAnchorTree.updatedObjectsX = originalUpdatedObjectsX;
        globalAnchorTree.updatedObjectsY = originalUpdatedObjectsY;
        
        console.log('Restored anchor tree state after restoration');
      }
      
      this.isCapturingState = false;
    }
  }

  // Get properties of a specific object at a specific state index
  getObjectPropertiesAtState(objectId, stateIndex = this.currentStateIndex) {
    if (stateIndex < 0 || stateIndex >= this.stateHistory.length) return null;
    
    const state = this.stateHistory[stateIndex];
    return state.objectProperties && state.objectProperties[objectId] || null;
  }

  // Get all property changes for a specific object across history
  getObjectPropertyHistory(objectId) {
    const history = [];
    
    this.stateHistory.forEach((state, index) => {
      if (state.objectProperties && state.objectProperties[objectId]) {
        history.push({
          stateIndex: index,
          timestamp: state.timestamp,
          action: state.action,
          description: state.description,
          properties: state.objectProperties[objectId]
        });
      }
    });
    
    return history;
  }

  // Override the original trackMetadataChange to use detailed state capture
  trackMetadataChange(action, description) {
    if (this.isCapturingState) return;
    
    // Schedule a detailed state capture (debounced to avoid too many captures)
    if (this.pendingStateCapture) {
      clearTimeout(this.pendingStateCapture);
    }

    this.pendingStateCapture = setTimeout(() => {
      this.captureDetailedState(action, description);
      this.pendingStateCapture = false;
    }, 100); // 100ms delay
  }

  // Apply properties to a specific object with anchor preservation
  applyPropertiesToObjectWithAnchorPreservation(objectId, properties) {
    if (!CanvasGlobals.canvas || !properties) return false;

    const obj = CanvasGlobals.canvas.getObjects().find(o => o.id === objectId);
    if (!obj) {
      console.warn(`Object with ID ${objectId} not found for anchor-preserved property application`);
      return false;
    }

    try {
      // Store original updateAllCoord method to prevent anchor propagation
      const originalUpdateAllCoord = obj.updateAllCoord;
      const originalSetCoords = obj.setCoords;
      
      // Temporarily disable updateAllCoord and setCoords to prevent anchor updates
      obj.updateAllCoord = function() { /* no-op during restoration */ };
      obj.setCoords = function() { /* no-op during restoration */ };

      // Apply each property to the object
      Object.keys(properties).forEach(key => {
        if (key !== 'id' && key !== 'timestamp' && properties[key] !== undefined) {
          // For anchor properties, apply them directly without triggering updates
          if (key === 'lockXToPolygon' || key === 'lockYToPolygon' || key === 'anchoredPolygon') {
            obj[key] = properties[key];
          } else {
            obj.set(key, properties[key]);
          }
        }
      });

      // Restore original methods
      obj.updateAllCoord = originalUpdateAllCoord;
      obj.setCoords = originalSetCoords;
      
      // Now call setCoords once to update coordinates without anchor propagation
      if (obj.setCoords) {
        obj.setCoords();
      }
      
      console.log(`Applied anchor-preserved properties to object ${objectId}`);
      return true;
    } catch (error) {
      console.error(`Error applying anchor-preserved properties to object ${objectId}:`, error);
      return false;
    }
  }

  // Regenerate a specific object from stored properties with anchor preservation
  regenerateObjectFromPropertiesWithAnchorPreservation(objectId, properties) {
    if (!CanvasGlobals.canvas || !properties) return false;

    try {
      // Remove existing object if it exists
      const existingObj = CanvasGlobals.canvas.getObjects().find(o => o.id === objectId);
      if (existingObj) {
        CanvasGlobals.canvas.remove(existingObj);
        
        // Remove from global array too
        if (CanvasGlobals.canvasObject) {
          const index = CanvasGlobals.canvasObject.findIndex(o => o.id === objectId);
          if (index !== -1) {
            CanvasGlobals.canvasObject.splice(index, 1);
          }
        }
      }

      // Use the regular regeneration method but with anchor preservation context
      // (The anchor tree is already disabled in the calling method)
      const success = this.regenerateObjectFromProperties(objectId, properties);
      
      if (success) {
        // After regeneration, ensure anchor properties are correctly applied
        const newObj = CanvasGlobals.canvas.getObjects().find(o => o.id === objectId);
        if (newObj && (properties.lockXToPolygon || properties.lockYToPolygon || properties.anchoredPolygon)) {
          // Directly set anchor properties without triggering updates
          if (properties.lockXToPolygon) {
            newObj.lockXToPolygon = properties.lockXToPolygon;
          }
          if (properties.lockYToPolygon) {
            newObj.lockYToPolygon = properties.lockYToPolygon;
          }
          if (properties.anchoredPolygon) {
            newObj.anchoredPolygon = properties.anchoredPolygon;
          }
          
          console.log(`Applied anchor properties to regenerated object ${objectId}`);
        }
      }
      
      return success;
    } catch (error) {
      console.error(`Error regenerating object with anchor preservation ${objectId}:`, error);
      return false;
    }
  }
}

// Add to the global scope
window.CanvasTracker = CanvasTracker;


// Initialize canvas tracker to monitor object creation, deletion, and modification
const canvasTracker = new CanvasTracker();

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