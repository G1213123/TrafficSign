/* Text panel component */
import { GeneralSettings, GeneralHandler } from './sbGeneral.js';
import { CanvasGlobals } from '../canvas/canvas.js';
import { TextObject, containsNonEnglishCharacters } from '../objects/text.js';
import { anchorShape } from '../objects/anchor.js';
import { EngDestinations, ChtDestinations } from '../objects/template.js';
import { FontPriorityManager } from '../modal/md-font.js';
import { HintLoader } from '../utils/hintLoader.js';

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
    GeneralHandler.tabNum = 2;
    FormTextAddComponent.textLineInput = 1;
    var parent = GeneralHandler.PanelInit();
    GeneralHandler.setActiveComponentOff(FormTextAddComponent.TextHandlerOff);
    if (parent) {
      // Set up button hint mappings for this panel
      HintLoader.setButtonHintMappings({
        'Text Font-container': 'symbols/TextFont'
      });
      
      // Create the basic parameters container using the shared function
      GeneralHandler.createBasicParamsContainer(parent, FormTextAddComponent, null, null, FormTextAddComponent.liveUpdateText, FormTextAddComponent.liveUpdateText);

      // Create a container for text content and font
      const textContentContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      const textInput = GeneralHandler.createInput('input-text', 'Add Text', textContentContainer, '', editingTextObject ? FormTextAddComponent.liveUpdateText : FormTextAddComponent.TextInputHandler, 'input');
      // Add the info text div for 2Liner mode
      const twoLinerInfo = GeneralHandler.createNode("div", { 'id': 'two-liner-info', 'class': 'info-text', 'style': 'display: none;' }, textContentContainer);
      twoLinerInfo.textContent = "Text input is disabled in 2Liner mode. Select a destination below.";      
      const fontToggle = GeneralHandler.createToggle('Text Font', FormTextAddComponent.textFont, textContentContainer, 'TransportMedium', editingTextObject ? FormTextAddComponent.liveUpdateText : FormTextAddComponent.TextInputHandler);
      
      // Add help icon to Text Font toggle
      setTimeout(() => {
        try {
          const toggleInputContainer = fontToggle.parentElement;
          if (toggleInputContainer) {
            const label = toggleInputContainer.querySelector('.placeholder');
            if (label) {
              // Use HintLoader to load content from dedicated hint file
              const helpIcon = GeneralHandler.createHelpIconWithHint(
                label, // Add to the label directly to be inline
                'symbols/TextFont', // Path to the hint file
                { 
                  position: 'right',    // Position to the right of sidebar
                  scrollable: true, 
                  showDelay: 150,       // Quick show for better responsiveness
                  hideDelay: 1000       // Longer linger time for reading content
                }
              );
            }
          }
        } catch (error) {
          console.error('Error adding help icon to Text Font:', error);
        }
      }, 50); // Small delay to ensure DOM is ready
      
      // Add font priority management button for Chinese fonts
      const fontPriorityButton = GeneralHandler.createButton('font-priority-btn', 'Chinese Font Setting', textContentContainer, 'input', FontPriorityManager.showModal, 'click');

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
    const twoLinerInfo = document.getElementById('two-liner-info'); // Get the info text div
    if (languageInput == '2Liner') {
      FormTextAddComponent.textLineInput = 2
      // Show justification toggle when 2Liner is selected
      const justificationContainer = document.getElementById('Justification-container').parentElement;
      justificationContainer.style.display = 'block';
      // Lock text input when in 2Liner mode
      document.getElementById('input-text').disabled = true;
      twoLinerInfo.style.display = 'block'; // Show the info text
    } else {
      FormTextAddComponent.textLineInput = 1
      // Hide justification toggle for single line text
      const justificationContainer = document.getElementById('Justification-container').parentElement;
      justificationContainer.style.display = 'none';
      // Enable text input for single line mode
      document.getElementById('input-text').disabled = false;
      twoLinerInfo.style.display = 'none'; // Hide the info text
    }
    FormTextAddComponent.populateLocationDropdown(regionName, language);
    if (FormTextAddComponent.newTextObject && CanvasGlobals.canvas.contains(FormTextAddComponent.newTextObject)) {
      FormTextAddComponent.liveUpdateText();
      CanvasGlobals.canvas.renderAll();
    }
  },

  /**
   * Handler for justification toggle
   */
  handleJustification: function (selectedButton) {
    FormTextAddComponent.justification = selectedButton.getAttribute('data-value');
    // If we already have a text object, update its justification
    if (FormTextAddComponent.newTextObject || CanvasGlobals.canvas.getActiveObject()?.functionalType === 'Text') {
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
      const activeObject = CanvasGlobals.canvas.getActiveObject();

      // If we already have a new text object being placed, update it
      if (FormTextAddComponent.newTextObject && CanvasGlobals.canvas.contains(FormTextAddComponent.newTextObject)) {
        FormTextAddComponent.liveUpdateText();
        CanvasGlobals.canvas.renderAll();
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
   */  liveUpdateText: function (event) {
    const newXHeight = parseInt(document.getElementById('input-xHeight').value);
    let newFont = document.getElementById('Text Font-container').selected.getAttribute('data-value');
    const newColor = document.getElementById('Message Colour-container').selected.getAttribute('data-value');    // Check if text contains non-English characters and override font if needed
    const txt = document.getElementById('input-text').value;
    const containsNonEnglish = containsNonEnglishCharacters(txt);
    
    if (containsNonEnglish) {
      // Get the primary font from FontPriorityManager for Chinese text
      try {
        const fontPriorityList = FontPriorityManager.getFontPriorityList();
        // Use the first font in the priority list for Chinese text
        const priorityFont = fontPriorityList.length > 0 ? fontPriorityList[0] : 'parsedFontKorean';
        // Convert font priority names to font family names
        switch(priorityFont) {
          case 'parsedFontKorean':
            newFont = 'TW-MOE-Std-Kai';
            break;
          case 'parsedFontChinese':
            newFont = 'TW-MOE-Std-Kai';
            break;
          case 'parsedFontMedium':
            newFont = 'TransportMedium';
            break;
          case 'parsedFontHeavy':
            newFont = 'TransportHeavy';
            break;
          default:
            newFont = 'TW-MOE-Std-Kai'; // Default for Chinese text
        }
      } catch (error) {
        console.warn('Could not get font from FontPriorityManager, falling back to default Chinese font:', error);
        newFont = 'TW-MOE-Std-Kai'; // Fallback to default Chinese font
      }
    }

    // Make sure we're not in placement mode
    if (FormTextAddComponent.newTextObject) {
      // If in placement mode, update the new object being placed
      let newText = document.getElementById('input-text').value;
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
              CanvasGlobals.canvas.renderAll();
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
              CanvasGlobals.canvas.renderAll();
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
    CanvasGlobals.canvas.off('mouse:move', FormTextAddComponent.TextOnMouseMove);
    CanvasGlobals.canvas.off('mouse:down', FormTextAddComponent.TextOnMouseClick);
    CanvasGlobals.canvas.on('mouse:down', FormTextAddComponent.EditOnMouseClick);

    const textObj = CanvasGlobals.canvas.getActiveObject();
    if (!textObj || textObj.functionalType !== 'Text') return;
    let newText = document.getElementById('input-text').value;
    if (!newText || newText.trim() === '') newText = textObj.text; // Don't create empty text

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

    CanvasGlobals.canvas.off('mouse:down', FormTextAddComponent.EditOnMouseClick);
  },

  cancelInput: function (event) {
    if (event.key === 'Escape') {
      // For 2-liner text, we need special handling to remove both English and Chinese texts
      if (FormTextAddComponent.textLineInput === 2 &&
        FormTextAddComponent.newTextObject &&
        CanvasGlobals.canvas.contains(FormTextAddComponent.newTextObject)) {

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

    // Use shared escape key handler for standard cleanup
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
  TextInputHandler: async function (event, options = null) {
    // Get text and parameters
    const txt = options ? options.text : document.getElementById('input-text').value;
    if (!txt || txt.trim() === '') return; // Don't create empty text

    const xHeight = options ? options.xHeight : parseInt(document.getElementById('input-xHeight').value);
      // Check if text contains non-English characters
    const containsNonEnglish = containsNonEnglishCharacters(txt);
    
    // Get font - use Chinese font from FontPriorityManager if text contains non-English characters
    let font;
    if (options && options.font) {
      font = options.font;
    } else if (containsNonEnglish) {
      // Get the primary font from FontPriorityManager for Chinese text
      try {
        const fontPriorityList = FontPriorityManager.getFontPriorityList();
        // Use the first font in the priority list for Chinese text
        font = fontPriorityList.length > 0 ? fontPriorityList[0] : 'parsedFontKorean';
        // Convert font priority names to font family names

      } catch (error) {
        console.warn('Could not get font from FontPriorityManager, falling back to default Chinese font:', error);
        font = 'Noto Sans KR'; // Fallback to default Chinese font
      }
    } else {
      // For English text, use the UI toggle value
      font = document.getElementById('Text Font-container').selected.getAttribute('data-value');
    }
    
    const color = options ? options.color : document.getElementById('Message Colour-container').selected.getAttribute('data-value');

    // Check if we're using two-liner mode
    const isTwoLiner = FormTextAddComponent.textLineInput === 2;
    const justification = FormTextAddComponent.justification || 'Left';

    // If we already have a new text object being placed, just update it instead of creating another
    if (FormTextAddComponent.newTextObject && CanvasGlobals.canvas.contains(FormTextAddComponent.newTextObject)) {
      FormTextAddComponent.newTextObject.updateText(txt, xHeight, font, color);
      CanvasGlobals.canvas.renderAll();
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
        await GeneralHandler.createObjectWithSnapping(
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

        // Use the general object creation function
        await GeneralHandler.createObjectWithSnapping(
          {
            text: txt,
            xHeight: xHeight,
            font: font,
            color: color
          },
          FormTextAddComponent.createTextObject,
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

    CanvasGlobals.canvas.renderAll();
  },

  // For regular single-line text, use our standard pattern
  // Create a function that returns a new TextObject
  createTextObject: (options) => {
    return new TextObject({
      text: options.text,
      xHeight: options.xHeight,
      font: options.font,
      color: options.color,
      left: options.position.x,
      top: options.position.y
    });
  },

  TextOnMouseMove: function (event) {
    // Use shared mouse move handler
    GeneralHandler.handleObjectOnMouseMove(FormTextAddComponent, event);
  },

  TextOnMouseClick: function (event, options = null) {
    if (event.e.button !== 0 && event.e.type !== 'touchend') return;

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
  },
  EditOnMouseClick: function (event) {
    document.getElementById('input-text').value = '';
    FormTextAddComponent.textPanelInit(null);
  },

  /**
   * Initialize the text component settings listener
   * This should be called after all modules are loaded to avoid circular dependencies
   */
  initializeSettingsListener: function() {
    // Replace the settings listener with the shared implementation
    GeneralSettings.addListener(
      GeneralHandler.createSettingsListener(2, function (setting, value) {
        // Text-specific updates when settings change
        if (FormTextAddComponent.newTextObject || CanvasGlobals.canvas.getActiveObject()?.functionalType === 'Text') {
          FormTextAddComponent.liveUpdateText();
        }
      })
    );
  }
};

export { FormTextAddComponent };