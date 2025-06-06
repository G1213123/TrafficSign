export function createDemoSymbol(demoCanvas, demoCanvasObject) {
    if (!demoCanvas) {
        console.error('Demo canvas not initialized');
        return;
    }

    try {
        const triangle = new fabric.Polygon([
            { x: 0, y: 0, label: 'V1', start: 1, display: 1 },
            { x: 100, y: 100, label: 'V2', start: 0, display: 0 },
            { x: 100, y: 200, label: 'V3', start: 0, display: 0 },
            { x: 100 / 3, y: 400 / 3, label: 'V4', start: 0, display: 0 },
            { x: 100 / 3, y: 400, label: 'V5', start: 0, display: 0 },
            { x: -100 / 3, y: 400, label: 'V6', start: 0, display: 0 },
            { x: -100 / 3, y: 400 / 3, label: 'V7', start: 0, display: 0 },
            { x: -100, y: 200, label: 'V8', start: 0, display: 0 },
            { x: -100, y: 100, label: 'V9', start: 0, display: 0 },        ], {
            fill: '#ffffff',
            strokeWidth: 0,
            left: -550,
            top: -200,
            selectable: true,
            hasControls: false,
            hasBorders: true,
            cornerStyle: 'circle',
            borderColor: '#3b82f6',
            cornerColor: '#3b82f6',
            hasRotatingPoint: false,
            lockRotation: true,
            lockScalingX: true,
            lockScalingY: true,
            lockUniScaling: true
        });

        triangle.functionalType = 'symbol'; // Mark this object as a symbol

        demoCanvas.add(triangle);
        demoCanvas.setActiveObject(triangle);
        demoCanvas.renderAll();
        demoCanvasObject.push(triangle);

        console.log('Demo symbol created');
    }
    catch (error) {
        console.error('Error creating demo symbol:', error);
    }

}
