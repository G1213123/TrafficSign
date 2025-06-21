import { globalAnchorTree } from "./anchor.js";
import { canvasTracker } from "../canvas/Tracker.js";
import { CanvasGlobals } from "../canvas/canvas.js";
const canvas = CanvasGlobals.canvas;

class LockIcon {
  constructor(baseGroup, lockParam, direction) {
    this.objectType = 'LockIcon'; // Added objectType for serialization
    this.baseGroup = baseGroup; // This will be serialized as baseGroupCanvasID
    this.lockParam = lockParam; // This will be serialized carefully
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
    const fontSize = 12 / zoom;        // Fixed 12px font size
    const arrowSize = 12 / zoom;        // Size of dimension arrows
    const extensionLineLength = 8 / zoom; // Length of extension lines

    // Create dimension lines and position lock icon based on direction
    if (this.direction == 'x') {
      // Position of dimension line, offset from source and target points
      const dimLineY = sourcePoint.y + offsetDistance / zoom;

      // Extension lines (vertical lines from source and target points to dimension line)
      this.lines.push(new fabric.Line(
        [sourcePoint.x, sourcePoint.y, sourcePoint.x, dimLineY + extensionLineLength],
        {
          stroke: 'green',
          strokeWidth: lineWidth,
          selectable: false,
          functionalType: 'anchorLine'
        }
      ));

      this.lines.push(new fabric.Line(
        [targetPoint.x, targetPoint.y, targetPoint.x, dimLineY + extensionLineLength],
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
          top: dimLineY + (25 / canvas.getZoom()),
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
      const dimLineX = sourcePoint.x + offsetDistance / zoom;

      // Extension lines (horizontal lines from source and target points to dimension line)
      this.lines.push(new fabric.Line(
        [sourcePoint.x, sourcePoint.y, dimLineX + extensionLineLength, sourcePoint.y],
        {
          stroke: 'red',
          strokeWidth: lineWidth,
          selectable: false,
          functionalType: 'anchorLine'
        }
      ));

      this.lines.push(new fabric.Line(
        [targetPoint.x, targetPoint.y, dimLineX + extensionLineLength, targetPoint.y],
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
          left: midX + 45 / canvas.getZoom(),
          top: midY + 8 / canvas.getZoom(),
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

      // Remove from globalAnchorTree x tree before clearing lockXToPolygon
      if (anchorX) {
        globalAnchorTree.removeNode('x', this.baseGroup.canvasID);
      }

      // Clear the lockXToPolygon object
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

      // Remove from globalAnchorTree y tree before clearing lockYToPolygon
      if (anchorY) {
        globalAnchorTree.removeNode('y', this.baseGroup.canvasID);
      }

      // Clear the lockYToPolygon object
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
    //if (canvasTracker) {
    //  canvasTracker.track('unlockObject', [{
    //    type: 'Unlock',
    //    objectId: this.baseGroup.canvasID,
    //    functionalType: this.baseGroup.functionalType,
    //    direction: this.direction
    //  }]);
    //}

    // Reshow the vertexes and dimensions
    this.baseGroup.focusMode = false;

    canvas.renderAll();
  }

  // Add a method to serialize LockIcon state
  serializeToJSON() {
    const serializedLockParam = {};
    if (this.lockParam) {
        // Serialize sourceObject and TargetObject by their canvasID
        if (this.lockParam.sourceObject) {
            serializedLockParam.sourceObject = this.lockParam.sourceObject.canvasID;
        }
        if (this.lockParam.TargetObject) {
            serializedLockParam.TargetObject = this.lockParam.TargetObject.canvasID;
        }
        // Copy other primitive properties from lockParam
        for (const key in this.lockParam) {
            if (key !== 'sourceObject' && key !== 'TargetObject' && Object.prototype.hasOwnProperty.call(this.lockParam, key)) {
                // Deep copy AnchorPoint objects if they exist
                if ((key === 'sourcePoint' || key === 'targetPoint' || key === 'secondSourcePoint' || key === 'secondTargetPoint') && 
                    this.lockParam[key] && typeof this.lockParam[key] === 'object') {
                    serializedLockParam[key] = JSON.parse(JSON.stringify(this.lockParam[key]));
                } else {
                    serializedLockParam[key] = this.lockParam[key];
                }
            }
        }
         // Serialize secondSourceObject and secondTargetObject by their canvasID if they exist
        if (this.lockParam.secondSourceObject) {
            serializedLockParam.secondSourceObject = this.lockParam.secondSourceObject.canvasID;
        }
        if (this.lockParam.secondTargetObject) {
            serializedLockParam.secondTargetObject = this.lockParam.secondTargetObject.canvasID;
        }
    }

    return {
        objectType: this.objectType,
        baseGroupCanvasID: this.baseGroup ? this.baseGroup.canvasID : null,
        lockParam: serializedLockParam, // Serialized lockParam
        direction: this.direction,
        // Note: Fabric.js objects (lines, dimensionTexts, icons) are not serialized directly.
        // They will be recreated by the constructor during deserialization.
    };
  }
}

export { LockIcon };