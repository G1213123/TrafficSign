/**
 * symbols.js - Functions for handling symbols in traffic sign drawings
 * Uses path.js for all path-related functionality
 */

import { BaseGroup, GlyphPath } from './draw.js';
import  {symbolsTemplate, symbolsTemplateAlt} from './template.js';
import { calculateTransformedPoints } from './path.js';


function calcSymbol(type, length, color = 'white') {
  let symbol;
  if (typeof type === 'string') {
    const symbolsT = JSON.parse(JSON.stringify((color == 'Black' && (type.includes('Hospital') || type.includes('Route'))) ? symbolsTemplateAlt : symbolsTemplate)); // Deep copy to avoid mutation
    const backup = JSON.parse(JSON.stringify(symbolsTemplate));
    symbol = symbolsT[type] || backup[type];
  } else {
    symbol = JSON.parse(JSON.stringify(type));
  }

  symbol.path.forEach(path => {
    path.vertex.forEach(vertex => {
      vertex.x *= length;
      vertex.y *= length;
      if (vertex.radius) vertex.radius *= length;
    });
    path.arcs.forEach(arc => {
      arc.radius *= length;
      if (arc.radius2) { arc.radius2 *= length; }
    });
  });

  if (symbol.text) {
    symbol.text.forEach(t => {
      t.x *= length;
      t.y *= length;
      t.fontSize *= length;
    });
  }

  return symbol;
}

/**
 * SymbolObject extends BaseGroup to create symbols with editing functionality
 */
class SymbolObject extends BaseGroup {
  constructor(symbolType, options = {}) {
    // Store symbol properties before creating the base group
    const symbolProperties = {
      symbol: symbolType,
      xHeight: options.length || (options.xHeight || 100),
      color: options.color || 'White',
      symbolAngle: options.angle || 0,
    };

    // Call the BaseGroup constructor with the symbol path
    super(null, 'Symbol');
    
    // Apply stored symbol properties
    Object.assign(this, symbolProperties);

    // Add double-click event handler
    this.on('mousedblclick', this.onDoubleClick.bind(this));
  }

  initialize(symbolPath) {
    symbolPath.symbol = this.symbol;
    // Set the basePolygon that was initially null in the constructor
    this.setBasePolygon(symbolPath);
    return this;
  }

  /**
   * Handle double-click on the symbol object
   */
  onDoubleClick() {
    // Check if FormDrawAddComponent is defined
    if (typeof FormDrawAddComponent === 'undefined') {
      // If not defined, load the draw module first
      if (typeof SidebarHelpers !== 'undefined' && SidebarHelpers.loadDrawModule) {
        SidebarHelpers.loadDrawModule().then(() => {
          // Once the module is loaded, initialize the panel for editing this symbol
          FormDrawAddComponent.drawPanelInit(null, this);
        });
      } else {
        console.error('SidebarHelpers not defined or loadDrawModule not available');
      }
    } else {
      // If already defined, initialize directly
      FormDrawAddComponent.drawPanelInit(null, this);
    }
  }
  
  /**
   * Update symbol properties and visuals
   */
  updateSymbol(symbolType, length, color, angle) {
    // Create new symbol data
    const symbolData = calcSymbol(symbolType, length / 4, color);
    
    // Store the new properties
    this.symbol = symbolType;
    this.xHeight = length; // Convert back to xHeight
    this.color = color;
    this.symbolAngle = angle;
    
    // Create symbol options - keep angle at 0 for the actual path object
    const symbolOptions = {
      left: this.left,
      top: this.top,
      fill: color,
      objectCaching: false,
      strokeWidth: 0,
      angle: 0
    };

    // Create a new GlyphPath for the symbol
    const symbolPath = new GlyphPath();
    symbolPath.initialize(symbolData, symbolOptions);
    
    // Apply the rotation transform to vertex coordinates before creating the path
    symbolData.path.forEach(p => {
      p.vertex = calculateTransformedPoints(p.vertex, {
        x: 0, 
        y: 0, 
        angle: angle
      });
    });
    
    // Initialize the new path with transformed coordinates and replace the current one
    this.replaceBasePolygon(symbolPath);

    this.showDimensions();
  }
}

/**
 * Creates a symbol directly on the canvas without using cursor intermediary
 * @param {string} symbolType - Type of symbol to create
 * @param {Object} options - Configuration options: x, y, xHeight, angle, color
 * @return {Object} The created symbol object
 */
function drawSymbolDirectly(symbolType, options) {
  // Calculate symbol data
  const symbolData = calcSymbol(symbolType, options.xHeight / 4, options.color);

  // Create symbol options
  const symbolOptions = {
    left: options.x || 0,
    top: options.y || 0,
    fill: options.color.toLowerCase() === 'white' ? '#ffffff' : '#000000',
    angle: 0,
    objectCaching: false,
    strokeWidth: 0
  };

  // Separate the angle handling from the symbol path creation
  symbolData.path.forEach(p => {
    p.vertex = calculateTransformedPoints(p.vertex, {
      x: 0,
      y: 0,
      angle: options.angle || 0
    });
  });

  // Create the GlyphPath for the symbol
  const symbolPath = new GlyphPath(symbolOptions);
  symbolPath.initialize(symbolData, symbolOptions);

  // Create the SymbolObject with all original parameters, but the actual path
  // has pre-rotated vertices instead of a rotation transform
  const symbolGroup = new SymbolObject(symbolType, options);
  symbolGroup.initialize(symbolPath);

  symbolGroup.set({
    symbolAngle: options.angle || 0,
    strokeWidth: 0,
  });

  return symbolGroup;
}

// Update the drawLabeledSymbol function to use drawSymbolDirectly
function drawLabeledSymbol(symbolType, options) {
  return drawSymbolDirectly(symbolType, options);
}

export {
  SymbolObject,
  drawSymbolDirectly,
  drawLabeledSymbol,
  calcSymbol
};