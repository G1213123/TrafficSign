/* Text panel component */
let FormTextAddComponent = {
  textFont: ['TransportMedium', 'TransportHeavy'],
  newTextObject: null,
  textLineInput: 1,
  justification: 'Left',

  // Helper function to find corresponding Chinese text for English text
  findCorrespondingChineseText: function (engText) {
    let chtText = null;

    // Search through all regions in EngDestinations
    for (let i = 0; i < EngDestinations.length; i++) {
      const engRegion = EngDestinations[i];
      const regionName = Object.keys(engRegion)[0];
      const engLocations = engRegion[regionName];

      // Find the index of the English text in this region
      const index = engLocations.indexOf(engText);

      // If found, get the same index from ChtDestinations
      if (index !== -1) {
        const chtRegion = ChtDestinations[i];
        const chtLocations = chtRegion[regionName];
        if (chtLocations && chtLocations[index]) {
          chtText = chtLocations[index];
          break;
        }
      }
    }

    return chtText;
  },

  // Helper function to determine if text contains Chinese characters
  isChineseText: function (text) {
    // Chinese character range: \u4e00-\u9fff
    const chineseRegex = /[\u4e00-\u9fff]/;
    return chineseRegex.test(text);
  },

  textPanelInit: function (event, editingTextObject = null) {
    tabNum = 2;
    FormTextAddComponent.textLineInput = 1;
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
      const languageToggle = GeneralHandler.createToggle('Language', ['2Liner', 'English', 'Chinese'], locationContainer, 'English', FormTextAddComponent.updateLocationDropdown);

      // Create Justification toggle - only visible when 2Liner is selected
      const justificationToggle = GeneralHandler.createToggle('Justification', ['Left', 'Middle', 'Right'], locationContainer, 'Left', FormTextAddComponent.handleJustification);
      const justificationContainer = document.getElementById('Justification-container').parentElement;
      justificationContainer.style.display = FormTextAddComponent.textLineInput == 2 ? 'block' : 'none';

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
    const languageInput = GeneralHandler.getToggleValue('Language-container')
    let language = languageInput == '2Liner' ? 'English' : languageInput
    if (languageInput == '2Liner') {
      FormTextAddComponent.textLineInput = 2
      // Show justification toggle when 2Liner is selected
      const justificationContainer = document.getElementById('Justification-container').parentElement;
      justificationContainer.style.display = 'block';
      // Lock text input when in 2Liner mode
      document.getElementById('input-text').disabled = true;
    } else {
      FormTextAddComponent.textLineInput = 1
      // Hide justification toggle for single line text
      const justificationContainer = document.getElementById('Justification-container').parentElement;
      justificationContainer.style.display = 'none';
      // Enable text input for single line mode
      document.getElementById('input-text').disabled = false;
    }
    FormTextAddComponent.populateLocationDropdown(regionName, language);
    if (FormTextAddComponent.newTextObject && canvas.contains(FormTextAddComponent.newTextObject)) {
      FormTextAddComponent.liveUpdateText();
      canvas.renderAll();
    }
  },

  /**
   * Handler for justification toggle
   */
  handleJustification: function (selectedButton) {
    FormTextAddComponent.justification = selectedButton.getAttribute('data-value');
    // If we already have a text object, update its justification
    if (FormTextAddComponent.newTextObject || canvas.getActiveObject()?.functionalType === 'Text') {
      FormTextAddComponent.liveUpdateText();
    }
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
        FormTextAddComponent.liveUpdateText();
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

      // Check if we're in 2Liner mode
      const isTwoLiner = FormTextAddComponent.textLineInput === 2;
      const justification = FormTextAddComponent.justification || 'Left';

      if (isTwoLiner) {
        // Determine if newTextObject is English or Chinese text
        // We'll check if it's in the EngDestinations or ChtDestinations
        let isEnglishText = true;
        for (let i = 0; i < ChtDestinations.length; i++) {
          const chtRegion = ChtDestinations[i];
          const regionName = Object.keys(chtRegion)[0];
          const chtLocations = chtRegion[regionName];
          
          // If the current text is found in Chinese destinations, it's a Chinese text
          if (chtLocations.includes(FormTextAddComponent.newTextObject.text)) {
            isEnglishText = false;
            break;
          }
        }

        if (isEnglishText) {
          // Case: newTextObject is English text (top line)
          const engTextObject = FormTextAddComponent.newTextObject;

          // Get corresponding Chinese text using the helper function
          const chtText = FormTextAddComponent.findCorrespondingChineseText(newText);

          // Update English text object
          engTextObject.updateText(newText, newXHeight, newFont, newColor);

          // The Chinese text object should be in the anchoredPolygon list of the English text object
          if (engTextObject.anchoredPolygon && engTextObject.anchoredPolygon.length > 0) {
            const chtTextObject = engTextObject.anchoredPolygon[0];
            if (chtTextObject && chtTextObject.functionalType === 'Text') {
              chtTextObject.updateText(chtText, newXHeight, newFont, newColor);
              // Set the new anchor
              const vertexIndex1 = { 'Left': 'E1', 'Middle': 'E2', 'Right': 'E3' }[justification];
              const vertexIndex2 = { 'Left': 'E7', 'Middle': 'E6', 'Right': 'E5' }[justification];
              const movingPoint = chtTextObject.getBasePolygonVertex(vertexIndex1.toUpperCase())
              const targetPoint = engTextObject.getBasePolygonVertex(vertexIndex2.toUpperCase())
              chtTextObject.set({
                left: chtTextObject.left + targetPoint.x - movingPoint.x,
                lockMovementX: true,
              });
              const anchor = { sourcePoint: vertexIndex1, targetPoint: vertexIndex2, sourceObject: chtTextObject, TargetObject: engTextObject, spacing: 0 }
              chtTextObject.lockXToPolygon = anchor
            }
          } else {
            // Case 1: isTwoLiner is true but no anchored text exists yet - create and anchor Chinese text
            const chtText = FormTextAddComponent.findCorrespondingChineseText(newText);
            
            // Create Chinese text object
            const chtTextObject = new TextObject({
              text: chtText,
              xHeight: newXHeight,
              font: newFont,
              color: newColor,
              left: engTextObject.left,
              top: engTextObject.top + newXHeight * 1.2 // Position it lower for the bottom line
            });
            chtTextObject.isTemporary = true;
            
            // Anchor Chinese text to English text using the justification points
            setTimeout(() => {
              const vertexIndex1 = { 'Left': 'E1', 'Middle': 'E2', 'Right': 'E3' }[justification];
              const vertexIndex2 = { 'Left': 'E7', 'Middle': 'E6', 'Right': 'E5' }[justification];
              
              anchorShape(engTextObject, chtTextObject, {
                vertexIndex1: vertexIndex1,
                vertexIndex2: vertexIndex2,
                spacingX: 0,
                spacingY: 0
              });
              canvas.renderAll();
            }, 100);
          }
        } else {
          // Case: newTextObject is Chinese text (bottom line)
          const chtTextObject = FormTextAddComponent.newTextObject;
          
          // Find corresponding English text
          let engText = null;
          // Search through all regions in ChtDestinations to find the index
          for (let i = 0; i < ChtDestinations.length; i++) {
            const chtRegion = ChtDestinations[i];
            const regionName = Object.keys(chtRegion)[0];
            const chtLocations = chtRegion[regionName];
            
            // Find the index of the Chinese text
            const index = chtLocations.indexOf(chtTextObject.text);
            
            // If found, get the corresponding English text
            if (index !== -1) {
              const engRegion = EngDestinations[i];
              const engLocations = engRegion[regionName];
              if (engLocations && engLocations[index]) {
                engText = engLocations[index];
                break;
              }
            }
          }
          
          // Update Chinese text object
          chtTextObject.updateText(newText, newXHeight, newFont, newColor);
          
          // Check if it has an anchoring parent (English text)
          if (chtTextObject.lockXToPolygon && chtTextObject.lockXToPolygon.TargetObject) {
            const engTextObject = chtTextObject.lockXToPolygon.TargetObject;
            if (engTextObject && engTextObject.functionalType === 'Text') {
              engTextObject.updateText(engText, newXHeight, newFont, newColor);
            }
          } else {
            // If no anchoring parent, create a new English text object
            const engTextObject = new TextObject({
              text: engText,
              xHeight: newXHeight,
              font: newFont,
              color: newColor,
              left: chtTextObject.left,
              top: chtTextObject.top - newXHeight * 1.2 // Position it higher for the top line
            });
            engTextObject.isTemporary = true;
            
            // Anchor English text to Chinese text using reversed justification points
            setTimeout(() => {
              // Reverse the vertex indices for anchoring
              const vertexIndex1 = { 'Left': 'E7', 'Middle': 'E6', 'Right': 'E5' }[justification];
              const vertexIndex2 = { 'Left': 'E1', 'Middle': 'E2', 'Right': 'E3' }[justification];
              
              anchorShape(chtTextObject, engTextObject, {
                vertexIndex1: vertexIndex1,
                vertexIndex2: vertexIndex2,
                spacingX: 0,
                spacingY: 0
              });
              canvas.renderAll();
            }, 100);
          }
        }
        return;
      } else {
        // Case 2: isTwoLiner is false but text has anchored objects - delete them
        if (FormTextAddComponent.newTextObject.anchoredPolygon && 
            FormTextAddComponent.newTextObject.anchoredPolygon.length > 0) {
          // Delete all anchored objects
          const anchors = [...FormTextAddComponent.newTextObject.anchoredPolygon];
          anchors.forEach(anchor => {
            if (anchor && typeof anchor.deleteObject === 'function') {
              anchor.deleteObject();
            }
          });
          // Clear the anchor list
          FormTextAddComponent.newTextObject.anchoredPolygon = [];
        }
        // Simple update for regular single text
        FormTextAddComponent.newTextObject.updateText(newText, newXHeight, newFont, newColor);
        return;
      }
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

      // Check if this is part of a two-liner set
      const isTwoLiner = textObj.anchoredPolygon && textObj.anchoredPolygon.length > 0;

      // Only call updateText if there are actual changes
      if (
        newText !== textObj.text ||
        newXHeight !== textObj.xHeight ||
        newFont !== textObj.font ||
        newColor !== textObj.color
      ) {
        // Update the active text object
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

      // Check if we're using two-liner mode
      const isTwoLiner = FormTextAddComponent.textLineInput === 2;
      const justification = FormTextAddComponent.justification || 'Left';

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

      // Check if text is English or Chinese
      const isChineseText = FormTextAddComponent.isChineseText(txt);

      if (isTwoLiner) {
        // Get corresponding Chinese text using the helper function
        const chtText = FormTextAddComponent.findCorrespondingChineseText(txt);

        // Create English text object
        const engTextObject = new TextObject({
          text: txt,
          xHeight: xHeight,
          font: font,
          color: color,
          left: actualCenterX,
          top: actualCenterY - xHeight * 0.6 // Position it higher for the top line
        });
        engTextObject.isTemporary = true;

        // Create Chinese text object
        const chtTextObject = new TextObject({
          text: chtText,
          xHeight: xHeight,
          font: font,
          color: color,
          left: actualCenterX,
          top: actualCenterY + xHeight * 0.6 // Position it lower for the bottom line
        });
        chtTextObject.isTemporary = true;


        // Anchor Chinese text to English text using the justification points
        setTimeout(() => {
          anchorShape(engTextObject, chtTextObject, {
            vertexIndex1: { 'Left': 'E1', 'Middle': 'E2', 'Right': 'E3' }[justification],
            vertexIndex2: { 'Left': 'E7', 'Middle': 'E6', 'Right': 'E5' }[justification],
            spacingX: 0,
            spacingY: 0
          });
        }, 100);


        // Store reference to the English text object (top one)
        FormTextAddComponent.newTextObject = engTextObject;

        // Add mouse move handler to position the objects
        canvas.on('mouse:move', FormTextAddComponent.TextOnMouseMove);
        canvas.on('mouse:down', FormTextAddComponent.TextOnMouseClick);

        // Activate the vertex control immediately to enable dragging and snapping
        if (engTextObject.controls && engTextObject.controls.E1) {
          activeVertex = engTextObject.controls.E1;
          activeVertex.isDown = true;
          activeVertex.originalPosition = {
            left: engTextObject.left,
            top: engTextObject.top
          };
          activeVertex.vertexOriginalPosition = {
            x: engTextObject.getBasePolygonVertex('E1').x,
            y: engTextObject.getBasePolygonVertex('E1').y
          };
          activeVertex.vertexOffset = {
            x: engTextObject.getBasePolygonVertex('E1').x - engTextObject.left,
            y: engTextObject.getBasePolygonVertex('E1').y - engTextObject.top
          };

          // Create indicator for the active vertex
          if (activeVertex.createIndicator) {
            activeVertex.createIndicator(engTextObject.getBasePolygonVertex('E1').x, engTextObject.getBasePolygonVertex('E1').y);
          }
        }
      } else {
        // Regular single line text object creation
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
        FormTextAddComponent.newTextObject.isTemporary = false
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