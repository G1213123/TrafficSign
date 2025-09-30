import { CanvasGlobals } from "./canvas.js";
import { ShowHideSideBarEvent } from "./keyboardEvents.js";
import { cursorClickMode } from "./contexMenu.js";
import { i18n } from '../i18n/i18n.js';

const canvas = CanvasGlobals.canvas; // Access the global canvas object

// Configurable prompt keyword emphasis
const PromptHighlight = {
  terms: new Set(["width", "height", "寬度", "高度"]),
  set(terms) {
    this.terms = new Set((terms || []).map((s) => String(s).toLowerCase()));
  },
  add(...terms) {
    terms.forEach((t) => this.terms.add(String(t).toLowerCase()));
  },
  clear() {
    this.terms.clear();
  },
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function emphasizePromptText(s) {
  if (!s) return "";
  const escaped = i18n.t(escapeHtml(s));
  if (!PromptHighlight.terms || PromptHighlight.terms.size === 0) {
    return escaped;
  }
  const pattern = Array.from(PromptHighlight.terms)
    .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|");
  const regex = new RegExp(pattern, "gi");
  return escaped.replace(escaped.match(regex), (m) => `<span class="prompt-keyword">${m.toUpperCase()}</span>`);
}

function updatePosition(event) {
  const promptBox = document.getElementById('cursorBoxContainer');
  const promptText = document.getElementById('cursorTextBox');
  const answerBox = document.getElementById('cursorAnswerBox');

  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  // Get cursor box dimensions
  const boxWidth = promptBox.offsetWidth;
  const boxHeight = promptBox.offsetHeight;

  // Default offset
  let xOffset = 10;
  let yOffset = 10;

  // Check if box would overflow right edge
  if (event.clientX + xOffset + boxWidth > viewportWidth) {
    // Position to the left of cursor instead
    xOffset = -boxWidth - 10;
  }

  // Check if box would overflow bottom edge
  if (event.clientY + yOffset + boxHeight > viewportHeight) {
    // Position above cursor instead
    yOffset = -boxHeight - 10;
  }

  // Apply the position
  promptBox.style.left = `${event.clientX + xOffset}px`;
  promptBox.style.top = `${event.clientY + yOffset}px`;
}

document.addEventListener('mousemove', updatePosition);

function answerBoxFocus(event) {
  const answerBox = document.getElementById('cursorAnswerBox');
  if (answerBox.style.display === 'block') {
    answerBox.focus();
  }
}

document.addEventListener('mouseup', answerBoxFocus);


function showTextBox(text, withAnswerBox = null, event = 'keydown', callback = null, xHeight = null, unit = 'sw') {
  const promptBox = document.getElementById('cursorTextBox');
  const answerBox = document.getElementById('cursorAnswerBox');
  const enterButton = document.getElementById('cursorEnterButton');
  const cancelButton = document.getElementById('cursorCancelButton');

  // Emphasize configured keywords (defaults to WIDTH/HEIGHT)
  promptBox.innerHTML = emphasizePromptText(i18n.t(text));
  promptBox.style.display = 'block';
  document.removeEventListener('keydown', ShowHideSideBarEvent);

  // Unit handling variables
  let currentUnit = unit;
  let unitDisplay = null;
  let inputValue = '';

  if (withAnswerBox !== null) {
    answerBox.style.display = 'block';
    if (enterButton && cancelButton) {
      if (window.innerWidth <= 600) { // Check for mobile screen width
        enterButton.style.display = 'block';
        cancelButton.style.display = 'block';
      } else {
        enterButton.style.display = 'none';
        cancelButton.style.display = 'none';
      }
    }
    answerBox.value = withAnswerBox;
    answerBox.focus();
    answerBox.select();

    // Set up unit display if xHeight is provided
      if (xHeight !== null) {
      // Create or get unit display element
      unitDisplay = document.getElementById('unit-display');
        if (!unitDisplay) {
        unitDisplay = document.createElement('span');
        unitDisplay.id = 'unit-display';
          unitDisplay.className = 'unit-display'; // Use the class from CSS
          const parent = answerBox.parentElement;
          if (parent) {
            parent.classList?.add('unit-wrapper');
            parent.appendChild(unitDisplay);
          }
      }

  // Set the unit display text and make it visible
  unitDisplay.textContent = currentUnit;
  unitDisplay.classList.add('visible');

      // Initial setup
      inputValue = withAnswerBox;
    }

    // Handle user input and resolve the answer
    return new Promise((resolve) => {
      const enterButton = document.getElementById('cursorEnterButton'); // Get buttons inside promise
      const cancelButton = document.getElementById('cursorCancelButton');

      const cleanupListeners = () => {
        answerBox.removeEventListener('keydown', handleKeyDown);
        if (enterButton) {
          enterButton.removeEventListener('click', handleEnterClick);
        }
        if (cancelButton) {
          cancelButton.removeEventListener('click', handleCancelClick);
        }
      };

      const handleEnterClick = () => {
        let result = answerBox.value;
        if (xHeight !== null && unitDisplay && !isNaN(parseFloat(result))) {
          if (currentUnit === 'sw') {
            result = String(parseFloat(result) * xHeight / 4);
          }
        }
        if (unitDisplay) {
          unitDisplay.classList.remove('visible');
        }
        resolve(result);
        hideTextBox();
        cleanupListeners();
      };

      const handleCancelClick = () => {
        if (unitDisplay) {
          unitDisplay.classList.remove('visible');
        }
        resolve(null);
        hideTextBox();
        cleanupListeners();
      };

      const handleKeyDown = function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          let result = answerBox.value;
          // Convert units if in unit mode
          if (xHeight !== null && unitDisplay && !isNaN(parseFloat(result))) {
            if (currentUnit === 'sw') {
              // Convert from sw to mm (1 mm = 1 sw * xHeight / 4)
              result = String(parseFloat(result) * xHeight / 4);
            }
          }
          if (unitDisplay) {
            unitDisplay.classList.remove('visible');
          }
          resolve(result);
          hideTextBox();
          cleanupListeners();
        } else if (event.key === 'Escape') {
          if (unitDisplay) {
            unitDisplay.classList.remove('visible');
          }
          resolve(null);
          hideTextBox();
          cleanupListeners();
        } else if (event.key === 'Tab' && xHeight !== null && unitDisplay) {
          // Switch between mm and sw units on Tab key press
          event.preventDefault();
          currentUnit = currentUnit === 'mm' ? 'sw' : 'mm';

          // Convert the current value between units
          if (!isNaN(parseFloat(answerBox.value))) {
            if (currentUnit === 'sw') {
              // Convert from mm to sw
              answerBox.value = String(parseFloat(answerBox.value) * 4 / xHeight);
            } else {
              // Convert from sw to mm
              answerBox.value = String(parseFloat(answerBox.value) * xHeight / 4);
            }
          }

          unitDisplay.innerText = currentUnit;
        }
      };

      answerBox.addEventListener('keydown', handleKeyDown);
      if (enterButton && window.innerWidth <= 600) { // Check for mobile here as well for adding listener
        enterButton.addEventListener('click', handleEnterClick);
      }
      if (cancelButton && window.innerWidth <= 600) { // Check for mobile here as well for adding listener
        cancelButton.addEventListener('click', handleCancelClick);
      }
    });
  } else {
    answerBox.style.display = 'none';
    if (enterButton && cancelButton) {
      enterButton.style.display = 'none';
      cancelButton.style.display = 'none';
    }
    document.addEventListener(event, callback);
  }
}

function hideTextBox() {
  const promptBox = document.getElementById('cursorTextBox');
  const answerBox = document.getElementById('cursorAnswerBox');
  const enterButton = document.getElementById('cursorEnterButton');
  const cancelButton = document.getElementById('cursorCancelButton');

  promptBox.style.display = 'none';
  answerBox.style.display = 'none';
  if (enterButton && cancelButton) {
    enterButton.style.display = 'none';
    cancelButton.style.display = 'none';
  }
  setTimeout(() => {
    document.addEventListener('keydown', ShowHideSideBarEvent);
  }, 1000); // Delay in milliseconds (e.g., 1000ms = 1 second)
}

function selectObjectHandler(text, callback, options = null, xHeight = null, unit = 'mm', 
  skipTextBox = true, requiredTypes = null) {
  /*
    Simplified behavior:
      - Do not wait for Enter/textbox input.
      - When there are active objects, wait for the user to release any dragging,
        then pass the active objects to the callback.
      - Filter by requiredTypes if provided (all active objects must match).
  */

  // Show prompt message near cursor without answer box
  try {
    const promptTextEl = document.getElementById('cursorTextBox');
    const answerBoxEl = document.getElementById('cursorAnswerBox');
    const enterBtn = document.getElementById('cursorEnterButton');
    const cancelBtn = document.getElementById('cursorCancelButton');
    if (promptTextEl) {
      promptTextEl.innerHTML = emphasizePromptText(text || 'Select object(s)');
      promptTextEl.style.display = 'block';
    }
    if (answerBoxEl) answerBoxEl.style.display = 'none';
    if (enterBtn) enterBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.style.display = 'none';
    // Pause sidebar toggle while prompt is visible
    document.removeEventListener('keydown', ShowHideSideBarEvent);
  } catch (e) {
    // Non-fatal if UI elements are missing
  }

  const matchesRequiredType = (obj) => {
    if (!requiredTypes) return true;
    if (Array.isArray(requiredTypes)) return requiredTypes.includes(obj.functionalType);
    return obj.functionalType === requiredTypes;
  };

  let isDragging = false;
  let processed = false;
  let dragDebounceTimer = null;
  let checkInterval = null;

  const cleanup = () => {
    if (processed) return;
    // no-op; actual cleanup happens after processing
  };

  const removeListeners = () => {
    canvas.off('object:moving', onObjectMoving);
    canvas.off('mouse:up', onMouseUp);
    document.removeEventListener('keydown', onKeyDown);
    if (dragDebounceTimer) {
      clearTimeout(dragDebounceTimer);
      dragDebounceTimer = null;
    }
    if (checkInterval) {
      clearInterval(checkInterval);
    }
  };

  const processSelection = () => {
    if (processed) return;
    const active = canvas.getActiveObjects();
    if (active && active.length > 0 && active.every(matchesRequiredType)) {
      processed = true;
      removeListeners();
      hideTextBox();
      const successSelected = [...active];
      canvas.discardActiveObject();
      canvas.renderAll();
      // response is not used anymore; pass null for backward compatibility
      callback(successSelected, options, null, xHeight);
    }
  };

  const onObjectMoving = () => {
    isDragging = true;
    if (dragDebounceTimer) {
      clearTimeout(dragDebounceTimer);
      dragDebounceTimer = null;
    }
  };

  const onMouseUp = () => {
    isDragging = false;
    // Small delay to allow fabric to finalize selection geometry
    dragDebounceTimer = setTimeout(processSelection, 80);
  };

  // Attach listeners
  canvas.on('object:moving', onObjectMoving);
  canvas.on('mouse:up', onMouseUp);
  const onKeyDown = (e) => {
    if (e.key === 'Escape') {
      processed = true;
      removeListeners();
      hideTextBox();
      // Do not invoke callback; ESC acts as cancel
    }
  };
  document.addEventListener('keydown', onKeyDown);

  // If there is already an active selection and user isn't dragging,
  // process it after a brief idle delay as a fallback.
  checkInterval = setInterval(() => {
    if (!isDragging) {
      processSelection();
    }
  }, 150);
}

export { showTextBox, hideTextBox, selectObjectHandler };
// Optional API to configure emphasized terms at runtime
export const setPromptHighlightTerms = (terms) => PromptHighlight.set(terms);
export const addPromptHighlightTerms = (...terms) => PromptHighlight.add(...terms);