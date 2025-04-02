/* Border Panel */
let FormBorderWrapComponent = {
  BorderPanelInit: function () {
    tabNum = 3
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      // Create a container for border parameters
      var borderParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      GeneralHandler.createInput('input-xHeight', 'x Height', borderParamsContainer, 100)
      
      // Color scheme selection remains as dropdown
      GeneralHandler.createSelect('input-color', 'Select Color Scheme', Object.keys(BorderColorScheme), borderParamsContainer, null, FormBorderWrapComponent.createBorderButtons, 'change')


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
    let pathData = await vertexToPath(shapeMeta, color);
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
        BorderUtilities.BorderGroupCreate(borderType, heightObjects, widthObjects, widthText, heightText)
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

// Export the FormBorderWrapComponent for use in other files