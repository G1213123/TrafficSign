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
          <div class="history-controls" style="display: flex; gap: 5px; margin-bottom: 10px;">
            <button type="button" id="clearHistory" class="primary-button" data-i18n="Clear">${i18n.t('Clear')}</button>
            <button type="button" id="undoBtn" class="secondary-button" data-i18n="Undo">${i18n.t('Undo')}</button>
            <button type="button" id="redoBtn" class="secondary-button" data-i18n="Redo">${i18n.t('Redo')}</button>
          </div>
          <div id="historyList" class="history-list" style="max-height: 400px; overflow-y: auto; border: 1px solid #ccc; border-radius: 4px;"></div>
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
        listContainer.innerHTML = `<div class="history-empty" style="padding: 10px; color: #666;">${i18n.t('No history')}</div>`;
        return;
    }

    // Create list items
    [...history].reverse().forEach((entry, reverseIndex) => {
        const realIndex = history.length - 1 - reverseIndex;
        const item = document.createElement('div');
        item.className = 'history-item';
        
        const isCurrent = realIndex === currentIndex;
        
        item.style.padding = '8px';
        item.style.cursor = 'pointer';
        item.style.borderBottom = '1px solid #eee';
        item.style.backgroundColor = isCurrent ? '#e3f2fd' : 'transparent';
        item.style.fontWeight = isCurrent ? 'bold' : 'normal';
        
        const time = entry.timestamp || '';
        const desc = entry.description || `State ${realIndex + 1}`;
        
        item.textContent = `${time} - ${desc}`;
        
        item.addEventListener('click', () => {
            canvasTracker.restoreState(realIndex);
        });
        
        item.addEventListener('mouseover', () => {
            if (!isCurrent) item.style.backgroundColor = '#f5f5f5';
        });
        item.addEventListener('mouseout', () => {
            if (!isCurrent) item.style.backgroundColor = 'transparent';
        });
        
        listContainer.appendChild(item);
    });
  }
}

const canvasTrackerUI = new CanvasTrackerUI();
window.canvasTrackerComponentInstance = canvasTrackerUI;

export { CanvasTrackerUI };
