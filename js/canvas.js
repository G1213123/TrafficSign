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
      ["basePolygon", "anchoredPolygon", "functinoalType", "subObjects", "txtChar", "text", "insertionPoint", "vertex", "anchorageLink", "refTopLeft", "symbol", "xHeight"] // custom attributes
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

// Method to handle arrow key presses for all active objects
function handleArrowKeys(event) {
  const activeObjects = canvas.getActiveObjects();
  let moved = false;

  activeObjects.forEach(obj => {
    switch (event.key) {
      case 'ArrowUp':
        if (!obj.lockMovementY) {
          obj.top -= 1;
          moved = true;
        }
        break;
      case 'ArrowDown':
        if (!obj.lockMovementY) {
          obj.top += 1;
          moved = true;
        }
        break;
      case 'ArrowLeft':
        if (!obj.lockMovementX) {
          obj.left -= 1;
          moved = true;
        }
        break;
      case 'ArrowRight':
        if (!obj.lockMovementX) {
          obj.left += 1;
          moved = true;
        }
        break;
      case 'Delete':
        if (obj.deleteObject){
          obj.deleteObject(null, obj)
        }
        break;
    }
    if (moved) {
      obj.updateAllCoord();
      obj.updateAllCoord();
    }
  });

  if (moved) {
    canvas.renderAll();
  }
}

// Add event listener for arrow keys to the canvas
document.addEventListener('keydown', handleArrowKeys);
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
  // Calculate the appropriate grid distance based on the viewport boundaries
  const corners = canvas.calcViewportBoundaries();
  var xmin = corners.tl.x// Math.floor(corners.tl.x / 50) * 50;
  var xmax = corners.br.x// Math.ceil(corners.br.x / 50) * 50;
  var ymin = corners.tl.y// Math.floor(corners.tl.y / 50) * 50;
  var ymax = corners.br.y// Math.ceil(corners.br.y / 50) * 50;
  const width = xmax - xmin;
  const height = ymax - ymin;
  const maxDimension = Math.max(width, height);

  // Determine the grid distance based on the max dimension
  let gridDistance = 10;
  if (maxDimension > 10000) {
    gridDistance = 500;
  } else if (maxDimension > 2000) {
    gridDistance = 100;
  } else if (maxDimension > 1000) {
    gridDistance = 50;
  }

  xmin = Math.floor(corners.tl.x / gridDistance) * gridDistance;
  xmax = Math.ceil(corners.br.x / gridDistance) * gridDistance;
  ymin = Math.floor(corners.tl.y / gridDistance) * gridDistance;
  ymax = Math.ceil(corners.br.y / gridDistance) * gridDistance;

  const options = {
    distance: gridDistance,
    param: {
      stroke: '#ebebeb',
      strokeWidth: gridDistance / 500,
      selectable: false
    }
  };

  const grid_set = [];

  // Calculate the grid lines relative to the canvas origin
  for (let x = xmin; x <= xmax; x += options.distance) {
    const vertical = new fabric.Line([x, ymin, x, ymax], options.param);
    if (Math.abs(x % (5 * options.distance)) < 1e-6) {
      vertical.set({ strokeWidth: gridDistance / 100 });
      const vText = new fabric.Text(String(x), { left: x, top: 0, fill: options.param.stroke, fontSize: gridDistance / 5 });
      grid_set.push(vText);
    }
    grid_set.push(vertical);
  }

  for (let y = ymin; y <= ymax; y += options.distance) {
    const horizontal = new fabric.Line([xmin, y, xmax, y], options.param);
    if (Math.abs(y % (5 * options.distance)) < 1e-6) {
      horizontal.set({ strokeWidth: gridDistance / 100 });
      const hText = new fabric.Text(String(y), { left: 0, top: y, fill: options.param.stroke, fontSize: gridDistance / 5 });
      grid_set.push(hText);
    }
    grid_set.push(horizontal);
  }

  // Ensure the origin (0, 0) is included in the grid
  const originLineX = new fabric.Line([0, ymin, 0, ymax], { stroke: options.param.stroke, strokeWidth: 1, selectable: false });
  const originLineY = new fabric.Line([xmin, 0, xmax, 0], { stroke: options.param.stroke, strokeWidth: 1, selectable: false });
  grid_set.push(originLineX);
  grid_set.push(originLineY);

  const obj = canvas.getObjects().find(obj => obj.id === 'grid');
  canvas.remove(obj);

  const grid_group = new fabric.Group(grid_set, { id: 'grid', selectable: false, evented: false });
  canvas.add(grid_group);
  canvas.sendObjectToBack(grid_group);
};

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
  document.removeEventListener('keydown', ShowHideSideBarEvent);

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
          //document.addEventListener('keydown', ShowHideSideBarEvent)
        } else if (event.key === 'Escape') {
          resolve(null); // or any specific value indicating the user wants to quit
          hideTextBox();
          answerBox.removeEventListener('keydown', handleKeyDown);
          //document.addEventListener('keydown', ShowHideSideBarEvent)
        }
      });
    });
  } else {
    answerBox.style.display = 'none';
    document.addEventListener('keydown', handleKeyDownEvent)
    return Promise.resolve();
  }
  // document.dispatchEvent(new Event('mousemove'))
}

function hideTextBox() {
  const promptBox = document.getElementById('cursorTextBox');
  const answerBox = document.getElementById('cursorAnswerBox');
  promptBox.style.display = 'none';
  answerBox.style.display = 'none';
  setTimeout(() => {
    document.addEventListener('keydown', ShowHideSideBarEvent);
  }, 1000); // Delay in milliseconds (e.g., 1000ms = 1 second)
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

resizeCanvas();

