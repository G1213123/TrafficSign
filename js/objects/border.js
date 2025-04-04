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
      coord = obj.getEffectiveCoords()
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
        anchorShape(h.lockYToPolygon.TargetObject, h, {
          vertexIndex1: h.lockYToPolygon.sourcePoint,
          vertexIndex2: h.lockYToPolygon.targetPoint,
          spacingX: '',
          spacingY: DividerMargin[h.functionalType]['top'] * h.xHeight / 4 + rounding.y
        }, sourceList)
      }
      const nextAnchor = h.anchoredPolygon[0]
      if (!sourceList.includes(nextAnchor)) {
        anchorShape(h, nextAnchor, {
          vertexIndex1: nextAnchor.lockYToPolygon.sourcePoint,
          vertexIndex2: nextAnchor.lockYToPolygon.targetPoint,
          spacingX: '',
          spacingY: DividerMargin[h.functionalType]['bottom'] * h.xHeight / 4 + rounding.y
        }, sourceList)
      }
    })
    VDividers.forEach(v => {
      // Skip rounding if divider has fixed distance values
      if (v.fixedLeftValue || v.fixedRightValue) {
        return;
      }

      if (!sourceList.includes(v.lockXToPolygon.TargetObject) && v.functionalType == 'VDivider') {
        anchorShape(v.lockXToPolygon.TargetObject, v, {
          vertexIndex1: v.lockXToPolygon.sourcePoint,
          vertexIndex2: v.lockXToPolygon.targetPoint,
          spacingX: DividerMargin[v.functionalType]['left'] * v.xHeight / 4 + rounding.x,
          spacingY: ''
        }, sourceList)
      }
      const nextAnchor = v.anchoredPolygon[0]
      if (!sourceList.includes(nextAnchor)) {
        anchorShape(v, nextAnchor, {
          vertexIndex1: nextAnchor.lockXToPolygon.sourcePoint,
          vertexIndex2: nextAnchor.lockXToPolygon.targetPoint,
          spacingX: DividerMargin[v.functionalType]['right'] * v.xHeight / 4 + rounding.x,
          spacingY: ''
        }, sourceList)
        nextAnchor.rounded = { x: rounding.x, y: 0 }
      }
    })
  },

  getBorderObjectCoords: function (fheightObjects, fwidthObjects) {
    const coordsWidth = BorderUtilities.getBoundingBox(fwidthObjects)
    const coordsHeight = BorderUtilities.getBoundingBox(fheightObjects)
    return { left: coordsWidth.left, top: coordsHeight.top, right: coordsWidth.right, bottom: coordsHeight.bottom }
  },

  BorderGroupCreate: async function (borderType, heightObjects, widthObjects, widthText, heightText, options = null) {
    const xHeight = options ? options.xHeight : parseInt(document.getElementById("input-xHeight").value)
    //const borderType = options ? options.borderType : document.getElementById("input-type").value
    const colorType = options ? options.colorType : document.getElementById("input-color").value

    const [fheightObjects, fwidthObjects, VDivider, HDivider, bordered] = BorderUtilities.FilterDivider(heightObjects, widthObjects)

    // Get the bounding box of the active selection 
    let coords = BorderUtilities.getBorderObjectCoords(fheightObjects, fwidthObjects)

    // handle roundings on borders and dividers
    const rounding = BorderUtilities.calcBorderRounding(borderType, xHeight, coords)
    BorderUtilities.RoundingToDivider(HDivider, VDivider, rounding)
    coords = BorderUtilities.getBorderObjectCoords(fheightObjects, fwidthObjects)
    if (!isNaN(parseInt(widthText))) {
      const padding = parseInt(widthText) - coords.right + coords.left
      coords.left -= padding / 2
      coords.right += padding / 2
    }
    if (!isNaN(parseInt(heightText))) {
      const padding = parseInt(heightText) - coords.bottom + coords.top
      coords.top -= padding / 2
      coords.bottom += padding / 2
    }

    const BaseBorder = await drawLabeledBorder(borderType, xHeight, coords, colorType)

    // Use the new BorderGroup class instead of BaseGroup
    const borderGroup = new BorderGroup(BaseBorder, borderType, {
      widthObjects: [...fwidthObjects],
      heightObjects: [...fheightObjects],
      fixedWidth: widthText,
      fixedHeight: heightText,
      VDivider: VDivider,
      HDivider: HDivider,
      xHeight: xHeight,
      color: colorType
    });

    // Add mid points and assign widths to dividers
    borderGroup.addMidPointToDivider();
    borderGroup.assignWidthToDivider();

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
  },


}

// Define BorderGroup class that extends BaseGroup
class BorderGroup extends BaseGroup {
  constructor(baseBorder, borderType, options = {}) {
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
    this.bbox = null; // Main border bounding box
    this.compartmentBboxes = []; // Array of compartment bounding boxes

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
    const frame = 1.5 * this.xHeight / 4;

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
    this.updateBboxes();
    
    const frame = 1.5 * this.xHeight / 4;
    let i = 0;
    
    // First clear any existing mid points from previous calculations
    this.basePolygon.vertex = this.basePolygon.vertex.filter(v => !v.label || !v.label.startsWith('C'));
    
    // Loop through each compartment and add midpoints on each edge
    this.compartmentBboxes.forEach((compartment, index) => {
      // Calculate midpoints for each edge of the compartment
      const midX = (compartment.left + compartment.right) / 2;
      const midY = (compartment.top + compartment.bottom) / 2;
      
      // Add midpoint on top edge
      this.basePolygon.vertex.push({ x: midX, y: compartment.top, label: `C${i += 1}` });
      
      // Add midpoint on right edge
      this.basePolygon.vertex.push({ x: compartment.right, y: midY, label: `C${i += 1}` });
      
      // Add midpoint on bottom edge
      this.basePolygon.vertex.push({ x: midX, y: compartment.bottom, label: `C${i += 1}` });
      
      // Add midpoint on left edge
      this.basePolygon.vertex.push({ x: compartment.left, y: midY, label: `C${i += 1}` });
    });
  }

  // Assign width to divider
  async assignWidthToDivider(sourceList = []) {
    // Update bboxes first to ensure we have current border and compartment information
    this.updateBboxes();
    
    // Use the bbox property instead of recalculating it
    const borderSize = this.getBoundingRect();
    const frame = 1.5 * this.xHeight / 4;
    
    // Handle VDividers
    for (const d of this.VDivider) {
      // Check if divider has fixed distance values
      if (d.fixedLeftValue || d.fixedRightValue) {
        // Store the group's initial position
        const initialLeft = d.getEffectiveCoords()[0].x;
        const initialTop = d.top;

        // Redraw the divider with the border's dimensions
        const res = await drawDivider(d.xHeight, d.color, { left: d.left, top: d.top }, this.bbox, d.functionalType);
        d.replaceBasePolygon(res);

        // Position divider vertically same as before
        d.set({ top: this.bbox.top });

        // For fixed values, anchor to the border instead of objects
        // Priority: use the right value if both are specified
        if (d.fixedRightValue !== undefined) {
          // Anchor to right of border
          d.set({ left: borderSize.left + borderSize.width - frame - d.fixedRightValue - DividerMargin[d.functionalType]['right'] * d.xHeight / 4 });

          // Remove any existing anchoring
          if (d.lockXToPolygon && Object.keys(d.lockXToPolygon).length > 0) {
            removeAnchor(d.lockXToPolygon.TargetObject, d);
          }
          if (d.anchoredPolygon && d.anchoredPolygon.length > 0) {
            for (const anchoredObj of d.anchoredPolygon) {
              if (anchoredObj.lockXToPolygon && Object.keys(anchoredObj.lockXToPolygon).length > 0) {
                removeAnchor(d, anchoredObj);
              }
            }
          }
        } else if (d.fixedLeftValue !== undefined) {
          // Anchor to left of border
          d.set({ left: borderSize.left + frame + d.fixedLeftValue + DividerMargin[d.functionalType]['left'] * d.xHeight / 4 });

          // Remove any existing anchoring
          if (d.lockXToPolygon && Object.keys(d.lockXToPolygon).length > 0) {
            //removeAnchor(d.lockXToPolygon.TargetObject, d);
          }
          if (d.anchoredPolygon && d.anchoredPolygon.length > 0) {
            for (const anchoredObj of d.anchoredPolygon) {
              if (anchoredObj.lockXToPolygon && Object.keys(anchoredObj.lockXToPolygon).length > 0) {
                //removeAnchor(d, anchoredObj);
              }
            }
          }
        }
      } else {
        // Regular object-anchored divider
        const initialLeft = d.getEffectiveCoords()[0].x;
        const res = await drawDivider(d.xHeight, d.color, { left: d.left, top: d.top }, this.bbox, d.functionalType);
        d.replaceBasePolygon(res);
        d.set({ 
          top: this.bbox.top, 
          left: initialLeft 
        });
      }
      d.updateAllCoord(null, sourceList);
    }

    // Handle HDividers
    for (const d of this.HDivider) {
      // Check if divider has fixed distance values
      if (d.fixedTopValue || d.fixedBottomValue) {
        // Store the group's initial position
        const initialTop = d.getEffectiveCoords()[0].y;
        const initialLeft = d.left;

        // Redraw the divider with the border's dimensions
        const res = await drawDivider(d.xHeight, d.color, { left: d.left, top: d.top - DividerMargin[d.functionalType].top * d.xHeight / 4 }, this.bbox, d.functionalType);
        d.replaceBasePolygon(res);

        // Position divider horizontally same as before
        d.set({ left: this.bbox.left + DividerMargin[d.functionalType]['left'] * d.xHeight / 4 });

        // For fixed values, anchor to the border instead of objects
        // Priority: use the bottom value if both are specified
        if (d.fixedBottomValue !== undefined) {
          // Anchor to bottom of border
          d.set({ top: borderSize.top + borderSize.height - frame - d.fixedBottomValue - DividerMargin[d.functionalType]['bottom'] * d.xHeight / 4 });

          // Remove any existing anchoring
          if (d.lockYToPolygon && Object.keys(d.lockYToPolygon).length > 0) {
            removeAnchor(d.lockYToPolygon.TargetObject, d);
          }
          if (d.anchoredPolygon && d.anchoredPolygon.length > 0) {
            for (const anchoredObj of d.anchoredPolygon) {
              if (anchoredObj.lockYToPolygon && Object.keys(anchoredObj.lockYToPolygon).length > 0) {
                removeAnchor(d, anchoredObj);
              }
            }
          }
        } else if (d.fixedTopValue !== undefined) {
          // Anchor to top of border
          d.set({ top: borderSize.top + frame + d.fixedTopValue + DividerMargin[d.functionalType]['top'] * d.xHeight / 4 });

          // Remove any existing anchoring
          if (d.lockYToPolygon && Object.keys(d.lockYToPolygon).length > 0) {
            removeAnchor(d.lockYToPolygon.TargetObject, d);
          }
          if (d.anchoredPolygon && d.anchoredPolygon.length > 0) {
            for (const anchoredObj of d.anchoredPolygon) {
              if (anchoredObj.lockYToPolygon && Object.keys(anchoredObj.lockYToPolygon).length > 0) {
                removeAnchor(d, anchoredObj);
              }
            }
          }
        }
      } else {
        // Regular object-anchored divider
        const initialTop = d.getEffectiveCoords()[0].y;

        // For HLine dividers, check if there are vertical dividers and calculate the correct cell
        if (d.functionalType === 'HLine' && this.compartmentBboxes.length > 1) {
          // Find the compartment that contains the HLine's horizontal position
          const hLinePosition = d.left + (d.width / 2);
          const hLineVerticalPosition = d.top;
          
          // Find the appropriate compartment
          const matchingCompartments = this.compartmentBboxes.filter(cmp => 
            hLinePosition >= cmp.left && 
            hLinePosition <= cmp.right 
            //hLineVerticalPosition >= cmp.top &&
            //hLineVerticalPosition <= cmp.bottom
          );
          
          if (matchingCompartments.length > 0) {
            const cellBbox = matchingCompartments[0];
            
            // Draw the HLine with the cell-specific bbox
            const res = await drawDivider(
              d.xHeight, 
              d.color, 
              { left: cellBbox.left, top: d.top - DividerMargin[d.functionalType].top * d.xHeight / 4 }, 
              cellBbox, 
              d.functionalType
            );
            d.replaceBasePolygon(res);

            // Position HLine in the cell
            d.set({
              top: initialTop,
              left: cellBbox.left + DividerMargin[d.functionalType]['left'] * d.xHeight / 4
            });
          } else {
            // Fallback if no matching compartment found
            const res = await drawDivider(d.xHeight, d.color, { left: d.left, top: d.top - DividerMargin[d.functionalType].top * d.xHeight / 4 }, this.bbox, d.functionalType);
            d.replaceBasePolygon(res);
            d.set({ top: initialTop, left: this.bbox.left + DividerMargin[d.functionalType]['left'] * d.xHeight / 4 });
          }
        } else {
          // Regular HDivider or HLine without VDividers
          const res = await drawDivider(d.xHeight, d.color, { left: d.left, top: d.top - DividerMargin[d.functionalType].top * d.xHeight / 4 }, this.bbox, d.functionalType);
          d.replaceBasePolygon(res);
          d.set({ top: initialTop, left: this.bbox.left + DividerMargin[d.functionalType]['left'] * d.xHeight / 4 });
        }
      }
      d.updateAllCoord(null, sourceList);
    }
    
    // After all dividers are repositioned, update the bboxes again
    this.updateBboxes();
    
    // Update mid points
    this.addMidPointToDivider();
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
      this.compartmentBboxes.push({...this.bbox});
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
          right += shadowX ;
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
          top += topDivider.height - shadowY ;
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
}


function drawLabeledBorder(borderType, xHeight, bbox, color) {
  const block = { width: bbox.right - bbox.left, height: bbox.bottom - bbox.top };
  const rounding = BorderUtilities.calcBorderRounding(borderType, xHeight, bbox);
  const shapeMeta = BorderTypeScheme[borderType](xHeight, block, rounding);
  const baseGroup = [];

  // Create polygon with labeled vertices
  shapeMeta.path.forEach(async (p) => {
    const vertexleft = -Math.min(...p.vertex.map(v => v.x));
    const vertextop = -Math.min(...p.vertex.map(v => v.y));

    p.vertex.forEach((vertex) => {
      vertex.x = vertex.x + bbox.left;
      vertex.y = vertex.y + bbox.top;
    });

    const pathData = vertexToPath({ path: [p] });
    baseGroup.push(
      new fabric.Path(pathData, {
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





