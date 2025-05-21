import { CanvasGlobals } from '../canvas/canvas.js';
import { symbolsPermittedAngle, BorderColorScheme } from '../objects/template.js';

// Add handler for 'Property' context-menu action
const propertyMenuItem = document.getElementById('property');
const contextMenu = document.getElementById('context-menu');

propertyMenuItem.addEventListener('click', function (e) {
  e.preventDefault();
  contextMenu.style.display = 'none';
  const obj = contextMenu.selectedArrow;
  showPropertyPanel(obj);
});

// Initialize property panel based on canvas selection events
CanvasGlobals.canvas.on('selection:created', handleSelection);
CanvasGlobals.canvas.on('selection:updated', handleSelection);
CanvasGlobals.canvas.on('object:modified', handleSelection);
//CanvasGlobals.canvas.on('selection:cleared', handleClear);

function handleSelection(event) {
  const panel = document.getElementById('property-panel');
  // Only update panel if it was opened via context-menu
  if (panel.style.display !== 'block') return;
  const obj = event.target || (Array.isArray(event.selected) ? event.selected[0] : null);
  if (obj) showPropertyPanel(obj);
}

function handleClear() {
  const panel = document.getElementById('property-panel');
  panel.style.display = 'none';
  panel.innerHTML = '';
}

// Function to populate and display the property panel
function showPropertyPanel(object) {
  const panel = document.getElementById('property-panel');
  panel.innerHTML = '';
  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'property-close';
  closeBtn.innerHTML = '\u00d7';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
  panel.appendChild(closeBtn);

  panel.style.display = 'block';

  // Title
  const title = document.createElement('div');
  title.className = 'property-title';
  title.innerText = object._showName || object.type || 'Object Properties';
  panel.appendChild(title);

  const PREDEFINED_COLORS = ['black', 'white',];

  // Helper to render a category box
  function renderCategory(name, props, targetObject) { // Added targetObject parameter
    if (!props.length) return;
    const box = document.createElement('div');
    box.className = 'input-group-container';
    const header = document.createElement('div');
    header.className = 'property-title';
    header.innerText = name;
    box.appendChild(header);

    props.forEach(prop => {
      const item = document.createElement('div');
      item.className = 'property-item';

      const labelSpan = document.createElement('span');
      labelSpan.innerText = `${prop.label}: `;
      item.appendChild(labelSpan);

      if (prop.editable && targetObject) {
        let inputElement;
        if (prop.type === 'number') {
          inputElement = document.createElement('input');
          inputElement.type = 'number';
          const currentValue = targetObject[prop.key];
          if (prop.key === 'xHeight') {
            inputElement.value = (currentValue !== undefined ? parseFloat(currentValue) : 0).toFixed(0);
            inputElement.step = prop.step || '5';
          } else {
            inputElement.value = Math.round(currentValue !== undefined ? parseFloat(currentValue) : 0);
            inputElement.step = prop.step || '1';
          }
          inputElement.style.width = '80px';
          inputElement.addEventListener('change', (e) => {
            let valueChanged = false;
            if (prop.key === 'left' || prop.key === 'top') {
              const numValue = parseInt(e.target.value, 10);
              if (!isNaN(numValue) && targetObject[prop.key] !== numValue) {
                targetObject.set(prop.key, numValue);
                valueChanged = true;
              }
            } else if (prop.key === 'xHeight') {
              const floatValue = parseFloat(e.target.value);
              if (!isNaN(floatValue) && targetObject.xHeight !== floatValue) {
                targetObject.xHeight = floatValue;
                valueChanged = true;
              }
            }

            if (valueChanged) {
              if (typeof targetObject.initialize === 'function') {
                try {
                  targetObject.removeAll();
                  targetObject.initialize();
                  targetObject.updateAllCoord();

                } catch (initError) {
                  console.error(`Error calling ${targetObject.type}.initialize():`, initError);
                }
              }
              CanvasGlobals.canvas.renderAll();
              showPropertyPanel(targetObject); // Refresh panel
            }
          });
        } else if (prop.type === 'text') { // Added handler for text input
          inputElement = document.createElement('input');
          inputElement.type = 'text';
          inputElement.value = targetObject[prop.key] || '';
          //inputElement.style.width = '400px'; // Adjust width to match other inputs
          inputElement.addEventListener('change', (e) => {
            const newValue = e.target.value;
            if (targetObject[prop.key] !== newValue) {
              targetObject.set(prop.key, newValue);
              // Assuming _showName should be updated with the text for Text objects
              if (targetObject.functionalType === 'Text') {
                targetObject._showName = newValue;
              }
                try {
                  // Text objects might have specific update needs,
                  // but the generic initialize pattern is used here for consistency.
                  targetObject.removeAll();
                  targetObject.initialize();
                  targetObject.updateAllCoord();
                } catch (initError) {
                  console.error(`Error calling ${targetObject.type}.initialize() for ${prop.key} change:`, initError);
                }            
              CanvasGlobals.canvas.renderAll();
              showPropertyPanel(targetObject); // Refresh panel to update title and content
            }
          });
        } else if (prop.type === 'select' && (prop.key === 'color' || prop.key === 'fill')) {
          inputElement = document.createElement('select');
          prop.options.forEach(opt => { // opt is a color name e.g. 'Primary', 'white'
            const option = document.createElement('option');
            option.value = opt;
            option.text = opt;
            inputElement.appendChild(option);
          });

          inputElement.value = prop.value.toLowerCase(); // prop.value is the initial color name to select

          inputElement.addEventListener('change', (e) => {
            const selectedOptionName = e.target.value; // This is the color name from dropdown

            if (targetObject[prop.key] !== selectedOptionName) {
              targetObject[prop.key] = selectedOptionName;
              if (typeof targetObject.initialize === 'function') {
                try {
                  targetObject.removeAll();
                  targetObject.initialize();
                  targetObject.updateAllCoord();
                  if (targetObject.functionalType === 'Border') {
                    targetObject.processResize();
                  }
                } catch (initError) {
                  console.error(`Error calling ${targetObject.type}.initialize() for color change:`, initError);
                }
              }
              CanvasGlobals.canvas.renderAll();
              showPropertyPanel(targetObject); // Refresh panel
            }
          });
        } else if (prop.type === 'select' && (prop.key === 'font' || prop.key === 'symbolAngle')) {
          inputElement = document.createElement('select');
          prop.options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.text = opt;
            inputElement.appendChild(option);
          });
          inputElement.value = targetObject[prop.key]; // Current value

          inputElement.addEventListener('change', (e) => {
            const newValue = e.target.value;
            let valueToSet = newValue;
            if (prop.key === 'symbolAngle') {
              valueToSet = parseInt(newValue, 10); // Ensure angle is a number
            }

            if (targetObject[prop.key] !== valueToSet) {
              targetObject.set(prop.key, valueToSet);
              if (typeof targetObject.initialize === 'function') {
                try {
                  targetObject.removeAll();
                  targetObject.initialize();
                  targetObject.updateAllCoord();
                } catch (initError) {
                  console.error(`Error calling ${targetObject.type}.initialize() for ${prop.key} change:`, initError);
                }
              }
              CanvasGlobals.canvas.renderAll();
              showPropertyPanel(targetObject); // Refresh panel
            }
          });
        }
        if (inputElement) {
          item.appendChild(inputElement);
        }
      } else {
        const valueSpan = document.createElement('span');
        let displayValue = prop.value; // prop.value is now guaranteed for geometry & basic

        // Handle color name conversion for display
        if (typeof displayValue === 'string' && (prop.label === 'Color' || prop.label === 'Fill Color')) {
          if (displayValue === '#ffffff') {
            displayValue = 'white';
          } else if (displayValue === '#000000') {
            displayValue = 'black';
          }
        }

        // Attempt to parse as float for formatting
        const numericValue = parseFloat(displayValue);

        // Check if it's a number or a string that purely represents a number
        if (!isNaN(numericValue) && typeof displayValue !== 'boolean' && (typeof displayValue === 'number' || (typeof displayValue === 'string' && /^-?\\d+(\\.\\d+)?$/.test(displayValue.trim())))) {
          valueSpan.innerText = numericValue.toFixed(1);
        } else {
          // Otherwise, display as is (e.g., color names, text, boolean values)
          valueSpan.innerText = displayValue;
        }
        item.appendChild(valueSpan);
      }
      box.appendChild(item);
    });
    panel.appendChild(box);
  }

  // Prepare Geometry properties
  const isNonMovable = object.functionalType === 'Border' || object.functionalType === 'HDivider' || object.functionalType === 'VDivider' || object.functionalType === 'VLane' || object.functionalType === 'HLine';
  const geometryProps = [
    { label: 'Left', key: 'left', type: 'number', editable: !isNonMovable, step: 1, value: object.left },
    { label: 'Top', key: 'top', type: 'number', editable: !isNonMovable, step: 1, value: object.top },
    { label: 'Right', value: Math.round(object.left + (object.width * (object.scaleX || 1))) },
    { label: 'Bottom', value: Math.round(object.top + (object.height * (object.scaleY || 1))) },
    { label: 'Width', value: Math.round((object.width || 0) * (object.scaleX || 1)) },
    { label: 'Height', value: Math.round((object.height || 0) * (object.scaleY || 1)) }
  ];

  // Prepare Basic properties (xHeight, Color)
  const basicProps = [];
  const isBorderRelatedType = object.functionalType === 'Border' ||
    object.functionalType === 'HDivider' ||
    object.functionalType === 'VDivider' ||
    object.functionalType === 'VLane' ||
    object.functionalType === 'HLine';

  if (object.hasOwnProperty('xHeight')) {
    basicProps.push({ label: 'xHeight', key: 'xHeight', type: 'number', editable: true, step: 0.1, value: object.xHeight });
  }

  if (object.hasOwnProperty('color')) {
    let colorOptions;
    let initialSelectValue = object.color; // Actual color value (hex or name like 'white')

    if (isBorderRelatedType) {
      colorOptions = Object.keys(BorderColorScheme);
      const colorNameFromScheme = Object.keys(BorderColorScheme).find(name => name === object.color);
      initialSelectValue = colorNameFromScheme || (colorOptions.length > 0 ? colorOptions[0] : object.color);
    } else {
      colorOptions = PREDEFINED_COLORS;
      if (object.color === '#ffffff') initialSelectValue = 'white';
      else if (object.color === '#000000') initialSelectValue = 'black';
      // else initialSelectValue remains object.color if not hex white/black
    }
    basicProps.push({ label: 'Color', key: 'color', type: 'select', options: colorOptions, editable: true, value: initialSelectValue });

  } 

  // Prepare special properties (remains display-only as per current structure)
  let specialProps = [];
  switch (object.functionalType) {
    case 'Text':
      specialProps = [
        { label: 'Text', key: 'text', type: 'text', editable: true, value: object.text },
        { label: 'Font', key: 'font', type: 'select', options: ['TransportHeavy', 'TransportMedium'], editable: true, value: object.font }
      ];
      break;
    case 'Symbol':
      specialProps = [
        { label: 'Symbol Type', value: object.symbolType },
      ];
      // Determine permitted angles for the current symbolType
      const permittedAngles = symbolsPermittedAngle[object.symbolType];
      if (permittedAngles && permittedAngles.length > 0) {
        specialProps.push({ label: 'Angle', key: 'symbolAngle', type: 'select', options: permittedAngles, editable: true, value: object.symbolAngle });
      } else {
        // If no specific angles are defined, or if the symbolType is not in symbolsPermittedAngle,
        // default to 0 degrees and make it non-editable.
        specialProps.push({ label: 'Angle', value: 0, editable: false });
      }
      break;
    case 'MainRoad':
      specialProps = [
        { label: 'Road Type', value: object.roadType },
        { label: 'Root Length', value: object.rootLength },
        { label: 'Tip Length', value: object.tipLength },
        //{ label: 'RA Feature', value: object.RAfeature },
        { label: 'Side Roads', value: object.sideRoad.length }
      ];
      break;
    case 'SideRoad':
      specialProps = [
        { label: 'Parent Road', value: object.mainRoad?.roadType || '' },
        { label: 'Branch Index', value: object.branchIndex },
        { label: 'Shape', value: object.routeList[0].shape },
      ];
      if (object.mainRoad.roadType == 'Main Line') {
        specialProps.push({ label: 'Angle', value: object.routeList[0].angle });
      }
      break;
    case 'Border':
      specialProps = [
        { label: 'Border Type', value: object.borderType },
        { label: 'Frame Width', value: object.frame },
        { label: 'Width Objects', value: object.widthObjects.length },
        { label: 'Height Objects', value: object.heightObjects.length },
        { label: 'HDivider Count', value: object.HDivider.length },
        { label: 'VDivider Count', value: object.VDivider.length }
      ];
      if (object.bbox) {
        const b = object.bbox;
        specialProps.push({ label: 'BBox', value: `L:${Math.round(b.left)}, T:${Math.round(b.top)}, R:${Math.round(b.right)}, B:${Math.round(b.bottom)}` });
      }
      break;
  }

  // Render categories
  renderCategory('Geometry', geometryProps, object); // Pass object
  renderCategory('Basic', basicProps, object);       // Pass object
  renderCategory(object.functionalType || 'Special', specialProps, object); // Pass object, provide default name
}

// Refresh property panel when arrow keys are pressed
document.addEventListener('keydown', (event) => {
  const panel = document.getElementById('property-panel');
  if (panel.style.display !== 'block') return;
  const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  if (arrowKeys.includes(event.key)) {
    // Update content based on current active object
    const obj = CanvasGlobals.canvas.getActiveObject();
    if (obj) showPropertyPanel(obj);
  }
});

// Export showPropertyPanel for context menu
export { showPropertyPanel, handleClear};