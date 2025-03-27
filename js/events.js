/**
 * Event handlers for sidebar buttons
 */

// Show hide sidebar event (Keyboard shortcut)
function ShowHideSideBarEvent(e) {
    if (e.key == 'h') {
        GeneralHandler.ShowHideSideBar()
    }
}

// Add event listeners when document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Set up sidebar button events
    document.getElementById('btn_text').addEventListener('click', function() {
        FormTextAddComponent.textPanelInit();
    });
    
    document.getElementById('btn_draw').addEventListener('click', function() {
        FormDrawAddComponent.drawPanelInit();
    });
    
    document.getElementById('btn_border').addEventListener('click', function() {
        FormBorderWrapComponent.BorderPanelInit();
    });
    
    document.getElementById('btn_map').addEventListener('click', function() {
        FormDrawMapComponent.drawMapPanelInit();
    });
    
    document.getElementById('btn_export').addEventListener('click', function() {
        FormExportComponent.exportPanelInit();
    });
    
    document.getElementById('btn_tracker').addEventListener('click', function() {
        const trackerUI = new CanvasTrackerUI();
        trackerUI.initialize();
    });
    
    document.getElementById('btn_debug').addEventListener('click', function() {
        FormDebugComponent.DebugPanelInit();
    });
    
    document.getElementById('btn_settings').addEventListener('click', function() {
        FormSettingsComponent.settingsPanelInit();
    });

    FormSettingsComponent.loadSettings();
    
    document.getElementById('show_hide').addEventListener('click', function() {
        GeneralHandler.ShowHideSideBar();
    });
    
    // Add keyboard event listener for sidebar toggle
    document.addEventListener('keydown', ShowHideSideBarEvent);
    
    // Add context menu event handlers
    document.getElementById('set-anchor').addEventListener('click', function() {
        useAnchorSelectionMode();
    });
});