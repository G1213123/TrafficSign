
xHeight = 100
let canvasObjectNumbering = 0
let cursorClickMode = 'normal'
const deleteIcon =
  "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";


// additional property for fabric object
const originalToObject = fabric.Object.prototype.toObject;
const myAdditional = ['functionalType'];
fabric.Object.prototype.toObject = function (additionalProperties) {
  return originalToObject.call(this, myAdditional.concat(additionalProperties));
}

// Define a debounce function
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
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

  getEffectiveCoords() {
    return this.getCoords()
  }
}

// Define the BaseGroup class using ES6 class syntax
class BaseGroup extends fabric.Group {
  constructor(basePolygon, options = {}) {
    super([], options);
    //this.type = 'baseGroup';
    this.basePolygon = basePolygon;
    //this.basePolygon.set({ 'dirty': true });
    this.basePolygon.functinoalType = 'Polygon';
    this.anchoredPolygon = [];
    this.subObjects = [];
    this.lockXToPolygon = {};
    this.lockYToPolygon = {};

    Object.values(this.controls).forEach((control) => {
      control.visible = false;
    })
    this.controls.deleteControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetY: 16,
      cursorStyle: 'pointer',
      mouseUpHandler: this.deleteObject,
      render: this.renderIcon,
      cornerSize: 24,
    });

    // Calculate vertex points for anchoring
    if (!this.basePolygon.vertex) {
      this.basePolygon.vertex = [];
    }
    if (options.calcVertex !== false) {
      let basePolygonCoords = Object.values(this.basePolygon.aCoords);
      basePolygonCoords = [basePolygonCoords[0], basePolygonCoords[1], basePolygonCoords[3], basePolygonCoords[2]]; // tl, tr, bl, br ==> tl, tr, br, bl
      basePolygonCoords.forEach((p, i) => {
        this.basePolygon.vertex.push({ x: p.x, y: p.y, label: `E${i * 2 + 1}` });
        const midpoint = {
          x: (p.x + basePolygonCoords[(i + 1 === basePolygonCoords.length) ? 0 : i + 1].x) / 2,
          y: (p.y + basePolygonCoords[(i + 1 === basePolygonCoords.length) ? 0 : i + 1].y) / 2,
          label: `E${(i + 1) * 2}`
        };
        this.basePolygon.vertex.push(midpoint);
      });
    }
    this.basePolygon.insertPoint = this.basePolygon.vertex[0];
    canvas.remove(this.basePolygon);
    this.add(this.basePolygon);

    // Debug text of the location of the group
    if (this.basePolygon.insertPoint) {
      const loactionText = new fabric.Text(
        `Node: ${this.basePolygon.insertPoint.label} \nX: ${this.basePolygon.insertPoint.x.toFixed(0)} \nY: ${this.basePolygon.insertPoint.y.toFixed(0)}`,
        {
          left: this.left,
          top: this.top - 125,
          fontSize: 20,
          fill: 'white', // Text color
          selectable: false,
          opacity: 1,
          functinoalType: 'locationText',
          stroke: '#000', // Text stroke color
          strokeWidth: 3,
          paintFirst: 'stroke', // Stroke behind fill
          fontFamily: 'Arial, sans-serif', // Modern font family
          padding: 10, // Padding around the text
          shadow: new fabric.Shadow({
            color: 'rgba(0, 0, 0, 0.5)',
            blur: 10,
            offsetX: 2,
            offsetY: 2
          })
        });
      this.subObjects.push(loactionText);
      this.loactionText = loactionText;
    }

    // Draw the vertices and labels
    if (this.basePolygon.vertex) {
      this.basePolygon.vertex.forEach(v => {
        // Draw a halftone circle
        const circle = new fabric.Circle({
          left: v.x,
          top: v.y,
          radius: 10,
          strokeWidth: 1,
          stroke: v.label.includes('E') ? 'red' : 'violet', // Changed fill color for better contrast
          fill: 'rgba(255, 255, 255, 0.2)',
          selectable: false,
          originX: 'center',
          originY: 'center',
          opacity: 0,
          functinoalType: 'vertexCircle',
        });
        this.subObjects.push(circle);

        // Add a text label
        const text = new fabric.Text(v.label, {
          left: v.x,
          top: v.label.includes('E') ? v.y - 30 : v.y + 30,
          fontSize: 20,
          fill: v.label.includes('E') ? 'red' : 'violet', // Changed fill color for better contrast
          selectable: false,
          originX: 'center',
          originY: 'center',
          opacity: 1,
          functinoalType: 'vertexText',
          fontFamily: 'Arial, sans-serif', // Modern font family
          //stroke: '#000', // Black stroke for better contrast
          //strokeWidth: 1,
        });
        this.subObjects.push(text);
      });
    }

    this.subObjects.forEach(obj => {
      this.add(obj);
    });

    this.refTopLeft = { top: this.basePolygon.getCoords()[0].y, 
      left: this.basePolygon.getCoords()[0].x };

    this.on('selected', () => {
      this.subObjects.forEach(obj => {
        obj.set('opacity', 1);
      });
      //canvas.bringObjectToFront(this)
    });

    this.on('deselected', () => {
      setTimeout(() => {
        this.subObjects.forEach(obj => {
          obj.set('opacity', 0);
        });
        // canvas.sendObjectToBack(this)
      }, 0)
    });

    this.on('mouseover', function () {
      this.set({
        opacity: 0.5
      });
      canvas.renderAll();
    });

    this.on('mouseout', function () {
      this.set({
        opacity: 1
      });
      canvas.renderAll();
    });

    this.on('modified', this.updateAllCoord.bind(this));
    this.on('moving', this.updateAllCoord.bind(this));
  }

  // Method to emit deltaX and deltaY to anchored groups
  emitDelta(deltaX, deltaY) {
    this.anchoredPolygon.forEach(anchoredGroup => {
      anchoredGroup.receiveDelta(deltaX, deltaY);
    });
  }

  // Method to receive deltaX and deltaY and update position
  receiveDelta(deltaX, deltaY) {
    this.set({
      left: this.left + deltaX,
      top: this.top + deltaY
    });
    this.setCoords();
    this.updateAllCoord();
  }

  getBasePolygonVertex(label) {
    return this.basePolygon.vertex.find(v => v.label === label);
  }
  drawAnchorLinkage() {
    for (let i = this.subObjects.length - 1; i >= 0; i--) {
      const obj = this.subObjects[i];
      if (obj.functinoalType === 'anchorLine' || obj.functinoalType === 'lockIcon') {
        this.subObjects.splice(i, 1); // Remove the element from the array
        this.remove(obj); // Remove the object from the group
        canvas.remove(obj); // Remove the object from the canvas
      }
    }
    if (Object.keys(this.lockXToPolygon).length) {
      let sourcePoint = this.getBasePolygonVertex(
        this.lockXToPolygon.sourcePoint)
      let targetPoint = this.lockXToPolygon.TargetObject.getBasePolygonVertex(this.lockXToPolygon.targetPoint)

      const line1 = new fabric.Line([sourcePoint.x, sourcePoint.y, targetPoint.x, sourcePoint.y], {
        stroke: 'red',
        strokeWidth: 5,
        selectable: false,
        functinoalType: 'anchorLine',
      });
      const line2 = new fabric.Line([targetPoint.x, sourcePoint.y, targetPoint.x, targetPoint.y], {
        stroke: 'red',
        strokeWidth: 5,
        selectable: false,
        strokeDashArray: [10, 5],
        functinoalType: 'anchorLine',
      });

      // Calculate the midpoint of line1
      const midX = (sourcePoint.x + targetPoint.x) / 2;
      const midY = sourcePoint.y;

      // Create a lock icon using Font Awesome
      const lockIcon1 = new fabric.Text('\uf023', {
        fontFamily: 'Font Awesome 5 Free',
        fontWeight: 900,
        left: midX,
        top: midY,
        fontSize: 20,
        fill: 'gold', // Gold fill color
        stroke: 'black', // Black border
        strokeWidth: 1, // Border width
        originX: 'center',
        originY: 'center',
        selectable: false,
        functinoalType: 'lockIcon',
      });

      this.subObjects.push(line1, line2, lockIcon1);
      this.add(line1, line2, lockIcon1);

    }
    if (Object.keys(this.lockYToPolygon).length) {
      let sourcePoint = this.getBasePolygonVertex(
        this.lockYToPolygon.sourcePoint)
      let targetPoint = this.lockYToPolygon.TargetObject.getBasePolygonVertex(this.lockYToPolygon.targetPoint)

      const line3 = new fabric.Line([sourcePoint.x, sourcePoint.y, sourcePoint.x, targetPoint.y], {
        stroke: 'red',
        strokeWidth: 5,
        selectable: false,
        functinoalType: 'anchorLine',
      });
      const line4 = new fabric.Line([sourcePoint.x, targetPoint.y, targetPoint.x, targetPoint.y], {
        stroke: 'red',
        strokeWidth: 5,
        selectable: false,
        strokeDashArray: [10, 5],
        functinoalType: 'anchorLine',
      });

      // Calculate the midpoint of line1
      const midX = sourcePoint.x;
      const midY = (sourcePoint.y + targetPoint.y) / 2;

      // Create a lock icon using Font Awesome
      const lockIcon2 = new fabric.Text('\uf023', {
        fontFamily: 'Font Awesome 5 Free',
        fontWeight: 900,
        left: midX,
        top: midY,
        fontSize: 20,
        fill: 'gold', // Gold fill color
        stroke: 'black', // Black border
        strokeWidth: 1, // Border width
        originX: 'center',
        originY: 'center',
        selectable: false,
        functinoalType: 'lockIcon',
      });

      this.subObjects.push(line3, line4, lockIcon2);
      this.add(line3, line4, lockIcon2);

    }
  }
  // Method to update coordinates and emit delta
  updateAllCoord() {
    const deltaX = this.basePolygon.getCoords()[0].x - this.refTopLeft.left;
    const deltaY = this.basePolygon.getCoords()[0].y - this.refTopLeft.top;
    this.updateCoord(true);
    this.emitDelta(deltaX, deltaY);
    this.refTopLeft = { top: this.basePolygon.getCoords()[0].y, left: this.basePolygon.getCoords()[0].x};
    if (canvas.getActiveObject() === this) {
      this.drawAnchorLinkage();
    }
  }

  // Method to update coordinates
  updateCoord(updateLocationText = false) {
    const polygon = this.basePolygon;
    const updateX = this.basePolygon.getCoords()[0].x - this.refTopLeft.left;
    const updateY = this.basePolygon.getCoords()[0].y - this.refTopLeft.top;

    const transformedPoints = calculateTransformedPoints(polygon.vertex, {
      x: updateX,
      y: updateY,
      angle: this.angle
    });

    // Update customList with new coordinates
    transformedPoints.forEach((point, index) => {
      polygon.vertex[index].x = point.x;
      polygon.vertex[index].y = point.y;
    });

    polygon.insertPoint = transformedPoints[0];

    if (updateLocationText) {
      this.loactionText.set(
        'text', `Node: ${polygon.insertPoint.label} \nX: ${polygon.insertPoint.x.toFixed(0)} \nY: ${polygon.insertPoint.y.toFixed(0)}`
      );
    }
    polygon.setCoords();
    canvas.renderAll();
  }

  getEffectiveCoords() {
    if (this.basePolygon.getCombinedBoundingBoxOfRects) {
      var allCoords = this.basePolygon.getCombinedBoundingBoxOfRects();
      return [allCoords[0], allCoords[2], allCoords[4], allCoords[6]];
    }
    return this.basePolygon.getEffectiveCoords();

  }

  // Method to delete the object
  deleteObject(_eventData, transform) {
    canvas.remove(transform.target);
    canvasObject.pop(transform.target);
    if (transform.target.anchoredPolygon) {
      transform.target.anchoredPolygon.forEach(anchoredGroup => {
        anchoredGroup.set({ lockMovementX: false, lockMovementY: false });
      })
    }
    canvas.requestRenderAll();
  }

  renderIcon(ctx, left, top, _styleOverride, fabricObject) {
    const size = this.cornerSize;

    var deleteImg = document.createElement('img');
    deleteImg.src = deleteIcon;
    ctx.save();
    ctx.translate(left, top);
    ctx.rotate(fabric.util.degreesToRadians(fabricObject.angle));
    ctx.drawImage(deleteImg, -size / 2, -size / 2, size, size);
    ctx.restore();
  }

}

// Register the custom class with Fabric.js
fabric.BaseGroup = BaseGroup;

// Function to draw base polygon
function drawBasePolygon(basePolygon, calcVertex = true) {
  const baseGroup = new fabric.BaseGroup(basePolygon, {
    calcVertex: calcVertex, subTargetCheck: true, lockScalingX: true,// lock scaling
    lockScalingY: true
  });
  canvas.add(baseGroup);
  canvasObject.push(baseGroup);
  canvas.setActiveObject(baseGroup);
  return baseGroup;
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
    vertexIndex1 = await showTextBox('Enter vertex index for Polygon 1 (e.g., V1 for V1):', 'V1')
    if (vertexIndex1 === null) return;
    vertexIndex2 = await showTextBox('Enter vertex index for Polygon 2 (e.g., V1 for V1):', 'V1')
    if (vertexIndex2 === null) return;
    spacingX = parseInt(await showTextBox('Enter spacing in X:', 100))
    spacingY = parseInt(await showTextBox('Enter spacing in Y:', 100))

  }

  const movingPoint = Polygon1.getBasePolygonVertex(vertexIndex1.toUpperCase())
  const targetPoint = Polygon2.getBasePolygonVertex(vertexIndex2.toUpperCase())

  if (!isNaN(spacingX)) {
    // Snap arrow 1 to arrow 2 with the specified spacing
    Polygon1.set({
      left: Polygon1.left + targetPoint.x - movingPoint.x + spacingX,
      lockMovementX: true,
    });
    anchor = { sourcePoint: vertexIndex1, targetPoint: vertexIndex2, TargetObject: Polygon2 }
    Polygon1.lockXToPolygon = anchor
  }

  if (!isNaN(spacingY)) {
    // Snap arrow 1 to arrow 2 with the specified spacing
    Polygon1.set({
      top: Polygon1.top + targetPoint.y - movingPoint.y + spacingY,
      lockMovementY: true,
    });
    anchor = { sourcePoint: vertexIndex1, targetPoint: vertexIndex2, TargetObject: Polygon2 }
    Polygon1.lockYToPolygon = anchor
  }
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
  Polygon1.drawAnchorLinkage()
  canvas.bringObjectToFront(Polygon2)



  //
  //
  canvasObject.pop(Polygon1)

  canvas.renderAll();
}

