import { CanvasGlobals } from "./canvas.js";
import { ShowHideSideBarEvent } from "./keyboardEvents.js";
import { cursorClickMode } from "./contexMenu.js";
import { i18n } from '../i18n/i18n.js';

const canvas = CanvasGlobals.canvas; // Access the global canvas object

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

  // Support passing translation keys or raw text; i18n.t falls back to the same string if key missing
  try {
    promptBox.innerText = i18n.t(text);
  } catch (_) {
    promptBox.innerText = text;
  }
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
        answerBox.parentElement.appendChild(unitDisplay);
      }

      // Set the unit display text and make it visible
      unitDisplay.innerText = currentUnit;
      unitDisplay.style.display = 'block';

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
          unitDisplay.style.display = 'none';
        }
        resolve(result);
        hideTextBox();
        cleanupListeners();
      };

      const handleCancelClick = () => {
        if (unitDisplay) {
          unitDisplay.style.display = 'none';
        }
        resolve(null);
        hideTextBox();
        cleanupListeners();
      };

      const handleKeyDown = function(event) {
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
            unitDisplay.style.display = 'none';
          }
          resolve(result);
          hideTextBox();
          cleanupListeners();
        } else if (event.key === 'Escape') {
          if (unitDisplay) {
            unitDisplay.style.display = 'none';
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

async function selectObjectHandler(text, callback, options = null, xHeight = null, unit = 'mm') {
  // prompt for user to select shape
  const response = await showTextBox(text, ' ', 'keydown', null, xHeight, unit)
  // Check if the response is null (user pressed 'Esc')
  if (response === null) {
    hideTextBox();
    return;
  }
  // Update text box position to follow the cursor 
  //cursorClickMode = 'select'
  // Periodically check if shape is selected 
  const checkShapeInterval = setInterval(() => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0 && response !== '') {
      //cursorClickMode = 'normal'
      clearInterval(checkShapeInterval)
      hideTextBox()
      const successSelected = canvas.getActiveObjects()
      // Clear the selected object from active
      canvas.discardActiveObject();
      canvas.renderAll();
      callback(successSelected, options, response, xHeight);
    }
  }, 100); // Check every 100ms
}

export { showTextBox, hideTextBox, selectObjectHandler };