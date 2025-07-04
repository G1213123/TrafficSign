// Add to your existing main.js imports
import { ProjectManager } from './api/projectManager.js';
import { CloudSaveComponent } from './api/cloudSave.js';

// Initialize cloud functionality after your existing preload
async function initializeCloudFeatures() {
  const projectManager = new ProjectManager();
  const cloudSave = CloudSaveComponent;
  
  cloudSave.init();
  
  // Make available globally for other components
  window.ProjectManager = projectManager;
  window.CloudSave = cloudSave;
}

// Add to your preload function
preload().then(() => {
  initializeCloudFeatures();
});
