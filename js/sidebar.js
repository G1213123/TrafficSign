var cursor = new fabric.Group();
cursor.set({ id: 'cursor', "selectable": false })
cursor.lockScalingX = true;
cursor.lockScalingY = true;
cursor.lockUniScaling = true;
var cursorOffset = { x: 0, y: 0 }
let tabNum = 2;

canvas.add(cursor);

canvas.snap_pts = [];

/* General Sidebar Panel */
let GeneralHandler = {
  panelOpened: true,
  ShowHideSideBar: function (event, force = null) {
    if (force === null) {
      if (document.getElementById("side-panel").className.indexOf("open") !== -1) {
        GeneralHandler.HideSideBar()
      } else {
        GeneralHandler.ShowSideBar()
      }
    } else if (force === 'on') {
      GeneralHandler.ShowSideBar()
    } else {
      GeneralHandler.HideSideBar()
    }
  },
  ShowSideBar: function () {
    document.getElementById("side-panel").className = "side-panel"
    document.getElementById("side-panel").className += " open"
    document.getElementById('show_hide').childNodes[0].className = "fa fa-angle-double-left"
    GeneralHandler.panelOpened = true
  },
  HideSideBar: function () {
    document.getElementById("side-panel").className = "side-panel"
    document.getElementById("side-panel").className += " close"
    document.getElementById('show_hide').childNodes[0].className = "fa fa-angle-double-right"
    GeneralHandler.panelOpened = false
    GeneralHandler.PanelHandlerOff()
  },
  PanelHandlerOff: () => {
    FormTextAddComponent.TextHandlerOff()
    FormDrawAddComponent.DrawHandlerOff()
    if (tabNum != 5) {
      FormDebugComponent.DebugHandlerOff()
    }
  },
  PanelInit: () => {
    GeneralHandler.ShowHideSideBar(null, "on")
    GeneralHandler.PanelHandlerOff()
    if (document.getElementById("side-panel").className.indexOf("open") !== -1) {
      var parent = document.getElementById("input-form");
      parent.innerHTML = ''
    }
    CanvasObjectInspector.createObjectListPanelInit()
    return parent
  },
  createNode: function (type, attribute, parent, callback, event) {
    var node = document.createElement(type);
    for (const [key, value] of Object.entries(attribute)) {
      node.setAttribute(key, value)
    }
    parent.appendChild(node);
    if (callback) {
      node.addEventListener(event, callback)
    }
    return node
  },
  createButton: function (name, labelTxt, parent, container = 'input', callback = null, event = null) {
    if (container) {
      var inputContainer = GeneralHandler.createNode("div", { 'class': `${container}-container` }, parent)
    }
    var input = GeneralHandler.createNode("button", { 'type': 'button', 'class': `${container ? container : name}-button`, 'id': name, 'placeholder': ' ' }, inputContainer ? inputContainer : parent, callback, event)
    input.innerHTML = labelTxt
    return input
  },

  createSVGButton: function (name, svg, parent, container = 'input', callback = null, event = null) {
    if (container) {
      var inputContainer = GeneralHandler.createNode("div", { 'class': `${container}-container` }, parent)
    }
    var input = GeneralHandler.createNode("button", { 'type': 'button', 'class': `${container ? container : name}-button`, 'id': name, 'placeholder': ' ' }, inputContainer ? inputContainer : parent, callback, event)

    // Add the SVG
    input.innerHTML = svg;

    // Add a separator line
    const separator = document.createElement('hr');
    separator.className = 'symbol-separator';
    input.appendChild(separator);

    // Add text label
    const textLabel = document.createElement('div');
    textLabel.className = 'symbol-label';
    textLabel.innerText = name.replace('button-', '');
    input.appendChild(textLabel);

    return input
  },

  createInput: function (name, labelTxt, parent, defaultV = null, callback = null, event = null) {
    var inputContainer = GeneralHandler.createNode("div", { 'class': 'input-container' }, parent)
    //var labelEdge = GeneralHandler.createNode("div", { 'class': 'cut' }, inputContainer)
    var label = GeneralHandler.createNode("div", { 'class': 'placeholder', 'for': name }, inputContainer)
    var input = GeneralHandler.createNode("input", { 'type': 'text', 'class': 'input', 'id': name, 'placeholder': ' ' }, inputContainer, callback, event)
    label.innerHTML = labelTxt
    defaultV ? input.value = defaultV : input.value = ''
    return input
  },

  createSelect: function (name, labelTxt, options, parent, defaultV = null, callback = null, event = null) {
    var inputContainer = GeneralHandler.createNode("div", { 'class': 'input-container' }, parent)
    var label = GeneralHandler.createNode("div", { 'class': 'placeholder', 'for': name }, inputContainer)
    var input = GeneralHandler.createNode("select", { 'class': 'input', 'id': name, 'placeholder': ' ' }, inputContainer, callback, event)
    label.innerHTML = labelTxt
    for (var i = 0; i < options.length; i++) {
      var option = document.createElement("option");
      option.value = options[i];
      option.text = options[i];
      input.appendChild(option);
    }
    if (defaultV !== null) {
      input.value = defaultV;
    }
    return input
  },

  createToggle: function (name, options, parent, defaultSelected = null, callback = null,) {
    // Create a container for the toggle including its label
    var inputContainer = GeneralHandler.createNode("div", { 'class': 'input-container' }, parent);

    // Create the label
    var label = GeneralHandler.createNode("div", { 'class': 'placeholder', 'for': name }, inputContainer);
    label.innerHTML = name;

    // Create a container for the toggle buttons
    var toggleContainer = GeneralHandler.createNode("div", { 'class': 'toggle-container', 'id': name + '-container' }, inputContainer);

    // Keep track of the buttons to manage their state
    let toggleButtons = [];

    // Create a button for each option
    options.forEach((option, index) => {
      let buttonId = `${name}-${index}`;
      let button = GeneralHandler.createNode("button", {
        'type': 'button',
        'class': 'toggle-button',
        'id': buttonId,
        'data-value': option
      }, toggleContainer);

      button.innerHTML = option;
      toggleButtons.push(button);

      // Add click event to handle toggle behavior
      button.addEventListener('click', function () {
        // Remove active class from all buttons
        toggleButtons.forEach(btn => {
          btn.classList.remove('active');
        });

        // Add active class to clicked button
        this.classList.add('active');
        toggleContainer.selected = this;

        // Call callback if provided
        if (callback) {
          callback(this);
        }
      });

      // Set default selected button
      if (defaultSelected !== null && option === defaultSelected) {
        button.classList.add('active');
        toggleContainer.selected = button;
      } else if (defaultSelected === null && index === 0) {
        // If no default is specified, select the first option
        button.classList.add('active');
        toggleContainer.selected = button;
      }
    });

    return toggleContainer;
  },

  /**
   * Gets the value of the active button in a toggle container
   * @param {string} containerId - The ID of the toggle container
   * @return {string|null} The value of the active button or null if not found
   */
  getToggleValue: function (containerId) {
    const container = document.getElementById(containerId);
    if (!container) return null;

    // Method 1: Use the selected property we store on the container
    if (container.selected) {
      return container.selected.getAttribute('data-value');
    }

    // Method 2: Find the active button using DOM query (fallback)
    const activeButton = container.querySelector('.toggle-button.active');
    return activeButton ? activeButton.getAttribute('data-value') : null;
  },
}

/* Text panel */
let FormTextAddComponent = {
  textWidthMedium: [{ char: ' ', width: 53, shortWidth: 0 }, { char: 'A', width: 136, shortWidth: 0 }, { char: 'B', width: 147, shortWidth: 0 }, { char: 'C', width: 148, shortWidth: 0 }, { char: 'D', width: 154, shortWidth: 0 }, { char: 'E', width: 132, shortWidth: 0 }, { char: 'F', width: 119, shortWidth: 0 }, { char: 'G', width: 155, shortWidth: 0 }, { char: 'H', width: 160, shortWidth: 0 }, { char: 'I', width: 73, shortWidth: 0 }, { char: 'J', width: 93, shortWidth: 0 }, { char: 'K', width: 138, shortWidth: 0 }, { char: 'L', width: 107, shortWidth: 0 }, { char: 'M', width: 184, shortWidth: 0 }, { char: 'N', width: 168, shortWidth: 0 }, { char: 'O', width: 156, shortWidth: 0 }, { char: 'P', width: 130, shortWidth: 0 }, { char: 'Q', width: 158, shortWidth: 0 }, { char: 'R', width: 141, shortWidth: 0 }, { char: 'S', width: 137, shortWidth: 0 }, { char: 'T', width: 109, shortWidth: 105 }, { char: 'U', width: 154, shortWidth: 0 }, { char: 'V', width: 130, shortWidth: 120 }, { char: 'W', width: 183, shortWidth: 189 }, { char: 'X', width: 128, shortWidth: 0 }, { char: 'Y', width: 123, shortWidth: 118 }, { char: 'Z', width: 119, shortWidth: 0 }, { char: 'a', width: 111, shortWidth: 104 }, { char: 'b', width: 117, shortWidth: 0 }, { char: 'c', width: 103, shortWidth: 0 }, { char: 'd', width: 119, shortWidth: 0 }, { char: 'e', width: 109, shortWidth: 102 }, { char: 'f', width: 75, shortWidth: 0 }, { char: 'g', width: 114, shortWidth: 107 }, { char: 'h', width: 112, shortWidth: 0 }, { char: 'i', width: 54, shortWidth: 0 }, { char: 'j', width: 58, shortWidth: 0 }, { char: 'k', width: 108, shortWidth: 0 }, { char: 'l', width: 62, shortWidth: 0 }, { char: 'm', width: 164, shortWidth: 0 }, { char: 'n', width: 112, shortWidth: 0 }, { char: 'o', width: 118, shortWidth: 111 }, { char: 'p', width: 118, shortWidth: 0 }, { char: 'q', width: 118, shortWidth: 0 }, { char: 'r', width: 73, shortWidth: 59 }, { char: 's', width: 97, shortWidth: 95 }, { char: 't', width: 81, shortWidth: 0 }, { char: 'u', width: 115, shortWidth: 101 }, { char: 'v', width: 98, shortWidth: 0 }, { char: 'w', width: 147, shortWidth: 145 }, { char: 'x', width: 104, shortWidth: 0 }, { char: 'y', width: 98, shortWidth: 96 }, { char: 'z', width: 97, shortWidth: 0 }, { char: '1', width: 78, shortWidth: 0 }, { char: '2', width: 120, shortWidth: 0 }, { char: '3', width: 127, shortWidth: 0 }, { char: '4', width: 132, shortWidth: 0 }, { char: '5', width: 122, shortWidth: 0 }, { char: '6', width: 126, shortWidth: 0 }, { char: '7', width: 104, shortWidth: 0 }, { char: '8', width: 130, shortWidth: 0 }, { char: '9', width: 128, shortWidth: 0 }, { char: '0', width: 133, shortWidth: 0 }, { char: ',', width: 53, shortWidth: 0 }, { char: '.', width: 53, shortWidth: 0 }, { char: "'", width: 39, shortWidth: 0 }, { char: ':', width: 53, shortWidth: 0 }, { char: '•', width: 53, shortWidth: 0 }, { char: '、', width: 53, shortWidth: 0 }, { char: '-', width: 66, shortWidth: 0 }, { char: '&', width: 126, shortWidth: 0 }, { char: '(', width: 105, shortWidth: 0 }, { char: ')', width: 105, shortWidth: 0 }, { char: '/', width: 85, shortWidth: 0 }, { char: '$', width: 100, shortWidth: 0 }, { char: '%', width: 160, shortWidth: 0 }, { char: '"', width: 92, shortWidth: 0 }, { char: '"', width: 92, shortWidth: 0 }],

  textWidthHeavy: [{ char: ' ', width: 53, shortWidth: 0 }, { char: 'A', width: 142, shortWidth: 0 }, { char: 'B', width: 146, shortWidth: 0 }, { char: 'C', width: 151, shortWidth: 0 }, { char: 'D', width: 150, shortWidth: 0 }, { char: 'E', width: 136, shortWidth: 0 }, { char: 'F', width: 121, shortWidth: 0 }, { char: 'G', width: 156, shortWidth: 0 }, { char: 'H', width: 159, shortWidth: 0 }, { char: 'I', width: 73, shortWidth: 0 }, { char: 'J', width: 95, shortWidth: 0 }, { char: 'K', width: 138, shortWidth: 0 }, { char: 'L', width: 118, shortWidth: 0 }, { char: 'M', width: 186, shortWidth: 0 }, { char: 'N', width: 168, shortWidth: 0 }, { char: 'O', width: 158, shortWidth: 0 }, { char: 'P', width: 134, shortWidth: 0 }, { char: 'Q', width: 161, shortWidth: 0 }, { char: 'R', width: 148, shortWidth: 0 }, { char: 'S', width: 146, shortWidth: 0 }, { char: 'T', width: 118, shortWidth: 113 }, { char: 'U', width: 157, shortWidth: 0 }, { char: 'V', width: 133, shortWidth: 127 }, { char: 'W', width: 193, shortWidth: 196 }, { char: 'X', width: 130, shortWidth: 0 }, { char: 'Y', width: 128, shortWidth: 125 }, { char: 'Z', width: 119, shortWidth: 0 }, { char: 'a', width: 111, shortWidth: 104 }, { char: 'b', width: 117, shortWidth: 0 }, { char: 'c', width: 107, shortWidth: 0 }, { char: 'd', width: 119, shortWidth: 0 }, { char: 'e', width: 110, shortWidth: 103 }, { char: 'f', width: 79, shortWidth: 0 }, { char: 'g', width: 117, shortWidth: 110 }, { char: 'h', width: 119, shortWidth: 0 }, { char: 'i', width: 55, shortWidth: 0 }, { char: 'j', width: 71, shortWidth: 0 }, { char: 'k', width: 114, shortWidth: 0 }, { char: 'l', width: 63, shortWidth: 0 }, { char: 'm', width: 173, shortWidth: 0 }, { char: 'n', width: 119, shortWidth: 0 }, { char: 'o', width: 115, shortWidth: 107 }, { char: 'p', width: 120, shortWidth: 0 }, { char: 'q', width: 120, shortWidth: 0 }, { char: 'r', width: 80, shortWidth: 67 }, { char: 's', width: 100, shortWidth: 98 }, { char: 't', width: 84, shortWidth: 0 }, { char: 'u', width: 120, shortWidth: 107 }, { char: 'v', width: 107, shortWidth: 0 }, { char: 'w', width: 160, shortWidth: 154 }, { char: 'x', width: 110, shortWidth: 0 }, { char: 'y', width: 106, shortWidth: 104 }, { char: 'z', width: 93, shortWidth: 0 }, { char: '1', width: 84, shortWidth: 0 }, { char: '2', width: 125, shortWidth: 0 }, { char: '3', width: 136, shortWidth: 0 }, { char: '4', width: 138, shortWidth: 0 }, { char: '5', width: 130, shortWidth: 0 }, { char: '6', width: 129, shortWidth: 0 }, { char: '7', width: 107, shortWidth: 0 }, { char: '8', width: 138, shortWidth: 0 }, { char: '9', width: 129, shortWidth: 0 }, { char: '0', width: 145, shortWidth: 0 }, { char: ',', width: 56, shortWidth: 0 }, { char: '.', width: 56, shortWidth: 0 }, { char: "'", width: 41, shortWidth: 0 }, { char: ':', width: 56, shortWidth: 0 }, { char: '•', width: 56, shortWidth: 0 }, { char: '、', width: 53, shortWidth: 0 }, { char: '-', width: 71, shortWidth: 0 }, { char: '&', width: 126, shortWidth: 0 }, { char: '(', width: 115, shortWidth: 0 }, { char: ')', width: 115, shortWidth: 0 }, { char: '/', width: 88, shortWidth: 0 }, { char: '$', width: 100, shortWidth: 0 }, { char: '%', width: 160, shortWidth: 0 }, { char: '"', width: 92, shortWidth: 0 }, { char: '"', width: 92, shortWidth: 0 }],

  textFont: ['TransportMedium', 'TransportHeavy'],



  textPanelInit: function (editingTextObject = null) {
    tabNum = 2;
    var parent = GeneralHandler.PanelInit();
    if (parent) {
      // Create a container for basic text parameters
      const basicParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      GeneralHandler.createInput('input-xHeight', 'x Height', basicParamsContainer, 100, editingTextObject ? FormTextAddComponent.liveUpdateText : FormTextAddComponent.TextInputHandler, 'input');
      GeneralHandler.createToggle('Message Colour', ['Black', 'White'], basicParamsContainer, 'White', editingTextObject ? FormTextAddComponent.liveUpdateText : FormTextAddComponent.TextInputHandler);

      // Create a container for text content and font
      const textContentContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      const textInput = GeneralHandler.createInput('input-text', 'Add Text', textContentContainer, '', editingTextObject ? FormTextAddComponent.liveUpdateText : FormTextAddComponent.TextInputHandler, 'input');
      const fontToggle = GeneralHandler.createToggle('Text Font', FormTextAddComponent.textFont, textContentContainer, 'TransportMedium', editingTextObject ? FormTextAddComponent.liveUpdateText : FormTextAddComponent.TextInputHandler);


    }
  },

  /**
   * Live update text as the user types or changes parameters
   */
  liveUpdateText: function () {
    canvas.off('mouse:move', FormTextAddComponent.TextOnMouseMove);
    canvas.off('mouse:down', FormTextAddComponent.TextOnMouseClick);
    canvas.on('mouse:down', FormTextAddComponent.EditOnMouseClick);

    const textObj = canvas.getActiveObject();
    if (!textObj || textObj.functionalType !== 'Text') return;
    const newText = document.getElementById('input-text').value;
    const newXHeight = parseInt(document.getElementById('input-xHeight').value);
    const newFont = document.getElementById('Text Font-container').selected.getAttribute('data-value');
    const newColor = document.getElementById('Message Colour-container').selected.getAttribute('data-value');

    // Only call updateText if there are actual changes
    if (
      newText !== textObj.text ||
      newXHeight !== textObj.xHeight ||
      newFont !== textObj.font ||
      newColor !== textObj.color
    ) {
      textObj.updateText(newText, newXHeight, newFont, newColor);
    }
  },



  TextHandlerOff: function () {
    cursor.forEachObject(function (o) { cursor.remove(o) });
    canvas.off('mouse:move', FormTextAddComponent.TextOnMouseMove);
    canvas.off('mouse:down', FormTextAddComponent.TextOnMouseClick);
    canvas.off('mouse:down', FormTextAddComponent.EditOnMouseClick);
    document.addEventListener('keydown', ShowHideSideBarEvent);
    document.removeEventListener('keydown', FormTextAddComponent.cancelInput);

    // Remove input event listeners
    const textInput = document.getElementById('input-text');
    if (textInput) {
      textInput.removeEventListener('input', FormTextAddComponent.liveUpdateText);
    }

    const xHeightInput = document.getElementById('input-xHeight');
    if (xHeightInput) {
      xHeightInput.removeEventListener('input', FormTextAddComponent.liveUpdateText);
    }

    const colorButtons = document.querySelectorAll('#Message\\ Colour-container .toggle-button');
    colorButtons.forEach(button => {
      button.removeEventListener('click', FormTextAddComponent.liveUpdateText);
    });

    const fontButtons = document.querySelectorAll('#Text\\ Font-container .toggle-button');
    fontButtons.forEach(button => {
      button.removeEventListener('click', FormTextAddComponent.liveUpdateText);
    });


    // Restore mouse events for creating new text 
    if (tabNum === 2) { // Only if we're still on text panel
      canvas.on('mouse:move', FormTextAddComponent.TextOnMouseMove);
      canvas.on('mouse:down', FormTextAddComponent.TextOnMouseClick);
    }

    canvas.renderAll();
  },

  cancelInput: function (event) {
    if (event.key === 'Escape') {
      document.getElementById('input-text').value = '';
      cursor.forEachObject(function (o) { cursor.remove(o) });
    }
  },

  TextInputHandler: function (event, options = null) {
    document.removeEventListener('keydown', ShowHideSideBarEvent);
    document.addEventListener('keydown', FormTextAddComponent.cancelInput);

    cursor.forEachObject(function (o) { cursor.remove(o) });
    cursor.txtChar = [];
    cursor.text = '';
    cursor.shapeMeta = null;

    const txt = options ? options.text : document.getElementById('input-text').value;
    const xHeight = options ? options.xHeight : parseInt(document.getElementById('input-xHeight').value);
    const font = options ? options.font : document.getElementById('Text Font-container').selected.getAttribute('data-value');
    const color = options ? options.color : document.getElementById('Message Colour-container').selected.getAttribute('data-value');


    // Create a cursor TextObject for new text creation
    const textObject = new TextObject({
      text: txt,
      xHeight: xHeight,
      font: font,
      color: color,
      left: cursor.left,
      top: cursor.top,
      isCursor: true
    });

    // Add the textObject to cursor
    cursor.add(textObject);

    // Update cursor properties
    cursor.text = txt;
    cursor.xHeight = xHeight;
    cursor.font = font;
    cursor.color = color;

    canvas.renderAll();
  },

  TextOnMouseMove: function (event) {
    var pointer = canvas.getPointer(event.e);
    cursor.set({
      left: pointer.x,
      top: pointer.y
    });
    canvas.renderAll();
  },

  TextOnMouseClick: function (event, options = null) {
    if (options) {
      cursor.set({
        left: options.left,
        top: options.top,
        text: options.text,
        xHeight: options.xHeight,
        font: options.font,
        color: options.color
      });
      textValue = options.text;
      xHeight = options.xHeight;
      eventButton = 0;
    } else {
      textValue = document.getElementById("input-text").value;
      xHeight = parseInt(document.getElementById('input-xHeight').value);
      color = document.getElementById('Message Colour-container').selected.getAttribute('data-value');
      font = document.getElementById('Text Font-container').selected.getAttribute('data-value');
      eventButton = event.e.button;
    }


    // For new text creation
    if (textValue !== '' && eventButton === 0) {
      // Create a real TextObject for the canvas
      const textObject = new TextObject({
        text: cursor.text,
        xHeight: cursor.xHeight,
        font: cursor.font,
        color: cursor.color,
        left: cursor.left,
        top: cursor.top
      });

      // If we have an active input element, refresh the cursor display
      if (document.getElementById('input-text')) {
        FormTextAddComponent.TextInputHandler(null, {
          text: cursor.text,
          xHeight: cursor.xHeight,
          font: cursor.font,
          color: cursor.color
        });
      }

      cursor.text = '';
      canvas.renderAll();
    }
  },

  EditOnMouseClick: function (event) {
    document.getElementById('input-text').value = '';
    FormTextAddComponent.textPanelInit();

  }
}

/* Draw Map Panel */
let FormDrawMapComponent = {
  MapType: ['Main Line', 'Conventional Roundabout', 'Spiral Roundabout',],
  EndShape: ['Arrow', 'Stub'],
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
      GeneralHandler.createToggle('Main Road Type', FormDrawMapComponent.MapType, MainRoadParamsContainer, 'Main Line', drawMainRoadOnCursor)
      const drawMapButton = GeneralHandler.createButton('button-DrawMap', 'Draw Main Road Symbol', MainRoadParamsContainer, 'input', drawMainRoadOnCursor, 'click');

      GeneralHandler.createInput('root-length', 'Main Road Root Length', MainRoadParamsContainer, 7, drawMainRoadOnCursor, 'input')
      GeneralHandler.createInput('tip-length', 'Main Road Tip Length', MainRoadParamsContainer, 12, drawMainRoadOnCursor, 'input')
      GeneralHandler.createInput('main-width', 'Main Road Width', MainRoadParamsContainer, 6, drawMainRoadOnCursor, 'input')
      GeneralHandler.createToggle(`Main Road Shape`, FormDrawMapComponent.EndShape, MainRoadParamsContainer, 'Arrow', drawMainRoadOnCursor)

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

/* Draw Symbol Panel */
let FormDrawAddComponent = {
  symbolAngle: 0,
  drawPanelInit: async function () {
    tabNum = 1
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      // Create a container for basic symbol parameters
      var basicParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      GeneralHandler.createInput('input-xHeight', 'x Height', basicParamsContainer, 100, null, 'input')
      GeneralHandler.createToggle('Message Colour', ['Black', 'White'], basicParamsContainer, 'White', FormDrawAddComponent.addAllSymbolsButton)

      // Create a container for angle controls
      var angleControlContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      // Replace slider with two rotate buttons:
      var angleContainer = GeneralHandler.createNode("div", { 'class': 'angle-picker-container' }, angleControlContainer);

      var btnRotateLeft = GeneralHandler.createButton(`rotate-left`, '<i class="fa-solid fa-rotate-left"></i>', angleContainer, null, FormDrawAddComponent.setAngle, 'click')

      var btnRotateRight = GeneralHandler.createButton(`rotate-right`, '<i class="fa-solid fa-rotate-right"></i>', angleContainer, null, FormDrawAddComponent.setAngle, 'click')

      var angleDisplay = GeneralHandler.createNode("div", { 'id': 'angle-display', 'class': 'angle-display' }, angleContainer);
      angleDisplay.innerText = FormDrawAddComponent.symbolAngle + '°';

      FormDrawAddComponent.addAllSymbolsButton()
    }
  },

  addAllSymbolsButton: function () {
    const parent = document.getElementById("input-form");
    const color = document.getElementById('Message Colour-container').selected.getAttribute('data-value')
    // Clear any existing symbol containers
    const existingSymbolContainers = parent.querySelectorAll('.symbol-container');
    if (existingSymbolContainers.length > 0) {
      existingSymbolContainers.forEach(container => {
        container.remove();
      });
    }
    Object.keys(symbolsTemplate).forEach(async (symbol) => {
      const svg = await FormDrawAddComponent.createButtonSVG(symbol, 5, color)
      GeneralHandler.createSVGButton(`button-${symbol}`, svg, parent, 'symbol', FormDrawAddComponent.drawSymbolOnCursor, 'click')
    })
  },

  setAngle: function (event) {
    if (event.currentTarget.id.search('left') > -1) {
      FormDrawAddComponent.symbolAngle = FormDrawAddComponent.symbolAngle - 45
    } else {
      FormDrawAddComponent.symbolAngle = FormDrawAddComponent.symbolAngle + 45
    }
    FormDrawAddComponent.symbolAngle = FormDrawAddComponent.symbolAngle > 90 ? -90 : FormDrawAddComponent.symbolAngle
    FormDrawAddComponent.symbolAngle = FormDrawAddComponent.symbolAngle < -90 ? +90 : FormDrawAddComponent.symbolAngle
    // Handle the angle selection
    document.getElementById('angle-display').innerText = FormDrawAddComponent.symbolAngle + '°';
    if (cursor._objects.length) {
      FormDrawAddComponent.drawSymbolOnCursor(null, { symbol: cursor.symbol, xHeight: cursor.xHeight })
    }
    // You can add your logic here to apply the angle to the shape
  },

  DrawHandlerOff: function (event) {
    cursor.forEachObject(function (o) { cursor.remove(o) })
    canvas.off('mouse:move', FormDrawAddComponent.DrawOnMouseMove)
    canvas.off('mouse:down', FormDrawAddComponent.SymbolonMouseClick)
    canvas.renderAll()
  },

  DrawOnMouseMove: function (event) {
    var pointer = canvas.getPointer(event.e);
    var posx = pointer.x;
    var posy = pointer.y;
    cursor.set({
      left: posx + cursorOffset.x,
      top: posy + cursorOffset.y,
    });
    canvas.renderAll();
  },

  SymbolonMouseClick: function (event, options = null) {
    //permanent cursor object 
    if (options) {
      cursor.set(
        { left: options.left, top: options.top }
      )
      var pointer = { x: options.left, y: options.top }
      eventButton = 0
    } else {
      eventButton = event.e.button
      var pointer = canvas.getPointer(event.e);
    }
    if (eventButton === 0 && cursor._objects.length) {
      var posx = pointer.x;
      var posy = pointer.y;
      var xHeight = parseInt(document.getElementById('input-xHeight').value)
      var color = document.getElementById('Message Colour-container').selected.getAttribute('data-value')
      const arrowOptions1 = { x: posx, y: posy, length: xHeight / 4, angle: FormDrawAddComponent.symbolAngle, color: color, };
      drawLabeledSymbol(cursor.symbol, arrowOptions1);
    }
  },

  createButtonSVG: async (symbolType, length, color = 'white') => {
    const symbolData = calcSymbol(symbolType, length, color);

    let pathData = await vertexToPath(symbolData, color);

    const svgWidth = 100;
    const svgHeight = 100;

    // Calculate the bounding box of the path
    const tempPath = new fabric.Path(pathData, { strokeWidth: 0 });
    let symbolSize = { width: tempPath.width, height: tempPath.height, left: tempPath.left, top: tempPath.top };
    // override the err width and height of symbol with circular border
    if (symbolType === 'MTR') {
      symbolSize.width = 130;
    }
    if (symbolType === 'Hospital') {
      symbolSize.width = color == 'White' ? 80 : 90;
    }
    const scaleX = svgWidth / symbolSize.width;
    const scaleY = svgHeight / symbolSize.height;
    const scale = Math.min(scaleX, scaleY);

    // Calculate the translation to center the path
    const translateX = (svgWidth - symbolSize.width * scale) / 2 - symbolSize.left * scale;
    const translateY = (svgHeight - symbolSize.height * scale) / 2 - symbolSize.top * scale;

    pathData = pathData.replace(/<svg>/g, '<svg style="width:100;height:100;">')
    pathData = pathData.replace(/<path/g, `<path transform="translate(${translateX}, ${translateY}) scale(${scale})"`);
    return pathData;

  },
  drawSymbolOnCursor: async (event, options = null) => {
    canvas.off('mouse:down', FormDrawAddComponent.SymbolonMouseClick)
    canvas.on('mouse:move', FormDrawAddComponent.DrawOnMouseMove)
    canvas.on('mouse:down', FormDrawAddComponent.SymbolonMouseClick)

    cursor.forEachObject(function (o) { cursor.remove(o) })
    cursor.txtChar = []
    cursor.text = ''

    if (options) {
      symbol = options.symbol
      var xHeight = options.xHeight
      var color = options.color
    }
    else {
      symbol = event.currentTarget.id.replace('button-', '')
      var xHeight = parseInt(document.getElementById('input-xHeight').value)
      var color = document.getElementById('Message Colour-container').selected.getAttribute('data-value')
    }


    let symbolObject = calcSymbol(symbol, xHeight / 4, color)

    const arrowOptions1 = {
      left: 0,
      top: 0,
      fill: color,
      angle: FormDrawAddComponent.symbolAngle,
      // originX: 'center',
      objectCaching: false,
      strokeWidth: 0
    }
    //cursor.shapeMeta = symbolObject
    cursor.symbol = symbol

    Polygon1 = new GlyphPath()
    await Polygon1.initialize(symbolObject, arrowOptions1)



    Polygon1.symbol = symbol
    Polygon1.xHeight = xHeight
    Polygon1.color = color

    symbolOffset = getInsertOffset(symbolObject)
    cursorOffset.x = symbolOffset.left
    cursorOffset.y = symbolOffset.top

    cursor.add(Polygon1)
    Polygon1.setCoords();

    document.removeEventListener('keydown', ShowHideSideBarEvent);
    document.addEventListener('keydown', FormDrawAddComponent.cancelDraw)

    canvas.renderAll();


  },

  cancelDraw: (event) => {
    if (event.key === 'Escape') {
      cursor.forEachObject(function (o) { cursor.remove(o) })
      canvas.off('mouse:move', FormTextAddComponent.TextOnMouseMove)
      canvas.off('mouse:down', FormDrawAddComponent.SymbolonMouseClick)
      canvas.requestRenderAll()
      setTimeout(() => {
        document.addEventListener('keydown', ShowHideSideBarEvent);
      }, 1000); // Delay in milliseconds (e.g., 1000ms = 1 second)
    }
  },

}

/* Border Panel */
let FormBorderWrapComponent = {
  BorderPanelInit: function () {
    tabNum = 3
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      // Create a container for border parameters
      var borderParamsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      GeneralHandler.createInput('input-xHeight', 'x Height', borderParamsContainer, 100)

      // Create a container for border type selection with SVG buttons
      var borderTypeContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      const borderTypeHeader = GeneralHandler.createNode("div", { 'class': 'placeholder' }, borderTypeContainer);
      borderTypeHeader.innerHTML = "Select Border Type";

      // Create a mock bbox for the border preview
      const xHeight = 20; // Small size for the preview
      const bbox = {
        left: 0,
        top: 0,
        width: 160,
        height: 100
      };

      // Create SVG buttons for each border type
      Object.keys(BorderTypeScheme).forEach(async (borderType) => {
        const shapeMeta = BorderTypeScheme[borderType](xHeight, bbox, );
        const svg = await FormBorderWrapComponent.createBorderSVG(shapeMeta,)
        GeneralHandler.createSVGButton(`button-${borderType}`, svg, parent, 'border', FormDrawAddComponent.BorderCreateHandler, 'click')
      });

      // Add a hidden input to store the selected border type
      const hiddenInput = GeneralHandler.createNode("input", { 'type': 'hidden', 'id': 'input-type', 'value': Object.keys(BorderTypeScheme)[0] }, borderTypeContainer);

      // Color scheme selection remains as dropdown
      GeneralHandler.createSelect('input-color', 'Select Color Scheme', Object.keys(BorderColorScheme), borderParamsContainer, null, '', '', 'select')

      // Create a container for border actions
      var borderActionsContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      GeneralHandler.createButton('input-border', 'Select Objects for border', borderActionsContainer, 'input', FormBorderWrapComponent.BorderCreateHandler, 'click')
      GeneralHandler.createButton('input-HDivider', 'Add stack border divider', borderActionsContainer, 'input', FormBorderWrapComponent.StackDividerHandler, 'click')
      GeneralHandler.createButton('input-VDivider', 'Add gantry border divider', borderActionsContainer, 'input', FormBorderWrapComponent.GantryDividerHandler, 'click')
    }
  },

  createBorderSVG: async (shapeMeta,  color = 'white') => {

    let pathData = await vertexToPath(shapeMeta, color);

    const svgWidth = 160;
    const svgHeight = 100;

    // Calculate the bounding box of the path
    const tempPath = new fabric.Path(pathData, { strokeWidth: 0 });
    let symbolSize = { width: tempPath.width, height: tempPath.height, left: tempPath.left, top: tempPath.top };

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

  BorderCreateHandler: async function () {
    selectObjectHandler('Select shape to calculate border width', function (widthObjects, options, widthText) {
      selectObjectHandler('Select shape to calculate border height', function (heightObjects, options, heightText) {
        BorderUtilities.BorderGroupCreate(heightObjects, widthObjects, widthText, heightText)
      })
    })
  },

  StackDividerHandler: function () {
    selectObjectHandler('Select object above divider', function (aboveObject) {
      selectObjectHandler('Select object below divider', function (belowObject) {
        BorderUtilities.HDividerCreate(aboveObject, belowObject)
      })
    })
  },

  GantryDividerHandler: function () {
    selectObjectHandler('Select object left to divider', function (leftObject) {
      selectObjectHandler('Select object right to divider', function (rightObject) {
        BorderUtilities.VDividerCreate(leftObject, rightObject)
      })
    })
  }
}

/* Debug Panel */
let FormDebugComponent = {
  // TODO: Add General settings : e.g. turn off text borders, change background color, show grid, etc.
  // Export settings for canvas objects
  exportSettings: {
    filename: 'traffic-sign-export',
    quality: 1.0,
    multiplier: 1.0
  },

  createExportPanel: function (parent) {
    // Create container for export options
    const exportContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
    const exportHeader = GeneralHandler.createNode("div", { 'class': 'section-header' }, exportContainer);
    exportHeader.innerHTML = "Export Options";

    // Create filename input
    const filenameInput = GeneralHandler.createInput('export-filename', 'Filename', exportContainer,
      FormDebugComponent.exportSettings.filename, (e) => {
        FormDebugComponent.exportSettings.filename = e.target.value;
      }, 'input');

    // Create quality selector for raster formats
    const qualitySelect = GeneralHandler.createSelect('export-quality', 'Quality',
      ['1.0', '0.9', '0.8', '0.7', '0.5'], exportContainer, '1.0',
      (e) => {
        FormDebugComponent.exportSettings.quality = parseFloat(e.target.value);
      });

    // Create scale multiplier
    const scaleInput = GeneralHandler.createInput('export-scale', 'Scale Multiplier', exportContainer,
      FormDebugComponent.exportSettings.multiplier, (e) => {
        FormDebugComponent.exportSettings.multiplier = parseFloat(e.target.value);
      }, 'input');

    // Create export buttons
    const buttonContainer = GeneralHandler.createNode("div", { 'class': 'export-buttons-container' }, exportContainer);

    // PNG Export
    GeneralHandler.createButton('export-png', 'Export as PNG', buttonContainer, 'export',
      FormDebugComponent.exportToPNG, 'click');

    // SVG Export
    GeneralHandler.createButton('export-svg', 'Export as SVG', buttonContainer, 'export',
      FormDebugComponent.exportToSVG, 'click');

    // PDF Export
    GeneralHandler.createButton('export-pdf', 'Export as PDF', buttonContainer, 'export',
      FormDebugComponent.exportToPDF, 'click');
  },

  exportToPNG: function () {
    const options = {
      format: 'png',
      quality: FormDebugComponent.exportSettings.quality,
      multiplier: FormDebugComponent.exportSettings.multiplier
    };

    const dataURL = canvas.toDataURL(options);
    const link = document.createElement('a');
    link.download = `${FormDebugComponent.exportSettings.filename}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },

  exportToSVG: function () {
    const svgData = canvas.toSVG();
    const blob = new Blob([svgData], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${FormDebugComponent.exportSettings.filename}.svg`;
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  exportToPDF: function () {
    // Check if jsPDF is available
    if (typeof jsPDF === 'undefined') {
      // Load jsPDF dynamically if not available
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
      script.onload = createPDF;
      document.head.appendChild(script);
    } else {
      createPDF();
    }

    function createPDF() {
      const imgData = canvas.toDataURL('image/png', FormDebugComponent.exportSettings.quality);
      const pdf = new jspdf.jsPDF({
        orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height]
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      pdf.save(`${FormDebugComponent.exportSettings.filename}.pdf`);
    }
  },
  DebugPanelInit: function () {
    tabNum = 5
    var parent = GeneralHandler.PanelInit()
    if (parent) {
      // Create export panel first
      FormDebugComponent.createExportPanel(parent);

      // Add a separator between export panel and debug info
      var separatorDiv = GeneralHandler.createNode("div", { 'class': 'panel-separator' }, parent);
      separatorDiv.style.margin = "20px 0";
      separatorDiv.style.borderBottom = "1px solid #555";

      // Create a container for debug info
      var debugInfoContainer = GeneralHandler.createNode("div", { 'class': 'input-group-container' }, parent);
      FormDebugComponent.createDebugInfoPanel(debugInfoContainer);

      // Update the sidebar when an object is selected
      canvas.on('selection:created', FormDebugComponent.selectionListener);
      canvas.on('selection:updated', FormDebugComponent.selectionListener);
      canvas.on('object:modified', FormDebugComponent.selectionListener);
      // Clear the sidebar when no object is selected
      canvas.on('selection:cleared', FormDebugComponent.clearSelectionListener);
      if (canvas.getActiveObject()) {
        FormDebugComponent.updateDebugInfo(canvas.getActiveObjects());
      }
    }
  },
  selectionListener: function (event) {
    let selectedObject = null
    if (event.target) {
      selectedObject = event.target;
    } else {
      selectedObject = event.selected[0];
    }
    FormDebugComponent.updateDebugInfo(selectedObject);
  },
  clearSelectionListener: function (event) {
    const debugInfoPanel = document.getElementById('debug-info-panel');
    if (debugInfoPanel) {
      debugInfoPanel.innerHTML = '';
      const div = document.createElement('div');
      div.innerText = 'Select Object for Info';
      debugInfoPanel.appendChild(div);
    }
  },
  createDebugInfoPanel: function (parent) {
    const debugInfoPanel = document.createElement('div');
    debugInfoPanel.id = 'debug-info-panel';
    parent.appendChild(debugInfoPanel);
    const div = document.createElement('div');
    div.innerText = 'Select Object for Info';
    debugInfoPanel.appendChild(div);
  },

  updateDebugInfo: function (objects) {
    const debugInfoPanel = document.getElementById('debug-info-panel');
    if (debugInfoPanel) {
      objects.length ? object = objects[0] : object = objects
      debugInfoPanel.innerHTML = ''; // Clear previous info

      const div = document.createElement('div');
      div.style.fontWeight = 'bold'; // Make text bold
      div.style.textDecoration = 'underline'; // Add underline
      div.innerText = `${object._showName}`;
      debugInfoPanel.appendChild(div);

      point = object.getEffectiveCoords()
      const properties = [
        { label: 'Top', value: Math.round(object.top) },
        { label: 'Left', value: Math.round(object.left) },
        { label: 'Width', value: Math.round(object.width) },
        { label: 'Height', value: Math.round(object.height) },
        { label: 'Effective Position', value: `x: ${Math.round(point[0].x)}, y: ${Math.round(point[0].y)}` },
        { label: 'Effective Width', value: Math.round(point[1].x - point[0].x) },
        { label: 'Effective Height', value: Math.round(point[2].y - point[0].y) },

      ];

      properties.forEach(prop => {
        const div = document.createElement('div');
        div.innerText = `${prop.label}: ${prop.value}`;
        debugInfoPanel.appendChild(div);
      });
    }
  },

  DebugHandlerOff: function (event) {
    canvas.off('selection:created', this.selectionListener)
    canvas.off('selection:updated', this.selectionListener)
    canvas.off('selection:cleared', this.clearSelectionListener)
  },
};

let CanvasObjectInspector = {
  createObjectListPanelInit: function () {
    const objectListPanel = document.getElementById('objectListPanel');

    // Clear the existing content
    objectListPanel.innerHTML = '';

    // Loop through the CanvasObject array and append object names to the list
    canvasObject.forEach((obj, index) => {
      const div = document.createElement('div');
      div.className = 'object-list-item';
      div.innerText = obj._showName;
      div.id = `Group (${index})`;
      div.addEventListener('click', () => {
        // Remove 'selected' class from all items
        document.querySelectorAll('.object-list-item').forEach(item => item.classList.remove('selected'));
        // Add 'selected' class to the clicked item
        div.classList.add('selected');
        canvas.setActiveObject(obj);
        canvas.renderAll();
        // Scroll the parent container to the clicked item
        div.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
      objectListPanel.appendChild(div);
    });
  },

  SetActiveObjectList: function (setActive) {
    const index = canvasObject.indexOf(setActive);
    // Remove 'selected' class from all items
    document.querySelectorAll('.object-list-item').forEach(item => {
      if (item.id == `Group (${index})`) {
        item.classList.add('selected');
        // Scroll the parent container to the active item
        item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        item.classList.remove('selected');
      }
    });
  }
}

// Define the event handler function
function ShowHideSideBarEvent(e) {
  switch (e.keyCode) {
    case 27: // esc
      GeneralHandler.ShowHideSideBar(e);
      break;
  }
}

window.onload = () => {
  document.getElementById('show_hide').onclick = GeneralHandler.ShowHideSideBar;
  document.getElementById('btn_draw').onclick = FormDrawAddComponent.drawPanelInit
  document.getElementById('btn_text').onclick = FormTextAddComponent.textPanelInit
  document.getElementById('btn_border').onclick = FormBorderWrapComponent.BorderPanelInit
  document.getElementById('btn_map').onclick = FormDrawMapComponent.drawMapPanelInit
  document.getElementById('btn_debug').onclick = FormDebugComponent.DebugPanelInit
  //canvas.on('object:added', CanvasObjectInspector.createObjectListPanel);
  //canvas.on('object:removed', CanvasObjectInspector.createObjectListPanel);
  //canvas.on('object:modified', CanvasObjectInspector.createObjectListPanel);
  FormDrawMapComponent.drawMapPanelInit()
  document.addEventListener('keydown', ShowHideSideBarEvent);
}