var cursor = new fabric.Group();
cursor.set({ id: 'cursor', "selectable": false })
cursor.lockScalingX = true;
cursor.lockScalingY = true;
cursor.lockUniScaling = true;
var cursorOffset = { x: 0, y: 0 }
let tabNum = 2;

canvas.add(cursor);

canvas.snap_pts = [];

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
    FormTextAddComponent.TextHandlerOff()
    FormDrawAddComponent.DrawHandlerOff()
    if (tabNum != 5) {
      FormDebugComponent.DebugHandlerOff()
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
}

/* Text panel */
let FormTextAddComponent = {

  textFont: ['TransportMedium', 'TransportHeavy'],

  textPanelInit: function (event, editingTextObject = null) {
    tabNum = 2;
    var parent = GeneralHandler.PanelInit();
    if (parent) {
      // Create a container for basic text parameters
      const basicParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      GeneralHandler.createInput('input-xHeight', 'x Height', basicParamsContainer, 100, editingTextObject ? FormTextAddComponent.liveUpdateText : FormTextAddComponent.TextInputHandler, 'input');
      GeneralHandler.createToggle('Message Colour', ['Black', 'White'], basicParamsContainer, 'White', editingTextObject ? FormTextAddComponent.liveUpdateText : FormTextAddComponent.TextInputHandler);

      // Create a container for text content and font
      const textContentContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      const textInput = GeneralHandler.createInput('input-text', 'Add Text', textContentContainer, '', editingTextObject ? FormTextAddComponent.liveUpdateText : FormTextAddComponent.TextInputHandler, 'input');
      const fontToggle = GeneralHandler.createToggle('Text Font', FormTextAddComponent.textFont, textContentContainer, 'TransportMedium', editingTextObject ? FormTextAddComponent.liveUpdateText : FormTextAddComponent.TextInputHandler);

      // Create a container for location selection
      const locationContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      const regionLabel = GeneralHandler.createNode("div", { 'class': 'placeholder' }, locationContainer);
      regionLabel.innerHTML = "Destination Selector";

      // Extract region names from destinations array
      const regionNames = EngDestinations.map(region => Object.keys(region)[0]);

      // Create language toggle
      const languageToggle = GeneralHandler.createToggle('Language', ['English', 'Chinese'], locationContainer, 'English', FormTextAddComponent.updateLocationDropdown);

      // Create region toggle
      const regionToggle = GeneralHandler.createToggle('Region', regionNames, locationContainer, regionNames[0], FormTextAddComponent.updateLocationDropdown);

      // Create location dropdown
      const locationDropdownContainer = GeneralHandler.createNode("div", { 'class': 'location-dropdown-container' }, locationContainer);

      // Create the select element for locations
      const locationSelect = GeneralHandler.createNode("select", { 'class': 'input', 'id': 'location-select' }, locationDropdownContainer, FormTextAddComponent.locationSelected, 'change');

      // Initialize the location dropdown with locations from the first region
      FormTextAddComponent.populateLocationDropdown(regionNames[0], "English");
    }
  },

  /**
   * Updates the location dropdown when a region is selected
   */
  updateLocationDropdown: function (selectedButton) {
    const regionName = GeneralHandler.getToggleValue('Region-container')
    const language = GeneralHandler.getToggleValue('Language-container')
    FormTextAddComponent.populateLocationDropdown(regionName, language);
  },

  /**
   * Populates the location dropdown with locations from the selected region
   */
  populateLocationDropdown: function (regionName, language) {
    const locationSelect = document.getElementById('location-select');
    if (!locationSelect) return;

    // Clear existing options
    locationSelect.innerHTML = '';

    // Add a default empty option
    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.text = '-- Select Location --';
    locationSelect.appendChild(defaultOption);

    // Find the selected region in the destinations array
    const languageSet = language == "English" ? EngDestinations : ChtDestinations
    const selectedRegion = languageSet.find(region => Object.keys(region)[0] === regionName);
    if (!selectedRegion) return;

    // Get the locations array for the selected region
    const locations = selectedRegion[regionName];

    // Add an option for each location
    locations.forEach(location => {
      const option = document.createElement('option');
      option.value = location;
      option.text = location;
      locationSelect.appendChild(option);
    });
  },

  /**
   * Handler for when a location is selected from the dropdown
   */
  locationSelected: function (event) {
    const selectedLocation = event.target.value;
    if (!selectedLocation) return;

    // Update the text input with the selected location
    const textInput = document.getElementById('input-text');
    if (textInput) {
      textInput.value = selectedLocation;

      // Determine if we're editing or creating
      const activeObject = canvas.getActiveObject();

      // If we already have a new text object being placed, update it
      if (FormTextAddComponent.newTextObject && canvas.contains(FormTextAddComponent.newTextObject)) {
        const xHeight = parseInt(document.getElementById('input-xHeight').value);
        const font = document.getElementById('Text Font-container').selected.getAttribute('data-value');
        const color = document.getElementById('Message Colour-container').selected.getAttribute('data-value');
        FormTextAddComponent.newTextObject.updateText(selectedLocation, xHeight, font, color);
        canvas.renderAll();
      }
      // If we're editing an existing text object
      else if (activeObject && activeObject.functionalType === 'Text') {
        FormTextAddComponent.liveUpdateText();
      }
      // Otherwise create a new text object
      else {
        FormTextAddComponent.TextInputHandler(null, {
          text: selectedLocation,
          xHeight: parseInt(document.getElementById('input-xHeight').value),
          font: document.getElementById('Text Font-container').selected.getAttribute('data-value'),
          color: document.getElementById('Message Colour-container').selected.getAttribute('data-value')
        });
      }
    }
  },

  /**
   * Live update text as the user types or changes parameters
   */
  liveUpdateText: function () {
    // Make sure we're not in placement mode
    if (FormTextAddComponent.newTextObject) {
      // If in placement mode, update the new object being placed
      const newText = document.getElementById('input-text').value;
      const newXHeight = parseInt(document.getElementById('input-xHeight').value);
      const newFont = document.getElementById('Text Font-container').selected.getAttribute('data-value');
      const newColor = document.getElementById('Message Colour-container').selected.getAttribute('data-value');

      FormTextAddComponent.newTextObject.updateText(newText, newXHeight, newFont, newColor);
      return;
    }

    // Otherwise update the selected object
    canvas.off('mouse:move', FormTextAddComponent.TextOnMouseMove);
    canvas.off('mouse:down', FormTextAddComponent.TextOnMouseClick);
    canvas.on('mouse:down', FormTextAddComponent.EditOnMouseClick);

    const textObj = canvas.getActiveObject();
    if (!textObj || textObj.functionalType !== 'Text') return;
    const newText = document.getElementById('input-text').value;
    const newXHeight = parseInt(document.getElementById('input-xHeight').value);
    const newFont = document.getElementById('Text Font-container').selected.getAttribute('data-value');
    const newColor = document.getElementById('Message Colour-container').selected.getAttribute('data-value');

    // Only call updateText if there are actual changes
    if (
      newText !== textObj.text ||
      newXHeight !== textObj.xHeight ||
      newFont !== textObj.font ||
      newColor !== textObj.color
    ) {
      textObj.updateText(newText, newXHeight, newFont, newColor);
    }
  },

  TextHandlerOff: function () {
    // If there's a new text object being placed, keep it but finalize its placement
    if (FormTextAddComponent.newTextObject) {
      if (activeVertex) {
        activeVertex.finishDrag();
      }
      FormTextAddComponent.newTextObject = null;
    }

    cursor.forEachObject(function (o) { cursor.remove(o) });
    canvas.off('mouse:move', FormTextAddComponent.TextOnMouseMove);
    canvas.off('mouse:down', FormTextAddComponent.TextOnMouseClick);
    canvas.off('mouse:down', FormTextAddComponent.EditOnMouseClick);
    document.addEventListener('keydown', ShowHideSideBarEvent);
    document.removeEventListener('keydown', FormTextAddComponent.cancelInput);

    // Remove input event listeners
    const textInput = document.getElementById('input-text');
    if (textInput) {
      textInput.removeEventListener('input', FormTextAddComponent.liveUpdateText);
    }

    const xHeightInput = document.getElementById('input-xHeight');
    if (xHeightInput) {
      xHeightInput.removeEventListener('input', FormTextAddComponent.liveUpdateText);
    }

    const colorButtons = document.querySelectorAll('#Message\\ Colour-container .toggle-button');
    colorButtons.forEach(button => {
      button.removeEventListener('click', FormTextAddComponent.liveUpdateText);
    });

    const fontButtons = document.querySelectorAll('#Text\\ Font-container .toggle-button');
    fontButtons.forEach(button => {
      button.removeEventListener('click', FormTextAddComponent.liveUpdateText);
    });

    canvas.renderAll();
  },

  cancelInput: function (event) {
    if (event.key === 'Escape') {
      // If there's a newly created text object being placed, delete it
      if (FormTextAddComponent.newTextObject && canvas.contains(FormTextAddComponent.newTextObject)) {
        FormTextAddComponent.newTextObject.deleteObject();
        FormTextAddComponent.newTextObject = null;
      }

      document.getElementById('input-text').value = '';
      cursor.forEachObject(function (o) { cursor.remove(o) });

      // Clean up active vertex if there is one
      if (activeVertex) {
        activeVertex.cleanupDrag();
        activeVertex = null;
      }

      canvas.renderAll();
    }
  },

  TextInputHandler: function (event, options = null) {
    document.removeEventListener('keydown', ShowHideSideBarEvent);
    document.addEventListener('keydown', FormTextAddComponent.cancelInput);

    // Clear any existing cursor objects
    cursor.forEachObject(function (o) { cursor.remove(o) });

    // Get text and parameters
    const txt = options ? options.text : document.getElementById('input-text').value;
    if (!txt || txt.trim() === '') return; // Don't create empty text

    const xHeight = options ? options.xHeight : parseInt(document.getElementById('input-xHeight').value);
    const font = options ? options.font : document.getElementById('Text Font-container').selected.getAttribute('data-value');
    const color = options ? options.color : document.getElementById('Message Colour-container').selected.getAttribute('data-value');

    // If we already have a new text object being placed, just update it instead of creating another
    if (FormTextAddComponent.newTextObject && canvas.contains(FormTextAddComponent.newTextObject)) {
      FormTextAddComponent.newTextObject.updateText(txt, xHeight, font, color);
      canvas.renderAll();
      return;
    }

    // Center the object on the canvas viewport
    const centerX = canvas.width / 2 / canvas.getZoom();
    const centerY = canvas.height / 2 / canvas.getZoom();

    // Account for any panning that has been done
    const vpt = CenterCoord();
    const actualCenterX = vpt.x;
    const actualCenterY = vpt.y;

    // Create a real TextObject that will be placed on the canvas
    const textObject = new TextObject({
      text: txt,
      xHeight: xHeight,
      font: font,
      color: color,
      left: actualCenterX,
      top: actualCenterY
    });

    // Store reference to the newly created object
    FormTextAddComponent.newTextObject = textObject;

    // Add mouse move handler to position the object
    canvas.on('mouse:move', FormTextAddComponent.TextOnMouseMove);
    canvas.on('mouse:down', FormTextAddComponent.TextOnMouseClick);

    // Activate the vertex control immediately to enable dragging and snapping
    if (textObject.controls && textObject.controls.E1) {
      activeVertex = textObject.controls.E1;
      activeVertex.isDown = true;
      activeVertex.originalPosition = {
        left: textObject.left,
        top: textObject.top
      };
      activeVertex.vertexOriginalPosition = {
        x: textObject.getBasePolygonVertex('E1').x,
        y: textObject.getBasePolygonVertex('E1').y
      };
      activeVertex.vertexOffset = {
        x: textObject.getBasePolygonVertex('E1').x - textObject.left,
        y: textObject.getBasePolygonVertex('E1').y - textObject.top
      };

      // Create indicator for the active vertex
      if (activeVertex.createIndicator) {
        activeVertex.createIndicator(textObject.getBasePolygonVertex('E1').x, textObject.getBasePolygonVertex('E1').y);
      }
    }

    canvas.renderAll();
  },

  TextOnMouseMove: function (event) {
    if (FormTextAddComponent.newTextObject && activeVertex) {
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
        FormTextAddComponent.newTextObject.set({
          left: pointer.x,
          top: pointer.y
        });
        FormTextAddComponent.newTextObject.setCoords();
        canvas.renderAll();
      }
    } else {
      // Legacy cursor behavior as fallback
      var pointer = canvas.getPointer(event.e);
      cursor.set({
        left: pointer.x,
        top: pointer.y
      });
      canvas.renderAll();
    }
  },

  TextOnMouseClick: function (event, options = null) {
    if (event.e.button !== 0) return;
    // Disable default click behavior after creating the object
    if (FormTextAddComponent.newTextObject) {
      // Complete the placement
      if (activeVertex) {
        // Finish the vertex drag
        activeVertex.handleMouseDownRef(event);
      }

      // Clean up
      canvas.off('mouse:move', FormTextAddComponent.TextOnMouseMove);
      canvas.off('mouse:down', FormTextAddComponent.TextOnMouseClick);

      // Reset state
      FormTextAddComponent.newTextObject = null;
      activeVertex = null;
      document.getElementById('input-text').value = '';

      // Reattach default keyboard event listener
      document.removeEventListener('keydown', FormTextAddComponent.cancelInput);
      document.addEventListener('keydown', ShowHideSideBarEvent);

      canvas.renderAll();
      return;
    }

    // Legacy options handling - should rarely be used now
    if (options) {
      cursor.set({
        left: options.left,
        top: options.top,
        text: options.text,
        xHeight: options.xHeight,
        font: options.font,
        color: options.color
      });
      textValue = options.text;
      xHeight = options.xHeight;
      color = options.color;
      font = options.font;

      eventButton = 0;
    } else {
      textValue = document.getElementById("input-text").value;
      xHeight = parseInt(document.getElementById('input-xHeight').value);
      color = document.getElementById('Message Colour-container').selected.getAttribute('data-value');
      font = document.getElementById('Text Font-container').selected.getAttribute('data-value');
      eventButton = event.e.button;
    }

    // For new text creation (legacy path, should be replaced by the new approach)
    if (textValue !== '' && eventButton === 0 && !FormTextAddComponent.newTextObject) {
      // Call the new method that creates a direct TextObject
      FormTextAddComponent.TextInputHandler(null, {
        text: textValue,
        xHeight: xHeight,
        font: font,
        color: color
      });
    }
  },

  EditOnMouseClick: function (event) {
    document.getElementById('input-text').value = '';
    FormTextAddComponent.textPanelInit(null);
  }
}

/* Draw Map Panel */
let FormDrawMapComponent = {
  MapType: ['Main Line', 'Conventional Roundabout', 'Spiral Roundabout',],
  EndShape: ['Arrow', 'Stub'],
  RoundaboutFeatures: ['Conventional','Auxiliary', 'U-turn'],
  permitAngle: [45, 60, 90],
  defaultRoute: [{ x: 0, y: 7, angle: 60, width: 4, shape: 'Arrow' }],

  /**
   * Initializes the map drawing panel with input fields and buttons
   * @return {void}
   */
  drawMapPanelInit: function () {
    tabNum = 4
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      parent.routeCount = 0
      // Create a container for basic parameters
      var basicParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      GeneralHandler.createInput('input-xHeight', 'x Height', basicParamsContainer, 100, null, 'input')
      GeneralHandler.createToggle('Message Colour', ['Black', 'White'], basicParamsContainer, 'White', drawMainRoadOnCursor)

      // Create a container for route parameters
      var MainRoadParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      GeneralHandler.createToggle('Main Road Type', FormDrawMapComponent.MapType, MainRoadParamsContainer, 'Main Line', FormDrawMapComponent.updateRoadTypeSettings)
      //const drawMapButton = GeneralHandler.createButton('button-DrawMap', 'Draw Main Road Symbol', MainRoadParamsContainer, 'input', drawMainRoadOnCursor, 'click');

      // Create a container for road type-specific settings
      const roadTypeSettingsContainer = GeneralHandler.createNode("div", { 'class': 'road-type-settings' }, MainRoadParamsContainer);


      // Initial setup of settings based on default selection
      FormDrawMapComponent.updateRoadTypeSettings(roadTypeSettingsContainer);


      // Create the Draw Map button
      const drawMapButton = GeneralHandler.createButton('button-DrawMap', 'Draw Main Road Symbol', MainRoadParamsContainer, 'input', FormDrawMapComponent.gatherMainRoadParams, 'click');

      const existingRoute = canvas.getActiveObjects().length == 1 && canvas.getActiveObject.functionalType == 'MainRoute' ? canvas.getActiveObjects()[0] : null
      const routeList = existingRoute ? existingRoute.routeList : FormDrawMapComponent.defaultRoute

      if (routeList) {
        routeList.forEach((route, index) => {
          var SideRoadParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
          const addRouteButton = GeneralHandler.createButton('button-addRoute', '+ Another Route Destination', SideRoadParamsContainer, 'input', FormDrawMapComponent.addRouteInput, 'click');
          if (canvas.getActiveObjects().length == 1 && canvas.getActiveObject.functionalType === 'MainRoad') {
            addRouteButton.classList.add('deactive'); // Set initial state to deactive
            addRouteButton.disabled = true;
          }
          GeneralHandler.createInput(`Side Road width`, `Side Road Width`, SideRoadParamsContainer, 4, null, 'input')
          GeneralHandler.createToggle(`Side Road Shape`, FormDrawMapComponent.EndShape, SideRoadParamsContainer, route.shape, null)

          var angleContainer = GeneralHandler.createNode("div", { 'class': 'angle-picker-container' }, SideRoadParamsContainer);
          GeneralHandler.createButton(`rotate-left`, '<i class="fa-solid fa-rotate-left"></i>', angleContainer, null, FormDrawMapComponent.setAngle, 'click')
          var angleDisplay = GeneralHandler.createNode("div", { 'id': `angle-display`, 'class': 'angle-display' }, angleContainer);
          angleDisplay.innerText = route.angle + '°';
          parent.routeCount += 1
        })
      }
    }
  },

  // Function to show the appropriate settings based on selected road type
  updateRoadTypeSettings: function () {
    // Clear current settings
    const roadTypeSettingsContainer = document.querySelector('.road-type-settings');
    roadTypeSettingsContainer.innerHTML = '';

    // Get selected road type
    const roadType = GeneralHandler.getToggleValue('Main Road Type-container');

    // Show settings based on road type
    if (roadType === 'Main Line') {
      // Main Line settings
      GeneralHandler.createInput('root-length', 'Main Road Root Length', roadTypeSettingsContainer, 7, drawMainRoadOnCursor, 'input');
      GeneralHandler.createInput('tip-length', 'Main Road Tip Length', roadTypeSettingsContainer, 12, drawMainRoadOnCursor, 'input');
      GeneralHandler.createInput('main-width', 'Main Road Width', roadTypeSettingsContainer, 6, drawMainRoadOnCursor, 'input');
      GeneralHandler.createToggle(`Main Road Shape`, FormDrawMapComponent.EndShape, roadTypeSettingsContainer, 'Arrow', drawMainRoadOnCursor);
    } else if (roadType === 'Conventional Roundabout') {
      // Placeholder for Conventional Roundabout settings

      GeneralHandler.createToggle(`Roundabout Features`, FormDrawMapComponent.RoundaboutFeatures, roadTypeSettingsContainer, 'Conventional', drawMainRoadOnCursor);
      } else if (roadType === 'Spiral Roundabout') {
      // Placeholder for Spiral Roundabout settings
      
      GeneralHandler.createToggle(`Roundabout Features`, FormDrawMapComponent.RoundaboutFeatures, roadTypeSettingsContainer, 'Conventional', drawMainRoadOnCursor);
      }
  },

  gatherMainRoadParams: function () {
    const xHeight = parseInt(document.getElementById('input-xHeight').value);
    const color = document.getElementById('Message Colour-container').selected.getAttribute('data-value');
    const roadType = GeneralHandler.getToggleValue('Main Road Type-container');

    const rootLengthElement = document.getElementById('root-length');
    const tipLengthElement = document.getElementById('tip-length');
    const mainWidthElement = document.getElementById('main-width');
    const mainRoadShapeContainer = document.getElementById('Main Road Shape-container');
    const roundaboutFeaturesContainer = document.getElementById('Roundabout Features-container');

    const rootLength = rootLengthElement ? parseInt(rootLengthElement.value) : null;
    const tipLength = tipLengthElement ? parseInt(tipLengthElement.value) : null;
    const mainWidth = mainWidthElement ? parseInt(mainWidthElement.value) : null;
    const endShape = mainRoadShapeContainer ? GeneralHandler.getToggleValue('Main Road Shape-container') : null;
    const roundaboutFeatures = roundaboutFeaturesContainer ? GeneralHandler.getToggleValue('Roundabout Features-container') : null;

    const mainRoadParams = {
      xHeight: xHeight,
      color: color,
      roadType: roadType,
      rootLength: rootLength,
      tipLength: tipLength,
      mainWidth: mainWidth,
      endShape: endShape,
      roundaboutFeatures: roundaboutFeatures
    };

    drawMainRoadOnCursor(null, mainRoadParams);
  },

  /**
   * Adds new route inputs to the panel based on active object's route list
   * @param {Event} event - The triggering event object
   * @return {void} 
   */
  addRouteInput: function (event) {
    var parent = document.getElementById("input-form");
    const existingRoute = canvas.getActiveObjects()

    if (existingRoute.length == 1 && existingRoute[0].functionalType === 'MainRoad') {
      canvas.off('mouse:move', drawSideRoadOnCursor)
      canvas.on('mouse:move', drawSideRoadOnCursor)
    }

  },

  /**
   * Sets angle for route based on button clicks
   * @param {Event} event - Click event
   * @return {void}
   */
  setAngle: function (event) {
    // Find the parent container element
    const parentContainer = event.currentTarget.parentNode;
    // Find the angle display element within the same container
    const angleDisplay = parentContainer.querySelector('[id^="angle-display"]');
    // Extract the current angle value
    const currentText = angleDisplay.innerText.slice(0, -1); // Remove the degree symbol

    const angleIndex = FormDrawMapComponent.permitAngle.indexOf(parseInt(currentText))
    //FormDrawMapComponent.routeAngle = FormDrawMapComponent.permitAngle[(angleIndex + 1) % FormDrawMapComponent.permitAngle.length]

    angleDisplay.innerText = FormDrawMapComponent.permitAngle[(angleIndex + 1) % FormDrawMapComponent.permitAngle.length] + '°';
  }
}

/* Draw Symbol Panel */
let FormDrawAddComponent = {
  symbolAngle: 0,
  newSymbolObject: null,

  drawPanelInit: async function () {
    tabNum = 1
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      // Create a container for basic symbol parameters
      var basicParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      GeneralHandler.createInput('input-xHeight', 'x Height', basicParamsContainer, 100, null, 'input')
      GeneralHandler.createToggle('Message Colour', ['Black', 'White'], basicParamsContainer, 'White', FormDrawAddComponent.addAllSymbolsButton)

      // Create a container for angle controls
      var angleControlContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      // Replace slider with two rotate buttons:
      var angleContainer = GeneralHandler.createNode("div", { 'class': 'angle-picker-container' }, angleControlContainer);

      var btnRotateLeft = GeneralHandler.createButton(`rotate-left`, '<i class="fa-solid fa-rotate-left"></i>', angleContainer, null, FormDrawAddComponent.setAngle, 'click')

      var btnRotateRight = GeneralHandler.createButton(`rotate-right`, '<i class="fa-solid fa-rotate-right"></i>', angleContainer, null, FormDrawAddComponent.setAngle, 'click')

      var angleDisplay = GeneralHandler.createNode("div", { 'id': 'angle-display', 'class': 'angle-display' }, angleContainer);
      angleDisplay.innerText = FormDrawAddComponent.symbolAngle + '°';

      FormDrawAddComponent.addAllSymbolsButton()
    }
  },

  addAllSymbolsButton: function () {
    const parent = document.getElementById("input-form");
    const color = document.getElementById('Message Colour-container').selected.getAttribute('data-value')
    // Clear any existing symbol containers
    const existingSymbolContainers = parent.querySelectorAll('.symbol-container');
    if (existingSymbolContainers.length > 0) {
      existingSymbolContainers.forEach(container => {
        container.remove();
      });
    }
    Object.keys(symbolsTemplate).forEach(async (symbol) => {
      const svg = await FormDrawAddComponent.createButtonSVG(symbol, 5, color)
      GeneralHandler.createSVGButton(`button-${symbol}`, svg, parent, 'symbol', FormDrawAddComponent.createSymbolObject, 'click')
    })
  },

  setAngle: function (event) {
    if (event.currentTarget.id.search('left') > -1) {
      FormDrawAddComponent.symbolAngle = FormDrawAddComponent.symbolAngle - 45
    } else {
      FormDrawAddComponent.symbolAngle = FormDrawAddComponent.symbolAngle + 45
    }
    FormDrawAddComponent.symbolAngle = FormDrawAddComponent.symbolAngle > 90 ? -90 : FormDrawAddComponent.symbolAngle
    FormDrawAddComponent.symbolAngle = FormDrawAddComponent.symbolAngle < -90 ? +90 : FormDrawAddComponent.symbolAngle

    // Handle the angle selection
    document.getElementById('angle-display').innerText = FormDrawAddComponent.symbolAngle + '°';

    // Update the new symbol object if it exists
    if (FormDrawAddComponent.newSymbolObject) {
      FormDrawAddComponent.updateSymbolAngle(FormDrawAddComponent.newSymbolObject);
    }

    canvas.renderAll();
  },

  DrawHandlerOff: function (event) {
    // If there's a new symbol object being placed, finalize its placement
    if (FormDrawAddComponent.newSymbolObject) {
      if (activeVertex) {
        activeVertex.finishDrag();
      }
      FormDrawAddComponent.newSymbolObject = null;
    }

    // Remove any cursor objects
    cursor.forEachObject(function (o) { cursor.remove(o) })

    // Remove event listeners
    canvas.off('mouse:move', FormDrawAddComponent.SymbolOnMouseMove);
    canvas.off('mouse:down', FormDrawAddComponent.SymbolOnMouseClick);
    document.removeEventListener('keydown', FormDrawAddComponent.cancelDraw);
    document.addEventListener('keydown', ShowHideSideBarEvent);

    canvas.renderAll();
  },

  // Create a new symbol object directly instead of using cursor
  createSymbolObject: async function (event) {
    // Clear any previous symbol being placed
    if (FormDrawAddComponent.newSymbolObject) {
      canvas.remove(FormDrawAddComponent.newSymbolObject);
      FormDrawAddComponent.newSymbolObject = null;
    }

    // Remove event listeners
    document.removeEventListener('keydown', ShowHideSideBarEvent);
    document.addEventListener('keydown', FormDrawAddComponent.cancelDraw);

    // Get symbol type and parameters from the button or defaults
    const symbolType = event.currentTarget.id.replace('button-', '');
    const xHeight = parseInt(document.getElementById('input-xHeight').value);
    const color = document.getElementById('Message Colour-container').selected.getAttribute('data-value');

    // Account for any panning that has been done
    const vpt = CenterCoord();
    const actualCenterX = vpt.x;
    const actualCenterY = vpt.y;

    // Create the symbol directly
    const symbolObject = await drawSymbolDirectly(symbolType, {
      x: actualCenterX,
      y: actualCenterY,
      length: xHeight / 4,
      angle: FormDrawAddComponent.symbolAngle,
      color: color
    });

    // Store reference to the new symbol
    FormDrawAddComponent.newSymbolObject = symbolObject;

    // Add mouse event handlers for placement
    canvas.on('mouse:move', FormDrawAddComponent.SymbolOnMouseMove);
    canvas.on('mouse:down', FormDrawAddComponent.SymbolOnMouseClick);

    // Activate the vertex control immediately to enable dragging and snapping
    if (symbolObject.controls && symbolObject.controls.V1) {
      activeVertex = symbolObject.controls.V1;
      activeVertex.isDown = true;
      activeVertex.originalPosition = {
        left: symbolObject.left,
        top: symbolObject.top
      };

      // Store vertex information
      const v1 = symbolObject.getBasePolygonVertex('V1');
      if (v1) {
        activeVertex.vertexOriginalPosition = {
          x: v1.x,
          y: v1.y
        };
        activeVertex.vertexOffset = {
          x: v1.x - symbolObject.left,
          y: v1.y - symbolObject.top
        };

        // Create indicator for the active vertex
        if (activeVertex.createIndicator) {
          activeVertex.createIndicator(v1.x, v1.y);
        }
      }
    }

    canvas.renderAll();
  },

  // Helper function to update symbol angle
  updateSymbolAngle: async function (symbolObject) {
    if (!symbolObject) return;

    const symbolType = symbolObject.symbol;
    const xHeight = symbolObject.xHeight;
    const color = symbolObject.color;
    const position = {
      x: symbolObject.left,
      y: symbolObject.top
    };

    // Create new symbol with updated angle
    const newSymbolObject = await drawSymbolDirectly(symbolType, {
      x: position.x,
      y: position.y,
      length: xHeight / 4,
      angle: FormDrawAddComponent.symbolAngle,
      color: color
    });

    // Replace on canvas
    canvas.remove(symbolObject);
    FormDrawAddComponent.newSymbolObject = newSymbolObject;

    // Re-activate vertex control
    if (newSymbolObject.controls && newSymbolObject.controls.V1) {
      activeVertex = newSymbolObject.controls.V1;
      activeVertex.isDown = true;
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

        // Create indicator for the active vertex
        if (activeVertex.createIndicator) {
          activeVertex.createIndicator(v1.x, v1.y);
        }
      }
    }
  },

  SymbolOnMouseMove: function (event) {
    if (FormDrawAddComponent.newSymbolObject && activeVertex) {
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
        FormDrawAddComponent.newSymbolObject.set({
          left: pointer.x,
          top: pointer.y
        });
        FormDrawAddComponent.newSymbolObject.setCoords();
        canvas.renderAll();
      }
    }
  },

  SymbolOnMouseClick: function (event) {
    if (event.e.button !== 0) return;
    // Finalize symbol placement on click
    if (FormDrawAddComponent.newSymbolObject && event.e.button === 0) {
      // Complete the placement
      if (activeVertex) {
        activeVertex.handleMouseDownRef(event);
      }

      // Clean up
      canvas.off('mouse:move', FormDrawAddComponent.SymbolOnMouseMove);
      canvas.off('mouse:down', FormDrawAddComponent.SymbolOnMouseClick);

      // Reset state
      const placedSymbol = FormDrawAddComponent.newSymbolObject;
      FormDrawAddComponent.newSymbolObject = null;
      activeVertex = null;

      // Reattach default keyboard event listener
      document.removeEventListener('keydown', FormDrawAddComponent.cancelDraw);
      document.addEventListener('keydown', ShowHideSideBarEvent);

      canvas.renderAll();
      return placedSymbol;
    }
  },

  cancelDraw: function (event) {
    if (event.key === 'Escape') {
      // If there's a new symbol object being placed, remove it
      if (FormDrawAddComponent.newSymbolObject) {
        FormDrawAddComponent.newSymbolObject.deleteObject();
        FormDrawAddComponent.newSymbolObject = null;
      }

      // Clean up active vertex if there is one
      if (activeVertex) {
        activeVertex.cleanupDrag();
        activeVertex = null;
      }

      // Restore event listeners
      canvas.off('mouse:move', FormDrawAddComponent.SymbolOnMouseMove);
      canvas.off('mouse:down', FormDrawAddComponent.SymbolOnMouseClick);
      document.removeEventListener('keydown', FormDrawAddComponent.cancelDraw);
      document.addEventListener('keydown', ShowHideSideBarEvent);

      canvas.renderAll();
    }
  },

  createButtonSVG: async (symbolType, length, color = 'white') => {
    const symbolData = calcSymbol(symbolType, length, color);

    let pathData = await vertexToPath(symbolData, color);

    const svgWidth = 100;
    const svgHeight = 100;

    // Calculate the bounding box of the path
    const tempPath = new fabric.Path(pathData, { strokeWidth: 0 });
    let symbolSize = { width: tempPath.width, height: tempPath.height, left: tempPath.left, top: tempPath.top };
    // override the err width and height of symbol with circular border
    if (symbolType === 'MTR') {
      symbolSize.width = 130;
    }
    if (symbolType === 'Hospital') {
      symbolSize.width = color == 'White' ? 80 : 90;
    }
    const scaleX = svgWidth / symbolSize.width;
    const scaleY = svgHeight / symbolSize.height;
    const scale = Math.min(scaleX, scaleY);

    // Calculate the translation to center the path
    const translateX = (svgWidth - symbolSize.width * scale) / 2 - symbolSize.left * scale;
    const translateY = (svgHeight - symbolSize.height * scale) / 2 - symbolSize.top * scale;

    pathData = pathData.replace(/<svg>/g, '<svg style="width:100;height:100;">')
    pathData = pathData.replace(/<path/g, `<path transform="translate(${translateX}, ${translateY}) scale(${scale})"`);
    return pathData;
  }
}

/* Border Panel */
let FormBorderWrapComponent = {
  BorderPanelInit: function () {
    tabNum = 3
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      // Create a container for border parameters
      var borderParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      GeneralHandler.createInput('input-xHeight', 'x Height', borderParamsContainer, 100)



      // Color scheme selection remains as dropdown
      GeneralHandler.createSelect('input-color', 'Select Color Scheme', Object.keys(BorderColorScheme), borderParamsContainer, null, FormBorderWrapComponent.createBorderButtons, 'change')


      // Create a container for border actions
      var borderActionsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      //GeneralHandler.createButton('input-border', 'Select Objects for border', borderActionsContainer, 'input', FormBorderWrapComponent.BorderCreateHandler, 'click')
      GeneralHandler.createButton('input-HDivider', 'Add stack border divider', borderActionsContainer, 'input', FormBorderWrapComponent.StackDividerHandler, 'click')
      GeneralHandler.createButton('input-VDivider', 'Add gantry border divider', borderActionsContainer, 'input', FormBorderWrapComponent.GantryDividerHandler, 'click')

      // Create a container for border type selection with SVG buttons
      var borderTypeContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container', 'id': 'border-select-container' }, parent);
      const borderTypeHeader = GeneralHandler.createNode("div", { 'class': 'placeholder' }, borderTypeContainer);
      borderTypeHeader.innerHTML = "Select Border Type";
      FormBorderWrapComponent.createBorderButtons()
    }
  },

  createBorderButtons: function () {
    const parent = document.getElementById('border-select-container');
    // Clear any existing border buttons
    const existingBorderButtons = parent.querySelectorAll('.border-container');
    if (existingBorderButtons.length > 0) {
      existingBorderButtons.forEach(button => {
        button.remove();
      });
    }

    // Create a mock bbox for the border preview
    const xHeight = 20; // Small size for the preview
    const bbox = {
      left: 0,
      top: 0,
      width: 161,
      height: 100
    };

    // Create SVG buttons for each border type
    Object.keys(BorderTypeScheme).forEach(async (borderType) => {
      const shapeMeta = BorderTypeScheme[borderType](xHeight, bbox,);
      const svg = await FormBorderWrapComponent.createBorderSVG(shapeMeta,)
      GeneralHandler.createSVGButton(`button-${borderType}`, svg, parent, 'border', FormBorderWrapComponent.BorderCreateHandler, 'click')
    });
  },

  createBorderSVG: async (shapeMeta,) => {
    const colorScheme = document.getElementById('input-color').value;
    const color = BorderColorScheme[colorScheme];
    let pathData = await vertexToPath(shapeMeta, color);
    pathData = pathData.replace(/fill="border"/g, `fill="${color.border}"`);
    pathData = pathData.replace(/fill="symbol"/g, `fill="${color.symbol}"`);
    pathData = pathData.replace(/fill="background"/g, `fill="${color.background}"`);

    const svgWidth = 160;
    const svgHeight = 100;

    // Calculate the bounding box of the path  

    const GroupedBorder = new fabric.Path(pathData);
    let symbolSize = { width: GroupedBorder.width, height: GroupedBorder.height, left: GroupedBorder.left, top: GroupedBorder.top };

    const scaleX = svgWidth / symbolSize.width;
    const scaleY = svgHeight / symbolSize.height;
    const scale = Math.min(scaleX, scaleY);

    // Calculate the translation to center the path
    const translateX = (svgWidth - symbolSize.width * scale) / 2 - symbolSize.left * scale;
    const translateY = (svgHeight - symbolSize.height * scale) / 2 - symbolSize.top * scale;

    pathData = pathData.replace(/<svg>/g, `<svg style="width:${svgWidth};height:${svgHeight};">`)
    pathData = pathData.replace(/<path/g, `<path transform="translate(${translateX}, ${translateY}) scale(${scale})"`);
    return pathData;

  },

  BorderCreateHandler: async function (event) {
    const borderType = event.currentTarget.id.replace('button-', '');
    selectObjectHandler('Select shape to calculate border width', function (widthObjects, options, widthText) {
      selectObjectHandler('Select shape to calculate border height', function (heightObjects, options, heightText) {
        BorderUtilities.BorderGroupCreate(borderType, heightObjects, widthObjects, widthText, heightText)
      })
    })
  },

  StackDividerHandler: function () {
    selectObjectHandler('Select object above divider', function (aboveObject) {
      selectObjectHandler('Select object below divider', function (belowObject) {
        BorderUtilities.HDividerCreate(aboveObject, belowObject)
      })
    })
  },

  GantryDividerHandler: function () {
    selectObjectHandler('Select object left to divider', function (leftObject) {
      selectObjectHandler('Select object right to divider', function (rightObject) {
        BorderUtilities.VDividerCreate(leftObject, rightObject)
      })
    })
  }
}

/* Export Panel */
let FormExportComponent = {
  // Export settings for canvas objects
  exportSettings: {
    filename: 'traffic-sign-export',
    quality: 1.0,
    multiplier: 1.0
  },


  exportPanelInit: function (parent) {
    tabNum = 5
    var parent = GeneralHandler.PanelInit()
    // Create container for export options
    const exportContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);

    // Create filename input
    const filenameInput = GeneralHandler.createInput('export-filename', 'Filename', exportContainer,
      FormExportComponent.exportSettings.filename, (e) => {
        FormExportComponent.exportSettings.filename = e.target.value;
      }, 'input');

    // Create quality selector for raster formats
    const qualitySelect = GeneralHandler.createSelect('export-quality', 'Quality',
      ['1.0', '0.9', '0.8', '0.7', '0.5'], exportContainer, '1.0',
      (e) => {
        FormExportComponent.exportSettings.quality = parseFloat(e.target.value);
      });

    // Create scale multiplier
    const scaleInput = GeneralHandler.createInput('export-scale', 'Scale Multiplier', exportContainer,
      FormExportComponent.exportSettings.multiplier, (e) => {
        FormExportComponent.exportSettings.multiplier = parseFloat(e.target.value);
      }, 'input');

    // Create toggle for including/excluding grid
    GeneralHandler.createToggle('Include Grid', ['No', 'Yes'], exportContainer, 'No');

    // Create toggle for including/excluding background
    GeneralHandler.createToggle('Include Background', ['No', 'Yes'], exportContainer, 'No');

    // Create export buttons
    const buttonContainer = GeneralHandler.createNode("div", { 'class': 'export-buttons-container' }, exportContainer);

    // PNG Export
    GeneralHandler.createButton('export-png', 'Export as PNG', buttonContainer, 'input',
      FormExportComponent.exportToPNG, 'click');

    // SVG Export
    GeneralHandler.createButton('export-svg', 'Export as SVG', buttonContainer, 'input',
      FormExportComponent.exportToSVG, 'click');

    // PDF Export
    GeneralHandler.createButton('export-pdf', 'Export as PDF', buttonContainer, 'input',
      FormExportComponent.exportToPDF, 'click');
  },

  // Helper function to prepare canvas for export
  prepareCanvasForExport: function () {
    const includeGrid = GeneralHandler.getToggleValue('Include Grid-container') === 'Yes';
    const includeBackground = GeneralHandler.getToggleValue('Include Background-container') === 'Yes';

    // Store original canvas state
    const originalState = {
      backgroundColor: canvas.backgroundColor,
      width: canvas.width,
      height: canvas.height,
      viewportTransform: [...canvas.viewportTransform],
      zoom: canvas.getZoom(),
      objects: canvas.getObjects().map(obj => ({
        obj: obj,
        visible: obj.visible
      }))
    };

    // Calculate the bounding box that contains all visible objects (excluding grid)
    const visibleObjects = canvas.getObjects().filter(obj =>
      obj.visible && (includeGrid || obj.id !== 'grid')
    );

    if (visibleObjects.length > 0) {
      // Find the bounds of all objects
      let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

      visibleObjects.forEach(obj => {
        // Get the object's bounding rect in canvas coordinates
        const rect = obj.getBoundingRect();
        minX = Math.min(minX, rect.left);
        minY = Math.min(minY, rect.top);
        maxX = Math.max(maxX, rect.left + rect.width);
        maxY = Math.max(maxY, rect.top + rect.height);
      });

      // Add padding around the objects
      const padding = 20;
      minX -= padding;
      minY -= padding;
      maxX += padding;
      maxY += padding;

      // Calculate dimensions
      const width = maxX - minX;
      const height = maxY - minY;

      // Store the calculated export bounds for later use
      originalState.exportBounds = {
        left: minX,
        top: minY,
        width: width,
        height: height
      };

      // Temporarily resize canvas to fit all objects and center view
      canvas.setDimensions({
        width: width,
        height: height
      });

      // Reset the zoom to 1 (100%)
      canvas.setZoom(1);

      // Center the view on the objects
      canvas.setViewportTransform([1, 0, 0, 1, -minX, -minY]);
    }

    // Temporarily modify canvas for export
    if (!includeBackground) {
      canvas.backgroundColor = 'rgba(0,0,0,0)'; // Transparent background
    }

    if (!includeGrid) {
      // Hide grid and grid-related objects
      canvas.getObjects().forEach(obj => {
        if (obj.id === 'grid') {
          obj.visible = false;
        }
      });
    }

    canvas.renderAll();
    return originalState;
  },

  // Helper function to restore canvas after export
  restoreCanvasAfterExport: function (originalState) {
    // Restore original canvas dimensions
    canvas.setDimensions({
      width: originalState.width,
      height: originalState.height
    });

    // Restore original zoom and viewport transform
    canvas.setViewportTransform(originalState.viewportTransform);

    // Restore background
    canvas.backgroundColor = originalState.backgroundColor;

    // Restore object visibility
    originalState.objects.forEach(item => {
      item.obj.visible = item.visible;
    });

    canvas.renderAll();
  },

  exportToPNG: function () {
    const options = {
      format: 'png',
      quality: FormExportComponent.exportSettings.quality,
      multiplier: FormExportComponent.exportSettings.multiplier
    };

    // Prepare canvas for export
    const originalState = FormExportComponent.prepareCanvasForExport();

    // Generate the export
    const dataURL = canvas.toDataURL(options);

    // Restore canvas
    FormExportComponent.restoreCanvasAfterExport(originalState);

    // Create the download link
    const link = document.createElement('a');
    link.download = `${FormExportComponent.exportSettings.filename}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportToSVG: function () {
    // Prepare canvas for export
    const originalState = FormExportComponent.prepareCanvasForExport();

    // Generate the SVG data
    const svgData = canvas.toSVG({
      // SVG-specific options
      viewBox: {
        x: originalState.exportBounds ? originalState.exportBounds.left : 0,
        y: originalState.exportBounds ? originalState.exportBounds.top : 0,
        width: originalState.exportBounds ? originalState.exportBounds.width : canvas.width,
        height: originalState.exportBounds ? originalState.exportBounds.height : canvas.height
      }
    });

    // Restore canvas
    FormExportComponent.restoreCanvasAfterExport(originalState);

    // Create the download
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${FormExportComponent.exportSettings.filename}.svg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  exportToPDF: function () {
    // Prepare canvas for export first
    const originalState = FormExportComponent.prepareCanvasForExport();

    // Check if jsPDF is available
    if (typeof jsPDF === 'undefined') {
      // Load jsPDF dynamically if not available
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = () => createPDF(originalState);
      document.head.appendChild(script);
    } else {
      createPDF(originalState);
    }

    function createPDF(originalState) {
      const imgData = canvas.toDataURL('image/png', FormExportComponent.exportSettings.quality);

      // Use the calculated bounds for PDF dimensions
      const width = originalState.exportBounds ? originalState.exportBounds.width : canvas.width;
      const height = originalState.exportBounds ? originalState.exportBounds.height : canvas.height;

      const pdf = new jspdf.jsPDF({
        orientation: width > height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [width, height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, width, height);
      pdf.save(`${FormExportComponent.exportSettings.filename}.pdf`);

      // Restore the canvas after PDF creation
      FormExportComponent.restoreCanvasAfterExport(originalState);
    }
  },
}

/* Debug Panel */
let FormDebugComponent = {
  // TODO: Add General settings : e.g. turn off text borders, change background color, show grid, etc.

  DebugPanelInit: function () {
    tabNum = 6
    var parent = GeneralHandler.PanelInit()
    if (parent) {

      // Create a container for debug info
      var debugInfoContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      FormDebugComponent.createDebugInfoPanel(debugInfoContainer);
      const sponsorDiv = GeneralHandler.createNode("div", { 'class': `coffee-link-container` }, parent)
      sponsorDiv.innerHTML = '<a href="https://www.buymeacoffee.com/G1213123" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-blue.png" alt="Buy Me A Coffee" height="41" width="174" style="max-width:100%;"></a>'

      // Add GitHub repository link
      const githubLink = GeneralHandler.createNode("div", { 'class': 'github-link-container' }, sponsorDiv);
      githubLink.innerHTML = '<a href="https://github.com/G1213123/TrafficSign" target="_blank"><i class="fa-brands fa-github"></i><span>Visit GitHub Repository</span></a>';


      // Update the sidebar when an object is selected
      canvas.on('selection:created', FormDebugComponent.selectionListener);
      canvas.on('selection:updated', FormDebugComponent.selectionListener);
      canvas.on('object:modified', FormDebugComponent.selectionListener);
      // Clear the sidebar when no object is selected
      canvas.on('selection:cleared', FormDebugComponent.clearSelectionListener);
      if (canvas.getActiveObject()) {
        FormDebugComponent.updateDebugInfo(canvas.getActiveObjects());
      }
    }
  },
  selectionListener: function (event) {
    let selectedObject = null
    if (event.target) {
      selectedObject = event.target;
    } else {
      selectedObject = event.selected[0];
    }
    FormDebugComponent.updateDebugInfo(selectedObject);
  },
  clearSelectionListener: function (event) {
    const debugInfoPanel = document.getElementById('debug-info-panel');
    if (debugInfoPanel) {
      debugInfoPanel.innerHTML = '';
      const div = document.createElement('div');
      div.innerText = 'Select Object for Info';
      debugInfoPanel.appendChild(div);
    }
  },
  createDebugInfoPanel: function (parent) {
    const debugInfoPanel = document.createElement('div');
    debugInfoPanel.id = 'debug-info-panel';
    parent.appendChild(debugInfoPanel);
    const div = document.createElement('div');
    div.innerText = 'Select Object for Info';
    debugInfoPanel.appendChild(div);
  },

  updateDebugInfo: function (objects) {
    const debugInfoPanel = document.getElementById('debug-info-panel');
    if (debugInfoPanel) {
      objects.length ? object = objects[0] : object = objects
      debugInfoPanel.innerHTML = ''; // Clear previous info

      if (object.getEffectiveCoords) {

        const div = document.createElement('div');
        div.style.fontWeight = 'bold'; // Make text bold
        div.style.textDecoration = 'underline'; // Add underline
        div.innerText = `${object._showName}`;
        debugInfoPanel.appendChild(div);

        point = object.getEffectiveCoords()
        const properties = [
          { label: 'Top', value: Math.round(object.top) },
          { label: 'Left', value: Math.round(object.left) },
          { label: 'Width', value: Math.round(object.width) },
          { label: 'Height', value: Math.round(object.height) },
          { label: 'Effective Position', value: `x: ${Math.round(point[0].x)}, y: ${Math.round(point[0].y)}` },
          { label: 'Effective Width', value: Math.round(point[1].x - point[0].x) },
          { label: 'Effective Height', value: Math.round(point[2].y - point[0].y) },

        ];

        properties.forEach(prop => {
          const div = document.createElement('div');
          div.innerText = `${prop.label}: ${prop.value}`;
          debugInfoPanel.appendChild(div);
        });
      }
    }
  },

  DebugHandlerOff: function (event) {
    canvas.off('selection:created', this.selectionListener)
    canvas.off('selection:updated', this.selectionListener)
    canvas.off('selection:cleared', this.clearSelectionListener)
  },
};

let CanvasObjectInspector = {
  createObjectListPanelInit: function () {
    const objectListPanel = document.getElementById('objectListPanel');

    // Clear the existing content
    objectListPanel.innerHTML = '';

    // Loop through the CanvasObject array and append object names to the list
    canvasObject.forEach((obj, index) => {
      const div = document.createElement('div');
      div.className = 'object-list-item';
      div.innerText = obj._showName;
      div.id = `Group (${index})`;
      div.addEventListener('click', () => {
        // Remove 'selected' class from all items
        document.querySelectorAll('.object-list-item').forEach(item => item.classList.remove('selected'));
        // Add 'selected' class to the clicked item
        div.classList.add('selected');
        canvas.setActiveObject(obj);
        canvas.renderAll();
        // Scroll the parent container to the clicked item
        div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      objectListPanel.appendChild(div);
    });
  },

  SetActiveObjectList: function (setActive) {
    const index = canvasObject.indexOf(setActive);
    // Remove 'selected' class from all items
    document.querySelectorAll('.object-list-item').forEach(item => {
      if (item.id == `Group (${index})`) {
        item.classList.add('selected');
        // Scroll the parent container to the active item
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }
}

// Define the event handler function
function ShowHideSideBarEvent(e) {
  switch (e.keyCode) {
    case 27: // esc
      GeneralHandler.ShowHideSideBar(e);
      break;
  }
}

window.onload = () => {
  document.getElementById('show_hide').onclick = GeneralHandler.ShowHideSideBar;
  document.getElementById('btn_draw').onclick = FormDrawAddComponent.drawPanelInit
  document.getElementById('btn_text').onclick = FormTextAddComponent.textPanelInit
  document.getElementById('btn_border').onclick = FormBorderWrapComponent.BorderPanelInit
  document.getElementById('btn_map').onclick = FormDrawMapComponent.drawMapPanelInit
  document.getElementById('btn_export').onclick = FormExportComponent.exportPanelInit
  document.getElementById('btn_debug').onclick = FormDebugComponent.DebugPanelInit
  //canvas.on('object:added', CanvasObjectInspector.createObjectListPanel);
  //canvas.on('object:removed', CanvasObjectInspector.createObjectListPanel);
  //canvas.on('object:modified', CanvasObjectInspector.createObjectListPanel);
  FormDrawAddComponent.drawPanelInit()
  document.addEventListener('keydown', ShowHideSideBarEvent);
}