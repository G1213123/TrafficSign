/**
 * Demo Canvas - Simplified version of main app canvas for homepage demonstration
 * Uses the same codebase patterns as canvas.js but simplified for demo purposes
 */


// Demo Canvas Setup - Mirror main app canvas initialization
let demoCanvas = null;
let demoActiveObject = null;
let demoCanvasObject = [];

// Demo CanvasGlobals - Mirror the structure from canvas.js for SymbolObject compatibility
let DemoCanvasGlobals = null;

// Settings for demo (simplified version of GeneralSettings)
const DemoSettings = {
    showGrid: true,
    gridColor: '#ffffff',
    gridSize: 20
};

function initDemoCanvas() {
    // Check if canvas element exists
    const canvasElement = document.getElementById('demo-canvas');
    if (!canvasElement) {
        console.error('Demo canvas element not found');
        return null;
    }

    // Check if Fabric.js is loaded
    if (typeof fabric === 'undefined') {
        console.error('Fabric.js is not loaded');
        return null;
    }
    try {        // Initialize the demo canvas with same settings as main app
        demoCanvas = new fabric.Canvas('demo-canvas', {
            fireMiddleClick: true,
            fireRightClick: true,
            preserveObjectStacking: true,
            enableRetinaScaling: true,
            backgroundColor: '#2f2f2f'  // Same background as main app
        });

        // Create demo CanvasGlobals for SymbolObject compatibility
        DemoCanvasGlobals = {
            canvas: demoCanvas,
            ctx: demoCanvas.getContext("2d"),
            activeObject: demoActiveObject,
            activeVertex: null,
            canvasObject: demoCanvasObject,
            CenterCoord: function () { return { x: 0, y: 0 }; } // Simplified center coordinate function
        };


        // Temporarily set global CanvasGlobals for SymbolObject creation (if needed)
        const originalCanvasGlobals = window.CanvasGlobals;
        window.CanvasGlobals = DemoCanvasGlobals;

        // Set up responsive canvas sizing
        resizeDemoCanvas();

        // Add debounced resize listener for better performance
        let resizeTimeout;
        const debouncedResize = () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(resizeDemoCanvas, 150);
        };
        window.addEventListener('resize', debouncedResize);

        // Set initial zoom similar to main app
        demoCanvas.setZoom(0.4);

        // Center the canvas view
        demoCanvas.absolutePan({ x: -demoCanvas.width / 2, y: -demoCanvas.height / 2 });

        // Add grid to match main app
        drawDemoGrid();

        // Set canvas to render all changes
        demoCanvas.renderAll();
        // Hide the placeholder overlay since we now have a real canvas
        const placeholderOverlay = document.getElementById('demo-placeholder-overlay');
        if (placeholderOverlay) {
            placeholderOverlay.style.display = 'none';
        }

        // Test symbol template availability
        import('./objects/template.js').then(module => {
            console.log('Template module loaded, checking StackArrow...');
            if (module.symbolsTemplate && module.symbolsTemplate.StackArrow) {
                console.log('✓ StackArrow template found:', module.symbolsTemplate.StackArrow);
            } else {
                console.error('✗ StackArrow template not found in symbolsTemplate');
            }
        }).catch(err => {
            console.error('Error loading template module:', err);
        });

        console.log('Demo canvas initialized successfully');
        return demoCanvas;
    } catch (error) {
        console.error('Error initializing demo canvas:', error);
        return null;
    }
}

function drawDemoGrid() {
    // Simplified grid drawing based on main app's DrawGrid function
    const corners = demoCanvas.calcViewportBoundaries();
    const xmin = corners.tl.x;
    const xmax = corners.br.x;
    const ymin = corners.tl.y;
    const ymax = corners.br.y;
    const zoom = demoCanvas.getZoom();

    const gridDistance = 50; // Fixed grid distance for demo
    const gridColor = DemoSettings.gridColor;

    const gridSet = [];

    // Create grid lines
    const options = {
        stroke: gridColor,
        strokeWidth: 0.1 / zoom,
        selectable: false
    };

    // Vertical lines
    for (let x = Math.floor(xmin / gridDistance) * gridDistance; x <= xmax; x += gridDistance) {
        const vertical = new fabric.Line([x, ymin, x, ymax], options);
        gridSet.push(vertical);
    }

    // Horizontal lines
    for (let y = Math.floor(ymin / gridDistance) * gridDistance; y <= ymax; y += gridDistance) {
        const horizontal = new fabric.Line([xmin, y, xmax, y], options);
        gridSet.push(horizontal);
    }

    // Origin lines (0, 0)
    const originLineX = new fabric.Line([0, ymin, 0, ymax], {
        stroke: '#ffffff',
        strokeWidth: 0.5 / zoom,
        selectable: false
    });
    const originLineY = new fabric.Line([xmin, 0, xmax, 0], {
        stroke: '#ffffff',
        strokeWidth: 0.5 / zoom,
        selectable: false
    });
    gridSet.push(originLineX);
    gridSet.push(originLineY);

    // Remove existing grid
    const existingGrid = demoCanvas.getObjects().find(obj => obj.id === 'demo-grid');
    if (existingGrid) demoCanvas.remove(existingGrid);

    // Add new grid
    const gridGroup = new fabric.Group(gridSet, {
        id: 'demo-grid',
        selectable: false,
        evented: false
    });
    demoCanvas.add(gridGroup);
    demoCanvas.sendObjectToBack(gridGroup);
}

function createDemoSymbol() {
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
            { x: -100, y: 100, label: 'V9', start: 0, display: 0 },
        ], {
            fill: '#ffffff',
            strokeWidth: 0,
            left: -150,
            top: 100,
            originX: 'center',
            originY: 'center',
            selectable: true,
            hasControls: false,
            hasBorders: true,
            cornerStyle: 'circle',
            borderColor: '#3b82f6',
            cornerColor: '#3b82f6'
        });

        demoCanvas.add(triangle);
        demoCanvas.setActiveObject(triangle);
        demoCanvas.renderAll();
        demoCanvasObject.push(triangle);

        console.log('Demo fallback symbol created');
    }
    catch (error) {
        console.error('Error creating demo symbol:', error);
    }

}



function createDemoText() {
    if (!demoCanvas) {
        console.error('Demo canvas not initialized');
        return;
    }

    try {
        // Create more realistic highway sign text with proper styling
        fabric.loadSVGFromURL('./images/demo-text.svg').then((results) => {
            const textGroup = new fabric.Group([], {
                left: -150,
                top: 100,
                originX: 'center',
                originY: 'center',
                selectable: true,
                hasControls: false,
                hasBorders: true,
                cornerStyle: 'circle',
                borderColor: '#3b82f6',
                cornerColor: '#3b82f6'
            })
            textGroup.add(...(results.objects.filter((obj) => !!obj)))

            demoCanvas.add(textGroup);
            demoCanvas.setActiveObject(textGroup);
            demoCanvas.renderAll();
            demoCanvasObject.push(textGroup);
        });

    } catch (error) {
        console.error('Error creating demo text:', error);
    }
}

function createDemoBorder() {
    if (!demoCanvas) {
        console.error('Demo canvas not initialized');
        return;
    }

    try {
        // Create a realistic sign border frame
        const outerBorder = new fabric.Rect({
            width: 420,
            height: 280,
            fill: 'transparent',
            stroke: '#dc2626',
            strokeWidth: 6,
            strokeDashArray: [],
            rx: 12,
            ry: 12,
            left: 90,
            top: 60,
            selectable: true,
            hasControls: true,
            hasBorders: true,
            cornerStyle: 'circle',
            borderColor: '#3b82f6',
            cornerColor: '#3b82f6'
        });

        const innerBorder = new fabric.Rect({
            width: 380,
            height: 240,
            fill: 'transparent',
            stroke: '#ffffff',
            strokeWidth: 2,
            rx: 8,
            ry: 8,
            left: 110,
            top: 80,
            selectable: false,
            evented: false
        });

        // Group the borders together
        const borderGroup = new fabric.Group([outerBorder, innerBorder], {
            left: 90,
            top: 60,
            selectable: true,
            hasControls: true,
            hasBorders: true,
            cornerStyle: 'circle',
            borderColor: '#3b82f6',
            cornerColor: '#3b82f6'
        });

        demoCanvas.add(borderGroup);
        demoCanvas.setActiveObject(borderGroup);
        demoCanvas.renderAll();
        demoCanvasObject.push(borderGroup);
    } catch (error) {
        console.error('Error creating demo border:', error);
    }
}

function simulateDemoDrag() {
    if (!demoCanvas) {
        console.error('Demo canvas not initialized');
        return;
    }

    try {
        // Get the last added object and animate it
        if (demoCanvasObject.length > 0) {
            const lastObject = demoCanvasObject[demoCanvasObject.length - 1];
            demoCanvas.setActiveObject(lastObject);

            // Animate the object movement with smooth transitions
            const originalLeft = lastObject.left;
            const originalTop = lastObject.top;

            // Create a more realistic drag path
            const animationDuration = 800;

            // First movement - right and slightly up
            lastObject.animate({
                left: originalLeft + 80,
                top: originalTop - 20
            }, {
                duration: animationDuration,
                onChange: demoCanvas.renderAll.bind(demoCanvas),
                easing: fabric.util.ease.easeInOutQuad,
                onComplete: () => {
                    // Second movement - down and left
                    lastObject.animate({
                        left: originalLeft - 40,
                        top: originalTop + 60
                    }, {
                        duration: animationDuration,
                        onChange: demoCanvas.renderAll.bind(demoCanvas),
                        easing: fabric.util.ease.easeInOutQuad,
                        onComplete: () => {
                            // Return to original position
                            lastObject.animate({
                                left: originalLeft,
                                top: originalTop
                            }, {
                                duration: animationDuration,
                                onChange: demoCanvas.renderAll.bind(demoCanvas),
                                easing: fabric.util.ease.easeInOutBack
                            });
                        }
                    });
                }
            });
        } else {
            // If no objects exist, create a draggable arrow marker
            const arrow = new fabric.Path('M 10 0 L 0 10 L 5 10 L 5 25 L 15 25 L 15 10 L 20 10 Z', {
                fill: '#f59e0b',
                stroke: '#92400e',
                strokeWidth: 2,
                left: 200,
                top: 120,
                scaleX: 2,
                scaleY: 2,
                selectable: true,
                hasControls: true,
                hasBorders: true,
                cornerStyle: 'circle',
                borderColor: '#3b82f6',
                cornerColor: '#3b82f6'
            });

            demoCanvas.add(arrow);
            demoCanvas.setActiveObject(arrow);
            demoCanvas.renderAll();
            demoCanvasObject.push(arrow);

            // Auto-animate the new arrow
            setTimeout(() => {
                simulateDemoDrag();
            }, 500);
        }
    } catch (error) {
        console.error('Error in demo drag simulation:', error);
    }
}

function resetDemoCanvas() {
    // Clear all demo objects except grid
    demoCanvasObject.forEach(obj => {
        demoCanvas.remove(obj);
    });
    demoCanvasObject = [];

    // Clear active selection
    demoCanvas.discardActiveObject();
    demoCanvas.renderAll();

    // Redraw grid to ensure it's still there
    drawDemoGrid();
}

function resizeDemoCanvas() {
    if (!demoCanvas) return;

    try {
        const canvasContainer = document.querySelector('.demo-sign-canvas');
        if (!canvasContainer) return;

        const containerWidth = canvasContainer.clientWidth;
        const containerHeight = canvasContainer.clientHeight;

        // Set canvas dimensions to match container
        demoCanvas.setDimensions({
            width: containerWidth,
            height: containerHeight
        });

        // Re-center the view
        demoCanvas.absolutePan({ x: -demoCanvas.width / 2, y: -demoCanvas.height / 2 });

        // Redraw grid with new dimensions
        drawDemoGrid();

        // Re-render canvas
        demoCanvas.renderAll();

        console.log(`Demo canvas resized to: ${containerWidth}x${containerHeight}`);
    } catch (error) {
        console.error('Error resizing demo canvas:', error);
    }
}

// Export demo canvas functions for use in homepage.js
export const DemoCanvas = {
    init: initDemoCanvas,
    createSymbol: createDemoSymbol,
    createText: createDemoText,
    createBorder: createDemoBorder,
    simulateDrag: simulateDemoDrag,
    reset: resetDemoCanvas,
    resize: resizeDemoCanvas,
    canvas: () => demoCanvas
};
