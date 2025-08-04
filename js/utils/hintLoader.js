/**
 * HintLoader - Utility for loading hint content from standalone HTML files
 */
export class HintLoader {
  static cache = new Map(); // Cache loaded hints
  static loadingPromises = new Map(); // Track ongoing loads
  static cssLoaded = false; // Track if CSS has been loaded
  static cssLoadPromise = null; // Track CSS loading promise
  
  /**
   * Load hint content from a file
   * @param {string} hintPath - Path to the hint file (e.g., 'symbols/Airport')
   * @return {Promise<string>} Promise that resolves to the hint HTML content
   */
  static async loadHint(hintPath) {
    // Ensure CSS is loaded first
    await this.ensureCSSLoaded();
    
    // Check cache first
    if (this.cache.has(hintPath)) {
      return this.cache.get(hintPath);
    }
    
    // Check if already loading
    if (this.loadingPromises.has(hintPath)) {
      return this.loadingPromises.get(hintPath);
    }
    
    // Start loading
    const loadPromise = this._fetchHint(hintPath);
    this.loadingPromises.set(hintPath, loadPromise);
    
    try {
      const content = await loadPromise;
      this.cache.set(hintPath, content);
      this.loadingPromises.delete(hintPath);
      return content;
    } catch (error) {
      this.loadingPromises.delete(hintPath);
      throw error;
    }
  }
  
  /**
   * Ensure hints CSS is loaded
   * @return {Promise<void>}
   */
  static async ensureCSSLoaded() {
    if (this.cssLoaded) {
      return;
    }
    
    if (this.cssLoadPromise) {
      return this.cssLoadPromise;
    }
    
    this.cssLoadPromise = this._loadCSS();
    await this.cssLoadPromise;
  }
  
  /**
   * Load the hints CSS file
   * @private
   * @return {Promise<void>}
   */
  static async _loadCSS() {
    return new Promise((resolve, reject) => {
      // Check if CSS is already loaded
      const existingLink = document.querySelector('link[href*="hints/hints.css"]');
      if (existingLink) {
        this.cssLoaded = true;
        resolve();
        return;
      }
      
      // Create and load CSS link
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = 'hints/hints.css';
      
      link.onload = () => {
        this.cssLoaded = true;
        console.log('Hints CSS loaded successfully');
        resolve();
      };
      
      link.onerror = (error) => {
        console.warn('Failed to load hints CSS:', error);
        // Don't reject - allow hints to work without CSS
        this.cssLoaded = true;
        resolve();
      };
      
      document.head.appendChild(link);
    });
  }
  
  /**
   * Internal method to fetch hint content
   * @private
   */
  static async _fetchHint(hintPath) {
    const url = `hints/${hintPath}.html`;
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to load hint: ${response.status} ${response.statusText}`);
      }
      
      let content = await response.text();
      
      // Remove the CSS link from the content since we load it separately
      content = content.replace(/<link[^>]*href[^>]*hints\.css[^>]*>/gi, '');
      
      return content.trim();
    } catch (error) {
      console.warn(`Failed to load hint from ${url}:`, error);
      return null; // Return null for missing hints rather than throwing
    }
  }
  
  /**
   * Preload multiple hints
   * @param {string[]} hintPaths - Array of hint paths to preload
   * @return {Promise<void>}
   */
  static async preloadHints(hintPaths) {
    // Ensure CSS is loaded first
    await this.ensureCSSLoaded();
    
    const promises = hintPaths.map(path => this.loadHint(path));
    await Promise.allSettled(promises); // Use allSettled to not fail if some hints are missing
  }
  
  /**
   * Clear the cache (useful for development/testing)
   */
  static clearCache() {
    this.cache.clear();
    this.loadingPromises.clear();
    // Note: We don't reset cssLoaded to avoid reloading CSS unnecessarily
  }
  
  /**
   * Force reload CSS (useful for development)
   */
  static reloadCSS() {
    this.cssLoaded = false;
    this.cssLoadPromise = null;
    // Remove existing CSS link
    const existingLink = document.querySelector('link[href*="hints/hints.css"]');
    if (existingLink) {
      existingLink.remove();
    }
  }
  
  /**
   * Get cache statistics
   * @return {Object} Cache statistics
   */
  static getCacheStats() {
    return {
      cached: this.cache.size,
      loading: this.loadingPromises.size,
      cssLoaded: this.cssLoaded,
      entries: Array.from(this.cache.keys())
    };
  }
}
