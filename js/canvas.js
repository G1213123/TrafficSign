var canvas = this.__canvas = new fabric.Canvas('canvas', { fireMiddleClick: true, fireRightClick: true, preserveObjectStacking: true });
const ctx = canvas.getContext("2d")
let activeObject = null
let selectedArrow = null
let canvasObject = []
canvas.isDragging = false;
canvas.lastPosX = 0;
canvas.lastPosY = 0;


window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
  canvasContainer = document.getElementById('canvas-container')
  canvas.setWidth(canvasContainer.clientWidth)
  canvas.setHeight(canvasContainer.clientHeight)
  canvas.absolutePan({ x: -canvas.width / 2, y: -canvas.height / 2 })
  canvas.renderAll();
  DrawGrid()
}

// Use this code to save and get custom properties at initialization of component
fabric.Object.prototype.toObject = (function (toObject) {
  return function (propertiesToInclude) {
    propertiesToInclude = (propertiesToInclude || []).concat(
      ["basePolygon", "anchoredPolygon", "functinoalType", "subObjects", "txtChar", "text"] // custom attributes
    );
    return toObject.apply(this, [propertiesToInclude]);
  };
})(fabric.Object.prototype.toObject);

// function to loop through anchored objects and add them to the borderinginObjects array
function loopAnchoredObjects(obj, callback = null, options = {}, objList = []) {
  if (obj.basePolygon) {
    if (obj.anchoredPolygon.length) {
      obj.anchoredPolygon.forEach((anchoredObj) => {
        loopAnchoredObjects(anchoredObj, callback, options, objList = objList)
      })
    }
    objList.push(obj.basePolygon)
    if (callback) {
      callback(obj, options)
    }
    return objList

  } else {
    if (obj.length) {
      obj.forEach((o) => {
        objList = loopAnchoredObjects(o, callback, options, objList = objList)
      })
    }

    return objList
  }
}
// Handle mousedown event
canvas.on('mouse:down', function (opt) {
  var e = opt.e;
  if (e.button === 1) { // Middle mouse button
    canvas.isDragging = true;
    canvas.selection = false;
    canvas.lastPosX = e.clientX;
    canvas.lastPosY = e.clientY;
  }
});
canvas.on('mouse:move', function (opt) {
  if (this.isDragging) {
    var e = opt.e;
    var vpt = this.viewportTransform;
    vpt[4] += e.clientX - canvas.lastPosX;
    vpt[5] += e.clientY - canvas.lastPosY;
    canvas.requestRenderAll();
    canvas.lastPosX = e.clientX;
    canvas.lastPosY = e.clientY;
    DrawGrid()
        // Update the coordinates of all objects to ensure controls are updated
        canvas.getObjects().forEach(obj => {
          obj.setCoords();
        });
  }
});
canvas.on('mouse:up', function (opt) {
  // on mouse up we want to recalculate new interaction
  // for all objects, so we call setViewportTransform\
  canvas.isDragging = false;
  canvas.selection = true;

});

canvas.on('mouse:wheel', function (opt) {
  var delta = opt.e.deltaY;
  var zoom = canvas.getZoom();
  zoom *= 0.999 ** delta;
  if (zoom > 20) zoom = 20;
  if (zoom < 0.01) zoom = 0.01;
  canvas.zoomToPoint(new fabric.Point(opt.e.clientX, opt.e.clientY), zoom);
  opt.e.preventDefault();
  opt.e.stopPropagation();
  DrawGrid()
})


// Add event listener for object:moving event on the canvas 
//canvas.on('object:moving', handleGroupMoving);

// Function to handle the moving event for all selected objects
function handleGroupMoving(event) {
  const activeObject = event.target;

  // Check if multiple objects are selected (active selection)
  if (activeObject.type === 'activeSelection') {
    // Iterate over all selected objects
    activeObject._objects.forEach((obj) => {
      // Check if the object has an onMoving function and call it
      if (typeof obj.onMoving === 'function') {
        obj.onMoving();
      }
    });
  } else {
    // Single object is selected, call its onMoving function if it exists
    if (typeof activeObject.onMoving === 'function') {
      activeObject.onMoving();
    }
  }

  // Re-render the canvas
  canvas.renderAll();
}

function DrawGrid() {
  
  options = {
    distance: 10,
    param: {
      stroke: '#ebebeb',
      strokeWidth: 0.1,
      selectable: false
    }
  },

    corners = canvas.calcViewportBoundaries()
    xmin = Math.floor((corners.tl.x) / 50) * 50,
    xmax = Math.ceil((corners.br.x) / 50) * 50,
    ymin = Math.floor((corners.tl.y) / 50) * 50,
    ymax = Math.ceil((corners.br.y) / 50) * 50,
    width = xmax - xmin,
    height = ymax - ymin,
    gridLen = Math.max(width, height) / options.distance;
  grid_set = [];

  for (var i = 0; i < gridLen + 1; i++) {
    var distance = i * options.distance,
      vertical = new fabric.Line([distance + xmin, ymin, distance + xmin, gridLen * 10 + ymin], options.param)
    horizontal = new fabric.Line([xmin, distance + ymin, gridLen * 10 + xmin, distance + ymin], options.param);

    if (i % 5 === 0) {
      horizontal.set({ strokeWidth: 0.5 });
      vertical.set({ strokeWidth: 0.5 });
      vText = new fabric.Text(String(distance + xmin), { left: distance + xmin, top: 0, fill: options.param.stroke, fontSize: 10 })
      hText = new fabric.Text(String(distance + ymin), { left: 0, top: distance + ymin, fill: options.param.stroke, fontSize: 10 })
      grid_set.push(hText);
      grid_set.push(vText);
    };

    grid_set.push(horizontal);
    grid_set.push(vertical);
  };

  let obj = canvas.getObjects().find(obj => obj.id === 'grid');
  canvas.remove(obj);

  grid_group = new fabric.Group(grid_set, { id: 'grid', "selectable": false, "evented": false });
  canvas.add(grid_group);
  canvas.sendObjectToBack (grid_group)
};


resizeCanvas();

