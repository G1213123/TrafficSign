import { useEffect, useState } from 'react';
import { CanvasGlobals } from "../canvas/canvas.js";
import { symbolsPermittedAngle } from '../../lib/templates/symbolTemplate.js';
import { routePermittedAngle } from '../../lib/templates/mapTemplate.js';
import { BorderColorScheme } from '../../lib/templates/borderTemplate.js';
import { FontPriorityManager } from '../../lib/modal/md-font.js';
import { containsNonEnglishCharacters } from '../../lib/objects/text.js';
import { canvasTracker } from '../../lib/utils/Tracker.js';
import { DividerObject } from '../../lib/objects/divider.js';
import { anchorShape } from '../../lib/objects/anchor.js';
import { i18n } from '../../lib/i18n/i18n.js';
import { calculateMainRoadBottomY } from '../../lib/objects/mainRoute.js';
import './property.css';

// Add handler for 'Property' context-menu action
//const propertyMenuItem = document.getElementById('property');
//const contextMenu = document.getElementById('context-menu');//

export const propertyPanelState = {
  isVisible: false,
  activeObject: null,
  setVisible: (visible) => {
    propertyPanelState.isVisible = visible;
  },
  setActiveObject: (obj) => {
    propertyPanelState.activeObject = obj;
  }
};

// Initialize property panel based on canvas selection events
export function initializePropertyPanel(canvas) {
  canvas.on('selection:created', handleSelection);
  canvas.on('selection:updated', handleSelection);
  canvas.on('object:modified', handleSelection);
  canvas.on('selection:cleared', handleClear);
}

export function handleSelection(event) {
  // Only update panel if it was opened via context-menu
  if (!propertyPanelState.isVisible) return;

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

export function handleClear() {
  propertyPanelState.setVisible(false);
  propertyPanelState.setActiveObject(null);
}

export function showPropertyPanel(object) {
  if (!object) {
    handleClear();
    return;
  }
  propertyPanelState.setActiveObject(object);
  propertyPanelState.setVisible(true);
}

// --- Helper functions for input changes ---

// Group-edit helpers for multi-select
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
  const isborder = (obj) => obj && obj.functionalType === 'Border';
  const isdivider = (obj) => obj && (obj.functionalType === 'HDivider' || obj.functionalType === 'VDivider' || obj.functionalType === 'VLane' || obj.functionalType === 'HLine' || (typeof obj.functionalType === 'string' && obj.functionalType.includes('Divider')));
  selectedObjects.forEach(o => {
    if (!o) return;
    if (prop.key === 'color') {
      // Skip Border and Divider types for color
      if (isborder(o) || isdivider(o)) return;
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
      targetObject.updateText(newValue, targetObject.xHeight, targetObject.font, targetObject.color);
      //targetObject.removeAll();
      //targetObject.initialize();
      //targetObject.updateAllCoord();
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
  } else if (prop.key === 'symbolAngle' || prop.key === 'mainAngle') {
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



const PREDEFINED_COLORS = ['black', 'white'];

const getObjDisplayName = (obj, idx) => {
  const base = obj?._showName || obj?.type || `#${idx + 1}`;
  const idHint = obj?.canvasID != null ? ` (${obj.canvasID})` : '';
  return `${base}${idHint}`;
};

function buildPropertyModel(object) {
  const isMultiSelect = Array.isArray(object) && object.length > 1;
  const geometryProps = [];
  const basicProps = [];
  const specialProps = [];

  if (isMultiSelect) {
    let minL = Infinity, minT = Infinity, maxR = -Infinity, maxB = -Infinity;
    object.forEach((o) => {
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

    if (object.every((o) => o.hasOwnProperty('xHeight'))) {
      const first = object[0].xHeight;
      const same = object.every((o) => o.xHeight === first);
      basicProps.push({ label: 'x Height', key: 'xHeight', type: 'number', editable: true, step: 0.1, value: same ? first : 'varies' });
    }

    if (object.every((o) => o.hasOwnProperty('color'))) {
      const isBorderRel = object.every((o) => (
        o.functionalType === 'Border' ||
        o.functionalType === 'HDivider' ||
        o.functionalType === 'VDivider' ||
        o.functionalType === 'VLane' ||
        o.functionalType === 'HLine'
      ));
      const first = normColor(object[0].color, isBorderRel);
      const same = object.every((o) => normColor(o.color, isBorderRel) === first);
      basicProps.push({ label: 'Color', key: 'color', type: 'select', options: PREDEFINED_COLORS, editable: true, value: same ? first : 'varies' });
    }
  } else if (object) {
    const obj = object;
    const isNonMovable = obj.functionalType === 'Border' || obj.functionalType === 'HDivider' || obj.functionalType === 'VDivider' || obj.functionalType === 'VLane' || obj.functionalType === 'HLine';
    const hasEditableFixedWidth = obj.functionalType === 'Border' && obj.hasOwnProperty('fixedWidth') && obj.fixedWidth != null;
    const hasEditableFixedHeight = obj.functionalType === 'Border' && obj.hasOwnProperty('fixedHeight') && obj.fixedHeight != null;

    geometryProps.push({
      label: 'Left (geom)',
      key: 'left',
      type: 'number',
      editable: (hasEditableFixedWidth && !obj.lockMovementX) || (!isNonMovable && !obj.lockMovementX),
      step: 1,
      value: obj.left
    });
    geometryProps.push({
      label: 'Top (geom)',
      key: 'top',
      type: 'number',
      editable: (hasEditableFixedHeight && !obj.lockMovementY) || (!isNonMovable && !obj.lockMovementY),
      step: 1,
      value: obj.top
    });
    geometryProps.push({ label: 'Right (geom)', value: Math.round(obj.left + (obj.width * (obj.scaleX || 1))) });
    geometryProps.push({ label: 'Bottom (geom)', value: Math.round(obj.top + (obj.height * (obj.scaleY || 1))) });
    geometryProps.push(hasEditableFixedWidth
      ? { label: 'Width (geom)', key: 'fixedWidth', type: 'number', editable: true, step: 1, value: obj.fixedWidth }
      : { label: 'Width (geom)', value: Math.round((obj.width || 0) * (obj.scaleX || 1)) });
    geometryProps.push(hasEditableFixedHeight
      ? { label: 'Height (geom)', key: 'fixedHeight', type: 'number', editable: true, step: 1, value: obj.fixedHeight }
      : { label: 'Height (geom)', value: Math.round((obj.height || 0) * (obj.scaleY || 1)) });

    const isBorderRelatedType = obj.functionalType === 'Border' ||
      obj.functionalType === 'HDivider' ||
      obj.functionalType === 'VDivider' ||
      obj.functionalType === 'VLane' ||
      obj.functionalType === 'HLine';

    if (obj.hasOwnProperty('xHeight')) {
      basicProps.push({ label: 'x Height', key: 'xHeight', type: 'number', editable: true, step: 0.1, value: obj.xHeight });
    }

    if (obj.hasOwnProperty('color')) {
      let colorOptions;
      let initialSelectValue = obj.color;
      if (isBorderRelatedType) {
        colorOptions = Object.keys(BorderColorScheme);
        const colorNameFromScheme = Object.keys(BorderColorScheme).find((name) => name === obj.color);
        initialSelectValue = colorNameFromScheme || (colorOptions.length > 0 ? colorOptions[0] : obj.color);
      } else {
        colorOptions = PREDEFINED_COLORS;
        if (obj.color === '#ffffff') initialSelectValue = 'white';
        else if (obj.color === '#000000') initialSelectValue = 'black';
      }
      basicProps.push({ label: 'Color', key: 'color', type: 'select', options: colorOptions, editable: true, value: initialSelectValue });
    }

    switch (obj.functionalType) {
      case 'Text': {
        const hasNonEnglish = containsNonEnglishCharacters(obj.text);
        const fontOptions = FontPriorityManager.getAllAvailableFonts(hasNonEnglish);
        specialProps.push(
          { label: 'Text', key: 'text', type: 'text', editable: true, value: obj.text },
          { label: 'Font', key: 'font', type: 'select', options: fontOptions.map((f) => f.value), editable: true, value: obj.font },
          { label: 'Underline', key: 'underline', type: 'select', options: ['Yes', 'No'], editable: true, value: obj.underline ? 'Yes' : 'No' }
        );
        break;
      }
      case 'Symbol': {
        specialProps.push({ label: 'Symbol Type', value: obj.symbolType });
        const permittedAngles = symbolsPermittedAngle[obj.symbolType];
        if (permittedAngles && permittedAngles.length > 0) {
          specialProps.push({ label: 'Angle', key: 'symbolAngle', type: 'select', options: permittedAngles, editable: true, value: obj.symbolAngle });
        } else {
          specialProps.push({ label: 'Angle', value: 0, editable: false });
        }
        break;
      }
      case 'MainRoad': {
        specialProps.push({ label: 'Road Type', value: obj.roadType });
        if (routePermittedAngle[obj.roadType]) {
          specialProps.push({ label: 'Main Angle', key: 'mainAngle', type: 'select', options: routePermittedAngle[obj.roadType], editable: true, value: obj.mainAngle || 0 });
        }
        if (obj.roadType === 'Main Line') {
          specialProps.push(
            { label: 'Approach Length', key: 'rootLength', type: 'number', editable: true, step: 1, value: obj.rootLength },
            { label: 'Exit Length', key: 'tipLength', type: 'number', editable: true, step: 1, value: obj.tipLength },
            { label: 'Route Width', key: 'routeWidth', type: 'number', editable: true, step: 1, value: obj.routeWidth }
          );
          if (obj.routeList && obj.routeList[0] && obj.routeList[0].shape === 'LaneDrop') {
            specialProps.push(
              { label: 'Inner Corner Radius', key: 'innerCornerRadius', type: 'number', editable: true, step: 0.1, value: obj.innerCornerRadius || 1 },
              { label: 'Outer Corner Radius', key: 'outerCornerRadius', type: 'number', editable: true, step: 0.1, value: obj.outerCornerRadius || 4 }
            );
          }
        }
        specialProps.push({ label: 'Side Roads', value: obj.sideRoad.length });
        break;
      }
      case 'SideRoad': {
        const isBaseRoundabout = obj.routeList && obj.routeList[0] && obj.routeList[0].shape === 'Base Roundabout';
        specialProps.push({ label: 'Parent Road', value: obj.mainRoad?.roadType || '' }, { label: 'Branch Index', value: obj.branchIndex });
        if (!isBaseRoundabout) {
          specialProps.push(
            { label: 'Shape', key: 'shape', type: 'select', options: ['Arrow', 'Stub'], editable: true, value: obj.routeList[0].shape },
            { label: 'Angle', key: 'angle', type: 'select', options: [45, 60, 90], editable: true, value: obj.routeList[0].angle }
          );
        }
        break;
      }
      case 'Border': {
        specialProps.push(
          { label: 'Border Type', value: obj.borderType },
          { label: 'Frame Width', value: obj.frame },
          { label: 'Width Objects', value: obj.widthObjects.length },
          { label: 'Height Objects', value: obj.heightObjects.length },
          { label: 'HDivider Count', value: obj.HDivider.length },
          { label: 'VDivider Count', value: obj.VDivider.length }
        );
        if (obj.bbox) {
          const b = obj.bbox;
          specialProps.push({ label: 'BBox', value: `L:${Math.round(b.left)}, T:${Math.round(b.top)}, R:${Math.round(b.right)}, B:${Math.round(b.bottom)}` });
        }
        break;
      }
    }
  }

  return {
    isMultiSelect,
    sections: [
      { name: 'Geometry', props: geometryProps },
      { name: 'Basic', props: basicProps },
      ...(!isMultiSelect && specialProps.length > 0 ? [{ name: object.functionalType || 'Special', props: specialProps }] : []),
    ],
  };
}

function PropertyFieldInput({ prop, targetObject, isGroup, value, onValueChange }) {
  const handleInputChange = (nextValue) => {
    onValueChange?.(prop, nextValue);
  };

  if (prop.editable && targetObject && !Array.isArray(targetObject)) {
    if (prop.type === 'number') {
      return (
        <input
          type="number"
          className="property-input-field property-input-number"
          value={prop.key === 'xHeight' ? (targetObject[prop.key] !== undefined ? parseFloat(targetObject[prop.key]) : 0).toFixed(0) : Math.round(targetObject[prop.key] !== undefined ? parseFloat(targetObject[prop.key]) : 0)}
          step={prop.step || (prop.key === 'xHeight' ? '5' : '1')}
          onChange={(e) => handleNumericInputChange(e, prop, targetObject)}
        />
      );
    }
    if (prop.type === 'text') {
      return (
        <input
          type="text"
          className="property-input-field property-input-text"
          value={targetObject[prop.key] || ''}
          onChange={(e) => handleTextInputChange(e, prop, targetObject)}
        />
      );
    }
    if (prop.type === 'select') {
      const currentValue = value ?? prop.value;
      const valueToSet = typeof currentValue === 'string' && Array.isArray(prop.options)
        ? (prop.options.find((opt) => typeof opt === 'string' && opt.toLowerCase() === currentValue.toLowerCase()) ?? currentValue)
        : currentValue;
      return (
        <select
          className="property-input-field property-input-select"
          value={valueToSet}
          onChange={(e) => handleSelectInputChange(e, prop, targetObject)}
        >
          {(prop.options || []).map((opt) => {
            const optionValue = typeof opt === 'object' && opt.value !== undefined ? opt.value : opt;
            const optionLabel = typeof opt === 'object' && opt.label !== undefined ? opt.label : String(opt);
            return (
              <option key={optionValue} value={optionValue} data-i18n={typeof opt === 'string' ? opt : undefined}>
                {typeof opt === 'string' ? i18n.t(opt) : optionLabel}
              </option>
            );
          })}
        </select>
      );
    }
  }

  if (prop.editable && isGroup && Array.isArray(targetObject)) {
    if (prop.type === 'number') {
      return (
        <input
          type="number"
          className="property-input-field property-input-number"
          placeholder={prop.value === 'varies' ? i18n.t('varies') : undefined}
          value={value ?? ''}
          step={prop.step || '1'}
          onChange={(e) => handleGroupNumericChange(e, prop, targetObject)}
        />
      );
    }
    if (prop.type === 'select') {
      const hasVaries = prop.value === 'varies';
      return (
        <select
          className="property-input-field property-input-select"
          defaultValue={hasVaries ? '' : prop.value}
          onChange={(e) => handleGroupSelectChange(e, prop, targetObject)}
        >
          {hasVaries ? <option value="" disabled data-i18n="varies">{i18n.t('varies')}</option> : null}
          {(prop.options || []).map((opt) => (
            <option key={opt} value={opt} data-i18n={opt}>{i18n.t(opt)}</option>
          ))}
        </select>
      );
    }
  }

  const displayValue = prop.value;
  if (typeof displayValue === 'string' && (prop.label === 'Color' || prop.label === 'Fill Color')) {
    const normalized = displayValue === '#ffffff' ? 'white' : displayValue === '#000000' ? 'black' : displayValue;
    return <span data-i18n={normalized}>{i18n.t(normalized)}</span>;
  }

  const numericValue = parseFloat(displayValue);
  if (!isNaN(numericValue) && typeof displayValue !== 'boolean' && (typeof displayValue === 'number' || (typeof displayValue === 'string' && /^-?\d+(\.\d+)?$/.test(displayValue.trim())))) {
    return <span>{numericValue.toFixed(1)}</span>;
  }

  return typeof displayValue === 'string'
    ? <span data-i18n={displayValue}>{i18n.t(displayValue)}</span>
    : <span>{String(displayValue)}</span>;
}

function PropertyRow({ prop, targetObject, isGroup, value, onValueChange }) {
  return (
    <tr key={`${prop.label}-${prop.key || prop.value}`} className="property-item">
      <td style={{ minWidth: 0, textAlign: 'left', paddingRight: '8px' }}>
        <span data-i18n={prop.label}>{i18n.t(prop.label)}</span>:
      </td>
      <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
        <PropertyFieldInput prop={prop} targetObject={targetObject} isGroup={isGroup} value={value} onValueChange={onValueChange} />
      </td>
    </tr>
  );
}

function PropertySection({ name, props, targetObject, isGroup, values, onValueChange }) {
  if (!props.length) return null;

  return (
    <section className="input-group-container">
      <div className="property-section-title" data-i18n={name}>{i18n.t(name)}</div>
      <table className="property-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          {props.map((prop) => (
            <tr key={`${name}-${prop.label}-${prop.key || prop.value}`} className="property-item">
              <td style={{ minWidth: 0, textAlign: 'left', paddingRight: '8px', overflowWrap: 'anywhere' }}>
                <span data-i18n={prop.label}>{i18n.t(prop.label)}</span>:
              </td>
              <td style={{ textAlign: 'right', whiteSpace: 'normal', overflow: 'hidden' }}>
                {renderInput(prop, targetObject, isGroup)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

function PropertyPanelHeader({ activeObject, onTitleChange, onClose }) {
  const isMulti = Array.isArray(activeObject) && activeObject.length > 1;
  const titleText = !Array.isArray(activeObject)
    ? (activeObject?._showName || activeObject?.type || i18n.t('Object Properties'))
    : null;

  return (
    <>
      <button className="property-close" onClick={onClose} style={{ position: 'absolute', right: '5px', top: '5px', cursor: 'pointer' }}>×</button>
      <div className="property-title">
        {isMulti ? (
          <select className="property-title-select" style={{ maxWidth: '80%' }} value="group" onChange={onTitleChange}>
            <option value="group">{i18n.t('Group')} ({activeObject.length})</option>
            {activeObject.map((obj, idx) => (
              <option key={obj?.canvasID || idx} value={obj?.canvasID != null ? String(obj.canvasID) : `idx:${idx}`}>
                {getObjDisplayName(obj, idx)}
              </option>
            ))}
          </select>
        ) : (
          <span data-i18n={titleText}>{titleText}</span>
        )}
      </div>
    </>
  );
}

export default function PropertyPanel() {
  const [visible, setVisible] = useState(propertyPanelState.isVisible);
  const [activeObject, setActiveObject] = useState(propertyPanelState.activeObject);
  const [inputValues, setInputValues] = useState({});

  useEffect(() => {
    const nextValues = {};
    if (Array.isArray(activeObject)) {
      activeObject.forEach((obj, idx) => {
        if (obj?.canvasID != null) nextValues[`group:${obj.canvasID}`] = obj?.type || idx;
      });
    } else if (activeObject) {
      const model = buildPropertyModel(activeObject);
      model.sections.forEach((section) => {
        section.props.forEach((prop) => {
          const key = prop.key || prop.label;
          if (prop.type === 'number' || prop.type === 'text' || prop.type === 'select') {
            nextValues[key] = prop.value;
          }
        });
      });
    }
    setInputValues(nextValues);

    const interval = setInterval(() => {
      if (visible !== propertyPanelState.isVisible) setVisible(propertyPanelState.isVisible);
      if (activeObject !== propertyPanelState.activeObject) setActiveObject(propertyPanelState.activeObject);
    }, 16);
    return () => clearInterval(interval);
  }, [visible, activeObject]);

  if (!visible) return null;

  const model = buildPropertyModel(activeObject);

  const handleTitleChange = (e) => {
    const v = e.target.value;
    if (!Array.isArray(activeObject)) return;
    if (v === 'group') {
      propertyPanelState.setActiveObject(activeObject);
      setActiveObject(activeObject);
      return;
    }

    const chosen = activeObject.find((o, idx) => String(o.canvasID) === v || `idx:${idx}` === v);
    if (chosen) {
      try {
        if (CanvasGlobals.canvas && CanvasGlobals.canvas.setActiveObject) {
          CanvasGlobals.canvas.discardActiveObject();
          CanvasGlobals.canvas.setActiveObject(chosen);
          CanvasGlobals.canvas.requestRenderAll && CanvasGlobals.canvas.requestRenderAll();
        }
      } catch (_) { }
      propertyPanelState.setActiveObject(chosen);
      setActiveObject(chosen);
    }
  };

  const handleClose = () => {
    propertyPanelState.setActiveObject(null);
    propertyPanelState.setVisible(false);
    setActiveObject(null);
    setVisible(false);
  };

  const handleValueChange = (prop, nextValue) => {
    setInputValues((prev) => ({ ...prev, [prop.key || prop.label]: nextValue }));

    if (Array.isArray(activeObject)) {
      return;
    }

    if (!activeObject) return;

    if (prop.type === 'number') {
      handleNumericInputChange({ target: { value: nextValue } }, prop, activeObject);
    } else if (prop.type === 'text') {
      handleTextInputChange({ target: { value: nextValue } }, prop, activeObject);
    } else if (prop.type === 'select') {
      handleSelectInputChange({ target: { value: nextValue } }, prop, activeObject);
    }
  };

  return (
    <div id="property-panel" className="property-panel-container property-panel-open" style={{ display: 'block' }}>
      <button className="property-close-btn" onClick={handleClose} style={{ position: 'absolute', right: '5px', top: '5px', cursor: 'pointer' }}>×</button>

      <div className="property-panel-title">
        {isMulti ? (
          <select className="property-title-select property-input-field" value="group" onChange={handleTitleChange}>
            <option value="group">{i18n.t('Group')} ({activeObject.length})</option>
            {activeObject.map((obj, idx) => (
              <option key={obj?.canvasID || idx} value={obj?.canvasID != null ? String(obj.canvasID) : `idx:${idx}`}>
                {getObjDisplayName(obj, idx)}
              </option>
            ))}
          </select>
        ) : (
          <span data-i18n={titleText}>{titleText}</span>
        )}
      </div>

      <div className="property-panel-content">
        {model.sections.map((section) => (
          <PropertySection
            key={section.name}
            name={section.name}
            props={section.props}
            targetObject={activeObject}
            isGroup={model.isMultiSelect}
            values={inputValues}
            onValueChange={handleValueChange}
          />
        ))}
      </div>
    </div>
  );
}

export { showPropertyPanel, handleClear };