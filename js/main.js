// Main entry point for modular loading in development/production
// Import canvas.js as a classic script to ensure global variables are set up
import './canvas.js'; // Corrected path

// Import necessary functions and modules
import { parseFont } from './objects/path.js'; // Import parseFont specifically
import { FormDrawAddComponent } from './sidebar/sb-draw.js'; // Import FormDrawAddComponent specifically

// Import other objects modules (these will use the global canvas)
// import './objects/path.js'; // Removed generic import, using specific above
import './objects/vertexKeyNav.js'; // Corrected path
import './objects/draw.js'; // Corrected path
import './objects/template.js'; // Corrected path
import './objects/symbols.js'; // Corrected path
import './objects/text.js'; // Corrected path
import './objects/route.js'; // Corrected path
import './objects/border.js'; // Corrected path
import './objects/divider.js'; // Corrected path
// Import anchor and tracker logic if needed
import './objects/anchor.js'; // Corrected path
import './canvasTracker.js'; // Corrected path
// Import sidebar logic (UI, event handlers)
import './sidebar/sidebar.js'; // Corrected path
// Import any additional utilities or test logic
import './test.js'; // Corrected path
import './tooltip.js'; // Corrected path

// If you need to ensure globals are available for legacy code, you can re-export them here
// (for example, for use in modules that import main.js)
// export * from './canvas.js'; // Corrected path, uncomment if needed

// --- Initialization ---
// Use an async IIFE to handle the font loading promise
(async () => {
    try {
        console.log("Initializing application, parsing fonts...");
        // Show a loading indicator here if desired
        await parseFont(); // Call parseFont and wait for it to complete
        FormDrawAddComponent.drawPanelInit(); // Initialize Draw panel by default
        console.log("Fonts parsed successfully. Application ready.");
        // Hide loading indicator here
        // Any initialization code that depends on fonts being loaded can go here.
        // For example, trigger initial drawing or enable UI elements.

    } catch (error) {
        console.error("Failed to initialize application due to font loading error:", error);
        // Handle the error appropriately, e.g., show an error message to the user.
    }
})(); // Immediately invoke the async function
