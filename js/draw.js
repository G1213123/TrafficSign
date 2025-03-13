let cursorClickMode = 'normal'
const deleteIcon =
  "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
let activeVertex = null

// Constants for snapping functionality
const SNAP_THRESHOLD = 100; // Distance in pixels to trigger snapping
const GUIDELINE_STYLE = {
  horizontal: {
    stroke: '#00BFFF', // Deep sky blue
    strokeWidth: 2,
    strokeDashArray: [5, 5]
  },
  vertical: {
    stroke: '#FF69B4', // Hot pink
    strokeWidth: 2,
    strokeDashArray: [5, 5]
  }
};

// Valid vertex labels for snapping - only include vertices with labels starting with these prefixes
const VALID_VERTEX_PREFIXES = ['E'];

// additional property for fabric object
const originalToObject = fabric.Object.prototype.toObject;
const myAdditional = ['functionalType'];
fabric.Object.prototype.toObject = function (additionalProperties) {
  return originalToObject.call(this, myAdditional.concat(additionalProperties));
}


function PolarPoint(r, a) {
  return new fabric.Point(r * Math.cos(a), r * Math.sin(a))
}


class GlyphPolygon extends fabric.Polygon {
  constructor(shapeMeta, options) {
    shapeMeta.vertex.forEach((p) => {
      transformed = calculateTransformedPoints(p, {
        x: options.left,
        y: options.top,
        angle: options.angle
      });
      p.x = transformed.x
      p.y = transformed.y
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

    const pathData = await vertexToPath(shapeMeta);

    this.vertex = shapeMeta.path.map(p => p.vertex).flat(); // Store the shapeMeta.vertex points
    this.insertPoint = shapeMeta.path[0].vertex[0];

    const result = await fabric.loadSVGFromString(pathData)
    const obj = fabric.util.groupSVGElements(result.objects);
    obj.set(options);
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
    
    // Initialize snapping properties
    this.snapLines = {
      horizontal: [],
      vertical: []
    };
    this.isSnapping = false;
    this.vertexHighlights = []; // Initialize vertex highlights array
    this.activeSnapVertex = null; // Track the active vertex for snapping

    canvasObject.push(this);
    this.canvasID = canvasObject.length - 1;
    this._showName = `<Group ${this.canvasID}> ${functionalType}`;

    // Add to canvas regardless of basePolygon
    canvas.add(this);
    
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
    });

    this.on('deselected', () => {
      setTimeout(() => {
        this.anchorageLink.forEach(obj => {
          obj.objects.forEach(o => {
            o.set('opacity', 0);
          })
        });
        this.hideLockHighlights();
        this.clearSnapLines();
        this.hideAllVertexHighlights(); // Ensure vertex highlights are cleared on deselection
      }, 0)
      CanvasObjectInspector.SetActiveObjectList(null)
    });

    this.on('mouseover', function () {
      this.set({
        opacity: 0.5
      });
      if (this.__corner){
        if (this.controls[this.__corner].onHover){
          this.controls[this.__corner].onHover()
        } else {
          Object.values(this.controls).forEach(control => {if(control.onMouseOut) {control.onMouseOut()}})
        }
      } else {
        Object.values(this.controls).forEach(control => {if(control.onMouseOut) {control.onMouseOut()}})
      }
      canvas.renderAll();
    });

    this.on('mousemove', function () {
      if (this.__corner){
        if (this.controls[this.__corner].onHover){
          this.controls[this.__corner].onHover()
        } else {
          Object.values(this.controls).forEach(control => {if(control.onMouseOut) {control.onMouseOut()}})
        }
      } else {
        Object.values(this.controls).forEach(control => {if(control.onMouseOut) {control.onMouseOut()}})
      }
    });

    this.on('mouseout', function () {
      this.set({
        opacity: 1
      });
      Object.values(this.controls).forEach(control => {if(control.onMouseOut) {control.onMouseOut()}})
      canvas.renderAll();
    });

    //this.on('mousedown', this.onDragStart.bind(this));
    this.on('moving', this.onMoving.bind(this));
    //this.on('moved', this.onMoved.bind(this));
    this.on('modified', this.updateAllCoord.bind(this));
  }

  // This event is triggered when the object starts to be dragged
  onDragStart(event) {
    // Find the cursor position relative to the canvas
    const pointer = canvas.getPointer(event);
    
    // Find the nearest vertex to the cursor
    this.activeSnapVertex = this.findNearestVertex(pointer);
    
    // Store the initial offset between cursor and vertex
    if (this.activeSnapVertex) {
      // Save the initial vertex position for reference
      this.snapVertexInitialPos = {
        x: this.activeSnapVertex.x,
        y: this.activeSnapVertex.y
      };
      
      // Calculate offset between cursor and vertex
      this.snapVertexOffset = {
        x: this.activeSnapVertex.x - pointer.x,
        y: this.activeSnapVertex.y - pointer.y
      };
      
      // Highlight the active vertex for visual feedback
      this.showVertexHighlight(this.activeSnapVertex, 'both');
    }
  }

  // Find the nearest vertex to a point with improved precision
  findNearestVertex(pointer) {
    if (!this.basePolygon || !this.basePolygon.vertex) return null;
    
    let nearestVertex = null;
    let minDistance = Infinity;
    
    // Check all vertices and find the closest one
    this.basePolygon.vertex.forEach(vertex => {
      // Only use vertices with valid labels for snapping
      if (!isValidVertexForSnapping(vertex)) return;
      
      const distance = Math.sqrt(
        Math.pow(vertex.x - pointer.x, 2) + 
        Math.pow(vertex.y - pointer.y, 2)
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestVertex = vertex;
      }
    });
    
    return nearestVertex;
  }

  // Handle object movement to check for snapping with improved precision
  onMoving(event) {
    // Skip snapping if object is locked due to anchor constraints
    if ((Object.keys(this.lockXToPolygon).length > 0) && (Object.keys(this.lockYToPolygon).length > 0)) {
      return;
    }
    
    // Clear existing snap lines and highlights
    this.clearSnapLines();
    this.hideAllVertexHighlights();
    
    // If no active vertex, find one now
    if (!this.activeSnapVertex) {
      const pointer = canvas.getPointer(event.e);
      this.activeSnapVertex = this.findNearestVertex(pointer);
      
      if (this.activeSnapVertex) {
        // Initialize the reference positions if we just found an active vertex
        this.snapVertexInitialPos = {
          x: this.activeSnapVertex.x,
          y: this.activeSnapVertex.y
        };
        this.snapVertexOffset = { x: 0, y: 0 };
      }
    }
    
    // If we still don't have an active vertex, we can't snap
    if (!this.activeSnapVertex) return;
    
    // Calculate current position of the active vertex based on object movement
    const currentVertexPos = {
      x: this.activeSnapVertex.x,
      y: this.activeSnapVertex.y
    };
    
    // Highlight the active vertex
    this.showVertexHighlight(this.activeSnapVertex, 'both');
    
    // Get nearby objects for potential snapping
    const nearbyObjects = this.findNearbyObjects();
    
    // Initialize variables to track best snapping distance
    let bestSnapX = null;
    let bestSnapY = null;
    let bestDistanceX = SNAP_THRESHOLD;
    let bestDistanceY = SNAP_THRESHOLD;
    
    // Check each nearby object for potential snap points
    nearbyObjects.forEach(obj => {
      // Skip snapping to objects with relationships to this object
      if (this.hasRelationship(obj)) return;
      
      // Skip objects without vertices
      if (!obj.basePolygon || !obj.basePolygon.vertex) return;
      
      // Get the active snap vertex from this object
      const activeVertex = this.activeSnapVertex;
      
      // Check each vertex of the other object
      obj.basePolygon.vertex.forEach(targetVertex => {
        // Only use vertices with valid labels for snapping
        if (!isValidVertexForSnapping(targetVertex)) return;
        
        // Check horizontal alignment
        const distanceY = Math.abs(activeVertex.y - targetVertex.y);
        if (distanceY < bestDistanceY) {
          bestDistanceY = distanceY;
          bestSnapY = {
            y: targetVertex.y,
            x1: Math.min(activeVertex.x, targetVertex.x) - 200,
            x2: Math.max(activeVertex.x, targetVertex.x) + 200,
            vertex: activeVertex,
            targetVertex: targetVertex
          };
        }
        
        // Check vertical alignment
        const distanceX = Math.abs(activeVertex.x - targetVertex.x);
        if (distanceX < bestDistanceX) {
          bestDistanceX = distanceX;
          bestSnapX = {
            x: targetVertex.x,
            y1: Math.min(activeVertex.y, targetVertex.y) - 200,
            y2: Math.max(activeVertex.y, targetVertex.y) + 200,
            vertex: activeVertex,
            targetVertex: targetVertex
          };
        }
      });
    });
    
    // Apply snapping if found
    this.isSnapping = false;
    
    // Record current position before any snapping adjustments
    const originalLeft = this.left;
    const originalTop = this.top;
    
    // Apply horizontal snap
    if (bestSnapY && bestDistanceY < SNAP_THRESHOLD/2 && !Object.keys(this.lockYToPolygon).length) {
      // Calculate how much to move the object so that the active vertex aligns with the target
      const adjustY = bestSnapY.y - this.activeSnapVertex.y;
      
      // Apply the adjustment
      this.set('top', this.top + adjustY);
      
      // Update the position of the active vertex precisely
      this.activeSnapVertex.y = bestSnapY.y;
      
      // Create canvas-level horizontal guideline
      const horizontalLine = new fabric.Line(
        [bestSnapY.x1, bestSnapY.y, bestSnapY.x2, bestSnapY.y],
        {
          stroke: GUIDELINE_STYLE.horizontal.stroke,
          strokeWidth: GUIDELINE_STYLE.horizontal.strokeWidth,
          strokeDashArray: GUIDELINE_STYLE.horizontal.strokeDashArray,
          selectable: false,
          evented: false,
          name: 'snapline_h'
        }
      );
      
      canvas.add(horizontalLine);
      this.snapLines.horizontal.push(horizontalLine);
      this.isSnapping = true;
      
      // Highlight the target vertex
      this.showVertexHighlight(bestSnapY.targetVertex, 'horizontal');
    }
    
    // Apply vertical snap
    if (bestSnapX && bestDistanceX < SNAP_THRESHOLD/2 && !Object.keys(this.lockXToPolygon).length) {
      // Calculate how much to move the object so that the active vertex aligns with the target
      const adjustX = bestSnapX.x - this.activeSnapVertex.x;
      
      // Apply the adjustment
      this.set('left', this.left + adjustX);
      
      // Update the position of the active vertex precisely
      this.activeSnapVertex.x = bestSnapX.x;
      
      // Create canvas-level vertical guideline
      const verticalLine = new fabric.Line(
        [bestSnapX.x, bestSnapX.y1, bestSnapX.x, bestSnapX.y2],
        {
          stroke: GUIDELINE_STYLE.vertical.stroke,
          strokeWidth: GUIDELINE_STYLE.vertical.strokeWidth,
          strokeDashArray: GUIDELINE_STYLE.vertical.strokeDashArray,
          selectable: false,
          evented: false,
          name: 'snapline_v'
        }
      );
      
      canvas.add(verticalLine);
      this.snapLines.vertical.push(verticalLine);
      this.isSnapping = true;
      
      // Highlight the target vertex
      this.showVertexHighlight(bestSnapX.targetVertex, 'vertical');
    }
    
    // Ensure other vertices are updated when we apply the snap
    if (this.isSnapping && this.basePolygon && this.basePolygon.vertex) {
      // Calculate total adjustment applied
      const totalAdjustX = this.left - originalLeft;
      const totalAdjustY = this.top - originalTop;
      
      // Update all vertices by the same amount
      if (totalAdjustX !== 0 || totalAdjustY !== 0) {
        this.basePolygon.vertex.forEach(vertex => {
          // Skip the active vertex as it's already been set precisely
          if (vertex !== this.activeSnapVertex) {
            vertex.x += totalAdjustX;
            vertex.y += totalAdjustY;
          }
        });
        
        // Update the polygon itself
        if (this.basePolygon._setPositionDimensions) {
          this.basePolygon._setPositionDimensions({});
        }
        if (this.basePolygon.setCoords) {
          this.basePolygon.setCoords();
        }
      }
    }
    
    // Update coordinates for all related objects
    this.updateAllCoord(event);
  }

  // Check if this object has a relationship with another object
  hasRelationship(obj) {
    // Check if the object is anchored to this object
    if (this.anchoredPolygon.includes(obj)) return true;
    
    // Check if this object is anchored to the other object
    if (obj.anchoredPolygon && obj.anchoredPolygon.includes(this)) return true;
    
    // Check if this object is locked to the other object
    if ((this.lockXToPolygon && this.lockXToPolygon.TargetObject === obj) || 
        (this.lockYToPolygon && this.lockYToPolygon.TargetObject === obj)) {
      return true;
    }
    
    // Check if the other object is locked to this object
    if ((obj.lockXToPolygon && obj.lockXToPolygon.TargetObject === this) ||
        (obj.lockYToPolygon && obj.lockYToPolygon.TargetObject === this)) {
      return true;
    }
    
    // Check border relationship
    if (this.borderGroup === obj || obj.borderGroup === this) return true;
    
    // Check if both objects belong to the same border group
    if (this.borderGroup && this.borderGroup === obj.borderGroup) return true;
    
    // Check if one is a divider and the other is in its parent border's width/height objects
    if (this.functionalType === 'HDivider' || this.functionalType === 'VDivider') {
      if (this.borderGroup && 
          (this.borderGroup.widthObjects.includes(obj) || 
           this.borderGroup.heightObjects.includes(obj))) {
        return true;
      }
    }
    
    if (obj.functionalType === 'HDivider' || obj.functionalType === 'VDivider') {
      if (obj.borderGroup && 
          (obj.borderGroup.widthObjects.includes(this) || 
           obj.borderGroup.heightObjects.includes(this))) {
        return true;
      }
    }
    
    return false;
  }

  // When movement ends, clean up snap lines and reset active vertex
  onMoved() {
    this.clearSnapLines();
    this.hideAllVertexHighlights();
    this.activeSnapVertex = null;
    this.snapVertexInitialPos = null;
    this.snapVertexOffset = null;
    
    // Ensure all vertices are properly updated
    if (this.basePolygon && this.basePolygon.vertex) {
      if (this.basePolygon._setPositionDimensions) {
        this.basePolygon._setPositionDimensions({});
      }
      if (this.basePolygon.setCoords) {
        this.basePolygon.setCoords();
      }
    }
    
    // Ensure reference points are updated
    if (this.basePolygon && this.basePolygon.getCoords) {
      this.refTopLeft = {
        top: this.basePolygon.getCoords()[0].y,
        left: this.basePolygon.getCoords()[0].x
      };
    }
    
    // Force a final update to ensure everything is in sync
    this.updateAllCoord(null, [], true);
  }

  // Show highlight for a specific vertex when it's snapped
  showVertexHighlight(vertex, direction) {
    if (!vertex) return;
    
    let fillColor;
    let strokeColor;
    
    switch (direction) {
      case 'horizontal':
        fillColor = 'rgba(0, 191, 255, 0.5)';
        strokeColor = '#00BFFF';
        break;
      case 'vertical':
        fillColor = 'rgba(255, 105, 180, 0.5)';
        strokeColor = '#FF69B4';
        break;
      case 'both':
        fillColor = 'rgba(255, 215, 0, 0.5)'; // Gold for active vertex
        strokeColor = '#FFD700';
        break;
      default:
        fillColor = 'rgba(0, 191, 255, 0.5)';
        strokeColor = '#00BFFF';
    }
    
    // Create a highlight circle at the vertex position
    const highlightSize = 20;
    const highlight = new fabric.Circle({
      left: vertex.x - highlightSize/2,
      top: vertex.y - highlightSize/2,
      radius: highlightSize/2,
      fill: fillColor,
      stroke: strokeColor,
      strokeWidth: 2,
      selectable: false,
      evented: false,
      name: 'vertex_highlight'
    });
    
    canvas.add(highlight);
    
    // Store the highlight for later removal
    if (!this.vertexHighlights) this.vertexHighlights = [];
    this.vertexHighlights.push(highlight);
  }

  // Hide all vertex highlights
  hideAllVertexHighlights() {
    if (this.vertexHighlights && this.vertexHighlights.length > 0) {
      this.vertexHighlights.forEach(highlight => {
        canvas.remove(highlight);
      });
      this.vertexHighlights = [];
    }
  }

  // Clear all snap guidelines
  clearSnapLines() {
    // Remove all snap lines from canvas
    this.snapLines.horizontal.concat(this.snapLines.vertical).forEach(line => {
      canvas.remove(line);
    });
    
    // Clear the arrays
    this.snapLines.horizontal = [];
    this.snapLines.vertical = [];
    
    // Reset snapping flag
    this.isSnapping = false;
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

  replaceBasePolygon(newBasePolygon) {
    this.removeAll();
    this.setBasePolygon(newBasePolygon);
    this.setCoords();
  }

  drawVertex(calc = true) {
    // If basePolygon doesn't exist, exit early
    if (!this.basePolygon) return;

    if (!this.basePolygon.vertex) {
      this.basePolygon.vertex = [];
    }
    
    if (calc) {
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
      if (this.addMidPointToDivider) {
        this.addMidPointToDivider(this);
      }
    }

    // Draw the vertices and labels
    if (this.basePolygon.vertex) {
      this.basePolygon.vertex.filter(v => (v.display!==0)).forEach(v => {
        const vControl = new VertexControl(v, this);
        this.controls[v.label] = vControl;
      });
    }

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
    const newDeltaX = this.lockXToPolygon.TargetObject == caller && !this.lockYToPolygon.secondTargetObject ? deltaX : 0
    const newDeltaY = this.lockYToPolygon.TargetObject == caller && !this.lockXToPolygon.secondTargetObject ? deltaY : 0
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

      // handle roundings on borders and dividers
      const rounding = BorderUtilities.calcBorderRounding(BG.borderType, BG.xHeight, coords)
      BorderUtilities.RoundingToDivider(BG.HDivider, BG.VDivider, rounding, sourceList)
      coords = BorderUtilities.getBorderObjectCoords(BG.heightObjects, BG.widthObjects)

      const borderObject = drawLabeledBorder(BG.borderType, BG.xHeight, coords, BG.color)

          BG.add(borderObject)
          BG.basePolygon = borderObject
          BorderUtilities.assignWidthToDivider(BG, sourceList)
          BG.updateAllCoord(null, sourceList)
          BG.drawVertex()
        
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
  // Method to update coordinates and emit delta - with improved consistency
  updateAllCoord(event, sourceList = [], selfOnly = false) {
    // Check for basePolygon before calculating deltas
    if (!this.basePolygon || !this.basePolygon.getCoords) {
      // If basePolygon doesn't exist yet, just return
      return;
    }
    
    // Get the latest coordinates
    const currentCoords = this.basePolygon.getCoords()[0];
    
    // Calculate deltas from reference point
    const deltaX = currentCoords.x - this.refTopLeft.left;
    const deltaY = currentCoords.y - this.refTopLeft.top;
    
    // Only update coords if we're not in the middle of a moving event with snapping
    // or if we're forcing a complete update (indicated by selfOnly=true)
    if (selfOnly || !event || event.type !== 'moving' || !this.isSnapping) {
      this.updateCoord(deltaX, deltaY);
    }
    
    // Update reference point
    this.refTopLeft = { 
      top: currentCoords.y, 
      left: currentCoords.x 
    };
    
    // Update UI elements if this object is active
    if (canvas.getActiveObject() === this) {
      this.drawAnchorLinkage();
      this.showLockHighlights();
    }
    
    // Add to source list if not already included
    sourceList = sourceList || [];
    if (!sourceList.includes(this)) {
      sourceList.push(this);
    }
    
    // Propagate changes to related objects
    if (!selfOnly) {
      this.emitDelta(deltaX, deltaY, sourceList);
      this.borderResize(sourceList);
    }
    
    // Call specialized route methods if they exist
    if (this.branchRouteOnMove) {
      this.branchRouteOnMove();
    }
    if (this.rootRouteOnMove) {
      this.rootRouteOnMove();
    }
  }
  
  // Method to update coordinates with improved precision
  updateCoord(updateX, updateY) {
    // Check for basePolygon
    if (!this.basePolygon || !this.basePolygon.vertex) {
      return;
    }
    
    // Skip if no actual change
    if (updateX === 0 && updateY === 0) {
      return;
    }
    
    const polygon = this.basePolygon;
    
    // Directly update vertex coordinates
    polygon.vertex.forEach((vertex) => {
      vertex.x += updateX;
      vertex.y += updateY;
    });
    
    // Update route list if it exists
    if (this.routeList) {
      this.routeList.forEach((item) => {
        item.x += updateX;
        item.y += updateY;
      });
    }
    
    // Update insertion point and coords
    if (polygon.vertex && polygon.vertex.length > 0) {
      polygon.insertPoint = polygon.vertex[0];
    }
    
    // Update internal coordinates in the polygon
    if (polygon.points && polygon.vertex) {
      for (let i = 0; i < polygon.points.length; i++) {
        const vertexIndex = i % polygon.vertex.length;
        polygon.points[i].x = polygon.vertex[vertexIndex].x;
        polygon.points[i].y = polygon.vertex[vertexIndex].y;
      }
    }
    
    // Update position dimensions and coords
    if (polygon._setPositionDimensions) {
      polygon._setPositionDimensions({});
    }
    polygon.setCoords();
    
    // Force canvas to render
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
  deleteObject(_eventData, transform) {
    const deleteObj = transform?.target || transform || this

    const index = canvasObject.indexOf(deleteObj)
    if (index > -1) {
      canvasObject.splice(index, 1);
      for (let i = index; i < canvasObject.length; i++) {
        canvasObject[i].canvasID -= 1;
      }
    }

    //delete route branch
    if (deleteObj.rootRoute) {
      const rootRoute = deleteObj.rootRoute
      const branchIndex = rootRoute.branchRoute.indexOf(deleteObj)
      rootRoute.branchRoute.splice(branchIndex, 1)
      
      //deleteObj.rootRoute = null

      // Find and remove the vertices with matching labels for the branch being deleted
      const vertexLabels = [`C${branchIndex }`];
      rootRoute.basePolygon.vertex = rootRoute.basePolygon.vertex.filter(vertex => 
        !vertexLabels.includes(vertex.label)
      );

      rootRoute.receiveNewRoute()
      rootRoute.setCoords()

    } else if (deleteObj.branchRoute) {
      const branchRoute = deleteObj.branchRoute
      branchRoute.forEach(branch => {
        branch.rootRoute = null
        branch.deleteObject()
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
          anchoredGroup.set({  lockMovementY: false });
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

  // Find nearby objects that are candidates for snapping
  findNearbyObjects() {
    if (!this.basePolygon) return [];
    
    const thisCoords = this.getEffectiveCoords();
    const thisBounds = {
      left: Math.min(...thisCoords.map(p => p.x)),
      top: Math.min(...thisCoords.map(p => p.y)),
      right: Math.max(...thisCoords.map(p => p.x)),
      bottom: Math.max(...thisCoords.map(p => p.y))
    };
    
    // Consider all canvas objects within an extended range
    const snapRange = SNAP_THRESHOLD * 3;
    return canvasObject.filter(obj => {
      if (obj === this) return false;
      
      try {
        const objCoords = obj.getEffectiveCoords();
        if (!objCoords || objCoords.length === 0) return false;
        
        const objBounds = {
          left: Math.min(...objCoords.map(p => p.x)),
          top: Math.min(...objCoords.map(p => p.y)),
          right: Math.max(...objCoords.map(p => p.x)),
          bottom: Math.max(...objCoords.map(p => p.y))
        };
        
        // Check if objects are within snapping range
        return !(
          objBounds.left - snapRange > thisBounds.right ||
          objBounds.right + snapRange < thisBounds.left ||
          objBounds.top - snapRange > thisBounds.bottom ||
          objBounds.bottom + snapRange < thisBounds.top
        );
      } catch (e) {
        console.warn("Error checking object for snapping:", e);
        return false;
      }
    });
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
    //return[this.line1, this.line2, this.lockIcon]
    this.objects = [...this.lines, ...this.dimensionTexts, ...this.icons,]
  }

  createLock(sourcePoint, targetPoint) {
    let midX
    let midY
    // Create lock lines
    if (this.direction == 'x') {
      this.lines.push(new fabric.Line([sourcePoint.x, sourcePoint.y, targetPoint.x, sourcePoint.y], {
        stroke: 'green',
        strokeWidth: 4,
        selectable: false,
        functionalType: 'anchorLine',
      }));
      this.lines.push(new fabric.Line([targetPoint.x, sourcePoint.y, targetPoint.x, targetPoint.y], {
        stroke: 'green',
        strokeWidth: 4,
        selectable: false,
        strokeDashArray: [10, 5],
        functionalType: 'anchorLine',
      }));
      // Calculate the midpoint of line1
      midX = (sourcePoint.x + targetPoint.x) / 2;
      midY = sourcePoint.y;


      this.dimensionTexts.push(new fabric.Text((targetPoint.x - sourcePoint.x).toFixed() + 'mm',
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
      )
    } else {
      this.lines.push(new fabric.Line([sourcePoint.x, sourcePoint.y, sourcePoint.x, targetPoint.y], {
        stroke: 'red',
        strokeWidth: 4,
        selectable: false,
        functionalType: 'anchorLine',
      }));
      this.lines.push(new fabric.Line([sourcePoint.x, targetPoint.y, targetPoint.x, targetPoint.y], {
        stroke: 'red',
        strokeWidth: 4,
        selectable: false,
        strokeDashArray: [10, 5],
        functionalType: 'anchorLine',
      }));
      // Calculate the midpoint of line1
      midX = sourcePoint.x;
      midY = (sourcePoint.y + targetPoint.y) / 2;

      this.dimensionTexts.push(new fabric.Text((targetPoint.y - sourcePoint.y).toFixed() + 'mm',
        {
          left: midX - 50,
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
      )
    }

    // Create a lock icon using Font Awesome
    this.icons.push(new fabric.Text('\uf023', {
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
    }));
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
    this.dimensionTexts[i].set('fill', this.direction = 'x' ? 'green' : 'red');
    this.icons[i].set('hoverCursor', 'default')
    canvas.renderAll();
  }

  onClick() {
    // Remove lock lines and lock icon from the canvas and baseGroup
    canvas.remove(...this.objects);
    this.baseGroup.anchorageLink = this.baseGroup.anchorageLink.filter(obj => obj !== this.line1 && obj !== this.line2 && obj !== this.lockIcon);
    const anchorX = this.baseGroup.lockXToPolygon.TargetObject
    const anchorY = this.baseGroup.lockYToPolygon.TargetObject
    if (this.direction == 'x') {
      this.baseGroup.lockMovementX = false
      this.baseGroup.lockXToPolygon = {}
      if (anchorY != anchorX && anchorX) {
        anchorX.anchoredPolygon = anchorX.anchoredPolygon.filter(item => item !== this.baseGroup)
      }
    } else {
      this.baseGroup.lockMovementY = false
      this.baseGroup.lockYToPolygon = {}
      if (anchorX != anchorY && anchorY) {
        anchorY.anchoredPolygon = anchorY.anchoredPolygon.filter(item => item !== this.baseGroup)
      }
    }

    canvas.renderAll();
  }
}

class VertexControl extends fabric.Control {
  constructor(vertex, baseGroup) {
    super({
      x: (vertex.x - baseGroup.left) / baseGroup.width - 0.5,
      y: (vertex.y - baseGroup.top) / baseGroup.height -0.5,
      offsetX: 0,
      offsetY: 0,
      cursorStyle: 'pointer',
      cornerSize: 20,
    });
    this.hover = false
    this.mouseUpHandler = this.onClick.bind(this);
    this.render = this.renderControl.bind(this);
    this.vertex = vertex;
    this.baseGroup = baseGroup;
  }

  renderControl(ctx, left, top, styleOverride, fabricObject) {
    const size = this.cornerSize;

    // Draw the circle
    ctx.beginPath();
    ctx.arc(left, top, size / 2, 0, 2 * Math.PI, false);
    ctx.fillStyle = `rgba(255, 20, 20, ${this.hover ? 0.7 : 0.2})`;
    ctx.fill();
    ctx.lineWidth = 1;
    ctx.strokeStyle = this.VertexColorPicker(this.vertex);
    ctx.stroke();

    // Draw the text
    ctx.font = '20px Arial, sans-serif';
    ctx.fillStyle = this.VertexColorPicker(this.vertex);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.vertex.label, left, this.vertex.label.includes('E') ? top - 30 : top + 30);
  }

  VertexColorPicker(vertex){
    switch (vertex.label.substring(0,1)){
      case 'E':
        return 'red'
      case 'V':
        return 'violet'
      case 'C':
        return 'blue'
    }
  }

  onClick(eventData, transform) {
    const vertexX = this.vertex.x;
    const vertexY = this.vertex.y;
    if (!activeVertex) {
      activeVertex = this;
      this.isDown = true;
      var points = [vertexX, vertexY, vertexX, vertexY];
      this.line = new fabric.Line(points, {
        stroke: 'yellow',
        strokeWidth: 4,
        strokeDashArray: [5, 5],
        hasControls: false,
        hasBorders: false,
        lockMovementX: false,
        lockMovementY: false,
        hoverCursor: 'default',
        selectable: false,
      });
      canvas.add(this.line);

      document.removeEventListener('keydown', ShowHideSideBarEvent);
      document.addEventListener('keydown', this.cancelLink.bind(this));
      canvas.on('mouse:move', this.handleMouseMove);
      canvas.renderAll();
    } else {
      anchorShape(this.baseGroup, activeVertex.baseGroup, { vertexIndex1: activeVertex.vertex.label, vertexIndex2: this.vertex.label });
      activeVertex.deleteLink();
      activeVertex = null;
    }
  }

  onHover() {
    //this.circle.set('fill', 'rgba(255,255,255,0.5)');
    this.hover = true;
    canvas.renderAll();
  }

  onMouseOut() {
    //this.circle.set('fill', 'rgba(255,255,255,0.2)');
    this.hover = false;
    canvas.renderAll();
  }

  handleMouseMove = (event) => {
    if (!this.isDown) return;
    var pointer = canvas.getPointer(event.e);
    this.line.set({
      x2: pointer.x,
      y2: pointer.y,
    });
    canvas.requestRenderAll();
  };

  cancelLink(event) {
    if (event.key === 'Escape') {
      this.deleteLink();
      activeVertex = null;
    }
  }

  deleteLink() {
    canvas.remove(this.line);
    canvas.off('mouse:move', this.handleMouseMove);
    this.isDown = false;
    canvas.requestRenderAll();
    setTimeout(() => {
      document.addEventListener('keydown', ShowHideSideBarEvent);
    }, 1000);
  }
}


async function drawLabeledSymbol(symbol, options) {
  const { x, y, length, angle, color } = options;
  // Create polygon with labeled vertices
  const arrow = new GlyphPath();
  const shapeMeta = calcSymbol(symbol, length);
  // Wait for the initialization to complete
  const shape = await arrow.initialize(shapeMeta, {
    left: x,
    top: y,
    fill: color || 'black',
    angle: angle || 0,
    objectCaching: false,
    dirty: true,
    strokeWidth: 0,
  })

  arrow.symbol = symbol;

  new BaseGroup(arrow, 'Symbol');
}

/**
 * Helper function to determine if a vertex should be used for snapping
 * @param {Object} vertex - The vertex to check
 * @returns {boolean} - True if the vertex is valid for snapping, false otherwise
 */
function isValidVertexForSnapping(vertex) {
  if (!vertex || !vertex.label) return false;
  
  // Check if vertex label starts with any of the valid prefixes
  return VALID_VERTEX_PREFIXES.some(prefix => 
    vertex.label.toUpperCase().startsWith(prefix)
  );
}


