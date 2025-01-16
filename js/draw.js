
xHeight = 100
let canvasObjectNumbering = 0
let cursorClickMode = 'normal'

// additional property for fabric object
const originalToObject = fabric.Object.prototype.toObject;
const myAdditional = ['functionalType'];
fabric.Object.prototype.toObject = function (additionalProperties) {
  return originalToObject.call(this, myAdditional.concat(additionalProperties));
}

function PolarPoint(r, a) {
  return new fabric.Point(r * Math.cos(a), r * Math.sin(a))
}

/*
var TextBlock = fabric.util.createClass(fabric.Textbox, {
  initialize: function (x, y, color) {
    this.callSuper('initialize', x, y);
    this.color = color || '#000';
  },
  toString: function () {
    return this.callSuper('toString') + ' (color: ' + this.color + ')';
  }
});
*/

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
    vertex.forEach((p) => {
      p.x = p.x + options.left;
      p.y = p.y + options.top
    });
    super(vertex.map(p => ({ x: p.x, y: p.y })), options);
    this.vertex = vertex // Add a list inside the object
    this.insertPoint = vertex[0]
    // this.on('moving', this.onMoving.bind(this)); // Listen for modifications
    // this.on('modified', this.onMoving.bind(this)); // Listen for modifications
    this.left = this.getCorners().left
    this.top = this.getCorners().top
    this.setCoords()
  }

  // Method to get the corners
  getCorners() {
    const minX = Math.min(...this.vertex.map(v => v.x));
    const maxX = Math.max(...this.vertex.map(v => v.x));
    const minY = Math.min(...this.vertex.map(v => v.y));
    const maxY = Math.max(...this.vertex.map(v => v.y));

    return {
      left: minX,
      right: maxX,
      top: minY,
      bottom: maxY
    };
    ;
  }

}

function drawBasePolygon(basePolygon, calcVertex = true) {
  const baseGroup = new fabric.Group([], { subTargetCheck: true });
  canvas.add(baseGroup)
  baseGroup.basePolygon = basePolygon
  baseGroup.basePolygon.set('dirty', true)
  baseGroup.basePolygon.functinoalType = 'Polygon'
  baseGroup.anchoredPolygon = []

  baseGroup.subObjects = []

  // calculated vertex points for anchoring
  if (!baseGroup.basePolygon.vertex) {
    baseGroup.basePolygon.vertex = []
  }
  if (calcVertex) {
    let basePolygonCoords = Object.values(baseGroup.basePolygon.aCoords)
    basePolygonCoords = [basePolygonCoords[0], basePolygonCoords[1], basePolygonCoords[3], basePolygonCoords[2]] // tl, tr, bl, br ==> tl, tr, br, bl
    basePolygonCoords.forEach((p, i) => {
      baseGroup.basePolygon.vertex.push({ x: p.x, y: p.y, label: `E${i * 2 + 1}` })
      midpoint = {
        x: (p.x + basePolygonCoords[(i + 1 == basePolygonCoords.length) ? 0 : i + 1].x) / 2,
        y: (p.y + basePolygonCoords[(i + 1 == basePolygonCoords.length) ? 0 : i + 1].y) / 2,
        label: `E${(i + 1) * 2}`
      }
      baseGroup.basePolygon.vertex.push(midpoint)
    })
  }
  baseGroup.basePolygon.insertPoint = baseGroup.basePolygon.vertex[0]
  canvas.remove(baseGroup.basePolygon)
  baseGroup.add(baseGroup.basePolygon);

  // debug text of the location of the group
  if (baseGroup.basePolygon.insertPoint) {
    const loactionText = new fabric.Text(
      `placeholder`,
      {
        left: baseGroup.left,
        top: baseGroup.top - 125,
        fontSize: 20,
        fill: 'red',
        selectable: false,
        opacity: 0,
        functinoalType: 'locationText',
      });
    baseGroup.subObjects.push(loactionText);
    baseGroup.loactionText = loactionText
  }

  // Draw the vertices and labels
  if (baseGroup.basePolygon.vertex) {
    baseGroup.basePolygon.vertex.forEach(v => {
      // Draw a halftone circle 
      const circle = new fabric.Circle({
        left: v.x,
        top: v.y,
        radius: 15,
        strokeWidth: 1,
        stroke: v.label.includes('E') ? 'red' : 'violet',
        fill: 'rgba(180, 180, 180, 0.2)',
        selectable: false,
        originX: 'center',
        originY: 'center',
        opacity: 0,
        functinoalType: 'vertexCircle',
      });
      baseGroup.subObjects.push(circle);

      // Add a text label 
      const text = new fabric.Text(v.label, {
        left: v.x,
        top: v.label.includes('E') ? v.y - 30 : v.y + 30,
        fontSize: 20,
        fill: v.label.includes('E') ? 'red' : 'violet',
        selectable: false,
        originX: 'center',
        originY: 'center',
        opacity: 0,
        functinoalType: 'vertexText',
      });
      baseGroup.subObjects.push(text);
    })
  }

  baseGroup.subObjects.forEach(obj => {
    baseGroup.add(obj);
  })

  baseGroup.refTopLeft = { top: baseGroup.top, left: baseGroup.left }

  baseGroup.on('selected', () => {
    loopAnchoredObjects(baseGroup, function (obj) {
      obj.subObjects.forEach(obj => {
        obj.set('opacity', 1)
      })
    }, null)

  }
  );

  baseGroup.on('deselected', () => {
    loopAnchoredObjects(baseGroup, function (obj) {
      obj.subObjects.forEach(obj => {
        obj.set('opacity', 0)
      })
    }, null)

  }
  );
  baseGroup.on('mouseover', function () {
    baseGroup.set({
      opacity: 0.5
    });
    canvas.renderAll();
  });

  baseGroup.on('mouseout', function () {
    baseGroup.set({
      opacity: 1
    });
    canvas.renderAll();
  });

  baseGroup.on('modified', updateAllCoord)

  baseGroup.on('moving', updateAllCoord)

  function updateAllCoord() {
    const deltaX = this.left - this.refTopLeft.left;
    const deltaY = this.top - this.refTopLeft.top;
    updateCoord(baseGroup, true)
    emitDelta(deltaX, deltaY);
    //loopAnchoredObjects(baseGroup, updateCoord, true)
    //baseGroup.anchoredPolygon.forEach((p) => {
    //  loopAnchoredObjects(p, updateCoord, false)
    //})
  }//

  // Method to emit deltaX and deltaY to anchored groups
  function emitDelta(deltaX, deltaY) {
    baseGroup.anchoredPolygon.forEach(anchoredGroup => {
      anchoredGroup.receiveDelta(deltaX, deltaY);
    });
  }

  // Method to receive deltaX and deltaY and update position
  function receiveDelta(deltaX, deltaY) {
    baseGroup.set({
      left: baseGroup.left + deltaX,
      top: baseGroup.top + deltaY
    });
    baseGroup.setCoords();
    baseGroup.updateAllCoord();
  }

  function updateCoord(baseGroup, updateLocationTex = false) {
    polygon = baseGroup.basePolygon
    updateX = baseGroup.left - baseGroup.refTopLeft.left
    updateY = baseGroup.top - baseGroup.refTopLeft.top

    const transformedPoints = calculateTransformedPoints(polygon.vertex, {
      x: updateX,
      y: updateY,
      angle: baseGroup.angle
    });

    // Update customList with new coordinates 
    transformedPoints.forEach((point, index) => {
      polygon.vertex[index].x = point.x;
      polygon.vertex[index].y = point.y;
    });

    polygon.insertPoint = transformedPoints[0]

    if (updateLocationTex) {
      baseGroup.loactionText.set(
        'text', `Node: ${polygon.insertPoint.label} \nX: ${polygon.insertPoint.x} \nY: ${polygon.insertPoint.y}`
      );
    }
    baseGroup.refTopLeft = { top: baseGroup.top, left: baseGroup.left }
    polygon.setCoords();
    canvas.renderAll();
  }

  baseGroup.updateAllCoord = updateAllCoord
  baseGroup.receiveDelta = receiveDelta
  baseGroup.emitDelta = emitDelta
  canvasObject.push(baseGroup)
  canvas.add(baseGroup)
  //baseGroup.updateAllCoord()
  canvas.setActiveObject(baseGroup)

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
  const arrow = new drawBasePolygon(
    new GlyphPolygon(points,
      {
        left: x,
        top: y,
        fill: color || 'black',
        angle: angle || 0,
        // originX: 'center',
        objectCaching: false
      }),
  );

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

function answerBoxFocus(event) {
  const answerBox = document.getElementById('cursorAnswerBox');
  if (answerBox.style.display === 'block') {
    answerBox.focus();
  }
}
document.addEventListener('mouseup', answerBoxFocus);

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
    answerBox.select();

    // Handle user input and resolve the answer
    return new Promise((resolve) => {
      answerBox.addEventListener('keydown', function handleKeyDown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
          resolve(answerBox.value);
          hideTextBox();
          answerBox.removeEventListener('keydown', handleKeyDown);
        } else if (event.key === 'Escape') {
          resolve(null); // or any specific value indicating the user wants to quit
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

async function selectObjectHandler(text, callback, options = null) {
  // prompt for user to select shape
  const response = await showTextBox(text, ' ')
  // Check if the response is null (user pressed 'Esc')
  if (response === null) {
    hideTextBox();
    return;
  }
  // Update text box position to follow the cursor 
  cursorClickMode = 'select'
  // Periodically check if shape is selected 
  const checkShapeInterval = setInterval(() => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
      cursorClickMode = 'normal'
      clearInterval(checkShapeInterval)
      hideTextBox()
      successSelected = canvas.getActiveObjects()
      // Clear the selected object from active
      canvas.discardActiveObject();
      canvas.renderAll();
      callback(successSelected, options);
    }
  }, 100); // Check every 100ms
}

document.getElementById('set-anchor').addEventListener('click', function () {
  if (selectedArrow) {
    this.parentElement.parentElement.style.display = 'none';
    // Implement vertex selection logic here
    const shape1 = selectedArrow
    selectedArrow = null
    selectObjectHandler('Select shape to anchor to', anchorShape, shape1)
  }
});

async function anchorShape(Polygon2, Polygon1, options = null) {
  Polygon2 = Polygon2[0]

  // For simplicity, we'll use prompt for input
  if (options) {
    vertexIndex1 = options.vertexIndex1
    vertexIndex2 = options.vertexIndex2
    spacingX = options.spacingX
    spacingY = options.spacingY
  } else {
    vertexIndex1 = await showTextBox('Enter vertex index for Polygon 1 (e.g., 1 for V1):', 1)
    if (vertexIndex1 === null) return;
    vertexIndex2 = await showTextBox('Enter vertex index for Polygon 2 (e.g., 1 for V1):', 1)
    if (vertexIndex2 === null) return;
    spacingX = parseInt(await showTextBox('Enter spacing in X:', 100))
    if (isNaN(spacingX)) return;
    spacingY = parseInt(await showTextBox('Enter spacing in Y:', 100))
    if (isNaN(spacingY)) return;
  }

  const movingPoint = Polygon1.basePolygon.vertex.find(el => el.label == vertexIndex1.toUpperCase())
  const targetPoint = Polygon2.basePolygon.vertex.find(el => el.label == vertexIndex2.toUpperCase())

  // Snap arrow 1 to arrow 2 with the specified spacing
  Polygon1.set({
    left: Polygon1.left + targetPoint.x - movingPoint.x + spacingX,
    top: Polygon1.top + targetPoint.y - movingPoint.y + spacingY
  });
  Polygon1.setCoords()
  Polygon1.updateAllCoord()


  //Polygon2.add(Polygon1.basePolygon)
  Polygon2.anchoredPolygon.push(Polygon1)

  //Polygon1.forEachObject(function (obj) {
  //  //Polygon1.removeWithUpdate(obj)
  //  canvas.remove(obj)
  //})
  //canvas.remove(Polygon1)
  Polygon2.updateAllCoord()
  canvas.bringObjectToFront(Polygon2)



  //
  //
  canvasObject.pop(Polygon1)

  canvas.renderAll();
}

