let borderTest = function(){
    canvas.setActiveObject(canvasObject[0])
    FormBorderWrapComponent.BorderPanelInit()
    borderGroup = new fabric.Group()
    xheight = 100
    borderType = FormBorderWrapComponent.BorderType["Blue Background"]
    widthObjects = canvas.getActiveObjects()
    heightObjects = canvas.getActiveObjects()

    borderObject = FormBorderWrapComponent.BorderCreate(heightObjects, widthObjects, xheight, borderType)
    borderGroup = drawBasePolygon(borderObject)
    borderGroup.widthObjects = [...widthObjects]
    borderGroup.heightObjects = [...heightObjects]

    // Combine the arrays and create a Set to remove duplicates
    canvas.sendToBack(borderGroup)
    widthObjects.forEach(obj => { canvas.bringToFront(obj) })
    heightObjects.forEach(obj => { canvas.bringToFront(obj) })
    canvas.renderAll() 
}

let loopAnchoredObjectsTest = function(){
    result = loopAnchoredObjects(canvasObject, console.log)
    console.log(result)
}

let anchorTest = function(){
    anchorShape([canvasObject[0]], canvasObject[1], {
        vertexIndex1: 'E2',
        vertexIndex2: 'E0',
        spacingX : -200,
        spacingY : 0
    })
}

function initShape() {
    /*routeMap = new fabric.Group()
    var base = LoadShape("base", { scaleY: (31 / 2 + 21.92 + 2.828 + 12 + 10) / 31, top: -(31 / 2 + 21.92 + 2.828 + 12 + 10) }, routeMap)
    var arm = LoadShape("base", { left: -21.92, top: -(31 / 2 + 21.92), scaleX: 4 / 6, angle: -45 }, routeMap)
    canvas.add(routeMap)*/
    text1 = new fabric.Textbox("Central", {
      fontFamily: 'TransportMedium',
      fill: '#ffffff',
      fontSize: 200
    })
    //text1.vertex = Object.values(text1.aCoords).map((point, i) => {
    //  return { x: point.x, y: point.y, label: `E${i + 1}` }
    //})
    //text1.insertPoint = text1.vertex[0]
  
    block = drawBasePolygon(text1)
  
    const arrowOptions1 = { x: 0, y: 0, length: 25, angle: 0, color: 'white' };
    const arrowOptions2 = { x: 100, y: 100, length: 25, angle: 0, color: 'white' };
    Polygon1 = drawLabeledArrow(canvas, arrowOptions1);
    Polygon2 = drawLabeledArrow(canvas, arrowOptions2);
  }

  
testToRun = [initShape, borderTest ]

testToRun.forEach(element => {
    element()
});
