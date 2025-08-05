/**
 * HintLoader - Utility for loading hint content from standalone HTML files
 */
export class HintLoader {
  static cache = new Map(); // Cache loaded hints
  static loadingPromises = new Map(); // Track ongoing loads
  static cssLoaded = false; // Track if CSS has been loaded
  static cssLoadPromise = null; // Track CSS loading promise
  static buttonHintMap = new Map(); // Map button names to hint paths
  
  /**
   * Load hint content from a file
   * @param {string} hintPath - Path to the hint file (e.g., 'symbols/Airport') or button name
   * @return {Promise<string>} Promise that resolves to the hint HTML content
   */
  static async loadHint(hintPath) {
    // Resolve button name to actual hint path if mapping exists
    const resolvedPath = this.resolveHintPath(hintPath);
    
    // Ensure CSS is loaded first
    await this.ensureCSSLoaded();
    
    // Check cache first
    if (this.cache.has(resolvedPath)) {
      return this.cache.get(resolvedPath);
    }
    
    // Check if already loading
    if (this.loadingPromises.has(resolvedPath)) {
      return this.loadingPromises.get(resolvedPath);
    }
    
    // Start loading
    const loadPromise = this._fetchHint(resolvedPath);
    this.loadingPromises.set(resolvedPath, loadPromise);
    
    try {
      const content = await loadPromise;
      this.cache.set(resolvedPath, content);
      this.loadingPromises.delete(resolvedPath);
      return content;
    } catch (error) {
      this.loadingPromises.delete(resolvedPath);
      throw error;
    }
  }
  
  /**
   * Resolve button name to hint path using mapping
   * @param {string} buttonNameOrPath - Button name or direct hint path
   * @return {string} Resolved hint path
   */
  static resolveHintPath(buttonNameOrPath) {
    // Check if it's a mapped button name
    if (this.buttonHintMap.has(buttonNameOrPath)) {
      return this.buttonHintMap.get(buttonNameOrPath);
    }
    // Return original path if no mapping found
    return buttonNameOrPath;
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
      buttonMappings: this.buttonHintMap.size,
      entries: Array.from(this.cache.keys()),
      mappings: Object.fromEntries(this.buttonHintMap)
    };
  }

  /**
   * Set multiple button hint mappings
   * @param {Object} mappings - Object with button names as keys and hint paths as values
   */
  static setButtonHintMappings(mappings) {
    Object.entries(mappings).forEach(([buttonName, hintPath]) => {
      this.buttonHintMap.set(buttonName, hintPath);
    });
  }

  /**
   * Add a single button hint mapping
   * @param {string} buttonName - The button name or ID
   * @param {string} hintPath - The hint file path
   */
  static addButtonHintMapping(buttonName, hintPath) {
    this.buttonHintMap.set(buttonName, hintPath);
  }

  /**
   * Check if a button hint mapping exists
   * @param {string} buttonName - The button name to check
   * @return {boolean} True if mapping exists
   */
  static hasButtonHintMapping(buttonName) {
    return this.buttonHintMap.has(buttonName);
  }

  /**
   * Get all button hint mappings
   * @return {Object} Object with all button mappings
   */
  static getButtonHintMappings() {
    return Object.fromEntries(this.buttonHintMap);
  }

  /**
   * Remove a button hint mapping
   * @param {string} buttonName - The button name to remove
   * @return {boolean} True if mapping was removed
   */
  static removeButtonHintMapping(buttonName) {
    return this.buttonHintMap.delete(buttonName);
  }

  /**
   * Clear all button hint mappings
   */
  static clearButtonHintMappings() {
    this.buttonHintMap.clear();
  }

  /**
   * Auto-setup button hint mappings by scanning button elements in the DOM
   * @param {string} buttonSelector - CSS selector for buttons (default: 'button[id^="button-"]')
   * @param {string} hintPathPrefix - Prefix for hint paths (default: 'symbols/')
   */
  static autoSetupButtonMappings(buttonSelector = 'button[id^="button-"]', hintPathPrefix = 'symbols/') {
    const buttons = document.querySelectorAll(buttonSelector);
    buttons.forEach(button => {
      if (button.id && button.id.startsWith('button-')) {
        // Extract the symbol name from button ID (e.g., 'button-Airport' -> 'Airport')
        const symbolName = button.id.replace('button-', '');
        const hintPath = `${hintPathPrefix}${symbolName}`;
        this.addButtonHintMapping(button.id, hintPath);
      }
    });
    
    console.log(`Auto-setup completed: ${this.buttonHintMap.size} button mappings created`);
  }
}
