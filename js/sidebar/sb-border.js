/* Border Panel */
import { GeneralSettings, GeneralHandler } from './sbGeneral.js';
import { CanvasGlobals } from '../canvas/canvas.js';
import { BorderUtilities, BorderGroup } from '../objects/border.js';
import { DividerObject } from '../objects/divider.js';
import { BorderColorScheme, BorderFrameWidth, BorderTypeScheme } from '../objects/template.js';
import { vertexToPath } from '../objects/path.js';
import { selectObjectHandler } from '../canvas/promptBox.js';
import { HintLoader } from '../utils/hintLoader.js';

let FormBorderWrapComponent = {
  BorderPanelInit: function () {
    GeneralHandler.tabNum = 3;
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      // Create a container for border parameters
      var borderParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      GeneralHandler.createInput('input-xHeight', 'x Height', borderParamsContainer, GeneralSettings.xHeight, FormBorderWrapComponent.handleXHeightChange, 'input')

      // Color scheme selection
      GeneralHandler.createSelect('input-color', 'Select Color Scheme', Object.keys(BorderColorScheme), borderParamsContainer, null, FormBorderWrapComponent.handleColorChange, 'change')

      // Create a container for border actions
      var borderActionsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      //GeneralHandler.createButton('input-border', 'Select Objects for border', borderActionsContainer, 'input', FormBorderWrapComponent.BorderCreateHandler, 'click')
      const stackDividerBtn = GeneralHandler.createButton('input-HDivider', 'Add stack border divider', borderActionsContainer, 'input', FormBorderWrapComponent.StackDividerHandler, 'click')
      const gantryDividerBtn = GeneralHandler.createButton('input-VDivider', 'Add gantry border divider', borderActionsContainer, 'input', FormBorderWrapComponent.GantryDividerHandler, 'click')
      const gantryLineBtn = GeneralHandler.createButton('input-HLine', 'Add gantry destination line', borderActionsContainer, 'input', FormBorderWrapComponent.GantryLineHandler, 'click')
      const laneLineBtn = GeneralHandler.createButton('input-VLane', 'Add lane separation line', borderActionsContainer, 'input', FormBorderWrapComponent.LaneLineHandler, 'click')

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
      GeneralHandler.createGeneralButtonTooltip(gantryLineBtn, 'divider/GantryLine', {
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
      const borderTypeHeader = GeneralHandler.createNode("div", { 'class': 'placeholder' }, borderTypeContainer);
      borderTypeHeader.innerHTML = "Select Border Type";
      FormBorderWrapComponent.createBorderButtons()
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
    selectObjectHandler('Select shape to calculate border width,\nor input fix width and then press Enter', function (widthObjects, options, widthText) {
      selectObjectHandler('Select shape to calculate border height,\nor input fix height and then press Enter', function (heightObjects, options, heightText) {
        new BorderGroup({
          borderType: borderType,
          widthObjects: [...widthObjects],
          heightObjects: [...heightObjects],
          fixedWidth: widthText,
          fixedHeight: heightText,
          xHeight: xHeight,
          color: colorType,
          frame: BorderFrameWidth[borderType],
        });
      }, null, xHeight, 'mm');
    }, null, xHeight, 'mm');
  },

  StackDividerHandler: function () {
    const xHeight = parseInt(document.getElementById("input-xHeight").value);
    selectObjectHandler('Select object above divider or type in fixed distance to border top', function (aboveObject, options, aboveValue) {
      selectObjectHandler('Select object below divider or type in fixed distance to border bottom', function (belowObject, options, belowValue) {
        // Pass both objects and entered values to allow for fixed distance options
        const color = document.getElementById('input-color').value;
        const xHeight = parseInt(document.getElementById("input-xHeight").value);
        new DividerObject({ dividerType: 'HDivider', aboveObjects: aboveObject, belowObjects: belowObject, aboveValue: aboveValue, belowValue: belowValue, xHeight: xHeight, colorType: color, });
      }, null, xHeight, 'mm');
    }, null, xHeight, 'mm');
  },

  GantryDividerHandler: function () {
    const xHeight = parseInt(document.getElementById("input-xHeight").value);
    selectObjectHandler('Select object left to divider or type in fixed distance to border left', function (leftObject, options, leftValue) {
      selectObjectHandler('Select object right to divider or type in fixed distance to border right', function (rightObject, options, rightValue) {
        // Pass both objects and entered values to allow for fixed distance options
        const color = document.getElementById('input-color').value;
        const xHeight = parseInt(document.getElementById("input-xHeight").value);
        new DividerObject({ dividerType: 'VDivider', leftObjects: leftObject, rightObjects: rightObject, leftValue: leftValue, rightValue: rightValue, xHeight: xHeight, colorType: color, });
      }, null, xHeight, 'mm');
    }, null, xHeight, 'mm');
  },

  GantryLineHandler: function () {
    const xHeight = parseInt(document.getElementById("input-xHeight").value);
    selectObjectHandler('Select object above divider or type in fixed distance to border top', function (aboveObject, options, aboveValue) {
      selectObjectHandler('Select object below divider or type in fixed distance to border bottom', function (belowObject, options, belowValue) {
        // Pass both objects and entered values to allow for fixed distance options
        const color = document.getElementById('input-color').value;
        const xHeight = parseInt(document.getElementById("input-xHeight").value);
        new DividerObject({ dividerType: 'HLine', aboveObjects: aboveObject, belowObjects: belowObject, aboveValue: aboveValue, belowValue: belowValue, xHeight: xHeight, colorType: color, });
      }, null, xHeight, 'mm');
    }, null, xHeight, 'mm');
  },

  LaneLineHandler: function () {
    const xHeight = parseInt(document.getElementById("input-xHeight").value);
    selectObjectHandler('Select object left to lane or type in fixed distance to border left', function (leftObject, options, leftValue) {
      selectObjectHandler('Select object right to lane or type in fixed distance to border right', function (rightObject, options, rightValue) {
        // Pass both objects and entered values to allow for fixed distance options
        const color = document.getElementById('input-color').value;
        const xHeight = parseInt(document.getElementById("input-xHeight").value);
        new DividerObject({ dividerType: 'VLane', leftObjects: leftObject, rightObjects: rightObject, leftValue: leftValue, rightValue: rightValue, xHeight: xHeight, colorType: color, });
      }, null, xHeight, 'mm');
    }, null, xHeight, 'mm');
  },
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