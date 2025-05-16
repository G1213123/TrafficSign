/* Draw Map Panel */
import { GeneralSettings, GeneralHandler } from './sbGeneral.js';
import { CanvasGlobals } from '../canvas/canvas.js';
import { MainRoadSymbol, SideRoadSymbol, } from '../objects/route.js';

let FormDrawMapComponent = {
  MapType: ['Main Line', 'Conventional Roundabout', 'Spiral Roundabout',],
  EndShape: ['Arrow', 'Stub'],
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
      GeneralHandler.createToggle('Main Road Type', FormDrawMapComponent.MapType, MainRoadParamsContainer, 'Main Line', FormDrawMapComponent.updateRoadTypeSettings);

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
          if (CanvasGlobals.canvas.getActiveObjects().length == 1 && CanvasGlobals.canvas.getActiveObject.functionalType === 'MainRoad') {
            addRouteButton.classList.add('deactive'); // Set initial state to deactive
            addRouteButton.disabled = true;
          }
          GeneralHandler.createInput(`Side Road width`, `Side Road Width`, SideRoadParamsContainer, 4, null, 'input', 'sw')
          GeneralHandler.createToggle(`Side Road Shape`, FormDrawMapComponent.EndShape, SideRoadParamsContainer, route.shape, null)

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
      GeneralHandler.createInput('root-length', 'Main Road Root Length', roadTypeSettingsContainer, 7, drawMainRoadOnCursor, 'input', 'sw');
      GeneralHandler.createInput('tip-length', 'Main Road Tip Length', roadTypeSettingsContainer, 12, drawMainRoadOnCursor, 'input', 'sw');
      GeneralHandler.createInput('main-width', 'Main Road Width', roadTypeSettingsContainer, 6, drawMainRoadOnCursor, 'input', 'sw');
      GeneralHandler.createToggle(`Main Road Shape`, FormDrawMapComponent.EndShape, roadTypeSettingsContainer, 'Arrow', drawMainRoadOnCursor);
    } else if (roadType === 'Conventional Roundabout') {
      // Placeholder for Conventional Roundabout settings
      GeneralHandler.createToggle(`Roundabout Type`, FormDrawMapComponent.RoundaboutFeatures, roadTypeSettingsContainer, 'Normal', drawMainRoadOnCursor);
    } else if (roadType === 'Spiral Roundabout') {
      // Placeholder for Spiral Roundabout settings
      GeneralHandler.createToggle(`Roundabout Type`, FormDrawMapComponent.RoundaboutFeatures, roadTypeSettingsContainer, 'Normal', drawMainRoadOnCursor);
    }
  },

  gatherMainRoadParams: function () {
    const xHeight = parseInt(document.getElementById('input-xHeight').value);
    const color = document.getElementById('Message Colour-container').selected.getAttribute('data-value');
    const roadType = GeneralHandler.getToggleValue('Main Road Type-container');

    const rootLengthElement = document.getElementById('root-length');
    const tipLengthElement = document.getElementById('tip-length');
    const mainWidthElement = document.getElementById('main-width');
    const mainRoadShapeContainer = document.getElementById('Main Road Shape-container');
    const roundaboutFeaturesContainer = document.getElementById('Roundabout Type-container');

    const rootLength = rootLengthElement ? parseInt(rootLengthElement.value) : null;
    const tipLength = tipLengthElement ? parseInt(tipLengthElement.value) : null;
    const mainWidth = mainWidthElement ? parseInt(mainWidthElement.value) : null;
    const endShape = mainRoadShapeContainer ? GeneralHandler.getToggleValue('Main Road Shape-container') : null;
    const roundaboutFeatures = roundaboutFeaturesContainer ? GeneralHandler.getToggleValue('Roundabout Type-container') : null;

    const mainRoadParams = {
      xHeight: xHeight,
      color: color.toLowerCase(),
      roadType: roadType,
      rootLength: rootLength,
      tipLength: tipLength,
      mainWidth: mainWidth,
      shape: endShape,
      width: mainWidth,
      RAfeature: roundaboutFeatures
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

      // Call the updated function that uses the general snapping functionality
      const pointer = CanvasGlobals.canvas.getPointer({ e: { clientX: CanvasGlobals.canvas.width / 2, clientY: CanvasGlobals.canvas.height / 2 } });

      // Create option object with necessary parameters
      const option = {
        x: pointer.x,
        y: pointer.y,
        routeParams: {
          angle: angle,
          shape: shape,
          width: width
        }
      };

      FormDrawMapComponent.drawSideRoadOnCursor(null, option);
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
    if (CanvasGlobals.canvas.newSymbolObject && CanvasGlobals.canvas.newSymbolObject.functionalType === 'SideRoad') {
      const newAngle = FormDrawMapComponent.permitAngle[(angleIndex + 1) % FormDrawMapComponent.permitAngle.length];

      // Update the object's angle - will be applied during mouse move
      if (CanvasGlobals.canvas.newSymbolObject.routeList && CanvasGlobals.canvas.newSymbolObject.routeList.length > 0) {
        const side = CanvasGlobals.canvas.newSymbolObject.side;
        CanvasGlobals.canvas.newSymbolObject.routeList[0].angle = side ? -Math.abs(newAngle) : Math.abs(newAngle);

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
    document.addEventListener('keydown', cancelDraw);

    // Get parameters either from DOM elements or provided params
    let xHeight, rootLength, tipLength, color, width, shape, roadType, RAfeature;

    if (params) {
      xHeight = params.xHeight || 100;
      rootLength = params.rootLength;
      tipLength = params.tipLength;
      color = params.color || 'white';
      width = params.width || 6;
      shape = params.shape || 'Arrow';
      roadType = params.roadType || 'Main Line';
      RAfeature = params.RAfeature || 'Normal';
    } else {
      return;
    }    // Create a function that returns a new MainRoadSymbol
    const createMainRoadObject = (options) => {
      // Create route list centered on the provided position
      const routeList = [
        { x: options.position.x, y: options.position.y + (options.rootLength + options.tipLength) * options.xHeight / 4, angle: 180, width: options.width, shape: options.roadType == 'Main Line' ? 'Stub' : options.RAfeature },
        { x: options.position.x, y: options.position.y, angle: 0, width: options.width, shape: options.shape }
      ];

      // Create route options for the MainRoadSymbol
      const routeOptions = {
        routeList: routeList,
        xHeight: options.xHeight,
        color: options.color,
        rootLength: options.rootLength,
        tipLength: options.tipLength,
        roadType: options.roadType,
        RAfeature: options.RAfeature
      };

      // Create and initialize the MainRoadSymbol
      const routeMap = new MainRoadSymbol(routeOptions);
      //routeMap.initialize(calcVertexType[options.roadType](options.xHeight, routeList));

      // Add special features based on RAfeature
      if (options.RAfeature === 'U-turn') {
        addUTurnToMainRoad(routeMap);
      }

      return routeMap;
    };
    try {
      // Create a temporary component to store the new object
      const tempComponent = {
        newMapObject: null
      };

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
          RAfeature: RAfeature
        },
        createMainRoadObject,
        tempComponent, // Pass the temp component to store the created object
        'newMapObject',
        activeVertexLabel,
        mainRoadOnMouseMove,
        finishDrawMainRoad,
        cancelDraw
      );

      canvas.newSymbolObject = tempComponent.newMapObject;
    } catch (error) {
      console.error('Error creating main road:', error);
    }
  },

  addUTurnToMainRoad: function (mainRoad) {

    // Create options for the arm
    const options = {
      x: 0,
      y: 0,
      routeList: [{
        x: 6, y: 33.4 + (mainRoad.roadType == 'Spiral Roundabout' ? 2 : 0),
        angle: 0,
        shape: 'UArrow ' + mainRoad.roadType.split(' ')[0],
        width: 4
      }],
      xHeight: mainRoad.xHeight,
    };

// Declare variables outside the if-else blocks 
let routeList = options.routeList;
let arrow = JSON.parse(JSON.stringify(roadMapTemplate[routeList[0].shape]))
arrow = calcSymbol(arrow, mainRoad.xHeight / 4)

// Create and initialize the side road
const sideRoad = new SideRoadSymbol(options);
sideRoad.initialize(arrow);


// Update main road to show how it would look with the new side road
//mainRoad.receiveNewRoute(tempVertexList);
//mainRoad.setCoords();
mainRoad.sideRoad.push(sideRoad);
sideRoad.mainRoad = mainRoad;
},



/**
* Handle mouse movement for road symbol placement
* @param {Event} event - Mouse event
*/
mainRoadOnMouseMove: function(event) {
  if (!canvas.newSymbolObject) return;

  const mainRoad = canvas.newSymbolObject;
  if (mainRoad.functionalType !== 'MainRoad') return;

  const pointer = canvas.getPointer(event.e);

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


    // For MainLine type, recalculate the vertices based on updated routeList
    if (mainRoad.roadType === 'Main Line') {
      // Calculate the delta movement
      const deltaX = mainRoad.left - originalLeft;
      const deltaY = mainRoad.top - originalTop;

      // Update all points in routeList to match the new position
      mainRoad.routeList.forEach(route => {
        route.x += deltaX;
        route.y += deltaY;
      });

      const vertexList = calcVertexType[mainRoad.roadType](mainRoad.xHeight, mainRoad.routeList);
      mainRoad.basePolygon.vertex = vertexList.path[0].vertex;
      mainRoad.basePolygon.path = vertexList.path;
    }

    // Update any side roads if they exist
    if (mainRoad.sideRoad && mainRoad.sideRoad.length > 0) {
      mainRoad.sideRoad.forEach(side => {
        side.onMove(null, true);
      });
    }
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
    const vertexList = calcVertexType[mainRoad.roadType](mainRoad.xHeight, mainRoad.routeList);
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
finishDrawMainRoad: function(event, options = null) {
  if (event.e.button !== 0 && event.e.type !== 'touchend') return;

  // Finalize main road placement on click
  if (!canvas.newSymbolObject) return;

  const mainRoad = canvas.newSymbolObject;
  if (mainRoad.functionalType !== 'MainRoad') return;

  // Complete the placement
  if (CanvasGlobals.activeVertex) {
    CanvasGlobals.activeVertex.handleMouseUpRef(event);
  }

  // Add the main road to the canvas object list if not already added
  if (!canvasObject.includes(mainRoad)) {
    canvasObject.push(mainRoad);
  }

  // Update coordinates and positions
  mainRoad.setCoords();
  mainRoad.isTemporary = false;

  // Reset state
  const placedRoad = canvas.newSymbolObject;
  canvas.newSymbolObject = null;
  CanvasGlobals.activeVertex = null;

  // Clean up event handlers
  drawRoadsHandlerOff();

  // Make the new road active after a slight delay
  setTimeout(() => {
    canvas.setActiveObject(placedRoad);
  }, 300);
},

/**
* Draws side road cursor for adding routes to existing root
* @param {Event} event - Mouse event
* @param {Object} option - Optional parameters for testing
* @return {void}
*/
drawSideRoadOnCursor: function(event, option = null) {
  document.removeEventListener('keydown', CanvasGlobals.Show);
  document.addEventListener('keydown', cancelDraw);

  const mainRoad = canvas.getActiveObject();
  if (!mainRoad || mainRoad.functionalType !== 'MainRoad') return;

  // Clear any existing temp side road
  if (canvas.newSymbolObject) {
    // If there's already a temp side road, remove it
    const existingSideRoad = canvas.newSymbolObject;
    if (existingSideRoad.functionalType === 'SideRoad') {
      existingSideRoad.deleteObject && existingSideRoad.deleteObject();
      canvas.newSymbolObject = null;
    }
  }

  // Declare variables outside the if-else blocks 
  let routeList = [];
  let angle, shape, width, pointer;

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
      if (pointer.x < mainRoad.left + mainRoad.width / 2) {
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
    pointer = canvas.getPointer(event.e);
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

    if (pointer.x < mainRoad.left + mainRoad.width / 2) {
      angle = -angle;
    }

    shape = mainRoad.roadType == 'Spiral Roundabout' ? 'Spiral Arrow' : GeneralHandler.getToggleValue('Side Road Shape-container');
    width = document.getElementById(`Side Road width`).value;
    routeList.push({ x: pointer.x, y: pointer.y, angle: angle, shape: shape, width: width, });
    mainRoad.tempRootList = JSON.parse(JSON.stringify(routeList));
  }    // Create a function that returns a new SideRoadSymbol
  const createSideRoadObject = (options) => {
    const pointer = options.position;

    // Determine which side the branch is on
    const isSideLeft = pointer.x < mainRoad.left + mainRoad.width / 2;

    // Create the route list with the correct angle direction based on side
    let localAngle = options.angle;
    if (isSideLeft) {
      localAngle = -Math.abs(localAngle);
    } else {
      localAngle = Math.abs(localAngle);
    }

    // Create the route list for the side road
    const routeList = [{
      x: pointer.x,
      y: pointer.y,
      angle: localAngle,
      shape: options.shape || (mainRoad.roadType == 'Spiral Roundabout' ? 'Spiral Arrow' : 'Arrow'),
      width: options.width || 4
    }];

    // Apply constraints to position the side road correctly relative to main road
    const constrainedResult = applySideRoadConstraints(
      null, // No side road object yet
      mainRoad,
      routeList,
      isSideLeft,
      mainRoad.xHeight
    );

    // Use constrained result
    const constrainedRouteList = constrainedResult.routeList;
    const tempVertexList = constrainedResult.tempVertexList;

    // Store route list in main road for reference
    mainRoad.tempRootList = JSON.parse(JSON.stringify(constrainedRouteList));

    // Create the branch options
    const branchOptions = {
      routeList: constrainedRouteList,
      xHeight: mainRoad.xHeight,
      color: mainRoad.color,
      mainRoad: mainRoad,
      side: isSideLeft,
      branchIndex: mainRoad.sideRoad.length + 1
    };

    // Create and initialize the side road
    const sideRoad = new SideRoadSymbol(branchOptions);
    sideRoad.initialize(tempVertexList);

    // Update main road to show how it would look with the new side road
    mainRoad.receiveNewRoute(tempVertexList);

    return sideRoad;
  };

  // Use the general object creation with snapping function
  try {
    // Create a temporary component object to use with the general function
    const tempComponent = {
      newMapObject: null
    };

    // Get current values from DOM or use defaults
    const currentAngle = angle;
    const currentShape = shape;
    const currentWidth = width;

    GeneralHandler.createObjectWithSnapping(
      {
        position: {
          x: pointer.x,
          y: pointer.y
        },
        angle: currentAngle,
        shape: currentShape,
        width: currentWidth,
        mainRoad: mainRoad
      },
      createSideRoadObject,
      tempComponent,
      'newMapObject',
      'V1',
      sideRoadOnMouseMove,
      finishDrawSideRoad,
      cancelDraw
    );

    // Move the reference from temporary component to canvas
    canvas.newSymbolObject = tempComponent.newMapObject;
  } catch (error) {
    console.error('Error creating side road:', error);
  }
},

/**
* Handle mouse movement for side road placement
* @param {Event} event - Mouse event
*/
sideRoadOnMouseMove: function(event) {

  const sideRoad = canvas.newSymbolObject;
  if (sideRoad.functionalType !== 'SideRoad') return;

  const mainRoad = sideRoad.mainRoad;
  if (!mainRoad) return;

  const pointer = canvas.getPointer(event.e);

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
finishDrawSideRoad: function(event) {
  if (event.e.button !== 0 && event.e.type !== 'touchend') return;

  // Finalize side road placement on click
  if (!canvas.newSymbolObject) return;

  const sideRoad = canvas.newSymbolObject;
  if (sideRoad.functionalType !== 'SideRoad') return;

  const mainRoad = sideRoad.mainRoad;
  if (!mainRoad) return;

  // Complete the placement
  if (CanvasGlobals.activeVertex) {
    CanvasGlobals.activeVertex.handleMouseUpRef(event);
  }

  // Make sure the side road isn't already in the main road's collection
  if (!mainRoad.sideRoad.includes(sideRoad)) {
    // Add to main road's branch collection
    mainRoad.sideRoad.push(sideRoad);

    // Add connection point for this branch to main road if needed
    if (mainRoad.roadType == 'Main Line') {
      const isSideLeft = sideRoad.side;
      const connectPoint = sideRoad.basePolygon.vertex[isSideLeft ? 0 : 6];
      mainRoad.basePolygon.vertex.push({
        x: connectPoint.x,
        y: connectPoint.y,
        label: `C${sideRoad.branchIndex}`
      });
    }
  }

  // Ensure main road is properly updated with the new side road
  try {
    mainRoad.receiveNewRoute();
  } catch (error) {
    console.error("Error finalizing main road update:", error);
  }

  // Update coordinates
  mainRoad.setCoords();
  sideRoad.isTemporary = false;

  // Reset state - store a reference before clearing
  const placedSideRoad = canvas.newSymbolObject;

  // Clear the newSymbolObject so a new side road can be drawn immediately
  canvas.newSymbolObject = null;
  CanvasGlobals.activeVertex = null;

  // Clean up
  drawRoadsHandlerOff();

  // Make the new branch active after a slight delay
  setTimeout(() => {
    canvas.setActiveObject(placedSideRoad);
    // This delay allows UI to update before potentially drawing another side road
  }, 300);
},

/**
* Cleans up route drawing handlers
* @param {Event} event - Optional event object
* @return {void}
*/
drawRoadsHandlerOff: function(event) {
  // If there's a new road object being placed, remove it unless it's been added to canvas properly
  if (canvas.newSymbolObject) {
    const newRoad = canvas.newSymbolObject;

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

    canvas.newSymbolObject = null;
  }

  // Clean up active vertex if there is one
  if (CanvasGlobals.activeVertex) {
    if (CanvasGlobals.activeVertex.indicator) {
      canvas.remove(CanvasGlobals.activeVertex.indicator);
    }
    CanvasGlobals.activeVertex.cleanupDrag && CanvasGlobals.activeVertex.cleanupDrag();
    CanvasGlobals.activeVertex = null;
  }

  canvas.off('mouse:move', mainRoadOnMouseMove);
  canvas.off('mouse:move', sideRoadOnMouseMove);
  canvas.off('mouse:down', finishDrawSideRoad);
  canvas.off('mouse:down', finishDrawMainRoad);
  canvas.off('mouse:move', drawSideRoadOnCursor);
  document.removeEventListener('keydown', cancelDraw);
  document.addEventListener('keydown', ShowHideSideBarEvent);

  // Force a final render to clean up any visual artifacts
  canvas.renderAll();
},

/**
* Cancels route drawing on escape key
* @param {Event} event - Keyboard event
* @param {boolean} force - Force cancel flag
* @return {void}
*/
cancelDraw: function(event, force = false) {
  if (event.key === 'Escape' || force) {
    drawRoadsHandlerOff();
    setTimeout(() => {
      document.addEventListener('keydown', ShowHideSideBarEvent);
    }, 1000);
  }
},
}

// Use the shared settings listener implementation
GeneralSettings.addListener(
  GeneralHandler.createSettingsListener(4, function (setting, value) {
    // Map-specific updates when settings change
    if (FormDrawMapComponent.newMapObject || CanvasGlobals.canvas.newSymbolObject) {
      const targetObject = FormDrawMapComponent.newMapObject || CanvasGlobals.canvas.newSymbolObject;

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
            const vertexList = calcVertexType[targetObject.roadType](value, targetObject.routeList);
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