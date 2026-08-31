/**
 * GeneralSettings - Global configuration for the Road Sign Factory
 * Migrated from legacy sbGeneral.js
 */

export const GeneralSettings = {
  xHeight: 100,
  messageColor: 'white',
  gridColor: '#555',
  gridSize: 20,
  showGrid: true,
  showAllVertices: false,
  showTextBorders: false,
  dimensionUnit: 'mm',
  
  // Helper to update settings
  updateSetting(key, value) {
    this[key] = value;
    console.log(`Setting ${key} updated to ${value}`);
  }
};

/**
 * GeneralUtils - Utility functions for UI and DOM manipulation
 * Ported from GeneralHandler in legacy sbGeneral.js
 * Note: Many DOM-direct methods are replaced by React components, 
 * but these utilities remain for logic-heavy operations.
 */
export const GeneralUtils = {
  // Ported from legacy createNode logic
  // In React, we use JSX, but this can be used for dynamic fabric object creation
  createNodeAttributes: (attributes) => {
    return Object.entries(attributes).reduce((acc, [key, value]) => {
      acc[key] = value;
      return acc;
    }, {});
  },

  // Ported from legacy i18n logic
  t: (key) => {
    // This should eventually connect to a real i18n library like next-intl
    return key; 
  }
};
