
// Import necessary functions and modules
import { parseFont } from './objects/path.js'; // Import parseFont specifically
import { FormDrawAddComponent } from './sidebar/sb-draw.js'; // Import FormDrawAddComponent specifically
import { FormSettingsComponent } from './sidebar/sb-settings.js'; // Import FormSettingsComponent specifically
import { FormTextAddComponent } from './sidebar/sb-text.js'; // Import FormTextAddComponent for initialization
import { DrawGrid } from './canvas/canvas.js'; // Import DrawGrid if needed
import { activatePanelFromHash } from './sidebar/sidebar.js'; // Import activatePanelFromHash if needed
import { i18n } from './i18n/i18n.js';


// --- Initialization ---
// Use an async IIFE to handle the font loading promise
async function preload() {
    try {
        console.log("Initializing application, parsing fonts...");
        // Show a loading indicator here if desired
        await parseFont(); // Call parseFont and wait for it to complete
        DrawGrid(); // Initialize grid drawing
        activatePanelFromHash(); // Initialize Draw panel by default
        console.log("Fonts parsed successfully. Application ready.");
        // Hide loading indicator here
        // Any initialization code that depends on fonts being loaded can go here.        await FormSettingsComponent.loadSettings();
        await FormSettingsComponent.loadCanvasState();
        await FormSettingsComponent.loadSettings();

        // Initialize i18n locale from saved settings (if available)
        try {
            const savedSettings = localStorage.getItem('appSettings');
            const locale = savedSettings ? (JSON.parse(savedSettings).locale || 'en') : 'en';
            i18n.setLocale(locale);
            i18n.applyTranslations(document);
        } catch (_) {
            i18n.setLocale('en');
            i18n.applyTranslations(document);
        }

        // Initialize text component settings listener after all modules are loaded
        FormTextAddComponent.initializeSettingsListener();

        window.jsPDF = window.jspdf.jsPDF; // Ensure jsPDF is available globally if needed
        paper.install(window); // Install paper.js into the global window object
        paper.setup(new paper.Size(1, 1)); // creates a virtual canvas
        paper.view.autoUpdate = false; // disables drawing any shape automatically

        setTimeout(function () {
            document.getElementById('loading-overlay').style.display = 'none';
        }, 1000); // 3 second backup timeout



    } catch (error) {
        console.error("Failed to initialize application due to font loading error:", error);
        // Handle the error appropriately, e.g., show an error message to the user.
    }
}

export { preload }; // Export the preload function for use in other modules if needed