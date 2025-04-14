/* Draw Symbol Panel */
let FormDrawAddComponent = {
  symbolAngle: 0,
  newSymbolObject: null,
  editingExistingSymbol: null, // Track when we're editing an existing symbol

  // Add a custom handler for color change to update SVG buttons immediately
  handleColorChange: function(event) {
    const color = event.getAttribute('data-value');
    if (!color) return;
    
    // Update GeneralSettings using the built-in function
    GeneralHandler.handleColorChange(event);
    
    // Update buttons immediately
    FormDrawAddComponent.addAllSymbolsButton();
    
    // Update the symbol with new color if one exists
    if (FormDrawAddComponent.newSymbolObject) {
      FormDrawAddComponent.updateSymbol(FormDrawAddComponent.newSymbolObject, { color: color.toLowerCase() });
    } else if (FormDrawAddComponent.editingExistingSymbol) {
      FormDrawAddComponent.updateSymbol(FormDrawAddComponent.editingExistingSymbol, { color: color.toLowerCase() });
    }
  },

  drawPanelInit: async function (e, existingSymbol = null) {
    tabNum = 1
    var parent = GeneralHandler.PanelInit()
    
    // If an existing symbol was passed, set it as the editing symbol
    if (existingSymbol) {
      FormDrawAddComponent.editingExistingSymbol = existingSymbol;
      FormDrawAddComponent.symbolAngle = existingSymbol.symbolAngle;
    } else {
      FormDrawAddComponent.editingExistingSymbol = null;
      FormDrawAddComponent.symbolAngle = 0;
    }
    
    if (parent) {
      // Create basic parameters container manually (don't use the shared function)
      // so we can attach our custom color change handler
      var basicParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      
      // Use provided defaults or fall back to GeneralSettings
      const xHeight = FormDrawAddComponent.editingExistingSymbol ? 
        FormDrawAddComponent.editingExistingSymbol.xHeight : 
        GeneralSettings.xHeight;
      
      const color = FormDrawAddComponent.editingExistingSymbol ? 
        FormDrawAddComponent.editingExistingSymbol.color.charAt(0).toUpperCase() + FormDrawAddComponent.editingExistingSymbol.color.slice(1) : 
        GeneralSettings.messageColor;
      
      // Create xHeight input using the standard handler
      const xHeightInput = GeneralHandler.createInput('input-xHeight', 'x Height', basicParamsContainer, 
        xHeight, GeneralHandler.handleXHeightChange, 'input');
        
      // Create color toggle with our CUSTOM color change handler
      GeneralHandler.createToggle('Message Colour', ['Black', 'White'], basicParamsContainer, color, 
        FormDrawAddComponent.handleColorChange);
      
      // Add debounced event listener for real-time updates on xHeight input
      xHeightInput.addEventListener('input', GeneralHandler.debounce(function(e) {
        // The handleXHeightChange function will update GeneralSettings
      }, 300));

      // Create a placeholder container for angle controls
      var angleControlContainer = GeneralHandler.createNode("div", { 'id': 'angle-control-container', 'class': 'input-group-container', 'style': 'display: none;' }, parent);
      
      // If we're editing an existing symbol, toggle the angle controls based on its type
      if (FormDrawAddComponent.editingExistingSymbol) {
        FormDrawAddComponent.toggleAngleControls(FormDrawAddComponent.editingExistingSymbol.symbol);
      }
      
      FormDrawAddComponent.addAllSymbolsButton()
    }
  },

  // Function to update only angle and xHeight of an existing symbol
  updateExistingSymbol: function() {
    if (FormDrawAddComponent.editingExistingSymbol) {
      const xHeight = parseInt(document.getElementById('input-xHeight').value) ;
      const color = document.getElementById('Message Colour-container').selected.getAttribute('data-value');
      const angle = FormDrawAddComponent.symbolAngle;

      // Update the symbol with new properties, but keep the same symbol type
      FormDrawAddComponent.editingExistingSymbol.updateSymbol(
        FormDrawAddComponent.editingExistingSymbol.symbol, 
        xHeight, 
        color, 
        angle
      );
      
      // Reset the editing state
      FormDrawAddComponent.editingExistingSymbol = null;
    }
  },

  addAllSymbolsButton: function () {
    const parent = document.getElementById("input-form");
    const color = document.getElementById('Message Colour-container').selected?document.getElementById('Message Colour-container').selected.getAttribute('data-value') : 'white';
    
    // Clear any existing symbol containers
    const existingSymbolContainers = parent.querySelectorAll('.symbols-grid');
    if (existingSymbolContainers.length > 0) {
      existingSymbolContainers.forEach(container => {
        container.remove();
      });
    }
    
    // Create a container for all symbols with the proper grid layout
    const symbolsContainer = GeneralHandler.createNode("div", { 'class': 'symbols-grid' }, parent);

    // Add symbols to the grid - two in each row
    Object.keys(symbolsTemplate).forEach(async (symbol) => {
      const svg = await FormDrawAddComponent.createButtonSVG(symbol, 5, color);
      const symbolBtn = GeneralHandler.createSVGButton(
        `button-${symbol}`, 
        svg, 
        symbolsContainer, 
        'symbol', 
        FormDrawAddComponent.createSymbolObject, 
        'click'
      );
      
      // Store the symbol type as data attribute
      symbolBtn.setAttribute('data-symbol-type', symbol);
    });
  },

  // New function to select a symbol when editing
  selectSymbolForEditing: function(event) {
    // Remove selection from all buttons
    document.querySelectorAll('.symbol-button').forEach(btn => {
      btn.classList.remove('selected');
    });
    
    // Add selection to clicked button
    event.currentTarget.classList.add('selected');
  },

  setAngle: function (event) {
    // Store original angle to check if it changes
    const originalAngle = FormDrawAddComponent.symbolAngle;
    
    // Get current symbol type
    let symbolType = null;
    let currentSymbol = null;
    if (FormDrawAddComponent.newSymbolObject) {
      symbolType = FormDrawAddComponent.newSymbolObject.symbol;
      currentSymbol = FormDrawAddComponent.newSymbolObject;
    } else if (FormDrawAddComponent.editingExistingSymbol) {
      symbolType = FormDrawAddComponent.editingExistingSymbol.symbol;
      currentSymbol = FormDrawAddComponent.editingExistingSymbol;
    }
    
    // If we don't have a symbol type or permitted angles, hide the angle controls
    if (!symbolType || !symbolsPermittedAngle || !symbolsPermittedAngle[symbolType]) {
      FormDrawAddComponent.hideAngleControls();
      return;
    }
    
    // Use permitted angles for increments
    const permittedAngles = symbolsPermittedAngle[symbolType];
    if (permittedAngles.length > 1) {
      // Find the current index in the permitted angles array
      let currentIndex = permittedAngles.indexOf(FormDrawAddComponent.symbolAngle);
      if (currentIndex === -1) {
        // If current angle is not in the array, find the closest one
        let closestIndex = 0;
        let minDifference = Math.abs(permittedAngles[0] - FormDrawAddComponent.symbolAngle);
        
        for (let i = 1; i < permittedAngles.length; i++) {
          const difference = Math.abs(permittedAngles[i] - FormDrawAddComponent.symbolAngle);
          if (difference < minDifference) {
            minDifference = difference;
            closestIndex = i;
          }
        }
        
        currentIndex = closestIndex;
      }
      
      // Determine next index based on rotation direction
      if (event.currentTarget.id.search('left') > -1) {
        // Rotate left (counterclockwise)
        currentIndex = (currentIndex - 1 + permittedAngles.length) % permittedAngles.length;
      } else {
        // Rotate right (clockwise)
        currentIndex = (currentIndex + 1) % permittedAngles.length;
      }
      
      // Set the new angle
      FormDrawAddComponent.symbolAngle = permittedAngles[currentIndex];
    }

    // Update the UI regardless
    const angleDisplay = document.getElementById('angle-display');
    if (angleDisplay) {
      angleDisplay.innerText = FormDrawAddComponent.symbolAngle + '°';
    }

    // Update the symbol object only if we actually changed the angle
    if (FormDrawAddComponent.symbolAngle !== originalAngle && currentSymbol) {
      FormDrawAddComponent.updateSymbol(currentSymbol, { angle: FormDrawAddComponent.symbolAngle });
    }

    canvas.renderAll();
  },

  DrawHandlerOff: function (event) {
    // Use the shared handler for cleanup
    GeneralHandler.genericHandlerOff(
      FormDrawAddComponent,
      'newSymbolObject',
      'SymbolOnMouseMove',
      'SymbolOnMouseClick',
      'cancelDraw'
    );
    
    // Additional draw-specific cleanup
    FormDrawAddComponent.hideAngleControls();
  },

  // Create a new symbol object directly instead of using cursor
  createSymbolObject: function (event) {
    // Get symbol type and parameters from the button or defaults
    const symbolType = event.currentTarget.id.replace('button-', '');
    const xHeight = parseInt(document.getElementById('input-xHeight').value);
    const color = document.getElementById('Message Colour-container').selected.getAttribute('data-value');

    // Toggle angle controls based on symbol type
    FormDrawAddComponent.toggleAngleControls(symbolType);

    // Check and adjust angle based on permitted angles
    FormDrawAddComponent.validateAndAdjustAngle(symbolType);

    // Create a function that returns a symbol object
    const createSymbol = (options) => {
      // Account for any panning that has been done
      return drawSymbolDirectly(options.type, {
        x: options.position.x,
        y: options.position.y,
        xHeight: options.xHeight,
        angle: options.angle,
        color: options.color
      });
    };

    try {
      // Use the general object creation with snapping function
      GeneralHandler.createObjectWithSnapping(
        {
          type: symbolType,
          xHeight: xHeight,
          color: color.toLowerCase(),
          angle: FormDrawAddComponent.symbolAngle
        },
        createSymbol,
        FormDrawAddComponent,
        'newSymbolObject',
        'V1',
        FormDrawAddComponent.SymbolOnMouseMove,
        FormDrawAddComponent.SymbolOnMouseClick,
        FormDrawAddComponent.cancelDraw
      );
    } catch (error) {
      console.error('Error creating symbol object:', error);
    }
  },

  // New function to validate and adjust angle based on permitted angles for the symbol
  validateAndAdjustAngle: function(symbolType) {
    // Check if there are restrictions for this symbol type
    if (symbolsPermittedAngle && symbolsPermittedAngle[symbolType]) {
      const permittedAngles = symbolsPermittedAngle[symbolType];
      
      // If current angle not in the permitted list, find closest
      if (!permittedAngles.includes(FormDrawAddComponent.symbolAngle)) {
        let closestAngle = permittedAngles[0]; // Default to first angle
        let minDifference = Math.abs(FormDrawAddComponent.symbolAngle - closestAngle);
        
        // Find closest permitted angle
        for (let i = 1; i < permittedAngles.length; i++) {
          const difference = Math.abs(FormDrawAddComponent.symbolAngle - permittedAngles[i]);
          if (difference < minDifference) {
            minDifference = difference;
            closestAngle = permittedAngles[i];
          }
        }
        
        // Update to the closest permitted angle
        FormDrawAddComponent.symbolAngle = closestAngle;
        
        // Update the angle display in the sidebar
        const angleDisplay = document.getElementById('angle-display');
        if (angleDisplay) {
          angleDisplay.innerText = FormDrawAddComponent.symbolAngle + '°';
        }
      }
    } else {
      // If no restrictions defined for this symbol, default to allowing only 0 degrees
      if (FormDrawAddComponent.symbolAngle !== 0) {
        FormDrawAddComponent.symbolAngle = 0;
        
        // Update the angle display in the sidebar
        const angleDisplay = document.getElementById('angle-display');
        if (angleDisplay) {
          angleDisplay.innerText = FormDrawAddComponent.symbolAngle + '°';
        }
      }
    }
  },

  // Helper function to update symbol properties (angle, color, xHeight)
  updateSymbol: async function (symbolObject, options = {}) {
    if (!symbolObject) return;

    const symbolType = symbolObject.symbol;
    const xHeight = options.xHeight !== undefined ? options.xHeight : symbolObject.xHeight;
    const color = options.color !== undefined ? options.color : symbolObject.color;
    const position = {
      x: symbolObject.left,
      y: symbolObject.top
    };
    
    // If angle is provided, validate it against permitted values
    if (options.angle !== undefined) {
      FormDrawAddComponent.symbolAngle = options.angle;
      FormDrawAddComponent.validateAndAdjustAngle(symbolType);
    }

    // Create new symbol with updated properties
    const newSymbolObject = await drawSymbolDirectly(symbolType, {
      x: position.x,
      y: position.y,
      xHeight: xHeight,
      angle: FormDrawAddComponent.symbolAngle,
      color: color
    });

    // clear active vertex
    if (activeVertex) {
      //activeVertex.clearSnapHighlight();
      activeVertex.cleanupDrag();
      activeVertex = null;
    }
    
    // Replace on canvas
    symbolObject.deleteObject();
    FormDrawAddComponent.newSymbolObject = newSymbolObject;
    canvas.setActiveObject(newSymbolObject)
    newSymbolObject.enterFocusMode()

    // Re-activate vertex control
    if (newSymbolObject.controls && newSymbolObject.controls.V1) {
      activeVertex = newSymbolObject.controls.V1;
      activeVertex.isDown = true;
      activeVertex.isDragging = true;
      activeVertex.originalPosition = {
        left: newSymbolObject.left,
        top: newSymbolObject.top
      };

      // Store vertex information
      const v1 = newSymbolObject.getBasePolygonVertex('V1');
      if (v1) {
        activeVertex.vertexOriginalPosition = {
          x: v1.x,
          y: v1.y
        };
        activeVertex.vertexOffset = {
          x: v1.x - newSymbolObject.left,
          y: v1.y - newSymbolObject.top
        };

      }
    }

    canvas.renderAll()
    
    return newSymbolObject;
  },

  SymbolOnMouseMove: function (event) {
    // Use shared mouse move handler
    GeneralHandler.handleObjectOnMouseMove(FormDrawAddComponent, event);
  },

  SymbolOnMouseClick: function (event) {
    if (event.e.button !== 0) return;
    
    // Use shared mouse click handler
    if (FormDrawAddComponent.newSymbolObject) {
      GeneralHandler.handleObjectOnMouseClick(
        FormDrawAddComponent,
        event,
        'newSymbolObject',
        'SymbolOnMouseMove',
        'SymbolOnMouseClick',
        'cancelDraw'
      );
      
      // Symbol-specific cleanup
      FormDrawAddComponent.hideAngleControls();
      
      return;
    }
  },

  cancelDraw: function (event) {
    // Use shared escape key handler
    if (event.key === 'Escape') {
      GeneralHandler.handleCancelWithEscape(
        FormDrawAddComponent, 
        event, 
        'newSymbolObject', 
        'SymbolOnMouseMove', 
        'SymbolOnMouseClick'
      );
      
      // Symbol-specific cleanup
      FormDrawAddComponent.hideAngleControls();
    }
  },  
  
  createButtonSVG: async (symbolType, length, color = 'white') => {
    const symbolData = calcSymbol(symbolType, length, color);
    
    // Define SVG dimensions for the button
    const svgWidth = 100;
    const svgHeight = 100;
      // Create a temporary canvas to measure and render the symbol
    const tempCanvas = new fabric.StaticCanvas(null, { 
      width: svgWidth, 
      height: svgHeight,
      enableRetinaScaling: false
    });
    
    // Create temporary path objects for each path in the symbol
    const pathObjects = [];
    
    // Process each path in the symbol data
    symbolData.path.forEach(path => {
      // Convert vertex data to path commands
      const pathCommands = convertVertexToPathCommands(path);
      
      // Create a fabric.Path object
      const pathObj = new fabric.Path(pathCommands, {
        fill: path.fill || color.toLowerCase(),
        stroke: 'none',
        strokeWidth: 0
      });
      
      pathObjects.push(pathObj);
    });
    
    // Process text elements if present
    if (symbolData.text && symbolData.text.length > 0) {
      symbolData.text.forEach(textElem => {
        // Check for font path
        const charPath = getFontPath(textElem);
        if (charPath && charPath.commands) {
          // Convert font path commands to fabric.Path format
          const pathCommands = convertFontPathToFabricPath(charPath.commands, textElem);
          const textPathObj = new fabric.Path(pathCommands, {
            fill: textElem.fill || color.toLowerCase(),
            stroke: 'none',
            strokeWidth: 0
          });
          
          pathObjects.push(textPathObj);
        }
      });
    }
    
    // Create a group with all paths
    const group = new fabric.Group(pathObjects, {
      left: 0,
      top: 0
    });
      // Calculate dimensions for scaling
    const bounds = group.getBoundingRect();
    
    // Special case handling for specific symbols
    let symbolWidth = bounds.width;
    let symbolHeight = bounds.height;
    
    if (symbolType === 'MTR') {
      symbolWidth = 130;
    }
    if (symbolType === 'Hospital') {
      symbolWidth = color == 'White' ? 80 : 90;
    }
    
    // Scale to fit within SVG dimensions
    const scaleX = svgWidth / symbolWidth;
    const scaleY = svgHeight / symbolHeight;
    const scale = Math.min(scaleX, scaleY);
    
    // Set the group's properties for centering and scaling
    group.set({
      left: (svgWidth - symbolWidth * scale) / 2,
      top: (svgHeight - symbolHeight * scale) / 2,
      scaleX: scale,
      scaleY: scale
    });
    
    // Add the group to the canvas
    tempCanvas.add(group);
    tempCanvas.renderAll();
    
    // Export as SVG string
    const svgString = tempCanvas.toSVG({
      width: svgWidth,
      height: svgHeight,
      viewBox: {
        x: 0,
        y: 0,
        width: svgWidth,
        height: svgHeight
      }
    });
    
    // Cleanup
    tempCanvas.dispose();
    
    return svgString;
  },

  // Toggle angle controls based on symbol type
  toggleAngleControls: function(symbolType) {
    const angleControlContainer = document.getElementById('angle-control-container');
    
    // If container exists
    if (angleControlContainer) {
      // Only show angle controls if this symbol has permitted angles defined
      const hasPermittedAngles = symbolsPermittedAngle && symbolsPermittedAngle[symbolType] && 
                                symbolsPermittedAngle[symbolType].length > 1;
      
      if (hasPermittedAngles) {
        // Clear any existing angle controls
        angleControlContainer.innerHTML = '';
        
        // Create a container for angle controls
        var angleContainer = GeneralHandler.createNode("div", { 'class': 'angle-picker-container' }, angleControlContainer);

        var btnRotateLeft = GeneralHandler.createButton(`rotate-left`, '<i class="fa-solid fa-rotate-left"></i>', angleContainer, null, FormDrawAddComponent.setAngle, 'click');
        var btnRotateRight = GeneralHandler.createButton(`rotate-right`, '<i class="fa-solid fa-rotate-right"></i>', angleContainer, null, FormDrawAddComponent.setAngle, 'click');

        var angleDisplay = GeneralHandler.createNode("div", { 'id': 'angle-display', 'class': 'angle-display' }, angleContainer);
        angleDisplay.innerText = FormDrawAddComponent.symbolAngle + '°';
        
        // Show the angle controls
        angleControlContainer.style.display = 'block';
      } else {
        // Hide the angle controls
        angleControlContainer.style.display = 'none';
        
        // Reset angle to 0 for symbols with no angle options
        FormDrawAddComponent.symbolAngle = 0;
      }
    }
  },

  hideAngleControls: function() {
    const angleControlContainer = document.getElementById('angle-control-container');
    if (angleControlContainer) {
      angleControlContainer.style.display = 'none';
      
      // Reset angle to default when hiding controls
      FormDrawAddComponent.symbolAngle = 0;
    }
  }
}

// Use the shared settings listener implementation
GeneralSettings.addListener(
  GeneralHandler.createSettingsListener(1, function(setting, value) {
    // Symbol-specific updates when settings change
    if (setting === 'xHeight') {
      if (FormDrawAddComponent.newSymbolObject || FormDrawAddComponent.editingExistingSymbol) {
        const targetSymbol = FormDrawAddComponent.newSymbolObject || FormDrawAddComponent.editingExistingSymbol;
        FormDrawAddComponent.updateSymbol(targetSymbol, { xHeight: value });
      }
    } else if (setting === 'messageColor') {
      if (FormDrawAddComponent.newSymbolObject || FormDrawAddComponent.editingExistingSymbol) {
        const targetSymbol = FormDrawAddComponent.newSymbolObject || FormDrawAddComponent.editingExistingSymbol;
        FormDrawAddComponent.updateSymbol(targetSymbol, { color: value.toLowerCase() });
      }
      
      // Update all symbol buttons with new color
      if (document.getElementById("input-form")) {
        FormDrawAddComponent.addAllSymbolsButton();
      }
    }
  })
);