var canvas = new fabric.Canvas('canvas', { fireMiddleClick: true, fireRightClick: true, preserveObjectStacking: true, enableRetinaScaling: true });
const ctx = canvas.getContext("2d")
let activeObject = null
let canvasObject = []
let activeVertex = null
canvas.isDragging = false;
canvas.lastPosX = 0;
canvas.lastPosY = 0;


canvas.setZoom(0.2);

window.addEventListener('resize', resizeCanvas, false);

// Use this code to save and get custom properties at initialization of component
fabric.Object.prototype.toObject = (function (toObject) {
  return function (propertiesToInclude) {
    propertiesToInclude = (propertiesToInclude || []).concat(
      ["basePolygon", "anchoredPolygon", "functionalType", "txtChar", "text", "insertionPoint", "vertex", "refTopLeft", "symbol", "xHeight"] // custom attributes
    );
    return toObject.apply(this, [propertiesToInclude]);
  };
})(fabric.Object.prototype.toObject);

function resizeCanvas() {
  const canvasContainer = document.getElementById('canvas-container')
  canvas.setDimensions({ width: canvasContainer.clientWidth, height: canvasContainer.clientHeight })
  canvas.absolutePan({ x: -canvas.width / 2, y: -canvas.height / 2 })
  canvas.renderAll();
  DrawGrid()
}

function DrawGrid() {
  // Check if grid should be visible
  if (typeof GeneralSettings === 'undefined' || GeneralSettings === null) { return; }
  if (GeneralSettings && GeneralSettings.showGrid === false) {
    // Remove the existing grid if it exists
    const obj = canvas.getObjects().find(obj => obj.id === 'grid');
    if (obj) canvas.remove(obj);
    return;
  }

  // Calculate the appropriate grid distance based on the viewport boundaries
  const corners = canvas.calcViewportBoundaries();
  var xmin = corners.tl.x;
  var xmax = corners.br.x;
  var ymin = corners.tl.y;
  var ymax = corners.br.y;
  const width = xmax - xmin;
  const height = ymax - ymin;
  const maxDimension = Math.max(width, height);
  const zoom = canvas.getZoom();

  // Get grid color from settings, default to '#ffffff' if not available
  const gridColor = GeneralSettings.gridColor || '#ffffff';

  // Get grid size from settings, default to 20 if not available
  const gridSize = GeneralSettings.gridSize || 20;

  // Determine the grid distance based on the max dimension AND zoom level
  let gridDistance = gridSize; // Use setting value, default to 20 if not set
  if (zoom < 0.05) {
    gridDistance = 1000;
  } else if (zoom < 0.1) {
    gridDistance = 500;
  } else if (zoom < 0.25) {
    gridDistance = 200;
  } else if (zoom < 0.5) {
    gridDistance = 100;
  } else if (zoom < 1) {
    gridDistance = 50;
  } else if (zoom < 2) {
    gridDistance = 20;
  } else if (zoom < 5) {
    gridDistance = 10;
  } else {
    gridDistance = 5;
  }

  xmin = Math.floor(corners.tl.x / gridDistance) * gridDistance;
  xmax = Math.ceil(corners.br.x / gridDistance) * gridDistance;
  ymin = Math.floor(corners.tl.y / gridDistance) * gridDistance;
  ymax = Math.ceil(corners.br.y / gridDistance) * gridDistance;

  const options = {
    distance: gridDistance,
    param: {
      stroke: gridColor, // Use settings color instead of hardcoded '#ebebeb'
      strokeWidth: 0.1 / zoom, // Scale stroke width inversely with zoom for consistent appearance
      selectable: false
    }
  };

  const grid_set = [];

  // Set a constant screen size for text (12px)
  const constantFontSize = 12;
  // Scale font size according to zoom to maintain consistent screen size
  const scaledFontSize = constantFontSize / zoom;

  // Text appearance threshold - don't show labels when too zoomed out
  const showLabels = zoom > 0.08;

  for (let x = xmin; x <= xmax; x += options.distance) {
    const vertical = new fabric.Line([x, ymin, x, ymax], options.param);
    if (Math.abs(x % (5 * options.distance)) < 1e-6) {
      vertical.set({ strokeWidth: 0.2 / zoom }); // Thicker lines for major grid lines

      if (showLabels) {
        const vText = new fabric.Text(String(x), {
          left: x + 2 / zoom, // Add a small offset
          top: 2 / zoom,
          fill: gridColor, // Use settings color instead of hardcoded '#a0a0a0'
          selectable: false,
          hoverCursor: 'default',
          fontSize: scaledFontSize,
          scaleX: 1,
          scaleY: 1,
          fontFamily: 'Arial'
        });
        grid_set.push(vText);
      }
    }
    grid_set.push(vertical);
  }

  for (let y = ymin; y <= ymax; y += options.distance) {
    const horizontal = new fabric.Line([xmin, y, xmax, y], options.param);
    if (Math.abs(y % (5 * options.distance)) < 1e-6) {
      horizontal.set({ strokeWidth: 0.2 / zoom }); // Thicker lines for major grid lines

      if (showLabels) {
        const hText = new fabric.Text(String(y), {
          left: 2 / zoom,
          top: y + 2 / zoom, // Add a small offset
          fill: gridColor, // Use settings color instead of hardcoded '#a0a0a0'
          selectable: false,
          hoverCursor: 'default',
          fontSize: scaledFontSize,
          scaleX: 1,
          scaleY: 1,
          fontFamily: 'Arial'
        });
        grid_set.push(hText);
      }
    }
    grid_set.push(horizontal);
  }

  // Ensure the origin (0, 0) is included in the grid
  const originLineX = new fabric.Line([0, ymin, 0, ymax], { stroke: '#ffffff', strokeWidth: 0.5 / zoom, selectable: false });
  const originLineY = new fabric.Line([xmin, 0, xmax, 0], { stroke: '#ffffff', strokeWidth: 0.5 / zoom, selectable: false });
  grid_set.push(originLineX);
  grid_set.push(originLineY);

  // Remove the existing grid if it exists
  const obj = canvas.getObjects().find(obj => obj.id === 'grid');
  canvas.remove(obj);

  const grid_group = new fabric.Group(grid_set, { id: 'grid', selectable: false, evented: false });
  canvas.add(grid_group);
  canvas.sendObjectToBack(grid_group);
}

function CenterCoord() {
  var zoom = canvas.getZoom()
  return {
    x: fabric.util.invertTransform(canvas.viewportTransform)[4] + (canvas.width / zoom) / 2,
    y: fabric.util.invertTransform(canvas.viewportTransform)[5] + (canvas.height / zoom) / 2
  }
}


let resolveAnswer;


resizeCanvas();

window.canvas = canvas; // Expose canvas to the global scope for debugging

const CanvasGlobals = {
  canvas: canvas,
  ctx: ctx,
  activeObject: activeObject,
  activeVertex: activeVertex,
  canvasObject: canvasObject,
  CenterCoord: CenterCoord,
}

export { CanvasGlobals, DrawGrid }

