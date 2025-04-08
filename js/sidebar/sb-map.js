/* Draw Map Panel */
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
    tabNum = 4
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

      const existingRoute = canvas.getActiveObjects().length == 1 && canvas.getActiveObject.functionalType == 'MainRoute' ? canvas.getActiveObjects()[0] : null
      const routeList = existingRoute ? existingRoute.routeList : FormDrawMapComponent.defaultRoute

      if (routeList) {
        routeList.forEach((route, index) => {
          var SideRoadParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
          const addRouteButton = GeneralHandler.createButton('button-addRoute', '+ Another Route Destination', SideRoadParamsContainer, 'input', FormDrawMapComponent.addRouteInput, 'click');
          if (canvas.getActiveObjects().length == 1 && canvas.getActiveObject.functionalType === 'MainRoad') {
            addRouteButton.classList.add('deactive'); // Set initial state to deactive
            addRouteButton.disabled = true;
          }
          GeneralHandler.createInput(`Side Road width`, `Side Road Width`, SideRoadParamsContainer, 4, null, 'input')
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
      GeneralHandler.createInput('root-length', 'Main Road Root Length', roadTypeSettingsContainer, 7, drawMainRoadOnCursor, 'input');
      GeneralHandler.createInput('tip-length', 'Main Road Tip Length', roadTypeSettingsContainer, 12, drawMainRoadOnCursor, 'input');
      GeneralHandler.createInput('main-width', 'Main Road Width', roadTypeSettingsContainer, 6, drawMainRoadOnCursor, 'input');
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
    drawMainRoadOnCursor(null, mainRoadParams);
  },

  /**
   * Adds new route inputs to the panel based on active object's route list
   * @param {Event} event - The triggering event object
   * @return {void} 
   */
  addRouteInput: function (event) {
    const existingRoute = canvas.getActiveObject();
    if (existingRoute && existingRoute.functionalType === 'MainRoad') {
      // Get parameters from DOM
      const xHeight = parseInt(document.getElementById('input-xHeight').value);
      const color = document.getElementById('Message Colour-container').selected.getAttribute('data-value');
      const angle = parseInt(document.getElementById('angle-display').innerText);
      const width = parseInt(document.getElementById('Side Road width').value);
      const shape = GeneralHandler.getToggleValue('Side Road Shape-container');
      
      // Call the updated function that uses the general snapping functionality
      const pointer = canvas.getPointer({ e: { clientX: canvas.width/2, clientY: canvas.height/2 } });
      
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
      
      drawSideRoadOnCursor(null, option);
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
    if (canvas.newSymbolObject && canvas.newSymbolObject.functionalType === 'SideRoad') {
      const newAngle = FormDrawMapComponent.permitAngle[(angleIndex + 1) % FormDrawMapComponent.permitAngle.length];
      
      // Update the object's angle - will be applied during mouse move
      if (canvas.newSymbolObject.routeList && canvas.newSymbolObject.routeList.length > 0) {
        const side = canvas.newSymbolObject.side;
        canvas.newSymbolObject.routeList[0].angle = side ? -Math.abs(newAngle) : Math.abs(newAngle);
        
        // Force an update
        if (activeVertex && activeVertex.handleMouseMoveRef) {
          // Get current pointer
          const pointer = canvas.getPointer({ e: window.event });
          activeVertex.handleMouseMoveRef({
            e: window.event,
            pointer: pointer
          });
        }
      }
    }
  },

  /**
   * Clean up resources when switching away from the map panel
   */
  MapHandlerOff: function() {
    // Use shared handler for cleanup
    GeneralHandler.genericHandlerOff(
      FormDrawMapComponent,
      'newMapObject',
      'MapOnMouseMove',
      'MapOnMouseClick',
      'cancelMap'
    );
    
    // Also clean up any canvas references to map objects
    if (canvas.newSymbolObject) {
      if (canvas.newSymbolObject.deleteObject) {
        canvas.newSymbolObject.deleteObject();
      } else {
        canvas.remove(canvas.newSymbolObject);
      }
      canvas.newSymbolObject = null;
    }
    
    // Make sure route-specific handlers are also cleaned up
    drawRoadsHandlerOff();
  },

  /**
   * Handles map object movement
   */
  MapOnMouseMove: function (event) {
    // Use shared mouse move handler
    GeneralHandler.handleObjectOnMouseMove(FormDrawMapComponent, event);
  },

  /**
   * Handles map object placement
   */
  MapOnMouseClick: function (event) {
    if (event.e.button !== 0) return;
    
    // Use shared mouse click handler
    if (FormDrawMapComponent.newMapObject) {
      GeneralHandler.handleObjectOnMouseClick(
        FormDrawMapComponent,
        event,
        'newMapObject',
        'MapOnMouseMove',
        'MapOnMouseClick',
        'cancelMap'
      );
      
      return;
    }
  },

  /**
   * Handles cancellation of map drawing
   */
  cancelMap: function (event) {
    // Handle both the FormDrawMapComponent object and canvas.newSymbolObject
    if (event.key === 'Escape') {
      // First handle FormDrawMapComponent's object
      GeneralHandler.handleCancelWithEscape(
        FormDrawMapComponent, 
        event, 
        'newMapObject', 
        'MapOnMouseMove', 
        'MapOnMouseClick'
      );
      
      // Then also call the route-specific cancelDraw to handle canvas.newSymbolObject
      cancelDraw(event);
    }
  }
}

// Use the shared settings listener implementation
GeneralSettings.addListener(
  GeneralHandler.createSettingsListener(4, function(setting, value) {
    // Map-specific updates when settings change
    if (FormDrawMapComponent.newMapObject || canvas.newSymbolObject) {
      const targetObject = FormDrawMapComponent.newMapObject || canvas.newSymbolObject;
      
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
        
        canvas.renderAll();
      } else if (setting === 'messageColor' && targetObject.color !== undefined) {
        targetObject.color = value.toLowerCase();
        
        // Update the object's color
        if (targetObject.basePolygon) {
          targetObject.basePolygon.set('fill', value.toLowerCase());
        }
        
        canvas.renderAll();
      }
    }
  })
);