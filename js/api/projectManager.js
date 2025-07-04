// Production-ready API integration for Google Cloud Platform
class ProjectManager {
  constructor() {
    // Use Google Cloud App Engine services
    this.baseURL = process.env.NODE_ENV === 'production' 
      ? 'https://api-dot-roadsignfactory.appspot.com/api'  // App Engine API service URL
      : 'http://localhost:3000/api';
    this.token = localStorage.getItem('authToken');
    this.refreshToken = localStorage.getItem('refreshToken');
  }

  async login(email, password) {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      if (response.ok) {
        const { token, refreshToken, user } = await response.json();
        localStorage.setItem('authToken', token);
        localStorage.setItem('refreshToken', refreshToken);
        this.token = token;
        this.refreshToken = refreshToken;
        return { success: true, user };
      }
      
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  async refreshAuthToken() {
    if (!this.refreshToken) return false;
    
    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: this.refreshToken })
      });
      
      if (response.ok) {
        const { token } = await response.json();
        localStorage.setItem('authToken', token);
        this.token = token;
        return true;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
    }
    
    this.logout();
    return false;
  }

  async makeAuthenticatedRequest(url, options = {}) {
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`,
      ...options.headers
    };

    let response = await fetch(url, { ...options, headers });
    
    // If unauthorized, try to refresh token once
    if (response.status === 401 && await this.refreshAuthToken()) {
      headers['Authorization'] = `Bearer ${this.token}`;
      response = await fetch(url, { ...options, headers });
    }
    
    return response;
  }

  logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    this.token = null;
    this.refreshToken = null;
  }

  async saveProject(projectData, projectName) {
    try {
      // Reuse your existing JSON export functionality
      const jsonData = FormExportComponent.exportCanvasToJSON(false);
      const thumbnail = await this.generateThumbnail();
      
      const response = await this.makeAuthenticatedRequest(`${this.baseURL}/projects`, {
        method: 'POST',
        body: JSON.stringify({
          name: projectName,
          data: jsonData,
          thumbnail: thumbnail,
          metadata: {
            version: process.env.APP_VERSION || '1.2.2',
            createdAt: new Date().toISOString(),
            canvasObjects: CanvasGlobals.canvasObject.length
          }
        })
      });

      if (response.ok) {
        const project = await response.json();
        return { success: true, project };
      }
      
      const errorData = await response.json();
      return { success: false, error: errorData.message || 'Save failed' };
    } catch (error) {
      console.error('Save project error:', error);
      return { success: false, error: 'Network error occurred' };
    }
  }

  async updateProject(projectId, projectData, projectName) {
    try {
      const jsonData = FormExportComponent.exportCanvasToJSON(false);
      const thumbnail = await this.generateThumbnail();
      
      const response = await this.makeAuthenticatedRequest(`${this.baseURL}/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify({
          name: projectName,
          data: jsonData,
          thumbnail: thumbnail,
          metadata: {
            version: process.env.APP_VERSION || '1.2.2',
            updatedAt: new Date().toISOString(),
            canvasObjects: CanvasGlobals.canvasObject.length
          }
        })
      });

      return { success: response.ok };
    } catch (error) {
      console.error('Update project error:', error);
      return { success: false, error: 'Update failed' };
    }
  }

  async loadProject(projectId) {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseURL}/projects/${projectId}`);
      
      if (response.ok) {
        const project = await response.json();
        // Reuse your existing import functionality
        const projectData = typeof project.data === 'string' 
          ? JSON.parse(project.data) 
          : project.data;
        
        await FormExportComponent._applyJSONToCanvas(projectData);
        return { success: true, project };
      }
      
      return { success: false, error: 'Project not found' };
    } catch (error) {
      console.error('Load project error:', error);
      return { success: false, error: 'Failed to load project' };
    }
  }

  async deleteProject(projectId) {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseURL}/projects/${projectId}`, {
        method: 'DELETE'
      });
      
      return { success: response.ok };
    } catch (error) {
      console.error('Delete project error:', error);
      return { success: false, error: 'Delete failed' };
    }
  }

  async getUserProjects(page = 1, limit = 20) {
    try {
      const response = await this.makeAuthenticatedRequest(
        `${this.baseURL}/projects?page=${page}&limit=${limit}`
      );
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, projects: data.projects, pagination: data.pagination };
      }
      
      return { success: false, projects: [] };
    } catch (error) {
      console.error('Get projects error:', error);
      return { success: false, projects: [] };
    }
  }

  async shareProject(projectId, shareSettings) {
    try {
      const response = await this.makeAuthenticatedRequest(`${this.baseURL}/projects/${projectId}/share`, {
        method: 'POST',
        body: JSON.stringify(shareSettings)
      });
      
      if (response.ok) {
        const shareData = await response.json();
        return { success: true, shareUrl: shareData.shareUrl };
      }
      
      return { success: false, error: 'Share failed' };
    } catch (error) {
      console.error('Share project error:', error);
      return { success: false, error: 'Share failed' };
    }
  }

  async generateThumbnail() {
    try {
      // Generate canvas thumbnail for project preview
      const originalState = FormExportComponent.prepareCanvasForExport();
      
      // Create a smaller canvas for thumbnail
      const thumbnailCanvas = document.createElement('canvas');
      thumbnailCanvas.width = 200;
      thumbnailCanvas.height = 150;
      const ctx = thumbnailCanvas.getContext('2d');
      
      // Get the main canvas as image
      const mainCanvas = CanvasGlobals.canvas.getElement();
      ctx.drawImage(mainCanvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
      
      FormExportComponent.restoreCanvasAfterExport(originalState);
      
      // Convert to base64 with compression
      return thumbnailCanvas.toDataURL('image/jpeg', 0.7);
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      return null;
    }
  }

  // Auto-save functionality
  startAutoSave(interval = 300000) { // Default 5 minutes
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    
    this.autoSaveInterval = setInterval(async () => {
      if (this.token && this.currentProjectId) {
        await this.autoSaveProject();
      }
    }, interval);
  }

  stopAutoSave() {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = null;
    }
  }

  async autoSaveProject() {
    if (!this.currentProjectId) return;
    
    try {
      const result = await this.updateProject(this.currentProjectId, null, this.currentProjectName);
      if (result.success) {
        console.log('Auto-saved project');
        // Show subtle notification
        this.showAutoSaveNotification();
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  showAutoSaveNotification() {
    // Integrate with your existing toast system
    if (typeof GeneralHandler !== 'undefined' && GeneralHandler.showToast) {
      GeneralHandler.showToast('Auto-saved', 'success');
    }
  }
}

export { ProjectManager };
