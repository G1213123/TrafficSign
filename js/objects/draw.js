import { CanvasGlobals } from "../canvas/canvas.js";
import { calculateTransformedPoints, convertVertexToPathCommands, getFontPath, convertFontPathToFabricPath } from "./path.js";
import { canvasTracker } from "../canvas/Tracker.js";
import { VertexControl } from "./vertex.js";
import { BorderDimensionDisplay } from "./dimension.js";
import { LockIcon } from "./lock.js";
import { globalAnchorTree, anchorShape } from './anchor.js';
import { CanvasObjectInspector } from "../sidebar/sb-inspector.js";
import { showPropertyPanel, handleClear } from '../sidebar/property.js'; // Import showPropertyPanel

const canvas = CanvasGlobals.canvas; // Assuming canvas is a global variable in canvas.js
const canvasObject = CanvasGlobals.canvasObject; // Assuming canvasObject is a global variable in canvas.js

const deleteIcon =
  "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";


// additional property for fabric object
//const originalToObject = fabric.Object.prototype.toObject;
//const myAdditional = ['functionalType'];
//fabric.Object.prototype.toObject = function (additionalProperties) {
//  return originalToObject.call(this, myAdditional.concat(additionalProperties));
//}

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

  initialize(shapeMeta, options) {
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
    options.strokeWidth = 0;

    // Store vertex data for reference
    this.vertex = shapeMeta.path.map(p => p.vertex).flat();
    this.insertPoint = shapeMeta.path[0].vertex[0];

    // Create fabric.Path objects directly from vertex data
    shapeMeta.path.forEach(path => {
      const pathCommands = convertVertexToPathCommands(path);
      const pathObj = new fabric.Path(pathCommands, {
        fill: path.fill || options.fill || 'white',
        stroke: options.stroke || 'none',
        strokeWidth: options.strokeWidth || 0,
        objectCaching: options.objectCaching,
        originX: 'left',
        originY: 'top'
      });
      this.add(pathObj);
    });

    // Add text elements if present
    if (shapeMeta.text && shapeMeta.text.length > 0) {
      shapeMeta.text.forEach(textElem => {
        const charPath = getFontPath(textElem);
        if (charPath && charPath.commands) {
          // Convert font path commands to fabric.Path format
          const pathCommands = convertFontPathToFabricPath(charPath.commands, textElem);
          const textPathObj = new fabric.Path(pathCommands, {
            fill: textElem.fill || options.fill || 'black',
            stroke: 'none',
            strokeWidth: 0,
            objectCaching: options.objectCaching,
            originX: 'left',
            originY: 'top'
          });
          this.add(textPathObj);
        }
      });
    }

    this.setCoords();
  }

}


// Define the BaseGroup class using ES6 class syntax
class BaseGroup extends fabric.Group {
  /**
   * List of property names to include in metadata.
   * @type {string[]}
   */
  _metadataKeys = [];
  _arrayPropertiesToSerializeItemByCanvasID = ['heightObjects', 'widthObjects'];

  constructor(basePolygon, functionalType, options = {}) {
    super([], {
      subTargetCheck: true,
      lockScalingX: true,// lock scaling
      lockScalingY: true
    });

    // Initialize metadata keys with default properties
    this._metadataKeys = ['functionalType', 'canvasID'];
    Object.keys(options).forEach(key => {
      if (!this._metadataKeys.includes(key)) {
        this._metadataKeys.push(key);
      }
    });

    this.functionalType = functionalType;
    this.anchoredPolygon = [];
    this.anchorageLink = [];
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


    this.on('mousedblclick', (e) => {
      showPropertyPanel(this);
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


  /**
   * Registers property names to include in metadata.
   * @param {...string} keys
   */
  registerMetadataKeys(...keys) {
    this._metadataKeys.push(...keys);
  }

  /**
   * Returns an object containing the registered metadata.
   */
  getMetadata() {
    const meta = {};
    this._metadataKeys.forEach(key => {
      if (Object.prototype.hasOwnProperty.call(this, key)) {
        meta[key] = this[key];
      }
    });
    return meta;
  }

  /**
   * Serializes the BaseGroup object to a JSON string based on its metadata.
   * @returns {string} JSON string representation of the object.
   */
  serializeToJSON() {
    const meta = this.getMetadata();
    // Add any other properties that are essential for reconstruction but might not be in _metadataKeys by default
    // For example, the class type itself, or specific geometric properties if not covered.
    // For now, we rely on what's populated in _metadataKeys and direct properties.

    const dataToSerialize = { ...meta };
    dataToSerialize.objectType = this.constructor.name; // Store the class name for reconstruction
    dataToSerialize.left = this.left
    dataToSerialize.top = this.top
    dataToSerialize.refTopLeft = this.refTopLeft


    // Serialize references to other BaseGroup objects by their canvasID
    const propertiesToSerializeById = ['borderGroup', 'mainRoad'];
    propertiesToSerializeById.forEach(propName => {
      if (this[propName] && typeof this[propName].canvasID !== 'undefined') {
        dataToSerialize[propName] = this[propName].canvasID;
      } else if (this[propName]) {
        // If it's not a BaseGroup but some other object, serialize as is (or define specific logic)
        dataToSerialize[propName] = JSON.parse(JSON.stringify(this[propName]));
      }
    });

    const arrayPropertiesToSerializeById = ['anchoredPolygon', 'sideRoad', 'widthObjects', 'heightObjects', 'leftObjects', 'aboveObjects', 'rightObjects', 'belowObjects', 'VDivider', 'HDivider'];
    arrayPropertiesToSerializeById.forEach(propName => {
      if (this[propName] && Array.isArray(this[propName])) {
        dataToSerialize[propName] = this[propName].map(item => {
          if (item && typeof item.canvasID !== 'undefined') {
            return item.canvasID;
          }
          // If item is not a BaseGroup or doesn't have canvasID, serialize as is or handle specifically
          return JSON.parse(JSON.stringify(item));
        });
      }
    });

    // Handle lockXToPolygon and lockYToPolygon TargetObject
    if (this.lockXToPolygon && typeof this.lockXToPolygon.TargetObject?.canvasID !== 'undefined') {
      dataToSerialize.LockXInfo = {
        TargetObjectID: this.lockXToPolygon.TargetObject.canvasID,
        sourcePoint: this.lockXToPolygon.sourcePoint, // Assuming AnchorPoint on this object is the source
        targetPoint: this.lockXToPolygon.targetPoint, // Assuming this new property will hold the target's vertex index
        spacingX: this.lockXToPolygon.spacing, // Assuming this property exists or will be added
      };
    } else if (this.lockXToPolygon) {
      dataToSerialize.lockXToPolygon = JSON.parse(JSON.stringify(this.lockXToPolygon));
    }


    if (this.lockYToPolygon && typeof this.lockYToPolygon.TargetObject?.canvasID !== 'undefined') {
      dataToSerialize.LockYInfo = {
        TargetObjectID: this.lockYToPolygon.TargetObject.canvasID,
        sourcePoint: this.lockYToPolygon.sourcePoint, // Assuming AnchorPoint on this object is the source
        targetPoint: this.lockYToPolygon.targetPoint, // Assuming this new property will hold the target's vertex index
        spacingY: this.lockYToPolygon.spacing, // Assuming this property exists or will be added
      };
    } else if (this.lockYToPolygon) {
      dataToSerialize.lockYToPolygon = JSON.parse(JSON.stringify(this.lockYToPolygon));
    }

    // Serialize other direct properties that might have been missed by _metadataKeys but are important
    // Example: this.left, this.top, this.width, this.height, this.angle, etc.
    // FabricJS's toObject() usually handles these, but if you're not using it for the group itself:
    dataToSerialize.left = this.left;
    dataToSerialize.top = this.top;
    dataToSerialize.width = this.width;
    dataToSerialize.height = this.height;
    dataToSerialize.angle = this.angle;
    // Add any other fabric.Object properties you need to preserve


    // You'll need to expand this based on how you plan to reconstruct the objects.
    // Consider if sub-objects (like those in anchoredPolygon) need their own serializeToJSON methods.

    return JSON.stringify(dataToSerialize, (key, value) => {
      // Custom replacer to handle circular references or complex objects if any remain
      if (value instanceof fabric.Object && value !== this.basePolygon) {
        // Avoid serializing full fabric objects unless explicitly handled (like basePolygon)
        // This is a safeguard. Ideally, all fabric objects are handled above.
        if (typeof value.canvasID !== 'undefined') return `ref:${value.canvasID}`; // or just its ID
        return `fabricObject:${value.type}`; // Or some other placeholder
      }
      return value;
    });
  }

  // Show border dimensions when selected
  showDimensions() {
    // Clean up any existing dimension annotations
    this.hideDimensions();

    // Get border coordinates
    const borderRect = this.getBoundingRect();

    // Find closest objects in each direction to show dimensions
    if (!this.isTemporary && !this.focusMode) {
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
      this._showName = `<Group ${this.canvasID}> ${this.functionalType}${basePolygon.text ? ' - ' + basePolygon.text : ''}${basePolygon.symbol ? ' - ' + basePolygon.symbol : ''}${this.roadType ? ' - ' + this.roadType : ''}${this.borderType ? ' - ' + this.borderType : ''}`;

      this.basePolygon.insertPoint = this.basePolygon.vertex ? this.basePolygon.vertex[0] : null;
      canvas.remove(this.basePolygon);
      this.add(this.basePolygon);

      // Basepolygon async not loaded, make a temp dimension
      if (this.width == 0 || this.height == 0) {
        let left = Infinity
        let top = Infinity
        let right = -Infinity
        let bottom = -Infinity
        this.basePolygon.vertex.forEach((v) => {
          right = Math.max(right, v.x)
          bottom = Math.max(bottom, v.y)
          left = Math.min(left, v.x)
          top = Math.min(top, v.y)
        }
        )
        this.tempWidth = left - right
        this.tempHeight = bottom - top
        this.tempLeft = left
        this.tempTop = top
      }

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
      else if (this.focusMode && CanvasGlobals.activeVertex) {
        shouldDisplay = (CanvasGlobals.activeVertex.vertex.label === vertexLabel);
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
      if (this.functionalType === 'SideRoad') {
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
  emitDelta(deltaX, deltaY, _sourceList = []) {
    // For X axis changes
    if (deltaX !== 0) {
      // Get all objects that should be updated in X axis
      const xUpdateOrder = globalAnchorTree.getUpdateOrder('x', this.canvasID);

      // Start an X-axis update cycle if needed with this object as the starter
      if (!globalAnchorTree.updateInProgressX) {
        globalAnchorTree.startUpdateCycle('x', this.canvasID);
      }

      // Mark this object as updated in X axis
      globalAnchorTree.updatedObjectsX.add(this.canvasID);

      // Update each object in X axis
      xUpdateOrder.forEach(obj => {
        if (!globalAnchorTree.updatedObjectsX.has(obj.canvasID)) {
          globalAnchorTree.updatedObjectsX.add(obj.canvasID);
          obj.set({ left: obj.left + deltaX });
          obj.setCoords();
          obj.updateAllCoord(null, [], true); // selfOnly=true to prevent recursion
        }
      });

      // End the X-axis update cycle if this object started it
      if (globalAnchorTree.isUpdateStarter('x', this.canvasID)) {
        globalAnchorTree.endUpdateCycle('x');
      }
    }

    // For Y axis changes
    if (deltaY !== 0) {
      // Get all objects that should be updated in Y axis
      const yUpdateOrder = globalAnchorTree.getUpdateOrder('y', this.canvasID);

      // Start a Y-axis update cycle if needed with this object as the starter
      if (!globalAnchorTree.updateInProgressY) {
        globalAnchorTree.startUpdateCycle('y', this.canvasID);
      }

      // Mark this object as updated in Y axis
      globalAnchorTree.updatedObjectsY.add(this.canvasID);

      // Update each object in Y axis
      yUpdateOrder.forEach(obj => {
        if (!globalAnchorTree.updatedObjectsY.has(obj.canvasID)) {
          globalAnchorTree.updatedObjectsY.add(obj.canvasID);
          obj.set({ top: obj.top + deltaY });
          obj.setCoords();
          obj.updateAllCoord(null, [], true); // selfOnly=true to prevent recursion
        }
      });

      // End the Y-axis update cycle if this object started it
      if (globalAnchorTree.isUpdateStarter('y', this.canvasID)) {
        globalAnchorTree.endUpdateCycle('y');
      }
    }


  }

  // Method to receive deltaX and deltaY and update position
  receiveDelta(caller, deltaX, deltaY, _sourceList = []) {
    // Only update axis if the caller is the target of our lock
    const newDeltaX = this.lockXToPolygon.TargetObject == caller ? deltaX : 0;
    const newDeltaY = this.lockYToPolygon.TargetObject == caller ? deltaY : 0;

    // Update position
    this.set({
      left: this.left + newDeltaX,
      top: this.top + newDeltaY
    });

    this.setCoords();

    // Track if we start update cycles that need to be closed
    let startedXCycle = false;
    let startedYCycle = false;

    try {
      // Use the AnchorTree to update coordinates properly
      if (newDeltaX !== 0) {
        // Start an X-axis update cycle if needed
        if (!globalAnchorTree.updateInProgressX) {
          globalAnchorTree.startUpdateCycle('x');
          startedXCycle = true;
        }
        globalAnchorTree.updatedObjectsX.add(this.canvasID);
      }

      if (newDeltaY !== 0) {
        // Start a Y-axis update cycle if needed
        if (!globalAnchorTree.updateInProgressY) {
          globalAnchorTree.startUpdateCycle('y');
          startedYCycle = true;
        }
        globalAnchorTree.updatedObjectsY.add(this.canvasID);
      }

      // Update coordinates without using sourceList
      this.updateAllCoord(null, [], false);
    } finally {
      // Always end update cycles if we started them, even if an error occurs
      if (startedXCycle) {
        globalAnchorTree.endUpdateCycle('x');
      }

      if (startedYCycle) {
        globalAnchorTree.endUpdateCycle('y');
      }
    }
  }



  // Method to call for border resizing
  borderResize(_sourceList = []) {
    if (this.borderGroup && !globalAnchorTree.updatedObjectsX.has(this.borderGroup.canvasID) &&
      !globalAnchorTree.updatedObjectsY.has(this.borderGroup.canvasID)) {

      this.borderGroup.processResize()
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
  updateAllCoord(event, _sourceList = [], _selfOnly = false) {
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
    } if (canvas.getActiveObject() === this) {
      this.drawAnchorLinkage();
      this.showLockHighlights();
      this.showDimensions();
    }
    // Check if this object is already being processed in the current update cycle
    const alreadyProcessedX = globalAnchorTree.updateInProgressX && globalAnchorTree.updatedObjectsX.has(this.canvasID);
    const alreadyProcessedY = globalAnchorTree.updateInProgressY && globalAnchorTree.updatedObjectsY.has(this.canvasID);

    // Check if this object has been directly moved through anchoring
    // If either lockXToPolygon or lockYToPolygon has values, it's an anchored object
    const isAnchoredObjectX = Object.keys(this.lockXToPolygon).length > 0;
    const isAnchoredObjectY = Object.keys(this.lockYToPolygon).length > 0;

    // Only propagate updates if:
    // 1. The object hasn't been processed yet in the current cycle, AND
    // 2. For anchored objects, only propagate if the object itself initiated the movement (not if it was moved by another object)
    const needXPropagation = deltaX !== 0 && !alreadyProcessedX && (!isAnchoredObjectX || globalAnchorTree.starterObjectX === this.canvasID);
    const needYPropagation = deltaY !== 0 && !alreadyProcessedY && (!isAnchoredObjectY || globalAnchorTree.starterObjectY === this.canvasID);

    if (needXPropagation || needYPropagation) {
      // Start update cycles if needed and record this object as the starter
      if (needXPropagation && !globalAnchorTree.updateInProgressX) {
        globalAnchorTree.startUpdateCycle('x', this.canvasID);
      }

      if (needYPropagation && !globalAnchorTree.updateInProgressY) {
        globalAnchorTree.startUpdateCycle('y', this.canvasID);
      }

      // Mark this object as updated in both axes if changed
      if (deltaX !== 0) globalAnchorTree.updatedObjectsX.add(this.canvasID);
      if (deltaY !== 0) globalAnchorTree.updatedObjectsY.add(this.canvasID);

      // Get all objects that need to be updated (combine X and Y updates)
      const xUpdateOrder = deltaX !== 0 ? globalAnchorTree.getUpdateOrder('x', this.canvasID) : [];
      const yUpdateOrder = deltaY !== 0 ? globalAnchorTree.getUpdateOrder('y', this.canvasID) : [];

      // Combine updates and remove duplicates while preserving order
      const allObjectsToUpdate = new Map();

      // First add X axis updates with their axis info
      xUpdateOrder.forEach(obj => {
        if (!globalAnchorTree.updatedObjectsX.has(obj.canvasID)) {
          allObjectsToUpdate.set(obj.canvasID, {
            object: obj,
            updateX: true,
            updateY: false
          });
        }
      });

      // Then add or update with Y axis info
      yUpdateOrder.forEach(obj => {
        if (!globalAnchorTree.updatedObjectsY.has(obj.canvasID)) {
          if (allObjectsToUpdate.has(obj.canvasID)) {
            // Object already needs X update, add Y update too
            allObjectsToUpdate.get(obj.canvasID).updateY = true;
          } else {
            // New object that only needs Y update
            allObjectsToUpdate.set(obj.canvasID, {
              object: obj,
              updateX: false,
              updateY: true
            });
          }
        }
      });

      // Process all objects in a single pass
      allObjectsToUpdate.forEach(info => {
        // Apply position changes based on which axes need updates
        if (info.updateX) {
          globalAnchorTree.updatedObjectsX.add(info.object.canvasID);
          info.object.set({ left: info.object.left + deltaX });
        }

        if (info.updateY) {
          globalAnchorTree.updatedObjectsY.add(info.object.canvasID);
          info.object.set({ top: info.object.top + deltaY });
        }

        // Update coordinates in a single operation
        info.object.setCoords();

        // Recursive call but object will be skipped in next cycle due to being in updatedObjects set
        info.object.updateAllCoord(null, []);
      });

      // For backward compatibility, still call emitDelta
      //this.emitDelta(deltaX, deltaY, []);

      // Check if this object is the starter of any update chain and if so, end the cycle
      if (globalAnchorTree.isUpdateStarter('x', this.canvasID)) {
        globalAnchorTree.endUpdateCycle('x');
      }

      if (globalAnchorTree.isUpdateStarter('y', this.canvasID)) {
        globalAnchorTree.endUpdateCycle('y');
      }
    }

    // Check if border resize is needed
    const firstXBorder = globalAnchorTree.starterObjectX !== null ? canvasObject[globalAnchorTree.starterObjectX].borderGroup : null;
    const firstYBorder = globalAnchorTree.starterObjectY !== null ? canvasObject[globalAnchorTree.starterObjectY].borderGroup : null;
    if (this.functionalType !== 'HDivider' &&
      this.functionalType !== 'VDivider' &&
      this.functionalType !== 'HLine' &&
      this.functionalType !== 'VLane' &&
      (this.borderGroup !== firstXBorder ||
        this.canvasID == globalAnchorTree.starterObjectX
      ) &&
      (this.borderGroup !== firstYBorder ||
        this.canvasID == globalAnchorTree.starterObjectY)) {
      this.borderResize();
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

    return this.basePolygon.getCoords();
  }
  // Method to delete the object
  deleteObject(_eventData, transform) {
    const deleteObj = transform?.target || transform || this

    // Track object deletion before actually deleting it
    canvasTracker.track('deleteObject', [{
      type: 'BaseGroup',
      id: deleteObj.canvasID,
      functionalType: deleteObj.functionalType
    }]);

    // Close property panel if it is open for the object being deleted
    handleClear(null);

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
        anchoredGroup.focusMode = false;
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
    //this.hideDimensions();
    //this.drawVertex(false);
    canvas.renderAll();
  }

  // New method to exit focus mode
  exitFocusMode() {
    this.focusMode = false;
    //this.drawVertex(false);
    //if (canvas.getActiveObject() === this) {
    //  this.showDimensions();
    //}
    canvas.renderAll();
  }
}

// Register the custom class with Fabric.js
fabric.BaseGroup = BaseGroup;



export { BaseGroup, GlyphPath };