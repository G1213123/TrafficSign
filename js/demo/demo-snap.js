

// Demo Snap - Complete new implementation with visual snap indicators
let demoSnapState = {
    yellowCircle: null,
    greenCircle: null,
    symbolObject: null,
    textObject: null,
    isDragging: false,
    mouseMoveHandler: null,
    mouseUpHandler: null,
    snapThreshold: 50,
    snapEffect: null
};

function simulateDemoSnap(demoCanvas, demoCanvasObject) {
    if (!demoCanvas) {
        console.error('Demo canvas not initialized');
        return;
    }

    try {
        // Clean up any existing snap state
        cleanupDemoSnap(demoCanvas);

        // Find symbol and text objects
        const symbolObj = demoCanvasObject.find(obj =>
            obj.functionalType === 'symbol'
        );

        const textObj = demoCanvasObject.find(obj =>
            obj.functionalType === 'text'
        );

        if (!symbolObj || !textObj) {
            console.warn('Demo snap requires both symbol and text objects');
            return;
        }

        // Store references
        demoSnapState.symbolObject = symbolObj;
        demoSnapState.textObject = textObj;

        // Create yellow circle on symbol's top-right
        createYellowCircle(demoCanvas, symbolObj);

        // Create flashing green circle on text's top-left
        createFlashingGreenCircle(demoCanvas, textObj);

        // Set up mouse interaction
        setupSnapMouseEvents(demoCanvas);

        console.log('Demo snap initialized with visual indicators');

    } catch (error) {
        console.error('Error in demo snap simulation:', error);
    }
}

function createYellowCircle(demoCanvas, symbolObj) {
    const bounds = symbolObj.getBoundingRect();

    demoSnapState.yellowCircle = new fabric.Circle({
        left: bounds.left + bounds.width,
        top: bounds.top,
        radius: 20,
        fill: '#FFD700',
        strokeWidth: 0,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: true,
        hoverCursor: 'grab',
        moveCursor: 'grabbing',
        snapIndicator: true // Mark as snap indicator
    });

    // Add click/mouse down handler to start dragging
    startSnapDrag();


    demoCanvas.add(demoSnapState.yellowCircle);
    demoCanvas.renderAll();
}

function createFlashingGreenCircle(demoCanvas, textObj) {
    const bounds = textObj.getBoundingRect();

    demoSnapState.greenCircle = new fabric.Circle({
        left: bounds.left,
        top: bounds.top,
        radius: 20,
        fill: '#00FF00',
        strokeWidth: 0,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        snapTarget: true // Mark as snap target
    });

    demoCanvas.add(demoSnapState.greenCircle);

    // Create flashing animation
    function flashAnimation() {
        if (!demoSnapState.greenCircle) return;

        demoSnapState.greenCircle.animate('opacity', 0.3, {
            duration: 800,
            easing: fabric.util.ease.easeInOutSine,
            onComplete: function () {
                if (!demoSnapState.greenCircle) return;
                demoSnapState.greenCircle.animate('opacity', 1, {
                    duration: 800,
                    easing: fabric.util.ease.easeInOutSine,
                    onComplete: flashAnimation
                });
            }
        });
    }

    flashAnimation();
    demoCanvas.renderAll();
}

function setupSnapMouseEvents(demoCanvas) {
    // Mouse move handler for dragging
    demoSnapState.mouseMoveHandler = function (e) {
        if (!demoSnapState.isDragging) return;

        const pointer = demoCanvas.getPointer(e.e);
        updateDragPosition(demoCanvas, pointer);
    };

    // Mouse up handler to end dragging
    demoSnapState.mouseUpHandler = function (e) {
        if (demoSnapState.isDragging) {
            endSnapDrag(demoCanvas);
        }
    };

    demoCanvas.on('mouse:move', demoSnapState.mouseMoveHandler);
    demoCanvas.on('mouse:up', demoSnapState.mouseUpHandler);
}

function startSnapDrag() {
    demoSnapState.isDragging = true;

    // Store initial positions
    const symbolBounds = demoSnapState.symbolObject.getBoundingRect();
    demoSnapState.symbolInitialOffset = {
        x: demoSnapState.yellowCircle.left - (symbolBounds.left + symbolBounds.width),
        y: demoSnapState.yellowCircle.top - symbolBounds.top
    };

    console.log('Started snap drag');
}

function updateDragPosition(demoCanvas, pointer) {
    // Update yellow circle position
    demoSnapState.yellowCircle.set({
        left: pointer.x,
        top: pointer.y
    });

    // Calculate symbol's new position based on yellow circle
    const newSymbolLeft = pointer.x - demoSnapState.symbolObject.width - demoSnapState.symbolInitialOffset.x;
    const newSymbolTop = pointer.y - demoSnapState.symbolInitialOffset.y;

    // Update symbol position
    demoSnapState.symbolObject.set({
        left: newSymbolLeft,
        top: newSymbolTop
    });

    // Update coordinates
    demoSnapState.symbolObject.setCoords();
    demoSnapState.yellowCircle.setCoords();

    // Check for snap
    checkForSnap(demoCanvas, pointer);

    demoCanvas.renderAll();
}

function checkForSnap(demoCanvas, pointer) {
    if (!demoSnapState.greenCircle || !demoSnapState.yellowCircle) return;

    const distance = Math.sqrt(
        Math.pow(pointer.x - demoSnapState.greenCircle.left, 2) +
        Math.pow(pointer.y - demoSnapState.greenCircle.top, 2)
    );

    if (distance <= demoSnapState.snapThreshold) {
        // Show snap preview by changing yellow circle color
        demoSnapState.yellowCircle.set({
            fill: '#00FF00',
            stroke: '#00CC00'
        });

        // Store snap target for completion
        demoSnapState.snapToTarget = true;
    } else {
        // Reset yellow circle color
        demoSnapState.yellowCircle.set({
            fill: '#FFD700',
            stroke: '#FFA500'
        });

        demoSnapState.snapToTarget = false;
    }
}

function endSnapDrag(demoCanvas) {
    if (demoSnapState.snapToTarget) {
        // Snap to green circle
        performSnap(demoCanvas);
    }

    // Reset drag state
    demoSnapState.isDragging = false;
    demoCanvas.defaultCursor = 'default';

    console.log('Ended snap drag');
}

function performSnap(demoCanvas) {
    if (!demoSnapState.greenCircle || !demoSnapState.yellowCircle) return;

    // Snap yellow circle to green circle position
    demoSnapState.yellowCircle.set({
        left: demoSnapState.greenCircle.left,
        top: demoSnapState.greenCircle.top
    });

    // Calculate and update symbol position
    const snapX = demoSnapState.greenCircle.left;
    const snapY = demoSnapState.greenCircle.top;

    const newSymbolLeft = snapX - demoSnapState.symbolObject.width - demoSnapState.symbolInitialOffset.x;
    const newSymbolTop = snapY - demoSnapState.symbolInitialOffset.y;

    demoSnapState.symbolObject.set({
        left: newSymbolLeft,
        top: newSymbolTop
    });

    // Update coordinates
    demoSnapState.symbolObject.setCoords();
    demoSnapState.yellowCircle.setCoords();

    // Create concentric circle effect
    createConcentricEffect(demoCanvas, snapX, snapY);

    demoCanvas.renderAll();

    console.log('Snap performed!');
}

function createConcentricEffect(demoCanvas, x, y) {
    // Remove existing effect
    if (demoSnapState.snapEffect) {
        demoCanvas.remove(demoSnapState.snapEffect);
    }

    // Create concentric circles
    const outerCircle = new fabric.Circle({
        left: x,
        top: y,
        radius: 20,
        fill: 'transparent',
        stroke: '#00FF00',
        strokeWidth: 3,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false
    });

    const innerCircle = new fabric.Circle({
        left: x,
        top: y,
        radius: 12,
        fill: 'transparent',
        stroke: '#00FF00',
        strokeWidth: 2,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false
    });

    const effectGroup = new fabric.Group([outerCircle, innerCircle], {
        left: x,
        top: y,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false
    });

    demoSnapState.snapEffect = effectGroup;
    demoCanvas.add(effectGroup);

    // Animate the effect
    effectGroup.animate('scaleX', 1.5, {
        duration: 600,
        easing: fabric.util.ease.easeOutQuad
    });
    effectGroup.animate('scaleY', 1.5, {
        duration: 600,
        easing: fabric.util.ease.easeOutQuad
    });
    effectGroup.animate('opacity', 0, {
        duration: 600,
        easing: fabric.util.ease.easeOutQuad,
        onComplete: function () {
            demoCanvas.remove(effectGroup);
            demoSnapState.snapEffect = null;
        }
    });
}

function cleanupDemoSnap(demoCanvas) {
    // Remove event handlers
    if (demoSnapState.mouseMoveHandler) {
        demoCanvas.off('mouse:move', demoSnapState.mouseMoveHandler);
    }
    if (demoSnapState.mouseUpHandler) {
        demoCanvas.off('mouse:up', demoSnapState.mouseUpHandler);
    }

    // Remove visual elements
    if (demoSnapState.yellowCircle) {
        demoCanvas.remove(demoSnapState.yellowCircle);
    }
    if (demoSnapState.greenCircle) {
        demoCanvas.remove(demoSnapState.greenCircle);
    }
    if (demoSnapState.snapEffect) {
        demoCanvas.remove(demoSnapState.snapEffect);
    }

    // Reset state
    demoSnapState = {
        yellowCircle: null,
        greenCircle: null,
        symbolObject: null,
        textObject: null,
        isDragging: false,
        mouseMoveHandler: null,
        mouseUpHandler: null,
        snapThreshold: 50,
        snapEffect: null
    };

    demoCanvas.defaultCursor = 'default';
    demoCanvas.renderAll();
}

// Export the function
export { simulateDemoSnap, cleanupDemoSnap };


