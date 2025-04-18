var canvas = this.__canvas = new fabric.Canvas('canvas', { fireMiddleClick: true, fireRightClick: true, preserveObjectStacking: true, enableRetinaScaling: true });
const ctx = canvas.getContext("2d")
let activeObject = null
let selectedArrow = null
let canvasObject = []
canvas.isDragging = false;
canvas.lastPosX = 0;
canvas.lastPosY = 0;
let cursorClickMode = 'normal'; // Default click mode


canvas.setZoom(0.2);

window.addEventListener('resize', resizeCanvas, false);

function resizeCanvas() {
  canvasContainer = document.getElementById('canvas-container')
  canvas.setDimensions({width:canvasContainer.clientWidth, height:canvasContainer.clientHeight})
  canvas.absolutePan({ x: -canvas.width / 2, y: -canvas.height / 2 })
  canvas.renderAll();
  DrawGrid()
}

// Use this code to save and get custom properties at initialization of component
fabric.Object.prototype.toObject = (function (toObject) {
  return function (propertiesToInclude) {
    propertiesToInclude = (propertiesToInclude || []).concat(
      ["basePolygon", "anchoredPolygon", "functionalType", "txtChar", "text", "insertionPoint", "vertex", "refTopLeft", "symbol", "xHeight"] // custom attributes
    );
    return toObject.apply(this, [propertiesToInclude]);
  };
})(fabric.Object.prototype.toObject);

// fire moving for group selection
canvas.on('object:moving', function (event) {
  if (event.target.type === 'activeselection') {
    // Filter out objects with locked movement in x or y from the active selection
    const lockedObjs = event.target._objects.filter(obj => obj.lockMovementX || obj.lockMovementY);
    if (lockedObjs.length > 0) {
      // Remove locked objects from the selection group
      lockedObjs.forEach(obj => {
        event.target.remove(obj);
        canvas.add(obj); // Add back to canvas as individual object
        obj.setCoords(); // Update object coordinates
      });
      // If selection is now empty, discard active object
      if (event.target._objects.length === 0) {
        canvas.discardActiveObject();
      }
      canvas.requestRenderAll();
    }
    event.target._objects.forEach(obj => {
      if (obj.updateAllCoord) {
        obj.updateAllCoord();
      }
    })
  }
});

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

// Handle zoom events
canvas.on('mouse:wheel', function(opt) {
  var delta = opt.e.deltaY;
  var zoom = canvas.getZoom();
  zoom *= 0.999 ** delta;
  if (zoom > 20) zoom = 20;
  if (zoom < 0.01) zoom = 0.01;
  canvas.zoomToPoint({ x: opt.e.offsetX, y: opt.e.offsetY }, zoom);
  opt.e.preventDefault();
  opt.e.stopPropagation();
  DrawGrid()
  
  // Check if active object exists and has lock indicators that need to be redrawn
  const activeObj = canvas.getActiveObject();
  if (activeObj && activeObj.anchorageLink && activeObj.anchorageLink.length > 0) {
    // Redraw anchor linkages to update with new zoom level
    activeObj.drawAnchorLinkage();
  }
  
  // Update dimension lines on zoom if they exist
  if (activeObj && activeObj.showDimensions) {
    // Refresh dimension lines with new zoom level
    activeObj.showDimensions();
  }

  // Update active vertex 
  if (activeVertex){
    activeVertex.clearSnapHighlight()
    activeVertex.addSnapHighlight()
  }
  
  canvas.getObjects().forEach(obj => {
    obj.setCoords();
  });
  canvas.requestRenderAll();
})

canvas.on({
  'selection:updated': lockGroupSelection,
  'selection:created': lockGroupSelection
});

function lockGroupSelection(event) {
  const activeObjects = canvas.getActiveObject();

  if (activeObjects.type === 'activeselection') {
    activeObjects.lockMovementX = true;
    activeObjects.lockMovementY = true; 
    activeObjects.lockScalingX = true;
    activeObjects.lockScalingY = true;
    activeObjects.lockRotation = true;
    activeObjects.lockUniScaling = true;
    activeObjects.hasControls = false;   
  }
}

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
        if (obj.deleteObject) {
          canvas.discardActiveObject(obj)
          canvas.fire('object:deselected', { target: obj });
          obj.deleteObject(null, obj)
        }
        break;
    }
    if (moved) {
      obj.updateAllCoord();
      obj.setCoords();
      obj.fire('moving')
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
  // Check if grid should be visible
  if (typeof GeneralSettings === 'undefined' || GeneralSettings === null) {return;}
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


function CenterCoord(){
  var zoom=canvas.getZoom()
   return{
      x:fabric.util.invertTransform(canvas.viewportTransform)[4]+(canvas.width/zoom)/2,
      y:fabric.util.invertTransform(canvas.viewportTransform)[5]+(canvas.height/zoom)/2
   }
}

function updatePosition(event) {
  const promptBox = document.getElementById('cursorBoxContainer');
  const promptText = document.getElementById('cursorTextBox');
  const answerBox = document.getElementById('cursorAnswerBox');
  
  // Get viewport dimensions
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  // Get cursor box dimensions
  const boxWidth = promptBox.offsetWidth;
  const boxHeight = promptBox.offsetHeight;
  
  // Default offset
  let xOffset = 10;
  let yOffset = 10;
  
  // Check if box would overflow right edge
  if (event.clientX + xOffset + boxWidth > viewportWidth) {
    // Position to the left of cursor instead
    xOffset = -boxWidth - 10;
  }
  
  // Check if box would overflow bottom edge
  if (event.clientY + yOffset + boxHeight > viewportHeight) {
    // Position above cursor instead
    yOffset = -boxHeight - 10;
  }
  
  // Apply the position
  promptBox.style.left = `${event.clientX + xOffset}px`;
  promptBox.style.top = `${event.clientY + yOffset}px`;
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

function showTextBox(text, withAnswerBox = null, event = 'keydown', callback = null, xHeight = null) {
  const promptBox = document.getElementById('cursorTextBox');
  const answerBox = document.getElementById('cursorAnswerBox');

  promptBox.innerText = text;
  promptBox.style.display = 'block';
  document.removeEventListener('keydown', ShowHideSideBarEvent);

  // Unit handling variables
  let currentUnit = 'sw';
  let unitDisplay = null;
  let inputValue = '';

  if (withAnswerBox !== null) {
    answerBox.style.display = 'block';
    answerBox.value = withAnswerBox;
    answerBox.focus();
    answerBox.select();

    // Set up unit display if xHeight is provided
    if (xHeight !== null && !isNaN(parseFloat(withAnswerBox))) {
      // Create or get unit display element
      unitDisplay = document.getElementById('unit-display');
      if (!unitDisplay) {
        unitDisplay = document.createElement('span');
        unitDisplay.id = 'unit-display';
        unitDisplay.className = 'unit-display'; // Use the class from CSS
        answerBox.parentElement.appendChild(unitDisplay);
      }
      
      // Set the unit display text and make it visible
      unitDisplay.innerText = currentUnit;
      unitDisplay.style.display = 'block';
      
      // Initial setup
      inputValue = withAnswerBox;
    }

    // Handle user input and resolve the answer
    return new Promise((resolve) => {
      answerBox.addEventListener('keydown', function handleKeyDown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
          let result = answerBox.value;
          
          // Convert units if in unit mode
          if (xHeight !== null && unitDisplay && !isNaN(parseFloat(result))) {
            if (currentUnit === 'sw') {
              // Convert from sw to mm (1 mm = 1 sw * xHeight / 4)
              result = String(parseFloat(result) * xHeight / 4);
            }
          }
          
          if (unitDisplay) {
            unitDisplay.style.display = 'none';
          }
          
          resolve(result);
          hideTextBox();
          answerBox.removeEventListener('keydown', handleKeyDown);
        } else if (event.key === 'Escape') {
          if (unitDisplay) {
            unitDisplay.style.display = 'none';
          }
          resolve(null);
          hideTextBox();
          answerBox.removeEventListener('keydown', handleKeyDown);
        } else if (event.key === 'Tab' && xHeight !== null && unitDisplay) {
          // Switch between mm and sw units on Tab key press
          event.preventDefault();
          currentUnit = currentUnit === 'mm' ? 'sw' : 'mm';
          
          // Convert the current value between units
          if (!isNaN(parseFloat(answerBox.value))) {
            if (currentUnit === 'sw') {
              // Convert from mm to sw
              answerBox.value = String(parseFloat(answerBox.value) * 4 / xHeight);
            } else {
              // Convert from sw to mm
              answerBox.value = String(parseFloat(answerBox.value) * xHeight / 4);
            }
          }
          
          unitDisplay.innerText = currentUnit;
        }
      });
    });
  } else {
    answerBox.style.display = 'none';
    document.addEventListener(event, callback);
  }
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

async function selectObjectHandler(text, callback, options = null, xHeight = null) {
  // prompt for user to select shape
  const response = await showTextBox(text, ' ', 'keydown', null, xHeight)
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
    if (activeObjects.length > 0 && response !== '') {
      cursorClickMode = 'normal'
      clearInterval(checkShapeInterval)
      hideTextBox()
      successSelected = canvas.getActiveObjects()
      // Clear the selected object from active
      canvas.discardActiveObject();
      canvas.renderAll();
      callback(successSelected, options, response, xHeight);
    }
  }, 100); // Check every 100ms
}

resizeCanvas();

