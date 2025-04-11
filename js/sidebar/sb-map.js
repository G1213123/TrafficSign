/* Draw Map Panel */
import { createNode, createButton, createInput, createToggle } from './domHelpers.js';
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
    var parent = document.getElementById('input-form')
    if (parent) {
      parent.routeCount = 0
     // Create xHeight input using the standard handler
      const xHeightInput = createInput('input-xHeight', 'x Height', parent, GeneralSettings.xHeight, () => {
        GeneralSettings.updateSetting('xHeight', parseInt(xHeightInput.value));
      }, 'input');
      // Create color toggle with our CUSTOM color change handler
      createToggle('Message Colour', ['Black', 'White'], parent, GeneralSettings.messageColor, (e) => {
        GeneralSettings.updateSetting('messageColor', e.target.getAttribute('data-value'));
      });
      // Create a container for route parameters
      var MainRoadParamsContainer = createNode("div", { 'class': 'input-group-container' }, parent);
      createToggle('Main Road Type', FormDrawMapComponent.MapType, MainRoadParamsContainer, 'Main Line', FormDrawMapComponent.updateRoadTypeSettings);
      // Create a container for road type-specific settings
      const roadTypeSettingsContainer = createNode("div", { 'class': 'road-type-settings' }, MainRoadParamsContainer);
      // Initial setup of settings based on default selection
      FormDrawMapComponent.updateRoadTypeSettings(roadTypeSettingsContainer);
      createButton('button-DrawMap', 'Draw Main Road Symbol', MainRoadParamsContainer, 'input', FormDrawMapComponent.gatherMainRoadParams, 'click');
      const existingRoute = canvas.getActiveObjects().length == 1 && canvas.getActiveObject.functionalType == 'MainRoute' ? canvas.getActiveObjects()[0] : null
      const routeList = existingRoute ? existingRoute.routeList : FormDrawMapComponent.defaultRoute

      if (routeList) {
        routeList.forEach((route, index) => {
          var SideRoadParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
          const addRouteButton = GeneralHandler.createButton('button-addRoute', '+ Another Route Destination', SideRoadParamsContainer, 'input', FormDrawMapComponent.addRouteInput, 'click');
          if (canvas.getActiveObjects().length === 1 && canvas.getActiveObject().functionalType === 'MainRoad') {
            addRouteButton.classList.add('deactive'); // Set initial state to deactive
            addRouteButton.disabled = true;
          }
          createInput(`Side Road width`, `Side Road Width`, SideRoadParamsContainer, 4, null, 'input')
          createToggle(`Side Road Shape`, FormDrawMapComponent.EndShape, SideRoadParamsContainer, route.shape, null)
          var angleContainer = createNode("div", { 'class': 'angle-picker-container' }, SideRoadParamsContainer);
          createButton(`rotate-left`, '<i class="fa-solid fa-rotate-left"></i>', angleContainer, null, FormDrawMapComponent.setAngle, 'click')
          var angleDisplay = createNode("div", { 'id': `angle-display`, 'class': 'angle-display' }, angleContainer);
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
    const roadType = document.getElementById('Main Road Type-container').selected.getAttribute('data-value');

    // Show settings based on road type
    if (roadType === 'Main Line') {
      // Main Line settings
      createInput('root-length', 'Main Road Root Length', roadTypeSettingsContainer, 7, drawMainRoadOnCursor, 'input');
      createInput('tip-length', 'Main Road Tip Length', roadTypeSettingsContainer, 12, drawMainRoadOnCursor, 'input');
      createInput('main-width', 'Main Road Width', roadTypeSettingsContainer, 6, drawMainRoadOnCursor, 'input');
      createToggle(`Main Road Shape`, FormDrawMapComponent.EndShape, roadTypeSettingsContainer, 'Arrow', drawMainRoadOnCursor);
    } else if (roadType === 'Conventional Roundabout') {
      // Placeholder for Conventional Roundabout settings
      createToggle(`Roundabout Type`, FormDrawMapComponent.RoundaboutFeatures, roadTypeSettingsContainer, 'Normal', drawMainRoadOnCursor);
    } else if (roadType === 'Spiral Roundabout') {
      // Placeholder for Spiral Roundabout settings
      createToggle(`Roundabout Type`, FormDrawMapComponent.RoundaboutFeatures, roadTypeSettingsContainer, 'Normal', drawMainRoadOnCursor);
    }
  },

  gatherMainRoadParams: function () {
    const xHeight = parseInt(document.getElementById('input-xHeight').value);
    const color = document.getElementById('Message Colour-container').selected.getAttribute('data-value');
    const roadType = document.getElementById('Main Road Type-container').selected.getAttribute('data-value');

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
      const shape = document.getElementById('Side Road Shape-container').selected.getAttribute('data-value');
      
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
    canvas.off('mouse:move', FormDrawMapComponent.MapOnMouseMove);
    canvas.off('mouse:down', FormDrawMapComponent.MapOnMouseClick);
    document.removeEventListener('keydown', FormDrawMapComponent.cancelMap);
    if (FormDrawMapComponent.newMapObject) canvas.remove(FormDrawMapComponent.newMapObject);
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
       // Get the current position of the mouse
       const pointer = GeneralSettings.canvas.getPointer(event.e);
       const activeObj = FormDrawMapComponent.newMapObject;
       if (!activeObj) return;
       // Move the object to the mouse position
       activeObj.set({
         left: pointer.x,
         top: pointer.y,
       });
   
       // Render the canvas to show the updated position
       GeneralSettings.canvas.renderAll();
  
  
  },

  /**
   * Handles map object placement
   */
  MapOnMouseClick: function (event) {
    if (event.e.button !== 0) return;
    
    // Use shared mouse click handler
    if (FormDrawMapComponent.newMapObject) {
      FormDrawMapComponent.handleObjectOnMouseClick(FormDrawMapComponent, event, 'newMapObject', 'MapOnMouseMove', 'MapOnMouseClick', 'cancelMap')
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
      FormDrawMapComponent.handleCancelWithEscape(FormDrawMapComponent, event, 'newMapObject', 'MapOnMouseMove', 'MapOnMouseClick');

      // Then also call the route-specific cancelDraw to handle canvas.newSymbolObject
      cancelDraw(event);
    }
  }
}

// Use the shared settings listener implementation
GeneralSettings.addListener(function(setting, value) {
  
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

  ,
  debounce: (func, wait, immediate) => {
    let timeout;
  
    return function executedFunction(...args) {
      const context = this;
  
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);\
      };
  
      const callNow = immediate && !timeout;
  
      clearTimeout(timeout);
  
      timeout = setTimeout(later, wait);\
  
      if (callNow) func.apply(context, args);
    };
  },

  handleObjectOnMouseMove: (caller, event) => {
    // Get the current position of the mouse
    const pointer = GeneralSettings.canvas.getPointer(event.e);
    const activeObj = caller.newMapObject;
  
    if (!activeObj) return;
  
    // Move the object to the mouse position
    activeObj.set({
      left: pointer.x,
      top: pointer.y,
    });

    // Render the canvas to show the updated position
    GeneralSettings.canvas.renderAll();
    if (!caller.isDragging) return;

    const objects = GeneralSettings.canvas.getObjects().filter(obj => obj !== activeObj);
  
    // Iterate through all objects on the canvas to check for proximity
    objects.forEach(obj => {
      if (!obj.snapPoints) return;
  
      // Check all snap points of the target object
      obj.snapPoints.forEach(targetPoint => {
        // Check proximity between the active object\'s snap origin and the target point
        const distance = Math.sqrt(\
          Math.pow(activeObj.snapOrigin.x - targetPoint.x, 2) +\
          Math.pow(activeObj.snapOrigin.y - targetPoint.y, 2)\
        );
        \
        // If the distance is less than the snap tolerance, snap
        if (distance < 100) {
          activeObj.set({\
            left: targetPoint.x - (activeObj.snapOrigin.x - activeObj.left),\
            top: targetPoint.y - (activeObj.snapOrigin.y - activeObj.top),\
          });
          \
          // Render the canvas to show the snapped position
          GeneralSettings.canvas.renderAll();
        }\
      });
    });
  },

  handleObjectOnMouseClick: (caller, event, objName, onMouseMove, onMouseClick, onCancel) => {
    if (!caller[objName]) return;\
    const currentObject = caller[objName];
    // Remove temporary styling/behavior
    currentObject.isTemporary = false;\
    currentObject.setCoords();\
    // Remove the object from the temp list
    caller[objName] = null;
    caller.isDragging = false;
    // Remove event listener
    GeneralSettings.canvas.off('mouse:move', caller[onMouseMove]);
    GeneralSettings.canvas.off('mouse:down', caller[onMouseClick]);
    document.removeEventListener('keydown', caller[onCancel]);
    // Set the object as selected
    GeneralSettings.canvas.setActiveObject(currentObject);
    currentObject.enterFocusMode();
  },
  handleCancelWithEscape: (caller, event, objName, onMouseMove, onMouseClick) => {
    if (event.key === 'Escape') {\
      // Remove the object from the canvas\
      if (caller[objName]) GeneralSettings.canvas.remove(caller[objName]);\
      // Clear the object reference\
      caller[objName] = null;\
      // Remove event listener\
      GeneralSettings.canvas.off('mouse:move', caller[onMouseMove]);\
      GeneralSettings.canvas.off('mouse:down', caller[onMouseClick]);
      document.removeEventListener('keydown', caller.cancelMap);\
    }
  }
);