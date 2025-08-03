/**
 * HintLoader - Utility for loading hint content from standalone HTML files
 */
export class HintLoader {
  static cache = new Map(); // Cache loaded hints
  static loadingPromises = new Map(); // Track ongoing loads
  
  /**
   * Load hint content from a file
   * @param {string} hintPath - Path to the hint file (e.g., 'symbols/Airport')
   * @return {Promise<string>} Promise that resolves to the hint HTML content
   */
  static async loadHint(hintPath) {
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
      
      const content = await response.text();
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
    const promises = hintPaths.map(path => this.loadHint(path));
    await Promise.allSettled(promises); // Use allSettled to not fail if some hints are missing
  }
  
  /**
   * Clear the cache (useful for development/testing)
   */
  static clearCache() {
    this.cache.clear();
    this.loadingPromises.clear();
  }
  
  /**
   * Get cache statistics
   * @return {Object} Cache statistics
   */
  static getCacheStats() {
    return {
      cached: this.cache.size,
      loading: this.loadingPromises.size,
      entries: Array.from(this.cache.keys())
    };
  }
}
