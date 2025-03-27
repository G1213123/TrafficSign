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
    if (typeof FormTextAddComponent !== 'undefined') {
      FormTextAddComponent.TextHandlerOff()
    }
    if (typeof FormBorderAddComponent !== 'undefined') {
      FormDrawAddComponent.DrawHandlerOff()
    }
    if (tabNum != 5) {
      if (typeof FormDebugComponent !== 'undefined') {
        FormDebugComponent.DebugHandlerOff()
      }
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

  createSelect: function (name, labelTxt, options, parent, defaultV = null, callback = null, event = 'change') {
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

// Export the GeneralHandler for use in other files