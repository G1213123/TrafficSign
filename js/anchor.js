document.getElementById('set-anchor').addEventListener('click', function () {
    if (selectedArrow) {
      this.parentElement.parentElement.style.display = 'none';
      // Implement vertex selection logic here
      const shape1 = selectedArrow
      selectedArrow = null
      document.removeEventListener('keydown', ShowHideSideBarEvent);
      selectObjectHandler('Select shape to anchor to', anchorShape, shape1)
      //renumberVertexLabels(shape1); // Renumber vertex labels after selection
    }
  });
  
  async function anchorShape(inputShape1, inputShape2, options = {}, sourceList = []) {
  
    const shape1 = Array.isArray(inputShape1) ? inputShape1[0] : inputShape1
    const shape2 = Array.isArray(inputShape2) ? inputShape2[0] : inputShape2
  
    const vertexIndex1 = options.vertexIndex1 ? options.vertexIndex1 : await showTextBox('Enter vertex index for First Polygon:', 'E1')
    if (!vertexIndex1) { setInterval(document.addEventListener('keydown', ShowHideSideBarEvent), 1000); return }
    const vertexIndex2 = options.vertexIndex2 ? options.vertexIndex2 : await showTextBox('Enter vertex index for Second Polygon:', 'E1')
    if (!vertexIndex2) { document.addEventListener('keydown', ShowHideSideBarEvent); return }
    const spacingX = options.spacingX != null ? options.spacingX : await showTextBox('Enter spacing in X \n (Leave empty if no need for axis):', 100)
    if (spacingX == null) { document.addEventListener('keydown', ShowHideSideBarEvent); return }
    const spacingY = options.spacingY != null ? options.spacingY : await showTextBox('Enter spacing in Y \n (Leave empty if no need for axis):', 100)
    if (spacingY == null) { document.addEventListener('keydown', ShowHideSideBarEvent); return }
  
    const movingPoint = shape2.getBasePolygonVertex(vertexIndex1.toUpperCase())
    const targetPoint = shape1.getBasePolygonVertex(vertexIndex2.toUpperCase())
  
    if (!isNaN(parseInt(spacingX))) {
      // Snap arrow 1 to arrow 2 with the specified spacing
      shape2.set({
        left: shape2.left + targetPoint.x - movingPoint.x + parseInt(spacingX),
        lockMovementX: true,
      });
      anchor = { sourcePoint: vertexIndex1, targetPoint: vertexIndex2, sourceObject: shape2, TargetObject: shape1, spacing: parseInt(spacingX) }
      shape2.lockXToPolygon = anchor
      if (shape1.functionalType == 'Border'){
        if (shape1.widthObjects.includes(shape2)){
          shape1.widthObjects.splice(shape1.widthObjects.indexOf(shape2), 1)
        }
      }
    } else if (spacingX.toUpperCase() == 'EQ') {
      selectObjectHandler('Select first shape to equal distance locking', function (shape3) {
        // Use selectObjectHandler to select the second shape
        selectObjectHandler('Select second shape to equal distance locking', async function (shape4) {
          // Pass the selected shapes to your remaining code
          const vertexIndex3 = await showTextBox('Enter vertex index for Polygon 3:', 'E1')
          if (vertexIndex3 === null) return;
          const vertexIndex4 = await showTextBox('Enter vertex index for Polygon 4:', 'E1')
          if (vertexIndex4 === null) return;
  
          anchor = { sourcePoint: vertexIndex1, targetPoint: vertexIndex2, sourceObject: shape2, TargetObject: shape1, secondSourcePoint: vertexIndex3, secondTargetPoint: vertexIndex4, secondSourceObject: shape3[0], secondTargetObject: shape4[0] }
          EQanchorShape('x', anchor)
          shape2.lockXToPolygon = anchor
          shape3.lockXToPolygon = anchor
        });
      });
    }
  
    if (!isNaN(parseInt(spacingY))) {
      // Snap arrow 1 to arrow 2 with the specified spacing
      shape2.set({
        top: shape2.top + targetPoint.y - movingPoint.y + parseInt(spacingY),
        lockMovementY: true,
      });
      const anchor = { sourcePoint: vertexIndex1, targetPoint: vertexIndex2, sourceObject: shape2, TargetObject: shape1, spacing: parseInt(spacingY) }
      shape2.lockYToPolygon = anchor
      if (shape1.functionalType == 'Border'){
        if (shape1.heightObjects.includes(shape2)){
          shape1.heightObjects.splice(shape1.heightObjects.indexOf(shape2), 1)
        }
      }
    } else if (spacingY.toUpperCase() == 'EQ') {
      selectObjectHandler('Select first shape to equal distance locking', function (shape3) {
        // Use selectObjectHandler to select the second shape
        selectObjectHandler('Select second shape to equal distance locking', async function (shape4) {
          // Pass the selected shapes to your remaining code
          const vertexIndex3 = await showTextBox('Enter vertex index for Polygon 3:', 'E1')
          if (vertexIndex3 === null) return;
          const vertexIndex4 = await showTextBox('Enter vertex index for Polygon 4:', 'E1')
          if (vertexIndex4 === null) return;
  
          const anchor = { sourcePoint: vertexIndex1, targetPoint: vertexIndex2, sourceObject: shape2, TargetObject: shape1, secondSourcePoint: vertexIndex3, secondTargetPoint: vertexIndex4, secondSourceObject: shape3[0], secondTargetObject: shape4[0] }
          EQanchorShape('y', anchor)
          shape2.lockYToPolygon = anchor
          shape3.lockYToPolygon = anchor
        });
      });
    }
    //shape2.setCoords()
    if (!sourceList.includes(shape2)) {
      shape2.updateAllCoord(null, sourceList)
    }
    //if (!sourceList.includes(shape1)) {
    //  shape1.updateAllCoord(null, sourceList)
    //}
  
  
    if (!shape1.anchoredPolygon.includes(shape2)) {
      shape1.anchoredPolygon.push(shape2)
    }
  
    if (!shape1.borderType) {
      canvas.bringObjectToFront(shape1)
    }
  
    //canvas.setActiveObject(shape2)
    //CanvasObjectInspector.SetActiveObjectList(shape2)
  
    document.addEventListener('keydown', ShowHideSideBarEvent);
  
    canvas.renderAll();
    
    // Return a resolved promise to allow for chaining
    return Promise.resolve();
  }
  
  function EQanchorShape(direction, options, sourceList = []) {
    const [shape1, shape2, shape3, shape4] = [options.TargetObject, options.sourceObject, options.secondSourceObject, options.secondTargetObject]
    const [vertexIndex1, vertexIndex2, vertexIndex3, vertexIndex4] = [options.sourcePoint, options.targetPoint, options.secondSourcePoint, options.secondTargetPoint]
    const movingPoint = shape2.getBasePolygonVertex(vertexIndex1.toUpperCase())
    const targetPoint = shape1.getBasePolygonVertex(vertexIndex2.toUpperCase())
    const secondMovingPoint = shape3.getBasePolygonVertex(vertexIndex3.toUpperCase())
    const secondTargetPoint = shape4.getBasePolygonVertex(vertexIndex4.toUpperCase())
  
    if (direction == 'x') {
      const totalFloat = (movingPoint.x - targetPoint.x) + (secondTargetPoint.x - secondMovingPoint.x)
      anchorShape(shape1, shape2, {
        vertexIndex1: vertexIndex1,
        vertexIndex2: vertexIndex2,
        spacingX: totalFloat / 2,
        spacingY: ''
      }, sourceList)
      anchorShape(shape4, shape3, {
        vertexIndex1: vertexIndex4,
        vertexIndex2: vertexIndex3,
        spacingX: -totalFloat / 2,
        spacingY: ''
      }, sourceList)
      shape2.lockXToPolygon = options
      shape3.lockXToPolygon = options
    } else {
      const totalFloat = (movingPoint.y - targetPoint.y) + (secondTargetPoint.y - secondMovingPoint.y)
      anchorShape(shape1, shape2, {
        vertexIndex1: vertexIndex1,
        vertexIndex2: vertexIndex2,
        spacingX: '',
        spacingY: totalFloat / 2,
      }, sourceList)
      anchorShape(shape4, shape3, {
        vertexIndex1: vertexIndex4,
        vertexIndex2: vertexIndex3,
        spacingX: '',
        spacingY: -totalFloat / 2,
      }, sourceList)
      shape2.lockYToPolygon = options
      shape3.lockYToPolygon = options
  
  
      shape2.updateAllCoord(null, sourceList)
      shape3.updateAllCoord(null, sourceList)
  
  
    }
  }
