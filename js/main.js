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
import { FirebaseService } from './services/firebase.js';

/**
 * Handles loading data from URL parameters and fetching from Firestore
 */
async function handleUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const fileId = params.get('fileId');

  if (fileId) {
    console.log(`Cloud Load triggered: File ${fileId}`);
    try {
      const jsonData = await FirebaseService.getSign(fileId);
      if (jsonData) {
        await importSignData(jsonData);
      }
    } catch (error) {
      console.error('Failed to load sign from cloud:', error);
      // Optional: Redirect to login or show error modal
    }
  }
}

/**
 * Bridges the fetched JSON data to the existing build system
 */
async function importSignData(data) {
// ...existing code...

  // The buildObjectsFromJSON function expects an array of objects or JSON strings
  // If the Firestore document stores the sign as an array of objects:
  if (Array.isArray(data)) {
    // We need to make sure buildObjectsFromJSON is accessible. 
    // Since it's in build.js, we might need to export it or use a global.
    if (window.buildObjectsFromJSON) {
      await window.buildObjectsFromJSON(data);
    } else {
      console.error('buildObjectsFromJSON is not available globally');
    }
  } else {
    console.error('Invalid sign data format: Expected an array');
  }
}

preload().then(() => {
  handleUrlParams();
});
