/* Border Panel */
import { GeneralSettings, GeneralHandler } from './sbGeneral.js';
import { CanvasGlobals } from '../canvas/canvas.js';
import { BorderUtilities, BorderGroup } from '../objects/border.js';
import { DividerObject } from '../objects/divider.js';
import { BorderColorScheme, BorderFrameWidth, BorderTypeScheme } from '../objects/template.js';
import { vertexToPath } from '../objects/path.js';
import { selectObjectHandler, showTextBox, hideTextBox } from '../canvas/promptBox.js';
import { HintLoader } from '../utils/hintLoader.js';
import { i18n } from '../i18n/i18n.js';

let FormBorderWrapComponent = {
  BorderPanelInit: function () {
    GeneralHandler.tabNum = 3;
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      // Create a container for border parameters
      var borderParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      const xHeightInput = GeneralHandler.createInput('input-xHeight', 'x Height', borderParamsContainer, GeneralSettings.xHeight, FormBorderWrapComponent.handleXHeightChange, 'input', 'mm')

      // Attach x-height help icon (TPDM Table 3.2.5.1 guidance)
      try {
        const xhParent = xHeightInput.parentElement && xHeightInput.parentElement.classList.contains('input-wrapper')
          ? xHeightInput.parentElement.parentElement
          : xHeightInput.parentElement || basicParamsContainer;
        if (xhParent) {
          GeneralHandler.createHelpIconWithHint(xhParent, 'text/XHeight', { position: 'right' });
        }
      } catch (e) {
        console.warn('Failed to attach x-height help icon in Border panel:', e);
      }

      // Color scheme selection
  const colorOptions = Object.keys(BorderColorScheme).map(key => ({ value: key, label: key }));
  const colorSelect = GeneralHandler.createSelect('input-color', 'Select Color Scheme', colorOptions, borderParamsContainer, null, FormBorderWrapComponent.handleColorChange, 'change')

      // Attach border color purpose help icon next to the color scheme label
      try {
        const colorParent = colorSelect && colorSelect.parentElement ? colorSelect.parentElement : borderParamsContainer;
        if (colorParent) {
          GeneralHandler.createHelpIconWithHint(colorParent, 'border/ColorPurpose', { position: 'right' });
        }
      } catch (e) {
        console.warn('Failed to attach color purpose help icon in Border panel:', e);
      }

      // (moved) Fixed width/height inputs will be added inside borderTypeContainer for better layout

  // Create a container for border actions
      var borderActionsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
  //GeneralHandler.createButton('input-border', 'Select Border', borderActionsContainer, 'input', FormBorderWrapComponent.BorderCreateHandler, 'click')
  // Use i18n keys that exist in dictionaries
  const stackDividerBtn = GeneralHandler.createButton('input-HDivider', 'Add Stack Divider', borderActionsContainer, 'input', FormBorderWrapComponent.StackDividerHandler, 'click')
  const gantryDividerBtn = GeneralHandler.createButton('input-VDivider', 'Add Gantry Divider', borderActionsContainer, 'input', FormBorderWrapComponent.GantryDividerHandler, 'click')
  //const gantryLineBtn = GeneralHandler.createButton('input-HLine', 'Add Gantry Line', borderActionsContainer, 'input', FormBorderWrapComponent.GantryLineHandler, 'click')
  const laneLineBtn = GeneralHandler.createButton('input-VLane', 'Add Lane Line', borderActionsContainer, 'input', FormBorderWrapComponent.LaneLineHandler, 'click')

      // Add tooltips to divider buttons
      GeneralHandler.createGeneralButtonTooltip(stackDividerBtn, 'divider/StackDivider', {
        position: 'right',
        showDelay: 500,
        hideDelay: 150
      });
      GeneralHandler.createGeneralButtonTooltip(gantryDividerBtn, 'divider/GantryDivider', {
        position: 'right',
        showDelay: 500,
        hideDelay: 150
      });
      GeneralHandler.createGeneralButtonTooltip(laneLineBtn, 'divider/LaneLine', {
        position: 'right',
        showDelay: 500,
        hideDelay: 150
      });

      // Create a container for border type selection with SVG buttons
  var borderTypeContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container', 'id': 'border-select-container' }, parent);
  // i18n-enabled header for border type selection
  GeneralHandler.createI18nNode("div", { 'class': 'placeholder' }, borderTypeContainer, 'Select Border Type', 'text');

      // Fixed width/height inputs inside the border type container, aligned in one row
      try {
        const fixedRow = GeneralHandler.createNode('div', { 'class': 'input-row' }, borderTypeContainer);
        // inline styles to guarantee side-by-side layout without relying on external CSS
        fixedRow.style.display = 'flex';
        fixedRow.style.gap = '0px';
        fixedRow.style.alignItems = 'flex-end';

        const fw = GeneralHandler.createInput('input-fixedWidth', 'Fixed Width', fixedRow, '', null, 'input', '(optional) mm');
        const fh = GeneralHandler.createInput('input-fixedHeight', 'Fixed Height', fixedRow, '', null, 'input', '(optional) mm');
        // Make each input block share the row evenly
        if (fw && fw.parentElement) fw.parentElement.style.flex = '1 1 0';
        if (fh && fh.parentElement) fh.parentElement.style.flex = '1 1 0';

        // Update unit span to remove '(optional)' when a value is present
        const updateUnitSpan = (inputEl) => {
          if (!inputEl || !inputEl.parentElement) return;
          const unitSpan = inputEl.parentElement.querySelector('.input-unit');
          if (!unitSpan) return;
          const hasValue = inputEl.value && inputEl.value.toString().trim() !== '';
          unitSpan.textContent = hasValue ? 'mm' : '(optional) mm';
        };

        if (fw) {
          ['input', 'change', 'blur'].forEach(evt => fw.addEventListener(evt, () => updateUnitSpan(fw)));
          updateUnitSpan(fw);
        }
        if (fh) {
          ['input', 'change', 'blur'].forEach(evt => fh.addEventListener(evt, () => updateUnitSpan(fh)));
          updateUnitSpan(fh);
        }
      } catch (e) {
        console.warn('Failed to attach fixed width/height inputs:', e);
      }
  FormBorderWrapComponent.createBorderButtons()
  // Apply translations for all newly created elements in this panel
  try { i18n.applyTranslations(parent); } catch (_) {}
    }
  },

  // Handle xHeight change and update GeneralSettings
  handleXHeightChange: function (event) {
    const xHeight = parseInt(event.target.value);
    if (!isNaN(xHeight) && xHeight > 0) {
      // Update GeneralSettings
      GeneralSettings.updateSetting('xHeight', xHeight);

      // Redraw the border buttons with the new xHeight
      FormBorderWrapComponent.createBorderButtons();
    }
  },

  // Handle color scheme change
  handleColorChange: function (event) {
    // Redraw the border buttons with the new color scheme
    FormBorderWrapComponent.createBorderButtons();
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
    const bboxExit = {
      left: 0,
      top: 0,
      width: 60,
      height: 100
    };

    // Create SVG buttons for each border type
    Object.keys(BorderTypeScheme).forEach(async (borderType) => {
      const shapeMeta = BorderTypeScheme[borderType](xHeight, borderType == 'exit' ? bboxExit : bbox,);
      const svg = await FormBorderWrapComponent.createBorderSVG(shapeMeta,)
      // Create the button first
      const btn = GeneralHandler.createSVGButton(`button-${borderType}`, svg, parent, 'border', FormBorderWrapComponent.BorderCreateHandler, 'click');

      // Map border types to their hint paths
      const hintMap = {
        panel: 'border/Panel',
        greenPanel: 'border/GreenPanel',
        stack: 'border/StackBorder',
        flagLeft: 'border/FlagBorder',
        flagRight: 'border/FlagBorder',
        exit: 'border/ExitBorder',
      };

      const hintPath = hintMap[borderType];
      if (hintPath) {
        GeneralHandler.createGeneralButtonTooltip(btn, hintPath, {
          position: 'right',
          showDelay: 500,
          hideDelay: 150
        });
      }
    });
  },

  createBorderSVG: async (shapeMeta,) => {
    const colorScheme = document.getElementById('input-color').value;
    const color = BorderColorScheme[colorScheme];
    let pathData = vertexToPath(shapeMeta, color);
    pathData = pathData.replace(/fill="border"/g, `fill="${color.border}"`);
    pathData = pathData.replace(/fill="symbol"/g, `fill="${color.symbol}"`);
    pathData = pathData.replace(/fill="background"/g, `fill="${color.background}"`);

    const svgWidth = 160;
    const svgHeight = 100;

    // Calculate the bounding box of the path  

    const result = await fabric.loadSVGFromString(pathData);
    const GroupedBorder = fabric.util.groupSVGElements(result.objects);
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
    const xHeight = parseInt(document.getElementById("input-xHeight").value);
    const colorType = document.getElementById('input-color').value;

    // Read fixed width/height from sidebar
    const fixedWidthRaw = (document.getElementById('input-fixedWidth')?.value || '').trim();
    const fixedHeightRaw = (document.getElementById('input-fixedHeight')?.value || '').trim();
    const fixedWidth = fixedWidthRaw !== '' ? parseFloat(fixedWidthRaw) : null;
    const fixedHeight = fixedHeightRaw !== '' ? parseFloat(fixedHeightRaw) : null;

    const createBorder = (widthObjects = [], heightObjects = []) => {
      new BorderGroup({
        borderType: borderType,
        widthObjects: [...widthObjects],
        // heightObjects kept for legacy; mirror widthObjects if empty
        heightObjects: (heightObjects && heightObjects.length) ? [...heightObjects] : [...widthObjects],
        fixedWidth: fixedWidth,
        fixedHeight: fixedHeight,
        xHeight: xHeight,
        color: colorType,
        frame: BorderFrameWidth[borderType],
      });
    };

    // If both fixed values provided, skip object selection entirely
    if (fixedWidth !== null && !isNaN(fixedWidth) && fixedHeight !== null && !isNaN(fixedHeight)) {
      createBorder();
      return;
    }

    // New behavior: we only need one containment selection for both width and height.
    const needAnySelection = !(fixedWidth !== null && !isNaN(fixedWidth) && fixedHeight !== null && !isNaN(fixedHeight));
    if (needAnySelection) {
      selectObjectHandler('Select shape(s) to contain inside the border', function (objects) {
        createBorder(objects, objects);
      }, null, xHeight, 'mm');
      return;
    }

    // Fallback: both fixed provided
    createBorder();
  },

  StackDividerHandler: function () {
    FormBorderWrapComponent.startDividerHoverMode('HDivider');
  },

  GantryDividerHandler: function () {
    FormBorderWrapComponent.startDividerHoverMode('VDivider');
  },

  GantryLineHandler: function () {
    FormBorderWrapComponent.startDividerHoverMode('HLine');
  },

  LaneLineHandler: function () {
    FormBorderWrapComponent.startDividerHoverMode('VLane');
  },

  // Start hover mode: user hovers a border to show compartments, then clicks to place divider
  startDividerHoverMode: function (dividerType) {
    // End any existing mode first
    FormBorderWrapComponent._exitDividerPlacementMode(true);
    const canvas = CanvasGlobals.canvas;
    FormBorderWrapComponent._dividerPlacementMode = { active: true, dividerType };
    // Instruction prompt (ESC to cancel)
    showTextBox('Click inside the border to place divider', null, 'keydown', (e) => {
      if (e.key === 'Escape') {
        FormBorderWrapComponent._exitDividerPlacementMode();
      }
    });

    // Hover handler to detect border under pointer (no overlay)
    FormBorderWrapComponent._dividerPlacementHoverHandler = function (opt) {
      if (!FormBorderWrapComponent._dividerPlacementMode?.active) return;
      const target = opt.target;
      if (target && target.functionalType === 'Border') {
        FormBorderWrapComponent._hoveredBorder = target;
        // Show or update a subtle hover overlay over the border's inner area
        FormBorderWrapComponent._showBorderHoverOverlay(target);
      } else {
        FormBorderWrapComponent._hoveredBorder = null;
        FormBorderWrapComponent._removeBorderHoverOverlay();
      }
    };
    canvas.on('mouse:move', FormBorderWrapComponent._dividerPlacementHoverHandler);

    // Click to place divider inside the border under pointer
    FormBorderWrapComponent._dividerPlacementClickHandler = function (opt) {
      if (!FormBorderWrapComponent._dividerPlacementMode?.active) return;
      const target = opt.target;
      const border = (target && target.functionalType === 'Border') ? target : FormBorderWrapComponent._hoveredBorder;
      if (!border) return;
      border.updateBboxes();
      const pointer = canvas.getPointer(opt.e);
      const bbox = border.inbbox;
      const color = document.getElementById('input-color').value;
      // Pass the border inner bbox to the divider
      const dividerOptions = { dividerType, borderGroup: border, xHeight: border.xHeight, colorType: color, compartmentBox: bbox };
      const divider = new DividerObject(dividerOptions);
      // Position divider near click point, will be clamped by assignWidthToDivider
      if (dividerType === 'HDivider' || dividerType === 'HLine') {
        divider.set({ top: pointer.y - divider.height / 2 });
        border.HDivider.push(divider)
      } else {
        divider.set({ left: pointer.x - divider.width / 2 });
        border.VDivider.push(divider)
      }
      divider.setCoords();
      // Clamp based on border inbbox using standard sizing logic
      if (border && typeof border.assignWidthToDivider === 'function') {
        border.assignWidthToDivider();
      }
      canvas.requestRenderAll();
      FormBorderWrapComponent._exitDividerPlacementMode();
    };
    canvas.on('mouse:down', FormBorderWrapComponent._dividerPlacementClickHandler);
  },

  _showCompartmentOverlay: function (border, dividerType) {
    const canvas = CanvasGlobals.canvas;
    // Remove existing overlay if any
    if (FormBorderWrapComponent._compartmentOverlay) {
      FormBorderWrapComponent._removeCompartmentOverlay();
    }
    const overlays = [];
    const majorColor = 'rgba(0,150,255,0.25)';
    const dimColor = 'rgba(0,150,255,0.08)';
    const strokeColor = 'rgba(0,150,255,0.5)';
    const zoom = canvas.getZoom ? canvas.getZoom() : 1;
    const strokeWidth = 1 / zoom;

    const onMouseMove = (opt) => {
      const pointer = canvas.getPointer(opt.e);
      overlays.forEach(o => {
        const b = o._metaBox;
        const inside = pointer.x >= b.left && pointer.x <= b.right && pointer.y >= b.top && pointer.y <= b.bottom;
        o.set('fill', inside ? majorColor : dimColor);
      });
      canvas.requestRenderAll();
    };

    const color = document.getElementById('input-color').value;

    const onClick = (opt) => {
      const pointer = canvas.getPointer(opt.e);
      let chosen = null;
      overlays.forEach(o => {
        const b = o._metaBox;
        if (pointer.x >= b.left && pointer.x <= b.right && pointer.y >= b.top && pointer.y <= b.bottom) {
          chosen = b;
        }
      });
      if (chosen) {
        // Remove overlay first
        FormBorderWrapComponent._removeCompartmentOverlay();
        // Capture the compartment dimensions (width/height limits) so the divider can clamp within this compartment
        const compartmentBox = {
          left: chosen.left,
          top: chosen.top,
          width: chosen.right - chosen.left,
          height: chosen.bottom - chosen.top,
          right: chosen.right,
          bottom: chosen.bottom
        };
        // Determine compartment order indices
        const columns = [...new Set(border.compartmentBboxes.map(b => b.left))].sort((a, b) => a - b);
        const rows = [...new Set(border.compartmentBboxes.map(b => b.top))].sort((a, b) => a - b);
        const compartmentColumn = columns.indexOf(chosen.left);
        const compartmentRow = rows.indexOf(chosen.top);
        const dividerOptions = { dividerType: dividerType, borderGroup: border, xHeight: border.xHeight, colorType: color, compartmentBox, compartmentColumn, compartmentRow };
        const divider = new DividerObject(dividerOptions);
        // Position divider roughly at compartment center initially
        const centerX = (chosen.left + chosen.right) / 2;
        const centerY = (chosen.top + chosen.bottom) / 2;
        if (dividerType === 'HDivider' || dividerType === 'HLine') {
          divider.set({ top: centerY - divider.height / 2 });
        } else {
          divider.set({ left: centerX - divider.width / 2 });
        }
        divider.setCoords();
        canvas.requestRenderAll();
        // Exit placement mode after successful placement
        FormBorderWrapComponent._exitDividerPlacementMode();
      }
    };

    border.compartmentBboxes.forEach((b, idx) => {
      const rect = new fabric.Rect({
        left: b.left,
        top: b.top,
        width: b.right - b.left,
        height: b.bottom - b.top,
        fill: dimColor,
        stroke: strokeColor,
        strokeWidth: strokeWidth,
        selectable: false,
        evented: false,
        objectCaching: false
      });
      rect._metaBox = b;
      overlays.push(rect);
      canvas.add(rect);
    });

    FormBorderWrapComponent._compartmentOverlay = { overlays, border, onMouseMove, onClick };
    canvas.on('mouse:move', onMouseMove);
    canvas.on('mouse:down', onClick);
    canvas.requestRenderAll();
  },

  _showBorderHoverOverlay: function (border) {
    const canvas = CanvasGlobals.canvas;
    // Remove any existing overlay first
    if (FormBorderWrapComponent._borderHoverOverlay) {
      FormBorderWrapComponent._removeBorderHoverOverlay();
    }
    // Ensure latest inbbox
    if (!border.inbbox) {
      border.updateBboxes();
    }
    const bbox = border.inbbox;
    const zoom = canvas.getZoom ? canvas.getZoom() : 1;
    const rect = new fabric.Rect({
      left: bbox.left,
      top: bbox.top,
      width: bbox.right - bbox.left,
      height: bbox.bottom - bbox.top,
      fill: 'rgba(238, 255, 0, 0.6)',
      stroke: 'rgba(0,150,255,0.35)',
      strokeWidth: 1 / zoom,
      selectable: false,
      evented: false,
      objectCaching: false
    });
    FormBorderWrapComponent._borderHoverOverlay = { rect, border };
    canvas.add(rect);
    canvas.requestRenderAll();
  },

  _removeBorderHoverOverlay: function () {
    const canvas = CanvasGlobals.canvas;
    const overlay = FormBorderWrapComponent._borderHoverOverlay;
    if (!overlay) return;
    canvas.remove(overlay.rect);
    FormBorderWrapComponent._borderHoverOverlay = null;
    canvas.requestRenderAll();
  },

  _removeCompartmentOverlay: function () {
    const canvas = CanvasGlobals.canvas;
    const overlay = FormBorderWrapComponent._compartmentOverlay;
    if (!overlay) return;
    overlay.overlays.forEach(o => canvas.remove(o));
    canvas.off('mouse:move', overlay.onMouseMove);
    canvas.off('mouse:down', overlay.onClick);
    FormBorderWrapComponent._compartmentOverlay = null;
    canvas.requestRenderAll();
  },

  _exitDividerPlacementMode: function (silent = false) {
    const canvas = CanvasGlobals.canvas;
    if (FormBorderWrapComponent._dividerPlacementHoverHandler) {
      canvas.off('mouse:move', FormBorderWrapComponent._dividerPlacementHoverHandler);
      FormBorderWrapComponent._dividerPlacementHoverHandler = null;
    }
    if (FormBorderWrapComponent._dividerPlacementClickHandler) {
      canvas.off('mouse:down', FormBorderWrapComponent._dividerPlacementClickHandler);
      FormBorderWrapComponent._dividerPlacementClickHandler = null;
    }
    if (FormBorderWrapComponent._borderHoverOverlay) {
      FormBorderWrapComponent._removeBorderHoverOverlay();
    }
    if (FormBorderWrapComponent._compartmentOverlay) {
      FormBorderWrapComponent._removeCompartmentOverlay();
    }
    if (!silent) {
      hideTextBox();
    }
    FormBorderWrapComponent._dividerPlacementMode = null;
  }
}

// Add listener for GeneralSettings changes
GeneralSettings.addListener(function (setting, value) {
  // Only update UI if we're in the Border panel
  if (GeneralHandler.tabNum === 3) {
    if (setting === 'xHeight') {
      const xHeightInput = document.getElementById('input-xHeight');
      if (xHeightInput && xHeightInput.value !== value.toString()) {
        xHeightInput.value = value;

        // Redraw border buttons with new xHeight
        FormBorderWrapComponent.createBorderButtons();
      }
    }
    // Note: We don't need to handle messageColor changes here as border uses its own color scheme
  }
});


export { FormBorderWrapComponent };