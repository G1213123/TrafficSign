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
  constructor(shapeMeta, options) {
    shapeMeta.vertex.forEach((p) => {
      p.x = p.x + options.left;
      p.y = p.y + options.top
    });
    super(shapeMeta.vertex.map(p => ({ x: p.x, y: p.y })), options);
    this.shapeMeta.vertex = shapeMeta.vertex // Add a list inside the object
    this.insertPoint = shapeMeta.vertex[0]
    // this.on('moving', this.onMoving.bind(this)); // Listen for modifications
    // this.on('modified', this.onMoving.bind(this)); // Listen for modifications
    this.left = this.getCorners().left
    this.top = this.getCorners().top
    this.setCoords()
  }

  // Method to get the corners
  getCorners() {
    const minX = Math.min(...this.shapeMeta.vertex.map(v => v.x));
    const maxX = Math.max(...this.shapeMeta.vertex.map(v => v.x));
    const minY = Math.min(...this.shapeMeta.vertex.map(v => v.y));
    const maxY = Math.max(...this.shapeMeta.vertex.map(v => v.y));

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

class GlyphPath extends fabric.Path {
  constructor(shapeMeta, options) {
    const vertexleft = shapeMeta[0].vertex[0].x - Math.min(...shapeMeta.map(p => p.vertex).flat().map(v => v.x));
    const vertextop = shapeMeta[0].vertex[0].y - Math.min(...shapeMeta.map(p => p.vertex).flat().map(v => v.y));

    shapeMeta.forEach(p => {
      p.vertex.forEach((p) => {
        p.x = p.x + options.left + vertexleft;
        p.y = p.y + options.top + vertextop;
      });
    })
    const pathData = vertexToPath(shapeMeta);
    super(pathData, options);
    this.vertex = shapeMeta.map(p => p.vertex).flat(); // Store the shapeMeta.vertex points
    this.insertPoint = shapeMeta[0].vertex[0];

    this.setCoords();
  }

}

// Define the BaseGroup class using ES6 class syntax
class BaseGroup extends fabric.Group {
  constructor(basePolygon, functionalType, options = {}) {
    super([], options);
    //this.type = 'baseGroup';
    this.basePolygon = basePolygon;
    //this.basePolygon.set({ 'dirty': true });
    this.functionalType = functionalType;
    this.anchoredPolygon = [];
    this.anchorageLink = [];
    this.subObjects = [];
    this.lockXToPolygon = {};
    this.lockYToPolygon = {};

    this.basePolygon.insertPoint = this.basePolygon.vertex[0];
    canvas.remove(this.basePolygon);
    this.add(this.basePolygon);

    // remove default fabric control
    Object.values(this.controls).forEach((control) => {
      control.visible = false;
    })

    // add delete control
    this.controls.deleteControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetY: 16,
      cursorStyle: 'pointer',
      mouseUpHandler: this.deleteObject,
      render: this.renderIcon,
      cornerSize: 24,
    });

    this.drawVertex(options.calcVertex)
    
    this.refTopLeft = {
      top: this.basePolygon.getCoords()[0].y,
      left: this.basePolygon.getCoords()[0].x
    };

    this.on('selected', () => {
      this.subObjects.forEach(obj => {
        obj.set('opacity', 1);
      });

      this.drawAnchorLinkage()
      CanvasObjectInspector.SetActiveObjectList(this)
      //canvas.bringObjectToFront(this)
    });

    this.on('deselected', () => {
      setTimeout(() => {
        this.subObjects.forEach(obj => {
          obj.set('opacity', 0);
        });
        this.anchorageLink.forEach(obj => {
          obj.forEach(o =>{
            o.set('opacity', 0);
          })
        });
        // canvas.sendObjectToBack(this)
      }, 0)
      CanvasObjectInspector.SetActiveObjectList(null)
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

  drawVertex(calc){
  // Calculate vertex points for anchoring

  if (!this.basePolygon.vertex) {
    this.basePolygon.vertex = [];
  }
  if (calc !== false) {
    this.subObjects= []
    let basePolygonCoords = Object.values(this.basePolygon.getCoords());
    //basePolygonCoords = [basePolygonCoords[0], basePolygonCoords[1], basePolygonCoords[3], basePolygonCoords[2]]; // tl, tr, bl, br ==> tl, tr, br, bl
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
        opacity: 0,
        functionalType: 'locationText',
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
        functionalType: 'vertexCircle',
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
        opacity: 0,
        functionalType: 'vertexText',
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
  }

  // Method to emit deltaX and deltaY to anchored groups
  emitDelta(deltaX, deltaY, source = null) {
    this.anchoredPolygon.forEach(anchoredGroup => {
      if (anchoredGroup.borderType || this.borderType){
        //pass
      } else {

        // check receive change object to avoid self reference in border resize
        if (anchoredGroup.lockXToPolygon.TargetObject == this){
          anchoredGroup.receiveDelta(deltaX, 0);
        } 
        if (anchoredGroup.lockYToPolygon.TargetObject == this)
        {
          anchoredGroup.receiveDelta(0, deltaY);
        }
      }
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

  // Method to call for border resizing
  borderResize() {
    if (this.borderGroup) {
      const BG = this.borderGroup
      borderObject = FormBorderWrapComponent.BorderCreate(BG.heightObjects, BG.widthObjects,BG.xHeight, BG.borderType)
      BG.removeAll()
      BG.add(borderObject)
      BG.basePolygon = borderObject
      BG.setCoords()
      BG.updateAllCoord()
      BG.drawVertex()
    }
  }

  getBasePolygonVertex(label) {
    return this.basePolygon.vertex.find(v => v.label === label.toUpperCase());
  }

  drawAnchorLinkage() {
    for (let i = this.anchorageLink.length - 1; i >= 0; i--) {
      const obj = this.anchorageLink[i];

        this.anchorageLink.splice(i, 1); // Remove the element from the array
        obj.forEach(e => {
          this.remove(e); // Remove the object from the group
          canvas.remove(e); // Remove the object from the canvas
        })
      
    }
    if (Object.keys(this.lockXToPolygon).length) {
      let sourcePoint = this.getBasePolygonVertex(
        this.lockXToPolygon.sourcePoint)
      let targetPoint = this.lockXToPolygon.TargetObject.getBasePolygonVertex(this.lockXToPolygon.targetPoint)

      let lockAnno1 = new LockIcon(this, sourcePoint, targetPoint, 'x')
      this.anchorageLink.push(lockAnno1.objects);
      canvas.add(...lockAnno1.objects);

    }
    if (Object.keys(this.lockYToPolygon).length) {
      let sourcePoint = this.getBasePolygonVertex(
        this.lockYToPolygon.sourcePoint)
      let targetPoint = this.lockYToPolygon.TargetObject.getBasePolygonVertex(this.lockYToPolygon.targetPoint)

      let lockAnno2 = new LockIcon(this, sourcePoint, targetPoint, 'y')
      this.anchorageLink.push(lockAnno2.objects);
      canvas.add(...lockAnno2.objects);

      }
      const isActive = canvas.getActiveObject() === this;
      const opacity = isActive ? 1 : 0;
      this.anchorageLink.forEach(obj => {
        obj.forEach(o =>{
          o.set('opacity', opacity);
        })
      });
      canvas.renderAll();
    
  }
  // Method to update coordinates and emit delta
  updateAllCoord() {
    const deltaX = this.basePolygon.getCoords()[0].x - this.refTopLeft.left;
    const deltaY = this.basePolygon.getCoords()[0].y - this.refTopLeft.top;
    this.updateCoord(true);
    this.refTopLeft = { top: this.basePolygon.getCoords()[0].y, left: this.basePolygon.getCoords()[0].x };
    if (canvas.getActiveObject() === this) {
      this.drawAnchorLinkage();
    }
    this.emitDelta(deltaX, deltaY, this);
    this.borderResize();
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
    return this.basePolygon.getCoords();

  }

  // Method to delete the object
  deleteObject(_eventData, transform) {
    canvas.remove(transform.target);
    canvasObject.pop(transform.target);

    // Free anchored Polygon
    if (transform.target.anchoredPolygon) {
      transform.target.anchoredPolygon.forEach(anchoredGroup => {
        anchoredGroup.set({ lockMovementX: false, lockMovementY: false });
        if (anchoredGroup.lockXToPolygon.TargetObject == transform.target) {
          anchoredGroup.lockXToPolygon = {}
        }
        if (anchoredGroup.lockYToPolygon.TargetObject == transform.target) {
          anchoredGroup.lockYToPolygon = {}
        }
        anchoredGroup.drawAnchorLinkage()
      })
    }

    // If this is a borderGroup
    if (transform.target.widthObjects) {
      transform.target.widthObjects.forEach(obj => obj.borderGroup = null)
    }
    if (transform.target.heightObjects) {
      transform.target.heightObjects.forEach(obj => obj.borderGroup = null)
    }
    CanvasObjectInspector.createObjectListPanelInit()
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

class LockIcon {
  constructor(baseGroup, sourcePoint, targetPoint, direction) {
    this.baseGroup = baseGroup;
    this.direction = direction
    var midX
    var midY

    // Create lock lines
    if (this.direction == 'x'){
      this.line1 = new fabric.Line([sourcePoint.x, sourcePoint.y, targetPoint.x, sourcePoint.y], {
        stroke:'green',
        strokeWidth: 5,
        selectable: false,
        functionalType: 'anchorLine',
      });
      this.line2 = new fabric.Line([targetPoint.x, sourcePoint.y, targetPoint.x, targetPoint.y], {
        stroke: 'green',
        strokeWidth: 5,
        selectable: false,
        strokeDashArray: [10, 5],
        functionalType: 'anchorLine',
      });
          // Calculate the midpoint of line1
    midX = (sourcePoint.x + targetPoint.x) / 2;
    midY = sourcePoint.y;

    
    this.dimensionText = new fabric.Text( (targetPoint.x - sourcePoint.x).toFixed() + 'mm',
      {
        left: midX,
        top: midY - 50,
        fontSize: 20,
        fill: 'green', // Text color
        selectable: false,
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
      })

    } else {
      this.line1 = new fabric.Line([sourcePoint.x, sourcePoint.y, sourcePoint.x, targetPoint.y], {
        stroke:'red',
        strokeWidth: 5,
        selectable: false,
        functionalType: 'anchorLine',
      });
      this.line2 = new fabric.Line([sourcePoint.x, targetPoint.y, targetPoint.x, targetPoint.y], {
        stroke:   'red',
        strokeWidth: 5,
        selectable: false,
        strokeDashArray: [10, 5],
        functionalType: 'anchorLine',
      });
          // Calculate the midpoint of line1
    midX = sourcePoint.x ;
    midY = (sourcePoint.y + targetPoint.y) / 2;
    
    this.dimensionText = new fabric.Text( (targetPoint.y - sourcePoint.y).toFixed() + 'mm',
      {
        left: midX -50,
        top: midY,
        fontSize: 20,
        fill: 'red', // Text color
        selectable: false,
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
      })
    }

    // Create a lock icon using Font Awesome
    this.lockIcon = new fabric.Text('\uf023', {
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
      functionalType: 'lockIcon',
    });
   

    // Add hover and click event listeners
    this.lockIcon.on('mouseover', this.onHover.bind(this));
    this.lockIcon.on('mouseout', this.onMouseOut.bind(this));
    this.lockIcon.on('mousedown', this.onClick.bind(this));

    // Add lock lines and lock icon to the canvas
    //return[this.line1, this.line2, this.lockIcon]
    this.objects = [this.line1, this.line2, this.dimensionText, this.lockIcon, ]
  }


  onHover() {
    this.lockIcon.set('text','\uf3c1');
    this.lockIcon.set('fill','brown');
    this.dimensionText.set('fill','brown');
    this.lockIcon.set('hoverCursor','pointer')
    canvas.renderAll();
  }

  onMouseOut() {
    this.lockIcon.set('text','\uf023');
    this.lockIcon.set('fill','gold');
    this.dimensionText.set('fill',this.direction = 'x'? 'green': 'red');
    this.lockIcon.set('hoverCursor','default')
    canvas.renderAll();
  }

  onClick() {
    // Remove lock lines and lock icon from the canvas and baseGroup
    canvas.remove(...this.objects);
    this.baseGroup.anchorageLink = this.baseGroup.anchorageLink.filter(obj => obj !== this.line1 && obj !== this.line2 && obj !== this.lockIcon);
    const anchorX = this.baseGroup.lockXToPolygon.TargetObject
    const anchorY = this.baseGroup.lockYToPolygon.TargetObject
    if (this.direction == 'x'){
      this.baseGroup.lockMovementX = false
      this.baseGroup.lockXToPolygon = {}
      if (anchorY != anchorX){
        anchorX.anchoredPolygon = anchorX.anchoredPolygon.filter(item => item !== this.baseGroup)
      }
    } else {
      this.baseGroup.lockMovementY = false
      this.baseGroup.lockYToPolygon = {}
      if (anchorX != anchorY){
        anchorY.anchoredPolygon = anchorY.anchoredPolygon.filter(item => item !== this.baseGroup)
      }
    }
    
    canvas.renderAll();
  }
}

// Function to draw base polygon
function drawBasePolygon(basePolygon, functionalType, calcVertex = true) {
  const baseGroup = new fabric.BaseGroup(basePolygon, functionalType, {
    calcVertex: calcVertex, subTargetCheck: true, lockScalingX: true,// lock scaling
    lockScalingY: true
  });
  canvas.add(baseGroup);
  canvasObject.push(baseGroup);
  //canvas.setActiveObject(baseGroup);
  return baseGroup;
}

function drawLabeledArrow(shapeMeta, options) {
  const { x, y, length, angle, color } = options;
  const vertexleft = shapeMeta[0].vertex[0].x - Math.min(...shapeMeta.map(p => p.vertex).flat().map(v => v.x));
  const vertextop = shapeMeta[0].vertex[0].y - Math.min(...shapeMeta.map(p => p.vertex).flat().map(v => v.y));
  // Create polygon with labeled vertices
  const arrow = drawBasePolygon(
    new GlyphPath(shapeMeta,
      {
        left: x - vertexleft,
        top: y - vertextop,
        fill: color || 'black',
        angle: angle || 0,
        // originX: 'center',
        objectCaching: false,
        strokeWidth: 0,
      }),
      'Symbol'
  );

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
  if (Array.isArray(Polygon2)){
    Polygon2 = Polygon2[0]
  }

  // For simplicity, we'll use prompt for input
  if (options) {
    vertexIndex1 = options.vertexIndex1
    vertexIndex2 = options.vertexIndex2
    spacingX = options.spacingX
    spacingY = options.spacingY
  } else {
    vertexIndex1 = await showTextBox('Enter vertex index for Polygon 1:', 'E1')
    if (vertexIndex1 === null) return;
    vertexIndex2 = await showTextBox('Enter vertex index for Polygon 2:', 'E1')
    if (vertexIndex2 === null) return;
    spacingX = parseInt(await showTextBox('Enter spacing in X (Leave empty if no need for axis):', 100))
    spacingY = parseInt(await showTextBox('Enter spacing in Y (Leave empty if no need for axis):', 100))

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
  if (!Polygon2.anchoredPolygon.includes(Polygon1)){
    Polygon2.anchoredPolygon.push(Polygon1)
  }

  //Polygon1.forEachObject(function (obj) {
  //  //Polygon1.removeWithUpdate(obj)
  //  canvas.remove(obj)
  //})
  //canvas.remove(Polygon1)
  Polygon2.updateAllCoord()
  Polygon1.drawAnchorLinkage()
  if (!Polygon2.borderType) {
    canvas.bringObjectToFront(Polygon2)
  }

  canvas.setActiveObject(Polygon1)
  CanvasObjectInspector.SetActiveObjectList(Polygon1)

  //
  //
  //anvasObject.pop(Polygon1)

  canvas.renderAll();
}

