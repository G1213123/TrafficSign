const deleteIcon =
  "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
let activeVertex = null
let vertexSnapInProgress = false; // New flag to prevent multiple clicks during snapping



// additional property for fabric object
const originalToObject = fabric.Object.prototype.toObject;
const myAdditional = ['functionalType'];
fabric.Object.prototype.toObject = function (additionalProperties) {
  return originalToObject.call(this, myAdditional.concat(additionalProperties));
}

// Enable double-click detection on canvas
canvas.on('mouse:down', function (options) {
  if (options.e.type === 'dblclick') {
    const target = options.target;
    if (target && target.dblclick) {
      target.dblclick(options.e);
    } else if (target) {
      const eventData = {
        e: options.e,
        target: target
      };
      canvas.fire('object:dblclick', eventData);
      target.fire('mousedblclick', options.e);
    }
  }
});


class GlyphPath extends fabric.Group {
  constructor(options) {
    super([], options); // Call the parent class constructor first

    //this.initialize(shapeMeta, options);
  }

  async initialize(shapeMeta, options) {
    shapeMeta.path.map((p) => {
      let transformed = calculateTransformedPoints(p.vertex, {
        x: options.left,
        y: options.top,
        angle: options.angle
      });
      p.vertex = transformed;
    });

    if (shapeMeta.text) {
      shapeMeta.text.map((p) => {
        let transformed = calculateTransformedPoints([{ x: p.x, y: -p.y, label: '' }], {
          x: options.left,
          y: options.top,
          angle: options.angle
        });
        p.x = transformed[0].x;
        p.y = -transformed[0].y;
      });
    }

    const vertexleft = Math.min(...shapeMeta.path.map(p => p.vertex).flat().map(v => v.x));
    const vertextop = Math.min(...shapeMeta.path.map(p => p.vertex).flat().map(v => v.y));

    options.left = vertexleft;
    options.top = vertextop;
    options.angle = 0;

    const pathData = await vertexToPath(shapeMeta, options.fill);

    this.vertex = shapeMeta.path.map(p => p.vertex).flat(); // Store the shapeMeta.vertex points
    this.insertPoint = shapeMeta.path[0].vertex[0];

    const result = await fabric.loadSVGFromString(pathData)
    const obj = fabric.util.groupSVGElements(result.objects);
    obj.set(options);
    obj.set({ strokeWidth: 0 })
    this.add(obj);
    this.setCoords();

  }
}


// Define the BaseGroup class using ES6 class syntax
class BaseGroup extends fabric.Group {
  constructor(basePolygon, functionalType, options = {}) {
    super([], Object.assign({}, options, {
      subTargetCheck: true,
      lockScalingX: true,// lock scaling
      lockScalingY: true
    }));

    this.functionalType = functionalType;
    this.anchoredPolygon = [];
    this.anchorageLink = [];
    this.subObjects = [];
    this.lockXToPolygon = {};
    this.lockYToPolygon = {};
    this.refTopLeft = { top: 0, left: 0 }; // Initialize even without basePolygon
    this.dimensionAnnotations = []; // Array to hold dimension line objects
    this.isTemporary = false;
    this.focusMode = false; // Add focus mode flag

    canvasObject.push(this);
    this.canvasID = canvasObject.length - 1;
    this._showName = `<Group ${this.canvasID}> ${functionalType}`;

    // Add to canvas regardless of basePolygon
    canvas.add(this);

    // Track object creation
    canvasTracker.track('createObject', [{
      type: 'BaseGroup',
      id: this.canvasID,
      functionalType: functionalType,
      hasBasePolygon: !!basePolygon
    }]);

    // remove default fabric control
    Object.values(this.controls).forEach((control) => {
      control.visible = false;
    })

    // If basePolygon is provided, initialize with it
    if (basePolygon) {
      this.setBasePolygon(basePolygon, options.calcVertex);
    }

    // add delete control
    this.controls.deleteControl = new fabric.Control({
      x: 0.5,
      y: -0.5,
      offsetY: 40,
      cursorStyle: 'pointer',
      mouseUpHandler: this.deleteObject,
      render: this.renderIcon,
      cornerSize: 24,
    });

    CanvasObjectInspector.createObjectListPanelInit();

    this.on('selected', () => {
      this.drawAnchorLinkage();
      CanvasObjectInspector.SetActiveObjectList(this);
      this.showLockHighlights();

      // Redraw vertices when selected to apply current vertex display settings
      if (this.basePolygon && this.basePolygon.vertex) {
        this.drawVertex(false);
      }

      // Show dimension lines when object is selected

        this.showDimensions();
      
    });

    this.on('deselected', () => {
      setTimeout(() => {
        this.anchorageLink.forEach(obj => {
          obj.objects.forEach(o => {
            o.set('opacity', 0);
          })
        });
        this.hideLockHighlights();

        // Hide dimension lines when object is deselected
        this.hideDimensions();
      }, 0)
      CanvasObjectInspector.SetActiveObjectList(null)
    });

    this.on('mouseover', function () {
      this.set({
        opacity: 0.5
      });
      if (this.__corner) {
        if (this.controls[this.__corner].onHover) {
          this.controls[this.__corner].onHover()
        } else {
          Object.values(this.controls).forEach(control => { if (control.onMouseOut) { control.onMouseOut() } })
        }
      } else {
        Object.values(this.controls).forEach(control => { if (control.onMouseOut) { control.onMouseOut() } })
      }
      canvas.renderAll();
    });


    this.on('mouseout', function () {
      this.set({
        opacity: 1
      });
      Object.values(this.controls).forEach(control => { if (control.onMouseOut) { control.onMouseOut() } })
      canvas.renderAll();
    });

    this.on('modified', this.updateAllCoord.bind(this));
    this.on('moving', this.updateAllCoord.bind(this));


    this.on('moving', () => {

        this.showDimensions();
      
    });
    this.on('modified', () => {

        this.showDimensions();

    });
  }

  // Show border dimensions when selected
  showDimensions() {
    // Clean up any existing dimension annotations
    this.hideDimensions();

    // Get border coordinates
    const borderRect = this.getBoundingRect();

    // Find closest objects in each direction to show dimensions
    if (!this.isTemporary && !this.focusMode){
      this.createDimensionAnnotations(borderRect);
    }
  }

  // Hide all dimension annotations
  hideDimensions() {
    // Remove all dimension annotations from canvas
    this.dimensionAnnotations.forEach(annotation => {
      canvas.remove(...annotation.objects);
    });
    this.dimensionAnnotations = [];
  }

  // Create dimension annotations for the border and contained objects
  createDimensionAnnotations(borderRect) {


    // Create horizontal dimensions (left and right)
    const leftDimension = new BorderDimensionDisplay({
      direction: 'horizontal',
      startX: borderRect.left,
      startY: borderRect.top + (borderRect.height / 2),
      endX: borderRect.left + borderRect.width,
      color: 'green',
      offset: 30 / canvas.getZoom()
    });
    this.dimensionAnnotations.push(leftDimension);



    // Create vertical dimensions (top and bottom)
    const topDimension = new BorderDimensionDisplay({
      direction: 'vertical',
      startX: borderRect.left + (borderRect.width / 2),
      startY: borderRect.top,
      endY: borderRect.top + borderRect.height,
      color: 'red',
      offset: 30 / canvas.getZoom()
    });
    this.dimensionAnnotations.push(topDimension);


  }

  /**
   * Sets the basePolygon after construction
   * @param {Object} basePolygon - The polygon to set as base
   * @param {boolean} calcVertex - Whether to calculate vertices
   */
  setBasePolygon(basePolygon, calcVertex = true) {
    this.basePolygon = basePolygon;

    if (this.basePolygon) {
      // Update name with additional info if available
      this._showName = `<Group ${this.canvasID}> ${this.functionalType}${basePolygon.text ? ' - ' + basePolygon.text : ''}${basePolygon.symbol ? ' - ' + basePolygon.symbol : ''}${this.roadType ? ' - ' + this.roadType : ''}`;

      this.basePolygon.insertPoint = this.basePolygon.vertex ? this.basePolygon.vertex[0] : null;
      canvas.remove(this.basePolygon);
      this.add(this.basePolygon);

      this.drawVertex(calcVertex);

      // Set reference top-left corner
      if (this.basePolygon.getCoords) {
        this.refTopLeft = {
          top: this.basePolygon.getCoords()[0].y,
          left: this.basePolygon.getCoords()[0].x
        };
      }
    }
  }

  replaceBasePolygon(newBasePolygon, calcVertex = true) {
    this.removeAll();
    this.setBasePolygon(newBasePolygon, calcVertex);
    this.setCoords();
    canvas.renderAll();
  }

  drawVertex(calc = true) {
    // If basePolygon doesn't exist, exit early
    if (!this.basePolygon) return;

    if (!this.basePolygon.vertex) {
      this.basePolygon.vertex = [];
    }

    if (calc) {
      this.basePolygon.vertex = this.basePolygon.vertex.filter(v => !v.label.startsWith('E'));
      let basePolygonCoords = Object.values(this.basePolygon.getCoords());
      basePolygonCoords.forEach((p, i) => {
        this.basePolygon.vertex.push({ x: p.x, y: p.y, label: `E${i * 2 + 1}` });
        const midpoint = {
          x: (p.x + basePolygonCoords[(i + 1 === basePolygonCoords.length) ? 0 : i + 1].x) / 2,
          y: (p.y + basePolygonCoords[(i + 1 === basePolygonCoords.length) ? 0 : i + 1].y) / 2,
          label: `E${(i + 1) * 2}`
        };
        this.basePolygon.vertex.push(midpoint);
      });
      //if (this.addMidPointToDivider) {
      //  this.addMidPointToDivider(this);
      //}
    }


    // Always check current GeneralSettings, not just when toggled
    const showAllVertices = GeneralSettings && GeneralSettings.showAllVertices;

    // Process vertices according to hierarchy and create/update controls
    this.basePolygon.vertex.forEach(v => {
      const vertexLabel = v.label;
      let shouldDisplay = false;

      // Rule 1: Native controls (ml, tl, br, etc.) should always be hidden
      if (/^(ml|mr|mt|mb|mtr|tl|tr|bl|br)$/.test(vertexLabel)) {
        shouldDisplay = false;
      }
      // Rule 2: Always no show side road vertices
      else if (this.functionalType === 'SideRoad' && v.label.startsWith('E')) {
        shouldDisplay = false;
      }
      // Rule 3: Focus mode - only show active vertex
      else if (this.focusMode && activeVertex) {
        shouldDisplay = (activeVertex.vertex.label === vertexLabel);
      }
      // Rule 4: ShowAllVertices setting overrides other display logic
      else if (showAllVertices) {
        shouldDisplay = true;
      }
      // Rule 5: Base on display property or default to showing vertex with labels
      else {
        shouldDisplay = (v.display !== 0);
      }

      // Update or create control for this vertex
      if (!this.controls[vertexLabel]) {
        // Create new control for vertices that don't have one
        this.controls[vertexLabel] = new VertexControl(v, this);
        this.controls[vertexLabel].visible = shouldDisplay;
      }
      
      // For SideRoad objects, set the control location to match the basePolygon location
      if (this.functionalType=== 'SideRoad') {
        // Update control position to match the vertex position
        this.controls[vertexLabel].x = (v.x - this.left) / this.width - 0.5;
        this.controls[vertexLabel].y = (v.y - this.top) / this.height - 0.5;
        
        // Ensure the offsets are reset
        this.controls[vertexLabel].offsetX = 0;
        this.controls[vertexLabel].offsetY = 0;
      }

      this.controls[vertexLabel].visible = shouldDisplay;
    });


    this.setCoords();
  }
  // Method to emit deltaX and deltaY to anchored groups
  emitDelta(deltaX, deltaY, sourceList = []) {
    sourceList.includes(this) ? sourceList : sourceList.push(this)
    this.anchoredPolygon.forEach(anchoredGroup => {
      if (!sourceList.includes(anchoredGroup)) {
        // check receive change object to avoid self reference in border resize{
        anchoredGroup.receiveDelta(this, deltaX, deltaY, sourceList);
      }

    });
    // If all nodes are exhausted, call another function
    if (this.canvasID == sourceList[0].canvasID) {
      this.allNodesProcessed(sourceList);
    }

  }

  // Method to receive deltaX and deltaY and update position
  receiveDelta(caller, deltaX, deltaY, sourceList) {
    sourceList.includes(this) ? sourceList : sourceList.push(this)
    const newDeltaX = this.lockXToPolygon.TargetObject == caller  ? deltaX : 0
    const newDeltaY = this.lockYToPolygon.TargetObject == caller  ? deltaY : 0
    this.set({
      left: this.left + newDeltaX,
      top: this.top + newDeltaY
    });
    this.setCoords();
    this.updateAllCoord(null, sourceList);
  }

  // Method to call when all nodes are processed
  allNodesProcessed(sourceList = []) {
    canvasObject.map(o => o.lockXToPolygon).filter(o => o.secondSourceObject).forEach(o => { EQanchorShape('x', o, sourceList) })
    canvasObject.map(o => o.lockYToPolygon).filter(o => o.secondSourceObject).forEach(o => { EQanchorShape('y', o, sourceList) })
    //console.log('All nodes processed');
    // Call another function here
  }

  // Method to call for border resizing
  borderResize(sourceList = []) {
    sourceList.includes(this) ? sourceList : sourceList.push(this)
    if (this.borderGroup && !sourceList.includes(this.borderGroup)) {
      const BG = this.borderGroup
      BG.removeAll()
      // Get the bounding box of the active selection 
      let coords = BorderUtilities.getBorderObjectCoords(BG.heightObjects, BG.widthObjects)

      if (!isNaN(parseInt(BG.fixedWidth))) {
        const padding = parseInt(BG.fixedWidth) - coords.right + coords.left
        coords.left -= padding / 2
        coords.right += padding / 2
      }
      if (!isNaN(parseInt(BG.fixedHeight))) {
        const padding = parseInt(BG.fixedHeight) - coords.bottom + coords.top
        coords.top -= padding / 2
        coords.bottom += padding / 2
      }

      // handle roundings on borders and dividers
      //const rounding = BorderUtilities.calcBorderRounding(BG.borderType, BG.xHeight, coords)
      //BorderUtilities.RoundingToDivider(BG.HDivider, BG.VDivider, rounding, sourceList)

      const borderObject = drawLabeledBorder(BG.borderType, BG.xHeight, coords, BG.color)

      BG.add(borderObject)
      BG.basePolygon = borderObject
      BG.assignWidthToDivider(sourceList)
      //BG.addMidPointToDivider()
      BG.updateAllCoord(null, sourceList)
      BG.drawVertex()

    
    
    // Update reference points and vertices
    BG.refTopLeft = {
      top: BG.basePolygon.getCoords()[0].y,
      left: BG.basePolygon.getCoords()[0].x
    };
    
    // Safely assign widths to dividers
    BG.assignWidthToDivider();
    
    // Redraw vertices
    BG.drawVertex();
    
    canvas.renderAll();
  }
  }

  getBasePolygonVertex(label) {
    // Add null check
    if (!this.basePolygon || !this.basePolygon.vertex) return null;
    return this.basePolygon.vertex.find(v => v.label === label.toUpperCase());
  }

  drawAnchorLinkage() {
    for (let i = this.anchorageLink.length - 1; i >= 0; i--) {
      const obj = this.anchorageLink[i];

      this.anchorageLink.splice(i, 1); // Remove the element from the array
      obj.objects.forEach(e => {
        this.remove(e); // Remove the object from the group
        canvas.remove(e); // Remove the object from the canvas
      })

    }
    if (Object.keys(this.lockXToPolygon).length) {
      let lockAnno1 = new LockIcon(this, this.lockXToPolygon, 'x')
      this.anchorageLink.push(lockAnno1);
      canvas.add(...lockAnno1.objects);

    }
    if (Object.keys(this.lockYToPolygon).length) {
      let lockAnno2 = new LockIcon(this, this.lockYToPolygon, 'y')
      this.anchorageLink.push(lockAnno2);
      canvas.add(...lockAnno2.objects);

    }
    const isActive = canvas.getActiveObject() === this;
    const opacity = isActive ? 1 : 0;
    this.anchorageLink.forEach(obj => {
      obj.objects.forEach(o => {
        o.set('opacity', opacity);
      })
    });
    canvas.renderAll();

  }
  // Method to update coordinates and emit delta
  updateAllCoord(event, sourceList = [], selfOnly = false) {
    // Check for basePolygon before calculating deltas
    if (!this.basePolygon || !this.basePolygon.getCoords) {
      // If basePolygon doesn't exist yet, just return
      return;
    }

    const deltaX = this.basePolygon.getCoords()[0].x - this.refTopLeft.left;
    const deltaY = this.basePolygon.getCoords()[0].y - this.refTopLeft.top;

    // Only track modifications if actual movement occurred
    if (deltaX !== 0 || deltaY !== 0) {
      // Track object modification
      canvasTracker.track('modifyObject', [{
        type: 'BaseGroup',
        id: this.canvasID,
        functionalType: this.functionalType,
        deltaX: deltaX,
        deltaY: deltaY
      }]);
    }

    this.updateCoord(deltaX, deltaY);
    this.refTopLeft = { top: this.basePolygon.getCoords()[0].y, left: this.basePolygon.getCoords()[0].x };

    // Check for route-specific methods
    if (this.onMove) {
      this.onMove();
    }

    if (canvas.getActiveObject() === this) {
      this.drawAnchorLinkage();
      this.showLockHighlights();
      this.showDimensions();
    }

    sourceList.includes(this) ? sourceList : sourceList.push(this);
    if (!selfOnly && (deltaX !== 0 || deltaY !== 0)) {
      this.emitDelta(deltaX, deltaY, sourceList);
    }
    if ((sourceList[0].borderGroup !== this.borderGroup || sourceList[0] == this) && this.functionalType !== 'HDivider' && this.functionalType !== 'VDivider' && this.functionalType !== 'HLine' && this.functionalType !== 'VLane') {
      this.borderResize(sourceList);
    }

    if (document.getElementById('debug-info-panel')) {
      FormDebugComponent.updateDebugInfo(canvas.getActiveObjects())
    }
  }

  // Method to update coordinates
  updateCoord(updateX, updateY) {
    // Check for basePolygon
    if (!this.basePolygon || !this.basePolygon.vertex) {
      return;
    }

    const polygon = this.basePolygon;

    const transformedPoints = calculateTransformedPoints(polygon.vertex, {
      x: updateX,
      y: updateY,
      angle: 0
    });

    // Update customList with new coordinates
    transformedPoints.forEach((point, index) => {
      polygon.vertex[index].x = point.x;
      polygon.vertex[index].y = point.y;
    });

    if (this.routeList) {
      this.routeList.forEach((item) => {
        item.x += updateX;
        item.y += updateY;
      });
    }

    polygon.insertPoint = transformedPoints[0];
    polygon.setCoords();
    canvas.renderAll();
  }

  getEffectiveCoords() {
    // Add null check
    if (!this.basePolygon) {
      return [
        { x: this.left, y: this.top },
        { x: this.left + this.width, y: this.top },
        { x: this.left + this.width, y: this.top + this.height },
        { x: this.left, y: this.top + this.height }
      ];
    }

    if (this.basePolygon.getCombinedBoundingBoxOfRects) {
      var allCoords = this.basePolygon.getCombinedBoundingBoxOfRects();
      return [allCoords[0], allCoords[2], allCoords[4], allCoords[6]];
    }
    return this.basePolygon.getCoords();
  }
  // Method to delete the object
  deleteObject(_eventData, transform) {    const deleteObj = transform?.target || transform || this

    // Track object deletion before actually deleting it
    canvasTracker.track('deleteObject', [{
      type: 'BaseGroup',
      id: deleteObj.canvasID,
      functionalType: deleteObj.functionalType
    }]);

    // Store the original canvasID before removing the object
    const originalCanvasID = deleteObj.canvasID;

    // Now remove from the canvasObject array and create ID mapping
    const index = canvasObject.indexOf(deleteObj)
    if (index > -1) {
      canvasObject.splice(index, 1);
      
      // Create a mapping of old IDs to new IDs for anchor tree update
      const idMapping = {};
      
      // Update IDs for remaining objects
      for (let i = index; i < canvasObject.length; i++) {
        const oldID = canvasObject[i].canvasID;
        canvasObject[i].canvasID -= 1;
        idMapping[oldID] = canvasObject[i].canvasID;
      }
      
      // Update the anchor tree with the new ID mapping
      if (typeof globalAnchorTree !== 'undefined') {
        globalAnchorTree.updateOnDelete(originalCanvasID, idMapping);
      }
    }

    //delete route branch
    if (deleteObj.mainRoad) {
      const mainRoad = deleteObj.mainRoad
      const branchIndex = mainRoad.sideRoad.indexOf(deleteObj)
      if (branchIndex >= 0) {
        mainRoad.sideRoad.splice(branchIndex, 1)
        // Find and remove the vertices with matching labels for the branch being deleted
        const vertexLabels = [`C${branchIndex}`];
        mainRoad.basePolygon.vertex = mainRoad.basePolygon.vertex.filter(vertex =>
          !vertexLabels.includes(vertex.label)
        );
      }

      mainRoad.receiveNewRoute()
      mainRoad.setCoords()

    } else if (deleteObj.sideRoad) {
      const sideRoad = deleteObj.sideRoad
      sideRoad.forEach(side => {
        side.mainRoad = null
        side.deleteObject()
      })
    }

    // Free anchored Polygon
    if (deleteObj.anchoredPolygon) {
      deleteObj.anchoredPolygon.forEach(anchoredGroup => {

        if (anchoredGroup.lockXToPolygon.TargetObject == deleteObj) {
          anchoredGroup.lockXToPolygon = {}
          anchoredGroup.set({ lockMovementX: false });
        }
        if (anchoredGroup.lockYToPolygon.TargetObject == deleteObj) {
          anchoredGroup.lockYToPolygon = {}
          anchoredGroup.set({ lockMovementY: false });
        }
        anchoredGroup.drawAnchorLinkage()
      })
    }

    // Free border
    if (deleteObj.borderGroup) {
      if (deleteObj.borderGroup.widthObjects) {
        const index = deleteObj.borderGroup.widthObjects.indexOf(deleteObj);
        deleteObj.borderGroup.widthObjects.splice(index, 1);
      }
      if (deleteObj.borderGroup.heightObjects) {
        const index = deleteObj.borderGroup.heightObjects.indexOf(deleteObj);
        deleteObj.borderGroup.heightObjects.splice(index, 1);
      }
      if (deleteObj.borderGroup.HDivider) {
        const index = deleteObj.borderGroup.HDivider.indexOf(deleteObj);
        deleteObj.borderGroup.HDivider.splice(index, 1);
      }
      if (deleteObj.borderGroup.VDivider) {
        const index = deleteObj.borderGroup.VDivider.indexOf(deleteObj);
        deleteObj.borderGroup.VDivider.splice(index, 1);
      }
      deleteObj.borderResize()
    }

    // If this is a borderGroup
    if (deleteObj.widthObjects) {
      deleteObj.widthObjects.forEach(obj => obj.borderGroup = null)
    }
    if (deleteObj.heightObjects) {
      deleteObj.heightObjects.forEach(obj => obj.borderGroup = null)
    }
    canvas.remove(deleteObj);
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

  // New method: get final lock target along given axis
  getFinalLockTarget(axis) {
    const lockProp = axis === 'x' ? 'lockXToPolygon' : 'lockYToPolygon';
    let current = this;
    const visited = new Set();
    while (current[lockProp] && current[lockProp].TargetObject) {
      let next = current[lockProp].TargetObject;
      if (visited.has(next)) break;
      visited.add(next);
      current = next;
    }
    return current !== this ? current : null;
  }

  // New method: display temporary highlight border for lock targets
  showLockHighlights() {
    this.hideLockHighlights()
    if (this.lockXToPolygon && Object.keys(this.lockXToPolygon).length) {
      const finalX = this.getFinalLockTarget('x');
      if (finalX) {
        const rect = finalX.getBoundingRect ? finalX.getBoundingRect() : finalX.getCoords();
        this.lockHighlightX = new fabric.Rect({
          left: rect.left - 2,
          top: rect.top - 2,
          width: rect.width - 2,
          height: rect.height - 2,
          fill: 'transparent',
          stroke: 'green',
          strokeWidth: 4,
          selectable: false,
          evented: false,
        });
        canvas.add(this.lockHighlightX);
      }
    }
    if (this.lockYToPolygon && Object.keys(this.lockYToPolygon).length) {
      const finalY = this.getFinalLockTarget('y');
      if (finalY) {
        const rect = finalY.getBoundingRect ? finalY.getBoundingRect() : finalY.getCoords();
        this.lockHighlightY = new fabric.Rect({
          left: rect.left - 2,
          top: rect.top - 2,
          width: rect.width - 2,
          height: rect.height - 2,
          fill: 'transparent',
          stroke: 'red',
          strokeWidth: 4,
          selectable: false,
          evented: false,
        });
        canvas.add(this.lockHighlightY);
      }
    }
  }

  // New method: remove the temporary highlight borders
  hideLockHighlights() {
    if (this.lockHighlightX) {
      canvas.remove(this.lockHighlightX);
      this.lockHighlightX = null;
    }
    if (this.lockHighlightY) {
      canvas.remove(this.lockHighlightY);
      this.lockHighlightY = null;
    }
  }

  // New method to enter focus mode
  enterFocusMode(activeVertexControl) {
    this.focusMode = true;
    this.hideDimensions();
    //this.drawVertex(false);
    canvas.renderAll();
  }

  // New method to exit focus mode
  exitFocusMode() {
    this.focusMode = false;
    //this.drawVertex(false);
    if (canvas.getActiveObject() === this) {
      this.showDimensions();
    }
    canvas.renderAll();
  }
}

// Register the custom class with Fabric.js
fabric.BaseGroup = BaseGroup;

class LockIcon {
  constructor(baseGroup, lockParam, direction) {
    this.baseGroup = baseGroup;
    this.direction = direction
    this.lines = []
    this.dimensionTexts = []
    this.icons = []

    let sourcePoint = lockParam.sourceObject.getBasePolygonVertex(lockParam.sourcePoint)
    let targetPoint = lockParam.TargetObject.getBasePolygonVertex(lockParam.targetPoint)
    this.createLock(sourcePoint, targetPoint)

    if (lockParam.secondSourceObject) {
      let sourcePoint = lockParam.secondSourceObject.getBasePolygonVertex(
        lockParam.secondSourcePoint)
      let targetPoint = lockParam.secondTargetObject.getBasePolygonVertex(lockParam.secondTargetPoint)
      this.createLock(sourcePoint, targetPoint)
    }

    this.icons.forEach(i => {
      // Add hover and click event listeners
      i.on('mouseover', this.onHover.bind(this));
      i.on('mouseout', this.onMouseOut.bind(this));
      i.on('mousedown', this.onClick.bind(this));
    })

    // Add lock lines and lock icon to the canvas
    this.objects = [...this.lines, ...this.dimensionTexts, ...this.icons,]
  }

  createLock(sourcePoint, targetPoint) {
    // Fixed offset distances for engineering dimension style
    const offsetDistance = 30; // Fixed pixel offset for dimension line
    const iconOffset = 15;     // Fixed pixel offset for lock icon

    // Scale adjustments based on zoom
    const zoom = canvas.getZoom();
    const lineWidth = 1 / zoom;        // Thinner lines for engineering style
    const fontSize = 15 / zoom;        // Fixed 15px font size
    const arrowSize = 12 / zoom;        // Size of dimension arrows
    const extensionLineLength = 8 / zoom; // Length of extension lines

    // Create dimension lines and position lock icon based on direction
    if (this.direction == 'x') {
      // Position of dimension line, offset from source and target points
      const dimLineY = sourcePoint.y - offsetDistance / zoom;

      // Extension lines (vertical lines from source and target points to dimension line)
      this.lines.push(new fabric.Line(
        [sourcePoint.x, sourcePoint.y, sourcePoint.x, dimLineY - extensionLineLength],
        {
          stroke: 'green',
          strokeWidth: lineWidth,
          selectable: false,
          functionalType: 'anchorLine'
        }
      ));

      this.lines.push(new fabric.Line(
        [targetPoint.x, targetPoint.y, targetPoint.x, dimLineY - extensionLineLength],
        {
          stroke: 'green',
          strokeWidth: lineWidth,
          selectable: false,
          functionalType: 'anchorLine'
        }
      ));

      // Main dimension line
      this.lines.push(new fabric.Line(
        [sourcePoint.x, dimLineY, targetPoint.x, dimLineY],
        {
          stroke: 'green',
          strokeWidth: lineWidth,
          selectable: false,
          functionalType: 'anchorLine',
        }
      ));

      // Add arrow endpoints
      this.addArrow(sourcePoint.x, dimLineY, 'right', 'green', arrowSize);
      this.addArrow(targetPoint.x, dimLineY, 'left', 'green', arrowSize);

      // Calculate the midpoint for dimension text and icon
      const midX = (sourcePoint.x + targetPoint.x) / 2;
      const midY = dimLineY - (iconOffset / zoom);

      // Dimension text
      this.dimensionTexts.push(new fabric.Text(
        (targetPoint.x - sourcePoint.x).toFixed() + 'mm',
        {
          left: midX,
          top: dimLineY - (25 / canvas.getZoom()),
          fontSize: fontSize,
          fill: 'green',
          fontFamily: 'Arial',
          textAlign: 'center',
          originX: 'center',
          originY: 'bottom',
          selectable: false,
          evented: false,
          stroke: '#fff',
          strokeWidth: 3 / canvas.getZoom(),
          paintFirst: 'stroke'
        }
      ));

      // Lock icon at fixed position relative to dimension line
      this.icons.push(new fabric.Text('\uf023', {
        fontFamily: 'Font Awesome 5 Free',
        fontWeight: 900,
        left: midX,
        top: midY,
        fontSize: fontSize,
        fill: 'gold',
        stroke: 'black',
        strokeWidth: 0.5 / zoom,
        originX: 'center',
        originY: 'center',
        selectable: false,
        functionalType: 'lockIcon',
      }));

    } else { // Y direction
      // Position of dimension line, offset from source and target points
      const dimLineX = sourcePoint.x - offsetDistance / zoom;

      // Extension lines (horizontal lines from source and target points to dimension line)
      this.lines.push(new fabric.Line(
        [sourcePoint.x, sourcePoint.y, dimLineX - extensionLineLength, sourcePoint.y],
        {
          stroke: 'red',
          strokeWidth: lineWidth,
          selectable: false,
          functionalType: 'anchorLine'
        }
      ));

      this.lines.push(new fabric.Line(
        [targetPoint.x, targetPoint.y, dimLineX - extensionLineLength, targetPoint.y],
        {
          stroke: 'red',
          strokeWidth: lineWidth,
          selectable: false,
          functionalType: 'anchorLine'
        }
      ));

      // Main dimension line
      this.lines.push(new fabric.Line(
        [dimLineX, sourcePoint.y, dimLineX, targetPoint.y],
        {
          stroke: 'red',
          strokeWidth: lineWidth,
          selectable: false,
          functionalType: 'anchorLine',
        }
      ));

      // Add arrow endpoints
      this.addArrow(dimLineX, sourcePoint.y, 'down', 'red', arrowSize);
      this.addArrow(dimLineX, targetPoint.y, 'up', 'red', arrowSize);

      // Calculate the midpoint for dimension text and icon
      const midX = dimLineX - (iconOffset / zoom);
      const midY = (sourcePoint.y + targetPoint.y) / 2;

      // Dimension text
      this.dimensionTexts.push(new fabric.Text(
        (targetPoint.y - sourcePoint.y).toFixed() + 'mm',
        {
          left: midX,
          top: midY - 15 / canvas.getZoom(),
          fontSize: fontSize,
          fill: 'red',
          fontFamily: 'Arial',
          textAlign: 'center',
          originX: 'center',
          originY: 'bottom',
          selectable: false,
          evented: false,
          stroke: '#fff',
          strokeWidth: 3 / canvas.getZoom(),
          paintFirst: 'stroke'
        }
      ));

      // Lock icon at fixed position relative to dimension line
      this.icons.push(new fabric.Text('\uf023', {
        fontFamily: 'Font Awesome 5 Free',
        fontWeight: 900,
        left: midX,
        top: midY,
        fontSize: fontSize,
        fill: 'gold',
        stroke: 'black',
        strokeWidth: 0.5 / zoom,
        originX: 'center',
        originY: 'center',
        selectable: false,
        functionalType: 'lockIcon',
      }));
    }
  }

  // Helper method to add arrow endpoints to the dimension lines
  addArrow(x, y, direction, color, size) {
    let points;

    switch (direction) {
      case 'right':
        points = [
          { x: x, y: y },
          { x: x + size, y: y - size / 4 },
          { x: x + size, y: y + size / 4 }
        ];
        break;
      case 'left':
        points = [
          { x: x, y: y },
          { x: x - size, y: y - size / 4 },
          { x: x - size, y: y + size / 4 }
        ];
        break;
      case 'up':
        points = [
          { x: x, y: y },
          { x: x - size / 4, y: y - size },
          { x: x + size / 4, y: y - size }
        ];
        break;
      case 'down':
        points = [
          { x: x, y: y },
          { x: x - size / 4, y: y + size },
          { x: x + size / 4, y: y + size }
        ];
        break;
    }

    const arrow = new fabric.Polygon(points, {
      fill: color,
      stroke: color,
      strokeWidth: 0,
      selectable: false,
      functionalType: 'anchorArrow'
    });

    this.lines.push(arrow);
  }

  onHover(event) {
    const i = this.icons.indexOf(event.target)
    this.icons[i].set('text', '\uf3c1');
    this.icons[i].set('fill', 'brown');
    this.dimensionTexts[i].set('fill', 'brown');
    this.icons[i].set('hoverCursor', 'pointer')
    canvas.renderAll();
  }

  onMouseOut(event) {
    const i = this.icons.indexOf(event.target)
    this.icons[i].set('text', '\uf023');
    this.icons[i].set('fill', 'gold');
    this.dimensionTexts[i].set('fill', this.direction === 'x' ? 'green' : 'red');
    this.icons[i].set('hoverCursor', 'default')
    canvas.renderAll();
  }

  onClick() {
    // Remove lock lines and lock icon from the canvas and baseGroup
    canvas.remove(...this.objects);

    // Remove this lock icon from the baseGroup's anchorageLink list
    const anchorageIndex = this.baseGroup.anchorageLink.indexOf(this);
    if (anchorageIndex !== -1) {
      this.baseGroup.anchorageLink.splice(anchorageIndex, 1);
    }

    // Get references to both target objects (if they exist)
    const anchorX = this.baseGroup.lockXToPolygon.TargetObject;
    const anchorY = this.baseGroup.lockYToPolygon.TargetObject;

    if (this.direction == 'x') {
      // Handle X direction unlock
      this.baseGroup.lockMovementX = false;
      this.baseGroup.lockXToPolygon = {};

      // Only remove from anchoredPolygon if this object is not also Y-anchored to the same target
      if (anchorX && (anchorY !== anchorX)) {
        const anchoredIndex = anchorX.anchoredPolygon.indexOf(this.baseGroup);
        if (anchoredIndex !== -1) {
          anchorX.anchoredPolygon.splice(anchoredIndex, 1);
        }
      }
    } else {
      // Handle Y direction unlock
      this.baseGroup.lockMovementY = false;
      this.baseGroup.lockYToPolygon = {};

      // Only remove from anchoredPolygon if this object is not also X-anchored to the same target
      if (anchorY && (anchorX !== anchorY)) {
        const anchoredIndex = anchorY.anchoredPolygon.indexOf(this.baseGroup);
        if (anchoredIndex !== -1) {
          anchorY.anchoredPolygon.splice(anchoredIndex, 1);
        }
      }
    }

    // If the object is no longer anchored to anything, ensure it's removed from all anchoredPolygon lists
    if (Object.keys(this.baseGroup.lockXToPolygon).length === 0 &&
      Object.keys(this.baseGroup.lockYToPolygon).length === 0) {

      // Check if we need to remove from anchorX's list
      if (anchorX) {
        const anchoredIndex = anchorX.anchoredPolygon.indexOf(this.baseGroup);
        if (anchoredIndex !== -1) {
          anchorX.anchoredPolygon.splice(anchoredIndex, 1);
        }
      }

      // Check if we need to remove from anchorY's list (if different from anchorX)
      if (anchorY && anchorY !== anchorX) {
        const anchoredIndex = anchorY.anchoredPolygon.indexOf(this.baseGroup);
        if (anchoredIndex !== -1) {
          anchorY.anchoredPolygon.splice(anchoredIndex, 1);
        }
      }
    }

    // Record this unlock operation in history (if canvasTracker exists)
    if (canvasTracker) {
      canvasTracker.track('unlockObject', [{
        type: 'Unlock',
        objectId: this.baseGroup.canvasID,
        functionalType: this.baseGroup.functionalType,
        direction: this.direction
      }]);
    }

    // Reshow the vertexes and dimensions
    this.baseGroup.focusMode = false;

    canvas.renderAll();
  }
}


class VertexControl extends fabric.Control {
  constructor(vertex, baseGroup) {
    super({
      x: (vertex.x - baseGroup.left) / baseGroup.width - 0.5,
      y: (vertex.y - baseGroup.top) / baseGroup.height - 0.5,
      offsetX: 0,
      offsetY: 0,
      cursorStyle: 'pointer',
      cornerSize: 20,
    });
    this.hover = false;
    this.isDragging = false; // New flag to indicate active dragging
    this.mouseUpHandler = this.onClick.bind(this);
    this.render = this.renderControl.bind(this);
    this.vertex = vertex;
    this.baseGroup = baseGroup;
    this.snapThreshold = 50; // Distance in pixels for snapping
    this.snapTarget = null; // Current snap target
    this.snapHighlight = null; // Visual highlight of snap target
    this.handleMouseMoveRef = this.handleMouseMove.bind(this);
    this.handleMouseDownRef = this.handleMouseDown.bind(this);
    this.handleMouseUpRef = this.handleMouseUp.bind(this);
    this.cancelDragRef = this.cancelDrag.bind(this);
  }

  renderControl(ctx, left, top, styleOverride, fabricObject) {
    const size = this.cornerSize;

    // Draw the circle with different color based on state
    ctx.beginPath();
    ctx.arc(left, top, size / 2, 0, 2 * Math.PI, false);
    
    // Different fill colors based on state
    if (this.isDragging) {
      // Active dragging state - bright yellow
      ctx.fillStyle = this.snapTarget ? 'rgba(0, 255, 0, 0.7)' : 'rgba(255, 255, 0, 0.7)';
    } else if (this.baseGroup.focusMode) {
      // Focus mode - no color
      ctx.fillStyle = 'rgba(0, 0, 0, 0)';
    }
    else {
      // Normal or hover state
      ctx.fillStyle = `rgba(255, 20, 20, ${this.hover ? 0.7 : 0.2})`;
    }
    
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = this.baseGroup.focusMode?'rgba(0, 0, 0, 0)':this.VertexColorPicker(this.vertex);
    ctx.stroke();

    // Draw the text
    ctx.font = '10px Arial, sans-serif';
    ctx.fillStyle = this.baseGroup.focusMode?'rgba(0, 0, 0, 0)':this.VertexColorPicker(this.vertex);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.vertex.label, left, this.vertex.label.includes('E') ? top - 15 : top + 15);
  }

  VertexColorPicker(vertex) {
    switch (vertex.label.substring(0, 1)) {
      case 'E':
        return 'red'
      case 'V':
        return 'violet'
      case 'C':
        return 'blue'
    }
  }

  onClick(eventData, transform) {
    // Check if it's a left-click (button 1)
    if (eventData.button !== 0) return;

    // Prevent clicks during ongoing snap operations
    if (vertexSnapInProgress) return;

    const vertexX = this.vertex.x;
    const vertexY = this.vertex.y;

    if (!activeVertex) {
      activeVertex = this;
      this.isDown = true;
      this.isDragging = true; // Set dragging flag

      // Store original position and offset from vertex to group center
      this.originalPosition = {
        left: this.baseGroup.left,
        top: this.baseGroup.top
      };

      this.vertexOriginalPosition = {
        x: this.vertex.x,
        y: this.vertex.y
      };

      this.vertexOffset = {
        x: this.vertex.x - this.baseGroup.left,
        y: this.vertex.y - this.baseGroup.top
      };

      // Set cursor style for canvas
      canvas.defaultCursor = 'move';

      // Add mouse move and click handlers for drag behavior
      document.removeEventListener('keydown', ShowHideSideBarEvent);
      document.addEventListener('keydown', this.cancelDragRef);
      canvas.on('mouse:move', this.handleMouseMoveRef);
      canvas.on('mouse:down', this.handleMouseDownRef);
      canvas.on('mouse:up', this.handleMouseUpRef);

      canvas.renderAll();

      this.baseGroup.enterFocusMode()
    }
  }
  handleMouseMove(event) {
    if (!this.isDown) return;

    const pointer = canvas.getPointer(event.e);

    // Find nearest vertex for snapping
    this.checkForSnapTargets(pointer);    // Calculate new position of group based on vertex position
    let newLeft, newTop;

    if (this.snapTarget) {
      // Snap to the target vertex
      const snapPoint = this.snapTarget.vertex;

      // Special handling for text objects during snapping
      if (this.baseGroup.functionalType === 'Text') {
        // Calculate the offset from the current vertex to the object's center
        const currentVertex = this.baseGroup.getBasePolygonVertex(this.vertex.label);
        if (currentVertex) {
          // Calculate position by maintaining the same offset between vertex and object center
          const offsetX = this.baseGroup.left - currentVertex.x;
          const offsetY = this.baseGroup.top - currentVertex.y;
          newLeft = snapPoint.x + offsetX;
          newTop = snapPoint.y + offsetY;
        } else {
          // Fall back to standard calculation if vertex not found
          newLeft = snapPoint.x - this.vertexOffset.x;
          newTop = snapPoint.y - this.vertexOffset.y;
        }
      } else {
        // Standard calculation for non-text objects
        newLeft = snapPoint.x - this.vertexOffset.x;
        newTop = snapPoint.y - this.vertexOffset.y;
      }
    } else {
      // Regular movement (no snapping target)
      if (this.baseGroup.functionalType === 'Text') {
        // For text objects, adjust movement to prevent shifting
        const currentVertex = this.baseGroup.getBasePolygonVertex(this.vertex.label);
        if (currentVertex) {
          // Move based on cursor position relative to vertex
          const dx = pointer.x - currentVertex.x;
          const dy = pointer.y - currentVertex.y;
          newLeft = this.baseGroup.left + dx;
          newTop = this.baseGroup.top + dy;
        } else {
          // Fall back to standard calculation if vertex not found
          newLeft = pointer.x - this.vertexOffset.x;
          newTop = pointer.y - this.vertexOffset.y;
        }      } else {
        // Standard calculation for non-text objects
        newLeft = pointer.x - this.vertexOffset.x;
        newTop = pointer.y - this.vertexOffset.y;
      }
    }    // Move the group
    if (this.baseGroup.functionalType !== 'MainRoad' && this.baseGroup.functionalType !== 'SideRoad') {
      if (!this.baseGroup.lockMovementX) {
        this.baseGroup.set({
          left: newLeft,
        });

      }
      if (!this.baseGroup.lockMovementY) {
        this.baseGroup.set({
          top: newTop,
        });

      }

    } else {
      // Special handling for MainRoad and SideRoad
      // If we have a snap target, use its position instead of pointer
      const finalPointer = this.snapTarget ? 
        { x: this.snapTarget.vertex.x, y: this.snapTarget.vertex.y } : 
        pointer;
      
      if (this.baseGroup.functionalType === 'SideRoad') {
        // For SideRoad, calculate the appropriate offset based on active vertex
        if (activeVertex && activeVertex.vertex) {
          // Find the V1 vertex which corresponds to routeList[0]
          let v1Vertex = this.baseGroup.basePolygon.vertex.find(v => v.label === 'V1');
          
          // Calculate offset between active vertex and V1
          let offsetX = 0;
          let offsetY = 0;
          
          if (activeVertex.vertex.label !== 'V1' && v1Vertex) {
            // Calculate offset
            const activeVertexObj = this.baseGroup.basePolygon.vertex.find(v => v.label === activeVertex.vertex.label);
            if (activeVertexObj) {
              offsetX = v1Vertex.x - activeVertexObj.x;
              offsetY = v1Vertex.y - activeVertexObj.y;
            }
          }
          
          // Apply the position update with the calculated offset
          this.baseGroup.routeList[0].x = finalPointer.x + offsetX;
          this.baseGroup.routeList[0].y = finalPointer.y + offsetY;
        } else {
          // Fallback to old behavior if active vertex information is not available
          this.baseGroup.routeList.forEach(route => {
            route.x = newLeft + this.vertexOffset.x;
            route.y = newTop + this.vertexOffset.y;
          });
        }
      } else {
        // For MainRoad, use original behavior
        this.baseGroup.routeList.forEach(route => {
          route.x = newLeft + this.vertexOffset.x;
          route.y = newTop + this.vertexOffset.y;
        });
      }
      this.baseGroup.onMove();
    }
    
    this.baseGroup.setCoords();
    this.baseGroup.updateAllCoord();

    canvas.renderAll();
  }

  checkForSnapTargets(pointer) {
    // Clear any existing snap highlight
    this.clearSnapHighlight();
    
    this.snapTarget = null;

    // Check all canvas objects for potential snap targets
    let closestDistance = this.snapThreshold;
    let closestVertex = null;
    let closestObject = null;

    canvasObject.forEach(obj => {
      // Skip the current object and objects without basePolygon
      if (obj === this.baseGroup || !obj.basePolygon || !obj.basePolygon.vertex) return;

      // Check each vertex
      obj.basePolygon.vertex.forEach(vertex => {
        const dx = vertex.x - (pointer.x);
        const dy = vertex.y - (pointer.y);
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < closestDistance) {
          closestDistance = distance;
          closestVertex = vertex;
          closestObject = obj;
        }
      });
    });

    // If we found a vertex within threshold, highlight it
    if (closestVertex) {
      this.snapTarget = {
        object: closestObject,
        vertex: closestVertex
      };
      
      // Match the circle size with the vertex control size
      const size = this.cornerSize;
      const radius = size / 2;
      
      // Create a hollow circle to indicate snap target, centered at the vertex position
      this.snapHighlight = new fabric.Circle({
        left: closestVertex.x,
        top: closestVertex.y,
        radius: radius,
        fill: 'transparent',
        stroke: '#00FF00',
        strokeWidth: 2,
        selectable: false,
        evented: false,
        originX: 'center',
        originY: 'center'
      });
      
      // Add the highlight to the canvas
      canvas.add(this.snapHighlight);
      
      // Force a render to update vertex appearance
      canvas.renderAll();
    }
  }
  
  // New method to clear snap highlight
  clearSnapHighlight() {
    if (this.snapHighlight) {
      canvas.remove(this.snapHighlight);
      this.snapHighlight = null;
      canvas.renderAll();
    }
  }

  handleMouseDown(event) {
    if (!this.isDown) return;

    // Check for right-click (button 2)
    if (event.e.button === 2) {
      // Cancel drag on right-click
      this.restoreOriginalPosition();
      return;
    }

    // Only process left clicks (button 1) for object selection
    if (event.e.button !== 0) return;

    // If we have a snap target, use that for anchoring
    if (this.snapTarget) {
      // Set the flag to prevent additional onClick events
      vertexSnapInProgress = true;

      // Store the snap target before finishing the drag
      const savedSnapTarget = {
        object: this.snapTarget.object,
        vertex: this.snapTarget.vertex
      };
      const savedVertex = this.vertex;
      const savedBaseGroup = this.baseGroup;

      // Clear the snap highlight before finishing the drag
      this.clearSnapHighlight();
      
      this.finishDrag();

      // Start the anchor process with the saved snap target
      setTimeout(() => {
        anchorShape(
          savedSnapTarget.object,
          savedBaseGroup,
          {
            vertexIndex1: savedVertex.label,
            vertexIndex2: savedSnapTarget.vertex.label
          }
        ).then(() => {
          // Reset the flag after anchoring completes
          setTimeout(() => {
            vertexSnapInProgress = false;
          }, 300);
        }).catch(() => {
          vertexSnapInProgress = false;
        });
      }, 100);
      return;
    }

    const pointer = canvas.getPointer(event.e);
    const targetObject = canvas.findTarget(event.e);

    // Check if we clicked on another object with vertices
    if (targetObject && targetObject !== this.baseGroup && targetObject.basePolygon && targetObject.basePolygon.vertex) {
      // Find the closest vertex to the click point
      const vertices = targetObject.basePolygon.vertex;
      if (!vertices) {
        // Set flag before starting the finishing process
        vertexSnapInProgress = true;

        // Finish drag with a delay to ensure proper cleanup
        this.finishDrag();

        // Reset the flag after a delay
        setTimeout(() => {
          vertexSnapInProgress = false;
        }, 300);
        return;
      }

      let closestVertex = null;
      let minDistance = 30; // Minimum distance to consider a hit

      for (const vertex of vertices) {
        const dx = vertex.x - pointer.x;
        const dy = vertex.y - pointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < minDistance) {
          minDistance = distance;
          closestVertex = vertex;
        }
      }

      if (closestVertex) {
        // Found a vertex to anchor to
        vertexSnapInProgress = true;
        this.finishDrag();

        // Start the anchor process
        setTimeout(() => {
          anchorShape(
            targetObject,
            this.baseGroup,
            {
              vertexIndex1: this.vertex.label,
              vertexIndex2: closestVertex.label
            }
          ).then(() => {
            // Reset the flag after anchoring completes
            setTimeout(() => {
              vertexSnapInProgress = false;
            }, 300);
          }).catch(() => {
            vertexSnapInProgress = false;
          });
        }, 100);
        return;
      }
    }

    // If we click on empty space, set flag and finish the drag with delay
    vertexSnapInProgress = true;

    // Remove all mouse events immediately to prevent further processing
    this.removeAllMouseEvents();

    // Store reference to the current drag state
    const baseGroup = this.baseGroup;

    // Clear snap highlight immediately
    this.clearSnapHighlight();

    // Clean up the drag state with proper callbacks
    setTimeout(() => {
      // Update coordinates and call appropriate move method
      baseGroup.updateAllCoord(null, []);

      // Call the appropriate onMove method for special object types
      if (baseGroup.functionalType === 'MainRoad' && typeof baseGroup.onMove === 'function') {
        baseGroup.onMove();
      } else if (baseGroup.functionalType === 'SideRoad' && typeof baseGroup.onMove === 'function') {
        baseGroup.onMove();
      }

      baseGroup.exitFocusMode();

      // Reset active vertex
      activeVertex = null;

      // Reset the flag after a delay to prevent new clicks
      setTimeout(() => {
        vertexSnapInProgress = false;
        canvas.renderAll();
      }, 300);
    }, 50);
  }

  // New helper method to remove all mouse events immediately
  removeAllMouseEvents() {
    canvas.off('mouse:move', this.handleMouseMoveRef);
    canvas.off('mouse:down', this.handleMouseDownRef);
    canvas.off('mouse:up', this.handleMouseUpRef);
    document.removeEventListener('keydown', this.cancelDragRef);

    // Clear any snap highlight before removing events
    this.clearSnapHighlight();

    // Restore default behavior
    document.addEventListener('keydown', ShowHideSideBarEvent);
    canvas.defaultCursor = 'default';

    // Reset internal state
    this.isDown = false;
    this.isDragging = false; // Reset dragging state
  }

  finishDrag() {
    this.clearSnapHighlight();
    this.cleanupDrag();
    this.baseGroup.updateAllCoord(null, []);

    // Call the appropriate onMove method for special object types
    if (this.baseGroup.functionalType === 'MainRoad' && typeof this.baseGroup.onMove === 'function') {
      this.baseGroup.onMove();
    } else if (this.baseGroup.functionalType === 'SideRoad' && typeof this.baseGroup.onMove === 'function') {
      this.baseGroup.onMove();
    }

    activeVertex = null;
    canvas.renderAll();
  }

  handleMouseUp(event) {
    // Check for right-click (button 2)
    if (event.e.button === 2 && this.isDown) {
      // Cancel drag on right-click
      this.restoreOriginalPosition();
      return;
    }
  }

  restoreOriginalPosition() {
    // Clear any snap highlight
    this.clearSnapHighlight();
    
    // Restore original position
    this.baseGroup.set(this.originalPosition);
    this.baseGroup.setCoords();
    this.baseGroup.updateAllCoord();

    this.cleanupDrag();
    activeVertex = null;
    canvas.renderAll();
  }

  cancelDrag(event) {
    if (event && event.key === 'Escape') {
      this.restoreOriginalPosition();
    }
  }

  cleanupDrag() {
    // Clear any snap highlight
    this.clearSnapHighlight();
    
    // First reset object properties
    this.isDown = false;
    this.isDragging = false; // Reset dragging flag

    // Remove event listeners using stored references
    canvas.off('mouse:move', this.handleMouseMoveRef);
    canvas.off('mouse:down', this.handleMouseDownRef);
    canvas.off('mouse:up', this.handleMouseUpRef);
    document.removeEventListener('keydown', this.cancelDragRef);

    // Restore default behavior
    document.addEventListener('keydown', ShowHideSideBarEvent);
    canvas.defaultCursor = 'default';

    // Make sure we're no longer active
    if (activeVertex === this) {
      activeVertex = null;
    }
  }

  onHover() {
    this.hover = true;
    canvas.renderAll();
  }

  onMouseOut() {
    this.hover = false;
    canvas.renderAll();
  }
}

// Class to handle engineering style dimension displays for border objects
class BorderDimensionDisplay {
  constructor(options = {}) {
    this.direction = options.direction || 'horizontal'; // 'horizontal' or 'vertical'
    this.startX = options.startX;
    this.startY = options.startY;
    this.endX = options.endX !== undefined ? options.endX : this.startX;
    this.endY = options.endY !== undefined ? options.endY : this.startY;
    this.color = options.color || 'blue';
    this.offset = options.offset || 30;
    this.objects = [];

    this.createDimension();
  }

  createDimension() {
    // Scale adjustments based on zoom
    const zoom = canvas.getZoom();
    const lineWidth = 1 / zoom;
    const fontSize = 12 / zoom;
    const arrowSize = 8 / zoom;
    const extensionLength = 6 / zoom;

    // Create dimension lines based on direction
    if (this.direction === 'horizontal') {
      this.createHorizontalDimension(lineWidth, fontSize, arrowSize, extensionLength);
    } else {
      this.createVerticalDimension(lineWidth, fontSize, arrowSize, extensionLength);
    }

    // Add all objects to the canvas
    canvas.add(...this.objects);
  }

  createHorizontalDimension(lineWidth, fontSize, arrowSize, extensionLength) {
    // Position of the dimension line
    const dimLineY = this.startY - this.offset;
    const distance = Math.abs(this.endX - this.startX);

    // Extension lines
    this.objects.push(new fabric.Line(
      [this.startX, this.startY, this.startX, dimLineY + extensionLength],
      {
        stroke: this.color,
        strokeWidth: lineWidth,
        selectable: false,
        evented: false
      }
    ));

    this.objects.push(new fabric.Line(
      [this.endX, this.startY, this.endX, dimLineY + extensionLength],
      {
        stroke: this.color,
        strokeWidth: lineWidth,
        selectable: false,
        evented: false
      }
    ));

    // Main dimension line
    this.objects.push(new fabric.Line(
      [this.startX, dimLineY, this.endX, dimLineY],
      {
        stroke: this.color,
        strokeWidth: lineWidth,
        selectable: false,
        evented: false
      }
    ));

    // Add arrows
    this.addArrow(this.startX, dimLineY, this.endX > this.startX ? 'right' : 'left', arrowSize);
    this.addArrow(this.endX, dimLineY, this.endX > this.startX ? 'left' : 'right', arrowSize);

    // Add dimension text
    const midX = (this.startX + this.endX) / 2;
    this.objects.push(new fabric.Text(
      `${Math.round(distance)}mm`,
      {
        left: midX,
        top: dimLineY - (15 / canvas.getZoom()),
        fontSize: fontSize,
        fill: this.color,
        fontFamily: 'Arial',
        textAlign: 'center',
        originX: 'center',
        originY: 'bottom',
        selectable: false,
        evented: false,
        stroke: '#fff',
        strokeWidth: 3 / canvas.getZoom(),
        paintFirst: 'stroke'
      }
    ));
  }

  createVerticalDimension(lineWidth, fontSize, arrowSize, extensionLength) {
    // Position of the dimension line
    const dimLineX = this.startX - this.offset;
    const distance = Math.abs(this.endY - this.startY);

    // Extension lines
    this.objects.push(new fabric.Line(
      [this.startX, this.startY, dimLineX + extensionLength, this.startY],
      {
        stroke: this.color,
        strokeWidth: lineWidth,
        selectable: false,
        evented: false
      }
    ));

    this.objects.push(new fabric.Line(
      [this.startX, this.endY, dimLineX + extensionLength, this.endY],
      {
        stroke: this.color,
        strokeWidth: lineWidth,
        selectable: false,
        evented: false
      }
    ));

    // Main dimension line
    this.objects.push(new fabric.Line(
      [dimLineX, this.startY, dimLineX, this.endY],
      {
        stroke: this.color,
        strokeWidth: lineWidth,
        selectable: false,
        evented: false
      }
    ));

    // Add arrows
    this.addArrow(dimLineX, this.startY, this.endY > this.startY ? 'down' : 'up', arrowSize);
    this.addArrow(dimLineX, this.endY, this.endY > this.startY ? 'up' : 'down', arrowSize);

    // Add dimension text
    const midY = (this.startY + this.endY) / 2;

    // Create text with rotation for vertical dimension
    this.objects.push(new fabric.Text(
      `${Math.round(distance)}mm`,
      {
        left: dimLineX - (15 / canvas.getZoom()),
        top: midY,
        fontSize: fontSize,
        fill: this.color,
        fontFamily: 'Arial',
        angle: -90, // Rotate for vertical text
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        stroke: '#fff',
        strokeWidth: 3 / canvas.getZoom(),
        paintFirst: 'stroke'
      }
    ));
  }

  addArrow(x, y, direction, size) {
    let points;

    switch (direction) {
      case 'right':
        points = [
          { x: x, y: y },
          { x: x + size, y: y - size / 4 },
          { x: x + size, y: y + size / 4 }
        ];
        break;
      case 'left':
        points = [
          { x: x, y: y },
          { x: x - size, y: y - size / 4 },
          { x: x - size, y: y + size / 4 }
        ];
        break;
      case 'up':
        points = [
          { x: x, y: y },
          { x: x - size / 4, y: y - size },
          { x: x + size / 4, y: y - size }
        ];
        break;
      case 'down':
        points = [
          { x: x, y: y },
          { x: x - size / 4, y: y + size },
          { x: x + size / 4, y: y + size }
        ];
        break;
    }

    const arrow = new fabric.Polygon(points, {
      fill: this.color,
      stroke: this.color,
      strokeWidth: 0,
      selectable: false,
      evented: false
    });

    this.objects.push(arrow);
  }
}
