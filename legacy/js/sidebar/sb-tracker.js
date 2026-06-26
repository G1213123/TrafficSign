/* Canvas Tracker UI Component */
import { CanvasGlobals } from '../canvas/canvas.js';
import { canvasTracker } from '../canvas/Tracker.js';
import { i18n } from '../i18n/i18n.js';

class CanvasTrackerUI {
  constructor() {
    this.initialized = false;
    this.trackerContainer = null;
    
    // Listen for history changes
    canvasTracker.addHistoryChangeCallback(() => {
        this.updateHistoryList();
    });
  }

  initialize() {
    if (typeof window.GeneralHandler !== 'undefined' && window.GeneralHandler.PanelInit) {
        window.GeneralHandler.PanelInit();
        window.GeneralHandler.tabNum = 8;
    }

    const form = document.getElementById('input-form');
    if (!form) return;
    
    form.innerHTML = `
        <div class="section-content">
          <div class="history-controls">
            <button type="button" id="clearHistory" class="primary-button" data-i18n="Clear">${i18n.t('Clear')}</button>
            <button type="button" id="undoBtn" class="secondary-button" data-i18n="Undo">${i18n.t('Undo')}</button>
            <button type="button" id="redoBtn" class="secondary-button" data-i18n="Redo">${i18n.t('Redo')}</button>
          </div>
          <div id="historyList" class="history-list"></div>
        </div>
      `;

    const clearBtn = document.getElementById('clearHistory');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            canvasTracker.clearHistory();
        });
    }
    
    const undoBtn = document.getElementById('undoBtn');
    if (undoBtn) {
        undoBtn.addEventListener('click', () => {
            canvasTracker.undo();
        });
    }
    
    const redoBtn = document.getElementById('redoBtn');
    if (redoBtn) {
        redoBtn.addEventListener('click', () => {
            canvasTracker.redo();
        });
    }

    this.initialized = true;
    this.updateHistoryList();
    
    try { i18n.applyTranslations(form); } catch (_) {}
  }
  
  restoreUI() {
      this.initialize();
  }

  updateHistoryList() {
    const listContainer = document.getElementById('historyList');
    if (!listContainer) return;

    listContainer.innerHTML = '';
    
    // Reverse history to show newest first
    const history = canvasTracker.history;
    const currentIndex = canvasTracker.historyIndex;

    if (history.length === 0) {
        listContainer.innerHTML = `<div class="history-empty">${i18n.t('No history')}</div>`;
        return;
    }

    // Create list items
    [...history].reverse().forEach((entry, reverseIndex) => {
        const realIndex = history.length - 1 - reverseIndex;
        const isCurrent = realIndex === currentIndex;
        const item = document.createElement('div');
        item.className = 'history-item';
        if (isCurrent) {
            item.classList.add('active');
        }
        
        const time = entry.timestamp || '';
        const desc = entry.description || `State ${realIndex + 1}`;
        
        item.textContent = `${time} - ${desc}`;
        
        item.addEventListener('click', () => {
            canvasTracker.restoreState(realIndex);
        });
        
        listContainer.appendChild(item);
    });
  }
}

const canvasTrackerUI = new CanvasTrackerUI();
window.canvasTrackerComponentInstance = canvasTrackerUI;

export { CanvasTrackerUI };
