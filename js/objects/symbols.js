/**
 * symbols.js - Functions for handling symbols in traffic sign drawings
 * Uses path.js for all path-related functionality
 */

import { BaseGroup, GlyphPath } from './draw.js';
import { symbolsTemplate, symbolsTemplateAlt } from './template.js';
import { calculateTransformedPoints } from './path.js';
import { FormDrawAddComponent } from '../sidebar/sb-draw.js';


function calcSymbol(type, length, color = 'white') {
  let symbol;
  if (typeof type === 'string') {
    const symbolsT = JSON.parse(JSON.stringify((color.toLocaleLowerCase() == 'black' && Object.keys(symbolsTemplateAlt).includes(type)) ? symbolsTemplateAlt : symbolsTemplate)); // Deep copy to avoid mutation
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
    if (path.centerLine) {
      path.centerLine.forEach(vertex => {
        vertex.x *= length;
        vertex.y *= length;
        if (vertex.radius) vertex.radius *= length;
      });
    }
    if (path.centerArc) {
      path.centerArc.forEach(arc => {
        arc.radius *= length;
        if (arc.radius2) { arc.radius2 *= length; }
      });
    }
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
  constructor(shapeMeta = {}) {
    super(null, 'Symbol', 'SymbolObject', shapeMeta ); // Call BaseGroup constructor

    // Store shapeMeta properties
    this.symbolType = shapeMeta.symbolType;
    this.xHeight = shapeMeta.xHeight || 100;
    this.color = shapeMeta.color || 'White';
    this.symbolAngle = shapeMeta.symbolAngle || 0;
    this.left = shapeMeta.left || 0;
    this.top = shapeMeta.top || 0;

    this.initialize();

    // When this symbol is deselected, clear it from FormDrawAddComponent if it was active
    this.on('deselected', () => {
      if (FormDrawAddComponent.editingExistingSymbol === this) {
        FormDrawAddComponent.editingExistingSymbol = null;
        FormDrawAddComponent.hideAngleControls();
      }
    });
  }

  initialize() {

    // Set the basePolygon
    this.setBasePolygon(this.drawSymbol());

    return this;
  }

  /**
   * Handle double-click on the symbol object
   */
  onDoubleClick() {
    // If already defined, initialize directly
    FormDrawAddComponent.drawPanelInit(null, this);

  }

  /**
   * LEGACY Update symbol properties and visuals
   */
  updateSymbol(options) {
    // Store the new properties
        // Store shapeMeta properties
    this.symbolType = options.symbolType;
    this.xHeight = options.xHeight || 100;
    this.color = options.color || 'White';
    this.symbolAngle = options.angle || 0;
    this.left = options.x || 0;
    this.top = options.y || 0;
    
    // Initialize the new path with transformed coordinates and replace the current one
    this.replaceBasePolygon(this.drawSymbol());

    // Update the group's angle if necessary, though typically handled by rotating vertices
    // this.set('angle', this.symbolAngle); 

    this.showDimensions();
  }

  drawSymbol() {
    // Calculate symbol data
    const symbolData = calcSymbol(this.symbolType, this.xHeight / 4, this.color);

    // Create symbol options
    const symbolOptions = {
      left: this.left,
      top: this.top,
      fill: this.color.toLowerCase() === 'white' ? '#ffffff' : '#000000',
      angle: 0, // Angle is applied to vertices, not the fabric object initially
      objectCaching: false,
      strokeWidth: 0
    };

    // Apply the rotation transform to vertex coordinates before creating the path
    symbolData.path.forEach(p => {
      p.vertex = calculateTransformedPoints(p.vertex, {
        x: 0,
        y: 0,
        angle: this.symbolAngle
      });
    });

    // Create the GlyphPath for the symbol
    const symbolPath = new GlyphPath(symbolOptions);
    symbolPath.initialize(symbolData, symbolOptions);
    symbolPath.symbol = this.symbolType; // Keep track of the symbol type

    return symbolPath;
  }
}

/**
 * Legacy function to draw a symbol directly on the canvas.
 * Creates a symbol directly on the canvas.
 * @param {string} symbolType - Type of symbol to create
 * @param {Object} options - Configuration options: x, y, xHeight, angle, color
 * @return {SymbolObject} The created symbol object
 */
function drawSymbolDirectly(symbolType, options) {
  const shapeMeta = {
    symbolType: symbolType,
    xHeight: options.xHeight,
    color: options.color,
    symbolAngle: options.angle || 0,
    x: options.x || 0,
    y: options.y || 0
  };

  const symbolGroup = new SymbolObject(shapeMeta);
  return symbolGroup.initialize();
}


export {
  SymbolObject,
  drawSymbolDirectly,
  calcSymbol
};