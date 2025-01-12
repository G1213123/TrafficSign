let borderTest = function(){
    canvas.setActiveObject(canvasObject[1])
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
    canvas.setActiveObject(borderGroup)
    canvas.renderAll() 
}

let loopAnchoredObjectsTest = function(){
    result = loopAnchoredObjects(canvasObject)
    console.log(result)
}

testToRun = [borderTest]

testToRun.forEach(element => {
    element()
});
