/* Canvas Tracker UI Component */
import { CanvasGlobals } from '../canvas/canvas.js';
import { canvasTracker } from '../canvas/Tracker.js';
import { i18n } from '../i18n/i18n.js';

class CanvasTrackerUI {
  constructor() {
    this.initialized = false;
    this.actionsMap = {
      'createObject': 'Created',
      'deleteObject': 'Deleted',
      'modifyObject': 'Modified',
      'anchorObject': 'Anchored',
      'propertyChanged': 'Property Changed'
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
    GeneralHandler.tabNum = 8;

    // Create UI elements
    const form = document.getElementById('input-form');
    form.innerHTML = `
        <div class="section-content">
          <div class="history-controls">
            <button type="button" id="clearHistory" class="primary-button" data-i18n="Clear History">${i18n.t('Clear History')}</button>
            <button type="button" id="toggleUndoMode" class="secondary-button" data-i18n="Undo Mode: Off">${i18n.t('Undo Mode: Off')}</button>
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
      toggleButton.textContent = this.undoMode ? i18n.t('Undo Mode: On') : i18n.t('Undo Mode: Off');
      toggleButton.setAttribute('data-i18n', this.undoMode ? 'Undo Mode: On' : 'Undo Mode: Off');
      this.updateHistoryList();
    });

    this.initialized = true;
  this.updateHistoryList();
  try { i18n.applyTranslations(form); } catch (_) {}

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

    const form = document.getElementById('input-form');
    form.innerHTML = this.trackerContainer;

    // Restore the toggle button state
    const toggleButton = document.getElementById('toggleUndoMode');
    if (toggleButton) {
      toggleButton.textContent = this.undoMode ? i18n.t('Undo Mode: On') : i18n.t('Undo Mode: Off');
      toggleButton.setAttribute('data-i18n', this.undoMode ? 'Undo Mode: On' : 'Undo Mode: Off');
      toggleButton.addEventListener('click', () => {
        this.undoMode = !this.undoMode;
        toggleButton.textContent = this.undoMode ? i18n.t('Undo Mode: On') : i18n.t('Undo Mode: Off');
        toggleButton.setAttribute('data-i18n', this.undoMode ? 'Undo Mode: On' : 'Undo Mode: Off');
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
      historyList.innerHTML = `<div class="empty-history" data-i18n="No actions recorded yet">${i18n.t('No actions recorded yet')}</div>`;
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
      if (entry.chainId && entry.chainObjects && entry.chainObjects.length > 1) {
        const color = this.chainColors[entry.chainId];
        item.style.borderLeft = `4px solid ${color}`;
      }

      const params = entry.params[0];
      let itemContent = '';      
      switch (entry.action) {
        case 'createObject':
          itemContent = `${i18n.t(this.actionsMap[entry.action])} ${params.functionalType} (ID: ${params.id})`;
          break;
        case 'deleteObject':
          itemContent = `${i18n.t(this.actionsMap[entry.action])} ${params.functionalType} (ID: ${params.id})`;
          break;
        case 'modifyObject':
          itemContent = `${i18n.t(this.actionsMap[entry.action])} ${params.functionalType} (ID: ${params.id}) - moved (${params.deltaX.toFixed(1)}, ${params.deltaY.toFixed(1)})`;
          // Add chain symbol for linked movements
          if (entry.chainId && entry.chainObjects && entry.chainObjects.length > 1) {
            itemContent = `${this.createChainSymbol(entry)} ${itemContent}`;
          }
          break;
        case 'propertyChanged':
          // Display property changes
          itemContent = `${i18n.t(this.actionsMap[entry.action])} ${params.functionalType} (ID: ${params.id}) - ${params.propertyKey}: "${params.oldValue}" \u2192 "${params.newValue}"`;
          break;
        case 'unlockObject':
          // Simpler display for unlock operations
          itemContent = `${i18n.t('Unlocked')} ${params.functionalType} (ID: ${params.id}) - ${params.direction.toUpperCase()} axis`;
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

            itemContent = `${i18n.t(this.actionsMap[entry.action])} ${sourceObj.functionalType} #${sourceObj.id} to #${targetObj.id} [${directions.join('+')}]`;
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

      const modifyParams = canvasTracker.history[lowestIndexToRemove].params[0];
      const modifyObj = CanvasGlobals.canvasObject.find(obj => obj.canvasID === modifyParams.id);

      if (modifyObj) {
        // Apply the reverse delta movement
        modifyObj.set({
          left: modifyObj.left - modifyParams.deltaX,
          top: modifyObj.top - modifyParams.deltaY
        });
        modifyObj.setCoords();
        modifyObj.updateAllCoord(null, [], true); // selfOnly=true to avoid triggering a new chain
      }

    } else if (entry.action === 'anchorObject') {
      // Handle anchor operations
      const anchorParams = entry.params[0];

      // Find source object (the one that's anchored to something else)
      const sourceObj = CanvasGlobals.canvasObject.find(obj => obj.canvasID === anchorParams.source.id);

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
            setInterval(() => lockIcon.onClick(), 100);
          });
        }
      }    } else {
      // Handle non-chained operations
      switch (entry.action) {
        case 'createObject':
          // Find and delete the created object
          const createParams = entry.params[0];
          const createObj = CanvasGlobals.canvasObject.find(obj => obj.canvasID === createParams.id);
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
          const modifyObj = CanvasGlobals.canvasObject.find(obj => obj.canvasID === modifyParams.id);
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
          case 'propertyChanged':
          // Undo property change using the tracker's method
          const success = canvasTracker.undoPropertyChange(entry);
          if (!success) {
            alert("Failed to undo property change. The object may no longer exist.");
          }
          break;
      }
    }

    // Remove this entry and all newer entries
    canvasTracker.history = canvasTracker.history.slice(0, lowestIndexToRemove);
    this.updateHistoryList();
  CanvasGlobals.scheduleRender();
  }
}





// Export the CanvasTrackerUI for use in other files
export { CanvasTrackerUI };