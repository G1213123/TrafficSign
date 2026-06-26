import { BaseGroup } from './draw.js';
import { BorderDimensionDisplay, RadiusDimensionDisplay } from './dimension.js';
import { globalAnchorTree, processUpdateCycle } from './anchor.js';
import { BorderTypeScheme, BorderColorScheme, BorderFrameWidth, BorderPaddingWidth, DividerMargin } from './template.js';
import { vertexToPath } from './path.js';
import { CanvasGlobals, DrawGrid } from '../canvas/canvas.js';
import { drawDivider } from './divider.js';

const canvas = CanvasGlobals.canvas; // Access the global canvas object
const canvasObject = CanvasGlobals.canvasObject // Get all objects on the canvas

// Add function to remove anchor between objects
function removeAnchor(sourceObject, targetObject) {
  // Save the source and target objects before delinking
  const savedSourceObject = sourceObject;
  const savedTargetObject = targetObject;

  // Check if the source object has the targetObject in its anchoredPolygon array
  if (sourceObject.anchoredPolygon && Array.isArray(sourceObject.anchoredPolygon)) {
    // Remove the target object from the source's anchoredPolygon array
    sourceObject.anchoredPolygon = sourceObject.anchoredPolygon.filter(obj => obj !== targetObject);
  }

  // Clean up the target object's lock properties
  if (targetObject.lockXToPolygon && targetObject.lockXToPolygon.TargetObject === sourceObject) {
    targetObject.lockXToPolygon = {};
  }

  if (targetObject.lockYToPolygon && targetObject.lockYToPolygon.TargetObject === sourceObject) {
    targetObject.lockYToPolygon = {};
  }

  // Return the saved objects for reference
  return { source: savedSourceObject, target: savedTargetObject };
}

// Add BorderUtilities object to hold functions moved from FormBorderWrapComponent
const BorderUtilities = {

  getExtremeObject: function (objects, direction) {
    let extremeObject = null;
    let extremeValue = direction === 'bottom' || direction === 'right' ? -Infinity : Infinity;

    objects.forEach(obj => {
      let value;

      switch (direction) {
        case 'bottom':
          value = obj.top + obj.height * obj.scaleY;
          if (value > extremeValue) {
            extremeValue = value;
            extremeObject = obj;
          }
          break;
        case 'top':
          value = obj.top;
          if (value < extremeValue) {
            extremeValue = value;
            extremeObject = obj;
          }
          break;
        case 'right':
          value = obj.left + obj.width * obj.scaleX;
          if (value > extremeValue) {
            extremeValue = value;
            extremeObject = obj;
          }
          break;
        case 'left':
          value = obj.left;
          if (value < extremeValue) {
            extremeValue = value;
            extremeObject = obj;
          }
          break;
      }
    });

    return extremeObject;
  },

  // For backward compatibility
  getBottomMostObject: function (objects) {
    return this.getExtremeObject(objects, 'bottom');
  },

  getTopMostObject: function (objects) {
    return this.getExtremeObject(objects, 'top');
  },

  // Function to get the bounding box of specific objects
  getBoundingBox: function (objects) {
    // Loop through each object and its basePolygon
    let combinedBBox = { left: Infinity, top: Infinity, right: -Infinity, bottom: -Infinity };
    objects.forEach(obj => {
      const coord = obj.getEffectiveCoords()
      // Update the combined bounding box
      combinedBBox.left = Math.min(combinedBBox.left, coord[0].x,);
      combinedBBox.top = Math.min(combinedBBox.top, coord[0].y,);
      combinedBBox.right = Math.max(combinedBBox.right, coord[2].x,);
      combinedBBox.bottom = Math.max(combinedBBox.bottom, coord[2].y,);
    })

    // Return the bounding box coordinates
    return combinedBBox
  },

  // Function to calculate padded coordinates 
  paddingCoords: function getPaddedCoords(coords, xHeight, padLeft, padRight, padTop, padBottom) {
    return {
      left: coords.left - padLeft * xHeight / 4,
      top: coords.top - padTop * xHeight / 4,
      right: coords.right + padRight * xHeight / 4,
      bottom: coords.bottom + padBottom * xHeight / 4
    }
  },

  calcBorder: function (heightObjects, widthObjects, xHeight, borderType) {
    // Get the bounding box of the active selection 
    const coordsWidth = BorderUtilities.getBoundingBox(widthObjects)
    const coordsHeight = BorderUtilities.getBoundingBox(heightObjects)
    const coords = { left: coordsWidth.left, top: coordsHeight.top, right: coordsWidth.right, bottom: coordsHeight.bottom }

    /*
      coords[0]: Top-left corner
      coords[1]: Top-right corner
      coords[2]: Bottom-right corner
      coords[3]: Bottom-left corner
    */

    innerBorderCoords = BorderUtilities.paddingCoords(coords, xHeight, borderType.PaddingLeft, borderType.PaddingRight, borderType.PaddingTop, borderType.PaddingNBottom,)
    outerBorderCoords = BorderUtilities.paddingCoords(innerBorderCoords, xHeight, borderType.FrameWidth, borderType.FrameWidth, borderType.FrameWidth, borderType.FrameWidth,)

    // Border Rounding
    borderWidth = outerBorderCoords.right - outerBorderCoords.left
    borderHeight = outerBorderCoords.bottom - outerBorderCoords.top
    if (borderWidth > 2000 || borderHeight > 2000) {
      roundingX = (50.0 * Math.round(borderWidth / 50.0) - borderWidth) / 2
      roundingY = (50.0 * Math.round(borderHeight / 50.0) - borderHeight) / 2
    } else {
      roundingX = (25.0 * Math.round(borderWidth / 25.0) - borderWidth) / 2
      roundingY = (25.0 * Math.round(borderHeight / 25.0) - borderHeight) / 2
      roundingX = roundingX < -2.5 ? roundingX = 25 / 2 + roundingX : roundingX
      roundingY = roundingY < -2.5 ? roundingY = 25 / 2 + roundingY : roundingY
    }

    outerBorderCoords = {
      left: outerBorderCoords.left - roundingX,
      top: outerBorderCoords.top - roundingY,
      right: outerBorderCoords.right + roundingX,
      bottom: outerBorderCoords.bottom + roundingY
    }

    innerBorderCoords = {
      left: innerBorderCoords.left - roundingX,
      top: innerBorderCoords.top - roundingY,
      right: innerBorderCoords.right + roundingX,
      bottom: innerBorderCoords.bottom + roundingY
    }
    console.log(outerBorderCoords.top - innerBorderCoords.top)
    return { in: innerBorderCoords, out: outerBorderCoords }
  },

  calcBorderRounding: function (borderType, xHeight, bbox) {
    const block = { width: bbox.right - bbox.left, height: bbox.bottom - bbox.top }
    const rounding = { x: 0, y: 0 }
    const shapeMeta = BorderTypeScheme[borderType](xHeight, block, rounding)
    let roundingX = 0, roundingY = 0

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    // Create polygon with labeled vertices
    shapeMeta.path.forEach(p => {
      p.vertex.forEach((vertex) => {
        vertex.x += bbox.left;
        vertex.y += bbox.top;
        minX = Math.min(minX, vertex.x);
        minY = Math.min(minY, vertex.y);
        maxX = Math.max(maxX, vertex.x);
        maxY = Math.max(maxY, vertex.y);
      });
    });
    let borderWidth = maxX - minX;
    let borderHeight = maxY - minY;

    if (borderWidth > 2000 || borderHeight > 2000) {
      roundingX = (50.0 * Math.round(borderWidth / 50.0) - borderWidth) / 2
      roundingY = (50.0 * Math.round(borderHeight / 50.0) - borderHeight) / 2
    } else {
      roundingX = (25.0 * Math.round(borderWidth / 25.0) - borderWidth) / 2
      roundingY = (25.0 * Math.round(borderHeight / 25.0) - borderHeight) / 2
      roundingX = roundingX < -2.5 ? roundingX = 25 / 2 + roundingX : roundingX
      roundingY = roundingY < -2.5 ? roundingY = 25 / 2 + roundingY : roundingY
    }
    return { x: roundingX, y: roundingY }
  },

  FilterDivider: function (heightObjects, widthObjects, VDivider, HDivider) {
    let HDividerObject = []
    if (HDivider) {
      HDividerObject.push(...HDivider)
    }
    let VDividerObject = []
    if (VDivider) {
      VDividerObject.push(...VDivider)
    }
    let borderedObjects = []
    let fwidthObjects = widthObjects.filter(obj => {
      if (obj.functionalType == 'HDivider' || obj.functionalType == 'HLine') {
        HDividerObject.push(obj);
        return false; // Remove the object from original array
      }
      return true; // Keep the object in original array
    });

    let fheightObjects = heightObjects.filter(obj => {
      if (obj.functionalType == 'VDivider' || obj.functionalType == 'VLane') {
        VDividerObject.push(obj);
        return false; // Remove the object from original array
      }
      return true; // Keep the object in original array
    });
    return [fheightObjects, fwidthObjects, VDividerObject, HDividerObject, borderedObjects]
  },


  getBorderObjectCoords: function (fheightObjects, fwidthObjects) {
    const coordsWidth = BorderUtilities.getBoundingBox(fwidthObjects)
    const coordsHeight = BorderUtilities.getBoundingBox(fheightObjects)
    return { left: coordsWidth.left, top: coordsHeight.top, right: coordsWidth.right, bottom: coordsHeight.bottom }
  },

  BorderGroupCreate: function (borderType, heightObjects, widthObjects, widthText, heightText, options = null) {
    const xHeight = options ? options.xHeight : parseInt(document.getElementById("input-xHeight").value)
    //const borderType = options ? options.borderType : document.getElementById("input-type").value
    const colorType = options ? options.colorType : document.getElementById("input-color").value



    try {
      //const BaseBorder = drawLabeledBorder(borderType, xHeight, coords, colorType)

      // Use the new BorderGroup class instead of BaseGroup
      const borderGroup = new BorderGroup({
        borderType: borderType,
        widthObjects: [...widthObjects],
        heightObjects: [...heightObjects],
        fixedWidth: widthText,
        fixedHeight: heightText,
        xHeight: xHeight,
        color: colorType,
        frame: BorderFrameWidth[borderType],
        fixedWidthCoords: null,
        fixedHeightCoords: null
      });


      // Add mid points and assign widths to dividers
      //borderGroup.assignWidthToDivider(); // Ensure this await is always present
      //borderGroup.addMidPointToDivider();


      // Send border to back and update object references
      //canvas.sendObjectToBack(borderGroup);


      //canvas.renderAll();
      return borderGroup;
    } catch (error) {
      console.error("Error creating border group:", error);
      throw error; // Re-throw to allow calling function to handle errors
    }
  },

  // Find the object closest to a border edge
  findClosestObject(objects, direction, innerBorder) {
    if (!objects || objects.length === 0) return null;

    let closestObject = null;
    let minDistance = Number.MAX_VALUE;

    objects.forEach(obj => {
      if (!obj.getBoundingRect) return;

      const objRect = obj.getBoundingRect();
      let distance = 0;

      switch (direction) {
        case 'top':
          distance = objRect.top - innerBorder.top;
          break;
        case 'bottom':
          distance = innerBorder.bottom - (objRect.top + objRect.height);
          break;
        case 'left':
          distance = objRect.left - innerBorder.left;
          break;
        case 'right':
          distance = innerBorder.right - (objRect.left + objRect.width);
          break;
      }

      // Only consider positive distances (objects inside the border)
      if (distance >= 0 && distance < minDistance) {
        minDistance = distance;
        closestObject = obj;
      }
    });

    return closestObject;
  },

  // Additional border utility methods would go here
}

// Define BorderGroup class that extends BaseGroup
class BorderGroup extends BaseGroup {
  constructor(options = {}) {
    // Call the parent constructor with the base border and 'Border' functional type
    super(null, 'Border', 'BorderGroup', options);

    // Initialize border-specific properties
    this.widthObjects = options.widthObjects || [];
    this.heightObjects = options.heightObjects || [];
    this.fixedWidth = options.fixedWidth || null;
    this.fixedHeight = options.fixedHeight || null;
    this.borderType = options.borderType;
    this.xHeight = options.xHeight || 100;
    this.color = options.color;
    this.left = options.left || 0;
    this.top = options.top || 0;
    this.dimensionAnnotations = [];
    this.frame = BorderFrameWidth[this.borderType]; // Frame width for the border
    this.defaultPadding = BorderPaddingWidth[this.borderType] || { left: 0, top: 0, right: 0, bottom: 0 };
    this.inbbox = null; // Inner border bounding box
    this.rounding = { x: 0, y: 0 }; // Rounding values for the border
    this.compartmentBboxes = []; // Array of compartment bounding boxes
    this.VDivider = options.VDivider || [];
    this.HDivider = options.HDivider || [];

    // Cache for fixed dimension coordinates
    this.fixedWidthCoords = options.fixedWidthCoords || null;
    this.fixedHeightCoords = options.fixedHeightCoords || null;
    this._metadataKeys.push("fixedWidthCoords", "fixedHeightCoords");

    // Add status flag to track border updates
    this.isUpdating = false; // Flag to track if the border is currently being updated

    // Lock movement for border
    if (this.fixedWidth == null) {
      this.lockMovementX = true;
    }
    if (this.fixedHeight == null) {
      this.lockMovementY = true;
    }

    this.initialize(); // Call the initialize method to set up the border

    // Calculate initial bbox
    this.updateBboxes();
  }

  initialize() {
    if (this.inbbox == null) {
      this.filterBorderObjects();
      this.calcfixedBboxes(); // true indicates this is initialization
      this.rounding = BorderUtilities.calcBorderRounding(this.borderType, this.xHeight, this.inbbox);
    }

    this.setBasePolygon(this.drawBorder());

    //this.RoundingToDivider()
    this.assignWidthToDivider();
    canvas.sendObjectToBack(this);
    //DrawGrid();

    this.widthObjects.forEach(obj => {
      // Update the borderGroup reference in each width object
      obj.borderGroup = this;
    });
    this.heightObjects.forEach(obj => {
      // Update the borderGroup reference in each height object
      obj.borderGroup = this;
    });

  }

  drawBorder() {
    const rounding = JSON.parse(JSON.stringify(this.rounding)); // Deep copy rounding to avoid mutation
    const block = {
      width: this.inbbox.right - this.inbbox.left,
      height: this.inbbox.bottom - this.inbbox.top,
    };
    if (!isNaN(parseFloat(this.fixedWidth))) { rounding.x = 0 }
    if (!isNaN(parseFloat(this.fixedHeight))) { rounding.y = 0 }
    const shapeMeta = BorderTypeScheme[this.borderType](this.xHeight, block, rounding);
    const baseGroup = [];

    // Create polygon with labeled vertices
    shapeMeta.path.forEach((p) => {

      p.vertex.forEach((vertex) => {
        vertex.x = vertex.x + this.inbbox.left;
        vertex.y = vertex.y + this.inbbox.top;
      });

      const pathData = vertexToPath({ path: [p] });
      // Extract the d attribute if pathData is a full SVG string
      const dValue = pathData.includes('<path')
        ? pathData.match(/d="([^"]+)"/)?.[1] || pathData
        : pathData;

      const borderShift = p.fill == 'background' ? this.frame * this.xHeight / 4 : 0;

      const vertexleft = Math.min(...p.vertex.map(v => v.x));
      const vertextop = Math.min(...p.vertex.map(v => v.y));

      baseGroup.push(
        new fabric.Path(dValue, {
          left: vertexleft,
          top: vertextop,
          fill: (p['fill'] == 'background') || (p['fill'] == 'symbol') || (p['fill'] == 'border') ? BorderColorScheme[this.color][p['fill']] : p['fill'],
          objectCaching: false,
          strokeWidth: 0,
        })
      );
    });

    const GroupedBorder = new fabric.Group(baseGroup);
    GroupedBorder.vertex = shapeMeta.path.map(p => p.vertex).flat();

    return GroupedBorder;
  }
  // Show border dimensions when selected
  showDimensions() {
    // Clean up any existing dimension annotations
    this.hideDimensions();

    // Get border coordinates
    const borderRect = this.getBoundingRect();
    const frame = this.frame * this.xHeight / 4;

    // Find closest objects in each direction to show dimensions
    this.createDimensionAnnotations(borderRect);

    // Find closest objects in each direction to show dimensions
    this.createBorderDimensionAnnotations(borderRect, frame);

    // Show radius dimension for one corner
    this.createCornerRadiusDimension(borderRect);
  }

  // Override hideDimensions to handle both BorderDimensionDisplay and RadiusDimensionDisplay
  hideDimensions() {
    // Remove all dimension annotations from canvas
    this.dimensionAnnotations.forEach(annotation => {
      if (annotation.remove && typeof annotation.remove === 'function') {
        // For RadiusDimensionDisplay which has a remove method
        annotation.remove();
      } else if (annotation.objects && Array.isArray(annotation.objects)) {
        // For BorderDimensionDisplay which has objects array
        canvas.remove(...annotation.objects);
      }
    });
    this.dimensionAnnotations = [];
  }

  // Create dimension annotations for the border and contained objects
  createBorderDimensionAnnotations(borderRect, frame) {
    // Calculate inner content area of border (accounting for frame)
    const innerBorder = {
      left: borderRect.left + frame,
      top: borderRect.top + frame,
      right: borderRect.left + borderRect.width - frame,
      bottom: borderRect.top + borderRect.height - frame,
      width: borderRect.width - (2 * frame),
      height: borderRect.height - (2 * frame)
    };

    const frameDimension = new BorderDimensionDisplay({
      direction: 'vertical',
      startX: innerBorder.left + (innerBorder.width / 3),
      startY: innerBorder.top,
      endY: innerBorder.top - frame,
      color: 'red',
      offset: 30 / canvas.getZoom(),
      baseObject: this
    });
    this.dimensionAnnotations.push(frameDimension);

    // Create horizontal dimensions (left and right)
    if (this.widthObjects.length > 0) {
      // Find object closest to left border
      const leftObject = this.findClosestObject(this.widthObjects, 'left', innerBorder);
      if (leftObject) {
        const leftObjectRect = leftObject.getBoundingRect();
        // Create left dimension annotation
        const leftDimension = new BorderDimensionDisplay({
          direction: 'horizontal',
          startX: innerBorder.left,
          startY: leftObjectRect.top + (leftObjectRect.height / 2),
          endX: leftObjectRect.left,
          color: '#46C147',
          offset: 30 / canvas.getZoom(),
          baseObject: this
        });
        this.dimensionAnnotations.push(leftDimension);
      }

      // Find object closest to right border
      const rightObject = this.findClosestObject(this.widthObjects, 'right', innerBorder);
      if (rightObject) {
        const rightObjectRect = rightObject.getBoundingRect();
        // Create right dimension annotation
        const rightDimension = new BorderDimensionDisplay({
          direction: 'horizontal',
          startX: rightObjectRect.left + rightObjectRect.width,
          startY: rightObjectRect.top + (rightObjectRect.height / 2),
          endX: innerBorder.right,
          color: '#46C147',
          offset: 30 / canvas.getZoom(),
          baseObject: this
        });
        this.dimensionAnnotations.push(rightDimension);
      }
    }

    // Create vertical dimensions (top and bottom)
    if (this.heightObjects.length > 0) {
      // Find object closest to top border
      const topObject = this.findClosestObject(this.heightObjects, 'top', innerBorder);
      if (topObject) {
        const topObjectRect = topObject.getBoundingRect();
        // Create top dimension annotation
        const topDimension = new BorderDimensionDisplay({
          direction: 'vertical',
          startX: topObjectRect.left + (topObjectRect.width / 2),
          startY: innerBorder.top,
          endY: topObjectRect.top,
          color: 'red',
          offset: 30 / canvas.getZoom(),
          baseObject: this
        });
        this.dimensionAnnotations.push(topDimension);
      }

      // Find object closest to bottom border
      const bottomObject = this.findClosestObject(this.heightObjects, 'bottom', innerBorder);
      if (bottomObject) {
        const bottomObjectRect = bottomObject.getBoundingRect();
        // Create bottom dimension annotation
        const bottomDimension = new BorderDimensionDisplay({
          direction: 'vertical',
          startX: bottomObjectRect.left + (bottomObjectRect.width / 2),
          startY: bottomObjectRect.top + bottomObjectRect.height,
          endY: innerBorder.bottom,
          color: 'red',
          offset: 30 / canvas.getZoom(),
          baseObject: this
        });
        this.dimensionAnnotations.push(bottomDimension);
      }
    }
  }

  // Create radius dimension for one corner of the border
  createCornerRadiusDimension(borderRect) {
    // Get the border template to check for corner radius information
    const block = { width: borderRect.width, height: borderRect.height };
    const shapeMeta = BorderTypeScheme[this.borderType](this.xHeight, block, this.rounding);

    // Look for the first vertex with a radius property (typically top-left corner)
    let cornerRadius = null;
    let cornerVertex = null;

    if (shapeMeta && shapeMeta.path && shapeMeta.path.length > 0) {
      for (const path of shapeMeta.path) {
        if (path.vertex && path.vertex.length > 0) {
          for (const vertex of path.vertex) {
            if (vertex.radius && vertex.radius > 0) {
              cornerRadius = vertex.radius; // Convert to actual size
              cornerVertex = vertex;
              break;
            }
          }
          if (cornerRadius) break;
        }
      }
    }

    // If we found a corner with radius, create radius dimension
    if (cornerRadius && cornerRadius > 0) {
      // For most borders, the top-left corner would be at borderRect position
      // We'll show the radius dimension for the top-left corner
      const isFlagRight = this.borderType === 'flagRight';
      const centerX = borderRect.left + (isFlagRight ? cornerRadius : borderRect.width - cornerRadius);
      const centerY = borderRect.top + borderRect.height - cornerRadius;

      const radiusDimension = new RadiusDimensionDisplay({
        centerX: centerX,
        centerY: centerY,
        radius: cornerRadius,
        color: 'teal',
        startAngle: (isFlagRight ? 120 : 60)  // 45 degrees (pointing toward top-left from center)
      });

      this.dimensionAnnotations.push(radiusDimension);
    }
  }

  // Find the object closest to a border edge
  findClosestObject(objects, direction, innerBorder) {
    if (!objects || objects.length === 0) return null;

    let closestObject = null;
    let minDistance = Number.MAX_VALUE;

    objects.forEach(obj => {
      if (!obj.getBoundingRect) return;

      const objRect = obj.getBoundingRect();
      let distance = 0;

      switch (direction) {
        case 'top':
          distance = objRect.top - innerBorder.top;
          break;
        case 'bottom':
          distance = innerBorder.bottom - (objRect.top + objRect.height);
          break;
        case 'left':
          distance = objRect.left - innerBorder.left;
          break;
        case 'right':
          distance = innerBorder.right - (objRect.left + objRect.width);
          break;
      }

      // Only consider positive distances (objects inside the border)
      if (distance >= 0 && distance < minDistance) {
        minDistance = distance;
        closestObject = obj;
      }
    });

    return closestObject;
  }

  // Add mid points to divider
  addMidPointToDivider() {
    // Make sure bbox is updated - using existing code
    //this.updateBboxes();

    const bbox = this.inbbox;
    let i = 0;

    // First clear any existing mid points from previous calculations
    this.basePolygon.vertex = this.basePolygon.vertex.filter(v => !v.label || !v.label.startsWith('C'));

    // Loop through each compartment and add midpoints on each edge
    this.compartmentBboxes.forEach((compartment, index) => {
      // Calculate midpoints for each edge of the compartment
      const midX = (compartment.left + compartment.right) / 2;
      const midY = (compartment.top + compartment.bottom) / 2;

      // Add midpoint on top edge
      if (compartment.top == bbox.top) {
        this.basePolygon.vertex.push({ x: midX, y: compartment.top, label: `C${i += 1}`, display: 1 });
      }

      // Add midpoint on right edge
      if (compartment.right == bbox.right) {
        this.basePolygon.vertex.push({ x: compartment.right, y: midY, label: `C${i += 1}`, display: 1 });
      }

      // Add midpoint on bottom edge
      if (compartment.bottom == bbox.bottom) {
        this.basePolygon.vertex.push({ x: midX, y: compartment.bottom, label: `C${i += 1}`, display: 1 });
      }

      // Add midpoint on left edge
      if (compartment.left == bbox.left) {
        this.basePolygon.vertex.push({ x: compartment.left, y: midY, label: `C${i += 1}`, display: 1 });
      }
    });
  }

  RoundingToDivider() {
    // No longer need sourceList parameter
    this.rounding.x /= (this.VDivider.length + 1) * 2;
    this.rounding.y /= (this.HDivider.length + 1) * 2;

    this.HDivider.forEach(h => {
      // Skip rounding if divider has fixed distance values
      if (h.fixedTopValue || h.fixedBottomValue) {
        return;
      }

      // Check if the target object is already being updated in the Y cycle
      const targetObj = h.lockYToPolygon.TargetObject;
      if (targetObj && h.functionalType == 'HDivider') {
        // Directly update anchor properties instead of removing and recreating
        if (h.lockYToPolygon && Object.keys(h.lockYToPolygon).length > 0) {
          // Update spacing value
          h.lockYToPolygon.spacingY = DividerMargin[h.functionalType]['top'] * h.xHeight / 4 + this.rounding.y;

          // Update object position
          const sourcePoint = h.lockYToPolygon.sourcePoint;
          const targetPoint = h.lockYToPolygon.targetPoint;

          // Calculate new position
          const sourceVertexY = targetObj.getBasePolygonVertex(targetPoint).y;
          const newY = sourceVertexY + h.lockYToPolygon.spacingY;
          const deltaY = newY - h.getBasePolygonVertex(sourcePoint).y;

          // Update object position and vertices
          h.set('top', h.top + deltaY);
          if (h.basePolygon && h.basePolygon.vertex) {
            h.basePolygon.vertex.forEach(v => {
              v.y += deltaY;
            });
          }
        }
      }

      // Check the next anchored object (assuming it's the one below)
      const nextAnchor = h.anchoredPolygon && h.anchoredPolygon.length > 0 ? h.anchoredPolygon[0] : null;
      if (nextAnchor) {
        // Directly update anchor properties instead of removing and recreating
        if (nextAnchor.lockYToPolygon && Object.keys(nextAnchor.lockYToPolygon).length > 0) {
          // Update spacing value
          nextAnchor.lockYToPolygon.spacingY = DividerMargin[h.functionalType]['bottom'] * h.xHeight / 4 + this.rounding.y;

          // Update object position
          const sourcePoint = nextAnchor.lockYToPolygon.sourcePoint;
          const targetPoint = nextAnchor.lockYToPolygon.targetPoint; // Target point on the *divider* (h)

          // Calculate new position based on the divider (h)
          const sourceVertexY = h.getBasePolygonVertex(targetPoint).y;
          const newY = sourceVertexY + nextAnchor.lockYToPolygon.spacingY;
          const deltaY = newY - nextAnchor.getBasePolygonVertex(sourcePoint).y;

          // Update object position and vertices
          nextAnchor.set('top', nextAnchor.top + deltaY);
          if (nextAnchor.basePolygon && nextAnchor.basePolygon.vertex) {
            nextAnchor.basePolygon.vertex.forEach(v => {
              v.y += deltaY;
            });
          }
          // Mark as updated in this cycle if part of an ongoing update
          if (!globalAnchorTree.updateInProgressY) {
            const updateOrderY = globalAnchorTree.getUpdateOrder('y', nextAnchor.canvasID);
            processUpdateCycle('y', nextAnchor, updateOrderY, null, deltaY);
          }
        }
      }
    });

    this.VDivider.forEach(v => {
      // Skip rounding if divider has fixed distance values
      if (v.fixedLeftValue || v.fixedRightValue) {
        return;
      }

      // Check if the target object is already being updated in the X cycle
      const targetObj = v.lockXToPolygon.TargetObject;
      if (targetObj && (v.functionalType == 'VDivider' || v.functionalType == 'VLane')) {
        // Directly update anchor properties instead of removing and recreating
        if (v.lockXToPolygon && Object.keys(v.lockXToPolygon).length > 0) {
          // Update spacing value
          v.lockXToPolygon.spacingX = DividerMargin[v.functionalType]['left'] * v.xHeight / 4 + this.rounding.x;

          // Update object position
          const sourcePoint = v.lockXToPolygon.sourcePoint;
          const targetPoint = v.lockXToPolygon.targetPoint;

          // Calculate new position
          const sourceVertexX = targetObj.getBasePolygonVertex(targetPoint).x;
          const newX = sourceVertexX + v.lockXToPolygon.spacingX;
          const deltaX = newX - v.getBasePolygonVertex(sourcePoint).x;

          // Update object position and vertices
          v.set('left', v.left + deltaX);
          if (v.basePolygon && v.basePolygon.vertex) {
            v.basePolygon.vertex.forEach(vertex => {
              vertex.x += deltaX;
            });
          }
        }
      }

      // Check the next anchored object (assuming it's the one to the right)
      const nextAnchor = v.anchoredPolygon && v.anchoredPolygon.length > 0 ? v.anchoredPolygon[0] : null;
      if (nextAnchor) {
        // Directly update anchor properties instead of removing and recreating
        if (nextAnchor.lockXToPolygon && Object.keys(nextAnchor.lockXToPolygon).length > 0) {
          // Update spacing value
          nextAnchor.lockXToPolygon.spacingX = DividerMargin[v.functionalType]['right'] * v.xHeight / 4 + this.rounding.x;

          // Update object position
          const sourcePoint = nextAnchor.lockXToPolygon.sourcePoint;
          const targetPoint = nextAnchor.lockXToPolygon.targetPoint; // Target point on the *divider* (v)

          // Calculate new position based on the divider (v)
          const sourceVertexX = v.getBasePolygonVertex(targetPoint).x;
          const newX = sourceVertexX + nextAnchor.lockXToPolygon.spacingX;
          const deltaX = newX - nextAnchor.getBasePolygonVertex(sourcePoint).x;

          // Update object position and vertices
          nextAnchor.set('left', nextAnchor.left + deltaX);
          if (nextAnchor.basePolygon && nextAnchor.basePolygon.vertex) {
            nextAnchor.basePolygon.vertex.forEach(vertex => {
              vertex.x += deltaX;
            });
          }
          // Mark as updated in this cycle if part of an ongoing update
          if (!globalAnchorTree.updateInProgressX) {
            const updateOrderX = globalAnchorTree.getUpdateOrder('x', nextAnchor.canvasID);
            processUpdateCycle('x', nextAnchor, updateOrderX, deltaX, null);
          }
        }
        // nextAnchor.rounded = { x: rounding.x, y: 0 } // This seems out of place, commenting out for now. Re-evaluate if needed.
      }
    });
  }

  // Helper method to update divider coordinates without triggering recursive updates
  updateDividerCoords(divider) {
    if (!divider.basePolygon || !divider.basePolygon.vertex) return;


    divider.updateAllCoord()
  }

  filterBorderObjects() {
    const [fheightObjects, fwidthObjects, VDivider, HDivider, bordered] = BorderUtilities.FilterDivider(this.heightObjects, this.widthObjects, this.VDivider, this.HDivider)
    this.widthObjects = fwidthObjects.filter(obj => obj.borderGroup == null);
    this.heightObjects = fheightObjects.filter(obj => obj.borderGroup == null);
    this.VDivider = VDivider
    this.HDivider = HDivider
  }

  calcfixedBboxes() {
    // Get the bounding box of the active selection for dynamic dimensions (content-driven)
    let coords = BorderUtilities.getBorderObjectCoords(this.heightObjects, this.widthObjects);

    // Debug: check for NaN values in initial coords
    if (isNaN(coords.left) || isNaN(coords.top) || isNaN(coords.right) || isNaN(coords.bottom)) {
      console.error('calcfixedBboxes: Initial coords contain NaN values:', coords);
      console.error('heightObjects:', this.heightObjects);
      console.error('widthObjects:', this.widthObjects);
      // Set default values to prevent further NaN propagation
      coords = { left: 0, top: 0, right: 100, bottom: 100 };
    }

    this.innerPadding = { x: 0, y: 0 };

    // Apply inner padding
    //coords.left -= this.innerPadding.x / (this.VDivider.length + 1) / 2;
    //coords.right += this.innerPadding.x / (this.VDivider.length + 1) / 2;
    //coords.top -= this.innerPadding.y / (this.HDivider.length + 1) / 2;
    //coords.bottom += this.innerPadding.y / (this.HDivider.length + 1) / 2;

    // Determine if width and height are fixed
    const hasFixedWidth = !isNaN(parseInt(this.fixedWidth));
    const hasFixedHeight = !isNaN(parseInt(this.fixedHeight));

    // Handle width calculation
    if (hasFixedWidth) {
      const leftPadding = (this.frame + this.defaultPadding.left) * this.xHeight / 4;
      const rightPadding = (this.frame + this.defaultPadding.right) * this.xHeight / 4;
      if (!this.fixedWidthCoords) {
        // Calculate fixed width coordinates only during initialization or if not cached
        if (this.widthObjects.length === 0) {
          const borderCoords = canvas.calcViewportBoundaries();

          if (!borderCoords || !borderCoords.tl || !borderCoords.br) {
            console.error('calcfixedBboxes: Invalid borderCoords:', borderCoords);
          } else {
            const centerX = (borderCoords.tl.x + borderCoords.br.x) / 2;

            this.fixedWidthCoords = {
              left: centerX - parseInt(this.fixedWidth) / 2 + leftPadding,
              right: centerX + parseInt(this.fixedWidth) / 2 - rightPadding
            };

          }
        } else {
          // If there are widthObjects, center the fixed width around their midpoint
          const midX = (coords.left + coords.right) / 2;
          this.fixedWidthCoords = {
            left: midX - parseInt(this.fixedWidth) / 2 + leftPadding,
            right: midX + parseInt(this.fixedWidth) / 2 - rightPadding
          };
        }
      } else {
        // For non-initialization calls, ensure coords are updated to current fixed values
        this.fixedWidthCoords.left = this.left + leftPadding;
        this.fixedWidthCoords.right = this.left + this.fixedWidth - rightPadding;

      }

      // Use cached fixed width coordinates
      if (this.fixedWidthCoords) {
        coords.left = this.fixedWidthCoords.left;
        coords.right = this.fixedWidthCoords.right;
      }
    }
    // If width is not fixed, use the calculated dynamic coordinates (already set above)

    // Handle height calculation
    if (hasFixedHeight) {
      const topPadding = (this.frame + this.defaultPadding.top) * this.xHeight / 4;
      const bottomPadding = (this.frame + this.defaultPadding.bottom) * this.xHeight / 4;

      if (!this.fixedHeightCoords) {
        // Calculate fixed height coordinates only during initialization or if not cached
        if (this.heightObjects.length === 0) {
          const borderCoords = canvas.calcViewportBoundaries();

          if (!borderCoords || !borderCoords.tl || !borderCoords.br) {
            console.error('calcfixedBboxes: Invalid borderCoords:', borderCoords);
          } else {
            const centerY = (borderCoords.tl.y + borderCoords.br.y) / 2;

            this.fixedHeightCoords = {
              top: centerY - parseInt(this.fixedHeight) / 2 + topPadding,
              bottom: centerY + parseInt(this.fixedHeight) / 2 - bottomPadding
            };

          }
        } else {
          // If there are heightObjects, center the fixed height around their midpoint
          const midY = (coords.top + coords.bottom) / 2;
          this.fixedHeightCoords = {
            top: midY - parseInt(this.fixedHeight) / 2 + topPadding,
            bottom: midY + parseInt(this.fixedHeight) / 2 - bottomPadding
          };
        }
      } else {
        // For non-initialization calls, ensure coords are updated to current fixed values
        this.fixedHeightCoords.top = this.top + topPadding;
        this.fixedHeightCoords.bottom = this.top + this.fixedHeight - bottomPadding;

      }


      // Use cached fixed height coordinates
      if (this.fixedHeightCoords) {
        coords.top = this.fixedHeightCoords.top;
        coords.bottom = this.fixedHeightCoords.bottom;
      }
    }
    // If height is not fixed, use the calculated dynamic coordinates (already set above)

    // Final check for NaN values before setting
    if (isNaN(coords.left) || isNaN(coords.top) || isNaN(coords.right) || isNaN(coords.bottom)) {
      console.error('calcfixedBboxes: Final coords contain NaN values:', coords);
      // Set default values to prevent further issues
      coords = { left: 0, top: 0, right: 100, bottom: 100 };
    }

    this.inbbox = coords;
  }

  // Update the bbox property and compartmentBboxes array
  updateBboxes() {
    const borderSize = this.getBoundingRect();
    const frame = 1.5 * this.xHeight / 4;

    // Calculate main bbox (inner area of the border)
    this.inbbox = {
      left: borderSize.left + frame,
      top: borderSize.top + frame,
      right: borderSize.left + borderSize.width - frame,
      bottom: borderSize.top + borderSize.height - frame,
      width: borderSize.width - (2 * frame),
      height: borderSize.height - (2 * frame)
    };

    if (this.fixedHeight !== null) {
      const topPadding = (this.frame + this.defaultPadding.top) * this.xHeight / 4;
      const bottomPadding = (this.frame + this.defaultPadding.bottom) * this.xHeight / 4;
      this.fixedHeightCoords.top = this.top + topPadding;
      this.fixedHeightCoords.bottom = this.top + this.fixedHeight - bottomPadding;
    }

    if (this.fixedWidth !== null) {
      const leftPadding = (this.frame + this.defaultPadding.left) * this.xHeight / 4;
      const rightPadding = (this.frame + this.defaultPadding.right) * this.xHeight / 4;
      this.fixedWidthCoords.left = this.left + leftPadding;
      this.fixedWidthCoords.right = this.left + this.fixedWidth - rightPadding;
    }

    // Reset compartment bboxes
    this.compartmentBboxes = [];

    // If there are no dividers, the entire inner area is one compartment
    if (this.VDivider.length === 0 && this.HDivider.length === 0) {
      this.compartmentBboxes.push({ ...this.inbbox });
      return;
    }

    // Calculate compartments based on dividers
    this.calculateCompartments();
  }

  // Calculate compartments created by dividers
  calculateCompartments() {
    // Get sorted dividers
    const sortedVDividers = this.VDivider.length > 0 ?
      [...this.VDivider].sort((a, b) => (a.getEffectiveCoords()[0].x + a.width / 2) - (b.getEffectiveCoords()[0].x + b.width / 2)) :
      [];

    const sortedHDividers = this.HDivider.length > 0 ?
      [...this.HDivider].sort((a, b) => (a.getEffectiveCoords()[0].y + a.height / 2) - (b.getEffectiveCoords()[0].y + b.height / 2)) :
      [];

    // Get divider positions, only considering them as position points, not actual width
    const xPositions = [this.inbbox.left];
    const yPositions = [this.inbbox.top];

    // Add all vertical divider center positions
    for (const vd of sortedVDividers) {
      const leftX = vd.getEffectiveCoords()[0].x; // top-left x
      const centerX = leftX + vd.width / 2;
      xPositions.push(centerX);
    }
    xPositions.push(this.inbbox.right);

    // Add all horizontal divider center positions
    for (const hd of sortedHDividers) {
      const topY = hd.getEffectiveCoords()[0].y; // top-left y
      const centerY = topY + hd.height / 2;
      yPositions.push(centerY);
    }
    yPositions.push(this.inbbox.bottom);

    // Create compartment bboxes based on divider positions
    for (let i = 0; i < xPositions.length - 1; i++) {
      for (let j = 0; j < yPositions.length - 1; j++) {
        // Get the adjacent dividers to calculate adjusted compartment boundaries
        const leftDivider = i > 0 ? sortedVDividers[i - 1] : null;
        const rightDivider = i < sortedVDividers.length ? sortedVDividers[i] : null;
        const topDivider = j > 0 ? sortedHDividers[j - 1] : null;
        const bottomDivider = j < sortedHDividers.length ? sortedHDividers[j] : null;

        // Get base positions
        let left = xPositions[i];
        let top = yPositions[j];
        let right = xPositions[i + 1];
        let bottom = yPositions[j + 1];

        // Adjust boundaries using half divider thickness if shadowWidth provided (centerline scheme)
        if (rightDivider && rightDivider.shadowWidth) {
          const shadowX = rightDivider.shadowWidth.x * rightDivider.xHeight / 4;
          right += shadowX / 2; // extend to include half of right divider's shadow influence
        }
        if (leftDivider && leftDivider.shadowWidth) {
          const shadowX = leftDivider.shadowWidth.x * leftDivider.xHeight / 4;
          left -= shadowX / 2; // retract to include half of left divider's shadow influence
        }
        if (bottomDivider && bottomDivider.shadowWidth) {
          const shadowY = bottomDivider.shadowWidth.y * bottomDivider.xHeight / 4;
          bottom += shadowY / 2;
        }
        if (topDivider && topDivider.shadowWidth) {
          const shadowY = topDivider.shadowWidth.y * topDivider.xHeight / 4;
          top -= shadowY / 2;
        }

        // Add the compartment with adjusted dimensions
        this.compartmentBboxes.push({
          left,
          top,
          right,
          bottom,
          width: right - left,
          height: bottom - top,
          index: this.compartmentBboxes.length
        });
      }
    }
  }

  // Assign width / position to dividers using border inner bbox only
  assignWidthToDivider() {
    this.isUpdating = true;
    // Always rebuild bboxes and compartments first
    this.updateBboxes();

    // Vertical dividers
    for (const d of this.VDivider) {
      const initialLeft = d.getEffectiveCoords()[0].x;
      const res = drawDivider(
        d.xHeight,
        d.color,
        { left: d.left - DividerMargin[d.functionalType].left * d.xHeight / 4, top: d.top },
        this.inbbox,
        d.functionalType
      );
      d.replaceBasePolygon(res, false);
      d.set({
        top: this.inbbox.bottom - d.height - DividerMargin[d.functionalType]['bottom'] * d.xHeight / 4,
      });
      const minLeft = this.inbbox.left + (this.frame) * d.xHeight / 4;
      const maxLeft = this.inbbox.right - (this.frame) * d.xHeight / 4 - d.width;
      const clampedLeft = maxLeft >= minLeft ? Math.min(Math.max(initialLeft, minLeft), maxLeft) : minLeft;
      d.set({ left: clampedLeft });
      d.lockMovementY = true;
    }

    // Horizontal dividers
    for (const d of this.HDivider) {
      if (d.functionalType !== 'HLine') {
        const initialTop = d.getEffectiveCoords()[0].y;
        const res = drawDivider(
          d.xHeight,
          d.color,
          { left: d.left, top: d.top - DividerMargin[d.functionalType].top * d.xHeight / 4 },
          this.inbbox,
          d.functionalType
        );
        d.replaceBasePolygon(res, false);
        d.set({
          left: this.inbbox.left + DividerMargin[d.functionalType]['left'] * d.xHeight / 4
        });
        const minTop = this.inbbox.top + (this.frame) * d.xHeight / 4;
        const maxTop = this.inbbox.bottom - (this.frame) * d.xHeight / 4 - d.height;
        const clampedTop = maxTop >= minTop ? Math.min(Math.max(initialTop, minTop), maxTop) : minTop;
        d.set({ top: clampedTop });
        d.lockMovementX = true;
      }
    }

    // Refresh compartments & midpoints after reposition
    this.updateBboxes();
    this.assignWidthToUnderline();
    this.addMidPointToDivider();
    this.drawVertex();
    this.isUpdating = false;
  }

  assignWidthToUnderline() {
    // Collect unique text objects that have an underline DividerObject attached
    const underlineObjects = new Set();
    this.HDivider.forEach(obj => {
      if (obj.functionalType === 'HLine') underlineObjects.add(obj);
    });


    // Helper to get left/right X from an object's effective coords
    const getLeftRightX = (obj) => {
      const coords = obj.getEffectiveCoords();
      const xs = [coords[0].x, coords[1].x, coords[2].x, coords[3].x];
      return { left: Math.min(...xs), right: Math.max(...xs) };
    };

    // Only consider actual vertical dividers for boundaries
    const verticalDividers = (this.VDivider || []).filter(d => d.functionalType === 'VDivider');

    underlineObjects.forEach(underline => {

      // One stroke width in canvas units (length = xHeight/4)
      const stroke = underline.xHeight / 4;
      const initialTop = underline.getEffectiveCoords()[0].y;

      // Determine the search reference from the text's bounds
      const { left: textLeft, right: textRight } = getLeftRightX(underline.textObject);

      // Find nearest left/right VDivider in a single pass
      let leftBoundary = this.inbbox.left;
      let rightBoundary = this.inbbox.right;
      let maxRightEdgeLeftOfText = -Infinity;
      let minLeftEdgeRightOfText = Infinity;
      verticalDividers.forEach(vd => {
        const vdCoords = vd.getEffectiveCoords();
        const vdLeft = Math.min(vdCoords[0].x, vdCoords[1].x, vdCoords[2].x, vdCoords[3].x);
        const vdRight = Math.max(vdCoords[0].x, vdCoords[1].x, vdCoords[2].x, vdCoords[3].x);

        // Consider margins when determining adjacency
        const rightMargin = DividerMargin[vd.functionalType].right * vd.xHeight / 4;
        const leftMargin = DividerMargin[vd.functionalType].left * vd.xHeight / 4;

        // Candidate for left boundary: nearest right edge to the left of text
        if (vdRight - rightMargin <= textLeft && vdRight - rightMargin > maxRightEdgeLeftOfText) {
          maxRightEdgeLeftOfText = vdRight - rightMargin;
        }

        // Candidate for right boundary: nearest left edge to the right of text
        if (vdLeft + leftMargin >= textRight && vdLeft + leftMargin < minLeftEdgeRightOfText) {
          minLeftEdgeRightOfText = vdLeft + leftMargin;
        }
      });
      if (maxRightEdgeLeftOfText !== -Infinity) leftBoundary = maxRightEdgeLeftOfText;
      if (minLeftEdgeRightOfText !== Infinity) rightBoundary = minLeftEdgeRightOfText;

      // Inset by one stroke width from both boundaries
      const targetLeft = leftBoundary;
      const targetRight = rightBoundary;
      const targetWidth = Math.max(0, targetRight - targetLeft);

      // Redraw and position the underline to span the computed width
      const res = drawDivider(
        underline.xHeight,
        underline.color,
        { left: targetLeft, top: initialTop - stroke },
        { width: targetWidth, height: stroke },
        'HLine'
      );
      underline.replaceBasePolygon(res, false);
      //underline.set({ left: targetLeft + 1.5 * stroke,  });
      underline.drawVertex(false)
      underline.setCoords();
    });

  }

  // Optimized method to process border resize without causing infinite loops
  processResize() {
    const BG = this;
    const prevInbbox = this.inbbox ? { left: this.inbbox.left, top: this.inbbox.top, right: this.inbbox.right, bottom: this.inbbox.bottom } : null;
    // Compute potential new bbox first
    this.calcfixedBboxes(false);
    const newInbbox = this.inbbox;
    const noChange = prevInbbox &&
      prevInbbox.left === newInbbox.left &&
      prevInbbox.top === newInbbox.top &&
      prevInbbox.right === newInbbox.right &&
      prevInbbox.bottom === newInbbox.bottom;
    if (noChange) {
      return; // Skip expensive resize if dimensions unchanged
    }

    BG.removeAll();
    this.rounding = BorderUtilities.calcBorderRounding(this.borderType, this.xHeight, this.inbbox);
    const borderObject = this.drawBorder();
    BG.add(borderObject);
    BG.basePolygon = borderObject;
    BG.assignWidthToDivider();
    let startedXCycle = false;
    let startedYCycle = false;
    try {
      if (!globalAnchorTree.updateInProgressX) { globalAnchorTree.startUpdateCycle('x', BG.canvasID); startedXCycle = true; }
      if (!globalAnchorTree.updateInProgressY) { globalAnchorTree.startUpdateCycle('y', BG.canvasID); startedYCycle = true; }
      BG.updateAllCoord(null, [], false);
      BG.drawVertex();
    } finally {
      if (startedXCycle) globalAnchorTree.endUpdateCycle('x');
      if (startedYCycle) globalAnchorTree.endUpdateCycle('y');
    }
    BG.refTopLeft = { top: BG.basePolygon.getCoords()[0].y, left: BG.basePolygon.getCoords()[0].x };
    CanvasGlobals.scheduleRender();
  }

  // Override updateAllCoord - need to make sure trees are updated correctly
  updateAllCoord(event, _sourceList = [], _selfOnly = false) {
    // Call parent implementation first
    super.updateAllCoord(event, _sourceList, _selfOnly);
    this.updateBboxes();

    // Mark that a border update is in progress
    this.isUpdating = true;

    try {
      // Only process groups that we own (for multi-box borders)
      if (this.compartmentBboxes && this.compartmentBboxes.length > 0) {

        // First handle horizontal dividers
        if (this.HDivider && this.HDivider.length > 0) {
          // Start an X update cycle for this object's ID
          globalAnchorTree.startUpdateCycle('x', this.canvasID);

          // Update each divider
          this.HDivider.forEach(divider => {
            // Mark divider as updated in X axis to prevent cycles
            globalAnchorTree.updatedObjectsX.add(divider.canvasID);

            // Update divider position and coordinates
            divider.set('left', divider.left);
            divider.setCoords();
            divider.updateAllCoord(null, [this]);
          });

          // End the X update cycle
          globalAnchorTree.endUpdateCycle('x');
        }

        // Then handle vertical dividers
        if (this.VDivider && this.VDivider.length > 0) {
          // Start a Y update cycle for this object's ID
          globalAnchorTree.startUpdateCycle('y', this.canvasID);

          // Update each divider
          this.VDivider.forEach(divider => {
            // Mark divider as updated in Y axis to prevent cycles
            globalAnchorTree.updatedObjectsY.add(divider.canvasID);

            // Update divider position and coordinates
            divider.set('top', divider.top);
            divider.setCoords();
            divider.updateAllCoord(null, [this]);
          });

          // End the Y update cycle
          globalAnchorTree.endUpdateCycle('y');
        }
      }
    } finally {
      // Always mark that the update is complete
      this.isUpdating = false;
    }
  }

}




export { BorderUtilities, BorderGroup }


