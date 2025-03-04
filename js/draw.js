let cursorClickMode = 'normal'
const deleteIcon =
  "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!DOCTYPE svg PUBLIC '-//W3C//DTD SVG 1.1//EN' 'http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd'%3E%3Csvg version='1.1' id='Ebene_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='595.275px' height='595.275px' viewBox='200 215 230 470' xml:space='preserve'%3E%3Ccircle style='fill:%23F44336;' cx='299.76' cy='439.067' r='218.516'/%3E%3Cg%3E%3Crect x='267.162' y='307.978' transform='matrix(0.7071 -0.7071 0.7071 0.7071 -222.6202 340.6915)' style='fill:white;' width='65.545' height='262.18'/%3E%3Crect x='266.988' y='308.153' transform='matrix(0.7071 0.7071 -0.7071 0.7071 398.3889 -83.3116)' style='fill:white;' width='65.544' height='262.179'/%3E%3C/g%3E%3C/svg%3E";
let activeVertex = null

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

    const pathData = vertexToPath(shapeMeta);

    this.vertex = shapeMeta.path.map(p => p.vertex).flat(); // Store the shapeMeta.vertex points
    this.insertPoint = shapeMeta.path[0].vertex[0];

    const result = await fabric.loadSVGFromString(pathData)
    result.objects.map((obj) => {
      obj.set({strokeWidth:0});
    });
    this.add(...(result.objects.filter((obj) => !!obj)));
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
    //this.type = 'baseGroup';
    this.basePolygon = basePolygon;
    //this.basePolygon.set({ 'dirty': true });
    this.functionalType = functionalType;
    this.anchoredPolygon = [];
    this.anchorageLink = [];
    this.subObjects = [];
    this.lockXToPolygon = {};
    this.lockYToPolygon = {};

    canvasObject.push(this);
    this.canvasID = canvasObject.length - 1
    this._showName = `<Group ${this.canvasID}> ${functionalType}${basePolygon.text ? ' ' + basePolygon.text : ''}${basePolygon.symbol ? ' ' + basePolygon.symbol : ''}`;

    this.basePolygon.insertPoint = this.basePolygon.vertex[0];
    canvas.remove(this.basePolygon);
    this.add(this.basePolygon);

    // remove default fabric control
    Object.values(this.controls).forEach((control) => {
      control.visible = false;
    })

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

    this.drawVertex(options.calcVertex)

    this.refTopLeft = {
      top: this.basePolygon.getCoords()[0].y,
      left: this.basePolygon.getCoords()[0].x
    };

    canvas.add(this);
    CanvasObjectInspector.createObjectListPanelInit()


    this.on('selected', () => {
      this.subObjects.forEach(obj => {
        obj.set('opacity', 1);
      });

      this.drawAnchorLinkage()
      CanvasObjectInspector.SetActiveObjectList(this)
      //canvas.bringObjectToFront(this)
      
      // New: show lock highlights if applicable
      this.showLockHighlights();
    });

    this.on('deselected', () => {
      setTimeout(() => {
        this.subObjects.forEach(obj => {
          obj.set('opacity', 0);
        });
        this.anchorageLink.forEach(obj => {
          obj.forEach(o => {
            o.set('opacity', 0);
          })
        });
        // New: remove lock highlights
        this.hideLockHighlights();
        // canvas.sendObjectToBack(this)
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

    this.on('modified', this.updateAllCoord.bind(this));
    this.on('moving', this.updateAllCoord.bind(this));
  }

  replaceBasePolygon(newBasePolygon) {
    this.remove(this.basePolygon);
    this.basePolygon = newBasePolygon;
    this.basePolygon.insertPoint = this.basePolygon.vertex[0];
    this.add(this.basePolygon);
    this.drawVertex();
    this.setCoords();
  }

  drawVertex(calc = true) {
    // Calculate vertex points for anchoring

    if (!this.basePolygon.vertex) {
      this.basePolygon.vertex = [];
    }
    if (calc) {
      let basePolygonCoords = Object.values(this.basePolygon.getCoords());
      //basePolygonCoords = [basePolygonCoords[0], basePolygonCoords[1], basePolygonCoords[3], basePolygonCoords[2]]; // tl, tr, bl, br ==> tl, tr, br, bl
      basePolygonCoords.forEach((p, i) => {
        this.basePolygon.vertex.push({ x: p.x, y: p.y, label: `E${i * 2 + 1}` });
        const midpoint = {
          x: (p.x + basePolygonCoords[(i + 1 === basePolygonCoords.length) ? 0 : i + 1].x) / 2,
          y: (p.y + basePolygonCoords[(i + 1 === basePolygonCoords.length) ? 0 : i + 1].y) / 2,
          label: `E${(i + 1) * 2}`
        };
        this.basePolygon.vertex.push(midpoint);
      });
      if (this.addMidPointToDivider){this.addMidPointToDivider(this)}
    }

    // Draw the vertices and labels
    if (this.basePolygon.vertex) {
      this.basePolygon.vertex.filter(v => (v.label.includes('E')||v.label.includes('V')||v.label.includes('C'))).forEach(v => {
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
    console.log('All nodes processed');
    // Call another function here
  }

  // Method to call for border resizing
  borderResize(sourceList = []) {
    sourceList.includes(this) ? sourceList : sourceList.push(this)
    if (this.borderGroup && !sourceList.includes(this.borderGroup)) {
      const BG = this.borderGroup
      BG.removeAll()
      // Get the bounding box of the active selection 
      let coords = FormBorderWrapComponent.getBorderObjectCoords(BG.heightObjects, BG.widthObjects)

      // handle roundings on borders and dividers
      const rounding = calcBorderRounding(BG.borderType, BG.xHeight, coords)
      FormBorderWrapComponent.RoundingToDivider(BG.HDivider, BG.VDivider, rounding, sourceList)
      coords = FormBorderWrapComponent.getBorderObjectCoords(BG.heightObjects, BG.widthObjects)

      const borderObject = drawLabeledBorder(BG.borderType, BG.xHeight, coords, BG.color)

      BG.add(borderObject)
      BG.basePolygon = borderObject
      FormBorderWrapComponent.assignWidthToDivider(BG, sourceList)
      BG.updateAllCoord(null, sourceList)
      BG.drawVertex()
    }
  }

  getBasePolygonVertex(label) {
    return this.basePolygon.vertex.find(v => v.label === label.toUpperCase());
  }

  drawAnchorLinkage() {
    for (let i = this.anchorageLink.length - 1; i >= 0; i--) {
      const obj = this.anchorageLink[i];

      this.anchorageLink.splice(i, 1); // Remove the element from the array
      obj.forEach(e => {
        this.remove(e); // Remove the object from the group
        canvas.remove(e); // Remove the object from the canvas
      })

    }
    if (Object.keys(this.lockXToPolygon).length) {
      let lockAnno1 = new LockIcon(this, this.lockXToPolygon, 'x')
      this.anchorageLink.push(lockAnno1.objects);
      canvas.add(...lockAnno1.objects);

    }
    if (Object.keys(this.lockYToPolygon).length) {
      let lockAnno2 = new LockIcon(this, this.lockYToPolygon, 'y')
      this.anchorageLink.push(lockAnno2.objects);
      canvas.add(...lockAnno2.objects);

    }
    const isActive = canvas.getActiveObject() === this;
    const opacity = isActive ? 1 : 0;
    this.anchorageLink.forEach(obj => {
      obj.forEach(o => {
        o.set('opacity', opacity);
      })
    });
    canvas.renderAll();

  }
  // Method to update coordinates and emit delta
  updateAllCoord(event, sourceList = [], selfOnly = false) {
    const deltaX = this.basePolygon.getCoords()[0].x - this.refTopLeft.left;
    const deltaY = this.basePolygon.getCoords()[0].y - this.refTopLeft.top;
    this.updateCoord(deltaX, deltaY);
    this.refTopLeft = { top: this.basePolygon.getCoords()[0].y, left: this.basePolygon.getCoords()[0].x };
    if (canvas.getActiveObject() === this) {
      this.drawAnchorLinkage();
      this.showLockHighlights();
    }
    sourceList.includes(this) ? sourceList : sourceList.push(this)
    if (!selfOnly) {
      this.emitDelta(deltaX, deltaY, sourceList);
      this.borderResize(sourceList);
    }

  }

  // Method to update coordinates
  updateCoord(updateX, updateY) {
    const polygon = this.basePolygon;

    const transformedPoints = calculateTransformedPoints(polygon.vertex, {
      x: updateX,
      y: updateY,
      angle: 0
    });

    // Update customList with new coordinates
    transformedPoints.forEach((point, index) => {
      if (!polygon.vertex[index].label.includes("E"))
      polygon.vertex[index].x = point.x;
      polygon.vertex[index].y = point.y;
    });

    if (this.routeList){
      this.routeList.forEach((item, index) => {
        item.x += updateX
        item.y += updateY 
      
      })
    }
    //  this.routeCenter.forEach((item, index) => {
    //    item.x += updateX
    //    item.y += updateY 
    //  })
 //
    //}

    polygon.insertPoint = transformedPoints[0];

    polygon.setCoords();
    canvas.renderAll();
  }

  getEffectiveCoords() {
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
      const index = rootRoute.branchRoute.indexOf(deleteObj)
      rootRoute.branchRoute.splice(index, 1)
      const index2 = rootRoute.anchoredPolygon.indexOf(deleteObj)
      rootRoute.anchoredPolygon.splice(index2, 1)
      deleteObj.rootRoute = null
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
        anchoredGroup.set({ lockMovementX: false, lockMovementY: false });
        if (anchoredGroup.lockXToPolygon.TargetObject == deleteObj) {
          anchoredGroup.lockXToPolygon = {}
        }
        if (anchoredGroup.lockYToPolygon.TargetObject == deleteObj) {
          anchoredGroup.lockYToPolygon = {}
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


