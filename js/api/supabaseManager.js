// Supabase integration for Road Sign Factory
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://your-project.supabase.co'
const supabaseKey = process.env.SUPABASE_ANON_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

// Enhanced ProjectManager with Supabase
class SupabaseProjectManager {
  constructor() {
    this.supabase = supabase;
    this.currentUser = null;
    this.initializeAuth();
  }

  async initializeAuth() {
    // Check for existing session
    const { data: { session } } = await this.supabase.auth.getSession();
    if (session) {
      this.currentUser = session.user;
    }

    // Listen for auth changes
    this.supabase.auth.onAuthStateChange((event, session) => {
      this.currentUser = session?.user || null;
      this.handleAuthChange(event, session);
    });
  }

  handleAuthChange(event, session) {
    if (event === 'SIGNED_IN') {
      console.log('User signed in:', session.user.email);
      // Update UI to show user is logged in
      this.updateUIForLoggedInUser();
    } else if (event === 'SIGNED_OUT') {
      console.log('User signed out');
      // Update UI to show login form
      this.updateUIForLoggedOutUser();
    }
  }

  // Authentication methods
  async signUp(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/design.html`
        }
      });

      if (error) throw error;

      return { success: true, user: data.user, needsVerification: !data.session };
    } catch (error) {
      console.error('Sign up error:', error);
      return { success: false, error: error.message };
    }
  }

  async signIn(email, password) {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { success: true, user: data.user };
    } catch (error) {
      console.error('Sign in error:', error);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Sign out error:', error);
      return { success: false, error: error.message };
    }
  }

  // Project management methods
  async saveProject(projectName, description = '') {
    if (!this.currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      // Get project data from your existing export function
      const projectData = FormExportComponent.exportCanvasToJSON(false);
      const thumbnail = await this.generateThumbnail();

      // Save to Supabase
      const { data, error } = await this.supabase
        .from('projects')
        .insert({
          user_id: this.currentUser.id,
          name: projectName,
          description,
          project_data: projectData,
          thumbnail_url: thumbnail,
          metadata: {
            version: process.env.APP_VERSION || '1.2.2',
            canvas_objects_count: CanvasGlobals.canvasObject.length,
            created_with: 'Road Sign Factory'
          }
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, project: data };
    } catch (error) {
      console.error('Save project error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateProject(projectId, projectName, description = '') {
    if (!this.currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const projectData = FormExportComponent.exportCanvasToJSON(false);
      const thumbnail = await this.generateThumbnail();

      const { data, error } = await this.supabase
        .from('projects')
        .update({
          name: projectName,
          description,
          project_data: projectData,
          thumbnail_url: thumbnail,
          updated_at: new Date().toISOString()
        })
        .eq('id', projectId)
        .eq('user_id', this.currentUser.id) // Ensure user owns the project
        .select()
        .single();

      if (error) throw error;

      return { success: true, project: data };
    } catch (error) {
      console.error('Update project error:', error);
      return { success: false, error: error.message };
    }
  }

  async loadProject(projectId) {
    if (!this.currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', this.currentUser.id)
        .single();

      if (error) throw error;

      // Apply project data to canvas using your existing function
      await FormExportComponent._applyJSONToCanvas(data.project_data);

      return { success: true, project: data };
    } catch (error) {
      console.error('Load project error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserProjects(page = 1, limit = 20) {
    if (!this.currentUser) {
      return { success: false, projects: [] };
    }

    try {
      const offset = (page - 1) * limit;

      const { data, error, count } = await this.supabase
        .from('projects')
        .select('id, name, description, thumbnail_url, created_at, updated_at', { count: 'exact' })
        .eq('user_id', this.currentUser.id)
        .order('updated_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) throw error;

      return {
        success: true,
        projects: data,
        pagination: {
          page,
          limit,
          totalCount: count,
          totalPages: Math.ceil(count / limit),
          hasNext: offset + limit < count,
          hasPrev: page > 1
        }
      };
    } catch (error) {
      console.error('Get projects error:', error);
      return { success: false, projects: [] };
    }
  }

  async deleteProject(projectId) {
    if (!this.currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { error } = await this.supabase
        .from('projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', this.currentUser.id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Delete project error:', error);
      return { success: false, error: error.message };
    }
  }

  async shareProject(projectId, isPublic = true) {
    if (!this.currentUser) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { data, error } = await this.supabase
        .from('projects')
        .update({ 
          is_public: isPublic,
          shared_token: isPublic ? this.generateShareToken() : null
        })
        .eq('id', projectId)
        .eq('user_id', this.currentUser.id)
        .select('shared_token')
        .single();

      if (error) throw error;

      const shareUrl = isPublic 
        ? `${window.location.origin}/design.html?shared=${data.shared_token}`
        : null;

      return { success: true, shareUrl };
    } catch (error) {
      console.error('Share project error:', error);
      return { success: false, error: error.message };
    }
  }

  generateShareToken() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  async generateThumbnail() {
    try {
      const originalState = FormExportComponent.prepareCanvasForExport();
      
      // Create thumbnail canvas
      const thumbnailCanvas = document.createElement('canvas');
      thumbnailCanvas.width = 300;
      thumbnailCanvas.height = 200;
      const ctx = thumbnailCanvas.getContext('2d');
      
      // Fill with white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
      
      // Draw main canvas
      const mainCanvas = CanvasGlobals.canvas.getElement();
      ctx.drawImage(mainCanvas, 0, 0, thumbnailCanvas.width, thumbnailCanvas.height);
      
      FormExportComponent.restoreCanvasAfterExport(originalState);
      
      return thumbnailCanvas.toDataURL('image/jpeg', 0.8);
    } catch (error) {
      console.error('Thumbnail generation error:', error);
      return null;
    }
  }

  // Real-time collaboration (bonus feature!)
  subscribeToProjectChanges(projectId, callback) {
    return this.supabase
      .channel(`project-${projectId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'projects',
        filter: `id=eq.${projectId}`
      }, callback)
      .subscribe();
  }

  updateUIForLoggedInUser() {
    // This will integrate with your existing CloudSave component
    if (window.CloudSave) {
      window.CloudSave.showLoggedInState(this.currentUser);
    }
  }

  updateUIForLoggedOutUser() {
    if (window.CloudSave) {
      window.CloudSave.showLoginState();
    }
  }
}

export { SupabaseProjectManager };
