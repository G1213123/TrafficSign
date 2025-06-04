// Demo Snap - Updated to use custom control classes
import { SnapControl, SnapTargetControl } from './demo-snap-controls.js';

let demoSnapState = {
    snapControl: null,
    snapTargetControl: null,
    symbolObject: null,
    textObject: null,
    snapCompleted: false // Track if applySpacing was called
};

// Make snap state globally accessible for automated snap
window.demoSnapState = demoSnapState;

function simulateDemoSnap(demoCanvas, demoCanvasObject) {
    if (!demoCanvas) {
        console.error('Demo canvas not initialized');
        return;
    }

    try {
        // Clean up any existing snap state
        cleanupDemoSnap();

        // Reset snap completion flag
        demoSnapState.snapCompleted = false;

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
        demoSnapState.textObject = textObj;        // Create snap target control (green circle) on text's top-left
        const textBounds = textObj.getBoundingRect();
        demoSnapState.snapTargetControl = new SnapTargetControl(
            textBounds.left,
            textBounds.top,
            demoCanvas,
            'Text Top-Left Corner'
        );

        // Create snap control (yellow circle) on symbol's top-right with reference to target
        const symbolBounds = symbolObj.getBoundingRect();
        const snapControlX = symbolBounds.left + symbolBounds.width;
        const snapControlY = symbolBounds.top;
          demoSnapState.snapControl = new SnapControl(
            snapControlX, 
            snapControlY, 
            demoCanvas, 
            symbolObj,
            demoCanvasObject,
            demoSnapState.snapTargetControl,
            textObj,
        );

        console.log('Demo snap initialized with control classes');

    } catch (error) {
        console.error('Error in demo snap simulation:', error);
    }
}

function cleanupDemoSnap() {
    if (demoSnapState.snapControl) {
        demoSnapState.snapControl.cleanup();
        demoSnapState.snapControl = null;
    }
    
    // Target control is cleaned up by snap control, just reset reference
    demoSnapState.snapTargetControl = null;

    // Reset state
    demoSnapState = {
        snapControl: null,
        snapTargetControl: null,
        symbolObject: null,
        textObject: null
    };

    console.log('Demo snap cleaned up');
}

function executeAutomatedSnap(demoCanvasObject, onComplete) {
    // Wait a moment for the snap control to be set up
    setTimeout(async () => {
        // Use the local demoSnapState since it's in this module
        if (demoSnapState && demoSnapState.snapControl) {
            const snapControl = demoSnapState.snapControl;

            // Simulate the snap target being found
            if (snapControl.targetControl) {
                snapControl.snapTarget = snapControl.targetControl.circle;

                // Apply default spacing values automatically
                snapControl.applySpacing('-2', '1.7', demoCanvasObject);
                console.log('Automated snap completed with default values');

                // Clean up snap control
                snapControl.cleanup();

                // Call the completion callback to advance stage
                if (onComplete) {
                    onComplete();
                }
            }
        }
    }, 500);
}

// Export the functions
export { simulateDemoSnap, cleanupDemoSnap, executeAutomatedSnap };


