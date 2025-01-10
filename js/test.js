let borderTest = function(){
    canvas.setActiveObject(canvasObject[1])
    FormBorderWrapComponent.BorderPanelInit()
    FormBorderWrapComponent.BorderCreateHandler()
}

testToRun = [borderTest]

testToRun.forEach(element => {
    element()
});
