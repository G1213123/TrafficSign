/* Text panel component */
import { createNode, createInput, createToggle } from './domHelpers.js';
const FormTextAddComponent = {
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
    var parent = document.getElementById('input-form');
    if (parent) {
      
      // Create a container for text content and font
      const textContentContainer = createNode("div", { 'class': 'input-group-container' }, parent);
      const textInput = createInput('input-text', 'Add Text', textContentContainer, '', editingTextObject ? FormTextAddComponent.liveUpdateText : FormTextAddComponent.TextInputHandler, 'input');
      createToggle('Text Font', FormTextAddComponent.textFont, textContentContainer, 'TransportMedium', editingTextObject ? FormTextAddComponent.liveUpdateText : FormTextAddComponent.TextInputHandler);

      // Create xHeight input using the standard handler
      const xHeightInput = createInput('input-xHeight', 'x Height', parent, GeneralSettings.xHeight, () => {
        GeneralSettings.updateSetting('xHeight', parseInt(xHeightInput.value));
      }, 'input');

      // Create color toggle with our CUSTOM color change handler
      createToggle('Message Colour', ['Black', 'White'], parent, GeneralSettings.messageColor, (e) => {
        GeneralSettings.updateSetting('messageColor', e.target.getAttribute('data-value'));
      });
      
      // Create a container for location selection
      const locationContainer = createNode("div", { 'class': 'input-group-container' }, parent);
      const regionLabel = createNode("div", { 'class': 'placeholder' }, locationContainer);
      regionLabel.innerHTML = "Add New Destination";

      // Extract region names from destinations array
      const regionNames = EngDestinations.map(region => Object.keys(region)[0]);

      // Create language toggle
      createToggle('Language', ['2Liner', 'English', 'Chinese'], locationContainer, 'English', FormTextAddComponent.updateLocationDropdown);

      // Create Justification toggle - only visible when 2Liner is selected
      createToggle('Justification', ['Left', 'Middle', 'Right'], locationContainer, 'Left', FormTextAddComponent.handleJustification);
      const justificationContainer = document.getElementById('Justification-container').parentElement;
      justificationContainer.style.display = FormTextAddComponent.textLineInput == 2 ? 'block' : 'none';

      // Create region toggle
      createToggle('Region', regionNames, locationContainer, regionNames[0], FormTextAddComponent.updateLocationDropdown);

      // Create location dropdown
      const locationDropdownContainer = createNode("div", { 'class': 'location-dropdown-container' }, locationContainer);      
      const locationSelect = createNode("select", { 'class': 'input', 'id': 'location-select' }, locationDropdownContainer);
      locationSelect.addEventListener('change', FormTextAddComponent.locationSelected);

      // Initialize the location dropdown with locations from the first region
      FormTextAddComponent.populateLocationDropdown(regionNames[0], "English");
    }
  },

  /**
   * Updates the location dropdown when a region is selected
   */
  updateLocationDropdown: function (selectedButton) {
    const regionName = document.getElementById('Region-container').selected.getAttribute('data-value')
    const languageInput = document.getElementById('Language-container').selected.getAttribute('data-value');
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
    canvas.off('mouse:move', FormTextAddComponent.TextOnMouseMove);
    canvas.off('mouse:down', FormTextAddComponent.TextOnMouseClick);
    document.removeEventListener('keydown', FormTextAddComponent.cancelInput);
    if (FormTextAddComponent.newTextObject) canvas.remove(FormTextAddComponent.newTextObject);



    
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
    if (event.key === 'Escape') {
      // For 2-liner text, we need special handling to remove both English and Chinese texts
      if (FormTextAddComponent.textLineInput === 2 && 
          FormTextAddComponent.newTextObject && 
          canvas.contains(FormTextAddComponent.newTextObject)) {
        
        // First, check if the English text has anchored Chinese text
        if (FormTextAddComponent.newTextObject.anchoredPolygon && 
            FormTextAddComponent.newTextObject.anchoredPolygon.length > 0) {
          
          // Store references to both texts before deletion
          const anchoredTexts = [...FormTextAddComponent.newTextObject.anchoredPolygon];
          
          // Remove anchored Chinese text first to avoid orphaned objects
          anchoredTexts.forEach(anchoredText => {
            if (anchoredText && typeof anchoredText.deleteObject === 'function') {
              anchoredText.deleteObject();
            }
          });
        }
        
        // Then continue with the normal escape handling which will remove the English text
      }      
    }
    if (event.key === 'Escape'){
      canvas.off('mouse:move', FormTextAddComponent.TextOnMouseMove);
      canvas.off('mouse:down', FormTextAddComponent.TextOnMouseClick);
      document.removeEventListener('keydown', FormTextAddComponent.cancelInput);
      if (FormTextAddComponent.newTextObject) canvas.remove(FormTextAddComponent.newTextObject);
    }
    );
    
    // Additional text-specific cleanup
    if (event.key === 'Escape') {
      document.getElementById('input-text').value = '';
    }
  },

  TextInputHandler: async function (event, options = null) {
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

    try {
      if (isTwoLiner) {
        // For two-liner mode, we need special handling to create and anchor two text objects
        // Get corresponding Chinese text using the helper function
        const chtText = FormTextAddComponent.findCorrespondingChineseText(txt);
        
        // Use the general object creation with snapping function
        const createTwoLinerText = (options) => {
          // Create English text object (top one)
          const engTextObject = new TextObject({
            text: options.text,
            xHeight: options.xHeight,
            font: options.font,
            color: options.color,
            left: options.position.x,
            top: options.position.y - options.xHeight * 0.6 // Position it higher for the top line
          });
          engTextObject.isTemporary = true;
  
          // Create Chinese text object (bottom one)
          const chtTextObject = new TextObject({
            text: options.translatedText,
            xHeight: options.xHeight,
            font: options.font,
            color: options.color,
            left: options.position.x,
            top: options.position.y + options.xHeight * 0.6 // Position it lower for the bottom line
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
          
          return engTextObject; // Return the top object as the main one
        };
        
        // Use the general object creation function for two-liner text
        await FormTextAddComponent.createObjectWithSnapping(
          {
            text: txt,
            translatedText: chtText,
            xHeight: xHeight,
            font: font,
            color: color
          },
          createTwoLinerText,
          FormTextAddComponent,
          'newTextObject',
          'E1',
          FormTextAddComponent.TextOnMouseMove,
          FormTextAddComponent.TextOnMouseClick,
          FormTextAddComponent.cancelInput
        );
  
      } else {
        // For regular single-line text, use our standard pattern
        // Create a function that returns a new TextObject
        const createTextObject = (options) => {
          return new TextObject({
            text: options.text,
            xHeight: options.xHeight,
            font: options.font,
            color: options.color,
            left: options.position.x,
            top: options.position.y
          });
        };
        
        // Use the general object creation function
        await FormTextAddComponent.createObjectWithSnapping(
          {
            text: txt,
            xHeight: xHeight,
            font: font,
            color: color
          },
          createTextObject,
          FormTextAddComponent,
          'newTextObject',
          'E1',
          FormTextAddComponent.TextOnMouseMove,
          FormTextAddComponent.TextOnMouseClick,
          FormTextAddComponent.cancelInput
        );
      }
    } catch (error) {
      console.error('Error creating text object:', error);
    }
    
    canvas.renderAll();
  },

  TextOnMouseMove: function (event) {
    // Get the current position of the mouse
    const pointer = GeneralSettings.canvas.getPointer(event.e);
    const activeObj = FormTextAddComponent.newTextObject;
    if (!activeObj) return;
    // Move the object to the mouse position
    activeObj.set({
      left: pointer.x,
      top: pointer.y,
    });

    // Render the canvas to show the updated position
    GeneralSettings.canvas.renderAll();
  },

  createObjectWithSnapping: async function (options, createObjectFunc, caller, objName, vertexIndex, onMouseMove, onMouseClick, onCancel) {
    // Set up event listeners if not already set
    if (GeneralSettings.canvas) {
      GeneralSettings.canvas.on('mouse:move', caller[onMouseMove]);
      GeneralSettings.canvas.on('mouse:down', caller[onMouseClick]);
      document.addEventListener('keydown', caller[onCancel]);
    } else {
      throw new Error('Canvas is not initialized in GeneralSettings.');
    }
    // Create the object using the provided function
    caller[objName] = await createObjectFunc(
      options
    );
    caller[objName].functionalType = caller.constructor.name.replace('Form', '');
    
    // Set the snap origin to the specified vertex
    const snapOrigin = caller[objName].getBasePolygonVertex(vertexIndex);
    
    // Attach the snap origin to the object
    caller[objName].snapOrigin = snapOrigin;
    caller[objName].isTemporary = true
    
    // Calculate and store the object's center
    const center = caller[objName].getCenterPoint();
    caller[objName].objectCenter = center;

    // Add the object to the canvas
    GeneralSettings.canvas.add(caller[objName]);
    
    // Set the object as active
    GeneralSettings.canvas.setActiveObject(caller[objName]);
    
    // Render the canvas to show the object
    GeneralSettings.canvas.renderAll();
  
    // Set flag to indicate object is being moved
    caller.isDragging = true;
    return caller[objName]
  },

  debounce: (func, wait, immediate) => {
    let timeout;
  
    return function executedFunction(...args) {
      const context = this;
  
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
  
      const callNow = immediate && !timeout;
  
      clearTimeout(timeout);
  
      timeout = setTimeout(later, wait);
  
      if (callNow) func.apply(context, args);
    };
  },

  handleObjectOnMouseMove: (caller, event) => {
    // Get the current position of the mouse
    const pointer = GeneralSettings.canvas.getPointer(event.e);
    const activeObj = caller.newTextObject;
  
    if (!activeObj) return;
  
    // Move the object to the mouse position
    activeObj.set({
      left: pointer.x,
      top: pointer.y,
    });

    // Render the canvas to show the updated position
    GeneralSettings.canvas.renderAll();
    if (!caller.isDragging) return;

    const objects = GeneralSettings.canvas.getObjects().filter(obj => obj !== activeObj);
  
    // Iterate through all objects on the canvas to check for proximity
    objects.forEach(obj => {
      if (!obj.snapPoints) return;
  
      // Check all snap points of the target object
      obj.snapPoints.forEach(targetPoint => {
        // Check proximity between the active object's snap origin and the target point
        const distance = Math.sqrt(
          Math.pow(activeObj.snapOrigin.x - targetPoint.x, 2) +
          Math.pow(activeObj.snapOrigin.y - targetPoint.y, 2)
        );
        
        // If the distance is less than the snap tolerance, snap
        if (distance < 100) {
          activeObj.set({
            left: targetPoint.x - (activeObj.snapOrigin.x - activeObj.left),
            top: targetPoint.y - (activeObj.snapOrigin.y - activeObj.top),
          });
          
          // Render the canvas to show the snapped position
          GeneralSettings.canvas.renderAll();
        }
      });
    });
  },

  handleObjectOnMouseClick: (caller, event, objName, onMouseMove, onMouseClick, onCancel) => {
    if (!caller[objName]) return;
    const currentObject = caller[objName];
    // Remove temporary styling/behavior
    currentObject.isTemporary = false;
    currentObject.setCoords();
    // Remove the object from the temp list
    caller[objName] = null;
    caller.isDragging = false;
    // Remove event listener
    GeneralSettings.canvas.off('mouse:move', caller[onMouseMove]);
    GeneralSettings.canvas.off('mouse:down', caller[onMouseClick]);
    document.removeEventListener('keydown', caller[onCancel]);
    // Set the object as selected
    GeneralSettings.canvas.setActiveObject(currentObject);
    currentObject.enterFocusMode();
  },

  handleCancelWithEscape: (caller, event, objName, onMouseMove, onMouseClick) => {
    if (event.key === 'Escape') {
      // Remove the object from the canvas
      if (caller[objName]) GeneralSettings.canvas.remove(caller[objName]);

      // Clear the object reference
      caller[objName] = null;

      // Remove event listener
      GeneralSettings.canvas.off('mouse:move', caller[onMouseMove]);
      GeneralSettings.canvas.off('mouse:down', caller[onMouseClick]);
      document.removeEventListener('keydown', caller.cancelInput);
    }
  },

  TextOnMouseClick: function (event, options = null) {
    if (event.e.button !== 0) return;
    
    // Use shared mouse click handler for new text objects
    if (FormTextAddComponent.newTextObject) {
      FormTextAddComponent.handleObjectOnMouseClick(FormTextAddComponent, event, 'newTextObject', 'TextOnMouseMove', 'TextOnMouseClick', 'cancelInput');

      
      // Text-specific cleanup
      document.getElementById('input-text').value = '';
      return;
    }

    // Legacy options handling - should rarely be used now
  },

  EditOnMouseClick: function (event) {
    document.getElementById('input-text').value = '';
    FormTextAddComponent.textPanelInit(null);
  }
};

// Replace the settings listener with the shared implementation
GeneralSettings.addListener(
  function(setting, value) {
    // Text-specific updates when settings change
    if (FormTextAddComponent.newTextObject || canvas.getActiveObject()?.functionalType === 'Text') {
      FormTextAddComponent.liveUpdateText();
    }
  }
);