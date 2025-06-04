export function createDemoText(demoCanvas, demoCanvasObject) {
    if (!demoCanvas) {
        console.error('Demo canvas not initialized');
        return;
    }

    try {
        // Create more realistic highway sign text with proper styling
        fabric.loadSVGFromURL('./images/demo-text.svg').then((results) => {
            const textGroup = new fabric.Group([], {
                selectable: true,
                hasControls: false,
                hasBorders: true,
                cornerStyle: 'circle',
                borderColor: '#3b82f6',
                cornerColor: '#3b82f6'
            })
            textGroup.add(...(results.objects.filter((obj) => !!obj)))
            textGroup.set({
                left: -50,
                top: -200,
            });
            textGroup.functionalType = 'text'; // Mark this object as a text

            demoCanvas.add(textGroup);
            demoCanvas.setActiveObject(textGroup);
            demoCanvas.renderAll();
            demoCanvasObject.push(textGroup);
        });

    } catch (error) {
        console.error('Error creating demo text:', error);
    }
}
