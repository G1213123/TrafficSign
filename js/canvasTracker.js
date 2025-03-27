// CanvasTracker utility for tracking canvas operations
(function(window) {
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
})(window);


// Canvas Tracker UI Component
class CanvasTrackerUI {
    constructor() {
      this.initialized = false;
      this.actionsMap = {
        'createObject': 'Created',
        'deleteObject': 'Deleted',
        'modifyObject': 'Modified',
        'anchorObject': 'Anchored'
      };
      this.trackerContainer = null;
      this.undoMode = false;
      this.chainColors = {}; // Map chain IDs to colors
      this.chainColorOptions = [
        '#3498db', // Blue
        '#e74c3c', // Red
        '#2ecc71', // Green
        '#f39c12', // Orange
        '#9b59b6', // Purple
        '#1abc9c', // Teal
        '#d35400', // Burnt Orange
        '#27ae60', // Emerald
        '#3498db', // Sky blue
        '#8e44ad'  // Violet
      ];

      // Initialize keyboard shortcuts
      this.initKeyboardShortcuts();
    }
  
    // Initialize keyboard shortcuts for undo operations
    initKeyboardShortcuts() {
      document.addEventListener('keydown', (event) => {
        // Check if Ctrl+Z was pressed
        if (event.ctrlKey && event.key === 'z') {
          // Prevent default browser undo behavior
          event.preventDefault();
          
          // Only perform undo if there's history to undo
          if (canvasTracker.history.length > 0) {
            this.performUndo();
          }
        }
      });
    }

    // Perform undo operation on the most recent history entry
    performUndo() {
      if (canvasTracker.history.length === 0) return;
      
      // Get the most recent history entry index
      const lastIndex = canvasTracker.history.length - 1;
      
      // Call the existing handleUndoClick method with the last index
      this.handleUndoClick(lastIndex);
      
      // Update the UI
      this.updateHistoryList();
    }
    
    // Initialize the tracker UI panel
    initialize() {
      GeneralHandler.PanelInit();
      
      // Create UI elements
      const form = document.getElementById('input-form');
      form.innerHTML = `
        <div class="section-header">Canvas History Tracker</div>
        <div class="section-content">
          <div class="history-controls">
            <button type="button" id="clearHistory" class="primary-button">Clear History</button>
            <button type="button" id="toggleUndoMode" class="secondary-button">Undo Mode: Off</button>
          </div>
          <div id="historyList" class="history-list"></div>
        </div>
      `;
  
      // Set up event listeners
      document.getElementById('clearHistory').addEventListener('click', () => {
        canvasTracker.clearHistory();
        this.updateHistoryList();
      });
  
      const toggleButton = document.getElementById('toggleUndoMode');
      toggleButton.addEventListener('click', () => {
        this.undoMode = !this.undoMode;
        toggleButton.textContent = `Undo Mode: ${this.undoMode ? 'On' : 'Off'}`;
        this.updateHistoryList();
      });
  
      this.initialized = true;
      this.updateHistoryList();
      
      // Store references to our UI container
      this.trackerContainer = form.innerHTML;
      
      // Register for history change notifications
      canvasTracker.addHistoryChangeCallback(() => this.updateHistoryList());
    }
  
    // Restore the tracker UI after tab switching
    restoreUI() {
      if (!this.initialized) {
        this.initialize();
        return;
      }
      
      document.getElementById('content-heading').textContent = 'Canvas History';
      const form = document.getElementById('input-form');
      form.innerHTML = this.trackerContainer;
      
      // Restore the toggle button state
      const toggleButton = document.getElementById('toggleUndoMode');
      if (toggleButton) {
        toggleButton.textContent = `Undo Mode: ${this.undoMode ? 'On' : 'Off'}`;
        toggleButton.addEventListener('click', () => {
          this.undoMode = !this.undoMode;
          toggleButton.textContent = `Undo Mode: ${this.undoMode ? 'On' : 'Off'}`;
          this.updateHistoryList();
        });
      }
      
      // Restore the clear history button event
      const clearButton = document.getElementById('clearHistory');
      if (clearButton) {
        clearButton.addEventListener('click', () => {
          canvasTracker.clearHistory();
          this.updateHistoryList();
        });
      }
      
      this.updateHistoryList();
    }

    // Assign colors to chain IDs
    assignChainColors() {
      // Get all unique chain IDs from the history
      const chainIds = canvasTracker.getUniqueChainIds();
      
      // Assign a color to each chain ID if not already assigned
      chainIds.forEach((chainId, index) => {
        if (!this.chainColors[chainId]) {
          const colorIndex = Object.keys(this.chainColors).length % this.chainColorOptions.length;
          this.chainColors[chainId] = this.chainColorOptions[colorIndex];
        }
      });
    }

    // Create a chain symbol element
    createChainSymbol(entry) {
      if (!entry.chainId) return '';

      const color = this.chainColors[entry.chainId] || '#888';
      const objectCount = canvasTracker.getChainObjectCount(entry.chainId);
      
      return `<span class="chain-symbol" style="background-color: ${color};" 
                   title="Part of a chained movement with ${objectCount} objects">
                <i class="fa fa-link"></i> ${objectCount}
              </span>`;
    }
  
    // Update the history list display
    updateHistoryList() {
      const historyList = document.getElementById('historyList');
      if (!historyList) return;
      
      historyList.innerHTML = '';
      
      if (canvasTracker.history.length === 0) {
        historyList.innerHTML = '<div class="empty-history">No actions recorded yet</div>';
        return;
      }

      // Assign colors to all chains before rendering
      this.assignChainColors();
  
      // Display history items in reverse chronological order (newest first)
      for (let i = canvasTracker.history.length - 1; i >= 0; i--) {
        const entry = canvasTracker.history[i];
        const item = document.createElement('div');
        item.className = 'history-item';
        
        // Add border color to items in a chain
        if (entry.chainId && entry.chainObjects.length > 1) {
          const color = this.chainColors[entry.chainId];
          item.style.borderLeft = `4px solid ${color}`;
        }
        
        const params = entry.params[0];
        let itemContent = '';
        
        switch (entry.action) {
          case 'createObject':
            itemContent = `${this.actionsMap[entry.action]} ${params.functionalType} (ID: ${params.id})`;
            break;
          case 'deleteObject':
            itemContent = `${this.actionsMap[entry.action]} ${params.functionalType} (ID: ${params.id})`;
            break;
          case 'modifyObject':
            itemContent = `${this.actionsMap[entry.action]} ${params.functionalType} (ID: ${params.id}) - moved (${params.deltaX.toFixed(1)}, ${params.deltaY.toFixed(1)})`;
            // Add chain symbol for linked movements
            if (entry.chainId && entry.chainObjects && entry.chainObjects.length > 1) {
              itemContent = `${this.createChainSymbol(entry)} ${itemContent}`;
            }
            break;
          case 'unlockObject':
            // Simpler display for unlock operations
            itemContent = `Unlocked ${params.functionalType} (ID: ${params.objectId}) - ${params.direction.toUpperCase()} axis`;
            break;
          case 'anchorObject':
            if (params.type === 'Anchor') {
              // Regular anchor operation - simplified display
              const sourceObj = params.source;
              const targetObj = params.target;
              
              // Create compact direction indicators
              const directions = [];
              if (params.spacingX && params.spacingX.toString() !== '') {
                directions.push('X');
              }
              if (params.spacingY && params.spacingY.toString() !== '') {
                directions.push('Y');
              }
              
              itemContent = `${this.actionsMap[entry.action]} ${sourceObj.functionalType} #${sourceObj.id} to #${targetObj.id} [${directions.join('+')}]`;
            } else if (params.type === 'EqualAnchor') {
              // Equal-distance anchor operation - simplified display
              const axis = params.axis === 'x' ? 'X' : 'Y';
              itemContent = `Equal ${axis}-anchor #${params.source1.id} <-> #${params.target1.id}`;
            } else {
              itemContent = `${entry.action}: Unknown type`;
            }
            break;
          default:
            itemContent = `${entry.action}: ${JSON.stringify(params)}`;
        }
        
        const timestamp = new Date(entry.timestamp).toLocaleTimeString();
        item.innerHTML = `
          <div class="history-item-time">${timestamp}</div>
          <div class="history-item-content">${itemContent}</div>
        `;
        
        if (this.undoMode) {
          item.classList.add('undoable');
          item.addEventListener('click', () => this.handleUndoClick(i));
        }
        
        historyList.appendChild(item);
      }
      
      // Store updated UI
      if (this.initialized) {
        this.trackerContainer = document.getElementById('input-form').innerHTML;
      }
    }
    
    // Handle clicking on an item in undo mode
    handleUndoClick(index) {
      const entry = canvasTracker.history[index];
      console.log(`Attempting to undo: ${entry.action}`);
      
      // Find the lowest index to remove (for chain operations)
      let lowestIndexToRemove = index;
      
      // Handle chain undo - if this is part of a chain, undo all items in the chain
      if (entry.chainId && entry.action === 'modifyObject') {
        const chainedEntries = canvasTracker.getChainedEntries(entry);
        
        // Find the lowest index among all chained entries
        chainedEntries.forEach(chainEntry => {
          const entryIndex = canvasTracker.history.indexOf(chainEntry);
          if (entryIndex !== -1 && entryIndex < lowestIndexToRemove) {
            lowestIndexToRemove = entryIndex;
          }
        });
        
        // Undo all linked modifications by reversing their movements
        chainedEntries.forEach(chainEntry => {
          if (chainEntry.action === 'modifyObject' && chainEntry.params && chainEntry.params[0]) {
            const modifyParams = chainEntry.params[0];
            const modifyObj = canvasObject.find(obj => obj.canvasID === modifyParams.id);
            
            if (modifyObj) {
              // Apply the reverse delta movement
              modifyObj.set({
                left: modifyObj.left - modifyParams.deltaX,
                top: modifyObj.top - modifyParams.deltaY
              });
              modifyObj.setCoords();

            }
          }
        });
        
        // Update all objects after reversing positions
        chainedEntries.forEach(chainEntry => {
          if (chainEntry.action === 'modifyObject' && chainEntry.params && chainEntry.params[0]) {
            const modifyParams = chainEntry.params[0];
            const modifyObj = canvasObject.find(obj => obj.canvasID === modifyParams.id);
            if (modifyObj) {
              modifyObj.updateAllCoord(null, [], true); // selfOnly=true to avoid triggering a new chain
            }
          }
        });
      } else if (entry.action === 'anchorObject') {
        // Handle anchor operations
        const anchorParams = entry.params[0];
        
        if (anchorParams.type === 'Anchor') {
          // Find source object (the one that's anchored to something else)
          const sourceObj = canvasObject.find(obj => obj.canvasID === anchorParams.source.id);
          
          if (sourceObj) {
            // Determine which axes to unlock (X, Y, or both)
            let unlockX = false;
            let unlockY = false;
            
            if (anchorParams.spacingX && anchorParams.spacingX.toString() !== '') {
              unlockX = true;
            }
            
            if (anchorParams.spacingY && anchorParams.spacingY.toString() !== '') {
              unlockY = true;
            }
            
            // Create a copy of the anchorageLink array to avoid modification during iteration
            const lockIconsToClick = [];
            
            // First collect all the lock icons that need to be clicked
            if (sourceObj.anchorageLink) {
              sourceObj.anchorageLink.forEach(lockIconObj => {
                if ((unlockX && lockIconObj.direction === 'x') || 
                    (unlockY && lockIconObj.direction === 'y')) {
                  lockIconsToClick.push(lockIconObj);
                }
              });
              
              // Then click each one (this modifies the anchorageLink array safely)
              lockIconsToClick.forEach(lockIcon => {
                setInterval(lockIcon.onClick(),100);
              });
            }
          }
        } else if (anchorParams.type === 'EqualAnchor') {
          // Handle equal-distance anchors (more complex)
          // First find the source objects
          const source1 = canvasObject.find(obj => obj.canvasID === anchorParams.source1.id);
          const source2 = anchorParams.source2 ? 
            canvasObject.find(obj => obj.canvasID === anchorParams.source2.id) : null;
          
          // Determine which axis to unlock
          const axis = anchorParams.axis || 'x';
          
          // Remove anchoring from first source
          if (source1 && source1.anchorageLink) {
            const lockIconsToClick = [];
            
            source1.anchorageLink.forEach(lockIconObj => {
              if (lockIconObj.direction === axis) {
                lockIconsToClick.push(lockIconObj);
              }
            });
            
            lockIconsToClick.forEach(lockIcon => {
              lockIcon.onClick();
            });
          }
          
          // Remove anchoring from second source if it exists
          if (source2 && source2.anchorageLink) {
            const lockIconsToClick = [];
            
            source2.anchorageLink.forEach(lockIconObj => {
              if (lockIconObj.direction === axis) {
                lockIconsToClick.push(lockIconObj);
              }
            });
            
            lockIconsToClick.forEach(lockIcon => {
              setInterval(lockIcon.onClick(),100);
            });
          }
        }
      } else {
        // Handle non-chained operations
        switch (entry.action) {
          case 'createObject':
            // Find and delete the created object
            const createParams = entry.params[0];
            const createObj = canvasObject.find(obj => obj.canvasID === createParams.id);
            if (createObj) {
              createObj.deleteObject();
            }
            break;
            
          case 'deleteObject':
            // Can't easily restore deleted objects without more complex state tracking
            alert("Cannot undo deletion. This requires more complex state management.");
            break;
            
          case 'modifyObject':
            // Reverse the movement
            const modifyParams = entry.params[0];
            const modifyObj = canvasObject.find(obj => obj.canvasID === modifyParams.id);
            if (modifyObj) {
              // Apply the reverse delta movement
              modifyObj.set({
                left: modifyObj.left - modifyParams.deltaX,
                top: modifyObj.top - modifyParams.deltaY
              });
              modifyObj.setCoords();
              modifyObj.updateAllCoord();
            }
            break;
        }
      }
      
      // Remove this entry and all newer entries
      canvasTracker.history = canvasTracker.history.slice(0, lowestIndexToRemove);
      this.updateHistoryList();
      canvas.renderAll();
    }
  }
  
  // Create singleton instance
  const CanvasTrackerComponent = new CanvasTrackerUI();
  
  // Event listener for the tracker button
  document.getElementById('btn_tracker').addEventListener('click', function() {
    if (CanvasTrackerComponent.initialized) {
      CanvasTrackerComponent.restoreUI();
    } else {
      CanvasTrackerComponent.initialize();
    }
  });