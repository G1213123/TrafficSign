// js/sidebar/domHelpers.js
export function createNode(type, attribute, parent, callback, event){
  var node = document.createElement(type);
  for (const [key, value] of Object.entries(attribute)) {
    node.setAttribute(key, value)
  }
  parent.appendChild(node)
  if (callback) {
    node.addEventListener(event, callback)
  }
  return node;
}

export function createButton(name, labelTxt, parent, container = 'input', callback = null, event = null) {
  if (container) {
    var inputContainer = createNode('div', { 'class': `${container}-container` }, parent);
  }
    var input = createNode("button", { 'type': 'button', 'class': `${container ? container : name}-button`, 'id': name, 'placeholder': ' ' }, inputContainer ? inputContainer : parent, callback, event)
    input.innerHTML = labelTxt
  return input;
}

export function createSVGButton(name, svg, parent, container = "input", callback = null, event = null){
  if (container) {
    var inputContainer = createNode('div', { 'class': `${container}-container` }, parent);
  }
  var input = createNode('button', { 'type': 'button', 'class': `${container ? container : name}-button`, 'id': name, 'placeholder': ' ' }, inputContainer ? inputContainer : parent, callback, event);

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

  return input;
}

export function createInput(name, labelTxt, parent, defaultV = null, callback = null, event = null) {
  var inputContainer = createNode('div', { 'class': 'input-container' }, parent);
  var label = createNode('div', { 'class': 'placeholder', 'for': name }, inputContainer);
  var input = createNode('input', { 'type': 'text', 'class': 'input', 'id': name, 'placeholder': ' ' }, inputContainer, callback, event);
    label.innerHTML = labelTxt
    defaultV ? input.value = defaultV : input.value = ''
  return input;
}

export function createSelect(name, labelTxt, options, parent, defaultV = null, callback = null, event = 'change') {
    var inputContainer = createNode("div", { 'class': 'input-container' }, parent)
    var label = createNode("div", { 'class': 'placeholder', 'for': name }, inputContainer)
    var input = createNode("select", { 'class': 'input', 'id': name, 'placeholder': ' ' }, inputContainer, callback, event)
  label.innerHTML = labelTxt;
  for (var i = 0; i < options.length; i++) {
    var option = document.createElement('option');
    option.value = options[i];
    option.text = options[i];
    input.appendChild(option);
  }
  if (defaultV !== null) {
    input.value = defaultV;
  }
  return input;
}

export function createToggle(name, options, parent, defaultSelected = null, callback = null) {
  // Create a container for the toggle including its label
  var inputContainer = createNode('div', { 'class': 'input-container' }, parent);


  // Create the label
  var label = createNode('div', { 'class': 'placeholder', 'for': name }, inputContainer);
  label.innerHTML = name;

  // Create a container for the toggle buttons
  var toggleContainer = createNode('div', { 'class': 'toggle-container', 'id': name + '-container' }, inputContainer);

  // Keep track of the buttons to manage their state
    let toggleButtons = [];

  // Create a button for each option
    options.forEach((option, index) => {
      let buttonId = `${name}-${index}`;
      let button = createNode("button", {
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
}