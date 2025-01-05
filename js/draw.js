xHeight = 100
let canvasShapes = [];
let selectedArrow = null;
let selectedVertex = null;
let cursorClickMode = 'normal'

function PolarPoint(r, a) {
  return new fabric.Point(r * Math.cos(a), r * Math.sin(a))
}

var TextBlock = fabric.util.createClass(fabric.Textbox, {
  initialize: function (x, y, color) {
    this.callSuper('initialize', x, y);
    this.color = color || '#000';
  },
  toString: function () {
    return this.callSuper('toString') + ' (color: ' + this.color + ')';
  }
});


function AddPlate() {
  var rect = new fabric.Rect({
    left: -100,
    top: -50,
    fill: '#005FB9',
    width: 70,
    height: 100,
    objectCaching: false,
    stroke: '#FFFFFF',
    strokeWidth: 2.5,
    strokeUniform: true,
    rx: 5,
    ry: 5,
  });
  canvas.add(rect);
  canvas.setActiveObject(rect);
}

function LoadShape(name, setoptions, group) {
  var setoptions = setoptions
  var group = group
  var loadedObjects = fabric.loadSVGFromURL("shapes/" + name + ".svg", function (objects, options) {
    loadedObjects = new fabric.Group(objects);
    loadedObjects.set(setoptions);
    if (group) {
      group.addWithUpdate(loadedObjects);
      canvas.renderAll();
    }
  })
}

function calculateTransformedPoints(points, options) {
  const { x, y, angle } = options;
  const radians = angle * (Math.PI / 180); // Convert angle to radians

  return points.map(point => {
    // Translate point to origin
    const translatedX = point.x;
    const translatedY = point.y;

    // Apply rotation
    const rotatedX = translatedX * Math.cos(radians) - translatedY * Math.sin(radians);
    const rotatedY = translatedX * Math.sin(radians) + translatedY * Math.cos(radians);

    // Translate point back to the specified position
    return {
      x: rotatedX + x,
      y: rotatedY + y,
      label: point.label
    };
  });
}

class GlyphPolygon extends fabric.Polygon {
  constructor(vertex, options) {
    super(vertex.map(p => ({ x: p.x, y: p.y })), options);
    vertex.forEach((p) => {
      p.x = p.x + options.left;
      p.y = p.y + options.top
    });
    this.vertex = vertex // Add a list inside the object
    this.insertPoint = vertex[0]
    // this.on('moving', this.onMoving.bind(this)); // Listen for modifications
    // this.on('modified', this.onMoving.bind(this)); // Listen for modifications
  }

  // Method to get the corners
  getCorners() {
    const { left, top, width, height, angle } = this.getBoundingRect();
    const rad = fabric.util.degreesToRadians(angle);

    // Calculate corners based on bounding box and rotation
    const corners = [
      { x: left, y: top }, // Top-left
      { x: left + width, y: top }, // Top-right
      { x: left + width, y: top + height }, // Bottom-right
      { x: left, y: top + height } // Bottom-left
    ];

    return corners.map(corner => {
      return {
        x: (corner.x - left) * Math.cos(rad) - (corner.y - top) * Math.sin(rad) + left,
        y: (corner.x - left) * Math.sin(rad) + (corner.y - top) * Math.cos(rad) + top
      };
    });
  }

}

function drawBasePolygon(points, options){
  const baseGroup = new fabric.Group();
  baseGroup.polygons = new GlyphPolygon(points, options)
  baseGroup.addWithUpdate(baseGroup.polygons);
  baseGroup.subObjects = []
  
  // debug text of the location of the group
  const loactionText = new fabric.Text(
    `X: ${baseGroup.polygons.insertPoint.x} \nY: ${baseGroup.polygons.insertPoint.x}`,
    {
    left: baseGroup.left,
    top: baseGroup.top,
    fontSize: 20,
    fill: 'red',
    selectable: false,
    opacity: 0,
  });
  baseGroup.subObjects.push(loactionText);
  baseGroup.loactionText = loactionText

  // Draw the vertices and labels
  baseGroup.polygons.vertex.forEach(v => {
      // Draw a halftone circle 
    const circle = new fabric.Circle({
      left: v.x,
      top: v.y,
      radius: 15,
      strokeWidth: 1,
      stroke: "red",
      fill: 'rgba(180, 180, 180, 0.2)',
      selectable: false,
      originX: 'center',
      originY: 'center',
      opacity: 0,
    });
    baseGroup.subObjects.push(circle);

    // Add a text label 
    const text = new fabric.Text(v.label, {
      left: v.x,
      top: v.y - 30,
      fontSize: 20,
      fill: 'red',
      selectable: false,
      originX: 'center',
      originY: 'center',
      opacity: 0,
    });
    baseGroup.subObjects.push(text);
    })
  
  baseGroup.subObjects.forEach(obj => {
    baseGroup.addWithUpdate(obj);
  })

  baseGroup.refTopLeft = {top:baseGroup.top, left:baseGroup.left}
  
  baseGroup.on('selected', ()=>{
    baseGroup.subObjects.forEach(obj => {
      obj.set('opacity', 1)
    })
    canvas.renderAll(); 
  });

  baseGroup.on('deselected', ()=>{
    baseGroup.subObjects.forEach(obj => {
      obj.set('opacity', 0)
    })
    canvas.renderAll(); 
  });

  baseGroup.on('mouseover', function() { 
    baseGroup.set({ 
      opacity: 0.5
    }); 
    canvas.renderAll(); 
  }); 
  
  baseGroup.on('mouseout', function() { 
    baseGroup.set({ 
      opacity: 1 }); 
      canvas.renderAll(); 
    });

  baseGroup.on('modified', function() { 
    updateCoord(baseGroup, baseGroup.refTopLeft)  
  })

  baseGroup.on('moving', function(){
    updateCoord(baseGroup, baseGroup.refTopLeft)  
  })

  function updateCoord (newTopLeft, baseTopLeft){
    updateX = newTopLeft.left - baseTopLeft.left
    updateY = newTopLeft.top - baseTopLeft.top

    const transformedPoints = calculateTransformedPoints(baseGroup.polygons.vertex, {
      x: updateX,
      y: updateY,
      angle: baseGroup.angle
    });

    // Update customList with new coordinates 
    transformedPoints.forEach((point, index) => {
      baseGroup.polygons.vertex[index].x = point.x;
      baseGroup.polygons.vertex[index].y = point.y;
    });

    baseGroup.polygons.insertPoint = transformedPoints[0]
    baseGroup.loactionText.set(
      'text', `X: ${baseGroup.polygons.insertPoint.x} \nY: ${baseGroup.polygons.insertPoint.y}`
    );
    baseGroup.refTopLeft = {top:newTopLeft.top, left:newTopLeft.left}
    canvas.renderAll();
  }

  baseGroup.updateCoord = updateCoord
  
  return baseGroup
  
}

function drawLabeledArrow(canvas, options) {
  const { x, y, length, angle, color } = options;

  // Define points for the arrow polygon
  const points = [
    { x: 0, y: 0, label: 'V1' },
    { x: length * 4, y: length * 4, label: 'V2' },
    { x: length * 4, y: length * 8, label: 'V3' },
    { x: length * 4 / 3, y: length * 16 / 3, label: 'V4' },
    { x: length * 4 / 3, y: length * 16, label: 'V5' },
    { x: - length * 4 / 3, y: length * 16, label: 'V6' },
    { x: - length * 4 / 3, y: length * 16 / 3, label: 'V7' },
    { x: - length * 4, y: length * 8, label: 'V8' },
    { x: - length * 4, y: length * 4, label: 'V9' },
  ];

  // Create polygon with labeled vertices
  const arrow = new drawBasePolygon(points, {
    left: x,
    top: y,
    fill: color || 'black',
    angle: angle || 0,
    originX: 'center',
    objectCaching: false
  });

  // Add the arrow to the canvas
  canvas.add(arrow);

  // Register shape in canvas
  canvasShapes.push(arrow)
}

// Context menu
const contextMenu = document.getElementById('context-menu');

function clickModelHandler(event) {
  switch (cursorClickMode) {
    case 'normal': {
      if (event.e.button === 2 && event.target) { // Right click
        event.e.preventDefault();
        contextMenu.style.top = `${event.e.clientY}px`;
        contextMenu.style.left = `${event.e.clientX}px`;
        contextMenu.style.display = 'block';
        selectedArrow = event.target;
      } else {
        contextMenu.style.display = 'none';
      }
    }
    break;
    case 'select': {
      if (event.e.button === 0 && event.target) {
        selectedArrow = event.target;
        cursorClickMode = 'normal';
        contextMenu.style.display = 'none'; // Ensure context menu is hidden
      }
    }
    break;
  }
}

canvas.on('mouse:down', function (event) {
  clickModelHandler(event)
});


document.addEventListener('contextmenu', function (event) {
  event.preventDefault();
});

function updatePosition(event) { 
  const promptBox = document.getElementById('cursorBoxContainer');
  promptBox.style.left = `${event.clientX + 10}px`; 
  promptBox.style.top = `${event.clientY + 10}px`; 
}

document.addEventListener('mousemove', updatePosition);

let resolveAnswer;

function showTextBox(text, withAnswerBox = null) {
  const promptBox = document.getElementById('cursorTextBox');
  const answerBox = document.getElementById('cursorAnswerBox');

  promptBox.innerText = text;
  promptBox.style.display = 'block';

  if (withAnswerBox) {
    answerBox.style.display = 'block';
    answerBox.value = withAnswerBox;
    answerBox.focus();

    // Handle user input and resolve the answer
    return new Promise((resolve) => {
      answerBox.addEventListener('keydown', function handleKeyDown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
          resolve(parseInt(answerBox.value));
          hideTextBox();
          answerBox.removeEventListener('keydown', handleKeyDown);
        }
      });
    });
  } else {
    answerBox.style.display = 'none';
    return Promise.resolve();
  }
  // document.dispatchEvent(new Event('mousemove'))
}

function hideTextBox() { 
  const promptBox = document.getElementById('cursorTextBox'); 
  const answerBox = document.getElementById('cursorAnswerBox'); 
  promptBox.style.display = 'none'; 
  answerBox.style.display = 'none'; 
}

document.getElementById('set-anchor').addEventListener('click', function () {
  if (selectedArrow) {
    this.parentElement.parentElement.style.display = 'none';
    // Implement vertex selection logic here
    const shape1 = selectedArrow
    selectedArrow = null
    // prompt for user to select shape
    showTextBox('Select shape to anchor to')
    // Update text box position to follow the cursor 
    cursorClickMode = 'select'
    // Periodically check if shape is selected 
    const checkShapeInterval = setInterval(() => 
      { if (selectedArrow) { 
        cursorClickMode = 'normal'
        clearInterval(checkShapeInterval)
        hideTextBox()
        anchorShape(shape1, selectedArrow); 
      } }, 100); // Check every 100ms
  }
});

async function anchorShape (arrow1, arrow2){
  // For simplicity, we'll use prompt for input
  const vertexIndex1 = await showTextBox('Enter vertex index for Arrow 1 (e.g., 1 for V1):', 1);
  const vertexIndex2 = await showTextBox('Enter vertex index for Arrow 2 (e.g., 1 for V1):', 1);
  const spacingX = await showTextBox('Enter spacing in X:', 100);
  const spacingY = await showTextBox('Enter spacing in Y:', 100);

  const point1 = calculateTransformedPoints(arrow1.polygons.vertex, {
    x: arrow1.left,
    y: arrow1.top,
    angle: arrow1.angle
  });

  const transformedPointsArrow2 = calculateTransformedPoints(arrow2.polygons.vertex, {
    x: arrow2.left,
    y: arrow2.top,
    angle: arrow2.angle
  });

  const movingPoint = arrow1.polygons.vertex[vertexIndex1-1]
  const targetPoint = arrow2.polygons.vertex[vertexIndex2 - 1];

  // Snap arrow 1 to arrow 2 with the specified spacing
  arrow1.set({
    left: arrow1.left + targetPoint.x - movingPoint.x + spacingX,
    top: arrow1.top + targetPoint.y - movingPoint.y + spacingY
  });
  arrow1.setCoords()
  arrow1.updateCoord(arrow1, arrow1.refTopLeft)

  canvas.renderAll();
}

function initShape() {
  routeMap = new fabric.Group()
  var base = LoadShape("base", { scaleY: (31 / 2 + 21.92 + 2.828 + 12 + 10) / 31, top: -(31 / 2 + 21.92 + 2.828 + 12 + 10) }, routeMap)
  var arm = LoadShape("base", { left: -21.92, top: -(31 / 2 + 21.92), scaleX: 4 / 6, angle: -45 }, routeMap)
  canvas.add(routeMap)

  block = new fabric.Textbox("Central", {
    fontFamily: 'TransportMedium',
    fill: '#ffffff',
    fontSize: 10
  })
  canvas.add(block)

  block = new fabric.Textbox("Kowloon", {
    fontFamily: 'TransportMedium',
    fill: '#ffffff',
    fontSize: 10
  })
  canvas.add(block)
  const arrowOptions1 = { x: 0, y: 0, length: 25, angle: 0, color: 'white' };
  const arrowOptions2 = { x: 100, y: 100, length: 25, angle: 0, color: 'white' };
  arrow1 = drawLabeledArrow(canvas, arrowOptions1);
  arrow2 = drawLabeledArrow(canvas, arrowOptions2);
}
AddPlate()
initShape()
