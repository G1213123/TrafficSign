/* General Sidebar Panel */
let GeneralHandler = {
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
  PanelHandlerOff: () => {
    if (typeof FormTextAddComponent !== 'undefined') {
      FormTextAddComponent.TextHandlerOff()
    }
    if (typeof FormBorderAddComponent !== 'undefined') {
      FormDrawAddComponent.DrawHandlerOff()
    }
    if (tabNum != 5) {
      if (typeof FormDebugComponent !== 'undefined') {
        FormDebugComponent.DebugHandlerOff()
      }
    }
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

  createInput: function (name, labelTxt, parent, defaultV = null, callback = null, event = null) {
    var inputContainer = GeneralHandler.createNode("div", { 'class': 'input-container' }, parent)
    //var labelEdge = GeneralHandler.createNode("div", { 'class': 'cut' }, inputContainer)
    var label = GeneralHandler.createNode("div", { 'class': 'placeholder', 'for': name }, inputContainer)
    var input = GeneralHandler.createNode("input", { 'type': 'text', 'class': 'input', 'id': name, 'placeholder': ' ' }, inputContainer, callback, event)
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

  createToggle: function (name, options, parent, defaultSelected = null, callback = null,) {
    // Create a container for the toggle including its label
    var inputContainer = GeneralHandler.createNode("div", { 'class': 'input-container' }, parent);

    // Create the label
    var label = GeneralHandler.createNode("div", { 'class': 'placeholder', 'for': name }, inputContainer);
    label.innerHTML = name;

    // Create a container for the toggle buttons
    var toggleContainer = GeneralHandler.createNode("div", { 'class': 'toggle-container', 'id': name + '-container' }, inputContainer);

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
   * @return {HTMLElement} The created container
   */
  createBasicParamsContainer: function(parent, componentContext, defaultXHeight = null, defaultColor = null) {
    // Create a container for basic parameters
    const basicParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
    
    // Use provided defaults or fall back to GeneralSettings
    const xHeight = defaultXHeight !== null ? defaultXHeight : GeneralSettings.xHeight;
    const color = defaultColor !== null ? defaultColor : GeneralSettings.messageColor;
    
    // Create xHeight input with universal handler
    const xHeightInput = GeneralHandler.createInput('input-xHeight', 'x Height', basicParamsContainer, 
      xHeight, GeneralHandler.handleXHeightChange, 'input');
      
    // Create color toggle with universal handler
    GeneralHandler.createToggle('Message Colour', ['Black', 'White'], basicParamsContainer, color, 
      GeneralHandler.handleColorChange);
      
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
      if (tabNum === tabNumber) {
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
    
    if (!objectKey || !component[objectKey] || !activeVertex) return;
    
    const pointer = canvas.getPointer(event.e);
    
    // If we have an active vertex, let it handle the movement
    if (activeVertex.handleMouseMoveRef) {
      // Simulate a mouse move event with the current pointer
      const simulatedEvent = {
        e: event.e,
        pointer: pointer
      };
      activeVertex.handleMouseMoveRef(simulatedEvent);
    } else {
      // Fallback direct positioning if vertex control isn't active
      component[objectKey].set({
        left: pointer.x,
        top: pointer.y
      });
      component[objectKey].setCoords();
      canvas.renderAll();
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
    if (event.e.button !== 0) return;
    
    // Complete the placement if we have an active object
    if (component[objectKey]) {
      // Complete the placement
      if (activeVertex) {
        activeVertex.handleMouseDownRef(event);
      }

      // Clean up
      canvas.off('mouse:move', component[mouseMoveHandlerName]);
      canvas.off('mouse:down', component[mouseClickHandlerName]);
      canvas.discardActiveObject();

      // Reset state
      component[objectKey].isTemporary = false;
      component[objectKey] = null;
      activeVertex = null;

      // Reattach default keyboard event listener
      document.removeEventListener('keydown', component[cancelHandlerName]);
      document.addEventListener('keydown', ShowHideSideBarEvent);

      canvas.renderAll();
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
      if (component[objectKey] && canvas.contains(component[objectKey])) {
        component[objectKey].deleteObject();
        component[objectKey] = null;
      }

      // Clean up active vertex if there is one
      if (activeVertex) {
        activeVertex.cleanupDrag();
        activeVertex = null;
      }

      // Restore event listeners
      canvas.off('mouse:move', component[mouseMoveHandlerName]);
      canvas.off('mouse:down', component[mouseClickHandlerName]);
      document.removeEventListener('keydown', component.cancelInput || component.cancelDraw);
      document.addEventListener('keydown', ShowHideSideBarEvent);

      canvas.renderAll();
    }
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
  createObjectWithSnapping: async function(options, createObjectFn, component, objectKey, vertexId, mouseMoveHandler, mouseClickHandler, cancelHandler) {
    // Clear any existing object being placed
    if (component[objectKey]) {
      canvas.remove(component[objectKey]);
      component[objectKey] = null;
      
      if (activeVertex) {
        activeVertex.cleanupDrag();
        activeVertex = null;
      }
    }
    
    // Remove standard event listeners and add component-specific ones
    document.removeEventListener('keydown', ShowHideSideBarEvent);
    document.addEventListener('keydown', cancelHandler);
    
    // Get the center of the canvas viewport
    const vpt = CenterCoord();
    const centerX = vpt.x;
    const centerY = vpt.y;
    
    // Set position in options
    options.position = options.position || { x: centerX, y: centerY };
    
    try {
      // Create the object - use await to handle both async and sync functions
      const newObject = await Promise.resolve(createObjectFn(options));
      
      // Store reference to the object
      component[objectKey] = newObject;
      
      // Add mouse event handlers
      canvas.on('mouse:move', mouseMoveHandler);
      canvas.on('mouse:down', mouseClickHandler);
      
      // Set up the object for snapping
      canvas.setActiveObject(newObject);
      newObject.enterFocusMode();
      newObject.isTemporary = true;
      
      // Activate the vertex control for snapping
      if (newObject.controls && newObject.controls[vertexId]) {
        // Get the vertex control
        activeVertex = newObject.controls[vertexId];
        activeVertex.isDown = true;
        activeVertex.isDragging = true;
        
        // Store original position info
        activeVertex.originalPosition = {
          left: newObject.left,
          top: newObject.top
        };
  
        // Get the vertex coordinates
        const vertex = newObject.getBasePolygonVertex(vertexId);
        if (vertex) {
          // Store vertex positions for snapping
          activeVertex.vertexOriginalPosition = {
            x: vertex.x,
            y: vertex.y
          };
          
          // Calculate offset from object center to vertex
          activeVertex.vertexOffset = {
            x: vertex.x - newObject.left,
            y: vertex.y - newObject.top
          };
          
          // Create indicator for the active vertex if the method exists
          if (activeVertex.createIndicator) {
            activeVertex.createIndicator(vertex.x, vertex.y);
          }
        }
      }
      
      canvas.renderAll();
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
      if (activeVertex) {
        activeVertex.finishDrag();
      }
      component[objectKey] = null;
    }

    // Remove event listeners
    canvas.off('mouse:move', component[mouseMoveHandlerName]);
    canvas.off('mouse:down', component[mouseClickHandlerName]);
    document.removeEventListener('keydown', component[cancelHandlerName]);
    document.addEventListener('keydown', ShowHideSideBarEvent);

    canvas.renderAll();
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
   * Gets center coordinates accounting for canvas pan/zoom
   * @return {Object} Center coordinates {x, y}
   */
  getCenterCoordinates: function() {
    // Center the object on the canvas viewport
    const centerX = canvas.width / 2 / canvas.getZoom();
    const centerY = canvas.height / 2 / canvas.getZoom();

    // Account for any panning that has been done
    const vpt = canvas.viewportTransform;
    const actualCenterX = (centerX - vpt[4]) / vpt[0];
    const actualCenterY = (centerY - vpt[5]) / vpt[3];
    
    return { x: actualCenterX, y: actualCenterY };
  }
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
  autoSaveInterval: 60,
  defaultExportScale: 2,
  runTestsOnStart: false,
  xHeight: 100,
  messageColor: 'White',

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
      autoSaveInterval: 60,
      defaultExportScale: 2,
      runTestsOnStart: false,
      xHeight: 100,
      messageColor: 'White'
    };

    for (const key in defaultSetting) {
      if (defaultSetting.hasOwnProperty(key) && this.hasOwnProperty(key)) {
        this[key] = defaultSetting[key];
      }
    }
  }
};

// Export the GeneralHandler for use in other files