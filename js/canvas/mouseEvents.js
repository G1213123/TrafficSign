import { CanvasGlobals,DrawGrid } from './canvas.js';
import { canvasTracker } from './Tracker.js';
const canvas = CanvasGlobals.canvas; // Access the global canvas object
const activeVertex = CanvasGlobals.activeVertex; // Access the global active vertex object

// Handle mousedown event
canvas.on('mouse:down', function (opt) {
  const e = opt.e;
  // skip multi-touch pan if pinch-to-zoom is active
  if (e.touches && e.touches.length > 1) return;
  if (e.button === 1) { // Middle mouse button
    canvas.isDragging = true;
    canvas.selection = false;
    canvas.lastPosX = e.clientX;
    canvas.lastPosY = e.clientY;
  }
});
canvas.on('mouse:move', function (opt) {
  // skip if multi-touch gesture (pinch/rotate)
  const e = opt.e;
  if (e.touches && e.touches.length > 1) return;
  if (canvas.isDragging) {
    const vpt = this.viewportTransform;
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
canvas.on('mouse:wheel', function (opt) {
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
  if (activeVertex) {
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

// Add event listeners to detect the end of drag operations
canvas.on('mouse:up', function () {
  // When mouse is released, signal the end of any ongoing drag
  canvasTracker.endDrag();
});

canvas.on('object:modified', function (e) {
  // When an object is modified (e.g., after resizing or rotation is complete), signal the end of any drag
  canvasTracker.endDrag();
  
  // Also capture the detailed state for property tracking
  if (e.target && e.target.id) {
    canvasTracker.trackMetadataChange('objectModified', `Object ${e.target.id} modified`);
  }
});
