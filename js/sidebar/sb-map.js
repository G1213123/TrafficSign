/* Draw Map Panel */
let FormDrawMapComponent = {
  MapType: ['Main Line', 'Conventional Roundabout', 'Spiral Roundabout',],
  EndShape: ['Arrow', 'Stub'],
  RoundaboutFeatures: ['Normal', 'Auxiliary', 'U-turn'],
  permitAngle: [45, 60, 90],
  defaultRoute: [{ x: 0, y: 7, angle: 60, width: 4, shape: 'Arrow' }],

  /**
   * Initializes the map drawing panel with input fields and buttons
   * @return {void}
   */
  drawMapPanelInit: function () {
    tabNum = 4
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      parent.routeCount = 0
      // Create a container for basic parameters
      var basicParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      GeneralHandler.createInput('input-xHeight', 'x Height', basicParamsContainer, 100, null, 'input')
      GeneralHandler.createToggle('Message Colour', ['Black', 'White'], basicParamsContainer, 'White', drawMainRoadOnCursor)

      // Create a container for route parameters
      var MainRoadParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      GeneralHandler.createToggle('Main Road Type', FormDrawMapComponent.MapType, MainRoadParamsContainer, 'Main Line', FormDrawMapComponent.updateRoadTypeSettings)
      //const drawMapButton = GeneralHandler.createButton('button-DrawMap', 'Draw Main Road Symbol', MainRoadParamsContainer, 'input', drawMainRoadOnCursor, 'click');

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
      color: color,
      roadType: roadType,
      rootLength: rootLength,
      tipLength: tipLength,
      mainWidth: mainWidth,
      endShape: endShape,
      roundaboutFeatures: roundaboutFeatures
    };

    drawMainRoadOnCursor(null, mainRoadParams);
  },

  /**
   * Adds new route inputs to the panel based on active object's route list
   * @param {Event} event - The triggering event object
   * @return {void} 
   */
  addRouteInput: function (event) {
    var parent = document.getElementById("input-form");
    const existingRoute = canvas.getActiveObjects()
    if (existingRoute.length == 1 && existingRoute[0].functionalType === 'MainRoad') {
      canvas.off('mouse:move', drawSideRoadOnCursor)
      canvas.on('mouse:move', drawSideRoadOnCursor)
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
    //FormDrawMapComponent.routeAngle = FormDrawMapComponent.permitAngle[(angleIndex + 1) % FormDrawMapComponent.permitAngle.length]
    angleDisplay.innerText = FormDrawMapComponent.permitAngle[(angleIndex + 1) % FormDrawMapComponent.permitAngle.length] + '°';
  }
}

// Export the FormDrawMapComponent for use in other files