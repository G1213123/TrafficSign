/* Text panel component */
let FormTextAddComponent = {
  textFont: ['TransportMedium', 'TransportHeavy'],
  newTextObject: null,
  textLineInput: 1,
  justification: 'Left',

  // Helper function to find corresponding Chinese text for English text
  findCorrespondingChineseText: function (engText, isEnglishText = true) {
    let returnText = null;
    const searchDestinations = isEnglishText ? EngDestinations : ChtDestinations;

    // Search through all regions in EngDestinations
    for (let i = 0; i < searchDestinations.length; i++) {
      const Region = searchDestinations[i];
      const regionName = Object.keys(Region)[0];
      const engLocations = Region[regionName];

      // Find the index of the English text in this region
      const index = engLocations.indexOf(engText);

      // If found, get the same index from ChtDestinations
      if (index !== -1) {
        const returnDestinations = isEnglishText ? ChtDestinations : EngDestinations;
        const chtRegion = returnDestinations[i];
        const chtLocations = chtRegion[regionName];
        if (chtLocations && chtLocations[index]) {
          returnText = chtLocations[index];
          break;
        }
      }
    }

    return returnText;
  },

  textPanelInit: function (event, editingTextObject = null) {
    tabNum = 2;
    FormTextAddComponent.textLineInput = 1;
    var parent = GeneralHandler.PanelInit();
    if (parent) {
      // Create the basic parameters container using the shared function
      GeneralHandler.createBasicParamsContainer(parent, FormTextAddComponent);

      // Create a container for text content and font
      const textContentContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      const textInput = GeneralHandler.createInput('input-text', 'Add Text', textContentContainer, '', editingTextObject ? FormTextAddComponent.liveUpdateText : FormTextAddComponent.TextInputHandler, 'input');
      const fontToggle = GeneralHandler.createToggle('Text Font', FormTextAddComponent.textFont, textContentContainer, 'TransportMedium', editingTextObject ? FormTextAddComponent.liveUpdateText : FormTextAddComponent.TextInputHandler);

      // Create a container for location selection
      const locationContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      const regionLabel = GeneralHandler.createNode("div", { 'class': 'placeholder' }, locationContainer);
      regionLabel.innerHTML = "Add New Destination";

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
      let newText = document.getElementById('input-text').value;
      const newXHeight = parseInt(document.getElementById('input-xHeight').value);
      const newFont = document.getElementById('Text Font-container').selected.getAttribute('data-value');
      const newColor = document.getElementById('Message Colour-container').selected.getAttribute('data-value');

      // Check if we're in 2Liner mode
      const isTwoLiner = FormTextAddComponent.textLineInput === 2;
      const justification = FormTextAddComponent.justification || 'Left';

      if (isTwoLiner) {
        // Determine if newTextObject is English or Chinese text
        // We'll check if it's in the EngDestinations or ChtDestinations
        let isEnglishText = !FormTextAddComponent.newTextObject.containsNonAlphabetic;

        if (isEnglishText) {
          // Case: newTextObject is English text (top line)
          const engTextObject = FormTextAddComponent.newTextObject;

          // Get corresponding Chinese text using the helper function
          const chtText = FormTextAddComponent.findCorrespondingChineseText(newText, isEnglishText);

          // Update English text object
          engTextObject.updateText(newText, newXHeight, newFont, newColor);

          // The Chinese text object should be in the anchoredPolygon list of the English text object
          if (engTextObject.anchoredPolygon && engTextObject.anchoredPolygon.length > 0) {
            const chtTextObject = engTextObject.anchoredPolygon[0];
            if (chtTextObject && chtTextObject.functionalType === 'Text' && chtTextObject.containsNonAlphabetic) {
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
          let engText = FormTextAddComponent.findCorrespondingChineseText(newText, false);

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
        // Check if the text object has an anchor object and trigger its deleteObject method
        if (FormTextAddComponent.newTextObject && FormTextAddComponent.newTextObject.anchoredPolygon) {
          FormTextAddComponent.newTextObject.anchoredPolygon.forEach(anchor => {
            if (anchor && typeof anchor.deleteObject === 'function') {
              anchor.deleteObject();
            }
          });
        }

        // Check if the language toggle value matches the text object type
        const languageToggleValue = document.getElementById('Language-container').selected.getAttribute('data-value');
        const isChineseSelected = languageToggleValue === 'Chinese';
        const isEnglishText = FormTextAddComponent.newTextObject && !FormTextAddComponent.newTextObject.containsNonAlphabetic;
        // If there's a mismatch between text type and selected language, we need to translate
        if ((isEnglishText && languageToggleValue === 'Chinese') || (!isEnglishText && languageToggleValue === 'English')) {
          // Find corresponding text in the other language
          const translatedText = FormTextAddComponent.findCorrespondingChineseText(newText, isEnglishText);
          if (translatedText) {
            // Update the text object with the translated text
            FormTextAddComponent.newTextObject.updateText(translatedText, newXHeight, newFont, newColor);
            document.getElementById('input-text').value = translatedText; // Update the input field with the translated text
          }
          return; // Exit early as the text has been updated
        }
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
    let newText = document.getElementById('input-text').value;
    if (!newText || newText.trim() === '') newText = textObj.text; // Don't create empty text
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
    // Use shared handler to clean up events and state
    GeneralHandler.genericHandlerOff(
      FormTextAddComponent,
      'newTextObject',
      'TextOnMouseMove',
      'TextOnMouseClick',
      'cancelInput'
    );
    
    // Additional text-specific cleanup
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

    canvas.off('mouse:down', FormTextAddComponent.EditOnMouseClick);
  },

  cancelInput: function (event) {
    // Use shared escape key handler
    GeneralHandler.handleCancelWithEscape(
      FormTextAddComponent, 
      event, 
      'newTextObject', 
      'TextOnMouseMove', 
      'TextOnMouseClick'
    );
    
    // Additional text-specific cleanup
    if (event.key === 'Escape') {
      document.getElementById('input-text').value = '';
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

      canvas.setActiveObject(engTextObject)
      engTextObject.enterFocusMode()

      // Activate the vertex control immediately to enable dragging and snapping
      if (engTextObject.controls && engTextObject.controls.E1) {
        activeVertex = engTextObject.controls.E1;
        activeVertex.isDown = true;
        activeVertex.isDragging = true;
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
      canvas.setActiveObject(textObject)
      textObject.enterFocusMode()

      // Add mouse move handler to position the object
      canvas.on('mouse:move', FormTextAddComponent.TextOnMouseMove);
      canvas.on('mouse:down', FormTextAddComponent.TextOnMouseClick);

      // Activate the vertex control immediately to enable dragging and snapping
      if (textObject.controls && textObject.controls.E1) {
        activeVertex = textObject.controls.E1;
        activeVertex.isDown = true;
        activeVertex.isDragging = true;
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
    // Use shared mouse move handler
    GeneralHandler.handleObjectOnMouseMove(FormTextAddComponent, event);
  },

  TextOnMouseClick: function (event, options = null) {
    if (event.e.button !== 0) return;
    
    // Use shared mouse click handler for new text objects
    if (FormTextAddComponent.newTextObject) {
      GeneralHandler.handleObjectOnMouseClick(
        FormTextAddComponent,
        event,
        'newTextObject',
        'TextOnMouseMove',
        'TextOnMouseClick',
        'cancelInput'
      );
      
      // Text-specific cleanup
      document.getElementById('input-text').value = '';
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
};

// Replace the settings listener with the shared implementation
GeneralSettings.addListener(
  GeneralHandler.createSettingsListener(2, function(setting, value) {
    // Text-specific updates when settings change
    if (FormTextAddComponent.newTextObject || canvas.getActiveObject()?.functionalType === 'Text') {
      FormTextAddComponent.liveUpdateText();
    }
  })
);