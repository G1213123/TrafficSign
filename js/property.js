// Add handler for 'Property' context-menu action
const propertyMenuItem = document.getElementById('property');
const contextMenu = document.getElementById('context-menu');

propertyMenuItem.addEventListener('click', function (e) {
  e.preventDefault();
  contextMenu.style.display = 'none';
  const obj = contextMenu.selectedArrow;
  showPropertyPanel(obj);
});


// Function to populate and display the property panel
function showPropertyPanel(object) {
  const panel = document.getElementById('property-panel');
  panel.innerHTML = '';
  // Close button
  const closeBtn = document.createElement('button');
  closeBtn.className = 'property-close';
  closeBtn.innerHTML = '\u00d7';
  closeBtn.addEventListener('click', () => { panel.style.display = 'none'; });
  panel.appendChild(closeBtn);

  panel.style.display = 'block';

  // Create styled container for properties
  const container = document.createElement('div');
  container.className = 'input-group-container';
  panel.appendChild(container);

    // Title
  const title = document.createElement('div');
  title.className = 'property-title';
  title.innerText = object._showName || object.type || 'Object Properties';
  container.appendChild(title);

  const infoPanel = document.createElement('div');
  infoPanel.id = 'property-info-panel';
  infoPanel.innerText = 'Select Object for Info';
  container.appendChild(infoPanel);

  // Gather properties
  let properties = [];
  if (typeof object.getEffectiveCoords === 'function') {
    const coords = object.getEffectiveCoords();
    properties = [
      { label: 'Top', value: Math.round(object.top) },
      { label: 'Left', value: Math.round(object.left) },
      { label: 'Width', value: Math.round(object.width) },
      { label: 'Height', value: Math.round(object.height) },
      { label: 'Effective X', value: Math.round(coords[0].x) },
      { label: 'Effective Y', value: Math.round(coords[0].y) }
    ];
  } else {
    properties = [
      { label: 'Top', value: Math.round(object.top) },
      { label: 'Left', value: Math.round(object.left) },
      { label: 'Width', value: Math.round(object.width || 0) },
      { label: 'Height', value: Math.round(object.height || 0) }
    ];
  }

  // Additional custom properties
  if (object.functionalType === 'Text') {
    properties.push({ label: 'Text', value: object.text || '' });
    properties.push({ label: 'Font', value: object.font || '' });
    properties.push({ label: 'Size', value: object.xHeight || '' });
    properties.push({ label: 'Color', value: object.color || '' });
  } else if (object.functionalType === 'Symbol') {
    properties.push({ label: 'Symbol Type', value: object.symbol });
    properties.push({ label: 'Size', value: object.xHeight });
    properties.push({ label: 'Color', value: object.color });
    properties.push({ label: 'Angle', value: object.symbolAngle });
  }

  // Render properties into styled panel
  infoPanel.innerHTML = '';
  properties.forEach(prop => {
    const div = document.createElement('div');
    div.className = 'property-item';
    div.innerText = `${prop.label}: ${prop.value}`;
    infoPanel.appendChild(div);
  });
}

export { showPropertyPanel };