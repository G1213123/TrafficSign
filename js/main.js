// Import canvas.js as a classic script to ensure global variables are set up
import './canvas/canvas.js';
import './canvas/keyboardEvents.js'
import './canvas/mouseEvents.js';
import './canvas/touchEvents.js';

// Import other objects modules (these will use the global canvas)
// import './objects/path.js'; // Removed generic import, using specific above
import './objects/vertex.js';
import './objects/draw.js';
import './objects/template.js';
import './objects/symbols.js';
import './objects/text.js';
import './objects/routeBase.js';
import './objects/mainRoute.js';
import './objects/sideRoute.js';
import './objects/border.js';
import './objects/divider.js';
// Import anchor and tracker logic if needed
import './objects/anchor.js';
import './canvas/Tracker.js';
// Import sidebar logic (UI, event handlers)
import './sidebar/sidebar.js';
// Import any additional utilities or test logic
import './tests/test.js';
import './sidebar/tooltip.js';
import './sidebar/property.js';

import { preload } from './preload.js';

// If you need to ensure globals are available for legacy code, you can re-export them here
// (for example, for use in modules that import main.js)
// export * from './canvas.js'; , uncomment if needed

preload(); // Call the preload function to start the initialization process
