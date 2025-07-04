// Enhanced save functionality for your existing FormExportComponent
const CloudIntegration = {
  // Add to your existing FormExportComponent
  enhanceExportComponent: function() {
    const originalExportPanel = FormExportComponent.exportPanelInit;
    
    FormExportComponent.exportPanelInit = function(parent) {
      // Call original panel creation
      originalExportPanel.call(this, parent);
      
      // Add cloud save section if user is logged in
      if (window.ProjectManager && window.ProjectManager.token) {
        CloudIntegration.addCloudSaveSection(parent);
      } else {
        CloudIntegration.addLoginSection(parent);
      }
    };
  },

  addCloudSaveSection: function(parent) {
    const cloudContainer = GeneralHandler.createNode("div", { 'class': 'cloud-section' }, parent);
    
    // Quick save button
    GeneralHandler.createButton('quick-save', 'Quick Save to Cloud', cloudContainer, 'input',
      () => CloudIntegration.quickSave(), 'click');
    
    // Save as new button
    GeneralHandler.createButton('save-as-new', 'Save as New Project', cloudContainer, 'input',
      () => CloudIntegration.saveAsNew(), 'click');
    
    // Load project button
    GeneralHandler.createButton('load-project', 'Load Project', cloudContainer, 'input',
      () => CloudIntegration.showProjectList(), 'click');
  },

  addLoginSection: function(parent) {
    const loginContainer = GeneralHandler.createNode("div", { 'class': 'login-section' }, parent);
    loginContainer.innerHTML = `
      <h4>💾 Save to Cloud</h4>
      <p>Sign in to save your projects online and access them anywhere!</p>
      <button onclick="CloudIntegration.showLoginModal()" class="btn btn-primary">
        Sign In / Register
      </button>
    `;
  },

  async quickSave() {
    const projectName = prompt('Project name:', 'Traffic Sign ' + new Date().toLocaleDateString());
    if (projectName) {
      const result = await window.ProjectManager.saveProject(null, projectName);
      if (result.success) {
        GeneralHandler.showToast('Saved to cloud!', 'success');
      } else {
        GeneralHandler.showToast('Save failed: ' + result.error, 'error');
      }
    }
  }
};

// Auto-enhance when export component loads
document.addEventListener('DOMContentLoaded', () => {
  CloudIntegration.enhanceExportComponent();
});

export { CloudIntegration };
