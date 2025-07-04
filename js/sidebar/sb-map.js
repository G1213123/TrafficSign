/* Draw Map Panel */
import { GeneralSettings, GeneralHandler } from './sbGeneral.js';
import { CanvasGlobals } from '../canvas/canvas.js';
import { MainRoadSymbol, SideRoadSymbol, calcVertexType } from '../objects/route.js';
import { roadMapTemplate } from '../objects/template.js';

// Import the calculateMainRoadBottomY function
import { calculateMainRoadBottomY } from '../objects/route.js';

const canvas = CanvasGlobals.canvas;
const canvasObject = CanvasGlobals.canvasObject;

let FormDrawMapComponent = {
  MapType: ['Main Line', 'Conventional Roundabout', 'Spiral Roundabout',],
  MainEndShape: ['Arrow', 'Stub', 'RedBar', 'LaneDrop', 'T-Junction', 'Y-Junction'],
  SideEndShape: ['Arrow', 'Stub','RedBar'],
  RoundaboutFeatures: ['Normal', 'Auxiliary', 'U-turn'],
  permitAngle: [45, 60, 90],
  defaultRoute: [{ x: 0, y: 7, angle: 60, width: 4, shape: 'Arrow' }],
  newMapObject: null,

  /**
   * Initializes the map drawing panel with input fields and buttons
   * @return {void}
   */
  drawMapPanelInit: function () {
    GeneralHandler.tabNum = 4
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      parent.routeCount = 0
      // Create a container for basic parameters using the shared function
      GeneralHandler.createBasicParamsContainer(parent, FormDrawMapComponent);

      // Create a container for route parameters
      var MainRoadParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      
      // Create the toggle
      const roadTypeToggle = GeneralHandler.createToggle('Main Road Type', FormDrawMapComponent.MapType, MainRoadParamsContainer, 'Main Line', FormDrawMapComponent.updateRoadTypeSettings);

      // Create a container for road type-specific settings
      const roadTypeSettingsContainer = GeneralHandler.createNode("div", { 'class': 'road-type-settings' }, MainRoadParamsContainer);

      // Initial setup of settings based on default selection
      FormDrawMapComponent.updateRoadTypeSettings(roadTypeSettingsContainer);

      // Create the Draw Map button
      const drawMapButton = GeneralHandler.createButton('button-DrawMap', 'Draw Main Road Symbol', MainRoadParamsContainer, 'input', FormDrawMapComponent.gatherMainRoadParams, 'click');

      const existingRoute = CanvasGlobals.canvas.getActiveObjects().length == 1 && CanvasGlobals.canvas.getActiveObject.functionalType == 'MainRoute' ? CanvasGlobals.canvas.getActiveObjects()[0] : null
      const routeList = existingRoute ? existingRoute.routeList : FormDrawMapComponent.defaultRoute

      if (routeList) {
        routeList.forEach((route, index) => {
          var SideRoadParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
          const addRouteButton = GeneralHandler.createButton('button-addRoute', '+ Another Route Destination', SideRoadParamsContainer, 'input', FormDrawMapComponent.addRouteInput, 'click');
          if (CanvasGlobals.canvas.getActiveObjects().length == 0 || CanvasGlobals.canvas.getActiveObject.functionalType !== 'MainRoad') {
            addRouteButton.classList.add('deactive'); // Set initial state to deactive
            addRouteButton.disabled = true;
          }
          GeneralHandler.createInput(`Side Road width`, `Side Road Width`, SideRoadParamsContainer, 4, null, 'input', 'sw')
          GeneralHandler.createToggle(`Side Road Shape`, FormDrawMapComponent.SideEndShape, SideRoadParamsContainer, route.shape, null)

          var angleContainer = GeneralHandler.createNode("div", { 'class': 'angle-picker-container' }, SideRoadParamsContainer);
          GeneralHandler.createButton(`rotate-left`, '<i class="fa-solid fa-rotate-left"></i>', angleContainer, null, FormDrawMapComponent.setAngle, 'click')
          var angleDisplay = GeneralHandler.createNode("div", { 'id': `angle-display`, 'class': 'angle-display' }, angleContainer);
          angleDisplay.innerText = route.angle + '°';
          parent.routeCount += 1
        })
      }
    }
  },

  // Function to show the appropriate settings based on selected road type
  updateRoadTypeSettings: function () {
    // Clear current settings
    const roadTypeSettingsContainer = document.querySelector('.road-type-settings');
    roadTypeSettingsContainer.innerHTML = '';

    // Get selected road type
    const roadType = GeneralHandler.getToggleValue('Main Road Type-container');

    // Show settings based on road type
    if (roadType === 'Main Line') {
      // Main Line settings
      const mainRoadShapeToggle = GeneralHandler.createToggle(`Main Road Shape`, FormDrawMapComponent.MainEndShape, roadTypeSettingsContainer, 'Arrow', FormDrawMapComponent.onMainRoadShapeChange, 3);
      
      // Add help icon with SVG content to Main Road Shape toggle
      setTimeout(() => {
        try {
          const toggleInputContainer = mainRoadShapeToggle.parentElement;
          if (toggleInputContainer) {
            const label = toggleInputContainer.querySelector('.placeholder');
            if (label) {
              // Create content with SVG image
              const mainRoadShapeHelpContent = {
                'Arrow': '<img src="images/main-road-shape-tooltip.svg" alt="Main Road Shape Guide" style="width: 300px; height: auto; display: block;">',
                'Stub': '<img src="images/main-road-shape-tooltip.svg" alt="Main Road Shape Guide" style="width: 300px; height: auto; display: block;">',
                'RedBar': '<img src="images/main-road-shape-tooltip.svg" alt="Main Road Shape Guide" style="width: 300px; height: auto; display: block;">',
                'LaneDrop': '<img src="images/main-road-shape-tooltip.svg" alt="Main Road Shape Guide" style="width: 300px; height: auto; display: block;">',
                'T-Junction': '<img src="images/main-road-shape-tooltip.svg" alt="Main Road Shape Guide" style="width: 300px; height: auto; display: block;">',
                'Y-Junction': '<img src="images/main-road-shape-tooltip.svg" alt="Main Road Shape Guide" style="width: 300px; height: auto; display: block;">'
              };
              
              const helpIcon = GeneralHandler.createHelpIconWithTooltip(
                label, // Add to the label directly to be inline
                'Main Road Shape-container', 
                mainRoadShapeHelpContent,
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
          console.error('Error adding help icon to Main Road Shape:', error);
        }
      }, 50); // Small delay to ensure DOM is ready
      
      GeneralHandler.createInput('main-width', 'Main Road Width', roadTypeSettingsContainer, 6, FormDrawMapComponent.drawMainRoadOnCursor, 'input', 'sw');
      GeneralHandler.createInput('root-length', 'Main Road Approach Length', roadTypeSettingsContainer, 7, FormDrawMapComponent.drawMainRoadOnCursor, 'input', 'sw');
      GeneralHandler.createInput('tip-length', 'Main Road Exit Length', roadTypeSettingsContainer, 12, FormDrawMapComponent.drawMainRoadOnCursor, 'input', 'sw');
      
      // Corner radius inputs container - initially hidden
      const cornerRadiusContainer = GeneralHandler.createNode("div", { 'class': 'corner-radius-container', 'style': 'display: none;' }, roadTypeSettingsContainer);
      GeneralHandler.createInput('inner-corner-radius', 'Inner Corner Radius', cornerRadiusContainer, 1, FormDrawMapComponent.drawMainRoadOnCursor, 'input', 'sw');
      GeneralHandler.createInput('outer-corner-radius', 'Outer Corner Radius', cornerRadiusContainer, 4, FormDrawMapComponent.drawMainRoadOnCursor, 'input', 'sw');

      // Add angle selector for main road using same structure as side road
      var mainAngleContainer = GeneralHandler.createNode("div", { 'class': 'angle-picker-container' }, roadTypeSettingsContainer);
      GeneralHandler.createButton(`rotate-left`, '<i class="fa-solid fa-rotate-left"></i>', mainAngleContainer, null, FormDrawMapComponent.setMainAngle, 'click');
      var mainAngleDisplay = GeneralHandler.createNode("div", { 'id': `main-angle-display`, 'class': 'angle-display' }, mainAngleContainer);
      mainAngleDisplay.innerText = '0°';
      GeneralHandler.createButton(`rotate-right`, '<i class="fa-solid fa-rotate-right"></i>', mainAngleContainer, null, FormDrawMapComponent.setMainAngle, 'click');

      // Initial check for corner radius visibility (default is Arrow, so hide them)
      setTimeout(() => {
        FormDrawMapComponent.onMainRoadShapeChange();
      }, 100);

    } else if (roadType === 'Conventional Roundabout') {
      // Placeholder for Conventional Roundabout settings
      GeneralHandler.createToggle(`Roundabout Type`, FormDrawMapComponent.RoundaboutFeatures, roadTypeSettingsContainer, 'Normal', FormDrawMapComponent.drawMainRoadOnCursor);
    } else if (roadType === 'Spiral Roundabout') {
      // Placeholder for Spiral Roundabout settings
      GeneralHandler.createToggle(`Roundabout Type`, FormDrawMapComponent.RoundaboutFeatures, roadTypeSettingsContainer, 'Normal', FormDrawMapComponent.drawMainRoadOnCursor);
    }
  },

  // Function to handle Main Road Shape changes
  onMainRoadShapeChange: function() {
    // Get the selected shape
    const selectedShape = GeneralHandler.getToggleValue('Main Road Shape-container');
    
    // Find the corner radius container
    const cornerRadiusContainer = document.querySelector('.corner-radius-container');
    
    if (cornerRadiusContainer) {
      // Show corner radius inputs only for LaneDrop shape
      if (selectedShape === 'LaneDrop') {
        cornerRadiusContainer.style.display = 'block';
      } else {
        cornerRadiusContainer.style.display = 'none';
      }
    }
    
    // Call the original drawing function
    FormDrawMapComponent.drawMainRoadOnCursor();
  },

  gatherMainRoadParams: function () {
    const xHeight = parseInt(document.getElementById('input-xHeight').value);
    const color = document.getElementById('Message Colour-container').selected.getAttribute('data-value');
    const roadType = GeneralHandler.getToggleValue('Main Road Type-container');

    const rootLengthElement = document.getElementById('root-length');
    const tipLengthElement = document.getElementById('tip-length');
    const mainWidthElement = document.getElementById('main-width');
    const innerCornerRadiusElement = document.getElementById('inner-corner-radius');
    const outerCornerRadiusElement = document.getElementById('outer-corner-radius');
    const mainRoadShapeContainer = document.getElementById('Main Road Shape-container');
    const roundaboutFeaturesContainer = document.getElementById('Roundabout Type-container');
    const mainAngleDisplayElement = document.getElementById('main-angle-display');

    const rootLength = rootLengthElement ? parseInt(rootLengthElement.value) : null;
    const tipLength = tipLengthElement ? parseInt(tipLengthElement.value) : null;
    const mainWidth = mainWidthElement ? parseInt(mainWidthElement.value) : null;
    const endShape = mainRoadShapeContainer ? GeneralHandler.getToggleValue('Main Road Shape-container') : null;
    
    // Only get radius values if LaneDrop is selected and inputs exist
    let innerCornerRadius = null;
    let outerCornerRadius = null;
    if (endShape === 'LaneDrop') {
      innerCornerRadius = innerCornerRadiusElement ? parseFloat(innerCornerRadiusElement.value) : null;
      outerCornerRadius = outerCornerRadiusElement ? parseFloat(outerCornerRadiusElement.value) : null;
    }
    
    const roundaboutFeatures = roundaboutFeaturesContainer ? GeneralHandler.getToggleValue('Roundabout Type-container') : null;
    const mainAngle = mainAngleDisplayElement ? parseInt(mainAngleDisplayElement.innerText.slice(0, -1)) : 0;

    const mainRoadParams = {
      xHeight: xHeight,
      color: color.toLowerCase(),
      roadType: roadType,
      rootLength: rootLength,
      tipLength: tipLength,
      mainWidth: mainWidth,
      innerCornerRadius: innerCornerRadius,
      outerCornerRadius: outerCornerRadius,
      shape: endShape,
      width: mainWidth,
      RAfeature: roundaboutFeatures,
      mainAngle: mainAngle
    };

    // Use the updated function that uses the general snapping functionality
    FormDrawMapComponent.drawMainRoadOnCursor(null, mainRoadParams);
  },

  /**
   * Adds new route inputs to the panel based on active object's route list
   * @param {Event} event - The triggering event object
   * @return {void} 
   */
  addRouteInput: function (event) {
    const existingRoute = CanvasGlobals.canvas.getActiveObject();
    if (existingRoute && existingRoute.functionalType === 'MainRoad') {
      // Get parameters from DOM
      const xHeight = parseInt(document.getElementById('input-xHeight').value);
      const color = document.getElementById('Message Colour-container').selected.getAttribute('data-value');
      const angle = parseInt(document.getElementById('angle-display').innerText);
      const width = parseInt(document.getElementById('Side Road width').value);
      const shape = GeneralHandler.getToggleValue('Side Road Shape-container');

      FormDrawMapComponent.drawSideRoadOnCursor(null);
    }
  },

  /**
   * Sets angle for route based on button clicks
   * @param {Event} event - Click event
   * @return {void}
   */
  setAngle: function (event) {
    // Find the parent container element
    const parentContainer = event.currentTarget.parentNode;
    // Find the angle display element within the same container
    const angleDisplay = parentContainer.querySelector('[id^="angle-display"]');
    // Extract the current angle value
    const currentText = angleDisplay.innerText.slice(0, -1); // Remove the degree symbol

    const angleIndex = FormDrawMapComponent.permitAngle.indexOf(parseInt(currentText))
    angleDisplay.innerText = FormDrawMapComponent.permitAngle[(angleIndex + 1) % FormDrawMapComponent.permitAngle.length] + '°';

    // If we have a side road object being placed, update its angle
    if (FormDrawMapComponent.newMapObject && FormDrawMapComponent.newMapObject.functionalType === 'SideRoad') {
      const newAngle = FormDrawMapComponent.permitAngle[(angleIndex + 1) % FormDrawMapComponent.permitAngle.length];

      // Update the object's angle - will be applied during mouse move
      if (FormDrawMapComponent.newMapObject.routeList && FormDrawMapComponent.newMapObject.routeList.length > 0) {
        const side = FormDrawMapComponent.newMapObject.side;
        FormDrawMapComponent.newMapObject.routeList[0].angle = side ? -Math.abs(newAngle) : Math.abs(newAngle);

        // Force an update
        if (CanvasGlobals.activeVertex && CanvasGlobals.activeVertex.handleMouseMoveRef) {
          // Get current pointer
          const pointer = CanvasGlobals.canvas.getPointer({ e: window.event });
          CanvasGlobals.activeVertex.handleMouseMoveRef({
            e: window.event,
            pointer: pointer
          });
        }
      }
    }
  },

  /**
   * Sets angle for main road based on button clicks
   * @param {Event} event - Click event
   * @return {void}
   */
  setMainAngle: function (event) {
    // Find the parent container element
    const parentContainer = event.currentTarget.parentNode;
    // Find the angle display element within the same container
    const angleDisplay = document.getElementById('main-angle-display');

    // Check if angleDisplay exists
    if (!angleDisplay) {
      console.error('Main angle display element not found');
      return;
    }

    // Extract the current angle value
    const currentText = angleDisplay.innerText.slice(0, -1); // Remove the degree symbol

    // Define allowed angles for main road (can be different from side road angles)
    const mainRoadAngles = [-90, -60, -45, -30, 0, 30, 45, 60, 90];
    const angleIndex = mainRoadAngles.indexOf(parseInt(currentText));

    // Determine if this is a left (counter-clockwise) or right (clockwise) button
    const isLeftButton = event.currentTarget.id.includes('rotate-left');
    const isRightButton = event.currentTarget.id.includes('rotate-right');

    let newAngle;
    if (isLeftButton) {
      // Counter-clockwise: go to previous angle (or wrap to last)
      newAngle = angleIndex > 0 ? mainRoadAngles[angleIndex - 1] : mainRoadAngles[mainRoadAngles.length - 1];
    } else if (isRightButton) {
      // Clockwise: go to next angle (or wrap to first)
      newAngle = angleIndex < mainRoadAngles.length - 1 ? mainRoadAngles[angleIndex + 1] : mainRoadAngles[0];
    } else {
      // Fallback to old behavior (clockwise)
      newAngle = mainRoadAngles[(angleIndex + 1) % mainRoadAngles.length];
    }

    angleDisplay.innerText = newAngle + '°';

    // If we have a main road object being placed, update its angle
    if (FormDrawMapComponent.newMapObject && FormDrawMapComponent.newMapObject.functionalType === 'MainRoad') {
      // Update the object's angle - will be applied during mouse move
      FormDrawMapComponent.newMapObject.mainAngle = newAngle;

      // Force an update if the object is being drawn
      if (CanvasGlobals.activeVertex && CanvasGlobals.activeVertex.handleMouseMoveRef) {
        // Get current pointer
        const pointer = CanvasGlobals.canvas.getPointer({ e: window.event });
        CanvasGlobals.activeVertex.handleMouseMoveRef({
          e: window.event,
          pointer: pointer
        });
      }
    }
  },


  /**
   * Draws new route cursor on canvas for initial placement
   * @param {Event} event - The triggering event object
   * @param {Object} params - Optional parameters for testing
   * @return {void}
   */
  drawMainRoadOnCursor: function (event, params = null) {
    // Remove existing event listeners first to avoid duplicates
    FormDrawMapComponent.drawRoadsHandlerOff();

    canvas.discardActiveObject();
    document.removeEventListener('keydown', CanvasGlobals.Show);
    document.addEventListener('keydown', FormDrawMapComponent.cancelDraw);

    // Get parameters either from DOM elements or provided params
    let xHeight, rootLength, tipLength, color, width, shape, roadType, RAfeature, mainAngle, innerCornerRadius, outerCornerRadius;

    if (params) {
      xHeight = params.xHeight || 100;
      rootLength = params.rootLength;
      tipLength = params.tipLength;
      color = params.color || 'white';
      width = params.width || 6;
      shape = params.shape || 'Arrow';
      roadType = params.roadType || 'Main Line';
      RAfeature = params.RAfeature || 'Normal';
      mainAngle = params.mainAngle || 0;
      innerCornerRadius = params.innerCornerRadius || null;
      outerCornerRadius = params.outerCornerRadius || null;
    } else {
      return;
    }
    // Determine which vertex to use as the active vertex for tracking
    // For roundabouts, use C1 (center) vertex, otherwise use V1
    const activeVertexLabel = (roadType === 'Conventional Roundabout' || roadType === 'Spiral Roundabout') ? 'C1' : 'V1';

    // Use the general object creation with snapping function
    GeneralHandler.createObjectWithSnapping(
      {
        position: {
          x: event ? canvas.getPointer(event.e).x : canvas.width / 2,
          y: event ? canvas.getPointer(event.e).y : canvas.height / 2
        },
        xHeight: xHeight,
        color: color.toLowerCase(),
        rootLength: rootLength,
        tipLength: tipLength,
        width: width,
        shape: shape,
        roadType: roadType,
        RAfeature: RAfeature,
        mainAngle: mainAngle,
        innerCornerRadius: innerCornerRadius,
        outerCornerRadius: outerCornerRadius
      },
      FormDrawMapComponent.createMainRoadObject,
      FormDrawMapComponent, // Pass the component to store the created object
      'newMapObject',
      activeVertexLabel,
      FormDrawMapComponent.mainRoadOnMouseMove,
      FormDrawMapComponent.finishDrawMainRoad,
      FormDrawMapComponent.cancelDraw
    );


  },

  // Create a function that returns a new MainRoadSymbol
  createMainRoadObject: (options) => {
    let tipLength = options.tipLength
    let rootLength = options.rootLength
    // Calculate position based on angle
    let mainAngle = options.mainAngle;
    if (options.shape === 'T-Junction') {
      mainAngle = -90;
    } else if (options.shape === 'Y-Junction') {
      mainAngle = -30;
    } else if (options.shape === 'LaneDrop'){
      mainAngle = -60
      tipLength = 18.45
      rootLength = 12
    }
    const angleRad = mainAngle * Math.PI / 180;
    let addRootwidth
    switch (Math.sign(mainAngle)) {
      case 0:
        addRootwidth = 0
        break
      case 1:
        addRootwidth = -options.width / 2 * options.xHeight / 4;
        break
      case -1:
        addRootwidth = options.width / 2 * options.xHeight / 4;
        break
    }

    // Create initial route list with tip and preliminary bottom
    const routeList = [
      // tip
      {
        x: options.position.x,
        y: options.position.y,
        angle: mainAngle,
        width: options.shape == 'Y-Junction' ? options.width / 3 * 2 : options.width,
        length: tipLength,
        shape: options.roadType == 'Main Line' ? options.shape : options.RAfeature
      },
      // bottom (preliminary position, will be corrected)
      {
        x: options.position.x - Math.sin(angleRad) * tipLength * options.xHeight / 4 + addRootwidth,
        y: options.position.y + (Math.cos(angleRad) * tipLength + (options.width / 2 * (1 - Math.cos(angleRad)) + options.rootLength)) * options.xHeight / 4,
        angle: 180,
        width: options.width,
        length: options.rootLength,
        shape: options.roadType == 'Main Line' ? 'Stub' : options.RAfeature
      },
    ];

    if (options.shape === 'T-Junction' || options.shape === 'Y-Junction') {
      routeList.push({
        x: options.position.x - 2 * Math.sin(angleRad) * tipLength * options.xHeight / 4 + addRootwidth * 2,
        y: options.position.y,
        angle: -mainAngle,
        width: options.shape == 'Y-Junction' ? options.width / 3 * 2 : options.width,
        length: options.tipLength,
        shape: options.shape
      });
    }

    // Use the extracted function to calculate the correct bottom Y coordinate
    if (options.roadType === 'Main Line') {
      const topRoute = routeList[0];
      const bottomRoute = routeList[1];
      const length = options.xHeight / 4;
      bottomRoute.y = calculateMainRoadBottomY(topRoute, bottomRoute, length);
    }

    // Create route options for the MainRoadSymbol
    const routeOptions = {
      routeList: routeList,
      xHeight: options.xHeight,
      color: options.color,
      rootLength: options.rootLength,
      tipLength: options.tipLength,
      routeWidth: options.width,
      roadType: options.roadType,
      RAfeature: options.RAfeature,
      mainAngle: mainAngle,
      innerCornerRadius: options.innerCornerRadius,
      outerCornerRadius: options.outerCornerRadius
    };

    // Create and initialize the MainRoadSymbol
    const routeMap = new MainRoadSymbol(routeOptions);
    //routeMap.initialize(calcVertexType[options.roadType](options.xHeight, routeList));

    return routeMap;
  },

  /**
  * Handle mouse movement for road symbol placement
  * @param {Event} event - Mouse event
  */
  mainRoadOnMouseMove: function (event) {
    if (!FormDrawMapComponent.newMapObject) return;

    const mainRoad = FormDrawMapComponent.newMapObject;
    if (mainRoad.functionalType !== 'MainRoad') return;

    const pointer = CanvasGlobals.canvas.getPointer(event.e);

    // If we have an active vertex, handle the vertex-based movement
    if (CanvasGlobals.activeVertex && CanvasGlobals.activeVertex.handleMouseMoveRef) {
      // Store the original position of the object for delta calculation
      const originalLeft = mainRoad.left;
      const originalTop = mainRoad.top;

      // Let the vertex handle its movement
      const simulatedEvent = {
        e: event.e,
        pointer: pointer
      };
      CanvasGlobals.activeVertex.handleMouseMoveRef(simulatedEvent);


    } else {
      // Direct positioning for the whole object - THIS PART IS CRITICAL
      // Update the position of the entire object to follow the cursor
      mainRoad.set({
        left: pointer.x,
        top: pointer.y
      });

      // Update the routeList coordinates to match the new position
      // For initial placement, we need to recreate routeList at the new position
      if (mainRoad.routeList && mainRoad.routeList.length >= 2) {
        if (mainRoad.roadType === 'Conventional Roundabout' || mainRoad.roadType === 'Spiral Roundabout') {
          // For roundabout, use the center point (routeList[1])
          mainRoad.routeList[1].x = pointer.x;
          mainRoad.routeList[1].y = pointer.y;

          // Position the root point relative to center
          mainRoad.routeList[0].x = pointer.x;
          mainRoad.routeList[0].y = pointer.y;
        } else {
          // For main line, position the top and bottom points based on cursor
          mainRoad.routeList[1].x = pointer.x; // Top point (tip)
          mainRoad.routeList[1].y = pointer.y;

          // Position the bottom point (root)
          mainRoad.routeList[0].x = pointer.x;
          mainRoad.routeList[0].y = pointer.y + (mainRoad.rootLength + mainRoad.tipLength) * mainRoad.xHeight / 4;
        }
      }

      // Recalculate the vertices based on updated routeList
      const vertexList = calcVertexType[mainRoad.roadType](mainRoad.xHeight, mainRoad.routeList, mainRoad.innerCornerRadius, mainRoad.outerCornerRadius);
      if (mainRoad.basePolygon) {
        mainRoad.basePolygon.vertex = vertexList.path[0].vertex;
        mainRoad.basePolygon.path = vertexList.path;
      }

      // Update any side roads if they exist
      if (mainRoad.sideRoad && mainRoad.sideRoad.length > 0) {
        mainRoad.sideRoad.forEach(side => {
          side.onMove(null, true);
        });
      }
    }

    // Update coordinates and render
    mainRoad.setCoords();
    mainRoad.drawVertex();
    canvas.renderAll();
  },

  /**
  * Handles mouse click to place main road on canvas
  * @param {Event} event - Mouse event
  * @param {Object} options - Optional parameters
  * @return {Promise<void>}
  */
  finishDrawMainRoad: function (event, options = null) {
    if (event.e.button !== 0 && event.e.type !== 'touchend') return;

    // Use shared mouse click handler for new text objects
    if (FormDrawMapComponent.newMapObject) {
      GeneralHandler.handleObjectOnMouseClick(
        FormDrawMapComponent,
        event,
        'newMapObject',
        'mainRoadOnMouseMove',
        'finishDrawMainRoad',
        'cancelDraw',
      );

      return;
    }


  },

  /**
  * Draws side road cursor for adding routes to existing root
  * @param {Event} event - Mouse event
  * @param {Object} option - Optional parameters for testing
  * @return {void}
  */
  drawSideRoadOnCursor: function (event, option = null) {
    document.removeEventListener('keydown', CanvasGlobals.Show);
    document.addEventListener('keydown', FormDrawMapComponent.cancelDraw);

    const mainRoad = canvas.getActiveObject();
    if (!mainRoad || mainRoad.functionalType !== 'MainRoad') return;

    // Clear any existing temp side road
    if (FormDrawMapComponent.newMapObject) {
      // If there's already a temp side road, remove it
      const existingSideRoad = FormDrawMapComponent.newMapObject;
      if (existingSideRoad.functionalType === 'SideRoad') {
        existingSideRoad.deleteObject && existingSideRoad.deleteObject();
        FormDrawMapComponent.newMapObject = null;
      }
    }

    // Declare variables outside the if-else blocks 
    let routeList = [];
    let angle, shape, width, pointer, isSideLeft;

    if (option) {
      // Handle direct parameter input for testing
      if (option.routeList) {
        // Direct route list provided
        routeList = option.routeList;
        angle = option.angle;
      } else {
        // Parameters for creating a route list
        pointer = { x: option.x, y: option.y };
        angle = option.routeParams.angle;
        shape = option.routeParams.shape;
        width = option.routeParams.width;

        // Create route list with parameters
        isSideLeft = pointer.x < mainRoad.left + mainRoad.width / 2;
        if (isSideLeft) {
          angle = -Math.abs(angle); // Make angle negative for left side
        } else {
          angle = Math.abs(angle);  // Make angle positive for right side
        }

        routeList.push({
          x: pointer.x,
          y: pointer.y,
          angle: angle,
          shape: shape,
          width: width,
        });
        mainRoad.tempRootList = JSON.parse(JSON.stringify(routeList));
      }
    } else {
      // Normal DOM operation
      pointer = {
        x: event ? CanvasGlobals.canvas.getPointer(event.e).x : mainRoad.left - 10 * mainRoad.xHeight / 4,
        y: event ? CanvasGlobals.canvas.getPointer(event.e).y : mainRoad.top
      };
      // Check if pointer is within the main road bounds
      if (mainRoad.roadType == 'Main Line') {
        if (pointer.x > mainRoad.getEffectiveCoords()[0].x && pointer.x < mainRoad.getEffectiveCoords()[1].x) {
          return;
        }
      } else if (mainRoad.roadType == 'Conventional Roundabout' || mainRoad.roadType == 'Spiral Roundabout') {
        const center = mainRoad.routeList[1];
        if ((pointer.x - center.x) ** 2 + (pointer.y - center.y) ** 2 < (mainRoad.xHeight * 3) ** 2) {
          //return;
        }
      }

      angle = parseInt(document.getElementById(`angle-display`).innerText);
      isSideLeft = pointer.x < mainRoad.left + mainRoad.width / 2;
      if (isSideLeft) {
        angle = -angle;
      }

      shape = mainRoad.roadType == 'Spiral Roundabout' ? 'Spiral Arrow' : GeneralHandler.getToggleValue('Side Road Shape-container');
      width = document.getElementById(`Side Road width`).value;
      routeList.push({ x: pointer.x, y: pointer.y, angle: angle, shape: shape, width: width, });
      mainRoad.tempRootList = JSON.parse(JSON.stringify(routeList));
    }

    // Use the general object creation with snapping function
    GeneralHandler.createObjectWithSnapping(
      {
        position: {
          x: pointer.x,
          y: pointer.y
        },
        angle: angle,
        shape: shape,
        width: width,
        mainRoad: mainRoad,
        isSideLeft: isSideLeft,
      },
      FormDrawMapComponent.createSideRoadObject,
      FormDrawMapComponent,
      'newMapObject',
      'V1',
      FormDrawMapComponent.sideRoadOnMouseMove,
      FormDrawMapComponent.finishDrawSideRoad,
      FormDrawMapComponent.cancelDraw
    );


  },

  // Create a function that returns a new SideRoadSymbol
  createSideRoadObject: function (options) {
    // Create the route list for the side road
    const routeList = [{
      x: options.position.x,
      y: options.position.y,
      angle: options.angle,
      shape: options.shape || (mainRoad.roadType == 'Spiral Roundabout' ? 'Spiral Arrow' : 'Arrow'),
      width: options.width || 4
    }];

    const mainRoad = options.mainRoad;

    // Create the branch options
    const branchOptions = {
      routeList: routeList,
      xHeight: mainRoad.xHeight,
      color: mainRoad.color,
      mainRoad: mainRoad,
      side: options.isSideLeft,
      branchIndex: mainRoad.sideRoad.length + 1
    };

    // Create and initialize the side road
    const sideRoad = new SideRoadSymbol(branchOptions);

    return sideRoad;
  },

  sideRoadOnMouseMove: function (event) {
    GeneralHandler.handleObjectOnMouseMove(FormDrawMapComponent, event);
  },


  /**
  * Handle mouse movement for side road placement
  * @param {Event} event - Mouse event
  */
  LEGACY_sideRoadOnMouseMove: function (event) {

    const sideRoad = FormDrawMapComponent.newMapObject;
    if (sideRoad.functionalType !== 'SideRoad') return;

    const mainRoad = sideRoad.mainRoad;
    if (!mainRoad) return;

    const pointer = CanvasGlobals.canvas.getPointer(event.e);

    // If we have an active vertex, handle the vertex-based movement
    if (CanvasGlobals.activeVertex.handleMouseMoveRef) {
      // Let the vertex handle its movement first
      const simulatedEvent = {
        e: event.e,
        pointer: pointer
      };
      CanvasGlobals.activeVertex.handleMouseMoveRef(simulatedEvent);

      // Find the V1 vertex which corresponds to routeList[0]
      let v1Vertex = sideRoad.basePolygon.vertex.find(v => v.label === 'V1');

      // Calculate offset between active vertex and V1
      // If the active vertex is V1, then no offset is needed
      let offsetX = 0;
      let offsetY = 0;

      if (CanvasGlobals.activeVertex.label !== 'V1' && v1Vertex) {
        // Calculate where V1 should be based on the active vertex movement
        const activeVertexObj = sideRoad.basePolygon.vertex.find(v => v.label === CanvasGlobals.activeVertex.label);
        if (activeVertexObj) {
          offsetX = v1Vertex.x - activeVertexObj.x;
          offsetY = v1Vertex.y - activeVertexObj.y;
        }
      }

      // Apply the calculated offset to get the correct position for routeList[0]
      sideRoad.routeList[0].x = pointer.x + offsetX;
      sideRoad.routeList[0].y = pointer.y + offsetY;

      // Check which side of the main road we're on now and update side property
      const isSideLeft = pointer.x < mainRoad.left + mainRoad.width / 2;

      // Update the side property if it changed
      if (sideRoad.side !== isSideLeft) {
        // Flip the angle sign when switching sides
        const currentAngle = Math.abs(sideRoad.routeList[0].angle);
        sideRoad.routeList[0].angle = isSideLeft ? -currentAngle : currentAngle;

        // Update the side property
        sideRoad.side = isSideLeft;
      }

      // Apply constraints based on the current pointer position
      const constrainedResult = applySideRoadConstraints(
        sideRoad,
        mainRoad,
        sideRoad.routeList,
        sideRoad.side,
        mainRoad.xHeight
      );

      // Update with constrained position
      sideRoad.routeList = constrainedResult.routeList;

      // In some cases we need to recreate the vertex list
      if (constrainedResult.tempVertexList) {
        // Replace the base polygon vertices with the constrained vertex list
        sideRoad.basePolygon.vertex = constrainedResult.tempVertexList.path[0].vertex;
        sideRoad.basePolygon.path = constrainedResult.tempVertexList.path;
      }
    } else {
      // When no vertex is active, we do direct coordinate updates
      // Calculate where the side road should be based on pointer

      // Update the route coordinate with pointer position
      sideRoad.routeList[0].x = pointer.x;
      sideRoad.routeList[0].y = pointer.y;

      // Apply constraints based on main road type
      const isSideLeft = pointer.x < mainRoad.left + mainRoad.width / 2;
      sideRoad.side = isSideLeft; // Update the side property

      // Update angle based on side
      const currentAngle = Math.abs(sideRoad.routeList[0].angle);
      sideRoad.routeList[0].angle = isSideLeft ? -currentAngle : currentAngle;

      // Apply constraints to position
      const constrainedResult = applySideRoadConstraints(
        sideRoad,
        mainRoad,
        sideRoad.routeList,
        isSideLeft,
        mainRoad.xHeight
      );

      // Update with constrained position
      sideRoad.routeList = constrainedResult.routeList;

      // Set position directly based on constrained result
      if (constrainedResult.tempVertexList) {
        // Calculate proper position for the side road
        const bbox = calculateBoundingBox(constrainedResult.tempVertexList.path[0].vertex);
        sideRoad.left = bbox.left;
        sideRoad.top = bbox.top;

        // Replace the base polygon vertices with the constrained vertex list
        sideRoad.basePolygon.vertex = constrainedResult.tempVertexList.path[0].vertex;
        sideRoad.basePolygon.path = constrainedResult.tempVertexList.path;
      }
    }
    // Update the main road with the side road
    try {
      mainRoad.receiveNewRoute(sideRoad.basePolygon);
    } catch (error) {
      console.error("Error updating main road:", error);
    }

    // Update coordinates
    sideRoad.setCoords();
    sideRoad.drawVertex();
    mainRoad.setCoords();

    canvas.renderAll();
  },



  /**
  * Completes side road drawing and anchors to root
  * @param {Event} event - Mouse event
  * @return {void}
  */
  finishDrawSideRoad: function (event) {
    if (event.e.button !== 0 && event.e.type !== 'touchend') return;

    const sideRoad = FormDrawMapComponent.newMapObject;
    const mainRoad = FormDrawMapComponent.newMapObject?.mainRoad;
    // Use shared mouse click handler for new text objects
    GeneralHandler.handleObjectOnMouseClick(
      FormDrawMapComponent,
      event,
      'newMapObject',
      'sideRoadOnMouseMove',
      'finishDrawSideRoad',
      'cancelDraw',
    );

  },

  /**
  * Cleans up route drawing handlers
  * @param {Event} event - Optional event object
  * @return {void}
  */
  drawRoadsHandlerOff: function (event) {
    // If there's a new road object being placed, remove it unless it's been added to canvas properly
    if (FormDrawMapComponent.newMapObject) {
      const newRoad = FormDrawMapComponent.newMapObject;

      // If it's a side road and not fully added to a main road, remove it
      if (newRoad.functionalType === 'SideRoad' && newRoad.mainRoad) {
        const mainRoad = newRoad.mainRoad;

        // Check if this side road is already part of the main road's side roads
        const isAdded = mainRoad.sideRoad.includes(newRoad);

        if (!isAdded) {
          // Update the main road as if the side road wasn't placed
          mainRoad.receiveNewRoute();
          mainRoad.setCoords();

          // Remove the temporary side road from canvas explicitly
          canvas.remove(newRoad);
          // Then delete the object
          newRoad.deleteObject && newRoad.deleteObject();
        }
      } else if (newRoad.functionalType === 'MainRoad' && !canvasObject.includes(newRoad)) {
        // If it's a main road that hasn't been properly added to canvas
        newRoad.deleteObject && newRoad.deleteObject();
      }

      FormDrawMapComponent.newMapObject = null;
    }

    // Clean up active vertex if there is one
    if (CanvasGlobals.activeVertex) {
      if (CanvasGlobals.activeVertex.indicator) {
        CanvasGlobals.canvas.remove(CanvasGlobals.activeVertex.indicator);
      }
      CanvasGlobals.activeVertex.cleanupDrag && CanvasGlobals.activeVertex.cleanupDrag();
      CanvasGlobals.activeVertex = null;
    }

    canvas.off('mouse:move', FormDrawMapComponent.mainRoadOnMouseMove);
    canvas.off('mouse:move', FormDrawMapComponent.sideRoadOnMouseMove);
    canvas.off('mouse:down', FormDrawMapComponent.finishDrawSideRoad);
    canvas.off('mouse:down', FormDrawMapComponent.finishDrawMainRoad);
    canvas.off('mouse:move', FormDrawMapComponent.drawSideRoadOnCursor);
    document.removeEventListener('keydown', FormDrawMapComponent.cancelDraw);
    document.addEventListener('keydown', FormDrawMapComponent.ShowHideSideBarEvent);

    // Force a final render to clean up any visual artifacts
    canvas.renderAll();
  },

  /**
  * Cancels route drawing on escape key
  * @param {Event} event - Keyboard event
  * @param {boolean} force - Force cancel flag
  * @return {void}
  */
  cancelDraw: function (event, force = false) {
    // Use shared escape key handler
    if (event.key === 'Escape') {
      if (FormDrawMapComponent.newMapObject) {
        const newRoad = FormDrawMapComponent.newMapObject;
        // If it's a side road, remove it from the main road's side roads
        if (newRoad.functionalType === 'SideRoad' && newRoad.mainRoad) {
          const mainRoad = newRoad.mainRoad;

          // Check if this side road is already part of the main road's side roads
          const isAdded = mainRoad.sideRoad.includes(newRoad);

          if (isAdded) {
            // Update the main road as if the side road wasn't placed
            mainRoad.sideRoad = mainRoad.sideRoad.filter(side => side !== newRoad);
            mainRoad.receiveNewRoute();
            mainRoad.setCoords();

            // Remove the temporary side road from canvas explicitly
            GeneralHandler.handleCancelWithEscape(
              FormDrawMapComponent,
              event,
              'newMapObject',
              'sideRoadOnMouseMove',
              'finishDrawSideRoad',
            );

            // Symbol-specific cleanup
            // TODO: FormDrawMapComponent.hideAngleControls();
          }
        }
        else if (newRoad.functionalType === 'MainRoad') {
          GeneralHandler.handleCancelWithEscape(
            FormDrawMapComponent,
            event,
            'newMapObject',
            'mainRoadOnMouseMove',
            'finishDrawMainRoad',
          );
        }
      }
    }
  },
}

// Use the shared settings listener implementation
GeneralSettings.addListener(
  GeneralHandler.createSettingsListener(4, function (setting, value) {
    // Map-specific updates when settings change
    if (FormDrawMapComponent.newMapObject || FormDrawMapComponent.newMapObject) {
      const targetObject = FormDrawMapComponent.newMapObject || FormDrawMapComponent.newMapObject;

      // Handle map object updates when settings change
      if (setting === 'xHeight' && targetObject.xHeight !== undefined) {
        targetObject.xHeight = value;

        // Recreate or update the object as needed
        if (targetObject.functionalType === 'MainRoad' || targetObject.functionalType === 'SideRoad') {
          // Update existing parent object
          if (targetObject.mainRoad) {
            targetObject.mainRoad.receiveNewRoute();
          } else {
            // This is a main road - recreate vertex list
            const vertexList = calcVertexType[targetObject.roadType](value, targetObject.routeList, targetObject.innerCornerRadius, targetObject.outerCornerRadius);
            targetObject.replaceBasePolygon && targetObject.replaceBasePolygon(vertexList);
          }
        }

        CanvasGlobals.canvas.renderAll();
      } else if (setting === 'messageColor' && targetObject.color !== undefined) {
        targetObject.color = value.toLowerCase();

        // Update the object's color
        if (targetObject.basePolygon) {
          targetObject.basePolygon.set('fill', value.toLowerCase());
        }

        CanvasGlobals.canvas.renderAll();
      }
    }
  })
);

export { FormDrawMapComponent };