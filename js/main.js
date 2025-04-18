// Main entry point for modular loading in development/production
// Import canvas.js as a classic script to ensure global variables are set up
import '../js/canvas.js';
// Import all objects modules (these will use the global canvas)
import '../js/objects/path.js';
import '../js/objects/vertexKeyNav.js';
import '../js/objects/draw.js';
import '../js/objects/template.js';
import '../js/objects/symbols.js';
import '../js/objects/text.js';
import '../js/objects/route.js';
import '../js/objects/border.js';
import '../js/objects/divider.js';
// Import anchor and tracker logic if needed
import '../js/anchor.js';
import '../js/canvasTracker.js';
// Import sidebar logic (UI, event handlers)
import '../js/sidebar/sidebar.js';
// Import any additional utilities or test logic
import '../js/test.js';
import '../js/tooltip.js';

// If you need to ensure globals are available for legacy code, you can re-export them here
// (for example, for use in modules that import main.js)
export * from '../js/canvas.js';
