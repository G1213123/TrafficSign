/* Border Panel */
import { GeneralSettings, GeneralHandler } from './sbGeneral.js';
import { CanvasGlobals } from '../canvas.js';

let FormBorderWrapComponent = {
  BorderPanelInit: function () {
    GeneralHandler.tabNum = 3
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
      GeneralHandler.createButton('input-HDivider', 'Add stack border divider', borderActionsContainer, 'input', FormBorderWrapComponent.StackDividerHandler, 'click')
      GeneralHandler.createButton('input-VDivider', 'Add gantry border divider', borderActionsContainer, 'input', FormBorderWrapComponent.GantryDividerHandler, 'click')
      GeneralHandler.createButton('input-HLine', 'Add gantry destination line', borderActionsContainer, 'input', FormBorderWrapComponent.GantryLineHandler, 'click')
      GeneralHandler.createButton('input-VLane', 'Add lane separation line', borderActionsContainer, 'input', FormBorderWrapComponent.LaneLineHandler, 'click')

      // Create a container for border type selection with SVG buttons
      var borderTypeContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container', 'id': 'border-select-container' }, parent);
      const borderTypeHeader = GeneralHandler.createNode("div", { 'class': 'placeholder' }, borderTypeContainer);
      borderTypeHeader.innerHTML = "Select Border Type";
      FormBorderWrapComponent.createBorderButtons()
    }
  },

  // Handle xHeight change and update GeneralSettings
  handleXHeightChange: function(event) {
    const xHeight = parseInt(event.target.value);
    if (!isNaN(xHeight) && xHeight > 0) {
      // Update GeneralSettings
      GeneralSettings.updateSetting('xHeight', xHeight);
      
      // Redraw the border buttons with the new xHeight
      FormBorderWrapComponent.createBorderButtons();
    }
  },
  
  // Handle color scheme change
  handleColorChange: function(event) {
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
      const shapeMeta = BorderTypeScheme[borderType](xHeight, borderType=='exit'?bboxExit:bbox,);
      const svg = await FormBorderWrapComponent.createBorderSVG(shapeMeta,)
      GeneralHandler.createSVGButton(`button-${borderType}`, svg, parent, 'border', FormBorderWrapComponent.BorderCreateHandler, 'click')
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
    selectObjectHandler('Select shape to calculate border width', function (widthObjects, options, widthText) {
      selectObjectHandler('Select shape to calculate border height', function (heightObjects, options, heightText) {
        BorderUtilities.BorderGroupCreate(borderType, heightObjects, widthObjects, widthText, heightText, {
          xHeight: xHeight,
          colorType: document.getElementById('input-color').value
        })
      }, null, xHeight);
    }, null, xHeight);
  },

  StackDividerHandler: function () {
    selectObjectHandler('Select object above divider or type in fixed distance to border top', function (aboveObject, options, aboveValue) {
      selectObjectHandler('Select object below divider or type in fixed distance to border bottom', function (belowObject, options, belowValue) {
        // Pass both objects and entered values to allow for fixed distance options
        HDividerCreate(aboveObject, belowObject, aboveValue, belowValue)
      })
    })
  },

  GantryDividerHandler: function () {
    selectObjectHandler('Select object left to divider or type in fixed distance to border left', function (leftObject, options, leftValue) {
      selectObjectHandler('Select object right to divider or type in fixed distance to border right', function (rightObject, options, rightValue) {
        // Pass both objects and entered values to allow for fixed distance options
        VDividerCreate(leftObject, rightObject, leftValue, rightValue)
      })
    })
  },

  GantryLineHandler: function () {
    selectObjectHandler('Select object above divider or type in fixed distance to border top', function (aboveObject, options, aboveValue) {
      selectObjectHandler('Select object below divider or type in fixed distance to border bottom', function (belowObject, options, belowValue) {
        // Pass both objects and entered values to allow for fixed distance options
        HLineCreate(aboveObject, belowObject, aboveValue, belowValue)
      })
    })
  },

  LaneLineHandler: function () {
    selectObjectHandler('Select object left to lane or type in fixed distance to border left', function (leftObject, options, leftValue) {
      selectObjectHandler('Select object right to lane or type in fixed distance to border right', function (rightObject, options, rightValue) {
        // Pass both objects and entered values to allow for fixed distance options
        VLaneCreate(leftObject, rightObject, leftValue, rightValue)
      })
    })
  },
}

// Add listener for GeneralSettings changes
GeneralSettings.addListener(function(setting, value) {
  // Only update UI if we're in the Border panel
  if (tabNum === 3) {
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

/* Draw Border Panel */
let FormDrawBorderAddComponent = {
  borderTypes: ['Rectangle', 'Circle', 'Ellipse', 'Polygon', 'Triangle'],
  newBorderObject: null,

  /**
   * Initializes the draw border panel with input fields and buttons
   * @param {Event} event - The triggering event object
   * @return {void}
   */
  drawBorderPanelInit: function (event) {
    tabNum = 3
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      // Create a container for basic parameters using the shared function
      GeneralHandler.createBasicParamsContainer(parent, FormDrawBorderAddComponent);

      // Create a container for border type selection
      const borderTypeContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      
      // Create border type toggle
      GeneralHandler.createToggle('Border Type', FormDrawBorderAddComponent.borderTypes, borderTypeContainer, 
        FormDrawBorderAddComponent.borderTypes[0], FormDrawBorderAddComponent.handleBorderTypeChange);
      
      // Create a container for border-specific parameters
      const borderParamsContainer = GeneralHandler.createNode("div", { 'class': 'border-params-container' }, parent);
      FormDrawBorderAddComponent.updateBorderParamsUI('Rectangle', borderParamsContainer);
    }
  },

  /**
   * Updates the UI for border parameters based on selected border type
   * @param {string} borderType - The selected border type
   * @param {HTMLElement} container - The container for border parameters
   */
  updateBorderParamsUI: function(borderType, container) {
    // Clear existing content
    container.innerHTML = '';
    
    // Show parameters based on border type
    if (borderType === 'Rectangle' || borderType === 'Circle' || borderType === 'Ellipse') {
      // Width and Height inputs for Rectangle and Ellipse
      if (borderType === 'Rectangle' || borderType === 'Ellipse') {
        GeneralHandler.createInput('border-width', 'Width', container, '100', FormDrawBorderAddComponent.handleBorderParamsChange, 'input');
        GeneralHandler.createInput('border-height', 'Height', container, '60', FormDrawBorderAddComponent.handleBorderParamsChange, 'input');
      } 
      // Radius input for Circle
      else if (borderType === 'Circle') {
        GeneralHandler.createInput('border-radius', 'Radius', container, '50', FormDrawBorderAddComponent.handleBorderParamsChange, 'input');
      }
      
      // Common parameters
      GeneralHandler.createInput('border-stroke-width', 'Stroke Width', container, '2', FormDrawBorderAddComponent.handleBorderParamsChange, 'input');
      
      // Create Draw button
      GeneralHandler.createButton('draw-border', `Draw ${borderType}`, container, 'action', 
        FormDrawBorderAddComponent.createBorderObject, 'click');
    } 
    // Polygon requires vertex count
    else if (borderType === 'Polygon') {
      GeneralHandler.createInput('polygon-sides', 'Number of Sides', container, '6', FormDrawBorderAddComponent.handleBorderParamsChange, 'input');
      GeneralHandler.createInput('polygon-radius', 'Radius', container, '50', FormDrawBorderAddComponent.handleBorderParamsChange, 'input');
      GeneralHandler.createInput('border-stroke-width', 'Stroke Width', container, '2', FormDrawBorderAddComponent.handleBorderParamsChange, 'input');
      
      // Create Draw button
      GeneralHandler.createButton('draw-polygon', 'Draw Polygon', container, 'action', 
        FormDrawBorderAddComponent.createBorderObject, 'click');
    }
    // Triangle is a special case
    else if (borderType === 'Triangle') {
      GeneralHandler.createInput('triangle-size', 'Size', container, '80', FormDrawBorderAddComponent.handleBorderParamsChange, 'input');
      GeneralHandler.createInput('border-stroke-width', 'Stroke Width', container, '2', FormDrawBorderAddComponent.handleBorderParamsChange, 'input');
      
      // Create Draw button
      GeneralHandler.createButton('draw-triangle', 'Draw Triangle', container, 'action', 
        FormDrawBorderAddComponent.createBorderObject, 'click');
    }
  },

  /**
   * Handles border type change
   * @param {Event} event - The change event
   */
  handleBorderTypeChange: function(event) {
    const selectedType = event.getAttribute('data-value');
    const container = document.querySelector('.border-params-container');
    if (container) {
      FormDrawBorderAddComponent.updateBorderParamsUI(selectedType, container);
    }
  },

  /**
   * Handles border parameter changes
   * @param {Event} event - The input event
   */
  handleBorderParamsChange: function(event) {
    // Handle parameter changes if needed
    // For example, update preview or real-time feedback
  },

  /**
   * Creates a border object based on selected type and parameters
   */
  createBorderObject: function() {
    // Clean up any existing temporary object
    if (FormDrawBorderAddComponent.newBorderObject) {
      CanvasGlobals.canvas.remove(FormDrawBorderAddComponent.newBorderObject);
      FormDrawBorderAddComponent.newBorderObject = null;
    }

    // Get border parameters
    const borderType = GeneralHandler.getToggleValue('Border Type-container');
    const xHeight = parseInt(document.getElementById('input-xHeight').value);
    const color = document.getElementById('Message Colour-container').selected.getAttribute('data-value').toLowerCase();
    const strokeWidth = parseInt(document.getElementById('border-stroke-width')?.value || '2');
    
    // Get border dimensions based on type
    let width, height, radius, sides;
    
    if (borderType === 'Rectangle' || borderType === 'Ellipse') {
      width = parseInt(document.getElementById('border-width').value);
      height = parseInt(document.getElementById('border-height').value);
    } else if (borderType === 'Circle') {
      radius = parseInt(document.getElementById('border-radius').value);
    } else if (borderType === 'Polygon') {
      sides = parseInt(document.getElementById('polygon-sides').value);
      radius = parseInt(document.getElementById('polygon-radius').value);
    } else if (borderType === 'Triangle') {
      width = parseInt(document.getElementById('triangle-size').value);
      height = width * 0.866; // Equilateral triangle height
    }
    
    // Create object based on type
    let borderObject;
    
    // Account for any panning that has been done
    const vpt = CenterCoord();
    const actualCenterX = vpt.x;
    const actualCenterY = vpt.y;
    
    // Create the border object based on type
    switch (borderType) {
      case 'Rectangle':
        borderObject = new BorderObject({
          type: 'rect',
          width: width,
          height: height,
          stroke: color,
          strokeWidth: strokeWidth,
          fill: 'transparent',
          left: actualCenterX,
          top: actualCenterY
        });
        break;
        
      case 'Circle':
        borderObject = new BorderObject({
          type: 'circle',
          radius: radius,
          stroke: color,
          strokeWidth: strokeWidth,
          fill: 'transparent',
          left: actualCenterX,
          top: actualCenterY
        });
        break;
        
      case 'Ellipse':
        borderObject = new BorderObject({
          type: 'ellipse',
          rx: width / 2,
          ry: height / 2,
          stroke: color,
          strokeWidth: strokeWidth,
          fill: 'transparent',
          left: actualCenterX,
          top: actualCenterY
        });
        break;
        
      case 'Polygon':
        const points = [];
        for (let i = 0; i < sides; i++) {
          const angle = (i * 2 * Math.PI) / sides;
          points.push({
            x: radius * Math.cos(angle),
            y: radius * Math.sin(angle)
          });
        }
        
        borderObject = new BorderObject({
          type: 'polygon',
          points: points,
          stroke: color,
          strokeWidth: strokeWidth,
          fill: 'transparent',
          left: actualCenterX,
          top: actualCenterY
        });
        break;
        
      case 'Triangle':
        const trianglePoints = [
          { x: 0, y: -height / 2 },
          { x: width / 2, y: height / 2 },
          { x: -width / 2, y: height / 2 }
        ];
        
        borderObject = new BorderObject({
          type: 'polygon', // Triangle is just a special polygon
          points: trianglePoints,
          stroke: color,
          strokeWidth: strokeWidth,
          fill: 'transparent',
          left: actualCenterX,
          top: actualCenterY
        });
        break;
    }
    
    // Store reference and set as temporary
    if (borderObject) {
      FormDrawBorderAddComponent.newBorderObject = borderObject;
      borderObject.isTemporary = true;
      
      // Add mouse event handlers for placement
      CanvasGlobals.canvas.on('mouse:move', FormDrawBorderAddComponent.BorderOnMouseMove);
      CanvasGlobals.canvas.on('mouse:down', FormDrawBorderAddComponent.BorderOnMouseClick);
      
      // Set up escape key handler
      document.removeEventListener('keydown', ShowHideSideBarEvent);
      document.addEventListener('keydown', FormDrawBorderAddComponent.cancelBorderDraw);
      
      // Activate the vertex control immediately to enable dragging and snapping
      if (borderObject.controls && borderObject.controls.V1) {
        window.activeVertex = borderObject.controls.V1;
        window.activeVertex.isDown = true;
        window.activeVertex.originalPosition = {
          left: borderObject.left,
          top: borderObject.top
        };
        
        // Store vertex information if available
        const v1 = borderObject.getBasePolygonVertex ? borderObject.getBasePolygonVertex('V1') : null;
        if (v1) {
          window.activeVertex.vertexOriginalPosition = {
            x: v1.x,
            y: v1.y
          };
          window.activeVertex.vertexOffset = {
            x: v1.x - borderObject.left,
            y: v1.y - borderObject.top
          };
          
          // Create indicator for the active vertex
          if (window.activeVertex.createIndicator) {
            window.activeVertex.createIndicator(v1.x, v1.y);
          }
        }
      }
    }
  },

  BorderOnMouseMove: function (event) {
    // Use shared mouse move handler
    GeneralHandler.handleObjectOnMouseMove(FormDrawBorderAddComponent, event);
  },

  BorderOnMouseClick: function (event) {
    if (event.e.button !== 0) return;
    
    // Use shared mouse click handler
    if (FormDrawBorderAddComponent.newBorderObject) {
      GeneralHandler.handleObjectOnMouseClick(
        FormDrawBorderAddComponent,
        event,
        'newBorderObject',
        'BorderOnMouseMove',
        'BorderOnMouseClick',
        'cancelBorderDraw'
      );
      
      return;
    }
  },

  cancelBorderDraw: function (event) {
    // Use shared escape key handler
    GeneralHandler.handleCancelWithEscape(
      FormDrawBorderAddComponent, 
      event, 
      'newBorderObject', 
      'BorderOnMouseMove', 
      'BorderOnMouseClick'
    );
  },

  /**
   * Clean up resources when switching away from the border panel
   */
  BorderHandlerOff: function() {
    // Use shared handler for cleanup
    GeneralHandler.genericHandlerOff(
      FormDrawBorderAddComponent,
      'newBorderObject',
      'BorderOnMouseMove',
      'BorderOnMouseClick',
      'cancelBorderDraw'
    );
  }
};

// Use the shared settings listener implementation
GeneralSettings.addListener(
  GeneralHandler.createSettingsListener(3, function(setting, value) {
    // Border-specific updates when settings change
    if (FormDrawBorderAddComponent.newBorderObject) {
      if (setting === 'messageColor') {
        FormDrawBorderAddComponent.newBorderObject.set('stroke', value.toLowerCase());
        CanvasGlobals.canvas.renderAll();
      }
    }
  })
);

export { FormBorderWrapComponent };