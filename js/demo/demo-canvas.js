/**
 * Demo Canvas - Simplified version of main app canvas for homepage demonstration
 * Uses the same codebase patterns as canvas.js but simplified for demo purposes
 */

import { createDemoSymbol } from './demo-symbols.js';
import { createDemoText } from './demo-text.js';
import { simulateDemoSnap, executeAutomatedSnap } from './demo-snap.js';
import { createDemoBorder } from './demo-border.js';

// Demo Canvas Setup - Mirror main app canvas initialization
let demoCanvas = null;
let demoActiveObject = null;
let demoCanvasObject = [];

// Demo CanvasGlobals - Mirror the structure from canvas.js for SymbolObject compatibility
let DemoCanvasGlobals = null;

// Progressive demo state tracking
let demoStage = 0; // 0: initial, 1: symbol, 2: text, 3: snap, 4: border
const demoStages = ['symbol', 'text', 'snap', 'border'];
let executedStages = new Set(); // Track which stages have been executed

// Settings for demo (simplified version of GeneralSettings)
const DemoSettings = {
    showGrid: true,
    gridColor: '#ffffff',
    gridSize: 20
};

// Demo interactions
function initDemoInteractions() {
    // Wait for DOM to be fully loaded and then initialize the demo canvas
    setTimeout(() => {
        if (DemoCanvas && document.getElementById('demo-canvas')) {
            try {
                DemoCanvas.init();
                console.log('Demo canvas initialized successfully');
            } catch (error) {
                console.error('Error initializing demo canvas:', error);
            }
        } else {
            console.warn('Demo canvas or DemoCanvas object not available');
        }
    }, 100);
    const demoButtons = document.querySelectorAll('.demo-btn');
    demoButtons.forEach(button => {
        button.addEventListener('click', function () {
            const demoType = this.dataset.demo;
            handleProgressiveDemo(demoType, demoButtons);
        });
    });

    // Initialize button states
    setTimeout(() => {
        updateButtonStates(demoButtons);
    }, 100);
}

// Execute demo actions using real canvas
function executeDemo(type) {
    if (!DemoCanvas) {
        console.warn('DemoCanvas not available');
        return;
    }

    try {
        switch (type) {
            case 'symbol':
                createDemoSymbol(demoCanvas, demoCanvasObject);
                console.log('Demo symbol created');
                break;
            case 'text':
                createDemoText(demoCanvas, demoCanvasObject);
                console.log('Demo text created');
                break;
            case 'snap':
                simulateDemoSnap(demoCanvas, demoCanvasObject);
                console.log('Demo snap simulation started');
                break;
            case 'border':
                createDemoBorder(demoCanvas, demoCanvasObject);
                console.log('Demo border created');
                break;
            case 'reset':
                DemoCanvas.reset();
                console.log('Demo canvas reset');
                break;
            default:
                console.warn('Unknown demo type:', type);
        }
    } catch (error) {
        console.error('Error executing demo:', error);
    }
}

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
        import('../objects/template.js').then(module => {
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



function resetDemoCanvas() {
    // Deactivate vertex mode first
    //deactivateDemoVertexMode();

    // Clear all demo objects except grid
    demoCanvasObject.forEach(obj => {
        demoCanvas.remove(obj);
    });
    demoCanvasObject = []; // Clear array while maintaining reference

    // Reset demo stage and executed stages
    demoStage = 0;
    executedStages.clear();

    // Reset button states
    const demoButtons = document.querySelectorAll('.demo-btn');
    demoButtons.forEach(btn => {
        btn.classList.remove('active', 'completed', 'disabled', 'current');
    });
    updateButtonStates(demoButtons);

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

// Progressive demo system
function handleProgressiveDemo(requestedType, demoButtons) {
    if (!DemoCanvas) {
        console.warn('DemoCanvas not available');
        return;
    }

    // Handle reset - always allowed
    if (requestedType === 'reset') {
        executeDemo('reset');
        return;
    }

    const requestedStageIndex = demoStages.indexOf(requestedType);

    // If requesting a stage that's already completed, re-execute it
    if (requestedStageIndex < demoStage) {
        executeDemo(requestedType);
        return;
    }

    // If requesting the current stage, execute it and advance
    if (requestedStageIndex === demoStage) {
        executeDemo(requestedType);
        executedStages.add(requestedType);
        if (requestedType === 'border') {
            const textObject = demoCanvasObject.filter(obj => { obj.functionType == 'text' })
            const symbolObject = demoCanvasObject.filter(obj => { obj.functionType == 'symbol' })
            if (textObject.length > 0 && symbolObject.length > 0) {
                // For snap, trigger automated completion
                executeAutomatedSnap(demoCanvasObject, () => {
                    demoStage++;
                    const demoButtons = document.querySelectorAll('.demo-btn');
                    updateButtonStates(demoButtons);
                });
            }
            demoStage++;
            updateButtonStates(demoButtons);
        } else {
            // For drag & drop stages (symbol, text, border), advance immediately
            demoStage++;
            updateButtonStates(demoButtons);
        }
        return;
    }

    // If requesting a future stage, do nothing (button is disabled)
    console.log(`Stage ${requestedType} is not yet available. Complete previous stages first.`);
}

function updateButtonStates(demoButtons) {
    demoButtons.forEach((button, index) => {
        const buttonType = button.dataset.demo;

        // Reset button is always available
        if (buttonType === 'reset') {
            button.classList.remove('disabled', 'completed', 'active', 'current');
            return;
        }

        const stageIndex = demoStages.indexOf(buttonType);

        if (stageIndex < demoStage) {
            // Completed stages - greyed out
            button.classList.add('completed');
            button.classList.remove('active', 'disabled', 'current');
        } else if (stageIndex === demoStage) {
            // Current stage - white if not executed, blue if executed
            if (executedStages.has(buttonType)) {
                button.classList.add('active');
                button.classList.remove('completed', 'disabled', 'current');
            } else {
                button.classList.add('current');
                button.classList.remove('active', 'completed', 'disabled');
            }
        } else {
            // Future stages - disabled
            button.classList.add('disabled');
            button.classList.remove('active', 'completed', 'current');
        }
    });
}

// Export demo canvas functions for use in homepage.js
export const DemoCanvas = {
    init: initDemoCanvas,
    initInteractions: initDemoInteractions,
    createSymbol: () => createDemoSymbol(demoCanvas, demoCanvasObject),
    createText: () => createDemoText(demoCanvas, demoCanvasObject),
    createBorder: () => createDemoBorder(demoCanvas, demoCanvasObject),
    simulateSnap: () => simulateDemoSnap(demoCanvas, demoCanvasObject),
    reset: resetDemoCanvas,
    resize: resizeDemoCanvas,
    canvas: () => demoCanvas
};
