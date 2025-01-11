let borderTest = function(){
    canvas.setActiveObject(canvasObject[1])
    FormBorderWrapComponent.BorderPanelInit()
    borderGroup = new fabric.Group()
    borderGroup.xheight = 100
    borderGroup.borderType = FormBorderWrapComponent.BorderType["Blue Background"]

    borderObject = FormBorderWrapComponent.BorderCreate(canvas.getActiveObjects(), canvas.getActiveObjects(), borderGroup)
    borderGroup.basePolygon = borderObject
    borderGroup.basePolygon.functinoalType = 'Border'
    borderGroup.widthObjects = [...canvas.getActiveObjects()]
    borderGroup.heightObjects = [...canvas.getActiveObjects()]
    // Combine the arrays and create a Set to remove duplicates
    let combinedArray = [...borderGroup.widthObjects, ...borderGroup.heightObjects, borderObject]
    combinedArray.forEach(element => {
        borderGroup.addWithUpdate(element)
    });
    canvas.add(borderGroup)
    canvas.sendToBack(borderGroup)
    canvas.setActiveObject(borderGroup)
    canvasObject.push(borderGroup)
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
