/* Text panel component */
let FormTextAddComponent = {
  textFont: ['TransportMedium', 'TransportHeavy'],
  newTextObject: null,

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

    textObject.isTemporary = true

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
      canvas.discardActiveObject();

      // Reset state
      FormTextAddComponent.newTextObject.isTemporary=false
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

// Export the FormTextAddComponent for use in other files