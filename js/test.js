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
    canvas.add(borderGroup)
    canvas.sendToBack(borderGroup)
    widthObjects.forEach(obj => { canvas.bringToFront(obj) })
    heightObjects.forEach(obj => { canvas.bringToFront(obj) })
    canvas.setActiveObject(borderGroup)
    canvas.renderAll() 
}

let loopAnchoredObjectsTest = function(){
    result = loopAnchoredObjects(canvasObject, console.log)
    console.log(result)
}

let anchorTest = function(){
    anchorShape([canvasObject[0]], canvasObject[1], {
        vertexIndex1: 1,
        vertexIndex2: 1,
        spacingX : 200,
        spacingY : 0
    })
}

testToRun = [ borderTest]

testToRun.forEach(element => {
    element()
});
