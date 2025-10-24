import { CanvasGlobals } from '../canvas/canvas.js';
import { symbolsPermittedAngle, BorderColorScheme } from '../objects/template.js';
import { FontPriorityManager } from '../modal/md-font.js';
import { containsNonEnglishCharacters } from '../objects/text.js';
import { canvasTracker } from '../canvas/Tracker.js';
import { DividerObject } from '../objects/divider.js';
import { anchorShape } from '../objects/anchor.js';
import { i18n } from '../i18n/i18n.js';

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
  // Prefer active objects from canvas to reliably detect multi-selection
  let active = [];
  try {
    active = CanvasGlobals.canvas.getActiveObjects ? CanvasGlobals.canvas.getActiveObjects() : [];
  } catch (_) { /* noop */ }
  if (active && active.length > 1) {
    showPropertyPanel(active);
    return;
  }
  const obj = event?.target || (Array.isArray(event?.selected) ? event.selected[0] : active[0]);
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

  // Helper: normalize display name for an object
  const getObjDisplayName = (obj, idx) => {
    const base = obj?._showName || obj?.type || `#${idx + 1}`;
    const idHint = obj?.canvasID != null ? ` (${obj.canvasID})` : '';
    return `${base}${idHint}`;
  };

  // Title (supports multi-select with dropdown)
  const title = document.createElement('div');
  title.className = 'property-title';

  const isMulti = Array.isArray(object) && object.length > 1;
  if (isMulti) {
    // Build dropdown in title: first option is Group summary
    const select = document.createElement('select');
    // Style to match single-title appearance via CSS; keep minimal inline sizing
    select.className = 'property-title-select';
    select.style.maxWidth = '80%';
    const groupOption = document.createElement('option');
    groupOption.value = 'group';
    groupOption.setAttribute('data-i18n', 'Group');
    groupOption.text = `${i18n.t('Group')} (${object.length})`;
    select.appendChild(groupOption);
    object.forEach((obj, idx) => {
      const opt = document.createElement('option');
      // value by canvasID if available, else index
      opt.value = obj?.canvasID != null ? String(obj.canvasID) : `idx:${idx}`;
      opt.text = getObjDisplayName(obj, idx);
      opt.setAttribute('background', '#444'); // Dark background for visibility
      select.appendChild(opt);
    });
    select.value = 'group';
    select.addEventListener('change', (e) => {
      const v = e.target.value;
      if (v === 'group') {
        showPropertyPanel(object);
        return;
      }
      const chosen = object.find((o, idx) => String(o.canvasID) === v || `idx:${idx}` === v);
      if (chosen) {
        // Optionally focus this object on canvas
        try {
          if (CanvasGlobals.canvas && CanvasGlobals.canvas.setActiveObject) {
            CanvasGlobals.canvas.discardActiveObject();
            CanvasGlobals.canvas.setActiveObject(chosen);
            CanvasGlobals.canvas.requestRenderAll && CanvasGlobals.canvas.requestRenderAll();
          }
        } catch (_) { /* noop */ }
        showPropertyPanel(chosen);
      }
    });
    title.appendChild(select);
  } else {
    // If we fall back to generic title, translate it; otherwise use object-specific name
    if (object && (object._showName || object.type)) {
      title.innerText = object._showName || object.type;
    } else {
      title.setAttribute('data-i18n', 'Object Properties');
      title.innerText = i18n.t('Object Properties');
    }
  }
  panel.appendChild(title);

  const PREDEFINED_COLORS = ['black', 'white',];
  // --- Helper functions for input changes ---
  function handleNumericInputChange(e, prop, targetObject) {
    let valueChanged = false;
    let numValue;
    let oldValue; // Track old value for undo

  const isBorder = targetObject.functionalType === 'Border';
  if (prop.key === 'xHeight') {
      numValue = parseFloat(e.target.value);
      if (!isNaN(numValue) && targetObject.xHeight !== numValue) {
        oldValue = targetObject.xHeight; // Store old value
        targetObject.xHeight = numValue;
        valueChanged = true;
      }
    } else { // Covers 'left', 'top', 'rootLength', 'tipLength'
      numValue = parseInt(e.target.value, 10);

      if (prop.key === 'rootLength' && targetObject.roadType == 'Main Line') {
        // edit the routeList
        targetObject.routeList[1].length = numValue
      } else if (prop.key === 'tipLength' && targetObject.roadType == 'Main Line') {
        // edit the routeList
        targetObject.routeList[0].length = numValue
      } else if (prop.key === 'routeWidth' && targetObject.roadType == 'Main Line') {
        targetObject.routeList.forEach(route => {
          route.width = numValue; // Update width for all routes
        });
      } else if (prop.key === 'innerCornerRadius' || prop.key === 'outerCornerRadius') {
        // Handle corner radius properties for MainRoad objects
        if (!isNaN(numValue) && targetObject[prop.key] !== numValue) {
          oldValue = targetObject[prop.key]; // Store old value
          targetObject[prop.key] = numValue;
          valueChanged = true;
        }
      }

      // Check lockMovement for left/top
      if (prop.key === 'left' && targetObject.lockMovementX && !targetObject.hasOwnProperty('fixedWidth')) {
        // Do not change value if movement is locked
      } else if (prop.key === 'top' && targetObject.lockMovementY && !targetObject.hasOwnProperty('fixedHeight')) {
        // Do not change value if movement is locked
      }
      else if (!isNaN(numValue) && targetObject[prop.key] !== numValue) {
        oldValue = targetObject[prop.key]; // Store old value
        targetObject.set(prop.key, numValue);
        valueChanged = true;
      }
    }

    // Reinitialize fixed width/height of borders
    if (isBorder && (prop.key === 'fixedWidth' || prop.key === 'fixedHeight')) {
      targetObject.calcfixedBboxes();
    }
    // If user moved left/top for border with fixed dimensions, update inbbox anchor using overrides
    if (isBorder && (prop.key === 'left' || prop.key === 'top')) {
      targetObject.calcfixedBboxes();
    }

    if (valueChanged) {
      // Track the property change for undo functionality
      canvasTracker.track('propertyChanged', [{
        functionalType: targetObject.functionalType,
        id: targetObject.canvasID,
        propertyKey: prop.key,
        oldValue: oldValue,
        newValue: numValue,
      }]);

      if (typeof targetObject.initialize === 'function') {
        try {
          targetObject.removeAll();
          targetObject.initialize();
          targetObject.updateAllCoord();
          if (targetObject.functionalType === 'Border') {
            targetObject.processResize();
          }
        } catch (initError) {
          console.error(`Error calling ${targetObject.type}.initialize() for ${prop.key} change:`, initError);
        }
      }
      CanvasGlobals.scheduleRender();
      canvasTracker.isDragging = false; // Reset dragging state
      showPropertyPanel(targetObject); // Refresh panel
    }
  }
  // Group-edit helpers for multi-select
  function isBorderType(obj) {
    return obj && obj.functionalType === 'Border';
  }
  function isDividerType(obj) {
    const ft = obj && obj.functionalType;
    return ft === 'HDivider' || ft === 'VDivider' || ft === 'VLane' || ft === 'HLine' || (typeof ft === 'string' && ft.includes('Divider'));
  }
  function rebuildObject(obj, changedKey) {
    if (typeof obj.initialize === 'function') {
      try {
        obj.removeAll();
        obj.initialize();
        obj.updateAllCoord();
        if (obj.functionalType === 'Border' && (changedKey === 'color' || changedKey === 'fill' || changedKey === 'fixedWidth' || changedKey === 'fixedHeight')) {
          obj.processResize();
        }
      } catch (err) {
        console.error(`Error rebuilding ${obj.type} after ${changedKey} change:`, err);
      }
    }
  }
  function handleGroupNumericChange(e, prop, selectedObjects) {
    const val = parseFloat(e.target.value);
    if (isNaN(val)) return;
    const changes = [];
    selectedObjects.forEach(o => {
      if (!o) return;
      if (prop.key === 'xHeight' && o.hasOwnProperty('xHeight')) {
        if (o.xHeight !== val) {
          const oldValue = o.xHeight;
          o.xHeight = val;
          changes.push({ functionalType: o.functionalType, id: o.canvasID, propertyKey: prop.key, oldValue, newValue: val });
          rebuildObject(o, prop.key);
        }
      }
    });
    if (changes.length) {
      try { canvasTracker.track('propertyChanged', changes); } catch (_) { }
      CanvasGlobals.scheduleRender();
      canvasTracker.isDragging = false;
      showPropertyPanel(selectedObjects);
    }
  }
  function handleGroupSelectChange(e, prop, selectedObjects) {
    const newValue = e.target.value;
    const changes = [];
    selectedObjects.forEach(o => {
      if (!o) return;
      if (prop.key === 'color') {
        // Skip Border and Divider types for color
        if (isBorderType(o) || isDividerType(o)) return;
        if (o.hasOwnProperty('color') && o.color !== newValue) {
          const oldValue = o.color;
          o.color = newValue;
          changes.push({ functionalType: o.functionalType, id: o.canvasID, propertyKey: prop.key, oldValue, newValue });
          rebuildObject(o, prop.key);
        }
      }
    });
    if (changes.length) {
      try { canvasTracker.track('propertyChanged', changes); } catch (_) { }
      CanvasGlobals.scheduleRender();
      canvasTracker.isDragging = false;
      showPropertyPanel(selectedObjects);
    }
  }
  function handleTextInputChange(e, prop, targetObject) {
    const newValue = e.target.value;
    if (targetObject[prop.key] !== newValue) {
      const oldValue = targetObject[prop.key]; // Store old value for tracking

      // Track the property change for undo functionality
      canvasTracker.track('propertyChanged', [{
        functionalType: targetObject.functionalType,
        id: targetObject.canvasID,
        propertyKey: prop.key,
        oldValue: oldValue,
        newValue: newValue,
      }]);

      targetObject.set(prop.key, newValue);
      if (targetObject.functionalType === 'Text' && prop.key === 'text') {
        targetObject._showName = newValue;
      }
      try {
        targetObject.removeAll();
        targetObject.initialize();
        targetObject.updateAllCoord();
      } catch (initError) {
        console.error(`Error calling ${targetObject.type}.initialize() for ${prop.key} change:`, initError);
      }
      CanvasGlobals.scheduleRender();
      canvasTracker.isDragging = false; // Reset dragging state
      showPropertyPanel(targetObject); // Refresh panel
    }
  }
  function handleSelectInputChange(e, prop, targetObject) {
    const newValue = e.target.value;
    let valueToSet = newValue;
    let valueChanged = false;
    let oldValue; // Store old value for tracking

    // Special handling: Text underline toggle
    if (prop.key === 'underline' && targetObject.functionalType === 'Text') {
      const wantUnderline = newValue === 'Yes';
      const currentlyUnderlined = !!targetObject.underline;
      if (wantUnderline === currentlyUnderlined) return; // No change

      oldValue = currentlyUnderlined ? 'Yes' : 'No';
      try {
        if (wantUnderline) {
          const underlineObject = new DividerObject({
            xHeight: targetObject.xHeight,
            color: targetObject.color,
            dividerType: 'HLine',
            textObject: targetObject,
            borderGroup: null,
          });
          underlineObject.isTemporary = true;
          // Anchor underline to text: V1 of text to E6 of underline, gap = xHeight/4
          anchorShape(targetObject, underlineObject, {
            vertexIndex1: 'V1',
            vertexIndex2: 'E6',
            spacingX: 0,
            spacingY: targetObject.xHeight / 4,
          });
          targetObject.underline = underlineObject;
          if (targetObject.borderGroup) {
            const border = targetObject.borderGroup;
            border.HDivider.push(underlineObject);
            border.heightObjects.push(underlineObject);
            underlineObject.borderGroup = border;
          }
        } else {
          if (targetObject.underline && typeof targetObject.underline.deleteObject === 'function') {
            const u = targetObject.underline;
            targetObject.underline = null;
            u.deleteObject(null, u);
          } else {
            targetObject.underline = null;
          }
        }
        valueChanged = true;
      } catch (err) {
        console.error('Failed to toggle underline:', err);
      }

    }
    else if (prop.key === 'color' || prop.key === 'fill') {
      if (targetObject[prop.key] !== newValue) {
        oldValue = targetObject[prop.key]; // Store old value
        targetObject[prop.key] = newValue; // Direct assignment for color/fill
        valueChanged = true;
      }
    } else if (prop.key === 'font') {
      if (targetObject[prop.key] !== newValue) {
        oldValue = targetObject[prop.key]; // Store old value
        targetObject.set(prop.key, newValue);
        valueChanged = true;
      }
    } else if (prop.key === 'symbolAngle') {
      valueToSet = parseInt(newValue, 10);
      if (targetObject[prop.key] !== valueToSet) {
        oldValue = targetObject[prop.key]; // Store old value
        targetObject.set(prop.key, valueToSet);
        valueChanged = true;
      }
    } else if (targetObject.functionalType === 'SideRoad' && (prop.key === 'shape' || prop.key === 'angle')) {
      if (prop.key === 'angle') {
        valueToSet = parseInt(newValue, 10);
      }
      // Specific update logic for SideRoad shape and angle
      if (targetObject.routeList && targetObject.routeList[0] && targetObject.routeList[0][prop.key] !== valueToSet) {
        oldValue = targetObject.routeList[0][prop.key]; // Store old value
        targetObject.routeList[0][prop.key] = valueToSet;
        valueChanged = true;
      }
    }

    if (valueChanged) {
      // Track the property change for undo functionality
      canvasTracker.track('propertyChanged', [{
        functionalType: targetObject.functionalType,
        id: targetObject.canvasID,
        propertyKey: prop.key,
        oldValue: oldValue,
        newValue: valueToSet,
      }]);

      if (typeof targetObject.initialize === 'function') {
        try {
          targetObject.removeAll();
          targetObject.initialize();
          targetObject.updateAllCoord();
          if (targetObject.functionalType === 'Border' && (prop.key === 'color' || prop.key === 'fill')) {
            targetObject.processResize();
          }
        } catch (initError) {
          console.error(`Error calling ${targetObject.type}.initialize() for ${prop.key} change:`, initError);
        }
      }
      CanvasGlobals.scheduleRender();
      canvasTracker.isDragging = false; // Reset dragging state
      showPropertyPanel(targetObject); // Refresh panel
    }
  }
  // --- End of helper functions ---

  // Helper to render a category box
  function renderCategory(name, props, targetObject) { // targetObject can be undefined or an array for group summaries
    if (!props.length) return;
    const box = document.createElement('div');
    box.className = 'input-group-container';
    const header = document.createElement('div');
    header.className = 'property-title';
    header.setAttribute('data-i18n', name);
    header.innerText = i18n.t(name);
    box.appendChild(header);

    props.forEach(prop => {
      const item = document.createElement('div');
      item.className = 'property-item';
      // Align rows in a two-column grid where the control/value hugs the right edge
      item.style.display = 'grid';
      item.style.gridTemplateColumns = '1fr auto';
      item.style.columnGap = '8px';
      item.style.alignItems = 'center';

      const labelSpan = document.createElement('span');
      labelSpan.style.minWidth = '0';
      labelSpan.style.justifySelf = 'start';
      labelSpan.style.textAlign = 'left';
      // Separate i18n label text from colon so colon isn't overridden by i18n.applyTranslations
      const labelTextSpan = document.createElement('span');
      labelTextSpan.setAttribute('data-i18n', prop.label);
      labelTextSpan.innerText = i18n.t(prop.label);
      const colonNode = document.createTextNode(':');
      labelSpan.appendChild(labelTextSpan);
      labelSpan.appendChild(colonNode);
      item.appendChild(labelSpan);

      if (prop.editable && targetObject && !Array.isArray(targetObject)) {
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
          inputElement.style.maxWidth = '100%';
          inputElement.style.justifySelf = 'end';
          inputElement.addEventListener('change', (e) => {
            handleNumericInputChange(e, prop, targetObject);
          });
        } else if (prop.type === 'text') { // Added handler for text input
          inputElement = document.createElement('input');
          inputElement.type = 'text';
          inputElement.value = targetObject[prop.key] || '';
          inputElement.style.width = '200px';
          inputElement.style.maxWidth = '100%';
          inputElement.style.justifySelf = 'end';
          inputElement.addEventListener('change', (e) => {
            handleTextInputChange(e, prop, targetObject);
          });
        } else if (prop.type === 'select') {
          inputElement = document.createElement('select');
          inputElement.style.width = '200px';
          inputElement.style.maxWidth = '100%';
          inputElement.style.justifySelf = 'end';
          prop.options.forEach(opt => { // opt is a color/name e.g. 'Primary', 'white'
            const option = document.createElement('option');
            option.value = opt;
            // Translate option text when possible
            if (typeof opt === 'string') {
              option.setAttribute('data-i18n', opt);
              option.text = i18n.t(opt);
            } else {
              option.text = String(opt);
            }
            inputElement.appendChild(option);
          });

          // inputElement.value = prop.value; // prop.value is the initial color name to select // Original line
          let valueToSet = prop.value; // Default to original prop.value
          if (typeof prop.value === 'string') {
            // Find an option that matches prop.value case-insensitively
            const matchedOption = prop.options.find(opt =>
              typeof opt === 'string' && opt.toLowerCase() === prop.value.toLowerCase()
            );
            if (matchedOption !== undefined) {
              valueToSet = matchedOption; // Use the casing from the option
            }
          }
          inputElement.value = valueToSet;

          inputElement.addEventListener('change', (e) => {
            handleSelectInputChange(e, prop, targetObject);
          });
        } else if (prop.type === 'select' && (prop.key === 'font' || prop.key === 'symbolAngle')) {
          inputElement = document.createElement('select');
          prop.options.forEach(opt => {
            const option = document.createElement('option');
            // Handle both string options and {value, label} objects
            if (typeof opt === 'object' && opt.value !== undefined) {
              option.value = opt.value;
              option.text = opt.label || opt.value;
            } else {
              option.value = opt;
              option.text = opt;
            }
            inputElement.appendChild(option);
          });
          inputElement.value = targetObject[prop.key]; // Current value

          inputElement.addEventListener('change', (e) => {
            handleSelectInputChange(e, prop, targetObject);
          });
        }
        if (inputElement) {
          item.appendChild(inputElement);
        }
      } else if (prop.editable && Array.isArray(targetObject)) {
        // Group-editable (multi-select) controls
        let inputElement;
        if (prop.type === 'number') {
          inputElement = document.createElement('input');
          inputElement.type = 'number';
          if (prop.value === 'varies') {
            inputElement.placeholder = i18n.t('varies');
          } else {
            inputElement.value = (prop.value !== undefined ? parseFloat(prop.value) : 0).toFixed(0);
          }
          inputElement.step = prop.step || '1';
          inputElement.style.width = '80px';
          inputElement.style.maxWidth = '100%';
          inputElement.style.justifySelf = 'end';
          inputElement.addEventListener('change', (e) => {
            handleGroupNumericChange(e, prop, targetObject);
          });
        } else if (prop.type === 'select') {
          inputElement = document.createElement('select');
          inputElement.style.width = '200px';
          inputElement.style.maxWidth = '100%';
          inputElement.style.justifySelf = 'end';
          // If varies, include a disabled placeholder first option
          const hasVaries = prop.value === 'varies';
          if (hasVaries) {
            const placeholder = document.createElement('option');
            placeholder.value = '';
            placeholder.disabled = true;
            placeholder.selected = true;
            placeholder.setAttribute('data-i18n', 'varies');
            placeholder.text = i18n.t('varies');
            inputElement.appendChild(placeholder);
          }
          (prop.options || []).forEach(opt => {
            const option = document.createElement('option');
            option.value = opt;
            option.setAttribute('data-i18n', opt);
            option.text = i18n.t(opt);
            inputElement.appendChild(option);
          });
          if (!hasVaries) inputElement.value = prop.value;
          inputElement.addEventListener('change', (e) => {
            handleGroupSelectChange(e, prop, targetObject);
          });
        }
        if (inputElement) {
          item.appendChild(inputElement);
        }
      } else {
        const valueSpan = document.createElement('span');
        let displayValue = prop.value; // prop.value is now guaranteed for geometry & basic
        valueSpan.style.justifySelf = 'end';
        valueSpan.style.textAlign = 'right';
        valueSpan.style.maxWidth = '100%';

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
        if (!isNaN(numericValue) && typeof displayValue !== 'boolean' && (typeof displayValue === 'number' || (typeof displayValue === 'string' && /^-?\d+(\.\d+)?$/.test(displayValue.trim())))) {
          valueSpan.innerText = numericValue.toFixed(1);
        } else {
          // Otherwise, display as is (e.g., color names, text, boolean values)
          if (typeof displayValue === 'string') {
            valueSpan.setAttribute('data-i18n', displayValue);
            valueSpan.innerText = i18n.t(displayValue);
          } else {
            valueSpan.innerText = displayValue;
          }
        }
        item.appendChild(valueSpan);
      }
      box.appendChild(item);
    });
    panel.appendChild(box);
  }

  // Helpers for bounds and common/basic comparisons
  const getBounds = (obj) => {
    const left = obj.left || 0;
    const top = obj.top || 0;
    const w = Math.round((obj.width || 0) * (obj.scaleX || 1));
    const h = Math.round((obj.height || 0) * (obj.scaleY || 1));
    return { left, top, right: left + w, bottom: top + h, width: w, height: h };
  };
  const normColor = (val, isBorderRel) => {
    if (!val) return val;
    if (isBorderRel) return val; // Border-related use color scheme names
    if (val === '#ffffff') return 'white';
    if (val === '#000000') return 'black';
    return val;
  };

  // Prepare Geometry and Basic properties depending on single vs multi
  let geometryProps = [];
  let basicProps = [];

  const isMultiSelect = Array.isArray(object) && object.length > 1;
  if (isMultiSelect) {
    // Geometry: show Left, Top, Width, Height (display-only; values are group bounds)
    let minL = Infinity, minT = Infinity, maxR = -Infinity, maxB = -Infinity;
    object.forEach(o => {
      const b = getBounds(o);
      if (b.left < minL) minL = b.left;
      if (b.top < minT) minT = b.top;
      if (b.right > maxR) maxR = b.right;
      if (b.bottom > maxB) maxB = b.bottom;
    });
    geometryProps.push({ label: 'Left (geom)', value: Math.round(minL) });
    geometryProps.push({ label: 'Top (geom)', value: Math.round(minT) });
    geometryProps.push({ label: 'Right (geom)', value: Math.round(maxR) });
    geometryProps.push({ label: 'Bottom (geom)', value: Math.round(maxB) });
    geometryProps.push({ label: 'Width (geom)', value: Math.round(maxR - minL) });
    geometryProps.push({ label: 'Height (geom)', value: Math.round(maxB - minT) });

    // Basic: editable in group; if all same, show value; else show 'varies'
    const allHaveXHeight = object.every(o => o.hasOwnProperty('xHeight'));
    if (allHaveXHeight) {
      const first = object[0].xHeight;
      const same = object.every(o => o.xHeight === first);
      basicProps.push({ label: 'x Height', key: 'xHeight', type: 'number', editable: true, step: 0.1, value: same ? first : 'varies' });
    }

    const allHaveColor = object.every(o => o.hasOwnProperty('color'));
    if (allHaveColor) {
      // Determine if all are border-related types
      const isBorderRel = object.every(o => (
        o.functionalType === 'Border' ||
        o.functionalType === 'HDivider' ||
        o.functionalType === 'VDivider' ||
        o.functionalType === 'VLane' ||
        o.functionalType === 'HLine'
      ));
      const first = normColor(object[0].color, isBorderRel);
      const same = object.every(o => normColor(o.color, isBorderRel) === first);
      // For group editing, provide a select for color, but applying will skip Border/Divider objects
      basicProps.push({ label: 'Color', key: 'color', type: 'select', options: PREDEFINED_COLORS, editable: true, value: same ? first : 'varies' });
    }
  } else {
    // Single object path (existing behavior)
    const obj = object;

    // Prepare Geometry properties
    const isNonMovable = obj.functionalType === 'Border' || obj.functionalType === 'HDivider' || obj.functionalType === 'VDivider' || obj.functionalType === 'VLane' || obj.functionalType === 'HLine';
    const hasEditableFixedWidth = obj.functionalType === 'Border' && obj.hasOwnProperty('fixedWidth') && obj.fixedWidth != null;
    const hasEditableFixedHeight = obj.functionalType === 'Border' && obj.hasOwnProperty('fixedHeight') && obj.fixedHeight != null;

    // Left
    geometryProps.push({
      label: 'Left (geom)',
      key: 'left',
      type: 'number',
      editable: (hasEditableFixedWidth && !obj.lockMovementX) || (!isNonMovable && !obj.lockMovementX),
      step: 1,
      value: obj.left
    });
    // Top remains same rules
    geometryProps.push({
      label: 'Top (geom)',
      key: 'top',
      type: 'number',
      editable: (hasEditableFixedHeight && !obj.lockMovementY) || (!isNonMovable && !obj.lockMovementY),
      step: 1,
      value: obj.top
    });
    // Right / Bottom display only
    geometryProps.push({ label: 'Right (geom)', value: Math.round(obj.left + (obj.width * (obj.scaleX || 1))) });
    geometryProps.push({ label: 'Bottom (geom)', value: Math.round(obj.top + (obj.height * (obj.scaleY || 1))) });
    // Width editable via fixedWidth if present, else display actual width
    if (hasEditableFixedWidth) {
      geometryProps.push({ label: 'Width (geom)', key: 'fixedWidth', type: 'number', editable: true, step: 1, value: obj.fixedWidth });
    } else {
      geometryProps.push({ label: 'Width (geom)', value: Math.round((obj.width || 0) * (obj.scaleX || 1)) });
    }
    // Height editable via fixedHeight if present, else display height
    if (hasEditableFixedHeight) {
      geometryProps.push({ label: 'Height (geom)', key: 'fixedHeight', type: 'number', editable: true, step: 1, value: obj.fixedHeight });
    } else {
      geometryProps.push({ label: 'Height (geom)', value: Math.round((obj.height || 0) * (obj.scaleY || 1)) });
    }

    // Prepare Basic properties (xHeight, Color)
    const isBorderRelatedType = obj.functionalType === 'Border' ||
      obj.functionalType === 'HDivider' ||
      obj.functionalType === 'VDivider' ||
      obj.functionalType === 'VLane' ||
      obj.functionalType === 'HLine';

    if (obj.hasOwnProperty('xHeight')) {
      // Use the existing translation key 'x Height'
      basicProps.push({ label: 'x Height', key: 'xHeight', type: 'number', editable: true, step: 0.1, value: obj.xHeight });
    }

    if (obj.hasOwnProperty('color')) {
      let colorOptions;
      let initialSelectValue = obj.color; // Actual color value (hex or name like 'white')

      if (isBorderRelatedType) {
        colorOptions = Object.keys(BorderColorScheme);
        const colorNameFromScheme = Object.keys(BorderColorScheme).find(name => name === obj.color);
        initialSelectValue = colorNameFromScheme || (colorOptions.length > 0 ? colorOptions[0] : obj.color);
      } else {
        colorOptions = PREDEFINED_COLORS;
        if (obj.color === '#ffffff') initialSelectValue = 'white';
        else if (obj.color === '#000000') initialSelectValue = 'black';
        // else initialSelectValue remains obj.color if not hex white/black
      }
      basicProps.push({ label: 'Color', key: 'color', type: 'select', options: colorOptions, editable: true, value: initialSelectValue });

    }
  }

  // Prepare special properties (remains display-only as per current structure)
  let specialProps = [];
  if (!isMultiSelect) switch (object.functionalType) {
    case 'Text':
      // Check if text contains non-English characters to determine appropriate font options
      const hasNonEnglish = containsNonEnglishCharacters(object.text);
      const fontOptions = FontPriorityManager.getAllAvailableFonts(hasNonEnglish);
      specialProps = [
        { label: 'Text', key: 'text', type: 'text', editable: true, value: object.text },
        { label: 'Font', key: 'font', type: 'select', options: fontOptions.map(f => f.value), editable: true, value: object.font },
        { label: 'Underline', key: 'underline', type: 'select', options: ['Yes', 'No'], editable: true, value: object.underline ? 'Yes' : 'No' }
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
      ];
      if (object.roadType === 'Main Line') {
        specialProps.push(
          { label: 'Approach Length', key: 'rootLength', type: 'number', editable: true, step: 1, value: object.rootLength },
          { label: 'Exit Length', key: 'tipLength', type: 'number', editable: true, step: 1, value: object.tipLength },
          { label: 'Route Width', key: 'routeWidth', type: 'number', editable: true, step: 1, value: object.routeWidth },
        );

        // Add corner radius inputs for LaneDrop shape
        if (object.routeList && object.routeList[0] && object.routeList[0].shape === 'LaneDrop') {
          specialProps.push(
            { label: 'Inner Corner Radius', key: 'innerCornerRadius', type: 'number', editable: true, step: 0.1, value: object.innerCornerRadius || 1 },
            { label: 'Outer Corner Radius', key: 'outerCornerRadius', type: 'number', editable: true, step: 0.1, value: object.outerCornerRadius || 4 }
          );
        }
      } /*else {
        specialProps.push(
          { label: 'Root Length', value: object.rootLength },
          { label: 'Tip Length', value: object.tipLength }
        );
      }*/
      specialProps.push({ label: 'Side Roads', value: object.sideRoad.length });
      break;
    case 'SideRoad':
      specialProps = [
        { label: 'Parent Road', value: object.mainRoad?.roadType || '' },
        { label: 'Branch Index', value: object.branchIndex },
        { label: 'Shape', key: 'shape', type: 'select', options: ['Arrow', 'Stub'], editable: true, value: object.routeList[0].shape },
        { label: 'Angle', key: 'angle', type: 'select', options: [45, 60, 90], editable: true, value: object.routeList[0].angle }
      ];
      // Add event listener for SideRoad shape and angle directly if not covered by generic select
      // This part might be redundant if the generic select handler covers it.
      // We will rely on the handleSelectInputChange to manage SideRoad specific updates.
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
  // Render categories
  if (isMultiSelect) {
    renderCategory('Geometry', geometryProps); // display-only
    renderCategory('Basic', basicProps, object); // group-editable for Basic
  } else {
    renderCategory('Geometry', geometryProps, object);
    renderCategory('Basic', basicProps, object);
    renderCategory(object.functionalType || 'Special', specialProps, object);
  }

  // Apply translations to the freshly built panel
  try { i18n.applyTranslations(panel); } catch (_) { }
}



// Export showPropertyPanel for context menu
export { showPropertyPanel, handleClear };