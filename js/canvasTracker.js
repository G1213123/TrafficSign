// CanvasTracker utility for tracking canvas operations
(function(window) {
    class CanvasTracker {
        constructor() {
            this.history = [];
        }

        track(action, params) {
            this.history.push({
                timestamp: new Date().toISOString(),
                action,
                params
            });
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
        'modifyObject': 'Modified'
      };
      this.trackerContainer = null;
      this.undoMode = false;
    }
  
    // Initialize the tracker UI panel
    initialize() {
      document.getElementById('content-heading').textContent = 'Canvas History';
      
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
  
    // Update the history list display
    updateHistoryList() {
      const historyList = document.getElementById('historyList');
      if (!historyList) return;
      
      historyList.innerHTML = '';
      
      if (canvasTracker.history.length === 0) {
        historyList.innerHTML = '<div class="empty-history">No actions recorded yet</div>';
        return;
      }
  
      // Display history items in reverse chronological order (newest first)
      for (let i = canvasTracker.history.length - 1; i >= 0; i--) {
        const entry = canvasTracker.history[i];
        const item = document.createElement('div');
        item.className = 'history-item';
        
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
            break;
          default:
            itemContent = `${entry.action}: ${JSON.stringify(entry.params)}`;
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
      
      // Implement undo functionality based on the action type
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
      
      // Remove this entry and all newer entries (partial implementation)
      canvasTracker.history = canvasTracker.history.slice(0, index);
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