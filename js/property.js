import { CanvasGlobals } from './canvas.js';

// Add handler for 'Property' context-menu action
const propertyMenuItem = document.getElementById('property');
const contextMenu = document.getElementById('context-menu');

propertyMenuItem.addEventListener('click', function (e) {
  e.preventDefault();
  contextMenu.style.display = 'none';
  const obj = contextMenu.selectedArrow;
  showPropertyPanel(obj);
});

// Initialize property panel based on canvas selection events
CanvasGlobals.canvas.on('selection:created', handleSelection);
CanvasGlobals.canvas.on('selection:updated', handleSelection);
CanvasGlobals.canvas.on('object:modified', handleSelection);
//CanvasGlobals.canvas.on('selection:cleared', handleClear);

function handleSelection(event) {
  const panel = document.getElementById('property-panel');
  // Only update panel if it was opened via context-menu
  if (panel.style.display !== 'block') return;
  const obj = event.target || (Array.isArray(event.selected) ? event.selected[0] : null);
  if (obj) showPropertyPanel(obj);
}

function handleClear() {
  const panel = document.getElementById('property-panel');
  panel.style.display = 'none';
  panel.innerHTML = '';
}

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

  // Title
  const title = document.createElement('div');
  title.className = 'property-title';
  title.innerText = object._showName || object.type || 'Object Properties';
  panel.appendChild(title);

  // Helper to render a category box
  function renderCategory(name, props) {
    if (!props.length) return;
    const box = document.createElement('div');
    box.className = 'input-group-container';
    const header = document.createElement('div');
    header.className = 'property-title';
    header.innerText = name;
    box.appendChild(header);
    props.forEach(prop => {
      const item = document.createElement('div');
      item.className = 'property-item';
      item.innerText = `${prop.label}: ${prop.value}`;
      box.appendChild(item);
    });
    panel.appendChild(box);
  }

  // Prepare Geometry properties
  const geometryProps = [
    { label: 'Left', value: Math.round(object.left) },
    { label: 'Top', value: Math.round(object.top) },
    { label: 'Right', value: Math.round(object.left + object.width) },
    { label: 'Bottom', value: Math.round(object.top + object.height) },
    { label: 'Width', value: Math.round(object.width || 0) },
    { label: 'Height', value: Math.round(object.height || 0) }
  ];

  // Prepare Basic properties (xHeight, Color)
  const basicProps = [];
  if (object.xHeight !== undefined) basicProps.push({ label: 'xHeight', value: object.xHeight });
  if (object.color !== undefined) basicProps.push({ label: 'Color', value: object.color });

  // Prepare special properties
  let specialProps = [];
  switch (object.functionalType) {
    case 'Text':
      specialProps = [
        { label: 'Text', value: object.text },
        { label: 'Font', value: object.font }
      ];
      break;
    case 'Symbol':
      specialProps = [
        { label: 'Symbol Type', value: object.symbol },
        { label: 'Angle', value: object.symbolAngle }
      ];
      break;
    case 'MainRoad':
      specialProps = [
        { label: 'Road Type', value: object.roadType },
        { label: 'Root Length', value: object.rootLength },
        { label: 'Tip Length', value: object.tipLength },
        //{ label: 'RA Feature', value: object.RAfeature },
        { label: 'Side Roads', value: object.sideRoad.length }
      ];
      break;
    case 'SideRoad':
      specialProps = [
        { label: 'Parent Road', value: object.mainRoad?.roadType || '' },
        { label: 'Branch Index', value: object.branchIndex },
        { label: 'Shape', value: object.routeList[0].shape },
      ];
      if (object.mainRoad.roadType == 'Main Line') { 
        specialProps.push({ label: 'Angle', value:  object.routeList[0].angle });
      }
      break;
    case 'Border':
      specialProps = [
        { label: 'Border Type', value: object.borderType },
        { label: 'Frame Width', value: object.frame },
        { label: 'Width Objects', value: object.widthObjects.length },
        { label: 'Height Objects', value: object.heightObjects.length },
        { label: 'HDivider Count', value: object.HDivider.length },
        { label: 'VDivider Count', value: object.VDivider.length }
      ];
      if (object.bbox) {
        const b = object.bbox;
        specialProps.push({ label: 'BBox', value: `L:${Math.round(b.left)}, T:${Math.round(b.top)}, R:${Math.round(b.right)}, B:${Math.round(b.bottom)}` });
      }
      break;
  }

  // Render categories
  renderCategory('Geometry', geometryProps);
  renderCategory('Basic', basicProps);
  renderCategory(object.functionalType, specialProps);
}

// Refresh property panel when arrow keys are pressed
document.addEventListener('keydown', (event) => {
  const panel = document.getElementById('property-panel');
  if (panel.style.display !== 'block') return;
  const arrowKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
  if (arrowKeys.includes(event.key)) {
    // Update content based on current active object
    const obj = CanvasGlobals.canvas.getActiveObject();
    if (obj) showPropertyPanel(obj);
  }
});

// Export showPropertyPanel for context menu
export { showPropertyPanel };