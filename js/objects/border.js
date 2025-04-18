import { BaseGroup, BorderDimensionDisplay } from './draw.js';
import { globalAnchorTree,anchorShape } from './anchor.js';
import { BorderTypeScheme, BorderColorScheme, BorderFrameWdith, DividerMargin } from './template.js';
import { vertexToPath } from './path.js';
import { CanvasGlobals } from '../canvas.js';
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

  FilterDivider: function (heightObjects, widthObjects) {
    let HDividerObject = []
    let VDividerObject = []
    let borderedObjects = []
    let fwidthObjects = widthObjects.filter(obj => {
      if (obj.functionalType == 'HDivider' || obj.functionalType == 'HLine') {
        HDividerObject.push(obj);
        return false; // Remove the object from original array
      }
      else if (obj.borderGroup) {
        borderedObjects.push(obj);
        return false; // Prevent nested border update
      }
      return true; // Keep the object in original array
    });

    let fheightObjects = heightObjects.filter(obj => {
      if (obj.functionalType == 'VDivider' || obj.functionalType == 'VLane') {
        VDividerObject.push(obj);
        return false; // Remove the object from original array
      } else if (obj.borderGroup) {
        borderedObjects.push(obj);
        return false; // Prevent nested border update
      }
      return true; // Keep the object in original array
    });
    return [fheightObjects, fwidthObjects, VDividerObject, HDividerObject, borderedObjects]
  },

  RoundingToDivider: function (HDividers, VDividers, rounding, sourceList = []) {
    rounding.x /= (VDividers.length + 1) * 2
    rounding.y /= (HDividers.length + 1) * 2
    HDividers.forEach(h => {
      // Skip rounding if divider has fixed distance values
      if (h.fixedTopValue || h.fixedBottomValue) {
        return;
      }

      if (!sourceList.includes(h.lockYToPolygon.TargetObject) && h.functionalType == 'HDivider') {
        // Directly update anchor properties instead of removing and recreating
        if (h.lockYToPolygon && Object.keys(h.lockYToPolygon).length > 0) {
          // Update spacing value
          h.lockYToPolygon.spacingY = DividerMargin[h.functionalType]['top'] * h.xHeight / 4 + rounding.y;

          // Update object position
          const targetObj = h.lockYToPolygon.TargetObject;
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

      const nextAnchor = h.anchoredPolygon[0];
      if (!sourceList.includes(nextAnchor)) {
        // Directly update anchor properties instead of removing and recreating
        if (nextAnchor.lockYToPolygon && Object.keys(nextAnchor.lockYToPolygon).length > 0) {
          // Update spacing value
          nextAnchor.lockYToPolygon.spacingY = DividerMargin[h.functionalType]['bottom'] * h.xHeight / 4 + rounding.y;

          // Update object position
          const sourcePoint = nextAnchor.lockYToPolygon.sourcePoint;
          const targetPoint = nextAnchor.lockYToPolygon.targetPoint;

          // Calculate new position
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
        }
      }
    })

    VDividers.forEach(v => {
      // Skip rounding if divider has fixed distance values
      if (v.fixedLeftValue || v.fixedRightValue) {
        return;
      }

      if (!sourceList.includes(v.lockXToPolygon.TargetObject) && v.functionalType == 'VDivider') {
        // Directly update anchor properties instead of removing and recreating
        if (v.lockXToPolygon && Object.keys(v.lockXToPolygon).length > 0) {
          // Update spacing value
          v.lockXToPolygon.spacingX = DividerMargin[v.functionalType]['left'] * v.xHeight / 4 + rounding.x;

          // Update object position
          const targetObj = v.lockXToPolygon.TargetObject;
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

      const nextAnchor = v.anchoredPolygon[0];
      if (!sourceList.includes(nextAnchor)) {
        // Directly update anchor properties instead of removing and recreating
        if (nextAnchor.lockXToPolygon && Object.keys(nextAnchor.lockXToPolygon).length > 0) {
          // Update spacing value
          nextAnchor.lockXToPolygon.spacingX = DividerMargin[v.functionalType]['right'] * v.xHeight / 4 + rounding.x;

          // Update object position
          const sourcePoint = nextAnchor.lockXToPolygon.sourcePoint;
          const targetPoint = nextAnchor.lockXToPolygon.targetPoint;

          // Calculate new position
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
        }
        nextAnchor.rounded = { x: rounding.x, y: 0 }
      }
    })
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

    const [fheightObjects, fwidthObjects, VDivider, HDivider, bordered] = BorderUtilities.FilterDivider(heightObjects, widthObjects)

    // Get the bounding box of the active selection 
    let coords = BorderUtilities.getBorderObjectCoords(fheightObjects, fwidthObjects)

    // handle roundings on borders and dividers
    let rounding = BorderUtilities.calcBorderRounding(borderType, xHeight, coords)
    if (!isNaN(parseInt(widthText))) {
      const padding = parseInt(widthText) - coords.right + coords.left
      rounding.x += padding
    }
    if (!isNaN(parseInt(heightText))) {
      const padding = parseInt(heightText) - coords.bottom + coords.top
      rounding.y += padding
    }
    BorderUtilities.RoundingToDivider(HDivider, VDivider, rounding)
    coords = BorderUtilities.getBorderObjectCoords(fheightObjects, fwidthObjects)

    try {
      const BaseBorder = drawLabeledBorder(borderType, xHeight, coords, colorType)

      // Use the new BorderGroup class instead of BaseGroup
      const borderGroup = new BorderGroup(BaseBorder, borderType, {
        widthObjects: [...fwidthObjects],
        heightObjects: [...fheightObjects],
        fixedWidth: widthText,
        fixedHeight: heightText,
        VDivider: VDivider,
        HDivider: HDivider,
        xHeight: xHeight,
        color: colorType,
        frame: BorderFrameWdith[borderType],
      });


      // Add mid points and assign widths to dividers
      borderGroup.assignWidthToDivider(); // Ensure this await is always present
      //borderGroup.addMidPointToDivider();


      // Send border to back and update object references
      canvas.sendObjectToBack(borderGroup);

      // Update border reference in width objects
      fwidthObjects.forEach(obj => {
        obj.borderGroup = borderGroup;
      });

      // Update border reference in height objects
      fheightObjects.forEach(obj => {
        obj.borderGroup = borderGroup;
      });

      canvas.renderAll();
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
class BorderGroup extends BaseGroup {  constructor(baseBorder, borderType, options = {}) {
    // Call the parent constructor with the base border and 'Border' functional type
    super(baseBorder, 'Border', options);

    // Initialize border-specific properties
    this.widthObjects = options.widthObjects || [];
    this.heightObjects = options.heightObjects || [];
    this.fixedWidth = options.fixedWidth;
    this.fixedHeight = options.fixedHeight;
    this.VDivider = options.VDivider || [];
    this.HDivider = options.HDivider || [];
    this.borderType = borderType;
    this.xHeight = options.xHeight || 100;
    this.color = options.color;
    this.dimensionAnnotations = [];
    this.frame = options.frame || 0; // Frame width for the border
    this.bbox = null; // Main border bounding box
    this.compartmentBboxes = []; // Array of compartment bounding boxes
    
    // Add status flag to track border updates
    this.isUpdating = false; // Flag to track if the border is currently being updated

    // Lock movement for border
    this.lockMovementX = true;
    this.lockMovementY = true;

    // Calculate initial bbox
    this.updateBboxes();
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
          color: 'green',
          offset: 30 / canvas.getZoom()
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
          color: 'green',
          offset: 30 / canvas.getZoom()
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
          offset: 30 / canvas.getZoom()
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
          offset: 30 / canvas.getZoom()
        });
        this.dimensionAnnotations.push(bottomDimension);
      }
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

    const bbox = this.bbox;
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
        this.basePolygon.vertex.push({ x: midX, y: compartment.top, label: `C${i += 1}` });
      }

      // Add midpoint on right edge
      if (compartment.right == bbox.right) {
        this.basePolygon.vertex.push({ x: compartment.right, y: midY, label: `C${i += 1}` });
      }

      // Add midpoint on bottom edge
      if (compartment.bottom == bbox.bottom) {
        this.basePolygon.vertex.push({ x: midX, y: compartment.bottom, label: `C${i += 1}` });
      }

      // Add midpoint on left edge
      if (compartment.left == bbox.left) {
        this.basePolygon.vertex.push({ x: compartment.left, y: midY, label: `C${i += 1}` });
      }
    });
  }
  // Assign width to divider
  assignWidthToDivider(sourceList = []) {
    // Set the updating flag to indicate border is being updated
    this.isUpdating = true;
    
    // Update bboxes first to ensure we have current border and compartment information
    this.updateBboxes();

    // Use the bbox property instead of recalculating it
    const borderSize = this.getBoundingRect();
    const frame = 1.5 * this.xHeight / 4;


    // Track which objects are updated to prevent recursive operations
    const updatedObjects = new Set();
    if (globalAnchorTree.updateInProgress) {
      sourceList = sourceList || [];
      updatedObjects.add(this.canvasID);
    }

    // Handle VDividers
    for (const d of this.VDivider) {
      // Skip if already updated in this cycle
      if (updatedObjects.has(d.canvasID)) continue;
      updatedObjects.add(d.canvasID);
      
      // Store initial positions
      const initialLeft = d.getEffectiveCoords()[0].x;
      const initialTop = d.top;
      const needsUpdate = !d.bbox || d.top !== this.bbox.top || d.height !== this.bbox.height;
      
      // Check if divider has fixed distance values
      if (d.fixedLeftValue || d.fixedRightValue) {

        if (needsUpdate) {
          // Redraw the divider with the border's dimensions
          const res = drawDivider(d.xHeight, d.color, { left: d.left, top: d.top }, this.bbox, d.functionalType);
          d.replaceBasePolygon(res);

          // Position divider vertically same as before
          d.set({ top: this.bbox.bottom - d.height - DividerMargin[d.functionalType]['bottom'] * d.xHeight / 4, });

          // For fixed values, anchor to the border instead of objects
          // Priority: use the right value if both are specified
          if (d.fixedRightValue !== undefined) {
            // Anchor to right of border
            d.set({ 
              left: borderSize.left + borderSize.width - frame - d.fixedRightValue - 
                    DividerMargin[d.functionalType]['right'] * d.xHeight / 4 
            });

            // Remove any existing anchoring but don't trigger further updates
            if (d.lockXToPolygon && Object.keys(d.lockXToPolygon).length > 0) {
              removeAnchor(d.lockXToPolygon.TargetObject, d);

            }
          } else if (d.fixedLeftValue !== undefined) {
            // Anchor to left of border
            d.set({ 
              left: borderSize.left + frame + d.fixedLeftValue + 
                    DividerMargin[d.functionalType]['left'] * d.xHeight / 4 
            });
          }

          // Update positions without triggering further updates
          this.updateAllCoord();
        }
      } else if (needsUpdate) {
        // Regular object-anchored divider
        const res = drawDivider(d.xHeight, d.color, { left: d.left, top: d.top }, this.bbox, d.functionalType);
        d.replaceBasePolygon(res);
        
        d.set({
          top: this.bbox.bottom - d.height - DividerMargin[d.functionalType]['bottom'] * d.xHeight / 4,
          left: initialLeft
        });
        
        // Update positions without triggering further updates
        this.updateAllCoord();

      }
    }

    // Handle HDividers
    for (const d of this.HDivider) {
      // Skip if already updated in this cycle
      if (updatedObjects.has(d.canvasID)) continue;
      updatedObjects.add(d.canvasID);
      
      // Store initial position
      const initialTop = d.getEffectiveCoords()[0].y;
      const initialLeft = d.left;
      const needsUpdate = !d.bbox || d.left !== this.bbox.left || d.width !== this.bbox.width;
      
      // Check if divider has fixed distance values
      if (d.fixedTopValue || d.fixedBottomValue) {

        if (needsUpdate) {
          // Redraw the divider with the border's dimensions
          const res = drawDivider(
            d.xHeight, 
            d.color, 
            { 
              left: d.left, 
              top: d.top - DividerMargin[d.functionalType].top * d.xHeight / 4 
            }, 
            this.bbox, 
            d.functionalType
          );
          d.replaceBasePolygon(res);

          // Position divider horizontally same as before
          d.set({ left: this.bbox.left + DividerMargin[d.functionalType]['left'] * d.xHeight / 4 });

          // For fixed values, anchor to the border instead of objects
          if (d.fixedBottomValue !== undefined) {
            // Anchor to bottom of border
            d.set({ 
              top: borderSize.top + borderSize.height - frame - d.fixedBottomValue - 
                  DividerMargin[d.functionalType]['bottom'] * d.xHeight / 4 
            });

            // Remove any existing anchoring but don't trigger cascading updates
            if (d.lockYToPolygon && Object.keys(d.lockYToPolygon).length > 0) {
              removeAnchor(d.lockYToPolygon.TargetObject, d);
            }
          } else if (d.fixedTopValue !== undefined) {
            // Anchor to top of border
            d.set({ 
              top: borderSize.top + frame + d.fixedTopValue + 
                  DividerMargin[d.functionalType]['top'] * d.xHeight / 4 
            });
          }
          
          // Update positions without triggering further updates
          this.updateDividerCoords(d);
        }
      } else if (needsUpdate) {

        // For HLine dividers, check if there are vertical dividers and calculate the correct cell
        if (d.functionalType === 'HLine' && this.compartmentBboxes.length > 1) {
          // Find the compartment that contains the HLine's horizontal position
          const hLinePosition = d.left + (d.width / 2);
          const hLineVerticalPosition = d.top;

          // Find the appropriate compartment
          const matchingCompartments = this.compartmentBboxes.filter(cmp =>
            hLinePosition >= cmp.left &&
            hLinePosition <= cmp.right
          );

          if (matchingCompartments.length > 0) {

            const cellBbox = matchingCompartments[0];

            // Draw the HLine with the cell-specific bbox
            const res = drawDivider(
              d.xHeight,
              d.color,
              { 
                left: cellBbox.left, 
                top: d.top - DividerMargin[d.functionalType].top * d.xHeight / 4 
              },
              cellBbox,
              d.functionalType
            );
            d.replaceBasePolygon(res);


          } else {

            // No matching compartment found, use the border's bbox
            const res =  drawDivider(
              d.xHeight, 
              d.color, 
              { 
                left: d.left, 
                top: d.top - DividerMargin[d.functionalType].top * d.xHeight / 4 
              }, 
              this.bbox, 
              d.functionalType
            );

            d.replaceBasePolygon(res);
            d.set({ 
              top: initialTop, 
              left: this.bbox.left + DividerMargin[d.functionalType]['left'] * d.xHeight / 4 
            });
          }

        } else {
          // Regular HDivider or HLine without VDividers
          const res =  drawDivider(
            d.xHeight, 
            d.color, 
            { 
              left: d.left, 
              top: d.top - DividerMargin[d.functionalType].top * d.xHeight / 4 
            }, 
            this.bbox, 
            d.functionalType
          );
          d.replaceBasePolygon(res);
          d.set({ 
            top: initialTop, 
            left: this.bbox.left + DividerMargin[d.functionalType]['left'] * d.xHeight / 4 
          });

        }
        
        // Update positions without triggering further updates
        this.updateDividerCoords(d);
      }
    }

    // After all dividers are repositioned, update the bboxes again
    this.updateBboxes();    // Update mid points
    this.addMidPointToDivider();

    this.drawVertex();
    
    // Clear the updating flag to indicate border update is complete
    this.isUpdating = false;
  }
  
  // Helper method to update divider coordinates without triggering recursive updates
  updateDividerCoords(divider) {
    if (!divider.basePolygon || !divider.basePolygon.vertex) return;
    
    // Update reference points
    divider.setCoords();
    divider.refTopLeft = {
      top: divider.basePolygon.getCoords()[0].y,
      left: divider.basePolygon.getCoords()[0].x
    };
    
    // Update position status for change detection
    divider.position = {
      top: divider.top,
      left: divider.left
    };
    
    divider.bbox = {
      width: divider.width,
      height: divider.height
    };
    
    // Mark as updated in the anchor tree if it's active
    if (globalAnchorTree.updateInProgressX) {
      globalAnchorTree.updatedObjectsX.add(divider.canvasID);
    }
    
    if (globalAnchorTree.updateInProgressY) {
      globalAnchorTree.updatedObjectsY.add(divider.canvasID);
    }
  }

  // Update the bbox property and compartmentBboxes array
  updateBboxes() {
    const borderSize = this.getBoundingRect();
    const frame = 1.5 * this.xHeight / 4;

    // Calculate main bbox (inner area of the border)
    this.bbox = {
      left: borderSize.left + frame,
      top: borderSize.top + frame,
      right: borderSize.left + borderSize.width - frame,
      bottom: borderSize.top + borderSize.height - frame,
      width: borderSize.width - (2 * frame),
      height: borderSize.height - (2 * frame)
    };

    // Reset compartment bboxes
    this.compartmentBboxes = [];

    // If there are no dividers, the entire inner area is one compartment
    if (this.VDivider.length === 0 && this.HDivider.length === 0) {
      this.compartmentBboxes.push({ ...this.bbox });
      return;
    }

    // Calculate compartments based on dividers
    this.calculateCompartments();
  }

  // Calculate compartments created by dividers
  calculateCompartments() {
    // Get sorted dividers
    const sortedVDividers = this.VDivider.length > 0 ?
      [...this.VDivider].sort((a, b) => a.getEffectiveCoords()[0].x - b.getEffectiveCoords()[0].x) :
      [];

    const sortedHDividers = this.HDivider.length > 0 ?
      [...this.HDivider].sort((a, b) => a.getEffectiveCoords()[0].y - b.getEffectiveCoords()[0].y) :
      [];

    // Get divider positions, only considering them as position points, not actual width
    const xPositions = [this.bbox.left];
    const yPositions = [this.bbox.top];

    // Add all vertical divider positions - discount the divider width
    for (const vd of sortedVDividers) {
      const dividerX = vd.getEffectiveCoords()[0].x;

      // Add the divider's position (center point), not its edges
      xPositions.push(dividerX);
    }
    xPositions.push(this.bbox.right);

    // Add all horizontal divider positions - discount the divider height
    for (const hd of sortedHDividers) {
      const dividerY = hd.getEffectiveCoords()[0].y;

      // Add the divider's position (center point), not its edges  
      yPositions.push(dividerY);
    }
    yPositions.push(this.bbox.bottom);

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

        // Apply shadowWidth for each divider if present (only in the correct compartment)
        if (rightDivider && rightDivider.shadowWidth) {
          // Apply shadowWidth.x from the right divider to the left side of the compartment
          const shadowX = rightDivider.shadowWidth.x * rightDivider.xHeight / 4;
          right += shadowX;
        }

        if (leftDivider && leftDivider.shadowWidth) {
          // Apply shadowWidth.x from the left divider to the right side of the compartment
          const shadowX = leftDivider.shadowWidth.x * leftDivider.xHeight / 4;
          left += leftDivider.width - shadowX;
        }

        if (bottomDivider && bottomDivider.shadowWidth) {
          // Apply shadowWidth.y from the bottom divider to the top of the compartment
          const shadowY = bottomDivider.shadowWidth.y * bottomDivider.xHeight / 4;
          bottom += shadowY;
        }

        if (topDivider && topDivider.shadowWidth) {
          // Apply shadowWidth.y from the top divider to the bottom of the compartment
          const shadowY = topDivider.shadowWidth.y * topDivider.xHeight / 4;
          top += topDivider.height - shadowY;
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

  // Optimized method to process border resize without causing infinite loops
  processResize() {
      const BG = this
      BG.removeAll();

      // Get the bounding box of the active selection 
      let coords = BorderUtilities.getBorderObjectCoords(BG.heightObjects, BG.widthObjects);

      if (!isNaN(parseInt(BG.fixedWidth))) {
        const padding = parseInt(BG.fixedWidth) - coords.right + coords.left;
        coords.left -= padding / 2;
        coords.right += padding / 2;
      }

      if (!isNaN(parseInt(BG.fixedHeight))) {
        const padding = parseInt(BG.fixedHeight) - coords.bottom + coords.top;
        coords.top -= padding / 2;
        coords.bottom += padding / 2;
      }

      const borderObject = drawLabeledBorder(BG.borderType, BG.xHeight, coords, BG.color);

      BG.add(borderObject);
      BG.basePolygon = borderObject;
      BG.assignWidthToDivider();

      // Track if we started update cycles that need to be closed
      let startedXCycle = false;
      let startedYCycle = false;

      try {
        // Start update cycles for the border group to be updated properly
        if (!globalAnchorTree.updateInProgressX) {
          globalAnchorTree.startUpdateCycle('x', BG.canvasID);
          startedXCycle = true;
        }

        if (!globalAnchorTree.updateInProgressY) {
          globalAnchorTree.startUpdateCycle('y', BG.canvasID);
          startedYCycle = true;
        }

        // Mark the border group as already updated to prevent cycles
        //globalAnchorTree.updatedObjectsX.add(BG.canvasID);
        //globalAnchorTree.updatedObjectsY.add(BG.canvasID);

        BG.updateAllCoord(null, [], false);
        BG.drawVertex();
      } finally {
        // Always end update cycles if we started them, even if an error occurs
        if (startedXCycle) {
          globalAnchorTree.endUpdateCycle('x');
        }

        if (startedYCycle) {
          globalAnchorTree.endUpdateCycle('y');
        }
      }

      // Update reference points and vertices
      BG.refTopLeft = {
        top: BG.basePolygon.getCoords()[0].y,
        left: BG.basePolygon.getCoords()[0].x
      };

      // Redraw vertices
      BG.drawVertex();

      canvas.renderAll();
    
  }

  // Override updateAllCoord - need to make sure trees are updated correctly
  updateAllCoord(event, _sourceList = [], _selfOnly = false) {
    // Call parent implementation first
    super.updateAllCoord(event, _sourceList, _selfOnly);
    
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

// Border Update Queue System
class BorderUpdateQueue {
  constructor() {
    this.bordersToUpdate = new Set(); // Use a Set to avoid duplicates
    this.updatedBorders = new Set(); // Track which borders have been updated in this cycle
  }

  // Add a border to the update queue
  addBorder(border) {
    if (!border || !border.canvasID) return;
    
    // Add to pending borders set
    this.bordersToUpdate.add(border.canvasID);
  }

  // Check if we should update a border immediately during an object's updateAllCoord
  shouldUpdateBorderNow(updatedObjectID) {
    // If no borders to update, return false
    if (this.bordersToUpdate.size === 0) return false;
    
    // Get all borders that need updates
    const pendingBorders = Array.from(this.bordersToUpdate)
      .map(id => canvasObject.find(obj => obj.canvasID === id))
      .filter(border => 
        border && 
        border.functionalType === 'Border' && 
        !this.updatedBorders.has(border.canvasID)
      );
    
    // For each pending border, check if it's safe to update
    for (const border of pendingBorders) {
      // Skip if already updated in this cycle
      if (this.updatedBorders.has(border.canvasID)) continue;
      
      // Skip border if updatedObjectID is in width/height objects
      const objectInBorder = 
        (border.widthObjects && border.widthObjects.some(obj => obj.canvasID === updatedObjectID)) || 
        (border.heightObjects && border.heightObjects.some(obj => obj.canvasID === updatedObjectID));
      
      if (objectInBorder) continue;
      
      // Check if any of the active anchor updates include objects that are in this border
      const hasActiveAnchorUpdates = this.hasActiveAnchorUpdatesForBorder(border);
      
      // If no active anchor updates affect this border, it's safe to update it
      if (!hasActiveAnchorUpdates) {
        // Mark this border as updated
        this.updatedBorders.add(border.canvasID);
        this.bordersToUpdate.delete(border.canvasID);
        
        // Return the border to update
        return border;
      }
    }
    
    return false; // No borders ready to update yet
  }
  
  // Check if any objects in the border are part of ongoing anchor updates
  hasActiveAnchorUpdatesForBorder(border) {
    if (!globalAnchorTree || !globalAnchorTree.updateInProgress) return false;
    
    const borderObjects = [...(border.widthObjects || []), ...(border.heightObjects || [])];
    
    // If any object in the border is not yet updated in the current anchor cycle,
    // then there are active anchor updates for this border
    for (const obj of borderObjects) {
      const objID = obj.canvasID;
      
      // Check if any pending x-axis updates involve this object
      const pendingXUpdates = globalAnchorTree.getPendingUpdates('x', objID);
      if (pendingXUpdates && pendingXUpdates.length > 0) return true;
      
      // Check if any pending y-axis updates involve this object
      const pendingYUpdates = globalAnchorTree.getPendingUpdates('y', objID);
      if (pendingYUpdates && pendingYUpdates.length > 0) return true;
    }
    
    // If we get here, no objects in the border have pending anchor updates
    return false;
  }
  
  // Reset the update tracking at the end of an update cycle
  resetCycle() {
    this.updatedBorders.clear();
  }
}

// Create a global instance of the BorderUpdateQueue
const globalBorderUpdateQueue = new BorderUpdateQueue();

function drawLabeledBorder(borderType, xHeight, bbox, color) {
  const block = { width: bbox.right - bbox.left, height: bbox.bottom - bbox.top };
  const rounding = BorderUtilities.calcBorderRounding(borderType, xHeight, bbox);
  const shapeMeta = BorderTypeScheme[borderType](xHeight, block, rounding);
  const baseGroup = [];

  // Create polygon with labeled vertices
  shapeMeta.path.forEach((p) => {
    const vertexleft = -Math.min(...p.vertex.map(v => v.x));
    const vertextop = -Math.min(...p.vertex.map(v => v.y));

    p.vertex.forEach((vertex) => {
      vertex.x = vertex.x + bbox.left;
      vertex.y = vertex.y + bbox.top;
    });

    const pathData = vertexToPath({ path: [p] });
    // Extract the d attribute if pathData is a full SVG string
    const dValue = pathData.includes('<path') 
      ? pathData.match(/d="([^"]+)"/)?.[1] || pathData
      : pathData;
      
    baseGroup.push(
      new fabric.Path(dValue, {
      left: bbox.left - vertexleft,
      top: bbox.top - vertextop,
      fill: (p['fill'] == 'background') || (p['fill'] == 'symbol') || (p['fill'] == 'border') ? BorderColorScheme[color][p['fill']] : p['fill'],
      objectCaching: false,
      strokeWidth: 0,
      })
    );
  });

  const GroupedBorder = new fabric.Group(baseGroup);
  GroupedBorder.vertex = shapeMeta.path.map(p => p.vertex).flat();
  GroupedBorder.rounding = rounding;

  return GroupedBorder;
}


export {BorderUtilities}


