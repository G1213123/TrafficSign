/* General Sidebar Panel */
import { CanvasGlobals } from '../canvas/canvas.js';
import { CanvasObjectInspector } from './sb-inspector.js';
import { ShowHideSideBarEvent } from '../canvas/keyboardEvents.js'; // Import the event handler for keyboard events
import { HintLoader } from '../utils/hintLoader.js'; // Import the hint loader utility

// Handler registry for active sidebar component off-function
let GeneralHandler = {
  // Currently registered teardown handler for the active sidebar component
  activeComponentOff: null,
  tabNum: 0,
  panelOpened: true,
  ShowHideSideBar: function (event, force = null) {
    if (force === null) {
      if (document.getElementById("side-panel").className.indexOf("open") !== -1) {
        GeneralHandler.HideSideBar()
      } else {
        GeneralHandler.ShowSideBar()
      }
    } else if (force === 'on') {
      GeneralHandler.ShowSideBar()
    } else {
      GeneralHandler.HideSideBar()
    }
  },
  ShowSideBar: function () {
    document.getElementById("side-panel").className = "side-panel"
    document.getElementById("side-panel").className += " open"
    document.getElementById('show_hide').childNodes[0].className = "fa fa-angle-double-left"
    GeneralHandler.panelOpened = true
  },
  HideSideBar: function () {
    document.getElementById("side-panel").className = "side-panel"
    document.getElementById("side-panel").className += " close"
    document.getElementById('show_hide').childNodes[0].className = "fa fa-angle-double-right"
    GeneralHandler.panelOpened = false
    GeneralHandler.PanelHandlerOff()
  },  
  /**
   * Invoke and clear the registered component off handler when closing the panel
   */
  PanelHandlerOff: function() {
    if (typeof this.activeComponentOff === 'function') {
      try {
        this.activeComponentOff();
      } catch (err) {
        console.error('Error in activeComponentOff:', err);
      }
      this.activeComponentOff = null;
    }
  },
    /**
   * Register the active component off handler
   * @param {Function} handler
   */
  setActiveComponentOff: function(handler) {
    this.activeComponentOff = handler;
  },
  PanelInit: () => {
    GeneralHandler.ShowHideSideBar(null, "on")
    GeneralHandler.PanelHandlerOff()
    if (document.getElementById("side-panel").className.indexOf("open") !== -1) {
      var parent = document.getElementById("input-form");
      parent.innerHTML = ''
    }
    CanvasObjectInspector.createObjectListPanelInit()
    return parent
  },
  createNode: function (type, attribute, parent, callback, event) {
    var node = document.createElement(type);
    for (const [key, value] of Object.entries(attribute)) {
      node.setAttribute(key, value)
    }
    parent.appendChild(node);
    if (callback) {
      node.addEventListener(event, callback)
    }
    return node
  },
  createButton: function (name, labelTxt, parent, container = 'input', callback = null, event = null) {
    if (container) {
      var inputContainer = GeneralHandler.createNode("div", { 'class': `${container}-container` }, parent)
    }
    var input = GeneralHandler.createNode("button", { 'type': 'button', 'class': `${container ? container : name}-button`, 'id': name, 'placeholder': ' ' }, inputContainer ? inputContainer : parent, callback, event)
    input.innerHTML = labelTxt
    return input
  },

  createSVGButton: function (name, svg, parent, container = 'input', callback = null, event = null) {
    if (container) {
      var inputContainer = GeneralHandler.createNode("div", { 'class': `${container}-container` }, parent)
    }
    var input = GeneralHandler.createNode("button", { 'type': 'button', 'class': `${container ? container : name}-button`, 'id': name, 'placeholder': ' ' }, inputContainer ? inputContainer : parent, callback, event)

    // Add the SVG
    input.innerHTML = svg;

    // Add a separator line
    const separator = document.createElement('hr');
    separator.className = 'symbol-separator';
    input.appendChild(separator);

    // Add text label
    const textLabel = document.createElement('div');
    textLabel.className = 'symbol-label';
    textLabel.innerText = name.replace('button-', '');
    input.appendChild(textLabel);

    return input
  },
  createInput: function (name, labelTxt, parent, defaultV = null, callback = null, event = null, unit = null) {
    var inputContainer = GeneralHandler.createNode("div", { 'class': 'input-container' }, parent)
    //var labelEdge = GeneralHandler.createNode("div", { 'class': 'cut' }, inputContainer)
    var label = GeneralHandler.createNode("div", { 'class': 'placeholder', 'for': name }, inputContainer)
    
    // Create a wrapper div for input field with units if needed
    var inputWrapperClass = unit ? 'input-wrapper' : '';
    var inputWrapper = unit ? GeneralHandler.createNode("div", { 'class': inputWrapperClass }, inputContainer) : inputContainer;
    
    // Create the input element
    var inputClass = unit ? 'input with-unit' : 'input';
    var input = GeneralHandler.createNode("input", { 'type': 'text', 'class': inputClass, 'id': name, 'placeholder': ' ' }, inputWrapper, callback, event)
    
    // Add unit span if unit is specified
    if (unit) {
      var unitSpan = GeneralHandler.createNode("span", { 'class': 'input-unit' }, inputWrapper)
      unitSpan.innerHTML = unit;
    }
    
    label.innerHTML = labelTxt
    defaultV ? input.value = defaultV : input.value = ''
    return input
  },

  createSelect: function (name, labelTxt, options, parent, defaultV = null, callback = null, event = 'change') {
    var inputContainer = GeneralHandler.createNode("div", { 'class': 'input-container' }, parent)
    var label = GeneralHandler.createNode("div", { 'class': 'placeholder', 'for': name }, inputContainer)
    var input = GeneralHandler.createNode("select", { 'class': 'input', 'id': name, 'placeholder': ' ' }, inputContainer, callback, event)
    label.innerHTML = labelTxt
    for (var i = 0; i < options.length; i++) {
      var option = document.createElement("option");
      option.value = options[i];
      option.text = options[i];
      input.appendChild(option);
    }
    if (defaultV !== null) {
      input.value = defaultV;
    }
    return input
  },

  createToggle: function (name, options, parent, defaultSelected = null, callback = null, maxItemsPerRow = null) {
    // Create a container for the toggle including its label
    var inputContainer = GeneralHandler.createNode("div", { 'class': 'input-container' }, parent);

    // Create the label
    var label = GeneralHandler.createNode("div", { 'class': 'placeholder', 'for': name }, inputContainer);
    label.innerHTML = name;

    // Determine if we need multi-row layout
    const needsMultiRow = maxItemsPerRow && options.length > maxItemsPerRow;
    const containerClass = needsMultiRow ? 'toggle-container multi-row' : 'toggle-container';

    // Create a container for the toggle buttons
    var toggleContainer = GeneralHandler.createNode("div", { 'class': containerClass, 'id': name + '-container' }, inputContainer);
    
    // If multi-row, set CSS custom property for items per row
    if (needsMultiRow) {
      toggleContainer.style.setProperty('--items-per-row', maxItemsPerRow);
    }

    // Keep track of the buttons to manage their state
    let toggleButtons = [];

    // Create a button for each option
    options.forEach((option, index) => {
      let buttonId = `${name}-${index}`;
      let button = GeneralHandler.createNode("button", {
        'type': 'button',
        'class': 'toggle-button',
        'id': buttonId,
        'data-value': option
      }, toggleContainer);

      button.innerHTML = option;
      toggleButtons.push(button);

      // Add click event to handle toggle behavior
      button.addEventListener('click', function () {
        // Remove active class from all buttons
        toggleButtons.forEach(btn => {
          btn.classList.remove('active');
        });

        // Add active class to clicked button
        this.classList.add('active');
        toggleContainer.selected = this;

        // Call callback if provided
        if (callback) {
          callback(this);
        }
      });

      // Set default selected button
      if (defaultSelected !== null && option === defaultSelected) {
        button.classList.add('active');
        toggleContainer.selected = button;
      } else if (defaultSelected === null && index === 0) {
        // If no default is specified, select the first option
        button.classList.add('active');
        toggleContainer.selected = button;
      }
    });

    return toggleContainer;
  },

  /**
   * Gets the value of the active button in a toggle container
   * @param {string} containerId - The ID of the toggle container
   * @return {string|null} The value of the active button or null if not found
   */
  getToggleValue: function (containerId) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    // Method 1: Use the selected property we store on the container
    if (container.selected) {
      return container.selected.getAttribute('data-value');
    }

    // Method 2: Find the active button using DOM query (fallback)
    const activeButton = container.querySelector('.toggle-button.active');
    return activeButton ? activeButton.getAttribute('data-value') : null;
  },

  /**
   * Creates the standard basic parameters container with x-Height and Message Color inputs
   * @param {HTMLElement} parent - Parent container
   * @param {Object} componentContext - The sidebar component context (this)
   * @param {number} defaultXHeight - Optional default xHeight to use (defaults to GeneralSettings)
   * @param {string} defaultColor - Optional default color to use (defaults to GeneralSettings)
   * @param {Function} xHeightCallback - Optional callback for xHeight changes
   * @param {Function} colorCallback - Optional callback for color changes
   * @return {HTMLElement} The created container
   */  createBasicParamsContainer: function(parent, componentContext, defaultXHeight = null, defaultColor = null, xHeightCallback = null, colorCallback = null) {
    // Create a container for basic parameters
    const basicParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
    
    // Use provided defaults or fall back to GeneralSettings
    const xHeight = defaultXHeight !== null ? defaultXHeight : GeneralSettings.xHeight;
    const color = defaultColor !== null ? defaultColor : GeneralSettings.messageColor;
    
    // Create wrapper function for xHeight that calls both handlers
    const xHeightHandler = function(event) {
      // Always call the universal handler first
      GeneralHandler.handleXHeightChange(event);
      // Then call the provided callback if it exists
      if (xHeightCallback) {
        xHeightCallback(event);
      }
    };
    
    // Create wrapper function for color that calls both handlers  
    const colorHandler = function(event) {
      // Always call the universal handler first
      GeneralHandler.handleColorChange(event);
      // Then call the provided callback if it exists
      if (colorCallback) {
        colorCallback(event);
      }
    };
    
    // Create xHeight input with combined handler and unit (mm)
    const xHeightInput = GeneralHandler.createInput('input-xHeight', 'x Height', basicParamsContainer, 
      xHeight, xHeightHandler, 'input', 'mm');
      
    // Create color toggle with combined handler
    GeneralHandler.createToggle('Message Colour', ['Black', 'White'], basicParamsContainer, color, 
      colorHandler);

    // Add debounced event listener for real-time updates on xHeight input
    xHeightInput.addEventListener('input', GeneralHandler.debounce(function (e) {
      // The handleXHeightChange function will update GeneralSettings
    }, 300));
      
    return basicParamsContainer;
  },

  /**
   * Generic handler for xHeight changes that updates GeneralSettings and the relevant component
   * @param {Event} event - The input event
   */
  handleXHeightChange: function(event) {
    const xHeight = parseInt(event.target.value);
    if (!isNaN(xHeight) && xHeight > 0) {
      // Update GeneralSettings
      GeneralSettings.updateSetting('xHeight', xHeight);
      
      // The specific component update logic will be handled by the listener in each component
    }
  },

  /**
   * Generic handler for color changes that updates GeneralSettings and the relevant component
   * @param {Event} event - The button click event
   */
  handleColorChange: function(event) {
    const color = event.getAttribute('data-value');
    if (color) {
      // Update GeneralSettings
      GeneralSettings.updateSetting('messageColor', color);
      
      // The specific component update logic will be handled by the listener in each component
    }
  },
  
  /**
   * Creates a standard settings listener that updates UI elements when settings change
   * @param {number} tabNumber - The tab number for this panel
   * @param {Function} updateCallback - Optional callback for additional updates
   * @return {Function} The listener function
   */
  createSettingsListener: function(tabNumber, updateCallback = null) {
    return function(setting, value) {
      // Only update UI if we're in the correct panel
      if (GeneralHandler.tabNum === tabNumber) {
        if (setting === 'xHeight') {
          const xHeightInput = document.getElementById('input-xHeight');
          if (xHeightInput && xHeightInput.value !== value.toString()) {
            xHeightInput.value = value;
            
            // Call the custom update callback if provided
            if (updateCallback) {
              updateCallback('xHeight', value);
            }
          }
        } else if (setting === 'messageColor') {
          const messageColorContainer = document.getElementById('Message Colour-container');
          if (messageColorContainer) {
            const buttons = messageColorContainer.querySelectorAll('button');
            buttons.forEach(btn => {
              if (btn.getAttribute('data-value') === value) {
                // Simulate a click on the button if it's not already active
                if (!btn.classList.contains('active')) {
                  btn.click();
                }
              }
            });
          }
          
          // Call the custom update callback if provided
          if (updateCallback) {
            updateCallback('messageColor', value);
          }
        }
      }
    };
  },
  
  /**
   * Utility function to handle mouse move events for canvas objects
   * @param {Object} component - The sidebar component context 
   * @param {Event} event - The mouse move event
   */
  handleObjectOnMouseMove: function(component, event) {
    const objectKey = component.newTextObject ? 'newTextObject' : 
                     component.newSymbolObject ? 'newSymbolObject' : 
                     component.newMapObject ? 'newMapObject' : null;
    
    if (!objectKey || !component[objectKey] || !CanvasGlobals.activeVertex) return;
    
    const pointer = CanvasGlobals.canvas.getPointer(event.e);
    
    // If we have an active vertex, let it handle the movement
    if (CanvasGlobals.activeVertex.handleMouseMoveRef) {
      // Simulate a mouse move event with the current pointer
      const simulatedEvent = {
        e: event.e,
        pointer: pointer
      };
      CanvasGlobals.activeVertex.handleMouseMoveRef(simulatedEvent);
    } else {
      // Fallback direct positioning if vertex control isn't active
      component[objectKey].set({
        left: pointer.x,
        top: pointer.y
      });
      component[objectKey].setCoords();
      CanvasGlobals.canvas.renderAll();
    }
  },
  
  /**
   * Utility function to handle mouse click events for canvas objects
   * @param {Object} component - The sidebar component context
   * @param {Event} event - The mouse click event
   * @param {string} objectKey - Key for the object in the component (e.g., 'newTextObject')
   * @param {string} mouseMoveHandlerName - Name of the mouse move handler function
   * @param {string} mouseClickHandlerName - Name of the mouse click handler function
   * @param {string} cancelHandlerName - Name of the cancel handler function
   */
  handleObjectOnMouseClick: function(component, event, objectKey, mouseMoveHandlerName, mouseClickHandlerName, cancelHandlerName) {
    if (event.e.button !== 0 && event.e.type !== 'touchend') return;
    
    // Complete the placement if we have an active object
    if (component[objectKey]) {
      // Complete the placement
      if (CanvasGlobals.activeVertex) {
        CanvasGlobals.activeVertex.handleMouseUpRef(event);
      }

      // Clean up
      CanvasGlobals.canvas.off('mouse:move', component[mouseMoveHandlerName]);
      CanvasGlobals.canvas.off('mouse:up', component[mouseClickHandlerName]);
      CanvasGlobals.canvas.discardActiveObject();

      // Reset state
      component[objectKey].isTemporary = false;
      component[objectKey] = null;
      CanvasGlobals.activeVertex = null;

      // Reattach default keyboard event listener
      document.removeEventListener('keydown', component[cancelHandlerName]);
      document.addEventListener('keydown', ShowHideSideBarEvent);

      CanvasGlobals.canvas.renderAll();
    }
  },
  
  /**
   * Generic cancel handler for escape key
   * @param {Object} component - The sidebar component context
   * @param {Event} event - The keydown event
   * @param {string} objectKey - Key for the object in the component (e.g., 'newTextObject')
   * @param {string} mouseMoveHandlerName - Name of the mouse move handler function
   * @param {string} mouseClickHandlerName - Name of the mouse click handler function
   */
  handleCancelWithEscape: function(component, event, objectKey, mouseMoveHandlerName, mouseClickHandlerName) {
    if (event.key === 'Escape') {
      // If there's a newly created object being placed, delete it
      if (component[objectKey] && CanvasGlobals.canvas.contains(component[objectKey])) {
        component[objectKey].deleteObject();
        component[objectKey] = null;
      }

      // Clean up active vertex if there is one
      if (CanvasGlobals.activeVertex) {
        CanvasGlobals.activeVertex.cleanupDrag();
        CanvasGlobals.activeVertex = null;
      }

      // Restore event listeners
      CanvasGlobals.canvas.off('mouse:move', component[mouseMoveHandlerName]);
      CanvasGlobals.canvas.off('mouse:up', component[mouseClickHandlerName]);
      document.removeEventListener('keydown', component.cancelInput || component.cancelDraw);
      document.addEventListener('keydown', ShowHideSideBarEvent);

      CanvasGlobals.canvas.renderAll();
    }
  },

  /**
   * Creates a help icon with hints that displays content based on a toggle value
   * @param {HTMLElement} parent - Parent container to attach the help icon
   * @param {string} toggleContainerId - ID of the toggle container to monitor
   * @param {Object} contentMap - Object mapping toggle values to help content
   * @param {Object} options - Optional configuration {position: 'left'|'right'|'top'|'bottom', showDelay: number, hideDelay: number}
   * @return {HTMLElement} The created help icon element
   */
  createHelpIconWithTooltip: function(parent, toggleContainerId, contentMap, options = {}) {
    // Default options
    const defaultOptions = {
      position: 'left',   // Default hints position
      scrollable: true,   // Make hints scrollable by default
      showDelay: 200,     // Delay in milliseconds before showing hints
      hideDelay: 800      // Delay in milliseconds before hiding hints (longer linger time)
    };
    const config = Object.assign(defaultOptions, options);

    // Create help icon container
    const helpContainer = GeneralHandler.createNode("div", { 
      'class': 'help-icon-container' 
    }, parent);

    // Create the circled question mark
    const helpIcon = GeneralHandler.createNode("div", { 
      'class': 'help-icon',
      'title': 'Hover for help' // Basic fallback hints
    }, helpContainer);
    helpIcon.innerHTML = '?';
    
    // Ensure the help icon has proper styles for interaction
    helpIcon.style.pointerEvents = 'auto';
    helpIcon.style.cursor = 'help';
    helpIcon.style.zIndex = '1001';

    // Create hints element
    const hints = GeneralHandler.createNode("div", { 
      'class': `hints help-hints ${config.scrollable ? 'scrollable' : ''}` 
    }, document.body);
    
    // Store timeout references for showing and hiding hints
    let showTimeout = null;
    let hideTimeout = null;
    let isHintsVisible = false;
    
    // Function to reposition hints on window resize
    const repositionHints = () => {
      if (isHintsVisible && hints.style.opacity === '1') {
        GeneralHandler.positionTooltip(hints, helpIcon, config.position, true);
      }
    };
    
    // Add window resize listener for responsive repositioning
    window.addEventListener('resize', GeneralHandler.debounce(repositionHints, 150));
    
    // Function to get current content based on toggle value
    const getCurrentContent = () => {
      const toggleContainer = document.getElementById(toggleContainerId);
      if (!toggleContainer) return 'Help content not available';
      
      const activeValue = GeneralHandler.getToggleValue(toggleContainerId);
      return contentMap[activeValue] || 'No help available for this option';
    };

    // Function to show hints with delay
    const showHints = (event) => {
      // Clear any pending hide timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      
      // Clear any existing show timeout
      if (showTimeout) {
        clearTimeout(showTimeout);
      }
      
      // Set new timeout for showing
      showTimeout = setTimeout(() => {
        const content = getCurrentContent();
        hints.innerHTML = content;
        hints.style.visibility = 'visible';
        hints.style.opacity = '1';
        hints.style.pointerEvents = 'auto';
        isHintsVisible = true;

        // Position the hints
        GeneralHandler.positionTooltip(hints, helpIcon, config.position, true); // true = outsideSidebar
        showTimeout = null;
      }, config.showDelay);
    };

    // Function to hide hints with delay
    const hideHints = () => {
      // Clear any pending show timeout
      if (showTimeout) {
        clearTimeout(showTimeout);
        showTimeout = null;
      }
      
      // Clear any existing hide timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      
      // Set new timeout for hiding
      hideTimeout = setTimeout(() => {
        hints.style.opacity = '0';
        hints.style.pointerEvents = 'none';
        isHintsVisible = false;
        // Hide visibility after transition completes
        setTimeout(() => {
          if (hints.style.opacity === '0') {
            hints.style.visibility = 'hidden';
          }
        }, 200); // Match the CSS transition duration
        hideTimeout = null;
      }, config.hideDelay);
    };

    // Function to cancel hide and show immediately (for when mouse enters hints)
    const cancelHideAndShow = () => {
      // Clear both timeouts
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      if (showTimeout) {
        clearTimeout(showTimeout);
        showTimeout = null;
      }
      
      // Show immediately if not already visible
      if (hints.style.opacity !== '1') {
        const content = getCurrentContent();
        hints.innerHTML = content;
        hints.style.visibility = 'visible';
        hints.style.opacity = '1';
        hints.style.pointerEvents = 'auto';
        isHintsVisible = true;
        GeneralHandler.positionTooltip(hints, helpIcon, config.position, true); // true = outsideSidebar
      }
    };

    // Function to hide immediately (for when mouse leaves hints)
    const hideImmediately = () => {
      // Clear show timeout if pending
      if (showTimeout) {
        clearTimeout(showTimeout);
        showTimeout = null;
      }
      
      // Hide with the configured delay
      hideHints();
    };

    // Add event listeners for help icon with mobile compatibility
    let helpIconListeners = null;
    let hintsListeners = null;
    
    try {
      // Add mobile-compatible tooltip listeners to help icon
      helpIconListeners = GeneralHandler.addTooltipEventListeners(
        helpIcon, 
        showHints, 
        hideHints,
        {
          longPressDelay: 400,  // Slightly shorter for help icons
          hideDelay: 3000,      // Longer display time for help content
          preventScroll: true
        }
      );
      
      // Add a click event as a fallback test (still useful for debugging)
      helpIcon.addEventListener('click', function(e) {
        e.preventDefault();
        // Show hints on click as fallback
        showHints(e);
      });
    } catch (error) {
      console.error('Error attaching help icon event listeners:', error);
    }
    
    // Add event listeners for hints itself to prevent hiding when hovering over it (desktop only)
    try {
      if (GeneralHandler.supportsHover()) {
        hints.addEventListener('mouseenter', cancelHideAndShow);
        hints.addEventListener('mouseleave', hideImmediately);
      }
    } catch (error) {
      console.error('Error attaching hints event listeners:', error);
    }

    // Store reference to cleanup function
    helpIcon.cleanupTooltip = () => {
      if (showTimeout) {
        clearTimeout(showTimeout);
        showTimeout = null;
      }
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      
      // Cleanup mobile-compatible event listeners
      if (helpIconListeners) {
        helpIconListeners.cleanup();
      }
      
      // Remove hints event listeners (desktop only)
      if (GeneralHandler.supportsHover()) {
        hints.removeEventListener('mouseenter', cancelHideAndShow);
        hints.removeEventListener('mouseleave', hideImmediately);
      }
      
      // Remove resize listener
      window.removeEventListener('resize', repositionHints);
      if (document.body.contains(hints)) {
        document.body.removeChild(hints);
      }
    };

    return helpIcon;
  },

  /**
   * Creates a help icon with hint content loaded via HintLoader
   * @param {HTMLElement} parent - Parent element to append the help icon to
   * @param {string} hintPath - Path to the hint file (e.g., 'symbols/MainRoadShape')
   * @param {Object} options - Configuration options for the tooltip
   * @return {HTMLElement} The created help icon element
   */
  createHelpIconWithHint: function(parent, hintPath, options = {}) {
    // Default options
    const defaultOptions = {
      position: 'left',   // Default hints position
      scrollable: true,   // Make hints scrollable by default
      showDelay: 200,     // Delay in milliseconds before showing hints
      hideDelay: 800      // Delay in milliseconds before hiding hints (longer linger time)
    };
    const config = Object.assign(defaultOptions, options);

    // Create help icon container
    const helpContainer = GeneralHandler.createNode("div", { 
      'class': 'help-icon-container' 
    }, parent);

    // Create the circled question mark
    const helpIcon = GeneralHandler.createNode("div", { 
      'class': 'help-icon',
      'title': 'Hover for help' // Basic fallback hints
    }, helpContainer);
    helpIcon.innerHTML = '?';
    
    // Ensure the help icon has proper styles for interaction
    helpIcon.style.pointerEvents = 'auto';
    helpIcon.style.cursor = 'help';
    helpIcon.style.zIndex = '1001';

    // Create hints element
    const hints = GeneralHandler.createNode("div", { 
      'class': `hints help-hints ${config.scrollable ? 'scrollable' : ''}` 
    }, document.body);
    
    // Store timeout references for showing and hiding hints
    let showTimeout = null;
    let hideTimeout = null;
    let isHintsVisible = false;
    let hintContent = null;
    
    // Function to reposition hints on window resize
    const repositionHints = () => {
      if (isHintsVisible && hints.style.opacity === '1') {
        GeneralHandler.positionTooltip(hints, helpIcon, config.position, true);
      }
    };
    
    // Add window resize listener for responsive repositioning
    window.addEventListener('resize', GeneralHandler.debounce(repositionHints, 150));
    
    // Function to load hint content
    const loadHintContent = async () => {
      if (hintContent === null) {
        try {
          hintContent = await HintLoader.loadHint(hintPath);
        } catch (error) {
          console.warn(`Failed to load hint for ${hintPath}:`, error);
          hintContent = 'Help content not available';
        }
      }
      return hintContent;
    };

    // Function to show hints with delay
    const showHints = async (event) => {
      // Clear any pending hide timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      
      // Clear any existing show timeout
      if (showTimeout) {
        clearTimeout(showTimeout);
      }
      
      // Set new timeout for showing
      showTimeout = setTimeout(async () => {
        const content = await loadHintContent();
        hints.innerHTML = content;
        hints.style.visibility = 'visible';
        hints.style.opacity = '1';
        hints.style.pointerEvents = 'auto';
        isHintsVisible = true;

        // Position the hints
        GeneralHandler.positionTooltip(hints, helpIcon, config.position, true); // true = outsideSidebar
        showTimeout = null;
      }, config.showDelay);
    };

    // Function to hide hints with delay
    const hideHints = () => {
      // Clear any pending show timeout
      if (showTimeout) {
        clearTimeout(showTimeout);
        showTimeout = null;
      }
      
      // Clear any existing hide timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      
      // Set new timeout for hiding
      hideTimeout = setTimeout(() => {
        hints.style.opacity = '0';
        hints.style.pointerEvents = 'none';
        isHintsVisible = false;
        // Hide visibility after transition completes
        setTimeout(() => {
          if (hints.style.opacity === '0') {
            hints.style.visibility = 'hidden';
          }
        }, 200); // Match the CSS transition duration
        hideTimeout = null;
      }, config.hideDelay);
    };

    // Function to cancel hide and show immediately (for when mouse enters hints)
    const cancelHideAndShow = async () => {
      // Clear both timeouts
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      if (showTimeout) {
        clearTimeout(showTimeout);
        showTimeout = null;
      }
      
      // Show immediately if not already visible
      if (hints.style.opacity !== '1') {
        const content = await loadHintContent();
        hints.innerHTML = content;
        hints.style.visibility = 'visible';
        hints.style.opacity = '1';
        hints.style.pointerEvents = 'auto';
        isHintsVisible = true;
        GeneralHandler.positionTooltip(hints, helpIcon, config.position, true); // true = outsideSidebar
      }
    };

    // Function to hide immediately (for when mouse leaves hints)
    const hideImmediately = () => {
      // Clear show timeout if pending
      if (showTimeout) {
        clearTimeout(showTimeout);
        showTimeout = null;
      }
      
      // Hide with the configured delay
      hideHints();
    };

    // Add event listeners for help icon with mobile compatibility
    let helpIconListeners = null;
    
    try {
      // Add mobile-compatible tooltip listeners to help icon
      helpIconListeners = GeneralHandler.addTooltipEventListeners(
        helpIcon, 
        showHints, 
        hideHints,
        {
          longPressDelay: 400,  // Slightly shorter for help icons
          hideDelay: 3000,      // Longer display time for help content
          preventScroll: true
        }
      );
      
      // Add a click event as a fallback test (still useful for debugging)
      helpIcon.addEventListener('click', function(e) {
        e.preventDefault();
        // Show hints on click as fallback
        showHints(e);
      });
    } catch (error) {
      console.error('Error attaching help icon event listeners:', error);
    }
    
    // Add event listeners for hints itself to prevent hiding when hovering over it (desktop only)
    try {
      if (GeneralHandler.supportsHover()) {
        hints.addEventListener('mouseenter', cancelHideAndShow);
        hints.addEventListener('mouseleave', hideImmediately);
      }
    } catch (error) {
      console.error('Error attaching hints event listeners:', error);
    }

    // Store reference to cleanup function
    helpIcon.cleanupTooltip = () => {
      if (showTimeout) {
        clearTimeout(showTimeout);
        showTimeout = null;
      }
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      
      // Cleanup mobile-compatible event listeners
      if (helpIconListeners) {
        helpIconListeners.cleanup();
      }
      
      // Remove hints element
      if (hints && hints.parentNode) {
        hints.parentNode.removeChild(hints);
      }
      
      // Remove resize listener (this should be improved to only remove specific listener)
      // Note: This is a limitation - we can't remove specific debounced listeners easily
      // Consider using a more sophisticated event management system if needed
    };

    return helpIcon;
  },

  /**
   * Positions a hints relative to a target element
   * @param {HTMLElement} hints - The hints element
   * @param {HTMLElement} target - The target element to position relative to
   * @param {string} position - Position preference ('left', 'right', 'top', 'bottom')
   * @param {boolean} outsideSidebar - Whether to position hints outside the sidebar
   */
  positionTooltip: function(hints, target, position = 'left', outsideSidebar = false) {
    const targetRect = target.getBoundingClientRect();
    const hintsRect = hints.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Clear existing arrow classes
    hints.classList.remove('hints-arrow-left', 'hints-arrow-right', 'hints-arrow-top', 'hints-arrow-bottom');

    let left, top;

    // Detect if we're in mobile layout (screen width < 768px or sidebar has mobile positioning)
    const isMobile = viewport.width < 768;
    const sidebar = document.getElementById('side-panel');
    
    // If outsideSidebar is true, position tooltip appropriately for desktop/mobile
    if (outsideSidebar && sidebar) {
      const sidebarRect = sidebar.getBoundingClientRect();
      
      if (isMobile) {
        // Mobile: sidebar is at bottom, hints should be above it and span most of screen width
        hints.style.maxWidth = `${Math.min(600, viewport.width - 40)}px`; // Larger max width for images
        hints.style.width = `${Math.min(500, viewport.width - 40)}px`; // Larger responsive width
        
        // Position hints above the sidebar
        left = 2; // 2px from left edge
        const bottom = viewport.height - sidebarRect.top + 48; // Above sidebar with margin from bottom
        hints.style.bottom = bottom + 'px';
        hints.style.top = ''; // Clear any previous top value
        
        hints.classList.add('hints-arrow-bottom'); // Arrow pointing down to sidebar
      } else {
        // Desktop: sidebar is on left, hints to the right
        left = sidebarRect.right + 70; // Reduced margin since hints is larger
        const top =  targetRect.top; // Position so hints top aligns with target top
        hints.style.top = top + 'px';
        hints.style.bottom = ''; // Clear any previous bottom value
        hints.classList.add('hints-arrow-left');
        
        // Reset width for desktop
        hints.style.width = '';
        hints.style.maxWidth = '600px'; // Increased for larger images
      }
    } 
    
    // Ensure hints doesn't go off screen (check bottom bounds)
    const currentBottom = parseInt(hints.style.bottom);
    if (currentBottom < 10) {
      hints.style.bottom = '10px';
    } else if (currentBottom > viewport.height - 48) {
      hints.style.bottom = (viewport.height - 48) + 'px';
    }

    hints.style.left = left + 'px';
  },
  
  /**
   * Creates a new object and activates the snapping system for it
   * @param {Object} options - Configuration for the object creation
   * @param {Function} createObjectFn - Function to create the object (may be async)
   * @param {Object} component - The sidebar component context
   * @param {string} objectKey - Property name to store the object reference (e.g., 'newTextObject')
   * @param {string} vertexId - ID of the vertex to activate for snapping (e.g., 'V1', 'E1')
   * @param {Function} mouseMoveHandler - Handler function for mouse movement
   * @param {Function} mouseClickHandler - Handler function for mouse clicks
   * @param {Function} cancelHandler - Handler function for cancellation
   * @return {Promise<Object>} - A promise that resolves to the created object
   */
  createObjectWithSnapping: function(options, createObjectFn, component, objectKey, vertexId, mouseMoveHandler, mouseClickHandler, cancelHandler) {
    // Clear any existing object being placed
    if (component[objectKey]) {
      CanvasGlobals.canvas.remove(component[objectKey]);
      component[objectKey] = null;
      
      if (CanvasGlobals.activeVertex) {
        CanvasGlobals.activeVertex.cleanupDrag();
        CanvasGlobals.activeVertex = null;
      }
    }
    
    // Remove standard event listeners and add component-specific ones
    document.removeEventListener('keydown', ShowHideSideBarEvent);
    document.addEventListener('keydown', cancelHandler);
    
    // Get the center of the canvas viewport
    const vpt = CanvasGlobals.CenterCoord();
    const centerX = vpt.x;
    const centerY = vpt.y;
    
    // Set position in options
    options.position = options.position || { x: centerX, y: centerY };
    
    try {
      // Create the object - use await to handle both async and sync functions
      const newObject = createObjectFn(options);
      
      // Store reference to the object
      component[objectKey] = newObject;
      
      // Add mouse event handlers
      CanvasGlobals.canvas.on('mouse:move', mouseMoveHandler);
      CanvasGlobals.canvas.on('mouse:up', mouseClickHandler);
      
      // Set up the object for snapping
      CanvasGlobals.canvas.setActiveObject(newObject);
      newObject.enterFocusMode();
      newObject.isTemporary = true;
      
      // Activate the vertex control for snapping
      if (newObject.controls && newObject.controls[vertexId]) {
        // Get the vertex control
        CanvasGlobals.activeVertex = newObject.controls[vertexId];
        CanvasGlobals.activeVertex.isDown = true;
        CanvasGlobals.activeVertex.isDragging = true;
        
        // Store original position info
        CanvasGlobals.activeVertex.originalPosition = {
          left: newObject.left,
          top: newObject.top
        };
  
        // Get the vertex coordinates
        const vertex = newObject.getBasePolygonVertex(vertexId);
        if (vertex) {
          // Store vertex positions for snapping
          CanvasGlobals.activeVertex.vertexOriginalPosition = {
            x: vertex.x,
            y: vertex.y
          };
          
          // Calculate offset from object center to vertex
          CanvasGlobals.activeVertex.vertexOffset = {
            x: vertex.x - newObject.left,
            y: vertex.y - newObject.top
          };
          
        }
      }
      
      CanvasGlobals.canvas.renderAll();
      return newObject;
    } catch (error) {
      console.error('Error creating object with snapping:', error);
      // Clean up event listeners in case of error
      document.removeEventListener('keydown', cancelHandler);
      document.addEventListener('keydown', ShowHideSideBarEvent);
      throw error; // Re-throw to allow caller to handle the error
    }
  },
  
  /**
   * Generic panel handler off function to clean up when leaving a panel
   * @param {Object} component - The sidebar component context
   * @param {string} objectKey - Key for the object being placed (e.g., 'newTextObject')
   * @param {string} mouseMoveHandlerName - Name of the mouse move handler
   * @param {string} mouseClickHandlerName - Name of the mouse click handler
   * @param {string} cancelHandlerName - Name of the cancel handler
   */
  genericHandlerOff: function(component, objectKey, mouseMoveHandlerName, mouseClickHandlerName, cancelHandlerName) {
    // If there's a new object being placed, finalize its placement
    if (component[objectKey]) {
      if (CanvasGlobals.activeVertex) {
        CanvasGlobals.activeVertex.finishDrag();
      }
      component[objectKey] = null;
    }

    // Remove event listeners
    CanvasGlobals.canvas.off('mouse:move', component[mouseMoveHandlerName]);
    CanvasGlobals.canvas.off('mouse:up', component[mouseClickHandlerName]);
    document.removeEventListener('keydown', component[cancelHandlerName]);
    document.addEventListener('keydown', ShowHideSideBarEvent);

    CanvasGlobals.canvas.renderAll();
  },

  showToast: function(message, type = 'success', duration = 3000) {
    const toastId = 'toast-notification';
    // Remove existing toast if any
    let existingToast = document.getElementById(toastId);
    if (existingToast) {
      existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.id = toastId;
    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    // Center the toast
    toast.style.left = `calc(50% - ${toast.offsetWidth / 2}px)`;

    // Auto fade out
    setTimeout(() => {
      toast.classList.add('fade-out');
      // Remove the element after fade out animation
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 500); // Corresponds to the animation duration
    }, duration);
  },
  
  /**
   * Utility debounce function to limit rapid successive updates
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @return {Function} Debounced function
   */
  debounce: function(func, wait) {
    let timeout;
    return function(...args) {
      const context = this;
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(context, args), wait);
    };
  },

  /**
   * Detects if the current device is mobile/touch device
   * @return {boolean} True if mobile device
   */
  isMobileDevice: function() {
    return (('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0) ||
            (navigator.msMaxTouchPoints > 0) ||
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
  },

  /**
   * Detects if the current device supports hover interactions
   * @return {boolean} True if device supports hover
   */
  supportsHover: function() {
    return window.matchMedia('(hover: hover)').matches;
  },

  /**
   * Adds mobile-compatible tooltip event listeners
   * @param {HTMLElement} element - Element to attach listeners to
   * @param {Function} showCallback - Function to call when showing tooltip
   * @param {Function} hideCallback - Function to call when hiding tooltip
   * @param {Object} options - Configuration options
   * @return {Object} Object containing cleanup function and timeout references
   */
  addTooltipEventListeners: function(element, showCallback, hideCallback, options = {}) {
    const config = {
      longPressDelay: 500,    // Long press duration for mobile
      hideDelay: 2000,        // Auto-hide delay for mobile
      preventScroll: true,    // Prevent scrolling during long press
      ...options
    };

    let longPressTimer = null;
    let hideTimer = null;
    let touchStartY = 0;
    let isLongPress = false;
    let isScrolling = false;

    const isMobile = GeneralHandler.isMobileDevice();
    const supportsHover = GeneralHandler.supportsHover();

    // Mobile touch event handlers
    const handleTouchStart = (e) => {
      touchStartY = e.touches[0].clientY;
      isScrolling = false;
      isLongPress = false;

      // Start long press timer
      longPressTimer = setTimeout(() => {
        if (!isScrolling) {
          isLongPress = true;
          showCallback(e);
        }
      }, config.longPressDelay);

      // Clear any pending hide timer
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
    };

    const handleTouchMove = (e) => {
      const touchMoveY = e.touches[0].clientY;
      const deltaY = Math.abs(touchMoveY - touchStartY);

      // Detect scrolling (more than 10px movement)
      if (deltaY > 10) {
        isScrolling = true;
        
        // Cancel long press if scrolling
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }

        // Hide tooltip if it's visible and user is scrolling
        if (isLongPress) {
          hideCallback();
          isLongPress = false;
        }
      }
    };

    const handleTouchEnd = (e) => {
      // Clear long press timer
      if (longPressTimer) {
        clearTimeout(longPressTimer);
        longPressTimer = null;
      }

      // If it was a long press (tooltip is showing), start hide timer
      if (isLongPress && !isScrolling) {
        hideTimer = setTimeout(() => {
          hideCallback();
          isLongPress = false;
        }, config.hideDelay);
      }

      isScrolling = false;
    };

    // Desktop mouse event handlers
    const handleMouseEnter = (e) => {
      // Clear any pending hide timer
      if (hideTimer) {
        clearTimeout(hideTimer);
        hideTimer = null;
      }
      showCallback(e);
    };

    const handleMouseLeave = (e) => {
      hideCallback();
    };

    // Add appropriate event listeners based on device type
    if (isMobile || !supportsHover) {
      element.addEventListener('touchstart', handleTouchStart, { passive: false });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
      element.addEventListener('touchend', handleTouchEnd, { passive: true });
    } else {
      element.addEventListener('mouseenter', handleMouseEnter);
      element.addEventListener('mouseleave', handleMouseLeave);
    }

    // Return cleanup function and state references
    return {
      cleanup: function() {
        if (longPressTimer) {
          clearTimeout(longPressTimer);
          longPressTimer = null;
        }
        if (hideTimer) {
          clearTimeout(hideTimer);
          hideTimer = null;
        }

        if (isMobile || !supportsHover) {
          element.removeEventListener('touchstart', handleTouchStart);
          element.removeEventListener('touchmove', handleTouchMove);
          element.removeEventListener('touchend', handleTouchEnd);
        } else {
          element.removeEventListener('mouseenter', handleMouseEnter);
          element.removeEventListener('mouseleave', handleMouseLeave);
        }
      },
      isMobile: isMobile,
      supportsHover: supportsHover,
      timers: {
        longPress: () => longPressTimer,
        hide: () => hideTimer
      }
    };
  },
  
  /**
   * Gets center coordinates accounting for canvas pan/zoom
   * @return {Object} Center coordinates {x, y}
   */
  getCenterCoordinates: function() {
    // Center the object on the canvas viewport
    const centerX = CanvasGlobals.canvas.width / 2 / CanvasGlobals.canvas.getZoom();
    const centerY = CanvasGlobals.canvas.height / 2 / CanvasGlobals.canvas.getZoom();

    // Account for any panning that has been done
    const vpt = CanvasGlobals.canvas.viewportTransform;
    const actualCenterX = (centerX - vpt[4]) / vpt[0];
    const actualCenterY = (centerY - vpt[5]) / vpt[3];
    
    return { x: actualCenterX, y: actualCenterY };
  },

  /**
   * Creates a hover tooltip for general buttons that loads hint content dynamically
   * @param {HTMLElement} button - The button element to attach tooltip to
   * @param {string} hintPath - Path to the hint file (e.g., 'symbols/Airport')
   * @param {Object} options - Optional configuration {position: 'left'|'right'|'top'|'bottom', showDelay: number, hideDelay: number}
   * @return {HTMLElement} The button element with tooltip attached
   */
  createGeneralButtonTooltip: function(button, hintPath, options = {}) {
    // Default options
    const defaultOptions = {
      position: 'top',     // Default position for general button tooltips
      showDelay: 300,      // Delay before showing
      hideDelay: 100       // Quick hide for button tooltips
    };
    const config = Object.assign(defaultOptions, options);

    // Create tooltip element with different class to avoid conflicts
    const tooltip = GeneralHandler.createNode("div", { 
      'class': 'general-button-tooltip' 
    }, document.body);
    
    // Store timeout references
    let showTimeout = null;
    let hideTimeout = null;
    let isTooltipVisible = false;
    let hintContent = null; // Cache the loaded content
    
    // Function to reposition tooltip on window resize
    const repositionTooltip = () => {
      if (isTooltipVisible && tooltip.style.opacity === '1') {
        GeneralHandler.positionGeneralTooltip(tooltip, button, config.position);
      }
    };
    
    // Add window resize listener
    window.addEventListener('resize', GeneralHandler.debounce(repositionTooltip, 150));
    
    // Function to show tooltip with delay and dynamic loading
    const showTooltip = async (event) => {
      // Clear any pending hide timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      
      // Clear any existing show timeout
      if (showTimeout) {
        clearTimeout(showTimeout);
      }
      
      // Set new timeout for showing
      showTimeout = setTimeout(async () => {
        try {
          // Load hint content if not already cached
          if (!hintContent) {
            hintContent = await HintLoader.loadHint(hintPath);
          }
          
          // If hint content is available, show tooltip
          if (hintContent) {
            tooltip.innerHTML = hintContent;
            tooltip.style.visibility = 'visible';
            tooltip.style.opacity = '1';
            tooltip.style.pointerEvents = 'auto';
            isTooltipVisible = true;

            // Position the tooltip
            GeneralHandler.positionGeneralTooltip(tooltip, button, config.position);
          } else {
            // No hint available, show a fallback message
            tooltip.innerHTML = '<p><em>No help available for this item.</em></p>';
            tooltip.style.visibility = 'visible';
            tooltip.style.opacity = '1';
            tooltip.style.pointerEvents = 'auto';
            isTooltipVisible = true;
            GeneralHandler.positionGeneralTooltip(tooltip, button, config.position);
          }
        } catch (error) {
          console.warn('Failed to load hint content:', error);
          // Show error message in tooltip
          tooltip.innerHTML = '<p><em>Failed to load help content.</em></p>';
          tooltip.style.visibility = 'visible';
          tooltip.style.opacity = '1';
          tooltip.style.pointerEvents = 'auto';
          isTooltipVisible = true;
          GeneralHandler.positionGeneralTooltip(tooltip, button, config.position);
        }
        showTimeout = null;
      }, config.showDelay);
    };

    // Function to hide tooltip with delay
    const hideTooltip = () => {
      // Clear any pending show timeout
      if (showTimeout) {
        clearTimeout(showTimeout);
        showTimeout = null;
      }
      
      // Clear any existing hide timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
      
      // Set new timeout for hiding
      hideTimeout = setTimeout(() => {
        tooltip.style.opacity = '0';
        tooltip.style.pointerEvents = 'none';
        isTooltipVisible = false;
        // Hide visibility after transition completes
        setTimeout(() => {
          if (tooltip.style.opacity === '0') {
            tooltip.style.visibility = 'hidden';
          }
        }, 200); // Match CSS transition duration
        hideTimeout = null;
      }, config.hideDelay);
    };

    // Function to cancel hide and show immediately (for when mouse enters tooltip)
    const cancelHideAndShow = () => {
      // Clear both timeouts
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      if (showTimeout) {
        clearTimeout(showTimeout);
        showTimeout = null;
      }
      
      // Show immediately if not already visible
      if (!isTooltipVisible) {
        showTooltip();
      }
    };

    // Function to hide immediately (for when mouse leaves tooltip)
    const hideImmediately = () => {
      // Clear show timeout if pending
      if (showTimeout) {
        clearTimeout(showTimeout);
        showTimeout = null;
      }
      
      // Hide with the configured delay
      hideTooltip();
    };

    // Add event listeners to button with mobile compatibility
    let buttonListeners = null;
    let tooltipListeners = null;
    
    try {
      // Add mobile-compatible tooltip listeners to button
      buttonListeners = GeneralHandler.addTooltipEventListeners(
        button, 
        showTooltip, 
        hideTooltip,
        {
          longPressDelay: 500,  // Standard long press duration
          hideDelay: 2500,      // Reasonable display time for button tooltips
          preventScroll: true
        }
      );
      
      // Add focus/blur events for keyboard navigation (desktop only)
      if (GeneralHandler.supportsHover()) {
        button.addEventListener('focus', showTooltip); // Show on keyboard focus
        button.addEventListener('blur', hideTooltip);  // Hide on blur
      }
    } catch (error) {
      console.error('Error attaching general button tooltip listeners:', error);
    }

    // Add event listeners to tooltip itself to prevent hiding when hovering over it (desktop only)
    try {
      if (GeneralHandler.supportsHover()) {
        tooltip.addEventListener('mouseenter', cancelHideAndShow);
        tooltip.addEventListener('mouseleave', hideImmediately);
      }
    } catch (error) {
      console.error('Error attaching tooltip hover listeners:', error);
    }

    // Store cleanup function on button
    button.cleanupGeneralTooltip = () => {
      if (showTimeout) {
        clearTimeout(showTimeout);
        showTimeout = null;
      }
      if (hideTimeout) {
        clearTimeout(hideTimeout);
        hideTimeout = null;
      }
      
      // Cleanup mobile-compatible event listeners
      if (buttonListeners) {
        buttonListeners.cleanup();
      }
      
      // Remove focus/blur listeners (desktop only)
      if (GeneralHandler.supportsHover()) {
        button.removeEventListener('focus', showTooltip);
        button.removeEventListener('blur', hideTooltip);
        tooltip.removeEventListener('mouseenter', cancelHideAndShow);
        tooltip.removeEventListener('mouseleave', hideImmediately);
      }
      
      // Remove resize listener
      window.removeEventListener('resize', repositionTooltip);
      if (document.body.contains(tooltip)) {
        document.body.removeChild(tooltip);
      }
    };

    return button;
  },

  /**
   * Positions a general button tooltip relative to a target button
   * @param {HTMLElement} tooltip - The tooltip element
   * @param {HTMLElement} target - The target button to position relative to
   * @param {string} position - Position preference ('left', 'right', 'top', 'bottom')
   */
  positionGeneralTooltip: function(tooltip, target, position = 'top') {
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Clear existing arrow classes
    tooltip.classList.remove('tooltip-arrow-left', 'tooltip-arrow-right', 'tooltip-arrow-top', 'tooltip-arrow-bottom');

    let left, top;
    const margin = 8; // Space between tooltip and button

    switch (position) {
      case 'top':
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        top = targetRect.top - tooltipRect.height - margin;
        tooltip.classList.add('tooltip-arrow-bottom');
        break;
      case 'bottom':
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        top = targetRect.bottom + margin;
        tooltip.classList.add('tooltip-arrow-top');
        break;
      case 'left':
        left = targetRect.left - tooltipRect.width - margin;
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        tooltip.classList.add('tooltip-arrow-right');
        break;
      case 'right':
        left = targetRect.right + margin;
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        tooltip.classList.add('tooltip-arrow-left');
        break;
    }

    // Ensure tooltip stays within viewport bounds
    if (left < 10) {
      left = 10;
    } else if (left + tooltipRect.width > viewport.width - 10) {
      left = viewport.width - tooltipRect.width - 10;
    }

    if (top < 10) {
      top = 10;
    } else if (top + tooltipRect.height > viewport.height - 10) {
      top = viewport.height - tooltipRect.height - 10;
    }

    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
  },

  /**
   * Enhanced button creation that can automatically attach tooltip with dynamic hint loading
   * @param {string} name - Button name/ID
   * @param {string} labelTxt - Button label text
   * @param {HTMLElement} parent - Parent container
   * @param {string} container - Container class name
   * @param {Function} callback - Click callback
   * @param {string} event - Event type
   * @param {Object} tooltipOptions - Tooltip configuration {hintPath: string, position: string, showDelay: number, hideDelay: number}
   * @return {HTMLElement} The created button
   */
  createButtonWithTooltip: function (name, labelTxt, parent, container = 'input', callback = null, event = null, tooltipOptions = null) {
    // Create the button using existing method
    const button = GeneralHandler.createButton(name, labelTxt, parent, container, callback, event);
    
    // If tooltip options provided, attempt to add tooltip
    if (tooltipOptions && tooltipOptions.hintPath) {
      GeneralHandler.createGeneralButtonTooltip(button, tooltipOptions.hintPath, tooltipOptions);
    }
    
    return button;
  },

  // ...existing code...
}

document.getElementById('show_hide').addEventListener('click', function (event) {
  GeneralHandler.ShowHideSideBar(event)
}
)

// GeneralSettings object to store shared settings across sidebar panels
const GeneralSettings = {
  // Default values
  showTextBorders: true,
  showObjectBorders: true,
  showGrid: true,
  snapToGrid: true,
  backgroundColor: '#2f2f2f',
  gridColor: '#ffffff',
  gridSize: 20,
  showAllVertices: false,
  autoSave: true,
  autoSaveInterval: 300,
  defaultExportScale: 2,
  runTestsOnStart: false,
  xHeight: 100,
  messageColor: 'White',
  dimensionUnit: 'mm', // 'mm' or 'sw' (sign width units)

  // Event listeners for setting changes
  listeners: [],

  // Method to register a listener for setting changes
  addListener: function(callback) {
    this.listeners.push(callback);
  },

  // Method to notify all listeners of setting changes
  notifyListeners: function(setting, value) {
    this.listeners.forEach(callback => {
      if (typeof callback === 'function'){
        callback(setting, value);
      }
    });
  },

  // Update a setting and notify listeners
  updateSetting: function(setting, value) {
    if (this.hasOwnProperty(setting)) {
      this[setting] = value;
      this.notifyListeners(setting, value);
    }
  },

  resetSetting: function() {
    const defaultSetting = {
      showTextBorders: true,
      showObjectBorders: true,
      showGrid: true,
      snapToGrid: true,
      backgroundColor: '#2f2f2f',
      gridColor: '#ffffff',
      gridSize: 20,
      showAllVertices: false,
      autoSave: true,
      autoSaveInterval: 300,
      defaultExportScale: 2,
      runTestsOnStart: false,
      xHeight: 100,
      messageColor: 'White',
      dimensionUnit: 'mm'
    };

    // Apply all settings at once without triggering individual notifications
    // We'll do a single notification at the end
    for (const key in defaultSetting) {
      if (defaultSetting.hasOwnProperty(key) && this.hasOwnProperty(key)) {
        this[key] = defaultSetting[key];
      }
    }
    
    // Notify listeners about a complete reset instead of individual properties
    this.notifyListeners('settingsReset', null);
  },

  // Method to format dimension values based on the current unit setting
  formatDimension: function(value, xHeight = 100) {
    if (this.dimensionUnit === 'sw') {
      // Convert to sign width units (value / xHeight)
      // Sign width units are calculated as dimension divided by x-height
      const swValue = (value / xHeight * 4).toFixed(1);
      return `${swValue}sw`;
    } else { 
      // Return in millimeters (default)
      return `${Math.round(value)}mm`;
    }
  }
};

// Export GeneralHandler and GeneralSettings for ES module usage
export { GeneralHandler, GeneralSettings };