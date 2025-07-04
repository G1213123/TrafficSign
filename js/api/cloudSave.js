// Enhanced export component with cloud save functionality
import { ProjectManager } from '../api/projectManager.js';

const CloudSaveComponent = {
  projectManager: null,
  currentUser: null,

  init: function() {
    this.projectManager = new ProjectManager();
    this.checkAuthStatus();
  },

  checkAuthStatus: function() {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Validate token and get user info
      this.getCurrentUser();
    }
  },

  async getCurrentUser() {
    try {
      const response = await fetch(`${this.projectManager.baseURL}/auth/me`, {
        headers: { 'Authorization': `Bearer ${this.projectManager.token}` }
      });
      
      if (response.ok) {
        this.currentUser = await response.json();
        this.updateUIForLoggedInUser();
      } else {
        this.logout();
      }
    } catch (error) {
      console.error('Error getting user info:', error);
      this.logout();
    }
  },

  updateUIForLoggedInUser: function() {
    // Update sidebar to show cloud save options
    const exportContainer = document.querySelector('#tab-content-export');
    if (exportContainer && this.currentUser) {
      const cloudContainer = document.createElement('div');
      cloudContainer.className = 'cloud-save-container';
      cloudContainer.innerHTML = `
        <h4><i class="fas fa-cloud"></i> Cloud Projects (${this.currentUser.email})</h4>
        <div class="cloud-buttons">
          <button id="save-to-cloud" class="btn btn-primary">
            <i class="fas fa-cloud-upload-alt"></i> Save to Cloud
          </button>
          <button id="load-from-cloud" class="btn btn-secondary">
            <i class="fas fa-cloud-download-alt"></i> My Projects
          </button>
          <button id="cloud-logout" class="btn btn-tertiary">
            <i class="fas fa-sign-out-alt"></i> Logout
          </button>
        </div>
        <div id="project-list" class="project-list"></div>
      `;
      
      exportContainer.insertBefore(cloudContainer, exportContainer.firstChild);
      this.attachCloudEventListeners();
    }
  },

  attachCloudEventListeners: function() {
    document.getElementById('save-to-cloud')?.addEventListener('click', () => this.showSaveDialog());
    document.getElementById('load-from-cloud')?.addEventListener('click', () => this.showLoadDialog());
    document.getElementById('cloud-logout')?.addEventListener('click', () => this.logout());
  },

  async showSaveDialog() {
    const projectName = prompt('Enter project name:');
    if (projectName) {
      try {
        const success = await this.projectManager.saveProject(null, projectName);
        if (success) {
          GeneralHandler.showToast('Project saved to cloud!', 'success');
          this.refreshProjectList();
        } else {
          GeneralHandler.showToast('Failed to save project', 'error');
        }
      } catch (error) {
        console.error('Save error:', error);
        GeneralHandler.showToast('Error saving project', 'error');
      }
    }
  },

  async showLoadDialog() {
    try {
      const projects = await this.projectManager.getUserProjects();
      this.displayProjectList(projects);
    } catch (error) {
      console.error('Load error:', error);
      GeneralHandler.showToast('Error loading projects', 'error');
    }
  },

  displayProjectList: function(projects) {
    const listContainer = document.getElementById('project-list');
    if (!listContainer) return;

    listContainer.innerHTML = projects.map(project => `
      <div class="project-item" data-id="${project.id}">
        <div class="project-thumbnail">
          ${project.thumbnail ? `<img src="${project.thumbnail}" alt="${project.name}">` : '<i class="fas fa-file"></i>'}
        </div>
        <div class="project-info">
          <h5>${project.name}</h5>
          <p>Last modified: ${new Date(project.updated_at).toLocaleDateString()}</p>
        </div>
        <div class="project-actions">
          <button onclick="CloudSaveComponent.loadProject('${project.id}')" class="btn btn-sm">
            <i class="fas fa-download"></i> Load
          </button>
          <button onclick="CloudSaveComponent.deleteProject('${project.id}')" class="btn btn-sm btn-danger">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    `).join('');
  },

  async loadProject(projectId) {
    const confirmed = confirm('Loading this project will replace your current work. Continue?');
    if (confirmed) {
      try {
        const success = await this.projectManager.loadProject(projectId);
        if (success) {
          GeneralHandler.showToast('Project loaded successfully!', 'success');
        } else {
          GeneralHandler.showToast('Failed to load project', 'error');
        }
      } catch (error) {
        console.error('Load error:', error);
        GeneralHandler.showToast('Error loading project', 'error');
      }
    }
  },

  async deleteProject(projectId) {
    const confirmed = confirm('Are you sure you want to delete this project?');
    if (confirmed) {
      try {
        const response = await fetch(`${this.projectManager.baseURL}/projects/${projectId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${this.projectManager.token}` }
        });
        
        if (response.ok) {
          GeneralHandler.showToast('Project deleted', 'success');
          this.refreshProjectList();
        } else {
          GeneralHandler.showToast('Failed to delete project', 'error');
        }
      } catch (error) {
        console.error('Delete error:', error);
        GeneralHandler.showToast('Error deleting project', 'error');
      }
    }
  },

  async refreshProjectList() {
    const projects = await this.projectManager.getUserProjects();
    this.displayProjectList(projects);
  },

  logout: function() {
    localStorage.removeItem('authToken');
    this.currentUser = null;
    this.projectManager.token = null;
    
    // Remove cloud UI elements
    const cloudContainer = document.querySelector('.cloud-save-container');
    if (cloudContainer) {
      cloudContainer.remove();
    }
    
    // Show login form
    this.showLoginForm();
  },

  showLoginForm: function() {
    const exportContainer = document.querySelector('#tab-content-export');
    if (exportContainer) {
      const loginContainer = document.createElement('div');
      loginContainer.className = 'login-container';
      loginContainer.innerHTML = `
        <h4><i class="fas fa-cloud"></i> Cloud Save & Sync</h4>
        <p>Sign in to save your projects to the cloud and access them from anywhere.</p>
        <form id="login-form">
          <input type="email" id="login-email" placeholder="Email" required>
          <input type="password" id="login-password" placeholder="Password" required>
          <button type="submit" class="btn btn-primary">Sign In</button>
          <button type="button" id="show-register" class="btn btn-secondary">Create Account</button>
        </form>
      `;
      
      exportContainer.insertBefore(loginContainer, exportContainer.firstChild);
      
      document.getElementById('login-form').addEventListener('submit', (e) => this.handleLogin(e));
      document.getElementById('show-register').addEventListener('click', () => this.showRegisterForm());
    }
  },

  async handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    try {
      const result = await this.projectManager.login(email, password);
      if (result.success) {
        this.currentUser = result.user;
        document.querySelector('.login-container').remove();
        this.updateUIForLoggedInUser();
        GeneralHandler.showToast('Logged in successfully!', 'success');
      } else {
        GeneralHandler.showToast('Login failed. Check your credentials.', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      GeneralHandler.showToast('Login error occurred', 'error');
    }
  }
};

export { CloudSaveComponent };
